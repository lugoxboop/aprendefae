import { test } from "node:test";
import assert from "node:assert/strict";
import { vistaPreviaDelDia, semillaDelDia, faltanActividades } from "../seleccion.js";
import { poolDe } from "../items.js";
import { unidadesDe } from "../seleccion.js";
import { MINIMO_ACTIVIDADES } from "../repaso.js";
import { barajadorDe, hash32 } from "../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA VISTA PREVIA DEL DÍA: solo lectura, y la MISMA tirada que la partida.
 *
 * El banner promete «Hoy entran: A · B · C» antes de empezar, y la partida
 * vuelve a sortear al arrancar. Si las dos tiradas no coincidieran, el banner
 * estaría mintiendo — y un aviso que miente es peor que no darlo. Eso es lo
 * que estas pruebas defienden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Seis actividades de tres temas distintos: pool de sobra y tres materias. */
const HECHAS = new Set([
  "memorama-corazon", "cual-componente", "electrocardiograma",
  "memorama-tesoreria", "cobra-gasta-o-pide",
  "memorama-banco-central",
]);

const AHORA = new Date("2026-09-22T15:00:00Z"); // 10:00 en Bogotá
const huella = (r) => r.items.map((x) => x.clave).join("|");
const previa = (extra = {}) =>
  vistaPreviaDelDia({ hechas: HECHAS, historial: new Map(), ahora: AHORA, usuarioId: "u1", ...extra });

test("dos llamadas del mismo día y estudiante dan EXACTAMENTE la misma mezcla", () => {
  assert.equal(huella(previa()), huella(previa()), "el banner y la partida tienen que coincidir");
  assert.deepEqual(previa().temas, previa().temas);
});

test("otro día da otra mezcla, y otro estudiante también", () => {
  const otroDia = previa({ ahora: new Date("2026-09-23T15:00:00Z") });
  const otroAlumno = previa({ usuarioId: "u2" });
  assert.notEqual(huella(previa()), huella(otroDia), "la mezcla del día es la del día");
  assert.notEqual(huella(previa()), huella(otroAlumno), "y es de cada quien");
});

test("la semilla es el estudiante y el día de Bogotá, no la hora", () => {
  /* Las 23:00 UTC son todavía el mismo día en Bogotá: misma semilla. */
  assert.equal(semillaDelDia("u1", new Date("2026-09-22T15:00:00Z")), "u1:2026-09-22");
  assert.equal(semillaDelDia("u1", new Date("2026-09-22T23:00:00Z")), "u1:2026-09-22");
  /* Y las 02:00 UTC del 23 siguen siendo el 22 en Bogotá. */
  assert.equal(semillaDelDia("u1", new Date("2026-09-23T02:00:00Z")), "u1:2026-09-22");
  /* Sin sesión, una semilla estable igualmente: el invitado no revienta. */
  assert.equal(semillaDelDia(null, AHORA), "invitado:2026-09-22");
});

test("devuelve diez ítems y los temas de los que salen, sin repetir tema", () => {
  const r = previa();
  assert.equal(r.cuantos, 10);
  assert.equal(r.items.length, 10);
  assert.ok(r.temas.length >= 1);
  assert.equal(new Set(r.temas).size, r.temas.length, "cada tema una sola vez");
  /* Todo tema anunciado sale de verdad en la mezcla. */
  const presentes = new Set(r.items.map((x) => x.materia));
  for (const t of r.temas) assert.ok(presentes.has(t), `${t} se anuncia y no está`);
  /* Y ningún tema de la mezcla se queda sin anunciar. */
  for (const t of presentes) assert.ok(r.temas.includes(t), `${t} está y no se anuncia`);
});

test("NO tiene efectos secundarios: las entradas quedan intactas", () => {
  const hechas = new Set(HECHAS);
  const historial = new Map([["sala-monitores:hospital", { ultimoEn: "2026-09-01T10:00:00Z", ultimoOk: false, veces: 1 }]]);
  const copiaHechas = new Set(hechas);
  const copiaHistorial = new Map(historial);

  vistaPreviaDelDia({ hechas, historial, ahora: AHORA, usuarioId: "u1" });

  assert.deepEqual([...hechas].sort(), [...copiaHechas].sort(), "no toca lo completado");
  assert.equal(historial.size, copiaHistorial.size, "no toca el historial");
  for (const [k, v] of copiaHistorial) assert.deepEqual(historial.get(k), v);
});

test("faltanActividades cuenta hacia atrás y se queda en cero", () => {
  assert.equal(faltanActividades(new Set()), MINIMO_ACTIVIDADES);
  assert.equal(faltanActividades(new Set(["memorama-corazon"])), MINIMO_ACTIVIDADES - 1);
  assert.equal(faltanActividades(new Set(["memorama-corazon", "cual-componente"])), MINIMO_ACTIVIDADES - 2);
  assert.equal(faltanActividades(HECHAS), 0, "con seis ya no falta ninguna");
  /* Las de fuera del pool no cuentan para desbloquearlo. */
  assert.equal(faltanActividades(new Set(["asedio-estrategico", "mapa-causal"])), MINIMO_ACTIVIDADES);
});

/* ─────────────────── el barajador sembrado ─────────────────── */

test("el barajador sembrado repite con la misma semilla y cambia con otra", () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = barajadorDe("misma");
  const b = barajadorDe("misma");
  const c = barajadorDe("otra");
  assert.deepEqual(a(xs), b(xs), "misma semilla, misma salida");
  assert.deepEqual(a(xs), b(xs), "y también en la segunda tirada");
  assert.notDeepEqual(barajadorDe("misma")(xs), c(xs));
});

test("dos tiradas seguidas del mismo barajador NO son iguales", () => {
  /*
   * seleccionarRepaso lo llama tres veces con propósitos distintos —los sin
   * ver, las variantes y el orden final—. Si las tres dieran el mismo orden, el
   * sorteo quedaría sesgado de una forma difícil de ver.
   */
  const xs = [1, 2, 3, 4, 5, 6, 7, 8];
  const m = barajadorDe("u1:2026-09-22");
  assert.notDeepEqual(m(xs), m(xs));
});

test("baraja de verdad: no devuelve la lista tal cual ni pierde elementos", () => {
  const xs = [...Array(12).keys()];
  const m = barajadorDe("cualquiera");
  const r = m(xs);
  assert.equal(r.length, xs.length);
  assert.deepEqual([...r].sort((a, b) => a - b), xs, "los mismos elementos");
  assert.notDeepEqual(r, xs, "y en otro orden");
  assert.deepEqual(xs, [...Array(12).keys()], "sin tocar el original");
});

test("el hash es estable y reparte", () => {
  assert.equal(hash32("u1:2026-09-22"), hash32("u1:2026-09-22"));
  assert.notEqual(hash32("u1:2026-09-22"), hash32("u1:2026-09-23"));
  assert.ok(Number.isInteger(hash32("x")) && hash32("x") >= 0);
});

test("el pool de prueba da para más de diez unidades: la mezcla elige de verdad", () => {
  assert.ok(unidadesDe(poolDe(HECHAS)).length > 10, "si no, no habría nada que sortear");
});
