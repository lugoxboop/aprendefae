import { BOTON, DEBE, HABER, ROTULOS_PATRON } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A3 DE APRENDER — «El descuento condicionado» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md), con las
 * correcciones de Mello: el acierto de P2 visible («…Para quien vende es un
 * gasto…», mello-recortes-v1.md) y, llegados por L, las pistas de P2 y P4 y
 * los pies del acierto y del error de P4 («pp. 252-253»). Seis pantallas: la
 * línea de plazos llega primero y lo que lleva cada plazo, solo con el
 * acierto. La frase de las tarifas va en el pie de P3, cuyo plegado da el
 * IVA y la retención.
 *
 * El ejemplo H-3 del libro (pp. 251-253) visto desde quien vende, resuelto:
 * A3 es dueña de sus cifras, junto con A4, y ninguna pieza de Hacer las
 * pide. C7-6 resuelta (la venta es del 25 de mayo); C7-30: el libro escribe
 * «Caja», y aquí va «Caja o Bancos» (regla 8). La suma del asiento del 25 de
 * mayo (4.628.400) es de Near.
 *
 * Los botones y mensajes son los de A1 de T7-3; el pie de cada pantalla,
 * con las páginas de su fuente. Los asientos van sin fecha ni sumas, como
 * los da el recorte.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A3_ID = "t7-3-descuento-condicionado";

/* Las cifras de H-3 que muestra A3 (pp. 252-253). Una prueba las recalcula. */
export const H3_LIBRO = {
  lista: 4_200_000, comercial: 210_000, factura: 3_990_000, iva: 638_400, retencion: 139_650, cliente: 4_488_750,
  sumasVenta: 4_628_400, condicionado: 598_500, pago: 3_890_250,
};
const C = H3_LIBRO;

/*
 * Patrón T7-3 (Watari): la franja de plazos de 5 %, 15/10, 5/20, n/30 y la
 * cuenta en renglones de la factura, del descuento y del pago. Rótulos y
 * títulos de Watari, revisados por Near.
 * Los usan también A4 y H4.
 */
export const ROTULOS_A3 = {
  descuentoCondicionadoTit: "El descuento condicionado",
  facturado: "Lo facturado por la mercancía",
  condicion: (c) => `Condición ${c}`,
  descuentoCondicionado: "Descuento condicionado",
  pagoDel: (fecha) => `El pago del ${fecha}`,
  loQueDebia: (quien) => `Lo que debía ${quien}`,
  paga: "Paga",
  sinDescuento: "sin descuento",
};
const CONDICIONES_LIBRO = [
  { cond: "5 %" }, { cond: "15/10", dia: 10, lleva: "15 %" }, { cond: "5/20", dia: 20, lleva: "5 %" }, { cond: "n/30", dia: 30, lleva: ROTULOS_A3.sinDescuento },
];
export const PLAZOS_A3 = (conPago) => ({ tipo: "plazos", venta: "25 may", condiciones: CONDICIONES_LIBRO, pago: conPago ? { dia: 10, fecha: "4 jun" } : null });
const FACTURA = {
  tipo: "renglones", titulo: ROTULOS_PATRON.factura("San Calixto"),
  filas: [
    { rot: ROTULOS_PATRON.precioLista, v: C.lista },
    { op: "−", rot: ROTULOS_PATRON.descuentoComercial(5), v: C.comercial },
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
  ],
};
/* El pago del 4 de junio, con los rótulos del recorte («Lo que debía»). */
const PAGO = {
  tipo: "renglones", titulo: ROTULOS_A3.pagoDel("4 de junio"),
  filas: [
    { rot: "Lo que debía", v: C.cliente },
    { op: "−", rot: ROTULOS_A3.descuentoCondicionado, v: C.condicionado },
    { op: "=", rot: ROTULOS_A3.paga, v: C.pago, res: true },
  ],
};
/*
 * La línea de plazos del recorte: «5 % · 15/10 · 5/20 · n/30», con los días
 * 10, 20 y 30. Lo que lleva cada plazo, solo con el acierto de P1; en el
 * resumen, con el pago del día 10.
 */
const PLAZOS_RECORTE = { tipo: "plazos", venta: null, condiciones: CONDICIONES_LIBRO, titulo: "5 % · 15/10 · 5/20 · n/30", rotDia: (d) => `día ${d}` };
const PLAZOS_PREGUNTA = { ...PLAZOS_RECORTE, ocultarLleva: true, alAcertar: { ocultarLleva: false } };
const PLAZOS_PAGO = { ...PLAZOS_RECORTE, pago: { dia: 10, fecha: "4 jun" } };

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué es un descuento condicionado y cómo lo registra quien vende.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 251-253",
};

const CONDICIONES = {
  id: "condiciones",
  pista: "Lee la condición que tiene el plazo de treinta días. ¿Trae algún porcentaje?",
  tipo: "eleccion",
  parrafos: ["San Calixto le vende a Santa Martha con estas condiciones:"],
  figuras: [PLAZOS_PREGUNTA],
  pregunta: "15/10 es un 15 % si paga a los diez días. ¿Qué descuento recibe si paga a los treinta?",
  /* «error · 15 % o 5 %»: el mismo texto para las dos. */
  opciones: [
    { id: "quince", texto: "15 %", devolucion: "A los treinta días ya no hay descuento." },
    { id: "cinco", texto: "5 %", devolucion: "A los treinta días ya no hay descuento." },
    { id: "ninguno", texto: "Ninguno", correcta: true },
  ],
  acierto: {
    texto: "Así es: a los treinta días paga el total.",
    /*
     * REGLA DE L: este plegado define 5/20 con una condición («si paga a los
     * veinte días»). No se pliega: va a la vista hasta que L decida.
     */
    porque: "El 5 % es un descuento comercial: se resta del precio de lista, en la factura. 5/20 es un 5 % si paga a los veinte días, y n/30 es pagar el total a los treinta.",
    porqueALaVista: true,
    pie: "Basado en el libro, p. 252",
  },
  error: { pie: "Basado en el libro, p. 252" },
  pie: "Basado en el libro, p. 252",
};

const QUE_ES = {
  id: "que-es",
  /* Pista de Mello (mello-pistas-distractores-v1.md): gana sobre la del recorte. */
  pista: "Un descuento se registra cuando se sabe cuánto es. ¿Cuándo se sabe cada uno?",
  tipo: "eleccion",
  parrafos: ["El descuento condicionado no va en la factura: se factura el valor completo, porque no se sabe si el cliente va a cumplir."],
  pregunta: "¿Cuál de los dos descuentos se registra en la contabilidad?",
  opciones: [
    { id: "comercial", texto: "El comercial", devolucion: "El comercial ya viene restado en la factura, así que no se registra." },
    { id: "condicionado", texto: "El condicionado", correcta: true },
    { id: "los-dos", texto: "Los dos", devolucion: "El comercial ya viene restado en la factura, así que no tiene un asiento propio." },
  ],
  acierto: {
    /* Mello: el acierto visible trae el gasto, que «Dos libros» P3 necesita. */
    texto: "Así es: se registra cuando el cliente cumple. Para quien vende es un gasto: recibe menos de lo que facturó.",
    porque: "Para quien vende, este descuento es un gasto: vendió por un valor y recibe menos. No es una devolución, porque no vuelve ninguna mercancía.",
    pie: "Basado en el libro, pp. 248 y 251",
  },
  error: { pie: "Basado en el libro, pp. 248 y 251" },
  pie: "Basado en el libro, pp. 248 y 251",
};

const CUAL_LE_TOCA = {
  id: "cual-le-toca",
  pista: "Calcula los días que pasaron y compáralos con el plazo de cada condición, de la más corta en adelante.",
  tipo: "eleccion",
  /* Los renglones de la factura (del libro), y el texto después. */
  figuras: [FACTURA],
  tras: ["Con el IVA, Santa Martha debe $4.488.750. Paga el 4 de junio, diez días después de la venta."],
  pregunta: "¿Qué descuento condicionado le toca?",
  opciones: [
    { id: "quince", texto: "15 %", correcta: true },
    { id: "cinco", texto: "5 %", devolucion: "Pagó a los diez días. Mira la condición de ese plazo." },
    { id: "ninguno", texto: "Ninguno", devolucion: "Pagó a los diez días. Mira la condición de ese plazo." },
  ],
  acierto: {
    texto: "Así es: pagó a los diez días, así que le toca el 15 %.",
    porque: "Sobre $3.990.000, el IVA es de $638.400 y la retención, de $139.650. El asiento de la venta es como el del descuento comercial: Ingresos por ventas va por $3.990.000.",
    pie: "Basado en el libro, pp. 252-253",
  },
  error: { pie: "Basado en el libro, pp. 252-253" },
  pie: "Basado en el libro, pp. 252-253",
  /* Las cifras del IVA y la retención salen de las tarifas: la frase va en el pie. */
  pieTarifas: true,
};

const SOBRE_QUE = {
  id: "sobre-que",
  /* Pista de Mello (mello-pistas-distractores-v1.md): gana sobre la del recorte. */
  pista: "Piensa qué parte de lo que debe Santa Martha es de la mercancía y qué parte es de otra cosa.",
  tipo: "eleccion",
  pregunta: "¿Sobre qué valor se calcula el 15 %?",
  opciones: [
    { id: "factura", texto: "$3.990.000", correcta: true },
    { id: "con-iva", texto: "$4.488.750", devolucion: "Ese valor incluye el IVA. El descuento no puede tocar el IVA, porque ese dinero es del Estado." },
    { id: "lista", texto: "$4.200.000", devolucion: "Ese es el precio de lista. El 5 % ya se había restado en la factura." },
  ],
  acierto: {
    texto: "Así es: $3.990.000 × 15 % = $598.500.",
    porque: "Fíjate: Cuentas por cobrar – clientes sale completa, por $4.488.750. El cliente ya no debe nada.",
    figuras: [PAGO],
    /* C7-30: el libro escribe «Caja»; va «Caja o Bancos» (regla 8). */
    asientos: [{
      fecha: null,
      lineas: [
        { cuenta: "Caja o Bancos", lado: DEBE, monto: C.pago },
        { cuenta: "Descuento comercial condicionado", lado: DEBE, monto: C.condicionado },
        { cuenta: "Cuentas por cobrar – clientes", lado: HABER, monto: C.cliente },
      ],
    }],
    despues: ["Va al debe de Descuento comercial condicionado, porque San Calixto lo da."],
    /* Pies de Mello (llegan por L). */
    pie: "Basado en el libro, pp. 252-253",
  },
  error: { pie: "Basado en el libro, pp. 252-253" },
  pie: "Basado en el libro, p. 253",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* La línea de plazos con el pago del día 10. */
  figuras: [PLAZOS_PAGO],
  tras: [
    "El descuento condicionado depende de una condición, y no va en la factura.",
    "Quien vende lo registra cuando el cliente cumple, en el debe de Descuento comercial condicionado.",
    "Se calcula sobre lo facturado por la mercancía, nunca sobre el IVA.",
  ],
  siguiente: "Siguiente: el mismo descuento, en el libro de Santa Martha.",
  pie: "Basado en el libro, pp. 251 y 253",
};

export const PIEZA_EL_DESCUENTO_CONDICIONADO = {
  id: A3_ID,
  numero: 3,
  titulo: "El descuento condicionado",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, CONDICIONES, QUE_ES, CUAL_LE_TOCA, SOBRE_QUE, RESUMEN],
};
