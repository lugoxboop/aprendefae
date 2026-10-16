/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE N3 «¿QUÉ REVISIÓN FALTA?» (ENTREGA D) A 375 Y 320?
 *
 *   node scripts/t5/medir-t5-n3.mjs [carpeta-de-capturas]
 *
 * La vista de T5 en modo Hacer con N3 abierto (banco harness/#n3). Los
 * casos van en su orden fijo: el 1 y el 4 aciertan de una; el 2 y el 5
 * fallan y aciertan; el 3 falla dos veces. Mide cada estado (antes, primer
 * error, cerrado) y el cierre, con el banco común ../t7/medirEscalera.mjs.
 * Sale con código 1 si algo falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { medirEscalera } from "../t7/medirEscalera.mjs";

const { ITEMS_N3, BOTON_N3 } = await import("../../src/data/contabilidadT5_n3.js");
const PLAN = ["bien", "una", "dos"];

const fallos = await medirEscalera({
  ruta: "scripts/t5/harness/index.html#n3",
  marca: "t5-n3",
  items: ITEMS_N3.map((it) => ({ id: it.id, correcta: it.correcta, malas: Object.keys(it.porQueNo).slice(0, 2) })),
  plan: (k) => PLAN[k % 3],
  siguiente: Object.values(BOTON_N3),
  capturas: process.argv[2] ?? null,
  prefijo: "n3",
});
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: N3 cabe a 375 y a 320 px.");
