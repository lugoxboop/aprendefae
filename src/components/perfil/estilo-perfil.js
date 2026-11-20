/*
 * ═══════════ EL ESTILO DE «TU PERFIL» (rediseño del 20-nov) ═══════════
 *
 * La misma familia que el banner del Repaso Diario, el ranking, el cierre y el
 * panel docente: tarjetas de cristal con luz de tono arriba, cejilla en
 * mayúsculas espaciadas, fichas con filo de luz, pastillas y el botón lleno
 * con su flecha. Texto de acento en menta #86E0C3; el teal, solo en formas.
 *
 * Va como texto JS (no .css) por lo mismo que marioneta-estilo.js: el
 * cargador de las pruebas no importa hojas de estilo.
 */
export const MENTA = "#86E0C3";

export const CSS_PERFIL = `
.fae-pf-tarjeta { position: relative; overflow: hidden; border-radius: 22px;
  background: linear-gradient(170deg, rgba(42,157,143,0.14) 0%, rgba(20,38,58,0.92) 30%, rgba(12,23,40,0.96) 100%);
  border: 1px solid rgba(134,224,195,0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px -32px rgba(42,157,143,0.55); }
.fae-pf-tarjeta-in { position: relative; z-index: 1; padding: clamp(16px, 3vw, 22px); }
.fae-pf-ceja { font-family: Sora, sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.3; color: ${MENTA}; margin: 0; }
.fae-pf-titulo { font-family: Sora, sans-serif; font-weight: 700; font-size: 19px; letter-spacing: -0.02em; line-height: 1.2; margin: 4px 0 0; color: #F8F9FA; }

/* ── La cabecera: escenario de la mascota + datos ── */
.fae-pf-heroe { margin-bottom: 16px; border-color: rgba(134,224,195,0.32);
  background: linear-gradient(170deg, rgba(42,157,143,0.24) 0%, rgba(20,38,58,0.92) 38%, rgba(12,23,40,0.97) 100%); }
.fae-pf-luz { position: absolute; left: 50%; top: -140px; width: 560px; height: 380px; transform: translateX(-50%); pointer-events: none;
  background: radial-gradient(closest-side, rgba(134,224,195,0.26), rgba(134,224,195,0.06) 60%, transparent); }
.fae-pf-rayos { position: absolute; left: 50%; top: -60px; width: 520px; height: 520px; margin-left: -260px; pointer-events: none; opacity: .5;
  background: repeating-conic-gradient(from 0deg, rgba(248,249,250,0.05) 0deg 6deg, transparent 6deg 22deg);
  -webkit-mask-image: radial-gradient(closest-side, #000 20%, transparent 72%); mask-image: radial-gradient(closest-side, #000 20%, transparent 72%);
  animation: fae-pf-girar 48s linear infinite; }
@keyframes fae-pf-girar { to { transform: rotate(360deg); } }
.fae-pf-heroe-grid { position: relative; z-index: 1; display: grid; gap: 6px; padding: 20px 18px 18px; justify-items: center; text-align: center; }
.fae-pf-escenario { position: relative; display: grid; justify-items: center; }
.fae-pf-mascota { position: relative; display: block; padding: 0; margin: 0; border: none; background: transparent; cursor: pointer; line-height: 0; border-radius: 28px;
  transition: transform 260ms cubic-bezier(0.34,1.56,0.64,1); }
.fae-pf-mascota:hover { transform: translateY(-3px) scale(1.02); }
.fae-pf-mascota:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 4px; }
.fae-pf-pedestal { position: absolute; left: 50%; bottom: 2px; width: 150px; height: 34px; transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(134,224,195,0.42), rgba(42,157,143,0.14) 65%, transparent);
  animation: fae-pf-pulso 3.2s ease-in-out infinite; }
@keyframes fae-pf-pulso { 50% { opacity: .65; transform: translateX(-50%) scale(.92); } }
.fae-pf-lapiz { position: absolute; right: 2px; top: 10px; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px; color: #0E1B2E;
  background: linear-gradient(145deg, ${MENTA}, #2A9D8F); box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 16px -8px rgba(42,157,143,1); }
.fae-pf-nombre-mascota { display: inline-flex; align-items: center; gap: 6px; margin-top: 2px; padding: 4px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; line-height: 1.4;
  background: rgba(14,27,46,0.7); border: 1px solid rgba(134,224,195,0.28); color: rgba(248,249,250,0.92); max-width: 100%; box-sizing: border-box; overflow-wrap: anywhere; }
.fae-pf-datos { min-width: 0; width: 100%; display: grid; gap: 10px; justify-items: center; }
.fae-pf-apodo { font-family: Sora, sans-serif; font-weight: 800; font-size: clamp(28px, 7vw, 38px); letter-spacing: -0.035em; line-height: 1.05; margin: 2px 0 0; overflow-wrap: anywhere; color: #F8F9FA; }
.fae-pf-real { font-size: 13px; line-height: 1.5; color: rgba(248,249,250,0.6); margin: 0; }
.fae-pf-pastillas { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.fae-pf-pastilla { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; max-width: 100%; box-sizing: border-box;
  background: rgba(134,224,195,0.10); border: 1px solid rgba(134,224,195,0.32); font-size: 12.5px; font-weight: 600; line-height: 1.4; color: rgba(248,249,250,0.94); }
.fae-pf-pastilla--fuego { background: rgba(244,162,97,0.12); border-color: rgba(244,162,97,0.42); }
.fae-pf-pastilla--fuego svg { color: #F4A261; }
.fae-pf-pastilla svg { flex: none; }
.fae-pf-colores { display: grid; gap: 8px; justify-items: center; }
.fae-pf-colores [role="radiogroup"] { justify-content: center; }
.fae-pf-sub { font-size: 12px; color: rgba(248,249,250,0.6); margin: 0; }
.fae-pf-botones { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; width: 100%; }
.fae-pf-primario { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 20px; border-radius: 14px; cursor: pointer;
  font-family: Sora, sans-serif; font-size: 14px; font-weight: 700; color: #06202A;
  background: linear-gradient(180deg, #4FC3AE 0%, #2A9D8F 100%); border: 1px solid #2A9D8F;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 14px 28px -14px rgba(42,157,143,1);
  transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), filter 180ms ease; }
.fae-pf-primario svg { transition: transform 320ms cubic-bezier(0.34,1.56,0.64,1); }
.fae-pf-primario:hover { transform: translateY(-2px); filter: brightness(1.05); }
.fae-pf-primario:hover svg { transform: translateX(3px); }
.fae-pf-primario:focus-visible, .fae-pf-ficha--boton:focus-visible, .fae-pf-pestana:focus-visible, .fae-pf-med:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 3px; }
.fae-pf-aviso { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; font-size: 13px; line-height: 1.5; color: rgba(248,249,250,0.75); margin: 0;
  padding: 8px 12px; border-radius: 12px; background: rgba(14,27,46,0.6); border: 1px dashed rgba(134,224,195,0.35); }

/* La vitrina: las mejores medallas, en la repisa de la cabecera. */
.fae-pf-vitrina { position: relative; z-index: 1; margin: 0 14px 16px; padding: 12px 12px 10px; border-radius: 16px;
  background: rgba(10,20,34,0.62); border: 1px solid rgba(134,224,195,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
.fae-pf-vitrina-fila { display: flex; justify-content: center; align-items: flex-start; gap: clamp(4px, 2.5vw, 18px); margin-top: 8px; }
.fae-pf-vitrina-item { display: grid; justify-items: center; gap: 4px; width: 64px; min-width: 0; }
.fae-pf-vitrina-item p { margin: 0; font-size: 10.5px; font-weight: 600; line-height: 1.25; color: rgba(248,249,250,0.8); text-align: center; }
.fae-pf-vacio { margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: rgba(248,249,250,0.7); text-align: center; }

@media (min-width: 620px) {
  .fae-pf-pestanas { flex-wrap: wrap; margin: 14px 0 12px; padding: 0; -webkit-mask-image: none; mask-image: none; }
  .fae-pf-heroe-grid { grid-template-columns: auto 1fr; gap: 26px; align-items: center; justify-items: start; text-align: left; padding: 24px 26px 18px; }
  .fae-pf-datos, .fae-pf-colores { justify-items: start; }
  .fae-pf-pastillas, .fae-pf-botones, .fae-pf-colores [role="radiogroup"], .fae-pf-aviso { justify-content: flex-start; }
  .fae-pf-vitrina { margin: 0 22px 20px; }
}

/* ── Las fichas de números ── */
.fae-pf-fichas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.fae-pf-ficha { position: relative; overflow: hidden; display: grid; align-content: start; gap: 2px; padding: 14px 14px 13px; border-radius: 16px; min-width: 0; text-align: left;
  background: rgba(14,27,46,0.6); border: 1px solid rgba(248,249,250,0.10); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); color: #F8F9FA; font: inherit; }
.fae-pf-ficha::before { content: ""; position: absolute; top: 0; left: 14%; right: 14%; height: 1px; background: linear-gradient(90deg, transparent, rgba(134,224,195,0.7), transparent); }
.fae-pf-ficha--ancha { grid-column: 1 / -1; }
.fae-pf-ficha--boton { cursor: pointer; border-color: rgba(134,224,195,0.42); background: linear-gradient(160deg, rgba(42,157,143,0.20), rgba(14,27,46,0.7));
  transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), border-color 180ms ease; }
.fae-pf-ficha--boton:hover { transform: translateY(-2px); border-color: rgba(134,224,195,0.7); }
.fae-pf-rotulo { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: rgba(248,249,250,0.66); margin: 0; }
.fae-pf-icono { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; }
.fae-pf-cifra { font-family: Sora, sans-serif; font-weight: 700; font-size: 24px; line-height: 1.15; margin: 4px 0 0; font-variant-numeric: tabular-nums; color: #F8F9FA; }
.fae-pf-cifra small { font-size: 14px; font-weight: 600; color: rgba(248,249,250,0.7); }
.fae-pf-nota { font-size: 12px; line-height: 1.4; margin: 2px 0 0; color: ${MENTA}; }
.fae-pf-barra { position: relative; height: 8px; border-radius: 999px; margin-top: 8px; background: rgba(248,249,250,0.08); overflow: hidden; }
.fae-pf-barra span { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: linear-gradient(90deg, #E76F51, #F4A261); box-shadow: 0 0 12px rgba(244,162,97,0.6);
  transform-origin: left; animation: fae-pf-llenar 900ms cubic-bezier(0.2,0.8,0.2,1) both; }
@keyframes fae-pf-llenar { from { transform: scaleX(0); } }
@media (min-width: 620px) {
  .fae-pf-fichas { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .fae-pf-ficha--ancha, .fae-pf-ficha--media { grid-column: span 2; }
}

/* ── Medallas ── */
.fae-pf-medallas { margin-bottom: 16px; }
.fae-pf-med-cab { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.fae-pf-anillo { flex: none; position: relative; width: 64px; height: 64px; }
.fae-pf-anillo svg { display: block; transform: rotate(-90deg); }
.fae-pf-anillo b { position: absolute; inset: 0; display: grid; place-items: center; font-family: Sora, sans-serif; font-size: 15px; font-weight: 700; color: #F8F9FA; font-variant-numeric: tabular-nums; }
.fae-pf-anillo b span { display: grid; justify-items: center; line-height: 1.1; }
.fae-pf-anillo b small { display: block; font-size: 10px; font-weight: 600; color: rgba(248,249,250,0.6); margin-top: -2px; }
.fae-pf-pestanas { display: flex; gap: 6px; margin: 14px -18px 12px; padding: 2px 18px; overflow-x: auto; scrollbar-width: none; scroll-padding: 18px;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 28px), transparent); }
.fae-pf-pestanas::-webkit-scrollbar { display: none; }
.fae-pf-pestana { flex: none; display: inline-flex; align-items: center; gap: 6px; min-height: 38px; padding: 0 13px; border-radius: 999px; cursor: pointer; white-space: nowrap;
  font-family: Sora, sans-serif; font-size: 12.5px; font-weight: 700; color: rgba(248,249,250,0.75);
  background: rgba(248,249,250,0.04); border: 1px solid rgba(248,249,250,0.14); transition: background 160ms ease, border-color 160ms ease; }
.fae-pf-pestana span { font-family: Inter, sans-serif; font-weight: 600; font-size: 11.5px; color: rgba(248,249,250,0.55); font-variant-numeric: tabular-nums; }
.fae-pf-pestana[aria-selected="true"] { color: #06202A; background: linear-gradient(180deg, #4FC3AE, #2A9D8F); border-color: #2A9D8F; }
.fae-pf-pestana[aria-selected="true"] span { color: rgba(6,32,42,0.75); }
.fae-pf-rejilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 6px; padding: 8px; border-radius: 16px;
  background: rgba(248,249,250,0.025); border: 1px solid rgba(248,249,250,0.07); }
.fae-pf-rejilla--elite { background: rgba(6,13,24,0.75); border-color: rgba(134,224,195,0.28); }
.fae-pf-med { position: relative; display: grid; justify-items: center; align-content: start; gap: 5px; padding: 10px 4px 9px; border-radius: 14px; cursor: pointer; min-width: 0;
  background: transparent; border: 1px solid transparent; color: inherit; font: inherit; transition: background 160ms ease, border-color 160ms ease, transform 220ms cubic-bezier(0.34,1.56,0.64,1); }
.fae-pf-med:hover { background: rgba(248,249,250,0.05); transform: translateY(-2px); }
.fae-pf-med[aria-pressed="true"] { background: rgba(134,224,195,0.10); border-color: rgba(134,224,195,0.45); }
.fae-pf-med-arte { position: relative; line-height: 0; }
.fae-pf-med--ganada .fae-pf-med-arte::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; z-index: -1;
  background: radial-gradient(closest-side, rgba(134,224,195,0.30), transparent); }
.fae-pf-brillo { position: absolute; inset: 0; overflow: hidden; border-radius: 50%; pointer-events: none; }
.fae-pf-brillo::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 30%; left: -60%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); animation: fae-pf-destello 4.8s ease-in-out infinite; }
@keyframes fae-pf-destello { 0%, 70% { left: -60%; } 100% { left: 130%; } }
.fae-pf-med-titulo { font-family: Sora, sans-serif; font-size: 11.5px; font-weight: 700; line-height: 1.25; text-align: center; margin: 0; overflow-wrap: anywhere; }
.fae-pf-detalle { display: flex; gap: 14px; align-items: center; margin-top: 12px; padding: 14px; border-radius: 16px;
  background: rgba(14,27,46,0.6); border: 1px solid rgba(134,224,195,0.22); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  animation: fae-pf-entra 360ms cubic-bezier(0.2,0.8,0.2,1) both; }
.fae-pf-detalle h4 { font-family: Sora, sans-serif; font-size: 15px; font-weight: 700; margin: 0; color: #F8F9FA; }
.fae-pf-detalle p { margin: 3px 0 0; font-size: 13px; line-height: 1.5; color: rgba(248,249,250,0.78); }
.fae-pf-estado { display: inline-flex; margin-top: 7px; padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
.fae-pf-entra { animation: fae-pf-entra 520ms cubic-bezier(0.2,0.8,0.2,1) both; }
@keyframes fae-pf-entra { from { opacity: 0; transform: translateY(8px); } }

@media (prefers-reduced-motion: reduce) { .fae-pf-raiz *, .fae-pf-raiz *::before, .fae-pf-raiz *::after { animation: none !important; transition: none !important; } }
`;
