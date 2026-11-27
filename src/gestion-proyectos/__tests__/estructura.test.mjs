/*
 * Gestión de Proyectos: el esqueleto se sostiene y NO se ve para estudiantes.
 *
 *   1. Los 49 procesos de la guía V6, sin ids repetidos, cada uno con área y
 *      al menos un documento; fundamentos = capítulos 1 y 2.
 *   2. Las piezas que entren (Gen, Jane) usan el prefijo gp26-, no chocan con
 *      ningún id del sitio (ni retirado) y etiquetan subtemas que existen.
 *   3. Mientras PUBLICADAS esté vacío, la materia no está en subjects.js ni
 *      en la portada: ni tarjeta, ni medallas, ni panel docente.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MODULOS, SUBTEMAS, AREAS, MATERIA } from "../estructura.js";
import { PIEZAS, PUBLICADAS, PREFIJO_PIEZA, todasLasPiezas, materiaParaRegistro, coberturaDe } from "../catalogo.js";
import { SUBJECTS, ACTIVIDADES_TRANSVERSALES } from "../../data/subjects.js";
import { NOMBRE_DE_RETIRADA } from "../../data/retiradas.js";

test("el esqueleto: fundamentos y los cinco grupos de procesos, en orden", () => {
  assert.deepEqual(MODULOS.map((m) => m.id), [
    "gp-fundamentos", "gp-inicio", "gp-planificacion", "gp-ejecucion", "gp-monitoreo-control", "gp-cierre",
  ]);
  assert.deepEqual(MODULOS[0].capitulos, [1, 2]);
  const porGrupo = MODULOS.slice(1).map((m) => m.procesos.length);
  assert.deepEqual(porGrupo, [2, 24, 10, 12, 1], "la guía V6 reparte 49 procesos así");
});

test("ids de subtema únicos; cada proceso con área de la guía y documentos", () => {
  const ids = SUBTEMAS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SUBTEMAS.filter((x) => x.moduloId !== "gp-fundamentos")) {
    assert.ok(AREAS[s.area], `${s.id} sin área válida`);
    assert.ok(s.documentos.length > 0, `${s.id} sin documentos`);
    assert.equal(s.id, `gp-${s.seccion.replace(".", "-")}`);
    assert.equal(Number(s.seccion.split(".")[0]), AREAS[s.area].cap, `${s.id}: la sección no es de su área`);
  }
});

test("hay un espacio por módulo y las piezas que entren cumplen las reglas", () => {
  assert.deepEqual(Object.keys(PIEZAS), MODULOS.map((m) => m.id));
  const existentes = new Set([
    ...Object.values(SUBJECTS).flatMap((m) => [m.id, ...m.topics.flatMap((t) => [t.id, ...(t.actividades ?? []).map((a) => a.id)])]),
    ...ACTIVIDADES_TRANSVERSALES.map((a) => a.id),
    ...Object.keys(NOMBRE_DE_RETIRADA),
  ]);
  const subtemas = new Set(SUBTEMAS.map((s) => s.id));
  const piezas = todasLasPiezas();
  assert.equal(new Set(piezas.map((p) => p.id)).size, piezas.length, "ids de pieza repetidos");
  for (const pz of piezas) {
    assert.ok(pz.id.startsWith(PREFIJO_PIEZA), `${pz.id} sin prefijo ${PREFIJO_PIEZA}`);
    assert.ok(!existentes.has(pz.id), `${pz.id} choca con un id que ya existe en el sitio`);
    assert.ok(["aprender", "hacer"].includes(pz.tipo), `${pz.id}: tipo`);
    assert.ok(pz.subtemas?.length > 0 && pz.subtemas.every((s) => subtemas.has(s)), `${pz.id}: subtemas`);
    if (pz.tipo === "hacer") assert.ok(pz.clasificacion?.fpBase > 0, `${pz.id}: una Hacer lleva clasificación`);
  }
  for (const m of MODULOS) assert.ok(!existentes.has(m.id), `el módulo ${m.id} choca con un tema existente`);
  for (const id of PUBLICADAS) assert.ok(piezas.some((p) => p.id === id), `${id} publicada sin pieza`);
});

test("la cobertura cuenta los huecos: un proceso sin ninguna pieza cuenta como hueco", () => {
  for (const m of MODULOS) {
    const conPieza = new Set((PIEZAS[m.id] ?? []).flatMap((pz) => pz.subtemas ?? []));
    const huecos = m.procesos.filter((pr) => !conPieza.has(pr.id)).length;
    assert.equal(coberturaDe(m.id).sinPieza, huecos, m.id);
  }
});

test("nada visible a estudiantes sin el visto bueno de Mateo", () => {
  if (PUBLICADAS.length > 0) return; // publicada a sabiendas: la prueba se duerme
  assert.equal(SUBJECTS[MATERIA], undefined, "la materia no va en subjects.js hasta publicarse");
  assert.equal(materiaParaRegistro().topics.length, 0);
  const portada = readFileSync(new URL("../../components/HomeScreen.jsx", import.meta.url), "utf8");
  assert.ok(!portada.includes(MATERIA), "la portada no enlaza la materia");
});
