import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FICHA_RESERVA } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BANDA DE LA FICHA DE FP (Xeno, 24 oct., #349).
 *
 *   ·  la ficha se queda fija: no hay oyente de scroll que la esconda
 *   ·  en Contabilidad todo destino de un desplazamiento automático lleva
 *      scroll-margin-top de 84 px, por CSS, con el mismo número que theme.js
 *   ·  todas las vistas de Contabilidad llevan esa reserva, y Macro no
 * ═══════════════════════════════════════════════════════════════════════════
 */

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");

test("★★★ la ficha de FP no se esconde al bajar: AccountControl no escucha el scroll", () => {
  const fuente = leer("../components/auth/AccountControl.jsx");
  assert.doesNotMatch(fuente, /addEventListener\(\s*["']scroll["']/);
  assert.doesNotMatch(fuente, /UMBRAL_FICHA/);
});

test("★★★ la regla de global.css usa el mismo número que FICHA_RESERVA (84)", () => {
  assert.equal(FICHA_RESERVA, 84);
  const css = leer("../styles/global.css");
  const regla = css.match(/\.fae-reserva-ficha \*\s*\{([^}]*)\}/);
  assert.ok(regla, "falta la regla .fae-reserva-ficha * en global.css");
  assert.match(regla[1], new RegExp(`scroll-margin-top:\\s*${FICHA_RESERVA}px`));
});

test("★★★ todas las vistas de Contabilidad llevan la reserva, y ninguna de Macro", () => {
  const app = leer("../App.jsx");
  const bloque = app.match(/const VISTAS_CONTABILIDAD = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(bloque, "falta VISTAS_CONTABILIDAD en App.jsx");
  const vistas = new Set([...bloque[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  /* Un tema nuevo de Contabilidad no puede quedarse fuera sin que esto lo diga. */
  for (const tema of SUBJECTS.contabilidad.topics) assert.ok(vistas.has(tema.id), `${tema.id} no lleva la reserva`);
  for (const tema of SUBJECTS.macroeconomia.topics) assert.ok(!vistas.has(tema.id), `${tema.id} es de Macro y no se toca`);
  assert.match(app, /VISTAS_CONTABILIDAD\.has\(view\) \? <div className="fae-reserva-ficha" style=\{\{ display: "contents" \}\}>/);
});
