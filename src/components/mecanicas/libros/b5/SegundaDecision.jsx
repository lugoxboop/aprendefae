import { FAE } from "../../../../theme.js";
import { estiloE4, CORRECTA, TACHADA, REVELADA, TACHADO } from "./MarcasE4.jsx";
import { Pastilla, claseDe, REPOSO_B, CORAL_B } from "./Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D4 · LA SEGUNDA DECISIÓN DE B (lote 19, P2 de Mai): las piezas comunes.
 *
 * La segunda decisión pregunta otra cosa y mueve un modelo pequeño; cada
 * opción deja un dibujo distinto. Tras responder, el modelo muestra lo
 * correcto y, si hubo error, lo elegido queda como fantasma (borde discontinuo
 * coral). Las opciones son botones con `aria-pressed` y las marcas E4 del
 * estándar 6d (Correcto · No va aquí · Iba aquí). Las usan las fichas de t5-a1
 * y t6-a1 (FichasUnNivel) y la elección de t6-a4 (EligeUnaOpcion).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const FANTASMA = `1.5px dashed ${CORAL_B}`;
export const CURVA_B = "cubic-bezier(.3,.9,.4,1)";

/* La marca de una opción tras lo elegido. */
export function marcaSegunda(id, elegidas, correcta, fin) {
  if (elegidas.includes(id)) return id === correcta ? CORRECTA : TACHADA;
  if (fin && id === correcta) return REVELADA;
  return null;
}

/* El fantasma: la última opción equivocada, si al final hubo error. */
export const fantasmaDe = (elegidas, correcta, fin) => (fin ? elegidas.filter((x) => x !== correcta).at(-1) ?? null : null);

export function PreguntaSegunda({ texto }) {
  return <p data-pregunta-segunda style={{ margin: "12px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text }}>{texto}</p>;
}

/* Las opciones: un botón de 44 px como mínimo por opción, con su miniatura (aria-hidden) si la trae. */
export function OpcionesSegunda({ opciones, elegidas, correcta, fin, activa, onElegir, Mini = null, columnas = 1 }) {
  return (
    <div data-opciones-segunda role="group" style={{ display: "grid", gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`, gap: "6px" }}>
      {opciones.map((o) => {
        const marca = marcaSegunda(o.id, elegidas, correcta, fin);
        const puede = activa && !elegidas.includes(o.id);
        return (
          <button key={o.id} type="button" data-opcion-segunda={o.id} data-marca={marca ?? ""} aria-pressed={elegidas.includes(o.id)}
            disabled={!puede} onClick={puede ? () => onElegir(o.id) : undefined} className={claseDe(marca)}
            style={{
              boxSizing: "border-box", minHeight: "44px", width: "100%", padding: "6px 10px", borderRadius: "10px", background: "transparent",
              display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", textAlign: "left", cursor: puede ? "pointer" : "default", color: FAE.text,
              ...estiloE4(marca, REPOSO_B),
            }}>
            {Mini && <span aria-hidden="true" style={{ flex: "none", display: "flex" }}><Mini id={o.id} /></span>}
            <span style={{ flex: "1 1 120px", minWidth: 0, fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, lineHeight: "19px", ...(marca === TACHADA ? TACHADO : null) }}>{o.texto}</span>
            <Pastilla marca={marca} />
          </button>
        );
      })}
    </div>
  );
}
