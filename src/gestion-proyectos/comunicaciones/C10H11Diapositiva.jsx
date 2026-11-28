/*
 * C10 · H11 · La diapositiva del practicante (gp26-moc-c10-h11-diapositiva, Difícil, 50 FP × %).
 * La pantalla de proyección con el proyector encendido; la diapositiva es
 * HTML encima (motor Memorando; el papel es la pantalla en cuanto exista).
 * El practicante sostiene el control remoto y la PMO mira desde la puerta.
 * Frase con error tocada: se cubre y aparecen tres correcciones; la buena se
 * escribe en la diapositiva. Frase correcta tocada: se subraya en gris con su
 * retro y cuenta en contra.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { GP_C10_H11 } from "./textos-c10.js";

export const ID = GP_C10_H11.id;

// imagen-pendiente: pantalla-proyeccion · proyector · control-remoto
const PANTALLA = primero("pantalla-proyeccion", "pantalla-llamado");

export const ESCENA = {
  nombre: "diapositiva", fondo: ["#22252e", "#0a0b0e"], acento: "#a7bbff",
  portada: PANTALLA,
};

export default function C10H11Diapositiva({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
