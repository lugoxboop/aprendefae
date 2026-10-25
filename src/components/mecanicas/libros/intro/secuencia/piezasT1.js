import { PIEZA_RECORRIDO } from "./piezaRecorrido.jsx";
import { PIEZA_OCHO_LEEN } from "./piezaOchoLeen.jsx";
import { PIEZA_ECUACION } from "./piezaEcuacion.jsx";
import { PIEZA_FOTO_PELICULA } from "./piezaFotoPelicula.jsx";
import { PIEZA_ARTICULAN } from "./piezaArticulan.jsx";

/*
 * Las piezas de T1 en secuencia, en su orden (lote 6): cu0-a1, «Ocho leen lo
 * mismo», cu0-a2, cu0-a3 y cu0-a4. La secuencia dice «Pieza k de 5».
 */
export const PIEZAS_T1_SECUENCIA = [PIEZA_RECORRIDO, PIEZA_OCHO_LEEN, PIEZA_ECUACION, PIEZA_FOTO_PELICULA, PIEZA_ARTICULAN];

/*
 * ═══════════ LA BANDERA ═══════════
 * Con el PASA de Shoko (#559), la secuencia es lo que ve el estudiante. Las
 * cuatro capas de siempre siguen en el código, detrás de la bandera
 * contraria: `?aprender=capas` en la dirección las devuelve, y volver atrás
 * para todos es cambiar esta función, en un paso.
 *
 * No hay avance que migrar: el Aprender de T1 no guarda nada en el servidor
 * (CuatroCapas no da FP ni marca nada como hecho; la secuencia solo recuerda en
 * sessionStorage en qué pantalla va). Lo fija t1-avance.test.mjs.
 */
export const BANDERA_CAPAS = "capas";

export function secuenciaActiva(buscar = globalThis.location?.search ?? "") {
  try {
    return new URLSearchParams(buscar).get("aprender") !== BANDERA_CAPAS;
  } catch {
    return true;
  }
}
