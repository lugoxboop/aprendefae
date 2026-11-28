/*
 * C05 · H01 · Escenario o bambalinas (gp26-pla-c05-h01-teatro, Fácil, 10 FP × %).
 * El teatro con el telón abierto: en el escenario, el celular gigante con la
 * app (lo que la app HACE); tras bambalinas, el andamio del equipo (el TRABAJO
 * para lograrlo). Acierto: en el escenario se enciende el foco; tras
 * bambalinas la tarjeta queda colgada en el tablero del equipo. Micro final:
 * el telón se cierra y salen las dos reglas de medir.
 */
import { Smartphone, HardHat } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H01 } from "./textos-c5.js";

export const ID = GP_C5_H01.id;

function Zonas(estado) {
  if (estado.paso.regla) {
    return (
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-reglas>
        {["Requisitos del producto", "Plan para la dirección"].map((n) => (
          <div key={n} className="gp2-pieza"><Objeto id="regla-madera" alto={36} /><small>{n}</small></div>
        ))}
      </div>
    );
  }
  const puestos = colocados(estado);
  const de = (k) => puestos.filter((x) => x.destino === k).length;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-teatro>
      <div className="gp2-caja" data-zona="producto" data-lleno={de("producto") ? "1" : undefined}>
        <b>Escenario</b>
        <div className="gp2-fila">
          <span className={estado.encaja === "producto" ? "gp2-entra" : ""} style={{ opacity: de("producto") ? 1 : 0.45 }}><Objeto id="foco-teatro" alto={34} /></span>
          <Objeto id="celular" alto={44} />
        </div>
        <small className="da26-mono">{de("producto")} en escena</small>
      </div>
      <div className="gp2-caja" data-zona="proyecto" data-lleno={de("proyecto") ? "1" : undefined}>
        <b>Tras bambalinas</b>
        <div className="gp2-fila"><span className={estado.encaja === "proyecto" ? "gp2-entra" : ""}><Objeto id="andamio" alto={44} /></span></div>
        <small className="da26-mono">{de("proyecto")} en el tablero</small>
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "teatro", fondo: ["#3a1e2a", "#150a10"], acento: "#f2c14e", luz: "rgba(242,193,78,.24)",
  portada: "teatro-telon",
  objetoDe: (paso) => (paso.regla ? null : { id: "teatro-telon", alto: 92, lugar: "detras" }),
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Zonas {...e} />,
  destinos: { producto: { icono: Smartphone }, proyecto: { icono: HardHat } },
};

export default function C05H01Teatro({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
