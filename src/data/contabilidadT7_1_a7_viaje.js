/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 DE APRENDER — «El viaje de una caja» (pp. 208-209).
 *
 * Reemplaza a «Control interno de los inventarios» (contabilidadT7_1_a7.js)
 * con el mismo id y en la misma posición. Fuente: la «Pieza 2» del Patrón de
 * enganche C v6 de Watari (orquestador/conocimiento/paquetes/
 * patron-enganche-c-v6.html), con A7-1 y A7-2 de Mello ya aplicadas en el
 * código de referencia. Mello la da por lista
 * (auditoria-mello-enganche-v6-y-t7-3-aciertos.md, sección 1): no queda
 * ninguna corrección obligatoria pendiente.
 *
 * ESTACIONES y PANTALLAS son, campo por campo y letra por letra, las del
 * código de referencia (a7.js de la v6). Una prueba las saca del HTML de la
 * v6 y las compara enteras, en los dos sentidos.
 *
 * El título: la sección de la v6 se llama «El viaje de una caja» (su h2). La
 * lista «Las tres» y el comentario del código aún la nombran con el título
 * viejo, «Control interno de los inventarios».
 *
 * TEXTOS DE MUESTRA. La v6 dice que los textos de Mello van tal cual y que
 * los demás son de Watari, de muestra, pendientes de Near dentro de su
 * presupuesto. Cada uno va marcado abajo en un comentario (nunca en pantalla).
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A7_ID = "t7-1-a7-control-interno";

/*
 * Lo que dice la interfaz del código de referencia, tal cual: el botón de
 * avanzar, el de soltar la caja, el sello del error y el del acierto, el
 * nombre de la ruta para el lector de pantalla y la marca de la pantalla.
 */
export const INTERFAZ = {
  seguir: "Seguir",
  soltar: "Soltar la caja",
  soltarOtraVez: "Soltar otra vez",
  noEsAqui: "No es aquí",
  bien: "✓",
  ruta: "Por dónde pasa un pedido",
  marca: (n, total) => `Pantalla ${n} de ${total}`,
};

/*
 * linea: true = la caja pasa por ahí. desde: la estación de la línea de la que
 * cuelga (trazo punteado). Contabilidad recibe la hoja del informe; Conteos
 * lleva la marca «Cada cierto tiempo». Así quedan nombradas las seis medidas
 * de las pp. 208-209 (Mello, correcciones 1 y 2).
 * Los controles de las estaciones: de muestra (Watari), pendientes de Near.
 */
export const ESTACIONES = [
  { id: "recepcion", nombre: "Recepción", control: "Factura contra orden de compra", linea: true },
  { id: "contabilidad", nombre: "Contabilidad", control: "Informe de recepción · si todo llegó bien", desde: "recepcion", hoja: true },
  { id: "bodega", nombre: "Bodega", control: "Techo, puertas y póliza", linea: true },
  { id: "conteos", nombre: "Conteos", control: "Contar y comparar, también al azar", desde: "bodega", marca: "Cada cierto tiempo" },
  { id: "salida", nombre: "Salida", control: "Solo con requisición autorizada", linea: true },
];

export const PANTALLAS = [
  /* Texto de muestra (Watari), pendiente de Near. */
  { id: "p0", presupuesto: 40, texto: "Al terminar, sabrás qué controles cuidan la mercancía desde que llega hasta que sale, y dónde se nota cuando uno falla.", boton: "Empezar" },
  /* Texto de Mello (corrección 4), con las glosas de orden de compra, requisición y póliza. */
  { id: "p1", presupuesto: 40, texto: "Así viaja un pedido. Suelta la caja y mira dónde lo controla el libro. Orden de compra: el pedido que se hizo. Requisición: la orden para sacar mercancía de la bodega. Póliza: el contrato de un seguro.", accion: "soltar" },
  /*
   * Caso 1. Texto, ficha, pista y errores: de muestra (Watari), pendientes de
   * Near; las cifras (80 y 100), al registro 5c. La ficha del acierto
   * («Diferencia: 20 cajas») y el acierto: de Mello (corrección 3).
   * A7-1: en esta pantalla la hoja del informe no vuela nunca (el componente).
   */
  {
    id: "p2", presupuesto: 40, texto: "Llega un pedido a una ferretería. La orden de compra pedía 80 cajas de tornillos y la factura cobra 100. Detén la caja donde se nota la diferencia.",
    caso: {
      correcta: "recepcion", ficha: "Factura: 100 · Orden: 80", fichaBien: "Diferencia: 20 cajas",
      bien: "✓ Al recibir. La factura se compara con la orden de compra y ahí se ve.",
      pista: "Es en Recepción: la factura se compara con la orden de compra y ahí se ve.",
      mal: {
        contabilidad: "Ahí ya es tarde: contabilidad registra lo que dice el informe de recepción.",
        bodega: "La caja ya entró. La diferencia se tenía que ver antes, al recibir.",
        conteos: "El conteo llega mucho después. La diferencia se nota al recibir.",
        salida: "Para entonces la caja ya está adentro. Se nota al recibir.",
      },
    },
  },
  /* Caso 2. Todo de muestra (Watari), pendiente de Near; la cifra (10 cajas), al registro 5c. */
  {
    id: "p3", presupuesto: 40, texto: "Un empleado entrega 10 cajas a otra área porque alguien se las pidió de palabra. Detén la caja donde falla el control.",
    caso: {
      correcta: "salida", ficha: "10 cajas · sin requisición",
      bien: "✓ En la salida. Sin requisición, nada sale de la bodega: alguien tiene que autorizarla.",
      pista: "Es en Salida. Sin requisición, nada sale de la bodega: alguien tiene que autorizarla.",
      mal: {
        recepcion: "La recepción revisa lo que llega, no lo que sale.",
        contabilidad: "Contabilidad no decide quién saca mercancía de la bodega.",
        bodega: "Techo y puertas cuidan la bodega, pero no deciden quién saca qué.",
        conteos: "El conteo no dice quién saca mercancía. Eso lo dice la requisición.",
      },
    },
  },
  /*
   * Caso 3 (A7-2 de Mello). De Mello, tal cual: las dos primeras frases del
   * texto, la ficha y los errores de Recepción y de Bodega. De muestra
   * (Watari), pendientes de Near: «Detén la caja donde falta el control.», el
   * acierto, la pista y los errores de Contabilidad y Salida.
   * Al acertar, la caja se queda en Bodega («aparcar»), decisión de Watari.
   */
  {
    id: "p4", presupuesto: 40, texto: "La tienda abrió hace dos años. Desde entonces, lo que hay en la bodega solo se sabe por los libros. Detén la caja donde falta el control.",
    caso: {
      correcta: "conteos", aparcar: "bodega", ficha: "Solo lo dicen los libros",
      bien: "✓ En los conteos: el libro pide contar la mercancía cada cierto tiempo.",
      pista: "Es en Conteos: el libro pide contar la mercancía cada cierto tiempo.",
      mal: {
        recepcion: "Recibir bien no dice cuánto queda dos años después.",
        contabilidad: "Contabilidad registra lo que entra. No cuenta lo que hay en la bodega.",
        bodega: "Techo y puertas cuidan la mercancía, pero nadie la ha contado.",
        salida: "La requisición cuida cada salida. No dice cuánto queda en la bodega.",
      },
    },
  },
  /*
   * Texto de muestra (Watari), pendiente de Near. «Siguiente pieza» es el botón
   * del código de referencia; en T7-1 esta pieza es la última de Aprender y no
   * hay pieza a la que ir, así que el componente no lo pinta (un botón que no
   * hace nada). Queda aquí para que los datos sigan siendo los de la v6.
   */
  { id: "p5", presupuesto: 40, texto: "El control empieza al recibir y termina cuando la mercancía sale. La caja pasa por recepción, bodega y salida. A contabilidad llega el informe, y los conteos revisan la bodega cada cierto tiempo.", boton: "Siguiente pieza" },
];

export const PIEZA_EL_VIAJE = {
  id: A7_ID,
  numero: 7,
  titulo: "El viaje de una caja",
  pantallas: PANTALLAS,
};
