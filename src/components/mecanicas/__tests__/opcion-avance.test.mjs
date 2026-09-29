import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * La pantalla de preguntas de opción múltiple: la línea de nodos del avance
 * (Pulsos), la opción con su marcador (Opcion) y la regla del coral —solo la
 * respuesta incorrecta— en TODAS las pantallas que usan esas dos piezas.
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { Pulsos, Opcion, MAXIMO_NODOS } = await import("../corazon/juego.jsx");
const { CARD_SHELL } = await import("../../SubjectCard.jsx");
const { FAE } = await import("../../../theme.js");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/* El coral, en las tres formas en que puede acabar en el DOM. */
const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;
const TEAL = /#2a9d8f|rgb\(42,\s*157,\s*143\)/i;

/* ─────────────────────────────── El avance ─────────────────────────────── */

test("avance: nodos unidos por una línea; hechos llenos teal, el actual con anillo, el resto solo contorno", () => {
  const m = montar(React.createElement(Pulsos, { total: 10, hechos: 3, etiqueta: "Ítem" }));
  try {
    const avance = m.caja.querySelector("[data-avance]");
    const nodos = [...avance.querySelectorAll("[data-nodo]")];
    assert.equal(nodos.length, 10);
    assert.deepEqual(nodos.map((n) => n.dataset.nodo), ["hecho", "hecho", "hecho", "actual", ...Array(6).fill("pendiente")]);
    assert.match(nodos[0].style.background, TEAL, "hecho: relleno teal");
    assert.doesNotMatch(nodos[3].style.background, TEAL, "actual: hueco");
    assert.match(nodos[3].style.border, TEAL, "actual: anillo teal");
    assert.ok(nodos[3].style.boxShadow.includes("3px"), "actual: el halo de énfasis");
    assert.doesNotMatch(nodos[5].style.background, TEAL);
    assert.doesNotMatch(nodos[5].style.border, TEAL, "pendiente: contorno neutro");
    /* La línea que los une, y el tramo hecho hasta el actual. */
    const tramo = avance.querySelector("[data-tramo-hecho]");
    assert.ok(tramo, "hay tramo hecho");
    assert.equal(avance.querySelectorAll('[role="progressbar"] > span:not([data-nodo])').length, 2, "la línea de fondo y el tramo hecho: los nodos van unidos");
    assert.ok(tramo.style.width.includes("0.3333"), `el tramo llega al nodo 4 de 10: ${tramo.style.width}`);
    /* El rótulo es parte de la misma pieza, y dice el ítem en curso: el del nodo actual. */
    assert.equal(avance.textContent.trim(), "Ítem 4 de 10");
    const barra = avance.querySelector('[role="progressbar"]');
    assert.equal(barra.getAttribute("aria-valuenow"), "3");
    assert.equal(barra.getAttribute("aria-valuemax"), "10");
    assert.doesNotMatch(m.caja.innerHTML, CORAL, "ni un coral en el avance");
  } finally {
    m.desmontar();
  }
});

test("★ avance: por encima del tope los nodos dejan paso a una barra", () => {
  /*
   * La Mayorizacion pide diecinueve pasos y veinticuatro en su otro set. Con
   * nodos, la fila se salia de un telefono de 375 px y se comia el rotulo. La
   * barra dice lo mismo sin ocupar ancho por paso.
   */
  const m = montar(React.createElement(Pulsos, { total: 24, hechos: 6, etiqueta: "Renglón" }));
  try {
    const avance = m.caja.querySelector("[data-avance]");
    assert.ok(avance.hasAttribute("data-barra"), "con 24 pasos tiene que ser barra");
    assert.equal(avance.querySelectorAll("[data-nodo]").length, 0, "no quedan nodos que contar");
    const tramo = avance.querySelector("[data-tramo-hecho]");
    assert.equal(tramo.style.width, "25%", "seis de veinticuatro es un cuarto");
    /* El rotulo sigue diciendo el numero exacto, que es lo que hace falta. */
    assert.equal(avance.textContent.trim(), "Renglón 7 de 24");
    const barra = avance.querySelector('[role="progressbar"]');
    assert.equal(barra.getAttribute("aria-valuenow"), "6");
    assert.equal(barra.getAttribute("aria-valuemax"), "24");
    assert.doesNotMatch(m.caja.innerHTML, CORAL, "ni un coral en el avance");
  } finally {
    m.desmontar();
  }
});

test("avance: justo en el tope todavia son nodos", () => {
  const m = montar(React.createElement(Pulsos, { total: MAXIMO_NODOS, hechos: 2 }));
  try {
    assert.equal(m.caja.querySelectorAll("[data-nodo]").length, MAXIMO_NODOS);
    assert.equal(m.caja.querySelectorAll("[data-barra]").length, 0);
  } finally {
    m.desmontar();
  }
});

test("avance: al terminar no queda nodo actual, y con uno solo no divide por cero", () => {
  const lleno = montar(React.createElement(Pulsos, { total: 4, hechos: 4 }));
  assert.deepEqual([...lleno.caja.querySelectorAll("[data-nodo]")].map((n) => n.dataset.nodo), ["hecho", "hecho", "hecho", "hecho"]);
  lleno.desmontar();
  const uno = montar(React.createElement(Pulsos, { total: 1, hechos: 0 }));
  assert.ok(!uno.caja.querySelector("[data-tramo-hecho]").style.width.includes("NaN"));
  uno.desmontar();
});

test("★★★ avance: el rótulo dice el ítem en curso — «1 de 5» al empezar, nunca «0 de 5»", () => {
  const texto = (props) => {
    const m = montar(React.createElement(Pulsos, { total: 5, etiqueta: "Situación", ...props }));
    const t = m.caja.querySelector("[data-avance]").textContent.trim();
    m.desmontar();
    return t;
  };
  assert.equal(texto({ hechos: 0 }), "Situación 1 de 5", "la primera pantalla dice 0 de 5");
  assert.equal(texto({ hechos: 5 }), "Situación 5 de 5", "al terminar se pasa del total");
  /* Cerrar un ítem llena su nodo, pero el rótulo sigue en ese ítem: lo dice `enCurso`. */
  assert.equal(texto({ hechos: 1, enCurso: 1 }), "Situación 1 de 5");
  assert.equal(texto({ hechos: 5, enCurso: 5 }), "Situación 5 de 5");
  /* Y la barra sigue contando los terminados. */
  const m = montar(React.createElement(Pulsos, { total: 5, hechos: 0, enCurso: 1 }));
  assert.equal(m.caja.querySelector('[role="progressbar"]').getAttribute("aria-valuenow"), "0");
  m.desmontar();
});

test("★★ avance: toda actividad que suma el ítem cerrado le pasa `enCurso`, para no saltar al siguiente", () => {
  /*
   * Casi todas pasan `hechos={i + (cerrado ? 1 : 0)}`. Sin `enCurso`, al
   * cerrar el primer ítem el rótulo diría «2 de 5» con el primero en
   * pantalla. El Memorama es la excepción: sus parejas no van en orden y
   * cuenta las encontradas, así que usa el valor por defecto.
   */
  const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
  const faltan = [];
  const recorrer = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) { if (f.name !== "__tests__" && f.name !== "node_modules") recorrer(p); continue; }
      if (!p.endsWith(".jsx")) continue;
      for (const m of readFileSync(p, "utf8").matchAll(/<Pulsos [^>]*>/g)) {
        if (/\? 1 : 0\)/.test(m[0]) && !/enCurso=/.test(m[0])) faltan.push(`${p}: ${m[0]}`);
      }
    }
  };
  recorrer(join(raiz, "src"));
  assert.deepEqual(faltan, [], "hay avances que saltan al siguiente ítem al cerrar el actual");
});

/* ─────────────────────────────── La opción ─────────────────────────────── */

function opcion(estado, props = {}) {
  const m = montar(React.createElement(Opcion, { estado, ...props }, "Sube"));
  const boton = m.caja.querySelector("button");
  const marcador = boton.querySelector("[data-marcador]");
  const circulo = marcador.querySelector("circle");
  const html = boton.outerHTML;
  m.desmontar();
  return { boton, marcador, circulo, html };
}

test("opción: la tarjeta del sitio, con marcador hueco mientras se puede elegir", () => {
  const { boton, marcador, circulo, html } = opcion(null);
  assert.equal(boton.style.borderRadius, CARD_SHELL.borderRadius, "el radio de las tarjetas");
  assert.equal(boton.style.background.replace(/\s/g, ""), CARD_SHELL.background.replace(/\s/g, ""), "el fondo de las tarjetas");
  assert.equal(marcador.dataset.marcador, "libre");
  assert.equal(circulo.getAttribute("fill"), "none", "hueco");
  assert.equal(marcador.querySelectorAll("path").length, 0);
  assert.doesNotMatch(html, CORAL);
  assert.doesNotMatch(html, TEAL);
});

test("opción: elegir LLENA el marcador — teal con visto si acierta, coral con aspa si no", () => {
  const bien = opcion("correcta");
  assert.match(bien.circulo.getAttribute("fill"), TEAL);
  assert.equal(bien.marcador.querySelectorAll("path").length, 1, "el visto");
  assert.match(bien.boton.style.border, TEAL);
  assert.doesNotMatch(bien.html, CORAL);

  const mal = opcion("incorrecta");
  assert.match(mal.circulo.getAttribute("fill"), CORAL);
  assert.ok(mal.marcador.querySelector("path").getAttribute("d").includes("M11.8 6.2"), "el aspa");
  assert.match(mal.boton.style.border, CORAL);
  assert.doesNotMatch(mal.html, TEAL);
});

test("opción: la buena que no se eligió va en anillo teal, sin llenar y con «era esta»; la tomada sin veredicto, llena y sin color de estado", () => {
  const revelada = opcion("revelada");
  assert.equal(revelada.circulo.getAttribute("fill"), "none");
  assert.match(revelada.circulo.getAttribute("stroke"), TEAL);
  assert.ok(revelada.boton.textContent.includes("era esta"));
  assert.doesNotMatch(revelada.html, CORAL);

  const elegida = opcion("elegida");
  assert.notEqual(elegida.circulo.getAttribute("fill"), "none");
  assert.doesNotMatch(elegida.html, CORAL);
  assert.doesNotMatch(elegida.html, TEAL);
});

/* ─────────────────────────── Las pantallas ─────────────────────────── */

/* Las 36 actividades que usan el avance o la opción compartidos —con el Repaso Diario, 37 pantallas—: la lista del reporte. */
const PANTALLAS = [
  ["bloques/cimientos.jsx", ["MemoramaTesoro", "MemoramaCorazon", "MemoramaTesoreria", "QueRamaEs", "CualComponente", "CobraGastaOPide"]],
  ["bloques/avanzados.jsx", ["SeAcerca", "ExpedienteGabinete", "ConsejoMinistros", "QuienBeneficiaAuge", "QuienAfectaAjuste"]],
  ["maquinas/actividades.jsx", [
    "MemoramaBancoCentral", "QuienDecideEsto", "VolanteDeLaTasa", "CajaDeHerramientas", "AQuienLePegaLaTasa", "CadenaDeTransmision",
    "CorrienteDeDecisiones", "ElRezago", "DilemaBanqueroCentral", "DueloDeInstrumentos", "DisenaRespuestaMonetaria",
  ]],
  ["corazon/BancoTransfusiones.jsx", ["default"]], ["corazon/Biopsia.jsx", ["default"]], ["corazon/Cirugia.jsx", ["default"]],
  ["corazon/Electrocardiograma.jsx", ["default"]], ["corazon/SalaMonitores.jsx", ["default"]], ["corazon/Termometro.jsx", ["default"]],
  ["corazon/Triage.jsx", ["default"]],
  ["tesoreria/AgujeroFiscal.jsx", ["default"]], ["tesoreria/ClasificadorTesoro.jsx", ["default"]], ["tesoreria/DeficitVsDeuda.jsx", ["default"]],
  ["tesoreria/DirectosIndirectos.jsx", ["default"]], ["tesoreria/DisenaPresupuesto.jsx", ["default"]],
  ["tesoreria/ExpansivaContractiva.jsx", ["default"]], ["tesoreria/FlujoDeCaja.jsx", ["default"]],
];

test("antes de responder, ninguna de las pantallas enseña coral: ni marcos, ni rótulos, ni bandejas, ni líneas", async () => {
  let n = 0;
  for (const [ruta, nombres] of PANTALLAS) {
    const modulo = await import(`../${ruta}`);
    for (const nombre of nombres) {
      const m = montar(React.createElement(modulo[nombre], { onCompletar: () => {} }));
      try {
        const html = m.caja.innerHTML;
        const trozo = html.match(CORAL);
        assert.equal(trozo, null, `${ruta} · ${nombre}: coral antes de responder, cerca de «${trozo ? html.slice(Math.max(0, trozo.index - 120), trozo.index + 20) : ""}»`);
        n++;
      } finally {
        m.desmontar();
      }
    }
  }
  assert.equal(n, 36);
});

test("ninguna pantalla lleva su propia copia del avance o de la opción", () => {
  const raiz = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  const archivos = [];
  const recorrer = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== "__tests__") recorrer(p); }
      else if (f.endsWith(".jsx")) archivos.push(p);
    }
  };
  recorrer(raiz);
  const copias = archivos.filter((p) => !p.endsWith(join("corazon", "juego.jsx")) && /function (Pulsos|Opcion)\b/.test(readFileSync(p, "utf8")));
  assert.deepEqual(copias, []);
});

test("Repaso Diario: después de fallar, el coral está SOLO en la opción incorrecta y en su devolución", async () => {
  const { default: PartidaRepaso } = await import("../../repaso/PartidaRepaso.jsx");
  const { POOL } = await import("../../../repaso/items.js");
  const item = POOL.find((x) => x.clave === "sala-monitores:hospital");
  const m = montar(React.createElement(PartidaRepaso, { items: [item], historial: new Map(), onTerminar: () => {} }));
  try {
    assert.doesNotMatch(m.caja.innerHTML, CORAL, "antes de responder, nada");
    const mala = [...m.caja.querySelectorAll("button")].find((b) => b.textContent.includes("Inversión"));
    act(() => { mala.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

    const conCoral = [...m.caja.querySelectorAll("*")].filter((el) =>
      CORAL.test(el.getAttribute("style") ?? "") || CORAL.test(el.getAttribute("fill") ?? "") || CORAL.test(el.getAttribute("stroke") ?? ""));
    assert.ok(conCoral.length > 0);
    for (const el of conCoral) {
      const enLaIncorrecta = el.closest('[data-estado="incorrecta"]');
      const enLaDevolucion = el.closest('p[role="status"]')?.textContent.includes("Incorrecto");
      assert.ok(enLaIncorrecta || enLaDevolucion, `coral fuera del error: <${el.tagName.toLowerCase()}> ${el.textContent.slice(0, 40)}`);
    }
    /* Y la explicación va junto al veredicto. */
    assert.ok(m.caja.querySelector('p[role="status"]').textContent.includes("Esto afecta Gasto público, no Inversión."));
    assert.equal(m.caja.querySelectorAll('[data-estado="revelada"]').length, 1, "la buena, señalada en teal");
  } finally {
    m.desmontar();
  }
});

test("ningún marco ni rótulo de estas pantallas declara un acento coral, tampoco en rondas que no salen al montar", () => {
  /*
   * El render de arriba solo ve la primera ronda. El Banco de transfusiones,
   * por ejemplo, cambia de acento en la ronda sin ayuda: eso solo lo ve el código.
   */
  const archivos = [
    ...new Set(PANTALLAS.map(([ruta]) => ruta)),
    "bloques/CasoUnico.jsx", "bloques/DuelosRanking.jsx", "bloques/Memorama.jsx", "bloques/PrimeraClasificacion.jsx",
    "bloques/RolDeActores.jsx", "bloques/SeAcercaOSeAleja.jsx", "maquinas/CasillasEnOrden.jsx", "maquinas/LineaDeTiempo.jsx",
    "maquinas/PrediccionTasa.jsx", "../repaso/PartidaRepaso.jsx",
  ];
  const culpables = archivos.filter((ruta) =>
    /acento=\{[^}]*(FAE\.coral|#E76F51)/i.test(readFileSync(new URL(`../${ruta}`, import.meta.url), "utf8")));
  assert.deepEqual(culpables, []);
});

test("las columnas de opciones no bajan de 170 px, pida lo que pida la pantalla", async () => {
  const { Opciones, ANCHO_MINIMO_OPCION } = await import("../corazon/juego.jsx");
  assert.equal(ANCHO_MINIMO_OPCION, 170);
  for (const [pedida, esperada] of [
    ["repeat(auto-fit, minmax(140px, 1fr))", "repeat(auto-fit, minmax(170px, 1fr))"],
    ["repeat(auto-fit, minmax(150px, 1fr))", "repeat(auto-fit, minmax(170px, 1fr))"],
    ["repeat(auto-fit, minmax(240px, 1fr))", "repeat(auto-fit, minmax(240px, 1fr))"],
    ["1fr", "1fr"],
  ]) {
    const m = montar(React.createElement(Opciones, { columnas: pedida }, React.createElement("span")));
    assert.equal(m.caja.firstChild.style.gridTemplateColumns, esperada, pedida);
    m.desmontar();
  }
});
