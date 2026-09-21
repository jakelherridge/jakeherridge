import SwiftUI

/// A vector crab that pinches. Drawn in Canvas so it scales to any hand.
struct CrabView: View {
    var tint: Color = .orange

    var body: some View {
        TimelineView(.animation) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            Canvas { context, size in
                drawCrab(in: &context, size: size, time: t)
            }
        }
    }

    private func drawCrab(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let w = size.width
        let h = size.height
        let body = CGRect(x: w * 0.28, y: h * 0.40, width: w * 0.44, height: h * 0.34)
        let outline = Color.black.opacity(0.35)
        let legWidth = max(2, w * 0.035)

        // Legs, three a side, scuttling.
        for i in 0..<3 {
            let y = body.minY + body.height * (0.35 + 0.25 * Double(i))
            let phase = sin(t * 9 + Double(i) * 1.3) * h * 0.03
            var left = Path()
            left.move(to: CGPoint(x: body.minX + 3, y: y))
            left.addQuadCurve(to: CGPoint(x: w * 0.05, y: y + h * 0.18 + phase),
                              control: CGPoint(x: w * 0.13, y: y - h * 0.06))
            context.stroke(left, with: .color(tint), style: StrokeStyle(lineWidth: legWidth, lineCap: .round))

            var right = Path()
            right.move(to: CGPoint(x: body.maxX - 3, y: y))
            right.addQuadCurve(to: CGPoint(x: w * 0.95, y: y + h * 0.18 - phase),
                               control: CGPoint(x: w * 0.87, y: y - h * 0.06))
            context.stroke(right, with: .color(tint), style: StrokeStyle(lineWidth: legWidth, lineCap: .round))
        }

        // Arms and claws. The gap opens and closes: that's the pinch.
        let gap = 0.5 + 0.45 * (0.5 + 0.5 * sin(t * 5))
        let clawRadius = w * 0.12
        let leftClaw = CGPoint(x: w * 0.14, y: h * 0.22)
        let rightClaw = CGPoint(x: w * 0.86, y: h * 0.22)

        var arms = Path()
        arms.move(to: CGPoint(x: body.minX + body.width * 0.15, y: body.minY + body.height * 0.3))
        arms.addLine(to: leftClaw)
        arms.move(to: CGPoint(x: body.maxX - body.width * 0.15, y: body.minY + body.height * 0.3))
        arms.addLine(to: rightClaw)
        context.stroke(arms, with: .color(tint), style: StrokeStyle(lineWidth: legWidth * 1.4, lineCap: .round))

        let leftPath = clawPath(center: leftClaw, radius: clawRadius, pointing: -3 * .pi / 4, gap: gap)
        let rightPath = clawPath(center: rightClaw, radius: clawRadius, pointing: -.pi / 4, gap: gap)
        context.fill(leftPath, with: .color(tint))
        context.stroke(leftPath, with: .color(outline), lineWidth: 1.5)
        context.fill(rightPath, with: .color(tint))
        context.stroke(rightPath, with: .color(outline), lineWidth: 1.5)

        // Shell.
        let shell = Path(ellipseIn: body)
        context.fill(shell, with: .color(tint))
        context.stroke(shell, with: .color(outline), lineWidth: 2)

        // Eye stalks.
        for fraction in [0.32, 0.68] {
            let x = body.minX + body.width * fraction
            var stalk = Path()
            stalk.move(to: CGPoint(x: x, y: body.minY + 4))
            stalk.addLine(to: CGPoint(x: x, y: body.minY - h * 0.08))
            context.stroke(stalk, with: .color(tint), style: StrokeStyle(lineWidth: legWidth, lineCap: .round))

            let eyeSize = h * 0.09
            let eye = CGRect(x: x - eyeSize / 2, y: body.minY - h * 0.08 - eyeSize / 2, width: eyeSize, height: eyeSize)
            context.fill(Path(ellipseIn: eye), with: .color(.white))
            context.fill(Path(ellipseIn: eye.insetBy(dx: eyeSize * 0.28, dy: eyeSize * 0.28)), with: .color(.black))
        }

        // Smile. Pete's crabs are happy crabs.
        var smile = Path()
        smile.move(to: CGPoint(x: body.midX - body.width * 0.15, y: body.midY + body.height * 0.15))
        smile.addQuadCurve(to: CGPoint(x: body.midX + body.width * 0.15, y: body.midY + body.height * 0.15),
                           control: CGPoint(x: body.midX, y: body.midY + body.height * 0.4))
        context.stroke(smile, with: .color(outline), style: StrokeStyle(lineWidth: 2, lineCap: .round))
    }

    /// A circle with a wedge of `gap` radians cut out, centered on the
    /// `pointing` direction. Built from line segments so it does not depend
    /// on arc winding rules.
    private func clawPath(center: CGPoint, radius: CGFloat, pointing: Double, gap: Double) -> Path {
        var path = Path()
        let start = pointing + gap / 2
        let end = pointing + 2 * .pi - gap / 2
        let steps = 28
        path.move(to: center)
        for i in 0...steps {
            let angle = start + (end - start) * Double(i) / Double(steps)
            path.addLine(to: CGPoint(x: center.x + radius * cos(angle), y: center.y + radius * sin(angle)))
        }
        path.closeSubpath()
        return path
    }
}
