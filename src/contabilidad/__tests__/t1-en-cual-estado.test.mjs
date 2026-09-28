import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-6 · ¿EN CUÁL ESTADO APARECE?
 *
 * Dos cosas se rompen calladas.
 *
 * La primera es LA COHERENCIA ENTRE EL BANCO Y EL TEXTO. Cada devolución dice
 * en qué informe y en qué parte va la ficha, y el banco lo dice otra vez con
 * campos. Son dos verdades sobre lo mismo: si una se toca, la otra sigue
 * diciendo lo de antes y nadie se entera. Aquí se leen los textos y se
 * comparan con el banco.
 *
 * La segunda es LA FRANJA DE TIEMPO de las pestañas. «a 31 dic» contra «1 ene
 * – 31 dic» es el criterio entero de la actividad: un informe es la foto de un
 * día y el otro cuenta un año. Si desaparece, todo sigue funcionando y la
 * pregunta se convierte en memorizar dos listas.
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

const EnCualEstadoAparece = (await import("../../components/mecanicas/libros/tema1/EnCualEstadoAparece.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  sortearT1_6, evaluarT1_6, valorDeItem, puntuarT1_6, destinoDe, DESTINOS_T1_6,
} = await import("../tema1.js");
const {
  T1_6, CONCEPTOS, INFORMES, SECCIONES_T1_6, PRIMERO, SEGUNDO,
  ERROR_T1_6, ACIERTO_T1_6, PESO_INFORME, PESO_SECCION,
} = await import("../../data/contabilidadTema1.js");
const { ACTIVO, PASIVO, PATRIMONIO } = await import("../../data/contabilidad.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const montar = () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(EnCualEstadoAparece, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const fichaEnPantalla = (caja) => CONCEPTOS.find((c) => c.id === caja.querySelector("[data-ficha]").dataset.ficha);

/*
 * ═══════════ «ESTÁ EN EL ÁRBOL» NO ES «SE VE» ═══════════
 *
 * `textContent` devuelve el texto de un nodo con `hidden` o con `display:
 * none` exactamente igual que el de uno visible. Dos mutantes sobrevivieron
 * escondiendo con `hidden` la franja de tiempo y el término del libro: las
 * pruebas los seguían leyendo y el estudiante ya no los tenía delante.
 */
const seVe = (el, que) => {
  assert.ok(el, `${que}: no está`);
  assert.equal(el.hidden, false, `${que}: está oculto con hidden`);
  assert.notEqual(getComputedStyle(el).display, "none", `${que}: está en display none`);
  assert.notEqual(getComputedStyle(el).visibility, "hidden", `${que}: está en visibility hidden`);
  return el;
};

/* ═══════════════════ EL BANCO Y SUS TEXTOS ═══════════════════ */

test("★★ las dieciséis fichas están, sin repetirse, y cada una con su devolución", () => {
  assert.equal(CONCEPTOS.length, 16);
  assert.equal(new Set(CONCEPTOS.map((c) => c.id)).size, 16, "hay dos fichas con el mismo id");
  assert.equal(new Set(CONCEPTOS.map((c) => c.nombre)).size, 16, "hay dos fichas con el mismo nombre");
  for (const c of CONCEPTOS) {
    assert.ok(ACIERTO_T1_6[c.id], `${c.nombre}: sin devolución de acierto`);
    assert.ok(ACIERTO_T1_6[c.id].startsWith("✅"), `${c.nombre}: la devolución perdió su marca`);
  }
  assert.equal(Object.keys(ACIERTO_T1_6).length, 16, "sobra o falta una devolución");
});

/*
 * ═══════════ EL TEXTO Y EL BANCO DICEN LO MISMO ═══════════
 *
 * La devolución dice «va en el primer informe, en lo que debe» y el banco lo
 * dice con campos. Esto lee el texto y lo compara con los campos. Si alguien
 * cambia el banco y no el texto —o al revés—, falla aquí.
 */
test("★★★ cada devolución dice el mismo informe y la misma parte que el banco", () => {
  const PARTE = {
    [ACTIVO]: "en lo que tiene",
    [PASIVO]: "en lo que debe",
    [PATRIMONIO]: "en lo de los dueños",
  };
  for (const c of CONCEPTOS) {
    const texto = ACIERTO_T1_6[c.id];
    const diceElPrimero = texto.includes("primer informe");
    const diceElSegundo = texto.includes("segundo informe");
    assert.notEqual(diceElPrimero, diceElSegundo, `${c.nombre}: la devolución nombra los dos informes o ninguno`);
    assert.equal(diceElPrimero, c.informe === PRIMERO,
      `${c.nombre}: el banco dice «${c.informe}» y el texto dice otra cosa`);

    if (c.informe === PRIMERO) {
      assert.ok(texto.includes(PARTE[c.seccion]),
        `${c.nombre}: el banco dice «${c.seccion}» y el texto no dice «${PARTE[c.seccion]}»`);
      /* Y no nombra ninguna de las otras dos partes. */
      for (const [otra, frase] of Object.entries(PARTE)) {
        if (otra === c.seccion) continue;
        assert.ok(!texto.includes(frase), `${c.nombre}: la devolución nombra también «${frase}»`);
      }
    } else {
      assert.equal(c.seccion, null, `${c.nombre}: una ficha del segundo informe trae sección`);
    }
  }
});

/* ═══════════════════ EL NOMBRE RETIRADO ═══════════════════ */

test("★★★ «lo que ganó y gastó» no se usa en ninguna parte del sitio", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const raiz = path.resolve("src");
  const VIEJO = "ganó y gastó";
  const sospechosos = [];
  const recorrer = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { await recorrer(p); continue; }
      if (!/\.(jsx?|mjs)$/.test(e.name)) continue;
      if (e.name.endsWith(".test.mjs")) continue;
      if ((await fs.readFile(p, "utf8")).includes(VIEJO)) sospechosos.push(p);
    }
  };
  await recorrer(raiz);
  assert.deepEqual(sospechosos, [], `el nombre viejo volvió: ${sospechosos.join(", ")}`);
  /* Y el nombre bueno es el que está. */
  assert.equal(INFORMES[1].idea, "Lo que vendió y lo que gastó durante el año");
});

/* ═══════════════════ EL SORTEO ═══════════════════ */

test("★★ diez de dieciséis, y los cuatro destinos salen siempre", () => {
  assert.equal(DESTINOS_T1_6.length, 4, `hay ${DESTINOS_T1_6.length} destinos, no cuatro`);
  for (let i = 0; i < 300; i += 1) {
    const tanda = sortearT1_6(barajar);
    assert.equal(tanda.length, 10);
    assert.equal(new Set(tanda.map((c) => c.id)).size, 10, "una ficha salió dos veces");
    const destinos = new Set(tanda.map(destinoDe));
    assert.equal(destinos.size, 4, `faltó un destino: ${[...destinos].join(", ")}`);
  }
});

test("★★ Reservas es la única del patrimonio, y por eso entra siempre", () => {
  const delPatrimonio = CONCEPTOS.filter((c) => c.informe === PRIMERO && c.seccion === PATRIMONIO);
  assert.equal(delPatrimonio.length, 1, "ya no es una sola: el sorteo estratificado deja de hacer falta por esto");
  for (let i = 0; i < 100; i += 1) {
    assert.ok(sortearT1_6(barajar).some((c) => c.id === delPatrimonio[0].id),
      "la única ficha del patrimonio se quedó fuera de la tanda");
  }
});

/*
 * ═══════════ EL ORDEN SE BARAJA DESPUÉS DE ESTRATIFICAR ═══════════
 *
 * Contar cuántas secuencias distintas salen no basta: sin barajar al final
 * salen dieciocho, que parecen muchas, y sin embargo las CUATRO PRIMERAS
 * fichas van siempre en el mismo orden de destinos. El estudiante que juega
 * dos tandas aprende el patrón —primero una del activo, luego una del
 * pasivo...— en vez del criterio.
 *
 * Lo que se comprueba es lo que de verdad importa: que en la primera posición
 * pueda salir cualquiera de los cuatro destinos.
 */
test("★★ en la primera posición puede salir cualquiera de los cuatro destinos", () => {
  const primeros = new Set();
  for (let i = 0; i < 300; i += 1) primeros.add(destinoDe(sortearT1_6(barajar)[0]));
  assert.equal(primeros.size, 4,
    `la primera ficha sale siempre de ${[...primeros].join(", ")}: el sorteo no baraja después de estratificar`);
});

/* ═══════════════════ LAS TRES EXPLICACIONES ═══════════════════ */

test("★★★ A y B no son la misma equivocación al revés: la elige dónde iba de verdad", () => {
  const delSegundo = CONCEPTOS.find((c) => c.informe === SEGUNDO);
  const delPrimero = CONCEPTOS.find((c) => c.informe === PRIMERO);

  /* Iba en el segundo y lo puso en el primero → A. */
  const a = evaluarT1_6(delSegundo, { informe: PRIMERO, seccion: ACTIVO });
  assert.equal(a.patron, "A");
  assert.equal(a.texto, ERROR_T1_6.A);
  assert.ok(a.texto.includes("pasó durante el año"), "la A dejó de hablar de lo que pasó en el año");

  /* Iba en el primero y lo puso en el segundo → B. */
  const b = evaluarT1_6(delPrimero, { informe: SEGUNDO, seccion: null });
  assert.equal(b.patron, "B");
  assert.equal(b.texto, ERROR_T1_6.B);
  assert.ok(b.texto.includes("mañana lo sigue teniendo"), "la B dejó de hablar de lo que se conserva");

  assert.notEqual(ERROR_T1_6.A, ERROR_T1_6.B, "las dos explicaciones se volvieron la misma");
});

test("★★★ acertar el informe y fallar la parte es C, y solo eso", () => {
  for (const c of CONCEPTOS.filter((x) => x.informe === PRIMERO)) {
    const otra = SECCIONES_T1_6.map((s) => s.id).find((s) => s !== c.seccion);
    const r = evaluarT1_6(c, { informe: PRIMERO, seccion: otra });
    assert.equal(r.patron, "C", `${c.nombre}: acertar el informe y fallar la parte no dio C`);
    assert.equal(r.informeOk, true);
    assert.equal(r.seccionOk, false);
    assert.ok(r.texto.includes("El informe es el correcto"), "la C ya no reconoce lo que sí acertó");
  }
});

test("★★ acertar las dos cosas es acertar, y trae la devolución de esa ficha", () => {
  for (const c of CONCEPTOS) {
    const r = evaluarT1_6(c, { informe: c.informe, seccion: c.seccion });
    assert.equal(r.ok, true, `${c.nombre}: lo correcto no acierta`);
    assert.equal(r.texto, ACIERTO_T1_6[c.id]);
  }
});

test("★★ si a una ficha le falta su devolución, evaluar se cae", () => {
  const inventada = { id: "no-existe", nombre: "Inventada", informe: PRIMERO, seccion: ACTIVO };
  assert.throws(() => evaluarT1_6(inventada, { informe: PRIMERO, seccion: ACTIVO }),
    /no tiene devolución/, "sirvió un texto de repuesto en vez de avisar");
});

test("★★ una ficha del segundo informe no pide sección para acertar", () => {
  for (const c of CONCEPTOS.filter((x) => x.informe === SEGUNDO)) {
    assert.equal(evaluarT1_6(c, { informe: SEGUNDO, seccion: null }).ok, true, `${c.nombre}`);
  }
});

/* ═══════════════════ EL PUNTAJE 60 / 40 ═══════════════════ */

test("★★★ el informe pesa 60 y la parte 40", () => {
  assert.equal(PESO_INFORME + PESO_SECCION, 1);
  const c = CONCEPTOS.find((x) => x.informe === PRIMERO);
  const otra = SECCIONES_T1_6.map((s) => s.id).find((s) => s !== c.seccion);

  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: c.informe, seccion: c.seccion })), 1);
  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: PRIMERO, seccion: otra })), PESO_INFORME);
  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: SEGUNDO, seccion: null })), 0,
    "fallar el informe da puntos por la parte, que ni siquiera se preguntó");

  /* Las del segundo informe valen entero: no tienen parte que acertar. */
  const s = CONCEPTOS.find((x) => x.informe === SEGUNDO);
  assert.equal(valorDeItem(s, evaluarT1_6(s, { informe: SEGUNDO, seccion: null })), 1);
  assert.equal(valorDeItem(s, evaluarT1_6(s, { informe: PRIMERO, seccion: ACTIVO })), 0);
});

test("★★ el puntaje suma los valores, no los aciertos", () => {
  assert.equal(puntuarT1_6([{ valor: 1 }, { valor: 1 }], 2), 100);
  assert.equal(puntuarT1_6([{ valor: 0.6 }, { valor: 0.6 }], 2), 60);
  assert.equal(puntuarT1_6([{ valor: 1 }, { valor: 0 }], 2), 50);
  assert.equal(puntuarT1_6([], 0), 0);
});

/* ═══════════════════ LAS PESTAÑAS EN PANTALLA ═══════════════════ */

test("★★★ cada pestaña lleva dos líneas: la idea y cuándo", () => {
  const { caja, desmontar } = montar();
  try {
    for (const inf of INFORMES) {
      const p = caja.querySelector(`[data-informe="${inf.id}"]`);
      assert.ok(p, `falta la pestaña de ${inf.id}`);

      const idea = seVe(p.querySelector('[data-linea="idea"]'), `${inf.id}: la idea`);
      const cuando = seVe(p.querySelector('[data-linea="cuando"]'), `${inf.id}: la franja de tiempo`);
      assert.ok(inf.idea.length > 3 && inf.cuando.length > 3, `${inf.id}: una de las dos se quedó vacía`);
      assert.equal(idea.textContent, inf.idea, `${inf.id}: la idea no es la del archivo`);
      assert.equal(cuando.textContent, inf.cuando, `${inf.id}: la franja de tiempo no es la del archivo`);
      /* Y son dos nodos distintos, no una cadena pegada. */
      assert.notEqual(idea, cuando);
    }
    /* Las dos franjas de tiempo son distintas: ahí está el criterio. */
    assert.notEqual(INFORMES[0].cuando, INFORMES[1].cuando,
      "los dos informes cubren el mismo tiempo y la pregunta deja de tener criterio");
  } finally { desmontar(); }
});

test("★★★ el término del libro sale dentro de la pestaña, como rótulo aparte", () => {
  const { caja, desmontar } = montar();
  try {
    for (const inf of INFORMES) {
      tocar(caja.querySelector(`[data-informe="${inf.id}"]`));
      const rotulo = seVe(caja.querySelector(`[data-termino-informe="${inf.termino}"]`),
        `${inf.id}: el término del libro`);
      assert.equal(rotulo.textContent, inf.termino, `${inf.id}: el rótulo trae algo más`);
      /* Y no está metido dentro de la idea. */
      assert.ok(!inf.idea.includes(inf.termino), `${inf.id}: el término está dentro de la frase de la idea`);
    }
  } finally { desmontar(); }
});

test("★★★ las tres partes solo aparecen dentro del primer informe", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelectorAll("[data-seccion]").length, 0, "las partes salen sin haber elegido informe");

    tocar(caja.querySelector(`[data-informe="${SEGUNDO}"]`));
    assert.equal(caja.querySelectorAll("[data-seccion]").length, 0,
      "el segundo informe ofrece partes que no tiene");
    assert.ok(caja.querySelector("[data-sin-secciones]"), "no se dice que ahí no hay parte que elegir");

    tocar(caja.querySelector(`[data-informe="${PRIMERO}"]`));
    assert.equal(caja.querySelectorAll("[data-seccion]").length, 3, "el primer informe no ofrece sus tres partes");
    for (const s of SECCIONES_T1_6) {
      const b = caja.querySelector(`[data-seccion="${s.id}"]`);
      assert.ok(b.textContent.includes(s.idea), `${s.id}: falta la idea simple`);
      assert.ok(b.querySelector(`[data-termino="${s.termino}"]`), `${s.id}: el término no es un rótulo propio`);
    }
  } finally { desmontar(); }
});

test("★★ cambiar de informe borra la parte elegida del otro", () => {
  const { caja, desmontar } = montar();
  try {
    tocar(caja.querySelector(`[data-informe="${PRIMERO}"]`));
    tocar(caja.querySelector(`[data-seccion="${PASIVO}"]`));
    assert.equal(caja.querySelector(`[data-seccion="${PASIVO}"]`).dataset.marcada, "si");
    tocar(caja.querySelector(`[data-informe="${SEGUNDO}"]`));
    tocar(caja.querySelector(`[data-informe="${PRIMERO}"]`));
    assert.equal(caja.querySelector(`[data-seccion="${PASIVO}"]`).dataset.marcada, "no",
      "la parte del otro informe se quedó marcada");
  } finally { desmontar(); }
});

test("★★ no se coloca la ficha sin elegir parte en el primer informe", () => {
  const { caja, desmontar } = montar();
  try {
    const boton = () => [...caja.querySelectorAll("button")]
      .find((b) => /Colocar la ficha|Elige en qué parte|Elige un informe/.test(b.textContent));
    assert.equal(boton().disabled, true, "se puede colocar sin elegir nada");
    tocar(caja.querySelector(`[data-informe="${PRIMERO}"]`));
    assert.equal(boton().disabled, true, "se puede colocar en el primer informe sin decir en qué parte");
    tocar(caja.querySelector(`[data-seccion="${ACTIVO}"]`));
    assert.equal(boton().disabled, false);
  } finally { desmontar(); }
});

test("★★ con el segundo informe basta elegir el informe", () => {
  const { caja, desmontar } = montar();
  try {
    tocar(caja.querySelector(`[data-informe="${SEGUNDO}"]`));
    const b = [...caja.querySelectorAll("button")].find((x) => x.textContent.includes("Colocar la ficha"));
    assert.ok(b && !b.disabled, "el segundo informe pide una parte que no tiene");
  } finally { desmontar(); }
});

/* ═══════════════════ VOCABULARIO Y CORAL ═══════════════════ */

test("★★★ nada del Tema 2 entra en el contenido", () => {
  const { caja, desmontar } = montar();
  try {
    tocar(caja.querySelector(`[data-informe="${PRIMERO}"]`));
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
    const c = fichaEnPantalla(caja);
    const otro = c.informe === PRIMERO ? SEGUNDO : PRIMERO;
    tocar(caja.querySelector(`[data-informe="${otro}"]`));
    if (otro === PRIMERO) tocar(caja.querySelector(`[data-seccion="${ACTIVO}"]`));
    tocar([...caja.querySelectorAll("button")].find((b) => b.textContent.includes("Colocar la ficha")));
    assert.ok(CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "fallar no se marca en coral");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

/*
 * Las dos puertas tienen que decir lo mismo: lo que solo está en el registro
 * de la vista se abre por el hash y registra FP de una clasificación que no
 * existe, y lo que solo está en el catálogo sale en el camino y no abre nada.
 * Esta prueba vigilaba que T1-6 estuviera fuera de las dos; ahora vigila que
 * esté en las dos.
 */
test("★★★ T1-6 está en las dos puertas, con la misma clasificación", async () => {
  const { SUBJECTS } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  const enCatalogo = tema.actividades.find((a) => a.id === T1_6.id);
  assert.ok(enCatalogo, "T1-6 no está en el catálogo");
  assert.equal(enCatalogo.clasificacion.dificultad, T1_6.dificultad);
  assert.equal(enCatalogo.clasificacion.fpBase, T1_6.fpBase);
  assert.ok(JUEGOS.some((j) => j.id === T1_6.id), "T1-6 sale en el camino y no la abre nadie");
});

test("difícil, 50 FP y diez fichas por tanda", () => {
  assert.equal(T1_6.dificultad, "dificil");
  assert.equal(T1_6.fpBase, 50);
  assert.equal(T1_6.porPartida, 10);
});
