import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 «El viaje de una caja» (Célula C), la pieza 2 del Patrón de
 * enganche C v6. Reemplaza a «Control interno de los inventarios» con el
 * mismo id (t7-1-a7-control-interno) y en la misma posición.
 *
 * La fuente es el HTML de la v6 (orquestador/conocimiento/paquetes/
 * patron-enganche-c-v6.html): de él se saca el código de referencia (a7.js,
 * guardado en la página como la cadena A7JS) y la tabla «Pantalla por
 * pantalla». Nada de lo que se compara está copiado a mano aquí.
 *
 *   1 · TEXTOS   las estaciones y las pantallas de los datos son, campo por
 *       campo, las de a7.js (en los dos sentidos); los textos de la interfaz
 *       están en a7.js; la tabla de la v6 dice lo mismo; A7-2 de Mello está
 *   2 · LA PIEZA MONTADA CONTRA LA REFERENCIA  a7.js corre en el mismo DOM
 *       y las dos se juegan igual, toque por toque: el mismo texto, la misma
 *       ficha, el mismo mensaje y la misma marca en cada estación
 *   3 · EL VIAJE  la caja con cuadros a mano (requestAnimationFrame falso) y
 *       una ruta medida a mano: la hoja vuela 0 veces en el caso 1 (A7-1),
 *       1 al soltar y 1 en los primeros 5 s del caso 2, como en la
 *       procedencia medida de la v6; la caja se detiene, tiembla y sigue a
 *       los 700 ms (temporizadores falsos); en el caso 3 se queda en Bodega;
 *       con movimiento reducido no viaja y no vuela la hoja
 *   4 · FOCO, COLORES, CATÁLOGO Y VISTA
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", runScripts: "outside-only", virtualConsole: new VirtualConsole() });
const w = dom.window;
/* Movimiento reducido, a voluntad de cada prueba. */
let reducido = false;
w.matchMedia = (q) => ({ matches: q.includes("reduce") && reducido, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
/* Cuadros a mano: la caja solo se mueve cuando la prueba pasa el reloj. */
let reloj = 0;
let siguienteCuadro = 1;
const cola = new Map();
w.requestAnimationFrame = (f) => { const id = siguienteCuadro++; cola.set(id, f); return id; };
w.cancelAnimationFrame = (id) => { cola.delete(id); };
Object.defineProperty(w.performance, "now", { value: () => reloj, configurable: true });
function cuadros(ms, paso = 16) {
  const fin = reloj + ms;
  while (reloj < fin) {
    reloj += paso;
    const fs = [...cola.values()];
    cola.clear();
    for (const f of fs) f(reloj);
  }
}
/* La ruta medida a mano: 400 px de alto; el nodo de cada estación, cada 60 px desde los 36 del margen. */
const ORDEN = ["recepcion", "contabilidad", "bodega", "conteos", "salida"];
const RECT = (top, height) => ({ top, height, bottom: top + height, left: 0, right: 300, width: 300, x: 0, y: top });
w.HTMLElement.prototype.getBoundingClientRect = function () {
  if (this.matches(".t7vc-ruta, .ea7-ruta")) return RECT(0, 400);
  if (this.matches(".t7vc-nodo, .ea7-nodo")) return RECT(36 + 60 * ORDEN.indexOf(this.closest("[data-est]").dataset.est), 26);
  return RECT(0, 0);
};
const Y = { ini: 18, fin: 382, de: (id) => 36 + 60 * ORDEN.indexOf(id) + 13 };

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

const A = await import("../../data/contabilidadT7_1_a7_viaje.js");
const C = await import("../../components/mecanicas/libros/t7/ElViajeDeUnaCaja.jsx");
const ElViaje = C.default;
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { PIEZAS: PIEZAS_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");
const { FAE } = await import("../../theme.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQ = "orquestador/conocimiento/paquetes/";

/* ═══════════ LA V6: el código de referencia y la sección de la pieza 2 ═══════════ */

const HTML = leer(`${PAQ}patron-enganche-c-v6.html`);
const A7JS = JSON.parse(HTML.match(/^const A7JS = (".*");$/m)[1]);
const A7CSS = JSON.parse(HTML.match(/^const A7CSS = (".*");$/m)[1]);
const REF = new Function(`${A7JS.slice(A7JS.indexOf("const ESTACIONES"), A7JS.indexOf("const CICLO"))}return { ESTACIONES, PANTALLAS };`)();
const INI_P2 = HTML.indexOf('<section class="sec" id="p2">');
const SECCION = HTML.slice(INI_P2, HTML.indexOf("</section>", INI_P2));
/* El a7.js publicado corre aquí mismo, en el DOM de la prueba: es la referencia contra la que se juega la pieza. */
w.eval(A7JS);
assert.equal(typeof w.EngancheA7, "function", "a7.js de la v6 no montó");

const MELLO_V5 = leer(`${PAQ}auditoria-mello-n6-n7-v2-y-enganche-v5.md`);
const MELLO_V6 = leer(`${PAQ}auditoria-mello-enganche-v6-y-t7-3-aciertos.md`);

const P = A.PIEZA_EL_VIAJE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const textosVisibles = () => [
  P.titulo,
  ...A.ESTACIONES.flatMap((e) => [e.nombre, e.control, e.marca].filter(Boolean)),
  ...P.pantallas.flatMap((p) => [p.texto, p.boton, p.caso?.ficha, p.caso?.fichaBien, p.caso?.bien, p.caso?.pista, ...Object.values(p.caso?.mal ?? {})].filter(Boolean)),
  ...Object.values(A.INTERFAZ).filter((x) => typeof x === "string"),
];

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ las estaciones y las pantallas son, campo por campo y letra por letra, las de a7.js de la v6", () => {
  assert.deepStrictEqual(A.ESTACIONES, REF.ESTACIONES);
  assert.deepStrictEqual(A.PANTALLAS, REF.PANTALLAS);
  assert.equal(P.pantallas, A.PANTALLAS);
  assert.equal(P.pantallas.length, 6);
});

test("★★★ el título es el de la sección de la v6, y la tabla «Pantalla por pantalla» dice los mismos textos", () => {
  assert.equal(SECCION.match(/<h2>([^<]+)<\/h2>/)[1], P.titulo);
  const filas = [...SECCION.matchAll(/<td class='mono'>(\d)<\/td><td>«([^»]+)»<br>/g)];
  assert.deepEqual(filas.map((m) => Number(m[1])), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(filas.map((m) => m[2]), P.pantallas.map((p) => p.texto));
});

test("★★★ cada texto de la interfaz está, letra por letra, en a7.js", () => {
  for (const [k, t] of Object.entries(A.INTERFAZ)) {
    if (typeof t === "string") assert.ok(A7JS.includes(`'${t}'`) || A7JS.includes(`"${t}"`), `${k}: «${t}»`);
  }
  assert.ok(A7JS.includes(`aria-label="${A.INTERFAZ.ruta}"`));
  assert.ok(A7JS.includes("`Pantalla ${s.p + 1} de ${PANTALLAS.length}`"));
  assert.equal(A.INTERFAZ.marca(2, 6), "Pantalla 2 de 6");
  assert.ok(A7JS.includes(`bien ? '${A.INTERFAZ.bien}' : mal ? '${A.INTERFAZ.noEsAqui}' : ''`));
  assert.ok(A7JS.includes(`\${s.soltada ? '${A.INTERFAZ.soltarOtraVez}' : '${A.INTERFAZ.soltar}'}`));
  assert.ok(A7JS.includes(`b.textContent = P.boton || '${A.INTERFAZ.seguir}'`));
});

test("★★★ Mello: A7 lista en la v6; A7-2 (el caso 3 nuevo) está tal cual en los datos; A7-1 en el código", () => {
  assert.match(MELLO_V6, /\| A7 v6 \| \*\*Lista\.\*\* A7-1 y A7-2 están aplicadas, sin fallos nuevos\. \|/);
  const a72 = MELLO_V5.slice(MELLO_V5.indexOf("**A7-2"), MELLO_V5.indexOf("El acierto, la pista y los errores de Contabilidad y Salida"));
  const fila = (campo) => a72.split("\n").find((l) => l.startsWith(`| ${campo} |`)).match(/«([^»]+)»/)[1];
  const p4 = pantalla("p4");
  assert.ok(p4.texto.startsWith(`${fila("Caso 3")} `), p4.texto);
  assert.equal(p4.caso.ficha, fila("Ficha"));
  assert.equal(p4.caso.mal.recepcion, fila("Error en Recepción"));
  assert.equal(p4.caso.mal.bodega, fila("Error en Bodega"));
  /* A7-1: la condición que pide Mello está en la referencia y en el componente. */
  assert.ok(A7JS.includes("PANTALLAS[s.p].id !== 'p2'"));
  assert.equal(C.PANTALLA_SIN_HOJA, "p2");
  assert.equal(pantalla(C.PANTALLA_SIN_HOJA).caso.correcta, "recepcion", "p2 es el caso 1 (la ferretería)");
});

test("★★ en pantalla, nada interno: ni marcas de revisión ni nombres del equipo", () => {
  const texto = textosVisibles().join("\n");
  for (const interno of ["ESCRITO POR CLAUDE", "PENDIENTE", "Near", "Mello", "Watari", "H7", "[", "]"]) assert.ok(!texto.includes(interno), interno);
});

/* ═══════════ 2 · LA PIEZA MONTADA, CONTRA LA REFERENCIA ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.click(); });
};
const montarRef = () => {
  const raiz = w.document.createElement("div");
  w.document.body.appendChild(raiz);
  w.EngancheA7(raiz);
  return raiz;
};

const tiene = (b, c) => b.classList.contains(c);
function vistaMia(caja) {
  const r = caja.querySelector("[data-pieza]");
  const ficha = r.querySelector("[data-ficha]");
  const msg = r.querySelector('[role="status"]');
  const seguir = r.querySelector('[data-boton="seguir"], [data-boton="empezar"]');
  return {
    pantalla: r.dataset.pantalla,
    marca: r.querySelector("[data-marca]").textContent,
    texto: r.querySelector("[data-texto]").textContent,
    dormida: tiene(r, "t7vc-dormida"),
    ficha: ficha.hidden ? null : ficha.textContent,
    msg: msg.textContent,
    tipo: ["mal", "bien", "pista"].filter((t) => tiene(msg, `t7vc-msg-${t}`)),
    estaciones: A.ESTACIONES.map((e) => {
      const b = r.querySelector(`[data-est="${e.id}"]`);
      return {
        id: e.id, nodo: b.querySelector(".t7vc-nodo").textContent, etiqueta: b.querySelector(".t7vc-etq").textContent,
        rama: tiene(b, "t7vc-rama"), tocable: !b.disabled, blanco: tiene(b, "t7vc-blanco"),
        mal: tiene(b, "t7vc-mal"), pista: tiene(b, "t7vc-pista"), bien: tiene(b, "t7vc-bien"),
        sello: b.querySelector("[data-sello]").textContent,
      };
    }),
    soltar: r.querySelector('[data-boton="soltar"]')?.textContent ?? null,
    seguir: seguir ? { texto: seguir.textContent, activo: seguir.getAttribute("aria-disabled") !== "true" } : null,
  };
}
function vistaRef(r) {
  const msg = r.querySelector(".ea7-msg");
  const seguir = r.querySelector(".ea7-seguir");
  return {
    pantalla: `p${Number(r.querySelector(".ea7-marca").textContent.match(/\d+/)[0]) - 1}`,
    marca: r.querySelector(".ea7-marca").textContent,
    texto: r.querySelector(".ea7-txt").textContent,
    dormida: tiene(r, "dormida"),
    ficha: r.querySelector(".ea7-ficha").hidden ? null : r.querySelector(".ea7-ficha").textContent,
    msg: msg.textContent,
    tipo: ["mal", "bien", "pista"].filter((t) => tiene(msg, t)),
    estaciones: A.ESTACIONES.map((e) => {
      const b = r.querySelector(`[data-est="${e.id}"]`);
      return {
        id: e.id, nodo: b.querySelector(".ea7-nodo").textContent, etiqueta: b.querySelector(".ea7-est-txt").textContent,
        rama: tiene(b, "rama"), tocable: !b.disabled, blanco: tiene(b, "blanco"),
        mal: tiene(b, "mal"), pista: tiene(b, "pista"), bien: tiene(b, "bien"),
        sello: b.querySelector(".ea7-sello").textContent,
      };
    }),
    soltar: r.querySelector('[data-accion="soltar"]')?.textContent ?? null,
    seguir: { texto: seguir.textContent, activo: !seguir.disabled },
  };
}

/* El recorrido entero: cada paso se juega en las dos. Incluye tocar «Seguir» cuando todavía no se puede. */
const RECORRIDO = [
  ["al llegar"],
  ["seguir"], ["seguir"],
  ["soltar"], ["soltar"],
  ["seguir"], ["seguir"],
  ["est", "bodega"], ["est", "contabilidad"], ["est", "salida"], ["est", "conteos"], ["est", "recepcion"],
  ["seguir"],
  ["est", "conteos"], ["est", "salida"],
  ["seguir"],
  ["est", "recepcion"], ["est", "bodega"], ["est", "conteos"],
  ["seguir"],
];
const pasoMio = (caja, [que, id]) => que === "seguir" ? caja.querySelector('[data-boton="seguir"], [data-boton="empezar"]')
  : que === "soltar" ? caja.querySelector('[data-boton="soltar"]') : caja.querySelector(`[data-est="${id}"]`);
const pasoRef = (r, [que, id]) => que === "seguir" ? r.querySelector(".ea7-seguir") : que === "soltar" ? r.querySelector('[data-accion="soltar"]') : r.querySelector(`[data-est="${id}"]`);

test("★★★ jugada toque por toque, la pieza dice y marca lo mismo que la referencia de la v6", async () => {
  const m = await montar(h(ElViaje, { rotulo: "R" }));
  const ref = montarRef();
  const vistos = [];
  try {
    for (const paso of RECORRIDO) {
      if (paso[0] !== "al llegar") {
        await clic(pasoMio(m.caja, paso));
        pasoRef(ref, paso).click();
      }
      const mia = vistaMia(m.caja);
      const suya = vistaRef(ref);
      /* La única diferencia buscada: «Siguiente pieza» no tiene a dónde ir en T7-1 y no se pinta. */
      if (mia.pantalla === "p5") {
        assert.equal(mia.seguir, null);
        assert.deepEqual(suya.seguir, { texto: pantalla("p5").boton, activo: true });
        delete mia.seguir; delete suya.seguir;
      }
      assert.deepEqual(mia, suya, `${paso.join(" ")} en ${mia.pantalla}`);
      vistos.push(`${mia.pantalla}:${paso.join("-")}`);
    }
    assert.equal(vistaMia(m.caja).pantalla, "p5");
    assert.equal(new Set(vistos.map((x) => x.split(":")[0])).size, 6, "pasó por las seis pantallas");
  } finally {
    m.desmontar(); ref.remove(); cola.clear();
  }
});

test("★★★ cada pantalla y cada estado, contra los datos: escalera, sellos, ficha y «Seguir»", async () => {
  const m = await montar(h(ElViaje, { rotulo: "R" }));
  const v = () => vistaMia(m.caja);
  const est = (id) => v().estaciones.find((e) => e.id === id);
  const toca = (id) => clic(m.caja.querySelector(`[data-est="${id}"]`));
  const seguir = () => clic(m.caja.querySelector('[data-boton="seguir"], [data-boton="empezar"]'));
  try {
    /* p0: la línea espera atenuada; nada se toca; «Empezar». */
    assert.deepEqual([v().pantalla, v().marca, v().texto, v().dormida, v().ficha, v().msg], ["p0", "Pantalla 1 de 6", pantalla("p0").texto, true, null, ""]);
    assert.ok(v().estaciones.every((e) => !e.tocable && !e.blanco && e.sello === ""));
    assert.deepEqual(v().seguir, { texto: pantalla("p0").boton, activo: true });
    assert.deepEqual(v().estaciones.map((e) => e.nodo), ["1", "", "2", "", "3"]);
    assert.deepEqual(v().estaciones.map((e) => e.etiqueta), A.ESTACIONES.map((e) => `${e.nombre}${e.control}${e.marca ?? ""}`));
    assert.deepEqual(v().estaciones.map((e) => e.rama), [false, true, false, true, false]);
    /* p1: «Seguir» no avanza hasta soltar la caja. */
    await seguir();
    assert.deepEqual([v().pantalla, v().dormida, v().soltar, v().seguir], ["p1", false, A.INTERFAZ.soltar, { texto: A.INTERFAZ.seguir, activo: false }]);
    await seguir();
    assert.equal(v().pantalla, "p1");
    await clic(m.caja.querySelector('[data-boton="soltar"]'));
    assert.deepEqual([v().soltar, v().seguir.activo], [A.INTERFAZ.soltarOtraVez, true]);
    for (const id of ["p2", "p3", "p4"]) {
      await seguir();
      const p = pantalla(id);
      const otras = A.ESTACIONES.map((e) => e.id).filter((x) => x !== p.caso.correcta);
      /* Al llegar: la ficha del caso, las cinco estaciones tocables con borde punteado, sin mensaje, «Seguir» bloqueado. */
      assert.deepEqual([v().pantalla, v().texto, v().ficha, v().msg, v().seguir], [id, p.texto, p.caso.ficha, "", { texto: A.INTERFAZ.seguir, activo: false }]);
      assert.ok(v().estaciones.every((e) => e.tocable && e.blanco && !e.mal && !e.pista && !e.bien && e.sello === ""), id);
      await seguir();
      assert.equal(v().pantalla, id, "«Seguir» avanzó sin acertar");
      /* 1.er error: el porqué de esa estación, en coral, y «No es aquí» en ella. */
      await toca(otras[0]);
      assert.deepEqual([v().msg, v().tipo], [p.caso.mal[otras[0]], ["mal"]]);
      assert.deepEqual([est(otras[0]).mal, est(otras[0]).sello, est(p.caso.correcta).pista], [true, A.INTERFAZ.noEsAqui, false]);
      assert.equal(v().seguir.activo, false);
      /* 2.º error: «Es en …» y la estación correcta en borde neutro, sin ✓; la marca de error pasa a la nueva estación. */
      await toca(otras[1]);
      assert.deepEqual([v().msg, v().tipo], [p.caso.pista, ["pista"]]);
      assert.ok(p.caso.pista.startsWith("Es en "));
      assert.deepEqual([est(otras[0]).mal, est(otras[1]).mal, est(otras[1]).sello], [false, true, A.INTERFAZ.noEsAqui]);
      assert.deepEqual([est(p.caso.correcta).pista, est(p.caso.correcta).sello, est(p.caso.correcta).bien], [true, "", false]);
      /* 3.er error: sigue la pista. */
      await toca(otras[2]);
      assert.deepEqual([v().msg, v().tipo, est(otras[2]).mal, est(p.caso.correcta).pista], [p.caso.pista, ["pista"], true, true]);
      /* El acierto: ✓ en la estación, nada más se toca, la ficha del acierto si la hay, «Seguir» activo. */
      await toca(p.caso.correcta);
      assert.deepEqual([v().msg, v().tipo, v().ficha], [p.caso.bien, ["bien"], p.caso.fichaBien ?? p.caso.ficha]);
      assert.deepEqual(v().estaciones.map((e) => [e.id, e.tocable, e.blanco, e.mal, e.pista, e.bien, e.sello]),
        A.ESTACIONES.map((e) => [e.id, false, false, false, false, e.id === p.caso.correcta, e.id === p.caso.correcta ? A.INTERFAZ.bien : ""]));
      assert.equal(v().seguir.activo, true);
    }
    /* p5: el resumen, sin botón; la línea y las ramas a la vista, nada se toca. */
    await seguir();
    assert.deepEqual([v().pantalla, v().texto, v().ficha, v().msg, v().seguir, v().soltar], ["p5", pantalla("p5").texto, null, "", null, null]);
    assert.ok(v().estaciones.every((e) => !e.tocable && !e.blanco && !e.bien && e.sello === ""));
    assert.equal(m.caja.querySelector("[data-boton]"), null, "el resumen no lleva botón");
  } finally {
    m.desmontar(); cola.clear();
  }
});

test("★★★ la escalera, pura: lo que cambia cada toque, como el clic de la referencia", () => {
  const p = pantalla("p3");
  let s = C.ESTADO_INICIAL;
  s = C.responder(s, p, "bodega");
  assert.deepEqual([s.errores.p3, s.intento, s.pista, s.msg, s.tipo], [1, "bodega", false, p.caso.mal.bodega, "mal"]);
  s = C.responder(s, p, "bodega");
  assert.deepEqual([s.errores.p3, s.intento, s.pista, s.msg, s.tipo], [2, "bodega", true, p.caso.pista, "pista"]);
  s = C.responder(s, p, "salida");
  assert.deepEqual([s.resuelto.p3, s.intento, s.pista, s.msg, s.tipo], [true, null, false, p.caso.bien, "bien"]);
  assert.equal(C.responder(s, p, "bodega"), s, "resuelto, ya no cambia");
  assert.equal(C.responder(s, pantalla("p1"), "bodega"), s, "sin caso, no cambia");
  /* Los errores son de cada caso: el 1.er error del caso siguiente vuelve a dar el porqué. */
  const q = C.responder(C.alSeguir(s), pantalla("p4"), "salida");
  assert.deepEqual([q.msg, q.tipo, q.errores], [pantalla("p4").caso.mal.salida, "mal", { p3: 2, p4: 1 }]);
});

/* ═══════════ 3 · EL VIAJE ═══════════ */

/*
 * Cuántas veces vuela la hoja a Contabilidad: en la mía (el atributo data-hoja) y en la referencia (la clase
 * llega-hoja), con un observador. Cada registro trae el valor de antes; el de después es el del registro
 * siguiente (o el de ahora): una vez es cada paso de «sin hoja» a «con hoja».
 */
function contarHojas(raiz, esMia) {
  const c = raiz.querySelector('[data-est="contabilidad"]');
  const conHoja = (v) => (esMia ? v !== null : String(v).split(" ").includes("llega-hoja"));
  const ahora = () => (esMia ? c.getAttribute("data-hoja") : c.className);
  const registros = [];
  const obs = new w.MutationObserver((ms) => registros.push(...ms));
  obs.observe(c, { attributes: true, attributeOldValue: true, attributeFilter: [esMia ? "data-hoja" : "class"] });
  return {
    get veces() {
      registros.push(...obs.takeRecords());
      const valores = [...registros.map((r) => r.oldValue), ahora()];
      return valores.slice(1).filter((v, i) => conHoja(v) && !conHoja(valores[i])).length;
    },
    parar: () => obs.disconnect(),
  };
}
const yCaja = (raiz) => Number(raiz.querySelector(".t7vc-caja, .ea7-caja").style.transform.match(/translateY\((-?[\d.]+)px\)/)[1]) + 14;

test("★★★ al soltar la caja (p1): baja una vez, la hoja vuela 1 vez a Contabilidad y la caja se queda al final, como en la referencia", async () => {
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(1) }, rotulo: "R" }));
  const ref = montarRef();
  ref.querySelector(".ea7-seguir").click();
  cola.clear();
  const mia = contarHojas(m.caja, true);
  const suya = contarHojas(ref, false);
  try {
    assert.equal(yCaja(m.caja), Y.ini, "antes de soltar, la caja espera arriba");
    await clic(m.caja.querySelector('[data-boton="soltar"]'));
    ref.querySelector('[data-accion="soltar"]').click();
    /* «Pasando»: la estación de la línea por la que va la caja se marca, y solo esa. */
    /* Cuadros de 17 ms: con 16 exactos, un cuadro cae justo en el final de la vuelta (ver la prueba siguiente). */
    let visto = 0;
    for (let t = 0; t < 8000; t += 17) {
      cuadros(17, 17);
      const y = yCaja(m.caja);
      const pasando = ORDEN.filter((id) => m.caja.querySelector(`[data-est="${id}"]`).hasAttribute("data-pasando"));
      assert.deepEqual(pasando, ["recepcion", "bodega", "salida"].filter((id) => Math.abs(Y.de(id) - y) < C.VIAJE.cerca), `y = ${y}`);
      visto += pasando.length;
    }
    assert.ok(visto > 0);
    assert.equal(yCaja(m.caja), Y.fin);
    assert.equal(yCaja(ref), Y.fin);
    assert.deepEqual([mia.veces, suya.veces], [1, 1]);
    assert.equal(cola.size, 0, "al terminar la vuelta, la caja no sigue");
  } finally {
    mia.parar(); suya.parar(); m.desmontar(); ref.remove(); cola.clear();
  }
});

test("★★ al soltar, con un cuadro justo en el final de la vuelta, la caja no salta arriba y la hoja vuela 1 vez (en a7.js, 2)", async () => {
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(1) }, rotulo: "R" }));
  const ref = montarRef();
  ref.querySelector(".ea7-seguir").click();
  cola.clear();
  const mia = contarHojas(m.caja, true);
  const suya = contarHojas(ref, false);
  try {
    await clic(m.caja.querySelector('[data-boton="soltar"]'));
    ref.querySelector('[data-accion="soltar"]').click();
    let maxima = 0;
    let suyaArriba = false;
    for (let t = 0; t < 8000; t += 16) {
      cuadros(16, 16);
      const y = yCaja(m.caja);
      assert.ok(y >= maxima, `la caja volvió arriba: de ${maxima} a ${y}`);
      maxima = y;
      if (yCaja(ref) === Y.ini && reloj > 1000) suyaArriba = true;
    }
    assert.equal(yCaja(m.caja), Y.fin);
    assert.deepEqual([mia.veces, suya.veces, suyaArriba], [1, 2, true], "la referencia tiene el salto (d > total)");
  } finally {
    mia.parar(); suya.parar(); m.desmontar(); ref.remove(); cola.clear();
  }
});

/* Monta las dos en un caso: la mía con las pantallas desde él, la referencia jugada hasta llegar (su viaje queda en marcha). */
async function lasDosEn(id) {
  const k = P.pantallas.findIndex((p) => p.id === id);
  const ref = montarRef();
  ref.querySelector(".ea7-seguir").click();
  ref.querySelector('[data-accion="soltar"]').click();
  ref.querySelector(".ea7-seguir").click();
  for (const p of P.pantallas.slice(2, k)) { ref.querySelector(`[data-est="${p.caso.correcta}"]`).click(); ref.querySelector(".ea7-seguir").click(); }
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(k) }, rotulo: "R" }));
  return { m, ref };
}

test("★★★ A7-1 · en el caso 1 la hoja no vuela nunca: con dos errores, el acierto y 6 s más, 0 veces (y la referencia, igual)", async () => {
  const { m, ref } = await lasDosEn("p2");
  const mia = contarHojas(m.caja, true);
  const suya = contarHojas(ref, false);
  try {
    cuadros(6000);
    for (const id of ["bodega", "salida"]) { await clic(m.caja.querySelector(`[data-est="${id}"]`)); ref.querySelector(`[data-est="${id}"]`).click(); cuadros(1000); }
    await clic(m.caja.querySelector('[data-est="recepcion"]'));
    ref.querySelector('[data-est="recepcion"]').click();
    cuadros(6000);
    assert.deepEqual([mia.veces, suya.veces], [0, 0]);
    assert.equal(yCaja(m.caja), Y.de("recepcion"), "al acertar, la caja se queda en Recepción");
    assert.equal(yCaja(ref), Y.de("recepcion"));
  } finally {
    mia.parar(); suya.parar(); m.desmontar(); ref.remove(); cola.clear();
  }
});

test("★★★ en el caso 2 la hoja sí vuela: 1 vez en los primeros 5 s (y la referencia, igual)", async () => {
  const { m, ref } = await lasDosEn("p3");
  const mia = contarHojas(m.caja, true);
  const suya = contarHojas(ref, false);
  try {
    cuadros(5000);
    assert.deepEqual([mia.veces, suya.veces], [1, 1]);
  } finally {
    mia.parar(); suya.parar(); m.desmontar(); ref.remove(); cola.clear();
  }
});

test("★★★ un error en la línea: la caja va a la estación, tiembla, y a los 700 ms sigue viajando; en una rama no se desvía", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(3) }, rotulo: "R" }));
  const caja = () => m.caja.querySelector(".t7vc-caja");
  try {
    cuadros(1000);
    /* Rama (Conteos): la caja sigue su viaje, sin temblar. */
    const antes = yCaja(m.caja);
    await clic(m.caja.querySelector('[data-est="conteos"]'));
    cuadros(300);
    assert.ok(yCaja(m.caja) > antes, "la caja se detuvo con un error en una rama");
    assert.equal(caja().hasAttribute("data-rebota"), false);
    /* Línea (Bodega): frena en la estación y tiembla. */
    await clic(m.caja.querySelector('[data-est="bodega"]'));
    assert.equal(caja().hasAttribute("data-rebota"), true);
    cuadros(400);
    assert.equal(yCaja(m.caja), Y.de("bodega"));
    mock.timers.tick(C.VIAJE.espera - 1);
    cuadros(200);
    assert.equal(yCaja(m.caja), Y.de("bodega"), "antes de los 700 ms la caja espera en la estación");
    mock.timers.tick(1);
    cuadros(200);
    assert.notEqual(yCaja(m.caja), Y.de("bodega"), "a los 700 ms la caja sigue viajando");
    /* Si se acierta antes de los 700 ms, la caja no vuelve a salir: se queda en Salida. */
    await clic(m.caja.querySelector('[data-est="recepcion"]'));
    await clic(m.caja.querySelector('[data-est="salida"]'));
    cuadros(400);
    mock.timers.tick(C.VIAJE.espera);
    cuadros(2000);
    assert.equal(yCaja(m.caja), Y.de("salida"));
    assert.equal(cola.size, 0);
  } finally {
    mock.timers.reset(); m.desmontar(); cola.clear();
  }
});

test("★★★ caso 3: al acertar en Conteos (rama), Conteos recibe la ✓ y la caja se queda en Bodega", async () => {
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(4) }, rotulo: "R" }));
  try {
    cuadros(2500);
    await clic(m.caja.querySelector('[data-est="conteos"]'));
    cuadros(400);
    assert.equal(yCaja(m.caja), Y.de("bodega"));
    assert.equal(m.caja.querySelector('[data-est="conteos"] [data-sello]').textContent, A.INTERFAZ.bien);
    assert.ok(m.caja.querySelector('[data-est="bodega"]').hasAttribute("data-pasando"));
    cuadros(3000);
    assert.equal(yCaja(m.caja), Y.de("bodega"), "se queda");
  } finally {
    m.desmontar(); cola.clear();
  }
});

test("★★★ al pasar de pantalla se limpian el temblor y la hoja; en el resumen la caja espera arriba y nada viaja", async () => {
  /*
   * En los datos, todo acierto lleva la caja a una estación y eso ya quita el temblor. Para ver la limpieza de
   * «Seguir», un caso de prueba (no de la pieza) cuya respuesta es una rama sin «aparcar»: el temblor del error
   * en Bodega sigue puesto al acertar.
   */
  const sinAparcar = { ...pantalla("p3"), id: "x", caso: { ...pantalla("p3").caso, correcta: "contabilidad" } };
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: [sinAparcar, ...P.pantallas.slice(3)] }, rotulo: "R" }));
  try {
    cuadros(5000);
    assert.ok(m.caja.querySelector('[data-est="contabilidad"]').hasAttribute("data-hoja"));
    await clic(m.caja.querySelector('[data-est="bodega"]'));
    await clic(m.caja.querySelector('[data-est="contabilidad"]'));
    assert.equal(m.caja.querySelector(".t7vc-caja").hasAttribute("data-rebota"), true);
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    assert.equal(m.caja.querySelector(".t7vc-caja").hasAttribute("data-rebota"), false);
    assert.equal(m.caja.querySelector('[data-est="contabilidad"]').hasAttribute("data-hoja"), false);
    /* El caso 2 de la pieza, como siempre. */
    cuadros(5000);
    await clic(m.caja.querySelector('[data-est="salida"]'));
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    assert.equal(cola.size, 1, "el caso 3 sale a viajar");
    await clic(m.caja.querySelector('[data-est="conteos"]'));
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "p5");
    assert.equal(yCaja(m.caja), Y.ini);
    assert.equal(cola.size, 0, "en el resumen nada viaja");
  } finally {
    m.desmontar(); cola.clear();
  }
});

test("★★★ movimiento reducido: la caja no viaja y la hoja no vuela; al soltar aparece al final; en un caso espera arriba y salta a la estación", async () => {
  reducido = true;
  const m = await montar(h(ElViaje, { pieza: { ...P, pantallas: P.pantallas.slice(1) }, rotulo: "R" }));
  const mia = contarHojas(m.caja, true);
  try {
    await clic(m.caja.querySelector('[data-boton="soltar"]'));
    assert.equal(yCaja(m.caja), Y.fin);
    assert.equal(cola.size, 0);
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    for (const id of ["p2", "p3", "p4"]) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, id);
      assert.equal(yCaja(m.caja), Y.ini, "en un caso, la caja espera arriba");
      assert.equal(cola.size, 0);
      await clic(m.caja.querySelector('[data-est="bodega"]'));
      assert.equal(yCaja(m.caja), Y.de("bodega"), "salta a la estación tocada");
      await clic(m.caja.querySelector('[data-est="salida"]'));
      await clic(m.caja.querySelector(`[data-est="${pantalla(id).caso.correcta}"]`));
      assert.equal(yCaja(m.caja), Y.de(pantalla(id).caso.aparcar ?? pantalla(id).caso.correcta));
      await clic(m.caja.querySelector('[data-boton="seguir"]'));
    }
    cuadros(6000);
    assert.equal(mia.veces, 0);
    assert.equal(cola.size, 0);
    assert.match(C.CSS_A7_VIAJE, /@media \(prefers-reduced-motion: reduce\) \{ \.t7vc \*, \.t7vc \*::before, \.t7vc \*::after \{ animation: none !important; transition: none !important; \} \}/);
  } finally {
    reducido = false; mia.parar(); m.desmontar(); cola.clear();
  }
});

test("★★ la lógica de la hoja, pura: cruzar Recepción hacia abajo, con movimiento y fuera del caso 1", () => {
  const base = { antes: 40, ahora: 50, yRecepcion: 49, pantallaId: "p3", reducido: false };
  assert.equal(C.lanzaHoja(base), true);
  assert.equal(C.lanzaHoja({ ...base, pantallaId: "p2" }), false);
  assert.equal(C.lanzaHoja({ ...base, reducido: true }), false);
  assert.equal(C.lanzaHoja({ ...base, antes: 49 }), false, "ya había cruzado");
  assert.equal(C.lanzaHoja({ ...base, antes: 50, ahora: 40 }), false, "hacia arriba no");
});

/* ═══════════ 4 · FOCO, COLORES, CATÁLOGO Y VISTA ═══════════ */

test("★★★ el foco: nada al montar; al texto al pasar de pantalla; al mensaje al responder", async () => {
  const m = await montar(h(ElViaje, { rotulo: "R" }));
  try {
    const txt = m.caja.querySelector("[data-texto]");
    const msg = m.caja.querySelector('[role="status"]');
    assert.ok(document.activeElement !== txt, "al montar, el foco no se mueve");
    await clic(m.caja.querySelector('[data-boton="empezar"]'));
    assert.ok(document.activeElement === txt, "el foco no fue al texto");
    await clic(m.caja.querySelector('[data-boton="soltar"]'));
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    assert.ok(document.activeElement === txt, "el foco no fue al texto");
    m.caja.querySelector('[data-est="conteos"]').focus();
    await clic(m.caja.querySelector('[data-est="conteos"]'));
    assert.ok(document.activeElement === msg, "el foco no fue al mensaje");
    assert.equal(msg.getAttribute("tabindex"), "-1");
    m.caja.querySelector('[data-est="recepcion"]').focus();
    await clic(m.caja.querySelector('[data-est="recepcion"]'));
    assert.ok(document.activeElement === msg, "el foco no fue al mensaje");
    /* La ruta se anuncia como grupo con su nombre; las estaciones son botones de verdad; lo decorativo no se lee. */
    const ruta = m.caja.querySelector('[role="group"]');
    assert.equal(ruta.getAttribute("aria-label"), A.INTERFAZ.ruta);
    assert.equal(ruta.querySelectorAll("button[data-est]").length, 5);
    assert.ok([...m.caja.querySelectorAll("[data-sello], .t7vc-nodo, .t7vc-caja, .t7vc-linea, [data-marca]")].every((x) => x.getAttribute("aria-hidden") === "true"));
  } finally {
    m.desmontar(); cola.clear();
  }
});

test("★★ colores: coral solo para el error; sin teal ni ámbar; los tokens de la v6", () => {
  const css = C.CSS_A7_VIAJE;
  for (const c of [FAE.teal, FAE.ambar, "#2FA8A0", "#2A9D8F", "#E9C46A"]) assert.ok(!css.toUpperCase().includes(c.toUpperCase()), c);
  for (const t of ["#0E1B2E", "#F8F9FA", "#B8C4D4", "#E76F51", "#A8B6C8", "#8A6F4E"]) { assert.ok(css.includes(t), t); assert.ok(A7CSS.includes(t), `${t} en la v6`); }
  const conCoral = css.split("\n").filter((l) => l.includes("#E76F51") || l.includes("231,111,81"));
  assert.deepEqual(conCoral.map((l) => l.split("{")[0].trim()), [".t7vc-est.t7vc-mal", ".t7vc-msg.t7vc-msg-mal"]);
});

test("★★★ catálogo: Aprender, sin FP, el mismo id y la misma posición; el nombre es el título nuevo", () => {
  assert.equal(A.A7_ID, "t7-1-a7-control-interno");
  assert.equal(P.id, A.A7_ID);
  assert.equal(P.numero, 7);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A7_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  /* Donde estaba: después de A6 y de su Hacer (H6), y justo antes de H7. */
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-1-devolucion-dos-libros") + 1);
  assert.equal(ids.indexOf("t7-1-que-control-falta"), ids.indexOf(A.A7_ID) + 1);
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A7_ID), aprender.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
  assert.equal(aprender.at(-1), A.A7_ID);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A7_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ElViajeDeUnaCaja.jsx", "src/data/contabilidadT7_1_a7_viaje.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★★ vista: T7-1 pinta la pieza nueva en el lugar de A7; ControlInterno ya no lo pinta ninguna vista (N2 de T5 salió con la entrega 5)", () => {
  const ids = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(ids.at(-1), A.A7_ID);
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
  const e = PIEZAS_T7_1.find((x) => x.pieza.id === A.A7_ID);
  assert.equal(e.Pieza, ElViaje);
  assert.equal(e.pieza, P);
  assert.ok(!PIEZAS_T7_1.some((x) => x.Pieza === ControlInterno));
  assert.ok(!PIEZAS_T5.some((x) => x.Pieza === ControlInterno));
  assert.ok(!leer("src/components/ContabilidadT7_1View.jsx").includes("contabilidadT7_1_a7.js"));
});

test("★★ montada como en la vista: el rótulo y el título en la cabecera del Panel, su hoja de estilo dentro", async () => {
  const m = await montar(h(ElViaje, { rotulo: "INVENTARIOS I · APRENDER" }));
  try {
    const s = m.caja.querySelector("section");
    assert.equal(s.querySelector("header h3").textContent, P.titulo);
    assert.equal(s.querySelector("header p").textContent, "INVENTARIOS I · APRENDER");
    assert.ok(s.querySelector("style").textContent.includes(".t7vc-est"));
    assert.ok(s.querySelector(`[data-pieza="${A.A7_ID}"][data-pantalla="p0"]`));
  } finally {
    m.desmontar(); cola.clear();
  }
});
