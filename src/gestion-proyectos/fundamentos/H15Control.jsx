/*
 * H15 · ¿Lo controlas o te controla? (gp26-fun-h15-control, Medio, 25 × 2 FP × %).
 * Etapa 1: a la izquierda la nube de tormenta sobre la bodega (EEF: no lo
 * controla tu equipo); a la derecha el archivador metálico de Altamira (OPA:
 * lo tiene la organización para usarlo). En EEF la nube la absorbe; en OPA
 * el cajón la guarda. Siempre entran los dos EEF internos (la trampa).
 * Etapa 2: el mismo archivador con dos cajones: «Se actualiza en el
 * proyecto» (el lápiz del equipo escribe) y «Lo cambia la PMO con su
 * procedimiento» (con candado).
 */
import { Lock, Pencil } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H15 } from "./textos-c2.js";

export const ID = GP_H15.id;
export const ESCENA = {
  nombre: "bodega", fondo: ["#1d2e3f", "#0b131d"], acento: "#6cc3d5", luz: "rgba(108,195,213,.2)",
  portada: "bodega",
  etapas: [
    {
      objeto: { id: "bodega", alto: 80 },
      anim: "cae",
      destinos: { eef: { objeto: "nube-tormenta", alto: 46 }, opa: { objeto: "archivador-metalico", alto: 50 } },
    },
    {
      mesa: "equipo",
      objeto: { id: "archivador-metalico", alto: 80 },
      anim: "abre",
      disposicion: "columna",
      destinos: { actualiza: { icono: Pencil }, pmo: { objeto: "candado", alto: 36, icono: Lock } },
    },
  ],
};

export default function H15Control({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H15} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
