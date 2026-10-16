import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-1 v2.3 · C.1 «¿Qué grupo pasa la prueba?» (Célula E) — lo que pide
 * Kamogawa, cada prueba rota a propósito una vez:
 *
 *   · cada texto de C.1, literal en el paquete (sección v2.3)
 *   · dónde cae cada activo: la tabla del diseño de Itagaki (orientación de
 *     RayaDelAno §2), calculada aquí desde los plazos
 *   · E1 con los rótulos de la decisión 7 (hoy · 1 año · Corriente · No es
 *     corriente · al venderse · EN LA FIGURA · Activos corrientes)
 *   · E8: sin figura antes de elegir (ni la línea, ni la raya, ni los activos)
 *   · B4: sin coral en la figura; el error lo marca OpcionR5
 *   · el texto alternativo de la figura (decisión 6)
 *   · quien falla no pierde su activo (decisión 3)
 *   · FP: rendimiento = puntos / 25; 3, 6 y 22 de 25 salen enteros por otorgarFP
 *   · B5: ninguna frase dos veces en la pantalla, con la pista abierta
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(() => fn(performance.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/repasoCap5Cruzado.js");
const { RepasoCruzado } = await import("../../components/RepasoCapitulo5View.jsx");
const { inflesz, palabrasDe, UMBRAL } = await import("../../herramientas/inflesz.js");
const { calcularFP } = await import("../../fp/motor.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-1-v2.md");
const V23 = PAQUETE.slice(PAQUETE.indexOf("## v2.3 · Pantalla nueva")).replace(/\s+/g, " ");
const C1 = D.PANTALLAS_R5_1.find((p) => p.id === "c1");
const I = D.INTERFAZ_R5_1;
const opcionDe = (id) => C1.opciones.find((o) => o.id === id);

const montados = [];
afterEach(() => { while (montados.length) montados.pop()(); });
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  let vivo = true;
  const desmontar = () => { if (!vivo) return; vivo = false; act(() => raiz.unmount()); caja.remove(); };
  montados.push(desmontar);
  return { caja, desmontar };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const abrir = () => montar(h(RepasoCruzado, { pantallas: [C1] }));
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);

/* ═══════════ LOS TEXTOS ═══════════ */

test("★★★ cada texto de C.1 está, literal, en la sección v2.3 del paquete (guarda: 7 textos y 4 grupos)", () => {
  const textos = [C1.enunciado, C1.pista, ...C1.opciones.map((o) => o.retro), D.R5_1.objetivo];
  assert.equal(new Set(textos).size, 7);
  const fuera = textos.filter((t) => !V23.includes(`«${t}»`));
  assert.deepEqual(fuera, [], `no están: ${fuera.join(" | ")}`);
  /* Los cuatro grupos, en su renglón «x) A · B · C · D», en el orden del paquete. */
  const letras = ["a", "b", "c", "d"];
  C1.opciones.forEach((o, k) => {
    assert.equal(o.id, `c1-${letras[k]}`);
    assert.ok(V23.includes(`${letras[k]}) ${o.correcta ? "**clave** · " : ""}${o.activos.map((a) => a.texto).join(" · ")}`), o.id);
  });
  assert.equal(C1.opciones.filter((o) => o.correcta).length, 1);
  /* La pista del delta de Itagaki es la misma. */
  assert.ok(V23.includes(`«${C1.pista}» (73 caracteres)`));
  assert.equal(D.SUBTEMAS.corrientes.nombre, "Activos corrientes");
  /* La decisión 7: los rótulos fijos que E1 busca. */
  assert.ok(V23.includes("**Rótulos fijos** (los que E1 busca): hoy · 1 año · Corriente · No es corriente · al venderse · EN LA FIGURA · Activos corrientes."));
});

test("★★★ INFLESZ ≥ 65 en todo texto de C.1 de 10 palabras o más (guarda: 7 medidos)", () => {
  const textos = [C1.enunciado, C1.pista, ...C1.opciones.map((o) => o.retro), D.R5_1.objetivo];
  let medidos = 0;
  for (const t of textos) {
    const r = inflesz(t);
    if (!r.aplica) continue;
    medidos++;
    assert.ok(r.valor >= UMBRAL, `${r.valor} · ${t}`);
  }
  assert.equal(medidos, 7);
  assert.ok(palabrasDe(C1.enunciado).length <= 40, "B1: 40 palabras antes de la figura");
});

/* ═══════════ DÓNDE CAE CADA ACTIVO ═══════════ */

test("★★★ la colocación es la tabla del diseño (§2): punto → nombre, el inventario en el hueco mayor y lo de abajo", () => {
  const tabla = Object.fromEntries(C1.opciones.map((o) => {
    const c = D.colocarC1(o);
    return [o.id, {
      arriba: c.arriba.map((x) => `${x.activo.figura} ${x.punto}→${x.nombre}`).sort(),
      inventario: c.inventario?.nombre ?? null,
      abajo: c.abajo.map((a) => a.figura),
    }];
  }));
  assert.deepEqual(tabla, {
    "c1-a": { arriba: ["Caja 0→0", "Cuentas por cobrar – clientes 120→120", "Inversión 72→72"].sort(), inventario: 36, abajo: [] },
    "c1-b": { arriba: ["Bancos 0→0", "Inversión 36→36"], inventario: 90, abajo: ["Cuentas por cobrar – clientes"] },
    "c1-c": { arriba: ["Caja 0→0", "Cuentas por cobrar – clientes 24→24"], inventario: 84, abajo: ["Vehículo de reparto"] },
    "c1-d": { arriba: ["Bancos 0→0", "Cuentas por cobrar – clientes 12→22"], inventario: 83, abajo: ["Inversión"] },
  });
  /* La cartera a 10 meses queda 24 px antes de la raya: se ve (regla de los 4 px). */
  assert.equal(D.RAYA_C1.raya - 10 * D.RAYA_C1.porMes, 24);
  /* Solo la clave es todo corriente. */
  assert.deepEqual(C1.opciones.map((o) => o.activos.every(D.esCorriente)), [true, false, false, false]);
});

/* ═══════════ E8 · SIN FIGURA ANTES DE ELEGIR ═══════════ */

test("★★★ E8: antes de elegir no hay figura (ni la línea, ni la raya, ni los activos); al elegir aparece debajo de la elegida", async () => {
  const { caja } = await abrir();
  assert.equal(caja.querySelector("[data-caja-figura]"), null);
  assert.equal(caja.querySelector("[data-raya-c1]"), null);
  for (const t of [I.hoyRaya, I.unAno, I.alVenderse, I.noCorriente]) assert.equal(caja.textContent.includes(t), false, t);
  /* Un activo por renglón, sin «·». */
  for (const o of C1.opciones) {
    const renglones = [...caja.querySelectorAll(`[data-opcion="${o.id}"] [data-activo]`)].map((x) => x.textContent);
    assert.deepEqual(renglones, o.activos.map((a) => a.texto));
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent.includes("·"), false);
  }
  await tocar(opcion(caja, "c1-a"));
  const figura = caja.querySelector("[data-raya-c1]");
  assert.ok(figura);
  assert.ok(caja.querySelector('[data-opcion="c1-a"]').compareDocumentPosition(figura) & w.Node.DOCUMENT_POSITION_FOLLOWING);
});

/* ═══════════ LA FIGURA DESPUÉS DE ELEGIR ═══════════ */

test("★★★ acierto: los cuatro caen arriba, la fila de abajo queda vacía; el alt dice lo que cayó (decisión 6)", async () => {
  const { caja } = await abrir();
  await tocar(opcion(caja, "c1-a"));
  const f = caja.querySelector("[data-raya-c1]");
  assert.equal(f.getAttribute("role"), "img");
  assert.equal(f.getAttribute("aria-label"), "Corriente: Caja, Cuentas por cobrar – clientes, Inventario de mercancías, Inversión. No es corriente: ninguno.");
  assert.equal(f.querySelectorAll("[data-punto-raya=si]").length, 3);
  assert.ok(f.querySelector("[data-franja-inventario]"));
  assert.equal(f.querySelector("[data-nombre-raya=inventario]").textContent, `Inventario de mercancías${I.alVenderse}`);
  assert.equal(f.querySelectorAll("[data-abajo]").length, 0);
  assert.equal(f.querySelectorAll("[data-habria]").length, 0);
  assert.equal(caja.querySelector('[data-opcion="c1-a"] button').dataset.estado, "correcta");
});

test("★★★ error: lo de la elegida que no es corriente cae abajo; con la correcta en la figura se queda en discontinuo (decisión 3)", async () => {
  for (const [id, fuera] of [["c1-b", "Cuentas por cobrar – clientes"], ["c1-c", "Vehículo de reparto"], ["c1-d", "Inversión"]]) {
    const { caja, desmontar } = await abrir();
    await tocar(opcion(caja, id));
    /* Con reduced-motion: la correcta desplegada y en la figura, con «EN LA FIGURA». */
    assert.equal(caja.querySelector(`[data-opcion="${id}"] button`).dataset.estado, "incorrecta");
    assert.equal(caja.querySelector('[data-opcion="c1-a"] button').dataset.estado, "revelada");
    assert.equal(caja.querySelector('[data-opcion="c1-a"] button').dataset.enFigura, "si");
    let f = caja.querySelector("[data-raya-c1]");
    assert.equal(f.querySelectorAll("[data-abajo]").length, 0, `${id}: la clave no tiene nada abajo`);
    const habria = f.querySelector("[data-habria]");
    assert.equal(habria?.dataset.habria, fuera, id);
    const punto = habria.querySelector("[data-punto-raya=habria]");
    assert.match(punto.style.border, /1px dashed/);
    assert.equal(punto.style.background, "transparent");
    /* Al volver a tocar la elegida, su activo cae abajo, entero, y el alt lo dice. */
    await tocar(opcion(caja, id));
    f = caja.querySelector("[data-raya-c1]");
    assert.equal(f.querySelector("[data-abajo]").dataset.abajo, fuera);
    assert.equal(f.querySelector("[data-habria]"), null);
    assert.ok(f.getAttribute("aria-label").endsWith(`No es corriente: ${fuera}.`), f.getAttribute("aria-label"));
    desmontar();
  }
});

test("★★★ B4: la figura no lleva coral, teal ni ámbar en ningún estado; los puntos llevan anillo #1D3557 (decisión 4)", async () => {
  const PROHIBIDOS = ["231, 111, 81", "e76f51", "42, 157, 143", "2a9d8f", "233, 196, 106", "e9c46a"];
  for (const id of ["c1-a", "c1-b", "c1-c", "c1-d"]) {
    const { caja, desmontar } = await abrir();
    await tocar(opcion(caja, id));
    /* Con la correcta en la figura (y, si falló, lo de abajo en discontinuo) y, si falló, con la elegida otra vez. */
    for (const vuelta of id === "c1-a" ? [0] : [0, 1]) {
      if (vuelta) await tocar(opcion(caja, id));
      const f = caja.querySelector("[data-raya-c1]");
      const estilos = [f, ...f.querySelectorAll("*")].map((el) => `${el.getAttribute("style") ?? ""} ${el.getAttribute("stroke") ?? ""}`.toLowerCase()).join(" ");
      for (const c of PROHIBIDOS) assert.equal(estilos.includes(c), false, `${id} (vuelta ${vuelta}): ${c} en la figura`);
      for (const p of f.querySelectorAll("[data-punto-raya=si]")) assert.match(p.style.boxShadow, /^0 0 0 2px (#1D3557|rgb\(29, 53, 87\))$/i);
    }
    desmontar();
  }
});

/* ═══════════ E1 Y B5 ═══════════ */

test("★★★ E1: los textos de C.1 y los rótulos de la decisión 7 salen en la pantalla; B5: ninguna frase dos veces, con la pista abierta", async () => {
  const visto = [];
  const nombres = new Set(C1.opciones.flatMap((o) => o.activos.map((a) => a.figura)));
  const repetidas = (raiz) => {
    const hojas = [...raiz.querySelectorAll("p, span, button")].filter((el) => !el.children.length).map((el) => el.textContent.trim())
      .filter((t) => palabrasDe(t).length >= 3 && !nombres.has(t));
    return hojas.filter((t, k) => hojas.indexOf(t) !== k);
  };
  let estados = 0;
  for (const o of C1.opciones) {
    const { caja, desmontar } = await abrir();
    await tocar(caja.querySelector("[data-ver-pista]"));
    visto.push(caja.textContent);
    assert.deepEqual(repetidas(caja), [], `${o.id} antes`);
    await tocar(opcion(caja, o.id));
    visto.push(caja.textContent);
    assert.deepEqual(repetidas(caja), [], `${o.id} después`);
    estados += 2;
    desmontar();
  }
  /* El final, con su fila de «Activos corrientes». */
  const { caja } = await abrir();
  await tocar(opcion(caja, "c1-a"));
  await tocar(caja.querySelector("[data-siguiente]"));
  visto.push(caja.textContent);
  const todo = visto.join("\n");
  const ROTULOS_V23 = [I.hoyRaya, I.unAno, I.corriente, I.noCorriente, I.alVenderse, I.enLaFigura, D.SUBTEMAS.corrientes.nombre];
  const faltan = [C1.enunciado, C1.pista, ...C1.opciones.map((o) => o.retro), ...C1.opciones.flatMap((o) => o.activos.map((a) => a.texto)), ...ROTULOS_V23].filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, []);
  assert.equal(estados, 8);
  /* El botón de pista se llama «Ver pista» (decisión 7). */
  assert.equal(I.verPista, "Ver pista");
});

/* ═══════════ FP: PUNTOS / 25 ═══════════ */

test("★★★ FP: el rendimiento son los puntos / 25, nunca aciertos / 7; 3, 6 y 22 de 25 salen enteros por otorgarFP", () => {
  /* Lo que hace registrarActividad (porcentaje / 100) y luego otorgarFP (aciertos × 100), sin redondear. */
  const alServidor = (pct) => (Math.max(0, Math.min(100, pct)) / 100) * 100;
  const casos = {
    3: { c1: true },
    6: { c1: true, c3: true },
    22: { c1: true, c3: true, c5: true, c6: true, c8: true, c9: true },
  };
  for (const [puntos, resultados] of Object.entries(casos)) {
    assert.equal(D.puntosDeR5_1(resultados), Number(puntos));
    const pct = D.puntuarR5_1(D.puntosDeR5_1(resultados));
    assert.equal(pct, Number(puntos) * 4, `${puntos} de 25: ${pct} %`);
    const enviado = alServidor(pct);
    assert.equal(Number.isInteger(enviado), true, `${puntos} de 25: ${enviado}`);
    assert.equal(Math.round(enviado), enviado);
    assert.equal(enviado, Number(puntos) * 4);
  }
  /* Con aciertos / 7 no saldría entero: así se ve por qué no. */
  assert.equal(Number.isInteger((2 / 7) * 100), false);
  /* Los FP de 22 de 25, de calcularFP: 25 × 0,88 = 22. */
  assert.equal(calcularFP({ dificultad: D.R5_1.dificultad, modalidad: D.R5_1.modalidad, aciertos: 0.88, duracionMs: 60_000 }).fp, 22);
  /* El total de r5-1 sigue en 25. */
  assert.equal(D.R5_1.fpBase, 25);
  assert.equal(D.TOTAL_PUNTOS_R5_1, 25);
});

test("★★ la cabecera dice «PREGUNTA 1 DE 7» con la silueta de la raya (80 × 22), y POR TEMA abre con «Activos corrientes»", async () => {
  const { caja } = await montar(h(RepasoCruzado, { pantallas: D.PANTALLAS_R5_1 }));
  assert.equal(caja.querySelector("[data-progreso]").textContent, "PREGUNTA 1 DE 7");
  const s = caja.querySelector("[data-silueta-cabecera]");
  assert.equal(s.dataset.siluetaCabecera, "raya");
  assert.deepEqual([s.style.width, s.style.height], ["80px", "22px"]);
  assert.equal(s.querySelector("[data-silueta=raya]").textContent, "");
  assert.deepEqual(D.ORDEN_SUBTEMAS, ["corrientes", "inversiones", "cartera", "inventarios"]);
});
