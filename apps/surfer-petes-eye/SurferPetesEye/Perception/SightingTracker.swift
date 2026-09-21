import CoreGraphics
import Foundation

/// Keeps sightings stable across frames. Detectors flicker; Pete does not.
/// New detections are matched to existing sightings by label and overlap,
/// boxes are smoothed, names never change once given, and things linger a
/// moment after the model loses them.
struct SightingTracker {
    var sightings: [Sighting] = []
    var hands: [HandSighting] = []

    var timeToLive: TimeInterval = 0.7
    var handTimeToLive: TimeInterval = 0.4
    var smoothing: CGFloat = 0.4
    var maximumSightings = 8
    var matchThreshold: CGFloat = 0.25
    var gestureHoldFrames = 2

    // MARK: Objects

    @discardableResult
    mutating func ingest(detections: [FrameDetection], at time: TimeInterval) -> [Sighting] {
        var unmatched = Set(sightings.indices)

        for detection in detections {
            var bestIndex: Int?
            var bestScore: CGFloat = 0
            for index in unmatched where sightings[index].label == detection.label
                && sightings[index].isAmbient == detection.isAmbient {
                let score = detection.isAmbient ? 1 : Self.iou(sightings[index].rect, detection.rect)
                if score > bestScore {
                    bestScore = score
                    bestIndex = index
                }
            }

            if let index = bestIndex, bestScore >= matchThreshold {
                unmatched.remove(index)
                var existing = sightings[index]
                existing.rect = Self.lerp(existing.rect, detection.rect, smoothing)
                existing.confidence = detection.confidence
                existing.lastSeen = time
                sightings[index] = existing
            } else {
                let id = UUID()
                let seed = abs(id.hashValue % 1_000_000)
                sightings.append(Sighting(id: id,
                                          label: detection.label,
                                          peteName: PeteLexicon.translate(detection.label, seed: seed),
                                          seed: seed,
                                          rect: detection.rect,
                                          confidence: detection.confidence,
                                          isAmbient: detection.isAmbient,
                                          firstSeen: time,
                                          lastSeen: time))
            }
        }

        expire(at: time)
        return sightings
    }

    mutating func expire(at time: TimeInterval) {
        sightings.removeAll { time - $0.lastSeen > timeToLive }
        sightings.sort { $0.area > $1.area }
        if sightings.count > maximumSightings {
            sightings.removeLast(sightings.count - maximumSightings)
        }
        hands.removeAll { time - $0.lastSeen > handTimeToLive }
    }

    // MARK: Hands

    @discardableResult
    mutating func ingest(hands incoming: [FrameHand], at time: TimeInterval) -> [HandSighting] {
        for (offset, hand) in incoming.enumerated() {
            let id = hand.side == .unknown ? "unknown-\(offset)" : hand.side.rawValue
            if let index = hands.firstIndex(where: { $0.id == id }) {
                var existing = hands[index]
                existing.bounds = Self.lerp(existing.bounds, hand.bounds, smoothing)
                existing.pinchPoint = Self.lerp(existing.pinchPoint, hand.pinchPoint, smoothing)
                existing.lastSeen = time
                if existing.candidate == hand.gesture {
                    existing.streak += 1
                } else {
                    existing.candidate = hand.gesture
                    existing.streak = 1
                }
                if existing.streak >= gestureHoldFrames {
                    existing.gesture = existing.candidate
                }
                hands[index] = existing
            } else {
                hands.append(HandSighting(id: id,
                                          side: hand.side,
                                          gesture: nil,
                                          bounds: hand.bounds,
                                          pinchPoint: hand.pinchPoint,
                                          lastSeen: time,
                                          candidate: hand.gesture,
                                          streak: 1))
            }
        }
        hands.removeAll { time - $0.lastSeen > handTimeToLive }
        return hands
    }

    // MARK: Math

    static func iou(_ a: CGRect, _ b: CGRect) -> CGFloat {
        let inter = a.intersection(b)
        guard !inter.isNull, inter.width > 0, inter.height > 0 else { return 0 }
        let interArea = inter.width * inter.height
        let union = a.width * a.height + b.width * b.height - interArea
        return union > 0 ? interArea / union : 0
    }

    static func lerp(_ a: CGRect, _ b: CGRect, _ t: CGFloat) -> CGRect {
        CGRect(x: a.minX + (b.minX - a.minX) * t,
               y: a.minY + (b.minY - a.minY) * t,
               width: a.width + (b.width - a.width) * t,
               height: a.height + (b.height - a.height) * t)
    }

    static func lerp(_ a: CGPoint, _ b: CGPoint, _ t: CGFloat) -> CGPoint {
        CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t)
    }
}
