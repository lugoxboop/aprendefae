import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluar, CUADRA, NO_CUADRA, CATEGORIAS } from "../../components/mecanicas/libros/CuadraONoCuadra.jsx";
import {
  CUADRA_O_NO, balanceDelAsiento, puntuarCuadraONo, PESO_JUICIOS, PESO_DESCUADRES,
} from "../../data/contabilidadActividades.js";
import { pesos } from "../../data/contabilidad.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-8 · ¿CUADRA O NO CUADRA?
 *
 * La actividad con el puntaje más delicado del tema: un 75 % fijo por los
 * juicios y un 25 % que se reparte entre los descuadrados QUE HAYAN SALIDO.
 * Un error ahí no se ve jugando —da un número plausible— así que se prueba
 * enumerando, no probando una partida.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CIFRA_CUALQUIERA = 1;

const sinHuecos = (texto, donde) => {
  assert.ok(typeof texto === "string" && texto.length > 10, `${donde}: sin texto`);
  assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${donde}: hueco sin rellenar — ${texto}`);
  assert.ok(texto.startsWith("✅") || texto.startsWith("❌"), `${donde}: ni acierto ni error — ${texto}`);
};

/* ─────────────────────── las cinco devoluciones ─────────────────────── */

test("★ las cinco clases de respuesta tienen texto, en los diez asientos", () => {
  /*
   * Por asiento: decir que cuadra, y decir que no con la cifra buena o con
   * otra. Tres respuestas por diez asientos = 30 caminos, y ninguno puede
   * dejar la pantalla muda ni un hueco de plantilla a la vista.
   */
  const vistos = new Set();
  let caminos = 0;
  for (const asiento of CUADRA_O_NO.asientos) {
    const b = balanceDelAsiento(asiento);
    const respuestas = [
      ["dijo cuadra", CUADRA, null],
      ["dijo no cuadra con la cifra buena", NO_CUADRA, b.descuadre],
      ["dijo no cuadra con otra cifra", NO_CUADRA, b.descuadre + CIFRA_CUALQUIERA],
    ];
    for (const [que, juicio, cifra] of respuestas) {
      const r = evaluar(asiento, juicio, cifra);
      sinHuecos(r.texto, `${asiento.id} · ${que}`);
      vistos.add(r.texto.startsWith("✅") ? "acierto" : "error");
      caminos += 1;
    }
  }
  assert.equal(caminos, 30, "10 asientos × 3 respuestas");
  assert.deepEqual([...vistos].sort(), ["acierto", "error"], "faltó ver una de las dos caras");
});

test("★ cada clase recibe EXACTAMENTE el texto de la ficha que le toca", () => {
  const cuadrado = CUADRA_O_NO.asientos.find((a) => balanceDelAsiento(a).cuadra);
  const descuadrado = CUADRA_O_NO.asientos.find((a) => !balanceDelAsiento(a).cuadra);
  const b = balanceDelAsiento(descuadrado);

  /*
   * Se compara el arranque de la plantilla HASTA SU PRIMER HUECO: lo que sigue
   * son cifras que la devolución ya rellenó, y compararlas sería comparar el
   * texto consigo mismo sin rellenar.
   */
  const arranca = (texto, plantilla) => {
    const fijo = plantilla.split("{")[0];
    assert.ok(fijo.length >= 8, `la plantilla empieza por un hueco: ${plantilla}`);
    assert.equal(texto.slice(0, fijo.length), fijo, `«${texto}» no viene de «${plantilla}»`);
  };

  arranca(evaluar(cuadrado, CUADRA, null).texto, CUADRA_O_NO.aciertoCuadra);
  arranca(evaluar(cuadrado, NO_CUADRA, 1).texto, CUADRA_O_NO.errores.dijoNoCuadra);
  arranca(evaluar(descuadrado, CUADRA, null).texto, CUADRA_O_NO.errores.dijoCuadra);
  arranca(evaluar(descuadrado, NO_CUADRA, b.descuadre).texto, CUADRA_O_NO.aciertoDescuadre);
  /* Con fichas el fallo de la cifra tiene dos direcciones, y cada una su texto. */
  arranca(evaluar(descuadrado, NO_CUADRA, b.descuadre + 1).texto, CUADRA_O_NO.errores.sePaso);
  arranca(evaluar(descuadrado, NO_CUADRA, b.descuadre - 1).texto, CUADRA_O_NO.errores.quedaCorta);
});

test("★ la devolución dice las cifras de ESE asiento, no otras", () => {
  for (const asiento of CUADRA_O_NO.asientos) {
    const b = balanceDelAsiento(asiento);
    const r = evaluar(asiento, b.cuadra ? CUADRA : NO_CUADRA, b.descuadre);
    assert.ok(r.texto.includes(pesos(b.debe)), `${asiento.id}: no dice el total del debe`);
    assert.ok(r.texto.includes(pesos(b.haber)), `${asiento.id}: no dice el total del haber`);
    if (!b.cuadra) assert.ok(r.texto.includes(pesos(b.descuadre)), `${asiento.id}: no dice el descuadre`);
  }
});

test("★ y cada total va donde le toca: el del debe antes que el del haber", () => {
  /*
   * Comprobar solo que las dos cifras SALEN no basta: intercambiarlas deja las
   * dos en el texto y le dice al estudiante «el debe da $200 y el haber $250»
   * cuando es al revés. Las tres plantillas de la ficha nombran el debe
   * primero, así que su cifra tiene que aparecer antes.
   *
   * Se miran solo los descuadrados: en uno que cuadra los dos totales son el
   * mismo número y la comprobación no distinguiría nada.
   */
  const descuadrados = CUADRA_O_NO.asientos.filter((a) => !balanceDelAsiento(a).cuadra);
  assert.ok(descuadrados.length >= 5, "el banco se quedó sin descuadrados que mirar");
  for (const asiento of descuadrados) {
    const b = balanceDelAsiento(asiento);
    assert.notEqual(b.debe, b.haber);
    /*
     * «Se pasó» no nombra ningún total —habla de la balanza, no de las
     * cifras— así que no entra aquí: esta prueba vigila el ORDEN de los dos
     * totales en los textos que los dicen.
     */
    for (const [que, juicio, cifra] of [
      ["acierto", NO_CUADRA, b.descuadre],
      ["dijo que cuadraba", CUADRA, null],
    ]) {
      const { texto } = evaluar(asiento, juicio, cifra);
      assert.ok(
        texto.indexOf(pesos(b.debe)) < texto.indexOf(pesos(b.haber)),
        `${asiento.id} · ${que}: los totales salen cambiados de sitio — ${texto}`,
      );
    }
  }
});

test("el texto de «sí cuadra» cuenta las cuentas del asiento que se juzgó", () => {
  /* Es lo que desmonta la confusión: un asiento compuesto cuadra igual. */
  const compuesto = CUADRA_O_NO.asientos.find((a) =>
    balanceDelAsiento(a).cuadra && a.debe.length + a.haber.length > 2);
  assert.ok(compuesto, "el banco ya no tiene un asiento compuesto que cuadre");
  const cuantas = compuesto.debe.length + compuesto.haber.length;
  const r = evaluar(compuesto, NO_CUADRA, 1);
  assert.ok(r.texto.includes(`${cuantas} cuentas`), `no dice «${cuantas} cuentas» — ${r.texto}`);
});

/* ─────────────────────── el juicio y la cifra ─────────────────────── */

test("★ la cifra NO se gana si se juzgó mal el asiento", () => {
  /*
   * La ficha da ese cuarto por «decir la cifra exacta del descuadre», y no se
   * puede decir la cifra de un descuadre que se acaba de negar. Si contara
   * igual, un estudiante que responde «cuadra» a todo y acierta la cifra por
   * casualidad cobraría por un descuadre que no vio.
   */
  const descuadrado = CUADRA_O_NO.asientos.find((a) => !balanceDelAsiento(a).cuadra);
  const b = balanceDelAsiento(descuadrado);
  const r = evaluar(descuadrado, CUADRA, b.descuadre);
  assert.ok(!r.juicioOk);
  assert.ok(!r.cifraOk, "cobró la cifra de un descuadre que dijo que no existía");
});

test("★ en un asiento que cuadra, la cifra nunca se gana", () => {
  for (const asiento of CUADRA_O_NO.asientos.filter((a) => balanceDelAsiento(a).cuadra)) {
    for (const cifra of [0, 1, 500]) {
      assert.ok(!evaluar(asiento, NO_CUADRA, cifra).cifraOk, `${asiento.id} con ${cifra}`);
    }
  }
});

test("el juicio se acierta diciendo lo que el asiento hace, en los diez", () => {
  for (const asiento of CUADRA_O_NO.asientos) {
    const b = balanceDelAsiento(asiento);
    assert.ok(evaluar(asiento, b.cuadra ? CUADRA : NO_CUADRA, b.descuadre).juicioOk, asiento.id);
    assert.ok(!evaluar(asiento, b.cuadra ? NO_CUADRA : CUADRA, 0).juicioOk, asiento.id);
  }
  assert.deepEqual(CATEGORIAS.map((c) => c.id), [CUADRA, NO_CUADRA]);
});

/* ─────────────────────── el puntaje variable ─────────────────────── */

test("★ la nota se parte en 75 y 25, y los números van escritos", () => {
  /* Escritos a propósito: leerlos de las constantes sería medirlas contra sí mismas. */
  assert.equal(PESO_JUICIOS, 0.75);
  assert.equal(PESO_DESCUADRES, 0.25);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: 3, cifrasAcertadas: 3 }), 100);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: 3, cifrasAcertadas: 0 }), 75);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 3, cifrasAcertadas: 3 }), 25);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 4, cifrasAcertadas: 0 }), 0);
});

test("★ EN TODA PARTIDA POSIBLE salen descuadrados que repartir", () => {
  /*
   * LA PRUEBA QUE SOSTIENE LA FÓRMULA. Si un sorteo pudiera dar cero
   * descuadrados, ese 25 % quedaría sin repartir y el intento valdría 75 como
   * techo sin culpa del estudiante. No se razona: se enumeran las 210
   * combinaciones de seis entre diez.
   */
  const ids = CUADRA_O_NO.asientos.map((a) => a.id);
  const descuadrados = new Set(
    CUADRA_O_NO.asientos.filter((a) => !balanceDelAsiento(a).cuadra).map((a) => a.id));

  const combinaciones = [];
  const elegir = (desde, actual) => {
    if (actual.length === CUADRA_O_NO.porPartida) { combinaciones.push([...actual]); return; }
    for (let i = desde; i < ids.length; i += 1) { actual.push(ids[i]); elegir(i + 1, actual); actual.pop(); }
  };
  elegir(0, []);
  assert.equal(combinaciones.length, 210, "C(10,6) = 210");

  /* Y en cada una, la partida perfecta vale cien: ni un sorteo deja techo. */
  for (const combo of combinaciones) {
    const n = combo.filter((id) => descuadrados.has(id)).length;
    assert.ok(n >= 1, `un sorteo con ${n} descuadrados: ${combo.join(", ")}`);
    assert.equal(
      puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: n, cifrasAcertadas: n }), 100,
      `con ${n} descuadrados la partida perfecta no vale 100`,
    );
  }
});

test("★ la suerte del sorteo no cambia la nota de un mismo desempeño", () => {
  /*
   * Decir todas las cifras que salieron vale lo mismo salgan una o cinco. Si
   * no, dos estudiantes con el mismo desempeño sacarían notas distintas según
   * qué asientos les tocaron, que es lo contrario de evaluar.
   */
  for (const n of [1, 2, 3, 4, 5]) {
    assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: n, cifrasAcertadas: n }), 100, `${n}`);
    assert.equal(puntuarCuadraONo({ juiciosAcertados: 3, descuadradosEnJuego: n, cifrasAcertadas: 0 }), 38, `${n}`);
    assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: n, cifrasAcertadas: 0 }), 75, `${n}`);
  }
});

/* ─────────── lo que ve el docente ─────────── */

test("★ un id a medias no se etiqueta como si fuera una de las dos preguntas", () => {
  /*
   * Igual que en El Saldo de la Cuenta: la regla parte el id por «:» y decide
   * por el segundo trozo. Sin comprobarlo, un trozo desconocido caería en la
   * rama del otro y el profesor leería «La diferencia» sobre un juicio.
   */
  const uno = CUADRA_O_NO.asientos[0].id;
  assert.ok(etiquetaDeItem("cu-cuadra-o-no", `${uno}:juicio`));
  assert.ok(etiquetaDeItem("cu-cuadra-o-no", `${uno}:cifra`));
  assert.equal(etiquetaDeItem("cu-cuadra-o-no", uno), null);
  assert.equal(etiquetaDeItem("cu-cuadra-o-no", `${uno}:otra-cosa`), null);
  assert.equal(etiquetaDeItem("cu-cuadra-o-no", "cu8-99:juicio"), null);
});

test("★ los dos asientos de las mismas cuentas se leen distinto en el panel", () => {
  /*
   * El banco tiene a propósito dos asientos con las mismas cuentas que solo se
   * diferencian en una cifra: uno cuadra y el otro no. Es el par que la
   * actividad quiere contrastar, y en el panel tienen que poder distinguirse.
   */
  const porCuentas = new Map();
  for (const a of CUADRA_O_NO.asientos) {
    const clave = [...a.debe, ...a.haber].map(([c]) => c).join("|");
    porCuentas.set(clave, [...(porCuentas.get(clave) ?? []), a.id]);
  }
  const gemelos = [...porCuentas.values()].filter((ids) => ids.length > 1);
  assert.ok(gemelos.length >= 1, "el banco perdió el par de asientos con las mismas cuentas");
  for (const ids of gemelos) {
    const etiquetas = ids.map((id) => etiquetaDeItem("cu-cuadra-o-no", `${id}:juicio`));
    assert.equal(new Set(etiquetas).size, ids.length, `se leen igual: ${etiquetas.join(" | ")}`);
  }
});

test("★ media tanda de cifras vale la mitad de su cuarto, salgan las que salgan", () => {
  /* Dos de cuatro cifras = 12,5 puntos; una de dos = lo mismo. */
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 4, cifrasAcertadas: 2 }), 13);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 2, cifrasAcertadas: 1 }), 13);
});
