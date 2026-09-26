import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A4 · ¿SE DEBITA O SE ACREDITA?
 *
 * Aquí hay dos cosas que se rompen sin hacer ruido.
 *
 * La primera es la respuesta: diez lados tecleados a mano pueden decir lo
 * contrario de lo que dice CRECE_POR, y entonces la actividad califica mal sin
 * que nada falle. Por eso el lado se deduce, y aquí se compara lo deducido
 * contra la tabla de la ficha copiada a mano: dos fuentes distintas.
 *
 * La segunda es la contrapartida. Si llegara a verse —aunque sea su hueco, su
 * marco o su nombre en el árbol de accesibilidad— el estudiante deduciría el
 * lado de su cuenta sin razonarlo, y la actividad dejaría de medir nada.
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

const DebitaOAcredita = (await import("../../components/mecanicas/libros/DebitaOAcredita.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  ASIENTOS, POR_PARTIDA, VALOR_FICHA, evaluar, puntuar, pesoDeCadaItem, montar, contrario,
} = await import("../debitaOAcredita.js");
const {
  ITEMS, PATRON_A, PATRON_B, PATRON_B_BIS, TEXTO_A, TEXTO_B, TEXTO_B_BIS,
} = await import("../../data/contabilidadDebitaOAcredita.js");
const { DEBE, HABER, tipoDeCuenta, CRECE_POR } = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

/*
 * La tabla de la ficha, copiada a mano. El código NO la lee: deduce el lado de
 * `sube` más la regla del capítulo. Comparar las dos es comparar dos fuentes.
 */
const TABLA_DE_LA_FICHA = [
  ["cu4-01", "Inventario", DEBE, "Cuentas por pagar"],
  ["cu4-02", "Aportes sociales", DEBE, "Caja"],
  ["cu4-03", "Caja", HABER, "Maquinaria"],
  ["cu4-04", "Ingresos por servicios", HABER, "Cuentas por cobrar"],
  ["cu4-05", "Gastos de operación", DEBE, "Caja"],
  ["cu4-06", "Caja", DEBE, "Aportes sociales"],
  ["cu4-07", "Obligaciones financieras", HABER, "Caja"],
  ["cu4-08", "Cuentas por cobrar", HABER, "Caja"],
  ["cu4-09", "Cuentas por pagar", DEBE, "Caja"],
  ["cu4-10", "Participaciones por pagar", DEBE, "Caja"],
];

function montarVista() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(DebitaOAcredita, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const columna = (caja, cuenta, lado) => caja.querySelector(`[data-cuenta-valor="${cuenta}"] [data-columna="${lado}"]`);
const tarjetas = (caja) => [...caja.querySelectorAll("[data-cuenta-valor]")].map((x) => x.getAttribute("data-cuenta-valor"));
const enunciadoEnPantalla = (caja) => caja.textContent;
const zonaContra = (caja) => caja.querySelector("[data-zona-contrapartida]");
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));

/** El asiento que está en pantalla ahora mismo, leído de su cuenta T. */
function asientoEnPantalla(caja) {
  const nombre = tarjetas(caja)[0];
  /* Dos ítems preguntan por Caja: hay que mirar también el enunciado. */
  return ASIENTOS.find((a) => a.cuenta === nombre && caja.textContent.includes(a.enunciado));
}
const responder = (caja, a, bien) => {
  const lado = bien ? a.lado : contrario(a.lado);
  tocar(columna(caja, a.cuenta, lado));
};

/* ═══════════════════ EL LADO SALE DE LA REGLA ═══════════════════ */

test("★★ los diez lados deducidos coinciden con la tabla de la ficha", () => {
  assert.equal(ASIENTOS.length, TABLA_DE_LA_FICHA.length);
  for (const [id, cuenta, lado, contrapartida] of TABLA_DE_LA_FICHA) {
    const a = ASIENTOS.find((x) => x.id === id);
    assert.ok(a, `falta ${id}`);
    assert.equal(a.cuenta, cuenta, `${id}: la cuenta preguntada`);
    assert.equal(a.lado, lado, `${id}: el lado de ${cuenta}`);
    assert.equal(a.contrapartida, contrapartida, `${id}: la contrapartida`);
  }
});

test("★★ la contrapartida cae siempre enfrente: el asiento no puede descuadrar", () => {
  for (const a of ASIENTOS) {
    assert.notEqual(a.ladoContrapartida, a.lado, `${a.id} registra las dos cuentas del mismo lado`);
    assert.equal(contrario(a.lado), a.ladoContrapartida);
  }
});

test("★ el lado responde a «sube o baja», no a una tabla: invertirlo lo invierte", () => {
  for (const item of ITEMS) {
    const normal = montar(item);
    const alReves = montar({ ...item, sube: !item.sube });
    assert.notEqual(alReves.lado, normal.lado, `${item.id} no depende de si la cuenta sube`);
  }
});

test("★ ninguna cuenta del banco, ni preguntada ni contrapartida, está fuera del catálogo", () => {
  for (const a of ASIENTOS) {
    assert.ok(CRECE_POR[tipoDeCuenta(a.cuenta)], `${a.cuenta} no está en el catálogo`);
    assert.ok(CRECE_POR[tipoDeCuenta(a.contrapartida)], `${a.contrapartida} no está en el catálogo`);
  }
});

test("la contrapartida es Caja salvo donde la transacción nombra otra cosa", () => {
  /* La regla de decisión ya cerrada: ninguno dice «con cheque» ni «se consignó». */
  for (const a of ASIENTOS) {
    assert.ok(!/con cheque|se consign/i.test(a.enunciado), `${a.id} dispara la excepción y habría que revisarlo`);
  }
});

/* ═══════════════════ LOS TRES PATRONES ═══════════════════ */

test("★★ todo error tiene patrón: no hay ni un ítem sin devolución", () => {
  for (const a of ASIENTOS) {
    const r = evaluar(a, contrario(a.lado));
    assert.equal(r.ok, false);
    assert.ok(r.patron, `${a.id} falla sin patrón`);
    assert.ok(r.texto.startsWith("❌"), `${a.id} no marca el error`);
    assert.ok(!/\{|\[/.test(r.texto), `${a.id} dejó un hueco sin llenar: ${r.texto}`);
  }
});

test("★★ el patrón B es exactamente el de las cuentas «por cobrar» y «por pagar»", () => {
  for (const a of ASIENTOS) {
    const nombreEngaña = /por (cobrar|pagar)$/.test(a.cuenta);
    assert.equal(a.patron === PATRON_B, nombreEngaña, `${a.id} (${a.cuenta}) tiene el patrón cruzado`);
  }
});

test("★ el patrón A nombra la cuenta por la que SÍ se preguntó", () => {
  for (const a of ASIENTOS.filter((x) => x.patron === PATRON_A)) {
    const r = evaluar(a, contrario(a.lado));
    assert.ok(r.texto.includes(a.cuenta), `${a.id} no nombra ${a.cuenta}`);
    assert.equal(r.resaltarCuenta, a.cuenta);
    assert.equal(r.atenuarTransaccion, true);
  }
});

test("★ el patrón B dice la dirección real, deducida, no una escrita a mano", () => {
  for (const a of ASIENTOS.filter((x) => x.patron === PATRON_B)) {
    const r = evaluar(a, contrario(a.lado));
    assert.ok(r.texto.includes(a.efecto), `${a.id} no dice qué le pasa a la cuenta`);
    /* Las tres bajan; si alguna subiera, el texto lo diría al revés y se vería. */
    assert.equal(a.efecto, "disminuyendo", `${a.id} cambió de dirección`);
    assert.equal(r.resaltarParte, a.parteEngañosa);
    assert.equal(r.resaltarPalabra, a.palabraDelEnunciado);
  }
});

test("★★ cada trozo que se manda resaltar existe de verdad en su texto", () => {
  for (const a of ASIENTOS) {
    if (a.palabraDelEnunciado) {
      assert.ok(
        a.enunciado.includes(a.palabraDelEnunciado),
        `${a.id}: «${a.palabraDelEnunciado}» no está en «${a.enunciado}»`,
      );
    }
    if (a.parteEngañosa) {
      assert.ok(a.cuenta.includes(a.parteEngañosa), `${a.id}: «${a.parteEngañosa}» no está en «${a.cuenta}»`);
    }
  }
});

test("★ el B-bis es solo el ítem de la compra a crédito", () => {
  const conBBis = ASIENTOS.filter((a) => a.patron === PATRON_B_BIS);
  assert.equal(conBBis.length, 1);
  assert.equal(conBBis[0].id, "cu4-01");
  assert.equal(evaluar(conBBis[0], contrario(conBBis[0].lado)).texto, TEXTO_B_BIS);
});

test("★ acertar devuelve la razón de ESE ítem, y las diez son distintas", () => {
  const vistos = new Set();
  for (const a of ASIENTOS) {
    const r = evaluar(a, a.lado);
    assert.equal(r.ok, true);
    assert.equal(r.texto, a.acierto);
    assert.ok(r.texto.startsWith("✅"));
    vistos.add(r.texto);
  }
  assert.equal(vistos.size, ASIENTOS.length);
});

test("★ solo los errores llevan coral; los tres patrones lo marcan", () => {
  for (const texto of [TEXTO_A, TEXTO_B, TEXTO_B_BIS]) assert.ok(texto.startsWith("❌"));
  for (const a of ASIENTOS) assert.ok(!a.acierto.includes("❌"));
});

/* ═══════════════════ PUNTAJE Y PANEL ═══════════════════ */

test("ocho de diez, cada una pesa igual, y el reintento vale la mitad", () => {
  assert.equal(POR_PARTIDA, 8);
  assert.ok(ASIENTOS.length > POR_PARTIDA);
  assert.equal(pesoDeCadaItem(POR_PARTIDA), 12.5);
  const ocho = ASIENTOS.slice(0, POR_PARTIDA);
  assert.equal(puntuar(ocho.map((a) => ({ id: a.id, primeroOk: true }))), 100);
  assert.equal(puntuar(ocho.map((a) => ({ id: a.id, primeroOk: false, segundoOk: true }))), 50);
  assert.equal(puntuar(ocho.map((a) => ({ id: a.id, primeroOk: false, segundoOk: false }))), 0);
});

test("★ el panel docente dice también por qué cuenta se preguntó", () => {
  for (const a of ASIENTOS) {
    const e = etiquetaDeItem("cu-debita-o-acredita", a.id);
    assert.ok(e && e.includes(a.enunciado), `${a.id} sin enunciado`);
    assert.ok(e.includes(a.cuenta), `${a.id} no dice la cuenta preguntada`);
  }
  /* Dos ítems comparten enunciado con otra cuenta: las etiquetas no se repiten. */
  const todas = ASIENTOS.map((a) => etiquetaDeItem("cu-debita-o-acredita", a.id));
  assert.equal(new Set(todas).size, ASIENTOS.length);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★ la contrapartida NO existe en pantalla antes de acertar, ni su nombre", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);

  assert.equal(Boolean(caja.querySelector("[data-contrapartida]")), false, "la contrapartida ya estaba marcada");
  assert.ok(
    !tarjetas(caja).includes(a.contrapartida),
    `«${a.contrapartida}» estaba escrita antes de acertar`,
  );
  const zona = zonaContra(caja);
  assert.ok(zona, "no hay zona reservada");
  assert.equal(zona.getAttribute("data-zona-contrapartida"), "reservada");
  /* Ni marco ni línea: el sitio está reservado, pero ahí no hay nada que ver. */
  assert.equal(zona.style.border ?? "", "", "la zona reservada lleva marco y se nota");
  /*
   * Y el sitio está reservado de verdad: el bloque que lo contiene tiene un
   * alto mínimo desde el principio, para que lo de debajo no salte al acertar.
   */
  const bloque = caja.querySelector("[data-zona]");
  assert.ok(bloque, "no existe el bloque de alto reservado");
  assert.ok(parseInt(bloque.style.minHeight, 10) > 100, "el bloque no reserva alto");
  desmontar();
});

test("★★ tras un FALLO la contrapartida sigue sin aparecer, y la ficha no cae", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  responder(caja, a, false);

  assert.equal(Boolean(caja.querySelector("[data-contrapartida]")), false, "el fallo destapó la contrapartida");
  assert.ok(!tarjetas(caja).includes(a.contrapartida));
  assert.equal(caja.querySelectorAll(`[data-cuenta-valor="${a.cuenta}"] [data-ficha]`).length, 0,
    "la ficha se escribió en la cuenta tras un fallo");
  assert.ok(caja.querySelector("[data-fallo]"), "falta el aviso de que la ficha volvió");
  assert.equal(Boolean(caja.querySelector("[data-arco]")), false, "se trazó el arco de un asiento que no ocurrió");
  desmontar();
});

test("★★ al acertar aparece la contrapartida, con su ficha enfrente y el arco", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  responder(caja, a, true);

  assert.ok(tarjetas(caja).includes(a.contrapartida), "la contrapartida no apareció");
  const zona = zonaContra(caja);
  assert.equal(zona.getAttribute("data-contrapartida"), a.contrapartida);
  assert.equal(zona.getAttribute("data-zona-contrapartida"), "visible");
  /* El bloque no cambia de alto: lo de debajo no se movió. */
  assert.ok(parseInt(caja.querySelector("[data-zona]").style.minHeight, 10) > 100);

  const propia = caja.querySelectorAll(`[data-cuenta-valor="${a.cuenta}"] [data-columna="${a.lado}"] [data-ficha]`);
  const otra = caja.querySelectorAll(`[data-cuenta-valor="${a.contrapartida}"] [data-columna="${a.ladoContrapartida}"] [data-ficha]`);
  assert.equal(propia.length, 1, "la ficha no cayó en la cuenta preguntada");
  assert.equal(otra.length, 1, "la contrapartida no recibió su ficha");

  const arco = caja.querySelector("[data-arco]");
  assert.ok(arco, "no se trazó el arco");
  assert.equal(arco.getAttribute("data-arco"), `${a.lado}→${a.ladoContrapartida}`);
  desmontar();
});

test("★★ el ▲ no está antes de responder; al fallar sale el de la cuenta preguntada y NADA de la otra", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  assert.equal(Boolean(caja.querySelector("[data-triangulo]")), false, "el ▲ estaba puesto antes de responder");

  responder(caja, a, false);
  const tras = [...caja.querySelectorAll("[data-triangulo]")];
  assert.equal(tras.length, 1, "al fallar debe verse un solo ▲: el de la cuenta preguntada");
  assert.equal(tras[0].getAttribute("data-triangulo"), a.creceP);

  responder(caja, a, true);
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, 2, "al acertar van los ▲ de las dos");
  desmontar();
});

test("★ la ficha fallada lo dice en coral y la cuenta queda vacía", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  responder(caja, a, false);
  const aviso = caja.querySelector("[data-fallo]");
  assert.ok(aviso);
  assert.match(aviso.style.border, CORAL);
  assert.equal(caja.querySelectorAll(`[data-cuenta-valor="${a.cuenta}"] [data-ficha]`).length, 0);
  desmontar();
});

test("★ el patrón A atenúa la transacción y hace latir el nombre de la cuenta", () => {
  const { caja, desmontar } = montarVista();
  /* Se busca un ítem del patrón A avanzando por la tanda. */
  let a = asientoEnPantalla(caja);
  while (a.patron !== PATRON_A) {
    responder(caja, a, true);
    tocar(boton(caja, "Siguiente transacción"));
    a = asientoEnPantalla(caja);
  }
  responder(caja, a, false);
  const pista = caja.querySelector("[data-pista]");
  assert.ok(pista, "no salió la pista");
  assert.equal(pista.querySelector("[data-marcado]").getAttribute("data-marcado"), a.cuenta);
  assert.ok(pista.querySelector(".fae-a4-late"), "el nombre no late");
  desmontar();
});

test("★ el patrón B enseña a la vez la parte del nombre y la palabra del enunciado", () => {
  const { caja, desmontar } = montarVista();
  let a = asientoEnPantalla(caja);
  while (a.patron !== PATRON_B) {
    responder(caja, a, true);
    tocar(boton(caja, "Siguiente transacción"));
    a = asientoEnPantalla(caja);
  }
  responder(caja, a, false);
  const marcados = [...caja.querySelectorAll("[data-marcado]")].map((x) => x.getAttribute("data-marcado"));
  assert.ok(marcados.includes(a.parteEngañosa), `no resaltó «${a.parteEngañosa}»`);
  assert.ok(marcados.includes(a.palabraDelEnunciado), `no resaltó «${a.palabraDelEnunciado}»`);
  desmontar();
});

/*
 * OJO CON ESTA: la primera versión elegía la tecla y comparaba contra el lado
 * que hubiera salido sorteado. Cuando no coincidían —la mitad de las veces—
 * esperaba «cero fichas», que es justo lo que pasa si las flechas no hacen
 * NADA. Pasaba sin comprobar nada, y un mutante que apagaba el teclado entero
 * sobrevivía. Ahora la tecla se elige a partir del ítem: la que acierta tiene
 * que escribir, y la que falla tiene que devolver la ficha.
 */
test("★★ las dos flechas llevan a lados DISTINTOS, sobre el mismo ítem", () => {
  const tecla = (lado) => (lado === DEBE ? "ArrowLeft" : "ArrowRight");
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const pulsar = (lado) => {
    const f = caja.querySelector("[data-ficha]");
    act(() => { f.dispatchEvent(new w.KeyboardEvent("keydown", { key: tecla(lado), bubbles: true })); });
  };
  const escritas = () => caja.querySelectorAll(`[data-cuenta-valor="${a.cuenta}"] [data-ficha]`).length;

  /* Primero la del lado equivocado: no escribe, y avisa de que volvió. */
  pulsar(contrario(a.lado));
  assert.equal(escritas(), 0, "la flecha equivocada escribió la ficha");
  assert.ok(caja.querySelector("[data-fallo]"), "la flecha equivocada no avisó del fallo");

  /* Y en el reintento, la del lado correcto sí escribe. */
  pulsar(a.lado);
  assert.equal(escritas(), 1, "la flecha correcta no escribió la ficha");
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false);
  desmontar();
});

test("★ las dos columnas son botones de verdad mientras se puede responder", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  for (const lado of [DEBE, HABER]) {
    const c = columna(caja, a.cuenta, lado);
    assert.equal(c.tagName, "BUTTON", `la columna ${lado} no es un botón`);
    assert.ok((c.getAttribute("aria-label") ?? "").length > 5);
  }
  desmontar();
});

test("★ se juegan ocho de las diez y ninguna se repite dentro de la tanda", () => {
  const { caja, desmontar } = montarVista();
  const vistos = [];
  for (let k = 0; k < POR_PARTIDA; k += 1) {
    const a = asientoEnPantalla(caja);
    assert.ok(a, `no se pudo leer el asiento ${k + 1}`);
    vistos.push(a.id);
    responder(caja, a, true);
    tocar(boton(caja, k + 1 === POR_PARTIDA ? "Ver el resultado" : "Siguiente transacción"));
  }
  assert.equal(vistos.length, POR_PARTIDA);
  assert.equal(new Set(vistos).size, POR_PARTIDA, "una transacción salió dos veces");
  assert.ok(enunciadoEnPantalla(caja).length > 0);
  desmontar();
});

test("la ficha lleva siempre el mismo valor: aquí se mira el lado, no el monto", () => {
  assert.equal(typeof VALOR_FICHA, "number");
  assert.ok(VALOR_FICHA > 0);
});
