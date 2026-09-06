import { useState } from "react";
import { X, TriangleAlert } from "lucide-react";
import { FAE } from "../../../theme.js";
import { FALLAS, FALLA_CUALITATIVA } from "../../../data/politicaEconomica.js";
import { useEnPantalla } from "../../../utils/enPantalla.js";
import { CSS_SALA, Panel, Piloto, Grabado, VERDE, ROJO, AMBAR } from "./marco.jsx";

/*
 * PIEZA 2 — "El tablero de fallas".
 *
 * Material teórico, no juego: exploración libre, sin preguntas, sin condición
 * de término y sin FP. Se puede tocar cualquier esfera, en cualquier orden y
 * las veces que se quiera.
 *
 * QUÉ TIENE QUE PASARLE AL ESTUDIANTE. Antes de leer un solo dígito tiene que
 * VER que ocho agujas están fuera de sitio y cuánto les falta para llegar a la
 * zona buena. Ese hueco percibido es exactamente el lugar donde entra la
 * política económica. Si esto se leyera como una tabla con iconos, la pieza
 * habría fracasado: por eso son esferas con aguja y no filas.
 *
 * ───────────────── LA HONESTIDAD DE LAS CIFRAS ─────────────────
 *
 * De los ocho problemas, solo tres traen meta. Los otros se dibujan tal cual
 * son y la interfaz aguanta el hueco sin rellenarlo:
 *
 *   Con meta ............ crecimiento, inflación, déficit fiscal
 *   Sin meta ............ desempleo, déficit exterior, asignación de recursos
 *                        → aguja real, y NINGUNA marca verde en el arco
 *   Meta direccional .... concentración de la renta ("más bajo")
 *                        → una flecha hacia el extremo bajo, sin punto fijo
 *   Sin cifra alguna .... impactos ambientales
 *                        → no es una esfera: es una banda de alerta
 *
 * LOS NÚMEROS DE LA ESCALA NO SE ESCRIBEN NUNCA. El arco no lleva eje ni
 * marcas numéricas, porque el mínimo y el máximo de dibujo son una decisión de
 * este archivo y no un dato del profesor. Los únicos números en pantalla son
 * los suyos, y salen en texto.
 *
 * EL COLOR NO VA SOLO. Rojo y verde cargan significado aquí, así que cada
 * esfera lleva además la palabra escrita del estado, la posición de la aguja
 * y la de la marca. Quien no distinga los dos colores lee lo mismo.
 */

/* Geometría del arco. Un semicírculo abierto, como un manómetro. */
const VB = { w: 132, h: 84 };
const CENTRO = { x: 66, y: 72 };
const RADIO = 52;
/* De 180° (izquierda) a 0° (derecha). */
const ANG_INI = Math.PI;
const ANG_FIN = 0;

const CSS = `
${CSS_SALA}
@keyframes fae-tf-aguja { 0%, 100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
.fae-tf-aguja { animation: fae-tf-aguja 3.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-tf-aguja { animation: none !important; } }
`;

/* Proporción 0..1 de un valor dentro de su escala de dibujo. */
function proporcion(valor, escala) {
  const p = (valor - escala.min) / (escala.max - escala.min);
  return Math.max(0, Math.min(1, p));
}

/* Punto del arco para una proporción. */
function punto(p, radio = RADIO) {
  const ang = ANG_INI + (ANG_FIN - ANG_INI) * p;
  return { x: CENTRO.x + radio * Math.cos(ang), y: CENTRO.y - radio * Math.sin(ang) };
}

/* Trozo de arco entre dos proporciones, para pintar las zonas. */
function arco(desde, hasta, radio = RADIO) {
  const a = punto(desde, radio);
  const b = punto(hasta, radio);
  const largo = Math.abs(hasta - desde) > 0.5 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radio} ${radio} 0 ${largo} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/* ------------------------------- una esfera ------------------------------- */

function Esfera({ falla, abierta, onAbrir, animar }) {
  const pActual = proporcion(falla.actual.valor, falla.escala);
  const tieneMetaPunto = falla.meta && typeof falla.meta.valor === "number";
  const pMeta = tieneMetaPunto ? proporcion(falla.meta.valor, falla.escala) : null;

  /*
   * La zona buena va de la meta hacia el lado deseable. Sin meta numérica no
   * se dibuja zona: no hay dónde ponerla sin inventársela.
   */
  const zonaBuena = tieneMetaPunto
    ? falla.mejorEs === "bajo" ? [0, pMeta] : [pMeta, 1]
    : null;

  const aguja = punto(pActual, RADIO - 6);
  const estado = tieneMetaPunto
    ? "Fuera de meta"
    : falla.meta?.direccion
      ? "Meta: más bajo"
      : "Sin meta definida";
  const colorEstado = tieneMetaPunto ? ROJO : AMBAR;

  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-expanded={abierta}
      style={{
        textAlign: "left", cursor: "pointer", padding: "12px 12px 10px",
        borderRadius: "16px",
        background: abierta ? "rgba(231,111,81,0.10)" : "rgba(248,249,250,0.035)",
        border: `1px solid ${abierta ? ROJO : "rgba(248,249,250,0.13)"}`,
        color: FAE.text, fontFamily: "Inter, sans-serif",
        display: "flex", flexDirection: "column", gap: "8px",
      }}
    >
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label={`${falla.nombre}: actual ${falla.actual.texto}${
          falla.meta?.texto ? `, meta ${falla.meta.texto}` : ", sin meta definida"
        }`}
      >
        {/* El arco de fondo. Sin eje ni marcas: la escala no es un dato. */}
        <path d={arco(0, 1)} fill="none" stroke="rgba(248,249,250,0.13)" strokeWidth="9" strokeLinecap="round" />

        {/* La zona buena, si la hay. */}
        {zonaBuena && (
          <path d={arco(zonaBuena[0], zonaBuena[1])} fill="none" stroke={VERDE} strokeWidth="9" strokeLinecap="round" opacity="0.55" />
        )}

        {/*
          Meta direccional. El profesor dice "más bajo" y no da un valor, así
          que aquí NO puede haber ni zona ni marca: las dos tendrían un borde, y
          un borde es un umbral que nadie fijó.
          Se dibuja un degradado que se desvanece hacia el extremo deseable —sin
          canto en ningún punto— y una flecha que señala la dirección.
        */}
        {!tieneMetaPunto && falla.meta?.direccion && (
          <>
            <defs>
              <linearGradient id={`tf-dir-${falla.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={VERDE} stopOpacity="0.5" />
                <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
              </linearGradient>
              <marker id={`tf-punta-${falla.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" fill={VERDE} />
              </marker>
            </defs>
            <path
              d={arco(0, 0.5)}
              fill="none"
              stroke={`url(#tf-dir-${falla.id})`}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={`M ${punto(0.34, RADIO).x} ${punto(0.34, RADIO).y} L ${punto(0.14, RADIO).x} ${punto(0.14, RADIO).y}`}
              stroke={VERDE} strokeWidth="2.4" strokeLinecap="round"
              markerEnd={`url(#tf-punta-${falla.id})`} opacity="0.9"
            />
          </>
        )}

        {/* La marca de la meta, cuando es un valor. Triángulo, no solo color. */}
        {tieneMetaPunto && (
          <g>
            <path
              d={`M ${punto(pMeta, RADIO + 9).x} ${punto(pMeta, RADIO + 9).y}
                  l -4 -6 l 8 0 Z`}
              fill={VERDE}
              transform={`rotate(${180 - pMeta * 180} ${punto(pMeta, RADIO + 9).x} ${punto(pMeta, RADIO + 9).y})`}
            />
          </g>
        )}

        {/* La aguja. Late muy poco: un instrumento vivo, no un adorno. */}
        <g className={animar ? "fae-tf-aguja" : undefined} style={{ transformOrigin: `${CENTRO.x}px ${CENTRO.y}px` }}>
          <line
            x1={CENTRO.x} y1={CENTRO.y} x2={aguja.x} y2={aguja.y}
            stroke={FAE.text} strokeWidth="2.6" strokeLinecap="round"
          />
          <circle cx={CENTRO.x} cy={CENTRO.y} r="4.5" fill={FAE.text} />
          <circle cx={CENTRO.x} cy={CENTRO.y} r="2" fill={FAE.bg} />
        </g>
      </svg>

      <div>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, lineHeight: 1.3, color: FAE.text, margin: "0 0 5px" }}>
          {falla.nombre}
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: colorEstado, margin: "0 0 5px", fontVariantNumeric: "tabular-nums" }}>
          {falla.actual.texto}
        </p>
        <Piloto color={colorEstado} texto={estado} late={animar && tieneMetaPunto} tamano={7} />
      </div>
    </button>
  );
}

/* ------------------------------ la ficha ------------------------------ */

function Ficha({ falla, onCerrar }) {
  const tieneMetaPunto = falla.meta && typeof falla.meta.valor === "number";

  return (
    <div
      className="fae-sc-entrar"
      style={{
        borderRadius: "18px", background: "rgba(10,20,34,0.72)",
        border: `1px solid ${ROJO}66`, padding: "clamp(15px, 2.2vw, 20px)",
        marginTop: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
        <div>
          <Grabado color={ROJO}>FICHA DEL PROBLEMA</Grabado>
          <h4 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.4vw, 19px)", color: FAE.text, margin: "6px 0 0", lineHeight: 1.25 }}>
            {falla.nombre}
          </h4>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar la ficha"
          style={{
            display: "grid", placeItems: "center", width: "30px", height: "30px", flexShrink: 0,
            borderRadius: "999px", cursor: "pointer", background: "rgba(248,249,250,0.06)",
            border: "1px solid rgba(248,249,250,0.16)", color: "rgba(248,249,250,0.7)",
          }}
        >
          <X size={15} />
        </button>
      </div>

      <p style={{ fontSize: "14px", lineHeight: 1.62, color: "rgba(248,249,250,0.78)", margin: "0 0 16px" }}>
        {falla.definicion}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ flex: "1 1 150px", padding: "11px 13px", borderRadius: "13px", background: "rgba(231,111,81,0.10)", border: `1px solid ${ROJO}55` }}>
          <Grabado color={ROJO}>DONDE ESTÁ HOY</Grabado>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 700, color: FAE.text, margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
            {falla.actual.texto}
          </p>
          {falla.actual.nota && (
            <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.55)", margin: "4px 0 0", lineHeight: 1.4 }}>
              {falla.actual.nota}
            </p>
          )}
        </div>

        <div
          style={{
            flex: "1 1 150px", padding: "11px 13px", borderRadius: "13px",
            background: tieneMetaPunto ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
            border: `1px ${tieneMetaPunto ? "solid" : "dashed"} ${tieneMetaPunto ? `${VERDE}55` : "rgba(248,249,250,0.18)"}`,
          }}
        >
          <Grabado color={tieneMetaPunto ? VERDE : "rgba(248,249,250,0.42)"}>DÓNDE DEBERÍA ESTAR</Grabado>
          {falla.meta ? (
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 700, color: FAE.text, margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
              {falla.meta.texto}
            </p>
          ) : (
            /*
             * El hueco se dice, no se rellena. Es información sobre el estado
             * del material, no una carencia de la interfaz.
             */
            <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)", margin: "6px 0 0" }}>
              El material no fija una meta para este indicador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ el tablero ------------------------------ */

export default function TableroDeFallas() {
  const [abierta, setAbierta] = useState(null);
  const [ref, enPantalla] = useEnPantalla();

  const falla = FALLAS.find((f) => f.id === abierta);
  const ambientalAbierta = abierta === FALLA_CUALITATIVA.id;

  return (
    <div ref={ref}>
      <style>{CSS}</style>

      <Panel
        rotulo="PANEL 1 · DIAGNÓSTICO"
        titulo="Ocho problemas reales de la economía colombiana"
        acento={ROJO}
        style={{ marginBottom: "16px" }}
      >
        <p style={{ fontSize: "14px", lineHeight: 1.62, color: "rgba(248,249,250,0.7)", margin: "0 0 4px" }}>
          Ninguna aguja está donde debería. Toca cualquier esfera para ver de qué problema se trata, dónde
          está hoy y —cuando el dato existe— dónde debería estar.
        </p>
        <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.45)", margin: "10px 0 0" }}>
          Las esferas no llevan números en el arco a propósito: lo que se mide aquí es la distancia entre
          la aguja y la meta, y esa se ve. Las cifras exactas están en cada ficha.
        </p>
      </Panel>

      {/*
        La rejilla. En móvil caben dos esferas por fila —minmax de 140— que es
        el mínimo en que la aguja sigue leyéndose; no es un grid de escritorio
        apretado.
      */}
      <div
        className="fae-sc-rejilla"
        style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "10px", padding: "12px", borderRadius: "20px",
          background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.1)",
        }}
      >
        {FALLAS.map((f) => (
          <Esfera
            key={f.id}
            falla={f}
            abierta={abierta === f.id}
            animar={enPantalla}
            onAbrir={() => setAbierta(abierta === f.id ? null : f.id)}
          />
        ))}
      </div>

      {falla && <Ficha falla={falla} onCerrar={() => setAbierta(null)} />}

      {/* ------------------- el octavo, que no es una esfera ------------------- */}
      <button
        type="button"
        onClick={() => setAbierta(ambientalAbierta ? null : FALLA_CUALITATIVA.id)}
        aria-expanded={ambientalAbierta}
        style={{
          width: "100%", textAlign: "left", cursor: "pointer", marginTop: "12px",
          display: "flex", alignItems: "center", gap: "13px",
          padding: "14px 16px", borderRadius: "16px",
          background: ambientalAbierta ? "rgba(233,196,106,0.12)" : "rgba(233,196,106,0.06)",
          /* Franjas de peligro: pertenece al tablero y declara que es otra cosa. */
          borderLeft: `5px solid ${AMBAR}`,
          border: `1px solid ${AMBAR}55`,
          borderLeftWidth: "5px",
          color: FAE.text, fontFamily: "Inter, sans-serif",
        }}
      >
        <TriangleAlert size={22} color={AMBAR} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, marginBottom: "3px" }}>
            {FALLA_CUALITATIVA.nombre}
          </span>
          <span style={{ display: "block", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", lineHeight: 1.45 }}>
            Sin cifra ni meta en el material: es una alerta, no una medición.
          </span>
        </span>
        <Piloto color={AMBAR} texto="Cualitativo" late={enPantalla} tamano={7} />
      </button>

      {ambientalAbierta && (
        <div
          className="fae-sc-entrar"
          style={{
            borderRadius: "18px", background: "rgba(10,20,34,0.72)",
            border: `1px solid ${AMBAR}66`, padding: "clamp(15px, 2.2vw, 20px)", marginTop: "12px",
          }}
        >
          <Grabado color={AMBAR}>ALERTA CUALITATIVA</Grabado>
          <h4 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.4vw, 19px)", color: FAE.text, margin: "6px 0 10px", lineHeight: 1.25 }}>
            {FALLA_CUALITATIVA.nombre}
          </h4>
          <p style={{ fontSize: "14px", lineHeight: 1.62, color: "rgba(248,249,250,0.78)", margin: "0 0 14px" }}>
            {FALLA_CUALITATIVA.definicion}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {FALLA_CUALITATIVA.senales.map((s) => (
              <span
                key={s}
                style={{
                  padding: "7px 13px", borderRadius: "999px", fontSize: "13px",
                  background: "rgba(233,196,106,0.10)", border: `1px solid ${AMBAR}55`,
                  color: "rgba(248,249,250,0.85)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* El cierre: para qué sirve haber visto esto. */}
      <p style={{ fontSize: "14px", lineHeight: 1.65, color: "rgba(248,249,250,0.62)", margin: "18px 0 0" }}>
        Ese hueco entre donde está cada aguja y donde debería estar es el espacio en el que trabaja la
        política económica. Todo lo que viene después —los instrumentos, las ramas, las palancas— existe
        para intentar cerrarlo.
      </p>
    </div>
  );
}
