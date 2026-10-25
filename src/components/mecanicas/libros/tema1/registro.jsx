import { FAE } from "../../../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 4 · LO COMÚN DE LOS SEIS HACER PUBLICADOS DEL TEMA 1 (P2 de Mai, anexo
 * común C1 a C6: fichas/b-t1-hacer-p2-mai.md; ajustes a la auditoría de
 * Shoko: fichas/b-t1-p2-ajustes-shoko-mai.md).
 *
 * C2 · el veredicto se pinta dentro de cada pieza, sin tocar `Retro` ni
 * `Responder`, que son compartidos (Erwin, #487). Un intento por decisión.
 * El modelo es el registro: tras responder enseña lo correcto, se acierte o
 * no, y lo elegido queda como fantasma (contorno coral discontinuo).
 *
 * Bordes sin salto: el reposo ya es un borde de 2 px (transparente, con el
 * contorno de 1 px pintado por dentro con `box-shadow`), así que pasar a
 * acierto o a error no cambia el ancho de nada ni reacomoda el texto.
 *
 * C5 · lo que entra, con opacidad y `translateY` de 6 a 0 en 240 ms; la curva
 * de la casa; nada en bucle. Con movimiento reducido, al instante.
 *
 * Aquí no vive ningún texto de contenido: las palabras del veredicto son las
 * de `b5/Devolucion.jsx` y los textos de cada pieza, de su banco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SORA = "Sora, sans-serif";
export const INTER = "Inter, sans-serif";
export const SECUNDARIO = "#A8B6C8";
export const NAVY = "#1D3557";
export const RIEL = "#B8C4D4";
const TEAL = "#2A9D8F";

export const CURVA = "cubic-bezier(.3,.9,.4,1)";

/* Los tres estados de un destino (C2). */
export const REPOSO = "reposo";
export const ACIERTO = "acierto";
export const FANTASMA = "fantasma";

export function estiloC2(estado) {
  if (estado === ACIERTO) return { border: `2px solid ${FAE.text}`, background: NAVY, boxShadow: "none" };
  if (estado === FANTASMA) return { border: `2px dashed ${FAE.coral}`, background: "transparent", boxShadow: "none" };
  return { border: "2px solid transparent", background: "transparent", boxShadow: "inset 0 0 0 1px rgba(248,249,250,.35)" };
}

/* El contenedor hundido del escenario (C3: su alto no cambia al responder). */
export const HUNDIDO = {
  boxSizing: "border-box", borderRadius: "12px",
  background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
};

export const CLASE_ENTRA = "fae-t1r-entra";
export const CLASE_APARECE = "fae-t1r-aparece";
export const CSS_REGISTRO = `
@keyframes fae-t1r-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.${CLASE_ENTRA} { animation: fae-t1r-entra 240ms ${CURVA} both; }
@keyframes fae-t1r-aparece { from { opacity: 0; } to { opacity: 1; } }
.${CLASE_APARECE} { animation: fae-t1r-aparece 240ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) {
  .${CLASE_ENTRA}, .${CLASE_APARECE} { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

/* «Pregunta 2 de 6»: el contador de la fila de 44 del encabezado compacto (C1). */
export const contadorDe = (etiqueta, n, total) => `${etiqueta} ${n} de ${total}`;

/* El botón de avance de las piezas de B (el mismo de t1-5): teal con texto oscuro; apagado sin respuesta. */
export function Avance({ children, onClick, deshabilitado = false, refBoton }) {
  return (
    <button ref={refBoton} type="button" data-avance onClick={onClick} disabled={deshabilitado} style={{
      width: "100%", minHeight: "44px", marginTop: "14px", borderRadius: "999px", cursor: deshabilitado ? "default" : "pointer",
      fontFamily: SORA, fontSize: "14px", fontWeight: 700,
      background: deshabilitado ? "transparent" : TEAL, color: deshabilitado ? SECUNDARIO : "#06202A",
      border: deshabilitado ? "1px solid rgba(248,249,250,.16)" : `1px solid ${TEAL}`,
    }}>
      {children}
    </button>
  );
}
