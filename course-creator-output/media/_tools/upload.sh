#!/bin/bash
# upload.sh <courseSlug> <lessonSlug> <mp4>  (durationSeconds is page time, never the video length) — skips if the lesson already has a stored video
set -euo pipefail
cd /Users/teddy/Developer/lms
c=$1 l=$2 f=$3
cur=$(npx convex run ${CONVEX_FLAGS:-} courses:getLessonBySlug "{\"courseSlug\":\"$c\",\"lessonSlug\":\"$l\"}" | python3 -c "import json,sys;x=json.load(sys.stdin)['lesson'];print(x.get('videoFileUrl'))")
[ "$cur" != "None" ] && [ -z "${REPLACE:-}" ] && { echo "SKIP: $l already has $cur"; exit 0; }
url=$(npx convex run ${CONVEX_FLAGS:-} files:createUploadUrl | tr -d '"')
sid=$(curl -sS -X POST -H "Content-Type: video/mp4" --data-binary "@$f" "$url" | python3 -c "import json,sys;print(json.load(sys.stdin)['storageId'])")
echo "storageId $sid"
npx convex run ${CONVEX_FLAGS:-} files:attachLessonVideo "{\"courseSlug\":\"$c\",\"lessonSlug\":\"$l\",\"storageId\":\"$sid\"}"
