import { LINEAS, FLECHAS, PRIMERO, SEGUNDO, FLUJOS } from "./contabilidadTema1.js";
import { PIEZA_RECORRIDO } from "./contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — las piezas 2, 3 y 4.
 *
 *   2  La Ecuación Contable      por qué los dos lados siempre dan igual
 *   3  La Foto y la Película     un momento contra un periodo
 *   4  Cómo se Articulan         las cinco flechas que convergen
 *
 * Las tres son material teórico: cero FP, sin dificultad y sin modalidad.
 *
 * ═══════════ EL VOCABULARIO PROHIBIDO ═══════════
 *
 * Ni el ▲, ni el marcador de saldo, ni los arcos, ni los anclajes, ni los
 * colectores, ni la balanza: son del Tema 2 y este estudiante no los ha visto.
 *
 * Y TAMPOCO EL ANILLO DE CINCO PUNTOS de la pieza 1. Ese ya significa «el
 * ciclo de la información»; reusarlo aquí para otra cosa lo vaciaría. Cada
 * pieza trae su propia figura: una torre, dos fotos con un tramo, tres
 * informes con flechas.
 *
 * Teal y ámbar se quedan en la interfaz de marca, nunca dentro del contenido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 2 · LA ECUACIÓN CONTABLE
 *
 * ═══════════ LA CONFUSIÓN QUE ATACA ═══════════
 *
 * Creer que si un lado sube el otro baja. Es falsa en los cuatro casos del
 * libro (p. 35): en todos, los dos lados se mueven hacia el mismo lado.
 *
 * Y la ataca por el dibujo, no por el texto: el estudiante no ve dos cosas que
 * se compensan, ve UNA SOLA TORRE que se lee dos veces. Por la izquierda dice
 * qué cosa es cada bloque; por la derecha, de dónde salió. Misma torre, misma
 * altura. Que los dos lados den igual deja de ser una regla que memorizar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID_P2 = "cu0-a2-la-ecuacion-contable";
export const TITULO_P2 = "La ecuación contable";
export const OBJETIVO_P2 = "Todo lo que la empresa tiene salió de algún lado. Por eso los dos lados siempre dan igual.";

/*
 * La cita del libro cuelga de «Los dos lados», que es la línea que define —es
 * el Gráfico 2.2, propiedades a la izquierda y participaciones a la derecha—.
 * Mismo patrón que la pieza 1, donde la cita de la definición cuelga de
 * «Contabilidad» y la siembra se queda al final sin cita.
 */
export const NOMBRES_P2 = [
  { termino: "Activo", definicion: "Activo es todo lo que la empresa tiene." },
  { termino: "Pasivo", definicion: "Pasivo es lo que la empresa le debe a otros." },
  { termino: "Patrimonio", definicion: "Patrimonio es la parte que les toca a los dueños." },
  {
    termino: "Ecuación contable",
    definicion: "Lo que tiene es igual a lo que debe más lo de los dueños. Esa es la ecuación contable.",
  },
  {
    termino: "Los dos lados",
    definicion: "El lado izquierdo dice qué cosas hay. El lado derecho dice de dónde salieron. A eso le vamos a decir los dos lados.",
    delLibro: "En el lado izquierdo de la ecuación figuran los recursos o propiedades que posee la empresa, y en el derecho, las participaciones constituidas por los acreedores, proveedores y propietarios.",
  },
];

export const ROTULO_SIEMBRA_P2 = "Y fíjate en esto";
export const SIEMBRA_P2 = "Fíjate en una cosa: son las mismas cosas contadas dos veces. Por eso nunca pueden dar distinto.";

/*
 * ═══════════ LA TORRE ═══════════
 *
 * Tres bloques, sin cifras. `izquierda` es lo que dice la primera lectura —qué
 * cosa es— y `tramo` la segunda —de dónde salió—. El primer bloque lo puso el
 * banco; los otros dos, los dueños. Eso parte la torre en dos tramos y no en
 * tres, que es justo lo que el Gráfico 2.2 dibuja.
 *
 * La torre es representación mía; los conceptos son textuales y no hay ni una
 * cifra en toda la pieza.
 */
export const DEL_BANCO = "del banco";
export const DE_LOS_DUENOS = "de los dueños";

export const BLOQUES = [
  { id: "b1", izquierda: "plata", tramo: DEL_BANCO },
  { id: "b2", izquierda: "computador", tramo: DE_LOS_DUENOS },
  { id: "b3", izquierda: "máquina", tramo: DE_LOS_DUENOS },
];

export const ROTULO_ACTIVO = "ACTIVO";
export const ROTULO_PASIVO_PATRIMONIO = "PASIVO + PATRIMONIO";

export const TEXTOS_P2 = {
  1: "Esta torre es todo lo que la empresa tiene. Plata, un computador, una máquina.",
  2: "Ahora léela por la izquierda. Cada bloque dice qué cosa es. Eso es el activo.",
  3: "Léela otra vez, pero por la derecha. Ahora cada tramo dice de dónde salió. Un pedazo lo puso el banco. El resto lo pusieron los dueños.",
  4: "Misma torre, misma altura. Una lectura dice qué hay. La otra dice de dónde salió. Por eso los dos lados dan igual: es lo mismo contado dos veces.",
  5: "Mira los cuatro casos. En todos, los dos lados se mueven para el mismo lado. Suben juntos o bajan juntos.",
};

/*
 * ── RAZONAMIENTO DE GEN, ANOTADO EN EL ENCARGO ──
 *
 * La p. 35 lista cuatro casos y ninguno es «quedan igual». Ese caso lo usa el
 * Tema 2 (ejemplo 3, cap. 3, p. 90), y el cierre lo nombra para que el
 * estudiante no llegue allá con una regla incompleta.
 */
/* El rótulo de la pantalla del cierre (antes escrito en `LaEcuacionContable.jsx`). */
export const ROTULO_CIERRE_P2 = "La regla";

export const CIERRE_P2 = "Nunca vas a ver que uno suba y el otro baje. O suben juntos, o bajan juntos, o se quedan los dos igual. Si ves otra cosa, algo está mal anotado.";

export const SUBEN = "suben";
export const BAJAN = "bajan";

/* Los cuatro casos del libro, p. 35, textuales. */
export const CASOS_P2 = [
  { id: "a", nombre: "Aumento en activo y en pasivo", mueve: SUBEN, lado: "pasivo" },
  { id: "b", nombre: "Aumento en activo y en patrimonio", mueve: SUBEN, lado: "patrimonio" },
  { id: "c", nombre: "Disminución en activo y en pasivo", mueve: BAJAN, lado: "pasivo" },
  { id: "d", nombre: "Disminución en activo y en patrimonio", mueve: BAJAN, lado: "patrimonio" },
];

/*
 * Corregida por Levi. Si aparece en pantalla va EXACTAMENTE así: nunca «una
 * subiendo y la otra bajando», que es la frase que la pieza entera desmiente.
 */
export const NOTA_CAPA3_P2 = "En el caso a suben las dos. En el c bajan las dos.";

export const PREGUNTA_P2 = "Elige la frase que mejor explica por qué los dos lados siempre dan igual.";

export const OPCIONES_P2 = [
  {
    id: "p2o1",
    correcta: true,
    texto: "Son las mismas cosas contadas dos veces: qué son y de dónde salieron.",
    feedback: "Correcto. La torre es una sola. Por la izquierda la lees por lo que es cada cosa. Por la derecha, por quién tiene derecho a ella. Es el mismo montón.",
    escena: { tipo: "torre-entera" },
  },
  {
    /* La confusión central, puesta a propósito de distractor. */
    id: "p2o2",
    correcta: false,
    texto: "Porque cuando un lado sube, el otro siempre baja.",
    feedback: "Eso es lo que más confunde, y es falso. Mira los cuatro casos otra vez: en todos, los dos lados suben juntos o bajan juntos.",
    escena: { tipo: "cuatro-casos" },
  },
  {
    id: "p2o3",
    correcta: false,
    texto: "Porque la empresa siempre debe lo mismo que tiene.",
    feedback: "No. Casi siempre debe menos de lo que tiene, y la diferencia es de los dueños. Si debiera todo, a los dueños no les quedaría nada.",
    escena: { tipo: "tramo-de-los-duenos" },
  },
  {
    id: "p2o4",
    correcta: false,
    texto: "Porque el contador ajusta las cifras hasta que den igual.",
    feedback: "No. Nadie ajusta nada. Dan igual solos, porque son las mismas cosas miradas de dos formas.",
    escena: { tipo: "torre-sola" },
  },
];

export const ALT_P2 = "Una torre de tres bloques. A la izquierda dice qué es cada uno: plata, computador, máquina. A la derecha dice de dónde salió: un tramo lo puso el banco y el resto los dueños. Las dos lecturas tienen la misma altura.";

export const ALTERNATIVOS_P2 = {
  1: "Una torre de tres bloques, todavía sin rótulos.",
  2: "La misma torre, ahora con los rótulos de la izquierda: plata, computador, máquina. Arriba dice activo.",
  3: "La misma torre con los rótulos de la derecha: un tramo del banco y el resto de los dueños. Arriba dice pasivo más patrimonio.",
  4: "La misma torre con los dos juegos de rótulos a la vez, y una línea que marca que las dos lecturas llegan a la misma altura.",
  5: "Los cuatro casos del libro, uno tras otro. En cada uno la torre crece o se encoge y los dos juegos de rótulos cambian juntos.",
  cierre: "La torre con sus dos lecturas, y la regla: los dos lados suben juntos, bajan juntos o se quedan los dos igual.",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · LA FOTO Y LA PELÍCULA
 *
 * ═══════════ EL LAYOUT ES VERTICAL, Y ES EL ÚNICO APROBADO ═══════════
 *
 * Foto del 1 de enero arriba, la banda del año en medio, foto del 31 de
 * diciembre abajo. Las dos fotos SIEMPRE del mismo tamaño: que una fuera más
 * grande diría que pesa más, y las dos son igual de reales en momentos
 * distintos.
 *
 * SIN PULSO en la banda, y sin reutilizar el patrón de la franja del anillo de
 * la pieza 1. La propuesta original lo pedía y quedó anulada: esa franja ya
 * significa otra cosa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID_P3 = "cu0-a3-la-foto-y-la-pelicula";
export const TITULO_P3 = "La foto y la película";
export const OBJETIVO_P3 = "Un informe es una foto de un día. El otro cuenta todo lo que pasó en el año.";

export const NOMBRES_P3 = [
  {
    termino: "Estado de situación financiera",
    definicion: "El estado de situación financiera muestra qué tiene y qué debe la empresa un día exacto.",
    delLibro: "El estado de situación financiera muestra de manera concreta la situación de la empresa en una fecha determinada.",
  },
  {
    termino: "Estado de resultados",
    definicion: "El estado de resultados muestra qué vendió y qué gastó durante todo un periodo.",
    delLibro: "muestra cómo se han generado los ingresos y cómo se han causado los gastos, así como la utilidad o pérdida resultante de las operaciones de la empresa durante un periodo de tiempo determinado.",
  },
  {
    termino: "La foto y la película",
    definicion: "Al primero le decimos la foto. Al segundo, la película.",
  },
  {
    termino: "Los otros estados",
    definicion: "Hay otros informes: el de cómo se movió la plata, el de cómo cambió lo de los dueños y las notas. Los vas a ver más adelante. En ese tramo hay otro informe más: el de por dónde se movió la plata. Lo vas a ver en la siguiente pieza.",
  },
];

export const ROTULO_SIEMBRA_P3 = "Y fíjate en esto";
export const SIEMBRA_P3 = "Fíjate en la diferencia: una foto es de un instante. Una película dura un rato.";

/* Las dos fotos. Sin cifras: lo que cambia entre ellas se dice con palabras. */
export const FOTOS = [
  {
    id: "enero",
    fecha: "1 de enero",
    cuando: "al comenzar el año",
    lineas: [
      { rotulo: "lo que tiene", texto: "la plata y las cosas con que arranca" },
      { rotulo: "lo que debe", texto: "lo que ya le debía al banco" },
    ],
  },
  {
    id: "diciembre",
    fecha: "31 de diciembre",
    cuando: "al terminar el año",
    lineas: [
      { rotulo: "lo que tiene", texto: "la plata y las cosas con que queda" },
      { rotulo: "lo que debe", texto: "lo que le quedó debiendo" },
    ],
  },
];

export const ROTULO_BANDA = "lo que vendió y lo que gastó durante el año";
export const RANGO_BANDA = "1 ene – 31 dic";
export const ROTULO_AMPLIAR = "Ver más grande";

export const TEXTOS_P3 = {
  1: "Aquí está la línea del tiempo. Un año entero de la empresa.",
  2: "El 1 de enero se toma una foto. Muestra qué tenía y qué debía ese día.",
  3: "El 31 de diciembre se toma otra foto. Muestra cómo quedó.",
  4: "Entre las dos fotos pasó todo el año. Eso es lo que cuenta el otro informe: qué vendió y qué gastó en ese tramo.",
};

/* El rótulo de la pantalla del cierre (antes escrito en `LaFotoYLaPelicula.jsx`). */
export const ROTULO_CIERRE_P3 = "Las dos fotos y el tramo";

export const CIERRE_P3 = "Las dos fotos son del mismo tipo de informe, en dos días distintos. Lo que va en medio explica por qué la segunda no se parece a la primera.";

export const CONSIGNA_P3 = "Lee la pregunta. Toca el informe que la responde.";

export const FOTO = "foto";
export const PELICULA = "pelicula";
export const COMPARAR = "comparar";

export const RESPUESTAS_P3 = [
  { id: FOTO, texto: "La foto" },
  { id: PELICULA, texto: "La película" },
  { id: COMPARAR, texto: "Hay que comparar las dos fotos" },
];

/*
 * `foto` dice CUÁL de las dos responde, y solo lo llevan las que se contestan
 * con una sola. Va escrito y no deducido del texto de la pregunta: «ese día»
 * no se puede leer con una regla, y una escena que resaltara la foto
 * equivocada señalaría un informe que no responde nada.
 */
export const PREGUNTAS_P3 = [
  { id: "q1", texto: "¿Cuánta plata tenía la empresa el 31 de diciembre?", respuesta: FOTO, foto: "diciembre" },
  { id: "q2", texto: "¿Cuánto vendió durante el año?", respuesta: PELICULA, foto: null },
  { id: "q3", texto: "¿Cuánto le debía al banco ese día?", respuesta: FOTO, foto: "diciembre" },
  { id: "q4", texto: "¿Cuánto gastó en sueldos en el año?", respuesta: PELICULA, foto: null },
  { id: "q5", texto: "¿Cuánto creció lo que la empresa tiene entre enero y diciembre?", respuesta: COMPARAR, foto: null },
];

/*
 * ═══════════ LA C SE PARTE EN DOS ═══════════
 *
 * «Marcó comparar» no es el mismo error si la buena era la foto que si era la
 * película: en un caso sobra la segunda foto, en el otro sobran las dos. Una
 * sola explicación para los dos casos diría media verdad en uno de ellos.
 */
export const ERROR_P3 = {
  A: { texto: "Esa pregunta es de un día exacto. La película cubre todo el año, así que no te dice cómo estaba la empresa ese día.", escena: "una-foto" },
  B: { texto: "Esa pregunta es de todo el año. Una foto es de un día: no te cuenta qué pasó en los meses.", escena: "banda" },
  C1: { texto: "Con una foto basta. Comparar las dos sirve para saber cuánto cambió, y aquí no te preguntan por el cambio.", escena: "una-foto" },
  C2: { texto: "Con la película basta. Te preguntan por lo que pasó en el año, no por cuánto cambió entre dos fechas.", escena: "banda" },
  D: { texto: "Te preguntan por el cambio entre dos fechas. Una sola foto te dice cómo estaba un día. Para el cambio necesitas las dos.", escena: "dos-fotos" },
};

export const PREGUNTA_P3 = "Elige la frase que mejor dice en qué se diferencian los dos informes.";

export const OPCIONES_P3 = [
  {
    id: "p3o1",
    correcta: true,
    texto: "Uno muestra un solo día. El otro muestra todo un periodo.",
    feedback: "Correcto. Por eso uno se llama foto y el otro película. Y por eso hacen falta los dos: uno dice cómo está, el otro dice qué pasó.",
    escena: { tipo: "todo-con-tiempos" },
  },
  {
    id: "p3o2",
    correcta: false,
    texto: "Uno tiene cifras y el otro no.",
    feedback: "No. Los dos tienen cifras. Lo que cambia es el tiempo que cubre cada uno.",
    escena: { tipo: "las-dos-con-cifras" },
  },
  {
    id: "p3o3",
    correcta: false,
    texto: "Uno es para los de adentro y el otro para los de afuera.",
    feedback: "No. Los ocho pueden leer los dos. Lo que cambia es qué te dice cada uno.",
    escena: { tipo: "ocho-leyendo" },
  },
  {
    id: "p3o4",
    correcta: false,
    texto: "Uno lo hace la empresa y el otro el Estado.",
    feedback: "No. Los dos los hace la empresa. El Estado es uno de los que los lee.",
    escena: { tipo: "estado-lee" },
  },
];

/*
 * El alternativo final de Gen: usa anclajes TEMPORALES y no espaciales, así
 * que sobrevive si el layout vuelve a cambiar. Reemplaza al que yo había
 * adaptado cambiando izquierda por arriba y derecha por abajo.
 */
export const ALT_P3 = "Una línea de tiempo vertical. Al comenzar el año, una foto del 1 de enero con lo que la empresa tenía y debía. Al terminar el año, otra foto del 31 de diciembre. Entre las dos fotos, un tramo con el informe de lo que vendió y gastó.";

export const ALTERNATIVOS_P3 = {
  1: "La línea de tiempo vacía, con sus dos marcas: al comenzar el año y al terminar el año.",
  2: "Al comenzar el año se toma la foto del 1 de enero: lo que la empresa tenía y lo que debía ese día.",
  3: "Al terminar el año se toma la foto del 31 de diciembre, con un contenido distinto.",
  4: "El tramo entre las dos fotos se llena de extremo a extremo: es el informe de lo que vendió y gastó durante el año.",
  cierre: "Las dos fotos resaltadas a la vez, del mismo tamaño, con el tramo lleno entre ellas.",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CÓMO SE ARTICULAN
 *
 * ═══════════ CERO CIFRAS ═══════════
 *
 * El Gráfico 2.6 escribe «xxxxx» en todas sus líneas: no trae un solo número.
 * La pieza enseña SOLO los nombres de las líneas. Ni la ficha que viaja ni los
 * extremos que se encienden llevan valor. Si algo lleva cifra, está inventada.
 *
 * ═══════════ LAS LÍNEAS Y LAS FLECHAS SON LAS DE T1-7 ═══════════
 *
 * Mismo gráfico, mismas cinco conexiones. Se importan en vez de copiarse: dos
 * listas del mismo dibujo se separan en el primer retoque, y entonces la pieza
 * que enseña y la actividad que evalúa dirían cosas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID_P4 = "cu0-a4-como-se-articulan";
export const TITULO_P4 = "Cómo se articulan";
export const OBJETIVO_P4 = "Los tres informes se pasan cifras. Y todas las flechas llegan al mismo.";

export const NOMBRES_P4 = [
  {
    termino: "Estado de flujos de efectivo",
    definicion: "El estado de flujos de efectivo muestra de dónde entró y a dónde se fue la plata.",
    delLibro: "un estado financiero básico que muestra el efectivo generado y utilizado en las actividades de operación, inversión y financiación.",
  },
  {
    termino: "Los tres motivos",
    definicion: "La plata se mueve por tres motivos: el día a día, comprar o vender cosas grandes, y conseguir o devolver dinero.",
  },
  {
    termino: "Articulación",
    definicion: "A veces un informe repite una cifra de otro. A veces solo la explica. A eso le decimos que se articulan.",
  },
];

export const ROTULO_SIEMBRA_P4 = "Y fíjate en esto";
export const SIEMBRA_P4 = "Fíjate hacia dónde apuntan las flechas. Todas van para el mismo lado.";

/* Los tres informes de la pieza, con el nombre corto que usa su prosa. */
export const INFORMES_P4 = [
  { id: PRIMERO, nombre: "Lo que la empresa tiene y debe", corto: "la foto" },
  { id: SEGUNDO, nombre: "Lo que vendió y lo que gastó", corto: "la película" },
  { id: FLUJOS, nombre: "De dónde entró y salió la plata", corto: "la plata" },
];

/*
 * ═══════════ DOS ANIMACIONES, NO UNA ═══════════
 *
 * Solo UNA de las cinco repite la misma cifra: el saldo final de efectivo, que
 * aparece igual en la foto. Las otras cuatro no repiten nada — explican una
 * línea. Una sola animación para las dos cosas afirmaría algo falso en cuatro
 * de los cinco casos.
 *
 * `viaja` marca la única que viaja. `deBloque` marca la que el gráfico dibuja
 * de bloque a bloque y no como línea suelta.
 */
export const VIAJA = "la misma cifra";
export const EXPLICA = "explica esta línea";

export const MODO_FLECHA = {
  f1: { viaja: false, deBloque: true },
  f2: { viaja: true, deBloque: false },
  f3: { viaja: false, deBloque: false },
  f4: { viaja: false, deBloque: false },
  f5: { viaja: false, deBloque: false },
};

export const LINEAS_P4 = LINEAS;
export const FLECHAS_P4 = FLECHAS;

export const TEXTOS_P4 = {
  1: "Aquí están los tres informes. Todavía no hay ninguna flecha.",
  2: "Primera flecha. Lo que la empresa vendió y gastó llega a la foto y cambia cómo queda.",
  3: "Segunda flecha. La plata que queda al final es la misma que aparece en la foto.",
  4: "Tres flechas más. Cada motivo por el que se movió la plata explica una línea de la foto.",
};

/* El rótulo de la pantalla del cierre (antes escrito en `ComoSeArticulan.jsx`). */
export const ROTULO_CIERRE_P4 = "Las cinco a la vez";

export const CIERRE_P4 = "Cuenta las flechas: son cinco y todas llegan a la foto. Los otros dos cuentan qué pasó en el año. La foto guarda cómo quedó la empresa.";

export const CONSIGNA_P4 = "Toca una flecha y mira qué línea explica a cuál.";

export const PREGUNTA_P4 = "Elige la frase que mejor dice cómo se relacionan los tres informes.";

export const OPCIONES_P4 = [
  {
    id: "p4o1",
    correcta: true,
    texto: "Dos cuentan qué pasó en el año y le pasan sus cifras al tercero.",
    feedback: "Correcto. Por eso ninguna flecha sale de la foto: ella recibe. Los otros dos explican, ella guarda el resultado.",
    escena: { tipo: "cinco-en-secuencia" },
  },
  {
    id: "p4o2",
    correcta: false,
    texto: "El de la foto se hace primero y de ahí salen los otros dos.",
    feedback: "Al revés. La foto del final necesita lo que los otros calculan. La que va primero es la foto del comienzo, que es otra.",
    escena: { tipo: "linea-de-tiempo" },
  },
  {
    id: "p4o3",
    correcta: false,
    texto: "Cada uno se hace aparte y no tiene que ver con los otros.",
    feedback: "No. Si fuera así no habría ninguna flecha. Y hay cinco, todas llegando al mismo informe.",
    escena: { tipo: "cinco-de-golpe" },
  },
  {
    id: "p4o4",
    correcta: false,
    texto: "Los tres dicen lo mismo con palabras distintas.",
    feedback: "No. Cada uno dice algo distinto. Uno qué tiene, otro qué vendió y gastó, otro por dónde se movió la plata.",
    escena: { tipo: "tres-encabezados" },
  },
];

export const ALT_P4 = "Tres informes. Cinco flechas llegan al informe de lo que la empresa tiene y debe. Una viene del informe de lo que vendió y gastó. Las otras cuatro vienen del informe de la plata. Ninguna flecha sale de él.";

export const ALTERNATIVOS_P4 = {
  1: "Los tres informes, todavía sin ninguna flecha entre ellos.",
  2: "Una flecha va del informe de lo que vendió y gastó, entero, al informe de lo que la empresa tiene y debe.",
  3: "Una segunda flecha va del saldo final de efectivo a la línea de efectivo de la foto: es la misma cifra.",
  4: "Tres flechas más salen del informe de la plata hacia tres líneas de la foto, una por cada motivo.",
  cierre: "Las cinco flechas dibujadas a la vez, todas llegando al informe de lo que la empresa tiene y debe.",
};

/* ═══════════════════ LAS TRES, EN ORDEN ═══════════════════ */

export const PIEZA_2 = {
  id: ID_P2,
  titulo: TITULO_P2,
  objetivo: OBJETIVO_P2,
  nombres: [...NOMBRES_P2, { termino: ROTULO_SIEMBRA_P2, definicion: SIEMBRA_P2 }],
};

export const PIEZA_3 = {
  id: ID_P3,
  titulo: TITULO_P3,
  objetivo: OBJETIVO_P3,
  nombres: [...NOMBRES_P3, { termino: ROTULO_SIEMBRA_P3, definicion: SIEMBRA_P3 }],
};

export const PIEZA_4 = {
  id: ID_P4,
  titulo: TITULO_P4,
  objetivo: OBJETIVO_P4,
  nombres: [...NOMBRES_P4, { termino: ROTULO_SIEMBRA_P4, definicion: SIEMBRA_P4 }],
};

/*
 * ═══════════ LAS CUATRO, EN ORDEN, Y LA LISTA VIVE AQUÍ ═══════════
 *
 * No en `contabilidadIntro.js`. Aquel archivo tiene los usuarios que
 * `contabilidadTema1.js` importa, y este importa aquel a través de ahí: armar
 * la lista allá cerraría el círculo, y un ciclo de módulos no falla al cargar
 * —deja una constante sin definir a mitad de la evaluación, que se nota mucho
 * más tarde y en otro sitio—.
 */
export const PIEZAS_INTRO = [PIEZA_RECORRIDO, PIEZA_2, PIEZA_3, PIEZA_4];
