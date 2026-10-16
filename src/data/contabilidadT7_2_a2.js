/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A2 DE APRENDER — «La venta en dos asientos» (pp. 209-214 y 234-237).
 *
 * Fuente: EL RECORTE DEL LOTE 1 de Near (entrega 6,
 * orquestador/conocimiento/paquetes/lote1-entrega6-v1.md, sección
 * «t7-2-a2-la-venta-en-dos-asientos») con la corrección obligatoria de Mello
 * encima (mello-entregas-4-5-6-v1.md, «Entrega 6 · T7-2»): la pista de
 * `la-compra` es la suya, «La mercancía que se compra es un activo…». Una
 * prueba compara cada texto de aquí contra el paquete corregido, letra por
 * letra, en los dos sentidos (correccionesMelloRecortesT72.mjs).
 *
 * Seis pantallas, tres con acción. Lo que cambia frente a lo publicado:
 *   · `la-compra` ya no dice antes de preguntar que la compra va al debe de
 *     Inventario de mercancías (delataba la respuesta)
 *   · `la-venta` sale: el primer asiento de la venta se ve en
 *     `el-segundo-asiento`, detrás de «Ver el primer asiento»
 *   · la devolución del costo ya no es circular («tiene saldo deudor: va al
 *     debe»)
 *
 * Ejemplos del libro: E-1 (la compra) y E-2 (la venta). Lista de control
 * (regla 3 y X1): de E-1 solo se ve su dato, Inventario de mercancías
 * $5.000.000; las otras tres líneas van con su cuenta y sin monto. Las cifras
 * de X1 —800.000 · 175.000 · 5.625.000 · 5.800.000— no se muestran. De E-2
 * se ve todo, sin las sumas. C7-14: el asiento de E-1 va con fecha del 16 de
 * abril.
 *
 * La línea `inventario` de `el-segundo-asiento` conserva su pista del lote 2
 * («Sale mercancía de la bodega…»): el recorte solo trae la de `costo`, y la
 * regla de los recortes es que el lote 2 vale para lo que el recorte no
 * cambia (como en la fusión de A5 y A6).
 *
 * El primer asiento de la venta da el IVA y la retención en pesos, no sus
 * tarifas: la frase de las tarifas ya no va en esta pieza.
 *
 * Lo que el recorte no trae y se conserva de lo publicado: los pies, los
 * botones y las palabras de la interfaz. Pieza de Aprender: cero FP.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A2_ID = "t7-2-a2-la-venta-en-dos-asientos";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };

/*
 * Textos de interfaz que no son de Near ni de la convención, y esperan
 * revisión (Watari decide cómo se ve el monto que no se muestra):
 * el nombre de cada asiento para el lector de pantalla y lo que dice de un
 * monto oculto.
 */
export const PENDIENTE_DE_REVISION = {
  nombreAsiento: (fecha) => `Asiento del ${fecha}`,
  montoOculto: "monto que no se muestra",
};

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras van sin «$» dentro de las tablas, como en el patrón. */
export const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

/* El dato de E-1 y los de E-2. Los demás montos de E-1 son de X1: no están aquí. */
const COMPRA = 5000000;
const VENTA = 8000000;
const IVA = 1280000;
const RETENCION = 280000;
const POR_COBRAR = 9000000;

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a registrar una compra y una venta en el sistema permanente.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 234-237",
};

/* El asiento de la compra (E-1, p. 234), en el acierto de P1: solo su dato lleva monto. */
const ASIENTO_COMPRA = {
  fecha: "16 de abril",
  lineas: [
    { cuenta: "Inventario de mercancías", lado: DEBE, monto: COMPRA },
    { cuenta: "IVA por pagar", lado: DEBE, monto: null },
    { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
    { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: null },
  ],
};

/* Los dos asientos de la venta (E-2, pp. 236-237), sin sumas. */
const ASIENTO_VENTA = {
  fecha: "20 de abril",
  lineas: [
    { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: POR_COBRAR },
    { cuenta: "Anticipo fiscal", lado: DEBE, monto: RETENCION },
    { cuenta: "IVA por pagar", lado: HABER, monto: IVA },
    { cuenta: "Ingresos por ventas", lado: HABER, monto: VENTA },
  ],
};
const ASIENTO_COSTO = {
  fecha: "20 de abril",
  lineas: [
    { cuenta: "Costo de mercancía vendida", lado: DEBE, monto: COMPRA },
    { cuenta: "Inventario de mercancías", lado: HABER, monto: COMPRA },
  ],
};

/* P1 · la compra (E-1, p. 234). La pista es la de Mello. */
const LA_COMPRA = {
  id: "la-compra",
  pista: "La mercancía que se compra es un activo. En el permanente se anota apenas entra.",
  tipo: "eleccion",
  parrafos: ["Ahora La Reventa usa el sistema permanente.", "El 16 de abril compra mercancía por $5.000.000, a crédito."],
  pregunta: "¿A qué cuenta va al debe?",
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías", correcta: true },
    { id: "compras", texto: "Compras", correcta: false, devolucion: "Compras es la cuenta del periódico. En el permanente no se usa." },
    { id: "costo", texto: "Costo de mercancía vendida", correcta: false, devolucion: "Esa cuenta se usa al vender, no al comprar." },
  ],
  pie: "Basado en el libro, p. 234",
  error: { pie: "Basado en el libro, p. 234" },
  acierto: {
    texto: "Así es: un activo que aumenta va al debe de su cuenta.",
    porque: "Las otras líneas son las mismas del periódico: el IVA va al debe de IVA por pagar, y la retención al haber de Retención en la fuente por pagar.",
    asiento: ASIENTO_COMPRA,
    pie: "Basado en el libro, pp. 234-235",
  },
};

/* P2 · el segundo asiento: el costo de lo que salió. Las dos líneas se barajan al entrar; el primero, detrás de «Ver el primer asiento». */
const PIE_SEGUNDO = "Basado en el libro, pp. 236-237";
const EL_SEGUNDO = {
  id: "el-segundo-asiento",
  tipo: "lados",
  parrafos: ["El 20 de abril vende esa mercancía por $8.000.000. El primer asiento registra lo que cobra; el segundo, lo que costó."],
  consigna: "Toca Debe o Haber en el segundo.",
  lineas: [
    { id: "costo", cuenta: "Costo de mercancía vendida", monto: COMPRA, lado: DEBE, pista: "Es lo que costó lo vendido, y ese costo aumenta. ¿De qué lado aumenta un costo?", devolucion: "Cada venta aumenta lo que costó lo vendido. Un costo que aumenta va al debe." },
    /* La pista, la del lote 2 (el recorte no la cambia). */
    { id: "inventario", cuenta: "Inventario de mercancías", monto: COMPRA, lado: HABER, pista: "Sale mercancía de la bodega. ¿De qué lado baja un activo?", devolucion: "Sale mercancía de la bodega, así que el activo disminuye: va al haber." },
  ],
  ver: { texto: "Ver el primer asiento", asiento: ASIENTO_VENTA },
  pie: PIE_SEGUNDO,
  error: { pie: PIE_SEGUNDO },
  acierto: { texto: "Así es: Inventario de mercancías baja por el costo de lo que salió.", pie: PIE_SEGUNDO },
};

/* P3 · por qué dos asientos. */
const PIE_POR_QUE = "Basado en el libro, pp. 209 y 233-236";
const POR_QUE = {
  id: "por-que-dos-asientos",
  pista: "Piensa en cuándo se anota lo que costó lo vendido en cada sistema: ¿en cada venta o al cierre?",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "¿Por qué en el permanente hay un segundo asiento, y en el periódico no?",
  opciones: [
    { id: "cada-venta", texto: "El costo se anota en cada venta.", correcta: true },
    { id: "mas-iva", texto: "La venta lleva más IVA.", correcta: false, devolucion: "El IVA es el mismo en los dos sistemas. Lo que cambia es cuándo se anota el costo." },
    { id: "no-hay-costo", texto: "En el periódico no hay costo de lo vendido.", correcta: false, devolucion: "Sí lo hay, pero en el periódico se halla al cierre, con el conteo." },
  ],
  pie: PIE_POR_QUE,
  error: { pie: PIE_POR_QUE },
  acierto: { texto: "Exacto: cada venta lleva su costo, y el inventario está siempre al día.", pie: PIE_POR_QUE },
};

/* P4 · la cuenta del costo en el estado de resultados: la estructura en tres filas, sin cifras. */
const EL_ESTADO = {
  id: "en-el-estado-de-resultados",
  tipo: "lectura",
  parrafos: ["En el permanente, el costo ya está en su cuenta y pasa directo al estado de resultados."],
  estructura: ["Ingresos por ventas", "Menos: Costo de mercancía vendida", "Utilidad bruta en ventas"],
  cierre: "La utilidad bruta en ventas es lo que queda de las ventas cuando se les resta el costo de la mercancía vendida.",
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 214 y 236-237",
};

/* P5 · el resumen abre con los dos asientos de la venta, uno debajo del otro, cada uno con su rótulo. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  asientos: [
    { ...ASIENTO_VENTA, rotulo: "Asiento 1: lo que se cobra" },
    { ...ASIENTO_COSTO, rotulo: "Asiento 2: lo que costó" },
  ],
  lista: [
    "En el permanente, la compra va al debe de Inventario de mercancías.",
    "La venta lleva dos asientos, y el costo pasa directo al estado de resultados.",
  ],
  siguiente: "Siguiente: «El kárdex».",
  pie: "Basado en el libro, pp. 234-237",
};

export const PIEZA_LA_VENTA_EN_DOS_ASIENTOS = {
  id: A2_ID,
  numero: 2,
  titulo: "La venta en dos asientos",
  textosEnteros: true,
  pantallas: [PORTADA, LA_COMPRA, EL_SEGUNDO, POR_QUE, EL_ESTADO, RESUMEN],
};
