import AVFoundation
import Foundation
import Observation
import SwiftUI
import UIKit

/// Wires the camera, the renderer, perception, motion and the world
/// together, and owns the app's lifecycle. One per app.
@Observable @MainActor
final class PeteSession {

    enum Permission {
        case undetermined, granted, denied
    }

    let world = PeteWorld()
    let governor = PerformanceGovernor()
    let renderer: PeteRenderer?
    var permission: Permission
    var setupError: String?
    var isFlashing = false
    var isSaving = false
    var lastSnapshot: UIImage?

    private let camera = CameraManager()
    private let perception: PerceptionEngine
    private let motion = MotionSampler()
    private var sayingsTask: Task<Void, Never>?
    private var started = false

    init() {
        renderer = try? PeteRenderer.makeDefault()
        perception = PerceptionEngine()
        switch CameraManager.authorization {
        case .authorized: permission = .granted
        case .notDetermined: permission = .undetermined
        default: permission = .denied
        }
        wire()
    }

    private func wire() {
        let renderer = self.renderer
        let perception = self.perception
        let world = self.world

        camera.onFrame = { frame in
            renderer?.enqueue(frame)
            perception.process(frame)
        }

        perception.onUpdate = { update in
            Task { @MainActor in
                world.apply(update)
            }
        }

        // MTKView draws on the main thread, so this is safe to assume.
        renderer?.inputs = { drawableSize, frameSize, time in
            MainActor.assumeIsolated {
                world.frameInputs(drawableSize: drawableSize, frameSize: frameSize, time: time)
            }
        }

        // The governor steps detection down when the phone runs warm. The
        // Metal view reads render scale and frame rate from it directly.
        let applyTier: (PerformanceGovernor.Tier) -> Void = { tier in
            perception.objectInterval = tier.objectInterval
            perception.handInterval = tier.handInterval
        }
        governor.onChange = applyTier
        applyTier(governor.tier)

        motion.onEnergy = { energy in
            MainActor.assumeIsolated {
                world.motionEnergy = energy
            }
        }
    }

    // MARK: Lifecycle

    func start() async {
        if permission == .undetermined {
            permission = await CameraManager.requestAccess() ? .granted : .denied
        }
        guard permission == .granted else { return }
        do {
            try await camera.configureAndStart()
        } catch {
            setupError = "Pete can't see: \(error)"
            return
        }
        guard !started else { return }
        started = true
        motion.start()
        world.detectorName = perception.detectorName
        startSayingsLoop()
    }

    func pause() {
        camera.stop()
        motion.stop()
    }

    func resume() {
        guard started else { return }
        camera.start()
        motion.start()
    }

    func flipCamera() {
        camera.flip()
    }

    func cycleMood() {
        world.cycleMood()
    }

    func openSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }

    private func startSayingsLoop() {
        sayingsTask?.cancel()
        sayingsTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(7))
                guard let self else { return }
                self.world.tickAmbient()
            }
        }
    }

    // MARK: Capture

    /// Renders the current frame through Pete's eye, stamps the overlay on
    /// top, and saves the result to Photos.
    func takeSnapshot(viewSize: CGSize) async {
        guard let renderer, !isSaving else { return }
        isSaving = true
        defer { isSaving = false }

        withAnimation(.easeOut(duration: 0.08)) { isFlashing = true }
        let scale = UITraitCollection.current.displayScale
        let pixelSize = CGSize(width: viewSize.width * scale, height: viewSize.height * scale)
        let base = renderer.snapshot(size: pixelSize)
        withAnimation(.easeIn(duration: 0.25)) { isFlashing = false }

        guard let base else {
            world.say(PeteSayings.pick(PeteSayings.snapshotFailed), force: true)
            return
        }

        let overlay = PeteOverlayView(world: world)
            .frame(width: viewSize.width, height: viewSize.height)
        let image = SnapshotSaver.compose(base: base, overlay: overlay, size: viewSize, scale: scale)
        lastSnapshot = image

        do {
            try await SnapshotSaver.saveToPhotos(image)
            world.say(PeteSayings.pick(PeteSayings.snapshot), force: true)
        } catch {
            world.say(PeteSayings.pick(PeteSayings.snapshotFailed), force: true)
        }
    }
}
