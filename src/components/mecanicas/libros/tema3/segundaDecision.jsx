import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · LA SEGUNDA DECISIÓN DE LAS ACTS. 1 Y 2 (diseño de Hanayama).
 *
 * Solo la usan IngresoOCobro y CuandoSeCausa; no es un componente compartido.
 *
 *   · aparece donde estaba la primera decisión y la reemplaza; la ficha del
 *     hecho sigue arriba
 *   · un toque califica (prompt maestro §4.3): sin «Colocar la ficha» ni
 *     «Comprobar». Es Hacer: un intento
 *   · acierto: la opción con 2 px #F8F9FA y la pastilla «Correcto» (Check)
 *   · error: lo tocado con 2 px coral y «No va aquí» (X), y el error en el
 *     bloque (fondo neutro, raya coral de 3 px). A los 0,7 s, «Iba aquí» en la
 *     correcta, con 2 px #F8F9FA. Después, la devolución del ítem
 *   · la pastilla va dentro de la opción, a todo el ancho, en un hueco de
 *     20 px reservado: no mueve nada. En reposo: 1 px rgba(248,249,250,.35),
 *     sin relleno. El borde de 2 px se come 1 px del relleno interior, así el
 *     texto no salta
 *   · la pastilla, copiada por valor de la de Contabilidad (§4.2): 20 px de
 *     alto, fondo del tablero, 1 px blanco (coral en el error), Inter 600 12
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const RETARDO_IBA_MS = 700;
const REPOSO = "rgba(248,249,250,0.35)";
const BLANCO = "#F8F9FA";
const NEUTRO_FONDO = "rgba(184,196,212,0.12)";

/*
 * El estado de la segunda decisión de un ítem. `elegir(id, ok, correcta, error)`
 * califica; `lista` dice si ya se puede mostrar la devolución (al acierto, de
 * una; al error, cuando sale «Iba aquí»).
 */
export function useSegunda() {
  const [s, setS] = useState(null);
  const [iba, setIba] = useState(false);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const elegir = (elegida, ok, correcta, error) => {
    if (s) return false;
    setS({ elegida, ok, correcta, error });
    if (!ok) {
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setIba(true), RETARDO_IBA_MS);
    }
    return true;
  };
  const reiniciar = () => { clearTimeout(reloj.current); setS(null); setIba(false); };
  const estadoDe = (id) => {
    if (!s) return "reposo";
    if (id === s.elegida) return s.ok ? "bien" : "mal";
    if (id === s.correcta && iba) return "era";
    return "apagada";
  };
  return { s, lista: Boolean(s && (s.ok || iba)), elegir, reiniciar, estadoDe };
}

export function Pastilla({ marca, palabras }) {
  if (!marca) return null;
  return (
    <span data-pastilla={marca} aria-hidden="true" style={{
      display: "inline-flex", width: "max-content", maxWidth: "100%", alignItems: "center", gap: "4px",
      height: "20px", boxSizing: "border-box", padding: "0 7px", borderRadius: "999px",
      background: FAE.bg, border: `1px solid ${marca === "mal" ? FAE.coral : BLANCO}`, color: BLANCO,
      font: '600 12px/18px "Inter", sans-serif', whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      {marca === "bien" && <Check size={16} strokeWidth={2.5} aria-hidden="true" style={{ flex: "none" }} />}
      {marca === "mal" && <X size={16} strokeWidth={2.5} aria-hidden="true" style={{ flex: "none" }} />}
      <span>{palabras[marca]}</span>
    </span>
  );
}

/*
 * Una opción de la segunda decisión, a todo el ancho. `forma` copia la de la
 * primera decisión de su pieza: el relleno, el radio, la letra y el alto
 * mínimo. `eventos` (onPointer*) y `antesDeTocar` dejan que la pieza filtre
 * el arrastre, como en su línea: si `antesDeTocar()` da falso, no cuenta.
 */
export function OpcionSegunda({ opcion, estado, palabras, onTocar, forma, eventos = {}, antesDeTocar = null }) {
  const contestado = estado !== "reposo";
  const ancho = estado === "bien" || estado === "mal" || estado === "era" ? 2 : 1;
  const color = estado === "mal" ? FAE.coral : ancho === 2 ? BLANCO : REPOSO;
  const marca = estado === "bien" || estado === "mal" || estado === "era" ? estado : null;
  const nombre = marca ? `${opcion.rotulo}, ${palabras[marca].toLowerCase()}` : opcion.rotulo;
  const [py, px] = forma.relleno;
  return (
    <button
      type="button"
      data-opcion-segunda={opcion.id}
      data-estado={estado}
      aria-label={nombre}
      aria-disabled={contestado ? "true" : undefined}
      {...eventos}
      onClick={() => { if ((antesDeTocar && !antesDeTocar()) || contestado) return; onTocar(opcion.id); }}
      style={{
        display: "block", width: "100%", boxSizing: "border-box", textAlign: "left",
        minHeight: forma.altoMinimo, padding: `${py - (ancho - 1)}px ${px - (ancho - 1)}px`,
        borderRadius: forma.radio, background: "transparent",
        border: `${ancho}px solid ${color}`,
        color: estado === "apagada" ? "rgba(248,249,250,0.6)" : FAE.text,
        cursor: contestado ? "default" : "pointer", touchAction: "manipulation",
        ...forma.letra,
      }}
    >
      <span data-rotulo-segunda style={{ display: "block" }}>{opcion.rotulo}</span>
      <span data-hueco-pastilla style={{ display: "flex", height: "20px", marginTop: "4px" }}>
        <Pastilla marca={marca} palabras={palabras} />
      </span>
    </button>
  );
}

/* El error de la segunda decisión: fondo neutro y raya coral de 3 px. */
export function BloqueError({ texto, letra }) {
  if (!texto) return null;
  return (
    <div data-error-segunda style={{
      marginTop: "10px", padding: "11px 13px", borderRadius: "11px",
      background: NEUTRO_FONDO, borderLeft: `3px solid ${FAE.coral}`,
    }}>
      <p style={{ margin: 0, color: FAE.text, ...letra }}>
        <span style={SOLO_LECTOR}>Incorrecto: </span>{texto}
      </p>
    </div>
  );
}
