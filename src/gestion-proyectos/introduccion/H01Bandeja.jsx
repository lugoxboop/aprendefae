/*
 * H01 · La bandeja de los lunes (gp-h01-bandeja, Fácil, 10 FP × %).
 * Escena: la cinta transportadora cruza con un sobre a la vez; abajo, las dos
 * bandejas de madera (Proyecto · reloj de arena con bandera; Operación ·
 * engranaje con flecha circular). Acierto: el sobre cae en la bandeja y
 * aparece la pista de 3 palabras. La cinta avanza solo cuando decides.
 */
import { Hourglass, RefreshCw } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H01 } from "./textos.js";

export const ID = GP_H01.id;
export const ESCENA = {
  nombre: "cinta", fondo: ["#3a2a1c", "#16120e"], acento: "#e9c46a", luz: "rgba(233,196,106,.22)",
  portada: "cinta-transportadora",
  objeto: { id: "cinta-transportadora", alto: 104 },
  anim: "cae",
  destinos: {
    proyecto: { objeto: "bandeja-madera", alto: 60, icono: Hourglass },
    operacion: { objeto: "bandeja-madera", alto: 60, icono: RefreshCw },
  },
};

export default function H01Bandeja({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
