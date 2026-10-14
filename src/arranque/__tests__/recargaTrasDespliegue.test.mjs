import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import {
  CLAVE, CLAVE_VECES, PARAMETRO, MENSAJE, BOTON, VENTANA_MS, MAX_RECARGAS, alFallarLaCarga, reciente, recargasHechas, direccionLimpia, direccionSinCache, instalarRecargaTrasDespliegue,
} from "../recargaTrasDespliegue.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA EN BLANCO TRAS UN DESPLIEGUE (pedido de Erwin).
 *
 *   ·  1.er fallo de un import: recarga UNA vez, con una dirección nueva
 *   ·  otro fallo POCO después de recargar: NO recarga; muestra el aviso
 *   ·  otro fallo HORAS después (otro despliegue, misma pestaña): recarga otra vez
 *   ·  …hasta MAX_RECARGAS por sesión; el trozo que falla siempre no da bucle
 *   ·  varios eventos de una misma navegación: una sola recarga, sin aviso
 *   ·  el aviso trae «Recargar», que recarga siempre (lo toca el estudiante)
 *   ·  sin sessionStorage: aviso, nunca recarga sola (no hay cómo frenar un bucle)
 *   ·  el parámetro de la recarga se quita al volver a arrancar
 *
 * El import que falla se simula como lo hace Vite (dist, preload helper):
 * dispara `vite:preloadError` cancelable y, si nadie lo cancela, relanza el
 * error. La página de prueba es un jsdom; `location` se sustituye porque jsdom
 * no navega.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Una pestaña: un documento nuevo, con el sessionStorage que se le pase (el de la sesión). */
function pestana(href, sesion) {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: href, virtualConsole: new VirtualConsole() });
  const w = dom.window;
  const recargas = [];
  const historial = [];
  const win = {
    addEventListener: w.addEventListener.bind(w),
    dispatchEvent: w.dispatchEvent.bind(w),
    Event: w.Event,
    document: w.document,
    sessionStorage: sesion ?? w.sessionStorage,
    location: { href, replace(d) { recargas.push(d); } },
    history: { state: null, replaceState(_s, _t, d) { historial.push(d); win.location.href = d; } },
  };
  return { win, recargas, historial };
}

/* Lo que hace el preload de Vite con un import que falla. */
async function importar(win, falla = true) {
  const error = new TypeError("Failed to fetch dynamically imported module: https://aprendefae.com/assets/PoliticaMonetariaView-Cq862mqH.js");
  try {
    if (falla) throw error;
    return { default: "vista" };
  } catch (err) {
    const e = new win.Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    win.dispatchEvent(e);
    if (!e.defaultPrevented) throw err;
    return undefined;
  }
}

const aviso = (win) => win.document.querySelectorAll("[data-aviso-carga]");

test("el 1.er fallo recarga una sola vez, con una dirección que no puede salir de la caché", async () => {
  const { win, recargas } = pestana("https://aprendefae.com/#/macro/monetaria");
  instalarRecargaTrasDespliegue(win);
  await importar(win); /* cancelado: no relanza */
  assert.equal(recargas.length, 1);
  const u = new URL(recargas[0]);
  assert.ok(u.searchParams.get(PARAMETRO), "lleva el parámetro nuevo");
  assert.equal(u.hash, "#/macro/monetaria", "conserva la ruta");
  assert.equal(u.pathname, "/");
  assert.ok(win.sessionStorage.getItem(CLAVE), "queda la marca del intento");
  assert.equal(aviso(win).length, 0, "la 1.ª vez no hay aviso");
});

test("el 2.º fallo en la sesión NO recarga: muestra el aviso y deja pasar el error", async () => {
  /* 1.ª pestaña: falla y recarga. */
  const primera = pestana("https://aprendefae.com/#/macro/monetaria");
  instalarRecargaTrasDespliegue(primera.win);
  await importar(primera.win);
  assert.equal(primera.recargas.length, 1);

  /* La recarga: misma sesión, la dirección con el parámetro. El trozo sigue faltando. */
  const segunda = pestana(primera.recargas[0], primera.win.sessionStorage);
  instalarRecargaTrasDespliegue(segunda.win);
  assert.equal(new URL(segunda.win.location.href).searchParams.has(PARAMETRO), false, "al arrancar, la dirección queda limpia");
  assert.equal(new URL(segunda.win.location.href).hash, "#/macro/monetaria");

  await assert.rejects(importar(segunda.win), /Failed to fetch dynamically imported module/);
  assert.equal(segunda.recargas.length, 0, "no recarga: no hay bucle");
  const caja = aviso(segunda.win);
  assert.equal(caja.length, 1);
  assert.equal(caja[0].querySelector("span").textContent, MENSAJE);
  assert.equal(caja[0].querySelector("button").textContent, BOTON);
  assert.equal(caja[0].getAttribute("role"), "alert");

  /* Un 3.er fallo no recarga ni duplica el aviso. */
  await assert.rejects(importar(segunda.win));
  assert.equal(segunda.recargas.length, 0);
  assert.equal(aviso(segunda.win).length, 1);
});

test("dos despliegues con la misma pestaña abierta: recarga en los dos (Erwin)", async () => {
  /* 7:00 · primer despliegue: falla, recarga, se arregla. */
  const siete = pestana("https://aprendefae.com/#/contabilidad/tema-3");
  instalarRecargaTrasDespliegue(siete.win);
  await importar(siete.win);
  assert.equal(siete.recargas.length, 1);
  const sesion = siete.win.sessionStorage;

  /* La pestaña sigue abierta. 9:00 · segundo despliegue: la marca es de hace dos horas. */
  sesion.setItem(CLAVE, String(Date.now() - 2 * 60 * 60 * 1000));
  const nueve = pestana("https://aprendefae.com/#/contabilidad/tema-3", sesion);
  instalarRecargaTrasDespliegue(nueve.win);
  await importar(nueve.win); /* cancelado otra vez */
  assert.equal(nueve.recargas.length, 1, "la marca vieja no silencia la recarga");
  assert.equal(aviso(nueve.win).length, 0, "no le dice que revise una conexión que está bien");
  assert.ok(Date.now() - Number(sesion.getItem(CLAVE)) < 1000, "la marca se renueva");

  /* Y si tras ESA recarga vuelve a fallar enseguida, ahí sí: aviso, sin bucle. */
  const despues = pestana(nueve.recargas[0], sesion);
  instalarRecargaTrasDespliegue(despues.win);
  await assert.rejects(importar(despues.win));
  assert.equal(despues.recargas.length, 0);
  assert.equal(aviso(despues.win).length, 1);
});

test("la ventana: dentro es un bucle (aviso), fuera es un despliegue nuevo (recarga)", () => {
  const T = 1_800_000_000_000;
  const caso = (marca, ahora) => {
    const datos = new Map(marca === undefined ? [] : [[CLAVE, marca]]);
    const almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) };
    return alFallarLaCarga(null, { almacen, href: "https://aprendefae.com/", recargar() {}, avisar() {}, ahora });
  };
  assert.equal(caso(undefined, T), "recarga", "sin marca");
  assert.equal(caso(String(T), T + 3_000), "aviso", "3 s después: bucle");
  assert.equal(caso(String(T), T + VENTANA_MS - 1), "aviso", "justo dentro");
  assert.equal(caso(String(T), T + VENTANA_MS), "recarga", "justo fuera");
  assert.equal(caso(String(T), T + 2 * 60 * 60 * 1000), "recarga", "dos horas: otro despliegue");
  assert.equal(caso("dañada", T), "recarga", "marca que no es una hora");
  assert.equal(caso("", T), "recarga");
  assert.equal(caso(String(T + 10_000), T), "aviso", "reloj atrasado unos segundos: sigue siendo reciente");
  assert.equal(caso(String(T + 2 * 60 * 60 * 1000), T), "recarga", "reloj atrasado horas: vieja");
  assert.equal(VENTANA_MS, 30 * 1000, "30 s, de Levi");
  assert.equal(MAX_RECARGAS, 2, "dos por sesión, de Levi");
  assert.equal(reciente(null, T), false);
});

test("varios eventos de la misma navegación (el JS y el CSS del trozo): una recarga, sin aviso (Levi)", async () => {
  const { win, recargas } = pestana("https://aprendefae.com/#/macro/monetaria");
  instalarRecargaTrasDespliegue(win);
  await importar(win);
  await importar(win); /* el segundo llega antes de que termine la navegación */
  await importar(win);
  assert.equal(recargas.length, 1);
  assert.equal(aviso(win).length, 0, "no le pinta «no pudimos cargar» mientras se arregla");
  assert.equal(win.sessionStorage.getItem(CLAVE_VECES), "1", "cuenta una recarga, no tres");
});

test("el trozo de la ruta inicial falla SIEMPRE: como mucho MAX_RECARGAS y después aviso, rápido o lento (Levi)", async () => {
  /* Cada vuelta es una carga de la página; entre una y otra pasa `entre` ms. */
  for (const entre of [500, 2_000, VENTANA_MS + 15_000, 10 * 60 * 1000]) {
    const sesion = pestana("https://aprendefae.com/").win.sessionStorage;
    let href = "https://aprendefae.com/#/ingresos-gastos-y-caja/hacer";
    let t = 1_800_000_000_000;
    let recargasTotales = 0;
    let ultima = null;
    for (let carga = 0; carga < 10; carga++) {
      const tab = pestana(href, sesion);
      instalarRecargaTrasDespliegue(tab.win, { reloj: () => t });
      try { await importar(tab.win); } catch { /* el error sigue su curso: aviso */ }
      ultima = tab;
      if (!tab.recargas.length) break;
      recargasTotales += tab.recargas.length;
      href = tab.recargas[0];
      t += entre;
    }
    assert.ok(recargasTotales <= MAX_RECARGAS, `cada ${entre} ms: ${recargasTotales} recargas`);
    assert.ok(recargasTotales >= 1);
    assert.equal(aviso(ultima.win).length, 1, `cada ${entre} ms: termina en aviso`);
  }
});

test("el tope: tras MAX_RECARGAS despliegues en la sesión, el siguiente es aviso con botón", () => {
  const datos = new Map();
  const almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) };
  const r = [];
  const op = (ahora) => ({ almacen, href: "https://aprendefae.com/", recargar: (d) => r.push(d), avisar: () => r.push("aviso"), ahora });
  const H = 60 * 60 * 1000;
  assert.equal(alFallarLaCarga(null, op(0 * H)), "recarga");
  assert.equal(alFallarLaCarga(null, op(2 * H)), "recarga");
  assert.equal(alFallarLaCarga(null, op(4 * H)), "aviso");
  assert.equal(datos.get(CLAVE_VECES), String(MAX_RECARGAS));
  /* Una cuenta dañada cuenta como el tope: ante la duda, no recargar sola. */
  assert.equal(recargasHechas("x"), MAX_RECARGAS);
  assert.equal(recargasHechas("-1"), MAX_RECARGAS);
  assert.equal(recargasHechas("1.5"), MAX_RECARGAS);
  assert.equal(recargasHechas(null), 0);
  assert.equal(recargasHechas("1"), 1);
});

test("«Recargar» en el aviso: recarga sin caché y conserva la ruta, aunque se haya llegado al tope o no haya sessionStorage (Levi)", async () => {
  for (const almacen of [null, { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } }]) {
    const base = pestana("https://aprendefae.com/");
    const sesion = almacen ?? base.win.sessionStorage;
    if (!almacen) { sesion.setItem(CLAVE, "1"); sesion.setItem(CLAVE_VECES, String(MAX_RECARGAS)); }
    const { win, recargas } = pestana("https://aprendefae.com/#/contabilidad", sesion);
    instalarRecargaTrasDespliegue(win, { reloj: () => 1_900_000_000_000 });
    await assert.rejects(importar(win));
    assert.equal(recargas.length, 0, "no recarga sola");
    const boton = aviso(win)[0].querySelector("button");
    assert.equal(boton.textContent, BOTON);
    assert.equal(boton.type, "button");
    boton.click();
    assert.equal(recargas.length, 1, "el botón sí recarga");
    const u = new URL(recargas[0]);
    assert.equal(u.searchParams.get(PARAMETRO), "1900000000000");
    assert.equal(u.hash, "#/contabilidad");
    if (!almacen) assert.equal(sesion.getItem(CLAVE_VECES), String(MAX_RECARGAS), "el botón no toca la cuenta");
  }
});

test("si el import funciona, no pasa nada", async () => {
  const { win, recargas } = pestana("https://aprendefae.com/");
  instalarRecargaTrasDespliegue(win);
  assert.deepEqual(await importar(win, false), { default: "vista" });
  assert.equal(recargas.length, 0);
  assert.equal(win.sessionStorage.getItem(CLAVE), null);
  assert.equal(aviso(win).length, 0);
});

test("sin sessionStorage (bloqueado o lleno): aviso, nunca recarga", async () => {
  for (const almacen of [
    { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } },
    { getItem() { return null; }, setItem() { throw new Error("QuotaExceededError"); } },
  ]) {
    const { win, recargas } = pestana("https://aprendefae.com/", almacen);
    instalarRecargaTrasDespliegue(win);
    await assert.rejects(importar(win));
    assert.equal(recargas.length, 0);
    assert.equal(aviso(win).length, 1);
  }
  /* Y si leer el propio sessionStorage lanza (cookies bloqueadas). */
  const { win, recargas } = pestana("https://aprendefae.com/");
  Object.defineProperty(win, "sessionStorage", { get() { throw new Error("SecurityError"); } });
  instalarRecargaTrasDespliegue(win);
  await assert.rejects(importar(win));
  assert.equal(recargas.length, 0);
  assert.equal(aviso(win).length, 1);
});

test("alFallarLaCarga: las dos ramas, sin ventana", () => {
  const datos = new Map();
  const almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) };
  const llamadas = [];
  const opciones = { almacen, href: "https://aprendefae.com/?a=1#/x", recargar: (d) => llamadas.push(["recarga", d]), avisar: () => llamadas.push(["aviso"]), ahora: 1700000000000 };
  let cancelado = 0;
  const evento = { preventDefault: () => { cancelado += 1; } };
  assert.equal(alFallarLaCarga(evento, opciones), "recarga");
  assert.equal(alFallarLaCarga(evento, opciones), "aviso");
  assert.equal(cancelado, 1, "solo se cancela el error cuando se recarga");
  assert.deepEqual(llamadas, [["recarga", "https://aprendefae.com/?a=1&recarga=1700000000000#/x"], ["aviso"]]);
});

test("las direcciones: el parámetro se pone y se quita sin tocar lo demás", () => {
  assert.equal(direccionSinCache("https://aprendefae.com/#/a", 5), "https://aprendefae.com/?recarga=5#/a");
  assert.equal(direccionSinCache("https://aprendefae.com/?recarga=4#/a", 5), "https://aprendefae.com/?recarga=5#/a");
  assert.equal(direccionLimpia("https://aprendefae.com/?recarga=5#/a"), "https://aprendefae.com/#/a");
  assert.equal(direccionLimpia("https://aprendefae.com/?x=1&recarga=5#/a"), "https://aprendefae.com/?x=1#/a");
  assert.equal(direccionLimpia("https://aprendefae.com/#/a"), null);
});

test("el texto del aviso: invita a reintentar sin prometer, y no dice nada de lo prohibido (Gen; Erwin)", () => {
  assert.ok(MENSAJE.includes(`Prueba con el botón ${BOTON}.`), "invita a reintentar con el botón");
  assert.ok(MENSAJE.includes("el fallo es nuestro"));
  for (const prohibida of [/conexi[oó]n/i, /volver a entrar|vuelve a entrar/i, /versi[oó]n/i, /cach[eé]/i, /m[oó]dulo/i, /progreso/i, /guardad/i, /culpa/i, /arregl/i]) {
    assert.doesNotMatch(MENSAJE, prohibida);
  }
});

test("main.jsx lo instala antes de montar React", () => {
  const main = readFileSync(new URL("../../main.jsx", import.meta.url), "utf8");
  const instala = main.indexOf("instalarRecargaTrasDespliegue(window)");
  assert.ok(instala > 0);
  assert.ok(instala < main.indexOf("createRoot("));
});
