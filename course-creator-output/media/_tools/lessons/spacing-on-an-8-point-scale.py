import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Spacing · Lesson 2"
ROWCSS = """
.set { width: 760px; padding: 0; overflow: hidden; }
.set .r { border-bottom: 1px solid #ece8de; position: relative; }
.set .r:last-child { border-bottom: 0; }
.set h3 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
.set p { margin: 0; font-size: 24px; color: #737373; line-height: 1.35; }
"""
s1 = ("Spacing · Lesson 2", "Twenty gaps that nobody chose", """
<div style="position:relative;margin:0 150px"><div class="card set messy">
  <div class="r" style="padding:13px 18px"><h3 style="margin-bottom:5px">Email notifications</h3><p style="margin-bottom:22px">Weekly summary of your progress.</p></div>
  <div class="r" style="padding:17px 22px"><h3 style="margin-bottom:9px">Reminders</h3><p style="margin-bottom:14px">Nudge me when a streak is at risk.</p></div>
  <div class="r" style="padding:11px 20px"><h3 style="margin-bottom:3px">Language</h3><p style="margin-bottom:19px">English (South Africa)</p></div>
  <div class="r" style="padding:15px 18px"><h3 style="margin-bottom:7px">Time zone</h3><p style="margin-bottom:10px">Africa/Johannesburg</p></div></div>
  <span class="callout" style="left:-118px;top:4px">13px</span>
  <span class="callout" style="right:-104px;top:44px">5px</span>
  <span class="callout" style="left:-118px;top:96px">18px</span>
  <span class="callout" style="right:-118px;top:118px">22px</span>
</div>
<div style="width:520px"><p class="note">Not badly coloured. Not badly typeset.</p><p class="note" style="margin-top:24px;font-size:40px;font-weight:650;letter-spacing:-0.03em;color:#171717">Just gaps that were never a decision.</p></div>
""", ROWCSS)

FORM = """
.forms { display: flex; gap: 96px; align-items: flex-start; }
.form { width: 620px; padding: 44px; position: relative; }
.form label { display: block; font-size: 26px; font-weight: 600; }
.form .in { height: 64px; border: 2px solid #d4cfc3; border-radius: 12px; background: #fafaf7; }
.gapmark { position: absolute; left: -96px; font: 600 22px ui-monospace, Menlo, monospace; color: #737373; display:flex; align-items:center; gap:8px; }
.gapmark i { display:block; width: 14px; border: 2px solid currentColor; border-left: 0; }
.q { position: absolute; right: 28px; top: 136px; font-size: 64px; font-weight: 700; color: #b91c1c; }
.cap { margin-top: 26px; font-size: 28px; color: #404040; text-align: center; }
"""
s2 = (K, "Close together reads as together", """
<div class="forms">
 <div><div class="card form">
   <label style="margin-bottom:16px">Full name</label><div class="in"></div>
   <label style="margin:16px 0">Email</label><div class="in"></div>
   <span class="q">?</span>
 </div><p class="cap"><span class="bad">16</span> above, <span class="bad">16</span> below. Which field?</p></div>
 <div><div class="card form">
   <label style="margin-bottom:8px">Full name</label><div class="in"></div>
   <label style="margin:24px 0 8px">Email</label><div class="in"></div>
 </div><p class="cap"><span class="accent">8</span> inside, <span class="accent">24</span> between</p></div>
</div>
<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:40px;font-weight:650;letter-spacing:-0.03em;margin:0">Gap between groups ≥ <span class="accent">2×</span> the gap inside a group</p>
""", FORM)

steps = [4, 8, 12, 16, 24, 32, 48, 64]
blocks = "".join(f'<div class="st"><div class="blk" style="width:{n*3}px;height:{n*3}px"></div><b>{n}</b>{"<em>icon and label</em>" if n == 4 else ""}</div>' for n in steps)
s3 = (K, "A short menu, not a guess", f'<div class="scale">{blocks}</div>' +
      '<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:36px;letter-spacing:-0.02em;margin:0;color:#404040">Pick from the list, and two people on one screen get the same answer.</p>', """
.scale { display: flex; align-items: flex-end; gap: 40px; }
.st { display: flex; flex-direction: column; align-items: center; gap: 18px; position: relative; }
.blk { background: #0f766e; border-radius: 6px; opacity: .85; }
.st b { font-size: 40px; letter-spacing: -0.03em; }
.st em { position: absolute; top: calc(100% + 8px); white-space: nowrap; font-style: normal; font-size: 22px; color: #0f766e; font-weight: 600; }
""")

s4 = (K, "Margins that collected over time", """
<pre style="width:760px"><span class="tag">.row</span> { padding: <span class="val bad2">13px 18px</span>; }
<span class="tag">.row h3</span> { margin-bottom: <span class="val">5px</span>; }
<span class="tag">.row p</span> { margin-bottom: <span class="val">22px</span>; }</pre>
<div class="card set" style="width:620px;position:relative">
  <div class="r" style="padding:13px 18px"><h3 style="margin-bottom:5px">Email notifications</h3><p style="margin-bottom:22px">Weekly summary of your progress.</p></div>
  <div class="r" style="padding:13px 18px"><h3 style="margin-bottom:5px">Reminders</h3><p style="margin-bottom:22px">Nudge me when a streak is at risk.</p></div>
</div>
<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:40px;font-weight:650;letter-spacing:-0.03em;margin:0">13, 18, 5, 22: <span class="bad">leftovers, not decisions</span></p>
""", ROWCSS)

s5 = (K, "The parent owns the gap", """
<pre style="width:760px;font-size:28px"><span class="tag">:root</span> {
  --space-1: <span class="val">4px</span>;
  --space-2: <span class="val">8px</span>;
  --space-4: <span class="val">16px</span>;
  --space-6: <span class="val">24px</span>;
}
<span class="tag">.row</span> {
  display: grid;
  <span class="hl">gap: var(--space-1);</span>
  padding: var(--space-4) var(--space-6);
}
<span class="tag">.settings</span> {
  display: grid;
  <span class="hl">gap: var(--space-6);</span>
}</pre>
<div style="display:flex;flex-direction:column;gap:24px;width:600px;position:relative">
  <div class="card set2"><h3>Email notifications</h3><p>Weekly summary of your progress.</p></div>
  <div class="card set2"><h3>Reminders</h3><p>Nudge me when a streak is at risk.</p></div>
  <span class="callout ok" style="left:-86px;top:46px">4</span>
  <span class="callout ok" style="right:-90px;top:122px">24</span>
  <ul class="nob"><li>No collapsing margins</li><li>No stray space after the last item</li><li>No guessing which child carries it</li></ul>
</div>
""", """
.set2 { padding: 16px 24px; border-radius: 18px; display: grid; gap: 4px; }
.set2 h3 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
.set2 p { margin: 0; font-size: 24px; color: #737373; }
.nob { list-style: none; margin: 20px 0 0; padding: 0; }
.nob li { font-size: 28px; padding: 10px 0; color: #404040; }
.nob li::before { content: "✓"; color: #0f766e; font-weight: 700; margin-right: 14px; }
""")

s6 = (K, "Two kinds of spacing", """
<div class="parent">
  <span class="tagline">Layout owns the gap between components</span>
  <div class="comp"><span class="tagline in">Component owns padding + internal gap</span><div class="bar w1"></div><div class="bar w2"></div></div>
  <div class="gapl">gap</div>
  <div class="comp"><div class="bar w1"></div><div class="bar w2"></div></div>
</div>
<div class="comp lone"><div class="bar w1"></div><div class="bar w2"></div><span class="x">✕</span><span class="mlabel">margin: 22px</span></div>
""", """
.parent { position: relative; width: 820px; border: 3px dashed #0f766e; border-radius: 28px; padding: 72px 48px 48px; display: flex; flex-direction: column; }
.tagline { position: absolute; top: 20px; left: 48px; font-size: 24px; font-weight: 650; color: #0f766e; }
.tagline.in { top: -38px; left: 0; color: #404040; }
.comp { position: relative; background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 28px; display: grid; gap: 12px; margin-top: 40px; }
.parent .comp:first-of-type { margin-top: 40px; }
.bar { height: 22px; border-radius: 8px; background: #d6d1c4; } .w1 { width: 60%; background: #a8a294; } .w2 { width: 85%; }
.gapl { height: 40px; margin: 0 auto -40px; position: relative; top: 0; font: 600 22px ui-monospace, Menlo, monospace; color: #0f766e; display:none; }
.lone { width: 440px; outline: 3px dashed #b91c1c; outline-offset: 22px; margin: 0; }
.x { position: absolute; right: -60px; top: -60px; width: 64px; height: 64px; border-radius: 50%; background: #b91c1c; color: #fff; font-size: 36px; display: grid; place-items: center; font-weight: 700; }
.mlabel { position: absolute; bottom: -78px; left: 0; font: 600 24px ui-monospace, Menlo, monospace; color: #b91c1c; }
""")

def band(n, stray=False):
    return f'<div class="band{" stray" if stray else ""}" style="height:{n*2}px"><span>{n}</span></div>'
s7 = (K, "Annotate gaps with scale values", f"""
<div class="red">
  <div class="rr"><h3>Email notifications</h3>{band(8)}<p>Weekly summary of your progress.</p></div>
  {band(24)}
  <div class="rr"><h3>Reminders</h3>{band(8)}<p>Nudge me when a streak is at risk.</p></div>
  {band(22, True)}
  <div class="rr"><h3>Language</h3>{band(8)}<p>English (South Africa)</p></div>
</div>
<div style="width:600px"><p class="note" style="font-size:34px">Off the scale?</p><p class="note" style="margin-top:18px;font-size:44px;font-weight:650;color:#171717;letter-spacing:-0.03em;line-height:1.15">Either a bug, or the scale needs a new step.</p><p class="note" style="margin-top:22px">Both are worth a conversation.</p></div>
""", """
.red { margin-right: 140px; width: 720px; background: #fff; border: 1px solid #e4e0d6; border-radius: 28px; padding: 32px 40px; box-shadow: 0 18px 50px rgba(23,23,23,0.06); }
.rr h3 { margin: 0; font-size: 32px; letter-spacing: -0.02em; line-height: 1.1; } .rr p { margin: 0; font-size: 26px; color: #737373; line-height: 1.2; }
.band { position: relative; background: repeating-linear-gradient(135deg, rgba(236,72,153,.16) 0 6px, rgba(236,72,153,.32) 6px 9px); }
.band span { position: absolute; right: -110px; top: 50%; transform: translateY(-50%); font: 700 26px ui-monospace, Menlo, monospace; color: #db2777; }
.band span::before { content: ""; position: absolute; right: calc(100% + 10px); top: 50%; width: 22px; border-top: 2px solid #f9a8d4; }
.band.stray { background: repeating-linear-gradient(135deg, rgba(185,28,28,.18) 0 6px, rgba(185,28,28,.4) 6px 9px); }
.band.stray span { color: #b91c1c; border: 4px solid #b91c1c; border-radius: 50%; width: 76px; height: 76px; display: grid; place-items: center; right: -128px; }
""")

s8 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Between groups, at least twice the inside gap</p>
  <p><span>2</span>Choose from the scale</p>
  <p><span>3</span>Parents own <code>gap</code></p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: counting edges with a simple column grid</p>
</div>
""", "")

write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8])
