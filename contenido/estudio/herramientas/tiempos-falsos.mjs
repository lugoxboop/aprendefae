// node herramientas/tiempos-falsos.mjs <pieza> → tiempos-borrador.json estimado (2,8 palabras/s)
// SOLO para maquetar antes de tener la voz. Nunca se renderiza con esto.
import fs from "node:fs";
const [p] = process.argv.slice(2);
const dir = `src/piezas/${p}`;
const frases = fs.readFileSync(`${dir}/guion.txt`, "utf8").split("\n").filter(Boolean);
let t = 0.1; const escenas = frases.map((f) => { const palabras = f.split(/\s+/).map((w) => { const d = 0.22 + w.length * 0.035; const o = { w, ini: +t.toFixed(2), fin: +(t + d).toFixed(2) }; t += d + (/[.,:?]$/.test(w) ? 0.25 : 0.03); return o; }); t += 0.5; return { ini: palabras[0].ini, fin: palabras.at(-1).fin, texto: f, palabras }; });
fs.writeFileSync(`${dir}/tiempos-borrador.json`, JSON.stringify({ audio: null, duracion: t, escenas }, null, 1));
console.log("borrador", t.toFixed(1), "s");
