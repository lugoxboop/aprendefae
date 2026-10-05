import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 1 — «Vender no es cobrar».
 *
 *   · el estado sale del paso: los contadores de cada paso son los de Levi
 *   · Compañía Cualquiera: Entró $15.000 · Salió $100.000
 *   · el valor final de cada contador queda escrito siempre: con movimiento
 *     reducido, con la pestaña oculta y con la animación trabada (PR #14)
 *   · la reproducción automática solo a pedido, con pausa, y se pausa sola
 *   · lector de pantalla, foco y teclado (sección 9 de Xeno)
 *   · el reinicio: «recién cambiada», el aviso y el foco en la etiqueta
 *   · #B8C4D4 nunca es color de texto; ni teal, ni ámbar, ni coral
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") ? reducido : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const RAF_REAL = (cb) => setTimeout(() => cb(performance.now()), 16);
w.requestAnimationFrame = RAF_REAL;
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../dosLineas.js");
const T3 = await import("../../data/contabilidadTema3.js");
const { SUBJECTS } = await import("../../data/subjects.js");
const { default: MiraloFuncionar } = await import("../../components/mecanicas/libros/tema3/MiraloFuncionar.jsx");
const { default: PruebaUsted } = await import("../../components/mecanicas/libros/tema3/PruebaUsted.jsx");
const { ESCENAS_TEMA3 } = await import("../../components/mecanicas/libros/tema3/escenasTema3.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const esperar = async (cond, ms = 2000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error("no llegó a tiempo");
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
};
const dormir = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const montos = (caja, sel = "") => ["ingreso", "gasto", "entrada", "salida"].map((t) => caja.querySelector(`${sel} [data-contador="${t}"] [data-monto]`).textContent);

/* ═══════════ EL ESTADO, PASO A PASO (Levi) ═══════════ */

const TABLA_LEVI = [
  ["$0", "$0", "$0", "$0"],
  ["$0", "$0", "$15.000", "$0"],
  ["$5.000", "$0", "$20.000", "$0"],
  ["$9.000", "$0", "$20.000", "$0"],
  ["$9.000", "$2.500", "$20.000", "$0"],
  ["$9.000", "$2.500", "$20.000", "$0"],
];

test("★★★ los contadores de cada paso son los de Levi (Ingresos · Gastos · Entró · Salió)", () => {
  TABLA_LEVI.forEach((esperado, k) => {
    const c = D.estadoPaso(k + 1).contadores;
    assert.deepEqual([c.ingreso, c.gasto, c.entrada, c.salida].map(D.pesos), esperado, `paso ${k + 1}`);
  });
});

test("★★★ San Calixto en orden cronológico: aporte → servicio → factura → máquina; la máquina es $2.500", () => {
  assert.deepEqual(T3.SAN_CALIXTO.hechos.map((x) => x.id), ["aporte", "servicio", "factura", "maquina"]);
  assert.equal(T3.SAN_CALIXTO.hechos[0].fecha, "Balance de iniciación, 2 de enero");
  assert.deepEqual(T3.SAN_CALIXTO.hechos[3].marcas, [{ tipo: "gasto", monto: 2500 }]);
  /* Qué pista se mueve en cada paso, y cuál queda quieta. */
  const pistas = [1, 2, 3, 4, 5, 6].map((p) => D.estadoPaso(p).pistas);
  assert.deepEqual(pistas.map((x) => `${x.resultados}/${x.caja}`), [
    "reposo/reposo", "quieta/activa", "activa/activa", "activa/quieta", "activa/quieta", "reposo/reposo",
  ]);
  /* «Anterior» recalcula: el paso 3 es el mismo venga de donde venga. */
  assert.deepEqual(D.estadoPaso(3), D.estadoPaso(3));
  assert.equal(D.estadoPaso(0).paso, 1);
  assert.equal(D.estadoPaso(99).paso, 6);
});

test("★★★ Compañía Cualquiera: Entró $15.000 · Salió $100.000; ingresos y gastos quieta en los dos hechos", () => {
  const cc = T3.COMPANIA_CUALQUIERA;
  const fin = D.estadoExploracion(cc, ["inventario", "computador"]);
  assert.deepEqual([fin.contadores.ingreso, fin.contadores.gasto, fin.contadores.entrada, fin.contadores.salida].map(D.pesos), ["$0", "$0", "$15.000", "$100.000"]);
  assert.ok(fin.completa);
  for (const id of ["inventario", "computador"]) {
    const e = D.estadoExploracion(cc, [id], id);
    assert.equal(e.pistas.resultados, "quieta", id);
    assert.equal(e.pistas.caja, "activa", id);
  }
  assert.equal(fin.columnas, 2);
});

test("★★ los contadores no netean, y la reproducción tarda lo de Xeno (3 s + 450 ms por palabra)", () => {
  assert.equal(D.estadoPaso(5).contadores.ingreso, 9000, "no se resta el gasto: eso sería la utilidad");
  assert.deepEqual([1, 2, 3, 4, 5].map((p) => D.duracionPaso(D.estadoPaso(p))), [12450, 15150, 10200, 13800, 15150]);
});

test("★★★ los textos son los de Gen, y ninguno dice «ganar», «gana» ni «ganó»", () => {
  const textos = [
    T3.PIEZA_VENDER_NO_ES_COBRAR.objetivo, ...T3.PIEZA_VENDER_NO_ES_COBRAR.nombres.map((n) => n.definicion),
    T3.TEXTO_PASO_1, T3.CIERRE, T3.ENLACE_TEMA_1, T3.CONSIGNA_CAPA_3, T3.AVISO_CAMBIO, T3.PREGUNTA_FINAL,
    ...T3.SAN_CALIXTO.hechos.flatMap((x) => [x.titulo, x.texto]), ...T3.COMPANIA_CUALQUIERA.hechos.flatMap((x) => [x.titulo, x.texto]),
    ...T3.OPCIONES_FINAL.flatMap((o) => [o.texto, o.feedback]), ...T3.ALTERNATIVOS,
    ...Object.values(T3.ROTULO_PISTA),
  ];
  for (const t of textos) assert.doesNotMatch(t, /\bgan(ar|a|ó|o)\b/i, t);
  assert.equal(T3.ROTULO_PISTA.resultados, "Ingresos y gastos");
  assert.equal(T3.ROTULO_PISTA.caja, "Caja: entra y sale plata");
  assert.equal(T3.CONSIGNA_CAPA_3, "Toca cada hecho y mira qué línea se mueve.");
  assert.equal(T3.AVISO_CAMBIO, "Cambia la empresa, así que las dos líneas vuelven a cero.");
});

/* Los seis textos alternativos de Levi, textuales, y el nombre del tema. */
const ALT_DE_LEVI = [
  "Dos líneas. Arriba, ingresos y gastos. Abajo, la caja.",
  "Ejemplo: los socios ponen $15.000 en plata y un equipo de $5.000. La línea de caja sube $15.000 y la de ingresos y gastos queda quieta.",
  "Ejemplo: San Calixto presta un servicio y le pagan el mismo día. Las dos líneas se mueven.",
  "Ejemplo: San Calixto manda una factura de $4.000 a JCC. La línea de arriba se mueve y la de abajo queda quieta.",
  "Ejemplo: San Calixto usa una máquina alquilada cinco días y aún no la paga. La línea de arriba marca un gasto de $2.500 y la caja queda quieta.",
  "Dos líneas. Arriba, ingresos y gastos. Abajo, la caja. No siempre se mueven juntas.",
];

test("★★★ los seis alternativos son los de Levi, y en el DOM se lee el de cada paso", async () => {
  assert.deepEqual(T3.ALTERNATIVOS, ALT_DE_LEVI);
  reducido = true;
  const m = await montar(h(MiraloFuncionar));
  try {
    const grupo = m.caja.querySelector('[role="group"]');
    const desc = () => document.getElementById(grupo.getAttribute("aria-describedby")).textContent;
    for (let k = 0; k < 6; k++) {
      assert.equal(desc(), ALT_DE_LEVI[k], `paso ${k + 1}`);
      if (k < 5) await tocar(m.caja.querySelector("[data-siguiente]"));
    }
  } finally { m.desmontar(); }
});

test("★★ el Tema 3 se llama «Ingresos, gastos y ajustes», y el id no cambia", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  assert.equal(tema?.title, "Ingresos, gastos y ajustes");
});

/* ═══════════ LA CAPA 2, MONTADA ═══════════ */

test("★★★ capa 2: Siguiente recorre los seis pasos y los contadores en pantalla son los de Levi", async () => {
  reducido = true;
  const m = await montar(h(MiraloFuncionar));
  try {
    for (let k = 0; k < 6; k++) {
      assert.deepEqual(montos(m.caja), TABLA_LEVI[k], `paso ${k + 1}`);
      assert.equal(m.caja.querySelector("[data-paso-de]").textContent, `Paso ${k + 1} de 6`);
      if (k < 5) await tocar(m.caja.querySelector("[data-siguiente]"));
    }
    /* El paso 6 resalta Ingresos y Entró. */
    assert.equal(m.caja.querySelector('[data-contador="ingreso"] [data-monto]').getAttribute("data-resaltado"), "si");
    assert.equal(m.caja.querySelector('[data-contador="entrada"] [data-monto]').getAttribute("data-resaltado"), "si");
    /* Anterior recalcula hacia atrás. */
    await tocar(m.caja.querySelector("[data-anterior]"));
    await tocar(m.caja.querySelector("[data-anterior]"));
    await tocar(m.caja.querySelector("[data-anterior]"));
    assert.deepEqual(montos(m.caja), TABLA_LEVI[2]);
  } finally { m.desmontar(); }
});

for (const [nombre, poner, quitar] of [
  ["movimiento reducido", () => { reducido = true; }, () => {}],
  ["pestaña oculta", () => { reducido = false; Object.defineProperty(w.document, "visibilityState", { value: "hidden", configurable: true }); }, () => { delete w.document.visibilityState; }],
  ["animación trabada", () => { reducido = false; globalThis.requestAnimationFrame = () => 0; w.requestAnimationFrame = globalThis.requestAnimationFrame; }, () => { globalThis.requestAnimationFrame = RAF_REAL; w.requestAnimationFrame = RAF_REAL; }],
]) {
  test(`★★★ el valor final de cada contador queda escrito siempre, con ${nombre}`, async () => {
    poner();
    try {
      const m = await montar(h(MiraloFuncionar));
      try {
        for (let k = 1; k < 6; k++) {
          await tocar(m.caja.querySelector("[data-siguiente]"));
          await esperar(() => montos(m.caja).join() === TABLA_LEVI[k].join(), 1500);
        }
        await dormir(700);
        assert.deepEqual(montos(m.caja), TABLA_LEVI[5]);
      } finally { m.desmontar(); }
    } finally { quitar(); reducido = true; }
  });
}

test("★★★ la reproducción automática: nunca arranca sola, tiene Pausa y se pausa si la pestaña se oculta", async () => {
  reducido = true;
  const m = await montar(h(MiraloFuncionar));
  try {
    const rep = () => m.caja.querySelector("[data-reproducir]");
    await dormir(300);
    assert.equal(m.caja.querySelector("[data-paso-de]").textContent, "Paso 1 de 6", "arrancó sola");
    assert.equal(rep().textContent, "Reproducir");
    await tocar(rep());
    assert.equal(rep().textContent, "Pausa");
    assert.equal(rep().getAttribute("aria-pressed"), "true");
    await tocar(rep());
    assert.equal(rep().textContent, "Reproducir", "Pausa no detuvo");
    /* Reanudar y ocultar la pestaña: se pausa sola. */
    await tocar(rep());
    Object.defineProperty(w.document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => { w.document.dispatchEvent(new w.Event("visibilitychange")); });
    delete w.document.visibilityState;
    assert.equal(rep().textContent, "Reproducir", "no se pausó al ocultar la pestaña");
    /* Un toque en Siguiente la pasa a manual. */
    await tocar(rep());
    await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(rep().textContent, "Reproducir");
    /* En el paso 6, «Ver de nuevo» vuelve al 1. */
    for (let k = 0; k < 5; k++) if (!m.caja.querySelector("[data-siguiente]").disabled) await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(rep().textContent, "Ver de nuevo");
    await tocar(rep());
    assert.equal(m.caja.querySelector("[data-paso-de]").textContent, "Paso 1 de 6");
  } finally { m.desmontar(); }
});

test("★★★ capa 2, lector de pantalla y teclado: grupo, descripción por paso, región viva y botones nativos", async () => {
  reducido = true;
  const m = await montar(h(MiraloFuncionar));
  try {
    const grupo = m.caja.querySelector('[role="group"]');
    assert.equal(grupo.getAttribute("aria-label"), "Dos líneas: ingresos y gastos, y caja");
    const desc = () => document.getElementById(grupo.getAttribute("aria-describedby")).textContent;
    assert.equal(desc(), T3.ALTERNATIVOS[0]);
    await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(desc(), T3.ALTERNATIVOS[1]);
    const viva = m.caja.querySelector("[data-texto-paso]");
    assert.equal(viva.getAttribute("aria-live"), "polite");
    assert.equal(viva.getAttribute("aria-atomic"), "true");
    assert.equal(viva.textContent, T3.SAN_CALIXTO.hechos[0].texto);
    /* Carriles, marcas y bandas: aria-hidden. Los contadores, texto real. */
    for (const c of m.caja.querySelectorAll("[data-carril]")) assert.equal(c.getAttribute("aria-hidden"), "true");
    assert.ok(m.caja.querySelector('[data-contador="entrada"]').closest("[aria-hidden]") === null);
    /* Tarjeta del aporte. */
    assert.match(m.caja.querySelector("[data-tarjeta-hecho]").textContent, /Hecho 1.*Los socios aportan \$15\.000.*Balance de iniciación, 2 de enero.*Libro, p\. 121/);
    /* Botones nativos, en el orden Anterior, Siguiente, Reproducir. */
    const botones = [...m.caja.querySelectorAll("button")].map((b) => b.textContent);
    assert.deepEqual(botones, ["Anterior", "Siguiente", "Reproducir"]);
    /* Desactivado: nativo, texto #A8B6C8 y borde #8C9BB0 (Levi). */
    for (let k = 0; k < 5; k++) await tocar(m.caja.querySelector("[data-siguiente]"));
    const sig = m.caja.querySelector("[data-siguiente]");
    assert.equal(sig.disabled, true);
    assert.equal(sig.style.color, "rgb(168, 182, 200)");
    assert.match(sig.style.border, /rgb\(140, 155, 176\)/);
  } finally { m.desmontar(); }
});

test("★★ los montos de las marcas anteriores van en #A8B6C8, y los del hecho actual en blanco", async () => {
  reducido = true;
  const m = await montar(h(MiraloFuncionar));
  try {
    for (let k = 0; k < 3; k++) await tocar(m.caja.querySelector("[data-siguiente]"));
    const actual = m.caja.querySelector('[data-marca][data-actual="si"] [data-monto-marca]');
    const anterior = m.caja.querySelector('[data-marca][data-actual="no"] [data-monto-marca]');
    assert.equal(actual.style.color, "rgb(255, 255, 255)");
    assert.equal(anterior.style.color, "rgb(168, 182, 200)");
  } finally { m.desmontar(); }
});

/* ═══════════ LA CAPA 3, MONTADA ═══════════ */

test("★★★ capa 3: los cuatro hechos de San Calixto, el cambio de empresa con «recién cambiada», el aviso y el foco", async () => {
  reducido = true;
  const m = await montar(h(PruebaUsted));
  try {
    const boton = (id) => m.caja.querySelector(`[data-hecho-boton="${id}"]`);
    assert.equal(m.caja.querySelector("[data-otra-empresa]"), null, "el botón de otra empresa aparece antes de tiempo");
    for (const id of ["aporte", "servicio", "factura", "maquina"]) await tocar(boton(id));
    assert.deepEqual(montos(m.caja), ["$9.000", "$2.500", "$20.000", "$0"]);
    assert.equal(boton("maquina").getAttribute("aria-current"), "true");
    /* El nombre accesible: el texto sin lo que es aria-hidden (el número del chip). */
    const nombre = (el) => { const c = el.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove()); return c.textContent; };
    assert.equal(nombre(boton("factura")), "Hecho 3: Factura de $4.000 a JCC, 12 de enero, visto");
    /* No es automático: hay que pulsar. */
    const otra = m.caja.querySelector("[data-otra-empresa]");
    assert.equal(otra.textContent, "Seguir con otra empresa");
    await tocar(otra);
    const chip = m.caja.querySelector("[data-empresa]");
    assert.equal(chip.getAttribute("data-empresa"), "compania-cualquiera");
    assert.equal(chip.getAttribute("data-recien-cambiada"), "si");
    assert.equal(document.activeElement, chip, "el foco no pasó a la etiqueta de empresa");
    assert.equal(m.caja.querySelector("[data-aviso-cambio]").textContent, `Compañía Cualquiera. ${T3.AVISO_CAMBIO}`);
    assert.deepEqual(montos(m.caja), ["$0", "$0", "$0", "$0"]);
    assert.equal(m.caja.querySelectorAll("[data-hecho-boton]").length, 2);
    /* El primer toque devuelve la etiqueta a su estilo y retira el aviso. */
    await tocar(boton("inventario"));
    assert.equal(chip.getAttribute("data-recien-cambiada"), "no");
    assert.equal(m.caja.querySelector("[data-aviso-cambio]"), null);
    await tocar(boton("computador"));
    assert.deepEqual(montos(m.caja), ["$0", "$0", "$15.000", "$100.000"]);
  } finally { m.desmontar(); }
});

test("★★ capa 3 con animación: el reinicio tarda ≈650 ms y la etiqueta queda «recién cambiada» sin límite de tiempo", async () => {
  reducido = false;
  try {
    const m = await montar(h(PruebaUsted));
    try {
      for (const id of ["aporte", "servicio", "factura", "maquina"]) await tocar(m.caja.querySelector(`[data-hecho-boton="${id}"]`));
      await tocar(m.caja.querySelector("[data-otra-empresa]"));
      await esperar(() => m.caja.querySelectorAll("[data-hecho-boton]").length === 2, 1500);
      await dormir(900);
      assert.equal(m.caja.querySelector("[data-empresa]").getAttribute("data-recien-cambiada"), "si");
      assert.deepEqual(montos(m.caja), ["$0", "$0", "$0", "$0"]);
      assert.ok(m.caja.querySelector("[data-aviso-cambio]"));
    } finally { m.desmontar(); }
  } finally { reducido = true; }
});

/* ═══════════ COLORES ═══════════ */

test("★★★ #B8C4D4 nunca es color de texto, y en el componente no hay teal, ámbar ni coral", async () => {
  const carpeta = new URL("../../components/mecanicas/libros/tema3/", import.meta.url);
  const fuentes = [
    ...readdirSync(carpeta).map((f) => readFileSync(new URL(f, carpeta), "utf8")),
    readFileSync(new URL("../dosLineas.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../data/contabilidadTema3.js", import.meta.url), "utf8"),
  ].join("\n");
  assert.doesNotMatch(fuentes, /#2a9d8f|#52c4b0|#e9c46a|#e76f51|FAE\.(teal|ambar|coral)|rgba\(42,\s*157,\s*143|rgba\(233,\s*196,\s*106|rgba\(231,\s*111,\s*81/i);
  reducido = true;
  for (const C of [MiraloFuncionar, PruebaUsted]) {
    const m = await montar(h(C));
    try {
      /* Recorrer estados para que salgan todos los textos posibles. */
      for (const b of m.caja.querySelectorAll("[data-siguiente], [data-hecho-boton]")) { await tocar(b); await tocar(b); }
      const conTexto = [...m.caja.querySelectorAll("*")].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
      for (const el of conTexto) {
        let x = el;
        while (x && !x.style?.color) x = x.parentElement;
        assert.notEqual(x?.style?.color, "rgb(184, 196, 212)", `«${el.textContent.trim().slice(0, 40)}» en #B8C4D4`);
      }
    } finally { m.desmontar(); }
  }
});

test("★★ la capa 4 es el componente de pregunta ya aprobado (UnaFrase), sin cambios", async () => {
  const { Capa4 } = ESCENAS_TEMA3["t3-a1-vender-no-es-cobrar"];
  const m = await montar(h(Capa4));
  try {
    assert.ok(m.caja.querySelector("[data-una-frase]"));
    assert.equal(m.caja.querySelectorAll("[data-opcion]").length, 4);
    await tocar(m.caja.querySelector('[data-opcion="caja"]'));
    assert.equal(m.caja.querySelector("[data-devolucion]").textContent, T3.OPCIONES_FINAL[1].feedback);
  } finally { m.desmontar(); }
});
