import AVFoundation
import CoreVideo
import Foundation

/// Wraps AVCaptureSession and hands out raw BGRA pixel buffers on a
/// dedicated queue. Nothing here knows about Pete.
///
/// Tuned for a phone that stays cool: 720p, a locked 30 fps, no wide
/// color, and no rotation or mirroring of the buffers (see CameraFrame).
final class CameraManager: NSObject {

    typealias FrameHandler = (CameraFrame) -> Void

    /// 720p is plenty. Pete's eye blurs everything anyway, and the shader,
    /// the Vision models and the memory bus all work half as hard as at 1080p.
    static let preset: AVCaptureSession.Preset = .hd1280x720
    static let frameRate: Int32 = 30

    let session = AVCaptureSession()
    var onFrame: FrameHandler?
    private(set) var position: AVCaptureDevice.Position = .back

    private let sessionQueue = DispatchQueue(label: "pete.camera.session")
    private let videoQueue = DispatchQueue(label: "pete.camera.video", qos: .userInteractive)
    private let output = AVCaptureVideoDataOutput()
    private var input: AVCaptureDeviceInput?
    private var configured = false

    enum CameraError: Error {
        case noCamera
        case cannotAddInput
        case cannotAddOutput
    }

    // MARK: Permission

    static var authorization: AVAuthorizationStatus {
        AVCaptureDevice.authorizationStatus(for: .video)
    }

    static func requestAccess() async -> Bool {
        await AVCaptureDevice.requestAccess(for: .video)
    }

    // MARK: Lifecycle

    func configureAndStart() async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            sessionQueue.async {
                do {
                    if !self.configured {
                        try self.configure()
                        self.configured = true
                    }
                    if !self.session.isRunning {
                        self.session.startRunning()
                    }
                    continuation.resume()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    func start() {
        sessionQueue.async {
            guard self.configured, !self.session.isRunning else { return }
            self.session.startRunning()
        }
    }

    func stop() {
        sessionQueue.async {
            guard self.session.isRunning else { return }
            self.session.stopRunning()
        }
    }

    func flip() {
        sessionQueue.async {
            let next: AVCaptureDevice.Position = (self.position == .back) ? .front : .back
            self.session.beginConfiguration()
            defer { self.session.commitConfiguration() }
            guard let device = Self.camera(at: next),
                  let newInput = try? AVCaptureDeviceInput(device: device)
            else { return }
            if let old = self.input {
                self.session.removeInput(old)
            }
            if self.session.canAddInput(newInput) {
                self.session.addInput(newInput)
                self.input = newInput
                self.position = next
                Self.lockFrameRate(device)
            } else if let old = self.input, self.session.canAddInput(old) {
                self.session.addInput(old)
            }
            self.configureConnection()
        }
    }

    // MARK: Setup

    private static func camera(at position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position)
    }

    private func configure() throws {
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        session.automaticallyConfiguresCaptureDeviceForWideColor = false
        session.sessionPreset = session.canSetSessionPreset(Self.preset) ? Self.preset : .medium

        guard let device = Self.camera(at: position) else { throw CameraError.noCamera }
        let deviceInput = try AVCaptureDeviceInput(device: device)
        guard session.canAddInput(deviceInput) else { throw CameraError.cannotAddInput }
        session.addInput(deviceInput)
        input = deviceInput
        Self.lockFrameRate(device)

        output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
        output.alwaysDiscardsLateVideoFrames = true
        output.setSampleBufferDelegate(self, queue: videoQueue)
        guard session.canAddOutput(output) else { throw CameraError.cannotAddOutput }
        session.addOutput(output)

        configureConnection()
    }

    /// A steady 30 fps. Some 720p formats offer 60, which would double the
    /// work of everything downstream for no visible gain through Pete's eye.
    private static func lockFrameRate(_ device: AVCaptureDevice) {
        let duration = CMTime(value: 1, timescale: frameRate)
        let supported = device.activeFormat.videoSupportedFrameRateRanges.contains {
            $0.minFrameRate <= Double(frameRate) && Double(frameRate) <= $0.maxFrameRate
        }
        guard supported, (try? device.lockForConfiguration()) != nil else { return }
        device.activeVideoMinFrameDuration = duration
        device.activeVideoMaxFrameDuration = duration
        device.unlockForConfiguration()
    }

    /// Raw buffers, please. The shader handles orientation and mirroring.
    private func configureConnection() {
        guard let connection = output.connection(with: .video) else { return }
        if connection.isVideoRotationAngleSupported(0) {
            connection.videoRotationAngle = 0
        }
        if connection.isVideoMirroringSupported {
            connection.automaticallyAdjustsVideoMirroring = false
            connection.isVideoMirrored = false
        }
    }
}

extension CameraManager: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput,
                       didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        onFrame?(CameraFrame(pixelBuffer: pixelBuffer, orientation: FrameOrientation.forCamera(position: position)))
    }
}
