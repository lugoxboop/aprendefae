import { test } from "node:test";
import assert from "node:assert/strict";

import { fondoDeMateria, FONDOS_DE_MATERIA } from "../tarjeta.js";
import { SUBJECTS } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CADA MATERIA, SU FONDO EN LA TARJETA DE RESUMEN.
 *
 * Esto existe por un fallo concreto y mudo. El despacho era
 *
 *   if (materiaPrincipal === "pensamiento-estrategico") fondoAjedrez(ctx);
 *   else fondoOfertaDemanda(ctx);
 *
 * y ese `else` no era un valor por defecto pensado: era todo lo que no se
 * había mirado. Al crear Contabilidad, un estudiante suyo habría descargado su
 * resumen de semestre con las curvas de oferta y demanda detrás —la materia
 * equivocada— sin que nada fallara, nada avisara y nadie se enterara hasta
 * verlo compartido por WhatsApp.
 *
 * La prueba recorre SUBJECTS, así que el día que entre la cuarta materia esto
 * se pone rojo antes de que la tarjeta mienta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("todas las materias del sitio tienen su propio fondo declarado", () => {
  const sinFondo = Object.keys(SUBJECTS).filter((id) => !(id in FONDOS_DE_MATERIA));
  assert.deepEqual(sinFondo, [], "materias que caerían en el fondo de otra");
});

test("y ningún fondo sobra: no hay materias fantasma en el registro", () => {
  const fantasmas = Object.keys(FONDOS_DE_MATERIA).filter((id) => !(id in SUBJECTS));
  assert.deepEqual(fantasmas, [], "el registro nombra materias que ya no existen");
});

test("cada materia recibe un fondo DISTINTO: si no, la tarjeta no la identifica", () => {
  const porMateria = Object.keys(SUBJECTS).map((id) => [id, fondoDeMateria(id)]);
  const usados = new Set(porMateria.map(([, f]) => f));
  assert.equal(
    usados.size,
    porMateria.length,
    `dos materias comparten fondo: ${porMateria.map(([id, f]) => `${id}→${f.name}`).join(", ")}`,
  );
});

test("Contabilidad recibe el suyo, que era justo el fallo", () => {
  assert.equal(fondoDeMateria("contabilidad").name, "fondoContabilidad");
  assert.notEqual(fondoDeMateria("contabilidad"), fondoDeMateria("macroeconomia"));
});

test("sin materia principal hay un defecto EXPLÍCITO, que no es lo mismo que un else", () => {
  /*
   * `materiaPrincipal` es null para quien todavía no ha hecho nada. Ese caso sí
   * necesita un fondo cualquiera y es legítimo; lo que no puede es volver a ser
   * el cajón donde caen las materias sin declarar.
   */
  assert.equal(typeof fondoDeMateria(null), "function");
  assert.equal(typeof fondoDeMateria(undefined), "function");
  assert.equal(fondoDeMateria(null), fondoDeMateria("macroeconomia"), "el defecto es el de Macro");
});

test("una materia inventada NO se dibuja como Contabilidad ni como Estrategia", () => {
  /* El defecto tiene que ser el defecto, no la última materia que se añadió. */
  const inventada = fondoDeMateria("materia-que-no-existe");
  assert.notEqual(inventada, fondoDeMateria("contabilidad"));
  assert.notEqual(inventada, fondoDeMateria("pensamiento-estrategico"));
});

/* ──────────────────── el fondo dibuja de verdad ──────────────────── */

/*
 * Un canvas de mentira que apunta lo que se le pide. No comprueba que la imagen
 * sea bonita —eso se mira— pero sí que el fondo trace algo y que use los
 * colores de su materia, que es lo que se rompe al tocar la geometría.
 */
function lienzoFalso() {
  const llamadas = [];
  const colores = new Set();
  const puntos = [];
  const ctx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    translate() {}, scale() {}, transform() {},
    moveTo(x, y) { puntos.push([x, y]); }, lineTo(x, y) { puntos.push([x, y]); },
    quadraticCurveTo() {}, arc() {},
    fill() { llamadas.push("fill"); }, stroke() { llamadas.push("stroke"); },
    fillRect() { llamadas.push("fillRect"); },
    set fillStyle(v) { colores.add(String(v)); },
    set strokeStyle(v) { colores.add(String(v)); },
    get fillStyle() { return ""; }, get strokeStyle() { return ""; },
    lineWidth: 0, lineCap: "", lineJoin: "",
  };
  return { ctx, llamadas, colores, puntos };
}

test("el fondo de Contabilidad traza el sólido entero y subraya el nivel", () => {
  const l = lienzoFalso();
  fondoDeMateria("contabilidad")(l.ctx);

  assert.ok(l.llamadas.includes("stroke"), "no trazó ninguna arista");
  assert.ok(l.llamadas.includes("fill"), "no pintó el líquido");
  /* Las 48 aristas, más el líquido, más la línea del nivel. */
  assert.ok(l.puntos.length > 96, `solo trazó ${l.puntos.length} puntos: falta geometría`);

  const texto = [...l.colores].join(" ");
  assert.match(texto, /42,157,143/, "el líquido no va en teal");
  assert.match(texto, /61,90,128/, "las aristas no van en el navy de los avatares");
  /* Coral significa error en todo el sitio: no pinta un fondo. */
  assert.ok(!/231,111,81/.test(texto), "hay coral en el fondo de Contabilidad");
});

test("el nivel se dibuja HORIZONTAL: la misma promesa que el fondo animado", () => {
  const l = lienzoFalso();
  fondoDeMateria("contabilidad")(l.ctx);
  /*
   * La última línea que se traza es la del nivel, y sus dos extremos tienen que
   * estar a la misma altura. Si algún día la superficie se rotara con el
   * sólido, esos dos números dejarían de coincidir.
   */
  const [a, b] = l.puntos.slice(-2);
  assert.ok(Math.abs(a[1] - b[1]) < 1e-9, `el nivel sale torcido: ${a[1]} vs ${b[1]}`);
  assert.ok(Math.abs(a[0] - b[0]) > 50, "el nivel no tiene ancho: no se vería");
});
