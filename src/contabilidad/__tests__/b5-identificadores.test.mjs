/*
 * Lote 16 · los identificadores de tema de T5 y T6 (Mai), en el sistema de Xeno
 * (orquestador/conocimiento/kit.md): 64 × 64, trazo de 3 px redondeado en
 * currentColor, un solo elemento en el acento, un solo `data-mueve` con un
 * transform dentro del tope (4 px o 10°), nada al cargar ni en bucle, sin
 * letras ni cifras, y decorativo.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import { TituloConReloj, FacturaPorCobrar } from "../identificadores/identificadoresB.jsx";

const B = { "contabilidad/activos-financieros": TituloConReloj, "contabilidad/cuentas-por-cobrar": FacturaPorCobrar };

test("★★★ T5 y T6 entran al registro con su clave «materia/tema»", () => {
  for (const [clave, Dibujo] of Object.entries(B)) assert.equal(ICONO_POR_TEMA[clave], Dibujo, clave);
});

for (const [clave, Dibujo] of Object.entries(B)) {
  test(`★★★ ${clave}: en el sistema de Xeno`, () => {
    const svg = renderToStaticMarkup(React.createElement(Dibujo, { size: 64 }));
    assert.match(svg, /viewBox="0 0 64 64"/);
    assert.match(svg, /width="64" height="64"/);
    assert.match(svg, /stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/);
    assert.match(svg, /aria-hidden="true"/, "el nombre ya lo da la tarjeta");
    assert.doesNotMatch(svg, /role="img"|aria-label/);
    assert.equal((svg.match(/var\(--fae-acento\)/g) ?? []).length, 1, "el acento en más de un elemento");
    assert.equal((svg.match(/data-mueve/g) ?? []).length, 1, "se mueve más de un elemento");
    const mueve = svg.match(/--mueve:([^;"]+)/)[1];
    const px = mueve.match(/^translate[XY]\((-?\d+(?:\.\d+)?)px\)$/), gr = mueve.match(/^rotate\((-?\d+(?:\.\d+)?)deg\)$/);
    assert.ok(px || gr, `--mueve no es un transform del kit: ${mueve}`);
    if (px) assert.ok(Math.abs(Number(px[1])) <= 4, "más de 4 px");
    if (gr) assert.ok(Math.abs(Number(gr[1])) <= 10, "más de 10°");
    assert.doesNotMatch(svg, /animation|@keyframes|<style|<text|<animate/, "movimiento al cargar o letras en el dibujo");
    assert.doesNotMatch(svg, /#[0-9a-f]{3,6}\b/i, "un color propio: lo pone la tarjeta");
  });
}

test("★★ con otro tamaño, el dibujo se escala", () => {
  for (const Dibujo of Object.values(B)) assert.match(renderToStaticMarkup(React.createElement(Dibujo, { size: 32 })), /width="32" height="32"/);
});
