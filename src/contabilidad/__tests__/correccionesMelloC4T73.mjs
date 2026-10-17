import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Auditoría de Mello del patrón de enganche C4 (orquestador/conocimiento/
 * paquetes/auditoria-mello-patron-c4.md), para los Hacer de T7-3 que no van
 * al motor (H1, H2, H4 y H5). El paquete de Watari queda como llegó; las
 * pruebas le aplican estas correcciones.
 *   · C4-1  mientras se escribe, la figura solo muestra la cifra
 *   · C4-2  H4: «Tu cifra» solo en los ítems de cifra (nunca «$NaN»)
 *   · C4-3  H1 · iva · $328.000 y H5 · el-faltante · $1.432.000: la frase de Mello
 *   · C4-5  «frente a el» → «frente al» (H2)
 * Cada texto de aquí tiene que estar literal en la auditoría (deMello falla si no).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AUDITORIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/auditoria-mello-patron-c4.md", import.meta.url), "utf8");

export function deMello(texto) {
  if (!AUDITORIA.includes(texto)) throw new Error(`no está en la auditoría de Mello: «${texto}»`);
  return texto;
}

const fila = (pieza) => AUDITORIA.split("\n").find((l) => l.startsWith(`| ${pieza}`));
const debe = (pieza) => deMello(fila(pieza).match(/\| «([^»]+)» \|$/)[1]);

export const C4_3_H1_IVA = { distractor: 328_000, hoy: deMello("«18,18 % de lo facturado»"), debe: debe("T7-3 H1 · iva") };
export const C4_3_H5_FALTANTE = { distractor: 1_432_000, hoy: deMello("«Los libros quedarían en $-694.000»"), debe: debe("T7-3 H5 · el-faltante") };

/* C4-2 */
deMello("T7-3 H4 pinta «Tu cifra: $NaN» en los dos ítems de elección («que-le-toca» y «el-cierre»).");
deMello("la línea «Tu cifra» solo va cuando `I.tipo === 'cifra'`");
/* C4-5 */
deMello("«frente a el» → «frente al», en T7-3 H2 y H7");
/* C4-1: lo que no puede haber en la figura antes de «Comprobar». */
deMello("no puede contener `c4-cuadra`, `c4-falla` ni ` mal`");
export const C4_1_PROHIBIDO = ["c4-cuadra", "c4-falla", " mal", "c4t72-cuadra", "c4t72-falla", "data-c4-linea", " activa"];
