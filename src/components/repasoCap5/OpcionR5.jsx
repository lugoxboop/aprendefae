import { C, INTER, MARCA, ESTADOS } from "./comun.jsx";
import { INTERFAZ_R5_1 } from "../../data/repasoCap5Cruzado.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA OPCIÓN DE r5-1 v2 (Célula E).
 *
 * No es `Opcion` de corazon/juego.jsx: esa pinta el acierto en teal, y en
 * Contabilidad el teal es DEBE (decisión 2 del paquete; B4 de enganche.md).
 * Los estados son los de §e del diseño, y cada uno lleva forma y palabra, no
 * solo color:
 *
 *   correcta   borde 2 px #CBDCF2 · círculo relleno · píldora «Correcta»
 *   incorrecta borde 2 px coral   · anillo coral     · píldora «Incorrecta»
 *   revelada   borde 1,5 px discontinuo #CBDCF2 · círculo relleno · «Era esta»
 *
 * `enFigura` pone la marca «EN LA FIGURA» en la fila que la figura reproduce
 * (pantallas 1, 2 y 6, después de responder).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los bordes son los estados comunes del repaso (comun.jsx); aquí solo la forma y la palabra. */
export const ESTADOS_OPCION = {
  correcta: { borde: ESTADOS.ok.border, forma: "relleno", color: C.hecho, palabra: INTERFAZ_R5_1.correcta, pildora: { fondo: C.hecho, texto: C.fondo } },
  incorrecta: { borde: ESTADOS.mal.border, forma: "anillo", color: C.coral, palabra: INTERFAZ_R5_1.incorrecta, pildora: { fondo: C.coral, texto: C.fondo } },
  revelada: { borde: ESTADOS.revelada.border, forma: "relleno", color: C.hecho, palabra: INTERFAZ_R5_1.eraEsta, pildora: { fondo: C.hecho, texto: C.fondo } },
};

const SIN_ESTADO = { borde: "1.5px solid rgba(184,196,212,0.45)" };

export function Pildora({ estado }) {
  const e = ESTADOS_OPCION[estado];
  return (
    <span data-pildora={estado} style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", background: e.pildora.fondo, color: e.pildora.texto, fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "18px", whiteSpace: "nowrap" }}>
      {e.palabra}
    </span>
  );
}

/* El marcador de la izquierda: anillo vacío antes de responder; luego, la forma del estado. */
function Marcador({ estado }) {
  const e = ESTADOS_OPCION[estado];
  const base = { width: "18px", height: "18px", borderRadius: "50%", boxSizing: "border-box", flexShrink: 0, marginTop: "2px" };
  if (!e) return <span aria-hidden="true" data-marcador="vacio" style={{ ...base, border: "2px solid rgba(184,196,212,0.6)" }} />;
  return (
    <span
      aria-hidden="true"
      data-marcador={e.forma}
      style={{ ...base, ...(e.forma === "relleno" ? { background: e.color } : { border: `2px solid ${e.color}` }) }}
    />
  );
}

export function OpcionR5({ estado = null, enFigura = false, deshabilitada = false, onClick, children, etiqueta, botonRef, extra = {} }) {
  const e = ESTADOS_OPCION[estado] ?? SIN_ESTADO;
  return (
    <button
      ref={botonRef}
      type="button"
      data-estado={estado ?? "ninguno"}
      data-en-figura={enFigura ? "si" : "no"}
      aria-label={etiqueta}
      aria-disabled={deshabilitada ? "true" : undefined}
      onClick={deshabilitada ? undefined : onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: "12px", width: "100%", minHeight: "56px", boxSizing: "border-box",
        padding: "12px 14px", borderRadius: "12px", background: C.navy, border: e.borde, textAlign: "left",
        color: C.texto, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", cursor: deshabilitada ? "default" : "pointer",
        ...extra,
      }}
    >
      <Marcador estado={estado} />
      <span style={{ flex: 1, minWidth: 0 }}>
        {(estado || enFigura) && (
          <span data-cabecera-opcion style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            {estado && <Pildora estado={estado} />}
            {enFigura && <span data-marca-en-figura style={{ ...MARCA, fontSize: "10.5px" }}>{INTERFAZ_R5_1.enLaFigura}</span>}
          </span>
        )}
        {children}
      </span>
    </button>
  );
}
