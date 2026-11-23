"""Helper: write(slug_dir, [(kicker, title, stage_html, css), ...]) -> slides/NN.html"""
import pathlib
BASE = (pathlib.Path(__file__).parent / "base.css").read_text()
def write(out, slides):
    d = pathlib.Path(out) / "slides"; d.mkdir(parents=True, exist_ok=True)
    for old in d.glob("[0-9][0-9].*"): old.unlink()
    for i, (kicker, title, stage, css) in enumerate(slides, 1):
        (d / f"{i:02}.html").write_text(f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>slide {i:02}</title>
<style>
{BASE}
{css}
</style>
<body>
<div class="frame">
  <div class="kicker">{kicker}</div>
  <h1>{title}</h1>
  <div class="stage">{stage}</div>
</div>
</body>
</html>
""")
