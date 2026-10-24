import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · LOS IDS PUBLICADOS NO CAMBIAN NI DESAPARECEN.
 *
 * Contabilidad ya tiene estudiantes activos, y lo que la base guarda de T1
 * está atado al texto del id:
 *
 *   · public.actividad_catalogo  una fila por cada t1-* (migraciones 0044 a
 *                                0046): de ahí saca registrar_fp la
 *                                dificultad y los FP base.
 *   · public.fp_history          una fila por partida terminada, con
 *                                activity_id y subject_id. De aquí salen los
 *                                FP del estudiante, las actividades hechas
 *                                (actividades_hechas) y el ranking.
 *   · public.fp_detalle          el acierto ítem por ítem de cada partida,
 *                                con activity_id; lo lee el panel docente.
 *   · public.partida_en_curso    la partida a medias, con activity_id como
 *                                CLAVE FORÁNEA al catálogo y ON DELETE
 *                                CASCADE: borrar la fila del catálogo borra
 *                                las partidas en curso de todos.
 *   · y en el navegador, sin base: «Así se juega» visto
 *     (fae-asi-se-juega:v1:<id>:<usuario>) y las novedades abiertas
 *     (aprendefae-novedades:<usuario>), las dos con el id dentro.
 *
 * Las piezas de Aprender (cu0-a*) no dejan fila: no dan FP. Pero su id es el
 * que tienen el catálogo de subjects.js, el registro de escenas y los
 * enlaces con hash.
 *
 * Renombrar un id, entonces, no da error: deja a cada estudiante con su
 * historial colgado de un id que ya no existe, el camino le dice que no ha
 * hecho nada, y lo cobra otra vez como primera vez. Por eso aquí la regla es
 * solo agregar. Si un id tiene que dejar de verse, se retira (`pendiente`,
 * como hizo B con b5-t6-a7), nunca se borra ni se renombra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
const TEMA = "introduccion-contabilidad";

/* La lista congelada. Si esta prueba se pone roja, no se corrige la lista: se deshace el cambio. */
const APRENDER_PUBLICADOS = [
  "cu0-a1-recorrido-de-un-hecho",
  "cu0-a2-la-ecuacion-contable",
  "cu0-a3-la-foto-y-la-pelicula",
  "cu0-a4-como-se-articulan",
];
const HACER_PUBLICADOS = {
  "t1-desde-donde-preguntan": { dificultad: "facil", fpBase: 10, migracion: "0044" },
  "t1-que-entro-y-que-salio": { dificultad: "facil", fpBase: 10, migracion: "0044" },
  "t1-que-le-pasa-a-cada-uno": { dificultad: "medio", fpBase: 25, migracion: "0045" },
  "t1-la-ecuacion-en-movimiento": { dificultad: "dificil", fpBase: 50, migracion: "0045" },
  "t1-en-cual-estado-aparece": { dificultad: "dificil", fpBase: 50, migracion: "0045" },
  "t1-la-articulacion": { dificultad: "experto", fpBase: 90, migracion: "0045" },
  "t1-donde-se-rompio": { dificultad: "medio", fpBase: 25, migracion: "0046" },
};
const TODOS = [...APRENDER_PUBLICADOS, ...Object.keys(HACER_PUBLICADOS)];

const { SUBJECTS, APRENDER, HACER } = await import("../../data/subjects.js");
const tema = SUBJECTS[MATERIA]?.topics.find((t) => t.id === TEMA);

test("★★ el tema sigue siendo «introduccion-contabilidad» dentro de «contabilidad»", () => {
  assert.ok(tema, `no hay tema «${TEMA}» en SUBJECTS.${MATERIA}: es el topic_id de las siete filas del catálogo`);
});

test("★★ las 4 piezas de Aprender siguen publicadas con su id", () => {
  for (const id of APRENDER_PUBLICADOS) {
    const a = tema.actividades.find((x) => x.id === id);
    assert.ok(a, `${id}: desapareció del catálogo de subjects.js`);
    assert.equal(a.clasificacion.tipo, APRENDER, `${id}: dejó de ser Aprender`);
  }
});

test("★★ los 7 Hacer siguen publicados con su id, abiertos y con la misma clasificación", () => {
  for (const [id, c] of Object.entries(HACER_PUBLICADOS)) {
    const a = tema.actividades.find((x) => x.id === id);
    assert.ok(a, `${id}: desapareció del catálogo de subjects.js`);
    assert.equal(a.clasificacion.tipo, HACER);
    assert.equal(a.pendiente, undefined, `${id}: quedó retirado; un retiro se decide arriba, no aquí`);
    /* La dificultad y los FP base viven también en la fila del servidor: si el cliente cambia solo, los dos dicen cosas distintas. */
    assert.equal(a.clasificacion.dificultad, c.dificultad, `${id}: la dificultad no coincide con la fila del catálogo`);
    assert.equal(a.clasificacion.fpBase, c.fpBase, `${id}: los FP base no coinciden con la fila del catálogo`);
  }
});

test("★★ la vista sigue sabiendo pintar cada id: las 7 puertas de Hacer y las 4 piezas", async () => {
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const { PIEZAS_INTRO } = await import("../../data/contabilidadPiezas234.js");
  const { ESCENAS_INTRO } = await import("../../components/mecanicas/libros/intro/escenasIntro.jsx");
  const puertas = JUEGOS.map((j) => j.id);
  for (const id of Object.keys(HACER_PUBLICADOS)) assert.ok(puertas.includes(id), `${id}: ya no tiene componente en JUEGOS`);
  assert.deepEqual(PIEZAS_INTRO.map((p) => p.id), APRENDER_PUBLICADOS);
  for (const id of APRENDER_PUBLICADOS) assert.ok(ESCENAS_INTRO[id], `${id}: ya no tiene escenas`);
});

/* ═══════════════════ LA BASE ═══════════════════ */

const CARPETA = new URL("../../../supabase/migrations/", import.meta.url);
const migraciones = readdirSync(CARPETA).filter((f) => f.endsWith(".sql")).sort();
const leer = (f) => readFileSync(new URL(f, CARPETA), "utf8");
/* Sin comentarios: un «delete» mencionado en un comentario no borra nada. */
const sinComentarios = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");

test("★★ cada t1-* tiene su fila en el catálogo del servidor, con el tema y los FP que dice el cliente", () => {
  for (const [id, c] of Object.entries(HACER_PUBLICADOS)) {
    const archivo = migraciones.find((f) => f.startsWith(c.migracion));
    assert.ok(archivo, `no está la migración ${c.migracion}`);
    const fila = new RegExp(`\\('${id}',\\s*'${MATERIA}',\\s*'${TEMA}',\\s*'evaluativa',\\s*'${c.dificultad}',\\s*${c.fpBase},\\s*1\\)`);
    assert.match(sinComentarios(leer(archivo)), fila, `${archivo}: la fila de ${id} cambió`);
  }
});

test("★★ ninguna migración borra, renombra ni mueve un id de T1", () => {
  /* Las sentencias que pueden quitarle a un estudiante lo que ya hizo. `insert … on conflict do update` no es una: la fila queda. */
  const PELIGROSA = /^\s*(delete|update|alter|drop|truncate)\b/i;
  const malas = [];
  for (const f of migraciones) {
    for (const sentencia of sinComentarios(leer(f)).split(";")) {
      if (!PELIGROSA.test(sentencia)) continue;
      const toca = [...TODOS, TEMA].filter((id) => sentencia.includes(`'${id}'`) || sentencia.includes(`'${id}%`));
      if (toca.length) malas.push(`${f}: ${sentencia.trim().split("\n")[0].slice(0, 70)} → ${toca.join(", ")}`);
    }
  }
  assert.deepEqual(malas, [], "una migración toca ids publicados de T1; lo que es de estudiantes no se borra ni se renombra");
});
