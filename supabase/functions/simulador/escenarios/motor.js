/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MOTOR DE LOS SIMULADORES CON IA — lo común a todas las oficinas.
 *
 * Cada Aprender de Macro trae su escenario (una oficina, una compañera, un
 * concepto y las opciones entre las que decide el estudiante). Este archivo
 * convierte esa configuración en lo que necesita el manejador:
 *
 *   SISTEMA        el prompt de sistema, fijo por escenario (se cachea)
 *   esquema()      el JSON que debe devolver el modelo (structured outputs)
 *   armarTurno()   el turno del usuario para «caso», «diagnostico» y «pregunta»
 *   validarSalida()  lo que devolvió el modelo, comprobado
 *
 * El VEREDICTO no lo decide la IA: lo calcula veredicto() comparando lo que
 * marcó el estudiante con la respuesta del expediente. La IA solo lo explica.
 *
 * JavaScript plano: lo cargan Deno (la función) y Node (las pruebas).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const RONDAS = 3;
const TENDENCIAS = ["sube", "baja", "igual", "dato"];

const corto = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** acierto si marcó exactamente la respuesta; parcial si atinó alguna; fallo si ninguna. */
export function veredicto(reales, elegidos) {
  const r = new Set(reales);
  const e = new Set(elegidos);
  const bien = [...e].filter((x) => r.has(x));
  const faltan = [...r].filter((x) => !e.has(x));
  const sobran = [...e].filter((x) => !r.has(x));
  const estado = !faltan.length && !sobran.length ? "acierto" : bien.length ? "parcial" : "fallo";
  return { estado, bien, faltan, sobran };
}

const VOZ = `TU VOZ
- Español de Colombia, de tú (piensas, miras, compara, fíjate). Nunca de vos ni de usted.
- Corto: entre 20 y 55 palabras en «dice». Una idea por respuesta.
- Texto plano: sin asteriscos, sin listas, sin títulos, sin emojis.
- Analogías concretas y casi absurdamente simples (la billetera, la tienda del barrio, un arriendo). Nada infantil: son universitarios.
- Mantén la historia: estás en la oficina, el expediente está sobre la mesa, el estudiante es tu compañero junior.
- Si te preguntan algo ajeno a la economía o al trabajo de la oficina, dilo en media frase y vuelve al expediente.
- Nunca inventes teoría que no esté en la fuente. Si algo no está en la fuente, dilo. En Colombia el banco central es el Banco de la República.`;

/**
 * @param {object} cfg
 * @param {string} cfg.id          id de la Aprender
 * @param {string} cfg.persona     quién eres (nombre por rol, especie, carácter)
 * @param {string} cfg.oficina     dónde estás
 * @param {string} cfg.rol         el papel del estudiante
 * @param {string} cfg.fuenteTitulo  de qué presentación del profesor sale
 * @param {string} cfg.fuente      las ideas y definiciones que puedes usar
 * @param {string} cfg.decision    qué decide el estudiante con el expediente
 * @param {Record<string,string>} cfg.opciones  id → definición
 * @param {boolean} cfg.multiple   ¿puede marcar varias?
 * @param {string} cfg.caso        cómo se arma un expediente en esta oficina
 * @param {Record<number,string>} cfg.rondas  1, 2 y 3: dificultad creciente
 * @param {Record<string,string>} [cfg.delata] id → regex (fuente) de palabras que regalarían esa respuesta en el caso
 */
export function crearEscenario(cfg) {
  const IDS = Object.keys(cfg.opciones);
  const definiciones = IDS.map((id) => `- ${id} = ${cfg.opciones[id]}`).join("\n");
  const cuantas = cfg.multiple ? "una o varias opciones" : "exactamente UNA opción";

  const SISTEMA = `${cfg.persona} Estás en ${cfg.oficina}. Hablas con un estudiante universitario de Macroeconomía (Facultad de Administración de Empresas, Universidad Externado de Colombia) que acaba de entrar como ${cfg.rol} y al que estás capacitando dentro de la oficina. Esta actividad usa inteligencia artificial: eres tú.

LA FUENTE (presentación del profesor, «${cfg.fuenteTitulo}»). Usa SOLO esto:
${cfg.fuente}

LO QUE DECIDE EL ESTUDIANTE: ${cfg.decision} Marca ${cuantas} entre estas (con estos ids):
${definiciones}

${VOZ}

LO QUE TE PIDEN (llega en el turno, en ACCION)
1) ACCION caso: inventa un expediente NUEVO. ${cfg.caso} Siempre: «nombre» (corto, inventado, que no sea real ni repita los anteriores); «titular» (máximo 10 palabras); tres «datos», cada uno con lo que se observó («dato», máximo 7 palabras), su valor «antes» y «ahora» con unidades (si no hay antes, «antes» vacío y tendencia «dato»); un «testigo»: una frase corta y concreta de alguien involucrado, máximo 18 palabras; «quien» la dice, máximo 5 palabras. En «respuesta», los ids correctos (${cuantas}). Ni el titular, ni los datos, ni el testigo, ni «dice» pueden nombrar la respuesta: se muestra con datos y hechos. En «dice», presenta el expediente en una o dos frases, como quien lo pone sobre la mesa, y termina pidiendo la decisión. Respeta la ronda. Los valores deben ser verosímiles y coherentes con la fuente.
2) ACCION diagnostico: el servidor ya comparó lo que marcó el estudiante con el expediente y te da el VEREDICTO (acierto, parcial o fallo), lo que marcó, lo que faltó y lo que sobró. No lo cambies. En «dice»: arranca con el veredicto en tus palabras y explica con el DATO concreto del expediente por qué la respuesta es la que es (con la fuente); si sobró una opción, por qué ese dato engaña. Si el estudiante escribió una razón, coméntala.
3) ACCION pregunta: el estudiante te pregunta algo. Responde como su colega de oficina, con la fuente. Si hay un expediente SIN resolver sobre la mesa, no le digas la respuesta ni la confirmes o descartes: dale una pista que apunte al dato que debe mirar. Si ya lo resolvió, puedes hablar abiertamente.

En «sugerencias» propón dos preguntas cortas (máximo 7 palabras cada una) que el estudiante podría hacerte ahora, sin revelar la respuesta del expediente abierto.`;

  const DATO = {
    type: "object", additionalProperties: false, required: ["dato", "antes", "ahora", "tendencia"],
    properties: { dato: { type: "string" }, antes: { type: "string" }, ahora: { type: "string" }, tendencia: { type: "string", enum: TENDENCIAS } },
  };
  const CASO = {
    type: "object", additionalProperties: false, required: ["nombre", "titular", "datos", "testigo", "quien", "respuesta"],
    properties: {
      nombre: { type: "string" }, titular: { type: "string" }, datos: { type: "array", items: DATO },
      testigo: { type: "string" }, quien: { type: "string" }, respuesta: { type: "array", items: { type: "string", enum: IDS } },
    },
  };

  function esquema(accion) {
    const base = { dice: { type: "string" }, sugerencias: { type: "array", items: { type: "string" } } };
    if (accion === "caso") return { type: "object", additionalProperties: false, required: ["dice", "caso", "sugerencias"], properties: { ...base, caso: CASO } };
    return { type: "object", additionalProperties: false, required: ["dice", "sugerencias"], properties: base };
  }

  const soloIds = (lista) => (Array.isArray(lista) ? [...new Set(lista.filter((x) => IDS.includes(x)))] : []);

  /** Un expediente que vuelve del sitio (o del modelo): solo lo que cabe en el esquema. */
  function sanearCaso(c) {
    if (!c || typeof c !== "object") return null;
    const datos = Array.isArray(c.datos)
      ? c.datos.slice(0, 4).map((s) => ({
        dato: corto(s?.dato, 80), antes: corto(s?.antes, 40), ahora: corto(s?.ahora, 60),
        tendencia: TENDENCIAS.includes(s?.tendencia) ? s.tendencia : "dato",
      }))
      : [];
    let respuesta = soloIds(c.respuesta);
    if (!cfg.multiple) respuesta = respuesta.slice(0, 1);
    if (!datos.length || !respuesta.length) return null;
    return { nombre: corto(c.nombre, 40), titular: corto(c.titular, 120), datos, testigo: corto(c.testigo, 200), quien: corto(c.quien, 60), respuesta };
  }

  function bloqueCaso(caso) {
    if (!caso) return "EXPEDIENTE SOBRE LA MESA: ninguno todavía.";
    const d = caso.datos.map((x, k) => `  ${k + 1}. ${x.dato}: ${x.antes ? `${x.antes} → ` : ""}${x.ahora} (${x.tendencia})`).join("\n");
    return `EXPEDIENTE SOBRE LA MESA: ${caso.nombre} · «${caso.titular}»\n${d}\n  Testigo (${caso.quien}): «${caso.testigo}»\n  Respuesta (no revelar si no está resuelto): ${caso.respuesta.join(", ")}`;
  }

  function armarTurno(cuerpo) {
    const accion = cuerpo?.accion;
    const ronda = Math.min(RONDAS, Math.max(1, Number.parseInt(cuerpo?.ronda, 10) || 1));
    const caso = sanearCaso(cuerpo?.caso);

    if (accion === "caso") {
      const previos = Array.isArray(cuerpo?.previos)
        ? cuerpo.previos.slice(-6).map((p) => `${corto(p?.nombre, 40)} (${soloIds(p?.respuesta).join(", ")})`).filter((x) => x.length > 3)
        : [];
      const texto = [
        "ACCION: caso",
        `RONDA ${ronda}: ${cfg.rondas[ronda]}`,
        previos.length ? `Expedientes ya usados en este turno (no repitas el nombre; varía la respuesta): ${previos.join("; ")}` : "Es el primer expediente del turno.",
        `Semilla de variedad: ${corto(String(cuerpo?.semilla ?? ""), 12) || "0"}`,
      ].join("\n");
      return { accion, texto };
    }

    if (accion === "diagnostico") {
      if (!caso) return { error: "sinCaso" };
      let elegidos = soloIds(cuerpo?.elegidos);
      if (!cfg.multiple) elegidos = elegidos.slice(0, 1);
      if (!elegidos.length) return { error: "sinDiagnostico" };
      const v = veredicto(caso.respuesta, elegidos);
      const razon = corto(cuerpo?.razon, 400);
      const texto = [
        "ACCION: diagnostico", bloqueCaso(caso),
        `VEREDICTO (ya calculado, no lo cambies): ${v.estado}`,
        `Marcó: ${elegidos.join(", ")}`, `Faltó: ${v.faltan.join(", ") || "nada"}`, `Sobró: ${v.sobran.join(", ") || "nada"}`,
        razon ? `Razón que escribió el estudiante: «${razon}»` : "No escribió razón.",
      ].join("\n");
      return { accion, texto, extra: { veredicto: v.estado, correctos: caso.respuesta, faltan: v.faltan, sobran: v.sobran } };
    }

    if (accion === "pregunta") {
      const mensaje = corto(cuerpo?.mensaje, 600);
      if (!mensaje) return { error: "sinMensaje" };
      const resuelto = cuerpo?.diagnosticado === true;
      const texto = [
        "ACCION: pregunta", bloqueCaso(caso),
        caso ? `¿Ya lo resolvió?: ${resuelto ? "sí, puedes hablar abiertamente" : "NO, no reveles la respuesta"}` : "",
        `PREGUNTA DEL ESTUDIANTE: ${mensaje}`,
      ].filter(Boolean).join("\n");
      return { accion, texto };
    }
    return { error: "accion" };
  }

  const delata = Object.fromEntries(Object.entries(cfg.delata ?? {}).map(([id, fuente]) => [id, new RegExp(fuente, "i")]));

  function validarSalida(accion, salida) {
    if (!salida || typeof salida !== "object") return null;
    const dice = corto(salida.dice, 700);
    if (!dice) return null;
    const sugerencias = Array.isArray(salida.sugerencias) ? salida.sugerencias.map((s) => corto(s, 60)).filter(Boolean).slice(0, 2) : [];
    if (accion !== "caso") return { dice, sugerencias };
    const caso = sanearCaso(salida.caso);
    if (!caso || caso.datos.length < 3 || !caso.nombre || !caso.titular) return null;
    if (!cfg.multiple && Array.isArray(salida.caso?.respuesta) && new Set(salida.caso.respuesta).size > 1) return null;
    caso.datos = caso.datos.slice(0, 3);
    /* El caso no puede regalar su respuesta. */
    const visible = [dice, caso.titular, caso.testigo, ...caso.datos.map((s) => s.dato)].join(" ");
    if (caso.respuesta.some((id) => delata[id]?.test(visible))) return null;
    return { dice, sugerencias, caso };
  }

  return { ID: cfg.id, IDS, SISTEMA, MULTIPLE: Boolean(cfg.multiple), esquema, armarTurno, validarSalida, sanearCaso, veredicto };
}
