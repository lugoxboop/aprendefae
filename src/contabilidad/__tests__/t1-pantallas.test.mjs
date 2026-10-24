import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — LA SECUENCIA DE FUTABA, EN DATOS, SIN TOCAR LO QUE SE VE.
 *
 * `contabilidadT1Pantallas.js` es el contenido de las cuatro piezas en el
 * orden de pantallas de la ficha b-t1-aprender-secuencia-y-hacer.md. Lo va a
 * leer el componente de presentación de Erwin; hoy no lo lee nadie. Tres
 * cosas se rompen sin ruido:
 *
 * 1 · EL ORDEN. Cuántas pantallas tiene cada pieza y en qué orden, como en la
 *     tabla de la ficha.
 * 2 · EL ORIGEN DE CADA TEXTO. Lo que se dice «publicado» tiene que SER una
 *     constante publicada; lo que se dice nuevo o recortado no puede serlo.
 *     Si no, Shoko revisa lo que no cambió y se salta lo que sí.
 * 3 · LO QUE SE VE HOY. Las capas 2 montadas siguen diciendo los textos
 *     publicados, paso por paso: la secuencia no se coló en la pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/* Movimiento reducido: sin él, Siguiente espera una animación que en JSDOM no termina nunca. */
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
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
const act = React.act ?? (await import("react-dom/test-utils")).act;

const S = await import("../../data/contabilidadT1Pantallas.js");
const { PANTALLAS_T1, pantallasDe, textosDe, PUBLICADO, RECORTADO, NUEVO } = S;
const I = await import("../../data/contabilidadIntro.js");
const P = await import("../../data/contabilidadPiezas234.js");
const T = await import("../../data/contabilidadTema1.js");
const { ESCENAS_INTRO } = await import("../../components/mecanicas/libros/intro/escenasIntro.jsx");

const IDS = [I.ID, P.ID_P2, P.ID_P3, P.ID_P4];

/* Todas las cadenas publicadas en los tres archivos de datos de T1, a cualquier profundidad. */
const PUBLICADAS = new Set();
const recoger = (x, vistos = new Set()) => {
  if (typeof x === "string") { PUBLICADAS.add(x); return; }
  if (!x || typeof x !== "object" || vistos.has(x)) return;
  vistos.add(x);
  for (const v of Object.values(x)) recoger(v, vistos);
};
for (const m of [I, P, T]) recoger(m);

const palabras = (t) => t.trim().split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;

/* ═══════════════════ 1 · EL ORDEN ═══════════════════ */

test("★★ cada pieza tiene las pantallas de la tabla de la ficha, numeradas sin huecos", () => {
  assert.deepEqual(Object.keys(PANTALLAS_T1), IDS);
  /* La versión 16a85b8 de la ficha: a1 17, a2 15, a3 18 y a4 13 (perdió la parada «¿sale alguna flecha?»). */
  const esperadas = { [I.ID]: 17, [P.ID_P2]: 15, [P.ID_P3]: 18, [P.ID_P4]: 13 };
  for (const id of IDS) {
    const ps = pantallasDe(id);
    assert.equal(ps.length, esperadas[id], `${id}: ${ps.length} pantallas`);
    assert.deepEqual(ps.map((p) => p.n), ps.map((_, k) => k + 1), `${id}: numeración`);
  }
  assert.deepEqual(pantallasDe("t1-desde-donde-preguntan"), []);
});

test("★★ el patrón: abre prediciendo, tiene al menos una parada o decisión, y cierra con frase y puente", () => {
  for (const id of IDS) {
    const hace = pantallasDe(id).map((p) => p.hace);
    assert.equal(hace[0], "predice", `${id}: abre con el gancho`);
    assert.ok(hace.some((h) => h === "parada" || h === "elige"), `${id}: sin parada`);
    assert.deepEqual(hace.slice(-2), ["frase", "puente"], `${id}: cierre`);
  }
});

test("★ el puente de a3 ya no repite la pregunta de a4 · 1 (Shoko: la pregunta queda solo allá)", () => {
  assert.notEqual(pantallasDe(P.ID_P3).at(-1).texto[0].texto, pantallasDe(P.ID_P4)[0].texto[0].texto);
});

test("★★ paradas, decisiones y frases: exactamente una correcta, y la de la frase es la publicada", () => {
  for (const id of IDS) {
    for (const p of pantallasDe(id).filter((x) => ["parada", "elige", "frase"].includes(x.hace))) {
      assert.equal(p.opciones.filter((o) => o.correcta).length, 1, `${id} · ${p.n}: correctas`);
      /* Toda mala trae su devolución; la buena puede no traerla si la confirma la pantalla siguiente (a1 · 12). */
      if (p.hace === "parada") assert.ok(p.opciones.every((o) => o.correcta || o.devolucion?.texto), `${id} · ${p.n}: falta devolución`);
    }
  }
  const pares = [[I.ID, I.OPCIONES], [P.ID_P2, P.OPCIONES_P2], [P.ID_P3, P.OPCIONES_P3], [P.ID_P4, P.OPCIONES_P4]];
  for (const [id, publicadas] of pares) {
    const f = pantallasDe(id).find((p) => p.hace === "frase");
    assert.deepEqual(f.opciones.map((o) => [o.id, o.correcta]), publicadas.map((o) => [o.id, o.correcta]), `${id}: la frase`);
    /* La 2.ª visita (D8): otra correcta entre las mismas opciones, y una devolución por cada una. */
    assert.ok(f.segunda, `${id}: la frase no trae 2.ª visita`);
    assert.notEqual(f.segunda.correcta, publicadas.find((o) => o.correcta).id, `${id}: la 2.ª visita tiene la misma correcta`);
    assert.deepEqual(Object.keys(f.segunda.devoluciones).sort(), publicadas.map((o) => o.id).sort(), `${id}: faltan devoluciones de la 2.ª visita`);
  }
  /* a1 · 12: decide el que manda, el usuario que cierra el ciclo; y no se ofrece «Propietarios». */
  const decide = pantallasDe(I.ID).find((p) => p.n === 12);
  assert.equal(decide.opciones.find((o) => o.correcta).id, I.USUARIOS.find((u) => u.cierraElCiclo).id);
  assert.ok(!decide.opciones.some((o) => o.id === "propietarios"));
});

test("★★ a2 · 12 predice los cuatro casos con los hechos de Caleja, en el orden de la ficha", () => {
  const p = pantallasDe(P.ID_P2).find((x) => x.n === 12);
  assert.equal(p.hace, "predice-casos");
  assert.deepEqual(p.hechos.map((h) => [h.hecho.id, h.caso.id]), [["cal-3", "a"], ["cal-5", "b"], ["cal-4", "c"], ["cal-6", "d"]]);
  /* Los casos a y b suben; c y d bajan (p. 35): la correcta de cada hecho tiene que decir lo mismo que su caso. */
  assert.deepEqual(p.hechos.map((h) => h.correcta === "Crecen los dos lados"), p.hechos.map((h) => h.caso.mueve === P.SUBEN));
});

test("★★ a4 · 11: se clasifican f2 a f5; f1 se ve pero no se pregunta (HUECO, a Miku)", () => {
  const p = pantallasDe(P.ID_P4).find((x) => x.hace === "clasifica");
  assert.deepEqual(p.seClasifican, ["f2", "f3", "f4", "f5"]);
  assert.ok(p.flechas.some((f) => f.id === "f1"));
});

/* ═══════════════════ 2 · EL ORIGEN DE CADA TEXTO ═══════════════════ */

test("★★ «publicado» es una constante publicada; «nuevo» y «recortado» no lo son, y el recorte dice de cuál sale", () => {
  const malos = [];
  let n = 0;
  for (const id of IDS) {
    for (const p of pantallasDe(id)) {
      for (const t of [...textosDe(p), ...(p.cita ? [p.cita] : [])]) {
        n += 1;
        const donde = `${id} · ${p.n}: «${t.texto.slice(0, 40)}»`;
        if (t.origen === PUBLICADO && !PUBLICADAS.has(t.texto)) malos.push(`${donde} dice publicado y no lo es`);
        if (t.origen === NUEVO && PUBLICADAS.has(t.texto)) malos.push(`${donde} dice nuevo y ya está publicado`);
        if (t.origen === RECORTADO && (!PUBLICADAS.has(t.de) || t.de === t.texto)) malos.push(`${donde}: recorte sin texto publicado de origen`);
        if (![PUBLICADO, NUEVO, RECORTADO].includes(t.origen)) malos.push(`${donde}: sin origen`);
      }
    }
  }
  assert.deepEqual(malos, []);
  assert.ok(n > 150, `solo ${n} textos revisados: textosDe no está recorriendo las pantallas`);
});

test("★★ ningún texto que no es cita pasa de 25 palabras (la regla de la ficha)", () => {
  const largos = [];
  for (const id of IDS) {
    for (const p of pantallasDe(id)) {
      for (const t of textosDe(p)) {
        /* Las opciones publicadas de capa 4 y las preguntas de la p. 3 se conservan como están. */
        if (palabras(t.texto) > 25) largos.push(`${id} · ${p.n}: ${palabras(t.texto)} palabras «${t.texto.slice(0, 40)}»`);
      }
    }
  }
  assert.deepEqual(largos, []);
});

/* ═══════════════════ 3 · LO QUE SE VE HOY NO CAMBIÓ ═══════════════════ */

const montar = (Comp) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Comp)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

const PUBLICADO_CAPA2 = {
  [I.ID]: [I.TEXTOS, I.CIERRE, I.ROTULO_CIERRE],
  [P.ID_P2]: [P.TEXTOS_P2, P.CIERRE_P2, P.ROTULO_CIERRE_P2],
  [P.ID_P3]: [P.TEXTOS_P3, P.CIERRE_P3, P.ROTULO_CIERRE_P3],
  [P.ID_P4]: [P.TEXTOS_P4, P.CIERRE_P4, P.ROTULO_CIERRE_P4],
};

for (const id of IDS) {
  test(`★★ ${id}: la capa 2 que ve hoy el estudiante sigue diciendo los textos publicados, paso por paso`, () => {
    const [textos, cierre, rotuloCierre] = PUBLICADO_CAPA2[id];
    const pasos = Object.keys(textos).map(Number).sort((a, b) => a - b);
    const { caja, desmontar } = montar(ESCENAS_INTRO[id].Capa2);
    try {
      const vistas = [];
      for (let vuelta = 0; vuelta < 20; vuelta++) {
        vistas.push({ texto: caja.querySelector("[data-texto-paso]").textContent, todo: caja.textContent });
        const sig = caja.querySelector("[data-siguiente]");
        if (sig.disabled) break;
        tocar(sig);
      }
      assert.deepEqual(vistas.map((v) => v.texto), [...pasos.map((n) => textos[n]), cierre]);
      pasos.forEach((n, k) => assert.ok(vistas[k].todo.includes(`Paso ${n} de ${pasos.length}`)));
      assert.ok(vistas.at(-1).todo.includes(rotuloCierre));
    } finally { desmontar(); }
  });
}

test("★ los rótulos movidos a datos dicen lo mismo que decían, y el componente ya no los escribe", () => {
  const movidos = [
    ["ElRecorridoDeUnHecho.jsx", I.ROTULO_CIERRE, "El ciclo cerrado"],
    ["ElRecorridoDeUnHecho.jsx", I.BOTON_DESDE_EL_PRINCIPIO, "Desde el principio"],
    ["LaEcuacionContable.jsx", P.ROTULO_CIERRE_P2, "La regla"],
    ["LaFotoYLaPelicula.jsx", P.ROTULO_CIERRE_P3, "Las dos fotos y el tramo"],
    ["ComoSeArticulan.jsx", P.ROTULO_CIERRE_P4, "Las cinco a la vez"],
    ["ExploraUsuarios.jsx", I.ALT_RETORNO.encendido, "El trazo de retorno hacia la primera estación está encendido: la decisión de este usuario cambia la actividad de la empresa."],
    ["ExploraUsuarios.jsx", I.ALT_RETORNO.atenuado, "El trazo de retorno permanece atenuado: este usuario consulta el resumen desde afuera del ciclo."],
  ];
  for (const [archivo, valor, antes] of movidos) {
    assert.equal(valor, antes, `${archivo}: el texto cambió al moverlo`);
    const fuente = readFileSync(new URL(`../../components/mecanicas/libros/intro/${archivo}`, import.meta.url), "utf8");
    assert.ok(!fuente.includes(antes), `${archivo}: «${antes.slice(0, 30)}» volvió a escribirse en el componente`);
  }
});

test("★ nada de la vista lee todavía la secuencia: el estudiante ve CuatroCapas", () => {
  const vista = readFileSync(new URL("../../components/IntroContabilidadView.jsx", import.meta.url), "utf8");
  assert.ok(!vista.includes("contabilidadT1Pantallas"), "la vista ya lee la secuencia: eso es el cambio de forma, va con el componente de Erwin");
  assert.ok(vista.includes("<CuatroCapas"));
});
