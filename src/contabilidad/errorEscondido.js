import { ERROR_ESCONDIDO } from "../data/contabilidadActividades.js";
import { nombreDeTipo } from "./siembra.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CALIFICACIÓN DE CU-12 · EL ERROR ESCONDIDO.
 *
 * Dos preguntas por caso —cuál cuenta y qué le pasa— y la devolución de cada
 * una sale entera de la ficha. Lo único que decide este archivo es CUÁL de
 * los textos escritos corresponde a cada equivocación.
 *
 * ═══════════ EL TIPO SE PREGUNTA AUNQUE LA CUENTA FALLE ═══════════
 *
 * Al responder la cuenta se revela cuál era, y la segunda pregunta va sobre
 * ESA. Preguntar «¿qué le pasa?» sobre una cuenta que el estudiante acaba de
 * señalar por error no tendría respuesta posible —no le pasa nada—, y saltarse
 * la pregunta dejaría el 40 % del caso sin adjudicar por un fallo que ya se
 * cobró en el otro 60 %. Se cobra una vez, y el diagnóstico se aprende igual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PESO = ERROR_ESCONDIDO.peso;

/** ¿Señaló la cuenta que lleva el error? */
export function evaluarCuenta(caso, señalada, { descuadra }) {
  const ok = señalada === caso.cuenta;
  if (ok) return { ok, texto: ERROR_ESCONDIDO.aciertoCuenta.replace(/\{cuenta\}/g, caso.cuenta) };
  /*
   * La pista de la ficha manda a comparar los dos totales. Cuando la balanza
   * está nivelada esa pista no lleva a ninguna parte, y hay una línea aparte
   * para ese caso.
   */
  return { ok, texto: descuadra ? ERROR_ESCONDIDO.errores.cuentaSana : ERROR_ESCONDIDO.errores.cuentaSanaSinDescuadre };
}

/**
 * ¿Diagnosticó bien? Los textos cubren las confusiones que el capítulo nombra;
 * para las demás, la explicación del propio caso dice la verdad del asunto.
 */
export function evaluarTipo(caso, dicho) {
  const ok = dicho === caso.tipo;
  const e = ERROR_ESCONDIDO.errores;
  const explicacion = caso.explicacion;

  if (ok) {
    return {
      ok,
      texto: ERROR_ESCONDIDO.aciertoTipo
        .replace(/\{tipo\}/g, nombreDeTipo(caso.tipo))
        .replace(/\{explicacion\}/g, explicacion),
    };
  }

  let texto;
  if (caso.tipo === "falta") texto = e.consignacion;
  else if (dicho === "falta") texto = e.faltaPorMalPuesto;
  else if (caso.tipo === "lado" && dicho === "valor") texto = e.valorPorLado;
  else if (caso.tipo === "valor" && dicho === "lado") texto = e.ladoPorValor;
  /*
   * [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
   * Las cuatro confusiones que quedan —decir «cuenta» donde era lado o valor,
   * y al revés— no tienen texto propio en la ficha. La frase que se usa es la
   * explicación del caso, que sí la escribió la ficha; lo único añadido es la
   * marca de error delante.
   */
  else texto = `❌ ${explicacion}`;

  return { ok, texto };
}

/** La nota del intento: dentro de cada caso, la cuenta pesa 60 % y el tipo 40 %. */
export function puntuarErrorEscondido(respuestas) {
  if (respuestas.length === 0) return 0;
  const suma = respuestas.reduce(
    (s, r) => s + (r.cuentaOk ? PESO.cuenta : 0) + (r.tipoOk ? PESO.tipo : 0),
    0,
  );
  return (suma / respuestas.length) * 100;
}
