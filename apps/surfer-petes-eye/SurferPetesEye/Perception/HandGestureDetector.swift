import CoreGraphics
import CoreVideo
import Foundation
import Vision

/// The 21 hand joints Vision reports, kept free of Vision types so the
/// classifier can be unit tested with made-up hands.
enum HandJoint: CaseIterable {
    case wrist
    case thumbCMC, thumbMP, thumbIP, thumbTip
    case indexMCP, indexPIP, indexDIP, indexTip
    case middleMCP, middlePIP, middleDIP, middleTip
    case ringMCP, ringPIP, ringDIP, ringTip
    case littleMCP, littlePIP, littleDIP, littleTip

    init?(visionName: VNHumanHandPoseObservation.JointName) {
        switch visionName {
        case .wrist: self = .wrist
        case .thumbCMC: self = .thumbCMC
        case .thumbMP: self = .thumbMP
        case .thumbIP: self = .thumbIP
        case .thumbTip: self = .thumbTip
        case .indexMCP: self = .indexMCP
        case .indexPIP: self = .indexPIP
        case .indexDIP: self = .indexDIP
        case .indexTip: self = .indexTip
        case .middleMCP: self = .middleMCP
        case .middlePIP: self = .middlePIP
        case .middleDIP: self = .middleDIP
        case .middleTip: self = .middleTip
        case .ringMCP: self = .ringMCP
        case .ringPIP: self = .ringPIP
        case .ringDIP: self = .ringDIP
        case .ringTip: self = .ringTip
        case .littleMCP: self = .littleMCP
        case .littlePIP: self = .littlePIP
        case .littleDIP: self = .littleDIP
        case .littleTip: self = .littleTip
        default: return nil
        }
    }
}

/// Joint positions in Vision space (normalized, origin bottom-left).
struct HandPose: Equatable {
    var joints: [HandJoint: CGPoint]
    var side: HandSide

    subscript(_ joint: HandJoint) -> CGPoint? { joints[joint] }

    var bounds: CGRect? {
        guard !joints.isEmpty else { return nil }
        let xs = joints.values.map(\.x)
        let ys = joints.values.map(\.y)
        return CGRect(x: xs.min()!, y: ys.min()!, width: xs.max()! - xs.min()!, height: ys.max()! - ys.min()!)
    }
}

/// Pure geometry. Decides what a hand is doing from joint distances alone,
/// so it works at any scale and any rotation.
enum HandGestureClassifier {

    private static func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        hypot(a.x - b.x, a.y - b.y)
    }

    static func classify(_ pose: HandPose) -> Gesture? {
        guard let wrist = pose[.wrist], let middleMCP = pose[.middleMCP] else { return nil }
        let scale = distance(wrist, middleMCP)
        guard scale > 0.001 else { return nil }

        func extended(_ pip: HandJoint, _ tip: HandJoint) -> Bool {
            guard let p = pose[pip], let t = pose[tip] else { return false }
            return distance(t, wrist) > distance(p, wrist) + 0.2 * scale
        }

        func curled(_ pip: HandJoint, _ tip: HandJoint) -> Bool {
            guard let p = pose[pip], let t = pose[tip] else { return false }
            return distance(t, wrist) < distance(p, wrist)
        }

        let indexOut = extended(.indexPIP, .indexTip)
        let middleOut = extended(.middlePIP, .middleTip)
        let ringOut = extended(.ringPIP, .ringTip)
        let littleOut = extended(.littlePIP, .littleTip)
        let indexIn = curled(.indexPIP, .indexTip)
        let middleIn = curled(.middlePIP, .middleTip)
        let ringIn = curled(.ringPIP, .ringTip)
        let littleIn = curled(.littlePIP, .littleTip)

        var thumbOut = false
        if let thumbTip = pose[.thumbTip], let thumbIP = pose[.thumbIP], let indexMCP = pose[.indexMCP] {
            thumbOut = distance(thumbTip, wrist) > distance(thumbIP, wrist) + 0.1 * scale
                && distance(thumbTip, indexMCP) > 0.6 * scale
        }

        var pinch = CGFloat.greatestFiniteMagnitude
        var indexReach: CGFloat = 0
        if let thumbTip = pose[.thumbTip], let indexTip = pose[.indexTip] {
            pinch = distance(thumbTip, indexTip)
            indexReach = distance(indexTip, wrist)
        }

        // Order matters. Shaka and peace are unmistakable, so they go first.
        if thumbOut && littleOut && indexIn && middleIn && ringIn {
            return .shaka
        }
        if indexOut && middleOut && ringIn && littleIn {
            return .peace
        }
        if pinch < 0.6 * scale && indexReach > 1.15 * scale && middleIn && ringIn && littleIn {
            return .crabPinch
        }
        if indexOut && middleOut && ringOut && littleOut && pinch > 0.5 * scale {
            return .openPalm
        }
        return nil
    }

    /// Midpoint of thumb tip and index tip, in the pose's own space.
    static func pinchPoint(_ pose: HandPose) -> CGPoint? {
        guard let thumb = pose[.thumbTip], let index = pose[.indexTip] else { return nil }
        return CGPoint(x: (thumb.x + index.x) / 2, y: (thumb.y + index.y) / 2)
    }
}

/// Runs Vision's hand pose request and converts the result to `FrameHand`.
final class HandGestureDetector {
    private let request: VNDetectHumanHandPoseRequest = {
        let request = VNDetectHumanHandPoseRequest()
        request.maximumHandCount = 2
        return request
    }()
    private let minimumJointConfidence: Float = 0.3

    func poses(in pixelBuffer: CVPixelBuffer) -> [HandPose] {
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
        guard (try? handler.perform([request])) != nil, let observations = request.results else { return [] }
        return observations.compactMap { observation in
            guard let points = try? observation.recognizedPoints(.all) else { return nil }
            var joints: [HandJoint: CGPoint] = [:]
            for (name, point) in points where point.confidence >= minimumJointConfidence {
                if let joint = HandJoint(visionName: name) {
                    joints[joint] = point.location
                }
            }
            guard joints.count >= 12 else { return nil }
            let side: HandSide
            switch observation.chirality {
            case .left: side = .left
            case .right: side = .right
            default: side = .unknown
            }
            return HandPose(joints: joints, side: side)
        }
    }

    func detect(in pixelBuffer: CVPixelBuffer) -> [FrameHand] {
        poses(in: pixelBuffer).compactMap { pose in
            guard let bounds = pose.bounds else { return nil }
            let pinch = HandGestureClassifier.pinchPoint(pose) ?? CGPoint(x: bounds.midX, y: bounds.midY)
            return FrameHand(side: pose.side,
                             gesture: HandGestureClassifier.classify(pose),
                             bounds: FrameGeometry.frameRect(fromVision: bounds),
                             pinchPoint: FrameGeometry.framePoint(fromVision: pinch))
        }
    }
}
