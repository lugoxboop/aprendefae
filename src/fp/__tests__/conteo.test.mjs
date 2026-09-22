import { test } from "node:test";
import assert from "node:assert/strict";
import { DURACION_CONTEO_MS, suavizar, valorEnProgreso, recorrido } from "../conteo.js";
import { formatoFP } from "../../utils/formato.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTEO DEL PILL Y EL FORMATO DE LOS FP.
 *
 * Lo que se prueba aquí es la aritmética del recorrido, no la animación: el
 * requestAnimationFrame y React quedan fuera a propósito, porque lo que puede
 * salir mal —que el contador se quede corto, que retroceda, que enseñe un
 * decimal— se ve con números.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("el conteo empieza en el valor viejo y TERMINA EXACTO en el nuevo", () => {
  assert.equal(valorEnProgreso(815, 865, 0), 815);
  assert.equal(valorEnProgreso(815, 865, 1), 865);
  /*
   * Pasado el final se queda en el destino: un fotograma que llegue tarde no
   * puede dejar el contador por encima del total real.
   */
  assert.equal(valorEnProgreso(815, 865, 1.4), 865);
  assert.equal(valorEnProgreso(815, 865, -0.2), 815);
});

test("nunca retrocede y nunca se pasa", () => {
  const pasos = recorrido(815, 865, 40);
  for (let i = 1; i < pasos.length; i++) {
    assert.ok(pasos[i] >= pasos[i - 1], `retrocedió en el paso ${i}: ${pasos[i - 1]} → ${pasos[i]}`);
    assert.ok(pasos[i] <= 865, `se pasó del destino: ${pasos[i]}`);
  }
  assert.equal(pasos.at(-1), 865);
});

test("siempre es un entero: un FP con decimales no existe", () => {
  for (const t of [0, 0.13, 0.37, 0.5, 0.79, 0.99, 1]) {
    const v = valorEnProgreso(0, 97, t);
    assert.equal(v, Math.round(v), `en t=${t} salió ${v}`);
  }
});

test("la salida es suave: frena al llegar, no avanza a ritmo constante", () => {
  /* En la mitad del tiempo ya lleva más de la mitad del camino. */
  assert.ok(suavizar(0.5) > 0.5);
  assert.equal(suavizar(0), 0);
  assert.equal(suavizar(1), 1);
  const mitad = valorEnProgreso(0, 100, 0.5);
  assert.ok(mitad > 50, `a mitad de tiempo iba por ${mitad}, que no es una salida suave`);
});

test("un destino igual al origen no mueve nada", () => {
  assert.deepEqual(recorrido(815, 815, 5), [815, 815, 815, 815, 815, 815]);
});

test("la duración va con el aviso de FP, no es instantánea ni eterna", () => {
  assert.ok(DURACION_CONTEO_MS >= 400 && DURACION_CONTEO_MS <= 1500, `${DURACION_CONTEO_MS} ms`);
});

/* ─────────────────────── el formato ─────────────────────── */

test("los FP se escriben con PUNTO de miles, nunca con coma", () => {
  assert.equal(formatoFP(0), "0");
  assert.equal(formatoFP(815), "815");
  assert.equal(formatoFP(1200), "1.200");
  assert.equal(formatoFP(12500), "12.500");
  assert.equal(formatoFP(1234567), "1.234.567");
  /*
   * La coma es el decimal en español: «1,200 FP» se leería como algo más de un
   * FP. Es el error que esta comprobación existe para atrapar.
   */
  for (const n of [1200, 12500, 1234567]) {
    assert.ok(!formatoFP(n).includes(","), `${n} salió con coma: ${formatoFP(n)}`);
  }
});

test("basura y decimales no rompen el formato", () => {
  assert.equal(formatoFP(null), "0");
  assert.equal(formatoFP(undefined), "0");
  assert.equal(formatoFP("no soy un número"), "0");
  assert.equal(formatoFP(1200.4), "1.200");
});
