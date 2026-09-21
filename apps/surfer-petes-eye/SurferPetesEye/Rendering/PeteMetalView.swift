import SwiftUI
import MetalKit

/// MTKView that renders at a fraction of native resolution. Pete's world is
/// soft anyway, and the shader does a lot of work per pixel.
final class PeteMTKView: MTKView {
    var renderScale: CGFloat = 0.75 {
        didSet { setNeedsLayout() }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        let screenScale = window?.screen.scale ?? traitCollection.displayScale
        let scale = screenScale * renderScale
        let size = CGSize(width: max(1, bounds.width * scale), height: max(1, bounds.height * scale))
        if drawableSize != size {
            drawableSize = size
        }
    }
}

struct PeteMetalView: UIViewRepresentable {
    let renderer: PeteRenderer
    var renderScale: CGFloat = 0.75

    func makeUIView(context: Context) -> PeteMTKView {
        let view = PeteMTKView(frame: .zero, device: renderer.device)
        view.colorPixelFormat = .bgra8Unorm
        view.framebufferOnly = true
        view.autoResizeDrawable = false
        view.preferredFramesPerSecond = 60
        view.isPaused = false
        view.enableSetNeedsDisplay = false
        view.backgroundColor = .black
        view.renderScale = renderScale
        view.delegate = renderer
        return view
    }

    func updateUIView(_ uiView: PeteMTKView, context: Context) {
        uiView.renderScale = renderScale
    }
}
