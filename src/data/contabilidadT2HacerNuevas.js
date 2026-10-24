import { DEBE, HABER, LAVADO_DE_AUTOS } from "./contabilidad.js";
import { COMPUESTAS_SUELTAS } from "./contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lotes T2-2 y T2-3, issue #471).
 *
 *   8.º  cu-cuadra-por-valor        Cuadra por valor        Medio · 25 FP
 *   9.º  cu-del-diario-al-mayor     Del diario al mayor     Medio · 25 FP
 *   10.º cu-las-que-vuelven-a-cero  Las que vuelven a cero  Fácil · 10 FP
 *
 * La forma es la de Watari (c-t2-1-watari-tres-hacer.html) y los ids, el
 * orden, el nivel y los FP los decidió L (c-t2-1-decisiones-l.md §1). Ninguno
 * reusa los cinco ids retirados en la 0043.
 *
 * LOS BANCOS SON LOS DE NEAR (c-t2-2-near-lote.md §1), LETRA POR LETRA. Lo
 * comprueba t2-tres-hacer-nuevas.test.mjs leyendo el paquete. Lo único que
 * no es de Near lleva la marca de muestra en comentario, nunca en pantalla:
 *   - el porqué de los ítems de origen de «Del diario al mayor» (Near no lo trae);
 *   - el pie de fuente de cada caso de «Cuadra por valor» (Near da la fuente, no la frase);
 *   - la consigna de «Las que vuelven a cero» en «Así se juega» (la de Near lleva {cuenta}).
 * Y un texto de Near queda pendiente de su delta del lote T2-3: el porqué de
 * «Seguros pagados por anticipado» (ver allí).
 *
 * Las tres van `pendiente: true` en subjects.js hasta que corra la 0116.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const IDS_T2_NUEVAS = ["cu-cuadra-por-valor", "cu-del-diario-al-mayor", "cu-las-que-vuelven-a-cero"];

/* La ficha de cada una, con la forma de ACTIVIDADES (contabilidadActividades.js). */
export const FICHAS_T2_NUEVAS = [
  { id: "cu-cuadra-por-valor", nombre: "Cuadra por valor", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Partida doble: igualdad del debe y el haber" },
  { id: "cu-del-diario-al-mayor", nombre: "Del diario al mayor", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Libro mayor y mayorización" },
  /* [regla] por `clase`: el subtema de cada ítem sale de SUBTEMA_POR_CLASE. */
  { id: "cu-las-que-vuelven-a-cero", nombre: "Las que vuelven a cero", bloque: "CIMIENTOS",
    dificultad: "facil", fpBase: 10, subtema: "Clasificación de cuentas nominales" },
];

export const SUBTEMA_POR_CLASE = {
  real: "Clasificación de cuentas reales",
  nominal: "Clasificación de cuentas nominales",
};

/* El objetivo (H1) de cada una: Near, §1.1, §1.2 y §1.3. */
export const OBJETIVO_T2_NUEVAS = {
  "cu-cuadra-por-valor": "Al terminar, sabrás comprobar que un asiento cuadra por el valor de sus dos lados, no por el número de cuentas.",
  "cu-del-diario-al-mayor": "Al terminar, sabrás llevar cada renglón del diario a su cuenta del mayor, y encontrar de dónde salió.",
  "cu-las-que-vuelven-a-cero": "Al terminar, sabrás qué cuentas vuelven a cero en el cierre y cuáles pasan al año siguiente con su saldo.",
};

/* Las consignas de Near, por tipo de ítem. La de «Las que vuelven a cero» lleva la cuenta. */
export const CONSIGNAS_CUADRA = {
  completar: "Escribe el valor que hace que el debe y el haber sumen lo mismo.",
  juzgar: "¿Este asiento cuadra?",
  encontrar: "Toca el renglón que descuadra el asiento.",
};
export const CONSIGNAS_DIARIO = {
  destino: "Toca la cuenta del mayor donde va el renglón marcado.",
  origen: "Toca el renglón del diario de donde salió esta línea del mayor.",
};
export const CONSIGNA_CERO = "Llega el cierre de 20X1. ¿Qué pasa con {cuenta}?";
export const consignaCero = (cuenta) => CONSIGNA_CERO.replace("{cuenta}", cuenta.nombre);

/*
 * La consigna que enseña «Así se juega», una por Hacer: la del primer tipo,
 * que es el que juega la demo.
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 * Solo la de «Las que vuelven a cero»: la de Near lleva {cuenta} y la demo no
 * tiene una sola cuenta, así que aquí dice «cada cuenta».
 */
export const CONSIGNA_T2_NUEVAS = {
  "cu-cuadra-por-valor": CONSIGNAS_CUADRA.completar,
  "cu-del-diario-al-mayor": CONSIGNAS_DIARIO.destino,
  "cu-las-que-vuelven-a-cero": CONSIGNA_CERO.replace("{cuenta}", "cada cuenta"),
};

/* ═══════════════════════ 8.º · CUADRA POR VALOR ═══════════════════════ */

/* Una línea del asiento con la forma de Watari: { cuenta, lado, monto }. */
const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, monto]) => ({ cuenta, lado: DEBE, monto })),
  ...asiento.haber.map(([cuenta, monto]) => ({ cuenta, lado: HABER, monto })),
];
const deLavado = (id) => LAVADO_DE_AUTOS.transacciones.find((t) => t.id === id).asiento;
const suelta = (id) => COMPUESTAS_SUELTAS.find((s) => s.id === id).asiento;
const conHueco = (lineas, cuenta) => lineas.map((l) => (l.cuenta === cuenta ? { ...l, monto: null } : l));
const D = (cuenta, monto) => ({ cuenta, lado: DEBE, monto });
const H = (cuenta, monto) => ({ cuenta, lado: HABER, monto });

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 * Solo los pies de fuente (H2). Near da la fuente de cada caso (Lavado, pp.
 * 98-101; cu10 y Caleja, «Basado en el libro», decisión 1 de L en T2-2) pero
 * no la frase del pie; esta copia el formato de T7 («Basado en el libro, p. N»).
 */
const PIE_LAVADO = "Basado en el libro, pp. 98-101";
const PIE_LIBRO = "Basado en el libro";

/*
 * El banco de Near, §1.1: 8 casos, 3 de completar (K), 2 de juzgar (J) y 3 de
 * encontrar (E). Se juegan los 8; el orden se baraja dentro de cada tipo.
 * Trampas de Watari: K3 (3 contra 1 que sí cuadra), J2 (2 contra 2 que no),
 * J2 y E3 (error en el monto). Errores de Mello: traspuesto J2 y E3 (la
 * diferencia se divide por 9), lado contrario E1, omitido J1, duplicado E2.
 *
 *   completar  { lineas (una con monto null), correcta, distractores: [{ valor, retro }], porque }
 *   juzgar     { hecho, lineas, cuadra, porque, retroMala }   retroMala = el retro de «Cuadra»
 *   encontrar  { hecho, lineas, linea: [índices que se aceptan], porque, retros: { índice: texto } }
 */
export const CUADRA_POR_VALOR = {
  subtema: FICHAS_T2_NUEVAS[0].subtema,
  porPartida: 8,
  casos: [
    {
      id: "cpv-k1", tipo: "completar", fuente: "cu10-computador-mitad", pie: PIE_LIBRO,
      lineas: conHueco(lineasDe(suelta("cu10-computador-mitad")), "Cuentas por pagar"),
      correcta: 750000,
      distractores: [
        { valor: 1500000, retro: "Copiaste el total del debe. Así el haber se pasa en $750.000: resta lo que ya pone Caja." },
        { valor: 2250000, retro: "Sumaste Caja en vez de restarla. Así el haber se pasa en $1.500.000." },
      ],
      porque: "El debe suma $1.500.000. En el haber ya hay $750.000 de Caja, así que la deuda es $750.000.",
    },
    {
      id: "cpv-k2", tipo: "completar", fuente: "lavado:ene-12", pie: PIE_LAVADO,
      lineas: conHueco(lineasDe(deLavado("ene-12")), "Bancos"),
      correcta: 500,
      distractores: [
        { valor: 2500, retro: "Copiaste el total del debe. Así el haber se pasa en $2.000: resta lo que ya pone Cuentas por pagar." },
        { valor: 4500, retro: "Sumaste Cuentas por pagar en vez de restarla. Así el haber se pasa en $4.000." },
      ],
      porque: "El debe suma $2.500. En el haber ya hay $2.000 de Cuentas por pagar, así que Bancos es $500.",
    },
    {
      /* Trampa 3 contra 1. Une los aportes de Lavado del 2 y del 25 de enero; el Equipo de computación es construido. */
      id: "cpv-k3", tipo: "completar", fuente: "lavado:ene-02+ene-25 (construido)", pie: PIE_LIBRO,
      lineas: [D("Bancos", 5000), D("Caja", 1000), D("Equipo de computación", 2000), H("Acciones", null)],
      correcta: 8000,
      distractores: [
        { valor: 5000, retro: "Igualaste línea con línea. Así el haber se queda corto en $3.000: suma las tres cuentas del debe." },
        { valor: 6000, retro: "Sumaste solo dos cuentas del debe. Así el haber se queda corto en $2.000." },
      ],
      porque: "Tres cuentas contra una, y cuadra. El debe suma $8.000, así que Acciones es $8.000.",
    },
    {
      /* Omitido: falta la línea de Caja de cu10-socio-vehiculo. */
      id: "cpv-j1", tipo: "juzgar", fuente: "cu10-socio-vehiculo (omitido)", pie: PIE_LIBRO,
      hecho: "Un socio aporta un vehículo de $2.000.000 y $1.000.000 en efectivo.",
      lineas: [D("Flota y equipo de transporte", 2000000), H("Aportes sociales", 3000000)],
      cuadra: false,
      porque: "Falta un renglón. La diferencia es $1.000.000, justo el efectivo que aportó el socio y nadie anotó.",
      retroMala: "Una cuenta contra una parece pareja. Pero el debe suma $2.000.000 y el haber, $3.000.000.",
    },
    {
      /* 2 contra 2 + traspuesto. Caleja cal-2 y cal-3 en un asiento; lo construido es el 52.000. */
      id: "cpv-j2", tipo: "juzgar", fuente: "caleja:cal-2+cal-3 (traspuesto)", pie: PIE_LIBRO,
      hecho: "Caleja compra a crédito un computador por $25.000 y maquinaria por $50.000 con un préstamo bancario",
      lineas: [D("Equipo de computación", 52000), D("Maquinaria", 50000), H("Cuentas por pagar", 25000), H("Obligaciones financieras", 50000)],
      cuadra: false,
      porque: "La diferencia es $27.000, y se divide justo por 9. Es la señal de dos cifras invertidas: 52.000 por 25.000.",
      retroMala: "Dos contra dos parece parejo. Pero el debe suma $102.000 y el haber, $75.000.",
    },
    {
      /* Lado contrario: Bancos en el debe. */
      id: "cpv-e1", tipo: "encontrar", fuente: "lavado:ene-04 (lado contrario)", pie: PIE_LAVADO,
      hecho: "Compra un vehículo de $4.800: paga $800 desde Bancos y firma letras por $4.000.",
      lineas: [D("Flota y equipo de transporte", 4800), D("Bancos", 800), H("Letras por pagar", 4000)],
      linea: [1],
      porque: "Bancos pagó, así que baja y va al haber. En el debe deja $1.600 de más, el doble de $800.",
      retros: {
        0: "Flota sí va en el debe: es lo que compraste. El que sobra en el debe es el pago.",
        2: "Letras por pagar está bien: la deuda nueva va al haber. Mira el pago desde Bancos.",
      },
    },
    {
      /* Duplicado: se acepta cualquiera de las dos de Local comercial. */
      id: "cpv-e2", tipo: "encontrar", fuente: "caleja:cal-5 (duplicado)", pie: PIE_LIBRO,
      hecho: "Los socios aportan un local comercial de $100.000.",
      lineas: [D("Local comercial", 100000), D("Local comercial", 100000), H("Aportes sociales", 100000)],
      linea: [0, 1],
      porque: "Local comercial está dos veces. La diferencia es igual a un renglón: es la señal de un duplicado.",
      retros: {
        2: "Aportes sociales está bien. Lo que sobra es un renglón repetido: busca la cuenta que aparece dos veces.",
      },
    },
    {
      /* Traspuesto: 250 escrito 520. */
      id: "cpv-e3", tipo: "encontrar", fuente: "lavado:ene-18 (traspuesto)", pie: PIE_LAVADO,
      hecho: "Paga $250 de Cuentas por pagar desde Bancos.",
      lineas: [D("Cuentas por pagar", 250), H("Bancos", 520)],
      linea: [1],
      porque: "Bancos dice $520 y el pago fue de $250. La diferencia, $270, se divide por 9: son cifras invertidas.",
      retros: {
        0: "Cuentas por pagar tiene los $250 del pago. La cifra que no coincide con el hecho es la de Bancos.",
      },
    },
  ],
};

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR ═══════════════════════ */

const asientoDeLavado = (id) => {
  const t = LAVADO_DE_AUTOS.transacciones.find((x) => x.id === id);
  return { fecha: t.fecha, lineas: lineasDe(t.asiento) };
};

/* El porqué del acierto en destino, uno para todos (Near). */
export const PORQUE_DESTINO = "En el diario, este valor es de esta cuenta. El mayor lo guarda en su T, del mismo lado.";

/*
 * Los retros salen de una regla (Near): cada cuenta o renglón malo lleva la
 * letra de su plantilla y el nombre se pone al jugar.
 *   destino  A otra cuenta del mismo asiento · B una cuenta que no está en ese
 *            asiento · C una cuenta con la misma cifra
 *   origen   oA la misma cuenta en otra fecha · oB el mismo día y otra cuenta ·
 *            oC la misma cifra y otra cuenta · oD ni la cuenta ni la fecha
 * {cuenta} es la cuenta tocada (o la del renglón tocado), {fecha} la del
 * renglón tocado («8 de enero») y {cuenta del mayor} la de la línea encendida.
 */
export const PLANTILLAS_DIARIO = {
  A: "Así, {cuenta} se queda con un renglón de su vecino de asiento. El mayor junta por cuenta, no por fecha.",
  B: "Así, {cuenta} tendría un valor de un asiento donde no aparece.",
  C: "Así, {cuenta} se queda con un valor solo porque la cifra es igual. Busca la cuenta, no el número.",
  oA: "Ese renglón es de {cuenta}, pero del {fecha}. Mira la fecha de la línea del mayor.",
  oB: "Ese renglón es del mismo día, pero de {cuenta}. La línea del mayor es de {cuenta del mayor}.",
  oC: "Tiene la misma cifra, pero es de {cuenta}. Busca la cuenta, no solo el valor.",
  oD: "Ese renglón es de {cuenta}, del {fecha}: no coinciden ni la cuenta ni la fecha.",
};

const FLOTA = "Flota y equipo de transporte";
const LETRAS = "Letras por pagar";
const EQUIPO = "Equipo de computación";
const CXP = "Cuentas por pagar";
const MUEBLES = "Muebles y enseres";

/*
 * El caso de Lavado del 2 al 12 de enero (CORTE_SET_A), recortado al tope de
 * Watari (4 cuentas y 7 renglones): dos casos de Near, cada uno con 5 destino
 * y 2 origen. Cada partida juega uno y se alternan por intento (D8).
 *
 * Los renglones se cuentan desde 0 en el orden del diario; Near los cuenta
 * desde 1 (su r4 es nuestro renglón 3).
 *   destino  { renglon, retros: { cuenta: plantilla } }
 *   origen   { renglon, porque, retros: { índice de renglón: plantilla } }
 * Los destino van en orden de fecha; los origen, al final y barajados.
 *
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 * Solo el `porque` de los ítems de origen: Near da el porqué de destino («uno
 * para todos») y no trae el de origen.
 */
export const DEL_DIARIO_AL_MAYOR = {
  subtema: FICHAS_T2_NUEVAS[1].subtema,
  casos: [
    {
      id: "ddm-a",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-02"), asientoDeLavado("ene-04")],
      cierre: "El diario suma $9.800 en el debe y $9.800 en el haber. El mayor suma lo mismo: son los mismos datos.",
      items: [
        { id: "ddm-a-1", tipo: "destino", renglon: 0, retros: { Acciones: "C", [FLOTA]: "B", [LETRAS]: "B" } },
        { id: "ddm-a-2", tipo: "destino", renglon: 1, retros: { Bancos: "C", [FLOTA]: "B", [LETRAS]: "B" } },
        { id: "ddm-a-3", tipo: "destino", renglon: 2, retros: { Bancos: "A", [LETRAS]: "A", Acciones: "B" } },
        { id: "ddm-a-4", tipo: "destino", renglon: 3, retros: { [FLOTA]: "A", [LETRAS]: "A", Acciones: "B" } },
        { id: "ddm-a-5", tipo: "destino", renglon: 4, retros: { [FLOTA]: "A", Bancos: "A", Acciones: "B" } },
        { id: "ddm-a-6", tipo: "origen", renglon: 3, retros: { 0: "oA", 2: "oB", 4: "oB", 1: "oD" },
          porque: "Los $800 del haber de Bancos son el pago del vehículo, el 4 de enero." },
        { id: "ddm-a-7", tipo: "origen", renglon: 0, retros: { 1: "oC", 3: "oA", 2: "oD", 4: "oD" },
          porque: "Los $5.000 del debe de Bancos son el depósito del 2 de enero." },
      ],
    },
    {
      id: "ddm-b",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-08"), asientoDeLavado("ene-12")],
      cierre: "El diario suma $4.500 en el debe y $4.500 en el haber. El mayor suma lo mismo: son los mismos datos.",
      items: [
        { id: "ddm-b-1", tipo: "destino", renglon: 0, retros: { [CXP]: "A", [MUEBLES]: "B", Bancos: "B" } },
        { id: "ddm-b-2", tipo: "destino", renglon: 1, retros: { [EQUIPO]: "A", [MUEBLES]: "B", Bancos: "B" } },
        { id: "ddm-b-3", tipo: "destino", renglon: 2, retros: { Bancos: "A", [CXP]: "A", [EQUIPO]: "B" } },
        { id: "ddm-b-4", tipo: "destino", renglon: 3, retros: { [MUEBLES]: "A", [CXP]: "A", [EQUIPO]: "B" } },
        { id: "ddm-b-5", tipo: "destino", renglon: 4, retros: { [MUEBLES]: "A", Bancos: "A", [EQUIPO]: "C" } },
        { id: "ddm-b-6", tipo: "origen", renglon: 4, retros: { 1: "oA", 0: "oC", 2: "oB", 3: "oB" },
          porque: "Los $2.000 de Cuentas por pagar del 12 de enero son el saldo de los muebles." },
        { id: "ddm-b-7", tipo: "origen", renglon: 3, retros: { 2: "oB", 4: "oB", 0: "oD", 1: "oD" },
          porque: "Los $500 del haber de Bancos son el pago de los muebles, el 12 de enero." },
      ],
    },
  ],
};

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO ═══════════════════════ */

export const VUELVE_A_CERO = "cero";
export const PASA_CON_SALDO = "pasa";

/* Las dos opciones de Near (binaria) y la ceja de cada pantalla. */
export const OPCIONES_CERO = {
  [VUELVE_A_CERO]: "Vuelve a cero en el cierre",
  [PASA_CON_SALDO]: "Pasa al año siguiente con su saldo",
};
export const ROTULO_CERO = "Escenario simulado";

/*
 * El banco de Near, §1.3: cierre de año, no de mes (decisión de Near que L
 * aceptó). 8 cuentas: 2 ingresos, 1 gasto, 1 costo y 4 reales con un pasivo.
 * Cada cuenta lleva su porqué y solo el retro de la opción mala que le toca
 * (`retroMala`); la familia se nombra en el retro.
 * Trampas: Cuentas por cobrar y Documentos por pagar (Near); lo pagado por
 * anticipado es activo y un cobro es Caja (Mello). «Costo de ventas», como en T2.
 */
export const LAS_QUE_VUELVEN_A_CERO = {
  subtema: FICHAS_T2_NUEVAS[2].subtema,
  caso: {
    empresa: "Lavado de Autos Mateo S.A.",
    anio: "20X1",
    anioSiguiente: "20X2",
    mes: "diciembre de 20X1",
    mesSiguiente: "enero de 20X2",
    cuentas: [
      { id: "lvc-ingresos-servicios", nombre: "Ingresos por servicios", clase: "nominal", familia: "ingreso", saldo: 12000,
        porque: "Es un ingreso: mide lo que la empresa ganó en el año. Al cierre, su saldo pasa a Ganancias y pérdidas.",
        retroMala: "Así, 20X2 empezaría con ingresos que hizo 20X1. Es un ingreso, y se cierra." },
      { id: "lvc-cuentas-por-cobrar", nombre: "Cuentas por cobrar", clase: "real", familia: "activo", saldo: 3000,
        porque: "Es lo que los clientes te deben. Esa plata sigue por cobrar el 1 de enero.",
        retroMala: "Así, los clientes dejarían de deberte el 1 de enero. Es un activo, y su saldo pasa." },
      { id: "lvc-gastos-operacion", nombre: "Gastos de operación", clase: "nominal", familia: "gasto", saldo: 5000,
        porque: "Es un gasto del año. Se cierra aunque haya tenido muchos movimientos.",
        retroMala: "Que se mueva mucho no la deja abierta. Es un gasto: mide el año y vuelve a cero." },
      { id: "lvc-documentos-por-pagar", nombre: "Documentos por pagar", clase: "real", familia: "pasivo", saldo: 2500,
        porque: "Es una deuda firmada. La deuda no se borra con el cierre: sigue en 20X2.",
        retroMala: "Así, la deuda desaparecería con el cierre. Es un pasivo, y su saldo pasa." },
      { id: "lvc-ingresos-ventas", nombre: "Ingresos por ventas", clase: "nominal", familia: "ingreso", saldo: 8000,
        porque: "Es un ingreso del año. Su saldo se va a Ganancias y pérdidas y la cuenta queda en $0.",
        retroMala: "Así, las ventas de 20X1 se sumarían a las de 20X2. Un ingreso mide un solo año." },
      /*
       * El nombre es el de L (T2-2, hueco 2): Near escribió «Gastos pagados por
       * anticipado». Los textos son los de Near, letra por letra; el porqué
       * empieza «Su nombre dice gastos», que con el nombre nuevo ya no es
       * cierto. PENDIENTE del delta de Near del lote T2-3.
       */
      { id: "lvc-seguros-anticipado", nombre: "Seguros pagados por anticipado", clase: "real", familia: "activo", saldo: 1200,
        porque: "Su nombre dice gastos, pero es un activo: un servicio que ya pagaste y aún no usas. Sigue el 1 de enero.",
        retroMala: "Así, perderías un servicio que ya pagaste y aún no usas. Es un activo, no un gasto." },
      { id: "lvc-costo-ventas", nombre: "Costo de ventas", clase: "nominal", familia: "costo", saldo: 4500,
        porque: "Es un costo: lo que costó lo que se vendió en el año. Se cierra como los gastos.",
        retroMala: "Así, 20X2 cargaría con lo que costó vender en 20X1. Es un costo, y se cierra." },
      { id: "lvc-caja", nombre: "Caja", clase: "real", familia: "activo", saldo: 6000,
        porque: "Es el dinero que hay en la caja, también el que cobraste. Cobrar no es un ingreso: es Caja, y su saldo pasa.",
        retroMala: "Así, en 20X2 Caja diría $0, y el dinero sigue ahí. Lo cobrado es Caja, no un ingreso." },
    ],
  },
  /* El puente con el desafío (Near). Ingresos $20.000 − gastos y costos $9.500 = $10.500. */
  textoFinal: "El cierre deja la utilidad del año, $10.500, lista para pasar al patrimonio. Con eso empieza El Ciclo Completo.",
};
