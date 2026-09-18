/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVISO DE LA PRIMERA VEZ: «Puedes personalizar tu avatar».
 *
 * Una línea en el panel de perfil, descartable, que no vuelve. NO es un modal,
 * no bloquea nada y no hay flujo obligatorio de elección al entrar por primera
 * vez: todo estudiante nuevo nace con Decaedro · Nocturno · Nivel I, que es una
 * combinación completa y presentable. Obligar a elegir un avatar antes de
 * empezar convertiría un adorno en un peaje.
 *
 * SE GUARDA EN EL NAVEGADOR, no en el perfil. Es una preferencia de esta
 * pantalla en este aparato, no un dato del estudiante: no vale una columna ni
 * un viaje al servidor, y si alguien entra desde otro teléfono y vuelve a ver
 * la línea una vez, no pasa nada. Todo va envuelto en try/catch porque en
 * navegación privada el acceso mismo puede lanzar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CLAVE_AVISO = "fae-aviso-avatar";
export const AVISO_AVATAR = "Puedes personalizar tu avatar";

export function avisoPendiente(almacen = globalThis.localStorage) {
  try {
    return almacen?.getItem(CLAVE_AVISO) !== "visto";
  } catch {
    /* Sin almacenamiento, el aviso se enseña esta vez y no se recuerda. */
    return true;
  }
}

export function descartarAviso(almacen = globalThis.localStorage) {
  try {
    almacen?.setItem(CLAVE_AVISO, "visto");
  } catch {
    /* Que no se pueda recordar no es motivo para que el aviso no se cierre. */
  }
}
