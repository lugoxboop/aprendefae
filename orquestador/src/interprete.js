import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROLES } from "./roles.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL INTÉRPRETE — de «Gen, crea las 7 actividades del tema 3» a una orden.
 *
 * Su trabajo de verdad no es entender: es NEGARSE A ADIVINAR.
 *
 * Una orden mal entendida no falla — arranca. La cadena corre entera, gasta,
 * y entrega un encargo perfectamente compilado para el tema equivocado. Por eso
 * este paso tiene una sola salida buena y una sola salida mala, y la mala es
 * una pregunta, no un supuesto.
 *
 * ═══════════ SE VALIDA CONTRA EL CATÁLOGO REAL ═══════════
 *
 * Las materias y los temas no se sacan de una lista escrita a mano aquí: se
 * leen de `src/data/subjects.js`, que es el catálogo que de verdad tiene el
 * sitio. Una lista copiada se desincroniza en cuanto alguien añade un tema, y
 * entonces el intérprete rechaza órdenes legítimas o acepta temas que no
 * existen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export async function cargarCatalogo(raizDelRepo) {
  const ruta = path.join(raizDelRepo, "src", "data", "subjects.js");
  const { SUBJECTS } = await import(pathToFileURL(ruta).href);
  return Object.values(SUBJECTS).map((m) => ({
    id: m.id,
    nombre: m.name,
    temas: m.topics.map((t) => ({ id: t.id, titulo: t.title })),
  }));
}

export function catalogoLegible(catalogo) {
  return catalogo
    .map((m) => `- **${m.id}** (${m.nombre}): ${m.temas.map((t) => `\`${t.id}\` «${t.titulo}»`).join(", ")}`)
    .join("\n");
}

const PROMPT = (catalogo, orden) => `
Eres el primer paso de un orquestador de agentes. Tu único trabajo es convertir
una orden escrita en lenguaje natural en una orden estructurada, O pedir el dato
que falta.

# El catálogo real del sitio

${catalogoLegible(catalogo)}

# Los agentes que pueden arrancar la cadena

${Object.values(ROLES).map((r) => `- **${r.id}** — ${r.nombre}`).join("\n")}

# La orden

${orden}

# Qué tienes que devolver

Un único bloque JSON, sin nada más alrededor.

Si la orden es clara y el tema existe en el catálogo:

{"entendida": true, "materia": "<id>", "tema": "<id>", "agente": "<id>", "tarea": "<qué hay que hacer, en una o dos frases>", "pieza": "<nombre corto de la pieza o actividad, o null>"}

Si falta un dato, o hay más de una lectura posible, o el tema no está en el
catálogo:

{"entendida": false, "pregunta": "<la pregunta exacta que hay que hacerle a Mateo, en español, una sola>"}

# La regla que manda sobre todas

NO ADIVINES. Si la orden dice «el tema 3» y la materia tiene dos temas,
pregunta. Si dice «contabilidad» sin decir qué tema y hay dos, pregunta. Si
nombra un tema que no está en el catálogo, pregunta — puede ser un tema nuevo
que todavía no existe, y eso lo decide Mateo, no tú.

Una orden mal entendida no falla: arranca, gasta, y entrega el encargo
equivocado. Preguntar cuesta una línea.
`.trim();

const EXTRAER = /\{[\s\S]*\}/;

/**
 * Interpreta la orden. Devuelve `{ entendida, ... }`.
 *
 * Lo que NO hace: rellenar un hueco con lo más probable. Si el modelo devuelve
 * algo que no encaja con el catálogo, esto lo convierte en pregunta — no en un
 * supuesto.
 */
export async function interpretar({ orden, catalogo, transporte, modelo, esfuerzo = "high" }) {
  const respuesta = await transporte.enviar({
    modelo,
    esfuerzo,
    sistema: [{ type: "text", text: "Devuelves únicamente un bloque JSON. Nada más." }],
    mensajes: [{ role: "user", content: PROMPT(catalogo, orden) }],
  });

  const bruto = respuesta.texto.match(EXTRAER);
  if (!bruto) {
    return { entendida: false, pregunta: "No pude leer la orden. ¿Puedes reformularla?", uso: respuesta.uso };
  }

  let leido;
  try {
    leido = JSON.parse(bruto[0]);
  } catch {
    return { entendida: false, pregunta: "No pude leer la orden. ¿Puedes reformularla?", uso: respuesta.uso };
  }

  if (!leido.entendida) {
    return { entendida: false, pregunta: leido.pregunta ?? "Falta un dato en la orden. ¿Cuál es el tema?", uso: respuesta.uso };
  }

  /*
   * ═══════════ LO QUE DICE QUE ENTENDIÓ, SE COMPRUEBA ═══════════
   *
   * El modelo puede devolver `entendida: true` con un tema que no existe. Aquí
   * se valida contra el catálogo de verdad, y si no cuadra se convierte en
   * pregunta. Un «entendida» que no se comprueba es peor que no preguntar: da
   * la falsa seguridad de que alguien ya lo verificó.
   */
  const materia = catalogo.find((m) => m.id === leido.materia);
  if (!materia) {
    return {
      entendida: false,
      pregunta: `No reconozco la materia «${leido.materia}». Las que hay son: ${catalogo.map((m) => m.id).join(", ")}. ¿Cuál es?`,
      uso: respuesta.uso,
    };
  }
  const tema = materia.temas.find((t) => t.id === leido.tema);
  if (!tema) {
    return {
      entendida: false,
      pregunta: `«${leido.tema}» no es un tema de ${materia.nombre}. Los que hay son: ${materia.temas.map((t) => t.id).join(", ")}. ¿Es uno de esos, o un tema nuevo?`,
      uso: respuesta.uso,
    };
  }
  if (!ROLES[leido.agente]) {
    return {
      entendida: false,
      pregunta: `No sé qué agente es «${leido.agente}». Los que hay son: ${Object.keys(ROLES).join(", ")}. ¿Con cuál arranca?`,
      uso: respuesta.uso,
    };
  }
  if (typeof leido.tarea !== "string" || leido.tarea.trim() === "") {
    return { entendida: false, pregunta: "¿Qué hay que hacer exactamente con ese tema?", uso: respuesta.uso };
  }

  return {
    entendida: true,
    materia: materia.id,
    tema: tema.id,
    tituloDelTema: tema.titulo,
    agente: leido.agente,
    tarea: leido.tarea.trim(),
    pieza: leido.pieza ?? null,
    uso: respuesta.uso,
  };
}
