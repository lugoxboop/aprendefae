/*
 * MACRO 2026 · EL FONDO DE LAS ACTIVIDADES
 *
 * Antes, alrededor de la tarjeta solo había el navy plano (#0E1B2E) y la
 * actividad se veía «sin fondo» (Mateo, 24-nov-2026). Se usa la misma malla
 * del sitio (MallaAnimada: Inicio, Perfil, Amigos, Tienda, Clase en vivo), con
 * otras manchas:
 *
 * - SIN CORAL. En Macro el coral significa error (colores-da.js): una mancha
 *   coral detrás de un reto se leería como «algo va mal».
 * - MÁS TENUES que en la portada (0,34–0,46 contra 0,46–0,62), medidas para que el texto secundario siga sobre 4,5:1: aquí el
 *   fondo acompaña, la tarjeta manda. Las tarjetas son opacas (SUPERFICIE), así
 *   que el contraste del texto dentro de ellas no cambia; lo que queda encima
 *   del fondo (botón de volver, rótulos) se mide en la sonda.
 *
 * Mismas animaciones (solo transform, quietas con «reducir movimiento»).
 */
import { FAE } from "../../theme.js";
import { NAVY_CLARO } from "../../components/backgrounds/MeshGradientBackground.jsx";

/* Índigo de la escena (cielo de H4/A-escenarios), subido para que se note. */
const INDIGO = "#4B5BA8";

export const MANCHAS_ACTIVIDAD = [
  { color: FAE.teal, tamano: "58vmax", izquierda: "-16%", arriba: "-14%", desenfoque: "90px", opacidad: 0.34, keyframes: "fae-mesh-a", duracion: "38s" },
  { color: INDIGO, tamano: "54vmax", izquierda: "46%", arriba: "34%", desenfoque: "86px", opacidad: 0.38, keyframes: "fae-mesh-b", duracion: "31s" },
  { color: NAVY_CLARO, tamano: "66vmax", izquierda: "10%", arriba: "-4%", desenfoque: "96px", opacidad: 0.46, keyframes: "fae-mesh-c", duracion: "35s" },
];
