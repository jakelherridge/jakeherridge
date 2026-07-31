// Subject lift: cut the foreground out of a photo using Apple's Vision
// framework, the same segmentation behind lifting a subject out of a photo in
// Messages. Runs entirely on this Mac; nothing is uploaded anywhere, which is
// the whole reason to prefer it over a background-removal API for photos of
// family.
//
//   swift scripts/subject-lift.swift [--person] <input.jpg> <output.png>
//
// Default mode lifts whatever Vision considers the foreground, which can drag
// scenery along when it touches the subject (Haley's photo pulled a piece of
// the stove with her). --person switches to person segmentation, which masks
// people and nothing else.
//
// Requires macOS 14+. Called by scripts/stickers-build.mjs.
import Vision
import AppKit
import CoreImage

var argv = Array(CommandLine.arguments.dropFirst())
let personMode = argv.first == "--person"
if personMode { argv.removeFirst() }
guard argv.count == 2 else {
  FileHandle.standardError.write("usage: subject-lift [--person] <input> <output.png>\n".data(using: .utf8)!)
  exit(2)
}
let inURL = URL(fileURLWithPath: argv[0])
let outURL = URL(fileURLWithPath: argv[1])

guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil)
else {
  FileHandle.standardError.write("cannot read \(argv[0])\n".data(using: .utf8)!)
  exit(1)
}

func writePng(_ image: CIImage) throws {
  let ctx = CIContext()
  guard let out = ctx.createCGImage(image, from: image.extent) else {
    FileHandle.standardError.write("render failed\n".data(using: .utf8)!)
    exit(1)
  }
  let rep = NSBitmapImageRep(cgImage: out)
  guard let png = rep.representation(using: .png, properties: [:]) else {
    FileHandle.standardError.write("png encode failed\n".data(using: .utf8)!)
    exit(1)
  }
  try png.write(to: outURL)
  print("ok \(out.width)x\(out.height)")
}

let handler = VNImageRequestHandler(cgImage: cg, options: [:])

do {
  if personMode {
    let request = VNGeneratePersonSegmentationRequest()
    request.qualityLevel = .accurate
    request.outputPixelFormat = kCVPixelFormatType_OneComponent8
    try handler.perform([request])
    guard let mask = request.results?.first?.pixelBuffer else {
      FileHandle.standardError.write("no person found\n".data(using: .utf8)!)
      exit(3)
    }
    let base = CIImage(cgImage: cg)
    var maskCI = CIImage(cvPixelBuffer: mask)
    // The mask comes back at model resolution; scale it to the photo.
    let sx = base.extent.width / maskCI.extent.width
    let sy = base.extent.height / maskCI.extent.height
    maskCI = maskCI.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
    let clear = CIImage(color: CIColor(red: 0, green: 0, blue: 0, alpha: 0))
      .cropped(to: base.extent)
    let blend = CIFilter(name: "CIBlendWithMask", parameters: [
      kCIInputImageKey: base,
      kCIInputBackgroundImageKey: clear,
      kCIInputMaskImageKey: maskCI,
    ])!
    guard let outCI = blend.outputImage else {
      FileHandle.standardError.write("blend failed\n".data(using: .utf8)!)
      exit(1)
    }
    try writePng(outCI)
  } else {
    let request = VNGenerateForegroundInstanceMaskRequest()
    try handler.perform([request])
    guard let result = request.results?.first, !result.allInstances.isEmpty else {
      FileHandle.standardError.write("no foreground subject found\n".data(using: .utf8)!)
      exit(3)
    }
    let buffer = try result.generateMaskedImage(
      ofInstances: result.allInstances,
      from: handler,
      croppedToInstancesExtent: false
    )
    try writePng(CIImage(cvPixelBuffer: buffer))
  }
} catch {
  FileHandle.standardError.write("vision failed: \(error)\n".data(using: .utf8)!)
  exit(1)
}
