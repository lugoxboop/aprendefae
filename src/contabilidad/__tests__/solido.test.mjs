import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/* Se definen aquí una sola vez: ver la nota de la prueba que las usa. */
const SALTO = /\r?\n/;
const NO_PALABRA = /[^A-Za-z_]+/;

import {
  VERTICES, ARISTAS, CARAS, CARAS_POR_LADOS, LARGO, ARISTA,
  rotar, rotarTodos, proyectar, distancia, longitud, punto, resta, normalizar,
} from "../solido.js";
import {
  ARRIBA, estadoInicial, avanzarChapoteo, enReposo, normalDeSuperficie,
  recortarBajoPlano, poligonoDeSuperficie, cuerpoDelLiquido,
  fraccionLlena, volumenTotal, INCLINACION_MAXIMA, RIGIDEZ, AMORTIGUACION,
} from "../liquido.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL SÓLIDO DE PACIOLI Y SU LÍQUIDO.
 *
 * Lo que de verdad defiende este archivo es la regla crítica del encargo: la
 * superficie del líquido vive en espacio de MUNDO, y el volumen no cambia
 * nunca. Las dos se pueden MEDIR —no mirar— porque la geometría está fuera de
 * React, y eso es la razón de que esté fuera de React.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Veinte orientaciones cualesquiera, siempre las mismas: la prueba no sortea. */
const ORIENTACIONES = Array.from({ length: 20 }, (_, i) => [
  (i * 0.7919) % (Math.PI * 2),
  (i * 1.3733) % (Math.PI * 2),
  (i * 2.1791) % (Math.PI * 2),
]);

/* ──────────────────────────── el sólido exacto ──────────────────────────── */

test("es el rombicuboctaedro: 26 caras (18 + 8), 24 vértices y 48 aristas", () => {
  assert.equal(VERTICES.length, 24);
  assert.equal(ARISTAS.length, 48);
  assert.equal(CARAS.length, 26);
  assert.deepEqual(CARAS_POR_LADOS, { 3: 8, 4: 18 }, "ocho triángulos y dieciocho cuadrados");
});

test("los vértices son las permutaciones de (±1, ±1, ±(1+√2)), sin repetir", () => {
  assert.equal(new Set(VERTICES.map((v) => v.join(","))).size, 24, "hay vértices duplicados");
  for (const v of VERTICES) {
    const abs = v.map(Math.abs).sort((a, b) => a - b);
    assert.ok(Math.abs(abs[0] - 1) < 1e-12 && Math.abs(abs[1] - 1) < 1e-12, `${v} no tiene dos unos`);
    assert.ok(Math.abs(abs[2] - LARGO) < 1e-12, `${v} no tiene el lado largo`);
  }
});

test("todos los vértices caen en la misma esfera y todas las aristas miden lo mismo", () => {
  const radios = new Set(VERTICES.map((v) => longitud(v).toFixed(9)));
  assert.equal(radios.size, 1, "el sólido no es uniforme");
  for (const [a, b] of ARISTAS) {
    assert.ok(Math.abs(distancia(VERTICES[a], VERTICES[b]) - ARISTA) < 1e-9, `arista ${a}-${b}`);
  }
});

test("cada vértice toca exactamente 4 aristas, y la fórmula de Euler cuadra", () => {
  const grado = new Array(24).fill(0);
  for (const [a, b] of ARISTAS) { grado[a] += 1; grado[b] += 1; }
  assert.deepEqual([...new Set(grado)], [4], "algún vértice tiene otro número de aristas");
  /* V − A + C = 2 para cualquier poliedro convexo. */
  assert.equal(VERTICES.length - ARISTAS.length + CARAS.length, 2);
});

test("el volumen es el de la fórmula: (2/3)(6 + 5√2)·a³ con a = 2", () => {
  const esperado = (2 / 3) * (6 + 5 * Math.SQRT2) * ARISTA ** 3;
  assert.ok(Math.abs(volumenTotal() - esperado) < 1e-9, `${volumenTotal()} vs ${esperado}`);
});

test("es CENTRALMENTE SIMÉTRICO, que es de donde sale la regla del volumen", () => {
  /*
   * Si (a,b,c) es vértice, (−a,−b,−c) también. De ahí —y solo de ahí— sale que
   * cualquier plano por el centro parte el sólido en dos mitades iguales.
   */
  const clave = (v) => v.map((x) => x.toFixed(9)).join(",");
  const todos = new Set(VERTICES.map(clave));
  for (const v of VERTICES) {
    assert.ok(todos.has(clave(v.map((x) => -x))), `${v} no tiene su opuesto`);
  }
});

test("rotar no deforma: las distancias se conservan", () => {
  for (const [rx, ry, rz] of ORIENTACIONES.slice(0, 5)) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    for (const [a, b] of ARISTAS.slice(0, 12)) {
      assert.ok(Math.abs(distancia(V[a], V[b]) - ARISTA) < 1e-9);
    }
  }
});

/* ═══════════ LA REGLA CRÍTICA: EL LÍQUIDO VIVE EN EL MUNDO ═══════════ */

test("la superficie es horizontal respecto al MUNDO, gire el sólido como gire", () => {
  /*
   * ESTA ES LA PRUEBA DEL ENCARGO. Si la superficie rotara con el poliedro,
   * dejaría de leerse como líquido. La normal en reposo tiene que ser la
   * vertical del mundo en las veinte orientaciones, sin excepción.
   */
  const n = normalDeSuperficie(estadoInicial());
  for (const [rx, ry, rz] of ORIENTACIONES) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    /* La normal no depende del sólido: ni siquiera se le pasa. */
    const misma = normalDeSuperficie(estadoInicial());
    assert.deepEqual(misma, n, `la normal cambió con la orientación ${rx},${ry},${rz}`);
    /* Y es la vertical del mundo, a menos de una millonésima de grado. */
    assert.ok(Math.abs(punto(misma, ARRIBA) - 1) < 1e-12, "la superficie no está nivelada");
    /* El corte existe de verdad en esa orientación: no es una superficie vacía. */
    assert.ok(poligonoDeSuperficie(V, misma).length >= 3, "no hay corte");
  }
});

test("el módulo del líquido NO PUEDE depender de la rotación: nunca la toca", () => {
  /*
   * La garantía estructural, además de la numérica de arriba. No se mira la
   * firma de la función —un parámetro con valor por defecto no cuenta en
   * `length`, así que esa comprobación mentía—: se mira el módulo entero.
   *
   * liquido.js no importa `rotar` ni `rotarTodos` y no los nombra en ninguna
   * línea. Recibe vértices YA rotados y define su plano contra la vertical del
   * mundo. Mientras esto se cumpla, la superficie no puede colarse al espacio
   * local del poliedro ni por descuido.
   */
  const fuente = readFileSync("src/contabilidad/liquido.js", "utf8");
  /* Solo el código: los comentarios sí hablan de la rotación, y deben hacerlo. */
  const codigo = fuente
    .split(SALTO)
    .filter((l) => {
      const t = l.trim();
      return t && !t.startsWith("*") && !t.startsWith("/*") && !t.startsWith("//");
    })
    .join(" ");
  const identificadores = new Set(codigo.split(NO_PALABRA));
  assert.ok(!identificadores.has("rotar"), "liquido.js llama a rotar()");
  assert.ok(!identificadores.has("rotarTodos"), "liquido.js llama a rotarTodos()");
  for (const angulo of ["rx", "ry", "rz"]) {
    assert.ok(!identificadores.has(angulo), `liquido.js recibe ${angulo}: son ángulos del sólido`);
  }
});

test("EN PANTALLA el nivel es una línea horizontal exacta, gire el sólido como gire", () => {
  /*
   * El puente entre «espacio de mundo» y lo que ve el ojo, y la prueba que
   * convierte el requisito en algo que se mide en píxeles.
   *
   * La cámara mira al origen y la proyección solo invierte la Y. Un plano
   * horizontal del mundo que pasa por el centro se ve, por tanto, DE CANTO: sus
   * puntos tienen y = 0 en el mundo y caen todos en la misma fila de la
   * pantalla. Eso es lo que el estudiante lee como «el nivel del líquido».
   *
   * Si la superficie se rotara con el poliedro —el error que rompe la pieza—,
   * esta línea se inclinaría y se abriría en elipse al girar. Aquí su grosor
   * tiene que ser CERO, no «casi cero», en todas las orientaciones.
   */
  const n = normalDeSuperficie(estadoInicial());
  for (const [rx, ry, rz] of ORIENTACIONES) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    const ys = poligonoDeSuperficie(V, n).map((punto3) => proyectar(punto3, { escala: 100 })[1]);
    assert.ok(ys.length >= 3, "no hay superficie que proyectar");
    const grosor = Math.max(...ys) - Math.min(...ys);
    assert.ok(grosor < 1e-9, `el nivel se ve torcido: ${grosor} px de grosor`);
  }
});

test("y con chapoteo esa línea SÍ se inclina: es lo que la hace líquido", () => {
  /*
   * El complemento de la anterior. Una línea que nunca se mueve no es líquido,
   * es una raya pintada. La prueba de arriba exige grosor cero en reposo; esta
   * exige que deje de serlo cuando se agita.
   */
  const V = rotarTodos(VERTICES, 0.7, 1.2, 0.3);
  const ys = poligonoDeSuperficie(V, normalDeSuperficie({ x: 0.2, z: -0.15, vx: 0, vz: 0 }))
    .map((punto3) => proyectar(punto3, { escala: 100 })[1]);
  assert.ok(Math.max(...ys) - Math.min(...ys) > 20, "el chapoteo no se ve en pantalla");
});

test("con chapoteo la superficie se inclina un poco, pero nunca se pone de canto", () => {
  const maxima = normalDeSuperficie({ x: INCLINACION_MAXIMA, z: INCLINACION_MAXIMA, vx: 0, vz: 0 });
  const angulo = Math.acos(Math.min(1, punto(maxima, ARRIBA)));
  assert.ok(angulo > 0.01, "el chapoteo no mueve nada");
  assert.ok(angulo < 0.5, `se inclinó ${angulo} rad: es una ola, no un chapoteo`);
});

/* ═══════════ LA OTRA REGLA: EL VOLUMEN NUNCA CAMBIA ═══════════ */

test("el líquido es SIEMPRE la mitad exacta: 20 orientaciones × 5 chapoteos", () => {
  const chapoteos = [
    estadoInicial(),
    { x: 0.1, z: 0, vx: 0, vz: 0 },
    { x: -0.2, z: 0.15, vx: 0, vz: 0 },
    { x: INCLINACION_MAXIMA, z: -INCLINACION_MAXIMA, vx: 0, vz: 0 },
    { x: -INCLINACION_MAXIMA, z: INCLINACION_MAXIMA, vx: 0, vz: 0 },
  ];
  let peor = 0;
  let casos = 0;
  for (const [rx, ry, rz] of ORIENTACIONES) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    for (const estado of chapoteos) {
      const f = fraccionLlena(V, normalDeSuperficie(estado));
      peor = Math.max(peor, Math.abs(f - 0.5));
      casos += 1;
    }
  }
  assert.equal(casos, 100);
  /*
   * 1e-9 y no 0,01: no es una tolerancia generosa, es el ruido del punto
   * flotante. La mitad sale EXACTA porque el sólido es centralmente simétrico,
   * no porque se corrija.
   */
  assert.ok(peor < 1e-9, `el volumen se movió ${peor}`);
});

test("el volumen del sólido no depende de cómo esté girado", () => {
  const base = volumenTotal();
  for (const [rx, ry, rz] of ORIENTACIONES.slice(0, 6)) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    assert.ok(Math.abs(volumenTotal(V) - base) < 1e-9);
  }
});

/* ──────────────────────────── el corte ──────────────────────────── */

test("recortar deja fuera lo de arriba y entero lo de abajo", () => {
  const n = [0, 1, 0];
  const abajo = [[-1, -1, 0], [1, -1, 0], [1, -2, 0]];
  const arriba = [[-1, 1, 0], [1, 1, 0], [1, 2, 0]];
  assert.equal(recortarBajoPlano(abajo, n).length, 3, "una cara sumergida se recorta sola");
  assert.equal(recortarBajoPlano(arriba, n).length, 0, "una cara emergida no debería aportar nada");
  /* Una cara a caballo sale con sus dos cruces. */
  const mitad = recortarBajoPlano([[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]], n);
  assert.equal(mitad.length, 4);
  for (const p of mitad) assert.ok(punto(p, n) <= 1e-12, "quedó un punto por encima");
});

test("la superficie es un polígono cerrado y plano, sin puntos repetidos", () => {
  for (const [rx, ry, rz] of ORIENTACIONES.slice(0, 8)) {
    const V = rotarTodos(VERTICES, rx, ry, rz);
    const n = normalDeSuperficie({ x: 0.12, z: -0.08, vx: 0, vz: 0 });
    const poligono = poligonoDeSuperficie(V, n);
    assert.ok(poligono.length >= 3, "corte degenerado");
    for (const p of poligono) {
      assert.ok(Math.abs(punto(p, n)) < 1e-9, "un punto del corte no está en el plano");
    }
    const claves = poligono.map((p) => p.map((x) => x.toFixed(6)).join(","));
    assert.equal(new Set(claves).size, claves.length, "la superficie trae puntos repetidos");
  }
});

test("el cuerpo del líquido queda entero por debajo de la superficie", () => {
  const V = rotarTodos(VERTICES, 0.9, 1.7, 0.4);
  const n = normalDeSuperficie({ x: 0.2, z: 0.1, vx: 0, vz: 0 });
  const { partes, superficie } = cuerpoDelLiquido(V, n);
  assert.ok(partes.length > 0);
  for (const parte of partes) {
    for (const p of parte.puntos) assert.ok(punto(p, n) <= 1e-9, "hay líquido por encima del nivel");
  }
  assert.ok(superficie.length >= 3);
});

/* ──────────────────────────── el chapoteo ──────────────────────────── */

test("en reposo el líquido está quieto y nivelado, y no pide fotogramas", () => {
  let e = estadoInicial();
  assert.ok(enReposo(e));
  for (let i = 0; i < 60; i += 1) e = avanzarChapoteo(e, 1 / 60);
  assert.ok(enReposo(e), "se movió solo sin que nadie lo tocara");
  /* Se compara con resta y no con deepEqual: −0 y 0 son el mismo nivel. */
  const n = normalDeSuperficie(e);
  for (let i = 0; i < 3; i += 1) assert.ok(Math.abs(n[i] - ARRIBA[i]) < 1e-12, "no quedó nivelado");
});

test("un empujón da 2 o 3 oscilaciones decrecientes y luego se apaga", () => {
  let e = avanzarChapoteo(estadoInicial(), 1 / 60, { x: 0.9, z: 0 });
  const serie = [];
  for (let i = 0; i < 360; i += 1) {
    e = avanzarChapoteo(e, 1 / 60);
    serie.push(e.x);
  }
  /* Cuántas veces cruza el nivel: dos o tres, no una ni diez. */
  let cruces = 0;
  for (let i = 1; i < serie.length; i += 1) {
    if (Math.sign(serie[i]) !== Math.sign(serie[i - 1]) && Math.abs(serie[i]) > 1e-4) cruces += 1;
  }
  assert.ok(cruces >= 2 && cruces <= 4, `cruzó el nivel ${cruces} veces; se esperaban 2-3`);

  /* Y decrecen: cada pico es menor que el anterior. */
  const picos = [];
  for (let i = 1; i + 1 < serie.length; i += 1) {
    if (Math.abs(serie[i]) > Math.abs(serie[i - 1]) && Math.abs(serie[i]) > Math.abs(serie[i + 1])) {
      picos.push(Math.abs(serie[i]));
    }
  }
  assert.ok(picos.length >= 2, "no hubo oscilación");
  for (let i = 1; i < picos.length; i += 1) {
    assert.ok(picos[i] < picos[i - 1], "una oscilación creció: no está amortiguado");
  }

  /* Y termina quieto: vuelve a quedar nivelado, que es la promesa. */
  assert.ok(enReposo(e), "seis segundos después todavía se mueve");
});

test("por fuerte que sea el empujón, la superficie no se desborda", () => {
  let e = estadoInicial();
  for (let i = 0; i < 40; i += 1) e = avanzarChapoteo(e, 1 / 60, { x: 5, z: -5 });
  assert.ok(Math.abs(e.x) <= INCLINACION_MAXIMA + 1e-12, `se inclinó ${e.x}`);
  assert.ok(Math.abs(e.z) <= INCLINACION_MAXIMA + 1e-12, `se inclinó ${e.z}`);
  /* Y aun zarandeado, sigue siendo media carga exacta. */
  const V = rotarTodos(VERTICES, 1.2, 0.4, 2.2);
  assert.ok(Math.abs(fraccionLlena(V, normalDeSuperficie(e)) - 0.5) < 1e-9);
});

test("el chapoteo responde al CAMBIO, no a estar inclinado", () => {
  /* Un sólido quieto en una postura rara no agita nada. */
  let quieto = estadoInicial();
  for (let i = 0; i < 120; i += 1) quieto = avanzarChapoteo(quieto, 1 / 60, { x: 0, z: 0 });
  assert.ok(enReposo(quieto));
  /* Uno que se mueve, sí. */
  const movido = avanzarChapoteo(estadoInicial(), 1 / 60, { x: 0.5, z: 0 });
  assert.ok(!enReposo(movido));
});

test("un salto de tiempo largo —una pestaña en segundo plano— no revienta el muelle", () => {
  /*
   * LA VELOCIDAD ES LO QUE HAY QUE MIRAR, no la posición.
   *
   * Esta prueba miraba que el estado fuera finito y que la posición siguiera
   * dentro del tope, y las dos cosas se cumplen igual SIN el tope de `dt`: el
   * recorte de posición tapaba el destrozo. Lo que de verdad pasa al volver de
   * una pestaña en segundo plano es que la velocidad se dispara —medido: −145
   * en vez de 0,6— y el líquido da un latigazo durante medio segundo largo.
   *
   * El muelle tiene ω = √42 ≈ 6,5 rad/s, así que a amplitud máxima la
   * velocidad honesta ronda 1,8. Diez es holgado y sigue estando a quince veces
   * del descalabro.
   */
  let e = avanzarChapoteo(estadoInicial(), 1 / 60, { x: 0.8, z: 0.8 });
  e = avanzarChapoteo(e, 30);
  assert.ok(Number.isFinite(e.x) && Number.isFinite(e.z), "el estado se fue a NaN");
  assert.ok(Math.abs(e.x) <= INCLINACION_MAXIMA + 1e-12);
  const maxima = Math.sqrt(RIGIDEZ) * INCLINACION_MAXIMA;
  assert.ok(maxima < 2, "cambió el muelle: revisa la cota de abajo");
  assert.ok(Math.abs(e.vx) < 10, `la velocidad se disparó a ${e.vx.toFixed(1)}: al volver a la pestaña daría un latigazo`);
  assert.ok(Math.abs(e.vz) < 10, `la velocidad se disparó a ${e.vz.toFixed(1)}`);
  assert.ok(AMORTIGUACION > 0 && RIGIDEZ > 0);
});

/* ──────────────────────────── la proyección ──────────────────────────── */

test("proyectar invierte la Y: en el mundo sube y en la pantalla baja", () => {
  const [, arriba] = proyectar([0, 1, 0], { escala: 1 });
  const [, abajo] = proyectar([0, -1, 0], { escala: 1 });
  assert.ok(arriba < abajo, "la escena saldría del revés");
});

test("lo que está más cerca se dibuja más grande", () => {
  const [cerca] = proyectar([1, 0, 2], { escala: 1 });
  const [lejos] = proyectar([1, 0, -2], { escala: 1 });
  assert.ok(cerca > lejos, "no hay perspectiva");
});
