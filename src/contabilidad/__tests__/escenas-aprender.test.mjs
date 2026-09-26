import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO PIEZAS DE APRENDER, DIBUJADAS.
 *
 * Lo que aquí se vigila no es la aritmética —esa ya tiene cancelacion.test y
 * balanza.test— sino LA UNIÓN entre el contenido y el dibujo: cada paso del
 * texto declara un `resaltar` y cada escena decide qué encender con él. Un
 * `resaltar` mal escrito no rompe nada: la escena simplemente no cambia, y el
 * estudiante pasa un paso que dice «ahora mire caer la ficha» delante de una
 * pantalla idéntica a la anterior. Eso no lo ve una prueba de aritmética.
 *
 * Y lo otro: que ninguna de las cuatro piezas contradiga al capítulo. El
 * diario que no se vacía, las seis familias en su cajón, la ecuación que solo
 * se inclina cuando debe.
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

const { ESCENAS, FAMILIAS_DEL_CAJON } = await import("../../components/mecanicas/libros/escenas.jsx");
const { PIEZAS_APRENDER } = await import("../../data/contabilidadAprender.js");
const {
  DEBE, HABER, NOMBRE_TIPO, REALES, TRANSITORIAS, tipoDeCuenta, pesos, LAVADO_DE_AUTOS,
} = await import("../../data/contabilidad.js");
const { CAJA_DEL_CAPITULO } = await import("../../data/contabilidadActividades.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/** Monta una escena en un paso y devuelve lo que se ve, ya desmontado. */
function enElPaso(Escena, resaltar, leer) {
  const { caja, desmontar } = montar(React.createElement(Escena, { resaltar }));
  try { return leer(caja); } finally { desmontar(); }
}

const pieza = (id) => PIEZAS_APRENDER.find((p) => p.id === id);
const pasosDe = (id) => pieza(id).pasos.map((p) => p.resaltar);
const texto = (caja) => caja.textContent.replace(/\s+/g, " ").trim();
const consumidoDe = (el) => Number.parseFloat(el.getAttribute("data-consumido"));

/* ═══════════════ EL ENGANCHE CONTENIDO ↔ DIBUJO ═══════════════ */

test("cada pieza del contenido tiene lo que dibuja, sin sobrantes", () => {
  const declaradas = PIEZAS_APRENDER.map((p) => p.id).sort();
  assert.deepEqual(Object.keys(ESCENAS).sort(), declaradas);
  for (const id of declaradas) {
    const e = ESCENAS[id];
    assert.equal(typeof e.Exploracion, "function", `${id} sin exploración`);
    /* O la escena del paso a paso compartido, o una capa 2 propia. Nunca las dos. */
    const conEscena = typeof e.Escena === "function";
    const conCapa2 = typeof e.Capa2 === "function";
    assert.ok(conEscena || conCapa2, `${id} no dibuja su capa 2`);
    assert.ok(!(conEscena && conCapa2), `${id} trae escena Y capa 2 propia`);
  }
});

test("★ ningún paso de la capa 2 se dibuja igual que otro paso de la misma pieza", () => {
  /*
   * ESTA es la prueba que justifica el archivo. El texto del paso 3 promete
   * algo distinto del paso 2; si el `resaltar` no coincide con lo que la
   * escena entiende, la pantalla se queda quieta y el paso miente. Como
   * ningún `resaltar` es opcional, dos pasos idénticos SIEMPRE son un error.
   */
  for (const p of PIEZAS_APRENDER.filter((x) => Array.isArray(x.pasos))) {
    const { Escena } = ESCENAS[p.id];
    const vistos = new Map();
    for (const paso of p.pasos) {
      const dibujo = enElPaso(Escena, paso.resaltar, (c) => c.innerHTML);
      const gemelo = [...vistos].find(([, html]) => html === dibujo);
      assert.ok(
        !gemelo,
        `${p.id}: el paso «${paso.resaltar}» se dibuja idéntico a «${gemelo?.[0]}»`,
      );
      vistos.set(paso.resaltar, dibujo);
    }
    assert.equal(vistos.size, p.pasos.length);
  }
});

test("ninguna pieza de Aprender pinta coral: aquí nadie se equivoca todavía", () => {
  for (const p of PIEZAS_APRENDER.filter((x) => Array.isArray(x.pasos))) {
    const { Escena } = ESCENAS[p.id];
    for (const paso of p.pasos) {
      const html = enElPaso(Escena, paso.resaltar, (c) => c.innerHTML);
      assert.ok(!CORAL.test(html), `${p.id} / ${paso.resaltar} pinta coral`);
    }
  }
});

/* ═══════════════ 1 · ANATOMÍA DE UNA CUENTA ═══════════════ */

test("★ la cuenta se CONSTRUYE: primero vacía, después un lado, después el otro", () => {
  const { Escena } = ESCENAS["cu-a1-anatomia-de-una-cuenta"];
  const fichasEn = (resaltar, lado) => enElPaso(Escena, resaltar, (c) =>
    [...c.querySelector(`[data-columna="${lado}"]`).querySelectorAll("[data-ficha]")].length);

  assert.equal(fichasEn("encabezado", DEBE), 0, "el encabezado ya traía fichas");
  assert.equal(fichasEn("encabezado", HABER), 0);
  assert.equal(fichasEn("debe", DEBE), 1, "el paso del debe no soltó nada");
  assert.equal(fichasEn("debe", HABER), 0, "el haber se adelantó a su paso");
  assert.equal(fichasEn("haber", HABER), 1, "el paso del haber no soltó nada");
});

test("★ el saldo de la pieza 1 usa las cifras REALES del capítulo, y las come por valor", () => {
  /*
   * Dos cosas a la vez, porque son la misma: la escena no inventa cifras
   * —las toma de la Caja del capítulo— y la cancelación se mide en pesos, no
   * en fichas. Con 1000 y 500 al debe contra 150 al haber, un reparto por
   * PARES dejaría una ficha entera tachada; el reparto por valor solo se
   * come 150 pesos, repartidos desde la primera ficha.
   */
  const { Escena } = ESCENAS["cu-a1-anatomia-de-una-cuenta"];
  const aHaber = CAJA_DEL_CAPITULO.creditos.reduce((s, f) => s + f.valor, 0);
  const alDebe = CAJA_DEL_CAPITULO.debitos.reduce((s, f) => s + f.valor, 0);

  const debe = enElPaso(Escena, "saldo", (c) =>
    [...c.querySelector(`[data-columna="${DEBE}"]`).querySelectorAll("[data-ficha]")]
      .map((f) => ({ valor: Number(f.getAttribute("data-ficha")), comido: consumidoDe(f) })));

  assert.deepEqual(debe.map((f) => f.valor), CAJA_DEL_CAPITULO.debitos.map((f) => f.valor));

  const pesosComidos = debe.reduce((s, f) => s + f.comido * f.valor, 0);
  assert.equal(pesosComidos, aHaber, "lo tachado no vale lo que el otro lado puso");
  assert.ok(debe.every((f) => f.comido < 1), "una ficha entera quedó tachada: eso es contar pares");

  /* Y el movimiento débito que se anuncia es la suma de lo que hay, no un número escrito a mano. */
  const total = enElPaso(Escena, "saldo", (c) =>
    c.querySelector(`[data-total="${DEBE}"]`).textContent);
  assert.equal(total, pesos(alDebe));
});

/* ═══════════════ 2 · LAS DOS FAMILIAS ═══════════════ */

const cuentasDelCajon = (caja, titulo) =>
  [...caja.querySelector(`[data-cajon="${titulo}"]`).querySelectorAll("p")]
    .map((p) => p.textContent)
    .filter((t) => tipoDeCuenta(t) != null);

test("★ cada cuenta del cajón es de la familia del cajón, según el catálogo", () => {
  /*
   * El cajón podría rotular «Reales» sobre un ingreso y nadie lo notaría
   * leyendo el archivo: los nombres se ven plausibles. Quien manda es
   * tipoDeCuenta.
   */
  const { Escena } = ESCENAS["cu-a2-dos-familias"];
  const { caja, desmontar } = montar(React.createElement(Escena, { resaltar: "reales" }));
  try {
    for (const [clave, tipos] of Object.entries(FAMILIAS_DEL_CAJON)) {
      const titulo = clave === "reales" ? "Reales" : "Transitorias";
      const cuentas = cuentasDelCajon(caja, titulo);
      assert.ok(cuentas.length > 0, `el cajón ${titulo} quedó sin cuentas`);
      for (const nombre of cuentas) {
        assert.ok(tipos.includes(tipoDeCuenta(nombre)),
          `«${nombre}» es ${tipoDeCuenta(nombre)} y está en el cajón ${titulo}`);
      }
    }
    /* Y entre los dos cajones están las seis familias: ninguna se queda sin ejemplo. */
    const todas = [...cuentasDelCajon(caja, "Reales"), ...cuentasDelCajon(caja, "Transitorias")];
    assert.deepEqual(
      [...new Set(todas.map(tipoDeCuenta))].sort(),
      [...REALES, ...TRANSITORIAS].sort(),
    );
  } finally { desmontar(); }
});

test("★ el 31 de diciembre vacía las transitorias y NO toca las reales", () => {
  const { Escena } = ESCENAS["cu-a2-dos-familias"];
  const { caja, desmontar } = montar(React.createElement(Escena, { resaltar: "reales" }));
  try {
    const antesReales = cuentasDelCajon(caja, "Reales");
    const antesTrans = cuentasDelCajon(caja, "Transitorias");
    assert.ok(antesTrans.length > 0);

    const { caja: despues, desmontar: d2 } = montar(React.createElement(Escena, { resaltar: "cierre" }));
    try {
      assert.deepEqual(cuentasDelCajon(despues, "Reales"), antesReales,
        "el cierre se llevó cuentas reales por delante");
      assert.deepEqual(cuentasDelCajon(despues, "Transitorias"), [],
        "las transitorias sobrevivieron al cierre");
      assert.ok(despues.querySelector("[data-calendario]").textContent.includes("31 de diciembre"));
    } finally { d2(); }
  } finally { desmontar(); }
});

/* ═══════════════ 3 · LA PARTIDA DOBLE ═══════════════ */

const gradosDeLaBalanza = (caja) => Number(caja.querySelector("[data-balanza]").getAttribute("data-balanza"));

test("★ la balanza SOLO se inclina en el paso que habla del desequilibrio", () => {
  const { Escena } = ESCENAS["cu-a3-partida-doble"];
  const pasos = pasosDe("cu-a3-partida-doble");
  for (const resaltar of pasos) {
    const grados = enElPaso(Escena, resaltar, gradosDeLaBalanza);
    if (resaltar === "inclinada") assert.notEqual(grados, 0, "el paso del desequilibrio salió recto");
    else assert.equal(grados, 0, `el paso «${resaltar}» salió torcido`);
  }
});

test("★ las seis familias cuelgan del platillo que les toca", () => {
  /*
   * Es la regla del capítulo dicha en dos grupos. Activo, Gasto y Costo a la
   * izquierda; Pasivo, Patrimonio e Ingreso a la derecha. Si una se cambiara
   * de platillo, la escena enseñaría lo contrario de las doce actividades.
   */
  const { Escena } = ESCENAS["cu-a3-partida-doble"];
  const { caja, desmontar } = montar(React.createElement(Escena, { resaltar: "dos-grupos" }));
  try {
    const izquierda = caja.querySelector("[data-platillo=\"izquierda\"]").textContent;
    const derecha = caja.querySelector("[data-platillo=\"derecha\"]").textContent;
    for (const nombre of [NOMBRE_TIPO.activo, NOMBRE_TIPO.gasto, NOMBRE_TIPO.costo]) {
      assert.ok(izquierda.includes(nombre), `${nombre} no está a la izquierda`);
      assert.ok(!derecha.includes(nombre), `${nombre} aparece a la derecha`);
    }
    for (const nombre of [NOMBRE_TIPO.pasivo, NOMBRE_TIPO.patrimonio, NOMBRE_TIPO.ingreso]) {
      assert.ok(derecha.includes(nombre), `${nombre} no está a la derecha`);
      assert.ok(!izquierda.includes(nombre), `${nombre} aparece a la izquierda`);
    }
  } finally { desmontar(); }
});

/* ═══════════════ 4 · DEL DIARIO AL MAYOR ═══════════════ */

const renglonesDelDiario = (caja) =>
  [...caja.querySelector("[data-diario]").querySelectorAll("[data-marca]")]
    .map((m) => m.parentElement.textContent);

test("★ mayorizar NO vacía el diario: el renglón se queda y recibe su marca", () => {
  /*
   * El capítulo lo prohíbe: un asiento registrado no se borra ni se tacha. Si
   * la escena moviera el renglón al mayor, enseñaría que el dato se muda —y
   * la capa 1 de esta misma pieza dice que son los mismos datos en dos
   * ordenamientos.
   */
  const { Escena } = ESCENAS["cu-a4-diario-y-mayor"];
  const asiento = LAVADO_DE_AUTOS.transacciones[0].asiento;
  const cuantos = asiento.debe.length + asiento.haber.length;

  const antes = enElPaso(Escena, "asiento", renglonesDelDiario);
  assert.equal(antes.length, cuantos, "el diario no trae el asiento completo");

  const despues = enElPaso(Escena, "mayorizar", renglonesDelDiario);
  assert.equal(despues.length, antes.length, "mayorizar se llevó renglones del diario");
  for (let i = 0; i < antes.length; i += 1) {
    const sinMarca = (s) => s.replace(/[✓·]/g, "");
    assert.equal(sinMarca(despues[i]), sinMarca(antes[i]), "el renglón cambió al mayorizarse");
  }

  const marcas = enElPaso(Escena, "mayorizar", (c) =>
    [...c.querySelector("[data-diario]").querySelectorAll("[data-marca]")]
      .map((m) => m.getAttribute("data-marca")));
  assert.deepEqual(marcas, Array(cuantos).fill("si"), "los renglones no quedaron marcados");
});

test("★ la cuenta del mayor recibe las cifras del asiento, no otras", () => {
  const { Escena } = ESCENAS["cu-a4-diario-y-mayor"];
  const asiento = LAVADO_DE_AUTOS.transacciones[0].asiento;
  const [cuenta, valor] = asiento.debe[0];

  const { caja, desmontar } = montar(React.createElement(Escena, { resaltar: "dos-vistas" }));
  try {
    const t = caja.querySelector("[data-cuenta-valor]");
    assert.ok(t, "no apareció la cuenta del mayor");
    assert.equal(t.getAttribute("data-cuenta-valor"), cuenta);
    const fichas = [...t.querySelectorAll("[data-ficha]")].map((f) => Number(f.getAttribute("data-ficha")));
    assert.deepEqual(fichas, [valor]);
  } finally { desmontar(); }
});

/* ═══════════════ LAS EXPLORACIONES (CAPA 3) ═══════════════ */

const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

test("★ en la exploración se puede soltar una ficha TOCANDO, sin arrastrar", () => {
  /*
   * El arrastre es el gesto bonito; el toque es el que tiene que existir. Ya
   * se rompió una vez en silencio —la columna se encendía y no recibía nada—
   * y solo se vio jugándolo.
   */
  const { Exploracion } = ESCENAS["cu-a1-anatomia-de-una-cuenta"];
  const { caja, desmontar } = montar(React.createElement(Exploracion));
  try {
    const fichas = [...caja.querySelectorAll("[data-ficha]")];
    assert.ok(fichas.length >= 3, "la paleta no trae fichas");
    const valor = Number(fichas[0].getAttribute("data-ficha"));

    tocar(fichas[0]);
    assert.equal(fichas[0].getAttribute("aria-pressed"), "true", "tocar la ficha no la toma");

    tocar(caja.querySelector(`[data-destino="${DEBE}"]`));
    const enColumna = [...caja.querySelector(`[data-columna="${DEBE}"]`).querySelectorAll("[data-ficha]")];
    assert.equal(enColumna.length, 1, "la ficha no cayó en la columna");
    assert.equal(Number(enColumna[0].getAttribute("data-ficha")), valor);
  } finally { desmontar(); }
});

test("★ la exploración cancela por valor: la ficha grande queda mordida, no tachada", () => {
  const { Exploracion } = ESCENAS["cu-a1-anatomia-de-una-cuenta"];
  const { caja, desmontar } = montar(React.createElement(Exploracion));
  try {
    const paleta = () => [...caja.querySelectorAll("div > [data-ficha]")]
      .filter((f) => f.tagName === "BUTTON" && f.getAttribute("aria-pressed") != null);
    const tomarYSoltar = (valor, lado) => {
      const ficha = paleta().find((f) => Number(f.getAttribute("data-ficha")) === valor);
      assert.ok(ficha, `la paleta no tiene ${valor}`);
      tocar(ficha);
      tocar(caja.querySelector(`[data-destino="${lado}"]`));
    };
    const valores = paleta().map((f) => Number(f.getAttribute("data-ficha"))).sort((a, b) => a - b);
    const [chico, , grande] = valores;

    tomarYSoltar(grande, DEBE);
    tomarYSoltar(chico, HABER);

    const enDebe = [...caja.querySelector(`[data-columna="${DEBE}"]`).querySelectorAll("[data-ficha]")][0];
    const comido = consumidoDe(enDebe);
    assert.ok(comido > 0, "la ficha grande no se mordió");
    assert.ok(comido < 1, "la ficha grande quedó tachada entera");
    assert.equal(Math.round(comido * grande), chico, "lo mordido no vale lo que puso el otro lado");
  } finally { desmontar(); }
});

test("★ el diario de la exploración sigue entero al llegar al último paso", () => {
  const { Exploracion } = ESCENAS["cu-a4-diario-y-mayor"];
  const { caja, desmontar } = montar(React.createElement(Exploracion));
  try {
    const adelante = () => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes("Adelante"));
    assert.equal(renglonesDelDiario(caja).length, 0, "el diario no empieza en blanco");
    tocar(adelante());
    const conAsiento = renglonesDelDiario(caja).length;
    assert.ok(conAsiento > 0, "el asiento no llegó al diario");
    tocar(adelante());
    tocar(adelante());
    assert.equal(renglonesDelDiario(caja).length, conAsiento, "el diario perdió renglones por el camino");
    assert.ok(adelante().disabled, "el último paso sigue ofreciendo Adelante");
  } finally { desmontar(); }
});

test("★ cerrar el año en la exploración vacía las transitorias y se puede deshacer", () => {
  const { Exploracion } = ESCENAS["cu-a2-dos-familias"];
  const { caja, desmontar } = montar(React.createElement(Exploracion));
  try {
    const boton = () => [...caja.querySelectorAll("button")].at(-1);
    const antes = cuentasDelCajon(caja, "Transitorias").length;
    assert.ok(antes > 0);
    tocar(boton());
    assert.equal(cuentasDelCajon(caja, "Transitorias").length, 0, "cerrar el año no vació nada");
    assert.equal(cuentasDelCajon(caja, "Reales").length, 3, "cerrar el año tocó las reales");
    tocar(boton());
    assert.equal(cuentasDelCajon(caja, "Transitorias").length, antes, "el año nuevo no repuso las cuentas");
  } finally { desmontar(); }
});
