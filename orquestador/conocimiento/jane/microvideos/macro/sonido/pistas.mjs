// node sonido/pistas.mjs <ID> <pista: fx|musica> <salida.wav>  → una pista de audio sola, sin cuadros
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, pista, out] = process.argv.slice(2);
const exe = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx") });
const inputProps = { pista };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable: exe });
await renderMedia({ composition, serveUrl, inputProps, codec: "wav", outputLocation: out, browserExecutable: exe, concurrency: 4, logLevel: "error" });
console.log("hecho", id, pista, out);
process.exit(0);
