import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PASTILLA DE CUENTA Y SU MENÚ.
 *
 * Dos cosas que ahora se ven en TODAS las páginas: los FP en la cabecera y el
 * menú con la ficha de identidad. Se montan de verdad, con el contexto de
 * cuenta puesto a mano, porque lo que puede salir mal —que el nombre se quede
 * en la pastilla, que el punto de la Tienda salga cuando no toca, que el
 * número no se mueva al ganar FP— solo se ve montado.
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
/* Sin esto el conteo animado no tiene reloj: se resuelve al instante. */
globalThis.requestAnimationFrame = (fn) => w.setTimeout(() => fn(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => w.clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { NavigationContext } = await import("../../../navigation.js");
const { default: AccountControl } = await import("../AccountControl.jsx");
const { emitirFP } = await import("../../../fp/aviso.js");
const { claveDe } = await import("../../../tienda/novedades.js");
const { PRECIO_NIVEL } = await import("../../../cristales/cristales.js");

const USUARIO = "uid-de-prueba";

const PERFIL = {
  nickname: "Mateo",
  points: 815,
  streak: 4,
  last_activity_day: new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10),
  cristales_balance: 0,
  avatar_shape: "decaedro",
  avatar_palette: "marea",
  avatar_level: 1,
  avatar_unlocked_levels: [1],
};

function montar({ perfil = PERFIL, navegacion = {}, conTitulo = false } = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const auth = {
    disponible: true, cargando: false, perfil,
    session: { user: { id: USUARIO } },
    cerrarSesion: () => {},
    pedirCuenta: () => {},
  };
  act(() => raiz.render(
    React.createElement(AuthContext.Provider, { value: auth },
      React.createElement(NavigationContext.Provider, { value: navegacion },
        React.createElement(AccountControl, { conTitulo }))),
  ));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const pastilla = (caja) => caja.querySelector(".fae-cuenta-boton");
const abrir = (caja) => act(() => pastilla(caja).dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
const opciones = (caja) => [...caja.querySelectorAll("[data-opcion-menu]")].map((b) => b.textContent.trim());

/* ─────────────────────── Part C: la pastilla ─────────────────────── */

test("la pastilla enseña el avatar y los FP, y ya NO el nombre del estudiante", () => {
  const m = montar();
  try {
    const p = pastilla(m.caja);
    assert.ok(p.querySelector("svg[data-avatar]"), "el avatar del estudiante va en la pastilla");
    assert.equal(p.querySelector("[data-fp-pastilla]").textContent.trim(), "815 FP");
    /*
     * El nombre se fue al encabezado del menú. Si volviera aquí, la pastilla
     * dejaría de caber en la cabecera del teléfono, que es de donde salió.
     */
    assert.ok(!p.textContent.includes("Mateo"), "el nombre ya no se pinta en la pastilla");
    /* Pero sigue anunciado para quien no ve la pantalla. */
    assert.match(p.getAttribute("aria-label"), /Mateo/);
    assert.match(p.getAttribute("aria-label"), /815 FP/);
  } finally { m.desmontar(); }
});

test("el número lleva punto de miles", () => {
  const m = montar({ perfil: { ...PERFIL, points: 12500 } });
  try {
    assert.equal(pastilla(m.caja).querySelector("[data-fp-pastilla]").textContent.trim(), "12.500 FP");
  } finally { m.desmontar(); }
});

test("al ganar FP el número sube, y termina EXACTO en el total nuevo", async () => {
  const m = montar();
  try {
    const leer = () => Number(pastilla(m.caja).querySelector("[data-fp-pastilla]").textContent.replace(/[^\d]/g, ""));
    assert.equal(leer(), 815);

    /* Lo que emite otorgarFP DESPUÉS de que el servidor confirmó. */
    await act(async () => { emitirFP({ fp: 50, repetida: false, actividadId: "x", materiaId: "y" }); });

    /* Se deja correr el reloj del conteo y se mira dónde acaba. */
    await act(async () => { await new Promise((r) => w.setTimeout(r, 1200)); });
    assert.equal(leer(), 865, "815 + 50, sin quedarse corto ni pasarse");
  } finally { m.desmontar(); }
});

test("repetir una actividad paga 0 y el contador no se mueve", async () => {
  const m = montar();
  try {
    const leer = () => pastilla(m.caja).querySelector("[data-fp-pastilla]").textContent.trim();
    await act(async () => { emitirFP({ fp: 0, repetida: true, actividadId: "x", materiaId: "y" }); });
    await act(async () => { await new Promise((r) => w.setTimeout(r, 200)); });
    assert.equal(leer(), "815 FP");
  } finally { m.desmontar(); }
});

/* ─────────────────────── Part B: el menú ─────────────────────── */

test("el menú trae la ficha de identidad y las cuatro opciones, en orden", () => {
  const m = montar();
  try {
    abrir(m.caja);
    const ficha = m.caja.querySelector("[data-ficha-cuenta]");
    assert.ok(ficha, "la ficha de identidad encabeza el menú");
    assert.ok(ficha.querySelector("svg[data-avatar]"), "con el avatar");
    assert.match(ficha.textContent, /Mateo/, "y el nombre, que salió de la pastilla");
    assert.match(ficha.textContent, /815 FP/);
    assert.match(ficha.textContent, /0/, "los Cristales");
    assert.match(ficha.textContent, /d[ií]as?/, "y la racha");

    assert.deepEqual(opciones(m.caja), ["Mi perfil", "Mi avatar", "Tienda", "Cerrar sesión"]);
  } finally { m.desmontar(); }
});

test("«Mi avatar» va directo al avatar, no al formulario entero", () => {
  const visitas = [];
  const m = montar({ navegacion: { irA: (v, modo, extra) => visitas.push([v, modo, extra]), irAPerfil: () => visitas.push(["perfil-normal"]) } });
  try {
    abrir(m.caja);
    const mi = [...m.caja.querySelectorAll("[data-opcion-menu]")].find((b) => b.textContent.trim() === "Mi avatar");
    act(() => mi.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
    assert.deepEqual(visitas, [["perfil", null, "avatar"]], "#/perfil/avatar, que es lo que abre solo el selector");
  } finally { m.desmontar(); }
});

/* ─────────────────────── el punto ámbar ─────────────────────── */

const limpiar = () => { try { w.localStorage.removeItem(claveDe(USUARIO)); } catch { /* da igual */ } };
const hayPunto = (caja) => Boolean(caja.querySelector("[data-punto-tienda]"));

test("sin Cristales para nada, la Tienda no lleva punto", () => {
  limpiar();
  const m = montar({ perfil: { ...PERFIL, cristales_balance: PRECIO_NIVEL[2] - 1 } });
  try {
    abrir(m.caja);
    assert.equal(hayPunto(m.caja), false, "no puede pagar ningún nivel todavía");
  } finally { m.desmontar(); }
});

test("en cuanto alcanza un nivel sin comprar, aparece el punto", () => {
  limpiar();
  const m = montar({ perfil: { ...PERFIL, cristales_balance: PRECIO_NIVEL[2] } });
  try {
    abrir(m.caja);
    assert.equal(hayPunto(m.caja), true);
    /* Y no va solo: lleva su texto para quien no ve el color. */
    assert.match(m.caja.textContent, /ya puedes comprar/i);
  } finally { m.desmontar(); }
});

test("después de entrar a la Tienda, el punto se apaga", () => {
  limpiar();
  /* Lo que deja escrito marcarVisitada() al entrar: el II quedó visto. */
  w.localStorage.setItem(claveDe(USUARIO), JSON.stringify([2]));
  const m = montar({ perfil: { ...PERFIL, cristales_balance: PRECIO_NIVEL[2] } });
  try {
    abrir(m.caja);
    assert.equal(hayPunto(m.caja), false);
  } finally { m.desmontar(); limpiar(); }
});

test("y vuelve el día que alcanza uno que todavía no había visto", () => {
  limpiar();
  w.localStorage.setItem(claveDe(USUARIO), JSON.stringify([2]));
  const m = montar({ perfil: { ...PERFIL, cristales_balance: PRECIO_NIVEL[3] } });
  try {
    abrir(m.caja);
    assert.equal(hayPunto(m.caja), true, "el III es nuevo");
  } finally { m.desmontar(); limpiar(); }
});

/* ─────────────────────── el header compacto ─────────────────────── */

test("en una vista CON título la pastilla se compacta; en las demás, no", () => {
  const conTitulo = montar({ navegacion: {}, conTitulo: true });
  try {
    const p = pastilla(conTitulo.caja);
    assert.match(p.className, /fae-cuenta-compacta/);
    /* El avatar sigue en el DOM —lo esconde el CSS, que jsdom no aplica— pero
     * envuelto en la clase que la hoja puede apagar. Sin la envoltura, el
     * `display:block` inline de Avatar ganaría y no habría forma de esconderlo. */
    assert.ok(p.querySelector(".fae-cuenta-avatar"), "el avatar va envuelto para poder esconderlo");
    /* Y el número nunca se va: es lo único que no cede en ningún ancho. */
    assert.match(p.querySelector("[data-fp-pastilla]").textContent, /815/);
  } finally { conTitulo.desmontar(); }

  const sinTitulo = montar();
  try {
    assert.ok(!/fae-cuenta-compacta/.test(pastilla(sinTitulo.caja).className));
  } finally { sinTitulo.desmontar(); }
});

test("la pastilla compacta sigue abriendo el mismo menú", () => {
  const m = montar({ conTitulo: true });
  try {
    abrir(m.caja);
    assert.ok(m.caja.querySelector("[data-ficha-cuenta]"), "la ficha de identidad, igual que en la completa");
    assert.deepEqual(opciones(m.caja), ["Mi perfil", "Mi avatar", "Tienda", "Cerrar sesión"]);
  } finally { m.desmontar(); }
});

/*
 * ═══════════ LA INSIGNIA NO PUEDE VOLVER A LA CABECERA ═══════════
 *
 * Se mira el código fuente y no el render, porque son nueve vistas y montarlas
 * todas pediría el árbol entero de cada tema. Lo que se comprueba es lo que de
 * verdad se rompería: que alguien vuelva a meter un ActivityBadge dentro de la
 * fila de cabecera, que es de donde salió por comerse el título.
 */
test("ninguna cabecera con título lleva la insignia dentro", async () => {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const raiz = new URL("../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

  const archivos = [];
  const recorrer = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== "__tests__") recorrer(p); }
      else if (f.endsWith(".jsx")) archivos.push(p);
    }
  };
  recorrer(raiz);

  const conCabecera = archivos.filter((p) => readFileSync(p, "utf8").includes("fae-cabecera-titulo"));
  assert.ok(conCabecera.length >= 9, `solo ${conCabecera.length} vistas con cabecera de título; se esperaban al menos 9`);

  const culpables = [];
  for (const p of conCabecera) {
    const texto = readFileSync(p, "utf8");
    const ini = texto.indexOf("fae-cabecera-titulo");
    /* Desde la clase hasta el cierre de esa fila: el primer </div> a su nivel. */
    const trozo = texto.slice(ini, ini + texto.slice(ini).search(/\n\s*<\/div>/) + 1);
    if (trozo.includes("<ActivityBadge")) culpables.push(p.split(/[\/]/).pop());
  }
  assert.deepEqual(culpables, [], "la insignia es metadato de contenido, no de cabecera");
});
