import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Accessible components · Lesson 3"
UI = """
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.pane { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 36px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.flabel { font-size: 26px; font-weight: 600; display: block; margin-bottom: 10px; }
.in { height: 64px; border: 2px solid #d4cfc3; border-radius: 12px; padding: 0 18px; display: flex; align-items: center; font-size: 26px; }
.ph { color: #b5b5b5; } .ring { outline: 3px solid #14b8a6; outline-offset: 3px; }
.sr { font: 500 26px ui-monospace, Menlo, monospace; background: #171717; color: #f5f5f4; border-radius: 14px; padding: 16px 22px; margin-top: 20px; }
.sr::before { content: "🔊  "; } .sr b { color: #5eead4; font-weight: 600; }
.hint { font-size: 22px; color: #737373; margin: 0 0 10px; }
.err { font-size: 22px; color: #b91c1c; font-weight: 600; margin: 10px 0 0; display: flex; gap: 10px; align-items: center; }
.err .ic { width: 26px; height: 26px; border-radius: 50%; background: #b91c1c; color: #fff; display: inline-grid; place-items: center; font-size: 16px; font-weight: 800; }
.chk { list-style: none; margin: 0; padding: 0; } .chk li { font-size: 30px; padding: 14px 0; border-bottom: 1px solid #e4e0d6; display: flex; gap: 16px; }
.chk .n::before { content: "✕"; color: #b91c1c; font-weight: 800; width: 30px; } .chk .y::before { content: "✓"; color: #0f766e; font-weight: 800; width: 30px; }
"""
s1 = (K, "A field that forgets its name", """
<div style="display:flex;gap:40px">
  <div><div class="lbl2" style="color:#737373">Empty</div><div class="pane" style="width:520px"><div class="in"><span class="ph">Email address</span></div></div></div>
  <div><div class="lbl2 bad">After typing</div><div class="pane" style="width:520px"><div class="in ring">thandi@|</div><div class="sr">edit text, <b>blank</b></div></div></div>
</div>
""", UI)

s2 = (K, "Placeholders are not labels", """
<pre style="width:760px;font-size:34px">&lt;<span class="tag">input</span>
  type=<span class="val">"email"</span>
  <span class="hl">placeholder=<span class="val">"Email address"</span></span>
/&gt;</pre>
<ul class="chk" style="width:620px"><li class="n">Vanishes as soon as you type</li><li class="n">Usually low contrast</li><li class="n">Not a reliable accessible name</li></ul>
""", UI)

s3 = (K, "A visible label, connected", """
<pre style="width:820px;font-size:30px">&lt;<span class="tag">label</span> <span class="hl">for=<span class="val">"email"</span></span>&gt;Email address&lt;/<span class="tag">label</span>&gt;
&lt;<span class="tag">input</span>
  <span class="hl">id=<span class="val">"email"</span></span>
  type=<span class="val">"email"</span>
  autocomplete=<span class="val">"email"</span>
/&gt;</pre>
<div style="width:560px"><div class="pane"><span class="flabel">Email address</span><div class="in ring">thandi@example.com</div></div>
<p class="note" style="margin-top:18px">Click the label to focus. <code style="font-family:ui-monospace,Menlo,monospace">autocomplete</code> lets browsers fill it in.</p></div>
""", UI)

s4 = (K, "Hints belong to the input", """
<pre style="width:900px;font-size:25px">&lt;<span class="tag">label</span> for=<span class="val">"password"</span>&gt;Password&lt;/<span class="tag">label</span>&gt;
&lt;<span class="tag">p</span> <span class="hl">id=<span class="val">"password-hint"</span></span>&gt;At least 12 characters.&lt;/<span class="tag">p</span>&gt;
&lt;<span class="tag">input</span> id=<span class="val">"password"</span> type=<span class="val">"password"</span>
  <span class="hl">aria-describedby=<span class="val">"password-hint"</span></span> /&gt;</pre>
<div style="width:620px"><div class="pane"><span class="flabel">Password</span><p class="hint">At least 12 characters.</p><div class="in ring">••••••</div></div>
<div class="sr"><b>Password</b>, edit text, <b>at least 12 characters.</b></div></div>
""", UI)

s5 = (K, "Errors say what to do, next to the field", """
<pre style="width:880px;font-size:21px;line-height:1.45"><span class="tag">function</span> EmailField({ error }) {
  <span class="tag">return</span> (
    &lt;<span class="tag">div</span> className=<span class="val">"field"</span>&gt;
      &lt;<span class="tag">label</span> htmlFor=<span class="val">"email"</span>&gt;Email address&lt;/<span class="tag">label</span>&gt;
      &lt;<span class="tag">input</span>
        id=<span class="val">"email"</span>
        type=<span class="val">"email"</span>
        autoComplete=<span class="val">"email"</span>
        <span class="hl">aria-invalid={error ? true : undefined}</span>
        <span class="hl">aria-describedby={error ? <span class="val">"email-error"</span> : undefined}</span>
      /&gt;
      {error &amp;&amp; (
        &lt;<span class="tag">p</span> id=<span class="val">"email-error"</span> className=<span class="val">"error"</span>&gt;{error}&lt;/<span class="tag">p</span>&gt;
      )}
    &lt;/<span class="tag">div</span>&gt;
  );
}</pre>
<div style="width:640px"><div class="pane"><span class="flabel">Email address</span><div class="in" style="border-color:#b91c1c">thandi@example</div><p class="err"><span class="ic">!</span>Enter an email address like name@example.com</p></div>
<p class="note" style="margin-top:22px;font-size:28px"><s style="color:#b91c1c;text-decoration-thickness:3px">Invalid input</s> &nbsp;→&nbsp; an instruction</p></div>
""", UI)

s6 = (K, "Several errors? Start with a summary", """
<div class="pane" style="width:860px;display:grid;gap:22px">
  <div class="sum ring"><b>There are 3 problems with this form</b><ul><li><u>Enter your full name</u></li><li><u>Enter an email address like name@example.com</u></li><li><u>Choose a delivery speed</u></li></ul></div>
  <div><span class="flabel">Full name</span><div class="in" style="border-color:#b91c1c"></div></div>
  <div><span class="flabel">Email address</span><div class="in" style="border-color:#b91c1c">thandi@example</div></div>
</div>
<div style="width:520px"><p class="note" style="font-size:34px;font-weight:650;color:#171717;letter-spacing:-0.02em">Focus moves to the summary on submit.</p><p class="note" style="margin-top:16px">Each error is a link to its field.</p></div>
""", UI + ".sum { border: 3px solid #b91c1c; border-radius: 16px; padding: 22px 26px; } .sum b { font-size: 28px; } .sum ul { margin: 12px 0 0; padding-left: 26px; } .sum li { font-size: 24px; color: #b91c1c; padding: 4px 0; }")

s7 = (K, "Group related controls with a legend", """
<fieldset class="fs"><legend>Delivery speed</legend>
  <label class="rad ring"><span class="dot on"></span>Standard</label>
  <label class="rad"><span class="dot"></span>Express</label>
  <label class="rad"><span class="dot"></span>Same day</label>
</fieldset>
<div style="width:620px"><div class="sr"><b>Delivery speed</b>, Standard, radio button, 1 of 3</div><p class="note" style="margin-top:18px">The legend is announced with each option.</p></div>
""", UI + """
.fs { width: 620px; border: 2px solid #e4e0d6; border-radius: 22px; padding: 24px 36px 30px; background: #fff; margin: 0; }
.fs legend { font-size: 28px; font-weight: 700; padding: 0 10px; }
.rad { display: flex; align-items: center; gap: 16px; font-size: 28px; padding: 14px 10px; border-radius: 12px; margin-top: 8px; width: fit-content; }
.dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #737373; display: grid; place-items: center; } .dot.on::after { content: ""; width: 14px; height: 14px; border-radius: 50%; background: #171717; }
""")

s8 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Visible label, programmatically connected</p>
  <p><span>2</span><code>aria-describedby</code> for hints and errors</p>
  <p><span>3</span>Errors are instructions</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8])
