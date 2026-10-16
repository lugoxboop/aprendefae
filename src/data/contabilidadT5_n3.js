/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 DE HACER — «¿Qué revisión falta?» (Célula C), con N2 adentro.
 *
 * Fuentes, de la más vieja a la más nueva (manda la más nueva):
 *   1. La fusión de la entrega 5 de Near (orquestador/conocimiento/paquetes/
 *      lote1-entrega5-v1.md, «## 2. T5 · N3»): N2 sale de la lista y N3 se
 *      queda con las cuatro acciones de la p. 193 como opciones fijas, cada
 *      una con su glosa; el ejemplo resuelto del fondo fiduciario («Así se
 *      juega», no da puntos) y la pista común del primer error.
 *   2. La corrección de Mello a esa fusión (mello-entregas-4-5-6-v1.md, «N3
 *      con lo de N2»). De ella sigue en pie la glosa de Verificar. Su
 *      consigna, su acierto del caso 1 y su caso 3 los reemplaza la D.
 *   3. La entrega D v2 de Near (d-v2-h7-y-n3.md, sección 2): los casos son
 *      síntomas, cada distractor tiene su línea, la consigna sin la regla
 *      del intento y el distintivo «Vale el primer intento».
 *   4. La auditoría de Mello a la D (auditoria-mello-n5-v2-y-entrega-d-v2.md,
 *      sección 3): N3-1 (el caso 3, su acierto y dos líneas), N3-2 (salen
 *      «del año» y «todo»), N3-3 (cinco líneas) y N3-4 (el orden fijo 1, 4,
 *      3, 2, 5, sin dos respuestas iguales seguidas).
 * Una prueba compara cada texto contra esas fuentes, letra por letra.
 *
 * Hacer Fácil, evaluativa, 10 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Siguen siendo CINCO aciertos: la 0111 no
 * cambia. El fondo fiduciario no da puntos: es el ejemplo resuelto.
 *
 * LA ESCALERA (C2): al primer error, la pista común y la línea del
 * distractor elegido, y otro intento; al segundo, la respuesta con su
 * porqué. Solo suma el primer intento.
 *
 * LOS IDS: los cuatro casos que siguen pidiendo la misma acción conservan el
 * id de su caso de antes, para que el historial del panel docente no se
 * mezcle; `fondo-fiduciario`, que ya no puntúa, sigue teniendo etiqueta (la
 * del ejemplo) para las partidas viejas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N3_ID = "t5-revision-que-falta";

export const N3 = {
  id: N3_ID,
  nombre: "¿Qué revisión falta?",
  /* La D: la regla del intento sale de la consigna y va al distintivo (C5). */
  enunciado: ["Cada caso muestra un riesgo con las inversiones. Elige la acción del libro que hace falta."],
  distintivo: "Vale el primer intento",
  /* De la tanda 1 v1.1, como antes. */
  pie: "Basado en el libro, p. 193",
};

export const BOTON_N3 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const ACCIONES = ["Verificar cada inversión", "Examinar las compras y las ventas", "Confirmar las operaciones en tránsito", "Comprobar los fondos fiduciarios"];
const [VERIFICAR, EXAMINAR, CONFIRMAR, COMPROBAR] = ACCIONES;
export const ACCIONES_N3 = ACCIONES;

/* La glosa de una línea de cada acción, fija en pantalla (la fusión; la de Verificar, con la corrección de Mello). */
export const GLOSAS_N3 = {
  [VERIFICAR]: "Revisar los datos de cada documento contra los registros.",
  [EXAMINAR]: "Revisar el movimiento de compra y venta de inversiones.",
  [CONFIRMAR]: "Revisar las operaciones que empezaron y aún no terminan.",
  [COMPROBAR]: "Revisar que existan, cuando la inversión los pida.",
};

/* El ejemplo resuelto («Así se juega»): no da puntos. HUECO del libro: solo da el nombre del fondo fiduciario. */
export const EJEMPLO_N3 = {
  id: "fondo-fiduciario",
  rotulo: "Así se juega",
  pregunta: "Una inversión pide un fondo fiduciario, y nadie ha visto que ese fondo exista.",
  correcta: COMPROBAR,
  nota: "La acción es comprobar. El libro solo la nombra: no explica qué es un fondo fiduciario.",
};

/* La pista del primer error, la misma en los cinco casos. */
export const PISTA_N3 = "¿El problema está en un dato de un documento, en un movimiento o en algo sin terminar?";

/* La figura que crece: la hoja de revisión, con sus dos columnas. */
export const HOJA_N3 = { caso: "Caso", accion: "Acción" };

const NO_FONDO = "El caso no habla de un fondo fiduciario.";

/* Los cinco casos, en el orden fijo de Mello (N3-4): los casos 1, 4, 3, 2 y 5 de la D. */
export const ITEMS_N3 = [
  {
    /* Caso 1 de la D. */
    id: "quien-y-cuando", opciones: ACCIONES, correcta: VERIFICAR,
    pregunta: "En junio, la empresa descubre que un bono suyo se debía pagar en marzo. Sigue guardado y nadie lo ha cobrado.",
    acierto: "Así es: la fecha en que se paga un bono es un dato del documento.",
    porQueNo: {
      /* Mello, N3-3. */
      [EXAMINAR]: "Aquí no hay ninguna compra ni venta en juego. Mira qué se sabe del bono.",
      [CONFIRMAR]: "El bono ya está en la empresa desde antes. No hay nada a medio camino.",
      [COMPROBAR]: NO_FONDO,
    },
  },
  {
    /* Caso 4 de la D. */
    id: "compra-en-transito", opciones: ACCIONES, correcta: CONFIRMAR,
    pregunta: "La empresa pagó unos bonos el 29 de diciembre. Al cierre, el documento todavía no está en la caja fuerte, y nadie ha preguntado por él.",
    acierto: "Así es: la compra empezó con el pago, pero no ha terminado.",
    porQueNo: {
      [VERIFICAR]: "No hay documento que revisar: todavía no ha llegado.",
      /* Mello, N3-3. */
      [EXAMINAR]: "Examinar mira lo que ya se anotó. Fíjate en qué punto va esta compra.",
      [COMPROBAR]: NO_FONDO,
    },
  },
  {
    /* Caso 3 de la D, reescrito por Mello (N3-1). */
    id: "movimiento-del-ano", opciones: ACCIONES, correcta: EXAMINAR,
    pregunta: "Al cierre, el saldo de Inversiones – títulos no coincide con lo guardado. Nada quedó a medias: el error está en algo que entró o salió, y nadie sabe en qué.",
    acierto: "Así es: la diferencia se busca en los movimientos de compra y venta.",
    porQueNo: {
      [VERIFICAR]: "Los datos de cada título pueden estar bien. El error está en algo que entró o salió.",
      [CONFIRMAR]: "El caso dice que nada quedó a medias. El error está en algo que ya entró o salió.",
      [COMPROBAR]: NO_FONDO,
    },
  },
  {
    /* Caso 2 de la D. */
    id: "numero-de-serie", opciones: ACCIONES, correcta: VERIFICAR,
    pregunta: "En la caja fuerte hay un título de la empresa Roble. El registro dice que ese título es de la empresa Cedro.",
    acierto: "Así es: quién lo emitió es un dato que se revisa contra los registros.",
    porQueNo: {
      /* Mello, N3-3. */
      [EXAMINAR]: "Aquí no hay ninguna compra ni venta en juego. Mira lo que dicen el título y el registro.",
      [CONFIRMAR]: "El título ya está en la caja fuerte. No hay nada a medio camino.",
      [COMPROBAR]: NO_FONDO,
    },
  },
  {
    /* Caso 5 de la D (la venta que no termina, que entró con la fusión). */
    /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el id; el caso es nuevo y ningún paquete le da uno. */
    id: "venta-en-transito", opciones: ACCIONES, correcta: CONFIRMAR,
    pregunta: "La empresa vendió unas acciones el viernes. El lunes, el dinero todavía no está en el banco, y nadie ha llamado a preguntar.",
    acierto: "Así es: una venta que no ha terminado también se confirma.",
    porQueNo: {
      /* Mello, N3-3. */
      [VERIFICAR]: "Las acciones ya no están en la empresa: no queda ningún título que revisar.",
      [EXAMINAR]: "Examinar mira lo que ya se anotó. Fíjate en qué punto va esta venta.",
      [COMPROBAR]: NO_FONDO,
    },
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los cinco al primer toque. */
export const resumenN3 = (bien, total) => `${bien} de ${total} al primer toque.`;
