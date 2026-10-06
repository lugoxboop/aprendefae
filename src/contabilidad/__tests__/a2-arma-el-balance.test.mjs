import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A2 · ARMA EL BALANCE.
 *
 * Lo que aquí se rompe en silencio es distinto de A1: el documento ES la
 * respuesta. Un renglón mal clasificado que llegue a escribirse —aunque sea
 * un instante— no es un fallo abstracto: es un estado financiero que afirma
 * algo falso, como que la empresa le debe a su propio dueño.
 *
 * Y el otro riesgo es aritmético: si los dos balances dejaran de cuadrar, la
 * línea de cierre enseñaría dos cifras distintas y la actividad entera diría
 * lo contrario de lo que enseña.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
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

const ArmaElBalance = (await import("../../components/mecanicas/libros/ArmaElBalance.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  BALANCES, SECCIONES, evaluarUbicacion, puntuar, montarBanco, cuentaHistorica,
} = await import("../armaElBalance.js");
const { RAZON_POR_CUENTA, ERROR_POR_CRUCE, ITEMS_HISTORICOS } = await import("../../data/contabilidadBalance.js");
const {
  ACTIVO, PASIVO, PATRIMONIO, REALES, TRANSITORIAS, tipoDeCuenta, mayorConSaldos,
  CALEJA, LAVADO_DE_AUTOS, pesos,
} = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(ArmaElBalance, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const seccion = (caja, id) => caja.querySelector(`[data-seccion="${id}"]`);
const renglones = (caja) => [...caja.querySelectorAll("[data-renglon]")].map((r) => r.getAttribute("data-renglon"));
const fichaEnMano = (caja) => [...caja.querySelectorAll("[data-ficha]")]
  .find((f) => f.getAttribute("aria-label")?.includes(","));
const cuentaEnMano = (caja) => fichaEnMano(caja).getAttribute("data-ficha").split(" · ")[0];

/* ═══════════════ LOS DOS BALANCES ═══════════════ */

test("★★ los dos balances CUADRAN, y sus cifras salen del mayor", () => {
  /*
   * Es la afirmación central de la actividad: activos = pasivos + patrimonio.
   * Si dejara de cumplirse, la línea de cierre enseñaría dos cifras distintas
   * y la actividad diría lo contrario de lo que viene a enseñar.
   *
   * Y no se comprueba contra números escritos: se comprueba contra el mayor
   * de cada caso, que es de donde salen.
   */
  assert.equal(BALANCES.length, 2);
  for (const b of BALANCES) {
    assert.ok(b.cuadra, `${b.id}: ${b.activos} contra ${b.pasivosMasPatrimonio}`);
    assert.equal(b.activos, b.pasivosMasPatrimonio);
    assert.ok(b.activos > 0);

    const transacciones = b.id === "caleja" ? CALEJA.transacciones : LAVADO_DE_AUTOS.transacciones;
    const mayor = mayorConSaldos(transacciones);
    assert.equal(b.cuentas.length, mayor.length, `${b.id}: faltan o sobran cuentas`);
    for (const c of b.cuentas) {
      const enMayor = mayor.find((x) => x.cuenta === c.cuenta);
      assert.ok(enMayor, `${b.id}: «${c.cuenta}» no está en el mayor`);
      assert.equal(c.valor, enMayor.saldo, `${b.id} / ${c.cuenta}: la cifra no es la del mayor`);
    }
  }
  /* Y los dos totales del libro, escritos, para que la igualdad no sea circular. */
  assert.equal(BALANCES.find((b) => b.id === "caleja").activos, 415000);
  assert.equal(BALANCES.find((b) => b.id === "lavado").activos, 21350);
});

test("★ un balance no lleva ingresos ni gastos, y la mecánica lo hace cumplir", () => {
  for (const b of BALANCES) {
    for (const c of b.cuentas) {
      const tipo = tipoDeCuenta(c.cuenta);
      assert.ok(REALES.includes(tipo), `${b.id}: «${c.cuenta}» es ${tipo}`);
      assert.ok(!TRANSITORIAS.includes(tipo));
    }
  }
  /* Y si alguna vez entrara una transitoria, revienta en vez de dibujarla. */
  assert.throws(
    () => montarBanco("inventado"),
    /no existe el banco/,
  );
});

test("★ la sección de cada cuenta la decide el CATÁLOGO, no una lista aparte", () => {
  for (const b of BALANCES) {
    for (const c of b.cuentas) {
      assert.equal(c.seccion, tipoDeCuenta(c.cuenta), `${c.cuenta}: la sección se separó del catálogo`);
    }
  }
});

test("★ el encabezado de los dos balances va SIN fecha", () => {
  /*
   * El libro encabeza «A 31 de diciembre» un ejercicio que ocurre entero en
   * enero. No se corrige por cuenta propia, y tampoco se enseña una fecha que
   * puede ser errata: hasta que el profesor confirme, no va ninguna.
   */
  for (const b of BALANCES) assert.equal(b.fecha, null, `${b.id} trae fecha`);
});

test("las dieciocho cuentas tienen su razón propia, y ninguna es un «✅ Activo» pelado", () => {
  let cuantas = 0;
  for (const b of BALANCES) {
    for (const c of b.cuentas) {
      cuantas += 1;
      assert.ok(c.acierto, `${c.cuenta}: sin razón`);
      assert.ok(c.acierto.startsWith("✅"), `${c.cuenta}: no se ve como acierto`);
      assert.ok(c.acierto.length > 30, `${c.cuenta}: la razón es demasiado corta — ${c.acierto}`);
      assert.ok(!/\{[a-zA-Z]+\}/.test(c.acierto), `${c.cuenta}: hueco sin rellenar`);
    }
  }
  assert.equal(cuantas, 18, `salieron ${cuantas} ítems entre los dos bancos`);
});

/* ═══════════════ LAS SEIS CONFUSIONES ═══════════════ */

/*
 * Pasivo y patrimonio confundidos comparten texto en las dos direcciones: es
 * el error B de Gen (lote 1 reescrito), que habla de las dos secciones a la vez.
 * Los otros cuatro cruces tienen el suyo.
 */
const MISMO_TEXTO = new Set([`${PASIVO}>${PATRIMONIO}`, `${PATRIMONIO}>${PASIVO}`]);

test("★ los SEIS cruces entre tres secciones tienen su devolución, y solo pasivo↔patrimonio la comparte", () => {
  const sect = [ACTIVO, PASIVO, PATRIMONIO];
  const vistos = new Set();
  for (const de of sect) {
    for (const a of sect) {
      if (de === a) continue;
      const r = evaluarUbicacion({ seccion: de, acierto: "✅ x" }, a);
      assert.ok(!r.ok);
      assert.ok(r.texto?.startsWith("❌"), `${de}>${a}: no se ve como error`);
      assert.ok(r.texto.length > 40, `${de}>${a}: devolución demasiado corta`);
      if (!MISMO_TEXTO.has(`${de}>${a}`)) assert.ok(!vistos.has(r.texto), `${de}>${a}: repite la devolución de otro cruce`);
      vistos.add(r.texto);
      assert.equal(r.cruce, `${de}>${a}`);
    }
  }
  assert.equal(vistos.size, 5, "los seis cruces no dan cinco textos distintos");
  assert.equal(ERROR_POR_CRUCE[`${PASIVO}>${PATRIMONIO}`].texto, ERROR_POR_CRUCE[`${PATRIMONIO}>${PASIVO}`].texto);
  assert.equal(Object.keys(ERROR_POR_CRUCE).length, 6);
});

test("★ ninguna devolución usa el atajo de «por pagar», que falla con un pasivo real", () => {
  /*
   * Obligaciones financieras es un pasivo y no lleva «por pagar» en el
   * nombre. Un atajo que dijera «los pasivos suelen llevar por pagar» le
   * enseñaría a fallar justo esa.
   */
  for (const e of Object.values(ERROR_POR_CRUCE)) {
    assert.ok(!/suelen llevar|por pagar.*en el nombre/i.test(e.texto),
      `una devolución da el atajo del nombre: ${e.texto}`);
  }
  /* Y el banco tiene la cuenta que lo desmiente. */
  const todas = BALANCES.flatMap((b) => b.cuentas.map((c) => c.cuenta));
  assert.ok(todas.includes("Obligaciones financieras"));
  assert.equal(tipoDeCuenta("Obligaciones financieras"), PASIVO);
});

test("un cruce imposible revienta en vez de quedarse mudo", () => {
  assert.throws(() => evaluarUbicacion({ seccion: ACTIVO, acierto: "x" }, "inventada"), /no hay devolución/);
});

/* ═══════════════ EL PANEL DOCENTE ═══════════════ */

test("★ el panel sabe leer los ítems nuevos Y los que ya jugaron estudiantes", () => {
  for (const b of BALANCES) {
    for (const c of b.cuentas) {
      const e = etiquetaDeItem("cu-de-que-familia", c.id, 120);
      assert.ok(e, `sin etiqueta: ${c.id}`);
      assert.ok(e.includes(c.cuenta), `${c.id}: la etiqueta no dice la cuenta`);
    }
  }
  /* Los doce del banco anterior siguen siendo legibles. */
  for (const [id, cuenta] of Object.entries(ITEMS_HISTORICOS)) {
    const e = etiquetaDeItem("cu-de-que-familia", id, 120);
    assert.equal(e, cuenta, `${id}: el panel dejó de saber qué contestó ese estudiante`);
    assert.equal(cuentaHistorica(id), cuenta);
  }
  assert.equal(etiquetaDeItem("cu-de-que-familia", "cu2-99"), null);
});

test("los ids nuevos dicen de qué banco y de qué cuenta son", () => {
  for (const b of BALANCES) {
    for (const c of b.cuentas) {
      assert.match(c.id, new RegExp(`^cu2-${b.id}-[a-z0-9-]+$`), `${c.id}: id ilegible`);
    }
  }
  const todos = BALANCES.flatMap((b) => b.cuentas.map((c) => c.id));
  assert.equal(new Set(todos).size, todos.length, "hay ids repetidos entre los dos bancos");
});

/* ═══════════════ LO QUE SE ESCRIBE, Y LO QUE NO ═══════════════ */

test("★★ un error NO escribe el renglón: el documento no puede mentir ni un instante", () => {
  const { caja, desmontar } = montar();
  try {
    assert.deepEqual(renglones(caja), [], "el balance no empieza en blanco");
    const cuenta = cuentaEnMano(caja);
    const item = BALANCES.flatMap((b) => b.cuentas).find((c) => c.cuenta === cuenta);
    const mala = SECCIONES.find((s) => s.id !== item.seccion).id;

    tocar(seccion(caja, mala));

    assert.deepEqual(renglones(caja), [], "el error escribió un renglón");
    assert.equal(caja.querySelectorAll("[data-subtotal]").length, 0, "el error movió un subtotal");
    assert.ok(caja.querySelector("[data-fallo]"), "no se avisa de que no se escribió nada");
  } finally { desmontar(); }
});

test("★ acertar SÍ escribe, y en su sección", () => {
  const { caja, desmontar } = montar();
  try {
    const cuenta = cuentaEnMano(caja);
    const item = BALANCES.flatMap((b) => b.cuentas).find((c) => c.cuenta === cuenta);
    tocar(seccion(caja, item.seccion));

    assert.deepEqual(renglones(caja), [cuenta], "el acierto no escribió el renglón");
    const dentro = seccion(caja, item.seccion).querySelectorAll("[data-renglon]");
    assert.equal(dentro.length, 1, "el renglón no quedó en su sección");
    assert.ok(caja.querySelector("[data-subtotal]"), "el subtotal no apareció");
  } finally { desmontar(); }
});

test("★ el resaltado del error usa el chip neutro, no coral de texto", () => {
  const { caja, desmontar } = montar();
  try {
    assert.ok(!CORAL.test(caja.innerHTML), "pinta coral sin que nadie haya fallado");
    const cuenta = cuentaEnMano(caja);
    const item = BALANCES.flatMap((b) => b.cuentas).find((c) => c.cuenta === cuenta);
    const mala = SECCIONES.find((s) => s.id !== item.seccion).id;
    tocar(seccion(caja, mala));

    /* El coral marca el error, y el chip neutro explica dónde mirar. */
    assert.ok(CORAL.test(caja.innerHTML), "el fallo no se marca en coral");
    const resaltadas = [...caja.querySelectorAll('[data-resaltada="si"]')];
    assert.ok(resaltadas.length >= 1, "no se resaltó ninguna sección");
    for (const r of resaltadas) {
      assert.ok(/#B8C4D4|rgb\(184,\s*196,\s*212\)/i.test(r.getAttribute("style") ?? ""),
        "la sección resaltada no usa el neutro del kit");
    }
  } finally { desmontar(); }
});

test("★ el documento se lee de arriba abajo: las tres secciones son hermanas apiladas", () => {
  /*
   * Aquí apilar SÍ es correcto, al revés que en la mesa de dos casos del
   * Aprender: un balance real se lee de arriba abajo y no hay ninguna
   * comparación simultánea que destruir.
   */
  const { caja, desmontar } = montar();
  try {
    const doc = caja.querySelector("[data-balance]");
    const secciones = [...doc.querySelectorAll("[data-seccion]")];
    assert.equal(secciones.length, 3);
    assert.deepEqual(secciones.map((s) => s.getAttribute("data-seccion")), [ACTIVO, PASIVO, PATRIMONIO]);
    for (const s of secciones) assert.equal(s.parentElement, doc, "una sección se anidó dentro de otra");
  } finally { desmontar(); }
});

/*
 * ═══════════ EN QUÉ MOMENTO ESTÁ HECHA LA FOTO ═══════════
 *
 * Caleja sale en dos capítulos con dos cierres distintos: ocho transacciones y
 * 465.000 en el capítulo 2, las primeras seis y 415.000 en el 3. Sin decirlo,
 * un estudiante que vea los dos balances no tiene forma de saber cuál creer —
 * y el que está aquí parece el equivocado, porque es el más pequeño.
 *
 * El lavado no lo necesita: sale una sola vez.
 */
test("★★ el balance de Caleja dice de qué momento es; el del lavado no lo necesita", () => {
  const caleja = BALANCES.find((b) => b.id === "caleja");
  const lavado = BALANCES.find((b) => b.id === "lavado");
  assert.match(caleja.subtitulo ?? "", /seis transacciones/, "Caleja perdió su subtítulo");
  assert.equal(lavado.subtitulo, null, "el lavado no tiene dos momentos que distinguir");
  /* Y el número dicho es el que el caso tiene de verdad. */
  assert.equal(CALEJA.transacciones.length, 6);
  assert.equal(caleja.activos, 415000);
});

test("★ y ese subtítulo se pinta debajo del nombre del estado", () => {
  const { caja, desmontar } = montar();
  const balance = BALANCES.find((b) => b.empresa === caja.querySelector("[data-balance]").textContent.slice(0, b.empresa.length));
  const sub = caja.querySelector("[data-subtitulo]");
  if (balance?.subtitulo) {
    assert.ok(sub, "el balance tiene subtítulo y no se pintó");
    assert.equal(sub.textContent, balance.subtitulo);
  } else {
    assert.equal(sub, null, "se pintó un subtítulo que ese balance no tiene");
  }
  desmontar();
});

test("★ el encabezado en pantalla no enseña ninguna fecha", () => {
  const { caja, desmontar } = montar();
  try {
    const doc = caja.querySelector("[data-balance]").textContent;
    assert.ok(!/diciembre|enero|20X1|31 de/i.test(doc), `el encabezado trae fecha: ${doc.slice(0, 120)}`);
  } finally { desmontar(); }
});

test("★ la línea de cierre solo aparece con el balance completo", () => {
  const { caja, desmontar } = montar();
  try {
    assert.ok(!caja.querySelector("[data-cierre-balance]"), "el cierre salió con el balance vacío");
    const cuenta = cuentaEnMano(caja);
    const item = BALANCES.flatMap((b) => b.cuentas).find((c) => c.cuenta === cuenta);
    tocar(seccion(caja, item.seccion));
    assert.ok(!caja.querySelector("[data-cierre-balance]"), "el cierre salió con una sola cuenta escrita");
  } finally { desmontar(); }
});

test("el reintento vale la mitad, y cada cuenta pesa lo mismo dentro de su banco", () => {
  const siete = Array.from({ length: 7 }, () => ({ primeroOk: true }));
  assert.equal(puntuar(siete, 7), 100);
  assert.equal(puntuar(Array.from({ length: 7 }, () => ({ primeroOk: false, segundoOk: true })), 7), 50);
  assert.equal(puntuar([], 7), 0);
  assert.equal(puntuar(siete, 0), 0);
  /* Y los dos bancos reparten el 100 % de forma distinta, como dice la ficha. */
  const caleja = BALANCES.find((b) => b.id === "caleja").cuentas.length;
  const lavado = BALANCES.find((b) => b.id === "lavado").cuentas.length;
  assert.equal(caleja, 7);
  assert.equal(lavado, 11);
  assert.notEqual(100 / caleja, 100 / lavado);
});
