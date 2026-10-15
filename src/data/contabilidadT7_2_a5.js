/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A5 DE APRENDER — «Fletes en permanente» (pp. 228, 236 y 245-246).
 * Ejemplos G-1 y G-2 del libro.
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-2-a5-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Siete pantallas.
 *
 * LISTA DE CONTROL: no se ve ninguna cifra de X3a ni de X3b (1.200.000 ·
 * 262.500 · 8.437.500 · 6.500 · 643.500 · 8.700.000): las líneas de los
 * asientos con esos montos van con ●. Se ven los datos, 7.500.000 y 650.000,
 * y el costo 3.000.000 de G-2, libre en T7-2. No hay sumas. Una prueba lo
 * vigila.
 *
 * Erratas: C7-16 (no se cita «la empresa comparadora») y C7-7 (el flete de
 * G-2 se acredita a Caja o Bancos). Nombres de cuenta de la regla 8.
 *
 * Lo que la v1 no trae y se toma de la convención (T7-1, A1-A4 de T7-2): los
 * botones, «Correcto.» e «Incorrecto.», los rótulos de la ficha con el primer
 * dato en mayúscula, y el pie de los errores (el de su pantalla).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A5_ID = "t7-2-a5-fletes";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras de X3a y X3b: nunca se muestran en T7-2. */
export const X3 = [1_200_000, 262_500, 8_437_500, 6_500, 643_500, 8_700_000];

const MERCANCIA = 7_500_000;
const FLETE = 650_000;
const COSTO = 3_000_000;
const FECHA = "18 de marzo";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás registrar un flete en el permanente, según quién lo asume.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 245-246",
};

const LA_REGLA = {
  id: "la-regla",
  tipo: "lectura",
  parrafos: ["Cuando el comprador asume el flete, el libro lo suma al costo de la mercancía. Todo gasto directo que hace falta para tener la mercancía lista para la venta forma parte de su costo."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 245",
};

const PIE_G = "Basado en el libro, pp. 245-246";

/* P2 · G-1: el flete lo asume el comprador. */
const EL_COMPRADOR = {
  id: "lo-asume-el-comprador",
  pista: "En el permanente, este flete sigue siendo parte del costo. ¿Qué cuenta guarda ese costo en este sistema?",
  tipo: "eleccion",
  enunciado: "El 18 de marzo, Santa Martha compra mercancía a crédito a un proveedor. La mercancía vale $7.500.000, más el IVA. El flete vale $650.000 y lo asume Santa Martha, que le paga a la transportadora ese mismo día. Usa el sistema de inventario permanente.",
  ficha: [
    { dato: "Quién recibe", texto: "Santa Martha la mercancía y el transporte" },
    { dato: "Quién entrega", texto: "Un proveedor y una transportadora" },
    { dato: "Monto", texto: "$7.500.000 la mercancía, $650.000 el flete" },
    { dato: "Tipo", texto: "Mercancía a crédito, flete pagado ese día" },
    { dato: "Clase de hecho", texto: "Compra de mercancía con el flete a cargo del comprador" },
  ],
  pregunta: "En el permanente, ¿a qué cuenta va el flete de $650.000 que asume Santa Martha?",
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías (fletes)", correcta: true },
    { id: "compras", texto: "Compras (fletes)", correcta: false, devolucion: "Compras es la cuenta del periódico. En el permanente no existe: el flete se suma directo a Inventario de mercancías." },
    { id: "gasto", texto: "Gasto de venta – fletes", correcta: false, devolucion: "Ese es el flete que asume el vendedor. Aquí lo asume el comprador, y se suma al costo del inventario." },
  ],
  pie: PIE_G,
  error: { pie: PIE_G },
  acierto: {
    texto: "Así es. En el permanente, el flete que asume el comprador va al debe de Inventario de mercancías.",
    /* p. 245, con la regla 8. null = ● (monto de X3). */
    asientos: [{
      fecha: FECHA,
      lineas: [
        { cuenta: "Inventario de mercancías", lado: DEBE, monto: MERCANCIA },
        { cuenta: "IVA por pagar", lado: DEBE, monto: null },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
        { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: null },
        { cuenta: "Inventario de mercancías (fletes)", lado: DEBE, monto: FLETE },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
        { cuenta: "Caja o Bancos", lado: HABER, monto: null },
      ],
    }],
    pie: PIE_G,
  },
};

/* P3 · G-2: el flete lo asume el vendedor. */
const EL_VENDEDOR = {
  id: "lo-asume-el-vendedor",
  pista: "La Popa ya vendió esa mercancía. El flete no se suma al costo de nada que le quede.",
  tipo: "eleccion",
  enunciado: "El 18 de marzo, La Popa le vende mercancía a crédito a Santa Martha. La mercancía vale $7.500.000, más el IVA, y a La Popa le costó $3.000.000. El flete vale $650.000 y lo asume La Popa, que le paga a la transportadora ese mismo día. Usa el sistema de inventario permanente.",
  ficha: [
    { dato: "Quién recibe", texto: "Santa Martha" },
    { dato: "Quién entrega", texto: "La Popa" },
    { dato: "Monto", texto: "$7.500.000 la venta, $3.000.000 el costo, $650.000 el flete" },
    { dato: "Tipo", texto: "Venta a crédito, flete pagado ese día" },
    { dato: "Clase de hecho", texto: "Venta de mercancía con el flete a cargo del vendedor" },
  ],
  pregunta: "¿A qué cuenta va el flete que asume La Popa?",
  opciones: [
    { id: "gasto", texto: "Gasto de venta – fletes", correcta: true },
    { id: "compras", texto: "Compras (fletes)", correcta: false, devolucion: "La Popa no está comprando: está vendiendo. Para quien vende, el flete es un gasto de venta." },
    { id: "inventario", texto: "Inventario de mercancías (fletes)", correcta: false, devolucion: "Ese flete no trae mercancía a la bodega de La Popa: la lleva al cliente. Para quien vende, es un gasto de venta." },
  ],
  pie: PIE_G,
  error: { pie: PIE_G },
  acierto: { texto: "Así es. El flete que asume el vendedor es un gasto de venta, igual que en el periódico.", pie: PIE_G },
};

/* P4 · el asiento del costo de G-2: lo calificable en X3b. */
const PIE_COSTO = "Basado en el libro, pp. 236 y 246";
const EL_COSTO = {
  id: "el-asiento-del-costo",
  tipo: "lados",
  consigna: "En el permanente, la venta tiene además el asiento del costo. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "costo", cuenta: "Costo de mercancía vendida", monto: COSTO, lado: DEBE, pista: "Es el costo de lo que salió con la venta. ¿De qué lado aumenta un costo?", devolucion: "El costo de la mercancía vendida tiene saldo deudor: va al debe." },
    { id: "inventario", cuenta: "Inventario de mercancías", monto: COSTO, lado: HABER, pista: "La mercancía sale de la bodega. ¿De qué lado baja un activo?", devolucion: "Sale mercancía de la bodega, así que el activo disminuye: va al haber." },
  ],
  pie: PIE_COSTO,
  error: { pie: PIE_COSTO },
  acierto: {
    texto: "Así es. Este asiento solo existe en el permanente. En el periódico, el costo se halla al cierre.",
    /* El asiento completo de La Popa (p. 246, con la regla 8 y C7-7). */
    asientos: [{
      fecha: FECHA,
      lineas: [
        { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: null },
        { cuenta: "Anticipo fiscal", lado: DEBE, monto: null },
        { cuenta: "IVA por pagar", lado: HABER, monto: null },
        { cuenta: "Ingresos por ventas", lado: HABER, monto: MERCANCIA },
        { cuenta: "Costo de mercancía vendida", lado: DEBE, monto: COSTO },
        { cuenta: "Inventario de mercancías", lado: HABER, monto: COSTO },
        { cuenta: "Gasto de venta – fletes", lado: DEBE, monto: FLETE },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
        { cuenta: "Caja o Bancos", lado: HABER, monto: null },
      ],
    }],
    pie: PIE_COSTO,
  },
};

/* P5 · frente al periódico: la versión del periódico va en el mismo ítem (regla 3). */
const PIE_PERIODICO = "Basado en el libro, pp. 228 y 245-246";
const FRENTE = {
  id: "frente-al-periodico",
  pista: "En los dos sistemas, ese flete se suma al costo. ¿Qué es lo distinto entre uno y otro?",
  tipo: "eleccion",
  /* «Línea fija»: se ve en todos los estados. */
  despues: ["Si el flete lo asume el vendedor, es un gasto de venta en los dos sistemas."],
  pregunta: "En el periódico, el flete que asume el comprador va a Compras (fletes). ¿Qué cambia en el permanente?",
  opciones: [
    { id: "la-cuenta", texto: "Solo la cuenta: va a Inventario de mercancías (fletes).", correcta: true },
    { id: "gasto", texto: "En el permanente, ese flete pasa a ser un gasto.", correcta: false, devolucion: "Sigue siendo parte del costo. Lo que cambia es la cuenta: en el permanente no existe Compras." },
    { id: "nada", texto: "No cambia nada.", correcta: false, devolucion: "Sí cambia la cuenta. En el permanente no existe Compras, así que el flete va a Inventario de mercancías." },
  ],
  pie: PIE_PERIODICO,
  error: { pie: PIE_PERIODICO },
  acierto: { texto: "Exacto. El flete sigue siendo parte del costo. Solo cambia la cuenta donde se anota.", pie: PIE_PERIODICO },
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "En el permanente, el flete que asume el comprador va a Inventario de mercancías (fletes).",
    "El flete que asume el vendedor es un gasto de venta, en los dos sistemas.",
    "La venta del permanente lleva también el asiento del costo.",
  ],
  siguiente: "Siguiente: «Devoluciones en permanente».",
  pie: "Basado en el libro, pp. 245-246",
};

export const PIEZA_FLETES = {
  id: A5_ID,
  numero: 5,
  titulo: "Fletes en permanente",
  kardex: {},
  pantallas: [PORTADA, LA_REGLA, EL_COMPRADOR, EL_VENDEDOR, EL_COSTO, FRENTE, RESUMEN],
};
