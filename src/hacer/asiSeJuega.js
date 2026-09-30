/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — la marca de «ya la vio».
 *
 * La pantalla sale sola la primera vez que el estudiante abre cada actividad
 * en ese navegador. Después, solo con «¿Cómo se juega?».
 *
 * SE GUARDA EN EL NAVEGADOR, no en el perfil: es una preferencia de esta
 * pantalla en este aparato, no un dato del estudiante — y los datos de los
 * estudiantes no se tocan. Misma convención que el aviso del avatar y las
 * novedades de la tienda: una clave `fae-…`, separada por usuario y por
 * actividad, y todo dentro de try/catch. Si el navegador no deja guardar, la
 * pantalla se muestra y ya: no poder recordarla no es motivo para no enseñarla.
 *
 * El `v1` va en la clave para que, si la demo de una actividad cambia, subirla
 * a `v2` la vuelva a enseñar una vez.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PREFIJO = "fae-asi-se-juega:v1:";

export const claveDe = (actividadId, usuarioId) => `${PREFIJO}${actividadId}:${usuarioId ?? "anonimo"}`;

const almacenPorDefecto = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function yaLaVio(actividadId, usuarioId, almacen = almacenPorDefecto()) {
  try {
    return almacen?.getItem(claveDe(actividadId, usuarioId)) === "visto";
  } catch {
    /* Sin almacenamiento, se enseña esta vez y no se recuerda. */
    return false;
  }
}

export function marcarVista(actividadId, usuarioId, almacen = almacenPorDefecto()) {
  try {
    almacen?.setItem(claveDe(actividadId, usuarioId), "visto");
  } catch {
    /* Que no se pueda recordar no impide enseñarla. */
  }
}
