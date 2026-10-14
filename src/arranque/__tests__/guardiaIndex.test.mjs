import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import {
  CLAVE, CLAVE_VECES, PARAMETRO, VENTANA_MS, MAX_RECARGAS, MENSAJE, BOTON, instalarRecargaTrasDespliegue,
} from "../recargaTrasDespliegue.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL GUARDIA DE index.html (Levi, auditoría del #43, punto 4).
 *
 * Cubre lo que el módulo no puede: que falle el archivo principal mismo.
 *
 *   ·  falla el main (o su CSS): recarga con ?recarga=, una vez, sin tocar la ruta
 *   ·  varios fallos de la misma carga: una sola recarga
 *   ·  comparte claves y tope con el módulo: si no puede recargar, aviso con «Recargar»
 *   ·  si el main ya arrancó, se aparta
 *   ·  nada fuera de /assets/ lo despierta
 *   ·  sus claves, límites y textos son, letra por letra, los del módulo
 *
 * El script se saca del index.html de verdad y se corre con una ventana de
 * mentira: jsdom no deja sustituir `location`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HTML = readFileSync(new URL("../../../index.html", import.meta.url), "utf8");
const CODIGO = HTML.match(/<script data-guardia-arranque>([\s\S]*?)<\/script>/)[1];

function memoria() {
  const d = new Map();
  return { getItem: (k) => (d.has(k) ? d.get(k) : null), setItem: (k, v) => d.set(k, String(v)), datos: d };
}

/* Una carga del index.html: corre el guardia con lo que se le pase. */
function cargar({ href = "https://aprendefae.com/#/contabilidad", almacen = memoria(), ahora = 1_900_000_000_000, arranco = false } = {}) {
  const dom = new JSDOM("<!doctype html><html><head></head><body><div id=\"root\"></div></body></html>", { url: href, virtualConsole: new VirtualConsole() });
  const oyentes = [];
  const recargas = [];
  const ventana = { __aprendefaeArranco: arranco };
  const location = { get href() { return href; }, replace: (d) => recargas.push(d) };
  const reloj = { now: () => ahora };
  new Function("window", "document", "location", "sessionStorage", "addEventListener", "URL", "Date", CODIGO)(
    ventana, dom.window.document, location, almacen,
    (tipo, fn, captura) => oyentes.push({ tipo, fn, captura }), URL, reloj,
  );
  const fallaArchivo = (tagName, url) => {
    for (const o of oyentes) if (o.tipo === "error") o.fn({ target: tagName === "SCRIPT" ? { tagName, src: url } : { tagName, href: url } });
  };
  return { dom, oyentes, recargas, ventana, almacen, fallaArchivo, aviso: () => dom.window.document.querySelectorAll("[data-aviso-carga]") };
}

test("el guardia va en el head, antes que cualquier otro script, y escucha en captura", () => {
  const cabeza = HTML.slice(0, HTML.indexOf("</head>"));
  assert.ok(cabeza.includes("data-guardia-arranque"));
  const primerScript = HTML.indexOf("<script");
  assert.equal(primerScript, HTML.indexOf("<script data-guardia-arranque>"));
  const c = cargar();
  assert.equal(c.oyentes.length, 1);
  assert.equal(c.oyentes[0].captura, true, "los errores de carga no burbujean: solo se ven en captura");
});

test("falla el main: recarga una vez, sin caché, conservando la ruta", () => {
  const c = cargar();
  c.fallaArchivo("SCRIPT", "https://aprendefae.com/assets/main-B1CbYu6c.js");
  assert.equal(c.recargas.length, 1);
  const u = new URL(c.recargas[0]);
  assert.equal(u.searchParams.get(PARAMETRO), "1900000000000");
  assert.equal(u.hash, "#/contabilidad");
  assert.equal(c.almacen.getItem(CLAVE_VECES), "1");
  assert.equal(c.almacen.getItem(CLAVE), "1900000000000");
  assert.equal(c.aviso().length, 0);
});

test("varios fallos de la misma carga (el main y su CSS): una sola recarga", () => {
  const c = cargar();
  c.fallaArchivo("LINK", "https://aprendefae.com/assets/main-B1CbYu6c.css");
  c.fallaArchivo("SCRIPT", "https://aprendefae.com/assets/main-B1CbYu6c.js");
  c.fallaArchivo("LINK", "https://aprendefae.com/assets/vendor-x.js");
  assert.equal(c.recargas.length, 1);
  assert.equal(c.almacen.getItem(CLAVE_VECES), "1");
  assert.equal(c.aviso().length, 0);
});

test("comparte el tope con el módulo: recién recargado, o ya con dos, aviso con «Recargar» (que sí recarga)", () => {
  for (const previo of [
    { [CLAVE]: String(1_900_000_000_000 - 3_000), [CLAVE_VECES]: "1" },
    { [CLAVE]: String(1_900_000_000_000 - 3_600_000), [CLAVE_VECES]: String(MAX_RECARGAS) },
    { [CLAVE]: "1", [CLAVE_VECES]: "dañada" },
  ]) {
    const almacen = memoria();
    for (const [k, v] of Object.entries(previo)) almacen.setItem(k, v);
    const c = cargar({ almacen });
    c.fallaArchivo("SCRIPT", "https://aprendefae.com/assets/main-x.js");
    assert.equal(c.recargas.length, 0, JSON.stringify(previo));
    const caja = c.aviso();
    assert.equal(caja.length, 1);
    assert.equal(caja[0].getAttribute("role"), "alert");
    assert.equal(caja[0].querySelector("span").textContent, MENSAJE);
    const boton = caja[0].querySelector("button");
    assert.equal(boton.textContent, BOTON);
    boton.click();
    assert.equal(c.recargas.length, 1, "el botón recarga");
    assert.ok(new URL(c.recargas[0]).searchParams.has(PARAMETRO));
  }
});

test("una marca vieja (otro despliegue) sí recarga", () => {
  const almacen = memoria();
  almacen.setItem(CLAVE, String(1_900_000_000_000 - 2 * 3_600_000));
  almacen.setItem(CLAVE_VECES, "1");
  const c = cargar({ almacen });
  c.fallaArchivo("SCRIPT", "https://aprendefae.com/assets/main-x.js");
  assert.equal(c.recargas.length, 1);
  assert.equal(almacen.getItem(CLAVE_VECES), "2");
});

test("sin sessionStorage: aviso, nunca recarga sola", () => {
  const roto = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); } };
  const c = cargar({ almacen: roto });
  c.fallaArchivo("SCRIPT", "https://aprendefae.com/assets/main-x.js");
  assert.equal(c.recargas.length, 0);
  assert.equal(c.aviso().length, 1);
});

test("si el main ya arrancó, se aparta; y nada fuera de /assets/ lo despierta", () => {
  const arrancado = cargar({ arranco: true });
  arrancado.fallaArchivo("LINK", "https://aprendefae.com/assets/PoliticaMonetariaView-x.css");
  assert.equal(arrancado.recargas.length, 0);
  assert.equal(arrancado.aviso().length, 0);

  const c = cargar();
  c.fallaArchivo("LINK", "https://aprendefae.com/favicon-32.png");
  c.fallaArchivo("SCRIPT", "https://accounts.google.com/gsi/client");
  c.fallaArchivo("IMG", "https://aprendefae.com/assets/foto.png");
  for (const o of c.oyentes) o.fn({ target: null });
  assert.equal(c.recargas.length, 0);
  assert.equal(c.aviso().length, 0);
});

test("el módulo marca que el main arrancó, y SOLO DESPUÉS de estar escuchando (Levi)", () => {
  /*
   * El orden, no solo que la marca exista. Si la marca va antes del oyente,
   * hay un instante en que el guardia de index.html ya se apartó y este aún
   * no escucha. La ventana de mentira anota cada paso; al poner la marca, el
   * oyente de vite:preloadError tiene que estar ya registrado.
   */
  const dom = new JSDOM("<!doctype html><body></body>", { url: "https://aprendefae.com/", virtualConsole: new VirtualConsole() });
  const pasos = [];
  const oyentes = new Map();
  const win = {
    addEventListener: (tipo, fn) => { pasos.push(`escucha ${tipo}`); oyentes.set(tipo, fn); },
    location: { href: "https://aprendefae.com/" }, history: null, document: dom.window.document,
  };
  let marca;
  Object.defineProperty(win, "__aprendefaeArranco", {
    get: () => marca,
    set: (v) => { pasos.push(`marca ${v}`); marca = v; assert.ok(oyentes.has("vite:preloadError"), "la marca se puso antes de registrar el oyente: queda un instante sin ningún guardia"); },
  });
  instalarRecargaTrasDespliegue(win);
  assert.equal(win.__aprendefaeArranco, true);
  assert.deepEqual(pasos, ["escucha vite:preloadError", "marca true"]);
});

/*
 * LO QUE ESTA PRUEBA NO VE. Compara la PRIMERA línea `var NOMBRE = …;` del
 * guardia con la constante del módulo. Si alguien escribe un texto directo en
 * el código del aviso (por ejemplo, `boton.textContent = "Recargar"` sin pasar
 * por la variable) o añade una segunda definición más abajo, esta prueba sigue
 * en verde. Los textos del guardia tienen que vivir SOLO en esas variables.
 */
test("las claves, los límites y los textos del guardia son los del módulo, letra por letra", () => {
  const valor = (nombre) => {
    const m = CODIGO.match(new RegExp(`var ${nombre} = ([^;]+);`));
    assert.ok(m, `falta ${nombre} en el guardia`);
    return JSON.parse(m[1]);
  };
  assert.equal(valor("CLAVE"), CLAVE);
  assert.equal(valor("CLAVE_VECES"), CLAVE_VECES);
  assert.equal(valor("PARAMETRO"), PARAMETRO);
  assert.equal(valor("VENTANA_MS"), VENTANA_MS);
  assert.equal(valor("MAX_RECARGAS"), MAX_RECARGAS);
  assert.equal(valor("MENSAJE"), MENSAJE);
  assert.equal(valor("BOTON"), BOTON);
});
