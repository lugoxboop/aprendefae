import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

import { crearHerramientas, raizDelRepo, DEFINICIONES, rutaTemporal } from "./herramientas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MANOS DE LA COMPILACIÓN, CONTRA EL REPOSITORIO DE VERDAD.
 *
 * Estas pruebas no usan un repo de mentira. El paso de compilación existe para
 * comprobar afirmaciones contra la realidad, y una herramienta que funciona
 * contra una maqueta y se estrella contra el repo real no sirve de nada — que
 * es exactamente lo que pasó la primera vez que se probó `calcular`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = raizDelRepo(AQUI);
const herramientas = (alViolar = null) => crearHerramientas(REPO, { alViolar });

test("★★ leer_archivo lee del repositorio, y una carpeta devuelve su lista", async () => {
  const h = herramientas();
  const paquete = await h.ejecutar("leer_archivo", { ruta: "package.json" });
  assert.match(paquete, /"name"/);
  const carpeta = await h.ejecutar("leer_archivo", { ruta: "src/data" });
  assert.match(carpeta, /subjects\.js/);
  assert.match(await h.ejecutar("leer_archivo", { ruta: "no/existe.js" }), /No existe/);
});

test("★★★ ninguna ruta sale del repositorio, ni por un vecino de nombre parecido", async () => {
  const h = herramientas();
  const fuera = [
    "../../../etc/passwd",
    "..\\..\\secreto.txt",
    "../orquestador/../../fuera",
    /*
     * El caso que se escapaba: una carpeta HERMANA cuyo nombre empieza igual
     * que el repo. Sin la barra final en la comprobación,
     * «…/aprendefae-secreto/x» pasa por estar «dentro de …/aprendefae».
     * Sobrevivió un mutante que quitaba justo esa barra.
     */
    `../${path.basename(REPO)}-secreto/x.txt`,
    `../${path.basename(REPO)}2/x.txt`,
  ];
  for (const ruta of fuera) {
    await assert.rejects(
      () => h.ejecutar("leer_archivo", { ruta }),
      /sale del repositorio/,
      `«${ruta}» se leyó desde fuera del repo`,
    );
  }
});

test("★★ buscar_en_repo encuentra lo que hay y dice cuando no hay nada", async () => {
  const h = herramientas();
  const hay = await h.ejecutar("buscar_en_repo", { patron: "t1-la-articulacion" });
  assert.match(hay, /src\/data\/subjects\.js/);
  /* Sin coincidencias NO es un fallo: git grep sale con 1 y eso es normal. */
  const nada = await h.ejecutar("buscar_en_repo", { patron: "zzz-esto-no-existe-zzz" });
  assert.match(nada, /Sin coincidencias/);
});

/*
 * ═══════════ EL FALLO QUE ESTA PRUEBA EXISTE PARA EVITAR ═══════════
 *
 * El fragmento se escribe en un archivo temporal, y un `import('./src/...')`
 * resuelve contra la carpeta de ESE archivo, no contra el repositorio. La
 * primera vez que se probó contra el repo real, `calcular` no pudo importar ni
 * un archivo de datos — y el error, «Cannot find module», no explicaba por qué.
 *
 * Un modelo habría gastado tres o cuatro vueltas peleándose con eso, pagando
 * cada una.
 */
test("★★★ calcular importa los datos del repositorio con repo(), y el número es el de verdad", async () => {
  const h = herramientas();
  const salida = await h.ejecutar("calcular", {
    codigo: [
      "const { SUBJECTS } = await repo('src/data/subjects.js');",
      "const tema = SUBJECTS.contabilidad.topics.find(t => t.id === 'introduccion-contabilidad');",
      "console.log(JSON.stringify({",
      "  actividades: tema.actividades.length,",
      "  fp: tema.actividades.reduce((s, a) => s + (a.clasificacion.fpBase ?? 0), 0),",
      "}));",
    ].join("\n"),
  });

  const leido = JSON.parse(salida.trim());
  /*
   * Se comprueba contra el catálogo cargado aquí, no contra un número escrito
   * a mano: si mañana entra la T1-3, este número cambia y la prueba tiene que
   * seguir valiendo. Lo que se verifica es que `calcular` devuelve LO MISMO
   * que ve quien importa el catálogo directamente.
   */
  /* En Windows una ruta absoluta no es una URL: hay que convertirla. */
  const { SUBJECTS } = await import(pathToFileURL(path.join(REPO, "src", "data", "subjects.js")).href);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "introduccion-contabilidad");
  assert.equal(leido.actividades, tema.actividades.length);
  assert.equal(leido.fp, tema.actividades.reduce((s, a) => s + (a.clasificacion.fpBase ?? 0), 0));
});

test("★★★ calcular alcanza también los componentes, no solo los datos", async () => {
  const h = herramientas();
  const salida = await h.ejecutar("calcular", {
    codigo: [
      "const m = await repo('src/components/mecanicas/libros/intro/Torre.jsx');",
      "console.log(typeof m.default, m.torreEnPantalla(null).celdas.length);",
    ].join("\n"),
  });
  /*
   * Sin el cargador de JSX del repo, esto se cae con «Unknown file extension
   * .jsx» y media verificación queda fuera de alcance: la compilación no
   * podría comprobar nada de lo que se dibuja.
   */
  assert.match(salida, /function 3/);
});

test("★★ un cálculo que se cae devuelve el error, no rompe la corrida", async () => {
  const h = herramientas();
  const salida = await h.ejecutar("calcular", { codigo: "esto no es javascript válido {{{" });
  assert.match(salida, /El cálculo falló/);
});

test("★★ un cálculo que no imprime nada devuelve vacío, no un falso resultado", async () => {
  const h = herramientas();
  const salida = await h.ejecutar("calcular", { codigo: "const x = 2 + 2;" });
  assert.equal(salida.trim(), "");
});

/*
 * ═══════════ LA GUARDA DE ESCRITURA DETECTA, NO IMPIDE ═══════════
 *
 * Está dicho así a propósito, y es la limitación conocida de esta versión:
 * `calcular` ejecuta código escrito por un modelo en esta máquina. Lo que hay
 * es que si ese código toca el repositorio, se nota y se reporta.
 *
 * Esta prueba escribe de verdad y luego limpia, porque una guarda que solo se
 * comprueba en teoría no es una guarda.
 */
test("★★★ si el cálculo escribe en el repositorio, se detecta y se avisa", async () => {
  const testigo = path.join(REPO, "testigo-de-la-prueba.txt");
  const violaciones = [];
  const h = herramientas((v) => violaciones.push(v));
  try {
    const salida = await h.ejecutar("calcular", {
      codigo: [
        "const fs = await import('node:fs');",
        `fs.writeFileSync(${JSON.stringify(testigo)}, 'x');`,
        "console.log('escribí');",
      ].join("\n"),
    });
    assert.equal(violaciones.length, 1, "la escritura pasó desapercibida");
    assert.match(salida, /⚠/);
    assert.match(violaciones[0], /modificó el repositorio/);
  } finally {
    if (fs.existsSync(testigo)) fs.unlinkSync(testigo);
  }
});

test("★★★ el archivo temporal del cálculo vive en una carpeta que git ignora", async () => {
  const violaciones = [];
  const h = herramientas((v) => violaciones.push(v));
  await h.ejecutar("calcular", { codigo: "console.log('hola');" });
  assert.deepEqual(violaciones, [], "un cálculo inocente disparó la alarma de escritura");

  /*
   * Y no basta con que se borre al final. Mientras el cálculo corre —hasta
   * veinte segundos— el archivo existe: si viviera en la raíz, cualquier otra
   * cosa que mire el repo en ese rato lo vería, y una guarda que dependiera de
   * limpiar a tiempo se rompería en cuanto alguien cambiara el orden.
   *
   * Lo que se exige es que la CARPETA esté ignorada, que es lo que no depende
   * del orden. Sobrevivió un mutante que movía el temporal a la raíz.
   */
  const relativa = path.relative(REPO, rutaTemporal(REPO));
  const ignorado = (() => {
    try {
      execFileSync("git", ["check-ignore", "-q", relativa], { cwd: REPO });
      return true;
    } catch {
      return false;
    }
  })();
  assert.ok(ignorado, `git no ignora «${relativa}»: el temporal ensucia el árbol mientras corre`);
});

test("★★ una herramienta que no existe se cae en vez de devolver algo plausible", async () => {
  const h = herramientas();
  await assert.rejects(() => h.ejecutar("publicar", {}), /herramienta desconocida/);
});

test("★★ la descripción de calcular enseña repo(), que es lo que no se adivina", () => {
  const calcular = DEFINICIONES.find((d) => d.name === "calcular");
  assert.match(calcular.description, /repo\('/);
  assert.match(calcular.description, /NO funciona/);
  /* Y las tres herramientas declaran sus parámetros de forma estricta. */
  for (const d of DEFINICIONES) {
    assert.equal(d.input_schema.additionalProperties, false, `${d.name} acepta parámetros de más`);
    assert.ok(d.input_schema.required?.length, `${d.name} no exige ningún parámetro`);
  }
});
