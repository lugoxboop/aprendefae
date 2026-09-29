import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  cargarClave, leerEnv, revisarForma, comoArreglarlo, RUTA_ENV,
  IDENTIFICADOR_FALTANTE, cabecerasDelCliente, comoArreglarElEspacio,
} from "./clave.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CLAVE — las dos formas silenciosas de quedarse sin ella.
 *
 * 1 · EL BOM. PowerShell escribe UTF-8 con marca de bytes, y esos tres bytes
 *     invisibles se pegan al nombre de la primera variable. El archivo se ve
 *     perfecto, la clave está entera, y la variable sale vacía. El .env real de
 *     este proyecto llegó exactamente así.
 *
 * 2 · EL VALOR MALTRATADO. Una clave con comillas pegadas o recortada al
 *     copiarla produce un 401 que parece un problema de la cuenta y se va a
 *     buscar a la consola de facturación.
 *
 * Y una regla que no se prueba con una aserción sino leyendo: NINGÚN mensaje
 * puede contener la clave. Hay una prueba para eso también.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const FALSA = `sk-ant-${"x".repeat(80)}`;

const conArchivo = (contenido) => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "clave-"));
  const ruta = path.join(carpeta, ".env");
  fs.writeFileSync(ruta, contenido);
  return ruta;
};

test("★★★ un .env con BOM de PowerShell igual entrega la clave", () => {
  /*
   * Este es EL caso. Sin quitar el BOM, la variable se llama
   * «﻿ANTHROPIC_API_KEY» y `ANTHROPIC_API_KEY` no existe — con el archivo
   * intacto y la clave entera dentro.
   */
  const ruta = conArchivo(Buffer.concat([
    Buffer.from([0xEF, 0xBB, 0xBF]),
    Buffer.from(`ANTHROPIC_API_KEY=${FALSA}\r\n`, "utf8"),
  ]));
  const entorno = {};
  const r = cargarClave({ ruta, entorno });
  assert.equal(r.ok, true, `no leyó la clave: ${r.porque}`);
  assert.equal(entorno.ANTHROPIC_API_KEY, FALSA);
  assert.equal(r.origen, "archivo");
});

test("★★ también con CRLF, comillas, comentarios y espacios de sobra", () => {
  for (const [nombre, contenido] of [
    ["CRLF", `ANTHROPIC_API_KEY=${FALSA}\r\n`],
    ["comillas dobles", `ANTHROPIC_API_KEY="${FALSA}"\n`],
    ["comillas simples", `ANTHROPIC_API_KEY='${FALSA}'\n`],
    ["espacios", `  ANTHROPIC_API_KEY =  ${FALSA}  \n`],
    ["con comentario", `# la clave\nANTHROPIC_API_KEY=${FALSA}\n`],
    ["sin salto final", `ANTHROPIC_API_KEY=${FALSA}`],
    ["otra variable delante", `OTRA=1\nANTHROPIC_API_KEY=${FALSA}\n`],
  ]) {
    const entorno = {};
    const r = cargarClave({ ruta: conArchivo(contenido), entorno });
    assert.equal(r.ok, true, `${nombre}: ${r.porque}`);
    assert.equal(entorno.ANTHROPIC_API_KEY, FALSA, `${nombre}: la clave llegó distinta`);
  }
});

test("★★★ el entorno gana sobre el archivo", () => {
  /*
   * Quien exporta la variable a mano lo hace a propósito. Un archivo que la
   * pisara por detrás sería casi imposible de entender desde fuera.
   */
  const otra = `sk-ant-${"y".repeat(80)}`;
  const entorno = { ANTHROPIC_API_KEY: otra };
  const r = cargarClave({ ruta: conArchivo(`ANTHROPIC_API_KEY=${FALSA}\n`), entorno });
  assert.equal(r.ok, true);
  assert.equal(r.origen, "entorno");
  assert.equal(entorno.ANTHROPIC_API_KEY, otra, "el archivo pisó la variable del entorno");
});

test("★★★ una clave maltratada se distingue de una cuenta sin permiso", () => {
  const casos = [
    ["vacía", "", /está vacía/],
    ["recortada", "sk-ant-abc", /recortada/],
    ["con prefijo ajeno", `sk-proj-${"x".repeat(80)}`, /no empieza por/],
    ["con un salto dentro", `sk-ant-${"x".repeat(40)}\n${"x".repeat(40)}`, /espacio o un salto/],
  ];
  for (const [nombre, valor, esperado] of casos) {
    assert.match(revisarForma(valor) ?? "", esperado, `«${nombre}» pasó por buena`);
  }
  assert.equal(revisarForma(FALSA), null, "una clave con buena forma se rechazó");
});

test("★★★ si el archivo tiene BOM y aun así no hay variable, el mensaje lo dice", () => {
  /*
   * Aquí el BOM está en medio del archivo, donde el limpiador no llega. El
   * mensaje tiene que nombrar el BOM: un «no encuentro la variable» a secas
   * manda a buscar el error donde no está.
   */
  const ruta = conArchivo(Buffer.concat([
    Buffer.from([0xEF, 0xBB, 0xBF]),
    Buffer.from("OTRA_COSA=1\n", "utf8"),
  ]));
  const r = cargarClave({ ruta, entorno: {} });
  assert.equal(r.ok, false);
  assert.match(r.porque, /BOM/);
});

test("★★ sin archivo y sin entorno, se dice que no hay ninguno de los dos", () => {
  const r = cargarClave({ ruta: path.join(os.tmpdir(), "no-existe-jamas", ".env"), entorno: {} });
  assert.equal(r.ok, false);
  assert.match(r.porque, /no existe/);
  assert.equal(r.origen, "ninguno");
});

/*
 * ═══════════ NINGÚN MENSAJE PUEDE LLEVAR LA CLAVE ═══════════
 *
 * Ni entera ni a medias. Un secreto que sale por la consola acaba en una
 * captura de pantalla, en un registro, o en un mensaje pegado a un chat.
 */
test("★★★ ni un mensaje de error contiene la clave, ni entera ni en trozos", () => {
  const ruta = conArchivo(`ANTHROPIC_API_KEY="${FALSA}\n`); /* comilla suelta: forma mala */
  const r = cargarClave({ ruta, entorno: {} });
  assert.equal(r.ok, false);

  const todo = [r.porque, comoArreglarlo(r), JSON.stringify(r)].join("\n");
  assert.ok(!todo.includes(FALSA), "el mensaje lleva la clave entera");
  /* Ni un trozo largo de ella. */
  for (let i = 0; i + 24 <= FALSA.length; i += 8) {
    assert.ok(!todo.includes(FALSA.slice(i, i + 24)), `el mensaje lleva un trozo de la clave (desde ${i})`);
  }
  /* Y el mensaje sí dice cómo arreglarlo, que es para lo que existe. */
  assert.match(comoArreglarlo(r), /\.env/);
  assert.match(comoArreglarlo(r), /BOM/);
});

test("★★ cuando SÍ hay clave, el resultado tampoco la lleva dentro", () => {
  const entorno = {};
  const r = cargarClave({ ruta: conArchivo(`ANTHROPIC_API_KEY=${FALSA}\n`), entorno });
  assert.equal(r.ok, true);
  assert.ok(!JSON.stringify(r).includes(FALSA), "el resultado devuelve la clave y acaba en un registro");
  assert.equal(r.largo, FALSA.length, "no dice el largo, que es lo único útil para diagnosticar");
});

test("★★ leerEnv ignora comentarios y líneas sin igual, sin inventarse nada", () => {
  const ruta = conArchivo("# comentario\n\nSUELTA\nA=1\nB=con=iguales\n");
  const leido = leerEnv(ruta);
  assert.deepEqual(leido, { A: "1", B: "con=iguales" });
});

/* ═══════════════════ EL ESPACIO DE TRABAJO ═══════════════════ */

test("★★★ una clave de organización sin espacio de trabajo se distingue de una clave mala", () => {
  /*
   * La API contesta 400, no 401, y el mensaje es correcto pero opaco: la clave
   * FUNCIONA y le falta un dato. Confundirlo con «la clave no sirve» manda a
   * regenerar una clave que estaba bien.
   */
  const deLaApi = "This API key is not scoped to a workspace, so this request must include "
    + "the anthropic-workspace-id header with the ID of the workspace to use.";
  assert.ok(IDENTIFICADOR_FALTANTE.test(deLaApi));
  assert.ok(!IDENTIFICADOR_FALTANTE.test("API key is invalid."), "confunde una clave inválida con la falta de espacio");
  assert.ok(!IDENTIFICADOR_FALTANTE.test("anthropic-workspace-id header must be a valid workspace ID."),
    "confunde un id equivocado con la falta de id: son dos arreglos distintos");

  const ayuda = comoArreglarElEspacio();
  assert.match(ayuda, /ANTHROPIC_WORKSPACE_ID/);
  assert.match(ayuda, /console\.anthropic\.com/);
});

test("★★★ la cabecera del espacio solo se manda si hay identificador", () => {
  assert.equal(cabecerasDelCliente({}), undefined, "manda una cabecera vacía y rompe las claves ya acotadas");
  assert.deepEqual(
    cabecerasDelCliente({ ANTHROPIC_WORKSPACE_ID: "wrkspc_x" }),
    { "anthropic-workspace-id": "wrkspc_x" },
  );
});

test("★★ el identificador del espacio también sale del .env, y el entorno gana", () => {
  const entorno = {};
  cargarClave({ ruta: conArchivo(`ANTHROPIC_API_KEY=${FALSA}\nANTHROPIC_WORKSPACE_ID=wrkspc_delarchivo\n`), entorno });
  assert.equal(entorno.ANTHROPIC_WORKSPACE_ID, "wrkspc_delarchivo");

  const conEntorno = { ANTHROPIC_WORKSPACE_ID: "wrkspc_delentorno" };
  cargarClave({ ruta: conArchivo(`ANTHROPIC_API_KEY=${FALSA}\nANTHROPIC_WORKSPACE_ID=wrkspc_delarchivo\n`), entorno: conEntorno });
  assert.equal(conEntorno.ANTHROPIC_WORKSPACE_ID, "wrkspc_delentorno", "el archivo pisó el identificador del entorno");
});

/* ═══════════════════ EL ARCHIVO REAL DE ESTA MÁQUINA ═══════════════════ */

test("★★★ el .env de este repo carga, y está fuera de git", async () => {
  if (!fs.existsSync(RUTA_ENV)) {
    /* En otra máquina puede no estar, y eso no es un fallo de esta prueba. */
    return;
  }
  const entorno = {};
  const r = cargarClave({ ruta: RUTA_ENV, entorno });
  assert.equal(r.ok, true, `el .env real no carga: ${r.porque}`);
  assert.ok(r.largo > 40);

  /* Y sigue sin BOM después del arreglo. */
  const bruto = fs.readFileSync(RUTA_ENV);
  assert.ok(!(bruto[0] === 0xEF && bruto[1] === 0xBB && bruto[2] === 0xBF), "volvió el BOM");

  /*
   * Lo que de verdad importa: que git lo ignore. Una clave que carga bien y
   * está rastreada es peor que una que no carga.
   */
  const { execFileSync } = await import("node:child_process");
  const ignorado = (() => {
    try {
      execFileSync("git", ["check-ignore", "-q", RUTA_ENV], { cwd: path.dirname(RUTA_ENV) });
      return true;
    } catch { return false; }
  })();
  assert.ok(ignorado, "git NO ignora el .env: la clave se puede subir");

  const rastreado = (() => {
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", RUTA_ENV], { cwd: path.dirname(RUTA_ENV), stdio: "pipe" });
      return true;
    } catch { return false; }
  })();
  assert.equal(rastreado, false, "el .env está rastreado por git");
});
