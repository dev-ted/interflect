"""Usage: transcript.py <lesson.md> <media/slug dir>
Needs <slug>/slides/align.json with per-word times (align.py). Writes <slug>/transcript.json
({paragraphs:[{start,text}], cues:[{start,end,text}]}) and <slug>/captions.vtt for checking."""
import json, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).parent
MAX_LINE, MAX_CUE_S = 42, 6.0

md, out = sys.argv[1], pathlib.Path(sys.argv[2])
say = json.loads(subprocess.check_output([sys.executable, HERE / "say.py", md]))
times = json.load(open(out / "slides/align.json"))["words"]
mp3 = out / "narration.mp3"
D = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]))
log = subprocess.run(["ffmpeg", "-i", mp3, "-af", "silencedetect=noise=-38dB:d=0.2", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
sil = list(zip(map(float, re.findall(r"silence_start: ([\d.]+)", log)), map(float, re.findall(r"silence_end: ([\d.]+)", log))))

paras = [p for b in say["blocks"] for p in b.split("\n\n")]
words = [w for p in paras for w in p.split()]
assert len(words) == len(times), (len(words), len(times))

# fill words whisper didn't match by spreading them between their known neighbours
i = 0
while i < len(times):
    if times[i] is not None:
        i += 1; continue
    j = i
    while j < len(times) and times[j] is None: j += 1
    a = times[i - 1][1] if i else 0.0
    b = times[j][0] if j < len(times) else D
    step = (b - a) / (j - i)
    for k in range(i, j): times[k] = [a + step * (k - i), a + step * (k - i + 1)]
    i = j

def speech_resumes(t):
    """Whisper starts drift ~0.5-1s; snap to the end of the pause right around the word."""
    near = [e for s, e in sil if -0.6 <= e - t <= 1.0]
    return min(near, key=lambda e: abs(e - t)) - 0.05 if near else t

def wrap(text):
    if len(text) <= MAX_LINE: return text
    spaces = [m.start() for m in re.finditer(" ", text)]
    cut = min(spaces, key=lambda p: abs(p - len(text) / 2))
    return text[:cut] + "\n" + text[cut + 1:]

paragraphs, cues, w = [], [], 0
for p in paras:
    pw = p.split(); pt = times[w:w + len(pw)]; w += len(pw)
    paragraphs.append({"start": round(max(0.0, speech_resumes(pt[0][0])), 2), "text": p})
    cur = []
    for k, (word, t) in enumerate(zip(pw, pt)):
        text = " ".join(x for x, _ in cur)
        left = len(pw) - k  # this word and the rest of the paragraph
        if cur and len(text) + 1 + len(word) > 2 * MAX_LINE and left > 2:  # never strand 1-2 words
            # prefer to break after the last comma, so a clause stays on one cue
            cut = max((j for j in range(1, len(cur)) if cur[j - 1][0][-1] in ",;:"
                       and len(" ".join(x for x, _ in cur[:j])) >= 25), default=len(cur))
            cues.append(cur[:cut]); cur = cur[cut:]
        cur.append((word, t))
        text = " ".join(x for x, _ in cur)
        dur = t[1] - cur[0][1][0]
        last = k == len(pw) - 1
        if last or (word[-1] in ".?!" and len(text) >= 25) or (word[-1] in ",;:" and len(text) >= 50) \
                or (dur > MAX_CUE_S and len(text) >= 30 and left > 3):
            cues.append(cur); cur = []

out_cues = []
for c in cues:
    raw = c[0][1][0]
    snapped = speech_resumes(raw)
    start = max(0.0, snapped if snapped < c[0][1][1] - 0.1 else raw)
    if out_cues: start = max(start, out_cues[-1]["start"] + 0.3)
    out_cues.append({"start": round(start, 2), "end": round(c[-1][1][1] + 0.3, 2), "text": wrap(" ".join(x for x, _ in c))})
for a, b in zip(out_cues, out_cues[1:]):
    a["end"] = round(min(a["end"], b["start"]), 2)
out_cues[-1]["end"] = round(min(out_cues[-1]["end"], D), 2)

assert all(c["end"] > c["start"] for c in out_cues)
assert all(len(line) <= MAX_LINE + 12 for c in out_cues for line in c["text"].split("\n"))
assert "\n\n".join(p["text"] for p in paragraphs) == say["tts"]

json.dump({"paragraphs": paragraphs, "cues": out_cues}, open(out / "transcript.json", "w"), indent=1, ensure_ascii=False)
fmt = lambda s: f"{int(s // 3600):02}:{int(s % 3600 // 60):02}:{s % 60:06.3f}"
(out / "captions.vtt").write_text("WEBVTT\n\n" + "\n\n".join(f"{fmt(c['start'])} --> {fmt(c['end'])}\n{c['text']}" for c in out_cues) + "\n")
lines = [len(l) for c in out_cues for l in c["text"].split("\n")]
print(json.dumps({"slug": say["slug"], "paragraphs": len(paragraphs), "cues": len(out_cues), "maxLine": max(lines),
                  "maxCueSeconds": round(max(c["end"] - c["start"] for c in out_cues), 2)}))
