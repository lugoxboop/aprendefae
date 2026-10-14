import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 «La cuenta que sí se mueve» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near, y cada
 *     texto visible de la v1 está en los datos
 *   · P3: las cinco líneas de la lista con su lado del libro; «Confirmar»
 *     marca solo las equivocadas, cada una con el mensaje de su lado bueno, y
 *     «Probar otra» devuelve solo esas
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · regla 3: ninguna cifra
 *   · fuera del catálogo de FP; primera pieza de T7-2
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

const A = await import("../../data/contabilidadT7_2.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LaCuentaQueSiSeMueve } = await import("../../components/mecanicas/libros/t7/LaCuentaQueSiSeMueve.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

const RAIZ = new URL("../../../", import.meta.url);
const V1 = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-2-a1-v1.md", RAIZ), "utf8");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Lista de control"));
const P = A.PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const LISTA = pantalla("la-lista-del-libro");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const lado = (caja, linea, cual) => caja.querySelector(`[data-linea="${linea}"][data-lado="${cual}"]`);
const otro = (l) => (l === A.DEBE ? A.HABER : A.DEBE);

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "consigna", "boton", "pie", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []));
    if (p.error) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    for (const l of p.lineas ?? []) t.push(l.texto, l.devolucion);
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie);
  }
  return t;
}

/* Los «…» de primer nivel del contenido que se ven. Fuera: paréntesis, «*[…]*» y las etiquetas de error. */
function citasVisibles(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    .replace(/\([^()]*\)/g, "")
    .replace(/^(\s*- )«[^»]*»: /gm, "$1");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de la v1 no cierran");
  return citas;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1", () => {
  const faltan = textosVisibles().filter((t) => !V1.includes(t));
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v1");
});

test("★★★ cada texto visible de la v1 está en los datos (salvo dos citas que no se ven)", () => {
  const datos = new Set(textosVisibles());
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 30, `se leyeron solo ${citas.length} textos`);
  /*
   * Las dos que no se ven: la cita de la p. 236 con que Near respalda la
   * refutación de P2, y «consumo interno», de la columna Página de la tabla de
   * P3 (dice de dónde sale la línea).
   */
  assert.deepEqual(citas.filter((c) => !datos.has(c)), [
    "así como se debita la cuenta de inventario al comprar… se acredita al vender…, lo cual permite mantener actualizado el saldo",
    "consumo interno",
  ]);
});

test("★★★ P3: las cinco líneas son las de la tabla de la v1, cada una con su lado", () => {
  const tabla = CONTENIDO.slice(CONTENIDO.indexOf("| Línea |"), CONTENIDO.indexOf("**P3 · errores**"))
    .split("\n").filter((l) => l.startsWith("| «"))
    .map((l) => { const c = l.split("|").map((x) => x.trim()); return [c[1].match(/«([^»]+)»/)[1], c[2] === "Debe" ? A.DEBE : A.HABER]; });
  assert.equal(tabla.length, 5);
  assert.deepEqual(LISTA.lineas.map((l) => [l.texto, l.lado]), tabla);
  const entra = "Entra mercancía a la bodega, así que el activo aumenta. Un activo que aumenta va al debe.";
  const sale = "Sale mercancía de la bodega, así que el activo disminuye. Un activo que disminuye va al haber.";
  for (const l of LISTA.lineas) assert.equal(l.devolucion, l.lado === A.DEBE ? entra : sale, l.id);
});

/* ═══════════ 2 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

/* Las líneas de P3 en el orden en que salieron. */
const ordenLineas = (caja) => [...caja.querySelectorAll("[data-fila]")].map((f) => LISTA.lineas.find((l) => l.id === f.dataset.fila));

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(LaCuentaQueSiSeMueve, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lados") {
        const lineas = ordenLineas(m.caja);
        const cab = [p.consigna];
        const filas = (malas = []) => lineas.flatMap((l) => [l.texto, ...(malas.includes(l.id) ? [A.INTERFAZ.incorrecto, l.devolucion] : [])]);
        assert.deepEqual(enPantalla(m.caja).textos, [...cab, ...filas(), A.BOTON.confirmar, p.pie], "lados colocando");
        vistos.push(`${p.id}:colocando`);
        /* Una de debe y una de haber, en el lado equivocado. */
        const malas = [p.lineas.find((l) => l.lado === A.DEBE).id, p.lineas.find((l) => l.lado === A.HABER).id];
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, malas.includes(l.id) ? otro(l.lado) : l.lado));
        await tocar(boton(m.caja, "confirmar"));
        const enOrden = lineas.filter((l) => malas.includes(l.id)).map((l) => l.id);
        assert.deepEqual(enPantalla(m.caja).textos, [...cab, ...filas(enOrden), A.BOTON.probarOtra, p.error.pie], "lados error");
        vistos.push(`${p.id}:error`);
        await tocar(boton(m.caja, "probar-otra"));
        for (const id of malas) await tocar(lado(m.caja, id, p.lineas.find((l) => l.id === id).lado));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...cab, ...filas(), A.INTERFAZ.correcto, p.acierto.texto, A.BOTON.seguir, p.acierto.pie], "lados acierto");
        vistos.push(`${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [p.objetivo, ...(p.parrafos ?? []), ...(p.lista ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...p.parrafos, p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, o.devolucion, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${o.id}`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 5 + 3 + 4);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
    const ol = m.caja.querySelector("ol[data-lista]");
    assert.ok(ol, "el resumen no es una lista numerada");
    assert.deepEqual([...ol.querySelectorAll("li")].map((li) => li.textContent), pantalla("resumen").lista);
  } finally {
    m.desmontar();
  }
});

test("★★★ P3: «Confirmar» espera las cinco; marca solo las equivocadas; «Probar otra» devuelve solo esas", async () => {
  const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [LISTA] }, rotulo: "R" }));
  try {
    const [primera, ...resto] = LISTA.lineas;
    for (const l of resto) await tocar(lado(m.caja, l.id, l.lado));
    assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true", "con una línea sin lado, «Confirmar» ya se activa");
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(m.caja.querySelector("[data-lados]").dataset.estado, "colocando");
    /* Tocar el mismo lado lo quita; tocar el otro lo cambia. */
    await tocar(lado(m.caja, primera.id, primera.lado));
    await tocar(lado(m.caja, primera.id, primera.lado));
    assert.equal(lado(m.caja, primera.id, primera.lado).getAttribute("aria-pressed"), "false");
    await tocar(lado(m.caja, primera.id, otro(primera.lado)));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(m.caja.querySelector("[data-lados]").dataset.estado, "error");
    assert.deepEqual([...m.caja.querySelectorAll("[data-marca]")].map((x) => x.closest("[data-linea]").dataset.linea), [primera.id]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-mensaje='error']")].map((x) => x.closest("[data-fila]").dataset.fila), [primera.id]);
    /* Bloqueadas mientras se lee el error. */
    await tocar(lado(m.caja, resto[0].id, otro(resto[0].lado)));
    assert.equal(lado(m.caja, resto[0].id, resto[0].lado).getAttribute("aria-pressed"), "true");
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(lado(m.caja, primera.id, A.DEBE).getAttribute("aria-pressed"), "false");
    assert.equal(lado(m.caja, primera.id, A.HABER).getAttribute("aria-pressed"), "false");
    for (const l of resto) assert.equal(lado(m.caja, l.id, l.lado).getAttribute("aria-pressed"), "true", `${l.id} se borró`);
    await tocar(lado(m.caja, primera.id, primera.lado));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(m.caja.querySelector("[data-lados]").dataset.estado, "acierto");
  } finally {
    m.desmontar();
  }
});

test("★★ las líneas de P3 se barajan al entrar, y las opciones de P5 en cada intento", async () => {
  const vistos = new Set();
  for (let i = 0; i < 12; i++) {
    const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [LISTA] }, rotulo: "R" }));
    vistos.add(ordenLineas(m.caja).map((l) => l.id).join());
    m.desmontar();
  }
  assert.ok(vistos.size > 1, "las líneas salen siempre en el mismo orden");
  const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [pantalla("el-conteo-en-el-permanente")] }, rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    let antes = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="hallar"]'));
      await tocar(boton(m.caja, "confirmar"));
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
  } finally {
    m.desmontar();
  }
});

test("★★ los pies de cada pantalla y estado son los de la v1", () => {
  const pies = P.pantallas.flatMap((p) => [p.pie, p.error?.pie, p.acierto?.pie].filter(Boolean));
  assert.deepEqual(pies, [
    "Basado en el libro, pp. 207-209 y 233-234",
    "Basado en el libro, pp. 209, 212 y 214",
    "Basado en el libro, pp. 233-234 y 236",
    "Basado en el libro, pp. 207-208", "Basado en el libro, pp. 207-208", "Basado en el libro, pp. 207-208",
    "Basado en el libro, pp. 207-208",
    "Basado en el libro, pp. 233-234", "Basado en el libro, pp. 233-234", "Basado en el libro, pp. 233-234",
    "Basado en el libro, pp. 207-208 y 233-236",
  ]);
});

/* ═══════════ 3 · REGLA 3 Y CATÁLOGO ═══════════ */

test("★★★ regla 3: ningún número fuera de los pies; nada interno", () => {
  for (const t of textosVisibles().filter((x) => !x.startsWith("Basado en el libro"))) assert.doesNotMatch(t, /\d/, t);
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "glosa", "Near", "Mello", "Carrefour", "Éxito", "Olímpica", "obsolescencia", "T7-1"]) assert.ok(!texto.includes(interno), interno);
});

test("★★★ fuera del catálogo de FP; id t7-2-; primera pieza de T7-2; sin nada que pague", () => {
  assert.equal(A.A1_ID, "t7-2-a1-la-cuenta-que-si-se-mueve");
  assert.equal(P.numero, 1);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  assert.equal(tema.title, "Inventarios II: el sistema permanente");
  /* Sin prefijo, justo después de T7-1, y con ruta: si no, el índice lo dejaría muerto. */
  assert.equal(TEMA_T7_2, "inventarios-permanente");
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.indexOf(TEMA_T7_2), temas.indexOf("inventarios-periodico") + 1);
  assert.ok(VISTAS.has(TEMA_T7_2));
  assert.equal(vistaDeTema(TEMA_T7_2), TEMA_T7_2);
  const app = readFileSync(new URL("src/App.jsx", RAIZ), "utf8");
  assert.match(app, /if \(view === "inventarios-permanente"\) \{\s*return wrap\(\s*<Suspense fallback=\{siteFallback\}>\s*<ContabilidadT7_2View /);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(tema.actividades[0].id, A.A1_ID);
  assert.equal(PIEZAS_T7_2[0].pieza.id, A.A1_ID);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueSiSeMueve.jsx", "src/data/contabilidadT7_2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
