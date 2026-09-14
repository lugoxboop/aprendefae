import { useEffect, useRef, useState } from "react";
import { RotateCcw, TriangleAlert, Info } from "lucide-react";
import { FAE } from "../../theme.js";
import { simular, evaluar, INSTRUMENTOS, LIMITES, META, BASE } from "../../data/tableroDecisiones.js";

/*
 * ACTIVIDAD 3 — "El Tablero de Decisiones".
 *
 * Juego evaluativo, nivel experto. Tres palancas de política y tres medidores;
 * confirmar congela el panel y entrega el resultado.
 *
 * ═══════════ QUÉ HEREDA Y QUÉ NO DEL DASHBOARD RETIRADO ═══════════
 *
 * HEREDA EL MODELO, verificado: los coeficientes, los rangos de los
 * instrumentos y los tres tramos (100 / 60 / 10) con sus mensajes. Ese modelo
 * pasó un barrido de las 41.943 combinaciones del espacio de decisión y no se
 * recalcula aquí: cambiar un coeficiente exige repetir el barrido.
 *
 * NO HEREDA NADA DE SU INTERFAZ. Aquel eran deslizadores planos y medidores
 * pequeños; este son palancas con recorrido físico e inercia, y esferas
 * grandes cuyas agujas se mueven con suavizado. Es una reconstrucción, no un
 * cambio de piel.
 *
 * ═══════════ EL PIB ES CONTEXTO, NO META ═══════════
 *
 * El barrido demostró que el PIB nunca baja de 0,10%: la recesión es
 * inalcanzable con estos coeficientes. Prometerla como condición sería
 * prometer algo que el estudiante no puede incumplir. Así que el PIB se
 * muestra —ver cómo reacciona es útil— pero SIN arco de meta, sin zona verde y
 * con la aguja en color neutro. Los arcos coral quedan solo en desempleo (12%)
 * e inflación (6%).
 *
 * ═══════════ LAS CIFRAS NO SON LAS REALES ═══════════
 *
 * 14% y 6,5% son de este ejercicio. "El tablero de fallas", en este mismo
 * tema, muestra las verdaderas del profesor —8,1% y 6%— y quien pase por las
 * dos pantallas vería dos verdades sobre el mismo país. El aviso va arriba,
 * antes de las palancas.
 */

const VB = { w: 180, h: 108 };
const CX = 90;
const CY = 88;
const R = 68;

/* Ángulo sobre el semicírculo superior: t de 0 (izquierda) a 1 (derecha). */
const punto = (t, radio = R) => {
  const ang = Math.PI * (1 - Math.max(0, Math.min(1, t)));
  return { x: CX + radio * Math.cos(ang), y: CY - radio * Math.sin(ang) };
};

const arco = (t0, t1, radio = R) => {
  const a = punto(t0, radio);
  const b = punto(t1, radio);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radio} ${radio} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

const CSS = `
@keyframes fae-td-entrar { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
.fae-td-entrar { animation: fae-td-entrar 420ms ease-out both; }
@keyframes fae-td-resplandor {
  0%, 100% { opacity: .18; }
  50%      { opacity: .42; }
}
.fae-td-resplandor { animation: fae-td-resplandor 2.6s ease-in-out infinite; }
@keyframes fae-td-alerta { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
.fae-td-alerta { animation: fae-td-alerta 2.4s ease-in-out infinite; }
/*
 * La aguja y el mango se mueven con la MISMA curva de suavizado: es lo que da
 * la sensación de inercia. Sin ella el instrumento salta y parece un input,
 * no una palanca.
 */
.fae-td-aguja { transition: transform 620ms cubic-bezier(.22,1,.36,1); }
.fae-td-mango { transition: top 420ms cubic-bezier(.22,1,.36,1), background 300ms ease; }
@media (prefers-reduced-motion: reduce) {
  .fae-td-entrar, .fae-td-resplandor, .fae-td-alerta { animation: none !important; }
  .fae-td-aguja, .fae-td-mango { transition: none !important; }
}
`;

/* Exportado para la previsualización del camino: la aguja necesita su transición. */
export const CSS_TABLERO = CSS;

/* ─────────────────────────── el medidor ─────────────────────────── */

/*
 * Con `objetivo` dibuja arco coral, zona verde y rótulo de meta. Sin él —el
 * caso del PIB— no dibuja ninguno y la aguja va en color neutro: no hay nada
 * que aprobar, así que no se pinta como si lo hubiera.
 */
export function Esfera({ etiqueta, valor, min, max, objetivo = null, direccion, nota, soloDial = false }) {
  const contexto = objetivo === null;
  const t = (valor - min) / (max - min);
  const tMeta = contexto ? 0 : (objetivo - min) / (max - min);
  const enMeta = contexto ? false : direccion === "menor" ? valor <= objetivo : valor >= objetivo;
  const color = contexto ? FAE.node : enMeta ? FAE.teal : FAE.coral;

  const aguja = punto(t, R - 9);
  /* El ángulo de la aguja, para poder rotarla con transición en vez de saltar. */
  const grados = -180 + Math.max(0, Math.min(1, t)) * 180;

  const fondoArco = <path d={arco(0, 1)} fill="none" stroke="rgba(248,249,250,0.13)" strokeWidth="11" strokeLinecap="round" />;
  const agujaYEje = (
    <>
      {/* La aguja: rota con inercia desde el eje. */}
      <g
        className="fae-td-aguja"
        style={{ transform: `rotate(${grados}deg)`, transformOrigin: `${CX}px ${CY}px` }}
      >
        <line x1={CX} y1={CY} x2={CX + (R - 9)} y2={CY} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <circle cx={CX} cy={CY} r="6.5" fill={color} />
      <circle cx={CX} cy={CY} r="2.5" fill={FAE.bg} />
    </>
  );

  /*
   * SOLO EL DIAL: la previsualización del nodo en el camino. Es este mismo
   * medidor —el mismo arco, la misma aguja, la misma curva de inercia—, no
   * una copia, pero sin tarjeta, sin cifras y sin meta: una previsualización
   * no puede enseñar ni un número ni dónde está el objetivo.
   */
  if (soloDial) {
    return (
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" aria-hidden="true" style={{ display: "block" }}>
        {fondoArco}
        {agujaYEje}
      </svg>
    );
  }

  return (
    <div
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: "18px", padding: "14px 14px 12px", textAlign: "center",
        background: "rgba(248,249,250,0.04)",
        border: `1px solid ${enMeta ? `${FAE.teal}66` : "rgba(248,249,250,0.12)"}`,
        transition: "border-color 500ms ease",
      }}
    >
      {/* El resplandor de "en meta", sobre toda la esfera. */}
      {enMeta && (
        <span
          aria-hidden="true"
          className="fae-td-resplandor"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle at 50% 75%, ${FAE.teal}, transparent 70%)`,
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" style={{ display: "block", position: "relative" }}
        role="img"
        aria-label={
          contexto
            ? `${etiqueta}: ${valor.toFixed(1)}%. Indicador de contexto, sin meta.`
            : `${etiqueta}: ${valor.toFixed(1)}%. Meta ${direccion === "menor" ? "menor o igual a" : "mayor o igual a"} ${objetivo}%. ${enMeta ? "En meta." : "Fuera de meta."}`
        }
      >
        {fondoArco}

        {/* Zona verde y arco coral SOLO donde hay meta. */}
        {!contexto && (
          <>
            <path
              d={direccion === "menor" ? arco(0, Math.max(0.002, tMeta)) : arco(Math.min(0.998, tMeta), 1)}
              fill="none" stroke={FAE.teal} strokeWidth="11" strokeLinecap="round" opacity="0.3"
            />
            <path
              d={direccion === "menor" ? arco(Math.max(0.002, tMeta), 1) : arco(0, Math.min(0.998, tMeta))}
              fill="none" stroke={FAE.coral} strokeWidth="4" strokeLinecap="round" opacity="0.75"
            />
          </>
        )}

        {agujaYEje}
      </svg>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.55)", margin: "4px 0 2px", position: "relative" }}>
        {etiqueta.toUpperCase()}
      </p>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3.4vw, 26px)", margin: 0, color, fontVariantNumeric: "tabular-nums", position: "relative" }}>
        {valor.toFixed(1)}%
      </p>
      <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "3px 0 0", position: "relative" }}>
        {contexto ? (nota ?? "indicador de contexto") : `meta ${direccion === "menor" ? "≤" : "≥"} ${objetivo}%`}
      </p>
    </div>
  );
}

/* ─────────────────────────── la palanca ─────────────────────────── */

/*
 * Recorrido vertical con mango metálico. El input range va encima, invisible y
 * girado: así se arrastra con el dedo y con el teclado sin escribir gestión de
 * punteros a mano, y el mango que se ve es el que dibujamos.
 */
function Palanca({ ins, valor, onCambiar, bloqueada }) {
  const t = (valor - ins.min) / (ins.max - ins.min);
  /* 0 abajo, 1 arriba. El mango se sitúa en % desde arriba. */
  const desdeArriba = (1 - t) * 100;

  return (
    <div style={{ display: "flex", gap: "13px", alignItems: "stretch" }}>
      {/* El carril. */}
      <div
        style={{
          position: "relative", width: "42px", flexShrink: 0, minHeight: "132px",
          borderRadius: "12px",
          background: "linear-gradient(90deg, rgba(10,20,34,0.9), rgba(41,52,68,0.9), rgba(10,20,34,0.9))",
          border: "1px solid rgba(248,249,250,0.16)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
        }}
      >
        {/* Muescas del recorrido. */}
        {[0, 25, 50, 75, 100].map((p) => (
          <span
            key={p}
            aria-hidden="true"
            style={{
              position: "absolute", left: "5px", right: "5px", top: `${p}%`,
              height: "1px", background: "rgba(203,220,242,0.14)",
            }}
          />
        ))}

        {/* El mango. */}
        <span
          aria-hidden="true"
          className="fae-td-mango"
          style={{
            position: "absolute", left: "3px", right: "3px", top: `calc(${desdeArriba}% - 11px)`,
            height: "22px", borderRadius: "6px",
            background: bloqueada
              ? "linear-gradient(180deg, #4a5568, #2d3748)"
              : `linear-gradient(180deg, #CBDCF2, #7f92ab)`,
            boxShadow: "0 2px 5px rgba(0,0,0,0.55)",
            border: "1px solid rgba(10,20,34,0.6)",
          }}
        />

        {/* El control real, invisible sobre el carril. */}
        <input
          type="range"
          min={ins.min}
          max={ins.max}
          step={ins.paso}
          value={valor}
          disabled={bloqueada}
          onChange={(e) => onCambiar(Number(e.target.value))}
          aria-label={`${ins.etiqueta}: ${valor}%`}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            appearance: "none", background: "transparent",
            /* Vertical: se gira el control y se estira sobre el carril. */
            writingMode: "vertical-lr", direction: "rtl",
            cursor: bloqueada ? "default" : "grab", opacity: 0,
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, color: FAE.text, margin: "0 0 3px", lineHeight: 1.3 }}>
          {ins.etiqueta}
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.teal, margin: "0 0 8px" }}>
          {ins.estrategia.toUpperCase()}
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
          {valor}%
        </p>
        <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "2px 0 0" }}>
          base {ins.base}% · de {ins.min}% a {ins.max}%
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── el tablero ─────────────────────────── */

const INICIAL = Object.fromEntries(INSTRUMENTOS.map((i) => [i.id, i.base]));

export default function TableroDeDecisiones({ onCompletar }) {
  const [valores, setValores] = useState(INICIAL);
  const [resultado, setResultado] = useState(null);
  const [notaAbierta, setNotaAbierta] = useState(false);
  const inicio = useRef(Date.now());

  const indicadores = simular(valores);
  const congelado = resultado !== null;
  /* El botón no se activa hasta que se ha movido algo: confirmar la base no es decidir. */
  const movida = INSTRUMENTOS.some((i) => valores[i.id] !== i.base);

  const confirmar = () => {
    if (congelado || !movida) return;
    const ev = evaluar(indicadores);
    setResultado({ ...ev, indicadores });
    onCompletar?.(ev.porcentaje, Date.now() - inicio.current);
  };

  const reiniciar = () => {
    setValores(INICIAL);
    setResultado(null);
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ───────────── el escenario, con su aviso ───────────── */}
      <div style={{ borderRadius: "16px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "16px 18px", marginBottom: "16px" }}>
        <p
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.05em", color: FAE.ambar, margin: "0 0 10px",
            padding: "6px 11px", borderRadius: "999px",
            background: "rgba(233,196,106,0.10)", border: `1px solid ${FAE.ambar}55`,
          }}
        >
          <TriangleAlert size={12} className="fae-td-alerta" />
          Escenario simulado — las cifras de este ejercicio no son los datos reales de Colombia
        </p>
        <p style={{ fontSize: "15px", lineHeight: 1.6, margin: 0, color: FAE.text }}>
          Colombia enfrenta un desempleo del 14% y una inflación del 6,5%. La meta oficial: reducir el
          desempleo a 12% sin que la inflación supere el 6%. El PIB se muestra como indicador de contexto
          — te deja ver cómo cada decisión afecta el crecimiento, aunque no es una condición que debas
          cumplir.
        </p>
      </div>

      {/* ───────────── las tres esferas ───────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        <Esfera etiqueta="Desempleo" valor={indicadores.desempleo} min={LIMITES.desempleo[0]} max={LIMITES.desempleo[1]} objetivo={META.desempleo} direccion="menor" />
        <Esfera etiqueta="Inflación" valor={indicadores.inflacion} min={LIMITES.inflacion[0]} max={LIMITES.inflacion[1]} objetivo={META.inflacion} direccion="menor" />
        {/* Sin `objetivo`: el PIB es contexto. Ver el comentario de Esfera. */}
        <Esfera etiqueta="PIB" valor={indicadores.pib} min={LIMITES.pib[0]} max={LIMITES.pib[1]} direccion="mayor" nota="contexto, no es meta" />
      </div>

      {/* ───────────── las tres palancas ───────────── */}
      <div
        style={{
          borderRadius: "18px",
          background: "linear-gradient(160deg, rgba(29,53,87,0.34), rgba(10,20,34,0.62))",
          border: "1px solid rgba(248,249,250,0.14)",
          boxShadow: "inset 0 1px 0 rgba(248,249,250,0.08)",
          padding: "clamp(15px, 2.4vw, 20px)", marginBottom: "16px",
        }}
      >
        {/*
          Tres palancas en fila en escritorio; en móvil se apilan. Cada una
          necesita su carril vertical de 132 px y su rótulo al lado: tres en
          fila sobre 375 px dejarían el texto en dos letras por línea.
        */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "18px" }}>
          {INSTRUMENTOS.map((ins) => (
            <Palanca
              key={ins.id}
              ins={ins}
              valor={valores[ins.id]}
              bloqueada={congelado}
              onCambiar={(v) => setValores((s) => ({ ...s, [ins.id]: v }))}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNotaAbierta((v) => !v)}
          aria-expanded={notaAbierta}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "16px",
            fontFamily: "Inter, sans-serif", fontSize: "12.5px",
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            color: "rgba(248,249,250,0.5)",
          }}
        >
          <Info size={14} /> ¿Qué tan real es este modelo?
        </button>
        {notaAbierta && (
          <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: "8px 0 0" }}>
            Es una simplificación pedagógica, no un modelo econométrico. Los efectos son lineales y se suman
            entre sí; la economía real tiene rezagos, expectativas e interacciones que aquí no están. Sirve para
            sentir cómo cada instrumento se paga en otro lado, no para predecir.
          </p>
        )}
      </div>

      {/* ───────────── confirmar ───────────── */}
      {!congelado ? (
        <button
          type="button"
          onClick={confirmar}
          disabled={!movida}
          style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            cursor: movida ? "pointer" : "default",
            background: movida ? FAE.teal : "rgba(248,249,250,0.05)",
            border: `1px solid ${movida ? FAE.teal : "rgba(248,249,250,0.14)"}`,
            color: movida ? FAE.bg : "rgba(248,249,250,0.35)",
            fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
          }}
        >
          {movida ? "Confirmar decisión" : "Mueve al menos una palanca"}
        </button>
      ) : (
        <div
          className="fae-td-entrar"
          style={{
            borderRadius: "16px",
            background: resultado.porcentaje >= 60 ? "rgba(42,157,143,0.09)" : "rgba(231,111,81,0.09)",
            border: `1px solid ${resultado.porcentaje >= 60 ? "rgba(42,157,143,0.34)" : "rgba(231,111,81,0.34)"}`,
            padding: "18px 20px",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "28px", color: FAE.text, margin: "0 0 8px", fontVariantNumeric: "tabular-nums" }}>
            {resultado.porcentaje}%
          </p>
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: "0 0 12px", color: "rgba(248,249,250,0.88)" }}>
            {resultado.feedback}
          </p>
          <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: "0 0 14px", fontVariantNumeric: "tabular-nums" }}>
            Desempleo {resultado.indicadores.desempleo.toFixed(1)}% · Inflación{" "}
            {resultado.indicadores.inflacion.toFixed(1)}% · PIB {resultado.indicadores.pib.toFixed(1)}%
          </p>
          <button
            type="button"
            onClick={reiniciar}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
          >
            <RotateCcw size={14} /> Probar otra combinación
          </button>
        </div>
      )}
    </div>
  );
}
