import { FAE } from "../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTILO DE LA CLASE EN VIVO — tablero y celular.
 *
 * Tono de liga universitaria, no de recreo (riesgo 2 del análisis): el azul
 * noche del sitio, Sora para lo que se lee de lejos, y un color por opción
 * que acompaña a la letra. La letra es la que manda; el color solo ayuda a
 * encontrarla en el tablero desde el fondo del salón.
 *
 * Movimiento: la curva de la casa, solo transform y opacity, nada en bucle, y
 * con movimiento reducido todo aparece quieto. Las barras de resultados crecen
 * con scaleX desde la izquierda.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CURVA = "cubic-bezier(.3,.9,.4,1)";

export const V = {
  bg: FAE.bg,
  panel: "#14233A",
  panel2: "#1A2D49",
  linea: "rgba(248,249,250,0.10)",
  texto: FAE.text,
  apoyo: "#C9D3E0",
  dato: "#A8B6C8",
  teal: FAE.teal,
  ambar: FAE.ambar,
  coral: FAE.coral,
};

/* Un color por letra. Los cuatro primeros son los de la marca. */
export const COLORES = ["#2A9D8F", "#E9C46A", "#E76F51", "#9B8CF0", "#4EA8DE", "#E07AA0", "#8CC152", "#A8B6C8"];

export const CSS_VIVO = `
.vivo, .vivo * { box-sizing: border-box; }
.vivo { min-height: 100vh; background: radial-gradient(120% 80% at 50% -10%, #1A2F4D 0%, ${V.bg} 60%); color: ${V.texto}; font-family: Inter, system-ui, sans-serif; }
.vivo-marco { max-width: 1120px; margin: 0 auto; padding: 24px max(16px, env(safe-area-inset-right, 0px)) 48px max(16px, env(safe-area-inset-left, 0px)); display: flex; flex-direction: column; gap: 22px; }
.vivo-titulo { margin: 0; font-family: Sora, sans-serif; font-weight: 700; letter-spacing: -0.02em; text-wrap: balance; }
.vivo-cejilla { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${V.teal}; }
.vivo-nota { margin: 0; color: ${V.apoyo}; font-size: 14.5px; line-height: 1.55; }
.vivo-tarjeta { background: ${V.panel}; border: 1px solid ${V.linea}; border-radius: 18px; padding: 18px 20px; }

.vivo-boton { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 24px; border-radius: 999px; border: none; cursor: pointer;
  background: ${V.teal}; color: #06202A; font-family: Sora, sans-serif; font-size: 15.5px; font-weight: 700;
  transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.vivo-boton:active { transform: scale(.97); }
.vivo-boton:disabled { opacity: .45; cursor: default; }
.vivo-boton--suave { background: rgba(248,249,250,0.08); color: ${V.texto}; border: 1px solid rgba(248,249,250,0.16); }
.vivo-boton:focus-visible, .vivo-chip:focus-visible, .vivo-opcion:focus-visible, .vivo-campo:focus-visible { outline: 3px solid ${V.ambar}; outline-offset: 2px; }

.vivo-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.vivo-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; cursor: pointer; font-size: 14px; font-weight: 600;
  border: 1px solid rgba(248,249,250,0.16); background: transparent; color: ${V.apoyo};
  transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.vivo-chip[aria-pressed="true"] { background: rgba(42,157,143,0.18); border-color: ${V.teal}; color: ${V.texto}; }
.vivo-chip:active { transform: scale(.97); }

.vivo-temas { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 10px; }
.vivo-tema { text-align: left; min-height: 64px; padding: 14px 16px; border-radius: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 4px;
  background: ${V.panel2}; border: 1px solid ${V.linea}; color: ${V.texto}; font-family: inherit;
  transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.vivo-tema[aria-pressed="true"] { border-color: ${V.teal}; box-shadow: inset 0 0 0 1px ${V.teal}; background: rgba(42,157,143,0.12); }
.vivo-tema b { font-family: Sora, sans-serif; font-size: 15px; }
.vivo-tema span { color: ${V.dato}; font-size: 12.5px; }

.vivo-codigo { font-family: Sora, sans-serif; font-weight: 700; letter-spacing: 0.08em; font-variant-numeric: tabular-nums; line-height: 1; }

.vivo-opciones { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.vivo-opcion { position: relative; display: flex; align-items: center; gap: 14px; min-height: 64px; padding: 12px 16px; border-radius: 16px; text-align: left;
  background: ${V.panel}; border: 1px solid ${V.linea}; color: ${V.texto}; font-family: inherit; font-size: 16px; line-height: 1.35; overflow: hidden;
  transition: transform 160ms ${CURVA}, opacity 220ms ${CURVA}; }
button.vivo-opcion { cursor: pointer; }
button.vivo-opcion:active { transform: scale(.98); }
.vivo-letra { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px;
  font-family: Sora, sans-serif; font-weight: 700; font-size: 18px; color: #0B1626; }
.vivo-opcion__texto { position: relative; flex: 1; min-width: 0; overflow-wrap: anywhere; }
.vivo-opcion--apagada { opacity: .42; }
.vivo-opcion--correcta { border-color: ${V.teal}; box-shadow: inset 0 0 0 2px ${V.teal}; }
.vivo-barra { position: absolute; inset: 0; transform-origin: left center; transform: scaleX(0); animation: vivo-crece 700ms ${CURVA} 120ms both; }
.vivo-cifra { position: relative; flex: none; font-family: Sora, sans-serif; font-weight: 700; font-variant-numeric: tabular-nums; }

.vivo-reloj { height: 8px; border-radius: 999px; background: rgba(248,249,250,0.08); overflow: hidden; }
.vivo-reloj > span { display: block; height: 100%; width: 100%; transform-origin: left center; border-radius: inherit; transition: transform 220ms ${CURVA}; }

.vivo-entra { animation: vivo-sube 380ms ${CURVA} both; }
.vivo-entra-2 { animation: vivo-sube 380ms ${CURVA} 90ms both; }
.vivo-entra-3 { animation: vivo-sube 380ms ${CURVA} 180ms both; }
.vivo-pop { animation: vivo-pop 420ms ${CURVA} both; }

@keyframes vivo-sube { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes vivo-crece { from { transform: scaleX(0); } to { transform: scaleX(var(--parte, 0)); } }
@keyframes vivo-pop { 0% { opacity: 0; transform: scale(.8); } 60% { opacity: 1; transform: scale(1.04); } 100% { transform: none; } }

.vivo-campo { width: 100%; min-height: 64px; border-radius: 16px; border: 1px solid rgba(248,249,250,0.2); background: rgba(248,249,250,0.06); color: ${V.texto};
  font-family: Sora, sans-serif; font-weight: 700; font-size: 30px; letter-spacing: 0.2em; text-align: center; font-variant-numeric: tabular-nums; }

.vivo-tabla { width: 100%; border-collapse: collapse; font-size: 14px; }
.vivo-tabla th { text-align: left; color: ${V.dato}; font-weight: 600; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 10px; border-bottom: 1px solid ${V.linea}; }
.vivo-tabla td { padding: 10px; border-bottom: 1px solid ${V.linea}; color: ${V.apoyo}; font-variant-numeric: tabular-nums; }
.vivo-tabla td:first-child { color: ${V.texto}; }

@media (max-width: 640px) {
  .vivo-opciones { grid-template-columns: minmax(0, 1fr); }
  .vivo-marco { gap: 18px; padding-top: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .vivo-boton, .vivo-chip, .vivo-tema, .vivo-opcion, .vivo-reloj > span { transition: none; }
  .vivo-entra, .vivo-entra-2, .vivo-entra-3, .vivo-pop { animation: none; }
  .vivo-barra { animation: none; transform: scaleX(var(--parte, 0)); }
}
`;
