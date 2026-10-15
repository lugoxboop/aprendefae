import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TÍTULO DEL TEMA NO SE CORTA A 320 PX (Célula C: T7-1, T7-2, T7-3 y T5).
 *
 * La regla de la casa (orquestador/conocimiento/herramientas.md, «La regla
 * que salió de la primera pasada»): el título puede encogerse o romper en
 * dos líneas, pero no desaparecer.
 *
 * Antes, la cabecera compacta compartida (auth/AccountControl.jsx) truncaba
 * el h1 a una línea con «…», y cada vista nuestra le ganaba con estilos en
 * línea. Erwin lo arregló en lo compartido (#228): ahora el h1 rompe en
 * renglones, con tope de dos, y no pone puntos suspensivos. Por decisión de
 * L se quitó el rodeo: las vistas ya no traen esos estilos, y esta prueba
 * comprueba la regla donde vive ahora, en lo compartido, y que ninguna vista
 * nuestra la vuelva a cortar.
 *
 * El tope de dos renglones pide títulos que quepan: «Inventarios III:
 * descuentos, inventario físico y NIC 2» necesitaba cuatro a 320 px y pasó a
 * «Inventarios III: descuentos, conteo y NIC 2». Los renglones reales los
 * mide scripts/t7/medir-titulo-320.mjs en Chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const VISTAS = ["ContabilidadT7_1View", "ContabilidadT7_2View", "ContabilidadT7_3View", "ContabilidadTema5View"];

/* La regla compartida del h1 de la cabecera compacta, como texto. */
function reglaCompartida() {
  const m = leer("src/components/auth/AccountControl.jsx").match(/\.fae-cabecera-titulo > h1 \{([^}]*)\}/);
  assert.ok(m, "no está la regla .fae-cabecera-titulo > h1 en AccountControl.jsx");
  return m[1];
}

test("★★★ lo compartido rompe el título en renglones y no lo corta con «…»", () => {
  const r = reglaCompartida();
  assert.match(r, /white-space: normal;/, "sin white-space normal no rompe en renglones");
  assert.match(r, /min-width: 0;/, "sin min-width 0 no encoge en la fila flex");
  assert.match(r, /-webkit-line-clamp: 2;/, "el tope es de dos renglones");
  assert.doesNotMatch(r, /white-space: nowrap|text-overflow: ellipsis/, "volvería a cortar en una línea con «…»");
});

for (const vista of VISTAS) {
  test(`★★★ ${vista}: el título vive en la cabecera compartida y nada en la vista lo vuelve a cortar`, () => {
    const fuente = leer(`src/components/${vista}.jsx`);
    assert.match(fuente, /className="fae-cabecera-titulo"/);
    const m = fuente.match(/<h1 data-titulo-tema style=\{\{([^}]*)\}\}>\s*\{tema\.title\}\s*<\/h1>/);
    assert.ok(m, "no está el h1 con data-titulo-tema que pinta {tema.title}");
    /* Ni corte ni un overflow en línea que anule el tope de la regla compartida. */
    assert.doesNotMatch(m[1], /textOverflow|whiteSpace|overflow:|WebkitLineClamp/, m[1]);
    assert.equal(fuente.match(/<h1\b/g).length, 1);
  });
}
