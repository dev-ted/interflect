#!/bin/bash
# render.sh <slug>: build slides from lessons/<slug>.py, render PNGs, make two contact sheets in scratchpad
set -e; M=/Users/teddy/Developer/lms/course-creator-output/media; S=/private/tmp/claude-501/-Users-teddy-Developer-lms/b7a22698-348c-46d3-95f4-b93566445860/scratchpad
cd $M && python3 _tools/lessons/$1.py $1
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for h in $1/slides/*.html; do "$C" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="$M/${h%.html}.png" "file://$M/$h" >/dev/null 2>&1; done
cd $1/slides; ls [0-9][0-9].png > /dev/null; pngs=($(ls [0-9][0-9].png))
bash $S/sheet.sh . $S/a.png "${pngs[@]:0:4}"; rest=("${pngs[@]:4:4}"); [ ${#rest[@]} -eq 4 ] && bash $S/sheet.sh . $S/b.png "${rest[@]}"
[ ${#pngs[@]} -gt 8 ] && ffmpeg -v error -y -i "${pngs[8]}" -vf scale=960:540 $S/c.png; echo rendered ${#pngs[@]}
