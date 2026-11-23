import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Accessible components · Lesson 2"
UI = """
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.pane { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 36px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.b { display: inline-block; font-size: 26px; font-weight: 600; border-radius: 12px; padding: 14px 24px; border: 1px solid #d4cfc3; background: #fff; }
.b.dark { background: #171717; color: #fff; border-color: #171717; }
.ring { outline: 3px solid #14b8a6; outline-offset: 3px; }
.chk { list-style: none; margin: 0; padding: 0; } .chk li { font-size: 30px; padding: 14px 0; border-bottom: 1px solid #e4e0d6; display: flex; gap: 16px; align-items: center; }
.chk .y::before { content: "✓"; color: #0f766e; font-weight: 800; width: 30px; } .chk .n::before { content: "✕"; color: #b91c1c; font-weight: 800; width: 30px; }
.sr { font: 500 26px ui-monospace, Menlo, monospace; background: #171717; color: #f5f5f4; border-radius: 14px; padding: 16px 22px; }
.sr b { color: #5eead4; font-weight: 600; }
"""
s1 = (K, "A div dressed as a button", """
<div class="pane" style="width:620px;display:grid;place-items:center;height:300px"><span class="b dark">Save changes</span><code class="cd">&lt;div onClick&gt;</code></div>
<ul class="chk" style="width:560px"><li class="y">Mouse click works</li><li class="n">Tab skips it</li><li class="n">Screen reader: “plain text”</li></ul>
""", UI + ".cd { font: 600 22px ui-monospace, Menlo, monospace; color: #b91c1c; margin-top: -60px; }")

s2 = (K, "Links go somewhere. Buttons do something.", """
<div class="col2"><div class="big">Link</div><div class="sub">goes somewhere</div><ul><li>Navigate</li><li>Open a new page</li><li>Jump to a section</li></ul><code>&lt;a href&gt;</code></div>
<div class="col2"><div class="big">Button</div><div class="sub">does something</div><ul><li>Submit · open · toggle</li><li>Delete · save</li></ul><code>&lt;button&gt;</code></div>
<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:32px;margin:0;color:#404040">Styling is separate. Pick the element by what happens on activation.</p>
""", UI + """
.col2 { width: 620px; background: #fff; border: 1px solid #e4e0d6; border-radius: 24px; padding: 40px 44px; height: 460px; }
.big { font-size: 72px; font-weight: 700; letter-spacing: -0.04em; } .sub { font-size: 32px; color: #0f766e; font-weight: 650; margin-bottom: 18px; }
.col2 ul { margin: 0 0 24px; padding-left: 28px; } .col2 li { font-size: 30px; padding: 6px 0; color: #404040; }
.col2 code { font: 700 34px ui-monospace, Menlo, monospace; background: #f3f0e8; border-radius: 10px; padding: 6px 14px; }
""")

s3 = (K, "Fine with a mouse, broken by keyboard", """
<pre style="width:820px;font-size:34px">&lt;<span class="tag">div</span> className=<span class="val">"btn"</span> onClick={save}&gt;
  Save changes
&lt;/<span class="tag">div</span>&gt;</pre>
<ul class="chk" style="width:600px"><li class="n">Not reachable with Tab</li><li class="n">Ignores Enter and Space</li><li class="n">Announced as plain text</li></ul>
""", UI)

s4 = (K, "One element change", """
<pre style="width:760px;font-size:32px">&lt;<span class="tag">button</span>
  <span class="hl">type=<span class="val">"button"</span></span>
  className=<span class="val">"btn"</span>
  onClick={save}
&gt;
  Save changes
&lt;/<span class="tag">button</span>&gt;</pre>
<div style="width:560px"><ul class="chk"><li class="y">In the tab order</li><li class="y">Enter and Space activate it</li><li class="y">Button role, works in forms</li></ul>
<p class="note" style="margin-top:22px"><code style="font-family:ui-monospace,Menlo,monospace">role="button"</code> + <code style="font-family:ui-monospace,Menlo,monospace">tabIndex=0</code> on a div still leaves key handling to you.</p></div>
""", UI)

def form(cancel_type, submitted):
    t = f' <span class="attr">type="{cancel_type}"</span>' if cancel_type else ' <span class="attr bad">no type</span>'
    return f'''<div class="pane" style="width:640px;display:grid;gap:18px"><div style="font-size:26px;font-weight:600">Lesson title</div><div class="in">Grids and alignment</div>
<div style="display:flex;gap:14px;align-items:center"><span class="b">Cancel</span><span class="b dark">Save</span></div>
<div class="code2">&lt;button{t}&gt;Cancel</div>
<div class="res {"bad" if submitted else "accent"}">{"Cancel submitted the form" if submitted else "Cancel just cancels"}</div></div>'''
s5 = (K, "Inside a form, buttons default to submit", f"""
<div><div class="lbl2 bad">Before</div>{form(None, True)}</div>
<div><div class="lbl2 accent">After</div>{form("button", False)}</div>
""", UI + """
.in { height: 60px; border: 2px solid #d4cfc3; border-radius: 12px; padding: 0 18px; display: flex; align-items: center; font-size: 24px; }
.code2 { font: 500 24px ui-monospace, Menlo, monospace; color: #404040; } .attr { color: #0f766e; font-weight: 700; } .attr.bad { color: #b91c1c; }
.res { font-size: 26px; font-weight: 650; }
""")

s6 = (K, "Name icon-only buttons", """
<div style="display:grid;gap:30px;width:640px">
  <div class="pane" style="display:flex;align-items:center;gap:28px;padding:28px"><span class="x">✕</span><div class="sr">button</div></div>
  <div class="pane" style="display:flex;align-items:center;gap:28px;padding:28px"><span class="x">✕</span><div class="sr"><b>Close dialog</b>, button</div></div>
</div>
<pre style="width:760px;font-size:30px">&lt;<span class="tag">button</span>
  type=<span class="val">"button"</span>
  <span class="hl">aria-label=<span class="val">"Close dialog"</span></span>
&gt;
  &lt;<span class="tag">XIcon</span> aria-hidden=<span class="val">"true"</span> /&gt;
&lt;/<span class="tag">button</span>&gt;</pre>
""", UI + ".x { width: 72px; height: 72px; border-radius: 16px; border: 1px solid #d4cfc3; display: grid; place-items: center; font-size: 32px; flex: none; }")

bad = "".join('<li>Read more</li>' for _ in range(5))
good = "".join(f'<li>Read the {t} lesson</li>' for t in ["typography", "focus", "spacing", "grids", "tokens"])
s7 = (K, "Link text that stands alone", f"""
<div><div class="lbl2 bad">Links list · useless</div><ul class="links">{bad}</ul></div>
<div><div class="lbl2 accent">Links list · describes the destination</div><ul class="links">{good}</ul></div>
""", UI + ".links { list-style: none; margin: 0; padding: 18px 28px; width: 640px; background: #171717; border-radius: 20px; } .links li { font: 500 28px ui-monospace, Menlo, monospace; color: #f5f5f4; padding: 10px 0; border-bottom: 1px solid #333; } .links li:last-child { border: 0; }")

s8 = (K, "Disabled hides the reason", """
<div><div class="lbl2 bad">disabled</div><div class="pane" style="width:640px;height:300px;display:grid;align-content:center;gap:18px"><span class="b" style="color:#a3a3a3;background:#f5f5f4;width:fit-content">Publish course</span><div class="note">Tab skips it. Nobody hears why.</div></div></div>
<div><div class="lbl2 accent">aria-disabled + a reason</div><div class="pane" style="width:640px;height:300px;display:grid;align-content:center;gap:18px"><span class="b ring" style="color:#737373;background:#f5f5f4;width:fit-content">Publish course</span><div class="msg"><span class="ic">i</span>Add at least one lesson to publish.</div><code class="cd2">aria-disabled="true"</code></div></div>
""", UI + ".msg { font-size: 26px; color: #404040; display: flex; gap: 12px; align-items: center; } .ic { width: 30px; height: 30px; border-radius: 50%; background: #171717; color: #fff; display: inline-grid; place-items: center; font: 700 18px ui-monospace, Menlo, monospace; } .cd2 { font: 600 22px ui-monospace, Menlo, monospace; color: #0f766e; }")

s9 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Links navigate, buttons act</p>
  <p><span>2</span><code>type="button"</code> on non-submit buttons</p>
  <p><span>3</span>Name icon-only buttons</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: labels that stay visible, errors that get announced</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8, s9])
