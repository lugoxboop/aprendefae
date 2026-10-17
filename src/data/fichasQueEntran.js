import { CLIENTES, CAJA } from "./contabilidadT6Act2.js";
import { GRUPOS_T6_A5, ROTULO_SIMULADO_T6_A5 } from "./contabilidadT6Pieza5.js";
import { TABLERO_T6_A4 } from "./contabilidadT6Pieza4.js";
import { CUENTA_T_T6_A3 } from "./contabilidadT6Pieza3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 21 · LAS FICHAS QUE ENTRAN EN LA CAPA 2 (P2 de Mai, 16-oct).
 *
 * Por pieza: las fichas, los gestos (anclados a un fragmento literal del paso
 * de main) y el modelo, una rejilla de celdas. Los textos son fragmentos de
 * los pasos, nombres de cuenta o rótulos publicados de la capa 3; las cifras,
 * las de los pasos. Nuevos (PARA SHOKO): «Deuda castigada», «Total», «Factura»,
 * «Pago», «Nada» y las pistas «Toca la ficha resaltada» / «Toca la fila
 * resaltada».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PISTA_FICHA = "Toca la ficha resaltada";
export const PISTA_FILA = "Toca la fila resaltada";

const cab = (rotulo, extra = {}) => ({ rotulo, cabecera: true, ...extra });
const [G1, G2, G3, G4] = GRUPOS_T6_A5;

/* T5 A1 · Del efectivo de sobra: el estante de las fichas (capa 1). */
export const FICHAS_T5_A1 = {
  pista: PISTA_FICHA,
  /* Tres fichas a 320 parten en dos renglones: la fila reserva los dos. */
  altoFichas: 96,
  fichas: [
    { id: "efectivo", texto: "Efectivo", aparece: "efectivo de sobra" },
    { id: "cdt", texto: "CDT" },
    { id: "acciones", texto: "Acciones" },
    { id: "participacion", texto: "Títulos de participación" },
  ],
  gestos: [
    { ancla: "compra tres títulos", ficha: "efectivo", aparecen: ["cdt", "acciones", "participacion"] },
    { ancla: "El CDT paga un interés fijo", ficha: "cdt", sitio: "interes", entra: "CDT" },
    { ancla: "Lo que gana quien tiene las acciones", ficha: "acciones", sitio: "variable", entra: "Acciones" },
    { ancla: "Los títulos de participación rinden", ficha: "participacion", sitio: "descuento", entra: "Títulos de participación" },
  ],
  modelo: {
    columnas: 3,
    celdas: [
      cab("Renta variable"), cab("Fija con interés"), cab("Fija con descuento"),
      { id: "variable" }, { id: "interes" }, { id: "descuento" },
    ],
  },
};

/* T6 A1 · Lo que otros le deben: la T de clientes (capa 3) y, debajo, el cajón «Caja». */
export const FICHAS_T6_A1 = {
  pista: PISTA_FICHA,
  fichas: [
    { id: "factura", texto: "Factura $1.350.000", aparece: "Se la vende a crédito" },
    { id: "pago", texto: "Pago $1.350.000", aparece: "La Barranquillera paga" },
    { id: "movDebe", texto: "$1.350.000 · 10 de enero", queda: true },
  ],
  gestos: [
    { ancla: "queda en Cuentas por cobrar – clientes", ficha: "factura", sitio: "debe", entra: ["$1.350.000", "10 de enero"], aparecen: ["movDebe"] },
    { ancla: "La plata entra a Caja", ficha: "pago", sitio: "caja", entra: "$1.350.000" },
    { ancla: "La deuda se cancela", ficha: "movDebe", sitio: "haber", entra: ["$1.350.000", "25 de enero"] },
  ],
  modelo: {
    columnas: 2,
    celdas: [
      cab(CLIENTES, { span: 2 }),
      cab(CUENTA_T_T6_A3.debe), cab(CUENTA_T_T6_A3.haber),
      { id: "debe", ficha: "movDebe" }, { id: "haber" },
      cab(CAJA, { span: 2 }),
      { id: "caja", span: 2 },
    ],
  },
};

/* T6 A2 · Cuando un cliente no va a pagar: la rejilla de la capa 3; la fila «Provisiones», tenue y vacía (R10). */
export const FICHAS_T6_A2 = {
  pista: PISTA_FICHA,
  fichas: [{ id: "gasto", texto: "Gasto $312.500", aparece: "Se autoriza castigar" }],
  gestos: [{ ancla: "Se debita Gasto provisiones", ficha: "gasto", sitio: "directaCastigar", entra: ["Gasto", "$312.500"] }],
  entradas: [{ sitio: "directaCerrar", entra: "Nada" }],
  modelo: {
    columnas: 3,
    celdas: [
      cab(""), cab("Al cerrar el periodo"), cab("Al castigar"),
      cab("Anulación directa"), { id: "directaCerrar" }, { id: "directaCastigar" },
      cab("Provisiones", { tenue: true }), { id: "provCerrar", tenue: true }, { id: "provCastigar", tenue: true },
    ],
  },
};

/* T6 A4 · Cuando el cliente castigado sí paga: la tabla del caso a (capa 3). */
export const FICHAS_T6_A4 = {
  pista: PISTA_FICHA,
  /* Las dos fichas, a 320, parten en dos renglones: la fila reserva los dos. */
  altoFichas: 94,
  fichas: [
    { id: "deuda", texto: "Deuda castigada $180.000", aparece: "a nombre de Pablo Moncayo" },
    { id: "pago", texto: "Pago $180.000", aparece: "vuelve y paga toda la factura" },
  ],
  gestos: [
    { ancla: "Primero se revive la deuda", ficha: "deuda", sitio: "revive", entra: "$180.000" },
    { ancla: "Después se anota el pago", ficha: "pago", sitio: "entran", entra: "$180.000" },
  ],
  modelo: {
    columnas: 2,
    celdas: [cab(TABLERO_T6_A4.revive), cab(TABLERO_T6_A4.entran), { id: "revive" }, { id: "entran" }],
  },
};

/* T6 A5 · Cómo se calcula la provisión: el tablero de grupos; las filas mismas son las fichas. */
export const FICHAS_T6_A5 = {
  pista: PISTA_FILA,
  fichas: [G1, G2, G3, G4].map((g) => ({ id: g.id, texto: g.nombre, aparece: "Agrupa las deudas" })),
  gestos: [
    { ancla: "Las que están vigentes", ficha: "g1", sitio: "v1", entra: ["—", "$0"] },
    { ancla: "Las que llevan más de tres meses", ficha: "g2", sitio: "v2", entra: ["5\u00A0%", "$17.000"] },
    { ancla: "Las que llevan más de seis meses", ficha: "g3", sitio: "v3", entra: ["10\u00A0%", "$36.000"] },
    { ancla: "Las que llevan más de un año", ficha: "g4", sitio: "v4", entra: ["15\u00A0%", "$21.000"] },
  ],
  entradas: [
    { ancla: "Cálculo: $17.000 + $36.000 + $21.000", sitio: "tRotulo", entra: "Total" },
    { ancla: "Cálculo: $17.000 + $36.000 + $21.000", sitio: "tValor", entra: "$74.000" },
  ],
  modelo: {
    columnas: 2,
    fila: true,
    desde: "Agrupa las deudas",
    atributos: { "data-tabla-ejemplo": true },
    celdas: [
      { rotulo: ROTULO_SIMULADO_T6_A5, simulado: true, span: 2 },
      { ficha: "g1", texto: G1.nombre }, { id: "v1" },
      { ficha: "g2", texto: G2.nombre }, { id: "v2" },
      { ficha: "g3", texto: G3.nombre }, { id: "v3" },
      { ficha: "g4", texto: G4.nombre }, { id: "v4" },
      { id: "tRotulo", sinHueco: true }, { id: "tValor", sinHueco: true },
    ],
  },
};
