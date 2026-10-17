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
 * Lote 6d (estándar único de Hacer): las devoluciones van sin los emojis de acierto y de
 * error que llevaban al inicio (solo se quitó el emoji); el veredicto lo da la
 * evaluación (`ok`), no el texto. El resto es literal de la guía. La pista del primer
 * fallo va sin emoji (como en la escalera de ayuda, tema6/escaleraB5.js).
 *
 * El segundo fallo sigue la REGLA ÚNICA de la célula (b5SegundoFallo.js): el
 * acierto tal cual, debajo de la pastilla «Iba aquí» (lote 6d-textos: los
 * aciertos ya no abren con «Sí.» y el segundo fallo no añade nada delante;
 * el veredicto lo da la pastilla). Por eso tres aciertos de
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
 * `renta` y `tipo` son la respuesta; `clase` cuenta en el sorteo (como mucho
 * una de nombre por cajón). `pista` es lo que se lee al PRIMER fallo, sea cual
 * sea el cajón tocado (Futaba, E5 de la fila 11 de Shoko): cada ficha la suya,
 * sin nombrar el cajón. Reemplaza a las devoluciones de error (A, B y C de
 * §3.7, y los niveles 1 y 2 de las de nombre, §3.8), que quedan como registro
 * en la guía guardada. Al segundo fallo, la regla única.
 */
export const FICHAS_T5_ACT1 = [
  {
    id: "acciones", clase: NOMBRE, renta: VARIABLE, tipo: null,
    texto: "Acciones de otra empresa",
    pista: "Piensa de qué depende lo que recibe quien tiene acciones. ¿Se pactó el día que las compró?",
    acierto: "Son renta variable: lo que rinden depende de cómo le vaya a la empresa que las emitió.",
  },
  {
    id: "def-emisora", clase: DEFINICION, renta: VARIABLE, tipo: null,
    /* Definición casi literal del libro (p. 192), sin «económicos»: reescrita por INFLESZ, PASA de Shoko. */
    texto: "Su rendimiento depende de factores propios de la empresa que lo emitió.",
    pista: "Fíjate de qué depende el rendimiento, según la ficha. ¿Se puede saber desde el día de la compra?",
    acierto: "Es renta variable: rinde según cómo le vaya a la empresa que lo emitió.",
  },
  {
    id: "def-dividendos", clase: DEFINICION, renta: VARIABLE, tipo: null,
    texto: "Sus dividendos dependen de la situación económica y de la liquidez de quien lo emitió.",
    pista: "La ficha habla de dividendos. Recuerda qué título los reparte y de qué dependen.",
    acierto: "Es renta variable: así describe el libro a las acciones, cuyos dividendos siguen a quien las emitió.",
  },
  {
    id: "caso-resultados", clase: CASO, renta: VARIABLE, tipo: null,
    texto: "Lo que recibe quien lo tiene se decide según los resultados de la empresa que lo emitió.",
    pista: "Si lo que recibe depende de los resultados de la empresa, ¿se pudo pactar al invertir?",
    acierto: "Si lo que recibe se decide según cómo le vaya a la empresa que lo emitió, es renta variable.",
  },
  {
    id: "cdt", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "CDT (certificado de depósito a término)",
    pista: "Recuerda qué le paga un CDT a quien lo tiene, y si eso se pacta al invertir.",
    acierto: "El libro pone el CDT entre los títulos que pagan un interés fijo durante un periodo.",
  },
  {
    id: "bonos", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "Bonos",
    pista: "En la lista del libro, los bonos van junto al CDT. Recuerda cómo rinde un CDT.",
    acierto: "El libro pone los bonos en la renta fija con interés.",
  },
  {
    id: "cedulas", clase: NOMBRE, renta: FIJA, tipo: INTERES,
    texto: "Cédulas hipotecarias",
    pista: "En la lista del libro, las cédulas hipotecarias van junto al CDT y los bonos.",
    acierto: "Las cédulas hipotecarias van con el CDT y los bonos: renta fija con interés.",
  },
  {
    id: "def-interes", clase: DEFINICION, renta: FIJA, tipo: INTERES,
    texto: "Le paga un interés fijo durante un periodo determinado.",
    pista: "Lee de dónde sale la renta: ¿de un interés o de una diferencia? ¿Y se pacta al invertir?",
    /* Lote 18 (Futaba, texto suelto G; INFLESZ 80,2). */
    acierto: "Le paga un interés fijo durante un tiempo dado. Así define el libro la renta fija con interés.",
  },
  {
    id: "caso-pactado", clase: CASO, renta: FIJA, tipo: INTERES,
    texto: "Desde el día de la compra se sabe qué interés pagará la empresa que lo emitió.",
    pista: "Si desde la compra se sabe lo que pagará, ¿depende de la empresa? ¿Y lo que paga es un interés?",
    acierto: "El interés quedó fijo al invertir, aunque lo pague una empresa: es renta fija con interés.",
  },
  {
    id: "participacion", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "Títulos de participación",
    pista: "Piensa cómo gana quien tiene estos títulos: ¿le pagan un interés, o gana una diferencia cuando vencen?",
    acierto: "El libro pone los títulos de participación entre los de descuento.",
  },
  {
    id: "cert", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "CERT (certificado de reembolso tributario)",
    pista: "Piensa cómo rinde el CERT: ¿cobra un interés, o gana la diferencia entre lo que pagó y lo que recibe?",
    acierto: "El CERT está en la lista del libro de renta fija con descuento.",
  },
  {
    id: "canjeables", clase: NOMBRE, renta: FIJA, tipo: DESCUENTO,
    texto: "Títulos canjeables",
    pista: "En la lista del libro, los títulos canjeables van junto a los de participación y el CERT.",
    acierto: "Los títulos canjeables están en la lista del libro de renta fija con descuento, que es una lista abierta.",
  },
  {
    id: "def-descuento", clase: DEFINICION, renta: FIJA, tipo: DESCUENTO,
    texto: "Su renta es la diferencia entre el valor de compra y el valor de redención.",
    pista: "La ficha dice de dónde sale la renta. ¿Es un interés, o la diferencia entre dos valores?",
    acierto: "La renta sale de la diferencia entre lo que costó y lo que vale al redimirse: con descuento.",
  },
  {
    id: "caso-redencion", clase: CASO, renta: FIJA, tipo: DESCUENTO,
    texto: "Se compra por menos de lo que pagará la empresa que lo emitió al redimirlo, y esa diferencia es lo que gana.",
    pista: "Fíjate en qué gana: ¿un interés que le pagan, o la diferencia entre lo que pagó y lo que recibe?",
    acierto: "Gana la diferencia entre lo que pagó y el valor de redención: es renta fija con descuento.",
  },
];

/*
 * ═══════════ D8 · LA SEGUNDA VUELTA: CUATRO FICHAS NUEVAS Y DOS MAZOS FIJOS (Futaba, lote 18) ═══════════
 *
 * Fuente: acciones comunes, p. 191; renta variable, fija con interés y con descuento, pp. 192-193. La
 * clase de las nuevas sigue a la ficha de hoy cuyas devoluciones toman en la decisión 2 (D4).
 */
export const FICHAS_V2_T5_ACT1 = [
  {
    id: "nv-capital", clase: NOMBRE, renta: VARIABLE, tipo: null,
    texto: "Acciones comunes de una compañía",
    pista: "Piensa de qué depende lo que recibe quien tiene acciones. ¿Se sabe el día de la compra?",
    acierto: "Son acciones: lo que rinden depende de cómo le vaya a la compañía que las emitió. Es renta variable.",
  },
  {
    id: "nv-empresa", clase: CASO, renta: VARIABLE, tipo: null,
    texto: "Lo que rinde sube si a la empresa que lo emitió le va bien, y baja si le va mal.",
    pista: "Si lo que rinde cambia con la suerte de la empresa, ¿se pudo pactar al invertir?",
    acierto: "Si lo que rinde sigue a la empresa que lo emitió, es renta variable.",
  },
  {
    id: "nv-trimestre", clase: CASO, renta: FIJA, tipo: INTERES,
    texto: "Cada trimestre paga el interés que se pactó al comprarlo.",
    pista: "Lee de dónde sale la renta y cuándo se pactó. ¿Es un interés o una diferencia?",
    acierto: "Un interés pactado al invertir, que se paga cada trimestre: renta fija con interés.",
  },
  {
    id: "nv-redime", clase: CASO, renta: FIJA, tipo: DESCUENTO,
    texto: "Quien lo compra gana la diferencia entre lo que pagó y lo que le pagan al redimirlo.",
    pista: "Fíjate en qué gana: ¿un interés que le pagan, o una diferencia al final?",
    acierto: "Gana la diferencia entre lo que pagó y el valor de redención: renta fija con descuento.",
  },
];

/* Los dos mazos, en su orden: la vuelta 1 y la vuelta 2, sin fichas repetidas. */
export const MAZOS_T5_ACT1 = [
  ["acciones", "cdt", "def-descuento", "def-emisora", "caso-pactado", "participacion", "caso-resultados", "def-interes", "caso-redencion"],
  ["bonos", "nv-capital", "cert", "def-dividendos", "nv-trimestre", "canjeables", "nv-empresa", "cedulas", "nv-redime"],
];

/* El resumen (Futaba, lote 6a): ya no habla de pesos; cada ficha vale entera. */
export const resumenT5Act1 = (bien, cuantas) => `${bien} de ${cuantas} fichas bien al primer intento.`;

/* Futaba, con su última frase adaptada a la hoja de Mai (sin botón: tocar un cajón coloca la ficha). PARA SHOKO. */
export const ALT_T5_ACT1 = "Actividad de clasificación. Aparece una ficha con el nombre de un título o con una pista de cómo rinde. Elige entre tres opciones: Renta variable, Fija con interés o Fija con descuento. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
