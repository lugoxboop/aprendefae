import { useState, useRef } from "react";
import { Info, RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";

/*
 * "Dashboard económico en vivo".
 *
 * Tres instrumentos de tres estrategias distintas y tres indicadores que se
 * mueven todos a la vez: la idea es que el estudiante sienta el trade-off, no
 * que lo lea. Por eso los medidores se recalculan en cada render, sin botón de
 * por medio; confirmar solo congela y evalúa.
 *
 * El modelo es lineal y aditivo a propósito: es una simplificación pedagógica,
 * no una predicción económica. Se advierte en la interfaz.
 */

const BASE = { desempleo: 14, inflacion: 6.5, pib: 1.5 };
const META = { desempleo: 12, inflacion: 6, pib: 0 };

const INSTRUMENTOS = [
  { id: "impuesto", etiqueta: "Impuesto a la renta de empresas", estrategia: "Política fiscal", min: 20, max: 35, base: 32, paso: 0.5 },
  { id: "tasa", etiqueta: "Tasa de interés de referencia", estrategia: "Política monetaria", min: 4, max: 12, base: 8, paso: 0.25 },
  { id: "aranceles", etiqueta: "Aranceles a las importaciones", estrategia: "Política comercial", min: 0, max: 20, base: 10, paso: 0.5 },
];

const LIMITES = {
  desempleo: [3, 25],
  inflacion: [0, 30],
  pib: [-5, 10],
};

const sujetar = (v, [min, max]) => Math.max(min, Math.min(max, v));

/*
 * Efectos por punto de desviación respecto al valor base. El signo del delta
 * ya lleva la dirección, así que subir un instrumento invierte su efecto.
 */
export function simular({ impuesto, tasa, aranceles }) {
  const dImpuesto = 32 - impuesto;   // positivo si el impuesto baja
  const dTasa = 8 - tasa;            // positivo si la tasa baja
  const dAranceles = aranceles - 10; // positivo si los aranceles suben

  /*
   * Los coeficientes están calibrados, no elegidos a ojo: con la inflación
   * base en 8% el 100% era inalcanzable en las 41.943 combinaciones del
   * espacio de decisión, porque todo instrumento que baja el desempleo sube
   * la inflación. Bajar la base a 6.5% abre la ventana.
   *
   * Es una ventana estrecha a propósito: 70 de 41.943 combinaciones, el 0.2%
   * del espacio. Por eso el mensaje del 100% habla de llevar los instrumentos
   * al límite — el margen es apretado de verdad, no por decoración.
   *
   * El 0.3 quedó decidido, no pendiente. La alternativa evaluada era 0.35, que
   * ensancha la ventana a 443 combinaciones (1.1%), y se descartó justamente
   * por eso: aflojarla contradiría el mensaje que el estudiante lee al ganar.
   *
   * Cualquier cambio a estos números tiene que volver a pasar por
   * `npm run barrido`: mover uno solo puede dejar un nivel inalcanzable.
   */
  const desempleo = BASE.desempleo - 0.3 * dImpuesto - 0.25 * dTasa - 0.1 * dAranceles;
  const inflacion = BASE.inflacion + 0.15 * dImpuesto + 0.3 * dTasa + 0.2 * dAranceles;
  const pib = BASE.pib + 0.1 * dImpuesto + 0.15 * dTasa - 0.05 * dAranceles;

  return {
    desempleo: sujetar(desempleo, LIMITES.desempleo),
    inflacion: sujetar(inflacion, LIMITES.inflacion),
    pib: sujetar(pib, LIMITES.pib),
  };
}

/*
 * Tres niveles de resultado; el porcentaje va tal cual al motor de FP.
 *
 * Hubo un cuarto —ambas metas cumplidas pero con recesión, que valía 30%— y
 * se quitó porque no puede ocurrir: llegar a las dos metas exige una rebaja de
 * impuesto que empuja el PIB hacia arriba, así que la recesión y el doble
 * acierto no coexisten. Era una rama muerta que sugería un caso inexistente.
 */
export function evaluar({ desempleo, inflacion, pib }) {
  const okDesempleo = desempleo <= META.desempleo;
  const okInflacion = inflacion <= META.inflacion;
  const recesion = pib < META.pib;

  if (okDesempleo && okInflacion && !recesion) {
    return {
      porcentaje: 100,
      feedback: "✅ Lo lograste. Para lograrlo tuviste que llevar casi todos los instrumentos al límite — así de apretado es el margen cuando dos metas jalan para lados distintos. Ningún instrumento actúa solo, siempre hay un precio en otro lado.",
    };
  }
  if ((okDesempleo || okInflacion) && !recesion) {
    return {
      porcentaje: 60,
      feedback: "🟡 Lograste una meta, pero la otra se te fue. Este es el dilema de siempre — bajar impuestos y tasas ayuda al empleo, pero le mete presión a los precios. Prueba un balance distinto entre los tres instrumentos.",
    };
  }
  return {
    porcentaje: 10,
    feedback: "❌ Ni el desempleo ni la inflación llegaron a la meta esta vez. Bajar impuestos y tasas sí ayuda al empleo, pero también infla los precios — necesitas un punto medio, no ir al extremo.",
  };
}

/* ------------------------------ medidor ------------------------------ */

const R = 62;
const CX = 80;
const CY = 76;

const puntoEnArco = (t) => {
  /* t va de 0 (izquierda) a 1 (derecha) sobre el semicírculo superior. */
  const ang = Math.PI * (1 - t);
  return { x: CX + R * Math.cos(ang), y: CY - R * Math.sin(ang) };
};

const arco = (t0, t1) => {
  const a = puntoEnArco(t0);
  const b = puntoEnArco(t1);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

function Medidor({ etiqueta, valor, min, max, objetivo, direccion, sufijo = "%" }) {
  const t = (valor - min) / (max - min);
  const tObjetivo = (objetivo - min) / (max - min);
  const dentro = direccion === "menor" ? valor <= objetivo : valor >= objetivo;
  const color = dentro ? FAE.teal : FAE.coral;

  const aguja = puntoEnArco(Math.max(0, Math.min(1, t)));
  const marca0 = puntoEnArco(Math.max(0, Math.min(1, tObjetivo)));
  const marca1 = {
    x: CX + (R + 9) * Math.cos(Math.PI * (1 - tObjetivo)),
    y: CY - (R + 9) * Math.sin(Math.PI * (1 - tObjetivo)),
  };

  /* Zona en meta, del extremo correspondiente hasta el objetivo. */
  const zona = direccion === "menor" ? arco(0, Math.max(0.001, tObjetivo)) : arco(Math.min(0.999, tObjetivo), 1);

  return (
    <div
      style={{
        borderRadius: "16px",
        background: "rgba(248,249,250,0.04)",
        border: "1px solid rgba(248,249,250,0.12)",
        padding: "14px 16px 12px",
        textAlign: "center",
      }}
    >
      <svg viewBox="0 0 160 96" width="100%" style={{ display: "block", maxHeight: "112px", margin: "0 auto" }} aria-hidden="true">
        <path d={arco(0, 1)} fill="none" stroke="rgba(248,249,250,0.14)" strokeWidth="9" strokeLinecap="round" />
        <path d={zona} fill="none" stroke={FAE.teal} strokeWidth="9" strokeLinecap="round" opacity="0.32" />
        {/* marca coral del objetivo */}
        <line x1={marca0.x} y1={marca0.y} x2={marca1.x} y2={marca1.y} stroke={FAE.coral} strokeWidth="2.5" strokeLinecap="round" />
        {/* aguja */}
        <line
          x1={CX} y1={CY} x2={aguja.x} y2={aguja.y}
          stroke={color} strokeWidth="3" strokeLinecap="round"
          style={{ transition: "all 90ms ease-out" }}
        />
        <circle cx={CX} cy={CY} r="5" fill={color} />
      </svg>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(248,249,250,0.55)", margin: "2px 0 2px" }}>
        {etiqueta.toUpperCase()}
      </p>
      <p
        style={{
          fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "22px", margin: 0,
          color, fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor.toFixed(1)}{sufijo}
      </p>
      <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "3px 0 0" }}>
        meta {direccion === "menor" ? "≤" : "≥"} {objetivo}{sufijo}
      </p>
    </div>
  );
}

/* ------------------------------ página ------------------------------ */

export default function DashboardEconomico({ onCompletar }) {
  const [valores, setValores] = useState({ impuesto: 32, tasa: 8, aranceles: 10 });
  const [resultado, setResultado] = useState(null);
  const [notaAbierta, setNotaAbierta] = useState(false);
  const inicio = useRef(Date.now());

  const indicadores = simular(valores);
  const congelado = resultado !== null;

  const confirmar = () => {
    if (congelado) return;
    const evaluacion = evaluar(indicadores);
    setResultado({ ...evaluacion, indicadores });
    onCompletar?.(evaluacion.porcentaje, Date.now() - inicio.current);
  };

  const reiniciar = () => {
    setValores({ impuesto: 32, tasa: 8, aranceles: 10 });
    setResultado(null);
    inicio.current = Date.now();
  };

  return (
    <div>
      <div
        style={{
          borderRadius: "16px",
          background: "rgba(248,249,250,0.04)",
          border: "1px solid rgba(248,249,250,0.12)",
          padding: "16px 18px",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontSize: "15px", lineHeight: 1.6, margin: 0, color: FAE.text }}>
          Colombia enfrenta un desempleo del 14% y una inflación del 8%. La meta oficial: reducir el desempleo
          a 12% sin que la inflación supere el 6%, manteniendo la economía en crecimiento (PIB ≥ 0%).
        </p>
      </div>

      {/* medidores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        <Medidor etiqueta="Desempleo" valor={indicadores.desempleo} min={LIMITES.desempleo[0]} max={LIMITES.desempleo[1]} objetivo={META.desempleo} direccion="menor" />
        <Medidor etiqueta="Inflación" valor={indicadores.inflacion} min={LIMITES.inflacion[0]} max={LIMITES.inflacion[1]} objetivo={META.inflacion} direccion="menor" />
        <Medidor etiqueta="PIB" valor={indicadores.pib} min={LIMITES.pib[0]} max={LIMITES.pib[1]} objetivo={META.pib} direccion="mayor" />
      </div>

      {/* instrumentos */}
      <div
        style={{
          borderRadius: "16px",
          background: "rgba(248,249,250,0.04)",
          border: "1px solid rgba(248,249,250,0.12)",
          padding: "18px 20px",
          marginBottom: "16px",
        }}
      >
        {INSTRUMENTOS.map((ins) => {
          const v = valores[ins.id];
          const pct = ((v - ins.min) / (ins.max - ins.min)) * 100;
          return (
            <div key={ins.id} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
                <div>
                  <span style={{ fontSize: "14px", color: FAE.text }}>{ins.etiqueta}</span>
                  <span style={{ fontSize: "12px", color: FAE.teal, marginLeft: "8px" }}>{ins.estrategia}</span>
                </div>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {v}%
                </span>
              </div>
              <input
                type="range"
                className="da-slider"
                min={ins.min}
                max={ins.max}
                step={ins.paso}
                value={v}
                disabled={congelado}
                aria-label={`${ins.etiqueta} (${ins.estrategia})`}
                onChange={(e) => setValores((s) => ({ ...s, [ins.id]: parseFloat(e.target.value) }))}
                style={{
                  background: `linear-gradient(to right, ${FAE.teal} 0%, ${FAE.teal} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
                  "--fill-color": FAE.teal,
                  opacity: congelado ? 0.5 : 1,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(248,249,250,0.35)", marginTop: "2px" }}>
                <span>{ins.min}%</span>
                <span>base {ins.base}%</span>
                <span>{ins.max}%</span>
              </div>
            </div>
          );
        })}

        {/* aviso de simplificación */}
        <button
          type="button"
          onClick={() => setNotaAbierta((v) => !v)}
          aria-expanded={notaAbierta}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            fontFamily: "Inter, sans-serif", fontSize: "12.5px",
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            color: "rgba(248,249,250,0.5)",
          }}
        >
          <Info size={14} />
          ¿Qué tan real es este modelo?
        </button>
        {notaAbierta && (
          <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: "8px 0 0" }}>
            Es una simplificación pedagógica, no un modelo econométrico. Los efectos son lineales y se suman
            entre sí; la economía real tiene rezagos, expectativas e interacciones que aquí no están. Sirve para
            sentir cómo cada instrumento se paga en otro lado, no para predecir.
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={confirmar}
          disabled={congelado}
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            padding: "11px 20px", borderRadius: "999px", border: "none",
            cursor: congelado ? "default" : "pointer",
            backgroundColor: congelado ? "rgba(248,249,250,0.08)" : FAE.teal,
            color: congelado ? "rgba(248,249,250,0.45)" : FAE.bg,
          }}
        >
          {congelado ? "Decisión confirmada" : "Confirmar decisión de política"}
        </button>
        {congelado && (
          <button
            type="button"
            onClick={reiniciar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            <RotateCcw size={14} />
            Probar otra combinación
          </button>
        )}
      </div>

      {resultado && (
        <div
          style={{
            borderRadius: "16px",
            background: resultado.porcentaje >= 60 ? "rgba(42,157,143,0.09)" : "rgba(231,111,81,0.09)",
            border: `1px solid ${resultado.porcentaje >= 60 ? "rgba(42,157,143,0.34)" : "rgba(231,111,81,0.34)"}`,
            padding: "18px 20px",
          }}
        >
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: "0 0 12px", color: "rgba(248,249,250,0.88)" }}>
            {resultado.feedback}
          </p>
          <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            Desempleo {resultado.indicadores.desempleo.toFixed(1)}% · Inflación{" "}
            {resultado.indicadores.inflacion.toFixed(1)}% · PIB {resultado.indicadores.pib.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
