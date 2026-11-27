/*
 * C07 · H01 · Los cajones del plan (gp26-pla-c07-h01-plan-costos, Medio, 25 × 2 FP × %).
 * Etapa 1: el mueble planero de siete cajones, de frente; el practicante trae
 * las fichas y la PMO espera. Al acertar, el cajón se abre, la ficha entra y
 * se cierra (el contador de cajones llenos sube). Etapa 2: los sellos caen
 * sobre el planero; en el micro del diseño aparece la hoja «Costo del ciclo
 * de vida» con la barra de operación creciendo.
 */
import { Ruler, PencilLine, Target, Tag, Siren, LineChart, CalendarDays } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados, Barra } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C7_H01 } from "./textos-c7.js";

export const ID = GP_C7_H01.id;

// imagen-pendiente: planero-siete
const PLANERO = primero("planero-siete", "archivador-cajones");
// imagen-pendiente: ficha-madera (ya existe)
const FICHA = primero("ficha-madera");

function Cajones(estado) {
  if (!estado.paso.texto) return null;
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-cajones-llenos={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `translateX(${estado.encaja ? 6 : 0}px)` }}><Objeto id={FICHA} alto={36} /></span>
      <small>{n} de 7 cajones con su regla</small>
    </div>
  );
}

function CicloDeVida({ paso, encaja }) {
  if (!paso.ciclo) return null;
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-ciclo-vida={encaja ? "abierto" : "cerrado"}>
      <b>Costo del ciclo de vida</b>
      <Barra nombre="Diseño" valor={encaja ? 0.18 : 0.22} relleno="#a7bbff" />
      <Barra nombre="Construcción" valor={0.55} relleno="#ffc978" />
      <Barra nombre="Operar y mantener" valor={encaja ? 0.95 : 0.6} relleno="#9be59b" />
    </div>
  );
}

export const ESCENA = {
  nombre: "planero", fondo: ["#2c2418", "#0f0c08"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: PLANERO,
  mesa: "practicante",
  objeto: { id: PLANERO, alto: 92 },
  anim: "abre",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <><Cajones {...e} /><CicloDeVida {...e} /></>,
  destinos: {
    unidades: { icono: Ruler }, precision: { icono: PencilLine }, exactitud: { icono: Target }, cuenta: { icono: Tag },
    umbral: { icono: Siren }, reglas: { icono: LineChart }, informes: { icono: CalendarDays },
  },
  etapas: [{}, { mesa: "tu", anim: "sella" }],
};

export default function C07H01Cajones({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
