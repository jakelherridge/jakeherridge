import XCTest
@testable import SurferPetesEye

/// Synthetic hands in Vision space (normalized, origin bottom-left). The
/// wrist sits at the bottom, fingers point up. Scale (wrist to middle MCP)
/// is 0.25, so every threshold in the classifier is easy to reason about.
final class HandGestureClassifierTests: XCTestCase {

    private enum Finger: CaseIterable {
        case index, middle, ring, little

        var x: CGFloat {
            switch self {
            case .index: return 0.42
            case .middle: return 0.50
            case .ring: return 0.58
            case .little: return 0.66
            }
        }

        var joints: (mcp: HandJoint, pip: HandJoint, dip: HandJoint, tip: HandJoint) {
            switch self {
            case .index: return (.indexMCP, .indexPIP, .indexDIP, .indexTip)
            case .middle: return (.middleMCP, .middlePIP, .middleDIP, .middleTip)
            case .ring: return (.ringMCP, .ringPIP, .ringDIP, .ringTip)
            case .little: return (.littleMCP, .littlePIP, .littleDIP, .littleTip)
            }
        }
    }

    private func makePose(extended: Set<Finger>,
                          thumbOut: Bool,
                          overrides: [HandJoint: CGPoint] = [:]) -> HandPose {
        var joints: [HandJoint: CGPoint] = [.wrist: CGPoint(x: 0.5, y: 0.1)]

        for finger in Finger.allCases {
            let j = finger.joints
            joints[j.mcp] = CGPoint(x: finger.x, y: 0.35)
            if extended.contains(finger) {
                joints[j.pip] = CGPoint(x: finger.x, y: 0.45)
                joints[j.dip] = CGPoint(x: finger.x, y: 0.52)
                joints[j.tip] = CGPoint(x: finger.x, y: 0.60)
            } else {
                joints[j.pip] = CGPoint(x: finger.x, y: 0.42)
                joints[j.dip] = CGPoint(x: finger.x, y: 0.40)
                joints[j.tip] = CGPoint(x: finger.x, y: 0.36)
            }
        }

        joints[.thumbCMC] = CGPoint(x: 0.42, y: 0.18)
        joints[.thumbMP] = CGPoint(x: 0.34, y: 0.26)
        joints[.thumbIP] = CGPoint(x: 0.28, y: 0.32)
        joints[.thumbTip] = thumbOut ? CGPoint(x: 0.22, y: 0.38) : CGPoint(x: 0.40, y: 0.30)

        for (joint, point) in overrides {
            joints[joint] = point
        }
        return HandPose(joints: joints, side: .right)
    }

    func testOpenPalm() {
        let pose = makePose(extended: [.index, .middle, .ring, .little], thumbOut: true)
        XCTAssertEqual(HandGestureClassifier.classify(pose), .openPalm)
    }

    func testShaka() {
        let pose = makePose(extended: [.little], thumbOut: true)
        XCTAssertEqual(HandGestureClassifier.classify(pose), .shaka)
    }

    func testPeace() {
        let pose = makePose(extended: [.index, .middle], thumbOut: false)
        XCTAssertEqual(HandGestureClassifier.classify(pose), .peace)
    }

    func testCrabPinch() {
        // Index reaches out and meets the thumb; the other three curl in.
        let pose = makePose(extended: [.index], thumbOut: true, overrides: [
            .thumbTip: CGPoint(x: 0.40, y: 0.58),
            .indexTip: CGPoint(x: 0.44, y: 0.60),
        ])
        XCTAssertEqual(HandGestureClassifier.classify(pose), .crabPinch)
    }

    func testFistIsNothing() {
        let pose = makePose(extended: [], thumbOut: false, overrides: [
            .indexTip: CGPoint(x: 0.42, y: 0.34),
        ])
        XCTAssertNil(HandGestureClassifier.classify(pose))
    }

    func testMissingWristIsNothing() {
        var pose = makePose(extended: [.index, .middle, .ring, .little], thumbOut: true)
        pose.joints[.wrist] = nil
        XCTAssertNil(HandGestureClassifier.classify(pose))
    }

    func testPinchPointIsBetweenThumbAndIndex() {
        let pose = makePose(extended: [.index], thumbOut: true, overrides: [
            .thumbTip: CGPoint(x: 0.40, y: 0.58),
            .indexTip: CGPoint(x: 0.44, y: 0.60),
        ])
        let point = HandGestureClassifier.pinchPoint(pose)
        XCTAssertEqual(point?.x ?? 0, 0.42, accuracy: 1e-9)
        XCTAssertEqual(point?.y ?? 0, 0.59, accuracy: 1e-9)
    }
}
