import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { inclinacionDe } from "../../../../contabilidad/balanza.js";
import { Balanza } from "../verbos.jsx";
import { CuentaT } from "../piezas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESCRITORIO DEL CONTADOR — las tres superficies y el hilo del desafío.
 *
 * ═══════════ POR QUÉ APILADAS Y NO EN FILA ═══════════
 *
 * La ficha pide un escritorio visto desde arriba con las tres superficies —el
 * diario, el mayor y el estado— y que las anteriores queden «visibles y
 * consultables» mientras se trabaja sobre la siguiente.
 *
 * En fila no cabe, y no es una cuestión de apretar: el nombre más largo del
 * caso, «Construcciones y edificaciones», pide unos 195 px a 13 px de tamaño,
 * y una cuenta T necesita además sus dos columnas. Tres superficies así, lado
 * a lado, piden del orden de 1.000 px. La pantalla tiene 375.
 *
 * Así que el escritorio se apila y se pliega: la superficie en la que se
 * trabaja va abierta, las que ya se llenaron quedan plegadas con su resumen
 * —cuántos asientos, cuántas cuentas— y se abren de un toque. «Visible y
 * consultable» se cumple; lo que no se cumple es «las tres a la vez en la
 * misma mirada», que a 375 px no lo cumple ningún diseño.
 *
 * ═══════════ EL HILO NO SE DESMONTA ═══════════
 *
 * La balanza vive aquí, en el escritorio, y no dentro de cada etapa. Es la
 * lección del Comité de NOVA: si cada etapa montara la suya, cambiar de etapa
 * la desmontaría y la volvería a montar, y el hilo se cortaría justo en la
 * costura — que es el único sitio donde se nota.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ROTULO = {
  margin: 0, fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
  letterSpacing: "0.14em", color: "rgba(248,249,250,0.55)",
};

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/** Una superficie del escritorio: plegable, con su resumen cuando está plegada. */
export function Superficie({ id, titulo, resumen, activa, children, vacia = "— en blanco —" }) {
  const [abierta, setAbierta] = useState(false);
  const desplegada = activa || abierta;

  return (
    <section
      data-superficie={id}
      data-abierta={desplegada ? "si" : "no"}
      data-activa={activa ? "si" : "no"}
      style={{
        borderRadius: "14px", padding: "11px 12px",
        background: activa ? "rgba(10,20,34,0.55)" : "rgba(10,20,34,0.32)",
        border: `1px solid ${activa ? `${FAE.ambar}55` : "rgba(248,249,250,0.1)"}`,
        transition: "border-color 260ms ease, background 260ms ease",
      }}
    >
      <button
        type="button"
        onClick={activa ? undefined : () => setAbierta((x) => !x)}
        aria-expanded={desplegada}
        disabled={activa}
        style={{
          display: "flex", alignItems: "center", gap: "8px", width: "100%",
          padding: 0, background: "transparent", border: "none", textAlign: "left",
          cursor: activa ? "default" : "pointer",
        }}
      >
        <span style={{ ...ROTULO, color: activa ? FAE.ambar : "rgba(248,249,250,0.55)" }}>{titulo}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.45)" }}>{resumen}</span>
        {!activa && (
          <span aria-hidden="true" style={{
            fontSize: "11px", color: "rgba(248,249,250,0.45)",
            transform: desplegada ? "rotate(90deg)" : "none", transition: "transform 220ms ease",
          }}>
            ›
          </span>
        )}
      </button>
      {desplegada && (
        <div style={{ marginTop: "9px" }}>
          {children ?? <p style={{ margin: 0, fontSize: "12px", color: "rgba(248,249,250,0.3)" }}>{vacia}</p>}
        </div>
      )}
    </section>
  );
}

/* El diario, tal como se va llenando. Nunca se vacía ni se corrige. */
export function HojaDelDiario({ asientos, marcar = null }) {
  if (asientos.length === 0) return null;
  return (
    <div>
      {asientos.map((a) => (
        <div key={a.id} data-asiento={a.id} style={{ padding: "6px 0", borderTop: "1px solid rgba(248,249,250,0.07)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
            <p style={{ ...ROTULO, fontSize: "9.5px" }}>{a.fecha}</p>
            {marcar && (
              <span data-marca={marcar.includes(a.id) ? "si" : "no"} style={{
                fontSize: "10.5px", color: marcar.includes(a.id) ? FAE.teal : "rgba(248,249,250,0.22)",
              }}>
                {marcar.includes(a.id) ? "✓" : "·"}
              </span>
            )}
          </div>
          {[[DEBE, a.asiento.debe], [HABER, a.asiento.haber]].map(([lado, renglones]) =>
            renglones.map(([cuenta, valor]) => (
              <div key={`${lado}-${cuenta}`} style={{
                display: "flex", gap: "8px", alignItems: "baseline",
                marginLeft: lado === HABER ? "16px" : 0,
              }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{cuenta}</span>
                <span style={{ ...CIFRA, fontSize: "12px", color: COLOR_LADO[lado] }}>{pesos(valor)}</span>
              </div>
            )),
          )}
        </div>
      ))}
    </div>
  );
}

/* El mayor: las cuentas T que se van abriendo. */
export function CuadriculaDelMayor({ cuentas, conSaldo = false, resaltar = null }) {
  if (cuentas.length === 0) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
      {cuentas.map((c) => (
        <div key={c.cuenta} data-en-mayor={c.cuenta} style={{
          borderRadius: "14px",
          outline: resaltar === c.cuenta ? `2px solid ${FAE.ambar}` : "none",
        }}>
          <CuentaT cuenta={c} saldo={conSaldo ? c : null} compacta />
        </div>
      ))}
    </div>
  );
}

/* El estado de situación financiera, en su forma de hoja formal. */
export function HojaDelEstado({ encabezado, secciones, activos, pasivosMasPatrimonio, cuadra }) {
  const conAlgo = secciones.filter((s) => s.lineas.length > 0);
  if (conAlgo.length === 0) return null;
  return (
    <div data-estado>
      <p style={{ margin: "0 0 2px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", textAlign: "center", color: FAE.text }}>
        {encabezado.empresa}
      </p>
      <p style={{ margin: "0 0 10px", fontSize: "10.5px", textAlign: "center", color: "rgba(248,249,250,0.5)" }}>
        {encabezado.titulo} · {encabezado.fecha}
      </p>
      {conAlgo.map((s) => (
        <div key={s.id} data-seccion={s.id} style={{ marginBottom: "8px" }}>
          <p style={{ ...ROTULO, fontSize: "9.5px", marginBottom: "3px" }}>{s.nombre.toUpperCase()}</p>
          {s.lineas.map((l) => (
            <div key={l.cuenta} style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{l.cuenta}</span>
              <span style={{ ...CIFRA, fontSize: "12px", color: "rgba(248,249,250,0.75)" }}>{pesos(l.valor)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(248,249,250,0.14)", marginTop: "3px", paddingTop: "3px" }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: "11px", color: "rgba(248,249,250,0.5)" }}>Total</span>
            <span style={{ ...CIFRA, fontSize: "11.5px", fontWeight: 700, color: "rgba(248,249,250,0.75)" }}>{pesos(s.total)}</span>
          </div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${cuadra ? FAE.teal : "rgba(248,249,250,0.22)"}`, paddingTop: "6px", marginTop: "4px" }}>
        {[["TOTAL ACTIVOS", activos, DEBE], ["TOTAL PASIVOS + PATRIMONIO", pasivosMasPatrimonio, HABER]].map(([r, v, lado]) => (
          <div key={r} style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
            <span style={{ ...ROTULO, fontSize: "9.5px", flex: 1, minWidth: 0 }}>{r}</span>
            <span data-total={lado} style={{ ...CIFRA, fontSize: "12.5px", fontWeight: 700, color: COLOR_LADO[lado] }}>{pesos(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * El hilo: la balanza en el borde del escritorio. Los rótulos cambian de
 * etapa —en el diario y el mayor son los dos lados del registro; en el estado
 * son los dos lados de la ecuación— y las cifras son siempre lo mismo: lo que
 * hay a cada lado de lo que se lleva registrado.
 */
export function HiloDeLaBalanza({ izquierda, derecha, rotuloIzq, rotuloDer }) {
  const cuadra = izquierda === derecha;
  const algo = izquierda > 0 || derecha > 0;
  return (
    <div data-hilo style={{
      position: "sticky", top: 0, zIndex: 3, marginBottom: "12px",
      padding: "6px 8px 2px", borderRadius: "14px",
      background: "rgba(6,18,32,0.92)", backdropFilter: "blur(6px)",
      border: "1px solid rgba(248,249,250,0.1)",
    }}>
      <Balanza
        inclinacion={inclinacionDe(izquierda, derecha)}
        izquierda={(
          <span style={{ display: "block", lineHeight: 1.3 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "8.5px", letterSpacing: "0.08em", opacity: 0.75 }}>{rotuloIzq}</span>
            <span style={{ display: "block", fontSize: "11.5px" }}>{pesos(izquierda)}</span>
          </span>
        )}
        derecha={(
          <span style={{ display: "block", lineHeight: 1.3 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "8.5px", letterSpacing: "0.08em", opacity: 0.75 }}>{rotuloDer}</span>
            <span style={{ display: "block", fontSize: "11.5px" }}>{pesos(derecha)}</span>
          </span>
        )}
        etiqueta={!algo
          ? "La ecuación todavía no tiene nada registrado"
          : cuadra ? "La ecuación está en equilibrio" : "La ecuación está desequilibrada"}
      />
    </div>
  );
}
