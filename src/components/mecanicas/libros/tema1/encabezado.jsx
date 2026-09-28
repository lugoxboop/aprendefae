import { FAE } from "../../../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS DE TEXTO QUE COMPARTEN LAS ACTIVIDADES DEL TEMA 1.
 *
 * Dos, y las dos salen de la reescritura de lenguaje.
 *
 * ═══════════ 1 · EL OBJETIVO Y LA CONSIGNA ═══════════
 *
 * El objetivo dice qué se va a aprender; la consigna, qué hacer con los dedos.
 * Las dos se quedan fijas y visibles toda la partida — no son un aviso que
 * aparece al empezar y se va: el estudiante que se pierde a mitad de la tanda
 * no tiene dónde volver a leer qué le están pidiendo.
 *
 * Y la consigna NO reemplaza al texto de «vacío». El vacío es la pregunta que
 * encabeza la elección y desaparece en cuanto se elige; la consigna se queda.
 *
 * ═══════════ 2 · LA IDEA SIMPLE Y EL TÉRMINO DEL LIBRO ═══════════
 *
 * Los términos del libro —activo, pasivo, patrimonio, estado de situación
 * financiera— no entran dentro de ninguna frase. Van como rótulo al lado de la
 * idea simple, que es la que manda: «Lo que tiene» grande, «Activo» pequeño al
 * lado. Las dos se ven siempre; ninguna se abrevia ni se quita.
 *
 * A 375 px se apila solo, sin medir nada: es un flex que envuelve. Si el
 * término no cabe en el renglón de la idea, cae al siguiente y ya.
 *
 * ═══════════ EL COLOR ═══════════
 *
 * Nada de esto usa teal ni ámbar: los dos significan debe y haber en esta
 * materia y el Tema 1 va antes de que eso signifique algo. Tampoco coral, que
 * es error. Solo neutros.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export function Encabezado({ objetivo, consigna }) {
  return (
    <div data-encabezado style={{ margin: "0 0 14px" }}>
      <p data-objetivo style={{
        margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
      }}>
        {objetivo}
      </p>
      <p data-consigna style={{
        margin: "6px 0 0", paddingTop: "6px", fontSize: "12px", lineHeight: 1.45,
        color: "rgba(248,249,250,0.6)", borderTop: "1px solid rgba(248,249,250,0.12)",
      }}>
        {consigna}
      </p>
    </div>
  );
}

/**
 * La idea simple con el término del libro al lado.
 *
 *   idea     lo que se lee primero y en grande
 *   termino  el nombre del libro, pequeño, al lado o debajo si no cabe
 */
export function IdeaConTermino({ idea, termino, tamano = 13, color = FAE.text }) {
  return (
    <span data-idea={idea} style={{
      display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "1px 6px", minWidth: 0,
    }}>
      <span style={{
        fontFamily: SORA, fontSize: `${tamano}px`, fontWeight: 700, lineHeight: 1.25, color,
      }}>
        {idea}
      </span>
      <span data-termino={termino} style={{
        fontSize: `${Math.max(9, tamano - 3.5)}px`, lineHeight: 1.25,
        color: "rgba(248,249,250,0.55)", whiteSpace: "nowrap",
      }}>
        {termino}
      </span>
    </span>
  );
}
