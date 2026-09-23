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
  /* Los montos escritos, con el color que llevaban: es lo que mira la partida doble. */
  const textos = [];
  let relleno = "";
  const ctx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    translate() {}, scale() {}, transform() {},
    moveTo(x, y) { puntos.push([x, y]); }, lineTo(x, y) { puntos.push([x, y]); },
    quadraticCurveTo() {}, arc() {},
    fill() { llamadas.push("fill"); }, stroke() { llamadas.push("stroke"); },
    fillRect() { llamadas.push("fillRect"); },
    fillText(t, x, y) { textos.push({ texto: String(t), x, y, color: relleno }); },
    measureText(t) { return { width: String(t).length * 7 }; },
    createLinearGradient() { return { addColorStop(_, c) { colores.add(String(c)); } }; },
    set fillStyle(v) { relleno = String(v); colores.add(String(v)); },
    set strokeStyle(v) { colores.add(String(v)); },
    get fillStyle() { return relleno; }, get strokeStyle() { return ""; },
    lineWidth: 0, lineCap: "", lineJoin: "", font: "", textBaseline: "", textAlign: "",
  };
  return { ctx, llamadas, colores, puntos, textos };
}

test("el fondo de Contabilidad traza las cuentas T y sus asientos", () => {
  const l = lienzoFalso();
  fondoDeMateria("contabilidad")(l.ctx);

  assert.ok(l.llamadas.includes("stroke"), "no trazó ni una cuenta");
  /*
   * Cada cuenta T son cuatro puntos —la horizontal y la vertical— y hay entre
   * 8 y 14, así que por debajo de 32 falta geometría. El número sale de la
   * ficha, no de lo que salga hoy.
   */
  assert.ok(l.puntos.length >= 32, `solo trazó ${l.puntos.length} puntos: faltan cuentas`);

  const texto = [...l.colores].join(" ");
  assert.match(texto, /61,90,128/, "las cuentas no van en el navy de los avatares");
  /* Coral significa error en todo el sitio: no pinta un fondo. */
  assert.ok(!/231,111,81/.test(texto), "hay coral en el fondo de Contabilidad");
});

test("la miniatura enseña la partida doble: el mismo monto al debe y al haber", () => {
  const l = lienzoFalso();
  fondoDeMateria("contabilidad")(l.ctx);

  /*
   * ESTA ES LA PRUEBA QUE IMPORTA. Si la miniatura pintara un monto solo, o dos
   * distintos, dejaría de decir lo único que el fondo existe para decir.
   */
  assert.ok(l.textos.length > 0, "no escribió ningún monto");
  const cuenta = {};
  for (const t of l.textos) cuenta[t.texto] = (cuenta[t.texto] ?? 0) + 1;
  for (const [monto, veces] of Object.entries(cuenta)) {
    assert.equal(veces, 2, `${monto} aparece ${veces} veces; un asiento se anota DOS`);
  }

  /* Y sin signos: el debe no es positivo ni el haber negativo. */
  for (const t of l.textos) {
    assert.match(t.texto, /^\$[\d.]+$/, `${t.texto} no tiene el formato de peso colombiano`);
    assert.ok(!/[+−-]/.test(t.texto), `${t.texto} lleva signo`);
  }

  /* Uno en teal y otro en ámbar, por monto. */
  const colores = l.textos.map((t) => t.color);
  assert.ok(colores.some((c) => c.includes("42,157,143")), "ningún monto en teal (debe)");
  assert.ok(colores.some((c) => c.includes("233,196,106")), "ningún monto en ámbar (haber)");
});

test("la miniatura es siempre la misma: su semilla es fija", () => {
  /*
   * Es una imagen que el estudiante descarga y comparte. Si cambiara en cada
   * generación, dos descargas del mismo resumen saldrían distintas.
   */
  const a = lienzoFalso();
  const b = lienzoFalso();
  fondoDeMateria("contabilidad")(a.ctx);
  fondoDeMateria("contabilidad")(b.ctx);
  assert.deepEqual(a.puntos, b.puntos, "la miniatura cambia entre generaciones");
  assert.deepEqual(a.textos.map((t) => t.texto), b.textos.map((t) => t.texto));
});
