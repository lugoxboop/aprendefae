/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PIEL DEL APRENDER — una sola hoja para todos los temas de Contabilidad y
 * Macroeconomía (Mateo, 19 nov.: «eran muy sosos»).
 *
 * Cómo se aplica sin tocar el contenido: la portada (PortadaAprender) pone la
 * clase .fae-ap y las variables de tono en el contenedor del Aprender. Los
 * cuatro motores de Aprender (SecuenciaAprender, CuatroCapas, Presentacion y
 * las mecánicas sueltas) ya leen esas variables con su valor de siempre como
 * respaldo: fuera de un Aprender, o en Hacer, todo se ve igual que antes.
 *
 * Lo que NO cambia, a propósito:
 *   · El significado de los colores de las figuras: en Contabilidad el teal
 *     es el DEBE y el ámbar el HABER; el coral es error en todo el sitio. El
 *     tono del tema solo pinta el marco (botones, brillos, ruta), nunca un
 *     lado de una cuenta ni un acierto.
 *   · Solo se anima transform y opacity (los brillos son capas cuya opacidad
 *     cambia), así el celular no se traba.
 *   · Con «reducir movimiento» no hay saltos, temblores, destellos ni chispas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CURVA_REBOTE = "cubic-bezier(.34,1.56,.64,1)";
export const CURVA_SUAVE = "cubic-bezier(.3,.9,.4,1)";

export const ESTILOS_APRENDER = `
/* ───────── las variables que leen los motores ───────── */
.fae-ap {
  --ap-sig-fondo: linear-gradient(135deg, var(--ap-claro) 0%, var(--ap) 58%, rgba(var(--ap-rgb),0.92) 100%);
  --ap-sig-borde: rgba(var(--ap-rgb),0);
  --ap-sig-texto: #0E1B2E;
  --ap-sig-sombra: 0 10px 26px -10px rgba(var(--ap-rgb),0.85), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -3px 8px rgba(0,0,0,0.12);
  --ap-ant-borde: rgba(var(--ap-rgb),0.55);
  --ap-panel-fondo: radial-gradient(120% 70% at 100% 0%, rgba(var(--ap-rgb),0.13), transparent 60%), linear-gradient(160deg, rgba(29,53,87,0.36), rgba(10,20,34,0.7));
  --ap-panel-borde: rgba(var(--ap-rgb),0.30);
  --ap-panel-sombra: 0 24px 60px -30px rgba(var(--ap-rgb),0.55), inset 0 1px 0 rgba(255,255,255,0.09);
  --ap-rotulo: var(--ap-claro);
  --ap-progreso: linear-gradient(90deg, var(--ap), var(--ap-claro));
}

/* ───────── botones ───────── */
.fae-ap .fae-ap-sig, .fae-ap .fae-ap-ant {
  position: relative; overflow: hidden; isolation: isolate;
  transition: transform 180ms ${CURVA_REBOTE}, opacity 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.fae-ap .fae-ap-sig { font-weight: 700 !important; letter-spacing: 0.01em; }
/* El destello que cruza el botón: una franja de luz que solo cambia de sitio. */
.fae-ap .fae-ap-sig::after {
  content: ""; position: absolute; inset: -2px auto -2px 0; width: 45%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent);
  transform: translateX(-130%) skewX(-18deg); opacity: 0; pointer-events: none; z-index: 1;
}
.fae-ap .fae-ap-sig:hover:not([aria-disabled="true"]):not(:disabled)::after,
.fae-ap .fae-ap-sig[data-ap-listo="si"]::after { animation: fae-ap-destello 900ms ${CURVA_SUAVE} both; }
@keyframes fae-ap-destello {
  0% { opacity: 0; transform: translateX(-130%) skewX(-18deg); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translateX(260%) skewX(-18deg); }
}
.fae-ap .fae-ap-sig:hover:not([aria-disabled="true"]):not(:disabled) { transform: translateY(-2px); }
.fae-ap .fae-ap-sig:active:not([aria-disabled="true"]):not(:disabled),
.fae-ap .fae-ap-ant:active:not([aria-disabled="true"]):not(:disabled) { transform: scale(.95); transition-duration: 90ms; }
.fae-ap .fae-ap-sig[data-ap-listo="si"] { animation: fae-ap-salta 560ms ${CURVA_REBOTE} both; }
@keyframes fae-ap-salta {
  0% { transform: scale(1); } 35% { transform: scale(1.07); } 100% { transform: scale(1); }
}
/* La flecha de «Siguiente» va pintada por CSS: el texto del botón no cambia (lo leen las pruebas y el lector de pantalla). */
.fae-ap .fae-ap-sig { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.fae-ap .fae-ap-sig:not([aria-disabled="true"]):not(:disabled):not([data-ap-sin-flecha])::before {
  content: "→"; order: 2; font-weight: 800; display: inline-block; transition: transform 220ms ${CURVA_REBOTE};
}
.fae-ap .fae-ap-sig:hover:not([aria-disabled="true"]):not(:disabled)::before { transform: translateX(4px); }

/* ───────── las tarjetas (Panel) ───────── */
.fae-ap .fae-panel { transition: border-color 300ms ease; }

/* ───────── devolución: acierto y error ───────── */
.fae-ap .fae-ap-bien { animation: fae-ap-pop 520ms ${CURVA_REBOTE} both; position: relative; }
@keyframes fae-ap-pop { 0% { transform: scale(.85); opacity: .4; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
.fae-ap .fae-ap-mal { animation: fae-ap-tiembla 420ms ${CURVA_SUAVE} both; }
@keyframes fae-ap-tiembla {
  0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); } 80% { transform: translateX(2px); }
}

/* ───────── chispas (las lanza chispas.js) ───────── */
.fae-ap-chispa {
  position: fixed; z-index: 60; pointer-events: none; width: 8px; height: 8px; border-radius: 2px;
  left: 0; top: 0; opacity: 0;
  animation: fae-ap-chispa var(--dur, 820ms) cubic-bezier(.2,.7,.3,1) forwards;
}
.fae-ap-chispa[data-forma="o"] { border-radius: 999px; }
.fae-ap-chispa[data-forma="e"] { width: 10px; height: 10px; clip-path: polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%); border-radius: 0; }
@keyframes fae-ap-chispa {
  0% { opacity: 1; transform: translate(var(--x0), var(--y0)) scale(.4) rotate(0deg); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--x1), var(--y1)) scale(1) rotate(var(--giro)); }
}

/* ───────── la portada del Aprender ───────── */
.fae-ap-portada {
  position: relative; overflow: hidden; isolation: isolate;
  border-radius: 24px; margin: 0 0 18px;
  padding: 18px 16px 14px;
  background:
    radial-gradient(90% 120% at 100% 0%, rgba(var(--ap-rgb),0.28), transparent 55%),
    radial-gradient(70% 90% at 0% 100%, rgba(var(--ap-rgb),0.10), transparent 60%),
    linear-gradient(160deg, rgba(29,53,87,0.55), rgba(12,22,38,0.85));
  border: 1px solid rgba(var(--ap-rgb),0.35);
  box-shadow: 0 30px 70px -36px rgba(var(--ap-rgb),0.75), inset 0 1px 0 rgba(255,255,255,0.10);
  animation: fae-ap-portada-entra 560ms ${CURVA_SUAVE} both;
}
@keyframes fae-ap-portada-entra { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
.fae-ap-portada__luz {
  position: absolute; width: 220px; height: 220px; right: -70px; top: -90px; border-radius: 999px; z-index: -1;
  background: radial-gradient(circle, rgba(var(--ap-rgb),0.55), transparent 65%);
  animation: fae-ap-respira 5.5s ease-in-out infinite alternate;
}
@keyframes fae-ap-respira { from { opacity: .55; transform: scale(.92); } to { opacity: 1; transform: scale(1.08); } }
.fae-ap-portada__agua { position: absolute; right: -18px; bottom: -26px; color: rgba(var(--ap-rgb),0.10); z-index: -1; transform: rotate(-8deg); }
.fae-ap-portada__fila { display: flex; align-items: flex-start; gap: 12px; }
.fae-ap-portada .fae-tema__pastilla { width: 52px; height: 52px; border-radius: 16px; }
.fae-ap-portada__textos { flex: 1 1 auto; min-width: 0; }
.fae-ap-portada__rotulo {
  margin: 2px 0 4px; font-family: Sora, sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--ap-claro);
}
.fae-ap-portada__titulo { margin: 0; font-family: Sora, sans-serif; font-size: 19px; line-height: 24px; font-weight: 700; color: #F8F9FA; letter-spacing: -0.01em; }
.fae-ap-portada__sub { margin: 4px 0 0; font-family: Inter, sans-serif; font-size: 13.5px; line-height: 20px; color: #C9D3E0; }
.fae-ap-sonido {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(248,249,250,0.06); border: 1px solid rgba(var(--ap-rgb),0.45); color: var(--ap-claro); cursor: pointer;
  transition: transform 200ms ${CURVA_REBOTE}, background 200ms ease;
}
.fae-ap-sonido:hover { transform: scale(1.06); background: rgba(var(--ap-rgb),0.16); }
.fae-ap-sonido:active { transform: scale(.94); }
.fae-ap-sonido[aria-pressed="false"] { color: #8C9BB0; border-color: rgba(248,249,250,0.18); }
.fae-ap-sonido:focus-visible, .fae-ap-ruta__paso:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }

/* La barra de avance del tema entero. */
.fae-ap-avance { display: flex; align-items: center; gap: 10px; margin: 14px 0 0; }
.fae-ap-avance__riel { position: relative; flex: 1 1 auto; height: 8px; border-radius: 999px; background: rgba(248,249,250,0.10); overflow: hidden; }
.fae-ap-avance__lleno {
  position: absolute; inset: 0; border-radius: inherit; background: var(--ap-progreso);
  box-shadow: 0 0 14px rgba(var(--ap-rgb),0.8);
  transform-origin: left center; transition: transform 700ms ${CURVA_SUAVE};
}
.fae-ap-avance__dato { font-family: Sora, sans-serif; font-size: 12px; font-weight: 700; color: var(--ap-claro); white-space: nowrap; font-variant-numeric: tabular-nums; }

/* La ruta: una píldora por pieza, unidas por una línea. */
.fae-ap-ruta {
  list-style: none; margin: 12px -16px 0; padding: 4px 16px 6px; display: flex; gap: 8px;
  overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%);
}
.fae-ap-ruta::-webkit-scrollbar { display: none; }
.fae-ap-ruta > li { flex: 0 0 auto; scroll-snap-align: start; }
.fae-ap-ruta__paso {
  display: inline-flex; align-items: center; gap: 8px; max-width: 240px; min-height: 44px; box-sizing: border-box;
  padding: 6px 14px 6px 6px; border-radius: 999px; font-family: Inter, sans-serif; font-size: 13px; line-height: 17px;
  color: #C9D3E0; background: rgba(248,249,250,0.05); border: 1px solid rgba(248,249,250,0.12); text-align: left;
  transition: transform 220ms ${CURVA_REBOTE}, background 220ms ease, border-color 220ms ease, color 220ms ease;
}
button.fae-ap-ruta__paso { cursor: pointer; }
button.fae-ap-ruta__paso:hover { transform: translateY(-2px); border-color: rgba(var(--ap-rgb),0.6); }
.fae-ap-ruta__num {
  flex-shrink: 0; width: 30px; height: 30px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
  font-family: Sora, sans-serif; font-size: 13px; font-weight: 700; color: #C9D3E0; background: rgba(248,249,250,0.08);
  position: relative;
}
.fae-ap-ruta__texto { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fae-ap-ruta__paso[data-estado="hecha"] { color: #F8F9FA; border-color: rgba(var(--ap-rgb),0.35); }
.fae-ap-ruta__paso[data-estado="hecha"] .fae-ap-ruta__num { background: rgba(var(--ap-rgb),0.9); color: #0E1B2E; }
.fae-ap-ruta__paso[data-estado="actual"] {
  color: #F8F9FA; font-weight: 600; background: rgba(var(--ap-rgb),0.18); border-color: rgba(var(--ap-rgb),0.85);
  box-shadow: 0 6px 20px -8px rgba(var(--ap-rgb),0.9);
}
.fae-ap-ruta__paso[data-estado="actual"] .fae-ap-ruta__num { background: var(--ap-sig-fondo); color: #0E1B2E; }
.fae-ap-ruta__paso[data-estado="actual"] .fae-ap-ruta__num::after {
  content: ""; position: absolute; inset: -4px; border-radius: inherit; border: 2px solid rgba(var(--ap-rgb),0.9);
  animation: fae-ap-aro 1.8s ease-out infinite;
}
@keyframes fae-ap-aro { 0% { opacity: .9; transform: scale(.9); } 100% { opacity: 0; transform: scale(1.45); } }

/* ───────── dentro de la secuencia ───────── */
.fae-ap .fae-ap-pieza-nombre {
  margin: 0 0 6px; font-family: Sora, sans-serif; font-size: 15px; font-weight: 700; line-height: 20px; color: var(--ap-claro);
}
.fae-ap .fae-ap-cejilla {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border-radius: 999px;
  background: rgba(var(--ap-rgb),0.14); border: 1px solid rgba(var(--ap-rgb),0.35); color: var(--ap-claro) !important;
  font-weight: 600;
}
.fae-ap .fae-ap-escenario {
  border-radius: 16px;
  background: radial-gradient(100% 80% at 50% 0%, rgba(var(--ap-rgb),0.08), transparent 70%);
}
/* El sello de pieza terminada, en la pantalla de cierre. */
.fae-ap-sello {
  display: inline-flex; align-items: center; gap: 8px; margin: 10px 0 0; padding: 6px 14px 6px 8px; border-radius: 999px;
  font-family: Sora, sans-serif; font-size: 13px; font-weight: 700; color: #0E1B2E;
  background: var(--ap-sig-fondo, #F8F9FA); box-shadow: 0 10px 24px -10px rgba(var(--ap-rgb, 248,249,250),0.9);
  animation: fae-ap-sello 700ms ${CURVA_REBOTE} 200ms both;
}
.fae-ap-sello__icono { width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: rgba(14,27,46,0.18); }
@keyframes fae-ap-sello { 0% { opacity: 0; transform: scale(.3) rotate(-14deg); } 100% { opacity: 1; transform: none; } }

@media (max-width: 420px) {
  .fae-ap-portada { padding: 14px 14px 12px; border-radius: 20px; margin-bottom: 14px; }
  .fae-ap-portada .fae-tema__pastilla { width: 44px; height: 44px; border-radius: 14px; }
  .fae-ap-portada .fae-tema__pastilla svg { width: 22px; height: 22px; }
  .fae-ap-portada__fila { gap: 10px; }
  .fae-ap-portada__titulo { font-size: 17px; line-height: 22px; }
  .fae-ap-portada__sub { font-size: 12.5px; line-height: 18px; }
  .fae-ap-avance { margin-top: 10px; }
  .fae-ap-ruta { margin: 8px -14px 0; padding: 4px 14px 4px; }
}
@media (min-width: 760px) {
  .fae-ap-portada { padding: 22px 24px 16px; }
  .fae-ap-portada__titulo { font-size: 22px; line-height: 28px; }
  .fae-ap-ruta { margin: 14px -24px 0; padding: 4px 24px 6px; flex-wrap: wrap; overflow: visible; -webkit-mask-image: none; mask-image: none; }
}

@media (prefers-reduced-motion: reduce) {
  .fae-ap-portada, .fae-ap-portada__luz, .fae-ap .fae-ap-bien, .fae-ap .fae-ap-mal, .fae-ap-sello,
  .fae-ap .fae-ap-sig[data-ap-listo="si"], .fae-ap-ruta__paso[data-estado="actual"] .fae-ap-ruta__num::after { animation: none !important; }
  .fae-ap .fae-ap-sig::after, .fae-ap-chispa { display: none !important; }
  .fae-ap .fae-ap-sig, .fae-ap .fae-ap-ant, .fae-ap-ruta__paso, .fae-ap-sonido, .fae-ap-avance__lleno { transition: none !important; }
}
`;
