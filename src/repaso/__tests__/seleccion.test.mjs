import { test } from "node:test";
import assert from "node:assert/strict";
import {
  diaBogota, diasEntre, actividadesDelPool, materiasCompletadas, unidadesDe, estadoRepaso, categoriaDe, seleccionarRepaso, estabaFallado,
} from "../seleccion.js";
import { MENSAJES, topePorMateria } from "../repaso.js";
import { ubicacionDeActividad } from "../../data/subjects.js";
import { REPASOS } from "../repasos.js";
import { ID_REPASO_CONTABILIDAD } from "../repaso.js";
import { FUERA_DEL_POOL_CONTABILIDAD } from "../contabilidad/index.js";

/*
 * El sorteo (B4) y el desbloqueo (B5), con fechas fijas y sin azar: `mezclar`
 * se inyecta como la identidad salvo donde se prueba el orden.
 *
 * Hasta el 22-nov-2026 el desbloqueo se probaba con el Repaso de Macro, que
 * se retiró con la materia (0258). Ahora se prueba con el de Contabilidad, el
 * único que queda, y lo que dependía de un banco de Macro (las dos lecturas
 * del Electrocardiograma) se prueba con un pool de mentira que tiene la misma
 * forma: dos variantes por clave.
 */
const CONTA = REPASOS[ID_REPASO_CONTABILIDAD];

const AHORA = new Date("2026-09-16T17:00:00Z"); // mediodía en Bogotá
const haceDias = (n, horas = 0) => new Date(AHORA.getTime() - n * 86400000 - horas * 3600000).toISOString();
const quieto = (xs) => [...xs];

/* Un pool de mentira: `m` es la materia, `n` el número. */
const it = (m, n) => ({ clave: `${m}:${n}`, materia: m, actividad: m });
const serie = (m, desde, hasta) => Array.from({ length: hasta - desde }, (_, k) => it(m, desde + k));

function sortear(pool, entradas, mezclar = quieto) {
  const historial = new Map(entradas.map(([clave, dias, ok]) => [clave, { ultimoEn: haceDias(dias), ultimoOk: ok, veces: 1 }]));
  return seleccionarRepaso({ pool, historial, ahora: AHORA, mezclar });
}
const claves = (r) => r.items.map((x) => x.clave).sort();

test("los mensajes de B5, literales", () => {
  assert.equal(MENSAJES.pocasActividades, "Completa 3 actividades para desbloquear el Repaso Diario.");
  assert.equal(MENSAJES.poolCorto, "Te faltan un par de actividades para que el Repaso tenga con qué armarse.");
  assert.equal(MENSAJES.hechoHoy, "Ya hiciste el repaso de hoy. Vuelve mañana.");
  assert.equal(MENSAJES.antesFallada, "🎯 Esta la habías fallado. Ahora sí.");
});

test("el día es el de Bogotá: las 23:30 del 16 allá ya son el 17 en UTC", () => {
  assert.equal(diaBogota(new Date("2026-09-17T04:30:00Z")), "2026-09-16");
  assert.equal(diaBogota(new Date("2026-09-17T05:00:00Z")), "2026-09-17");
  assert.equal(diasEntre(new Date("2026-09-17T04:59:00Z"), new Date("2026-09-17T05:01:00Z")), 1, "dos minutos, pero cruzan la medianoche de Bogotá");
});

test("desbloqueo: 3 actividades de sus temas y al menos 10 claves en el pool", () => {
  const estado = (ids, hechoHoy = false) => estadoRepaso({ hechas: new Set(ids), hechoHoy }, CONTA);
  assert.equal(estado(["t1-un-dia-o-un-ano", "t4-entra-o-sale-de-caja"]), "pocas-actividades");
  /* Lo que no es de sus temas no cuenta, ni el propio Repaso. */
  assert.equal(estado(["t1-un-dia-o-un-ano", "t4-entra-o-sale-de-caja", "modelo-iceberg", ID_REPASO_CONTABILIDAD]), "pocas-actividades");
  /* Tres actividades de una sola pregunta: desbloquea el conteo, pero el pool no llega a diez. */
  assert.equal(estado(["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago"]), "pool-corto");
  /* Una actividad que no aporta cuenta para las tres, no para el pool. */
  const noAporta = FUERA_DEL_POOL_CONTABILIDAD.map((f) => f.id).find((id) => CONTA.temas.includes(ubicacionDeActividad(id)?.temaId));
  assert.ok(noAporta, "hace falta una actividad de los temas del pool que no aporte ítems");
  assert.equal(estado([noAporta, "t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso"]), "pool-corto");
  assert.equal(estado([noAporta, "t1-en-cual-estado-aparece", "cu-de-que-familia"]), "listo");
  assert.equal(estado([noAporta, "t1-en-cual-estado-aparece", "cu-de-que-familia"], true), "hecho-hoy");
});

test("el pool se mide en claves: las dos lecturas de un término cuentan una vez", () => {
  /* Catorce claves: ocho con dos lecturas y seis con una, veintidós ítems. */
  const dosLecturas = Array.from({ length: 14 }, (_, k) => (k < 8
    ? [{ ...it("a", k), variante: "definicion" }, { ...it("a", k), variante: "fragmento" }]
    : [it("a", k)])).flat();
  assert.equal(dosLecturas.length, 22);
  assert.equal(unidadesDe(dosLecturas).length, 14);
});

test("materias completadas, en orden fijo y sin contar el Repaso", () => {
  assert.deepEqual(
    materiasCompletadas(new Set(["t4-entra-o-sale-de-caja", ID_REPASO_CONTABILIDAD, "t1-un-dia-o-un-ano", "modelo-iceberg"]), CONTA),
    ["introduccion-contabilidad", "efectivo-caja-menor-bancos"],
  );
  assert.deepEqual(actividadesDelPool(new Set([ID_REPASO_CONTABILIDAD, "modelo-iceberg"]), CONTA), []);
});

test("tope por materia: sin tope con una, 5 con dos, 4 con tres o cuatro", () => {
  assert.equal(topePorMateria(1), Infinity);
  assert.equal(topePorMateria(2), 5);
  assert.equal(topePorMateria(3), 4);
  assert.equal(topePorMateria(4), 4);
});

test("prioridad: 4 fallados, 3 olvidándose y 3 frescos, el más viejo primero en cada uno", () => {
  const materias = ["a", "b", "c", "d"];
  const pool = materias.flatMap((m) => serie(m, 0, 12));
  const h = [];
  /* Seis fallados, seis olvidándose, seis frescos y el resto sin ver, repartidos por las cuatro materias. */
  pool.slice(0, 6).forEach((x, k) => h.push([x.clave, 20 + k, false]));
  pool.slice(12, 18).forEach((x, k) => h.push([x.clave, 7 + k, true]));
  pool.slice(24, 30).forEach((x, k) => h.push([x.clave, k, true]));
  const r = sortear(pool, h);
  assert.equal(r.items.length, 10);
  const fallados = h.filter(([, , ok]) => !ok).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([c]) => c);
  const olvido = h.filter(([, d, ok]) => ok && d >= 7).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c]) => c);
  const frescos = h.filter(([, d, ok]) => ok && d < 7).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c]) => c);
  assert.deepEqual(claves(r), [...fallados, ...olvido, ...frescos].sort());
});

test("siete días de calendario de Bogotá ya es olvidarse; seis, todavía fresco", () => {
  const bien = (instante) => ({ ultimoEn: instante, ultimoOk: true });
  assert.equal(categoriaDe(bien(haceDias(7)), AHORA), "olvidandose");
  assert.equal(categoriaDe(bien(haceDias(6)), AHORA), "fresco");
  /* Seis días y trece horas de reloj, pero de las 11 de la noche del 9 al mediodía del 16 en Bogotá: siete días de calendario. */
  assert.equal(categoriaDe(bien(new Date("2026-09-10T04:00:00Z").toISOString()), AHORA), "olvidandose");
  assert.equal(categoriaDe({ ultimoEn: haceDias(30), ultimoOk: false }, AHORA), "fallado");
  assert.equal(categoriaDe(undefined, AHORA), "sin-ver");
});

test("el faltante pasa de un cupo al siguiente: 1 fallado, 0 olvidándose → 9 frescos, aunque haya sin ver", () => {
  /* Cuatro materias con sitio de sobra, y veinte ítems nunca vistos esperando: sin el arrastre, entrarían seis de ellos. */
  const pool = ["a", "b", "c", "d"].flatMap((m) => serie(m, 0, 8));
  const frescos = pool.filter((x) => Number(x.clave.split(":")[1]) < 3).slice(1);
  const h = [["a:0", 3, false], ...frescos.map((x, k) => [x.clave, k % 7, true])];
  assert.equal(frescos.length, 11);
  const r = sortear(pool, h);
  assert.equal(r.items.length, 10);
  const vistos = new Set(h.map(([c]) => c));
  assert.equal(r.items.filter((x) => !vistos.has(x.clave)).length, 0, "ni un sin ver: los nueve cupos son de frescos");
  assert.ok(r.items.some((x) => x.clave === "a:0"));
});

test("lo nunca visto entra después de los frescos y antes de repetir", () => {
  const pool = [...serie("a", 0, 15), ...serie("b", 0, 15)];
  const h = [["a:0", 10, false], ["a:1", 9, false], ["b:0", 2, true]];
  const r = sortear(pool, h);
  assert.equal(r.items.length, 10);
  assert.ok(["a:0", "a:1", "b:0"].every((c) => r.items.some((x) => x.clave === c)));
  assert.equal(r.items.filter((x) => !["a:0", "a:1", "b:0"].includes(x.clave)).length, 7, "siete sin ver");
});

test("con fallados de sobra y sin ver disponibles, primero van los sin ver y no la repetición", () => {
  /* Ocho fallados: cuatro entran por su cupo; los otros cuatro solo entrarían repitiendo, y antes van seis sin ver. */
  const pool = ["a", "b", "c", "d"].flatMap((m) => serie(m, 0, 6));
  const fallados = pool.filter((x) => Number(x.clave.split(":")[1]) < 2);
  const h = fallados.map((x, k) => [x.clave, 30 - k, false]);
  const r = sortear(pool, h);
  assert.equal(r.items.length, 10);
  assert.equal(r.items.filter((x) => h.some(([c]) => c === x.clave)).length, 4);
  assert.deepEqual(r.items.filter((x) => h.some(([c]) => c === x.clave)).map((x) => x.clave).sort(), h.slice(0, 4).map(([c]) => c).sort());
});

test("si no hay sin ver, se repite lo visto, el más viejo primero", () => {
  /* Una sola materia, para que el tope no se meta: catorce fallados, cuatro por su cupo y seis más como repetición. */
  const pool = serie("a", 0, 14);
  const h = pool.map((x, k) => [x.clave, 100 - k, false]);
  const r = sortear(pool, h);
  assert.deepEqual(claves(r), h.slice(0, 10).map(([c]) => c).sort());
});

test("tope 4 con cuatro materias: aunque una materia tenga todos los fallados", () => {
  const pool = [...serie("a", 0, 12), ...serie("b", 0, 4), ...serie("c", 0, 4), ...serie("d", 0, 4)];
  const h = serie("a", 0, 12).map((x, k) => [x.clave, 30 - k, false]);
  const r = sortear(pool, h);
  assert.equal(r.items.length, 10);
  assert.equal(r.items.filter((x) => x.materia === "a").length, 4);
  assert.equal(r.topeRelajado, false);
});

test("con dos materias el tope es 5; con una, no hay", () => {
  const dos = sortear([...serie("a", 0, 12), ...serie("b", 0, 12)], serie("a", 0, 12).map((x, k) => [x.clave, 30 - k, false]));
  assert.equal(dos.items.filter((x) => x.materia === "a").length, 5);
  const una = sortear(serie("a", 0, 12), serie("a", 0, 12).map((x, k) => [x.clave, 30 - k, false]));
  assert.equal(una.items.length, 10);
  assert.equal(una.tope, Infinity);
});

test("si el tope deja el repaso corto, se relaja y se dice", () => {
  const r = sortear([...serie("a", 0, 12), it("b", 0), it("c", 0)], []);
  assert.equal(r.items.length, 10);
  assert.equal(r.topeRelajado, true);
});

test("nunca dos ítems con la misma clave: las variantes de una clave salen de a una", () => {
  /* Catorce claves con dos lecturas cada una, como era el Electrocardiograma. */
  const pool = Array.from({ length: 14 }, (_, k) => [
    { ...it("a", k), variante: 1 },
    { ...it("a", k), variante: 2 },
  ]).flat();
  for (let k = 0; k < 30; k++) {
    const r = seleccionarRepaso({ pool, historial: new Map(), ahora: AHORA });
    assert.equal(r.items.length, 10);
    assert.equal(new Set(r.items.map((x) => x.clave)).size, 10);
  }
});

test("el orden de presentación es aleatorio: se baraja lo elegido, no se enseña por prioridad", () => {
  /* Todo visto: sin ítems nuevos, el único sitio donde entra `mezclar` es el orden final. */
  const pool = [...serie("a", 0, 6), ...serie("b", 0, 6)];
  const h = pool.map((x, k) => [x.clave, 20 - k, k !== 0]);
  const alReves = sortear(pool, h, (xs) => [...xs].reverse());
  const derecho = sortear(pool, h);
  assert.deepEqual(claves(alReves), claves(derecho), "mismos elegidos");
  assert.equal(derecho.items[0].clave, "a:0", "sin barajar, el fallado va primero");
  assert.notEqual(alReves.items[0].clave, "a:0", "barajado, ya no");
});

test("estabaFallado mira solo el último resultado", () => {
  const h = new Map([["x", { ultimoOk: false }], ["y", { ultimoOk: true }]]);
  assert.equal(estabaFallado(h, "x"), true);
  assert.equal(estabaFallado(h, "y"), false);
  assert.equal(estabaFallado(h, "z"), false);
});
