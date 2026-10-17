import QueRentaDa from "./QueRentaDa.jsx";
import { CHIP_ACT1_C4, RINDE_ACT1_C4, consecuenciaAct1 } from "../../../../contabilidad/c4/t5Act1_c4.js";
import { NotaC4, ESPERA_C4 } from "../t5/figurasC4T5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · ACT1 · ¿QUÉ RENTA DA? CON EL PATRÓN C4 (Célula C · «toda decisión se
 * pinta»; Watari, patron-enganche-c4-v1.html, #t5-act1).
 *
 * La pieza de main tal cual (QueRentaDa → b5/FichasUnNivel.jsx: sus fichas,
 * sus dos mazos, su segunda decisión, su puntaje del primer intento y su
 * `detalle`), con la prop opcional `c4` de FichasUnNivel:
 *   · al tocar un cajón, la ficha cae en él: el cajón muestra el chip «Esta
 *     ficha», las barras de cómo rendiría y su frase (en el acto);
 *   · el veredicto de siempre (vuelo, «Correcto» / «No va aquí» / «Iba aquí»,
 *     mensaje de Near) llega ESPERA_C4 = 380 ms después; con movimiento
 *     reducido, sin espera;
 *   · con el veredicto, bajo el estante, lo que implica el cajón malo, con ✕.
 * La consecuencia, pura, en contabilidad/c4/t5Act1_c4.js. En «Así se juega»
 * (modoDemo) va sin C4: el guion del tutorial es el de main.
 *
 * PROVISIONAL PARA WATARI: la forma es la de su prototipo (.c4-rinde,
 * .c4-efecto, .c4-chip), sobria, sin teal ni ámbar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_ACT1_C4 = `
.t5a1c4 { --t5c4-texto: #F8F9FA; --t5c4-atenuado: #A8B6C8; --t5c4-neutro: #B8C4D4; --t5c4-coral: #E76F51; color: var(--t5c4-texto); }
.t5a1c4-cajon { display: grid; gap: 4px; justify-items: start; min-width: 0; width: 100%; }
.t5a1c4-chip { display: inline-block; max-width: 100%; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--t5c4-texto); font: 600 12px/1.3 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5a1c4-rinde { display: flex; align-items: flex-end; gap: 3px; height: 28px; }
.t5a1c4-rinde i { display: block; width: 8px; height: 100%; background: var(--t5c4-neutro); transform-origin: bottom; border-radius: 2px; }
.t5a1c4-efecto { font: 400 12px/1.35 "Inter", sans-serif; color: var(--t5c4-atenuado); overflow-wrap: anywhere; }
.t5a1c4-nota { margin-top: 9px; }
.t5a1c4-nota .t5c4-falla, .t5a1c4-nota .t5c4-cuadra { margin: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 8px 10px; border-radius: 10px; font: 500 13px/1.4 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5a1c4-nota .t5c4-falla { border: 2px solid var(--t5c4-coral); }
.t5a1c4-anim .t5a1c4-chip { animation: t5a1c4-cae ${ESPERA_C4}ms cubic-bezier(.3,.9,.4,1) both; }
.t5a1c4-anim .t5a1c4-rinde i { animation: t5a1c4-sube 500ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t5a1c4-cae { from { transform: translateY(-8px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes t5a1c4-sube { from { transform: scaleY(0); } }
@media (prefers-reduced-motion: reduce) { .t5a1c4 *, .t5a1c4 *::before, .t5a1c4 *::after { animation: none !important; transition: none !important; } }
`;

/* Lo que muestra el cajón tocado: la ficha que cayó, cómo rendiría y su frase. */
export function CajonAct1C4({ estado, anim }) {
  if (!estado?.cajon) return null;
  return (
    <span data-c4-cajon={estado.cajon} className={`t5a1c4 t5a1c4-cajon${anim ? " t5a1c4-anim" : ""}`}>
      <span data-chip className="t5a1c4-chip">{CHIP_ACT1_C4}</span>
      <span aria-hidden="true" data-rinde className="t5a1c4-rinde">
        {(RINDE_ACT1_C4[estado.cajon] ?? []).map((h, k) => <i key={k} style={{ transform: `scaleY(${h || 0.04})` }} />)}
      </span>
      <span data-efecto className="t5a1c4-efecto">{estado.efecto}</span>
    </span>
  );
}

/* Con el veredicto: lo que implica el cajón malo (la buena no lleva nota). */
export function NotaAct1C4({ estado, vista }) {
  if (!vista?.veredicto || !estado?.falla) return null;
  return <div data-nota-c4 className="t5a1c4 t5a1c4-nota" aria-live="polite"><NotaC4 estado={estado} vista={vista} /></div>;
}

export const C4_ACT1 = { consecuencia: consecuenciaAct1, Cajon: CajonAct1C4, Nota: NotaAct1C4, espera: ESPERA_C4, css: CSS_ACT1_C4 };

export default function QueRentaDaC4(props) {
  if (props.modoDemo) return <QueRentaDa {...props} />;
  return <QueRentaDa {...props} c4={C4_ACT1} />;
}
