import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-1 «Repaso cruzado» (Célula E) — lo que pide «Lo que Ippo tiene que
 * probar» del paquete e5-r5-1-v1, y lo que hace falta para que lo demás
 * signifique algo:
 *
 *   · cada texto de los datos está, letra por letra, en el paquete
 *   · las seis claves; 3.400 y 526 se CALCULAN aquí desde los datos
 *   · cada opción incorrecta tiene su devolución, distinta de las demás
 *   · INFLESZ ≥ 65 en todo texto de 10 palabras o más, con guarda de
 *     recorrido exacto; el enunciado de C.9 de v1.2 incluido (68,7)
 *   · ningún renglón de asiento de las pantallas 2 y 6 llega a 10 palabras
 *   · el barajado, con semilla fija, cambia el orden y conserva la clave
 *   · los FP de una partida parcial salen de calcularFP (src/fp/motor.js),
 *     que replica el round() del servidor (0017); la vista no tiene fórmula
 *   · a 320 px la fila de 10 cajas cabe (147 de 256); el ancho del texto lo
 *     mide en Chromium scripts/e5/medir-r5-1.mjs
 *   · las dos puertas dicen lo mismo, con la migración en 0250-0299
 *   · la partida se juega: devolución, «era esta», progreso, escena, cierre
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/repasoCap5Cruzado.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { JUEGOS_REPASO_CAP5, TEMA_REPASO_CAP5, RepasoCruzado } = await import("../../components/RepasoCapitulo5View.jsx");
const { inflesz, palabrasDe, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { pesos } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-1-v1.md");
const P = D.PANTALLAS_R5_1;
const pantalla = (id) => P.find((x) => x.id === id);
const clave = (p) => p.opciones.find((o) => o.correcta);

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);

/* ═══════════ LO QUE LEE EL ESTUDIANTE, SACADO DE LOS DATOS ═══════════ */

function textosDeLosDatos() {
  const t = [D.R5_1.objetivo];
  for (const p of P) {
    t.push(p.enunciado, p.pista, ...(p.columnas ?? []));
    for (const o of p.opciones) {
      t.push(o.retro);
      if (o.texto) t.push(o.texto);
      if (o.asiento) t.push(o.asiento.debe, o.asiento.haber);
      if (o.celdas) t.push(...o.celdas);
    }
    for (const d of p.datos ?? []) t.push(d.etiqueta);
    for (const l of p.lotes ?? []) t.push(l.marca);
  }
  return t;
}

test("★★★ cada texto de los datos está, letra por letra, en el paquete (guarda: 81 textos)", () => {
  const textos = textosDeLosDatos();
  assert.equal(textos.length, 81, "no recorrió los textos que dice recorrer");
  /* Entero, no un trozo: con su borde de celda, de renglón o de rótulo a cada lado. */
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entero = (t) => new RegExp(`(?:\\| |\\*\\* |· |\\n)${escapar(t)}(?: \\||\\n|<br>)`).test(PAQUETE);
  const fuera = textos.filter((t) => !entero(t));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* Las cifras de las pantallas 4 y 5, tal como las escribe el paquete. */
  for (const d of pantalla("c8").datos) assert.ok(PAQUETE.includes(`| ${d.etiqueta} | ${pesos(d.valor)} |`), d.etiqueta);
  for (const l of pantalla("c9").lotes) assert.ok(PAQUETE.includes(`| ${l.marca} | ${D.INTERFAZ_R5_1.unidadesACosto(l.unidades, l.costo)} | ${l.unidades / D.UNIDADES_POR_CAJA} |`), l.marca);
  assert.ok(PAQUETE.includes(`| Vendidas | ${pantalla("c9").vendidas} u |`));
  for (const o of [...pantalla("c8").opciones, ...pantalla("c9").opciones]) assert.ok(PAQUETE.includes(`| ${pesos(o.valor)} |`), pesos(o.valor));
  for (const texto of ["PREGUNTA n DE 6", "«Siguiente»", "«POR TEMA»", "«DEBE»", "«HABER»", "«Cada caja = 10 u»", "«Vendidas · 225 u»"]) assert.ok(PAQUETE.includes(texto), texto);
});

/* ═══════════ LAS SEIS CLAVES ═══════════ */

test("★★★ seis pantallas en el orden del libro, cuatro opciones y una sola clave en cada una", () => {
  assert.deepEqual(P.map((p) => p.ejercicio), ["C.3", "C.5", "C.6", "C.8", "C.9", "C.10"]);
  assert.deepEqual(P.map((p) => p.subtema), ["inversiones", "cartera", "inventarios", "inventarios", "inventarios", "inventarios"]);
  let pantallas = 0;
  for (const p of P) {
    pantallas++;
    assert.equal(p.opciones.length, 4, p.id);
    assert.equal(p.opciones.filter((o) => o.correcta).length, 1, `${p.id}: una sola clave`);
  }
  assert.equal(pantallas, 6);
  /* La letra del libro de cada clave, la del índice del banco: c, c, c, a, d, c. */
  assert.deepEqual(P.map((p) => clave(p).id.split("-").pop()), ["c", "c", "c", "a", "d", "c"]);
  assert.deepEqual(clave(pantalla("c5")).asiento, { debe: "Provisión para deudas incobrables", haber: "Cuentas por cobrar – clientes" });
  assert.deepEqual(clave(pantalla("c6")).celdas, ["Más alto", "Más bajo", "Mayor"]);
  assert.deepEqual(clave(pantalla("c10")).asiento, { debe: "Ganancias y pérdidas", haber: "Inventario de mercancías" });
});

test("★★★ C.8: 3.400 = 500 + 4.000 − 300 − 800, calculado desde los datos; y de dónde salen 2.400 y 6.000", () => {
  const c8 = pantalla("c8");
  const v = Object.fromEntries(c8.datos.map((d) => [d.etiqueta, d.valor]));
  const disponible = v["Inventario inicial"] + v["Compras"] - v["Devoluciones de compras"];
  const costo = disponible - v["Inventario final"];
  assert.equal(disponible, 4200);
  assert.equal(costo, 3400);
  assert.equal(clave(c8).valor, costo);
  const valor = (letra) => c8.opciones.find((o) => o.id === `c8-${letra}`).valor;
  assert.equal(valor("b"), costo - v["Devoluciones de ventas"]);
  assert.equal(valor("d"), disponible + v["Inventario final"] + v["Devoluciones de ventas"]);
  assert.equal(valor("b"), 2400);
  assert.equal(valor("d"), 6000);
  /* $6.400 no se reconstruye (Miyata): su devolución se apoya en el tope del disponible. */
  for (const l of ["c", "d"]) assert.ok(valor(l) > disponible);
  /* Ningún distractor coincide con la clave. */
  for (const l of ["b", "c", "d"]) assert.notEqual(valor(l), costo, `c8-${l}`);
});

test("★★★ C.9: 526 = 25 × (5.260 / 250), calculado desde los lotes; y de dónde salen 625, 450 y 525", () => {
  const c9 = pantalla("c9");
  const unidades = c9.lotes.reduce((s, l) => s + l.unidades, 0);
  const costoTotal = c9.lotes.reduce((s, l) => s + l.unidades * l.costo, 0);
  const quedan = unidades - c9.vendidas;
  assert.equal(unidades, 250);
  assert.equal(costoTotal, 5260);
  assert.equal(quedan, 25);
  assert.equal(quedan * (costoTotal / unidades), 526);
  assert.equal(clave(c9).valor, quedan * (costoTotal / unidades));
  const valor = (letra) => c9.opciones.find((o) => o.id === `c9-${letra}`).valor;
  const precios = c9.lotes.map((l) => l.costo);
  assert.equal(valor("a"), quedan * precios[2]);
  assert.equal(valor("b"), quedan * precios[0]);
  assert.equal(valor("c"), quedan * (precios.reduce((s, x) => s + x, 0) / precios.length));
  assert.deepEqual([valor("a"), valor("b"), valor("c")], [625, 450, 525]);
  /* Ningún distractor coincide con la clave. */
  for (const l of ["a", "b", "c"]) assert.notEqual(valor(l), clave(c9).valor, `c9-${l}`);
});

test("★★★ cada opción incorrecta tiene una devolución propia, distinta de las demás de su pantalla", () => {
  let incorrectas = 0;
  for (const p of P) {
    const retros = p.opciones.map((o) => o.retro);
    assert.equal(new Set(retros).size, 4, `${p.id}: dos devoluciones iguales`);
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      incorrectas++;
      assert.ok(typeof o.retro === "string" && o.retro.trim().length > 0, `${o.id} sin devolución`);
      assert.equal(D.evaluarR5_1(p, o.id).texto, o.retro);
      assert.equal(D.evaluarR5_1(p, o.id).ok, false);
    }
    assert.equal(D.evaluarR5_1(p, clave(p).id).ok, true);
  }
  assert.equal(incorrectas, 18);
});

/* ═══════════ INFLESZ ═══════════ */

/*
 * El enunciado de C.9 de v1 daba 61,3 con la herramienta oficial. Kamogawa lo
 * corrigió en el paquete (v1.2) y el nuevo da 68,7: ya no hay excepción.
 */
const C9_ENUNCIADO = pantalla("c9").enunciado;

test("★★★ todo texto de 10 palabras o más pasa 65 con inflesz.js (guarda: 39 medidos)", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDeLosDatos()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], `letra que la herramienta no sabe contar: ${t}`);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 39, "no midió los textos que dice medir");
  assert.deepEqual(bajos, [], "textos por debajo de 65");
});

test("★★ el enunciado de C.9 es el de v1.2 y pasa 65: da 68,7", () => {
  assert.equal(C9_ENUNCIADO, "Mira los datos del periodo. Usa el promedio ponderado. ¿Cuánto vale el inventario final?");
  assert.ok(PAQUETE.includes("> **v1.2 (Kamogawa):**"), "el paquete no dice v1.2");
  assert.equal(inflesz(C9_ENUNCIADO).valor, 68.7);
  assert.ok(inflesz(C9_ENUNCIADO).valor >= UMBRAL);
});

test("★★ ningún renglón de asiento de las pantallas 2 y 6 tiene 10 palabras o más (guarda: 16 renglones)", () => {
  let renglones = 0;
  for (const p of [pantalla("c5"), pantalla("c10")]) {
    assert.equal(p.forma, "asiento");
    for (const o of p.opciones) {
      for (const r of [o.asiento.debe, o.asiento.haber]) {
        renglones++;
        assert.ok(palabrasDe(r).length < 10, `${o.id}: «${r}»`);
      }
    }
  }
  assert.equal(renglones, 16);
});

/* ═══════════ EL BARAJADO ═══════════ */

/*
 * Con semilla fija (v1.1, Takamura): con azar de verdad hay 1 caso en 24 de
 * que salga el mismo orden, y una prueba así fallaría sola de vez en cuando.
 */
const { barajadorDe } = await import("../../utils/barajar.js");
const SEMILLAS = ["r5-1-a", "r5-1-b", "r5-1-c"];
const orden = (tanda, id) => tanda.find((x) => x.id === id).opciones.map((o) => o.id).join("|");
const corrida = (semilla, intentos = 40) => {
  const barajador = barajadorDe(semilla);
  const tandas = [];
  let anterior = null;
  for (let k = 0; k < intentos; k++) { anterior = D.prepararR5_1(anterior, barajador); tandas.push(anterior); }
  return tandas;
};

test("★★★ el barajado, con semilla fija: es reproducible, cambia el orden y conserva la clave (guarda: 3 × 40 × 6)", () => {
  let revisadas = 0;
  for (const semilla of SEMILLAS) {
    const tandas = corrida(semilla);
    /* Reproducible: la misma semilla da exactamente las mismas tandas. */
    assert.deepEqual(corrida(semilla).map((t) => P.map((p) => orden(t, p.id))), tandas.map((t) => P.map((p) => orden(t, p.id))));
    tandas.forEach((tanda, k) => {
      assert.deepEqual(tanda.map((x) => x.id), P.map((x) => x.id), "las pantallas no se barajan");
      for (const p of P) {
        revisadas++;
        const antes = k ? orden(tandas[k - 1], p.id) : p.opciones.map((o) => o.id).join("|");
        assert.notEqual(orden(tanda, p.id), antes, `${semilla} · intento ${k + 1} · ${p.id}: el mismo orden que antes`);
        const t = tanda.find((x) => x.id === p.id);
        assert.deepEqual(t.opciones.map((o) => o.id).sort(), p.opciones.map((o) => o.id).sort());
        /* La clave sigue siendo la misma opción, en el sitio al que fue a parar. */
        const sitio = t.opciones.findIndex((o) => o.id === clave(p).id);
        assert.equal(t.opciones.findIndex((o) => o.correcta), sitio, `${p.id}: el barajado perdió el índice de la clave`);
        assert.equal(D.evaluarR5_1(t, t.opciones[sitio].id).ok, true);
        assert.equal(t.opciones.filter((o) => o.correcta).length, 1);
      }
    });
    /* La clave no se queda quieta: en una corrida pasa por los cuatro sitios. */
    for (const p of P) {
      const sitios = new Set(tandas.map((t) => t.find((x) => x.id === p.id).opciones.findIndex((o) => o.correcta)));
      assert.equal(sitios.size, 4, `${semilla} · ${p.id}: la clave solo pasó por ${[...sitios]}`);
    }
  }
  assert.equal(revisadas, 720);
  /* Los datos del módulo no se tocan al barajar. */
  assert.deepEqual(P.map((p) => clave(p).id), ["c3-c", "c5-c", "c6-c", "c8-a", "c9-d", "c10-c"]);
});

/* ═══════════ A 320 PX ═══════════ */

test("★★ a 320 px la fila más larga de cajas cabe: 10 × 12 + 9 × 3 = 147 de 256", async () => {
  const cajas = pantalla("c9").lotes.map((l) => l.unidades / D.UNIDADES_POR_CAJA);
  assert.deepEqual(cajas, [7, 10, 8]);
  /* El tamaño y la separación de las cajas, leídos de lo que pinta la vista. */
  const { caja: raiz, desmontar } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c9")] }));
  const fila = raiz.querySelector('[data-cajas="10"]');
  const una = fila.firstElementChild.style;
  const [lado, alto, hueco] = [parseFloat(una.width), parseFloat(una.height), parseFloat(fila.style.gap)];
  desmontar();
  assert.deepEqual([lado, alto, hueco], [12, 12, 3]);
  const ancho = (n) => n * lado + (n - 1) * hueco;
  /* 320 − 2 × 16 de margen = 288; menos 2 × 16 de relleno del bloque = 256. */
  const util = 320 - 32 - 32;
  assert.equal(ancho(Math.max(...cajas)), 147);
  assert.ok(ancho(Math.max(...cajas)) <= util);
});

/* ═══════════ LAS DOS PUERTAS ═══════════ */

test("★★★ catálogo, registro de la vista y migración dicen lo mismo; el tema es el último", () => {
  const temas = SUBJECTS.contabilidad.topics;
  assert.equal(temas.at(-1).id, TEMA_REPASO_CAP5);
  assert.equal(temas.at(-2).id, "inventarios-descuentos-nic2");
  const tema = temas.at(-1);
  assert.equal(tema.title, "Repaso del capítulo 5");
  const enCatalogo = actividadesDeTipo(tema, HACER);
  assert.deepEqual(enCatalogo.map((a) => a.id), JUEGOS_REPASO_CAP5.map((j) => j.id));
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1"], "solo r5-1 está publicada");
  const a = enCatalogo[0];
  assert.equal(a.nombre, D.R5_1.nombre);
  assert.equal(JUEGOS_REPASO_CAP5[0].titulo, D.R5_1.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.ok(tema.actividades.every((x) => x.id.startsWith("r5-")));

  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => /^\d{4}_/.test(f) && leer(`supabase/migrations/${f}`).includes("'r5-1'"));
  assert.deepEqual(migraciones, ["0250_r5_1_repaso_cruzado.sql"]);
  const n = Number(migraciones[0].slice(0, 4));
  assert.ok(n >= 250 && n <= 299, "fuera del rango de la Célula E");
  const sql = leer(`supabase/migrations/${migraciones[0]}`);
  assert.match(sql, /\('r5-1', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'medio', 25, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i, "la migración no es aditiva");
  assert.match(sql, /select activity_id[\s\S]*where activity_id = 'r5-1';\s*$/);
});

test("★★ la regla de etiqueta nombra cada pantalla por su subtema, y ninguna se lee igual (guarda: 6)", () => {
  assert.ok(hayReglaPara("r5-1"));
  const etiquetas = P.map((p) => etiquetaDeItem("r5-1", p.id));
  assert.equal(etiquetas.length, 6);
  assert.equal(new Set(etiquetas).size, 6, "dos pantallas se leen igual en el panel docente");
  P.forEach((p, k) => assert.ok(etiquetas[k]?.startsWith(`${D.SUBTEMAS[p.subtema].nombre} · `), etiquetas[k]));
  assert.deepEqual([...new Set(P.map((p) => D.SUBTEMAS[p.subtema].nombre))], ["Inversiones", "Cartera", "Inventarios"]);
  assert.equal(etiquetaDeItem("r5-1", "no-existe"), null);
});

/* ═══════════ LA PARTIDA ═══════════ */


test("★★★ se juega: progreso, escena, datos, devolución con «era esta», y el cierre POR TEMA", async () => {
  /* El orden del libro, para poder tocar sin buscar. */
  const fin = [];
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: (...x) => fin.push(x) }));
  const ESCENA = { inversiones: "titulo-valor", cartera: "facturas", inventarios: "bodega" };
  /* Falla C.3 (elige la a) y C.9 (elige la b); acierta las otras cuatro. */
  const eleccion = { c3: "c3-a", c5: "c5-c", c6: "c6-c", c8: "c8-a", c9: "c9-b", c10: "c10-c" };
  let jugadas = 0;
  for (const [k, p] of P.entries()) {
    jugadas++;
    assert.equal(caja.querySelector("[data-pantalla]").dataset.pantalla, p.id);
    assert.equal(caja.querySelector("[data-progreso] p").textContent, `PREGUNTA ${k + 1} DE 6`);
    assert.deepEqual([...caja.querySelectorAll("[data-segmento]")].map((s) => s.dataset.segmento),
      Array.from({ length: 6 }, (_, j) => (j < k ? "hecho" : j === k ? "actual" : "pendiente")));
    assert.ok(caja.querySelector(`[data-silueta="${ESCENA[p.subtema]}"]`), `${p.id}: escena`);
    assert.equal(caja.querySelector("[data-banda-escena]").getAttribute("aria-hidden"), "true");
    assert.equal(caja.querySelector("[data-enunciado]").textContent, p.enunciado);
    assert.equal(caja.querySelector("[data-objetivo]").textContent, D.R5_1.objetivo);
    assert.equal(caja.querySelectorAll("[data-opcion]").length, 4);
    if (p.id === "c8") {
      assert.deepEqual([...caja.querySelectorAll("[data-dato]")].map((d) => d.textContent),
        ["Ventas$11.400", "Devoluciones de ventas$1.000", "Inventario inicial$500", "Compras$4.000", "Devoluciones de compras$300", "Inventario final$800"]);
    }
    if (p.id === "c9") {
      assert.deepEqual([...caja.querySelectorAll("[data-cajas]")].map((d) => d.children.length), [7, 10, 8]);
      assert.ok(caja.textContent.includes("70 u a $18") && caja.textContent.includes("Vendidas · 225 u") && caja.textContent.includes("Cada caja = 10 u"));
    }
    if (p.forma === "asiento") {
      const a = caja.querySelector(`[data-opcion="${p.opciones[0].id}"]`);
      assert.equal(a.querySelector('[data-renglon="debe"]').textContent, p.opciones[0].asiento.debe);
      assert.equal(a.querySelector('[data-renglon="haber"]').textContent, p.opciones[0].asiento.haber);
      assert.ok(a.textContent.startsWith("DEBE"));
    }
    if (p.forma === "tabla") assert.equal(caja.querySelector("[data-cabecera-tabla]").textContent, "Inventario finalCosto de mercancía vendidaUtilidad");
    assert.equal(caja.querySelector("[data-siguiente]"), null, "«Siguiente» antes de responder");
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "vacia");

    await tocar(opcion(caja, eleccion[p.id]));
    const ok = eleccion[p.id] === clave(p).id;
    const panel = caja.querySelector("[data-devolucion]");
    assert.equal(panel.getAttribute("aria-live"), "polite");
    assert.equal(panel.dataset.devolucion, ok ? "acierto" : "error");
    assert.ok(panel.textContent.endsWith(p.opciones.find((o) => o.id === eleccion[p.id]).retro));
    assert.equal(opcion(caja, eleccion[p.id]).dataset.estado, ok ? "correcta" : "incorrecta");
    if (!ok) {
      assert.equal(opcion(caja, clave(p).id).dataset.estado, "revelada");
      assert.ok(opcion(caja, clave(p).id).textContent.includes("era esta"));
    }
    /* Un solo toque: lo demás queda bloqueado. */
    assert.ok([...caja.querySelectorAll("[data-opcion] button")].every((b) => b.disabled));
    assert.equal(caja.querySelector("[data-siguiente]").textContent, "Siguiente");
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(jugadas, 6);

  assert.ok(caja.querySelector("[data-cierre]"));
  assert.equal(caja.querySelector("[data-por-tema] p").textContent, "POR TEMA");
  const filas = [...caja.querySelectorAll("[data-fila-tema]")].map((f) => [
    f.dataset.filaTema, f.querySelector("p").textContent,
    [...f.querySelectorAll("[data-punto]")].map((x) => x.dataset.punto).join(","),
    f.querySelector("[data-n-de-m]").textContent,
  ]);
  assert.deepEqual(filas, [
    ["inversiones", "Inversiones", "error", "0 de 1"],
    ["cartera", "Cartera", "acierto", "1 de 1"],
    ["inventarios", "Inventarios", "acierto,acierto,error,acierto", "3 de 4"],
  ]);
  assert.ok(caja.textContent.includes("67%"), "el resultado es 4 de 6");

  assert.equal(fin.length, 1);
  const [pct, , detalle] = fin[0];
  assert.equal(pct, (4 / 6) * 100);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["c3", false, "c3-a"], ["c5", true, null], ["c6", true, null], ["c8", true, null], ["c9", false, "c9-b"], ["c10", true, null],
  ]);
  desmontar();
});

test("★★ la escena solo se mueve cuando cambia el tema", async () => {
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P }));
  const escenas = [];
  for (const p of P) {
    escenas.push(caja.querySelector(".r5-escena"));
    await tocar(opcion(caja, clave(p).id));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  /* Inversiones → Cartera → Inventarios ×4: tres montajes, el mismo nodo en las cuatro de bodega. */
  assert.notEqual(escenas[0], escenas[1]);
  assert.notEqual(escenas[1], escenas[2]);
  assert.equal(escenas[2], escenas[3]);
  assert.equal(escenas[3], escenas[5]);
  desmontar();
});

/* ═══════════ LOS FP DE UNA PARTIDA PARCIAL ═══════════ */

const { calcularFP } = await import("../../fp/motor.js");

test("★★★ los FP de 0 a 6 aciertos salen de calcularFP y son los que da la regla del servidor (0017)", () => {
  const SQL = leer("supabase/migrations/0017_detalle_por_item.sql");
  assert.match(SQL, /v_rend := greatest\(0\.5, least\(1, coalesce\(p_correct_pct, 0\) \/ 100\.0\)\);/);
  assert.match(SQL, /v_fp := round\(v_base \* v_rend \* v_tiempo\);/);
  /* La regla del servidor, escrita aquí aparte: otorgarFP manda el % redondeado a entero. */
  const delServidor = (pct) => Math.round(25 * Math.max(0.5, Math.min(1, Math.round(pct) / 100)) * 1);
  const fps = [];
  for (let bien = 0; bien <= D.TOTAL_R5_1; bien++) {
    const pct = D.puntuarR5_1(bien);
    const { fp } = calcularFP({ dificultad: D.R5_1.dificultad, modalidad: D.R5_1.modalidad, aciertos: pct / 100, duracionMs: 60_000 });
    assert.equal(fp, delServidor(pct), `${bien} de 6`);
    fps.push(fp);
  }
  assert.equal(fps.length, 7);
  /* 4 de 6: 66,67 % → 67 → 25 × 0,67 = 16,75 → 17. */
  assert.deepEqual(fps, [13, 13, 13, 13, 17, 21, 25]);
  /* La pantalla no se escribe una fórmula propia: solo entrega el porcentaje. */
  for (const f of ["src/components/RepasoCapitulo5View.jsx", "src/data/repasoCap5Cruzado.js"]) {
    assert.doesNotMatch(leer(f).replace(/^\s*(\/\*|\*|\/\/).*$/gm, ""), /fpBase\s*\*|\*\s*fpBase|Math\.round\([^)]*fp/i, f);
  }
});

/*
 * EL CASO DE LA MITAD EXACTA (Takamura). 3 de 6 = 50 %: 25 × 0,5 = 12,5 FP.
 * El servidor redondea con round() sobre numeric (0017: v_rend y v_tiempo son
 * numeric), que lleva la mitad hacia arriba; el cliente, con Math.round en
 * src/fp/motor.js. Los dos tienen que dar 13, no 12.
 */
test("★★★ 3 de 6 da 12,5 FP exactos y calcularFP los redondea a 13, como round() sobre numeric en el servidor", () => {
  const SQL = leer("supabase/migrations/0017_detalle_por_item.sql");
  assert.match(SQL, /v_rend\s+numeric;/);
  assert.match(SQL, /v_tiempo\s+numeric;/);
  const pct = D.puntuarR5_1(3);
  assert.equal(pct, 50);
  assert.equal(D.R5_1.fpBase * (pct / 100), 12.5, "el caso tiene que ser una mitad exacta");
  const { fp, desglose } = calcularFP({ dificultad: D.R5_1.dificultad, modalidad: D.R5_1.modalidad, aciertos: pct / 100, duracionMs: 60_000 });
  assert.equal(desglose.factorRendimiento, 0.5);
  assert.equal(desglose.factorTiempo, 1);
  assert.equal(fp, 13);
});

/* ═══════════ LOS PUNTOS DEL FINAL: FORMA, NO SOLO COLOR ═══════════ */

test("★★★ en el final, acierto y error se distinguen por forma: relleno o anillo, no solo por color", async () => {
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P }));
  /* Acierta C.3 y falla las otras cinco. */
  for (const p of P) {
    const id = p.id === "c3" ? clave(p).id : p.opciones.find((o) => !o.correcta).id;
    await tocar(opcion(caja, id));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  const puntos = [...caja.querySelectorAll("[data-punto]")];
  assert.equal(puntos.length, 6);
  const forma = (el) => {
    const st = el.style;
    const relleno = st.background && st.background !== "transparent" && !st.border;
    const anillo = (st.background === "transparent" || st.background === "") && /solid/.test(st.border);
    return relleno ? "relleno" : anillo ? "anillo" : "otra";
  };
  /* La forma se lee del estilo pintado, no de la marca de datos. */
  assert.deepEqual(puntos.map(forma), ["relleno", "anillo", "anillo", "anillo", "anillo", "anillo"]);
  assert.deepEqual(puntos.map((x) => x.dataset.forma), ["relleno", "anillo", "anillo", "anillo", "anillo", "anillo"]);
  /* Dos puntos del mismo resultado se ven iguales; uno de cada clase, distinto aunque se quite el color. */
  const sinColor = (el) => `${el.style.width}|${el.style.height}|${el.style.borderRadius}|${forma(el)}`;
  assert.notEqual(sinColor(puntos[0]), sinColor(puntos[1]), "sin color, acierto y error se ven igual");
  /* Siguen aria-hidden, y el total va en palabras. */
  assert.ok(puntos.every((x) => x.closest("[aria-hidden='true']")));
  assert.deepEqual([...caja.querySelectorAll("[data-n-de-m]")].map((x) => x.textContent), ["1 de 1", "0 de 1", "0 de 4"]);
  desmontar();
});

/* ═══════════ v1.3 · AUTODIAGNÓSTICO: LA PISTA, LA CUENTA A LA VISTA, EL RÓTULO DEL LOTE ═══════════ */

test("★★★ v1.3: la pista se pide antes de responder, sale literal, se va al responder y vuelve cerrada en la siguiente", async () => {
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: () => {} }));
  let vistas = 0;
  for (const p of P) {
    assert.equal(caja.querySelector("[data-pista]"), null, `${p.id}: la pista empieza cerrada`);
    const boton = caja.querySelector("[data-ver-pista]");
    assert.equal(boton.textContent, "Ver pista");
    assert.equal(boton.getAttribute("aria-expanded"), "false");
    await tocar(boton);
    assert.equal(caja.querySelector("[data-ver-pista]"), null);
    assert.equal(caja.querySelector("[data-pista]").textContent, `PISTA${p.pista}`);
    vistas++;
    await tocar(opcion(caja, clave(p).id));
    assert.equal(caja.querySelector("[data-pista]"), null, `${p.id}: al responder la pista se va`);
    assert.equal(caja.querySelector("[data-ver-pista]"), null);
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(vistas, 6);
  desmontar();
});

test("★★★ v1.3: la pista no quita FP — seis aciertos con las seis pistas abiertas dan 100", async () => {
  const fin = [];
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: (...x) => fin.push(x) }));
  for (const p of P) {
    await tocar(caja.querySelector("[data-ver-pista]"));
    await tocar(opcion(caja, clave(p).id));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(fin.length, 1);
  assert.equal(fin[0][0], 100);
  desmontar();
});

/* Avanza hasta la pantalla `id` acertando las de antes. */
async function irA(caja, id) {
  for (const p of P) {
    if (p.id === id) return;
    await tocar(opcion(caja, clave(p).id));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
}

test("★★★ v1.3: en la pantalla 4 la cuenta se ve al responder —acierte o falle— y da 3.400 desde los signos", async () => {
  /* Calculado aquí, a mano, sin la función de los datos. */
  const esperado = 500 + 4000 - 300 - 800;
  assert.equal(D.cuentaDeC8(pantalla("c8")), esperado);
  assert.equal(clave(pantalla("c8")).valor, esperado);
  for (const eleccion of ["c8-c", "c8-a"]) {
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: () => {} }));
    await irA(caja, "c8");
    const lista = caja.querySelector('[data-datos="lista"]');
    /* Antes de responder no se aparta nada: regalaría la respuesta. */
    assert.equal(lista.dataset.resuelta, "no");
    assert.equal(lista.querySelector("[data-signo]"), null);
    assert.equal(lista.querySelector("[data-no-entra]"), null);
    assert.equal(lista.querySelector('[data-dato="resultado"]'), null);
    await tocar(opcion(caja, eleccion));
    assert.equal(lista.dataset.resuelta, "si", eleccion);
    assert.deepEqual([...lista.querySelectorAll("[data-entra]")].map((d) => d.dataset.entra), ["no", "no", "+", "+", "−", "−"]);
    assert.deepEqual([...lista.querySelectorAll("[data-no-entra]")].map((d) => d.textContent), ["no entra", "no entra"]);
    /* Lo que no entra va tachado: la forma lo dice, no el color. */
    for (const id of ["ventas", "devoluciones-ventas"]) {
      const fila = lista.querySelector(`[data-dato="${id}"]`);
      assert.equal(fila.querySelector("span span").style.textDecoration, "line-through", id);
    }
    assert.equal(lista.querySelector('[data-dato="resultado"]').textContent, `Costo de mercancía vendida=${pesos(esperado)}`);
    desmontar();
  }
});

test("★★★ v1.3: en la pantalla 5 LA CUENTA sale al responder, con 25 u en dos cajas y media, y da la clave", async () => {
  const c = D.cuentaDeC9(pantalla("c9"));
  /* A mano: 70 + 100 + 80 = 250 u; 1.260 + 2.000 + 2.000 = 5.260; 250 − 225 = 25. */
  assert.deepEqual([c.unidades, c.total, c.quedan, c.valor], [250, 5260, 25, 526]);
  assert.equal(c.valor, clave(pantalla("c9")).valor);
  assert.equal(D.pesosConCentavos(c.promedio), "$21,04");
  assert.equal(D.pesosConCentavos(5), "$5,00");
  for (const eleccion of ["c9-b", "c9-d"]) {
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: () => {} }));
    await irA(caja, "c9");
    assert.equal(caja.querySelector("[data-cuenta]"), null, "antes de responder no hay cuenta");
    await tocar(opcion(caja, eleccion));
    const cuenta = caja.querySelector("[data-cuenta]");
    assert.ok(cuenta, eleccion);
    assert.deepEqual([...cuenta.querySelectorAll("[data-renglon-cuenta]")].map((x) => x.textContent),
      ["Tenías 250 u por $5.260", "Cada una: $5.260 ÷ 250 = $21,04", "Quedan 25 u × $21,04 = $526"]);
    const cajas = cuenta.querySelector("[data-cajas]");
    assert.equal(cajas.dataset.cajas, "2.5");
    assert.equal(cajas.children.length, 3);
    assert.ok(cajas.querySelector("[data-media-caja]"), "la media caja");
    desmontar();
  }
});

test("★★ v1.3: el rótulo del lote es contenido: 12 px, sin mayúsculas forzadas", async () => {
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: () => {} }));
  await irA(caja, "c9");
  const rotulos = [...caja.querySelectorAll("[data-marca-lote]")];
  assert.deepEqual(rotulos.map((r) => r.textContent), ["Lote 1 · Al inicio", "Lote 2 · Primera compra", "Lote 3 · Segunda compra"]);
  for (const r of rotulos) {
    assert.equal(r.style.fontSize, "12px");
    assert.notEqual(r.style.textTransform, "uppercase");
  }
  desmontar();
});

test("★★ v1.3: cada texto nuevo está, literal, en la tabla «v1.3 · textos nuevos» del paquete (guarda: 8)", () => {
  const seccion = PAQUETE.slice(PAQUETE.indexOf("## v1.3 · textos nuevos"));
  const c = D.cuentaDeC9(pantalla("c9"));
  const I = D.INTERFAZ_R5_1;
  const nuevos = [
    I.verPista, I.marcaPista, I.noEntra, D.RESULTADO_C8, I.marcaCuenta,
    I.tenias(c.unidades, c.total), I.cadaUna(c.total, c.unidades, D.pesosConCentavos(c.promedio)),
    I.quedan(c.quedan, D.pesosConCentavos(c.promedio), c.valor),
  ];
  assert.equal(nuevos.length, 8);
  for (const t of nuevos) {
    assert.ok(seccion.includes(`| ${t} |`), t);
    assert.ok(palabrasDe(t).length < 10, `${t}: llega a 10 palabras y habría que medirlo`);
  }
});
