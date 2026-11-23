#!/bin/bash
# attach-transcript.sh <courseSlug> <lessonSlug>: store media/<slug>/transcript.json on the lesson
set -euo pipefail
M=/Users/teddy/Developer/lms/course-creator-output/media
cd /Users/teddy/Developer/lms
args=$(python3 -c "import json,sys;print(json.dumps({'courseSlug':sys.argv[1],'lessonSlug':sys.argv[2],'transcript':json.load(open(sys.argv[3]))}))" "$1" "$2" "$M/$2/transcript.json")
npx convex run files:attachLessonTranscript "$args"
