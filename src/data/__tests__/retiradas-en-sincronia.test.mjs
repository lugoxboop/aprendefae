import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOS LISTAS DE RETIRADAS DICEN LO MISMO.
 *
 * Una actividad retirada en blando aparece en dos sitios, y los dos hay que
 * tocarlos en el PR que la retira:
 *
 *   1. src/data/retiradas.js — para que el panel docente enseñe su NOMBRE y no
 *      el id crudo cuando un estudiante ya la jugó.
 *   2. supabase/tests/retiro_test.sql, paso 2 — la lista de las que están
 *      retiradas a propósito. Si el default de la columna fallara, ahí
 *      saldrían de más.
 *
 * POR QUÉ ESTA PRUEBA. La Célula D retiró tres actividades, añadió sus nombres
 * a retiradas.js y no tocó la lista del SQL. El resultado fue un rojo en una
 * prueba de SQL que solo corre sobre Postgres limpio, con un mensaje que no
 * dice qué archivo editar, y una ronda de mensajes entre células para
 * averiguarlo. Esto lo caza en `npm test`, en segundos, diciendo exactamente
 * qué falta y dónde.
 *
 * El paso 2 del SQL NO puede dejar de ser una lista escrita a mano: corre
 * contra la base, no puede leer subjects.js, y lo que comprueba es justamente
 * que no haya retiradas de más. Lo que sí puede es no estar sola.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");

/* Los ids de NOMBRE_DE_RETIRADA, leídos del texto: la prueba no importa el
   módulo porque lo que compara es lo ESCRITO en los dos archivos. */
function idsDeRetiradasJs() {
  const fuente = leer("src/data/retiradas.js");
  const bloque = fuente.slice(fuente.indexOf("NOMBRE_DE_RETIRADA"));
  return new Set([...bloque.matchAll(/"([a-z0-9][a-z0-9-]*)":\s*"/g)].map((m) => m[1]));
}

/* La lista del paso 2, que el propio SQL compara con string_agg separado por comas. */
function idsDelSql() {
  const fuente = leer("supabase/tests/retiro_test.sql");
  const m = fuente.match(/=\s*'([a-z0-9-]+(?:,[a-z0-9-]+)*)'\s*\n\s*from public\.actividad_catalogo where retirada/);
  assert.ok(m, "no encontré la lista del paso 2 de retiro_test.sql: si cambió de forma, esta prueba hay que reescribirla, no borrarla");
  return new Set(m[1].split(","));
}

test("★★★ retiradas.js y el paso 2 de retiro_test.sql nombran las mismas actividades", () => {
  const js = idsDeRetiradasJs();
  const sql = idsDelSql();
  assert.ok(js.size > 0, "retiradas.js no declara ninguna: la extracción está rota, y una extracción vacía diría que todo cuadra");

  const soloJs = [...js].filter((id) => !sql.has(id)).sort();
  const soloSql = [...sql].filter((id) => !js.has(id)).sort();

  assert.deepEqual(soloJs, [], soloJs.length
    ? `están en retiradas.js y faltan en el paso 2 de supabase/tests/retiro_test.sql: ${soloJs.join(", ")}. ` +
      `Añádelos a las DOS cadenas de ese paso (la de «esperado», separada por «, », y la de la comparación, separada por «,»), en orden alfabético y en el mismo PR que las retira.`
    : "");
  assert.deepEqual(soloSql, [], soloSql.length
    ? `están en el paso 2 de retiro_test.sql y faltan en src/data/retiradas.js: ${soloSql.join(", ")}. ` +
      `Sin su nombre ahí, el panel docente le enseña al profesor el id crudo.`
    : "");
});

test("★★ y las dos cadenas del paso 2 dicen lo mismo entre ellas", () => {
  /*
   * El paso 2 escribe la lista DOS veces: una para que el informe la enseñe y
   * otra en la comparación. Si solo se toca una, el paso pasa en verde con un
   * «esperado» que no es el que se comprobó, o rebota con un mensaje que
   * contradice lo que acaba de comparar.
   */
  const fuente = leer("supabase/tests/retiro_test.sql");
  const esperado = fuente.match(/'solo están retiradas las retiradas a propósito',\s*'([^']+)'/);
  assert.ok(esperado, "no encontré la cadena de «esperado» del paso 2");
  const delInforme = esperado[1].split(",").map((x) => x.trim()).sort();
  const deLaComparacion = [...idsDelSql()].sort();
  assert.deepEqual(delInforme, deLaComparacion, "las dos listas del paso 2 no coinciden: se tocó una y no la otra");
});
