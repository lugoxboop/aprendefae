/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 6 · «¿QUÉ LE TOCA A ESTE PERIODO?» — el contenido.
 *
 * El texto aprobado de Gen, palabra por palabra: consigna, pasos, el banco de
 * cinco ítems, los cuatro errores y el tutorial de la panadería. Las
 * correcciones de Levi mandan sobre la P2 de Xeno: cada ítem lleva su tipo
 * (pago o cobro anticipado), que decide cómo se dibuja lo que queda.
 *
 * Todos son de meses completos. El corte se cuenta en meses desde el inicio:
 * el corte k cae al final del mes k. La columna «Reparto» de Gen es un dato
 * interno de validación (las pruebas la comprueban) y no se muestra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT6_T3 = {
  id: "t3-que-le-toca",
  nombre: "¿Qué le toca a este periodo?",
  /* Análisis · 50 FP (Gen). En el catálogo, Análisis es la dificultad «dificil». */
  dificultad: "dificil",
  fpBase: 50,
  consigna: "Lee el hecho. Marca el corte y escribe las dos cifras.",
};

export const PASOS_ACT6 = ["Lee cuánto se pagó o se recibió y por cuántos meses.", "Mueve el corte con Antes o Después hasta el mes del cierre.", "Escribe cuánto le toca al periodo y cuánto queda."];

/* Los dos tipos de ítem (Levi): deciden si «Queda» va sólido o discontinuo. */
export const PAGO = "pago";
export const COBRO = "cobro";

/* Los meses, para la bandera y las etiquetas de la barra (Xeno). */
export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
/* Índices de mes (0 = enero). */
const MARZO = 2;
const JUNIO = 5;
const AGOSTO = 7;
const OCTUBRE = 9;

/*
 * El banco. `inicio` es el mes del primer día del hecho; `corte`, cuántos
 * meses pasaron al cierre; `total`, lo que se pagó o se recibió.
 */
export const ITEMS_ACT6 = [
  {
    id: "t3a6-seguro",
    empresa: "Mónica Galindo",
    hecho: "Seguro de cinco años por $480.000, comprado el 1 de marzo. Cierra el 31 de diciembre.",
    tipo: PAGO,
    meses: 60,
    inicio: MARZO,
    total: 480000,
    corte: 10,
    alPeriodo: 80000,
    queda: 400000,
    pie: "Basado en el libro, p. 173",
    acierto: "Pasaron 10 de 60 meses. Al periodo le toca $80.000 y quedan $400.000 de seguro por usar.",
  },
  {
    id: "t3a6-equipos",
    empresa: "Mónica Galindo",
    hecho: "Alquiler de equipos por $1.080.000, pagado el 1 de agosto por seis meses. Cierra el 31 de diciembre.",
    tipo: PAGO,
    meses: 6,
    inicio: AGOSTO,
    total: 1080000,
    corte: 5,
    alPeriodo: 900000,
    queda: 180000,
    pie: "Basado en el libro, p. 173",
    acierto: "Pasaron 5 de 6 meses. Al periodo le toca $900.000 y queda un mes sin usar.",
  },
  {
    id: "t3a6-arriendo",
    empresa: "Mónica Galindo",
    hecho: "Arriendo recibido por un año a $160.000 al mes, desde el 1 de junio. Cierra el 31 de diciembre.",
    tipo: COBRO,
    meses: 12,
    inicio: JUNIO,
    /* El hecho no da el total: es cálculo del estudiante, y la barra nunca lo rotula (Xeno). */
    total: 12 * 160000,
    corte: 7,
    alPeriodo: 1120000,
    queda: 800000,
    pie: "Basado en el libro, p. 173",
    acierto: "Pasaron 7 de 12 meses. Al periodo le toca $1.120.000 y quedan $800.000 por cumplir.",
  },
  {
    id: "t3a6-san-calixto",
    empresa: "San Calixto",
    hecho: "Arriendo de $15.000 pagado el 1 de junio por tres meses. Cierra el 30 de junio.",
    tipo: PAGO,
    meses: 3,
    inicio: JUNIO,
    total: 15000,
    corte: 1,
    alPeriodo: 5000,
    queda: 10000,
    pie: "Basado en el libro, pp. 143-144",
    acierto: "Pasó 1 de 3 meses. Al periodo le toca $5.000 y quedan $10.000 de local por usar.",
  },
  {
    id: "t3a6-costa",
    empresa: "Arriendos de la Costa",
    hecho: "Arriendo de $15.000 recibido el 1 de junio por tres meses. Cierra el 30 de junio.",
    tipo: COBRO,
    meses: 3,
    inicio: JUNIO,
    total: 15000,
    corte: 1,
    alPeriodo: 5000,
    queda: 10000,
    pie: "Libro, p. 146",
    acierto: "Pasó 1 de 3 meses. Al periodo le toca $5.000 y quedan $10.000 por cumplir.",
  },
];

/* ═══════════ RETROALIMENTACIÓN POR TIPO DE ERROR (Gen) ═══════════ */
export const CASO_A = "A";
export const CASO_B = "B";
export const CASO_C = "C";
export const CASO_D = "D";
export const ERROR_POR_CASO = {
  [CASO_A]: "El corte no está en el mes del cierre. Mira la fecha en que la empresa cierra sus libros.",
  [CASO_B]: "Las dos cifras suman bien, pero no son las del hecho. Divide el total entre los meses.",
  [CASO_C]: "Esa es la cifra que queda, no la del periodo. Van en el otro orden.",
  [CASO_D]: "Las dos cifras no suman el total. Lo que le toca al periodo más lo que queda da el total.",
};

/* ═══════════ TEXTOS DE LA PANTALLA (Xeno, P2 final) ═══════════ */
export const AL_PERIODO = "Al periodo";
export const QUEDA = "Queda";
export const ANTES = "Antes";
export const DESPUES = "Después";
export const COMPROBAR = "Comprobar";
export const SIGUIENTE_ITEM = "Siguiente ítem";
export const VER_RESUMEN = "Ver mi resumen";
/*
 * Con más de 12 meses, la bandera y el valor del slider llevan el año, contado
 * como el eje («Año 1» = los primeros 12 meses desde el inicio): hay varios
 * diciembres y la etiqueta tiene que ser única en su rango (Levi).
 */
export const BANDERA = (mes, anio = null) => (anio ? `Cierre · ${mes} · año ${anio}` : `Cierre · ${mes}`);
export const ANIO = (k) => `Año ${k}`;
export const VALOR_CORTE = (mes, anio = null) => `Cierre al final de ${mes.toLowerCase()}${anio ? ` del año ${anio}` : ""}`;
export const MOVER_ANTES = "Mover el corte un mes antes";
export const MOVER_DESPUES = "Mover el corte un mes después";
/* La pista de una línea: los pasos 2 y 3 de Gen, uno por vez. */
export const PISTA_CORTE = PASOS_ACT6[1];
export const PISTA_CIFRAS = PASOS_ACT6[2];

/* ═══════════ EL TUTORIAL: LA PANADERÍA (Gen) ═══════════ */
export const EJEMPLO_PANADERIA_ACT6 = {
  id: "demo-panaderia-act6",
  empresa: "Una panadería",
  hecho: "Una panadería cierra el 31 de diciembre. Pagó $900.000 el 1 de octubre por nueve meses de bodega.",
  tipo: PAGO,
  meses: 9,
  inicio: OCTUBRE,
  total: 900000,
  corte: 3,
  alPeriodo: 300000,
  queda: 600000,
  pie: null,
  /* La resolución de Gen. */
  acierto: "Pasaron 3 de 9 meses. Al periodo le toca $300.000 y quedan $600.000 de bodega por usar.",
};
export const ALT_TUTORIAL_ACT6 = "Ejemplo: el corte queda en diciembre. Se escribe $300.000 para el periodo y $600.000 para lo que queda.";
