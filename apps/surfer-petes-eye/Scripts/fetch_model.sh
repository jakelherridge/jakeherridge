#!/usr/bin/env bash
# Fetches a Core ML object detector into SurferPetesEye/Resources/Models.
#
#   Scripts/fetch_model.sh            Apple's YOLOv3Tiny (about 35 MB, no Python)
#   Scripts/fetch_model.sh --full     Apple's YOLOv3 (about 248 MB, better boxes)
#   Scripts/fetch_model.sh --yolo11   Ultralytics YOLO11n exported with pip (best;
#                                     needs Python 3.9+; AGPL licensed)
#
# The Apple URLs come from developer.apple.com/machine-learning/models. They
# were not reachable from the sandbox this script was written in, so if one
# 404s, grab the file from that page by hand and drop it in the Models folder.
#
# Afterwards run `xcodegen generate` so Xcode compiles the model into the app.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="SurferPetesEye/Resources/Models"
mkdir -p "$DEST"
MODE="${1:-tiny}"

case "$MODE" in
  --full|full)
    URL="https://ml-assets.apple.com/coreml/models/Image/ObjectDetection/YOLOv3/YOLOv3.mlmodel"
    NAME="YOLOv3.mlmodel"
    ;;
  --yolo11|yolo11)
    python3 -m pip install --quiet --upgrade ultralytics
    python3 - <<'PY'
from ultralytics import YOLO
model = YOLO("yolo11n.pt")
model.export(format="coreml", nms=True, imgsz=640)
PY
    rm -rf "$DEST/yolo11n.mlpackage"
    mv -f yolo11n.mlpackage "$DEST/"
    rm -f yolo11n.pt
    echo "Saved $DEST/yolo11n.mlpackage. Now run: xcodegen generate"
    exit 0
    ;;
  *)
    URL="https://ml-assets.apple.com/coreml/models/Image/ObjectDetection/YOLOv3Tiny/YOLOv3Tiny.mlmodel"
    NAME="YOLOv3Tiny.mlmodel"
    ;;
esac

echo "Downloading $NAME ..."
curl -fL --progress-bar "$URL" -o "$DEST/$NAME"
echo "Saved $DEST/$NAME. Now run: xcodegen generate"
