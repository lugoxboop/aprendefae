import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 2 — «El cierre completo de Santa Pacha» (Célula B, b5-t5-a2).
 *
 * Vigila LO QUE SE VE, contra el paquete guardado
 * (orquestador/conocimiento/paquetes/b5-t5-act2.md):
 *   · encabezado, enunciados, rótulos, instrucciones y estante, literales
 *   · la prioridad de errores D > C > A > B, parte por parte, con su texto
 *   · los dos caminos de la C7: cuadrar sin la ganancia → A; ponerla con
 *     Inversiones – títulos por lo recibido → B · C7
 *   · el asiento revelado tras el error, y el acierto sin texto
 *   · el libro diario: cerrado, «Ver» / «Ocultar», crece con cada parte
 *   · ninguna cifra del estante ni del diario fuera de las pp. 194-195
 *   · «1.725.000» cabe en el campo a 320, con el marco de la parte sin
 *     relleno lateral (salida 1 de Sakuta)
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
const act = React.act;
const h = React.createElement;

const { default: CierreConDiario } = await import("../../components/mecanicas/libros/tema5/LibroDiario.jsx");
const { default: CierreSantaPacha } = await import("../../components/mecanicas/libros/tema5/CierreSantaPacha.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t5Act2.js");
const { textoD } = await import("../cierreConMesa.js");
const D = await import("../../data/contabilidadT5Act2.js");
const { FAE } = await import("../../theme.js");

const PARTES = D.PARTES_T5_ACT2;
const parte = (n) => PARTES[n - 1];

const montar = async ({ Juego = CierreConDiario, items = undefined, onCompletar = () => {}, modoDemo = false } = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(Juego, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items, modoDemo }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const escribir = async (input, texto) => {
  assert.ok(input, "no hay campo");
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { poner.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
/* Arma el asiento dado ([{ cuenta, lado, valor }]) y confirma. */
const armar = async (caja, puestas, confirmar = true) => {
  for (const p of puestas) {
    await tocar(caja.querySelector(`[data-sacar="${p.cuenta}:${p.lado}"]`));
    await escribir(caja.querySelector(`[data-campo-cifra="${p.cuenta}"]`), String(p.valor));
  }
  if (confirmar) await tocar(caja.querySelector("[data-confirmar-parte]"));
};
const textoRetro = (caja) => caja.querySelector("[data-texto-retro]")?.textContent ?? null;
const avanzar = async (caja) => tocar(caja.querySelector("[data-boton-avanzar] button"));
const mesaVista = (caja) => [...caja.querySelectorAll("[data-en-mesa]")].map((n) => ({
  cuenta: n.dataset.enMesa, lado: n.closest("[data-columna]").dataset.columna, texto: n.querySelector("input").value,
}));
const sinTexto = (n) => n.textContent.replace(/\s+/g, " ").trim();

/* ═══════════ EL PAQUETE GUARDADO ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t5-act2.md", import.meta.url), "utf8");
const seccion = (desde, hasta) => {
  const i = GUIA.indexOf(desde);
  assert.ok(i >= 0, `el paquete no tiene «${desde}»`);
  const j = hasta ? GUIA.indexOf(hasta, i + desde.length) : GUIA.length;
  assert.ok(j > i, `el paquete no tiene «${hasta}» después de «${desde}»`);
  return GUIA.slice(i, j);
};
const filas = (texto) => {
  const out = [];
  for (const linea of texto.split("\n")) {
    if (!linea.startsWith("| ") || linea.startsWith("|---")) continue;
    out.push(linea.slice(2, -2).split(" | ").map((c) => c.trim().replace(/^«(.*)»$/, "$1")));
  }
  return out.slice(1); // sin la fila de títulos
};
const porClave = (texto) => Object.fromEntries(filas(texto).map(([k, ...r]) => [k, r]));
const G_INICIAL = porClave(seccion("## 1 · Inicial", "## 2 "));
const G_ESTANTE = filas(seccion("## 2 · El estante", "## 3 ")).map((f) => f[0]);
const G_ROTULOS = porClave(seccion("### 3.1", "### 3.2"));
const G_ENUNCIADOS = porClave(seccion("### 3.2", "### 3.3"));
const G_ERRORES = filas(seccion("### 3.3", "## 4 "));
const errorDe = (n, tipo) => {
  const f = G_ERRORES.find(([p, t]) => p === `p${n}` && t === tipo);
  assert.ok(f, `el paquete no tiene el error ${tipo} de la parte ${n}`);
  return f[2];
};
const G_DIARIO = porClave(seccion("## 4 · El libro diario", "Asientos del diario"));
const G_ASIENTOS = filas(seccion("Asientos del diario", "## 5 "));
const G_TUTORIAL = porClave(seccion("## 5 · Tutorial", "## 6 "));
const G_CIFRAS = new Set(filas(seccion("## 6 · Cifras", null)).map((f) => f[0]));

test("guarda: el paquete se leyó entero, y una fila inventada no aparece", () => {
  assert.equal(G_ESTANTE.length, 6);
  for (let n = 1; n <= 4; n++) assert.ok(G_ROTULOS[`p${n}`] && G_ENUNCIADOS[`p${n}`], `parte ${n}`);
  assert.equal(G_ERRORES.length, 18, "4 + 5 + 4 + 5 devoluciones");
  assert.equal(G_ASIENTOS.length, 5);
  assert.ok(G_CIFRAS.size >= 18 && G_CIFRAS.has("1.725.000") && !G_CIFRAS.has("999"));
  assert.equal(G_ROTULOS.p9, undefined);
});

/* ═══════════ LO QUE SE VE: ENCABEZADO, PARTES Y ESTANTE ═══════════ */

test("★★★ encabezado, contador «Asiento», reglas y texto alternativo: los del paquete", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-objetivo]").textContent, G_INICIAL.objetivo[0]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, G_INICIAL.consigna[0]);
  assert.deepEqual(D.REGLAS_T5_ACT2, [G_INICIAL.regla1[0], G_INICIAL.regla2[0], G_INICIAL.regla3[0]]);
  assert.ok(caja.textContent.includes(G_INICIAL.alt[0]));
  assert.ok(caja.textContent.includes("Asiento 1 de 4"), "el contador dice «Asiento»");
  desmontar();
});

test("★★★ cada parte: el enunciado, el rótulo y la instrucción literales, en su pantalla", async () => {
  const { caja, desmontar } = await montar();
  for (let n = 1; n <= 4; n++) {
    assert.equal(caja.querySelector("[data-hecho]").textContent, G_ENUNCIADOS[`p${n}`][0], `enunciado ${n}`);
    assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, G_ROTULOS[`p${n}`][0], `rótulo ${n}`);
    assert.equal(caja.querySelector("[data-instruccion]").textContent, G_ROTULOS[`p${n}`][1], `instrucción ${n}`);
    assert.equal(caja.querySelectorAll("[data-parte]").length, 1, "una parte por pantalla");
    await armar(caja, parte(n).asiento);
    await avanzar(caja);
  }
  desmontar();
});

test("★★★ el estante: las seis cuentas del paquete, en orden y SIN montos", async () => {
  const { caja, desmontar } = await montar();
  const nombres = [...caja.querySelectorAll("[data-en-estante]")].map((n) => n.dataset.enEstante);
  assert.deepEqual(nombres, G_ESTANTE);
  assert.doesNotMatch(caja.querySelector("[data-estante]").textContent, /\d/, "el estante no muestra cifras");
  /* La cuenta que va a la mesa sale del estante; al devolverla, vuelve. */
  await tocar(caja.querySelector('[data-sacar="Caja:debe"]'));
  assert.equal(caja.querySelector('[data-en-estante="Caja"]'), null);
  await tocar(caja.querySelector('[data-devolver="Caja"]'));
  assert.ok(caja.querySelector('[data-en-estante="Caja"]'));
  desmontar();
});

/*
 * Lote 3 · A (hoja de Mai): una fila del estante baja («abajo») solo si su nombre, al lado de los
 * botones, pasa de 3 renglones, y sus botones siguen en la misma columna. JSDOM no mide: aquí se
 * le da a cada fila 258 px y a los botones 75 y 87, y la copia del nombre ocupa 5 renglones si es
 * de las dos cuentas largas del cierre y 2 si no. La medida de verdad, en Chromium, la hace
 * scripts/b5/medir-b5-lote-mesas-a6.mjs.
 */
test("★★★ el estante en vivo: baja la fila cuyo nombre pasa de 3 renglones al lado de los botones; nada más cambia", async () => {
  const LARGAS = [D.ESTANTE_T5_ACT2[4], D.ESTANTE_T5_ACT2[5]];
  const original = w.Element.prototype.getBoundingClientRect;
  w.Element.prototype.getBoundingClientRect = function () {
    const caja = (width, height = 0) => ({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 });
    if (this.matches("[data-en-estante]")) return caja(258);
    if (this.matches("[data-sacar]")) return caja(this.dataset.sacar.endsWith(":debe") ? 75 : 87, 44);
    if (this.style.visibility === "hidden" && this.getAttribute("aria-hidden") === "true") {
      const renglones = LARGAS.includes(this.textContent) ? 5 : 2;
      return caja(parseFloat(this.style.width), renglones * parseFloat(this.style.lineHeight));
    }
    return original.call(this);
  };
  try {
    const { caja, desmontar } = await montar();
    const filas = [...caja.querySelectorAll("[data-en-estante]")];
    assert.deepEqual(filas.filter((f) => f.dataset.forma === "abajo").map((f) => f.dataset.enEstante), LARGAS, "bajan solo las dos cuentas largas");
    for (const f of filas) {
      const abajo = f.dataset.forma === "abajo";
      /* El orden en el DOM no cambia: nombre, «AL DEBE», «AL HABER». */
      assert.deepEqual([...f.children].map((e) => (e.dataset.sacar ? e.dataset.sacar.split(":")[1] : "nombre")), ["nombre", "debe", "haber"]);
      const [nombre, debe, haber] = f.children;
      /* Los botones, en la misma columna en todas las filas; en una fila «abajo», en el renglón de debajo. */
      assert.deepEqual([debe.style.gridColumn, haber.style.gridColumn], ["2", "3"], `«${f.dataset.enEstante}»: los botones en su columna`);
      assert.equal(debe.style.gridRow, abajo ? "2" : "1");
      assert.equal(nombre.style.gridColumn, abajo ? "1 / -1" : "1");
      assert.equal(f.style.rowGap, "4px", "4 px entre el nombre y sus botones");
      assert.equal(debe.style.minHeight, "44px");
    }
    /* La copia que mide no queda en la página. */
    assert.equal(caja.querySelectorAll('[data-estante] [aria-hidden="true"]').length, 0);
    desmontar();
  } finally {
    w.Element.prototype.getBoundingClientRect = original;
  }
});

/* ═══════════ LA PRIORIDAD DE ERRORES: D > C > A > B ═══════════ */

const al = (cuenta, lado, valor) => ({ cuenta, lado, valor });
const reves = (e) => ({ ...e, lado: e.lado === "debe" ? "haber" : "debe" });

test("★★★ prioridad D > C > A > B en las cuatro partes, cada una con su texto literal", async () => {
  for (let n = 1; n <= 4; n++) {
    const ok = parte(n).asiento;
    const sobra = al("Bancos", "debe", 1000);
    const casos = [
      /* D gana a todo: sobra una cuenta, otra va al revés y falta otra. */
      ["D", [sobra, reves(ok[0])]],
      /* C gana a A y a B: una al revés y otra que falta, con valores malos. */
      ["C", [{ ...reves(ok[0]), valor: 7 }]],
      /* A gana a B: falta una cuenta y el valor de otra está mal. */
      ["A", [{ ...ok[0], valor: 7 }]],
      /* B: todas en su lado, un valor mal (que no es Inversiones – títulos). */
      ["B", ok.map((e, k) => (k === 0 ? { ...e, valor: e.valor + 1000 } : e))],
    ];
    for (const [tipo, puestas] of casos) {
      const { caja, desmontar } = await montar({ items: [parte(n)] });
      await armar(caja, puestas);
      assert.equal(caja.querySelector("[data-panel]").dataset.error, tipo, `parte ${n}: ${tipo}`);
      /* La D nombra la cuenta que sobra y sigue con el texto del paquete (Sakuta, calidad 1). */
      const esperado = tipo === "D" ? textoD({ asiento: ok, errores: { D: errorDe(n, "D"), razones: parte(n).errores.razones } }, puestas) : errorDe(n, tipo);
      assert.equal(textoRetro(caja), esperado, `parte ${n}: texto ${tipo}`);
      desmontar();
    }
  }
});

test("★★★ C7, los dos caminos: cuadrar sin la ganancia → A (la explica); ponerla con lo recibido → B · C7", async () => {
  for (const [n, recibido, otra] of [[2, 1725000, "Ingresos financieros – ganancia en venta de títulos"], [4, 468750, "Gastos financieros – pérdida en venta de títulos"]]) {
    const ok = parte(n).asiento;
    const inv = ok.find((e) => e.cuenta === "Inversiones – títulos");
    /* Camino 1: Caja y Inversiones – títulos por lo recibido, cuadra, sin la ganancia/pérdida. */
    let m = await montar({ items: [parte(n)] });
    await armar(m.caja, [al("Caja", "debe", recibido), al(inv.cuenta, "haber", recibido)]);
    assert.equal(textoRetro(m.caja), errorDe(n, "A"), `parte ${n}: cuadrar sin la ${n === 2 ? "ganancia" : "pérdida"} → A`);
    assert.match(textoRetro(m.caja), /no por lo que se recibió/);
    m.desmontar();
    /* Camino 2: pone la ganancia/pérdida, pero Inversiones – títulos por lo recibido. */
    m = await montar({ items: [parte(n)] });
    await armar(m.caja, ok.map((e) => (e.cuenta === inv.cuenta ? { ...e, valor: recibido } : e)));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.error, "C7");
    assert.equal(textoRetro(m.caja), errorDe(n, "C7"), `parte ${n}: B · C7`);
    m.desmontar();
    /* Inversiones – títulos bien y otro valor mal: la B «otro valor», no la C7. */
    m = await montar({ items: [parte(n)] });
    await armar(m.caja, ok.map((e) => (e.cuenta === otra ? { ...e, valor: e.valor + 1000 } : e)));
    assert.equal(textoRetro(m.caja), errorDe(n, "B"));
    m.desmontar();
  }
});

/* ═══════════ EL ASIENTO REVELADO Y EL ACIERTO ═══════════ */

test("★★★ tras el error se revela el asiento correcto y ya no hay segundo intento", async () => {
  const { caja, desmontar } = await montar({ items: [parte(2)] });
  await armar(caja, parte(2).asiento.map((e) => (e.cuenta === "Inversiones – títulos" ? { ...e, valor: 1725000 } : e)));
  const esperado = parte(2).asiento.map((e) => ({ cuenta: e.cuenta, lado: e.lado, texto: e.valor.toLocaleString("es-CO").replace(/,/g, ".") }));
  assert.deepEqual(mesaVista(caja).sort((a, b) => a.cuenta.localeCompare(b.cuenta)), esperado.sort((a, b) => a.cuenta.localeCompare(b.cuenta)));
  assert.equal(caja.querySelector("[data-conector]").dataset.conector, "cerrado");
  assert.equal(caja.querySelector("[data-confirmar-parte]"), null, "un solo intento");
  assert.ok([...caja.querySelectorAll("input")].every((i) => i.readOnly));
  assert.equal(caja.querySelector("[data-visto-parte]"), null, "con error no hay marca");
  assert.ok(caja.querySelector("[data-retro]").textContent.startsWith("Incorrecto: "));
  desmontar();
});

test("★★★ al acertar: la marca junto al rótulo, «Correcto.» para el lector y NINGÚN texto propio", async () => {
  const { caja, desmontar } = await montar({ items: [parte(1)] });
  await armar(caja, parte(1).asiento);
  assert.ok(caja.querySelector("[data-visto-parte]"));
  assert.equal(caja.querySelector("[data-texto-retro]"), null);
  assert.equal(sinTexto(caja.querySelector("[data-retro]")), "Correcto.");
  desmontar();
});

test("★★ «Confirmar asiento» solo con alguna cuenta en la mesa y todas con valor", async () => {
  const { caja, desmontar } = await montar({ items: [parte(1)] });
  const boton = () => caja.querySelector("[data-confirmar-parte]");
  assert.equal(boton().textContent, "Confirmar asiento");
  assert.equal(boton().disabled, true);
  await armar(caja, [al("Caja", "debe", 120000)], false);
  await tocar(caja.querySelector('[data-sacar="Ingresos por intereses:haber"]'));
  assert.equal(boton().disabled, true, "una cuenta sin valor");
  await escribir(caja.querySelector('[data-campo-cifra="Ingresos por intereses"]'), "120000");
  assert.equal(boton().disabled, false);
  assert.equal(caja.querySelector("[data-un-intento]").textContent, "Solo tienes un intento: revisa que los totales den igual antes de confirmar.");
  desmontar();
});

/* ═══════════ NAVEGACIÓN, RESUMEN Y PUNTAJE ═══════════ */

test("★★★ «Siguiente asiento» tres veces, «Ver mi resumen» en la 4; resumen literal; bien a la primera ÷ 4", async () => {
  let pct = null;
  const { caja, desmontar } = await montar({ onCompletar: (p) => { pct = p; } });
  const rotulos = [];
  for (let n = 1; n <= 4; n++) {
    /* Bien la 1 y la 3; mal la 2 y la 4. */
    await armar(caja, n % 2 ? parte(n).asiento : [parte(n).asiento[0]]);
    rotulos.push(caja.querySelector("[data-boton-avanzar] button").textContent);
    await avanzar(caja);
  }
  assert.deepEqual(rotulos, ["Siguiente asiento", "Siguiente asiento", "Siguiente asiento", "Ver mi resumen"]);
  assert.equal(pct, 50);
  assert.equal(caja.querySelector("[data-resumen-cierre]").textContent, G_INICIAL.resumen[0].replace("{bien}", "2").replace("{total}", "4"));
  assert.ok([...caja.querySelectorAll("button")].some((b) => b.textContent === "Otra vez"));
  desmontar();
});

/* ═══════════ EL LIBRO DIARIO ═══════════ */

/* Una fila del paquete → lo que el diario pinta, movimiento por movimiento. */
const movimientosDe = (celda, lado) => celda.split(" · ").map((x) => {
  const [, cuenta, valor] = x.match(/^(.+) (\$[\d.]+)$/);
  return `${lado}|${cuenta}|${valor}`;
});
const filaEsperada = (f) => ({ fecha: f[1], movs: [...movimientosDe(f[2], "debe"), ...movimientosDe(f[3], "haber")] });
const filasVistas = (caja) => [...caja.querySelectorAll("[data-asiento-diario]")].map((a) => ({
  fecha: a.querySelector("[data-fecha-diario]").textContent,
  movs: [...a.querySelectorAll("[data-movimiento]")].map((m) => {
    const lado = m.dataset.movimiento.split(":")[0];
    return `${lado}|${m.querySelector("[data-nombre-diario]").textContent}|${m.querySelector(`[data-valor-diario="${lado}"]`).textContent}`;
  }),
}));

test("★★★ el diario (hallazgo 9 de Shoko): no ocupa sitio hasta confirmar el primer asiento; entonces aparece ABIERTO, con ese asiento escrito; «Ver» / «Ocultar»", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-libro-diario]"), null, "antes del primer asiento, el diario no ocupa sitio");
  await armar(caja, parte(1).asiento);
  const boton = caja.querySelector("[data-diario-alternar]");
  assert.equal(caja.querySelector("[data-diario-cabecera]").textContent, G_DIARIO.cabecera[0]);
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "2 asientos");
  assert.equal(boton.getAttribute("aria-expanded"), "true", "se abre solo al confirmar el primero");
  assert.equal(caja.querySelector("[data-diario-boton]").textContent, "Ocultar");
  assert.equal(boton.querySelector("svg"), null, "sin chevrón");
  assert.equal(boton.getAttribute("aria-controls"), caja.querySelector("[data-diario-cuerpo]").id);
  assert.deepEqual([...caja.querySelectorAll("[data-diario-columna]")].map((n) => n.textContent), ["DEBE", "HABER"]);
  assert.deepEqual(filasVistas(caja), [filaEsperada(G_ASIENTOS[0]), filaEsperada(G_ASIENTOS[1])], "la compra y el asiento recién confirmado");
  await tocar(boton);
  assert.equal(boton.getAttribute("aria-expanded"), "false");
  assert.equal(caja.querySelector("[data-diario-boton]").textContent, "Ver");
  assert.equal(caja.querySelectorAll("[data-asiento-diario]").length, 0, "cerrado no muestra asientos");
  /* El diario va entre el encabezado y el contador. */
  const diario = caja.querySelector("[data-libro-diario]");
  assert.ok(caja.querySelector("[data-consigna]").compareDocumentPosition(diario) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(diario.compareDocumentPosition(caja.querySelector("[data-tarjeta-parte]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  desmontar();
});

test("★★★ el diario crece con el asiento CORRECTO de cada parte comprobada; se abre solo una vez, con el primero, y después conserva su estado", async () => {
  const { caja, desmontar } = await montar();
  for (let n = 1; n <= 4; n++) {
    /* Mal la 2 y la 4: el diario igual anota lo correcto. */
    await armar(caja, n % 2 ? parte(n).asiento : [parte(n).asiento[0]]);
    assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, `${n + 1} asientos`);
    if (n === 1) assert.equal(caja.querySelector("[data-diario-alternar]").getAttribute("aria-expanded"), "true", "se abre solo con el primero");
    /* Se cierra en la 2: ya no se vuelve a abrir solo. */
    if (n === 2) await tocar(caja.querySelector("[data-diario-alternar]"));
    await avanzar(caja);
    if (n >= 2) assert.equal(caja.querySelector("[data-diario-alternar]").getAttribute("aria-expanded"), "false", "conserva su estado al cambiar de asiento");
  }
  await tocar(caja.querySelector("[data-diario-alternar]"));
  /* En el resumen, los cinco asientos, literales del paquete; el Haber con sangría. */
  assert.deepEqual(filasVistas(caja), G_ASIENTOS.map(filaEsperada));
  for (const m of caja.querySelectorAll("[data-movimiento]")) {
    assert.equal(m.querySelector("[data-nombre-diario]").style.paddingLeft, m.dataset.movimiento.startsWith("haber") ? "12px" : "0px");
  }
  /* «Otra vez» deja solo la compra: el diario vuelve a no ocupar sitio hasta el primer asiento. */
  await tocar([...caja.querySelectorAll("button")].find((b) => b.textContent === "Otra vez"));
  assert.equal(caja.querySelector("[data-libro-diario]"), null);
  desmontar();
});

/* ═══════════ LAS CIFRAS: SOLO LAS DE LAS PP. 194-195 ═══════════ */

const cifrasDe = (texto) => [...texto.matchAll(/\d[\d.]*\d|\d/g)].map((m) => m[0]);

test("★★★ ninguna cifra del estante, del diario ni de los textos sale de las pp. 194-195", async () => {
  /* Control positivo: el detector ve una cifra que no está en la lista. */
  assert.deepEqual(cifrasDe("Caja $999 y 1.725.000").filter((c) => !G_CIFRAS.has(c)), ["999"]);
  const { caja, desmontar } = await montar();
  assert.deepEqual(cifrasDe(caja.querySelector("[data-estante]").textContent), [], "el estante no tiene cifras");
  /* El diario ya está abierto: se abrió solo con el primer asiento. */
  for (let n = 1; n <= 4; n++) { await armar(caja, parte(n).asiento); await avanzar(caja); }
  /* Pieza por pieza (fecha, cuenta, valor): el textContent entero pega las cifras. La cuenta de asientos es del componente. */
  const piezas = [...caja.querySelectorAll("[data-fecha-diario], [data-nombre-diario], [data-valor-diario]")];
  assert.equal(caja.querySelectorAll("[data-valor-diario]").length, 12, "doce movimientos en los cinco asientos");
  const enDiario = piezas.flatMap((n) => cifrasDe(n.textContent));
  assert.ok(enDiario.length >= 12, `el diario abierto pinta sus cifras (${enDiario.length})`);
  assert.deepEqual(enDiario.filter((c) => !G_CIFRAS.has(c)), [], "cifra del diario fuera de las pp. 194-195");
  desmontar();
  /* Y en todo texto de los datos: enunciados, devoluciones, tutorial. */
  const textos = [];
  const recoger = (v) => {
    /* «el asiento 4» numera las partes (las razones de la entrega 1): no es una cifra del libro. */
    if (typeof v === "string") textos.push(v.replace(/asiento \d/g, "asiento"));
    else if (typeof v === "number") textos.push(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    else if (Array.isArray(v)) v.forEach(recoger);
    /* El id y el rótulo («Asiento 2») numeran las partes: no son cifras del libro. */
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (k !== "id" && k !== "rotulo") recoger(x); }
  };
  recoger([D.PARTES_T5_ACT2, D.COMPRA_T5_ACT2, D.ALT_TUTORIAL_T5_ACT2, D.ALT_T5_ACT2, D.T5_ACT2.objetivo]);
  const todas = textos.flatMap(cifrasDe);
  assert.ok(todas.length > 60, `se revisaron ${todas.length} cifras`);
  assert.deepEqual([...new Set(todas.filter((c) => !G_CIFRAS.has(c)))], []);
  /* Las cifras de las cuentas cuadran: el libro no descuadra. */
  for (const p of [...PARTES, D.COMPRA_T5_ACT2]) {
    const t = L.totalesDe(p.asiento);
    assert.equal(t.debe, t.haber, p.id);
  }
});

/* ═══════════ «1.725.000» CABE EN EL CAMPO A 320 ═══════════ */

/*
 * Ancho de cada glifo de Sora 700 a 14 px con cifras tabulares (la letra del
 * campo), medido en Chromium 141 con Sora real de Google Fonts el
 * 2026-10-14. Pintados enteros en el mismo navegador: «1.725.000» 73,91 y
 * «12.345.678» 83,36 (los mismos que midió Mai).
 */
const GLIFOS_CIFRA = { 0: 9.47, 1: 9.47, 2: 9.47, 3: 9.47, 4: 9.47, 5: 9.47, 6: 9.47, 7: 9.47, 8: 9.47, 9: 9.47, ".": 3.83, $: 9.47 };
const ancho = (t) => [...t].reduce((s, g) => {
  if (!(g in GLIFOS_CIFRA)) throw new Error(`glifo sin medir: «${g}»`);
  return s + GLIFOS_CIFRA[g];
}, 0);
const px = (v) => Number.parseFloat(v) || 0;
/* A 320: 258 de ancho útil del Panel (medido en b5-t5-a1). */
const UTIL_320 = 258;

/*
 * Calidad 1 (hoja de Mai, 15-oct): la parte de la mesa de la célula va SIN
 * borde y SIN relleno lateral; la separan 16 px de aire. Con relleno, el
 * hueco no deja caber «1.725.000» (con 6 px ya falta 0,03).
 */
test("★★★ «1.725.000», la cifra más larga de las respuestas, cabe en el campo a 320, con la parte sin borde ni relleno lateral", async () => {
  const { caja, desmontar } = await montar({ items: [parte(2)] });
  await armar(caja, parte(2).asiento, false);
  const mesa = caja.querySelector("[data-mesa]");
  const tarjeta = caja.querySelector('[data-en-mesa="Caja"]');
  const campo = caja.querySelector('[data-caja-campo="Caja"]');
  const signo = campo.querySelector("[data-signo]");
  /* El hueco se calcula con los estilos que el componente pinta, desde el Panel: el marco de la parte, la mesa, la tarjeta y el campo. */
  const seccion = caja.querySelector("[data-parte]");
  const phs = px(seccion.style.paddingLeft);
  assert.equal(phs, 0, "la parte, sin relleno lateral");
  assert.equal(seccion.style.border, "", "y sin borde (calidad 1)");
  assert.equal(seccion.style.marginTop, "16px", "16 px de aire con lo de encima");
  const util = UTIL_320 - 2 * phs;
  const columna = (util - px(mesa.style.gap)) / 2;
  const [pv, ph] = tarjeta.style.padding.split(" ").map(px);
  const tarjetaUtil = columna - 2 * ph - 2 * px(tarjeta.style.border);
  const [, phc] = campo.style.padding.split(" ").map(px);
  const hueco = tarjetaUtil - 2 * phc - 2 * px(campo.style.border) - GLIFOS_CIFRA.$ - px(signo.style.marginRight);
  /* La hoja de Mai, sin borde: el hueco del campo mide 80,88 (con borde, 79,88). */
  assert.ok(pv >= 0 && Math.abs(hueco - 80.88) < 1, `hueco ${hueco}`);
  const respuestas = PARTES.flatMap((p) => p.asiento.map((e) => e.valor));
  const mayor = respuestas.map((v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".")).sort((a, b) => ancho(b) - ancho(a))[0];
  assert.equal(mayor, "1.725.000");
  assert.equal(caja.querySelector('[data-campo-cifra="Caja"]').value, "1.725.000", "el campo pinta la cifra con puntos");
  assert.ok(Math.abs(ancho(mayor) - 73.91) < 0.5, "la tabla de glifos mide de verdad");
  assert.ok(ancho(mayor) <= hueco - 5, `«${mayor}» mide ${ancho(mayor).toFixed(2)} y el hueco ${hueco.toFixed(2)}: cabe con al menos 5 px de sobra`);
  desmontar();
});

/* ═══════════ EL TUTORIAL ═══════════ */

test("★★ el ejemplo de la compra: enunciado, sin número de asiento, y sus cuatro líneas al terminar", async () => {
  const { caja, desmontar } = await montar({ Juego: CierreSantaPacha, items: [D.COMPRA_T5_ACT2], modoDemo: true });
  assert.equal(caja.querySelector("[data-hecho]").textContent, G_TUTORIAL.enunciado[0]);
  assert.equal(caja.querySelector("[data-rotulo-parte]"), null, "la compra no lleva número");
  assert.equal(caja.querySelector("[data-libro-diario]"), null, "el ejemplo no lleva diario");
  await armar(caja, D.COMPRA_T5_ACT2.asiento);
  assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent),
    [G_TUTORIAL.linea1[0], G_TUTORIAL.linea2[0], G_TUTORIAL.linea3[0], G_TUTORIAL.linea4[0]]);
  assert.equal(D.ALT_TUTORIAL_T5_ACT2, G_TUTORIAL["alt-tutorial"][0]);
  desmontar();
});

test("★★★ entrega 1: la C7 en dos ramas — con lo recibido, la C7 de siempre; con cualquier otro valor que no sea el costo, la C7-otro", () => {
  for (const [n, recibido, otro] of [[2, 1725000, 1600000], [4, 468750, 450000]]) {
    const p = parte(n);
    const conValor = (v) => p.asiento.map((e) => (e.cuenta === "Inversiones – títulos" ? { ...e, valor: v } : e));
    const a = L.evaluarParteT5Act2(p, conValor(recibido));
    assert.deepEqual([a.error, a.texto], ["C7", p.errores.C7], `parte ${n}: lo recibido`);
    const b = L.evaluarParteT5Act2(p, conValor(otro));
    assert.deepEqual([b.error, b.texto], ["C7-otro", p.errores.C7otro], `parte ${n}: otro valor`);
    assert.ok(GUIA.includes(`C7-otro\t${p.errores.C7otro}`), `parte ${n}: la C7-otro, literal del paquete`);
  }
});
