import { supabase } from "../lib/supabase.js";

/*
 * Ligas: acceso desde el cliente.
 *
 * LANZAMIENTO ACOTADO. El sistema es genérico —la función SQL acepta cualquier
 * materia— pero solo se enciende donde ya circulan FP de verdad. Macroeconomía
 * queda fuera a propósito: su evaluación final de Demanda Agregada todavía no
 * está conectada al motor, así que abrir ligas allí sería competir por ceros.
 *
 * Añadir una materia es meter su id en esta lista. Nada más.
 */
export const MATERIAS_CON_LIGAS = ["pensamiento-estrategico"];

export const tieneLigas = (subjectId) => MATERIAS_CON_LIGAS.includes(subjectId);

/*
 * ═══════════ LOS NOMBRES SE FUERON A niveles.js ═══════════
 *
 * Aquí vivía `nombreLiga = (liga) => \`Grupo ${liga}\`` con una nota que decía
 * que la interfaz no anuncia la jerarquía porque "Oro" y "Bronce" se quedan
 * pegados a la persona. Esa nota tenía razón sobre los metales y se equivocaba
 * sobre el silencio: un grupo sin nombre no deja de tener arriba y abajo, solo
 * deja de explicarlo.
 *
 * Los nombres —Emergente, Intermedio, Avanzado, Élite— y la decisión de no
 * poner ninguno mientras haya un solo nivel están en src/ligas/niveles.js, con
 * el mensaje semanal, porque las dos cosas se deciden con el mismo dato.
 */

/**
 * El contexto de la liga: cuántos niveles hay, en qué nivel estaba quien
 * pregunta y cuántos niveles había entonces, y si este ciclo vivió un reparto
 * o la apertura de Élite.
 *
 * Va aparte de `tableroDe` porque el tablero devuelve una fila por estudiante
 * del podio y esto es un solo dato de la materia: repetido en cada fila sería
 * ruido, y con el podio vacío no llegaría nunca.
 */
export async function contextoDe(subjectId) {
  const VACIO = {
    totalNiveles: 0,
    ligaAnterior: null,
    nivelesAnterior: null,
    transicion: null,
    activosReparto: null,
  };
  if (!supabase || !tieneLigas(subjectId)) return { contexto: VACIO, error: null };

  const { data, error } = await supabase.rpc("liga_contexto", { p_subject: subjectId });
  if (error) {
    if (error.code !== "42501") console.error("[aprendeFAE] Liga (contexto):", error.message);
    return { contexto: VACIO, error: error.code === "42501" ? "sin-sesion" : error.message };
  }

  /*
   * La función devuelve una fila; PostgREST la entrega como arreglo. Si llegara
   * vacía —o si la migración 0025 todavía no estuviera aplicada y respondiera
   * un PGRST202 que cae en la rama de arriba— el contexto vacío deja el tablero
   * exactamente como estaba antes de esta función: sin nombre y con el texto
   * genérico. Degradar a lo de antes, nunca a una pantalla rota.
   */
  const f = Array.isArray(data) ? data[0] : data;
  if (!f) return { contexto: VACIO, error: null };

  /* null se queda null: "no hay" no es cero. */
  const entero = (v) => (v === null || v === undefined ? null : Number(v));

  return {
    contexto: {
      totalNiveles: Number(f.total_ligas ?? 0),
      ligaAnterior: entero(f.liga_anterior),
      /*
       * Las tres de la 0026. Si el servidor todavía es el de la 0025 no
       * llegan, quedan en null, y la cabecera se comporta como antes:
       * sin mensajes de transición y comparando por número de liga.
       */
      nivelesAnterior: entero(f.niveles_anterior),
      transicion: f.transicion ?? null,
      activosReparto: entero(f.activos_reparto),
    },
    error: null,
  };
}

/** El tablero de la liga propia: podio + tu fila. */
export async function tableroDe(subjectId) {
  if (!supabase || !tieneLigas(subjectId)) return { filas: [], error: null };

  const { data, error } = await supabase.rpc("liga_tablero", { p_subject: subjectId });
  if (error) {
    /* Sin sesión la función responde 42501; no es un fallo que haya que gritar. */
    if (error.code !== "42501") console.error("[aprendeFAE] Liga:", error.message);
    return { filas: [], error: error.code === "42501" ? "sin-sesion" : error.message };
  }
  return { filas: data ?? [], error: null };
}

/*
 * Entrar a la liga media al ganar el primer FP del ciclo.
 *
 * Se llama justo después de otorgar FP, no al abrir el tablero: quien empieza a
 * mitad de semana compite por lo que queda de esa semana desde ese instante, no
 * desde el lunes siguiente.
 */
export async function asegurarEntrada(subjectId) {
  if (!supabase || !tieneLigas(subjectId)) return;
  const { error } = await supabase.rpc("liga_entrar", { p_subject: subjectId });
  if (error && error.code !== "42501") {
    console.error("[aprendeFAE] No se pudo entrar a la liga:", error.message);
  }
}

/**
 * Reparte las filas del tablero en lo que la interfaz enseña de cada forma.
 *
 * El podio es público. La posición exacta de quien no está en él es privada: la
 * ve solo esa persona, en su propio espacio. A ~17 por liga el podio son 5
 * puestos, o sea que el 71% no aparece — no salir es lo normal, no una señal.
 */
export function repartir(filas) {
  const podio = filas.filter((f) => f.en_podio);
  const tuya = filas.find((f) => f.es_tuyo) ?? null;
  const meta = filas[0] ?? null;
  const restantes = meta ? Math.max(0, meta.tam_liga - podio.length) : 0;
  return {
    podio,
    tuya,
    enPodio: !!tuya?.en_podio,
    liga: meta?.liga ?? null,
    /*
     * ═══════════ `totalLigas` NO SE DEVUELVE, Y ES A PROPÓSITO ═══════════
     *
     * `liga_tablero` también trae `total_ligas`, así que aquí había un
     * `totalLigas: meta?.total_ligas`. Se quitó: el recuento de niveles decide
     * a la vez el NOMBRE del nivel y el MENSAJE de la semana, y dos sitios
     * capaces de responder "cuántos niveles hay" es la forma exacta en que se
     * desincronizan —un lunes con nombre nuevo y texto viejo, o al revés—.
     *
     * La única fuente es `contextoDe()`. Y no se deja aquí "por si acaso":
     * mientras exista, alguien lo va a usar.
     */
    tamLiga: meta?.tam_liga ?? 0,
    restantes,
  };
}
