"""Usage (run with the faster-whisper venv python): align.py <narration.mp3> <say-json>
Prints JSON list: measured start time (s) of each Say block's first word."""
import json, re, sys, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
mp3, say = sys.argv[1], json.load(open(sys.argv[2]))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
model = WhisperModel("small.en", device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, _ = model.transcribe(audio, word_timestamps=True, beam_size=5)
heard = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
script, starts_idx, orig = [], [], []   # orig: index into script for every whitespace word (None if no letters)
for b in say["blocks"]:
    starts_idx.append(len(script))
    for w in b.split():
        orig.append(len(script) if norm(w) else None)
        if norm(w): script.append(norm(w))
sm = difflib.SequenceMatcher(None, script, [h[0] for h in heard], autojunk=False)
m = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n): m[a + k] = b + k
out = []
for i in starts_idx:
    j = next((k for k in range(i, i + 8) if k in m), None)   # first matched word of the block
    out.append(None if j is None else round(heard[m[j]][1], 3))
# per whitespace word of the script: [start, end] when whisper heard it, else null (interpolated later)
words = [[round(heard[m[i]][1], 3), round(heard[m[i]][2], 3)] if i is not None and i in m else None for i in orig]
print(json.dumps({"blockStarts": out, "matched": len(m), "scriptWords": len(script), "heardWords": len(heard), "words": words}))
