import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H1 «¿Entra o sale de Caja?» (Célula D) · Hacer · exploratoria · 10 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra (la
 *     copia es la de la punta de su rama, PR #173), con la página de cada
 *     devolución; H1-8 sin página
 *   · la pantalla de Hanayama v1.1: la tarjeta trae SOLO el hecho; los tres
 *     destinos en orden fijo y apilados; un solo toque; coral solo en el error
 *   · PH8-2: mientras se pregunta, NADA de la respuesta está en el DOM. Se lee
 *     `textContent` y `outerHTML`, que ven lo escondido por CSS; nunca
 *     `innerText`
 *   · el camino, la vista y el motor; la migración 0200; la regla del panel
 *     docente; el «Así se juega»
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

const D = await import("../../data/contabilidadT4H1.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, EntraOSaleDeCaja, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h1-v1.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0200_t4_entra_o_sale_de_caja.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const citaDe = (bloque, rotulo) => bloque.match(new RegExp(`^- \\*\\*${rotulo}:?\\*\\*:? ${CITA}`, "m"))?.[1] ?? null;
const DESTINO_POR_NOMBRE = { "Debe de Caja": D.DEBE, "Haber de Caja": D.HABER, "Caja no se mueve": D.NO_SE_MUEVE };
const HECHOS = PAQ.slice(PAQ.indexOf("## Hechos"), PAQ.indexOf("## Cierre")).split(/\n(?=### H1-\d)/).slice(1).map((b) => {
  const n = b.match(/^### H1-(\d)/)[1];
  const respuesta = b.match(/^- \*\*Respuesta:\*\* (Debe de Caja|Haber de Caja|Caja no se mueve)/m)[1];
  const errores = Object.fromEntries([...b.matchAll(new RegExp(`^- \\*\\*Si va a «([^»]+)»\\*\\*[^:]*: ${CITA}`, "gm"))].map((m) => [DESTINO_POR_NOMBRE[m[1]], m[2]]));
  return {
    id: `h1-${n}`,
    bloque: b,
    subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
    texto: citaDe(b, "Hecho"),
    respuesta: DESTINO_POR_NOMBRE[respuesta],
    acierto: citaDe(b, "Acierto"),
    errores,
  };
});
/* La página de cada devolución: el párrafo «Página.» del paquete, y la nota de H1-7 y H1-8. */
const PARRAFO_PAGINA = PAQ.match(/^\*\*Página\.\*\* (.+)$/m)?.[1] ?? "";

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia del paquete de H1 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  const enLaRama = blobEnLaRamaFuente("d4-t4-h1-v1.md");
  if (!enLaRama) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  assert.equal(blobDeLaCopia("d4-t4-h1-v1.md"), enLaRama, "la copia de H1 no es la última versión aprobada");
  assert.equal(blobDeLaCopia("d4-t4-asi-se-juega-v1.md"), blobEnLaRamaFuente("d4-t4-asi-se-juega-v1.md"));
});

test("★★★ ficha: id, nombre, objetivo, consigna, destinos y subtemas son los del paquete", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\*\*/);
  assert.equal(D.H1_ID, "t4-entra-o-sale-de-caja");
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H1_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H1 «${D.H1.nombre}»`));
  assert.ok(PAQ.includes(`«${D.H1.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Los tres destinos"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H1.consigna);
  const destinos = PAQ.slice(PAQ.indexOf("## Los tres destinos"), PAQ.indexOf("## Hechos"));
  assert.deepEqual([...destinos.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.DESTINOS_H1.map((d) => d.nombre));
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H1.join(" · "));
});

test("★★★ los ocho hechos: texto, subtema, respuesta, acierto y cada error, letra por letra, en el orden del paquete", () => {
  assert.equal(HECHOS.length, 8, "la lectura del paquete no encontró sus ocho hechos");
  assert.equal(D.ITEMS_H1.length, 8);
  for (const [k, p] of HECHOS.entries()) {
    const it = D.ITEMS_H1[k];
    assert.equal(it.id, p.id);
    assert.equal(it.texto, p.texto, `${p.id}: hecho`);
    assert.equal(it.subtema, p.subtema, `${p.id}: subtema`);
    assert.ok(D.SUBTEMAS_H1.includes(it.subtema), `${p.id}: subtema fuera de la ficha`);
    assert.equal(it.respuesta, p.respuesta, `${p.id}: respuesta`);
    assert.equal(it.acierto, p.acierto, `${p.id}: acierto`);
    assert.deepEqual(it.errores, p.errores, `${p.id}: errores`);
    /* Un error por cada destino equivocado, y ninguno para el correcto. */
    assert.deepEqual(Object.keys(it.errores).sort(), D.DESTINOS_H1.map((d) => d.id).filter((x) => x !== it.respuesta).sort());
  }
  /* El reparto del paquete: tres, dos y tres. */
  const cuenta = (d) => D.ITEMS_H1.filter((x) => x.respuesta === d).length;
  assert.deepEqual([cuenta(D.DEBE), cuenta(D.HABER), cuenta(D.NO_SE_MUEVE)], [3, 2, 3]);
});

test("★★★ la página de cada devolución es la del paquete; H1-8 no la lleva, a propósito", () => {
  assert.ok(PARRAFO_PAGINA.length > 50, "no se leyó el párrafo «Página.» del paquete");
  const esperada = { "h1-1": "p. 180", "h1-2": "p. 180", "h1-3": "p. 180", "h1-4": "p. 187", "h1-5": "pp. 179-180", "h1-6": "p. 186", "h1-7": "p. 180" };
  for (const [id, pag] of Object.entries(esperada)) {
    const n = id.slice(3);
    assert.ok(new RegExp(`H1-${n}[^;.]*?${pag.replace(/\./g, "\\.")}`).test(PARRAFO_PAGINA) || (id === "h1-7" && /\*\*H1-7, p\. 180\*\*/.test(PARRAFO_PAGINA)), `${id}: el paquete no da ${pag}`);
    assert.equal(D.ITEMS_H1.find((x) => x.id === id).pagina, `Basado en el libro, ${pag}`, `${id}: página`);
  }
  assert.match(PARRAFO_PAGINA, /Solo H1-8 va sin página, a propósito/);
  assert.equal(D.ITEMS_H1.find((x) => x.id === "h1-8").pagina, null);
  /* El pie del cierre y su texto. */
  assert.equal(D.CIERRE_H1.pie, PAQ.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
  assert.ok(PAQ.slice(PAQ.indexOf("## Cierre")).includes(`«${D.CIERRE_H1.texto}»`));
});

test("★★ sin cifras, e INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H1.objetivo, ...D.H1.consigna, ...D.ITEMS_H1.flatMap((it) => [it.texto, it.acierto, ...Object.values(it.errores)]), D.CIERRE_H1.texto];
  assert.deepEqual(textos.filter((t) => /\$|\d{2,}/.test(t)), []);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos medidos`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(EntraOSaleDeCaja, { Marco, items: D.ITEMS_H1, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const destino = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => [D.BOTON_H1.siguiente, D.BOTON_H1.verResumen].includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const errados = (it) => Object.keys(it.errores);

/*
 * PH8-2: lo que delata la respuesta de un hecho. Si cualquiera de estas
 * cadenas está en el DOM mientras se pregunta —visible o escondida por CSS—,
 * la respuesta está a un inspector de distancia.
 */
const delatores = (it) => [it.acierto, ...Object.values(it.errores), it.pagina, D.CORRECTO, D.lectorErrorH1(D.nombreDeDestinoH1(it.respuesta))].filter(Boolean);
const loQueHayEnElDom = (caja) => `${caja.textContent}\n${caja.outerHTML}`;

test("★★★ la tarjeta trae solo el hecho: ni pie, ni página, ni «Basado en el libro» antes de responder (PH1-1)", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H1) {
      const tarjeta = m.caja.querySelector(`[data-tarjeta-hecho="${it.id}"]`);
      assert.ok(tarjeta, `${it.id}: no está su tarjeta`);
      assert.equal(tarjeta.textContent, it.texto, `${it.id}: la tarjeta trae algo más que el hecho`);
      assert.doesNotMatch(tarjeta.textContent, /\bpp?\.\s*\d|Basado en el libro/);
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  const m = await montar();
  try {
    /* Lo que se ve antes de responder es lo mismo para los ocho, salvo el hecho y su id. */
    const antes = [];
    for (const it of D.ITEMS_H1) {
      const dom = loQueHayEnElDom(m.caja);
      for (const x of delatores(it)) assert.ok(!dom.includes(x), `${it.id}: antes de responder, el DOM ya trae «${x.slice(0, 60)}»`);
      /* Ningún atributo marca el destino correcto. */
      assert.equal(m.caja.querySelectorAll('[data-panel], [data-pagina], [data-texto-retro]').length, 0, `${it.id}: hay devolución montada antes de responder`);
      assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected)="true"/, `${it.id}: un atributo delata la respuesta`);
      /*
       * Lo que se ve antes de responder, sin el estilo en línea: React reordena
       * sus propiedades al volver a pintar el Opcion compartido, y el orden no
       * dice nada. Sí cuentan el texto y cada atributo de datos.
       */
      const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");
      antes.push(sinEstilo(m.caja.querySelector("[data-retro]")) + [...m.caja.querySelectorAll("[data-opcion]")].map(sinEstilo).join(""));
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(new Set(antes).size, 1, "los destinos o la región de la devolución cambian según el hecho antes de responder");
  } finally { m.desmontar(); }
});

test("★★★ un solo toque por tarjeta: al tocar, los tres destinos se bloquean y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H1[0];
    const otro = errados(it)[0];
    await tocar(destino(m.caja, otro));
    for (const d of D.DESTINOS_H1) assert.equal(destino(m.caja, d.id).disabled, true, `${d.id}: no se bloqueó`);
    const despues = retro(m.caja);
    await tocar(destino(m.caja, it.respuesta));
    assert.deepEqual(retro(m.caja), despues, "un segundo toque cambió la devolución");
    assert.deepEqual(m.caja.querySelector("[data-panel]").dataset.panel, "error");
  } finally { m.desmontar(); }
});

test("★★★ cada hecho, con cada destino: acierto con «Correcto.» y su página; cada error con SU texto, la buena revelada, coral solo ahí", async () => {
  for (const it of D.ITEMS_H1) {
    for (const elegido of D.DESTINOS_H1.map((d) => d.id)) {
      const m = await montar({ items: [it] });
      try {
        await tocar(destino(m.caja, elegido));
        const panel = m.caja.querySelector("[data-panel]");
        const ok = elegido === it.respuesta;
        assert.equal(panel.dataset.panel, ok ? "acierto" : "error", `${it.id} → ${elegido}`);
        assert.deepEqual(retro(m.caja), ok ? [D.CORRECTO, it.acierto] : [it.errores[elegido]], `${it.id} → ${elegido}: texto`);
        /* La página va en la devolución, en el acierto y en el error; H1-8 no la lleva. */
        assert.equal(panel.querySelector("[data-pagina]")?.textContent ?? null, it.pagina, `${it.id} → ${elegido}: página`);
        /* Coral solo en el error: el filete de la devolución y la opción elegida. */
        const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
        assert.equal(coral.test(panel.getAttribute("style")), !ok, `${it.id} → ${elegido}: coral en la devolución`);
        for (const d of D.DESTINOS_H1) {
          const enCoral = coral.test(destino(m.caja, d.id).getAttribute("style") ?? "");
          assert.equal(enCoral, !ok && d.id === elegido, `${it.id} → ${elegido}: coral en «${d.nombre}»`);
        }
        if (!ok) {
          /* La buena se enseña («era esta»), y el lector de pantalla oye cuál era. */
          assert.ok(destino(m.caja, it.respuesta).textContent.includes("era esta"), `${it.id}: no se revela la buena`);
          assert.ok(panel.textContent.startsWith(D.lectorErrorH1(D.nombreDeDestinoH1(it.respuesta))));
        }
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ los destinos: siempre tres, en el mismo orden, apilados a todo el ancho; los hechos se barajan, los destinos no", async () => {
  const m = await montar();
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((o) => o.dataset.opcion), [D.DEBE, D.HABER, D.NO_SE_MUEVE]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion] button")].map((b) => b.textContent.trim()), D.DESTINOS_H1.map((d) => d.nombre));
  } finally { m.desmontar(); }
  assert.match(VISTA, /<Opciones columnas="minmax\(0, 1fr\)">\s*\{DESTINOS_H1\.map/);
  /* Barajar: una función que invierte, para ver que se usa la que llega. */
  assert.deepEqual(D.sortearH1((xs) => [...xs].reverse()).map((x) => x.id), [...D.ITEMS_H1].reverse().map((x) => x.id));
});

test("★★★ al terminar: el cierre con su texto y su pie, y onCompletar con el porcentaje y el detalle (lo elegido en el error)", async () => {
  const m = await montar();
  try {
    for (const [k, it] of D.ITEMS_H1.entries()) {
      await tocar(destino(m.caja, k === 0 ? errados(it)[0] : it.respuesta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(m.completados.length, 1);
    const [pct, ms, detalle] = m.completados[0];
    assert.equal(pct, (7 / 8) * 100);
    assert.equal(typeof ms, "number");
    assert.equal(detalle.length, 8);
    assert.deepEqual(detalle[0], { item: "h1-1", ok: false, intentos: 1, respuesta: errados(D.ITEMS_H1[0])[0], orden: 1 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH1(7, 8));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H1.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H1.pie);
  } finally { m.desmontar(); }
});

test("★★ en modo demo no reporta nada ni pide el botón de seguir", async () => {
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H1] });
  try {
    await tocar(destino(m.caja, D.HABER));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(siguiente(m.caja), undefined);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h1]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  /*
   * La vista real en modo Hacer con H1 abierto. La primera vez sale el «Así se
   * juega» con la demo (el componente real en modo demo) y, debajo y
   * escondida, la partida. Las dos montadas a la vez: es el caso que importa.
   */
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H1_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»: la prueba no está mirando el caso de las dos");
    assert.equal(caja.querySelectorAll("[data-t4-h1-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h1]").length, 1, "hay más de un [data-t4-h1] en la página");
    const juego = caja.querySelector("[data-t4-h1]");
    assert.ok(juego.closest("[data-partida]"), "el [data-t4-h1] no es el de la partida");
    assert.equal(juego.closest("[data-asj-demo]"), null, "el [data-t4-h1] está dentro de la demo");
    /* Y cerrado el «Así se juega», sigue habiendo uno. */
    const siguienteAsj = [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === "Siguiente");
    await act(async () => { siguienteAsj.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.equal(caja.querySelectorAll("[data-t4-h1-demo]").length, 0);
    assert.equal(caja.querySelectorAll("[data-t4-h1]").length, 1);
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A1: exploratoria, fácil, 10 FP; las de Aprender siguen sin FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H1_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].id, D.H1_ID);
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, D.H1.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H1_ID), ids.indexOf("t4-a1-la-caja") + 1);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS_T4) assert.equal(typeof j.Mecanica, "function", j.id);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T4, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
});

test("★★★ la 0200: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t4-entra-o-sale-de-caja',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i, "solo puede insertar y consultar");
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-entra-o-sale-de-caja';\s*$/);
  /* El deshacer está escrito, en un comentario: no se corre. */
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-entra-o-sale-de-caja';$/m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H1_ID)), ["0200_t4_entra_o_sale_de_caja.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0200")), ["0200_t4_entra_o_sale_de_caja.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída del hecho, y la regla vive en el bloque de T4", async () => {
  const m = await montar();
  try {
    for (const it of D.ITEMS_H1) {
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 8);
    for (const id of ids) assert.equal(etiquetaDeItem(D.H1_ID, id), recortar(D.ITEMS_H1.find((x) => x.id === id).texto), id);
  } finally { m.desmontar(); }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-entra-o-sale-de-caja": \(id\) => hechoDeItemT4H1\(id\),/);
  for (const it of D.ITEMS_H1) assert.ok(!fuente.includes(it.texto), `${it.id}: el hecho está copiado en etiquetasItem.js`);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no está en el banco; la mano toca «Haber de Caja»", () => {
  const asi = ASI_SE_JUEGA[D.H1_ID];
  assert.ok(asi, "H1 no tiene «Así se juega»");
  const sec = ASI.slice(ASI.indexOf("## H1 · "), ASI.indexOf("## H2 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H1.texto, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.titulo, D.H1.nombre);
  assert.equal(asi.consigna, D.H1.consigna.join(" "));
  assert.deepEqual(asi.demo.items, [D.EJEMPLO_H1]);
  assert.ok(!D.ITEMS_H1.some((x) => x.texto === D.EJEMPLO_H1.texto), "el ejemplo está en el banco");
  assert.equal(D.EJEMPLO_H1.respuesta, D.HABER);
  assert.deepEqual(asi.guion.toques.map((x) => x.en), [`[data-opcion="${D.HABER}"] button`]);
});
