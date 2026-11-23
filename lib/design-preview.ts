/** A `preview` fence is one source for the picture and the code under it. */

export function parsePreviewMeta(meta: string | undefined): {
  label: string;
  wide: boolean;
} {
  const parts = (meta ?? "").trim().split(/\s+/).filter(Boolean);
  const wide = parts.some((part) => part.toLowerCase() === "wide");
  const label = parts.filter((part) => part.toLowerCase() !== "wide").join(" ");
  return { label: label || "Example", wide };
}

export function splitPreview(source: string): { html: string; css: string } {
  const cssParts: string[] = [];
  const html = source
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
      const block = css.trim();
      if (block) cssParts.push(block);
      return "";
    })
    .trim();
  return { html, css: cssParts.join("\n\n").trim() };
}

/** Drop the demo hook so the code a learner copies is the real markup. */
export function presentHtml(html: string): string {
  return html
    .replace(
      /\sclass=(["'])([\s\S]*?)\1/g,
      (_, quote: string, classes: string) => {
        const next = classes
          .split(/\s+/)
          .filter((token) => token && token !== "show-focus")
          .join(" ");
        return next ? ` class=${quote}${next}${quote}` : "";
      },
    )
    .trim();
}

/** Paint `:focus-visible` rules onto `.show-focus` inside the stage only. */
export function stageCss(css: string): string {
  return css.replace(/:focus-visible\b/g, ":focus-visible, .show-focus");
}

export function showsKeyboardFocus(html: string): boolean {
  return /\bshow-focus\b/.test(html);
}

function sanitizeHtml(html: string): string {
  return html
    .replace(
      /<\s*(script|iframe|object|embed|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/<\s*(script|iframe|object|embed|link|meta|base)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(
      /\s(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data):[^'"]*\2/gi,
      "",
    )
    .replace(/<\/(?:body|html|head)/gi, "");
}

function sanitizeCss(css: string): string {
  return css
    .replace(/<\/style/gi, "<\\/style")
    .replace(/@import\b[^;]*;?/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/url\s*\(\s*(['"]?)\s*https?:\/\/[^)'"]*\1\s*\)/gi, "none");
}

const STAGE_RESET = `
  :root { color-scheme: light; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; overflow: hidden; background: #ffffff; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #171717;
    padding: 24px;
  }
  button, input, textarea, select { font: inherit; }
`.trim();

export function buildSrcDoc(html: string, css: string): string {
  const safeCss = sanitizeCss(stageCss(css));
  const safeHtml = sanitizeHtml(html);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${STAGE_RESET}
${safeCss}
</style>
</head>
<body>
${safeHtml}
</body>
</html>`;
}
