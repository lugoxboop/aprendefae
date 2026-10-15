/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 DE APRENDER — «Cómo se calcula la provisión».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t6-aprender5.md. Precedencia
 * (Sakuta, todo con PASA de Shoko): sus decisiones (el pie del término 1 es
 * «Basado en el libro, pp. 200-201»); después, la versión que manda de
 * Futaba. La guía de diseño de Mai todavía no llega: aquí solo hay datos.
 *
 * Pieza por decisión de Mateo: la tabla de la p. 201 no se consiguió, y la
 * fuente externa autorizada es el Decreto 1625 de 2016, art. 1.2.1.18.21
 * (provisión general del 5 %, 10 % y 15 %). Las cifras del ejemplo son un
 * ESCENARIO SIMULADO: ninguna sale de la tabla del libro, y el rótulo fijo
 * de las capas 2 y 3 lo dice.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LOS CUATRO TIPOS DE PIE (nunca se mezclan) ═══════════ */

/* 1 · lo que dice el texto del libro: «Basado en el libro, p. N» (o pp.). */
export const PIE_LIBRO = (paginas) => `Basado en el libro, ${paginas}`;
/* 2 · las cifras y las decisiones del ejemplo. */
export const PIE_SIMULADO = "Escenario simulado";
/* 3 · los porcentajes de la norma, aplicados en el ejemplo. */
export const PIE_PORCENTAJE = "Fuente del porcentaje: Decreto 1625 de 2016";
/* 4 · la norma. Con «· Libro, p. 201» solo en la nota del término 4, donde hablan las dos fuentes. */
export const PIE_DECRETO = "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21";
export const PIE_DECRETO_Y_LIBRO = `${PIE_DECRETO} · Libro, p. 201`;

/* El rótulo fijo en pantalla durante las capas 2 y 3. */
export const ROTULO_SIMULADO_T6_A5 = "Escenario simulado · no es la tabla del libro";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

/*
 * Cada término trae su `pie`. CuatroCapas no pinta pies en la capa 1: cómo
 * se ven lo decide la guía de Mai. La nota del término 4 trae el suyo en
 * `pieDelLibro`.
 */
export const PIEZA_COMO_SE_CALCULA = {
  id: "b5-t6-a5-como-se-calcula-la-provision",
  numero: 5,
  titulo: "Cómo se calcula la provisión",
  objetivo: "Vas a ver cómo se calcula la provisión: se agrupan las deudas según su vencimiento y a cada grupo se le aplica un porcentaje.",
  nombres: [
    {
      termino: "Análisis de vencimiento",
      definicion: "Al cierre, la empresa agrupa lo que le deben sus clientes. Separa las deudas vigentes de las vencidas, y a estas según cuánto tiempo llevan vencidas.",
      /* Sakuta: «pp. 200-201» (Futaba decía «p. 200»). */
      pie: PIE_LIBRO("pp. 200-201"),
      delLibro: "«Lo primero que se deba hacer para realizar el ajuste por cuentas incobrables a diciembre 31 es calcular la probable pérdida de cartera con base en el porcentaje de pérdida establecido por la empresa.» (p. 201)",
    },
    {
      termino: "Un porcentaje por grupo",
      definicion: "A cada grupo se le aplica el porcentaje que la empresa espera perder. Los porcentajes los fija la propia empresa.",
      pie: PIE_LIBRO("p. 201"),
    },
    {
      termino: "La provisión",
      definicion: "Se suman los cálculos de todos los grupos. Ese total es la provisión. Se anota como ya viste: se debita Gasto provisiones – cuentas incobrables y se acredita Provisión para deudas incobrables.",
      pie: PIE_LIBRO("pp. 200-202"),
    },
    {
      termino: "Una referencia colombiana",
      definicion: "En Colombia, la norma del impuesto de renta trae una provisión general con tres porcentajes. Es el 5 % para deudas con más de tres meses de vencidas, sin pasar de seis. Es el 10 % para más de seis meses, sin pasar de un año. Y es el 15 % para más de un año.",
      pie: PIE_DECRETO,
      delLibro: "Esos porcentajes son el máximo que la empresa puede restar como gasto al calcular su impuesto de renta. No son una regla para todas las empresas: cada una fija los suyos.",
      rotuloDelLibro: "Nota",
      pieDelLibro: PIE_DECRETO_Y_LIBRO,
    },
  ],
};

/* ═══════════ EL ESCENARIO SIMULADO, EN NÚMEROS (para que las cuentas se comprueben) ═══════════ */

/* No se pinta: las pruebas lo cruzan con cada cifra de los textos. */
export const ESCENARIO_T6_A5 = {
  total: 1000000,
  grupos: [
    { id: "g1", monto: 400000, porcentaje: 0 },
    { id: "g2", monto: 200000, porcentaje: 5 },
    { id: "g3", monto: 300000, porcentaje: 10 },
    { id: "g4", monto: 100000, porcentaje: 15 },
  ],
  provision: 55000,
  neto: 945000,
  /* La capa 4: una deuda de $200.000 con ocho meses de vencida. */
  pregunta: { monto: 200000, meses: 8, porcentaje: 10, provision: 20000 },
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» ═══════════ */

/* Los 11 pasos y el cierre, cada uno con su pie (Futaba). Lo resaltado lo dirá la guía de Mai. */
export const PASOS_T6_A5 = [
  { texto: "El 31 de diciembre, una empresa revisa lo que le deben sus clientes: $1.000.000.", pie: PIE_SIMULADO },
  { texto: "Agrupa las deudas según cuánto tiempo llevan vencidas.", pie: PIE_LIBRO("p. 200") },
  { texto: "En este ejemplo, la empresa decide usar como suyos los porcentajes de la norma de renta.", pie: PIE_SIMULADO },
  { texto: "Las que están vigentes o llevan hasta tres meses de vencidas suman $400.000. En este ejemplo, por ellas no se provisiona nada.", pie: PIE_SIMULADO },
  { texto: "Las que llevan más de tres meses, sin pasar de seis, suman $200.000. Al 5 %, son $10.000.", pie: PIE_PORCENTAJE },
  { texto: "Las que llevan más de seis meses, sin pasar de un año, suman $300.000. Al 10 %, son $30.000.", pie: PIE_PORCENTAJE },
  { texto: "Las que llevan más de un año suman $100.000. Al 15 %, son $15.000.", pie: PIE_PORCENTAJE },
  { texto: "Cálculo: $10.000 + $30.000 + $15.000 = $55.000.", pie: PIE_SIMULADO },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $55.000.", pie: PIE_LIBRO("p. 202") },
  { texto: "Y se acredita Provisión para deudas incobrables, por el mismo valor.", pie: PIE_LIBRO("p. 202") },
  { texto: "Cálculo: $1.000.000 − $55.000 = $945.000, el valor neto.", pie: PIE_LIBRO("p. 202") },
];
export const CIERRE_T6_A5 = {
  texto: "Cada grupo con su porcentaje, y la suma de todos es la provisión.",
  pie: PIE_LIBRO("pp. 200-201"),
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · los cuatro grupos ═══════════ */

export const CONSIGNA_CAPA_3_T6_A5 = "Toca cada grupo y mira cuánto se provisiona por él.";

/* Cerrada, cada caja muestra su nombre y su monto (el rótulo de Futaba, «nombre · monto»). */
export const GRUPOS_T6_A5 = [
  {
    id: "g1",
    nombre: "Vigentes o hasta 3 meses",
    monto: "$400.000",
    revela: "En este ejemplo, por las deudas vigentes o con hasta tres meses de vencidas no se provisiona nada: $0.",
    pie: PIE_SIMULADO,
  },
  {
    id: "g2",
    nombre: "Más de 3 hasta 6 meses",
    monto: "$200.000",
    revela: "Al 5 %, los $200.000 dan $10.000.",
    pie: PIE_PORCENTAJE,
  },
  {
    id: "g3",
    nombre: "Más de 6 meses hasta 1 año",
    monto: "$300.000",
    revela: "Al 10 %, los $300.000 dan $30.000.",
    pie: PIE_PORCENTAJE,
  },
  {
    id: "g4",
    nombre: "Más de 1 año",
    monto: "$100.000",
    revela: "Al 15 %, los $100.000 dan $15.000.",
    pie: PIE_PORCENTAJE,
  },
];
export const FINAL_CAPA_3_T6_A5 = {
  texto: "La provisión es la suma de los cuatro grupos: $55.000. Mientras más tiempo lleva vencido un grupo, mayor es su porcentaje en este ejemplo.",
  pie: PIE_SIMULADO,
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A5 = "Una deuda de $200.000 lleva ocho meses vencida. Con los porcentajes del ejemplo, ¿cuánto se provisiona por ella?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A5 = [
  {
    id: "b5-t6-a5-veinte",
    texto: "$20.000",
    correcta: true,
    feedback: "Correcto. Ocho meses es más de seis y no pasa de un año: le toca el 10 %. El 10 % de $200.000 es $20.000.",
  },
  {
    id: "b5-t6-a5-diez",
    texto: "$10.000",
    correcta: false,
    feedback: "No es esa. Ese sería el 5 %, que es para deudas de más de tres hasta seis meses. Ocho meses ya pasó de seis.",
  },
  {
    id: "b5-t6-a5-treinta",
    texto: "$30.000",
    correcta: false,
    feedback: "No es esa. Ese sería el 15 %, que es para deudas de más de un año. Ocho meses no llega a un año.",
  },
  {
    id: "b5-t6-a5-nada",
    texto: "Nada",
    correcta: false,
    feedback: "No es esa. Una deuda con más de tres meses de vencida sí entra en la provisión del ejemplo.",
  },
];
