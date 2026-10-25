import { ACTIVO, PASIVO, GASTO, INGRESO } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 5 · «ARMA EL AJUSTE DIFERIDO» — el contenido.
 *
 * El texto final de Gen, palabra por palabra, comprobado contra la tabla de
 * control de Levi. Los hechos de los ítems 4 y 5 son los que fijó Levi
 * (el de Gen se cortaba antes de decir la cifra), y sus aciertos también.
 *
 * Aquí el estudiante ESCRIBE el valor. En cinco ítems lo calcula; en dos
 * (`dado: true`) el libro lo da y está escrito en el hecho: una prueba lo
 * comprueba, para que no vuelva a faltar.
 *
 * Cada ítem lleva su CLASE (pago o cobro por anticipado): decide qué texto
 * de cuenta errada se muestra (C o D).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT5_T3 = {
  id: "t3-ajuste-diferido",
  nombre: "Arma el ajuste diferido",
  /* Análisis · 50 FP (Gen y Levi). En el catálogo, Análisis es «dificil». */
  dificultad: "dificil",
  fpBase: 50,
  consigna: "Lee el hecho. Arma el asiento y escribe el valor del periodo.",
};

export const PASOS_ACT5 = [
  "Mira cuánto se pagó o se recibió y por cuántos meses.",
  "Calcula cuánto le toca a este periodo.",
  "Pon un nombre en cada cuenta y escribe el valor.",
];

export const PAGO = "pago";
export const COBRO = "cobro";

/* El tipo de cada cuenta, para el ▲ (por dónde crece). */
export const TIPOS_ACT5 = {
  "Gasto seguros": GASTO,
  "Seguros pagados por anticipado": ACTIVO,
  "Gasto alquiler": GASTO,
  "Alquiler pagado por anticipado": ACTIVO,
  "Arriendos recibidos por anticipado": PASIVO,
  "Ingresos por arriendos": INGRESO,
  "Servicios recibidos por anticipado": PASIVO,
  "Ingresos por servicios": INGRESO,
  "Gasto arriendos": GASTO,
  "Arriendos pagados por anticipado": ACTIVO,
};

export const ITEMS_ACT5 = [
  {
    id: "t3a5-seguro-galindo",
    empresa: "Mónica Galindo",
    hecho: "Mónica Galindo cierra el 31 de diciembre. Seguro de cinco años por $480.000, comprado el 1 de marzo",
    clase: PAGO,
    dado: false,
    reparto: { de: 10, meses: 60, total: 480000 },
    valor: 80000,
    debe: "Gasto seguros",
    haber: "Seguros pagados por anticipado",
    anclajes: { "Gasto seguros": "cierra el 31 de diciembre", "Seguros pagados por anticipado": "Seguro de cinco años por $480.000" },
    acierto: null,
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a5-equipos-galindo",
    empresa: "Mónica Galindo",
    hecho: "Mónica Galindo cierra el 31 de diciembre. Alquiler de equipos: pagó $1.080.000 por seis meses, desde el 1 de agosto",
    clase: PAGO,
    dado: false,
    reparto: { de: 5, meses: 6, total: 1080000 },
    valor: 900000,
    debe: "Gasto alquiler",
    haber: "Alquiler pagado por anticipado",
    anclajes: { "Gasto alquiler": "cierra el 31 de diciembre", "Alquiler pagado por anticipado": "Alquiler de equipos: pagó $1.080.000 por seis meses" },
    acierto: null,
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a5-arriendo-galindo",
    empresa: "Mónica Galindo",
    hecho: "Mónica Galindo cierra el 31 de diciembre. Arriendo recibido por un año a $160.000 al mes, desde el 1 de junio",
    clase: COBRO,
    dado: false,
    reparto: { de: 7, meses: 12, total: 12 * 160000 },
    valor: 1120000,
    debe: "Arriendos recibidos por anticipado",
    haber: "Ingresos por arriendos",
    anclajes: { "Arriendos recibidos por anticipado": "Arriendo recibido por un año", "Ingresos por arriendos": "cierra el 31 de diciembre" },
    acierto: null,
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a5-servicios-galindo",
    empresa: "Mónica Galindo",
    /* Hecho fijado por Levi. */
    hecho: "Mónica Galindo cierra el 31 de diciembre. El 10 de septiembre recibió $830.000 por servicios que prestaría después. Al cierre ya se causaron $386.000 de ese valor.",
    clase: COBRO,
    dado: true,
    reparto: null,
    valor: 386000,
    debe: "Servicios recibidos por anticipado",
    haber: "Ingresos por servicios",
    anclajes: { "Servicios recibidos por anticipado": "recibió $830.000 por servicios que prestaría después", "Ingresos por servicios": "ya se causaron $386.000" },
    /* Acierto de Levi: Gen no trajo acierto para este ítem. */
    acierto: "Ya se causaron $386.000: esa parte deja de ser lo recibido por anticipado y pasa a ser ingreso.",
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a5-servicios-caribe",
    empresa: "Servicios del Caribe",
    /* Hecho fijado por Levi. */
    hecho: "Servicios del Caribe cierra el 31 de marzo. El 15 de marzo recibió $500.000 por servicios futuros. Al cierre ya se causaron $120.000 de ese valor.",
    clase: COBRO,
    dado: true,
    reparto: null,
    valor: 120000,
    debe: "Servicios recibidos por anticipado",
    haber: "Ingresos por servicios",
    anclajes: { "Servicios recibidos por anticipado": "recibió $500.000 por servicios futuros", "Ingresos por servicios": "ya se causaron $120.000" },
    acierto: "Ya se causaron $120.000: esa parte deja de ser lo recibido por anticipado y pasa a ser ingreso.",
    pie: "Basado en el libro, p. 172",
  },
  {
    id: "t3a5-arriendo-san-calixto",
    empresa: "San Calixto",
    hecho: "San Calixto cierra el 30 de junio. Arriendo de $15.000 por tres meses, pagado el 1 de junio",
    clase: PAGO,
    dado: false,
    reparto: { de: 1, meses: 3, total: 15000 },
    valor: 5000,
    debe: "Gasto arriendos",
    haber: "Arriendos pagados por anticipado",
    anclajes: { "Gasto arriendos": "cierra el 30 de junio", "Arriendos pagados por anticipado": "pagado el 1 de junio" },
    acierto: null,
    pie: "Basado en el libro, pp. 143-144",
  },
  {
    id: "t3a5-arriendo-costa",
    empresa: "Arriendos de la Costa",
    hecho: "Arriendos de la Costa cierra el 30 de junio. Arriendo de $15.000 por tres meses, recibido el 1 de junio",
    clase: COBRO,
    dado: false,
    reparto: { de: 1, meses: 3, total: 15000 },
    valor: 5000,
    debe: "Arriendos recibidos por anticipado",
    haber: "Ingresos por arriendos",
    anclajes: { "Arriendos recibidos por anticipado": "recibido el 1 de junio", "Ingresos por arriendos": "cierra el 30 de junio" },
    acierto: null,
    pie: "Libro, p. 146",
  },
];

/* ═══════════ RETROALIMENTACIÓN POR TIPO DE ERROR (Gen; B de los dados, Levi) ═══════════ */
export const ERRORES_ACT5 = {
  A: "Las dos cuentas son las correctas, pero quedaron al revés. Mira el ▲ de cada una.",
  B_CALCULA: "Ese valor no es el del periodo. Divide el total entre los meses y multiplica por los que ya pasaron.",
  B_DADO: "El libro da el valor del periodo: ya está en el hecho. Escríbelo tal cual.",
  C: "Esa cuenta no se mueve. Un pago por anticipado toca un gasto y lo que quedaba pagado.",
  D: "Esa cuenta no se mueve. Un cobro por anticipado toca lo que quedaba por cumplir y un ingreso.",
};

/* ═══════════ EL TUTORIAL: LA PANADERÍA (Gen) ═══════════ */
export const EJEMPLO_ACT5 = {
  id: "demo-panaderia-act5",
  empresa: null,
  hecho: "Una panadería cierra el 31 de diciembre. Pagó $1.200.000 por un año de seguro el 1 de julio.",
  clase: PAGO,
  dado: false,
  reparto: { de: 6, meses: 12, total: 1200000 },
  valor: 600000,
  debe: "Gasto seguros",
  haber: "Seguros pagados por anticipado",
  anclajes: { "Gasto seguros": "cierra el 31 de diciembre", "Seguros pagados por anticipado": "Pagó $1.200.000 por un año de seguro" },
  /* La resolución de Gen. */
  acierto: "De doce meses ya pasaron seis. Al periodo le toca la mitad: $600.000.",
  pie: null,
};
export const ALT_TUTORIAL_ACT5 = "Ejemplo: se pone Gasto seguros en la cuenta del debe. Seguros pagados por anticipado va en la del haber. Se escribe $600.000.";
