// Renders promo.html frame by frame into promo/interflect-promo.mp4 (1080p, 30fps).
//   node promo/render.mjs            -> full video
//   node promo/render.mjs 3.5 8 12   -> PNG stills at those seconds (for checking)
// Needs ffmpeg on PATH and a Playwright Chromium (npx playwright-core install chromium).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const FPS = 30;
const dir = fileURLToPath(new URL(".", import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(new URL("promo.html", import.meta.url).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const stills = process.argv.slice(2).map(Number);
if (stills.length) {
  for (const t of stills) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: `${dir}still-${t}.png` });
  }
} else {
  const duration = await page.evaluate(() => window.DURATION);
  const out = `${dir}interflect-promo.mp4`;
  // Burgundy – Supersonic (freetouse.com). Starting at 16.13s lands the drop (18.93s) on the 2.8s cut.
  const MUSIC_START = 16.13;
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-ss", String(MUSIC_START), "-i", `${dir}music.mp3`,
    "-af", `afade=t=in:d=0.3,afade=t=out:st=${duration - 1.6}:d=1.6`, "-c:a", "aac", "-b:a", "192k", "-shortest",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", out],
    { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(duration * FPS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.seek(t), i / FPS);
    ff.stdin.write(await page.screenshot({ type: "jpeg", quality: 95 }));
    if (i % FPS === 0) process.stdout.write(`\r${i / FPS}s / ${duration}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`\n${out}`);
}
await browser.close();
