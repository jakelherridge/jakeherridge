import AVFoundation
import CoreGraphics
import CoreVideo
import ImageIO

/// How a raw camera buffer relates to what the user sees.
///
/// Buffers are never rotated or mirrored on the CPU. That copy costs a
/// full frame of memory bandwidth thirty times a second and heats the
/// phone for nothing. Instead the shader turns the frame when it samples
/// it, and Vision is told which way is up so its results come back in the
/// upright frame. Same idea as Apple's AVCamFilter sample.
enum FrameOrientation: Int32, Equatable {
    /// Buffer already matches the screen.
    case upright = 0
    /// Landscape buffer from the back camera. Quarter turn clockwise to show.
    case backPortrait = 1
    /// Landscape buffer from the front camera. Same turn, then mirrored.
    case frontPortrait = 2

    var visionOrientation: CGImagePropertyOrientation {
        switch self {
        case .upright: return .up
        case .backPortrait: return .right
        case .frontPortrait: return .leftMirrored
        }
    }

    var swapsAxes: Bool { self != .upright }

    /// Size of the frame as the user sees it.
    func uprightSize(forBufferSize size: CGSize) -> CGSize {
        swapsAxes ? CGSize(width: size.height, height: size.width) : size
    }

    static func forCamera(position: AVCaptureDevice.Position) -> FrameOrientation {
        position == .front ? .frontPortrait : .backPortrait
    }
}

/// One camera frame plus the one fact needed to show it the right way up.
struct CameraFrame {
    let pixelBuffer: CVPixelBuffer
    let orientation: FrameOrientation

    var bufferSize: CGSize {
        CGSize(width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))
    }

    var uprightSize: CGSize {
        orientation.uprightSize(forBufferSize: bufferSize)
    }
}
