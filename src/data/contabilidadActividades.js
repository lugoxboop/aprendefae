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


/* ═══════════════════════ CU-5 · El Saldo de la Cuenta ═══════════════════════ */

/*
 * LAS CUENTAS NO SE COPIAN, SE REFERENCIAN.
 *
 * Nueve de las diez ya existen: seis son del mayor de Lavado de Autos y tres
 * del de Caleja, y los dos mayores se derivan de sus asientos. Teclear aquí
 * sus movimientos otra vez sería una tercera copia de las mismas cifras, y la
 * tercera copia es la que se queda desactualizada.
 *
 * Solo la décima va escrita a mano: es la cuenta Caja que el capítulo usa como
 * ejemplo suelto para explicar el saldo, y no sale de ninguna transacción.
 */
export const CAJA_DEL_CAPITULO = {
  cuenta: "Caja",
  debitos: [{ valor: 1000 }, { valor: 500 }],
  creditos: [{ valor: 150 }],
};

export const SALDO_DE_LA_CUENTA = {
  subtema: "Cálculo del saldo",
  porPartida: 6,
  /* `caso` dice de qué mayor sacar la cuenta; `capitulo` es la de arriba. */
  items: [
    { id: "cu5-01", caso: "lavado", cuenta: "Bancos" },
    { id: "cu5-02", caso: "lavado", cuenta: "Caja" },
    { id: "cu5-03", caso: "lavado", cuenta: "Cuentas por pagar" },
    { id: "cu5-04", caso: "lavado", cuenta: "Hipoteca por pagar" },
    { id: "cu5-05", caso: "lavado", cuenta: "Letras por pagar" },
    { id: "cu5-06", caso: "lavado", cuenta: "Acciones" },
    { id: "cu5-07", caso: "caleja", cuenta: "Caja" },
    { id: "cu5-08", caso: "caleja", cuenta: "Aportes sociales" },
    { id: "cu5-09", caso: "caleja", cuenta: "Equipo de computación" },
    { id: "cu5-10", caso: "capitulo", cuenta: "Caja" },
  ],
  /*
   * Las dos preguntas por cuenta. El texto lleva huecos que la mecánica
   * rellena con las cifras de ESA cuenta: escribir diez versiones a mano
   * invitaría a que una llevara el número de otra.
   */
  aciertoSaldo: "✅ {saldo}. Movimiento débito {debito} menos movimiento crédito {credito}.",
  aciertoLado: "✅ {Lado} — porque el movimiento {movimiento} fue el mayor, y el saldo siempre se coloca del lado que pesó más.",
  errores: {
    sumo: "❌ El saldo es una resta, no una suma. Sume cada lado por separado y reste el menor del mayor.",
    ladoEquivocado: "❌ La cifra está bien. El lado no: el saldo va donde estuvo el movimiento mayor, que aquí fue el {movimiento}.",
    ladoMenor: "❌ Es al revés. Si por la izquierda pasaron {debito} y por la derecha {credito}, lo que sobra queda del lado que pesó más.",
    restoAlReves: "❌ Reste siempre el menor del mayor — el saldo nunca es negativo. Lo que indica de qué naturaleza es, es el lado donde queda, no un signo.",
  },
};

/* ═══════════════════════ CU-6 · Arma el Asiento ═══════════════════════ */

/*
 * Nueve de las doce transacciones ya están en los dos casos —seis de Caleja y
 * tres de Lavado de Autos—, así que se referencian por su id. Las otras tres
 * son del capítulo y no pertenecen a ningún caso: van completas aquí.
 */
export const TRANSACCIONES_SUELTAS = [
  {
    id: "cu6-dos-socios",
    /*
     * CORRECCIÓN 1. El enunciado del libro dice que cada socio aporta $1.000 y
     * luego totaliza mal; su propio libro diario (p. 96) registra $2.000.
     * Manda el diario, y el enunciado se deja tal cual para que el estudiante
     * vea la cifra que el libro le va a enseñar.
     */
    texto: "Se inicia un negocio con dos socios y cada uno aporta $1.000 en efectivo.",
    asiento: { debe: [["Caja", 2000]], haber: [["Aportes sociales", 2000]] },
  },
  {
    id: "cu6-pagare",
    texto: "La empresa recibe un préstamo de un banco por $500 respaldado con pagaré.",
    asiento: { debe: [["Caja", 500]], haber: [["Documentos por pagar", 500]] },
  },
  {
    id: "cu6-computador-contado",
    texto: "La empresa compró un computador por $150 y lo pagó de contado.",
    asiento: { debe: [["Equipo de computación", 150]], haber: [["Caja", 150]] },
  },
];

export const ARMA_EL_ASIENTO = {
  subtema: "Asiento contable simple",
  porPartida: 6,
  /* Cuatro decisiones por ítem: dos cuentas y el lado de cada una. */
  decisionesPorItem: 4,
  items: [
    { id: "cu6-01", suelta: "cu6-dos-socios" },
    { id: "cu6-02", suelta: "cu6-pagare" },
    { id: "cu6-03", suelta: "cu6-computador-contado" },
    { id: "cu6-04", caso: "caleja", transaccion: "cal-1" },
    { id: "cu6-05", caso: "caleja", transaccion: "cal-2" },
    { id: "cu6-06", caso: "caleja", transaccion: "cal-3" },
    { id: "cu6-07", caso: "caleja", transaccion: "cal-4" },
    { id: "cu6-08", caso: "caleja", transaccion: "cal-5" },
    { id: "cu6-09", caso: "caleja", transaccion: "cal-6" },
    { id: "cu6-10", caso: "lavado", transaccion: "ene-08" },
    { id: "cu6-11", caso: "lavado", transaccion: "ene-18" },
    { id: "cu6-12", caso: "lavado", transaccion: "ene-26" },
  ],
  errores: {
    invirtioLados: "❌ Las dos cuentas son las correctas, pero están al revés. Pregúntese cuál recibe y cuál entrega: lo que entra se debita, lo que sale se acredita.",
    cuentaAjena: "❌ {cuenta} no se mueve en esta transacción. Vuelva a las dos preguntas del libro: ¿qué está recibiendo el negocio, y qué entregó o en qué se comprometió a cambio?",
    cajaPorBancos: "❌ Son dos activos distintos. Si la transacción dice «con cheque» o «se consignó», es Bancos. Si dice «de contado» sin más, o «en efectivo», es Caja.",
    consignar: "❌ Consignar no es un ingreso ni un gasto: es mover plata de un bolsillo a otro. Bancos aumenta, Caja disminuye — dos activos, sin tocar pasivos ni patrimonio.",
    devolucionAportes: "❌ Devolver un aporte disminuye el patrimonio, y el patrimonio disminuye por el debe. Es la única transacción del banco donde Aportes sociales va al debe.",
  },
};

/* ═══════════════════════ CU-7 · ¿Simple o Compuesto? ═══════════════════════ */

export const SIMPLE_O_COMPUESTO = {
  subtema: "Asiento simple y compuesto",
  porPartida: 6,
  categorias: [
    { id: "simple", nombre: "Simple" },
    { id: "compuesto", nombre: "Compuesto" },
  ],
  items: [
    { id: "cu7-01", enunciado: "Se compró una computadora por $2.000, todo a crédito.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple: una cuenta al debe, una al haber." },
    { id: "cu7-02", enunciado: "Se compró edificio y terreno por $10.000: $2.000 de contado con cheque y el resto con hipoteca. El terreno se estimó en $4.000.",
      categoria: "compuesto", cuentas: 4,
      acierto: "✅ Compuesto, y de los grandes: dos activos entran (Construcciones y Terrenos) y dos cosas los pagan (Bancos e Hipoteca)." },
    { id: "cu7-03", enunciado: "Camión de $4.800: $800 de contado con cheque y el saldo en letras.",
      categoria: "compuesto", cuentas: 3,
      acierto: "✅ Compuesto: un activo entra, dos cuentas lo financian." },
    { id: "cu7-04", enunciado: "Muebles y enseres por $2.500: $500 de contado con cheque y el saldo a crédito.",
      categoria: "compuesto", cuentas: 3,
      acierto: "✅ Compuesto. Mismo patrón que el camión: una compra pagada de dos formas." },
    { id: "cu7-05", enunciado: "Se consignó en la cuenta corriente $800.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple: Bancos sube, Caja baja." },
    { id: "cu7-06", enunciado: "Los accionistas depositaron $5.000 por la compra de 1.000 acciones.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple, aunque sean muchos accionistas: contablemente son dos cuentas." },
    { id: "cu7-07", enunciado: "Se canceló con cheque $400 de la deuda del edificio.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple: el pasivo baja, Bancos baja." },
    { id: "cu7-08", enunciado: "Se constituye una sociedad con tres socios, cada uno aporta $100.000.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple. Tres socios, pero dos cuentas — es la trampa clásica de este ejercicio." },
    { id: "cu7-09", enunciado: "Un nuevo socio aporta un vehículo valorado en $2.000.000 y $1.000.000 en efectivo.",
      categoria: "compuesto", cuentas: 3,
      acierto: "✅ Compuesto: entran dos activos distintos contra un solo aporte." },
    { id: "cu7-10", enunciado: "Se compró maquinaria por $50.000 con un préstamo bancario.",
      categoria: "simple", cuentas: 2,
      acierto: "✅ Simple: el activo entra, el pasivo lo financia." },
  ],
  errores: {
    compuestoPorPersonas: "❌ La trampa está en confundir personas con cuentas. Tres socios aportando a la misma cuenta de patrimonio siguen siendo una sola cuenta. Cuente cuentas, no gente.",
    simpleSiendoCompuesto: "❌ Fíjese en cómo se pagó: cuando una compra se paga de dos formas distintas (parte de contado, parte a crédito), hacen falta más de dos cuentas.",
    numeroEquivocado: "❌ Vuelva a contar: son {cuentas}. Liste primero todo lo que entra y después todo lo que sale o se debe.",
    reglaGeneral: "❌ Recuerde: un asiento compuesto sigue cumpliendo la partida doble. Lo que tiene que cuadrar es el total del debe contra el total del haber, no el número de cuentas de cada lado.",
  },
};

/* ═══════════════════════ CU-8 · ¿Cuadra o No Cuadra? ═══════════════════════ */

/*
 * El descuadre NO se declara: se calcula de los totales. Escribirlo a mano
 * permitiría que un asiento dijera «descuadre 500» con unas cifras que dan
 * 400, y la actividad calificaría mal sin que nada avisara.
 */
export const CUADRA_O_NO = {
  subtema: "Partida doble",
  porPartida: 6,
  asientos: [
    { id: "cu8-01", debe: [["Construcciones y edificaciones", 6000], ["Terrenos", 4000]],
      haber: [["Bancos", 2000], ["Hipoteca por pagar", 8000]] },
    { id: "cu8-02", debe: [["Flota y equipo de transporte", 4800]],
      haber: [["Bancos", 800], ["Letras por pagar", 4000]] },
    { id: "cu8-03", debe: [["Muebles y enseres", 2500]],
      haber: [["Bancos", 500], ["Cuentas por pagar", 2000]] },
    { id: "cu8-04", debe: [["Equipo de computación", 2000]], haber: [["Cuentas por pagar", 2500]] },
    { id: "cu8-05", debe: [["Caja", 1000]], haber: [["Acciones", 1100]] },
    { id: "cu8-06", debe: [["Bancos", 5000]], haber: [["Acciones", 5000]] },
    { id: "cu8-07", debe: [["Maquinaria", 50000]], haber: [["Obligaciones financieras", 45000]] },
    { id: "cu8-08", debe: [["Caja", 300000]], haber: [["Aportes sociales", 300000]] },
    { id: "cu8-09", debe: [["Cuentas por pagar", 250]], haber: [["Bancos", 200]] },
    { id: "cu8-10", debe: [["Construcciones y edificaciones", 6000], ["Terrenos", 4000]],
      haber: [["Bancos", 2000], ["Hipoteca por pagar", 7500]] },
  ],
  aciertoCuadra: "✅ Cuadra: {debe} al debe contra {haber} al haber.",
  aciertoDescuadre: "✅ Correcto, está descuadrado en {descuadre}. El debe suma {debe} y el haber {haber}.",
  errores: {
    dijoCuadra: "❌ Sume otra vez cada lado por separado: el debe da {debe} y el haber {haber}. Faltan {descuadre} para que cuadre.",
    dijoNoCuadra: "❌ Sí cuadra. Puede que lo haya confundido el número de cuentas: este asiento tiene {cuentas} cuentas, pero un asiento compuesto es perfectamente válido mientras los totales coincidan.",
    cifraEquivocada: "❌ Acertó en que no cuadra. La diferencia exacta es {descuadre}: debe {debe} contra haber {haber}.",
  },
};

/** El total de cada lado y la diferencia, calculados del propio asiento. */
export function balanceDelAsiento(asiento) {
  const debe = asiento.debe.reduce((s, [, v]) => s + v, 0);
  const haber = asiento.haber.reduce((s, [, v]) => s + v, 0);
  return { debe, haber, descuadre: Math.abs(debe - haber), cuadra: debe === haber };
}

/*
 * EL PUNTAJE DE CU-8, que no es como el de las demás.
 *
 * Seis juicios valen el 75 %; el 25 % restante se reparte en partes iguales
 * entre los asientos DESCUADRADOS que hayan salido en ese intento, y se gana
 * diciendo la cifra exacta del descuadre.
 *
 * El reparto es variable a propósito: cuántos descuadrados salen depende del
 * sorteo. Lo que no puede pasar es que salgan cero —el 25 % quedaría sin
 * repartir y el intento valdría 75 como máximo sin culpa del estudiante—, y el
 * banco está construido para que no pase: con cinco cuadrados de diez y seis
 * sorteados, siempre sale al menos uno descuadrado. Hay una prueba que lo
 * comprueba sobre las 210 combinaciones posibles.
 */
export const PESO_JUICIOS = 0.75;
export const PESO_DESCUADRES = 0.25;

export function puntuarCuadraONo({ juiciosAcertados, porPartida = 6, descuadradosEnJuego, cifrasAcertadas }) {
  const juicios = (juiciosAcertados / porPartida) * PESO_JUICIOS;
  const cifras = descuadradosEnJuego > 0
    ? (cifrasAcertadas / descuadradosEnJuego) * PESO_DESCUADRES
    /* Sin descuadrados no hay nada que repartir; el banco impide que ocurra. */
    : PESO_DESCUADRES;
  return Math.round((juicios + cifras) * 100);
}

/* ═══════════════════════ CU-9 · Corriente de Cuentas ═══════════════════════ */

/*
 * Práctica intercalada (Rohrer, 2012): repetir la misma clasificación a
 * velocidad ES la técnica, no un defecto del diseño. Por eso el ritmo es más
 * urgente que el de las demás y por eso salen doce de veinticuatro.
 *
 * Las cuentas NO llevan su familia escrita: se toma del catálogo. Una lista
 * paralela podría contradecirlo, y entonces dos actividades del mismo tema
 * clasificarían la misma cuenta de dos maneras.
 */
export const CORRIENTE_DE_CUENTAS = {
  subtema: "Interleaving — clasificación de las seis familias",
  porPartida: 12,
  categorias: [
    { id: ACTIVO, nombre: "Activo" },
    { id: PASIVO, nombre: "Pasivo" },
    { id: PATRIMONIO, nombre: "Patrimonio" },
    { id: INGRESO, nombre: "Ingreso" },
    { id: GASTO, nombre: "Gasto" },
    { id: COSTO, nombre: "Costo" },
  ],
  cuentas: [
    "Terreno", "Equipos de oficina", "Inventario de mercancías", "Depósitos en garantía",
    "Cuentas por cobrar", "Flota y equipo de transporte",
    "Obligaciones financieras", "Salarios por pagar", "Cuentas por pagar", "Letras por pagar",
    "Hipoteca por pagar",
    "Aportes sociales", "Acciones", "Reserva legal", "Utilidad acumulada",
    "Renta por servicios", "Renta por interés", "Ingresos por ventas", "Ingresos operacionales",
    "Servicios públicos", "Gastos de operación", "Gastos por salarios", "Gastos por arriendo",
    "Costo de ventas",
  ],
  acierto: "✅ {Familia}.",
  errorGenerico: "❌ Es {familia}, no {elegida}.",
  /*
   * ═══════════ DOS DE ESTAS EXPLICACIONES SON DE UNA CUENTA, NO DE UNA FAMILIA ═══════════
   *
   * Las tres estuvieron bajo la misma llave «familia>familia», y eso hacía que
   * al fallar «Gastos por salarios» el estudiante leyera una explicación sobre
   * «Servicios públicos»: el par era el mismo (Gasto confundido con Pasivo)
   * pero el texto habla de una cuenta concreta. Se vio jugándolo, no leyéndolo.
   *
   * Así que van separadas por lo que de verdad son: dos hablan de SU cuenta y
   * solo salen para ella; la tercera es una regla entre dos familias y vale
   * para cualquier cuenta de patrimonio.
   */
  errorPorCuenta: {
    [`Renta por servicios>${ACTIVO}`]: "❌ Es un Ingreso. Ojo: «Renta por servicios» es lo que la empresa ganó, no algo que tenga. Lo que tiene sería la Caja o la Cuenta por cobrar que resultó de esa venta.",
    [`Servicios públicos>${PASIVO}`]: "❌ Es un Gasto. «Servicios públicos» es el consumo del mes; si además quedó pendiente de pago, eso sería otra cuenta distinta, «Servicios públicos por pagar», esa sí pasivo.",
  },
  errorReforzado: {
    [`${PATRIMONIO}>${PASIVO}`]: "❌ Es Patrimonio. Los dos están a la derecha de la ecuación, pero el pasivo se le debe a terceros y el patrimonio a los dueños.",
  },
};


/* ═══════════════════════ CU-10 · El Asiento Compuesto ═══════════════════════ */

/*
 * Tres de los cinco son transacciones de Lavado de Autos y se referencian; las
 * otras dos son del capítulo y van completas. Construcción libre: el
 * estudiante arma el asiento entero y solo se acepta si cuadra.
 */
export const COMPUESTAS_SUELTAS = [
  {
    id: "cu10-computador-mitad",
    texto: "Los socios compran un computador por $1.500.000, pagan el 50% de contado y el saldo a crédito.",
    asiento: {
      debe: [["Equipo de computación", 1500000]],
      haber: [["Caja", 750000], ["Cuentas por pagar", 750000]],
    },
  },
  {
    id: "cu10-socio-vehiculo",
    texto: "Aceptan en el negocio a un nuevo socio, quien aporta un vehículo valorado en $2.000.000 y $1.000.000 en efectivo.",
    asiento: {
      debe: [["Flota y equipo de transporte", 2000000], ["Caja", 1000000]],
      haber: [["Aportes sociales", 3000000]],
    },
  },
];

export const ASIENTO_COMPUESTO = {
  subtema: "Asiento compuesto",
  porPartida: 3,
  items: [
    { id: "cu10-01", caso: "lavado", transaccion: "ene-03" },
    { id: "cu10-02", caso: "lavado", transaccion: "ene-04" },
    { id: "cu10-03", caso: "lavado", transaccion: "ene-12" },
    { id: "cu10-04", suelta: "cu10-computador-mitad" },
    { id: "cu10-05", suelta: "cu10-socio-vehiculo" },
  ],
  /*
   * Dentro de cada transacción: acertar las cuentas vale la mitad, los lados un
   * cuarto y las cifras el otro cuarto. Elegir bien las cuentas es lo que de
   * verdad exige entender la transacción.
   */
  peso: { cuentas: 0.5, lados: 0.25, cifras: 0.25 },
  acierto: "✅ Correcto. El debe suma {total} y el haber {total} — cuadra. Note que {cuentas} cuentas no rompen la partida doble: lo que cuadra son los totales.",
  errores: {
    noCuadra: "❌ No cuadra: debe {debe}, haber {haber}. Antes de buscar el error de concepto, revise la aritmética — a veces es solo eso.",
    faltaCuenta: "❌ Falta algo. Pregúntese si todo lo que entró está en el debe y todo lo que lo pagó está en el haber. En esta transacción la compra se pagó de más de una forma.",
  },
  /* Los cinco casos con su propia trampa llevan su propia explicación. */
  erroresPorCaso: {
    "cu10-01": {
      unioEdificioYTerreno: "❌ Son dos activos distintos y el enunciado le da el valor de cada uno a propósito: terreno $4.000, construcción el resto. El terreno no se deprecia y la edificación sí, por eso se separan desde el registro.",
      hipotecaAlDebe: "❌ La hipoteca es una deuda que nace con esta transacción. Los pasivos nacen y aumentan por el haber.",
    },
    "cu10-04": {
      mitadMal: "❌ La mitad de $1.500.000 es $750.000 a cada lado del pago. El total del haber tiene que sumar $1.500.000, igual que el activo que entró.",
    },
    "cu10-05": {
      olvidoUnActivo: "❌ El socio aportó dos cosas: un vehículo y efectivo. Los dos entran por el debe, y el aporte total se acredita en una sola cuenta de patrimonio.",
    },
  },
};

/* ═══════════════════════ CU-11 · La Mayorización ═══════════════════════ */

/*
 * ⚠️ EL SET A ESTÁ TRUNCADO A PROPÓSITO. ⚠️
 *
 * Usa SOLO los asientos de ene-02 a ene-12. Sus saldos NO coinciden con el
 * mayor completo del libro (p. 100) en cuatro cuentas —Bancos, Acciones,
 * Hipoteca por pagar y Cuentas por pagar—, y eso es correcto: son el mayor de
 * un corte, no del mes entero. Caja ni siquiera aparece, porque entra en
 * ene-25.
 *
 * SI ALGUIEN CRUZA ESTAS CIFRAS CONTRA EL MAYOR COMPLETO Y LAS «CORRIGE»,
 * ROMPE LA ACTIVIDAD: estaría calificando como error la respuesta correcta.
 * Por eso el corte se declara como una lista de ids y los saldos se derivan de
 * ella; no hay ninguna tabla que se pueda editar por descuido. Y hay una
 * prueba que exige que las cuatro sigan siendo distintas.
 */
export const CORTE_SET_A = ["ene-02", "ene-03", "ene-04", "ene-08", "ene-12"];

export const MAYORIZACION = {
  subtema: "Mayorización",
  porPartida: 1,
  sets: [
    {
      id: "set-a",
      nombre: "Lavado de Autos Mateo S.A. — del 2 al 12 de enero",
      caso: "lavado",
      /* El corte, no el mes entero: de aquí salen sus diez cuentas. */
      transacciones: CORTE_SET_A,
    },
    {
      id: "set-b",
      nombre: "Comercializadora Caleja Ltda. — las seis transacciones",
      caso: "caleja",
      /* Las seis, sin truncar. */
      transacciones: null,
    },
  ],
  acierto: "✅ Bien mayorizado. El valor del debe del diario va al debe del mayor — no se transforma nada, solo se reordena.",
  errores: {
    ladoContrario: "❌ Mayorizar no cambia de lado: lo que estaba en el debe del diario va al debe del mayor. Si lo cambia, rompe la partida doble que ya estaba bien.",
    cuentaEquivocada: "❌ Ese valor pertenece a {cuenta}. Lea el asiento del diario de nuevo: la cuenta acreditada es la que va corrida a la derecha.",
    saldoMal: "❌ Sume cada lado de esa cuenta y reste el menor del mayor. Debe: {debito}. Haber: {credito}. Saldo: {saldo} al {lado}.",
    fechaDelTraslado: "❌ En el mayor se anota la fecha que tenía la transacción en el diario, no el día en que usted la traslada. Si no, se pierde el orden cronológico real.",
  },
};

/* ═══════════════════════ CU-12 · El Error Escondido ═══════════════════════ */

export const TIPOS_DE_ERROR = [
  { id: "valor", nombre: "Valor equivocado" },
  { id: "lado", nombre: "Lado equivocado" },
  { id: "cuenta", nombre: "Cuenta equivocada" },
  { id: "falta", nombre: "Falta un registro" },
];

/*
 * Seis errores sembrados sobre el mayor completo de Lavado de Autos. Cada caso
 * dice qué transacción se estropea y cómo, para que el mayor defectuoso se
 * GENERE del bueno: así el «error» siempre es exactamente uno y no puede
 * quedar desincronizado de la respuesta.
 */
export const ERROR_ESCONDIDO = {
  subtema: "Diagnóstico de errores de registro",
  porPartida: 3,
  /* Dentro de cada caso: señalar la cuenta vale 60 %, decir el tipo 40 %. */
  peso: { cuenta: 0.6, tipo: 0.4 },
  casos: [
    { id: "cu12-01", transaccion: "ene-03", cuenta: "Hipoteca por pagar", tipo: "lado",
      siembra: { clase: "invertirLado", cuenta: "Hipoteca por pagar" },
      explicacion: "La hipoteca de $8.000 quedó en el debe. Es un pasivo que nace: nace por el haber." },
    { id: "cu12-02", transaccion: "ene-18", cuenta: "Bancos", tipo: "valor",
      siembra: { clase: "cambiarValor", cuenta: "Bancos", valor: 520 },
      explicacion: "El cheque del 18 de enero fue de $250 y en el mayor figura $520." },
    { id: "cu12-03", transaccion: "ene-04", cuenta: "Muebles y enseres", tipo: "cuenta",
      siembra: { clase: "cambiarCuenta", de: "Flota y equipo de transporte", a: "Muebles y enseres" },
      explicacion: "El camión de $4.800 se registró en Muebles y enseres. Es Flota y equipo de transporte." },
    { id: "cu12-04", transaccion: "ene-26", cuenta: "Caja", tipo: "falta",
      siembra: { clase: "quitarMitad", lado: "haber" },
      explicacion: "Consignar mueve plata de Caja a Bancos. Bancos subió, pero nadie registró que Caja bajó." },
    { id: "cu12-05", transaccion: "ene-25", cuenta: "Caja", tipo: "lado",
      siembra: { clase: "invertirLado", cuenta: "Caja" },
      explicacion: "Los $1.000 de las acciones entraron a Caja: van al debe, no al haber." },
    { id: "cu12-06", transaccion: "ene-30", cuenta: "Hipoteca por pagar", tipo: "valor",
      siembra: { clase: "cambiarValor", cuenta: "Hipoteca por pagar", valor: 40 },
      explicacion: "El pago del 30 de enero fue de $400 y en el mayor figura $40." },
  ],
  aciertoCuenta: "✅ Ahí está. {cuenta} es la que no cuadra.",
  aciertoTipo: "✅ {tipo}. {explicacion}",
  errores: {
    cuentaSana: "❌ Esa cuenta está bien. Pista: cuando el mayor no cuadra, empiece comparando el total del debe contra el total del haber — la diferencia le dice cuánto busca.",
    valorPorLado: "❌ El valor está bien: es exactamente el del diario. Lo que está mal es de qué lado quedó.",
    ladoPorValor: "❌ El lado es el correcto. Compare la cifra contra el diario: no coinciden.",
    faltaPorMalPuesto: "❌ El registro sí está. El problema es que está mal — no que falte. «Falta un registro» es cuando una de las dos mitades del asiento nunca se anotó.",
    consignacion: "❌ Aquí sí falta: consignar mueve plata de Caja a Bancos. Bancos subió, pero nadie registró que Caja bajó. Media transacción no es una transacción.",
  },
};
