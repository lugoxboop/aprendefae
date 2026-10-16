/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE H7 «¿QUÉ CONTROL FALTA?» (ENTREGA D) A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-h7.mjs [carpeta-de-capturas]
 *
 * La vista de T7-1 en modo Hacer con H7 abierto (banco harness/#h7). Los
 * casos salen barajados: en cada uno lee cuál está en pantalla. En el caso
 * 1, 4 acierta de una; en el 2, 5 falla y acierta; en el 3, 6 falla dos
 * veces. Mide cada estado (antes, primer error, cerrado) y el cierre, con
 * el banco común medirEscalera.mjs. Sale con código 1 si algo falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { medirEscalera } from "./medirEscalera.mjs";

const { CASOS_H7, BOTON_H7 } = await import("../../src/data/contabilidadT7_1_h7.js");
const PLAN = ["bien", "una", "dos"];

const fallos = await medirEscalera({
  ruta: "scripts/t7/harness/index.html#h7",
  marca: "h7",
  items: CASOS_H7.map((c) => ({ id: c.id, correcta: c.correcta, malas: c.distractores.slice(-2) })),
  plan: (k) => PLAN[k % 3],
  siguiente: Object.values(BOTON_H7),
  capturas: process.argv[2] ?? null,
  prefijo: "h7",
});
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: H7 cabe a 375 y a 320 px.");
