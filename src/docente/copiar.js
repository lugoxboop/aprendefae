/*
 * Copiar al portapapeles, con el camino de atrás puesto.
 *
 * POR QUÉ ESTO ES UNA ACCIÓN DE VERDAD
 * El panel no puede mandar mensajes todavía: no hay mensajería ni correo de
 * estudiante en la base, y montarlos pide tabla, política de acceso y una
 * migración. Lo que sí puede hacer hoy es dejar el texto listo para pegar
 * donde el profesor ya habla con su clase. La diferencia con «aquí tienes el
 * dato, arréglatelas» es un clic, y ese clic es justo lo que separa un panel
 * que se usa de uno que no.
 *
 * NO SE ASUME QUE FUNCIONA. navigator.clipboard no existe fuera de contexto
 * seguro y puede estar denegado por permisos, así que hay un segundo camino
 * con un textarea oculto, y si los dos fallan se devuelve false para que quien
 * llama pueda enseñar el texto y dejar que lo copien a mano. Un botón que dice
 * «copiado» sin haber copiado nada es peor que no tener botón.
 */
export async function copiar(texto) {
  if (!texto) return false;

  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* Permiso denegado o contexto no seguro: se intenta el camino de atrás. */
  }

  try {
    const doc = globalThis.document;
    if (!doc?.body) return false;
    const area = doc.createElement("textarea");
    area.value = texto;
    /* Fuera de la vista pero dentro del documento: un elemento con display
     * none no se puede seleccionar, y sin selección no hay copia. */
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    doc.body.appendChild(area);
    area.select();
    const ok = doc.execCommand?.("copy") ?? false;
    doc.body.removeChild(area);
    return Boolean(ok);
  } catch {
    return false;
  }
}
