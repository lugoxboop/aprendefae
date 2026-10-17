/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LECTURA DE LOS PAQUETES DEL REDISEÑO DE ENGANCHE (A0 v3, A1 v6, H1 v2).
 *
 * Lo comparten las pruebas de A0, A1 y H1. No es una prueba: no termina en
 * .test.mjs.
 *
 * Los paquetes del rediseño escriben cada texto en su renglón, con su lugar:
 *   - Antes de la figura: «…» (91,3)
 *   - Pie: «…»
 * El número entre paréntesis es su INFLESZ medido; «(<10)», que tiene menos de
 * 10 palabras. Los pies, las páginas y la interfaz no llevan medida.
 *
 *   · pantallasDe(md)  las pantallas «**Pn · id**», cada una con sus textos
 *                      por lugar, en orden (con un título, las de otra
 *                      sección: «Caso B (D8), pantalla por pantalla»)
 *   · hechosDe(md)     los hechos «### h1-tN · viene de h1-N» de H1
 *   · seccionDe(md, t) los renglones de una sección «## t»
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { CITA } from "./t4-paquete.mjs";

/* Un renglón «- Lugar: «texto» (medida)»: el lugar puede llevar comillas, el texto una anidada. */
const RENGLON = new RegExp(`^- (.+?): ${CITA}(?: \\((<10|\\d+,\\d)\\))?\\s*$`);

export function renglones(bloque) {
  return bloque.split("\n").map((l) => l.match(RENGLON)).filter(Boolean).map((m) => ({ lugar: m[1], texto: m[2], medida: m[3] ?? null }));
}

/* Los renglones «- Clave: valor» que no son texto entre comillas (subtema, monto, va a…). */
export function datos(bloque) {
  return Object.fromEntries(bloque.split("\n").map((l) => l.match(/^- ([^:«]+): ([^«].*)$/)).filter(Boolean).map((m) => [m[1].trim(), m[2].trim()]));
}

export function pantallasDe(md, titulo = "Contenido, pantalla por pantalla") {
  const ini = md.indexOf(`## ${titulo}`);
  if (ini < 0) return [];
  const fin = md.indexOf("\n## ", ini + 5);
  return md.slice(ini, fin).split(/\n(?=\*\*P\d)/).slice(1).map((s) => {
    const [, k, id, completa] = s.match(/^\*\*P(\d+) · ([a-z0-9-]+)\*\*( \(completa\))?/);
    return { k: Number(k), id, textos: renglones(s), completa: Boolean(completa) };
  });
}

export function seccionDe(md, titulo) {
  const ini = md.indexOf(`\n## ${titulo}`);
  if (ini < 0) return null;
  const fin = md.indexOf("\n## ", ini + 5);
  return md.slice(ini, fin < 0 ? undefined : fin);
}

export function hechosDe(md) {
  return seccionDe(md, "Hechos").split(/\n(?=### h1-t\d)/).slice(1).map((b) => {
    const [, id, viene] = b.match(/^### (h1-t\d) · viene de (h1-\d)/);
    return { id, viene, datos: datos(b), textos: renglones(b) };
  });
}

/* El texto de un lugar (exacto), o null. */
export const textoDe = (textos, lugar) => textos.find((x) => x.lugar === lugar)?.texto ?? null;

/*
 * D8: lo que el caso B dice, pantalla por pantalla: lo del caso 1 con lo que
 * la sección «Caso B (D8), pantalla por pantalla» cambia. Cada renglón B
 * reemplaza al del mismo lugar (que tiene que existir); los renglones B con
 * un lugar que el caso 1 no tiene («Fila 1…») quedan aparte, en `extra`.
 */
export function fusionB(canonA, canonB) {
  return canonA.map((a) => {
    const b = canonB.find((x) => x.id === a.id);
    if (!b) return { ...a, extra: [] };
    /* «(completa)»: la pantalla B va entera (sus lugares cambian, como los errores por cifra). */
    if (b.completa) return { ...a, textos: b.textos, extra: [] };
    const lugares = new Set(a.textos.map((x) => x.lugar));
    return {
      ...a,
      textos: a.textos.map((x) => b.textos.find((y) => y.lugar === x.lugar) ?? x),
      extra: b.textos.filter((y) => !lugares.has(y.lugar)),
    };
  });
}
