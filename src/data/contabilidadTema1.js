import { USUARIOS } from "./contabilidadIntro.js";
import { CALEJA, ACTIVO, PASIVO, PATRIMONIO } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · LAS ACTIVIDADES — el contenido.
 *
 * El capítulo 1 y el 2. Este archivo lo abren T1-1 y T1-2, que son las dos que
 * se pueden publicar ya: dependen solo de la pieza 1 de Aprender, que existe.
 *
 * ═══════════ EL VOCABULARIO DEL TEMA 2 NO ENTRA AQUÍ ═══════════
 *
 * Ni el ▲, ni el marcador de saldo, ni los arcos, ni los anclajes, ni los
 * colectores, ni la balanza. El estudiante que juega esto todavía no ha visto
 * ninguno: usarlos aquí los gastaría antes de que signifiquen algo. Y teal y
 * ámbar se quedan en la interfaz de marca, nunca dentro del contenido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ T1-1 · ¿DESDE DÓNDE PREGUNTAN? ═══════════════════ */

export const T1_1 = {
  id: "t1-desde-donde-preguntan",
  nombre: "¿Desde Dónde Preguntan?",
  subtema: "Usuarios de la información contable",
  dificultad: "facil",
  fpBase: 10,
  porPartida: 6,
  objetivo: "Decide si quien pregunta es parte de la empresa o la mira desde afuera.",
  /*
   * La consigna dice qué hacer con los dedos, y se queda fija debajo del
   * objetivo durante toda la partida. El «vacío» es otra cosa: es la pregunta
   * que encabeza la elección y desaparece cuando ya se eligió. Una no
   * reemplaza a la otra.
   */
  consigna: "Toca la pregunta. Luego toca si esa persona está adentro o afuera de la empresa.",
  pregunta: "¿Quién pregunta esto es parte de la empresa o no?",
};

/*
 * ═══════════ DOS SEÑALES QUE NO SON LA MISMA ═══════════
 *
 * `dentro` dice si ese usuario PERTENECE a la empresa, que es el criterio del
 * libro (p. 6): internos son los propietarios, los administradores y los
 * empleados; externos «no tienen ninguna injerencia en la administración».
 *
 * `cierraElCiclo` dice otra cosa: si su decisión cambia la actividad. Solo la
 * administración. Un propietario está DENTRO y NO cierra el ciclo — y esa
 * diferencia es justo lo que esta actividad enseña, así que las dos banderas
 * viven separadas y nunca se deducen una de la otra.
 *
 * `dentro` se deduce del tipo que ya declara la pieza 1, para que no haya dos
 * listas de usuarios internos que puedan separarse.
 */
export const ZONA_DENTRO = "dentro";
export const ZONA_FUERA = "fuera";

export const USUARIOS_T1_1 = USUARIOS.map((u) => ({
  ...u,
  zona: u.tipo === "interno" ? ZONA_DENTRO : ZONA_FUERA,
}));

/*
 * Los rótulos solo marcan el lugar. El «de la empresa» que llevaba el primero
 * salió de aquí porque esa idea ya está dicha dos veces —en la consigna y en el
 * vacío—, y en un rótulo de 9,5 px repetirla solo gastaba ancho.
 */
export const ROTULO_ZONA = {
  [ZONA_DENTRO]: "ADENTRO",
  [ZONA_FUERA]: "AFUERA",
};

/*
 * Las ocho devoluciones de acierto, una por usuario y todas de la ficha.
 *
 * No hay texto de respaldo para la zona: antes había uno general para los
 * externos que a mí me tocó redactar, y ya no hace falta. Si algún día falta la
 * de un usuario, `evaluarT1_1` se cae en vez de servir un genérico — una
 * devolución de repuesto se lee igual de bien que la buena y no se nota que
 * falta la buena.
 */
export const ACIERTO_T1_1 = {
  propietarios: "✅ Adentro. Los dueños son parte de la empresa. Pero la flecha no se prendió: el día a día lo manejan los jefes.",
  administradores: "✅ Adentro. Y mira la flecha que se prendió: los jefes deciden, y eso cambia lo que la empresa hace.",
  empleados: "✅ Adentro. Los empleados son parte de la empresa, aunque no manden ni sean dueños.",
  acreedores: "✅ Afuera. Le prestó o le vendió a crédito, pero no es parte de la empresa.",
  clientes: "✅ Afuera. Le compra a la empresa, pero no es parte de ella.",
  inversionistas: "✅ Afuera. Todavía no ha puesto nada. Está mirando si le conviene.",
  asociaciones: "✅ Afuera. Juntan números de muchas empresas para sacar cuentas del grupo.",
  estado: "✅ Afuera. Tiene poder sobre la empresa, pero no es parte de ella. Lee el informe como los demás de afuera.",
};

export const ERROR_T1_1 = {
  /* A · un interno colocado afuera. */
  A: {
    texto: "❌ Esa persona sí es parte de la empresa. Los de adentro son tres: dueños, jefes y empleados. No importa si trabajan ahí todos los días. Importa si son parte.",
    escena: "los-tres-internos",
  },
  /* B · un externo colocado adentro. */
  B: {
    texto: "❌ Esa persona no es parte de la empresa: la mira desde afuera. Lee el informe y lo usa para algo suyo.",
    escena: "zona-exterior",
    rotulo: "consultan desde afuera",
  },
};

/* El rótulo que acompaña al trazo cuando se enciende. */
export const ROTULO_DEL_TRAZO = "esta decisión cambia lo que la empresa hace";

export const ALT_T1_1 = "Anillo de cinco estaciones. La pregunta sobre fortalezas y debilidades queda dentro del anillo, con la etiqueta Administradores, y el trazo de retorno hacia la primera estación se enciende.";

/* ═══════════════════ T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ? ═══════════════════ */

export const T1_2 = {
  id: "t1-que-entro-y-que-salio",
  nombre: "¿Qué Entró y Qué Salió?",
  subtema: "Clasificación de las empresas según su actividad",
  dificultad: "facil",
  fpBase: 10,
  porPartida: 6,
  objetivo: "Descubre qué hace cada empresa, mirando qué recibe y qué entrega.",
  consigna: "Mira qué entra y qué sale. Luego toca qué clase de empresa es.",
  pregunta: "¿Qué le pasó adentro a lo que entró?",
};

export const CLASES = [
  { id: "comercial", nombre: "Comercial" },
  { id: "industrial", nombre: "Industrial o de manufactura" },
  { id: "servicios", nombre: "De servicios" },
  { id: "agropecuaria", nombre: "Agropecuaria" },
  { id: "minera", nombre: "Minera" },
];

/*
 * ═══════════ EL RECUADRO «ENTRA» NUNCA VA VACÍO ═══════════
 *
 * Cuando la empresa no recibe nada físico, dice «sin insumo físico» con todas
 * sus letras. Un recuadro en blanco se lee como un error de carga, y además
 * esa frase ES la pista de las de servicios y las mineras: que no haya objeto
 * de entrada es el dato, no su ausencia.
 */
export const SIN_INSUMO = "sin insumo físico";

export const EMPRESAS = [
  { id: "t2-01", empresa: "Una textilera", entra: "Algodón", sale: "Tela", clase: "industrial", relacion: "Transformado" },
  { id: "t2-02", empresa: "Un supermercado", entra: "Mercancías del proveedor", sale: "Las mismas mercancías", clase: "comercial", relacion: "Lo mismo" },
  { id: "t2-03", empresa: "Un banco", entra: SIN_INSUMO, sale: "Servicio financiero", clase: "servicios", relacion: "No hay objeto" },
  { id: "t2-04", empresa: "Una azucarera", entra: "Caña", sale: "Azúcar", clase: "industrial", relacion: "Transformado" },
  { id: "t2-05", empresa: "Una agencia de turismo", entra: SIN_INSUMO, sale: "Servicio de viaje", clase: "servicios", relacion: "No hay objeto" },
  { id: "t2-06", empresa: "Una finca ganadera", entra: "Terneros y pasto", sale: "Ganado y leche", clase: "agropecuaria", relacion: "Criado" },
  { id: "t2-07", empresa: "Una distribuidora mayorista", entra: "Productos del fabricante", sale: "Los mismos productos", clase: "comercial", relacion: "Lo mismo" },
  { id: "t2-08", empresa: "Una petrolera", entra: SIN_INSUMO, sale: "Petróleo extraído del subsuelo", clase: "minera", relacion: "Extraído" },
  { id: "t2-09", empresa: "Una petroquímica", entra: "Insumos químicos", sale: "Productos químicos nuevos", clase: "industrial", relacion: "Transformado" },
  { id: "t2-10", empresa: "Una cantera", entra: SIN_INSUMO, sale: "Piedra extraída del suelo", clase: "minera", relacion: "Extraído" },
  { id: "t2-11", empresa: "Un cultivo de banano", entra: "Semillas y tierra", sale: "Banano", clase: "agropecuaria", relacion: "Cultivado" },
];

/*
 * Los once aciertos, uno por empresa y todos de la ficha. Igual que en T1-1,
 * aquí ya no hay texto general por clase —lo había, redactado por mí, mientras
 * la ficha solo traía tres—: si falta el de una empresa, la evaluación se cae.
 */
export const ACIERTO_T1_2 = {
  "t2-01": "✅ Industrial. Entró algodón y salió tela. No es lo mismo: adentro lo cambiaron.",
  "t2-02": "✅ Comercial. Entró lo mismo que salió. La empresa solo lo revendió.",
  "t2-03": "✅ De servicios. No entró ninguna cosa. Lo que vende el banco es lo que sabe hacer.",
  "t2-04": "✅ Industrial. Entró caña. Salió azúcar. No es lo mismo: adentro la cambiaron.",
  "t2-05": "✅ De servicios. No hay ninguna cosa que señalar. Venden lo que saben hacer.",
  "t2-06": "✅ Agropecuaria. Los terneros crecieron adentro. Ni se compraron ni se sacaron del suelo.",
  "t2-07": "✅ Comercial. Entraron productos y salieron los mismos. Solo cambiaron de dueño.",
  "t2-08": "✅ Minera. Nadie le vendió el petróleo. Lo sacaron del subsuelo.",
  "t2-09": "✅ Industrial. Entró una cosa. Salió otra muy distinta. Adentro la cambiaron.",
  "t2-10": "✅ Minera. La piedra ya estaba en el suelo. Solo la sacaron.",
  "t2-11": "✅ Agropecuaria. Nadie lo trajo ni lo sacó del suelo. El banano se sembró y creció aquí.",
};

/*
 * ═══════════ LA MATRIZ DE CONFUSIONES ═══════════
 *
 * Ocho explicaciones para veinte cruces posibles, y cuál toca depende de las
 * DOS clases: la que marcó y la que era. Escribir la matriz a mano en vez de
 * deducirla es lo correcto aquí — «comercial contra minera» no es la misma
 * confusión que «industrial contra minera», y una regla que las agrupara
 * diría lo mismo a dos estudiantes que se equivocaron por motivos distintos.
 *
 * La ficha venía con E y G intercambiadas respecto a sus propios textos; esta
 * es la versión corregida, y hay una prueba que la comprueba contra lo que
 * cada texto dice de sí mismo.
 */
export const MATRIZ = {
  "comercial>industrial": "A",
  "industrial>comercial": "A",
  "industrial>minera": "B",
  "minera>industrial": "B",
  "industrial>agropecuaria": "C",
  "agropecuaria>industrial": "C",
  "comercial>agropecuaria": "D",
  "agropecuaria>comercial": "D",
  "comercial>minera": "F",
  "minera>comercial": "F",
  "agropecuaria>minera": "H",
  "minera>agropecuaria": "H",
};

/* E: marcó Servicios y la real era otra — sí había un objeto. */
export const CLAVE_MARCO_SERVICIOS = "E";
/* G: la real era Servicios y marcó otra — no había ningún objeto. */
export const CLAVE_ERA_SERVICIOS = "G";

/*
 * ═══════════ YA NO HAY HUECOS QUE RELLENAR ═══════════
 *
 * Las explicaciones A y B llevaban `{relacion}` y `{entra}`, y se rellenaban
 * con datos del ítem: A decía «lo que salió sí es / no es lo mismo» según el
 * caso, y B citaba el recuadro de entrada de esa empresa. Los textos nuevos son
 * fijos, así que esa interpolación se fue.
 *
 * Lo que se pierde con eso queda dicho: esas dos frases ya no están amarradas
 * al banco. Si mañana una empresa cambia de relación o de insumo, el texto no
 * lo va a reflejar y nada va a fallar. La G nombra «sin insumo físico» a mano,
 * y hay una prueba que comprueba que esa frase es de verdad la que el banco
 * escribe en el recuadro, para que al menos ese vínculo no se rompa en silencio.
 */
export const ERROR_T1_2 = {
  A: "❌ Mira los dos cuadros otra vez. ¿Salió lo mismo que entró? Si sí, la empresa solo revende. Si no, lo cambió.",
  B: "❌ Mira el cuadro de ENTRA. Una industrial recibe materia y la cambia. Una minera no le compra a nadie: saca del suelo algo que ya estaba.",
  C: "❌ Las dos hacen algo nuevo, pero de forma distinta. Una cambia cosas con máquinas. La otra siembra o cría seres vivos.",
  D: "❌ Una comercial compra para revender igual. Aquí lo que sale no se compró: se sembró o se crió adentro.",
  E: "❌ Aquí sí hay una cosa que puedes señalar. Las de servicios no venden cosas. Venden lo que saben hacer.",
  F: "❌ Una comercial le compra a alguien. Una minera no: saca del suelo algo que ya estaba ahí. Mira el cuadro de ENTRA.",
  G: "❌ Mira el cuadro de ENTRA: dice sin insumo físico. No hay nada que cambiar, revender, criar ni sacar.",
  H: "❌ Las dos sacan algo de la tierra. Pero una cría animales o siembra plantas. La otra saca piedra o petróleo, que ya estaban ahí.",
};

/* Qué se resalta con cada explicación. Los demás resaltan los dos recuadros. */
export const ESCENA_ERROR = {
  E: "objeto",
  G: "entra-vacio",
};

export const ALT_T1_2 = "Una textilera. Entra: algodón. Sale: tela. El trazo entre los dos dice: transformado. La clase marcada es industrial o de manufactura.";

/* Rótulos de la interfaz. */
export const ROTULO_ENTRA = "ENTRA";
export const ROTULO_SALE = "SALE";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CASO DE CALEJA DEL CAPÍTULO 2 — las ocho transacciones.
 *
 * ═══════════ POR QUÉ HAY DOS LISTAS Y NO UNA ═══════════
 *
 * `CALEJA.transacciones` tiene SEIS y cierra con 415.000 de activo. El
 * capítulo 2 tiene OCHO y cierra con 465.000. No es un conflicto: es la misma
 * empresa en dos momentos, y el balance de A2 ya dice «tras las primeras seis
 * transacciones» justamente por eso.
 *
 * Las seis de arriba las usan A2, A5, A6 y el desafío, todas calibradas a
 * 415.000. Añadirles dos rompería las cuatro de golpe. Así que la lista de
 * ocho se arma AQUÍ, y se arma extendiendo la de seis en vez de copiarla: eso
 * garantiza que las seis son de verdad un prefijo de las ocho y que tocar una
 * transacción del Tema 2 no deja las dos versiones diciendo cosas distintas.
 *
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] ──
 *
 * El TEXTO de las dos últimas es mío. El repo no las tiene y no vienen en la
 * reescritura. Lo que sí está comprobado es su efecto: con estas dos, y solo
 * con estas dos, la ecuación cierra en 465.000 = 465.000, que es la cifra que
 * el capítulo 2 pide. Hay una prueba que lo verifica. Lo que falta confirmar
 * contra el libro es cómo están redactadas y de cuánto es cada una.
 */
export const TRANSACCIONES_CAP2 = [
  ...CALEJA.transacciones,
  {
    id: "cal-7",
    texto: "Reciben mercancía a crédito por valor de $60.000.",
    asiento: { debe: [["Inventario de mercancías", 60000]], haber: [["Cuentas por pagar", 60000]] },
  },
  {
    id: "cal-8",
    texto: "Cancelan $10.000 de las obligaciones financieras con el banco.",
    asiento: { debe: [["Obligaciones financieras", 10000]], haber: [["Caja", 10000]] },
  },
];

/* ═══════════════════ T1-4 · ¿QUÉ LE PASA A CADA UNO? ═══════════════════ */

export const T1_4 = {
  id: "t1-que-le-pasa-a-cada-uno",
  nombre: "¿Qué Le Pasa a Cada Uno?",
  subtema: "El efecto de cada hecho sobre la ecuación",
  dificultad: "medio",
  fpBase: 25,
  porPartida: 6,
  objetivo: "Mira qué le pasa a las tres partes de la empresa con cada hecho.",
  consigna: "Lee el hecho. Para cada parte, toca si sube, si baja o si queda igual.",
};

/*
 * Las tres partes, con la idea simple delante y el término del libro al lado.
 * Nunca el término dentro de una frase: va como rótulo, y las dos se ven.
 */
export const PARTES = [
  { id: ACTIVO, idea: "Lo que tiene", termino: "Activo" },
  { id: PASIVO, idea: "Lo que debe", termino: "Pasivo" },
  { id: PATRIMONIO, idea: "Lo que es de los dueños", termino: "Patrimonio" },
];

export const SUBE = "sube";
export const BAJA = "baja";
export const IGUAL = "igual";

/*
 * Las palabras de los tres controles y el signo que los acompaña.
 *
 * El signo de subir es ↑, NUNCA el ▲. El triángulo es del Tema 2 y ahí
 * significa una cosa concreta que este estudiante todavía no ha visto.
 */
export const CONTROLES = [
  { id: SUBE, palabra: "sube", signo: "↑" },
  { id: BAJA, palabra: "baja", signo: "↓" },
  { id: IGUAL, palabra: "queda igual", signo: "=" },
];

/*
 * ═══════════ LAS CUATRO VARIANTES DE LA EXPLICACIÓN A ═══════════
 *
 * La llave es «de dónde vino el movimiento» y «hacia dónde fue»: una deuda o
 * un aporte, subiendo o bajando. Las dos mitades se DEDUCEN del asiento —si se
 * mueve el pasivo es deuda, si se mueve el patrimonio es aporte; si el activo
 * crece suben y si mengua bajan—, así que no hay una tabla de hechos que se
 * pueda desincronizar del banco.
 *
 * Y la variante se elige por el HECHO, no por lo que marcó el estudiante: la
 * explicación tiene que contar qué pasó de verdad, no glosar el error.
 */
export const ERROR_A_T1_4 = {
  "deuda-sube": "❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo y con eso nació una deuda. Nada se redujo. Los dos lados pueden subir juntos.",
  "deuda-baja": "❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata y con eso se pagó una deuda. Nada creció. Los dos lados pueden bajar juntos.",
  "aporte-sube": "❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo a la empresa y creció lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden subir juntos.",
  "aporte-baja": "❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata de la empresa y bajó lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden bajar juntos.",
};

export const ERROR_B_T1_4 = "❌ Esa parte no se mueve con este hecho. Pregúntate si algo de eso entró, salió o cambió.";

export const ACIERTO_T1_4 = {
  "cal-1": "✅ Sube lo que tiene y sube lo de los dueños. Entró plata a la empresa, y creció lo que ella les reconoce a los socios.",
  "cal-2": "✅ Suben los dos. Entró un computador y nació una deuda por lo mismo. Ninguna cancela a la otra.",
  "cal-3": "✅ Suben los dos. Entró una máquina y el banco prestó la plata. La deuda nació con la compra.",
  "cal-4": "✅ Bajan los dos. Salió plata y con eso se pagó parte de la deuda.",
  "cal-5": "✅ Sube lo que tiene y sube lo de los dueños. El local ya es de la empresa. Lo que creció es lo que ella les reconoce a los socios.",
  "cal-6": "✅ Bajan los dos. Salió plata de la empresa y bajó lo que ella les reconoce a los socios.",
  "cal-7": "✅ Suben los dos. Entró mercancía y nació una deuda con el proveedor.",
  "cal-8": "✅ Bajan los dos. Salió plata y con eso se pagó parte del préstamo del banco.",
};

export const ALT_T1_4 = "Tres barras: lo que tiene, lo que debe y lo que es de los dueños. Con este hecho suben dos de ellas y la tercera se queda igual.";

/* ═══════════════════ T1-5 · LA ECUACIÓN EN MOVIMIENTO ═══════════════════ */

export const T1_5 = {
  id: "t1-la-ecuacion-en-movimiento",
  nombre: "La Ecuación en Movimiento",
  subtema: "La ecuación contable, hecho por hecho",
  dificultad: "dificil",
  fpBase: 50,
  /* Las ocho, siempre, y en orden. Aquí no hay sorteo: es un recorrido. */
  porPartida: 8,
  objetivo: "Lleva las cuentas de la empresa desde cero hasta el final del mes, hecho por hecho.",
  consigna: "Lee el hecho. Escribe los tres totales nuevos.",
};

/*
 * ═══════════ DESDE EL QUINTO, EL MODO CORTO ═══════════
 *
 * A partir del quinto hecho solo se piden los totales que CAMBIAN; el que no
 * se mueve se arrastra solo y se enseña arrastrado, con su rótulo.
 *
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] ──
 *
 * El encargo anterior decía «modo corto desde la transacción 5» y no tengo el
 * texto que lo definía. Esto es mi lectura: escribir veinticuatro cifras en un
 * teléfono es la actividad más larga del tema con diferencia, y para el quinto
 * hecho el estudiante ya demostró cuatro veces que sabe cuál no se mueve. Lo
 * que se recorta es la mecanografía, no la pregunta. Si la lectura correcta
 * era otra, esto es lo único que hay que cambiar.
 */
export const DESDE_EL_CORTO = 5;

export const ERROR_T1_5 = {
  A: "❌ Los dos lados no dan igual. Faltan {Z} de un lado. Vuelve al hecho: lo que entró tiene que venir de algún lado.",
  C: "❌ Esa parte no cambia con este hecho. Tiene que quedar igual que antes. Si la mueves, se pierde el rastro de lo de atrás.",
  B: "❌ Los dos lados dan igual, pero los números no son los de este hecho. Que dé igual no basta. Revisa cuánto entró o salió.",
};

/*
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] ──
 *
 * Los rótulos del pie de verificación y del historial. La reescritura no los
 * trae y el repo no los tenía, porque esta actividad no existía. Ninguno
 * afirma nada: nombran lo que ya está en pantalla.
 */
export const PIE_T1_5 = {
  izquierda: "Lo que tiene",
  derecha: "Lo que debe y lo de los dueños",
  cuadra: "Los dos lados dan igual",
  noCuadra: "Los dos lados no dan igual",
  arrastrado: "se queda igual que antes",
};

export const HISTORIAL_T1_5 = {
  titulo: "Lo que llevas",
  vacio: "Todavía no has anotado ningún hecho.",
};

export const ACIERTO_T1_5_FINAL = "✅ Y ahí está el mes completo. Lo que tiene la empresa y lo que debe más lo de los dueños dan lo mismo, hecho por hecho, desde cero.";

export const ALT_T1_5 = "Tres casillas para escribir: lo que tiene, lo que debe y lo que es de los dueños. Debajo, la comprobación de que los dos lados dan igual, y el historial de los hechos ya anotados.";

/* ═══════════════════ T1-6 · ¿EN CUÁL ESTADO APARECE? ═══════════════════ */

export const T1_6 = {
  id: "t1-en-cual-estado-aparece",
  nombre: "¿En Cuál Estado Aparece?",
  subtema: "Qué va en cada estado financiero",
  dificultad: "dificil",
  fpBase: 50,
  porPartida: 10,
  objetivo: "Decide en cuál de los dos informes va cada cosa.",
  consigna: "Toca la ficha. Luego toca el informe donde va. Si es el primero, toca también en qué parte.",
};

export const PRIMERO = "primero";
export const SEGUNDO = "segundo";

/*
 * ═══════════ LOS DOS INFORMES ═══════════
 *
 * La idea simple es la línea principal; la franja de tiempo, la segunda línea
 * atenuada; y el término del libro va de rótulo en el encabezado del informe,
 * dentro de la pestaña. Las tres cosas se ven siempre: ninguna se abrevia.
 *
 * ⚠️ El segundo informe se llama «Lo que vendió y lo que gastó durante el
 * año», aquí y en cualquier otra actividad. El nombre anterior —el que hablaba
 * de lo que la empresa «ganó»— está retirado del sitio entero, y hay una
 * prueba que barre `src/` buscándolo. Por eso no se escribe ni en un
 * comentario: la prueba no distingue, y hacerla distinguir la dejaría
 * pasando por alto justo los sitios donde importa.
 */
export const INFORMES = [
  {
    id: PRIMERO,
    idea: "Lo que la empresa tiene y debe hoy",
    cuando: "a 31 dic",
    termino: "Estado de situación financiera",
  },
  {
    id: SEGUNDO,
    idea: "Lo que vendió y lo que gastó durante el año",
    cuando: "1 ene – 31 dic",
    termino: "Estado de resultados",
  },
];

/* Las tres secciones del primero. El segundo no se subdivide en esta actividad. */
export const SECCIONES_T1_6 = PARTES;

export const CONCEPTOS = [
  { id: "c6-01", nombre: "Patentes", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-02", nombre: "Ingresos operacionales", informe: SEGUNDO, seccion: null },
  { id: "c6-03", nombre: "Cuentas por pagar – Proveedores", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-04", nombre: "Reservas", informe: PRIMERO, seccion: PATRIMONIO },
  { id: "c6-05", nombre: "Caja o Bancos", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-06", nombre: "Gastos de administración y ventas", informe: SEGUNDO, seccion: null },
  { id: "c6-07", nombre: "Cuentas por cobrar – Clientes", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-08", nombre: "Maquinaria y equipos", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-09", nombre: "Ingresos no operacionales", informe: SEGUNDO, seccion: null },
  { id: "c6-10", nombre: "Inversiones a corto plazo", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-11", nombre: "Documentos por pagar a corto plazo", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-12", nombre: "Obligaciones financieras a corto plazo", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-13", nombre: "Inversiones a largo plazo", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-14", nombre: "Provisión para garantías", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-15", nombre: "Impuesto de renta por pagar", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-16", nombre: "Prestaciones sociales por pagar", informe: PRIMERO, seccion: PASIVO },
];

export const ERROR_T1_6 = {
  /* A · va en el segundo y lo puso en el primero. */
  A: "❌ Eso no es algo que la empresa tenga hoy. Es algo que pasó durante el año. Un informe es una foto de un día. El otro cuenta todo el año.",
  /* B · va en el primero y lo puso en el segundo. */
  B: "❌ Eso la empresa lo tiene o lo debe, y mañana lo sigue teniendo. El otro informe solo cuenta lo que pasó dentro del año.",
  /* C · el informe está bien y la sección no. */
  C: "❌ El informe es el correcto, eso ya lo tienes. Ahora pregúntate: ¿la empresa lo tiene, lo debe, o es de los dueños?",
};

export const ACIERTO_T1_6 = {
  "c6-01": "✅ Va en el primer informe, en lo que tiene. Una patente no se toca, pero es de la empresa y vale.",
  "c6-02": "✅ Va en el segundo informe. No es algo que la empresa tenga: es lo que vendió durante el año.",
  "c6-03": "✅ Va en el primer informe, en lo que debe. Es plata que le queda debiendo a un proveedor.",
  "c6-04": "✅ Va en el primer informe, en lo de los dueños. Es una parte de las ganancias que no se repartió.",
  "c6-05": "✅ Va en el primer informe, en lo que tiene. Es la plata que tiene disponible.",
  "c6-06": "✅ Va en el segundo informe. Es lo que la empresa gastó durante el año.",
  "c6-07": "✅ Va en el primer informe, en lo que tiene. Es plata que los clientes le quedaron debiendo.",
  "c6-08": "✅ Va en el primer informe, en lo que tiene. Son cosas de la empresa que duran años.",
  "c6-09": "✅ Va en el segundo informe. Es lo que obtuvo en el año por algo que no es su negocio de siempre.",
  "c6-10": "✅ Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y puede recuperar pronto.",
  "c6-11": "✅ Va en el primer informe, en lo que debe. Es una deuda con un papel firmado.",
  "c6-12": "✅ Va en el primer informe, en lo que debe. Es lo que le debe a un banco este año.",
  "c6-13": "✅ Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y va a tardar en volver.",
  "c6-14": "✅ Va en el primer informe, en lo que debe. Es lo que la empresa calcula que va a tener que pagar por arreglos de lo que vendió.",
  "c6-15": "✅ Va en el primer informe, en lo que debe. Es lo que le debe al Estado y todavía no le ha pagado.",
  "c6-16": "✅ Va en el primer informe, en lo que debe. Es lo que les debe a sus empleados y todavía no les ha pagado.",
};

/*
 * ═══════════ EL PUNTAJE: 60 % EL INFORME, 40 % LA SECCIÓN ═══════════
 *
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN: la parte del segundo] ──
 *
 * El reparto 60/40 viene del encargo. Lo que no dice es qué pasa con las tres
 * fichas del segundo informe, que no tienen sección que acertar. Las cuento
 * completas al acertar el informe: no hay nada más que preguntarles, y
 * dejarlas en 60 % penalizaría por una pregunta que no se les hizo.
 */
export const PESO_INFORME = 0.6;
export const PESO_SECCION = 0.4;

export const ALT_T1_6 = "Una ficha con un concepto y dos pestañas: el informe de lo que la empresa tiene y debe hoy, y el de lo que vendió y gastó durante el año. Dentro del primero, tres secciones.";
