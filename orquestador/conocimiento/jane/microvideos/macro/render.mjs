// node render.mjs <ID> <salida.mp4>  → el video completo
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, out] = process.argv.slice(2);
// PROPS='{"sinSonido":true}' → solo la imagen (la mezcla final la arma sonido/mezcla.py)
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {};
const exe = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable: exe });
let ult = 0;
await renderMedia({ composition, serveUrl, inputProps, codec: "h264", crf: 23, outputLocation: out, browserExecutable: exe, concurrency: 4, logLevel: "error",
  onProgress: ({ progress }) => { if (progress - ult > 0.2) { ult = progress; console.log(id, Math.round(progress * 100) + " %"); } } });
console.log("hecho", out);
process.exit(0);
