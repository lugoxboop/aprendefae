import { IconoX } from "../b5/Devolucion.jsx";
import { ESPERA_C4 } from "../t7/decisionC4.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 · LO COMÚN DE LAS FIGURAS DE LA CÉLULA C (N1, N3, N4, N5 y N7).
 *
 * PROVISIONAL PARA WATARI: la forma es la de su prototipo (codigo-css de
 * patron-enganche-c4-v1.html: .c4-obj, .c4-zonas, .c4-meses, .c4-bloque,
 * .c4-mini-t), sobria y sin teal ni ámbar (son el debe y el haber). Solo se
 * anima el paso recién dado (`c4-mov`), con transform y opacity; con
 * movimiento reducido, nada.
 *
 *   FallaC4      lo que implica una opción mala, con texto y ✕ (nunca solo
 *                color). Sale con el veredicto, no antes.
 *   CuadraC4     la nota de la buena, con ✓ en neutro. También con el veredicto.
 *   CSS_T5C4     las clases t5c4-*.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { ESPERA_C4 };

export function FallaC4({ texto }) {
  return <p className="t5c4-falla" data-falla><IconoX /><span>{texto}</span></p>;
}

export function CuadraC4({ texto }) {
  return (
    <p className="t5c4-cuadra" data-cuadra>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      <span>{texto}</span>
    </p>
  );
}

/*
 * La nota con el veredicto: la falla de la mala o la de la buena; antes, nada
 * (la consecuencia no delata). Con escalera, una falla que dice la cifra
 * buena (`delata`) espera a que el ítem se cierre (E8), para no dar la
 * respuesta antes del segundo intento.
 */
export function NotaC4({ estado, vista }) {
  if (!vista?.veredicto || !estado) return null;
  if (estado.delata && !vista.cerrado) return null;
  if (estado.falla) return <FallaC4 texto={estado.falla} />;
  return estado.cuadra ? <CuadraC4 texto={estado.cuadra} /> : null;
}

export const CSS_T5C4 = `
.t5c4 { --t5c4-texto: #F8F9FA; --t5c4-atenuado: #A8B6C8; --t5c4-neutro: #B8C4D4; --t5c4-coral: #E76F51;
  display: grid; gap: 8px; min-width: 0; padding: 10px 12px; border-radius: 11px; border: 1px solid rgba(248,249,250,0.12);
  background: rgba(10,20,34,0.35); color: var(--t5c4-texto); font: 400 14px/1.45 "Inter", system-ui, sans-serif; }
.t5c4 * { box-sizing: border-box; }
.t5c4-tit { margin: 0; font: 700 13px/1.3 "Sora", "Inter", sans-serif; color: var(--t5c4-atenuado); }
.t5c4-linea { margin: 0; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.t5c4-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
.t5c4-falla, .t5c4-cuadra { margin: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 8px 10px; border-radius: 10px; font: 500 13px/1.4 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5c4-falla { border: 2px solid var(--t5c4-coral); }
.t5c4-cuadra { border: 2px solid var(--t5c4-texto); }
.t5c4-falla svg, .t5c4-cuadra svg { margin-top: 1px; }
.t5c4-zonas { display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 8px; }
.t5c4-cajon { display: grid; gap: 6px; align-content: start; justify-items: start; }
.t5c4-cajon > .t5c4-cuerpo { display: grid; gap: 4px; min-width: 0; }
.t5c4-rot { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--t5c4-atenuado); font-weight: 600; }
.t5c4-chip { justify-self: start; display: inline-block; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--t5c4-texto); font-size: 12px; line-height: 1.3; }
.t5c4-estado { margin: 0; padding: 8px 10px; border-radius: 8px; border: 1px dashed var(--t5c4-neutro); font-size: 13px; font-weight: 600; }
.t5c4-estado.abierto { border: 2px solid var(--t5c4-coral); }
.t5c4-estado.cubierto { border: 2px solid var(--t5c4-texto); }
.t5c4-meses { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 2px; height: 56px; align-items: end; border-bottom: 2px solid var(--t5c4-neutro); }
.t5c4-mes { height: 100%; display: flex; align-items: flex-end; }
.t5c4-mes i { display: block; width: 100%; height: 100%; background: var(--t5c4-neutro); border-radius: 2px 2px 0 0; }
.t5c4-bloque { height: 22px; border-radius: 4px; background: rgba(184,196,212,.18); overflow: hidden; }
.t5c4-bloque i { display: block; height: 100%; background: var(--t5c4-neutro); }
.t5c4-bloque i.mal { background: transparent; outline: 2px solid var(--t5c4-coral); outline-offset: -2px; }
.t5c4-t { display: grid; grid-template-columns: 1fr 1fr; min-height: 44px; border-top: 2px solid var(--t5c4-neutro); padding-top: 6px; }
.t5c4-t > span { display: grid; align-content: start; justify-items: center; padding: 0 4px; min-width: 0; }
.t5c4-t > span:first-child { border-right: 2px solid var(--t5c4-neutro); }
.t5c4-mov { display: inline-block; font-size: 13px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--t5c4-texto); }
.t5c4-mov.mal { border: 2px solid var(--t5c4-coral); }
.t5c4-anim .t5c4-mov, .t5c4-anim .t5c4-crece { animation: t5c4-entra ${ESPERA_C4}ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t5c4-entra { from { transform: translateY(-8px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t5c4 *, .t5c4 *::before, .t5c4 *::after { animation: none !important; transition: none !important; } }
`;
