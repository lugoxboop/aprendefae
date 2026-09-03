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

test("evaluar: ambas metas pero con recesión da 30", () => {
  const r = evaluar({ desempleo: 10, inflacion: 4, pib: -0.1 });
  assert.equal(r.porcentaje, 30);
  assert.match(r.feedback, /^🟡/);
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
 * PENDIENTE, y falla a propósito hasta que alguien decida qué hacer.
 *
 * Hoy el 100% no se puede alcanzar: con el desempleo justo en meta (11.98%),
 * la inflación más baja posible es 6.53%, y la meta pide <=6%. Se queda corta
 * por medio punto. El techo real de la actividad es 60%, y el nivel de 30%
 * —ambas metas con recesión— tampoco ocurre nunca.
 *
 * Consecuencia: ningún estudiante puede sacar el FP completo de este juego, y
 * el mensaje de "lo lograste" no se le muestra jamás a nadie.
 *
 * Arreglarlo es mover coeficientes o mover la meta, y eso lo decide Gen: no es
 * algo que se corrija de paso al configurar las pruebas. Queda marcado como
 * `todo` para que salga en cada corrida sin tumbar el build.
 *
 * Verificado con `npm run barrido`: 41.943 combinaciones, 0 llegan al 100%.
 */
test("el 100% es alcanzable con alguna combinación real de los instrumentos", { todo: "inalcanzable hoy: la inflación mínima con empleo en meta es 6.53% y la meta es 6%" }, () => {
  let alcanzado = null;
  for (let i = 20; i <= 35 && !alcanzado; i += 0.5)
    for (let t = 4; t <= 12 && !alcanzado; t += 0.25)
      for (let a = 0; a <= 20 && !alcanzado; a += 0.5)
        if (evaluar(simular({ impuesto: i, tasa: t, aranceles: a })).porcentaje === 100)
          alcanzado = { impuesto: i, tasa: t, aranceles: a };

  assert.ok(alcanzado, "ninguna combinación alcanza la meta oficial");
});
