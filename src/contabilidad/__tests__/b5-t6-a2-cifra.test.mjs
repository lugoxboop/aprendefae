/*
 * Lote 17 · b5-t6-a2: la cifra escrita mueve el modelo (P2 de Mai, bloque A).
 * Borrador discontinuo mientras se escribe, nada contra qué alinearlo (R10) y, tras «Comprobar», lo
 * firme es siempre lo correcto. La mesa (CierreConMesa) solo cambió de forma aditiva: sin `lados`,
 * t5-a2 y t6-a3 no llevan la fila nueva (sus pruebas, intactas, siguen pasando).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
for (const [k, v] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
const React = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const h = React.createElement;
const { Eco, BarraNeto, TanqueCifra, escalaBarra, cifraDelEco } = await import("../../components/mecanicas/libros/tema6/CifraQueMueve.jsx");
const { BloqueEstado } = await import("../../components/mecanicas/libros/tema6/CuentaQueSeLlena.jsx");
const { CONFIG_T6_ACT2 } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { BARRA_T6_ACT2, PREGUNTAS_T6_ACT2 } = await import("../../data/contabilidadT6Act2.js");

const html = (el) => renderToStaticMarkup(el);
const pagina = (s) => { const d = document.createElement("div"); d.innerHTML = s; return d; };
const [Q1, Q2, Q3] = PREGUNTAS_T6_ACT2;

test("★★★ la escala de la Barra: la pista acaba en lo que deben los clientes (66,67 %) y el neto en el 41,87 %", () => {
  const x = escalaBarra(BARRA_T6_ACT2);
  assert.equal(BARRA_T6_ACT2.neto, Q1.correcta);
  assert.ok(Math.abs(x(2655000) - 2 / 3) < 1e-9);
  assert.ok(Math.abs(x(2506200) - 0.4187) < 1e-4);
  assert.ok(Math.abs(x(2803800) - 0.9147) < 1e-4);
  assert.equal(x(9e9), 1);
  assert.equal(x(0), 0);
});

test("★★★ el eco: sin dígitos, el hueco; con ellos, la cifra en borrador; comprobado, lo firme", () => {
  assert.equal(cifraDelEco("$31.200"), "$31.200");
  assert.equal(cifraDelEco("31200"), "$31.200");
  assert.equal(cifraDelEco("abc"), null);
  assert.match(html(h(Eco, { texto: "" })), /data-eco="hueco"/);
  const b = pagina(html(h(Eco, { texto: "31200", prefijo: "Le faltan" })));
  assert.equal(b.querySelector("[data-eco]").dataset.eco, "borrador");
  assert.equal(b.textContent, "Le faltan $31.200");
  assert.match(b.innerHTML, /dashed/);
  assert.match(html(h(Eco, { firme: "$2.506.200" })), /data-eco="firme"[^>]*2px solid/);
});

test("★★★ pregunta 1: antes de «Comprobar», la Barra no enseña la provisión ni el neto (R10); el borrador sigue la cifra", () => {
  const antes = pagina(html(h(BloqueEstado, { comprobada: false, texto: "2.655.000" })));
  assert.equal(antes.querySelector("[data-fila-neto] [data-eco]").textContent, "$2.655.000");
  assert.match(antes.querySelector("[data-firme]").getAttribute("style"), /opacity:\s*0/);
  assert.ok(Math.abs(Number(antes.querySelector("[data-borrador]").dataset.borrador) - 2 / 3) < 1e-9);
  assert.equal(antes.querySelector("[data-barra-neto]").getAttribute("aria-hidden"), "true");
  const despues = pagina(html(h(BloqueEstado, { comprobada: true, texto: "2.655.000" })));
  assert.match(despues.querySelector("[data-firme]").getAttribute("style"), /opacity:\s*1/);
  assert.equal(despues.querySelector("[data-fila-neto] [data-eco]").textContent, "$2.506.200", "lo firme es lo correcto, no lo escrito");
});

test("★★★ preguntas 2 y 3: el tanque solo lleva el cero hasta «Comprobar»; el borrador baja o sube con la cifra y topa", () => {
  const borrador = (parte, texto) => Number(pagina(html(h(TanqueCifra, { parte, texto, resultado: null }))).querySelector("[data-borrador]").dataset.borrador);
  assert.equal(Q2.tanque, "faltante");
  assert.equal(Q3.tanque, "nivel");
  assert.ok(Math.abs(borrador(Q2, "31200") - 15.6) < 1e-9);
  assert.equal(borrador(Q2, "0"), 0);
  assert.equal(borrador(Q2, "328800"), 20);
  assert.ok(Math.abs(borrador(Q3, "153400") - 76.7) < 1e-9);
  assert.ok(Math.abs(borrador(Q3, "184600") - 92.3) < 1e-9);
  assert.equal(borrador(Q3, "333400"), 100);
  const antes = pagina(html(h(TanqueCifra, { parte: Q2, texto: "31200", resultado: null })));
  assert.ok(!antes.querySelector("[data-tanque-firme]"));
  assert.ok(!antes.querySelector("[data-linea-analisis]"), "sin la línea de lo estimado: sería el blanco");
  const firme = pagina(html(h(TanqueCifra, { parte: Q3, texto: "184600", resultado: { ok: false } })));
  assert.equal(firme.querySelector("[data-tanque-firme] [data-tanque]").dataset.nivel, "153400");
});

test("★★ la configuración de a2: el tanque, solo como `lados` de las preguntas 2 y 3", () => {
  assert.equal(typeof CONFIG_T6_ACT2.lados.tanque, "function");
  assert.equal(Q1.lado, undefined);
  assert.deepEqual([Q2.lado, Q3.lado], ["tanque", "tanque"]);
});
