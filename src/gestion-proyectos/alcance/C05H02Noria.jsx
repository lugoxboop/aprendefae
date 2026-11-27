/*
 * C05 · H02 · La carretera y la noria (gp26-pla-c05-h02-noria, Medio, 25 FP × %).
 * Arriba, la carretera recta (cascada) con sus tres señales; abajo, la noria de
 * feria (adaptativo) con la cabina «Se repite en cada iteración». A 320 px no
 * van lado a lado: carretera arriba y noria abajo. Cada ficha que entra en la
 * cabina da una vuelta con la noria; en la carretera queda clavada en su señal.
 * En la micro de quién participa, la patrocinadora y el cliente suben a la cabina.
 */
import { Signpost, Repeat } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { Personaje } from "../comun/elenco.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H02 } from "./textos-c5.js";

export const ID = GP_C5_H02.id;

function Camino(estado) {
  const { paso, encaja } = estado;
  const enNoria = paso.ronda === "noria";
  const vueltas = cuantos(estado, "iteracion");
  return (
    <div className="gp2-pila" data-ronda={paso.ronda ?? "carretera"}>
      <div className="gp2-caja" data-tramo="carretera" style={{ opacity: enNoria ? 0.6 : 1 }}>
        <b>Carretera · cascada</b>
        <div className="gp2-fila" style={{ justifyContent: "space-between" }}>
          <Objeto id="carretera" alto={56} />
          {["Al principio", "Con cada entregable", "Todo el tiempo"].map((n) => (
            <span key={n} className="gp2-pieza"><Objeto id="senal-vial" alto={30} /><small>{n}</small></span>
          ))}
        </div>
      </div>
      <div className="gp2-caja" data-tramo="noria" style={{ opacity: enNoria ? 1 : 0.6 }}>
        <b>Noria · módulo de puntos</b>
        <div className="gp2-fila" style={{ justifyContent: "space-between" }}>
          <span className="gp2-gira" style={{ display: "block", transform: `rotate(${vueltas * 72 + (encaja === "iteracion" ? 72 : 0)}deg)` }}><Objeto id="noria" alto={64} /></span>
          {paso.cabina && encaja ? (
            <span className="gp2-fila gp2-entra" data-cabina-llena><Personaje quien="patrocinadora" alto={120} /><Personaje quien="cliente" alto={120} /></span>
          ) : <small className="da26-mono">Iteración 1 · 2 · 3…</small>}
        </div>
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "noria", fondo: ["#1d2f3a", "#0a1318"], acento: "#7fd1c7", luz: "rgba(127,209,199,.2)",
  portada: "noria",
  mesa: "pmo",
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Camino {...e} />,
  destinos: { principio: { icono: Signpost }, entregable: { icono: Signpost }, siempre: { icono: Signpost }, iteracion: { icono: Repeat } },
};

export default function C05H02Noria({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
