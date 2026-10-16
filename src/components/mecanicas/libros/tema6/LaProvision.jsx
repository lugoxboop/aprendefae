import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { ESCENA_T6_A3, PARADA_T6_A3, FUSION_T6_A3, TANQUE_T6_A3, CUENTA_T_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { T6_A3_JUNTO, crearEstadoTanque, VALORES_TANQUE_T6_A3 } from "../../../../contabilidad/t6Pieza3.js";
import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";
import MaquinaPegada from "./MaquinaPegada.jsx";
import TanqueProvision, { MONO, CURVA, HUNDIDO, RELLENO_AMBAR } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 2 · «MÍRELO FUNCIONAR» — EL TANQUE (lote 7, P2 de
 * Mai, aprobada por Sakuta con sus decisiones).
 *
 * El estudiante VE la provisión como un tanque que se llena al cierre, se
 * vacía al castigar la deuda de Moncayo y rompe la línea del cero
 * cuando el castigo es mayor. Al año siguiente sube el nivel hasta la línea
 * del análisis, y los dos segmentos muestran solos que el ajuste suma lo que
 * faltó. De arriba abajo:
 *
 *   A · Clientes: la fila con su saldo; la barra (26 de alto, radio 6), con la
 *       parte que no se va a recuperar al 24 % del largo, a la derecha,
 *       rayada en neutro hasta que se resta y después rellena de ámbar al
 *       38 % con borde izquierdo ámbar de 2 px; los rótulos debajo; la ranura
 *       de 44 (la ficha de Moncayo o la pista del gesto).
 *   B · Dos columnas (1fr 84px, separación 10): la bandeja del gasto con sus
 *       dos fichas y, debajo, la cuenta T en el contenedor hundido; a la
 *       derecha, «Saldo», el tanque (84 × 160) y su rótulo.
 *
 * Los cuatro gestos (arrastrar el gasto, tocar la barra, arrastrar la deuda
 * de Moncayo, subir el nivel) los lleva MaquinaPegada: «Siguiente»
 * espera al gesto. El arrastre nunca es la única forma: un toque (menos de
 * 6 px), Enter o Espacio colocan la ficha; el asa sube con flecha arriba,
 * Fin o Enter. Todo se dibuja siempre en su sitio (la escena no salta); lo
 * que todavía no llega se reserva invisible y callado (data-futuro).
 *
 * Color por rol: ámbar = HABER, teal = DEBE, neutro lo demás; coral nunca.
 * Las cifras van en la pila monoespaciada solo dentro de esta escena
 * (decisión (d) de Sakuta). Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = ESCENA_T6_A3;
const T = TANQUE_T6_A3;
const V = VALORES_TANQUE_T6_A3;
const INTER = "Inter, sans-serif";
const BLANCO = FAE.text;
const SECUNDARIO = "#A8B6C8";
const NEUTRO = "#B8C4D4";
const DEBE = "#3FA69A";
const REPOSO = "1px solid rgba(248,249,250,0.35)";
const ACTIVO = `2px solid ${BLANCO}`;
/* La parte que no se va a recuperar: proporción ilustrativa, no a escala (Mai §2, [supuesto] medido en el PR). */
export const PARTE_BARRA = 24;

const ROTULO = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: SECUNDARIO };
const PEQUENO = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO };
const CIFRA = { fontFamily: MONO, fontSize: "12.5px", fontWeight: 700, lineHeight: "16px", color: BLANCO, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const CSS_TANQUE = `
.b5t-foco:focus-visible { outline: 2px solid ${BLANCO}; outline-offset: 2px; }
@keyframes b5t-entra { from { opacity: 0; } to { opacity: 1; } }
.b5t-entra { animation: b5t-entra 240ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) { .b5t-entra { animation: none; } }
`;

/* Lo que todavía no llega: ocupa su sitio, invisible y callado (MaquinaPegada lo vuelve inert). */
const futuro = (visible) => (visible ? {} : { "data-futuro": "", style: { visibility: "hidden" } });
const conFuturo = (visible, estilo) => ({ ...(visible ? {} : { "data-futuro": "" }), style: { ...estilo, ...(visible ? {} : { visibility: "hidden" }) } });

/*
 * ═══ LA FICHA ARRASTRABLE (Mai §3.2) ═══
 * En reposo, 1 px rgba(248,249,250,.35); resaltada o arrastrándose, 2 px #F8F9FA (y scale(.96) mientras va con el dedo).
 * Se suelta en el tanque: se desvanece en 200 ms y el modelo avanza. Se suelta fuera: vuelve en 200 ms.
 */
function Ficha({ id, refDe, arriba, cifra, nombre, activa, resaltada, destino, alColocar, reducido }) {
  const [mano, setMano] = useState(null); // { x0, y0, dx, dy, lejos }
  const [fase, setFase] = useState(null); // "suelta" | "vuelve"
  const tocado = useRef(false);
  const borde = resaltada || mano?.lejos ? ACTIVO : REPOSO;
  const d = resaltada || mano?.lejos ? 1 : 0;
  const colocar = () => {
    if (reducido) { setMano(null); setFase(null); alColocar(); return; }
    setFase("suelta");
    setTimeout(() => { setFase(null); setMano(null); alColocar(); }, 200);
  };
  const enDestino = (x, y) => {
    const r = destino.current?.getBoundingClientRect();
    return Boolean(r) && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  const props = activa ? {
    type: "button",
    "aria-label": nombre,
    className: "b5t-foco",
    onClick: () => { if (tocado.current) { tocado.current = false; return; } alColocar(); },
    onPointerDown: (e) => {
      if (fase) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setMano({ x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, lejos: false });
    },
    onPointerMove: (e) => {
      if (!mano) return;
      const dx = e.clientX - mano.x0; const dy = e.clientY - mano.y0;
      setMano({ ...mano, dx, dy, lejos: mano.lejos || Math.hypot(dx, dy) >= 6 });
    },
    onPointerUp: (e) => {
      if (!mano) return;
      tocado.current = true;
      /* Un toque sin arrastre también la coloca. */
      if (!mano.lejos || enDestino(e.clientX, e.clientY)) { colocar(); return; }
      setFase("vuelve");
      setMano({ ...mano, dx: 0, dy: 0, lejos: false });
      setTimeout(() => { setFase(null); setMano(null); }, reducido ? 0 : 200);
    },
    onPointerCancel: () => { setMano(null); setFase(null); },
  } : {};
  const Etiqueta = activa ? "button" : "div";
  const moviendo = mano && (mano.lejos || fase);
  return (
    <Etiqueta ref={refDe(id)} data-ficha={id} data-elemento={id} data-activa={activa ? "si" : "no"} data-resaltado={resaltada ? "si" : "no"} {...props} style={{
      display: "block", width: "100%", minHeight: "44px", boxSizing: "border-box", margin: 0, textAlign: "left", font: "inherit",
      padding: `${5 - d}px ${9 - d}px`, borderRadius: "10px", border: borde, background: FAE.bg, color: BLANCO,
      cursor: activa ? "grab" : "default", touchAction: activa ? "none" : undefined, position: "relative", zIndex: moviendo ? 30 : undefined,
      transform: moviendo ? `translate(${mano.dx}px, ${mano.dy}px) scale(${mano.lejos ? 0.96 : 1})` : "none",
      opacity: fase === "suelta" ? 0 : 1,
      transition: reducido || (mano?.lejos && !fase) ? "none" : `transform 200ms ${CURVA}, opacity 200ms ${CURVA}`,
    }}>
      <span aria-hidden={activa ? "true" : undefined} style={{ display: "block", ...PEQUENO }}>{arriba}</span>
      <span aria-hidden={activa ? "true" : undefined} style={{ display: "block", ...CIFRA, fontSize: "13px" }}>{cifra}</span>
    </Etiqueta>
  );
}

/* Una fila de la cuenta T: solo la cifra; la fecha, para el lector (§8). La nueva, con borde de 2 px #F8F9FA. */
function FilaT({ id, refDe, visible, cifra, fecha, resaltada }) {
  return (
    <div ref={refDe(id)} data-fila-t={id} data-elemento={id} data-resaltado={resaltada ? "si" : "no"} {...conFuturo(visible, {
      margin: "4px 0 0", padding: "2px 3px", borderRadius: "6px", textAlign: "right", boxSizing: "border-box",
      border: `2px solid ${resaltada ? BLANCO : "transparent"}`,
    })}>
      <span style={CIFRA}>{cifra}</span>
      <span style={SOLO_LECTOR}>{`, ${fecha}`}</span>
    </div>
  );
}

/* Un rótulo que se resalta sin moverse: borde de 2 px, transparente o #F8F9FA. */
const marco = (resaltado) => ({ border: `2px solid ${resaltado ? BLANCO : "transparent"}`, borderRadius: "8px", padding: "1px 4px", margin: "-3px -6px" });

function EscenaTanque({ estado, refDe, reducido, hacer }) {
  const tanque = useRef(null);
  const r = new Set(estado.resaltados);
  const ponTanque = (n) => { tanque.current = n; refDe("tanque")(n); };
  /* El rótulo del faltante se lee al final del «mira esto» (700 ms); los demás rótulos, al llenarse (600 ms). */
  const rotuloAntes = useRef(estado.rotuloSaldo);
  const retraso = reducido || rotuloAntes.current === estado.rotuloSaldo ? 0 : estado.rotuloSaldo === "faltante" ? 700 : 600;
  useEffect(() => { rotuloAntes.current = estado.rotuloSaldo; });
  const saldos = {
    provision: [T.quedaEn, E.provision1],
    faltante: [T.leFaltan, T.faltante],
    analisis: [T.quedaEn, T.pide],
  };
  const restada = estado.parte === "restada";
  const barraActiva = estado.gesto === "barra";
  const Barra = barraActiva ? "button" : "div";
  return (
    <div data-escena data-escena-viva data-escena-tanque data-paso={estado.paso}>
      <style>{CSS_TANQUE}</style>
      {/* ═══ A · CLIENTES ═══ */}
      <div data-clientes>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <p style={{ ...ROTULO, color: BLANCO }}>{E.clientes}</p>
          <span style={CIFRA}>{E.saldoClientes}</span>
        </div>
        <Barra ref={refDe("barra")} data-barra data-elemento="barra" data-resaltado={r.has("barra") ? "si" : "no"}
          {...(barraActiva ? { type: "button", "aria-label": T.nombreBarra, className: "b5t-foco", onClick: hacer } : { "aria-hidden": "true" })}
          style={{
            display: "flex", width: "100%", height: "26px", margin: "6px 0 0", padding: 0, boxSizing: "border-box", overflow: "hidden",
            borderRadius: "6px", border: REPOSO, background: "rgba(248,249,250,0.06)", cursor: barraActiva ? "pointer" : "default", font: "inherit",
            boxShadow: r.has("barra") ? `inset 0 0 0 1px ${BLANCO}, 0 0 0 1px ${BLANCO}` : "none",
          }}>
          <span style={{ flex: "1 1 auto" }} />
          <span data-parte={estado.parte ?? "ninguna"} style={{
            flex: `0 0 ${PARTE_BARRA}%`, boxSizing: "border-box", visibility: estado.parte ? "visible" : "hidden",
            ...(restada
              ? { background: RELLENO_AMBAR, borderLeft: `2px solid ${FAE.ambar}` }
              : { backgroundImage: "repeating-linear-gradient(45deg, rgba(184,196,212,0.55) 0 3px, transparent 3px 7px)", borderLeft: `1px solid ${NEUTRO}` }),
          }} />
        </Barra>
        {/* Los rótulos de la barra: a la izquierda el valor neto; a la derecha, lo que no se va a recuperar o la provisión restada. */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", minHeight: "34px", marginTop: "4px" }}>
          <p ref={refDe("valorNeto")} data-elemento="valorNeto" data-valor-neto data-resaltado={r.has("valorNeto") ? "si" : "no"} {...conFuturo(estado.valorNeto, { margin: 0, alignSelf: "flex-start", ...marco(r.has("valorNeto")) })}>
            <span style={{ display: "block", ...PEQUENO }}>{T.valorNeto}</span>
            <span style={{ display: "block", ...CIFRA }}>{E.valorNeto}</span>
          </p>
          <p data-rotulo-parte={estado.parte ?? ""} {...conFuturo(Boolean(estado.parte), { margin: 0, textAlign: "right" })}>
            <span style={{ display: "block", ...PEQUENO }}>{restada ? T.provisionMenos : T.noLaVa}</span>
            <span style={{ display: "block", ...CIFRA }}>{E.provision1}</span>
          </p>
        </div>
        {/* La ranura de 44: la ficha de Moncayo o la pista del gesto. */}
        <div ref={refDe("ranura")} data-ranura style={{ minHeight: "44px", marginTop: "4px", display: "flex", alignItems: "center" }}>
          {estado.fichaPablo && (
            <div style={{ width: "calc(100% - 94px)" }}>
              <Ficha id="fichaPablo" refDe={refDe} arriba={T.pablo} cifra={E.castigo} nombre={`${T.pablo}, ${E.castigo}`}
                activa={estado.gesto === "pablo"} resaltada={r.has("fichaPablo")} destino={tanque} alColocar={hacer} reducido={reducido} />
            </div>
          )}
          {(estado.gesto === "barra" || estado.gesto === "asa") && (
            <p data-pista={estado.gesto} style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO }}>
              <ArrowUp aria-hidden="true" focusable="false" size={16} strokeWidth={2} color={BLANCO} style={{ flex: "none" }} />
              <span>{estado.gesto === "barra" ? T.tocaBarra : T.subeNivel}</span>
            </p>
          )}
        </div>
      </div>

      {/* ═══ B · EL GASTO, LA T Y EL TANQUE ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 84px", columnGap: "10px", marginTop: "6px" }}>
        <div style={{ minWidth: 0 }}>
          <div ref={refDe("bandejaGasto")} data-elemento="bandejaGasto" data-bandeja-gasto>
            <p style={{ ...ROTULO, margin: "0 0 4px" }}>{E.gasto}</p>
            <Ficha id="fichaGasto1" refDe={refDe} arriba={E.momentos[0].fecha} cifra={E.provision1} nombre={`${E.momentos[0].fecha}, ${E.provision1}`}
              activa={estado.fichaGasto1 === "activa"} resaltada={r.has("fichaGasto1")} destino={tanque} alColocar={hacer} reducido={reducido} />
            <div {...futuro(estado.fichaGasto2)} style={{ marginTop: "6px", ...(estado.fichaGasto2 ? {} : { visibility: "hidden" }) }}>
              <Ficha id="fichaGasto2" refDe={refDe} arriba={E.momentos[2].fecha} cifra={E.ajuste} nombre={`${E.momentos[2].fecha}, ${E.ajuste}`}
                activa={false} resaltada={false} destino={tanque} alColocar={() => {}} reducido={reducido} />
            </div>
          </div>
          {/* La cuenta T, en el contenedor hundido de Cuentas. */}
          <div data-cuenta-t style={{ marginTop: "10px", padding: "8px 5px 6px", borderRadius: "12px", ...HUNDIDO }}>
            <p style={{ margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO }}>{E.provision}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "6px", borderTop: `1px solid ${NEUTRO}` }}>
              <div data-columna="debe" style={{ padding: "4px 2px 0 0" }}>
                <p style={{ margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: DEBE }}>{CUENTA_T_T6_A3.debe}</p>
                <FilaT id="filaDebe1" refDe={refDe} visible={estado.filas.debe1} cifra={E.castigo} fecha={E.momentos[1].fecha} resaltada={r.has("filaDebe1")} />
              </div>
              <div data-columna="haber" style={{ padding: "4px 0 0 2px", borderLeft: `1px solid ${NEUTRO}` }}>
                <p style={{ margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.ambar }}>{CUENTA_T_T6_A3.haber}</p>
                <FilaT id="filaHaber1" refDe={refDe} visible={estado.filas.haber1} cifra={E.provision1} fecha={E.momentos[0].fecha} resaltada={r.has("filaHaber1")} />
                <FilaT id="filaHaber2" refDe={refDe} visible={estado.filas.haber2} cifra={E.ajuste} fecha={E.momentos[2].fecha} resaltada={r.has("filaHaber2")} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={{ ...ROTULO, margin: "0 0 4px" }}>{T.saldo}</p>
          <TanqueProvision ref={ponTanque} nivel={estado.nivel} textos={T} analisis={estado.analisis} segmentos={estado.segmentos}
            soltar={estado.gesto === "gasto" || estado.gesto === "pablo"} resaltado={r.has("tanque")} reducido={reducido}
            atributos={{ "data-elemento": "tanque", "data-resaltado": r.has("tanque") ? "si" : "no" }}
            asa={estado.gesto === "asa" ? { nombre: T.nombreAsa, desde: V.faltante, hasta: V.analisis, alEncajar: hacer } : null} />
          {/* El rótulo del saldo: reserva el alto del más largo. */}
          <div style={{ display: "grid", minHeight: "34px", marginTop: "6px" }}>
            {Object.entries(saldos).map(([k, [l1, l2]]) => (
              <p key={k} aria-hidden="true" style={{ gridArea: "1 / 1", margin: 0, visibility: "hidden", ...marco(false) }}>
                <span style={{ display: "block", ...PEQUENO }}>{l1}</span><span style={{ display: "block", ...CIFRA }}>{l2}</span>
              </p>
            ))}
            {estado.rotuloSaldo && (
              <p key={estado.rotuloSaldo} ref={refDe("rotuloSaldo")} data-elemento="rotuloSaldo" data-rotulo-saldo={estado.rotuloSaldo} data-resaltado={r.has("rotuloSaldo") ? "si" : "no"}
                className={retraso ? "b5t-entra" : undefined} aria-hidden="true"
                style={{ gridArea: "1 / 1", margin: 0, alignSelf: "start", ...marco(r.has("rotuloSaldo")), animationDelay: retraso ? `${retraso}ms` : undefined }}>
                <span style={{ display: "block", ...PEQUENO }}>{saldos[estado.rotuloSaldo][0]}</span>
                <span style={{ display: "block", ...CIFRA }}>{saldos[estado.rotuloSaldo][1]}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Los pasos juntados (FUSION_T6_A3) y el estado del tanque por paso. */
const { estado: estadoTanque } = crearEstadoTanque(FUSION_T6_A3.grupos);
/* La parada va después del paso de la deuda de Moncayo, antes del paso 11 de antes; resalta el gasto y la fila del castigo. */
export const PARADA_TANQUE = {
  ...PARADA_T6_A3,
  antes: FUSION_T6_A3.grupos.findIndex((g) => g.includes(11)) + 1,
  resaltados: ["fichaGasto1", "filaDebe1"],
  etiquetaEn: "bandejaGasto",
};
export { estadoTanque };

const escena = (estado, refDe, reducido, { hacer }) => <EscenaTanque estado={estado} refDe={refDe} reducido={reducido} hacer={hacer} />;

export default function LaProvision() {
  return (
    <MaquinaPegada todos={T6_A3_JUNTO.TODOS} estadoPaso={estadoTanque} duracion={T6_A3_JUNTO.duracion} escena={escena}
      parada={PARADA_TANQUE} atributos={{ "data-capa2-t6-a3": true }} />
  );
}
