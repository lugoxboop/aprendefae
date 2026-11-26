// node render.mjs <pieza> <salida.mp4>  → Reel completo, H.264, CRF 23, 1080×1920, 30 fps
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { exe } from "./navegador.mjs";
const [id, out] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const composition = await selectComposition({ serveUrl, id, browserExecutable: exe });
let ult = 0;
await renderMedia({ composition, serveUrl, codec: "h264", crf: 23, pixelFormat: "yuv420p", audioCodec: "aac", outputLocation: out, browserExecutable: exe, concurrency: 4, logLevel: "error",
  onProgress: ({ progress }) => { if (progress - ult > 0.2) { ult = progress; console.log(id, Math.round(progress * 100) + " %"); } } });
console.log("hecho", out);
process.exit(0);
