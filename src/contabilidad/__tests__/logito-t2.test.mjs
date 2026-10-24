import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LOGITO DE T2 (CasilleroDeCuentas), CONTRA SU ESPECIFICACIÓN Y EL SISTEMA.
 *
 * Especificación: orquestador/conocimiento/prompts/logitos-temas-conta-v1.md
 * (§3 geometría, §5 prueba de entrega) y kit.md, «El sistema de los
 * identificadores de tema». Issue #471, lote T2-3b (Misa).
 *
 * Lo que se lee en el código se comprueba aquí. Lo que solo se ve a tamaño
 * real (los nueve a 32 px en gris, la tarjeta a 320 y 375, el contraste del
 * trazo y el movimiento reducido en el navegador) se midió con Playwright y
 * sus cifras van en el cuerpo del PR.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";
import IdentificadorDeTema, { CSS_IDENTIFICADOR } from "../../components/shared/IdentificadorDeTema.jsx";
import { CasilleroDeCuentas } from "../identificadores/identificadoresA.jsx";
import { CajonDePaso } from "../identificadores/CajonDePaso.jsx";
import { TituloConReloj, FacturaPorCobrar } from "../identificadores/identificadoresB.jsx";
import { CajasDelConteo, KardexAlDia, EtiquetaRebajada } from "../identificadores/identificadoresC.jsx";
import { MazoDelCapitulo } from "../identificadores/identificadoresE.jsx";

const CLAVE = "contabilidad/cuentas-debe-haber";
const s = renderToStaticMarkup(h(CasilleroDeCuentas, { size: 64 }));
const TRAZO = 3;
const num = (el, a) => Number(new RegExp(`\\s${a}="(-?[\\d.]+)"`).exec(el)[1]);

/* Las piezas, leídas del SVG que se publica, no de la especificación. */
const rects = s.match(/<rect[^>]*>/g) || [];
const marco = rects.find((r) => !/data-mueve/.test(r));
const ficha = rects.find((r) => /data-mueve/.test(r));
const caja = (r) => ({ x0: num(r, "x"), y0: num(r, "y"), x1: num(r, "x") + num(r, "width"), y1: num(r, "y") + num(r, "height") });
const M = caja(marco); const F = caja(ficha);
const rutas = [...s.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((x) => x[1]).join(" ");
const verticales = [...rutas.matchAll(/M(-?[\d.]+) (-?[\d.]+)V(-?[\d.]+)/g)].map((x) => x.slice(1).map(Number));
const horizontales = [...rutas.matchAll(/M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)/g)].map((x) => x.slice(1).map(Number));
const desplazamiento = Number(/--mueve:\s*translateY\((-?[\d.]+)px\)/.exec(s)?.[1]);

test("L1 · entra en el registro con la clave «materia/tema» y no pisa ninguna de las que ya estaban", () => {
  assert.equal(ICONO_POR_TEMA[CLAVE], CasilleroDeCuentas);
  const antes = {
    "contabilidad/activos-financieros": TituloConReloj, "contabilidad/cuentas-por-cobrar": FacturaPorCobrar,
    "contabilidad/inventarios-periodico": CajasDelConteo, "contabilidad/inventarios-permanente": KardexAlDia,
    "contabilidad/inventarios-descuentos-nic2": EtiquetaRebajada, "contabilidad/repaso-capitulo-5": MazoDelCapitulo,
  };
  for (const [k, v] of Object.entries(antes)) assert.equal(ICONO_POR_TEMA[k], v, k);
});

test("L2 · la tarjeta lo pinta: el sitio compartido lo encuentra y le pasa el acento", () => {
  const html = renderToStaticMarkup(h(IdentificadorDeTema, { tema: { id: "cuentas-debe-haber" }, materia: "contabilidad", acento: "#E9C46A", respaldo: h("i", null, "respaldo") }));
  assert.match(html, /data-identificador="cuentas-debe-haber"/);
  assert.match(html, /--fae-acento:#E9C46A/);
  assert.doesNotMatch(html, /respaldo/);
  assert.ok(html.includes(s), "dibuja el CasilleroDeCuentas");
});

test("L3 · 64 × 64, viewBox 0 0 64 64, trazo de 3 px redondeado en currentColor, decorativo", () => {
  assert.match(s, /viewBox="0 0 64 64"/); assert.match(s, /width="64" height="64"/);
  assert.match(s, /stroke="currentColor"/); assert.match(s, /stroke-width="3"/);
  assert.match(s, /stroke-linecap="round"/); assert.match(s, /stroke-linejoin="round"/);
  assert.match(s, /aria-hidden="true"/); assert.match(s, /focusable="false"/);
  assert.doesNotMatch(s, /stroke-width="(?!3")/, "un solo grueso de trazo");
});

test("L4 · es el objeto de §3: un marco con una división vertical y una horizontal, ambas a la mitad (2 × 2)", () => {
  assert.equal(rects.length, 2, "marco y ficha, nada más");
  assert.deepEqual(M, { x0: 8, y0: 10, x1: 56, y1: 54 });
  assert.equal(verticales.length, 1); assert.equal(horizontales.length, 1);
  const [vx, vy0, vy1] = verticales[0]; const [hx, hy, hx1] = horizontales[0];
  assert.equal(vx, (M.x0 + M.x1) / 2, "la vertical parte el marco por la mitad");
  assert.deepEqual([vy0, vy1], [M.y0, M.y1], "la vertical va de borde a borde");
  assert.equal(hy, (M.y0 + M.y1) / 2, "la horizontal, solo a media altura (lo que lo separa del calendario)");
  assert.deepEqual([hx, hx1], [M.x0, M.x1]);
  /* La ficha, en la casilla de arriba a la derecha. */
  assert.ok(F.x0 > vx && F.x1 < M.x1 && F.y0 > M.y0 && F.y1 < hy, "ficha en la casilla superior derecha");
});

test("L5 · dibujo dentro de 4…60 en reposo y en movimiento, contando el medio trazo", () => {
  const m = TRAZO / 2;
  for (const [x0, y0, x1, y1] of [[M.x0, M.y0, M.x1, M.y1], [F.x0, F.y0 + desplazamiento, F.x1, F.y1 + desplazamiento]]) {
    assert.ok(x0 - m >= 4 && y0 - m >= 4 && x1 + m <= 60 && y1 + m <= 60, `${x0},${y0},${x1},${y1}`);
  }
  /* Nada asoma por encima del marco: el calendario se distingue por sus anillas (§5.1). */
  for (const [, y0, y1] of verticales) assert.ok(Math.min(y0, y1) >= M.y0);
});

test("L6 · 4 px o más entre trazos en reposo (borde a borde); en movimiento la ficha no toca el marco", () => {
  const borde = TRAZO; // dos medios trazos
  const vx = verticales[0][0]; const hy = horizontales[0][1];
  const huecos = {
    "ficha–división vertical": F.x0 - vx - borde,
    "ficha–marco derecho": M.x1 - F.x1 - borde,
    "ficha–marco de arriba": F.y0 - M.y0 - borde,
    "ficha–división horizontal": hy - F.y1 - borde,
  };
  for (const [k, v] of Object.entries(huecos)) assert.ok(v >= 4, `${k}: ${v} px`);
  const arribaEnMovimiento = F.y0 + desplazamiento - M.y0 - borde;
  assert.ok(arribaEnMovimiento > 0, `en movimiento, ficha–marco de arriba: ${arribaEnMovimiento} px`);
});

test("L7 · un solo elemento en el acento, y es la ficha, con el único relleno tintado al 16 %", () => {
  assert.equal((s.match(/var\(--fae-acento\)/g) || []).length, 2, "trazo y relleno de la ficha, nada más");
  assert.match(ficha, /stroke="var\(--fae-acento\)"/); assert.match(ficha, /fill="var\(--fae-acento\)"/);
  assert.equal((s.match(/fill-opacity="0.16"/g) || []).length, 1);
  assert.match(ficha, /fill-opacity="0.16"/);
  assert.doesNotMatch(s, /fill="(?!none|var\(--fae-acento\))/, "ningún otro relleno");
  assert.doesNotMatch(s, /stroke="(?!currentColor|var\(--fae-acento\))/, "ningún otro color de trazo");
});

test("L8 · se mueve una sola pieza, la del acento, con solo transform y dentro del tope de §3 (3 px)", () => {
  assert.equal((s.match(/data-mueve/g) || []).length, 1);
  assert.equal((s.match(/--mueve/g) || []).length, 1);
  assert.match(ficha, /data-mueve/);
  assert.equal(desplazamiento, -3, "sube 3 px: el tope de §3 (el sistema permite 4)");
  /* La regla compartida: 400 ms, la curva del sistema, y con movimiento reducido no se mueve nada. */
  assert.match(CSS_IDENTIFICADOR, /transition: transform 400ms cubic-bezier\(\.3,\.9,\.4,1\)/);
  assert.match(CSS_IDENTIFICADOR, /prefers-reduced-motion: reduce\)[\s\S]*transition: none; transform: none;/);
  assert.doesNotMatch(s, /<animate|@keyframes|animation/i, "nada al cargar ni en bucle");
});

test("L9 · sin letras, cifras, imágenes ni los colores y efectos prohibidos", () => {
  assert.doesNotMatch(s, /<text|<tspan|<image|<foreignObject|<use/i);
  assert.doesNotMatch(s, /#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i, "ningún color propio: lo pone la tarjeta");
  assert.doesNotMatch(s, /Gradient|filter|shadow|<mask|<pattern/i);
});

test("L10 · distinto de todos los identificadores registrados y del cajón de T4", () => {
  const otros = [...new Set([...Object.values(ICONO_POR_TEMA), CajonDePaso])].filter((c) => c !== CasilleroDeCuentas);
  assert.ok(otros.length >= 7);
  for (const C of otros) assert.notEqual(renderToStaticMarkup(h(C, { size: 64 })), s, C.name);
});
