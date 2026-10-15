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
 * respuesta es «…».», y al acierto que la sigue se le quita el «Así es.»,
 * «Así es:» o «Exacto.» del comienzo, que tras un error no se leen bien.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const anunciarRespuesta = (texto) => `La respuesta es «${String(texto).replace(/\.$/, "")}».`;

/*
 * «Así es. El libro…» → «El libro…»; «Exacto. …» → «…»; «Así es: la rebaja…»
 * → «La rebaja…» (lo que queda empieza en mayúscula, porque abre su frase).
 */
export const sinAsiEs = (texto) => {
  const t = String(texto ?? "").replace(/^(Así es|Exacto)[.:]\s*/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/* El porqué de una pantalla: su acierto, que unas piezas guardan como `texto` y otras como `textos` (uno por párrafo). */
const porquesDe = (pantalla) => (pantalla.acierto?.texto != null ? [pantalla.acierto.texto] : pantalla.acierto?.textos ?? []).map(sinAsiEs).filter(Boolean);

/** Los textos del mensaje de error, según cuántas veces se ha fallado ya esta pregunta (1, 2, …). */
export function textosDelError(pantalla, opcion, fallos) {
  if (!pantalla.pista) return [opcion.devolucion];
  if (fallos <= 1) return [pantalla.pista];
  const correcta = pantalla.opciones.find((o) => o.correcta);
  return [anunciarRespuesta(correcta.texto), ...porquesDe(pantalla)];
}

/** Al confirmar: si la opción elegida es incorrecta, cuenta un fallo más. */
export function contarFallo(pantalla, idElegida, setFallos) {
  const o = pantalla.opciones.find((x) => x.id === idElegida);
  if (o && !o.correcta) setFallos((n) => n + 1);
}

/*
 * LAS LÍNEAS DE DEBE O HABER (decisión de L sobre el anexo del lote 2): se
 * quedan en dos lados. Al primer error de una línea sale su pista; al
 * segundo, la línea se cierra con la respuesta y su porqué (la devolución
 * de la línea) y queda puesta en su lado, sin poder moverse. La pista es de
 * la línea (`linea.pista`) o, si la pantalla comparte una para todas sus
 * líneas, de la pantalla (`pantalla.pista`). Sin pista, como hoy: cada error
 * muestra la devolución de la línea.
 */
export const pistaDeLinea = (pantalla, linea) => linea.pista ?? pantalla.pista ?? null;

const nombreDelLado = (lado) => String(lado).charAt(0).toUpperCase() + String(lado).slice(1);

/** Los textos del error de una línea, según cuántas veces se ha fallado ya esa línea (1, 2, …). */
export function textosDeLinea(pantalla, linea, fallos) {
  const pista = pistaDeLinea(pantalla, linea);
  if (!pista) return [linea.devolucion];
  if (fallos <= 1) return [pista];
  return [anunciarRespuesta(nombreDelLado(linea.lado)), linea.devolucion];
}

/** ¿La línea ya se cerró? Solo con pista, y desde el segundo error. */
export const lineaCerrada = (pantalla, linea, fallos) => Boolean(pistaDeLinea(pantalla, linea)) && (fallos ?? 0) >= 2;

/** Al confirmar: un fallo más para cada línea mal puesta. */
export const sumarFallosDeLineas = (fallos, malas) => malas.reduce((f, id) => ({ ...f, [id]: (f[id] ?? 0) + 1 }), fallos);

/** Al probar otra: las líneas cerradas quedan en su lado; las demás malas se vacían. */
export function puestoTrasProbarOtra(puesto, malas, lineas, cerrada) {
  const n = { ...puesto };
  for (const id of malas) {
    const l = lineas.find((x) => x.id === id);
    if (l && cerrada(l)) n[id] = l.lado;
    else delete n[id];
  }
  return n;
}
