import SwiftUI

/// A name in Pete's handwriting, more or less. Tilted a little by its seed
/// so a crowd of tags does not line up like a spreadsheet.
struct TagBubble: View {
    let text: String
    let seed: Int
    let color: Color

    var body: some View {
        Text(text)
            .font(.system(size: 19, weight: .black, design: .rounded))
            .textCase(.uppercase)
            .lineLimit(1)
            .fixedSize()
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(color.opacity(0.92), in: Capsule())
            .overlay(Capsule().stroke(.white, lineWidth: 2))
            .shadow(color: .black.opacity(0.45), radius: 4, y: 2)
            .rotationEffect(.degrees(Double(seed % 13) - 6))
            .transition(.scale(scale: 0.3).combined(with: .opacity))
    }
}
