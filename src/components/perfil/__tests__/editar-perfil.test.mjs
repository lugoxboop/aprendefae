/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EDITAR PERFIL — el panel, su única validación y su guardado.
 *
 *   · abre con los valores actuales;
 *   · solo exige que no haya campos vacíos (ni largo, ni unicidad, ni nada);
 *   · guarda lo que las secciones declaran, sin espacios en los extremos, y
 *     avisa al volver; si la base lo rechaza, lo dice y no vuelve;
 *   · al guardado nunca llega una columna fuera de la lista blanca;
 *   · y una sección nueva —el avatar de mañana— entra sin tocar el panel.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: EditarPerfil, SECCIONES, borradorDe, sePuedeGuardar, cambioDe } = await import("../EditarPerfil.jsx");
const { CAMPOS_EDITABLES, cambioPermitido, mensajeDeErrorPerfil } = await import("../../../auth/perfilEditable.js");

function montar(props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(EditarPerfil, props)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const escribir = (input, valor) => act(() => {
  Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, valor);
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
});
const guardarBtn = (caja) => [...caja.querySelectorAll("button")].find((b) => b.type === "submit");
const pulsar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

test("abre con los valores actuales; un nombre que nunca se escribió abre vacío", () => {
  const m = montar({ perfil: { nickname: "Cami", full_name: null }, guardar: async () => ({}) });
  try {
    assert.equal(m.caja.querySelector("#editar-apodo").value, "Cami");
    assert.equal(m.caja.querySelector("#editar-nombre").value, "");
    assert.ok(guardarBtn(m.caja).disabled, "con el nombre vacío no se puede guardar");
  } finally { m.desmontar(); }
});

test("la única regla es no dejar campos vacíos: ni largo mínimo, ni máximo, ni otra", () => {
  assert.equal(sePuedeGuardar({ nickname: "a", full_name: "b".repeat(300) }), true, "1 letra y 300 letras valen");
  assert.equal(sePuedeGuardar({ nickname: "   ", full_name: "Camila" }), false, "solo espacios cuenta como vacío");
  assert.equal(sePuedeGuardar({ nickname: "Cami", full_name: "" }), false);
  assert.equal(sePuedeGuardar({ nickname: "💥💥", full_name: "x" }), true, "sin filtro de contenido");
});

test("guarda lo escrito, sin espacios en los extremos, y avisa al volver", async () => {
  const llamadas = [];
  let vuelto = 0;
  const m = montar({
    perfil: { nickname: "Cami", full_name: "Camila Ruiz" },
    guardar: async (cambio) => { llamadas.push(cambio); return { data: {} }; },
    onGuardado: () => { vuelto++; },
  });
  try {
    escribir(m.caja.querySelector("#editar-apodo"), "  x  ");
    escribir(m.caja.querySelector("#editar-nombre"), "  Camila Ruiz Gómez ");
    assert.ok(!guardarBtn(m.caja).disabled);
    await pulsar(guardarBtn(m.caja));
    assert.deepEqual(llamadas, [{ nickname: "x", full_name: "Camila Ruiz Gómez" }]);
    assert.equal(vuelto, 1);
  } finally { m.desmontar(); }
});

test("si la base lo rechaza, lo dice y no vuelve al perfil", async () => {
  let vuelto = 0;
  const m = montar({
    perfil: { nickname: "Cami", full_name: "Camila Ruiz" },
    guardar: async () => ({ error: mensajeDeErrorPerfil({ code: "23505" }) }),
    onGuardado: () => { vuelto++; },
  });
  try {
    await pulsar(guardarBtn(m.caja));
    assert.equal(m.caja.querySelector('[role="alert"]').textContent, "Ese apodo ya lo usa otra persona. Prueba con otro.");
    assert.equal(vuelto, 0);
  } finally { m.desmontar(); }
});

test("al guardado solo llegan columnas de la lista blanca, y los errores de la base se dicen en palabras", () => {
  assert.deepEqual(CAMPOS_EDITABLES, ["nickname", "full_name"]);
  assert.deepEqual(cambioPermitido({ nickname: " a ", full_name: "b", points: 99999, es_prueba: true, streak: 400 }), { nickname: "a", full_name: "b" });
  assert.equal(mensajeDeErrorPerfil({ code: "23514", message: 'violates check constraint "profiles_nickname_len"' }), "El apodo tiene que tener entre 3 y 20 caracteres.");
  assert.equal(mensajeDeErrorPerfil({ code: "23514", message: 'violates check constraint "profiles_full_name_len"' }), "El nombre tiene que tener entre 3 y 80 caracteres.");
  assert.match(mensajeDeErrorPerfil({ code: "08006" }), /No se pudo guardar/);
});

test("una sección nueva entra sin tocar el panel: se pinta, se valida y se guarda con las demás", async () => {
  /* El avatar YA llegó (es la segunda sección real), así que la sección de
   * mentira de esta prueba es otra cosa: lo que se comprueba es el punto de
   * extensión, no el avatar. */
  function SeccionInsignia({ valores, cambiar }) {
    return React.createElement("input", { id: "prueba-insignia", value: valores.insignia, onChange: (e) => cambiar("insignia", e.target.value) });
  }
  const secciones = [...SECCIONES, { id: "insignia", titulo: "Insignia", campos: ["insignia"], Componente: SeccionInsignia }];
  const llamadas = [];
  const m = montar({
    perfil: { nickname: "Cami", full_name: "Camila", insignia: "" },
    secciones,
    guardar: async (c) => { llamadas.push(c); return {}; },
  });
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-seccion]")].map((s) => s.getAttribute("data-seccion")), ["identidad", "avatar", "insignia"]);
    assert.equal(m.caja.querySelectorAll('button[type="submit"]').length, 1, "un solo guardar para todas las secciones");
    assert.ok(guardarBtn(m.caja).disabled, "la insignia vacía también bloquea");
    escribir(m.caja.querySelector("#prueba-insignia"), "buho");
    await pulsar(guardarBtn(m.caja));
    assert.deepEqual(llamadas, [{ nickname: "Cami", full_name: "Camila", insignia: "buho" }]);
  } finally { m.desmontar(); }

  assert.deepEqual(borradorDe({ nickname: "a" }, secciones), { nickname: "a", full_name: "", insignia: "" });
  assert.deepEqual(cambioDe({ nickname: " a", full_name: "b ", insignia: "c" }, secciones), { nickname: "a", full_name: "b", insignia: "c" });
});
