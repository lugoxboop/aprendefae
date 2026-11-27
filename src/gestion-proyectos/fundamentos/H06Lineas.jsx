/*
 * H06 · Cinco formas de hacer la app (gp26-fun-h06-lineas, Medio, 25 FP × %).
 * Cinco rieles apilados; en cada uno el celular recorre la línea en bucle y
 * las marcas dicen qué pasa en cada tramo (A predictivo … E híbrido, diseño
 * H06). Las cinco etiquetas, en la bandeja de abajo. Retro por par.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H06 } from "./textos-c1.js";

export const ID = GP_H06.id;
export const ESCENA = { nombre: "rieles", fondo: ["#1d2f52", "#0c1528"], acento: "#6f86ff", luz: "rgba(111,134,255,.22)", portada: "celular" };

export default function H06Lineas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
