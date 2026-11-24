/*
 * Macro 2026 · el elenco de mascotas (orden de Mateo, 23-nov). Cada pose
 * existe, es WebP, pesa ≤ 120 KB y mide lo que declara MASCOTAS. Se dibuja a
 * 120 px de alto como mínimo, con el rol escrito debajo. Y las tres piezas
 * publicadas que tenían personas ahora usan su mascota, grande.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MASCOTAS, INTERACCIONES, MascotaRol, EscenaMascotas, rutaMascota, rutaInteraccion } from "../comun/mascotas.jsx";

// Ancho y alto de un WebP (VP8, VP8L o VP8X) leídos de la cabecera.
function tamWebp(b) {
  assert.equal(b.subarray(0, 4).toString(), "RIFF");
  assert.equal(b.subarray(8, 12).toString(), "WEBP");
  const t = b.subarray(12, 16).toString();
  if (t === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (t === "VP8L") { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}

test("las 10 mascotas × 3 poses y las 6 escenas existen, pesan ≤ 120 KB y miden lo declarado", () => {
  assert.equal(Object.keys(MASCOTAS).length, 10);
  for (const [id, m] of Object.entries(MASCOTAS)) {
    assert.equal(Object.keys(m.poses).length, 3, id);
    for (const pose of Object.keys(m.poses)) {
      const { src, tam } = rutaMascota(id, pose);
      const f = `public${src}`;
      assert.deepEqual(tamWebp(readFileSync(f)), tam, f);
      assert.ok(statSync(f).size <= 120 * 1024, f);
    }
  }
  for (const [id, tam] of Object.entries(INTERACCIONES)) {
    const f = `public${rutaInteraccion(id)}`;
    assert.deepEqual(tamWebp(readFileSync(f)), tam, f);
  }
});

test("MascotaRol: nunca menos de 120 px, proporción real y el rol escrito debajo", () => {
  const html = renderToStaticMarkup(React.createElement(MascotaRol, { id: "empresario", alto: 72 }));
  assert.match(html, /height="120"/);
  assert.match(html, /width="67"/); // 279/502 × 120
  assert.match(html, /<figcaption[^>]*>Empresario<\/figcaption>/);
  const sin = renderToStaticMarkup(React.createElement(MascotaRol, { id: "analista", rotulo: false }));
  assert.match(sin, /alt="Analista"/);
  const esc = renderToStaticMarkup(React.createElement(EscenaMascotas, { id: "familia-carrito" }));
  assert.match(esc, /height="180"/);
});

test("las piezas publicadas usan su mascota grande: H4 el empresario, H5 la analista, la escalera la autoridad", () => {
  /*
   * Rediseño lote 1: en H4 y H5 la mascota pasó a la franja de escena (180 px
   * en la tarjeta de inicio, 120 px en cada ronda), declarada en ESCENAS de
   * T1; la pieza la pide con escena={ESCENAS[ID]}.
   */
  const usa = {
    "../demanda-agregada/H4Empresario.jsx": /escena=\{ESCENAS\[ID\]\}/,
    "../demanda-agregada/H5Libreta.jsx": /escena=\{ESCENAS\[ID\]\}/,
    "../comun/Escalera.jsx": /<MascotaRol id="autoridad-economica" pose="timon" alto=\{120\}/,
  };
  const t1 = readFileSync(new URL("../demanda-agregada/textos.js", import.meta.url), "utf8");
  assert.match(t1, /"da26-h4-empresario": plaza\([^)]*mascota: \{ id: "empresario", pose: "periodico" \}/);
  /* Variedad de animales (fondos-vida): en H5 la libreta la revisa el inversionista. */
  assert.match(t1, /"da26-h5-libreta": plaza\([^)]*mascota: \{ id: "inversionista", pose: "monedas" \}/);
  for (const [f, re] of Object.entries(usa)) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    assert.match(src, re, f);
    assert.ok(!src.includes("FotoPersonaje"), `${f} ya no usa personas`);
  }
});
