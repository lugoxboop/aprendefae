import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SUBJECTS, HACER, actividadesDeTipo, desafioDe } from "../../data/subjects.js";
import { ACTIVIDADES, DESAFIO, FP_DEL_TEMA } from "../../data/contabilidadActividades.js";
import { VISTAS, vistaDeTema } from "../../ruta.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TEMA REGISTRADO CONTRA SU FICHA.
 *
 * subjects.js es el registro del sitio y contabilidadActividades.js es la
 * ficha del capítulo. Las dos listas dicen lo mismo y están escritas aparte
 * —la primera con la forma que pide la interfaz, la segunda con la del
 * capítulo—, así que pueden separarse en silencio. Esto lo impide.
 *
 * La prueba del catálogo del servidor (src/fp/__tests__/catalogo.test.mjs) ya
 * compara subjects.js contra las migraciones. Con esta, la cadena queda
 * cerrada: ficha → registro → servidor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
const JUEGOS = actividadesDeTipo(TEMA, HACER);

test("la materia dejó de estar vacía: tiene su primer tema", () => {
  assert.equal(SUBJECTS.contabilidad.topics.length, 1);
  assert.ok(TEMA, "no está «cuentas-debe-haber»");
  assert.equal(TEMA.title, "Las cuentas, el debe y el haber");
});

test("★ el registro dice exactamente lo mismo que la ficha del capítulo", () => {
  assert.equal(JUEGOS.length, ACTIVIDADES.length, "no son doce en los dos sitios");
  for (const ficha of ACTIVIDADES) {
    const registrada = JUEGOS.find((a) => a.id === ficha.id);
    assert.ok(registrada, `${ficha.id}: está en la ficha y no en subjects.js`);
    assert.equal(registrada.nombre, ficha.nombre, `${ficha.id}: nombre`);
    assert.equal(registrada.clasificacion.dificultad, ficha.dificultad, `${ficha.id}: dificultad`);
    assert.equal(registrada.clasificacion.fpBase, ficha.fpBase, `${ficha.id}: FP base`);
  }
});

test("★ los FP del camino son los 565 de la ficha", () => {
  const suma = JUEGOS.reduce((s, a) => s + a.clasificacion.fpBase, 0);
  assert.equal(suma, FP_DEL_TEMA);
  /* Y el número escrito, para que la igualdad de arriba no sea circular. */
  assert.equal(suma, 565);
  /* 2×10 + 3×25 + 4×50 + 3×90, la distribución de los otros cuatro temas. */
  const cuenta = (d) => JUEGOS.filter((a) => a.clasificacion.dificultad === d).length;
  assert.deepEqual([cuenta("facil"), cuenta("medio"), cuenta("dificil"), cuenta("experto")], [2, 3, 4, 3]);
});

test("★ el desafío está al lado del camino, no dentro", () => {
  const desafio = desafioDe(TEMA);
  assert.ok(desafio, "no está el desafío");
  assert.equal(desafio.id, DESAFIO.id);
  assert.equal(desafio.nombre, DESAFIO.nombre);
  assert.equal(desafio.clasificacion.etapas, DESAFIO.etapas);
  assert.equal(desafio.clasificacion.fpBase, DESAFIO.fpBase);
  /* Lo que de verdad importa: que NO cuente para «tema completo». */
  assert.ok(!JUEGOS.some((a) => a.id === DESAFIO.id),
    "el desafío entró en el camino: un desafío opcional que cuenta deja de ser opcional");
  /* La regla del Kit, tal como la aplica el servidor. */
  assert.equal(desafio.clasificacion.fpBase * Math.min(desafio.clasificacion.etapas, 4), 360);
});

test("el tema tiene ruta propia y se llega a ella desde el índice", () => {
  assert.ok(VISTAS.has("cuentas-debe-haber"));
  assert.equal(vistaDeTema("cuentas-debe-haber"), "cuentas-debe-haber");
});

/* ─────────── lo construido, contra lo declarado ─────────── */

/*
 * La vista se lee como texto en vez de importarse: importarla arrastraría
 * React, el proveedor de sesión y media interfaz para comprobar una lista de
 * cinco cadenas. Es el mismo trato que la prueba del catálogo le da a los
 * archivos .sql.
 */
const VISTA = readFileSync("src/components/CuentasDebeHaberView.jsx", "utf8");
const CONSTRUIDAS = [...VISTA.matchAll(/\{ id: "([a-z0-9-]+)", Mecanica:/g)].map((m) => m[1]);

test("★ lo que la vista construye es EXACTAMENTE lo que el tema no marca pendiente", () => {
  /*
   * Las dos listas tienen que decir lo mismo, y no por orden sino por
   * contenido. Si se separan pasa una de dos cosas, las dos malas: un nodo del
   * camino que se abre en blanco, o una actividad jugable a la que el panel
   * docente no le sabe poner nombre porque la prueba de cobertura la estaba
   * dejando pasar por pendiente.
   */
  const jugables = JUEGOS.filter((a) => !a.pendiente).map((a) => a.id);
  assert.deepEqual([...CONSTRUIDAS].sort(), [...jugables].sort());
  assert.equal(CONSTRUIDAS.length, 5);
});

test("★ ninguna actividad pendiente llega al camino", () => {
  /*
   * Es lo que hace segura la exención de la prueba del panel docente: una
   * actividad marcada pendiente no la puede abrir nadie, así que no puede
   * emitir un ítem que el profesor no sepa leer.
   */
  const desafio = desafioDe(TEMA);
  const pendientes = [...JUEGOS, ...(desafio ? [desafio] : [])].filter((a) => a.pendiente);
  assert.equal(pendientes.length, 8, "siete juegos y el desafío");
  for (const a of pendientes) {
    assert.ok(!CONSTRUIDAS.includes(a.id), `${a.id}: está marcada pendiente y la vista la dibuja`);
  }
});

test("★ «tema completo» sigue pidiendo las doce, no las cinco de hoy", () => {
  /*
   * Si el tema declarara solo lo construido, alguien terminaría las cinco, se
   * ganaría la medalla de tema completo, y al entrar las otras siete se la
   * quitaríamos. Declarar las doce desde el principio es lo que impide esa
   * regresión — y esta prueba es lo que impide que alguien «arregle» la lista
   * recortándola a lo que se puede jugar.
   */
  assert.equal(JUEGOS.length, 12);
  assert.ok(CONSTRUIDAS.length < JUEGOS.length,
    "si ya están las doce construidas, esta prueba cumplió su función y se puede quitar");
});
