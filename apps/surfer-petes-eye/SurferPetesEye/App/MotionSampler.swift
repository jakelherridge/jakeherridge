import CoreMotion
import Foundation

/// Turns device motion into one 0..1 number. Pete's world sloshes when you
/// move the phone.
final class MotionSampler {
    private let manager = CMMotionManager()
    private var smoothed: Double = 0

    /// Delivered on the main queue.
    var onEnergy: ((Double) -> Void)?

    func start() {
        guard manager.isDeviceMotionAvailable, !manager.isDeviceMotionActive else { return }
        manager.deviceMotionUpdateInterval = 1.0 / 30.0
        manager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
            guard let self, let motion else { return }
            let a = motion.userAcceleration
            let r = motion.rotationRate
            let accel = (a.x * a.x + a.y * a.y + a.z * a.z).squareRoot()
            let spin = abs(r.x) + abs(r.y) + abs(r.z)
            let raw = min(1.0, accel * 2.5 + spin * 0.15)
            self.smoothed = self.smoothed * 0.85 + raw * 0.15
            self.onEnergy?(self.smoothed)
        }
    }

    func stop() {
        manager.stopDeviceMotionUpdates()
    }
}
