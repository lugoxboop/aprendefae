/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A6 DE APRENDER — «Devoluciones en permanente» (pp. 230 y 246-248).
 * Ejemplos G-3 y G-4 del libro: los dos libros del mismo hecho.
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-2-a6-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Seis pantallas.
 *
 * LISTA DE CONTROL: no se ve ninguna cifra de X4 (2.432.000 · 532.000 ·
 * 17.100.000 · 384.000 · 84.000 · 2.700.000 · 2.784.000 · 17.632.000): las
 * líneas con esos montos van con ●. Se ven los datos (1.900 y 300 unidades,
 * $8.000 y $3.200, 15.200.000 y 2.400.000) y el costo de G-4 (6.080.000 y
 * 960.000), libres en T7-2. No hay sumas. Una prueba lo vigila.
 *
 * Nombres de cuenta de la regla 8. La línea «Esta cuenta se resta de
 * Ingresos por ventas…» va pegada al asiento que trae Devoluciones de ventas.
 *
 * Lo que la v1 no trae y se toma de la convención (T7-1, A1-A5 de T7-2): los
 * botones, «Correcto.» e «Incorrecto.», los rótulos de la ficha con el primer
 * dato en mayúscula, el pie de los errores (el de su pantalla) y la fecha del
 * primer asiento de la devolución de G-4, el 22 de marzo del enunciado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A6_ID = "t7-2-a6-devoluciones";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras de X4: nunca se muestran en T7-2. */
export const X4 = [2_432_000, 532_000, 17_100_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];

/* Los datos: 1.900 unidades a $8.000; se devuelven 300; a Tierra Bomba cada una le costó $3.200. */
export const DATOS_A6 = { unidades: 1900, precio: 8000, devueltas: 300, costo: 3200 };
const D = DATOS_A6;
const COMPRA = D.unidades * D.precio;
const DEVOLUCION = D.devueltas * D.precio;
const COSTO_VENTA = D.unidades * D.costo;
const COSTO_DEVUELTO = D.devueltas * D.costo;

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás registrar una devolución de compra y una de venta en el permanente.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 246-248",
};

const QUE_ES = {
  id: "que-es",
  tipo: "lectura",
  parrafos: ["A veces la mercancía llega en mal estado y el comprador la devuelve. Para quien compra es una devolución de compras. Para quien vende, es una devolución de ventas."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 230",
};

/* P2 · G-3, el libro del comprador. */
const PIE_G3 = "Basado en el libro, pp. 246-247";
const EL_COMPRADOR = {
  id: "libro-del-comprador",
  tipo: "eleccion",
  enunciado: "El 18 de marzo, Santa Martha le compra a crédito a Tierra Bomba 1.900 unidades del producto ABX, a $8.000 cada una, más el IVA. El 22 de marzo le devuelve 300 unidades que llegaron en mal estado, y le pide que se las rebaje de lo que le debe. Usa el sistema de inventario permanente.",
  ficha: [
    { dato: "Quién recibe", texto: "Tierra Bomba" },
    { dato: "Quién entrega", texto: "Santa Martha" },
    { dato: "Monto", texto: "300 unidades a $8.000" },
    { dato: "Tipo", texto: "Se rebaja de la deuda de una compra a crédito" },
    { dato: "Clase de hecho", texto: "Devolución de mercancía en mal estado" },
  ],
  /* El asiento de la compra, ya resuelto. null = ● (monto de X4). */
  asientos: [{
    fecha: "18 de marzo",
    lineas: [
      { cuenta: "Inventario de mercancías", lado: DEBE, monto: COMPRA },
      { cuenta: "IVA por pagar", lado: DEBE, monto: null },
      { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
      { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: null },
    ],
  }],
  pregunta: "¿A qué cuenta va, en el haber, el valor de las 300 unidades devueltas?",
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías", correcta: true },
    { id: "devoluciones", texto: "Devoluciones de compras", correcta: false, devolucion: "Esa cuenta es del periódico. Aquí la compra fue a Inventario de mercancías, y la devolución se anota ahí." },
    { id: "compras", texto: "Compras", correcta: false, devolucion: "En el permanente no existe Compras. La compra fue a Inventario de mercancías, y la devolución la reversa ahí." },
  ],
  pie: PIE_G3,
  error: { pie: PIE_G3 },
  acierto: {
    texto: "Así es. La mercancía sale de la bodega de vuelta al proveedor: Inventario de mercancías baja por $2.400.000.",
    asientos: [{
      fecha: "22 de marzo",
      lineas: [
        { cuenta: "Cuentas por pagar – proveedores", lado: DEBE, monto: null },
        { cuenta: "Retención en la fuente por pagar", lado: DEBE, monto: null },
        { cuenta: "IVA por pagar", lado: HABER, monto: null },
        { cuenta: "Inventario de mercancías", lado: HABER, monto: DEVOLUCION },
      ],
    }],
    pie: PIE_G3,
  },
};

/* P3 · G-4, el libro del vendedor: dos asientos resueltos y el segundo de la devolución por colocar. */
const PIE_G4 = "Basado en el libro, pp. 230 y 247-248";
const EL_VENDEDOR = {
  id: "libro-del-vendedor",
  tipo: "lados",
  parrafos: ["Ahora el libro de Tierra Bomba, que vendió. Usa el sistema permanente y estima que cada unidad le costó $3.200."],
  asientos: [
    {
      fecha: "18 de marzo",
      lineas: [
        { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: null },
        { cuenta: "Anticipo fiscal", lado: DEBE, monto: null },
        { cuenta: "IVA por pagar", lado: HABER, monto: null },
        { cuenta: "Ingresos por ventas", lado: HABER, monto: COMPRA },
        { cuenta: "Costo de mercancía vendida", lado: DEBE, monto: COSTO_VENTA },
        { cuenta: "Inventario de mercancías", lado: HABER, monto: COSTO_VENTA },
      ],
    },
    {
      /* El primer asiento de la devolución, ya resuelto (la v1 lo da en una línea, sin fecha). */
      fecha: "22 de marzo",
      lineas: [
        { cuenta: "Devoluciones de ventas", lado: DEBE, monto: DEVOLUCION },
        { cuenta: "IVA por pagar", lado: DEBE, monto: null },
        { cuenta: "Anticipo fiscal", lado: HABER, monto: null },
        { cuenta: "Cuentas por cobrar – clientes", lado: HABER, monto: null },
      ],
    },
  ],
  /* Regla 8: pegada al asiento que trae «Devoluciones de ventas». */
  despues: ["Esta cuenta se resta de Ingresos por ventas en el estado de resultados."],
  consigna: "La devolución de una venta lleva un segundo asiento. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "inventario", cuenta: "Inventario de mercancías", monto: COSTO_DEVUELTO, lado: DEBE, devolucion: "Vuelve mercancía a la bodega, así que el activo aumenta: va al debe." },
    { id: "costo", cuenta: "Costo de mercancía vendida", monto: COSTO_DEVUELTO, lado: HABER, devolucion: "Se reversa el costo de lo que volvió: el costo de la mercancía vendida baja, y va al haber." },
  ],
  pie: PIE_G4,
  error: { pie: PIE_G4 },
  acierto: { texto: "Así es. Son 300 unidades a $3.200: vuelven $960.000 al inventario y salen del costo.", pie: PIE_G4 },
};

/* P4 · frente al periódico: la versión del periódico va dentro del ítem (regla 3). */
const PIE_FRENTE = "Basado en el libro, pp. 230 y 246";
const FRENTE = {
  id: "frente-al-periodico",
  tipo: "eleccion",
  pregunta: "En el periódico, la devolución de compras va a Devoluciones de compras. ¿Por qué en el permanente va a Inventario de mercancías?",
  opciones: [
    { id: "la-compra", texto: "Porque la compra se anotó en Inventario de mercancías.", correcta: true },
    { id: "no-se-registran", texto: "Porque en el permanente las devoluciones no se registran.", correcta: false, devolucion: "Sí se registran: se reversa la compra por el valor de lo devuelto." },
    { id: "solo-vendedor", texto: "Porque Devoluciones de compras es solo para el vendedor.", correcta: false, devolucion: "Devoluciones de compras es la cuenta del comprador en el periódico. En el permanente no se usa, porque no existe Compras." },
  ],
  pie: PIE_FRENTE,
  error: { pie: PIE_FRENTE },
  acierto: { texto: "Exacto. La devolución reversa la compra en la misma cuenta donde se anotó.", pie: PIE_FRENTE },
};

/* P5 · Resumen. La v1 no trae «Siguiente»: la pieza que sigue, H5, todavía no está. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "En el permanente, lo que se le devuelve al proveedor sale por el haber de Inventario de mercancías.",
    "La devolución de ventas lleva dos asientos: el de lo que se cobró y el del costo.",
    "El segundo asiento devuelve el costo al inventario.",
  ],
  pie: "Basado en el libro, pp. 246-248",
};

export const PIEZA_DEVOLUCIONES = {
  id: A6_ID,
  numero: 6,
  titulo: "Devoluciones en permanente",
  kardex: {},
  pantallas: [PORTADA, QUE_ES, EL_COMPRADOR, EL_VENDEDOR, FRENTE, RESUMEN],
};
