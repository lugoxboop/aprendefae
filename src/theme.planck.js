/*
 * Planck — constantes de la capa de marca de la empresa, para componentes que
 * usan estilos en línea (como casi todo el sitio). Hermano de FAE y COLORS en
 * theme.js: no los reemplaza. FAE sigue siendo la paleta semántica de las
 * actividades (teal DEBE, ámbar HABER, coral error); PLANCK es la capa de la
 * empresa: entrada, pie, favicon, propuestas, panel docente en su cromo.
 *
 * Fuente de verdad: tokens.json del sistema Planck. No cambies un valor aquí
 * sin cambiarlo allá.
 *
 * Para dejarlo en theme.js sin tocar lo existente, añade al final:
 *   export { PLANCK, PLANCK_CLARO, PLANCK_OSCURO, PLANCK_TIPO } from "./theme.planck.js";
 */
export const PLANCK_CLARO = {
  "surface-0": "#ffffff",
  "surface-1": "#f1f2f4",
  "surface-2": "#e4e6ea",
  "border": "#d3d7de",
  "border-strong": "#7f8591",
  "ink": "#121418",
  "ink-2": "#565c66",
  "ink-3": "#636973",
  "accent": "#2747f5",
  "accent-hover": "#1a33c2",
  "accent-soft": "#e6eaff",
  "on-accent": "#ffffff",
  "success": "#1f7a6e",
  "success-soft": "#e3f6f2",
  "warning": "#8a5a00",
  "warning-soft": "#fbefd0",
  "error": "#b8471f",
  "error-soft": "#fceae3",
  "focus": "#2747f5",
  "product-debe": "#1f7a6e",
  "product-haber": "#8a5a00"
};
export const PLANCK_OSCURO = {
  "surface-0": "#121418",
  "surface-1": "#1b1e24",
  "surface-2": "#262a32",
  "border": "#3a3f49",
  "border-strong": "#6b7280",
  "ink": "#f4f5f7",
  "ink-2": "#b6bbc5",
  "ink-3": "#8e94a0",
  "accent": "#6f86ff",
  "accent-hover": "#8a9cff",
  "accent-soft": "#1e2550",
  "on-accent": "#121418",
  "success": "#4fc2b2",
  "success-soft": "#163b36",
  "warning": "#f2c14e",
  "warning-soft": "#3b2f0e",
  "error": "#f28b6a",
  "error-soft": "#45231a",
  "focus": "#f4f5f7",
  "product-debe": "#2a9d8f",
  "product-haber": "#e9c46a"
};
/* El sitio es oscuro: PLANCK por defecto es el tema oscuro. */
export const PLANCK = PLANCK_OSCURO;
export const PLANCK_TIPO = {
  sans: "\"Geist\", system-ui, -apple-system, \"Segoe UI\", sans-serif",
  mono: "\"Geist Mono\", ui-monospace, \"SF Mono\", Menlo, monospace",
  /* Títulos: Geist 700, interletrado negativo. Rótulos: Geist Mono 500, mayúsculas, +0.06em. */
  titulo: { fontFamily: "\"Geist\", system-ui, -apple-system, \"Segoe UI\", sans-serif", fontWeight: 700, letterSpacing: "-0.035em" },
  rotulo: { fontFamily: "\"Geist Mono\", ui-monospace, \"SF Mono\", Menlo, monospace", fontWeight: 500, fontSize: 12, lineHeight: "16px", letterSpacing: "0.06em", textTransform: "uppercase" },
};
export const PLANCK_ESPACIO = {"space-1": 4, "space-2": 8, "space-3": 12, "space-4": 16, "space-5": 20, "space-6": 24, "space-8": 32, "space-12": 48, "space-16": 64};
export const PLANCK_RADIO = {"radius-0": 0, "radius-sm": 4, "radius-md": 8, "radius-lg": 12, "radius-xl": 22};
