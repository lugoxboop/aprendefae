/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BARRA DE ENGANCHE, B1 Y B2 (orquestador/conocimiento/enganche.md),
 * MEDIDAS SOBRE EL DOM. Célula C · piezas de T7 y T5.
 *
 *   B1 · Primero la figura. A 320 px, la figura o la interacción empieza en
 *        los primeros 280 px de la tarjeta; el texto antes de ella no pasa de
 *        40 palabras.
 *   B2 · Presupuesto de texto. En Aprender, como mucho 60 palabras por
 *        pantalla. Lo plegado (detrás de «¿Por qué?») no cuenta.
 *
 * Funciones de DOM puro: las usa la prueba en JSDOM (palabras, en CI) y el
 * script de Chromium (los 280 px, que piden layout de verdad). Una sola
 * regla de qué se cuenta, para que las dos medidas no se separen.
 *
 * QUÉ SE CUENTA [ESCRITO POR CLAUDE, NO POR LA FICHA: convención de medida,
 * la barra no la detalla]. Las palabras que el estudiante tiene que leer:
 * párrafos, objetivo, consigna, pregunta, opciones y retroalimentación. NO se
 * cuentan: el cromo del marco (rótulo y título, `section > header`), los
 * botones de interfaz (`data-boton`: Seguir, Confirmar, Probar otra…), el pie
 * de fuente (`data-pie`), lo que solo oye el lector de pantalla y lo oculto
 * (`hidden`, que es como va lo plegado). El texto de las figuras va aparte,
 * en `figura`: la barra pide que lo que no cabe «lo diga la figura».
 *
 * Palabra: un trozo entre espacios con al menos una letra o un dígito.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const UMBRAL_B1_PX = 280;
export const UMBRAL_B1_PALABRAS = 40;
export const UMBRAL_B2_PALABRAS = 60;

const FUERA = "section > header, [data-boton], [data-pie], [data-por-que], style, script";
const FIGURA = "figure, [data-figura]";
const INTERACCION = "button:not([data-boton]):not([data-por-que]), input, select, textarea";

export const contarPalabras = (texto) => String(texto ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/* ¿Lo ve el estudiante? Oculto, sin pintar o solo para el lector de pantalla: no. */
export function seVe(el, ventana) {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    if (e.hidden) return false;
    const cs = ventana.getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const absoluto = cs.position === "absolute";
    if (absoluto && (cs.width === "1px" || cs.height === "1px" || /rect\(0/.test(cs.clip) || /inset\(50%\)/.test(cs.clipPath))) return false;
  }
  return true;
}

/* La tarjeta: el marco de la pieza, o la raíz si no hay marco. */
export const tarjetaDe = (raiz) => raiz.querySelector("section") ?? raiz;

/* Lo primero, en el orden del documento, que es figura o interacción. */
export function primerAncla(tarjeta, ventana) {
  for (const el of tarjeta.querySelectorAll(`${FIGURA}, ${INTERACCION}`)) {
    if (el.closest(FUERA)) continue;
    if (seVe(el, ventana)) return el.closest(FIGURA) ?? el;
  }
  return null;
}

/**
 * Las palabras de una tarjeta en su estado actual.
 *   texto     las que cuentan para B2
 *   figura    las de las figuras (aparte)
 *   antes     las que cuentan y van antes del ancla de B1
 *   ancla     la figura o interacción de B1 (o null si la pantalla no tiene)
 */
export function medirTarjeta(tarjeta, ventana) {
  const ancla = primerAncla(tarjeta, ventana);
  const doc = tarjeta.ownerDocument;
  const andar = doc.createTreeWalker(tarjeta, ventana.NodeFilter.SHOW_TEXT);
  let texto = 0, figura = 0, antes = 0;
  for (let n = andar.nextNode(); n; n = andar.nextNode()) {
    const el = n.parentElement;
    if (!el || el.closest(FUERA) || !seVe(el, ventana)) continue;
    const p = contarPalabras(n.textContent);
    if (!p) continue;
    if (el.closest(FIGURA)) { figura += p; continue; }
    texto += p;
    if (ancla && !ancla.contains(n) && (ancla.compareDocumentPosition(n) & ventana.Node.DOCUMENT_POSITION_PRECEDING)) antes += p;
  }
  return { texto, figura, antes: ancla ? antes : texto, ancla };
}

/*
 * Los estados de una pantalla de Aprender que se miden: al llegar y, en las
 * preguntas de opción, al fallar la primera vez (la escalera muestra la pista
 * o la devolución) y al acertar. Cada paso es una lista de selectores que se
 * tocan en orden. Las pantallas de lados y de casos se miden al llegar.
 */
export function estadosDePantalla(pantalla) {
  const estados = [{ estado: "al llegar", pasos: [] }];
  const opciones = Array.isArray(pantalla.opciones) && pantalla.opciones.every((o) => o && typeof o === "object" && "id" in o) ? pantalla.opciones : null;
  const bien = opciones?.find((o) => o.correcta);
  const mal = opciones?.find((o) => !o.correcta);
  if (bien && mal) {
    const toque = (o) => [`[data-opcion="${o.id}"]`, '[data-boton="confirmar"]'];
    estados.push({ estado: "al fallar", pasos: toque(mal) });
    estados.push({ estado: "al acertar", pasos: toque(bien) });
  }
  return estados;
}
