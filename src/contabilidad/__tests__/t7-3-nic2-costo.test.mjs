import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A7 «La NIC 2 del libro: el costo» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, y
 *     nada más
 *   · la frase fija de la NIC 2 está a la vista en TODAS las pantallas y
 *     estados (encargo de L), con el texto del plan de Near
 *   · el ejemplo construido es el del registro 5c (T73-A7), y la medida es
 *     el menor entre el costo y el valor neto realizable
 *   · cada pantalla y cada estado muestran sus textos y su pie
 *   · fuera del catálogo de FP; en T7-3, después de A6 entre las de Aprender
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

const A = await import("../../data/contabilidadT7_3_a7.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a7-v1.md");
const PLAN = leer("orquestador/conocimiento/paquetes/t7-3-plan-v1.md");
const P = A.PIEZA_NIC2_COSTO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/*
 * El lote 2 de Near: la pista de cada pregunta (primer error) y el anexo (la
 * tercera opción, con su devolución, y el cambio en el texto de una opción
 * correcta). Un texto nuevo de los datos sale de aquí o del paquete de la pieza.
 */
const PISTAS_L2 = leer("orquestador/conocimiento/paquetes/lote2-pistas-v1.md");
const ANEXO_L2 = leer("orquestador/conocimiento/paquetes/lote2-anexo-v1.md");
const sinComillas = (t) => t.trim().replace(/ \|$/, "").replace(/^«/, "").replace(/»$/, "");
const idEnCelda = (celda) => celda.match(/`([^`]+)`/)[1];
/* id de pantalla → pista. */
const L2_PISTAS = new Map((PISTAS_L2.split("\n### ").find((s) => s.startsWith(`${P.id} ·`)) ?? "").split("\n")
  .filter((l) => /^\| P\d/.test(l)).map((l) => l.split(" | ")).map((c) => [idEnCelda(c[0]), sinComillas(c[2])]));
/* id de pantalla → la tercera opción del anexo: { texto, devolucion }. */
const L2_TERCERAS = new Map(ANEXO_L2.split("\n").filter((l) => l.startsWith(`| ${P.id} | `)).map((l) => l.split(" | "))
  .map((c) => [idEnCelda(c[1]), { texto: c[3].replace(/\*\*/g, ""), devolucion: sinComillas(c[4]) }]));
/* «Un cambio en el texto de una opción correcta»: [campo, viejo, nuevo]. */
const L2_CAMBIOS = ANEXO_L2.slice(ANEXO_L2.indexOf("## Un cambio")).split("\n").filter((l) => l.startsWith(`| ${P.id} · `))
  .map((l) => l.split(" | ").map((x, i) => (i ? sinComillas(x) : x.replace(/^\| /, ""))));

/*
 * La escalera de ayuda (escaleraAyuda.js): el n-ésimo error de una pregunta.
 * Con pista, el 1.º muestra la pista; el 2.º y siguientes, la respuesta y el
 * acierto sin «Así es». Sin pista, la devolución de la opción, como antes.
 */
const errorEsperado = (p, o, n) => {
  const correcta = p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "");
  const esperado = !p.pista ? [o.devolucion] : n === 1 ? [p.pista] : [`La respuesta es «${correcta}».`, p.acierto.texto.replace(/^Así es[.:]\s*/, "")];
  assert.deepEqual(textosDelError(p, o, n), esperado);
  return esperado;
};
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Decisiones")).split("\n").filter((l) => /^\| \d/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| /, "")));

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente", "pista"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []), ...(p.tras ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

test("★★★ cada texto visible de la v1 está en los datos, letra por letra, y nada más", () => {
  const esperados = [];
  for (const [, texto] of FILAS) {
    if (texto.startsWith("Frase fija")) continue;
    for (const c of citas(texto)) esperados.push(c);
  }
  /* El lote 2: cada pregunta con su pista, la de Near, y ninguna más; aquí no hay tercera opción ni cambio del anexo. */
  assert.deepEqual(new Map(P.pantallas.filter((p) => p.pista).map((p) => [p.id, p.pista])), L2_PISTAS);
  assert.deepEqual([...L2_PISTAS.keys()].sort(), ["como-se-mide", "el-costo"]);
  assert.deepEqual([L2_TERCERAS.size, L2_CAMBIOS.length], [0, 0]);
  esperados.push(...L2_PISTAS.values());
  const datos = [...textosDeDatos(), ...P.pantallas.flatMap((p) => p.lista ?? [])];
  assert.deepEqual([...new Set(datos)].sort(), [...new Set(esperados)].sort());
  /* Las tres viñetas de la p. 257, en su orden. */
  const vinetas = FILAS.filter((f) => f[1].startsWith("• ")).map((f) => citas(f[1])[0]);
  assert.deepEqual(pantalla("que-es").lista, vinetas);
});

test("★★★ la frase fija de la NIC 2 es la del plan y la de la v1", () => {
  assert.equal(P.aviso, A.FRASE_NIC2);
  assert.equal(citas(FILAS.find((f) => f[1].startsWith("Frase fija"))[1])[0], A.FRASE_NIC2);
  assert.ok(PLAN.includes(`«${A.FRASE_NIC2}»`));
});

test("★★★ el ejemplo construido es el del registro de Near, y se mide por el menor", () => {
  const E = A.EJEMPLO_A7;
  assert.equal(E.vnr, E.precio - E.vender);
  assert.equal(Math.min(E.costo, E.vnr), E.vnr);
  const cm = pantalla("como-se-mide");
  assert.equal(cm.opciones.find((o) => o.correcta).texto, "$550.000");
  assert.deepEqual(cm.opciones.map((o) => o.texto), FILAS.find((f) => f[1].startsWith("«Esa mercancía costó"))[1].match(/Opciones: (.+)\.$/)[1].split(" · "));
  assert.deepEqual(pantalla("el-costo").opciones.map((o) => o.texto), FILAS.find((f) => f[1].startsWith("«¿Cuál de estos se resta"))[1].match(/Opciones: (.+)\.$/)[1].split(" · "));
  assert.equal(pantalla("el-costo").opciones.find((o) => o.correcta).texto, "Un descuento comercial");
  /* Ninguna cifra del OCR que Near descartó (500.000) ni de X1-X4. */
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of [500_000, 800_000, 175_000, 5_800_000, 1_200_000, 8_700_000, 2_432_000, 17_632_000]) assert.ok(!numeros.has(x), String(x));
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
const aviso = (caja) => caja.querySelector("[data-pieza] [data-aviso]")?.textContent ?? null;

test("★★★ se recorre entera, con la frase de la NIC 2 a la vista en cada pantalla y cada estado", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    const visto = [];
    const mira = () => { assert.equal(aviso(c), A.FRASE_NIC2, `sin la frase en ${c.querySelector("[data-pantalla]").dataset.pantalla}`); visto.push(c.querySelector("[data-pantalla]").dataset.pantalla); };
    mira();
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    await tocar(boton(c, "empezar")); mira();
    assert.deepEqual(textos(c), pantalla("la-norma").parrafos);
    await tocar(boton(c, "seguir")); mira();
    const qe = pantalla("que-es");
    assert.deepEqual(textos(c), [...qe.parrafos, ...qe.lista, ...qe.despues]);
    assert.equal(c.querySelectorAll("[data-lista] li").length, 3);
    await tocar(boton(c, "seguir")); mira();
    for (const id of ["como-se-mide", "el-costo"]) {
      const p = pantalla(id);
      assert.deepEqual(textos(c), [...p.parrafos, p.pregunta]);
      /* Los errores siguen la escalera de ayuda: el 1.º da la pista; los demás, la respuesta con su porqué. */
      let n = 0;
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(c, "confirmar")); mira();
        const esperado = errorEsperado(p, o, ++n);
        assert.deepEqual(textos(c).slice(-esperado.length), esperado);
        await tocar(boton(c, "probar-otra"));
      }
      await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      await tocar(boton(c, "confirmar")); mira();
      assert.deepEqual(textos(c).slice(-1), [p.acierto.texto]);
      assert.equal(pie(c), p.acierto.pie);
      await tocar(boton(c, "seguir")); mira();
    }
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.deepEqual([...new Set(visto)], P.pantallas.map((p) => p.id));
  } finally {
    m.desmontar();
  }
});

test("★★★ fuera del catálogo de FP; en T7-3, después de A6 entre las de Aprender", () => {
  assert.equal(A.A7_ID, "t7-3-nic2-costo");
  assert.equal(P.numero, 7);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A7_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-3-provision-inventarios") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A7_ID)), []);
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

test("★★★ Patrón T7-3: la franja de la NIC 2 pegada arriba; el ejemplo en renglones con su texto, y el menor con el acierto", async () => {
  const E = A.EJEMPLO_A7;
  const m = await montar();
  try {
    /* La franja: la primera cosa de la pieza, con la clase del patrón (sticky en su CSS). */
    const pieza = m.caja.querySelector("[data-pieza]");
    assert.equal(pieza.firstElementChild.matches("p.t73pt-nic2[data-aviso]"), true);
    assert.ok(pieza.classList.contains("t73pt-pieza"), "la pieza es el contenedor de la franja");
    const V = `Ejemplo que no es del libro: Precio esperado de venta 610.000 | −Lo que cuesta vender 60.000 | =Valor neto realizable ${"550.000"} =`;
    assert.deepEqual(await figurasPorEstado(m), {
      "como-se-mide:antes": [V],
      "como-se-mide:error": [V],
      "como-se-mide:acierto": [V, "Se mide por el menor: Costo 580.000 | Valor neto realizable El menor 550.000 !"],
    });
  } finally {
    m.desmontar();
  }
  assert.equal(E.precio - E.vender, E.vnr);
  assert.equal(Math.min(E.costo, E.vnr), E.vnr);
});
