import { useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL «¿POR QUÉ?» PLEGADO (Célula C · T7 y T5) — lote 1 de la revisión.
 *
 * En aciertos, errores y bloques de texto, lo que pase de 2 frases se pliega
 * detrás de «¿Por qué?» y se abre al tocar (salvo una condición: ver CONDICION). La pantalla queda limpia por
 * defecto. Se aplica solo, sin tocar los textos: el texto entero sigue en el
 * DOM —el resto, en un <span hidden>— y «¿Por qué?» es un botón cuyo rótulo
 * va en aria-label y se pinta con ::after, así que el textContent del
 * párrafo es el texto original, letra por letra (lo que leen las pruebas y
 * el panel docente).
 *
 * UNA FRASE termina en «.», «!», «?» o «…» (con un «»» o «)» detrás, si lo
 * hay) seguida de espacio y de algo que empieza frase: mayúscula, «¿», «¡» o
 * «««. Así «p. 194», «pp. 207 y 208» y «$1.000.000» no cortan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const POR_QUE = "¿Por qué?";
export const FRASES_VISIBLES = 2;

const FIN_DE_FRASE = /[.!?…][»)]?(?=\s+[A-ZÁÉÍÓÚÑ¿¡«])/g;

/*
 * REGLA DE L (con la auditoría de Mello a los recortes): una condición que
 * limita una definición o una regla no se pliega, porque detrás de «¿Por
 * qué?» solo la vería quien acierta y lo abre. Una frase con «solo»,
 * «directamente», «cuando» o «si» se queda a la vista: lo visible llega hasta
 * la última frase que la trae, y se pliega solo lo que va después. El orden
 * del texto no cambia.
 */
const CONDICION = /(?<!\p{L})(solo|sólo|directamente|cuando|si)(?!\p{L})/iu;

/** [lo visible, lo plegado]. Lo plegado empieza con el espacio que lo separa; juntos dan el texto original. */
export function partirEnFrases(texto, visibles = FRASES_VISIBLES) {
  const t = String(texto ?? "");
  const cortes = [...t.matchAll(FIN_DE_FRASE)].map((m) => m.index + m[0].length);
  if (cortes.length < visibles) return [t, ""];
  let corte = cortes[visibles - 1];
  /* Cada frase de lo que se plegaría, con su final; si trae una condición, lo visible llega hasta ella. */
  const finales = [...cortes.slice(visibles), t.length];
  let desde = corte;
  for (const fin of finales) {
    if (CONDICION.test(t.slice(desde, fin))) corte = fin;
    desde = fin;
  }
  return t.slice(corte).trim() ? [t.slice(0, corte), t.slice(corte)] : [t, ""];
}

const CSS = `
.fae-por-que { appearance: none; display: inline; margin: 0 0 0 6px; padding: 0; border: none; background: none;
  color: #A8B6C8; font: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.fae-por-que::after { content: "${POR_QUE}"; }
/*
 * Va en línea con el texto, así que no puede medir 44 px de alto sin abrir
 * el renglón. El área de toque crece por fuera, invisible, como los botones
 * pequeños de global.css: \`max(100%, 44px)\` en los dos sentidos.
 */
.fae-por-que { position: relative; }
.fae-por-que::before { content: ""; position: absolute; left: 50%; top: 50%; width: max(100%, 44px); height: max(100%, 44px); transform: translate(-50%, -50%); }
.fae-por-que:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; border-radius: 4px; }
`;

/* Las reglas del botón van una sola vez en el <head>: dentro del párrafo, un <style> ensuciaría su texto. */
function asegurarCss() {
  if (typeof document === "undefined" || document.getElementById("fae-por-que-css")) return;
  const el = document.createElement("style");
  el.id = "fae-por-que-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * El texto, con lo que pasa de 2 frases plegado detrás de «¿Por qué?». Si el
 * texto trae su plegado escrito aparte (`porque`, de los recortes de Near y
 * Mello), se usa ese: lo visible es `texto` y lo plegado, `porque`.
 */
export function Plegable({ texto, porque = null }) {
  const [abierto, setAbierto] = useState(false);
  const [visible, resto] = porque ? [texto, ` ${porque}`] : partirEnFrases(texto);
  if (!resto) return texto;
  asegurarCss();
  return (
    <>
      {visible}
      <span data-plegado hidden={!abierto}>{resto}</span>
      {!abierto && (
        <button type="button" className="fae-por-que" data-por-que aria-label={POR_QUE} aria-expanded="false" onClick={() => setAbierto(true)} />
      )}
    </>
  );
}
