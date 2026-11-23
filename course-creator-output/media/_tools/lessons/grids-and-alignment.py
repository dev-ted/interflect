import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Grids · Lesson 3"
DASH = """
.dash { position: relative; width: 720px; height: 540px; background: #fff; border: 1px solid #e4e0d6; border-radius: 24px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.dash .b { position: absolute; background: #ebe7dc; border-radius: 10px; }
.dash .h { background: #171717; height: 26px; border-radius: 6px; }
.dash .f { height: 44px; background: #f3f0e8; border: 1px solid #e4e0d6; }
.dash .c { height: 130px; }
.dash .t { height: 200px; background: repeating-linear-gradient(#ebe7dc 0 30px, #fff 30px 40px); }
.guide { position: absolute; top: -24px; bottom: -24px; width: 0; border-left: 3px solid #b91c1c; opacity: .85; }
.guide.ok { border-color: #0f766e; }
.count { font-size: 120px; font-weight: 700; letter-spacing: -0.05em; line-height: 1; }
.cap { font-size: 28px; color: #404040; margin-top: 12px; }
"""
def dash(lefts, guides, ok=False):
    hl, fl, c1, c2, c3, tl = lefts
    boxes = (f'<div class="b h" style="left:{hl}px;top:40px;width:300px"></div>'
             f'<div class="b f" style="left:{fl}px;top:96px;width:{656-fl+32}px"></div>'
             f'<div class="b c" style="left:{c1}px;top:170px;width:196px"></div>'
             f'<div class="b c" style="left:{c2}px;top:170px;width:196px"></div>'
             f'<div class="b c" style="left:{c3}px;top:170px;width:{min(196, 688-c3)}px"></div>'
             f'<div class="b t" style="left:{tl}px;top:322px;width:{688-tl}px"></div>')
    g = "".join(f'<div class="guide{" ok" if ok else ""}" style="left:{x}px"></div>' for x in guides)
    return f'<div class="dash">{boxes}{g}</div>'
messy = (44, 72, 28, 268, 500, 56); messy_g = [28, 44, 56, 72, 268, 492, 500]
clean = (32, 32, 32, 260, 488, 32); clean_g = [32, 488]
s1 = (K, "A grid is a promise", dash(messy, messy_g) +
      '<div style="width:560px"><p class="note" style="font-size:40px;font-weight:650;color:#171717;letter-spacing:-0.03em;line-height:1.15">Things that look aligned really are aligned.</p><p class="note" style="margin-top:20px">At every width. With every length of content.</p></div>', DASH)
s2 = (K, "Count the left edges", f"""
<div style="text-align:center">{dash(messy, messy_g)}<div class="count bad" style="margin-top:28px">7</div><div class="cap">placed by eye</div></div>
<div style="text-align:center">{dash(clean, clean_g, True)}<div class="count accent" style="margin-top:28px">2</div><div class="cap">shared edges, calmer screen</div></div>
""", DASH + ".dash { zoom: .82; } .stage { gap: 96px; }")

def cols(spans, label):
    cells, start = "", 1
    for sp in spans:
        cells += f'<div class="span" style="grid-column:{start} / span {sp}">{sp}</div>'; start += sp
    return f'<div class="lay"><div class="lbl">{label}</div><div class="g12">{"".join("<i></i>" for _ in range(12))}{cells}</div></div>'
s3 = (K, "Twelve columns, a few spans", f"""
<div style="display:flex;flex-direction:column;gap:40px">{cols([12], "Full width")}{cols([8, 4], "Two thirds + one third")}{cols([4, 4, 4], "Three equal cards")}</div>
<div style="width:440px"><p class="note" style="font-size:34px;line-height:1.35">12 divides into halves, thirds, quarters and sixths.</p><p class="note" style="margin-top:22px;font-size:34px;color:#171717;font-weight:650">You don't need all twelve.</p></div>
""", """
.lay { width: 1020px; } .lbl { font-size: 24px; font-weight: 650; color: #737373; margin-bottom: 12px; }
.g12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; position: relative; height: 120px; }
.g12 i { grid-row: 1; background: rgba(15,118,110,.10); border-radius: 6px; }
.g12 .span { grid-row: 1; background: #0f766e; color: #fff; border-radius: 12px; display: grid; place-items: center; font-size: 40px; font-weight: 700; margin: 14px 0; }
""")

s4 = (K, "The page is the grid", """
<pre style="width:1000px;font-size:26px"><span class="tag">.page</span> {
  display: grid;
  grid-template-columns: repeat(<span class="val">12</span>, minmax(0, 1fr));
  gap: <span class="val">24px</span>;
  max-width: <span class="val">1200px</span>;
  margin-inline: auto;
  padding-inline: <span class="val">16px</span>;
}
<span class="tag">.main</span>  { grid-column: span <span class="val">8</span>; }
<span class="tag">.aside</span> { grid-column: span <span class="val">4</span>; }

<span class="tag">@media</span> (max-width: <span class="val">768px</span>) {
  <span class="tag">.main</span>, <span class="tag">.aside</span> { grid-column: 1 / -1; }
}</pre>
<div style="display:flex;gap:40px;align-items:flex-start">
  <div><div class="lbl">1200px</div><div class="pg wide"><div class="m">main · 8</div><div class="a">aside · 4</div></div></div>
  <div><div class="lbl">under 768px</div><div class="pg narrow"><div class="m">main</div><div class="a">aside</div></div></div>
</div>
""", """
.lbl { font-size: 22px; font-weight: 650; color: #737373; margin-bottom: 12px; letter-spacing: .04em; }
.pg { background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 16px; display: grid; gap: 12px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.pg div { border-radius: 10px; display: grid; place-items: center; font-size: 24px; font-weight: 650; color: #fff; }
.pg .m { background: #0f766e; } .pg .a { background: #5b9e97; }
.wide { width: 400px; height: 340px; grid-template-columns: 2fr 1fr; }
.narrow { width: 180px; height: 340px; grid-template-rows: 2fr 1fr; }
""")

URL = "https://example.com/reports/q3-insights"
s5 = (K, "minmax(0, 1fr), not 1fr", f"""
<div class="cmp"><code class="lbl bad">repeat(3, 1fr)</code><div class="gr" style="grid-template-columns:repeat(3,1fr)"><div class="u" style="overflow:visible">{URL}</div><div></div><div></div></div><p class="cap2">Content sets the minimum, so one column grows.</p></div>
<div class="cmp"><code class="lbl accent">repeat(3, <span class="hl2">minmax(0, 1fr)</span>)</code><div class="gr" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="u">{URL}</div><div></div><div></div></div><p class="cap2">Columns may shrink, so the grid stays even.</p></div>
""", """
.cmp { width: 760px; }
.lbl { display: block; font: 600 28px ui-monospace, Menlo, monospace; margin-bottom: 18px; }
.hl2 { background: rgba(15,118,110,.15); border-radius: 6px; padding: 0 6px; }
.gr { width: 760px; height: 260px !important; overflow: hidden; display: grid; gap: 12px; background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 16px; height: 220px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.gr div { background: #ebe7dc; border-radius: 10px; min-height: 0; }
.gr .u { background: #ccfbf1; font: 500 22px ui-monospace, Menlo, monospace; padding: 14px; white-space: nowrap; overflow: hidden; text-overflow: clip; color: #134e4a; }
.cap2 { font-size: 26px; color: #404040; margin: 18px 0 0; }
""")

HDR = """
.ph { width: 900px; height: 160px; background: #fff; border: 1px solid #e4e0d6; border-radius: 24px; position: relative; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.av { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #5eead4, #0f766e); }
.nm { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; }
.btn { background: #171717; color: #fff; border-radius: 12px; padding: 12px 22px; font-size: 24px; font-weight: 600; }
.base { position: absolute; left: 24px; right: 24px; height: 0; border-top: 2px dashed; }
.box { position: absolute; outline: 2px dashed #f9a8d4; display: flex; align-items: center; justify-content: center; }
"""
s6 = (K, "Before: each piece centred on its own", """
<div class="ph">
  <div class="box" style="left:32px;top:24px;width:112px;height:112px"><div class="av"></div></div>
  <div class="box" style="left:176px;top:30px;width:340px;height:90px"><span class="nm">Thandi Mokoena</span></div>
  <div class="box" style="left:560px;top:40px;width:180px;height:100px"><span class="btn">Follow</span></div>
  <div class="base" style="top:96px;border-color:#b91c1c;transform:rotate(1.1deg);transform-origin:left"></div>
</div>
<p class="note" style="position:absolute;left:112px;right:112px;bottom:96px;text-align:center;font-size:34px">Baselines don't line up. The button floats a few pixels low.</p>
""", HDR)

s7 = (K, "After: one row, one baseline", """
<pre style="width:640px;font-size:27px"><span class="tag">.profile-header</span> {
  display: flex;
  align-items: center;
  gap: <span class="val">16px</span>;
}
<span class="tag">.profile-header .meta</span> {
  display: flex;
  <span class="hl">align-items: baseline;</span>
  gap: <span class="val">8px</span>;
  flex: 1;
}</pre>
<div class="ph" style="width:760px;display:flex;align-items:center;gap:16px;padding:0 32px">
  <div class="av"></div>
  <div style="display:flex;align-items:baseline;gap:8px;flex:1;position:relative"><span class="nm">Thandi Mokoena</span><span style="flex:1"></span><span class="btn">Follow</span>
    <div class="base" style="left:-4px;right:-4px;bottom:8px;border-color:#0f766e"></div></div>
</div>
""", HDR)

s8 = (K, "Align to what people see", """
<div style="text-align:center"><div class="circ"><svg viewBox="0 0 100 100" width="110" height="110"><polygon points="30,18 30,82 85,50" fill="#171717" transform="translate(-7.5 0)"/></svg><i class="cx"></i></div><p class="cap3">Mathematically centred<br><span class="bad">looks shifted left</span></p></div>
<div style="text-align:center"><div class="circ"><svg viewBox="0 0 100 100" width="110" height="110"><polygon points="30,18 30,82 85,50" fill="#171717" transform="translate(-3 0)"/></svg><i class="cx"></i></div><p class="cap3">Nudged a little right<br><span class="accent">looks centred</span></p></div>
<pre style="width:640px;font-size:28px"><span class="tag">.play svg</span> {
  <span class="dim">/* optical nudge, visual
     weight sits left */</span>
  translate: <span class="val">2px</span> 0;
}</pre>
""", """
.circ { position: relative; width: 240px; height: 240px; border-radius: 50%; background: #fff; border: 1px solid #e4e0d6; box-shadow: 0 18px 50px rgba(23,23,23,.06); display: grid; place-items: center; }
.cx { position: absolute; left: 50%; top: 18px; bottom: 18px; border-left: 2px dashed #f9a8d4; }
.cap3 { font-size: 26px; color: #404040; margin-top: 24px; line-height: 1.4; }
""")

s9 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Fewer edges</p>
  <p><span>2</span>A few spans, <code>minmax(0, 1fr)</code></p>
  <p><span>3</span>Baselines for text, eye for icons</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next course: a short type scale, named by role</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8, s9])
