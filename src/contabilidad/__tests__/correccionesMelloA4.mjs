import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 «Las capas que la venta corta»: LA v6 DE WATARI, CON LO QUE MELLO
 * PIDE ENCIMA (la técnica de `correccionesMello.mjs`).
 *
 * El paquete queda como llegó: orquestador/conocimiento/paquetes/
 * patron-enganche-c-v6.html. Este ayudante:
 *
 *   · saca de ese HTML el código de referencia de la pieza 4 (`a4.js` y
 *     `a4.css`, las cadenas A4JS y A4CSS que la página publica en «a4.js · la
 *     pieza»), y la tabla «Pantalla por pantalla»
 *   · da la corrección OBLIGATORIA que la v6 todavía no trae, A4-N1 (sección 1
 *     de auditoria-mello-a4-v5-y-a3-recomendacion.md, confirmada en la
 *     sección 1 de auditoria-mello-enganche-v6-y-t7-3-aciertos.md), como una
 *     regla sobre el mensaje que la v6 deja a la vista al mover el deslizador
 *
 * Cada texto nuevo tiene que estar, letra por letra, en las dos auditorías,
 * y la regla, con sus pantallas, también: si no, falla al importarse.
 * Las 8 correcciones anteriores (F1-F4, C1-C4) ya vienen en la v6: Mello lo
 * verificó en las dos auditorías («Las 8 correcciones están aplicadas»; «El
 * código de A4 es idéntico al de la v5»).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");

export const V6_HTML = leer("patron-enganche-c-v6.html");

/* La sección 1 de una auditoría: de «## 1.» hasta la siguiente «## » (o el final). */
function seccion1(md) {
  const ini = md.indexOf("\n## 1. ");
  if (ini < 0) throw new Error("la auditoría no tiene sección 1");
  const fin = md.indexOf("\n## ", ini + 1);
  return md.slice(ini, fin < 0 ? undefined : fin);
}
export const MELLO_V5 = seccion1(leer("auditoria-mello-a4-v5-y-a3-recomendacion.md"));
export const MELLO_V6 = seccion1(leer("auditoria-mello-enganche-v6-y-t7-3-aciertos.md"));

/* Una de las constantes de cadena que la v6 publica como código («const A4JS = "…";»). */
function cadena(nombre) {
  const linea = V6_HTML.split("\n").find((l) => l.startsWith(`const ${nombre} = "`));
  if (!linea) throw new Error(`la v6 no trae ${nombre}`);
  return JSON.parse(linea.slice(`const ${nombre} = `.length).replace(/;\s*$/, ""));
}
export const A4JS = cadena("A4JS");
export const A4CSS = cadena("A4CSS");

/* La sección de la pieza 4 y su tabla «Pantalla por pantalla»: [pantalla, texto, presupuesto]. */
export const SECCION_P4 = V6_HTML.slice(V6_HTML.indexOf('<section class="sec" id="p4">'), V6_HTML.indexOf("</section>", V6_HTML.indexOf('<section class="sec" id="p4">')));
export const TITULO_V6 = SECCION_P4.match(/<h2>([^<]+)<\/h2>/)[1];
export const TABLA_V6 = [...SECCION_P4.matchAll(/<tr><td class='mono'>(\d+)<\/td><td>«(.+?)»<br><span class='near'>(\d+) de (\d+) palabras<\/span><\/td>/g)]
  .map((m) => ({ pantalla: Number(m[1]), texto: m[2], palabras: Number(m[3]), presupuesto: Number(m[4]) }));

/* ═══════════ A4-N1 ═══════════ */

export const SIGUE_HASTA_EL_28 = "Sigue hasta el 28 de febrero.";
export const ULTIMA_FECHA = 9;
/* Las pantallas de la v6 (numeradas como en la tabla) a las que se aplica cada parte. */
export const A4N1 = { conSigue: [3, 4, 5], vacias: [6, 7] };

for (const md of [MELLO_V5, MELLO_V6]) {
  if (!md.includes(`«${SIGUE_HASTA_EL_28}»`)) throw new Error(`no está en la auditoría de Mello: «${SIGUE_HASTA_EL_28}»`);
  if (!md.includes("en las pantallas 3, 4 y 5")) throw new Error("A4-N1: la auditoría no dice «en las pantallas 3, 4 y 5»");
  if (!md.includes("`s.visto < 9`")) throw new Error("A4-N1: la auditoría no dice «`s.visto < 9`»");
  if (!/en las pantallas 6 y 7 queda vacío/.test(md)) throw new Error("A4-N1: la auditoría no dice «en las pantallas 6 y 7 queda vacío»");
  if (!md.includes("en el `input` del deslizador")) throw new Error("A4-N1: la auditoría no dice «en el `input` del deslizador»");
}
if (!MELLO_V6.includes("A4-N1 sigue sin aplicar")) throw new Error("la auditoría de la v6 ya no dice que A4-N1 sigue sin aplicar");

/*
 * El mensaje que debe quedar a la vista después de mover el deslizador.
 *   pantallaV6   el número de la pantalla en la v6 (1 a 7)
 *   resuelta     si la pregunta de la pantalla ya se respondió bien
 *   visto        la fecha más lejana vista (después de mover)
 *   mensajeV6    { texto, tipo } que deja la v6 tal cual
 * Devuelve { texto, tipo }: el de la v6 si A4-N1 no aplica; si aplica, sin tipo
 * (ni ✓, ni coral, ni pista).
 */
export function mensajeTrasMover({ pantallaV6, resuelta, visto, mensajeV6 }) {
  if (!resuelta) return mensajeV6;
  if (A4N1.conSigue.includes(pantallaV6)) return visto < ULTIMA_FECHA ? { texto: SIGUE_HASTA_EL_28, tipo: "" } : { texto: "", tipo: "" };
  if (A4N1.vacias.includes(pantallaV6)) return { texto: "", tipo: "" };
  return mensajeV6;
}
