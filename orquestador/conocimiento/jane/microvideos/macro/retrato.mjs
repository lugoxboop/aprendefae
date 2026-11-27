// node retrato.mjs <carpeta>  → PNG transparentes de Pía en cada pose
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const out = process.argv[2];
const exe = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
for (const pose of ["tranquila", "feliz", "estrellas", "piensa"]) {
  const inputProps = { pose };
  const composition = await selectComposition({ serveUrl, id: "PiaRetrato", inputProps, browserExecutable: exe });
  await renderStill({ composition, serveUrl, inputProps, output: path.join(out, `pia-${pose}.png`), imageFormat: "png", browserExecutable: exe, logLevel: "error" });
  console.log(pose);
}
process.exit(0);
