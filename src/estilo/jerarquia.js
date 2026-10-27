/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA JERARQUÍA DEL TEXTO: QUÉ SE LEE PRIMERO (Mateo, 27-oct).
 *
 * «No se sabe qué mirar primero.» En una tarjeta de actividad había cinco
 * textos casi del mismo tamaño (10,5 · 12 · 13 · 15 · 18 px) y casi del mismo
 * gris: el ojo no tenía por dónde empezar. La regla, la de la referencia que
 * trajo Mateo: pocos tamaños, cada uno con un papel, y contraste alto.
 *
 *   título     20 px · Sora 700 · blanco            lo primero: de qué va
 *   cuerpo     15 px · Inter · blanco               lo segundo: qué se busca
 *   apoyo      14 px · Inter · #C9D3E0              cómo se hace
 *   rótulo     12 px · Sora 700 · color de acento   dónde estás (cejilla)
 *   dato       12 px · Inter 600 · #A8B6C8          ronda, «¿Cómo se juega?»
 *
 * Nada de blanco con alfa: el gris de un alfa depende del fondo que tenga
 * debajo, y en Estratégico ese fondo se mueve. El contraste medido va en el PR.
 *
 * Lo usan los componentes compartidos que enmarcan las actividades de Hacer de
 * Contabilidad y Macroeconomía: el panel (salaDeControl/marco.jsx), el
 * encabezado de Hacer (tema1/encabezado.jsx, también el de T7), el compacto de
 * T5/T6 y los contadores y enunciados de corazon/juego.jsx.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const BLANCO = "#F8F9FA";
export const APOYO = "#C9D3E0";
export const DATO = "#A8B6C8";

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

export const TITULO = { fontFamily: SORA, fontSize: "20px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em", color: BLANCO };
export const CUERPO = { fontFamily: INTER, fontSize: "15px", lineHeight: 1.5, color: BLANCO };
export const TEXTO_APOYO = { fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: APOYO };
export const ROTULO = { fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em" };
export const TEXTO_DATO = { fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: DATO };
