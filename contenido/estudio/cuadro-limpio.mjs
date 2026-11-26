// node cuadro-limpio.mjs <pieza> <segundo> <salida.jpg> [escala]  → un cuadro sin subtítulos (para usarlo de primer cuadro en IA de video)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { exe } from "./navegador.mjs";
const [id, seg, out, esc = "0.6667"] = process.argv.slice(2);
const props = { sinSonido: true, sinSubs: true };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const comp = await selectComposition({ serveUrl, id, browserExecutable: exe, inputProps: props });
await renderStill({ composition: comp, serveUrl, frame: Math.round(Number(seg) * 30), output: out, imageFormat: "jpeg", jpegQuality: 88, scale: Number(esc), browserExecutable: exe, inputProps: props, logLevel: "error" });
console.log(out); process.exit(0);
