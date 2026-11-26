// node render.mjs <salida.mp4>  → el video completo
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const exe = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const composition = await selectComposition({ serveUrl, id: "ElMangoDeToby", browserExecutable: exe });
let ult = 0;
await renderMedia({ composition, serveUrl, codec: "h264", crf: 23, outputLocation: process.argv[2], browserExecutable: exe, concurrency: 4, logLevel: "error",
  onProgress: ({ progress }) => { if (progress - ult > 0.1) { ult = progress; console.log(Math.round(progress * 100) + " %"); } } });
console.log("hecho");
process.exit(0);
