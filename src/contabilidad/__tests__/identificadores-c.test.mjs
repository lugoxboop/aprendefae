import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS IDENTIFICADORES DE LA CÉLULA C, CONTRA EL SISTEMA DE XENO (kit.md,
 * «El sistema de los identificadores de tema»). Watari, 17 oct. Lo que se
 * puede leer en el código, se lee aquí; lo que solo se ve (que no se
 * confundan a 32 px), está medido en el artefacto «Identificadores de la
 * Célula C».
 *
 * «activos-financieros» ya lo registró la Célula B (TituloConReloj); el de
 * Watari (TituloConSello) queda en el archivo sin registrar hasta que L decida.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import { TituloConSello, CajasDelConteo, KardexAlDia, EtiquetaRebajada } from "../identificadores/identificadoresC.jsx";

const TEMAS = ["inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2"];
const DIBUJOS = { "inventarios-periodico": CajasDelConteo, "inventarios-permanente": KardexAlDia, "inventarios-descuentos-nic2": EtiquetaRebajada, "activos-financieros": TituloConSello };
const svg = (t) => renderToStaticMarkup(h(DIBUJOS[t], { size: 64 }));
const TODOS = Object.keys(DIBUJOS);

test("I1 · los tres temas de inventarios tienen su entrada de la Célula C, con la clave «materia/tema»", () => {
  for (const t of TEMAS) assert.equal(ICONO_POR_TEMA[`contabilidad/${t}`], DIBUJOS[t], t);
});

test("I1b · no se pisa el de la Célula B en «activos-financieros»", () => {
  assert.notEqual(ICONO_POR_TEMA["contabilidad/activos-financieros"], TituloConSello);
});

test("I2 · 64 × 64, trazo de 3 px redondeado y en currentColor", () => {
  for (const t of TODOS) {
    const s = svg(t);
    assert.match(s, /viewBox="0 0 64 64"/, t); assert.match(s, /width="64" height="64"/, t);
    assert.match(s, /stroke="currentColor"/, t); assert.match(s, /stroke-width="3"/, t);
    assert.match(s, /stroke-linecap="round"/, t); assert.match(s, /stroke-linejoin="round"/, t);
    assert.match(s, /aria-hidden="true"/, t);
  }
});

test("I3 · un solo elemento en el acento, con el único relleno tintado al 16 %", () => {
  for (const t of TODOS) {
    const s = svg(t);
    assert.equal((s.match(/fill="var\(--fae-acento\)"/g) || []).length, 1, `${t}: rellenos en el acento`);
    assert.equal((s.match(/fill-opacity="0.16"/g) || []).length, 1, `${t}: rellenos tintados`);
    assert.doesNotMatch(s, /fill="(?!none|var\(--fae-acento\))/, `${t}: otro relleno`);
  }
});

test("I4 · se mueve una sola pieza, dentro del tope (4 px, 10° o 1,08)", () => {
  for (const t of TODOS) {
    const s = svg(t); const m = [...s.matchAll(/--mueve:([^;"]+)/g)].map((x) => x[1].trim());
    assert.equal((s.match(/data-mueve/g) || []).length, 1, `${t}: piezas que se mueven`);
    assert.equal(m.length, 1, `${t}: --mueve`);
    const ok = /^translate[XY]\((-?[0-4](\.\d+)?)px\)$/.test(m[0]) || /^rotate\((-?(10|[0-9])(\.\d+)?)deg\)$/.test(m[0]) || /^scale\((1(\.0[0-8])?)\)$/.test(m[0]);
    assert.ok(ok, `${t}: ${m[0]}`);
  }
});

test("I5 · sin letras, sin cifras y sin los colores prohibidos", () => {
  for (const t of TODOS) {
    const s = svg(t);
    assert.doesNotMatch(s, /<text|<tspan|<image|<foreignObject/i, t);
    assert.doesNotMatch(s, /#E76F51|#EE8266|#2A9D8F|#3FA69A|linearGradient|radialGradient|filter=/i, t);
  }
});

test("I6 · los cuatro dibujos son distintos", () => {
  assert.equal(new Set(TODOS.map(svg)).size, TODOS.length);
});
