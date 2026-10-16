import { C, INTER, MARCA, ESTADOS, Pastilla } from "./comun.jsx";
import { INTERFAZ_R5_1 } from "../../data/repasoCap5Cruzado.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA OPCIÓN DEL REPASO (Célula E), al estándar único de Hacer (PROMPT
 * MAESTRO §4.1 y §4.2). Va directo sobre el Panel, sin relleno:
 *
 *   reposo     contorno 1 px rgba(248,249,250,.35)
 *   correcta   2 px #F8F9FA · pastilla Check + «Correcto»
 *   incorrecta 2 px coral, sobre su tinte · pastilla X + «No va aquí»
 *   revelada   2 px #F8F9FA · «Iba aquí», sin ícono
 *
 * `enFigura` pone la marca «EN LA FIGURA» en la fila que la figura reproduce
 * (las pantallas con figura, después de responder).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El estado de la opción y el de su pastilla (los de comun.jsx). */
const PIEZA = { correcta: "ok", incorrecta: "mal", revelada: "revelada" };

export function Pildora({ estado }) {
  return <Pastilla estado={PIEZA[estado]} />;
}

export function OpcionR5({ estado = null, enFigura = false, deshabilitada = false, onClick, children, etiqueta, botonRef, extra = {} }) {
  const e = ESTADOS[PIEZA[estado]] ?? ESTADOS.reposo;
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
        display: "block", width: "100%", minHeight: "56px", boxSizing: "border-box",
        padding: "12px 14px", borderRadius: "12px", background: e.background, border: e.border, textAlign: "left",
        color: C.texto, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", cursor: deshabilitada ? "default" : "pointer",
        ...extra,
      }}
    >
      {(estado || enFigura) && (
        <span data-cabecera-opcion style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          {estado && <Pildora estado={estado} />}
          {enFigura && <span data-marca-en-figura style={MARCA}>{INTERFAZ_R5_1.enLaFigura}</span>}
        </span>
      )}
      {children}
    </button>
  );
}
