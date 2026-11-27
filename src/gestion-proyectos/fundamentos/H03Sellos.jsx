/*
 * H03 · El sello del porqué (gp26-fun-h03-sellos, Medio, 25 FP × %).
 * Escena: el escritorio de madera con la carpeta abierta al centro y los
 * cuatro sellos de goma con su ícono y nombre. Al tocar un sello baja con
 * golpe y deja la marca en la carpeta; la patrocinadora asiente. Error: el
 * sello rebota y la marca no queda. Clave: criterio de Gen (textos.js).
 */
import { Compass, MessageCircle, Scale, Wrench } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H03 } from "./textos-c1.js";

export const ID = GP_H03.id;
export const ESCENA = {
  nombre: "sellos", fondo: ["#3b2a20", "#1a120c"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: "sello-goma",
  mesa: "patrocinadora",
  objeto: { id: "carpeta-abierta", alto: 80 },
  anim: "sella", sello: true, sale: false,
  destinos: {
    cumplir: { objeto: "sello-goma", alto: 40, icono: Scale },
    interesados: { objeto: "sello-goma", alto: 40, icono: MessageCircle },
    estrategia: { objeto: "sello-goma", alto: 40, icono: Compass },
    producto: { objeto: "sello-goma", alto: 40, icono: Wrench },
  },
};

export default function H03Sellos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
