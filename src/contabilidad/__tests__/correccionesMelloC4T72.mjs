import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Auditoría de Mello del patrón de enganche C4 (orquestador/conocimiento/
 * paquetes/auditoria-mello-patron-c4.md), para T7-2 A1, H2 y H5. El paquete
 * de Watari queda como llegó; las pruebas le aplican estas correcciones.
 *   · C4-1  mientras se escribe, la figura solo muestra la cifra; nada que
 *           dependa del resultado antes de «Comprobar»
 *   · C4-3  H5 · pago-a-la-transportadora · $383.800: la frase de Mello
 * Cada texto de aquí tiene que estar literal en la auditoría (deMello falla si no).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AUDITORIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/auditoria-mello-patron-c4.md", import.meta.url), "utf8");

export function deMello(texto) {
  if (!AUDITORIA.includes(texto)) throw new Error(`no está en la auditoría de Mello: «${texto}»`);
  return texto;
}

/* C4-3: la fila de T7-2 H5 dice «La misma frase.»: la de la fila de T7-1 H5. */
const fila = (pieza) => AUDITORIA.split("\n").find((l) => l.startsWith(`| ${pieza}`));
deMello("| T7-2 H5 · pago-a-la-transportadora | $383.800 | «retiene $-3.800 (-1 %)» | La misma frase. |");
export const C4_3_H5_PAGO = {
  distractor: 383_800,
  hoy: "retiene $-3.800 (-1 %)",
  debe: deMello(fila("T7-1 H5 · pago-transportadora").match(/\| «([^»]+)» \|$/)[1]),
};

/* C4-1: lo que no puede haber en la figura antes de «Comprobar». */
deMello("no puede contener `c4-cuadra`, `c4-falla` ni ` mal`");
export const C4_1_PROHIBIDO = ["c4-cuadra", "c4-falla", " mal", "c4t72-cuadra", "c4t72-falla", "data-c4-linea"];
