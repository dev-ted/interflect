import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Typography · Lesson 2"
P = ("Your progress saves automatically after every lesson. If you switch devices, sign in with the same account and pick up "
     "where you stopped. Quiz results stay with the lesson, so you can retake a quiz at any time without losing your earlier score. "
     "Streaks count any day with at least ten minutes of learning.")
BROWSER = """
.win { background: #fff; border: 1px solid #e4e0d6; border-radius: 18px; box-shadow: 0 18px 50px rgba(23,23,23,.06); overflow: hidden; }
.bar { height: 36px; background: #ece8de; display: flex; align-items: center; gap: 8px; padding: 0 16px; }
.bar i { width: 12px; height: 12px; border-radius: 50%; background: #d6d1c4; }
.doc { padding: 28px 32px; position: relative; }
.doc h3 { margin: 0 0 12px; font-size: 26px; letter-spacing: -0.02em; }
.doc p { margin: 0; color: #404040; }
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; }
"""
s1 = (K, "Good font, good size, still tiring", f"""
<div class="win" style="width:1600px"><div class="bar"><i></i><i></i><i></i></div>
<div class="doc"><h3>Saving your progress</h3><p style="font-size:19px;line-height:2.4">{P} {P}</p>
<svg class="sweep" viewBox="0 0 1540 26" width="1540" height="26"><path d="M1520 3 C 1100 26, 400 26, 22 18" fill="none" stroke="#b91c1c" stroke-width="4" stroke-dasharray="10 8"/><polygon points="10,18 30,9 30,26" fill="#b91c1c"/></svg>
<span class="counter">≈ 180 characters per line</span></div></div>
""", BROWSER + ".sweep { position: absolute; left: 32px; top: 104px; } .counter { position: absolute; right: 32px; top: -2px; background: #b91c1c; color: #fff; font: 600 22px ui-monospace, Menlo, monospace; border-radius: 10px; padding: 6px 12px; }")

def col(ch, label, cls, note):
    return f'<div><div class="lbl2 {cls}">{label} · <span style="color:#404040">{note}</span></div><div class="card" style="padding:24px 28px"><p style="max-width:{ch}ch;margin:0;font-size:18px;line-height:1.5;color:#404040">{P}</p></div></div>'
s2 = (K, "45 to 75 characters a line", f"""<div style="display:grid;grid-template-columns:auto auto;gap:36px 40px;align-items:start">
{col(30, "30 ch", "bad", "choppy")}<div style="display:grid;gap:36px">{col(65, "65 ch", "accent", "comfortable")}{col(110, "110 ch", "bad", "hard to find the next line")}</div></div>
<svg style="position:absolute;right:150px;top:700px" width="0" height="0"></svg>""", """
.card { border-radius: 20px; width: fit-content; }
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; }
""")

s3 = (K, "A unit made for the measure", """
<pre style="width:640px;font-size:40px"><span class="tag">.prose</span> {
  max-width: <span class="hl">65ch</span>;
}</pre>
<div style="width:640px"><div class="zero">0</div><p class="note" style="font-size:34px;margin-top:20px"><b>1ch</b> = the width of “0” in the current font.</p><p class="note" style="margin-top:12px">65ch follows the typeface, not a pixel guess.</p></div>
""", ".zero { display: inline-block; font-size: 220px; font-weight: 600; line-height: 1; border-left: 4px solid #0f766e; border-right: 4px solid #0f766e; padding: 0; }")

def layout(after):
    if after:
        body = f'<div style="display:flex;gap:28px;justify-content:center"><div><h3>Saving your progress</h3><p style="max-width:65ch;font-size:15px;line-height:1.5">{P} {P}</p></div><div class="side"></div></div>'
    else:
        body = f'<h3>Saving your progress</h3><p style="font-size:15px;line-height:1.5">{P} {P}</p>'
    return f'<div class="win" style="width:800px"><div class="bar"><i></i><i></i><i></i><span class="w">1440px</span></div><div class="doc" style="height:300px">{body}</div></div>'
s4 = (K, "Same content, easier to read", f"""
<div><div class="lbl2 bad">Before · full width, ~180 ch</div>{layout(False)}</div>
<div><div class="lbl2 accent">After · 65ch, centred, sidebar beside</div>{layout(True)}</div>
""", BROWSER + ".stage { gap: 48px; } .w { margin-left: auto; font: 500 16px ui-monospace, Menlo, monospace; color: #737373; } .side { width: 150px; flex: none; border-radius: 12px; background: #f3f0e8; border: 1px solid #e4e0d6; } .doc h3 { font-size: 22px; }")

def samp(label, size, lh, text, cls=""):
    return f'<div class="sm"><div class="tag2 {cls}">{label} · line-height {lh}</div><div style="font-size:{size}px;line-height:{lh};font-weight:{700 if size > 30 else 400};letter-spacing:{"-0.03em" if size > 30 else "0"};max-width:620px;color:{"#737373" if size < 18 else "#171717"}">{text}</div></div>'
s5 = (K, "Tighter line height as size grows", f"""
<div style="display:grid;grid-template-columns:1fr 1fr;gap:28px 64px;width:1450px">
{samp("Heading", 52, 1.5, "Pick up where you stopped last time", "bad")}
{samp("Heading", 52, 1.15, "Pick up where you stopped last time", "accent")}
{samp("Body", 22, 1.5, "Your progress saves automatically after every lesson. If you switch devices, sign in with the same account and pick up where you stopped.")}
{samp("Caption", 16, 1.4, "Quiz results stay with the lesson, so you can retake a quiz at any time without losing your earlier score. Streaks count any day with at least ten minutes of learning.")}
</div>
<pre style="position:absolute;right:112px;bottom:64px;font-size:24px;padding:24px 32px">body {{ line-height: <span class="val">1.5</span>; }}
h1, h2 {{ line-height: <span class="val">1.15</span>; }}
.caption {{ line-height: <span class="val">1.4</span>; }}</pre>
""", ".sm { background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 24px 28px; } .tag2 { font: 600 18px ui-monospace, Menlo, monospace; color: #737373; margin-bottom: 12px; } .stage { align-items: flex-start; padding-top: 24px; } .tag2.bad { color: #b91c1c; } .tag2.accent { color: #0f766e; }")

s6 = (K, "Space above a heading, more than below", """
<div class="prose">
  <p>Your progress saves automatically after every lesson, on every device.</p><div class="gapm">1em</div>
  <p>Quiz results stay with the lesson, so you can retake a quiz any time.</p><div class="gapm big">2em</div>
  <h2>Streaks</h2><div class="gapm">1em</div>
  <p>A streak counts any day with at least ten minutes of learning.</p>
</div>
<pre style="width:720px;font-size:30px"><span class="tag">.prose</span> > <span class="hl">* + *</span> { margin-top: <span class="val">1em</span>; }
<span class="tag">.prose h2</span> { margin-top: <span class="val">2em</span>; }</pre>
""", """
.prose { width: 700px; background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 36px 40px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.prose p { margin: 0; font-size: 24px; line-height: 1.5; color: #404040; } .prose h2 { margin: 0; font-size: 34px; letter-spacing: -0.02em; line-height: 1.15; }
.gapm { height: 24px; position: relative; background: repeating-linear-gradient(135deg, rgba(15,118,110,.12) 0 6px, rgba(15,118,110,.24) 6px 9px); }
.gapm.big { height: 48px; }
.gapm::after { content: attr(class); display: none; }
.gapm { font: 600 18px ui-monospace, Menlo, monospace; color: #0f766e; text-align: right; padding-right: 8px; line-height: 24px; }
.gapm.big { line-height: 48px; }
""")

s7 = (K, "Interface text: one line, fixed height", """
<div class="ui">
  <div class="row"><span class="btn">✓ Save changes</span></div>
  <div class="row"><label>☐ Email me a weekly summary</label></div>
  <div class="row"><table><tr><td>Lessons done</td><td>12</td><td>▲ 3</td></tr></table></div>
  <div class="lines"></div>
</div>
<div style="width:520px"><p class="note" style="font-size:40px;font-weight:650;color:#171717;letter-spacing:-0.03em">16px text on a 24px line</p><p class="note" style="margin-top:16px">Measure rarely applies. Consistent line height keeps text and icons aligned, on the 8 point grid.</p></div>
""", """
.ui { position: relative; width: 720px; background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 24px 40px; display: grid; gap: 0; }
.row { position: relative; z-index: 1; font-size: 32px; line-height: 48px; height: 48px; }
.btn { display: inline-block; background: #171717; color: #fff; border-radius: 12px; padding: 0 22px; font-weight: 600; }
table { border-collapse: collapse; } td { padding: 0 32px 0 0; font-size: 32px; line-height: 48px; border-bottom: 1px solid #e4e0d6; }
.lines { position: absolute; inset: 24px 0; background: repeating-linear-gradient(rgba(236,72,153,.08) 0 47px, rgba(236,72,153,.5) 47px 48px); }
""")

s8 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>About <code>65ch</code></p>
  <p><span>2</span>Tighter line height as size grows</p>
  <p><span>3</span>More space above a heading than below</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: hierarchy from weight and colour</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8])
