/*
 * C12 · H06 · El cambiavías (gp26-pla-c12-h06-metodo-seleccion, Medio, 25 FP × %).
 * El cambiavías ferroviario visto desde arriba, con seis vías que terminan en
 * seis estaciones pequeñas con letrero (en 2 columnas de 3 a 320 px). El
 * vagón de madera trae la compra; se toca la estación (o se mueve la palanca)
 * y el vagón recorre la vía; al errar, choca suave con el tope y vuelve. El
 * hámster hace de guardavía.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C12_H06 } from "./textos-c12.js";

export const ID = GP_C12_H06.id;

// imagen-pendiente: cambiavias · estacion-tren · vagon-madera · palanca-hierro
const CAMBIAVIAS = primero("cambiavias", "anden-metro", "estacion-tranvia");
const VAGON = primero("vagon-madera", "tranvia");
const ESTACION = primero("estacion-tren", "estacion-tranvia");

export const ESCENA = {
  nombre: "cambiavias", fondo: ["#2a3324", "#0c100a"], acento: "#c9b37e", luz: "rgba(201,179,126,.16)",
  portada: CAMBIAVIAS,
  mesa: "equipo",
  objeto: { id: VAGON, alto: 56 },
  anim: "cae",
  disposicion: "tablero",
  antes: () => <EstiloLote6 />,
  destinos: { "*": { objeto: ESTACION, alto: 26, forma: "palanca" } },
};

export default function C12H06Cambiavias({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
