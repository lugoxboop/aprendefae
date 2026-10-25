import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 · ENCENDER LA SECUENCIA SIN TOCAR EL AVANCE DE NADIE.
 *
 * Lo que guarda un estudiante (completado, FP, lo que lee el Repaso) sale de
 * una sola fuente: fp_history, vía registrar_fp y actividades_hechas(). Estas
 * pruebas fijan que el Aprender de T1 no escribe ni lee esa fuente, ni en la
 * vista de cuatro capas ni en la secuencia, y que la pieza nueva cu0-a1b
 * solo agrega: así cambiar de vista no puede perder ni duplicar nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../../..");
const SRC = join(RAIZ, "src");
const leer = (p) => readFileSync(p, "utf8");

/* El grafo de imports relativos desde un archivo, entero. */
function alcanzables(desde) {
  const vistos = new Set();
  const pila = [desde];
  while (pila.length) {
    const f = pila.pop();
    if (vistos.has(f)) continue;
    vistos.add(f);
    for (const [, ruta] of leer(f).matchAll(/(?:import|export)[^"']*?from\s*["'](\.[^"']+)["']|import\(\s*["'](\.[^"']+)["']\s*\)/g)) {
      if (!ruta) continue;
      const r = resolve(dirname(f), ruta);
      const cand = [r, `${r}.js`, `${r}.jsx`, join(r, "index.js")].find((c) => existsSync(c) && !c.endsWith("/"));
      if (cand && /\.(m?js|jsx)$/.test(cand)) pila.push(cand);
    }
  }
  return [...vistos].map((f) => f.slice(SRC.length + 1));
}

/*
 * Las únicas puertas al avance guardado: registrar (registrarActividadCompletada
 * → otorgarFP → registrar_fp) y leer (actividades_hechas, fp_history). El grafo
 * alcanza piezas compartidas del kit (los Pulsos, la cuenta en la cabecera)
 * que importan Supabase para el perfil; lo que se prueba es que ningún
 * archivo alcanzable CRUZA una de esas puertas, ni guarda en localStorage.
 */
const PUERTAS = /registrarActividadCompletada\(|otorgarFP\(|["'](registrar_fp|actividades_hechas|fp_history)["']|localStorage\./;
const MIOS = /^(components\/mecanicas\/libros\/intro\/|components\/secuencia\/|components\/mecanicas\/maquinas\/CuatroCapas|data\/contabilidad(T1Secuencia|Intro|Piezas234)\.js)/;
const RAICES_APRENDER = {
  secuencia: ["components/mecanicas/libros/intro/secuencia/piezasT1.js", "components/secuencia/SecuenciaAprender.jsx"],
  capas: ["components/mecanicas/maquinas/CuatroCapas.jsx", "components/mecanicas/libros/intro/escenasIntro.jsx", "data/contabilidadPiezas234.js"],
};

test("★★★ (a) ninguna de las dos vistas de Aprender llega a FP, a completadas ni al Repaso", () => {
  for (const [vista, raices] of Object.entries(RAICES_APRENDER)) {
    const grafo = raices.flatMap((r) => alcanzables(join(SRC, r)));
    assert.ok(grafo.length > 5, `${vista}: el grafo salió vacío, la prueba no mide nada`);
    for (const f of grafo) {
      const quien = [...leer(join(SRC, f)).split("\n").entries()].filter(([, l]) => PUERTAS.test(l) && !/^\s*(\*|\/\/|\/\*)/.test(l));
      assert.deepEqual(quien.map(([n, l]) => `${f}:${n + 1} ${l.trim()}`), [], `${vista}: cruza una puerta del avance`);
      if (MIOS.test(f)) assert.doesNotMatch(leer(join(SRC, f)), /lib\/supabase|fp\/(otorgarFP|registrarActividad)|hacer\/completadas|repaso\//, `${vista}: ${f} importa el avance`);
    }
  }
});

test("★★★ (a) la secuencia solo recuerda en sessionStorage, bajo una clave propia, en qué pantalla va", () => {
  const src = leer(join(SRC, "components/secuencia/SecuenciaAprender.jsx"));
  assert.deepEqual([...src.matchAll(/(\w+Storage)\./g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i), ["sessionStorage"]);
  assert.match(src, /fae-secuencia:\$\{temaId\}/);
});

test("★★★ (a) el servidor no conoce ningún Aprender de T1: no hay fila que dé FP ni que cuente como hecha", () => {
  const dir = join(RAIZ, "supabase/migrations");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql"))) {
    assert.doesNotMatch(leer(join(dir, f)), /cu0-a\d/, `${f} nombra un Aprender de T1`);
  }
});

test("★★★ (a) el Repaso de T1 no lee ningún Aprender", async () => {
  const { ITEMS_T1, FUERA_T1 } = await import("../../../../../../repaso/contabilidad/t1.js");
  assert.doesNotMatch(JSON.stringify([ITEMS_T1, FUERA_T1]), /cu0-/);
});

test("★★★ (b)(c) el catálogo de T1 sigue con los cuatro Aprender de siempre y las piezas usan esos ids", async () => {
  const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../../../../../data/subjects.js");
  const { PIEZAS_T1_SECUENCIA } = await import("../piezasT1.js");
  const { PIEZAS_INTRO } = await import("../../../../../../data/contabilidadPiezas234.js");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "introduccion-contabilidad");
  const catalogo = actividadesDeTipo(tema, APRENDER).map((a) => a.id);
  assert.deepEqual(catalogo, [
    "cu0-a1-recorrido-de-un-hecho", "cu0-a2-la-ecuacion-contable", "cu0-a3-la-foto-y-la-pelicula", "cu0-a4-como-se-articulan",
  ]);
  assert.deepEqual(PIEZAS_INTRO.map((p) => p.id), catalogo, "las cuatro capas cambiaron de id");
  const nuevas = PIEZAS_T1_SECUENCIA.map((p) => p.id).filter((id) => !catalogo.includes(id));
  assert.deepEqual(nuevas, ["cu0-a1b-ocho-leen-lo-mismo"], "la secuencia trae un id que no es la pieza nueva");
  assert.deepEqual(PIEZAS_T1_SECUENCIA.map((p) => p.id).filter((id) => catalogo.includes(id)), catalogo);
  assert.ok(!catalogo.includes("cu0-a1b-ocho-leen-lo-mismo"), "cu0-a1b no entra al catálogo: no da FP ni cuenta");
});
