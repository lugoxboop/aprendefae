import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";
import { H3_LIBRO } from "./contabilidadT7_3_a3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A4 DE APRENDER — «El descuento en los dos libros» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md), con la
 * corrección de Mello a la pista de P1 (mello-recortes-v1.md) y el cambio a
 * la pista de `cierre` y a la retroalimentación de su tercera opción que
 * trae el propio recorte. Cinco pantallas: el pago (que el descuento es un
 * ingreso para quien compra pasa al «¿Por qué?»), el cierre con la cuenta T
 * de San Calixto, «no operacional» como pregunta (reemplaza dos lecturas) y
 * el resumen con las dos cuentas T lado a lado.
 *
 * El ejemplo H-3 del libro (pp. 253-254). Las cifras son las de A3 (es el
 * mismo ejemplo): se leen de ahí. Erratas que declara: C7-9 (598.500),
 * C7-17 (condicionado) y C7-30 (Caja o Bancos).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A4_ID = "t7-3-descuento-en-dos-libros";

const C = H3_LIBRO;
const DCC = "Descuento comercial condicionado";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver cómo anota el descuento quien lo recibe, y cómo se cierra la cuenta.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 253-254",
};

const EL_PAGO = {
  id: "el-pago",
  /* Pista de Mello (mello-pistas-distractores-v1.md): gana sobre la del recorte. */
  pista: "Para quien vende, la cuenta fue al debe. Santa Martha está del otro lado del negocio.",
  tipo: "eleccion",
  parrafos: ["Santa Martha pagó a tiempo y recibió un descuento de $598.500."],
  pregunta: "En el libro de Santa Martha, ¿a qué lado va Descuento comercial condicionado?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "Al debe va en el libro de quien da el descuento. Santa Martha lo recibe." },
    { id: "haber", texto: "Haber", correcta: true },
    { id: "no-se-anota", texto: "No se anota en su libro", devolucion: "Sí se anota. Quien recibe el descuento también lo registra en su libro, porque paga menos de lo que debía." },
  ],
  acierto: {
    texto: "Así es: quien recibe el descuento lo anota en el haber.",
    porque: "Para quien compra, el descuento es un ingreso: paga menos de lo que debía. Las dos empresas usan la misma cuenta: va al debe de quien da el descuento y al haber de quien lo recibe. Cuentas por pagar – proveedores sale completa: Santa Martha ya no le debe nada a San Calixto.",
    /* C7-9 (598.500), C7-17 (condicionado) y C7-30 (Caja o Bancos). */
    asientos: [{
      fecha: null,
      lineas: [
        { cuenta: "Cuentas por pagar – proveedores", lado: DEBE, monto: C.cliente },
        { cuenta: DCC, lado: HABER, monto: C.condicionado },
        { cuenta: "Caja o Bancos", lado: HABER, monto: C.pago },
      ],
    }],
    pie: "Basado en el libro, p. 253",
  },
  error: { pie: "Basado en el libro, p. 253" },
  pie: "Basado en el libro, p. 253",
};

const CIERRE = {
  id: "cierre",
  pista: "¿Qué lado deja la cuenta en cero?",
  tipo: "eleccion",
  /* La cuenta T de San Calixto, con el saldo en el debe (p. 254). */
  cuentasT: [{ titular: "San Calixto", cuenta: DCC, debe: [{ monto: C.condicionado, fecha: "" }], haber: [] }],
  tras: ["Al final del periodo, esta cuenta se cierra contra Ganancias y pérdidas: se deja en cero."],
  pregunta: "¿A qué lado va para cerrarla en San Calixto?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "Para dejarla en cero, se anota al lado contrario de su saldo." },
    { id: "haber", texto: "Haber", correcta: true },
    { id: "no-se-cierra", texto: "No se cierra: queda con su saldo", devolucion: "Al final del periodo, esta cuenta se cierra contra Ganancias y pérdidas." },
  ],
  acierto: {
    texto: "Así es: al haber, y Ganancias y pérdidas al debe.",
    porque: "En Santa Martha pasa al revés: la cuenta tenía saldo en el haber, así que se cierra por el debe.",
    pie: "Basado en el libro, p. 254",
  },
  error: { pie: "Basado en el libro, p. 254" },
  pie: "Basado en el libro, p. 254",
};

/*
 * Aciertos C7: P3 sale de t7-3-tres-aciertos-c7.md (Near) con N-1 de Mello
 * (auditoria-mello-enganche-v6-y-t7-3-aciertos.md, §2.2): el acierto lleva la
 * condición del saldo («con saldo en el haber») y la del permanente, a la
 * vista y sin plegado; sin «Así es.». La pista y los errores no cambian.
 */
const NO_OPERACIONAL = {
  id: "no-operacional",
  pista: "San Calixto dio el descuento. ¿Eso para él es un gasto o un ingreso?",
  tipo: "eleccion",
  parrafos: ["No operacional: ajeno a la operación."],
  pregunta: "San Calixto quedó con saldo en el debe. ¿Cómo va al estado de resultados?",
  opciones: [
    { id: "gasto", texto: "Gasto no operacional", correcta: true },
    { id: "ingreso", texto: "Ingreso no operacional", devolucion: "Saldo en el debe es un gasto para San Calixto: dio el descuento." },
    { id: "costo", texto: "Costo de mercancía vendida", devolucion: "No es costo de la mercancía: el libro lo deja fuera de la operación." },
  ],
  acierto: {
    texto: "En Santa Martha, con saldo en el haber, es ingreso no operacional. Con el permanente, San Calixto anota también el costo. Santa Martha usa Inventario de mercancías, no Compras.",
    pie: "Basado en el libro, pp. 253-254",
  },
  error: { pie: "Basado en el libro, p. 253" },
  pie: "Basado en el libro, p. 253",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* Las dos cuentas T, una al lado de la otra, con su saldo. */
  cuentasTLado: {
    titulo: "San Calixto: debe · Santa Martha: haber",
    cuentas: [
      { titular: "San Calixto", cuenta: DCC, debe: [{ monto: C.condicionado, fecha: "" }], haber: [] },
      { titular: "Santa Martha", cuenta: DCC, debe: [], haber: [{ monto: C.condicionado, fecha: "" }] },
    ],
  },
  tras: [
    "Quien da el descuento lo anota en el debe, y quien lo recibe, en el haber. Los dos usan la misma cuenta.",
    "Al final del periodo, la cuenta se cierra contra Ganancias y pérdidas.",
  ],
  siguiente: "Siguiente: ¿el descuento es comercial o condicionado?",
  pie: "Basado en el libro, pp. 253-254",
};

export const PIEZA_EL_DESCUENTO_EN_DOS_LIBROS = {
  id: A4_ID,
  numero: 4,
  titulo: "El descuento en los dos libros",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, EL_PAGO, CIERRE, NO_OPERACIONAL, RESUMEN],
};
