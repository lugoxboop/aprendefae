/*
 * H17 · El dial de la autoridad (gp-h17-dial, Medio, 25 FP × %).
 * Simulación exploratoria antes del reto: el dial de radio con las cinco
 * estructuras de la tabla 2-1; arriba, el gerente funcional y tú con la
 * bolsa de presupuesto que pasa de uno a otro, el medidor de aguja
 * «Autoridad del director» y tu rol. Luego, cinco situaciones.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H17 } from "./textos.js";

export const ID = GP_H17.id;
export const ESCENA = { nombre: "dial", fondo: ["#1f2a3c", "#0c121d"], acento: "#f2c14e", luz: "rgba(242,193,78,.18)", portada: "dial-radio" };

export default function H17Dial({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H17} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
