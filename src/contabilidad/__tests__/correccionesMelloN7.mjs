import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CORRECCIÓN OBLIGATORIA DE MELLO A N7 «¿A qué cuenta va?» v2 (T5).
 * Auditoría: orquestador/conocimiento/paquetes/
 * auditoria-mello-n6-n7-v2-y-enganche-v5.md, sección 3 (N7-1).
 *
 * Como correccionesMello.mjs: el paquete de Near se queda como llegó, y la
 * prueba de N7 lo lee a través de `conCorreccionesN7`, que cambia cada texto
 * viejo por el de Mello. Cada texto viejo tiene que estar una vez en el
 * paquete, y cada texto nuevo, letra por letra, en la sección 3 de la
 * auditoría, en la fila de su campo (si no, este archivo falla al cargarse).
 *
 * N7-1: en el hecho 3 el dividendo llega por transferencia. Cambian el
 * hecho y la línea de $75.000 que iba a Caja: pasa a Bancos · Debe, con Caja
 * e Inversiones – títulos de distractores, y con su pista y su respuesta. En
 * la tabla del paquete, la fila nueva lleva el INFLESZ que Mello da a cada
 * texto, entre paréntesis, como las demás.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
export const AUDITORIA_N7 = readFileSync(new URL("orquestador/conocimiento/paquetes/auditoria-mello-n6-n7-v2-y-enganche-v5.md", RAIZ), "utf8");
export const PAQUETE_N7 = readFileSync(new URL("orquestador/conocimiento/paquetes/t5-n7-a-que-cuenta-va-v2.md", RAIZ), "utf8");
/* Solo la sección 3, la de N7: un texto de N6, A1 o A7 no vale aquí. */
const SECCION_N7 = AUDITORIA_N7.slice(AUDITORIA_N7.indexOf("## 3. N7"), AUDITORIA_N7.indexOf("## 4. A1"));
if (SECCION_N7.length < 500 || !SECCION_N7.includes("**N7-1 ·")) throw new Error("no encuentro N7-1 en la sección 3 de la auditoría");

/* Una fila de la tabla de N7-1: «| campo | texto | palabras | INFLESZ |». */
function filaDeMello(campo) {
  const filas = SECCION_N7.split("\n").filter((l) => l.startsWith(`| ${campo} | `));
  if (filas.length !== 1) throw new Error(`la auditoría no trae una sola fila «${campo}»`);
  const [, texto, , inflesz] = filas[0].replace(/^\| | \|$/g, "").split(" | ");
  return { texto, inflesz };
}

const HECHO = filaDeMello("Hecho 3");
const LINEA = filaDeMello("Línea $75.000, correcta");
const PISTA = filaDeMello("Pista (1.er error)");
const RESPUESTA = filaDeMello("Respuesta (2.º error)");
const [, CORRECTA, DISTRACTORES] = LINEA.texto.match(/^(.+) \(distractores: (.+)\)$/);

/* [corrección, campo, «vieja» del paquete, «nueva» con los textos de Mello] */
export const CORRECCIONES_N7 = [
  ["N7-1", "Hecho 3",
    "- Hecho: «La empresa de las acciones que compró Guayacán reparte dinero entre quienes tienen sus acciones. A Guayacán le llegan $75.000 en efectivo.» (65,6)",
    `- Hecho: ${HECHO.texto} (${HECHO.inflesz})`],
  ["N7-1", "Línea $75.000",
    "| $75.000 | Caja · Debe | Bancos · Inversiones – títulos | «Otra vez llega efectivo. ¿A qué cuenta entra?» (no aplica) | «Entra efectivo, así que Caja aumenta: va al debe.» (no aplica) |",
    `| $75.000 | ${CORRECTA} | ${DISTRACTORES} | ${PISTA.texto} (${PISTA.inflesz}) | ${RESPUESTA.texto} (${RESPUESTA.inflesz}) |`],
];

/* Los textos nuevos, tal cual en la auditoría (sin comillas). */
export const NUEVOS_N7 = {
  hecho3: HECHO.texto.slice(1, -1), correcta: CORRECTA, distractores: DISTRACTORES,
  pista: PISTA.texto.slice(1, -1), respuesta: RESPUESTA.texto.slice(1, -1),
};
if (NUEVOS_N7.correcta !== "Bancos · Debe" || NUEVOS_N7.distractores !== "Caja · Inversiones – títulos") throw new Error("N7-1: la línea de la auditoría no es la esperada");
for (const t of [HECHO.texto, PISTA.texto, RESPUESTA.texto]) if (!/^«[^«»]+»$/.test(t)) throw new Error(`N7-1: texto sin comillas en la auditoría: ${t}`);
for (const [, campo, vieja, nueva] of CORRECCIONES_N7) {
  if (PAQUETE_N7.split(vieja).length !== 2) throw new Error(`${campo}: el texto viejo no está una sola vez en el paquete de Near: ${vieja}`);
  if (PAQUETE_N7.includes(nueva)) throw new Error(`${campo}: el paquete ya trae el texto nuevo`);
}

export const conCorreccionesN7 = (md) => CORRECCIONES_N7.reduce((s, [, , vieja, nueva]) => s.split(vieja).join(nueva), md);
