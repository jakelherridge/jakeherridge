import SwiftUI

/// Flip, shutter, mood, and the one dial that matters: how much Pete.
struct ControlsBar: View {
    let session: PeteSession
    let viewSize: CGSize
    @Environment(\.displayScale) private var displayScale

    var body: some View {
        VStack(spacing: 16) {
            IntensityDial(world: session.world)

            HStack {
                RoundButton(systemImage: "arrow.triangle.2.circlepath.camera") {
                    session.flipCamera()
                }
                Spacer()
                ShutterButton(isBusy: session.isSaving) {
                    Task { await session.takeSnapshot(viewSize: viewSize, displayScale: displayScale) }
                }
                Spacer()
                RoundButton(systemImage: "paintpalette.fill") {
                    session.cycleMood()
                }
            }
            .padding(.horizontal, 40)
        }
    }
}

struct IntensityDial: View {
    @Bindable var world: PeteWorld

    var body: some View {
        VStack(spacing: 4) {
            Text("How much Pete?")
                .font(.system(.caption, design: .rounded).weight(.black))
                .textCase(.uppercase)
                .opacity(0.85)
            Slider(value: $world.intensity, in: 0...1)
                .tint(world.mood.accent)
        }
        .padding(.horizontal, 44)
        .foregroundStyle(.white)
    }
}

struct RoundButton: View {
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 52, height: 52)
                .background(.ultraThinMaterial, in: Circle())
        }
        .buttonStyle(.plain)
    }
}

struct ShutterButton: View {
    let isBusy: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .stroke(.white, lineWidth: 4)
                    .frame(width: 78, height: 78)
                Circle()
                    .fill(.white)
                    .frame(width: 64, height: 64)
                    .scaleEffect(isBusy ? 0.8 : 1)
                    .animation(.easeOut(duration: 0.15), value: isBusy)
            }
        }
        .buttonStyle(.plain)
        .disabled(isBusy)
    }
}
