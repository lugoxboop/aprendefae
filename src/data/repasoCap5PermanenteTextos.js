import { pesos } from "./contabilidad.js";
import { CAJA, COMPRAS, CLIENTES, DEVOLUCIONES, INGRESOS, INVENTARIO, ROTULOS_MATE, COMUNES_MATE, DATOS_DECLARADOS as DECLARADOS_MATE } from "./repasoCap5MateTextos.js";
import { CLAVES, EQUIVOCADAS as E, INGRESO_P2, INGRESO_P3, habriaSido, unitarioEnLibro } from "./repasoCap5Permanente.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-5 «Septiembre en permanente» — LOS TEXTOS
 * (Célula E).
 *
 * Fuente de verdad: orquestador/conocimiento/paquetes/e5-r5-5-v1.md (v1.3:
 * contenido de Miyata, ajustes de Kamogawa y Takamura; las «Decisiones v1.3»
 * mandan sobre el diseño de Itagaki). Todo texto va LITERAL. Las cifras que se
 * califican salen de repasoCap5Permanente.js: ninguna se copia a mano.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CMV = "Costo de mercancía vendida";
export { CAJA, COMPRAS, CLIENTES, DEVOLUCIONES, INGRESOS, INVENTARIO };

/* La hoja de las pantallas 2 y 3: siete cuentas, en este orden literal (v1.1 §3). */
export const HOJA_PERMANENTE = [CAJA, COMPRAS, CMV, CLIENTES, DEVOLUCIONES, INGRESOS, INVENTARIO];

export const R5_5 = {
  id: "r5-5",
  nombre: "Septiembre en permanente",
  /* Kamogawa: Difícil · 50 FP, cinco pantallas, una calificación cada una, 10 FP cada una, sin mitades. */
  dificultad: "dificil",
  fpBase: 50,
  modalidad: "evaluativa",
  objetivo: "Lleva el kárdex de un mes en permanente y entiende por qué su costo no da igual que en periódico.",
};

/* La regla común y la genérica de cuenta (la misma de r5-3 y r5-4). */
export const COMUNES_PERMANENTE = {
  cuentaNoPrevista: COMUNES_MATE.cuentaNoPrevista,
  hayMas: "Y hay más por revisar.",
};

/* ═══════════ LA ENTRADA (v1.3, decisión 1: la de r5-4 §2, sin línea del mes ni aviso) ═══════════ */

export const ENTRADA_PERMANENTE = {
  marca: "ANTES DE EMPEZAR",
  titulo: "Septiembre en permanente",
  apertura: "Volvemos a la empresa de Barranquilla. Ahora usa el permanente: cada compra y cada venta pasa por el kárdex.",
  instruccion: "Cómo se escriben las cifras: costo por unidad con dos decimales; totales, al peso.",
  empezar: "Empezar",
};

export const DATOS_DEL_LIBRO_PERMANENTE = [
  {
    /* La marca es mía: el paquete dice «Del libro:». */
    marca: "DEL LIBRO",
    frases: ["Al empezar: 1.950 unidades a $2.000.", "Valora con promedio ponderado (en permanente, móvil)."],
  },
];

export const DATOS_DECLARADOS_PERMANENTE = {
  ...DECLARADOS_MATE,
  datos: [
    "No hay IVA ni retención.",
    "Lo devuelto al proveedor sale a $2.185: te devuelve la factura; el flete ya pagado se queda en la bodega.",
    "El periódico promedia todo el mes, con fletes.",
  ],
};

/* ═══════════ LOS RÓTULOS FIJOS (diseño v1, ya decididos; v1.3) ═══════════ */

export const ROTULOS_PERMANENTE = {
  ...ROTULOS_MATE,
  /* §4.3: «Movimiento n de 5»; el mismo sustantivo en el botón de avance. */
  sustantivo: "Movimiento",
  progreso: (n, m) => `Movimiento ${n} de ${m}`,
  cant: "CANT.",
  cUnit: "C. UNIT.",
  total: "TOTAL",
  entrada: "ENTRADA",
  salida: "SALIDA",
  saldo: "SALDO",
  declarado: "DECLARADO",
  aLaCompra: "A LA COMPRA",
  alGasto: "AL GASTO",
  costoUnitario: "COSTO UNITARIO",
  costoTotal: "COSTO TOTAL",
  nuevoPromedio: "NUEVO COSTO PROMEDIO",
  costoDeLas: "COSTO DE LAS 6.100",
  inventario: "INVENTARIO DE MERCANCÍAS",
  unidades: "Unidades",
  valorBarra: "Valor",
  vendidoEnElMes: "COSTO DE LO VENDIDO EN EL MES",
  periodico: "PERIÓDICO",
  permanente: "PERMANENTE",
  verSuCosto: "Ver su costo",
  comaSola: "La coma se pone sola.",
  yaRegistrado: "YA REGISTRADO",
  pendiente: "pendiente",
  /* Lo que el diseño nombra y el paquete no escribe (decisiones mías). */
  revisar: "Comprobar",
  revisarValores: "Comprobar",
  revisarAsiento: "Comprobar",
  unidadesCorto: (n) => `${n} u`,
};

/* v1.3, decisión 3: la red de la coma (INFLESZ 66,4). */
export const AVISO_COMA = "Revisa la coma: los dos últimos dígitos son centavos. Si querías pesos enteros, añade 00 al final.";

/* La línea de «lo que habría sido» (pantalla 3), con la cifra que calcula Ippo. */
export const lineaHabriaSido = (unitario) => `Así quedaba con tu valor: ${pesos(habriaSido(unitario)).replace("$", "")}`;

/* ═══════════ LAS FILAS DEL KÁRDEX: sus detalles (≤ 20; la fecha va aparte) ═══════════ */

export const DETALLES = {
  inicial: "Saldo inicial",
  c2: "Compra con flete",
  d8: "Vuelve al proveedor",
  v10: "Venta a crédito",
  d15: "Vuelve del cliente",
  c25: "Lote nuevo con flete",
  v28: "Venta de contado",
};
export const MES_CORTO = "SEP";

/* ═══════════ LAS CINCO PANTALLAS ═══════════ */

const d = (cuenta, valor) => ({ lado: "debe", cuenta, valor });
const h = (cuenta, valor) => ({ lado: "haber", cuenta, valor });
const precio = (n) => `$${unitarioEnLibro(n)}`;

const DEV_P2 = {
  promedio: [
    { valores: [E.p2.promedioViejo], texto: "Ese promedio es de antes de la devolución del 8. Tras ella cambian las unidades y el valor: usa el saldo de hoy." },
    { valores: E.p2.deUnLote, texto: "Ese es el costo de un solo lote. En promedio móvil, cada unidad de la bodega vale lo mismo." },
    { valores: E.p2.precioDeVenta, texto: "Ese es un precio de venta. El kárdex lleva costos: lo que te costó cada unidad, no lo que cobras." },
  ],
  costo: [
    { valores: [E.p2.todoElSaldo], texto: "Ese es todo el saldo. Solo salen 6.000 de las 6.250 unidades." },
    { valores: E.p2.loCobrado, texto: "Eso es lo que cobraste. Aquí va lo que te costaron esas 6.000 unidades." },
  ],
};

export const PANTALLAS = [
  {
    id: "p1",
    fila: "c2",
    enunciado: "Las 5.000 cuestan $10.925.000 ya con descuento, y el flete $575.000. ¿A dónde va el flete? Escribe el costo por unidad.",
    clave: CLAVES.p1,
    devoluciones: {
      alGasto: "Este flete trajo la mercancía a tu bodega. Sin él no podrías venderla: es parte de lo que te costó.",
      unitario: [
        { valores: [E.p1.precioDeFactura], texto: "Ese es el precio de factura. Falta repartir el flete entre las 5.000 unidades: $115 a cada una." },
        { valores: [E.p1.listaMasFlete], texto: "La factura ya trae restado el 5 %: son $2.185 por unidad. Súmale $115 de flete, una sola vez." },
        { valores: [E.p1.promedioDeBodega], texto: "Ese es el promedio de toda la bodega. Aquí se pide el costo de esta entrada sola." },
      ],
    },
    generica: "Reparte el flete entre las unidades que trajo y súmalo al precio de factura.",
    acierto: "Bien. Cada unidad entra con $2.185 de factura y $115 de transporte. Da $2.300, lo mismo que el precio de lista: el flete costó justo lo que te descontaron.",
    pista: "¿Podrías vender lo que compraste sin traerlo antes a tu bodega?",
  },
  {
    id: "p2",
    fila: "v10",
    enunciado: "Vendes 6.000 unidades. Busca en el kárdex lo que te costaron y arma el asiento del costo.",
    clave: CLAVES.p2,
    devoluciones: DEV_P2,
    ingreso: [d(CLIENTES, INGRESO_P2), h(INGRESOS, INGRESO_P2)],
    asiento: {
      correctos: [[d(CMV, CLAVES.p2.costo), h(INVENTARIO, CLAVES.p2.costo)]],
      cruzado: {
        [CMV]: "La mercancía sale de la bodega, así que Inventario baja por el haber. El costo va al debe.",
        [INVENTARIO]: "La mercancía sale de la bodega, así que Inventario baja por el haber. El costo va al debe.",
      },
      cuentaMal: {
        [CAJA]: "El costo no mueve dinero ni ingresos. Lo que sale es mercancía: va contra Inventario.",
        [INGRESOS]: "El costo no mueve dinero ni ingresos. Lo que sale es mercancía: va contra Inventario.",
        [COMPRAS]: "Compras es del periódico. Aquí la mercancía vive en Inventario, y de ahí sale.",
      },
      /* Un valor equivocado del asiento: el mismo error que en el campo del costo. */
      valorMal: DEV_P2.costo.flatMap((x) => x.valores.flatMap((valor) => [CMV, INVENTARIO].map((cuenta) => ({ cuenta, valor, texto: x.texto })))),
    },
    generica: "Divide el saldo entre las unidades. Ese promedio, por 6.000, es lo que sale de la bodega.",
    acierto: "Bien. El costo pasa de Inventario a Costo de mercancía vendida el mismo día de la venta. El periódico lo dejaba para el cierre.",
    pista: "El promedio de hoy sale del último saldo del kárdex.",
  },
  {
    id: "p3",
    fila: "d15",
    enunciado: "Te devuelven 200 vendidas a $9.000. ¿A qué valor entran?",
    clave: CLAVES.p3,
    botones: E.p3.botones,
    devoluciones: {
      valor: {
        [E.p3.botones[1]]: "Ese promedio es de antes de la devolución del 8. Las 200 salieron el día 10, al promedio de ese día, y vuelven a ese mismo valor.",
        [E.p3.botones[2]]: "Ese es el costo de factura de un lote. Estas unidades salieron al promedio del día 10, y vuelven a ese mismo valor.",
        [E.p3.botones[3]]: "Ese es el precio que cobraste. Si vuelven a ese valor, la bodega vale más de lo que te costó.",
      },
    },
    ingreso: [d(DEVOLUCIONES, INGRESO_P3), h(CLIENTES, INGRESO_P3)],
    asiento: {
      correctos: [[d(INVENTARIO, CLAVES.p3.total), h(CMV, CLAVES.p3.total)]],
      cruzado: {
        [INVENTARIO]: "La mercancía vuelve, así que Inventario sube por el debe. El costo de la venta se corrige por el haber.",
        [CMV]: "La mercancía vuelve, así que Inventario sube por el debe. El costo de la venta se corrige por el haber.",
      },
      cuentaMal: {
        [DEVOLUCIONES]: "Esa cuenta ya bajó el ingreso en el otro asiento. Este corrige el costo: la contrapartida es Costo de mercancía vendida.",
        [CLIENTES]: "La deuda del cliente se ajustó a precio de venta en el otro asiento. Este solo toca costos.",
      },
      valorMal: [],
    },
    generica: "Este asiento solo toca dos cuentas: Inventario y el costo de lo vendido.",
    acierto: "Correcto. Vuelven al costo con que salieron. El costo de la venta baja y la bodega recupera esas unidades.",
    pista: "¿A qué valor salieron estas unidades de la bodega el día 10?",
  },
  {
    id: "p4",
    filas: ["c25", "v28"],
    fila: "v28",
    enunciado: "Entra el lote nuevo con su flete y luego vendes 6.100. Escribe el nuevo promedio y el costo de esa venta.",
    clave: CLAVES.p4,
    devoluciones: {
      promedio: [
        { valores: [E.p4.promedioViejo], texto: "Ese es el promedio de antes de la compra. La entrada del 25 cambia el saldo: recalcula." },
        { valores: [E.p4.loteNuevo], texto: "Ese es el costo del lote nuevo solo. El promedio mezcla todo lo que hay en bodega." },
        { valores: [E.p4.sinPesar], texto: "Promediaste los dos costos sin pesar las unidades. Hay 450 de un lado y 7.750 del otro." },
      ],
      costo: [
        { valores: [E.p4.todoElSaldo], texto: "Ese es todo el saldo. Salen 6.100 de las 8.200 unidades." },
        { valores: [E.p4.conPromedioViejo], texto: "Usaste el promedio viejo para esta venta. El lote del 25 ya está en bodega y baja el costo." },
        { valores: E.p4.loCobrado, texto: "Eso es lo que cobraste. Aquí va lo que costaron." },
      ],
    },
    generica: "Suma la entrada al saldo y divide entre las unidades. Luego multiplica por las 6.100 que salen.",
    acierto: "Bien. El lote barato bajó el promedio. Por eso estas 6.100 salen más baratas que las del día 10.",
    pista: "¿Cuántas unidades hay después de la compra, y cuánto valen todas juntas?",
  },
  {
    id: "p5",
    fila: "v10",
    enunciado: "Mismo mes: en permanente, el mes cuesta unos $77.500 más. Toca la venta del 10: ¿por qué cambia su costo?",
    /* No se muestra (B5): la pregunta ya va en el enunciado. */
    pregunta: "¿Por qué la venta del 10 cuesta distinto en cada sistema?",
    opciones: [
      { id: "a", texto: "El periódico promedia todo el mes, con el lote del 25.", correcta: true },
      { id: "b", texto: "Es por el redondeo que el permanente hace en cada venta del mes.", retro: "El redondeo mueve pesos, no $77.500. La diferencia está en qué compras entran en cada promedio." },
      { id: "c", texto: "El periódico no resta la devolución que le hiciste al proveedor.", retro: "El periódico sí la resta: el disponible es el mismo en los dos. La diferencia está en cuándo se calcula el promedio." },
      { id: "d", texto: "En el permanente, la devolución del 15 sube el costo de la venta.", retro: "La devolución vuelve al mismo costo con que salió. No cambia el promedio ni el costo de la venta del 10." },
    ],
    generica: "El permanente usa lo que había el día 10. El periódico espera a fin de mes.",
    acierto: "Exacto. El periódico le pone a la venta del 10 un costo que solo se conoce a fin de mes. Es como costear la leche vendida el día 10 con un promedio que incluye leche que aún no llegaba.",
    pista: "Mira qué compras existían ya el día 10, y cuáles llegaron después.",
  },
];

export const pantalla = (id) => PANTALLAS.find((p) => p.id === id);
export { precio };
