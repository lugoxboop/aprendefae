import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H6 «¿Quién se enteró primero?» (Célula D) · Hacer · evaluativa · medio · 25 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra, con
 *     la página de cada devolución
 *   · la pantalla de Hanayama v1 (PASA de Shibukawa): la tarjeta trae SOLO la
 *     partida; los dos destinos, siempre en el mismo orden (banco, empresa),
 *     apilados y en DOS RENGLONES FIJOS, con el sujeto en 600; un solo
 *     toque; coral solo en el error; sin figura y sin cifras
 *   · PH8-2: mientras se pregunta, NADA de la respuesta está en el DOM. Se lee
 *     `textContent` y `outerHTML`, que ven lo escondido por CSS; nunca
 *     `innerText`
 *   · el camino, la vista y el motor; la migración 0205; la regla del panel
 *     docente; el «Así se juega» y su atributo propio
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT4H6.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, QuienSeEnteroPrimero, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h6-v1.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0205_t4_quien_se_entero_primero.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const citaDe = (bloque, rotulo) => bloque.match(new RegExp(`^- \\*\\*${rotulo}:\\*\\* ${CITA}`, "m"))?.[1] ?? null;
const DESTINO_POR_NOMBRE = { "Todavía no lo tiene el banco": D.BANCO, "Todavía no lo tiene la empresa": D.EMPRESA };
const PARTIDAS = PAQ.slice(PAQ.indexOf("## Partidas"), PAQ.indexOf("## Cierre")).split(/\n(?=### H6-\d)/).slice(1).map((b) => {
  const n = b.match(/^### H6-(\d)/)[1];
  const [, respuesta, pag] = b.match(/^- \*\*Respuesta:\*\* (Todavía no lo tiene (?:el banco|la empresa)) \(([^)]+)\)/m);
  const errores = [...b.matchAll(new RegExp(`^- \\*\\*Si va a «([^»]+)»:\\*\\* ${CITA}`, "gm"))].map((m) => [DESTINO_POR_NOMBRE[m[1]], m[2]]);
  return {
    id: `h6-${n}`,
    subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
    texto: citaDe(b, "Partida"),
    respuesta: DESTINO_POR_NOMBRE[respuesta],
    pagina: `Basado en el libro, ${pag}`,
    acierto: citaDe(b, "Acierto"),
    errores,
  };
});

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia del paquete de H6 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  const enLaRama = blobEnLaRamaFuente("d4-t4-h6-v1.md");
  if (!enLaRama) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  assert.equal(blobDeLaCopia("d4-t4-h6-v1.md"), enLaRama, "la copia de H6 no es la última versión aprobada");
  assert.equal(blobDeLaCopia("d4-t4-asi-se-juega-v1.md"), blobEnLaRamaFuente("d4-t4-asi-se-juega-v1.md"));
});

test("★★★ ficha: id, nombre, objetivo, consigna, destinos y subtemas son los del paquete; no hay archivos de cambios", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\.\*\* No tiene archivos de cambios/);
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*h6.*-cambios\.md$/.test(f)), [], "hay un archivo de cambios de H6 que esta pieza no ha mirado");
  assert.equal(D.H6_ID, "t4-quien-se-entero-primero");
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H6_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H6 «${D.H6.nombre}»`));
  assert.ok(PAQ.includes(`«${D.H6.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Los dos destinos"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H6.consigna);
  const destinos = PAQ.slice(PAQ.indexOf("## Los dos destinos"), PAQ.indexOf("## Lo que esta actividad no pide"));
  assert.deepEqual([...destinos.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.DESTINOS_H6.map((d) => d.nombre));
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H6.join(" · "));
});

test("★★★ las ocho partidas: texto, subtema, respuesta, página, acierto y error, letra por letra, en el orden del paquete", () => {
  assert.equal(PARTIDAS.length, 8, "la lectura del paquete no encontró sus ocho partidas");
  assert.equal(D.ITEMS_H6.length, 8);
  for (const [k, p] of PARTIDAS.entries()) {
    const it = D.ITEMS_H6[k];
    assert.equal(it.id, p.id);
    assert.equal(it.texto, p.texto, `${p.id}: partida`);
    assert.equal(it.subtema, p.subtema, `${p.id}: subtema`);
    assert.ok(D.SUBTEMAS_H6.includes(it.subtema), `${p.id}: subtema fuera de la ficha`);
    assert.equal(it.respuesta, p.respuesta, `${p.id}: respuesta`);
    assert.equal(it.pagina, p.pagina, `${p.id}: página`);
    assert.equal(it.acierto, p.acierto, `${p.id}: acierto`);
    /* Dos destinos: un solo error, el del destino equivocado. */
    assert.equal(p.errores.length, 1, `${p.id}: el paquete trae más de un error`);
    const [[destinoErrado, error]] = p.errores;
    assert.notEqual(destinoErrado, it.respuesta, `${p.id}: el error es del destino correcto`);
    assert.equal(it.error, error, `${p.id}: error`);
  }
  /* El reparto del paquete: cuatro y cuatro, cada tipo dos veces. */
  const cuenta = (d) => D.ITEMS_H6.filter((x) => x.respuesta === d).length;
  assert.deepEqual([cuenta(D.BANCO), cuenta(D.EMPRESA)], [4, 4]);
  for (const s of D.SUBTEMAS_H6) assert.equal(D.ITEMS_H6.filter((x) => x.subtema === s).length, 2, s);
});

test("★★★ el cierre y su pie son los del paquete", () => {
  const cierre = PAQ.slice(PAQ.indexOf("## Cierre"), PAQ.indexOf("## Reparto"));
  assert.equal(D.CIERRE_H6.texto, cierre.match(new RegExp(`^- ${CITA} \\(`, "m"))[1]);
  assert.equal(D.CIERRE_H6.pie, cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
});

test("★★ sin cifras (la regla de Katsumi), e INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H6.objetivo, ...D.H6.consigna, ...D.ITEMS_H6.flatMap((it) => [it.texto, it.acierto, it.error]), D.CIERRE_H6.texto];
  /* Las fechas construidas (29, 30, 31) no son cifras; un «$» o un monto con miles sí. */
  assert.deepEqual(textos.filter((t) => /\$|\d{1,3}\.\d{3}|\d{4,}/.test(t)), []);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 25, `solo ${medidos.length} textos medidos`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(QuienSeEnteroPrimero, { Marco, items: D.ITEMS_H6, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const destino = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => [D.BOTON_H6.siguiente, D.BOTON_H6.verResumen].includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const otro = (it) => (it.respuesta === D.BANCO ? D.EMPRESA : D.BANCO);

/*
 * PH8-2: lo que delata la respuesta de una partida. Si cualquiera de estas
 * cadenas está en el DOM mientras se pregunta —visible o escondida por CSS—,
 * la respuesta está a un inspector de distancia.
 */
const delatores = (it) => [it.acierto, it.error, it.pagina, D.CORRECTO, D.lectorErrorH6(D.nombreDeDestinoH6(it.respuesta)), D.lectorErrorH6(D.nombreDeDestinoH6(otro(it)))];
const loQueHayEnElDom = (caja) => `${caja.textContent}\n${caja.outerHTML}`;

test("★★★ la tarjeta trae solo la partida: ni página ni «Basado en el libro» antes de responder", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H6) {
      const tarjeta = m.caja.querySelector(`[data-tarjeta-partida="${it.id}"]`);
      assert.ok(tarjeta, `${it.id}: no está su tarjeta`);
      assert.equal(tarjeta.textContent, it.texto, `${it.id}: la tarjeta trae algo más que la partida`);
      assert.doesNotMatch(tarjeta.textContent, /\bpp?\.\s*\d|Basado en el libro/);
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  const m = await montar();
  try {
    const antes = [];
    for (const it of D.ITEMS_H6) {
      const dom = loQueHayEnElDom(m.caja);
      for (const x of delatores(it)) assert.ok(!dom.includes(x), `${it.id}: antes de responder, el DOM ya trae «${x.slice(0, 60)}»`);
      assert.equal(m.caja.querySelectorAll("[data-panel], [data-pagina], [data-texto-retro]").length, 0, `${it.id}: hay devolución montada antes de responder`);
      assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected|pressed)="true"/, `${it.id}: un atributo delata la respuesta`);
      /* Sin el estilo en línea (React reordena sus propiedades al repintar el Opcion compartido). */
      const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");
      antes.push(sinEstilo(m.caja.querySelector("[data-retro]")) + [...m.caja.querySelectorAll("[data-opcion]")].map(sinEstilo).join(""));
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(new Set(antes).size, 1, "los destinos o la región de la devolución cambian según la partida antes de responder");
  } finally { m.desmontar(); }
});

test("★★★ un solo toque por tarjeta: al tocar, los dos destinos se bloquean y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H6[0];
    await tocar(destino(m.caja, otro(it)));
    for (const d of D.DESTINOS_H6) assert.equal(destino(m.caja, d.id).disabled, true, `${d.id}: no se bloqueó`);
    const despues = retro(m.caja);
    await tocar(destino(m.caja, it.respuesta));
    assert.deepEqual(retro(m.caja), despues, "un segundo toque cambió la devolución");
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "error");
  } finally { m.desmontar(); }
});

test("★★★ cada partida, con cada destino: acierto con «Correcto.» y su página; el error con SU texto, la buena revelada, coral solo ahí", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const it of D.ITEMS_H6) {
    for (const elegido of [D.BANCO, D.EMPRESA]) {
      const m = await montar({ items: [it] });
      try {
        await tocar(destino(m.caja, elegido));
        const panel = m.caja.querySelector("[data-panel]");
        const ok = elegido === it.respuesta;
        assert.equal(panel.dataset.panel, ok ? "acierto" : "error", `${it.id} → ${elegido}`);
        assert.deepEqual(retro(m.caja), ok ? [D.CORRECTO, it.acierto] : [it.error], `${it.id} → ${elegido}: texto`);
        assert.equal(panel.querySelector("[data-pagina]").textContent, it.pagina, `${it.id} → ${elegido}: página`);
        assert.equal(coral.test(panel.getAttribute("style")), !ok, `${it.id} → ${elegido}: coral en la devolución`);
        for (const d of D.DESTINOS_H6) {
          const enCoral = coral.test(destino(m.caja, d.id).getAttribute("style") ?? "");
          assert.equal(enCoral, !ok && d.id === elegido, `${it.id} → ${elegido}: coral en «${d.nombre}»`);
        }
        if (!ok) {
          assert.ok(destino(m.caja, it.respuesta).textContent.includes("era esta"), `${it.id}: no se revela la buena`);
          assert.ok(panel.textContent.startsWith(D.lectorErrorH6(D.nombreDeDestinoH6(it.respuesta))));
        }
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ los destinos: siempre dos, banco y luego empresa, apilados a todo el ancho y en DOS renglones fijos con el sujeto en 600", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H6) {
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((o) => o.dataset.opcion), [D.BANCO, D.EMPRESA], `${it.id}: orden`);
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
  const n = await montar();
  try {
    for (const d of D.DESTINOS_H6) {
      const r = destino(n.caja, d.id).querySelector("[data-destino-renglones]");
      assert.ok(r, `${d.id}: el destino no va en renglones`);
      const renglones = [...r.children].map((x) => x.textContent);
      assert.deepEqual(renglones, ["Todavía no lo tiene", d.id === D.BANCO ? "el banco" : "la empresa"], `${d.id}: renglones`);
      /* Los dos renglones, unidos, son el nombre del paquete. */
      assert.equal(renglones.join(" "), d.nombre);
    }
  } finally { n.desmontar(); }
  /* Apilados (una columna), cada renglón sin partirse y el segundo en 600. */
  assert.match(VISTA, /<Opciones columnas="minmax\(0, 1fr\)">\s*\{DESTINOS_H6\.map/);
  const css = VISTA.match(/const CSS_T4H6 = `([\s\S]*?)`;/)[1];
  assert.match(css, /\.t4h6-dest > span \{ white-space: nowrap; \}/);
  assert.match(css, /\.t4h6-dest > span \+ span \{ font-weight: 600; \}/);
  /* Barajar: una función que invierte, para ver que se usa la que llega. Los destinos no se barajan. */
  assert.deepEqual(D.sortearH6((xs) => [...xs].reverse()).map((x) => x.id), [...D.ITEMS_H6].reverse().map((x) => x.id));
});

test("★★★ sin figura y sin cifras en la pantalla: la de las libretas pintaría en cuál falta, que es la respuesta", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H6) {
      for (const fase of ["pregunta", "respuesta"]) {
        assert.equal(m.caja.querySelector("figure, svg:not([aria-hidden]), [data-figura]"), null, `${it.id} (${fase}): hay figura`);
        assert.doesNotMatch(m.caja.textContent, /\$|\d{1,3}\.\d{3}/, `${it.id} (${fase}): hay una cifra en pantalla`);
        if (fase === "pregunta") await tocar(destino(m.caja, otro(it)));
      }
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
});

test("★★★ al terminar: el cierre con su texto y su pie, y onCompletar con el porcentaje y el detalle (lo elegido en el error)", async () => {
  const m = await montar();
  try {
    for (const [k, it] of D.ITEMS_H6.entries()) {
      await tocar(destino(m.caja, k === 0 ? otro(it) : it.respuesta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(m.completados.length, 1);
    const [pct, ms, detalle] = m.completados[0];
    assert.equal(pct, (7 / 8) * 100);
    assert.equal(typeof ms, "number");
    assert.equal(detalle.length, 8);
    assert.deepEqual(detalle[0], { item: "h6-1", ok: false, intentos: 1, respuesta: D.EMPRESA, orden: 1 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH6(7, 8));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H6.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H6.pie);
  } finally { m.desmontar(); }
});

test("★★ en modo demo no reporta nada ni pide el botón de seguir", async () => {
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H6] });
  try {
    await tocar(destino(m.caja, D.BANCO));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(siguiente(m.caja), undefined);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h6]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H6_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»: la prueba no está mirando el caso de las dos");
    assert.equal(caja.querySelectorAll("[data-t4-h6-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h6]").length, 1, "hay más de un [data-t4-h6] en la página");
    const juego = caja.querySelector("[data-t4-h6]");
    assert.ok(juego.closest("[data-partida]"), "el [data-t4-h6] no es el de la partida");
    assert.equal(juego.closest("[data-asj-demo]"), null, "el [data-t4-h6] está dentro de la demo");
    const siguienteAsj = [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === "Siguiente");
    await act(async () => { siguienteAsj.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.equal(caja.querySelectorAll("[data-t4-h6-demo]").length, 0);
    assert.equal(caja.querySelectorAll("[data-t4-h6]").length, 1);
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A4: evaluativa, medio, 25 FP; las de Aprender siguen sin FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H6_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H6_ID), ids.indexOf("t4-a4-bancos-y-notas") + 1);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H6_ID).Mecanica, QuienSeEnteroPrimero);
  /* La etiqueta del panel docente que da la ficha: el nombre y el tema. */
  assert.equal(PAQ.match(/\| Etiqueta del panel docente \| «([^»]+)» \|/)[1], `${D.H6.nombre} · ${TEMA.title}`);
});

test("★★★ la 0205: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t4-quien-se-entero-primero',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i, "solo puede insertar y consultar");
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-quien-se-entero-primero';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-quien-se-entero-primero';$/m);
  assert.match(MIGRACION, /^-- 0205 — CONTABILIDAD, T4: H6 «¿QUIÉN SE ENTERÓ PRIMERO\?» \(Célula D\)$/m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H6_ID)), ["0205_t4_quien_se_entero_primero.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0205")), ["0205_t4_quien_se_entero_primero.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de la partida, y la regla vive en el bloque de T4", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H6) {
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 8);
    for (const id of ids) assert.equal(etiquetaDeItem(D.H6_ID, id), recortar(D.ITEMS_H6.find((x) => x.id === id).texto), id);
  } finally { m.desmontar(); }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-quien-se-entero-primero": \(id\) => partidaDeItemT4H6\(id\),/);
  for (const it of D.ITEMS_H6) assert.ok(!fuente.includes(it.texto), `${it.id}: la partida está copiada en etiquetasItem.js`);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no está en el banco; la mano TOCA «Todavía no lo tiene el banco»", async () => {
  const asi = ASI_SE_JUEGA[D.H6_ID];
  assert.ok(asi, "H6 no tiene «Así se juega»");
  const sec = ASI.slice(ASI.indexOf("## H6 · "), ASI.indexOf("## H7 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H6.texto, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.titulo, D.H6.nombre);
  assert.equal(asi.consigna, D.H6.consigna.join(" "));
  assert.deepEqual(asi.demo.items, [D.EJEMPLO_H6]);
  assert.ok(!D.ITEMS_H6.some((x) => x.texto === D.EJEMPLO_H6.texto), "el ejemplo está en el banco");
  assert.equal(D.EJEMPLO_H6.respuesta, D.BANCO);
  /* El paquete dice «arrastra»; los destinos son de un toque (Hanayama H6 v1 §1): la mano toca, y el destino es el del paquete. */
  assert.match(sec, /La mano arrastra la tarjeta a «Todavía no lo tiene el banco»\./);
  assert.deepEqual(asi.guion.toques.map((x) => x.en), [`[data-opcion="${D.BANCO}"] button`]);
  /* El guion, contra el componente real en modo demo: acierta. */
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H6] });
  try {
    for (const toque of asi.guion.toques) await tocar(m.caja.querySelector(toque.en));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
