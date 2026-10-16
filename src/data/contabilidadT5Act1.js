/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 1 — «¿Qué renta da este título?» (Célula B).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo: el contenido de
 * Futaba (PASA de Shoko) en la guía v2 de Mai, guardada en
 * orquestador/conocimiento/paquetes/b5-t5-act1.md. Cuando Futaba reescriba
 * los textos que no llegan a 65 en INFLESZ (def-emisora, caso-pactado, el
 * acierto de def-interes y el resumen), el cambio es solo de datos.
 *
 * Como en T1-6, el ✅ y el ❌ van al inicio de cada devolución y Retro los
 * separa; lo que sigue al emoji es literal de la guía.
 *
 * El segundo fallo sigue la REGLA ÚNICA de la célula (b5SegundoFallo.js): el
 * acierto sin «Sí.» y con «No es esa.» delante. Por eso tres aciertos de
 * renta variable (acciones, def-emisora, def-dividendos) dicen ahora el tipo
 * de renta (Futaba, PASA de Shoko): sin eso, el segundo fallo no daba la
 * respuesta. La antigua columna «tras el segundo fallo» ya no existe.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T5_ACT1 = {
  id: "b5-t5-a1",
  nombre: "¿Qué renta da este título?",
  dificultad: "facil",
  fpBase: 10,
  porPartida: 9,
  objetivo: "Distinguir los tres tipos de título según el tipo de renta que dan.",
  consigna: "Lee la ficha. Elige qué tipo de renta da.",
};

/*
 * Las dos líneas de «¿Cómo se juega?» (lote 6a: las fichas a un nivel). La primera es de Futaba. La
 * segunda, PARA SHOKO: Futaba escribió «Pulsa el botón para colocar la ficha; si fallas, tienes un
 * intento más.», pero en la hoja de Mai no hay botón (tocar un cajón coloca la ficha), así que se
 * adaptó a «Toca el cajón…».
 */
export const REGLAS_T5_ACT1 = [
  "Lee la ficha y elige qué renta da: variable, fija con interés o fija con descuento.",
  "Toca el cajón donde va la ficha; si fallas, tienes un intento más.",
];

/* ═══════════ LAS TRES OPCIONES: LOS TRES CAJONES DEL ESTANTE (hoja de fusiones de Mai) ═══════════ */

export const VARIABLE = "variable";
export const FIJA = "fija";
export const INTERES = "interes";
export const DESCUENTO = "descuento";

/*
 * Cada cajón es una respuesta entera: la renta y, si es fija, su tipo. Los nombres son los de la hoja de
 * Mai y del texto alternativo de Futaba. El grupo se lee «Tipo de renta» (hoja de Mai; PARA SHOKO).
 */
export const CAJONES_T5_ACT1 = [
  { renta: VARIABLE, tipo: null, rotulo: "Renta variable" },
  { renta: FIJA, tipo: INTERES, rotulo: "Fija con interés" },
  { renta: FIJA, tipo: DESCUENTO, rotulo: "Fija con descuento" },
];
export const GRUPO_T5_ACT1 = "Tipo de renta";

/* ═══════════ EL BANCO: 14 FICHAS ═══════════ */

export const NOMBRE = "nombre";
export const DEFINICION = "definicion";
export const CASO = "caso";

/*
 * `renta` y `tipo` son la respuesta; `clase` dice qué devoluciones de error
 * lleva. Las fichas de nombre traen las suyas (guía §3.8); las de
 * definición y caso usan A, B y C (§3.7).
 */
export const FICHAS_T5_ACT1 = [
  {
    id: "acciones", clase: NOMBRE, renta: VARIABLE, tipo: null,
    texto: "Acciones de otra empresa",
    acierto: "✅ Sí. Son renta variable: lo que rinden depende de cómo le vaya a la empresa que las emitió.",
    falloNivel1: "❌ No es esa. El libro pone las acciones en la renta variable: sus dividendos dependen de la empresa que las emitió.",
  },
  {
    id: "def-emisora", clase: DEFINICION, renta: VARIABLE, tipo: null,
    /* Definición casi literal del libro (p. 192), sin «económicos»: reescrita por INFLESZ, PASA de Shoko. */
    texto: "Su rendimiento depende de factores propios de la empresa que lo emitió.",
    acierto: "✅ Sí. Es renta variable: rinde según cómo le vaya a la empresa que lo emitió.",
  },
  {
    id: "def-dividendos", clase: DEFINICION, renta: VARIABLE, tipo: null,
    texto: "Sus dividendos dependen de la situación económica y de la liquidez de quien lo emitió.",
    acierto: "✅ Sí. Es renta variable: así describe el libro a las acciones, cuyos dividendos siguen a quien las emitió.",
  },
  {
    id: "caso-resultados", clase: CASO, renta: VARIABLE, tipo: null,
    texto: "Lo que recibe quien lo tiene se decide según los resultados de la empresa que lo emitió.",
    acierto: "✅ Sí. Si lo que recibe se decide según cómo le vaya a la empresa que lo emitió, es renta variable.",
  },
  {
    id: "cdt", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "CDT (certificado de depósito a término)",
    acierto: "✅ Sí. El libro pone el CDT entre los títulos que pagan un interés fijo durante un periodo.",
    falloNivel1: "❌ No es esa. El libro pone el CDT en la renta fija, no en la variable.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿el CDT estaba con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "bonos", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "Bonos",
    acierto: "✅ Sí. El libro pone los bonos en la renta fija con interés.",
    falloNivel1: "❌ No es esa. El libro pone los bonos en la renta fija: su renta se pacta al invertir.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿los bonos estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "cedulas", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "Cédulas hipotecarias",
    acierto: "✅ Sí. Las cédulas hipotecarias van con el CDT y los bonos: renta fija con interés.",
    falloNivel1: "❌ No es esa. El libro pone las cédulas hipotecarias en la renta fija, no en la variable.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿las cédulas hipotecarias estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "def-interes", clase: DEFINICION, renta: FIJA, tipo: INTERES,
    texto: "Le paga un interés fijo durante un periodo determinado.",
    acierto: "✅ Sí. Un interés fijo durante un periodo determinado. Así define el libro la renta fija con interés.",
  },
  {
    id: "caso-pactado", clase: CASO, renta: FIJA, tipo: INTERES,
    texto: "Desde el día de la compra se sabe qué interés pagará la empresa que lo emitió.",
    acierto: "✅ Sí. El interés quedó fijo al invertir, aunque lo pague una empresa: es renta fija con interés.",
  },
  {
    id: "participacion", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "Títulos de participación",
    acierto: "✅ Sí. El libro pone los títulos de participación entre los de descuento.",
    falloNivel1: "❌ No es esa. El libro pone los títulos de participación en la renta fija, no en la variable.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿los títulos de participación estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "cert", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "CERT (certificado de reembolso tributario)",
    acierto: "✅ Sí. El CERT está en la lista del libro de renta fija con descuento.",
    falloNivel1: "❌ No es esa. El libro pone el CERT en la renta fija: su renta se pacta al invertir.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿el CERT estaba con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "canjeables", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "Títulos canjeables",
    acierto: "✅ Sí. Los títulos canjeables están en la lista del libro de renta fija con descuento, que es una lista abierta.",
    falloNivel1: "❌ No es esa. El libro pone los títulos canjeables en la renta fija, no en la variable.",
    falloNivel2: "❌ Vas bien: es renta fija. Recuerda la lista del libro: ¿los títulos canjeables estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?",
  },
  {
    id: "def-descuento", clase: DEFINICION, renta: FIJA, tipo: DESCUENTO,
    texto: "Su renta es la diferencia entre el valor de compra y el valor de redención.",
    acierto: "✅ Sí. La renta sale de la diferencia entre lo que costó y lo que vale al redimirse: con descuento.",
  },
  {
    id: "caso-redencion", clase: CASO, renta: FIJA, tipo: DESCUENTO,
    texto: "Se compra por menos de lo que pagará la empresa que lo emitió al redimirlo, y esa diferencia es lo que gana.",
    acierto: "✅ Sí. Gana la diferencia entre lo que pagó y el valor de redención: es renta fija con descuento.",
  },
];

/* ═══════════ LAS TRES DEVOLUCIONES DE ERROR DE DEFINICIÓN Y CASO (guía §3.7) ═══════════ */

export const ERROR_T5_ACT1 = {
  /* A · un título de renta fija puesto en «Renta variable». */
  A: "❌ Este título es de renta fija: su renta se pacta al invertir. La que depende de cómo le vaya a la empresa que emitió el título es la renta variable.",
  /* B · un título de renta variable puesto en «Renta fija». */
  B: "❌ Este es de renta variable. Su rendimiento depende de cómo le vaya a la empresa que lo emitió; no es una renta constante pactada al invertir.",
  /* C · acertó «Renta fija» y confundió «Con interés» y «Con descuento». */
  C: "❌ Vas bien: es renta fija. Ahora mira cómo produce la renta. Si paga un interés fijo durante un periodo, es con interés. Si gana la diferencia entre el valor de compra y el de redención, es con descuento.",
};

/* El resumen (Futaba, lote 6a): ya no habla de pesos; cada ficha vale entera. */
export const resumenT5Act1 = (bien, cuantas) => `${bien} de ${cuantas} fichas bien al primer intento.`;

/* Futaba, con su última frase adaptada a la hoja de Mai (sin botón: tocar un cajón coloca la ficha). PARA SHOKO. */
export const ALT_T5_ACT1 = "Actividad de clasificación. Aparece una ficha con el nombre de un título o con una pista de cómo rinde. Elige entre tres opciones: Renta variable, Fija con interés o Fija con descuento. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
