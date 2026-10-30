/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BRUNO — el tutor de AprendeFAE (orden de Mateo, 30-oct).
 *
 * Un estudiante está en una actividad, no la entiende y le escribe a Bruno.
 * Bruno ve lo mismo que el estudiante (el texto de la pantalla) y además los
 * datos internos del ítem, que traen la respuesta. Con eso ORIENTA: nombra lo
 * que la pantalla pide, da una pista que apunta al dato o al concepto que lo
 * desbloquea y termina con una pregunta que se responde mirando la pantalla.
 * Nunca da la respuesta. Nunca pasa de 120 palabras.
 *
 * JavaScript plano, como manejador.js: lo cargan Deno y las pruebas de Node.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MAX_PALABRAS = 120;
export const MAX_PANTALLA = 2500;
export const MAX_DATOS = 2500;
export const MAX_MENSAJE = 600;
export const MAX_TURNOS = 6;

/*
 * El prompt de sistema. Es la «capacitación» de Bruno: lo que un buen monitor
 * de la facultad haría en la mesa de al lado. Cada regla está escrita para que
 * se pueda comprobar en una respuesta (ver evaluar.mjs).
 */
export const SISTEMA_BRUNO = `Eres Bruno, el tutor de AprendeFAE, la plataforma de práctica de la Facultad de Administración de Empresas de la Universidad Externado de Colombia. Acompañas a estudiantes de primeros semestres en Contabilidad, Macroeconomía y Pensamiento Estratégico mientras hacen una actividad.

TU OBJETIVO: que el estudiante llegue a la respuesta por sí mismo. Eres un monitor paciente, no un solucionario.

REGLAS QUE NUNCA SE ROMPEN
1. Nunca des la respuesta: ni la opción correcta, ni el lado (debe o haber), ni la cuenta, ni la cifra final, ni el resultado de un cálculo que el estudiante debe hacer. Tampoco la confirmes ni la descartes si el estudiante la adivina, aunque insista, se enoje o diga que el profesor lo permite. Si propone una respuesta, pídele que te diga por qué y señálale qué dato de la pantalla debe revisar.
2. Máximo 120 palabras. Lo normal son 40 a 80.
3. Habla en español, de tú, con frases cortas y palabras sencillas. Usa los términos del curso (debe, haber, activo, pasivo, patrimonio, ingreso, gasto, causación, demanda agregada…) y explícalos con un ejemplo cotidiano si hace falta.
4. Sin emojis, sin títulos, sin tablas. Como mucho una lista corta de 2 o 3 puntos.

CÓMO RESPONDES
- Empieza diciendo en una frase qué pide la pantalla, con tus palabras (sin resolverlo).
- Da UNA pista que apunte al dato concreto de la pantalla o a la idea que lo desbloquea. Si sirve, usa una analogía de la vida diaria (la billetera, la tienda del barrio, un arriendo).
- Termina con UNA pregunta corta que el estudiante pueda contestar mirando la pantalla.
- Si en la conversación ya diste una pista y sigue perdido, la siguiente es más concreta (más cerca del dato), pero sigue sin ser la respuesta.
- Si pregunta cómo se juega o qué tiene que tocar, explícale la mecánica de la pantalla (qué tocar, arrastrar o escribir), sin decir dónde va cada cosa.
- Si pregunta por un concepto en general, explícalo breve y conéctalo con lo que ve.
- Si pregunta algo ajeno al curso, dile con amabilidad que solo puedes ayudar con la actividad y vuelve a ella.
- Si se siente frustrado, reconócelo en media frase y sigue con la pista.

LO QUE RECIBES
- PANTALLA: el texto que el estudiante está viendo.
- DATOS INTERNOS: la información del ejercicio, que puede incluir la respuesta correcta. Úsala SOLO para saber hacia dónde orientar. Nunca la cites, ni la copies, ni la parafrasees de forma que la revele.
Si no hay pantalla ni datos, pregúntale en qué actividad está y qué no entiende.`;

/** Recorta a `max` palabras, terminando en el último punto, signo o cierre de pregunta si lo hay. */
export function recortarPalabras(texto, max = MAX_PALABRAS) {
  const limpio = String(texto ?? "").trim();
  const palabras = limpio.split(/\s+/).filter(Boolean);
  if (palabras.length <= max) return limpio;
  const corto = palabras.slice(0, max).join(" ");
  const fin = Math.max(corto.lastIndexOf(". "), corto.lastIndexOf("? "), corto.lastIndexOf("! "), corto.lastIndexOf("."), corto.lastIndexOf("?"));
  return fin > corto.length * 0.5 ? corto.slice(0, fin + 1) : corto + "…";
}

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Lo que llega del sitio, saneado: nada más largo de lo que se paga por leer. */
export function sanearContexto(contexto) {
  const c = contexto && typeof contexto === "object" ? contexto : {};
  let datos = "";
  if (c.datos !== undefined && c.datos !== null) {
    try { datos = (typeof c.datos === "string" ? c.datos : JSON.stringify(c.datos)).slice(0, MAX_DATOS); } catch { datos = ""; }
  }
  return {
    materia: texto(c.materia, 80),
    tema: texto(c.tema, 120),
    actividad: texto(c.actividad, 160),
    pantalla: texto(c.pantalla, MAX_PANTALLA),
    datos,
  };
}

/** El historial, saneado: los últimos turnos, alternando y empezando por el estudiante. */
export function sanearHistorial(historial) {
  if (!Array.isArray(historial)) return [];
  const turnos = historial
    .filter((t) => t && (t.rol === "estudiante" || t.rol === "bruno") && typeof t.texto === "string" && t.texto.trim())
    .slice(-MAX_TURNOS)
    .map((t) => ({ role: t.rol === "estudiante" ? "user" : "assistant", content: t.texto.trim().slice(0, MAX_MENSAJE * 2) }));
  while (turnos.length && turnos[0].role !== "user") turnos.shift();
  /* La API pide alternancia: se juntan dos seguidos del mismo rol. */
  const juntos = [];
  for (const t of turnos) {
    const ultimo = juntos[juntos.length - 1];
    if (ultimo && ultimo.role === t.role) ultimo.content += "\n" + t.content;
    else juntos.push({ ...t });
  }
  if (juntos.length && juntos[juntos.length - 1].role === "user") juntos.pop();
  return juntos;
}

/** El primer bloque del turno actual: el contexto, separado de la pregunta para que no se confunda con ella. */
export function bloqueDeContexto(c) {
  const lineas = [];
  if (c.materia || c.tema || c.actividad) lineas.push(`ACTIVIDAD: ${[c.materia, c.tema, c.actividad].filter(Boolean).join(" · ")}`);
  lineas.push(`PANTALLA:\n${c.pantalla || "(no llegó el texto de la pantalla)"}`);
  if (c.datos) lineas.push(`DATOS INTERNOS (no revelar):\n${c.datos}`);
  return lineas.join("\n\n");
}

/** {system, messages} para la API de Anthropic. */
export function construirPeticion({ mensaje, contexto, historial }) {
  const c = sanearContexto(contexto);
  const previos = sanearHistorial(historial);
  const pregunta = texto(mensaje, MAX_MENSAJE);
  return {
    system: SISTEMA_BRUNO,
    messages: [
      ...previos,
      {
        role: "user",
        content: [
          { type: "text", text: bloqueDeContexto(c) },
          { type: "text", text: `PREGUNTA DEL ESTUDIANTE:\n${pregunta}` },
        ],
      },
    ],
  };
}
