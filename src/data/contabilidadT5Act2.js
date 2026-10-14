import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 2 — «El cierre completo de Santa Pacha» (Célula B).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t5-act2.md. Precedencia (Sakuta):
 *   1. la entrega más reciente de Futaba: rótulos e instrucciones de las
 *      partes, textos del diario y devoluciones vigentes (PASA de Shoko);
 *   2. las devoluciones ajustadas;
 *   3. el contenido adaptado a la mecánica (enunciados, tutorial, estante);
 *   4. la guía v1 de Mai, solo para el diseño: sus devoluciones de la §4.4
 *      están viejas y no se usan.
 * Cabecera del diario: «LIBRO DIARIO» (Sakuta: está publicado en el desafío
 * del Tema 2, «El Libro Diario»), no la propuesta «ASIENTOS ANOTADOS».
 *
 * Todas las cifras son las del ejemplo de las pp. 194-195; una prueba lo
 * vigila contra la lista con página que dio Futaba.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T5_ACT2 = {
  id: "b5-t5-a2",
  nombre: "El cierre completo de Santa Pacha",
  /* Decisión de Sakuta: difícil, 50 FP. */
  dificultad: "dificil",
  fpBase: 50,
  objetivo: "Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas.",
  consigna: "Lee el hecho. Arma el asiento con las cuentas del estante.",
};

/* Las tres líneas de «¿Cómo se juega?». */
export const REGLAS_T5_ACT2 = [
  "Lee el hecho y pon en la mesa las cuentas que mueve.",
  "Ponlas en el Debe o en el Haber y escribe cada valor.",
  "Confirma cuando los dos totales den igual: tienes un solo intento.",
];

/* ═══════════ EL ESTANTE: SOLO NOMBRES, LOS DEL EJEMPLO DE LAS PP. 194-195 ═══════════ */

export const CAJA = "Caja";
export const BANCOS = "Bancos";
export const INVERSIONES = "Inversiones – títulos";
export const INTERESES = "Ingresos por intereses";
export const GANANCIA = "Ingresos financieros – ganancia en venta de títulos";
export const PERDIDA = "Gastos financieros – pérdida en venta de títulos";

export const ESTANTE_T5_ACT2 = [CAJA, BANCOS, INVERSIONES, INTERESES, GANANCIA, PERDIDA];

const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const h = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* La B · C7 de las dos ventas y la B «otro valor», iguales en las dos (Futaba). */
const OTRO_VALOR = "Revisa los valores. Compara lo que recibió con lo que costaron los títulos.";

/* ═══════════ LAS CUATRO PARTES: UN ASIENTO POR PANTALLA ═══════════ */

/*
 * `asiento` es lo correcto, en el orden del diario. `errores` va por la
 * prioridad D > C > A > B; en las ventas, `C7` es la B que se muestra cuando
 * Inversiones – títulos lleva un valor que no es su costo.
 */
export const PARTES_T5_ACT2 = [
  {
    id: "b5-t5-a2-p1",
    rotulo: "Asiento 1",
    instruccion: "Registra el interés que llega el 1 de agosto.",
    fecha: "1 de agosto",
    hecho: "1 de agosto. Santa Pacha tiene títulos por $2.000.000. Pagan un interés del 24 % al año, al terminar cada trimestre. Hoy llega a Caja el interés del primer trimestre.",
    asiento: [d(CAJA, 120000), h(INTERESES, 120000)],
    errores: {
      D: "Este hecho solo mueve Caja e Ingresos por intereses. El interés es un ingreso: no cambia la inversión.",
      C: "Están al revés. El interés entra a Caja, que sube: va al Debe. El ingreso va al Haber.",
      A: "Falta una cuenta. El interés entra a Caja y, a la vez, es un ingreso.",
      B: "Revisa el valor. El interés se calcula sobre $2.000.000, al 24 % al año, por un solo trimestre.",
    },
  },
  {
    id: "b5-t5-a2-p2",
    rotulo: "Asiento 2",
    instruccion: "Registra la venta del 1 de agosto.",
    fecha: "1 de agosto",
    hecho: "1 de agosto. Santa Pacha vende 1.875 títulos, el 75 %. Cada uno le había costado $800. Los vende a $920, sin el interés. Recibe $1.725.000 en Caja.",
    asiento: [d(CAJA, 1725000), h(INVERSIONES, 1500000), h(GANANCIA, 225000)],
    errores: {
      D: "Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la ganancia. No hay pérdida, porque vendió por más de lo que costaron. Y aquí no entran Bancos ni el interés.",
      C: "Hay cuentas al revés. Caja sube y va al Debe. Inversiones – títulos baja y la ganancia es un ingreso: los dos van al Haber.",
      A: "Falta una cuenta. Esta venta mueve tres: Caja, Inversiones – títulos y la ganancia. Inversiones – títulos se acredita por lo que costaron los títulos, no por lo que se recibió. Por eso queda una diferencia, y esa diferencia es la ganancia.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 1.875 × $800 = $1.500.000. La diferencia, $225.000, es la ganancia.",
      B: OTRO_VALOR,
    },
  },
  {
    id: "b5-t5-a2-p3",
    rotulo: "Asiento 3",
    instruccion: "Registra el interés que llega el 1 de noviembre.",
    fecha: "1 de noviembre",
    hecho: "1 de noviembre. Ya solo hay 625 títulos de $800, que suman $500.000. Llega a Caja el interés de este trimestre, al 24 % anual.",
    asiento: [d(CAJA, 30000), h(INTERESES, 30000)],
    errores: {
      D: "Este hecho solo mueve Caja e Ingresos por intereses. Es igual que en agosto.",
      C: "Están al revés. Como en agosto, Caja va al Debe y el ingreso va al Haber.",
      A: "Falta una cuenta. El interés entra a Caja y, a la vez, es un ingreso.",
      B: "Revisa el valor. El interés se calcula sobre los títulos que quedan, al 24 % al año, por un solo trimestre.",
    },
  },
  {
    id: "b5-t5-a2-p4",
    rotulo: "Asiento 4",
    instruccion: "Registra la venta del 1 de noviembre.",
    fecha: "1 de noviembre",
    hecho: "1 de noviembre. Santa Pacha vende los 625 títulos que quedan. Cada uno le había costado $800. Los vende a $750 y recibe $468.750 en Caja.",
    asiento: [d(CAJA, 468750), d(PERDIDA, 31250), h(INVERSIONES, 500000)],
    errores: {
      D: "Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la pérdida. No hay ganancia, porque vendió por menos de lo que costaron. Y aquí no entran Bancos ni el interés, que se anota aparte.",
      C: "Hay cuentas al revés. La pérdida va al Debe, junto a Caja. Inversiones – títulos baja y va al Haber.",
      A: "Falta una cuenta. Esta venta mueve tres: Caja, Inversiones – títulos y la pérdida. Inversiones – títulos se acredita por lo que costaron los títulos, no por lo que se recibió. Por eso queda una diferencia, y esa diferencia es la pérdida.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 625 × $800 = $500.000. La diferencia, $31.250, es la pérdida.",
      B: OTRO_VALOR,
    },
  },
];

/* ═══════════ EL TUTORIAL: LA COMPRA DEL 1 DE MAYO, YA RESUELTA (p. 194) ═══════════ */

/* Sin número: es el ejemplo, no una parte (Futaba). */
export const COMPRA_T5_ACT2 = {
  id: "b5-t5-a2-tutorial",
  rotulo: null,
  instruccion: null,
  fecha: "1 de mayo",
  hecho: "1 de mayo. Santa Pacha tiene efectivo de sobra por un tiempo. Compra 2.500 títulos a $800 cada uno. Paga con Bancos.",
  asiento: [d(INVERSIONES, 2000000), h(BANCOS, 2000000)],
  errores: {},
  /* La explicación en cuatro líneas, al terminar el ejemplo. */
  resolucion: [
    "Inversiones – títulos sube y va al Debe.",
    "Son 2.500 × $800 = $2.000.000.",
    "Bancos baja: va al Haber por el mismo valor.",
    "El Debe y el Haber suman igual: el asiento cuadra.",
  ],
};
export const ALT_TUTORIAL_T5_ACT2 = "Ejemplo resuelto. El 1 de mayo, Santa Pacha compra 2.500 títulos a $800 cada uno y paga con Bancos. El asiento tiene Inversiones – títulos en el Debe por $2.000.000 y Bancos en el Haber por $2.000.000. Los dos totales dan $2.000.000.";

/* ═══════════ EL LIBRO DIARIO (encima del juego) ═══════════ */

export const DIARIO_T5_ACT2 = {
  cabecera: "LIBRO DIARIO",
  cuenta: (n) => (n === 1 ? "1 asiento" : `${n} asientos`),
  ver: "Ver",
  ocultar: "Ocultar",
  debe: "DEBE",
  haber: "HABER",
};

/* ═══════════ RESUMEN Y TEXTO ALTERNATIVO ═══════════ */

/* El resumen publicado de t3-cierre-completo. */
export const RESUMEN_T5_ACT2 = (bien, total) => `Bien a la primera: ${bien} de ${total}`;

export const ALT_T5_ACT2 = "Actividad de registro. Hay cuatro hechos de la inversión de Santa Pacha. En cada uno, pon en la mesa las cuentas que mueve, ubícalas en el Debe o en el Haber y escribe cada valor. Abajo se ven los dos totales y la diferencia. Tienes un solo intento por asiento.";
