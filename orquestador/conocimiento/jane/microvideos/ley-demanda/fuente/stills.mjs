import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [,, out, ...ts] = process.argv;
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx"), publicDir: path.resolve("public") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const comp = await selectComposition({ serveUrl, id: "LeyDemanda", browserExecutable });
console.log("dur", comp.durationInFrames / comp.fps);
for (const t of ts) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(t) * comp.fps));
  await renderStill({ composition: comp, serveUrl, output: path.join(out, "t" + t + ".png"), frame, browserExecutable, scale: 0.5 });
}
console.log("ok");
