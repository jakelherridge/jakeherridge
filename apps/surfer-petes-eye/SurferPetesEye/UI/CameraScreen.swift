import SwiftUI

/// The whole app, really: Pete's eye underneath, tags and creatures on top,
/// a strip of Pete talking up top and the controls at the bottom.
struct CameraScreen: View {
    let session: PeteSession

    var body: some View {
        GeometryReader { geo in
            ZStack {
                if let renderer = session.renderer {
                    PeteMetalView(renderer: renderer,
                                  renderScale: session.governor.renderScale,
                                  frameRate: session.governor.frameRate)
                } else {
                    NoEyeView(message: "No Metal on this device. Pete can't see without it.")
                }

                PeteOverlayView(world: session.world)

                VStack(spacing: 0) {
                    TopStrip(world: session.world,
                             status: session.governor.tier == .full ? "" : session.governor.tier.label,
                             onMoodTap: { session.cycleMood() })
                        .padding(.top, geo.safeAreaInsets.top + 8)
                    Spacer()
                    ControlsBar(session: session, viewSize: geo.size)
                        .padding(.bottom, geo.safeAreaInsets.bottom + 12)
                }

                if session.isFlashing {
                    Color.white.transition(.opacity)
                }

                if let error = session.setupError {
                    NoEyeView(message: error)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .ignoresSafeArea()
        .background(Color.black)
    }
}

/// Mood pill on the left, what Pete's eyes are running on the right, and
/// whatever Pete just said underneath.
struct TopStrip: View {
    let world: PeteWorld
    var status: String = ""
    let onMoodTap: () -> Void

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Button(action: onMoodTap) {
                    Label(world.mood.rawValue, systemImage: world.mood.systemImage)
                        .font(.system(.subheadline, design: .rounded).weight(.bold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
                .buttonStyle(.plain)

                Spacer()

                if !world.detectorName.isEmpty {
                    Text(status.isEmpty ? "eyes: \(world.detectorName)" : "eyes: \(world.detectorName) · \(status)")
                        .font(.caption2.monospaced())
                        .opacity(0.6)
                }
            }

            Text(world.currentSaying)
                .font(.system(.headline, design: .rounded).weight(.bold))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(.black.opacity(0.35), in: RoundedRectangle(cornerRadius: 14))
                .contentTransition(.opacity)
                .animation(.easeInOut(duration: 0.3), value: world.currentSaying)
        }
        .padding(.horizontal, 16)
        .foregroundStyle(.white)
    }
}

struct NoEyeView: View {
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Text("🌊")
                .font(.system(size: 56))
            Text(message)
                .font(.system(.body, design: .rounded))
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.opacity(0.8))
    }
}
