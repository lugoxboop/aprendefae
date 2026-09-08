import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../../theme.js";
import { INICIAL, calcular, COMPONENTES } from "../../../data/corazonDA.js";
import { CSS_CORAZON, Camara, Arteria, Vaso, Valvula, Camaraseccion, pesos, pesosM, enMillones } from "./circulatorio.jsx";

/*
 * APRENDER 1 — "El corazón de la economía".
 *
 * Dos niveles anidados, fieles a las fórmulas del profesor. Cada componente
 * grande no aparece de la nada: se arma con piezas más chicas, y algunas de
 * esas piezas NO SUMAN.
 *
 * ═══════════ LA DISTINCIÓN QUE ESTA PIEZA EXISTE PARA ARREGLAR ═══════════
 *
 * Las propensiones y las elasticidades son VÁLVULAS, no vasos que suman. Es
 * exactamente lo que los estudiantes confunden: ven `c` en la fórmula y creen
 * que el 0,6 se suma como los demás números. Por eso vasos y válvulas se
 * dibujan distinto y nunca se mezclan — círculo lleno contra rombo hueco.
 *
 * ═══════════ EL AHORRO NO DESAPARECE ═══════════
 *
 * Lo que la válvula `c` no deja pasar se dibuja saliendo por un vaso lateral
 * rotulado "Ahorro". Los estudiantes creen que el resto se esfuma; verlo salir
 * por algún lado es lo que corrige esa idea, y por eso ese vaso no es un
 * adorno.
 *
 * ═══════════ EL GASTO PÚBLICO ES SIMPLE A PROPÓSITO ═══════════
 *
 * Una sola arteria, sin válvulas. El modelo del profesor no lo desglosa, y
 * añadirle piezas para que quede simétrico con las otras tres sería inventarse
 * una estructura que no existe. La simetría visual no vale una mentira.
 *
 * Sin FP, sin preguntas, sin condición de término: se trastea.
 */

const MAX_ARTERIA = 5_000_000;

function Control({ etiqueta, hint, valor, min, max, paso, formato, acento, onChange }) {
  return (
    <label style={{ display: "block", marginBottom: "10px" }}>
      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.72)" }}>
          {etiqueta}
          {/* Vaso o válvula, escrito: el color y la forma no van solos. */}
          <span style={{ marginLeft: "6px", fontSize: "10.5px", color: acento, letterSpacing: "0.04em" }}>
            {hint}
          </span>
        </span>
        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {formato(valor)}
        </span>
      </span>
      <input
        type="range"
        min={min} max={max} step={paso} value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: acento, cursor: "pointer" }}
      />
    </label>
  );
}

function Cifra({ rotulo, valor, color = FAE.text, nota }) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: "0 0 2px", fontSize: "10.5px", letterSpacing: "0.05em", color: "rgba(248,249,250,0.45)" }}>{rotulo}</p>
      <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{valor}</p>
      {nota && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.45)", lineHeight: 1.4 }}>{nota}</p>}
    </div>
  );
}

export default function CorazonEconomia() {
  const [v, setV] = useState(INICIAL);
  const set = (k) => (n) => setV((p) => ({ ...p, [k]: n }));
  const r = useMemo(() => calcular(v), [v]);

  const valores = { C: r.C, I: r.I, G: r.G, XN: r.XN };
  /* La DA de pantalla: lo que suman los cuatro rótulos tal y como se ven. */
  const daMostrada = COMPONENTES.reduce((s, c) => s + enMillones(valores[c.id]), 0);
  /* El tope de la cámara: holgado, para que subir un dial tenga recorrido. */
  const tope = 12_000_000;

  const color = Object.fromEntries(COMPONENTES.map((c) => [c.id, c.color]));

  return (
    <div className="fae-cz-entrar">
      <style>{CSS_CORAZON}</style>

      {/* ─────────────────────── la cámara ─────────────────────── */}
      <Camaraseccion rotulo="LA CÁMARA CENTRAL" titulo="Aquí se juntan las cuatro" style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.66)", margin: "0 0 14px" }}>
          El ancho de cada banda es cuánto aporta ese componente. Las cuatro juntas son la Demanda
          Agregada: <strong style={{ color: FAE.text }}>una suma</strong>, no una intensidad. El latido solo
          dice que el sistema está vivo — no mide nada.
        </p>

        <Camara valores={valores} maximo={tope} />

        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.45)" }}>
            DA
          </span>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {/*
              * La DA que se enseña es la suma de los cuatro rótulos de abajo.
              * Ver por qué en circulatorio.jsx, junto a pesosM().
              */}
            <span data-prueba="da-titular">{pesosM(daMostrada)}</span>
          </span>
          <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.5)" }}>
            = C {pesos(r.C)} + I {pesos(r.I)} + G {pesos(r.G)} + XN {pesos(r.XN)}
          </span>
        </div>
      </Camaraseccion>

      {/* ─────────────────────── arteria de consumo ─────────────────────── */}
      <Camaraseccion rotulo="ARTERIA 1 · LA COMPLEJA" titulo="Consumo (C)" acento={color.C} style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 12px" }}>
          C̄ entra derecho a la cámara. Lo demás pasa antes por una cámara intermedia —la renta
          disponible— y por dos válvulas.
        </p>

        <div className="fae-cz-cols">
          <div>
            <Control etiqueta="Consumo autónomo (C̄)" hint="vaso" valor={v.autonomo} min={0} max={2_000_000} paso={50_000} formato={pesos} acento={color.C} onChange={set("autonomo")} />
            <Control etiqueta="Renta (Y)" hint="vaso" valor={v.Y} min={1_000_000} max={9_000_000} paso={100_000} formato={pesos} acento={color.C} onChange={set("Y")} />
            <Control etiqueta="Transferencias (TR)" hint="vaso" valor={v.TR} min={0} max={2_000_000} paso={50_000} formato={pesos} acento={color.C} onChange={set("TR")} />
            <Control etiqueta="Tasa impositiva (t)" hint="válvula · desvía" valor={v.t} min={0} max={0.4} paso={0.01} formato={(n) => `${(n * 100).toFixed(0)}%`} acento={FAE.coral} onChange={set("t")} />
            <Control etiqueta="Propensión Marginal a Consumir (c)" hint="válvula · reparte" valor={v.c} min={0} max={1} paso={0.05} formato={(n) => n.toFixed(2)} acento={FAE.coral} onChange={set("c")} />
          </div>

          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginBottom: "12px" }}>
              <Vaso etiqueta="C̄" sub="entra derecho" color={color.C} />
              <Vaso etiqueta="Y" sub="a la cámara intermedia" color={color.C} />
              <Vaso etiqueta="TR" sub="suma ahí también" color={color.C} />
              <Valvula etiqueta="t" sub="saca T = t×Y" />
              <Valvula etiqueta="c" sub="reparte lo que pasa" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: "10px 14px" }}>
              <Cifra rotulo="IMPUESTOS (T)" valor={pesos(r.T)} color={FAE.coral} nota="drenaje, antes de seguir" />
              <Cifra rotulo="RENTA DISPONIBLE" valor={pesos(r.disponible)} nota="Y + TR − T" />
              <Cifra rotulo="PASA LA VÁLVULA" valor={pesos(r.consumoInducido)} color={color.C} nota="c × renta disponible" />
              {/*
                * El vaso lateral del ahorro. Es la corrección del malentendido
                * más común: lo que no pasa la válvula NO se esfuma.
                */}
              <Cifra rotulo="AHORRO" valor={pesos(r.ahorro)} color={FAE.node} nota="lo que no pasa, y no desaparece" />
            </div>

            <div style={{ marginTop: "12px" }}>
              <Arteria color={color.C} caudal={r.C} maximo={MAX_ARTERIA} etiqueta={`C = ${pesos(r.C)}`}>
                <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(248,249,250,0.5)" }}>C̄ + c × renta disponible</p>
              </Arteria>
            </div>
          </div>
        </div>
      </Camaraseccion>

      {/* ─────────────────────── arteria de inversión ─────────────────────── */}
      <Camaraseccion rotulo="ARTERIA 2" titulo="Inversión (I)" acento={color.I} style={{ marginBottom: "14px" }}>
        <div className="fae-cz-cols">
          <div>
            <Control etiqueta="Inversión autónoma (Ī)" hint="vaso" valor={v.inversionAut} min={0} max={4_000_000} paso={100_000} formato={pesos} acento={color.I} onChange={set("inversionAut")} />
            <Control etiqueta="Tasa de interés (i)" hint="entrada" valor={v.i} min={0} max={20} paso={0.5} formato={(n) => `${n} pp`} acento={color.I} onChange={set("i")} />
            <Control etiqueta="Elasticidad interés (b)" hint="válvula · multiplica y resta" valor={v.b} min={0} max={150_000} paso={5_000} formato={(n) => `$${(n / 1000).toFixed(0)}k / pp`} acento={FAE.coral} onChange={set("b")} />
          </div>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginBottom: "12px" }}>
              <Vaso etiqueta="Ī" sub="entra derecho" color={color.I} />
              <Valvula etiqueta="b" sub="multiplica la tasa" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: "10px 14px" }}>
              <Cifra rotulo="LA VÁLVULA PRODUCE" valor={pesos(r.bi)} color={FAE.coral} nota="b × i" />
              {/* Que se RESTA, y por eso se escribe con el signo delante. */}
              <Cifra rotulo="Y SE RESTA" valor={`− ${pesos(r.bi)}`} color={FAE.coral} nota="no suma: descuenta" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <Arteria color={color.I} caudal={r.I} maximo={MAX_ARTERIA} etiqueta={`I = ${pesos(r.I)}`}>
                <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(248,249,250,0.5)" }}>Ī − b × i</p>
              </Arteria>
            </div>
          </div>
        </div>
      </Camaraseccion>

      {/* ─────────────────── gasto público y exportaciones ─────────────────── */}
      <div className="fae-cz-cols" style={{ gap: "14px" }}>
        <Camaraseccion rotulo="ARTERIA 3" titulo="Gasto público (Ḡ)" acento={color.G}>
          <Control etiqueta="Gasto público (Ḡ)" hint="vaso" valor={v.G} min={0} max={5_000_000} paso={100_000} formato={pesos} acento={color.G} onChange={set("G")} />
          <div style={{ marginTop: "6px", marginBottom: "10px" }}>
            <Vaso etiqueta="Ḡ" sub="un solo vaso, sin válvulas" color={color.G} />
          </div>
          <Arteria color={color.G} caudal={r.G} maximo={MAX_ARTERIA} etiqueta={`G = ${pesos(r.G)}`} />
          <p style={{ margin: "10px 0 0", fontSize: "11.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.45)" }}>
            Simple a propósito: el modelo no lo desglosa. Añadirle piezas para que quede simétrico con
            las otras arterias sería inventarse una estructura que no existe.
          </p>
        </Camaraseccion>

        <Camaraseccion rotulo="ARTERIA 4" titulo="Exportaciones netas (XN)" acento={color.XN}>
          <Control etiqueta="Tipo de cambio (tc)" hint="vaso" valor={v.tc} min={3000} max={5500} paso={50} formato={(n) => `$${n.toLocaleString("es-CO")} / USD`} acento={color.XN} onChange={set("tc")} />
          <div style={{ marginTop: "6px", marginBottom: "10px" }}>
            <Vaso etiqueta="tc" sub="más alto, más caudal" color={color.XN} />
          </div>
          <Arteria color={color.XN} caudal={r.XN} maximo={MAX_ARTERIA} etiqueta={`XN = ${pesos(r.XN)}`} />
          <p style={{ margin: "10px 0 0", fontSize: "11.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.45)" }}>
            {/* La regla de no invención, en pantalla y no escondida en un comentario. */}
            La forma exacta de f(tc) no está en el modelo del profesor: aquí se usa una curva suave que solo
            respeta la dirección conocida. Es una aproximación, no la fórmula.
            {r.XN < 0 && " Ahora mismo XN es negativa: se importa más de lo que se exporta, y por eso resta."}
          </p>
        </Camaraseccion>
      </div>

      <button
        type="button"
        onClick={() => setV(INICIAL)}
        style={{
          marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px",
          fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
          padding: "9px 16px", borderRadius: "999px", cursor: "pointer",
          background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)",
        }}
      >
        <RotateCcw size={14} /> Volver a los valores de partida
      </button>

      <style>{`
        .fae-cz-cols { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 20px; }
        @media (max-width: 760px) { .fae-cz-cols { grid-template-columns: 1fr; gap: 14px; } }
      `}</style>
    </div>
  );
}
