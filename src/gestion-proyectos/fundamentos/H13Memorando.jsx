/*
 * H13 · El memorando del practicante (gp26-fun-h13-memorando, Difícil, 50 FP × %).
 * Repaso que ataca las confusiones de la ficha: el memorando de papel con
 * clip y membrete de Altamira ocupa la pantalla (el texto es HTML encima);
 * el practicante espera a un lado y la PMO al otro. 6 frases (3 con error y
 * 3 correctas) sorteadas de 9. Puntaje: (errores corregidos al primer
 * intento − correctas tocadas, mínimo 0) / 3.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H13 } from "./textos-c1.js";

export const ID = GP_H13.id;
export const ESCENA = { nombre: "memorando", fondo: ["#203046", "#0d1624"], acento: "#f2c14e", luz: "rgba(242,193,78,.18)", portada: "memorando-clip" };

export default function H13Memorando({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H13} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
