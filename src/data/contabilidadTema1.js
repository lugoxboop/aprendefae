import { USUARIOS, ESTACIONES } from "./contabilidadIntro.js";
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
  nombre: "¿Desde dónde preguntan?",
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
  consigna: "Lee la pregunta. Luego toca si esa persona está adentro o afuera de la empresa.",
  /* Sin vacío: la pregunta de vacío salió con el Bloque 2 de «Así se juega». */
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

/*
 * Los textos alternativos del anillo en fila (lote 4). Mientras se juega, el
 * anillo dice qué tiene encendido (P2 de Mai, §5-9; la frase de la vuelta
 * apagada es mía, para que el lector sepa que no se encendió). Al terminar,
 * el final de Futaba (lote del 24-oct, §4).
 */
export const ALT_T1_1 = "Ciclo de cinco estaciones con las preguntas de las ocho personas en su zona. La vuelta solo se encendió con los administradores.";
export const ALT_ANILLO_T1_1 = {
  base: "Ciclo de cinco estaciones.",
  [ZONA_DENTRO]: "La pregunta está adentro.",
  [ZONA_FUERA]: "La pregunta está afuera.",
  vueltaEncendida: "La vuelta está encendida: esta persona decide.",
  /* Futaba (lote D, §3): «tenue» y no «apagada», porque la vuelta siempre se ve. */
  vueltaApagada: "La vuelta está tenue: esta persona no decide qué hace la empresa.",
};
/* El rótulo de la ficha que entra a su zona (P2 de Mai, §10: texto nuevo para Shoko). */
export const ROTULO_FICHA_T1_1 = "la pregunta";

/* ═══════════════════ T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ? ═══════════════════ */

export const T1_2 = {
  id: "t1-que-entro-y-que-salio",
  nombre: "¿Qué entró y qué salió?",
  subtema: "Clasificación de las empresas según su actividad",
  dificultad: "facil",
  fpBase: 10,
  porPartida: 6,
  objetivo: "Descubre qué hace cada empresa, mirando qué recibe y qué entrega.",
  consigna: "Mira qué entra y qué sale. Luego toca qué clase de empresa es.",
  pregunta: "¿Qué clase de empresa es?",
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
  "t2-06": "✅ Agropecuaria. Entraron terneros y salió ganado. Ese ganado no se compró ni se sacó del suelo: se crió adentro.",
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

export const ALT_T1_2 = `Una textilera. Entra algodón y sale tela. El trazo entre los dos dice: transformado. La clase marcada es ${CLASES.find((c) => c.id === "industrial").nombre}.`;

/* Rótulos de la interfaz. */
export const ROTULO_ENTRA = "ENTRA";
export const ROTULO_SALE = "SALE";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CASO DE CALEJA — las ocho del ejemplo de la ecuación, pp. 36-40.
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
 *
 * Futaba (24-oct, capítulo 2): los ocho totales coinciden con el libro
 * (300.000 → … → 465.000) y la 7 está en la p. 39 tal como va aquí. El libro
 * no le pone nombre a esta empresa: «Compañía Caleja Ltda.» es la del flujo de
 * efectivo (pp. 62-63), que comparte las seis primeras.
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
  nombre: "¿Qué le pasa a cada uno?",
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

export const ERROR_B_T1_4 = "❌ Esa parte queda igual con este hecho. Pregúntate si algo de eso entró, salió o cambió.";

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

/*
 * Los alternativos de T1-4 y T1-5 nombran las tres partes con el rótulo que
 * sale en pantalla, y nada más: sin cifras ni un caso concreto, porque se
 * leen igual en todos los hechos (Levi). Salen de PARTES, que es de donde la
 * pantalla saca sus rótulos.
 */
const enLista = (xs) => `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
export const ALT_T1_4 = `Tres barras: ${enLista(PARTES.map((p) => p.idea))}.`;

/* ═══════════════════ T1-5 · LA ECUACIÓN EN MOVIMIENTO ═══════════════════ */

export const T1_5 = {
  id: "t1-la-ecuacion-en-movimiento",
  nombre: "La ecuación en movimiento",
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
  /* Futaba, 24-oct (tabla sin emoji de Shoko): «Fíjate» en vez de «Revisa». */
  B: "❌ Los dos lados dan igual, pero los números no son los de este hecho. Que dé igual no basta. Fíjate cuánto entró o salió.",
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
  /* [X] y [Z] los rellena la vista con la cifra de cada lado y la diferencia. */
  cuadra: "Los dos lados dan igual: [X].",
  noCuadra: "Los dos lados no dan igual. Hay [Z] de diferencia.",
  arrastrado: "se queda igual que antes",
};

export const HISTORIAL_T1_5 = {
  titulo: "Lo que llevas",
  vacio: "Todavía no has anotado ningún hecho.",
  /* Una fila por hecho, con el desglose: [X] = [Y] + [Z]. Decisión de Levi. */
  fila: "Hecho [n]: [X] = [Y] + [Z]",
  /* Solo en el ejemplo de «Así se juega», que no parte de cero: de dónde arranca. */
  filaInicio: "Al empezar: [X] = [Y] + [Z]",
};

export const ACIERTO_T1_5_FINAL = "✅ Y ahí está el mes completo. Lo que tiene la empresa y lo que debe más lo de los dueños dan lo mismo, hecho por hecho, desde cero.";

export const ALT_T1_5 = `Tres casillas para escribir: ${enLista(PARTES.map((p) => p.idea))}.`;

/*
 * ═══════════ T1-5 CON LAS DOS TORRES (P2 de Mai, 23-oct) ═══════════
 *
 * Los textos nuevos de la P2 (orquestador/conocimiento/fichas/
 * b-t1-5-torres-p2-mai.md, §7), con las correcciones de la auditoría de
 * Shoko (revisiones/b-t1-bancos-y-torres-shoko.md). PARA SHOKO. Lo publicado de arriba no se
 * toca: los 8 hechos, PARTES y ERROR_T1_5 se reusan tal cual (la vista les
 * quita el emoji al pintarlos), y `T1_5.consigna` se queda como estaba
 * aunque la vista ya no la muestre.
 *
 * La consigna nueva está pendiente de que Futaba la confirme (§7). El
 * acierto por hecho también: hasta que llegue, los hechos 1 a 7 dicen solo
 * «Correcto.» y el 8 lleva ACIERTO_T1_5_FINAL sin el emoji (§0).
 */
export const TORRES_T1_5 = {
  /* Textos del 24-oct (P2 de Mai, con los de Shoko; ficha b-t1-5-torres-p2-mai.md §7). */
  consigna: "Lee el hecho. Di cuál no se mueve y el total nuevo de las otras dos.",
  /* El «no» va en negrilla, no en mayúsculas (Shoko): la vista resalta la palabra `negrillaQuieta`. */
  preguntaQuieta: "¿Cuál de las tres no se mueve con este hecho?",
  negrillaQuieta: "no",
  preguntaDireccion: "¿Cuál es el total nuevo de las otras dos?",
  /* El rótulo de cada grupo de cifras: «{parte} · total nuevo». */
  totalNuevo: "[PARTE] · total nuevo",
  /* Debajo de la cifra del total de antes, y solo después de «Anotar» y si fue la elegida (Shoko: antes de responder delataba la opción). */
  sinCambio: "el total anterior, sin cambio",
  /* Futaba, b-t1-lote-24oct-futaba.md §3. La pista es del 1.er error; con un solo intento por decisión, va en «¿Cómo se juega?». */
  pistaTotal: "Parte del total que ya tenía esa parte. ¿Le sumas o le restas lo de este hecho?",
  /* La devolución de la decisión 2 según lo que marcó (no da la cifra: la pastilla ya dice «Iba aquí: …»). */
  /*
   * «monto» y «sinCambio» son de la auditoría de Shoko al #496 (24-oct, la
   * segunda), que reemplazan los de Futaba y nombran la parte: {PARTE}.
   * «contrario» es el de Futaba con la misma entrada «En {PARTE}:», para que
   * ninguna línea quede sin decir de qué parte habla (lo que pidió Shoko).
   */
  devolucionTotal: {
    contrario: "En {PARTE}: ese total va en el sentido contrario. Fíjate si con este hecho esa parte crece o se achica.",
    /* Shoko, #496: la cifra elegida es el total de otra parte después del hecho. */
    otraParte: "En {PARTE}: ese es el total de otra parte, no el de esta. Mira cuánto tenía esta antes del hecho.",
    monto: "En {PARTE}: pusiste lo que se movió, no con cuánto quedó. Súmalo o réstalo al total que había.",
    sinCambio: "En {PARTE}: el total ya no es el de antes.",
  },
  /*
   * La C de las torres (Shoko, #496): la de ERROR_T1_5 hablaba de mover la
   * parte quieta, que en este diseño el estudiante no hace. {ELEGIDA} y
   * {CORRECTA} son las ideas de las partes.
   */
  errorQuieta: "{ELEGIDA} sí se mueve con este hecho. La que se queda igual es {CORRECTA}.",
  /* «Correcto: se queda igual» e «Iba aquí: se queda igual»: lo que se pega a la palabra de la pastilla. */
  quedaIgual: "se queda igual",
  anotar: "Anotar",
  siguiente: "Siguiente",
  verResultado: "Ver el resultado",
  contador: "Hecho [n] de [N]",
  /* Lo que se lee sin ver las torres (§7). [X], [Y], [Z]: los tres totales; [T], el de cada lado. */
  alt: "Lo que tiene, [X]; lo que debe, [Y], más lo que es de los dueños, [Z]: dan [T].",
};

/*
 * La tercera opción cuando el total anterior es $0 (Shoko, #496): con solo dos,
 * se acertaba la mitad de las veces al azar. Hecho 1: lo de un solo socio.
 * Hecho 2, lo que debe: el total de la otra torre.
 */
export const TERCERA_OPCION_T1_5 = {
  "cal-1": { [ACTIVO]: 100000, [PATRIMONIO]: 100000 },
  "cal-2": { [PASIVO]: 325000 },
};

/* El acierto de cada hecho (Futaba, 24-oct). El del hecho 8 cierra el mes; el cierre de la partida sigue con ACIERTO_T1_5_FINAL. */
export const ACIERTO_T1_5 = {
  "cal-1": "Entró plata de los socios. Lo que tiene y lo de los dueños quedan en $300.000, y la empresa todavía no debe nada.",
  "cal-2": "Entró un computador y nació una deuda por lo mismo. Lo que tiene sube a $325.000 y lo que debe, a $25.000.",
  "cal-3": "Entró una máquina con plata del banco. Lo que tiene llega a $375.000 y lo que debe, a $75.000.",
  "cal-4": "Salió plata para pagar parte del computador. Lo que tiene baja a $365.000 y lo que debe, a $65.000.",
  "cal-5": "Un socio nuevo trajo un local. Lo que tiene sube a $465.000 y lo de los dueños, a $400.000.",
  "cal-6": "Le devolvieron plata a un socio. Lo que tiene baja a $415.000 y lo de los dueños, a $350.000.",
  "cal-7": "Entró mercancía y nació una deuda con el proveedor. Lo que tiene sube a $475.000 y lo que debe, a $125.000.",
  "cal-8": "Salió plata para pagar parte del préstamo. Lo que tiene baja a $465.000 y lo que debe, a $115.000.",
};

/* ═══════════════════ T1-6 · ¿EN CUÁL ESTADO APARECE? ═══════════════════ */

export const T1_6 = {
  id: "t1-en-cual-estado-aparece",
  nombre: "¿En qué estado aparece?",
  subtema: "Qué va en cada estado financiero",
  dificultad: "dificil",
  fpBase: 50,
  porPartida: 10,
  /* El apoyo, de Shoko (#535): promete la decisión que de verdad hay, el informe y la parte. */
  objetivo: "Decide en cuál de los dos informes va cada cosa, y en qué parte de ese informe.",
  /* Un solo toque sobre cinco destinos (P2 de Mai, ajustes del 24-oct, §3). Texto de Futaba (lote D, §1). */
  consigna: "Lee la ficha. Toca a cuál de los cinco va: activo, pasivo, patrimonio, ingresos o gastos.",
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
    /* La fecha con que T1-6 rotula el informe (nombre del Aprender, Futaba 24-oct). T1-7 sigue con `cuando`. */
    fecha: "al 31 de diciembre",
  },
  {
    id: SEGUNDO,
    idea: "Lo que vendió y lo que gastó durante el año",
    cuando: "1 ene – 31 dic",
    termino: "Estado de resultados",
    fecha: "1 ene – 31 dic",
  },
];

/* Las tres secciones del primero. */
export const SECCIONES_T1_6 = PARTES;

/*
 * Las dos del segundo (Futaba, lote B del 24-oct, §4; auditoría de Shoko a las
 * P2): el estado de resultados se parte en ingresos y gastos, y la ficha cae en
 * uno de cinco destinos con un solo toque. Es dato del banco: la vista no
 * deduce la sección del nombre del concepto.
 */
export const INGRESOS = "ingresos";
export const GASTOS = "gastos";
export const SECCIONES_SEGUNDO_T1_6 = [
  { id: INGRESOS, idea: "Ingresos" },
  { id: GASTOS, idea: "Gastos" },
];

export const CONCEPTOS = [
  { id: "c6-01", nombre: "Patentes", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-02", nombre: "Ingresos operacionales", informe: SEGUNDO, seccion: INGRESOS },
  { id: "c6-03", nombre: "Cuentas por pagar – Proveedores", informe: PRIMERO, seccion: PASIVO },
  { id: "c6-04", nombre: "Reservas", informe: PRIMERO, seccion: PATRIMONIO },
  { id: "c6-05", nombre: "Caja o Bancos", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-06", nombre: "Gastos de administración y ventas", informe: SEGUNDO, seccion: GASTOS },
  { id: "c6-07", nombre: "Cuentas por cobrar – Clientes", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-08", nombre: "Maquinaria y equipos", informe: PRIMERO, seccion: ACTIVO },
  { id: "c6-09", nombre: "Ingresos no operacionales", informe: SEGUNDO, seccion: INGRESOS },
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
  /* C2 · el informe es el segundo y se cruzaron ingresos y gastos (Futaba, 24-oct). */
  C2: "El informe es el correcto. Ahora pregúntate: ¿eso entró a la empresa en el año, o es algo que gastó?",
};

/*
 * ═══════════ LA DEVOLUCIÓN POR DESTINO (Futaba, lote E; D6 de Shoko) ═══════════
 *
 * Reemplaza la C única de arriba, que servía igual para las dieciséis fichas y
 * no decía por qué. Sale cuando el informe está bien y la parte no, según el
 * destino CORRECTO de la ficha (la llave informe:seccion): dice por qué va ahí
 * y por qué no en lo demás de ese informe, así que vale marque lo que marque.
 * Respaldo: pp. 34, 52-53 y 54 (ficha de fuente, punto 5). A y B no cambian.
 */
export const DEVOLUCION_POR_DESTINO_T1_6 = {
  [`${PRIMERO}:${ACTIVO}`]: "El informe es el correcto. Esto es de la empresa, algo que tiene: es activo. No es una deuda ni de los dueños.",
  [`${PRIMERO}:${PASIVO}`]: "El informe es el correcto. Esto la empresa se lo debe a otro: es pasivo. No lo tiene ni es de los dueños.",
  [`${PRIMERO}:${PATRIMONIO}`]: "El informe es el correcto. Esto les toca a los dueños: es patrimonio. No es algo que la empresa tenga ni deba.",
  [`${SEGUNDO}:${INGRESOS}`]: "El informe es el correcto. Esto lo recibió la empresa en el año: es ingreso. Un gasto es lo que se le fue.",
  [`${SEGUNDO}:${GASTOS}`]: "El informe es el correcto. Esto se le fue a la empresa en el año: es gasto. Un ingreso es lo que recibió.",
};

export const ACIERTO_T1_6 = {
  "c6-01": "✅ Va en el estado de situación financiera, en el activo. Una patente no se toca, pero es de la empresa y vale.",
  "c6-02": "✅ Va en el estado de resultados, en ingresos. No es algo que la empresa tenga: es lo que vendió durante el año.",
  "c6-03": "✅ Va en el estado de situación financiera, en el pasivo. Es plata que le queda debiendo a un proveedor.",
  "c6-04": "✅ Va en el estado de situación financiera, en el patrimonio. Es una parte de las ganancias que no se repartió.",
  "c6-05": "✅ Va en el estado de situación financiera, en el activo. Es la plata que tiene disponible.",
  "c6-06": "✅ Va en el estado de resultados, en gastos. Es lo que la empresa gastó durante el año.",
  "c6-07": "✅ Va en el estado de situación financiera, en el activo. Es plata que los clientes le quedaron debiendo.",
  "c6-08": "✅ Va en el estado de situación financiera, en el activo. Son cosas de la empresa que duran años.",
  "c6-09": "✅ Va en el estado de resultados, en ingresos. Es lo que obtuvo en el año por algo que no es su negocio de siempre.",
  "c6-10": "✅ Va en el estado de situación financiera, en el activo. Es plata puesta a producir en otra parte, y se recupera pronto.",
  "c6-11": "✅ Va en el estado de situación financiera, en el pasivo. Es una deuda con un papel firmado.",
  "c6-12": "✅ Va en el estado de situación financiera, en el pasivo. Es lo que le debe a un banco este año.",
  "c6-13": "✅ Va en el estado de situación financiera, en el activo. Es plata puesta a producir en otra parte, y tarda en volver.",
  "c6-14": "✅ Va en el estado de situación financiera, en el pasivo. Es lo que calcula que va a pagar por arreglos de lo vendido.",
  "c6-15": "✅ Va en el estado de situación financiera, en el pasivo. Es lo que le debe al Estado y todavía no le ha pagado.",
  "c6-16": "✅ Va en el estado de situación financiera, en el pasivo. Es lo que les debe a sus empleados y todavía no les ha pagado.",
};

/*
 * ═══════════ EL PUNTAJE: 60 % EL INFORME, 40 % LA SECCIÓN ═══════════
 *
 * El reparto 60/40 viene del encargo, y desde el lote del 24-oct vale para
 * las dieciséis fichas: el segundo informe ya tiene sección (ingresos o
 * gastos), así que sus tres fichas también se preguntan en dos partes. Antes
 * valían entero al acertar el informe, porque no había más que preguntarles.
 * Lo ya jugado no se recalcula.
 */
export const PESO_INFORME = 0.6;
export const PESO_SECCION = 0.4;

export const ALT_T1_6 = "Dos informes.";

/* ═══════════════════ T1-7 · LA ARTICULACIÓN ═══════════════════ */

export const T1_7 = {
  id: "t1-la-articulacion",
  nombre: "La articulación",
  subtema: "Cómo se articulan los estados financieros",
  dificultad: "experto",
  fpBase: 90,
  /* Las cinco, siempre: solo hay cinco. */
  porPartida: 5,
  objetivo: "Descubre cómo los tres informes se pasan cifras entre ellos.",
  consigna: "Toca la línea de donde sale la flecha. Luego toca la línea a donde llega.",
  /* Sin recuadro de vacío: salió con las correcciones de Levi al Bloque 1. */
};

export const FLUJOS = "flujos";

/* Los tres, con el término del libro de rótulo. El primero y el segundo son
   los mismos de T1-6: se nombran igual en las dos actividades. */
export const INFORMES_T1_7 = [
  ...INFORMES,
  { id: FLUJOS, idea: "De dónde entró y salió la plata", cuando: "1 ene – 31 dic", termino: "Estado de flujos de efectivo" },
];

/*
 * ═══════════ LOS NOMBRES DE LÍNEA ═══════════
 *
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] ──
 *
 * «Utilidad neta» y «Saldo final de efectivo» los nombra el encargo. Los otros
 * siete los escribo yo: esta actividad no existía, así que no hay nada que
 * «conservar como estaba». Son los nombres de línea del Gráfico 2.6 dichos en
 * el registro del resto del tema, y ninguno afirma nada que el capítulo no
 * diga — pero la redacción es mía y le toca a Gen confirmarla.
 */
export const LINEAS = [
  /* El informe al que llegan todas. No sale ninguna flecha de aquí. */
  /*
   * Gráfico 2.6 (p. 66): la flecha del estado de resultados llega en bloque al
   * estado de situación financiera, no a una línea. Esta pieza es ese bloque
   * entero —lo que tiene, lo que debe y lo que es de los dueños—: por eso no
   * dice «activos y pasivos» (Shoko, #535 c: chocaba con t1-5, donde la utilidad
   * entra por lo de los dueños). Decisión de Sakuta, reversible. El id se
   * conserva desde la versión con «Utilidad del ejercicio» (Futaba, ficha del
   * capítulo 1, §10). Va arriba del bloque, como rótulo de la llave que abarca
   * las demás líneas, y se toca como cualquier otra.
   */
  { id: "l-utilidad-balance", informe: PRIMERO, nombre: "Estado de situación financiera", llave: true },
  { id: "l-caja", informe: PRIMERO, nombre: "Efectivo" },
  { id: "l-cobrar-pagar", informe: PRIMERO, nombre: "Cuentas por cobrar y cuentas por pagar" },
  { id: "l-propiedad", informe: PRIMERO, nombre: "Propiedad, planta y equipo" },
  { id: "l-aportes", informe: PRIMERO, nombre: "Aportes de los dueños" },
  /* Lo que vendió y lo que gastó durante el año. */
  { id: "l-utilidad-neta", informe: SEGUNDO, nombre: "Utilidad neta" },
  /* De dónde entró y salió la plata. */
  { id: "l-saldo-final", informe: FLUJOS, nombre: "Saldo final de efectivo" },
  { id: "l-operacion", informe: FLUJOS, nombre: "Actividades de operación" },
  { id: "l-inversion", informe: FLUJOS, nombre: "Actividades de inversión" },
  { id: "l-financiacion", informe: FLUJOS, nombre: "Actividades de financiación" },
];

/*
 * Las cinco flechas del Gráfico 2.6. Todas llegan al primer informe y ninguna
 * sale de él: eso es lo que la actividad enseña, y por eso el cierre las pinta
 * las cinco a la vez.
 */
export const FLECHAS = [
  { id: "f1", desde: "l-utilidad-neta", hasta: "l-utilidad-balance" },
  { id: "f2", desde: "l-saldo-final", hasta: "l-caja" },
  { id: "f3", desde: "l-operacion", hasta: "l-cobrar-pagar" },
  { id: "f4", desde: "l-inversion", hasta: "l-propiedad" },
  { id: "f5", desde: "l-financiacion", hasta: "l-aportes" },
];

export const ERROR_T1_7 = {
  /* A · esas dos no se pasan nada. */
  A: "❌ Esas dos cifras no se pasan nada. Pregúntate: ¿una es la misma que la otra, o explica de dónde salió? Si no pasa ninguna, no hay flecha.",
  /* B · la pareja es buena pero va al revés. */
  B: "❌ La flecha va al revés. Esta sale y esta recibe. Mira la regla: todas llegan al mismo informe, ninguna sale de él.",
  /* C · conectó los dos informes que no se hablan entre ellos. */
  C: "❌ Esos dos informes no se conectan entre ellos. Cada uno le pasa sus cifras al tercero, no al otro.",
};

export const ACIERTO_T1_7 = {
  /* f1 llega en bloque a la foto (Gráfico 2.6, p. 66; Sakuta, #535 c): el mismo sentido que el acierto de cu0-a4 · 5. El ✅ lo quita sinEmoji al pintar. */
  f1: "✅ Lo que vendió y gastó en el año llega en bloque a la foto: cambia cómo queda la empresa.",
  f2: "✅ La plata que queda al final es la misma que aparece en el otro informe. No son dos cifras parecidas: es la misma.",
  f3: "✅ El movimiento del día a día explica lo que le deben y lo que debe. Lo que cobró y lo que pagó deja rastro ahí.",
  f4: "✅ Lo que compró o vendió de sus cosas grandes explica esa línea.",
  f5: "✅ De dónde sacó la plata para financiarse explica lo que pusieron los dueños.",
};

/*
 * Todo lo que la lógica de T1-7 necesita saber, en un paquete. Las funciones
 * de `contabilidad/tema1.js` lo reciben con este de valor por defecto, así que
 * el juego de verdad no cambia; la demo de «Así se juega» les pasa el suyo
 * —dos hojas de la panadería— sin que ese ejemplo entre en el banco.
 */
export const BANCO_T1_7 = { informes: INFORMES_T1_7, lineas: LINEAS, flechas: FLECHAS, aciertos: ACIERTO_T1_7 };

export const CIERRE_T1_7 = "Mira las cinco flechas. Todas llegan al mismo informe. Los otros dos cuentan qué pasó en el año. Ese guarda cómo quedó la empresa al final.";

/*
 * ═══════════ EL MODO INVERSO ═══════════
 *
 * Tres preguntas, sin FP. No califica: es para mirar la regla desde el otro
 * lado una vez que ya se ha dibujado.
 */
export const INVERSO_T1_7 = [
  {
    id: "p1",
    pregunta: "Si la plata que queda al final no fuera igual en los dos informes, ¿qué querría decir?",
    opciones: [
      { id: "p1a", correcta: true, texto: "Que hay un error. Las dos cifras tienen que ser la misma.", feedback: "✅ Correcto. No son dos cuentas que se parecen: es la misma cifra por dos caminos. Si no dan igual, uno de los dos está mal." },
      { id: "p1b", correcta: false, texto: "Que la empresa gastó más plata de la que tenía.", feedback: "❌ No. Que quede con poca plata es posible y no es un error. Lo que no puede pasar es que los dos informes digan cifras distintas de lo mismo." },
      { id: "p1c", correcta: false, texto: "Que los dos informes cubren tiempos distintos.", feedback: "❌ Los dos cierran el mismo día. Si cubrieran tiempos distintos, no se podrían conectar." },
    ],
  },
  {
    id: "p2",
    pregunta: "Si el informe de lo que vendió y gastó no le pasara nada al otro, ¿qué le faltaría?",
    opciones: [
      { id: "p2a", correcta: true, texto: "El efecto de lo que la empresa ganó o perdió en el año.", feedback: "✅ Correcto. El otro informe muestra cómo quedó la empresa, y no puede quedar igual después de un año en que ganó o perdió." },
      { id: "p2b", correcta: false, texto: "La lista de las cosas que compró en el año.", feedback: "❌ Eso lo explica otra flecha: la de lo que compró y vendió de sus cosas grandes." },
      { id: "p2c", correcta: false, texto: "El detalle de las deudas que pidió.", feedback: "❌ Las deudas ya están en el otro informe. Su movimiento lo explican otras flechas." },
    ],
  },
  {
    id: "p3",
    pregunta: "¿Por qué ninguna flecha sale del informe al que llegan todas?",
    opciones: [
      { id: "p3a", correcta: true, texto: "Porque guarda el resultado de lo que los otros explican.", feedback: "✅ Correcto. Los otros dos cuentan qué pasó durante el año. Ese guarda cómo quedó la empresa. La explicación va hacia el resultado." },
      { id: "p3b", correcta: false, texto: "Porque se hace antes que los otros dos.", feedback: "❌ Al revés: necesita lo que los otros calculan. El que va primero es el informe del comienzo del año, que es otro." },
      { id: "p3c", correcta: false, texto: "Porque no tiene nada que ver con los otros.", feedback: "❌ Sí tiene que ver, y mucho: las cinco flechas llegan a él. Lo que no hace es mandarles cifras a ellos." },
    ],
  },
];

export const ALT_T1_7 = "Tres informes. Cinco flechas llegan al informe de lo que la empresa tiene y debe. Una viene del informe de lo que vendió y gastó. Las otras cuatro vienen del informe de la plata.";

/* ═══════════════════ T1-8 · ¿DÓNDE SE ROMPIÓ? ═══════════════════ */

/*
 * La tercera del camino, entre T1-2 y T1-3, aunque se construyó la última: el
 * código es T1-8 y no se renumera nada de lo que ya existe. Depende solo de la
 * pieza 1 del Aprender, así que sale publicada sin esperar a las otras tres.
 *
 * La pieza 1 es la única enseñanza del Tema 1 que ninguna actividad practica
 * de frente —T1-1 reusa su anillo, pero practica usuarios—. Esta la practica:
 * no pide repetir los cinco puntos, pide ver qué pasa cuando uno falta.
 */
export const T1_8 = {
  id: "t1-donde-se-rompio",
  nombre: "¿Dónde se rompió?",
  subtema: "El ciclo de la información contable",
  dificultad: "medio",
  fpBase: 25,
  porPartida: 5,
  objetivo: "Encuentra en qué punto se rompió el ciclo. Y mira qué se pierde de ahí en adelante.",
  consigna: "Lee lo que pasó en la empresa. Toca el punto donde se rompió el ciclo.",
  /*
   * Sin vacío. La pregunta que encabezaba el anillo —hasta dónde llegó y dónde
   * se cortó— salió en el Bloque 1 de «Así se juega»: repetía la consigna con
   * otras palabras justo debajo de ella.
   */
};

/*
 * ═══════════ UN PUNTO APAGADO NO ES UN PASO QUE DEJA DE EXISTIR ═══════════
 *
 * Significa que ESTE HECHO no llegó hasta ahí. La empresa sigue anotando,
 * sacando informes y decidiendo — sin este dato. La pieza 1 sigue un solo
 * hecho por los cinco puntos, y si aquí se diera a entender que los puntos
 * enteros desaparecen, esta actividad contradiría la pieza que la sostiene.
 * Por eso todos los textos dicen «este hecho», nunca «la empresa se queda
 * sin informe». Hay una prueba que barre el banco buscando esa frase.
 *
 * ═══════════ LOS RÓTULOS SON LOS DE LA PIEZA 1 ═══════════
 *
 * El número y el rótulo de cada punto salen de las estaciones de la pieza 1,
 * que ya dicen los rótulos simples («Pasa algo en la empresa»…). Un solo
 * sitio: si cambia allí, cambia aquí.
 */
export const PUNTOS_T1_8 = ESTACIONES.map((e) => ({ n: e.n, rotulo: e.nombre }));

/*
 * Las ocho situaciones, en su VERSIÓN FINAL: la 3, 4, 5 y 6 las reescribió
 * Levi para que sigan UN hecho concreto en vez de un lote. Construcción de
 * Gen, derivadas de la cadena causal del Gráfico 1.1 — no citables a página.
 *
 * `rompe` es el único dato de cada una. Cuántos puntos no alcanza el hecho NO
 * se escribe aquí: se deduce de `rompe`, y la prueba lo compara con la tabla
 * del encargo.
 */
export const SITUACIONES_T1_8 = [
  { id: "t8-01", texto: "Un empleado compró tinta con plata de la caja. No pidió factura ni recibo.", rompe: 2 },
  { id: "t8-02", texto: "La empresa le entregó la mercancía a un cliente, pero no le hizo factura.", rompe: 2 },
  { id: "t8-03", texto: "La factura de un escritorio que compraron está en una carpeta. Nadie la pasó a los libros.", rompe: 3 },
  { id: "t8-04", texto: "Llegó el recibo del arriendo del mes. Sigue en un cajón sin anotar.", rompe: 3 },
  { id: "t8-05", texto: "La compra de papelería quedó anotada en los libros, pero la dejaron por fuera del informe del mes.", rompe: 4 },
  { id: "t8-06", texto: "El pago de la luz está anotado, pero no aparece en el informe que recibieron los jefes.", rompe: 4 },
  { id: "t8-07", texto: "Los informes se hicieron y se guardaron. Los jefes no los han abierto.", rompe: 5 },
  { id: "t8-08", texto: "El informe muestra que un producto está dando pérdida. Nadie lo ha leído.", rompe: 5 },
];

/*
 * Un acierto por punto, VERSIÓN FINAL: «este hecho no llegó a X puntos» (Gen)
 * y «este hecho» en vez de «este gasto» (Levi — la 2 es una venta). El ✅ es
 * la marca del sitio para el tono de la devolución, como en todo el tema.
 */
export const ACIERTO_T1_8 = {
  2: "✅ Se rompió en el papel. Sin factura no queda un papel, así que este hecho no se anota, no llega al informe y los jefes deciden sin saberlo. Se apagaron cuatro puntos.",
  3: "✅ Se rompió al anotar. El papel está. Pero nadie lo pasó a los libros, así que este hecho no llega al informe y los jefes deciden sin saberlo. Se apagaron tres puntos.",
  4: "✅ Se rompió en el informe. Este hecho está anotado, pero lo dejaron por fuera del informe. Los jefes deciden sin ver este dato. Se apagaron dos puntos.",
  5: "✅ El informe sí se hizo: los primeros cuatro puntos quedaron encendidos. Pero los jefes no decidieron nada con él. Por eso el último punto se apaga y la flecha de vuelta no se enciende.",
};

/*
 * ═══════════ LA REGLA DEL ERROR ES UNA COMPARACIÓN, NADA MÁS ═══════════
 *
 * A · tocó un punto ANTERIOR al roto: hasta ahí todo funcionó.
 * B · tocó un punto POSTERIOR: está mirando el síntoma, no la causa — el
 *     mismo razonamiento que T1-7. Texto y rótulo en su versión de Levi.
 */
export const ERROR_T1_8 = {
  A: "❌ Hasta ese punto todo funcionó bien. Mira más adelante: el corte está después.",
  B: "❌ Este hecho nunca llegó a ese punto. Se cortó antes, así que desde ahí ya no aparece.",
};
export const ROTULO_ERROR_B_T1_8 = "este hecho no llegó aquí";

/* El rótulo escrito de un punto apagado: apagado no se dice solo con opacidad. */
export const ROTULO_APAGADO = "apagado";

/*
 * El contador, texto final de Levi: cuenta apagones, no puntos alcanzados.
 * «Se apagaron [N] puntos.» y, con uno solo, «Se apagó 1 punto.».
 */
export const CONTADOR_T1_8 = "Se apagaron [N] puntos.";
export const CONTADOR_UNO_T1_8 = "Se apagó 1 punto.";
export const ROTULO_FLECHA_APAGADA = "pero no cambió nada";

/*
 * ═══════════ LA PREDICCIÓN ═══════════
 *
 * Solo después de acertar el punto y antes de que corra la cascada. Sin
 * puntaje: es para comprometerse con una idea antes de verla. Los dos cierres
 * no dicen el número — ya lo dice el contador.
 */
export const PREDICCION_T1_8 = {
  pregunta: "¿Cuántos puntos se van a apagar?",
  /*
   * La regla, fija debajo de la pregunta. Sin ella, «cuántos se apagan» se
   * leía como «cuántos quedan encendidos» o dejaba fuera el punto roto: lo
   * encontró Ukyo leyendo la pantalla «Así se juega».
   */
  regla: "Se apaga el punto donde se rompió y todos los que siguen.",
  /* De 1 a 4: con el punto roto apagado, ninguna situación deja cero ni cinco. */
  opciones: [1, 2, 3, 4],
  acerto: "Acertaste. Mira hasta dónde llegó.",
  fallo: "No era lo que creías. Mira hasta dónde alcanzó a llegar.",
};

export const CIERRE_T1_8 = "Mientras más temprano se rompe, a menos puntos llega el hecho. La empresa sigue andando. Pero decide sin saber lo que pasó.";

/*
 * Un texto alternativo por situación, de Levi. Cada uno dice lo que queda en
 * pantalla con ESA situación, así que solo se lee el de la que está.
 */
export const ALT_T1_8 = {
  "t8-01": "El hecho es la compra de tinta sin factura. Se apagan los últimos cuatro puntos: «Queda un papel», «Se anota», «Sale un informe» y «Los jefes deciden».",
  "t8-02": "El hecho es la entrega de mercancía sin factura. Se apagan los últimos cuatro puntos: «Queda un papel», «Se anota», «Sale un informe» y «Los jefes deciden».",
  "t8-03": "El hecho es la factura del escritorio que compraron y nadie pasó a los libros. Se apagan los últimos tres puntos: «Se anota», «Sale un informe» y «Los jefes deciden».",
  "t8-04": "El hecho es el recibo del arriendo del mes que sigue sin anotar. Se apagan los últimos tres puntos: «Se anota», «Sale un informe» y «Los jefes deciden».",
  "t8-05": "El hecho es la compra de papelería que quedó por fuera del informe del mes. Se apagan los últimos dos puntos: «Sale un informe» y «Los jefes deciden».",
  "t8-06": "El hecho es el pago de la luz que no aparece en el informe. Se apagan los últimos dos puntos: «Sale un informe» y «Los jefes deciden».",
  "t8-07": "El hecho son los informes guardados que los jefes no abrieron. Los cuatro primeros puntos quedan encendidos, se apaga «Los jefes deciden» y la flecha de vuelta no se enciende.",
  "t8-08": "El hecho es el informe que muestra una pérdida y nadie lo leyó. Los cuatro primeros puntos quedan encendidos, se apaga «Los jefes deciden» y la flecha de vuelta no se enciende.",
};

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D4 · LA SEGUNDA DECISIÓN DE LOS CUATRO HACER DEL TEMA 1.
 *
 * POR QUÉ EXISTE ESTO. Los cuatro cayeron en la auditoría por D4 con la misma
 * falla: una sola pregunta repetida ítem tras ítem. «¿Adentro o afuera?» ocho
 * veces es una decisión, no ocho. La lectura ESTRICTA del Kit (jefatura,
 * 17-oct) lo dice sin rodeos: la misma pregunta sobre otro caso NO es una
 * decisión distinta.
 *
 * QUÉ SE AÑADE. Una segunda decisión sobre el MISMO caso y de TIPO distinto:
 * donde la primera clasifica, la segunda pregunta por la consecuencia; donde
 * la primera ya calculaba (T1-5), la segunda es la que clasifica y va antes.
 * Dos tipos, no dos repeticiones. Y cada opción deja la figura en un estado
 * que se ve distinto: eso es D4 Avanzado, «decisiones distintas producen
 * resultados visibles distintos», y se comprueba mirando.
 *
 * LA TRAMPA QUE YA COSTÓ UN FALLO. Las escenas tienen que diferenciarse
 * PAREJA POR PAREJA, no solo de la correcta: dos opciones malas que dejan la
 * misma figura —o la que ya había— son, para el estudiante, la misma opción.
 * Hay una prueba que las compara una contra una.
 *
 * D6 AVANZADO. Cada opción mala trae su `msg` propio, atado a la confusión
 * que delata ESA opción. Si un mensaje sirviera igual para la otra, está mal
 * escrito. Nada de un «No va aquí» a secas: eso es D6 Básico y lo prohíbe
 * dialecto-unico.test.mjs.
 *
 * NO SUMA FP, Y NO ES UN DESCUIDO. `fpBase`, `porPartida` y el peso de cada
 * ítem se quedan exactamente como estaban: hay datos de estudiantes detrás y
 * recalificar hacia atrás no se puede deshacer. La segunda decisión es
 * formativa: mueve la figura, devuelve y enseña, y no toca el porcentaje. Si
 * algún día se decide que puntúe, es una migración de puntaje, no un retoque.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────── T1-1 · qué tiene en juego quien pregunta ─────────
 * Primera decisión: ¿adentro o afuera? (clasificación).
 * Segunda (Futaba, lote B del 24-oct, §2; la audita Shoko): ¿qué tiene en
 * juego esta persona cuando lee el informe? La de antes —«¿hasta dónde ve?»—
 * se deducía de la primera (adentro ve todo, afuera solo el informe). Esta
 * cruza las dos zonas: «plata», «piensa» y «oficio» salen tanto de adentro
 * como de afuera (o solo de afuera), y «trabajo» solo de adentro, así que
 * saber la zona no da la respuesta. Tampoco repite a H2: H2 parte del
 * propósito y pide quién es; esta parte de quién es y pide qué se juega.
 *
 * Sale de los propósitos de pp. 11-12 (contabilidadIntro.js:156-192). Para el
 * Repaso, la llave sería el id de la opción (Erwin). Los rótulos cortos, para
 * la rejilla de 2×2, y el acierto de «plata» son los de Shoko (lote C de
 * Futaba, §1).
 */
export const SEGUNDA_T1_1 = {
  pregunta: "Ya sabes desde dónde pregunta. ¿Qué tiene en juego esta persona cuando lee el informe?",
  opciones: [
    {
      id: "plata",
      texto: "Plata que ya puso",
      msg: "Esa persona no ha puesto plata ni ha prestado nada. Lo que lee no es para cuidar algo que ya puso.",
    },
    {
      id: "trabajo",
      texto: "Su trabajo",
      msg: "Esa persona no trabaja en la empresa. Lee el informe por otra razón.",
    },
    {
      id: "piensa",
      texto: "Algo que piensa hacer",
      msg: "Esa persona no está pensando si comprar o meter plata. Lee el informe por otra razón.",
    },
    {
      id: "oficio",
      texto: "Su oficio",
      msg: "Esa persona sí se juega algo propio con esta empresa. No la mira solo para sumar cifras o cobrar.",
    },
  ],
  /* Qué tiene en juego cada usuario: la correcta sale de aquí, no de la zona. */
  enJuego: {
    propietarios: "plata", acreedores: "plata",
    administradores: "trabajo", empleados: "trabajo",
    clientes: "piensa", inversionistas: "piensa",
    asociaciones: "oficio", estado: "oficio",
  },
  /* El porqué del acierto, uno por opción. */
  porque: {
    plata: "Puso su capital, le prestó o le vendió a crédito, y mira si eso le rinde o si le van a pagar.",
    trabajo: "Trabaja en la empresa: lee para manejarla o para saber qué puede pedir.",
    piensa: "Todavía no ha puesto nada: piensa si le compra o si mete plata ahí.",
    oficio: "Lo lee por su oficio: saca cifras de todo el sector o cobra los impuestos.",
  },
  /* La pista del primer error, según la correcta. Con un intento (C2) no sale; queda para el Repaso. */
  pista: {
    plata: "¿Esta persona ya puso algo en la empresa, o todavía no?",
    piensa: "¿Esta persona ya puso algo en la empresa, o todavía no?",
    trabajo: "¿Lo que lee le importa por su plata, por su trabajo, por algo que piensa hacer o por su oficio?",
    oficio: "¿Lee para cuidar algo suyo, o porque se lo pide su oficio?",
  },
};

/* ───────── T1-2 · la consecuencia de ser de esa clase ─────────
 * Primera decisión: qué clase de empresa es (clasificación).
 * Segunda: si quiere vender el doble, ¿qué tiene que pasar con el recuadro
 * ENTRA? (consecuencia). La respuesta sale de la clase, no del enunciado: una
 * comercial o una industrial necesita el doble de lo que recibe; una de
 * servicios o una minera no tiene insumo que doblar. Y la figura son los dos
 * recuadros de la primera decisión, no un dibujo nuevo.
 */
export const SEGUNDA_T1_2 = {
  pregunta: "Esta empresa quiere vender el doble de lo que sale. ¿Qué tiene que pasar con el recuadro ENTRA?",
  opciones: [
    {
      id: "doblar",
      texto: "Tiene que entrar el doble: sin más de eso no hay más que vender",
      /* Mal cuando no hay insumo: doblar algo que no existe. */
      msg: "Mira el recuadro ENTRA: dice sin insumo físico. Ahí no entra ninguna cosa que doblar. Esta empresa duplica su trabajo, no su materia.",
    },
    {
      id: "sin-insumo",
      texto: "Nada: ahí no entra ninguna cosa que se pueda doblar",
      /* Mal cuando sí hay insumo: ignorar lo que el recuadro dice. */
      msg: "Pero ahí sí entra algo, y está escrito en el recuadro. Si la empresa quiere entregar el doble, primero tiene que recibir el doble de eso: no se saca más de donde no entra más.",
    },
    {
      id: "no-importa",
      texto: "El recuadro ENTRA no tiene que ver: lo que sale no viene de ahí",
      /* Mal siempre: cortar el vínculo entre los dos recuadros. */
      msg: "Si lo que sale no viniera de lo que entra, los dos recuadros serían dos empresas distintas. La flecha entre ellos es la actividad de la empresa, y es lo único que esta actividad pregunta.",
    },
  ],
  porque: {
    doblar: "Lo que sale viene de lo que entra. Para entregar el doble hay que recibir el doble: ahí está el límite del negocio.",
    "sin-insumo": "No hay insumo que doblar, y eso no es una falta: es la marca de esta clase de empresa. Lo que duplicaría es su trabajo o su extracción.",
  },
  /*
   * Los dos recuadros y la flecha que los une. Las tres escenas se separan
   * pareja por pareja: «doblar» enciende los dos, «sin-insumo» apaga el de
   * entrada y deja encendido el de salida, y «no-importa» además TACHA la
   * flecha, que es exactamente lo que esa opción afirma.
   */
  escena: {
    doblar: { entra: "marcado", sale: "marcado", trazo: "lleno" },
    "sin-insumo": { entra: "atenuado", sale: "marcado", trazo: "vacio" },
    "no-importa": { entra: "atenuado", sale: "marcado", trazo: "cortado" },
  },
};

/* ───────── T1-4 · cuál de los cuatro casos del libro es ─────────
 * Primera decisión: qué le pasa a cada una de las tres partes (tres marcas y
 * un envío). Segunda (lote del 24-oct; auditoría de Shoko a las P2): ¿cuál de
 * los cuatro casos de la p. 35 es este hecho? La de antes —«¿qué le pasó a la
 * igualdad?»— tenía siempre la misma respuesta, porque la igualdad nunca se
 * rompe, y dejaba de ser una decisión desde el segundo hecho.
 *
 * Los nombres son los de la p. 35, textuales, los mismos que enseña cu0-a2
 * (CASOS_P2): un solo sitio, y los pone `opcionesSegundaT1_4` (aquí no se
 * puede importar contabilidadPiezas234.js, que ya importa de este archivo).
 * Las ids son las del caso que deduce `casoDe` del asiento (deuda o aporte,
 * sube o baja), así que la correcta no se escribe en ninguna tabla.
 *
 * Las devoluciones son de Futaba (lote B del 24-oct, §3): dicen qué es el caso
 * que marcó y mandan a mirar el hecho, sin decir cuál era. Con un solo
 * intento (C2) sale la devolución; la pista es para cuando haya reintento.
 */
/* La letra del caso en la p. 35 (CASOS_P2), por id. */
export const CASO_DEL_LIBRO_T1_4 = { "deuda-sube": "a", "aporte-sube": "b", "deuda-baja": "c", "aporte-baja": "d" };

/*
 * El acierto, uno por caso (Futaba, lote D §4; reemplaza al único de Shoko,
 * que solo servía para el pago de deuda). Lleva el nombre completo del libro,
 * pp. 35-36; los rótulos de las opciones siguen cortos.
 */
export const SEGUNDA_T1_4 = {
  pregunta: "¿Cuál de los cuatro casos es este hecho?",
  opciones: [
    {
      id: "deuda-sube",
      acierto: "Aumento en el activo y aumento en el pasivo: entró algo y nació una deuda por lo mismo.",
      msg: "Ese caso es entrar algo y nacer una deuda. Mira si en este hecho hay una deuda, y si algo entró o salió.",
    },
    {
      id: "aporte-sube",
      acierto: "Aumento en el activo y aumento en el patrimonio: entró algo que pusieron los dueños.",
      msg: "Ese caso es entrar algo que ponen los dueños. Mira si en este hecho hay un aporte, y si algo entró o salió.",
    },
    {
      id: "deuda-baja",
      acierto: "Disminución en el activo y disminución en el pasivo: salió plata y con ella se pagó una deuda.",
      msg: "Ese caso es salir plata para pagar una deuda. Mira si en este hecho se paga algo, y si algo entró o salió.",
    },
    {
      id: "aporte-baja",
      acierto: "Disminución en el activo y disminución en el patrimonio: salió algo de la empresa hacia los dueños.",
      msg: "Ese caso es salir algo hacia los dueños. Mira si en este hecho les devuelven algo, y si algo entró o salió.",
    },
  ],
  pista: "¿Lo que tiene subió o bajó? ¿Y del otro lado se movió una deuda o lo de los dueños?",
};

/* ───────── T1-5 · la clasificación que va ANTES del cálculo ─────────
 * Aquí el orden se invierte, y a propósito. La actividad ya pedía la
 * consecuencia —los tres totales nuevos—, hecho tras hecho, y eso era toda la
 * interacción. Lo que faltaba era la clasificación, así que va primero: de las
 * tres partes, ¿cuál NO se mueve con este hecho? Decidirlo es lo que la
 * actividad hacía por el estudiante desde el quinto hecho, cuando arrastraba
 * sola la parte quieta. Ahora la arrastra la que él elija, y se ve.
 *
 * Los mensajes van por PARTE, no por hecho: cada parte delata una confusión
 * propia —el activo es lo que entra y sale, el pasivo es la deuda, el
 * patrimonio es lo de los dueños— y el texto la nombra. Lo que varía con el
 * hecho es el sentido, y eso se rellena en [SENTIDO].
 */
export const SEGUNDA_T1_5 = {
  pregunta: "Antes de escribir: de las tres partes, ¿cuál NO se mueve con este hecho?",
  /* Una opción por parte; la correcta la dice el hecho. */
  msg: {
    [ACTIVO]: "Lo que tiene sí cambió con este hecho: [SENTIDO] algo de la empresa. La parte quieta es otra, y el hecho dice cuál.",
    [PASIVO]: "Las deudas sí se movieron: con este hecho [SENTIDO] una. Lo que debe la empresa no quedó como estaba.",
    [PATRIMONIO]: "Lo de los dueños sí se movió: con este hecho cambió lo que la empresa les reconoce a los socios. Esa no es la parte quieta.",
  },
  sentido: { [ACTIVO]: { sube: "entró", baja: "salió" }, [PASIVO]: { sube: "nació", baja: "se pagó" } },
  porque: "Esa parte se queda igual que antes, así que su total se arrastra solo: lo que hay que escribir son las dos que de verdad se movieron.",
};
