/*
 * C08 · H05 · Tres casilleros (gp26-eje-c08-h05-casilleros, Medio, 25 × 2 FP × %).
 * Tres casilleros metálicos de vestuario de la planta, con casco colgado y
 * placa: Planificar la Calidad (casco con plano enrollado), Gestionar la
 * Calidad (casco con engranaje: el proceso) y Controlar la Calidad (casco con
 * báscula: el resultado). El casillero se abre al recibir la tarea; el gerente
 * funcional espera la respuesta.
 */
import { Map as Plano, Cog, Scale } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H05 } from "./textos-c8.js";

export const ID = GP_C8_H05.id;

// imagen-pendiente: casilleros-casco
const CASILLEROS = primero("casilleros-casco", "archivador-metalico");
const CASCO = primero("casco-electricista");

function Vestuario(estado) {
  if (!estado.paso.texto) return null;
  return (
    <div className="gp-escenita" data-vestuario>
      <Objeto id={CASCO} alto={32} />
      <small>Planificar {cuantos(estado, "planificar")} · Gestionar {cuantos(estado, "gestionar")} · Controlar {cuantos(estado, "controlar")}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "casilleros", fondo: ["#283036", "#0c0f11"], acento: "#cfd6df", luz: "rgba(207,214,223,.16)",
  portada: CASILLEROS,
  mesa: "gerente",
  objeto: { id: CASILLEROS, alto: 84 },
  anim: "abre",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Vestuario {...e} />,
  destinos: { planificar: { icono: Plano }, gestionar: { icono: Cog }, controlar: { icono: Scale } },
  etapas: [{}, { objeto: { id: CASILLEROS, alto: 60 } }],
};

export default function C08H05Casilleros({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
