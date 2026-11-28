/*
 * C12 · H05 · Las placas de la tostadora (gp26-pla-c12-h05-sow, Medio, 25 × 2 FP × %).
 * La tostadora industrial (tambor, tolva, chimenea y panel) en el centro y, a
 * su alrededor, siete soportes con su nombre: Especificaciones · Cantidad ·
 * Calidad · Desempeño · Período · Lugar · Servicios adicionales. El hurón saca
 * las placas de su borrador; bien puestas, cuatro tornillos las fijan; mal
 * puestas, se sueltan y caen. Etapa 2: quedan cuatro placas borrosas y
 * rayadas; la buena se graba nítida y se atornilla.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C12_H05 } from "./textos-c12.js";

export const ID = GP_C12_H05.id;

// imagen-pendiente: tostadora · placa-nitida · placa-rayada · tornillo · soporte-metal
const TOSTADORA = primero("tostadora", "despulpadora", "tolva");

function Soportes(estado) {
  if ((estado.paso.destinos?.length ?? 0) !== 7) return null;
  const puestas = new Set(colocados(estado).map((x) => x.destino));
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-soportes={puestas.size}>
      {estado.paso.destinos.map((d) => <span key={d.id} className="gp5-chip" data-on={puestas.has(d.id) ? "1" : undefined}>{puestas.has(d.id) ? "✓ " : ""}{d.nombre}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "placas", fondo: ["#2b2d31", "#0c0d0f"], acento: "#e9c46a", luz: "rgba(233,196,106,.14)",
  portada: TOSTADORA,
  mesa: "practicante",
  objeto: { id: TOSTADORA, alto: 76 },
  anim: "sella",
  disposicion: "tablero",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Soportes {...e} />,
  etapas: [{}, { mesa: "tu", disposicion: "columna" }],
};

export default function C12H05Placas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
