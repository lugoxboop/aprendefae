/*
 * C03 · H01 · La orquesta de la inauguración (gp26-fun-c03-h01-orquesta, Fácil, 10 × 2 FP × %).
 * Etapa 1: la partitura gigante y la batuta frente a la orquesta; cada parte
 * de la orquesta se une con su par del proyecto y la unión queda como una
 * cuerda tensa (la tira de pares de abajo). Etapa 2: tres puertas de oficina
 * con placa; la tarea entra por debajo de la correcta y su placa marca ✓.
 */
import { Music, DoorOpen } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C3_H01 } from "./textos-c3.js";

export const ID = GP_C3_H01.id;
const PARTITURA = primero("partitura-abierta", "plano-enrollado");
const PUERTA = primero("puerta-oficina", "porton-madera");
const BATUTA = primero("batuta");

function Cuerdas(estado) {
  const nombre = (id) => estado.paso.destinos.find((d) => d.id === id)?.nombre ?? id;
  const pares = colocados(estado);
  if (!pares.length) return null;
  return (
    <div className="gp2-pila" data-cuerdas={pares.length}>
      {pares.map((x) => (
        <div key={x.id} className="gp2-caja gp2-entra" data-lleno="1" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 28px minmax(0,1fr)", alignItems: "center", gap: 6 }}>
          <span>{x.texto}</span>
          <span aria-hidden="true" style={{ height: 2, background: "#f2c14e", borderRadius: 1 }} />
          <span>{nombre(x.destino)}</span>
        </div>
      ))}
    </div>
  );
}

const ICONO_PUERTA = { icono: DoorOpen, objeto: PUERTA, alto: 54 };
export const ESCENA = {
  nombre: "orquesta", fondo: ["#2b1d3a", "#120c1c"], acento: "#f2c14e", luz: "rgba(242,193,78,.2)",
  portada: PARTITURA,
  etapas: [
    { objeto: { id: PARTITURA, alto: 96 }, anim: "conecta", disposicion: "columna", antes: () => <EstiloLote2 />,
      destinos: { "*": { icono: Music, forma: "clavija" } }, despues: (e) => <Cuerdas {...e} />,
      encima: () => <div className="gp2-fila" aria-hidden="true"><Objeto id={BATUTA} alto={44} /><small>La batuta y la partitura: así comunica el director.</small></div> },
    { objeto: null, mesa: "gerente", anim: "abre", disposicion: "fila3", antes: () => <EstiloLote2 />,
      destinos: { director: ICONO_PUERTA, funcional: ICONO_PUERTA, operaciones: ICONO_PUERTA } },
  ],
};

export default function C03H01Orquesta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
