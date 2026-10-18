import { forwardRef, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TANQUE DE LA PROVISIÓN (lote 7, P2 de Mai §3.1; Célula B).
 *
 * El saldo de la provisión como el nivel de un tanque
 * («bathtub dynamics»): sube con el HABER, baja con el DEBE y, si el castigo
 * es mayor, rompe la línea del cero. Lo usan la capa 2 de T6 · A3 (con los
 * gestos), su capa 3 (las marcas de las opciones van como `children`) y, si
 * Erwin acepta, la capa 4 en tamaño mínimo (`alto`).
 *
 * Escala: de −40.000 a +200.000 en `alto` px (160 en la capa 2):
 *   y(v) = alto · (200.000 − v) / 240.000; el cero, en y = 133,33.
 *
 * Capas, de abajo arriba:
 *   · el relleno: ámbar al 38 % con borde superior ámbar de 2 px (el saldo en
 *     el HABER). Crece con transform: scaleY desde el cero;
 *   · el faltante: rayado a 45° de teal al 55 % (franjas de 3 y 4 px) con
 *     borde inferior teal de 2 px (el saldo en el DEBE). Crece hacia abajo.
 *     Nunca coral: el faltante no es un error;
 *   · la línea del cero (1 px #B8C4D4, con «0»);
 *   · la línea del análisis (2 px discontinua #F8F9FA, «Análisis» encima y,
 *     con `analisis: "cifra"`, su cifra);
 *   · los dos segmentos (1,5 px #F8F9FA, discontinuos o continuos) con lo que
 *     faltó y lo que pide el análisis;
 *   · la pista de soltar (contorno de 2 px discontinuo, ArrowDown y
 *     su rótulo);
 *   · el asa (paso del ajuste): control de 44 de alto a todo el ancho, con una
 *     barra de 6 px. role="slider"; arriba, Fin o Enter la llevan a la línea;
 *     al soltarla a menos de 13.400 de la línea encaja; si no, vuelve abajo.
 *
 * Movimiento (Mai §7; curva cubic-bezier(.3,.9,.4,1), solo transform y
 * opacity): llenado en 600 ms; «mira esto» (de un saldo positivo a uno en
 * contra): el nivel baja al cero en 300 ms, se queda 150 ms y el faltante
 * entra en 250 ms (700 ms en total); de vuelta, al revés. Con movimiento
 * reducido, cada estado aparece de una vez. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/*
 * LOTE 9 · LAS CIFRAS EN LA PILA MONOESPACIADA (prompt maestro §5.3), en todo
 * Aprender de B: las cifras de cuentas, asientos y saldos van en MONO con
 * tabular-nums; Sora queda para las cifras de título o de resultado.
 * `ConCifras` deja el texto igual y envuelve cada cifra («$148.800»,
 * «− $148.800») en la pila monoespaciada, también dentro de una frase corta.
 */
export const CIFRA_MONO = { fontFamily: MONO, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const CIFRAS = /((?:[−-]\s?)?\$\s?\d[\d.]*(?:,\d+)?)/g;
export function ConCifras({ texto }) {
  if (typeof texto !== "string") return texto ?? null;
  const partes = texto.split(CIFRAS);
  if (partes.length === 1) return texto;
  return partes.map((p, k) => (k % 2 ? <span key={k} data-cifra style={CIFRA_MONO}>{p}</span> : p));
}
const INTER = "Inter, sans-serif";
const BLANCO = FAE.text;
const NEUTRO = "#B8C4D4";
const SECUNDARIO = "#A8B6C8";
export const HUNDIDO = { background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" };
export const RELLENO_AMBAR = "rgba(233,196,106,0.38)";
export const RAYADO_TEAL = "repeating-linear-gradient(45deg, rgba(42,157,143,0.55) 0 3px, transparent 3px 7px)";
/* Lote 27 (Shoko): el faltante va en el neutro #B8C4D4, como «castigada» en b5-t6-a3; el teal es solo DEBE. */
export const RAYADO_NEUTRO = "repeating-linear-gradient(45deg, rgba(184,196,212,0.55) 0 3px, transparent 3px 7px)";

const MAXIMO = 200000;
const MINIMO = -40000;
const RANGO = MAXIMO - MINIMO;
/* Encaja si se suelta a menos de esto de la línea (Mai §5, paso 12). */
export const ENCAJE = 13400;

export const escalaTanque = (alto) => (v) => (alto * (MAXIMO - v)) / RANGO;

/* El saldo para el lector: «$148.800», «le faltan $31.200» o «$0». */
export function saldoLector(v, textos) {
  if (v > 0) return pesos(v);
  if (v < 0) return `${textos.leFaltanLector} ${pesos(-v)}`;
  return textos.pesosCero;
}

/* Las transiciones del nivel, según de dónde viene (Mai §7). */
function tiempos(antes, ahora, { reducido, arrastrando, vuelve }) {
  if (reducido || arrastrando || antes === ahora) return { relleno: "none", faltante: "none" };
  if (vuelve) return { relleno: `transform 200ms ${CURVA}`, faltante: `transform 200ms ${CURVA}` };
  if (antes > 0 && ahora < 0) return { relleno: `transform 300ms ${CURVA}`, faltante: `transform 250ms ${CURVA} 450ms` };
  if (antes < 0 && ahora > 0) return { relleno: `transform 600ms ${CURVA} 250ms`, faltante: `transform 250ms ${CURVA}` };
  return { relleno: `transform 600ms ${CURVA}`, faltante: `transform 600ms ${CURVA}` };
}

const TanqueProvision = forwardRef(function TanqueProvision({
  nivel, textos, alto = 160, ancho = 84, analisis = null, segmentos = null, soltar = false, asa = null,
  resaltado = false, reducido = false, conCero = true, children = null, atributos = {},
}, ref) {
  const y = escalaTanque(alto);
  const cero = y(0);
  /* El asa: el valor mientras se arrastra, y si vuelve abajo (200 ms). */
  const [arrastre, setArrastre] = useState(null);
  const [vuelve, setVuelve] = useState(false);
  const visto = arrastre ?? nivel;
  const antes = useRef(visto);
  const t = tiempos(antes.current, visto, { reducido, arrastrando: arrastre !== null, vuelve });
  useEffect(() => { antes.current = visto; });
  useEffect(() => {
    if (!vuelve) return undefined;
    const id = setTimeout(() => setVuelve(false), 220);
    return () => clearTimeout(id);
  }, [vuelve]);

  const arriba = cero; // del cero a la cima: 200.000
  const abajo = alto - cero; // del cero al fondo: 40.000
  const hRelleno = (Math.max(0, visto) / MAXIMO) * arriba;
  const hFaltante = (Math.max(0, -visto) / -MINIMO) * abajo;
  const lineaAnalisis = analisis ? y(153400) : null;

  /* ═══ El asa (paso del ajuste) ═══ */
  const caja = useRef(null);
  const valorEn = (clientY) => {
    const r = caja.current.getBoundingClientRect();
    const v = MAXIMO - ((clientY - r.top) / alto) * RANGO;
    return Math.round(Math.min(asa.hasta, Math.max(asa.desde, v)));
  };
  const soltarAsa = (v) => {
    setArrastre(null);
    if (Math.abs(v - asa.hasta) < ENCAJE) asa.alEncajar();
    else setVuelve(true);
  };
  const propsAsa = asa ? {
    role: "slider", tabIndex: 0, "aria-label": asa.nombre, "aria-valuemin": asa.desde, "aria-valuemax": asa.hasta,
    "aria-valuenow": visto, "aria-orientation": "vertical",
    onKeyDown: (e) => {
      if (["ArrowUp", "End", "Enter", "PageUp"].includes(e.key)) { e.preventDefault(); asa.alEncajar(); }
    },
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setArrastre(valorEn(e.clientY));
    },
    onPointerMove: (e) => { if (arrastre !== null) setArrastre(valorEn(e.clientY)); },
    onPointerUp: (e) => { if (arrastre !== null) soltarAsa(valorEn(e.clientY)); },
    onPointerCancel: () => { if (arrastre !== null) { setArrastre(null); setVuelve(true); } },
  } : null;

  const linea = (top, estilo) => ({ position: "absolute", left: 0, right: 0, top: `${top}px`, pointerEvents: "none", ...estilo });
  return (
    <div ref={ref} data-tanque {...atributos} data-nivel={visto} style={{ position: "relative", width: `${ancho}px`, height: `${alto}px`, flex: "none" }}>
      {/* El dibujo, con su nombre literal para el lector (§8). */}
      <div ref={caja} role="img" aria-label={`${textos.nombreTanque}: ${saldoLector(nivel, textos)}`} data-dibujo-tanque style={{
        position: "absolute", inset: 0, borderRadius: "10px", overflow: "hidden", boxSizing: "border-box", ...HUNDIDO,
      }}>
        {/* El relleno (HABER) y su borde superior. */}
        <span data-relleno style={{
          ...linea(0, { height: `${arriba}px` }), background: RELLENO_AMBAR, transformOrigin: "50% 100%",
          transform: `scaleY(${hRelleno / arriba})`, transition: t.relleno,
        }} />
        <span data-borde-relleno style={{
          ...linea(cero - 1, { height: "2px" }), background: FAE.ambar, opacity: visto > 0 ? 1 : 0,
          transform: `translateY(${-hRelleno}px)`, transition: t.relleno === "none" ? "none" : `${t.relleno}, opacity 120ms linear`,
        }} />
        {/* El faltante, hacia abajo desde el cero: rayado neutro (lote 27). */}
        <span data-faltante style={{
          ...linea(cero, { height: `${abajo}px` }), backgroundImage: RAYADO_NEUTRO, transformOrigin: "50% 0",
          transform: `scaleY(${hFaltante / abajo})`, transition: t.faltante,
        }} />
        <span data-borde-faltante style={{
          ...linea(cero - 1, { height: "2px" }), background: NEUTRO, opacity: visto < 0 ? 1 : 0,
          transform: `translateY(${hFaltante}px)`, transition: t.faltante === "none" ? "none" : `${t.faltante}, opacity 120ms linear`,
        }} />
        {/* La línea del cero. */}
        <span data-linea-cero style={linea(cero - 0.5, { height: "1px", background: NEUTRO })} />
        {/* El «0»; con los segmentos, el de lo que faltó ya marca el cero. */}
        {conCero && !segmentos && (
          <span aria-hidden="true" style={{ position: "absolute", right: "5px", top: `${cero - 16}px`, fontFamily: INTER, fontSize: "12px", lineHeight: "14px", color: SECUNDARIO, pointerEvents: "none" }}>
            {textos.cero}
          </span>
        )}
        {/* La línea del análisis. */}
        {lineaAnalisis !== null && (
          <>
            <span data-linea-analisis={analisis} style={linea(lineaAnalisis - 1, { height: 0, borderTop: `2px dashed ${BLANCO}` })} />
            <span data-rotulo-analisis style={{
              position: "absolute", left: "5px", right: "5px", top: `${lineaAnalisis - 3}px`, transform: "translateY(-100%)",
              fontFamily: INTER, fontSize: "12px", lineHeight: "14px", color: BLANCO, pointerEvents: "none",
            }}>
              <span style={{ display: "block", fontWeight: 600 }}>{textos.analisis}</span>
              {analisis === "cifra" && <span data-cifra-analisis style={{ display: "block", fontFamily: MONO, fontWeight: 700, fontSize: "12px" }}>{textos.pide}</span>}
            </span>
          </>
        )}
        {/* Los dos segmentos: lo que faltó y lo que pide el análisis. */}
        {segmentos && [
          { id: "faltante", desde: cero, hasta: y(-31200), texto: textos.faltante },
          { id: "analisis", desde: y(153400), hasta: cero, texto: textos.pide },
        ].map((s) => (
          <span key={s.id} data-segmento={s.id} data-trazo={segmentos} style={{
            position: "absolute", left: "6px", right: "6px", top: `${s.desde}px`, height: `${s.hasta - s.desde}px`, boxSizing: "border-box",
            border: `1.5px ${segmentos === "continuos" ? "solid" : "dashed"} ${BLANCO}`, borderRadius: "4px",
            display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none",
          }}>
            <span style={{ padding: "0 3px", borderRadius: "3px", background: "rgba(14,27,46,0.88)", fontFamily: MONO, fontSize: "12px", fontWeight: 700, lineHeight: "14px", color: BLANCO, whiteSpace: "nowrap" }}>{s.texto}</span>
          </span>
        ))}
        {/* La pista de soltar. */}
        {soltar && (
          <span data-pista-soltar style={{
            /* Bajo la línea del análisis si está, para no tapar su rótulo. */
            position: "absolute", left: "5px", right: "5px", top: `${lineaAnalisis !== null ? lineaAnalisis + 6 : 8}px`, padding: "4px 2px", borderRadius: "6px", background: "rgba(14,27,46,0.9)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", pointerEvents: "none",
            fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "14px", color: BLANCO, textAlign: "center",
          }}>
            <ArrowDown aria-hidden="true" focusable="false" size={16} strokeWidth={2} color={BLANCO} />
            <span>{textos.sueltaAqui}</span>
          </span>
        )}
        {children}
      </div>
      {/* El contorno: resaltado, 2 px #F8F9FA; destino de un gesto, 2 px discontinuo. */}
      {(resaltado || soltar) && (
        <span data-contorno-tanque={soltar ? "destino" : "resaltado"} aria-hidden="true" style={{
          position: "absolute", inset: 0, borderRadius: "10px", border: `2px ${soltar ? "dashed" : "solid"} ${BLANCO}`, pointerEvents: "none",
        }} />
      )}
      {/* El asa: a la altura del nivel, por encima del dibujo. */}
      {asa && (
        <div data-asa {...propsAsa} className="b5t-foco" style={{
          position: "absolute", left: 0, right: 0, top: 0, height: "44px", cursor: "ns-resize", touchAction: "none",
          transform: `translateY(${y(visto) - 22}px)`,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          transition: arrastre === null && !reducido ? `transform ${vuelve ? 200 : 600}ms ${CURVA}` : "none",
        }}>
          <span aria-hidden="true" style={{ width: "60%", height: "6px", borderRadius: "3px", background: BLANCO, boxShadow: "0 0 0 2px rgba(14,27,46,0.9)" }} />
        </div>
      )}
    </div>
  );
});

export default TanqueProvision;
