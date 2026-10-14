import { useEffect, useId, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { CONSIGNA_CAPA_3_T6, HECHOS_T6, FINAL_CAPA_3_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 3 · «AHORA PRUEBE USTED» — seis hechos (guía v1
 * de Mai, §5, con la corrección de la v2 en el pie del bloque final).
 *
 * Las cajas de T5 · A1, con seis en lugar de dos y sin contexto. Tocar un
 * hecho revela si lo que deben los clientes sube, baja o no cambia; la caja no
 * se vuelve a cerrar. Con los seis abiertos aparece el bloque final. Sin color
 * de acierto ni de error y sin teal ni ámbar: el resultado lo dice la palabra.
 *
 * Cada caja y el bloque final llevan su pie de fuente (★ de Futaba, en los
 * datos); un pie en null no se pinta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
const LECTURA = { margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, fontWeight: 400, color: FAE.text };
const PIE = { margin: "8px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };

function Chevron() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style={{ flex: "0 0 auto" }}>
      <polyline points="5,8 10,13 15,8" fill="none" stroke={BORDES} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Hecho({ hecho, abierto, onAbrir }) {
  const id = useId();
  return (
    <div data-hecho={hecho.id} style={{ border: `1px solid ${BORDES}`, borderRadius: "12px" }}>
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
        <span style={LECTURA}>{hecho.hecho}</span>
        {!abierto && <Chevron />}
      </button>
      <div id={id} data-revela={hecho.id} aria-live="polite">
        {abierto && (
          <div style={{ margin: "0 14px 12px", paddingTop: "10px", borderTop: `1px solid ${ATENUADO}` }}>
            <p style={LECTURA}>{hecho.revela}</p>
            {hecho.pie && <p data-pie style={PIE}>{hecho.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SeisHechos() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const final = useRef(null);
  const todos = HECHOS_T6.every((x) => abiertos.has(x.id));

  useEffect(() => {
    if (todos) final.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-t6 className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{CONSIGNA_CAPA_3_T6}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {HECHOS_T6.map((x) => (
          <Hecho key={x.id} hecho={x} abierto={abiertos.has(x.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(x.id))} />
        ))}
      </div>
      <div ref={final} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy }}>
            <p style={LECTURA}>{FINAL_CAPA_3_T6.texto}</p>
            {FINAL_CAPA_3_T6.pie && <p data-pie style={PIE}>{FINAL_CAPA_3_T6.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
