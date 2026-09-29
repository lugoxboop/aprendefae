import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-8 · ¿DÓNDE SE ROMPIÓ?
 *
 * Cuatro cosas se rompen sin hacer ruido.
 *
 * UN PUNTO APAGADO NO ES UN PASO QUE DESAPARECE. Es que ESTE hecho no llegó.
 * Si un texto dijera que la empresa se queda sin informe o sin decisión,
 * contradiría la pieza 1, que sigue un solo hecho por los cinco puntos.
 *
 * EN UN ERROR NO CORRE NADA. Una cascada desde el punto equivocado enseñaría
 * algo falso, y ninguna prueba de lógica lo ve: se ve en pantalla.
 *
 * EL PUNTO 5 NO APAGA NINGÚN PUNTO. Apaga la flecha de vuelta. Si la cascada
 * genérica lo tratara igual que a los otros, la lección central desaparece.
 *
 * EL PUNTO 1 NO SE PUEDE TOCAR, ni por toque ni por teclado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducir = false;
w.matchMedia = () => ({ matches: reducir, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const DondeSeRompio = (await import("../../components/mecanicas/libros/tema1/DondeSeRompio.jsx")).default;
const { MS } = await import("../../components/mecanicas/libros/tema1/DondeSeRompio.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  sortearT1_8, evaluarT1_8, evaluarPrediccion, noAlcanzados, apagadosDe, apagaLaFlecha,
  textoDelContador, esTocable, TOCABLES_T1_8, situacionPorId, situacionDeItem, puntuar,
} = await import("../tema1.js");
const {
  T1_8, PUNTOS_T1_8, SITUACIONES_T1_8, ACIERTO_T1_8, ERROR_T1_8, ROTULO_ERROR_B_T1_8,
  PREDICCION_T1_8, CONTADOR_T1_8, CONTADOR_LLEGO_A_TODOS, ROTULO_FLECHA_APAGADA,
  CIERRE_T1_8, ALT_T1_8, ROTULO_APAGADO,
} = await import("../../data/contabilidadTema1.js");
const { ESTACIONES } = await import("../../data/contabilidadIntro.js");
const { FAE } = await import("../../theme.js");
const { barajar } = await import("../../utils/barajar.js");

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const esperar = (ms) => act(async () => { await dormir(ms); });

const montar = (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(DondeSeRompio, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {}, ...props,
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const punto = (caja, n) => caja.querySelector(`[data-punto="${n}"]`);
const actual = (caja) => situacionPorId(caja.querySelector("[data-situacion]").dataset.situacion);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(texto));
const fase = (caja) => caja.querySelector("[data-contenido]").dataset.fase;

/* Lo que tarda la cascada entera de un roto, con margen. */
const cascadaDe = (rompe) => MS.corte + MS.apagon * apagadosDe(rompe).length + 150;

/* Acierta la situación en pantalla, predice `n` y deja correr la cascada. */
async function resolver(caja, prediccion = null) {
  const s = actual(caja);
  tocar(punto(caja, s.rompe));
  await esperar(MS.flujo + 60);
  tocar(caja.querySelector(`[data-prediccion-opcion="${prediccion ?? noAlcanzados(s.rompe)}"]`));
  await esperar(cascadaDe(s.rompe));
  return s;
}

/* ═══════════════════ EL BANCO ═══════════════════ */

test("★★★ los cinco rótulos son los simples, en el orden de la pieza 1, y nunca los del Gráfico", () => {
  assert.deepEqual(PUNTOS_T1_8.map((p) => p.rotulo), [
    "Pasa algo en la empresa", "Queda un papel", "Se anota", "Sale un informe", "Los jefes deciden",
  ]);
  assert.deepEqual(PUNTOS_T1_8.map((p) => p.n), ESTACIONES.map((e) => e.n), "el anillo cuenta distinto que la pieza 1");
  /* Los mismos que dice la pieza 1, no una copia que pueda separarse. */
  assert.deepEqual(PUNTOS_T1_8.map((p) => p.rotulo), ESTACIONES.map((e) => e.nombre));
  for (const e of ESTACIONES) {
    assert.ok(!PUNTOS_T1_8.some((p) => p.rotulo === e.delGrafico), `se coló el rótulo crudo del Gráfico 1.1: «${e.delGrafico}»`);
  }
});

test("★★★ las ocho situaciones, con su versión final y su punto de ruptura", () => {
  const TABLA = [
    ["Un empleado compró tinta con plata de la caja. No pidió factura ni recibo.", 2, 3],
    ["La empresa le entregó la mercancía a un cliente, pero no le hizo factura.", 2, 3],
    ["La factura de un escritorio que compraron está en una carpeta. Nadie la pasó a los libros.", 3, 2],
    ["Llegó el recibo del arriendo del mes. Sigue en un cajón sin anotar.", 3, 2],
    ["La compra de papelería quedó anotada en los libros, pero la dejaron por fuera del informe del mes.", 4, 1],
    ["El pago de la luz está anotado, pero no aparece en el informe que recibieron los jefes.", 4, 1],
    ["Los informes se hicieron y se guardaron. Los jefes no los han abierto.", 5, 0],
    ["El informe muestra que un producto está dando pérdida. Nadie lo ha leído.", 5, 0],
  ];
  assert.equal(SITUACIONES_T1_8.length, 8);
  for (const [k, [texto, rompe, faltan]] of TABLA.entries()) {
    const s = SITUACIONES_T1_8[k];
    assert.equal(s.texto, texto, `la situación ${k + 1} no es la versión final`);
    assert.equal(s.rompe, rompe, `la situación ${k + 1} se rompe en otro punto`);
    /* Lo no alcanzado se DEDUCE: si alguien lo escribiera a mano, esto lo pilla. */
    assert.equal(noAlcanzados(s.rompe), faltan, `la situación ${k + 1} no deja ${faltan} puntos sin alcanzar`);
  }
  assert.equal(new Set(SITUACIONES_T1_8.map((s) => s.id)).size, 8, "dos situaciones comparten id");
});

test("★★★ los aciertos, los errores y la predicción son el texto literal del encargo", () => {
  assert.equal(ACIERTO_T1_8[2], "✅ Se rompió en el papel. Sin factura, este hecho no se anota, no llega al informe y los jefes deciden sin saberlo. Este hecho no llegó a tres puntos.");
  assert.equal(ACIERTO_T1_8[3], "✅ Se rompió al anotar. El papel está. Pero si nadie lo pasa a los libros, este hecho no llega al informe y los jefes deciden sin saberlo. Este hecho no llegó a dos puntos.");
  assert.equal(ACIERTO_T1_8[4], "✅ Se rompió en el informe. Este hecho está anotado, pero no lo pasaron al informe. Los jefes deciden sin ver este dato. Este hecho no llegó a un punto.");
  assert.equal(ACIERTO_T1_8[5], "✅ Se rompió al final. Este hecho llegó a los cinco puntos. Pero si nadie lee el informe, no cambia ninguna decisión. Mira la flecha de vuelta: quedó apagada.");
  assert.equal(ERROR_T1_8.A, "❌ Hasta ese punto todo funcionó bien. Mira más adelante: el corte está después.");
  assert.equal(ERROR_T1_8.B, "❌ Este hecho nunca llegó a ese punto. Se cortó antes, así que desde ahí ya no aparece.");
  assert.equal(ROTULO_ERROR_B_T1_8, "este hecho no llegó aquí");
  assert.equal(PREDICCION_T1_8.pregunta, "¿A cuántos puntos crees que no va a llegar este hecho?");
  assert.deepEqual(PREDICCION_T1_8.opciones, [0, 1, 2, 3]);
  assert.equal(PREDICCION_T1_8.acerto, "Lo predijiste bien. Mira hasta dónde alcanzó a llegar.");
  assert.equal(PREDICCION_T1_8.fallo, "No era lo que creías. Mira hasta dónde alcanzó a llegar.");
  assert.equal(CONTADOR_T1_8, "Este hecho no llegó a [N] puntos.");
  assert.equal(CONTADOR_LLEGO_A_TODOS, "Este hecho llegó a los cinco puntos");
  assert.equal(ROTULO_FLECHA_APAGADA, "pero no cambió nada");
  assert.equal(CIERRE_T1_8, "Mientras más temprano se rompe, a menos puntos llega el hecho. La empresa sigue andando. Pero decide sin saber lo que pasó.");
  assert.equal(T1_8.objetivo, "Encuentra en qué punto se rompió el ciclo. Y mira qué se pierde de ahí en adelante.");
  assert.equal(T1_8.consigna, "Lee lo que pasó en la empresa. Toca el punto donde se rompió el ciclo.");
  assert.equal(T1_8.pregunta, "¿Hasta dónde llegó bien, y dónde se cortó?");
});

test("★★★ ningún texto dice que la empresa se queda sin informe o sin decisión", () => {
  const todo = [
    ...Object.values(ACIERTO_T1_8), ...Object.values(ERROR_T1_8), CIERRE_T1_8, ALT_T1_8,
    PREDICCION_T1_8.acerto, PREDICCION_T1_8.fallo, ROTULO_ERROR_B_T1_8, ROTULO_FLECHA_APAGADA,
    CONTADOR_LLEGO_A_TODOS, ...[1, 2, 3].map(textoDelContador),
  ].join(" ");
  assert.ok(!/(se queda|queda|quedan|está|están) sin (el |un |ningún |ninguna )?(informe|decisi|registro|libro)/i.test(todo),
    "un texto da a entender que el paso entero deja de existir");
  assert.ok(!/no hay (informe|decisi)/i.test(todo), "un texto dice que no hay informe o decisión");
  assert.ok(!/se apagan (\w+ )?puntos/i.test(todo), "volvió la exageración «se apagan X puntos»");
  assert.ok(!/este gasto/i.test(todo), "volvió «este gasto»: la situación 2 es una venta");
  /* Los aciertos de 2, 3 y 4 hablan del hecho, no del paso. */
  for (const n of [2, 3, 4]) assert.ok(ACIERTO_T1_8[n].includes("Este hecho no llegó a"), `el ${n} dejó de hablar de «este hecho»`);
});

test("★★ el contador cambia solo el número, y el 1 va en singular", () => {
  assert.equal(textoDelContador(3), "Este hecho no llegó a 3 puntos.");
  assert.equal(textoDelContador(2), "Este hecho no llegó a 2 puntos.");
  assert.equal(textoDelContador(1), "Este hecho no llegó a 1 punto.");
  assert.equal(textoDelContador(0), CONTADOR_LLEGO_A_TODOS);
});

/* ═══════════════════ EL SORTEO Y LA REGLA ═══════════════════ */

test("★★★ el sorteo trae una situación de cada punto y una más, cinco en total, sobre 300 vueltas", () => {
  for (let k = 0; k < 300; k++) {
    const tanda = sortearT1_8(barajar);
    assert.equal(tanda.length, 5);
    assert.equal(new Set(tanda.map((s) => s.id)).size, 5, "se repitió una situación");
    for (const n of [2, 3, 4, 5]) {
      assert.ok(tanda.some((s) => s.rompe === n), `vuelta ${k}: ninguna situación del punto ${n}`);
    }
  }
});

test("★★★ el punto 1 no se puede elegir, ni siquiera en la lógica", () => {
  assert.deepEqual(TOCABLES_T1_8, [2, 3, 4, 5]);
  assert.equal(esTocable(1), false);
  assert.throws(() => evaluarT1_8(SITUACIONES_T1_8[0], 1), /no se puede tocar/);
});

test("★★★ la regla es el número: antes del roto es A, después es B", () => {
  let a = 0; let b = 0;
  for (const s of SITUACIONES_T1_8) {
    for (const n of TOCABLES_T1_8) {
      const r = evaluarT1_8(s, n);
      if (n === s.rompe) {
        assert.equal(r.ok, true);
        assert.equal(r.texto, ACIERTO_T1_8[s.rompe]);
        assert.equal(r.noAlcanzados, noAlcanzados(s.rompe));
        assert.deepEqual(r.apagados, apagadosDe(s.rompe));
        assert.equal(r.flechaApagada, s.rompe === 5);
      } else if (n < s.rompe) {
        assert.equal(r.patron, "A"); assert.equal(r.texto, ERROR_T1_8.A);
        assert.equal(r.atenuado, null, "la A marca un punto y eso ya es una pista");
        a += 1;
      } else {
        assert.equal(r.patron, "B"); assert.equal(r.texto, ERROR_T1_8.B);
        assert.equal(r.atenuado, n, "la B no atenúa el punto que tocó");
        b += 1;
      }
    }
  }
  assert.ok(a > 0 && b > 0);
});

test("★★ el 5 no apaga ningún punto; apaga la flecha, y es el único que la apaga", () => {
  assert.deepEqual(apagadosDe(5), []);
  assert.equal(apagaLaFlecha(5), true);
  for (const n of [2, 3, 4]) assert.equal(apagaLaFlecha(n), false);
  assert.deepEqual(apagadosDe(2), [3, 4, 5]);
});

test("★★★ la predicción no puntúa: acertar las cinco da 100 % prediga lo que prediga", () => {
  for (const s of SITUACIONES_T1_8) {
    assert.equal(evaluarPrediccion(s, noAlcanzados(s.rompe)).acerto, true);
    const otra = PREDICCION_T1_8.opciones.find((x) => x !== noAlcanzados(s.rompe));
    assert.equal(evaluarPrediccion(s, otra).texto, PREDICCION_T1_8.fallo);
  }
  /* Y el reintento vale la mitad. */
  assert.equal(puntuar([{ primeroOk: false, segundoOk: true }], 1), 50);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★★ el punto 1 no es un botón ni entra en el Tab; los otros cuatro sí", () => {
  const { caja, desmontar } = montar();
  try {
    const uno = punto(caja, 1);
    assert.notEqual(uno.tagName, "BUTTON", "el punto 1 es un botón");
    assert.equal(uno.getAttribute("tabindex"), null, "el punto 1 entra en el Tab");
    assert.equal(uno.querySelectorAll("button, [tabindex]").length, 0);
    for (const n of [2, 3, 4, 5]) {
      const b = punto(caja, n);
      assert.equal(b.tagName, "BUTTON", `el punto ${n} no es un botón`);
      assert.equal(b.disabled, false);
    }
    /* Tocar el 1 no hace nada. */
    tocar(uno);
    assert.equal(fase(caja), "tocar");
    assert.equal(caja.querySelectorAll('[role="status"]').length, 0, "tocar el 1 dio una devolución");
    /* Y cada punto lleva su número y su rótulo escritos. */
    for (const p of PUNTOS_T1_8) {
      assert.ok(punto(caja, p.n).textContent.includes(p.rotulo), `el punto ${p.n} no lleva su rótulo`);
      assert.ok(punto(caja, p.n).querySelector(`[data-numero="${p.n}"]`), `el punto ${p.n} no lleva su número`);
    }
  } finally { desmontar(); }
});

test("★★ el vacío: el anillo entero encendido y la pregunta, que se va al responder", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelector("[data-vacio]").textContent, T1_8.pregunta);
    assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 0, "hay puntos apagados de salida");
    assert.equal(caja.querySelectorAll("[data-corte]").length, 0, "hay un corte de salida");
    assert.equal(caja.querySelector("[data-anillo]").dataset.retorno, "encendido");
    assert.equal(caja.querySelector("[data-encabezado] [data-consigna]").textContent, T1_8.consigna);
    tocar(punto(caja, actual(caja).rompe));
    assert.equal(caja.querySelectorAll("[data-vacio]").length, 0);
  } finally { desmontar(); }
});

test("★★★ acertar: flujo, predicción, y SOLO DESPUÉS el corte y los apagones uno por uno", async () => {
  const { caja, desmontar } = montar();
  try {
    /* Una que apague algo: la del punto 2 o la que haya. */
    const s = actual(caja);
    tocar(punto(caja, s.rompe));
    assert.equal(fase(caja), "flujo");
    assert.ok(caja.querySelector('[data-flujo="avanza"]'), "el flujo no arranca");
    assert.equal(caja.querySelector("[data-flujo]").dataset.flujoHasta, String(s.rompe));
    assert.equal(caja.querySelectorAll("[data-prediccion]").length, 0, "la predicción salió antes de que el flujo avanzara");

    await esperar(MS.flujo + 60);
    assert.equal(fase(caja), "prediccion");
    assert.equal(caja.querySelectorAll("[data-prediccion-opcion]").length, 4);
    assert.equal(caja.querySelectorAll("[data-corte]").length, 0, "el corte salió antes de predecir");
    assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 0, "se apagó algo antes de predecir");
    assert.equal(caja.querySelectorAll('[role="status"]').length, 0, "la devolución se adelantó a la cascada");

    tocar(caja.querySelector('[data-prediccion-opcion="0"]'));
    assert.equal(caja.querySelector('[data-prediccion-opcion="0"]').dataset.elegida, "si", "la elegida no queda marcada");
    assert.equal(caja.querySelector("[data-corte]")?.dataset.corte, String(s.rompe), "el corte no está en el roto");

    /* Uno por uno: a mitad de la cascada no están todos. */
    const total = apagadosDe(s.rompe).length;
    if (total > 1) {
      await esperar(MS.corte + 40);
      assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 1, "no se apagan de uno en uno");
      assert.equal(caja.querySelector("[data-contador]").textContent, textoDelContador(1), "el contador no sube con el apagón");
    }
    await esperar(cascadaDe(s.rompe));
    assert.equal(fase(caja), "fin");
    const apagados = [...caja.querySelectorAll('[data-punto][data-apagado="si"]')].map((x) => Number(x.dataset.punto));
    assert.deepEqual(apagados, apagadosDe(s.rompe), "no se apagaron justo los de después del roto");
    for (const n of apagados) {
      assert.ok(punto(caja, n).textContent.includes(ROTULO_APAGADO), `el ${n} apagado no lo dice con palabras`);
    }
    assert.equal(caja.querySelector("[data-contador]").textContent, textoDelContador(noAlcanzados(s.rompe)));
    assert.ok(caja.textContent.includes(ACIERTO_T1_8[s.rompe].slice(2)), "no sale la devolución del punto");
  } finally { desmontar(); }
});

test("★★★ los dos cierres de la predicción, y ninguno dice el número", async () => {
  for (const acierta of [true, false]) {
    const { caja, desmontar } = montar();
    try {
      const s = actual(caja);
      const bien = noAlcanzados(s.rompe);
      await resolver(caja, acierta ? bien : PREDICCION_T1_8.opciones.find((x) => x !== bien));
      const cierre = caja.querySelector("[data-cierre-prediccion]");
      assert.ok(cierre, "no sale el cierre de la predicción");
      assert.equal(cierre.dataset.cierrePrediccion, acierta ? "acerto" : "fallo");
      assert.equal(cierre.textContent, acierta ? PREDICCION_T1_8.acerto : PREDICCION_T1_8.fallo);
      assert.ok(!/\d/.test(cierre.textContent), "el cierre de la predicción dice el número");
    } finally { desmontar(); }
  }
});

test("★★★ el punto 5: cero apagados, la flecha apagada y «pero no cambió nada»", async () => {
  const { caja, desmontar } = montar();
  try {
    /* Recorre la tanda hasta dar con la del 5, que el sorteo garantiza. */
    for (let k = 0; k < T1_8.porPartida; k++) {
      const s = actual(caja);
      if (s.rompe === 5) {
        await resolver(caja);
        assert.equal(caja.querySelectorAll('[data-punto][data-apagado="si"]').length, 0, "en el 5 se apagó un punto");
        assert.equal(caja.querySelector("[data-anillo]").dataset.retorno, "apagado", "la flecha de vuelta no se apagó");
        assert.equal(caja.querySelector("[data-franja]").dataset.retorno, "apagado");
        assert.ok(caja.querySelector("[data-rotulo-flecha]").textContent.includes(ROTULO_FLECHA_APAGADA));
        assert.equal(caja.querySelector("[data-contador]").textContent, CONTADOR_LLEGO_A_TODOS);
        return;
      }
      await resolver(caja);
      /* Y en los otros la flecha NO se apaga. */
      assert.equal(caja.querySelector("[data-anillo]").dataset.retorno, "encendido", `en el ${s.rompe} se apagó la flecha`);
      assert.equal(caja.querySelectorAll("[data-rotulo-flecha]").length, 0);
      tocar(boton(caja, "Siguiente situación"));
    }
    assert.fail("la tanda no trajo ninguna situación del punto 5");
  } finally { desmontar(); }
});

/* Busca una tanda cuya primera situación admita el error pedido. */
function montarCon(condicion) {
  for (let k = 0; k < 200; k++) {
    const m = montar();
    if (condicion(actual(m.caja))) return m;
    m.desmontar();
  }
  throw new Error("no salió ninguna situación que sirva");
}

test("★★★ error A: el flujo pasa de largo y se desvanece, sin corte ni apagones ni pista", async () => {
  const { caja, desmontar } = montarCon((s) => s.rompe >= 3);
  try {
    const s = actual(caja);
    const tocado = s.rompe - 1;
    tocar(punto(caja, tocado));
    assert.equal(fase(caja), "tocar", "el error cambió de fase: algo corrió");
    assert.equal(punto(caja, tocado).dataset.parpadea, "si", "el punto tocado no parpadea");
    const flujo = caja.querySelector("[data-flujo]");
    assert.equal(flujo?.dataset.flujo, "desvanece", "el flujo de la A no se desvanece");
    assert.equal(flujo.dataset.flujoHasta, String(tocado));
    assert.equal(caja.querySelectorAll("[data-corte]").length, 0, "la A marcó un corte");
    assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 0, "la A apagó algo");
    assert.equal(caja.querySelectorAll("[data-atenuado], [data-roto]").length, 0, "la A marcó un punto: eso es una pista");
    assert.equal(caja.querySelectorAll("[data-prediccion]").length, 0, "hubo predicción tras fallar");
    assert.ok(caja.textContent.includes(ERROR_T1_8.A.slice(2)));

    await esperar(Math.max(MS.parpadeo, MS.desvanece) + 60);
    assert.equal(caja.querySelectorAll("[data-flujo], [data-parpadea]").length, 0, "el efecto de la A se quedó en pantalla");
    /* Y el reintento, con el texto de error visible y los puntos otra vez tocables. */
    assert.ok(caja.textContent.includes(ERROR_T1_8.A.slice(2)), "el texto de error se fue antes del reintento");
    assert.equal(punto(caja, s.rompe).disabled, false, "no se puede reintentar");
  } finally { desmontar(); }
});

test("★★★ error B: el punto tocado se atenúa con su rótulo, y nada más cambia", async () => {
  const { caja, desmontar } = montarCon((s) => s.rompe <= 4);
  try {
    const s = actual(caja);
    const tocado = s.rompe + 1;
    tocar(punto(caja, tocado));
    assert.equal(fase(caja), "tocar");
    assert.equal(punto(caja, tocado).dataset.atenuado, "si", "el punto de la B no se atenúa");
    assert.ok(punto(caja, tocado).textContent.includes(ROTULO_ERROR_B_T1_8), "falta «este hecho no llegó aquí»");
    assert.equal(caja.querySelectorAll("[data-atenuado]").length, 1, "se atenuó más de un punto");
    assert.equal(caja.querySelectorAll("[data-corte], [data-flujo]").length, 0, "la B corrió el flujo o marcó el corte");
    assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 0, "la B apagó puntos: es una cascada falsa");
    assert.equal(caja.querySelector("[data-anillo]").dataset.retorno, "encendido");
    assert.ok(caja.textContent.includes(ERROR_T1_8.B.slice(2)));
  } finally { desmontar(); }
});

test("★★ el reintento acertado corre la cascada y vale la mitad", async () => {
  let recibido = null;
  const { caja, desmontar } = montar({ onCompletar: (pct) => { recibido = pct; } });
  try {
    for (let k = 0; k < T1_8.porPartida; k++) {
      const s = actual(caja);
      if (k === 0) {
        const malo = TOCABLES_T1_8.find((n) => n !== s.rompe);
        tocar(punto(caja, malo));
        await esperar(MS.desvanece + 60);
      }
      await resolver(caja);
      assert.equal(fase(caja), "fin", "el reintento acertado no llegó al final de la cascada");
      tocar(boton(caja, k + 1 === T1_8.porPartida ? "Ver el resultado" : "Siguiente situación"));
    }
    assert.equal(recibido, 90, "un reintento de cinco no deja el 90 %");
  } finally { desmontar(); }
});

test("★★ dos fallos cierran la situación con el corte verdadero, quieto y sin predicción", async () => {
  const { caja, desmontar } = montarCon((s) => s.rompe <= 4);
  try {
    const s = actual(caja);
    tocar(punto(caja, 5));
    await esperar(MS.parpadeo + 40);
    tocar(punto(caja, 5));
    assert.equal(fase(caja), "revelado");
    assert.equal(caja.querySelector("[data-corte]").dataset.corte, String(s.rompe), "el corte revelado no es el verdadero");
    const apagados = [...caja.querySelectorAll('[data-punto][data-apagado="si"]')].map((x) => Number(x.dataset.punto));
    assert.deepEqual(apagados, apagadosDe(s.rompe));
    assert.equal(caja.querySelectorAll("[data-prediccion]").length, 0, "hubo predicción sin haber acertado el punto");
    assert.ok(boton(caja, "Siguiente situación") || boton(caja, "Ver el resultado"));
  } finally { desmontar(); }
});

test("★★ el final: las cinco resueltas, cada una con su corte y su conteo, y el cierre", async () => {
  const { caja, desmontar } = montar();
  try {
    const vistas = [];
    for (let k = 0; k < T1_8.porPartida; k++) {
      vistas.push(await resolver(caja));
      tocar(boton(caja, k + 1 === T1_8.porPartida ? "Ver el resultado" : "Siguiente situación"));
    }
    assert.equal(caja.querySelector("[data-cierre-texto]").textContent, CIERRE_T1_8);
    const filas = [...caja.querySelectorAll("[data-resuelta]")];
    assert.equal(filas.length, 5);
    for (const [k, f] of filas.entries()) {
      const s = vistas[k];
      assert.equal(f.dataset.resuelta, s.id);
      assert.equal(f.querySelector('[data-tira-tramo="corte"]') ? 1 : 0, s.rompe < 5 ? 1 : 0, `${s.id}: el corte no está`);
      if (s.rompe === 5) assert.equal(f.querySelector("[data-tira-vuelta]").dataset.tiraVuelta, "apagada");
      assert.deepEqual(
        [...f.querySelectorAll('[data-tira-punto][data-apagado="si"]')].map((x) => Number(x.dataset.tiraPunto)),
        apagadosDe(s.rompe), `${s.id}: la tira apaga otros puntos`);
      assert.ok(f.querySelector("[data-tira-contador]").textContent.startsWith(textoDelContador(noAlcanzados(s.rompe))));
    }
  } finally { desmontar(); }
});

test("★★ con movimiento reducido: sin flujo, y tres imágenes — entero, corte, apagados", async () => {
  reducir = true;
  const { caja, desmontar } = montar();
  try {
    await esperar(10);
    const s = actual(caja);
    tocar(punto(caja, s.rompe));
    assert.equal(fase(caja), "prediccion", "con movimiento reducido el flujo no se salta");
    assert.equal(caja.querySelectorAll("[data-flujo]").length, 0, "el flujo se dibuja con movimiento reducido");
    tocar(caja.querySelector('[data-prediccion-opcion="1"]'));
    assert.equal(fase(caja), "corte");
    assert.ok(caja.querySelector("[data-corte]"), "la segunda imagen no tiene el corte");
    assert.equal(caja.querySelectorAll('[data-apagado="si"]').length, 0, "la segunda imagen ya trae los apagados");
    await esperar(MS.imagen + 60);
    assert.equal(fase(caja), "fin");
    assert.equal(caja.querySelectorAll('[data-punto][data-apagado="si"]').length, apagadosDe(s.rompe).length);
    assert.ok(caja.querySelector("[data-contador]"));
  } finally { desmontar(); reducir = false; }
});

/* ═══════════════════ VOCABULARIO Y CORAL ═══════════════════ */

const TEAL = /#52C4B0|#2a9d8f|rgba?\(\s*82,\s*196,\s*176|rgba?\(\s*42,\s*157,\s*143/i;
const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;
const CORAL = /#e76f51|rgba?\(\s*231,\s*111,\s*81/i;

test("★★★ nada del Tema 2 entra en el contenido, en ninguna fase", async () => {
  const { caja, desmontar } = montar();
  try {
    const revisar = (cuando) => {
      const copia = caja.querySelector("[data-contenido]").cloneNode(true);
      for (const rot of copia.querySelectorAll("[data-rotulo-seccion]")) rot.remove();
      assert.ok(!copia.textContent.includes("▲"), `${cuando}: se coló el ▲`);
      assert.ok(!TEAL.test(copia.innerHTML), `${cuando}: se coló el teal`);
      assert.ok(!AMBAR.test(copia.innerHTML), `${cuando}: se coló el ámbar`);
      assert.ok(!/balanza|colector|cinta|adentro|afuera/i.test(copia.textContent), `${cuando}: vocabulario prohibido`);
      assert.equal(copia.querySelectorAll("[data-arco], [data-balanza], [data-saldo], [data-ancla], [data-colector]").length, 0);
    };
    revisar("de entrada");
    await resolver(caja);
    revisar("tras la cascada");
  } finally { desmontar(); }
});

test("★★ el coral solo sale al fallar", async () => {
  const { caja, desmontar } = montarCon((s) => s.rompe <= 4);
  try {
    assert.ok(!CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "hay coral de salida");
    tocar(punto(caja, 5));
    assert.ok(CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "fallar no se marca en coral");
    await esperar(MS.parpadeo + 60);
    assert.ok(!CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "el contorno coral se quedó tras el parpadeo");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

test("★★★ T1-8 está en las dos puertas, tercera en el camino, con la misma clasificación", async () => {
  const { SUBJECTS, HACER } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  const deHacer = tema.actividades.filter((a) => a.clasificacion.tipo === HACER);
  const fila = deHacer.find((a) => a.id === T1_8.id);
  assert.ok(fila, "T1-8 no está en el catálogo");
  assert.equal(fila.clasificacion.modalidad, "evaluativa");
  assert.equal(fila.clasificacion.dificultad, T1_8.dificultad);
  assert.equal(fila.clasificacion.fpBase, T1_8.fpBase);
  assert.ok(JUEGOS.some((j) => j.id === T1_8.id), "T1-8 sale en el camino y no la abre nadie");

  /* El orden visible mientras T1-3 siga retenida: T1-1, T1-2, T1-8, T1-4, T1-5, T1-6, T1-7. */
  const orden = [
    "t1-desde-donde-preguntan", "t1-que-entro-y-que-salio", "t1-donde-se-rompio",
    "t1-que-le-pasa-a-cada-uno", "t1-la-ecuacion-en-movimiento", "t1-en-cual-estado-aparece", "t1-la-articulacion",
  ];
  assert.deepEqual(deHacer.map((a) => a.id), orden, "el camino no va en el orden del encargo");
  assert.deepEqual(JUEGOS.map((j) => j.id), orden, "el registro de la vista va en otro orden");
  /* 260 FP mientras T1-3 siga retenida. */
  assert.equal(deHacer.reduce((x, a) => x + a.clasificacion.fpBase, 0), 260);
});

test("★★★ el marco de cada actividad dice su bloque: T1-8 es Aplicación, no Cimientos", async () => {
  const { rotuloDeBloque, JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const esperado = {
    "t1-desde-donde-preguntan": "CIMIENTOS", "t1-que-entro-y-que-salio": "CIMIENTOS",
    "t1-donde-se-rompio": "APLICACIÓN", "t1-que-le-pasa-a-cada-uno": "APLICACIÓN",
    "t1-la-ecuacion-en-movimiento": "ANÁLISIS", "t1-en-cual-estado-aparece": "ANÁLISIS",
    "t1-la-articulacion": "MAESTRÍA",
  };
  assert.deepEqual(Object.fromEntries(JUEGOS.map((j) => [j.id, rotuloDeBloque(j.id)])), esperado);
});

test("medio, 25 FP y cinco situaciones por partida", () => {
  assert.equal(T1_8.dificultad, "medio");
  assert.equal(T1_8.fpBase, 25);
  assert.equal(T1_8.porPartida, 5);
});

test("★★ el panel docente lee cada situación, y ninguna se confunde con otra", async () => {
  const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
  const etiquetas = SITUACIONES_T1_8.map((s) => etiquetaDeItem(T1_8.id, s.id));
  for (const [k, e] of etiquetas.entries()) {
    assert.ok(e, `«${SITUACIONES_T1_8[k].id}» no se traduce y el profesor vería el id crudo`);
    assert.ok(!/^t8-\d+$/.test(e), "se traduce a otro id");
  }
  assert.equal(new Set(etiquetas).size, SITUACIONES_T1_8.length);
  assert.equal(situacionDeItem("no-existe"), null);
});
