import { test } from "node:test";
import assert from "node:assert/strict";

import { calcularFP, baseEfectiva, BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../../fp/motor.js";
import {
  ETAPAS, PUNTOS_POR_ETAPA, TOTAL_PUNTOS, puntuarDesafio, nivelDelAgua, AGUA_MINIMA,
} from "../puntuacion.js";
import { BANCO_ARCA, NIVELES, CITAS_EXPEDIENTE, DECISIONES, ORDEN_DECISIONES, MOMENTOS } from "../../data/arca.js";
import { puntuarIceberg } from "../../components/mecanicas/arca/EtapaIcebergArca.jsx";
import { puntuarOrden } from "../../utils/orden.js";

/*
 * "El Proyecto del Arca" y la regla general de desafíos de varias etapas.
 *
 * Lo que se mide aquí es lo que en el navegador no se ve de un vistazo: que el
 * 360 sea de verdad 360, que el reparto entre etapas sume el total sin perder
 * puntos por redondeo, que el tope de cuatro etapas no se pueda saltar, y que
 * el agua suba más con mal rendimiento que con bueno.
 */

/* ═════════════ la regla del Kit, en el motor ═════════════ */

test("la base se multiplica por las etapas", () => {
  assert.equal(baseEfectiva("experto", 1), 90);
  assert.equal(baseEfectiva("experto", 4), 360);
  assert.equal(baseEfectiva("medio", 2), 50);
});

test("el tope de cuatro etapas no se puede saltar", () => {
  assert.equal(baseEfectiva("experto", 9), 360, "nueve etapas siguen pagando cuatro");
  assert.equal(baseEfectiva("experto", 100), 90 * TOPE_ETAPAS);
});

test("una actividad sin etapas declaradas se comporta como antes", () => {
  for (const dificultad of Object.keys(BASE_POR_DIFICULTAD)) {
    assert.equal(baseEfectiva(dificultad), BASE_POR_DIFICULTAD[dificultad]);
    assert.equal(baseEfectiva(dificultad, 1), BASE_POR_DIFICULTAD[dificultad]);
  }
});

test("etapas inválidas no rompen ni regalan puntos", () => {
  for (const malo of [0, -3, null, undefined, NaN]) {
    assert.equal(baseEfectiva("dificil", malo), 50, `etapas=${malo} debería valer como 1`);
  }
});

test("calcularFP aplica las etapas de punta a punta", () => {
  const unaEtapa = calcularFP({
    dificultad: "experto", modalidad: "evaluativa", aciertos: 1,
    duracionMs: 600_000, repeticionesPrevias: 0,
  });
  const cuatro = calcularFP({
    dificultad: "experto", modalidad: "evaluativa", aciertos: 1,
    duracionMs: 600_000, repeticionesPrevias: 0, etapas: 4,
  });
  assert.equal(unaEtapa.fp, 90);
  assert.equal(cuatro.fp, 360);
  assert.equal(cuatro.desglose.etapas, 4);
});

test("repetir un desafío tampoco paga", () => {
  const { fp } = calcularFP({
    dificultad: "experto", modalidad: "evaluativa", aciertos: 1,
    duracionMs: 600_000, repeticionesPrevias: 1, etapas: 4,
  });
  assert.equal(fp, 0);
});

/* ═════════════ el reparto de 360 ═════════════ */

test("el desafío vale 360 y las etapas suman exactamente eso", () => {
  assert.equal(TOTAL_PUNTOS, 360);
  assert.equal(PUNTOS_POR_ETAPA.reduce((s, e) => s + e.puntos, 0), 360);
});

test("cada etapa vale lo que dice la ficha", () => {
  assert.deepEqual(
    PUNTOS_POR_ETAPA.map((e) => e.puntos),
    [72, 126, 72, 90]
  );
  assert.deepEqual(ETAPAS.map((e) => e.peso), [0.2, 0.35, 0.2, 0.25]);
});

test("todo perfecto da 360 y 100%", () => {
  const r = puntuarDesafio([100, 100, 100, 100]);
  assert.equal(r.puntos, 360);
  assert.equal(r.pct, 100);
});

test("todo en cero da 0, no un negativo", () => {
  const r = puntuarDesafio([0, 0, 0, 0]);
  assert.equal(r.puntos, 0);
  assert.equal(r.pct, 0);
});

test("una etapa sin jugar aporta cero y no rompe la cuenta", () => {
  const r = puntuarDesafio([100, null, 100, null]);
  assert.equal(r.puntos, 72 + 72);
  assert.equal(r.pct, Math.round(((72 + 72) / 360) * 100));
});

test("la etapa 2 pesa más que ninguna otra", () => {
  const soloDos = puntuarDesafio([0, 100, 0, 0]).puntos;
  for (const i of [0, 2, 3]) {
    const otra = [0, 0, 0, 0];
    otra[i] = 100;
    assert.ok(soloDos > puntuarDesafio(otra).puntos, `la etapa 2 debería pesar más que la ${i + 1}`);
  }
  assert.equal(soloDos, 126);
});

test("un desempeño mediocre queda a mitad de camino", () => {
  /* 50% en las cuatro etapas: la mitad justa del total. */
  const r = puntuarDesafio([50, 50, 50, 50]);
  assert.equal(r.puntos, 180);
  assert.equal(r.pct, 50);
});

test("el porcentaje nunca se sale de 0..100 con entradas raras", () => {
  for (const caso of [[200, 200, 200, 200], [-50, -50, -50, -50], [150, -20, 100, 0]]) {
    const r = puntuarDesafio(caso);
    assert.ok(r.pct >= 0 && r.pct <= 100, `pct fuera de rango: ${r.pct} para ${caso}`);
    assert.ok(r.puntos >= 0 && r.puntos <= TOTAL_PUNTOS);
  }
});

/* ═════════════ el nivel del agua ═════════════ */

test("el agua sube con el avance aunque todo vaya perfecto", () => {
  const alturas = [0, 1, 2, 3, 4].map((n) => nivelDelAgua(n, 100));
  for (let i = 1; i < alturas.length; i++) {
    assert.ok(alturas[i] > alturas[i - 1], `el agua no subió de la etapa ${i - 1} a la ${i}`);
  }
  assert.equal(alturas[0], AGUA_MINIMA);
});

test("el agua sube MÁS si el rendimiento es flojo", () => {
  for (const etapas of [1, 2, 3, 4]) {
    const bien = nivelDelAgua(etapas, 100);
    const regular = nivelDelAgua(etapas, 50);
    const mal = nivelDelAgua(etapas, 0);
    assert.ok(mal > regular, `con ${etapas} etapas: mal(${mal}) debería superar a regular(${regular})`);
    assert.ok(regular > bien, `con ${etapas} etapas: regular(${regular}) debería superar a bien(${bien})`);
  }
});

test("el agua nunca se desborda ni se vacía", () => {
  for (let etapas = 0; etapas <= 4; etapas++)
    for (const pct of [0, 25, 50, 75, 100, null]) {
      const h = nivelDelAgua(etapas, pct);
      assert.ok(h >= AGUA_MINIMA && h <= 100, `altura fuera de rango: ${h}`);
    }
});

test("un desafío impecable no termina con el agua arriba", () => {
  /*
   * El diluvio es de la Etapa 4, no un castigo por ir bien. Quien acierta todo
   * tiene que llegar al final con la probeta a media altura.
   */
  assert.ok(nivelDelAgua(4, 100) < 60, "el agua sube demasiado con rendimiento perfecto");
  assert.ok(nivelDelAgua(4, 0) > 85, "el agua sube poco con rendimiento nulo");
});

/* ═════════════ el contenido de las etapas ═════════════ */

test("etapa 1: ocho citas, dos por nivel", () => {
  assert.equal(CITAS_EXPEDIENTE.length, 8);
  for (const nivel of NIVELES) {
    assert.equal(
      CITAS_EXPEDIENTE.filter((c) => c.nivel === nivel).length, 2,
      `${nivel} no tiene exactamente dos citas`
    );
  }
});

test("etapa 2: el banco es grande y tiene una sola respuesta completa por nivel", () => {
  assert.ok(BANCO_ARCA.length >= 20, `el banco se queda corto: ${BANCO_ARCA.length}`);
  assert.ok(BANCO_ARCA.length <= 24);
  for (const nivel of NIVELES) {
    const completas = BANCO_ARCA.filter((p) => p.nivel === nivel && p.valor === "completa");
    assert.equal(completas.length, 1, `${nivel} tiene ${completas.length} opciones completas`);
  }
  assert.equal(BANCO_ARCA.filter((p) => p.valor === "completa").length, 4);
});

test("etapa 2: ningún id repetido y todo nivel es de los cuatro", () => {
  assert.equal(new Set(BANCO_ARCA.map((p) => p.id)).size, BANCO_ARCA.length);
  for (const p of BANCO_ARCA) assert.ok(NIVELES.includes(p.nivel), `nivel raro: ${p.nivel}`);
});

test("etapa 2: el iceberg de referencia da 100 y uno de parciales da 40", () => {
  const de = (nivel, valor) => BANCO_ARCA.find((p) => p.nivel === nivel && p.valor === valor);

  const perfecto = Object.fromEntries(NIVELES.map((n) => [n, de(n, "completa")]));
  assert.equal(puntuarIceberg(perfecto), 100);

  const descriptivo = Object.fromEntries(NIVELES.map((n) => [n, de(n, "parcial")]));
  assert.equal(puntuarIceberg(descriptivo), 40);

  const vacio = {};
  assert.equal(puntuarIceberg(vacio), 0);
});

test("etapa 2: una pieza correcta en el nivel equivocado no puntúa", () => {
  const evento = BANCO_ARCA.find((p) => p.nivel === "Evento" && p.valor === "completa");
  assert.equal(puntuarIceberg({ Estructura: evento }), 0);
});

test("etapa 3: cuatro decisiones, pesos de la ficha y orden B > A > C > D", () => {
  assert.equal(DECISIONES.length, 4);
  assert.deepEqual(ORDEN_DECISIONES, ["b", "a", "c", "d"]);
  assert.deepEqual(
    ORDEN_DECISIONES.map((id) => DECISIONES.find((d) => d.id === id).peso),
    [100, 50, 10, 0]
  );
});

test("etapa 3: el orden correcto da 100 y el inverso 0", () => {
  assert.equal(puntuarOrden(ORDEN_DECISIONES, ORDEN_DECISIONES), 100);
  assert.equal(puntuarOrden([...ORDEN_DECISIONES].reverse(), ORDEN_DECISIONES), 0);
});

test("etapa 3: hay crédito parcial y es proporcional", () => {
  /* Intercambiar las dos últimas rompe una sola pareja de las seis. */
  const casi = ["b", "a", "d", "c"];
  assert.equal(puntuarOrden(casi, ORDEN_DECISIONES), 83);

  /* Poner la mejor decisión al final rompe tres. */
  const malo = ["a", "c", "d", "b"];
  assert.equal(puntuarOrden(malo, ORDEN_DECISIONES), 50);
});

test("etapa 4: el día 15 vale 100 y los días bajan de ahí", () => {
  const pcts = MOMENTOS.map((m) => m.pct);
  assert.equal(MOMENTOS[0].etiqueta, "Día 15");
  assert.equal(MOMENTOS[0].pct, 100);
  for (let i = 1; i < pcts.length; i++) {
    assert.ok(pcts[i] < pcts[i - 1], `el ${MOMENTOS[i].etiqueta} no vale menos que el anterior`);
  }
  assert.equal(pcts.at(-1), 0);
});

/* ═════════════ el recorrido entero ═════════════ */

test("una partida imperfecta da un número intermedio y coherente", () => {
  /*
   * El caso que se juega a mano en el navegador para comprobar el agua: bien la
   * primera, flojo el iceberg, medio la decisión, y el día 40 en el cierre.
   */
  const resultados = [75, 40, 83, 60];
  const r = puntuarDesafio(resultados);

  const esperado =
    Math.round(72 * 0.75 + 126 * 0.4 + 72 * 0.83 + 90 * 0.6);
  assert.equal(r.puntos, esperado);
  assert.ok(r.pct > 0 && r.pct < 100);

  /* Y el agua tiene que haber subido más que con un pleno. */
  const promedio = resultados.reduce((s, x) => s + x, 0) / 4;
  assert.ok(nivelDelAgua(4, promedio) > nivelDelAgua(4, 100));
});
