# Surfer Pete's Eye

An iPhone camera that sees the world the way Surfer Pete does. Once a jacked
ladies-man surfer, now ninety, a few head wounds down, living in a shed on
Eleuthera, spearing his own fish and hunting crabs by torchlight, and everything
is beautiful. The camera feed runs through one Metal shader (flow, vibrancy, neon
edges, sun), Vision names what it sees in Pete's words, and your hands turn into
crabs.

The plan and the reasoning live in
`docs/plans/2026-09-21-003-feat-surfer-petes-eye-ios-app.md` at the repo root.

## Run it

You need a Mac with Xcode 16, a real iPhone (the simulator has no camera), and
[XcodeGen](https://github.com/yonaskolb/XcodeGen).

```sh
brew install xcodegen
cd apps/surfer-petes-eye
Scripts/fetch_model.sh        # optional, gives Pete boxes around things
xcodegen generate
open SurferPetesEye.xcodeproj
```

In Xcode pick your team under Signing & Capabilities (or set `DEVELOPMENT_TEAM` in
`project.yml`), choose your phone, run. Tests run on the simulator with Cmd-U.

Without a model the app still works: Apple's built-in scene classifier gives Pete
whole-frame tags ("the big blue", "happy juice") instead of boxes.

## Where things are

| Folder | What lives there |
| --- | --- |
| `SurferPetesEye/Pete/` | The persona. `PeteLexicon` names things, `PeteMood` colors the world, `PeteSayings` talks. Edit these first. |
| `SurferPetesEye/Rendering/PeteShaders.metal` | The eye. Every visual number is in `peteFragment`, in order, with comments. |
| `SurferPetesEye/Perception/` | Vision: object detector, hand gesture classifier, and the tracker that keeps tags steady. |
| `SurferPetesEye/Overlay/` | Tags, the crab, the HANG LOOSE burst, ripples. |
| `SurferPetesEye/App/PeteSession.swift` | Wires camera, renderer, perception and motion together. |
| `SurferPetesEye/Camera/FrameGeometry.swift` | Coordinate math between Vision, the frame, and the screen. |

## Staying snappy and cool

The camera runs at 720p and a locked 30 fps, with no wide color and no CPU
rotation (the shader turns the frame). The heavy noise math runs once per frame
in a 160 px wide pass; the full-res pass mostly reads textures. A governor
watches the phone's thermal state and Low Power Mode and steps render scale,
frame rate and detection cadence down before iOS has to throttle. You will see
"easing off" or "cooling down" next to the eyes label when it kicks in.

## Tuning Pete

- More or less Pete: the slider, or `PeteWorld.intensity` default.
- Sharper or softer picture: `PerformanceGovernor.Tier.renderScale` (0.75 at full).
- Camera feed: `CameraManager.preset` and `frameRate`.
- How fast the world flows: `swirlAmount` and the `t *` factors in the shader.
- How long tags linger: `SightingTracker.timeToLive`.
- How sure the model must be: `CoreMLObjectDetector(minimumConfidence:)`.
- New words: add a row to `PeteLexicon.table`, or a word rule below it.

## Gestures

| You do | Pete sees |
| --- | --- |
| Crab pinch (thumb and index out, other fingers curled) | A crab, pinching |
| Shaka | HANG LOOSE |
| Peace sign | PEACE, BRAH |
| Open palm | Ripples |

The classifier is pure geometry in `HandGestureClassifier` and has tests with
synthetic hands, so thresholds can be tuned without a phone.

## Notes

- Everything runs on the phone. No network calls anywhere in the app.
- Ultralytics YOLO models are AGPL licensed. Apple's YOLOv3 models are not.
- This was scaffolded without Xcode available. The first build will likely want a
  couple of small fixes.
