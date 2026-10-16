import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { PAQUETE_N6, CORRECCIONES_N6, conCorreccionesN6 } from "./correccionesMelloN6.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N6 «Lo que el ejemplo no trae» (Célula C). Aprender, sin FP.
 *
 *   · cada texto de los datos está, letra por letra, en el paquete v2 de Near
 *     con las correcciones obligatorias de Mello (N6-1 y N6-2), y cada texto
 *     del paquete está en los datos, en su pantalla y en su papel
 *   · la figura: lo que el paquete dice que aparece en cada pantalla y con
 *     cada respuesta sale de los datos; nunca muestra antes la cifra que se
 *     pregunta (E8)
 *   · montada, pantalla por pantalla y estado por estado: la pista al 1.er
 *     error, el «2.º error» de la opción elegida al segundo (y la pregunta se
 *     cierra), el acierto, la figura que crece, el foco y el pie
 *   · nada plegado (C7)
 *   · las cinco cifras construidas, como números en los datos
 *   · en el catálogo de T5 en su posición, sin FP ni migración, y en la vista
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

const N = await import("../../data/contabilidadT5_n6.js");
const A7 = await import("../../data/contabilidadT7_1_a7.js");
const { SUBJECTS, APRENDER, HACER } = await import("../../data/subjects.js");
const { default: LoQueElEjemploNoTrae, textoDelError } = await import("../../components/mecanicas/libros/t5/LoQueElEjemploNoTrae.jsx");
const { PIEZAS, TEMA } = await import("../../components/ContabilidadTema5View.jsx");
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const P = N.PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const pesos = (n) => `$${cifra(n)}`;
const LADO = { debe: "Debe", haber: "Haber" };

/* ═══════════ EL PAQUETE, CON LAS CORRECCIONES DE MELLO ═══════════ */

const MD = conCorreccionesN6(PAQUETE_N6);
const SECCION = MD.slice(MD.indexOf(`## ${N.N6_ID} · «`), MD.indexOf("## La figura"));

/* Los «…» de primer nivel de una línea (las comillas de dentro, como la cita de la p. 193, quedan en su texto). */
function citas(linea) {
  const out = [];
  let nivel = 0, actual = "";
  for (const c of linea) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, `las comillas no cierran: ${linea}`);
  return out;
}

/* Cada pantalla del paquete: id, tipo y sus textos por papel. */
function pantallasDelPaquete() {
  const out = [];
  let p = null;
  for (const l of SECCION.split("\n")) {
    const cab = l.match(/^\*\*P(\d) · `([^`]+)`\*\* \((\w+)\)/);
    if (cab) { p = { k: Number(cab[1]), id: cab[2], tipo: cab[3], simples: [], opciones: [], pista: null, segundos: [], acierto: null, figuraAcierto: null }; out.push(p); continue; }
    if (!p || !l.startsWith("- ")) continue;
    const resto = l.slice(2);
    if (resto.startsWith("Opciones o líneas: ")) { p.opciones = citas(resto); continue; }
    const pista = resto.match(/^\*pista \(1\.er error\):\* (.*)$/);
    if (pista) { p.pista = citas(pista[1])[0]; continue; }
    const seg = resto.match(/^\*2\.º error · (.+?):\* (.*)$/);
    if (seg) { p.segundos.push({ etiqueta: seg[1], texto: citas(seg[2])[0] }); continue; }
    const ac = resto.match(/^\*acierto:\* (.*)$/);
    if (ac) { const [t, f] = citas(ac[1]); p.acierto = t; p.figuraAcierto = f ?? null; continue; }
    p.simples.push(...citas(resto));
  }
  return out;
}
const PAQ = pantallasDelPaquete();

/* El paquete nombra la opción de cada «2.º error» por su texto, por «cualquier «Sí»» o por una palabra suya. */
function opcionesDeEtiqueta(p, etiqueta) {
  const malas = p.opciones.filter((o) => !o.correcta);
  const exacta = malas.filter((o) => o.texto === etiqueta);
  if (exacta.length) return exacta;
  const cualquier = etiqueta.match(/^cualquier «(.+)»$/);
  if (cualquier) return malas.filter((o) => o.texto.startsWith(`${cualquier[1]}:`));
  return malas.filter((o) => o.texto.toLowerCase().includes(etiqueta.toLowerCase()));
}

/* ═══════════ LA FIGURA, LEÍDA DE LOS DATOS ═══════════ */

const nombre = (id) => P.cuentas.find((c) => c.id === id).nombre;
const finalDe = (s) => (s ? [...s.figura.movimientos, ...(s.figura.alResolver?.movimientos ?? [])] : []);

/* Lo que el paquete escribe de la figura al llegar a una pantalla: lo que aparece en ella. */
function figuraAlLlegar(s, k) {
  if (s.tipo === "portada") return P.cuentas.map((c) => c.nombre);
  const antes = new Set(finalDe(P.pantallas[k - 1]));
  return [
    ...(s.figura.factura ?? []).map((r) => `${r.rot} ${pesos(r.monto)}`),
    ...(s.figura.ficha ? [`${s.figura.ficha.rot} ${pesos(s.figura.ficha.monto)}`] : []),
    ...s.figura.movimientos.filter((id) => !antes.has(id)).map((id) => { const m = P.movimientos[id]; return `${nombre(m.cuenta)} · ${LADO[m.lado]} ${pesos(m.monto)}`; }),
  ];
}
/* Y lo que cambia con la respuesta. */
function figuraAlResolver(s) {
  const r = s.figura.alResolver;
  if (!r) return null;
  const partes = [...(r.movimientos ?? []).map((id) => `${LADO[P.movimientos[id].lado]} ${pesos(P.movimientos[id].monto)}`), ...(r.nota ? [`${r.nota.texto} ${pesos(r.nota.monto)}`] : [])];
  return partes.join(" ");
}

/* ═══════════ 1 · TEXTOS, LETRA POR LETRA ═══════════ */

test("★★★ las correcciones de Mello se aplican: los textos viejos ya no están y los nuevos sí, en el paquete corregido y en los datos", () => {
  const datos = JSON.stringify(P);
  for (const [, campo, vieja, nueva] of CORRECCIONES_N6) {
    assert.ok(!MD.includes(vieja), `${campo}: sigue el viejo`);
    assert.ok(MD.includes(nueva), `${campo}: falta el nuevo`);
    assert.ok(!datos.includes(JSON.stringify(vieja.slice(1, -1)).slice(1, -1)), `${campo}: el texto viejo está en los datos`);
    assert.ok(datos.includes(JSON.stringify(nueva.slice(1, -1)).slice(1, -1)), `${campo}: el texto nuevo no está en los datos`);
  }
  /* N6-1: la condición no es de tiempo. N6-2: el caso y la pista de P3 no dicen «dividendo». */
  assert.ok(!/vino después|cuándo pasó|se paga después/.test(datos));
  const p3 = pantalla("el-dividendo");
  for (const t of [...p3.parrafos, p3.pista]) assert.doesNotMatch(t, /dividendo/i);
  assert.doesNotMatch(pantalla("portada").parrafos.join(" "), /dividendo/i);
});

test("★★★ las cinco pantallas del paquete, con su id y su tipo, en su orden", () => {
  assert.match(PAQUETE_N6, /^# T5 · N6 «Lo que el ejemplo no trae» · versión 2/m);
  assert.deepEqual(PAQ.map((p) => [p.id, p.tipo]), P.pantallas.map((s) => [s.id, s.tipo]));
  const medida = [...SECCION.matchAll(/^\| P(\d) \| `([^`]+)` \((\w+)\) \|/gm)].map((m) => [m[2], m[3]]);
  assert.deepEqual(medida, P.pantallas.map((s) => [s.id, s.tipo]));
  assert.ok(MD.includes(`id \`${N.N6_ID}\``));
  assert.ok(MD.includes(`## ${N.N6_ID} · «${P.titulo}»`));
});

test("★★★ cada pantalla trae exactamente los textos del paquete corregido, en su papel y en su orden", () => {
  for (const [k, s] of P.pantallas.entries()) {
    const q = PAQ[k];
    /* Lo que no es pregunta ni respuesta: la figura al llegar, el caso y la pregunta. */
    assert.deepEqual(q.simples, [...figuraAlLlegar(s, k), ...s.parrafos, ...(s.pregunta ? [s.pregunta] : [])], `${s.id}: textos`);
    if (s.tipo !== "eleccion") { assert.equal(s.opciones, undefined); continue; }
    /* Las opciones, en el orden del paquete; la primera es la correcta (la que Mello llama «opción correcta» en P2). */
    assert.deepEqual(s.opciones.map((o) => o.texto), q.opciones, `${s.id}: opciones`);
    assert.deepEqual(s.opciones.map((o) => o.correcta), [true, false, false], `${s.id}: la correcta`);
    assert.equal(s.pista, q.pista, `${s.id}: pista`);
    assert.equal(s.acierto.texto, q.acierto, `${s.id}: acierto`);
    assert.equal(figuraAlResolver(s), q.figuraAcierto, `${s.id}: la figura al acertar`);
    /* Cada opción equivocada tiene su «2.º error», y solo uno. */
    const malas = s.opciones.filter((o) => !o.correcta);
    const dados = new Map();
    for (const { etiqueta, texto } of q.segundos) {
      const ops = opcionesDeEtiqueta(s, etiqueta);
      assert.ok(ops.length > 0, `${s.id}: «2.º error · ${etiqueta}» no nombra ninguna opción`);
      for (const o of ops) { assert.ok(!dados.has(o.id), `${s.id}: ${o.id} con dos textos`); dados.set(o.id, texto); }
    }
    assert.deepEqual(malas.map((o) => o.segundoError), malas.map((o) => dados.get(o.id)), `${s.id}: los «2.º error»`);
    assert.equal(s.opciones.find((o) => o.correcta).segundoError, undefined);
  }
});

test("★★★ el pie del paquete va en cada pantalla con cifras (P1 a P4); la portada, sin cifras, va sin pie", () => {
  assert.ok(MD.includes(`El pie de cada pantalla con cifras dice: «${N.PIE}».`));
  assert.deepEqual(P.pantallas.map((s) => s.pie), [null, N.PIE, N.PIE, N.PIE, N.PIE]);
  /* Con cifras: las que traen algún monto en su figura. */
  assert.deepEqual(P.pantallas.map((s) => Boolean(s.figura.factura || s.figura.ficha || finalDe(s).length)), [false, true, true, true, true]);
});

test("★★ los botones e «Incorrecto.»/«Correcto.» son los de A7 de T7-1, como en N2", () => {
  assert.deepEqual(N.BOTON, A7.BOTON);
  assert.equal(N.INTERFAZ.correcto, A7.INTERFAZ.correcto);
  assert.equal(N.INTERFAZ.incorrecto, A7.INTERFAZ.incorrecto);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

function numerosDe(valor, vistos = new Set(), salida = new Set()) {
  if (typeof valor === "number" && Number.isFinite(valor)) salida.add(valor);
  else if (valor && typeof valor === "object" && !vistos.has(valor)) {
    vistos.add(valor);
    for (const v of Object.values(valor)) numerosDe(v, vistos, salida);
  }
  return salida;
}

test("★★★ las cinco cifras construidas están en los datos como números, y cuadran", () => {
  const nums = numerosDe(P);
  for (const c of [1210000, 18000, 1228000, 54000, 11000]) assert.ok(nums.has(c), `falta ${c} como número`);
  assert.equal(N.ACCIONES_N6 + N.GASTOS_N6, N.COSTO_N6);
  assert.deepEqual(N.CIFRAS_N6, { acciones: 1210000, gastos: 18000, costo: 1228000, dividendo: 54000, deposito: 11000 });
  /* Las opciones de P1 dicen su número. */
  for (const o of pantalla("la-compra").opciones) assert.equal(o.texto, pesos(o.valor));
  /* La compra entra por el costo; el dividendo, por lo que llega. */
  assert.deepEqual(Object.values(P.movimientos).map((m) => m.monto), [1228000, 1228000, 54000, 54000]);
  const archivo = readFileSync(new URL("src/data/contabilidadT5_n6.js", RAIZ), "utf8");
  assert.ok(archivo.includes(`"${N.N6_ID}"`), "la prueba del registro busca el archivo por su id entre comillas");
});

/* ═══════════ 3 · MONTADA ═══════════ */

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
const elegir = async (caja, id) => { await tocar(caja.querySelector(`[data-opcion="${id}"]`)); await tocar(boton(caja, "confirmar")); };

/* Lo que se lee fuera de la figura, en orden; las opciones aparte (van barajadas). */
function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.closest("[data-figura]")) continue;
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

/* La figura como datos: cada cuenta con sus montos por lado, la factura, la ficha y la nota. */
function figuraDe(caja) {
  const f = caja.querySelector("[data-figura]");
  assert.ok(f, "no hay figura");
  const cuentas = {};
  for (const c of f.querySelectorAll("[data-cuenta]")) {
    const lado = (l) => [...c.querySelectorAll(`[data-lado-t="${l}"] [data-mov]`)].map((m) => m.textContent);
    cuentas[c.dataset.cuenta] = { nombre: c.querySelector(".t73p-t-cuenta").textContent, atenuada: c.hasAttribute("data-atenuada"), debe: lado("debe"), haber: lado("haber") };
  }
  const fac = f.querySelector("[data-factura]");
  const ficha = f.querySelector("[data-ficha]");
  return {
    cuentas,
    factura: fac ? { renglones: [...fac.querySelectorAll("[data-renglon]")].map((r) => r.textContent), saliendo: fac.hasAttribute("data-saliendo") } : null,
    ficha: ficha ? { texto: ficha.textContent, saliendo: ficha.hasAttribute("data-saliendo") } : null,
    nota: f.querySelector("[data-nota]")?.textContent ?? null,
    texto: f.textContent,
  };
}

/* Lo que la figura debe mostrar: los montos de cada cuenta según los movimientos dados. */
function cuentasEsperadas(ids) {
  return Object.fromEntries(P.cuentas.map((c) => {
    const movs = ids.map((id) => P.movimientos[id]).filter((m) => m.cuenta === c.id);
    return [c.id, { nombre: c.nombre, atenuada: movs.length === 0, debe: movs.filter((m) => m.lado === "debe").map((m) => pesos(m.monto)), haber: movs.filter((m) => m.lado === "haber").map((m) => pesos(m.monto)) }];
  }));
}

function comprobarFigura(caja, s, resuelta, que) {
  const fig = figuraDe(caja);
  assert.deepEqual(fig.cuentas, cuentasEsperadas(resuelta ? finalDe(s) : s.figura.movimientos), `${que}: cuentas`);
  if (s.figura.factura) {
    /* E8: los dos renglones, sin su suma; al resolver, se pliega dentro de la cuenta. */
    assert.deepEqual(fig.factura?.renglones, s.figura.factura.map((r) => `${r.rot} ${pesos(r.monto)}`), `${que}: factura`);
    assert.equal(fig.factura.saliendo, resuelta, `${que}: la factura se pliega solo al resolver`);
  } else assert.equal(fig.factura, null, `${que}: no hay factura`);
  if (s.figura.ficha) {
    assert.equal(fig.ficha?.texto, `${s.figura.ficha.rot} ${pesos(s.figura.ficha.monto)}`, `${que}: ficha`);
    assert.equal(fig.ficha.saliendo, resuelta, `${que}: la ficha sale solo al resolver`);
  } else assert.equal(fig.ficha, null, `${que}: no hay ficha`);
  const nota = resuelta ? s.figura.alResolver?.nota : null;
  assert.equal(fig.nota, nota ? `${nota.texto} ${pesos(nota.monto)}` : null, `${que}: nota`);
  return fig;
}

const pieDe = (s) => (s.pie ? [s.pie] : []);

/* Una pregunta montada sola, desde su pantalla (como la mide la barra de enganche). */
const montarDesde = (s) => montar(h(LoQueElEjemploNoTrae, { pieza: { ...P, pantallas: P.pantallas.slice(P.pantallas.indexOf(s)) }, rotulo: "R" }));

test("★★★ escalera, 1.er error y acierto: la pista con «Probar otra», y luego el acierto; la figura crece solo con el acierto", async () => {
  for (const s of P.pantallas.filter((x) => x.tipo === "eleccion")) {
    const cab = [...s.parrafos, s.pregunta];
    const ops = s.opciones.map((o) => o.texto).sort();
    for (const mala of s.opciones.filter((o) => !o.correcta)) {
      const m = await montarDesde(s);
      try {
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, N.BOTON.confirmar, ...pieDe(s)], opciones: ops }, `${s.id} colocando`);
        const f0 = comprobarFigura(m.caja, s, false, `${s.id} colocando`);
        /* E8: lo que se pregunta no está en la figura antes de responder. */
        if (s.id === "la-compra") assert.ok(!f0.texto.includes(cifra(N.COSTO_N6)), "la suma de la factura se ve antes de responder");
        if (s.id === "el-dividendo") assert.deepEqual(f0.cuentas.dividendos.haber, []);
        assert.equal(m.caja.querySelector('[data-boton="confirmar"]').getAttribute("aria-disabled"), "true");

        await elegir(m.caja, mala.id);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, N.INTERFAZ.incorrecto, s.pista, N.BOTON.probarOtra, ...pieDe(s)], opciones: ops }, `${s.id} 1.er error (${mala.id})`);
        assert.ok(document.activeElement === m.caja.querySelector('[data-mensaje="error"]'), "el foco va al mensaje");
        assert.equal(m.caja.querySelector(`[data-opcion="${mala.id}"]`).classList.contains("t73p-op-error"), true);
        comprobarFigura(m.caja, s, false, `${s.id} 1.er error`);

        await tocar(boton(m.caja, "probar-otra"));
        assert.equal(m.caja.querySelector("[data-mensaje]"), null);
        await elegir(m.caja, s.opciones.find((o) => o.correcta).id);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, N.INTERFAZ.correcto, s.acierto.texto, N.BOTON.seguir, ...pieDe(s)], opciones: ops }, `${s.id} acierto`);
        assert.ok(document.activeElement === m.caja.querySelector('[data-mensaje="acierto"]'), "el foco va al mensaje");
        comprobarFigura(m.caja, s, true, `${s.id} acierto`);
        assert.equal(m.caja.querySelector("[data-correcta]"), null, "en el acierto no hace falta marcar la respuesta");
      } finally {
        m.desmontar();
      }
    }
  }
});

test("★★★ escalera, 2.º error: el texto «2.º error» de la opción elegida; la pregunta se cierra con la respuesta marcada y la figura crece", async () => {
  for (const s of P.pantallas.filter((x) => x.tipo === "eleccion")) {
    const cab = [...s.parrafos, s.pregunta];
    const ops = s.opciones.map((o) => o.texto).sort();
    const malas = s.opciones.filter((o) => !o.correcta);
    /* Toda combinación: el 2.º error con cada opción equivocada, después de fallar con cualquiera (la misma incluida). */
    for (const primera of malas) {
      for (const segunda of malas) {
        const m = await montarDesde(s);
        const que = `${s.id} ${primera.id} → ${segunda.id}`;
        try {
          await elegir(m.caja, primera.id);
          await tocar(boton(m.caja, "probar-otra"));
          await elegir(m.caja, segunda.id);
          assert.equal(textoDelError(s, segunda, 2), segunda.segundoError);
          assert.deepEqual(enPantalla(m.caja), { textos: [...cab, N.INTERFAZ.incorrecto, segunda.segundoError, N.BOTON.seguir, ...pieDe(s)], opciones: ops }, que);
          assert.equal(boton(m.caja, "probar-otra"), null, `${que}: ya no se vuelve a probar`);
          assert.ok(document.activeElement === m.caja.querySelector('[data-mensaje="error"]'), `${que}: foco`);
          /* La respuesta queda marcada con forma (✓ y borde), en neutro; todas las opciones quietas. */
          const marcada = m.caja.querySelector("[data-correcta]");
          assert.equal(marcada?.dataset.opcion, s.opciones.find((o) => o.correcta).id, `${que}: la respuesta marcada`);
          assert.ok(marcada.querySelector("svg"), `${que}: con ✓`);
          assert.ok([...m.caja.querySelectorAll("[data-opcion]")].every((b) => b.disabled), `${que}: opciones quietas`);
          comprobarFigura(m.caja, s, true, que);
        } finally {
          m.desmontar();
        }
      }
    }
  }
});

test("★★★ la pieza entera: de la portada al resumen, la figura de cada pantalla, el foco al cambiar y el resumen sin botón; nada plegado (C7)", async () => {
  const m = await montar(h(LoQueElEjemploNoTrae, { pieza: P, rotulo: "R" }));
  try {
    assert.ok(m.caja.textContent.includes(P.titulo));
    for (const [k, s] of P.pantallas.entries()) {
      const marco = m.caja.querySelector("[data-pieza]");
      assert.equal(marco.dataset.pantalla, s.id);
      assert.equal(marco.dataset.pieza, N.N6_ID);
      if (k > 0) assert.ok(document.activeElement === marco, `${s.id}: el foco va al marco`);
      /* B1: la figura es lo primero de cada pantalla, sin una palabra antes. */
      const primero = marco.querySelector("[data-texto], [data-figura]");
      assert.ok(primero.matches("[data-figura]"), `${s.id}: la figura no va primero`);
      assert.equal(m.caja.querySelectorAll("[data-por-que]").length, 0, `${s.id}: algo plegado`);
      if (s.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [...s.parrafos, ...(s.boton ? [s.boton] : []), ...pieDe(s)], s.id);
        comprobarFigura(m.caja, s, false, s.id);
        if (s.boton) await tocar(boton(m.caja, "empezar"));
        continue;
      }
      await elegir(m.caja, s.opciones.find((o) => o.correcta).id);
      assert.equal(m.caja.querySelectorAll("[data-por-que]").length, 0, `${s.id}: el acierto plegado`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Portada: las cuatro cuentas vacías y atenuadas. Resumen: las cuatro con todo lo anotado. */
    assert.ok(Object.values(cuentasEsperadas(pantalla("portada").figura.movimientos)).every((c) => c.atenuada));
    assert.ok(Object.values(figuraDe(m.caja).cuentas).every((c) => !c.atenuada));
    assert.equal(m.caja.querySelector("[data-boton]"), null, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★★ la tabla «La figura» del paquete: P1 pliega la factura en la compra, P2 deja la cuenta en $1.228.000, P3 no mueve la inversión", () => {
  const fig = MD.slice(MD.indexOf("## La figura"), MD.indexOf("## Notas"));
  for (const c of P.cuentas) assert.ok(fig.includes(c.nombre), c.nombre);
  const p1 = pantalla("la-compra").figura, p2 = pantalla("el-limite").figura, p3 = pantalla("el-dividendo").figura;
  assert.ok(fig.includes("| P1, acierto o 2.º error | La factura se pliega dentro de Inversiones – títulos: Debe $1.228.000. Bancos: Haber $1.228.000. |"));
  assert.deepEqual([p1.alResolver.factura, p1.alResolver.movimientos.map((id) => P.movimientos[id])], ["pliega", [{ cuenta: "inversiones", lado: "debe", monto: 1228000 }, { cuenta: "bancos", lado: "haber", monto: 1228000 }]]);
  assert.ok(fig.includes("| P2, acierto o 2.º error | La ficha «Depósito $11.000» rebota contra la cuenta y sale. La cuenta sigue en $1.228.000. |"));
  assert.deepEqual([p2.ficha.junto, p2.alResolver.ficha, p2.alResolver.movimientos], ["inversiones", "sale", []]);
  assert.ok(fig.includes("| P3, acierto o 2.º error | Caja: Debe $54.000. Ingresos por dividendos: Haber $54.000. Inversiones – títulos no se mueve. |"));
  assert.ok(p3.alResolver.movimientos.every((id) => P.movimientos[id].cuenta !== "inversiones"));
  assert.ok(fig.includes("En P1, la factura muestra los dos renglones, pero no su suma."));
});

test("★★ el componente no pliega nada ni usa la escalera de T7, cuyo 2.º error no es el del paquete", () => {
  const src = readFileSync(new URL("src/components/mecanicas/libros/t5/LoQueElEjemploNoTrae.jsx", RAIZ), "utf8");
  assert.doesNotMatch(src, /from\s+["'][^"']*\/(plegable|escaleraAyuda)(\.jsx?)?["']/);
  assert.doesNotMatch(src, /<Plegable\b|data-por-que/);
});

/* ═══════════ 4 · CATÁLOGO Y VISTA ═══════════ */

const tema = () => SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA);

test("★★★ fuera del catálogo de FP; en T5 en la posición de la decisión de corte; sin migración ni FP", () => {
  assert.equal(N.N6_ID, "t5-a2-lo-que-el-ejemplo-no-trae");
  assert.equal(TEMA, "activos-financieros");
  const a = tema().actividades.find((x) => x.id === N.N6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  /*
   * Punto 6 de la decisión de corte: la posición 9, después de N4 (7) y N5 (8)
   * y antes de N7 (10) y del cierre de Santa Pacha (11). N2 (posición 4) entró
   * en N3 con la entrega 5: el orden de lo publicado es el de la tabla sin él.
   */
  const corte = readFileSync(new URL("orquestador/conocimiento/mapas/t5-activos-financieros.md", RAIZ), "utf8");
  const tabla = [...corte.slice(corte.indexOf("6. **Orden final")).matchAll(/^ {3}\| (\d+) \| `([^`]+)`/gm)].map((m) => [Number(m[1]), m[2]]);
  assert.equal(tabla.length, 11);
  assert.deepEqual(tabla.find(([, id]) => id === N.N6_ID), [9, N.N6_ID]);
  const ids = tema().actividades.map((x) => x.id);
  assert.deepEqual(ids, tabla.map(([, id]) => id).filter((id) => ids.includes(id)), "el orden del tema no es el de la decisión de corte");
  assert.deepEqual(ids, [
    "b5-t5-a1-del-efectivo-de-sobra", "b5-t5-a1", "t5-temporal-o-largo-plazo", "t5-revision-que-falta",
    "b5-t5-a2-los-tres-momentos-de-una-inversion", "t5-el-interes-del-periodo", "t5-gano-o-perdio", N.N6_ID, "t5-a-que-cuenta-va", "b5-t5-a2",
  ]);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(N.N6_ID)), []);
  for (const f of ["src/data/contabilidadT5_n6.js", "src/components/mecanicas/libros/t5/LoQueElEjemploNoTrae.jsx"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
  /* Aprender no entra al camino de Hacer. */
  assert.ok(!tema().actividades.filter((x) => x.clasificacion.tipo === HACER).some((x) => x.id === N.N6_ID));
});

test("★★★ en pantalla no sale nada interno (construcción, hueco, nombres de la célula)", () => {
  const textos = [];
  const recoger = (v, clave = null) => {
    if (["id", "cuenta", "lado", "junto", "tipo", "factura", "ficha"].includes(clave) && typeof v === "string") return;
    if (typeof v === "string") textos.push(v);
    else if (Array.isArray(v)) v.forEach((x) => recoger(x));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) recoger(x, k);
  };
  recoger(P);
  const todo = textos.join("\n");
  for (const interno of ["CONSTRUCCIÓN", "HUECO", "Near", "Mello", "Watari", "INFLESZ", "C5-", "C7", "E8", "PENDIENTE"]) assert.ok(!todo.includes(interno), interno);
});

test("★★ la vista pinta N6 con su componente, la tercera pieza de Aprender del tema (N2 entró en N3), en el orden del catálogo", async () => {
  const { default: Vista } = await import("../../components/ContabilidadTema5View.jsx");
  assert.equal(typeof Vista, "function");
  const entrada = PIEZAS.find((x) => x.pieza.id === N.N6_ID);
  assert.equal(entrada.Pieza, LoQueElEjemploNoTrae);
  assert.equal(entrada.pieza, P);
  assert.deepEqual(PIEZAS.map((x) => x.pieza.id), tema().actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id));
  assert.equal(PIEZAS.indexOf(entrada) + 1, 3);
  assert.equal(PIEZAS.length, 3);
});
