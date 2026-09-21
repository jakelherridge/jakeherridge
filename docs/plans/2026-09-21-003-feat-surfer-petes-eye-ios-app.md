# Surfer Pete's Eye (iPhone camera art project)

**Date:** 2026-09-21 · **Branch:** claude/surfer-petes-eye-app-5xcyl3

## The brief

Jake: an iPhone app that is just a camera with one truly crazy filter. You open it
like a camera and instantly see the world the way Surfer Pete sees it. Pete grew up
in the 80s and lived the whole surfer life: waves, beach, alcohol, a few bloody head
wounds. He is ninety now. He has lost his marbles, but his view of the world is
magic, and the app is a portal into it. Everything flows like water in colors that
are way too vibrant. Golden sunlight everywhere. Things get named in Pete's words:
every drink is "happy juice". A hand making a crab pinch turns into a crab. One giant
wild camera overlay. A perspective art project, not a utility.

## Pete (the bible)

Who he is decides every number in the shader and every word in the lexicon.

- He is never mean. Everything is beautiful, or funny, or both.
- He names things. He does not explain them.
- Short lines. He was never a talker. He was a surfer.
- The sun is always up somewhere in the frame, even indoors, even at night.
- Water everywhere. The world flows and sets roll through the frame.
- Marbles lost: hue drifts slowly, tags tilt, the world sloshes when the phone moves.
- Head wounds: the Wipeout mood. Kaleidoscope, red, extra warp. Still happy.
- Ninety years old: warm vignette, a little grain, soft focus. Not a bug.

## The experience

1. Open. The camera asks once. Then it is Pete's eye, no menus.
2. See. Flow, vibrancy, wave bands, neon edges, sun, grain, at 60 fps. One dial,
   "How much Pete?", fades from plain camera to full Pete.
3. Names. Things get tags in Pete's words: happy juice, THE STICK, land seal, the box
   of lies, a big red suggestion. Tagged regions sparkle in the shader.
4. Hands. Crab pinch becomes a crab that scuttles and pinches. Shaka shouts HANG
   LOOSE. Peace sign says PEACE, BRAH. Open palm sends ripples. A haptic thump on
   each.
5. Pete talks. One line every seven seconds, or sooner when something worth a line
   shows up ("Happy juice! Cheers, brah.").
6. Moods. Dawn Patrol, Glassy, Golden Hour, Night Sesh, Wipeout. Picked by the clock,
   cycled by tapping the pill or the palette button.
7. Keep it. The shutter renders the current frame through the eye, stamps the tags and
   creatures on top, and saves to Photos.

## Decisions (proposed, waiting on Jake)

1. **Native Swift.** SwiftUI shell, Metal for the eye, Vision for the seeing. No
   cross-platform layer, no cloud. Everything happens on the phone, nothing is
   uploaded. Camera privacy string says so.
2. **iOS 17, iPhone only, portrait only.** iOS 17 gives `@Observable` and the
   rotation API that hands Vision and Metal a portrait frame. Older phones are not
   worth the shader budget.
3. **XcodeGen spec, no committed .xcodeproj.** `project.yml` is readable and
   diffable. One command generates the project. Info.plist is generated from build
   settings.
4. **Pluggable object detection.** A bundled COCO detector (YOLO via Core ML) gives
   boxes and labels. With no model in the bundle the app falls back to Apple's scene
   classifier, which gives whole-frame tags. Same lexicon either way.
5. **Lexicon in code.** One table plus word rules in `PeteLexicon.swift`, unit
   tested. Easy to grow, easy to read, no JSON to keep in sync.
6. **Photos first, video later.** Snapshot is a single offscreen Metal render plus a
   SwiftUI overlay render. Video needs an AVAssetWriter path and is a separate unit.

## Architecture

```
AVCaptureSession (1080p BGRA, rotated to portrait, mirrored for selfie)
   |
   +--> PeteRenderer (Metal, 60 fps, main thread)
   |      CVPixelBuffer -> MTLTexture (zero copy) -> peteFragment -> drawable
   |      uniforms: intensity, motion, mood palette, sun, hotspot rects
   |
   +--> PerceptionEngine (Vision, background queues, throttled)
          objects ~8 Hz  -> SightingTracker -> PeteWorld.sightings
          hands   ~15 Hz -> HandGestureClassifier -> PeteWorld.hands
                                                        |
SwiftUI <-----------------------------------------------+
   PeteMetalView + PeteOverlayView (tags, crab, bursts) + TopStrip + ControlsBar
```

**Why Metal, not Core Image.** The eye is one fragment shader with domain warping,
HSV work, Sobel edges, a sun with rays, hotspot sparkle, vignette and grain. Core
Image would be a chain of a dozen kernels and intermediate textures. One shader is
faster, and every number lives in one file you can tune by eye.

**Why Vision.** Hand pose (21 joints, two hands) and the scene classifier are built
in and free. Object boxes come from any Core ML detector with NMS baked in; Vision
hands back labels and rects with no post-processing code.

**Coordinate spaces.** Vision reports normalized rects with a bottom-left origin over
the camera frame. Sightings are stored in frame space (top-left origin, normalized)
so they do not depend on the screen. `FrameGeometry` maps frame space to the
aspect-filled view, and the shader's `aspectFillUV` is the exact inverse. Tests
cover both directions.

**Threads.** Camera frames arrive on a capture queue. The renderer keeps only the
newest buffer under a lock and draws on the main thread. Perception drops frames
unless a detector is idle and its interval has passed, so a slow model never makes
the crab late. Results hop to the main actor into `PeteWorld`.

**Stability.** `SightingTracker` matches detections to existing sightings by label
and overlap, smooths boxes, keeps a sighting alive 0.7 s after the model loses it,
and never renames a thing once Pete has named it. Gestures must hold for two frames.

## Units

- U1 skeleton (this branch). Project spec, camera, Metal pass, shader v1, overlay,
  lexicon, moods, sayings, gestures, snapshot, unit tests, docs.
- U2 first light. Generate the project, run on a phone, fix whatever the compiler
  says (this was written without Xcode in the loop), then tune every shader number
  by eye against a real beach, a real kitchen, a real drink.
- U3 eyes. Fetch a detector, check the tags, tune confidence and tracker smoothing.
  Decide whether YOLOv3Tiny is good enough or YOLO11n earns its license.
- U4 hands. Gesture thresholds on real hands, both cameras. A proper art pass on
  the crab. Maybe the hand itself gets a claw-shaped mask.
- U5 voice. Pete out loud: `AVSpeechSynthesizer` slowed down, or recorded lines.
- U6 keep it. Video recording from the Metal texture, share sheet, maybe a live
  photo.
- U7 ship. Icon, TestFlight for friends, App Store if it wants to go there.

## Performance budget

| Thing | Target | Lever |
| --- | --- | --- |
| Render | 60 fps on iPhone 12 and up | `renderScale` 0.75 in `PeteMetalView`; fbm octaves in the shader |
| Object detection | 8 Hz, under 40 ms on the Neural Engine | model choice; `objectInterval` |
| Hand pose | 15 Hz, under 20 ms | `handInterval`; `maximumHandCount` |
| Memory | one live camera buffer plus one Metal texture | renderer keeps only the newest frame |
| Battery | a beach afternoon | 1080p not 4K; detection throttled; no work when backgrounded |

## Repo layout

```
apps/surfer-petes-eye/
  project.yml                 XcodeGen spec (generates SurferPetesEye.xcodeproj)
  Scripts/fetch_model.sh      grabs a Core ML detector into Resources/Models
  SurferPetesEye/
    App/         entry point, PeteWorld (state), PeteSession (wiring), MotionSampler
    Camera/      CameraManager (AVFoundation), FrameGeometry (coordinate spaces)
    Rendering/   PeteRenderer, PeteMetalView, PeteShaders.metal, ShaderTypes.h
    Perception/  detectors, hand gesture classifier, SightingTracker, PerceptionEngine
    Pete/        PeteLexicon, PeteMood, PeteSayings (the persona lives here)
    Overlay/     tags, CrabView, gesture bursts, ripples
    UI/          ContentView, CameraScreen, ControlsBar, PermissionView
    Capture/     SnapshotSaver
    Resources/   asset catalog, Models/ (gitignored model files)
  SurferPetesEyeTests/        lexicon, gestures, geometry, tracker
```

## Open questions for Jake

1. Does Pete talk out loud, or only in captions? Voice changes the feel a lot and
   needs either a synthesized voice or recorded lines.
2. How recognizable should the real world stay at full Pete? Right now full
   intensity still shows the scene underneath the flow. Wipeout mood goes further.
3. Photos only, or video too, for v1?
4. Detector license: Apple's YOLOv3 is fine to bundle. Ultralytics YOLO11 is
   sharper but AGPL. Does that matter for an art project you might put on the store?
5. Does the lexicon need a second voice pass from you? The table is a starting
   draft in Pete's register. Any words Pete would never say?
6. Any real-Pete lore worth baking in (a home break, a year, a board name, a dog)?
   The sayings have placeholders like Trestles and 1983.
7. Minimum device. iOS 17 covers iPhone XS and up, but the shader wants an A14 or
   better to hold 60 fps. Fine to say iPhone 12 and up?

## Notes

- Written without a Mac in the loop. Expect a handful of compiler nits on the first
  build; the structure and the math were checked by hand and the pure parts have
  tests.
- The Apple model download URLs in `Scripts/fetch_model.sh` could not be verified
  from the sandbox (its proxy blocks that host). If they have moved, the models page
  on developer.apple.com has the same files.
- Voice rules hold for all copy: plain, short sentences, no em or en dashes.
