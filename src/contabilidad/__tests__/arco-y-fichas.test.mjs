import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS DOS GESTOS DEL SEGUNDO ENCARGO: EL ARCO DE CU-6 Y LAS FICHAS DE CU-8.
 *
 * Los dos cambian POR QUÉ MEDIO se contesta, no qué se contesta, así que lo
 * que hay que vigilar es que la respuesta siga siendo la misma —los ids de
 * ítem, el puntaje, los textos— y que el gesto nuevo no haya abierto una
 * puerta que no estaba: un arco que se traza con un nombre, un asiento que no
 * se puede responder, una balanza que dice la diferencia antes de tiempo.
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

const ArmaElAsiento = (await import("../../components/mecanicas/libros/ArmaElAsiento.jsx")).default;
const CuadraONoCuadra = (await import("../../components/mecanicas/libros/CuadraONoCuadra.jsx")).default;
const { evaluar: evaluarCuadra, etiquetaDeLaBalanza, CUADRA, NO_CUADRA } = await import("../../components/mecanicas/libros/CuadraONoCuadra.jsx");
const { arcoValido, esZona, leerZona, ANCLAJE } = await import("../../components/mecanicas/libros/MesaDelAsiento.jsx");
const { fichasDe, alSoltar, ladoLiviano, REPERTORIO, CUANTAS_FICHAS, DESCUADRADOS } = await import("../descuadre.js");
const { CUADRA_O_NO, ARMA_EL_ASIENTO, balanceDelAsiento } = await import("../../data/contabilidadActividades.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");

function montar(Mecanica) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Mecanica, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const porTexto = (caja, txt) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === txt);
const zona = (caja, z) => caja.querySelector(`[data-zona="${z}"]`);
const grados = (caja) => {
  const b = caja.querySelector("[data-balanza]");
  return b ? Number(b.getAttribute("data-balanza")) : null;
};

/* ═══════════════ CU-8 · LAS CINCO FICHAS ═══════════════ */

test("★ cada asiento descuadrado recibe su ficha correcta entre las cinco", () => {
  assert.ok(DESCUADRADOS.length >= 5, "el banco se quedó sin descuadrados");
  for (const a of DESCUADRADOS) {
    const b = balanceDelAsiento(a);
    const f = fichasDe(a);
    assert.equal(f.length, CUANTAS_FICHAS, `${a.id}: salieron ${f.length} fichas`);
    assert.ok(f.includes(b.descuadre), `${a.id}: la ficha correcta (${b.descuadre}) no está`);
    assert.equal(new Set(f).size, f.length, `${a.id}: hay fichas repetidas`);
    for (const v of f) assert.ok(REPERTORIO.includes(v), `${a.id}: ${v} no es del repertorio`);
  }
});

test("★ las cinco de un ítem son las MÁS CERCANAS a su descuadre, no cinco al azar", () => {
  /*
   * Una ficha de 50 junto a un descuadre de 5.000 no es un distractor, es
   * relleno: se descarta sola sin pensar. Lo que la actividad persigue
   * —confundir la diferencia con el total de un lado— vive justo al lado de
   * la cifra correcta.
   */
  for (const a of DESCUADRADOS) {
    const { descuadre } = balanceDelAsiento(a);
    const elegidas = fichasDe(a);
    const fuera = REPERTORIO.filter((v) => !elegidas.includes(v));
    const masLejana = Math.max(...elegidas.map((v) => Math.abs(v - descuadre)));
    for (const v of fuera) {
      assert.ok(Math.abs(v - descuadre) >= masLejana,
        `${a.id}: dejó fuera ${v}, más cercana que una que entró`);
    }
  }
});

test("★ un asiento que cuadra no reparte fichas: no hay nada que nivelar", () => {
  for (const a of CUADRA_O_NO.asientos.filter((x) => balanceDelAsiento(x).cuadra)) {
    assert.deepEqual(fichasDe(a), [], `${a.id} repartió fichas sin descuadre`);
  }
});

test("★ soltar la ficha exacta NIVELA; una mayor se pasa, una menor queda corta", () => {
  for (const a of DESCUADRADOS) {
    const b = balanceDelAsiento(a);
    const liviano = ladoLiviano(b);
    assert.equal(liviano, b.debe < b.haber ? DEBE : HABER);

    const justa = alSoltar(a, b.descuadre);
    assert.equal(justa.efecto, "nivela", `${a.id}: la ficha exacta no niveló`);
    assert.ok(justa.nivelada, `${a.id}: dice que nivela y los totales no coinciden`);
    assert.equal(justa.falta, 0);

    const grande = alSoltar(a, b.descuadre + 50);
    assert.equal(grande.efecto, "pasa", `${a.id}: una ficha mayor no se pasó`);
    assert.ok(!grande.nivelada);
    /* Se pasó quiere decir que ahora pesa más el que pesaba menos. */
    const antes = b.debe > b.haber ? DEBE : HABER;
    const ahora = grande.debe > grande.haber ? DEBE : HABER;
    assert.notEqual(ahora, antes, `${a.id}: se pasó y la balanza no cambió de lado`);

    if (b.descuadre > 1) {
      const chica = alSoltar(a, b.descuadre - 1);
      assert.equal(chica.efecto, "corta", `${a.id}: una ficha menor no quedó corta`);
      assert.equal(chica.falta, 1, `${a.id}: dice mal cuánto falta`);
      const sigue = chica.debe > chica.haber ? DEBE : HABER;
      assert.equal(sigue, antes, `${a.id}: quedó corta y la balanza cambió de lado`);
    }
  }
});

test("★ las DOS devoluciones de la ficha son alcanzables en el banco", () => {
  /*
   * «Se pasó» y «queda corta» solo existen si el repertorio ofrece, en algún
   * ítem, una ficha mayor y una menor que la correcta. Si el repertorio
   * cambiara y una de las dos dejara de ser posible, esa explicación no la
   * leería nadie.
   */
  const conMayor = DESCUADRADOS.filter((a) => fichasDe(a).some((v) => v > balanceDelAsiento(a).descuadre));
  const conMenor = DESCUADRADOS.filter((a) => fichasDe(a).some((v) => v < balanceDelAsiento(a).descuadre));
  assert.ok(conMayor.length > 0, "ningún ítem permite pasarse");
  assert.ok(conMenor.length > 0, "ningún ítem permite quedarse corto");

  const e = CUADRA_O_NO.errores;
  const a = conMayor[0];
  const b = balanceDelAsiento(a);
  const mayor = fichasDe(a).find((v) => v > b.descuadre);
  assert.equal(evaluarCuadra(a, NO_CUADRA, mayor).texto, e.sePaso);

  const c = conMenor[0];
  const bc = balanceDelAsiento(c);
  const menor = fichasDe(c).find((v) => v < bc.descuadre);
  const r = evaluarCuadra(c, NO_CUADRA, menor);
  assert.ok(r.texto.startsWith(e.quedaCorta.slice(0, 20)));
  assert.ok(r.texto.includes(pesos(bc.descuadre - menor)), "no dice cuánto falta todavía");
});

test("★ la balanza de CU-8 NO dice la diferencia antes de responder, ni por el lado accesible", () => {
  /*
   * La balanza aparece en cuanto el estudiante dice «no cuadra» —para eso
   * tiene que haber platillo donde soltar— pero hasta que suelta no puede
   * decir de cuánto es la diferencia. Ni escrita en los platillos ni dicha en
   * la etiqueta: regalarla por el lado accesible es la peor forma de
   * regalarla, porque solo la nota quien depende de él.
   *
   * Se comprueba SOBRE LOS CINCO DESCUADRADOS, no sobre el que salga
   * sorteado: una prueba que se salta su comprobación cuando el sorteo no
   * colabora es una prueba que a veces no prueba nada.
   */
  for (const a of DESCUADRADOS) {
    const b = balanceDelAsiento(a);
    const dicho = etiquetaDeLaBalanza(null, b, null);
    assert.ok(!/\$/.test(dicho), `${a.id}: la etiqueta dice una cifra antes de tiempo — «${dicho}»`);
    assert.ok(!dicho.includes(String(b.descuadre)), `${a.id}: la etiqueta filtra el descuadre`);
    assert.ok(/inclinada/.test(dicho), `${a.id}: no dice ni siquiera cómo está la balanza`);
    /* Lo que sí puede decir es hacia dónde, que también se ve. */
    assert.ok(dicho.includes(ladoLiviano(b) === DEBE ? "debe" : "haber"));
  }

  /* Y después de responder sí: ahí la cifra es la devolución, no la pregunta. */
  const a = DESCUADRADOS[0];
  const b = balanceDelAsiento(a);
  const despues = etiquetaDeLaBalanza(evaluarCuadra(a, NO_CUADRA, b.descuadre), b, b.descuadre);
  assert.ok(despues.includes(pesos(b.descuadre)), "al corregir tampoco dice la cifra");
});

test("★ y los platillos tampoco la llevan escrita mientras se elige la ficha", () => {
  const vacio = montar(CuadraONoCuadra);
  assert.equal(grados(vacio.caja), null, "la balanza salió antes del juicio");
  vacio.desmontar();

  const { caja, desmontar } = montarConDescuadrado();
  try {
    for (const p of caja.querySelectorAll("[data-platillo]")) {
      assert.ok(!/\$/.test(p.textContent), `el platillo enseña una cifra antes de tiempo: «${p.textContent}»`);
    }
  } finally { desmontar(); }
});

/*
 * El primer asiento de la tanda sale sorteado, y la mitad del banco cuadra.
 * Montar una vez y salirse cuando no toca descuadrado es una prueba que a
 * veces no prueba nada — se vio: un mutante que le quitaba el toque al
 * platillo sobrevivía porque ese intento no llegó a las fichas. Así que se
 * monta hasta dar con uno, y si no aparece, la prueba falla en vez de callar.
 */
function montarConDescuadrado(intentos = 30) {
  for (let i = 0; i < intentos; i += 1) {
    const m = montar(CuadraONoCuadra);
    tocar(porTexto(m.caja, "No cuadra"));
    if (m.caja.querySelectorAll("[data-ficha]").length > 0) return m;
    m.desmontar();
  }
  assert.fail("no salió ningún asiento descuadrado en 30 intentos");
  return null;
}

test("★ el platillo liviano recibe la ficha por TOQUE, no solo arrastrando", () => {
  const { caja, desmontar } = montarConDescuadrado();
  try {
    const fichas = [...caja.querySelectorAll("[data-ficha]")];
    assert.equal(fichas.length, CUANTAS_FICHAS);

    const destino = caja.querySelector("[data-platillo][data-destino]");
    assert.ok(destino, "ningún platillo recibe: el arrastre sería el único camino");
    assert.equal(destino.tagName, "BUTTON", "el platillo no es un botón: el teclado no llega");

    tocar(fichas[0]);
    assert.equal(fichas[0].getAttribute("aria-pressed"), "true", "tocar la ficha no la toma");
    tocar(destino);

    const responder = porTexto(caja, "Responder");
    assert.ok(!responder.disabled, "con la ficha en el platillo, Responder sigue bloqueado");
  } finally { desmontar(); }
});

test("★ decir «no cuadra» de un asiento que SÍ cuadra no deja al estudiante encerrado", () => {
  /*
   * Ese asiento no tiene descuadre, así que no reparte fichas. Sin una salida
   * explícita, el botón de responder se quedaba bloqueado para siempre: sin
   * fichas que soltar y sin forma de avanzar.
   */
  const cuadrado = CUADRA_O_NO.asientos.find((a) => balanceDelAsiento(a).cuadra);
  const r = evaluarCuadra(cuadrado, NO_CUADRA, null);
  assert.ok(!r.juicioOk);
  assert.equal(r.texto.startsWith("❌"), true);
  assert.equal(r.efecto, null, "un asiento que cuadra no debería tener efecto de ficha");
});

test("los ids de ítem de CU-8 no cambiaron: el panel docente sigue leyendo lo mismo", () => {
  for (const a of CUADRA_O_NO.asientos) {
    assert.match(`${a.id}:juicio`, /^cu8-\d{2}:juicio$/);
    assert.match(`${a.id}:cifra`, /^cu8-\d{2}:cifra$/);
  }
});

/* ═══════════════ CU-6 · EL ARCO ═══════════════ */

test("★ un arco vale de un debe a un haber, y solo entre las DOS cuentas", () => {
  assert.ok(arcoValido("0:debe", "1:haber"));
  assert.ok(arcoValido("1:debe", "0:haber"));
  assert.ok(arcoValido("0:haber", "1:debe"));
  /* Las dos puntas al mismo lado son media transacción escrita dos veces. */
  assert.ok(!arcoValido("0:debe", "1:debe"));
  assert.ok(!arcoValido("0:haber", "1:haber"));
  /* Y las dos puntas en la misma cuenta no son un arco. */
  assert.ok(!arcoValido("0:debe", "0:haber"));
});

test("★ un NOMBRE soltado sobre una columna no cuela como arco", () => {
  /*
   * Sin comprobar que las dos puntas son zonas de verdad, «Caja» pasaba por
   * arco: el índice salía como no-número y el lado como indefinido, y las dos
   * desigualdades se cumplían por accidente. El asiento quedaba con un lado
   * indefinido y la actividad lo daba por armado.
   */
  assert.ok(!esZona("Caja"));
  assert.ok(!esZona("nombre:0"));
  assert.ok(!esZona(null));
  assert.ok(esZona("0:debe"));
  assert.ok(!arcoValido("Caja", "1:haber"));
  assert.ok(!arcoValido("0:debe", "Caja"));
  assert.ok(Number.isNaN(leerZona("Caja").indice));
});

test("los cuatro anclajes del arco son los centros de las cuatro columnas", () => {
  assert.deepEqual(Object.keys(ANCLAJE).sort(), ["0:debe", "0:haber", "1:debe", "1:haber"]);
  /* Dos cuentas, dos columnas cada una: los centros caen cada 25 %. */
  const xs = Object.values(ANCLAJE).sort((a, b) => a - b);
  assert.deepEqual(xs, [12.5, 37.5, 62.5, 87.5]);
});

test("★ la balanza de CU-6 está caída mientras el asiento esté a medias", () => {
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    assert.notEqual(grados(caja), 0, "el asiento vacío y la balanza ya nivelada");
    assert.equal(caja.querySelector("[data-nivelada]").getAttribute("data-nivelada"), "no");
  } finally { desmontar(); }
});

test("★ nombrar, trazar y cerrar: la balanza se nivela solo al cerrar el asiento", () => {
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    /* Los nombres se toman del banco y se sueltan en cada T. */
    const nombres = () => [...caja.querySelectorAll("[data-ficha]")]
      .filter((f) => f.getAttribute("aria-label")?.startsWith("Poner ") && !f.disabled);
    const tes = () => [...caja.querySelectorAll("[data-cuenta-puesta]")];

    assert.equal(tes().length, 2, "no hay dos cuentas T");
    assert.ok(nombres().length >= 2, "el banco de nombres está vacío");

    tocar(nombres()[0]);
    tocar(tes()[0]);
    tocar(nombres()[0]);
    tocar(tes()[1]);

    const puestas = tes().map((t) => t.getAttribute("data-cuenta-puesta"));
    assert.ok(puestas.every((x) => x), `alguna T quedó sin nombre: ${puestas}`);
    assert.notEqual(puestas[0], puestas[1], "el mismo nombre quedó en las dos");

    /* Con nombres pero sin arco, la balanza sigue caída. */
    assert.notEqual(grados(caja), 0, "se niveló con solo los nombres puestos");
    assert.ok(!caja.querySelector("[data-arco]"), "hay arco sin haberlo trazado");

    /* El arco, por toque: el debe de una y el haber de la otra. */
    tocar(zona(caja, "0:debe"));
    tocar(zona(caja, "1:haber"));

    assert.equal(grados(caja), 0, "el asiento cerrado y la balanza sigue caída");
    assert.ok(caja.querySelector("[data-arco]"), "no se dibujó el arco");
    assert.equal(zona(caja, "0:debe").getAttribute("data-ocupada"), "si");
    assert.equal(zona(caja, "1:haber").getAttribute("data-ocupada"), "si");
    assert.ok(!porTexto(caja, "Responder").disabled, "el asiento cerrado y no se puede responder");
  } finally { desmontar(); }
});

test("★ las dos puntas al mismo lado NO cierran el asiento", () => {
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    const nombres = () => [...caja.querySelectorAll("[data-ficha]")]
      .filter((f) => f.getAttribute("aria-label")?.startsWith("Poner ") && !f.disabled);
    const tes = () => [...caja.querySelectorAll("[data-cuenta-puesta]")];
    tocar(nombres()[0]); tocar(tes()[0]);
    tocar(nombres()[0]); tocar(tes()[1]);

    tocar(zona(caja, "0:debe"));
    tocar(zona(caja, "1:debe"));

    assert.notEqual(grados(caja), 0, "dos cuentas al debe y la balanza se niveló");
    assert.ok(!caja.querySelector("[data-arco]"), "dibujó un arco entre dos debe");
    assert.ok(porTexto(caja, "Responder").disabled, "dejó responder un asiento sin cerrar");
  } finally { desmontar(); }
});

test("★ un nombre ya puesto sale del banco: por eso no puede duplicarse", () => {
  /*
   * Es la regla que hace imposible tener la misma cuenta en las dos T, y está
   * en el banco de nombres, no en el que las coloca. Escribir además una
   * defensa en `nombrar` sería código que finge proteger algo: se quitó, y
   * ninguna prueba cambió.
   */
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    const banco = () => [...caja.querySelectorAll("[data-ficha]")]
      .filter((f) => f.getAttribute("aria-label")?.startsWith("Poner "));
    const tes = () => [...caja.querySelectorAll("[data-cuenta-puesta]")];

    const antes = banco().filter((f) => !f.disabled).length;
    assert.ok(antes >= 2, "el banco de nombres está vacío");

    const elegido = banco().find((f) => !f.disabled);
    const nombre = elegido.getAttribute("data-ficha");
    tocar(elegido);
    tocar(tes()[0]);

    assert.equal(tes()[0].getAttribute("data-cuenta-puesta"), nombre);
    const suyo = banco().find((f) => f.getAttribute("data-ficha") === nombre);
    assert.ok(suyo.disabled, "el nombre ya puesto se puede volver a tomar");
    assert.equal(banco().filter((f) => !f.disabled).length, antes - 1);
  } finally { desmontar(); }
});

test("los ids y el peso de CU-6 no cambiaron con el gesto nuevo", () => {
  assert.equal(ARMA_EL_ASIENTO.decisionesPorItem, 4);
  assert.equal(ARMA_EL_ASIENTO.porPartida, 6);
  for (const i of ARMA_EL_ASIENTO.items) assert.match(i.id, /^cu6-\d{2}$/);
});
