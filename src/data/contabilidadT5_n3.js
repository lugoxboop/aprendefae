/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 DE HACER — «¿Qué revisión falta?» (Célula C).
 *
 * Fuente: la tanda 1 v1.1 de Near, con PASA CON CORRECCIONES de Mello. Copia
 * en orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md, y la corrección,
 * decidida por L, en t5-veredicto-mello-tandas-1-y-2.md: en el caso del
 * ítem 4, la frase «Nadie ha confirmado que esa compra siga en curso.» se
 * cambia, entera, por «Nadie sabe si esa compra sigue en curso.», porque
 * repetía el verbo de la opción correcta. Una prueba compara cada texto de
 * aquí contra los dos documentos, letra por letra.
 *
 * Hacer Fácil, evaluativa, 10 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0111, que corre Erwin.
 *
 * CINCO ACIERTOS POSIBLES, uno por caso, en el orden de la tanda. Un solo
 * intento. Sin cifras. La unión entre riesgo y control es construcción de
 * Near (se dice aquí, no en pantalla): cada caso tiene una sola acción
 * defendible entre las cuatro de la p. 193. Del fondo fiduciario solo se usa
 * el nombre del libro y su condición.
 *
 * Lo que la tanda no trae y se toma de la convención de los Hacer de la
 * célula (H3 de T7-3): las cuatro opciones van siempre en el orden de la
 * tanda, sin barajar, porque son las cuatro acciones del libro en su orden.
 * Los botones «Siguiente ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N3_ID = "t5-revision-que-falta";

export const N3 = {
  id: N3_ID,
  nombre: "¿Qué revisión falta?",
  enunciado: [
    "Cada caso muestra un riesgo con las inversiones de una empresa. Elige la acción del libro que hace falta. Tienes un solo intento por caso.",
  ],
  pie: "Basado en el libro, p. 193",
};

export const BOTON_N3 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const ACCIONES = ["Verificar cada inversión", "Examinar las compras y las ventas", "Confirmar las operaciones en tránsito", "Comprobar los fondos fiduciarios"];
const [VERIFICAR, EXAMINAR, CONFIRMAR, COMPROBAR] = ACCIONES;

export const ITEMS_N3 = [
  {
    id: "quien-y-cuando", opciones: ACCIONES, correcta: VERIFICAR,
    pregunta: "La empresa guarda unos bonos, pero nadie ha revisado quién los emitió ni cuándo vencen.",
    error: "Aquí faltan datos del documento: quién lo emitió y cuándo vence. Eso se revisa al verificar cada inversión.",
    acierto: "Así es. Al verificar cada inversión se revisan sus datos, como quién la emitió y cuándo vence.",
  },
  {
    id: "numero-de-serie", opciones: ACCIONES, correcta: VERIFICAR,
    pregunta: "En la caja fuerte hay un título, pero nadie ha comparado su número de serie con el de los registros.",
    error: "Aquí falta revisar un dato del documento, el número de serie. Eso se hace al verificar cada inversión.",
    acierto: "Así es. El número de serie es uno de los datos que se revisan al verificar cada inversión.",
  },
  {
    id: "movimiento-del-ano", opciones: ACCIONES, correcta: EXAMINAR,
    pregunta: "Durante el año hubo muchas compras y ventas de acciones. Nadie ha revisado ese movimiento.",
    error: "Aquí el riesgo está en el movimiento de compras y ventas del año. El libro pide examinar esos movimientos.",
    acierto: "Así es. El libro pide examinar los movimientos de compra y venta de inversiones.",
  },
  {
    /* Corrección de Mello, decidida por L: la segunda frase del caso. */
    id: "compra-en-transito", opciones: ACCIONES, correcta: CONFIRMAR,
    pregunta: "La empresa pagó unos bonos hace tres días y el documento no ha llegado. Nadie sabe si esa compra sigue en curso.",
    error: "La compra ya empezó, pero no ha terminado: está en tránsito. El libro pide confirmar esas operaciones.",
    acierto: "Así es. Una compra que empezó y no ha terminado está en tránsito, y hay que confirmarla.",
  },
  {
    id: "fondo-fiduciario", opciones: ACCIONES, correcta: COMPROBAR,
    pregunta: "Una inversión pide un fondo fiduciario, y nadie ha visto que ese fondo exista.",
    error: "Esta inversión pide un fondo fiduciario. El libro dice que hay que comprobar que exista.",
    acierto: "Así es. Cuando la inversión pide un fondo fiduciario, hay que comprobar que exista.",
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los cinco al primer toque. */
export const resumenN3 = (bien, total) => `${bien} de ${total} al primer toque.`;
