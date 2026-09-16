/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA — las doce actividades jugadas de principio a fin, con un
 * fallo a propósito en cada una.
 *
 * Se comprueba, por actividad: el porcentaje exacto de su fórmula (sin
 * redondeos intermedios), que el fallo quedó en su fila del detalle, que
 * ningún ítem sale dos veces y que la devolución que se ve es la de la ficha.
 * Lo que está en pantalla se reconoce por su texto: el sorteo puede cambiar
 * y la prueba sigue sabiendo qué tiene delante.
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
mock.timers.enable({ apis: ["setTimeout", "setInterval"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const PM = await import("../../components/mecanicas/maquinas/actividades.jsx");
const { VOLTEO_MS } = await import("../../components/mecanicas/bloques/Memorama.jsx");
const D = await import("../../data/politicaMonetaria.js");
const { porcentaje } = await import("../../data/politicaFiscal.js");

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
const avanzar = (caja) => click(botones(caja).find((b) => AVANCES.includes(b.textContent.trim())), "avanzar");
const retroVisible = (caja) => caja.querySelector('p[role="status"]')?.textContent ?? "";
/*
 * Retro antepone un texto oculto («Correcto: ») y pinta el emoji en su propio
 * elemento, pegado al resto: la comparación normaliza las dos cosas, en el
 * texto visible Y en el esperado.
 */
const normal = (t) => String(t ?? "").replace(/^(Correcto|Incorrecto): /, "").replace(/^(✅|❌)\s*/, "$1");
const retroLimpia = (caja) => normal(retroVisible(caja));

function cerrada(m, pctEsperado, filas) {
  assert.equal(m.fin.length, 1, "la partida avisa una sola vez");
  const { pct, detalle } = m.fin[0];
  assert.equal(pct, pctEsperado, `porcentaje: salió ${pct}, se esperaba ${pctEsperado}`);
  assert.equal(detalle.length, filas, `${filas} filas de detalle`);
  assert.equal(new Set(detalle.map((f) => f.item)).size, detalle.length, "ningún ítem repetido");
  return detalle;
}

/* ───────────── PM-1 ───────────── */

test("PM-1 memorama-banco-central: una confusión informada entre dos parejas — 3/5", () => {
  const pares = D.MEMORAMA_BANCO_CENTRAL.pares;
  const carta = (caja, p, lado) => [...caja.querySelectorAll(".fae-mm-carta")].find(
    (b) => b.querySelector(".fae-mm-frente").textContent.replace("✓", "").trim() === (lado === "t" ? p.termino : p.definicion),
  );
  const m = montar(PM.MemoramaBancoCentral);
  const volteo = () => act(() => { mock.timers.tick(VOLTEO_MS); });
  try {
    const [p0, p1, p2] = pares;
    click(carta(m.caja, p0, "t"), "t0"); click(carta(m.caja, p1, "d"), "d1"); volteo();
    click(carta(m.caja, p2, "t"), "t2"); click(carta(m.caja, p1, "d"), "d1 otra vez"); volteo();
    for (const p of pares) { click(carta(m.caja, p, "t"), p.id); click(carta(m.caja, p, "d"), p.id); }
    const detalle = cerrada(m, porcentaje(3, 5), 5);
    assert.deepEqual(detalle.filter((f) => !f.ok).map((f) => f.item).sort(), [p1.id, p2.id].sort());
  } finally { m.desmontar(); }
});

/* ───────────── PM-2 ───────────── */

test("PM-2 quien-decide-esto: seis de diez, uno fallado — 5/6, con la devolución de la ficha", () => {
  const b = D.QUIEN_DECIDE;
  const m = montar(PM.QuienDecideEsto);
  try {
    for (let n = 0; n < 6; n++) {
      const item = b.items.find((x) => m.caja.textContent.includes(x.texto));
      const elegida = n === 0 ? b.categorias.find((c) => c.id !== item.respuesta).id : item.respuesta;
      click(exacto(m.caja, b.categorias.find((c) => c.id === elegida).nombre), elegida);
      assert.equal(retroLimpia(m.caja), normal(b.retro(item, elegida)));
      if (n === 0) {
        assert.ok(retroLimpia(m.caja).startsWith(normal(item.respuesta === "banrep" ? "❌ Esto lo decide el Banco de la República" : "❌ Esto lo decide el gobierno")));
      }
      avanzar(m.caja);
    }
    const detalle = cerrada(m, porcentaje(5, 6), 6);
    assert.equal(detalle.filter((f) => !f.ok).length, 1);
  } finally { m.desmontar(); }
});

/* ───────────── PM-3 ───────────── */

test("PM-3 volante-de-la-tasa: ocho de doce, uno fallado — 7/8 = 87,5; el error dice la regla base", () => {
  const b = D.VOLANTE_DE_LA_TASA;
  const m = montar(PM.VolanteDeLaTasa);
  try {
    for (let n = 0; n < 8; n++) {
      const fila = b.escenarios.find((x) => m.caja.textContent.includes(x.texto));
      assert.ok(fila, `vuelta ${n + 1}`);
      const buena = fila.correcta === "subir" ? "Subir" : "Bajar";
      const mala = fila.correcta === "subir" ? "Bajar" : "Subir";
      click(exacto(m.caja, n === 0 ? mala : buena), "opción");
      assert.equal(retroLimpia(m.caja), normal(n === 0 ? b.error : fila.retro));
      avanzar(m.caja);
    }
    cerrada(m, 87.5, 8);
  } finally { m.desmontar(); }
});

/* ───────────── PM-4 ───────────── */

test("PM-4 caja-de-herramientas: ocho de doce, uno fallado — 7/8; las cifras simuladas llevan su rótulo", () => {
  const b = D.CAJA_DE_HERRAMIENTAS;
  const m = montar(PM.CajaDeHerramientas);
  try {
    for (let n = 0; n < 8; n++) {
      const item = b.items.find((x) => m.caja.textContent.includes(x.texto));
      assert.equal(Boolean(m.caja.querySelector("[data-rotulo-escenario]")), Boolean(item.simulado), `${item.id}: rótulo de escenario`);
      const elegida = n === 0 ? b.categorias.find((c) => c.id !== item.respuesta).id : item.respuesta;
      click(exacto(m.caja, b.categorias.find((c) => c.id === elegida).nombre), elegida);
      assert.equal(retroLimpia(m.caja), normal(b.retro(item, elegida)));
      avanzar(m.caja);
    }
    cerrada(m, 87.5, 8);
    assert.match(b.retro(b.items[0], "encaje"), /^❌ Esto es Tasa de intervención, no Encaje bancario\. Pista: /);
  } finally { m.desmontar(); }
});

/* ───────────── PM-5 ───────────── */

test("PM-5 a-quien-le-pega-la-tasa: doce personajes, uno fallado — 11/12; rótulos real y simulado", () => {
  const b = D.A_QUIEN_LE_PEGA;
  const m = montar(PM.AQuienLePegaLaTasa);
  const zona = (z) => m.caja.querySelector(`button[aria-label="Clasificar en ${z === "gana" ? "GANA" : "PIERDE"}"]`);
  try {
    b.rondas.forEach((r, k) => {
      assert.ok(m.caja.textContent.includes(r.etiqueta), `ronda ${k + 1}: «${r.etiqueta}»`);
      r.personajes.forEach((p, j) => {
        click(m.caja.querySelector(`button[aria-label="Elegir ${p.nombre}"]`), p.nombre);
        const fallo = k === 0 && j === 0;
        click(zona(fallo ? (p.resultado === "gana" ? "pierde" : "gana") : p.resultado), "zona");
        if (fallo) assert.equal(retroLimpia(m.caja), normal(b.retro(p, p.resultado === "gana" ? "pierde" : "gana")));
        else assert.equal(retroVisible(m.caja), "", "al acertar no sale ninguna línea inventada");
      });
      avanzar(m.caja);
    });
    const detalle = cerrada(m, porcentaje(11, 12), 12);
    assert.equal(detalle.filter((f) => !f.ok).length, 1);
    assert.equal(
      b.retro(b.rondas[0].personajes[0], "gana"),
      "❌ Revise el efecto real sobre su situación: Persona con crédito hipotecario a tasa variable pierde porque su cuota mensual sube cuando el banco ajusta la tasa.",
    );
  } finally { m.desmontar(); }
});

/* ───────────── PM-6 ───────────── */

test("PM-6 cadena-de-transmision: un señuelo (−5) y un eslabón fuera de orden (sin castigo) — 95", () => {
  const m = montar(PM.CadenaDeTransmision);
  try {
    const cadena = D.CADENAS_TRANSMISION.cadenas.find((c) => m.caja.textContent.includes(c.titulo));
    assert.ok(cadena, "se ve qué cadena se arma");
    const [, ...resto] = cadena.eslabones;
    const otros = D.CADENAS_TRANSMISION.cadenas.filter((c) => c.id !== cadena.id);
    const senuelo = otros.flatMap((c) => c.eslabones.slice(1).map((e) => ({ e, c }))).find(({ e }) => contiene(m.caja, e.texto));
    assert.ok(senuelo, "hay señuelos de las otras cadenas");
    assert.equal(botones(m.caja).filter((b) => [...otros.flatMap((c) => c.eslabones), ...resto].some((e) => b.textContent.trim() === e.texto)).length, 9, "4 buenas + 5 señuelos");

    click(contiene(m.caja, senuelo.e.texto), "señuelo");
    assert.equal(retroLimpia(m.caja), normal(`❌ Este eslabón es real, pero pertenece al canal ${senuelo.c.canal}, no al que está armando.`));
    click(contiene(m.caja, resto[2].texto), "eslabón 4 antes de tiempo");
    assert.equal(retroLimpia(m.caja), normal(D.CADENAS_TRANSMISION.retroOrden));
    for (const e of resto) {
      click(contiene(m.caja, e.texto), e.id);
      assert.equal(retroLimpia(m.caja), normal(e.retro));
    }
    const detalle = cerrada(m, 95, 4);
    assert.deepEqual(
      { ok: detalle[0].ok, intentos: detalle[0].intentos, respuesta: detalle[0].respuesta },
      { ok: false, intentos: 3, respuesta: senuelo.e.id },
    );
    assert.ok(detalle.slice(1).every((f) => f.ok));
  } finally { m.desmontar(); }
});

/* ───────────── PM-7 ───────────── */

test("PM-7 explicaselo-a-un-deudor: hasta 4 — dos claras y una jerga = (2 − 0,5) / 4 = 37,5", () => {
  const m = montar(PM.ExplicaseloADeudor);
  try {
    const esc = D.EXPLICA_DEUDOR.escenarios.find((e) => m.caja.textContent.includes(e.enunciado));
    const claras = esc.fragmentos.filter((f) => f.tipo === "correcto").slice(0, 2);
    const jerga = esc.fragmentos.find((f) => f.tipo === "jerga");
    click(contiene(m.caja, claras[0].texto), "primera");
    assert.ok(exacto(m.caja, "Explicar") && !exacto(m.caja, "Explicar").disabled, "con una ya se puede explicar");
    click(contiene(m.caja, claras[1].texto), "segunda");
    click(contiene(m.caja, jerga.texto), "jerga");
    click(exacto(m.caja, "Explicar"), "Explicar");
    const detalle = cerrada(m, 37.5, 3);
    assert.deepEqual(detalle.map((f) => f.respuesta), ["correcto", "correcto", "jerga"]);
    for (const f of [...claras, jerga]) assert.ok(m.caja.textContent.includes(f.retro), `devolución de ${f.id}`);
  } finally { m.desmontar(); }
});

/* ───────────── PM-8 ───────────── */

test("PM-8 corriente-de-decisiones: doce de veinte, uno fallado — 11/12; cada enunciado entra cayendo", () => {
  const b = D.CORRIENTE_DECISIONES;
  const m = montar(PM.CorrienteDeDecisiones);
  try {
    for (let n = 0; n < 12; n++) {
      const item = b.items.find((x) => [...m.caja.querySelectorAll(".fae-pc-cae")].some((el) => el.textContent.includes(x.texto)));
      assert.ok(item, `vuelta ${n + 1}: enunciado cayendo`);
      const elegida = n === 0 ? b.categorias.find((c) => c.id !== item.respuesta).id : item.respuesta;
      click(exacto(m.caja, b.categorias.find((c) => c.id === elegida).nombre), elegida);
      assert.equal(retroLimpia(m.caja), normal(b.retro(item, elegida)));
      avanzar(m.caja);
    }
    cerrada(m, porcentaje(11, 12), 12);
  } finally { m.desmontar(); }
});

/* ───────────── PM-9 ───────────── */

test("PM-9 el-rezago: dos hechos intercambiados — 3 × 16 + 20 = 68, y dice antes/después", () => {
  const m = montar(PM.ElRezago);
  try {
    const caso = D.EL_REZAGO.casos.find((c) => m.caja.textContent.includes(c.titulo));
    const orden = [caso.hechos[1], caso.hechos[0], ...caso.hechos.slice(2)];
    orden.forEach((h, k) => {
      click(contiene(m.caja, h.texto), h.id);
      click(m.caja.querySelector(`button[data-lugar="${k + 1}"]`), `lugar ${k + 1}`);
    });
    click(exacto(m.caja, "Comprobar el orden"), "comprobar");
    /* En cada lugar, el que corresponde: con los dos mensajes en pantalla no basta, podrían estar al revés. */
    const lugar = (n) => m.caja.querySelector(`button[data-lugar="${n}"]`).textContent;
    assert.ok(lugar(1).includes(D.EL_REZAGO.retroMal("después")), "en el lugar 1 está el segundo hecho: va después");
    assert.ok(lugar(2).includes(D.EL_REZAGO.retroMal("antes")), "en el lugar 2 está el primero: va antes");
    assert.ok(m.caja.textContent.includes(D.EL_REZAGO.retroBien(caso.hechos[4])));
    click(exacto(m.caja, D.EL_REZAGO.cierre.correcta), "cierre");
    assert.equal(retroLimpia(m.caja), normal(D.EL_REZAGO.cierre.retro));
    click(exacto(m.caja, "Ver resultado"), "resultado");
    const detalle = cerrada(m, 68, 6);
    assert.deepEqual(detalle.filter((f) => !f.ok).map((f) => f.item), [`${caso.id}:${caso.hechos[1].id}`, `${caso.id}:${caso.hechos[0].id}`]);
  } finally { m.desmontar(); }
});

/* ───────────── PM-10 ───────────── */

test("PM-10 dilema-banquero-central: todo o nada, y la devolución de Turquía tal cual", () => {
  const c = D.DILEMA_BANQUERO;
  for (const op of [c.opciones[0], c.opciones.find((o) => o.id === c.correcta)]) {
    const m = montar(PM.DilemaBanqueroCentral);
    try {
      assert.ok(m.caja.textContent.includes("CASO BASADO EN UN HECHO REAL"));
      click(exacto(m.caja, op.texto), op.id);
      assert.equal(retroLimpia(m.caja), normal(op.retro));
      cerrada(m, op.id === c.correcta ? 100 : 0, 1);
    } finally { m.desmontar(); }
  }
  assert.match(c.opciones.find((o) => o.id === c.correcta).retro, /Turquía hizo exactamente esto a finales de 2021.*octubre de 2022 la inflación llegó al 85%/);
});

/* ───────────── PM-11 ───────────── */

test("PM-11 duelo-de-instrumentos: tres duelos, uno perdido — 2/3; el orden A > C > B", () => {
  const m = montar(PM.DueloDeInstrumentos);
  try {
    const caso = D.DUELO_INSTRUMENTOS.casos.find((c) => m.caja.textContent.includes(c.caso));
    assert.ok(m.caja.textContent.includes(caso.etiqueta), "rótulo del escenario");
    for (let n = 0; n < 3; n++) {
      const letras = Object.keys(caso.medidas).filter((x) => exacto(m.caja, `${x.toUpperCase()} · ${caso.medidas[x]}`));
      const d = caso.duelos.find((x) => x.par.every((l) => letras.includes(l)));
      const elegida = n === 0 ? d.par.find((l) => l !== d.gana) : d.gana;
      click(exacto(m.caja, `${elegida.toUpperCase()} · ${caso.medidas[elegida]}`), elegida);
      assert.equal(retroLimpia(m.caja), normal(`${n === 0 ? "❌" : "✅"} ${d.argumento}`));
      avanzar(m.caja);
    }
    const detalle = cerrada(m, porcentaje(2, 3), 3);
    assert.ok(detalle.every((f) => f.item.startsWith(`${caso.id}:`)));
    assert.deepEqual([...m.caja.querySelectorAll("ol li")].map((li) => li.textContent.slice(0, 1)), ["A", "C", "B"]);
  } finally { m.desmontar(); }
});

/* ───────────── PM-12 ───────────── */

test("PM-12 disena-respuesta-monetaria: un señuelo y una pieza de otra casilla — 95; cifras simuladas rotuladas", () => {
  const m = montar(PM.DisenaRespuestaMonetaria);
  try {
    const caso = D.DISENA_RESPUESTA.casos.find((c) => m.caja.textContent.includes(c.caso));
    const buenas = D.CASILLAS_RESPUESTA.map((k) => caso.piezas.find((p) => p.casilla === k.id));
    const senuelo = caso.piezas.find((p) => !p.casilla && !p.simulado);
    assert.ok(m.caja.querySelector("[data-rotulo-escenario]"), "la pieza con cifra simulada lleva rótulo");

    click(exacto(m.caja, senuelo.texto), "señuelo");
    assert.equal(retroLimpia(m.caja), normal(senuelo.retro));
    click(exacto(m.caja, buenas[4].texto), "la meta, antes de tiempo");
    assert.equal(retroLimpia(m.caja), normal(D.DISENA_RESPUESTA.retroOrden));
    for (const p of buenas) {
      click(exacto(m.caja, p.texto), p.id);
      assert.equal(retroLimpia(m.caja), normal(p.retro));
    }
    const detalle = cerrada(m, 95, 5);
    assert.deepEqual(detalle.map((f) => f.item), D.CASILLAS_RESPUESTA.map((k) => `${caso.id}:${k.id}`));
    assert.equal(detalle[0].intentos, 3);
  } finally { m.desmontar(); }
});
