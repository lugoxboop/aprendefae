import { USUARIOS } from "./contabilidadIntro.js";

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
  objetivo: "Identifica si quien le hace una pregunta a la contabilidad pertenece a la empresa o la consulta desde afuera.",
  pregunta: "¿Quién hace esta pregunta pertenece a la empresa o la consulta desde afuera?",
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

export const ROTULO_ZONA = {
  [ZONA_DENTRO]: "DENTRO DE LA EMPRESA",
  [ZONA_FUERA]: "FUERA",
};

/*
 * Las devoluciones de acierto que la ficha escribe, por usuario. Las cuatro
 * que trae van textuales; a las otras cuatro les corresponde la general de su
 * zona, que también es de Gen.
 */
export const ACIERTO_T1_1 = {
  administradores: "✅ Dentro. Y fíjate en el trazo que se encendió: la administración decide, y esa decisión cambia lo que la empresa hace. Por eso está dentro del ciclo, no consultándolo.",
  propietarios: "✅ Dentro. Los dueños pertenecen a la empresa. Fíjate en que el trazo de retorno no se encendió: deciden sobre su inversión, pero quien dirige la actividad día a día es la administración.",
  empleados: "✅ Dentro. Los empleados trabajan en la empresa, así que son usuarios internos — aunque no dirijan ni sean dueños. Estar dentro no es lo mismo que decidir.",
  estado: "✅ Fuera. El Estado tiene poder sobre la empresa, pero no la administra: consulta la información igual que un acreedor o un cliente.",
};

/*
 * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
 *
 * La ficha da el acierto de cuatro de los ocho usuarios. Los otros cuatro son
 * todos externos, y este texto repite el criterio del libro sin añadir nada:
 * consultan la información sin tener injerencia en la administración. La
 * redacción es mía.
 */
export const ACIERTO_FUERA_GENERAL = "✅ Fuera. Usa la información para algo suyo, pero no tiene injerencia en la administración de la empresa: la consulta desde afuera.";

export const ERROR_T1_1 = {
  /* A · un interno colocado afuera. */
  A: {
    texto: "❌ Esa persona pertenece a la empresa. El libro es explícito: los usuarios internos son los propietarios, los administradores y los empleados — los tres. No importa si deciden o no: importa si están adentro.",
    escena: "los-tres-internos",
  },
  /* B · un externo colocado adentro. */
  B: {
    texto: "❌ Ese usuario no tiene injerencia en la administración de la empresa: la consulta desde afuera. Usará la información para algo suyo —prestar, comprar, invertir, cobrar impuestos— pero no pertenece a la empresa.",
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
  objetivo: "Clasifica una empresa por lo que hace, mirando qué recibe y qué entrega.",
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

export const ACIERTO_T1_2 = {
  "t2-01": "✅ Industrial. Entró algodón y salió tela: no es lo mismo. El libro lo dice así — reciben insumos o materias primas y les agregan valor incorporándoles procesos.",
  "t2-02": "✅ Comercial. Entraron mercancías y salieron las mismas mercancías. El libro es explícito: compran para vender después, sin cambiar sus características.",
  "t2-08": "✅ Minera. Aquí no entró nada: el petróleo se sacó del subsuelo. Las mineras no compran ni transforman — explotan un recurso que ya estaba ahí.",
};

/*
 * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
 *
 * La ficha da tres aciertos de muestra. Los otros ocho usan el general de su
 * clase, que repite el criterio del libro y la relación que ya está escrita en
 * el banco; no afirma nada nuevo, pero la redacción es mía.
 */
export const ACIERTO_POR_CLASE = {
  comercial: "✅ Comercial. Lo que salió es lo mismo que entró: compran para vender después, sin cambiarle las características.",
  industrial: "✅ Industrial. Entró una cosa y salió otra distinta: reciben insumos y les agregan valor incorporándoles procesos.",
  servicios: "✅ De servicios. No entró ningún objeto — lo que esta empresa entrega es capacidad profesional, un producto intangible.",
  agropecuaria: "✅ Agropecuaria. Lo que sale no se compró ni se transformó en una máquina: se crió o se cultivó. El libro las lleva aparte de las industriales.",
  minera: "✅ Minera. No hubo insumo que comprar: se explotó un recurso que ya estaba en el suelo o el subsuelo.",
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

export const ERROR_T1_2 = {
  A: "❌ Compara los dos recuadros otra vez: lo que salió {relacion} lo mismo que entró. Ese es todo el criterio. Una comercial vende lo que compró sin cambiarlo; una industrial le agrega valor transformándolo.",
  B: "❌ Mira el recuadro de ENTRA: dice {entra}. Una industrial recibe materia prima y la transforma; una minera extrae del suelo o del subsuelo algo que ya estaba ahí, sin comprarle insumo a nadie.",
  C: "❌ Las dos producen algo que antes no existía así, pero por caminos distintos: una industrial transforma con procesos; una agropecuaria cría o cultiva seres vivos. El libro las separa por eso — ganadería, pesca y agricultura van aparte.",
  D: "❌ Una comercial compra para revender sin cambiar el producto. Aquí lo que sale no se compró: se crió o se cultivó dentro de la empresa.",
  E: "❌ Fíjate en que aquí SÍ hay un objeto: algo entró o algo salió, y puedes señalarlo. Las de servicios comercializan capacidad profesional — productos intangibles, dice el libro.",
  F: "❌ Una comercial le compra a un proveedor. Una minera no le compra a nadie: saca del suelo un recurso que ya estaba ahí. Mira el recuadro de ENTRA.",
  G: "❌ Mira el recuadro de ENTRA: dice sin insumo físico. No hay nada que transformar, revender, criar ni extraer. Lo que esta empresa entrega es capacidad profesional, no una cosa.",
  H: "❌ Las dos sacan algo de la tierra, pero no de la misma forma: una agropecuaria cría o cultiva seres vivos que crecen; una minera extrae un recurso mineral que ya estaba formado.",
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
