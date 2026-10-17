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

/*
 * Las razones por cuenta de la D (Futaba, entrega 1, con PASA de Shoko): van
 * detrás de «Sobra X.» o «No va X: en su lugar va Y.», en lugar de la cola
 * del texto D. El estudiante ve solo la razón de la cuenta que puso.
 */
const NO_SE_VENDE = (que) => `Aquí no se vende ningún título, así que no hay ${que}.`;

/*
 * E3 (lote 6a): en las dos ventas, la B general nombra la cuenta con el valor errado
 * (contabilidad/cierreConMesa.js) y sigue con su segunda frase (Futaba, PASA de Shoko). Antes era una
 * sola frase general, sin cuenta. Si la errada es
 * Inversiones – títulos, manda antes la C7.
 */
const SEGUNDA_CAJA = "A Caja entra todo lo que le pagaron por la venta. Míralo en el hecho.";

/* ═══════════ LAS CUATRO PARTES: UN ASIENTO POR PANTALLA ═══════════ */

/*
 * `asiento` es lo correcto, en el orden del diario. `errores` va por la
 * prioridad D > C > A > B; en las ventas, `C7` es la B que se muestra cuando
 * Inversiones – títulos lleva un valor que no es su costo. La C y la A de los
 * datos son solo el porqué: la primera frase, con las cuentas del estudiante,
 * la arma la mesa (lote 6d-2, contabilidad/cierreConMesa.js).
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
      C: "El interés entra a Caja, que sube por el Debe. Y es un ingreso, que sube por el Haber.",
      A: "El interés entra a Caja y, a la vez, es un ingreso.",
      /* Las B específicas (lote 6d-textos, Futaba): solo con ese valor exacto. */
      especificas: [
        { valor: 480000, clave: "B-anual", texto: "Pusiste el interés de todo el año. Aquí llega solo el de un trimestre: tres de los doce meses." },
        { valor: 40000, clave: "B-mes", texto: "Pusiste el interés de un solo mes. Aquí llega el de un trimestre: tres meses." },
      ],
      B: "Ese no es el interés de un trimestre sobre $2.000.000 al 24 % al año. Haz la cuenta por tres meses.",
      razones: {
        [BANCOS]: "En el ejemplo, el interés entra a Caja. Bancos solo se movió el día de la compra.",
        [INVERSIONES]: "Cobrar el interés no cambia la inversión: los títulos siguen siendo los mismos.",
        [GANANCIA]: NO_SE_VENDE("ganancia"),
        [PERDIDA]: NO_SE_VENDE("pérdida"),
      },
    },
  },
  {
    id: "b5-t5-a2-p2",
    rotulo: "Asiento 2",
    instruccion: "Registra la venta del 1 de agosto.",
    fecha: "1 de agosto",
    hecho: "1 de agosto. Santa Pacha vende 1.875 títulos, el 75 %. Cada uno le había costado $800. Los vende a $920, sin el interés. Recibe $1.725.000 en Caja.",
    asiento: [d(CAJA, 1725000), h(INVERSIONES, 1500000), h(GANANCIA, 225000)],
    /* Lote 20 (D9): el costo y el precio de venta de cada título, del hecho, para «Precio por título». */
    precio: { costo: 800, venta: 920 },
    errores: {
      D: "Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la ganancia. No hay pérdida, porque vendió por más de lo que costaron. Y aquí no entran Bancos ni el interés.",
      C: "Caja sube porque recibe lo de la venta: va al Debe. Inversiones – títulos baja porque salen títulos, y la ganancia es un ingreso: las dos van al Haber.",
      A: "Inversiones – títulos baja por lo que costaron. Lo que recibió de más va a la ganancia.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 1.875 × $800 = $1.500.000. La diferencia, $225.000, es la ganancia.",
      /* La C7 en dos ramas (entrega 1): `C7` si lleva lo recibido; `C7otro` con cualquier otro valor que no sea el costo. */
      C7otro: "Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 1.875 × $800 = $1.500.000. Lo demás que recibió es la ganancia.",
      /* La B general, con la cuenta nombrada (E3): queda `B` solo como respaldo si alguna cuenta no tuviera segunda frase. */
      B: "Algún valor no cuadra con el hecho: lo recibido, el costo o la diferencia.",
      segunda: {
        [CAJA]: SEGUNDA_CAJA,
        [GANANCIA]: "La ganancia es lo que sobra de lo recibido después de restar lo que costaron los títulos.",
      },
      razones: {
        [BANCOS]: "En el ejemplo, lo de la venta entra a Caja. Bancos solo se movió el día de la compra.",
        [INTERESES]: "El precio de $920 no incluye el interés. El interés se anota en su propio asiento.",
        [PERDIDA]: "Vendió a $920 lo que le costó $800: hay ganancia, no pérdida.",
      },
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
      C: "Como en agosto: Caja recibe el interés y va al Debe; el ingreso va al Haber.",
      A: "El interés entra a Caja y, a la vez, es un ingreso.",
      especificas: [
        { valor: 120000, clave: "B-sin-vender", texto: "Calculaste sobre $2.000.000, pero ya vendió el 75 %. El interés de noviembre es sobre los $500.000 que quedan." },
      ],
      B: "Ese no es el interés de un trimestre sobre los $500.000 que quedan. Haz la cuenta por tres meses.",
      razones: {
        [BANCOS]: "Como en agosto, el interés llega a Caja.",
        [INVERSIONES]: "Cobrar el interés no cambia la inversión: siguen los mismos 625 títulos.",
        [GANANCIA]: "Este asiento es solo el interés. La venta de noviembre va en el asiento 4.",
        [PERDIDA]: "Este asiento es solo el interés. La pérdida es de la venta, que va en el asiento 4.",
      },
    },
  },
  {
    id: "b5-t5-a2-p4",
    rotulo: "Asiento 4",
    instruccion: "Registra la venta del 1 de noviembre.",
    fecha: "1 de noviembre",
    hecho: "1 de noviembre. Santa Pacha vende los 625 títulos que quedan. Cada uno le había costado $800. Los vende a $750 y recibe $468.750 en Caja.",
    asiento: [d(CAJA, 468750), d(PERDIDA, 31250), h(INVERSIONES, 500000)],
    precio: { costo: 800, venta: 750 },
    errores: {
      D: "Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la pérdida. No hay ganancia, porque vendió por menos de lo que costaron. Y aquí no entran Bancos ni el interés, que se anota aparte.",
      C: "Caja sube con lo que recibe y la pérdida es un gasto: las dos van al Debe. La inversión baja porque salen títulos: va al Haber.",
      A: "Inversiones – títulos se acredita por lo que costaron; lo que faltó para llegar a ese costo va a la pérdida.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 625 × $800 = $500.000. La diferencia, $31.250, es la pérdida.",
      C7otro: "Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 625 × $800 = $500.000. Lo que le faltó para llegar a ese costo es la pérdida.",
      B: "Algún valor no cuadra con el hecho: lo recibido, el costo o la diferencia.",
      segunda: {
        [CAJA]: SEGUNDA_CAJA,
        [PERDIDA]: "La pérdida es lo que le faltó a lo recibido para llegar a lo que costaron los títulos.",
      },
      razones: {
        [BANCOS]: "Como en agosto, lo de la venta entra a Caja.",
        [INTERESES]: "El interés de noviembre ya se anotó en el asiento 3. Esta venta va aparte.",
        [GANANCIA]: "Vendió a $750 lo que le costó $800: hay pérdida, no ganancia.",
      },
    },
  },
];

/*
 * Lote 20 (D9, P2 de Mai): «Precio por título», solo en los asientos de venta. «ganancia» y «pérdida» son
 * fragmentos de los nombres de cuenta; el título y la frase para el lector son nuevos (PARA SHOKO).
 */
export const PRECIO_T5_ACT2 = {
  titulo: "Precio por título",
  ganancia: "ganancia",
  perdida: "pérdida",
  lector: (costo, venta, palabra) => `Precio por título: costó ${costo} y se vende a ${venta}; ${palabra}`,
};

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
