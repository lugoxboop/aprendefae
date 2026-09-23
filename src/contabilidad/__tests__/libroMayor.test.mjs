import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  formatearMonto, montoAleatorio, RANGO_MONTO,
  PLANOS, CUENTAS, TRAVESIA, CADENCIA, ARCOS_A_LA_VEZ, ARCO, VIDA_ARCO, VIDA_MONTO, COLUMNAS,
  COLOR_DEBE, COLOR_HABER, COLOR_CUENTA,
  crearEscena, avanzarEscena, posicionDe, emitirAsiento, faseDelArco,
  cuentaBajoCursor, arcosDeLaCuenta, RADIO_CURSOR,
} from "../libroMayor.js";
import { generador } from "../../utils/barajar.js";

/*
 * El propio modulo, para las comprobaciones que miran su codigo fuente.
 *
 * SOLO EL CODIGO, sin comentarios: el modulo EXPLICA en su cabecera por que no
 * usa toLocaleString, asi que buscar la palabra en el texto entero la
 * encontraba en la propia explicacion y ponia la prueba roja con el codigo
 * correcto. Mismo error que ya me costo una prueba hoy.
 */
const FUENTE = readFileSync("src/contabilidad/libroMayor.js", "utf8");

/** El código sin comentarios, recorriendo el texto: sin regex que se pueda estropear. */
function soloCodigo(texto) {
  let salida = "";
  let dentroDeBloque = false;
  for (const linea of texto.split("\n")) {
    let l = linea;
    if (dentroDeBloque) {
      const cierre = l.indexOf("*/");
      if (cierre < 0) continue;
      dentroDeBloque = false;
      l = l.slice(cierre + 2);
    }
    const abre = l.indexOf("/*");
    if (abre >= 0) {
      const cierre = l.indexOf("*/", abre + 2);
      if (cierre < 0) { dentroDeBloque = true; l = l.slice(0, abre); }
      else l = l.slice(0, abre) + l.slice(cierre + 2);
    }
    const linea2 = l.trim().startsWith("//") ? "" : l;
    salida += linea2 + "\n";
  }
  return salida;
}
const CODIGO = soloCodigo(FUENTE);

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LIBRO MAYOR COMO RED.
 *
 * Todo lo que la ficha exige del fondo se mide aquí, sin pintar un píxel:
 * cuántas cuentas, que no formen cuadrícula, cada cuánto entra un asiento,
 * cuántos arcos conviven, y sobre todo que el monto salga DOS veces, el mismo,
 * uno al debe y otro al haber, sin signos.
 *
 * Correr un minuto de fondo cuesta un milisegundo porque la escena es una
 * función pura. Esa es toda la razón de que no viva dentro del componente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const reloj = (escena, segundos, fps = 60) => {
  for (let i = 0; i < segundos * fps; i += 1) avanzarEscena(escena, 1 / fps);
  return escena;
};

/* ───────────────────────────── los montos ───────────────────────────── */

test("formato de peso colombiano: punto de miles, sin decimales y sin signo", () => {
  assert.equal(formatearMonto(85000), "$85.000");
  assert.equal(formatearMonto(320500), "$320.500");
  assert.equal(formatearMonto(1240000), "$1.240.000");
  assert.equal(formatearMonto(5000000), "$5.000.000");
  assert.equal(formatearMonto(1000), "$1.000");
  assert.equal(formatearMonto(999), "$999");
});

test("el formato NO depende de los datos de idioma del runtime", () => {
  /*
   * Con toLocaleString, un runtime sin ICU completo devuelve "1,240,000" y la
   * cifra saldría en formato de otro país. Se agrupa a mano, así que el
   * resultado es el mismo en el navegador de un estudiante y aquí.
   */
  assert.ok(!/toLocaleString/.test(CODIGO), "volvió toLocaleString al formateo");
  assert.ok(/formatearMonto/.test(CODIGO), "se leyó el módulo equivocado");
});

test("los montos son realistas: dentro del rango y redondeados a los 500", () => {
  const rnd = generador("montos");
  for (let i = 0; i < 500; i += 1) {
    const m = montoAleatorio(rnd);
    assert.ok(m >= RANGO_MONTO.min - 500 && m <= RANGO_MONTO.max + 500, `${m} fuera de rango`);
    assert.equal(m % 500, 0, `${m} no es una cifra de libro`);
  }
  assert.equal(RANGO_MONTO.min, 50_000);
  assert.equal(RANGO_MONTO.max, 5_000_000);
});

test("NINGÚN monto lleva signo: el debe no es más ni el haber menos", () => {
  const rnd = generador("signos");
  for (let i = 0; i < 300; i += 1) {
    const texto = formatearMonto(montoAleatorio(rnd));
    assert.match(texto, /^\$[\d.]+$/, texto);
    assert.ok(!texto.includes("+"), texto);
    assert.ok(!texto.includes("-"), texto);
    assert.ok(!texto.includes("−"), texto);
  }
});

/* ───────────────────────────── las cuentas ───────────────────────────── */

test("entre 8 y 14 cuentas, y los tres planos siempre ocupados", () => {
  for (const semilla of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
    const e = crearEscena({ ancho: 1200, alto: 900, semilla });
    assert.ok(e.cuentas.length >= CUENTAS.min && e.cuentas.length <= CUENTAS.max,
      `${semilla}: ${e.cuentas.length} cuentas`);
    assert.deepEqual([...new Set(e.cuentas.map((c) => c.plano))].sort(), [0, 1, 2],
      `${semilla}: algún plano quedó vacío`);
  }
});

test("NO forman cuadrícula: ni comparten filas ni columnas ni se reparten regular", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "rejilla" });
  const xs = e.cuentas.map((c) => c.x0).sort((a, b) => a - b);
  const ys = e.cuentas.map((c) => c.y0).sort((a, b) => a - b);

  /* En una cuadrícula muchas cuentas comparten x o y. Aquí, ninguna. */
  const repetidos = (v) => v.filter((n, i) => i > 0 && Math.abs(n - v[i - 1]) < 1).length;
  assert.equal(repetidos(xs), 0, "hay cuentas alineadas en columna");
  assert.equal(repetidos(ys), 0, "hay cuentas alineadas en fila");

  /*
   * Y los huecos entre ellas son desiguales. En una cuadrícula la desviación
   * de los huecos sería prácticamente cero; aquí tiene que ser apreciable
   * frente al hueco medio.
   */
  const huecos = xs.slice(1).map((n, i) => n - xs[i]);
  const media = huecos.reduce((s, h) => s + h, 0) / huecos.length;
  const desv = Math.sqrt(huecos.reduce((s, h) => s + (h - media) ** 2, 0) / huecos.length);
  assert.ok(desv / media > 0.3, `los huecos son casi iguales (desv/media = ${(desv / media).toFixed(2)})`);
});

test("ninguna cuenta nace encima de otra", () => {
  for (const semilla of ["x", "y", "z"]) {
    const e = crearEscena({ ancho: 1200, alto: 900, semilla });
    const separacion = Math.min(1200, 900) * 0.17;
    for (let i = 0; i < e.cuentas.length; i += 1) {
      for (let j = i + 1; j < e.cuentas.length; j += 1) {
        const d = Math.hypot(e.cuentas[i].x0 - e.cuentas[j].x0, e.cuentas[i].y0 - e.cuentas[j].y0);
        assert.ok(d >= separacion - 1e-9, `${semilla}: dos cuentas a ${d.toFixed(1)} px`);
      }
    }
  }
});

test("los tres planos van de 25 % a 50 % de opacidad, y el lejano es el más pequeño", () => {
  assert.equal(PLANOS.length, 3);
  assert.equal(PLANOS[0].opacidad, 0.25, "el plano lejano no está al 25 %");
  assert.equal(PLANOS[2].opacidad, 0.5, "el plano cercano no está al 50 %");
  for (let i = 1; i < PLANOS.length; i += 1) {
    assert.ok(PLANOS[i].opacidad > PLANOS[i - 1].opacidad, "las opacidades no crecen hacia delante");
    assert.ok(PLANOS[i].escala > PLANOS[i - 1].escala, "los tamaños no crecen hacia delante");
    assert.ok(PLANOS[i].desenfoque < PLANOS[i - 1].desenfoque, "el desenfoque no baja hacia delante");
  }
  assert.equal(PLANOS[2].desenfoque, 0, "el plano cercano tiene que estar nítido");
});

/* ───────────────────────────── la deriva ───────────────────────────── */

test("la deriva tarda entre 60 y 90 s en cruzar la pantalla", () => {
  /*
   * LOS NÚMEROS VAN A PELO, NO DESDE TRAVESIA.
   *
   * Esta prueba comparaba contra la propia constante, así que cambiar
   * TRAVESIA a { min: 6, max: 9 } movía los dos lados de la desigualdad y la
   * prueba seguía verde con el fondo corriendo diez veces más rápido. No era
   * una prueba floja: no medía nada. Los 60 y los 90 son los de la ficha y por
   * eso están escritos aquí.
   */
  assert.deepEqual({ ...TRAVESIA }, { min: 60, max: 90 }, "cambió la travesía de la ficha");

  const ancho = 1200;
  const e = crearEscena({ ancho, alto: 900, semilla: "deriva" });
  for (const c of e.cuentas) {
    const travesia = ancho / Math.hypot(c.vx, c.vy);
    assert.ok(travesia >= 60 - 1e-6, `cruza en ${travesia.toFixed(1)} s: demasiado rápido`);
    /*
     * El tope de arriba es 90 por la horizontal, pero la componente vertical va
     * a la mitad, así que una cuenta que derive casi en vertical tarda más en
     * recorrer un ancho. 207 es ese peor caso (90 / 0,435), no un margen
     * puesto a ojo.
     */
    assert.ok(travesia <= 207, `cruza en ${travesia.toFixed(1)} s: demasiado lento`);
  }
});

test("la trayectoria NO es una recta: el camino se curva", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "curva" });
  const c = e.cuentas[0];
  /*
   * Se miden tres puntos del camino en un tramo corto —sin envolver por los
   * bordes— y se comprueba que el de en medio no cae sobre la recta que une
   * los otros dos. Con deriva pura caería exactamente encima.
   */
  const p = (t) => posicionDe(c, t, 1e6, 1e6);
  const [a, b, d] = [p(0), p(4), p(8)];
  const recta = { x: (a.x + d.x) / 2, y: (a.y + d.y) / 2 };
  const desvio = Math.hypot(b.x - recta.x, b.y - recta.y);
  assert.ok(desvio > 1, `el camino es recto (desvío de ${desvio.toFixed(3)} px)`);
});

/* ───────────────────────────── los asientos ───────────────────────────── */

test("entra un asiento cada 3-5 s, ni más seguido ni más espaciado", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "cadencia" });
  const momentos = [];
  for (let i = 0; i < 180 * 60; i += 1) {
    const antes = e.asientos;
    avanzarEscena(e, 1 / 60);
    if (e.asientos > antes) momentos.push(e.t);
  }
  assert.ok(momentos.length > 30, `solo ${momentos.length} asientos en tres minutos`);
  const huecos = momentos.slice(1).map((t, i) => t - momentos[i]);
  for (const h of huecos) {
    assert.ok(h >= CADENCIA.min - 0.05, `dos asientos a ${h.toFixed(2)} s: demasiado seguidos`);
    assert.ok(h <= CADENCIA.max + 0.05, `dos asientos a ${h.toFixed(2)} s: demasiado espaciados`);
  }
});

test("nunca conviven más arcos de la cuenta, ni siquiera forzándolo", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "tope" });
  let maximo = 0;
  for (let i = 0; i < 180 * 60; i += 1) {
    avanzarEscena(e, 1 / 60);
    maximo = Math.max(maximo, e.arcos.length);
  }
  assert.ok(maximo <= ARCOS_A_LA_VEZ, `llegaron a convivir ${maximo}`);
  /* Y forzando asientos a mano, el tope aguanta igual. */
  for (let i = 0; i < 50; i += 1) emitirAsiento(e);
  assert.ok(e.arcos.length <= ARCOS_A_LA_VEZ, `el tope no frena a emitirAsiento: ${e.arcos.length}`);
});

test("con la cadencia y la vida de un arco, casi siempre se lee uno solo", () => {
  /*
   * «Nunca varios simultáneos que saturen la escena». El tope son tres, pero lo
   * que de verdad importa es que lo normal sea uno.
   */
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "legible" });
  let muestras = 0;
  let conVarios = 0;
  for (let i = 0; i < 180 * 60; i += 1) {
    avanzarEscena(e, 1 / 60);
    if (e.arcos.length > 0) { muestras += 1; if (e.arcos.length > 1) conVarios += 1; }
  }
  assert.ok(conVarios / muestras < 0.25, `el ${Math.round((conVarios / muestras) * 100)} % del tiempo hay más de un arco`);
});

test("UN ASIENTO, UN MONTO, DOS ANOTACIONES: debe y haber, cuentas distintas", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "partida-doble" });
  let revisados = 0;
  for (let i = 0; i < 180 * 60; i += 1) {
    avanzarEscena(e, 1 / 60);
    for (const arco of e.arcos) {
      assert.notEqual(arco.debe, arco.haber, "un asiento contra sí misma");
      assert.equal(typeof arco.monto, "number");
      assert.equal(arco.texto, formatearMonto(arco.monto), "el texto no es el monto");
      revisados += 1;
    }
  }
  assert.ok(revisados > 1000, "apenas se revisaron arcos");
});

test("el arco se traza progresivamente, se sostiene y se desvanece", () => {
  assert.equal(VIDA_ARCO, ARCO.trazo + ARCO.sostén + ARCO.desvanecido);
  assert.equal(faseDelArco(0).progreso, 0, "empieza dibujado");
  assert.ok(faseDelArco(ARCO.trazo / 2).progreso > 0.4, "no crece a mitad del trazo");
  assert.equal(faseDelArco(ARCO.trazo).progreso, 1, "no termina de trazarse");
  assert.equal(faseDelArco(VIDA_ARCO).opacidad, 0, "no llega a desaparecer");
  assert.ok(faseDelArco(VIDA_ARCO - ARCO.desvanecido / 2).opacidad < 1, "no se desvanece");
});

test("el monto se ve entre 2 y 3 segundos, y solo con el arco ya trazado", () => {
  assert.ok(VIDA_MONTO >= 2 && VIDA_MONTO <= 3, `el monto dura ${VIDA_MONTO} s`);
  assert.equal(faseDelArco(ARCO.trazo * 0.5).montoVisible, false, "el monto sale antes que su arco");
  assert.equal(faseDelArco(ARCO.trazo).montoVisible, true);
  assert.equal(faseDelArco(VIDA_ARCO).montoVisible, false, "el monto sobrevive a su arco");
});

test("una pestaña que vuelve de segundo plano NO da un salto en la escena", () => {
  /*
   * LO QUE ROMPE UN dt LARGO ES EL SALTO, NO LA RÁFAGA.
   *
   * Esta prueba miraba que no entraran varios asientos de golpe, y eso se
   * cumple igual SIN el tope: un dt de 45 s dispara el temporizador una vez y
   * lo reinicia. El destrozo de verdad es otro: sin acotar el paso, la escena
   * avanza 45 s en un fotograma y todas las cuentas TELETRANSPORTAN. Se ve como
   * un corte, no como un fondo.
   *
   * Así que se mide el desplazamiento de las cuentas en ese único paso.
   */
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "pestaña" });
  reloj(e, 10);
  const antes = e.cuentas.map((c) => ({ x: c.x, y: c.y }));
  const asientosAntes = e.asientos;

  avanzarEscena(e, 45);

  let salto = 0;
  e.cuentas.forEach((c, i) => {
    salto = Math.max(salto, Math.hypot(c.x - antes[i].x, c.y - antes[i].y));
  });
  /*
   * Con el paso acotado a 0,05 s y la deriva más rápida de la ficha —un ancho
   * en 60 s— una cuenta se mueve como mucho un par de píxeles. Cinco es
   * holgado; cuarenta y cinco segundos sin acotar la mueven cientos.
   */
  assert.ok(salto < 5, `las cuentas saltaron ${salto.toFixed(1)} px en un solo fotograma`);
  assert.ok(e.asientos - asientosAntes <= 1, "además soltó una ráfaga de asientos");
  assert.ok(e.arcos.length <= ARCOS_A_LA_VEZ);
});

/* ───────────────────────────── los colores ───────────────────────────── */

test("debe en teal, haber en ámbar, cuentas en el navy de los avatares", () => {
  assert.equal(COLOR_DEBE, "42,157,143");    // #2A9D8F
  assert.equal(COLOR_HABER, "233,196,106");  // #E9C46A
  assert.equal(COLOR_CUENTA, "61,90,128");   // #3D5A80
});

test("coral NO aparece por ningún lado de este fondo", () => {
  assert.ok(!/231,\s*111,\s*81/.test(CODIGO), "hay coral en el módulo de la escena");
  assert.ok(!/E76F51/i.test(CODIGO), "hay coral en el módulo de la escena");
  /*
   * Y que de verdad se esté leyendo algo: si `soloCodigo` devolviera cadena
   * vacía, las dos negaciones de arriba pasarían sin mirar nada.
   */
  assert.ok(/42,157,143/.test(CODIGO), "no se leyó el módulo: falta el teal");
  assert.ok(/233,196,106/.test(CODIGO), "no se leyó el módulo: falta el ámbar");
});

/* ──────────────────────── la textura del fondo ──────────────────────── */

test("las columnas de cifras son textura: entre 8 % y 12 % de opacidad", () => {
  assert.ok(COLUMNAS.opacidad >= 0.08 && COLUMNAS.opacidad <= 0.12, `${COLUMNAS.opacidad}`);
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "textura" });
  assert.equal(e.columnas.length, COLUMNAS.cuantas);
  for (const c of e.columnas) {
    assert.equal(c.cifras.length, COLUMNAS.cifrasPorColumna);
    for (const cifra of c.cifras) assert.match(cifra, /^\$[\d.]+$/, cifra);
  }
});

/* ───────────────────────────── el cursor ───────────────────────────── */

test("el cursor encuentra la cuenta de debajo, y solo si está cerca", () => {
  /*
   * LA DISTANCIA VA A PELO. Antes se probaba a `RADIO_CURSOR * 3`, así que
   * subir el radio a 9000 alejaba también el punto de prueba y la prueba seguía
   * verde con el fondo encendiendo cuentas de la otra punta de la pantalla.
   */
  assert.ok(RADIO_CURSOR <= 120, `el radio del cursor es de ${RADIO_CURSOR} px: abarca media pantalla`);

  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "cursor" });
  const c = e.cuentas[3];
  assert.equal(cuentaBajoCursor(e, c.x, c.y), c, "no encuentra la que tiene encima");

  /* A 600 px no hay cuenta que valga: es medio lienzo. */
  const lejos = cuentaBajoCursor(e, c.x + 600, c.y + 600);
  assert.equal(lejos, null, "enciende una cuenta con el cursor a 600 px");
});

test("se iluminan los asientos DE ESA CUENTA, no todos los de la pantalla", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "iluminar" });
  reloj(e, 20);
  /* Se fuerzan dos asientos con cuentas distintas para tener algo que separar. */
  e.arcos.length = 0;
  const uno = emitirAsiento(e);
  const otro = emitirAsiento(e);
  assert.ok(uno && otro);

  const suyos = arcosDeLaCuenta(e, uno.debe).map((a) => a.id);
  assert.ok(suyos.includes(uno.id), "no ilumina el asiento de la cuenta");
  for (const arco of e.arcos) {
    const toca = arco.debe === uno.debe || arco.haber === uno.debe;
    assert.equal(suyos.includes(arco.id), toca, `el arco ${arco.id} se ilumina sin tocar la cuenta`);
  }
  assert.deepEqual(arcosDeLaCuenta(e, null), [], "sin cuenta bajo el cursor no se ilumina nada");
});

test("solo se iluminan arcos VIVOS: los que ya se fueron no vuelven", () => {
  const e = crearEscena({ ancho: 1200, alto: 900, semilla: "vivos" });
  const arco = emitirAsiento(e);
  assert.equal(arcosDeLaCuenta(e, arco.debe).length, 1);
  reloj(e, VIDA_ARCO + 0.5);
  assert.ok(!e.arcos.some((a) => a.id === arco.id), "el arco no se retiró");
  assert.ok(!arcosDeLaCuenta(e, arco.debe).some((a) => a.id === arco.id), "revive un arco muerto");
});

/* ───────────────────────────── determinismo ───────────────────────────── */

test("la misma semilla da la misma escena; otra semilla, otra", () => {
  const huella = (e) => e.cuentas.map((c) => `${c.x0.toFixed(3)},${c.y0.toFixed(3)},${c.plano}`).join("|");
  assert.equal(
    huella(crearEscena({ ancho: 1000, alto: 800, semilla: "igual" })),
    huella(crearEscena({ ancho: 1000, alto: 800, semilla: "igual" })),
  );
  assert.notEqual(
    huella(crearEscena({ ancho: 1000, alto: 800, semilla: "igual" })),
    huella(crearEscena({ ancho: 1000, alto: 800, semilla: "distinta" })),
  );
});
