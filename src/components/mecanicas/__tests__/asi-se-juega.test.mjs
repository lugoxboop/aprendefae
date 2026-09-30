import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUE 1 (T1-8, T1-7, T1-4).
 *
 * Lo que no se puede romper:
 *
 *   · la demo es el componente real y NO guarda nada: ni onCompletar, ni FP,
 *     ni intentos, ni una sola escritura
 *   · los ejemplos no son del banco: nadie se encuentra en la partida la
 *     respuesta que acaba de ver resuelta
 *   · sale sola la primera vez, no la segunda, y «¿Cómo se juega?» la trae
 *   · «Siguiente» está apagado hasta que termina la primera pasada
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let movimientoReducido = false;
w.matchMedia = (q) => ({
  matches: q.includes("reduce") ? movimientoReducido : false,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
  scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const AsiSeJuega = (await import("../libros/AsiSeJuega.jsx")).default;
const DondeSeRompio = (await import("../libros/tema1/DondeSeRompio.jsx")).default;
const LaArticulacion = (await import("../libros/tema1/LaArticulacion.jsx")).default;
const QueLePasaACadaUno = (await import("../libros/tema1/QueLePasaACadaUno.jsx")).default;
const { MarcoLibros } = await import("../bloques/marcos.jsx");
const { JUEGOS, JuegoConTutorial } = await import("../../IntroContabilidadView.jsx");
const {
  ASI_SE_JUEGA, EJEMPLO_T1_8, EJEMPLO_T1_4, BANCO_DEMO_T1_7,
} = await import("../../../data/asiSeJuegaBloque1.js");
const {
  T1_4, T1_7, T1_8, SITUACIONES_T1_8, TRANSACCIONES_CAP2, LINEAS, FLECHAS, INFORMES_T1_7,
} = await import("../../../data/contabilidadTema1.js");
const { yaLaVio, marcarVista, claveDe, PREFIJO } = await import("../../../hacer/asiSeJuega.js");
const { ASI_SE_JUEGA: ASI_TODAS } = await import("../../../data/asiSeJuega.js");
const { evaluarT1_7, evaluarT1_4 } = await import("../../../contabilidad/tema1.js");

/* Ninguna llamada a la red en todo el archivo: la demo no guarda nada en ningún sitio. */
const llamadasARed = [];
globalThis.fetch = async (...args) => { llamadasARed.push(args); throw new Error("sin red en las pruebas"); };

const montar = (elemento) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto);
const esperar = async (cond, ms = 4000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error("no llegó a tiempo");
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
};
const juegoDe = (id) => JUEGOS.find((j) => j.id === id);
const MECANICA = {
  [T1_8.id]: DondeSeRompio, [T1_7.id]: LaArticulacion, [T1_4.id]: QueLePasaACadaUno,
};
/* Las escrituras al navegador, contadas. */
const contarEscrituras = () => {
  const original = w.Storage.prototype.setItem;
  const escritas = [];
  w.Storage.prototype.setItem = function (k, v) { escritas.push(k); return original.call(this, k, v); };
  return { escritas, soltar: () => { w.Storage.prototype.setItem = original; } };
};

/* ═══════════════════ LOS TEXTOS DE LEVI ═══════════════════ */

test("★★ el Bloque 1 son tres actividades, con sus tres pasos y su texto alternativo", () => {
  assert.deepEqual(Object.keys(ASI_SE_JUEGA).sort(), [T1_4.id, T1_7.id, T1_8.id].sort());
  assert.deepEqual(ASI_SE_JUEGA[T1_8.id].pasos, [
    "Lee lo que pasó en la panadería.", "Toca el punto donde se rompió.", "Elige cuántos se apagan: ese punto y los que siguen.",
  ]);
  assert.deepEqual(ASI_SE_JUEGA[T1_7.id].pasos, [
    "Toca la línea de donde sale.", "Toca la línea a donde llega.", "Mira si la flecha queda trazada.",
  ]);
  assert.deepEqual(ASI_SE_JUEGA[T1_4.id].pasos, [
    "Lee el hecho de la panadería.", "Toca sube, baja o queda igual en cada parte.", "Mira cómo se mueven las tres barras.",
  ]);
  /* La consigna de la pantalla es la de la actividad, la misma palabra por palabra. */
  for (const [id, asi] of Object.entries(ASI_SE_JUEGA)) {
    const datos = { [T1_8.id]: T1_8, [T1_7.id]: T1_7, [T1_4.id]: T1_4 }[id];
    assert.equal(asi.consigna, datos.consigna, `${id}: la consigna no es la de la actividad`);
    assert.equal(asi.titulo, datos.nombre, `${id}: el título no es el de la actividad`);
    assert.ok(asi.alt.length > 40, `${id}: sin texto alternativo`);
  }
  assert.equal(T1_7.consigna, "Toca la línea de donde sale la flecha. Luego toca la línea a donde llega.");
  assert.equal(EJEMPLO_T1_8.texto, "La panadería compró harina y la pagó en efectivo. No pidió factura.");
  assert.equal(EJEMPLO_T1_4.texto, "La panadería compró un horno a crédito.");
});

test("★★ T1-7: «Caja y bancos» ahora se llama «Efectivo»", () => {
  assert.equal(LINEAS.find((l) => l.id === "l-caja").nombre, "Efectivo");
  assert.ok(!LINEAS.some((l) => l.nombre === "Caja y bancos"));
});

test("★★ T1-7: el texto alternativo de la demo es el de Levi, sin la marca retirada", () => {
  assert.equal(ASI_SE_JUEGA[T1_7.id].alt,
    "Dos hojas de la panadería, con dos líneas cada una. Se toca «Total vendido» y luego «Ventas de la semana 1». Una flecha queda trazada entre las dos.");
});

test("★★★ T1-7: al acertar, las líneas sin conectar se atenúan igual en la partida que en la demo", () => {
  const opacidades = (caja, ids) => ids.map((id) => caja.querySelector(`[data-linea="${id}"]`).style.opacity);
  const f = FLECHAS[0];
  const otra = LINEAS.find((l) => l.id !== f.desde && l.id !== f.hasta).id;

  /* La partida de verdad, sin modo demo: justo después de acertar. */
  const real = montar(React.createElement(LaArticulacion, { Marco: MarcoLibros, onCompletar: () => {} }));
  let enLaPartida;
  try {
    tocar(real.caja.querySelector(`[data-linea="${f.desde}"]`));
    tocar(real.caja.querySelector(`[data-linea="${f.hasta}"]`));
    enLaPartida = opacidades(real.caja, [f.desde, f.hasta, otra]);
  } finally { real.desmontar(); }

  /* La demo, con el mismo gesto. */
  const demo = montar(React.createElement(LaArticulacion, {
    Marco: MarcoLibros, modoDemo: true, ...ASI_SE_JUEGA[T1_7.id].demo,
  }));
  try {
    tocar(demo.caja.querySelector('[data-linea="demo-total-vendido"]'));
    tocar(demo.caja.querySelector('[data-linea="demo-ventas-semana-1"]'));
    const enLaDemo = opacidades(demo.caja, ["demo-total-vendido", "demo-ventas-semana-1", "demo-pan-sobro"]);
    assert.deepEqual(enLaDemo, enLaPartida, "la demo atenúa distinto que la partida");
    assert.deepEqual(enLaDemo, ["1", "1", "0.55"]);
    assert.equal(opacidades(demo.caja, ["demo-pedidos-proximo-mes"])[0], "0.55");
  } finally { demo.desmontar(); }
});

test("★★ T1-7: «Utilidad del ejercicio» sigue siendo el destino de la conexión 1, y se puede tocar", () => {
  const f1 = FLECHAS.find((f) => f.id === "f1");
  assert.equal(f1.desde, "l-utilidad-neta");
  assert.equal(f1.hasta, "l-utilidad-balance");
  assert.equal(evaluarT1_7("l-utilidad-neta", "l-utilidad-balance").ok, true);
  const { caja, desmontar } = montar(React.createElement(LaArticulacion, { Marco: MarcoLibros, onCompletar: () => {} }));
  try {
    assert.equal(caja.querySelector('[data-linea="l-utilidad-balance"]').disabled, false);
  } finally { desmontar(); }
});

/* ═══════════════════ LOS EJEMPLOS NO SON DEL BANCO ═══════════════════ */

test("★★★ ningún ejemplo de la demo está en el banco que se sortea", () => {
  assert.ok(!SITUACIONES_T1_8.some((s) => s.id === EJEMPLO_T1_8.id || s.texto === EJEMPLO_T1_8.texto), "la harina está en el banco de T1-8");
  assert.ok(!TRANSACCIONES_CAP2.some((t) => t.id === EJEMPLO_T1_4.id || t.texto === EJEMPLO_T1_4.texto), "el horno está en el banco de T1-4");
  const nombres = new Set(LINEAS.map((l) => l.nombre));
  for (const l of BANCO_DEMO_T1_7.lineas) {
    assert.ok(!LINEAS.some((x) => x.id === l.id), `${l.id} está en el banco de T1-7`);
    assert.ok(!nombres.has(l.nombre), `«${l.nombre}» es una línea del banco de T1-7`);
  }
  for (const f of BANCO_DEMO_T1_7.flechas) assert.ok(!FLECHAS.some((x) => x.id === f.id));
  for (const i of BANCO_DEMO_T1_7.informes) assert.ok(!INFORMES_T1_7.some((x) => x.id === i.id));
});

test("★★ los ejemplos se resuelven con la lógica de verdad, y dicen lo que Gen escribió", () => {
  const t4 = evaluarT1_4(EJEMPLO_T1_4, { activo: "sube", pasivo: "sube", patrimonio: "igual" });
  assert.equal(t4.ok, true);
  assert.equal(t4.texto, EJEMPLO_T1_4.acierto);
  const t7 = evaluarT1_7("demo-total-vendido", "demo-ventas-semana-1", BANCO_DEMO_T1_7);
  assert.equal(t7.ok, true);
  assert.equal(t7.flecha.marca, undefined, "volvió la marca «la misma cifra»");
  /* Las dos líneas de relleno están en su hoja y no se conectan con nada. */
  const nombre = (id) => BANCO_DEMO_T1_7.lineas.find((l) => l.id === id);
  assert.equal(nombre("demo-pan-sobro").nombre, "Pan que sobró");
  assert.equal(nombre("demo-pan-sobro").informe, "demo-semana");
  assert.equal(nombre("demo-pedidos-proximo-mes").nombre, "Pedidos del próximo mes");
  assert.equal(nombre("demo-pedidos-proximo-mes").informe, "demo-mes");
  assert.equal(BANCO_DEMO_T1_7.flechas.length, 1);
  for (const id of ["demo-pan-sobro", "demo-pedidos-proximo-mes"]) {
    assert.ok(!BANCO_DEMO_T1_7.flechas.some((f) => f.desde === id || f.hasta === id), `${id} se conecta`);
  }
  assert.equal(evaluarT1_7("demo-pan-sobro", "demo-pedidos-proximo-mes", BANCO_DEMO_T1_7).ok, false);
  /* Y sin su banco, la lógica de verdad no las conoce. */
  assert.throws(() => evaluarT1_7("demo-total-vendido", "demo-ventas-semana-1"));
});

/* ═══════════════════ LA MARCA DE «YA LA VIO» ═══════════════════ */

test("★★ la marca va por usuario y por actividad, y si el navegador falla no rompe nada", () => {
  const almacen = new Map();
  const falso = { getItem: (k) => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, v) };
  assert.equal(yaLaVio("a", "u1", falso), false);
  marcarVista("a", "u1", falso);
  assert.equal(yaLaVio("a", "u1", falso), true);
  assert.equal(yaLaVio("a", "u2", falso), false, "la marca de un usuario vale para otro");
  assert.equal(yaLaVio("b", "u1", falso), false, "la marca de una actividad vale para otra");
  assert.ok(claveDe("a", "u1").startsWith("fae-"));
  assert.ok(claveDe("a", "u1").startsWith(PREFIJO));

  const roto = { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } };
  assert.equal(yaLaVio("a", "u1", roto), false, "sin almacenamiento tiene que enseñarse");
  assert.doesNotThrow(() => marcarVista("a", "u1", roto));
});

/* ═══════════════════ PRIMERA VEZ, SEGUNDA VEZ, Y «¿CÓMO SE JUEGA?» ═══════════════════ */

const tutorial = (id, usuarioId = "u-prueba") => React.createElement(JuegoConTutorial, {
  juego: juegoDe(id), usuarioId, Marco: MarcoLibros, acento: "#E9C46A", rotulo: "PRUEBA", onCompletar: () => {},
});

for (const id of [T1_8.id, T1_7.id, T1_4.id]) {
  test(`★★★ ${id}: sale la primera vez, no la segunda, y «¿Cómo se juega?» la trae de vuelta`, () => {
    w.localStorage.clear();
    const uno = montar(tutorial(id));
    try {
      assert.ok(uno.caja.querySelector(`[data-asi-se-juega="${id}"]`), "la primera vez no salió");
      assert.equal(uno.caja.querySelector("[data-partida]").hidden, true, "la partida se ve debajo del tutorial");
    } finally { uno.desmontar(); }

    const dos = montar(tutorial(id));
    try {
      assert.equal(dos.caja.querySelector("[data-asi-se-juega]"), null, "salió otra vez");
      assert.equal(dos.caja.querySelector("[data-partida]").hidden, false);
      const ayuda = dos.caja.querySelector("[data-encabezado] [data-como-se-juega]");
      assert.ok(ayuda, "no está «¿Cómo se juega?» bajo la consigna");
      assert.ok(ayuda.textContent.includes("¿Cómo se juega?"));
      tocar(ayuda);
      assert.ok(dos.caja.querySelector(`[data-asi-se-juega="${id}"]`), "«¿Cómo se juega?» no la abrió");
    } finally { dos.desmontar(); }

    /* Otro estudiante en el mismo navegador la ve como nueva. */
    const otro = montar(tutorial(id, "u-otro"));
    try {
      assert.ok(otro.caja.querySelector("[data-asi-se-juega]"), "la marca de un estudiante valió para otro");
    } finally { otro.desmontar(); }
  });
}

test("★★ si el navegador no deja guardar, la pantalla sale igual", () => {
  const getItem = w.Storage.prototype.getItem;
  const setItem = w.Storage.prototype.setItem;
  w.Storage.prototype.getItem = () => { throw new Error("bloqueado"); };
  w.Storage.prototype.setItem = () => { throw new Error("bloqueado"); };
  try {
    const { caja, desmontar } = montar(tutorial(T1_8.id));
    try {
      assert.ok(caja.querySelector("[data-asi-se-juega]"));
    } finally { desmontar(); }
  } finally {
    w.Storage.prototype.getItem = getItem;
    w.Storage.prototype.setItem = setItem;
  }
});

test("★★ solo las que tienen «Así se juega» llevan «¿Cómo se juega?»: las demás no tienen a dónde llevar", () => {
  w.localStorage.clear();
  for (const j of JUEGOS) {
    const { caja, desmontar } = montar(tutorial(j.id));
    try {
      const tiene = Boolean(ASI_TODAS[j.id]);
      assert.equal(Boolean(caja.querySelector("[data-asi-se-juega]")), tiene, `${j.id}`);
      assert.equal(Boolean(caja.querySelector("[data-como-se-juega]")), tiene, `${j.id}`);
    } finally { desmontar(); }
  }
});

/* ═══════════════════ LA PANTALLA ═══════════════════ */

const pantalla = (id, extra = {}) => React.createElement(AsiSeJuega, {
  asi: ASI_SE_JUEGA[id], Mecanica: MECANICA[id], onSiguiente: () => {}, escala: 0.05, ...extra,
});

test("★★★ accesible: figura con su descripción, solo el componente inerte, mano oculta, pasos en <ol>", () => {
  const { caja, desmontar } = montar(pantalla(T1_8.id));
  try {
    const figura = caja.querySelector("figure");
    assert.ok(figura, "la demo no es una figura");
    assert.equal(figura.querySelector("figcaption").textContent, `Ejemplo: ${ASI_SE_JUEGA[T1_8.id].alt}`);
    assert.equal(caja.querySelectorAll("[inert]").length, 1, "hay más de una cosa inerte, o ninguna");
    assert.ok(caja.querySelector("[inert]").matches("[data-asj-escenario]"), "lo inerte no es el componente");
    assert.equal(caja.querySelector("[data-mano]").getAttribute("aria-hidden"), "true");
    assert.equal(caja.querySelector("ol[data-asj-pasos]").children.length, 3);
    assert.equal(caja.querySelector("h2").textContent, T1_8.nombre);
    /* Ni el control ni «Siguiente» están dentro de lo inerte. */
    assert.equal(caja.querySelector("[inert] [data-asj-control]"), null);
    assert.equal(caja.querySelector("[inert] [data-asj-siguiente]"), null);
  } finally { desmontar(); }
});

for (const id of [T1_8.id, T1_7.id, T1_4.id]) {
  test(`★★ ${id}: el ejemplo se distingue — recuadro navy sólido, etiqueta centrada con ojo, y «Ejemplo: » en la descripción`, () => {
    const { caja, desmontar } = montar(pantalla(id));
    try {
      const recuadro = caja.querySelector("[data-asj-demo]");
      assert.equal(recuadro.style.background, "rgb(29, 53, 87)", "el fondo no es #1D3557");
      assert.equal(recuadro.style.border, "1.5px dashed rgb(184, 196, 212)");
      const etiqueta = recuadro.querySelector("[data-asj-etiqueta]");
      assert.equal(etiqueta.textContent, "EJEMPLO");
      assert.equal(etiqueta.style.left, "50%");
      assert.equal(etiqueta.style.transform, "translate(-50%, -50%)");
      assert.equal(etiqueta.style.fontSize, "14px");
      assert.equal(etiqueta.style.fontWeight, "700");
      assert.equal(etiqueta.style.letterSpacing, "0.12em");
      assert.equal(etiqueta.style.padding, "6px 18px");
      assert.equal(etiqueta.style.background, "rgb(184, 196, 212)");
      assert.equal(etiqueta.style.color, "rgb(29, 53, 87)");
      const ojo = etiqueta.querySelector("svg");
      assert.ok(ojo, "falta el ojo");
      assert.equal(ojo.getAttribute("width"), "14");
      assert.equal(ojo.getAttribute("stroke"), "#1D3557");
      assert.ok(etiqueta.firstElementChild === ojo, "el ojo no va a la izquierda del texto");
      const alt = caja.querySelector("figure figcaption").textContent;
      assert.ok(alt.startsWith("Ejemplo: "), `${id}: la descripción no empieza por «Ejemplo: »`);
      assert.equal(alt, `Ejemplo: ${ASI_SE_JUEGA[id].alt}`);
    } finally { desmontar(); }
  });

  test(`★★★ ${id}: «Siguiente» apagado hasta que termina la primera pasada, y la demo no guarda nada`, async () => {
    w.localStorage.clear();
    const conteo = contarEscrituras();
    const redAntes = llamadasARed.length;
    let siguiente = 0;
    const { caja, desmontar } = montar(pantalla(id, { onSiguiente: () => { siguiente += 1; } }));
    try {
      const sig = () => caja.querySelector("[data-asj-siguiente] button");
      assert.equal(sig().disabled, true, "«Siguiente» nace encendido");
      assert.equal(sig().textContent, "Mira el ejemplo");
      assert.equal(sig().style.color, "rgb(168, 182, 200)", "«Mira el ejemplo» no va en #A8B6C8");
      assert.equal(caja.querySelector("[data-asj-control]").textContent, "Pausar");
      tocar(sig());
      assert.equal(siguiente, 0, "«Siguiente» apagado dejó pasar");

      await esperar(() => !sig().disabled);
      assert.equal(sig().textContent, "Siguiente");
      assert.equal(caja.querySelector("[data-asj-control]").textContent, "Ver de nuevo");
      tocar(sig());
      assert.equal(siguiente, 1);

      /* Lo que la demo enseña al terminar, pintado por el componente real. */
      if (id === T1_8.id) {
        await esperar(() => caja.querySelector("[data-contador]")?.textContent === "Se apagaron 4 puntos.");
        assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 4);
        assert.ok(caja.querySelector('[data-prediccion-opcion="4"][data-elegida="si"]'));
      }
      if (id === T1_7.id) {
        assert.ok(caja.querySelector("[data-hilo]").textContent.includes("Total vendido → Ventas de la semana 1"));
        assert.equal(caja.querySelector("[data-hilo]").textContent, "Total vendido → Ventas de la semana 1");
        assert.equal(caja.querySelectorAll("[data-asj-escenario] [data-linea]").length, 4);
      }
      if (id === T1_4.id) {
        assert.equal(caja.querySelector('[data-barra="activo"]').dataset.alto, "62");
        assert.equal(caja.querySelector('[data-barra="pasivo"]').dataset.alto, "62");
        assert.equal(caja.querySelector('[data-barra="patrimonio"]').dataset.alto, "44");
      }
      await esperar(() => caja.querySelector('[role="status"]'));
      const retro = caja.querySelector('[role="status"]');
      assert.ok(retro?.textContent.startsWith("Correcto: ✅"), "la demo no mostró su acierto");

      /* Ni botón de seguir de la partida, ni avance, ni encabezado: solo la zona de juego. */
      assert.equal(caja.querySelector("[data-escenario] [data-encabezado]"), null);
      assert.equal(caja.querySelector("[data-asj-escenario] [data-encabezado]"), null);
      assert.equal(caja.querySelector("[data-asj-escenario] [data-nodo]"), null, "la demo pinta el avance");
      for (const texto of ["Siguiente situación", "Siguiente hecho", "Siguiente flecha", "Ver el resultado"]) {
        assert.equal(boton(caja.querySelector("[data-asj-escenario]"), texto), undefined, `la demo ofrece «${texto}»`);
      }
    } finally {
      desmontar();
      conteo.soltar();
    }
    assert.deepEqual(conteo.escritas, [], "la demo escribió en el navegador");
    assert.equal(llamadasARed.length, redAntes, "la demo llamó a la red");
  });
}

test("★★ «Pausar» detiene el guion, y «Ver de nuevo» lo vuelve a correr desde el principio", async () => {
  const { caja, desmontar } = montar(pantalla(T1_7.id, { escala: 0.2 }));
  try {
    const control = () => caja.querySelector("[data-asj-control]");
    tocar(control());
    assert.equal(control().textContent, "Seguir");
    await act(async () => { await new Promise((r) => setTimeout(r, 600)); });
    assert.equal(caja.querySelector('[data-linea][data-estado]'), null, "en pausa la demo siguió tocando");
    tocar(control());
    await esperar(() => control().textContent === "Ver de nuevo");
    assert.ok(caja.querySelector("[data-hilo]"));
    tocar(control());
    assert.equal(caja.querySelector("[data-hilo]"), null, "«Ver de nuevo» no volvió al principio");
    assert.equal(control().textContent, "Pausar");
    /* La segunda pasada no apaga «Siguiente»: ya se vio una vez. */
    assert.equal(caja.querySelector("[data-asj-siguiente] button").disabled, false);
  } finally { desmontar(); }
});

test("★★★ «Pausar» congela también la cascada de T1-8, y «Seguir» la retoma donde quedó", async () => {
  /* A tiempo real: acelerado, el guion terminaría antes que la cascada. */
  const { caja, desmontar } = montar(pantalla(T1_8.id, { escala: 1 }));
  try {
    const control = () => caja.querySelector("[data-asj-control]");
    const apagados = () => caja.querySelectorAll('[data-asj-escenario] [data-apagado="si"]').length;
    /* Hasta que la cascada vaya por la mitad. */
    await esperar(() => apagados() >= 1 && apagados() < 4, 6000);
    tocar(control());
    assert.equal(control().textContent, "Seguir");
    const congelados = apagados();
    await act(async () => { await new Promise((r) => setTimeout(r, 900)); });
    assert.equal(apagados(), congelados, "en pausa siguieron apagándose puntos");
    assert.equal(caja.querySelector('[data-asj-escenario] [role="status"]'), null, "en pausa llegó al final");
    tocar(control());
    assert.equal(control().textContent, "Pausar");
    await esperar(() => apagados() === 4, 3000);
    assert.ok(apagados() > congelados, "«Seguir» no la retomó");
  } finally { desmontar(); }
});

test("★★★ movimiento reducido: tres cuadros, la mano quieta en el gesto, «Siguiente» en el tercero", async () => {
  movimientoReducido = true;
  try {
    const { caja, desmontar } = montar(pantalla(T1_8.id));
    try {
      const control = () => caja.querySelector("[data-asj-control]");
      const sig = () => caja.querySelector("[data-asj-siguiente] button");
      assert.equal(control().textContent, "Siguiente cuadro");
      assert.equal(caja.querySelector("[data-asj-cuadro]").textContent, "Cuadro 1 de 3");
      /* Sin reloj: medio segundo después sigue en el inicio. */
      await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
      assert.equal(caja.querySelector('[data-prediccion-opcion]'), null, "la demo corrió sola");
      assert.equal(sig().disabled, true);

      tocar(control());
      assert.equal(caja.querySelector("[data-asj-cuadro]").textContent, "Cuadro 2 de 3");
      assert.ok(caja.querySelector('[data-prediccion-opcion="4"]'), "el cuadro del gesto no tocó el punto");
      assert.equal(caja.querySelector("[data-mano]").style.opacity, "0.92", "la mano no está sobre el gesto");
      assert.equal(sig().disabled, true, "«Siguiente» se encendió antes del tercer cuadro");

      tocar(control());
      assert.equal(caja.querySelector("[data-asj-cuadro]").textContent, "Cuadro 3 de 3");
      assert.equal(sig().disabled, false);
      assert.equal(sig().textContent, "Siguiente");
      await esperar(() => caja.querySelector("[data-contador]")?.textContent === "Se apagaron 4 puntos.");
      assert.equal(control().textContent, "Ver de nuevo");
    } finally { desmontar(); }
  } finally { movimientoReducido = false; }
});

/* ═══════════════════ EL TEXTO ATENUADO, #A8B6C8 EN EL COMPONENTE REAL ═══════════════════ */

test("★★ T1-4 real: el «·» antes de revelar y «Marca las tres» apagado van en #A8B6C8", () => {
  const { caja, desmontar } = montar(React.createElement(QueLePasaACadaUno, { Marco: MarcoLibros, onCompletar: () => {} }));
  try {
    const puntos = [...caja.querySelectorAll('[data-signo="sin"]')];
    assert.equal(puntos.length, 3);
    for (const x of puntos) assert.equal(x.style.color, "rgb(168, 182, 200)");
    const marca = boton(caja, "Marca las tres");
    assert.equal(marca.disabled, true);
    assert.equal(marca.style.color, "rgb(168, 182, 200)");
  } finally { desmontar(); }
});

test("★★ T1-8 real: números apagados, chip «apagado» y predicción no elegida van en #A8B6C8", async () => {
  const { caja, desmontar } = montar(React.createElement(DondeSeRompio, {
    Marco: MarcoLibros, onCompletar: () => {}, items: [EJEMPLO_T1_8],
  }));
  try {
    tocar(caja.querySelector(`[data-punto="${EJEMPLO_T1_8.rompe}"]`));
    await esperar(() => caja.querySelector('[data-prediccion-opcion="4"]'));
    tocar(caja.querySelector('[data-prediccion-opcion="4"]'));
    await esperar(() => caja.querySelectorAll('[data-apagado="si"]').length === 4);
    for (const n of [2, 3, 4, 5]) {
      const p = caja.querySelector(`[data-punto="${n}"]`);
      assert.equal(p.querySelector("[data-numero]").style.color, "rgb(168, 182, 200)", `número ${n}`);
      assert.equal(p.querySelector("[data-rotulo-apagado]").style.color, "rgb(168, 182, 200)", `chip del ${n}`);
    }
    for (const n of [1, 2, 3]) {
      const op = caja.querySelector(`[data-prediccion-opcion="${n}"]`);
      assert.equal(op.style.color, "rgb(168, 182, 200)", `opción ${n}`);
      assert.equal(op.style.opacity, "", `opción ${n}: el botón entero lleva opacidad`);
      assert.equal(op.style.borderColor, "rgba(248, 249, 250, 0.15)", `opción ${n}: el borde no va al 0,5`);
    }
  } finally { desmontar(); }
});

/* ═══════════════════ T1-8: LA REGLA DE QUÉ SE APAGA ═══════════════════ */

const REGLA = "Se apaga el punto donde se rompió y todos los que siguen.";
const reglaBajoLaPregunta = (caja) => {
  const regla = caja.querySelector("[data-prediccion] [data-regla-prediccion]");
  assert.ok(regla, "no está la línea de la regla");
  assert.equal(regla.textContent, REGLA);
  assert.equal(regla.previousElementSibling.textContent, "¿Cuántos puntos se van a apagar?", "la regla no va justo debajo de la pregunta");
  assert.equal(regla.style.color, "rgba(248, 249, 250, 0.6)", "la regla no va en el gris de la consigna");
};

test("★★★ T1-8 real: debajo de la pregunta de predicción, la regla fija; y acertar dice «Acertaste»", async () => {
  const { caja, desmontar } = montar(React.createElement(DondeSeRompio, {
    Marco: MarcoLibros, onCompletar: () => {}, items: [EJEMPLO_T1_8],
  }));
  try {
    tocar(caja.querySelector(`[data-punto="${EJEMPLO_T1_8.rompe}"]`));
    await esperar(() => caja.querySelector('[data-prediccion-opcion="4"]'));
    reglaBajoLaPregunta(caja);
    tocar(caja.querySelector('[data-prediccion-opcion="4"]'));
    /* Fija: sigue ahí después de elegir. */
    reglaBajoLaPregunta(caja);
    await esperar(() => caja.querySelector("[data-cierre-prediccion]"));
    assert.equal(caja.querySelector("[data-cierre-prediccion]").textContent, "Acertaste. Mira hasta dónde llegó.");
  } finally { desmontar(); }
});

test("★★ T1-8: fallar la predicción conserva su texto de siempre", async () => {
  const { caja, desmontar } = montar(React.createElement(DondeSeRompio, {
    Marco: MarcoLibros, onCompletar: () => {}, items: [EJEMPLO_T1_8],
  }));
  try {
    tocar(caja.querySelector(`[data-punto="${EJEMPLO_T1_8.rompe}"]`));
    await esperar(() => caja.querySelector('[data-prediccion-opcion="1"]'));
    tocar(caja.querySelector('[data-prediccion-opcion="1"]'));
    await esperar(() => caja.querySelector("[data-cierre-prediccion]"));
    assert.equal(caja.querySelector("[data-cierre-prediccion]").textContent, "No era lo que creías. Mira hasta dónde alcanzó a llegar.");
  } finally { desmontar(); }
});

test("★★ T1-8 en la demo: la regla también se ve, porque es el componente real", async () => {
  const { caja, desmontar } = montar(pantalla(T1_8.id));
  try {
    await esperar(() => caja.querySelector("[data-asj-escenario] [data-prediccion]"));
    reglaBajoLaPregunta(caja.querySelector("[data-asj-escenario]"));
    assert.equal(caja.querySelectorAll("ol[data-asj-pasos] li")[2].textContent, "3Elige cuántos se apagan: ese punto y los que siguen.");
  } finally { desmontar(); }
});

/* ═══════════════════ EL MODO DEMO, DIRECTO SOBRE LOS COMPONENTES ═══════════════════ */

test("★★★ en modo demo, terminar el ítem no llama a onCompletar ni ofrece seguir", () => {
  let llamadas = 0;
  const onCompletar = () => { llamadas += 1; };
  const { caja, desmontar } = montar(React.createElement(QueLePasaACadaUno, {
    Marco: MarcoLibros, modoDemo: true, items: [EJEMPLO_T1_4], onCompletar,
  }));
  try {
    tocar(caja.querySelector('[data-control="activo-sube"]'));
    tocar(caja.querySelector('[data-control="pasivo-sube"]'));
    tocar(caja.querySelector('[data-control="patrimonio-igual"]'));
    tocar(boton(caja, "Ver qué pasó"));
    assert.equal(boton(caja, "Ver el resultado"), undefined);
    assert.equal(boton(caja, "Siguiente hecho"), undefined);
    assert.equal(llamadas, 0);
  } finally { desmontar(); }
  assert.equal(llamadas, 0);
});
