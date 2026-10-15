/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP4 DE APRENDER — «El cierre en periódico» (C-1, pp. 207-227).
 *
 * Fuente: el RECORTE del lote 1 de Near
 * (orquestador/conocimiento/paquetes/lote1-recortes-t71-v1.md, sección
 * «t7-1-a4-el-cierre-en-periodico»), con las dos correcciones obligatorias de
 * Mello (mello-recortes-v1.md): en P6, antes de responder solo se ve la fila
 * «Inventario final»; y la definición de «antes de impuestos» es la suya.
 * Las 10 operaciones del mes (P2, plegadas) y los otros asientos del cierre
 * (P3, plegados) son los de la v2.1 publicada (t7-1-ap4-v2-1.md). Una prueba
 * compara cada texto de aquí contra esos paquetes, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Ocho pantallas (P0-P7).
 * Nada del 33 %: la pieza termina en la utilidad antes de impuestos.
 *
 *   · P1 «la-apuesta» (prediccion): sin calificar y sin puntos; lo elegido se
 *     guarda en el estado de la pieza y marca su columna en P6
 *   · P5 «las-utilidades» (tocar-filas): cada utilidad se abre al tocarla
 *
 * Los pies no vienen en el recorte: se conservan los de la v2.1 de la
 * pantalla de la que sale cada una (P1, de «las-1100-unidades»).
 * Interfaz del patrón: «Debe», «Haber», «Correcto.», «Incorrecto.».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP4_ID = "t7-1-a4-el-cierre-en-periodico";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = {
  debe: "Debe",
  haber: "Haber",
  correcto: "Correcto.",
  incorrecto: "Incorrecto.",
};

/*
 * Textos de interfaz que la v2.1 no trae y esperan revisión.
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]: los nombres accesibles de la
 * tabla de asientos y de la de los tres métodos, y la columna oculta «Rubro».
 */
export const PENDIENTE_DE_REVISION = {
  nombreAsientos: (fecha) => `Asientos del ${fecha}`,
  nombreMetodos: "Los tres métodos, lado a lado",
  rubro: "Rubro",
};

export const FECHA = "28 de febrero";
export const DEBE = "debe";
export const HABER = "haber";
export const UEPS = "UEPS (no válido bajo NIIF)";

/* Las cifras van sin «$» dentro de las tablas, como en el patrón. */
export const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

/* ═══════════ LAS CIFRAS DE C-1 (se calculan, no se copian) ═══════════ */

const UNIDADES_INICIO = 5200;
const COSTO_INICIO = 1300;
const COMPRAS = [
  { dia: 2, unidades: 4000, costo: 1320 },
  { dia: 4, unidades: 3000, costo: 1325 },
  { dia: 12, unidades: 2500, costo: 1350 },
  { dia: 25, unidades: 3500, costo: 1380 },
];
const VENTAS = [
  { dia: 6, unidades: 4500, valor: 11880000 },
  { dia: 8, unidades: 5500, valor: 14575000 },
  { dia: 16, unidades: 1800, valor: 4860000 },
  { dia: 20, unidades: 2500, valor: 6750000 },
  { dia: 28, unidades: 2800, valor: 7728000 },
];
const GASTOS = 12000000;
const QUEDAN = 1100;

const inicial = UNIDADES_INICIO * COSTO_INICIO;
const compras = COMPRAS.reduce((t, c) => t + c.unidades * c.costo, 0);
const ingresos = VENTAS.reduce((t, v) => t + v.valor, 0);
const disponible = inicial + compras;
const unidadesDisponibles = UNIDADES_INICIO + COMPRAS.reduce((t, c) => t + c.unidades, 0);
/* El libro usa el costo sin redondear: 24.220.000 × 1.100 ÷ 18.200 = 1.463.846,15. */
const finalPromedio = Math.round((disponible * QUEDAN) / unidadesDisponibles);
const metodo = (final) => {
  const costo = disponible - final;
  const bruta = ingresos - costo;
  const operacional = bruta - GASTOS;
  return { final, costo, bruta, operacional, antesDeImpuestos: operacional };
};

export const CIFRAS = {
  inicial, // 6.760.000
  compras, // 17.460.000
  ingresos, // 45.793.000
  gastos: GASTOS,
  disponible, // 24.220.000
  unidadesDisponibles, // 18.200
  peps: metodo(QUEDAN * COMPRAS[3].costo), // 1.518.000
  ueps: metodo(QUEDAN * COSTO_INICIO), // 1.430.000
  promedio: metodo(finalPromedio), // 1.463.846
};

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "lectura",
  objetivo: "Vas a cerrar el mes de San Calixto y a ver por qué el método cambia la utilidad.",
  parrafos: [],
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 207-208, 214 y 221-227",
};

/* P1 · La apuesta: una predicción sin calificar. Las opciones no tienen `correcta`. */
const LA_APUESTA = {
  id: "la-apuesta",
  tipo: "prediccion",
  parrafos: ["A San Calixto le quedaron 1.100 unidades en febrero. Su valor cambia con el método:"],
  valores: [
    { metodo: "PEPS", valor: `$${cifra(CIFRAS.peps.final)}` },
    { metodo: UEPS, valor: `$${cifra(CIFRAS.ueps.final)}` },
    { metodo: "Promedio ponderado", valor: `$${cifra(CIFRAS.promedio.final)}` },
  ],
  pregunta: "¿Con qué método crees que sale más utilidad?",
  /* `columna`: la columna de P6 que se marca (null: «Igual con los tres» no marca ninguna). */
  opciones: [
    { id: "peps", texto: "PEPS", columna: 0 },
    { id: "ueps", texto: "UEPS", columna: 1 },
    { id: "promedio", texto: "Promedio ponderado", columna: 2 },
    { id: "iguales", texto: "Igual con los tres", columna: null },
  ],
  guardada: "Guardamos tu apuesta. La compruebas al final del cierre.",
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 222-223",
};

/*
 * P2 · Los datos de San Calixto: la ficha de totales. Las 10 operaciones del
 * mes, plegadas: las 4 compras, las 5 ventas y los gastos, como en la v2.1.
 */
const LOS_DATOS = {
  id: "los-datos-de-san-calixto",
  tipo: "lectura",
  parrafos: ["Estos son los totales de febrero."],
  totales: [
    `Inventario inicial: 5.200 unidades, $${cifra(inicial)}`,
    `Compras: 13.000 unidades, $${cifra(compras)}`,
    `Ventas: 17.100 unidades, $${cifra(ingresos)}`,
    `Gastos de administración y ventas: $${cifra(GASTOS)}`,
    "Quedan, según el conteo: 1.100 unidades",
  ],
  verOperaciones: "Ver las operaciones del mes",
  operaciones: [
    { dato: "Qué compró", partes: COMPRAS.map((c) => `${c.dia} feb: ${cifra(c.unidades)} a $${cifra(c.costo)} = $${cifra(c.unidades * c.costo)}`) },
    { dato: "Qué vendió", partes: VENTAS.map((v) => `${v.dia} feb: ${cifra(v.unidades)} u por $${cifra(v.valor)}`) },
    { dato: "Gastos de administración y ventas del mes", partes: [`$${cifra(GASTOS)}`] },
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 221-223",
};

/*
 * P3 · El cierre. «Inventario de mercancías» va una sola vez, arriba de sus
 * dos líneas. Los otros asientos del cierre (los seis de la v2.1), plegados.
 * Las líneas conservan sus ids («inicial», «final»); su texto empieza por
 * «Quitar…» y «Colocar…», como las nombra el recorte.
 */
const EL_CIERRE = {
  id: "el-cierre",
  tipo: "lados",
  parrafos: ["Inventario de mercancías se quedó todo el mes con el valor del inicio. Al cierre se pone al día."],
  consigna: "Toca Debe o Haber en cada línea.",
  cuenta: "Inventario de mercancías",
  lineas: [
    {
      id: "inicial",
      texto: "Quitar el inventario inicial",
      pista: "Ese valor sale de la cuenta. ¿De qué lado baja un activo?",
      monto: inicial,
      lado: HABER,
      devolucion: "Quitar ese valor hace que el activo baje: va al haber.",
      porque: "La otra parte va al debe de Ganancias y pérdidas.",
    },
    {
      id: "final",
      texto: "Colocar el inventario final",
      pista: "Ese valor es lo que hay hoy, así que entra a la cuenta. ¿De qué lado sube un activo?",
      monto: finalPromedio,
      lado: DEBE,
      devolucion: "Colocar ese valor hace que el activo suba: va al debe.",
      porque: "La otra parte va al haber de Ganancias y pérdidas.",
    },
  ],
  verOtros: "Ver los otros asientos del cierre",
  otros: [
    { cuenta: "Ingresos por ventas", lado: DEBE, monto: ingresos },
    { cuenta: "Ganancias y pérdidas", lado: HABER, monto: ingresos },
    { cuenta: "Ganancias y pérdidas", lado: DEBE, monto: compras },
    { cuenta: "Compras", lado: HABER, monto: compras },
    { cuenta: "Ganancias y pérdidas", lado: DEBE, monto: GASTOS },
    { cuenta: "Gastos de administración y ventas", lado: HABER, monto: GASTOS },
  ],
  pie: "Basado en el libro, pp. 207-208, 210, 212 y 225",
  error: { pie: "Basado en el libro, pp. 207-208 y 225" },
  acierto: {
    texto: "Así es: ahora la cuenta tiene el valor del conteo.",
    porque: "Esa es la cifra del estado de situación financiera. El libro hace este cierre con el promedio ponderado.",
    pie: "Basado en el libro, pp. 209 y 225-226",
  },
};

/* P4 · El costo de lo vendido. Ya no se da la fórmula antes de preguntar. */
const EL_COSTO = {
  id: "el-costo-de-lo-vendido",
  pista: "Lo vendido no es todo lo que la empresa tuvo para vender. Falta quitar algo.",
  tipo: "eleccion",
  calculos: [`Inventario inicial + compras = $${cifra(disponible)}`],
  parrafos: [`Quedaron $${cifra(finalPromedio)}, con el promedio ponderado.`],
  pregunta: "¿Cuál fue el costo de la mercancía vendida?",
  opciones: [
    { id: "vendida", texto: `$${cifra(CIFRAS.promedio.costo)}`, correcta: true },
    { id: "disponible", texto: `$${cifra(disponible)}`, correcta: false, devolucion: "Eso es todo lo que hubo para vender. Falta quitar lo que quedó." },
    { id: "compras", texto: `$${cifra(compras)}`, correcta: false, devolucion: "Eso es solo lo comprado en el mes. Falta lo que había al inicio, y quitar lo que quedó." },
  ],
  pie: "Basado en el libro, pp. 214, 223 y 226",
  error: { pie: "Basado en el libro, pp. 214 y 226" },
  acierto: {
    texto: `Así es: $${cifra(disponible)} − $${cifra(finalPromedio)} = $${cifra(CIFRAS.promedio.costo)}. En el periódico, este costo se halla al cierre, no venta por venta.`,
    calculos: [],
    pie: "Basado en el libro, pp. 209 y 226",
  },
};

/*
 * P5 · Las utilidades: el estado de resultados en filas. Las que llevan
 * `definicion` son botones: al tocar una se abre su definición, una a la vez.
 * La de «antes de impuestos» es la de Mello (corrección obligatoria 2).
 */
const LAS_UTILIDADES = {
  id: "las-utilidades",
  tipo: "tocar-filas",
  consigna: "Toca cada utilidad para ver qué es.",
  filas: [
    { id: "ingresos", rubro: "Ingresos por ventas", valor: `$${cifra(ingresos)}` },
    { id: "costo", rubro: "− Costo de mercancía vendida", valor: `$${cifra(CIFRAS.promedio.costo)}` },
    { id: "bruta", rubro: "= Utilidad bruta en ventas", valor: `$${cifra(CIFRAS.promedio.bruta)}`, definicion: "Lo que queda de las ventas cuando se les resta el costo de la mercancía vendida." },
    { id: "gastos", rubro: "− Gastos de administración y ventas", valor: `$${cifra(GASTOS)}` },
    { id: "operacional", rubro: "= Utilidad operacional", valor: `$${cifra(CIFRAS.promedio.operacional)}`, definicion: "Lo que queda de la utilidad bruta cuando se le restan los gastos de administración y ventas." },
    { id: "antes-de-impuestos", rubro: "= Utilidad antes de impuestos", valor: `$${cifra(CIFRAS.promedio.antesDeImpuestos)}`, definicion: "Suma y resta lo que no es de la operación, y todavía no resta el impuesto de renta. Aquí eso es cero." },
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 214 y 226",
};

/*
 * P6 · Lado a lado. Corrección obligatoria 1 de Mello: antes de responder
 * solo se ve la fila «Inventario final»; las de costo y utilidad llegan con
 * el acierto (`despues`). La columna de la apuesta va marcada con borde.
 */
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "Si queda más en la bodega, ¿lo vendido lleva más o menos costo?",
  tipo: "eleccion",
  tabla: {
    nombre: PENDIENTE_DE_REVISION.nombreMetodos,
    metodos: ["PEPS", UEPS, "Promedio"],
    filas: [
      { rubro: "Inventario final", clave: "final" },
      { rubro: "Costo de mercancía vendida", clave: "costo", despues: true },
      { rubro: "Utilidad antes de impuestos", clave: "antesDeImpuestos", despues: true },
    ].map((f) => ({ ...f, valores: [CIFRAS.peps, CIFRAS.ueps, CIFRAS.promedio].map((m) => cifra(m[f.clave])) })),
  },
  parrafos: [],
  pregunta: "¿Y el costo y la utilidad de PEPS?",
  opciones: [
    { id: "bajo-y-alta", texto: "Costo menor, utilidad mayor", correcta: true },
    { id: "costo-mayor", texto: "Costo mayor, utilidad mayor", correcta: false, devolucion: "Si se resta más inventario final, el costo baja." },
    { id: "iguales", texto: "Iguales en los tres", correcta: false, devolucion: "Ventas, compras y gastos sí son iguales. El inventario final no." },
  ],
  pie: "Basado en el libro, pp. 214 y 226",
  error: { pie: "Basado en el libro, pp. 226-227" },
  acierto: {
    texto: "Así es: más inventario final, menos costo y más utilidad.",
    porque: "Ventas, compras y gastos son iguales con los tres métodos. Lo único que cambia es el inventario final. ¿Coincide con tu apuesta?",
    calculos: [],
    pie: "Basado en el libro, p. 227",
  },
};

/* P7 · Resumen, sin botón. La figura: la cuenta en una línea. */
const RESUMEN = {
  id: "resumen",
  tipo: "lectura",
  cuentaEnUnaLinea: "Inicio + compras − final = costo de lo vendido",
  parrafos: [
    "Al cierre, el inventario inicial sale por el haber y el final entra por el debe.",
    "Más inventario final da menos costo y más utilidad.",
  ],
  siguiente: "Siguiente: «Importados y fletes».",
  boton: null,
  pie: "Basado en el libro, pp. 207-208, 214 y 227",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_EL_CIERRE = {
  id: AP4_ID,
  numero: 4,
  titulo: "El cierre en periódico",
  pantallas: [PORTADA, LA_APUESTA, LOS_DATOS, EL_CIERRE, EL_COSTO, LAS_UTILIDADES, LADO_A_LADO, RESUMEN],
};
