/*
 * C05 · H05 · La urna de las funciones (gp26-pla-c05-h05-urna, Medio, 25 × 2 FP × %).
 * Etapa 1: la urna de vidrio y tres frascos contadores (Pago, Puntos,
 * Seguimiento) con su número grande y la línea a mano «50 % = 4,5 votos». Se
 * nombra la regla con cuatro placas; al acertar, la función ganadora sube a la
 * repisa «Primera en la versión 2». En la ronda 3, si se dice «Mayoría», el
 * frasco Pago se compara con la línea del 50 % y no la alcanza.
 * Etapa 2: cuatro hojas en una cuerda de tender con pinzas, que se ordenan.
 */
import { Crown, Users, Vote, UserCheck } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { Personaje } from "../comun/elenco.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H05 } from "./textos-c5.js";

export const ID = GP_C5_H05.id;
const FUNCIONES = ["Pago", "Puntos", "Seguimiento"];

function Frascos({ paso, encaja, mal, ultimo }) {
  if (paso.votos) {
    const max = Math.max(...paso.votos);
    const ganadora = paso.votos.indexOf(max);
    const compara = paso.ronda === 3 && ultimo === "mayoria" && !encaja;
    return (
      <div className="gp2-caja" data-urna={paso.ronda} style={{ marginTop: 10 }}>
        <p className="da26-mono" style={{ margin: "0 0 6px", textAlign: "center" }} data-linea-50>50 % = 4,5 votos</p>
        <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }}>
          {FUNCIONES.map((f, k) => (
            <div key={f} className="gp2-pieza" data-frasco={f} data-votos={paso.votos[k]}>
              <Objeto id="frasco-contador" alto={48} />
              <span className="da26-mono" style={{ fontSize: 22 }}>{paso.votos[k]}</span>
              <small>{f}</small>
              {compara && k === 0 && <small className="gp2-entra" data-no-alcanza>4 &lt; 4,5: no llega al 50 %</small>}
            </div>
          ))}
        </div>
        {paso.sola && <div className="gp2-fila" style={{ marginTop: 6 }}><Personaje quien="patrocinadora" alto={120} /><small>Decide sola</small></div>}
        {encaja && !mal && (
          <p className="gp-escenita gp2-entra" data-repisa><Objeto id="ficha-madera" alto={28} /><span className="gp-chip-c">Primera en la versión 2</span><small>{paso.sola ? "La que eligió la patrocinadora" : FUNCIONES[ganadora]}</small></p>
        )}
      </div>
    );
  }
  if (paso.id === "c5h05-puntos") {
    return (
      <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }} data-suma-nominal>
        {[["Pago", 38], ["Puntos", 41], ["Seguimiento", 29]].map(([f, n]) => (
          <div key={f} className="gp2-pieza"><Objeto id="frasco-contador" alto={40} /><span className="da26-mono" style={{ fontSize: 20 }}>{n}</span><small>{f}</small></div>
        ))}
      </div>
    );
  }
  return null;
}

export const ESCENA = {
  nombre: "urna", fondo: ["#2b2433", "#100c15"], acento: "#e0b0ff", luz: "rgba(224,176,255,.2)",
  portada: "urna-vidrio",
  objeto: { id: "urna-vidrio", alto: 80 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Frascos {...e} />,
  destinos: { unanimidad: { icono: Users }, mayoria: { icono: Vote }, pluralidad: { icono: Crown }, autocratica: { icono: UserCheck } },
  etapas: [{}, { objetos: ["cuerda", "pinza-ropa"], objetoTarjeta: "pinza-ropa", objeto: { id: "ficha-madera", alto: 56 } }],
};

export default function C05H05Urna({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
