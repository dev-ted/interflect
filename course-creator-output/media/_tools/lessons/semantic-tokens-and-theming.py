import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parents[1])); from mk import write
K = "Design systems · Lesson 2"
UI = """
.lbl2 { font-size: 22px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
.btnT { display: inline-block; background: #14b8a6; color: #fff; font-size: 28px; font-weight: 600; border-radius: 14px; padding: 16px 28px; }
"""
files = ["Button.tsx", "Badge.tsx", "Tabs.tsx", "Link.tsx", "Toggle.tsx", "Progress.tsx", "Chart.tsx", "Focus.css"]
hits = "".join(f'<div><span class="f">src/{f}</span>  <span class="hit">var(--teal-500)</span></div>' for f in files)
s1 = (K, "The component knows the palette", f"""
<div style="text-align:center"><span class="btnT">Start lesson</span><pre style="margin-top:28px;font-size:28px;width:640px;text-align:left"><span class="tag">.button</span> {{
  background: <span class="hl">var(--teal-500)</span>;
}}</pre></div>
<pre style="width:760px;font-size:24px;line-height:1.6"><span class="dim">$ grep -rn "teal-500" src/
# dark mode = edit every one of these</span>
{hits}</pre>
""", UI + "pre div { white-space: pre; } pre .f { color: #a3a3a3; } pre .hit { color: #fca5a5; }")

s2 = (K, "Semantic tokens name the role", """
<pre style="width:760px;font-size:26px;line-height:1.5"><span class="tag">:root</span> {
  --color-surface:        var(--neutral-0);
  --color-surface-subtle: var(--neutral-100);
  --color-border:         var(--neutral-200);
  --color-text:           var(--neutral-900);
  --color-text-muted:     var(--neutral-500);
  <span class="hl">--color-accent:         var(--teal-500);</span>
  --color-focus:          var(--teal-500);
}</pre>
<div class="layers">
  <div class="ly"><b>Components</b><code>var(--color-accent)</code></div><div class="ar">↓</div>
  <div class="ly mid"><b>Semantic</b><code>--color-accent</code></div><div class="ar">↓</div>
  <div class="ly"><b>Primitives</b><code>--teal-500</code></div>
  <p class="note" style="margin-top:18px">Only the token layer touches primitives.</p>
</div>
""", UI + ".layers { width: 520px; text-align: center; } .ly { background: #fff; border: 1px solid #e4e0d6; border-radius: 18px; padding: 18px; display: grid; gap: 6px; } .ly b { font-size: 28px; } .ly code { font: 600 22px ui-monospace, Menlo, monospace; color: #0f766e; } .ly.mid { border: 3px solid #0f766e; } .ar { font-size: 34px; color: #0f766e; padding: 4px 0; }")

def themed(dark):
    bg, sub, bd, tx, mu, ac = ("#171717", "#262626", "#404040", "#ffffff", "#a3a3a3", "#2dd4bf") if dark else ("#ffffff", "#f5f5f5", "#e5e5e5", "#171717", "#737373", "#14b8a6")
    return f'''<div class="th" style="background:{bg};border-color:{bd};color:{tx}"><div class="lbl2" style="color:{mu}">{"Dark" if dark else "Light"}</div>
<div style="font-size:30px;font-weight:700">Semantic tokens</div><p style="color:{mu};font-size:22px;margin:8px 0 18px">Same component CSS, new mapping.</p>
<span class="bdg" style="background:{sub};color:{tx}">Lesson 2</span> <span class="btnT" style="background:{ac};color:{"#171717" if dark else "#fff"};font-size:22px;padding:12px 20px;margin-left:10px">Start</span>
<div class="map" style="color:{mu}">surface → {"neutral-900" if dark else "neutral-0"}<br>accent → {"teal-400" if dark else "teal-500"}</div></div>'''
s3 = (K, "Dark mode is a new mapping", f"""
<pre style="width:780px;font-size:20px;line-height:1.45"><span class="tag">@media</span> (prefers-color-scheme: dark) {{
  <span class="tag">:root:not([data-theme="light"])</span> {{
    --color-surface: var(--neutral-900);
    --color-surface-subtle: <span class="val">#262626</span>;
    --color-border: <span class="val">#404040</span>;
    --color-text: var(--neutral-0);
    --color-text-muted: <span class="val">#a3a3a3</span>;
    <span class="hl">--color-accent: var(--teal-400);</span>
  }}
}}
<span class="tag">:root[data-theme="dark"]</span> {{
  --color-surface: var(--neutral-900);
  --color-text: var(--neutral-0);
}}</pre>
<div style="display:grid;gap:22px">{themed(False)}{themed(True)}</div>
""", UI + ".th { width: 560px; border: 1px solid; border-radius: 22px; padding: 24px 28px; } .bdg { display: inline-block; border-radius: 999px; padding: 8px 16px; font-size: 20px; font-weight: 600; } .map { font: 500 18px ui-monospace, Menlo, monospace; margin-top: 16px; }")

s4 = (K, "One rule, both themes", """
<div style="display:grid;gap:22px;width:760px">
<pre style="font-size:24px;line-height:1.45"><span class="dim">/* before */</span>
<span class="tag">.badge</span> {
  background: <span class="bad2">#f5f5f5</span>; color: <span class="bad2">#171717</span>;
}
<span class="tag">.dark .badge-dark</span> {
  background: <span class="bad2">#262626</span>; color: <span class="bad2">#fff</span>;
}</pre>
<pre style="font-size:24px;line-height:1.45"><span class="dim">/* after */</span>
<span class="tag">.badge</span> {
  background: var(<span class="ok2">--color-surface-subtle</span>);
  color: var(<span class="ok2">--color-text</span>);
}</pre></div>
<div style="display:grid;gap:18px;width:420px">
  <div class="tb" style="background:#fff"><span class="lab" style="color:#737373">Light</span><span class="bdg" style="background:#f5f5f5;color:#171717">Lesson 2</span></div>
  <div class="tb" style="background:#171717;border-color:#404040"><span class="lab" style="color:#a3a3a3">Dark</span><span class="bdg" style="background:#262626;color:#fff">Lesson 2</span></div>
  <div class="tb" style="background:linear-gradient(90deg,#fff 50%,#171717 50%)"><span class="lab" style="color:#737373">System</span><span class="bdg" style="background:#262626;color:#fff;margin-left:auto">Lesson 2</span></div>
</div>
""", UI + ".bad2 { color: #fca5a5; } .ok2 { color: #5eead4; } .tb { border: 1px solid #e4e0d6; border-radius: 18px; padding: 22px 26px; display: flex; align-items: center; gap: 20px; } .lab { font-size: 20px; font-weight: 650; text-transform: uppercase; letter-spacing: .1em; width: 90px; } .bdg { display: inline-block; border-radius: 999px; padding: 10px 20px; font-size: 24px; font-weight: 600; }")

s5 = (K, "Name the role and state, not the look", """
<div class="names"><div class="lbl2 accent">Keep</div><code>--color-text-muted</code><code>--color-border-strong</code><code>--color-accent-hover</code></div>
<div class="names"><div class="lbl2 bad">Avoid</div><code class="x">--color-light-grey</code><code class="x">--color-settings-page-card-border</code><p class="note" style="margin-top:6px">Appearance names break when the theme changes. One-off roles belong inside the component.</p></div>
""", UI + ".names { width: 680px; display: grid; gap: 16px; align-content: start; } .names code { font: 600 30px ui-monospace, Menlo, monospace; background: #fff; border: 1px solid #e4e0d6; border-radius: 14px; padding: 18px 22px; } .names .x { text-decoration: line-through; text-decoration-color: #b91c1c; text-decoration-thickness: 3px; color: #737373; }")

s6 = (K, "Recap", """
<div class="takes">
  <p><span>1</span>Components use semantic tokens</p>
  <p><span>2</span>Themes are alternate mappings</p>
  <p><span>3</span>Name the role, keep the list small</p>
</div>
""", "")
write(sys.argv[1], [s1, s2, s3, s4, s5, s6])
