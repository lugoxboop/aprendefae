/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP4 DE APRENDER — «El cierre en periódico» (C-1, pp. 207-227).
 *
 * Fuente: la v2.1, armada por L con la v1 de Near, sus cambios de la v2 y las
 * correcciones de Mello, con PASA. Copia en
 * orquestador/conocimiento/paquetes/t7-1-ap4-v2-1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Nueve pantallas (P0-P8).
 * Nada del 33 %: la pieza termina en la utilidad antes de impuestos y no
 * muestra los dos asientos del libro que dependen de la renta.
 *
 * Diseño: no hay «Figura de AP4» de Watari. Se arma con el patrón tabular
 * v3.2, como A6 antes de su figura:
 *   · P4: los asientos del cierre en lectura (sin casillas) y las dos líneas
 *     de inventario que se colocan en Debe o Haber; con el acierto, las dos
 *     líneas pasan a la tabla con su contrapartida (de 6 a 10 filas)
 *   · P7: el estado de resultados de tres columnas, que a 313 y 258 px de
 *     contenido va apilado (una fila por método, el nombre a la izquierda)
 *
 * Lo que la v2.1 no trae y se toma de la convención de AP1, AP2 y A6: los
 * botones «Empezar», «Seguir», «Confirmar» y «Probar otra». Interfaz del
 * patrón: «Debe», «Haber», «Correcto.», «Incorrecto.».
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
  objetivo: "Ver cómo se cierra un periodo en el sistema periódico. El inventario inicial se quita de los libros y el final se coloca. Y ver cómo el método cambia la utilidad antes de impuestos.",
  parrafos: [],
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 207-208, 214 y 221-227",
};

/* P1 · Lo que falta al cierre. */
const LO_QUE_FALTA = {
  id: "lo-que-falta-al-cierre",
  tipo: "lectura",
  parrafos: [
    "Durante el periodo, Inventario de mercancías se quedó con el valor del inicio. Al cierre hay que hacer dos cosas: quitar ese valor y colocar el del inventario final.",
    "El libro lo dice así: en el periódico, al cierre, la cuenta va al haber por el inventario inicial. Y va al debe por el inventario final.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 207-208 y 214",
};

/*
 * P2 · Los datos de San Calixto. En la ficha, «Qué compró» y «Qué vendió»
 * traen varias partes separadas por « · »: cada una va en su renglón, y el
 * total en negrita, como lo marca la v2.1.
 */
const LOS_DATOS = {
  id: "los-datos-de-san-calixto",
  tipo: "lectura",
  parrafos: ["La compañía San Calixto Ltda. usa el sistema de inventario periódico. En febrero compró y vendió mercancía. Estos son sus datos."],
  ficha: [
    { dato: "Quién", partes: ["San Calixto Ltda."] },
    { dato: "Qué tenía el 1 de febrero", partes: [`5.200 unidades a $1.300: $${cifra(inicial)}`] },
    {
      dato: "Qué compró",
      partes: [
        ...COMPRAS.map((c) => `${c.dia} feb: ${cifra(c.unidades)} a $${cifra(c.costo)} = $${cifra(c.unidades * c.costo)}`),
      ],
      total: `Total: 13.000 unidades, $${cifra(compras)}`,
    },
    {
      dato: "Qué vendió",
      partes: VENTAS.map((v) => `${v.dia} feb: ${cifra(v.unidades)} u por $${cifra(v.valor)}`),
      total: `Total: 17.100 unidades, $${cifra(ingresos)}`,
    },
    { dato: "Gastos de administración y ventas del mes", partes: [`$${cifra(GASTOS)}`] },
  ],
  calculos: [`Unidades disponibles = 5.200 + 13.000 = ${cifra(unidadesDisponibles)}`],
  cierre: "Se vendieron 17.100 unidades. Las que quedaron las da el conteo físico: 1.100.",
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 221-223",
};

/* P3 · Las 1.100 unidades con cada método. */
const CON_CADA_METODO = {
  id: "las-1100-unidades",
  tipo: "lectura",
  parrafos: ["Con lo que viste en «Tres formas de ponerle precio a lo que quedó», esas 1.100 unidades valen distinto según el método."],
  metodos: [
    {
      encabezado: "Método PEPS",
      texto: "Con PEPS quedan 1.100 de las compradas el 25 de febrero, a $1.380 cada una.",
      calculos: [`1.100 × $1.380 = $${cifra(CIFRAS.peps.final)}`],
    },
    {
      encabezado: `Método ${UEPS}`,
      texto: "Con UEPS quedan 1.100 de las que había al inicio, a $1.300 cada una.",
      calculos: [`1.100 × $1.300 = $${cifra(CIFRAS.ueps.final)}`],
    },
    {
      encabezado: "Método del costo promedio ponderado",
      texto: "Con el promedio ponderado, cada unidad queda con el mismo costo.",
      /* C7-21: «$1.330,77», con coma decimal. La pieza muestra el resultado del libro, no 1.100 × 1.330,77. */
      calculos: [`$${cifra(disponible)} ÷ ${cifra(unidadesDisponibles)} = $1.330,77 por unidad`, `Inventario final = $${cifra(CIFRAS.promedio.final)}`],
    },
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 222-223",
};

/* P4 · El cierre. Los seis asientos dados, en lectura; dos líneas que se colocan. */
const EL_CIERRE = {
  id: "el-cierre",
  tipo: "lados",
  parrafos: ["El libro hace el cierre con el promedio ponderado. Primero pasa las cuentas del estado de resultados a una cuenta que las resume: Ganancias y pérdidas."],
  dados: [
    { cuenta: "Ingresos por ventas", lado: DEBE, monto: ingresos },
    { cuenta: "Ganancias y pérdidas", lado: HABER, monto: ingresos },
    { cuenta: "Ganancias y pérdidas", lado: DEBE, monto: compras },
    { cuenta: "Compras", lado: HABER, monto: compras },
    { cuenta: "Ganancias y pérdidas", lado: DEBE, monto: GASTOS },
    { cuenta: "Gastos de administración y ventas", lado: HABER, monto: GASTOS },
  ],
  consigna: "Ahora, el inventario. Toca Debe o Haber en cada línea.",
  lineas: [
    {
      id: "inicial",
      pista: "Ese valor ya no es lo que hay, así que sale de la cuenta. ¿De qué lado baja un activo?",
      cuenta: "Inventario de mercancías",
      accion: "quitar el inventario inicial",
      monto: inicial,
      lado: HABER,
      devolucion: "Quitar el inventario inicial hace que el activo disminuya, y un activo que disminuye va al haber. La otra parte va al debe de Ganancias y pérdidas.",
    },
    {
      id: "final",
      pista: "Ese valor es lo que hay hoy, así que entra a la cuenta. ¿De qué lado sube un activo?",
      cuenta: "Inventario de mercancías",
      accion: "colocar el inventario final",
      monto: finalPromedio,
      lado: DEBE,
      devolucion: "Colocar el inventario final hace que el activo aumente, y un activo que aumenta va al debe. La otra parte va al haber de Ganancias y pérdidas.",
    },
  ],
  pie: "Basado en el libro, pp. 207-208, 210, 212 y 225",
  error: { pie: "Basado en el libro, pp. 207-208 y 225" },
  acierto: {
    texto: "Así es. Al cierre, Inventario de mercancías deja el valor del inicio y queda con el del conteo. Esa es la cifra del estado de situación financiera.",
    /* Los cuatro renglones que se suman a la tabla: de 6 a 10 filas. */
    suman: [
      { cuenta: "Ganancias y pérdidas", lado: DEBE, monto: inicial },
      { cuenta: "Inventario de mercancías", lado: HABER, monto: inicial },
      { cuenta: "Inventario de mercancías", lado: DEBE, monto: finalPromedio },
      { cuenta: "Ganancias y pérdidas", lado: HABER, monto: finalPromedio },
    ],
    saldo: `Ganancias y pérdidas: debe $${cifra(compras + GASTOS + inicial)} · haber $${cifra(ingresos + finalPromedio)} · saldo $${cifra(ingresos + finalPromedio - compras - GASTOS - inicial)}`,
    pie: "Basado en el libro, pp. 209 y 225-226",
  },
};

/* P5 · El costo de lo vendido. */
const EL_COSTO = {
  id: "el-costo-de-lo-vendido",
  pista: "Lo vendido no es todo lo que la empresa tuvo para vender. Falta quitar algo.",
  tipo: "eleccion",
  parrafos: ["Para el costo de la mercancía vendida, se suman el inventario inicial y las compras, y se resta el final."],
  calculos: [`Inventario inicial $${cifra(inicial)} + Compras $${cifra(compras)} = Costo de mercancía disponible $${cifra(disponible)}`],
  pregunta: "Con el promedio ponderado, ¿cuál es el costo de la mercancía vendida?",
  opciones: [
    { id: "vendida", texto: `$${cifra(CIFRAS.promedio.costo)}`, correcta: true },
    {
      id: "disponible",
      texto: `$${cifra(disponible)}`,
      correcta: false,
      devolucion: "Ese es el costo de la mercancía disponible. Falta restarle lo que quedó al final: el inventario final de $1.463.846.",
    },
    {
      id: "compras",
      texto: `$${cifra(compras)}`,
      correcta: false,
      devolucion: "Eso es solo lo que se compró en el mes. El costo de lo vendido también incluye lo que había al inicio, y descuenta lo que quedó al final.",
    },
  ],
  pie: "Basado en el libro, pp. 214, 223 y 226",
  error: { pie: "Basado en el libro, pp. 214 y 226" },
  acierto: {
    texto: "Así es. En el sistema periódico, este costo no se anota venta por venta: se halla al cierre, con el conteo.",
    calculos: [`$${cifra(disponible)} − $${cifra(finalPromedio)} = $${cifra(CIFRAS.promedio.costo)}`],
    pie: "Basado en el libro, pp. 209 y 226",
  },
};

/* P6 · Las utilidades (nueva en la v2). */
const LAS_UTILIDADES = {
  id: "las-utilidades",
  tipo: "lectura",
  parrafos: [
    "El estado de resultados resta paso a paso. Cada paso deja una utilidad con su propio nombre.",
    "La utilidad bruta en ventas es lo que queda de las ventas cuando se les resta el costo de la mercancía vendida.",
    "A la utilidad bruta se le restan los gastos de administración y ventas. Lo que queda es la utilidad operacional.",
    "Después, el libro suma los ingresos que no son de la operación y resta los gastos que no son de la operación. Lo que queda es la utilidad antes de impuestos, porque todavía no se le ha restado el impuesto de renta.",
    "Aquí no hay otros ingresos ni otros gastos. Por eso la utilidad antes de impuestos es igual a la operacional.",
  ],
  calculos: [
    `$${cifra(ingresos)} − $${cifra(CIFRAS.promedio.costo)} = $${cifra(CIFRAS.promedio.bruta)} · utilidad bruta en ventas`,
    `$${cifra(CIFRAS.promedio.bruta)} − $${cifra(GASTOS)} = $${cifra(CIFRAS.promedio.operacional)} · utilidad operacional`,
    `$${cifra(CIFRAS.promedio.operacional)} + $0 − $0 = $${cifra(CIFRAS.promedio.antesDeImpuestos)} · utilidad antes de impuestos`,
  ],
  cierre: "Mira el saldo de Ganancias y pérdidas del cierre: $11.036.846. Es la utilidad antes de impuestos con el promedio ponderado.",
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 214 y 226",
};

/* P7 · Lado a lado. Lo igual, en el bloque fijo; lo que cambia, en la tabla. */
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "Si queda más en la bodega, ¿sale más o menos costo hacia lo vendido? Sigue ese efecto hasta la utilidad.",
  tipo: "eleccion",
  bloqueFijo: {
    rotulo: "Iguales con los tres métodos",
    filas: [
      { rubro: "Ingresos por ventas", valor: `$${cifra(ingresos)}` },
      { rubro: "Costo de mercancía disponible", valor: `$${cifra(disponible)}` },
      { rubro: "Gastos de administración y ventas", valor: `$${cifra(GASTOS)}` },
    ],
  },
  parrafos: ["Esto es igual con los tres métodos. Lo que cambia está en la tabla de abajo."],
  tabla: {
    nombre: PENDIENTE_DE_REVISION.nombreMetodos,
    metodos: ["PEPS", UEPS, "Promedio ponderado"],
    filas: [
      { rubro: "Inventario final", clave: "final" },
      { rubro: "Costo de mercancía vendida", clave: "costo" },
      { rubro: "Utilidad bruta en ventas", clave: "bruta" },
      { rubro: "Utilidad operacional", clave: "operacional" },
      { rubro: "Utilidad antes de impuestos", clave: "antesDeImpuestos" },
    ].map((f) => ({ ...f, valores: [CIFRAS.peps, CIFRAS.ueps, CIFRAS.promedio].map((m) => cifra(m[f.clave])) })),
  },
  pregunta: "Con PEPS, el inventario final es el más alto. ¿Qué pasa con su costo de la mercancía vendida y con su utilidad?",
  opciones: [
    { id: "bajo-y-alta", texto: "El costo es el más bajo y la utilidad, la más alta.", correcta: true },
    {
      id: "el-mas-alto",
      texto: "El costo es el más alto y la utilidad, también.",
      correcta: false,
      devolucion: "El inventario final se resta para hallar el costo. Si se resta más, el costo queda menor. Mira la fila: con PEPS es el menor de los tres.",
    },
    {
      id: "iguales",
      texto: "Los dos son iguales con los tres métodos.",
      correcta: false,
      devolucion: "Lo que es igual son las ventas, las compras y los gastos. Lo que cambia es el inventario final, y con él cambian el costo y la utilidad.",
    },
  ],
  pie: "Basado en el libro, pp. 214 y 226",
  error: { pie: "Basado en el libro, pp. 226-227" },
  acierto: {
    texto: "Exacto. Más inventario final quiere decir menos costo de la mercancía vendida. Y menos costo quiere decir más utilidad. Así lo concluye el libro.",
    calculos: [],
    pie: "Basado en el libro, p. 227",
  },
};

/* P8 · Resumen, sin botón, como en AP1 y A6. */
const RESUMEN = {
  id: "resumen",
  tipo: "lectura",
  parrafos: [
    "Al cierre, Inventario de mercancías va al haber por el inventario inicial. Y va al debe por el inventario final.",
    "Para el costo de la mercancía vendida, se suman el inventario inicial y las compras, y se resta el final.",
    "Un inventario final más alto da un costo más bajo y una utilidad más alta.",
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
  pantallas: [PORTADA, LO_QUE_FALTA, LOS_DATOS, CON_CADA_METODO, EL_CIERRE, EL_COSTO, LAS_UTILIDADES, LADO_A_LADO, RESUMEN],
};
