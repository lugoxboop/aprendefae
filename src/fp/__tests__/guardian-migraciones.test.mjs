/*
 * El guardián de las migraciones es la mirada que antes ponía una persona
 * pegando cada archivo en el editor SQL. Si se afloja sin que nadie lo note,
 * vuelve a pasar lo que ya pasó una vez: una migración que le paga a un
 * estudiante lo que no es.
 *
 * Estas pruebas atacan cada reproche por separado, y además comprueban las dos
 * cosas que un guardián demasiado estricto rompería: un upsert legítimo y una
 * migración correcta.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { revisar, sinComentarios, filasDeCatalogo, rangoDe, RANGOS, MARCA_ESQUEMA } from "../../../scripts/guardian-migraciones.mjs";

const CLIENTE = new Map([
  ["t7-3-costo-o-vnr", { activity_id: "t7-3-costo-o-vnr", subject_id: "contabilidad", topic_id: "inventarios-descuentos-nic2", modalidad: "evaluativa", dificultad: "medio", fp_base: 25 }],
]);

const fila = (campos = {}) => {
  const c = { id: "t7-3-costo-o-vnr", materia: "contabilidad", tema: "inventarios-descuentos-nic2", modalidad: "evaluativa", dificultad: "medio", fp: 25, ...campos };
  return `insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values ('${c.id}','${c.materia}','${c.tema}','${c.modalidad}','${c.dificultad}',${c.fp},1) on conflict (activity_id) do nothing;`;
};

test("★★★ aprueba una migración correcta, y esto es la mitad del valor", () => {
  const r = revisar([{ nombre: "0130_buena.sql", sql: fila() }], CLIENTE);
  assert.deepEqual(r, [], "un guardián que rechaza lo bueno se desactiva en una semana");
});

test("★★★ rechaza los FP que no coinciden con lo que declara la aplicación", () => {
  const r = revisar([{ nombre: "0131_fp.sql", sql: fila({ fp: 50 }) }], CLIENTE);
  assert.equal(r.length, 1);
  assert.match(r[0], /fp_base=50 y la aplicación declara 25/);
});

test("★★★ rechaza el tema que no coincide", () => {
  const r = revisar([{ nombre: "0132_tema.sql", sql: fila({ tema: "inventarios-periodico" }) }], CLIENTE);
  assert.equal(r.length, 1);
  assert.match(r[0], /topic_id=/);
});

test("★★★ rechaza lo destructivo en el rango de una célula", () => {
  for (const verbo of ["delete from public.actividad_catalogo where activity_id = 'x';", "drop table public.actividad_catalogo;", "alter table public.actividad_catalogo add column x int;", "truncate public.fp_history;"]) {
    const r = revisar([{ nombre: "0133_malo.sql", sql: verbo }], CLIENTE);
    assert.ok(r.length >= 1, `no cazó: ${verbo}`);
    assert.match(r[0], /fuera de un comentario/);
  }
});

test("★★★ un upsert legítimo NO es destructivo: era el falso positivo que lo rompía todo", () => {
  const sql = `insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values ('t7-3-costo-o-vnr','contabilidad','inventarios-descuentos-nic2','evaluativa','medio',25,1) on conflict (activity_id) do update set fp_base = excluded.fp_base;`;
  assert.deepEqual(revisar([{ nombre: "0134_upsert.sql", sql }], CLIENTE), []);
});

test("★★ un ALTER dentro de un comentario pasa: es cómo se escribe el deshacer", () => {
  const sql = `-- Cómo deshacerla: delete from public.actividad_catalogo where activity_id = 'x';\n${fila()}`;
  assert.deepEqual(revisar([{ nombre: "0135_comentario.sql", sql }], CLIENTE), []);
});

test("★★ el coordinador sí puede cambiar el esquema, pero solo diciéndolo", () => {
  const esquema = "create table public.x (a int);\nalter table public.x add column b int;";
  const sinMarca = revisar([{ nombre: "0160_esquema.sql", sql: esquema }], CLIENTE);
  assert.equal(sinMarca.length, 1, "sin la marca tiene que rechazarlo");
  const conMarca = revisar([{ nombre: "0160_esquema.sql", sql: `-- ${MARCA_ESQUEMA}\n${esquema}` }], CLIENTE);
  assert.deepEqual(conMarca, [], "con la marca explícita tiene que dejarlo pasar");
  /* Y la marca no vale fuera del rango del coordinador. */
  const otraCelula = revisar([{ nombre: "0210_esquema.sql", sql: `-- ${MARCA_ESQUEMA}\n${esquema}` }], CLIENTE);
  assert.equal(otraCelula.length, 1, "una célula no cambia el esquema ni poniendo la marca");
});

test("★★★ rechaza un número fuera de todos los rangos", () => {
  const r = revisar([{ nombre: "9001_fuera.sql", sql: fila() }], CLIENTE);
  assert.equal(r.length, 1);
  assert.match(r[0], /no cae en ningún rango/);
});

test("★★★ rechaza un id que la aplicación no declara", () => {
  const r = revisar([{ nombre: "0136_inventado.sql", sql: fila({ id: "no-existe" }) }], CLIENTE);
  assert.equal(r.length, 1);
  assert.match(r[0], /no declara en subjects\.js/);
});

test("★★ rechaza un nombre de archivo que no empieza por cuatro dígitos", () => {
  const r = revisar([{ nombre: "catalogo.sql", sql: fila() }], CLIENTE);
  assert.equal(r.length, 1);
  assert.match(r[0], /cuatro dígitos/);
});

test("★★★ los rangos de aquí son los mismos que los del canon", () => {
  /* Son la misma decisión escrita dos veces. Si se separan, una célula escribe
     en el rango de otra creyendo que está en el suyo, y el choque aparece con
     las dos migraciones ya escritas. */
  const canon = readFileSync(new URL("../../../orquestador/conocimiento/nocturno.md", import.meta.url), "utf8");
  assert.ok(canon.length > 5000, "el canon no se leyó: la comprobación habría pasado mirando nada");
  const linea = canon.split("\n").find((l) => l.startsWith("| Migraciones |"));
  assert.ok(linea, "no está la fila de migraciones en el mapa de choques");
  const numeros = (linea.match(/\d{4}/g) ?? []).map(Number);
  for (const n of numeros) {
    assert.ok(rangoDe(n), `el canon nombra el número ${n} y el guardián no lo reconoce en ningún rango`);
  }
  /* Y los límites de cada célula del canon tienen que caer donde dice RANGOS. */
  for (const [desde, hasta] of [[70, 89], [90, 149], [200, 249], [250, 299]]) {
    const r = rangoDe(desde);
    assert.equal(r.desde, desde);
    assert.equal(r.hasta, hasta);
  }
  assert.ok(RANGOS.length >= 6);
});

test("★★ las piezas sueltas hacen lo que dicen", () => {
  /* Se afirma el significado, no el espaciado: quitar un comentario deja
     huecos, y atar la prueba a ellos la vuelve frágil sin ganar nada. */
  const linea = sinComentarios("select 1; -- ojo con el delete\nselect 2;");
  assert.ok(!linea.includes("delete"), "el comentario de línea tiene que desaparecer");
  assert.ok(linea.includes("select 1;") && linea.includes("select 2;"), "y el SQL de alrededor tiene que quedarse");
  const bloque = sinComentarios("select 1; /* drop table x */ select 2;");
  assert.ok(!bloque.includes("drop"), "el comentario de bloque tiene que desaparecer");
  assert.ok(bloque.includes("select 1;") && bloque.includes("select 2;"));
  assert.equal(filasDeCatalogo("select 1;").length, 0, "sin insert al catálogo, no hay filas que juzgar");
  assert.equal(filasDeCatalogo(fila())[0].fp_base, 25);
});
