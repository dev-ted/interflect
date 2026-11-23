import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Accessible components · Lesson 1"
UI = """
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.pane { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 36px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.b { display: inline-block; font-size: 26px; font-weight: 600; border-radius: 12px; padding: 14px 24px; border: 1px solid #d4cfc3; background: #fff; }
.b.dark { background: #171717; color: #fff; border-color: #171717; } .b.teal { background: #14b8a6; color: #fff; border-color: #14b8a6; }
.ring { outline: 3px solid #14b8a6; outline-offset: 3px; }
.ring-dark { outline: 3px solid #171717; outline-offset: 3px; box-shadow: 0 0 0 6px #fff; }
.in { height: 64px; border: 2px solid #d4cfc3; border-radius: 12px; padding: 0 18px; display: flex; align-items: center; font-size: 24px; color: #737373; }
.cap { font-size: 24px; color: #404040; margin-top: 16px; }
"""
s1 = (K, "The focus ring is a keyboard cursor", """
<div class="pane" style="width:900px;display:grid;gap:24px">
  <div style="font-size:34px;font-weight:700">Account settings</div>
  <div class="in">Display name</div>
  <div style="display:flex;gap:16px"><span class="b">Cancel</span><span class="b dark">Save changes</span><span class="b">Delete account</span></div>
  <div class="key"><kbd>Tab</kbd> <kbd>Tab</kbd> <kbd>Tab</kbd> <span>… where am I?</span></div>
</div>
<div style="width:520px"><p class="note" style="font-size:40px;font-weight:650;color:#171717;letter-spacing:-0.03em;line-height:1.15">No ring is like hiding the mouse pointer.</p></div>
""", UI + "kbd { font: 600 24px ui-monospace, Menlo, monospace; background: #f3f0e8; border: 1px solid #d4cfc3; border-bottom-width: 3px; border-radius: 8px; padding: 6px 12px; } .key { display: flex; gap: 10px; align-items: center; margin-top: 6px; } .key span { font-size: 26px; color: #b91c1c; font-weight: 600; margin-left: 8px; }")

s2 = (K, "The line that breaks keyboard navigation", """
<pre style="width:700px;font-size:36px"><span class="dim">/* Before */</span>
<span class="tag">button:focus</span> {
  <span class="strike">outline: none;</span>
}</pre>
<div style="width:560px;display:grid;gap:28px">
  <div><div class="lbl2" style="color:#737373">After a mouse click</div><span class="b dark">Save changes</span><div class="cap">No ring, as hoped.</div></div>
  <div><div class="lbl2 bad">After Tab</div><span class="b dark">Save changes</span><div class="cap bad" style="font-weight:600">No ring for keyboard users either.</div></div>
</div>
""", UI + ".strike { text-decoration: line-through; text-decoration-color: #ef4444; text-decoration-thickness: 4px; color: #fca5a5; }")

s3 = (K, "Let the browser decide: focus-visible", """
<div style="display:flex;flex-direction:column;gap:36px">
<pre style="width:760px;font-size:32px"><span class="dim">/* After */</span>
<span class="tag">button:focus-visible</span> {
  outline: <span class="val">2px</span> solid <span class="val">#14b8a6</span>;
  outline-offset: <span class="val">2px</span>;
}</pre></div>
<div style="display:grid;gap:30px;width:640px">
  <div class="pane" style="padding:24px 30px"><div class="lbl2" style="color:#737373">Mouse click on button</div><span class="b dark">Save changes</span><span class="cap" style="margin-left:18px">no ring</span></div>
  <div class="pane" style="padding:24px 30px"><div class="lbl2 accent">Tab to button</div><span class="b dark ring">Save changes</span><span class="cap" style="margin-left:18px">clear ring</span></div>
  <div class="pane" style="padding:24px 30px"><div class="lbl2 accent">Click a text input</div><div class="in ring" style="color:#171717">Thandi|</div></div>
</div>
""", UI)

s4 = (K, "At least 3:1 against what's around it", """
<div><div class="lbl2 accent">On white · visible</div><div class="pane" style="width:620px;height:280px;display:grid;place-items:center"><span class="b ring" style="font-size:32px">Continue</span></div></div>
<div><div class="lbl2 bad">On a teal button · disappears</div><div class="pane" style="width:620px;height:280px;display:grid;place-items:center;background:#14b8a6;border-color:#14b8a6"><span class="b teal" style="font-size:32px;outline:3px solid #14b8a6;outline-offset:3px">Continue</span></div></div>
""", UI)

s5 = (K, "Offset it, and use a double ring", """
<pre style="width:760px;font-size:30px"><span class="tag">.button:focus-visible</span> {
  <span class="hl">outline: 2px solid #171717;</span>
  outline-offset: <span class="val">2px</span>;
  box-shadow: 0 0 0 <span class="val">4px</span> <span class="val">#ffffff</span>;
}</pre>
<div style="display:grid;gap:20px;width:660px">
  <div class="bg" style="background:#fff"><span class="b dark ring-dark">Continue</span></div>
  <div class="bg" style="background:#14b8a6"><span class="b ring-dark" style="background:#fff">Continue</span></div>
  <div class="bg" style="background:#1f2937"><span class="b ring-dark" style="background:#fff">Continue</span></div>
  <p class="cap" style="margin:4px 0 0"><b>outline</b> survives Windows high contrast. A shadow-only ring can vanish.</p>
</div>
""", UI + ".bg { border-radius: 18px; height: 120px; display: grid; place-items: center; border: 1px solid #e4e0d6; }")

cards = [("A", 1, 3), ("B", 2, 1), ("C", 3, 4), ("D", 4, 2)]
grid = "".join(f'<div class="cd"><span class="nm">{n}</span><span class="vis">see {v}</span><span class="tb">Tab {t}</span></div>' for n, v, t in cards)
s6 = (K, "Tab order follows the DOM, not the picture", f"""
<div class="gr4">{grid}<svg class="path" viewBox="0 0 900 380" width="900" height="380"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b91c1c"/></marker></defs><path d="M210 105 L210 255" fill="none" stroke="#b91c1c" stroke-width="5" stroke-dasharray="14 10" marker-end="url(#ah)"/><path d="M690 105 L690 255" stroke="#b91c1c" stroke-width="5" stroke-dasharray="14 10" marker-end="url(#ah)"/><path d="M670 290 L240 115" stroke="#b91c1c" stroke-width="5" stroke-dasharray="14 10" marker-end="url(#ah)"/><circle cx="690" cy="100" r="10" fill="#b91c1c"/></svg></div>
<div style="width:520px"><p class="note" style="font-size:36px;font-weight:650;color:#b91c1c;letter-spacing:-0.02em">Visual order and tab order drifted.</p><p class="note" style="margin-top:18px">CSS <code>order</code> moved the cards. Fix the source order instead.</p></div>
""", UI + """
.gr4 { position: relative; display: grid; grid-template-columns: repeat(2, 420px); gap: 60px; padding: 0; }
.cd { height: 160px; background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; position: relative; display: grid; place-items: center; }
.nm { font-size: 64px; font-weight: 700; } .vis { position: absolute; left: 20px; top: 16px; font: 600 20px ui-monospace, Menlo, monospace; color: #737373; }
.tb { position: absolute; right: 16px; top: 14px; font: 700 22px ui-monospace, Menlo, monospace; color: #fff; background: #b91c1c; border-radius: 8px; padding: 4px 10px; }
.path { position: absolute; left: 0; top: 0; pointer-events: none; }
.note code { font: 600 0.9em ui-monospace, Menlo, monospace; background: #e8e3d6; border-radius: 6px; padding: 0 8px; }
""")

s7 = (K, "Move focus on purpose when content changes", """
<div class="step"><div class="lbl2 accent">Open dialog</div><div class="pane mini"><div class="dlg"><b>Rename course</b><div class="in ring" style="height:48px;font-size:20px;color:#171717">Typography|</div></div></div><p class="cap">Focus moves inside, to the first control.</p></div>
<div class="step"><div class="lbl2 accent">Close dialog</div><div class="pane mini" style="display:grid;place-items:center"><span class="b ring">Rename</span></div><p class="cap">Focus returns to the button that opened it.</p></div>
<div class="step"><div class="lbl2 accent">Delete a row</div><div class="pane mini rows"><div class="rw gone">Lesson 2 <s>deleted</s></div><div class="rw ring">Lesson 3</div><div class="rw">Lesson 4</div></div><p class="cap">Focus moves to the next row, not the page body.</p></div>
""", UI + """
.step { width: 500px; } .mini { height: 280px; padding: 28px; }
.dlg { border: 1px solid #e4e0d6; border-radius: 16px; padding: 20px; display: grid; gap: 14px; box-shadow: 0 18px 40px rgba(23,23,23,.12); font-size: 24px; }
.rows { display: grid; gap: 12px; align-content: start; } .rw { font-size: 24px; border: 1px solid #e4e0d6; border-radius: 12px; padding: 16px 18px; }
.gone { color: #a3a3a3; border-style: dashed; } .gone s { font-size: 18px; margin-left: 8px; }
""")

s8 = (K, "Test with Tab alone", """
<div class="pane" style="width:880px;display:grid;gap:22px">
  <div style="font-size:34px;font-weight:700">Account settings</div>
  <div class="in">Display name</div>
  <div style="display:flex;gap:16px"><span class="b">Cancel</span><span class="b dark ring">Save changes</span><span class="b">Delete account</span></div>
</div>
<div style="width:560px"><div class="q">Can I see where I am?</div><div class="q">Is this where I expected to be?</div><p class="cap" style="margin-top:18px">Hands off the mouse. Ask at every stop.</p></div>
""", UI + ".q { font-size: 40px; font-weight: 650; letter-spacing: -0.03em; padding: 18px 0; border-bottom: 1px solid #e4e0d6; }")

s9 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Never remove focus without a replacement</p>
  <p><span>2</span><code>focus-visible</code>, outline, offset</p>
  <p><span>3</span>Focus order matches visual order</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: links go somewhere, buttons do something</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8, s9])
