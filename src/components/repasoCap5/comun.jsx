import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO COMÚN DEL REPASO DEL CAPÍTULO 5 (Célula E): los colores del paquete, la
 * marca, el panel de devolución con su «Siguiente». Lo usan r5-1 y r5-2.
 * Vivía dentro de RepasoCapitulo5View.jsx; sale aquí para que las dos
 * actividades lo compartan sin que la vista se importe a sí misma.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const C = {
  hecho: "#CBDCF2",
  navy: "#1D3557",
  fondo: "#0E1B2E",
  atenuado: "#B8C4D4",
  texto: FAE.text,
  ambar: FAE.ambar,
  teal: FAE.teal,
  coral: FAE.coral,
};

export const INTER = "Inter, sans-serif";
export const SORA = "Sora, sans-serif";
export const MARCA = { fontFamily: INTER, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.atenuado };
export const SOLO_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

/*
 * El panel de devolución. `r.textos` trae uno o dos párrafos (r5-2 muestra el
 * del debe y el del haber cuando fallan los dos); r5-1 pasa uno.
 * `lector` es lo que oye el lector de pantalla delante: «Correcto: » o
 * «Incorrecto: ».
 */
export function Devolucion({ r, lector }) {
  const ok = r?.ok;
  return (
    <div aria-live="polite" data-devolucion={r ? (ok ? "acierto" : "error") : "vacia"}>
      {r && (
        <div
          style={{
            marginTop: "14px", padding: "12px 14px", borderRadius: "12px",
            background: ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
            borderLeft: `3px solid ${ok ? C.atenuado : C.coral}`,
          }}
        >
          {r.textos.map((t, k) => (
            <p key={k} data-parrafo-devolucion style={{ margin: k ? "10px 0 0" : 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>
              {k === 0 && <span style={SOLO_LECTOR}>{ok ? lector.acierto : lector.error}</span>}
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function BotonSiguiente({ onClick, botonRef, texto }) {
  return (
    <button
      ref={botonRef}
      type="button"
      onClick={onClick}
      data-siguiente
      style={{
        marginTop: "14px", width: "100%", minHeight: "44px", padding: "13px 18px", borderRadius: "999px", cursor: "pointer",
        background: C.ambar, border: "none", color: C.navy, fontFamily: SORA, fontSize: "14px", fontWeight: 700,
      }}
    >
      {texto}
    </button>
  );
}
