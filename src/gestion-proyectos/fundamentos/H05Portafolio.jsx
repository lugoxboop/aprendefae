/*
 * H05 · Arma el mapa de Altamira (gp26-fun-h05-portafolio, Medio, 25 × 2 FP × %).
 * Etapa 1: el tablero de corcho con el marco «Portafolio de Altamira» y tres
 * zonas con chinche y cordel; la tarjeta clavada tira su cordel a la zona.
 * La patrocinadora y la PMO miran el tablero.
 * Etapa 2: cuatro preguntas de la junta; en la tercera, la vía crece en la
 * maqueta.
 */
import { FolderOpen, Pin, RefreshCw } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H05 } from "./textos-c1.js";

export const ID = GP_H05.id;

const Marco = () => (
  <p className="gp-escenita" style={{ justifyContent: "center", margin: "10px 0 0", border: "2px solid #c99a5b" }} data-marco-portafolio>
    Portafolio de Altamira
  </p>
);

export const ESCENA = {
  nombre: "corcho", fondo: ["#3a2c1a", "#1a140c"], acento: "#c99a5b", luz: "rgba(201,154,91,.22)",
  portada: "tablero-corcho",
  etapas: [
    {
      mesa: "pmo",
      objeto: { id: "tablero-corcho", alto: 70 },
      anim: "pesa",
      encima: () => <Marco />,
      destinos: { programa: { objeto: "carpeta-documento", alto: 36, icono: FolderOpen }, sueltos: { icono: Pin }, operaciones: { icono: RefreshCw } },
    },
    {
      mesa: "patrocinadora",
      objeto: null,
      objetoDe: (paso) => (paso.id === "h05-m3" ? { id: "carretera", alto: 72 } : paso.id === "h05-m4" ? { id: "edificio-oficinas", alto: 80 } : null),
      anim: "pesa",
    },
  ],
};

export default function H05Portafolio({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
