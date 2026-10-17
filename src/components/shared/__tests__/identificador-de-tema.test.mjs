import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTRATO DE LA TOMA DE CORRIENTE.
 *
 * Cuatro células van a añadir entradas a este registro sin hablar entre
 * ellas. Lo que no puede pasar es que la entrada de una rompa la tarjeta de
 * otra, o que un tema sin identificador deje su tarjeta sin dibujo.
 *
 * Esto comprueba las tres cosas que prometí en el canon:
 *   · sin entrada → sale el respaldo (el ícono de la materia, lo de hoy);
 *   · con entrada → sale el dibujo del tema;
 *   · el dibujo es decorativo: aria-hidden, porque el nombre accesible ya lo
 *     da el aria-label de la tarjeta y si no, lo diría dos veces.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
for (const [k, v] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const React = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const h = React.createElement;
const { default: IdentificadorDeTema } = await import("../IdentificadorDeTema.jsx");
const { ICONO_POR_TEMA } = await import("../../../data/identificadoresDeTema.js");

const Respaldo = () => h("svg", { "data-respaldo": "si" });
const Propio = () => h("svg", { "data-propio": "si" });

test("★★★ sin identificador, la tarjeta se queda con el de la materia", () => {
  const html = renderToStaticMarkup(h(IdentificadorDeTema, {
    tema: { id: "un-tema-que-nadie-ha-dibujado" }, materia: "contabilidad", respaldo: h(Respaldo),
  }));
  assert.match(html, /data-respaldo/, "un tema sin dibujo propio perdió el de la materia");
  assert.doesNotMatch(html, /data-identificador/, "envolvió el respaldo en vez de devolverlo tal cual");
});

test("★★★ con identificador, sale el del tema, decorativo", () => {
  const clave = "contabilidad/tema-de-prueba";
  ICONO_POR_TEMA[clave] = Propio;
  try {
    const html = renderToStaticMarkup(h(IdentificadorDeTema, {
      tema: { id: "tema-de-prueba" }, materia: "contabilidad", respaldo: h(Respaldo),
    }));
    assert.match(html, /data-propio/, "no salió el dibujo del tema");
    assert.doesNotMatch(html, /data-respaldo/, "salieron los dos a la vez");
    assert.match(html, /aria-hidden="true"/, "el dibujo se anunciaría, y el nombre ya lo da la tarjeta");
  } finally {
    delete ICONO_POR_TEMA[clave];
  }
});

test("★★ la clave lleva la materia: dos materias pueden tener el mismo id de tema", () => {
  const clave = "macro/mismo-id";
  ICONO_POR_TEMA[clave] = Propio;
  try {
    const html = renderToStaticMarkup(h(IdentificadorDeTema, {
      tema: { id: "mismo-id" }, materia: "contabilidad", respaldo: h(Respaldo),
    }));
    assert.match(html, /data-respaldo/, "el identificador de Macro se coló en Contabilidad");
  } finally {
    delete ICONO_POR_TEMA[clave];
  }
});

/* El sistema de Xeno ya existe (kit.md, 16 oct.) y las células registran: la prueba del registro vacío se quitó a conciencia en el lote 16 de B. */
test("★★ cada entrada del registro es un componente con clave «materia/tema»", () => {
  for (const [clave, Dibujo] of Object.entries(ICONO_POR_TEMA)) {
    assert.match(clave, /^[a-z0-9-]+\/[a-z0-9-]+$/, `clave sin «materia/tema»: ${clave}`);
    assert.equal(typeof Dibujo, "function", `${clave}: el registro espera un componente`);
  }
});
