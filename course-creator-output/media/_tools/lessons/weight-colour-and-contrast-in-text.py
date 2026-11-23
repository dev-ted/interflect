import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Typography · Lesson 3"
ROWS = [("Thandi Mokoena", "Grids and alignment", "09:41"), ("Sipho Dlamini", "Choosing a type scale", "11:07"), ("Ayesha Patel", "Focus states", "14:20"), ("Lerato Khumalo", "Semantic tokens", "16:58")]
TABLE = """
.tbl { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 12px 28px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.tbl table { border-collapse: collapse; width: 100%; }
.tbl th, .tbl td { text-align: left; padding: 0 28px 0 0; height: 64px; border-bottom: 1px solid #ece8de; white-space: nowrap; }
.tbl tr:last-child td { border-bottom: 0; }
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.badge { display: inline-block; font: 600 20px ui-monospace, Menlo, monospace; border-radius: 8px; padding: 4px 10px; margin-left: 10px; vertical-align: middle; }
.badge.f { background: #fef2f2; color: #b91c1c; } .badge.p { background: #ecfdf5; color: #0f766e; }
"""
def table(th_style, td_style, time_style, rows=ROWS, width=760, extra=""):
    head = f'<tr><th style="{th_style}">Learner</th><th style="{th_style}">Lesson</th><th style="{th_style}">Finished{extra}</th></tr>'
    body = "".join(f'<tr><td style="{td_style}">{a}</td><td style="{td_style}">{b}</td><td><time style="{time_style}">{c}</time></td></tr>' for a, b, c in rows)
    return f'<div class="tbl" style="width:{width}px"><table>{head}{body}</table></div>'

s1 = (K, "Not every distinction needs a new size", f"""
<div><div class="lbl2 bad">Bigger header · rows blow out</div>{table("font-size:40px;font-weight:700;height:110px", "font-size:28px", "font-size:28px", ROWS[:2], 760)}</div>
<div><div class="lbl2 accent">Same size · weight and colour</div>{table("font-size:28px;font-weight:600;color:#737373", "font-size:28px;color:#171717", "font-size:28px;color:#737373", ROWS[:2], 760)}</div>
""", TABLE + ".stage { gap: 56px; }")

def w(n, name, on):
    return f'<div class="wt{"" if on else " off"}"><span style="font-weight:{n}">Aa</span><b>{name} {n}</b><i>{"✓" if on else ""}</i></div>'
s2 = (K, "Two or three weights", f"""
<div class="spec">{w(300,"Light",False)}{w(400,"Regular",True)}{w(500,"Medium",False)}{w(600,"Semibold",True)}{w(700,"Bold",True)}{w(900,"Black",False)}</div>
<div style="width:520px"><p class="note"><b style="color:#171717">400</b> body · <b style="color:#171717">600</b> labels and emphasis · <b style="color:#171717">700</b> a few headings</p><p class="note" style="margin-top:20px">Variable font? Same rule: name a few, use those.</p></div>
""", """
.spec { display: grid; grid-template-columns: repeat(3, 280px); gap: 20px; }
.wt { background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 24px 28px; position: relative; }
.wt span { display: block; font-size: 96px; letter-spacing: -0.03em; line-height: 1.05; }
.wt b { font-size: 22px; font-weight: 600; color: #404040; }
.wt i { position: absolute; top: 20px; right: 22px; font-style: normal; color: #0f766e; font-size: 30px; font-weight: 700; }
.wt.off { opacity: .32; border-style: dashed; }
""")

def sw(hexv, name, ratio, ok):
    return f'<div class="sw"><div class="chip" style="background:{hexv}"></div><div class="txt" style="color:{hexv}">The quick brown fox</div><code>{name}</code><div class="ratio">{hexv.upper()} · {ratio}:1 <span class="badge {"p" if ok else "f"}">{"AA pass" if ok else "fails"}</span></div></div>'
s3 = (K, "Hierarchy from colour, checked", f"""
<div class="sws">{sw("#171717","--text-strong",17.93,True)}{sw("#404040","--text-default",10.37,True)}{sw("#737373","--text-muted",4.74,True)}{sw("#a3a3a3","too light",2.52,False)}</div>
<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:32px;margin:0;color:#404040">Normal text needs 4.5:1 against its <b style="color:#171717">real</b> background, hover and disabled included.</p>
""", TABLE + """
.sws { display: grid; grid-template-columns: repeat(4, 380px); gap: 24px; }
.sw { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 26px; }
.chip { height: 70px; border-radius: 12px; margin-bottom: 18px; }
.txt { font-size: 30px; font-weight: 500; margin-bottom: 14px; }
.sw code { font: 600 22px ui-monospace, Menlo, monospace; color: #404040; }
.ratio { margin-top: 10px; font: 500 22px ui-monospace, Menlo, monospace; color: #404040; }
.sw:last-child { border: 2px solid #fca5a5; }
""")

s4 = (K, "Before: timestamps you can't read", f"""
<div>{table("font-size:28px;font-weight:700", "font-size:28px", "font-size:24px;color:#a3a3a3", ROWS, 1100, '<span class="badge f">#A3A3A3 · 2.5:1 fails</span>')}</div>
""", TABLE)

s5 = (K, "After: same size, clearly secondary", f"""
<pre style="width:600px;font-size:24px;line-height:1.45"><span class="tag">th</span> {{
  font-size: <span class="val">0.875rem</span>;
  font-weight: <span class="val">600</span>;
  color: var(--text-muted);
}}
<span class="tag">td</span> {{
  font-size: <span class="val">0.875rem</span>;
  color: var(--text-strong);
}}
<span class="tag">td time</span> {{
  color: var(--text-muted);
  <span class="hl">font-variant-numeric: tabular-nums;</span>
}}</pre>
<div style="display:flex;flex-direction:column;gap:28px">
{table("font-size:26px;font-weight:600;color:#737373", "font-size:26px;color:#171717", "font-size:26px;color:#737373;font-variant-numeric:tabular-nums", ROWS, 900)}
<div class="nums"><div><div class="lbl2" style="color:#737373">Proportional</div><div class="col" style="font-variant-numeric:proportional-nums">1,111<br>8,808<br>4,141</div></div><div><div class="lbl2 accent">tabular-nums</div><div class="col" style="font-variant-numeric:tabular-nums">1,111<br>8,808<br>4,141</div></div></div>
</div>
""", TABLE + ".nums { display: flex; gap: 48px; } .col { font-size: 40px; font-weight: 600; text-align: right; background: #fff; border: 1px solid #e4e0d6; border-radius: 16px; padding: 12px 24px; line-height: 1.3; font-family: -apple-system, sans-serif; }")

s6 = (K, "Colour is never the only signal", """
<div class="errs">
  <div><div class="lbl2 bad">Colour only</div><div class="field"><label>Email</label><div class="in bad-b">thandi@example</div><p class="msg" style="color:#b91c1c">Enter an email address like name@example.com</p></div></div>
  <div><div class="lbl2 accent">Colour + icon + word</div><div class="field"><label>Email</label><div class="in bad-b">thandi@example</div><p class="msg" style="color:#b91c1c;font-weight:600"><span class="ic">!</span>Error: enter an email address like name@example.com</p></div></div>
</div>
""", TABLE + """
.errs { display: flex; gap: 56px; }
.field { width: 720px; background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 32px; }
.field label { font-size: 26px; font-weight: 600; } .in { margin-top: 10px; height: 64px; border: 2px solid #d4cfc3; border-radius: 12px; padding: 0 18px; display: flex; align-items: center; font-size: 26px; }
.bad-b { border-color: #b91c1c; } .msg { margin: 14px 0 0; font-size: 24px; display: flex; align-items: center; gap: 10px; }
.ic { width: 30px; height: 30px; border-radius: 50%; background: #b91c1c; color: #fff; display: inline-grid; place-items: center; font-size: 20px; font-weight: 800; flex: none; }
""")

s7 = (K, "Tracking: small caps open, big type tight", """
<div class="trk">
  <div class="row3"><code>+0.06em</code><span style="font-size:26px;font-weight:650;text-transform:uppercase;letter-spacing:0.06em;color:#737373">Weekly summary</span></div>
  <div class="row3"><code>−0.02em</code><span style="font-size:84px;font-weight:700;letter-spacing:-0.02em;line-height:1">Plan your week</span></div>
  <div class="row3"><code>0 · leave it</code><span style="font-size:28px;letter-spacing:0;color:#404040">Your progress saves automatically after every lesson.</span></div>
</div>
""", ".trk { display: grid; gap: 24px; width: 1300px; } .row3 { background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 30px 36px; display: flex; align-items: center; gap: 40px; } .row3 code { width: 200px; flex: none; font: 600 26px ui-monospace, Menlo, monospace; color: #0f766e; }")

s8 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Two or three weights</p>
  <p><span>2</span>Check contrast on the real background</p>
  <p><span>3</span>Colour is never the only signal</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next course: focus, the right element, and labels</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8])
