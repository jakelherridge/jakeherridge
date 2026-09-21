import XCTest
@testable import SurferPetesEye

final class FrameOrientationTests: XCTestCase {

    func testPortraitCamerasSwapAxes() {
        let landscape = CGSize(width: 1280, height: 720)
        XCTAssertEqual(FrameOrientation.backPortrait.uprightSize(forBufferSize: landscape), CGSize(width: 720, height: 1280))
        XCTAssertEqual(FrameOrientation.frontPortrait.uprightSize(forBufferSize: landscape), CGSize(width: 720, height: 1280))
        XCTAssertEqual(FrameOrientation.upright.uprightSize(forBufferSize: landscape), landscape)
    }

    func testVisionIsToldWhichWayIsUp() {
        XCTAssertEqual(FrameOrientation.backPortrait.visionOrientation, .right)
        XCTAssertEqual(FrameOrientation.frontPortrait.visionOrientation, .leftMirrored)
        XCTAssertEqual(FrameOrientation.upright.visionOrientation, .up)
    }

    func testCameraPositionPicksOrientation() {
        XCTAssertEqual(FrameOrientation.forCamera(position: .back), .backPortrait)
        XCTAssertEqual(FrameOrientation.forCamera(position: .front), .frontPortrait)
        XCTAssertEqual(FrameOrientation.forCamera(position: .unspecified), .backPortrait)
    }

    /// The shader switches on these numbers (PETE_FRAME_* in ShaderTypes.h).
    func testRawValuesMatchTheShaderConstants() {
        XCTAssertEqual(FrameOrientation.upright.rawValue, 0)
        XCTAssertEqual(FrameOrientation.backPortrait.rawValue, 1)
        XCTAssertEqual(FrameOrientation.frontPortrait.rawValue, 2)
    }
}
