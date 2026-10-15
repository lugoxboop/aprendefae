/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LECTURA DE LOS PAQUETES DE KATSUMI Y RECORRIDO DE UNA PIEZA.
 *
 * Lo comparten las pruebas de A0, A1 y A2. No es una prueba: no termina en
 * .test.mjs.
 *
 *   · leerSecciones(md)  las pantallas «**Pn · …**» de la sección «Contenido,
 *     pantalla por pantalla»: sus textos de pantalla (los que llevan su
 *     INFLESZ detrás, «(85,0)» o «(<10)»), en orden, y sus pies
 *   · cambiosDe(pieza)   los archivos de cambios de una pieza que hay en la
 *     carpeta de paquetes. Las pruebas exigen conocerlos TODOS: un archivo de
 *     cambios nuevo pone la prueba en rojo hasta que alguien lo aplique
 *   · textosDeDatos(p)   lo que dice una pantalla de los datos, en el orden
 *     en que la vista lo pinta (con lo que sale solo al acertar)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

export const RAIZ = new URL("../../../", import.meta.url);
export const PAQUETES = "orquestador/conocimiento/paquetes/";
export const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");

/* Un texto entre comillas angulares, con una comilla anidada como mucho («Siguiente: «La caja».»). */
export const CITA = "«((?:[^«»]|«[^«»]*»)*)»";

export const textosConMedida = (bloque) => [...bloque.matchAll(new RegExp(`${CITA}\\s*\\((?:<10|\\d+,\\d)`, "g"))].map((m) => m[1]);
export const piesDe = (bloque) => [...bloque.matchAll(new RegExp(`^- Pie[^:]*: ${CITA}`, "gm"))].map((m) => m[1]);

/* Las pantallas de la v1, por su clave («P0»…), cada una con sus textos y sus pies. */
export function leerSecciones(md) {
  const contenido = md.slice(md.indexOf("## Contenido, pantalla por pantalla"), md.indexOf("\n## ", md.indexOf("## Contenido, pantalla por pantalla") + 5));
  /* P\d+: A2 llega a P10. */
  return Object.fromEntries(contenido.split(/\n(?=\*\*P\d)/).slice(1).map((s) => [s.match(/^\*\*(P\d+)/)[1], { bloque: s, textos: textosConMedida(s), pies: piesDe(s) }]));
}

/* Los archivos de cambios de una pieza («d4-t4-a1-v2-cambios.md»…), en orden de versión. */
export function cambiosDe(pieza) {
  return readdirSync(new URL(PAQUETES, RAIZ))
    .filter((f) => new RegExp(`^d4-t4-${pieza}-v\\d+-cambios\\.md$`).test(f))
    .sort((a, b) => Number(a.match(/-v(\d+)-/)[1]) - Number(b.match(/-v(\d+)-/)[1]));
}

/* Lo que una pantalla de los datos dice, en el orden en que la vista lo pinta (pregunta y opciones al final). */
export function textosDeDatos(p) {
  return [
    p.objetivo, ...(p.parrafos ?? []),
    /* La glosa de un renglón de la lista va justo debajo de él (A4, «girar»). */
    ...(p.listaNumerada ?? []).flatMap((t, k) => (p.glosaDeLista?.renglon === k ? [t, p.glosaDeLista.texto] : [t])),
    ...(p.despues ?? []), ...(p.tras ?? []),
    p.pregunta, ...(p.opciones ?? []).flatMap((o) => [o.texto, o.correcta ? p.acierto.texto : o.devolucion]),
    ...(p.trasAcertar?.textos ?? []),
    ...(p.trasAcertar?.grupos ?? []).flatMap((g) => [g.titulo, ...g.causas]),
    p.siguiente,
  ].filter(Boolean);
}

/*
 * El blob de un archivo en la punta de la rama de Katsumi, si este clon la
 * tiene (en CI no la tiene, y entonces devuelve null). Sirve para saber si la
 * copia del paquete es la última versión aprobada.
 */
export const RAMA_FUENTE = "feat/conta-d4-mapa-fuente";
export function blobEnLaRamaFuente(archivo) {
  try {
    return execFileSync("git", ["rev-parse", `${RAMA_FUENTE}:${PAQUETES}${archivo}`], { cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}
export function archivosEnLaRamaFuente() {
  try {
    return execFileSync("git", ["ls-tree", "--name-only", `${RAMA_FUENTE}:${PAQUETES}`], { cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean);
  } catch {
    return null;
  }
}
export const blobDeLaCopia = (archivo) => execFileSync("git", ["hash-object", `${PAQUETES}${archivo}`], { cwd: RAIZ }).toString().trim();
