/*
 * C08 · H11 · La cadena de la solución (gp26-eje-c08-h11-cadena, Medio, 25 × 3 FP × %).
 * Etapa 1: la cadena de seis eslabones de acero que cuelga de un gancho en la
 * planta; cada paso es una placa que se engancha en un eslabón (el hámster
 * sostiene la cadena). Etapa 2: el molino de cuatro aspas (Planificar ·
 * Hacer · Verificar · Actuar); al acertar las cuatro, da una vuelta. Etapa 3:
 * placas con la X del diseño.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H11 } from "./textos-c8.js";

export const ID = GP_C8_H11.id;

// imagen-pendiente: cadena-gancho · placa-metal · molino
const CADENA = primero("cadena-gancho", "cuerda");
const PLACA = primero("placa-metal", "ficha-madera");
const MOLINO = primero("molino", "noria");

function Eslabones({ puestas, bien, paso }) {
  return (
    <div className="gp-escenita" data-eslabones={puestas.length}>
      <span className="gp2-gira" style={{ display: "block", transform: bien ? "rotate(-4deg)" : "none" }}><Objeto id={CADENA} alto={64} /></span>
      <small>{bien ? "La cadena queda completa, sin parches." : `${puestas.length} de ${paso.items.length} eslabones con placa`}</small>
    </div>
  );
}

function Molino(estado) {
  if (estado.paso.id < "c8h11-01" || estado.paso.id > "c8h11-04") return null;
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-molino={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `rotate(${n === 4 ? 360 : n * 20}deg)` }}><Objeto id={MOLINO} alto={56} /></span>
      <small>{n === 4 ? "El molino da una vuelta: el ciclo sigue." : `${n} de 4 aspas`}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "cadena", fondo: ["#262b30", "#0b0d0f"], acento: "#cfd6df", luz: "rgba(207,214,223,.16)",
  portada: CADENA,
  mesa: "equipo",
  objetos: [],
  objetoTarjeta: PLACA,
  /* El motor Ordenar no llama a `antes`: la hoja del lote 4 entra aquí. */
  encimaOrden: (e) => <><EstiloLote4 /><Eslabones {...e} /></>,
  anim: "sella",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Molino {...e} />,
  etapas: [{}, { objeto: { id: MOLINO, alto: 72 } }, { objeto: { id: PLACA, alto: 52 }, mesa: "tu" }],
};

export default function C08H11Cadena({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
