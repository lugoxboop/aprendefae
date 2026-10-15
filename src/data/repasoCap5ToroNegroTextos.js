import { CIFRAS, CASTIGOS_MARZO, RECUPERACION_MAYO, COLUMNAS, PORCENTAJES } from "./repasoCap5ToroNegro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-2 «El Toro Negro» — LOS TEXTOS (Célula E).
 *
 * Fuente de verdad: orquestador/conocimiento/paquetes/e5-r5-2-v2.md
 * (contenido de Miyata v2, diseño de Itagaki v2, decisiones de Kamogawa sobre
 * la auditoría de Takamura, que mandan). Todo texto del estudiante va LITERAL.
 *
 * Las cifras NO se copian: salen de repasoCap5ToroNegro.js (#137), que las
 * calcula de la tabla de la p. 269. Aquí solo se dice cuál es cuál.
 *
 * Lo que el paquete escribe entre paréntesis junto a una cuenta o un valor
 * («Caja (saltarse el revivir)», «$1.333.400 (partir el castigo)») es una
 * nota para quien construye, no texto de pantalla: no se guarda.
 *
 * El delta e5-r5-2-a0 (Calcula la provisión) se suma: siete ítems. Sus
 * decisiones de Kamogawa mandan sobre el contenido y el diseño del delta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LAS CIFRAS, POR NOMBRE (todas de repasoCap5ToroNegro.js) ═══════════ */

const castigo = (compania) => CASTIGOS_MARZO.find((c) => c.compania === compania).valor;

export const VALORES = {
  cartera: CIFRAS.totalGeneral, // 38.230.000
  provision: CIFRAS.provision, // 2.283.400
  roja: castigo("roja"), // 950.000
  negra: castigo("negra"), // 1.500.000
  castigos: CIFRAS.castigos, // 2.450.000
  recuperacion: RECUPERACION_MAYO.valor, // 950.000
  /* Lo que queda en la provisión tras cada movimiento. */
  trasRoja: CIFRAS.provision - castigo("roja"), // 1.333.400
  trasNegra: CIFRAS.provision - castigo("negra"), // 783.400
  sumando: CIFRAS.provision + CIFRAS.castigos, // 4.733.400
  faltante: CIFRAS.castigoSobreProvision, // 166.600, saldo débito
  mayo: RECUPERACION_MAYO.valor - CIFRAS.castigoSobreProvision, // 783.400, saldo crédito
};

/* ═══════════ LA FICHA ═══════════ */

export const R5_2 = {
  id: "r5-2",
  nombre: "El Toro Negro",
  /* Kamogawa: difícil, 50 FP, evaluativa. */
  dificultad: "dificil",
  fpBase: 50,
  modalidad: "evaluativa",
  /* Delta a0: el objetivo cambia. */
  objetivo: "Calcula una provisión, arma sus asientos y sigue qué le pasa en tres momentos del año.",
  entrada: "El Toro Negro vende a crédito. A 31 de diciembre, sus clientes le deben $38.230.000. No todo se podrá cobrar. Sigue su cartera de diciembre a mayo.",
};

/* ═══════════ LA HOJA DE CUENTAS (igual en las cinco pantallas de asiento) ═══════════ */

export const GASTO = "Gasto provisiones – cuentas incobrables";
export const PROVISION = "Provisión para deudas incobrables";
export const CLIENTES = "Cuentas por cobrar – clientes";
export const CAJA = "Caja";
export const INGRESOS = "Ingresos por ventas";
export const HOJA_DE_CUENTAS = [GASTO, PROVISION, CLIENTES, CAJA, INGRESOS];

/* ═══════════ LAS TRES ETAPAS ═══════════ */

export const ETAPAS = [
  { id: "dic", marca: "31 DIC" },
  { id: "marzo", marca: "MARZO" },
  { id: "mayo", marca: "MAYO" },
];

/* ═══════════ LOS TEXTOS DE INTERFAZ DEL DISEÑO (rótulos: no se miden con INFLESZ) ═══════════ */

export const ROTULOS_R5_2 = {
  progreso: (n, total) => `PREGUNTA ${n} DE ${total}`,
  debe: "DEBE",
  haber: "HABER",
  valor: "VALOR",
  vacio: "Toca para elegir la cuenta",
  cuentaDel: { debe: "CUENTA DEL DEBE", haber: "CUENTA DEL HABER" },
  enElOtro: { debe: "EN EL DEBE", haber: "EN EL HABER" },
  cerrar: "Cerrar",
  revisarAsiento: "Revisar asiento",
  revisarSaldo: "Revisar saldo",
  ladoDelSaldo: "LADO DEL SALDO",
  debito: "DÉBITO",
  credito: "CRÉDITO",
  eraEste: "ERA ESTE",
  tituloLibro: "Provisión para deudas incobrables",
  sinMovimientos: "Sin movimientos",
  saldoDebito: "SALDO DÉBITO",
  saldoCredito: "SALDO CRÉDITO",
  sinSaldo: "SIN SALDO",
  tituloCorte: "Así queda la provisión",
  casoEnTresTiempos: "EL CASO EN TRES TIEMPOS",
  siguiente: "Siguiente",
  nDeM: (n, m) => `${n} de ${m}`,
};

/* Los conceptos fijos del libro (§4). */
export const CONCEPTOS = {
  ajuste: "Ajuste 31 dic",
  castigoRoja: "Castigo Cía. Roja",
  castigoNegra: "Castigo Cía. Negra",
  revive: "Cía. Roja revive",
};

/* ═══════════ LAS PANTALLAS DE ASIENTO ═══════════ */

/*
 * Por cada pantalla: el asiento correcto (cuentas y la cifra del módulo), y
 * la retroalimentación con la regla de prioridad de Kamogawa:
 *   alReves → debeMal[cuenta] + haberMal[cuenta] (los dos si fallan los dos)
 *   → debeMal → haberMal → valorMal[cifra] → valorGenerica.
 */
/* ═══════════ (a0) CALCULA LA PROVISIÓN (delta e5-r5-2-a0) ═══════════ */

/*
 * Los siete grupos, con los rótulos de Miyata («1 a 30 días», con «a»: decisión
 * 1). Saldo, porcentaje y provisión de cada grupo salen de repasoCap5ToroNegro.js
 * por su columna: no se copian.
 */
const ROTULO_GRUPO = {
  vigentes: "Vigentes",
  "1-30": "1 a 30 días",
  "31-60": "31 a 60 días",
  "61-120": "61 a 120 días",
  "121-180": "121 a 180 días",
  "181-360": "181 a 360 días",
  "mas-de-360": "Más de 360 días",
};
export const GRUPOS_A0 = COLUMNAS.map((col) => ({
  id: col,
  grupo: ROTULO_GRUPO[col],
  saldo: CIFRAS.totalesColumna[col],
  porcentaje: PORCENTAJES[col],
  provision: CIFRAS.provisionColumna[col],
}));

const CALCULO_A0 = {
  id: "a0",
  etapa: "dic",
  tipo: "calculo",
  /* Itagaki: esta pantalla no lleva libro. */
  sinLibro: true,
  hecho: "31 de diciembre. El Toro Negro agrupó su cartera por vencimiento. Cada grupo lleva el porcentaje que fija la empresa.",
  /* Decisión 1: el enunciado de Miyata. */
  enunciado: "Calcula la provisión de cada grupo. Luego súmalas.",
  correcto: { valor: VALORES.provision },
  /* Por el total. La de 2.759.400 sale (decisión 3); la de 2.079.400 pasa a ser una omisión. */
  valorMal: [
    { valor: VALORES.provision + (CIFRAS.totalesColumna.vigentes * 3) / 100, texto: "Le pusiste porcentaje a las vigentes. Esas deudas aún no se vencen: la empresa les fija 0 %." },
    { valor: VALORES.provision - CIFRAS.provisionColumna["31-60"], texto: "Te faltó el grupo de 31 a 60 días. Revisa que sumaste los siete." },
    { valor: VALORES.cartera, texto: "Sumaste los saldos. Eso es toda la cartera. La provisión es solo la parte que quizá no cobres." },
  ],
  /* La coma: el total diez veces, la décima parte o cien veces (por 3 en vez de por 0,03: decisión 4). */
  coma: "Revisa la coma. El 3 % es 3 de cada 100: multiplica por 0,03.",
  valoresComa: [VALORES.provision * 10, VALORES.provision / 10, VALORES.provision * 100],
  /* Decisión 6: total bien con filas mal. */
  compensado: "Tu total está bien, pero revisa las filas marcadas: una se compensó con otra.",
  generica: "Revisa grupo por grupo: saldo por el porcentaje que fija la empresa. Luego suma los siete.",
  acierto: "Bien. Cada grupo aporta según lo vencido que está. Juntos dan $2.283.400: esa es la provisión.",
};

/* Los rótulos de la pantalla (a0), de Itagaki, con el del porcentaje de Miyata (decisión 1). */
export const ROTULOS_A0 = {
  grupoYSaldo: "GRUPO Y SALDO",
  tuProvision: "TU PROVISIÓN",
  /* La cifra y el «%» no se separan al partir el renglón (espacio de no separación). */
  porcentaje: (p) => `Porcentaje que fija la empresa: ${p}\u00a0%`,
  marcador: "Provisión",
  total: "Provisión total",
  cifrasEnPesos: "CIFRAS EN PESOS",
  revisar: "Revisar cálculo",
  correcta: "Correcta",
  era: (cifra) => `Era ${cifra}`,
};

const ASIENTO_1 = {
  id: "p1",
  etapa: "dic",
  /*
   * Delta a0: «la provisión que calculaste», siempre con la cifra correcta,
   * aunque (a0) haya salido mal (Miyata e Itagaki: el error de (a0) no se
   * cobra dos veces). «No trae saldo de antes» es un DATO DECLARADO POR LA
   * CÉLULA: el libro no lo dice (decisión 8).
   */
  hecho: "31 de diciembre. La provisión que calculaste es de $2.283.400. No trae saldo de antes.",
  enunciado: "Arma el asiento del ajuste de la provisión.",
  correcto: { debe: GASTO, haber: PROVISION, valor: VALORES.provision },
  alReves: "Va al revés. El gasto va al debe. La provisión crece por el haber.",
  debeMal: {
    [PROVISION]: "La provisión crece, y crece por el haber. Al debe va el gasto del año.",
    [CLIENTES]: "Nadie te debe más que antes. Lo nuevo es un gasto: eso va al debe.",
    [CAJA]: "No entra dinero. Solo estimas una pérdida, y una pérdida es un gasto.",
    [INGRESOS]: "Las ventas no se tocan. Lo que reconoces es un gasto por lo que quizá no cobres.",
  },
  haberMal: {
    [CLIENTES]: "Aún no sale ninguna deuda. Solo estimas lo que podrías perder. Por eso el haber es la provisión, no la cartera.",
    [CAJA]: "No sale dinero. La provisión es una estimación, no un pago.",
    [INGRESOS]: "No es un ingreso. Es lo que podrías perder: va a la provisión.",
    [GASTO]: "El gasto va en el debe. En el haber va la provisión que se crea.",
  },
  valorMal: [
    { valor: VALORES.cartera, texto: "Esa es toda la cartera. La provisión es solo la parte que quizá no cobres: $2.283.400." },
  ],
  /* Decisión 7: ningún «análisis» en r5-2. */
  valorGenerica: "Usa la provisión que calculaste: $2.283.400.",
  acierto: "Bien. Reconoces el gasto del año y creas la provisión. La cartera no se toca: nadie ha dejado de pagar todavía.",
};

const ASIENTO_2 = {
  id: "p2",
  etapa: "marzo",
  hecho: "Marzo del año siguiente. Se da por perdida una deuda de la Cía. Roja por $950.000. Lleva tanto tiempo vencida que la empresa ya no espera cobrarla.",
  enunciado: "Arma el castigo de la deuda de la Cía. Roja.",
  correcto: { debe: PROVISION, haber: CLIENTES, valor: VALORES.roja },
  alReves: "Va al revés: así la cartera sube. Castigar es sacar la deuda. La cartera va al haber.",
  debeMal: {
    [GASTO]: "El gasto de esta deuda ya se registró en diciembre, al crear la provisión. Si lo pones otra vez, lo cuentas dos veces. Castiga contra la provisión.",
    [CAJA]: "No entra dinero. Es justo lo contrario: una deuda que ya no se va a cobrar.",
    [INGRESOS]: "La venta fue real y no se anula. Lo que se pierde es el cobro, y eso ya se estimó en la provisión.",
    [CLIENTES]: "La deuda no sube: sale. La cartera va al haber.",
  },
  haberMal: {
    [PROVISION]: "La provisión es la que se usa, y se usa por el debe. Al haber va la deuda que sale.",
    [GASTO]: "El gasto no se toca aquí. Lo que sale es la deuda del cliente.",
    [CAJA]: "No sale dinero. Lo que sale de los libros es la deuda.",
    [INGRESOS]: "No hay ingreso que borrar. Lo que sale es lo que el cliente debía.",
  },
  valorMal: [
    { valor: VALORES.castigos, texto: "Ese es el total de los dos castigos. Esta pantalla pide solo el de la Cía. Roja." },
    { valor: VALORES.negra, texto: "Ese valor es de la Cía. Negra. La deuda perdida de la Cía. Roja es de $950.000." },
  ],
  valorGenerica: "Revisa el valor. Usa el de la deuda que se da por perdida.",
  acierto: "Bien. La deuda sale de la cartera y la provisión cubre la pérdida. El gasto no se toca: ya se registró en diciembre.",
};

const ASIENTO_3 = {
  id: "p3",
  etapa: "marzo",
  hecho: "También en marzo, se da por perdida una deuda de la Cía. Negra por $1.500.000. Tampoco se espera cobrarla.",
  enunciado: "Arma el castigo de la deuda de la Cía. Negra.",
  correcto: { debe: PROVISION, haber: CLIENTES, valor: VALORES.negra },
  alReves: "Así la deuda vuelve en vez de salir. Para castigar, la cartera va al haber.",
  debeMal: {
    [GASTO]: "Esta pérdida ya se cargó al gasto en diciembre. Si la cargas de nuevo, cuentas el gasto dos veces. Usa la provisión.",
    [CAJA]: "No llega dinero. Esta deuda se da por perdida.",
    [INGRESOS]: "La venta no se borra. Lo que se pierde es el cobro, y para eso está la provisión.",
    [CLIENTES]: "La cartera baja, no sube. Por eso va al haber.",
  },
  haberMal: {
    [PROVISION]: "La provisión se gasta por el debe. Al haber va la deuda que sale.",
    [GASTO]: "El gasto queda quieto. Lo que sale es la deuda de la Cía. Negra.",
    [CAJA]: "No sale dinero. Solo sale la deuda de los libros.",
    [INGRESOS]: "No hay venta que borrar. Sale lo que el cliente debía.",
  },
  valorMal: [
    /* «Partir el castigo»: lo que quedaba en la provisión tras la Cía. Roja. */
    { valor: VALORES.trasRoja, texto: "Pusiste solo lo que quedaba en la provisión. Pero el castigo va completo contra ella, aunque no alcance: $1.500.000. Pasó igual con Pablo Moncayo." },
    { valor: VALORES.castigos, texto: "Ese es el total de los dos castigos. Aquí va solo el de la Cía. Negra." },
    { valor: VALORES.roja, texto: "Ese valor es de la Cía. Roja. La deuda perdida de la Cía. Negra es de $1.500.000." },
  ],
  valorGenerica: "Revisa el valor. Es el de la deuda de la Cía. Negra.",
  acierto: "Correcto. El castigo va completo contra la provisión, aunque ya le quede poco.",
};

const HECHO_MAYO = "Mayo. La Cía. Roja paga con un cheque de $950.000. Con eso cancela la factura que se castigó en marzo.";

const ASIENTO_5 = {
  id: "p5",
  etapa: "mayo",
  hecho: HECHO_MAYO,
  enunciado: "Primero, revive la deuda de la Cía. Roja.",
  correcto: { debe: CLIENTES, haber: PROVISION, valor: VALORES.recuperacion },
  alReves: "Ese es el castigo de marzo. Revivir es hacer lo contrario: la deuda vuelve a la cartera.",
  debeMal: {
    /* «Saltarse el revivir». */
    [CAJA]: "Te saltaste un paso. Antes de cobrar, la deuda tiene que volver a la cartera. Si no, el pago no tiene qué cancelar.",
    [GASTO]: "El gasto no se toca. Revivir es devolver la deuda a la cartera.",
    [INGRESOS]: "Las ventas no se tocan. Revivir solo devuelve la deuda a los libros.",
    [PROVISION]: "La provisión recibe la deuda que vuelve: va al haber. Al debe va la cartera.",
  },
  haberMal: {
    /* «Revivir contra el gasto». */
    [GASTO]: "En marzo, el castigo no tocó el gasto: salió de la provisión. Al revivir la deuda, vuelve a la provisión.",
    /* «Registrar un ingreso». */
    [INGRESOS]: "Aquí no se anota ningún ingreso. No es una venta nueva: la deuda solo vuelve.",
    [CAJA]: "No sale dinero. La deuda solo vuelve a los libros.",
    [CLIENTES]: "La cartera ya va en el debe. Al haber va la provisión, de donde salió el castigo.",
  },
  valorMal: [
    { valor: VALORES.negra, texto: "Ese valor es de la Cía. Negra, que sigue sin pagar. La que vuelve es la de la Cía. Roja: $950.000." },
    { valor: VALORES.castigos, texto: "Solo paga la Cía. Roja. Revive solo su deuda: $950.000." },
  ],
  valorGenerica: "Revisa el valor. Es el de la deuda que vuelve.",
  acierto: "Bien. La deuda vuelve a la cartera y a la provisión. Es el castigo de marzo, pero al revés.",
};

const ASIENTO_6 = {
  id: "p6",
  etapa: "mayo",
  /* La misma tarjeta de la pantalla 5. */
  hecho: HECHO_MAYO,
  enunciado: "Ahora, anota el pago de la Cía. Roja.",
  correcto: { debe: CAJA, haber: CLIENTES, valor: VALORES.recuperacion },
  alReves: "El dinero entra, así que Caja va al debe. La deuda se paga, así que la cartera va al haber.",
  debeMal: {
    [PROVISION]: "La provisión ya se movió al revivir la deuda. Aquí entra dinero: va Caja.",
    [GASTO]: "El gasto no se toca. Lo que entra es el dinero del cheque.",
    [INGRESOS]: "Las ventas no se tocan. Al debe va el dinero que llega.",
    [CLIENTES]: "La deuda se paga, así que baja. La cartera va al haber.",
  },
  haberMal: {
    /* «Registrar un ingreso». */
    [INGRESOS]: "No se anota ingreso: la deuda volvió y se pagó.",
    [PROVISION]: "La provisión ya recibió los $950.000. Ahora el cheque paga la deuda que revivió: va la cartera.",
    [GASTO]: "El gasto queda quieto. El cheque paga una deuda, no un gasto.",
    [CAJA]: "Caja va en el debe, porque el dinero entra. Al haber va la deuda que se paga.",
  },
  valorMal: [
    { valor: VALORES.negra, texto: "La Cía. Negra no pagó. El cheque es de la Cía. Roja: $950.000." },
    { valor: VALORES.castigos, texto: "Solo llega un cheque, el de la Cía. Roja. Anota $950.000." },
  ],
  valorGenerica: "Revisa el valor. Es el del cheque.",
  acierto: "Bien. Primero la deuda vuelve a la cartera y a la provisión. Luego la Cía. Roja paga y la cartera baja. No hay ingreso: la deuda volvió y se pagó.",
};

/* ═══════════ LA PANTALLA DE SALDO (pregunta 4) ═══════════ */

/*
 * Prioridad (Kamogawa, decisión 2): primero 166.600 con el lado crédito,
 * después los valores previstos, después la genérica. Se permite 0, y con 0
 * no se exige lado.
 */
const SALDO_4 = {
  id: "p4",
  etapa: "marzo",
  tipo: "saldo",
  hecho: "La provisión empezó con $2.283.400. En marzo se castigaron dos deudas: $950.000 de la Cía. Roja y $1.500.000 de la Cía. Negra.",
  enunciado: "Escribe el saldo de la provisión. Luego elige si es débito o crédito.",
  correcto: { valor: VALORES.faltante, lado: "debito" },
  ladoMal: "La cifra está bien; el lado no. Salió más por el debe de lo que había en el haber. El saldo es débito.",
  valorMal: [
    { valor: VALORES.trasRoja, texto: "Restaste solo la Cía. Roja. Falta el castigo de la Cía. Negra: $1.500.000." },
    { valor: VALORES.trasNegra, texto: "Restaste solo la Cía. Negra. Falta el castigo de la Cía. Roja: $950.000. Ese número sí aparece más adelante, pero en marzo todavía no." },
    { valor: VALORES.sumando, texto: "Sumaste. El castigo baja la provisión: se resta, no se suma." },
    { valor: 0, texto: "La provisión no se queda en cero. Se castigó todo lo perdido, aunque pase de lo que había." },
  ],
  generica: "Parte de $2.283.400 y resta los dos castigos. Luego mira qué lado ganó.",
  acierto: "Correcto. Todo el castigo va contra la provisión. Como no alcanzó, queda en débito por $166.600.",
};

/* Las siete preguntas, en orden: (a0) y las seis de v2. */
export const PREGUNTAS_R5_2 = [
  CALCULO_A0,
  { ...ASIENTO_1, tipo: "asiento" },
  { ...ASIENTO_2, tipo: "asiento" },
  { ...ASIENTO_3, tipo: "asiento" },
  SALDO_4,
  { ...ASIENTO_5, tipo: "asiento" },
  { ...ASIENTO_6, tipo: "asiento" },
];

/* ═══════════ LOS CORTES ═══════════ */

export const CORTES_R5_2 = {
  dic: { parrafos: [] },
  marzo: {
    parrafos: ["La provisión es lo que estimaste perder. En diciembre estimaste $2.283.400. En marzo se perdieron $2.450.000. La estimación se quedó corta por $166.600. Por eso la provisión queda en débito: muestra un faltante. Ya lo viste con Pablo Moncayo. Tenía $148.800 y se castigaron $180.000. Si nada cambia, el próximo 31 de diciembre el ajuste suma lo que faltó."],
  },
  mayo: {
    parrafos: ["La provisión venía en débito por $166.600. Al revivir la deuda, recibió $950.000 en el haber. Ahora queda en crédito por $783.400. Ya no tiene faltante."],
  },
};
