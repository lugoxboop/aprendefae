/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LOS TEXTOS NUEVOS DE LAS SECUENCIAS DE APRENDER (P1, P3, P4 y P5).
 *
 * Transcritos tal cual de los textos de Miyata, v1, v2 y v3
 * (orquestador/conocimiento/paquetes/e3-t3-secuencias-textos-v1.md, -v2.md y
 * -v3.md, rama docs/e3-t3-secuencias-v3, PR #562), con las condiciones del
 * lote 12 de Takamura y las decisiones de Kamogawa que el paquete ya trae. Lo ya aprobado de cada pieza NO se
 * repite aquí: se importa de su archivo (contabilidadTema3*.js).
 *
 * Se monta contra la columna «Texto clave» de §4 del paquete
 * e3-t3-secuencias-aprender-v3.md (C4 de Takamura), no contra los números:
 * por eso cada texto lleva el nombre de lo que es, no el número de pantalla.
 *
 * El nombre del archivo no empieza por contabilidadTema3: así no entra en la
 * salvaguarda de t3-arma-el-ajuste.test.mjs, que recorre esos archivos.
 *
 * Lo de la v5 (lote 15): las razones del «Siguiente» (D11) y Las Acacias.
 * ⛔ Lo que todavía no llega no se inventa: la consigna de las pantallas de
 * Las Acacias (se pidió en el PR).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ TITULARES (v1 §1 y v2 §1-§2) ═══════════ */
export const TITULARES_P1 = {
  apertura: "Dos líneas que no siempre se mueven juntas",
  aporte: "Los socios ponen plata: ¿qué línea se mueve?",
  servicio: "Un servicio cobrado el mismo día",
  factura: "Una factura que todavía no se cobra",
  maquina: "Una máquina usada que aún no se paga",
  nombres: "Cada marca tiene su nombre",
  inventario: "Compra mercancía y la paga de contado",
  computador: "Vende un computador a su mismo valor",
  cierre: "Cuatro cosas distintas: ingreso, cobro, gasto y pago",
};

export const TITULARES_P3 = {
  apertura: "Cuando el gasto va adelante de la plata",
  dias: "Cinco días con una máquina alquilada",
  caja: "El gasto ya pasó, ¿y la caja?",
  corte: "Llega el cierre del mes",
  ajusteSanCalixto: "El ajuste de San Calixto",
  otroLado: "El mismo hecho, del otro lado",
  ajusteSanMiguel: "El ajuste de San Miguel",
  acumulado: "Esto se llama acumulado",
  cierre: "Un hecho, dos empresas, dos asientos",
};

export const TITULARES_P4 = {
  apertura: "Cuando la plata va adelante del gasto",
  predecir: "Pagar tres meses de arriendo por anticipado",
  yaHuboGasto: "Pagó, pero ¿ya usó el local?",
  queEs: "¿Qué es lo que pagó por anticipado?",
  corte: "El cierre de junio",
  asientoJunio: "El asiento de junio",
  queda: "Lo que queda en el bloque",
  costa: "Arriendos de la Costa recibió la plata",
  asientoCosta: "El asiento de Arriendos de la Costa",
  diferido: "Esto se llama diferido",
  cierre: "Un pago, dos empresas, mes a mes",
};

export const TITULARES_P5 = {
  apertura: "Las cuentas de San Calixto al final de enero",
  separar: "¿Qué cuentas se vacían al cerrar?",
  ordenar: "Primero se ajusta, después se cierra",
  /* v2 §2: reemplaza a «Todo pasa a Ganancias y pérdidas». */
  ingresos: "Los ingresos pasan a Ganancias y pérdidas",
  gastos: "Ahora pasan los gastos",
  saldo: "Lo que queda en Ganancias y pérdidas",
  acaciasIngresos: "Otra empresa, otro mes: Las Acacias",
  acaciasGastos: "Las Acacias: ahora pasan sus gastos",
  perdida: "Cuando los gastos ganan, queda pérdida",
  /* «Cerrar es dejar en cero» y «Lo que la empresa tiene y debe sigue» se retiraron (Takamura, lote 12). */
  cierre: "Febrero empieza limpio",
};

/* ═══════════ OPCIONES (v1 §2) ═══════════ */
/*
 * OPC_PREDICE en 3 botones de 80 × 44 (decisión de Kamogawa, lote 12):
 * «Ninguna» sale junto con su error. Ninguno de los seis hechos la tiene por
 * respuesta; si P1 suma un hecho que no mueva nada, vuelve (E-PRED-6).
 */
export const OPC_PREDICE = [
  { id: "resultados", texto: "Ingresos y gastos" },
  { id: "caja", texto: "Caja" },
  { id: "las-dos", texto: "Las dos" },
];
/* La correcta de cada hecho de P1 (★ de v1 §2). */
export const PREDICE_CORRECTA = {
  aporte: "caja",
  servicio: "las-dos",
  factura: "resultados",
  maquina: "resultados",
  inventario: "caja",
  computador: "caja",
};

export const OPC_P3_1 = [
  { id: "1", texto: "1 día" },
  { id: "4", texto: "4 días" },
  { id: "5", texto: "5 días" },
];
export const OPC_SI_NO = [
  { id: "si", texto: "Sí" },
  { id: "no", texto: "No" },
];
export const OPC_P3_5 = [
  { id: "ingreso", texto: "Ingreso" },
  { id: "gasto", texto: "Gasto" },
];
export const OPC_P4_3 = [
  { id: "tiene", texto: "Algo que tiene" },
  { id: "debe", texto: "Algo que debe" },
  { id: "gasto", texto: "Un gasto" },
];
export const OPC_P4_6 = [
  { id: "5000", texto: "$5.000" },
  { id: "10000", texto: "$10.000" },
  { id: "15000", texto: "$15.000" },
];
export const OPC_P4_7 = [
  { id: "tiene", texto: "Algo que tiene" },
  { id: "debe", texto: "Algo que debe" },
];
export const OPC_P5_2 = [
  { id: "vacia", texto: "Se vacía" },
  { id: "no-vacia", texto: "No se vacía" },
];
export const OPC_P5_3 = { orden: ["Ajustes", "Cierre"] };
export const OPC_P5_6 = [
  { id: "utilidad", texto: "Utilidad de $100.000" },
  { id: "perdida", texto: "Pérdida de $100.000" },
  { id: "nada", texto: "Nada" },
];

/* ═══════════ ERRORES, UNO POR OPCIÓN EQUIVOCADA (v1 §2, del lote 7) ═══════════ */
export const ERRORES_PREDICE = {
  sinVentaNiConsumo: "Aquí no hubo venta ni consumo. Se movió plata, pero la línea de ingresos y gastos se queda quieta.",
  facturaSinPlata: "Aquí todavía no se movió plata. Hubo ingreso por el servicio, pero la caja se queda quieta.",
  maquinaSinPlata: "Aquí todavía no se movió plata. Hubo gasto por usar la máquina, pero la caja se queda quieta.",
  servicioUnaSola: "Se movieron las dos: prestó el servicio y le pagaron ese mismo día.",
  generico: "Solo se mueve una. Pregúntate si hubo venta o consumo, y aparte si se movió plata.",
};

/** El error de OPC_PREDICE para un hecho y una elección (la tabla «Cuándo» de v1 §2). */
export function errorPredice(hecho, eleccion) {
  if (eleccion === PREDICE_CORRECTA[hecho]) return null;
  if (["aporte", "inventario", "computador"].includes(hecho) && ["resultados", "las-dos"].includes(eleccion)) return ERRORES_PREDICE.sinVentaNiConsumo;
  if (hecho === "factura" && ["caja", "las-dos"].includes(eleccion)) return ERRORES_PREDICE.facturaSinPlata;
  if (hecho === "maquina" && ["caja", "las-dos"].includes(eleccion)) return ERRORES_PREDICE.maquinaSinPlata;
  if (hecho === "servicio") return ERRORES_PREDICE.servicioUnaSola;
  return ERRORES_PREDICE.generico;
}

export const ERRORES_P3_1 = {
  1: "Ese es solo el día del cierre. La máquina se usó desde el 27, y cada día de uso es gasto.",
  4: "La máquina se usó el 27, el 28, el 29, el 30 y el 31. Son cinco días de gasto.",
};
export const ERROR_SI_NO_P3 = { si: "Todavía no ha pagado. El gasto ya se causó, pero la caja sigue quieta." };
export const ERROR_SI_NO_P4 = { si: "Todavía no ha usado el local ni un día. Pagó, pero el gasto llega con el uso." };
export const ERRORES_P3_5 = { gasto: "San Miguel no usó la máquina: la prestó. Para ella es un ingreso, aunque no haya cobrado." };
export const ERRORES_P4_3 = {
  debe: "San Calixto pagó: no le debe a nadie. Tiene derecho a tres meses de local.",
  gasto: "Todavía no usa el local. Por ahora esos $15.000 son algo que tiene; se vuelven gasto mes a mes.",
};
export const ERRORES_P4_6 = {
  5000: "Eso es lo que se gastó en junio. En el bloque quedan julio y agosto.",
  15000: "Ya pasó junio y se consumió un mes. El bloque no sigue completo.",
};
export const ERRORES_P4_7 = { tiene: "Recibió la plata, pero aún no ha prestado el local. Le debe a San Calixto tres meses de arriendo." };
export const ERROR_P5_3 = "Primero se ajusta y después se cierra. Si no, el cierre deja fuera un gasto de enero.";
export const ERRORES_P5_6 = {
  utilidad: "Los gastos fueron más que los ingresos. El saldo quedó en el debe: es pérdida, no utilidad.",
  nada: "Los dos totales no son iguales. La diferencia, $100.000, se queda en Ganancias y pérdidas.",
};

/* ═══════════ PISTA DEL PRIMER ERROR (v1 §3; D3 de Takamura) ═══════════ */
export const PISTAS = {
  p1: {
    aporte: "¿La empresa vendió algo cuando los socios pusieron la plata?",
    servicio: "Ese día pasaron dos cosas: el servicio y el pago.",
    factura: "Una factura es un papel. ¿Ya llegó la plata?",
    maquina: "Usar la máquina ya es consumir. ¿Ya salió la plata?",
    nombres: "Arriba se vende y se consume. Abajo entra y sale plata.",
    inventario: "Comprar mercancía no es consumirla. ¿Qué se movió hoy?",
    computador: "Vender computadores no es su negocio. Cambió algo que ya tenía por plata.",
  },
  p3: {
    dias: "Cuenta cada día que la máquina estuvo en uso, del 27 al 31.",
    caja: "¿San Calixto ya le entregó plata a San Miguel?",
    corte: "El cierre es el último día del mes.",
    ajusteSanCalixto: "Piensa en dos cosas: qué consumió y qué quedó debiendo.",
    otroLado: "San Miguel no usó la máquina: se la entregó a otro.",
    ajusteSanMiguel: "Mira el hecho desde San Miguel: ¿qué ganó y qué le falta recibir?",
  },
  p4: {
    predecir: "Pagó hoy, pero todavía no ha usado el local.",
    yaHuboGasto: "El gasto llega con el uso. ¿Cuántos días de local ha usado?",
    queEs: "Piensa qué le dan a cambio de esos $15.000, y cuándo.",
    corte: "El cierre es el último día de junio.",
    asientoJunio: "Se usó un mes de los tres. Eso es lo que pasa al gasto.",
    queda: "Eran tres meses de $5.000, y ya se usó uno.",
    costa: "Recibió la plata, pero todavía tiene que entregar el local.",
    asientoCosta: "Lo que se va cumpliendo se vuelve ingreso.",
  },
  p5: {
    separar: "Se vacían las cuentas que solo miden el mes. Las demás siguen.",
    ordenar: "Antes de cerrar, todo lo del mes tiene que estar anotado.",
    pasar: "Pasan las que se vacían: las de ingresos y las de gastos.",
    saldo: "Resta los gastos de los ingresos.",
    acacias: "Mira de qué lado quedó el saldo de Ganancias y pérdidas.",
  },
};

/* ═══════════ P5-2: LOS 5 PASOS (v1 §4; D2 de Takamura) ═══════════ */
export const PASOS_P5_2 = [
  { cuenta: "Ingresos por servicios", saldo: 14800, respuesta: "vacia", error: "Ingresos por servicios cuenta lo que se vendió en enero. Al cerrar, queda en cero." },
  { cuenta: "Gasto alquiler", saldo: 2500, respuesta: "vacia", error: "Gasto alquiler cuenta lo que se consumió en enero. Al cerrar, queda en cero." },
  { cuenta: "Alquiler por pagar", saldo: 2500, respuesta: "no-vacia", error: "Alquiler por pagar es una deuda: sigue hasta que se pague. Lo que se vacía es el gasto." },
  { cuenta: "Caja", saldo: 14650, respuesta: "no-vacia", error: "Caja no se vacía: lo que la empresa tiene sigue al mes siguiente." },
  { cuenta: "Aportes sociales", saldo: 20000, respuesta: "no-vacia", error: "Aportes sociales no se vacía: es lo que pusieron los socios, y sigue al mes siguiente." },
];
/* Ya ubicadas desde la Apertura, sin paso (v1 §4). */
export const YA_PUESTAS_P5_2 = {
  vacia: ["Gasto arriendos", "Gasto salarios", "Gasto materiales de consumo", "Gasto servicios públicos"],
  "no-vacia": ["Cuentas por cobrar – clientes", "Equipo de computación"],
};

/*
 * ═══════════ LAS CITAS DEL LIBRO (paquete v3, §3, lote 12) ═══════════
 *
 * P5-4, paso 3: solo la primera oración de la cita de la p. 123 (Miyata,
 * opción a). Es una oración completa: no queda cortada ni lleva «…».
 */
export const CITA_P5_123 = "«Cerrar una cuenta significa reducir su saldo a cero.» (p. 123)";
/* En los pasos de cita, el apoyo solo dice esto (tarjeta de cita de Itagaki). */
export const APOYO_CITA = "Así lo dice el libro";

/*
 * ═══════════ LAS CUENTAS CANDIDATAS DE LOS CUATRO ASIENTOS (v3 §1) ═══════════
 *
 * Claves por contenido (C7 de Takamura, lote 13): `CUENTAS_P4_6` y `OPC_P4_6`
 * apuntaban a pantallas distintas. En los textos v3 conservan el nombre viejo
 * (CUENTAS_P3_5, _P3_7, _P4_6 y _P4_9): es el mismo contenido.
 *
 *   lado    "debe" | "haber" | null (no va)
 *   error   el de esa cuenta; las dos del par comparten el de «al revés»
 *
 * Takamura las revisa en el lote 13.
 */
const asiento = (debe, haber, alReves, noVan) => ({
  alReves,
  candidatas: [
    { cuenta: debe, lado: "debe", error: alReves },
    { cuenta: haber, lado: "haber", error: alReves },
    ...noVan.map(([cuenta, error]) => ({ cuenta, lado: null, error })),
  ],
});

export const CUENTAS_ASIENTO_P3_SANCALIXTO = asiento(
  "Gasto alquiler", "Alquiler por pagar",
  "Va al revés. El gasto crece por el debe y la deuda por el haber.",
  [
    ["Caja", "Todavía no ha pagado. La caja no se mueve: lo que nace es una deuda."],
    ["Servicios por cobrar", "Esa cuenta es de San Miguel, que prestó la máquina. San Calixto la usó: no le deben, él debe."],
  ],
);
export const CUENTAS_ASIENTO_P3_SANMIGUEL = asiento(
  "Servicios por cobrar", "Ingresos por servicios",
  "Va al revés. Lo que le deben crece por el debe y el ingreso por el haber.",
  [
    ["Caja", "San Miguel todavía no ha cobrado. Lo que tiene es una cuenta por cobrar, no plata."],
    ["Alquiler por pagar", "Esa deuda es de San Calixto, que usó la máquina. A San Miguel le deben: no debe nada."],
  ],
);
export const CUENTAS_ASIENTO_P4_JUNIO = asiento(
  "Gasto arriendos", "Arriendos pagados por anticipado",
  "Va al revés. El gasto entra por el debe y lo pagado por anticipado sale por el haber.",
  [
    ["Caja", "La plata salió el 1 de junio. Al cierre no sale nada: se consume lo ya pagado."],
    ["Arriendos por pagar", "San Calixto no debe el arriendo: ya lo pagó. Lo que baja es lo pagado por anticipado."],
  ],
);
/* El pie del asiento de junio (regla C1: el libro escribe «Gastos arriendos»). */
export const PIE_ASIENTO_P4_JUNIO = "Basado en el libro, p. 144";
export const CUENTAS_ASIENTO_P4_COSTA = asiento(
  "Arriendos recibidos por anticipado", "Ingresos por arriendos",
  "Va al revés. Lo recibido por anticipado baja por el debe y el ingreso crece por el haber.",
  [
    ["Caja", "La plata entró el 1 de junio. Al cierre no entra nada: se cumple un mes de lo ya cobrado."],
    ["Arriendos por cobrar", "Nadie le debe a Arriendos de la Costa: ya cobró los tres meses. Lo que baja es lo recibido por anticipado."],
  ],
);

/*
 * ═══════════ D11: POR QUÉ «SIGUIENTE» ESPERA EN UN HAZ (textos v5 §2) ═══════════
 *
 * Miyata, lote 15 (e3-t3-secuencias-textos-v5.md, PR #578). Se montan contra
 * la columna «Cuándo se ve», por tipo de decisión, no contra los números.
 * RAZON_HAZ_T3 es la genérica (opción única) y deja de ser null.
 */
export const RAZONES_HAZ_T3 = {
  eleccion: "Cuando respondas, se abre «Siguiente».",
  asiento: "Cuando pongas las dos cuentas, se abre «Siguiente».",
  ubicar: "Quedan fichas por ubicar.",
  cifra: "Cuando escribas la cifra, se abre «Siguiente».",
  corte: "Cuando pongas el corte, se abre «Siguiente».",
  ordenar: "Cuando ordenes los dos pasos, se abre «Siguiente».",
};
export const RAZON_HAZ_T3 = RAZONES_HAZ_T3.eleccion;

/*
 * ═══════════ LAS ACACIAS: CUENTAS Y SALDOS (textos v5 §1) ═══════════
 *
 * No sale del libro: es un escenario simulado de Miyata (lote 2, ajustado en
 * el lote 4 y en el 15). Por eso su primer renglón es «Escenario simulado».
 * Ingresos 3.200.000 − gastos 3.300.000 = pérdida de 100.000, en el debe.
 */
export const ESCENARIO_SIMULADO = "Escenario simulado";
export const LAS_ACACIAS = {
  nombre: "Floristería Las Acacias",
  periodo: "cierre de febrero",
  ingresos: [
    { cuenta: "Ingresos por servicios", saldo: 3000000 },
    { cuenta: "Ingresos varios", saldo: 200000 },
  ],
  gastos: [
    { cuenta: "Gasto salarios", saldo: 2100000 },
    { cuenta: "Gasto servicios públicos", saldo: 450000 },
    { cuenta: "Gasto mantenimiento", saldo: 380000 },
    { cuenta: "Gasto papelería", saldo: 120000 },
    { cuenta: "Gasto materiales e insumos", saldo: 250000 },
  ],
  /* Las que no se vacían: van en las dos pantallas como candidatas que no pasan. */
  siguen: [
    { cuenta: "Caja", saldo: 900000 },
    { cuenta: "Cuentas por cobrar – clientes", saldo: 600000 },
    { cuenta: "Aportes sociales", saldo: 1600000 },
  ],
};
