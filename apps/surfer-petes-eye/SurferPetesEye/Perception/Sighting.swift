import CoreGraphics
import Foundation

/// Something Pete has noticed and named. Rects live in frame space
/// (normalized, origin top-left, over the camera frame).
struct Sighting: Identifiable, Equatable {
    let id: UUID
    /// What the model said, for example "bottle".
    let label: String
    /// What Pete says, for example "happy juice".
    let peteName: String
    /// Stable per-sighting number used to pick name variants and tag tilt.
    let seed: Int
    var rect: CGRect
    var confidence: Float
    /// True for whole-frame tags from the scene classifier fallback.
    let isAmbient: Bool
    let firstSeen: TimeInterval
    var lastSeen: TimeInterval

    var isHappyJuice: Bool { PeteLexicon.isHappyJuice(label) }
    var area: CGFloat { rect.width * rect.height }
}

enum Gesture: String, Equatable, CaseIterable {
    case crabPinch
    case shaka
    case peace
    case openPalm
}

enum HandSide: String, Equatable {
    case left, right, unknown
}

/// A hand Pete is watching. Bounds and pinch point are in frame space.
struct HandSighting: Identifiable, Equatable {
    let id: String
    let side: HandSide
    var gesture: Gesture?
    var bounds: CGRect
    var pinchPoint: CGPoint
    var lastSeen: TimeInterval

    // Debounce state so a gesture has to hold for a couple of frames.
    var candidate: Gesture?
    var streak: Int = 0
}

/// A detection already converted to frame space, ready for the tracker.
struct FrameDetection: Equatable {
    let label: String
    let confidence: Float
    let rect: CGRect
    let isAmbient: Bool

    init(label: String, confidence: Float, rect: CGRect, isAmbient: Bool = false) {
        self.label = label
        self.confidence = confidence
        self.rect = rect
        self.isAmbient = isAmbient
    }

    init(raw: RawDetection) {
        label = raw.label
        confidence = raw.confidence
        if let vision = raw.visionRect {
            rect = FrameGeometry.frameRect(fromVision: vision)
            isAmbient = false
        } else {
            rect = CGRect(x: 0, y: 0, width: 1, height: 1)
            isAmbient = true
        }
    }
}

/// A hand pose already converted to frame space, ready for the tracker.
struct FrameHand: Equatable {
    let side: HandSide
    let gesture: Gesture?
    let bounds: CGRect
    let pinchPoint: CGPoint
}
