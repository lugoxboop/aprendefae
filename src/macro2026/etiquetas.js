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
import * as PE from "./politica-economica/textos.js";
import { RAMAS } from "./comun/ramas.js";

/* Los nombres de los peldaños, como los rotula Escalera.jsx (que es JSX y aquí no se importa). */
const PELDANOS = { problema: "Problema", objetivo: "Objetivo", estrategia: "Estrategia", instrumento: "Instrumento", medida: "Medida", meta: "Meta" };
const nombrePeldano = (id) => PELDANOS[id] ?? id;
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

  /* ─── T2 «Política económica» (lote 3) ─── */
  /* H3: un ítem por instrumento; se nombra con la rama que lo usa. */
  "pe26-h3-cables": (id) => {
    const x = PE.BANCO_H3.find((i) => i.id === id);
    return x ? `${x.nombre} → ${RAMAS[x.rama].largo}` : null;
  },
  /* H1: `e<n>`, un ítem por enunciado del anexo; se nombra con su peldaño. */
  "pe26-h1-seis-cajones": (id) => {
    const e = PE.BANCO_H1.find((x) => x.id === id);
    return e ? `${e.texto} (${nombrePeldano(e.correcta)})` : null;
  },
  /* H2: `<grupo>-<peldaño>`, un ítem por peldaño de cada grupo lógico. */
  "pe26-h2-grupo-logico": (id) => {
    const m = /^(g\d+)-([a-z]+)$/.exec(String(id));
    const g = m && PE.BANCO_H2.find((x) => x.id === m[1]);
    return g && g.pasos[m[2]] ? `${g.nombre}: ${nombrePeldano(m[2])}` : null;
  },
  /* H4: un ítem por escalera; se nombra por su problema y el peldaño errado. */
  "pe26-h4-expediente": (id) => {
    const e = PE.BANCO_H4.find((x) => x.id === id);
    return e ? `${PE.textoPeldanoH4(e.peldanos.problema)}: no encaja ${nombrePeldano(e.errado)}` : null;
  },
  /* H5 (exploratoria): `<paso>-<opción>` y `final-<a>+<b>`. */
  "pe26-h5-dos-fiebres": (id) => {
    const f = /^final-(.+)$/.exec(String(id));
    if (f) return PE.FINALES_H5[f[1]]?.lectura ?? null;
    const m = /^([a-z]+)-([a-z]+)$/.exec(String(id));
    const paso = m && PE.PASOS_H5.find((p) => p.id === m[1]);
    return paso?.opciones.find((o) => o.id === m[2])?.texto ?? null;
  },
};
