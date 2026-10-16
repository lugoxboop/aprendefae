import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CORRECCIÓN DE MELLO A T5 N5 «¿Ganó o perdió?» v2 (Célula C).
 * Auditoría: orquestador/conocimiento/paquetes/
 * auditoria-mello-n5-v2-y-entrega-d-v2.md, sección 1.
 *
 * El paquete de Near (t5-n5-gano-o-perdio-v2.md) se queda como llegó. La
 * prueba de N5 lo lee a través de `conCorreccionesDeMelloN5`, que le aplica
 * la corrección obligatoria, y compara los datos letra por letra con esa
 * versión. Cada texto nuevo se comprueba aquí, letra por letra, contra la
 * auditoría; y cada texto viejo, contra el paquete: si algo no está, falla.
 *
 * N5-1 (obligatoria): mientras el estudiante arma el asiento 2, la fila del
 * asiento 1 de la figura se muestra plegada, «10 jul · asiento armado ✓», sin
 * sus líneas. Se escribe como una fila más de la tabla de la figura, debajo
 * de la del asiento 1, con las palabras de Mello.
 *
 * La opcional (reconocer 105.000 en el ítem 7) NO se aplica.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const AUDITORIA = readFileSync(new URL("orquestador/conocimiento/paquetes/auditoria-mello-n5-v2-y-entrega-d-v2.md", RAIZ), "utf8");
const PAQUETE = readFileSync(new URL("orquestador/conocimiento/paquetes/t5-n5-gano-o-perdio-v2.md", RAIZ), "utf8");
/* Solo la sección 1, la de N5: un texto de H7 o de N3 no vale aquí. */
const SECCION_N5 = AUDITORIA.slice(AUDITORIA.indexOf("## 1. N5"), AUDITORIA.indexOf("## 2. T7-1 H7"));

const FILA_ASIENTO_1 = "| Después del asiento 1 | el asiento armado, con sus sumas: 2.970.000 = 2.970.000 |";
/* Las dos celdas nuevas, cada una tal cual en la auditoría. */
export const CUANDO_PLEGADA_N5 = "Mientras el estudiante arma el asiento 2";
export const FILA_PLEGADA_N5 = "la fila del asiento 1 se muestra plegada: «10 jul · asiento armado ✓», sin sus líneas";

export const CORRECCIONES_N5 = [
  ["N5-1", FILA_ASIENTO_1, `${FILA_ASIENTO_1}\n| ${CUANDO_PLEGADA_N5} | ${FILA_PLEGADA_N5} |`],
];

if (SECCION_N5.length < 1000) throw new Error("no encuentro la sección 1 de la auditoría");
if (!SECCION_N5.includes("**N5-1 ·")) throw new Error("la auditoría no trae N5-1");
for (const nueva of [CUANDO_PLEGADA_N5, FILA_PLEGADA_N5]) if (!SECCION_N5.includes(nueva)) throw new Error(`no está en la auditoría de Mello: ${nueva}`);
for (const [id, vieja] of CORRECCIONES_N5) if (PAQUETE.split(vieja).length !== 2) throw new Error(`${id}: el texto viejo no está una vez en el paquete: ${vieja}`);

export const conCorreccionesDeMelloN5 = (md) => CORRECCIONES_N5.reduce((s, [, vieja, nueva]) => s.split(vieja).join(nueva), md);
