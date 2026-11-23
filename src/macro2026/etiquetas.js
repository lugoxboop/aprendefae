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
import * as PF from "./politica-fiscal/textos.js";
import * as PM from "./politica-monetaria/textos.js";
import * as PC from "./politica-cambiaria/textos.js";
import { TRIBUTOS } from "./comun/tributos.js";
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

  /* ─── T3 «Política fiscal» (lote 4) ─── */
  /* H1: un ítem por pago; se nombra con su buzón. */
  "pf26-h1-moneda": (id) => {
    const t = PF.BANCO_H1.find((x) => x.id === id);
    return t ? `${t.texto} → ${TRIBUTOS[t.correcta].nombre}` : null;
  },
  /* H2: un ítem por tributo; se nombra con su cajero. */
  "pf26-h2-cajero": (id) => {
    const t = PF.BANCO_H2.find((x) => x.id === id);
    return t ? `${t.texto} → ${t.correcta === "directo" ? "Directo" : "Indirecto"}` : null;
  },
  /* H3: `<documento>-<línea>`, un ítem por línea de cada documento. */
  "pf26-h3-factura": (id) => {
    const m = /^([a-z]+)-([a-z]+)$/.exec(String(id));
    const d = m && PF.DOCUMENTOS_H3.find((x) => x.id === m[1]);
    const l = d?.lineas.find((x) => x.id === m[2]);
    return l ? `${d.titulo}: ${l.texto} (${PF.FICHAS_H3.find((f) => f.id === l.clave).nombre})` : null;
  },
  /* H5: un ítem por reto; se nombra con su consigna. */
  "pf26-h5-montanas": (id) => PF.H5.retos.find((r) => r.id === id)?.consigna ?? null,
  /* H4: `<medida>-plato` y `<medida>-entrada`, dos criterios por medida. */
  "pf26-h4-expande": (id) => {
    const m = /^(.+)-(plato|entrada)$/.exec(String(id));
    const x = m && PF.BANCO_H4.find((e) => e.id === m[1]);
    if (!x) return null;
    return m[2] === "plato" ? `${x.texto}: ¿expande o contrae?` : `${x.texto}: ¿por dónde entra?`;
  },
  /* H6: un ítem por memo; se nombra con la frase que está mal. */
  "pf26-h6-memo": (id) => {
    const memo = PF.BANCO_H6.find((x) => x.id === id);
    return memo ? `Memo: ${memo.frases.find((f) => f.falsa).texto}` : null;
  },

  /* ─── T4 «Política monetaria» (lote 5) ─── */
  /* H1: `<operación>-<medidor>`, tres flechas por operación. */
  "pm26-h1-entra-sale": (id) => {
    const m = /^(.+)-(activos|bm|m2)$/.exec(String(id));
    const op = m && PM.BANCO_H1.find((x) => x.id === m[1]);
    const med = m && PM.MEDIDORES_H1.find((x) => x.id === m[2]);
    return op && med ? `${op.texto} → ${med.nombre} ${PM.FLECHAS[op.correctas[med.id]]}` : null;
  },
  /* H2: una etapa por meta. */
  "pm26-h2-cascada-meta": (id) => {
    const e = PM.ETAPAS_H2.find((x) => x.id === id);
    return e ? `Meta ${e.meta.toLocaleString("es-CO")}: encaje ${e.solucion} %` : null;
  },
  /* H3: una ficha por ítem; se nombra con su agregado. */
  "pm26-h3-cajas": (id) => {
    const f = PM.BANCO_H3.find((x) => x.id === id);
    return f ? `${f.texto} → ${PM.CAJAS_H3.find((c) => c.id === f.correcta).nombre}` : null;
  },
  /* H4: `<suceso>-curva` y `<suceso>-direccion`. */
  "pm26-h4-mueve-tasa": (id) => {
    const m = /^(.+)-(curva|direccion)$/.exec(String(id));
    const s = m && PM.BANCO_H4.find((x) => x.id === m[1]);
    if (!s) return null;
    return m[2] === "curva" ? `${s.texto}: ¿qué curva?` : `${s.texto}: ¿hacia dónde?`;
  },
  /* H6: una ficha de dominó por ítem; se nombra con su texto. */
  "pm26-h6-domino": (id) => {
    for (const c of PM.BANCO_H6) {
      const f = c.fichas.find((x) => x.id === id);
      if (f) return `${c.nombre}: ${f.texto} (${f.orden + 1}.º)`;
    }
    return null;
  },
  /* H5: `<ronda>-<palanca>`. */
  "pm26-h5-junta": (id) => {
    const m = /^(r\d)-(tasa|tes|encaje)$/.exec(String(id));
    const r = m && PM.RONDAS_H5.find((x) => x.id === m[1]);
    const p = m && PM.PALANCAS.find((x) => x.id === m[2]);
    return r && p ? `${r.lectura} → ${p.nombre}: ${p.posiciones[r.correctas[p.id]]}` : null;
  },

  /* ─── T5 «Política cambiaria» (lote 6) ─── */
  /* H1: `<pregunta>-peso` y `<pregunta>-dolar`. */
  "pc26-h1-quien-aprecia": (id) => {
    const m = /^(q\d)-(peso|dolar)$/.exec(String(id));
    const q = m && PC.BANCO_H1.find((x) => x.id === m[1]);
    return q ? `$${q.a.toLocaleString("es-CO")} → $${q.b.toLocaleString("es-CO")}: el ${m[2] === "peso" ? "peso" : "dólar"} ${q.correctas[m[2]] === "aprecia" ? "se aprecia" : "se deprecia"}` : null;
  },
  /* H2: `<suceso>-curva` y `<suceso>-direccion`. */
  "pc26-h2-empuja-curva": (id) => {
    const m = /^(.+)-(curva|direccion)$/.exec(String(id));
    const s = m && PC.BANCO_H2.find((x) => x.id === m[1]);
    if (!s) return null;
    return m[2] === "curva" ? `${s.texto}: ¿qué curva?` : `${s.texto}: ¿hacia dónde?`;
  },
  /* H3: `<ronda>-aguja` y `<ronda>-exportador`. */
  "pc26-h3-aguja": (id) => {
    const m = /^(r\d)-(aguja|exportador)$/.exec(String(id));
    const r = m && PC.BANCO_H3.find((x) => x.id === m[1]);
    if (!r) return null;
    const datos = `afuera ${r.afuera} %, aquí ${r.aqui} %, dólar ${r.nominal} %`;
    return m[2] === "aguja" ? `${datos}: la aguja` : `${datos}: ¿y el exportador?`;
  },
  /* H4: una noticia por ítem. */
  "pc26-h4-a-quien-sirve": (id) => {
    const n = PC.BANCO_H4.find((x) => x.id === id);
    return n ? `${n.texto} → ${n.gana === "exportadora" ? "la exportadora" : "la importadora"}` : null;
  },
  /* H5: una decisión por ítem. */
  "pc26-h5-donde-ahorro": (id) => {
    const d = PC.CASOS_H5.flatMap((c) => c.decisiones).find((x) => x.id === id);
    return d ? `${d.consigna} → ${d.correcta === "aqui" ? "aquí" : "afuera"}` : null;
  },
  /* H6: un hecho por ítem. */
  "pc26-h6-correa": (id) => {
    const h = PC.BANCO_H6.find((x) => x.id === id);
    return h ? `${h.texto} → ${PC.REGIMENES.find((r) => r.id === h.regimen).nombre}` : null;
  },
};
