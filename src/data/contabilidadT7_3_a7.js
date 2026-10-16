import { BOTON } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A7 DE APRENDER — «La NIC 2 del libro» (Célula C). La última pieza de
 * Aprender de T7-3.
 *
 * Fuente: la FUSIÓN de Near (lote 1, entrega 4: orquestador/conocimiento/
 * paquetes/lote1-entrega4-v1.md, sección «## t7-3-nic2-costo · «La NIC 2 del
 * libro»»), que une A7 «el costo» y A8 «fórmulas y revelación» en una sola
 * pieza con el id de A7. A8 (`t7-3-nic2-formulas`) salió de la lista; sus
 * archivos se quedan. Encima van las correcciones obligatorias de Mello
 * (mello-entregas-4-5-6-v1.md, «Entrega 4», puntos 1 a 4). Su opcional (la
 * regla de P5 al resumen) NO se aplica. Una prueba compara cada texto de
 * aquí contra el paquete con Mello, letra por letra
 * (__tests__/correccionesMelloFusiones.mjs).
 *
 * EL ERROR DE FONDO (entrega 4, sección 1): «almacenamiento» es solo lo
 * directamente atribuible a la adquisición (p. 258). Ya no se dice «lo que
 * cuesta guardarla»: lo que se suma va en la figura del acierto de
 * `el-costo`, con el límite («otros costos de adquirirla»).
 *
 * LA FRASE FIJA DE LA NIC 2 va siempre a la vista, en todas las pantallas
 * (encargo de L: en A7, H6 y H7), en la franja del Patrón T7-3. En la portada
 * es una de sus dos líneas.
 *
 * Lo que el paquete no trae y se toma de las piezas de antes (A7 y A8 v1 y
 * A1 de T7-3): los botones y mensajes, y el pie de cada pantalla, con las
 * páginas de su «Fuente»; y la lista de lo que la norma pide informar, con su
 * frase de entrada, que es la pantalla `revelar` de A8 (t7-3-a8-v1.md) y que
 * la fusión manda plegada al resumen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A7_ID = "t7-3-nic2-costo";

/* La frase fija de la NIC 2 (plan de T7-3, hueco 4). La usan A7, A8, H6 y H7. */
export const FRASE_NIC2 = "Lo que ves aquí de la NIC 2 es lo que trae el libro. No lo tomes como el texto vigente de la norma.";

/* El ejemplo construido de Near (registro 5c, T73-A7). */
export const EJEMPLO_A7 = { precio: 610_000, vender: 60_000, vnr: 550_000, costo: 580_000 };

/*
 * Patrón T7-3 (Watari): el valor neto realizable en renglones, y «Se mide
 * por el menor» (el menor en negrita, sin raya, con la marca «El menor»).
 * Rótulos y títulos de Watari, revisados por Near (L, 15 de octubre), con
 * sus tres cambios: «Lo que falta para terminar», «Lo que cuesta vender» y
 * «El menor». Los usa también H7: NO cambian con la fusión.
 */
export const ROTULOS_A7 = {
  precio: "Precio esperado de venta", terminar: "Lo que falta para terminar", vender: "Lo que cuesta vender",
  vnr: "Valor neto realizable", costo: "Costo", menorTit: "Se mide por el menor", menor: "El menor",
  ejemplo: "Ejemplo que no es del libro",
};
/*
 * Mello, entrega 4, punto 1: en `como-se-mide` el renglón dice la definición
 * completa (lo que falta para terminar Y para vender), para que no quede solo
 * en el plegado. Es solo de esta pantalla: H7 sigue con sus dos renglones.
 */
export const ROTULO_TERMINAR_Y_VENDER = "Lo que falta para terminarla y venderla";

export const cuentaVnr = (titulo, precio, terminar, vender) => {
  const R = ROTULOS_A7;
  return {
    tipo: "renglones", titulo,
    filas: [
      { rot: R.precio, v: precio },
      ...(terminar ? [{ op: "−", rot: R.terminar, v: terminar }] : []),
      { op: "−", rot: R.vender, v: vender },
      { op: "=", rot: R.vnr, v: precio - (terminar ?? 0) - vender, res: true },
    ],
  };
};
export const cuentaMenor = (costo, vnr) => {
  const R = ROTULOS_A7;
  const gana = costo < vnr ? "costo" : "vnr";
  return {
    tipo: "renglones", titulo: R.menorTit,
    filas: [
      { rot: R.costo, v: costo, fuerte: gana === "costo", marca: gana === "costo" ? R.menor : null },
      { rot: R.vnr, v: vnr, fuerte: gana === "vnr", marca: gana === "vnr" ? R.menor : null },
    ],
  };
};

const E = EJEMPLO_A7;

/* P0 · la portada: su segunda línea es la frase de la NIC 2, que va en la franja. */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué trae el libro de la NIC 2 sobre los inventarios.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 256-260",
};

/* P1 · qué es un inventario (antes, las lecturas `la-norma` y `que-es`). */
const PIE_QUE_ES = "Basado en el libro, pp. 256-257";
const QUE_ES = {
  id: "que-es",
  pista: "Piensa en cuál de las tres se tiene para venderla en la operación normal.",
  tipo: "eleccion",
  /* Mello, entrega 4, punto 4: «una norma de contabilidad para muchos países» no lo dice el libro. */
  parrafos: ["Según el libro, la NIC 2 es una norma internacional. Trata de los inventarios."],
  pregunta: "Una tienda tiene estas tres cosas. ¿Cuál es inventario, según la NIC 2 del libro?",
  opciones: [
    { id: "mercancia", texto: "La mercancía que tiene para vender", correcta: true },
    { id: "computador", texto: "El computador de la oficina", devolucion: "El computador no se vende ni se gasta en producir." },
    { id: "local", texto: "El local donde vende", devolucion: "El local no se tiene para venderlo. Es donde la tienda trabaja." },
  ],
  acierto: {
    texto: "Así es: se tiene para venderla en la operación normal.",
    porque: "Según el libro, también son inventarios lo que está en producción para esa venta y los materiales que se van a gastar en producir. Según el libro, esta NIC 2 cambió una versión de 1993 y vale desde el 1 de enero de 2005.",
    pie: PIE_QUE_ES,
  },
  error: { pie: PIE_QUE_ES },
  pie: PIE_QUE_ES,
};

/* P2 · cómo se mide. El ejemplo es [CONSTRUCCIÓN] de Near: su marca va en el pie (`pieMarca`). */
const PIE_MIDE = "Basado en el libro, pp. 257-258";
const COMO_SE_MIDE = {
  id: "como-se-mide",
  pista: "La NIC 2 del libro pide el menor de dos valores. ¿Cuáles son esos dos aquí?",
  tipo: "eleccion",
  parrafos: ["Un inventario se mide al costo o al valor neto realizable: el menor de los dos."],
  /* Los renglones van con el texto: la pregunta no es el valor neto realizable, sino cuál gana. */
  figuras: [{
    tipo: "renglones", titulo: null,
    filas: [
      { rot: ROTULOS_A7.precio, v: E.precio },
      { op: "−", rot: ROTULO_TERMINAR_Y_VENDER, v: E.vender },
      { op: "=", rot: ROTULOS_A7.vnr, v: E.precio - E.vender, res: true },
    ],
  }],
  pregunta: "Esa mercancía costó $580.000. ¿Por qué valor se mide?",
  opciones: [
    { id: "costo", texto: "$580.000", devolucion: "Ese es el costo. Compáralo con el valor neto realizable." },
    { id: "vnr", texto: "$550.000", correcta: true },
    { id: "precio", texto: "$610.000", devolucion: "$610.000 es el precio esperado. La norma compara el costo con el valor neto realizable." },
  ],
  acierto: {
    /* Mello, entrega 4, punto 1: el acierto se acorta para no pasar de 60 palabras. */
    texto: "Así es: gana el valor neto realizable.",
    porque: "El valor neto realizable es el precio al que se espera vender, menos lo que falta gastar para terminar el producto y para venderlo.",
    figuras: [cuentaMenor(E.costo, E.vnr)],
    pie: PIE_MIDE,
  },
  error: { pie: PIE_MIDE },
  pie: PIE_MIDE,
  /* «La marca «Ejemplo que no es del libro» pasa al pie» (Near): debajo de la fuente, en todos los estados. */
  pieMarca: ROTULOS_A7.ejemplo,
};

/* P3 · el costo, con el error de fondo corregido (entrega 4, sección 1). */
const PIE_COSTO = "Basado en el libro, pp. 208 y 258";
const EL_COSTO = {
  id: "el-costo",
  pista: "El costo sube con lo que hace parte de adquirir la mercancía. ¿Cuál de estos lo hace bajar?",
  tipo: "eleccion",
  pregunta: "Una tienda compra mercancía. ¿Cuál de estos se resta para hallar su costo de adquisición?",
  opciones: [
    { id: "transporte", texto: "El transporte hasta la bodega", devolucion: "Eso se suma al costo: hace parte de adquirir la mercancía." },
    { id: "descuento", texto: "Un descuento comercial", correcta: true },
    { id: "bodegaje", texto: "El bodegaje en la aduana mientras llega", devolucion: "Eso se suma al costo: hace parte de adquirir la mercancía." },
  ],
  acierto: {
    texto: "Así es: el descuento comercial se resta.",
    /*
     * La tercera frase («Guardarla después, mes a mes…») es [CONSTRUCCIÓN] de
     * Near: sale del límite de la p. 258, pero el libro no da ese ejemplo. La
     * glosa de «aranceles» también es [CONSTRUCCIÓN] de Near (la p. 208 los
     * nombra entre los «gastos de nacionalización»).
     */
    porque: "Lo que se paga por guardarla entra solo si es parte de la compra. El libro: «directamente atribuibles a la adquisición». Guardarla después, mes a mes, ya no es parte de adquirirla. Los aranceles son los impuestos que se pagan por traer mercancía de otro país. Si la empresa fabrica lo que vende, también suma lo que le cuesta convertir los materiales en productos. El libro lo llama costos de transformación.",
    /* Figura del acierto: dos columnas, «Se suma» y «Se resta» (provisional para Watari). */
    figuras: [{
      tipo: "columnas",
      columnas: [
        { titulo: "Se suma", texto: "precio, transporte, aranceles, impuestos que no se recuperan y otros costos de adquirirla" },
        { titulo: "Se resta", texto: "descuentos comerciales y rebajas" },
      ],
    }],
    pie: "Basado en el libro, p. 258",
  },
  error: { pie: "Basado en el libro, p. 258" },
  pie: PIE_COSTO,
};

/* P4 · las fórmulas (de A8). */
const PIE_FORMULAS = "Basado en el libro, p. 259";
const FORMULAS = {
  id: "formulas",
  pista: "Fíjate en si los anillos se pueden cambiar uno por otro.",
  tipo: "eleccion",
  parrafos: ["Según la NIC 2 del libro, hay tres fórmulas del costo. Las ves aquí abajo."],
  pregunta: "Una joyería vende anillos hechos a mano, cada uno distinto. ¿Qué fórmula le sirve?",
  opciones: [
    { id: "identificacion", texto: "Identificación específica", correcta: true },
    { id: "fifo", texto: "FIFO", devolucion: "FIFO sirve cuando las unidades son iguales y se pueden cambiar una por otra. Aquí cada anillo es distinto." },
    { id: "promedio", texto: "Promedio ponderado", devolucion: "El promedio les da el mismo costo a unidades iguales. Aquí cada anillo es distinto." },
  ],
  acierto: {
    /* Mello, entrega 4, punto 2: la condición de la identificación específica, a la vista. */
    texto: "Así es: cada anillo es distinto, así que lleva su propio costo.",
    porque: "Según el libro, esta fórmula se usa para productos que no se pueden cambiar uno por otro, porque cada uno es distinto.",
    pie: PIE_FORMULAS,
  },
  error: { pie: PIE_FORMULAS },
  pie: PIE_FORMULAS,
};

/* P5 · la que falta (de A8): UEPS. PEPS es el nombre de FIFO en otras partes del libro (p. 215). */
const PIE_FALTA = "Basado en el libro, pp. 215 y 259";
const LA_QUE_FALTA = {
  id: "la-que-falta",
  pista: "Recuerda que uno de los métodos que viste no es válido bajo NIIF.",
  tipo: "eleccion",
  parrafos: ["En otras partes del libro, FIFO se llama PEPS."],
  pregunta: "¿Cuál de los métodos que ya viste no está en la lista de la NIC 2 del libro?",
  opciones: [
    { id: "peps", texto: "PEPS", devolucion: "PEPS sí está: es FIFO con otro nombre." },
    { id: "ueps", texto: "UEPS (no válido bajo NIIF)", correcta: true },
    { id: "promedio", texto: "Promedio ponderado", devolucion: "El promedio ponderado sí está: es la tercera fórmula." },
  ],
  acierto: {
    texto: "Así es: UEPS no está en la lista.",
    /* La opcional de Mello (llevar esta regla al resumen) NO se aplica: se queda aquí, plegada. */
    porque: "La empresa usa la misma fórmula para los inventarios que se parecen en su naturaleza y en su uso.",
    pie: PIE_FALTA,
  },
  error: { pie: PIE_FALTA },
  pie: PIE_FALTA,
};

/* P6 · los sistemas (de A8). Las glosas de «minoristas» y «margen bruto» son [CONSTRUCCIÓN] de Near. */
const PIE_SISTEMAS = "Basado en el libro, p. 259";
const SISTEMAS = {
  id: "sistemas",
  pista: "Busca el que el libro pone para tiendas con muchos artículos que se venden rápido.",
  tipo: "eleccion",
  parrafos: ["El libro nombra dos sistemas que sirven si se acercan al costo: el costo estándar y el de los minoristas."],
  pregunta: "Un supermercado vende miles de artículos que se venden rápido. ¿Cuál le sirve?",
  opciones: [
    { id: "estandar", texto: "El costo estándar", devolucion: "El libro no lo describe más. Para tiendas con muchos artículos, recomienda el otro." },
    { id: "minoristas", texto: "El método de los minoristas", correcta: true },
    { id: "identificacion", texto: "La identificación específica", devolucion: "Esa fórmula es para productos que son todos distintos. Aquí hay miles de artículos iguales." },
  ],
  acierto: {
    /* Mello, entrega 4, punto 3: la condición que faltaba («y dejan casi la misma ganancia»). */
    texto: "Así es: sirve a tiendas con muchos artículos que se venden rápido y dejan casi la misma ganancia.",
    porque: "Los minoristas son las tiendas que le venden al público. En ese método, el costo se halla restándole al precio de venta un porcentaje de margen bruto: la parte del precio que la tienda gana sobre lo que le costó la mercancía.",
    pie: PIE_SISTEMAS,
  },
  error: { pie: PIE_SISTEMAS },
  pie: PIE_SISTEMAS,
};

/* P7 · cuándo es gasto (de A8). */
const PIE_GASTO = "Basado en el libro, p. 260";
const GASTO = {
  id: "gasto",
  pista: "Piensa en qué momento la mercancía deja de ser de la tienda.",
  tipo: "eleccion",
  pregunta: "Una tienda vende mercancía en marzo. ¿Cuándo se vuelve gasto el valor de esa mercancía?",
  opciones: [
    { id: "marzo", texto: "En marzo, con los ingresos de esa venta", correcta: true },
    { id: "al-comprar", texto: "Cuando la tienda la compró", devolucion: "Al comprarla, la mercancía es un activo: todavía no es gasto." },
    { id: "nunca", texto: "Nunca: el inventario no se vuelve gasto", devolucion: "Sí se vuelve gasto: cuando se vende, deja de ser un activo." },
  ],
  acierto: {
    texto: "Así es: el gasto se reconoce en el mismo periodo que los ingresos de la venta.",
    porque: "Si el inventario se rebaja hasta su valor neto realizable, o se pierde, eso se reconoce en el periodo en que pasa.",
    pie: PIE_GASTO,
  },
  error: { pie: PIE_GASTO },
  pie: PIE_GASTO,
};

/* P8 · el resumen: la medida y las tres fórmulas como fichas, y lo que la norma pide informar, plegado. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  figuras: [{
    tipo: "fichas",
    /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el rótulo sale de la figura que pide Near («Costo o valor neto realizable: el menor»). Provisional para Watari. */
    medida: { rot: "Costo o valor neto realizable", valor: "El menor de los dos" },
    fichas: ["Identificación específica", "FIFO", "Promedio ponderado"],
  }],
  tras: [
    "El inventario se mide por el menor entre el costo y el valor neto realizable.",
    "El costo suma lo que es parte de adquirir la mercancía y resta los descuentos comerciales.",
    "UEPS no está entre las fórmulas de la NIC 2 del libro.",
  ],
  /* La pantalla `revelar` de A8 (t7-3-a8-v1.md, p. 260), plegada detrás de su botón. */
  desplegable: {
    boton: "Ver lo que la norma pide informar",
    parrafos: ["El libro dice que la norma pide informar en los estados financieros, entre otras cosas:"],
    lista: [
      "La fórmula de costo que se usó.",
      "El valor en libros de los inventarios.",
      "Las rebajas de valor, y si alguna se reversó.",
      "El valor de los inventarios que se reconoció como gasto en el periodo.",
      "Los inventarios que se dieron como garantía de una deuda.",
    ],
  },
  pie: "Basado en el libro, pp. 258-260",
};

export const PIEZA_NIC2_COSTO = {
  id: A7_ID,
  numero: 7,
  titulo: "La NIC 2 del libro",
  /* Siempre a la vista, en todas las pantallas. */
  aviso: FRASE_NIC2,
  /* Como los recortes del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, QUE_ES, COMO_SE_MIDE, EL_COSTO, FORMULAS, LA_QUE_FALTA, SISTEMAS, GASTO, RESUMEN],
};
