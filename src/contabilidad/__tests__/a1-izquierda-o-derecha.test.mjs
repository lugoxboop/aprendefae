import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A1 · ¿IZQUIERDA O DERECHA?
 *
 * Tres cosas de esta actividad se rompen sin que nada falle:
 *
 *   · que el sorteo deje de ser 4+4 — y entonces un estudiante con la
 *     creencia falsa intacta saque 75 % y el número le mienta;
 *   · que el ▲ se adelante — y entonces la respuesta esté en pantalla
 *     mientras se pregunta;
 *   · que un fallo escriba el registro — y entonces quede en pantalla, aunque
 *     sea un segundo, una anotación que nunca ocurrió.
 *
 * Ninguna de las tres rompe nada al ocurrir. Por eso están aquí.
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

const SoltarEnUnLado = (await import("../../components/mecanicas/libros/SoltarEnUnLado.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  sortearEstratificado, estratos, esDeActivo, ladoDelTriangulo,
  evaluarItem, mensajeDeCierre, puntuar,
} = await import("../izquierdaODerecha.js");
const { IZQUIERDA_O_DERECHA: B } = await import("../../data/contabilidadActividades.js");
const { DEBE, HABER, ACTIVO, CRECE_POR, tipoDeCuenta, REALES } = await import("../../data/contabilidad.js");
const { barajar } = await import("../../utils/barajar.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(SoltarEnUnLado, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const columna = (caja, lado) => caja.querySelector(`[data-columna="${lado}"]`);
const fichasEn = (caja, lado) => columna(caja, lado).querySelectorAll("[data-ficha]").length;
const destino = (caja, lado) => caja.querySelector(`[data-destino="${lado}"]`);
const enunciado = (caja) => caja.querySelector("[data-enunciado]").textContent;
const itemEnPantalla = (caja) => B.items.find((i) => i.enunciado === enunciado(caja));

/* ═══════════════ EL BANCO ═══════════════ */

test("★ el alcance está restringido: ni un ingreso, ni un gasto, ni un costo", () => {
  /*
   * Averkamp lleva veinticinco años viendo que el quiebre llega justo con los
   * ingresos, y Byrne & Flood (2005) que las experiencias negativas tempranas
   * aumentan la deserción. Los ingresos entran en El Cuadro de Dinámicas,
   * cuando la regla de las dos familias ya está en pie.
   */
  for (const i of B.items) {
    const tipo = tipoDeCuenta(i.cuenta);
    assert.ok(tipo, `${i.id}: «${i.cuenta}» no está en el catálogo`);
    assert.ok(REALES.includes(tipo), `${i.id}: «${i.cuenta}» es ${tipo}, y aquí solo van cuentas reales`);
  }
});

test("★ la respuesta de cada ítem SALE de la regla, no está escrita al azar", () => {
  /*
   * «Caja aumenta» va al debe porque Caja es un activo y los activos crecen
   * por el debe — no porque alguien tecleara «debe». Se comprueba contra
   * CRECE_POR, que es la regla del capítulo.
   */
  for (const i of B.items) {
    const crece = CRECE_POR[tipoDeCuenta(i.cuenta)];
    const sube = /aumenta$/.test(i.enunciado);
    const debida = sube ? crece : (crece === DEBE ? HABER : DEBE);
    assert.equal(i.categoria, debida, `${i.id} («${i.enunciado}»): debería ir al ${debida}`);
  }
});

test("★ los ids que ya jugaron estudiantes conservan su enunciado y su respuesta", () => {
  /*
   * Diez de los doce existían antes del rediseño. Si uno cambiara de
   * enunciado sin cambiar de id, el panel docente enseñaría una pregunta que
   * ese estudiante nunca vio — y nada fallaría.
   */
  const antes = {
    "cu1-01": ["Caja aumenta", DEBE], "cu1-02": ["Caja disminuye", HABER],
    "cu1-03": ["Aportes sociales aumenta", HABER], "cu1-04": ["Aportes sociales disminuye", DEBE],
    "cu1-05": ["Obligaciones financieras aumenta", HABER], "cu1-06": ["Obligaciones financieras disminuye", DEBE],
    "cu1-07": ["Equipo de computación aumenta", DEBE], "cu1-08": ["Bancos disminuye", HABER],
    "cu1-09": ["Cuentas por pagar aumenta", HABER], "cu1-10": ["Cuentas por pagar disminuye", DEBE],
  };
  for (const [id, [texto, lado]] of Object.entries(antes)) {
    const i = B.items.find((x) => x.id === id);
    assert.ok(i, `desapareció ${id}, que ya jugaron estudiantes`);
    assert.equal(i.enunciado, texto, `${id} cambió de enunciado`);
    assert.equal(i.categoria, lado, `${id} cambió de respuesta`);
  }
  /* Y los dos nuevos no pisan ningún id viejo. */
  assert.equal(new Set(B.items.map((i) => i.id)).size, B.items.length);
  for (const id of ["cu1-11", "cu1-12"]) {
    assert.ok(B.items.some((i) => i.id === id), `falta el ítem nuevo ${id}`);
    assert.ok(!(id in antes));
  }
});

test("el panel docente sabe leer los doce", () => {
  for (const i of B.items) {
    const e = etiquetaDeItem("cu-izquierda-o-derecha", i.id, 200);
    assert.ok(e, `sin etiqueta: ${i.id}`);
    assert.ok(e.includes(i.enunciado), `${i.id}: la etiqueta no dice su enunciado`);
  }
});

/* ═══════════════ EL SORTEO ═══════════════ */

test("★★ el sorteo es 4+4 SIEMPRE, y por eso el porcentaje no puede mentir", () => {
  /*
   * ESTA es la prueba que justifica el archivo. Un sorteo libre de ocho sobre
   * doce puede dar seis activos y dos pasivos; a quien lee «débito» como
   * «aumenta» eso le da un 75 % con la creencia intacta. Estratificado, saca
   * exactamente 50 % — y el número dice la verdad.
   */
  const { activo, otras } = estratos();
  assert.ok(activo.length >= 4 && otras.length >= 4, "el banco no alcanza para 4+4");

  let peorNota = -1;
  for (let k = 0; k < 300; k += 1) {
    const s = sortearEstratificado(barajar);
    assert.equal(s.length, B.porPartida);
    assert.equal(new Set(s.map((x) => x.id)).size, s.length, "salió un ítem repetido");
    assert.equal(s.filter(esDeActivo).length, 4, "el reparto dejó de ser 4+4");

    /* Y lo que de verdad importa: la nota de quien lee débito como aumenta. */
    const comoSiFueraAumenta = s.map((i) => ({
      esActivo: esDeActivo(i),
      primeroOk: evaluarItem(i, /aumenta$/.test(i.enunciado) ? DEBE : HABER).ok,
    }));
    const nota = puntuar(comoSiFueraAumenta);
    if (peorNota < 0) peorNota = nota;
    assert.equal(nota, 50, `esa creencia sacó ${nota} %, no 50`);
  }
});

test("un banco que no alcanza para 4+4 revienta en vez de sortear de menos", () => {
  const cojo = B.items.filter(esDeActivo).slice(0, 2);
  assert.throws(() => sortearEstratificado(barajar, cojo), /no alcanza/);
});

/* ═══════════════ LOS DOS PATRONES Y EL MENSAJE DE PATRÓN ═══════════════ */

test("★ el patrón lo decide la FAMILIA, no una hipótesis sobre el estudiante", () => {
  for (const i of B.items) {
    const otro = i.categoria === DEBE ? HABER : DEBE;
    const r = evaluarItem(i, otro);
    assert.ok(!r.ok);
    const esperado = esDeActivo(i) ? "A" : "B";
    assert.equal(r.patron, esperado, `${i.id}: patrón ${r.patron}`);
    assert.equal(r.texto, esDeActivo(i) ? B.errorA : B.errorB);
    /* Cada patrón nombra el lado que le toca. */
    assert.ok(r.texto.includes(esDeActivo(i) ? "izquierda" : "derecha"), `${i.id}: el texto no dice hacia dónde mirar`);
  }
});

test("★ el mensaje de patrón sale SOLO con la firma exacta", () => {
  const cuatro = (esActivo, ok) => Array.from({ length: 4 }, () => ({ esActivo, primeroOk: ok }));
  const firma = [...cuatro(true, true), ...cuatro(false, false)];
  assert.equal(mensajeDeCierre(firma), B.errorC);

  /* Un solo activo fallado ya no es esa firma. */
  const casi = [...cuatro(true, true), ...cuatro(false, false)];
  casi[0].primeroOk = false;
  assert.equal(mensajeDeCierre(casi), null);

  /* Ni un solo pasivo acertado. */
  const casi2 = [...cuatro(true, true), ...cuatro(false, false)];
  casi2[7].primeroOk = true;
  assert.equal(mensajeDeCierre(casi2), null);

  /* Ni el que lo hizo todo bien, ni el que lo hizo todo mal. */
  assert.equal(mensajeDeCierre([...cuatro(true, true), ...cuatro(false, true)]), null);
  assert.equal(mensajeDeCierre([...cuatro(true, false), ...cuatro(false, false)]), null);
  assert.equal(mensajeDeCierre([]), null);
});

test("el segundo intento vale la mitad, y no hay tercero", () => {
  const ocho = (r) => Array.from({ length: 8 }, () => r);
  assert.equal(puntuar(ocho({ primeroOk: true })), 100);
  assert.equal(puntuar(ocho({ primeroOk: false, segundoOk: true })), 50);
  assert.equal(puntuar(ocho({ primeroOk: false, segundoOk: false })), 0);
});

/* ═══════════════ LO QUE SE VE, Y CUÁNDO ═══════════════ */

test("★★ un fallo NO escribe el registro: la columna queda como estaba", () => {
  /*
   * Regla absoluta de las siete. Si la ficha cayera y luego se retirara,
   * durante un instante habría en pantalla una anotación que nunca ocurrió,
   * con su total sumado. Esta actividad enseña dónde va cada cosa.
   */
  const { caja, desmontar } = montar();
  try {
    const item = itemEnPantalla(caja);
    const malo = item.categoria === DEBE ? HABER : DEBE;
    assert.equal(fichasEn(caja, DEBE) + fichasEn(caja, HABER), 0, "la cuenta no empieza vacía");

    tocar(destino(caja, malo));

    assert.equal(fichasEn(caja, DEBE), 0, "el fallo escribió en el debe");
    assert.equal(fichasEn(caja, HABER), 0, "el fallo escribió en el haber");
    assert.ok(caja.querySelector("[data-fallo]"), "no se avisa de que el registro no ocurrió");
    /* El marcador de saldo tampoco se coloca. */
    assert.equal(caja.querySelector("[data-marcador]").getAttribute("data-marcador"), "sin-lado");
  } finally { desmontar(); }
});

test("★★ el ▲ NO está en pantalla mientras se pregunta", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelector("[data-triangulo]"), null, "el ▲ salió antes de responder");
    const item = itemEnPantalla(caja);
    tocar(destino(caja, item.categoria));
    const tri = caja.querySelector("[data-triangulo]");
    assert.ok(tri, "el ▲ no apareció al acertar");
    assert.equal(tri.getAttribute("data-triangulo"), ladoDelTriangulo(item));
  } finally { desmontar(); }
});

test("★ al fallar, el ▲ SÍ se revela: el segundo intento se hace sabiendo", () => {
  const { caja, desmontar } = montar();
  try {
    const item = itemEnPantalla(caja);
    tocar(destino(caja, item.categoria === DEBE ? HABER : DEBE));
    const tri = caja.querySelector("[data-triangulo]");
    assert.ok(tri, "falló y el ▲ sigue escondido");
    assert.equal(tri.getAttribute("data-triangulo"), ladoDelTriangulo(item));
    /* Y se sigue pudiendo responder: el destino sigue vivo. */
    assert.ok(destino(caja, DEBE), "tras fallar no se puede reintentar");
  } finally { desmontar(); }
});

test("★ un solo reintento: el segundo error cierra el ítem", () => {
  const { caja, desmontar } = montar();
  try {
    const item = itemEnPantalla(caja);
    const malo = item.categoria === DEBE ? HABER : DEBE;
    tocar(destino(caja, malo));
    tocar(destino(caja, malo));
    assert.equal(destino(caja, DEBE), null, "dejó un tercer intento");
    assert.equal(fichasEn(caja, DEBE) + fichasEn(caja, HABER), 0, "el segundo fallo escribió algo");
    const botones = [...caja.querySelectorAll("button")].map((b) => b.textContent);
    assert.ok(botones.some((x) => /Siguiente registro|Ver resultado/.test(x)), "no ofrece avanzar");
  } finally { desmontar(); }
});

test("★ acertar SÍ escribe, y del lado que corresponde", () => {
  const { caja, desmontar } = montar();
  try {
    const item = itemEnPantalla(caja);
    tocar(destino(caja, item.categoria));
    const otro = item.categoria === DEBE ? HABER : DEBE;
    assert.equal(fichasEn(caja, item.categoria), 1, "el acierto no escribió");
    assert.equal(fichasEn(caja, otro), 0, "escribió también del otro lado");
    assert.equal(caja.querySelector("[data-marcador]").getAttribute("data-marcador"), item.categoria);
  } finally { desmontar(); }
});

test("★ el valor de la ficha cambia entre registros y no decide nada", () => {
  /*
   * Tres montos distintos sin efecto sobre la respuesta: refuerza que el lado
   * lo elige la familia, no el tamaño de la cifra.
   */
  assert.ok(B.valoresDeFicha.length >= 3, "no hay variedad de montos");
  assert.equal(new Set(B.valoresDeFicha).size, B.valoresDeFicha.length);

  const { caja, desmontar } = montar();
  try {
    const vistos = new Set();
    for (let k = 0; k < 3; k += 1) {
      const ficha = [...caja.querySelectorAll("[data-ficha]")]
        .find((f) => f.getAttribute("aria-label")?.startsWith("Ficha de "));
      vistos.add(ficha.getAttribute("data-ficha"));
      const item = itemEnPantalla(caja);
      tocar(destino(caja, item.categoria));
      tocar([...caja.querySelectorAll("button")].find((b) => /Siguiente registro/.test(b.textContent)));
    }
    assert.ok(vistos.size > 1, `el monto no cambió: ${[...vistos]}`);
  } finally { desmontar(); }
});

test("★ el coral aparece SOLO cuando alguien se equivoca", () => {
  const { caja, desmontar } = montar();
  try {
    assert.ok(!CORAL.test(caja.innerHTML), "pinta coral sin que nadie haya fallado");
    const item = itemEnPantalla(caja);
    tocar(destino(caja, item.categoria));
    assert.ok(!CORAL.test(caja.innerHTML), "pinta coral en un acierto");
  } finally { desmontar(); }

  const otra = montar();
  try {
    const item = itemEnPantalla(otra.caja);
    tocar(destino(otra.caja, item.categoria === DEBE ? HABER : DEBE));
    assert.ok(CORAL.test(otra.caja.innerHTML), "el fallo no se marca en coral");
  } finally { otra.desmontar(); }
});

test("★ con la ficha tomada, ← la lleva al debe y → al haber", () => {
  const conTecla = (tecla, lado) => {
    const { caja, desmontar } = montar();
    try {
      const item = itemEnPantalla(caja);
      const ficha = [...caja.querySelectorAll("[data-ficha]")]
        .find((f) => f.getAttribute("aria-label")?.startsWith("Ficha de "));
      act(() => { ficha.dispatchEvent(new w.KeyboardEvent("keydown", { key: tecla, bubbles: true })); });
      const acerto = item.categoria === lado;
      assert.equal(fichasEn(caja, lado), acerto ? 1 : 0, `${tecla} no hizo lo que debía`);
      assert.ok(caja.querySelector("[data-triangulo]"), `${tecla} no llegó a responder`);
    } finally { desmontar(); }
  };
  conTecla("ArrowLeft", DEBE);
  conTecla("ArrowRight", HABER);
});
