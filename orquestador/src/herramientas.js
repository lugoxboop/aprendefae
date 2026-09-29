import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MANOS DE LA COMPILACIÓN.
 *
 * El paso de compilación no puede trabajar solo comparando texto entre
 * documentos. Los errores que de verdad han llegado a producción en este
 * proyecto se atraparon sumando cifras y abriendo archivos, no leyendo prosa.
 * Así que tiene tres herramientas: leer, buscar y calcular.
 *
 * ═══════════ QUÉ PUEDE Y QUÉ NO ═══════════
 *
 * Puede LEER el repositorio y CALCULAR con lo que lee. No puede escribir, no
 * puede publicar, no puede correr migraciones y no puede salir a la red.
 *
 * `calcular` ejecuta código que escribe un modelo, en esta máquina. Eso es lo
 * más peligroso de toda la herramienta y conviene decirlo sin adornos. Lo que
 * hay contra eso:
 *
 *   · Corre en un proceso aparte, con tope de tiempo y de salida.
 *   · Corre con el repo como directorio, así que puede importar sus datos.
 *   · Después de cada ejecución se comprueba el árbol de git. Si algo cambió,
 *     se reporta como violación y la corrida se detiene.
 *
 * Eso DETECTA, no impide. Un sandbox de verdad necesita un contenedor, y eso
 * es una decisión de infraestructura que no me corresponde tomar solo. Queda
 * dicho aquí para que se tome a sabiendas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MS_TOPE = 20000;
const SALIDA_TOPE = 20000;
const ARCHIVO_TOPE = 400000;

/* El repo es la raíz: dos niveles arriba de este archivo. */
export const raizDelRepo = (aqui) => path.resolve(aqui, "..", "..");

const dentroDelRepo = (raiz, relativa) => {
  const destino = path.resolve(raiz, relativa);
  const conBarra = raiz.endsWith(path.sep) ? raiz : raiz + path.sep;
  if (!destino.startsWith(conBarra)) {
    throw new Error(`«${relativa}» sale del repositorio`);
  }
  return destino;
};

export const DEFINICIONES = [
  {
    name: "leer_archivo",
    description:
      "Lee un archivo del repositorio de AprendeFAE. La ruta es relativa a la raíz del repo, "
      + "por ejemplo «src/data/subjects.js». Solo lectura.",
    input_schema: {
      type: "object",
      properties: {
        ruta: { type: "string", description: "Ruta relativa a la raíz del repositorio." },
      },
      required: ["ruta"],
      additionalProperties: false,
    },
  },
  {
    name: "buscar_en_repo",
    description:
      "Busca un texto o expresión regular en el repositorio y devuelve las líneas que coinciden, "
      + "con su archivo y número de línea. Útil para comprobar si un id, una cifra o un nombre existe.",
    input_schema: {
      type: "object",
      properties: {
        patron: { type: "string", description: "Texto o expresión regular a buscar." },
        carpeta: { type: "string", description: "Carpeta donde buscar. Por defecto «src»." },
      },
      required: ["patron"],
      additionalProperties: false,
    },
  },
  {
    name: "calcular",
    description:
      "Ejecuta un fragmento de JavaScript (módulo ES) y devuelve lo que imprima. Úsalo para COMPROBAR "
      + "cifras: importa los datos del repositorio y suma, cuenta o compara. No escribe nada ni sale a la red.\n\n"
      + "Tienes disponible `repo(ruta)`, que importa un módulo del repositorio por su ruta desde la raíz. "
      + "ÚSALO en vez de un import relativo:\n\n"
      + "  const { SUBJECTS } = await repo('src/data/subjects.js');\n"
      + "  console.log(Object.keys(SUBJECTS));\n\n"
      + "Un `import('./src/...')` relativo NO funciona: el fragmento no corre desde la raíz del repo.\n"
      + "Imprime siempre con console.log — lo que no se imprime no vuelve.",
    input_schema: {
      type: "object",
      properties: {
        codigo: { type: "string", description: "Código JavaScript (ESM). Usa `repo('ruta/desde/la/raiz.js')` para los módulos del repositorio." },
      },
      required: ["codigo"],
      additionalProperties: false,
    },
  },
];

/*
 * ═══════════ POR QUÉ HAY UN `repo()` Y NO IMPORTS RELATIVOS ═══════════
 *
 * El fragmento se escribe en un archivo temporal, y un `import('./src/...')`
 * resuelve contra la carpeta DE ESE ARCHIVO, no contra el repositorio. La
 * primera prueba contra el repo de verdad se estrelló justo ahí: el modelo
 * escribe lo obvio y recibe un «Cannot find module» que no explica nada.
 *
 * Con este prólogo, la ruta se da desde la raíz del repo y funciona esté donde
 * esté el temporal. La descripción de la herramienta lo dice, para que el
 * modelo no tenga que descubrirlo gastando vueltas.
 */
/*
 * Dónde se escribe el fragmento. Se exporta para que la prueba compruebe que
 * ESTA ruta está ignorada por git, y no una escrita a mano: con la ruta
 * duplicada en la prueba, mover el temporal a la raíz no rompía nada y el
 * archivo quedaba a la vista del repo mientras el cálculo corría.
 */
export const rutaTemporal = (raiz) => path.join(raiz, "node_modules", ".calculo-orquestador.mjs");

const PROLOGO = (raiz) => [
  "import { pathToFileURL as __url } from 'node:url';",
  "import __path from 'node:path';",
  `const __RAIZ = ${JSON.stringify(raiz)};`,
  "const repo = (r) => import(__url(__path.join(__RAIZ, r)).href);",
  "",
].join("\n");

/* Si el árbol de git no está limpio, la compilación tocó algo que no debía. */
function arbolDeGit(raiz) {
  try {
    return execFileSync("git", ["status", "--porcelain"], {
      cwd: raiz, encoding: "utf8", timeout: 10000,
    }).trim();
  } catch {
    return null; /* sin git no se puede comprobar; se dice, no se finge. */
  }
}

export function crearHerramientas(raiz, { alViolar } = {}) {
  const antesDeTodo = arbolDeGit(raiz);

  const comprobarQueNoEscribio = (queHizo) => {
    const ahora = arbolDeGit(raiz);
    if (antesDeTodo === null || ahora === null) return null;
    if (ahora === antesDeTodo) return null;
    const violacion = `«${queHizo}» modificó el repositorio. Antes:\n${antesDeTodo || "(limpio)"}\nDespués:\n${ahora}`;
    alViolar?.(violacion);
    return violacion;
  };

  return {
    definiciones: DEFINICIONES,

    async ejecutar(nombre, entrada) {
      if (nombre === "leer_archivo") {
        const destino = dentroDelRepo(raiz, entrada.ruta);
        if (!fs.existsSync(destino)) return `No existe: ${entrada.ruta}`;
        if (fs.statSync(destino).isDirectory()) {
          return fs.readdirSync(destino).join("\n");
        }
        const texto = fs.readFileSync(destino, "utf8");
        return texto.length > ARCHIVO_TOPE
          ? `${texto.slice(0, ARCHIVO_TOPE)}\n\n[…recortado: el archivo tiene ${texto.length} caracteres]`
          : texto;
      }

      if (nombre === "buscar_en_repo") {
        const carpeta = entrada.carpeta ?? "src";
        dentroDelRepo(raiz, carpeta);
        try {
          return execFileSync(
            "git",
            ["grep", "-n", "--no-color", "-e", entrada.patron, "--", carpeta],
            { cwd: raiz, encoding: "utf8", timeout: MS_TOPE, maxBuffer: SALIDA_TOPE * 4 },
          ).slice(0, SALIDA_TOPE);
        } catch (e) {
          /* git grep sale con 1 cuando no encuentra nada: eso no es un fallo. */
          if (e.status === 1) return "Sin coincidencias.";
          return `La búsqueda falló: ${e.message}`;
        }
      }

      if (nombre === "calcular") {
        const tmp = rutaTemporal(raiz);
        let salida;
        try {
          fs.writeFileSync(tmp, PROLOGO(raiz) + entrada.codigo, "utf8");
          /*
           * Con el cargador de JSX del repo, si está. Sin él, `calcular` solo
           * alcanza los archivos de datos: cualquier componente se cae con
           * «Unknown file extension .jsx», y media verificación queda fuera de
           * alcance sin que se entienda por qué.
           */
          const cargador = path.join(raiz, "scripts", "cargador-jsx.mjs");
          const argumentos = fs.existsSync(cargador)
            ? ["--import", pathToFileURL(cargador).href, tmp]
            : [tmp];
          salida = execFileSync(process.execPath, argumentos, {
            cwd: raiz, encoding: "utf8", timeout: MS_TOPE, maxBuffer: SALIDA_TOPE * 4,
          });
        } catch (e) {
          salida = `El cálculo falló:\n${e.stdout ?? ""}\n${e.stderr ?? e.message}`;
        } finally {
          /*
           * El archivo temporal vive dentro de `node_modules`, que git ignora:
           * así escribirlo no ensucia el árbol y la comprobación de abajo
           * sigue significando lo que dice.
           */
          if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        }
        const violacion = comprobarQueNoEscribio("calcular");
        if (violacion) return `⚠️ ${violacion}`;
        return String(salida).slice(0, SALIDA_TOPE);
      }

      throw new Error(`herramienta desconocida: «${nombre}»`);
    },
  };
}
