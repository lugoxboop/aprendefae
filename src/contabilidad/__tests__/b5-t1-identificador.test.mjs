import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 · LibretaYLapiz, el identificador de «Introducción a la contabilidad»
 * (Ukyo, prompts/logitos-temas-conta-v1.md §3; el sistema de Xeno en kit.md).
 * Las mismas seis comprobaciones que los de las otras células.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import { LibretaYLapiz } from "../identificadores/identificadoresA.jsx";
import { SUBJECTS } from "../../data/subjects.js";
import { CSS_IDENTIFICADOR } from "../../components/shared/IdentificadorDeTema.jsx";

const s = renderToStaticMarkup(h(LibretaYLapiz, { size: 64 }));

test("T1-1 · la entrada de la Célula B, con la clave «materia/tema» de un tema que existe", () => {
  assert.equal(ICONO_POR_TEMA["contabilidad/introduccion-contabilidad"], LibretaYLapiz);
  assert.ok(SUBJECTS.contabilidad.topics.some((t) => t.id === "introduccion-contabilidad"));
});

test("T1-2 · 64 × 64, trazo de 3 px redondeado y en currentColor, decorativo", () => {
  for (const r of [/viewBox="0 0 64 64"/, /width="64" height="64"/, /stroke="currentColor"/, /stroke-width="3"/, /stroke-linecap="round"/, /stroke-linejoin="round"/, /aria-hidden="true"/]) assert.match(s, r);
});

test("T1-3 · un solo elemento en el acento (el lápiz con su virola), con el único relleno al 16 %", () => {
  assert.equal((s.match(/fill="var\(--fae-acento\)"/g) || []).length, 1);
  assert.equal((s.match(/stroke="var\(--fae-acento\)"/g) || []).length, 1);
  assert.equal((s.match(/fill-opacity="0.16"/g) || []).length, 1);
  assert.doesNotMatch(s, /fill="(?!none|var\(--fae-acento\))/);
});

test("T1-4 · se mueve solo el lápiz: sube 4 px, como levantarlo para escribir", () => {
  assert.equal((s.match(/data-mueve/g) || []).length, 1);
  assert.deepEqual([...s.matchAll(/--mueve:([^;"]+)/g)].map((x) => x[1].trim()), ["translateY(-4px)"]);
  assert.match(s, /<g data-mueve[^>]*><path d="M47 16a5 5 0 0 1 10 0V40L52 50L47 40Z"/);
});

test("T1-5 · dentro de 4…60 (también al moverse) y 4 px o más entre trazos (geometría de Ukyo)", () => {
  const medio = 1.5;
  /* Libreta 6…38 × 8…56; lápiz 47…57 × 11…50 (la punta del arco, 16 − 5), que al subir llega a 7. */
  assert.ok(6 - medio >= 4 && 38 + medio <= 60 && 8 - medio >= 4 && 56 + medio <= 60);
  assert.ok(11 - 4 - medio >= 4, "el lápiz se sale por arriba al moverse");
  assert.ok(57 + medio <= 60 && 50 + medio <= 60);
  /* Libreta–lápiz: 47 − 38 = 9 px de eje a eje, 6 de trazo a trazo. */
  assert.ok(47 - 38 - 2 * medio >= 4);
});

test("T1-6 · sin letras, sin cifras y sin los colores prohibidos; distinto de los demás del registro", () => {
  assert.doesNotMatch(s, /<text|<tspan|<image|<foreignObject|<circle/i);
  assert.doesNotMatch(s, /#E76F51|#EE8266|#2A9D8F|#3FA69A|linearGradient|radialGradient|filter=/i);
  const otros = Object.entries(ICONO_POR_TEMA).filter(([k]) => k !== "contabilidad/introduccion-contabilidad").map(([, C]) => renderToStaticMarkup(h(C, { size: 64 })));
  assert.ok(otros.length >= 6);
  assert.ok(otros.every((o) => o !== s));
});

test("T1-7 · el movimiento (Shoko, §5.4): una vez, 400 ms, solo transform, y con movimiento reducido nada se mueve", () => {
  const css = CSS_IDENTIFICADOR.replace(/\s+/g, " ");
  assert.match(css, /\.fae-identificador \[data-mueve\] \{ transition: transform 400ms cubic-bezier\(\.3,\.9,\.4,1\);/);
  assert.match(css, /:hover \.fae-identificador \[data-mueve\],[^{]*\{ transform: var\(--mueve, none\); \}/);
  const reducido = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reducido, /\[data-mueve\] \{ transition: none; transform: none; \}/);
  /* El markup del logito, aquí mismo: lo único que lleva data-mueve es el lápiz, después de la libreta. */
  const s = renderToStaticMarkup(h(LibretaYLapiz, { size: 64 }));
  assert.equal((s.match(/data-mueve/g) || []).length, 1);
  assert.match(s, /<rect x="6" y="8" width="32" height="48" rx="4"><\/rect><path d="M14 22H30M14 32H30M14 42H24"><\/path><g data-mueve/);
});
