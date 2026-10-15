/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESCALERA DE AYUDA DE LAS PREGUNTAS DE APRENDER (Célula C · T7 y T5).
 *
 * Lote 2 de la revisión de calidad (Mateo, L). En toda pregunta de opción de
 * una pieza de Aprender:
 *
 *   · primer error    la PISTA de la pantalla (`pantalla.pista`), que no
 *                     nombra la respuesta
 *   · segundo error   la respuesta, con su porqué: el texto de la opción
 *     y siguientes    correcta y el acierto de la pantalla
 *
 * MIENTRAS UNA PREGUNTA NO TENGA PISTA, SE COMPORTA COMO HOY: cada error
 * muestra la devolución de la opción que se tocó. Las pistas las escribe
 * Near y entran solo por los datos; este archivo no escribe texto de
 * contenido.
 *
 * CONVENCIÓN (no es texto de Near): la respuesta se anuncia con «La
 * respuesta es «…».», y al acierto que la sigue se le quita el «Así es.» o
 * «Así es:» del comienzo, que tras un error no se lee bien.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const anunciarRespuesta = (texto) => `La respuesta es «${String(texto).replace(/\.$/, "")}».`;

/* «Así es. El libro…» → «El libro…»; «Así es: $1.000 × 2 = $2.000.» → «$1.000 × 2 = $2.000.» */
export const sinAsiEs = (texto) => String(texto ?? "").replace(/^Así es[.:]\s*/, "");

/** Los textos del mensaje de error, según cuántas veces se ha fallado ya esta pregunta (1, 2, …). */
export function textosDelError(pantalla, opcion, fallos) {
  if (!pantalla.pista) return [opcion.devolucion];
  if (fallos <= 1) return [pantalla.pista];
  const correcta = pantalla.opciones.find((o) => o.correcta);
  const porque = sinAsiEs(pantalla.acierto?.texto);
  return [anunciarRespuesta(correcta.texto), ...(porque ? [porque] : [])];
}

/** Al confirmar: si la opción elegida es incorrecta, cuenta un fallo más. */
export function contarFallo(pantalla, idElegida, setFallos) {
  const o = pantalla.opciones.find((x) => x.id === idElegida);
  if (o && !o.correcta) setFallos((n) => n + 1);
}
