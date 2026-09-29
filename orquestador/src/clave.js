import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CLAVE DE API.
 *
 * El SDK NO lee archivos `.env` por su cuenta — está dicho en su propia
 * documentación. Así que hay que leerlo aquí, y hacerlo bien, porque las dos
 * formas de equivocarse son silenciosas:
 *
 * ═══════════ EL BOM ═══════════
 *
 * PowerShell escribe UTF-8 con marca de orden de bytes. Esos tres bytes
 * invisibles van pegados al principio de la primera línea, así que el nombre
 * de la variable no es `ANTHROPIC_API_KEY` sino `﻿ANTHROPIC_API_KEY`. El
 * archivo se ve perfecto al abrirlo, la clave está entera, y la variable sale
 * vacía. El .env de este proyecto llegó exactamente así.
 *
 * ═══════════ EL VALOR QUE NO SE COMPRUEBA ═══════════
 *
 * Una clave recortada al copiarla, o con una comilla pegada, produce un 401
 * que parece un problema de la cuenta. Aquí se comprueba la FORMA antes de
 * llamar: no garantiza que la clave sirva, pero separa «está mal copiada» de
 * «la cuenta no autoriza», que son dos problemas distintos y se arreglan en
 * sitios distintos.
 *
 * ═══════════ Y NUNCA SE IMPRIME ═══════════
 *
 * Ni entera ni a medias. Los mensajes de error hablan del archivo, de la
 * variable y del largo — nunca del valor. Un secreto que aparece en una
 * consola acaba en una captura de pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RUTA_ENV = path.join(AQUI, "..", ".env");

/** Lee un `.env` a un objeto. Tolera BOM, CRLF, comillas y comentarios. */
export function leerEnv(ruta = RUTA_ENV) {
  if (!fs.existsSync(ruta)) return {};
  const texto = fs.readFileSync(ruta, "utf8").replace(/^﻿/, "");
  const fuera = {};
  for (const linea of texto.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const clave = t.slice(0, i).trim().replace(/^﻿/, "");
    let valor = t.slice(i + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"'))
      || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (clave) fuera[clave] = valor;
  }
  return fuera;
}

/* La forma que tiene una clave de la API. No prueba que sirva; prueba que no
   está recortada ni pegada a otra cosa. */
const PREFIJO = "sk-ant-";
const LARGO_MINIMO = 40;

export function revisarForma(valor) {
  if (!valor) return "está vacía";
  if (/\s/.test(valor)) return "tiene un espacio o un salto de línea dentro";
  if (/^["']|["']$/.test(valor)) return "conserva las comillas alrededor";
  if (!valor.startsWith(PREFIJO)) return `no empieza por «${PREFIJO}»`;
  if (valor.length < LARGO_MINIMO) return `mide ${valor.length} caracteres y parece recortada`;
  return null;
}

/**
 * Deja `ANTHROPIC_API_KEY` en el entorno del proceso, leyéndola del `.env` si
 * no venía ya de fuera.
 *
 * Devuelve `{ ok }` o `{ ok: false, porque }`, con un porqué que se puede leer
 * sin saber programar y sin que aparezca la clave por ninguna parte.
 *
 * El entorno GANA sobre el archivo: quien exporta la variable a mano lo hace a
 * propósito —para probar otra cuenta, para una corrida suelta— y un archivo
 * que la pisara por detrás sería muy difícil de entender.
 */
export function cargarClave({ ruta = RUTA_ENV, entorno = process.env } = {}) {
  const deFuera = entorno.ANTHROPIC_API_KEY;
  if (deFuera) {
    const mal = revisarForma(deFuera);
    return mal
      ? { ok: false, porque: `la ANTHROPIC_API_KEY del entorno ${mal}`, origen: "entorno" }
      : { ok: true, origen: "entorno", largo: deFuera.length };
  }

  if (!fs.existsSync(ruta)) {
    return {
      ok: false,
      origen: "ninguno",
      porque: `no hay ANTHROPIC_API_KEY en el entorno y no existe ${path.basename(ruta)}`,
    };
  }

  const env = leerEnv(ruta);
  const valor = env.ANTHROPIC_API_KEY;
  if (!valor) {
    /*
     * El archivo existe y la variable no aparece. La causa más probable es el
     * BOM, así que se dice: un «no encuentro la variable» a secas manda a
     * buscar el error donde no está.
     */
    const bruto = fs.readFileSync(ruta);
    const conBom = bruto.length >= 3 && bruto[0] === 0xEF && bruto[1] === 0xBB && bruto[2] === 0xBF;
    return {
      ok: false,
      origen: "archivo",
      porque: conBom
        ? `${path.basename(ruta)} empieza con una marca de bytes (BOM) y el nombre de la variable queda pegado a ella`
        : `${path.basename(ruta)} existe pero no define ANTHROPIC_API_KEY (encontré: ${Object.keys(env).join(", ") || "nada"})`,
    };
  }

  const mal = revisarForma(valor);
  if (mal) {
    return { ok: false, origen: "archivo", porque: `la clave de ${path.basename(ruta)} ${mal}` };
  }

  entorno.ANTHROPIC_API_KEY = valor;
  if (env.ANTHROPIC_WORKSPACE_ID && !entorno.ANTHROPIC_WORKSPACE_ID) {
    entorno.ANTHROPIC_WORKSPACE_ID = env.ANTHROPIC_WORKSPACE_ID;
  }
  return { ok: true, origen: "archivo", largo: valor.length };
}

/*
 * ═══════════ EL ESPACIO DE TRABAJO ═══════════
 *
 * Una clave de ORGANIZACIÓN no dice por sí sola a qué espacio de trabajo
 * cargar el gasto, y la API la rechaza con un 400 —no un 401— pidiendo la
 * cabecera `anthropic-workspace-id`. La distinción importa: 401 es «la clave no
 * sirve», 400 es «la clave sirve y le falta un dato», y se arreglan en sitios
 * distintos.
 *
 * Una clave ya acotada a un espacio de trabajo no necesita nada de esto.
 */
export const IDENTIFICADOR_FALTANTE = /not scoped to a workspace/i;

export function cabecerasDelCliente(entorno = process.env) {
  const id = entorno.ANTHROPIC_WORKSPACE_ID;
  return id ? { "anthropic-workspace-id": id } : undefined;
}

export function comoArreglarElEspacio() {
  return [
    "La clave es válida, pero es de organización: no dice a qué espacio de",
    "trabajo cargar el gasto, y la API no elige uno por su cuenta.",
    "",
    "Dos formas de arreglarlo, cualquiera vale:",
    "",
    "  a) Añade el identificador al .env, en su propia línea:",
    "",
    "       ANTHROPIC_WORKSPACE_ID=wrkspc_...",
    "",
    "     Está en console.anthropic.com, en Settings → Workspaces, dentro del",
    "     espacio que quieras usar.",
    "",
    "  b) O crea en la consola una clave ya acotada a un espacio de trabajo y",
    "     reemplaza la del .env. Entonces no hace falta el identificador.",
  ].join("\n");
}

/** El mensaje para la consola cuando no hay clave. Sin secretos dentro. */
export function comoArreglarlo(resultado) {
  return [
    `No puedo llamar al modelo: ${resultado.porque}.`,
    "",
    `Pon la clave en ${RUTA_ENV}, en una sola línea y sin comillas:`,
    "",
    "    ANTHROPIC_API_KEY=sk-ant-...",
    "",
    "Guárdalo en UTF-8 SIN BOM. Desde PowerShell, el `>` y `Set-Content` a secas",
    "meten un BOM que deja la variable vacía sin que se note. Esto no:",
    "",
    "    [IO.File]::WriteAllText(\"$PWD\\.env\", \"ANTHROPIC_API_KEY=sk-ant-...`n\")",
    "",
    "El archivo está en .gitignore y no se sube.",
  ].join("\n");
}
