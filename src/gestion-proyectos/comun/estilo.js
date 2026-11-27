/*
 * GESTIÓN DE PROYECTOS · LA HOJA DE ESTILO DE LAS HACER.
 *
 * Se monta dentro de <Raiz> de Macro 2026 (src/macro2026/comun/ui.jsx), que ya
 * trae la tarjeta, los botones, la retro y el marco de escena (.da26-*). Aquí
 * solo lo propio: el visual de cada pieza (.gp-visual), la mesa con el
 * personaje y el objeto protagonista, los destinos y las animaciones de
 * acierto, una por pieza (data-anim).
 *
 * Reglas del diseño §0: coral SOLO para error; el acierto con ✓ y forma
 * (encaje), no solo color; destinos ≥ 48 px de alto; texto ≥ 14 px; solo
 * transform y opacity en movimiento; con movimiento reducido, sin vaivenes.
 */
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../../macro2026/comun/colores-da.js";

export const CURVA = "cubic-bezier(.3,.9,.4,1)";

const CSS_BASE = `
.gp-visual { position: relative; isolation: isolate; overflow: hidden; margin: 4px -12px 0; padding: 12px 12px 14px; color: ${INK};
  background: radial-gradient(130% 70% at 50% 0%, var(--gp-luz, rgba(111,134,255,.22)), transparent 70%), linear-gradient(180deg, var(--gp-a, #1d3557), var(--gp-b, #0e1b2e));
  border-top: 1px solid var(--gp-acento, ${BORDE}); border-bottom: 1px solid var(--gp-acento, ${BORDE}); }
@media (min-width: 400px) { .gp-visual { margin: 6px -16px 0; padding: 14px 16px 16px; } }
.gp-visual::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 38%; z-index: -1; background: linear-gradient(0deg, var(--gp-piso, rgba(0,0,0,.28)), transparent); pointer-events: none; }
.gp-personaje { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; flex: none; }
.gp-rol { margin: 0; padding: 2px 8px; border-radius: 6px; background: rgba(8,16,30,.88); font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .02em; text-align: center; max-width: 150px; color: ${INK}; }
.gp-mesa { display: flex; align-items: flex-end; gap: 8px; min-height: 150px; }
.gp-centro { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 0; }
.gp-contexto { margin: 0 0 8px; align-self: stretch; padding: 8px 10px; border-radius: 10px; border-left: 3px solid var(--gp-acento, ${INK_2}); background: rgba(8,16,30,.78); font-size: 15px; line-height: 1.35; }
.gp-contexto small { display: block; font-size: 12px; line-height: 16px; color: ${INK_2}; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 2px; }
.gp-tarjeta { position: relative; z-index: 2; display: block; width: 100%; min-height: 64px; padding: 10px 12px; border-radius: 12px; border: 2px solid ${INK}; background: #fbf7ee; color: ${TINTA_SOBRE_COLOR};
  font: 600 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none;
  box-shadow: 0 6px 16px rgba(0,0,0,.35); transition: transform 280ms ${CURVA}, opacity 280ms ${CURVA}; }
.gp-tarjeta[aria-pressed="true"] { box-shadow: 0 0 0 3px var(--gp-acento, ${INK_2}), 0 6px 16px rgba(0,0,0,.35); }
.gp-tarjeta[data-arrastrando="1"] { transition: none; cursor: grabbing; box-shadow: 0 12px 28px rgba(0,0,0,.55); }
.gp-tarjeta[data-estado="mal"] { border-color: ${CORAL}; }
.gp-tarjeta-letra { display: inline-grid; place-items: center; width: 24px; height: 24px; margin-right: 6px; border-radius: 6px; background: ${TINTA_SOBRE_COLOR}; color: #fbf7ee; font: 700 13px/1 var(--planck-font-mono, monospace); vertical-align: 2px; }
.gp-protagonista { position: relative; z-index: 1; margin-top: -10px; pointer-events: none; }
.gp-protagonista[data-lugar="detras"] { margin-top: -26px; }
.gp-destinos { display: grid; gap: 8px; margin-top: 12px; grid-template-columns: repeat(var(--gp-cols, 2), minmax(0, 1fr)); }
.gp-destino { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px; min-height: 56px; padding: 8px 6px; border-radius: 12px;
  border: 2px solid rgba(244,245,247,.55); background: rgba(8,16,30,.72); color: ${INK}; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: pointer; touch-action: manipulation;
  transition: transform 280ms ${CURVA}, opacity 280ms ${CURVA}; }
.gp-destino small { display: block; font: 500 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.gp-destino svg.gp-icono { flex: none; }
.gp-destino[data-blanco="1"], .gp-destino:hover { border-color: ${INK}; background: rgba(31,50,80,.92); }
.gp-destino[data-estado="mal"] { border-color: ${CORAL}; }
.gp-destino[data-estado="bien"] { border-color: ${INK}; background: rgba(31,50,80,.95); }
.gp-destino:disabled { cursor: default; opacity: .55; }
.gp-destino[data-estado="bien"]:disabled { opacity: 1; }
.gp-marca { display: block; margin-top: 2px; padding: 2px 8px; border-radius: 999px; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; font: 700 13px/18px var(--planck-font-sans, system-ui, sans-serif); }
.gp-marca::before { content: "✓ "; }
.gp-destinos[data-disposicion="columna"] { --gp-cols: 1; }
.gp-destinos[data-disposicion="fila3"] { --gp-cols: 3; }
.gp-destinos[data-disposicion="fila3"] .gp-destino { font-size: 14px; }
@media (max-width: 359px) { .gp-destinos[data-disposicion="fila3"] { --gp-cols: 1; } .gp-destinos[data-disposicion="fila3"] .gp-destino { flex-direction: row; justify-content: center; gap: 8px; } }
.gp-destinos[data-disposicion="palancas"] { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.gp-destinos[data-disposicion="palancas"] > * { grid-column: span 2; }
.gp-destinos[data-disposicion="palancas"] > :nth-child(4) { grid-column: 2 / span 2; }
.gp-destino[data-forma="palanca"]::before { content: ""; display: block; width: 6px; height: 22px; margin: 0 auto 4px; border-radius: 3px; background: #c99a5b; box-shadow: 0 -6px 0 2px #8a5a2b; transform-origin: 50% 100%; transition: transform 280ms ${CURVA}; }
.gp-destino[data-forma="palanca"][data-estado="bien"]::before, .gp-destino[data-forma="palanca"][data-estado="mal"]::before { transform: rotate(38deg); }
.gp-destino[data-forma="clavija"] { flex-direction: row; justify-content: flex-start; gap: 8px; min-height: 48px; padding: 6px 10px; text-align: left; font-size: 14px; }
.gp-foco { flex: none; width: 14px; height: 14px; border-radius: 50%; border: 2px solid ${INK_2}; background: #2a3a55; }
.gp-destino[data-estado="bien"] .gp-foco { background: #ffc978; border-color: #ffc978; box-shadow: 0 0 10px 2px rgba(255,201,120,.7); }
.gp-sobre { display: flex; flex-direction: row; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap; }
.gp-retro-mascota { display: flex; align-items: flex-end; gap: 8px; }
.gp-pie { display: flex; justify-content: flex-end; margin-top: 10px; }
.gp-etapa { display: inline-block; margin: 0 0 6px; padding: 2px 8px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${SUPERFICIE_2}; font: 600 12px/16px var(--planck-font-mono, monospace); color: ${INK_2}; }
.gp-cierre { margin: 12px 0 0; padding: 12px 14px; border-radius: 12px; border: 2px solid ${INK}; background: ${FONDO}; font-size: 17px; line-height: 1.4; font-weight: 600; }
.gp-inicio-elenco { display: flex; align-items: flex-end; justify-content: center; gap: 4px; flex-wrap: wrap; }

/* ── Las animaciones de acierto, una por pieza (data-anim en .gp-visual) ── */
@keyframes gp-cae { 0% { transform: none; opacity: 1; } 100% { transform: translateY(70px) scale(.6); opacity: 0; } }
@keyframes gp-sella { 0% { transform: translateY(-14px) scale(1.08); } 55% { transform: translateY(3px) scale(.96); } 100% { transform: none; } }
@keyframes gp-sacude-suave { 0%,100% { transform: none; } 30% { transform: translateY(-6px); } 60% { transform: translateY(2px); } }
@keyframes gp-luz { 0% { opacity: 0; transform: scale(.6); } 60% { opacity: 1; transform: scale(1.1); } 100% { opacity: 1; transform: none; } }
@keyframes gp-gota { 0% { transform: translateY(-30px); opacity: 0; } 50% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@keyframes gp-abre { 0% { transform: translateX(0); } 50% { transform: translateX(10px); } 100% { transform: none; } }
@keyframes gp-sube { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.gp-visual[data-anim] .gp-tarjeta[data-sale="1"] { animation: gp-cae 520ms ${CURVA} both 1; }
.gp-visual[data-anim="sella"] .gp-tarjeta[data-sale="1"] { animation: gp-sella 420ms ${CURVA} both 1; }
.gp-visual[data-anim="cae"] .gp-destino[data-recibe="1"], .gp-visual[data-anim="pesa"] .gp-destino[data-recibe="1"] { animation: gp-sacude-suave 480ms ${CURVA} 1; }
.gp-visual[data-anim="sella"] .gp-destino[data-recibe="1"] { animation: gp-sella 420ms ${CURVA} 1; }
.gp-visual[data-anim="abre"] .gp-destino[data-recibe="1"] { animation: gp-abre 420ms ${CURVA} 1; }
.gp-visual[data-anim="gotea"] .gp-destino[data-recibe="1"] .gp-marca, .gp-visual[data-anim="conecta"] .gp-destino[data-recibe="1"] .gp-foco { animation: gp-luz 420ms ${CURVA} both 1; }
.gp-visual[data-anim="gotea"] .gp-destino[data-recibe="1"] { animation: gp-gota 520ms ${CURVA} 1; }
.gp-sello-marca { position: absolute; right: 8px; bottom: -10px; padding: 2px 10px; border: 3px solid ${TINTA_SOBRE_COLOR}; border-radius: 8px; color: ${TINTA_SOBRE_COLOR}; background: #fbf7ee; font: 800 13px/18px var(--planck-font-mono, monospace); letter-spacing: .06em; text-transform: uppercase; transform: rotate(-8deg); animation: gp-sella 420ms ${CURVA} both 1; }
.gp-medidor { position: relative; height: 12px; border-radius: 999px; background: rgba(244,245,247,.18); overflow: hidden; }
.gp-medidor > span { position: absolute; inset: 0; transform-origin: 0 50%; background: var(--gp-relleno, #ffc978); transition: transform 420ms ${CURVA}; }
@media (prefers-reduced-motion: reduce) {
  .gp-visual *, .gp-sello-marca { animation: none !important; transition: opacity 120ms linear !important; }
}
`;

/* El nombre del destino con su ícono en línea. */
export const CSS_GP_2 = `
.gp-destino-nombre { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2px 6px; max-width: 100%; text-align: center; }
.gp-destino-txt { min-width: 0; max-width: 100%; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: break-word; }
@media (max-width: 359px) { .gp-destinos[data-disposicion="palancas"] { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gp-destinos[data-disposicion="palancas"] > *, .gp-destinos[data-disposicion="palancas"] > :nth-child(4) { grid-column: auto; } .gp-destinos[data-disposicion="palancas"] > :nth-child(5) { grid-column: 1 / -1; } }
.gp-destino[data-forma="clavija"] .gp-destino-nombre { justify-content: flex-start; }
.gp-escenita { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 10px 0 0; padding: 8px 10px; border-radius: 12px; background: rgba(8,16,30,.72); font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.gp-escenita small { color: #b6bbc5; font-weight: 500; }
.gp-chip-c { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f4f5f7; color: #121418; font: 700 13px/18px var(--planck-font-sans, system-ui, sans-serif); }
`;

export const CSS_GP = CSS_BASE + CSS_GP_2;
