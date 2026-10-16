import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex» renovada: el kárdex que crece (Patrón de enganche C2
 * de Watari, pieza 1), con K-1, K-2 y K-3 de Mello (auditoria-mello-patron-c2.md).
 *
 *   · la referencia (kardex.js, sacado del HTML del patrón) se ejecuta: sus
 *     pantallas, con K-1 y K-3 encima (correccionesMelloC2Kardex.mjs), son
 *     las de la pieza, texto por texto y en los dos sentidos; y sus textos
 *     son los de Near en main (contabilidadT7_2_a3.js), que la pieza lee
 *   · los textos nuevos de Mello están en los datos letra por letra; las
 *     fichas de K-1 casan con los kárdex de Near
 *   · montada, pantalla por pantalla y estado por estado: la tabla que crece,
 *     el deslizador (un paso, saltos, hacia atrás), la escalera (pista,
 *     devolución, la correcta en blanco), el acierto, K-2 (la prueba de
 *     Mello), K-3 (≤ 60 palabras), el foco, el resumen
 *   · el «mira esto» (lo que vuela y de dónde), el total que cuenta, y sin
 *     movimiento con prefers-reduced-motion
 *   · cuatro columnas desde 560 px; tres debajo
 *   · catálogo y vista: mismo id, misma posición, sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { prepararDom } = await import("./t7-3-recorte.mjs");
const w = prepararDom(JSDOM, VirtualConsole);

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2_a3.js");
const C2 = await import("../../data/contabilidadT7_2_a3_c2.js");
const M = await import("./correccionesMelloC2Kardex.mjs");
const X = await import("../../components/mecanicas/libros/t7/ElKardexQueCrece.jsx");
const { cifraK } = await import("../t7_2Kardex.js");
const { contarPalabras } = await import("../canonEnganche.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const ElKardex = X.default;
const P = X.PIEZA_KARDEX_C2;
const KX = A.KARDEX_A3;
const near = (id) => A.PIEZA_EL_KARDEX.pantallas.find((p) => p.id === id);
const pantalla = (id) => P.pantallas.find((p) => p.id === id);
const RAIZ = new URL("../../../", import.meta.url);

/* ═══════════ LA REFERENCIA, EJECUTADA ═══════════ */

const refDom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only", virtualConsole: new VirtualConsole() });
refDom.window.eval(M.KARDEX_JS);
const REF = refDom.window.C2Kardex;
/* Los objetos de la referencia son de otro reino; las funciones `listo` se guardan aparte. */
const copia = (x) => JSON.parse(JSON.stringify(x));
const REF_P = copia(REF.PANTALLAS);
const REF_LISTO = Object.fromEntries(REF.PANTALLAS.map((p) => [p.id, p.listo]));
const REF_K = copia(REF.K);
const CORREGIDA = M.conCorreccionesKX(REF_P);
/* Las constantes que la referencia no publica en `window`: MOV y TABLA, de su código. */
const deCodigo = (nombre, previo = "") => {
  const ini = M.KARDEX_JS.indexOf(`const ${nombre} = `);
  let n = 0, i = M.KARDEX_JS.indexOf(/[[{]/.exec(M.KARDEX_JS.slice(ini))[0], ini);
  const abre = i;
  for (; i < M.KARDEX_JS.length; i++) { if ("[{".includes(M.KARDEX_JS[i])) n++; else if ("]}".includes(M.KARDEX_JS[i]) && --n === 0) break; }
  return new Function(`${previo}\nreturn ${M.KARDEX_JS.slice(abre, i + 1)};`)();
};
const REF_MOV = deCodigo("MOV");
const REF_TABLA = deCodigo("TABLA", M.KARDEX_JS.match(/const UEPS = [^;]+;/)[0]);

/* ═══════════ 1 · TEXTOS: REFERENCIA, NEAR, MELLO Y LA PIEZA ═══════════ */

test("★★★ la referencia es la del patrón: siete pantallas, la tabla «Pantalla por pantalla» y su código", () => {
  assert.equal(REF_P.length, 7);
  assert.deepEqual(REF_P.map((p) => p.id), ["portada", "los-datos", "peps", "ueps", "promedio", "lado-a-lado", "resumen"]);
  assert.deepEqual(M.TABLA_KX.map((t) => t.texto), REF_P.map((p) => p.texto));
  assert.match(M.SECCION_KX, /Reemplaza la pieza de hoy, <code>t7-2-a3-el-kardex<\/code>/);
  /* El código que juega la página es el que se publica como referencia (salvo líneas en blanco, como lo vio Mello). */
  const sinBlancos = (t) => t.split("\n").filter((l) => l.trim()).join("\n");
  const cuerpo = sinBlancos(M.KARDEX_JS.slice(M.KARDEX_JS.indexOf("(function () {"), M.KARDEX_JS.indexOf("window.C2Kardex = function")));
  assert.ok(sinBlancos(M.C2_HTML).includes(cuerpo));
});

test("★★★ los tres kárdex de la referencia son KARDEX_A3 de Near, celda por celda", () => {
  for (const m of ["peps", "ueps", "promedio"]) {
    assert.equal(REF_K[m].titulo, KX[m].titulo, m);
    assert.deepEqual(REF_K[m].filas, KX[m].filas.map((f) => Object.fromEntries(["en", "sa", "sal"].filter((k) => f[k]).map((k) => [k, f[k]]))), m);
  }
  assert.deepEqual(REF_MOV, near("los-datos").figuras[0].filas);
  assert.deepEqual(X.MOV_KX, near("los-datos").figuras[0].filas);
  assert.deepEqual(X.FECHAS_KX, ["1 jul", "5 jul", "9 jul", "14 jul", "20 jul"]);
  const t = near("lado-a-lado").tabla;
  assert.deepEqual(REF_TABLA.metodos.map((m) => m[1]), t.metodos);
  assert.deepEqual(REF_TABLA.filas, t.filas.map((f) => [f.rubro, f.valores]));
});

test("★★★ los textos de la referencia son los de Near en main, letra por letra", () => {
  const r = Object.fromEntries(REF_P.map((p) => [p.id, p]));
  assert.equal(r.portada.texto, near("portada").objetivo);
  assert.equal(r["los-datos"].texto, near("los-datos").parrafos.join(" "));
  assert.equal(r["los-datos"].debajo, near("los-datos").despues[0]);
  assert.equal(r.peps.texto, [...near("peps").parrafos, near("peps").pregunta].join(" "));
  assert.equal(r.ueps.texto, near("ueps").pregunta);
  assert.equal(r.promedio.texto, [...near("promedio").parrafos, near("promedio").pregunta].join(" "));
  assert.equal(r["lado-a-lado"].texto, near("lado-a-lado").pregunta);
  for (const id of ["peps", "ueps"]) {
    assert.equal(r[id].capa.pista, near(id).pista, id);
    assert.equal(r[id].bien, near(id).acierto.texto, id);
  }
  assert.equal(r.promedio.ficha.pista, near("promedio").pista);
  assert.deepEqual(r.promedio.fichas.map((f) => f.t), near("promedio").opciones.map((o) => o.texto));
  for (const [id, t] of Object.entries(r.promedio.ficha.mal)) assert.equal(t, near("promedio").opciones.find((o) => o.id === id).devolucion);
  assert.equal(r.promedio.bien, near("promedio").acierto.texto);
  assert.equal(r.promedio.porque, near("promedio").acierto.porque);
  assert.equal(r["lado-a-lado"].col.pista, near("lado-a-lado").pista);
  for (const [id, t] of Object.entries(r["lado-a-lado"].col.mal)) assert.equal(t, near("lado-a-lado").opciones.find((o) => o.id === id).devolucion);
  assert.equal(r["lado-a-lado"].bien, near("lado-a-lado").acierto.texto);
  /* El porqué de Near, entero, antes de K-3. */
  assert.equal(r["lado-a-lado"].porque, near("lado-a-lado").acierto.porque);
  assert.deepEqual(r.resumen.lista, near("resumen").lista);
  assert.equal(r.resumen.siguiente, near("resumen").siguiente);
  for (const p of REF_P) assert.equal(p.pie, near(p.id).pie, p.id);
  assert.equal(r.portada.boton, A.BOTON.empezar);
});

test("★★★ Mello, K-1/K-2/K-3: los textos nuevos están en los datos de la pieza, letra por letra", () => {
  for (const m of ["peps", "ueps"]) {
    assert.deepEqual(C2.FICHAS_K1[m].map((f) => f.texto), M.K1[m].fichas, m);
    assert.equal(C2.FICHAS_K1[m].find((f) => f.correcta).texto, M.K1[m].correcta, m);
    assert.equal(C2.FICHAS_K1[m].filter((f) => f.correcta).length, 1, m);
    /* Barajadas en pantalla: las tres, una vez cada una, y la correcta no va primero. */
    assert.deepEqual([...C2.ORDEN_EN_PANTALLA[m]].sort(), C2.FICHAS_K1[m].map((f) => f.id).sort(), m);
    assert.notEqual(C2.ORDEN_EN_PANTALLA[m][0], C2.FICHAS_K1[m].find((f) => f.correcta).id, m);
    for (const d of M.K1[m].devoluciones) {
      const f = C2.FICHAS_K1[m].find((x) => x.texto === d.ficha);
      if (d.nueva) assert.equal(f.devolucion, d.texto, `${m} · ${d.ficha}`);
      /* Las de Near: la ficha lleva el id de su opción en main, y la devolución de main es la que cita Mello. */
      else {
        assert.equal(f.devolucion, undefined, `${m} · ${d.ficha}: la devolución de Near no se copia`);
        assert.equal(near(m).opciones.find((o) => o.id === f.id).devolucion, d.texto, `${m} · ${d.ficha}`);
      }
    }
  }
  assert.equal(M.DEVOLUCIONES_NUEVAS[0].texto, "Así sería con UEPS. Con PEPS salen primero las más antiguas: las del inicio.");
  assert.equal(C2.SIGUE_HASTA_EL_20, M.SIGUE_HASTA_EL_20);
  assert.equal(C2.PORQUE_LADO_A_LADO, M.PORQUE_K3);
  /* K-3 es la primera frase del porqué de Near: no se escribe nada nuevo. */
  assert.ok(near("lado-a-lado").acierto.porque.startsWith(`${M.PORQUE_K3} `));
  assert.equal(contarPalabras(M.PORQUE_K3), 12);
  assert.equal(contarPalabras(M.DEVOLUCIONES_NUEVAS[0].texto), 14);
  assert.equal(contarPalabras(M.SIGUE_HASTA_EL_20), 6);
});

test("★★★ K-1: las fichas casan con los kárdex de Near (la correcta es la salida; «50 y 10», la de UEPS; «35 × 2.130» ya no está)", () => {
  const salida = (m, i) => KX[m].filas[i].sa.map((c) => `${c[0]} × ${cifraK(c[1])}`).join(" y ");
  assert.equal(M.K1.peps.correcta, salida("peps", 2));
  assert.equal(M.K1.ueps.correcta, salida("ueps", 4));
  assert.equal(C2.FICHAS_K1.peps.find((f) => f.id === "como-ueps").texto, salida("ueps", 2));
  /* Las tres de cada pantalla suman lo que se vende: 60 el 9 y 35 el 20. */
  const unidades = (t) => [...t.matchAll(/(\d+) ×/g)].reduce((s, m) => s + Number(m[1]), 0);
  for (const f of C2.FICHAS_K1.peps) assert.equal(unidades(f.texto), 60, f.texto);
  for (const f of C2.FICHAS_K1.ueps) assert.equal(unidades(f.texto), 35, f.texto);
  assert.ok(!KX.ueps.filas[3].sal.some((c) => c[1] === 2130), "el 19 de julio ya no quedan del 5");
  /* La ficha correcta no se delata por el largo: mide lo mismo que uno de los distractores. */
  for (const m of ["peps", "ueps"]) {
    const [c, ...d] = M.K1[m].fichas;
    assert.ok(d.some((x) => x.length === c.length), m);
  }
});

/* Lo que se puede leer en una pantalla de la pieza, y en una de la referencia corregida (con sus nombres de campo). */
const visibles = (p) => [p.texto, p.debajo, p.pista, p.bien, p.porque, p.boton, p.pie, p.siguiente, ...(p.lista ?? []),
  ...(p.fichas ?? []).flatMap((f) => [f.t, f.devolucion]), ...(p.metodos ?? []).flatMap((x) => [x.t, x.devolucion])].filter(Boolean);
const visiblesRef = (c) => [c.texto, c.debajo, c.pista ?? c.ficha?.pista ?? c.col?.pista, c.bien, c.porque, c.boton, c.pie, c.siguiente, ...(c.lista ?? []),
  ...(c.fichasK1 ?? []).flatMap((f) => [f.t, f.devolucion]), ...(c.fichas ?? []).flatMap((f) => [f.t, c.ficha.mal[f.id]]),
  ...(c.col ? REF_TABLA.metodos.flatMap(([id, t]) => [t, c.col.mal[id]]) : [])].filter(Boolean);

test("★★★ las pantallas de la pieza son las de la referencia con K-1 y K-3, campo por campo y en los dos sentidos", () => {
  assert.equal(P.pantallas.length, CORREGIDA.length);
  for (const [k, c] of CORREGIDA.entries()) {
    const p = P.pantallas[k];
    assert.equal(p.id, c.id);
    for (const campo of ["texto", "metodo", "idx", "espera", "debajo", "bien", "porque", "lista", "siguiente", "pie"]) assert.deepEqual(p[campo] ?? null, c[campo] ?? null, `${c.id} · ${campo}`);
    assert.deepEqual(p.rango ?? null, c.rango ?? null, `${c.id} · rango`);
    assert.equal(Boolean(p.porqueALaVista), Boolean(c.porqueALaVista), `${c.id} · porqueALaVista`);
    assert.equal(p.boton ?? A.BOTON.seguir, c.boton ?? "Seguir", `${c.id} · botón`);
    const pista = c.pista ?? c.ficha?.pista ?? c.col?.pista ?? null;
    assert.equal(p.pista ?? null, pista, `${c.id} · pista`);
    /* Las fichas: las de K-1 (o las del promedio de la referencia), con su devolución al 2.º error. */
    if (c.fichasK1) {
      const orden = C2.ORDEN_EN_PANTALLA[c.id].map((id) => C2.FICHAS_K1[c.id].find((f) => f.id === id).texto);
      assert.deepEqual(p.fichas.map((f) => f.t), orden, `${c.id} · fichas en pantalla`);
      assert.deepEqual(p.fichas.map(({ t, correcta, devolucion }) => ({ t, correcta, devolucion })).sort((a, b) => a.t.localeCompare(b.t)), [...c.fichasK1].sort((a, b) => a.t.localeCompare(b.t)), c.id);
    } else if (c.fichas) {
      assert.deepEqual(p.fichas.map(({ t, correcta, devolucion }) => ({ t, correcta, devolucion })), c.fichas.map((f) => ({ t: f.t, correcta: f.id === c.ficha.correcta, devolucion: c.ficha.mal[f.id] ?? null })), c.id);
    } else assert.equal(p.fichas, undefined, c.id);
    if (c.col) {
      assert.deepEqual(p.metodos.map(({ id, t, correcta, devolucion }) => ({ id, t, correcta, devolucion })), REF_TABLA.metodos.map(([id, t]) => ({ id, t, correcta: id === c.col.correcta, devolucion: c.col.mal[id] ?? null })));
      assert.deepEqual(p.tabla.filas, REF_TABLA.filas);
      assert.equal(p.tabla.nombre, A.PENDIENTE_DE_REVISION.nombreTabla);
    } else assert.equal(p.metodos, undefined, c.id);
  }
  /* En los dos sentidos: ningún texto visible de más ni de menos. */
  const deLaPieza = P.pantallas.flatMap(visibles).sort();
  const deLaRef = CORREGIDA.flatMap(visiblesRef).sort();
  assert.deepEqual(deLaPieza, deLaRef);
});

test("★★★ cuándo se puede seguir: lo mismo que la referencia, estado por estado", () => {
  const estados = [];
  for (const resuelto of [false, true]) for (let visto = 0; visto <= 4; visto++) estados.push({ resuelto, visto });
  for (const p of P.pantallas) {
    for (const e of estados) {
      const ref = REF_LISTO[p.id] ? Boolean(REF_LISTO[p.id]({ visto: e.visto, resuelto: { [p.id]: e.resuelto } })) : true;
      const pieza = X.listoKX(p, { ...e, idx: e.visto });
      assert.equal(pieza, p.boton ? true : ref, `${p.id} · ${JSON.stringify(e)}`);
    }
  }
});

test("★★★ K-2, la regla: el acierto solo en la fecha de la pregunta; fuera, «Sigue…» o nada", () => {
  for (const p of P.pantallas.filter((x) => x.espera !== undefined)) {
    for (let idx = 0; idx <= 4; idx++) for (let visto = idx; visto <= 4; visto++) {
      const s = { resuelto: true, errores: 0, idx, visto };
      const m = X.mensajeKX(p, s);
      const esperado = M.mensajeK2({ resuelta: true, idx, espera: p.espera, listo: X.listoKX(p, s), acierto: p.bien });
      assert.equal(m?.t ?? "", esperado, `${p.id} · idx ${idx} · visto ${visto}`);
    }
  }
});

test("★★★ los rótulos [W] son los de Watari, y los pide a Near", () => {
  const R = C2.ROTULOS_W;
  assert.deepEqual([R.fecha, R.entradas, R.salidas, R.saldo, R.entraOSale, R.entra, R.sale], M.ROTULOS_PEDIDOS);
  for (const t of [R.correcto, R.noVaAqui, R.siguientePieza, R.kardex, R.costoPromedio, R.pantalla(3, 7)]) assert.ok(M.KARDEX_JS.includes(t.replace("3 de 7", "${s.p + 1} de ${PANTALLAS.length}")), t);
  /* La marca va en comentario, nunca en pantalla. */
  assert.match(readFileSync(new URL("src/data/contabilidadT7_2_a3_c2.js", RAIZ), "utf8"), /\[W\] provisional, pendiente de Near/);
});

test("★★★ estilo: sin teal ni ámbar, letra de 12 px o más, objetivos de 44 px, y sin movimiento con prefers-reduced-motion", () => {
  const css = X.CSS_KX;
  for (const c of ["#2A9D8F", "#3FA69A", "#E9C46A", "--teal", "--ambar"]) assert.ok(!css.includes(c), c);
  const tamanos = [...css.matchAll(/font-size:\s*([\d.]+)px|\bfont:\s*(?:\d{3}\s+)?([\d.]+)px/g)].map((m) => Number(m[1] ?? m[2]));
  assert.ok(tamanos.length > 15);
  assert.deepEqual(tamanos.filter((t) => t < 12), []);
  const regla = (sel) => css.match(new RegExp(`\\n${sel.replace(/[.*]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? "";
  for (const sel of [".ekx-ficha", ".ekx-l-met", ".ekx-porque", ".ekx-seguir"]) assert.match(regla(sel), /min-height: 44px/, sel);
  assert.match(regla(".ekx-rango"), /height: 44px/);
  assert.match(css, /::-webkit-slider-thumb \{[^}]*width: 44px; height: 44px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.ekx \*, \.ekx \*::before, \.ekx \*::after \{ animation: none !important; transition: none !important; \} \}/);
  /* Aprender: nunca «Iba aquí». */
  const fuente = readFileSync(new URL("src/components/mecanicas/libros/t7/ElKardexQueCrece.jsx", RAIZ), "utf8");
  assert.ok(!/Iba aqu[ií]/.test(fuente.replace(/\/\*[\s\S]*?\*\//g, "")));
});

/* ═══════════ 2 · MONTADA ═══════════ */

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
const valorNativo = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
const deslizar = async (caja, i) => {
  const input = caja.querySelector(".ekx-rango");
  assert.ok(input, "no está el deslizador");
  await act(async () => { valorNativo.call(input, String(i)); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};

const capaVista = (n) => [n.querySelector(".ekx-cu").textContent, n.querySelector(".ekx-tot").textContent];
const capaDato = (c) => [`${c[0]} × ${cifraK(c[1])}`, cifraK(c[2])];
/* Lo que pinta la tabla, fila por fila (sin la pendiente). */
const filasVistas = (caja) => [...caja.querySelectorAll("[data-tabla] [data-fila]:not([data-pendiente])")].map((r) => ({
  f: r.querySelector("[role=rowheader]").textContent,
  entradas: [...r.querySelectorAll('[data-bloque="entradas"] .ekx-capa')].map(capaVista),
  salidas: [...r.querySelectorAll('[data-bloque="salidas"] .ekx-capa')].map(capaVista),
  saldo: [...r.querySelectorAll('[data-bloque="saldo"] .ekx-capa')].map(capaVista),
}));
const filasDatos = (m, hasta) => KX[m].filas.slice(0, hasta + 1).map((f) => ({ f: f.f, entradas: (f.en ?? []).map(capaDato), salidas: (f.sa ?? []).map(capaDato), saldo: f.sal.map(capaDato) }));
const nuevas = (caja) => [...caja.querySelectorAll(".ekx-fila.nueva")].map((r) => r.dataset.fila);

function retrato(caja) {
  const q = (s) => caja.querySelector(s);
  const msg = q("[role=status]");
  const rango = q(".ekx-rango");
  const seguir = q(".ekx-seguir");
  return {
    pantalla: q("[data-pieza]").dataset.pantalla,
    cejilla: q(".ekx-cejilla").textContent,
    texto: q("[data-texto]").hidden ? null : q("[data-texto]").textContent,
    metodo: q("[data-metodo]").hidden ? null : q("[data-metodo]").textContent,
    dia: q("[data-dia]").hidden ? null : [q("[data-dia]").textContent, q("[data-dia]").classList.contains("espera")],
    pendiente: q("[data-pendiente]")?.dataset.fila ?? null,
    fichas: [...caja.querySelectorAll("[data-ficha]")].map((b) => [b.dataset.ficha, b.textContent, ["mal", "pista"].filter((c) => b.classList.contains(c)).join(" ")]),
    rango: q(".ekx-control").hidden ? null : { valor: rango.value, rango: rango.dataset.rango, quieto: rango.getAttribute("aria-disabled"), tab: rango.tabIndex, texto: rango.getAttribute("aria-valuetext") },
    mensaje: { tipo: msg.dataset.mensaje ?? null, texto: msg.querySelector("[data-mensaje-texto]")?.textContent ?? "", mal: msg.classList.contains("mal") },
    seguir: [seguir.textContent, seguir.getAttribute("aria-disabled"), seguir.dataset.boton],
    pie: q("[data-pie]").textContent,
  };
}
const mensaje = (caja) => retrato(caja).mensaje;
const enFoco = (caja, sel) => assert.equal(document.activeElement, caja.querySelector(sel), `el foco no está en ${sel}`);
/* Lo de dentro que nunca se ve. */
const sinMarcas = (caja) => {
  const visto = [...caja.querySelectorAll("*")].filter((e) => e.tagName !== "STYLE" && !e.closest("style")).map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("")).join(" ");
  for (const t of ["Near", "Mello", "[W]", "ESCRITO POR CLAUDE", "PENDIENTE", "Iba aquí"]) assert.ok(!visto.includes(t), `${t}: ${visto.slice(Math.max(0, visto.indexOf(t) - 60), visto.indexOf(t) + 20)}`);
};

test("★★★ montada: las siete pantallas, estado por estado (tabla, deslizador, escalera, acierto, K-2, foco)", async () => {
  const m = await montar(h(ElKardex, { pieza: P, rotulo: "PIEZA 3 DE 5" }));
  const { caja } = m;
  const ficha = (id) => caja.querySelector(`[data-ficha="${id}"]`);
  try {
    /* 1 · Portada: la tabla atenuada con el 1 de julio; sin deslizador. */
    let r = retrato(caja);
    assert.equal(r.cejilla, "Pantalla 1 de 7");
    assert.equal(r.texto, near("portada").objetivo);
    assert.ok(caja.querySelector(".ekx").classList.contains("dormida"));
    assert.equal(r.rango, null);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 0));
    assert.deepEqual(r.seguir, ["Empezar", "false", "empezar"]);
    assert.equal(r.pie, near("portada").pie);
    assert.equal(r.mensaje.tipo, null);
    sinMarcas(caja);
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 2 · Los datos: la fecha hasta el 5; un paso anima, hacia atrás no. */
    r = retrato(caja);
    assert.equal(r.pantalla, "los-datos");
    enFoco(caja, "[data-texto]");
    assert.equal(r.texto, near("los-datos").parrafos[0]);
    assert.equal(caja.querySelector("[data-debajo]").textContent, near("los-datos").despues[0]);
    assert.deepEqual(r.rango, { valor: "0", rango: "0-1", quieto: "false", tab: 0, texto: X.MOV_KX[0] });
    assert.deepEqual(r.dia, [X.MOV_KX[0], false]);
    assert.deepEqual(r.seguir, ["Seguir", "true", "seguir"]);
    await tocar(caja.querySelector(".ekx-seguir"));
    assert.equal(retrato(caja).pantalla, "los-datos", "Seguir bloqueado no avanza");
    await deslizar(caja, 1);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 1));
    assert.deepEqual(nuevas(caja), ["1"]);
    assert.deepEqual(retrato(caja).dia, [X.MOV_KX[1], false]);
    assert.equal(retrato(caja).seguir[1], "false");
    await deslizar(caja, 0);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 0));
    assert.deepEqual(nuevas(caja), []);
    /* Más allá del 5, el deslizador se queda en el 5 (la pantalla solo llega ahí). */
    await deslizar(caja, 4);
    assert.equal(retrato(caja).rango.valor, "1");
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 1));
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 3 · PEPS: la venta del 9 espera con su hueco en Salidas; K-1: tres fichas. */
    r = retrato(caja);
    assert.equal(r.pantalla, "peps");
    assert.equal(r.texto, `${near("peps").parrafos[0]} ${near("peps").pregunta}`);
    assert.equal(r.metodo, KX.peps.titulo);
    assert.deepEqual(r.dia, [X.MOV_KX[2], true]);
    assert.equal(r.pendiente, "2");
    assert.ok(caja.querySelector('[data-pendiente] [data-bloque="salidas"] [data-hueco]'));
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 1));
    assert.deepEqual(r.fichas, [["solo-5", "60 × 2.130", ""], ["inicio-y-5", "30 × 2.010 y 30 × 2.130", ""], ["como-ueps", "50 × 2.130 y 10 × 2.010", ""]]);
    assert.equal(caja.querySelector("[data-fichas]").getAttribute("aria-label"), "Salidas");
    assert.deepEqual(r.rango, { valor: "1", rango: "1-1", quieto: "true", tab: -1, texto: X.MOV_KX[1] });
    assert.equal(r.seguir[1], "true");
    /* El deslizador no se mueve mientras la pregunta espera. */
    await deslizar(caja, 3);
    assert.equal(retrato(caja).rango.valor, "1");
    /* 1.er error: la pista; lo tocado, en coral con «No va aquí». */
    await tocar(ficha("como-ueps"));
    r = retrato(caja);
    assert.deepEqual(r.mensaje, { tipo: "error", texto: `Incorrecto. ${near("peps").pista}`, mal: true });
    assert.deepEqual(r.fichas.map((f) => f[2]), ["", "", "mal"]);
    assert.equal(ficha("como-ueps").querySelector("[data-pastilla]").textContent, "No va aquí");
    assert.equal(ficha("como-ueps").getAttribute("aria-label"), "50 × 2.130 y 10 × 2.010. Incorrecto.");
    enFoco(caja, "[role=status]");
    /* 2.º error: la devolución de Near y la correcta con borde blanco. */
    await tocar(ficha("solo-5"));
    r = retrato(caja);
    assert.deepEqual(r.mensaje, { tipo: "devolucion", texto: `Incorrecto. ${near("peps").opciones.find((o) => o.id === "solo-5").devolucion}`, mal: true });
    assert.deepEqual(r.fichas.map((f) => f[2]), ["mal", "pista", ""]);
    /* 3.er error: la devolución nueva de Mello. */
    await tocar(ficha("como-ueps"));
    assert.deepEqual(mensaje(caja), { tipo: "devolucion", texto: `Incorrecto. ${M.DEVOLUCIONES_NUEVAS[0].texto}`, mal: true });
    assert.equal(retrato(caja).pendiente, "2");
    /* Acierto: la venta corta las dos capas; el saldo queda en 20 × 2.130. */
    await tocar(ficha("inicio-y-5"));
    r = retrato(caja);
    assert.deepEqual(r.mensaje, { tipo: "acierto", texto: `Correcto${near("peps").acierto.texto}`, mal: false });
    assert.equal(caja.querySelector("[role=status] [data-pastilla]").textContent, "Correcto");
    enFoco(caja, "[role=status]");
    assert.deepEqual(r.fichas, []);
    assert.equal(r.pendiente, null);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 2));
    assert.deepEqual(nuevas(caja), ["2"]);
    assert.deepEqual(r.rango, { valor: "2", rango: "0-4", quieto: "false", tab: 0, texto: X.MOV_KX[2] });
    assert.deepEqual(r.seguir, ["Seguir", "true", "seguir"]);
    /* K-2: fuera del 9 y sin haber llegado al 20, «Sigue hasta el 20 de julio.»; en el 9, otra vez el acierto. */
    await deslizar(caja, 3);
    assert.deepEqual(mensaje(caja), { tipo: "sigue", texto: M.SIGUE_HASTA_EL_20, mal: false });
    assert.equal(caja.querySelector("[role=status] [data-pastilla]"), null);
    assert.deepEqual(nuevas(caja), ["3"]);
    await deslizar(caja, 2);
    assert.equal(mensaje(caja).tipo, "acierto");
    assert.deepEqual(nuevas(caja), []);
    await deslizar(caja, 4);
    assert.deepEqual(mensaje(caja), { tipo: null, texto: "", mal: false });
    assert.equal(caja.querySelector("[role=status]").textContent, "");
    assert.deepEqual(nuevas(caja), [], "a saltos no se anima");
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 4));
    assert.equal(retrato(caja).seguir[1], "false");
    await deslizar(caja, 3);
    assert.deepEqual(mensaje(caja), { tipo: null, texto: "", mal: false }, "ya llegó al 20: nada");
    await deslizar(caja, 2);
    assert.equal(mensaje(caja).texto, `Correcto${near("peps").acierto.texto}`);
    sinMarcas(caja);
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 4 · UEPS: el saldo del 19 y la venta del 20 esperando. */
    r = retrato(caja);
    assert.equal(r.pantalla, "ueps");
    enFoco(caja, "[data-texto]");
    assert.equal(r.texto, near("ueps").pregunta);
    assert.equal(r.metodo, `Método ${A.UEPS}`);
    assert.deepEqual(filasVistas(caja), filasDatos("ueps", 3));
    assert.equal(r.pendiente, "4");
    assert.deepEqual(r.fichas.map((f) => f.slice(0, 2)), [["inicio-y-14", "20 × 2.010 y 15 × 2.250"], ["del-5", "35 × 2.130"], ["del-14", "35 × 2.250"]]);
    await tocar(ficha("del-5"));
    assert.deepEqual(mensaje(caja), { tipo: "error", texto: `Incorrecto. ${near("ueps").pista}`, mal: true });
    await tocar(ficha("inicio-y-14"));
    assert.deepEqual(mensaje(caja), { tipo: "devolucion", texto: `Incorrecto. ${near("ueps").opciones.find((o) => o.id === "inicio-y-14").devolucion}`, mal: true });
    assert.deepEqual(retrato(caja).fichas.map((f) => f[2]), ["mal", "", "pista"]);
    await tocar(ficha("del-5"));
    assert.deepEqual(mensaje(caja), { tipo: "devolucion", texto: `Incorrecto. ${near("ueps").opciones.find((o) => o.id === "del-5").devolucion}`, mal: true });
    await tocar(ficha("del-14"));
    assert.equal(mensaje(caja).texto, `Correcto${near("ueps").acierto.texto}`);
    assert.deepEqual(filasVistas(caja), filasDatos("ueps", 4));
    assert.equal(retrato(caja).seguir[1], "false");
    await deslizar(caja, 1);
    assert.deepEqual(mensaje(caja), { tipo: null, texto: "", mal: false }, "UEPS ya está lista: nada");
    assert.deepEqual(filasVistas(caja), filasDatos("ueps", 1));
    await deslizar(caja, 4);
    assert.equal(mensaje(caja).tipo, "acierto");
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 5 · Promedio: la compra del 14 entra y el costo unitario del saldo es un hueco. */
    r = retrato(caja);
    assert.equal(r.pantalla, "promedio");
    assert.equal(r.texto, `${near("promedio").parrafos[0]} ${near("promedio").pregunta}`);
    assert.equal(r.metodo, KX.promedio.titulo);
    assert.deepEqual(filasVistas(caja), filasDatos("promedio", 2));
    const pend = caja.querySelector("[data-pendiente]");
    assert.deepEqual([...pend.querySelectorAll('[data-bloque="entradas"] .ekx-capa')].map(capaVista), KX.promedio.filas[3].en.map(capaDato));
    assert.ok(pend.querySelector('[data-bloque="saldo"] [data-hueco-cu]'));
    assert.equal(pend.querySelector('[data-bloque="saldo"] .ekx-cu').textContent, "60 × ");
    assert.equal(caja.querySelector("[data-fichas]").getAttribute("aria-label"), "Costo promedio");
    assert.deepEqual(r.fichas.map((f) => f[1]), near("promedio").opciones.map((o) => o.texto));
    await tocar(ficha("2250"));
    assert.deepEqual(mensaje(caja), { tipo: "error", texto: `Incorrecto. ${near("promedio").pista}`, mal: true });
    await tocar(ficha("2140"));
    assert.deepEqual(mensaje(caja), { tipo: "devolucion", texto: `Incorrecto. ${near("promedio").opciones.find((o) => o.id === "2140").devolucion}`, mal: true });
    await tocar(ficha("2195"));
    assert.equal(mensaje(caja).texto, `Correcto${near("promedio").acierto.texto}`);
    assert.deepEqual(filasVistas(caja), filasDatos("promedio", 3));
    /* El «¿Por qué?» del promedio se abre con su botón (aria-expanded). */
    const pq = caja.querySelector('[data-boton="por-que"]');
    assert.equal(pq.textContent, "¿Por qué?");
    assert.equal(pq.getAttribute("aria-expanded"), "false");
    assert.equal(caja.querySelector("[data-porque]").hidden, true);
    await tocar(pq);
    assert.equal(caja.querySelector('[data-boton="por-que"]').getAttribute("aria-expanded"), "true");
    assert.equal(caja.querySelector("[data-porque]").hidden, false);
    assert.equal(caja.querySelector("[data-porque]").textContent, near("promedio").acierto.porque);
    await deslizar(caja, 0);
    assert.deepEqual(mensaje(caja), { tipo: null, texto: "", mal: false });
    await deslizar(caja, 3);
    assert.equal(mensaje(caja).tipo, "acierto");
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 6 · Lado a lado: la tabla de Near, tres métodos que se tocan. */
    r = retrato(caja);
    assert.equal(r.pantalla, "lado-a-lado");
    assert.equal(r.texto, near("lado-a-lado").pregunta);
    assert.equal(r.metodo, null);
    assert.equal(r.dia, null);
    assert.equal(r.rango, null);
    assert.equal(caja.querySelector("[data-tabla]"), null);
    const lado = caja.querySelector("[data-lado]");
    const t = near("lado-a-lado").tabla;
    assert.equal(lado.getAttribute("aria-label"), t.nombre);
    assert.deepEqual([...lado.querySelectorAll(".ekx-l-cab span")].map((s) => s.textContent), t.filas.map((f) => f.rubro));
    const met = (id) => lado.querySelector(`[data-metodo-lado="${id}"]`);
    assert.deepEqual([...lado.querySelectorAll("[data-metodo-lado]")].map((b) => [b.dataset.metodoLado, b.querySelector(".ekx-l-tit").textContent, [...b.querySelectorAll(".ekx-l-v")].map((v) => v.textContent)]),
      near("lado-a-lado").opciones.map((o, k) => [o.id, t.metodos[k], t.filas.map((f) => cifraK(f.valores[k]))]));
    assert.equal(met("ueps").getAttribute("aria-label"), `${A.UEPS}. ${t.filas.map((f) => `${f.rubro}: ${cifraK(f.valores[1])}`).join("; ")}`);
    await tocar(met("ueps"));
    assert.deepEqual(mensaje(caja), { tipo: "error", texto: `Incorrecto. ${near("lado-a-lado").pista}`, mal: true });
    assert.ok(met("ueps").classList.contains("mal"));
    assert.ok(met("ueps").getAttribute("aria-label").endsWith(". Incorrecto."));
    await tocar(met("promedio"));
    assert.deepEqual(mensaje(caja), { tipo: "devolucion", texto: `Incorrecto. ${near("lado-a-lado").opciones.find((o) => o.id === "promedio").devolucion}`, mal: true });
    assert.ok(met("peps").classList.contains("pista"));
    await tocar(met("peps"));
    r = retrato(caja);
    assert.equal(r.mensaje.texto, `Correcto${near("lado-a-lado").acierto.texto}`);
    enFoco(caja, "[role=status]");
    /* K-3: el porqué a la vista es el de Mello, sin botón; la frase que salía ya no está. */
    assert.equal(caja.querySelector('[data-boton="por-que"]'), null);
    assert.equal(caja.querySelector("[data-porque]").hidden, false);
    assert.equal(caja.querySelector("[data-porque]").textContent, M.PORQUE_K3);
    assert.ok(!caja.textContent.includes("solo revisa"));
    assert.ok(met("peps").classList.contains("bien"));
    assert.equal(met("peps").querySelector("[data-pastilla]").textContent, "Correcto");
    assert.deepEqual([...met("peps").querySelectorAll(".ekx-l-v")].map((v) => v.classList.contains("igual")), [true, false, true]);
    for (const id of ["peps", "ueps", "promedio"]) assert.equal(met(id).getAttribute("aria-disabled"), "true");
    assert.ok(met("peps").getAttribute("aria-label").endsWith(". Correcto."));
    await tocar(met("ueps"));
    assert.equal(mensaje(caja).tipo, "acierto", "resuelta, ya no califica");
    /* K-3 · la cuenta de Mello: texto, rótulos de la tabla, acierto y porqué ≤ 60 (54). */
    const palabras = contarPalabras(caja.querySelector("[data-texto]").textContent)
      + [...lado.querySelectorAll(".ekx-l-cab span")].reduce((s, x) => s + contarPalabras(x.textContent), 0)
      + [...lado.querySelectorAll("[data-metodo-lado]")].reduce((s, b) => s + contarPalabras(b.querySelector(".ekx-l-tit").firstChild.textContent), 0)
      + contarPalabras(near("lado-a-lado").acierto.texto) + contarPalabras(caja.querySelector("[data-porque]").textContent);
    /* Mello cuenta 54 (19 de rótulos); con el contador del canon, «(25» también es palabra: 55. Las dos, bajo 60. */
    assert.equal(palabras, M.PALABRAS_K3 + 1);
    assert.ok(palabras <= M.LIMITE_B2);
    sinMarcas(caja);
    await tocar(caja.querySelector(".ekx-seguir"));

    /* 7 · Resumen: el kárdex de PEPS completo, el deslizador vivo y las líneas de Near debajo. */
    r = retrato(caja);
    assert.equal(r.pantalla, "resumen");
    assert.equal(r.texto, null);
    assert.equal(r.metodo, KX.peps.titulo);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 4));
    assert.deepEqual(r.rango, { valor: "4", rango: "0-4", quieto: "false", tab: 0, texto: X.MOV_KX[4] });
    assert.deepEqual([...caja.querySelectorAll("[data-lista] li")].map((l) => l.textContent), [...near("resumen").lista, near("resumen").siguiente]);
    assert.deepEqual(r.seguir, ["Siguiente pieza", "false", "siguiente-pieza"]);
    assert.equal(r.pie, near("resumen").pie);
    await deslizar(caja, 1);
    assert.deepEqual(filasVistas(caja), filasDatos("peps", 1));
    assert.equal(mensaje(caja).tipo, null);
    sinMarcas(caja);
  } finally {
    m.desmontar();
  }
});

/* Una pieza que empieza en una pantalla (como la mide el canon). */
const desde = (id) => ({ ...P, pantallas: P.pantallas.slice(P.pantallas.findIndex((p) => p.id === id)) });

test("★★★ K-2, la prueba de Mello: acertar en PEPS y mover la fecha al 20 de julio da «Sigue hasta el 20 de julio.» o nada", async () => {
  /* A saltos, del 9 al 20: nada. Paso a paso: «Sigue…» en el 14 y nada en el 20. Nunca el acierto fuera del 9. */
  for (const camino of [[4], [3, 4]]) {
    const m = await montar(h(ElKardex, { pieza: desde("peps"), rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector('[data-ficha="inicio-y-5"]'));
      const vistos = [];
      for (const i of camino) {
        await deslizar(m.caja, i);
        vistos.push(m.caja.querySelector("[role=status]").textContent);
        assert.ok(!m.caja.textContent.includes(near("peps").acierto.texto), `el acierto pegado al ${X.FECHAS_KX[i]}`);
      }
      assert.ok([M.SIGUE_HASTA_EL_20, ""].includes(vistos.at(-1)));
      assert.deepEqual(vistos, camino.length === 1 ? [""] : [M.SIGUE_HASTA_EL_20, ""]);
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ K-1, la escalera con tres fichas: el 1.er error deja dos opciones y el 2.º llega al porqué, en PEPS y en UEPS", async () => {
  for (const id of ["peps", "ueps"]) {
    const p = pantalla(id);
    for (const [primera, segunda] of [[0, 1], [1, 0]]) {
      const malas = p.fichas.filter((f) => !f.correcta);
      const m = await montar(h(ElKardex, { pieza: desde(id), rotulo: "R" }));
      try {
        await tocar(m.caja.querySelector(`[data-ficha="${malas[primera].id}"]`));
        assert.equal(m.caja.querySelectorAll("[data-ficha]:not(.mal)").length, 2, `${id}: tras el 1.er error quedan dos por probar`);
        assert.equal(mensaje(m.caja).texto, `Incorrecto. ${p.pista}`);
        await tocar(m.caja.querySelector(`[data-ficha="${malas[segunda].id}"]`));
        assert.equal(mensaje(m.caja).texto, `Incorrecto. ${malas[segunda].devolucion}`);
        assert.equal(m.caja.querySelector("[data-ficha].pista").dataset.ficha, p.fichas.find((f) => f.correcta).id);
        assert.equal(m.caja.querySelector("[data-pendiente]").dataset.fila, String(p.espera), "no se revela nada en la tabla");
      } finally {
        m.desmontar();
      }
    }
  }
});

/* ═══════════ 3 · EL MOVIMIENTO ═══════════ */

/* Animaciones de mentira: lo que vuela y los cuadros del total que cuenta. */
function conMovimiento() {
  const vuelos = [];
  const cuadros = [];
  const proto = w.Element.prototype;
  proto.animate = function (kf, op) { vuelos.push({ que: this.dataset.vuelo, ms: op.duration, el: this }); return { finished: Promise.resolve() }; };
  w.requestAnimationFrame = (f) => { cuadros.push(f); return cuadros.length; };
  return {
    vuelos, cuadros,
    async correr(t) { const fs = cuadros.splice(0); await act(async () => { for (const f of fs) f(t); }); },
    quitar() { delete proto.animate; delete w.requestAnimationFrame; },
  };
}

test("★★★ el «mira esto»: en PEPS las dos capas que salen viajan del Saldo al hueco; en UEPS, una; la ficha equivocada vuela al hueco", async () => {
  const mov = conMovimiento();
  try {
    let m = await montar(h(ElKardex, { pieza: desde("peps"), rotulo: "R" }));
    const origenes = [];
    const proto = w.Element.prototype;
    const getB = proto.getBoundingClientRect;
    proto.getBoundingClientRect = function () { if (this.dataset?.saldo !== undefined) origenes.push(this.dataset.capa); return getB.call(this); };
    try {
      await tocar(m.caja.querySelector('[data-ficha="solo-5"]'));
      assert.deepEqual(mov.vuelos.map((v) => [v.que, v.ms]), [["60 × 2.130", 320]]);
      mov.vuelos.length = 0;
      await tocar(m.caja.querySelector('[data-ficha="inicio-y-5"]'));
      assert.deepEqual(mov.vuelos.map((v) => [v.que, v.ms]), KX.peps.filas[2].sa.map((c) => [`${c[0]} × ${cifraK(c[1])}`, 400]));
      assert.deepEqual(origenes, ["30 × 2.010", "50 × 2.130"], "salen de las capas del saldo del 5 de julio");
      assert.equal(m.caja.querySelectorAll(".ekx-vuelo").length, 0, "la copia que vuela se va");
      /* El total cuenta de 166.800 a 42.600 en 600 ms. */
      const tot = () => m.caja.querySelector('[data-fila="2"] [data-bloque="saldo"] [data-total]').textContent;
      assert.equal(tot(), "166.800");
      const t0 = performance.now();
      await mov.correr(t0 + 300);
      assert.ok(!["166.800", "42.600"].includes(tot()), `a la mitad: ${tot()}`);
      await mov.correr(t0 + 700);
      assert.equal(tot(), "42.600");
      assert.deepEqual(nuevas(m.caja), ["2"]);
    } finally {
      proto.getBoundingClientRect = getB;
      m.desmontar();
    }
    mov.vuelos.length = 0;
    m = await montar(h(ElKardex, { pieza: desde("ueps"), rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector('[data-ficha="del-14"]'));
      assert.deepEqual(mov.vuelos.map((v) => [v.que, v.ms]), [["35 × 2.250", 400]]);
      /* Dos capas en el saldo: el total no cuenta. */
      assert.equal(m.caja.querySelector('[data-fila="4"] [data-total]'), null);
    } finally {
      m.desmontar();
    }
    mov.vuelos.length = 0;
    m = await montar(h(ElKardex, { pieza: desde("promedio"), rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector('[data-ficha="2195"]'));
      assert.deepEqual(mov.vuelos.map((v) => [v.que, v.ms]), [["$2.195", 320]]);
      const tot = () => m.caja.querySelector('[data-fila="3"] [data-total]').textContent;
      assert.equal(tot(), "41.700");
      await mov.correr(performance.now() + 1000);
      assert.equal(tot(), "131.700");
    } finally {
      m.desmontar();
    }
  } finally {
    mov.quitar();
  }
});

test("★★★ con prefers-reduced-motion: nada vuela, ninguna fila entra animada y el total está en su valor final", async () => {
  const mov = conMovimiento();
  const antes = w.matchMedia;
  w.matchMedia = (q) => ({ ...antes(q), matches: /reduce/.test(q) });
  globalThis.matchMedia = w.matchMedia;
  try {
    const m = await montar(h(ElKardex, { pieza: desde("peps"), rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector('[data-ficha="solo-5"]'));
      await tocar(m.caja.querySelector('[data-ficha="inicio-y-5"]'));
      assert.deepEqual(mov.vuelos, []);
      assert.deepEqual(mov.cuadros, []);
      assert.deepEqual(nuevas(m.caja), []);
      assert.equal(m.caja.querySelector('[data-fila="2"] [data-bloque="saldo"] .ekx-tot').textContent, "42.600");
      await deslizar(m.caja, 3);
      assert.deepEqual(nuevas(m.caja), []);
      assert.deepEqual(filasVistas(m.caja), filasDatos("peps", 3));
    } finally {
      m.desmontar();
    }
  } finally {
    w.matchMedia = antes;
    globalThis.matchMedia = antes;
    mov.quitar();
  }
});

test("★★★ cuatro columnas desde 560 px de contenido (Entradas y Salidas aparte); debajo, tres con «Entra» o «Sale»", async () => {
  const cab = (caja) => [...caja.querySelectorAll("[role=columnheader]")].map((c) => c.textContent);
  let m = await montar(h(ElKardex, { pieza: desde("peps"), rotulo: "R" }));
  try {
    assert.deepEqual(cab(m.caja), ["Fecha", "Entra o sale", "Saldo"]);
    /* El 1 de julio no entra ni sale nada: sin marca. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-fila]")].map((r) => r.querySelector(".ekx-tag")?.textContent ?? null), [null, "Entra", "Sale"]);
  } finally {
    m.desmontar();
  }
  const d = Object.getOwnPropertyDescriptor(w.HTMLElement.prototype, "clientWidth") ?? Object.getOwnPropertyDescriptor(w.Element.prototype, "clientWidth");
  Object.defineProperty(w.HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 770; } });
  try {
    m = await montar(h(ElKardex, { pieza: desde("peps"), rotulo: "R" }));
    try {
      assert.deepEqual(cab(m.caja), ["Fecha", "Entradas", "Salidas", "Saldo"]);
      assert.ok(m.caja.querySelector("[data-tabla]").classList.contains("ancho"));
      assert.equal(m.caja.querySelectorAll(".ekx-tag").length, 0);
      assert.ok(m.caja.querySelector('[data-pendiente] [data-bloque="salidas"] [data-hueco]'));
      assert.equal(m.caja.querySelector('[data-pendiente] [data-bloque="entradas"]').children.length, 0);
      await tocar(m.caja.querySelector('[data-ficha="inicio-y-5"]'));
      assert.deepEqual(filasVistas(m.caja), filasDatos("peps", 2));
    } finally {
      m.desmontar();
    }
  } finally {
    delete w.HTMLElement.prototype.clientWidth;
    if (d && !Object.getOwnPropertyDescriptor(w.Element.prototype, "clientWidth")) Object.defineProperty(w.HTMLElement.prototype, "clientWidth", d);
  }
});

/* ═══════════ 4 · CATÁLOGO Y VISTA ═══════════ */

test("★★★ la vista publica la pieza nueva con el mismo id, en la misma posición; fuera del catálogo de FP", () => {
  assert.equal(P.id, A.A3_ID);
  assert.equal(P.numero, A.PIEZA_EL_KARDEX.numero);
  assert.equal(P.titulo, A.PIEZA_EL_KARDEX.titulo);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const enVista = PIEZAS_T7_2.find((x) => x.pieza.id === A.A3_ID);
  assert.equal(enVista.pieza, P);
  assert.equal(enVista.Pieza, ElKardex);
  assert.equal(PIEZAS_T7_2.indexOf(enVista), 2);
  assert.equal(PIEZAS_T7_2.filter((x) => x.pieza.id === A.A3_ID).length, 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A3_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ElKardexQueCrece.jsx", "src/data/contabilidadT7_2_a3_c2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★ «Siguiente pieza» lleva el foco a la pieza que sigue en la vista", async () => {
  const sig = { id: "otra", numero: 9, titulo: "Otra", pantallas: [] };
  const Otra = () => h("section", null, h("div", { "data-pieza": "otra", tabIndex: -1 }, "Otra"));
  const m = await montar(h("div", null, h("div", null, h(ElKardex, { pieza: desde("resumen"), rotulo: "R" })), h("div", null, h(Otra, { pieza: sig }))));
  try {
    await tocar(m.caja.querySelector('[data-boton="siguiente-pieza"]'));
    assert.equal(document.activeElement, m.caja.querySelector('[data-pieza="otra"]'));
  } finally {
    m.desmontar();
  }
});
