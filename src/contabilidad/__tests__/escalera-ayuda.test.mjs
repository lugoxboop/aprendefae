import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 2 · LA ESCALERA DE AYUDA EN LAS PREGUNTAS DE APRENDER (T7 y T5, Célula C).
 *
 *   · primer error: la pista; segundo: la respuesta con su porqué; sin
 *     pista, como hoy (la devolución de la opción tocada)
 *   · las once piezas de Aprender con preguntas de opción la usan
 *   · ninguna pista nombra la respuesta
 *   · TODO (deuda): toda pregunta tiene pista —llega con las pistas de Near—
 *   · la opción correcta no aparece en las 2 pantallas anteriores, salvo como
 *     dato del enunciado; lo publicado que hoy lo viola queda listado como
 *     deuda conocida, y la lista no puede crecer ni quedar vieja
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
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const E = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");
const { default: LaFacturaCompleta } = await import("../../components/mecanicas/libros/t7/LaFacturaCompleta.jsx");
const { PIEZA_LA_FACTURA_COMPLETA } = await import("../../data/contabilidadT7_1_ap2.js");

const RAIZ = new URL("../../../", import.meta.url);
const DATOS = new URL("src/data/", RAIZ);
const T7 = new URL("src/components/mecanicas/libros/t7/", RAIZ);

/* Las piezas de Aprender de la célula: todo módulo de datos de T7 o de T5 de la célula que exporta un objeto con `pantallas`. */
const PIEZAS = [];
for (const f of readdirSync(DATOS).filter((x) => /^contabilidadT7_.*\.js$|^contabilidadT5_n\d+\.js$/.test(x))) {
  for (const v of Object.values(await import(new URL(f, DATOS).href))) if (v && Array.isArray(v.pantallas) && v.id) PIEZAS.push(v);
}
const PREGUNTAS = PIEZAS.flatMap((p) => p.pantallas.map((s, k) => ({ pieza: p, pantalla: s, k }))).filter((x) => Array.isArray(x.pantalla.opciones) && x.pantalla.opciones.some((o) => o.correcta));
const norm = (s) => String(s).toLowerCase().replace(/[«»"“”]/g, "").replace(/[.:;]\s*$/, "").trim();

/* ═══════════ 1 · LA REGLA ═══════════ */

const P = {
  id: "p", tipo: "eleccion", parrafos: [], pregunta: "¿Cuál?",
  opciones: [
    { id: "a", texto: "La buena.", correcta: true },
    { id: "b", texto: "La mala.", correcta: false, devolucion: "No es esa: mira el libro." },
    { id: "c", texto: "La otra mala.", correcta: false, devolucion: "Tampoco." },
  ],
  pie: null, error: { pie: null }, acierto: { texto: "Así es. Porque el libro lo dice.", pie: null },
};

test("★★★ sin pista, como hoy: cada error muestra la devolución de la opción tocada", () => {
  assert.deepEqual(E.textosDelError(P, P.opciones[1], 1), ["No es esa: mira el libro."]);
  assert.deepEqual(E.textosDelError(P, P.opciones[2], 2), ["Tampoco."]);
});

test("★★★ el porqué tras un error: sin «Así es.», «Así es:» ni «Exacto.», y en mayúscula; el acierto en `texto` o en `textos`", () => {
  assert.equal(E.sinAsiEs("Así es. El libro lo dice."), "El libro lo dice.");
  assert.equal(E.sinAsiEs("Así es: la rebaja es menor."), "La rebaja es menor.");
  assert.equal(E.sinAsiEs("Exacto. Cada empresa reversa lo suyo."), "Cada empresa reversa lo suyo.");
  assert.equal(E.sinAsiEs("$1.000 × 2 = $2.000."), "$1.000 × 2 = $2.000.");
  const conTextos = { ...P, pista: "Mira el libro.", acierto: { textos: ["Así es. Uno.", "Dos."] } };
  assert.deepEqual(E.textosDelError(conTextos, P.opciones[1], 2), ["La respuesta es «La buena».", "Uno.", "Dos."]);
});

test("★★★ con pista: el primer error da la pista; el segundo, la respuesta con su porqué", () => {
  const con = { ...P, pista: "Piensa en lo que pide el libro." };
  assert.deepEqual(E.textosDelError(con, con.opciones[1], 1), ["Piensa en lo que pide el libro."]);
  assert.deepEqual(E.textosDelError(con, con.opciones[2], 2), ["La respuesta es «La buena».", "Porque el libro lo dice."]);
  assert.deepEqual(E.textosDelError(con, con.opciones[1], 3), ["La respuesta es «La buena».", "Porque el libro lo dice."]);
  assert.equal(E.sinAsiEs("Así es: $1.000 × 2 = $2.000."), "$1.000 × 2 = $2.000.");
});

/* ═══════════ 2 · MONTADA ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const error = (caja) => [...caja.querySelectorAll('[data-mensaje="error"] [data-texto]')].map((p) => p.textContent);

test("★★★ montada (ControlInterno): pista al primer error, respuesta y porqué al segundo, y sin pista como hoy", async () => {
  for (const [pantalla, esperado] of [
    [{ ...P, pista: "Piensa en lo que pide el libro." }, [["Piensa en lo que pide el libro."], ["La respuesta es «La buena».", "Porque el libro lo dice."]]],
    [P, [["No es esa: mira el libro."], ["Tampoco."]]],
  ]) {
    const m = await montar(h(ControlInterno, { pieza: { id: "x", titulo: "X", pantallas: [pantalla] }, rotulo: "R" }));
    try {
      for (const [k, op] of ["b", "c"].entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${op}"]`));
        await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
        assert.deepEqual(error(m.caja), esperado[k], `error ${k + 1}`);
        await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
      }
    } finally {
      m.desmontar();
    }
  }
});

/* ═══════════ 2b · LAS LÍNEAS DE DEBE O HABER ═══════════ */

const PL = { id: "pl", lineas: [
  { id: "x", lado: "debe", pista: "¿Sube o baja?", devolucion: "Un activo que sube va al debe." },
  { id: "y", lado: "haber", devolucion: "Va al haber." },
] };

test("★★★ línea con pista: primer error, la pista; segundo, la respuesta y su porqué, y la línea se cierra en su lado", () => {
  const [x, y] = PL.lineas;
  assert.deepEqual(E.textosDeLinea(PL, x, 1), ["¿Sube o baja?"]);
  assert.deepEqual(E.textosDeLinea(PL, x, 2), ["La respuesta es «Debe».", "Un activo que sube va al debe."]);
  assert.equal(E.lineaCerrada(PL, x, 1), false);
  assert.equal(E.lineaCerrada(PL, x, 2), true);
  /* Sin pista, como hoy: la devolución en cada error, y nunca se cierra. */
  assert.deepEqual(E.textosDeLinea(PL, y, 1), ["Va al haber."]);
  assert.deepEqual(E.textosDeLinea(PL, y, 3), ["Va al haber."]);
  assert.equal(E.lineaCerrada(PL, y, 5), false);
  /* La pista de la pantalla vale para todas sus líneas. */
  assert.deepEqual(E.textosDeLinea({ ...PL, pista: "La de todas." }, y, 1), ["La de todas."]);
  /* «Probar otra»: la cerrada queda en su lado; la otra mala se vacía. */
  const puesto = E.puestoTrasProbarOtra({ x: "haber", y: "debe" }, ["x", "y"], PL.lineas, (l) => l.id === "x");
  assert.deepEqual(puesto, { x: "debe" });
  assert.deepEqual(E.sumarFallosDeLineas({ x: 1 }, ["x", "y"]), { x: 2, y: 1 });
});

test("★★★ montada (T7-1 A2, la compra): pista al primer error, respuesta al segundo, y la línea queda en su lado sin moverse", async () => {
  const k = PIEZA_LA_FACTURA_COMPLETA.pantallas.findIndex((p) => p.id === "lados-de-la-compra");
  const pantalla = PIEZA_LA_FACTURA_COMPLETA.pantallas[k];
  const m = await montar(h(LaFacturaCompleta, { pieza: { ...PIEZA_LA_FACTURA_COMPLETA, pantallas: PIEZA_LA_FACTURA_COMPLETA.pantallas.slice(k) }, rotulo: "R" }));
  const casilla = (id, lado) => m.caja.querySelector(`[data-linea="${id}"][data-lado="${lado}"]`);
  const otro = (l) => (l === "debe" ? "haber" : "debe");
  const iva = pantalla.lineas.find((l) => l.id === "iva");
  const errorDe = (id) => [...m.caja.querySelectorAll(`[data-fila="${id}"] [data-texto]`)].map((p) => p.textContent).filter((t) => t !== "Incorrecto.");
  try {
    /* Primera vuelta: el IVA mal; las demás bien. */
    for (const l of pantalla.lineas) await tocar(casilla(l.id, l.id === "iva" ? otro(l.lado) : l.lado));
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    assert.ok(errorDe("iva").includes(iva.pista), "primer error: la pista");
    assert.ok(!errorDe("iva").includes(iva.devolucion), "la pista no viene con la respuesta");
    await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
    assert.equal(casilla("iva", iva.lado).dataset.llena, "no", "tras el primer error la línea se vacía");
    /* Segunda vuelta: el IVA mal otra vez. */
    await tocar(casilla("iva", otro(iva.lado)));
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    assert.ok(errorDe("iva").join(" ").includes("La respuesta es «Debe».") && errorDe("iva").join(" ").includes(iva.devolucion), "segundo error: la respuesta y su porqué");
    await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
    assert.equal(casilla("iva", iva.lado).dataset.llena, "si", "la línea cerrada queda en su lado");
    await tocar(casilla("iva", otro(iva.lado)));
    assert.equal(casilla("iva", iva.lado).dataset.llena, "si", "y ya no se mueve");
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    assert.equal(m.caja.querySelector("[data-lados]").dataset.estado, "acierto");
  } finally {
    m.desmontar();
  }
});

test("★★★ las seis piezas con líneas de Debe o Haber usan la escalera de líneas", () => {
  const usan = readdirSync(T7).filter((f) => f.endsWith(".jsx") && readFileSync(new URL(f, T7), "utf8").includes("textosDeLinea(pantalla, l, fallosLinea[l.id] ?? 0)"));
  assert.deepEqual(usan.sort(), ["DevolucionesEnPeriodico.jsx", "ElCierreEnPeriodico.jsx", "LaCuentaQueSiSeMueve.jsx", "LaFacturaCompleta.jsx", "LaVentaEnDosAsientos.jsx", "PantallasT7_2.jsx"]);
  for (const f of usan) {
    const src = readFileSync(new URL(f, T7), "utf8");
    assert.doesNotMatch(src, /textos=\{\[l\.devolucion\]\}/, f);
    assert.match(src, /puestoTrasProbarOtra\(p, malas, pantalla\.lineas, cerrada\)/, f);
    assert.match(src, /if \(estado !== "colocando" \|\| cerrada\(l\)\) return;/, f);
  }
});

test("★★★ las once piezas de Aprender con preguntas de opción usan la escalera", () => {
  const usan = readdirSync(T7).filter((f) => f.endsWith(".jsx") && readFileSync(new URL(f, T7), "utf8").includes("textosDelError(pantalla, opcion, fallos)"));
  assert.deepEqual(usan.sort(), [
    "ControlInterno.jsx", "DevolucionesEnPeriodico.jsx", "ElCierreEnPeriodico.jsx", "ImportadosYFletes.jsx", "LaCuentaQueNoSeMueve.jsx",
    "LaCuentaQueSiSeMueve.jsx", "LaFacturaCompleta.jsx", "LaVentaEnDosAsientos.jsx", "PantallasT7_2.jsx", "PantallasT7_3.jsx", "TresFormas.jsx",
  ]);
  /* Y ninguna muestra ya la devolución sola en una pregunta de opción. */
  for (const f of usan) assert.doesNotMatch(readFileSync(new URL(f, T7), "utf8"), /textos=\{\[opcion\.devolucion\]\}/, f);
});

/* ═══════════ 3 · LAS PISTAS ═══════════ */

test("★★★ ninguna pista nombra la respuesta", () => {
  assert.ok(PREGUNTAS.length >= 40, `solo ${PREGUNTAS.length} preguntas`);
  const malas = PREGUNTAS.filter((x) => x.pantalla.pista && norm(x.pantalla.pista).includes(norm(x.pantalla.opciones.find((o) => o.correcta).texto)));
  assert.deepEqual(malas.map((x) => `${x.pieza.id} · ${x.pantalla.id}`), []);
});

/* Obligatoria desde que entraron las pistas de Near (lote 2, 80 pistas en 22 piezas). */
test("★★★ toda pregunta de Aprender tiene su pista", () => {
  const sin = PREGUNTAS.filter((x) => !x.pantalla.pista).map((x) => `${x.pieza.id} · ${x.pantalla.id}`);
  assert.deepEqual(sin, []);
});

/* Las líneas de Debe o Haber de Aprender: cada una con su pista, o la de su pantalla si la comparten. */
const LINEAS = PIEZAS.flatMap((p) => p.pantallas.filter((s) => Array.isArray(s.lineas) && s.lineas.some((l) => l.lado)).flatMap((s) => s.lineas.map((l) => ({ pieza: p, pantalla: s, linea: l }))));

test("★★★ toda línea de Debe o Haber de Aprender tiene su pista", () => {
  assert.ok(LINEAS.length >= 28, `solo ${LINEAS.length} líneas`);
  assert.deepEqual(LINEAS.filter((x) => !E.pistaDeLinea(x.pantalla, x.linea)).map((x) => `${x.pieza.id} · ${x.pantalla.id} · ${x.linea.id}`), []);
});

test("★★★ ninguna pista de línea dice el lado: pregunta por él", () => {
  const dice = LINEAS.filter(({ pantalla, linea }) => new RegExp(`\\b(al|en el|va al) ${linea.lado}\\b`, "i").test(E.pistaDeLinea(pantalla, linea)));
  assert.deepEqual(dice.map((x) => `${x.pieza.id} · ${x.pantalla.id} · ${x.linea.id}`), []);
});

/* ═══════════ 3b · LAS PISTAS Y EL ANEXO, LETRA POR LETRA CONTRA NEAR ═══════════ */

const PAQUETES = new URL("orquestador/conocimiento/paquetes/", RAIZ);
const PISTAS_MD = readFileSync(new URL("lote2-pistas-v1.md", PAQUETES), "utf8");
const ANEXO_MD = readFileSync(new URL("lote2-anexo-v1.md", PAQUETES), "utf8");

/* Cada fila de la tabla de Near: pieza, índice, pantalla, línea (si la hay) y la pista. */
function filasDeNear() {
  const filas = [];
  let pieza = null;
  for (const l of PISTAS_MD.split("\n")) {
    const t = l.match(/^### (\S+) · /);
    if (t) { pieza = t[1]; continue; }
    const m = l.match(/^\| P(\d+) · `([^`]+)`(?: · ([^|²]+?))?( ²)? \| .*? \| «(.*)» \| \d+ \| [\d,]+ \|$/);
    if (m && pieza) filas.push({ pieza, k: Number(m[1]), pantalla: m[2], linea: m[3]?.trim() ?? null, pista: m[5] });
  }
  return filas;
}

test("★★★ las 80 pistas de Near están en los datos, letra por letra, en su pantalla (por índice y por id) o en su línea", () => {
  const filas = filasDeNear();
  assert.equal(filas.length, 80);
  assert.equal(filas.filter((f) => !f.linea).length, 56);
  const porId = Object.fromEntries(PIEZAS.map((p) => [p.id, p]));
  for (const f of filas) {
    const pz = porId[f.pieza];
    assert.ok(pz, `no está la pieza ${f.pieza}`);
    const s = pz.pantallas[f.k];
    assert.equal(s?.id, f.pantalla, `${f.pieza}: P${f.k}`);
    const dato = !f.linea ? s.pista : f.linea === "las 5 líneas" ? s.pista : s.lineas.find((l) => l.id === f.linea)?.pista;
    assert.equal(dato, f.pista, `${f.pieza} · ${f.pantalla}${f.linea ? ` · ${f.linea}` : ""}`);
  }
  /* Y al revés: en los datos no hay pistas que Near no escribió. */
  const enDatos = [...PREGUNTAS.map((x) => x.pantalla.pista), ...LINEAS.map((x) => x.linea.pista).filter(Boolean)];
  for (const p of enDatos) assert.ok(filas.some((f) => f.pista === p), `pista sin fila en el paquete: «${p}»`);
});

test("★★★ anexo: las 10 preguntas que tenían dos opciones tienen tres, con la tercera de Near letra por letra", () => {
  const filas = [...ANEXO_MD.matchAll(/^\| (t7-\S+) \| P\d+ · `([^`]+)` \| .*? \| \*\*(.+?)\*\* \| «(.+?)» \| [\d,]+ \|$/gm)];
  assert.equal(filas.length, 10);
  const porId = Object.fromEntries(PIEZAS.map((p) => [p.id, p]));
  for (const [, pieza, pantalla, texto, devolucion] of filas) {
    const s = porId[pieza].pantallas.find((x) => x.id === pantalla);
    assert.equal(s.opciones.length, 3, `${pieza} · ${pantalla}`);
    const nueva = s.opciones.find((o) => o.texto === texto);
    assert.ok(nueva && !nueva.correcta, `${pieza} · ${pantalla}: falta «${texto}»`);
    assert.equal(nueva.devolucion, devolucion);
  }
  /* El cambio de texto de una opción correcta. */
  const cadena = porId["t7-3-descuentos-en-cadena"].pantallas.find((x) => x.id === "ejemplo");
  assert.equal(cadena.opciones.find((o) => o.correcta).texto, "No: le rebaja menos del 23 %");
  assert.ok(ANEXO_MD.includes("| t7-3-descuentos-en-cadena · P2 · opción correcta | «No» | «No: le rebaja menos del 23 %» |"));
  /* Ninguna pregunta de opción de Aprender se queda en dos. */
  assert.deepEqual(PREGUNTAS.filter((x) => x.pantalla.opciones.length < 3).map((x) => `${x.pieza.id} · ${x.pantalla.id}`), []);
});

/* ═══════════ 4 · LA RESPUESTA NO SE ADELANTA ═══════════ */

/*
 * Para cada pregunta, el texto de su opción correcta no puede estar en las 2
 * pantallas anteriores. Cuenta todo el texto de esas pantallas salvo lo que es
 * dato o interfaz: el enunciado y la ficha (los datos), las opciones, los
 * pies, las figuras y los botones.
 */
const PERMITIDAS = new Set(["opciones", "pie", "id", "tipo", "boton", "enunciado", "ficha", "datos", "error", "figura", "alt"]);
const textos = (v, clave = null, out = []) => {
  if (clave && PERMITIDAS.has(clave)) return out;
  if (typeof v === "string") out.push([clave, v]);
  else if (Array.isArray(v)) v.forEach((x) => textos(x, clave, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) textos(x, k, out);
  return out;
};
function adelantos() {
  const out = new Set();
  for (const { pieza, pantalla, k } of PREGUNTAS) {
    const c = norm(pantalla.opciones.find((o) => o.correcta).texto);
    for (const d of [1, 2]) {
      const prev = pieza.pantallas[k - d];
      if (!prev) continue;
      for (const [clave] of textos(prev).filter(([, t]) => norm(t).includes(c))) out.add(`${pieza.id} · ${pantalla.id} ← ${prev.id}.${clave}`);
    }
  }
  return [...out].sort();
}

/* Lo publicado que hoy lo viola (medido el 15 de octubre de 2026): deuda conocida, en revisión. Se quita de aquí al corregirse. */
const DEUDA = [
  "t7-1-a1-la-cuenta-que-no-se-mueve · pregunta-conteo ← la-consecuencia.parrafos",
  "t7-1-a1-la-cuenta-que-no-se-mueve · pregunta-conteo ← pregunta-compra.texto",
  "t7-3-descuento-comercial · dos-clases ← portada.objetivo",
  "t7-3-descuento-condicionado · cual-le-toca ← condiciones.lleva",
  "t7-3-descuento-condicionado · cual-le-toca ← condiciones.parrafos",
  "t7-3-descuento-condicionado · cual-le-toca ← ejemplo.lleva",
  "t7-3-descuento-condicionado · sobre-que ← ejemplo.despues",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.despues",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.lado",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.texto",
  "t7-3-descuento-en-dos-libros · cierre ← repaso.lado",
  "t7-3-descuento-en-dos-libros · cierre ← repaso.parrafos",
  "t7-3-descuento-en-dos-libros · el-pago ← repaso.lado",
  "t7-3-descuento-en-dos-libros · el-pago ← repaso.parrafos",
  "t7-3-provision-inventarios · la-perdida ← ejemplo.cuenta",
  "t7-3-provision-inventarios · la-perdida ← que-es.parrafos",
  "t7-3-sobrantes-y-faltantes · faltante ← sobrante.lado",
  "t7-3-sobrantes-y-faltantes · faltante ← sobrante.parrafos",
];

test("★★★ la opción correcta no se adelanta en las 2 pantallas anteriores (fuera de la deuda conocida)", () => {
  const hoy = adelantos();
  assert.deepEqual(hoy.filter((x) => !DEUDA.includes(x)), [], "adelantos nuevos");
  /* La deuda no puede quedar vieja: lo que ya se corrigió sale de la lista. */
  assert.deepEqual(DEUDA.filter((x) => !hoy.includes(x)), [], "ya corregidos: sácalos de DEUDA");
});
