import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TITULOS_T5_A2, PARADA_T5_A2, FUSION_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import { T5_A2_JUNTO, crearEstadoTitulos, VENTAS_TITULOS, LOTES } from "../../../../contabilidad/t5Pieza2.js";
import { FAE } from "../../../../theme.js";
import MaquinaPegada from "../tema6/MaquinaPegada.jsx";
import { Ficha } from "../tema6/LaProvision.jsx";
import { MONO, HUNDIDO, RELLENO_AMBAR, RAYADO_TEAL, CURVA } from "../tema6/TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 2 · «MÍRELO FUNCIONAR» — LOS TÍTULOS DE SANTA PACHA
 * (lote 11, P2 de Mai, aprobada por Sakuta; mismo método que el tanque de
 * T6 · A3).
 *
 * El estudiante VE el efectivo convertirse en 20 lotes de títulos dentro de
 * la cuenta de las inversiones; mueve la fecha y entra el interés a Caja; desliza
 * para vender y los lotes salen; ve las dos barras, «Costaron» y «Recibió»,
 * separarse: la ganancia (ámbar, se acredita) o la pérdida (rayado teal, se
 * debita). Coral nunca. De arriba abajo:
 *   · la línea de fechas (tres puntos; la marca, `role="slider"`, en los
 *     pasos de fecha);
 *   · dos columnas (136px 1fr; la hoja pedía 144, pero a 320 la ficha de Bancos no cabía): Inversiones con su cuadrícula de 5 × 4 lotes
 *     y el riel de venta (`role="slider"`); a la derecha, la ficha «Bancos»
 *     y la cuenta Caja con su columna DEBE;
 *   · la comparación (alto reservado), con la escala propia de cada venta.
 * Los cinco gestos los lleva MaquinaPegada; todos tienen su vía por toque o
 * teclado. Todo se dibuja siempre en su sitio (la escena no salta). Cifras en
 * la pila monoespaciada. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = TITULOS_T5_A2;
const INTER = "Inter, sans-serif";
const SORA = "Sora, sans-serif";
const BLANCO = FAE.text;
const NEUTRO = "#B8C4D4";
const SECUNDARIO = "#A8B6C8";
const DEBE = "#3FA69A";
const REPOSO = "1px solid rgba(248,249,250,0.35)";
const CIFRA = { fontFamily: MONO, fontSize: "12.5px", fontWeight: 700, lineHeight: "16px", color: BLANCO, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
const PEQUENO = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO };
const ROTULO = { margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO };
const resalte = (si) => ({ boxShadow: si ? `0 0 0 2px ${BLANCO}` : "none" });
const futuro = (visible) => (visible ? {} : { "data-futuro": "" });
const ENCAJE = 0.08;

const TODOS = T5_A2_JUNTO.TODOS;
const SIN_PARTIR = { whiteSpace: "nowrap" };

/* Las cuentas del libro (base × tasa × fracción = interés) van enteras en el texto del paso. */
const CUENTA = /\d[\d.]* × \d+,\d+ × \d+\/\d+ = \$\d[\d.]*\d/;
export function pintarCuentas(texto) {
  const m = texto.match(CUENTA);
  if (!m) return texto;
  return (
    <>
      {texto.slice(0, m.index)}
      <span data-cuenta style={SIN_PARTIR}>{m[0]}</span>
      {texto.slice(m.index + m[0].length)}
    </>
  );
}

/* Arrastre horizontal sobre un riel: el valor en 0..1 mientras se arrastra; al soltar, encaja (`alEncajar`) o vuelve. */
function useRiel(riel, objetivo, alEncajar) {
  const [p, setP] = useState(null);
  const leer = (x) => { const r = riel.current.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
  return {
    p,
    props: {
      onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setP(leer(e.clientX)); },
      onPointerMove: (e) => { if (p !== null) setP(leer(e.clientX)); },
      onPointerUp: (e) => { if (p === null) return; const v = leer(e.clientX); setP(null); if (Math.abs(v - objetivo) < ENCAJE) alEncajar(); },
      onPointerCancel: () => setP(null),
      onKeyDown: (e) => { if (["ArrowRight", "End", "Enter"].includes(e.key)) { e.preventDefault(); alEncajar(); } },
    },
  };
}

function LineaFechas({ estado, refDe, r, hacer, reducido }) {
  const riel = useRef(null);
  const gesto = estado.gesto === "agosto" || estado.gesto === "noviembre";
  const desde = estado.hoy / 2;
  const { p, props } = useRiel(riel, Math.min(1, desde + 0.5), hacer);
  const visto = p ?? desde;
  return (
    <div ref={refDe("fechas")} data-elemento="fechas" data-resaltado={r.has("fechas") ? "si" : "no"} data-linea-fechas style={{ position: "relative", height: "58px", padding: "0 22px", borderRadius: "10px", overflow: "hidden", ...resalte(r.has("fechas")) }}>
      <div ref={riel} style={{ position: "absolute", left: "22px", right: "22px", top: "21px", height: "2px", background: NEUTRO }} />
      {/* Los puntos sobre el riel; los rótulos, en su fila: el primero a la izquierda y el último a la derecha (nada se corta). */}
      {T.fechas.map((f, k) => (
        <span key={f} data-punto-fecha={k} style={{ position: "absolute", top: "16px", left: `calc(22px + (100% - 44px) * ${k / 2})`, transform: "translateX(-50%)",
          width: "12px", height: "12px", borderRadius: "50%", boxSizing: "border-box", background: k === estado.hoy ? BLANCO : FAE.bg, border: `2px solid ${k <= estado.hoy ? BLANCO : NEUTRO}` }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: "34px", display: "flex", justifyContent: "space-between", gap: "4px" }}>
        {T.fechas.map((f, k) => (
          <span key={f} data-fecha={k} data-hoy={k === estado.hoy ? "si" : "no"} style={{ ...PEQUENO, whiteSpace: "nowrap", ...(k === estado.hoy ? { color: BLANCO, fontWeight: 600 } : {}) }}>{f}</span>
        ))}
      </div>
      {gesto && (
        /* El recorrido de la marca; la línea recorta lo que se sale (sin desplazamiento horizontal). */
        <div style={{ position: "absolute", left: "22px", right: "22px", top: 0, height: "44px", transform: `translateX(${visto * 100}%)`, transition: p === null && !reducido ? `transform 200ms ${CURVA}` : "none", pointerEvents: "none" }}>
          <div data-marca-fecha role="slider" tabIndex={0} aria-label={T.nombreFecha} aria-valuemin={0} aria-valuemax={2} aria-valuenow={estado.hoy}
            aria-valuetext={T.fechas[estado.hoy]} className="b5t-foco" {...props} style={{
              position: "absolute", left: 0, top: 0, width: "44px", height: "44px", transform: "translateX(-50%)", borderRadius: "50%",
              border: `2px dashed ${BLANCO}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "ew-resize", touchAction: "none", pointerEvents: "auto", background: "rgba(14,27,46,0.6)",
            }}>
            <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} color={BLANCO} />
          </div>
        </div>
      )}
    </div>
  );
}

function Inversiones({ estado, refDe, r, destino, hacer, reducido }) {
  const riel = useRef(null);
  const vende = estado.gesto === "vende75" || estado.gesto === "vendeResto";
  const tope = estado.gesto === "vendeResto" ? LOTES - estado.vendidos : 15;
  const { p, props } = useRiel(riel, 1, hacer);
  const elegidos = vende && p !== null ? Math.round(p * tope) : 0;
  const ponDestino = (n) => { destino.current = n; refDe("inversiones")(n); };
  const destinoBancos = estado.gesto === "bancos";
  return (
    <div ref={ponDestino} data-elemento="inversiones" data-resaltado={r.has("inversiones") ? "si" : "no"} style={{
      position: "relative", padding: "8px 4px", borderRadius: "12px", ...HUNDIDO, ...resalte(r.has("inversiones")),
      ...(destinoBancos ? { outline: `2px dashed ${BLANCO}`, outlineOffset: "-2px" } : {}),
    }}>
      <p style={ROTULO}>{T.inversiones}</p>
      <p data-estado-inversiones style={{ ...PEQUENO, margin: "2px 0 6px", minHeight: "32px" }}>{estado.estadoInversiones ? T.estados[estado.estadoInversiones] : ""}</p>
      <div data-lotes {...futuro(estado.lotes)} style={{ display: "grid", gridTemplateColumns: "repeat(5, 22px)", gap: "4px", visibility: estado.lotes ? "visible" : "hidden" }}>
        {Array.from({ length: LOTES }, (_, k) => {
          const vendido = k < estado.vendidos;
          const elegido = !vendido && k < estado.vendidos + elegidos;
          return (
            <span key={k} data-lote={vendido ? "vendido" : elegido ? "elegido" : "lote"} style={{
              width: "22px", height: "22px", borderRadius: "5px", boxSizing: "border-box",
              ...(vendido ? { border: "1px dashed rgba(248,249,250,0.24)" } : { background: "rgba(184,196,212,0.35)", border: elegido ? `2px solid ${BLANCO}` : REPOSO }),
              transition: reducido ? "none" : `opacity 240ms ${CURVA}`,
            }} />
          );
        })}
      </div>
      {destinoBancos && (
        <p data-pista="bancos" style={{ position: "absolute", left: "8px", right: "8px", top: "64px", margin: 0, display: "flex", alignItems: "center", gap: "4px", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO }}>
          <ArrowLeft aria-hidden="true" focusable="false" size={16} strokeWidth={2} color={BLANCO} style={{ flex: "none" }} />
          <span>{T.llevalo}</span>
        </p>
      )}
      {/* El riel de venta: siempre reservado; solo se ve en los pasos de vender. */}
      <div style={{ marginTop: "6px", height: "44px", position: "relative", visibility: vende ? "visible" : "hidden" }} {...futuro(vende)}>
        {vende && (
          <>
            <div ref={riel} style={{ position: "absolute", left: "11px", right: "11px", top: "20px", height: "4px", borderRadius: "2px", background: NEUTRO }} />
            <div data-riel-venta role="slider" tabIndex={0} aria-label={T.nombreRiel} aria-valuemin={0} aria-valuemax={tope} aria-valuenow={elegidos}
              aria-valuetext={estado.gesto === "vende75" ? T.vende75 : T.estados.quedan} className="b5t-foco" {...props} style={{
                position: "absolute", inset: 0, cursor: "ew-resize", touchAction: "none",
              }}>
              {/* El asa: el envoltorio mide el recorrido (el riel menos el asa) y se mueve con transform. */}
              <span aria-hidden="true" style={{ position: "absolute", top: "11px", left: 0, right: "22px", transform: `translateX(${(p ?? 0) * 100}%)`, transition: p === null && !reducido ? `transform 200ms ${CURVA}` : "none" }}>
                <span style={{ display: "block", width: "22px", height: "22px", borderRadius: "50%", background: BLANCO }} />
              </span>
            </div>
            <span style={{ ...PEQUENO, position: "absolute", left: 0, right: 0, bottom: "-2px", textAlign: "center", fontSize: "12px", pointerEvents: "none" }}>{T.desliza}</span>
          </>
        )}
      </div>
    </div>
  );
}

const FILAS = (estado) => estado.filas;
function Caja({ estado, refDe, r }) {
  return (
    <div ref={refDe("caja")} data-elemento="caja" data-resaltado={r.has("caja") ? "si" : "no"} style={{ padding: "8px 4px", borderRadius: "12px", ...HUNDIDO, ...resalte(r.has("caja")) }}>
      <p style={{ ...ROTULO, textAlign: "center" }}>{T.caja}</p>
      <p style={{ margin: "4px 0 0", paddingTop: "4px", borderTop: `2px solid ${NEUTRO}`, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: DEBE }}>{T.debe}</p>
      {FILAS(estado).map((f) => (
        <div key={f.id} data-fila-caja={f.id} data-nueva={f.nueva && f.visible ? "si" : "no"} {...futuro(f.visible)} style={{
          marginTop: "4px", padding: "2px 4px", borderRadius: "6px", textAlign: "right", visibility: f.visible ? "visible" : "hidden",
          border: `2px solid ${f.nueva && f.visible ? BLANCO : "transparent"}`,
        }}>
          <span style={{ display: "block", ...CIFRA }}>{T.filas[f.id]}</span>
          <span style={{ display: "block", ...PEQUENO }}>{f.tipo === "interes" ? T.interes : T.venta}</span>
        </div>
      ))}
    </div>
  );
}

/* La comparación: dos barras con la escala propia de la venta; la diferencia, su propio tramo. */
function Comparacion({ estado, refDe, r, reducido }) {
  const c = estado.comparacion;
  const v = c ? VENTAS_TITULOS[c.venta] : VENTAS_TITULOS.agosto;
  const textos = c ? T[c.venta] : T.agosto;
  const max = Math.max(v.costaron, v.recibio);
  const gana = v.recibio > v.costaron;
  const fila = (id, valor, visible, cifra) => (
    <div data-barra-comparacion={id} style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr) 80px", columnGap: "6px", alignItems: "center", minHeight: "24px", visibility: visible ? "visible" : "hidden" }}>
      <span style={PEQUENO}>{id === "costaron" ? T.costaron : T.recibio}</span>
      <div style={{ position: "relative", height: "18px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(valor / max) * 100}%`, borderRadius: "4px", border: REPOSO, background: "rgba(184,196,212,0.18)", boxSizing: "border-box" }} />
        {id === "recibio" && c?.diferencia && (
          <div data-diferencia={gana ? "ganancia" : "perdida"} className={reducido ? undefined : "b5t-entra"} style={{
            position: "absolute", top: 0, bottom: 0, boxSizing: "border-box",
            left: `${(Math.min(v.costaron, v.recibio) / max) * 100}%`, width: `${(Math.abs(v.recibio - v.costaron) / max) * 100}%`,
            ...(gana ? { background: RELLENO_AMBAR, borderLeft: `2px solid ${FAE.ambar}` } : { backgroundImage: RAYADO_TEAL, borderLeft: `2px solid ${FAE.teal}` }),
          }} />
        )}
      </div>
      <span style={{ ...CIFRA, textAlign: "right" }}>{cifra}</span>
    </div>
  );
  return (
    <div ref={refDe("comparacion")} data-elemento="comparacion" data-resaltado={r.has("comparacion") ? "si" : "no"} data-comparacion={c?.venta ?? ""} {...futuro(Boolean(c))} style={{
      minHeight: "92px", marginTop: "10px", padding: "4px 6px", borderRadius: "10px", boxSizing: "border-box", ...resalte(r.has("comparacion")),
    }}>
      {fila("costaron", v.costaron, Boolean(c?.costaron), textos.costaron)}
      {fila("recibio", v.recibio, Boolean(c?.recibio), textos.recibio)}
      <p data-rotulo-diferencia style={{ margin: "4px 0 0", textAlign: "right", visibility: c?.diferencia ? "visible" : "hidden" }}>
        <span style={{ ...PEQUENO, color: BLANCO, fontWeight: 600 }}>{gana ? T.ganancia : T.perdida} </span>
        <span style={CIFRA}>{textos.diferencia}</span>
      </p>
    </div>
  );
}

const CSS = `
.b5t-foco:focus-visible { outline: 2px solid ${BLANCO}; outline-offset: 2px; }
@keyframes b5t-entra { from { opacity: 0; } to { opacity: 1; } }
.b5t-entra { animation: b5t-entra 300ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) { .b5t-entra { animation: none; } }
`;

function EscenaTitulos({ estado, refDe, reducido, hacer }) {
  const r = new Set(estado.resaltados);
  const destino = useRef(null);
  return (
    <div data-escena data-escena-viva data-escena-titulos data-paso={estado.paso}>
      <style>{CSS}</style>
      <LineaFechas estado={estado} refDe={refDe} r={r} hacer={hacer} reducido={reducido} />
      <div style={{ display: "grid", gridTemplateColumns: "136px minmax(0, 1fr)", columnGap: "10px", marginTop: "8px", alignItems: "start" }}>
        <Inversiones estado={estado} refDe={refDe} r={r} destino={destino} hacer={hacer} reducido={reducido} />
        <div style={{ minWidth: 0 }}>
          {/* La ficha de Bancos: su sitio queda reservado cuando ya entró. */}
          <div style={{ minHeight: "48px", marginBottom: "6px", visibility: estado.bancos ? "visible" : "hidden" }} {...futuro(estado.bancos)}>
            {estado.bancos && (
              <Ficha id="bancos" refDe={refDe} arriba={T.bancos} cifra={T.compra} nombre={T.nombreBancos} activa={estado.gesto === "bancos"}
                resaltada={r.has("bancos")} destino={destino} alColocar={hacer} reducido={reducido} cifraEstilo={{ fontSize: "12px" }} />
            )}
          </div>
          <Caja estado={estado} refDe={refDe} r={r} />
        </div>
      </div>
      <Comparacion estado={estado} refDe={refDe} r={r} reducido={reducido} />
    </div>
  );
}

const { estado: estadoTitulos } = crearEstadoTitulos(FUSION_T5_A2.grupos);
/* La parada (antes del paso 11): resalta lo que queda en Inversiones; la predicción se escribe sobre Caja. */
export const PARADA_TITULOS = { ...PARADA_T5_A2, resaltados: ["inversiones"], etiquetaEn: "caja" };
export { estadoTitulos };

const escena = (estado, refDe, reducido, { hacer }) => <EscenaTitulos estado={estado} refDe={refDe} reducido={reducido} hacer={hacer} />;

export default function TresMomentos() {
  return (
    <MaquinaPegada todos={TODOS} estadoPaso={estadoTitulos} duracion={T5_A2_JUNTO.duracion} escena={escena} parada={PARADA_TITULOS}
      pintar={pintarCuentas} atributos={{ "data-capa2-t5-a2": true }} />
  );
}
