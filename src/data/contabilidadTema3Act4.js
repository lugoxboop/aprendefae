import { ACTIVO, PASIVO, GASTO, INGRESO } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 4 · «ARMA EL AJUSTE ACUMULADO» — el contenido.
 *
 * El texto final de Gen, palabra por palabra, comprobado contra la tabla de
 * control de Levi (valor, debe, haber y pie de los siete ítems). Aquí el
 * valor viene dado: va puesto en las fichas, como en A6 del Tema 2.
 *
 * Cada ítem lleva su CLASE (gasto o ingreso por causar): decide qué texto de
 * cuenta errada se muestra (B o C). Los anclajes son trozos literales del
 * hecho —nunca texto nuevo— y señalan dónde se nombra lo que mueve cada
 * cuenta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT4_T3 = {
  id: "t3-ajuste-acumulado",
  nombre: "Arma el ajuste acumulado",
  /* Aplicación · 25 FP (Gen y Levi). En el catálogo, Aplicación es «medio». */
  dificultad: "medio",
  fpBase: 25,
  consigna: "Lee el hecho. Pon un nombre en cada cuenta y el valor en su lado.",
};

export const PASOS_ACT4 = [
  "Pregúntate si lo que falta anotar es un gasto o un ingreso.",
  "Toca un nombre y después la cuenta donde va.",
  "Toca el valor y después el lado de su cuenta.",
];

/* La clase de cada ítem: decide el texto de cuenta errada. */
export const POR_PAGAR = "gasto";
export const POR_COBRAR = "ingreso";

/* El tipo de cada cuenta, para el ▲ (por dónde crece). */
export const TIPOS_ACT4 = {
  "Gasto salarios": GASTO,
  "Salarios por pagar": PASIVO,
  "Gasto interés": GASTO,
  "Intereses por pagar": PASIVO,
  "Intereses por cobrar": ACTIVO,
  "Ingresos por intereses": INGRESO,
  "Servicios por cobrar": ACTIVO,
  "Ingresos por servicios": INGRESO,
  "Gasto alquiler": GASTO,
  "Alquiler por pagar": PASIVO,
  /* Las dos del tutorial. */
  "Gasto servicios públicos": GASTO,
  "Servicios públicos por pagar": PASIVO,
};

export const ITEMS_ACT4 = [
  {
    id: "t3a4-salarios-caribe",
    empresa: "Servicios del Caribe",
    hecho: "Salarios acumulados por pagar a marzo 31",
    clase: POR_PAGAR,
    valor: 125000,
    debe: "Gasto salarios",
    haber: "Salarios por pagar",
    anclajes: { "Gasto salarios": "Salarios acumulados", "Salarios por pagar": "por pagar" },
    acierto: "Los salarios ya se causaron: el trabajo está hecho. Falta la plata, y eso es una deuda.",
    pie: "Basado en el libro, p. 172",
  },
  {
    id: "t3a4-intereses-caribe",
    empresa: "Servicios del Caribe",
    hecho: "Intereses pendientes de pago a marzo 31",
    clase: POR_PAGAR,
    valor: 36000,
    debe: "Gasto interés",
    haber: "Intereses por pagar",
    anclajes: { "Gasto interés": "Intereses", "Intereses por pagar": "pendientes de pago" },
    acierto: "El interés ya se causó. Todavía no se paga, así que queda como deuda.",
    pie: "Basado en el libro, p. 172",
  },
  {
    id: "t3a4-salarios-galindo",
    empresa: "Mónica Galindo",
    hecho: "Salarios acumulados por pagar a diciembre 31",
    clase: POR_PAGAR,
    valor: 210000,
    debe: "Gasto salarios",
    haber: "Salarios por pagar",
    anclajes: { "Gasto salarios": "Salarios acumulados", "Salarios por pagar": "por pagar" },
    acierto: "Mismo caso, otra empresa y otro monto. El trabajo ya se hizo y la plata sale después.",
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a4-inversion-caribe",
    empresa: "Servicios del Caribe",
    hecho: "Una inversión generó intereses en marzo que no se han recibido",
    clase: POR_COBRAR,
    valor: 240000,
    debe: "Intereses por cobrar",
    haber: "Ingresos por intereses",
    anclajes: { "Intereses por cobrar": "no se han recibido", "Ingresos por intereses": "generó intereses" },
    acierto: "El interés ya se causó a favor de la empresa. Falta cobrarlo, y eso queda como algo por cobrar.",
    pie: "Basado en el libro, p. 172",
  },
  {
    id: "t3a4-mantenimiento-galindo",
    empresa: "Mónica Galindo",
    hecho: "Tres meses de mantenimiento a Rojo y Negro, sin cobrar",
    clase: POR_COBRAR,
    valor: 600000,
    debe: "Servicios por cobrar",
    haber: "Ingresos por servicios",
    anclajes: { "Servicios por cobrar": "sin cobrar", "Ingresos por servicios": "Tres meses de mantenimiento" },
    acierto: "El servicio ya se prestó tres meses. El ingreso es suyo aunque Rojo y Negro no haya pagado.",
    pie: "Basado en el libro, p. 173",
  },
  {
    id: "t3a4-maquina-san-calixto",
    empresa: "San Calixto",
    hecho: "Cinco días de máquina alquilada, sin pagar",
    clase: POR_PAGAR,
    valor: 2500,
    debe: "Gasto alquiler",
    haber: "Alquiler por pagar",
    anclajes: { "Gasto alquiler": "máquina alquilada", "Alquiler por pagar": "sin pagar" },
    acierto: "Cinco días de uso ya causaron el gasto. La deuda con San Miguel queda pendiente.",
    pie: "Libro, p. 140",
  },
  {
    id: "t3a4-maquina-san-miguel",
    empresa: "San Miguel",
    hecho: "Cinco días de máquina prestada, sin cobrar",
    clase: POR_COBRAR,
    valor: 2500,
    debe: "Servicios por cobrar",
    haber: "Ingresos por servicios",
    anclajes: { "Servicios por cobrar": "sin cobrar", "Ingresos por servicios": "máquina prestada" },
    acierto: "El mismo hecho del otro lado. El ingreso ya es suyo y falta cobrarlo.",
    pie: "Libro, p. 142",
  },
];

/* ═══════════ RETROALIMENTACIÓN POR TIPO DE ERROR (Gen) ═══════════ */
export const ERRORES_ACT4 = {
  A: "Las dos cuentas son las correctas, pero quedaron al revés. Mira el ▲ de cada una.",
  B: "Esa cuenta no se mueve en este hecho. Un gasto que falta por pagar toca un gasto y una deuda.",
  C: "Esa cuenta no se mueve en este hecho. Un ingreso que falta por cobrar toca algo por cobrar y un ingreso.",
  D: "Las dos fichas quedaron del mismo lado. El asiento pone una en el debe y otra en el haber.",
};

/* ═══════════ EL TUTORIAL: LA PANADERÍA (Gen) ═══════════ */
export const EJEMPLO_ACT4 = {
  id: "demo-panaderia-act4",
  /* El hecho ya nombra la panadería: la tarjeta no repite la empresa. */
  empresa: null,
  hecho: "Una panadería. Debe $300.000 de luz de diciembre y la factura llega en enero.",
  clase: POR_PAGAR,
  valor: 300000,
  debe: "Gasto servicios públicos",
  haber: "Servicios públicos por pagar",
  anclajes: { "Gasto servicios públicos": "luz de diciembre", "Servicios públicos por pagar": "Debe $300.000" },
  acierto: "El servicio ya se consumió en diciembre. La factura llega después, así que queda como deuda.",
  pie: null,
};
export const ALT_TUTORIAL_ACT4 = "Ejemplo: se pone Gasto servicios públicos en la cuenta del debe y Servicios públicos por pagar en la del haber, con $300.000 en cada lado.";
