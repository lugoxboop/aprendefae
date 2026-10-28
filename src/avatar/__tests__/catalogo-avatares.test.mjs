import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  FORMAS, PALETAS, PALETTES, SHAPES, NOMBRE_FORMA, NOMBRE_PALETA, computeAvatarProps,
} from "../generador.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CATÁLOGO DE AVATARES DICE LO MISMO EN LOS TRES SITIOS DONDE VIVE.
 *
 * La lista de formas y paletas está por triplicado y es a propósito: el check
 * de la columna (que nadie escriba una forma inventada ni por SQL directo),
 * la validación de avatar_elegir() (para dar un mensaje decente) y
 * generador.js (para pintarlas). SQL no lee JavaScript, así que la única
 * forma de que no se separen es que una prueba LEA la migración, igual que
 * cristales.test.mjs hace con los precios.
 *
 * Si esto falla, lo que pasa en producción es que un estudiante elige una
 * forma, la ve en pantalla y al recargar le vuelve la vieja: el servidor la
 * rechazó sin que nadie se enterara.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DIR = new URL("../../../supabase/migrations/", import.meta.url).pathname;

/** El SQL de todas las migraciones, de la más nueva a la más vieja. */
const migraciones = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort().reverse();

/** La ÚLTIMA definición de una lista: la que manda es la migración más reciente. */
function listaDeSql(patron) {
  for (const f of migraciones) {
    const m = readFileSync(join(DIR, f), "utf8").match(patron);
    if (m) return { archivo: f, valores: [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) };
  }
  return null;
}

test("★★★ las formas del check de la columna son exactamente las de generador.js", () => {
  const sql = listaDeSql(/constraint profiles_avatar_shape_valida\s*\n?\s*check \(avatar_shape in \(([^)]+)\)\)/);
  assert.ok(sql, "no encontré el check de la forma en ninguna migración");
  assert.deepEqual([...sql.valores].sort(), [...FORMAS].sort(), `contra ${sql.archivo}`);
});

test("★★★ las paletas del check de la columna son exactamente las elegibles", () => {
  const sql = listaDeSql(/constraint profiles_avatar_palette_valida\s*\n?\s*check \(avatar_palette in \(([^)]+)\)\)/);
  assert.ok(sql, "no encontré el check de la paleta");
  assert.deepEqual([...sql.valores].sort(), [...PALETAS].sort(), `contra ${sql.archivo}`);
  assert.ok(!sql.valores.includes("comparacion"), "'comparacion' no es elegible: es la paleta interna de las miniaturas");
});

test("★★★ avatar_elegir() acepta las mismas formas y paletas que el check", () => {
  const forma = listaDeSql(/p_forma not in \(([^)]+)\)/);
  const paleta = listaDeSql(/p_paleta not in \(([^)]+)\)/);
  assert.ok(forma && paleta, "no encontré las validaciones dentro de avatar_elegir()");
  assert.deepEqual([...forma.valores].sort(), [...FORMAS].sort(), "formas: la función y el cliente");
  assert.deepEqual([...paleta.valores].sort(), [...PALETAS].sort(), "paletas: la función y el cliente");
});

test("★★★ la migración nueva solo AGREGA: ninguna forma ni paleta vieja desaparece", () => {
  /*
   * Hay estudiantes con avatar elegido. Si una forma saliera del check, su
   * fila dejaría de validar y su perfil se volvería imposible de guardar.
   */
  for (const vieja of ["decaedro", "prisma", "nucleo", "red", "cuna"]) {
    assert.ok(FORMAS.includes(vieja), `la forma «${vieja}» ya estaba elegida por alguien`);
  }
  for (const vieja of ["nocturno", "marea", "brasa", "aurora"]) {
    assert.ok(PALETAS.includes(vieja), `la paleta «${vieja}» ya estaba elegida por alguien`);
  }
});

test("★★★ cada forma y cada paleta tiene definición y nombre", () => {
  for (const f of FORMAS) {
    assert.ok(SHAPES[f], `la forma «${f}» no tiene geometría`);
    assert.ok(NOMBRE_FORMA[f], `la forma «${f}» no tiene nombre para el selector`);
    assert.ok(SHAPES[f].n >= 3, `«${f}»: menos de tres vértices no es una figura`);
  }
  for (const p of PALETAS) {
    assert.ok(PALETTES[p], `la paleta «${p}» no tiene colores`);
    assert.ok(NOMBRE_PALETA[p], `la paleta «${p}» no tiene nombre`);
  }
});

test("★★★ ninguna paleta repite otra: dos nombres para lo mismo no son dos paletas", () => {
  const huellas = new Map();
  for (const p of PALETAS) {
    const { c1, c2, node, ring, stroke } = PALETTES[p];
    const huella = [c1, c2, node, ring, stroke].join("|");
    assert.ok(!huellas.has(huella), `«${p}» es idéntica a «${huellas.get(huella)}»`);
    huellas.set(huella, p);
  }
});

test("★★★ ninguna forma repite otra geometría", () => {
  const huellas = new Map();
  for (const f of FORMAS) {
    const { n, rot, alt, step } = SHAPES[f];
    const huella = [n, rot, alt, step].join("|");
    assert.ok(!huellas.has(huella), `«${f}» tiene la misma geometría que «${huellas.get(huella)}»`);
    huellas.set(huella, f);
  }
});

test("★★★ las 216 combinaciones se pintan sin romperse", () => {
  let n = 0;
  for (const f of FORMAS) {
    for (const p of PALETAS) {
      for (const nivel of [1, 2, 3, 4]) {
        const a = computeAvatarProps(f, p, nivel);
        assert.ok(a.pts && a.pts.length > 0, `${f}/${p}/${nivel}: sin vértices`);
        assert.ok(!/NaN/.test(a.pts), `${f}/${p}/${nivel}: una coordenada salió NaN`);
        assert.equal(a.nodes.length, SHAPES[f].n, `${f}: un nodo por vértice`);
        if (nivel >= 4) assert.ok(a.chords.length > 0, `${f}/${nivel}: el Nivel IV teje cuerdas`);
        n++;
      }
    }
  }
  assert.equal(n, FORMAS.length * PALETAS.length * 4);
  assert.ok(n >= 216, `el catálogo tiene ${n} combinaciones`);
});
