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
 * código de referencia (a7.js de la v6) con el recorte B2 de Near encima
 * (orquestador/conocimiento/paquetes/a7-n1-recorte.md): los controles de
 * Recepción, Contabilidad y Conteos y los textos de p1 a p5. Una prueba saca
 * la referencia del HTML de la v6, le aplica las tablas del paquete y la
 * compara entera, en los dos sentidos. Con la cuenta de Near («todo lo que
 * se ve a la vez») ninguna pantalla pasa de 60 palabras.
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
 * Los controles de las estaciones: Bodega y Salida, de muestra (Watari), que
 * el recorte de Near deja igual; Recepción, Contabilidad y Conteos, del recorte.
 */
export const ESTACIONES = [
  { id: "recepcion", nombre: "Recepción", control: "Factura contra orden", linea: true },
  { id: "contabilidad", nombre: "Contabilidad", control: "Informe de recepción, si todo llegó bien", desde: "recepcion", hoja: true },
  { id: "bodega", nombre: "Bodega", control: "Techo, puertas y póliza", linea: true },
  { id: "conteos", nombre: "Conteos", control: "Conteo, también al azar", desde: "bodega", marca: "Cada cierto tiempo" },
  { id: "salida", nombre: "Salida", control: "Solo con requisición autorizada", linea: true },
];

export const PANTALLAS = [
  /* Texto de muestra (Watari), pendiente de Near. */
  { id: "p0", presupuesto: 40, texto: "Al terminar, sabrás qué controles cuidan la mercancía desde que llega hasta que sale, y dónde se nota cuando uno falla.", boton: "Empezar" },
  /* Las glosas de orden de compra, requisición y póliza (Mello, corrección 4), con el texto del recorte de Near. */
  { id: "p1", presupuesto: 40, texto: "Así viaja un pedido. Suelta la caja y mira dónde lo controla el libro. Orden de compra: el pedido hecho. Requisición: la orden para sacar mercancía. Póliza: un seguro.", accion: "soltar" },
  /*
   * Caso 1. Texto, acierto, pista y errores: del recorte de Near (los errores
   * ya no dan la respuesta: «se veía antes»). La ficha y la del acierto
   * («Diferencia: 20 cajas»), de la v6; las cifras (80 y 100), al registro 5c.
   * A7-1: en esta pantalla la hoja del informe no vuela nunca (el componente).
   */
  {
    id: "p2", presupuesto: 40, texto: "Una ferretería pidió 80 cajas y le cobran 100. Detén la caja donde se ve la diferencia.",
    caso: {
      correcta: "recepcion", ficha: "Factura: 100 · Orden: 80", fichaBien: "Diferencia: 20 cajas",
      bien: "✓ Al recibir: la factura se compara con la orden.",
      pista: "En Recepción: la factura se compara con la orden.",
      mal: {
        contabilidad: "Ahí ya es tarde: contabilidad solo registra el informe.",
        bodega: "La caja ya entró: la diferencia se veía antes.",
        conteos: "El conteo llega mucho después: se veía antes.",
        salida: "Para entonces la caja ya está adentro.",
      },
    },
  },
  /* Caso 2. Textos del recorte de Near; la ficha, de la v6; la cifra (10 cajas), al registro 5c. */
  {
    id: "p3", presupuesto: 40, texto: "Un empleado entrega 10 cajas que le pidieron de palabra. Detén la caja donde falla el control.",
    caso: {
      correcta: "salida", ficha: "10 cajas · sin requisición",
      bien: "✓ En la salida: sin requisición autorizada, nada sale.",
      pista: "Es en Salida: sin requisición autorizada, nada sale.",
      mal: {
        recepcion: "Recepción solo revisa lo que llega.",
        contabilidad: "Contabilidad no decide quién saca mercancía.",
        bodega: "Techo y puertas no deciden quién saca qué.",
        conteos: "El conteo no decide quién saca mercancía.",
      },
    },
  },
  /*
   * Caso 3 (A7-2 de Mello). Del recorte de Near: el texto, la ficha (la de
   * Mello repetía el texto), el acierto, la pista y los cuatro errores, sin
   * el verbo «contar». El error de Recepción sigue siendo el de Mello.
   * Al acertar, la caja se queda en Bodega («aparcar»), decisión de Watari.
   */
  {
    id: "p4", presupuesto: 40, texto: "Hace dos años que nadie revisa la bodega. Detén la caja donde falta el control.",
    caso: {
      correcta: "conteos", aparcar: "bodega", ficha: "2 años · solo libros",
      bien: "✓ En los conteos: el libro pide uno cada cierto tiempo.",
      pista: "Es en Conteos: el libro pide uno cada cierto tiempo.",
      mal: {
        recepcion: "Recibir bien no dice cuánto queda dos años después.",
        contabilidad: "Contabilidad registra lo que entra, no lo que hay.",
        bodega: "Techo y puertas cuidan, pero no dicen cuánto hay.",
        salida: "La requisición cuida cada salida, no lo que queda.",
      },
    },
  },
  /*
   * Texto del recorte de Near. «Siguiente pieza» es el botón
   * del código de referencia; en T7-1 esta pieza es la última de Aprender y no
   * hay pieza a la que ir, así que el componente no lo pinta (un botón que no
   * hace nada). Queda aquí para que los datos sigan siendo los de la v6.
   */
  { id: "p5", presupuesto: 40, texto: "El control empieza al recibir y termina cuando la mercancía sale. El informe va a contabilidad, y la bodega se revisa cada cierto tiempo.", boton: "Siguiente pieza" },
];

export const PIEZA_EL_VIAJE = {
  id: A7_ID,
  numero: 7,
  titulo: "El viaje de una caja",
  pantallas: PANTALLAS,
};
