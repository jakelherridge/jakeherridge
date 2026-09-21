import SwiftUI

/// Everything drawn on top of the Metal view: name tags on the things Pete
/// sees, and creatures on the hands he watches. Never eats touches.
struct PeteOverlayView: View {
    let world: PeteWorld

    var body: some View {
        GeometryReader { geo in
            let geometry = FrameGeometry(textureSize: world.frameSize, viewSize: geo.size)
            let boxed = world.sightings.filter { !$0.isAmbient }
            let ambient = world.sightings.filter(\.isAmbient)

            ZStack(alignment: .topLeading) {
                ForEach(boxed) { sighting in
                    let rect = geometry.points(frameRect: sighting.rect)
                    TagBubble(text: sighting.peteName,
                              seed: sighting.seed,
                              color: sighting.isHappyJuice ? .yellow : world.mood.accent)
                        .position(x: rect.midX.clamped(to: 48...max(48, geo.size.width - 48)),
                                  y: max(72, rect.minY - 16))
                }

                if !ambient.isEmpty {
                    AmbientRow(sightings: ambient, color: world.mood.accent)
                        .position(x: geo.size.width / 2, y: geo.size.height * 0.7)
                }

                ForEach(world.hands) { hand in
                    HandCreatureView(hand: hand, geometry: geometry, accent: world.mood.accent)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .allowsHitTesting(false)
        .animation(.easeOut(duration: 0.15), value: world.sightings)
        .animation(.easeOut(duration: 0.12), value: world.hands)
    }
}

/// Whole-frame tags from the scene classifier fallback, shown as a row.
struct AmbientRow: View {
    let sightings: [Sighting]
    let color: Color

    var body: some View {
        HStack(spacing: 8) {
            ForEach(sightings) { sighting in
                TagBubble(text: sighting.peteName,
                          seed: sighting.seed,
                          color: sighting.isHappyJuice ? .yellow : color)
            }
        }
    }
}

/// A hand doing something becomes something.
struct HandCreatureView: View {
    let hand: HandSighting
    let geometry: FrameGeometry
    let accent: Color

    var body: some View {
        let bounds = geometry.points(frameRect: hand.bounds)
        let side = max(60, max(bounds.width, bounds.height) * 1.5)
        let center = CGPoint(x: bounds.midX, y: bounds.midY)

        Group {
            switch hand.gesture {
            case .crabPinch:
                CrabView(tint: .orange)
                    .frame(width: side, height: side * 0.8)
                    .transition(.scale.combined(with: .opacity))
            case .shaka:
                GestureBurstView(text: "HANG LOOSE", color: accent, size: side)
                    .transition(.scale.combined(with: .opacity))
            case .peace:
                GestureBurstView(text: "PEACE, BRAH", color: accent, size: side)
                    .transition(.scale.combined(with: .opacity))
            case .openPalm:
                RippleView(color: accent)
                    .frame(width: side * 1.4, height: side * 1.4)
                    .transition(.opacity)
            case nil:
                EmptyView()
            }
        }
        .position(center)
    }
}

extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
