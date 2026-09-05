/*
 * Catálogo de las 24 medallas.
 *
 * Cada una declara su NIVEL (qué marco se dibuja) y su ICONO o CIFRA (qué logro
 * representa). Son datos independientes a propósito: el mismo icono de ranking
 * sirve a cuatro medallas y lo que las separa es el marco, que sube de base a
 * élite según sube el prestigio.
 *
 * `disparador` dice si la medalla se puede ganar hoy:
 *
 *   "activo"    hay lógica real detrás y se otorga sola.
 *   "pendiente" el diseño está listo pero la condición NO está definida. No
 *               tiene ni puede tener lógica: sale en el perfil, atenuada, y no
 *               se gana. Inventarle una regla sería peor que dejarla apagada,
 *               porque el estudiante la vería moverse por un criterio que nadie
 *               acordó.
 */

export const MEDALLAS = [
  /* ------------------------------- base ------------------------------- */
  { id: "primera-leccion", nivel: "base", icono: "primero", titulo: "Primera lección",
    descripcion: "Completaste tu primera actividad.", disparador: "activo" },
  { id: "primer-avance", nivel: "base", icono: "primero", titulo: "Primer avance",
    descripcion: "Ganaste tus primeros FP.", disparador: "activo" },
  { id: "primer-quiz", nivel: "base", icono: "quiz", titulo: "Primer quiz",
    descripcion: "Completaste tu primera actividad evaluativa.", disparador: "activo" },
  { id: "liga-union", nivel: "base", icono: "liga", titulo: "Se unió a una liga",
    descripcion: "Entraste a tu primera liga.", disparador: "activo" },
  { id: "racha-3", nivel: "base", numero: 3, titulo: "Racha de 3 días",
    descripcion: "Tres días seguidos con actividad.", disparador: "activo" },
  { id: "perfil-completo", nivel: "base", icono: "perfil", titulo: "Perfil completo",
    descripcion: "Condición por definir.", disparador: "pendiente" },

  /* ---------------------------- intermedio ---------------------------- */
  { id: "racha-7", nivel: "intermedio", numero: 7, titulo: "Racha de 7 días",
    descripcion: "Una semana seguida con actividad.", disparador: "activo" },
  { id: "quiz-perfecto", nivel: "intermedio", icono: "quiz", titulo: "Quiz perfecto",
    descripcion: "100% de aciertos en una actividad evaluativa.", disparador: "activo" },
  { id: "liga-top10", nivel: "intermedio", icono: "ranking", titulo: "Top 10 de liga",
    descripcion: "Terminaste entre los diez primeros de tu liga.", disparador: "activo" },
  { id: "modulo-completado", nivel: "intermedio", icono: "modulo", titulo: "Módulo completado",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "semana-completa", nivel: "intermedio", icono: "periodo", titulo: "Semana completa",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "progreso-constante", nivel: "intermedio", icono: "tendencia", titulo: "Progreso constante",
    descripcion: "Condición por definir.", disparador: "pendiente" },

  /* ----------------------------- avanzado ----------------------------- */
  { id: "racha-14", nivel: "avanzado", numero: 14, titulo: "Racha de 14 días",
    descripcion: "Dos semanas seguidas con actividad.", disparador: "activo" },
  { id: "liga-top3", nivel: "avanzado", icono: "ranking", titulo: "Top 3 de liga",
    descripcion: "Terminaste entre los tres primeros de tu liga.", disparador: "activo" },
  { id: "curso-completado", nivel: "avanzado", icono: "curso", titulo: "Curso completado",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "aporte-grupo", nivel: "avanzado", icono: "grupo", titulo: "Aporte al grupo",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "desempeno-sostenido", nivel: "avanzado", icono: "tendencia", titulo: "Desempeño sostenido",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "semestre-completo", nivel: "avanzado", icono: "periodo", titulo: "Semestre completo",
    descripcion: "Condición por definir.", disparador: "pendiente" },

  /* ------------------------------- élite ------------------------------- */
  { id: "racha-30", nivel: "elite", numero: 30, titulo: "Racha de 30 días",
    descripcion: "Un mes seguido con actividad.", disparador: "activo" },
  { id: "liga-primero", nivel: "elite", icono: "ranking", titulo: "Primer lugar de liga",
    descripcion: "Terminaste primero de tu liga en un ciclo.", disparador: "activo" },
  { id: "primero-semestre", nivel: "elite", icono: "ranking", titulo: "Primer lugar del semestre",
    descripcion: "Terminaste primero de tu liga en el semestre. Es por materia, nunca combinado.",
    disparador: "activo" },
  { id: "desempeno-elite", nivel: "elite", icono: "tendencia", titulo: "Desempeño élite",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "dominio-total", nivel: "elite", icono: "dominio", titulo: "Dominio total",
    descripcion: "Condición por definir.", disparador: "pendiente" },
  { id: "todas-las-medallas", nivel: "elite", icono: "meta", titulo: "Todas las medallas",
    descripcion: "Conseguiste todas las demás medallas que se pueden ganar hoy.",
    disparador: "activo" },
];

/* Las que hoy tienen lógica detrás. Las demás salen atenuadas y no se mueven. */
export const CON_DISPARADOR = new Set(
  MEDALLAS.filter((m) => m.disparador === "activo").map((m) => m.id)
);

/*
 * "Todas las medallas" no se cuenta a sí misma ni cuenta las pendientes: si lo
 * hiciera sería inalcanzable por definición, que es el mismo error que ya
 * costó encontrar en el 100% del dashboard.
 */
export const PARA_EL_META = MEDALLAS
  .filter((m) => m.disparador === "activo" && m.id !== "todas-las-medallas")
  .map((m) => m.id);

export const POR_NIVEL = (nivel) => MEDALLAS.filter((m) => m.nivel === nivel);
