import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";
import { H3_LIBRO } from "./contabilidadT7_3_a3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A4 DE APRENDER — «El descuento en los dos libros» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a4-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * El ejemplo H-3 del libro (pp. 253-254) en el libro de quien compra, el
 * cierre contra Ganancias y pérdidas y el cambio en el permanente. Las cifras
 * son las mismas de A3 (es el mismo ejemplo): se leen de ahí. Erratas que
 * declara: C7-9 (598.500), C7-17 (condicionado), C7-26 (no se dice
 * «comparador»), C7-27 (Compras) y C7-30 (Caja o Bancos). «Retefuente por
 * pagar» va con su nombre de la regla 8.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, y el
 * pie de cada pantalla, con las páginas de la columna «Fuente» (el de los
 * asientos y las cuentas T, sí lo da la v1). En los asientos del 30 de junio
 * y en las cuentas T, el nombre de cada empresa va arriba, como lo escribe
 * la v1 («San Calixto:», «Santa Martha:»), y el nombre de la cuenta T es el
 * de la cuenta que se cierra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A4_ID = "t7-3-descuento-en-dos-libros";

const C = H3_LIBRO;
const DCC = "Descuento comercial condicionado";
const GYP = "Ganancias y pérdidas";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás cómo anota el descuento quien compra, y cómo se cierra la cuenta.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 253-254",
};

const QUIEN_COMPRA = {
  id: "quien-compra",
  tipo: "lectura",
  parrafos: [
    "En la pieza anterior, San Calixto le vendió a Santa Martha con un descuento condicionado. Santa Martha pagó a los diez días y recibió el 15 %.",
    "Ahora mira el mismo hecho desde el libro de Santa Martha, que es quien compra.",
    "Para quien compra, el descuento es un ingreso: había comprado por un valor y, al final, paga menos.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 251-253",
};

const REPASO = {
  id: "repaso",
  tipo: "lectura",
  parrafos: [
    "Santa Martha usa el sistema periódico. En ese sistema, quien compra anota la mercancía en la cuenta Compras.",
    "El IVA de la compra va al debe de IVA por pagar. La retención que Santa Martha le descuenta al proveedor va al haber de Retención en la fuente por pagar.",
  ],
  /* C7-27: el libro escribe «Compra de mercancías». */
  asientos: [{
    fecha: "25 de mayo",
    lineas: [
      { cuenta: "Compras", lado: DEBE, monto: C.factura },
      { cuenta: "IVA por pagar", lado: DEBE, monto: C.iva },
      { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: C.retencion },
      { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: C.cliente },
    ],
    sumas: true,
  }],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 253",
};

const EL_PAGO = {
  id: "el-pago",
  tipo: "eleccion",
  pregunta: "El 4 de junio, Santa Martha paga y recibe el descuento. ¿A qué lado va Descuento comercial condicionado en su libro?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "En el libro de quien recibe el descuento, la cuenta va al haber. Santa Martha lo recibe." },
    { id: "haber", texto: "Haber", correcta: true },
  ],
  acierto: {
    texto: "Así es. Santa Martha recibe el descuento, así que la cuenta va al haber.",
    /* C7-9 (598.500), C7-17 (condicionado) y C7-30 (Caja o Bancos). */
    asientos: [{
      fecha: "4 de junio",
      lineas: [
        { cuenta: "Cuentas por pagar – proveedores", lado: DEBE, monto: C.cliente },
        { cuenta: DCC, lado: HABER, monto: C.condicionado },
        { cuenta: "Caja o Bancos", lado: HABER, monto: C.pago },
      ],
      sumas: true,
    }],
    despues: [
      "Las dos empresas usan la misma cuenta, Descuento comercial condicionado. Va al debe cuando la empresa da el descuento, y al haber cuando lo recibe.",
      "Fíjate: Cuentas por pagar – proveedores sale completa, por $4.488.750. Santa Martha ya no le debe nada a San Calixto.",
    ],
    pie: "Basado en el libro, p. 253",
  },
  error: { pie: "Basado en el libro, p. 253" },
  pie: "Basado en el libro, p. 253",
};

const CIERRE = {
  id: "cierre",
  tipo: "eleccion",
  parrafos: ["Al final del periodo, esta cuenta se cierra contra Ganancias y pérdidas. Cerrarla es dejarla en cero: su saldo pasa a Ganancias y pérdidas."],
  /* Las cuentas T de la p. 254, con las fechas como las escribe el libro. */
  cuentasT: [
    { titular: "San Calixto", cuenta: DCC, debe: [{ monto: C.condicionado, fecha: "jun-04" }], haber: [{ monto: C.condicionado, fecha: "jun-30" }] },
    { titular: "Santa Martha", cuenta: DCC, debe: [{ monto: C.condicionado, fecha: "jun-30" }], haber: [{ monto: C.condicionado, fecha: "jun-04" }] },
  ],
  pregunta: "En el libro de San Calixto, la cuenta tenía saldo en el debe. ¿A qué lado va para cerrarla?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "La cuenta tenía saldo en el debe. Para dejarla en cero, se anota al lado contrario: al haber." },
    { id: "haber", texto: "Haber", correcta: true },
  ],
  acierto: {
    texto: "Así es. Para dejarla en cero, se anota al lado contrario de su saldo: al haber. Ganancias y pérdidas va al debe.",
    asientos: [
      { titular: "San Calixto", fecha: "30 de junio", lineas: [{ cuenta: GYP, lado: DEBE, monto: C.condicionado }, { cuenta: DCC, lado: HABER, monto: C.condicionado }] },
      { titular: "Santa Martha", fecha: "30 de junio", lineas: [{ cuenta: DCC, lado: DEBE, monto: C.condicionado }, { cuenta: GYP, lado: HABER, monto: C.condicionado }] },
    ],
    despues: ["En Santa Martha pasa al revés: la cuenta tenía saldo en el haber, así que se cierra por el debe."],
    pie: "Basado en el libro, p. 254",
  },
  error: { pie: "Basado en el libro, p. 254" },
  pie: "Basado en el libro, p. 254",
};

const NO_OPERACIONAL = {
  id: "no-operacional",
  tipo: "lectura",
  parrafos: [
    "Si la cuenta termina con saldo en el debe, va al estado de resultados como un gasto no operacional. Si termina en el haber, va como un ingreso no operacional.",
    /* [CONSTRUCCIÓN: la glosa única de la célula, regla 8], la de AP4 de T7-1. */
    "No operacionales quiere decir que no son de la operación.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 253",
};

const PERMANENTE = {
  id: "permanente",
  tipo: "lectura",
  parrafos: [
    "Si las dos empresas usaran el sistema permanente, el libro dice que habría dos cambios.",
    "Primero, San Calixto haría un asiento más: el del costo de lo que vendió.",
    "Y Santa Martha no usaría la cuenta Compras. La compra iría al debe de Inventario de mercancías.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 254",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Quien compra anota el descuento en el haber, porque lo recibe.",
    "Quien vende lo anota en el debe, porque lo da. Los dos usan la misma cuenta.",
    "Al final del periodo, la cuenta se cierra contra Ganancias y pérdidas.",
  ],
  siguiente: "Siguiente: ¿el descuento es comercial o condicionado?",
  pie: "Basado en el libro, pp. 253-254",
};

export const PIEZA_EL_DESCUENTO_EN_DOS_LIBROS = {
  id: A4_ID,
  numero: 4,
  titulo: "El descuento en los dos libros",
  pantallas: [PORTADA, QUIEN_COMPRA, REPASO, EL_PAGO, CIERRE, NO_OPERACIONAL, PERMANENTE, RESUMEN],
};
