"""cutcheck.py <slug>: every slide cut must sit inside a measured pause in narration.mp3"""
import json, re, subprocess, sys, pathlib
d = pathlib.Path(__file__).parents[1] / sys.argv[1]
cuts = json.load(open(d / "slides/durations.json"))["cuts"]
log = subprocess.run(["ffmpeg", "-i", d / "narration.mp3", "-af", "silencedetect=noise=-38dB:d=0.2", "-f", "null", "-"], capture_output=True, text=True).stderr
sil = list(zip(map(float, re.findall(r"silence_start: ([\d.]+)", log)), map(float, re.findall(r"silence_end: ([\d.]+)", log))))
bad = [c for c in cuts if not any(s <= c <= e for s, e in sil)]
print(sys.argv[1], "cuts in pauses:", len(cuts) - len(bad), "/", len(cuts), "BAD:" if bad else "OK", bad or "")
