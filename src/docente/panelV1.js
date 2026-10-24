import { alertasDelGrupo, NIVEL } from "./alertas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PANEL DOCENTE v1 (Ukyo, orquestador/conocimiento/prompts/panel-docente-v1.md)
 * — lo que resume la primera pantalla, sin cifras nuevas.
 *
 * Todo sale de lo que el panel ya tenía en memoria (panel_estudiantes, las
 * alertas de alertas.js, el avance por tema) o de panel_actividad, que ya
 * existía. Nada de aquí escribe ni cambia un umbral: solo junta y ordena. Por
 * eso vive aparte de datos.js, alertas.js y bandas.js, que no se tocan (P7).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Los temas que el estudiante no ve (Mateo, 23 oct: Contabilidad se recorta
 * a los cuatro primeros). Lo oculta otra célula; mientras su lista no esté en
 * main, se nombran aquí y solo los usa el avance de la clase. El avance por
 * tema sigue mostrándolos todos, como siempre.
 */
export const TEMAS_OCULTOS_AL_ESTUDIANTE = {
  contabilidad: ["activos-financieros", "cuentas-por-cobrar", "inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2", "repaso-capitulo-5"],
};

/*
 * B1 · «Actividades hechas» (decisión de Yujiro sobre los textos de Katsumi):
 * lo que cuenta avancePorTema, hechas entre total, promediado. Por tema
 * visible, las hechas de toda la cohorte entre las que podría haber hecho
 * (total × cohorte); luego la media simple de los temas. Null si no hay
 * cohorte o temas.
 */
export function avanceDeClase(porTema, nCohorte, subjectId = null) {
  const ocultos = new Set(TEMAS_OCULTOS_AL_ESTUDIANTE[subjectId] ?? []);
  const temas = porTema.filter((t) => !ocultos.has(t.id) && t.total > 0);
  if (!nCohorte || temas.length === 0) return null;
  return temas.reduce((s, t) => s + t.hechas / (t.total * nCohorte), 0) / temas.length * 100;
}

/* La palabra del nivel en la escala de tres de Ukyo (§4, B2). */
export const PALABRA_RIESGO = { [NIVEL.URGENTE]: "Alto", [NIVEL.ATENCION]: "Medio", [NIVEL.INFO]: "Bajo" };

/*
 * El motivo en seis palabras o menos (textos de Katsumi, orquestador/
 * revisiones/panel-docente/textos.md): dice solo lo que la regla comprueba,
 * sin cifras. El detalle con su número sigue en «Ver todas las alertas» (el texto de
 * alertas.js, sin cambios).
 */
export const MOTIVO_CORTO = {
  "Sin actividad más de un ciclo semanal": "Más de una semana sin actividad",
  "Practica, pero no le sale sin apoyo": "Practica, pero acierta poco en evaluativas",
  "Respuestas rápidas y con poco acierto": "Responde rápido y acierta poco",
};

/* «Ver todas las alertas»: el título corto de la regla que todavía no se calcula (Katsumi). */
export const TITULO_SIN_DATOS = { "Abandono repetido a mitad de actividad": "Abandono a mitad: aún sin datos" };

/*
 * B2 · quiénes necesitan atención: UNA fila por estudiante, con su alerta más
 * grave. alertasDelGrupo ya ordena por nivel y, dentro del nivel, por días sin
 * entrar (el más antiguo primero); aquí solo se quita la repetición.
 */
export function necesitanAtencion(cohorte) {
  const vistos = new Set();
  const salida = [];
  for (const a of alertasDelGrupo(cohorte)) {
    if (vistos.has(a.estudiante.user_id)) continue;
    vistos.add(a.estudiante.user_id);
    salida.push({ estudiante: a.estudiante, nivel: a.nivel, titulo: a.titulo, motivo: MOTIVO_CORTO[a.titulo] ?? a.titulo });
  }
  return salida;
}

/*
 * B3 · las N actividades más hechas por la cohorte (Ukyo, salida 2): cuenta
 * cuántos estudiantes de la cohorte tienen cada actividad mirable en su lista.
 * A igualdad, el orden de la materia. Las que nadie hizo no entran.
 */
export function masHechas(cohorte, actividades, n = 6) {
  const cuenta = new Map(actividades.map((a) => [a.id, 0]));
  for (const e of cohorte) for (const id of new Set(e.actividades ?? [])) if (cuenta.has(id)) cuenta.set(id, cuenta.get(id) + 1);
  return actividades
    .map((a, orden) => ({ ...a, orden, hechaPor: cuenta.get(a.id) }))
    .filter((a) => a.hechaPor > 0)
    .sort((a, b) => b.hechaPor - a.hechaPor || a.orden - b.orden)
    .slice(0, n);
}

/* El mismo piso de 5 que ya usa el diagnóstico por pregunta. */
export const MINIMO_TERMINARON = 5;

/* Lo que una actividad dice en B3 y en «Actividades»: lo mismo que la tarjeta LA TERMINARON de VistaRendimiento. */
export function cifrasDeActividad(datos) {
  if (!datos) return null;
  const grupoTotal = Number(datos.grupo_total ?? 0);
  const hayGrupo = grupoTotal > 0;
  return {
    pct: datos.modality === "evaluativa" && datos.pct_medio !== null && datos.pct_medio !== undefined ? Number(datos.pct_medio) : null,
    completaron: Number(datos.completaron ?? 0),
    terminaron: hayGrupo ? Number(datos.en_grupo ?? 0) : Number(datos.completaron ?? 0),
    de: hayGrupo ? grupoTotal : null,
  };
}

/*
 * La peor: el menor acierto medio entre las que tienen al menos 5
 * terminaciones y un acierto que medir. Si ninguna llega, cuántas
 * terminaciones le faltan a la que más tiene.
 */
export function peorActividad(filas) {
  const medibles = filas.filter((f) => f.cifras && f.cifras.pct !== null && f.cifras.completaron >= MINIMO_TERMINARON);
  if (medibles.length > 0) {
    return { peor: [...medibles].sort((a, b) => a.cifras.pct - b.cifras.pct || a.orden - b.orden)[0], faltan: 0 };
  }
  const max = Math.max(0, ...filas.map((f) => f.cifras?.completaron ?? 0));
  return { peor: null, faltan: MINIMO_TERMINARON - max };
}

/* «Actividades»: peor primero (las sin acierto medible, al final, en el orden de la materia). */
export function ordenPeorPrimero(filas) {
  return [...filas].sort((a, b) => {
    const pa = a.cifras?.pct ?? null;
    const pb = b.cifras?.pct ?? null;
    if (pa === null && pb === null) return a.orden - b.orden;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa - pb || a.orden - b.orden;
  });
}

/* «Mis estudiantes»: quien tiene alerta primero (por nivel), luego el resto por la última vez (el más reciente arriba). */
export function ordenEstudiantes(estudiantes, atencion) {
  const rango = new Map(atencion.map((a, i) => [a.estudiante.user_id, i]));
  return [...estudiantes].sort((a, b) => {
    const ra = rango.get(a.user_id);
    const rb = rango.get(b.user_id);
    if (ra !== undefined || rb !== undefined) return (ra ?? Infinity) - (rb ?? Infinity);
    return Number(a.dias_inactivo ?? Infinity) - Number(b.dias_inactivo ?? Infinity);
  });
}
