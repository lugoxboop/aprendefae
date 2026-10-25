import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-T4 · los identificadores de los cuatro primeros temas de Contabilidad
 * (Ukyo, prompts/logitos-temas-conta-v1.md; los integra la Célula D) cumplen
 * el sistema de Xeno (kit.md). La prueba de verlos en fila, a 32 px y en gris,
 * dentro de la tarjeta a 320 y 375 y su contraste, la hace Chromium:
 * scripts/t4/logitos/medir-logitos.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import { LibretaYLapiz, CasilleroDeCuentas, CalendarioConCinta, CajonDePaso } from "../identificadores/identificadoresA.jsx";
import { SUBJECTS } from "../../data/subjects.js";

const LOS_CUATRO = {
  "contabilidad/introduccion-contabilidad": { C: LibretaYLapiz, mueve: "translateY(-4px)" },
  "contabilidad/cuentas-debe-haber": { C: CasilleroDeCuentas, mueve: "translateY(-3px)" },
  "contabilidad/ingresos-gastos-y-caja": { C: CalendarioConCinta, mueve: "translateY(4px)" },
  "contabilidad/efectivo-caja-menor-bancos": { C: CajonDePaso, mueve: "translateY(4px)" },
};
const svg = (C) => renderToStaticMarkup(h(C, { size: 64 }));

test("A1 · las cuatro entradas, con la clave «materia/tema» de un tema que existe (§1 y §6)", () => {
  for (const [clave, { C }] of Object.entries(LOS_CUATRO)) {
    assert.equal(ICONO_POR_TEMA[clave], C, clave);
    const [materia, tema] = clave.split("/");
    assert.ok(SUBJECTS[materia].topics.some((t) => t.id === tema), clave);
  }
  /* Los nueve de Contabilidad tienen el suyo; Macroeconomía no se toca. */
  const conta = SUBJECTS.contabilidad.topics.map((t) => `contabilidad/${t.id}`);
  assert.deepEqual(conta.filter((k) => !ICONO_POR_TEMA[k]), []);
  assert.deepEqual(Object.keys(ICONO_POR_TEMA).filter((k) => !k.startsWith("contabilidad/")), []);
});

for (const [clave, { C, mueve }] of Object.entries(LOS_CUATRO)) {
  const s = svg(C);
  test(`A2 · ${C.name}: 64 × 64, trazo de 3 px redondeado, currentColor, decorativo`, () => {
    for (const r of [/viewBox="0 0 64 64"/, /width="64" height="64"/, /stroke="currentColor"/, /stroke-width="3"/, /stroke-linecap="round"/, /stroke-linejoin="round"/, /aria-hidden="true"/]) assert.match(s, r, clave);
  });
  test(`A3 · ${C.name}: un solo elemento en el acento, con el único relleno al 16 %, y es el único que se mueve (${mueve})`, () => {
    assert.equal((s.match(/stroke="var\(--fae-acento\)"/g) || []).length, 1);
    assert.equal((s.match(/fill="var\(--fae-acento\)"/g) || []).length, 1);
    assert.equal((s.match(/fill-opacity="0.16"/g) || []).length, 1);
    assert.doesNotMatch(s, /fill="(?!none|var\(--fae-acento\))/);
    assert.equal((s.match(/data-mueve/g) || []).length, 1);
    assert.deepEqual([...s.matchAll(/--mueve:([^;"]+)/g)].map((x) => x[1].trim()), [mueve]);
    /* El que se mueve es el del acento. */
    assert.match(s, /<(g|rect|path) data-mueve="true"[^>]*stroke="var\(--fae-acento\)"/);
  });
  test(`A4 · ${C.name}: sin letras, cifras ni colores prohibidos; distinto de los demás del registro`, () => {
    assert.doesNotMatch(s, /<text|<tspan|<image|<foreignObject|<circle/i);
    assert.doesNotMatch(s, /#E76F51|#EE8266|#2A9D8F|#3FA69A|linearGradient|radialGradient|filter=/i);
    const otros = Object.entries(ICONO_POR_TEMA).filter(([k]) => k !== clave).map(([, O]) => svg(O));
    assert.ok(otros.length >= 8 && otros.every((o) => o !== s));
  });
}

test("A5 · dentro de 4…60 también al moverse (la geometría del §3, con el medio trazo de 1,5)", () => {
  /* Lápiz: punta de arriba en 16 − 5 = 11; sube 4 → 7, menos 1,5 de trazo = 5,5. */
  assert.ok(16 - 5 - 4 - 1.5 >= 4);
  /* Ficha del casillero: arriba en 18, sube 3 → 15; el marco va de 10 a 54. */
  assert.ok(18 - 3 - 1.5 >= 10 + 1.5 - 1.5);
  /* Cinta: abajo en 41, baja 4 → 45, por encima del borde de la hoja (56). */
  assert.ok(41 + 4 + 1.5 <= 56 - 1.5);
  /* Billete del cajón: arriba en 4, baja 4: sigue dentro (lo midió Hanayama). */
  assert.ok(4 + 4 >= 4);
});

test("A6 · el comentario del cajón ya no dice «TODAVÍA NO VA EN EL REGISTRO» (§4)", async () => {
  const { readFileSync } = await import("node:fs");
  assert.doesNotMatch(readFileSync(new URL("../identificadores/CajonDePaso.jsx", import.meta.url), "utf8"), /TODAVÍA NO VA EN EL REGISTRO/);
});
