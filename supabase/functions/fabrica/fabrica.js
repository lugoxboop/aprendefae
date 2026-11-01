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
/* Tres piezas completas en JSON. 8000 deja margen sin pagar de más. */
export const MAX_TOKENS = 8000;
/* Cuántos encargos por docente y día si no hay secreto puesto. */
export const LIMITE_PROVISIONAL = 8;

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
 * ═══════════ EL ENCARGO AL MODELO ═══════════
 *
 * Es una plantilla con huecos, no una conversación: el mismo recurso con el
 * que Duolingo genera ejercicios. Cuanto más cerrado el molde, menos se
 * inventa y más se parece lo que sale a lo que ya está publicado.
 */
export function sistema({ materia, cuantas = PIEZAS_POR_LOTE }) {
  return [
    "Eres el equipo pedagógico de aprendeFAE, una plataforma de la facultad de administración",
    "de la Universidad Externado de Colombia. Escribes para estudiantes de tercer semestre.",
    "",
    `La materia de este encargo es: ${materia}.`,
    "",
    `Tu trabajo: a partir del material que te da el profesor, escribir ${cuantas} actividades de «Aprender».`,
    "",
    "CÓMO SE ESCRIBE AQUÍ",
    "- En español de Colombia, directo y sin relleno. Nada de «¡Vamos a explorar el fascinante mundo de...!».",
    "- Con tus palabras. NUNCA copies frases del material: es de otro autor y el sitio es público.",
    "  Explica lo mismo de otra forma. Si un término tiene una definición técnica fija, redúcela a lo esencial.",
    "- Un ejemplo concreto antes que una regla abstracta. Si puedes poner cifras en pesos, ponlas.",
    "- Cada paso tiene que añadir algo. Un paso que repite el anterior sobra.",
    "",
    "LA FORMA EXACTA DE CADA ACTIVIDAD",
    "{",
    '  "titulo":   texto corto, 3 a 8 palabras, sin dos puntos ni subtítulo',
    '  "objetivo": una frase de lo que el estudiante sabrá hacer al terminar',
    '  "nombres":  [ { "termino": 1 a 4 palabras, "definicion": 1 a 2 frases } ]  — entre 3 y 6',
    '  "pasos":    [ { "resaltar": número del término que se enciende (0 es el primero), "texto": 1 a 3 frases } ]  — entre 4 y 7',
    '  "pregunta": una pregunta abierta que obligue a usar lo anterior, no a repetirlo',
    '  "respuesta": la respuesta de referencia, 2 a 4 frases',
    "}",
    "",
    "REGLAS QUE NO SE NEGOCIAN",
    `- Devuelve EXACTAMENTE un array JSON con ${cuantas} objetos. Nada antes, nada después, sin \`\`\`.`,
    '- "resaltar" tiene que ser un número válido dentro de "nombres". Si un paso no enciende nada, pon null.',
    "- Cada actividad es independiente: no digas «como vimos arriba».",
    "- Si el material no da para tantas, devuelve menos. Antes pocas y buenas que rellenar.",
  ].join("\n");
}

/* El turno del profesor: lo que escribió y lo que adjuntó. */
export function construirPeticion({ materia, mensaje, archivos = [], cuantas = PIEZAS_POR_LOTE }) {
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

  return { system: sistema({ materia, cuantas }), messages: [{ role: "user", content: bloques }] };
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
export function extraerJson(texto) {
  const t = String(texto ?? "").trim();
  if (!t) return null;
  /* Quita la valla de código si viene. */
  const sinValla = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const intentos = [sinValla];
  /* Y si aun así trae texto alrededor, el primer array que se vea. */
  const i = sinValla.indexOf("[");
  const j = sinValla.lastIndexOf("]");
  if (i >= 0 && j > i) intentos.push(sinValla.slice(i, j + 1));

  for (const candidato of intentos) {
    try {
      const v = JSON.parse(candidato);
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") {
        /* A veces envuelve: {"actividades": [...]}. */
        const dentro = Object.values(v).find((x) => Array.isArray(x));
        if (dentro) return dentro;
      }
    } catch { /* se prueba el siguiente */ }
  }
  return null;
}

const frase = (v, max) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : "";
};

/** Una pieza válida, o null. No arregla: acepta o descarta. */
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

  const pasos = (Array.isArray(cruda.pasos) ? cruda.pasos : [])
    .map((p) => {
      const texto = frase(p?.texto, 500);
      if (!texto) return null;
      /* `resaltar` tiene que apuntar a un término que exista; si no, no enciende nada. */
      const r = Number(p?.resaltar);
      const resaltar = Number.isInteger(r) && r >= 0 && r < nombres.length ? r : null;
      return { resaltar, texto };
    })
    .filter(Boolean)
    .slice(0, 9);
  if (pasos.length < 2) return null;

  return {
    titulo,
    objetivo: frase(cruda.objetivo, 300) || null,
    nombres,
    pasos,
    pregunta,
    respuesta: frase(cruda.respuesta, 800) || null,
    /* Marca de origen: el panel y el sitio tienen que poder distinguir lo que
       hizo la fábrica de lo que construyó una célula. */
    generada: true,
  };
}

/** De la respuesta cruda del modelo a las piezas que se pueden guardar. */
export function leerPiezas(texto, cuantas = PIEZAS_POR_LOTE) {
  const lista = extraerJson(texto);
  if (!Array.isArray(lista)) return { piezas: [], descartadas: 0, ilegible: true };

  const piezas = [];
  let descartadas = 0;
  for (const cruda of lista.slice(0, cuantas + 2)) {
    const p = limpiarPieza(cruda);
    if (p) piezas.push(p);
    else descartadas += 1;
  }
  return { piezas: piezas.slice(0, cuantas), descartadas, ilegible: false };
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
