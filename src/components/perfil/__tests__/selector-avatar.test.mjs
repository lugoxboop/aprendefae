import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL SELECTOR DE AVATAR, dentro de «Editar perfil».
 *
 *   · vista previa fija: mismo sitio y mismo tamaño en las tres pestañas
 *   · cada toque guarda solo, y no hay botón de guardar
 *   · anillo de selección teal, nunca coral, y sin cambiar de tamaño
 *   · 'comparacion' no aparece como opción de paleta en ninguna parte
 *   · un nivel sin comprar sale atenuado, con su precio, y lleva a la Tienda
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: SeccionAvatar } = await import("../SeccionAvatar.jsx");
const { default: EditarPerfil, SECCIONES } = await import("../EditarPerfil.jsx");
const { NavigationContext } = await import("../../../navigation.js");
const { FAE } = await import("../../../theme.js");
const { PALETAS, PALETTES } = await import("../../../avatar/generador.js");

const rgb = (hex) => {
  const [, r, g, b] = /^#(..)(..)(..)$/.exec(hex);
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
};

const PERFIL = (extra = {}) => ({
  nickname: "Cami", full_name: "Camila", cristales_balance: 40,
  avatar_shape: "decaedro", avatar_palette: "nocturno", avatar_level: 1, avatar_unlocked_levels: [1],
  ...extra,
});

function montar({ perfil = PERFIL(), guardado = async () => ({ perfil }) } = {}) {
  const guardados = [];
  const tienda = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const onGuardar = async (cambio) => { guardados.push(cambio); return guardado(cambio); };
  act(() => raiz.render(
    React.createElement(NavigationContext.Provider, { value: { irATienda: () => tienda.push(1) } },
      React.createElement(SeccionAvatar, { perfil, onGuardar })),
  ));
  return { caja, guardados, tienda, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const pulsar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const pestana = (caja, id) => caja.querySelector(`[data-pestana="${id}"]`);
const opciones = (caja) => [...caja.querySelectorAll("[data-opcion]")];
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"]`);

test("abre en Forma, con las cinco figuras en gris y en nivel II", () => {
  const m = montar();
  try {
    const celdas = opciones(m.caja);
    assert.deepEqual(celdas.map((c) => c.dataset.opcion), ["decaedro", "prisma", "nucleo", "red", "cuna"]);
    /* Todas con la paleta de comparación y el nivel II: se compara la geometría. */
    assert.deepEqual(
      celdas.map((c) => c.querySelector("svg[data-avatar]").dataset.avatar),
      ["decaedro-comparacion-2", "prisma-comparacion-2", "nucleo-comparacion-2", "red-comparacion-2", "cuna-comparacion-2"],
    );
  } finally { m.desmontar(); }
});

test("la vista previa no se mueve ni cambia de tamaño al cambiar de pestaña", async () => {
  const m = montar();
  try {
    const previa = m.caja.querySelector("[data-vista-previa]");
    const svg = () => previa.querySelector("svg[data-avatar]");
    assert.equal(svg().getAttribute("width"), "176", "entre 160 y 200 px");
    assert.match(m.caja.querySelector("[data-leyenda]").textContent, /Decaedro · Nocturno · Nivel I/);

    for (const id of ["paleta", "nivel", "forma"]) {
      await pulsar(pestana(m.caja, id));
      assert.equal(m.caja.querySelector("[data-vista-previa]"), previa, `${id}: la previa es la misma, no se remonta`);
      assert.equal(svg().getAttribute("width"), "176", `${id}: mismo tamaño`);
    }
  } finally { m.desmontar(); }
});

test("cada toque guarda de inmediato, y solo el campo que cambió", async () => {
  const m = montar();
  try {
    await pulsar(opcion(m.caja, "nucleo"));
    assert.deepEqual(m.guardados, [{ forma: "nucleo", paleta: null, nivel: null }]);
    /* Y la vista previa ya enseña lo nuevo: esa es la confirmación. */
    assert.equal(m.caja.querySelector("[data-vista-previa] svg[data-avatar]").dataset.avatar, "nucleo-nocturno-1");
    assert.match(m.caja.querySelector("[data-leyenda]").textContent, /Núcleo · Nocturno · Nivel I/);

    await pulsar(pestana(m.caja, "paleta"));
    await pulsar(opcion(m.caja, "brasa"));
    assert.deepEqual(m.guardados[1], { forma: null, paleta: "brasa", nivel: null });
    assert.equal(m.caja.querySelector("[data-vista-previa] svg[data-avatar]").dataset.avatar, "nucleo-brasa-1");
  } finally { m.desmontar(); }
});

test("NO hay botón de guardar en el selector, ni aviso de «guardado»", () => {
  const m = montar();
  try {
    const textos = [...m.caja.querySelectorAll("button")].map((b) => b.textContent.toLowerCase());
    assert.ok(!textos.some((t) => t.includes("guardar")), `botones: ${textos.join(" | ")}`);
    assert.ok(!/guardado|guardando/i.test(m.caja.textContent));
  } finally { m.desmontar(); }
});

test("si la base rechaza el cambio, la vista previa vuelve a lo que había y lo dice", async () => {
  const m = montar({ guardado: async () => ({ error: "No se pudo guardar tu avatar. Revisa tu conexión." }) });
  try {
    await pulsar(opcion(m.caja, "red"));
    assert.equal(m.caja.querySelector("[data-vista-previa] svg[data-avatar]").dataset.avatar, "decaedro-nocturno-1");
    const aviso = m.caja.querySelector("[role='alert']");
    assert.match(aviso.textContent, /No se pudo guardar/);
    assert.equal(aviso.style.color, rgb(FAE.ambar), "un fallo de red se dice en ámbar, no en coral");
  } finally { m.desmontar(); }
});

test("el anillo de la selección activa es teal en las tres pestañas, y nunca coral", async () => {
  const m = montar({ perfil: PERFIL({ avatar_shape: "prisma", avatar_palette: "marea", avatar_unlocked_levels: [1, 2], avatar_level: 2 }) });
  try {
    const activaDe = (valor) => opcion(m.caja, valor).style.border;

    assert.equal(activaDe("prisma"), `2.5px solid ${rgb(FAE.teal)}`);
    assert.notEqual(activaDe("decaedro"), activaDe("prisma"), "la que no está elegida no lleva anillo teal");

    await pulsar(pestana(m.caja, "paleta"));
    assert.equal(activaDe("marea"), `2.5px solid ${rgb(FAE.teal)}`);

    await pulsar(pestana(m.caja, "nivel"));
    assert.equal(activaDe("2"), `2.5px solid ${rgb(FAE.teal)}`);

    /*
     * Ni un borde coral en toda la sección, en ninguna pestaña.
     *
     * Quedan fuera de la búsqueda los avatares y las muestras de paleta: el
     * coral de Brasa y de Aurora es el COLOR DE LA FIGURA, definido en el kit,
     * y esconderlo dejaría al estudiante eligiendo una paleta a ciegas. Lo que
     * no puede haber es coral diciendo algo sobre el estado de la pantalla.
     */
    for (const id of ["forma", "paleta", "nivel"]) {
      await pulsar(pestana(m.caja, id));
      const conCoral = [...m.caja.querySelectorAll("*")].filter((el) => {
        if (el.closest("svg[data-avatar]") || el.hasAttribute("data-muestra")) return false;
        const estilo = (el.getAttribute("style") ?? "").toLowerCase();
        return estilo.includes(FAE.coral.toLowerCase()) || estilo.includes("231, 111, 81");
      });
      assert.deepEqual(conCoral.map((el) => el.getAttribute("style")), [], `coral en la pestaña ${id}`);
    }
  } finally { m.desmontar(); }
});

test("el anillo no cambia el tamaño de la celda: solo el color del borde", async () => {
  const m = montar();
  try {
    const elegida = opcion(m.caja, "decaedro");
    const otra = opcion(m.caja, "cuna");
    /* Mismo grosor de borde y mismo relleno de caja en las dos. */
    assert.equal(elegida.style.borderWidth || "2.5px", otra.style.borderWidth || "2.5px");
    assert.equal(elegida.style.padding, otra.style.padding);
    assert.ok(!/checkmark|✓/.test(m.caja.textContent), "nada de checks");
  } finally { m.desmontar(); }
});

test("la pestaña Paleta ofrece cuatro colores y NUNCA la paleta de comparación", async () => {
  const m = montar();
  try {
    await pulsar(pestana(m.caja, "paleta"));
    const celdas = opciones(m.caja);
    assert.deepEqual(celdas.map((c) => c.dataset.opcion), ["nocturno", "marea", "brasa", "aurora"]);
    assert.equal(celdas.length, PALETAS.length);
    assert.equal(opcion(m.caja, "comparacion"), null, "si aparece, es un bug");
    /* Solo el degradado, sin geometría: se compara el color. */
    for (const p of PALETAS) {
      const muestra = m.caja.querySelector(`[data-muestra="${p}"]`);
      assert.ok(muestra, p);
      assert.equal(muestra.style.background, `linear-gradient(135deg, ${PALETTES[p].c1} 0%, ${PALETTES[p].c2} 100%)`);
      assert.equal(opcion(m.caja, p).querySelector("svg[data-avatar]"), null, "sin figura");
    }
  } finally { m.desmontar(); }
});

test("un nivel sin comprar se ve atenuado, con su precio, y tocarlo lleva a la Tienda", async () => {
  const m = montar({ perfil: PERFIL({ avatar_unlocked_levels: [1, 2], avatar_level: 2 }) });
  try {
    await pulsar(pestana(m.caja, "nivel"));

    /* Los cuatro se ven: saber qué falta es la mitad de para qué se enseñan. */
    assert.deepEqual(opciones(m.caja).map((c) => c.dataset.opcion), ["1", "2", "3", "4"]);
    assert.equal(opcion(m.caja, "3").dataset.bloqueado, "si");
    assert.equal(opcion(m.caja, "4").dataset.bloqueado, "si");
    assert.equal(opcion(m.caja, "2").dataset.bloqueado, undefined);
    assert.equal(opcion(m.caja, "3").style.opacity, "0.55");
    assert.match(opcion(m.caja, "3").textContent, /150/);
    assert.match(opcion(m.caja, "4").textContent, /300/);

    /* Tocar uno bloqueado NO lo pone: navega a la Tienda, que es donde se compra. */
    await pulsar(opcion(m.caja, "3"));
    assert.equal(m.tienda.length, 1);
    assert.deepEqual(m.guardados, [], "no se guarda un nivel que no es suyo");
    assert.equal(m.caja.querySelector("[data-vista-previa] svg[data-avatar]").dataset.avatar, "decaedro-nocturno-2");

    /* Y el enlace explícito a la Tienda también está. */
    await pulsar(m.caja.querySelector("[data-ir-tienda]"));
    assert.equal(m.tienda.length, 2);

    /* Uno comprado sí se pone, y guarda. */
    await pulsar(opcion(m.caja, "1"));
    assert.deepEqual(m.guardados, [{ forma: null, paleta: null, nivel: 1 }]);
    assert.equal(m.caja.querySelector("[data-vista-previa] svg[data-avatar]").dataset.avatar, "decaedro-nocturno-1");
  } finally { m.desmontar(); }
});

test("las miniaturas de la pestaña Nivel usan la forma y la paleta puestas, no las de comparación", async () => {
  const m = montar({ perfil: PERFIL({ avatar_shape: "cuna", avatar_palette: "aurora", avatar_unlocked_levels: [1, 2, 3, 4] }) });
  try {
    await pulsar(pestana(m.caja, "nivel"));
    assert.deepEqual(
      opciones(m.caja).map((c) => c.querySelector("svg[data-avatar]").dataset.avatar),
      ["cuna-aurora-1", "cuna-aurora-2", "cuna-aurora-3", "cuna-aurora-4"],
    );
  } finally { m.desmontar(); }
});

/* ─────────────────── su sitio dentro del panel ─────────────────── */

test("el avatar es una sección de «Editar perfil», y no añade campos al guardado", () => {
  const avatar = SECCIONES.find((s) => s.id === "avatar");
  assert.ok(avatar, "la sección que el panel tenía reservada");
  assert.deepEqual(avatar.campos, [], "no manda columnas por el botón de guardar del panel");

  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(EditarPerfil, {
    perfil: PERFIL(), guardar: async () => ({}), onCancelar: () => {}, onGuardado: () => {},
  })));
  try {
    /* Se monta dentro del panel, sin proveedor de cuenta, sin romper nada. */
    assert.ok(caja.querySelector("[data-seccion='avatar'] [data-selector-avatar]"));
    assert.ok(caja.querySelector("[data-seccion='identidad'] #editar-apodo"));
    /* Y el único botón de guardar sigue siendo el del panel, para apodo y nombre. */
    const submit = [...caja.querySelectorAll("button")].filter((b) => b.type === "submit");
    assert.equal(submit.length, 1);
    assert.equal(submit[0].closest("[data-seccion]"), null, "no está dentro de la sección del avatar");
  } finally {
    act(() => raiz.unmount());
    caja.remove();
  }
});

test("el selector pide 'comparacion' solo para las miniaturas de forma, y en ningún otro sitio", () => {
  const fuente = readFileSync(new URL("../SeccionAvatar.jsx", import.meta.url), "utf8");
  const usos = [...fuente.matchAll(/PALETA_COMPARACION/g)];
  assert.equal(usos.length, 2, "una vez al importarla y una al pintar las miniaturas de forma");
  assert.ok(!/["']comparacion["']/.test(fuente), "nunca escrita a mano como cadena");
  /* Las opciones de paleta salen de PALETAS, que no la incluye. */
  assert.ok(/PALETAS\.map/.test(fuente));
});
