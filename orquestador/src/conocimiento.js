import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BASE DE CONOCIMIENTO, ARMADA EN BLOQUES CACHEABLES.
 *
 * El Kit, el vocabulario y las decisiones cerradas se repiten en CADA llamada.
 * Mandarlos sin cachear los cobra a precio completo una y otra vez; cacheados
 * cuestan la décima parte de leerlos.
 *
 * ═══════════ EL ORDEN DE LOS BLOQUES ES EL AHORRO ═══════════
 *
 * La caché es un prefijo: cualquier byte que cambie invalida todo lo que viene
 * después. Así que va primero lo que NO cambia entre roles —el Kit, las
 * decisiones— y después lo que sí —el rol, el vocabulario de la materia—.
 *
 *   bloque 1  Kit + decisiones        igual para todos los roles  → una caché
 *   bloque 2  rol + vocabulario       distinto por rol            → una por rol
 *
 * Al revés, con el rol delante, cada rol invalidaría el Kit y la caché del Kit
 * no serviría de nada.
 *
 * ═══════════ Y LA CACHÉ ES POR MODELO ═══════════
 *
 * Dos roles con modelos distintos NO comparten caché, aunque el texto sea
 * idéntico. Por eso mover un paso a un modelo más barato solo ahorra si ese
 * paso no necesita el Kit; si lo necesita, paga su propia escritura de caché y
 * puede salir más caro que dejarlo donde estaba.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ_CONOCIMIENTO = path.join(AQUI, "..", "conocimiento");

/*
 * Una hora, no los cinco minutos por defecto. Entre un salto y el siguiente hay
 * una llamada entera a un modelo que razona: con la TTL corta, la caché expira
 * justo entre hops y se paga la escritura cada vez sin llegar a leerla nunca.
 */
export const TTL_CACHE = "1h";

const leerDe = (raiz, ...partes) => {
  const ruta = path.join(raiz, ...partes);
  if (!fs.existsSync(ruta)) {
    throw new Error(`falta un archivo de la base de conocimiento: ${path.join(...partes)}`);
  }
  return fs.readFileSync(ruta, "utf8");
};

/*
 * La procedencia sale del encabezado del archivo, no de una lista aparte: una
 * segunda lista se desincroniza del archivo y entonces el orquestador cree que
 * algo es verbatim cuando ya no lo es.
 */
export function procedenciaDe(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const p = m[1].match(/^procedencia:[ \t]*(.+)$/m);
  return p ? p[1].trim() : null;
}

/*
 * `raiz` es un parámetro para que la prueba pueda apuntar a una carpeta vacía y
 * comprobar de verdad que faltar un archivo se cae. Sin eso, la guarda de abajo
 * no tendría forma de ejercitarse y sería una promesa sin comprobar.
 */
export function cargarConocimiento({ materia = null, raiz = RAIZ_CONOCIMIENTO } = {}) {
  const leer = (...partes) => leerDe(raiz, ...partes);
  const kit = leer("kit.md");
  const decisiones = leer("decisiones.md");

  let vocabulario = null;
  if (materia) {
    const archivo = path.join("vocabulario", `${materia}.md`);
    const ruta = path.join(raiz, archivo);
    /*
     * Que falte el vocabulario de una materia NO es un error: una materia nueva
     * todavía no tiene ninguno. Pero se dice, porque una cadena que corre sin
     * el vocabulario establecido puede reinventar un signo que ya significa
     * otra cosa, y eso no falla — solo sale mal.
     */
    vocabulario = fs.existsSync(ruta)
      ? { materia, texto: fs.readFileSync(ruta, "utf8") }
      : { materia, texto: null };
  }

  const roles = {};
  for (const archivo of fs.readdirSync(path.join(raiz, "roles"))) {
    if (!archivo.endsWith(".md")) continue;
    const id = path.basename(archivo, ".md");
    roles[id] = leer("roles", archivo);
  }

  return { kit, decisiones, vocabulario, roles };
}

/*
 * El bloque compartido, con su marca de caché. Es el prefijo: si esto cambia,
 * se invalida todo lo demás, así que aquí no entra nada que dependa de la
 * corrida —ni la fecha, ni el id de la orden, ni el nombre del tema—.
 */
export function bloqueCompartido(conocimiento) {
  return {
    type: "text",
    text: [
      "# Base de conocimiento de AprendeFAE",
      "",
      "Lo que sigue es el contexto permanente del equipo. No es la tarea.",
      "",
      conocimiento.kit,
      "",
      conocimiento.decisiones,
    ].join("\n"),
    cache_control: { type: "ephemeral", ttl: TTL_CACHE },
  };
}

/* El bloque por rol: su prompt y, si la hay, el vocabulario de la materia. */
export function bloqueDeRol(conocimiento, rolId) {
  const rol = conocimiento.roles[rolId];
  if (!rol) throw new Error(`no hay prompt para el rol «${rolId}»`);

  const partes = [rol];
  if (conocimiento.vocabulario) {
    partes.push("");
    partes.push(conocimiento.vocabulario.texto ?? [
      `# Vocabulario visual — ${conocimiento.vocabulario.materia}`,
      "",
      "**No hay vocabulario registrado para esta materia.** Es una materia nueva",
      "o nadie lo ha escrito todavía. Si propones un signo visual, dilo",
      "explícitamente como propuesta nueva: no hay catálogo contra el que",
      "comprobar que no colisione con otro que ya significa algo.",
    ].join("\n"));
  }

  return {
    type: "text",
    text: partes.join("\n"),
    cache_control: { type: "ephemeral", ttl: TTL_CACHE },
  };
}

/**
 * El `system` completo de una llamada: dos bloques, dos marcas de caché.
 *
 * Son dos y no cuatro a propósito: el límite de la API son cuatro marcas por
 * petición, y gastarlas en trozos pequeños no ahorra nada —lo que se cachea es
 * el prefijo hasta la marca, no el bloque suelto—.
 */
export function sistemaPara(conocimiento, rolId) {
  return [bloqueCompartido(conocimiento), bloqueDeRol(conocimiento, rolId)];
}
