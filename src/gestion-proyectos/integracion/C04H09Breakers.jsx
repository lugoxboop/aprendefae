/*
 * C04 · H09 · Apaga el proyecto (gp26-cie-c04-h09-breakers, Medio, 25 × 2 FP × %).
 * Etapa 1: el tablero de breakers de la caseta de obra; bajar un interruptor
 * apaga una luz de la caseta. Las tareas que no son de cierre se dejan arriba
 * con «No es cierre». Al final, el cliente (Operaciones costa) recibe las
 * llaves y la caseta queda a oscuras. Etapa 2: la carpeta del informe final
 * (el mismo papel que el acta): lo que va se archiva dentro.
 */
import { Power, Ban, FolderInput, FolderX } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C4_H09 } from "./textos-c4.js";

export const ID = GP_C4_H09.id;
const TABLERO = primero("tablero-breakers", "conmutador");
const INFORME = primero("carpeta-informe", "carpeta-documento");

function Luces(estado) {
  if (!estado.paso.destinos.some((d) => d.id === "cierre")) return null;
  const apagadas = cuantos(estado, "cierre");
  return (
    <div className="gp-escenita" data-luces-apagadas={apagadas}>
      <span aria-hidden="true" style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: 7 }, (_, k) => <span key={k} style={{ width: 14, height: 14, borderRadius: "50%", background: k < 7 - apagadas ? "#ffc978" : "#2a3a55", boxShadow: k < 7 - apagadas ? "0 0 8px 2px rgba(255,201,120,.6)" : "none", transition: "opacity 300ms" }} />)}
      </span>
      <small>{apagadas >= 7 ? "Caseta a oscuras: Operaciones costa recibe las llaves." : `${apagadas} de 7 circuitos apagados`}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "breakers", fondo: ["#262b33", "#0d1014"], acento: "#ffc978", luz: "rgba(255,201,120,.18)",
  portada: TABLERO,
  anim: "abre",
  antes: () => <EstiloLote2 />,
  etapas: [
    { objeto: { id: TABLERO, alto: 96 }, disposicion: "rejilla", encima: (e) => <Luces {...e} />, mesa: "cliente",
      destinos: { cierre: { icono: Power, forma: "palanca" }, "no-cierre": { icono: Ban } } },
    { objeto: { id: INFORME, alto: 90 }, mesa: "tu", anim: "cae",
      destinos: { va: { icono: FolderInput }, "no-va": { icono: FolderX } },
      despues: (e) => (e.paso.texto ? null : <p className="gp-escenita"><Objeto id={INFORME} alto={40} /><small>Informe final archivado.</small></p>) },
  ],
};

export default function C04H09Breakers({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
