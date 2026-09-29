import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ROLES, PASOS, MODELOS, MODELO_INTERPRETE, leerModelos, RUTA_MODELOS } from "./roles.js";
import { PRECIOS, Contador } from "./topes.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ MODELO CORRE CADA PASO.
 *
 * Esto decide la factura, así que las pruebas no comprueban que «funcione»:
 * comprueban las tres formas de que mienta sin fallar.
 *
 *   1 · Un modelo sin precio. La corrida arranca, gasta, y revienta a mitad.
 *   2 · Un nombre de paso mal escrito. El archivo dice una cosa y la corrida
 *       hace otra, callada.
 *   3 · Que la asignación esté clavada en el código y el archivo sea decorado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const conArchivo = (objeto) => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "modelos-"));
  const ruta = path.join(carpeta, "modelos.json");
  fs.writeFileSync(ruta, typeof objeto === "string" ? objeto : JSON.stringify(objeto), "utf8");
  return ruta;
};

const COMPLETO = {
  gen: "claude-sonnet-5",
  xeno: "claude-sonnet-5",
  levi: "claude-opus-5",
  compilacion: "claude-opus-5",
  interprete: "claude-opus-5",
};

test("★★★ todo paso corre con un modelo que tiene precio", () => {
  /*
   * Sin precio, `anotarUso` lanza — pero lanza DESPUÉS de haber llamado y
   * gastado. Esta prueba lo caza antes, que es donde sirve.
   */
  for (const paso of PASOS) {
    assert.ok(MODELOS[paso], `«${paso}» no tiene modelo asignado`);
    assert.ok(PRECIOS[MODELOS[paso]], `«${paso}» corre con «${MODELOS[paso]}», que no tiene precio`);
  }
  for (const rol of Object.values(ROLES)) {
    assert.equal(rol.modelo, MODELOS[rol.id], `${rol.id} no usa el modelo del archivo`);
  }
  assert.equal(MODELO_INTERPRETE, MODELOS.interprete);
});

test("★★★ la asignación aprobada: Gen y Xeno baratos, Levi y compilación capaces", () => {
  /*
   * Recomendación de Stanley, aprobada por Mateo el 29 de septiembre de 2026.
   * Se comprueba por PRECIO, no por nombre de modelo: si algún día se cambia
   * «claude-sonnet-5» por otro, lo que tiene que seguir siendo cierto es que
   * Gen cuesta menos que Levi, no que se llame de una manera concreta.
   */
  const precio = (paso) => PRECIOS[MODELOS[paso]].salida;
  assert.ok(precio("gen") < precio("levi"), "Gen no corre más barato que Levi");
  assert.ok(precio("xeno") < precio("levi"), "Xeno no corre más barato que Levi");
  assert.equal(MODELOS.compilacion, MODELOS.levi,
    "la compilación no corre al mismo nivel que Levi, que es lo aprobado");
});

test("★★★ el archivo es lo que manda: cambiarlo cambia la asignación", () => {
  /*
   * LA prueba de que es configurable y no decorado. Si la asignación estuviera
   * clavada en el código, esto devolvería lo de siempre y pasaría igual… por
   * eso se comprueba contra un archivo que dice algo DISTINTO del real.
   */
  const otro = { ...COMPLETO, gen: "claude-haiku-4-5", compilacion: "claude-haiku-4-5" };
  const leido = leerModelos(conArchivo(otro));
  assert.equal(leido.gen, "claude-haiku-4-5");
  assert.equal(leido.compilacion, "claude-haiku-4-5");
  assert.notEqual(leido.gen, MODELOS.gen, "el archivo de prueba no cambió nada: la prueba es vacía");
});

test("★★★ un modelo sin precio se rechaza antes de llamar, no a mitad de la corrida", () => {
  assert.throws(
    () => leerModelos(conArchivo({ ...COMPLETO, levi: "claude-opus-7-inventado" })),
    (e) => /opus-7-inventado/.test(e.message) && /levi/.test(e.message) && /precio/.test(e.message),
    "un modelo desconocido pasó por bueno",
  );
});

test("★★★ un paso mal escrito se rechaza: no se queda callado en otro modelo", () => {
  /*
   * «compilación» con tilde. Si se ignorara, el archivo diría que la
   * compilación corre en Sonnet y la corrida la haría en Opus. Una
   * configuración que miente es peor que una que falta.
   */
  const { compilacion: _quitado, ...sinElla } = COMPLETO;
  assert.throws(
    () => leerModelos(conArchivo({ ...sinElla, "compilación": "claude-sonnet-5" })),
    (e) => /compilación/.test(e.message),
    "un nombre de paso con tilde se ignoró en silencio",
  );
});

test("★★★ un paso sin asignar se rechaza", () => {
  const { xeno: _falta, ...incompleto } = COMPLETO;
  assert.throws(
    () => leerModelos(conArchivo(incompleto)),
    (e) => /xeno/.test(e.message),
    "corre sin saber en qué modelo va Xeno",
  );
});

test("★★ las claves de comentario («_…») no se toman por pasos", () => {
  const leido = leerModelos(conArchivo({ _comentario: ["lo que sea"], ...COMPLETO }));
  assert.deepEqual(leido, COMPLETO);
});

test("★★ un archivo roto o ausente lo dice con su nombre, no con un error de JSON a secas", () => {
  assert.throws(() => leerModelos(conArchivo("{esto no es json")), /modelos\.json/);
  assert.throws(() => leerModelos(path.join(os.tmpdir(), "no-existe-jamas", "modelos.json")), /modelos\.json/);
});

test("★★★ el modelos.json de este repo carga y asigna los cinco pasos", () => {
  const real = leerModelos(RUTA_MODELOS);
  assert.deepEqual(Object.keys(real).sort(), [...PASOS].sort());
  assert.deepEqual(real, MODELOS);
});

/* ═════════════ EL DESGLOSE POR MODELO ═════════════ */

test("★★★ el contador separa el gasto por modelo, no solo el total", () => {
  /*
   * Con la cadena partida en dos modelos, el total no deja ver lo único que
   * hay que vigilar: si la escritura de caché del Kit —que se paga una vez POR
   * MODELO— se comió lo que ahorró el modelo barato.
   */
  const c = new Contador();
  c.anotarUso("claude-sonnet-5", { input_tokens: 1000, output_tokens: 1000, cache_creation_input_tokens: 40000 });
  c.anotarUso("claude-sonnet-5", { input_tokens: 0, output_tokens: 1000, cache_read_input_tokens: 40000 });
  c.anotarUso("claude-opus-5", { input_tokens: 0, output_tokens: 1000, cache_creation_input_tokens: 40000 });

  const r = c.resumen();
  assert.equal(r.saltos, 3);
  assert.equal(r.porModelo["claude-sonnet-5"].saltos, 2);
  assert.equal(r.porModelo["claude-opus-5"].saltos, 1);
  assert.equal(r.porModelo["claude-sonnet-5"].cacheEscritura, 40000);
  assert.equal(r.porModelo["claude-opus-5"].cacheEscritura, 40000);
  assert.equal(r.porModelo["claude-sonnet-5"].cacheLectura, 40000);

  /* Y los trozos suman el total: un desglose que no cuadra no sirve de nada. */
  const suma = Object.values(r.porModelo).reduce((a, m) => a + m.dolares, 0);
  assert.ok(Math.abs(suma - r.dolares) < 1e-6, `el desglose suma ${suma} y el total dice ${r.dolares}`);

  /* La escritura de caché del Kit en Opus cuesta 2,5 veces la de Sonnet. */
  assert.ok(
    r.porModelo["claude-opus-5"].cacheEscritura * PRECIOS["claude-opus-5"].cacheEscritura
    > r.porModelo["claude-sonnet-5"].cacheEscritura * PRECIOS["claude-sonnet-5"].cacheEscritura,
  );
});

/* ═════════════ EL GASTO DEL INTÉRPRETE TAMBIÉN CUENTA ═════════════ */

test("★★★ la cadena acepta un contador ya empezado: lo del intérprete no se pierde", async () => {
  /*
   * El intérprete llama al modelo ANTES de la cadena. Si la cadena estrenara
   * contador, ese gasto no saldría en el total ni contaría para el tope, y el
   * número que se reporta no sería el número que se pagó.
   */
  const { correrCadena } = await import("./orquestador.js");
  const { transporteSimulado } = await import("./transporte.js");
  const { cargarConocimiento } = await import("./conocimiento.js");
  const { Registro } = await import("./registro.js");
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path2 = await import("node:path");

  const yaGastado = new Contador();
  yaGastado.anotarUso(MODELOS.interprete, { input_tokens: 5000, output_tokens: 500 });
  const antes = yaGastado.resumen().dolares;
  assert.ok(antes > 0, "el gasto de prueba es cero: la prueba no probaría nada");

  const r = await correrCadena({
    orden: "lo que sea",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro: new Registro(fs.default.mkdtempSync(path2.default.join(os.default.tmpdir(), "orq-")), "prueba"),
    transporte: transporteSimulado(["listo\n\nSIGUIENTE: detener\nPORQUE: prueba"]),
    contador: yaGastado,
  });

  assert.equal(r.contador, yaGastado, "la cadena se estrenó contador y perdió lo del intérprete");
  assert.ok(r.contador.resumen().dolares >= antes, "el gasto previo desapareció del total");
  assert.ok(r.contador.resumen().porModelo[MODELOS.interprete], "el intérprete no aparece en el desglose");
});
