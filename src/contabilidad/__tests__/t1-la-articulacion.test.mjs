import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-7 · LA ARTICULACIÓN
 *
 * Tres cosas se rompen sin hacer ruido.
 *
 * LA REGLA NO PUEDE ESTAR DIBUJADA DE ENTRADA. «Todas llegan al mismo informe
 * y de ese no sale ninguna» es lo que hay que descubrir, así que ni los nodos
 * ni los colores pueden distinguir un origen de un destino. Los diez nodos son
 * el mismo.
 *
 * EL HILO ES MOMENTÁNEO. Si las flechas se quedaran en pantalla, con cuatro
 * dibujadas la quinta se deduce por descarte y deja de preguntarse nada.
 *
 * LA PRIORIDAD C > B > A. Los tres errores se solapan: unir los dos informes
 * que no se hablan es también «esas dos no se pasan nada», y dibujar al revés
 * también. Si el orden se invierte, al que cometió el error de concepto se le
 * responde con la frase que menos le dice.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const LaArticulacion = (await import("../../components/mecanicas/libros/tema1/LaArticulacion.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  evaluarT1_7, lineaPorId, lineasDe, informeQueRecibe, flechaEntre, aciertoDeFlecha,
} = await import("../tema1.js");
const {
  T1_7, LINEAS, FLECHAS, INFORMES_T1_7, ERROR_T1_7, ACIERTO_T1_7,
  CIERRE_T1_7, INVERSO_T1_7, PRIMERO, SEGUNDO, FLUJOS,
} = await import("../../data/contabilidadTema1.js");
const { FAE } = await import("../../theme.js");

const montar = () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(LaArticulacion, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const clic = (caja, id) => tocar(caja.querySelector(`[data-linea="${id}"]`));
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(texto));

/* ═══════════════════ EL GRÁFICO ═══════════════════ */

test("★★★ las cinco flechas llegan al mismo informe, y de ese no sale ninguna", () => {
  assert.equal(FLECHAS.length, 5);
  const receptor = informeQueRecibe();
  for (const f of FLECHAS) {
    assert.equal(lineaPorId(f.hasta).informe, receptor, `${f.id}: no llega al informe que recibe`);
    assert.notEqual(lineaPorId(f.desde).informe, receptor, `${f.id}: sale del informe que recibe`);
  }
  /* Y el receptor es el de lo que la empresa tiene y debe hoy. */
  assert.equal(receptor, PRIMERO);
});

test("★★ cada flecha llega a una línea distinta, y cada origen es distinto", () => {
  assert.equal(new Set(FLECHAS.map((f) => f.hasta)).size, 5, "dos flechas llegan a la misma línea");
  assert.equal(new Set(FLECHAS.map((f) => f.desde)).size, 5, "dos flechas salen de la misma línea");
  for (const f of FLECHAS) {
    assert.ok(lineaPorId(f.desde), `${f.id}: el origen no existe`);
    assert.ok(lineaPorId(f.hasta), `${f.id}: el destino no existe`);
    assert.ok(ACIERTO_T1_7[f.id], `${f.id}: sin devolución`);
    assert.ok(ACIERTO_T1_7[f.id].startsWith("✅"), `${f.id}: la devolución perdió su marca`);
  }
  assert.equal(new Set(Object.values(ACIERTO_T1_7)).size, 5, "dos flechas comparten devolución");
});

test("★★ los tres informes tienen líneas, y los nombres no se repiten", () => {
  assert.equal(INFORMES_T1_7.length, 3);
  for (const inf of INFORMES_T1_7) {
    assert.ok(lineasDe(inf.id).length > 0, `${inf.id}: sin líneas`);
    assert.ok(inf.idea.length > 3 && inf.termino.length > 3 && inf.cuando.length > 3, `${inf.id}: le falta un rótulo`);
    assert.ok(!inf.idea.includes(inf.termino), `${inf.id}: el término está metido en la idea`);
  }
  assert.equal(new Set(LINEAS.map((l) => l.nombre)).size, LINEAS.length, "dos líneas se llaman igual");
  assert.equal(new Set(LINEAS.map((l) => l.id)).size, LINEAS.length, "dos líneas comparten id");
});

/* ═══════════════════ LA PRIORIDAD C > B > A ═══════════════════ */

test("★★★ unir los dos informes que no se hablan es C, aunque también sea «no se pasan nada»", () => {
  const delSegundo = lineasDe(SEGUNDO);
  const deFlujos = lineasDe(FLUJOS);
  let comprobados = 0;
  for (const a of delSegundo) {
    for (const b of deFlujos) {
      for (const [x, y] of [[a, b], [b, a]]) {
        const r = evaluarT1_7(x.id, y.id);
        assert.equal(r.patron, "C", `${x.id} → ${y.id}: no salió la C`);
        assert.equal(r.texto, ERROR_T1_7.C);
        comprobados += 1;
      }
    }
  }
  assert.ok(comprobados > 0, "no se comprobó ninguna pareja");
});

test("★★★ la pareja buena dibujada al revés es B, no A", () => {
  for (const f of FLECHAS) {
    const r = evaluarT1_7(f.hasta, f.desde);
    assert.equal(r.patron, "B", `${f.id} al revés no dio B`);
    assert.equal(r.texto, ERROR_T1_7.B);
    assert.equal(r.deberiaSer?.id, f.id, "la B no sabe cuál era la flecha buena");
  }
});

test("★★★ dos líneas que no se pasan nada es A, y solo eso", () => {
  let comprobados = 0;
  for (const x of LINEAS) {
    for (const y of LINEAS) {
      if (x === y) continue;
      if (flechaEntre(x.id, y.id) || flechaEntre(y.id, x.id)) continue;
      /* Si ninguna de las dos está en el informe que recibe, eso es C. */
      if (x.informe !== PRIMERO && y.informe !== PRIMERO) continue;
      const r = evaluarT1_7(x.id, y.id);
      assert.equal(r.patron, "A", `${x.id} → ${y.id}: no salió la A`);
      comprobados += 1;
    }
  }
  assert.ok(comprobados > 10, `solo se comprobaron ${comprobados} parejas`);
});

test("★★ las tres explicaciones son distintas y dicen lo suyo", () => {
  assert.equal(new Set(Object.values(ERROR_T1_7)).size, 3, "dos explicaciones son la misma");
  assert.ok(ERROR_T1_7.C.includes("no se conectan entre ellos"), "la C dejó de hablar de los dos informes");
  assert.ok(ERROR_T1_7.B.includes("al revés"), "la B dejó de hablar del sentido");
  assert.ok(ERROR_T1_7.A.includes("no se pasan nada"), "la A dejó de decir que no hay relación");
});

test("★★ acertar trae la devolución de esa flecha", () => {
  for (const f of FLECHAS) {
    const r = evaluarT1_7(f.desde, f.hasta);
    assert.equal(r.ok, true, `${f.id}: la flecha buena no acierta`);
    assert.equal(r.flecha.id, f.id);
    assert.equal(r.texto, ACIERTO_T1_7[f.id]);
  }
});

test("★★ si a una flecha le falta su devolución, pedirla se cae", () => {
  for (const f of FLECHAS) assert.equal(aciertoDeFlecha(f.id), ACIERTO_T1_7[f.id]);
  assert.throws(() => aciertoDeFlecha("f-inventada"), /no tiene devolución/,
    "sirvió un texto de repuesto en vez de avisar");
});

test("★★ una línea que no existe se cae, no se trata como un fallo del estudiante", () => {
  assert.throws(() => evaluarT1_7("no-existe", FLECHAS[0].hasta), /no existe/);
  assert.throws(() => evaluarT1_7(FLECHAS[0].desde, "no-existe"), /no existe/);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★★ los diez nodos son el mismo: nada distingue un origen de un destino", () => {
  const { caja, desmontar } = montar();
  try {
    const nodos = [...caja.querySelectorAll("[data-nodo-linea]")];
    assert.equal(nodos.length, LINEAS.length, "no hay un nodo por línea");
    const estilos = new Set(nodos.map((n) => n.getAttribute("style")));
    assert.equal(estilos.size, 1,
      `hay ${estilos.size} nodos distintos: el dibujo está contestando qué sale y qué llega`);

    /*
     * Y la fila entera tampoco distingue. Un mutante que solo cambiara el
     * relleno del nodo apagado pasaba esta prueba tal como estaba, porque en
     * reposo los diez están apagados: el riesgo de verdad es pintar distinto
     * según el informe, y eso se ve en el botón, no solo en el punto.
     */
    const filas = [...caja.querySelectorAll("[data-linea]")];
    assert.equal(filas.length, LINEAS.length);
    const estilosFila = new Set(filas.map((f) => f.getAttribute("style")));
    assert.equal(estilosFila.size, 1,
      `hay ${estilosFila.size} formas de pintar una línea: el informe se delata por el dibujo`);

    /* Y ninguna línea lleva marca propia según su papel. */
    const marcados = [...caja.querySelectorAll("[data-linea][data-estado]")];
    assert.equal(marcados.length, 0, "alguna línea sale marcada de entrada");
  } finally { desmontar(); }
});

test("★★ el vacío invita, y se va al empezar a tocar", () => {
  const { caja, desmontar } = montar();
  try {
    assert.ok(caja.querySelector("[data-vacio]"), "no hay estado vacío");
    assert.equal(caja.querySelector("[data-vacio]").textContent, T1_7.pregunta);
    clic(caja, FLECHAS[0].desde);
    assert.equal(caja.querySelectorAll("[data-vacio]").length, 0, "el vacío sigue pidiendo lo que ya se hizo");
    assert.equal(caja.querySelector(`[data-linea="${FLECHAS[0].desde}"]`).dataset.estado, "desde");
  } finally { desmontar(); }
});

test("★★ tocar dos veces la misma línea la suelta", () => {
  const { caja, desmontar } = montar();
  try {
    clic(caja, FLECHAS[0].desde);
    clic(caja, FLECHAS[0].desde);
    assert.equal(caja.querySelectorAll("[data-linea][data-estado]").length, 0, "la línea se quedó pegada");
  } finally { desmontar(); }
});

test("★★★ el hilo se dibuja al acertar y NO se queda en pantalla", () => {
  const { caja, desmontar } = montar();
  try {
    const f = FLECHAS[0];
    clic(caja, f.desde);
    clic(caja, f.hasta);
    assert.ok(caja.querySelector("[data-hilo]"), "no se dibuja el hilo al acertar");

    tocar(boton(caja, "Siguiente flecha"));
    assert.equal(caja.querySelectorAll("[data-hilo]").length, 0,
      "el hilo se quedó: con cuatro dibujadas, la quinta sale por descarte");
    assert.equal(caja.querySelectorAll("[data-linea][data-estado]").length, 0,
      "las líneas de la flecha anterior siguen marcadas");
  } finally { desmontar(); }
});

test("★★★ las cinco flechas juntas solo se ven al final", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelectorAll("[data-flecha-cierre]").length, 0,
      "las cinco flechas están dibujadas antes de empezar");
    for (const [k, f] of FLECHAS.entries()) {
      clic(caja, f.desde);
      clic(caja, f.hasta);
      tocar(boton(caja, k + 1 === FLECHAS.length ? "Ver el resultado" : "Siguiente flecha"));
    }
    assert.equal(caja.querySelectorAll("[data-flecha-cierre]").length, 5, "el cierre no pinta las cinco");

    /*
     * El cierre dice la conclusión, no cualquier cosa. Comparar contra la
     * constante entera no serviría: es la misma cadena que pinta el componente,
     * así que cambiarla las cambiaría las dos a la vez. Lo que se exige es que
     * siga diciendo lo que la actividad acaba de demostrar.
     */
    const cierre = caja.querySelector("[data-cierre-texto]").textContent;
    assert.equal(cierre, CIERRE_T1_7, "el cierre no pinta el texto del archivo");
    assert.ok(/cinco flechas/i.test(cierre), "el cierre dejó de decir que son cinco");
    assert.ok(/mismo informe/i.test(cierre), "el cierre dejó de decir que todas llegan al mismo");
  } finally { desmontar(); }
});

/* ═══════════════════ EL MODO INVERSO ═══════════════════ */

const terminar = (caja) => {
  for (const [k, f] of FLECHAS.entries()) {
    clic(caja, f.desde);
    clic(caja, f.hasta);
    tocar(boton(caja, k + 1 === FLECHAS.length ? "Ver el resultado" : "Siguiente flecha"));
  }
};

test("★★★ el modo inverso son tres preguntas y NO da FP", () => {
  assert.equal(INVERSO_T1_7.length, 3);
  for (const q of INVERSO_T1_7) {
    assert.equal(q.opciones.filter((o) => o.correcta).length, 1, `${q.id}: no hay una sola correcta`);
    assert.equal(q.opciones.length, 3, `${q.id}: no son tres opciones`);
    for (const o of q.opciones) {
      assert.ok(o.feedback.startsWith(o.correcta ? "✅" : "❌"),
        `${o.id}: la devolución no lleva la marca que le toca`);
    }
    assert.equal(new Set(q.opciones.map((o) => o.feedback)).size, 3, `${q.id}: dos opciones comparten devolución`);
  }

  const { caja, desmontar } = montar();
  try {
    terminar(caja);
    const inv = caja.querySelector("[data-inverso]");
    assert.ok(inv, "no aparece el modo inverso");
    assert.equal(caja.querySelectorAll("[data-pregunta-inversa]").length, 3);
    /* Y se dice en pantalla que no dan FP, para que no se jueguen esperándolos. */
    const aviso = caja.querySelector("[data-sin-fp]");
    assert.ok(aviso && /no dan FP/i.test(aviso.textContent), "no se avisa de que estas tres no dan FP");
  } finally { desmontar(); }
});

test("★★ responder en el modo inverso trae su devolución y cierra la pregunta", () => {
  const { caja, desmontar } = montar();
  try {
    terminar(caja);
    const q = INVERSO_T1_7[0];
    const mala = q.opciones.find((o) => !o.correcta);
    tocar(caja.querySelector(`[data-opcion="${mala.id}"]`));
    assert.ok(caja.textContent.includes(mala.feedback.slice(2, 40)), "no salió la devolución de la opción");
    for (const o of q.opciones) {
      assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).disabled, true,
        "la pregunta del modo inverso se puede responder dos veces");
    }
  } finally { desmontar(); }
});

test("★★★ el modo inverso no toca el puntaje", () => {
  let recibido = null;
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(LaArticulacion, {
    Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar,
    onCompletar: (pct) => { recibido = pct; },
  })));
  try {
    terminar(caja);
    const antes = recibido;
    assert.equal(antes, 100, "acertar las cinco no da el 100 %");
    for (const q of INVERSO_T1_7) {
      tocar(caja.querySelector(`[data-opcion="${q.opciones.find((o) => !o.correcta).id}"]`));
    }
    assert.equal(recibido, antes, "responder el modo inverso cambió el puntaje");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════════════ VOCABULARIO Y CORAL ═══════════════════ */

test("★★★ nada del Tema 2 entra en el contenido", () => {
  const { caja, desmontar } = montar();
  try {
    const copia = caja.querySelector("[data-contenido]").cloneNode(true);
    for (const rot of copia.querySelectorAll("[data-rotulo-seccion]")) rot.remove();
    assert.ok(copia.querySelectorAll("*").length > 5);
    assert.ok(!copia.textContent.includes("▲"), "se coló el ▲");
    const TEAL = /#52C4B0|#2a9d8f|rgba?\(\s*82,\s*196,\s*176|rgba?\(\s*42,\s*157,\s*143/i;
    const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;
    assert.ok(!TEAL.test(copia.innerHTML), "se coló el teal de «debe»");
    assert.ok(!AMBAR.test(copia.innerHTML), "se coló el ámbar de «haber»");
    assert.equal(copia.querySelectorAll("[data-arco], [data-balanza], [data-saldo], [data-ancla], [data-colector]").length, 0);
  } finally { desmontar(); }
});

test("★★ el coral solo sale al fallar", () => {
  const CORAL = /#e76f51|rgba?\(\s*231,\s*111,\s*81/i;
  const { caja, desmontar } = montar();
  try {
    assert.ok(!CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "hay coral de salida");
    /* Una pareja que no se pasa nada. */
    const f = FLECHAS[0];
    clic(caja, f.hasta);
    clic(caja, f.desde);
    assert.ok(CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "fallar no se marca en coral");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

test("★★★ T1-7 NO está publicada, ni por el catálogo ni por el registro de la vista", async () => {
  const { SUBJECTS } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  assert.ok(!tema.actividades.some((a) => a.id === T1_7.id), "T1-7 entró al catálogo");
  assert.ok(!JUEGOS.some((j) => j.id === T1_7.id), "T1-7 se abre escribiendo el hash");
});

test("experto, 90 FP y las cinco flechas", () => {
  assert.equal(T1_7.dificultad, "experto");
  assert.equal(T1_7.fpBase, 90);
  assert.equal(T1_7.porPartida, FLECHAS.length);
});
