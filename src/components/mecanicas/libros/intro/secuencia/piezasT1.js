import { PIEZA_RECORRIDO } from "./piezaRecorrido.jsx";
import { PIEZA_OCHO_LEEN } from "./piezaOchoLeen.jsx";
import { PIEZA_ECUACION } from "./piezaEcuacion.jsx";

/*
 * Las piezas de T1 en secuencia, en su orden (lote 6). Hoy van las dos
 * primeras: cu0-a1 y «Ocho leen lo mismo». cu0-a2, cu0-a3 y cu0-a4 se suman
 * aquí cuando estén, y entonces la secuencia dice «Pieza k de 5».
 */
export const PIEZAS_T1_SECUENCIA = [PIEZA_RECORRIDO, PIEZA_OCHO_LEEN, PIEZA_ECUACION];

/*
 * ═══════════ LA BANDERA ═══════════
 * Lo publicado no se borra: mientras Shoko no dé PASA, el estudiante sigue
 * viendo las cuatro capas de siempre. La secuencia se abre solo con
 * `?aprender=secuencia` en la dirección (para auditar y medir).
 */
export function secuenciaActiva(buscar = globalThis.location?.search ?? "") {
  try {
    return new URLSearchParams(buscar).get("aprender") === "secuencia";
  } catch {
    return false;
  }
}
