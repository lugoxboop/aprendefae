/*
 * C10 · H04 · Faro, quiosco o carpa (gp26-pla-c10-h04-playa, Medio, 25 × 2 FP × %).
 * La playa del lanzamiento con tres construcciones grandes: el faro (Push),
 * el quiosco de información (Pull) y la carpa con mesa y sillas
 * (Interactiva), cada una con lo que asegura escrito. Etapa 2, predecir y
 * revelar: el estudiante apuesta cuántas de las 40 tiendas entendieron el
 * correo; el revelado (40 enviados, 31 abiertos, 12 entendidos) llega DESPUÉS
 * de la apuesta, junto a ella.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { BarraH, EstiloLote5, Lamina, destinoDe } from "../comun/lote5.jsx";
import { GP_C10_H04, LANZAMIENTO_C10 } from "./textos-c10.js";

export const ID = GP_C10_H04.id;

// imagen-pendiente: playa-faro · quiosco-info · carpa-mesa · barco-pesca
const FARO = primero("playa-faro", "linterna");
const QUIOSCO = primero("quiosco-info", "expositor-postales");
const CARPA = primero("carpa-mesa", "mesa-redonda");
const C = LANZAMIENTO_C10.correo;

function Revelado(estado) {
  if (!estado.paso.revelado) return null;
  const apuesta = destinoDe(estado, "c10h04-apuesta")?.apuesta;
  return (
    <Lamina titulo="El haz del faro · el correo a las 40 tiendas" data-revelado>
      <div className="gp5-barras">
        <BarraH nombre="Recibieron el correo" valor={C.tiendas} max={C.tiendas} />
        <BarraH nombre="Lo abrieron" valor={C.abrieron} max={C.tiendas} color="#a7d8ff" />
        <BarraH nombre="Lo entendieron (encuesta)" valor={C.entendieron} max={C.tiendas} color="#9be59b" />
        {apuesta != null && <BarraH nombre="Tu apuesta" valor={apuesta} max={C.tiendas} color="#c3a6ff" />}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "playa", fondo: ["#1b3a4b", "#08131a"], acento: "#ffd166", luz: "rgba(255,209,102,.18)",
  portada: FARO,
  mesa: "tu",
  objeto: { id: FARO, alto: 72 },
  anim: "cae",
  disposicion: "fila3",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Revelado {...e} />,
  explorar: () => <><EstiloLote5 /><p className="gp2-pista" data-faro>El haz del faro sale hacia las {C.tiendas} tiendas.</p></>,
  destinos: { push: { objeto: FARO, alto: 40 }, pull: { objeto: QUIOSCO, alto: 40 }, interactiva: { objeto: CARPA, alto: 40 } },
  etapas: [{}, { mesa: "cliente", disposicion: "columna", destinos: {} }],
};

export default function C10H04Playa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
