import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A5 · EL SALDO DE LA CUENTA.
 *
 * Lo que aquí se rompe en silencio es la cancelación. Si corriera en un primer
 * error, la columna que queda en pie SERÍA la respuesta: el reintento no
 * tendría nada que calcular y la actividad dejaría de medir si el estudiante
 * sabe restar. Es la regla que manda, y por eso tiene cuatro pruebas.
 *
 * Y lo segundo: tres cuentas se llaman «Caja», con movimientos distintos las
 * tres. Si la empresa no se dijera, serían tres preguntas escritas igual con
 * tres respuestas distintas — y el profesor vería lo mismo en su panel.
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

const ElSaldoDeLaCuenta = (await import("../../components/mecanicas/libros/ElSaldoDeLaCuenta.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  CUENTAS, POR_PARTIDA, evaluar, puntuar, decisionesDe, pesoDeCadaDecision,
  modoDeLaCifra, operacionSinResultado, MODO_A, MODO_B, MODO_C, MODO_D, cuentaDeItemDocente,
} = await import("../saldoDeLaCuenta.js");
const { ITEMS, ITEMS_RETIRADOS, ERROR_A, ERROR_C, ERROR_D } = await import("../../data/contabilidadSaldo.js");
const { DEBE, HABER, pesos, saldoDe } = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

/*
 * El teal, en las dos formas en que puede acabar escrito: el hex tal como lo
 * pone el componente, y el rgb al que JSDOM lo convierte al leerlo de vuelta.
 */
const TEAL = /#2A9D8F|rgba?\(\s*42,\s*157,\s*143/i;
/* El ámbar, que es el tono del haber: el lado correcto se destapa en SU color, no siempre en teal. */
const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;

/*
 * La tabla de la ficha, copiada a mano: nueve cuentas con sus movimientos y su
 * saldo. El código NO la lee — mayoriza los asientos del caso— así que esto
 * compara dos fuentes distintas. Si alguien tocara una transacción del
 * capítulo, esta prueba lo diría antes que nadie.
 */
const TABLA_DE_LA_FICHA = [
  ["capitulo", "Caja", [1000, 500], [150], 1350, DEBE],
  ["caleja", "Caja", [300000], [10000, 50000], 240000, DEBE],
  ["caleja", "Aportes sociales", [50000], [300000, 100000], 350000, HABER],
  ["caleja", "Cuentas por pagar", [10000], [25000], 15000, HABER],
  ["lavado", "Bancos", [5000, 800], [2000, 800, 500, 250, 400], 1850, DEBE],
  ["lavado", "Caja", [1000], [800], 200, DEBE],
  ["lavado", "Cuentas por pagar", [250], [2000, 2000], 3750, HABER],
  ["lavado", "Hipoteca por pagar", [400], [8000], 7600, HABER],
  ["lavado", "Acciones", [], [5000, 1000], 6000, HABER],
];

function montarVista() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(ElSaldoDeLaCuenta, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const campo = (caja) => caja.querySelector("input");
const escribir = (caja, texto) => act(() => {
  const i = campo(caja);
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  setter.call(i, texto);
  i.dispatchEvent(new w.Event("input", { bubbles: true }));
});
const botonLado = (caja, lado) => [...caja.querySelectorAll("button")]
  .find((b) => b.textContent.trim() === (lado === DEBE ? "Debe" : "Haber"));
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));
const cuentaEnPantalla = (caja) => {
  const nombre = caja.querySelector("[data-cuenta-valor]").getAttribute("data-cuenta-valor");
  const empresa = caja.querySelector("[data-sub]")?.getAttribute("data-sub");
  return CUENTAS.find((c) => c.cuenta === nombre && c.empresa === empresa);
};
/** ¿Hay alguna ficha mordida? Eso es la cancelación corriendo. */
const cancelando = (caja) => [...caja.querySelectorAll("[data-consumido]")]
  .some((f) => parseFloat(f.getAttribute("data-consumido")) > 0);
/*
 * ═══════════ LA CUENTA DE UN SOLO LADO NO SIRVE PARA PROBAR ERRORES ═══════════
 *
 * En Acciones no hay débitos, así que sumar los dos movimientos da el saldo
 * exacto y restar «mayor menos menor» escribe el resultado en la propia
 * operación. Las pruebas que necesitan un ERROR tienen que caer en una cuenta
 * con los dos lados ocupados, y el sorteo no lo garantiza: se avanza hasta
 * encontrarla. Sin esto, dos pruebas pasaban o fallaban según la baraja.
 */
const avanzarHastaDosLados = (caja) => {
  for (let k = 0; k < POR_PARTIDA; k += 1) {
    const c = cuentaEnPantalla(caja);
    if (!c.sinCancelar) return c;
    responder(caja, c.saldo, c.lado);
    tocar(boton(caja, "Siguiente cuenta|Ver el resultado"));
  }
  throw new Error("la tanda entera salió con cuentas de un solo lado");
};

const responder = (caja, cifra, lado) => {
  escribir(caja, String(cifra));
  tocar(botonLado(caja, lado));
  tocar(boton(caja, "^Responder"));
};

/* ═══════════════════ LAS NUEVE CUENTAS SALEN DEL MAYOR ═══════════════════ */

test("★★ los nueve saldos derivados coinciden con la tabla de la ficha", () => {
  assert.equal(CUENTAS.length, TABLA_DE_LA_FICHA.length);
  for (const [caso, nombre, debitos, creditos, saldo, lado] of TABLA_DE_LA_FICHA) {
    const c = CUENTAS.find((x) => x.caso === caso && x.cuenta === nombre);
    assert.ok(c, `falta ${caso}/${nombre}`);
    assert.deepEqual(c.debitos.map((d) => d.valor), debitos, `${caso}/${nombre}: los débitos`);
    assert.deepEqual(c.creditos.map((d) => d.valor), creditos, `${caso}/${nombre}: los créditos`);
    assert.equal(c.saldo, saldo, `${caso}/${nombre}: el saldo`);
    assert.equal(c.lado, lado, `${caso}/${nombre}: el lado`);
  }
});

test("★★ el saldo es la resta, y el lado el del movimiento mayor", () => {
  for (const c of CUENTAS) {
    assert.equal(c.saldo, Math.abs(c.debito - c.credito), `${c.id}: el saldo no es la resta`);
    assert.equal(c.lado, c.debito > c.credito ? DEBE : HABER, `${c.id}: el saldo no quedó del lado mayor`);
    /*
     * Con los dos lados ocupados, sumar y restar NO pueden dar lo mismo. Con
     * un lado vacío sí dan lo mismo, y ahí sumar es acertar: se comprueba
     * aparte, en su propia prueba.
     */
    if (!c.sinCancelar) {
      assert.notEqual(c.saldo, c.debito + c.credito, `${c.id}: la resta y la suma dan lo mismo`);
    }
  }
});

test("★ tres cuentas se llaman «Caja», y las tres tienen saldos distintos", () => {
  const cajas = CUENTAS.filter((c) => c.cuenta === "Caja");
  assert.equal(cajas.length, 3);
  assert.equal(new Set(cajas.map((c) => c.empresa)).size, 3, "no se distinguen por empresa");
  assert.equal(new Set(cajas.map((c) => c.saldo)).size, 3, "si coincidieran, la empresa no haría falta");
});

test("★ la única cuenta con un lado vacío es la que no tiene nada que cancelar", () => {
  for (const c of CUENTAS) {
    assert.equal(c.sinCancelar, c.debitos.length === 0 || c.creditos.length === 0, `${c.id}`);
    if (c.sinCancelar) assert.equal(c.saldo, Math.max(c.debito, c.credito), `${c.id}: el saldo no es el movimiento entero`);
  }
});

test("★ los ids se conservan y los dos que salieron del banco se siguen leyendo", () => {
  assert.deepEqual(
    ITEMS.map((i) => i.id).sort(),
    ["cu5-01", "cu5-02", "cu5-03", "cu5-04", "cu5-06", "cu5-07", "cu5-08", "cu5-10", "cu5-11"],
  );
  for (const id of Object.keys(ITEMS_RETIRADOS)) {
    assert.ok(!ITEMS.some((i) => i.id === id), `${id} sigue en el banco`);
    assert.ok(cuentaDeItemDocente(`${id}:saldo`), `${id} dejó de traducirse`);
  }
});

/* ═══════════════════ LOS CUATRO MODOS DE FALLAR ═══════════════════ */

test("★★ sumar en vez de restar es el modo A, y en ninguna cuenta se confunde con acertar", () => {
  for (const c of CUENTAS.filter((x) => !x.sinCancelar)) {
    assert.equal(modoDeLaCifra(c, c.debito + c.credito), MODO_A, `${c.id}`);
  }
  for (const c of CUENTAS) {
    assert.equal(modoDeLaCifra(c, c.saldo), null, `${c.id}: el acierto se tomó por error`);
  }
});

/*
 * ESTA PRUEBA SALIÓ DE UN FALLO DE OTRA PRUEBA, no de leer la ficha. Al exigir
 * que sumar fuera siempre el modo A, saltó Acciones: un lado vacío, y sumar da
 * el saldo exacto. No es un error del estudiante, es la respuesta.
 */
test("★★ en la cuenta de un solo lado, sumar los dos movimientos ES acertar", () => {
  const sin = CUENTAS.find((c) => c.sinCancelar);
  assert.equal(sin.debito + sin.credito, sin.saldo, "el caso ya no se da y esta prueba sobra");
  const r = evaluar(sin, sin.debito + sin.credito, sin.lado, 0);
  assert.equal(r.cifraOk, true, "le dijo que sumar está mal a quien puso la cifra correcta");
  assert.equal(r.modoCifra, null);
  assert.ok(r.textoCifra.startsWith("✅"));
});

test("★ una cifra negativa es el modo C; cualquier otra, el D", () => {
  const c = CUENTAS.find((x) => !x.sinCancelar);
  assert.equal(modoDeLaCifra(c, -c.saldo), MODO_C);
  assert.equal(modoDeLaCifra(c, c.saldo + 1), MODO_D);
});

test("★★ en un PRIMER error la cancelación no corre, en ninguno de los cuatro modos", () => {
  /* La de un solo lado se salta el modo A: ahí sumar es acertar. */
  for (const c of CUENTAS.filter((x) => !x.sinCancelar)) {
    const otro = c.lado === DEBE ? HABER : DEBE;
    const casos = [
      ["A", c.debito + c.credito, c.lado],
      ["B", c.saldo, otro],
      ["C", -c.saldo, c.lado],
      ["D", c.saldo + 7, c.lado],
    ];
    for (const [nombre, cifra, lado] of casos) {
      const r = evaluar(c, cifra, lado, 0);
      assert.equal(r.todoBien, false, `${c.id}/${nombre} no es un error`);
      assert.equal(r.cancelar, false, `${c.id}: el modo ${nombre} canceló en el primer intento`);
    }
  }
});

test("★★ acertar del todo SÍ cancela, y el reintento también", () => {
  for (const c of CUENTAS) {
    assert.equal(evaluar(c, c.saldo, c.lado, 0).cancelar, true, `${c.id}: acertar no canceló`);
    assert.equal(evaluar(c, c.saldo + 1, c.lado, 1).cancelar, true, `${c.id}: el reintento no canceló`);
  }
});

test("★ solo el modo A se ve en cámara lenta", () => {
  const c = CUENTAS.find((x) => !x.sinCancelar);
  assert.equal(evaluar(c, c.debito + c.credito, c.lado, 1).camaraLenta, true);
  assert.equal(evaluar(c, -c.saldo, c.lado, 1).camaraLenta, false);
  assert.equal(evaluar(c, c.saldo + 7, c.lado, 1).camaraLenta, false);
  assert.equal(evaluar(c, c.saldo, c.lado, 0).camaraLenta, false);
});

test("★ cada modo enseña lo suyo: totales, signo tachado, o la resta sin resultado", () => {
  const c = CUENTAS.find((x) => !x.sinCancelar);
  const otro = c.lado === DEBE ? HABER : DEBE;
  const a = evaluar(c, c.debito + c.credito, c.lado, 0);
  assert.equal(a.resaltarTotales, true);
  assert.equal(a.quitarSigno, false);
  assert.equal(a.operacion, null);

  const b = evaluar(c, c.saldo, otro, 0);
  assert.equal(b.resaltarTotales, true, "el modo B no resaltó los totales");
  assert.equal(b.modoLado, MODO_B);

  const cc = evaluar(c, -c.saldo, c.lado, 0);
  assert.equal(cc.quitarSigno, true);
  assert.equal(cc.resaltarTotales, false, "el modo C no resalta totales: lo que señala es el signo");

  const d = evaluar(c, c.saldo + 7, c.lado, 0);
  assert.equal(d.operacion, operacionSinResultado(c));
  assert.ok(!d.operacion.includes(String(c.saldo)), "la operación trae el resultado escrito");
  assert.ok(d.operacion.endsWith("?"), "la operación no deja la incógnita");
});

test("★★ la operación del modo D es mayor menos menor, nunca al revés", () => {
  for (const c of CUENTAS) {
    const op = operacionSinResultado(c);
    const mayor = Math.max(c.debito, c.credito);
    const menor = Math.min(c.debito, c.credito);
    assert.ok(op.startsWith(pesos(mayor)), `${c.id}: no empieza por el mayor`);
    assert.ok(op.includes(pesos(menor)), `${c.id}: no menciona el menor`);
    assert.ok(!op.includes(pesos(c.saldo)) || c.sinCancelar, `${c.id}: se coló el resultado`);
  }
});

test("★ los cuatro textos son distintos y todos marcan el error", () => {
  const textos = new Set();
  const c = CUENTAS.find((x) => !x.sinCancelar);
  const otro = c.lado === DEBE ? HABER : DEBE;
  for (const [cifra, lado] of [[c.debito + c.credito, c.lado], [-c.saldo, c.lado], [c.saldo + 7, c.lado]]) {
    const r = evaluar(c, cifra, lado, 0);
    assert.ok(r.textoCifra.startsWith("❌"));
    textos.add(r.textoCifra);
  }
  textos.add(evaluar(c, c.saldo, otro, 0).textoLado);
  assert.equal(textos.size, 4, "dos modos comparten explicación");
  for (const t of [ERROR_A, ERROR_C, ERROR_D]) assert.ok(t.startsWith("❌"));
});

test("★★ el acierto de la cifra es la resta de Levi, para todos los ítems, y el orden sigue al lado del saldo", () => {
  for (const c of CUENTAS) {
    const texto = evaluar(c, c.saldo, c.lado, 0).textoCifra;
    const esperado = c.lado === DEBE
      ? `✅ ${pesos(c.saldo)}. Suma del debe ${pesos(c.debito)} menos suma del haber ${pesos(c.credito)}.`
      : `✅ ${pesos(c.saldo)}. Suma del haber ${pesos(c.credito)} menos suma del debe ${pesos(c.debito)}.`;
    assert.equal(texto, esperado, c.id);
  }
  /* El banco tiene saldos de los dos lados: si no, la prueba no mira las dos frases. */
  assert.ok(CUENTAS.some((c) => c.lado === DEBE) && CUENTAS.some((c) => c.lado === HABER));
});

test("★★ el acierto del lado: «[Debe/Haber]. El saldo va del lado que sumó más.»", () => {
  for (const c of CUENTAS) {
    const texto = evaluar(c, c.saldo, c.lado, 0).textoLado;
    assert.equal(texto, `✅ ${c.lado === DEBE ? "Debe" : "Haber"}. El saldo va del lado que sumó más.`, c.id);
  }
});

/* ═══════════════════ PUNTAJE Y PANEL ═══════════════════ */

test("doce decisiones por partida, cada una pesa igual, reintento a la mitad", () => {
  assert.equal(POR_PARTIDA, 6);
  assert.equal(decisionesDe(POR_PARTIDA), 12);
  assert.equal(pesoDeCadaDecision(POR_PARTIDA).toFixed(2), (100 / 12).toFixed(2));
  const doce = Array.from({ length: 12 }, (_, k) => ({ id: k }));
  assert.equal(puntuar(doce.map((x) => ({ ...x, primeroOk: true })), 6), 100);
  assert.equal(puntuar(doce.map((x) => ({ ...x, primeroOk: false, segundoOk: true })), 6), 50);
  assert.equal(puntuar(doce.map((x) => ({ ...x, primeroOk: false, segundoOk: false })), 6), 0);
});

test("★ el panel distingue las dos preguntas y dice de qué empresa es la cuenta", () => {
  const vistas = new Set();
  for (const c of CUENTAS) {
    for (const que of ["saldo", "lado"]) {
      const e = etiquetaDeItem("cu-saldo-de-la-cuenta", `${c.id}:${que}`);
      assert.ok(e, `${c.id}:${que} sin etiqueta`);
      assert.ok(e.includes(c.cuenta), `${c.id}:${que} no dice la cuenta`);
      assert.ok(e.includes(c.empresa), `${c.id}:${que} no dice la empresa`);
      vistas.add(e);
    }
  }
  assert.equal(vistas.size, CUENTAS.length * 2, "dos ítems comparten etiqueta");
  assert.equal(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-10"), null, "un id sin pregunta no debería tener etiqueta");
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★ un primer error NO cancela las columnas, y el reintento sí", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  assert.ok(c, "no se pudo leer la cuenta en pantalla");
  assert.equal(cancelando(caja), false, "las columnas ya estaban canceladas");

  responder(caja, c.debito + c.credito, c.lado);
  assert.equal(cancelando(caja), false, "el primer error canceló y regaló el saldo");
  assert.ok(boton(caja, "Responder otra vez"), "no hay reintento");

  responder(caja, c.saldo, c.lado);
  assert.equal(cancelando(caja), true, "el reintento no canceló");
  desmontar();
});

test("★★ acertar las dos a la primera cancela sin pasar por el reintento", () => {
  const { caja, desmontar } = montarVista();
  /* En la de un solo lado no hay nada que cancelar: no sirve para esta prueba. */
  const c = avanzarHastaDosLados(caja);
  responder(caja, c.saldo, c.lado);
  assert.equal(cancelando(caja), true, "acertar no canceló");
  assert.equal(Boolean(boton(caja, "Responder otra vez")), false, "pidió reintento tras acertar");
  desmontar();
});

test("★★ el lado correcto no se destapa mientras quede reintento", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  const otro = c.lado === DEBE ? HABER : DEBE;

  /*
   * OJO: la primera versión buscaba el hex del teal dentro de `style.border`.
   * JSDOM lo normaliza a `rgb(42, 157, 143)`, así que la cadena NUNCA
   * aparecía y la prueba pasaba dijera lo que dijera la pantalla — un mutante
   * que destapaba el lado correcto durante el reintento sobrevivió a ella.
   * Ahora se mira el fondo, y en las dos formas en que puede estar escrito.
   *
   * Y el tono es el del PROPIO lado: teal para el debe, ámbar para el haber.
   * Antes la prueba daba por hecho que «destapado» era siempre teal, y como la
   * cuenta sale del sorteo, pasaba o fallaba según cayera un saldo del debe o
   * del haber. El veredicto, además, ya no depende solo del color: lleva su
   * marca (✓ / ✗), y esa se mira también.
   */
  const tonoDe = (lado) => (lado === DEBE ? TEAL : AMBAR);
  const encendido = (b, lado) => tonoDe(lado).test(b.style.background);
  const conMarca = (b) => b.querySelector("svg[data-veredicto]") !== null;

  responder(caja, c.saldo, otro);
  assert.equal(encendido(botonLado(caja, c.lado), c.lado), false,
    "el lado correcto se encendió durante el reintento");
  assert.equal(encendido(botonLado(caja, otro), otro), false);
  assert.equal(conMarca(botonLado(caja, c.lado)) || conMarca(botonLado(caja, otro)), false,
    "salió una marca de veredicto con reintento pendiente");

  /* Y agotado el reintento sí se destapa: si no, la prueba de arriba sobra. */
  responder(caja, c.saldo, otro);
  assert.equal(encendido(botonLado(caja, c.lado), c.lado), true,
    "el lado correcto no se destapó ni después del reintento");
  assert.equal(
    botonLado(caja, c.lado).querySelector("svg[data-veredicto]")?.getAttribute("data-veredicto"),
    "bien",
    "el lado correcto se destapó sin su ✓",
  );
  desmontar();
});

test("★ el modo C deja la cifra en valor absoluto y lo dice", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  responder(caja, -c.saldo, c.lado);
  assert.equal(campo(caja).value, String(c.saldo), "no quitó el signo del campo");
  assert.ok(caja.querySelector("[data-signo-quitado]"), "no avisó de que quitó el signo");
  desmontar();
});

test("★ el modo D escribe la resta sin el resultado, debajo de la cuenta", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  responder(caja, c.saldo + 7, c.lado);
  const op = caja.querySelector("[data-operacion]");
  assert.ok(op, "no escribió la operación");
  assert.equal(op.textContent, operacionSinResultado(c));
  assert.ok(!op.textContent.includes(pesos(c.saldo)), "escribió el resultado");
  desmontar();
});

test("★ los dos totales salen con chip neutro, no en coral", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  responder(caja, c.debito + c.credito, c.lado);
  const chips = [...caja.querySelectorAll("[data-total-resaltado]")];
  assert.equal(chips.length, 2, "no salieron los dos totales");
  for (const chip of chips) {
    assert.match(chip.style.background, /#B8C4D4|rgb\(184,\s*196,\s*212\)/i, `el chip no es neutro: ${chip.style.background}`);
  }
  assert.deepEqual(chips.map((x) => x.textContent), [pesos(c.debito), pesos(c.credito)]);
  desmontar();
});

test("★ la empresa se dice debajo del nombre de la cuenta", () => {
  const { caja, desmontar } = montarVista();
  const c = cuentaEnPantalla(caja);
  const sub = caja.querySelector("[data-sub]");
  assert.ok(sub, "no hay renglón de empresa");
  assert.equal(sub.textContent, c.empresa);
  desmontar();
});

test("★ se juegan seis de las nueve y ninguna se repite", () => {
  const { caja, desmontar } = montarVista();
  const vistas = [];
  for (let k = 0; k < POR_PARTIDA; k += 1) {
    const c = cuentaEnPantalla(caja);
    assert.ok(c, `no se pudo leer la cuenta ${k + 1}`);
    vistas.push(c.id);
    responder(caja, c.saldo, c.lado);
    tocar(boton(caja, k + 1 === POR_PARTIDA ? "Ver el resultado" : "Siguiente cuenta"));
  }
  assert.equal(new Set(vistas).size, POR_PARTIDA, "una cuenta salió dos veces");
  desmontar();
});

test("★ el saldo que enseña la actividad es el mismo que calcula el capítulo", () => {
  for (const c of CUENTAS) {
    const s = saldoDe(c.cuentaT);
    assert.equal(c.saldo, s.saldo, `${c.id}`);
    assert.equal(c.lado, s.lado, `${c.id}`);
  }
});

test("★★ los dos totales resaltados se llaman «Suma del debe» y «Suma del haber»", () => {
  const { caja, desmontar } = montarVista();
  const c = avanzarHastaDosLados(caja);
  responder(caja, c.saldo + 1, c.lado);
  const totales = caja.querySelector("[data-totales]");
  assert.ok(totales, "el modo D no enseñó los totales");
  assert.ok(totales.textContent.includes("Suma del debe"));
  assert.ok(totales.textContent.includes("Suma del haber"));
  assert.doesNotMatch(totales.textContent, /d[ée]bito|cr[ée]dito/iu);
  desmontar();
});
