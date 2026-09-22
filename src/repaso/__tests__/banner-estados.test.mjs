import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES ESTADOS DEL BANNER DEL REPASO, Y SU EXPANSIÓN.
 *
 * El dato se inyecta con la prop `repaso`: los tres estados dependen de lo que
 * diga la base, y levantar una base para cada uno no probaría nada más. Es el
 * mismo patrón que `onGuardar` en el selector de avatar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: BannerRepaso, SUBTITULO_REPASO, copiaBloqueo } = await import("../../components/repaso/BannerRepaso.jsx");
const { ACTIVIDADES_TRANSVERSALES } = await import("../../data/subjects.js");
const { AuthProvider } = await import("../../auth/AuthProvider.jsx");

const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === "repaso-diario");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const conEstado = (repaso, onEmpezar = () => {}) =>
  montar(React.createElement(AuthProvider, null,
    React.createElement(BannerRepaso, { actividad: REPASO, onEmpezar, repaso })));

const PREVIA = { items: new Array(10).fill(null), temas: ["demanda-agregada", "politica-fiscal"], cuantos: 10, topeRelajado: false };
const PENDIENTE = { cargando: false, error: false, estado: "listo", previa: PREVIA, faltan: 0, racha: 5 };
const HECHO = { cargando: false, error: false, estado: "hecho-hoy", previa: null, faltan: 0, racha: 5 };
const BLOQUEADO = { cargando: false, error: false, estado: "pocas-actividades", previa: null, faltan: 2, racha: 0 };

const abrir = (caja) => act(() => caja.querySelector(".fae-repaso__cabecera").dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
const css = (caja) => [...caja.querySelectorAll("style")].map((s) => s.textContent).join("\n");

/* ───────────────────────── A.1 · activo ───────────────────────── */

test("activo pendiente: un solo icono, chip ámbar, título y subtítulo exactos", () => {
  const m = conEstado(PENDIENTE);
  try {
    const b = m.caja.querySelector("[data-banner]");
    assert.equal(b.dataset.estado, "pendiente");
    assert.equal(b.querySelector("[data-chip]").dataset.chip, "pendiente");
    assert.match(b.textContent, /Pendiente hoy/);
    assert.match(b.textContent, /El Repaso Diario/);
    assert.equal(SUBTITULO_REPASO, "Repasa lo que ya viste, mezclado entre todos los temas.");
    assert.match(b.textContent, /Repasa lo que ya viste, mezclado entre todos los temas\./);

    /* UN SOLO icono: el reloj se fue. */
    assert.equal(b.querySelectorAll("[data-llama]").length, 1, "solo la llama, y una sola vez");
    assert.equal(b.querySelectorAll("[data-icono]").length, 0, "el reloj ya no está");
    /* Y el widget de cuatro rectángulos y la insignia HACER, fuera. */
    assert.equal(b.querySelectorAll("[data-previa]").length, 0, "sin la miniatura de las puertas");
    assert.ok(!/HACER/i.test(b.textContent), "sin la insignia HACER: su sitio lo ocupa el chip");
  } finally { m.desmontar(); }
});

test("activo completado: chip teal con marca de verificación", () => {
  const m = conEstado(HECHO);
  try {
    const b = m.caja.querySelector("[data-banner]");
    assert.equal(b.dataset.estado, "hecho");
    assert.equal(b.querySelector("[data-chip]").dataset.chip, "listo");
    assert.match(b.textContent, /Listo hoy/);
    assert.match(b.querySelector("[data-chip]").textContent, /✓/);
  } finally { m.desmontar(); }
});

/* ──────────────────── D · la racha en cero ──────────────────── */

test("con racha se pinta el número; sin racha NUNCA sale un cero junto al fuego", () => {
  const con = conEstado({ ...PENDIENTE, racha: 5 });
  try {
    const l = con.caja.querySelector("[data-llama]");
    assert.equal(l.dataset.llama, "encendida");
    assert.equal(l.querySelector("[data-racha-numero]").textContent, "5");
  } finally { con.desmontar(); }

  const sin = conEstado({ ...PENDIENTE, racha: 0 });
  try {
    const l = sin.caja.querySelector("[data-llama]");
    assert.equal(l.dataset.llama, "apagada");
    assert.equal(l.querySelector("[data-racha-numero]"), null, "sin número al lado");
    assert.ok(!/0/.test(l.textContent), "un cero junto a un fuego se lee como fracaso");
  } finally { sin.desmontar(); }
});

/* ───────────────────────── A.2 · bloqueado ───────────────────────── */

test("bloqueado: se sigue viendo, atenuado, sin chip, sin flecha y sin expandirse", () => {
  const m = conEstado(BLOQUEADO);
  try {
    const b = m.caja.querySelector("[data-banner]");
    assert.ok(b, "EL BANNER NUNCA DESAPARECE");
    assert.equal(b.dataset.estado, "bloqueado");
    assert.equal(b.style.opacity, "0.55");
    assert.equal(b.querySelector("[data-chip]"), null, "no es pendiente hoy: es todavía no");
    assert.equal(b.querySelector(".fae-repaso__flecha"), null, "sin flecha");
    assert.equal(b.querySelector("[data-expansion]"), null, "no hay nada que expandir");
    assert.equal(b.querySelector("button"), null, "no es tocable");
    assert.equal(b.querySelector("[data-llama]").dataset.llama, "apagada");
  } finally { m.desmontar(); }
});

test("el copy del bloqueo cuenta hacia atrás, y el singular es singular", () => {
  assert.equal(copiaBloqueo("pocas-actividades", 3), "Te faltan 3 actividades para desbloquearlo");
  assert.equal(copiaBloqueo("pocas-actividades", 2), "Te faltan 2 actividades para desbloquearlo");
  assert.equal(copiaBloqueo("pocas-actividades", 1), "Te falta 1 actividad para desbloquearlo");
  assert.equal(copiaBloqueo("pool-corto", 0), "Completa más actividades para desbloquearlo");

  const m = conEstado({ ...BLOQUEADO, faltan: 1 });
  try {
    assert.equal(m.caja.querySelector("[data-bloqueo]").textContent, "Te falta 1 actividad para desbloquearlo");
  } finally { m.desmontar(); }
});

/* ───────────────────── B y C · la expansión ───────────────────── */

test("toca y se expande en sitio; la flecha rota; segundo toque colapsa", () => {
  const m = conEstado(PENDIENTE);
  try {
    assert.ok(!m.caja.querySelector(".fae-repaso__caja").className.includes("abierta"), "arranca cerrado");

    abrir(m.caja);
    assert.ok(m.caja.querySelector(".fae-repaso__caja").className.includes("abierta"), "se abre");
    assert.ok(m.caja.querySelector(".fae-repaso__flecha").className.includes("abierta"), "la flecha rota");
    assert.ok(m.caja.querySelector("[data-banner]"), "sigue siendo el banner, no otra pantalla");

    abrir(m.caja);
    assert.ok(!m.caja.querySelector(".fae-repaso__caja").className.includes("abierta"), "y se cierra");
  } finally { m.desmontar(); }
});

test("la transición anima la altura, y dura entre 250 y 300 ms", () => {
  const m = conEstado(PENDIENTE);
  try {
    const hoja = css(m.caja);
    assert.match(hoja, /\.fae-repaso__caja \{[^}]*grid-template-rows: 0fr/);
    assert.match(hoja, /\.fae-repaso__caja--abierta \{ grid-template-rows: 1fr/);
    const ms = Number(/transition: grid-template-rows (\d+)ms/.exec(hoja)[1]);
    assert.ok(ms >= 250 && ms <= 300, `${ms} ms fuera del rango pedido`);
  } finally { m.desmontar(); }
});

test("expansión pendiente: temas del día, cuenta de ítems y FP, y el botón", () => {
  const empezados = [];
  const m = conEstado(PENDIENTE, () => empezados.push(1));
  try {
    abrir(m.caja);
    const e = m.caja.querySelector("[data-expansion]");
    assert.equal(e.querySelector("[data-temas]").textContent, "Hoy entran: Demanda Agregada · Política Fiscal");
    assert.equal(e.querySelector("[data-cuenta]").textContent, "10 ítems · hasta 60 FP");
    assert.equal(e.querySelector("[data-empieza-racha]"), null, "con racha viva, esa línea no sale");

    const boton = e.querySelector("[data-empezar]");
    assert.equal(boton.textContent, "Empezar el repaso");
    act(() => boton.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
    assert.equal(empezados.length, 1, "el botón lleva al flujo de preguntas");
  } finally { m.desmontar(); }
});

test("sin racha, la expansión añade la línea que invita a empezarla", () => {
  const m = conEstado({ ...PENDIENTE, racha: 0 });
  try {
    abrir(m.caja);
    assert.equal(m.caja.querySelector("[data-empieza-racha]").textContent, "Hazlo hoy y empiezas tu racha.");
  } finally { m.desmontar(); }
});

test("expansión completada: el texto de cumplido, sin botón, con la llama animada", () => {
  const m = conEstado(HECHO);
  try {
    abrir(m.caja);
    const e = m.caja.querySelector("[data-expansion]");
    assert.match(e.textContent, /Racha del día asegurada/);
    assert.match(e.textContent, /Vuelve mañana para seguir repasando\./);
    assert.equal(e.querySelector("[data-empezar]"), null, "no hay nada que empezar");
    assert.ok(e.querySelector(".fae-repaso__llama-viva"), "aquí SÍ se anima el fuego");
  } finally { m.desmontar(); }
});

test("la llama del banner CERRADO nunca se anima", () => {
  for (const estado of [PENDIENTE, HECHO]) {
    const m = conEstado(estado);
    try {
      const cabecera = m.caja.querySelector(".fae-repaso__cabecera");
      assert.equal(cabecera.querySelector(".fae-repaso__llama-viva"), null,
        "cerrado es ambiente, no un momento: animarlo compite con los temas");
    } finally { m.desmontar(); }
  }
});

/* ─────────────── accesibilidad del movimiento ─────────────── */

test("las dos animaciones del fuego existen, con duraciones distintas a propósito", () => {
  const m = conEstado(HECHO);
  try {
    const hoja = css(m.caja);
    assert.match(hoja, /fae-repaso-flota 3\.5s cubic-bezier\(0\.45, 0, 0\.55, 1\) infinite alternate/);
    assert.match(hoja, /fae-repaso-brilla 2\.8s cubic-bezier\(0\.45, 0, 0\.55, 1\) infinite alternate/);
    assert.match(hoja, /translateY\(-3px\)/);
    assert.match(hoja, /drop-shadow\(0 0 4px rgba\(231, 111, 81, 0\.25\)\)/);
    assert.match(hoja, /drop-shadow\(0 0 10px rgba\(231, 111, 81, 0\.5\)\)/);
  } finally { m.desmontar(); }
});

test("con reducir movimiento, las dos animaciones se apagan del todo", () => {
  const m = conEstado(HECHO);
  try {
    const hoja = css(m.caja);
    const reduce = hoja.slice(hoja.indexOf("@media (prefers-reduced-motion: reduce)"));
    assert.ok(reduce.includes(".fae-repaso__llama-viva { animation: none;"), "la llama queda quieta");
    assert.ok(reduce.includes("filter: none"), "y sin el halo de brillo");
    assert.ok(reduce.includes("transform: none"), "en su posición de base");
  } finally { m.desmontar(); }
});

test("el coral del banner está SOLO en el brillo del fuego", () => {
  const m = conEstado(PENDIENTE);
  try {
    const hoja = css(m.caja);
    const fuera = hoja.replace(/@keyframes fae-repaso-brilla \{[\s\S]*?\n\}/, "");
    assert.ok(!/231, 111, 81/.test(fuera), "coral fuera del brillo del fuego");
    /* El chip de pendiente es ámbar, no coral. */
    assert.equal(m.caja.querySelector("[data-chip]").style.background, "rgb(233, 196, 106)");
  } finally { m.desmontar(); }
});
