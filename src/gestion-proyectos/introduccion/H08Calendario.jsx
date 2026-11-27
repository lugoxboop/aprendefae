/*
 * H08 · La trampa del calendario (gp-h08-calendario, Medio, 25 × 2 FP × %).
 * Etapa 1: el archivador de cinco cajones, cada uno con su ícono (Inicio
 * bandera · Planificación plano · Ejecución casco · Monitoreo y Control
 * tablero con aguja · Cierre caja con candado); el cajón se abre al recibir.
 * Etapa 2: el calendario de pared con los 4 bloques de fase; el bloque 3
 * lleva la etiqueta errada «Ejecución» del practicante. Al responder la
 * primera, los cinco íconos de grupos parpadean dentro de cada bloque.
 */
import { Archive, Flag, Gauge, HardHat, Map as Plano } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { FASES_TIENDA, GP_H08 } from "./textos.js";

export const ID = GP_H08.id;
const ICONOS = [Flag, Plano, HardHat, Gauge, Archive];

function Calendario({ paso, encaja, etapa }) {
  const revelado = (paso.id === "h08-m1" && encaja) || (etapa?.indice ?? 0) > 0;
  return (
    <div className="gp-escenita" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 }} data-calendario data-revelado={revelado ? "1" : "0"}>
      {FASES_TIENDA.map((f, k) => (
        <div key={f} style={{ display: "grid", gap: 4, justifyItems: "center", padding: "6px 2px", borderRadius: 8, background: "rgba(244,245,247,.1)", minWidth: 0 }}>
          <strong style={{ fontSize: 12, textAlign: "center", lineHeight: 1.2 }}>
            {k === 2 && !revelado ? <span className="gp-chip-c" data-etiqueta-errada>Ejecución</span> : f}
          </strong>
          {revelado && (
            <span style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }} className="da26-entra" aria-label="Los cinco grupos de procesos">
              {ICONOS.map((I, j) => <I key={j} size={13} strokeWidth={2.4} aria-hidden="true" />)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export const ESCENA = {
  nombre: "archivador", fondo: ["#2c2438", "#141019"], acento: "#b9aeff", luz: "rgba(185,174,255,.2)",
  portada: "archivador-cajones",
  etapas: [
    {
      objeto: { id: "archivador-cajones", alto: 110 },
      anim: "abre",
      disposicion: "palancas",
      destinos: { inicio: { icono: Flag }, planificacion: { icono: Plano }, ejecucion: { icono: HardHat }, monitoreo: { icono: Gauge }, cierre: { icono: Archive } },
    },
    {
      mesa: "practicante",
      objeto: { id: "calendario-pared", alto: 84 },
      anim: "pesa",
      encima: (e) => <Calendario {...e} />,
    },
  ],
};

export default function H08Calendario({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
