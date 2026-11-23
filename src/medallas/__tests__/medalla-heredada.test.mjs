import { test } from "node:test";
import assert from "node:assert/strict";
import { materiaCompleta, AGREGADAS_DESPUES, GANADAS_ANTES_DEL_RETIRO } from "../medallas.js";
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
 *
 * EL 22-NOV-2026 MACROECONOMÍA SE RETIRÓ ENTERA (0258) y su total de hoy es
 * cero. Los tres primeros casos se miden ahora contra los juegos de antes del
 * retiro (GANADAS_ANTES_DEL_RETIRO), que siguen en fp_history: la decisión es
 * la misma, quien la ganó la conserva.
 *
 * EL 23-NOV-2026 (LOTE 2) ENTRARON LAS SEIS HACER DE «DEMANDA AGREGADA». No
 * van a AGREGADAS_DESPUES: no se añaden a la materia de antes, son la materia
 * nueva. Quien la ganó antes del retiro la conserva por GANADAS_ANTES_DEL_RETIRO;
 * quien no, necesita el total nuevo. Las cifras se cuentan, no se fijan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MACRO = "macroeconomia";
const idsDe = (materiaId) => Object.values(SUBJECTS)
  .find((m) => m.id === materiaId).topics
  .flatMap((t) => actividadesDeTipo(t, HACER))
  .map((a) => a.id);

const medallaDe = (materiaId, hechas) => materiaCompleta({ [materiaId]: new Set(hechas) })
  .find((m) => m.subject_id === materiaId);

const DEL_RETIRO = GANADAS_ANTES_DEL_RETIRO[MACRO];

test("★★★ quien la ganó antes del retiro la conserva, aunque Macro hoy tenga actividades nuevas", () => {
  const nuevas = idsDe(MACRO);
  assert.ok(nuevas.length > 0, "Macro no tiene actividades: el lote 2 publicó las seis Hacer de T1");
  for (const id of nuevas) assert.ok(!DEL_RETIRO.includes(id), `${id} es del Macro nuevo: no puede contar como juego de antes`);
  assert.equal(DEL_RETIRO.length, 54);
  assert.equal(new Set(DEL_RETIRO).size, 54, "ningún juego repetido");
  for (const id of AGREGADAS_DESPUES) assert.ok(!DEL_RETIRO.includes(id), `${id} entró después: no hacía falta para ganarla`);

  const m = medallaDe(MACRO, DEL_RETIRO);
  assert.equal(m.obtenida, true, "le quitaron la medalla a quien ya la tenía");
  /* No se le miente con la cifra, ni se le enseña un «0 de 0». */
  assert.match(m.descripcion, /^La ganaste con los 54 juegos que daban FP de Macroeconomía antes de que se rehiciera\.$/);
  /* La barra ya cuenta contra el total nuevo, que aún no ha hecho. */
  assert.equal(m.progreso, 0);
  assert.equal(m.meta, nuevas.length);

  /* Y quien además hizo los tres que entraron después, también. */
  assert.equal(medallaDe(MACRO, [...DEL_RETIRO, ...AGREGADAS_DESPUES]).obtenida, true);
});

test("★★★ a quien le falta una de las de antes del retiro, no se le regala", () => {
  const m = medallaDe(MACRO, DEL_RETIRO.slice(0, -1));
  assert.equal(m.obtenida, false);
  assert.equal(m.progreso, 0);
  assert.equal(m.meta, idsDe(MACRO).length);
  /* Ni a quien hizo todas las nuevas menos una. */
  assert.equal(medallaDe(MACRO, idsDe(MACRO).slice(0, -1)).obtenida, false);
});

test("★★★ la regla de los añadidos sigue en pie: quien tiene las de antes la conserva, y quien no necesita el total", () => {
  /*
   * Con un tema de mentira metido en Macro mientras dura la prueba: las de hoy
   * más cuatro juegos de antes, y los tres agregados después.
   * Es materiaCompleta() la que decide, no una copia de su regla.
   */
  const juego = (id) => ({ id, nombre: id, clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 } });
  const deHoy = idsDe(MACRO);
  const viejas = [...deHoy, "v-1", "v-2", "v-3", "v-4"];
  const tema = { id: "tema-de-prueba", title: "Tema de prueba", actividades: ["v-1", "v-2", "v-3", "v-4", ...AGREGADAS_DESPUES].map(juego) };
  const temas = SUBJECTS.macroeconomia.topics;
  temas.push(tema);
  try {
    const todas = idsDe(MACRO);
    assert.equal(todas.length, viejas.length + AGREGADAS_DESPUES.size);
    /* Las de antes, sin las del retiro: conserva por la regla de los añadidos. */
    const m = medallaDe(MACRO, viejas);
    assert.equal(m.obtenida, true, "le quitaron la medalla a quien ya la tenía");
    assert.ok(!m.descripcion.includes(`los ${todas.length} juegos`), "le dice que completó más de lo que completó");
    assert.equal(m.progreso, viejas.length);
    assert.equal(m.meta, todas.length);
    /* A quien le falta una de las de antes, no se le regala. */
    assert.equal(medallaDe(MACRO, viejas.slice(0, -1)).obtenida, false);
    /* Quien completa el total nuevo la tiene, y ahí sí se le dice el total. */
    const completa = medallaDe(MACRO, todas);
    assert.equal(completa.obtenida, true);
    assert.equal(completa.progreso, completa.meta);
    assert.ok(completa.descripcion.includes(`los ${todas.length} juegos`));
  } finally {
    temas.splice(temas.indexOf(tema), 1);
  }
  assert.deepEqual(idsDe(MACRO), deHoy, "el tema de mentira quedó dentro");
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
