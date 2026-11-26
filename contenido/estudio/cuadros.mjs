// node cuadros.mjs <pieza> <carpeta> [paso_s | t1 t2 ...]  → cuadros sueltos (ESC=escala, ZONAS=1 plantilla)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { exe } from "./navegador.mjs";
const [id, dir, paso = "2", ...extra] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
const props = { sinSonido: true, zonas: !!process.env.ZONAS };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const comp = await selectComposition({ serveUrl, id, browserExecutable: exe, inputProps: props });
const dur = comp.durationInFrames / 30;
console.log(id, "duración", dur.toFixed(2));
const ts = extra.length ? [paso, ...extra].map(Number) : Array.from({ length: Math.floor(dur / Number(paso)) + 1 }, (_, k) => k * Number(paso));
for (const t of ts) {
  await renderStill({ composition: comp, serveUrl, frame: Math.min(comp.durationInFrames - 1, Math.round(t * 30)), output: path.join(dir, `t${t.toFixed(2).padStart(6, "0")}.jpg`), imageFormat: "jpeg", scale: Number(process.env.ESC || 0.33), browserExecutable: exe, inputProps: props, logLevel: "error" });
}
process.exit(0);
