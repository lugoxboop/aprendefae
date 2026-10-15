import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TÍTULO DEL TEMA NO SE CORTA A 320 PX (Célula C: T7-1, T7-2, T7-3 y T5).
 *
 * La cabecera compacta compartida (auth/AccountControl.jsx) le pone al h1 de
 * `.fae-cabecera-titulo` white-space: nowrap y text-overflow: ellipsis, y a
 * 320 px «Inventarios III: descuentos…» se leía «Inventarios III: des…».
 * La regla de la casa (orquestador/conocimiento/herramientas.md, «La regla
 * que salió de la primera pasada»): el título puede encogerse o romper en
 * dos líneas, pero no desaparecer. Cada célula lo arregla en su vista; el
 * componente compartido no se toca.
 *
 * Esta prueba lee el h1 de cada vista nuestra y exige el estilo en línea que
 * le gana a la regla compartida: minWidth 0, white-space normal, overflow
 * visible y sin elipsis.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const VISTAS = ["ContabilidadT7_1View", "ContabilidadT7_2View", "ContabilidadT7_3View", "ContabilidadTema5View"];

/* El objeto de estilo del h1 del título, como texto: «{ fontFamily: …, … }». */
function estiloDelTitulo(fuente) {
  const m = fuente.match(/<h1 data-titulo-tema style=\{\{([^}]*)\}\}>\s*\{tema\.title\}\s*<\/h1>/);
  return m ? m[1] : null;
}

test("★★★ la regla compartida sigue truncando el h1 de la cabecera compacta (por eso cada vista la anula)", () => {
  const regla = leer("orquestador/conocimiento/herramientas.md");
  assert.match(regla, /### La regla que salió de la primera pasada: el título del tema se corta/);
  const compartida = leer("src/components/auth/AccountControl.jsx");
  assert.match(compartida, /\.fae-cabecera-titulo > h1 \{[^}]*white-space: nowrap;/);
});

for (const vista of VISTAS) {
  test(`★★★ ${vista}: el título del tema rompe en dos líneas en vez de cortarse`, () => {
    const fuente = leer(`src/components/${vista}.jsx`);
    /* Vive en la fila flex de la cabecera, junto al botón de volver. */
    assert.match(fuente, /className="fae-cabecera-titulo"/);
    const estilo = estiloDelTitulo(fuente);
    assert.ok(estilo, "no está el h1 con data-titulo-tema que pinta {tema.title}");
    assert.match(estilo, /\bminWidth: 0\b/, "sin minWidth: 0 no encoge");
    assert.match(estilo, /\bwhiteSpace: "normal"/, "sin white-space normal no rompe en dos líneas");
    assert.match(estilo, /\boverflow: "visible"/, "con overflow oculto se corta");
    assert.doesNotMatch(estilo, /textOverflow: "ellipsis"|whiteSpace: "nowrap"/);
    /* Un solo título de tema por vista. */
    assert.equal(fuente.match(/<h1\b/g).length, 1);
  });
}
