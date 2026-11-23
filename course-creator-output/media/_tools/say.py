"""Usage: say.py <lesson.md> -> prints JSON {slug, blocks:[text], counts, total, tts}"""
import json, re, sys
src = open(sys.argv[1]).read()
slug = re.search(r"\*\*Source:\*\*.*?`([^`]+)`", src).group(1)
body = src.split("## Narration only")[0]
blocks = []
for part in body.split("**Say:**")[1:]:
    text = re.split(r"\n\*\*On screen:\*\*|\n## ", part)[0]
    paras = [" ".join(p.split()) for p in text.strip().split("\n\n") if p.strip()]
    blocks.append("\n\n".join(paras))
counts = [len(b.split()) for b in blocks]
print(json.dumps({"slug": slug, "blocks": blocks, "counts": counts, "total": sum(counts), "tts": "\n\n".join(blocks)}, indent=1))
