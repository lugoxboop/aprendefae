import { test } from "node:test";
import { ACTIVO as ACTIVO_, PASIVO as PASIVO_, PATRIMONIO as PATRIMONIO_ } from "../../data/contabilidad.js";
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

const { default: EnCualEstadoAparece, DESTINOS_EN_PANTALLA } = await import("../../components/mecanicas/libros/tema1/EnCualEstadoAparece.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  sortearT1_6, evaluarT1_6, valorDeItem, puntuarT1_6, destinoDe, DESTINOS_T1_6,
} = await import("../tema1.js");
const {
  T1_6, CONCEPTOS, INFORMES, SECCIONES_T1_6, SECCIONES_SEGUNDO_T1_6, PRIMERO, SEGUNDO, INGRESOS, GASTOS,
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

test("★★ ningún acierto de t1-6 pasa de 25 palabras (tope de los Hacer; Shoko, lote C)", () => {
  for (const [id, t] of Object.entries(ACIERTO_T1_6)) {
    const n = t.replace(/^✅\s*/u, "").split(/\s+/).filter(Boolean).length;
    assert.ok(n <= 25, `${id}: ${n} palabras`);
  }
});

test("★★ las dieciséis fichas están, sin repetirse, y cada una con su devolución", () => {
  assert.equal(CONCEPTOS.length, 16);
  assert.equal(new Set(CONCEPTOS.map((c) => c.id)).size, 16, "hay dos fichas con el mismo id");
  assert.equal(new Set(CONCEPTOS.map((c) => c.nombre)).size, 16, "hay dos fichas con el mismo nombre");
  for (const c of CONCEPTOS) {
    assert.ok(ACIERTO_T1_6[c.id], `${c.nombre}: sin devolución de acierto`);
    assert.ok(!/^[\u2705\u274C]/u.test(ACIERTO_T1_6[c.id]), `${c.nombre}: la devolución volvió a llevar emoji`);
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
    /* Lote C de Futaba (24-oct): con los términos del libro, como los destinos. */
    [ACTIVO]: "en el activo",
    [PASIVO]: "en el pasivo",
    [PATRIMONIO]: "en el patrimonio",
  };
  for (const c of CONCEPTOS) {
    const texto = ACIERTO_T1_6[c.id];
    const diceElPrimero = texto.includes("estado de situación financiera");
    const diceElSegundo = texto.includes("estado de resultados");
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
      /* Lote del 24-oct: el segundo se parte en ingresos y gastos, y el texto lo dice. */
      const FRASE = { [INGRESOS]: "en ingresos", [GASTOS]: "en gastos" };
      assert.ok(FRASE[c.seccion], `${c.nombre}: una ficha del segundo informe sin ingresos ni gastos`);
      assert.ok(texto.includes(FRASE[c.seccion]), `${c.nombre}: el banco dice «${c.seccion}» y el texto no`);
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

test("★★ diez de dieciséis, y los cinco destinos salen siempre", () => {
  assert.equal(DESTINOS_T1_6.length, 5, `hay ${DESTINOS_T1_6.length} destinos, no cinco`);
  for (let i = 0; i < 300; i += 1) {
    const tanda = sortearT1_6(barajar);
    assert.equal(tanda.length, 10);
    assert.equal(new Set(tanda.map((c) => c.id)).size, 10, "una ficha salió dos veces");
    const destinos = new Set(tanda.map(destinoDe));
    assert.equal(destinos.size, 5, `faltó un destino: ${[...destinos].join(", ")}`);
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
test("★★ en la primera posición puede salir cualquiera de los cinco destinos", () => {
  const primeros = new Set();
  for (let i = 0; i < 400; i += 1) primeros.add(destinoDe(sortearT1_6(barajar)[0]));
  assert.equal(primeros.size, 5,
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
  const b = evaluarT1_6(delPrimero, { informe: SEGUNDO, seccion: INGRESOS });
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

test("★★★ en el segundo, cruzar ingresos y gastos es C2, y reconoce el informe", () => {
  for (const c of CONCEPTOS.filter((x) => x.informe === SEGUNDO)) {
    const otra = c.seccion === INGRESOS ? GASTOS : INGRESOS;
    const r = evaluarT1_6(c, { informe: SEGUNDO, seccion: otra });
    assert.equal(r.patron, "C2", c.nombre);
    assert.equal(r.informeOk, true);
    /* El texto es el de su destino (Futaba, lote E); el patrón sigue siendo C2. */
    assert.notEqual(r.texto, ERROR_T1_6.C2);
    assert.ok(r.texto.startsWith("El informe es el correcto"));
  }
});

/* ═══════════════════ EL PUNTAJE 60 / 40 ═══════════════════ */

test("★★★ el informe pesa 60 y la parte 40", () => {
  assert.equal(PESO_INFORME + PESO_SECCION, 1);
  const c = CONCEPTOS.find((x) => x.informe === PRIMERO);
  const otra = SECCIONES_T1_6.map((s) => s.id).find((s) => s !== c.seccion);

  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: c.informe, seccion: c.seccion })), 1);
  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: PRIMERO, seccion: otra })), PESO_INFORME);
  assert.equal(valorDeItem(c, evaluarT1_6(c, { informe: SEGUNDO, seccion: INGRESOS })), 0,
    "fallar el informe da puntos por la parte");

  /* Desde el lote del 24-oct las del segundo también tienen parte: 60 / 40 igual. */
  const s = CONCEPTOS.find((x) => x.informe === SEGUNDO);
  const cruzada = s.seccion === INGRESOS ? GASTOS : INGRESOS;
  assert.equal(valorDeItem(s, evaluarT1_6(s, { informe: SEGUNDO, seccion: s.seccion })), 1);
  assert.equal(valorDeItem(s, evaluarT1_6(s, { informe: SEGUNDO, seccion: cruzada })), PESO_INFORME);
  assert.equal(valorDeItem(s, evaluarT1_6(s, { informe: PRIMERO, seccion: ACTIVO })), 0);
});

test("★★ el puntaje suma los valores, no los aciertos", () => {
  assert.equal(puntuarT1_6([{ valor: 1 }, { valor: 1 }], 2), 100);
  assert.equal(puntuarT1_6([{ valor: 0.6 }, { valor: 0.6 }], 2), 60);
  assert.equal(puntuarT1_6([{ valor: 1 }, { valor: 0 }], 2), 50);
  assert.equal(puntuarT1_6([], 0), 0);
});

/* ═══════════════════ LOS CINCO DESTINOS EN PANTALLA (lote 4) ═══════════════════ */

const tocarDestino = (caja, informe, seccion) => tocar(caja.querySelector(`[data-destino="${informe}-${seccion}"]`));
const destinosEnPantalla = (caja) => [...caja.querySelectorAll("[data-destino]")];

test("★★★ cada informe lleva su término del libro y su fecha, en dos nodos que se ven", () => {
  const { caja, desmontar } = montar();
  try {
    for (const inf of INFORMES) {
      const p = caja.querySelector(`[data-informe="${inf.id}"]`);
      assert.ok(p, `falta el informe ${inf.id}`);
      const termino = seVe(p.querySelector(`[data-termino-informe="${inf.termino}"]`), `${inf.id}: el término`);
      const cuando = seVe(p.querySelector('[data-linea="cuando"]'), `${inf.id}: la fecha`);
      assert.equal(termino.textContent, inf.termino);
      assert.equal(cuando.textContent, inf.fecha);
      assert.notEqual(termino, cuando);
    }
    /* Un día exacto contra todo un periodo: ahí está el criterio. */
    assert.notEqual(INFORMES[0].fecha, INFORMES[1].fecha);
    assert.equal(INFORMES[0].fecha, "al 31 de diciembre");
    /* La película lleva su franja del tiempo; la foto no. */
    assert.ok(caja.querySelector(`[data-informe="${SEGUNDO}"] [data-franja]`));
    assert.equal(caja.querySelector(`[data-informe="${PRIMERO}"] [data-franja]`), null);
  } finally { desmontar(); }
});

test("★★★ cinco destinos desde el principio: tres en la foto y dos en la película", () => {
  const { caja, desmontar } = montar();
  try {
    const d = destinosEnPantalla(caja);
    assert.equal(d.length, 5);
    assert.deepEqual(d.map((x) => x.dataset.destino),
      [...SECCIONES_T1_6.map((s) => `${PRIMERO}-${s.id}`), ...SECCIONES_SEGUNDO_T1_6.map((s) => `${SEGUNDO}-${s.id}`)]);
    assert.equal(caja.querySelectorAll(`[data-informe="${PRIMERO}"] [data-destino]`).length, 3);
    assert.equal(caja.querySelectorAll(`[data-informe="${SEGUNDO}"] [data-destino]`).length, 2);
    for (const s of SECCIONES_T1_6) {
      assert.ok(caja.querySelector(`[data-destino="${PRIMERO}-${s.id}"]`).textContent.includes(s.termino));
    }
    /* Cada destino se lee con su nombre y su cuenta: «Activo, 0 fichas». */
    assert.equal(caja.querySelector(`[data-destino="${PRIMERO}-${ACTIVO}"]`).getAttribute("aria-label"), "Activo, 0 fichas");
    /* No hay botón de colocar: tocar es responder. */
    assert.ok(![...caja.querySelectorAll("button")].some((b) => /Colocar la ficha/.test(b.textContent)));
  } finally { desmontar(); }
});

test("★★★ un toque responde: el correcto sube su cuenta y se resalta, se acierte o no", () => {
  for (const acertar of [true, false]) {
    const { caja, desmontar } = montar();
    try {
      const c = fichaEnPantalla(caja);
      const otro = DESTINOS_EN_PANTALLA.find((d) => !(d.informe === c.informe && d.seccion === c.seccion));
      const elegido = acertar ? { informe: c.informe, seccion: c.seccion } : otro;
      tocarDestino(caja, elegido.informe, elegido.seccion);
      const bueno = caja.querySelector(`[data-destino="${c.informe}-${c.seccion}"]`);
      assert.equal(bueno.dataset.estado, "acierto", "el destino correcto no se resalta");
      assert.equal(bueno.querySelector("[data-cuenta]").textContent, "1", "la cuenta del correcto no subió");
      assert.ok(destinosEnPantalla(caja).every((b) => b.disabled), "un segundo toque sigue abierto: hay reintento");
      if (!acertar) {
        const malo = caja.querySelector(`[data-destino="${otro.informe}-${otro.seccion}"]`);
        assert.equal(malo.dataset.estado, "fantasma");
        assert.equal(malo.querySelector("[data-cuenta]").textContent, "0", "la cuenta subió en el destino equivocado");
        assert.match(caja.querySelector("[data-renglon]").textContent, /Iba aquí: /);
      } else {
        assert.match(caja.querySelector("[data-entro]").textContent, /^Entró: /);
      }
      /* La devolución, sin el emoji del banco. */
      assert.doesNotMatch(caja.querySelector("[data-devolucion]").textContent, /[\u2705\u274C]/u);
    } finally { desmontar(); }
  }
});

test("★★ C2: el reposo ya es un borde de 2 px, así que responder no cambia el ancho", () => {
  const { caja, desmontar } = montar();
  try {
    const anchoBorde = () => destinosEnPantalla(caja).map((b) => b.style.borderWidth || b.style.border.split(" ")[0]);
    assert.ok(anchoBorde().every((x) => x === "2px"), anchoBorde().join(","));
    const c = fichaEnPantalla(caja);
    tocarDestino(caja, c.informe, c.seccion);
    assert.ok(anchoBorde().every((x) => x === "2px"), anchoBorde().join(","));
  } finally { desmontar(); }
});

/* ═══════════════════ VOCABULARIO Y CORAL ═══════════════════ */

test("★★★ nada del Tema 2 entra en el contenido", () => {
  const { caja, desmontar } = montar();
  try {
    const copia = caja.querySelector("[data-contenido]").cloneNode(true);
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
    const otro = DESTINOS_EN_PANTALLA.find((d) => d.informe !== c.informe);
    tocarDestino(caja, otro.informe, otro.seccion);
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

/* Futaba, lote E (D6 de Shoko): con el informe bien y la parte mal, la devolución es la del destino correcto, y dice por qué. */
test("★★★ t1-6: el error de parte trae la devolución de su destino, una por cada uno de los cinco", async () => {
  const T1 = await import("../../data/contabilidadTema1.js");
  const L = await import("../tema1.js");
  const destinos = new Set();
  for (const c of T1.CONCEPTOS) {
    const otra = (c.informe === T1.PRIMERO ? [ACTIVO_, PASIVO_, PATRIMONIO_] : [T1.INGRESOS, T1.GASTOS]).find((x) => x !== c.seccion);
    const r = L.evaluarT1_6(c, { informe: c.informe, seccion: otra });
    const esperado = T1.DEVOLUCION_POR_DESTINO_T1_6[`${c.informe}:${c.seccion}`];
    assert.ok(esperado, `${c.id}: su destino no tiene devolución`);
    assert.equal(r.texto, esperado, c.id);
    assert.ok(r.texto.split(/\s+/).length <= 25, `${c.id}: pasa de 25 palabras`);
    destinos.add(r.texto);
  }
  assert.equal(destinos.size, 5);
});
