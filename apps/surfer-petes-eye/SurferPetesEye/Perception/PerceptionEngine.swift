import CoreVideo
import Foundation
import QuartzCore

/// Runs the detectors on a trickle of camera frames, not all of them.
/// Objects at about 8 Hz, hands at about 15 Hz, each on its own queue so a
/// slow model never makes the crab late. Results go through the tracker and
/// out via `onUpdate` on a background queue; PeteWorld hops to the main actor.
final class PerceptionEngine {

    struct Update {
        var sightings: [Sighting]
        var hands: [HandSighting]
        var frameSize: CGSize
        var detectorName: String
        var timestamp: TimeInterval
    }

    var onUpdate: ((Update) -> Void)?

    var objectInterval: TimeInterval = 0.12
    var handInterval: TimeInterval = 0.066

    private let objectDetector: ObjectDetector
    private let handDetector = HandGestureDetector()
    private let objectQueue = DispatchQueue(label: "pete.perception.objects", qos: .userInitiated)
    private let handQueue = DispatchQueue(label: "pete.perception.hands", qos: .userInitiated)

    private let stateLock = NSLock()
    private var objectBusy = false
    private var handBusy = false
    private var lastObjectTime: TimeInterval = 0
    private var lastHandTime: TimeInterval = 0
    private var tracker = SightingTracker()

    init(objectDetector: ObjectDetector = ObjectDetectorFactory.make()) {
        self.objectDetector = objectDetector
    }

    var detectorName: String { objectDetector.name }

    /// Called on the camera queue for every frame. Cheap unless it decides
    /// to run something.
    func process(_ pixelBuffer: CVPixelBuffer) {
        let now = CACurrentMediaTime()
        let frameSize = CGSize(width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))

        stateLock.lock()
        let runObjects = !objectBusy && now - lastObjectTime >= objectInterval
        let runHands = !handBusy && now - lastHandTime >= handInterval
        if runObjects { objectBusy = true; lastObjectTime = now }
        if runHands { handBusy = true; lastHandTime = now }
        stateLock.unlock()

        if runObjects {
            objectQueue.async { [self] in
                let raw = (try? objectDetector.detect(in: pixelBuffer)) ?? []
                let detections = raw.map(FrameDetection.init(raw:))
                publish(frameSize: frameSize) { tracker, time in
                    _ = tracker.ingest(detections: detections, at: time)
                }
                stateLock.lock(); objectBusy = false; stateLock.unlock()
            }
        }

        if runHands {
            handQueue.async { [self] in
                let hands = handDetector.detect(in: pixelBuffer)
                publish(frameSize: frameSize) { tracker, time in
                    _ = tracker.ingest(hands: hands, at: time)
                }
                stateLock.lock(); handBusy = false; stateLock.unlock()
            }
        }
    }

    private func publish(frameSize: CGSize, _ mutate: (inout SightingTracker, TimeInterval) -> Void) {
        let time = CACurrentMediaTime()
        stateLock.lock()
        mutate(&tracker, time)
        tracker.expire(at: time)
        let update = Update(sightings: tracker.sightings,
                            hands: tracker.hands,
                            frameSize: frameSize,
                            detectorName: objectDetector.name,
                            timestamp: time)
        stateLock.unlock()
        onUpdate?(update)
    }
}
