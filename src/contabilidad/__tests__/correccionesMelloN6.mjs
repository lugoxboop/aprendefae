import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CORRECCIONES OBLIGATORIAS DE MELLO A N6 «Lo que el ejemplo no trae» v2
 * (T5). Auditoría: orquestador/conocimiento/paquetes/
 * auditoria-mello-n6-n7-v2-y-enganche-v5.md, sección 2 (N6-1 y N6-2).
 *
 * Como correccionesMello.mjs: el paquete de Near se queda como llegó, y la
 * prueba de N6 lo lee a través de `conCorreccionesN6`, que cambia cada texto
 * viejo por el de Mello. Cada texto viejo tiene que estar una vez en el
 * paquete, y cada texto nuevo, letra por letra, en la auditoría (si no, este
 * archivo falla al cargarse).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
export const AUDITORIA_N6 = readFileSync(new URL("orquestador/conocimiento/paquetes/auditoria-mello-n6-n7-v2-y-enganche-v5.md", RAIZ), "utf8");
export const PAQUETE_N6 = readFileSync(new URL("orquestador/conocimiento/paquetes/t5-n6-lo-que-el-ejemplo-no-trae-v2.md", RAIZ), "utf8");

/* [corrección, campo, «vieja» del paquete, «nueva» de la auditoría] */
export const CORRECCIONES_N6 = [
  /* N6-1 · la condición es para qué se pagó el gasto, no cuándo (p. 193, C7). */
  ["N6-1", "P2, opción correcta", "«No: vino después.»", "«No: no fue para comprarlas.»"],
  ["N6-1", "P2, pista", "«Piensa en cuándo pasó ese gasto. ¿Hizo falta para comprar las acciones?»", "«Piensa para qué se pagó ese gasto. ¿Hizo falta para comprar las acciones?»"],
  ["N6-1", "P2, 2.º error", "«No se suma. El libro solo suma los gastos del proceso de la compra, y este vino un año después.»", "«No se suma. El libro solo suma los gastos del proceso de la compra, y este se pagó por guardarlas.»"],
  ["N6-1", "P4, resumen (línea 1)", "«Los gastos del proceso de la compra van al costo de la inversión. Lo que se paga después, no.»", "«Los gastos del proceso de la compra van al costo de la inversión. Lo que se paga por otra cosa, como guardarlas, no.»"],
  /* N6-2 · P3 no se resuelve emparejando «dividendos»; y la portada no lo adelanta. */
  ["N6-2", "P3, caso", "«Más tarde, la empresa de esas acciones reparte dividendos entre quienes tienen sus acciones. A Yarumo le llega su parte en efectivo.»", "«Más tarde, la empresa de esas acciones reparte entre sus dueños una parte de lo que ganó. A Yarumo le llega su parte en efectivo.»"],
  ["N6-2", "P3, pista", "«El dividendo no devuelve parte de lo invertido: es lo que la inversión rindió.»", "«Lo que llega no devuelve parte de lo invertido: es lo que las acciones rindieron.»"],
  ["N6-2", "P3, acierto", "«Así es. Se anota cuando llega: Caja se debita y se acredita Ingresos por dividendos.»", "«Así es. Eso es un dividendo y se anota cuando llega: Caja se debita y se acredita Ingresos por dividendos.»"],
  ["N6-2", "P0, portada", "«Yarumo compra acciones y paga gastos para hacer la compra. Después le llega un dividendo. Vas a ver a qué cuenta va cada cosa.»", "«Yarumo compra acciones y paga gastos para hacer la compra. Después, las acciones le dan algo. Vas a ver a qué cuenta va cada cosa.»"],
];

for (const [, campo, vieja, nueva] of CORRECCIONES_N6) {
  if (PAQUETE_N6.split(vieja).length !== 2) throw new Error(`${campo}: el texto viejo no está una sola vez en el paquete de Near: ${vieja}`);
  /* En la auditoría, la tabla de cada corrección trae el campo y el texto nuevo en la misma fila. */
  if (!AUDITORIA_N6.split("\n").some((l) => l.startsWith(`| ${campo} | ${nueva} |`))) throw new Error(`${campo}: no está en la auditoría de Mello: ${nueva}`);
}

export const conCorreccionesN6 = (md) => CORRECCIONES_N6.reduce((s, [, , vieja, nueva]) => s.split(vieja).join(nueva), md);
