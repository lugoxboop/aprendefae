/*
 * C05 · H11 · Escáner y puerta de embarque (gp26-moc-c05-h11-embarque, Medio, 25 × 2 FP × %).
 * Etapa 1: la terminal del aeropuerto. A la izquierda, el escáner de equipaje
 * «Controlar la Calidad», operado por el equipo; a la derecha, la puerta de
 * embarque «Validar el Alcance», donde esperan el cliente y la patrocinadora.
 * Cada entregable es una maleta: al acertar, pasa por el escáner con un
 * barrido de luz o recibe el pase de abordar. Etapa 2: la pantalla de salidas
 * con tres destinos.
 */
import { ScanLine, Ticket, DoorOpen, RefreshCw, Undo2 } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C5_H11 } from "./textos-c5.js";

export const ID = GP_C5_H11.id;

function Paso({ paso, encaja }) {
  if (!encaja || !paso.texto) return null;
  if (encaja === "calidad" && paso.clave === "calidad" && paso.destinos.length === 2) return <p className="gp-escenita gp2-entra" data-barrido><Objeto id="maleta" alto={32} /><span className="gp-chip-c">Barrido de luz</span><small>Entregable verificado</small></p>;
  if (encaja === "aceptacion") return <p className="gp-escenita gp2-entra" data-pase><Objeto id="sobre-boleto" alto={32} /><span className="gp-chip-c">Pase de abordar</span><small>Entregable aceptado</small></p>;
  const n = { cerrar: "Sale hacia Cerrar el Proyecto o Fase", cambio: "Sale hacia Solicitud de cambio", calidad: "Vuelve al escáner de calidad" }[encaja];
  return <p className="gp-escenita gp2-entra" data-salida={encaja}><Objeto id="maleta" alto={32} /><small>{n}</small></p>;
}

export const ESCENA = {
  nombre: "embarque", fondo: ["#1e2a3a", "#0a0f16"], acento: "#8ecae6", luz: "rgba(142,202,230,.2)",
  portada: "puerta-embarque",
  mesa: "equipo",
  objeto: { id: "maleta", alto: 60 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  despues: (e) => <Paso {...e} />,
  destinos: { calidad: { icono: ScanLine, objeto: "escaner-equipaje", alto: 48 }, aceptacion: { icono: Ticket, objeto: "puerta-embarque", alto: 48 } },
  etapas: [{}, { mesa: "cliente", objeto: { id: "pantalla-salidas", alto: 72 }, disposicion: "fila3", destinos: { cerrar: { icono: DoorOpen }, cambio: { icono: RefreshCw }, calidad: { icono: Undo2 } } }],
};

export default function C05H11Embarque({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
