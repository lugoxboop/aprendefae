/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 DE APRENDER — «Control interno de los inventarios» (pp. 208-209).
 *
 * Fuente: la v1 de Near con sus cambios de la v2, con PASA de Mello. Copias en
 * orquestador/conocimiento/paquetes/t7-1-a7-v1.md y t7-1-a7-v2-cambios.md;
 * una prueba compara cada texto de aquí contra ellas, letra por letra.
 *
 * Lo que cambia la v2: P4 cierra SIN la línea «Siguiente: «¿Qué control
 * falta?»». Vuelve cuando H7 esté publicada: H7 entra con este PR, así que
 * la línea vuelve, tal cual la v1 (commit aparte, declarado en el PR).
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Cinco pantallas, sin
 * figura: dos casos con preguntas de opción, como las de A5.
 *
 * Construcción de Near, marcada en la v1 (se dice aquí, no en pantalla): las
 * glosas de «orden de compra», «requisición» y «póliza de seguros», y los dos
 * casos (la ferretería y la entrega de palabra).
 *
 * Lo que la v1 no trae y se toma de la convención de AP1, AP2, A5 y A6: el
 * botón «Seguir» de los aciertos y «Confirmar». Interfaz del patrón:
 * «Correcto.» e «Incorrecto.».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A7_ID = "t7-1-a7-control-interno";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto." };

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Saber qué controles cuidan la mercancía, desde que llega hasta que sale.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 208-209",
};

/* P1 · Por qué cuidarlo. Fuera, «capital de trabajo»: no está enseñado. */
const POR_QUE = {
  id: "por-que-cuidarlo",
  tipo: "lectura",
  parrafos: [
    "Para muchas empresas, el inventario es uno de sus activos más importantes. Por eso el libro pide medidas de control para cuidarlo.",
    "Esas medidas empiezan en el momento mismo en que llega la mercancía.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 208",
};

/* P2 · Al recibir. */
const AL_RECIBIR = {
  id: "al-recibir",
  pista: "El libro pide que el control empiece lo antes posible. ¿Cuál de estos momentos llega primero?",
  tipo: "eleccion",
  parrafos: [
    "Cuando llega la mercancía, se compara la factura con la orden de compra. Así se ve si hay diferencias en precios, cantidades o referencias.",
    /* Glosa de Near (construcción): el libro no define «orden de compra». */
    "La orden de compra es el pedido que la empresa hizo.",
    "Si todo está bien, se hace un informe de recepción. Ese informe va a contabilidad para registrar la compra.",
  ],
  pregunta: "Llega un pedido a una ferretería. La orden de compra pedía 80 cajas de tornillos, y la factura cobra 100. ¿Cuándo se debe notar la diferencia?",
  opciones: [
    { id: "al-recibir", texto: "Al recibir, al comparar la factura con la orden de compra.", correcta: true },
    {
      id: "conteo",
      texto: "Al cierre, con el conteo físico.",
      correcta: false,
      devolucion: "El libro pide que el control empiece en el momento mismo en que llega la mercancía, no al cierre.",
    },
    {
      id: "contabilidad",
      texto: "Cuando contabilidad registra la compra.",
      correcta: false,
      devolucion: "Contabilidad registra la compra más tarde, con el informe de recepción. Pero la comparación se hace antes, cuando llega el pedido.",
    },
  ],
  pie: "Basado en el libro, pp. 208-209",
  error: { pie: "Basado en el libro, pp. 208-209" },
  acierto: {
    texto: "Así es. El libro pide comparar la factura con la orden de compra desde el momento en que se recibe la mercancía.",
    pie: "Basado en el libro, p. 208",
  },
};

/* P3 · Controles de seguridad. La lista del libro, en su orden; las glosas, después. */
const SEGURIDAD = {
  id: "controles-de-seguridad",
  pista: "El problema es cómo salió la mercancía de la bodega. Busca el control que decide quién puede sacarla.",
  tipo: "eleccion",
  parrafos: ["Además de los controles del registro, el libro pide otros de seguridad."],
  lista: [
    "Hacer conteos físicos cada cierto tiempo.",
    "Comparar los inventarios físicos con los registros contables.",
    "Guardar los inventarios en un almacén techado y con puertas, para que no los roben.",
    "Entregar mercancía solo con requisiciones autorizadas.",
    "Proteger los inventarios con una póliza de seguros.",
    "Revisar al azar y comparar con los libros contables.",
  ],
  /* Glosas de Near (construcción): el libro no las define. */
  despues: [
    "Una requisición es la orden para sacar algo de la bodega. Alguien con permiso la aprueba.",
    "Una póliza de seguros es el contrato de un seguro.",
  ],
  pregunta: "Un empleado de la bodega entrega 10 cajas a otra área porque alguien se las pidió de palabra. ¿Qué control no se cumplió?",
  opciones: [
    { id: "requisicion", texto: "Entregar mercancía solo con requisiciones autorizadas.", correcta: true },
    {
      id: "poliza",
      texto: "Proteger los inventarios con una póliza de seguros.",
      correcta: false,
      devolucion: "El seguro no decide quién saca mercancía de la bodega. Eso lo decide la requisición.",
    },
    {
      id: "conteos",
      texto: "Hacer conteos físicos cada cierto tiempo.",
      correcta: false,
      devolucion: "El conteo no decide quién saca mercancía de la bodega. Eso lo decide la requisición.",
    },
  ],
  pie: "Basado en el libro, p. 209",
  error: { pie: "Basado en el libro, p. 209" },
  acierto: {
    texto: "Así es. Según el libro, la mercancía solo sale con una requisición que esté aprobada.",
    pie: "Basado en el libro, p. 209",
  },
};

/* P4 · Resumen, sin botón. La línea «Siguiente» de la v1 vuelve con H7, como dice la v2. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "El control empieza al recibir: la factura se compara con la orden de compra.",
    "Con el informe de recepción, contabilidad registra la compra.",
    "Para cuidar el inventario, el libro pide conteos y revisiones. También pide un almacén con techo y puertas, un seguro y entregas con permiso.",
  ],
  boton: null,
  siguiente: "Siguiente: «¿Qué control falta?».",
  pie: "Basado en el libro, pp. 208-209",
};

export const PIEZA_CONTROL_INTERNO = {
  id: A7_ID,
  numero: 7,
  titulo: "Control interno de los inventarios",
  pantallas: [PORTADA, POR_QUE, AL_RECIBIR, SEGURIDAD, RESUMEN],
};
