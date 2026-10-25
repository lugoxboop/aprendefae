/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CUÁNTAS CURVAS DE ACELERACIÓN HAY DE VERDAD?
 *
 * El canon dice una sola curva, `cubic-bezier(.3,.9,.4,1)`, y «no inventes
 * otra». Esta sonda cuenta si eso es cierto. La primera vez que se corrió
 * (24-oct-2026) dijo que no: 54 declaraciones de 856 la usaban, un 6%.
 *
 * Una regla que se incumple el 94% de las veces no es una regla, es un deseo.
 * Y no es por desobediencia: nadie puede acordarse de siete dígitos en cada
 * `transition` que escribe. Por eso la sonda no sirve para regañar a nadie,
 * sino para saber si el número baja.
 *
 * NO MIRA las pruebas ni node_modules. «(sin curva)» es una declaración que no
 * nombra ninguna: el navegador le pone `ease`, que también está prohibida.
 *
 *   node scripts/vida/sonda-curvas.mjs          # el resumen
 *   node scripts/vida/sonda-curvas.mjs --donde  # y en qué archivos
 *   node scripts/vida/sonda-curvas.mjs --tope 6 # falla si el % de la casa baja de 6
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("../..", import.meta.url).pathname;
const CASA = "cubic-bezier(.3,.9,.4,1)";
const DECL = /(?:transition|animation)(?:-timing-function)?\s*:\s*[^;"`\n]+/g;
const CURVA = /cubic-bezier\([^)]*\)|ease-in-out|ease-out|ease-in|linear|\bease\b/;

const donde = process.argv.includes("--donde");
const tope = Number((process.argv.find((a) => a.startsWith("--tope")) ?? "").split(/[= ]/)[1] ?? NaN);

const cuenta = {};
const archivos = {};
let total = 0, casa = 0;

const recorrer = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!/^(__tests__|node_modules|dist)$/.test(e.name)) recorrer(p); continue; }
    if (!/\.(jsx?|css)$/.test(e.name) || /\.test\./.test(e.name)) continue;
    for (const m of readFileSync(p, "utf8").match(DECL) ?? []) {
      total++;
      if (m.replace(/\s/g, "").includes(CASA)) { casa++; continue; }
      const c = (m.match(CURVA) ?? ["(sin curva)"])[0];
      cuenta[c] = (cuenta[c] ?? 0) + 1;
      (archivos[relative(RAIZ, p)] ??= new Set()).add(c);
    }
  }
};
recorrer(join(RAIZ, "src"));

const pct = total ? Math.round((casa / total) * 100) : 0;
console.log(`Declaraciones de transition/animation en src: ${total}`);
console.log(`Con la curva de la casa ${CASA}: ${casa} (${pct}%)\n`);
console.log("Con otra cosa:");
for (const [c, n] of Object.entries(cuenta).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${c}`);
const beziers = Object.keys(cuenta).filter((c) => c.startsWith("cubic-bezier")).length;
console.log(`\nCurvas cubic-bezier distintas de la de la casa: ${beziers}`);

if (donde) {
  console.log("\nPor archivo (los 25 con más variedad):");
  const filas = Object.entries(archivos).map(([f, s]) => [f, [...s]]).sort((a, b) => b[1].length - a[1].length).slice(0, 25);
  for (const [f, cs] of filas) console.log(`  ${String(cs.length).padStart(2)}  ${f}  —  ${cs.join(", ")}`);
}

if (!Number.isNaN(tope) && pct < tope) {
  console.error(`\nFALLA: la curva de la casa cubre el ${pct}% y el tope pedido era ${tope}%.`);
  process.exit(1);
}
