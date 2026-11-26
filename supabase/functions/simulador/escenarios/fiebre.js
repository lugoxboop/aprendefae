/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR · «PULSO, LA FIRMA QUE DIAGNOSTICA ECONOMÍAS» (pe26-a2-fiebre)
 *
 * El estudiante entra como analista junior a Pulso. La Analista sénior (la
 * gata de gafas del elenco) lo capacita, la IA inventa un expediente nuevo en
 * cada ronda —un país ficticio con tres síntomas— y el estudiante marca qué
 * «virus» tiene. El veredicto NO lo decide la IA: lo calcula el servidor
 * comparando conjuntos; la IA solo lo explica con los datos del expediente.
 *
 * Fuente única: PyEM-PolEc-02-2026 (presentación del profesor), «Los
 * problemas económicos, origen de la política económica». Las definiciones de
 * abajo son las de esa diapositiva, con los mismos ocho problemas y los mismos
 * ids que usa la Aprender (politica-economica/textos.js · VIRUS y
 * FUERA_DEL_CIRCUITO).
 *
 * JavaScript plano: lo cargan Deno (la función) y Node (las pruebas).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID = "pe26-a2-fiebre";
export const RONDAS = 3;

/* Los ocho problemas de la diapositiva, con el id que usa la Aprender. */
export const PROBLEMAS = {
  inflacion: "Inflación: los excesos de la demanda agregada sobre la producción generan un aumento GENERALIZADO de precios (no de un solo producto).",
  desempleo: "Desempleo (paro): aunque las personas buscan empleo, el aparato productivo no las engancha.",
  recesion: "Restricciones al crecimiento (recesión): la economía tiene inconvenientes para que crezcan la producción, el ingreso y la renta (limitaciones en C, I, G, X).",
  deficitFiscal: "Déficit público (fiscal): los ingresos públicos son menores que los gastos públicos.",
  deficitExterno: "Déficit exterior (comercial): las exportaciones del país son menores que las importaciones.",
  desigualdad: "Concentración de la renta (desigualdad): volúmenes muy importantes de la renta son apropiados por grupos pequeños de la población. Se mide con el Gini.",
  asignacion: "Inadecuada asignación de recursos: las personas tienen acceso indiscriminado a ciertos bienes o están excluidas del acceso a otros (por ejemplo, población con carencias).",
  ambiental: "Impactos ambientales indeseados: la producción o el consumo dañan el medio ambiente (contaminación, gases de efecto invernadero).",
};
export const IDS = Object.keys(PROBLEMAS);

/* Lo que pide cada ronda: dificultad progresiva. */
export const RONDA = {
  1: "RONDA 1 (fácil): UN solo problema, evidente. Los tres síntomas apuntan al mismo virus.",
  2: "RONDA 2 (media): DOS problemas a la vez. Cada síntoma apunta claramente a uno de los dos; el tercero refuerza alguno.",
  3: "RONDA 3 (difícil, con trampa): UN problema real y UN síntoma que parece otro problema pero no lo es. Trampas válidas: sube el precio de un solo producto (no es inflación, que es generalizada); el Estado se endeuda con el exterior pero sus ingresos cubren sus gastos (no es déficit fiscal); el país importa mucho pero exporta más (no es déficit externo); hay desempleo estacional mínimo con la producción creciendo fuerte (no es recesión). La trampa NO va en problemas.",
};

const DEFINICIONES = IDS.map((id) => `- ${id} = ${PROBLEMAS[id]}`).join("\n");

/*
 * El prompt de sistema. Fijo (ningún dato del estudiante entra aquí), para que
 * se pueda cachear: lo que cambia va en el turno del usuario.
 */
export const SISTEMA = `Eres Olga (la Dra. Olga), la analista sénior de Pulso, una firma colombiana que diagnostica economías como un médico diagnostica pacientes. Eres una gata de gafas azules, seria pero cálida. Hablas con un estudiante universitario de Macroeconomía (Facultad de Administración de Empresas, Universidad Externado de Colombia) que acaba de entrar a la firma como analista junior y al que estás capacitando dentro de la oficina. Esta actividad usa inteligencia artificial: eres tú.

LA FUENTE (presentación del profesor, «Los problemas económicos, origen de la política económica»). Usa SOLO estas definiciones, con estos ids:
${DEFINICIONES}

Ideas de la misma presentación que puedes usar: la política económica nace de estos problemas; el Estado interviene cuando el mercado no se corrige solo (autorregulación frente a intervención externa); un objetivo es el problema planteado como solucionado. Datos de clase de Colombia (puedes citarlos como referencia, diciendo que son datos de clase): inflación 6 % frente a una meta de 3 %; desempleo 8,1 %; crecimiento 2,6 % (fin de 2025); Gini 0,54; déficit comercial de US$ 8.198,7 millones; 14,1 % de la población con una o más carencias. No uses otras cifras de Colombia.

TU VOZ
- Español de Colombia, de tú (piensas, miras, compara, fíjate). Nunca de vos ni de usted.
- Corto: entre 20 y 55 palabras en «dice». Una idea por respuesta.
- Texto plano: sin asteriscos, sin listas, sin títulos, sin emojis.
- Analogías concretas y casi absurdamente simples (la fiebre, la billetera, la tienda del barrio). Nada infantil: son universitarios.
- Mantén la historia: estás en la oficina de Pulso, el expediente está sobre el escritorio, el estudiante es tu analista junior.
- Si te preguntan algo ajeno a la economía o al trabajo de la firma, dilo en media frase y vuelve al expediente.
- Nunca inventes teoría que no esté en la fuente. Si no sabes algo de la fuente, dilo.

LO QUE TE PIDEN (llega en el turno, en ACCION)
1) ACCION caso: inventa un expediente NUEVO de un país ficticio (nombre inventado, que suene latinoamericano o europeo, que no sea un país real ni repita los anteriores). Tres síntomas, cada uno con un dato observable: qué se midió, su valor ahora y su valor antes (o la referencia), con unidades. Los valores deben ser verosímiles y coherentes con el problema. Un «testigo»: una frase corta y concreta de alguien del país (una tendera, un desempleado, un exportador), máximo 18 palabras, sin nombrar el problema. El «titular» del expediente: máximo 10 palabras, sin nombrar el problema. En «problemas», los ids de los virus REALES del caso. Ningún síntoma, titular ni testigo puede usar el nombre del problema (no digas «inflación», «desempleo», «déficit», «recesión», «desigualdad», «Gini» en el texto del caso: muéstralo con datos). En «dice», presenta el expediente en una o dos frases, como quien lo pone sobre el escritorio, y termina pidiendo el diagnóstico. Respeta la ronda.
2) ACCION diagnostico: el servidor ya comparó el diagnóstico del estudiante con el expediente y te da el VEREDICTO (acierto, parcial o fallo), lo que marcó, lo que faltó y lo que sobró. No lo cambies. En «dice»: arranca con el veredicto en tus palabras, explica con el DATO concreto del expediente por qué cada virus está o no está (usa la definición de la fuente) y, si sobró uno, por qué ese síntoma engaña. Si el estudiante escribió una razón, comenta su razón.
3) ACCION pregunta: el estudiante te pregunta algo. Responde como su compañera de oficina, con la fuente. Si hay un expediente SIN diagnosticar sobre la mesa, no le digas qué virus tiene ni lo confirmes o descartes: dale una pista que apunte al dato que debe mirar. Si ya lo diagnosticó, puedes hablar abiertamente.

En «sugerencias» propón dos preguntas cortas (máximo 7 palabras cada una) que el estudiante podría hacerte ahora, sin revelar la respuesta del expediente abierto.`;

/* ─────────────── el esquema de salida (structured outputs) ─────────────── */

const SINTOMA = {
  type: "object",
  additionalProperties: false,
  required: ["dato", "ahora", "antes", "tendencia"],
  properties: {
    dato: { type: "string", description: "Qué se midió, máximo 7 palabras" },
    ahora: { type: "string", description: "Valor actual con unidad, corto" },
    antes: { type: "string", description: "Valor anterior o referencia con unidad, corto" },
    tendencia: { type: "string", enum: ["sube", "baja", "igual"] },
  },
};

const CASO = {
  type: "object",
  additionalProperties: false,
  required: ["pais", "titular", "sintomas", "testigo", "quien", "problemas"],
  properties: {
    pais: { type: "string" },
    titular: { type: "string" },
    sintomas: { type: "array", items: SINTOMA },
    testigo: { type: "string" },
    quien: { type: "string", description: "Quién dice la frase, máximo 4 palabras (p. ej. «una tendera de Ostra»)" },
    problemas: { type: "array", items: { type: "string", enum: IDS } },
  },
};

export function esquema(accion) {
  const base = {
    dice: { type: "string" },
    sugerencias: { type: "array", items: { type: "string" } },
  };
  if (accion === "caso") {
    return { type: "object", additionalProperties: false, required: ["dice", "caso", "sugerencias"], properties: { ...base, caso: CASO } };
  }
  return { type: "object", additionalProperties: false, required: ["dice", "sugerencias"], properties: base };
}

/* ─────────────── lo que entra del sitio, saneado ─────────────── */

const corto = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const soloIds = (lista) => (Array.isArray(lista) ? [...new Set(lista.filter((x) => IDS.includes(x)))] : []);

/** Un expediente que vuelve del sitio: solo lo que cabe en el esquema. */
export function sanearCaso(c) {
  if (!c || typeof c !== "object") return null;
  const sintomas = Array.isArray(c.sintomas)
    ? c.sintomas.slice(0, 4).map((s) => ({
      dato: corto(s?.dato, 80), ahora: corto(s?.ahora, 40), antes: corto(s?.antes, 40),
      tendencia: ["sube", "baja", "igual"].includes(s?.tendencia) ? s.tendencia : "igual",
    }))
    : [];
  const problemas = soloIds(c.problemas);
  if (!sintomas.length || !problemas.length) return null;
  return {
    pais: corto(c.pais, 40), titular: corto(c.titular, 120), sintomas,
    testigo: corto(c.testigo, 200), quien: corto(c.quien, 60), problemas,
  };
}

/** acierto si marcó exactamente los reales; parcial si atinó alguno; fallo si ninguno. */
export function veredicto(reales, elegidos) {
  const r = new Set(reales);
  const e = new Set(elegidos);
  const bien = [...e].filter((x) => r.has(x));
  const faltan = [...r].filter((x) => !e.has(x));
  const sobran = [...e].filter((x) => !r.has(x));
  const estado = !faltan.length && !sobran.length ? "acierto" : bien.length ? "parcial" : "fallo";
  return { estado, bien, faltan, sobran };
}

function bloqueCaso(caso) {
  if (!caso) return "EXPEDIENTE SOBRE LA MESA: ninguno todavía.";
  const s = caso.sintomas.map((x, k) => `  ${k + 1}. ${x.dato}: ${x.antes} → ${x.ahora} (${x.tendencia})`).join("\n");
  return `EXPEDIENTE SOBRE LA MESA: ${caso.pais} · «${caso.titular}»\n${s}\n  Testigo (${caso.quien}): «${caso.testigo}»\n  Virus reales (no revelar si no está diagnosticado): ${caso.problemas.join(", ")}`;
}

/**
 * El turno del usuario para cada acción. Devuelve { texto, extra } o un error.
 * `extra` viaja al sitio junto con lo que diga el modelo (p. ej., el veredicto).
 */
export function armarTurno(cuerpo) {
  const accion = cuerpo?.accion;
  const ronda = Math.min(RONDAS, Math.max(1, Number.parseInt(cuerpo?.ronda, 10) || 1));
  const caso = sanearCaso(cuerpo?.caso);

  if (accion === "caso") {
    const previos = Array.isArray(cuerpo?.previos)
      ? cuerpo.previos.slice(-6).map((p) => `${corto(p?.pais, 40)} (${soloIds(p?.problemas).join(", ")})`).filter((x) => x.length > 3)
      : [];
    const texto = [
      "ACCION: caso",
      RONDA[ronda],
      previos.length ? `Países y virus ya usados en este turno (no repitas el país; varía los virus): ${previos.join("; ")}` : "Es el primer expediente del turno.",
      `Semilla de variedad: ${corto(String(cuerpo?.semilla ?? ""), 12) || "0"}`,
    ].join("\n");
    return { accion, texto };
  }

  if (accion === "diagnostico") {
    if (!caso) return { error: "sinCaso" };
    const elegidos = soloIds(cuerpo?.elegidos);
    if (!elegidos.length) return { error: "sinDiagnostico" };
    const v = veredicto(caso.problemas, elegidos);
    const razon = corto(cuerpo?.razon, 400);
    const texto = [
      "ACCION: diagnostico",
      bloqueCaso(caso),
      `VEREDICTO (ya calculado, no lo cambies): ${v.estado}`,
      `Marcó: ${elegidos.join(", ")}`,
      `Faltó: ${v.faltan.join(", ") || "nada"}`,
      `Sobró: ${v.sobran.join(", ") || "nada"}`,
      razon ? `Razón que escribió el estudiante: «${razon}»` : "No escribió razón.",
    ].join("\n");
    return { accion, texto, extra: { veredicto: v.estado, correctos: caso.problemas, faltan: v.faltan, sobran: v.sobran } };
  }

  if (accion === "pregunta") {
    const mensaje = corto(cuerpo?.mensaje, 600);
    if (!mensaje) return { error: "sinMensaje" };
    const diagnosticado = cuerpo?.diagnosticado === true;
    const texto = [
      "ACCION: pregunta",
      bloqueCaso(caso),
      caso ? `¿Ya lo diagnosticó?: ${diagnosticado ? "sí, puedes hablar abiertamente" : "NO, no reveles los virus"}` : "",
      `PREGUNTA DEL ESTUDIANTE: ${mensaje}`,
    ].filter(Boolean).join("\n");
    return { accion, texto };
  }

  return { error: "accion" };
}

/* ─────────────── lo que sale del modelo, comprobado ─────────────── */

const PALABRAS_PROHIBIDAS_EN_CASO = /\b(inflaci[oó]n|desempleo|d[eé]ficit|recesi[oó]n|desigualdad|gini)\b/i;

/** Devuelve la salida limpia o null si no sirve (y el manejador reintenta una vez). */
export function validarSalida(accion, salida) {
  if (!salida || typeof salida !== "object") return null;
  const dice = corto(salida.dice, 700);
  if (!dice) return null;
  const sugerencias = Array.isArray(salida.sugerencias) ? salida.sugerencias.map((s) => corto(s, 60)).filter(Boolean).slice(0, 2) : [];
  if (accion !== "caso") return { dice, sugerencias };

  const caso = sanearCaso(salida.caso);
  if (!caso || caso.sintomas.length < 3 || !caso.pais || !caso.titular) return null;
  caso.sintomas = caso.sintomas.slice(0, 3);
  /* El caso no puede nombrar el virus: se mostraría la respuesta. */
  const visible = [dice, caso.titular, caso.testigo, ...caso.sintomas.map((s) => s.dato)].join(" ");
  if (PALABRAS_PROHIBIDAS_EN_CASO.test(visible)) return null;
  return { dice, sugerencias, caso };
}
