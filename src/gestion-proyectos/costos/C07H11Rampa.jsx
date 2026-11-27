/*
 * C07 · H11 · La rampa del montacargas (gp26-moc-c07-h11-rampa, Difícil, 50 FP × %).
 * El montacargas al pie de una rampa metálica ajustable que lleva al letrero
 * «Meta». La inclinación es el TCPI (dibujada a mano sobre la rampa): plana
 * en 1,0, sube si es mayor que 1, baja si es menor; debajo, el texto fijo
 * «más difícil» / «igual» / «más fácil» y el valor escrito sobre la rampa.
 * Tras el 4, la rampa se empina y el montacargas sube despacio; tras el 5, la
 * rampa baja y sube rápido. La patrocinadora espera en la meta.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, Rampa } from "../comun/lote4.jsx";
import { GP_C7_H11 } from "./textos-c7.js";

export const ID = GP_C7_H11.id;

// imagen-pendiente: montacargas · rampa-metalica · letrero-meta
const MONTACARGAS = primero("montacargas", "carretilla");
const META = primero("letrero-meta", "senal-vial");

function Subida({ paso, encaja, etapa }) {
  const hechos = (etapa?.hechos ?? []).map((h) => h.paso);
  const ultimo = [...hechos, ...(encaja ? [paso] : [])].filter((p) => p.tcpi).at(-1);
  const tcpi = ultimo?.tcpi ?? 1;
  const rapido = tcpi < 1;
  return (
    <div className="gp4-lamina" data-subida={ultimo ? (rapido ? "rapido" : "despacio") : "plana"}>
      <div className="gp2-fila" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
        <span className="gp2-gira" style={{ display: "block", transform: ultimo ? `translateX(${rapido ? 18 : 6}px)` : "none" }}><Objeto id={MONTACARGAS} alto={44} /></span>
        <span className="gp2-pieza"><Objeto id={META} alto={40} /><small>Meta · 1.200</small></span>
      </div>
      <Rampa tcpi={tcpi} />
    </div>
  );
}

export const ESCENA = {
  nombre: "rampa", fondo: ["#2c2a22", "#0f0e0a"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: MONTACARGAS,
  mesa: "patrocinadora",
  objeto: null,
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Subida {...e} />,
};

export default function C07H11Rampa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
