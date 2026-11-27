/*
 * C04 · H05 · La bitácora de obra (gp26-eje-c04-h05-bitacora, Medio, 25 × 2 FP × %).
 * Etapa 1: la bitácora de tapa dura abierta con tres separadores de pestaña
 * (incidentes «ya pasó», riesgos «podría pasar», datos «medición en bruto»).
 * El practicante dicta; la nota se recorta de la página mezclada y se pega
 * tras su separador. Etapa 2: la fila del incidente «El proveedor de sillas
 * entregó la mitad» con sus ocho casillas; las fichas se escriben a lápiz.
 */
import { AlertTriangle, CloudLightning, Ruler } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados, cuantos } from "../comun/lote2.jsx";
import { GP_C4_H05 } from "./textos-c4.js";

export const ID = GP_C4_H05.id;
const BITACORA = primero("bitacora", "carpeta-abierta");

function Separadores(estado) {
  if (!estado.paso.destinos.some((d) => d.id === "incidentes")) return null;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }} data-separadores>
      {[["incidentes", "Incidentes"], ["riesgos", "Riesgos"], ["datos", "Datos"]].map(([k, n]) => (
        <div key={k} className="gp2-caja" data-lleno={cuantos(estado, k) ? "1" : undefined} data-separador={k}><b>{n}</b>{cuantos(estado, k)} notas</div>
      ))}
    </div>
  );
}

function Fila(estado) {
  if (!estado.paso.destinos.some((d) => d.id === "tipo")) return null;
  const puestos = colocados(estado);
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-fila-incidente>
      <b>Descripción</b>
      <div style={{ marginBottom: 6 }}>El proveedor de sillas entregó la mitad.</div>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>
        {estado.paso.destinos.filter((d) => d.id !== "descarte").map((d) => {
          const x = puestos.find((p) => p.destino === d.id);
          return <small key={d.id} data-casilla={d.id} style={{ opacity: x ? 1 : 0.55 }}><b style={{ margin: 0 }}>{d.nombre}</b>{x ? <span className="gp2-entra" style={{ fontStyle: "italic" }}>{x.texto}</span> : "—"}</small>;
        })}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "bitacora", fondo: ["#2b2a20", "#11100b"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: BITACORA,
  mesa: "practicante",
  objeto: { id: BITACORA, alto: 80 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  etapas: [
    { encima: (e) => <Separadores {...e} />, destinos: { incidentes: { icono: AlertTriangle }, riesgos: { icono: CloudLightning }, datos: { icono: Ruler } } },
    { mesa: "tu", disposicion: "rejilla", encima: (e) => <Fila {...e} /> },
  ],
};

export default function C04H05Bitacora({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
