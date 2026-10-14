import { useEffect, useId, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { CONSIGNA_CAPA_3, CONTEXTO_CAPA_3, PAQUETES, FINAL_CAPA_3, PIE_FINAL_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "./EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 · CAPA 3 · «AHORA PRUEBE USTED» — dos paquetes de
 * acciones (guía de Mai v3, §5).
 *
 * Tocar un paquete revela su texto; la caja no se vuelve a cerrar. Con los
 * dos abiertos, en cualquier orden, aparece el bloque final. Sin color, sin
 * sonido y sin ícono de acierto o error: A y B se ven idénticos antes y
 * después; lo único que cambia es que aparece el texto (nota de Futaba).
 *
 * El chevrón es el de la guía (20×20, trazo de 2 px en color bordes). La
 * guía pedía usar el de la actividad 3 del Tema 3 si existía con otro
 * dibujo; ese componente (MismoHecho) no lleva chevrón.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const TEXTO = FAE.text;
const BORDES = COLOR.neutro; // #B8C4D4
const ATENUADO = "rgba(184,196,212,.50)";
/* El pie de fuente, con el estilo del Tema 3. */
const PIE = { margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };
const LECTURA = { margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, fontWeight: 400, color: TEXTO };

function Chevron() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style={{ flex: "0 0 auto" }}>
      <polyline points="5,8 10,13 15,8" fill="none" stroke={BORDES} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Paquete({ paquete, abierto, onAbrir }) {
  const id = useId();
  return (
    <div data-paquete={paquete.id} style={{ border: `1px solid ${BORDES}`, borderRadius: "12px" }}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-disabled={abierto || undefined}
        aria-controls={id}
        onClick={() => { if (!abierto) onAbrir(); }}
        style={{
          display: "block", width: "100%", minHeight: "44px", padding: "12px 14px", boxSizing: "border-box",
          background: "transparent", border: "none", borderRadius: "12px", textAlign: "left",
          cursor: abierto ? "default" : "pointer", color: TEXTO,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.35 }}>{paquete.nombre}</span>
          {/* Al abrirse desaparece: ya no hay nada más que abrir. */}
          {!abierto && <Chevron />}
        </span>
        <span style={{ ...LECTURA, display: "block", marginTop: "4px" }}>{paquete.descripcion}</span>
      </button>
      {/* La revelación va fuera del botón, en la misma caja; la región viva existe desde antes. */}
      <div id={id} data-revela={paquete.id} aria-live="polite">
        {abierto && (
          <div style={{ margin: "0 14px 12px", paddingTop: "10px", borderTop: `1px solid ${ATENUADO}` }}>
            <p style={LECTURA}>{paquete.revela}</p>
            <p data-pie style={PIE}>{paquete.pie}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DosPaquetes() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const final = useRef(null);
  const losDos = PAQUETES.every((p) => abiertos.has(p.id));

  useEffect(() => {
    if (losDos) final.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [losDos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-t5 className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{CONSIGNA_CAPA_3}</p>
      <p style={{ ...LECTURA, marginTop: "12px" }}>{CONTEXTO_CAPA_3}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {PAQUETES.map((p) => (
          <Paquete key={p.id} paquete={p} abierto={abiertos.has(p.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(p.id))} />
        ))}
      </div>
      <div ref={final} data-final aria-live="polite">
        {losDos && (
          <div style={{
            marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy,
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {FINAL_CAPA_3.map((t) => <p key={t} style={LECTURA}>{t}</p>)}
            <p data-pie style={{ ...PIE, margin: 0 }}>{PIE_FINAL_CAPA_3}</p>
          </div>
        )}
      </div>
    </div>
  );
}
