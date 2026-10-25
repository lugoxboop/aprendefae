import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Relieve, N0, N1, N2 } from "./relieve.jsx";

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
 *     bloque del mensaje (fondo neutro, raya coral de 3 px). A los 0,7 s,
 *     «Iba aquí» en la correcta, con 2 px #F8F9FA, y la devolución del ítem
 *     como segundo párrafo del MISMO bloque
 *   · acierto: el bloque lleva solo la devolución, tras «Correcto.» (raya
 *     neutra)
 *   · al calificar, un solo desplazamiento para el tramo de la pastilla al
 *     mensaje (o al botón, si cabe): el de los Hacer de T4 (lote A), copiado
 *     por valor en `mostrarTramo`
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
const NEUTRO = "#B8C4D4";

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
  /*
   * Volumen (#4): en reposo, N1 en E1 (canto N0); la tocada, N2 + filo en E2
   * (canto N1). Acierto y error no cambian la elevación: cambian el borde.
   * La pastilla sale de la tarjeta (regla 6: nunca sobre una cara N2) y va
   * en la superficie, 4 px por debajo del bloque, en un hueco que está
   * siempre reservado: las opciones no se mueven al salir la pastilla.
   * La hoja de estilos del relieve (CSS_RELIEVE) la pone la pieza que la usa.
   */
  const tocada = estado === "bien" || estado === "mal";
  return (
    <div data-bloque-segunda={opcion.id}>
    <Relieve e={tocada ? 4 : 3} canto={tocada ? N1 : N0} filo={tocada} radio={forma.radio}>
    <button
      type="button"
      className="fae-rel-cara"
      data-opcion-segunda={opcion.id}
      data-estado={estado}
      aria-label={nombre}
      aria-disabled={contestado ? "true" : undefined}
      {...eventos}
      onClick={() => { if ((antesDeTocar && !antesDeTocar()) || contestado) return; onTocar(opcion.id); }}
      style={{
        display: "block", width: "100%", boxSizing: "border-box", textAlign: "left",
        /* Sin la pastilla dentro, la cara sola tiene que dar los 44 de toque. */
        minHeight: forma.altoMinimo ?? "44px", padding: `${py - (ancho - 1)}px ${px - (ancho - 1)}px`,
        borderRadius: forma.radio, background: tocada ? N2 : N1,
        border: `${ancho}px solid ${ancho === 1 ? "transparent" : color}`,
        color: estado === "apagada" ? "rgba(248,249,250,0.6)" : FAE.text,
        cursor: contestado ? "default" : "pointer", touchAction: "manipulation",
        ...forma.letra,
      }}
    >
      <span data-rotulo-segunda style={{ display: "block" }}>{opcion.rotulo}</span>
    </button>
    </Relieve>
    <span data-hueco-pastilla style={{ display: "flex", height: "20px", marginTop: "4px" }}>
      <Pastilla marca={marca} palabras={palabras} />
    </span>
    </div>
  );
}

/*
 * El mensaje de la segunda decisión: UN bloque, fondo neutro y raya de 3 px.
 *   · error: raya coral; el error es el primer párrafo y, cuando `lista`,
 *     la devolución es el segundo
 *   · acierto: raya neutra; solo la devolución, tras «Correcto.»
 * Es región viva, y enfocable (tabindex −1) para `mostrarTramo`.
 */
export const CORRECTO = "Correcto.";
export function MensajeSegunda({ s, lista, devolucion, letra, refMensaje }) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {s && (
        <div ref={refMensaje} tabIndex={-1} data-mensaje-segunda={s.ok ? "acierto" : "error"} style={{
          marginTop: "10px", padding: "11px 13px", borderRadius: "11px", outline: "none",
          background: NEUTRO_FONDO, borderLeft: `3px solid ${s.ok ? NEUTRO : FAE.coral}`,
        }}>
          {s.ok ? (
            <p data-texto-mensaje style={{ margin: 0, color: FAE.text, ...letra }}>
              <b data-palabra>{CORRECTO}</b> {devolucion}
            </p>
          ) : (
            <>
              <p data-texto-mensaje style={{ margin: 0, color: FAE.text, ...letra }}>
                <span style={SOLO_LECTOR}>Incorrecto: </span>{s.error}
              </p>
              {lista && <p data-texto-mensaje style={{ margin: "6px 0 0", color: FAE.text, ...letra }}>{devolucion}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * El tramo, copiado por valor de mostrarTramo de src/components/t4/hacerComun.jsx
 * (lote A; T4 es de otra célula y no se importa): desde la pastilla tocada
 * más alta hasta el pie del botón de avance si cabe en la ventana menos
 * 16 px (lo mínimo, con 8 px de margen, y el foco al botón); si no, hasta el
 * pie del mensaje, y el foco al mensaje. `boton` es null antes de que salga.
 */
export function mostrarTramo({ mensaje, pastillas = [], boton = null, enfocar = false }) {
  const V = mensaje?.ownerDocument?.defaultView;
  if (!mensaje || !V) return;
  const alto = V.innerHeight;
  const b = enfocar ? boton : null;
  const medir = () => {
    const tope = Math.min(mensaje.getBoundingClientRect().top, ...pastillas.map((p) => p.getBoundingClientRect().top));
    return { tope, pieMsg: mensaje.getBoundingClientRect().bottom, pieBoton: b ? b.getBoundingClientRect().bottom : null };
  };
  let g = medir();
  const alBoton = b != null && g.pieBoton - g.tope <= alto - 16;
  if (enfocar && !alBoton) { mensaje.focus?.(); g = medir(); }
  const pie = alBoton ? g.pieBoton : g.pieMsg;
  let dy = 0;
  if (pie - g.tope <= alto - 16) {
    if (g.tope < 8) dy = g.tope - 8;
    else if (pie > alto - 8) dy = pie - (alto - 8);
  } else dy = g.tope - 8;
  if (alBoton) b.focus?.({ preventScroll: true });
  if (!dy || !V.scrollBy) return;
  const quieto = V.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  V.scrollBy({ top: dy, behavior: quieto ? "auto" : "smooth" });
}

/* Las pastillas tocadas (acierto y error) dentro de un contenedor; «Iba aquí» no se tocó. */
export const pastillasTocadas = (el) => [...(el?.querySelectorAll?.('[data-pastilla="bien"], [data-pastilla="mal"]') ?? [])];
