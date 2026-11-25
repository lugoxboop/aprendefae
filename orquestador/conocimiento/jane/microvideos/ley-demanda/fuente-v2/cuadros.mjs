// node cuadros.mjs <carpeta> <t1> <t2> ...  → cuadros de revisión y hoja de contacto
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [dir, ...ts] = process.argv.slice(2);
const exe = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const comp = await selectComposition({ serveUrl, id: "ElMangoDeToby", browserExecutable: exe, inputProps: { sinSonido: true } });
console.log("duración", comp.durationInFrames / 30);
for (const t of ts) {
  await renderStill({ composition: comp, serveUrl, frame: Math.min(comp.durationInFrames - 1, Math.round(Number(t) * 30)), output: path.join(dir, `t${Number(t).toFixed(2).padStart(6, "0")}.png`), scale: 0.35, browserExecutable: exe, inputProps: { sinSonido: true }, logLevel: "error" });
}
process.exit(0);
