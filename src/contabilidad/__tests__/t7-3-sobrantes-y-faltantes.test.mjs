import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A5 «Sobrantes y faltantes» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, y
 *     nada más
 *   · la ficha es la de la regla 10b; los dos asientos son los de la v1,
 *     con «Inventario de mercancías» en plural (regla 8)
 *   · las cifras de I-1 e I-2 se recalculan; ninguna de X1-X4 ni el 960.000
 *     que Near descartó (es el costo de G-4)
 *   · cada pantalla y cada estado muestran sus textos y su pie
 *   · fuera del catálogo de FP; en T7-3, después de A4
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
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
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a5.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a5-v1.md");
const PLAN = leer("orquestador/conocimiento/paquetes/t7-3-plan-v1.md");
const P = A.PIEZA_SOBRANTES_Y_FALTANTES;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Notas")).split("\n").filter((l) => /^\| \d/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| /, "")));

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []), ...(p.tras ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

test("★★★ cada texto visible de la v1 está en los datos, letra por letra, y nada más", () => {
  const esperados = [];
  for (const [n, texto] of FILAS) {
    if (/Asiento/.test(n) || texto.startsWith("Ficha")) continue;
    for (const c of citas(texto)) esperados.push(c);
  }
  assert.deepEqual([...new Set(textosDeDatos())].sort(), [...new Set(esperados)].sort());
  /* El error del sobrante vale para las dos opciones equivocadas. */
  assert.equal(pantalla("sobrante").opciones.filter((o) => o.devolucion).length, 2);
});

test("★★★ la ficha de la regla 10b, las opciones y los dos asientos son los de la v1", () => {
  const f = FILAS.find((x) => x[1].startsWith("Ficha 10b"))[1];
  const [, quien, libros, conteo, fecha, sistema] = f.match(/quién, (.+?) · saldo en libros (.+?) · conteo (.+?) · (.+?) · sistema (.+?)\.$/);
  assert.deepEqual(pantalla("sobrante").ficha.map((x) => x.texto.toLowerCase()), [quien, libros, conteo, fecha, sistema].map((x) => x.toLowerCase()));
  assert.ok(PLAN.includes("I-1 e I-2: quién · saldo en libros · valor del conteo · fecha · sistema."));
  assert.deepEqual(pantalla("sobrante").ficha.map((x) => x.dato.toLowerCase()), ["quién", "saldo en libros", "valor del conteo", "fecha", "sistema"]);
  const ops = (pref) => FILAS.find((x) => x[1].startsWith(pref))[1].match(/Opciones: (.+)\.$/)[1].split(" · ");
  assert.deepEqual(pantalla("sobrante").opciones.map((o) => o.texto), ops("«¿Cuánto es el sobrante?»"));
  assert.deepEqual(pantalla("faltante").opciones.map((o) => o.texto), ops("«En el ajuste por faltante"));
  const asientos = FILAS.filter((x) => /Asiento/.test(x[0])).map((x) => x[1]);
  const lineas = (t) => [...t.matchAll(/(?:: |· )([^·:]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A1.DEBE : A1.HABER]);
  for (const [k, id] of ["sobrante", "faltante"].entries()) {
    const as = pantalla(id).acierto.asientos[0];
    assert.deepEqual(as.lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas(asientos[k]), id);
    assert.ok(asientos[k].startsWith(`${as.fecha}:`), id);
    assert.ok(asientos[k].includes(`Pie: «${pantalla(id).acierto.pie}»`), id);
  }
  assert.ok(!JSON.stringify(P).includes("Inventario de mercancía\""));
});

test("★★★ las cifras de I-1 e I-2 se recalculan; ninguna de X1-X4 ni la que Near descartó", () => {
  const C = A.I_LIBRO;
  assert.equal(C.sobrante, C.conteoSobra - C.libros);
  assert.equal(C.faltante, C.libros - C.conteoFalta);
  const prohibidas = [960_000, 800_000, 175_000, 5_625_000, 5_800_000, 1_200_000, 262_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(PantallasT7_3, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const textos = (caja) => [...caja.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
const pie = (caja) => caja.querySelector("[data-pie]").textContent;

async function pregunta(c, p) {
  for (const o of p.opciones.filter((x) => !x.correcta)) {
    await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-1), [o.devolucion]);
    assert.equal(c.querySelector("[data-asiento]") === null, true);
    await tocar(boton(c, "probar-otra"));
  }
  await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
  await tocar(boton(c, "confirmar"));
  assert.deepEqual(textos(c).slice(-1), [p.acierto.texto]);
  assert.equal(pie(c), p.acierto.pie);
}

test("★★★ se recorre entera: cada pantalla y cada estado con sus textos y su pie", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    await tocar(boton(c, "empezar"));
    assert.deepEqual(textos(c), pantalla("el-conteo").parrafos);
    assert.equal(pie(c), pantalla("el-conteo").pie);
    await tocar(boton(c, "seguir"));
    const so = pantalla("sobrante");
    assert.deepEqual(textos(c), [...so.parrafos, ...so.ficha.map((f) => f.texto), so.pregunta]);
    await pregunta(c, so);
    assert.equal(c.querySelector("[data-asiento]").dataset.asiento, "31 de diciembre");
    await tocar(boton(c, "seguir"));
    const fa = pantalla("faltante");
    assert.deepEqual(textos(c), [...fa.parrafos, fa.pregunta]);
    await pregunta(c, fa);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("la-lista").parrafos);
    assert.equal(pie(c), pantalla("la-lista").pie);
    await tocar(boton(c, "seguir"));
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.equal(c.querySelector("[data-boton]") === null, true);
  } finally {
    m.desmontar();
  }
});

test("★★★ fuera del catálogo de FP; en T7-3, después de A4 entre las de Aprender", () => {
  assert.equal(A.A5_ID, "t7-3-sobrantes-y-faltantes");
  assert.equal(P.numero, 5);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A5_ID), ids.indexOf("t7-3-descuento-en-dos-libros") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A5_ID), piezas.indexOf("t7-3-descuento-en-dos-libros") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A5_ID)), []);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

/* Recorre la pieza: en cada pantalla con pregunta, antes, con un error y con el acierto. Devuelve qué figuras se vieron en cada estado. */
async function figurasPorEstado(m) {
  const c = m.caja;
  const figs = () => [...c.querySelectorAll("[data-plazos], figure[data-renglones]")].map((f) => (f.matches("[data-plazos]")
    ? `plazos ${f.querySelector("[data-pago]")?.textContent ?? "sin pago"}`
    : `${f.querySelector("figcaption").textContent}: ${[...f.querySelectorAll("[data-renglon]")].map((r) => `${r.querySelector(".rg-op").textContent}${r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, "")} ${r.querySelector(".rg-v").textContent}${r.classList.contains("rg-res") ? " =" : ""}${r.classList.contains("rg-fuerte") ? " !" : ""}`).join(" | ")}`));
  const visto = {};
  for (let k = 0; k < 15; k++) {
    const id = c.querySelector("[data-pantalla]").dataset.pantalla;
    const p = pantalla(id);
    if (p.opciones) {
      visto[`${id}:antes`] = figs();
      await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => !o.correcta).id}"]`)); await tocar(boton(c, "confirmar"));
      visto[`${id}:error`] = figs();
      await tocar(boton(c, "probar-otra"));
      await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`)); await tocar(boton(c, "confirmar"));
      visto[`${id}:acierto`] = figs();
      const s = boton(c, "seguir");
      if (!s) break;
      await tocar(s);
    } else {
      visto[`${id}:lectura`] = figs();
      const b = boton(c, "seguir") ?? boton(c, "empezar");
      if (!b) break;
      await tocar(b);
    }
  }
  /* Solo los estados con figuras. */
  return Object.fromEntries(Object.entries(visto).filter(([, v]) => v.length));
}

test("★★★ Patrón T7-3: el sobrante en renglones con el acierto; el faltante, con su texto; siempre el mayor arriba", async () => {
  const C = A.I_LIBRO;
  assert.equal(C.conteoSobra - C.libros, C.sobrante);
  assert.equal(C.libros - C.conteoFalta, C.faltante);
  const m = await montar();
  try {
    assert.deepEqual(await figurasPorEstado(m), {
      "sobrante:acierto": ["Ejemplo del libro · 31 de diciembre: Conteo físico 495.000 | −Saldo en libros 465.000 | =Sobrante 30.000 ="],
      "faltante:antes": ["El mismo ejemplo, otro conteo: Saldo en libros 465.000 | −Conteo físico 430.000 | =Faltante 35.000 ="],
      "faltante:error": ["El mismo ejemplo, otro conteo: Saldo en libros 465.000 | −Conteo físico 430.000 | =Faltante 35.000 ="],
      "faltante:acierto": ["El mismo ejemplo, otro conteo: Saldo en libros 465.000 | −Conteo físico 430.000 | =Faltante 35.000 ="],
    });
  } finally {
    m.desmontar();
  }
});
