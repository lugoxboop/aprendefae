import { BOTON } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A7 DE APRENDER — «La NIC 2 del libro: el costo» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a7-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Toda la pieza va atribuida al libro (pp. 256-258), que no trae ejemplos.
 * LA FRASE FIJA DE LA NIC 2 va siempre a la vista, en todas las pantallas
 * (encargo de L: en A7, A8, H6 y H7); la v1 la pone en la portada.
 *
 * El ejemplo de la pantalla 3 (610.000 · 60.000 · 550.000 · 580.000) es una
 * [CONSTRUCCIÓN] de Near, «un ejemplo que no es del libro», y está en su
 * registro 5c. La glosa de «aranceles» también es [CONSTRUCCIÓN] de Near.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, y el
 * pie de cada pantalla, con las páginas de la columna «Fuente».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A7_ID = "t7-3-nic2-costo";

/* La frase fija de la NIC 2 (plan de T7-3, hueco 4). La usan A7, A8, H6 y H7. */
export const FRASE_NIC2 = "Lo que ves aquí de la NIC 2 es lo que trae el libro. No lo tomes como el texto vigente de la norma.";

/* El ejemplo construido de Near (registro 5c, T73-A7). */
export const EJEMPLO_A7 = { precio: 610_000, vender: 60_000, vnr: 550_000, costo: 580_000 };

/*
 * Patrón T7-3 (Watari): el valor neto realizable en renglones, y «Se mide
 * por el menor» (el menor en negrita, sin raya, con la marca «el menor»).
 * Rótulos y títulos de Watari, por confirmar con Near ([ESCRITO POR
 * CLAUDE — PENDIENTE DE REVISIÓN], dice su patrón). Los usa también H7.
 */
export const ROTULOS_A7 = {
  precio: "Precio esperado de venta", terminar: "Lo que falta para terminarlo", vender: "Lo que cuesta venderlo",
  vnr: "Valor neto realizable", costo: "Costo", menorTit: "Se mide por el menor", menor: "el menor",
  ejemplo: "Ejemplo que no es del libro",
};
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

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué trae el libro de la NIC 2: qué es un inventario, cómo se mide y qué entra en su costo.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 256-258",
};

const LA_NORMA = {
  id: "la-norma",
  tipo: "lectura",
  parrafos: [
    "El libro trae una norma que se llama NIC 2. Es una norma internacional de contabilidad, y trata de los inventarios.",
    "El libro dice que esta NIC 2 sustituye a una versión de 1993.",
    "Y dice que se aplica en los periodos que empiezan desde el 1 de enero de 2005.",
    "Según el libro, la norma dice cómo se deben llevar los inventarios en la contabilidad.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 256",
};

const QUE_ES = {
  id: "que-es",
  tipo: "lectura",
  parrafos: ["Según el libro, los inventarios son activos que cumplen una de tres cosas:"],
  lista: [
    "Se tienen para venderlos en el curso normal de la operación.",
    "Están en producción, para esa venta.",
    "Son materiales o suministros que se van a gastar en la producción o en los servicios.",
  ],
  despues: [
    "También son inventarios las cosas que se compran para volver a venderlas. Por ejemplo, la mercancía que una tienda compra para sus clientes.",
    "El libro dice también que la norma no se aplica a algunos casos, y los nombra en la página 257.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 257-258",
};

const COMO_SE_MIDE = {
  id: "como-se-mide",
  tipo: "eleccion",
  parrafos: [
    "Según el libro, los inventarios se miden al costo o al valor neto realizable, el que sea menor.",
    "El valor neto realizable es el precio al que se espera vender, menos lo que falta gastar para terminar el producto y para venderlo.",
    /* [CONSTRUCCIÓN] de Near: un ejemplo que no es del libro. */
    "Ahora mira un ejemplo que no es del libro. Una tienda espera vender una mercancía en $610.000.",
    "Venderla le cuesta $60.000. Así que su valor neto realizable es de $550.000.",
  ],
  /* El texto ya da el valor neto realizable: la cuenta va con él. «Se mide por el menor» es la respuesta: llega con el acierto. */
  figuras: [cuentaVnr(ROTULOS_A7.ejemplo, EJEMPLO_A7.precio, null, EJEMPLO_A7.vender)],
  pregunta: "Esa mercancía costó $580.000. ¿Por qué valor se mide, según la NIC 2 del libro?",
  opciones: [
    { id: "costo", texto: "$580.000", devolucion: "Se mide por el menor entre el costo, $580.000, y el valor neto realizable, $550.000. Aquí el menor es $550.000." },
    { id: "vnr", texto: "$550.000", correcta: true },
    { id: "precio", texto: "$610.000", devolucion: "Se mide por el menor entre el costo, $580.000, y el valor neto realizable, $550.000. Aquí el menor es $550.000." },
  ],
  acierto: { texto: "Así es. Se mide por el menor de los dos: el valor neto realizable, $550.000.", figuras: [cuentaMenor(EJEMPLO_A7.costo, EJEMPLO_A7.vnr)], pie: "Basado en el libro, p. 258" },
  error: { pie: "Basado en el libro, p. 258" },
  pie: "Basado en el libro, pp. 257-258",
};

const EL_COSTO = {
  id: "el-costo",
  tipo: "eleccion",
  parrafos: [
    "Según el libro, el costo de los inventarios incluye todo lo que costó adquirirlos y transformarlos. También los otros costos que se hicieron para dejarlos en su condición y su lugar actuales.",
    "El costo de adquisición incluye el precio de compra, lo que cuesta traer la mercancía y lo que cuesta guardarla.",
    "También incluye los aranceles. Y otros impuestos, si la empresa no los puede recuperar después.",
    /* [CONSTRUCCIÓN] de Near: glosa; la p. 208 los nombra entre los «gastos de nacionalización». */
    "Los aranceles son los impuestos que se pagan por traer mercancía de otro país.",
    "Los descuentos comerciales y las rebajas se restan para hallar el costo de adquisición.",
    "Si la empresa fabrica lo que vende, el costo incluye también lo que cuesta convertir los materiales en productos terminados. El libro llama a eso costos de transformación.",
  ],
  pregunta: "¿Cuál de estos se resta para hallar el costo de adquisición?",
  opciones: [
    { id: "transporte", texto: "El transporte", devolucion: "El transporte y el almacenamiento se suman al costo. Lo que se resta es el descuento comercial." },
    { id: "descuento", texto: "Un descuento comercial", correcta: true },
    { id: "almacenamiento", texto: "El almacenamiento", devolucion: "El transporte y el almacenamiento se suman al costo. Lo que se resta es el descuento comercial." },
  ],
  acierto: { texto: "Así es. El descuento comercial se resta. El transporte y el almacenamiento se suman al costo.", pie: "Basado en el libro, p. 258" },
  error: { pie: "Basado en el libro, p. 258" },
  pie: "Basado en el libro, pp. 208 y 258",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Según la NIC 2 del libro, el inventario se mide al costo o al valor neto realizable, el que sea menor.",
    "El costo suma el precio, el transporte, el almacenamiento y los impuestos que no se recuperan.",
    "Los descuentos comerciales se restan.",
  ],
  siguiente: "Siguiente: decide qué entra en el costo de un inventario.",
  pie: "Basado en el libro, p. 258",
};

export const PIEZA_NIC2_COSTO = {
  id: A7_ID,
  numero: 7,
  titulo: "La NIC 2 del libro: el costo",
  /* Siempre a la vista, en todas las pantallas. */
  aviso: FRASE_NIC2,
  pantallas: [PORTADA, LA_NORMA, QUE_ES, COMO_SE_MIDE, EL_COSTO, RESUMEN],
};
