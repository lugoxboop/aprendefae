import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import { INICIAL, calcular, COMPONENTES } from "../corazonDA.js";
import { enMillones, pesosM } from "../../components/mecanicas/corazon/circulatorio.jsx";
import CorazonEconomia from "../../components/mecanicas/corazon/CorazonEconomia.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA SUMA QUE SE VE TIENE QUE CUADRAR.
 *
 * "El corazón de la economía" existe para enseñar que la Demanda Agregada es
 * UNA SUMA. Si el titular dice $6,8M y los cuatro rótulos de la leyenda suman
 * $6,7M, la pieza desmiente en pantalla lo único que vino a enseñar.
 *
 * Eso pasaba de verdad con los valores de partida: la DA exacta es $6.773.060,
 * que redondeada a la décima de millón da 6,8; los cuatro componentes
 * redondeados uno a uno dan 3,9 + 1,0 + 2,0 − 0,2 = 6,7.
 *
 * ═══════════ POR QUÉ ESTE TEST RENDERIZA EL COMPONENTE ═══════════
 *
 * Comprobar la función de formato sola no serviría: el error no estaba en el
 * formato sino en QUÉ NÚMERO se le pasaba al titular. Un test de la función
 * pasaría aunque el componente volviera a mostrar la DA exacta. Por eso se
 * renderiza la pieza entera y se leen los cinco números de la pantalla.
 *
 * El chequeo 2 es el que impide que este archivo se vuelva decorativo:
 * comprueba que el caso de partida SÍ distingue las dos opciones. Si algún día
 * los valores iniciales cambian y las dos coinciden, este test avisa de que ya
 * no está midiendo nada en vez de seguir dando luz verde.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** "−$0.2M" / "$3.9M" -> número en millones. */
function aMillones(texto) {
  const limpio = texto.replace("−", "-").replace("$", "").replace("M", "").trim();
  const n = Number(limpio);
  assert.ok(Number.isFinite(n), `no pude leer el número de "${texto}"`);
  return n;
}

function leerPantalla() {
  const html = renderToStaticMarkup(createElement(CorazonEconomia));

  const titular = html.match(/data-prueba="da-titular"[^>]*>([^<]+)</);
  assert.ok(titular, 'no encontré el titular (data-prueba="da-titular")');

  const bandas = [...html.matchAll(/data-prueba="banda-valor"[^>]*>([^<]+)</g)].map((m) => m[1]);
  assert.equal(
    bandas.length,
    COMPONENTES.length,
    `esperaba ${COMPONENTES.length} valores en la leyenda y encontré ${bandas.length}`
  );

  return { titular: aMillones(titular[1]), bandas: bandas.map(aMillones) };
}

test("El corazón de la economía: el titular es exactamente lo que suman las bandas", () => {
  const { titular, bandas } = leerPantalla();
  const suma = bandas.reduce((a, b) => a + b, 0);

  /* 1. Lo que se ve arriba es lo que suma lo que se ve abajo. */
  assert.equal(
    titular.toFixed(1),
    suma.toFixed(1),
    `el titular dice ${pesosM(titular)} y las bandas suman ${pesosM(suma)}`
  );

  /*
   * 2. Y este caso distingue de verdad las dos maneras de calcularlo. Sin este
   *    chequeo, el de arriba pasaría también con la DA exacta el día que las
   *    dos coincidan por casualidad, y el test daría confianza falsa.
   */
  const r = calcular(INICIAL);
  assert.notEqual(
    enMillones(r.DA).toFixed(1),
    suma.toFixed(1),
    "los valores de partida ya no distinguen redondear la DA exacta de sumar las bandas: " +
      "este test dejó de medir lo que dice medir y hay que buscarle otro caso"
  );
});
