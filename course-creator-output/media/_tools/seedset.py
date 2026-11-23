"""seedset.py <lessonSlug> <seconds>: set durationSeconds of that lesson in convex/seed.ts"""
import re, sys
p = "convex/seed.ts"; s = open(p).read(); slug, sec = sys.argv[1], sys.argv[2]
i = s.index(f'slug: "{slug}"'); j = s.index("durationSeconds:", i)
assert j - i < 600, "durationSeconds not near slug"
k = s.index(",", j)
s = s[:j] + f"durationSeconds: {sec}" + s[k:]; open(p, "w").write(s); print(slug, "->", sec)
