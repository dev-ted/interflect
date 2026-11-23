#!/bin/bash
# check.sh <courseSlug> <lessonSlug> <mp4>
cd /Users/teddy/Developer/lms
npx convex run courses:getLessonBySlug "{\"courseSlug\":\"$1\",\"lessonSlug\":\"$2\"}" | python3 -c "
import json,sys,subprocess,re
l=json.load(sys.stdin)['lesson']; url=l['videoFileUrl']
seed=open('convex/seed.ts').read(); i=seed.index('slug: \"$2\"'); sd=int(re.search(r'durationSeconds: (\d+)',seed[i:]).group(1))
h=subprocess.check_output(['curl','-sS','-o','/dev/null','-r','0-1023','-w','%{http_code} %{content_type}',url]).decode()
ok = url.startswith('https://expert-mule-935.convex.cloud/') and l['muxPlaybackId'] is None and l['videoUrl'] is None and l['durationSeconds']==sd and h.startswith('206 video/mp4')
print(json.dumps({'videoFileUrl':url,'muxPlaybackId':l['muxPlaybackId'],'videoUrl':l['videoUrl'],'dbDuration':l['durationSeconds'],'transcriptCues':len((l.get('transcript') or {}).get('cues',[])),'seedDuration':sd,'range':h,'PASS':ok}, indent=1))"
