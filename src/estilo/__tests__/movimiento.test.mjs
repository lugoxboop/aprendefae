import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tipoDeEstado, leerNumero, giroHacia, MOVIMIENTOS, TIEMPO, conTransicion, RELIEVE } from "../movimiento.js";

const CSS = readFileSync(new URL("../../styles/movimiento.css", import.meta.url), "utf8");
const PERMITIDAS = new Set(["opacity", "scale", "translate", "rotate", "offset"]);

test("★ cada cambio de estado de una actividad recibe su movimiento, y lo neutro no se mueve", () => {
  for (const v of ["acierto", "correcta", "bien", "ok", "Comprado"]) assert.equal(tipoDeEstado(v), "acierto", v);
  for (const v of ["error", "mal", "incorrecta"]) assert.equal(tipoDeEstado(v), "error", v);
  for (const v of ["elegida", "activo", "colocada"]) assert.equal(tipoDeEstado(v), "elegido", v);
  assert.equal(tipoDeEstado("revelada"), "revelado");
  for (const v of ["", null, "reposo", "pendiente", "libre", "ninguno", "normal", "falta"]) assert.equal(tipoDeEstado(v), null, String(v));
});

test("★ los movimientos solo tocan opacidad y las propiedades sueltas, y la interfaz no pasa de 300 ms", () => {
  for (const [nombre, m] of Object.entries(MOVIMIENTOS)) {
    /* Solo una celebración rara (ganar FP) puede pasar del tope de la interfaz. */
    assert.ok(m.duracion <= (m.celebracion ? 600 : TIEMPO), `${nombre} dura ${m.duracion}`);
    for (const f of m.fotogramas) for (const k of Object.keys(f)) assert.ok(PERMITIDAS.has(k), `${nombre} anima ${k}`);
    assert.ok(!/linear|^ease$/.test(m.curva), `${nombre} usa ${m.curva}`);
    /* Pose to pose: empieza y termina en reposo. */
    const ult = m.fotogramas.at(-1);
    if ("scale" in ult) assert.equal(ult.scale, "1");
    if ("translate" in ult) assert.equal(ult.translate, "0 0");
  }
  /* Sumar opacidad a 1 da 1: lo que se funde no puede ir sumado. */
  for (const m of Object.values(MOVIMIENTOS)) if (m.sumar) assert.ok(m.fotogramas.every((f) => !("opacity" in f)));
});

test("★ la hoja: solo transform suelto y opacidad en los fotogramas, nada en bucle, todo con movimiento reducido", () => {
  const cuerpos = [...CSS.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*\}/g)];
  assert.ok(cuerpos.length >= 10, `solo ${cuerpos.length} fotogramas`);
  for (const [, nombre, cuerpo] of cuerpos) {
    for (const [, prop] of cuerpo.matchAll(/([a-z-]+)\s*:/g)) assert.ok(PERMITIDAS.has(prop), `${nombre} anima ${prop}`);
  }
  assert.doesNotMatch(CSS, /infinite/);
  assert.doesNotMatch(CSS.replace(/\/\*[\s\S]*?\*\//g, ""), /\b(linear|ease-in|ease-out|ease)\b(?!-)/);
  /* Todo lo que anima vive dentro de «no-preference», y hay corte para «reduce». */
  const fuera = CSS.split("@media (prefers-reduced-motion: no-preference)")[0];
  assert.doesNotMatch(fuera.replace(/\/\*[\s\S]*?\*\//g, ""), /animation|transition/);
  assert.match(CSS, /prefers-reduced-motion: reduce/);
});

test("★ Miller: una fila escalonada no espera más allá del séptimo", () => {
  assert.match(CSS, /\[data-mv-fila\]\) > :nth-child\(n\+7\)/);
  assert.doesNotMatch(CSS, /\[data-mv-fila\]\) > :nth-child\(8\)/);
});

test("★ Fitts: volver y cerrar tienen zona de toque más grande que el dibujo", () => {
  assert.match(CSS, /button\[aria-label\^="Volver"\][\s\S]*?::after\s*\{[\s\S]*?inset:\s*-8px/);
});

test("★ lo que se arrastra no se aplasta al pulsarlo (movería las medidas de la mecánica)", () => {
  const regla = CSS.match(/:where\(button:not[\s\S]*?\):active\s*\{/)[0];
  assert.match(regla, /\[draggable="true"\]/);
  assert.match(regla, /touch-action/);
});

test("★ Postel: acepta números escritos a mano y devuelve uno limpio", () => {
  const casos = [
    ["$ 1.250.000", 1250000], ["1,250,000", 1250000], ["1.250.000,50", 1250000.5], ["1,250,000.50", 1250000.5],
    ["1250000,5", 1250000.5], ["-3.500", -3500], ["(3.500)", -3500], ["12 %", 12], ["2.75", 2.75], ["1,5", 1.5],
    ["0.125", 0.125], [" 900 ", 900], ["COP 45.000", 45000], [7, 7],
  ];
  for (const [entra, sale] of casos) assert.equal(leerNumero(entra), sale, String(entra));
  for (const nada of ["", "abc", null, undefined, NaN]) assert.equal(leerNumero(nada), null, String(nada));
});

test("★ profundidad: el giro sigue al puntero, tiene tope y es cero en el centro", () => {
  const caja = { left: 0, top: 0, width: 200, height: 100 };
  assert.deepEqual(giroHacia(100, 50, caja).at(-1), 0);
  const [x, y, g] = giroHacia(200, 50, caja);
  assert.ok(y > 0 && Math.abs(x) < 1e-9 && g <= 7, `${x} ${y} ${g}`);
  assert.ok(giroHacia(9999, 9999, caja)[2] <= 7);
  for (const s of [".fae-card", "[data-accesorio]", "[data-medalla]"]) assert.ok(RELIEVE.includes(s));
});

test("★ sin transiciones de vista (o en las pruebas), el cambio de pantalla igual pasa, una vez", () => {
  let n = 0;
  conTransicion(() => { n += 1; }, "avanza");
  assert.equal(n, 1);
});

test("★ el sistema está enchufado: hoja e instalación en main, y la salida y la entrada de actividades lo usan", () => {
  const main = readFileSync(new URL("../../main.jsx", import.meta.url), "utf8");
  assert.match(main, /styles\/movimiento\.css/);
  assert.match(main, /instalarMovimiento\(document\)/);
  for (const f of ["components/shared/CaminoHacer.jsx", "components/shared/PantallaResumen.jsx", "components/mecanicas/libros/JuegoConTutorial.jsx", "ruta.js"]) {
    assert.match(readFileSync(new URL(`../../${f}`, import.meta.url), "utf8"), /conTransicion\(/, f);
  }
});

test("★ Jakob: entrar más hondo avanza; subir o ir al inicio vuelve", async () => {
  const { tipoDeCambio } = await import("../../ruta.js");
  assert.equal(tipoDeCambio("#/contabilidad", "#/ingresos-gastos-y-caja/hacer"), "avanza");
  assert.equal(tipoDeCambio("", "#/contabilidad"), "avanza");
  assert.equal(tipoDeCambio("#/ingresos-gastos-y-caja/hacer", "#/contabilidad"), "vuelve");
  assert.equal(tipoDeCambio("#/contabilidad", ""), "vuelve");
  assert.equal(tipoDeCambio("#/contabilidad", "#/macroeconomia"), "avanza");
});

test("★ la retroalimentación se oye con el nombre que cada célula le puso, sin confundir «activa» con un acierto", async () => {
  const { tipoDeRetro } = await import("../movimiento.js");
  assert.equal(tipoDeRetro("data-retro", "ok"), "acierto");
  assert.equal(tipoDeRetro("data-veredicto", "mal"), "error");
  assert.equal(tipoDeRetro("data-marca", "bien"), "acierto");
  assert.equal(tipoDeRetro("data-panel", "activa"), null);
  assert.equal(tipoDeRetro("data-estado", "activa"), "elegido");
});

test("★ de un punto a otro: se reconoce el botón por lo que dice, y no se confunde con navegar o entrar", async () => {
  const { direccionDePaso } = await import("../movimiento.js");
  for (const t of ["Siguiente alerta", "Siguiente hecho", "Continuar", "Cerrar turno", "Ver resultado", "  Siguiente  "]) assert.equal(direccionDePaso(t), "adelante", t);
  assert.equal(direccionDePaso("Anterior"), "atras");
  for (const t of ["Continuar con Google", "Volver al camino", "Siguiente tema", "Colocar la ficha", "Grupo 1", "", null]) assert.equal(direccionDePaso(t), null, String(t));
  assert.equal(MOVIMIENTOS.ganar.celebracion, true);
});

test("★ la hoja anima el paso de punto a punto solo en la tarjeta, no en la página", () => {
  assert.match(CSS, /\[data-mv-transicion\^="item"\]::view-transition-old\(root\)/);
  assert.match(CSS, /::view-transition-new\(mv-item\)/);
  assert.match(CSS, /item-atras/);
});
