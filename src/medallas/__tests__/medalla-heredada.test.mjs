import { test } from "node:test";
import assert from "node:assert/strict";
import { materiaCompleta, AGREGADAS_DESPUES } from "../medallas.js";
import { SUBJECTS, HACER, actividadesDeTipo } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «MACROECONOMÍA AL DÍA» NO SE LE QUITA A QUIEN YA LA GANÓ.
 *
 * La medalla se deriva al leer, así que el día que se declara una actividad
 * nueva el total sube y quien la tenía la pierde sin haber hecho nada. Se
 * midió antes de agregar los tres instrumentos de Política Monetaria y la
 * decisión fue: quien ya la tiene la conserva; quien no, necesita el total
 * nuevo.
 *
 * Esta prueba es la que defiende esa decisión. Si alguien agrega una
 * actividad y no la pone en AGREGADAS_DESPUES, el primer caso se cae.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MACRO = "macroeconomia";
const idsDe = (materiaId) => Object.values(SUBJECTS)
  .find((m) => m.id === materiaId).topics
  .flatMap((t) => actividadesDeTipo(t, HACER))
  .map((a) => a.id);

const medallaDe = (materiaId, hechas) => materiaCompleta({ [materiaId]: new Set(hechas) })
  .find((m) => m.subject_id === materiaId);

test("★★★ quien completó las de antes conserva la medalla, aunque hoy el total sea mayor", () => {
  const todas = idsDe(MACRO);
  const antes = todas.filter((id) => !AGREGADAS_DESPUES.has(id));

  /* La prueba no vale si no hay añadidos: entonces no habría nada que heredar. */
  assert.ok(antes.length < todas.length, "no hay actividades agregadas después: este caso no mide nada");

  const m = medallaDe(MACRO, antes);
  assert.equal(m.obtenida, true, "le quitaron la medalla a quien ya la tenía");
  /* Y no se le miente con la cifra: ni dice que completó el total nuevo... */
  assert.ok(!m.descripcion.includes(`los ${todas.length} juegos`), "le dice que completó más de lo que completó");
  /* ...ni se le infla el progreso. */
  assert.equal(m.progreso, antes.length);
  assert.equal(m.meta, todas.length);
});

test("★★★ a quien le falta una de las de antes, no se le regala", () => {
  const antes = idsDe(MACRO).filter((id) => !AGREGADAS_DESPUES.has(id));
  const casiTodas = antes.slice(0, -1);
  assert.equal(medallaDe(MACRO, casiTodas).obtenida, false);
});

test("★★★ quien completa el total nuevo la tiene, y ahí sí se le dice el total", () => {
  const todas = idsDe(MACRO);
  const m = medallaDe(MACRO, todas);
  assert.equal(m.obtenida, true);
  assert.equal(m.progreso, m.meta);
  assert.ok(m.descripcion.includes(`los ${todas.length} juegos`));
});

test("★★ sin nada hecho no hay medalla, y una materia sin añadidos se calcula igual que siempre", () => {
  assert.equal(medallaDe(MACRO, []).obtenida, false);

  /* En una materia sin añadidos, «las de antes» son todas: el cálculo es el viejo. */
  for (const materia of Object.values(SUBJECTS)) {
    const todas = idsDe(materia.id);
    if (todas.length === 0 || todas.some((id) => AGREGADAS_DESPUES.has(id))) continue;
    assert.equal(medallaDe(materia.id, todas.slice(0, -1)).obtenida, false, `${materia.id}: se regaló la medalla`);
    assert.equal(medallaDe(materia.id, todas).obtenida, true, `${materia.id}: no se otorgó estando completa`);
  }
});
