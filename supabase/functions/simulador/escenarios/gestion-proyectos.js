/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · SIMULADOR «ARMA TU ACTA» (Jane, 27-nov-2026).
 *
 * Pía (la hámster panadera del microvideo GP-01) entrevista al estudiante y
 * llena con él el ACTA DE CONSTITUCIÓN de SU propio proyecto, con los 12
 * componentes de la Guía del PMBOK 6.ª ed. (4.1.3.1, p. 81).
 *
 * No usa el motor de expedientes de Macro (no hay respuesta correcta que
 * adivinar): una sola acción, «pregunta», con el acta actual y el mensaje.
 * El sitio manda el acta; el servidor pone el prompt y comprueba la salida.
 *
 * JavaScript plano: lo cargan Deno (la función) y Node (las pruebas).
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const CAMPOS_ACTA = [
  ["proposito", "Propósito del proyecto", "dice por qué existe el proyecto (problema u oportunidad) y a quién beneficia"],
  ["objetivos", "Objetivos medibles y criterios de éxito", "al menos un objetivo con una cifra y un plazo, y cómo se medirá el éxito"],
  ["requisitos", "Requisitos de alto nivel", "al menos dos condiciones obligatorias"],
  ["descripcion", "Descripción, límites y entregables clave", "nombra los entregables clave y al menos un límite (qué no incluye)"],
  ["riesgo", "Riesgo general del proyecto", "al menos un riesgo concreto"],
  ["hitos", "Resumen del cronograma de hitos", "inicio, al menos un hito intermedio y fin, con fechas o semanas"],
  ["presupuesto", "Recursos financieros preaprobados", "una cifra con moneda, o que diga explícitamente que no hay recursos financieros"],
  ["interesados", "Lista de interesados clave", "al menos tres personas o grupos"],
  ["aprobacion", "Requisitos de aprobación", "quién decide si tuvo éxito y quién firma la aprobación"],
  ["salida", "Criterios de salida", "una condición de cierre y una de cancelación"],
  ["director", "Director del proyecto: responsabilidad y autoridad", "nombre, de qué responde y qué puede decidir solo"],
  ["patrocinador", "Patrocinador y nivel de autoridad", "nombre o cargo de quien autoriza y por qué tiene esa autoridad"],
];
const IDS = CAMPOS_ACTA.map(([id]) => id);
const ESTADOS = ["vacio", "incompleto", "listo"];
const corto = (v, max) => (typeof v === "string" ? v.replace(/[ \t]+/g, " ").trim().slice(0, max) : "");

export const SALUDO = "Hola, soy Pía. Antes de abrir mi segunda panadería tuve que firmar un acta de constitución: sin ella, el proyecto no existía. Ahora armamos la de tu proyecto, componente por componente.\n\nEmpecemos: ¿cómo se llama tu proyecto y para qué existe?";

const SISTEMA = `Eres Pía, una hámster panadera que dirigió la apertura de la segunda sede de su panadería. Esta actividad usa inteligencia artificial: eres tú. Entrevistas a un estudiante universitario de Gestión de Proyectos para llenar el ACTA DE CONSTITUCIÓN de SU propio proyecto, según la Guía del PMBOK 6.ª edición en español (sección 4.1.3.1, página 81): el documento emitido por el patrocinador que autoriza formalmente la existencia del proyecto y confiere al director la autoridad para aplicar los recursos de la organización.

Los 12 componentes (id: nombre → cuándo está "listo"):
${CAMPOS_ACTA.map(([id, t, ok]) => `- ${id}: ${t} → ${ok}`).join("\n")}

CÓMO TRABAJAS
- Español de Colombia, de tú. Breve: 20 a 60 palabras en "dice". Texto plano, sin listas, sin asteriscos ni emojis. Cálida, concreta, nada infantil: son universitarios.
- Una sola pregunta por turno. Sigue el orden de los componentes, pero si el estudiante respondió varios en un mensaje, llénalos todos y salta a lo que falte.
- Si una respuesta es vaga, repregunta con un ejemplo de tu panadería (un objetivo sin cifra: "¿cuántos panes, para cuándo?").
- Si pregunta qué significa un componente, explícalo en una frase fiel a la guía y da un ejemplo de tu panadería.
- NUNCA inventes datos del proyecto del estudiante. En el acta escribe solo lo que él dijo, redactado como acta: claro, breve, en tercera persona. Puedes ordenar y resumir, no agregar.
- Marca "listo" solo si cumple el criterio; si no, "incompleto". No cambies un campo que ya está bien salvo que el estudiante lo corrija.
- Si se sale del tema, dilo en media frase y vuelve al acta. Cuando los 12 estén listos, felicítalo y dile que revise la hoja y la firme con su patrocinador.
- Tu primer mensaje ya fue: «${SALUDO}»

Responde con "dice" (tu mensaje), "nombre" (el nombre del proyecto, o cadena vacía si aún no lo sabes) y "campos": solo los componentes que cambian en este turno, cada uno con id, valor (texto para el acta) y estado.`;

function esquema() {
  return {
    type: "object", additionalProperties: false, required: ["dice", "nombre", "campos"],
    properties: {
      dice: { type: "string" },
      nombre: { type: "string" },
      campos: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["id", "valor", "estado"],
          properties: { id: { type: "string", enum: IDS }, valor: { type: "string" }, estado: { type: "string", enum: ["incompleto", "listo"] } },
        },
      },
    },
  };
}

/** El acta que manda el sitio: solo los 12 ids, textos acotados. */
export function sanearActa(acta) {
  const campos = {};
  for (const id of IDS) {
    const c = acta?.campos?.[id];
    campos[id] = { valor: corto(c?.valor, 900), estado: ESTADOS.includes(c?.estado) ? c.estado : "vacio" };
  }
  return { nombre: corto(acta?.nombre, 120), campos };
}

function armarTurno(cuerpo) {
  if (cuerpo?.accion !== "pregunta") return { error: "accion" };
  const mensaje = corto(cuerpo?.mensaje, 1200);
  if (!mensaje) return { error: "sinMensaje" };
  const acta = sanearActa(cuerpo?.acta);
  const texto = [
    "MENSAJE DEL ESTUDIANTE: " + mensaje,
    "",
    "ACTA ACTUAL:",
    `Nombre del proyecto: ${acta.nombre || "(sin nombre)"}`,
    ...CAMPOS_ACTA.map(([id, t]) => `- ${id} (${t}) [${acta.campos[id].estado}]: ${acta.campos[id].valor || "(vacío)"}`),
  ].join("\n");
  return { accion: "pregunta", texto };
}

function validarSalida(_accion, j) {
  if (!j || typeof j !== "object") return null;
  const dice = corto(j.dice, 900);
  if (!dice) return null;
  const vistos = new Set();
  const campos = (Array.isArray(j.campos) ? j.campos : [])
    .filter((c) => c && IDS.includes(c.id) && !vistos.has(c.id) && vistos.add(c.id))
    .map((c) => ({ id: c.id, valor: corto(c.valor, 900), estado: c.estado === "listo" ? "listo" : "incompleto" }))
    .filter((c) => c.valor);
  return { dice, nombre: corto(j.nombre, 120), campos };
}

export const ESCENARIOS = [{ ID: "gp26-acta", SISTEMA, esquema, armarTurno, validarSalida, IDS }];
