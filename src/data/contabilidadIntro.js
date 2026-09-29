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

export const OBJETIVO = "Anotar es solo un paso. Vas a ver los cinco que hay. El último vuelve al primero.";

/* ═══════════════════ CAPA 1 · PRIMERO, LOS NOMBRES ═══════════════════ */

/*
 * ═══════════ LA IDEA SIMPLE PRIMERO, EL LIBRO DEBAJO ═══════════
 *
 * `definicion` es la idea en palabras de todos los días, y es la que abre cada
 * línea. `delLibro` es la cita textual, y va DEBAJO, rotulada «Así lo dice el
 * libro». Nunca al contrario: la frase del libro tiene siete verbos y tres
 * subordinadas, y abriendo con ella la pantalla, el estudiante que no la
 * entiende ya no llega a la línea que sí entendería.
 *
 * Solo la primera línea lleva cita. De las cuatro definiciones textuales que
 * había, esta es la única que se conserva como texto del libro; las otras tres
 * se dicen ahora con la idea simple y nada más.
 *
 * `delLibro` es opcional, así que las otras cuatro piezas de Aprender del
 * sitio —que solo traen `termino` y `definicion`— no cambian ni un pixel.
 *
 * El rótulo «Así lo dice el libro» no está aquí: lo pone `CuatroCapas`, que es
 * quien pinta la capa 1 de todas las piezas del sitio.
 */
export const NOMBRES = [
  {
    termino: "Contabilidad",
    definicion: "La contabilidad anota lo que pasa en una empresa. Con esas notas arma informes. Alguien los lee y decide.",
    delLibro: "un sistema de información integrado a la empresa, que permite identificar, clasificar, registrar, resumir, interpretar, analizar y evaluar, en términos monetarios, las operaciones y transacciones económicas de una empresa con miras a ofrecer información útil, veraz, oportuna y eficiente a todos los interesados (stakeholders).",
  },
  {
    termino: "Objetivo de la contabilidad",
    definicion: "Sirve para que la gente sepa cómo va la empresa. Unos son parte de ella. Otros la miran desde afuera.",
  },
  {
    termino: "Usuarios internos",
    definicion: "Los de adentro son los dueños, los jefes y los empleados.",
  },
  {
    termino: "Usuarios externos",
    definicion: "Los de afuera no son parte de la empresa: la miran desde afuera y leen sus informes.",
  },
];

/*
 * Se planta desde la capa 1, para que el recorrido lo confirme después. Manda
 * contar los verbos de la frase del libro, así que esa frase TIENE que estar en
 * pantalla cuando se lee esta línea: las dos van juntas en la capa 1, y hay una
 * prueba que lo comprueba.
 */
export const ROTULO_SIEMBRA = "Y fíjate en esto";
export const SIEMBRA_DE_LOS_VERBOS = "Cuenta los verbos de la frase del libro. Son siete. Anotar es uno solo.";

/* ═══════════════════ LAS CINCO ESTACIONES ═══════════════════ */

/*
 * ═══════════ EL RÓTULO SIMPLE ES EL QUE SE LEE ═══════════
 *
 * `nombre` es lo que dice cada estación en pantalla, en todos los sitios donde
 * aparece el anillo: la columna de esta pieza, T1-1 y T1-8. Son los rótulos
 * simples del apéndice de Levi, y reemplazan en pantalla al texto largo del
 * Gráfico 1.1.
 *
 * `delGrafico` es ese texto largo, textual del libro (p. 6). Se queda aquí
 * como fuente del ciclo, pero NO se pinta: una prueba lo vigila.
 *
 * Nada de esta pieza se comunica solo con color o solo con posición: cada
 * estación lleva su número y su rótulo escritos.
 */
export const ESTACIONES = [
  { n: 1, nombre: "Pasa algo en la empresa", delGrafico: "La actividad de la empresa origina las operaciones administrativas", forma: "hecho" },
  { n: 2, nombre: "Queda un papel", delGrafico: "Las operaciones tienen un reflejo documental", forma: "factura" },
  { n: 3, nombre: "Se anota", delGrafico: "Los documentos son la base para los registros contables", forma: "renglon" },
  { n: 4, nombre: "Sale un informe", delGrafico: "La contabilidad suministra resúmenes de la situación de la empresa", forma: "estado" },
  { n: 5, nombre: "Los jefes deciden", delGrafico: "El análisis de los datos orienta las decisiones de la administración", forma: "pregunta" },
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
  1: "Todo empieza afuera de los libros. Alguien compró un computador. Eso pasó de verdad.",
  2: "Ese hecho dejó un papel. Sin papel no hay nada que anotar. Primero el papel, después la nota.",
  3: "Mucha gente cree que aquí empieza y termina todo. Mira dónde vas: punto tres de cinco. Falta más de lo que llevas.",
  4: "Esa nota se juntó con las demás y salió un informe. Tu computador ya no está solo. Ahora es una línea entre muchas.",
  5: "El informe llegó a la mesa de los jefes. Esa pregunta no se contesta con el computador. Se contesta con todo el informe.",
};

export const CIERRE = "Mira quién recibió el informe. Fueron los jefes, y ellos deciden qué hace la empresa. Por eso la flecha vuelve al comienzo.";

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
    pregunta: "Puse plata en esta empresa. ¿Cuánto me está dejando?",
  },
  {
    id: "administradores", nombre: "Administradores", tipo: "interno", cierraElCiclo: true,
    proposito: "apoyo a sus funciones de planeación, control y toma de decisiones, y para evaluar su desempeño y encontrar fortalezas y debilidades",
    pregunta: "¿En qué vamos bien y en qué vamos mal? ¿Qué hacemos ahora?",
  },
  {
    id: "empleados", nombre: "Empleados", tipo: "interno", cierraElCiclo: false,
    proposito: "conocer la situación económica de la empresa y fundamentar sus peticiones laborales ante los empleadores",
    pregunta: "¿Cómo le va a la empresa? Quiero saberlo antes de pedir algo.",
  },
  {
    id: "acreedores", nombre: "Acreedores y proveedores", tipo: "externo", cierraElCiclo: false,
    proposito: "conocer la capacidad de la empresa para responder por sus obligaciones a largo y corto plazo",
    pregunta: "Le presté o le vendí a crédito. ¿Me va a poder pagar?",
  },
  {
    id: "clientes", nombre: "Clientes", tipo: "externo", cierraElCiclo: false,
    proposito: "determinar la capacidad de la empresa para satisfacer sus necesidades actuales y potenciales, al igual que para comparar precios y buscar fuentes alternativas",
    pregunta: "¿Me va a poder cumplir? ¿Cobra caro o barato?",
  },
  {
    id: "inversionistas", nombre: "Inversionistas potenciales", tipo: "externo", cierraElCiclo: false,
    proposito: "evaluar la seguridad y rentabilidad de las inversiones potenciales que se pueden hacer en una determinada empresa",
    pregunta: "¿Me conviene meter plata aquí? ¿Es riesgoso?",
  },
  {
    id: "asociaciones", nombre: "Asociaciones", tipo: "externo", cierraElCiclo: false,
    proposito: "recopilar información para estructurar estadísticas de los diferentes sectores",
    pregunta: "¿Qué dicen estos números sobre las empresas de este tipo?",
  },
  {
    id: "estado", nombre: "El Estado y las autoridades fiscales", tipo: "externo", cierraElCiclo: false,
    proposito: "determinar el monto de los impuestos, realizar procesos de control y auditorías fiscales",
    pregunta: "¿Cuánto tiene que pagar de impuestos? ¿Está todo en orden?",
  },
];

export const TEXTO_DEL_SELECTOR = "Los ocho leen el mismo informe. Pero solo los jefes cambian lo que la empresa hace.";

export const VACIO_CAPA_3 = "Toca a cada persona. Mira qué le pregunta al mismo informe.";

/* ═══════════════════ CAPA 4 · EN UNA FRASE ═══════════════════ */

export const PREGUNTA_FINAL = "Elige la frase que mejor dice qué hace la contabilidad.";

/*
 * `escena` dice qué se enciende con cada devolución. No es decoración: es la
 * mitad del argumento — «el registro es la estación tres» se demuestra
 * encendiendo la tres y dejando las otras cuatro apagadas.
 */
export const OPCIONES = [
  {
    id: "op1",
    correcta: true,
    texto: "Vuelve informe lo que pasa en la empresa, y alguien decide con él.",
    feedback: "Correcto. Y hay algo más: los que deciden son los jefes, y eso cambia lo que la empresa hace. Así nacen hechos nuevos. Por eso anotar es el punto tres de cinco.",
    escena: { tipo: "anillo-completo" },
  },
  {
    id: "op2",
    correcta: false,
    texto: "Anota en libros lo que pasó, para que quede escrito.",
    feedback: "Eso es una parte, y es el punto tres de cinco. Si todo terminara ahí, nadie usaría lo que sale. Después vienen el informe y la decisión. Y esa decisión cambia lo que la empresa hace.",
    escena: { tipo: "una-estacion", estacion: 3, latenLasOtras: true },
  },
  {
    id: "op3",
    correcta: false,
    texto: "Saca la cuenta de los impuestos que hay que pagar.",
    feedback: "El Estado sí pregunta eso. Pero es uno de ocho. Los dueños preguntan cuánto les deja. Los que prestaron, si les van a pagar. Los jefes, en qué van mal. El mismo informe responde las ocho.",
    escena: { tipo: "ocho-usuarios", resaltar: "estado" },
  },
  {
    id: "op4",
    correcta: false,
    texto: "Guarda los papeles de lo que la empresa compra y vende.",
    feedback: "Los papeles son el punto dos, y hacen falta: sin ellos no hay nada que anotar. Pero guardarlos no es el trabajo. El trabajo es lo que pasa después.",
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
  1: "Cinco puntos en círculo. El primero está prendido. Dice que la empresa compró un computador de 25.000 a crédito.",
  2: "Se prende el segundo punto. El hecho ahora es una factura, con el concepto y el valor.",
  3: "Se prende el tercer punto. La factura ahora es un renglón de libro, con dos nombres y dos cifras. Faltan dos puntos.",
  4: "Se prende el cuarto punto. El renglón ahora es una línea dentro de un informe, entre muchas otras líneas.",
  5: "Se prende el quinto punto. El informe ahora es una pregunta sobre la mesa de Administradores: ¿en qué vamos bien y en qué vamos mal?",
  cierre: "Los cinco puntos prendidos a la vez. Cada uno tiene una forma distinta del mismo hecho. Una flecha vuelve del quinto al primero.",
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
  nombres: [...NOMBRES, { termino: ROTULO_SIEMBRA, definicion: SIEMBRA_DE_LOS_VERBOS }],
};

/*
 * ═══════════ LA LISTA DE LAS CUATRO PIEZAS NO VIVE AQUÍ ═══════════
 *
 * Está en `contabilidadPiezas234.js`, que es quien conoce a las cuatro. Armarla
 * aquí obligaría a este archivo a importar aquel, y aquel ya importa —a través
 * de `contabilidadTema1.js`— los usuarios de ESTE. El ciclo no da error al
 * cargar: da `USUARIOS` sin definir a mitad de la evaluación, que es peor.
 */
