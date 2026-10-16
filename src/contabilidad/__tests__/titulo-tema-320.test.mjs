import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TÍTULO DEL TEMA NO SE CORTA A 320 PX.
 *
 * La regla de la casa no cambió: el título puede encogerse o romper en dos
 * renglones, pero NO desaparecer. Lo que cambió es dónde se cumple.
 *
 * ESTA PRUEBA VIGILABA EL RODEO, Y EL RODEO SE FUE. La cabecera compacta
 * compartida (auth/AccountControl.jsx) le ponía al h1 white-space: nowrap y
 * elipsis, y a 320 px «Inventarios III: descuentos…» se leía «Inventarios
 * III: des…». Mientras la hoja cortaba, cada vista se defendía con estilos en
 * línea, y esta prueba exigía esos estilos: minWidth 0, white-space normal,
 * overflow visible.
 *
 * Siete vistas acabaron con el mismo rodeo —las cuatro de esta célula, más
 * T4, T6 y el repaso del capítulo 5—. Siete copias del mismo arreglo, y las
 * vistas que nadie tocó seguían cortando. Así que el arreglo subió a la hoja
 * compartida: `-webkit-line-clamp` para toda `.fae-cabecera-titulo > h1`.
 *
 * Entonces los siete rodeos sobran, y exigirlos era pedir que volvieran. Esta
 * prueba defiende ahora lo mismo de siempre, pero del lado correcto:
 *
 *   1. que la hoja compartida recorte a dos renglones y no haya vuelto a
 *      cortar palabras;
 *   2. que NINGUNA de nuestras cuatro vistas vuelva a traer en línea una
 *      propiedad que venza a la hoja. Un `overflow: "visible"` en línea basta
 *      para que el tope de dos renglones deje de topar, y no se vería en
 *      ninguna otra prueba.
 *
 * Lo que se ve de verdad, a 320 y 375 px en Chromium, lo mide
 * scripts/t7/medir-titulo-320.mjs. Un archivo leído como texto dice qué se
 * pidió, no qué se ve —y tampoco si compila: a este archivo le da igual que
 * la hoja tenga un error de sintaxis, eso solo lo caza la compilación—.
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

/* El cuerpo de la regla compartida del título, como texto. */
function reglaCompartida() {
  return leer("src/components/auth/AccountControl.jsx").match(/\.fae-cabecera-titulo > h1 \{([^}]*)\}/)?.[1];
}

test("★★★ la hoja compartida recorta el título a dos renglones en vez de cortarle palabras", () => {
  const regla = reglaCompartida();
  assert.ok(regla, "la hoja compartida ya no tiene regla para el h1 de la cabecera compacta");
  /*
   * CUATRO, no dos, y el número salió de medir. A 320 px al título le quedan
   * 164 px, y «Inventarios III: descuentos, inventario físico y NIC 2» pide
   * cuatro renglones ahí (tres a 360, dos a 375). Con el tope en dos perdía
   * las últimas palabras sin poner puntos suspensivos.
   *
   * Si alguien baja el tope, esta prueba se pone roja: bajarlo es volver a
   * cortar ese título, y hay que volver a medir antes de tocarlo.
   */
  assert.match(regla, /-webkit-line-clamp:\s*4;/, "cambió el tope de renglones: hay que volver a medir los diez títulos a 320 px");
  assert.match(regla, /-webkit-box-orient:\s*vertical;/, "sin box-orient vertical el recorte no se aplica");
  assert.match(regla, /white-space:\s*normal;/, "sin white-space normal no rompe de renglón");
  assert.match(regla, /min-width:\s*0;/, "sin min-width 0 un hijo flex no baja de su contenido");
  assert.doesNotMatch(regla, /nowrap/, "volvió el nowrap: el título perderá palabras otra vez");
  assert.doesNotMatch(regla, /text-overflow:\s*ellipsis;/, "volvió la elipsis: el título perderá palabras otra vez");
});

test("★★ y la regla de la casa sigue escrita en el canon, con el arreglo donde está ahora", () => {
  const canon = leer("orquestador/conocimiento/herramientas.md");
  assert.match(canon, /### La regla que salió de la primera pasada: el título del tema se corta/);
  assert.match(canon, /AccountControl/, "el canon tiene que decir dónde se arregla, no solo cuál es la regla");
});

for (const vista of VISTAS) {
  test(`★★★ ${vista}: no vuelve a pelearse con la hoja compartida por el título`, () => {
    const fuente = leer(`src/components/${vista}.jsx`);
    /* Vive en la fila flex de la cabecera, junto al botón de volver. */
    assert.match(fuente, /className="fae-cabecera-titulo"/);
    const estilo = estiloDelTitulo(fuente);
    assert.ok(estilo, "no está el h1 con data-titulo-tema que pinta {tema.title}");
    for (const prop of ["minWidth", "flexShrink", "whiteSpace", "overflow", "textOverflow", "overflowWrap", "WebkitLineClamp"]) {
      assert.doesNotMatch(estilo, new RegExp(`\\b${prop}\\s*:`), `${prop} en línea vence a la hoja compartida y anula el recorte sin que se note`);
    }
    /* Pero la tipografía sí es de la vista, y se queda. */
    assert.match(estilo, /fontFamily:/);
    assert.match(estilo, /fontSize:/);
    /* Un solo título de tema por vista. */
    assert.equal(fuente.match(/<h1\b/g).length, 1);
  });
}
