/*
 * Macro 2026 · los objetos del kit de animación: cada uno existe, y las
 * proporciones anotadas en kit.jsx son las del PNG (para que width/height fijos
 * no deformen la imagen). Ningún personaje humano del kit entra (Mateo).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { OBJETOS, Objeto, rutaObjeto } from "../comun/kit.jsx";

const medidaPng = (f) => { const b = readFileSync(`public${f}`); assert.equal(b.subarray(1, 4).toString(), "PNG", f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("kit: los 36 objetos, con sus medidas de origen; sin bustos ni poses", () => {
  assert.equal(Object.keys(OBJETOS).length, 36);
  for (const [id, m] of Object.entries(OBJETOS)) assert.deepEqual(medidaPng(rutaObjeto(id)), m, id);
  assert.ok(!existsSync("public/macro2026/personajes/busto"));
  assert.ok(!existsSync("public/macro2026/personajes/poses"));
});

test("Objeto: decorativo por defecto, tamaño fijo proporcional", () => {
  const html = renderToStaticMarkup(React.createElement(Objeto, { id: "carrito", alto: 136 }));
  assert.match(html, /alt=""/);
  assert.match(html, /width="150"/);
  assert.match(html, /height="136"/);
});
