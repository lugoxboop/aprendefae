import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTROL DE CUENTA FLOTA, Y LO QUE FLOTA TAPA — no se deja leer a través.
 *
 * La cuenta es position: fixed a propósito (los FP en vivo dentro de una
 * actividad). La Célula C reportó que «Entrar» «tapa el texto al bajar»; al
 * medirlo, lo que fallaba no era que flotara sino que estaba HUECO: el botón
 * de respaldo no pintaba relleno y la pastilla de la cuenta, un 6 % de blanco.
 * El texto de debajo se leía a través, y los dos se estorbaban.
 *
 * Esta prueba fija las dos mitades de la decisión:
 *   · se queda fijo (si alguien lo suelta del scroll, que sea otra decisión), y
 *   · cada pieza que flota pinta un fondo casi opaco.
 *
 * Se mide el relleno puesto, no la pantalla: el navegador de pruebas no
 * compone. «Casi opaco» es alfa ≥ 0.9; el 0.97 de hoy deja pasar el
 * desenfoque sin que el texto de debajo se lea (al 0.94 aún se adivinaba
 * un fantasma de la palabra que pasaba por debajo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w),
  localStorage: w.localStorage,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.requestAnimationFrame = (fn) => w.setTimeout(() => fn(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => w.clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { NavigationContext } = await import("../../../navigation.js");
const { default: AccountControl, FONDO_FLOTANTE } = await import("../AccountControl.jsx");
const { _olvidarAcceso } = await import("../../../docente/useAccesoDocente.js");

const USUARIO = "uid-de-prueba";
const PERFIL = {
  nickname: "Mateo", points: 815, streak: 4,
  last_activity_day: new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10),
  cristales_balance: 0, avatar_shape: "decaedro", avatar_palette: "marea",
  avatar_level: 1, avatar_unlocked_levels: [1],
};

/*
 * `sincrono`: montar sin dejar correr la microtarea. El atajo del docente sale
 * «recordado» mientras el servidor no ha contestado (pendiente), y esa
 * respuesta —en las pruebas, un cerrado— lo quitaría un instante después.
 */
async function montar({ conSesion, sincrono = false }) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const auth = {
    disponible: true, cargando: false,
    perfil: conSesion ? PERFIL : null,
    session: conSesion ? { user: { id: USUARIO } } : null,
    cerrarSesion: () => {}, pedirCuenta: () => {},
  };
  const arbol = React.createElement(AuthContext.Provider, { value: auth },
    React.createElement(NavigationContext.Provider, { value: {} },
      React.createElement(AccountControl, { conTitulo: false })));
  const desmontar = () => { act(() => raiz.unmount()); caja.remove(); };
  if (sincrono) {
    act(() => raiz.render(arbol));
    return { caja, desmontar };
  }
  await act(async () => { raiz.render(arbol); });
  return { caja, desmontar };
}

/* El alfa de un color CSS tal como lo guarda el estilo. «transparent» y vacío = 0. */
function alfa(color) {
  const c = String(color || "").trim();
  if (!c || c === "transparent") return 0;
  const m = c.match(/^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/);
  if (m) return Number(m[1]);
  return 1; /* rgb(), #hex, nombre: sin canal alfa = opaco */
}
const ALFA_MINIMO = 0.9;

test("la constante del fondo flotante es casi opaca", () => {
  assert.ok(alfa(FONDO_FLOTANTE) >= ALFA_MINIMO, `FONDO_FLOTANTE=${FONDO_FLOTANTE}`);
});

test("sin sesión: el contenedor sigue fijo, y el botón de respaldo «Entrar» tapa lo de debajo", async () => {
  const m = await montar({ conSesion: false });
  try {
    const envoltorio = m.caja.firstElementChild;
    assert.equal(envoltorio.style.position, "fixed", "se queda fijo: es deliberado");

    const boton = [...m.caja.querySelectorAll("button")].find((b) => /Entrar|Continuar con Google/.test(b.textContent));
    assert.ok(boton, "sin la librería de Google sale el botón de respaldo");
    assert.ok(
      alfa(boton.style.background) >= ALFA_MINIMO,
      `el botón de respaldo pinta «${boton.style.background}»: el texto que pasa por debajo se lee a través`,
    );
  } finally { m.desmontar(); }
});

test("con sesión: la pastilla de la cuenta tapa lo de debajo", async () => {
  const m = await montar({ conSesion: true });
  try {
    assert.equal(m.caja.firstElementChild.style.position, "fixed", "se queda fijo: los FP en vivo");
    const p = m.caja.querySelector(".fae-cuenta-boton");
    assert.ok(p, "la pastilla está");
    assert.ok(
      alfa(p.style.background) >= ALFA_MINIMO,
      `la pastilla pinta «${p.style.background}»: el texto que pasa por debajo se lee a través`,
    );
  } finally { m.desmontar(); }
});

test("con sesión de docente: la pastilla «Panel docente» tapa lo de debajo", async () => {
  /* Las pruebas de antes ya le preguntaron al servidor y guardaron «no es docente». */
  _olvidarAcceso();
  localStorage.setItem("fae:docente", USUARIO);
  const m = await montar({ conSesion: true, sincrono: true });
  try {
    const atajo = m.caja.querySelector(".fae-atajo-pastilla");
    assert.ok(atajo, "el atajo del docente sale (recordado de otra visita)");
    const visible = atajo.querySelector("span");
    assert.ok(
      alfa(visible.style.backgroundColor) >= ALFA_MINIMO,
      `la pastilla docente pinta «${visible.style.backgroundColor}»`,
    );
  } finally {
    m.desmontar();
    localStorage.removeItem("fae:docente");
  }
});
