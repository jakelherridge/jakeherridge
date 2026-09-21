import CoreML
import CoreVideo
import Foundation
import Vision

/// One thing the model saw. `visionRect` is nil for whole-frame labels.
struct RawDetection: Equatable {
    let label: String
    let confidence: Float
    let visionRect: CGRect?
}

protocol ObjectDetector: AnyObject {
    var name: String { get }
    func detect(in pixelBuffer: CVPixelBuffer) throws -> [RawDetection]
}

/// Runs whatever Core ML object detector is bundled (see Resources/Models).
/// Expects a model with NMS built in so Vision returns recognized objects
/// with labels and boxes.
final class CoreMLObjectDetector: ObjectDetector {
    let name: String
    private let request: VNCoreMLRequest
    private let minimumConfidence: Float

    init?(minimumConfidence: Float = 0.35) {
        guard let url = Bundle.main.urls(forResourcesWithExtension: "mlmodelc", subdirectory: nil)?.first else {
            return nil
        }
        let config = MLModelConfiguration()
        config.computeUnits = .all
        guard let model = try? MLModel(contentsOf: url, configuration: config),
              let visionModel = try? VNCoreMLModel(for: model)
        else { return nil }

        let request = VNCoreMLRequest(model: visionModel)
        request.imageCropAndScaleOption = .scaleFill
        self.request = request
        self.minimumConfidence = minimumConfidence
        name = url.deletingPathExtension().lastPathComponent
    }

    func detect(in pixelBuffer: CVPixelBuffer) throws -> [RawDetection] {
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
        try handler.perform([request])
        let observations = (request.results as? [VNRecognizedObjectObservation]) ?? []
        return observations.compactMap { observation in
            guard let top = observation.labels.first, top.confidence >= minimumConfidence else { return nil }
            return RawDetection(label: top.identifier, confidence: top.confidence, visionRect: observation.boundingBox)
        }
    }
}

/// Fallback when no model is bundled. Apple's built-in classifier names the
/// whole scene ("beach", "beer", "dog") without boxes.
final class SceneClassifierDetector: ObjectDetector {
    let name = "scene classifier"
    private let request = VNClassifyImageRequest()
    private let minimumConfidence: Float
    private let maximumLabels: Int

    init(minimumConfidence: Float = 0.3, maximumLabels: Int = 3) {
        self.minimumConfidence = minimumConfidence
        self.maximumLabels = maximumLabels
    }

    func detect(in pixelBuffer: CVPixelBuffer) throws -> [RawDetection] {
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
        try handler.perform([request])
        let observations = request.results ?? []
        return observations
            .filter { $0.confidence >= minimumConfidence }
            .prefix(maximumLabels)
            .map { RawDetection(label: $0.identifier, confidence: $0.confidence, visionRect: nil) }
    }
}

enum ObjectDetectorFactory {
    static func make() -> ObjectDetector {
        if let coreML = CoreMLObjectDetector() {
            return coreML
        }
        return SceneClassifierDetector()
    }
}
