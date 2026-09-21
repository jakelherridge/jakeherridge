import Foundation
import Observation

/// Keeps the phone cool. Watches iOS's thermal state and Low Power Mode
/// and steps the app down (render scale, frame rate, detection cadence)
/// before the system has to throttle it, then steps back up when it cools.
@Observable @MainActor
final class PerformanceGovernor {

    enum Tier: Int, Comparable {
        case full = 0
        case eased = 1
        case cool = 2

        static func < (lhs: Tier, rhs: Tier) -> Bool { lhs.rawValue < rhs.rawValue }

        /// Fraction of native resolution the eye renders at.
        var renderScale: CGFloat {
            switch self {
            case .full: return 0.75
            case .eased: return 0.6
            case .cool: return 0.5
            }
        }

        var frameRate: Int {
            self == .full ? 60 : 30
        }

        var objectInterval: TimeInterval {
            switch self {
            case .full: return 0.12
            case .eased: return 0.2
            case .cool: return 0.33
            }
        }

        var handInterval: TimeInterval {
            switch self {
            case .full: return 0.066
            case .eased: return 0.1
            case .cool: return 0.15
            }
        }

        var label: String {
            switch self {
            case .full: return "full send"
            case .eased: return "easing off"
            case .cool: return "cooling down"
            }
        }
    }

    private(set) var tier: Tier = .full

    var renderScale: CGFloat { tier.renderScale }
    var frameRate: Int { tier.frameRate }

    /// Called on the main actor whenever the tier changes.
    var onChange: ((Tier) -> Void)?

    private var observers: [NSObjectProtocol] = []

    init() {
        evaluate()
        let center = NotificationCenter.default
        for name in [ProcessInfo.thermalStateDidChangeNotification, Notification.Name.NSProcessInfoPowerStateDidChange] {
            let token = center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                MainActor.assumeIsolated {
                    self?.evaluate()
                }
            }
            observers.append(token)
        }
    }

    func evaluate() {
        let info = ProcessInfo.processInfo
        var next: Tier
        switch info.thermalState {
        case .nominal, .fair: next = .full
        case .serious: next = .eased
        case .critical: next = .cool
        @unknown default: next = .eased
        }
        if info.isLowPowerModeEnabled {
            next = max(next, .eased)
        }
        guard next != tier else { return }
        tier = next
        onChange?(next)
    }
}
