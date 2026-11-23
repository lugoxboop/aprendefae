/*
 * Macro 2026 · los objetos del kit de animación: cada uno existe, y las
 * proporciones anotadas en kit.jsx son las del PNG (para que width/height fijos
 * no deformen la imagen). Ninguna pieza usa ya a las personas (FotoPersonaje):
 * todos los personajes son mascotas (mascotas.jsx, orden de Mateo del 23-nov).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OBJETOS, Objeto, rutaObjeto } from "../comun/kit.jsx";

const medidaPng = (f) => { const b = readFileSync(`public${f}`); assert.equal(b.subarray(1, 4).toString(), "PNG", f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("kit: los 36 objetos, con sus medidas de origen", () => {
  assert.equal(Object.keys(OBJETOS).length, 36);
  for (const [id, m] of Object.entries(OBJETOS)) assert.deepEqual(medidaPng(rutaObjeto(id)), m, id);
});

test("ninguna pieza de Macro 2026 usa personas: solo mascotas", () => {
  const raiz = new URL("../", import.meta.url);
  const archivos = readdirSync(raiz, { recursive: true }).filter((f) => /\.jsx$/.test(f) && !/personajes\.jsx$/.test(f));
  for (const f of archivos) assert.ok(!readFileSync(new URL(f, raiz), "utf8").includes("FotoPersonaje"), f);
});

test("Objeto: decorativo por defecto, tamaño fijo proporcional", () => {
  const html = renderToStaticMarkup(React.createElement(Objeto, { id: "carrito", alto: 136 }));
  assert.match(html, /alt=""/);
  assert.match(html, /width="150"/);
  assert.match(html, /height="136"/);
});
