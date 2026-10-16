/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A5 DE APRENDER — «Fletes y devoluciones en permanente»
 * (pp. 228, 230 y 245-248). Ejemplos G-1 a G-4 del libro.
 *
 * Fuente: la FUSIÓN de Near (lote 1, entrega 5: orquestador/conocimiento/
 * paquetes/lote1-entrega5-v1.md, sección «## 1. T7-2 · «Fletes y devoluciones
 * en permanente»»), que une A5 «Fletes en permanente» y A6 «Devoluciones en
 * permanente» en una sola pieza con el id de A5. A6 (`t7-2-a6-devoluciones`)
 * salió de la lista; sus archivos se quedan. Encima van las correcciones
 * obligatorias de Mello (mello-entregas-4-5-6-v1.md, «Entrega 5» › «Fletes y
 * devoluciones en permanente»: P1, P2 y la línea del resumen). Una prueba
 * compara cada texto de aquí contra el paquete con Mello, letra por letra
 * (__tests__/correccionesMelloFusiones.mjs).
 *
 * Lo que une las dos: en el permanente no existe Compras. Sale el asiento
 * del costo de la venta de La Popa (`el-asiento-del-costo`): ya lo enseña y
 * lo practica A2.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Siete pantallas.
 *
 * LISTA DE CONTROL: no se ve ninguna cifra de X3 (1.200.000 · 262.500 ·
 * 8.437.500 · 6.500 · 643.500 · 8.700.000) ni de X4 (2.432.000 · 532.000 ·
 * 17.100.000 · 384.000 · 84.000 · 2.700.000 · 2.784.000 · 17.632.000): las
 * líneas de los asientos con esos montos van con la casilla vacía. Una prueba
 * lo vigila.
 *
 * Lo que el paquete no trae y se toma de A5 y A6 de antes (sus v1, con PASA
 * de Mello) y de la convención de T7-2: los botones, «Correcto.» e
 * «Incorrecto.», el pie de cada pantalla con sus páginas, los asientos que se
 * abren con «Ver…» (G-3 y G-4, tal como estaban en A6) y la pista de la línea
 * de inventario de `libro-del-vendedor` (la del lote 2 para esa misma línea
 * en A6: el paquete solo trae la de la línea del costo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A5_ID = "t7-2-a5-fletes";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras de X3 (fletes) y de X4 (devoluciones): nunca se muestran en T7-2. */
export const X3 = [1_200_000, 262_500, 8_437_500, 6_500, 643_500, 8_700_000];
export const X4 = [2_432_000, 532_000, 17_100_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];

const MERCANCIA = 7_500_000;
const FLETE = 650_000;
/* G-3 y G-4: 300 unidades devueltas, a $8.000; a Tierra Bomba cada una le costó $3.200. */
export const DATOS_DEVOLUCION = { devueltas: 300, precio: 8_000, costo: 3_200 };
const D = DATOS_DEVOLUCION;
const DEVOLUCION = D.devueltas * D.precio;
const COSTO_DEVUELTO = D.devueltas * D.costo;
const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const FECHA_DEV = "22 de marzo";

const INV = "Inventario de mercancías";
const INV_FLETES = "Inventario de mercancías (fletes)";
const GASTO_FLETES = "Gasto de venta – fletes";
const COMPRAS_FLETES = "Compras (fletes)";
const CMV = "Costo de mercancía vendida";

/* P0 · portada. */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué pasa con un flete y con una devolución en el sistema permanente.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 245-248",
};

/* P1 · G-1: el flete lo asume el comprador. */
const PIE_G = "Basado en el libro, pp. 245-246";
const EL_COMPRADOR = {
  id: "lo-asume-el-comprador",
  pista: "En el permanente, este flete sigue siendo parte del costo. ¿Qué cuenta guarda ese costo en este sistema?",
  tipo: "eleccion",
  /* Mello, entrega 5, punto 1: no «paga $650.000» (el libro retiene el 1 %). */
  parrafos: ["Santa Martha usa el permanente. Compra mercancía y asume un flete de $650.000 para traerla a su bodega."],
  pregunta: "¿A qué cuenta va el flete?",
  opciones: [
    { id: "inventario", texto: INV_FLETES, correcta: true },
    { id: "compras", texto: COMPRAS_FLETES, devolucion: "Compras es la cuenta del periódico. En el permanente no se usa." },
    { id: "gasto", texto: GASTO_FLETES, devolucion: "Ese es el flete que asume quien vende. Aquí lo asume quien compra." },
  ],
  acierto: {
    texto: "Así es: el flete se suma al costo de la mercancía.",
    porque: "Todo gasto directo que hace falta para tener la mercancía lista para la venta forma parte de su costo.",
    /* Figura del acierto: lo que entra al inventario (provisional para Watari). */
    figura: { tipo: "renglones", filas: [{ rot: INV, v: MERCANCIA }, { rot: INV_FLETES, v: FLETE }] },
    pie: PIE_G,
  },
  error: { pie: PIE_G },
  pie: PIE_G,
};

/* P2 · G-2: el flete lo asume el vendedor. */
const EL_VENDEDOR = {
  id: "lo-asume-el-vendedor",
  pista: "La Popa ya vendió esa mercancía. El flete no se suma al costo de nada que le quede.",
  tipo: "eleccion",
  /* Mello, entrega 5, punto 1: no «paga $650.000». */
  parrafos: ["Otro caso: el flete lo asume La Popa, que vende. Lleva la mercancía hasta Santa Martha y el flete vale $650.000."],
  pregunta: "¿A qué cuenta va ese flete?",
  opciones: [
    { id: "gasto", texto: GASTO_FLETES, correcta: true },
    { id: "compras", texto: COMPRAS_FLETES, devolucion: "La Popa no está comprando: está vendiendo." },
    { id: "inventario", texto: INV_FLETES, devolucion: "Ese flete no trae mercancía a la bodega de La Popa: la lleva al cliente." },
  ],
  acierto: { texto: "Así es: para quien vende, el flete es un gasto de venta, en los dos sistemas.", pie: PIE_G },
  error: { pie: PIE_G },
  pie: PIE_G,
};

/* P3 · G-3, el libro del comprador (de A6). */
const PIE_G3 = "Basado en el libro, pp. 246-247";
const ASIENTO_G3 = {
  fecha: FECHA_DEV,
  lineas: [
    { cuenta: "Cuentas por pagar – proveedores", lado: DEBE, monto: null },
    { cuenta: "Retención en la fuente por pagar", lado: DEBE, monto: null },
    { cuenta: "IVA por pagar", lado: HABER, monto: null },
    { cuenta: INV, lado: HABER, monto: DEVOLUCION },
  ],
};
const LIBRO_COMPRADOR = {
  id: "libro-del-comprador",
  pista: "En el permanente, la compra entró a una cuenta. La devolución saca la mercancía de esa misma cuenta.",
  tipo: "eleccion",
  parrafos: ["Santa Martha le compró a Tierra Bomba. Le devuelve 300 unidades que le llegaron mal."],
  pregunta: "¿A qué cuenta va, en el haber, el valor de las 300 devueltas?",
  opciones: [
    { id: "inventario", texto: INV, correcta: true },
    { id: "devoluciones", texto: "Devoluciones de compras", devolucion: "Esa cuenta es del periódico. Aquí la devolución reversa la compra en su misma cuenta." },
    { id: "compras", texto: "Compras", devolucion: "En el permanente no existe Compras." },
  ],
  acierto: {
    texto: "Así es: la mercancía vuelve al proveedor y el inventario baja.",
    figura: { tipo: "cuenta", texto: `${D.devueltas} × $${cifra(D.precio)} = $${cifra(DEVOLUCION)}` },
    /* El «¿Por qué?» plegado de Near es el asiento completo: se abre con su botón. */
    ver: { texto: "Ver el asiento completo de la devolución.", asientos: [ASIENTO_G3] },
    pie: PIE_G3,
  },
  error: { pie: PIE_G3 },
  pie: PIE_G3,
};

/* P4 · G-4, el libro del vendedor (de A6): el segundo asiento de la devolución. */
const PIE_G4 = "Basado en el libro, pp. 230 y 247-248";
const ASIENTO_G4_1 = {
  fecha: FECHA_DEV,
  lineas: [
    { cuenta: "Devoluciones de ventas", lado: DEBE, monto: DEVOLUCION },
    { cuenta: "IVA por pagar", lado: DEBE, monto: null },
    { cuenta: "Anticipo fiscal", lado: HABER, monto: null },
    { cuenta: "Cuentas por cobrar – clientes", lado: HABER, monto: null },
  ],
};
const ASIENTO_G4_2 = {
  fecha: FECHA_DEV,
  lineas: [
    { cuenta: INV, lado: DEBE, monto: COSTO_DEVUELTO },
    { cuenta: CMV, lado: HABER, monto: COSTO_DEVUELTO },
  ],
};
const LIBRO_VENDEDOR = {
  id: "libro-del-vendedor",
  tipo: "lados",
  parrafos: ["Tierra Bomba vendió y recibe la devolución. Cada unidad le costó $3.200. Ya anotó lo que dejó de cobrar; falta el costo."],
  consigna: "Toca Debe o Haber en cada línea.",
  lineas: [
    /* La pista de esta línea es la del lote 2 para la misma línea en A6 (el paquete de la fusión solo trae la del costo). */
    { id: "inventario", cuenta: INV, monto: COSTO_DEVUELTO, lado: DEBE, pista: "Vuelve mercancía a la bodega. ¿De qué lado sube un activo?", devolucion: "Vuelve mercancía a la bodega, así que el activo aumenta: va al debe." },
    { id: "costo", cuenta: CMV, monto: COSTO_DEVUELTO, lado: HABER, pista: "Lo devuelto ya no es una venta, así que su costo baja. ¿De qué lado baja un costo?", devolucion: "Se reversa el costo de lo que volvió: baja, y va al haber." },
  ],
  acierto: {
    texto: "Así es: vuelven $960.000 al inventario.",
    figura: { tipo: "cuenta", texto: `${D.devueltas} × $${cifra(D.costo)} = $${cifra(COSTO_DEVUELTO)}` },
    porque: "El primer asiento va a Devoluciones de ventas, que se resta de Ingresos por ventas en el estado de resultados.",
    ver: { texto: "Ver los dos asientos de Tierra Bomba.", asientos: [ASIENTO_G4_1, ASIENTO_G4_2] },
    pie: PIE_G4,
  },
  error: { pie: PIE_G4 },
  pie: PIE_G4,
};

/* P5 · frente al periódico: los dos casos a la vez. */
const PIE_FRENTE = "Basado en el libro, pp. 228, 230 y 245-246";
const FRENTE = {
  id: "frente-al-periodico",
  pista: "¿A qué cuenta fue la compra en el permanente?",
  tipo: "eleccion",
  pregunta: "En el periódico, ese flete va a Compras (fletes) y la devolución, a Devoluciones de compras. ¿Por qué en el permanente las dos van a Inventario de mercancías?",
  opciones: [
    { id: "no-existe", texto: "Porque no existe Compras.", correcta: true },
    { id: "gastos", texto: "Porque las dos son gastos.", devolucion: "El flete del comprador sigue siendo costo." },
    { id: "no-se-registran", texto: "Porque no se registran aparte.", devolucion: "Sí se registran, pero en la cuenta donde se anotó la compra." },
  ],
  acierto: { texto: "Exacto: todo lo de la compra va a la cuenta del inventario.", pie: PIE_FRENTE },
  error: { pie: PIE_FRENTE },
  pie: PIE_FRENTE,
};

/* P6 · resumen: tres fichas (provisionales para Watari) y tres frases. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  figura: { tipo: "fichas", fichas: ["Flete del comprador: inventario", "Flete del vendedor: gasto", "Devolución: inventario"] },
  parrafos: [
    "En el permanente, el flete del comprador y la devolución de compras van a Inventario de mercancías.",
    "El flete del vendedor es un gasto de venta, en los dos sistemas.",
    /* Mello, entrega 5, punto 2: el primer asiento de la devolución de ventas, a la vista. */
    "Si se devuelve una venta, hay dos asientos: uno en Devoluciones de ventas y otro que regresa el costo al inventario.",
  ],
  pie: "Basado en el libro, pp. 245-248",
};

export const PIEZA_FLETES = {
  id: A5_ID,
  numero: 5,
  titulo: "Fletes y devoluciones en permanente",
  /* Como los recortes del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  kardex: {},
  pantallas: [PORTADA, EL_COMPRADOR, EL_VENDEDOR, LIBRO_COMPRADOR, LIBRO_VENDEDOR, FRENTE, RESUMEN],
};
