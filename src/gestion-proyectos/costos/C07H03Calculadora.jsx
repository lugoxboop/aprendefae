/*
 * C07 · H03 · La calculadora de tres valores (gp26-pla-c07-h03-tres-valores, Medio, 25 × 2 FP × %).
 * La calculadora de mesa con rollo de papel. Exploración (sin puntaje, 3
 * movimientos como mínimo): tres deslizadores cO, cM y cP con su valor escrito
 * al lado y dos pantallas, Triangular y Beta; en la Beta el cM aparece como
 * CUATRO fichas apiladas (pesa 4 veces). En el reto, cada cálculo bien hecho
 * imprime la fórmula en el rollo. En el micro de predecir, el cP sube solo a
 * 400 y las dos pantallas cambian: 280 (+20) y 260 (+10).
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, coma } from "../comun/lote4.jsx";
import { GP_C7_H03 } from "./textos-c7.js";

export const ID = GP_C7_H03.id;

// sumadora y ficha-domino ya existen (plan del lote de imágenes 3)
const CALCULADORA = primero("sumadora");
const FICHA = primero("ficha-domino");

const triangular = ({ o, m, p }) => (o + m + p) / 3;
const beta = ({ o, m, p }) => (o + 4 * m + p) / 6;
const redondo = (v) => coma(Math.round(v * 10) / 10);

function Pantallas({ v }) {
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-pantallas>
      <div className="gp2-caja" data-pantalla="triangular">
        <b>Triangular</b>
        <span className="da26-mono" style={{ fontSize: 20 }} data-resultado="triangular">{redondo(triangular(v))}</span>
        <small style={{ display: "block" }}>({v.o} + {v.m} + {v.p}) ÷ 3</small>
      </div>
      <div className="gp2-caja" data-pantalla="beta">
        <b>Beta</b>
        <span className="da26-mono" style={{ fontSize: 20 }} data-resultado="beta">{redondo(beta(v))}</span>
        <span className="gp2-fila" style={{ justifyContent: "flex-start", gap: 2, marginTop: 4 }} aria-label="cM pesa 4 veces" data-fichas-cm>
          {[0, 1, 2, 3].map((k) => <Objeto key={k} id={FICHA} alto={20} />)}
          <small style={{ marginLeft: 4 }}>4 × cM</small>
        </span>
      </div>
    </div>
  );
}

function Rollo({ paso, encaja, etapa }) {
  if (paso.tipo === "casillas") {
    const impresos = (etapa?.hechos ?? []).filter((h) => h.paso.tipo === "casillas").map((h) => `${h.paso.caso} ${h.paso.metodo}: ${h.paso.casillas[0].clave}`);
    return (
      <div className="gp2-caja" style={{ marginTop: 10 }} data-rollo>
        <span className="gp-chip-c">{paso.formula}</span>
        {encaja && <p className="da26-mono gp2-entra" style={{ margin: "6px 0 0" }} data-impreso>{paso.retro}</p>}
        {impresos.length > 0 && <small className="da26-mono" style={{ display: "block", marginTop: 4 }}>En el rollo: {impresos.join(" · ")}</small>}
      </div>
    );
  }
  if (paso.sube) {
    const v = { o: 200, m: 240, p: encaja ? paso.sube : 340 };
    return <div style={{ marginTop: 10 }} data-cp={v.p}><Pantallas v={v} /></div>;
  }
  return null;
}

export const ESCENA = {
  nombre: "calculadora", fondo: ["#2e2a24", "#100e0b"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: CALCULADORA,
  mesa: "equipo",
  objeto: { id: CALCULADORA, alto: 84 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  explorar: ({ valores }) => (
    <div style={{ marginTop: 6 }}>
      <div className="gp-sobre"><Objeto id={CALCULADORA} alto={72} /></div>
      <Pantallas v={valores} />
    </div>
  ),
  encima: (e) => <Rollo {...e} />,
  etapas: [{}, { mesa: "tu" }],
};

export default function C07H03Calculadora({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
