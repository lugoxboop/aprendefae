/*
 * MACRO 2026 · T2 — LA ESCALERA DE SEIS PELDAÑOS (A5, H1, H2 y H4)
 *
 * Especificación de Gen (t2 §0): Problema → Objetivo → Estrategia →
 * Instrumento → Medida → Meta, de abajo arriba, cada uno con su rótulo; la
 * misma forma en las cuatro piezas, un solo componente.
 *
 * Cada peldaño mide el ancho completo de la tarjeta (H1 a 320 px) y ≥ 48 px de
 * alto (36 en `compacto`, salvo el actual, que vuelve a 48: H2). El perfil de
 * la escalera lo dibuja la huella de la izquierda, que crece hacia arriba.
 * Un peldaño puede ser botón (tocar), destino de arrastre (data-destino) o
 * solo figura.
 */
import { BORDE, INK, INK_2, SUPERFICIE_2, FONDO } from "./colores-da.js";
import { Personaje } from "./iconos-pe.jsx";

export const PELDANOS = [
  { id: "problema", nombre: "Problema" },
  { id: "objetivo", nombre: "Objetivo" },
  { id: "estrategia", nombre: "Estrategia" },
  { id: "instrumento", nombre: "Instrumento" },
  { id: "medida", nombre: "Medida" },
  { id: "meta", nombre: "Meta" },
];
export const ORDEN_PELDANOS = PELDANOS.map((p) => p.id);
export const nombrePeldano = (id) => PELDANOS.find((p) => p.id === id)?.nombre ?? id;

const CSS = `
.pe26-esc { display: flex; flex-direction: column-reverse; gap: 6px; }
.pe26-pel { display: flex; align-items: stretch; gap: 6px; width: 100%; }
.pe26-huella { flex: none; border-radius: 4px; background: ${BORDE}; transition: background 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-pel[data-iluminado="1"] .pe26-huella { background: ${INK}; }
.pe26-caja { position: relative; flex: 1; min-width: 0; min-height: 48px; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 6px 10px; border-radius: 10px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; text-align: left; font: 500 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
button.pe26-caja { cursor: pointer; touch-action: manipulation; }
.pe26-pel[data-compacto="1"] .pe26-caja { min-height: 36px; padding: 3px 10px; }
.pe26-pel[data-actual="1"] .pe26-caja { min-height: 48px; border-color: ${INK_2}; border-style: dashed; }
.pe26-pel[data-resaltado="1"] .pe26-caja, .pe26-pel[data-iluminado="1"] .pe26-caja { background: ${SUPERFICIE_2}; border-color: ${INK}; }
.pe26-caja[data-blanco="1"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pe26-rot { font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; letter-spacing: .02em; }
.pe26-pel[data-resaltado="1"] .pe26-rot, .pe26-pel[data-iluminado="1"] .pe26-rot { color: ${INK}; }
.pe26-cont { font-size: 14px; line-height: 1.3; overflow-wrap: anywhere; }
.pe26-quien { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
@keyframes pe26-parpadeo { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
.pe26-parpadea { animation: pe26-parpadeo 560ms linear 1; }
@media (prefers-reduced-motion: reduce) { .pe26-huella { transition: none; } .pe26-parpadea { animation: none; } }
`;

export default function Escalera({
  contenido = {}, estados = {}, resaltado = null, actual = null, personaje = null,
  onPeldano = null, destino = null, iluminados = null, compacto = false, parpadea = null, etiqueta = "La escalera de la política",
}) {
  return (
    <div className="pe26-esc" role="group" aria-label={etiqueta} data-escalera>
      <style>{CSS}</style>
      {PELDANOS.map((p, k) => {
        const cont = contenido[p.id];
        const interactivo = Boolean(onPeldano || destino);
        const Etq = interactivo ? "button" : "div";
        const extra = destino ? destino(p.id) : {};
        return (
          <div
            key={p.id}
            className="pe26-pel"
            data-peldano={p.id}
            data-compacto={compacto ? "1" : "0"}
            data-actual={actual === p.id ? "1" : "0"}
            data-resaltado={resaltado === p.id ? "1" : "0"}
            data-iluminado={iluminados?.has?.(p.id) ? "1" : "0"}
          >
            <span className="pe26-huella" aria-hidden="true" style={{ width: 6 + k * 5 }} />
            <Etq
              {...(interactivo ? { type: "button" } : {})}
              className={`pe26-caja da26-marcable${parpadea === p.id ? " pe26-parpadea" : ""}`}
              data-estado={estados[p.id]}
              data-caja-peldano={p.id}
              {...extra}
              onClick={(e) => { extra.onClick?.(e); onPeldano?.(p.id); }}
              style={personaje === p.id ? { paddingRight: 38 } : undefined}
            >
              <span className="pe26-rot">{k + 1} · {p.nombre}</span>
              {cont != null && cont !== false && <span className="pe26-cont">{cont}</span>}
              {personaje === p.id && (
                <span className="pe26-quien" data-personaje aria-label="La autoridad económica" role="img">
                  <Personaje size={26} color={INK} />
                </span>
              )}
            </Etq>
          </div>
        );
      })}
    </div>
  );
}
