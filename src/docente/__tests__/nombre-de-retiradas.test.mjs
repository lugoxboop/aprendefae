import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA LÁPIDA CON NOMBRE.
 *
 * El panel docente recoge las actividades completadas que ya no están en el
 * catálogo, para que el trabajo del estudiante no desaparezca. Las pintaba
 * con el id crudo: al profesor le salía `t7-2-debe-o-haber`. Ahora busca el
 * nombre en `data/retiradas.js`.
 *
 * ESTA PRUEBA NO OBLIGA A LLENAR LA TABLA, y es a propósito: una prueba que
 * fallara al retirar algo bloquearía a la célula que retira por un asunto del
 * panel docente, que es de otro. Si alguien retira sin dejar el nombre, el
 * panel enseña el id como enseñaba antes — se pierde la mejora, no se rompe
 * nada.
 *
 * LO QUE SÍ COMPRUEBA es lo contrario: que lo que está en la tabla siga
 * retirado de verdad. Una entrada para algo que volvió al catálogo es basura
 * que engaña al siguiente, y además taparía el nombre bueno con uno viejo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const CARPETA = new URL("supabase/migrations/", RAIZ);

const { NOMBRE_DE_RETIRADA, nombreDeRetirada } = await import("../../data/retiradas.js");
const { SUBJECTS } = await import("../../data/subjects.js");

/* Las lápidas, leídas de las migraciones: la misma forma que usa catalogo.test.mjs. */
const retiradasDelServidor = () => {
  const salida = new Set();
  for (const archivo of readdirSync(CARPETA).filter((f) => f.endsWith(".sql")).sort()) {
    const sql = readFileSync(new URL(archivo, CARPETA), "utf8");
    for (const u of sql.matchAll(
      /update\s+(?:public\.)?actividad_catalogo\s+set\s+retirada\s*=\s*true\s+where\s+activity_id\s+in\s*\(([^)]*)\)/gi,
    )) {
      for (const id of u[1].matchAll(/'([^']+)'/g)) salida.add(id[1]);
    }
  }
  return salida;
};

/* Todos los ids que el cliente ofrece hoy. */
const idsDelCliente = () => {
  const s = new Set();
  for (const materia of Object.values(SUBJECTS)) {
    for (const t of materia.topics ?? []) {
      for (const a of t.actividades ?? []) s.add(a.id);
    }
  }
  return s;
};

test("★★★ todo lo que la tabla nombra sigue retirado: una entrada caduca taparía el nombre bueno", () => {
  const retiradas = retiradasDelServidor();
  assert.ok(retiradas.size >= 1, "no se leyó ninguna lápida: la comprobación habría pasado mirando nada");
  const cliente = idsDelCliente();
  for (const id of Object.keys(NOMBRE_DE_RETIRADA)) {
    assert.ok(
      retiradas.has(id),
      `«${id}» está en la tabla de nombres pero ninguna migración lo retira. Si nunca se retiró, sobra; si volvió, quítalo.`,
    );
    assert.ok(
      !cliente.has(id),
      `«${id}» volvió al catálogo del cliente y sigue en la tabla de retiradas: el panel le pondría el nombre viejo.`,
    );
  }
});

test("★★★ y el nombre no está vacío ni es el propio id disfrazado", () => {
  for (const [id, nombre] of Object.entries(NOMBRE_DE_RETIRADA)) {
    assert.ok(typeof nombre === "string" && nombre.trim().length >= 3, `«${id}» tiene un nombre vacío o demasiado corto`);
    assert.notEqual(nombre, id, `«${id}» se nombra a sí mismo: eso no mejora nada sobre lo que había`);
  }
});

test("★★★ sin nombre conocido devuelve el id, que es lo que se veía antes: no se rompe, no se inventa", () => {
  assert.equal(nombreDeRetirada("una-que-nadie-registro"), "una-que-nadie-registro");
  const [primero] = Object.keys(NOMBRE_DE_RETIRADA);
  assert.equal(nombreDeRetirada(primero), NOMBRE_DE_RETIRADA[primero]);
});
