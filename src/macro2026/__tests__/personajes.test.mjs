/*
 * Macro 2026 · el elenco de Gen. Cada archivo existe, es un PNG de 512 × 512
 * y pesa ≤ 120 KB. El <img> lleva alt = nombre del personaje, tamaño fijo y
 * un alto de 72 px como mínimo. Va sobre el disco claro, porque el contorno
 * oscuro se pierde sobre el navy. Y las tres piezas ya publicadas usan su
 * personaje: H4 y H5 de T1, y la escalera de T2.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ELENCO, FotoPersonaje, rutaPersonaje, DISCO } from "../comun/personajes.jsx";

test("los 10 PNG del elenco: 512 × 512, ≤ 120 KB", () => {
  assert.equal(Object.keys(ELENCO).length, 10);
  for (const id of Object.keys(ELENCO)) {
    const f = `public${rutaPersonaje(id)}`;
    const b = readFileSync(f);
    assert.equal(b.subarray(1, 4).toString(), "PNG", id);
    assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [512, 512], id);
    assert.ok(statSync(f).size <= 120 * 1024, `${id}: ${statSync(f).size} B`);
  }
});

test("FotoPersonaje: alt con el nombre, tamaño fijo, perezosa si se pide, sobre el disco claro", () => {
  const html = renderToStaticMarkup(React.createElement(FotoPersonaje, { id: "empresario", alto: 72, perezosa: true }));
  assert.match(html, /alt="El empresario"/);
  assert.match(html, /width="72"/);
  assert.match(html, /height="72"/);
  assert.match(html, /loading="lazy"/);
  assert.ok(html.includes(DISCO.replace(/\s/g, "").slice(0, 10)) || html.includes("201, 209, 228"), "va sobre el disco");
});

// Desde el 23-nov las piezas usan las mascotas (mascotas.test.mjs); los PNG
// de personas se conservan (solo se agrega, nunca se borra).
