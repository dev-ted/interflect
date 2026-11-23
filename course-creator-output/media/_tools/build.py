"""Usage: build.py <lesson.md> <media/slug dir> [align.json]
Renders slides/NN.html -> png, times slides by Say-block word share of the real
narration.mp3 length, snaps each cut to the nearest pause (<=1.2s away) so slides
never change mid-sentence, then muxes 1920x1080 H.264/AAC +faststart mp4."""
import json, re, subprocess, sys, pathlib
HERE = pathlib.Path(__file__).parent
md, out = sys.argv[1], pathlib.Path(sys.argv[2])
say = json.loads(subprocess.check_output([sys.executable, HERE / "say.py", md]))
slug, counts, total = say["slug"], say["counts"], say["total"]
slides = out / "slides"
htmls = sorted(slides.glob("[0-9][0-9].html"))
assert len(htmls) == len(counts), f"{len(htmls)} slides vs {len(counts)} Say blocks"
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for h in htmls:
    subprocess.run([chrome, "--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1",
                    "--window-size=1920,1080", f"--screenshot={h.with_suffix('.png')}", h.resolve().as_uri()],
                   check=True, capture_output=True)
mp3 = out / "narration.mp3"
D = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]))
# measured pauses in the narration (midpoints)
log = subprocess.run(["ffmpeg", "-i", mp3, "-af", "silencedetect=noise=-38dB:d=0.3", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
pauses = [(s + e) / 2 for s, e in zip(starts, ends)]
measured = json.load(open(sys.argv[3]))["blockStarts"][1:] if len(sys.argv) > 3 else [None] * (len(counts) - 1)
cuts, acc = [], 0
for c, m in zip(counts[:-1], measured):
    acc += c
    p = acc / total * D
    if m is not None:  # cut in the pause that ends right before the block's first spoken word
        # whisper word starts can be ~1s early or late: take the pause whose end is nearest the word start
        near = [(s0, e0) for s0, e0 in zip(starts, ends) if s0 <= m + 1.2 and e0 >= m - 0.9]
        best = min(near, key=lambda se: abs(se[1] - m), default=None)
        cut = (best[0] + best[1]) / 2 if best else m - 0.1
    else:              # fallback: word-share timing snapped to the nearest pause
        near = min(pauses, key=lambda x: abs(x - p), default=p)
        cut = near if abs(near - p) <= 1.2 else p
    cuts.append((round(p, 3), round(cut, 3)))
edges = [0] + [s for _, s in cuts] + [D]
durs = [round(b - a, 3) for a, b in zip(edges, edges[1:])]
(slides / "durations.json").write_text(json.dumps({"audioSeconds": D, "totalWords": total, "counts": counts,
    "proportionalCuts": [p for p, _ in cuts], "measuredBlockStarts": measured, "cuts": [s for _, s in cuts], "durations": durs}, indent=1))
lines = ["ffconcat version 1.0"]
for h, d in zip(htmls, durs):
    lines += [f"file '{h.with_suffix('.png').name}'", f"duration {d}"]
lines.append(f"file '{htmls[-1].with_suffix('.png').name}'")
(slides / "concat.txt").write_text("\n".join(lines) + "\n")
mp4 = out / f"{slug}.mp4"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", slides / "concat.txt", "-i", mp3,
    "-map", "0:v", "-map", "1:a", "-vf", "fps=30,scale=1920:1080,format=yuv420p", "-c:v", "libx264", "-preset", "slow",
    "-tune", "stillimage", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-t", str(D),
    "-movflags", "+faststart", mp4], check=True)
V = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]))
print(json.dumps({"slug": slug, "audio": D, "mp4": str(mp4), "mp4Seconds": V, "durationSeconds": round(V),
                  "cuts": cuts, "durations": durs}, indent=1))
