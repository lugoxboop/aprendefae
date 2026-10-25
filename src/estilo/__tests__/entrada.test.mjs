import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ENTRADA, cssEntrada } from "../entrada.js";

/*
 * La entrada a la página: el sitio está puesto, la forma es de Ukyo. Lo que se
 * cuida aquí es que, mientras no la encienda, ninguna página cambie, y que
 * cuando la encienda cumpla las reglas de movimiento de la casa.
 */

test("★ la entrada está apagada hasta que Ukyo la encienda", () => {
  assert.equal(ENTRADA.activa, false, "se encendió: si fue Ukyo, actualiza esta prueba con su especificación");
  const fuente = readFileSync(new URL("../EstilosEntrada.jsx", import.meta.url), "utf8");
  assert.match(fuente, /if \(!entrada\.activa\) return null;/, "apagada tiene que no pintar nada");
});

test("★ encendida, respeta las reglas de movimiento de la casa", () => {
  const css = cssEntrada({ ...ENTRADA, activa: true });
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /\binfinite\b/, "algo quedó en bucle");
  assert.doesNotMatch(css.replaceAll(ENTRADA.curva, ""), /\b(ease|linear|ease-in|ease-out|ease-in-out)\b/, "apareció otra curva");
  assert.equal(ENTRADA.curva, "cubic-bezier(.3,.9,.4,1)");
  const fotogramas = css.match(/@keyframes[^{]+\{([\s\S]*?)\}\s*\}/)[1];
  assert.doesNotMatch(fotogramas, /(width|height|top|left|margin|filter|box-shadow)\s*:/, "anima algo que no es transform u opacity");
});

test("★ el índice de materia lleva el sitio de la entrada: la hoja y los tres grupos en orden", () => {
  const indice = readFileSync(new URL("../../components/TopicIndexView.jsx", import.meta.url), "utf8");
  assert.match(indice, /<EstilosEntrada \/>/);
  const orden = [...indice.matchAll(/data-entrada="(\d)"/g)].map((m) => m[1]);
  assert.deepEqual(orden, ["1", "2", "3"], "cabecera, lo transversal y la rejilla, en ese orden");
});
