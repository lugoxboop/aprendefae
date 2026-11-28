/*
 * C10 · H01 · El casillero de la semana (gp26-eje-c10-h01-casillero, Fácil, 10 × 3 FP × %).
 * El casillero de correo de madera, de pared, con sus compartimentos; en cada
 * ronda cambian los rótulos de las placas (interna/externa, formal/informal,
 * ascendente/descendente/horizontal). El zorro saca los sobres de la bolsa y
 * el estudiante los mete en su hueco; al acertar, el sobre entra y la placa
 * se ilumina con ✓ (el conteo de cada hueco solo cuenta lo ya metido).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5 } from "../comun/lote5.jsx";
import { GP_C10_H01 } from "./textos-c10.js";

export const ID = GP_C10_H01.id;

// imagen-pendiente: casillero-correo · placa-laton · bolsa-cartero (sobre-carta ya existe)
const CASILLERO = primero("casillero-correo", "archivador-cajones");
const SOBRE = primero("sobre-carta");
const BOLSA = primero("bolsa-cartero", "maleta");

function Huecos(estado) {
  const ds = estado.paso.destinos ?? [];
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-huecos={ds.map((d) => cuantos(estado, d.id)).join("-")}>
      {ds.map((d) => <span key={d.id} className="gp5-chip" data-on={cuantos(estado, d.id) ? "1" : undefined}>{d.nombre}: {cuantos(estado, d.id)} {cuantos(estado, d.id) === 1 ? "sobre" : "sobres"}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "casillero", fondo: ["#33261b", "#110c08"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: CASILLERO,
  mesa: "tu",
  objeto: { id: BOLSA, alto: 60 },
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Huecos {...e} />,
  destinos: { "*": { objeto: SOBRE, alto: 30 } },
};

export default function C10H01Casillero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
