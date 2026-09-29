import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FORMATO_RUTA, PUEDE_ENTREGAR } from "./ruta.js";
import { PRECIOS } from "./topes.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ROLES: quién corre con qué modelo, con cuánto esfuerzo y con qué manos.
 *
 * El QUÉ MODELO no vive aquí: vive en `modelos.json`, al lado. Este archivo
 * dice qué pasos existen y qué puede hacer cada uno; el archivo de al lado dice
 * en qué modelo corre cada uno, y se edita sin tocar código.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RUTA_MODELOS = path.join(AQUI, "..", "modelos.json");

/*
 * ═══════════ LOS PASOS QUE HAY QUE ASIGNAR ═══════════
 *
 * Los cuatro roles de la cadena más el intérprete, que no es un rol —no tiene
 * prompt ni ruta— pero sí es una llamada al modelo y por tanto una decisión de
 * costo que tiene que ser visible en el mismo sitio que las demás.
 */
export const PASOS = ["gen", "levi", "xeno", "compilacion", "interprete"];

/*
 * ═══════════ POR QUÉ SE VALIDA TAN FUERTE ═══════════
 *
 * Las dos formas de que esto salga mal son silenciosas, y las dos cuestan
 * dinero antes de notarse:
 *
 *   · Un modelo que no está en PRECIOS. La corrida arranca, gasta, y revienta
 *     en `anotarUso` a mitad de camino —o peor, si alguien quita el `throw` de
 *     allí, corre entera y reporta cero dólares.
 *
 *   · Un nombre de paso mal escrito («compilación» con tilde). Si se ignorara,
 *     ese paso se quedaría en el modelo por defecto y el archivo diría una cosa
 *     mientras la corrida hace otra. Eso es lo peor de todo: una configuración
 *     que miente.
 *
 * Así que las dos se rechazan ANTES de la primera llamada, con el nombre del
 * archivo que hay que arreglar.
 */
export function leerModelos(ruta = RUTA_MODELOS) {
  if (!fs.existsSync(ruta)) {
    throw new Error(`falta ${path.basename(ruta)}: no sé en qué modelo correr cada paso`);
  }

  let crudo;
  try {
    crudo = JSON.parse(fs.readFileSync(ruta, "utf8"));
  } catch (e) {
    throw new Error(`${path.basename(ruta)} no es un JSON válido: ${e.message}`);
  }

  const modelos = {};
  const sobran = [];
  for (const [clave, valor] of Object.entries(crudo)) {
    /* Las claves que empiezan por «_» son comentarios para quien lo edite. */
    if (clave.startsWith("_")) continue;
    if (!PASOS.includes(clave)) {
      sobran.push(clave);
      continue;
    }
    if (!PRECIOS[valor]) {
      throw new Error(
        `${path.basename(ruta)}: «${valor}» (para ${clave}) no tiene precio en topes.js. `
        + `Los que sí: ${Object.keys(PRECIOS).join(", ")}. `
        + "Sin precio no se puede contar el gasto, así que no se arranca.",
      );
    }
    modelos[clave] = valor;
  }

  if (sobran.length) {
    throw new Error(
      `${path.basename(ruta)}: no sé qué paso es «${sobran.join("», «")}». `
      + `Los pasos son: ${PASOS.join(", ")}. `
      + "Un nombre mal escrito dejaría ese paso en otro modelo sin avisar.",
    );
  }

  const faltan = PASOS.filter((p) => !modelos[p]);
  if (faltan.length) {
    throw new Error(
      `${path.basename(ruta)}: falta decir en qué modelo corre «${faltan.join("», «")}».`,
    );
  }

  return modelos;
}

export const MODELOS = leerModelos();

/*
 * ═══════════ LA ASIGNACIÓN DE AHORA, Y LO QUE CUESTA ═══════════
 *
 * Gen y Xeno en Sonnet, Levi y compilación en Opus. Recomendación de Stanley,
 * aprobada por Mateo el 29 de septiembre de 2026.
 *
 * Y hay un costo que no se ve y conviene dejar escrito donde se toma la
 * decisión: LA CACHÉ ES POR MODELO. El Kit y las decisiones son el mismo texto
 * para todos los roles, pero partir la cadena en dos modelos los cachea DOS
 * VECES —una para el bloque de Sonnet, otra para el de Opus— en vez de una.
 *
 * Eso NO hace que la partición salga a perder: la escritura de caché se paga
 * una vez por corrida y lo que se ahorra son todos los turnos de Gen y Xeno,
 * que son los más numerosos. Pero es un gasto fijo extra al principio de cada
 * corrida, y quien mire la factura tiene que saber de dónde sale.
 *
 * El intérprete se queda en el modelo capaz por una razón distinta: su trabajo
 * es NEGARSE a adivinar cuando la orden es ambigua, y una clasificación que se
 * equivoca hacia «ya entendí» arranca una cadena entera hacia el tema
 * equivocado. Además no lleva el Kit —solo el catálogo—, así que no escribe
 * caché y bajarlo de modelo no ahorraría casi nada.
 */
export const ROLES = {
  gen: {
    id: "gen",
    nombre: "Gen",
    modelo: MODELOS.gen,
    esfuerzo: "high",
    herramientas: [],
  },
  levi: {
    id: "levi",
    nombre: "Levi",
    modelo: MODELOS.levi,
    esfuerzo: "high",
    herramientas: [],
  },
  xeno: {
    id: "xeno",
    nombre: "Xeno",
    modelo: MODELOS.xeno,
    esfuerzo: "high",
    herramientas: [],
  },
  compilacion: {
    id: "compilacion",
    nombre: "Compilación",
    /*
     * El paso que más importa, y el único con manos. `xhigh` y no `high`: es
     * donde el razonamiento se paga solo, porque es el que tiene que notar que
     * dos documentos se contradicen antes de que nadie construya nada.
     */
    modelo: MODELOS.compilacion,
    esfuerzo: "xhigh",
    herramientas: ["leer_archivo", "buscar_en_repo", "calcular"],
  },
};

/** El modelo del intérprete. No es un rol: no tiene prompt ni declara ruta. */
export const MODELO_INTERPRETE = MODELOS.interprete;

/*
 * ═══════════ LA INSTRUCCIÓN DE RUTA VA EN EL MENSAJE, NO EN EL SYSTEM ═══════
 *
 * El `system` es lo que se cachea y no cambia. La instrucción de ruta cambia
 * poco, pero si viviera ahí y algún día se ajustara, invalidaría la caché del
 * Kit entero para todos los roles a la vez. Va al final del turno del usuario,
 * que es lo barato de cambiar.
 */
export function instruccionDeRuta(rolId) {
  const otros = Object.values(ROLES)
    .filter((r) => r.id !== rolId)
    .map((r) => `${r.id} (${r.nombre})`)
    .join(", ");

  return [
    "",
    "───────────────────────────────────────",
    "ANTES DE TERMINAR — a quién le toca seguir",
    "───────────────────────────────────────",
    "",
    "Termina tu respuesta con estas dos líneas, exactamente en este formato y",
    "sin nada después:",
    "",
    FORMATO_RUTA,
    "",
    `Puedes mandarlo a: ${otros}.`,
    ...(rolId === PUEDE_ENTREGAR
      ? [
        "",
        "Y a `entregar` cuando el encargo maestro esté terminado. Eso cierra la",
        "corrida y lo que escribiste se guarda como el encargo.",
      ]
      : [
        "También a `compilacion`, cuando el material ya esté listo para",
        "convertirse en un encargo de construcción.",
      ]),
    "",
    "Y a `detener` cuando haga falta una decisión que no te corresponde: un",
    "conflicto entre documentos, un dato que nadie puede verificar, una",
    "aprobación de Mateo. Detener no es fallar — seguir sin esa decisión sí.",
    "",
    ...(rolId === PUEDE_ENTREGAR
      ? [
        "`entregar` y `detener` no son lo mismo. Si el encargo está listo, es",
        "`entregar`; si falta una decisión, es `detener` y el encargo no sale.",
        "",
      ]
      : []),
    "",
    "La decisión de a quién sigue es tuya. El orquestador hace lo que digas y",
    "no interpreta: si estas dos líneas no están, la cadena se para ahí.",
  ].join("\n");
}
