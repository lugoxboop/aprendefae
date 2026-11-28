/*
 * C07 · H04 · El embudo de la exactitud (gp26-pla-c07-h04-embudo, Fácil, 10 × 2 FP × %).
 * El embudo metálico vertical: boca ancha arriba «Inicio · ROM», cuello
 * estrecho abajo «Más adelante». Dentro, la regla con los dos tiradores (las
 * casillas con ◀ ▶, que muestran su cifra): el rango se pinta sobre la regla
 * mientras se mueve. Tras el segundo rango, la regla baja por el embudo y se
 * estrecha. Etapa 2: de la boca sale la etiqueta «Base de las estimaciones»
 * y cada tarjeta se cuelga en ella o se deja.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados, cuantos } from "../comun/lote2.jsx";
import { EstiloLote4, miles, numeroDeTexto } from "../comun/lote4.jsx";
import { GP_C7_H04 } from "./textos-c7.js";

export const ID = GP_C7_H04.id;

// imagen-pendiente: embudo
const EMBUDO = primero("embudo", "tolva");
// ficha-colgante ya existe (plan del lote de imágenes 3)
const ETIQUETA = primero("ficha-colgante");

function Regla({ paso, valores, encaja }) {
  if (paso.tipo !== "casillas") return null;
  const a = numeroDeTexto(valores?.min) ?? paso.base;
  const b = numeroDeTexto(valores?.max) ?? paso.base;
  const X = (v) => `${Math.max(0, Math.min(100, (v / 2000) * 100))}%`;
  const estrecho = paso.fase === "definitiva";
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-regla={paso.fase}>
      <div className="gp4-ejes"><span>{estrecho ? "Más adelante" : "Inicio · ROM"}</span><span>{miles(Math.min(a, b))} a {miles(Math.max(a, b))}</span></div>
      <div className="gp2-gira" style={{ position: "relative", height: 28, marginTop: 10, transform: estrecho && encaja ? "translateY(4px) scaleX(.96)" : "none" }}>
        <span style={{ position: "absolute", left: 0, right: 0, top: 12, height: 4, background: "rgba(244,245,247,.35)", borderRadius: 2 }} />
        <span style={{ position: "absolute", left: X(Math.min(a, b)), width: `calc(${X(Math.max(a, b))} - ${X(Math.min(a, b))})`, top: 8, height: 12, background: "#ffc978", borderRadius: 6 }} data-rango />
        <span style={{ position: "absolute", left: X(paso.base), top: 0, height: 28, borderLeft: "2px solid #f4f5f7" }} title="Estimación" />
      </div>
      <small style={{ display: "block", marginTop: 4 }}>Línea blanca: la estimación de {miles(paso.base)}</small>
    </div>
  );
}

function Base(estado) {
  if (estado.paso.tipo === "casillas") return null;
  const n = cuantos(estado, "va");
  const total = colocados(estado).length;
  return (
    <div className="gp-escenita" data-base-colgadas={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `rotate(${estado.encaja === "va" ? -6 : 0}deg)` }}><Objeto id={ETIQUETA} alto={44} /></span>
      <small>Base de las estimaciones: {n} colgadas · {total} de 9 revisadas</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "embudo", fondo: ["#2a3038", "#0d1014"], acento: "#cfd6df", luz: "rgba(207,214,223,.18)",
  portada: EMBUDO,
  mesa: "tu",
  objeto: { id: EMBUDO, alto: 110 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <><Regla {...e} /><Base {...e} /></>,
  etapas: [{}, { objeto: { id: EMBUDO, alto: 76 } }],
};

export default function C07H04Embudo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
