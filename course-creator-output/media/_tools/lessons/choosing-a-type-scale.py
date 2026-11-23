import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Typography · Lesson 1"
lines = [("modal.css", 15), ("card.css", 14), ("table.css", 13), ("nav.css", 16), ("toast.css", 17), ("badge.css", 13), ("hero.css", 18), ("form.css", 15), ("tabs.css", 14), ("dialog.css", 17)]
grep = "".join(f'<div><span class="dim">{f}</span>  font-size: <span class="hit">{n}px</span>;</div>' for f, n in lines)
s1 = (K, "Fifteen sizes, a pixel apart", f"""
<pre style="width:880px;font-size:28px;line-height:1.6"><span class="dim">$ grep -r "font-size" src/</span>
{grep}</pre>
<div style="text-align:center;width:420px"><div style="font-size:150px;font-weight:700;letter-spacing:-0.05em;line-height:1" class="bad">15</div><div style="font-size:34px;color:#404040">sizes in use</div>
<div style="margin-top:36px;font-size:30px;color:#171717;font-weight:650">A scale makes it a short list.</div></div>
""", "pre .hit { background: rgba(252,211,77,.22); color: #fcd34d; border-radius: 6px; padding: 0 6px; } pre div { white-space: pre; }")

steps = [(12.8, 13), (16, 16), (20, 20), (25, 25), (31.25, 31), (39.06, 39)]
ladder = "".join(f'<div class="rung"><span class="calc">{raw:g}</span><span class="arrow">→</span><span class="px">{px}</span><span class="aa" style="font-size:{px*1.6}px">Aa</span></div>' for raw, px in steps)
s2 = (K, "Base × ratio, rounded", f"""
<div class="eq"><b>16</b><span>× 1.25 per step</span></div>
<div class="ladder">{ladder}</div>
""", """
.eq { width: 420px; } .eq b { display: block; font-size: 140px; letter-spacing: -0.05em; line-height: 1; } .eq span { font-size: 34px; color: #0f766e; font-weight: 650; }
.ladder { display: flex; flex-direction: column-reverse; gap: 6px; width: 820px; }
.rung { display: flex; align-items: center; gap: 28px; border-bottom: 1px solid #e4e0d6; padding: 6px 0; }
.calc { width: 110px; text-align: right; font: 500 28px ui-monospace, Menlo, monospace; color: #a3a3a3; }
.arrow { color: #a3a3a3; font-size: 26px; } .px { width: 70px; font-size: 34px; font-weight: 700; color: #0f766e; }
.aa { font-weight: 650; letter-spacing: -0.03em; line-height: 1.05; }
""")

def mood(ratio, label, note):
    sizes = [16 * ratio ** k for k in (3, 1, 0)]
    return f'''<div class="mood"><div class="r">{ratio}</div><div class="lbl">{label}</div>
<div class="sample"><div style="font-size:{sizes[0]*1.75:.0f}px;font-weight:700;letter-spacing:-0.03em;line-height:1.05">Plan your week</div>
<div style="font-size:{sizes[1]*1.75:.0f}px;font-weight:600;margin-top:10px">Five lessons left</div>
<div style="font-size:{sizes[2]*1.75:.0f}px;color:#737373;margin-top:6px">Pick up where you stopped.</div></div><p class="nt">{note}</p></div>'''
s3 = (K, "The ratio sets the feel", mood(1.2, "Compact", "Dashboards and tools") + mood(1.25, "Balanced", "A default for most products") + mood(1.333, "Dramatic", "Marketing, big headlines") +
      '<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:32px;margin:0;color:#404040">Different ratios in app and marketing are fine, as long as they share the base.</p>', """
.stage { gap: 40px; }
.mood { width: 520px; } .r { font: 700 30px ui-monospace, Menlo, monospace; color: #0f766e; } .lbl { font-size: 26px; font-weight: 650; color: #737373; text-transform: uppercase; letter-spacing: .1em; margin: 6px 0 18px; }
.sample { background: #fff; border: 1px solid #e4e0d6; border-radius: 22px; padding: 32px; height: 260px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
.nt { font-size: 26px; color: #404040; margin: 16px 0 0; }
""")

s4 = (K, "Name steps by role, not by size", """
<div style="display:flex;gap:96px;align-items:flex-start"><div class="tok"><div class="lbl bad">By size</div>
<code>--text-12</code><code>--text-16</code><code class="x">--text-20</code><code class="ghost">--text-21 ?</code></div>
<div class="tok"><div class="lbl accent">By role</div>
<code>--text-caption</code><code>--text-body</code><code>--text-lead</code><code>--text-title</code><code>--text-display</code></div></div>
<p style="position:absolute;left:112px;right:112px;bottom:80px;text-align:center;font-size:34px;margin:0">Role names keep the list closed.</p>
""", """
.tok { width: 560px; display: flex; flex-direction: column; gap: 16px; }
.tok .lbl { font-size: 24px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
.tok code { font: 600 34px ui-monospace, Menlo, monospace; background: #fff; border: 1px solid #e4e0d6; border-radius: 14px; padding: 16px 22px; }
.tok .x { text-decoration: line-through; text-decoration-color: #b91c1c; text-decoration-thickness: 4px; color: #737373; }
.tok .ghost { opacity: .45; border-style: dashed; color: #b91c1c; }
""")

s5 = (K, "Five steps, in rem", """
<pre style="width:900px;font-size:30px"><span class="tag">:root</span> {
  --text-caption: <span class="val">0.75rem</span>;   <span class="dim">/* 12px */</span>
  --text-body:    <span class="val">1rem</span>;      <span class="dim">/* 16px */</span>
  --text-lead:    <span class="val">1.25rem</span>;   <span class="dim">/* 20px */</span>
  --text-title:   <span class="val">1.5625rem</span>; <span class="dim">/* 25px */</span>
  --text-display: <span class="val">2.4375rem</span>; <span class="dim">/* 39px */</span>
}</pre>
<div style="width:520px">
  <div class="lbl2">Browser default 16px</div><div class="pv"><span style="font-size:50px;font-weight:700">Title</span> <span style="font-size:32px">Body text</span></div>
  <div class="lbl2" style="margin-top:28px">Reader sets 20px</div><div class="pv"><span style="font-size:62px;font-weight:700">Title</span> <span style="font-size:40px">Body text</span></div>
  <p class="note" style="margin-top:24px">Every step grows with them.</p>
</div>
""", """
.lbl2 { font-size: 22px; font-weight: 650; color: #737373; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 10px; }
.pv { background: #fff; border: 1px solid #e4e0d6; border-radius: 18px; padding: 22px 26px; display: flex; align-items: baseline; gap: 18px; }
""")

def modal(t, b, c, after):
    tag = (lambda tok, px: f'<span class="tk">{tok}</span>') if after else (lambda tok, px: f'<span class="tk bad">{px}px</span>')
    return f'''<div class="modal">
<div class="mt" style="font-size:{t*1.9}px;font-weight:{700 if after else 400}">Delete this course?{tag("title", t)}</div>
<div class="mb" style="font-size:{b*1.9}px">Learners lose their progress and quiz results.{tag("body", b)}</div>
<div class="mh" style="font-size:{c*1.9}px;color:{"#737373" if after else "#404040"}">You can export results first.{tag("caption", c)}</div>
<div class="mbtn"><span class="ghostb">Cancel</span><span class="danger">Delete</span></div></div>'''
s6 = (K, "Three steps, clearly different", f"""
<div><div class="cap4 bad">Before · 17 / 15 / 13</div>{modal(17, 15, 13, False)}</div>
<div><div class="cap4 accent">After · title / body / caption</div>{modal(25, 16, 12, True)}</div>
""", """
.cap4 { font-size: 26px; font-weight: 650; margin-bottom: 16px; }
.modal { width: 680px; background: #fff; border: 1px solid #e4e0d6; border-radius: 24px; padding: 40px; box-shadow: 0 18px 50px rgba(23,23,23,.08); display: grid; gap: 16px; }
.modal > div { position: relative; } .mt { letter-spacing: -0.02em; line-height: 1.15; }
.tk { position: absolute; right: -158px; top: 50%; transform: translateY(-50%); font: 600 20px ui-monospace, Menlo, monospace; color: #0f766e; background: #ecfdf5; border-radius: 8px; padding: 4px 10px; }
.tk.bad { color: #b91c1c; background: #fef2f2; }
.mbtn { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
.mbtn span { font-size: 22px; font-weight: 600; border-radius: 12px; padding: 12px 20px; } .ghostb { border: 1px solid #e4e0d6; } .danger { background: #b91c1c; color: #fff; }
.stage { gap: 190px; padding-right: 120px; }
""")

def vp(w, h1, label):
    return f'''<div><div class="lbl2">{label}</div><div class="vp" style="width:{w}px"><div style="font-size:{h1}px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Design that holds up</div>
<p style="font-size:24px;margin:18px 0 0;color:#404040">Body text stays at 1rem at every width.</p></div></div>'''
s7 = (K, "Fluid size for display text only", f"""
<div style="display:flex;flex-direction:column;gap:36px">
<pre style="width:1000px;font-size:30px"><span class="tag">h1</span> {{
  <span class="hl">font-size: clamp(2rem, 1.5rem + 2vw, 3rem);</span>
}}</pre>
<div style="display:flex;gap:40px;align-items:flex-end">{vp(400, 36, "Narrow")}{vp(900, 64, "Wide")}</div></div>
""", """
.lbl2 { font-size: 22px; font-weight: 650; color: #737373; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 10px; }
.vp { background: #fff; border: 1px solid #e4e0d6; border-radius: 20px; padding: 32px; box-shadow: 0 18px 50px rgba(23,23,23,.06); }
""")

s8 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Base and ratio, five or six steps</p>
  <p><span>2</span>Name by role</p>
  <p><span>3</span><code>rem</code> for text, fluid only for display</p>
  <p style="border:0;font-size:32px;font-weight:500;color:#737373;padding-top:36px">Next: line length and line height</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6, s7, s8])
