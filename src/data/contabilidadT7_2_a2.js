/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A2 DE APRENDER — «La venta en dos asientos» (pp. 209-214 y 234-237).
 *
 * Fuente: la v1 de Near con su corrección (PASA de Mello). Copias en
 * orquestador/conocimiento/paquetes/t7-2-a2-v1.md y t7-2-a2-correccion.md;
 * una prueba compara cada texto de aquí contra ellas, letra por letra.
 *
 * Lo que cambia la corrección: el repaso de IVA y retención pasa a P1 (antes
 * de la pregunta, y en el acierto, junto a las líneas sin monto). P2 se queda
 * solo con el lado de la venta.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Siete pantallas. Dos
 * ejemplos resueltos del libro: E-1 (la compra) y E-2 (la venta).
 *
 * Lista de control (regla 3 y X1): de E-1 solo se ve su dato, Inventario de
 * mercancías $5.000.000; las otras tres líneas van con su cuenta y sin monto
 * (●). Las cifras de X1 —800.000 · 175.000 · 5.625.000 · 5.800.000— no se
 * muestran, y una prueba lo vigila. De E-2 se ve todo, sin las sumas.
 *
 * Erratas: C7-14 (el asiento de E-1 va con fecha del 16 de abril). Nombres de
 * cuenta de la regla 8.
 *
 * Lo que la v1 no trae y se toma de la convención de T7-1 (AP2, A5, A6):
 *   · los botones «Empezar», «Seguir», «Confirmar» y «Probar otra», y
 *     «Correcto.», «Incorrecto.», «Debe» y «Haber»
 *   · los rótulos de la ficha («Quién recibe», «Quién entrega», «Monto»,
 *     «Tipo», «Clase de hecho»), con el primer dato en mayúscula
 *   · el pie de los errores de P1, que la v1 no da: el mismo de su pantalla
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
  objetivo: "Al terminar, sabrás registrar una compra y una venta en el sistema permanente, con el asiento del costo.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 234-237",
};

/* P1 · la compra (E-1, p. 234). El repaso de IVA y retención viene de la corrección. */
const LA_COMPRA = {
  id: "la-compra",
  pista: "La mercancía que se compra es un activo. En el permanente se anota apenas entra.",
  tipo: "eleccion",
  parrafos: [
    "En el permanente, la compra de mercancía va al debe de Inventario de mercancías, por su costo. Así se cumple la regla de los activos: un activo que aumenta va al debe de su cuenta.",
  ],
  enunciado: "El 16 de abril, La Reventa Ltda. le compra mercancía a crédito a un proveedor, por $5.000.000, más el IVA. Usa el sistema de inventario permanente.",
  ficha: [
    { dato: "Quién recibe", texto: "La Reventa Ltda." },
    { dato: "Quién entrega", texto: "Un proveedor" },
    { dato: "Monto", texto: "$5.000.000" },
    { dato: "Tipo", texto: "A crédito" },
    { dato: "Clase de hecho", texto: "Compra de mercancía para venderla" },
  ],
  repaso: "Un repaso corto. El IVA es el impuesto a las ventas: quien vende se lo cobra a quien compra. La retención es una parte del pago que quien compra le descuenta a quien vende.",
  pregunta: "¿En qué cuenta va al debe el costo de la mercancía, $5.000.000?",
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías", correcta: true },
    {
      id: "compras",
      texto: "Compras",
      correcta: false,
      devolucion: "Compras es la cuenta del sistema periódico. En el permanente no existe: la compra va directo a Inventario de mercancías.",
    },
    {
      id: "costo",
      texto: "Costo de mercancía vendida",
      correcta: false,
      devolucion: "Costo de mercancía vendida se usa al vender, no al comprar.",
    },
  ],
  pie: "Basado en el libro, p. 234",
  error: { pie: "Basado en el libro, p. 234" },
  acierto: {
    texto: "Así es. En el permanente, la compra va al debe de Inventario de mercancías. Esa cuenta sube cuando entra mercancía.",
    asiento: {
      fecha: "16 de abril",
      lineas: [
        { cuenta: "Inventario de mercancías", lado: DEBE, monto: COMPRA },
        { cuenta: "IVA por pagar", lado: DEBE, monto: null },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: null },
        { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: null },
      ],
    },
    despues: [
      "Las otras líneas son las mismas del periódico: el IVA, la retención y lo que se le debe al proveedor.",
      "En la compra, el IVA va al debe de IVA por pagar. La retención va al haber de Retención en la fuente por pagar, porque se le debe a la Dirección de Impuestos.",
    ],
    pie: "Basado en el libro, pp. 234-235",
  },
};

/* P2 · la venta (E-2, pp. 236-237): el primer asiento, resuelto, sin sumas. */
const LA_VENTA = {
  id: "la-venta",
  tipo: "lectura",
  enunciado: "El 20 de abril, La Reventa Ltda. le vende a un cliente, a crédito, la mercancía que compró el 16 de abril. Se la vende por $8.000.000, más el IVA. Usa el sistema de inventario permanente.",
  ficha: [
    { dato: "Quién recibe", texto: "Un cliente" },
    { dato: "Quién entrega", texto: "La Reventa Ltda." },
    { dato: "Monto", texto: "$8.000.000 por la venta; la mercancía costó $5.000.000" },
    { dato: "Tipo", texto: "A crédito" },
    { dato: "Clase de hecho", texto: "Venta de mercancía" },
  ],
  parrafos: [
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %, sobre el valor de la mercancía.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
    "En la venta, quien cobra el IVA se lo debe al Estado: va al haber de IVA por pagar.",
    "La retención es una parte del pago que el cliente le descuenta al vendedor. Para el vendedor es un impuesto pagado por adelantado: va al debe de Anticipo fiscal.",
    "En el permanente, la venta lleva dos asientos. El primero es igual al del periódico: registra lo que se cobra.",
  ],
  calculos: [
    "$8.000.000 × 16 % = $1.280.000",
    "$8.000.000 × 3,5 % = $280.000",
    "$8.000.000 + $1.280.000 − $280.000 = $9.000.000",
  ],
  asiento: {
    fecha: "20 de abril",
    lineas: [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: POR_COBRAR },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: RETENCION },
      { cuenta: "IVA por pagar", lado: HABER, monto: IVA },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: VENTA },
    ],
  },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 210, 212 y 235-237",
};

/* P3 · el segundo asiento: el costo de lo que salió. Las dos líneas se barajan al entrar. */
const EL_SEGUNDO = {
  id: "el-segundo-asiento",
  tipo: "lados",
  consigna: "El segundo asiento registra el costo de lo que salió. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "costo", cuenta: "Costo de mercancía vendida", monto: COMPRA, lado: DEBE, pista: "Es lo que costó lo vendido, y ese costo aumenta. ¿De qué lado aumenta un costo?", devolucion: "El costo de la mercancía vendida tiene saldo deudor: va al debe." },
    { id: "inventario", cuenta: "Inventario de mercancías", monto: COMPRA, lado: HABER, pista: "Sale mercancía de la bodega. ¿De qué lado baja un activo?", devolucion: "Sale mercancía de la bodega, así que el activo disminuye: va al haber." },
  ],
  pie: "Basado en el libro, pp. 236-237",
  error: { pie: "Basado en el libro, pp. 236-237" },
  acierto: {
    texto: "Así es. Al vender, Inventario de mercancías baja por el costo de lo que salió. Por eso su saldo queda al día.",
    pie: "Basado en el libro, pp. 236-237",
  },
};

/* P4 · por qué dos asientos. */
const POR_QUE = {
  id: "por-que-dos-asientos",
  pista: "Piensa en cuándo se anota lo que costó lo vendido en cada sistema: ¿en cada venta o al cierre?",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "¿Por qué en el permanente hay un segundo asiento, y en el periódico no?",
  opciones: [
    { id: "cada-venta", texto: "Porque en el permanente el costo se anota en cada venta.", correcta: true },
    {
      id: "mas-iva",
      texto: "Porque en el permanente la venta lleva más IVA.",
      correcta: false,
      devolucion: "El IVA es el mismo en los dos sistemas. Lo que cambia es cuándo se anota el costo.",
    },
    {
      id: "no-hay-costo",
      texto: "Porque en el periódico no hay costo de lo vendido.",
      correcta: false,
      devolucion: "Sí lo hay, pero en el periódico se halla al cierre, con el conteo. En el permanente se anota en cada venta.",
    },
  ],
  pie: "Basado en el libro, pp. 209 y 233-236",
  error: { pie: "Basado en el libro, pp. 209 y 233-236" },
  acierto: {
    texto: "Exacto. En el permanente, cada venta lleva su costo. Así la cuenta del inventario está siempre al día.",
    pie: "Basado en el libro, pp. 209 y 233-236",
  },
};

/* P5 · la cuenta del costo en el estado de resultados: la estructura hasta la utilidad bruta, sin cifras. */
const EL_ESTADO = {
  id: "en-el-estado-de-resultados",
  tipo: "lectura",
  parrafos: [
    "La cuenta Costo de mercancía vendida va al estado de resultados. Al final del periodo se cierra contra Ganancias y pérdidas.",
    "En el periódico, el costo se calcula al cierre: inventario inicial, más compras, menos inventario final. En el permanente ya está en su cuenta, y pasa directo al estado de resultados.",
  ],
  estructura: ["Ingresos por ventas", "Menos: Costo de mercancía vendida", "Utilidad bruta en ventas"],
  cierre: "La utilidad bruta en ventas es lo que queda de las ventas cuando se les resta el costo de la mercancía vendida.",
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 214 y 236-237",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "En el permanente, la compra de mercancía va al debe de Inventario de mercancías.",
    "La venta lleva dos asientos: uno por lo que se cobra y otro por el costo de lo que salió.",
    "El costo pasa directo al estado de resultados. No hay que calcularlo al cierre.",
  ],
  siguiente: "Siguiente: «El kárdex».",
  pie: "Basado en el libro, pp. 234-237",
};

export const PIEZA_LA_VENTA_EN_DOS_ASIENTOS = {
  id: A2_ID,
  numero: 2,
  titulo: "La venta en dos asientos",
  pantallas: [PORTADA, LA_COMPRA, LA_VENTA, EL_SEGUNDO, POR_QUE, EL_ESTADO, RESUMEN],
};
