/*
 * C06 · H01 · El semáforo del plan (gp26-pla-c06-h01-semaforo, Medio, 25 × 2 FP × %).
 * Etapa 1: el archivador de fuelle abierto con siete pestañas; la PMO lo
 * sostiene y, al acertar, la hoja entra en su pestaña y el fuelle se abomba un
 * poco. Etapa 2: el semáforo de tránsito, grande, con dos estados que se
 * distinguen por FORMA Y TEXTO (✓ «Dentro del umbral», ! «Actuar»), no solo por
 * color; al lado, la tarjeta con días planeados y reales y la regla fija.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H01 } from "./textos-c6.js";

export const ID = GP_C6_H01.id;

function Fuelle(estado) {
  if (!estado.paso.texto || estado.paso.tipo === "casillas") return null;
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-fuelle={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `scaleX(${1 + n * 0.03})` }}><Objeto id="archivador-fuelle" alto={44} /></span>
      <small>{n} de 7 pestañas con su hoja</small>
    </div>
  );
}

function Semaforo({ paso, encaja, valores }) {
  if (paso.tipo !== "casillas") return null;
  const estado = encaja ? paso.casillas.find((c) => c.id === "semaforo").clave : valores?.semaforo || null;
  return (
    <div className="gp2-caja" data-semaforo={estado ?? "apagado"} style={{ marginTop: 10 }}>
      <p className="da26-mono" style={{ margin: "0 0 6px" }} data-regla-umbral>Umbral: actuar si la desviación pasa de 10 %</p>
      <div className="gp2-fila" style={{ justifyContent: "space-around" }}>
        <Objeto id="semaforo" alto={96} />
        <div className="gp2-pila" style={{ marginTop: 0 }}>
          <span className="gp-chip-c" style={{ opacity: estado === "dentro" ? 1 : 0.35 }}>✓ Dentro del umbral</span>
          <span className="gp-chip-c" style={{ opacity: estado === "actuar" ? 1 : 0.35 }}>! Actuar</span>
        </div>
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "semaforo", fondo: ["#222a33", "#0b0e12"], acento: "#9be59b", luz: "rgba(155,229,155,.18)",
  portada: "archivador-fuelle",
  mesa: "pmo",
  objeto: { id: "archivador-fuelle", alto: 76 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <><Fuelle {...e} /><Semaforo {...e} /></>,
  etapas: [{}, { objeto: null, mesa: "tu" }],
};

export default function C06H01Semaforo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
