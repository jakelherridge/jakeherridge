import XCTest
@testable import SurferPetesEye

final class FrameGeometryTests: XCTestCase {

    // A portrait 1080x1920 frame on a 390x844 screen. The frame is a bit
    // wider than the screen, so the sides get cropped.
    private let geometry = FrameGeometry(textureSize: CGSize(width: 1080, height: 1920),
                                         viewSize: CGSize(width: 390, height: 844))

    func testVisionRectFlipsVertically() {
        let frame = FrameGeometry.frameRect(fromVision: CGRect(x: 0.1, y: 0.1, width: 0.2, height: 0.3))
        XCTAssertEqual(frame.minX, 0.1, accuracy: 1e-9)
        XCTAssertEqual(frame.minY, 0.6, accuracy: 1e-9)
        XCTAssertEqual(frame.width, 0.2, accuracy: 1e-9)
        XCTAssertEqual(frame.height, 0.3, accuracy: 1e-9)
    }

    func testCenterStaysCentered() {
        let rect = geometry.viewRect(frameRect: CGRect(x: 0.4, y: 0.4, width: 0.2, height: 0.2))
        XCTAssertEqual(rect.midX, 0.5, accuracy: 1e-9)
        XCTAssertEqual(rect.midY, 0.5, accuracy: 1e-9)
    }

    func testWiderFrameCropsHorizontallyOnly() {
        let rect = geometry.viewRect(frameRect: CGRect(x: 0, y: 0.25, width: 1, height: 0.5))
        XCTAssertEqual(rect.minY, 0.25, accuracy: 1e-9)
        XCTAssertEqual(rect.height, 0.5, accuracy: 1e-9)
        XCTAssertGreaterThan(rect.width, 1)
        XCTAssertLessThan(rect.minX, 0)

        let expectedScale = (390.0 / 844.0) / (1080.0 / 1920.0)
        XCTAssertEqual(rect.width, 1 / expectedScale, accuracy: 1e-9)
    }

    func testTallerFrameCropsVerticallyOnly() {
        let tall = FrameGeometry(textureSize: CGSize(width: 1080, height: 1920),
                                 viewSize: CGSize(width: 800, height: 1000))
        let rect = tall.viewRect(frameRect: CGRect(x: 0.25, y: 0, width: 0.5, height: 1))
        XCTAssertEqual(rect.minX, 0.25, accuracy: 1e-9)
        XCTAssertEqual(rect.width, 0.5, accuracy: 1e-9)
        XCTAssertGreaterThan(rect.height, 1)
    }

    func testPointsScaleToViewSize() {
        let rect = geometry.points(frameRect: CGRect(x: 0, y: 0, width: 1, height: 1))
        XCTAssertEqual(rect.height, 844, accuracy: 1e-6)
        XCTAssertEqual(rect.midX, 195, accuracy: 1e-6)
    }

    func testDegenerateSizesDoNotExplode() {
        let empty = FrameGeometry(textureSize: .zero, viewSize: CGSize(width: 390, height: 844))
        XCTAssertEqual(empty.fillScale, CGSize(width: 1, height: 1))
        let rect = empty.viewRect(frameRect: CGRect(x: 0.1, y: 0.2, width: 0.3, height: 0.4))
        XCTAssertEqual(rect.minX, 0.1, accuracy: 1e-9)
        XCTAssertEqual(rect.minY, 0.2, accuracy: 1e-9)
        XCTAssertEqual(rect.width, 0.3, accuracy: 1e-9)
        XCTAssertEqual(rect.height, 0.4, accuracy: 1e-9)
    }
}
