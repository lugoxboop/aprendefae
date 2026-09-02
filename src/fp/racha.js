/*
 * Racha diaria, del lado de la lectura.
 *
 * La base guarda la racha que había en la última actividad. Eso basta para
 * sumarla, pero no para mostrarla: si alguien lleva cinco días sin entrar, su
 * fila sigue diciendo 7 y el perfil enseñaría un 7 que ya no es cierto.
 *
 * La caducidad se resuelve aquí, al leer, y no con una tarea que ponga rachas a
 * cero cada noche: no hay nada que ejecutar, no hay nada que pueda fallar
 * mientras nadie mira, y el resultado es el mismo.
 */

const DIA_MS = 86400000;

/** Hoy en Bogotá, como AAAA-MM-DD, sin depender de la zona del navegador. */
export function hoyBogota() {
  return new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);
}

function diasEntre(desdeISO, hastaISO) {
  return Math.round((Date.parse(hastaISO) - Date.parse(desdeISO)) / DIA_MS);
}

/**
 * La racha que hay que enseñar.
 *
 * Vale la guardada si la última actividad fue hoy o ayer; si pasó un día
 * completo en blanco, se acabó y es 0. El récord no caduca: es historia.
 */
export function rachaVigente(perfil) {
  if (!perfil?.last_activity_day) return 0;
  const dias = diasEntre(perfil.last_activity_day, hoyBogota());
  return dias <= 1 ? (perfil.streak ?? 0) : 0;
}

/** Los hitos que pagan bono. Los valores viven en la migración 0007. */
export const HITOS = [3, 7, 14, 30];

/** El siguiente hito por alcanzar, o null si ya pasó el último. */
export function proximoHito(racha) {
  return HITOS.find((h) => h > racha) ?? null;
}

/*
 * Si la racha viva se pierde hoy en caso de no hacer nada. Sirve para avisar
 * antes de que pase, que es cuando el aviso todavía sirve de algo.
 */
export function enRiesgoHoy(perfil) {
  if (!perfil?.last_activity_day) return false;
  return rachaVigente(perfil) > 0 && diasEntre(perfil.last_activity_day, hoyBogota()) === 1;
}
