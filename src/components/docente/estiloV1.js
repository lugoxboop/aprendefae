import { FAE } from "../../theme.js";

/*
 * Panel docente v1 (Ukyo §11): las medidas comunes de los bloques nuevos.
 * Tarjeta #1C2939 sobre el fondo #0E1B2E, borde de 1 px al 8 %. Nada por
 * debajo de 12 px. Toque mínimo 44 px. Foco de 2 px en #F8F9FA.
 */
export const V1 = {
  tarjeta: "#1C2939",
  borde: "1px solid rgba(248,249,250,0.08)",
  texto2: "#A8B6C8",
  /* El teal de texto (Ukyo, «Bajo»): el de la marca no llega a 4,5:1 sobre la tarjeta. */
  tealTexto: "#3FA69A",
  curva: "cubic-bezier(.3,.9,.4,1)",
};

export const CSS_V1 = `
@keyframes pd1-entrar { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.pd1-entrar { animation: pd1-entrar 280ms ${V1.curva} both; }
.pd1-rejilla { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
@media (min-width: 900px) { .pd1-rejilla { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
.pd1-b4 { display: none; }
@media (min-width: 1024px) { .pd1-b4 { display: block; } }
.pd1-toque { min-height: 44px; }
.pd1-foco:focus-visible, .pd1 button:focus-visible, .pd1 input:focus-visible, .pd1 select:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.pd1-nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
@keyframes pd1-pulso { 0%, 100% { opacity: .55; } 50% { opacity: .9; } }
.pd1-esqueleto { background: rgba(248,249,250,0.06); border-radius: 8px; }
@media (prefers-reduced-motion: reduce) { .pd1-entrar { animation: none !important; } }
`;

export const tarjetaV1 = {
  padding: "14px",
  borderRadius: "14px",
  background: V1.tarjeta,
  border: V1.borde,
  minWidth: 0,
};

export const tituloBloque = { margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text };
export const notaV1 = { margin: 0, fontSize: "13px", lineHeight: 1.5, color: V1.texto2 };

/* Un enlace de bloque: botón de texto con 44 px de alto. */
export const enlaceV1 = {
  display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 2px",
  background: "transparent", border: "none", cursor: "pointer", color: FAE.text,
  fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
  textDecorationLine: "underline", textUnderlineOffset: "3px", textDecorationColor: "rgba(248,249,250,0.35)",
};

/* El botón de volver de cada vista aparte. */
export const volverV1 = {
  display: "inline-flex", alignItems: "center", minHeight: "44px", marginBottom: "14px", padding: "0 14px",
  borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)",
  color: FAE.text, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "13px",
};
