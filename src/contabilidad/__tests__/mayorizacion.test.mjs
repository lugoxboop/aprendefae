import { test } from "node:test";
import assert from "node:assert/strict";

import {
  transaccionesDe, renglonesDe, evaluarRenglon, evaluarSaldo, ACIERTO_SALDO,
} from "../../components/mecanicas/libros/LaMayorizacion.jsx";
import { MAYORIZACION, CORTE_SET_A } from "../../data/contabilidadActividades.js";
import {
  DEBE, HABER, pesos, mayorConSaldos, saldoDe, LAVADO_DE_AUTOS,
} from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-11 · LA MAYORIZACIÓN.
 *
 * La actividad más grande del tema. Lo que vigilan estas pruebas: que el mayor
 * que se construye sea el que sale de los asientos —no una tabla escrita—, que
 * el Set A siga siendo un CORTE y no el mes entero, y que ningún camino de
 * respuesta se quede mudo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SETS = MAYORIZACION.sets.map((set) => {
  const transacciones = transaccionesDe(set);
  return { set, transacciones, renglones: renglonesDe(transacciones), mayor: mayorConSaldos(transacciones) };
});

const sinHuecos = (texto, donde) => {
  assert.ok(typeof texto === "string" && texto.length > 3, `${donde}: sin texto`);
  assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${donde}: hueco sin rellenar — ${texto}`);
  assert.ok(texto.startsWith("✅") || texto.startsWith("❌"), `${donde}: ni acierto ni error — ${texto}`);
};

/* ─────────────────────── los dos sets ─────────────────────── */

test("los dos sets salen de sus transacciones, no de una tabla escrita", () => {
  assert.equal(SETS.length, 2);
  for (const { set, transacciones, renglones, mayor } of SETS) {
    assert.ok(transacciones.length >= 5, `${set.id}: se quedó sin transacciones`);
    assert.equal(
      renglones.length,
      transacciones.reduce((s, t) => s + t.asiento.debe.length + t.asiento.haber.length, 0),
      `${set.id}: los renglones no son los del diario`,
    );
    assert.ok(mayor.length >= 5, `${set.id}: el mayor salió corto`);
  }
});

test("★ el Set A sigue siendo un CORTE: cinco asientos y sin Caja", () => {
  /*
   * La advertencia de la ficha, aquí y en la prueba del banco. Si alguien
   * alargara el corte, los saldos pasarían a ser los del mes entero y la
   * actividad calificaría como error la respuesta correcta del corte.
   */
  const { set, transacciones, mayor } = SETS.find((s) => s.set.id === "set-a");
  assert.deepEqual(set.transacciones, CORTE_SET_A);
  assert.equal(transacciones.length, 5);
  assert.ok(!mayor.some((c) => c.cuenta === "Caja"), "Caja entra en ene-25, fuera del corte");

  /* Y cuatro cuentas tienen que seguir difiriendo del mayor completo. */
  const completo = Object.fromEntries(mayorConSaldos(LAVADO_DE_AUTOS.transacciones).map((c) => [c.cuenta, c.saldo]));
  const corte = Object.fromEntries(mayor.map((c) => [c.cuenta, c.saldo]));
  for (const cuenta of ["Bancos", "Acciones", "Hipoteca por pagar", "Cuentas por pagar"]) {
    assert.notEqual(corte[cuenta], completo[cuenta], `${cuenta}: el corte se igualó al mayor completo`);
  }
});

test("el Set B no se trunca: son las seis de Caleja", () => {
  const { set, transacciones } = SETS.find((s) => s.set.id === "set-b");
  assert.equal(set.transacciones, null);
  assert.equal(transacciones.length, 6);
});

test("★ los renglones llevan el debe primero y el haber después, como el libro", () => {
  /*
   * No es cosmética: la sangría del diario es lo que la ficha le pide leer al
   * estudiante —«la cuenta acreditada es la que va corrida a la derecha»— y
   * solo se puede dibujar si el orden es ese.
   */
  for (const { set, transacciones } of SETS) {
    for (const t of transacciones) {
      const lineas = renglonesDe([t]);
      const primerHaber = lineas.findIndex((l) => l.lado === HABER);
      const ultimoDebe = lineas.map((l) => l.lado).lastIndexOf(DEBE);
      assert.ok(ultimoDebe < primerHaber, `${set.id} · ${t.id}: el orden del asiento se mezcló`);
      assert.equal(lineas.length, t.asiento.debe.length + t.asiento.haber.length);
    }
  }
});

test("★ todo renglón cae en una cuenta que el mayor del set ofrece", () => {
  /* Si no, el estudiante tendría que acertar una cuenta que no está a la vista. */
  for (const { set, renglones, mayor } of SETS) {
    const ofrecidas = new Set(mayor.map((c) => c.cuenta));
    for (const r of renglones) {
      assert.ok(ofrecidas.has(r.cuenta), `${set.id}: «${r.cuenta}» no está entre las cuentas del mayor`);
    }
  }
});

/* ─────────────────────── mayorizar ─────────────────────── */

test("★ las tres clases de respuesta al mayorizar tienen texto, en los dos sets", () => {
  let caminos = 0;
  for (const { set, renglones, mayor } of SETS) {
    const otras = mayor.map((c) => c.cuenta);
    for (const r of renglones) {
      const otraCuenta = otras.find((c) => c !== r.cuenta);
      const otroLado = r.lado === DEBE ? HABER : DEBE;
      const respuestas = [
        ["bien", r.cuenta, r.lado, true, true],
        ["cuenta equivocada", otraCuenta, r.lado, false, true],
        ["lado contrario", r.cuenta, otroLado, true, false],
        ["las dos mal", otraCuenta, otroLado, false, false],
      ];
      for (const [que, c, l, cuentaOk, ladoOk] of respuestas) {
        const res = evaluarRenglon(r, c, l);
        sinHuecos(res.texto, `${set.id} · ${r.cuenta} · ${que}`);
        assert.equal(res.cuentaOk, cuentaOk, `${set.id} · ${r.cuenta} · ${que}: cuentaOk`);
        assert.equal(res.ladoOk, ladoOk, `${set.id} · ${r.cuenta} · ${que}: ladoOk`);
        caminos += 1;
      }
    }
  }
  assert.equal(caminos, (14 + 12) * 4, "14 renglones del Set A y 12 del Set B, por cuatro respuestas");
});

test("★ el lado contrario recibe SU explicación, no la de la cuenta", () => {
  /*
   * Es el error que la ficha quiere nombrar: mayorizar no cambia de lado. Si
   * cayera en el texto de la cuenta equivocada, el estudiante iría a buscar
   * una cuenta que ya tenía bien.
   */
  const { renglones } = SETS[0];
  const r = renglones[0];
  const res = evaluarRenglon(r, r.cuenta, r.lado === DEBE ? HABER : DEBE);
  assert.equal(res.texto, MAYORIZACION.errores.ladoContrario);
  assert.match(res.texto, /Mayorizar no cambia de lado/);
});

test("la cuenta equivocada se corrige nombrando la que era", () => {
  const { renglones, mayor } = SETS[0];
  const r = renglones[0];
  const otra = mayor.map((c) => c.cuenta).find((c) => c !== r.cuenta);
  const res = evaluarRenglon(r, otra, r.lado);
  assert.ok(res.texto.includes(r.cuenta), `no nombra «${r.cuenta}» — ${res.texto}`);
});

/* ─────────────────────── los saldos ─────────────────────── */

test("★ el saldo que se pide es el que sale de los movimientos, en las dos", () => {
  for (const { set, mayor } of SETS) {
    for (const c of mayor) {
      const s = saldoDe(c);
      const bien = evaluarSaldo(c, s.saldo, s.lado);
      assert.ok(bien.cifraOk && bien.ladoOk, `${set.id} · ${c.cuenta}`);
      assert.equal(bien.texto, ACIERTO_SALDO);
      assert.ok(ACIERTO_SALDO.startsWith("✅"), "el acierto no se ve como acierto");
    }
  }
});

test("★ las tres formas de fallar un saldo tienen texto, con las cifras de ESA cuenta", () => {
  let caminos = 0;
  for (const { set, mayor } of SETS) {
    for (const c of mayor) {
      const s = saldoDe(c);
      const otroLado = s.lado === DEBE ? HABER : DEBE;
      const respuestas = [
        ["cifra mal", s.saldo + 7, s.lado],
        ["lado mal", s.saldo, otroLado],
        ["las dos mal", s.debito + s.credito, otroLado],
      ];
      for (const [que, cifra, lado] of respuestas) {
        const r = evaluarSaldo(c, cifra, lado);
        sinHuecos(r.texto, `${set.id} · ${c.cuenta} · ${que}`);
        assert.ok(r.texto.includes(pesos(s.debito)), `${c.cuenta} · ${que}: no dice el movimiento débito`);
        assert.ok(r.texto.includes(pesos(s.credito)), `${c.cuenta} · ${que}: no dice el movimiento crédito`);
        assert.ok(r.texto.includes(pesos(s.saldo)), `${c.cuenta} · ${que}: no dice el saldo`);
        /*
         * Y el lado, con la palabra correcta. Comprobar solo que las cifras
         * salen deja pasar un «Saldo: $1.850 al haber» cuando va al debe: un
         * texto impecable que enseña lo contrario de lo que corresponde.
         */
        const palabra = s.lado === DEBE ? "debe" : "haber";
        const contraria = s.lado === DEBE ? "haber" : "debe";
        assert.ok(r.texto.endsWith(`al ${palabra}.`),
          `${c.cuenta} · ${que}: no cierra diciendo «al ${palabra}» — ${r.texto}`);
        assert.ok(!r.texto.endsWith(`al ${contraria}.`), `${c.cuenta} · ${que}: dice el lado contrario`);
        caminos += 1;
      }
    }
  }
  assert.equal(caminos, (10 + 7) * 3, "10 cuentas del Set A y 7 del Set B, por tres formas de fallar");
});

test("★ acertar la cifra y fallar el lado NO es acierto", () => {
  const { mayor } = SETS[0];
  const c = mayor[0];
  const s = saldoDe(c);
  const r = evaluarSaldo(c, s.saldo, s.lado === DEBE ? HABER : DEBE);
  assert.ok(r.cifraOk);
  assert.ok(!r.ladoOk);
  assert.notEqual(r.texto, ACIERTO_SALDO, "se dio por bueno un saldo puesto del lado que no es");
});

/* ─────────────────────── el tamaño, que es una decisión ─────────────────────── */

test("★ queda escrito cuántos pasos pide cada set", () => {
  /*
   * No es una comprobación de corrección: es dejar el número a la vista. Si
   * alguien alarga un set, esta prueba falla y obliga a mirar si la actividad
   * sigue cabiendo en una sentada.
   */
  const tamanos = Object.fromEntries(SETS.map(({ set, renglones, mayor }) =>
    [set.id, renglones.length + mayor.length]));
  assert.deepEqual(tamanos, { "set-a": 24, "set-b": 19 });
});
