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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ESTADOS DE CALIFICACIÓN DEL REPASO (Kamogawa: una sola solución para
 * r5-1, r5-2, r5-3 y la r5-4 que viene). Ninguna pieza define los suyos.
 *
 * B4 de enganche.md: en Contabilidad el teal es DEBE y el ámbar es HABER. El
 * acierto va en neutro y lo dice la palabra (Veredicto), no el color. Son
 * los valores de r5-2 v2.1:
 *
 *   ok        borde 2 px #CBDCF2
 *   mal       borde 2 px coral
 *   revelada  borde 1,5 px discontinuo #CBDCF2 («ERA ESTE», en #F8F9FA)
 *
 * Una prueba sobre este archivo falla si ok o revelada usan teal o ámbar, y
 * otra si un archivo de repasoCap5/ vuelve a definir sus estados.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ESTADOS = {
  ok: { border: `2px solid ${C.hecho}`, background: "rgba(203,220,242,0.10)" },
  mal: { border: `2px solid ${C.coral}`, background: "rgba(231,111,81,0.13)" },
  revelada: { border: `1.5px dashed ${C.hecho}`, background: C.fondo },
};

/* La marca «ERA ESTE» sobre la respuesta revelada: en blanco, no en teal. */
export const MARCA_ERA_ESTE = { ...MARCA, color: C.texto };

/* Los puntos del final: acierto relleno #CBDCF2, error anillo coral (forma además de color). */
export const PUNTOS = {
  acierto: { background: C.hecho },
  error: { background: "transparent", border: `2px solid ${C.coral}` },
};

export function Punto({ ok, tam = 10 }) {
  return (
    <span
      aria-hidden="true"
      data-punto={ok ? "acierto" : "error"}
      data-forma={ok ? "relleno" : "anillo"}
      style={{ width: `${tam}px`, height: `${tam}px`, borderRadius: "50%", boxSizing: "border-box", flexShrink: 0, display: "inline-block", ...(ok ? PUNTOS.acierto : PUNTOS.error) }}
    />
  );
}

/*
 * La palabra debajo de cada pieza calificada (E3 de enganche.md): en blanco y
 * negro se sabe cuál falló. `textos` es { ok, mal }; las de cuenta y valor
 * están en src/data/repasoCap5Comun.js.
 */
export function Veredicto({ estado, textos }) {
  if (estado !== "ok" && estado !== "mal") return null;
  return (
    <span data-veredicto={estado} style={{ display: "block", marginTop: "4px", textAlign: "right", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.texto }}>
      {textos[estado]}
    </span>
  );
}

/*
 * La marca de UNA pieza de un renglón calificado (auditoría de Takamura,
 * paquete e5-mes-en-dos-cuentas, punto 4): su forma (punto relleno #CBDCF2 de
 * 10 px si está bien, anillo coral si está mal) y su palabra, en Inter 12/600.
 * Cada renglón lleva dos: la de la cuenta y la del valor.
 */
export function MarcaPieza({ estado, textos, pieza }) {
  if (estado !== "ok" && estado !== "mal") return null;
  return (
    <span data-marca-pieza={pieza} data-veredicto={estado} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: C.texto, whiteSpace: "nowrap" }}>
      <Punto ok={estado === "ok"} />
      {textos[estado]}
    </span>
  );
}
