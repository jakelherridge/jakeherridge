import CoreGraphics

/// Converts between the three coordinate spaces in the app.
///
/// - Vision space: normalized 0..1, origin bottom-left, over the camera frame.
/// - Frame space: normalized 0..1, origin top-left, over the camera frame.
///   Sightings are stored in this space so they do not depend on the screen.
/// - View space: normalized 0..1 (or points) over the drawable, which shows
///   the frame aspect-filled. The shader's `aspectFillUV` is the inverse of
///   `viewRect(frameRect:)`.
struct FrameGeometry: Equatable {
    let textureSize: CGSize
    let viewSize: CGSize

    init(textureSize: CGSize, viewSize: CGSize) {
        self.textureSize = textureSize
        self.viewSize = viewSize
    }

    /// Scale applied to (view uv - 0.5) to reach texture uv. Values below 1
    /// on an axis mean the texture is cropped on that axis.
    var fillScale: CGSize {
        guard textureSize.width > 0, textureSize.height > 0, viewSize.width > 0, viewSize.height > 0 else {
            return CGSize(width: 1, height: 1)
        }
        let viewAspect = viewSize.width / viewSize.height
        let texAspect = textureSize.width / textureSize.height
        if texAspect > viewAspect {
            return CGSize(width: viewAspect / texAspect, height: 1)
        } else {
            return CGSize(width: 1, height: texAspect / viewAspect)
        }
    }

    static func frameRect(fromVision rect: CGRect) -> CGRect {
        CGRect(x: rect.minX, y: 1 - rect.maxY, width: rect.width, height: rect.height)
    }

    static func framePoint(fromVision point: CGPoint) -> CGPoint {
        CGPoint(x: point.x, y: 1 - point.y)
    }

    /// Frame-normalized rect to view-normalized rect (top-left origin).
    func viewRect(frameRect: CGRect) -> CGRect {
        let s = fillScale
        let x = (frameRect.minX - 0.5) / s.width + 0.5
        let y = (frameRect.minY - 0.5) / s.height + 0.5
        return CGRect(x: x, y: y, width: frameRect.width / s.width, height: frameRect.height / s.height)
    }

    func viewPoint(framePoint: CGPoint) -> CGPoint {
        let s = fillScale
        return CGPoint(x: (framePoint.x - 0.5) / s.width + 0.5, y: (framePoint.y - 0.5) / s.height + 0.5)
    }

    /// Frame-normalized rect to a rect in view points.
    func points(frameRect: CGRect) -> CGRect {
        let r = viewRect(frameRect: frameRect)
        return CGRect(x: r.minX * viewSize.width,
                      y: r.minY * viewSize.height,
                      width: r.width * viewSize.width,
                      height: r.height * viewSize.height)
    }

    func points(framePoint: CGPoint) -> CGPoint {
        let p = viewPoint(framePoint: framePoint)
        return CGPoint(x: p.x * viewSize.width, y: p.y * viewSize.height)
    }
}
