/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · «EL RECORRIDO DE UN HECHO» — el contenido.
 *
 * La primera pieza del capítulo 1. Un solo hecho real —Caleja compra un
 * computador a crédito— recorre las cinco estaciones del Gráfico 1.1 (p. 6) y
 * cambia de forma en cada una, hasta llegar a la mesa de quien decide.
 *
 * ═══════════ ESTA PIEZA VA ANTES QUE EL TEMA 2 ═══════════
 *
 * Y eso manda sobre lo que puede dibujar. Aquí NO aparece el ▲ de
 * crecimiento, ni el marcador de saldo, ni los arcos de transacción, ni la
 * balanza, ni el teal y el ámbar significando debe y haber. Para este
 * estudiante ninguno de esos signos significa nada todavía: usarlos aquí los
 * gastaría antes de que lleguen a significar algo.
 *
 * El teal y el ámbar del marco del sitio —navegación, botones, encabezados—
 * se quedan como están. La restricción es sobre el contenido de la pieza.
 *
 * ═══════════ LAS CIFRAS NO ESTÁN AQUÍ ═══════════
 *
 * Ni el renglón del registro ni el balance del resumen llevan números
 * escritos en este archivo: salen de la transacción y del mayor de Caleja,
 * que son los mismos que usa el resto de la materia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID = "cu0-a1-recorrido-de-un-hecho";
export const TITULO = "El recorrido de un hecho";

export const OBJETIVO = "La contabilidad no termina en el registro: es un ciclo que arranca en la actividad de la empresa y vuelve a ella convertido en decisiones.";

/* ═══════════════════ CAPA 1 · PRIMERO, LOS NOMBRES ═══════════════════ */

export const NOMBRES = [
  {
    termino: "Contabilidad",
    definicion: "«un sistema de información integrado a la empresa, que permite identificar, clasificar, registrar, resumir, interpretar, analizar y evaluar, en términos monetarios, las operaciones y transacciones económicas de una empresa con miras a ofrecer información útil, veraz, oportuna y eficiente a todos los interesados (stakeholders)».",
  },
  {
    termino: "Objetivo de la contabilidad",
    definicion: "proporcionar información financiera a los usuarios internos y externos interesados en sus resultados operacionales y su situación.",
  },
  {
    termino: "Usuarios internos",
    definicion: "los propietarios, administradores y empleados.",
  },
  {
    termino: "Usuarios externos",
    definicion: "quienes usan la información financiera pero no tienen injerencia en la administración — clientes, proveedores, entidades financieras, el Estado.",
  },
];

/* Se planta desde la capa 1, para que el recorrido lo confirme después. */
export const SIEMBRA_DE_LOS_VERBOS = "Fíjate en la lista de verbos de la definición: identificar, clasificar, registrar, resumir, interpretar, analizar y evaluar. Registrar es uno de siete. Eso es lo que vas a ver funcionando.";

/* ═══════════════════ LAS CINCO ESTACIONES ═══════════════════ */

/*
 * El nombre corto va en el anillo; el rótulo es el del Gráfico 1.1 y se lee
 * entero cuando la estación se enciende. Los dos van escritos: nada de esta
 * pieza se comunica solo con color o solo con posición.
 */
export const ESTACIONES = [
  { n: 1, nombre: "La actividad de la empresa", rotulo: "La actividad de la empresa origina las operaciones administrativas", forma: "hecho" },
  { n: 2, nombre: "El reflejo documental", rotulo: "Las operaciones tienen un reflejo documental", forma: "factura" },
  { n: 3, nombre: "El registro contable", rotulo: "Los documentos son la base para los registros contables", forma: "renglon" },
  { n: 4, nombre: "El resumen de la situación", rotulo: "La contabilidad suministra resúmenes de la situación de la empresa", forma: "estado" },
  { n: 5, nombre: "El análisis orienta la decisión", rotulo: "El análisis de los datos orienta las decisiones de la administración", forma: "pregunta" },
];

/* ═══════════════════ CAPA 2 · LOS CINCO SEGMENTOS ═══════════════════ */

export const EL_HECHO = "Comercializadora Caleja compra un computador por $25.000. No lo paga: queda debiéndolo.";

/*
 * ═══════════ LA FACTURA, Y EL GUION QUE NO ES UN DESCUIDO ═══════════
 *
 * Solo tres campos salen del libro. Los otros tres el capítulo no los da, y
 * van con un guion: un guion dice «este dato no viene de la fuente», mientras
 * que un campo en blanco parece que la pieza se quedó a medio construir — y
 * rellenarlo con algo plausible sería inventarse la fuente.
 */
export const SIN_DATO = "—";
export const FACTURA = [
  { campo: "Número de factura", valor: SIN_DATO, delLibro: false },
  { campo: "Fecha", valor: SIN_DATO, delLibro: false },
  { campo: "Proveedor", valor: SIN_DATO, delLibro: false },
  { campo: "Concepto", valor: "Computador", delLibro: true },
  { campo: "Condición", valor: "A crédito", delLibro: true },
  /* El valor no se escribe aquí: lo pone la transacción del capítulo. */
  { campo: "Valor", valor: null, delLibro: true },
];

export const TEXTOS = {
  1: "Todo empieza afuera de la contabilidad. Alguien decidió comprar un computador, y eso pasó en el mundo real — no en un libro.",
  2: "Ese hecho dejó un papel. Sin el papel no hay nada que registrar — por eso el siguiente rótulo dice que los documentos son la base de los registros, y no al revés.",
  3: "Aquí es donde mucha gente cree que la contabilidad empieza y termina. Mira dónde estás: estación tres de cinco. Todavía falta más de lo que llevas.",
  4: "Ese registro se juntó con las otras cinco transacciones del mes y se volvió un resumen. Tu computador ya no aparece solo: es una línea dentro de la fotografía completa de la empresa.",
  5: "Y aquí está el punto de todo: el resumen llegó a la mesa de quien dirige la empresa. Esa pregunta no se responde con el computador — se responde con el resumen completo, y de la respuesta sale lo que la empresa va a hacer.",
};

export const CIERRE = "Fíjate en quién recibió el resumen: la administración, que es la que decide qué hace la empresa. Por eso el trazo vuelve al principio — esa decisión cambia la actividad, y la actividad nueva origina operaciones nuevas. El ciclo no termina: se muerde la cola.";

/* Qué cuenta del balance se resalta en la estación 4. */
export const CUENTA_RESALTADA = "Equipo de computación";

/* ═══════════════════ CAPA 3 · LOS OCHO USUARIOS ═══════════════════ */

/*
 * El propósito es TEXTUAL (pp. 11-12); la pregunta es reformulación de Gen.
 * Si alguna vez hay que recortar texto en pantalla, se recorta la pregunta —
 * nunca el propósito.
 *
 * `cierraElCiclo` no es una etiqueta más: marca al único usuario cuya decisión
 * cambia la actividad de la empresa, y es lo que enciende el trazo de retorno.
 */
export const USUARIOS = [
  {
    id: "propietarios", nombre: "Propietarios o accionistas", tipo: "interno", cierraElCiclo: false,
    proposito: "evaluar el rendimiento del capital sometido a riesgo y confiado a la administración",
    pregunta: "¿Cómo rindió el capital que puse en riesgo y confié a la administración?",
  },
  {
    id: "administradores", nombre: "Administradores", tipo: "interno", cierraElCiclo: true,
    proposito: "apoyo a sus funciones de planeación, control y toma de decisiones, y para evaluar su desempeño y encontrar fortalezas y debilidades",
    pregunta: "¿Dónde están nuestras fortalezas y nuestras debilidades, y qué hay que planear?",
  },
  {
    id: "empleados", nombre: "Empleados", tipo: "interno", cierraElCiclo: false,
    proposito: "conocer la situación económica de la empresa y fundamentar sus peticiones laborales ante los empleadores",
    pregunta: "¿Cómo está la empresa, para fundamentar lo que vamos a pedir?",
  },
  {
    id: "acreedores", nombre: "Acreedores y proveedores", tipo: "externo", cierraElCiclo: false,
    proposito: "conocer la capacidad de la empresa para responder por sus obligaciones a largo y corto plazo",
    pregunta: "¿Puede responder por sus obligaciones a corto y largo plazo?",
  },
  {
    id: "clientes", nombre: "Clientes", tipo: "externo", cierraElCiclo: false,
    proposito: "determinar la capacidad de la empresa para satisfacer sus necesidades actuales y potenciales, al igual que para comparar precios y buscar fuentes alternativas",
    pregunta: "¿Puede satisfacer lo que necesito, y cómo se comparan sus precios?",
  },
  {
    id: "inversionistas", nombre: "Inversionistas potenciales", tipo: "externo", cierraElCiclo: false,
    proposito: "evaluar la seguridad y rentabilidad de las inversiones potenciales que se pueden hacer en una determinada empresa",
    pregunta: "¿Qué tan segura y rentable sería una inversión aquí?",
  },
  {
    id: "asociaciones", nombre: "Asociaciones", tipo: "externo", cierraElCiclo: false,
    proposito: "recopilar información para estructurar estadísticas de los diferentes sectores",
    pregunta: "¿Qué dicen estos datos sobre el sector completo?",
  },
  {
    id: "estado", nombre: "El Estado y las autoridades fiscales", tipo: "externo", cierraElCiclo: false,
    proposito: "determinar el monto de los impuestos, realizar procesos de control y auditorías fiscales",
    pregunta: "¿Cuántos impuestos corresponden, y está todo en orden?",
  },
];

export const TEXTO_DEL_SELECTOR = "Los ocho miran el mismo resumen. Pero solo la decisión de la administración cambia lo que la empresa hace — por eso solo ahí se cierra el ciclo. Los demás deciden sobre lo suyo: prestar o no, comprar o no, invertir o no.";

export const VACIO_CAPA_3 = "Toca un usuario y mira qué le pregunta al mismo resumen.";

/* ═══════════════════ CAPA 4 · EN UNA FRASE ═══════════════════ */

export const PREGUNTA_FINAL = "Si tuvieras que explicarle a alguien qué hace la contabilidad, ¿cuál de estas frases es la correcta?";

/*
 * `escena` dice qué se enciende con cada devolución. No es decoración: es la
 * mitad del argumento — «el registro es la estación tres» se demuestra
 * encendiendo la tres y dejando las otras cuatro apagadas.
 */
export const OPCIONES = [
  {
    id: "op1",
    correcta: true,
    texto: "Convierte los hechos de la empresa en información que alguien usa para decidir.",
    feedback: "Correcto. Y hay algo más: quien decide es la administración, así que esa decisión cambia lo que la empresa hace después — y eso origina hechos nuevos. Por eso el registro es la estación tres de cinco, y por eso la definición del libro lista siete verbos: registrar es uno.",
    escena: { tipo: "anillo-completo" },
  },
  {
    id: "op2",
    correcta: false,
    texto: "Registra en libros las operaciones para dejar constancia de lo que ocurrió.",
    feedback: "Eso es una parte, y es la estación tres de cinco. Pero si la contabilidad terminara ahí, nadie usaría lo que produce. Después del registro vienen el resumen y la decisión — y esa decisión cambia la actividad que originó todo.",
    escena: { tipo: "una-estacion", estacion: 3, latenLasOtras: true },
  },
  {
    id: "op3",
    correcta: false,
    texto: "Calcula los impuestos que la empresa debe pagarle al Estado cada periodo.",
    feedback: "El Estado sí es uno de los usuarios y esa es su pregunta. Pero es uno de ocho: los dueños preguntan por el rendimiento, los acreedores por la capacidad de pago, la administración por dónde están las debilidades. El mismo resumen responde las ocho.",
    escena: { tipo: "ocho-usuarios", resaltar: "estado" },
  },
  {
    id: "op4",
    correcta: false,
    texto: "Guarda los documentos que respaldan lo que la empresa compra y vende.",
    feedback: "Los documentos son la estación dos, y son indispensables: sin ellos no hay nada que registrar. Pero guardarlos no es el trabajo — el trabajo es lo que pasa después, cuando esos documentos se vuelven registros, resúmenes y decisiones.",
    escena: { tipo: "una-estacion", estacion: 2, trazoAMedias: true },
  },
];

/* ═══════════════════ MOVIMIENTO REDUCIDO ═══════════════════ */

/*
 * Los textos alternativos van TAL CUAL los escribió la ficha. No se
 * reescriben ni se resumen: son la versión que lee quien no ve la animación,
 * y tienen que decir lo mismo que ella.
 */
export const ALTERNATIVOS = {
  1: "Cinco estaciones en anillo. La primera está encendida y contiene el hecho: Caleja compra un computador de 25.000 a crédito.",
  2: "La segunda estación se enciende y el hecho aparece ahora como una factura con fecha, concepto y valor.",
  3: "La tercera estación se enciende y la factura aparece ahora como un renglón de libro con dos cuentas y dos cifras. Quedan dos estaciones después.",
  4: "La cuarta estación se enciende y el renglón aparece ahora como una línea dentro de un estado financiero, rodeada de otras líneas.",
  5: "La quinta estación se enciende y el resumen aparece ahora como una pregunta sobre la mesa de la administración de Caleja: ¿dónde están nuestras fortalezas y debilidades, y qué hay que planear?",
  cierre: "Las cinco estaciones encendidas a la vez, cada una con su forma del mismo hecho, y un trazo que vuelve de la quinta a la primera cerrando el ciclo, porque la decisión de la administración cambia la actividad de la empresa.",
  capa3: "Ocho usuarios consultan el resumen. Al elegir Administradores se enciende además el trazo de retorno hacia la primera estación; con los otros siete el trazo permanece atenuado.",
};

/* ═══════════════════ TOKENS DE LA PIEZA ═══════════════════ */

/*
 * El neutro es el ÚNICO color con significado dentro del anillo. Medido
 * contra el fondo real de la pieza —#0E1B2E, no el navy de página— da 9,78:1,
 * y 7,65:1 en el punto más claro, bajo el halo de la materia. El umbral para
 * un elemento gráfico no textual es 3:1.
 */
export const NEUTRO = "#B8C4D4";
export const NAVY_DEL_CHIP = "#1D3557";

/* Rótulos de la interfaz. */
export const ROTULO_PIEZA = "EL CICLO CONTABLE · APRENDER";
export const BOTON_REPETIR = "Repetir";
export const BOTON_SIGUIENTE = "Siguiente";
export const BOTON_REVER = "Ver el recorrido otra vez";

/*
 * ═══════════════════ LA PIEZA, CON EL CONTRATO DE CuatroCapas ═══════════════════
 *
 * `pasos`, `pregunta` y `respuesta` no van: esta pieza trae su propia capa 2
 * y su propia capa 4, y `CuatroCapas` solo usa esos campos cuando no se las
 * pasan. La capa 1 sí sale de `nombres`, como en las demás piezas del sitio.
 */
export const PIEZA_RECORRIDO = {
  id: ID,
  titulo: TITULO,
  objetivo: OBJETIVO,
  nombres: [...NOMBRES, { termino: "Y fíjese en esto", definicion: SIEMBRA_DE_LOS_VERBOS }],
};

export const PIEZAS_INTRO = [PIEZA_RECORRIDO];
