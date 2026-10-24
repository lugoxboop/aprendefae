import {
  H1, PREGUNTAS_H1, MAZOS_H1, H2, FICHAS_H2, CASOS_H2, DEVOLUCION_H2, PAREJAS_H2, ASIENTOS_H2,
} from "../data/contabilidadT1Hacer2.js";
import { FOTO, PELICULA, COMPARAR } from "../data/contabilidadPiezas234.js";
import { evaluarP3 } from "./aprenderTema1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · H1 y H2 — la lógica. Un intento por ítem (C2): el ítem vale 1 o 0
 * y el porcentaje sale de `puntuar` (tema1.js), como en los otros Hacer.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ H1 ═══════════════════ */

export const preguntaH1 = (id) => PREGUNTAS_H1.find((q) => q.id === id) ?? null;

/* Un mazo de 5, barajado. La vuelta 1 juega el A y la 2 el B (D8, como los Hacer de B con `useVuelta`). */
export function sortearH1(barajar, variante = false) {
  return barajar(MAZOS_H1[variante ? "B" : "A"].map(preguntaH1));
}

/*
 * La devolución del error sale del mismo `evaluarP3` de cu0-a3 (un solo
 * juego de errores, el corto; Shoko). El acierto es el de cada pregunta.
 */
export function evaluarH1(pregunta, marcada) {
  const r = evaluarP3(pregunta, marcada);
  if (r.ok) return { ok: true, patron: null, texto: pregunta.acierto };
  return { ok: false, patron: r.patron, texto: r.texto };
}

/*
 * Lo que se enciende con una respuesta, en la línea del año: el marco de la
 * foto que dice el dato (o el del 31 de diciembre si la respuesta es «foto»
 * y la pregunta no trae día: es el fantasma de quien la eligió por error), la
 * franja de la película, o las dos fotos con su llave.
 */
export function escenaH1(respuesta, pregunta) {
  if (respuesta === FOTO) return { [pregunta.foto ?? "diciembre"]: true };
  if (respuesta === PELICULA) return { franja: true };
  if (respuesta === COMPARAR) return { enero: true, diciembre: true, llave: true };
  return {};
}

/* La clave del texto alternativo de lo encendido. */
export function altH1(respuesta, pregunta) {
  if (respuesta === FOTO) return pregunta.foto ?? "diciembre";
  if (respuesta === PELICULA) return "pelicula";
  return "comparar";
}

/* ═══════════════════ H2 ═══════════════════ */

export const fichaH2 = (id) => FICHAS_H2.find((f) => f.id === id) ?? null;
export const asientoH2 = (id) => ASIENTOS_H2.find((a) => a.id === id) ?? null;

/* Las ocho, cada una una vez, en orden barajado. */
export const sortearH2 = (barajar) => barajar([...FICHAS_H2]);

/* El texto que se lee en la ficha: el propósito del libro (vuelta 1) o el caso (vuelta 2). */
export function enunciadoH2(ficha, vuelta = 1) {
  if (vuelta === 2) return CASOS_H2[ficha.id];
  /* El propósito empieza en minúscula en el banco: se pinta con mayúscula y punto final, sin tocar el dato. */
  const p = ficha.proposito;
  return `${p.charAt(0).toUpperCase()}${p.slice(1)}${/[.!?]$/.test(p) ? "" : "."}`;
}

/* El porqué de la pareja, si la que tocó es la que más se le parece (la 2.ª opción). */
export function porqueDeParejaH2(ficha, marcado) {
  if (marcado !== ficha.opciones[1]) return null;
  const p = PAREJAS_H2.find((x) => x.par.includes(ficha.correcta) && x.par.includes(marcado));
  return p?.porque ?? null;
}

export function evaluarH2(ficha, marcado, vuelta = 1) {
  if (!ficha.opciones.includes(marcado)) throw new Error(`«${marcado}» no está activo en ${ficha.id}`);
  if (marcado === ficha.correcta) return { ok: true, texto: ficha.acierto, porque: null };
  const texto = DEVOLUCION_H2[vuelta][marcado];
  if (!texto) throw new Error(`«${marcado}» no tiene devolución`);
  return { ok: false, texto, porque: porqueDeParejaH2(ficha, marcado) };
}

export { H1, H2 };
