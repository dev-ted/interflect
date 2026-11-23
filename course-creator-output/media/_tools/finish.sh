#!/bin/bash
# finish.sh <course> <lesson-file.md> <downloaded.mp3>: align, build, upload, seed, check
set -euo pipefail
M=/Users/teddy/Developer/lms/course-creator-output/media; T=$M/_tools
S=/private/tmp/claude-501/-Users-teddy-Developer-lms/b7a22698-348c-46d3-95f4-b93566445860/scratchpad
course=$1; md=/Users/teddy/Developer/lms/course-creator-output/03-lessons/$course/$2; dl=$3
slug=$(python3 $T/say.py "$md" | python3 -c "import json,sys;print(json.load(sys.stdin)['slug'])")
mkdir -p $M/$slug; mv "$dl" $M/$slug/narration.mp3
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,sample_rate -of compact $M/$slug/narration.mp3
python3 $T/say.py "$md" > $S/say-$slug.json
$S/venv/bin/python $T/align.py $M/$slug/narration.mp3 $S/say-$slug.json 2>/dev/null | tail -1 > $M/$slug/slides/align.json
cat $M/$slug/slides/align.json
cd $M && python3 $T/build.py "$md" $slug $slug/slides/align.json > $S/build-$slug.json
python3 -c "import json;d=json.load(open('$S/build-$slug.json'));print('audio',d['audio'],'mp4',d['mp4Seconds'],'dur',d['durationSeconds']);print('cuts (wordshare, final):',d['cuts'])"
$T/upload.sh $course $slug $M/$slug/$slug.mp4
$T/check.sh $course $slug $M/$slug/$slug.mp4
python3 $T/cutcheck.py $slug
