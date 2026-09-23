import { DEBE, HABER, ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOCE ACTIVIDADES DE «LAS CUENTAS, EL DEBE Y EL HABER».
 *
 * Aquí viven la ficha de cada una —dificultad, FP, subtema, bloque— y sus
 * bancos completos. El contenido es de Gen y va VERBATIM: los enunciados, las
 * retroalimentaciones de acierto y las de error.
 *
 * `subtema` es un campo del banco, como en Política Monetaria: la mecánica lo
 * pasa como título a su marco y no hay lógica ni migración de por medio.
 *
 * ═══════════ EL RANGO RESTRINGIDO DE CIMIENTOS, Y POR QUÉ ═══════════
 *
 * CU-1 y CU-2 usan SOLO cuentas reales, SOLO asientos simples y SOLO seis
 * cuentas. Nada de ingresos, gastos ni costos: ahí es donde la memorización se
 * rompe, y la variedad completa entra en Aplicación. No es una simplificación
 * por comodidad, es la regla del bloque — y hay una prueba que la vigila.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las seis cuentas que puede tocar Cimientos. */
export const CUENTAS_DE_CIMIENTOS = [
  "Caja", "Bancos", "Aportes sociales",
  "Equipo de computación", "Obligaciones financieras", "Cuentas por pagar",
];

/* ─────────────────────────── la ficha de cada una ─────────────────────────── */

/*
 * El orden es el del camino, que es el de Bloom: Cimientos, Aplicación,
 * Análisis, Maestría. `fpBase` sale de la dificultad y lo vuelve a comprobar
 * una prueba contra el motor, para que las dos no se separen.
 */
export const ACTIVIDADES = [
  { id: "cu-izquierda-o-derecha", nombre: "¿Izquierda o Derecha?", bloque: "CIMIENTOS",
    dificultad: "facil", fpBase: 10, subtema: "Estructura de la cuenta T" },
  { id: "cu-de-que-familia", nombre: "¿De qué familia es?", bloque: "CIMIENTOS",
    dificultad: "facil", fpBase: 10, subtema: "Clasificación de cuentas reales" },

  { id: "cu-cuadro-dinamicas", nombre: "El Cuadro de Dinámicas", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Reglas de registro" },
  { id: "cu-debita-o-acredita", nombre: "¿Se Debita o se Acredita?", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Reglas de registro aplicadas" },
  { id: "cu-saldo-de-la-cuenta", nombre: "El Saldo de la Cuenta", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Cálculo del saldo" },

  { id: "cu-arma-el-asiento", nombre: "Arma el Asiento", bloque: "ANÁLISIS",
    dificultad: "dificil", fpBase: 50, subtema: "Asiento contable simple" },
  { id: "cu-simple-o-compuesto", nombre: "¿Simple o Compuesto?", bloque: "ANÁLISIS",
    dificultad: "dificil", fpBase: 50, subtema: "Asiento simple y compuesto" },
  { id: "cu-cuadra-o-no", nombre: "¿Cuadra o No Cuadra?", bloque: "ANÁLISIS",
    dificultad: "dificil", fpBase: 50, subtema: "Partida doble" },
  { id: "cu-corriente-de-cuentas", nombre: "Corriente de Cuentas", bloque: "ANÁLISIS",
    dificultad: "dificil", fpBase: 50, subtema: "Interleaving — clasificación de las seis familias" },

  { id: "cu-asiento-compuesto", nombre: "El Asiento Compuesto", bloque: "MAESTRÍA",
    dificultad: "experto", fpBase: 90, subtema: "Asiento compuesto" },
  { id: "cu-mayorizacion", nombre: "La Mayorización", bloque: "MAESTRÍA",
    dificultad: "experto", fpBase: 90, subtema: "Mayorización" },
  { id: "cu-error-escondido", nombre: "El Error Escondido", bloque: "MAESTRÍA",
    dificultad: "experto", fpBase: 90, subtema: "Diagnóstico de errores de registro" },
];

/* El desafío va aparte: no es la trece, está al lado del camino. */
export const DESAFIO = {
  id: "ciclo-completo",
  nombre: "El Ciclo Completo",
  rotuloMapa: "DESAFÍO: El Ciclo Completo — Lavado de Autos Mateo S.A.",
  dificultad: "experto",
  fpBase: 90,
  etapas: 4,
  /* Los pesos de la ficha, en el orden en que se juegan. */
  pesos: [
    { id: 1, nombre: "El Libro Diario", peso: 0.3, subtema: "Libro diario y asientos contables" },
    { id: 2, nombre: "La Mayorización", peso: 0.25, subtema: "Libro mayor y mayorización" },
    { id: 3, nombre: "Los Saldos", peso: 0.2, subtema: "Cálculo del saldo" },
    { id: 4, nombre: "El Estado de Situación Financiera", peso: 0.25, subtema: "Construcción del estado de situación financiera" },
  ],
  cierre: "Nueve transacciones, once cuentas y tres libros para llegar a una sola línea: $21.350 = $21.350. Eso es todo lo que hace la contabilidad — y cada paso que dio es el que hace un contador en cualquier empresa del mundo.",
};

/** Los FP que suma el camino del tema. El desafío NO entra: está fuera. */
export const FP_DEL_TEMA = ACTIVIDADES.reduce((s, a) => s + a.fpBase, 0);

/* ═══════════════════════ CU-1 · ¿Izquierda o Derecha? ═══════════════════════ */

export const IZQUIERDA_O_DERECHA = {
  subtema: "Estructura de la cuenta T",
  porPartida: 6,
  categorias: [
    { id: DEBE, nombre: "Debe" },
    { id: HABER, nombre: "Haber" },
  ],
  items: [
    { id: "cu1-01", enunciado: "Caja aumenta", cuenta: "Caja", categoria: DEBE,
      acierto: "✅ Debe. Caja es un activo, y los activos aumentan por la izquierda." },
    { id: "cu1-02", enunciado: "Caja disminuye", cuenta: "Caja", categoria: HABER,
      acierto: "✅ Haber. Si el activo aumenta por la izquierda, disminuye por la derecha. Siempre es el lado contrario." },
    { id: "cu1-03", enunciado: "Aportes sociales aumenta", cuenta: "Aportes sociales", categoria: HABER,
      acierto: "✅ Haber. Aportes sociales es patrimonio, y el patrimonio aumenta por la derecha." },
    { id: "cu1-04", enunciado: "Aportes sociales disminuye", cuenta: "Aportes sociales", categoria: DEBE,
      acierto: "✅ Debe. El patrimonio crece por la derecha, así que decrece por la izquierda." },
    { id: "cu1-05", enunciado: "Obligaciones financieras aumenta", cuenta: "Obligaciones financieras", categoria: HABER,
      acierto: "✅ Haber. Es un pasivo, y los pasivos aumentan por la derecha, igual que el patrimonio." },
    { id: "cu1-06", enunciado: "Obligaciones financieras disminuye", cuenta: "Obligaciones financieras", categoria: DEBE,
      acierto: "✅ Debe. Pagar una deuda la reduce, y eso se registra por la izquierda." },
    { id: "cu1-07", enunciado: "Equipo de computación aumenta", cuenta: "Equipo de computación", categoria: DEBE,
      acierto: "✅ Debe. Es un activo — igual que Caja, aunque no sea dinero." },
    { id: "cu1-08", enunciado: "Bancos disminuye", cuenta: "Bancos", categoria: HABER,
      acierto: "✅ Haber. Bancos es un activo, exactamente igual que Caja." },
    { id: "cu1-09", enunciado: "Cuentas por pagar aumenta", cuenta: "Cuentas por pagar", categoria: HABER,
      acierto: "✅ Haber. Deber más es aumentar un pasivo, y los pasivos crecen por la derecha." },
    { id: "cu1-10", enunciado: "Cuentas por pagar disminuye", cuenta: "Cuentas por pagar", categoria: DEBE,
      acierto: "✅ Debe. Abonar a una deuda la reduce, y eso va por la izquierda." },
  ],
  /*
   * El error se explica por la FAMILIA de la cuenta, no por el ítem: los diez
   * comparten tres explicaciones porque comparten tres reglas.
   */
  errorPorTipo: {
    [ACTIVO]: "❌ Al revés. Los activos son de la familia que crece por la izquierda: aumentan en el debe, disminuyen en el haber.",
    [PASIVO]: "❌ Al revés. Los pasivos son de la familia que crece por la derecha: aumentan en el haber, disminuyen en el debe.",
    [PATRIMONIO]: "❌ Al revés. El patrimonio va con los pasivos: crece por la derecha, decrece por la izquierda. Están del mismo lado de la ecuación.",
  },
};

/* ═══════════════════════ CU-2 · ¿De qué familia es? ═══════════════════════ */

export const DE_QUE_FAMILIA = {
  subtema: "Clasificación de cuentas reales",
  porPartida: 6,
  categorias: [
    { id: ACTIVO, nombre: "Activo" },
    { id: PASIVO, nombre: "Pasivo" },
    { id: PATRIMONIO, nombre: "Patrimonio" },
  ],
  items: [
    { id: "cu2-01", enunciado: "Terreno", categoria: ACTIVO, acierto: "✅ Activo. Es algo que la empresa tiene." },
    { id: "cu2-02", enunciado: "Obligaciones financieras", categoria: PASIVO, acierto: "✅ Pasivo. Es algo que la empresa debe a un banco." },
    { id: "cu2-03", enunciado: "Aportes sociales", categoria: PATRIMONIO, acierto: "✅ Patrimonio. Es lo que los dueños pusieron en el negocio." },
    { id: "cu2-04", enunciado: "Equipos de oficina", categoria: ACTIVO, acierto: "✅ Activo. La empresa lo tiene, aunque no sea dinero." },
    { id: "cu2-05", enunciado: "Salarios por pagar", categoria: PASIVO, acierto: "✅ Pasivo. El «por pagar» lo delata: es una deuda pendiente." },
    { id: "cu2-06", enunciado: "Inventario de mercancías", categoria: ACTIVO, acierto: "✅ Activo. La mercancía en bodega es propiedad de la empresa." },
    { id: "cu2-07", enunciado: "Depósitos en garantía", categoria: ACTIVO, acierto: "✅ Activo. Es plata de la empresa que está en manos de un tercero — sigue siendo suya." },
    { id: "cu2-08", enunciado: "Cuentas por pagar", categoria: PASIVO, acierto: "✅ Pasivo. Otra deuda, esta vez con proveedores." },
    { id: "cu2-09", enunciado: "Caja", categoria: ACTIVO, acierto: "✅ Activo. El efectivo es el activo más básico de todos." },
    { id: "cu2-10", enunciado: "Bancos", categoria: ACTIVO, acierto: "✅ Activo. Es el dinero de la empresa, solo que depositado." },
    { id: "cu2-11", enunciado: "Letras por pagar", categoria: PASIVO, acierto: "✅ Pasivo. Una deuda respaldada con un documento firmado." },
    { id: "cu2-12", enunciado: "Acciones", categoria: PATRIMONIO, acierto: "✅ Patrimonio. Representa la participación de los dueños en la empresa." },
  ],
  /* La clave es `correcta>elegida`: la confusión es entre dos familias, no de un ítem. */
  errorPorConfusion: {
    [`${ACTIVO}>${PASIVO}`]: "❌ Pregúntese: ¿esto la empresa lo tiene o lo debe? Aquí lo tiene. Eso es un activo.",
    [`${PASIVO}>${ACTIVO}`]: "❌ Pregúntese: ¿lo tiene o lo debe? Aquí lo debe. Eso es un pasivo — y fíjese que muchos llevan «por pagar» en el nombre.",
    [`${PATRIMONIO}>${PASIVO}`]: "❌ Los dos están del lado derecho de la ecuación, pero no son lo mismo: el pasivo se le debe a terceros, el patrimonio a los dueños.",
    [`${PASIVO}>${PATRIMONIO}`]: "❌ Los dos están del lado derecho de la ecuación, pero no son lo mismo: el pasivo se le debe a terceros, el patrimonio a los dueños.",
    [`${PATRIMONIO}>${ACTIVO}`]: "❌ Los aportes de los dueños no son algo que la empresa tenga: son su origen. El dinero que entró sí es activo; el aporte que lo explica es patrimonio.",
    [`${ACTIVO}>${PATRIMONIO}`]: "❌ Los aportes de los dueños no son algo que la empresa tenga: son su origen. El dinero que entró sí es activo; el aporte que lo explica es patrimonio.",
  },
};

/* ═══════════════════════ CU-3 · El Cuadro de Dinámicas ═══════════════════════ */

/*
 * Las doce combinaciones se GENERAN de las dos reglas en vez de teclearse. Una
 * tabla escrita a mano podría contradecir a CRECE_POR sin que nadie lo notara,
 * y entonces la actividad enseñaría lo contrario que la pieza de Aprender.
 */
const ACIERTO_DINAMICA = {
  [`${ACTIVO}>${DEBE}`]: "✅ Aumenta. Activos, Gastos y Costos crecen por el debe.",
  [`${ACTIVO}>${HABER}`]: "✅ Disminuye. Si crece por el debe, decrece por el haber.",
  [`${PASIVO}>${DEBE}`]: "✅ Disminuye. Los pasivos crecen por el haber, así que el debe los reduce.",
  [`${PASIVO}>${HABER}`]: "✅ Aumenta. Pasivos, Patrimonio e Ingresos crecen por el haber.",
  [`${PATRIMONIO}>${DEBE}`]: "✅ Disminuye. El patrimonio va con los pasivos: crece por el haber.",
  [`${PATRIMONIO}>${HABER}`]: "✅ Aumenta. Un aporte de los socios se registra por el haber.",
  [`${INGRESO}>${DEBE}`]: "✅ Disminuye. Y aquí es donde más gente se cae: los ingresos crecen por el haber, no por el debe.",
  [`${INGRESO}>${HABER}`]: "✅ Aumenta. Vender se registra acreditando el ingreso — aunque suene raro la primera vez.",
  [`${GASTO}>${DEBE}`]: "✅ Aumenta. Los gastos van con los activos: crecen por el debe.",
  [`${GASTO}>${HABER}`]: "✅ Disminuye. Poco común, pero es la otra cara de la regla.",
  [`${COSTO}>${DEBE}`]: "✅ Aumenta. Los costos se comportan igual que los gastos.",
  [`${COSTO}>${HABER}`]: "✅ Disminuye. Misma familia que gastos y activos.",
};

export const CUADRO_DINAMICAS = {
  subtema: "Reglas de registro",
  porPartida: 8,
  categorias: [
    { id: "aumenta", nombre: "Aumenta" },
    { id: "disminuye", nombre: "Disminuye" },
  ],
  acierto: ACIERTO_DINAMICA,
  errorPorTipo: {
    [INGRESO]: "❌ Este es el que más se falla de todo el tema. Un ingreso crece por el haber, igual que los pasivos y el patrimonio. Suena contraintuitivo porque vender se siente como que algo entra — pero lo que entra es la caja (que sí se debita); el ingreso que lo explica se acredita.",
    [GASTO]: "❌ Gastos y Costos van con los Activos: crecen por el debe. Si le sirve: los tres son cosas en las que la empresa pone plata.",
    [COSTO]: "❌ Gastos y Costos van con los Activos: crecen por el debe. Si le sirve: los tres son cosas en las que la empresa pone plata.",
    [ACTIVO]: "❌ Los activos crecen por el debe. Es la regla base de la que salen todas las demás.",
    [PASIVO]: "❌ Pasivos y Patrimonio crecen por el haber. Están del lado derecho de la ecuación, y crecen por el lado derecho de la cuenta.",
    [PATRIMONIO]: "❌ Pasivos y Patrimonio crecen por el haber. Están del lado derecho de la ecuación, y crecen por el lado derecho de la cuenta.",
  },
};

/* ═══════════════════ CU-4 · ¿Se Debita o se Acredita? ═══════════════════ */

/* Textual del ejercicio del capítulo, p. 113. */
export const DEBITA_O_ACREDITA = {
  subtema: "Reglas de registro aplicadas",
  porPartida: 8,
  categorias: [
    { id: DEBE, nombre: "Débito" },
    { id: HABER, nombre: "Crédito" },
  ],
  items: [
    { id: "cu4-01", enunciado: "Compra a crédito de un inventario", cuenta: "Inventario", categoria: DEBE,
      acierto: "✅ Débito. El inventario es un activo y está aumentando." },
    { id: "cu4-02", enunciado: "Devolución de aportes a un socio", cuenta: "Aportes sociales", categoria: DEBE,
      acierto: "✅ Débito. El patrimonio está disminuyendo, y el patrimonio disminuye por el debe." },
    { id: "cu4-03", enunciado: "Compra de contado de una maquinaria", cuenta: "Caja", categoria: HABER,
      acierto: "✅ Crédito. Salió dinero: el activo disminuye, y eso va por el haber." },
    { id: "cu4-04", enunciado: "Prestación de servicios a crédito", cuenta: "Ingresos por servicios", categoria: HABER,
      acierto: "✅ Crédito. Los ingresos aumentan por el haber — aunque todavía no haya entrado un peso." },
    { id: "cu4-05", enunciado: "Cancelación de gastos operacionales", cuenta: "Gastos de operación", categoria: DEBE,
      acierto: "✅ Débito. Los gastos aumentan por el debe." },
    { id: "cu4-06", enunciado: "Aportes en efectivo de un nuevo socio", cuenta: "Caja", categoria: DEBE,
      acierto: "✅ Débito. Entró dinero: el activo aumenta." },
    { id: "cu4-07", enunciado: "Recibo de un préstamo otorgado por un banco", cuenta: "Obligaciones financieras", categoria: HABER,
      acierto: "✅ Crédito. La deuda aumenta, y los pasivos aumentan por el haber." },
    { id: "cu4-08", enunciado: "Cobros de facturas a los clientes", cuenta: "Cuentas por cobrar", categoria: HABER,
      acierto: "✅ Crédito. Ojo: cobrar reduce lo que le deben. El activo disminuye." },
    { id: "cu4-09", enunciado: "Pago a proveedores", cuenta: "Cuentas por pagar", categoria: DEBE,
      acierto: "✅ Débito. Pagar reduce la deuda, y los pasivos se reducen por el debe." },
    { id: "cu4-10", enunciado: "Pago de participaciones a los socios", cuenta: "Participaciones por pagar", categoria: DEBE,
      acierto: "✅ Débito. Es un pasivo que se está cancelando." },
  ],
  errorIngreso: "❌ Los ingresos se acreditan. El dinero que entra se debita en Caja; el ingreso que lo explica se acredita. Son dos cuentas distintas del mismo asiento.",
};
