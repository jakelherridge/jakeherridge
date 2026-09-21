import AVFoundation
import CoreVideo
import Foundation

/// Wraps AVCaptureSession and hands out BGRA pixel buffers, already rotated
/// to portrait, on a dedicated queue. Nothing here knows about Pete.
final class CameraManager: NSObject {

    typealias FrameHandler = (CVPixelBuffer) -> Void

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

        session.sessionPreset = session.canSetSessionPreset(.hd1920x1080) ? .hd1920x1080 : .hd1280x720

        guard let device = Self.camera(at: position) else { throw CameraError.noCamera }
        let deviceInput = try AVCaptureDeviceInput(device: device)
        guard session.canAddInput(deviceInput) else { throw CameraError.cannotAddInput }
        session.addInput(deviceInput)
        input = deviceInput

        output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
        output.alwaysDiscardsLateVideoFrames = true
        output.setSampleBufferDelegate(self, queue: videoQueue)
        guard session.canAddOutput(output) else { throw CameraError.cannotAddOutput }
        session.addOutput(output)

        configureConnection()
    }

    /// Portrait buffers and a mirrored selfie camera, so Vision and the
    /// shader can both treat the frame as "up is up".
    private func configureConnection() {
        guard let connection = output.connection(with: .video) else { return }
        if connection.isVideoRotationAngleSupported(90) {
            connection.videoRotationAngle = 90
        }
        if connection.isVideoMirroringSupported {
            connection.automaticallyAdjustsVideoMirroring = false
            connection.isVideoMirrored = (position == .front)
        }
    }
}

extension CameraManager: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput,
                       didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        onFrame?(pixelBuffer)
    }
}
