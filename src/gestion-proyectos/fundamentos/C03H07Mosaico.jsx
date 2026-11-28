/*
 * C03 · H07 · El mosaico de la integración (gp26-fun-c03-h07-mosaico, Difícil, 50 × 2 FP × %).
 * Etapa 1: el piso de la tienda con un mosaico a medio armar en tres franjas
 * (Proceso · Cognitivo · Contextual); cada baldosa asentada completa un tramo
 * de su franja con el patrón propio. Micro del doble rol: los dos bordes del
 * mosaico. Etapa 2: fallas en el mosaico (baldosas que se levantan, que se
 * disputan un hueco, cubiertas de polvo) y el informe del practicante.
 */
import { Cog, Lightbulb, Globe2, Network, Users, CloudFog } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C3_H07 } from "./textos-c3.js";

export const ID = GP_C3_H07.id;
const MOSAICO = primero("baldosa", "plano-enrollado");
const POLVO = primero("nube-polvo");
const FRANJAS = [["proceso", "Proceso", "#6cc3d5", 2], ["cognitivo", "Cognitivo", "#f2c14e", 2], ["contextual", "Contextual", "#a3d65c", 2]];

function Franjas(estado) {
  if (!estado.paso.destinos.some((d) => d.id === "proceso")) return null;
  return (
    <div className="gp2-pila" data-mosaico>
      {FRANJAS.map(([k, n, c, total]) => {
        const v = cuantos(estado, k);
        return (
          <div key={k} className="gp2-caja" style={{ display: "grid", gridTemplateColumns: "88px repeat(4, minmax(0,1fr))", gap: 4, alignItems: "center", minHeight: 40 }} data-franja={k} data-baldosas={v}>
            <small>{n}</small>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} aria-hidden="true" className={i < v * 2 ? "gp2-entra" : ""}
                style={{ height: 24, borderRadius: 4, background: i < (v * 4) / total ? c : "rgba(244,245,247,.12)", transform: i < (v * 4) / total ? "none" : "scale(.9)" }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Polvo({ paso, encaja }) {
  if (!paso.destinos.some((d) => d.id === "sistema")) return null;
  return (
    <p className="gp-escenita" data-falla={encaja ? "arreglada" : "abierta"}>
      <span className="gp2-gira" style={{ display: "block", opacity: encaja ? 0.25 : 1 }}><Objeto id={paso.clave === "ambiguedad" ? POLVO : MOSAICO} alto={44} /></span>
      <span>{encaja ? "✓ El piso queda parejo." : "Hay una falla en el mosaico."}</span>
    </p>
  );
}

export const ESCENA = {
  nombre: "mosaico", fondo: ["#2e2a24", "#12100c"], acento: "#a3d65c", luz: "rgba(163,214,92,.2)",
  portada: MOSAICO,
  objeto: { id: MOSAICO, alto: 90 },
  anim: "sella",
  antes: () => <EstiloLote2 />,
  destinos: {
    proceso: { icono: Cog }, cognitivo: { icono: Lightbulb }, contextual: { icono: Globe2 },
    sistema: { icono: Network }, humano: { icono: Users }, ambiguedad: { icono: CloudFog },
  },
  etapas: [{ encima: (e) => <Franjas {...e} /> }, { disposicion: "columna", encima: (e) => <Polvo {...e} /> }],
};

export default function C03H07Mosaico({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
