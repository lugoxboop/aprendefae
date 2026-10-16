import { cifraK } from "../contabilidad/t7_2Kardex.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-5 «Septiembre en permanente» — LAS CIFRAS
 * (Célula E).
 *
 * El mismo septiembre de r5-4 (Barranquilla), ahora en permanente con
 * promedio ponderado móvil. Paquete e5-r5-5-v1 (v1.3). Aquí solo hay datos y
 * cifras: los textos van en repasoCap5PermanenteTextos.js.
 *
 * Las cifras se CALCULAN con las reglas de src/contabilidad/t7_2Kardex.js
 * (decisión 2 de Kamogawa): el costo unitario se calcula sin redondear y se
 * muestra con dos decimales (Math.round); los totales se calculan sin
 * redondear y se muestran al peso. El kárdex de t7_2 no lleva devoluciones;
 * aquí van con sus mismas reglas:
 *   · la devolución al proveedor sale al costo de su factura ($2.185, dato
 *     declarado), no al promedio;
 *   · la devolución del cliente entra al costo exacto con que salió la venta.
 * El valor esperado de cada cifra va comentado al lado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INICIAL = { unidades: 1950, costo: 2000 };

/* Los datos del mes (los de r5-4, sin IVA ni retención). */
export const DATOS = {
  compra2: { unidades: 5000, lista: 2300, factura: 10925000, flete: 575000 }, // factura con el 5 % comercial ya restado
  devolucion8: { unidades: 700, costo: 2185 }, // declarado: al precio de factura
  venta10: { unidades: 6000, precio: 9000, lista: 10000 }, // 10 % comercial
  devolucion15: { unidades: 200 },
  compra25: { unidades: 7750, costo: 2125 }, // con su flete
  venta28: { unidades: 6100, precio: 9200, lista: 10000 }, // 8 % comercial
};
const D = DATOS;

/* ═══════════ EL KÁRDEX, FILA POR FILA ═══════════ */

const r2 = (x) => Math.round(x * 100) / 100;

/*
 * Cada fila: { id, dia, tipo, mov: [cantidad, unitario exacto, total exacto],
 * saldo: [cantidad, unitario exacto, total exacto] }. Lo mostrado sale de
 * `mostrada` (unitario a dos decimales, total al peso).
 */
export function kardexPermanente() {
  let q = INICIAL.unidades;
  let v = INICIAL.unidades * INICIAL.costo;
  const filas = [{ id: "inicial", dia: 1, tipo: "inicial", saldo: [q, v / q, v] }];
  const entra = (id, dia, cq, cu, tipo = "entrada") => {
    q += cq; v += cq * cu;
    filas.push({ id, dia, tipo, mov: [cq, cu, cq * cu], saldo: [q, v / q, v] });
  };
  const sale = (id, dia, cq, cu = v / q) => {
    q -= cq; v -= cq * cu;
    filas.push({ id, dia, tipo: "salida", mov: [cq, cu, cq * cu], saldo: [q, v / q, v] });
  };
  const unitario2 = (D.compra2.factura + D.compra2.flete) / D.compra2.unidades; // 2.300
  entra("c2", 2, D.compra2.unidades, unitario2);
  sale("d8", 8, D.devolucion8.unidades, D.devolucion8.costo);
  const cuVenta = v / q; // 2.219,28 exacto
  sale("v10", 10, D.venta10.unidades, cuVenta);
  entra("d15", 15, D.devolucion15.unidades, cuVenta);
  entra("c25", 25, D.compra25.unidades, D.compra25.costo);
  sale("v28", 28, D.venta28.unidades);
  return filas;
}

export const KARDEX = kardexPermanente();
export const fila = (id) => KARDEX.find((f) => f.id === id);

/* Lo que se muestra de una terna: [cantidad, unitario a dos decimales, total al peso]. */
export const mostrada = ([q, cu, t]) => [q, r2(cu), Math.round(t)];
/* Con el formato del libro: «6.250», «2.219,28», «13.870.500». */
export const enLibro = (terna) => {
  const [q, cu, t] = mostrada(terna);
  return [cifraK(q), unitarioEnLibro(cu), cifraK(t)];
};
/* El unitario siempre con dos decimales («2.300,00»), como lo pide el paquete. */
export function unitarioEnLibro(n) {
  const [ent, dec] = r2(n).toFixed(2).split(".");
  return `${ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

/* ═══════════ LO QUE SE CALIFICA (las claves) ═══════════ */

const [, cuC2] = mostrada(fila("c2").mov);
const [, promedio10, costo10] = mostrada(fila("v10").mov);
const [, cuD15, totalD15] = mostrada(fila("d15").mov);
const [, promedio28] = mostrada(fila("c25").saldo);
const costo28Exacto = fila("v28").mov[2];

export const CLAVES = {
  p1: { destino: "compra", unitario: cuC2 }, // 2.300,00
  p2: { promedio: promedio10, costo: costo10 }, // 2.219,28 · 13.315.680
  p3: { unitario: cuD15, total: totalD15 }, // 2.219,28 · 443.856
  p4: { promedio: promedio28, costo: Math.round(costo28Exacto) }, // 2.130,17 · 12.994.061
};

/*
 * Pantalla 4 (decisión 3 de Kamogawa): el costo se acepta de 12.994.030 a
 * 12.994.070, que cubre el exacto y el que sale de multiplicar el promedio
 * mostrado por 6.100 (12.994.037).
 */
export const TOLERANCIA_P4 = { desde: 12994030, hasta: 12994070 };
export const costoConPromedioMostrado = Math.round(promedio28 * D.venta28.unidades); // 12.994.037

/* Los asientos del costo (pantallas 2 y 3) y los del ingreso, ya registrados (v1.3, decisión 2). */
export const INGRESO_P2 = D.venta10.unidades * D.venta10.precio; // 54.000.000
export const INGRESO_P3 = D.devolucion15.unidades * D.venta10.precio; // 1.800.000

/* ═══════════ LOS VALORES EQUIVOCADOS PREVISTOS ═══════════ */

const saldoC2 = fila("c2").saldo;
const saldoD8 = fila("d8").saldo;
const saldoD15 = fila("d15").saldo;
const saldoC25 = fila("c25").saldo;
export const EQUIVOCADAS = {
  p1: {
    precioDeFactura: D.compra2.factura / D.compra2.unidades, // 2.185
    listaMasFlete: D.compra2.lista + D.compra2.flete / D.compra2.unidades, // 2.415: el flete sumado al precio de lista
    promedioDeBodega: r2(saldoC2[1]), // 2.215,83
  },
  p2: {
    promedioViejo: r2(saldoC2[1]), // 2.215,83
    deUnLote: [INICIAL.costo, D.devolucion8.costo, cuC2], // 2.000 · 2.185 · 2.300
    precioDeVenta: [D.venta10.precio, D.venta10.lista], // 9.000 · 10.000
    todoElSaldo: Math.round(saldoD8[2]), // 13.870.500
    loCobrado: [INGRESO_P2, D.venta10.unidades * D.venta10.lista], // 54.000.000 · 60.000.000
  },
  p3: {
    /*
     * v1.4 (Kamogawa, «dos fugas»): la clave era la única con centavos
     * distintos de ,00 (E12). Sale 10.000; entra el promedio del 2, antes de
     * la devolución del 8, sacado del kárdex.
     */
    botones: [cuD15, r2(saldoC2[1]), D.devolucion8.costo, D.venta10.precio], // 2.219,28 · 2.215,83 · 2.185,00 · 9.000,00
  },
  p4: {
    promedioViejo: r2(saldoD15[1]), // 2.219,28
    loteNuevo: D.compra25.costo, // 2.125
    sinPesar: r2((r2(saldoD15[1]) + D.compra25.costo) / 2), // 2.172,14
    todoElSaldo: Math.round(saldoC25[2]), // 17.467.426
    conPromedioViejo: Math.round(D.venta28.unidades * r2(saldoD15[1])), // 13.537.608
    loCobrado: [D.venta28.unidades * D.venta28.precio, D.venta28.unidades * D.venta28.lista], // 56.120.000 · 61.000.000
  },
};

/*
 * «Lo que habría sido» (pantalla 3): el valor del inventario si las 200
 * vuelven al valor elegido (v1.4: 2.354.820 / 997.986 / 991.820).
 */
export const habriaSido = (unitario) => Math.round(fila("v10").saldo[2] + D.devolucion15.unidades * unitario);

/* ═══════════ LA PANTALLA 5: EL MISMO MES EN LOS DOS SISTEMAS ═══════════ */

/* Periódico: un solo promedio con todo lo disponible del mes, fletes incluidos. */
const disponibleQ = INICIAL.unidades + D.compra2.unidades - D.devolucion8.unidades + D.compra25.unidades; // 14.000
const disponibleV = INICIAL.unidades * INICIAL.costo + D.compra2.factura + D.compra2.flete - D.devolucion8.unidades * D.devolucion8.costo + D.compra25.unidades * D.compra25.costo; // 30.339.250
export const PROMEDIO_PERIODICO = disponibleV / disponibleQ; // 2.167,0893…
const vendidasNetas = D.venta10.unidades - D.devolucion15.unidades + D.venta28.unidades; // 11.900
export const VENDIDO_PERIODICO = Math.round(vendidasNetas * PROMEDIO_PERIODICO); // 25.788.363 (exacto 25.788.362,5)
export const VENDIDO_PERMANENTE = Math.round(fila("v10").mov[2] - fila("d15").mov[2] + fila("v28").mov[2]); // 25.865.885
export const FRANJA_DEL_10 = { periodico: r2(PROMEDIO_PERIODICO), permanente: promedio10 }; // 2.167,09 · 2.219,28
