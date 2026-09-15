/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS QUINCE DE LA 0030, JUGADOS DE PRINCIPIO A FIN — con un fallo a propósito.
 *
 * El mono de unicidad-partida.test.mjs prueba que ninguna partida repite un
 * ítem, pero juega al azar: no dice si el PORCENTAJE que sale es el que debe.
 * Esto juega cada actividad sabiendo las respuestas, falla UNA a propósito y
 * comprueba tres cosas:
 *
 *   · el porcentaje exacto, sin redondeos intermedios (5/6 viaja como
 *     83,333…, no como 83: el motor redondea una sola vez, al final);
 *   · que el fallo quedó en su fila del detalle, y solo él;
 *   · que ningún ítem sale dos veces.
 *
 * Las respuestas se leen de los mismos bancos que usa la actividad, y lo que
 * está en pantalla se reconoce por su texto: si el orden se baraja distinto,
 * la prueba sigue sabiendo qué tiene delante.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

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
/* El volteo del Memorama espera 900 ms: ese reloj lo mueve la prueba. */
mock.timers.enable({ apis: ["setTimeout"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const C = await import("../../components/mecanicas/bloques/cimientos.jsx");
const A = await import("../../components/mecanicas/bloques/avanzados.jsx");
const { VOLTEO_MS } = await import("../../components/mecanicas/bloques/Memorama.jsx");
const { MEMORAMAS, CLASIFICACIONES, retroClasificacion } = await import("../../data/cimientos.js");
const { DEUDA_VS_SERVICIO, porcentaje } = await import("../../data/politicaFiscal.js");
const B = await import("../../data/bloquesAvanzados.js");

/* ───────────────────────────────── ayudas ───────────────────────────────── */

function montar(Componente) {
  const fin = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Componente, { onCompletar: (pct, ms, detalle) => fin.push({ pct, ms, detalle }) })));
  return { caja, fin, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el, que) => {
  assert.ok(el, `no está en pantalla: ${que}`);
  assert.ok(!el.disabled, `está deshabilitado: ${que}`);
  act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const botones = (caja) => [...caja.querySelectorAll("button")];
const exacto = (caja, texto) => botones(caja).find((b) => b.textContent.trim() === texto);
const contiene = (caja, texto) => botones(caja).find((b) => !b.disabled && b.textContent.includes(texto));
const AVANCES = ["Siguiente", "Ver resultado", "Siguiente ronda", "Siguiente duelo", "Ver el orden"];
const avanzar = (caja) => click(botones(caja).find((b) => AVANCES.includes(b.textContent.trim())), "el botón de avanzar");
const retroVisible = (caja) => caja.querySelector('p[role="status"]')?.textContent ?? "";

/** Lo que valen todas las partidas: una sola, ítems sin repetir, porcentaje exacto. */
function cerrada(m, pctEsperado, filas) {
  assert.equal(m.fin.length, 1, "la partida avisa de que terminó una sola vez");
  const { pct, detalle } = m.fin[0];
  assert.equal(pct, pctEsperado, `porcentaje: salió ${pct}, se esperaba ${pctEsperado}`);
  assert.equal(detalle.length, filas, `${filas} filas de detalle`);
  assert.equal(new Set(detalle.map((f) => f.item)).size, detalle.length, "ningún ítem repetido");
  return detalle;
}

/* ─────────────────────────────── Memoramas ─────────────────────────────── */

const MEMORAMAS_UI = [
  ["memorama-tesoro", C.MemoramaTesoro],
  ["memorama-corazon", C.MemoramaCorazon],
  ["memorama-tesoreria", C.MemoramaTesoreria],
];

function cartaDe(caja, par, lado) {
  const texto = lado === "t" ? par.termino : par.definicion;
  return [...caja.querySelectorAll(".fae-mm-carta")].find(
    (b) => b.querySelector(".fae-mm-frente").textContent.replace("✓", "").trim() === texto,
  );
}
const esperarVolteo = () => act(() => { mock.timers.tick(VOLTEO_MS); });

for (const [id, Memorama] of MEMORAMAS_UI) {
  test(`${id}: un fallo a ciegas no cuenta; una confusión informada sí, en las dos parejas`, () => {
    const pares = MEMORAMAS[id].pares;
    const [p0, p1, p2] = pares;
    const m = montar(Memorama);
    try {
      /* Turno 1, A CIEGAS: la definición de p1 no se había visto nunca. */
      click(cartaDe(m.caja, p0, "t"), `${p0.id}:t`);
      click(cartaDe(m.caja, p1, "d"), `${p1.id}:d`);
      esperarVolteo();
      /* Turno 2, EL FALLO A PROPÓSITO: la definición de p1 ya se vio, y se elige para p2. */
      click(cartaDe(m.caja, p2, "t"), `${p2.id}:t`);
      click(cartaDe(m.caja, p1, "d"), `${p1.id}:d`);
      esperarVolteo();
      /* Y todas las parejas, bien. */
      for (const p of pares) {
        click(cartaDe(m.caja, p, "t"), `${p.id}:t`);
        click(cartaDe(m.caja, p, "d"), `${p.id}:d`);
      }

      const detalle = cerrada(m, porcentaje(pares.length - 2, pares.length), pares.length);
      const fila = (x) => detalle.find((f) => f.item === x.id);
      assert.deepEqual({ ok: fila(p0).ok, intentos: fila(p0).intentos }, { ok: true, intentos: 1 }, "el fallo a ciegas no cuenta");
      assert.deepEqual({ ok: fila(p1).ok, intentos: fila(p1).intentos, respuesta: fila(p1).respuesta }, { ok: false, intentos: 2, respuesta: p2.id });
      assert.deepEqual({ ok: fila(p2).ok, intentos: fila(p2).intentos, respuesta: fila(p2).respuesta }, { ok: false, intentos: 2, respuesta: p1.id });
      assert.equal(detalle.filter((f) => !f.ok).length, 2, "solo las dos parejas confundidas");
      assert.ok(m.caja.textContent.includes("TODAS LAS PAREJAS"), "el cierre enseña las parejas juntas");
    } finally {
      m.desmontar();
    }
  });
}

test("memorama-tesoreria: sin confusiones, 100; y dos toques seguidos durante el volteo no cuentan", () => {
  const pares = MEMORAMAS["memorama-tesoreria"].pares;
  const m = montar(C.MemoramaTesoreria);
  try {
    click(cartaDe(m.caja, pares[0], "t"), "t0");
    click(cartaDe(m.caja, pares[1], "t"), "t1");
    /* Con dos cartas arriba, un tercer toque antes de que vuelvan no hace nada. */
    act(() => { cartaDe(m.caja, pares[2], "t").dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    esperarVolteo();
    for (const p of pares) {
      click(cartaDe(m.caja, p, "t"), `${p.id}:t`);
      click(cartaDe(m.caja, p, "d"), `${p.id}:d`);
    }
    const detalle = cerrada(m, 100, 3);
    assert.ok(detalle.every((f) => f.ok && f.intentos === 1));
  } finally {
    m.desmontar();
  }
});

/* ──────────────────────────── Primera clasificación ──────────────────────────── */

const CLASIFICACIONES_UI = [
  ["que-rama-es", C.QueRamaEs],
  ["cual-componente", C.CualComponente],
  ["cobra-gasta-o-pide", C.CobraGastaOPide],
];

for (const [id, Clasificacion] of CLASIFICACIONES_UI) {
  test(`${id}: seis de ocho, uno fallado a propósito — 5/6 exacto`, () => {
    const banco = CLASIFICACIONES[id];
    const nombre = (c) => banco.categorias.find((x) => x.id === c).nombre;
    const m = montar(Clasificacion);
    try {
      const vistos = [];
      for (let n = 0; n < 6; n++) {
        const item = banco.items.find((x) => m.caja.textContent.includes(x.texto));
        assert.ok(item, `no hay enunciado en pantalla en la vuelta ${n + 1}`);
        vistos.push(item.id);
        const elegida = n === 0 ? banco.categorias.find((c) => c.id !== item.respuesta).id : item.respuesta;
        click(exacto(m.caja, nombre(elegida)), nombre(elegida));
        const retro = retroVisible(m.caja);
        assert.ok(retro.includes(n === 0 ? "❌" : "✅"), `vuelta ${n + 1}: ${retro}`);
        avanzar(m.caja);
      }
      const detalle = cerrada(m, porcentaje(5, 6), 6);
      assert.deepEqual(detalle.map((f) => f.item), vistos, "una fila por enunciado, en el orden visto");
      assert.deepEqual(detalle.filter((f) => !f.ok).map((f) => f.item), [vistos[0]]);
      assert.notEqual(detalle[0].respuesta, null, "el fallo guarda la categoría elegida");
    } finally {
      m.desmontar();
    }
  });
}

test("cobra-gasta-o-pide: los intereses de la deuda vieja enseñan la distinción deuda/servicio, se acierte o se falle", () => {
  const banco = CLASIFICACIONES["cobra-gasta-o-pide"];
  const item = banco.items.find((x) => x.id === "intereses-deuda-vieja");
  const bien = retroClasificacion(banco, item, "gasta");
  const mal = retroClasificacion(banco, item, "pide");
  assert.ok(bien.startsWith("✅") && bien.includes(DEUDA_VS_SERVICIO));
  assert.ok(mal.startsWith("❌ Esto es Gasta (Gasto del Gobierno), no Pide prestado (Deuda Pública).") && mal.includes(DEUDA_VS_SERVICIO));
  /* Los otros siete llevan la plantilla sola. */
  assert.equal(retroClasificacion(banco, banco.items[0], "cobra"), "✅ Cobra (Tributación) — bien identificado.");
});

/* ─────────────────────────── ¿Se acerca o se aleja? ─────────────────────────── */

test("se-acerca-o-se-aleja: seis filas, una fallada a propósito — 5/6 exacto, y la razón escrita en el acierto", () => {
  const m = montar(A.SeAcerca);
  try {
    for (let n = 0; n < 6; n++) {
      const fila = B.CAMBIOS_ACERCA.find((f) => m.caja.textContent.includes(f.cambio));
      assert.ok(fila, `vuelta ${n + 1}`);
      const buena = B.OPCIONES_ACERCA.find((o) => o.id === fila.correcta).nombre;
      const mala = B.OPCIONES_ACERCA.find((o) => o.id !== fila.correcta).nombre;
      click(contiene(m.caja, n === 0 ? mala : buena), "opción");
      const retro = retroVisible(m.caja);
      if (n === 0) assert.ok(retro.includes("Revisa la relación"), retro);
      else assert.ok(retro.includes(fila.razon), retro);
      avanzar(m.caja);
    }
    const detalle = cerrada(m, porcentaje(5, 6), 6);
    assert.equal(detalle.filter((f) => !f.ok).length, 1);
  } finally {
    m.desmontar();
  }
});

/* ─────────────────────────── El expediente del gabinete ─────────────────────────── */

test("expediente-gabinete: todo o nada — «Sube» da 0, «No se puede saber» da 100", () => {
  for (const [texto, pct] of [["Sube", 0], ["No se puede saber con certeza sin más datos", 100]]) {
    const m = montar(A.ExpedienteGabinete);
    try {
      click(exacto(m.caja, texto), texto);
      const [fila] = cerrada(m, pct, 1);
      assert.deepEqual(fila, { item: "gasto-mas-impuestos", ok: pct === 100, intentos: 1, respuesta: pct ? "no-se-sabe" : "sube", orden: 1 });
      /* Un segundo toque no vuelve a registrar. */
      assert.ok(botones(m.caja).filter((b) => B.CASO_GABINETE.opciones.some((o) => b.textContent.includes(o.texto))).every((b) => b.disabled));
    } finally {
      m.desmontar();
    }
  }
});

/* ─────────────────────────── El consejo de ministros ─────────────────────────── */

test("consejo-ministros: tres duelos, uno perdido a propósito — 2/3 exacto, y el orden B > A > C al final", () => {
  const { medidas, duelos } = B.CASO_CONSEJO;
  const m = montar(A.ConsejoMinistros);
  try {
    for (let n = 0; n < 3; n++) {
      const letras = Object.keys(medidas).filter((x) => exacto(m.caja, `${x.toUpperCase()} · ${medidas[x]}`));
      const d = duelos.find((x) => x.par.every((l) => letras.includes(l)));
      assert.ok(d, `vuelta ${n + 1}: ${letras}`);
      const elegida = n === 0 ? d.par.find((l) => l !== d.gana) : d.gana;
      click(exacto(m.caja, `${elegida.toUpperCase()} · ${medidas[elegida]}`), elegida);
      assert.ok(retroVisible(m.caja).includes(d.argumento));
      avanzar(m.caja);
    }
    const detalle = cerrada(m, porcentaje(2, 3), 3);
    assert.equal(detalle.filter((f) => !f.ok).length, 1);
    const orden = [...m.caja.querySelectorAll("ol li")].map((li) => li.textContent.slice(0, 1));
    assert.deepEqual(orden, ["B", "A", "C"]);
  } finally {
    m.desmontar();
  }
});

/* ──────────────────────── Reparto de actores (DA y PF) ──────────────────────── */

for (const [id, Reparto, rondas] of [
  ["quien-beneficia-auge", A.QuienBeneficiaAuge, B.RONDAS_AUGE],
  ["quien-afecta-ajuste", A.QuienAfectaAjuste, B.RONDAS_AJUSTE],
]) {
  test(`${id}: doce personajes, uno fallado a propósito — 11/12 exacto; las zonas no cuentan cuántos van`, () => {
    const m = montar(Reparto);
    const zona = (z) => m.caja.querySelector(`button[aria-label="Clasificar en ${z === "gana" ? "GANA" : "PIERDE"}"]`);
    try {
      rondas.forEach((r, k) => {
        r.personajes.forEach((p, j) => {
          click(m.caja.querySelector(`button[aria-label="Elegir ${p.nombre}"]`), p.nombre);
          /* Ni un número en las zonas: con tres PIERDE y un GANA, un cupo regalaría la respuesta. */
          for (const z of ["gana", "pierde"]) assert.ok(!/\d/.test(zona(z).textContent), `${r.id}: la zona ${z} enseña un número`);
          const elegida = k === 0 && j === 0 ? (p.resultado === "gana" ? "pierde" : "gana") : p.resultado;
          click(zona(elegida), elegida);
        });
        avanzar(m.caja);
      });
      const detalle = cerrada(m, porcentaje(11, 12), 12);
      const primero = `${rondas[0].id}:${rondas[0].personajes[0].id}`;
      assert.deepEqual(detalle.filter((f) => !f.ok).map((f) => f.item), [primero]);
      assert.ok(detalle.every((f) => f.item.includes(":")), "todos con su prefijo de ronda");
    } finally {
      m.desmontar();
    }
  });
}

/* ─────────────────────────── Explícaselo (DA y PF) ─────────────────────────── */

for (const [id, Explica, escenario] of [
  ["explica-paciente", A.ExplicaPaciente, B.EXPLICA_PACIENTE],
  ["explica-contribuyente", A.ExplicaContribuyente, B.EXPLICA_CONTRIBUYENTE],
]) {
  test(`${id}: tres claras y una de jerga — (3 − 0,5) / 4 = 62,5`, () => {
    const claras = escenario.fragmentos.filter((f) => f.tipo === "correcto").slice(0, 3);
    const jerga = escenario.fragmentos.find((f) => f.tipo === "jerga");
    const m = montar(Explica);
    try {
      /* Una falsa que se pone y se quita no cuenta: cuenta lo que queda. */
      const falsa = escenario.fragmentos.find((f) => f.tipo === "incorrecto");
      click(contiene(m.caja, falsa.texto), "falsa");
      click(contiene(m.caja, falsa.texto), "quitar la falsa");
      for (const f of [...claras, jerga]) click(contiene(m.caja, f.texto), f.id);
      click(exacto(m.caja, "Explicar"), "Explicar");
      const detalle = cerrada(m, 62.5, 4);
      assert.deepEqual(detalle.map((f) => f.item), [...claras, jerga].map((f) => f.id), "en el orden en que se dijeron");
      assert.deepEqual(detalle.map((f) => f.respuesta), ["correcto", "correcto", "correcto", "jerga"]);
      assert.deepEqual(detalle.map((f) => f.ok), [true, true, true, false]);
    } finally {
      m.desmontar();
    }
  });
}

/* ─────────────────────── Frontera de señales (DA y PF) ─────────────────────── */

for (const [id, Frontera, banco] of [
  ["sala-espera-llena", A.SalaEsperaLlena, B.SALA_ESPERA],
  ["comite-presupuesto", A.ComitePresupuesto, B.COMITE_PRESUPUESTO],
]) {
  test(`${id}: los cinco relevantes y un señuelo — (5 − 0,3) / 5, sin redondear`, () => {
    const senuelo = banco.senuelos[0];
    const m = montar(Frontera);
    try {
      for (const d of [...banco.relevantes, senuelo]) click(contiene(m.caja, d.texto), d.id);
      click(exacto(m.caja, "Confirmar"), "Confirmar");
      const detalle = cerrada(m, ((5 - 0.3) / 5) * 100, 14);
      assert.deepEqual(detalle.filter((f) => !f.ok).map((f) => f.item), [senuelo.id], "solo el señuelo elegido está mal");
      assert.equal(detalle.find((f) => f.item === senuelo.id).respuesta, "elegido");
      assert.equal(detalle.filter((f) => f.respuesta === "descartado").length, 8, "los otros ocho señuelos, bien descartados");
      assert.ok(m.caja.textContent.includes(senuelo.porque), "el porqué del señuelo sale al confirmar");
    } finally {
      m.desmontar();
    }
  });
}

test("las puntuaciones de protégé y frontera no bajan de 0 ni pasan de 100", () => {
  assert.equal(B.puntuarExplicacion(0, 4), 0);
  assert.equal(B.puntuarExplicacion(4, 0), 100);
  assert.equal(B.puntuarFrontera(0, 9), 0);
  assert.equal(B.puntuarFrontera(5, 0), 100);
  /* La misma cuenta, en el mismo orden: 5 − 2,7 no es 5 − 0,3 × 9 en coma flotante. */
  assert.equal(B.puntuarFrontera(5, 9), ((5 - 0.3 * 9) / 5) * 100);
  assert.equal(Math.round(B.puntuarFrontera(5, 9)), 46, "y el servidor, que redondea una vez, guarda 46");
});
