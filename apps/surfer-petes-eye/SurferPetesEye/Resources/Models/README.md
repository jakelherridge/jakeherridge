# Models

Drop one Core ML object detector here and run `xcodegen generate` again.
The app picks up the first `.mlmodelc` in the bundle at launch. With no model
present it falls back to Apple's built-in scene classifier, which gives Pete
whole-frame tags (no boxes, no sparkle regions).

`../../Scripts/fetch_model.sh` fetches a detector for you. Models are
gitignored because they are big.

Requirements for a model to work with `CoreMLObjectDetector`:

- It must be a Vision-compatible object detector with NMS built in, so that
  Vision returns `VNRecognizedObjectObservation`. Apple's YOLOv3 family and
  Ultralytics exports with `nms=True` both qualify.
- Class names should be COCO labels (`bottle`, `cup`, `dog`, `surfboard`...).
  `PeteLexicon` maps those to Pete's names, and falls back to keyword rules
  for anything else.
