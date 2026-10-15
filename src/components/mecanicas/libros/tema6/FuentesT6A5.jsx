import { PIE_SIMULADO } from "../../../../data/contabilidadT6Pieza5.js";
import { INTER, NODO, TEXTO, BORDES, PIE } from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 · EL RÓTULO FIJO Y LOS CUATRO TIPOS DE PIE (guía de Mai
 * v1 §2 y §3).
 *
 * El rótulo fijo (ROTULO_SIMULADO_T6_A5, en los datos) es la primera
 * línea de la tabla del ejemplo (capa 2) y del tablero (capa 3): caja de
 * radio 8, borde 1 nodo al 60 %, relleno 2/8, sin fondo, Inter 12/600 en
 * nodo. Nunca se atenúa.
 *
 * Cuatro tipos de pie, tres formas, y ninguno se distingue solo por el color:
 *   1 · libro: texto llano secundario (el pie de siempre);
 *   2 · escenario: caja redondeada, de la familia del rótulo;
 *   3 · norma: caja de esquinas rectas, borde neutro, Inter 12/400 en texto;
 *   4 · norma y libro: la norma en su caja recta y « · Libro, p. 201» llano.
 * Las cajas miden lo mismo que el pie llano (el interlineado de 16 del PIE
 * publicado, con el borde dentro): cambiar de pie no mueve «Siguiente».
 *
 * Los textos llegan de los datos; aquí no se escribe ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const NODO_60 = "rgba(203,220,242,0.6)";
/* El alto de una línea del pie llano (PIE.lineHeight) menos los dos bordes de la caja. */
const LINEA_CAJA = `${Number.parseFloat(PIE.lineHeight) - 2}px`;

export const ROTULO = {
  display: "block", margin: 0, padding: "2px 8px", borderRadius: "8px", border: `1px solid ${NODO_60}`,
  fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35, color: NODO, background: "transparent",
};

export function RotuloSimulado({ texto }) {
  return <p data-rotulo-simulado style={ROTULO}>{texto}</p>;
}

/* El tipo de un pie, por su texto. */
export function tipoDePie(texto) {
  if (/^Fuente: .+ · Libro, p\. \d+$/.test(texto)) return "norma-y-libro";
  if (texto.startsWith("Fuente")) return "norma";
  if (texto === PIE_SIMULADO) return "escenario";
  return "libro";
}

const CAJA = {
  display: "inline-block", maxWidth: "100%", boxSizing: "border-box", padding: "0 6px",
  fontFamily: INTER, fontSize: "12px", lineHeight: LINEA_CAJA, verticalAlign: "top",
};
export const CAJA_ESCENARIO = { ...CAJA, borderRadius: "8px", border: `1px solid ${NODO_60}`, fontWeight: 600, color: NODO };
export const CAJA_NORMA = { ...CAJA, borderRadius: 0, border: `1px solid ${BORDES}`, fontWeight: 400, color: TEXTO };

/* Va dentro del <p> del pie (el de la máquina o el de la caja): por eso son <span>. */
export function PieDeFuente({ texto }) {
  const tipo = tipoDePie(texto);
  if (tipo === "escenario") return <span data-tipo-pie={tipo} style={CAJA_ESCENARIO}>{texto}</span>;
  if (tipo === "norma") return <span data-tipo-pie={tipo} style={CAJA_NORMA}>{texto}</span>;
  if (tipo === "norma-y-libro") {
    const corte = texto.indexOf(" · Libro");
    return (
      <span data-tipo-pie={tipo}>
        <span data-parte-norma style={CAJA_NORMA}>{texto.slice(0, corte)}</span>
        <span data-parte-libro>{texto.slice(corte)}</span>
      </span>
    );
  }
  return <span data-tipo-pie={tipo}>{texto}</span>;
}
