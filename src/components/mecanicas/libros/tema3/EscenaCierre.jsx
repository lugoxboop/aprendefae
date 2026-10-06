import { useId } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { DEBE, HABER, COLOR_LADO } from "../../../../data/contabilidad.js";
import {
  ROTULO_ZONA_A, SE_VACIAN, NO_SE_VACIAN, GANANCIAS_Y_PERDIDAS, QUEDA_TEXTO, TOTAL_INGRESOS,
  DIAGRAMA_AJUSTES, DIAGRAMA_CIERRE, GASTO_DE_LA_MAQUINA, INGRESO,
} from "../../../../data/contabilidadTema3Cierre.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { useCifra, ENTRADA, CAMBIO } from "./DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «CERRAR EL PERIODO» · LAS TRES ZONAS DE LA ESCENA (Xeno, P2; Levi).
 *
 *   A  las seis cuentas que se vacían: filas planas con barra de saldo
 *   B  Ganancias y pérdidas: una cuenta T, Debe y Haber, con sus barras
 *   C  las cinco que no se vacían: fichas rellenas de borde grueso, fijas
 *
 * A y C se distinguen por la forma (fila plana con barra frente a ficha
 * rellena de borde grueso) y por su rótulo, no por el color. Verde azulado y
 * ámbar solo dentro de Ganancias y pérdidas (Debe y Haber). Las cifras son
 * texto real; barras, contornos y fichas en vuelo, aria-hidden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CIFRAS = { fontVariantNumeric: "tabular-nums" };
const FONDO_TARJETA = "#294061";

export const CSS_CIERRE = `
@keyframes fae-ci-fundido { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .fae-ci * { animation: none !important; transition: none !important; } }
`;

function Rotulo({ texto, id }) {
  return (
    <span id={id} data-rotulo-zona={texto} style={{
      padding: "2px 9px", borderRadius: "999px", border: `1px solid ${COLOR.quieto}`,
      fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: COLOR.blanco, whiteSpace: "nowrap",
    }}>
      {texto}
    </span>
  );
}

/* ═══════════ ZONA A ═══════════ */

/* Una fila: nombre, saldo y barra. El saldo baja a $0 en 400 ms cuando la cuenta se vacía. */
export function Fila({ fila, reducido, comoBoton = false, onTocar, ultimaDeIngresos = false }) {
  const v = useCifra(fila.actual, { reducido, ms: 400 });
  const vacia = fila.actual === 0;
  const tono = vacia ? COLOR.apagado : COLOR.blanco;
  const contenido = (
    <>
      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", width: "100%" }}>
        <span data-nombre-fila style={{ fontFamily: INTER, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: tono, textAlign: "left" }}>
          {fila.cuenta}
        </span>
        <span data-saldo-fila data-final={pesos(fila.actual)} style={{ fontFamily: SORA, fontSize: "13.5px", fontWeight: 700, color: tono, whiteSpace: "nowrap", ...CIFRAS }}>
          {pesos(v)}
        </span>
      </span>
      <span aria-hidden="true" style={{ display: "block", width: "100%", height: "4px", marginTop: "5px", borderRadius: "2px", background: FONDO_TARJETA, overflow: "hidden" }}>
        <span data-barra-fila style={{
          display: "block", height: "100%", borderRadius: "2px", background: COLOR.neutro,
          width: `${(fila.actual / TOTAL_INGRESOS) * 100}%`, transition: `width 400ms ${CAMBIO}`,
        }} />
      </span>
    </>
  );
  const base = {
    display: "block", width: "100%", boxSizing: "border-box", padding: "8px 10px",
    borderBottom: ultimaDeIngresos ? `1px solid ${COLOR.quieto}` : "none",
  };
  if (!comoBoton) return <div data-fila={fila.cuenta} data-vaciada={vacia ? "si" : "no"} style={base}>{contenido}</div>;
  return (
    <button
      type="button"
      data-fila={fila.cuenta}
      data-vaciada={vacia ? "si" : "no"}
      aria-pressed={vacia}
      onClick={onTocar}
      style={{
        ...base, minHeight: "48px", margin: "0 0 6px", borderRadius: "10px", cursor: "pointer", background: "transparent",
        border: `2px solid ${vacia ? COLOR.quieto : COLOR.neutro}`, transition: `border-color 200ms ${CAMBIO}`,
      }}
    >
      {contenido}
    </button>
  );
}

export function ZonaA({ filas, reducido, comoBoton = false, onTocar }) {
  const ultimoIngreso = filas.map((f) => f.tipo).lastIndexOf(INGRESO);
  return (
    <section data-zona="A" style={{ margin: "0 0 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", margin: "0 0 7px" }}>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco }}>{ROTULO_ZONA_A}</p>
        <Rotulo texto={SE_VACIAN} />
      </div>
      <div style={comoBoton ? undefined : { border: `1px solid ${COLOR.quieto}`, borderRadius: "12px" }}>
        {filas.map((f, i) => (
          <Fila key={f.cuenta} fila={f} reducido={reducido} comoBoton={comoBoton} onTocar={() => onTocar?.(f.cuenta)}
            ultimaDeIngresos={!comoBoton && i === ultimoIngreso} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════ ZONA B: GANANCIAS Y PÉRDIDAS ═══════════ */

function MitadGyP({ lado, monto, reducido, compacto }) {
  const v = useCifra(monto, { reducido, ms: 450 });
  return (
    <div data-gyp-mitad={lado} style={{
      flex: "1 1 0", minWidth: 0, boxSizing: "border-box", minHeight: compacto ? "52px" : "64px",
      background: FONDO_TARJETA, borderTop: `3px solid ${COLOR_LADO[lado]}`, borderRadius: "10px",
      padding: compacto ? "6px 10px" : "8px 11px", display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <span style={{ fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, color: TONO_ROTULO[lado] }}>{lado === DEBE ? "Debe" : "Haber"}</span>
      <span data-gyp={lado} data-final={pesos(monto)} style={{
        fontFamily: SORA, fontSize: compacto ? "17px" : "20px", fontWeight: 700, color: monto === 0 ? COLOR.apagado : COLOR.blanco, ...CIFRAS,
      }}>
        {pesos(v)}
      </span>
    </div>
  );
}

/* Una barra proporcional (escala $14.800). La del debe puede llevar el contorno de lo que le falta. */
function Barra({ monto, hasta = null }) {
  const pct = (x) => `${(x / TOTAL_INGRESOS) * 100}%`;
  return (
    <span aria-hidden="true" style={{ position: "relative", display: "block", height: "8px", marginTop: "6px" }}>
      <span style={{ position: "absolute", inset: "1px 0", borderRadius: "3px", background: FONDO_TARJETA }} />
      <span data-barra-gyp style={{ position: "absolute", top: "1px", bottom: "1px", left: 0, width: pct(monto), borderRadius: "3px", background: COLOR.neutro, transition: `width 300ms ${CAMBIO}` }} />
      {hasta !== null && (
        <span data-contorno-queda style={{
          position: "absolute", top: 0, bottom: 0, left: pct(monto), width: `calc(${pct(hasta)} - ${pct(monto)})`, boxSizing: "border-box",
          border: `2px solid ${COLOR.blanco}`, borderRadius: "3px", animation: `fae-ci-fundido 200ms ${ENTRADA} both`,
        }} />
      )}
    </span>
  );
}

export function ZonaB({ gyp, reducido, compacto = false }) {
  return (
    <section data-zona="B" style={{ margin: "0 0 14px" }}>
      <p style={{ margin: "0 0 7px", fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco }}>{GANANCIAS_Y_PERDIDAS}</p>
      <div style={{ display: "flex", gap: "6px" }}>
        {[[DEBE, gyp.debe], [HABER, gyp.haber]].map(([lado, monto]) => (
          <div key={lado} style={{ flex: "1 1 0", minWidth: 0 }}>
            <MitadGyP lado={lado} monto={monto} reducido={reducido} compacto={compacto} />
            {!compacto && <Barra monto={monto} hasta={lado === DEBE && gyp.queda !== null ? gyp.haber : null} />}
          </div>
        ))}
      </div>
      {gyp.queda !== null && !compacto && (
        <p style={{ margin: "10px 0 0", textAlign: "center" }}>
          <span data-queda style={{
            display: "inline-block", padding: "4px 12px", borderRadius: "999px", background: COLOR.neutro, color: COLOR.navy,
            fontFamily: SORA, fontSize: "14px", fontWeight: 700, animation: `fae-ci-fundido 200ms ${ENTRADA} both`,
          }}>
            {QUEDA_TEXTO(pesos(gyp.queda))}
          </span>
        </p>
      )}
    </section>
  );
}

/* ═══════════ ZONA C: LO QUE NO SE VACÍA ═══════════ */
export function ZonaC({ cuentas }) {
  const id = useId();
  return (
    <section data-zona="C" style={{ margin: "0 0 6px" }}>
      <div style={{ margin: "0 0 7px" }}><Rotulo texto={NO_SE_VACIAN} id={id} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: "7px" }}>
        {cuentas.map((c) => (
          <div key={c.cuenta} data-ficha-fija={c.cuenta} aria-describedby={id} role="group" aria-label={`${c.cuenta}, ${pesos(c.saldo)}`} style={{
            padding: "8px 10px", borderRadius: "10px", boxSizing: "border-box",
            background: FONDO_TARJETA, border: `2.5px solid ${COLOR.neutro}`,
          }}>
            <p style={{ margin: 0, fontFamily: INTER, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: COLOR.blanco }}>{c.cuenta}</p>
            <p data-saldo-fijo style={{ margin: "3px 0 0", fontFamily: SORA, fontSize: "13.5px", fontWeight: 700, color: COLOR.blanco, ...CIFRAS }}>{pesos(c.saldo)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ EL DIAGRAMA DEL PASO 2 (p. 147) ═══════════ */
function Visto() {
  return (
    <span aria-hidden="true" style={{ width: "20px", height: "20px", borderRadius: "50%", background: COLOR.neutro, display: "grid", placeItems: "center", flex: "none" }}>
      <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke={COLOR.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
export function Diagrama({ anima }) {
  const fundido = anima ? `fae-ci-fundido 200ms ${ENTRADA} both` : undefined;
  return (
    <section data-diagrama role="group" aria-label={`${DIAGRAMA_AJUSTES}, después ${DIAGRAMA_CIERRE}`} style={{ margin: "0 0 16px" }}>
      <div data-tarjeta-ajustes style={{ padding: "11px 12px", borderRadius: "12px", background: FONDO_TARJETA, border: `2px solid ${COLOR.neutro}`, animation: fundido }}>
        <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: "8px", fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco }}>
          <Visto />{DIAGRAMA_AJUSTES}
        </p>
        <p style={{ margin: 0, display: "flex", justifyContent: "space-between", gap: "10px", fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: COLOR.blanco }}>
          <span>{GASTO_DE_LA_MAQUINA}</span><span style={{ fontFamily: SORA, fontWeight: 700, ...CIFRAS }}>{pesos(2500)}</span>
        </p>
      </div>
      <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", height: "34px", animation: anima ? `fae-ci-fundido 200ms ${ENTRADA} 100ms both` : undefined }}>
        <svg width="20" height="34" viewBox="0 0 20 34">
          <line x1="10" y1="0" x2="10" y2="28" stroke={COLOR.neutro} strokeWidth="2" />
          <path d="M4 22 L10 30 L16 22" fill="none" stroke={COLOR.neutro} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div data-tarjeta-cierre style={{
        padding: "11px 12px", borderRadius: "12px", background: FONDO_TARJETA, border: `3px solid ${COLOR.blanco}`,
        fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco,
        animation: anima ? `fae-ci-fundido 200ms ${ENTRADA} 200ms both` : undefined,
      }}>
        {DIAGRAMA_CIERRE}
      </div>
    </section>
  );
}

/* ═══════════ EL VUELO DEL SALDO ═══════════
 *
 * Una ficha #B8C4D4 con la cifra en navy sale del saldo de la fila y entra en
 * su mitad de Ganancias y pérdidas (o al revés, en la capa 3). 600 ms,
 * entrada y salida suaves. Vive encima de todo, dentro de la escena, y se
 * borra sola. Con movimiento reducido o sin `Element.animate`, no hay vuelo.
 */
export function volar(caja, viajes, { reducido, ms = 600 } = {}) {
  if (reducido || !caja || typeof caja.animate !== "function") return;
  const base = caja.getBoundingClientRect();
  for (const { desde, hasta, texto, retraso = 0 } of viajes) {
    if (!desde || !hasta) continue;
    const ficha = document.createElement("span");
    ficha.setAttribute("aria-hidden", "true");
    ficha.setAttribute("data-ficha-en-vuelo", "");
    ficha.textContent = texto;
    Object.assign(ficha.style, {
      position: "absolute", left: `${desde.left - base.left}px`, top: `${desde.top - base.top}px`,
      padding: "3px 9px", borderRadius: "999px", background: COLOR.neutro, color: COLOR.navy,
      fontFamily: SORA, fontSize: "13.5px", fontWeight: "700", whiteSpace: "nowrap",
      pointerEvents: "none", zIndex: "6",
    });
    caja.appendChild(ficha);
    const dx = (hasta.left + hasta.width / 2) - (desde.left + desde.width / 2);
    const dy = (hasta.top + hasta.height / 2) - (desde.top + desde.height / 2);
    const a = ficha.animate(
      [{ transform: "translate(0, 0)", opacity: 1 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.9 }],
      { duration: ms, delay: retraso, easing: "ease-in-out", fill: "both" },
    );
    const fin = () => ficha.remove();
    a.onfinish = fin;
    a.oncancel = fin;
  }
}
