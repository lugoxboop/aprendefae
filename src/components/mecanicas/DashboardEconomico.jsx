import { useState, useRef } from "react";
import { Info, RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * RETIRADA DE LA INTERFAZ EN LA 0015 — NO BORRAR ESTE ARCHIVO.
 *
 * Ya no está registrada en subjects.js ni se renderiza en PoliticaEconomicaView,
 * y su fila del catálogo quedó marcada `retirada = true` como lápida. El retiro
 * fue blando aunque la consulta de impacto diera cero filas en fp_history: la
 * fila cuesta nada y evita el "Actividad desconocida" si un cliente con caché
 * vieja todavía la llama.
 *
 * SE CONSERVA EL ARCHIVO porque su MODELO —`simular` y `evaluar`— es el punto
 * de partida del "Tablero de decisiones" que lo sustituirá, y porque
 * dashboard.test.mjs y `npm run barrido` siguen midiéndolo. Borrarlo ahora
 * tiraría el barrido de las 41.943 combinaciones con él.
 * ═══════════════════════════════════════════════════════════════════════════
 *
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

/*
 * EL MODELO YA NO VIVE AQUÍ. Se movió a data/tableroDecisiones.js cuando el
 * "Tablero de decisiones" lo heredó: tener dos copias de unos coeficientes
 * verificados con un barrido de 41.943 combinaciones era pedir que se
 * separaran. Se reexportan para no romper dashboard.test.mjs ni el barrido.
 */
import { simular, evaluar, INSTRUMENTOS, LIMITES, META } from "../../data/tableroDecisiones.js";

/* dashboard.test.mjs y el barrido siguen importando desde aquí. */
export { simular, evaluar };

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

/*
 * Un medidor puede ser de META o de CONTEXTO, y la diferencia no es cosmética.
 *
 * El PIB es de contexto: el barrido de las 41.943 combinaciones demostró que va
 * de 0,10% a 3,80% y que la recesión es inalcanzable, así que presentarlo con
 * arco coral, zona verde y un rótulo de "meta" le prometía al estudiante una
 * condición que no puede incumplir. Sin `objetivo` no dibuja ni marca ni zona,
 * la aguja va en color neutro —no verde ni coral, porque no hay nada que
 * aprobar— y el rótulo dice lo que es.
 */
function Medidor({ etiqueta, valor, min, max, objetivo = null, direccion, sufijo = "%", nota }) {
  const esContexto = objetivo === null;
  const t = (valor - min) / (max - min);
  const tObjetivo = esContexto ? 0 : (objetivo - min) / (max - min);
  const dentro = esContexto ? null : direccion === "menor" ? valor <= objetivo : valor >= objetivo;
  const color = esContexto ? FAE.node : dentro ? FAE.teal : FAE.coral;

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
      <svg
        viewBox="0 0 160 96" width="100%" style={{ display: "block", maxHeight: "112px", margin: "0 auto" }}
        role="img"
        aria-label={
          esContexto
            ? `${etiqueta}: ${valor.toFixed(1)}${sufijo}. Indicador de contexto, sin meta.`
            : `${etiqueta}: ${valor.toFixed(1)}${sufijo}. Meta ${direccion === "menor" ? "menor o igual a" : "mayor o igual a"} ${objetivo}${sufijo}. ${dentro ? "En meta." : "Fuera de meta."}`
        }
      >
        <path d={arco(0, 1)} fill="none" stroke="rgba(248,249,250,0.14)" strokeWidth="9" strokeLinecap="round" />
        {/* Zona y marca solo donde HAY meta: el indicador de contexto no lleva ninguna. */}
        {!esContexto && (
          <>
            <path d={zona} fill="none" stroke={FAE.teal} strokeWidth="9" strokeLinecap="round" opacity="0.32" />
            {/* marca coral del objetivo */}
            <line x1={marca0.x} y1={marca0.y} x2={marca1.x} y2={marca1.y} stroke={FAE.coral} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
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
        {esContexto ? (nota ?? "indicador de contexto") : `meta ${direccion === "menor" ? "≤" : "≥"} ${objetivo}${sufijo}`}
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
        {/*
          LAS CIFRAS DE AQUÍ NO SON LAS REALES, y hay que decirlo antes de que
          toque nada. "El tablero de fallas", en este mismo tema, muestra los
          datos verdaderos del profesor —desempleo 8,1%, inflación 6%— y quien
          pase por las dos pantallas vería dos verdades distintas sobre el mismo
          país. El aviso va arriba del escenario, no en una nota al pie.
        */}
        <p
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.08em", color: FAE.ambar, margin: "0 0 10px",
            padding: "6px 11px", borderRadius: "999px",
            background: "rgba(233,196,106,0.10)", border: `1px solid ${FAE.ambar}55`,
          }}
        >
          Escenario simulado — las cifras de este ejercicio no son los datos reales de Colombia
        </p>
        <p style={{ fontSize: "15px", lineHeight: 1.6, margin: 0, color: FAE.text }}>
          Colombia enfrenta un desempleo del 14% y una inflación del 6,5%. La meta oficial: reducir el
          desempleo a 12% sin que la inflación supere el 6%. El PIB se muestra como indicador de contexto
          — te deja ver cómo cada decisión afecta el crecimiento, aunque no es una condición que debas
          cumplir.
        </p>
      </div>

      {/* medidores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        <Medidor etiqueta="Desempleo" valor={indicadores.desempleo} min={LIMITES.desempleo[0]} max={LIMITES.desempleo[1]} objetivo={META.desempleo} direccion="menor" />
        <Medidor etiqueta="Inflación" valor={indicadores.inflacion} min={LIMITES.inflacion[0]} max={LIMITES.inflacion[1]} objetivo={META.inflacion} direccion="menor" />
        {/* Sin `objetivo`: el PIB es contexto, no meta. Ver el comentario de Medidor. */}
        <Medidor etiqueta="PIB" valor={indicadores.pib} min={LIMITES.pib[0]} max={LIMITES.pib[1]} direccion="mayor" nota="contexto, no es meta" />
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
