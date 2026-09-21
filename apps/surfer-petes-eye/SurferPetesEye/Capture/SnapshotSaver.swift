import Photos
import SwiftUI
import UIKit

enum SnapshotError: Error {
    case notAuthorized
}

/// Composites the rendered frame with the SwiftUI overlay and saves it.
@MainActor
enum SnapshotSaver {

    static func compose<Overlay: View>(base: CGImage, overlay: Overlay, size: CGSize, scale: CGFloat) -> UIImage {
        let overlayRenderer = ImageRenderer(content: overlay)
        overlayRenderer.scale = scale
        let overlayImage = overlayRenderer.uiImage

        let format = UIGraphicsImageRendererFormat()
        format.scale = scale
        return UIGraphicsImageRenderer(size: size, format: format).image { _ in
            let frame = CGRect(origin: .zero, size: size)
            UIImage(cgImage: base).draw(in: frame)
            overlayImage?.draw(in: frame)
        }
    }

    static func saveToPhotos(_ image: UIImage) async throws {
        let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        guard status == .authorized || status == .limited else { throw SnapshotError.notAuthorized }
        try await PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        }
    }
}
