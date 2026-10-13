/*
 * ═══════════════════════════════════════════════════════════════════════════
 * npm run inflesz — la legibilidad de un texto, con la regla del canon (D13).
 *
 *   npm run inflesz -- "Lee el hecho. Arma el asiento de las dos empresas."
 *   npm run inflesz -- --archivo textos.txt
 *
 * Con --archivo se mide cada línea no vacía por separado (un texto por línea).
 * Una línea que empieza por # es un comentario y no se mide.
 *
 * Por cada texto: palabras, sílabas, frases, INFLESZ con un decimal, y si
 * cumple el mínimo de 65. Un texto de menos de 10 palabras dice «no aplica»:
 * el canon lo evalúa por otros criterios.
 *
 * Sale con código 1 si algún texto que aplica queda por debajo de 65, para
 * que se pueda usar como comprobación.
 *
 * El cálculo y sus convenciones (las cifras, las sílabas, las frases) están en
 * src/herramientas/inflesz.js. Este archivo solo lee y escribe.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { inflesz, UMBRAL, PALABRAS_MINIMAS } from "../src/herramientas/inflesz.js";

const args = process.argv.slice(2);
const AYUDA = `Uso:
  npm run inflesz -- "un texto"
  npm run inflesz -- --archivo ruta.txt   (un texto por línea; # comenta)`;

let textos;
const k = args.indexOf("--archivo");
if (k >= 0) {
  const ruta = args[k + 1];
  if (!ruta) { console.error(AYUDA); process.exit(2); }
  textos = readFileSync(ruta, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
} else if (args.length) {
  textos = [args.join(" ")];
} else {
  console.error(AYUDA);
  process.exit(2);
}

let bajo = 0;
for (const t of textos) {
  const r = inflesz(t);
  const veredicto = r.palabras === 0 ? "sin palabras"
    : !r.aplica ? `no aplica (menos de ${PALABRAS_MINIMAS} palabras)`
    : r.cumple ? `cumple (≥ ${UMBRAL})` : `NO CUMPLE (< ${UMBRAL})`;
  if (r.aplica && !r.cumple) bajo += 1;
  const valor = r.valor === null ? "—" : r.valor.toFixed(1).replace(".", ",");
  console.log(`${valor.padStart(5)}  ${String(r.palabras).padStart(3)} p · ${String(r.silabas).padStart(3)} s · ${r.frases} f  ${veredicto}`);
  console.log(`       ${t}`);
}
if (textos.length > 1) console.log(`\n${textos.length} textos, ${bajo} por debajo de ${UMBRAL}.`);
process.exit(bajo > 0 ? 1 : 0);
