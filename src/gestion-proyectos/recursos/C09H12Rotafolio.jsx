/*
 * C09 · H12 · El rotafolio del practicante (gp26-eje-c09-h12-rotafolio, Difícil, 50 FP × %).
 * El rotafolio sobre trípode con las hojas escritas a marcador (el texto es
 * HTML encima: motor Memorando con el papel «rotafolio»). El practicante
 * sostiene el marcador y la PMO mira con los brazos cruzados. Frase con error
 * tocada: se tacha y aparecen tres correcciones; la buena se escribe en azul.
 * Frase correcta tocada: se subraya en gris con su retro y cuenta en contra.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { GP_C9_H12 } from "./textos-c9.js";

export const ID = GP_C9_H12.id;

// imagen-pendiente: marcador (el rotafolio ya existe)
const ROTAFOLIO = primero("rotafolio");

export const ESCENA = {
  nombre: "rotafolio", fondo: ["#2b2f36", "#0d0f12"], acento: "#a7bbff",
  portada: ROTAFOLIO,
};

export default function C09H12Rotafolio({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
