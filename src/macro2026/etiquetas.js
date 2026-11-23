/*
 * MACRO 2026 · cómo nombra el panel docente cada ítem de las Hacer nuevas.
 *
 * src/docente/etiquetasItem.js las suma a sus REGLAS. Viven aquí, junto a los
 * bancos, para que quien cambie un banco vea en el mismo sitio cómo se lee su
 * ítem. Cada regla recibe el `item` que la pieza manda en su `detalle` y
 * devuelve el enunciado, o null si el id no es suyo (el panel enseña entonces
 * el id crudo y lo cuenta).
 */
import { BANCO_H1, ETAPAS_H2, BANCO_H3, BANCO_H4, BANCO_H5 } from "./demanda-agregada/textos.js";
import { ETAPAS_H6 } from "./comun/modelo-da.js";

const sinComillas = (t) => t.replace(/^«|»$/g, "");

export const REGLAS_MACRO2026 = {
  /* H1: un ítem por ficha (h1-1 … h1-10). */
  "da26-h1-llena-carrito": (id) => BANCO_H1.find((f) => f.id === id)?.ficha ?? null,
  /* H2: `<etapa>-<hueco>`, un ítem por hueco de la fórmula. */
  "da26-h2-arma-formula": (id) => {
    for (const e of ETAPAS_H2) {
      const k = e.huecos.findIndex((h) => `${e.id}-${h.id}` === id);
      if (k >= 0) return `${e.nombre}: hueco ${k + 1} de ${e.huecos.length} de la fórmula`;
    }
    return null;
  },
  /* H3: `<suceso>-tipo` (¿gira o sube?) y `<suceso>-sentido` (¿hacia dónde?). */
  "da26-h3-gira-o-sube": (id) => {
    const m = /^(.*)-(tipo|sentido)$/.exec(String(id));
    const s = m && BANCO_H3.find((x) => x.id === m[1]);
    if (!s) return null;
    return `${s.suceso} ${m[2] === "tipo" ? "(¿gira o sube?)" : "(¿hacia dónde?)"}`;
  },
  /* H4: `<titular>-<n>`, un ítem por eslabón de la cadena. */
  "da26-h4-empresario": (id) => {
    const m = /^(.*)-(\d+)$/.exec(String(id));
    const h = m && BANCO_H4.find((x) => x.id === m[1]);
    const esl = h?.eslabones[Number(m[2]) - 1];
    return esl ? `${sinComillas(h.titular)} → ${esl[0]}` : null;
  },
  /* H5: un ítem por página (encontrar la línea falsa); se nombra por su corrección. */
  "da26-h5-libreta": (id) => {
    const pg = BANCO_H5.find((x) => x.id === id);
    return pg ? `La falsa de la página: ${pg.correccion}` : null;
  },
  /* H6: `h6-<etapa>`, un ítem por etapa. */
  "da26-h6-meta": (id) => {
    const e = ETAPAS_H6.find((x) => `h6-${x.id}` === id);
    return e ? `Etapa «${e.nombre}»: llevar Y a la meta` : null;
  },
};
