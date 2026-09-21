import SwiftUI

/// A shout in a box, pulsing. Shaka and peace use this.
struct GestureBurstView: View {
    let text: String
    let color: Color
    let size: CGFloat

    var body: some View {
        TimelineView(.animation) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            let pulse = 1.0 + 0.12 * sin(t * 6)
            Text(text)
                .font(.system(size: max(22, size * 0.2), weight: .black, design: .rounded))
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(color, in: RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(.white, lineWidth: 3))
                .rotationEffect(.degrees(-8 + 4 * sin(t * 3)))
                .scaleEffect(pulse)
                .shadow(color: color.opacity(0.8), radius: 16)
        }
    }
}

/// Rings rolling out from an open palm.
struct RippleView: View {
    let color: Color

    var body: some View {
        TimelineView(.animation) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            Canvas { context, size in
                let center = CGPoint(x: size.width / 2, y: size.height / 2)
                let maxRadius = min(size.width, size.height) / 2
                for i in 0..<4 {
                    let phase = (t * 0.8 + Double(i) / 4).truncatingRemainder(dividingBy: 1)
                    let radius = maxRadius * phase
                    let ring = CGRect(x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2)
                    context.stroke(Path(ellipseIn: ring), with: .color(color.opacity(1 - phase)), lineWidth: 4)
                }
            }
        }
    }
}
