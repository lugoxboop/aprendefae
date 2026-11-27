/*
 * H11 · El caso de negocio del puente (gp-h11-caso-puente, Difícil, 50 × 3 FP × %).
 * Taller del capítulo 1, el camino de los documentos con un caso completo.
 * Visual común: el puente con grietas y el camión esperando a la izquierda;
 * el documento «Caso de negocio» que se va llenando a la derecha; la
 * patrocinadora firma al final.
 * Etapa 1: tres bandejas (requerido, deseable, opcional).
 * Etapa 2: las tres maquetas (A vigilar, B reforzado, C nuevo) y su etiqueta;
 * micro: la patrocinadora elige A.
 * Etapa 3: los cuatro documentos en la línea de tiempo y dos micros del acta.
 * Puntaje: aciertos al primer intento / 15 ítems.
 */
import { ShieldCheck, Sparkles, Star } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { GP_H11 } from "./textos.js";

export const ID = GP_H11.id;

function Caso({ etapa, encaja }) {
  const llenas = Math.min(6, (etapa?.hechos?.length ?? 0) + (encaja ? 1 : 0));
  return (
    <div className="gp-escenita" data-caso-negocio>
      <span style={{ display: "flex", alignItems: "flex-end", gap: 4 }} aria-hidden="true">
        <Objeto id="puente-grietas" alto={48} />
        <Objeto id="camion-cafe" alto={40} />
      </span>
      <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
        <small>Caso de negocio</small>
        <span style={{ display: "flex", gap: 3 }} aria-label={`${llenas} secciones llenas`}>
          {Array.from({ length: 6 }, (_, k) => <span key={k} style={{ width: 14, height: 18, borderRadius: 3, background: k < llenas ? "#f4f5f7" : "rgba(244,245,247,.2)" }} />)}
        </span>
      </span>
    </div>
  );
}

export const ESCENA = {
  nombre: "caso-puente", fondo: ["#1f3340", "#0d1820"], acento: "#8fd3f2", luz: "rgba(143,211,242,.2)",
  portada: "carpeta-documento",
  etapas: [
    {
      objeto: { id: "carpeta-documento", alto: 76 },
      anim: "cae",
      destinos: { requerido: { icono: ShieldCheck }, deseable: { icono: Star }, opcional: { icono: Sparkles } },
      encima: (e) => <Caso {...e} />,
    },
    { mesa: "patrocinadora", objeto: null, anim: "pesa", objetoDe: (paso) => (paso.id === "h11-10" ? { id: "puente-grietas", alto: 76 } : null) },
    { mesa: "patrocinadora", objeto: { id: "carpeta-documento", alto: 76 }, objetos: ["carpeta-documento", "puente-reforzado"], objetoTarjeta: "carpeta-documento", anim: "pesa" },
  ],
};

export default function H11CasoPuente({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
