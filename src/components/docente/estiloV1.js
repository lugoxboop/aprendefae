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
/* align-items: start desde que son tres columnas: sin esto la rejilla estira
 * las tres al alto de la más larga y las otras dos quedan con un faldón
 * gris debajo de su último renglón, que a 1280 era medio bloque vacío. */
@media (min-width: 900px) { .pd1-rejilla { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; } }
@media (max-width: 399px) { .pd1-tercera { display: none; } }
.pd1-b4 { display: none; }
@media (min-width: 1024px) { .pd1-b4 { display: block; } }
.pd1-toque { min-height: 44px; }
.pd1-foco:focus-visible, .pd1 button:focus-visible, .pd1 input:focus-visible, .pd1 select:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.pd1-nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
/* Hasta dos renglones (Shibukawa, #498): el motivo de B2 y el nombre de una actividad no se cortan en uno. */
.pd1-dos { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; min-width: 0; overflow-wrap: anywhere; }
@keyframes pd1-pulso { 0%, 100% { opacity: .55; } 50% { opacity: .9; } }
.pd1-esqueleto { background: rgba(248,249,250,0.06); border-radius: 8px; }
@media (prefers-reduced-motion: reduce) { .pd1-entrar { animation: none !important; } }

/*
 * Panel v2: la segunda franja en dos columnas.
 *
 * Hasta 1024 px, una sola columna apilada: el profesor mira esto de pie,
 * entre clases y con el teléfono, y una matriz de dos columnas a 375 px no
 * existe. Desde 1024, el gráfico a la izquierda y a quién mirar a la derecha
 * —el concepto que falla junto a la persona que lo falla—, que es lo que
 * llenaba la mitad de pantalla que antes quedaba en blanco.
 *
 * align-items: start para que la columna corta no se estire hasta el alto de
 * la larga y deje un hueco gris debajo de su último renglón.
 */
.pd2-dos { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 12px; align-items: start; }
@media (min-width: 1024px) { .pd2-dos { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; } }

/*
 * ═══════════ LA ESTÉTICA DE LA BARRA LATERAL (Mateo, 18-nov) ═══════════
 *
 * El panel habla el mismo idioma que el menú de la cuenta (#681): iconos en
 * su pastilla de color, flecha que asoma al pasar, entrada en fila desde la
 * izquierda y un brillo teal y coral arriba. Misma curva que la barra
 * (cubic-bezier(.22,1,.36,1)), mismos 30 ms entre hermanos.
 *
 * Todo botón del panel reacciona igual: sube un píxel y aclara. Con filter y
 * transform, sin pisar el fondo que cada botón ya trae en línea.
 */
@keyframes pd3-entra { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
@keyframes pd3-brilla { from { opacity: 0; } to { opacity: 1; } }
.pd1 button { transition: filter 160ms ease, transform 200ms cubic-bezier(.22,1,.36,1), background-color 160ms ease, border-color 160ms ease; }
.pd1 button:not(:disabled):hover { filter: brightness(1.18); }
.pd1 button:not(:disabled):active { transform: scale(0.98); }
.pd3-titulo-icono { transition: transform 200ms cubic-bezier(.22,1,.36,1); }
.pd1 section:hover .pd3-titulo-icono { transform: scale(1.08) rotate(-4deg); }
.pd3-opcion { animation: pd3-entra 320ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(120ms + var(--i, 0) * 30ms); }
.pd3-opcion .pd3-icono { transition: transform 200ms cubic-bezier(.22,1,.36,1); }
.pd3-opcion .pd3-flecha { opacity: 0.35; transform: translateX(-4px); transition: opacity 160ms ease, transform 200ms ease; }
.pd3-opcion:not(:disabled):hover, .pd3-opcion:not(:disabled):focus-visible { background-color: rgba(248,249,250,0.06) !important; filter: none; }
.pd3-opcion:not(:disabled):hover .pd3-icono, .pd3-opcion:not(:disabled):focus-visible .pd3-icono { transform: scale(1.08); }
.pd3-opcion:not(:disabled):hover .pd3-flecha, .pd3-opcion:not(:disabled):focus-visible .pd3-flecha { opacity: 0.8; transform: none; }
.pd3-vistas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; }
@media (min-width: 720px) { .pd3-vistas { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; } }
/* A menos de 420 px el anillo le quita a «Panel docente» el sitio para leerse entero. */
@media (max-width: 419px) { .pd3-marca { display: none !important; } }
.pd3-brillo { animation: pd3-brilla 600ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .pd3-opcion, /* A menos de 420 px el anillo le quita a «Panel docente» el sitio para leerse entero. */
@media (max-width: 419px) { .pd3-marca { display: none !important; } }
.pd3-brillo { animation: none; }
  .pd1 button, .pd3-titulo-icono, .pd3-opcion .pd3-icono, .pd3-opcion .pd3-flecha { transition: none; }
}
`;

/*
 * Los colores de icono de cada bloque, los mismos de la barra de la cuenta:
 * teal es «tu clase», ámbar «aviso», el azul «mirar datos», el violeta
 * «personas». Coral sigue reservado al error (P6): el bloque que más costó
 * lleva el coral claro de «Cerrar sesión» en hover, no el de error.
 */
export const TONOS_PANEL = {
  clase: "#2A9D8F",
  atencion: "#E9C46A",
  costo: "#F4A28C",
  esfuerzo: "#8FB8E8",
  mirar: "#C39BD3",
  estudiantes: "#2A9D8F",
  actividades: "#8FB8E8",
};

/* Un título de bloque con su icono delante. */
export const tituloConIcono = { ...{ margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: "#F8F9FA" }, display: "flex", alignItems: "center", gap: "10px" };

/*
 * La tarjeta, con el acabado de la barra lateral: un brillo teal apenas en la
 * esquina de arriba (5 %: más que eso baja el teal de texto de 4,5:1 —
 * medido— y deja de pasar AA) y una sombra larga que la despega del fondo.
 */
export const tarjetaV1 = {
  padding: "16px",
  borderRadius: "18px",
  background: `radial-gradient(120% 90% at 0% 0%, rgba(42,157,143,0.05), transparent 60%), ${V1.tarjeta}`,
  border: V1.borde,
  boxShadow: "inset 0 1px 0 rgba(248,249,250,0.04), 0 14px 36px rgba(0,0,0,0.22)",
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
  display: "inline-flex", alignItems: "center", minHeight: "44px", marginBottom: "14px", padding: "0 16px",
  borderRadius: "12px", background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.10)",
  color: FAE.text, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "13px",
};
