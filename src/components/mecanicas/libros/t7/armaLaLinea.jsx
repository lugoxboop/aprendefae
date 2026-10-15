import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { formatearCifra, leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { AsientoEnLineas, ElegirLado, Responder } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { TEXTOS_ARMA } from "../../../../contabilidad/armaLaLinea.js";
import { TEXTO, LADOS_T7, BOTONES_T7 } from "./hacerT7.jsx";
import { Plegable } from "./plegable.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 3 · «ARMA LA LÍNEA», LA CASILLA DE CIFRA Y EL DISTINTIVO «UN INTENTO»
 * (Célula C · los Hacer de T7 y T5). Piezas nuevas de la célula, sin tocar
 * lo compartido (AsientoEnLineas, ElegirLado y Responder se usan como están).
 *
 * LineasConCuenta  la variante de la mesa de asientos: en cada línea el
 *                  estudiante elige la CUENTA de un banco de fichas (la
 *                  correcta y sus distractores, barajados) y su LADO; el monto
 *                  viene dado. «Comprobar» califica cada línea UNA vez: está
 *                  bien si cuenta y lado lo están. Después, la línea dice cuál
 *                  era, el porqué de las que fallaron debajo de ellas y, si se
 *                  pasa `asiento`, el asiento completo con sus sumas.
 *
 * CasillaCifra     para los ítems cuyo objetivo es calcular: se escribe la
 *                  cifra (con «$» y punto de miles) y «Comprobar» la califica
 *                  UNA vez. La evaluación la hace evaluarCifra.
 *
 * UnIntento        el distintivo pequeño junto al contador, que reemplaza a
 *                  la frase «Tienes un solo intento…» de las consignas.
 *                  sinUnSoloIntento quita esa frase al pintar: los datos
 *                  siguen siendo, letra por letra, los de Near.
 *
 * La lógica sin React (bancoDeLinea, evaluarCifra, sinUnSoloIntento) y los
 * textos de interfaz están en contabilidad/armaLaLinea.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ EL DISTINTIVO ═══════════ */

export function UnIntento() {
  return (
    <span data-un-intento style={{
      display: "inline-flex", alignItems: "center", flex: "none", height: "22px", padding: "0 8px", borderRadius: "999px",
      border: "1px solid rgba(248,249,250,0.22)", color: "#A8B6C8",
      fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {TEXTOS_ARMA.unIntento}
    </span>
  );
}

/* El contador con su distintivo a la derecha. `contador` es el Pulsos de la pieza, que no se toca. */
export function ContadorConIntento({ children }) {
  return (
    <div data-contador-intento style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>{children}</div>
      <UnIntento />
    </div>
  );
}

/* ═══════════ LA CASILLA DE CIFRA ═══════════ */

export function CasillaCifra({ id, onComprobar, comprobado, etiqueta }) {
  const [texto, setTexto] = useState("");
  const valor = leerCifra(texto);
  return (
    <div data-casilla-cifra={id}>
      <label style={{ display: "flex", alignItems: "center", height: "48px", boxSizing: "border-box", padding: "0 12px", borderRadius: "12px",
        background: "rgba(14,27,46,0.7)", border: "1px solid rgba(248,249,250,0.22)", marginBottom: "10px" }}>
        <span aria-hidden="true" style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, color: "#A8B6C8", marginRight: "4px" }}>$</span>
        <input
          data-campo-cifra={id}
          value={texto}
          onChange={(e) => !comprobado && setTexto(formatearCifra(e.target.value))}
          readOnly={comprobado}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          aria-label={etiqueta ?? TEXTOS_ARMA.campo}
          style={{ flex: "1 1 auto", minWidth: 0, width: "100%", height: "100%", padding: 0, border: "none", outline: "none", background: "transparent",
            color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
        />
      </label>
      {!comprobado && <Responder onClick={() => valor !== null && onComprobar(valor)} deshabilitado={valor === null}>{BOTONES_T7.comprobar}</Responder>}
    </div>
  );
}

/* ═══════════ «ARMA LA LÍNEA» ═══════════ */

function Ficha({ texto, elegida, correcta, error, deshabilitado, onElegir }) {
  const borde = correcta ? FAE.teal : error ? FAE.coral : elegida ? "#F8F9FA" : "rgba(248,249,250,0.22)";
  return (
    <button type="button" data-ficha-cuenta={texto} aria-pressed={elegida} disabled={deshabilitado} onClick={onElegir}
      style={{
        appearance: "none", minHeight: "44px", padding: "8px 12px", borderRadius: "999px", textAlign: "left",
        border: `${elegida || correcta || error ? 2 : 1}px solid ${borde}`, background: elegida ? "rgba(184,196,212,0.12)" : "rgba(14,27,46,0.5)",
        color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.3, cursor: deshabilitado ? "default" : "pointer", overflowWrap: "anywhere",
      }}>
      {texto}
    </button>
  );
}

/**
 * `lineas`: [{ id, cuenta, valor, lado, retro, banco }] en el orden en que se
 * muestran; `banco` es la lista de cuentas de la línea, ya barajada (la
 * correcta y sus distractores). onComprobar recibe [{ linea, elegido, ok }],
 * con `elegido` = «cuenta|lado».
 */
export function LineasConCuenta({ lineas, asiento = null, onComprobar, comprobado, acento = FAE.ambar }) {
  const [cuentas, setCuentas] = useState({});
  const [lados, setLados] = useState({});
  const todas = lineas.every((l) => cuentas[l.id] && lados[l.id]);
  const okDe = (l) => cuentas[l.id] === l.cuenta && lados[l.id] === l.lado;
  const comprobar = () => {
    if (comprobado || !todas) return;
    onComprobar(lineas.map((l) => ({ linea: l, elegido: `${cuentas[l.id]}|${lados[l.id]}`, ok: okDe(l) })));
  };
  return (
    <>
      <div style={{ display: "grid", gap: "10px" }}>
        {lineas.map((l, k) => {
          const mal = comprobado && !okDe(l);
          return (
            <div key={l.id} data-linea-cuenta={l.id} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)" }}>
              <p style={{ ...TEXTO, margin: "0 0 8px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <span data-rotulo-linea style={{ color: "#A8B6C8" }}>{`${TEXTOS_ARMA.eligeCuenta} · ${k + 1}`}</span>
                <span data-valor style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontWeight: 600 }}>{pesos(l.valor)}</span>
              </p>
              <div role="group" aria-label={`${TEXTOS_ARMA.eligeCuenta} ${k + 1}, ${pesos(l.valor)}`} style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                {l.banco.map((c) => (
                  <Ficha key={c} texto={c} elegida={cuentas[l.id] === c} deshabilitado={comprobado}
                    correcta={comprobado && c === l.cuenta} error={comprobado && cuentas[l.id] === c && c !== l.cuenta}
                    onElegir={() => !comprobado && setCuentas((x) => ({ ...x, [l.id]: c }))} />
                ))}
              </div>
              <div role="group" aria-label={`Línea ${k + 1}: Debe o Haber`}>
                <ElegirLado elegido={lados[l.id] ?? null} correcto={comprobado ? l.lado : null} deshabilitado={comprobado}
                  onElegir={(lado) => !comprobado && setLados((x) => ({ ...x, [l.id]: lado }))} nombres={LADOS_T7} />
              </div>
              <div data-retro-linea aria-live="polite">
                {mal && (
                  <div className="fae-t7h-entra" data-panel="error" style={{
                    marginTop: "10px", padding: "11px 13px", borderRadius: "11px",
                    background: "rgba(231,111,81,0.13)", borderLeft: `3px solid ${FAE.coral}`,
                  }}>
                    <span style={SOLO_LECTOR}>Incorrecto. </span>
                    <p data-era style={{ ...TEXTO, margin: "0 0 6px", fontWeight: 600 }}>{TEXTOS_ARMA.era(l.cuenta, LADOS_T7[l.lado])}</p>
                    <p data-texto-retro style={TEXTO}><Plegable texto={l.retro} /></p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!comprobado && <Responder onClick={comprobar} deshabilitado={!todas}>{BOTONES_T7.comprobar}</Responder>}
      {comprobado && asiento && (
        <div className="fae-t7h-entra" data-asiento-completo style={{ marginTop: "12px" }}>
          <AsientoEnLineas lineas={asiento.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales acento={acento} />
        </div>
      )}
    </>
  );
}
