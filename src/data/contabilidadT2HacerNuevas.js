import { DEBE, HABER, LAVADO_DE_AUTOS } from "./contabilidad.js";
import { COMPUESTAS_SUELTAS } from "./contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lote T2-2, issue #471).
 *
 *   8.º  cu-cuadra-por-valor        Cuadra por valor        Medio · 25 FP
 *   9.º  cu-del-diario-al-mayor     Del diario al mayor     Medio · 25 FP
 *   10.º cu-las-que-vuelven-a-cero  Las que vuelven a cero  Fácil · 10 FP
 *
 * La forma es la de Watari (c-t2-1-watari-tres-hacer.html) y los ids, el
 * orden, el nivel y los FP los decidió L (c-t2-1-decisiones-l.md §1). Ninguno
 * reusa los cinco ids retirados en la 0043.
 *
 * ESTE ARCHIVO ES UN ESQUELETO. Los bancos de verdad los escribe Near; aquí
 * solo hay casos de muestra para poder montar, probar y medir las piezas. Cada
 * bloque de muestra lleva su marca y la marca va en comentario, nunca en
 * pantalla.
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

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 * Las consignas salen de las maquetas de Watari; las definitivas son de Near.
 */
export const CONSIGNA_T2_NUEVAS = {
  "cu-cuadra-por-valor": "Mira el asiento. Escribe la cifra que falta, di si cuadra o toca la línea que lo descuadra.",
  "cu-del-diario-al-mayor": "Toca la cuenta del mayor donde va el renglón marcado.",
  "cu-las-que-vuelven-a-cero": "Llega el cierre del mes. Elige qué le pasa a la cuenta marcada.",
};

/* ═══════════════════════ 8.º · CUADRA POR VALOR ═══════════════════════ */

/* Una línea del asiento con la forma de Watari: { cuenta, lado, monto }. */
const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, monto]) => ({ cuenta, lado: DEBE, monto })),
  ...asiento.haber.map(([cuenta, monto]) => ({ cuenta, lado: HABER, monto })),
];
const deLavado = (id) => LAVADO_DE_AUTOS.transacciones.find((t) => t.id === id).asiento;
const suelta = (id) => COMPUESTAS_SUELTAS.find((s) => s.id === id).asiento;

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 *
 * Seis casos sobre asientos que ya están en los datos: Lavado ene-03, ene-04 y
 * ene-12, y los dos sueltos de cu10. 3 de completar, 2 de juzgar y 1 de
 * encontrar. De las tres trampas de Watari, la muestra trae dos —el 2 contra 2
 * que no cuadra (cpv-05) y el error en el monto y no en el número de líneas
 * (cpv-05, traspuesto: la diferencia se divide por 9)—; el 3 contra 1 que sí
 * cuadra no está en ningún asiento existente y lo pone Near.
 */
export const CUADRA_POR_VALOR = {
  subtema: FICHAS_T2_NUEVAS[0].subtema,
  porPartida: 6,
  casos: [
    {
      id: "cpv-01", tipo: "completar", fuente: "lavado:ene-04",
      /* La línea sin monto es la que lleva `monto: null`. */
      lineas: lineasDe(deLavado("ene-04")).map((l) => (l.cuenta === "Letras por pagar" ? { ...l, monto: null } : l)),
      correcta: 4000,
      distractores: [{ valor: 4800, retro: "Con $4.800 el haber pasa al debe: sumaste el camión entero a una sola línea del haber." }],
      porque: "El debe suma $4.800; en el haber ya hay $800, así que faltan $4.000.",
    },
    {
      id: "cpv-02", tipo: "completar", fuente: "cu10-socio-vehiculo",
      lineas: lineasDe(suelta("cu10-socio-vehiculo")).map((l) => (l.cuenta === "Aportes sociales" ? { ...l, monto: null } : l)),
      correcta: 3000000,
      distractores: [{ valor: 2000000, retro: "Con $2.000.000 solo cuenta el vehículo: el efectivo también es aporte." }],
      porque: "Dos cuentas en el debe y una en el haber: el haber tiene que llegar a $3.000.000.",
    },
    {
      id: "cpv-03", tipo: "completar", fuente: "lavado:ene-12",
      lineas: lineasDe(deLavado("ene-12")).map((l) => (l.cuenta === "Muebles y enseres" ? { ...l, monto: null } : l)),
      correcta: 2500,
      distractores: [{ valor: 2000, retro: "Con $2.000 el debe se queda corto: también se pagaron $500 con cheque." }],
      porque: "El haber suma $500 + $2.000 = $2.500: eso cuestan los muebles.",
    },
    {
      id: "cpv-04", tipo: "juzgar", fuente: "lavado:ene-03",
      lineas: lineasDe(deLavado("ene-03")),
      cuadra: true,
      porque: "$6.000 + $4.000 en el debe y $2.000 + $8.000 en el haber: $10.000 contra $10.000.",
      retroMala: "Dos cuentas a cada lado y las dos columnas llegan a $10.000: sí cuadra.",
    },
    {
      id: "cpv-05", tipo: "juzgar", fuente: "lavado:ene-04 (monto traspuesto)",
      /* El camión, con 4.800 escrito 8.400: la diferencia, $3.600, se divide por 9. */
      lineas: lineasDe(deLavado("ene-04")).map((l) => (l.cuenta === "Flota y equipo de transporte" ? { ...l, monto: 8400 } : l)),
      cuadra: false,
      porque: "El debe llega a $8.400 y el haber a $4.800. La diferencia, $3.600, se divide por 9: dos cifras cambiadas de lugar.",
      retroMala: "Así, el debe quedaría $3.600 más alto que el haber.",
    },
    {
      id: "cpv-06", tipo: "encontrar", fuente: "cu10-socio-vehiculo (valor al lado contrario)",
      lineas: [
        { cuenta: "Flota y equipo de transporte", lado: DEBE, monto: 2000000 },
        { cuenta: "Caja", lado: HABER, monto: 1000000 },
        { cuenta: "Aportes sociales", lado: HABER, monto: 3000000 },
      ],
      /* Índice de la línea que descuadra. */
      linea: 1,
      porque: "El efectivo entra a Caja: va al debe. En el haber deja $2.000.000 de más.",
      retros: {
        0: "Así, Flota seguiría siendo el vehículo de $2.000.000: esa línea está bien.",
        2: "Así, los aportes del socio dejarían de ser $3.000.000: esa línea está bien.",
      },
    },
  ],
};

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR ═══════════════════════ */

const asientoDeLavado = (id) => {
  const t = LAVADO_DE_AUTOS.transacciones.find((x) => x.id === id);
  return { fecha: t.fecha, lineas: lineasDe(t.asiento) };
};

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 *
 * El caso de Lavado del 2 al 12 de enero (CORTE_SET_A), recortado al tope de
 * Watari: como mucho 4 cuentas y 7 renglones por caso. Del corte salen dos
 * casos que caben: ene-02 + ene-04 (5 renglones, 4 cuentas) y ene-08 + ene-12
 * (5 renglones, 4 cuentas, con Cuentas por pagar dos veces).
 *
 * Los renglones se numeran en el orden del diario (0, 1, 2…). Ítems:
 *   destino  { renglon, porque, retros: { cuenta: texto } }
 *   origen   { renglon, porque, retros: { indiceDeRenglon: texto } }
 * Los de origen van al final: piden un renglón que ya está en el mayor.
 */
export const DEL_DIARIO_AL_MAYOR = {
  subtema: FICHAS_T2_NUEVAS[1].subtema,
  casos: [
    {
      id: "ddm-a",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-02"), asientoDeLavado("ene-04")],
      items: [
        { id: "ddm-a-1", tipo: "destino", renglon: 0, porque: "El depósito entra a Bancos, en su debe." },
        { id: "ddm-a-2", tipo: "destino", renglon: 1, porque: "Las acciones van a su propia cuenta, en el haber." },
        { id: "ddm-a-3", tipo: "destino", renglon: 2, porque: "El camión va a Flota y equipo de transporte." },
        { id: "ddm-a-4", tipo: "destino", renglon: 3, porque: "El cheque sale de Bancos: su haber." },
        { id: "ddm-a-5", tipo: "destino", renglon: 4, porque: "Las letras firmadas van a Letras por pagar." },
        { id: "ddm-a-6", tipo: "origen", renglon: 3, porque: "Los $800 del haber de Bancos son el cheque del camión, el 4 de enero." },
      ],
    },
    {
      id: "ddm-b",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-08"), asientoDeLavado("ene-12")],
      items: [
        { id: "ddm-b-1", tipo: "destino", renglon: 0, porque: "La computadora va a Equipo de computación." },
        { id: "ddm-b-2", tipo: "destino", renglon: 1, porque: "Se debe a crédito: Cuentas por pagar, en el haber." },
        { id: "ddm-b-3", tipo: "destino", renglon: 2, porque: "Los muebles van a Muebles y enseres." },
        { id: "ddm-b-4", tipo: "destino", renglon: 3, porque: "El cheque de $500 sale de Bancos." },
        { id: "ddm-b-5", tipo: "destino", renglon: 4, porque: "El saldo a 90 días también es Cuentas por pagar: ya tiene un movimiento." },
        { id: "ddm-b-6", tipo: "origen", renglon: 1, porque: "Los primeros $2.000 de Cuentas por pagar son la computadora, el 8 de enero." },
      ],
    },
  ],
};

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO ═══════════════════════ */

export const VUELVE_A_CERO = "cero";
export const PASA_CON_SALDO = "pasa";

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 *
 * Siete cuentas: 2 de ingresos, 2 de gastos o costos y 3 reales con una de
 * pasivo, como pide Watari. Entran las trampas de Near (Cuentas por cobrar,
 * Documentos por pagar) y de Mello (lo pagado por anticipado es activo).
 * «Costo de ventas», como en T2. La empresa y las cifras son de muestra.
 * Cada cuenta solo lleva el retro de la opción mala que le corresponde.
 */
export const LAS_QUE_VUELVEN_A_CERO = {
  subtema: FICHAS_T2_NUEVAS[2].subtema,
  caso: {
    empresa: "Lavado de Autos Mateo S.A.",
    mes: "marzo",
    mesSiguiente: "abril",
    cuentas: [
      { id: "lvc-caja", nombre: "Caja", clase: "real", familia: "activo", saldo: 600,
        porque: "Caja es lo que hay: el efectivo sigue ahí el 1 de abril." },
      { id: "lvc-ingresos", nombre: "Ingresos por servicios", clase: "nominal", familia: "ingreso", saldo: 900,
        porque: "Es un ingreso: mide lo que se lavó en marzo y abril empieza en $0." },
      { id: "lvc-cxc", nombre: "Cuentas por cobrar", clase: "real", familia: "activo", saldo: 300,
        porque: "Lo que te deben no se borra con el cierre: es un activo." },
      { id: "lvc-arriendo", nombre: "Gastos por arriendo", clase: "nominal", familia: "gasto", saldo: 200,
        porque: "Es un gasto de marzo: pasa a Ganancias y pérdidas." },
      { id: "lvc-docs", nombre: "Documentos por pagar", clase: "real", familia: "pasivo", saldo: 400,
        porque: "Es una deuda: se sigue debiendo en abril." },
      { id: "lvc-costo", nombre: "Costo de ventas", clase: "nominal", familia: "costo", saldo: 250,
        porque: "Es un costo: mide marzo y vuelve a cero." },
      { id: "lvc-ventas", nombre: "Ingresos por ventas", clase: "nominal", familia: "ingreso", saldo: 350,
        porque: "Es un ingreso: lo vendido en marzo no se vende otra vez en abril." },
    ],
  },
  /* El puente con el desafío. Near escribe el definitivo. */
  textoFinal: "La utilidad del mes pasa al patrimonio. Las cuentas de periodo vuelven a cero; las de lo que hay siguen.",
};
