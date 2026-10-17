import { VEREDICTO } from "./repasoCap5Comun.js";
import { pesos as p } from "./contabilidad.js";
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

/*
 * Las cifras de una versión, desde sus castigos (la provisión es la misma en
 * A y en B). Versión B (D8, Miyata): la Cía. Roja $850.000 y la Negra
 * $1.200.000; la provisión alcanza y queda en el haber.
 */
export function valoresDe({ roja, negra }) {
  const provision = CIFRAS.provision; // 2.283.400
  const castigos = roja + negra;
  return {
    cartera: CIFRAS.totalGeneral, // 38.230.000
    provision,
    roja, // A 950.000 · B 850.000
    negra, // A 1.500.000 · B 1.200.000
    castigos, // A 2.450.000 · B 2.050.000
    recuperacion: roja, // la Cía. Roja paga en mayo
    /* Lo que queda en la provisión tras cada movimiento. */
    trasRoja: provision - roja, // A 1.333.400 · B 1.433.400
    trasNegra: provision - negra, // A 783.400 · B 1.083.400
    sumando: provision + castigos, // A 4.733.400 · B 4.333.400
    /* El saldo de marzo con signo (haber +): A −166.600 (debe) · B 233.400 (haber). */
    marzo: provision - castigos,
    faltante: castigos - provision, // A 166.600
    mayo: provision - castigos + roja, // A 783.400 · B 1.083.400, en el haber
  };
}
export const DATOS_R5_2 = {
  A: { roja: castigo("roja"), negra: castigo("negra") },
  B: { roja: 850000, negra: 1200000 },
};
export const VALORES = valoresDe(DATOS_R5_2.A);

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
  /* Lote de textos (Miyata): la cita del libro, al pie de cada pregunta. */
  cita: "Basado en el libro: el 3 del bloque D, pp. 268-269.",
  entrada: "El Toro Negro vende a crédito. A 31 de diciembre, sus clientes le deben $38.230.000. No todo se podrá cobrar. Sigue su cartera de diciembre a mayo.",
};

/* ═══════════ LA HOJA DE CUENTAS (igual en las cinco pantallas de asiento) ═══════════ */

export const GASTO = "Gasto provisiones – cuentas incobrables";
export const PROVISION = "Provisión para cuentas incobrables";
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
  /* §4.3: «Paso n de N» (los pasos de un solo caso); el mismo sustantivo en el botón de avance. */
  sustantivo: "Paso",
  progreso: (n, total) => `Paso ${n} de ${total}`,
  debe: "DEBE",
  haber: "HABER",
  valor: "VALOR",
  vacio: "Toca para elegir la cuenta",
  cuentaDel: { debe: "CUENTA DEL DEBE", haber: "CUENTA DEL HABER" },
  enElOtro: { debe: "EN EL DEBE", haber: "EN EL HABER" },
  cerrar: "Cerrar",
  revisarAsiento: "Comprobar",
  revisarSaldo: "Comprobar",
  ladoDelSaldo: "LADO DEL SALDO",
  /*
   * v2.1 (autodiagnóstico): después de revisar, cada pieza dice con palabras
   * si quedó bien. Antes solo lo decía el color del borde (D12).
   */
  /* §4.2: cuenta, valor y lado dicen las mismas tres palabras (repasoCap5Comun.js). */
  veredicto: VEREDICTO,
  debito: "DÉBITO",
  credito: "CRÉDITO",
  /* Lote de textos (Miyata): los botones del lado en P4, «Debe · Haber». */
  botonLado: { debito: "Debe", credito: "Haber" },
  eraEste: "Iba aquí",
  tituloLibro: "Provisión para cuentas incobrables",
  sinMovimientos: "Sin movimientos",
  saldoDebito: "SALDO DÉBITO",
  saldoCredito: "SALDO CRÉDITO",
  sinSaldo: "SIN SALDO",
  tituloCorte: "Así queda la provisión",
  casoEnTresTiempos: "EL CASO EN TRES TIEMPOS",
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
  acierto: "Cada grupo aporta según lo vencido que está. Juntos dan $2.283.400: esa es la provisión.",
};

/* Los rótulos de la pantalla (a0), de Itagaki, con el del porcentaje de Miyata (decisión 1). */
export const ROTULOS_A0 = {
  grupoYSaldo: "GRUPO Y SALDO",
  tuProvision: "TU PROVISIÓN",
  /*
   * v2.1 (autodiagnóstico, Kamogawa): «Porcentaje que fija la empresa: N %»
   * se repetía siete veces y a 320 partía en tres renglones por fila; la
   * tabla medía 1.618 px. La frase ya está en el hecho; en cada fila queda la
   * cuenta que hay que hacer: «× 3 %», junto al saldo. La cifra y el «%» no
   * se separan (espacio de no separación).
   */
  porcentaje: (p) => `×\u00a0${p}\u00a0%`,
  marcador: "Provisión",
  total: "Provisión total",
  cifrasEnPesos: "CIFRAS EN PESOS",
  revisar: "Comprobar",
  correcta: "Correcto",
  era: (cifra) => `Iba aquí: ${cifra}`,
};

/*
 * Las preguntas y los cortes de una versión (D8). Las cifras salen de `V`;
 * los textos con cifra son plantillas; donde la lógica cambia (el saldo de
 * marzo queda en el haber en B), va el texto propio de la versión (Miyata).
 */
export function construirR5_2(V, version = "A") {
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
    correcto: { debe: GASTO, haber: PROVISION, valor: V.provision },
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
      { valor: V.cartera, texto: "Esa es toda la cartera. La provisión es solo la parte que quizá no cobres: $2.283.400." },
    ],
    /* Decisión 7: ningún «análisis» en r5-2. */
    valorGenerica: "Usa la provisión que calculaste: $2.283.400.",
    acierto: "Reconoces el gasto del año y creas la provisión. La cartera no se toca: nadie ha dejado de pagar todavía.",
  };

  const ASIENTO_2 = {
    id: "p2",
    etapa: "marzo",
    hecho: `Marzo del año siguiente. Se da por perdida una deuda de la Cía. Roja por ${p(V.roja)}. Lleva tanto tiempo vencida que la empresa ya no espera cobrarla.`,
    enunciado: "Arma el castigo de la deuda de la Cía. Roja.",
    correcto: { debe: PROVISION, haber: CLIENTES, valor: V.roja },
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
      { valor: V.castigos, texto: "Ese es el total de los dos castigos. Esta pantalla pide solo el de la Cía. Roja." },
      { valor: V.negra, texto: `Ese valor es de la Cía. Negra. La deuda perdida de la Cía. Roja es de ${p(V.roja)}.` },
    ],
    valorGenerica: "Revisa el valor. Usa el de la deuda que se da por perdida.",
    acierto: "La deuda sale de la cartera y la provisión cubre la pérdida. El gasto no se toca: ya se registró en diciembre.",
  };

  const ASIENTO_3 = {
    id: "p3",
    etapa: "marzo",
    hecho: `También en marzo, se da por perdida una deuda de la Cía. Negra por ${p(V.negra)}. Tampoco se espera cobrarla.`,
    enunciado: "Arma el castigo de la deuda de la Cía. Negra.",
    correcto: { debe: PROVISION, haber: CLIENTES, valor: V.negra },
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
      /* «Partir el castigo»: lo que quedaba en la provisión tras la Cía. Roja. Solo en A: en B la provisión alcanza. */
      ...(version === "A" ? [{ valor: V.trasRoja, texto: `Pusiste solo lo que quedaba en la provisión. Pero el castigo va completo contra ella, aunque no alcance: ${p(V.negra)}. Pasó igual con Pablo Moncayo.` }] : []),
      { valor: V.castigos, texto: "Ese es el total de los dos castigos. Aquí va solo el de la Cía. Negra." },
      { valor: V.roja, texto: `Ese valor es de la Cía. Roja. La deuda perdida de la Cía. Negra es de ${p(V.negra)}.` },
    ],
    valorGenerica: "Revisa el valor. Es el de la deuda de la Cía. Negra.",
    acierto: "El castigo va completo contra la provisión, aunque ya le quede poco.",
  };

  const HECHO_MAYO = `Mayo. La Cía. Roja paga con un cheque de ${p(V.recuperacion)}. Con eso cancela la factura que se castigó en marzo.`;

  const ASIENTO_5 = {
    id: "p5",
    etapa: "mayo",
    hecho: HECHO_MAYO,
    enunciado: "Primero, revive la deuda de la Cía. Roja.",
    correcto: { debe: CLIENTES, haber: PROVISION, valor: V.recuperacion },
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
      { valor: V.negra, texto: `Ese valor es de la Cía. Negra, que sigue sin pagar. La que vuelve es la de la Cía. Roja: ${p(V.recuperacion)}.` },
      { valor: V.castigos, texto: `Solo paga la Cía. Roja. Revive solo su deuda: ${p(V.recuperacion)}.` },
    ],
    valorGenerica: "Revisa el valor. Es el de la deuda que vuelve.",
    acierto: "La deuda vuelve a la cartera y a la provisión. Es el castigo de marzo, pero al revés.",
  };

  const ASIENTO_6 = {
    id: "p6",
    etapa: "mayo",
    /* La misma tarjeta de la pantalla 5. */
    hecho: HECHO_MAYO,
    enunciado: "Ahora, anota el pago de la Cía. Roja.",
    correcto: { debe: CAJA, haber: CLIENTES, valor: V.recuperacion },
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
      [PROVISION]: `La provisión ya recibió los ${p(V.recuperacion)}. Ahora el cheque paga la deuda que revivió: va la cartera.`,
      [GASTO]: "El gasto queda quieto. El cheque paga una deuda, no un gasto.",
      [CAJA]: "Caja va en el debe, porque el dinero entra. Al haber va la deuda que se paga.",
    },
    valorMal: [
      { valor: V.negra, texto: `La Cía. Negra no pagó. El cheque es de la Cía. Roja: ${p(V.recuperacion)}.` },
      { valor: V.castigos, texto: `Solo llega un cheque, el de la Cía. Roja. Anota ${p(V.recuperacion)}.` },
    ],
    valorGenerica: "Revisa el valor. Es el del cheque.",
    acierto: "Primero la deuda vuelve a la cartera y a la provisión. Luego la Cía. Roja paga y la cartera baja. No hay ingreso: la deuda volvió y se pagó.",
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
    hecho: `La provisión empezó con ${p(V.provision)}. En marzo se castigaron dos deudas: ${p(V.roja)} de la Cía. Roja y ${p(V.negra)} de la Cía. Negra.`,
    enunciado: "Escribe el saldo de la provisión. Luego elige si queda en el debe o en el haber.",
    correcto: { valor: Math.abs(V.marzo), lado: V.marzo < 0 ? "debito" : "credito" },
    ladoMal: version === "A"
      ? "La cifra está bien; el lado no. Salió más por el debe de lo que había en el haber. El saldo queda en el debe."
      : "La cifra está bien; el lado no. Los castigos no gastaron toda la provisión. El saldo queda en el haber.",
    valorMal: [
      { valor: V.trasRoja, texto: `Restaste solo la Cía. Roja. Falta el castigo de la Cía. Negra: ${p(V.negra)}.` },
      { valor: V.trasNegra, texto: `Restaste solo la Cía. Negra. Falta el castigo de la Cía. Roja: ${p(V.roja)}. Ese número sí aparece más adelante, pero en marzo todavía no.` },
      { valor: V.sumando, texto: "Sumaste. El castigo baja la provisión: se resta, no se suma." },
      { valor: 0, texto: version === "A" ? "La provisión no se queda en cero. Se castigó todo lo perdido, aunque pase de lo que había." : "La provisión no se queda en cero. Los castigos fueron menos de lo estimado: algo sobra." },
    ],
    generica: `Parte de ${p(V.provision)} y resta los dos castigos. Luego mira qué lado ganó.`,
    acierto: version === "A"
      ? `Todo el castigo va contra la provisión. Como no alcanzó, queda en el debe por ${p(-V.marzo)}.`
      : `Los dos castigos salen de la provisión, y alcanzó. Queda en el haber por ${p(V.marzo)}.`,
  };

  /* Las siete preguntas, en orden: (a0) y las seis de v2. */
  const PREGUNTAS = [
    CALCULO_A0,
    { ...ASIENTO_1, tipo: "asiento" },
    { ...ASIENTO_2, tipo: "asiento" },
    { ...ASIENTO_3, tipo: "asiento" },
    SALDO_4,
    { ...ASIENTO_5, tipo: "asiento" },
    { ...ASIENTO_6, tipo: "asiento" },
  ];

  /* ═══════════ LOS CORTES ═══════════ */

  const CORTES = {
    dic: { parrafos: [] },
    marzo: {
      parrafos: [version === "A"
        ? `La provisión es lo que estimaste perder. En diciembre estimaste ${p(V.provision)}. En marzo se perdieron ${p(V.castigos)}. La estimación se quedó corta por ${p(-V.marzo)}. Por eso la provisión queda en el debe: muestra un faltante. Ya lo viste con Pablo Moncayo. Tenía $148.800 y se castigaron $180.000. Si nada cambia, el próximo 31 de diciembre el ajuste suma lo que faltó.`
        : `La provisión es lo que estimaste perder. En diciembre estimaste ${p(V.provision)}. En marzo se perdieron ${p(V.castigos)}. Sobraron ${p(V.marzo)}. Por eso la provisión queda en el haber: todavía cubre deudas que se podrían perder.`],
    },
    mayo: {
      parrafos: [version === "A"
        ? `La provisión venía en el debe con ${p(-V.marzo)}. Al revivir la deuda, recibió ${p(V.recuperacion)} en el haber. Ahora queda en el haber con ${p(V.mayo)}. Ya no tiene faltante.`
        : `La provisión venía en el haber con ${p(V.marzo)}. Al revivir la deuda, recibió ${p(V.recuperacion)} más. Ahora queda en el haber con ${p(V.mayo)}.`],
    },
  };

  return { version, VALORES: V, PREGUNTAS_R5_2: PREGUNTAS, CORTES_R5_2: CORTES };
}

const VERSION_A = construirR5_2(VALORES, "A");
export const VERSION_B_R5_2 = construirR5_2(valoresDe(DATOS_R5_2.B), "B");
export const versionR5_2 = (version = "A") => (version === "B" ? VERSION_B_R5_2 : VERSION_A);
export const PREGUNTAS_R5_2 = VERSION_A.PREGUNTAS_R5_2;
export const CORTES_R5_2 = VERSION_A.CORTES_R5_2;
