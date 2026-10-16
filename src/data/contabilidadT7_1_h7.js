/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 DE HACER — «¿Qué control falta?» (Célula C).
 *
 * Fuente: la entrega D v2 de Near (orquestador/conocimiento/paquetes/
 * d-v2-h7-y-n3.md, sección 1), con las correcciones obligatorias de Mello
 * (auditoria-mello-n5-v2-y-entrega-d-v2.md, sección 2):
 *   · H7-1: una séptima opción, la requisición (p. 209), con su pista en
 *     cada caso; con 7 opciones y 6 casos, el último ya no sale por descarte
 *   · H7-2: en `mismo-dia`, la pista de Conteos sin «revisión»
 *   · H7-3: la figura no dibuja el control mientras el caso está abierto
 *     (eso está en el componente del plano)
 * Una prueba compara cada texto contra el paquete corregido, letra por letra.
 *
 * Lo que la D no cambia sigue como en la v1 de Near (t7-1-h7-v1.md y
 * t7-1-h7-cambios.md): el nombre, la etiqueta del panel, el objetivo que
 * decidió L, el «porque» de cada caso (la línea del libro) y su pie.
 *
 * Hacer Fácil, exploratoria: el motor paga los 10 FP al terminar; el
 * porcentaje va para el panel docente. Migración 0097. Siguen siendo 6
 * aciertos, uno por caso: no hay migración nueva.
 *
 * LA ESCALERA (C2): siete opciones fijas en todos los casos. Al primer error,
 * la línea del distractor elegido (`porQueNo`) y otro intento; al segundo,
 * esa línea y el «porque»; con el acierto, «Correcto.» y el «porque». Solo
 * suma el primer intento. Los casos van en orden aleatorio.
 *
 * CIFRAS: la única es la de las 40 cajas de `sin-informe` (dato del caso).
 * Las 500 unidades de la v1 salieron con el caso nuevo de `quinientas`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H7_ID = "t7-1-que-control-falta";

export const H7 = {
  id: H7_ID,
  nombre: "¿Qué control falta?",
  /* La v1: «Etiqueta del panel docente». */
  etiqueta: "¿Qué control falta? · Inventarios I",
  /* Decisión de L. */
  objetivo: "Relacionar cada riesgo de la bodega con el control que el libro propone.",
  /* La D: la regla del intento sale de la consigna y va al distintivo (C5). */
  consigna: ["Cada caso muestra un riesgo en la bodega. Elige el control del libro que le hace falta."],
  distintivo: "Vale el primer intento",
};

/* Las siete opciones, fijas y en este orden en todos los casos: las seis de la D y la requisición de Mello (H7-1). */
export const CONTROLES_H7 = [
  { valor: "almacen", texto: "Un almacén techado y con puertas" },
  { valor: "poliza", texto: "Una póliza de seguros" },
  { valor: "conteos", texto: "Conteos físicos cada cierto tiempo" },
  { valor: "comparar", texto: "Comparar lo físico con los registros" },
  { valor: "azar", texto: "Revisiones al azar" },
  { valor: "recepcion", texto: "Un informe de recepción" },
  { valor: "requisicion", texto: "Entregas solo con requisición autorizada" },
];

const TODOS = CONTROLES_H7.map((c) => c.valor);
const resto = (correcta) => TODOS.filter((v) => v !== correcta);

/*
 * `punto`: el nombre corto del punto de riesgo del plano, que sale al
 * resolver el caso (la D: «la puerta, el fuego, los estantes, la hoja
 * archivada, el calendario y el muelle de llegada»).
 */
export const CASOS_H7 = [
  {
    id: "sin-puerta", subtema: "Seguridad física", pie: "Basado en el libro, p. 209", punto: "la puerta",
    texto: "Por las noches, una parte de la bodega queda abierta a la calle. Cualquiera podría entrar y llevarse mercancía.",
    correcta: "almacen", distractores: resto("almacen"),
    porQueNo: {
      poliza: "El seguro paga después de una pérdida. Aquí el riesgo es que alguien entre.",
      conteos: "El conteo diría que falta algo, pero no evita que alguien entre.",
      comparar: "Comparar mostraría el faltante después. El riesgo es que cualquiera puede entrar.",
      azar: "Una revisión al azar no cierra la bodega. Cualquiera podría seguir entrando.",
      recepcion: "El informe de recepción es para lo que llega, no para cuidar lo que ya está guardado.",
      requisicion: "La requisición controla lo que se entrega. Quien entra de noche por la calle no pide nada.",
    },
    porque: "El libro pide guardar los inventarios en un almacén techado y con puertas, para evitar los robos.",
  },
  {
    id: "incendio", subtema: "Protección", pie: "Basado en el libro, p. 209", punto: "el fuego",
    texto: "Un incendio destruye parte de la mercancía. Nadie le va a pagar a la empresa esa pérdida.",
    correcta: "poliza", distractores: resto("poliza"),
    porQueNo: {
      almacen: "Techo y puertas evitan robos, pero no le pagan a la empresa lo que se quemó.",
      conteos: "El conteo diría cuánto se quemó, pero no le devuelve nada a la empresa.",
      comparar: "Comparar con los registros mide la pérdida, pero no la paga.",
      azar: "Una revisión al azar no le paga a nadie lo que se quemó.",
      recepcion: "El informe de recepción es para lo que llega. Aquí falta quién pague la pérdida.",
      requisicion: "La requisición controla lo que se entrega. El fuego no pide permiso, y nadie paga la pérdida.",
    },
    porque: "El libro pide proteger los inventarios con una póliza de seguros.",
  },
  {
    id: "falta-mercancia", subtema: "Conteo", pie: "Basado en el libro, p. 209", punto: "los estantes",
    texto: "Hace tres años que nadie mira cuántas unidades hay de verdad en la bodega.",
    correcta: "conteos", distractores: resto("conteos"),
    porQueNo: {
      almacen: "La bodega puede estar bien cerrada, y aun así nadie sabe cuántas unidades tiene.",
      poliza: "El seguro cubre pérdidas, pero no dice cuántas unidades hay.",
      comparar: "Para comparar, primero hay que saber qué hay. Y hace tres años que nadie lo mira.",
      azar: "Lo de «al azar» sirve cuando ya se revisa. Aquí no se revisa nada hace tres años.",
      recepcion: "El informe es para lo que llega. Aquí falta saber qué hay ya en la bodega.",
      requisicion: "La requisición cuida lo que sale. No dice cuánto hay en la bodega.",
    },
    porque: "El libro pide hacer conteos físicos de forma periódica.",
  },
  {
    id: "quinientas", subtema: "Comparación con registros", pie: "Basado en el libro, p. 209", punto: "la hoja archivada",
    texto: "Cada mes, alguien anota cuántas unidades hay en la bodega. Esa hoja se archiva y nadie la pone al lado de los libros.",
    correcta: "comparar", distractores: resto("comparar"),
    porQueNo: {
      almacen: "La bodega no es el problema. El problema es lo que pasa con la hoja.",
      poliza: "Un seguro no hace nada con esa hoja. Aquí falta un paso con lo anotado.",
      conteos: "Las unidades sí se anotan cada mes. Lo que falta es otro paso, con esa hoja.",
      azar: "Revisar más, o por sorpresa, no sirve si esa hoja nunca se usa.",
      recepcion: "El informe es para lo que llega. Aquí la hoja ya existe y nadie la usa.",
      requisicion: "La requisición cuida cada entrega. Aquí el problema es la hoja que nadie usa.",
    },
    porque: "El libro pide comparar lo que hay en la bodega con los registros contables.",
  },
  {
    /* La D: el subtema pasa de «Comparación con registros» a «Revisión al azar» (solo lo ve el docente). */
    id: "mismo-dia", subtema: "Revisión al azar", pie: "Basado en el libro, p. 209", punto: "el calendario",
    texto: "El jefe pasa por la bodega siempre el último viernes del mes. Todos lo saben, y ese día todo está en orden.",
    correcta: "azar", distractores: resto("azar"),
    porQueNo: {
      almacen: "La bodega está cerrada y en orden. El problema es que todos saben cuándo llega el jefe.",
      poliza: "Un seguro no cambia lo que pasa en la bodega ese viernes.",
      /* Mello, H7-2. */
      conteos: "Ya hay una visita cada mes. El problema es que todos saben qué día llega.",
      comparar: "Comparar sirve, pero si todos saben el día, ese día todo cuadra.",
      recepcion: "El informe es para lo que llega. Aquí el problema es el día que todos conocen.",
      requisicion: "La requisición cuida cada entrega. Aquí el problema es que todos conocen el día de la visita.",
    },
    porque: "El libro pide revisar al azar y comparar con los libros contables.",
  },
  {
    id: "sin-informe", subtema: "Recepción", pie: "Basado en el libro, pp. 208-209", punto: "el muelle de llegada",
    texto: "Llegan 40 cajas y se guardan en la bodega. Un mes después, la compra todavía no aparece en los libros.",
    correcta: "recepcion", distractores: resto("recepcion"),
    porQueNo: {
      almacen: "Las cajas están bien guardadas. El problema es que la compra no llega a los libros.",
      poliza: "Un seguro no hace que la compra llegue a los libros.",
      conteos: "Un conteo encontraría las cajas más tarde. El control falta el día en que llegan.",
      comparar: "Al comparar se vería la diferencia, pero un mes tarde. Falta algo el día en que llegan.",
      azar: "Una revisión al azar lo vería tarde, si es que lo ve. Falta algo el día en que llegan.",
      requisicion: "La requisición es para lo que sale. Aquí el problema es lo que llega y no se anota.",
    },
    porque: "El libro pide un informe de recepción, que se envía a contabilidad para registrar lo que llegó.",
  },
];

export const BOTON_H7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };
export const CORRECTO_H7 = "Correcto.";

export const resumenH7 = (bien, total) => `${bien} de ${total} al primer toque.`;
