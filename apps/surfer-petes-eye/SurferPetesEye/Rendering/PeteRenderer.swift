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
/// wrapped as Metal textures with zero copies, and go out through two
/// passes in PeteShaders.metal: a postcard-sized noise field, then the eye
/// at screen resolution. Draws on the main thread as the MTKView delegate;
/// frames arrive on the camera queue and are handed over under a lock.
final class PeteRenderer: NSObject, MTKViewDelegate {

    struct FrameInputs {
        var uniforms: PeteUniforms
        var hotspots: [PeteHotspot]
    }

    /// Width of the noise field in pixels. Height follows the drawable's
    /// aspect. Noise this smooth does not need more.
    static let fieldWidth = 160

    let device: MTLDevice
    private let commandQueue: MTLCommandQueue
    private let eyePipeline: MTLRenderPipelineState
    private let fieldPipeline: MTLRenderPipelineState
    private var textureCache: CVMetalTextureCache?
    private var fieldTexture: MTLTexture?

    private let lock = NSLock()
    private var pendingFrame: CameraFrame?
    private var cameraTexture: MTLTexture?
    private var cameraTextureRef: CVMetalTexture? // keeps the texture memory alive
    private var cameraOrientation: FrameOrientation = .upright
    private let epoch = CACurrentMediaTime()

    /// Called every frame on the main thread to fetch the current mood,
    /// intensity, motion and hotspots. `frameSize` is the upright camera
    /// frame in pixels. Resolution, texture size, orientation and time are
    /// filled in by the renderer.
    var inputs: ((_ drawableSize: CGSize, _ frameSize: CGSize, _ time: Float) -> FrameInputs)?

    init(device: MTLDevice) throws {
        guard let queue = device.makeCommandQueue(),
              let library = device.makeDefaultLibrary(),
              let vertex = library.makeFunction(name: "peteVertex"),
              let eye = library.makeFunction(name: "peteFragment"),
              let field = library.makeFunction(name: "peteFieldFragment")
        else { throw PeteRendererError.shaderMissing }

        let eyeDescriptor = MTLRenderPipelineDescriptor()
        eyeDescriptor.label = "Pete's eye"
        eyeDescriptor.vertexFunction = vertex
        eyeDescriptor.fragmentFunction = eye
        eyeDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm

        let fieldDescriptor = MTLRenderPipelineDescriptor()
        fieldDescriptor.label = "Pete's field"
        fieldDescriptor.vertexFunction = vertex
        fieldDescriptor.fragmentFunction = field
        fieldDescriptor.colorAttachments[0].pixelFormat = .rgba16Float

        self.device = device
        commandQueue = queue
        eyePipeline = try device.makeRenderPipelineState(descriptor: eyeDescriptor)
        fieldPipeline = try device.makeRenderPipelineState(descriptor: fieldDescriptor)
        super.init()
        CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, device, nil, &textureCache)
    }

    static func makeDefault() throws -> PeteRenderer {
        guard let device = MTLCreateSystemDefaultDevice() else { throw PeteRendererError.noMetalDevice }
        return try PeteRenderer(device: device)
    }

    // MARK: Input

    /// Called from the camera queue. Only the newest frame is kept.
    func enqueue(_ frame: CameraFrame) {
        lock.lock()
        pendingFrame = frame
        lock.unlock()
    }

    var elapsed: Float { Float(CACurrentMediaTime() - epoch) }

    /// Upright frame size in pixels, or zero before the first frame.
    var frameSize: CGSize {
        guard let texture = cameraTexture else { return .zero }
        return cameraOrientation.uprightSize(forBufferSize: CGSize(width: texture.width, height: texture.height))
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
        retainCameraFrame(until: commandBuffer)
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }

    /// The CVMetalTexture owns the pixel buffer's pool slot. Hold it until
    /// the GPU has finished reading, or the camera can recycle the buffer
    /// mid-draw and tear the frame.
    private func retainCameraFrame(until commandBuffer: MTLCommandBuffer) {
        let keep = cameraTextureRef
        commandBuffer.addCompletedHandler { _ in
            _ = keep
        }
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
        let frame = pendingFrame
        pendingFrame = nil
        lock.unlock()

        guard let frame, let cache = textureCache else { return }
        let pixelBuffer = frame.pixelBuffer
        let width = CVPixelBufferGetWidth(pixelBuffer)
        let height = CVPixelBufferGetHeight(pixelBuffer)
        var ref: CVMetalTexture?
        let status = CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, cache, pixelBuffer, nil,
                                                               .bgra8Unorm, width, height, 0, &ref)
        guard status == kCVReturnSuccess, let ref, let texture = CVMetalTextureGetTexture(ref) else { return }
        cameraTextureRef = ref
        cameraTexture = texture
        cameraOrientation = frame.orientation
    }

    private func ensureFieldTexture(for drawableSize: CGSize) -> MTLTexture? {
        let width = Self.fieldWidth
        let aspect = drawableSize.width > 0 ? drawableSize.height / drawableSize.width : 2
        let height = max(1, Int((CGFloat(width) * aspect).rounded()))
        if let existing = fieldTexture, existing.width == width, existing.height == height {
            return existing
        }
        let descriptor = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .rgba16Float,
                                                                  width: width,
                                                                  height: height,
                                                                  mipmapped: false)
        descriptor.usage = [.renderTarget, .shaderRead]
        descriptor.storageMode = .private
        let texture = device.makeTexture(descriptor: descriptor)
        texture?.label = "Pete's field"
        fieldTexture = texture
        return texture
    }

    private func encode(into pass: MTLRenderPassDescriptor,
                        commandBuffer: MTLCommandBuffer,
                        camera: MTLTexture,
                        drawableSize: CGSize) {
        let textureSize = CGSize(width: camera.width, height: camera.height)
        let orientation = cameraOrientation
        let frameSize = orientation.uprightSize(forBufferSize: textureSize)
        let time = elapsed
        var frame = inputs?(drawableSize, frameSize, time) ?? FrameInputs(uniforms: PeteUniforms(), hotspots: [])

        frame.uniforms.resolution = SIMD2<Float>(Float(drawableSize.width), Float(drawableSize.height))
        frame.uniforms.textureSize = SIMD2<Float>(Float(textureSize.width), Float(textureSize.height))
        frame.uniforms.frameSize = SIMD2<Float>(Float(frameSize.width), Float(frameSize.height))
        frame.uniforms.frameOrientation = orientation.rawValue
        frame.uniforms.time = time

        // Metal wants a non-empty buffer even when there is nothing to light up.
        var hotspots = Array(frame.hotspots.prefix(Int(PETE_MAX_HOTSPOTS)))
        frame.uniforms.hotspotCount = Int32(hotspots.count)
        if hotspots.isEmpty { hotspots = [PeteHotspot()] }

        // Pass 1: the field, at postcard size.
        if let field = ensureFieldTexture(for: drawableSize) {
            let fieldPass = MTLRenderPassDescriptor()
            fieldPass.colorAttachments[0].texture = field
            fieldPass.colorAttachments[0].loadAction = .dontCare
            fieldPass.colorAttachments[0].storeAction = .store
            if let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: fieldPass) {
                encoder.label = "Pete's field"
                encoder.setRenderPipelineState(fieldPipeline)
                encoder.setFragmentBytes(&frame.uniforms, length: MemoryLayout<PeteUniforms>.stride, index: 0)
                encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
                encoder.endEncoding()
            }
        }

        // Pass 2: the eye.
        guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return }
        encoder.label = "Pete's eye"
        encoder.setRenderPipelineState(eyePipeline)
        encoder.setFragmentTexture(camera, index: 0)
        encoder.setFragmentTexture(fieldTexture, index: 1)
        encoder.setFragmentBytes(&frame.uniforms, length: MemoryLayout<PeteUniforms>.stride, index: 0)
        hotspots.withUnsafeBytes { raw in
            encoder.setFragmentBytes(raw.baseAddress!, length: raw.count, index: 1)
        }
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()
    }
}
