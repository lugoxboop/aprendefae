// node portada.mjs <pieza> <salida.jpg> [segundo]  → portada del Reel (1080×1920; lo clave en el centro 1080×1350)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { exe } from "./navegador.mjs";
const [id, out, seg = "1"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const comp = await selectComposition({ serveUrl, id, browserExecutable: exe, inputProps: { sinSonido: true } });
await renderStill({ composition: comp, serveUrl, frame: Math.round(Number(seg) * 30), output: out, imageFormat: "jpeg", jpegQuality: 90, browserExecutable: exe, inputProps: { sinSonido: true }, logLevel: "error" });
console.log("portada", out);
process.exit(0);
