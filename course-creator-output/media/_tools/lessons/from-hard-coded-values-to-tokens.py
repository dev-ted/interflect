import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Design systems · Lesson 1"
UI = """
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.chip { width: 300px; height: 300px; border-radius: 28px; border: 1px solid #d4cfc3; display: flex; align-items: flex-end; padding: 24px; font: 600 30px ui-monospace, Menlo, monospace; }
"""
s1 = (K, "Three borders nobody can tell apart", """
<div style="display:flex;gap:36px"><div class="chip" style="background:#e4e4e4">#E4E4E4</div><div class="chip" style="background:#e5e5e5">#E5E5E5</div><div class="chip" style="background:#e6e6e6">#E6E6E6</div></div>
<div style="width:500px"><p class="note" style="font-size:40px;font-weight:650;color:#171717;letter-spacing:-0.03em;line-height:1.15">A token is a named design decision.</p><p class="note" style="margin-top:18px">Same name for designers and engineers. Change it once, it changes everywhere.</p></div>
""", UI)

counts = [(214, "#171717", True), (188, "#ffffff", True), (97, "#737373", True), (41, "#e5e5e5", True), (38, "#e4e4e4", False), (31, "#e6e6e6", False), (27, "#14b8a6", True), (22, "#757575", False), (19, "#f5f5f5", True), (17, "#f4f4f4", False), (12, "#2dd4bf", True), (9, "#707070", False), (6, "#1a1a1a", False)]
rows = "".join(f'<div><span class="dim">{n:>5}</span> <span class="sw" style="background:{h}"></span><span class="{"" if ok else "dup"}">{h}</span></div>' for n, h, ok in counts)
s2 = (K, "Audit what's actually in use", f"""
<pre style="width:1100px;font-size:26px;line-height:1.5"><span class="dim">$</span> grep -rhoE <span class="val">"#[0-9a-fA-F]{{6}}"</span> src | sort | uniq -c | sort -rn
{rows}</pre>
<div style="width:420px"><p class="note" style="font-size:34px;font-weight:650;color:#171717;letter-spacing:-0.02em">A dozen greys where three were intended.</p><p class="note" style="margin-top:16px"><span style="color:#fb923c;font-weight:600">Orange</span>: near-duplicates nobody chose on purpose.</p></div>
""", UI + "pre div { white-space: pre; display: flex; align-items: center; gap: 14px; } .sw { width: 22px; height: 22px; border-radius: 5px; border: 1px solid #444; display: inline-block; } .dup { color: #fb923c; }")

s3 = (K, "Primitives: raw values, neutral names", """
<pre style="width:640px;font-size:25px;line-height:1.5"><span class="tag">:root</span> {
  --neutral-0:   <span class="val">#ffffff</span>;
  --neutral-100: <span class="val">#f5f5f5</span>;
  <span class="hl">--neutral-200: <span class="val">#e5e5e5</span>;</span>
  --neutral-500: <span class="val">#737373</span>;
  --neutral-900: <span class="val">#171717</span>;
  --teal-500:    <span class="val">#14b8a6</span>;
  --teal-400:    <span class="val">#2dd4bf</span>;
  --space-2: <span class="val">8px</span>;  --space-4: <span class="val">16px</span>;
  --space-6: <span class="val">24px</span>; --radius-2: <span class="val">8px</span>;
}</pre>
<div class="map">
  <div class="from"><code>#e4e4e4</code><code>#e5e5e5</code><code>#e6e6e6</code></div>
  <svg width="120" height="260" viewBox="0 0 120 260"><path d="M0 40 C 60 40, 60 130, 112 130 M0 130 L112 130 M0 220 C 60 220, 60 130, 112 130" fill="none" stroke="#0f766e" stroke-width="4"/></svg>
  <div class="to"><span class="tchip" style="background:#e5e5e5"></span><code>--neutral-200</code></div>
  <p class="note" style="grid-column:1/-1;margin-top:20px">No sensible home? Ask: real need, or accident?</p>
</div>
""", UI + """
.map { display: grid; grid-template-columns: auto 120px auto; align-items: center; }
.from { display: grid; gap: 50px; } .from code, .to code { font: 600 28px ui-monospace, Menlo, monospace; background: #fff; border: 1px solid #e4e0d6; border-radius: 12px; padding: 12px 18px; }
.to { display: flex; align-items: center; gap: 14px; } .tchip { width: 56px; height: 56px; border-radius: 12px; border: 1px solid #d4cfc3; }
""")

s4 = (K, "Same card, now it moves with the system", """
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;width:1060px">
<pre style="font-size:22px;line-height:1.45;padding:32px 34px"><span class="dim">/* before */</span>
<span class="tag">.card</span> {
  background: <span class="bad2">#fff</span>;
  border: 1px solid <span class="bad2">#e4e4e4</span>;
  border-radius: <span class="bad2">7px</span>;
  padding: <span class="bad2">15px</span>;
}</pre>
<pre style="font-size:22px;line-height:1.45;padding:32px 34px"><span class="dim">/* after */</span>
<span class="tag">.card</span> {
  background: var(<span class="ok2">--neutral-0</span>);
  border: 1px solid var(<span class="ok2">--neutral-200</span>);
  border-radius: var(<span class="ok2">--radius-2</span>);
  padding: var(<span class="ok2">--space-4</span>);
}</pre></div>
<div style="width:540px">
  <div class="cardx"><b>Spacing on an 8 point scale</b><p>Replace ad hoc margins with a small spacing scale.</p></div>
  <ul class="chg"><li>7px radius → <code>radius-2</code> (8)</li><li>15px padding → <code>space-4</code> (16)</li><li>#e4e4e4 → <code>neutral-200</code></li></ul>
  <p class="note" style="margin-top:8px">Not a different design. Drift.</p>
</div>
""", UI + """
.bad2 { color: #fca5a5; } .ok2 { color: #5eead4; }
.cardx { background: #fff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 32px; } .cardx b { font-size: 30px; } .cardx p { font-size: 24px; color: #737373; margin: 10px 0 0; }
.chg { list-style: none; padding: 0; margin: 24px 0 0; } .chg li { font-size: 26px; padding: 10px 0; border-bottom: 1px solid #e4e0d6; }
.chg code { font: 600 24px ui-monospace, Menlo, monospace; color: #0f766e; }
""")

s5 = (K, "One source of truth", """
<svg width="1400" height="560" viewBox="0 0 1400 560">
  <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#0f766e"/></marker></defs>
  <rect x="80" y="200" width="320" height="160" rx="24" fill="#171717"/><text x="240" y="275" text-anchor="middle" font-size="40" font-weight="700" fill="#5eead4" style="font-family:ui-monospace,Menlo,monospace">tokens.json</text><text x="240" y="320" text-anchor="middle" font-size="22" fill="#a3a3a3" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif">one file</text>
  <g style="font-family:-apple-system,BlinkMacSystemFont,sans-serif" font-size="30" font-weight="650" fill="#171717">
    <rect x="900" y="40" width="420" height="110" rx="20" fill="#fff" stroke="#e4e0d6"/><text x="1110" y="105" text-anchor="middle">CSS custom properties</text>
    <rect x="900" y="225" width="420" height="110" rx="20" fill="#fff" stroke="#e4e0d6"/><text x="1110" y="290" text-anchor="middle">Tailwind config</text>
    <rect x="900" y="410" width="420" height="110" rx="20" fill="#fff" stroke="#e4e0d6"/><text x="1110" y="475" text-anchor="middle">Design-tool variables</text>
  </g>
  <g stroke="#0f766e" stroke-width="5" fill="none" marker-end="url(#a)"><path d="M400 250 C 650 250, 650 95, 890 95"/><path d="M400 280 L890 280"/><path d="M400 310 C 650 310, 650 465, 890 465"/></g>
</svg>
<p style="position:absolute;left:112px;right:112px;bottom:72px;text-align:center;font-size:32px;margin:0;color:#404040">One web app? CSS custom properties in one file are enough.</p>
""", UI)

s6 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Audit first</p>
  <p><span>2</span>Primitives name raw values</p>
  <p><span>3</span>One source of truth</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: semantic tokens say what a value is for</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6])
