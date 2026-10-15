import { BOTON, DEBE, HABER, ROTULOS_PATRON } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A2 DE APRENDER — «Descuentos en cadena» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md; Mello: PASA),
 * con el cambio de la entrega 6 de Near en P1 `ejemplo` (la pregunta
 * «¿mayor, igual o menor?», sus tres opciones y sus dos errores, que llegan
 * por L). Seis pantallas: la pregunta llega antes que la regla del saldo, y
 * el atajo es una pregunta («¿Qué da 0,7866 × $4.200.000?»). La frase de
 * las tarifas va en el pie de la pantalla del asiento, que las da.
 *
 * Ejemplo H-2 del libro (pp. 249-250), resuelto: A2 es la dueña de sus
 * cifras y ninguna pieza de Hacer las pide. El factor va bien escrito
 * (0,7866): la pantalla no menciona la errata C7-2. La suma del asiento
 * (3.832.315) es de Near: el libro no imprime sumas.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, los
 * rótulos de la ficha y el pie de cada pantalla, con las páginas de la
 * columna «Fuente» de sus textos (el del asiento, «Basado en el libro, p.
 * 250», sí lo da la v1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A2_ID = "t7-3-descuentos-en-cadena";

/* Las cifras de H-2 (pp. 249-250). Una prueba las recalcula desde la lista, los tres descuentos y las tarifas. */
export const H2_LIBRO = {
  lista: 4_200_000, d1: 210_000, s1: 3_990_000, d2: 319_200, s2: 3_670_800, d3: 367_080, factura: 3_303_720,
  rebaja: 896_280, rebaja23: 966_000, factor: 0.7866, iva: 528_595, retencion: 115_630, cliente: 3_716_685, sumas: 3_832_315,
};
const C = H2_LIBRO;

/*
 * Las figuras del «Patrón T7-3» de Watari: la cadena y el atajo del factor,
 * como en H2. Rótulos y títulos de Watari, revisados por Near.
 */
export const ROTULOS_A2 = {
  cadena: "Cadena de descuentos de San Calixto",
  descuento: (pct) => `Descuento ${pct} %`,
  delSaldo: (pct) => `Descuento ${pct} % del saldo`,
  saldo: "Saldo",
  atajo: "El atajo del factor",
  complementos: "Complementos",
  factor: "Factor",
};
const R = ROTULOS_A2;
const CADENA = {
  tipo: "renglones",
  titulo: R.cadena,
  filas: [
    { rot: ROTULOS_PATRON.precioLista, v: C.lista },
    { op: "−", rot: R.descuento(5), v: C.d1 },
    { op: "=", rot: R.saldo, v: C.s1, res: true },
    { op: "−", rot: R.delSaldo(8), v: C.d2 },
    { op: "=", rot: R.saldo, v: C.s2, res: true },
    { op: "−", rot: R.delSaldo(10), v: C.d3 },
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
  ],
};
const FACTOR = {
  tipo: "renglones",
  titulo: R.atajo,
  filas: [
    { rot: R.complementos, v: "0,95 × 0,92 × 0,90", apila: true },
    { op: "=", rot: R.factor, v: "0,7866", res: true },
    { op: "×", rot: ROTULOS_PATRON.precioLista, v: C.lista },
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
  ],
};

/* La cadena de la pantalla de los pasos: primero solo el primer descuento; con el acierto, el resto. */
const CADENA_PASOS = {
  ...CADENA,
  filas: CADENA.filas.slice(0, 3),
  alAcertar: { filas: CADENA.filas.map((f, k) => (k < 3 ? f : { ...f, nuevo: true })) },
};
/* El atajo antes de la pregunta: los complementos y el factor. */
const FACTOR_PREGUNTA = { ...FACTOR, filas: FACTOR.filas.slice(0, 2) };

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a calcular varios descuentos seguidos y a ver cuánto se rebaja en total.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 249-250",
};

/* Entrega 6 de Near: la pregunta, las opciones y los dos errores. */
const EJEMPLO = {
  id: "ejemplo",
  pista: "En una cadena, cada descuento se calcula sobre lo que dejó el anterior, no sobre el precio de lista.",
  tipo: "eleccion",
  parrafos: ["San Calixto vende por $4.200.000 de lista. Da tres descuentos seguidos: 5 %, 8 % y 10 %."],
  pregunta: "Suman 23 %. ¿La rebaja total será mayor, igual o menor que el 23 %?",
  opciones: [
    { id: "mayor", texto: "Mayor que 23 %", devolucion: "Cada descuento se calcula sobre un saldo más pequeño que el anterior. Así, la rebaja total no puede pasar del 23 %." },
    { id: "igual", texto: "Igual: 23 %", devolucion: "Sería igual si cada descuento fuera sobre el precio de lista. Pero cada uno va sobre un saldo más pequeño." },
    { id: "menor", texto: "Menor que 23 %", correcta: true },
  ],
  acierto: {
    texto: "Así es: la rebaja es menor.",
    porque: "Cada descuento se calcula sobre el saldo que dejó el anterior, no sobre el precio de lista.",
    pie: "Basado en el libro, pp. 249-250",
  },
  error: { pie: "Basado en el libro, pp. 249-250" },
  pie: "Basado en el libro, pp. 249-250",
};

const PASOS = {
  id: "pasos",
  pista: "El primer descuento ya rebajó el precio. ¿Sobre qué valor queda el siguiente?",
  tipo: "eleccion",
  /* Patrón T7-3: la cadena de renglones; al principio, solo el primer descuento. */
  figuras: [CADENA_PASOS],
  pregunta: "El primer descuento ya está. ¿Sobre qué valor se calcula el del 8 %?",
  opciones: [
    { id: "lista", texto: "$4.200.000", devolucion: "En una cadena, cada descuento va sobre el saldo que dejó el anterior." },
    { id: "saldo", texto: "$3.990.000", correcta: true },
    { id: "primer-descuento", texto: "$210.000", devolucion: "Ese es el primer descuento, no el valor sobre el que se calcula el segundo. El 8 % va sobre lo que queda después de restarlo." },
  ],
  acierto: {
    texto: "Así es: $3.990.000 × 8 % = $319.200. Rebajó $896.280 en total, el 21,34 %: menos que el 23 %.",
    porque: "Con el 23 %, la rebaja habría sido de $966.000.",
    pie: "Basado en el libro, pp. 249-250",
  },
  error: { pie: "Basado en el libro, pp. 249-250" },
  pie: "Basado en el libro, pp. 249-250",
};

const ATAJO = {
  id: "atajo",
  pista: "El factor es lo que queda después de los tres descuentos. ¿Qué valor es ese?",
  tipo: "eleccion",
  parrafos: ["El libro da un atajo. Multiplica los complementos: lo que le falta a cada descuento para el 100 %."],
  /* Los renglones del factor. Con la C7-2 resuelta: 0,7866 (el libro escribe 0,7688 en una línea). */
  figuras: [FACTOR_PREGUNTA],
  pregunta: "¿Qué da 0,7866 × $4.200.000?",
  opciones: [
    { id: "factura", texto: "$3.303.720", correcta: true },
    { id: "rebaja", texto: "$896.280", devolucion: "Esa es la rebaja. El factor da lo que queda por facturar." },
    { id: "rebaja-23", texto: "$966.000", devolucion: "Esa sería la rebaja con el 23 %. El factor da lo que queda por facturar." },
  ],
  acierto: { texto: "Así es: el mismo valor a facturar, con menos pasos.", pie: "Basado en el libro, p. 250" },
  error: { pie: "Basado en el libro, p. 250" },
  pie: "Basado en el libro, p. 250",
};

const ASIENTO = {
  id: "asiento",
  tipo: "lectura",
  parrafos: ["Con el IVA del 16 % y la retención del 3,5 %, este es el asiento. El libro redondea al peso."],
  /* Sin fecha: el libro pone «xxxx». «Ventas» va como «Ingresos por ventas» (regla 8). Las sumas son de Near. */
  asientos: [{
    fecha: null,
    lineas: [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: C.cliente },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: C.retencion },
      { cuenta: "IVA por pagar", lado: HABER, monto: C.iva },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: C.factura },
    ],
    sumas: true,
  }],
  tras: ["Los descuentos no aparecen: Ingresos por ventas va por el valor a facturar."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 250",
  /* Aquí se dan las tarifas: la frase va en el pie. */
  pieTarifas: true,
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* La cadena de renglones completa, con el camino de la lista a lo facturado arriba. */
  figuras: [{ ...CADENA, titulo: "$4.200.000 → $3.303.720" }],
  tras: [
    "En una cadena, cada descuento va sobre el saldo que dejó el anterior, así que la rebaja es menor que la suma.",
    "El atajo: multiplica los complementos y aplica el factor al precio de lista.",
  ],
  siguiente: "Siguiente: practica con varios descuentos seguidos.",
  pie: "Basado en el libro, pp. 249-250",
};

export const PIEZA_DESCUENTOS_EN_CADENA = {
  id: A2_ID,
  numero: 2,
  titulo: "Descuentos en cadena",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, EJEMPLO, PASOS, ATAJO, ASIENTO, RESUMEN],
};
