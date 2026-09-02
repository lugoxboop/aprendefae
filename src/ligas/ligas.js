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
 * Nombres neutros. La estructura tiene jerarquía —se sube y se baja— pero la
 * interfaz no la anuncia: "Oro" y "Bronce" se quedan pegados a la persona en un
 * grupo donde todos se conocen, y un número no.
 */
export const nombreLiga = (liga) => `Grupo ${liga}`;

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
    totalLigas: meta?.total_ligas ?? null,
    tamLiga: meta?.tam_liga ?? 0,
    restantes,
  };
}
