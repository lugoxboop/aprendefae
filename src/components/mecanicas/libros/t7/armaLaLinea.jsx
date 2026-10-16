import { createContext, useContext, useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { formatearCifra, leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { AsientoEnLineas, ElegirLado, Responder } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { TEXTOS_ARMA, retroDeLinea, lineaConPista } from "../../../../contabilidad/armaLaLinea.js";
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
 *                  era y por qué no era la elegida (la retroalimentación del
 *                  distractor, o la de la línea si solo falló el lado) y, si se
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
 *
 * LA ESCALERA (C2), opcional (T5 N5; N7 la reusará). Todo lo de abajo es
 * opcional y, sin pasarlo, cada pieza se comporta exactamente como antes:
 *
 *   DistintivoIntento   contexto con el texto del distintivo («Vale el primer
 *                       intento» en vez de «Un intento»); UnIntento también
 *                       acepta `texto`
 *   CasillaCifra        `extra` (algo que va junto a la casilla, como Ganó o
 *                       Perdió) y `extraListo` (si falta elegirlo, «Comprobar»
 *                       sigue apagado). Para la escalera basta con que la
 *                       pieza no la dé por comprobada tras el primer error:
 *                       la cifra escrita sigue ahí y se puede corregir
 *   LineasConCuenta     `escalera`: cada línea lleva la cuenta de sus errores;
 *                       al primero sale su pista y la línea se vacía para
 *                       volver a armarla; al segundo, «Era: …» y su porqué, y
 *                       se cierra. Las que quedan bien se cierran con ✓ en
 *                       neutro. Un solo «Comprobar» para las abiertas.
 *                       onComprobar(resultados, { terminado }), con el número
 *                       de `intento` de cada línea: la pieza suma solo el 1.
 *                       El foco va al primer mensaje nuevo o, al terminar, al
 *                       asiento completo
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ EL DISTINTIVO ═══════════ */

export const DistintivoIntento = createContext(TEXTOS_ARMA.unIntento);

export function UnIntento({ texto = null }) {
  const delContexto = useContext(DistintivoIntento);
  return (
    <span data-un-intento style={{
      display: "inline-flex", alignItems: "center", flex: "none", height: "22px", padding: "0 8px", borderRadius: "999px",
      border: "1px solid rgba(248,249,250,0.22)", color: "#A8B6C8",
      fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {texto ?? delContexto}
    </span>
  );
}

/* El contador con su distintivo a la derecha. `contador` es el Pulsos de la pieza, que no se toca. */
/*
 * Con un distintivo más largo que «Un intento» (DistintivoIntento, p. ej.
 * «Vale el primer intento»), a 320 px el contador y el distintivo no caben en
 * un renglón y se montaban: entonces el distintivo baja a su propio renglón.
 * Con el de siempre, el contador queda exactamente como antes.
 */
export function ContadorConIntento({ children }) {
  const largo = useContext(DistintivoIntento) !== TEXTOS_ARMA.unIntento;
  return (
    <div data-contador-intento style={{ display: "flex", alignItems: "center", gap: "10px", ...(largo ? { flexWrap: "wrap", rowGap: "6px" } : {}) }}>
      <div style={{ flex: "1 1 auto", minWidth: largo ? "max-content" : 0 }}>{children}</div>
      <UnIntento />
    </div>
  );
}

/* ═══════════ LA CASILLA DE CIFRA ═══════════ */

export function CasillaCifra({ id, onComprobar, comprobado, etiqueta, extra = null, extraListo = true }) {
  const [texto, setTexto] = useState("");
  const valor = leerCifra(texto);
  const listo = valor !== null && extraListo;
  return (
    <div data-casilla-cifra={id}>
      {extra}
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
      {!comprobado && <Responder onClick={() => listo && onComprobar(valor)} deshabilitado={!listo}>{BOTONES_T7.comprobar}</Responder>}
    </div>
  );
}

/* ═══════════ «ARMA LA LÍNEA» ═══════════ */

/* `neutra` (escalera): la buena se marca con ✓ y borde claro, no con teal, que es el debe; la mala, con ✗ y coral. */
function Ficha({ texto, elegida, correcta, error, deshabilitado, onElegir, neutra = false }) {
  const borde = correcta ? (neutra ? "#F8F9FA" : FAE.teal) : error ? FAE.coral : elegida ? "#F8F9FA" : "rgba(248,249,250,0.22)";
  return (
    <button type="button" data-ficha-cuenta={texto} aria-pressed={elegida} disabled={deshabilitado} onClick={onElegir}
      style={{
        appearance: "none", minHeight: "44px", padding: "8px 12px", borderRadius: "999px", textAlign: "left",
        border: `${elegida || correcta || error ? 2 : 1}px solid ${borde}`, background: elegida ? "rgba(184,196,212,0.12)" : "rgba(14,27,46,0.5)",
        color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.3, cursor: deshabilitado ? "default" : "pointer", overflowWrap: "anywhere",
      }}>
      {neutra && correcta && <span data-marca-ficha="bien" aria-hidden="true" style={{ fontWeight: 700, marginRight: "6px" }}>✓</span>}
      {neutra && error && <span data-marca-ficha="mal" aria-hidden="true" style={{ fontWeight: 700, marginRight: "6px", color: FAE.coral }}>✗</span>}
      {neutra && correcta && <span style={SOLO_LECTOR}>Correcta: </span>}
      {neutra && error && <span style={SOLO_LECTOR}>Tu respuesta, incorrecta: </span>}
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
export function LineasConCuenta({ escalera = false, ...props }) {
  return escalera ? <LineasConCuentaEscalera {...props} /> : <LineasUnIntento {...props} />;
}

function LineasUnIntento({ lineas, asiento = null, onComprobar, comprobado, acento = FAE.ambar }) {
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
                    <p data-texto-retro style={TEXTO}><Plegable texto={retroDeLinea(l, cuentas[l.id])} /></p>
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

/*
 * ═══════════ «ARMA LA LÍNEA» CON ESCALERA ═══════════
 *
 * Cada línea: { id, cuenta, valor, lado, banco, pista, retro }. Un solo
 * «Comprobar» califica las líneas abiertas. Una línea bien se cierra (✓ en
 * neutro). Mal por primera vez: sale su pista (que no nombra cuenta ni lado)
 * y la línea se vacía para volver a armarla. Mal por segunda vez: «Era: …» y
 * su porqué, y se cierra con la buena marcada. El mensaje de una línea habla
 * solo de esa línea: no se dice cuál de las otras está bien o mal mientras
 * sigan abiertas, más allá de su propio veredicto.
 */
function LineasConCuentaEscalera({ lineas, asiento = null, onComprobar, comprobado, acento = FAE.ambar }) {
  const [cuentas, setCuentas] = useState({});
  const [lados, setLados] = useState({});
  const [fallos, setFallos] = useState({});
  const [bien, setBien] = useState({});
  const [ronda, setRonda] = useState({ n: 0, ids: [] });
  const caja = useRef(null);

  const cerradaCon = (l, f, b) => Boolean(b[l.id]) || ((f[l.id] ?? 0) >= 1 && !lineaConPista(l, f[l.id]));
  const cerrada = (l) => comprobado || cerradaCon(l, fallos, bien);
  const abiertas = lineas.filter((l) => !cerrada(l));
  const todas = abiertas.length > 0 && abiertas.every((l) => cuentas[l.id] && lados[l.id]);
  const terminado = comprobado || lineas.every((l) => cerradaCon(l, fallos, bien));

  const comprobar = () => {
    if (terminado || !todas) return;
    const f = { ...fallos };
    const b = { ...bien };
    const resultados = abiertas.map((l) => {
      const ok = cuentas[l.id] === l.cuenta && lados[l.id] === l.lado;
      const intento = (fallos[l.id] ?? 0) + 1;
      if (ok) b[l.id] = true;
      else f[l.id] = (f[l.id] ?? 0) + 1;
      return { linea: l, elegido: `${cuentas[l.id]}|${lados[l.id]}`, ok, intento };
    });
    /* La que vuelve a armarse se vacía; la que se cierra conserva lo elegido, para marcarlo. */
    const vaciar = (x) => { const n = { ...x }; for (const r of resultados) if (!r.ok && lineaConPista(r.linea, f[r.linea.id])) delete n[r.linea.id]; return n; };
    setCuentas(vaciar); setLados(vaciar);
    setFallos(f); setBien(b);
    setRonda((r) => ({ n: r.n + 1, ids: resultados.filter((x) => !x.ok).map((x) => x.linea.id) }));
    onComprobar(resultados, { terminado: lineas.every((l) => cerradaCon(l, f, b)) });
  };

  /* El foco, al primer mensaje nuevo; si no hay, al asiento completo. */
  useEffect(() => {
    if (!ronda.n) return;
    const panel = ronda.ids.map((id) => caja.current?.querySelector(`[data-linea-cuenta="${id}"] [data-panel]`)).find(Boolean);
    (panel ?? caja.current?.querySelector("[data-asiento-completo]"))?.focus();
  }, [ronda]);

  return (
    <div ref={caja} data-escalera>
      <div style={{ display: "grid", gap: "10px" }}>
        {lineas.map((l, k) => {
          const cerrada_ = cerrada(l);
          const n = fallos[l.id] ?? 0;
          const conPista = !cerrada_ && n >= 1;
          const revelada = cerrada_ && !bien[l.id] && n >= 1;
          return (
            <div key={l.id} data-linea-cuenta={l.id} data-estado={bien[l.id] ? "bien" : revelada ? "respuesta" : conPista ? "pista" : "abierta"}
              style={{ padding: "10px 12px", borderRadius: "11px", border: `${bien[l.id] ? 2 : 1}px solid ${bien[l.id] ? "rgba(248,249,250,0.5)" : "rgba(248,249,250,0.12)"}` }}>
              <p style={{ ...TEXTO, margin: "0 0 8px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <span data-rotulo-linea style={{ color: "#A8B6C8" }}>{`${TEXTOS_ARMA.eligeCuenta} · ${k + 1}`}</span>
                <span data-valor style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {pesos(l.valor)}
                </span>
              </p>
              <div role="group" aria-label={`${TEXTOS_ARMA.eligeCuenta} ${k + 1}, ${pesos(l.valor)}`} style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                {l.banco.map((c) => (
                  <Ficha key={c} texto={c} neutra elegida={cuentas[l.id] === c} deshabilitado={cerrada_}
                    correcta={cerrada_ && c === l.cuenta} error={revelada && cuentas[l.id] === c && c !== l.cuenta}
                    onElegir={() => !cerrada_ && setCuentas((x) => ({ ...x, [l.id]: c }))} />
                ))}
              </div>
              <div role="group" aria-label={`Línea ${k + 1}: Debe o Haber`}>
                {/* Bien al primer «Comprobar» o al segundo: el acierto lo marcan la ✓ de la ficha y el borde de la línea, en neutro, no el color del lado. */}
                <ElegirLado elegido={lados[l.id] ?? null} correcto={revelada ? l.lado : null} deshabilitado={cerrada_}
                  onElegir={(lado) => !cerrada_ && setLados((x) => ({ ...x, [l.id]: lado }))} nombres={LADOS_T7} />
              </div>
              <div data-retro-linea aria-live="polite">
                {(conPista || revelada) && (
                  <div key={`${n}`} tabIndex={-1} className="fae-t7h-entra" data-panel={conPista ? "pista" : "error"} style={{
                    marginTop: "10px", padding: "11px 13px", borderRadius: "11px", outline: "none",
                    background: "rgba(231,111,81,0.13)", borderLeft: `3px solid ${FAE.coral}`,
                  }}>
                    <span style={SOLO_LECTOR}>Incorrecto. </span>
                    {revelada && <p data-era style={{ ...TEXTO, margin: "0 0 6px", fontWeight: 600 }}>{TEXTOS_ARMA.era(l.cuenta, LADOS_T7[l.lado])}</p>}
                    <p data-texto-retro style={TEXTO}><Plegable texto={conPista ? l.pista : l.retro} /></p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!terminado && <Responder onClick={comprobar} deshabilitado={!todas}>{BOTONES_T7.comprobar}</Responder>}
      {terminado && asiento && (
        <div className="fae-t7h-entra" data-asiento-completo tabIndex={-1} style={{ marginTop: "12px", outline: "none" }}>
          <AsientoEnLineas lineas={asiento.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales acento={acento} />
        </div>
      )}
    </div>
  );
}
