import { BOTON, DEBE, HABER, FRASE_TARIFAS } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A3 DE APRENDER — «El descuento condicionado» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a3-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * El ejemplo H-3 del libro (pp. 251-253) visto desde quien vende, resuelto:
 * A3 es dueña de sus cifras, junto con A4, y ninguna pieza de Hacer las
 * pide. C7-6 resuelta (la venta es del 25 de mayo); C7-30: el libro escribe
 * «Caja», y aquí va «Caja o Bancos» (regla 8). La suma del asiento del 25 de
 * mayo (4.628.400) es de Near.
 *
 * UNA PREGUNTA POR PANTALLA: la pantalla 5 de la v1 trae dos preguntas
 * seguidas (qué descuento le toca y sobre qué valor se calcula). Van en dos
 * pantallas, «5 · cuál» y «5 · sobre qué», en el mismo orden y con los mismos
 * textos: es la forma de todas las piezas de Aprender de la célula.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, los
 * rótulos de la ficha (y «Sistema», de la v1), y el pie de cada pantalla,
 * con las páginas de la columna «Fuente» (el de cada asiento, «Basado en el
 * libro, p. 252», sí lo da la v1). La fecha del asiento va como la nombra la
 * v1: «25 de mayo», «4 de junio».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A3_ID = "t7-3-descuento-condicionado";

/* Las cifras de H-3 que muestra A3 (pp. 252-253). Una prueba las recalcula. */
export const H3_LIBRO = {
  lista: 4_200_000, comercial: 210_000, factura: 3_990_000, iva: 638_400, retencion: 139_650, cliente: 4_488_750,
  sumasVenta: 4_628_400, condicionado: 598_500, pago: 3_890_250,
};
const C = H3_LIBRO;

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué es un descuento condicionado y cómo lo registra quien vende.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 251-253",
};

const QUE_ES = {
  id: "que-es",
  tipo: "eleccion",
  parrafos: [
    "El descuento condicionado depende de una condición. Por ejemplo, que el cliente pague dentro de un plazo.",
    "El descuento no va en la factura: se factura el valor completo. Como todavía no se sabe si el cliente va a cumplir, no se puede saber cuánto será el descuento.",
    "El descuento se registra cuando el cliente cumple la condición. Casi siempre, eso pasa después de la venta.",
  ],
  pregunta: "¿Cuál de los dos descuentos se registra en la contabilidad?",
  opciones: [
    { id: "comercial", texto: "El comercial", devolucion: "El comercial ya viene restado en la factura, así que no se registra. El que se registra es el condicionado, cuando el cliente cumple." },
    { id: "condicionado", texto: "El condicionado", correcta: true },
  ],
  acierto: { texto: "Así es. El comercial no se registra, porque ya viene restado en la factura. El condicionado sí, cuando el cliente cumple.", pie: "Basado en el libro, pp. 248 y 251" },
  error: { pie: "Basado en el libro, pp. 248 y 251" },
  pie: "Basado en el libro, pp. 248 y 251",
};

const UN_GASTO = {
  id: "un-gasto",
  tipo: "lectura",
  parrafos: [
    "Para quien vende, este descuento es un gasto: vendió por un valor y, al final, recibe menos.",
    "No es una devolución, porque no vuelve ninguna mercancía. Solo se rebaja el precio que se había facturado.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 251-252",
};

const NINGUNO_30 = "A los treinta días ya no aplica ningún descuento. Paga el valor total de la factura.";

const CONDICIONES = {
  id: "condiciones",
  tipo: "eleccion",
  parrafos: [
    "Una venta puede traer varias condiciones a la vez, y cada una tiene su forma de escribirse. Mira las del libro: 5 %, 15/10, 5/20 y n/30.",
    "El 5 % es un descuento comercial: se resta del precio de lista, en la factura.",
    "15/10 quiere decir que el cliente recibe un descuento del 15 % si paga a los diez días.",
    "5/20 quiere decir que recibe un 5 % si paga a los veinte días.",
    "Y n/30 quiere decir que, si no toma ningún descuento, paga el valor total de la factura a los treinta días.",
  ],
  pregunta: "Si el cliente paga a los treinta días, ¿qué descuento condicionado recibe?",
  /* «Error (15 % o 5 %)»: el mismo texto para las dos. */
  opciones: [
    { id: "quince", texto: "15 %", devolucion: NINGUNO_30 },
    { id: "cinco", texto: "5 %", devolucion: NINGUNO_30 },
    { id: "ninguno", texto: "Ninguno", correcta: true },
  ],
  acierto: { texto: "Así es. A los treinta días ya no hay descuento: paga el total de la factura.", pie: "Basado en el libro, p. 252" },
  error: { pie: "Basado en el libro, p. 252" },
  pie: "Basado en el libro, p. 252",
};

const EJEMPLO = {
  id: "ejemplo",
  tipo: "lectura",
  parrafos: [
    /* C7-6 resuelta: la venta es del 25 de mayo. */
    "Mira el ejemplo del libro. El 25 de mayo, San Calixto Ltda. le vende mercancía a crédito a Santa Martha. El precio de lista es de $4.200.000, más el IVA, con las condiciones 5 %, 15/10, 5/20, n/30.",
    "Santa Martha paga la factura el 4 de junio. Las dos empresas usan el sistema de inventario periódico.",
  ],
  ficha: [
    { dato: "Quién entrega", texto: "San Calixto" },
    { dato: "Quién recibe", texto: "Santa Martha" },
    { dato: "Monto", texto: "$4.200.000 de lista, con 5 %, 15/10, 5/20, n/30" },
    { dato: "Tipo", texto: "A crédito, pagada el 4 de junio" },
    { dato: "Clase de hecho", texto: "Venta de mercancía" },
    { dato: "Sistema", texto: "Periódico" },
  ],
  despues: [
    "Primero va el descuento comercial, que es el 5 % del precio de lista: $4.200.000 × 5 % = $210.000. Por eso se factura $3.990.000.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre lo facturado.",
    FRASE_TARIFAS,
    "Sobre $3.990.000, el IVA es de $638.400 y la retención, de $139.650. Santa Martha queda debiendo $4.488.750.",
  ],
  /* «Ventas» va como «Ingresos por ventas» (regla 8). Las sumas son de Near. */
  asientos: [{
    fecha: "25 de mayo",
    lineas: [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: C.cliente },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: C.retencion },
      { cuenta: "IVA por pagar", lado: HABER, monto: C.iva },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: C.factura },
    ],
    sumas: true,
  }],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 252",
};

const CUAL_LE_TOCA = {
  id: "cual-le-toca",
  tipo: "eleccion",
  pregunta: "El 4 de junio, Santa Martha paga. Del 25 de mayo al 4 de junio pasaron diez días. ¿Qué descuento condicionado le toca?",
  opciones: [
    { id: "quince", texto: "15 %", correcta: true },
    { id: "cinco", texto: "5 %", devolucion: "Pagó a los diez días. Con la condición 15/10, le toca el 15 %." },
    { id: "ninguno", texto: "Ninguno", devolucion: "Pagó a los diez días. Con la condición 15/10, le toca el 15 %." },
  ],
  acierto: { texto: "Así es. Pagó a los diez días, así que le toca el 15 %.", pie: "Basado en el libro, pp. 252-253" },
  error: { pie: "Basado en el libro, pp. 252-253" },
  pie: "Basado en el libro, pp. 252-253",
};

const SOBRE_QUE = {
  id: "sobre-que",
  tipo: "eleccion",
  pregunta: "¿Sobre qué valor se calcula el 15 %?",
  opciones: [
    { id: "factura", texto: "$3.990.000", correcta: true },
    { id: "con-iva", texto: "$4.488.750", devolucion: "Ese valor incluye el IVA. El libro dice que el descuento no puede tocar el IVA, porque ese dinero es del Estado. Se calcula sobre $3.990.000." },
    { id: "lista", texto: "$4.200.000", devolucion: "Ese es el precio de lista. El 15 % se calcula sobre lo facturado, que ya tiene el 5 % restado: $3.990.000." },
  ],
  acierto: {
    texto: "Así es. Se calcula sobre lo facturado por la mercancía, sin el IVA: $3.990.000 × 15 % = $598.500.",
    parrafos: [
      "Santa Martha debía $4.488.750. Le restan el descuento de $598.500, así que paga $3.890.250.",
      "El libro anota este descuento en una cuenta que se llama Descuento comercial condicionado. Cuando la empresa da el descuento, la cuenta va al debe.",
    ],
    /* C7-30: el libro escribe «Caja»; va «Caja o Bancos» (regla 8). */
    asientos: [{
      fecha: "4 de junio",
      lineas: [
        { cuenta: "Caja o Bancos", lado: DEBE, monto: C.pago },
        { cuenta: "Descuento comercial condicionado", lado: DEBE, monto: C.condicionado },
        { cuenta: "Cuentas por cobrar – clientes", lado: HABER, monto: C.cliente },
      ],
      sumas: true,
    }],
    despues: ["Fíjate: Cuentas por cobrar – clientes sale completa, por $4.488.750. El cliente ya no debe nada."],
    pie: "Basado en el libro, p. 252",
  },
  error: { pie: "Basado en el libro, p. 253" },
  pie: "Basado en el libro, p. 253",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
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
  pantallas: [PORTADA, QUE_ES, UN_GASTO, CONDICIONES, EJEMPLO, CUAL_LE_TOCA, SOBRE_QUE, RESUMEN],
};
