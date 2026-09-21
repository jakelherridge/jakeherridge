import Foundation
import MetalKit
import CoreVideo
import QuartzCore
import simd

enum PeteRendererError: Error {
    case noMetalDevice
    case shaderMissing
}

/// Owns the Metal pipeline. Camera frames come in as CVPixelBuffers, get
/// wrapped as Metal textures with zero copies, and go out through
/// `peteFragment` in PeteShaders.metal. Draws on the main thread as the
/// MTKView delegate; frames arrive on the camera queue and are handed over
/// under a lock.
final class PeteRenderer: NSObject, MTKViewDelegate {

    struct FrameInputs {
        var uniforms: PeteUniforms
        var hotspots: [PeteHotspot]
    }

    let device: MTLDevice
    private let commandQueue: MTLCommandQueue
    private let pipeline: MTLRenderPipelineState
    private var textureCache: CVMetalTextureCache?

    private let lock = NSLock()
    private var pendingPixelBuffer: CVPixelBuffer?
    private var cameraTexture: MTLTexture?
    private var cameraTextureRef: CVMetalTexture? // keeps the texture memory alive
    private let epoch = CACurrentMediaTime()

    /// Called every frame on the main thread to fetch the current mood,
    /// intensity, motion and hotspots. Resolution, texture size and time are
    /// filled in by the renderer.
    var inputs: ((_ drawableSize: CGSize, _ textureSize: CGSize, _ time: Float) -> FrameInputs)?

    init(device: MTLDevice) throws {
        guard let queue = device.makeCommandQueue(),
              let library = device.makeDefaultLibrary(),
              let vertex = library.makeFunction(name: "peteVertex"),
              let fragment = library.makeFunction(name: "peteFragment")
        else { throw PeteRendererError.shaderMissing }

        let descriptor = MTLRenderPipelineDescriptor()
        descriptor.label = "Pete"
        descriptor.vertexFunction = vertex
        descriptor.fragmentFunction = fragment
        descriptor.colorAttachments[0].pixelFormat = .bgra8Unorm

        self.device = device
        commandQueue = queue
        pipeline = try device.makeRenderPipelineState(descriptor: descriptor)
        super.init()
        CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, device, nil, &textureCache)
    }

    static func makeDefault() throws -> PeteRenderer {
        guard let device = MTLCreateSystemDefaultDevice() else { throw PeteRendererError.noMetalDevice }
        return try PeteRenderer(device: device)
    }

    // MARK: Input

    /// Called from the camera queue. Only the newest frame is kept.
    func enqueue(_ pixelBuffer: CVPixelBuffer) {
        lock.lock()
        pendingPixelBuffer = pixelBuffer
        lock.unlock()
    }

    var elapsed: Float { Float(CACurrentMediaTime() - epoch) }

    var textureSize: CGSize {
        guard let texture = cameraTexture else { return .zero }
        return CGSize(width: texture.width, height: texture.height)
    }

    // MARK: MTKViewDelegate

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    func draw(in view: MTKView) {
        refreshCameraTexture()
        guard let texture = cameraTexture,
              let drawable = view.currentDrawable,
              let passDescriptor = view.currentRenderPassDescriptor,
              let commandBuffer = commandQueue.makeCommandBuffer()
        else { return }
        encode(into: passDescriptor, commandBuffer: commandBuffer, camera: texture, drawableSize: view.drawableSize)
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }

    // MARK: Snapshot

    /// Renders the current camera frame through Pete's eye into an offscreen
    /// texture and reads it back. Blocks the caller briefly; fine for a
    /// shutter press.
    func snapshot(size: CGSize) -> CGImage? {
        refreshCameraTexture()
        guard let camera = cameraTexture else { return nil }
        let width = max(1, Int(size.width))
        let height = max(1, Int(size.height))

        let descriptor = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .bgra8Unorm,
                                                                  width: width,
                                                                  height: height,
                                                                  mipmapped: false)
        descriptor.usage = [.renderTarget, .shaderRead]
        descriptor.storageMode = .shared
        guard let target = device.makeTexture(descriptor: descriptor),
              let commandBuffer = commandQueue.makeCommandBuffer()
        else { return nil }

        let pass = MTLRenderPassDescriptor()
        pass.colorAttachments[0].texture = target
        pass.colorAttachments[0].loadAction = .clear
        pass.colorAttachments[0].storeAction = .store
        pass.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1)

        encode(into: pass, commandBuffer: commandBuffer, camera: camera, drawableSize: CGSize(width: width, height: height))
        commandBuffer.commit()
        commandBuffer.waitUntilCompleted()

        let bytesPerRow = width * 4
        var bytes = [UInt8](repeating: 0, count: bytesPerRow * height)
        target.getBytes(&bytes, bytesPerRow: bytesPerRow, from: MTLRegionMake2D(0, 0, width, height), mipmapLevel: 0)

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
        guard let provider = CGDataProvider(data: Data(bytes) as CFData) else { return nil }
        return CGImage(width: width,
                       height: height,
                       bitsPerComponent: 8,
                       bitsPerPixel: 32,
                       bytesPerRow: bytesPerRow,
                       space: colorSpace,
                       bitmapInfo: bitmapInfo,
                       provider: provider,
                       decode: nil,
                       shouldInterpolate: true,
                       intent: .defaultIntent)
    }

    // MARK: Internals

    private func refreshCameraTexture() {
        lock.lock()
        let pixelBuffer = pendingPixelBuffer
        pendingPixelBuffer = nil
        lock.unlock()

        guard let pixelBuffer, let cache = textureCache else { return }
        let width = CVPixelBufferGetWidth(pixelBuffer)
        let height = CVPixelBufferGetHeight(pixelBuffer)
        var ref: CVMetalTexture?
        let status = CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, cache, pixelBuffer, nil,
                                                               .bgra8Unorm, width, height, 0, &ref)
        guard status == kCVReturnSuccess, let ref, let texture = CVMetalTextureGetTexture(ref) else { return }
        cameraTextureRef = ref
        cameraTexture = texture
    }

    private func encode(into pass: MTLRenderPassDescriptor,
                        commandBuffer: MTLCommandBuffer,
                        camera: MTLTexture,
                        drawableSize: CGSize) {
        let cameraSize = CGSize(width: camera.width, height: camera.height)
        let time = elapsed
        var frame = inputs?(drawableSize, cameraSize, time) ?? FrameInputs(uniforms: PeteUniforms(), hotspots: [])

        frame.uniforms.resolution = SIMD2<Float>(Float(drawableSize.width), Float(drawableSize.height))
        frame.uniforms.textureSize = SIMD2<Float>(Float(cameraSize.width), Float(cameraSize.height))
        frame.uniforms.time = time

        // Metal wants a non-empty buffer even when there is nothing to light up.
        var hotspots = Array(frame.hotspots.prefix(Int(PETE_MAX_HOTSPOTS)))
        frame.uniforms.hotspotCount = Int32(hotspots.count)
        if hotspots.isEmpty { hotspots = [PeteHotspot()] }

        guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return }
        encoder.label = "Pete's eye"
        encoder.setRenderPipelineState(pipeline)
        encoder.setFragmentTexture(camera, index: 0)
        encoder.setFragmentBytes(&frame.uniforms, length: MemoryLayout<PeteUniforms>.stride, index: 0)
        hotspots.withUnsafeBytes { raw in
            encoder.setFragmentBytes(raw.baseAddress!, length: raw.count, index: 1)
        }
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()
    }
}
