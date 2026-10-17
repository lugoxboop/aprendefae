import { DEBE, HABER } from "./contabilidad.js";
import { REGLAS_T5_ACT2, DIARIO_T5_ACT2, RESUMEN_T5_ACT2 } from "./contabilidadT5Act2.js";
import { GASTO, PROVISION, CLIENTES, CAJA } from "./contabilidadT6Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 3 — «Cuando la deuda castigada vuelve» (Célula B, b5-t6-a3).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act3.md. Precedencia (Sakuta):
 * el contenido de Futaba con sus líneas corregidas (el estante con «Ingresos
 * por ventas» de distractor, las D con «no hay ningún ingreso» y la B
 * general de la parte 4); el diseño, el anexo de Mai y su v1b. Las reglas,
 * el diario y el resumen son los publicados del cierre de T5.
 *
 * Los casos a, b y c son tres finales distintos del mismo castigo, no una
 * línea de tiempo: cada enunciado empieza por su caso y el diario los agrupa.
 * Todas las cifras son las de las pp. 204-206 (erratas corregidas).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT3 = {
  id: "b5-t6-a3",
  nombre: "Cuando la deuda castigada vuelve",
  /* Decisión de Sakuta: difícil, 50 FP (5 partes, más que el cierre de T5). */
  dificultad: "dificil",
  fpBase: 50,
  objetivo: "Registrar el pago de una deuda que ya se había castigado, en los tres casos del libro.",
  consigna: "Lee el hecho. Arma el asiento con las cuentas del estante.",
};

/* «¿Cómo se juega?», el diario y el resumen: los del cierre de T5. */
export const REGLAS_T6_ACT3 = REGLAS_T5_ACT2;
export const DIARIO_T6_ACT3 = DIARIO_T5_ACT2;
export const RESUMEN_T6_ACT3 = RESUMEN_T5_ACT2;

/* ═══════════ EL ESTANTE (líneas corregidas de Futaba) ═══════════ */

/* Solo un distractor (C13): no entra en ningún asiento correcto. Publicada desde el Tema 3. */
export const INGRESOS = "Ingresos por ventas";
export { GASTO, PROVISION, CLIENTES, CAJA };
export const ESTANTE_T6_ACT3 = [CAJA, CLIENTES, PROVISION, GASTO, INGRESOS];

const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const h = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* Las D, C y A se repiten según el tipo de asiento: revivir la deuda o el pago. */
const REVIVIR = {
  D: "Sobra una cuenta. Revivir la deuda solo mueve Cuentas por cobrar – clientes y la provisión. El gasto no se toca, la plata todavía no entra y no hay ningún ingreso.",
  C: "Revivir es reversar el castigo: lo que se debitó entonces ahora se acredita, y al revés.",
  A: "Revivir mueve la deuda y la provisión, como el castigo pero al revés.",
  /* Las razones por cuenta de la D (Futaba, entrega 1): detrás de «Sobra X.» o «No va X: en su lugar va Y.». */
  razones: {
    [CAJA]: "Revivir la deuda es reversar el castigo, y el castigo no movió plata. El pago se anota en otro asiento.",
    [GASTO]: "El castigo no tocó el gasto: fue contra la provisión. Por eso, al revivir la deuda, el gasto tampoco se toca.",
    [INGRESOS]: "Revivir la deuda no es una venta nueva: la factura es la de antes.",
  },
};
const PAGO = {
  D: "Sobra una cuenta. El pago solo mueve Caja y Cuentas por cobrar – clientes. La provisión ya se movió al revivir la deuda, y no hay ningún ingreso.",
  C: "La plata entra a Caja, que va al Debe, y la deuda se cancela por el Haber.",
  A: "El pago mueve Caja y la deuda del cliente.",
  razones: {
    [PROVISION]: "La provisión ya se movió en el asiento anterior, al revivir la deuda.",
    [GASTO]: "Cobrar no es un gasto: lo que debía el cliente se vuelve plata.",
    [INGRESOS]: "Cobrar no es vender: se cobra la factura que ya existía.",
  },
};

/* ═══════════ LAS CINCO PARTES ═══════════ */

/*
 * `fecha` es la etiqueta del diario: el caso (el libro imprime «xxxx»).
 * Las B específicas se muestran cuando alguna cuenta lleva ese valor.
 */
export const PARTES_T6_ACT3 = [
  {
    id: "b5-t6-a3-p1",
    rotulo: "Asiento 1",
    instruccion: "Registra cómo se revive la deuda del caso a.",
    fecha: "Caso a",
    hecho: "Caso a. Un tiempo después del castigo, Pablo Moncayo vuelve y paga toda la factura: $180.000.",
    asiento: [d(CLIENTES, 180000), h(PROVISION, 180000)],
    errores: { ...REVIVIR, especificas: [], B: "En el caso a, el cliente paga toda la factura, así que se revive toda. Ese valor no es la factura completa." },
  },
  {
    id: "b5-t6-a3-p2",
    rotulo: "Asiento 2",
    instruccion: "Registra el pago del caso a.",
    fecha: "Caso a",
    hecho: "Caso a. La deuda ya se revivió. Ahora entran a Caja los $180.000 que pagó Pablo Moncayo.",
    asiento: [d(CAJA, 180000), h(CLIENTES, 180000)],
    errores: { ...PAGO, especificas: [], B: "A Caja entra lo que pagó Pablo Moncayo, que es toda la factura. Ese valor no coincide." },
  },
  {
    id: "b5-t6-a3-p3",
    rotulo: "Asiento 3",
    instruccion: "Registra cómo se revive la deuda del caso b.",
    fecha: "Caso b",
    hecho: "Caso b. Un tiempo después del castigo, Pablo Moncayo abona $100.000 y promete pagar el resto.",
    asiento: [d(CLIENTES, 180000), h(PROVISION, 180000)],
    errores: {
      ...REVIVIR,
      especificas: [
        { valor: 100000, clave: "C14", texto: "Reviviste solo el abono. Como Pablo Moncayo promete pagar el resto, se revive toda la deuda." },
      ],
      B: "En el caso b se revive toda la deuda castigada, y ese valor no lo es.",
    },
  },
  {
    id: "b5-t6-a3-p4",
    rotulo: "Asiento 4",
    instruccion: "Registra el abono del caso b.",
    fecha: "Caso b",
    hecho: "Caso b. La deuda ya se revivió. Ahora entran a Caja los $100.000 del abono.",
    asiento: [d(CAJA, 100000), h(CLIENTES, 100000)],
    errores: {
      ...PAGO,
      especificas: [
        { valor: 180000, clave: "B-toda", texto: "Pusiste toda la deuda, pero a Caja solo entra lo que abonó. El resto sigue como deuda pendiente." },
      ],
      B: "A Caja entra solo el abono de Pablo Moncayo, y ese valor no lo es. Míralo en el hecho.",
    },
  },
  {
    id: "b5-t6-a3-p5",
    rotulo: "Asiento 5",
    instruccion: "Registra cómo se revive la deuda del caso c.",
    fecha: "Caso c",
    hecho: "Caso c. Un tiempo después del castigo, Pablo Moncayo abona $100.000 y avisa que ya no puede pagar más.",
    asiento: [d(CLIENTES, 100000), h(PROVISION, 100000)],
    errores: {
      ...REVIVIR,
      especificas: [
        { valor: 180000, clave: "C14", texto: "Reviviste toda la deuda. Como Pablo Moncayo ya no puede pagar más, se revive solo lo que pagó." },
      ],
      B: "En el caso c se revive solo lo que pagó Pablo Moncayo, y ese valor no lo es.",
    },
  },
];

/* ═══════════ EL TUTORIAL: EL CASTIGO DE MARZO, YA RESUELTO (p. 204) ═══════════ */

/* El punto de partida común de los tres casos (Futaba). */
export const CASTIGO_T6_ACT3 = {
  id: "b5-t6-a3-tutorial",
  rotulo: null,
  instruccion: null,
  fecha: "Marzo del año siguiente",
  hecho: "Marzo del año siguiente. El Torito Currambero castiga la deuda de Pablo Moncayo, que es de $180.000. Usa la provisión.",
  asiento: [d(PROVISION, 180000), h(CLIENTES, 180000)],
  errores: {},
  resolucion: [
    "La provisión baja: va al Debe.",
    "Cuentas por cobrar – clientes baja: va al Haber.",
    "Las dos por $180.000.",
    "Los casos a, b y c son tres finales distintos de este castigo.",
  ],
};
export const ALT_TUTORIAL_T6_ACT3 = "Ejemplo resuelto. En marzo del año siguiente, El Torito Currambero castiga la deuda de Pablo Moncayo. El asiento tiene Provisión para cuentas incobrables en el Debe y Cuentas por cobrar – clientes en el Haber, las dos por $180.000. Los dos totales dan $180.000.";

/* ═══════════ TEXTO ALTERNATIVO ═══════════ */

export const ALT_T6_ACT3 = "Actividad de registro. Hay cinco hechos sobre la deuda castigada de Pablo Moncayo, en los tres casos del libro. En cada uno, pon en la mesa las cuentas que mueve, ubícalas en el Debe o en el Haber y escribe cada valor. Abajo se ven los dos totales y la diferencia. Tienes un solo intento por asiento.";
