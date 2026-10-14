import { useEffect, useId, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · CAPA 3 · LAS CAJAS QUE SE ABREN (Célula B).
 *
 * Las cajas de T5 · A1, sacadas de SeisHechos (pieza 1) para que la pieza 2
 * (los dos métodos) no las copie. Tocar una caja revela su texto y no se
 * vuelve a cerrar; con todas abiertas aparece el bloque final. Sin color de
 * acierto ni de error y sin teal ni ámbar: el resultado lo dice la palabra.
 * Cada caja y el bloque final llevan su pie de fuente; un pie en null no se
 * pinta. `estiloTitulo` deja que cada pieza escriba el nombre de la caja con
 * su letra (los hechos en Inter, los métodos en Sora 14/600).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
export const LECTURA = { margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, fontWeight: 400, color: FAE.text };
export const PIE = { margin: "8px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };

function Chevron() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style={{ flex: "0 0 auto" }}>
      <polyline points="5,8 10,13 15,8" fill="none" stroke={BORDES} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Caja({ caja, abierto, onAbrir, estiloTitulo = LECTURA }) {
  const id = useId();
  return (
    <div data-hecho={caja.id} style={{ border: `1px solid ${BORDES}`, borderRadius: "12px" }}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-disabled={abierto || undefined}
        aria-controls={id}
        onClick={() => { if (!abierto) onAbrir(); }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
          width: "100%", minHeight: "44px", padding: "12px 14px", boxSizing: "border-box",
          background: "transparent", border: "none", borderRadius: "12px", textAlign: "left",
          cursor: abierto ? "default" : "pointer", color: FAE.text,
        }}
      >
        <span style={estiloTitulo}>{caja.titulo}</span>
        {!abierto && <Chevron />}
      </button>
      <div id={id} data-revela={caja.id} aria-live="polite">
        {abierto && (
          <div style={{ margin: "0 14px 12px", paddingTop: "10px", borderTop: `1px solid ${ATENUADO}` }}>
            <p style={LECTURA}>{caja.revela}</p>
            {caja.pie && <p data-pie style={PIE}>{caja.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CajasQueRevelan({ consigna, cajas, final, estiloTitulo = LECTURA, atributos = {} }) {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const bloqueFinal = useRef(null);
  const todos = cajas.every((x) => abiertos.has(x.id));

  useEffect(() => {
    if (todos) bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div {...atributos} className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{consigna}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {cajas.map((x) => (
          <Caja key={x.id} caja={x} estiloTitulo={estiloTitulo} abierto={abiertos.has(x.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(x.id))} />
        ))}
      </div>
      <div ref={bloqueFinal} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy }}>
            <p style={LECTURA}>{final.texto}</p>
            {final.pie && <p data-pie style={PIE}>{final.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
