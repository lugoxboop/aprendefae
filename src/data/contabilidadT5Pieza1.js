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
  /*
   * B2 · un término por pantalla (entrega final de Futaba con las correcciones
   * de Shoko, 15-oct): nueve pantallas, cada una de 60 palabras o menos. La
   * primera condición se une a «Activo financiero temporal» y la segunda va
   * sola; «Título valor» sale (decisión de Sakuta); «Renta fija» se parte en
   * sus dos tipos. La nota de “renta variable” y “renta fija” pasa a «Renta
   * fija», donde ya se nombraron los dos.
   */
  nombres: [
    {
      termino: "Activo financiero",
      definicion: "Es una colocación de dinero que se espera que rinda más adelante. Puede rendir un interés, un dividendo (lo que una empresa reparte entre sus accionistas) o una venta por más de lo que costó.",
      delLibro: "«…colocaciones de dinero sobre las cuales una empresa espera obtener algún rendimiento a futuro…» (p. 191)",
    },
    {
      termino: "Activo financiero temporal",
      definicion: "Se compra con efectivo que la empresa no necesita de inmediato, en vez de dejarlo quieto. Para ser temporal cumple dos condiciones a la vez. La primera: poder venderse rápido y con facilidad.",
      delLibro: "«1. Negociables o realizables rápidamente.» (p. 192)",
    },
    {
      termino: "La segunda condición",
      /* Sin cita, como pidió Shoko. */
      definicion: "Es la segunda: estar destinado a volverse efectivo cuando se necesite, en un año o en un ciclo de operaciones, el que sea más largo. El ciclo de operaciones es lo que tarda el negocio en comprar, vender y cobrar.",
    },
    {
      termino: "Tres grupos",
      /* Lista abierta: va en prosa, con «suelen» visible. El texto de Futaba (INFLESZ 61), por decisión de Sakuta. */
      definicion: "Los activos temporales suelen ser de tres grupos. Uno son los documentos a corto plazo: certificados de depósito, bonos de tesorería y documentos negociables. Otro son los valores negociables de deuda: bonos del Gobierno y de compañías. Y otro son los de capital: acciones preferentes y comunes.",
    },
    {
      termino: "Acciones, en este tema",
      definicion: "Aquí, la empresa compra acciones que otra empresa emitió.",
      delLibro: "Ya las viste en el patrimonio, desde el otro lado. Para la empresa que las emite, es decir, la que las crea y las vende para conseguir recursos, son patrimonio. Para la que las compra, son un activo.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Renta variable",
      definicion: "Su rendimiento depende de cómo le vaya a la empresa que emitió el título. Así pasa con las acciones. Sus dividendos dependen de la situación económica de esa empresa. Y de su liquidez, es decir, de su capacidad de tener efectivo para pagar.",
    },
    {
      termino: "Renta fija",
      definicion: "Da una renta constante, que se pacta en el momento de invertir. Es de dos tipos: con interés o con descuento.",
      delLibro: "Aquí, “renta variable” y “renta fija” son nombres de tipos de título, no de cuentas. Cuando la renta le llega a la empresa, sí se anota como un ingreso.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Renta fija con interés",
      /* Lista abierta: «entre otros» visible, sin viñetas ni recorte. */
      definicion: "Paga un interés fijo durante un periodo determinado. Por ejemplo, el CDT, los bonos y las cédulas hipotecarias, entre otros. El CDT es un certificado de depósito a término.",
    },
    {
      termino: "Renta fija con descuento",
      definicion: "Su renta es la diferencia entre el valor de compra y el valor de redención. El valor de redención es lo que paga quien emitió el título cuando este vence. Por ejemplo, los títulos de participación, el CERT (certificado de reembolso tributario) y los títulos canjeables, entre otros.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» ═══════════ */

/* Los rótulos de la escena (guía §10): fragmentos de los pasos, sin texto nuevo. */
export const ROTULOS_ESCENA = {
  efectivo: "Efectivo de sobra",
  venta: "Vender por más de lo que costó",
};

/*
 * Las tres tarjetas, en este orden. Las tres con el mismo estilo (guía §4.7).
 * «Diferencia al redimir» es la cápsula de la guía v5 (corrección de Levi).
 */
export const TITULOS = [
  { id: "cdt", nombre: "CDT", tipo: "Renta fija con interés", rinde: "Interés fijo" },
  { id: "acciones", nombre: "Acciones de otra empresa", tipo: "Renta variable", rinde: "Dividendos" },
  { id: "participacion", nombre: "Títulos de participación", tipo: "Renta fija con descuento", rinde: "Diferencia al redimir" },
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

/* Consigna y decisión de cada caja: entrega 2 de Futaba (hoja 6 de Mai, predecir antes de revelar). */
export const CONSIGNA_CAPA_3 = "Toca cada paquete y decide si puede ser temporal. Después, mira la razón.";
export const PREGUNTA_CAPA_3 = "¿Puede ser temporal?";
export const OPCIONES_CAPA_3 = [
  { id: "si", texto: "Sí: cumple las dos condiciones" },
  { id: "no-facil", texto: "No: no se vende fácil" },
  { id: "no-intencion", texto: "No: no hay intención de venderlo" },
];
export const CONTEXTO_CAPA_3 = "Una empresa compra dos paquetes de acciones de otras empresas.";
export const PAQUETES = [
  {
    id: "a",
    nombre: "Paquete A",
    descripcion: "Acciones que se negocian públicamente. La empresa ya había hecho otras inversiones así. Y las vendió cuando le faltó efectivo.",
    pie: "Basado en el libro, p. 192",
    revela: "Se venden fácil. Y su historia de inversiones respalda que se volverán efectivo cuando haga falta. Cumple las dos condiciones.",
    correcta: "si",
    falla: "Sí se vende fácil: se negocia públicamente. Y ya vendió inversiones así cuando le faltó efectivo.",
    pista: "Revisa las dos condiciones, una por una, con lo que dice la descripción del paquete.",
  },
  {
    id: "b",
    nombre: "Paquete B",
    descripcion: "Acciones muy restringidas. No se negocian públicamente.",
    pie: "Basado en el libro, p. 192",
    revela: "Puede que no tengan mercado, o que sea muy pequeño. Entonces puede ser mejor clasificarlas como activos financieros a largo plazo. Es decir, no temporales.",
    correcta: "no-facil",
    falla: {
      si: "Si no se negocia públicamente, puede que no tenga mercado. Falla la primera condición: venderse fácil.",
      "no-intencion": "El paquete no dice nada de la intención. Lo que falla es que no se negocia públicamente.",
    },
    pista: "Piensa quién le compraría estas acciones a la empresa si las quisiera vender mañana.",
  },
];
/*
 * La figura de la capa 3 (Mai, enganche B1-B5 §2b; textos nuevos, para
 * Shoko): dos cajones. Al decidirse un paquete, su nombre entra en el cajón
 * correcto (el de su respuesta correcta: «si» es temporal), se acierte o no.
 */
export const FIGURA_CAPA_3 = { temporal: "Temporal", noTemporal: "No temporal" };
/* Solo aparece con los dos paquetes abiertos, en cualquier orden. Su pie va debajo. */
export const PIE_FINAL_CAPA_3 = "Basado en el libro, pp. 191-192";
export const FINAL_CAPA_3 = [
  "Los dos paquetes son acciones. Lo que cambió la respuesta no fue el tipo de documento, sino la primera condición: poder venderse con facilidad.",
  "La intención de la empresa no basta con decirla. Se apoya en evidencias, como su historia de inversiones y el propósito de la inversión.",
  "Fíjate: las acciones del paquete A, además de temporales, son de renta variable. Son dos preguntas distintas.",
];

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

/*
 * C1-1 de Futaba (lote C2 · C1 · C7, PASA de Shoko): la pregunta de antes
 * tenía la respuesta en la pantalla anterior; esta es un caso nuevo, con su
 * pie «Escenario simulado» (lo pinta la escena de la pieza, bajo UnaFrase).
 * En el orden en que las escribió Futaba; UnaFrase las baraja una vez al cargar.
 */
export const PREGUNTA_FINAL_T5 = "Una empresa compra bonos que se venden fácil, pero piensa guardarlos cinco años. Su ciclo de operaciones dura menos de un año. ¿Son un activo financiero temporal?";
export const OPCIONES_FINAL_T5 = [
  {
    id: "b5-no-un-ano",
    texto: "No: no se volverán efectivo en un año.",
    correcta: true,
    feedback: "Correcto. Cumplen la primera condición, pero no la segunda: no están destinados a volverse efectivo en un año o en un ciclo de operaciones.",
  },
  {
    id: "b5-se-vende-facil",
    texto: "Sí: se venden fácil, y con eso basta.",
    correcta: false,
    feedback: "No es esa. Venderse fácil es solo la primera condición. También tienen que estar destinados a volverse efectivo pronto.",
  },
  {
    id: "b5-bonos-temporales",
    texto: "Sí: los bonos suelen estar entre los temporales.",
    correcta: false,
    feedback: "No es esa. El tipo de documento no decide solo: también tienen que cumplir las dos condiciones.",
  },
  {
    id: "b5-bonos-nunca",
    texto: "No: los bonos nunca son activos temporales.",
    correcta: false,
    feedback: "No es esa. Los bonos sí pueden ser temporales, si cumplen las dos condiciones. Aquí falla la segunda.",
  },
];
export const PIE_FINAL_T5 = "Escenario simulado";
