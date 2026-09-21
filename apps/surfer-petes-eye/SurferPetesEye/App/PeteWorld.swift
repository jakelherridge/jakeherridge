import CoreGraphics
import Foundation
import Observation
import QuartzCore
import UIKit

/// Everything the screen needs to draw Pete's world, on the main actor.
/// The renderer reads it sixty times a second; perception writes it a few
/// times a second; the UI binds to it.
@Observable @MainActor
final class PeteWorld {

    /// 0 is a plain camera. 1 is all the way Pete.
    var intensity: Double = 0.85
    var mood: PeteMood = .forNow()
    var motionEnergy: Double = 0

    var sightings: [Sighting] = []
    var hands: [HandSighting] = []
    var frameSize: CGSize = .zero
    var detectorName: String = ""

    var currentSaying: String = PeteSayings.pick(PeteSayings.ambient)
    private var lastSayingTime: TimeInterval = 0
    private let sayingCooldown: TimeInterval = 4
    private let haptics = UIImpactFeedbackGenerator(style: .medium)

    // MARK: Perception in

    func apply(_ update: PerceptionEngine.Update) {
        frameSize = update.frameSize
        detectorName = update.detectorName

        let knownIDs = Set(sightings.map(\.id))
        let newcomers = update.sightings.filter { !knownIDs.contains($0.id) }
        sightings = update.sightings

        let previousGestures = Dictionary(hands.map { ($0.id, $0.gesture) }, uniquingKeysWith: { first, _ in first })
        hands = update.hands
        for hand in hands {
            guard let gesture = hand.gesture else { continue }
            let before = previousGestures[hand.id] ?? nil
            if before != gesture {
                haptics.impactOccurred()
                say(PeteSayings.onGesture(gesture), force: true)
            }
        }

        if let special = newcomers.first(where: { $0.isHappyJuice || PeteLexicon.isTheStick($0.label) }),
           let line = PeteSayings.onSighting(special) {
            say(line)
        }
    }

    // MARK: Talking

    func say(_ line: String, force: Bool = false) {
        let now = CACurrentMediaTime()
        guard force || now - lastSayingTime >= sayingCooldown else { return }
        currentSaying = line
        lastSayingTime = now
    }

    /// Called every few seconds. Keeps Pete muttering when nothing happens.
    func tickAmbient() {
        say(PeteSayings.pick(PeteSayings.ambient, excluding: currentSaying))
    }

    func cycleMood() {
        mood = mood.next
        say(mood.tagline, force: true)
    }

    // MARK: Renderer out

    /// Builds the per-frame shader inputs. Resolution, texture size and time
    /// are filled in by the renderer.
    func frameInputs(drawableSize: CGSize, textureSize: CGSize, time: Float) -> PeteRenderer.FrameInputs {
        var uniforms = PeteUniforms()
        uniforms.intensity = Float(intensity)
        uniforms.motion = Float(motionEnergy)
        uniforms.kaleido = mood.kaleido
        uniforms.drift = mood.drift

        let t = Double(time)
        let sunX = 0.5 + 0.35 * sin(t * 0.05)
        let sunY = 0.16 + 0.06 * sin(t * 0.09 + 1.0)
        uniforms.sun = SIMD4<Float>(Float(sunX), Float(sunY), mood.sunWarmth, mood.sunGlow)

        let palette = mood.palette
        uniforms.paletteA = palette.0
        uniforms.paletteB = palette.1
        uniforms.paletteC = palette.2
        uniforms.paletteD = palette.3

        let geometry = FrameGeometry(textureSize: textureSize, viewSize: drawableSize)
        var hotspots: [PeteHotspot] = []
        for sighting in sightings where !sighting.isAmbient {
            if hotspots.count >= Int(PETE_MAX_HOTSPOTS) { break }
            let rect = geometry.viewRect(frameRect: sighting.rect)
            let tint: SIMD4<Float> = sighting.isHappyJuice ? SIMD4(1.0, 0.85, 0.3, 0.9) : mood.hotspotTint
            hotspots.append(PeteHotspot(rect: SIMD4(Float(rect.minX), Float(rect.minY), Float(rect.width), Float(rect.height)),
                                        tint: tint))
        }
        return PeteRenderer.FrameInputs(uniforms: uniforms, hotspots: hotspots)
    }
}
