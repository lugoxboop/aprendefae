/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FÁBRICA — qué se le pide al modelo y qué se acepta de vuelta.
 *
 * En .js plano y sin un solo import, por lo mismo que manejador.js del
 * asistente: Deno lo carga tal cual y las pruebas de Node también, así que
 * todo lo que puede salir mal se prueba sin gastar un token.
 *
 * ═══════════ QUÉ SE GENERA, Y POR QUÉ SOLO ESTO ═══════════
 *
 * Una pieza de Aprender con la forma que CuatroCapas ya sabe pintar. No se
 * genera código, ni mecánicas nuevas, ni componentes: se generan DATOS que
 * entran en un molde que existe, está medido y está auditado.
 *
 * Esa frontera es la que hace que esto sea seguro. Un PDF que llega de fuera
 * es material no confiable; si de él saliera código, un archivo preparado con
 * malicia podría acabar ejecutándose en el sitio. Saliendo datos, lo peor que
 * puede pasar es una actividad mala — y para eso está el profesor, que la lee
 * antes de publicarla.
 *
 * ═══════════ EL ARCHIVO NO SE GUARDA ═══════════
 *
 * Viaja en la petición, el modelo lo lee y se descarta. No va a Storage, no va
 * a la base y no va al repositorio, que es público. Lo que queda es la
 * actividad escrita con palabras nuestras.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cuántas propone en cada encargo. Tres, por la misma razón que Duolingo pide
 * diez y se queda con tres: elegir es parte del trabajo, y leer diez cansa. */
import { ARQUETIPOS, NOMBRES_ARQUETIPO, instruccionesDeEscena, limpiarEscena, amarrarPasos } from "./escena.js";

export const PIEZAS_POR_LOTE = 3;

export const MAX_MENSAJE = 4000;
export const MAX_ARCHIVOS = 3;
/* 8 MB por archivo. Un capítulo escaneado entero no cabe, y es a propósito:
 * el encargo útil es «este tema», no «el libro». */
export const MAX_BYTES_ARCHIVO = 8 * 1024 * 1024;

export const TIPOS_ACEPTADOS = {
  "application/pdf": "documento",
  "text/plain": "texto",
  "text/markdown": "texto",
  "text/csv": "texto",
};

export const MODELO_POR_DEFECTO = "claude-sonnet-5-5";
/*
 * Una pieza completa con su escena, o el plan entero. 8000 deja margen de
 * sobra para ambas: una pieza sola ronda los 1500. El margen es a propósito —
 * una respuesta cortada a la mitad no es JSON y se pierde la llamada entera.
 */
export const MAX_TOKENS = 8000;
/*
 * Cuántas LLAMADAS al modelo por docente y día si no hay secreto puesto.
 * Cuenta llamadas y no encargos porque es la llamada lo que cuesta, y desde
 * el 3-nov un encargo son 1 + PIEZAS_POR_LOTE llamadas: el plan y una por
 * actividad. 32 son los mismos ocho encargos diarios de antes.
 */
export const LLAMADAS_POR_ENCARGO = 1 + PIEZAS_POR_LOTE;
export const LIMITE_PROVISIONAL = 8 * LLAMADAS_POR_ENCARGO;

export const MOTIVOS = {
  sinSesion: "Necesitas iniciar sesión como docente.",
  noDocente: "Esta sección es solo para docentes.",
  sinEncargo: "Escribe qué quieres que haga, o adjunta un archivo.",
  archivoGrande: "Hay un archivo de más de 8 MB. Sube solo el capítulo o el tema.",
  archivoTipo: "Solo acepto PDF o texto por ahora.",
  demasiados: "Máximo tres archivos por encargo.",
  limite: "Llegaste al límite de encargos de hoy. Vuelve mañana.",
  sinClave: "La fábrica no está configurada en el servidor.",
  modelo: "No pude crear las actividades en este momento. Inténtalo otra vez.",
  vacio: "El material no me dio para armar una actividad. Prueba con más páginas o dime qué tema sacar.",
};

/*
 * ═══════════ DOS PASADAS, Y NO UNA ═══════════
 *
 * Antes era una sola llamada que devolvía las tres actividades de golpe. De
 * ahí salía lo que Mateo llamó «tosco»: pidiéndole todo a la vez, el modelo
 * reparte su esfuerzo y entrega tres esbozos en vez de tres piezas.
 *
 * Ahora:
 *
 *   PLAN    lee el material una vez y devuelve dos cosas — una LECTURA con
 *           nuestras palabras, y el plan de las actividades. Una llamada.
 *   PIEZA   escribe UNA actividad entera, con su escena. Una llamada por
 *           actividad, y cada una con todo el presupuesto para ella sola.
 *
 * Partirlo no es solo calidad, es que cabe: una función de Supabase muere a
 * los 400 s (150 s en plan gratuito) y una generación de diez minutos no
 * entra en una llamada. Medido en la documentación, no supuesto.
 *
 * ═══════════ LA LECTURA ES LO QUE SUSTITUYE AL ARCHIVO ═══════════
 *
 * El PDF viaja UNA vez, en la pasada del plan. Las pasadas de pieza reciben
 * la lectura —texto nuestro, no del autor— y nunca vuelven a ver el archivo.
 * Eso cuesta menos, tarda menos, y sostiene la promesa de la fábrica: el
 * archivo del profesor no se guarda en ningún sitio. La lectura la sostiene
 * el navegador del profesor entre pasada y pasada; cuando cierra, se fue.
 *
 * Es además la regla j del protocolo de eficiencia, aplicada a una IA: lo
 * que llega se lee UNA vez de pies a cabeza, y en esa pasada se saca todo lo
 * que hará falta después.
 */

/* Lo que se le dice al modelo en todas las pasadas: quién es y cómo se
 * escribe aquí. Repetirlo en cada pasada cuesta unos cientos de tokens y
 * evita que la tercera actividad suene distinta de la primera. */
function comun(materia) {
  return [
    "Eres el equipo pedagógico de aprendeFAE, una plataforma de la facultad de administración",
    "de la Universidad Externado de Colombia. Escribes para estudiantes de tercer semestre.",
    "",
    `La materia de este encargo es: ${materia}.`,
    "",
    "CÓMO SE ESCRIBE AQUÍ",
    "- En español de Colombia, directo y sin relleno. Nada de «¡Vamos a explorar el fascinante mundo de...!».",
    "- Con tus palabras. NUNCA copies frases del material: es de otro autor y el sitio es público.",
    "  Explica lo mismo de otra forma. Si un término tiene una definición técnica fija, redúcela a lo esencial.",
    "- Frases cortas. El sitio mide la legibilidad con la escala INFLESZ y exige 65 o más en todo",
    "  texto de diez palabras o más: eso es, en la práctica, frases de menos de veinte palabras y",
    "  palabras de pocas sílabas. Una frase con dos comas y un «el cual» ya no pasa.",
    "- Un ejemplo concreto antes que una regla abstracta. Si puedes poner cifras en pesos, ponlas,",
    "  y que sean cifras de la vida de un estudiante colombiano, no de un manual.",
    "- Cada paso tiene que añadir algo. Un paso que repite el anterior sobra.",
  ].join("\n");
}

/* ═══════════ PASADA 1 · EL PLAN ═══════════ */

export function sistemaPlan({ materia, cuantas = PIEZAS_POR_LOTE }) {
  return [
    comun(materia),
    "",
    "ESTA PASADA NO ESCRIBE ACTIVIDADES. LEE Y PLANEA.",
    "",
    "Lee el material del profesor una sola vez y devuelve dos cosas: lo que entendiste,",
    `y el plan de ${cuantas} actividades de «Aprender» que saldrán de ahí.`,
    "",
    "La lectura es lo único que verán las pasadas siguientes: el archivo no vuelve a viajar.",
    "Si algo no queda en la lectura, se perdió. Sácalo todo de una vez: los términos, las",
    "cifras de ejemplo, las relaciones de causa, y lo que el material da por sabido.",
    "",
    "LA FORMA EXACTA DE LA RESPUESTA",
    "{",
    '  "lectura": {',
    '    "tema":      de qué trata el material, una frase',
    '    "terminos":  [ { "termino", "idea": cómo lo explicarías tú en una o dos frases } ] — entre 6 y 14',
    '    "cifras":    [ texto corto con un dato o ejemplo numérico que sirva ] — hasta 8, puede ir vacío',
    '    "relaciones":[ texto corto del tipo "si sube A, baja B, porque..." ] — hasta 8, puede ir vacío',
    '    "supuesto":  [ lo que el material da por sabido y el estudiante quizá no sepa ] — hasta 6',
    "  },",
    '  "actividades": [ {',
    '    "titulo":    3 a 8 palabras, sin dos puntos ni subtítulo',
    '    "objetivo":  una frase de lo que el estudiante sabrá hacer al terminar',
    '    "terminos":  [ los términos de la lectura que usa esta actividad ] — entre 3 y 6',
    '    "arquetipo": cuál de las cinco figuras le va (ver abajo)',
    '    "porque":    una frase de por qué esa figura y no otra',
    `  } ] — exactamente ${cuantas}`,
    "}",
    "",
    "LAS CINCO FIGURAS, PARA ELEGIR LA DE CADA ACTIVIDAD",
    ...Object.entries(ARQUETIPOS).map(([n, a]) => `· ${n} — ${a.cuando}`),
    "",
    "Reparte: que las actividades no lleven todas la misma figura si el material da para más de una.",
    "Y ordénalas de lo simple a lo difícil: la primera es la que se entiende sin las otras.",
    "",
    "REGLAS QUE NO SE NEGOCIAN",
    "- Devuelve EXACTAMENTE un objeto JSON. Nada antes, nada después, sin ```.",
    "- Si el material no da para tantas actividades, devuelve menos. Antes pocas y buenas que rellenar.",
  ].join("\n");
}

/** El turno del profesor: lo que escribió y lo que adjuntó. Solo en el plan. */
export function peticionPlan({ materia, mensaje, archivos = [], cuantas = PIEZAS_POR_LOTE }) {
  const bloques = [];

  for (const a of archivos) {
    if (TIPOS_ACEPTADOS[a.tipo] === "documento") {
      bloques.push({ type: "document", source: { type: "base64", media_type: a.tipo, data: a.datos } });
    } else {
      /* Texto plano: va como texto, con su nombre delante para que el modelo
         sepa qué es cada cosa cuando hay varios. */
      bloques.push({ type: "text", text: `=== ${a.nombre} ===\n${a.texto ?? ""}` });
    }
  }

  const encargo = (mensaje || "").trim();
  bloques.push({
    type: "text",
    text: encargo
      ? `Lo que pide el profesor:\n${encargo}`
      : "El profesor no escribió nada: saca tú los temas que mejor se presten del material.",
  });

  return { system: sistemaPlan({ materia, cuantas }), messages: [{ role: "user", content: bloques }] };
}

/* ═══════════ PASADA 2 · UNA ACTIVIDAD ENTERA ═══════════ */

export function sistemaPieza({ materia }) {
  return [
    comun(materia),
    "",
    "ESTA PASADA ESCRIBE UNA SOLA ACTIVIDAD. Entera, y con su figura.",
    "",
    "Tienes todo el espacio para esta y nada más que esta. No la dejes a medias ni la",
    "resumas: una actividad floja aquí es una actividad floja publicada.",
    "",
    "LA ACTIVIDAD SE LEE EN CUATRO CAPAS, EN ESTE ORDEN",
    "  1. Los nombres      las definiciones de los términos",
    "  2. Míralo funcionar la figura, paso a paso; cada paso enciende UNA parte y apaga el resto",
    "  3. Pruébalo tú      (no la escribes tú)",
    "  4. En una frase     una pregunta abierta y la respuesta de referencia",
    "",
    "La capa 2 es el corazón. Es donde el estudiante MIRA lo que leyó en la capa 1.",
    "Si los pasos se entienden sin mirar la figura, la figura sobra y la actividad es",
    "puro texto — que es justo lo que no se publica aquí.",
    "",
    "LA FORMA EXACTA DE LA RESPUESTA",
    "{",
    '  "titulo":    3 a 8 palabras, sin dos puntos ni subtítulo',
    '  "objetivo":  una frase de lo que el estudiante sabrá hacer al terminar',
    '  "nombres":   [ { "termino": 1 a 4 palabras, "definicion": 1 a 2 frases } ] — entre 3 y 6',
    '  "escena":    la figura, con la forma de su arquetipo (abajo)',
    '  "pasos":     [ { "resaltar": [ids de la escena], "texto": 1 a 3 frases } ] — entre 4 y 7',
    '  "pregunta":  una pregunta abierta que obligue a usar lo anterior, no a repetirlo',
    '  "respuesta": la respuesta de referencia, 2 a 4 frases',
    "}",
    "",
    instruccionesDeEscena(),
    "",
    "CÓMO SE ESCRIBE UN PASO",
    "- Un paso dice qué está pasando en la parte que enciende. No la define otra vez:",
    "  la definición ya la leyó en la capa 1.",
    "- Los pasos cuentan una historia con principio y final, no una lista de descripciones.",
    "  Empieza por un cambio concreto («el índice sube 10 %») y sigue sus consecuencias.",
    "- El último paso cierra: dice en qué quedó todo.",
    "",
    "REGLAS QUE NO SE NEGOCIAN",
    "- Devuelve EXACTAMENTE un objeto JSON. Nada antes, nada después, sin ```.",
    '- Cada id que pongas en "resaltar" tiene que existir en "partes". Si no existe, el paso se cae.',
    "- Los términos de «nombres» y las partes de la escena tienen que hablar de lo mismo.",
    "- La actividad es independiente: no digas «como vimos arriba» ni «en la actividad anterior».",
  ].join("\n");
}

/** Lo que recibe una pasada de pieza: la lectura y su renglón del plan. */
export function peticionPieza({ materia, lectura, actividad, mensaje }) {
  const partes = [
    "ESTO ES LO QUE SE LEYÓ DEL MATERIAL (no tienes el archivo: esto es todo lo que hay).",
    JSON.stringify(lectura ?? {}, null, 1),
    "",
    "LA ACTIVIDAD QUE TE TOCA ESCRIBIR, SEGÚN EL PLAN:",
    JSON.stringify(actividad ?? {}, null, 1),
  ];

  const encargo = (mensaje || "").trim();
  if (encargo) partes.push("", `Lo que pidió el profesor, por si cambia algo:\n${encargo}`);

  return { system: sistemaPieza({ materia }), messages: [{ role: "user", content: [{ type: "text", text: partes.join("\n") }] }] };
}

/*
 * ═══════════ LO QUE SE ACEPTA DE VUELTA ═══════════
 *
 * El modelo devuelve texto, y el texto puede venir con una valla de código
 * delante, con una frase de cortesía, o con un objeto en vez de una lista.
 * Nada de eso es un fallo del modelo: es lo normal, y el sitio no puede
 * romperse por ello. Lo que no encaje en el molde se descarta en silencio y se
 * cuenta, para que el registro del servidor diga cuántas se cayeron.
 */
/** Saca el objeto JSON de una respuesta que puede traer de todo alrededor. */
export function extraerObjeto(texto) {
  const t = String(texto ?? "").trim();
  if (!t) return null;
  const sinValla = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const intentos = [sinValla];
  const i = sinValla.indexOf("{");
  const j = sinValla.lastIndexOf("}");
  if (i >= 0 && j > i) intentos.push(sinValla.slice(i, j + 1));

  for (const candidato of intentos) {
    try {
      const v = JSON.parse(candidato);
      if (v && typeof v === "object" && !Array.isArray(v)) return v;
    } catch { /* se prueba el siguiente */ }
  }
  return null;
}

const frase = (v, max) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : "";
};

const lista = (v, max, largo) =>
  (Array.isArray(v) ? v : []).map((x) => frase(x, largo)).filter(Boolean).slice(0, max);

/* ═══════════ LA PASADA 1: LA LECTURA Y EL PLAN ═══════════ */

/**
 * La lectura es lo único que sobrevive al archivo. Si sale vacía, las pasadas
 * siguientes escribirían del aire, así que el encargo se corta aquí.
 */
export function leerPlan(texto, cuantas = PIEZAS_POR_LOTE) {
  const crudo = extraerObjeto(texto);
  if (!crudo) return { plan: null, ilegible: true };

  const l = crudo.lectura ?? {};
  const lectura = {
    tema: frase(l.tema, 300),
    terminos: (Array.isArray(l.terminos) ? l.terminos : [])
      .map((t) => ({ termino: frase(t?.termino, 60), idea: frase(t?.idea, 400) }))
      .filter((t) => t.termino && t.idea)
      .slice(0, 14),
    cifras: lista(l.cifras, 8, 200),
    relaciones: lista(l.relaciones, 8, 240),
    supuesto: lista(l.supuesto, 6, 200),
  };
  if (lectura.terminos.length < 3) return { plan: null, ilegible: false };

  const actividades = (Array.isArray(crudo.actividades) ? crudo.actividades : [])
    .map((a) => ({
      titulo: frase(a?.titulo, 120),
      objetivo: frase(a?.objetivo, 300),
      terminos: lista(a?.terminos, 6, 60),
      arquetipo: NOMBRES_ARQUETIPO.includes(a?.arquetipo) ? a.arquetipo : null,
      porque: frase(a?.porque, 240),
    }))
    .filter((a) => a.titulo && a.terminos.length >= 2)
    .slice(0, cuantas);

  if (actividades.length === 0) return { plan: null, ilegible: false };
  return { plan: { lectura, actividades }, ilegible: false };
}

/* ═══════════ LA PASADA 2: UNA PIEZA ═══════════ */

/**
 * Una pieza válida, o null. No arregla: acepta o descarta.
 *
 * Desde el 3-nov exige escena. Antes no la había, y por eso lo generado salía
 * «puro texto»: sin figura no hay capa 2, y sin capa 2 una actividad de
 * Aprender son párrafos uno detrás de otro. Una pieza sin escena no se
 * guarda; se vuelve a pedir.
 */
export function limpiarPieza(cruda) {
  if (!cruda || typeof cruda !== "object" || Array.isArray(cruda)) return null;

  const titulo = frase(cruda.titulo, 120);
  const pregunta = frase(cruda.pregunta, 400);
  if (!titulo || !pregunta) return null;

  const nombres = (Array.isArray(cruda.nombres) ? cruda.nombres : [])
    .map((n) => ({ termino: frase(n?.termino, 60), definicion: frase(n?.definicion, 400) }))
    .filter((n) => n.termino && n.definicion)
    .slice(0, 8);
  if (nombres.length < 2) return null;

  const escena = limpiarEscena(cruda.escena);
  const pasos = amarrarPasos(cruda.pasos, escena);
  if (!escena || !pasos) return null;

  return {
    titulo,
    objetivo: frase(cruda.objetivo, 300) || null,
    nombres,
    escena,
    pasos,
    pregunta,
    respuesta: frase(cruda.respuesta, 800) || null,
    /* Marca de origen: el panel y el sitio tienen que poder distinguir lo que
       hizo la fábrica de lo que construyó una célula. */
    generada: true,
  };
}

/** De la respuesta cruda del modelo a la pieza que se puede guardar. */
export function leerPieza(texto) {
  const crudo = extraerObjeto(texto);
  if (!crudo) return { pieza: null, ilegible: true };
  return { pieza: limpiarPieza(crudo), ilegible: false };
}

/** Los archivos que llegaron, revisados. Devuelve el motivo del primero que falle. */
export function revisarArchivos(archivos) {
  if (!Array.isArray(archivos) || archivos.length === 0) return { ok: true, archivos: [] };
  if (archivos.length > MAX_ARCHIVOS) return { ok: false, motivo: MOTIVOS.demasiados };

  const limpios = [];
  for (const a of archivos) {
    const tipo = String(a?.tipo ?? "").split(";")[0].trim().toLowerCase();
    if (!TIPOS_ACEPTADOS[tipo]) return { ok: false, motivo: MOTIVOS.archivoTipo };

    const datos = typeof a?.datos === "string" ? a.datos : "";
    if (!datos) return { ok: false, motivo: MOTIVOS.archivoTipo };
    /* base64 pesa 4/3 de lo que ocupa el archivo. */
    if (datos.length * 3 / 4 > MAX_BYTES_ARCHIVO) return { ok: false, motivo: MOTIVOS.archivoGrande };

    const limpio = { nombre: frase(a?.nombre, 160) || "archivo", tipo, datos };
    if (TIPOS_ACEPTADOS[tipo] === "texto") {
      /* El texto se decodifica aquí: al modelo le llega como texto, no como
         documento, que es más barato y se lee igual. */
      try { limpio.texto = typeof atob === "function" ? decodeURIComponent(escape(atob(datos))) : ""; }
      catch { limpio.texto = ""; }
    }
    limpios.push(limpio);
  }
  return { ok: true, archivos: limpios };
}

/** El límite diario, del secreto o el provisional. */
export function leerLimite(env) {
  const crudo = env?.FABRICA_LIMITE_DIARIO;
  if (crudo === undefined || crudo === null || String(crudo).trim() === "") {
    return { limite: LIMITE_PROVISIONAL, fuente: "provisional" };
  }
  const n = Number(crudo);
  if (!Number.isInteger(n) || n < 0) return { limite: LIMITE_PROVISIONAL, fuente: "provisional-por-valor-invalido" };
  return { limite: n, fuente: "secreto" };
}
