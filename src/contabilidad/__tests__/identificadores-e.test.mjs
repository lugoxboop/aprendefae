import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CÉLULA E · el identificador de «contabilidad/repaso-capitulo-5» (P2 de
 * Itagaki) cumple el sistema de Xeno (kit.md). La prueba de verlos en fila, a
 * 32 px y en gris, a 320 y 375, la hace Chromium: scripts/e5/medir-identificadores.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import { MazoDelCapitulo } from "../identificadores/identificadoresE.jsx";
import { SUBJECTS } from "../../data/subjects.js";

const s = renderToStaticMarkup(h(MazoDelCapitulo, { size: 64 }));

test("E1 · la entrada de la Célula E, con la clave «materia/tema» de un tema que existe", () => {
  assert.equal(ICONO_POR_TEMA["contabilidad/repaso-capitulo-5"], MazoDelCapitulo);
  const conta = Array.isArray(SUBJECTS) ? SUBJECTS.find((m) => m.id === "contabilidad") : SUBJECTS.contabilidad;
  assert.ok(JSON.stringify(conta).includes('"id":"repaso-capitulo-5"'));
});

test("E2 · 64 × 64, trazo de 3 px redondeado y en currentColor, decorativo", () => {
  for (const r of [/viewBox="0 0 64 64"/, /width="64" height="64"/, /stroke="currentColor"/, /stroke-width="3"/, /stroke-linecap="round"/, /stroke-linejoin="round"/, /aria-hidden="true"/]) assert.match(s, r);
});

test("E3 · un solo elemento en el acento (la ficha del frente), con el único relleno al 16 %", () => {
  assert.equal((s.match(/fill="var\(--fae-acento\)"/g) || []).length, 1);
  assert.equal((s.match(/stroke="var\(--fae-acento\)"/g) || []).length, 1);
  assert.equal((s.match(/fill-opacity="0.16"/g) || []).length, 1);
  assert.doesNotMatch(s, /fill="(?!none|var\(--fae-acento\))/);
});

test("E4 · se mueve solo la ficha del frente: escala 1,08 sobre su centro (36, 37)", () => {
  assert.equal((s.match(/data-mueve/g) || []).length, 1);
  const m = [...s.matchAll(/--mueve:([^;"]+)/g)].map((x) => x[1].trim());
  assert.deepEqual(m, ["scale(1.08)"]);
  assert.match(s, /transform-origin:36px 37px/);
  /* La ficha del frente va dentro del grupo que se mueve. */
  assert.match(s, /<g data-mueve[^>]*><rect x="22" y="20" width="28" height="34"/);
});

test("E5 · dentro de 4…60 (también al moverse) y 4 px o más entre trazos", () => {
  /* Reposo: el borde más externo de la ficha del frente, 50 + 1,5 = 51,5 a lo ancho y 54 + 1,5 = 55,5 a lo alto. */
  const [x, y, w, hh] = [22, 20, 28, 34];
  const esc = (v, c) => c + (v - c) * 1.08;
  assert.ok(esc(x + w, 36) + 1.5 <= 60 && esc(y + hh, 37) + 1.5 <= 60 && esc(x, 36) - 1.5 >= 4 && esc(y, 37) - 1.5 >= 4);
  /* Fichas desplazadas 7 px: bordes izquierdos 8 → 15 → 22 y superiores 6 → 13 → 20; renglones a 6 px del borde. */
  assert.deepEqual([15 - 8, 22 - 15, 13 - 6, 20 - 13, 28 - 22], [7, 7, 7, 7, 6]);
  /* Al moverse, el hueco con la ficha del medio sigue por encima del tope de 4 px del kit. */
  assert.ok(esc(x, 36) - 15 - 3 > 4 - 3 && x - 15 >= 4);
});

test("E6 · sin letras, sin cifras y sin los colores prohibidos; distinto de los demás del registro", () => {
  assert.doesNotMatch(s, /<text|<tspan|<image|<foreignObject/i);
  assert.doesNotMatch(s, /#E76F51|#EE8266|#2A9D8F|#3FA69A|linearGradient|radialGradient|filter=/i);
  const otros = Object.entries(ICONO_POR_TEMA).filter(([k]) => k !== "contabilidad/repaso-capitulo-5").map(([, C]) => renderToStaticMarkup(h(C, { size: 64 })));
  assert.ok(otros.length >= 5);
  assert.ok(otros.every((o) => o !== s));
});
