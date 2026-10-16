import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex» renovada: EL PATRÓN DE ENGANCHE C2 DE WATARI, CON LO
 * QUE MELLO PIDE ENCIMA (la técnica de `correccionesMello.mjs`).
 *
 * El paquete queda como llegó: orquestador/conocimiento/paquetes/
 * patron-enganche-c2-v1.html. Este ayudante:
 *
 *   · saca de ese HTML el código de referencia de la pieza (`kardex.js` y
 *     `kardex.css`, del objeto CODIGO que la página publica) y la sección
 *     `id="kardex"` con su tabla «Pantalla por pantalla»
 *   · lee de la sección 1 de auditoria-mello-patron-c2.md las tres
 *     correcciones OBLIGATORIAS (K-1, K-2 y K-3), con sus textos literales
 *   · aplica K-1 y K-3 a las pantallas de la referencia, y da K-2 como una
 *     regla sobre el mensaje
 *
 * Cada texto nuevo y cada regla tienen que estar, letra por letra, en la
 * auditoría: si no, falla al importarse.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");

export const C2_HTML = leer("patron-enganche-c2-v1.html");
const AUDITORIA = leer("auditoria-mello-patron-c2.md");

/* La sección 1 de la auditoría: de «## 1.» hasta la siguiente «## ». */
function seccion1(md) {
  const ini = md.indexOf("\n## 1. ");
  if (ini < 0) throw new Error("la auditoría no tiene sección 1");
  const fin = md.indexOf("\n## ", ini + 1);
  return md.slice(ini, fin < 0 ? undefined : fin);
}
export const MELLO_KX = seccion1(AUDITORIA);
if (!MELLO_KX.startsWith("\n## 1. T7-2 A3 «El kárdex»")) throw new Error("la sección 1 de la auditoría no es la del kárdex");
/* Las condiciones de fusión, donde Mello da la prueba de K-2. */
export const MELLO_FUSION = AUDITORIA.slice(AUDITORIA.indexOf("\n## Condiciones de fusión"));

/* ═══════════ LA REFERENCIA ═══════════ */

const lineaCodigo = C2_HTML.split("\n").find((l) => l.startsWith("const CODIGO = {"));
if (!lineaCodigo) throw new Error("el patrón C2 no trae el objeto CODIGO");
const CODIGO = JSON.parse(lineaCodigo.slice("const CODIGO = ".length).replace(/;\s*$/, ""));
export const KARDEX_JS = CODIGO.kardex[0];
export const KARDEX_CSS = CODIGO.kardex[1];

const ini = C2_HTML.indexOf('<section class="sec" id="kardex">');
export const SECCION_KX = C2_HTML.slice(ini, C2_HTML.indexOf("</section>", ini));
/* La tabla «Pantalla por pantalla»: [pantalla, nombre, texto de Near]. */
export const TABLA_KX = [...SECCION_KX.matchAll(/<tr><td class='mono'>(\d+) ([^<]+)<\/td><td>([^<]*)<\/td>/g)]
  .map((m) => ({ pantalla: Number(m[1]), nombre: m[2], texto: m[3] === "—" ? "" : m[3] }));
/* Los rótulos [W] que Watari pide a Near (sección 5): los que van entre «». */
export const ROTULOS_PEDIDOS = (() => {
  const li = SECCION_KX.slice(SECCION_KX.indexOf("5 · Rótulos que pido a Near"));
  const linea = li.slice(li.indexOf("[W]"), li.indexOf("</li>"));
  return [...linea.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
})();

/* ═══════════ K-1 ═══════════ */

/* Las dos filas de la tabla de K-1: | Pantalla | Fichas | Devolución al 2.º error | */
function filaK1(pantalla) {
  const l = MELLO_KX.split("\n").find((x) => x.startsWith(`| ${pantalla} | `));
  if (!l) throw new Error(`K-1: la auditoría no trae la fila ${pantalla}`);
  const [, fichas, devol] = l.split(" | ").map((c) => c.replace(/^\| /, "").replace(/ \|$/, ""));
  const textos = [...fichas.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
  if (textos.length !== 3) throw new Error(`K-1 ${pantalla}: no son tres fichas`);
  /* Cada devolución: «clave»: …«texto» (la última comilla de la parte), o sin clave, en el orden de los distractores. */
  const partes = devol.split(" · ").map((p) => {
    const clave = p.match(/^«([^»]+)»:/)?.[1] ?? null;
    const todas = [...p.matchAll(/(\*\*)?«([^»]+)»(\*\*)?/g)].filter((m) => !clave || m[2] !== clave);
    const t = todas.at(-1);
    return { clave, texto: t[2], nueva: Boolean(t[1] && t[3]) };
  });
  /* La clave «50 y 10» nombra la ficha por sus cantidades. */
  const cantidades = (t) => [...t.matchAll(/(\d+)(?: ×| y|$)/g)].map((m) => m[1]).join(",");
  const distractores = textos.slice(1);
  const devoluciones = partes.map((p, k) => {
    const ficha = p.clave ? distractores.find((d) => d === p.clave || cantidades(d.replace(/ × [\d.]+/g, "")) === cantidades(p.clave)) : distractores[k];
    if (!ficha) throw new Error(`K-1 ${pantalla}: la devolución «${p.clave}» no casa con ninguna ficha`);
    return { ficha, texto: p.texto, nueva: p.nueva };
  });
  return { correcta: textos[0], fichas: textos, devoluciones };
}
export const K1 = { peps: filaK1("PEPS"), ueps: filaK1("UEPS") };
/* Los textos que escribe Mello (en negrita en su tabla): la devolución de PEPS para «50 y 10». */
export const DEVOLUCIONES_NUEVAS = [...K1.peps.devoluciones, ...K1.ueps.devoluciones].filter((d) => d.nueva);
if (DEVOLUCIONES_NUEVAS.length !== 1) throw new Error("K-1: se esperaba una sola devolución nueva de Mello");
for (const t of ["PEPS y UEPS usan la misma mecánica que el promedio", "Tres fichas con la salida completa vuelan al hueco de Salidas", "las capas del saldo viajan a Salidas", "(14 palabras; INFLESZ 93,0)"]) {
  if (!MELLO_KX.includes(t)) throw new Error(`K-1: la auditoría no dice «${t}»`);
}

/* ═══════════ K-2 ═══════════ */

export const SIGUE_HASTA_EL_20 = MELLO_KX.match(/el mensaje es «(Sigue hasta el 20 de julio\.)» \(6 palabras\)/)?.[1];
if (!SIGUE_HASTA_EL_20) throw new Error("K-2: la auditoría no trae «Sigue hasta el 20 de julio.»");
for (const t of ["en el `input` del deslizador", "el mensaje del acierto se ve solo si `s.idx === P.espera`", "si `P.listo(s)` es falso", "si es verdadero, el mensaje queda vacío"]) {
  if (!MELLO_KX.includes(t)) throw new Error(`K-2: la auditoría no dice «${t}»`);
}
if (!MELLO_FUSION.includes(`acertar en PEPS y mover la fecha al 20 de julio. Debe salir «${SIGUE_HASTA_EL_20}» o nada.`)) throw new Error("K-2: no está la prueba de fusión");

/*
 * K-2 sobre el mensaje de la referencia: con la pregunta resuelta, después de
 * mover el deslizador. Devuelve el texto que debe quedar a la vista
 * (null = el de la referencia, sin cambio).
 */
export function mensajeK2({ resuelta, idx, espera, listo, acierto }) {
  if (!resuelta || espera === undefined) return null;
  if (idx === espera) return acierto;
  return listo ? "" : SIGUE_HASTA_EL_20;
}

/* ═══════════ K-3 ═══════════ */

export const PORQUE_K3 = MELLO_KX.match(/el porqué queda en «([^»]+)» \(12 palabras; INFLESZ 91,0\)\. Total: \*\*54\*\*/)?.[1];
if (!PORQUE_K3) throw new Error("K-3: la auditoría no trae el porqué nuevo de «lado a lado»");
export const LIMITE_B2 = Number(MELLO_KX.match(/contra un límite de (\d+)/)?.[1]);
if (LIMITE_B2 !== 60) throw new Error("K-3: la auditoría no da el límite de 60");
export const PALABRAS_K3 = 54;

/* ═══════════ LA REFERENCIA CON K-1 Y K-3 ═══════════ */

/*
 * Las pantallas de la referencia (PANTALLAS de kardex.js, copiadas de su
 * reino) con K-1 y K-3: PEPS y UEPS ya no tocan capas sino tres fichas (la
 * correcta primero, como en la tabla de Mello), cada una con su devolución
 * al 2.º error; el porqué de «lado a lado», el de Mello.
 */
export function conCorreccionesKX(pantallas) {
  return pantallas.map((p) => {
    if (p.id === "peps" || p.id === "ueps") {
      const { capa, ...resto } = p;
      const k = K1[p.id];
      const mal = Object.fromEntries(k.devoluciones.map((d) => [d.ficha, d.texto]));
      return { ...resto, fichasK1: k.fichas.map((t) => ({ t, correcta: t === k.correcta, devolucion: mal[t] ?? null })), pista: capa.pista };
    }
    if (p.id === "lado-a-lado") return { ...p, porque: PORQUE_K3 };
    return p;
  });
}
