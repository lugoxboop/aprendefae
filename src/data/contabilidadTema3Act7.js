/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 7 · «EL CIERRE COMPLETO» — el contenido.
 *
 * El texto aprobado de Gen y el paquete de Levi, que manda en la estructura:
 * por caso, tres partes en secuencia (asiento 1, asiento 2 y el saldo), un
 * intento por parte y «Ganancias y pérdidas» una sola vez en el estante.
 *
 * Las cifras de los dos casos y del tutorial coinciden con las de Gen (las
 * comprueban las pruebas). Los siete gastos de La Servicial son los del
 * libro (p. 165) que Levi recalculó: suman exacto $16.886.971.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT7_T3 = {
  id: "t3-cierre-completo",
  nombre: "El cierre completo",
  /* Maestría · 90 FP (Gen y Levi). En el catálogo, Maestría es «experto». */
  dificultad: "experto",
  fpBase: 90,
  consigna: "Lee los saldos. Arma los dos asientos de cierre y escribe lo que queda.",
};

export const PASOS_ACT7 = [
  "Junta todos los ingresos y pásalos a Ganancias y pérdidas.",
  "Junta todos los gastos y pásalos a Ganancias y pérdidas.",
  "Calcula lo que queda en Ganancias y pérdidas.",
];

export const GYP = "Ganancias y pérdidas";
export const INGRESO = "ingreso";
export const GASTO = "gasto";
export const NO_SE_CIERRA = "no-se-cierra";

/* Los rótulos de las tres partes, con las palabras de Gen. */
export const ROTULO_ASIENTO_1 = "Asiento 1";
export const ROTULO_ASIENTO_2 = "Asiento 2";
export const ROTULO_SALDO = "Saldo que queda en Ganancias y pérdidas";

const ing = (cuenta, saldo) => ({ cuenta, saldo, tipo: INGRESO });
const gas = (cuenta, saldo) => ({ cuenta, saldo, tipo: GASTO });
const fija = (cuenta, saldo) => ({ cuenta, saldo, tipo: NO_SE_CIERRA });

export const CASOS_ACT7 = [
  {
    id: "t3a7-san-calixto",
    empresa: "San Calixto",
    pie: "Basado en el libro, pp. 121-128 y 140",
    cuentas: [
      ing("Ingresos por servicios", 14800),
      gas("Gasto arriendos", 2000),
      gas("Gasto salarios", 5100),
      gas("Gasto materiales de consumo", 500),
      gas("Gasto servicios públicos", 750),
      gas("Gasto alquiler", 2500),
      /* Las que no se cierran: si se usan, error D (Levi). */
      fija("Caja", 14650),
      fija("Cuentas por cobrar – clientes", 6800),
      fija("Equipo de computación", 5000),
      fija("Alquiler por pagar", 2500),
      fija("Aportes sociales", 20000),
    ],
    asiento1: 14800,
    asiento2: 10850,
    saldo: 3950,
  },
  {
    id: "t3a7-la-servicial",
    empresa: "La Servicial S.A.",
    pie: "Basado en el libro, p. 165",
    cuentas: [
      ing("Ingresos por servicios", 21942876),
      ing("Ingresos por intereses", 320114),
      ing("Ingresos varios", 605422),
      gas("Gasto salarios", 8340625),
      gas("Gasto servicios públicos", 1467018),
      gas("Gasto papelería", 328112),
      gas("Gasto mantenimiento", 1902564),
      gas("Gasto materiales e insumos", 3908764),
      gas("Otros gastos", 209675),
      gas("Gasto interés", 730213),
    ],
    asiento1: 22868412,
    asiento2: 16886971,
    saldo: 5981441,
  },
];

/* ═══════════ RETROALIMENTACIÓN POR TIPO DE ERROR (Gen) ═══════════ */
export const ERRORES_ACT7 = {
  A: "Faltó una cuenta. Todas las de ingresos y todas las de gastos tienen que quedar en cero.",
  B: "Ese valor no cuadra. Cada asiento suma sus cuentas, y el saldo es la resta entre los dos totales.",
  C: "Ese asiento va al revés. Los ingresos pasan por el debe y los gastos por el haber.",
  D: "Esa cuenta no se cierra. Solo se cierran las de ingresos y las de gastos.",
};

/* El resumen (Levi). */
export const RESUMEN_ACT7 = (bien, total) => `Bien a la primera: ${bien} de ${total}`;

/* ═══════════ EL TUTORIAL: LA PANADERÍA (Gen) ═══════════ */
export const EJEMPLO_ACT7 = {
  id: "demo-panaderia-act7",
  empresa: null,
  /* El caso de Gen, tal cual, en la tarjeta. */
  hecho: "Una panadería. Ingresos por ventas $800.000. Gasto harina $300.000. Gasto salarios $200.000.",
  pie: null,
  cuentas: [ing("Ingresos por ventas", 800000), gas("Gasto harina", 300000), gas("Gasto salarios", 200000)],
  asiento1: 800000,
  asiento2: 500000,
  saldo: 300000,
  /* La resolución de Gen, al terminar. */
  resolucion: "Los ingresos dan $800.000 y los gastos $500.000. En Ganancias y pérdidas quedan $300.000.",
};
export const ALT_TUTORIAL_ACT7 = "Ejemplo: los ingresos pasan por $800.000 y los dos gastos por $500.000. En Ganancias y pérdidas quedan $300.000.";
