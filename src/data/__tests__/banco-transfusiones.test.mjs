import test from "node:test";
import assert from "node:assert/strict";

import { calcular } from "../corazonDA.js";
import {
  CASOS_TRANSFUSION, PASOS_TRANSFUSION, resolverTransfusion, distractoresTransfusion,
} from "../demandaAgregadaHacer.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SEIS ENUNCIADOS DEL BANCO DE TRANSFUSIONES SALEN DEL MODELO DEL PROFESOR.
 *
 * La actividad hace la misma cuenta que "El corazón de la economía" con otros
 * números y en otra escala. Si su aritmética se separara de calcular(), el tema
 * enseñaría dos modelos distintos: uno en la mitad Aprender y otro en la Hacer,
 * y el estudiante no tendría forma de saber cuál es el bueno.
 *
 * Se comprueban las dos cosas por separado, y el orden importa:
 *
 *   1. Los valores ESPERADOS están escritos a mano aquí, copiados del encargo.
 *      Si el banco cambiara un dato de entrada, esto lo dice.
 *   2. Y esos mismos valores tienen que salir de calcular(), el modelo
 *      compartido. Si alguien tocara la fórmula del modelo, esto también.
 *
 * Comprobar solo resolverTransfusion() contra sí misma no diría nada: pasaría
 * con cualquier fórmula, incluida una equivocada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Del encargo, verificados uno a uno. T · RD · c×RD · C. */
const ESPERADOS = {
  "e-a": { T: 20, RD: 200, cRD: 160, C: 210 },
  "e-b": { T: 30, RD: 230, cRD: 161, C: 201 },
  "g-a": { T: 60, RD: 270, cRD: 202.5, C: 282.5 },
  "g-b": { T: 70, RD: 305, cRD: 198.25, C: 258.25 },
  "s-a": { T: 60, RD: 390, cRD: 234, C: 334 },
  "s-b": { T: 90, RD: 450, cRD: 360, C: 430 },
};

const TODOS = [
  ...CASOS_TRANSFUSION.ejemplo,
  ...CASOS_TRANSFUSION.guiada,
  ...CASOS_TRANSFUSION.sola,
];

/* Céntimos: absorbe el ruido binario de 0,65 × 305 sin tapar un error real. */
const cerca = (a, b) => Math.abs(a - b) < 0.005;

test("los seis casos dan los valores del encargo", () => {
  assert.equal(TODOS.length, 6, "el banco dejó de tener seis casos");

  for (const caso of TODOS) {
    const esperado = ESPERADOS[caso.id];
    assert.ok(esperado, `el caso ${caso.id} no está en la lista de valores esperados`);

    const obtenido = resolverTransfusion(caso);
    for (const paso of PASOS_TRANSFUSION) {
      assert.ok(
        cerca(obtenido[paso.id], esperado[paso.id]),
        `${caso.id} · ${paso.id}: esperaba ${esperado[paso.id]} y salió ${obtenido[paso.id]}`
      );
    }
  }
});

test("y esos valores son los del modelo compartido, no otra aritmética", () => {
  for (const caso of TODOS) {
    /*
     * calcular() pide el modelo entero. Las partes que esta actividad no
     * enseña —inversión, gasto y tipo de cambio— van en cero: no intervienen
     * en T, en la renta disponible ni en el consumo, que es lo que se compara.
     */
    const delModelo = calcular({
      autonomo: caso.autonomo,
      Y: caso.Y,
      t: caso.t,
      TR: caso.TR,
      c: caso.c,
      inversionAut: 0,
      i: 0,
      b: 0,
      G: 0,
      tc: 0,
    });

    const esperado = ESPERADOS[caso.id];
    assert.ok(cerca(delModelo.T, esperado.T), `${caso.id}: T del modelo ${delModelo.T} ≠ ${esperado.T}`);
    assert.ok(cerca(delModelo.disponible, esperado.RD), `${caso.id}: RD del modelo ${delModelo.disponible} ≠ ${esperado.RD}`);
    assert.ok(cerca(delModelo.consumoInducido, esperado.cRD), `${caso.id}: c×RD del modelo ${delModelo.consumoInducido} ≠ ${esperado.cRD}`);
    assert.ok(cerca(delModelo.C, esperado.C), `${caso.id}: C del modelo ${delModelo.C} ≠ ${esperado.C}`);
  }
});

/*
 * Los distractores son errores de verdad, y por eso mismo pueden coincidir con
 * la respuesta buena en algún juego de datos. Cuando pasa, el componente los
 * descarta —repetir la respuesta la regalaría dos veces—, pero si pasara en
 * los cuatro pasos de un caso la pregunta se quedaría con una sola opción.
 *
 * Esto comprueba que cada paso que puntúa ofrece al menos tres opciones
 * distintas, que es lo que el estudiante ve.
 */
test("cada paso que puntúa ofrece tres opciones distintas", () => {
  for (const caso of [...CASOS_TRANSFUSION.guiada, ...CASOS_TRANSFUSION.sola]) {
    for (const paso of PASOS_TRANSFUSION) {
      const correcto = resolverTransfusion(caso)[paso.id];
      const valores = new Set([
        Math.round(correcto * 100),
        ...distractoresTransfusion(caso, paso.id).map((d) => Math.round(d * 100)),
      ]);
      assert.equal(
        valores.size,
        3,
        `${caso.id} · ${paso.id}: quedan ${valores.size} opciones distintas y hacen falta 3`
      );
    }
  }
});
