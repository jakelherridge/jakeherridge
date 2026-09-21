import XCTest
@testable import SurferPetesEye

final class SightingTrackerTests: XCTestCase {

    private let bottle = FrameDetection(label: "bottle", confidence: 0.9,
                                        rect: CGRect(x: 0.4, y: 0.4, width: 0.2, height: 0.3))

    func testSameThingTwiceIsOneSighting() {
        var tracker = SightingTracker()
        tracker.ingest(detections: [bottle], at: 0)
        let first = tracker.sightings
        tracker.ingest(detections: [bottle], at: 0.1)
        XCTAssertEqual(tracker.sightings.count, 1)
        XCTAssertEqual(tracker.sightings.first?.id, first.first?.id)
        XCTAssertEqual(tracker.sightings.first?.peteName, first.first?.peteName)
        XCTAssertEqual(tracker.sightings.first?.peteName, "happy juice")
    }

    func testDifferentLabelsAreDifferentSightings() {
        var tracker = SightingTracker()
        let dog = FrameDetection(label: "dog", confidence: 0.8, rect: bottle.rect)
        tracker.ingest(detections: [bottle, dog], at: 0)
        XCTAssertEqual(tracker.sightings.count, 2)
    }

    func testBoxesAreSmoothedNotSnapped() {
        var tracker = SightingTracker()
        tracker.ingest(detections: [bottle], at: 0)
        let moved = FrameDetection(label: "bottle", confidence: 0.9,
                                   rect: CGRect(x: 0.5, y: 0.4, width: 0.2, height: 0.3))
        tracker.ingest(detections: [moved], at: 0.1)
        let x = tracker.sightings.first?.rect.minX ?? 0
        XCTAssertGreaterThan(x, 0.4)
        XCTAssertLessThan(x, 0.5)
    }

    func testThingsLingerThenLeave() {
        var tracker = SightingTracker()
        tracker.ingest(detections: [bottle], at: 0)
        tracker.ingest(detections: [], at: 0.3)
        XCTAssertEqual(tracker.sightings.count, 1)
        tracker.ingest(detections: [], at: 1.0)
        XCTAssertEqual(tracker.sightings.count, 0)
    }

    func testAmbientTagsMatchWithoutOverlap() {
        var tracker = SightingTracker()
        let beach = FrameDetection(label: "beach", confidence: 0.7, rect: CGRect(x: 0, y: 0, width: 1, height: 1), isAmbient: true)
        tracker.ingest(detections: [beach], at: 0)
        tracker.ingest(detections: [beach], at: 0.1)
        XCTAssertEqual(tracker.sightings.count, 1)
        XCTAssertTrue(tracker.sightings.first?.isAmbient ?? false)
    }

    func testGestureNeedsTwoFramesToStick() {
        var tracker = SightingTracker()
        let crab = FrameHand(side: .right, gesture: .crabPinch,
                             bounds: CGRect(x: 0.3, y: 0.3, width: 0.2, height: 0.2),
                             pinchPoint: CGPoint(x: 0.4, y: 0.4))
        tracker.ingest(hands: [crab], at: 0)
        XCTAssertNil(tracker.hands.first?.gesture)
        tracker.ingest(hands: [crab], at: 0.07)
        XCTAssertEqual(tracker.hands.first?.gesture, .crabPinch)

        let nothing = FrameHand(side: .right, gesture: nil, bounds: crab.bounds, pinchPoint: crab.pinchPoint)
        tracker.ingest(hands: [nothing], at: 0.14)
        XCTAssertEqual(tracker.hands.first?.gesture, .crabPinch)
        tracker.ingest(hands: [nothing], at: 0.21)
        XCTAssertNil(tracker.hands.first?.gesture)
    }

    func testHandsLeaveQuickly() {
        var tracker = SightingTracker()
        let hand = FrameHand(side: .left, gesture: nil,
                             bounds: CGRect(x: 0.3, y: 0.3, width: 0.2, height: 0.2),
                             pinchPoint: CGPoint(x: 0.4, y: 0.4))
        tracker.ingest(hands: [hand], at: 0)
        XCTAssertEqual(tracker.hands.count, 1)
        tracker.ingest(hands: [], at: 1.0)
        XCTAssertEqual(tracker.hands.count, 0)
    }

    func testIoU() {
        let a = CGRect(x: 0, y: 0, width: 1, height: 1)
        let b = CGRect(x: 0.5, y: 0, width: 1, height: 1)
        XCTAssertEqual(SightingTracker.iou(a, b), 1.0 / 3.0, accuracy: 1e-9)
        XCTAssertEqual(SightingTracker.iou(a, CGRect(x: 2, y: 2, width: 1, height: 1)), 0)
    }
}
