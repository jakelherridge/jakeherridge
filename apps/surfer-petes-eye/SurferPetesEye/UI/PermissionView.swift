import SwiftUI

/// Shown before the camera is granted, or after it has been refused.
struct PermissionView: View {
    enum Mode {
        case ask, denied
    }

    let mode: Mode
    let action: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(colors: [.orange, .pink, .purple], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Text("🌊")
                    .font(.system(size: 72))
                Text("Surfer Pete's Eye")
                    .font(.system(.largeTitle, design: .rounded).weight(.black))
                Text(mode == .ask
                     ? "Pete needs to borrow your eyes, bey. The camera never leaves the phone. Nothing leaves the island."
                     : "Pete can't see without the camera. Flip it on in Settings and come back.")
                    .font(.system(.body, design: .rounded))
                Button(mode == .ask ? "Let Pete look" : "Open Settings", action: action)
                    .buttonStyle(.borderedProminent)
                    .tint(.black)
                    .font(.system(.headline, design: .rounded))
            }
            .padding(32)
            .multilineTextAlignment(.center)
            .foregroundStyle(.white)
        }
    }
}
