/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 3 DE APRENDER — «Lo que ya pasó y no se ha pagado».
 *
 * Todo el texto es de Gen, textual (texto final de la pieza 3). Las cuentas
 * del asiento y del espejo son las de Levi, que mandan sobre la maqueta de
 * Xeno: «Gasto alquiler» / «Alquiler por pagar» para San Calixto, «Servicios
 * por cobrar» / «Ingresos por servicios» para San Miguel.
 *
 * Las cifras no se escriben a mano en los contadores: salen de las marcas,
 * cinco días a $500 (contabilidad/loQueYaPaso.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const DIAS = [27, 28, 29, 30, 31];
export const POR_DIA = 500;

export const SAN_CALIXTO_P3 = {
  id: "san-calixto",
  nombre: "San Calixto",
  /* Usó la máquina: un gasto por día, sin pagar. */
  marca: "gasto",
  asiento: {
    debe: { cuenta: "Gasto alquiler", monto: 2500 },
    haber: { cuenta: "Alquiler por pagar", monto: 2500 },
  },
};

export const SAN_MIGUEL_P3 = {
  id: "san-miguel",
  nombre: "San Miguel",
  /* Prestó la máquina: un ingreso por día, sin cobrar. */
  marca: "ingreso",
  asiento: {
    debe: { cuenta: "Servicios por cobrar", monto: 2500 },
    haber: { cuenta: "Ingresos por servicios", monto: 2500 },
  },
};

export const EMPRESAS_P3 = [SAN_CALIXTO_P3, SAN_MIGUEL_P3];

/* ═══════════ LA REGLA DEL CALENDARIO (Xeno) ═══════════ */
export const ROTULO_CORCHETE = "$500 por día";
export const ROTULO_CORTE = "Cierre del mes";
export const ROTULO_RETARDO = "Retardo";

/* ═══════════ CAPA 2: LOS OCHO SEGMENTOS Y EL CIERRE ═══════════ */
export const SEGMENTOS_P3 = [
  "Vuelven las dos líneas de la primera pieza de este tema. Arriba, ingresos y gastos. Abajo, la caja.",
  "San Calixto alquiló una máquina y la usó del 27 al 31 de enero. Son cinco días a $500.",
  "El gasto ya se causó: la empresa usó la máquina. Pero no ha pagado, así que la caja no se mueve.",
  "Mira la línea de la caja: llega el cierre del mes y sigue quieta. Eso es el retardo: el hecho va adelante y la plata viene después.",
  "Al cerrar el mes se anota el gasto de $2.500 y la deuda de $2.500. El debe lleva el gasto y el haber la deuda.",
  "Ahora mira a San Miguel, que fue quien prestó la máquina. El mismo hecho, visto del otro lado.",
  "San Miguel ya prestó el servicio, así que su ingreso se causó. Tampoco ha cobrado los $2.500.",
  "San Miguel anota $2.500 que le deben y $2.500 de ingreso. El debe lleva lo que le deben y el haber el ingreso.",
];
export const CIERRE_P3 = "Un solo hecho, dos empresas. Lo que para San Calixto es gasto y deuda, para San Miguel es ingreso y plata por cobrar.";

/* Los alternativos de Gen: solo en los pasos 4, 5 y 8 (Xeno, A7). */
export const ALTERNATIVOS_P3 = {
  4: "Ejemplo: el gasto queda marcado del 27 al 31. Llega el cierre del mes y la línea de la caja sigue quieta. Eso es el retardo.",
  5: "Ejemplo: San Calixto anota $2.500 en el debe como gasto de alquiler y $2.500 en el haber como deuda por pagar.",
  8: "Ejemplo: San Miguel anota $2.500 en el debe como servicios por cobrar y $2.500 en el haber como ingreso.",
};

/* ═══════════ CAPA 3 ═══════════ */
export const CONSIGNA_CAPA_3_P3 = "Toca cada empresa y mira cómo anota el mismo hecho.";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas) ═══════════ */

/*
 * La capa 1 la pinta CuatroCapas, que es compartida y no se toca. La nota de
 * «devengar» y las dos citas del libro van con lo que esa capa ya sabe
 * pintar: el bloque «del libro» debajo de un término. La nota, bajo «Se
 * causa», con su propio rótulo; las dos citas, bajo «Acumulado», con el
 * rótulo «Así lo dice el libro» que Gen escribió.
 */
export const PIEZA_LO_QUE_YA_PASO = {
  id: "t3-a3-lo-que-ya-paso",
  numero: 3,
  titulo: "Lo que ya pasó y no se ha pagado",
  objetivo: "El hecho ya ocurrió y la plata no ha llegado. Al cerrar el mes hay que anotarlo igual.",
  nombres: [
    {
      termino: "Se causa",
      definicion: "Se causa cuando el hecho ya ocurrió, aunque la plata no se haya movido.",
      delLibro: "El libro también dice devengar; es lo mismo.",
      rotuloDelLibro: "Nota",
    },
    { termino: "Cierre del mes", definicion: "Al terminar el mes, la empresa revisa qué hechos ya pasaron y todavía no están anotados." },
    { termino: "Ajuste", definicion: "Antes de cerrar el mes, la empresa anota lo que ya pasó y faltaba. Ese asiento se llama ajuste." },
    {
      termino: "Acumulado",
      definicion: "Cuando el hecho ya pasó y la plata todavía no se ha movido, el libro lo llama acumulado.",
      delLibro: "«Son aquellos gastos que ya han sido causados, pero que al cierre del periodo contable todavía no han sido cancelados porque tienen un compromiso de pago futuro» (p. 139). «Son aquellos ingresos que ya han sido devengados, pero que al cierre del periodo contable todavía no se ha recibido el pago de los mismos» (p. 141).",
    },
    /* «Lo que se planta», con el rótulo de la pieza 1. */
    { termino: "Desde ya", definicion: "Esos hechos son de este mes. Si no se anotan, el mes queda incompleto." },
  ],
};

/* ═══════════ CAPA 4 ═══════════ */
export const PREGUNTA_FINAL_P3 = "Elige la frase que mejor dice cuándo se causa un gasto.";
export const OPCIONES_FINAL_P3 = [
  {
    id: "consumio",
    texto: "Cuando la empresa ya consumió el bien o el servicio.",
    correcta: true,
    feedback: "Correcto. San Calixto usó la máquina cinco días: ahí se causó el gasto, aunque no haya pagado nada todavía.",
  },
  {
    id: "paga",
    texto: "Cuando la empresa paga la factura.",
    correcta: false,
    feedback: "No. Pagar mueve la caja, no el gasto. El gasto ya se había causado cuando se usó la máquina.",
  },
  {
    id: "factura",
    texto: "Cuando llega la factura del proveedor.",
    correcta: false,
    feedback: "No. El papel sirve para anotar, pero el gasto se causa cuando se consume el servicio, no cuando llega el papel.",
  },
  {
    id: "cierre",
    texto: "Cuando termina el mes y se cierran los libros.",
    correcta: false,
    feedback: "El cierre es cuando se revisa qué falta anotar. Pero el gasto se causó antes, mientras se usaba la máquina.",
  },
];
