/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 10 · LA FIGURA DE CADA TÉRMINO EN LA CAPA 1 DE LAS 7 PIEZAS DE APRENDER
 * DE B (P2 de Mai, 16-oct, aprobada por Sakuta).
 *
 * Una figura por término, en el orden de main, con cinco objetos: el asiento
 * (o la cuenta T), el estante, la línea (momentos, o de un lado a otro), la
 * barra de lo que deben los clientes y el tanque de la provisión. `senal` es
 * la parte que el término nombra (contorno de 2 px #F8F9FA).
 *
 * Las palabras son nombres de cuenta publicados, nombres de las fichas y de
 * la capa 3 ya publicados, o fragmentos literales de la definición de main
 * del término (la prueba lo vigila). Donde la hoja de Mai traía palabras de
 * su réplica que main no tiene, va el fragmento literal de main (PR del lote
 * 10). Cifras: solo las de la definición (los tres porcentajes de T6 A5.4).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TEXTOS_FIGURAS_CAPA1 = { debe: "DEBE", haber: "HABER" };

const GASTO = "Gasto provisiones – cuentas incobrables";
const PROVISION = "Provisión para cuentas incobrables";
const CLIENTES = "Cuentas por cobrar – clientes";

/* Las palabras publicadas fuera de las definiciones: las fichas de T5 A1 y los momentos de la capa 3 de T6 A2; «Temporal», de Mai (PARA SHOKO). */
export const PUBLICADAS_FIGURAS_CAPA1 = [
  "Inversiones – títulos", "Bancos", "Caja", CLIENTES, GASTO, PROVISION, "Cuentas por cobrar", "Clientes", "Otras cuentas por cobrar",
  "Renta variable", "Fija con interés", "Fija con descuento", "Al cerrar el periodo", "Al castigar", "Temporal",
];

const TEMPORAL = { tipo: "estante", tapa: "Temporal", cajones: ["poder venderse rápido y con facilidad", "volverse efectivo cuando se necesite"] };
const FICHAS = { tipo: "estante", cajones: ["Renta variable", "Fija con interés", "Fija con descuento"] };
const TRES_MOMENTOS = { tipo: "linea", momentos: ["cuando se compra", "cuando da su rendimiento", "cuando se vende"] };
const CXC = { tipo: "estante", tapa: "Cuentas por cobrar", cajones: ["Clientes", "Otras cuentas por cobrar"] };
const T_CLIENTES = { tipo: "asiento", cuenta: CLIENTES, debe: "sube", haber: "baja" };
const DOS_MOMENTOS = { tipo: "linea", momentos: ["Al cerrar el periodo", "Al castigar"] };
const GASTO_PROVISION = { tipo: "asiento", debe: GASTO, haber: PROVISION };
const VALOR_NETO = { tipo: "barra", provision: "provisión", neto: "valor neto" };

export const FIGURAS_CAPA1_B = {
  "b5-t5-a1-del-efectivo-de-sobra": [
    { tipo: "asiento", debe: "Inversiones – títulos", haber: "Bancos", senal: ["debe"] },
    { ...TEMPORAL, senal: [0, 1] },
    { ...TEMPORAL, senal: [1] },
    { tipo: "estante", cajones: ["documentos a corto plazo", "valores negociables de deuda", "de capital"], senal: [0, 1, 2] },
    { tipo: "flecha", de: "la empresa", a: "acciones", senal: ["a"] },
    { ...FICHAS, senal: [0] },
    { ...FICHAS, senal: [1, 2] },
    { ...FICHAS, senal: [1] },
    { ...FICHAS, senal: [2] },
  ],
  "b5-t5-a2-los-tres-momentos-de-una-inversion": [
    { ...TRES_MOMENTOS, senal: [0, 1, 2] },
    { ...TRES_MOMENTOS, senal: [0] },
    { ...TRES_MOMENTOS, senal: [1] },
    { ...TRES_MOMENTOS, senal: [2] },
  ],
  "b5-t6-a1-lo-que-otros-le-deben": [
    { ...CXC, senal: ["tapa"] },
    { ...CXC, senal: [0] },
    { ...CXC, senal: [1] },
    /* Nota débito: en main es la del banco, que le resta a la cuenta de la empresa: Bancos baja, por el Haber. */
    { tipo: "asiento", cuenta: "Bancos", debe: null, haber: "le resta un valor", senal: ["haber"] },
    { ...T_CLIENTES, senal: ["debe"] },
    { ...T_CLIENTES, senal: ["haber"] },
  ],
  "b5-t6-a2-cuando-un-cliente-no-va-a-pagar": [
    { tipo: "barra", rayada: "de difícil o dudoso cobro", senal: ["parte"] },
    { tipo: "barra", edades: true, rotulo: "tiempo de vencimiento", senal: ["tramos"] },
    { tipo: "barra", suelta: "darla de baja", senal: ["parte"] },
    { tipo: "asiento", debe: GASTO, haber: CLIENTES, senal: ["debe", "haber"] },
    { ...DOS_MOMENTOS, senal: [1] },
    { ...GASTO_PROVISION, senal: ["debe", "haber"] },
    { ...DOS_MOMENTOS, senal: [0, 1] },
  ],
  "b5-t6-a3-la-provision-de-un-ano-al-siguiente": [
    { ...VALOR_NETO, senal: ["provision"] },
    { tipo: "asiento", cuenta: PROVISION, debe: "baja", haber: "sube", senal: ["haber"] },
    { ...VALOR_NETO, senal: ["neto"] },
    { ...GASTO_PROVISION, senal: ["debe"] },
    { tipo: "asiento", debe: PROVISION, haber: CLIENTES, senal: ["debe", "haber"] },
    { tipo: "tanques", tanques: [{ nivel: "falta", texto: "subestimada" }, { nivel: "sobra", texto: "sobrestimada" }], senal: [] },
  ],
  "b5-t6-a4-cuando-el-cliente-castigado-si-paga": [
    { tipo: "flecha", de: "castigado", a: "vuelve a pagar", senal: ["a"] },
    { tipo: "asiento", debe: CLIENTES, haber: PROVISION, senal: ["debe", "haber"] },
    { tipo: "asiento", debe: "Caja", haber: CLIENTES, senal: ["debe", "haber"] },
    { tipo: "barra", rellena: "una parte", senal: ["parte"] },
    { tipo: "estante", cajones: ["paga todo", "promete pagar el resto", "avisa que ya no puede pagar más"], senal: [0, 1, 2] },
  ],
  "b5-t6-a5-como-se-calcula-la-provision": [
    { tipo: "barra", edades: true, grupos: ["vigentes", "vencidas"], senal: ["tramos"] },
    { tipo: "barra", edades: true, porcion: true, senal: ["tramos"] },
    { ...GASTO_PROVISION, senal: ["debe", "haber"] },
    { tipo: "barra", edades: true, porcion: true, porcentajes: ["5 %", "10 %", "15 %"], senal: ["tramos"] },
    { tipo: "tanques", tanques: [{ nivel: "justo", texto: null }], senal: [] },
  ],
};
