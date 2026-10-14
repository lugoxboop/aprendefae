/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 DE APRENDER — «Del efectivo de sobra al activo financiero».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo y en
 * ninguno más: es el contenido final de Futaba (auditado por Shoko), copiado
 * textual del paquete b5-t5-aprender1.md. Las marcas de auditoría ([p. X],
 * [CONSTRUCCIÓN]) no se copian; los rótulos «Nota» y «Así lo dice el libro»
 * sí se ven.
 *
 * Textos finales (14-oct): las líneas finales con el PASA de Shoko, la
 * reescritura de Futaba por INFLESZ para lo demás que cambió, y el paquete
 * original para el resto. Las citas del libro no cambiaron. Copia de lo
 * aprobado en orquestador/conocimiento/paquetes/b5-t5-aprender1-textos.md.
 *
 * La geometría y los estados son de la guía de diseño v3 de Mai.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

/*
 * Las citas van con sus comillas «» y la página al final, como las del Tema 3:
 * CuatroCapas no pone comillas ni tiene campo de página. Las notas usan el
 * mismo bloque, con el rótulo «Nota».
 */
export const PIEZA_DEL_EFECTIVO = {
  id: "b5-t5-a1-del-efectivo-de-sobra",
  numero: 1,
  titulo: "Del efectivo de sobra al activo financiero",
  objetivo: "Vas a ver cuándo una inversión de la empresa es temporal y de dónde sale lo que rinde.",
  nombres: [
    {
      termino: "Activo financiero",
      definicion: "Es una colocación de dinero. La empresa deja de tener ese efectivo y, a cambio, tiene algo que espera que le rinda más adelante. Ese rendimiento puede venir de un interés. Puede venir de un dividendo, que es lo que una empresa reparte entre quienes tienen sus acciones. O puede venir de venderlo por más de lo que costó.",
      delLibro: "«Representan colocaciones de dinero sobre las cuales una empresa espera obtener algún rendimiento a futuro…» (p. 191)",
    },
    {
      termino: "Activo financiero temporal",
      definicion: "Se compra con efectivo que la empresa no necesita de inmediato, en vez de dejarlo quieto. Para ser temporal, tiene que cumplir dos condiciones. La primera es poder venderse rápido y con facilidad. El libro dice “negociables o realizables”. La segunda es estar destinado a volverse efectivo cuando se necesite, en un año o en un ciclo de operaciones, el que sea más largo. El ciclo de operaciones es lo que tarda el negocio en comprar, vender y cobrar.",
      /* En un solo párrafo, con «1.» y «2.» dentro del texto (guía §3). */
      delLibro: "«1. Negociables o realizables rápidamente. 2. Destinados a convertirse en efectivo cuando se necesite, en el término de un año o de un ciclo de operaciones (el que sea más largo).» (p. 192)",
    },
    {
      termino: "Título valor",
      definicion: "Es un documento que sirve para captar recursos y moverlos entre quienes invierten. En el libro, los valores son clases de títulos valores. Por ejemplo, los valores de renta variable o los valores negociables.",
    },
    {
      termino: "Tres grupos",
      /* Lista abierta: va en prosa, con «suelen» visible (nota de Futaba). */
      definicion: "Los activos temporales suelen ser de tres grupos. El primero son los documentos a corto plazo. Ahí están los certificados de depósito, los bonos de tesorería y los documentos negociables. El segundo son los valores negociables de deuda. Ahí están los bonos del Gobierno y de compañías. El tercero son los valores negociables de capital. Ahí están las acciones preferentes y comunes.",
    },
    {
      termino: "Acciones, en este tema",
      definicion: "Aquí, la empresa compra con su efectivo acciones que emitió otra empresa. Para quien las compra, son un activo.",
      delLibro: "Son el mismo tipo de documento que ya viste en el patrimonio, mirado desde el otro lado. Para la empresa que las emite, es decir, la que las crea y las vende para conseguir recursos, son patrimonio. Para la que las compra, son un activo.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Renta variable",
      definicion: "Su rendimiento depende de cómo le vaya a la empresa que emitió el título. Un ejemplo son las acciones. Sus dividendos dependen de la situación económica de esa empresa. También dependen de su liquidez, que es su capacidad de tener efectivo para pagar.",
      delLibro: "Aquí, “renta variable” y “renta fija” son nombres de tipos de título, no de cuentas. Cuando la renta le llega a la empresa, sí se anota como un ingreso.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Renta fija",
      /* Lista abierta: «entre otros» visible, sin viñetas ni recorte. */
      definicion: "Da una renta constante, que se pacta en el momento de invertir. Es de dos tipos. Con interés: paga un interés fijo durante un periodo determinado. Por ejemplo, los certificados de depósito a término (CDT), los bonos y las cédulas hipotecarias, entre otros. Con descuento: su renta es la diferencia entre el valor de compra y el valor de redención. El valor de redención es lo que paga quien emitió el título cuando este vence. Por ejemplo, los títulos de participación, los certificados de reembolso tributario (CERT) y los títulos canjeables, entre otros.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» ═══════════ */

/* Los rótulos de la escena (guía §10): fragmentos de los pasos, sin texto nuevo. */
export const ROTULOS_ESCENA = {
  efectivo: "Efectivo de sobra",
  venta: "Vender por más de lo que costó",
};

/* Las tres tarjetas, en este orden. Las tres con el mismo estilo (guía §4.7). */
export const TITULOS = [
  { id: "cdt", nombre: "CDT", tipo: "Renta fija con interés", rinde: "Interés fijo" },
  { id: "acciones", nombre: "Acciones de otra empresa", tipo: "Renta variable", rinde: "Dividendos" },
  { id: "participacion", nombre: "Títulos de participación", tipo: "Renta fija con descuento", rinde: "Diferencia" },
];

export const PASOS_CAPA_2 = [
  "Una empresa tiene efectivo de sobra por un tiempo, por el ritmo de su negocio.",
  "En vez de dejarlo quieto, compra tres títulos que se venden fácil: un CDT, acciones de otra empresa y títulos de participación.",
  "El CDT paga un interés fijo durante un periodo: es renta fija con interés.",
  "Lo que gana quien tiene las acciones depende de cómo le vaya a la empresa que las emitió: son renta variable.",
  "Sus dividendos dependen de cómo está esa empresa y de su liquidez.",
  "Los títulos de participación rinden por la diferencia entre lo que costaron y su valor de redención: son renta fija con descuento.",
  "Los tres se pueden vender, pero vender por más de lo que costó no es un cuarto tipo de título.",
];
/* El pie de fuente de cada paso y del cierre, en el mismo orden (Futaba; el del cierre, corregido por Sakuta). */
export const PIES_CAPA_2 = [
  "Basado en el libro, p. 192",
  "Basado en el libro, pp. 192-193",
  "Libro, p. 193",
  "Libro, p. 192",
  "Libro, p. 192",
  "Libro, p. 193",
  "Basado en el libro, pp. 191 y 193",
];
export const PIE_CIERRE_CAPA_2 = "Basado en el libro, pp. 192-193";
export const CIERRE_CAPA_2 = "Un mismo efectivo, tres títulos y tres tipos de renta: variable, fija con interés y fija con descuento.";

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» ═══════════ */

export const CONSIGNA_CAPA_3 = "Toca cada paquete de acciones y mira si cumple las condiciones para ser temporal.";
export const CONTEXTO_CAPA_3 = "Una empresa compra dos paquetes de acciones de otras empresas.";
export const PAQUETES = [
  {
    id: "a",
    nombre: "Paquete A",
    descripcion: "Acciones que se negocian públicamente. La empresa ya había hecho otras inversiones así. Y las vendió cuando le faltó efectivo.",
    pie: "Basado en el libro, p. 192",
    revela: "Se venden fácil. Y su historia de inversiones respalda que se volverán efectivo cuando haga falta. Cumple las dos condiciones.",
  },
  {
    id: "b",
    nombre: "Paquete B",
    descripcion: "Acciones muy restringidas. No se negocian públicamente.",
    pie: "Basado en el libro, p. 192",
    revela: "Puede que no tengan mercado, o que sea muy pequeño. Entonces puede ser mejor clasificarlas como activos financieros a largo plazo. Es decir, no temporales.",
  },
];
/* Solo aparece con los dos paquetes abiertos, en cualquier orden. Su pie va debajo. */
export const PIE_FINAL_CAPA_3 = "Basado en el libro, pp. 191-192";
export const FINAL_CAPA_3 = [
  "Los dos paquetes son acciones. Lo que cambió la respuesta no fue el tipo de documento, sino la primera condición: poder venderse con facilidad.",
  "La intención de la empresa no basta con decirla. Se apoya en evidencias, como su historia de inversiones y el propósito de la inversión.",
  "Fíjate: las acciones del paquete A, además de temporales, son de renta variable. Son dos preguntas distintas.",
];

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

/* En el orden en que las escribió Futaba; UnaFrase las baraja una vez al cargar. */
export const PREGUNTA_FINAL_T5 = "¿Qué decide si un activo financiero es temporal?";
export const OPCIONES_FINAL_T5 = [
  {
    id: "b5-dos-condiciones",
    texto: "Que se pueda vender fácil y vaya a volverse efectivo cuando haga falta.",
    correcta: true,
    feedback: "Correcto. Los dos paquetes eran acciones, y uno no cumplió la primera condición: el tipo de documento no decide solo.",
  },
  {
    id: "b5-corto-plazo",
    texto: "Que sea un documento a corto plazo, como un bono de tesorería.",
    correcta: false,
    feedback: "No es esa. Los bonos de tesorería suelen estar entre los temporales, pero el tipo de documento no decide solo: también tiene que cumplir las dos condiciones.",
  },
  {
    id: "b5-interes-fijo",
    texto: "Que le pague a la empresa un interés fijo durante cierto tiempo.",
    correcta: false,
    feedback: "No es esa. Eso describe la renta fija con interés. Si es temporal y qué tipo de renta da son dos preguntas distintas.",
  },
  {
    id: "b5-intencion",
    texto: "Que la empresa diga que lo va a volver efectivo cuando lo necesite.",
    correcta: false,
    feedback: "No basta con decirlo. La intención cuenta, pero se apoya en evidencias, como la historia de inversiones de la empresa.",
  },
];
