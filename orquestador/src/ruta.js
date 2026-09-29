/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA RUTA LA DECIDE EL AGENTE. EL CÓDIGO OBEDECE.
 *
 * Este archivo es la única parte del orquestador que decide a dónde va la
 * cadena, y no decide nada: LEE lo que el agente declaró.
 *
 * ═══════════ POR QUÉ NO HAY REGLAS AQUÍ ═══════════
 *
 * La tentación es escribir «si Levi dice NO PASA, llama a Gen». Es una línea y
 * funciona el 90 % de las veces. El 10 % restante es el caso en que Levi dice
 * NO PASA porque el problema es de Xeno, y la regla fija manda el material a
 * quien no puede arreglarlo — y nadie se entera, porque la cadena sigue
 * corriendo.
 *
 * Quien sabe a quién le toca seguir es quien acaba de leer el material. Así que
 * se le pregunta, y se hace lo que diga.
 *
 * ═══════════ Y SI NO SE PUEDE LEER, SE PARA ═══════════
 *
 * Una declaración ilegible NO se interpreta. No se busca la palabra «Gen» en el
 * texto, no se adivina por el contenido, no se cae a un destino por defecto.
 * Adivinar aquí es peor que parar: la cadena seguiría, gastando, hacia un sitio
 * que nadie pidió.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * A dónde puede ir la cadena. Nada fuera de esta lista es una ruta válida.
 *
 * `entregar` y `detener` no son lo mismo, y confundirlos fue un fallo real que
 * salió en la primera corrida simulada:
 *
 *   · `entregar` — el encargo está listo. Solo la compilación puede decirlo.
 *   · `detener`  — hace falta una decisión que no le toca al agente. No hay
 *                  encargo, y eso NO es un fallo: seguir sin esa decisión sí.
 *
 * Sin `entregar`, la compilación terminaba su trabajo y lo único que podía
 * declarar era `detener` — así que una corrida perfecta se reportaba como
 * bloqueada y el encargo se tiraba.
 */
export const DESTINOS = ["gen", "levi", "xeno", "compilacion", "entregar", "detener"];

/** Quién puede declarar `entregar`: solo quien produce el encargo. */
export const PUEDE_ENTREGAR = "compilacion";

/** El bloque que cada agente tiene que escribir al final de su respuesta. */
export const FORMATO_RUTA = `
SIGUIENTE: <${DESTINOS.join(" | ")}>
PORQUE: <una línea, en español>`.trim();

/*
 * Se lee la ÚLTIMA declaración, no la primera.
 *
 * Un agente puede nombrar el formato mientras razona —«podría mandarle esto a
 * Xeno»— y decidir otra cosa al final. La que vale es la del final, que es
 * donde el formato pide que esté.
 */
const LINEA_SIGUIENTE = /^[ \t]*SIGUIENTE[ \t]*:[ \t]*([a-záéíóúñ]+)[ \t]*$/gim;
const LINEA_PORQUE = /^[ \t]*PORQUE[ \t]*:[ \t]*(.+?)[ \t]*$/gim;

const ultimaCoincidencia = (texto, patron) => {
  const todas = [...texto.matchAll(patron)];
  return todas.length ? todas[todas.length - 1] : null;
};

/**
 * Lee la declaración de ruta de una respuesta.
 *
 * Devuelve `{ destino, porque }` o `{ error }`. Nunca devuelve un destino
 * inventado y nunca lanza: quien llama decide qué hacer con el error, y lo que
 * hace es detenerse.
 */
export function leerRuta(respuesta) {
  if (typeof respuesta !== "string" || respuesta.trim() === "") {
    return { error: "la respuesta vino vacía" };
  }

  const m = ultimaCoincidencia(respuesta, LINEA_SIGUIENTE);
  if (!m) {
    return { error: "la respuesta no declara SIGUIENTE en el formato pedido" };
  }

  const destino = m[1].toLowerCase();
  if (!DESTINOS.includes(destino)) {
    return { error: `«${destino}» no es un destino válido (${DESTINOS.join(", ")})` };
  }

  /*
   * El PORQUE no es decorativo: es lo que se lee en el registro cuando hay que
   * entender por qué la cadena fue a donde fue. Sin él, el salto queda sin
   * explicación y auditar la corrida se vuelve adivinar.
   */
  const p = ultimaCoincidencia(respuesta, LINEA_PORQUE);
  if (!p || p[1].trim() === "") {
    return { error: `declara «${destino}» pero no dice por qué` };
  }

  return { destino, porque: p[1].trim() };
}

/** El texto de la declaración, quitado del cuerpo, para no arrastrarlo al hop siguiente. */
export function cuerpoSinRuta(respuesta) {
  return String(respuesta)
    .replace(LINEA_SIGUIENTE, "")
    .replace(LINEA_PORQUE, "")
    .trimEnd();
}
