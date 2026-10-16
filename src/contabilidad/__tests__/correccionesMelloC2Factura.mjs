import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CORRECCIONES DE MELLO A T7-1 H2 «ARMA LA FACTURA» EN EL PATRÓN DE
 * ENGANCHE C2 (auditoria-mello-patron-c2.md §3, Fa-1 y Fa-2).
 *
 * El paquete de Near (t7-1-h2-v1.md) y la C2 de Watari se quedan como
 * llegaron. Las pruebas leen el enunciado de Near a través de
 * `enunciadoConFa2`, que lo reparte como pide Mello, y la regla de Fa-1 se
 * lee del código que Mello escribió en la auditoría. Cada texto nuevo y cada
 * regla se comprueban, letra por letra, contra la auditoría: si Mello la
 * cambia, esto falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AUDITORIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/auditoria-mello-patron-c2.md", import.meta.url), "utf8");
const SECCION = AUDITORIA.slice(AUDITORIA.indexOf("## 3. T7-1 H2 «Arma la factura»"), AUDITORIA.indexOf("## 4. Lote de dialecto C"));

/* Fa-2: la frase del periódico, con sujeto (Mello; Near debe confirmarla). */
export const PERIODICO_MELLO = "La Ceiba usa el sistema de inventario periódico.";
const REGLA_FA2 = `en el ítem 1 quedan a la vista solo dos cosas: «${PERIODICO_MELLO}» y el párrafo de las tarifas. Los párrafos 1, 2 y 4 van en «Ver el enunciado» desde el ítem 1.`;
if (!SECCION.includes(REGLA_FA2)) throw new Error(`Fa-2 no está, letra por letra, en la auditoría de Mello: ${REGLA_FA2}`);
export const LIMITE_PALABRAS_FA2 = Number(/nunca después de (\d+) palabras/.exec(SECCION)?.[1]);
if (LIMITE_PALABRAS_FA2 !== 60) throw new Error("Fa-2: la auditoría ya no dice «nunca después de 60 palabras»");

/**
 * El enunciado de Near (sus cuatro párrafos) repartido como pide Fa-2: a la
 * vista, la frase del periódico y «el párrafo de las tarifas» (el 3: el que
 * trae el 16 % y el 3,5 %); en «Ver el enunciado», los párrafos 1, 2 y 4.
 */
export function enunciadoConFa2(parrafos) {
  if (parrafos.length !== 4) throw new Error(`el enunciado de Near tiene ${parrafos.length} párrafos y Fa-2 cuenta 4`);
  if (!/16 %.*3,5 %/.test(parrafos[2])) throw new Error("el párrafo 3 ya no es el de las tarifas");
  return { visible: [PERIODICO_MELLO, parrafos[2]], plegado: [parrafos[0], parrafos[1], parrafos[3]] };
}

/*
 * Fa-1: la regla, leída del código de la auditoría. Los renglones de la venta
 * que no se preguntan (IVA y retención) se ven «—» hasta que se responde este
 * ítem.
 */
const FA1 = /```js\n\s*(if \(!it\) return \{ v: s\.resp\['([^']+)'\] \|\| s\.fin \? F\[renglon\] : null, fijo: true \};)\n\s*```/.exec(SECCION);
if (!FA1) throw new Error("Fa-1: el código de la corrección ya no está en la auditoría");
export const LIBERA_VENTA_MELLO = FA1[2];
if (!SECCION.includes("Así, los dos renglones muestran «—» hasta responder.")) throw new Error("Fa-1: la auditoría ya no dice «—» hasta responder");
