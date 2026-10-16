/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REGISTRO DE IDENTIFICADORES DE TEMA.
 *
 * La clave es «materia/tema», no solo el tema: dos materias pueden tener un
 * tema con el mismo id y el identificador es de la tarjeta, no del contenido.
 *
 * ESTÁ VACÍO A PROPÓSITO. Mateo pidió los identificadores el 16 de octubre y
 * Xeno define el sistema —tamaño, estilo, paleta y movimiento— antes de que
 * nadie dibuje. Cada célula añade aquí los de SUS temas cuando el sistema
 * exista; mientras tanto, cada tarjeta sigue mostrando el ícono de la
 * materia, que es exactamente lo que se ve hoy.
 *
 * CÓMO SE AÑADE UNO, cuando llegue el momento:
 *
 *   import { LasCuentas } from "../contabilidad/identificadores/identificadores.jsx";
 *   export const ICONO_POR_TEMA = {
 *     "contabilidad/cuentas-debe-haber": LasCuentas,
 *   };
 *
 * El componente recibe el tamaño del sitio donde va. No pone colores propios:
 * el trazo es currentColor, como los íconos de actividad, para que el color
 * lo ponga la tarjeta según su estado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ICONO_POR_TEMA = {};
