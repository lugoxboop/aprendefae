import { test } from "node:test";
import assert from "node:assert/strict";
import { simular, evaluar } from "../DashboardEconomico.jsx";

/*
 * El porcentaje que devuelve `evaluar` va directo al motor de FP, así que un
 * cambio accidental en los umbrales altera las notas de estudiantes reales.
 * Estas pruebas fijan los cuatro niveles y los límites del simulador.
 *
 * Meta oficial: desempleo <= 12, inflación <= 6, PIB >= 0.
 *
 * El barrido exploratorio del espacio completo de decisión vive aparte, en
 * scripts/barrido-dashboard.mjs (`npm run barrido`): imprime tablas, no afirma
 * nada, y es para decidir diseño, no para detectar regresiones.
 */

test("evaluar: ambas metas sin recesión da 100", () => {
  const r = evaluar({ desempleo: 12, inflacion: 6, pib: 0 });
  assert.equal(r.porcentaje, 100);
  assert.match(r.feedback, /^✅/);
});

test("evaluar: ambas metas con recesión ya no es un nivel aparte", () => {
  /*
   * Valía 30 y se quitó por imposible: el barrido no encuentra ni una
   * combinación que llegue a las dos metas con el PIB en negativo. Si el
   * modelo cambiara y volviera a ocurrir, cae en el 10 y hay que reabrir la
   * discusión, no dejarlo pasar callado.
   */
  assert.equal(evaluar({ desempleo: 10, inflacion: 4, pib: -0.1 }).porcentaje, 10);
});

test("evaluar: una sola meta, sin recesión, da 60", () => {
  assert.equal(evaluar({ desempleo: 10, inflacion: 9, pib: 2 }).porcentaje, 60);
  assert.equal(evaluar({ desempleo: 15, inflacion: 4, pib: 2 }).porcentaje, 60);
});

test("evaluar: ninguna meta da 10", () => {
  const r = evaluar({ desempleo: 20, inflacion: 12, pib: 2 });
  assert.equal(r.porcentaje, 10);
  assert.match(r.feedback, /^❌/);
});

test("evaluar: los umbrales son inclusivos, justo en la meta cuenta como cumplida", () => {
  assert.equal(evaluar({ desempleo: 12, inflacion: 6, pib: 0 }).porcentaje, 100);
  assert.equal(evaluar({ desempleo: 12.01, inflacion: 6, pib: 0 }).porcentaje, 60);
  assert.equal(evaluar({ desempleo: 12, inflacion: 6.01, pib: 0 }).porcentaje, 60);
});

test("simular: los tres indicadores quedan dentro de sus límites en los extremos", () => {
  const extremos = [
    { impuesto: 20, tasa: 4, aranceles: 0 },
    { impuesto: 20, tasa: 4, aranceles: 20 },
    { impuesto: 35, tasa: 12, aranceles: 0 },
    { impuesto: 35, tasa: 12, aranceles: 20 },
  ];
  for (const v of extremos) {
    const { desempleo, inflacion, pib } = simular(v);
    assert.ok(desempleo >= 3 && desempleo <= 25, `desempleo fuera de rango: ${desempleo}`);
    assert.ok(inflacion >= 0 && inflacion <= 30, `inflación fuera de rango: ${inflacion}`);
    assert.ok(pib >= -5 && pib <= 10, `PIB fuera de rango: ${pib}`);
  }
});

test("simular: bajar impuesto y tasa reduce el desempleo y sube la inflación", () => {
  const base = simular({ impuesto: 32, tasa: 8, aranceles: 10 });
  const suelto = simular({ impuesto: 20, tasa: 4, aranceles: 10 });
  assert.ok(suelto.desempleo < base.desempleo, "el desempleo debería bajar");
  assert.ok(suelto.inflacion > base.inflacion, "la inflación debería subir");
});

/*
 * La prueba que protege la calibración. Con la inflación base en 8% el 100%
 * era inalcanzable y nadie se enteró durante meses: ningún estudiante podía
 * sacar el FP completo y el mensaje de "lo lograste" no se mostraba jamás.
 *
 * Barre el espacio entero, no una combinación de referencia. Una combinación
 * suelta puede seguir dando 100% mientras el resto del tablero se rompe.
 */
test("ningún nivel queda inalcanzable en las 41.943 combinaciones", () => {
  const conteo = { 100: 0, 60: 0, 10: 0 };
  let ejemplo100 = null;

  for (let i = 20; i <= 35; i += 0.5)
    for (let t = 4; t <= 12; t += 0.25)
      for (let a = 0; a <= 20; a += 0.5) {
        const v = { impuesto: i, tasa: t, aranceles: a };
        const pct = evaluar(simular(v)).porcentaje;
        assert.ok(pct in conteo, `nivel inesperado: ${pct}`);
        conteo[pct]++;
        if (pct === 100 && !ejemplo100) ejemplo100 = v;
      }

  const total = Object.values(conteo).reduce((s, n) => s + n, 0);
  assert.equal(total, 41943, "el espacio de decisión cambió de tamaño");

  for (const [nivel, n] of Object.entries(conteo)) {
    assert.ok(n > 0, `el nivel ${nivel}% es inalcanzable: 0 de ${total} combinaciones`);
  }
  assert.ok(ejemplo100, "el 100% no se alcanza con ninguna combinación");
});

test("la combinación de referencia (impuesto 20, tasa 10, aranceles 0) da 100", () => {
  const ind = simular({ impuesto: 20, tasa: 10, aranceles: 0 });
  assert.equal(evaluar(ind).porcentaje, 100);
  assert.ok(ind.desempleo <= 12, `desempleo ${ind.desempleo}`);
  assert.ok(ind.inflacion <= 6, `inflación ${ind.inflacion}`);
  assert.ok(ind.pib >= 0, `PIB ${ind.pib}`);
});
