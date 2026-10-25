/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LOS TEXTOS DE P2 «El mes de San Calixto» Y P6 «Lo que deja el periodo»
 * EN SecuenciaAprender (Célula E).
 *
 * Transcritos tal cual, sin reescribir, de lo que el paquete #578
 * (e3-t3-p2-p6-secuencia-v1.md, §0) da por aprobado:
 *   · e3-t3-p2-y-p6-v2.md (Miyata, lote 6): enunciados, aciertos y errores,
 *     ids, pies y lugar en el camino;
 *   · e3-t3-secuencias-textos-v2.md §3 y §4: titulares, fichas, cuentas,
 *     botones, opciones y la razón de P2-2;
 *   · -v3.md §2: CIERRE_P6 y el titular de P6-10;
 *   · -v4.md §1, §2 y §5: OBJETIVO_P6, las pistas y el titular de P2-8;
 *   · -v5.md §2: las razones del «Siguiente» (D11), con el cambio de la
 *     razón de ubicar que Takamura dio en el lote 16.
 *
 * Archivo aparte de t3SecuenciasTextos.js (P1, P3, P4 y P5) para no chocar con
 * la rama de las condiciones de encendido de #572. Su nombre no empieza por
 * contabilidadTema3: así no entra en la salvaguarda de t3-arma-el-ajuste.
 *
 *   · -v3-delta.md (Itagaki y Miyata, lote 16; PASA de Takamura, lote 17):
 *     P2-7, P6-7 y P6-9, la marca «ESCENARIO SIMULADO» y la pista de P6-4.
 *     Kamogawa dio la orden de montarlas en #586.
 *
 * Los montos de P2 no se escriben aquí: salen de los hechos publicados
 * (contabilidadTema3.js y contabilidadTema3Cierre.js), en p2.jsx.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ D11 · RAZÓN DEL «SIGUIENTE» DESACTIVADO (v5 §2; lote 16) ═══════════ */
export const RAZON_P2P6 = {
  opcion: "Cuando respondas, se abre «Siguiente».",
  asiento: "Cuando pongas las dos cuentas, se abre «Siguiente».",
  /* Takamura, lote 16: reemplaza a «Quedan fichas por ubicar.»; Miyata la confirmó (delta v3). */
  ubicar: "Cuando ubiques todas las fichas, se abre «Siguiente».",
  cifra: "Cuando escribas la cifra, se abre «Siguiente».",
  /* P2-2 conserva la suya (v2 §4; v5 §2). */
  p2Cobrados: "Falta tocar un servicio que se cobró el mismo día.",
};

/* ═══════════ P2 · «El mes de San Calixto» ═══════════ */

export const PIEZA_P2 = {
  id: "t3-a2-el-mes-de-san-calixto",
  titulo: "El mes de San Calixto",
  pie: "Libro, pp. 120-122 y 128",
};

/* Titulares: v2 §3; el de P2-8, v4 §5 (lote 14). */
export const TITULARES_P2 = {
  apertura: "Un enero completo de San Calixto",
  cobrados: "Cuatro servicios vendidos, ¿cuáles se cobraron?",
  haber: "El ingreso crece por el haber",
  asiento: "Un servicio cobrado, en un asiento",
  gastos: "Cuatro gastos pagados en efectivo",
  utilidad: "La utilidad de enero, hasta aquí",
  separan: "La caja no es la utilidad",
  cierre: "Lo que cambia la utilidad, y lo que no",
};

/* Los enunciados de Miyata (p2-y-p6-v2, columna «Texto»). */
export const TEXTOS_P2 = {
  apertura: "El 2 de enero, San Calixto abre con $15.000 en caja, un equipo de $5.000 y $20.000 de aportes. Sigue su enero.",
  cobrados: "En enero vendió cuatro servicios. Toca los que ya entraron a la caja.",
  haber: "El ingreso crece por el haber. La factura a JCC queda así: lo que le deben al debe y el ingreso al haber.",
  asiento: "LCDV pagó $3.000 por un servicio, el mismo día. Arma el asiento.",
  gastos: "Los cuatro gastos de enero se pagaron en efectivo. ¿Qué se mueve?",
  utilidad: "Ingresos de enero: $14.800. Gastos: $8.350. Escribe la utilidad.",
  separan: "La caja cerró en $14.650 y la utilidad fue $6.450. Elige las dos cosas que las separan.",
};

/* Los aciertos (p2-y-p6-v2, «Aciertos y errores»). El de P2-6 es el de Miyata (72,9 en su réplica). */
export const ACIERTOS_P2 = {
  cobrados: "Vendió $14.800, pero solo cobró $8.000. Lo demás queda por cobrar.",
  asiento: "Así se anota un servicio cobrado: la caja al debe y el ingreso al haber.",
  gastos: "Se consumieron y se pagaron en enero. Hay gasto y sale plata: $8.350 en total.",
  utilidad: "Ingresos menos gastos: $6.450. Es la utilidad de enero hasta aquí. Al 31 aún falta un gasto.",
  separan: "El aporte de los socios entró a la caja, pero no es ingreso. Y lo que falta cobrar es ingreso, pero no entró.",
};

/* P2-2 · FICHAS_P2_2 (v2 §3). El error «Dejó sin marcar uno cobrado» pasó a ser la razón (v2 §4). */
export const FICHAS_P2_2 = [
  { id: "dia-5", rotulo: "Día 5", nombre: "Servicio del 5 de enero", monto: 5000, cobrado: true },
  { id: "jcc", rotulo: "JCC", nombre: "Factura a JCC", monto: 4000, cobrado: false },
  { id: "lcdv", rotulo: "LCDV", nombre: "Servicio a LCDV", monto: 3000, cobrado: true },
  { id: "mps", rotulo: "MPS", nombre: "Factura a MPS", monto: 2800, cobrado: false },
];
export const ERROR_P2_2_FACTURA = "Esa factura se envió, pero no se ha cobrado. El ingreso ya existe; la plata no.";

/* P2-3 · el asiento de la factura (p. 122; Miyata, C3 a ojo). */
export const CUENTAS_P2_3 = { debe: "Cuentas por cobrar – clientes", haber: "Ingresos por servicios" };

/* P2-4 · CUENTAS_P2_4 (v2 §3). «Al revés» es un solo error para el par (regla de v3): lo dan las dos cuentas del par puestas del lado contrario. */
export const ERROR_P2_4_AL_REVES = "Va al revés. La caja sube por el debe y el ingreso por el haber.";
export const CUENTAS_P2_4 = [
  { cuenta: "Caja", lado: "debe", error: ERROR_P2_4_AL_REVES },
  { cuenta: "Ingresos por servicios", lado: "haber", error: ERROR_P2_4_AL_REVES },
  { cuenta: "Cuentas por cobrar – clientes", lado: null, error: "LCDV pagó el mismo día: nadie le debe. La plata entra a la caja." },
  { cuenta: "Aportes sociales", lado: null, error: "La plata vino de un cliente por un servicio, no de los socios." },
];

/* P2-5 · los botones (v2 §3) y sus errores (p2-y-p6-v2). */
export const OPC_P2_5 = [
  { id: "gasto", texto: "Solo el gasto" },
  { id: "caja", texto: "Solo la caja" },
  { id: "las-dos", texto: "Las dos" },
];
export const CORRECTA_P2_5 = "las-dos";
export const ERRORES_P2_5 = {
  gasto: "También salió plata: los cuatro se pagaron en efectivo.",
  caja: "También hubo gasto: lo pagado ya se consumió en enero.",
};

/* P2-6 · el error genérico. */
export const ERROR_P2_6 = "Ingresos menos gastos. Revisa la resta.";

/*
 * P2-7 · las opciones y sus errores (v2 §3, PASA del lote 12). La forma es la
 * del delta v3 §2: la línea de lectura en la fila de control, siempre a la vista.
 */
export const OPC_P2_7 = [
  { id: "aporte", texto: "El aporte", correcta: true, error: null },
  { id: "falta-cobrar", texto: "Lo que falta cobrar", correcta: true, error: null },
  { id: "gastos-pagados", texto: "Los gastos pagados", correcta: false, error: "Los gastos pagados mueven igual la caja y la utilidad. No las separan." },
  { id: "equipo", texto: "El equipo", correcta: false, error: "El equipo no es plata y no pasó por la utilidad. No explica la distancia." },
];
export const ERROR_P2_7_SOLO_UNA = "Falta una. Son dos cosas: una le suma a la caja y otra le resta.";

/* P2-8 · el Cierre sin acción, en 2 pasos por frase completa (forma v2 §2). */
export const CIERRE_P2 = [
  "Vender y consumir. Cobrar y pagar mueven la caja, no la utilidad.",
  "El 31 todavía falta algo. Desde el 27 usa una máquina alquilada y no la ha pagado.",
];

/* Pistas del primer error (v4 §2). P2-3 no lleva: es un Míralo. */
export const PISTAS_P2 = {
  cobrados: "Busca los servicios que se pagaron el mismo día que se prestaron.",
  asiento: "Entró plata y nació un ingreso. ¿Por qué lado crece cada uno?",
  gastos: "Pregunta dos cosas por separado: ¿se consumió algo? ¿Salió plata?",
  utilidad: "La utilidad sale de restar: lo vendido menos lo consumido.",
  separan: "Busca lo que movió la caja sin pasar por la utilidad, y al revés.",
};

/* ═══════════ P6 · «Lo que deja el periodo» ═══════════ */

export const PIEZA_P6 = {
  id: "t3-a6-lo-que-deja-el-periodo",
  titulo: "Lo que deja el periodo",
  pie: "Libro, pp. 124-125 y 131-136. Pantalla 9: Escenario simulado.",
};

/* Titulares: v2 §3; el de P6-10, v3 §2 (Takamura, lote 16: «Ippo monta contra el texto»). */
export const TITULARES_P6 = {
  apertura: "¿Todo lo que ganó es de los accionistas?",
  separar: "Lo de lavar ropa y lo que no",
  antes: "La utilidad antes del impuesto",
  impuesto: "El impuesto: 33 % en este ejercicio",
  estado: "Esto se llama estado de resultados",
  reparte: "Ganancias y pérdidas se reparte",
  porPagar: "El impuesto queda por pagar",
  aSuEstado: "Cada cuenta a su estado",
  acacias: "Cuando el mes deja pérdida",
  cierre: "El estado de resultados, de arriba abajo",
};

/* OBJETIVO_P6 (v4 §1): el paso 1 de P6-1. */
export const OBJETIVO_P6 = "Calcula lo que deja el periodo y dónde va cada cuenta.";

export const TEXTOS_P6 = {
  apertura: "Lavalimpio lava ropa. Cerró enero, su primer mes, con utilidad en Ganancias y pérdidas. ¿Todo eso es de los accionistas?",
  separar: "Separa los gastos de enero: los de la operación y el que no viene de lavar ropa.",
  antes: "La operación deja $6.020.000: lo que entró por lavar menos lo que costó lavar. Ahora resta el interés.",
  impuesto: "En este ejercicio, el impuesto es el 33 % de la utilidad antes de impuestos. Escribe el impuesto.",
  estado: "Lo que armaste es el estado de resultados. Baja de los ingresos hasta lo que les queda a los accionistas.",
  reparte: "Cierra Ganancias y pérdidas: pon en el haber las dos cuentas que reciben su saldo.",
  porPagar: "¿Ya se pagó el impuesto? Elige el asiento que lo deja anotado.",
  aSuEstado: "Lleva cada cuenta a su lugar en el estado de situación financiera.",
  /* e3-t3-p2-y-p6-v2.md, P6-9 (la marca va en la figura: delta v3 §1). */
  acacias: "Las Acacias perdió $100.000 en febrero. ¿Con qué asiento cierra Ganancias y pérdidas?",
};

export const ACIERTOS_P6 = {
  apertura: "No todo. Antes de saber qué les queda, falta el impuesto.",
  separar: "Los cuatro gastos de lavar ropa son operacionales. El interés, no: es un costo de financiarse.",
  antes: "La utilidad antes de impuestos es $5.935.000. Sobre ella se calcula el impuesto.",
  impuesto: "El 33 % de $5.935.000 es $1.958.550. Lo que queda, $3.976.450, es la utilidad del ejercicio.",
  reparte: "Ganancias y pérdidas queda en cero. Su saldo se reparte: una parte para el impuesto y el resto para los accionistas.",
  aSuEstado: "La utilidad del ejercicio es de los accionistas: va al patrimonio. El impuesto por pagar es una deuda: va al pasivo.",
  /* e3-t3-p2-y-p6-v2.md, P6-7 y P6-9. */
  porPagar: "Todavía no se paga: queda como una deuda con el Estado, en Impuesto de renta por pagar.",
  acacias: "La pérdida del ejercicio va al debe y deja en cero a Ganancias y pérdidas.",
};

/* P6-1 · Sí / No. La clave es «No». */
export const OPC_P6_1 = [{ id: "si", texto: "Sí" }, { id: "no", texto: "No" }];
export const ERRORES_P6_1 = { si: "Todavía no: de ese saldo sale el impuesto." };

/*
 * P6-2 · los cinco gastos de enero de Lavalimpio, uno por paso (p. 135; la
 * comprobación de Miyata suma 2.600.000 de operación). Los nombres son los de
 * su enunciado; los botones, «Operación» y «No operacional».
 */
export const OPERACION = "operacion";
export const NO_OPERACIONAL = "no-operacional";
export const OPC_P6_2 = [{ id: OPERACION, texto: "Operación" }, { id: NO_OPERACIONAL, texto: "No operacional" }];
export const ERROR_P6_2_INTERES = "El interés es un costo de financiarse, no de lavar ropa. Por eso es un gasto no operacional.";
export const ERROR_P6_2_OTRO = "Ese gasto sale de lavar ropa. Es parte de la operación.";
export const GASTOS_P6_2 = [
  { cuenta: "Materiales", saldo: 320000, respuesta: OPERACION, error: ERROR_P6_2_OTRO },
  { cuenta: "Mantenimiento", saldo: 120000, respuesta: OPERACION, error: ERROR_P6_2_OTRO },
  { cuenta: "Salarios", saldo: 1670000, respuesta: OPERACION, error: ERROR_P6_2_OTRO },
  { cuenta: "Servicios públicos", saldo: 490000, respuesta: OPERACION, error: ERROR_P6_2_OTRO },
  { cuenta: "Interés", saldo: 85000, respuesta: NO_OPERACIONAL, error: ERROR_P6_2_INTERES },
];

/* El estado de resultados de enero (p. 135; comprobación de Miyata). Rótulos publicados en el sitio. */
export const LAVALIMPIO_ENERO = {
  ingresosOperacionales: [3900000, 4720000],
  tasaImpuesto: 33,
};
export const ROTULOS_ESTADO = {
  titulo: "Estado de resultados",
  ingresos: "Ingresos operacionales",
  gastosOperacionales: "Gastos operacionales",
  operacional: "Utilidad operacional",
  noOperacionales: "Gastos no operacionales",
  antes: "Utilidad antes de impuestos",
  impuesto: "Impuesto de renta",
  ejercicio: "Utilidad del ejercicio",
  menos: "Menos:",
};

/* P6-3 · los errores por cifra escrita. */
export const ERRORES_P6_3 = {
  6020000: "Esa es la utilidad de la operación. Falta restar el interés: $85.000.",
  6105000: "El interés se resta, no se suma.",
};
/* P6-4 · los errores por cifra escrita. */
export const ERRORES_P6_4 = {
  1986600: "Ese 33 % se sacó antes de restar el interés. Primero resta el interés; luego saca el impuesto.",
  3976450: "Esa es la parte que queda después del impuesto. Aquí se pide el impuesto.",
};

/* P6-6 · CUENTAS_P6_6 (v2 §3). Ganancias y pérdidas viene puesta en el debe. */
export const GANANCIAS_Y_PERDIDAS_P6 = "Ganancias y pérdidas";
export const CUENTAS_P6_6 = [
  { cuenta: "Impuesto de renta", lado: "haber", error: null },
  { cuenta: "Utilidad del ejercicio", lado: "haber", error: null },
  { cuenta: "Impuesto de renta por pagar", lado: null, error: "Primero va a Impuesto de renta. En el asiento siguiente pasa a la cuenta por pagar." },
  { cuenta: "Caja", lado: null, error: "El impuesto no se paga al cerrar. Aquí no sale plata." },
];

/* P6-7 y P6-9 · opciones con PASA (v2 §3), en la lista unida del delta v3 §1. */
export const OPC_P6_7 = [
  { id: "por-pagar", debe: "Impuesto de renta", haber: "Impuesto de renta por pagar", correcta: true, error: null },
  { id: "caja", debe: "Impuesto de renta", haber: "Caja", correcta: false, error: "El impuesto aún no se paga. No sale plata: queda la deuda." },
  { id: "al-reves", debe: "Impuesto de renta por pagar", haber: "Impuesto de renta", correcta: false, error: "Va al revés. La deuda crece por el haber." },
];
export const OPC_P6_9 = [
  { id: "perdida", debe: "Pérdida del ejercicio", haber: "Ganancias y pérdidas", correcta: true, error: null },
  { id: "al-reves", debe: "Ganancias y pérdidas", haber: "Pérdida del ejercicio", correcta: false, error: "Ganancias y pérdidas quedó en el debe. Para dejarla en cero, va al haber." },
  { id: "utilidad", debe: "Ganancias y pérdidas", haber: "Utilidad del ejercicio", correcta: false, error: "Con pérdida no hay utilidad que repartir. El saldo quedó en el debe." },
];

/* P6-9 · la marca de la figura (delta v3 §1) y el dato de su línea de datos (e3-t3-p2-y-p6-v2.md, P6-9). */
export const MARCA_P6_9 = "Escenario simulado";
export const LAS_ACACIAS_P6 = { nombre: "Las Acacias", rotulo: "Pérdida", perdida: 100000 };

/* P6-8 · cada cuenta a su estado, una por paso. */
export const PASIVO = "pasivo";
export const PATRIMONIO = "patrimonio";
export const ZONAS_P6_8 = [{ id: PASIVO, nombre: "Pasivo" }, { id: PATRIMONIO, nombre: "Patrimonio" }];
export const CUENTAS_P6_8 = [
  { cuenta: "Utilidad del ejercicio", respuesta: PATRIMONIO, error: "La utilidad del ejercicio no se le debe a nadie de afuera: es de los accionistas. Va al patrimonio." },
  { cuenta: "Impuesto de renta por pagar", respuesta: PASIVO, error: "El impuesto se le debe al Estado. Es una deuda: va al pasivo." },
];

/* P6-10 · CIERRE_P6, en 2 pasos (v3 §2). */
export const CIERRE_P6 = [
  "A la operación se le resta lo no operacional. Así queda la utilidad antes de impuestos.",
  "El impuesto es deuda; el resto va al patrimonio.",
];

/* Pistas del primer error (v4 §2). La de P6-4, de Miyata (delta v3, lote 16). */
export const PISTAS_P6 = {
  apertura: "Antes de saber qué les toca a los accionistas, ¿falta algo por restar?",
  separar: "Pregúntate si ese gasto sale de lavar ropa o de cómo se financia la empresa.",
  antes: "A la utilidad de la operación todavía le falta restar un gasto.",
  impuesto: "El 33 % va sobre la última cifra que destapaste en la pila.",
  reparte: "El saldo de Ganancias y pérdidas se reparte en dos partes. ¿Cuáles?",
  porPagar: "Pregúntate si ya salió la plata del impuesto, o si todavía se debe.",
  aSuEstado: "Pregúntate a quién le pertenece cada cuenta: a los accionistas o a alguien de afuera.",
  acacias: "Mira de qué lado quedó el saldo. Para dejarlo en cero, va al lado contrario.",
};

/* Lo que espera, con nombre, para la prueba y el cuerpo del PR: nada (delta v3 montado en #586). */
export const PENDIENTES_P2P6 = [];
