import test from "node:test";
import assert from "node:assert/strict";

import { NIVEL, UMBRALES } from "../alertas.js";
import { CORTE_ALTO } from "../bandas.js";
import {
  DIAGNOSTICOS_SIN_DATOS,
  contextoDeGrupo,
  diagnosticarA,
  diagnosticoDelGrupo,
  FACTOR_LENTO,
  MINIMO_PARA_COMPARAR,
} from "../diagnosticos.js";
import { CUADRANTES, cuadranteDe, esfuerzoContraResultado, ordenar, porCuadrante } from "../esfuerzoResultado.js";
import { fraseDeHoy, fraseEnTexto } from "../frase.js";
import { AJUSTABLES, POR_DEFECTO, claveSilencio, umbralesCon } from "../preferenciasDocente.js";

/*
 * Lo que estas pruebas protegen no es la aritmética: es que ninguna regla se
 * quede muerta. Los umbrales de alertas.js ya estuvieron una vez en 0–1
 * comparándose contra datos en 0–100, así que no se disparaban nunca y nadie
 * se enteró. Aquí cada diagnóstico tiene un estudiante que SÍ lo dispara y
 * uno parecido que NO, para que una regla muerta falle en vez de callar.
 */

const base = {
  user_id: "u1",
  full_name: "Ana Pérez",
  nickname: "ana",
  n_registros: 6,
  dias_inactivo: 0,
  pct_evaluativa: 80,
  n_evaluativas: 4,
  pct_exploratoria: 80,
  n_exploratorias: 4,
  duracion_media_ms: 180000,
};
const quien = (extra) => ({ ...base, ...extra });
const ids = (ds) => ds.map((d) => d.id);

test("dejó de entrar: tenía ritmo y lleva más de un ciclo fuera", () => {
  const d = diagnosticarA(quien({ dias_inactivo: 12, n_registros: 6 }));
  assert.ok(ids(d).includes("dejo-de-entrar"));
  assert.equal(d[0].nivel, NIVEL.URGENTE);
  /* La frase lleva las dos cifras que la justifican, no solo la etiqueta. */
  assert.match(d[0].dice, /12 días/);
  assert.match(d[0].dice, /6 actividades/);
});

test("quien solo asomó la cabeza no entra en la lista roja", () => {
  const d = diagnosticarA(quien({ dias_inactivo: 12, n_registros: 1 }));
  assert.ok(!ids(d).includes("dejo-de-entrar"));
  assert.ok(ids(d).includes("asomo-y-no-volvio"));
  assert.equal(d.find((x) => x.id === "asomo-y-no-volvio").nivel, NIVEL.INFO);
});

test("le cuesta: más lento que la clase Y fallando", () => {
  const contexto = { medianaMs: 100000 };
  const lentoYFalla = diagnosticarA(quien({ duracion_media_ms: 100000 * FACTOR_LENTO, pct_evaluativa: 40, pct_exploratoria: 40 }), contexto);
  assert.ok(ids(lentoYFalla).includes("esfuerzo-sin-resultado"));

  /* Lento pero acertando NO es una alerta: es el mejor comportamiento que hay. */
  const lentoYAcierta = diagnosticarA(quien({ duracion_media_ms: 400000, pct_evaluativa: 95, pct_exploratoria: 95 }), contexto);
  assert.ok(!ids(lentoYAcierta).includes("esfuerzo-sin-resultado"));
});

test("sin mediana del grupo, las reglas que comparan contra la clase callan", () => {
  const d = diagnosticarA(quien({ duracion_media_ms: 999999, pct_evaluativa: 10, pct_exploratoria: 10 }), { medianaMs: null });
  assert.ok(!ids(d).includes("esfuerzo-sin-resultado"));
});

test("rápido y fallando, y su inverso: rápido y acertando", () => {
  const rapido = UMBRALES.duracionRapidaMs - 1000;
  const falla = diagnosticarA(quien({ duracion_media_ms: rapido, pct_evaluativa: 30, pct_exploratoria: 30 }));
  assert.ok(ids(falla).includes("rapido-sin-leer"));
  assert.ok(!ids(falla).includes("acierta-sin-tiempo"));

  const acierta = diagnosticarA(quien({ duracion_media_ms: rapido, pct_evaluativa: CORTE_ALTO + 5, pct_exploratoria: CORTE_ALTO + 5 }));
  assert.ok(ids(acierta).includes("acierta-sin-tiempo"));
  assert.ok(!ids(acierta).includes("rapido-sin-leer"));
});

test("«acierta muy rápido» no acusa a nadie", () => {
  const d = diagnosticarA(quien({ duracion_media_ms: 10000, pct_evaluativa: 100, pct_exploratoria: 100 }));
  const uno = d.find((x) => x.id === "acierta-sin-tiempo");
  assert.ok(uno);
  for (const palabra of [/tramp/i, /copi/i, /hizo trampa/i, /sospech/i, /fraude/i]) {
    assert.ok(!palabra.test(`${uno.nombre} ${uno.dice}`), `el texto no debe acusar: ${palabra}`);
  }
});

test("el umbral que pone el profesor cambia quién sale", () => {
  const e = quien({ dias_inactivo: 5, n_registros: 6 });
  assert.ok(!ids(diagnosticarA(e)).includes("dejo-de-entrar"), "con 7 días por defecto, 5 no avisa");
  const suyos = umbralesCon({ ...POR_DEFECTO, diasInactividad: 3 });
  assert.ok(ids(diagnosticarA(e, { medianaMs: null }, suyos)).includes("dejo-de-entrar"), "con 3 días sí");
});

test("el «no aplica» silencia ese diagnóstico, no al estudiante", () => {
  const cohorte = [quien({ user_id: "u1", dias_inactivo: 12, n_registros: 6, duracion_media_ms: 10000, pct_evaluativa: 20, pct_exploratoria: 20 })];
  const todos = diagnosticoDelGrupo(cohorte);
  assert.equal(todos.length, 1);
  assert.ok(todos[0].todos.length >= 2);

  const callado = diagnosticoDelGrupo(cohorte, new Set([claveSilencio("u1", "dejo-de-entrar")]));
  assert.equal(callado.length, 1, "sigue en la lista por su otro diagnóstico");
  assert.ok(!ids(callado[0].todos).includes("dejo-de-entrar"));

  const mudo = diagnosticoDelGrupo(cohorte, new Set(todos[0].todos.map((d) => claveSilencio("u1", d.id))));
  assert.equal(mudo.length, 0, "silenciados todos, desaparece de la lista");
});

test("la mediana no se usa con un grupo demasiado pequeño", () => {
  const pocos = Array.from({ length: MINIMO_PARA_COMPARAR - 1 }, (_, i) => quien({ user_id: `u${i}` }));
  assert.equal(contextoDeGrupo(pocos).medianaMs, null);
  const bastantes = Array.from({ length: MINIMO_PARA_COMPARAR }, (_, i) => quien({ user_id: `u${i}` }));
  assert.equal(contextoDeGrupo(bastantes).medianaMs, 180000);
});

test("la mediana ignora a quien no tiene tiempo medido", () => {
  const c = [
    quien({ user_id: "a", duracion_media_ms: 100000 }),
    quien({ user_id: "b", duracion_media_ms: null }),
    quien({ user_id: "c", duracion_media_ms: 0 }),
    quien({ user_id: "d", duracion_media_ms: 200000 }),
    quien({ user_id: "e", duracion_media_ms: 300000 }),
    quien({ user_id: "f", duracion_media_ms: 400000 }),
  ];
  assert.equal(contextoDeGrupo(c).nMedidos, 4);
  assert.equal(contextoDeGrupo(c).medianaMs, 250000);
});

test("los diagnósticos que no se pueden calcular se declaran con su porqué", () => {
  assert.ok(DIAGNOSTICOS_SIN_DATOS.length >= 3);
  for (const d of DIAGNOSTICOS_SIN_DATOS) {
    assert.ok(d.id && d.nombre && d.necesita, `${d.id} incompleto`);
    assert.ok(d.porque.length > 60, `${d.id}: el porqué tiene que explicar, no etiquetar`);
  }
});

/* ───────────────────────── esfuerzo contra resultado ───────────────────────── */

test("los cuatro cuadrantes salen donde deben", () => {
  assert.equal(cuadranteDe(50000, 90, 100000).id, CUADRANTES.domina.id);
  assert.equal(cuadranteDe(150000, 90, 100000).id, CUADRANTES.trabaja.id);
  assert.equal(cuadranteDe(150000, 30, 100000).id, CUADRANTES.atasco.id);
  assert.equal(cuadranteDe(50000, 30, 100000).id, CUADRANTES.prisa.id);
  assert.equal(cuadranteDe(null, 30, 100000), null);
});

test("quien no tiene medida sale aparte y con su razón, nunca como un cero", () => {
  const cohorte = [
    quien({ user_id: "a" }),
    quien({ user_id: "b" }),
    quien({ user_id: "c" }),
    quien({ user_id: "d" }),
    quien({ user_id: "nuevo", full_name: "Sin Rastro", n_registros: 0, n_evaluativas: 0, n_exploratorias: 0, pct_evaluativa: null, pct_exploratoria: null, duracion_media_ms: null }),
  ];
  const r = esfuerzoContraResultado(cohorte);
  assert.equal(r.medidos.length, 4);
  assert.equal(r.noMedidos.length, 1);
  assert.equal(r.noMedidos[0].nombre, "Sin Rastro");
  assert.match(r.noMedidos[0].razon, /ninguna actividad/);
  assert.ok(!r.medidos.some((m) => m.user_id === "nuevo"), "el no medido NO se dibuja");
  assert.ok(!r.medidos.some((m) => m.acierto === 0 && m.ms === 0), "nadie aterriza en el origen");
});

test("el recuento por cuadrante pone primero los que piden algo", () => {
  const { medidos } = esfuerzoContraResultado([
    quien({ user_id: "a", duracion_media_ms: 100000, pct_evaluativa: 90, pct_exploratoria: 90 }),
    quien({ user_id: "b", duracion_media_ms: 100000, pct_evaluativa: 90, pct_exploratoria: 90 }),
    quien({ user_id: "c", duracion_media_ms: 300000, pct_evaluativa: 20, pct_exploratoria: 20 }),
    quien({ user_id: "d", duracion_media_ms: 300000, pct_evaluativa: 20, pct_exploratoria: 20 }),
  ]);
  const cuentas = porCuadrante(medidos);
  assert.deepEqual(cuentas.map((c) => c.id), [CUADRANTES.atasco.id, CUADRANTES.prisa.id, CUADRANTES.trabaja.id, CUADRANTES.domina.id]);
  assert.equal(cuentas.reduce((s, c) => s + c.n, 0), 4);
});

test("la tabla se puede ordenar y es la misma gente que el gráfico", () => {
  const { medidos } = esfuerzoContraResultado([
    quien({ user_id: "a", full_name: "Ana", duracion_media_ms: 100000, pct_evaluativa: 90, pct_exploratoria: 90 }),
    quien({ user_id: "b", full_name: "Beto", duracion_media_ms: 300000, pct_evaluativa: 20, pct_exploratoria: 20 }),
    quien({ user_id: "c", full_name: "Caro", duracion_media_ms: 200000, pct_evaluativa: 50, pct_exploratoria: 50 }),
    quien({ user_id: "d", full_name: "Dani", duracion_media_ms: 150000, pct_evaluativa: 70, pct_exploratoria: 70 }),
  ]);
  assert.deepEqual(ordenar(medidos, "acierto").map((m) => m.full_name ?? m.nombre), ["Beto", "Caro", "Dani", "Ana"]);
  assert.deepEqual(ordenar(medidos, "tiempo").map((m) => m.nombre), ["Beto", "Caro", "Dani", "Ana"]);
  assert.equal(ordenar(medidos, "acierto").length, medidos.length);
});

/* ───────────────────────────────── la frase ───────────────────────────────── */

test("la frase nombra a los que faltan y termina en una acción", () => {
  const cohorte = Array.from({ length: 24 }, (_, i) => quien({ user_id: `u${i}` }));
  const lineas = fraseDeHoy({ cohorte, activos: 18, peor: null, riesgo: [] });
  const actividad = lineas.find((l) => l.id === "actividad");
  assert.match(actividad.texto, /18 de 24/);
  assert.match(actividad.texto, /6 no han entrado/);
  assert.equal(actividad.accion.destino, "riesgo");
});

test("sin datos no se inventa la línea", () => {
  const cohorte = Array.from({ length: 5 }, (_, i) => quien({ user_id: `u${i}` }));
  const lineas = fraseDeHoy({ cohorte, activos: 5, peor: null, riesgo: [] });
  assert.ok(!lineas.some((l) => l.id === "frena"), "sin peor actividad medible, esa línea no sale");
  assert.equal(fraseDeHoy({ cohorte: [], activos: 0 }).length, 0);
});

test("la línea de lo que frena lleva el nombre, el porcentaje y su n", () => {
  const cohorte = Array.from({ length: 10 }, (_, i) => quien({ user_id: `u${i}` }));
  const lineas = fraseDeHoy({
    cohorte,
    activos: 10,
    peor: { id: "t2-debe-o-haber", nombre: "¿Debe o haber?", cifras: { pct: 42.4, completaron: 23, terminaron: 23, de: null } },
    riesgo: [],
  });
  const frena = lineas.find((l) => l.id === "frena");
  assert.match(frena.texto, /¿Debe o haber\?/);
  assert.match(frena.texto, /42%/);
  assert.match(frena.texto, /23 que la terminaron/);
  assert.equal(frena.accion.destino, "actividad:t2-debe-o-haber");
});

test("la línea de a quién mirar nombra los diagnósticos, no un recuento plano", () => {
  const cohorte = Array.from({ length: 10 }, (_, i) => quien({ user_id: `u${i}` }));
  const riesgo = [
    { estudiante: cohorte[0], principal: { id: "dejo-de-entrar", nombre: "Dejó de entrar", nivel: NIVEL.URGENTE }, todos: [] },
    { estudiante: cohorte[1], principal: { id: "rapido-sin-leer", nombre: "Responde rápido y acierta poco", nivel: NIVEL.ATENCION }, todos: [] },
    { estudiante: cohorte[2], principal: { id: "rapido-sin-leer", nombre: "Responde rápido y acierta poco", nivel: NIVEL.ATENCION }, todos: [] },
  ];
  const mirar = fraseDeHoy({ cohorte, activos: 10, riesgo }).find((l) => l.id === "mirar");
  assert.match(mirar.texto, /3 necesitan/);
  assert.match(mirar.texto, /2 responde rápido y acierta poco/);
  assert.match(mirar.texto, /1 dejó de entrar/);
});

test("un solo estudiante no produce «estudiantes» ni «los mires»", () => {
  const cohorte = [quien({ user_id: "u0" })];
  const riesgo = [{ estudiante: cohorte[0], principal: { id: "dejo-de-entrar", nombre: "Dejó de entrar", nivel: NIVEL.URGENTE }, todos: [] }];
  const texto = fraseEnTexto(fraseDeHoy({ cohorte, activos: 0, riesgo }));
  assert.ok(!/estudiantes/.test(texto), texto);
  assert.match(texto, /1 necesita que lo mires hoy/);
});

/* ─────────────────────────────── preferencias ─────────────────────────────── */

test("los umbrales del profesor se quedan dentro de rango", () => {
  for (const a of AJUSTABLES) {
    assert.ok(a.min < a.porDefecto && a.porDefecto <= a.max, `${a.id}: el valor por defecto cae fuera de su rango`);
  }
  const u = umbralesCon({ ...POR_DEFECTO, pctEvaluativaBaja: 75 });
  assert.equal(u.pctEvaluativaBaja, 75);
  assert.equal(u.pctBajaParaPrisa, 75, "los dos cortes de acierto se mueven juntos");
  assert.equal(u.duracionRapidaMs, UMBRALES.duracionRapidaMs, "lo que no es ajustable no cambia");
});

test("los activos nunca pasan del tamaño de la cohorte", () => {
  /*
   * El servidor cuenta los activos sobre TODA la materia; la cohorte puede ser
   * solo el grupo curado. Sin tope, la primera línea del panel decía «14 de 5
   * estudiantes trabajaron».
   */
  const cohorte = Array.from({ length: 5 }, (_, i) => quien({ user_id: `u${i}` }));
  const l = fraseDeHoy({ cohorte, activos: 14, riesgo: [] }).find((x) => x.id === "actividad");
  assert.match(l.texto, /5 de 5/);
  assert.ok(!/no han entrado/.test(l.texto));

  const neg = fraseDeHoy({ cohorte, activos: -3, riesgo: [] }).find((x) => x.id === "actividad");
  assert.match(neg.texto, /0 de 5/);
  assert.match(neg.texto, /5 no han entrado/);
});
