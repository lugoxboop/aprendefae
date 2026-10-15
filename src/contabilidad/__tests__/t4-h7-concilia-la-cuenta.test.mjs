import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H7 «Concilia la cuenta» (Célula D) · Hacer · evaluativa · difícil · 50 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, serie 1 y serie 2,
 *     letra por letra; las cifras se calculan de las partidas y coinciden
 *     con las tablas del paquete, también las seis de error
 *   · CADA INTENTO SORTEA SU SERIE por su cuenta; nada se comparte con H8
 *   · fase 1, la pantalla de Hanayama: el par con los saldos de partida, sin
 *     «=»; la tarjeta trae solo la partida; cuatro destinos fijos en 2×2; un
 *     toque; coral solo en el error; PH8-2 (textContent y outerHTML)
 *   · fase 2: la tabla con EXACTAMENTE las nueve partidas de la serie
 *     sorteada, cada una EN SU LADO CORRECTO aunque se haya fallado en la
 *     fase 1 (v1.1); sin totales ni saldo conciliado en el DOM hasta
 *     comprobar; los rótulos en renglones fijos, los del paquete (v1.2)
 *   · los mensajes de los saldos, en el orden del paquete, con las seis
 *     cifras de error; el aviso de los campos vacíos no gasta el intento
 *   · la migración 0206; el panel docente; el «Así se juega»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, InputEvent: w.InputEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT4H7.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, ConciliaLaCuenta, JUEGOS_T4, TEMA_T4, cifra } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h7-v1.md`);
const SERIE2 = leer(`${PAQUETES}d4-t4-h7-h8-serie2.md`);
const PAQ2 = SERIE2.slice(SERIE2.indexOf("# H7, serie 2"), SERIE2.indexOf("# H8, serie 2"));
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0206_t4_concilia_la_cuenta.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const n = (t) => Number(String(t).replace(/\D/g, ""));

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const DESTINO = Object.fromEntries(D.DESTINOS_H7.map((d) => [d.nombre, d.id]));
function partidasDe(md, prefijo, idSerie) {
  const sec = md.slice(md.indexOf("## Partidas"), md.indexOf("## Los dos saldos conciliados"));
  return sec.split(new RegExp(`\\n(?=### ${prefijo}-\\d)`)).slice(1).map((b) => {
    const k = b.match(new RegExp(`^### ${prefijo}-(\\d) · (.+)$`, "m"));
    const errores = Object.fromEntries([...b.matchAll(new RegExp(`^- \\*\\*((?:Banco|Libros): (?:suma|resta)):\\*\\* ${CITA}`, "gm"))].map((m) => [DESTINO[m[1]], m[2]]));
    return {
      id: `${idSerie}-${k[1]}`,
      titulo: k[2].replace(/^Nota (?:crédito|débito): /, ""),
      subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
      texto: b.match(new RegExp(`^- \\*\\*Partida:\\*\\* ${CITA}`, "m"))[1],
      respuesta: DESTINO[b.match(/^- \*\*Respuesta:\*\* ((?:Banco|Libros): (?:suma|resta)) \(presentación de la p\. 190\)/m)[1]],
      acierto: b.match(new RegExp(`^- \\*\\*Acierto:\\*\\* ${CITA}`, "m"))[1],
      errores,
    };
  });
}
const PARTIDAS = { s1: partidasDe(PAQ, "H7", "s1"), s2: partidasDe(PAQ2, "H7s2", "s2") };
const MD = { s1: PAQ, s2: PAQ2 };
const SERIE = { s1: D.SERIE_1, s2: D.SERIE_2 };
/* Los mensajes de los saldos: [rótulo, cifra o null, texto]. */
/* Las líneas son «- **Rótulo** (razón): «texto»» o «- **Rótulo:** «texto»»: los dos puntos van dentro o fuera de la negrita. */
const mensajesDe = (md) => [...md.slice(md.indexOf("Retroalimentación, según lo que escriba:")).matchAll(new RegExp(`^- \\*\\*([^*]+?):?\\*\\*(?: \\(([^)]+)\\))?:? ${CITA}`, "gm"))].map((m) => [m[1], m[2] ?? null, m[3]]);

/* ═══════════ 1 · EL TEXTO Y LAS CIFRAS, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia de los paquetes de H7 es la de la punta de la rama de Katsumi (si este clon la tiene); no hay archivos de cambios", (t) => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\.\*\* No tiene archivos de cambios/);
  assert.match(SERIE2, /\*\*Este archivo es la versión vigente de la serie 2\.\*\*/);
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*h7.*-cambios\.md$/.test(f)), []);
  if (!blobEnLaRamaFuente("d4-t4-h7-v1.md")) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-h7-v1.md", "d4-t4-h7-h8-serie2.md", "d4-t4-asi-se-juega-v1.md"]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), f);
});

test("★★★ ficha: id, nombre, objetivo, consigna, destinos y subtemas son los del paquete", () => {
  assert.equal(D.H7_ID, "t4-concilia-la-cuenta");
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H7_ID}\``));
  assert.match(PAQ, new RegExp(`\\| Nombre en pantalla \\| «${D.H7.nombre}» \\|`));
  assert.ok(PAQ.includes(`«${D.H7.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Los datos de partida"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H7.consigna);
  const destinos = PAQ.slice(PAQ.indexOf("## Los cuatro destinos"), PAQ.indexOf("## Partidas"));
  assert.deepEqual([...destinos.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]), D.DESTINOS_H7.map((d) => d.nombre));
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H7.join(" · "));
});

for (const sid of ["s1", "s2"]) {
  test(`★★★ ${sid}: las nueve partidas, letra por letra (texto, subtema, respuesta, acierto, los tres errores), en el orden del paquete`, () => {
    const paq = PARTIDAS[sid];
    const s = SERIE[sid];
    assert.equal(paq.length, 9, `${sid}: no se leyeron las nueve partidas`);
    assert.equal(s.partidas.length, 9);
    for (const [k, p] of paq.entries()) {
      const it = s.partidas[k];
      assert.equal(it.id, p.id);
      assert.equal(it.texto, p.texto, `${p.id}: partida`);
      assert.equal(it.subtema, p.subtema, `${p.id}: subtema`);
      assert.equal(it.respuesta, p.respuesta, `${p.id}: respuesta`);
      assert.equal(it.acierto, p.acierto, `${p.id}: acierto`);
      assert.deepEqual(it.errores, p.errores, `${p.id}: errores`);
      assert.deepEqual(Object.keys(it.errores).sort(), D.DESTINOS_H7.map((d) => d.id).filter((x) => x !== it.respuesta).sort());
      /* El monto de la partida es el de su texto. */
      assert.equal(cifra(it.monto), it.texto.match(/\$(\d{1,3}(?:\.\d{3})*)/)[1], `${p.id}: monto`);
      /* v1.2: el rótulo de la tabla es el título del paquete sin el prefijo de tipo, en renglones fijos (con mayúscula inicial: es un rótulo). */
      const mayuscula = (t) => t[0].toUpperCase() + t.slice(1);
      assert.equal(it.rotulo.join(" "), mayuscula(p.titulo), `${p.id}: rótulo`);
    }
    /* Ningún error nombra su destino correcto (regla de Hanayama). */
    for (const it of s.partidas) for (const t of Object.values(it.errores)) assert.ok(!t.includes(D.nombreDeDestinoH7(it.respuesta)), `${it.id}: un error nombra la respuesta`);
  });

  test(`★★★ ${sid}: los datos de partida, las cifras y los dos saldos conciliados se calculan y coinciden con el paquete`, () => {
    const s = SERIE[sid];
    const md = sid === "s1" ? PAQ.slice(PAQ.indexOf("## Los datos de partida"), PAQ.indexOf("## Los cuatro destinos")) : SERIE2.slice(SERIE2.indexOf("## Datos de partida de la serie 2"), SERIE2.indexOf("# H7, serie 2"));
    assert.deepEqual([...md.matchAll(new RegExp(`^- ${CITA} \\(`, "gm"))].map((m) => m[1]), s.datos);
    assert.equal(md.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1], D.PIE_DATOS_H7);
    /* Las ecuaciones del paquete: «Lado del banco: a + b − c = **d**». */
    const lado = (nombre) => MD[sid].match(new RegExp(`\\*\\*Lado ${nombre}:\\*\\* ([\\d.]+) \\+ ([\\d.]+) − ([\\d.]+) = \\*\\*([\\d.]+)\\*\\*`)).slice(1).map(n);
    assert.deepEqual(lado("del banco"), [s.extracto, s.totales.consignacion, s.totales.cheques, s.conciliadoBanco]);
    assert.deepEqual(lado("de los libros"), [s.libros, s.totales.credito, s.totales.debito, s.conciliadoLibros]);
    assert.equal(s.conciliadoBanco, s.conciliadoLibros, "los dos saldos conciliados no dan lo mismo");
    /* La tabla de cifras del paquete. */
    const tabla = MD[sid].slice(MD[sid].indexOf(sid === "s1" ? "## Cifras y cadena" : "## Cifras de la serie 2"));
    const fila = (t) => n(tabla.match(new RegExp(`^\\| \\**${t}\\** \\| \\**([\\d.]+)\\**`, "m"))[1]);
    assert.equal(fila("Total cheques sin cobrar"), s.totales.cheques);
    assert.equal(fila("Total notas crédito"), s.totales.credito);
    assert.equal(fila("Total notas débito"), s.totales.debito);
    assert.equal(fila("Saldo conciliado \\(los dos lados\\)"), s.conciliadoBanco);
    /* El cierre. */
    const cierre = MD[sid].slice(MD[sid].indexOf("## Cierre"));
    assert.equal(cierre.match(new RegExp(`^- ${CITA} \\(`, "m"))[1], s.cierre);
    assert.equal(cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1], D.PIE_CIERRE_H7);
  });

  test(`★★★ ${sid}: los mensajes de los saldos son los del paquete, y las seis cifras de error se calculan y son las suyas`, () => {
    const s = SERIE[sid];
    const msgs = mensajesDe(MD[sid]);
    assert.equal(msgs.length, 9, `${sid}: no se leyeron los nueve mensajes`);
    const [acierto, iguales, ...resto] = msgs;
    const otro = resto.pop();
    assert.equal(acierto[0], `Los dos dan ${D.pesos(s.conciliadoBanco)}`);
    assert.equal(acierto[2], D.MENSAJES_SALDOS.acierto);
    assert.equal(iguales[2], D.MENSAJES_SALDOS.igualesOtraCifra);
    assert.equal(otro[2], D.MENSAJES_SALDOS.otro);
    const conCifra = resto.map(([r, , t]) => [r.match(/^(Banco|Libros) = \$([\d.]+)$/).slice(1), t]);
    assert.deepEqual(conCifra.filter(([[l]]) => l === "Banco").map(([[, c], t]) => [n(c), t]), s.erroresBanco.map((e) => [e.cifra, e.texto]));
    assert.deepEqual(conCifra.filter(([[l]]) => l === "Libros").map(([[, c], t]) => [n(c), t]), s.erroresLibros.map((e) => [e.cifra, e.texto]));
    /* Ninguna cifra de error coincide con el saldo correcto. */
    for (const e of [...s.erroresBanco, ...s.erroresLibros]) assert.notEqual(e.cifra, s.conciliadoBanco);
  });
}

test("★★★ evaluarSaldosH7: el orden del paquete (acierto, iguales con otra cifra, la cifra reconocida, otro) y cada campo por separado", () => {
  const s = D.SERIE_1;
  const c = s.conciliadoBanco;
  assert.deepEqual(D.evaluarSaldosH7(s, c, c), { ok: true, bien: { banco: true, libros: true }, texto: D.MENSAJES_SALDOS.acierto });
  assert.equal(D.evaluarSaldosH7(s, 5, 5).texto, D.MENSAJES_SALDOS.igualesOtraCifra);
  for (const e of s.erroresBanco) assert.deepEqual(D.evaluarSaldosH7(s, e.cifra, c), { ok: false, bien: { banco: false, libros: true }, texto: e.texto });
  for (const e of s.erroresLibros) assert.deepEqual(D.evaluarSaldosH7(s, c, e.cifra), { ok: false, bien: { banco: true, libros: false }, texto: e.texto });
  /* Los dos con cifra de error: manda la del banco. */
  assert.equal(D.evaluarSaldosH7(s, s.erroresBanco[1].cifra, s.erroresLibros[0].cifra).texto, s.erroresBanco[1].texto);
  assert.equal(D.evaluarSaldosH7(s, 1, c).texto, D.MENSAJES_SALDOS.otro);
  assert.deepEqual(["2.551.700", "2551700", "$ 2.551.700", "", "abc"].map(D.leerSaldo), [2_551_700, 2_551_700, 2_551_700, null, null]);
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H7.objetivo, ...D.H7.consigna, ...D.SERIES_H7.flatMap((s) => [...s.datos, s.cierre, ...s.partidas.flatMap((p) => [p.texto, p.acierto, ...Object.values(p.errores)]), ...s.erroresBanco.map((e) => e.texto), ...s.erroresLibros.map((e) => e.texto)]), ...Object.values(D.MENSAJES_SALDOS)];
  const medidos = [...new Set(textos)].map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos medidos`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

test("★★★ cada intento sortea su serie por su cuenta y baraja sus partidas; el módulo no guarda nada entre intentos", () => {
  const primera = (xs) => xs[0];
  const segunda = (xs) => xs[1];
  const reves = (xs) => [...xs].reverse();
  assert.equal(D.sortearH7(primera, reves).serie, D.SERIE_1);
  assert.equal(D.sortearH7(segunda, reves).serie, D.SERIE_2);
  assert.deepEqual(D.sortearH7(primera, reves).partidas.map((p) => p.id), [...D.SERIE_1.partidas].reverse().map((p) => p.id));
  /* Sin estado compartido: el módulo de H7 no exporta nada mutable de sorteo, ni importa H8. */
  assert.doesNotMatch(leer("src/data/contabilidadT4H7.js"), /contabilidadT4H8|localStorage|sessionStorage|let\s+\w+\s*=\s*(null|\[\]|\{\})/);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ConciliaLaCuenta, { Marco, items: { serie: D.SERIE_1, partidas: D.SERIE_1.partidas }, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, valor) => {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { set.call(input, valor); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const destino = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const siguiente = (caja) => boton(caja, D.BOTON_H7.siguiente) ?? boton(caja, D.BOTON_H7.aLosSaldos);
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const campo = (caja, lado) => caja.querySelector(`[data-campo="${lado}"] input`);
const otroDestino = (it) => Object.keys(it.errores)[0];
const loQueHayEnElDom = (caja) => `${caja.textContent}\n${caja.outerHTML}`;
/* Juega la fase 1: con `mal`, en esas partidas toca un destino equivocado. */
const jugarFase1 = async (m, partidas, mal = []) => {
  for (const it of partidas) {
    await tocar(destino(m.caja, mal.includes(it.id) ? otroDestino(it) : it.respuesta));
    await tocar(siguiente(m.caja));
  }
};

test("★★★ fase 1: el par trae los saldos de partida, sin «=»; la razón social y el pie debajo; la tarjeta trae solo la partida", async () => {
  const m = await montar();
  try {
    const s = D.SERIE_1;
    assert.deepEqual([...m.caja.querySelectorAll("[data-par-monto]")].map((x) => n(x.textContent)), [s.extracto, s.libros]);
    assert.equal(m.caja.querySelector("[data-igual]").dataset.igual, "oculto");
    assert.equal(m.caja.querySelector("[data-igual]").textContent.trim(), "");
    assert.deepEqual([...m.caja.querySelectorAll("[data-dato]")].map((x) => x.textContent), s.datos);
    assert.equal(m.caja.querySelector("[data-pie-datos]").textContent, D.PIE_DATOS_H7);
    /* Lo que solo oye el lector de pantalla tiene su clase escondida, y la hoja del juego la define. */
    assert.ok(m.caja.querySelector("[data-par-lector]").classList.contains("t4f-sr"));
    assert.match([...m.caja.querySelectorAll("style")].map((x) => x.textContent).join("\n"), /\.t4f-sr \{ position: absolute; width: 1px; height: 1px;/, "la hoja del juego no define .t4f-sr: el texto del lector se vería");
    for (const it of s.partidas) {
      assert.equal(m.caja.querySelector(`[data-tarjeta-partida="${it.id}"]`).textContent, it.texto);
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · fase 1: mientras se pregunta, nada de la respuesta ni de la fase 2 está en el DOM (textContent y outerHTML)", async () => {
  const s = D.SERIE_1;
  const m = await montar();
  try {
    const antes = [];
    for (const it of s.partidas) {
      const dom = loQueHayEnElDom(m.caja);
      for (const x of [it.acierto, ...Object.values(it.errores), D.CORRECTO, D.lectorErrorH7(D.nombreDeDestinoH7(it.respuesta)), D.PAGINA_H7]) assert.ok(!dom.includes(x), `${it.id}: el DOM ya trae «${x.slice(0, 50)}»`);
      /* Ni el saldo conciliado, ni un total, ni la tabla. */
      for (const c of [s.conciliadoBanco, s.totales.cheques, s.totales.credito, s.totales.debito].map(cifra)) assert.ok(!dom.includes(c), `${it.id}: el DOM ya trae ${c}`);
      assert.equal(m.caja.querySelector("[data-tabla-h7], [data-panel], [data-pagina]"), null);
      assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected|pressed)="true"/);
      const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");
      antes.push([...m.caja.querySelectorAll("[data-opcion]")].map(sinEstilo).join("") + sinEstilo(m.caja.querySelector("[data-retro]")));
      await tocar(destino(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(new Set(antes).size, 1, "los destinos cambian según la partida antes de responder");
  } finally { m.desmontar(); }
});

test("★★★ fase 1: cuatro destinos en 2×2 y en orden fijo, cada uno en dos renglones con el lado en 600; un toque; coral solo en el error; «era esta»", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  const it = D.SERIE_1.partidas[0];
  for (const elegido of D.DESTINOS_H7.map((d) => d.id)) {
    const m = await montar({ items: { serie: D.SERIE_1, partidas: [it] } });
    try {
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((o) => o.dataset.opcion), [D.BANCO_SUMA, D.BANCO_RESTA, D.LIBROS_SUMA, D.LIBROS_RESTA]);
      for (const d of D.DESTINOS_H7) assert.deepEqual([...destino(m.caja, d.id).querySelector("[data-destino-renglones]").children].map((x) => x.textContent), d.renglones);
      await tocar(destino(m.caja, elegido));
      for (const d of D.DESTINOS_H7) assert.equal(destino(m.caja, d.id).disabled, true);
      const ok = elegido === it.respuesta;
      const panel = m.caja.querySelector("[data-panel]");
      assert.equal(panel.dataset.panel, ok ? "acierto" : "error");
      assert.deepEqual(retro(m.caja), ok ? [D.CORRECTO, it.acierto] : [it.errores[elegido]]);
      assert.equal(panel.querySelector("[data-pagina]").textContent, D.PAGINA_H7);
      assert.equal(coral.test(panel.getAttribute("style")), !ok);
      for (const d of D.DESTINOS_H7) assert.equal(coral.test(destino(m.caja, d.id).getAttribute("style") ?? ""), !ok && d.id === elegido, `coral en ${d.id}`);
      if (!ok) assert.ok(destino(m.caja, it.respuesta).textContent.includes("era esta"));
      /* Un segundo toque no cambia nada. */
      const r = retro(m.caja);
      await tocar(destino(m.caja, D.DESTINOS_H7.find((d) => d.id !== elegido).id));
      assert.deepEqual(retro(m.caja), r);
    } finally { m.desmontar(); }
  }
  assert.match(VISTA, /<Opciones columnas="repeat\(2, minmax\(0, 1fr\)\)">\s*\{DESTINOS_H7\.map/);
  const css = VISTA.match(/const CSS_T4H7 = `([\s\S]*?)`;/)[1];
  assert.match(css, /\.t4h7-dest > span \{ white-space: nowrap; \}/);
  assert.match(css, /\.t4h7-dest > span:first-child \{ font-weight: 600; \}/);
});

for (const sid of ["s1", "s2"]) {
  test(`★★★ ${sid} · fase 2: la tabla trae EXACTAMENTE las nueve partidas de la serie sorteada, cada una EN SU LADO CORRECTO aunque se haya fallado en la fase 1`, async () => {
    const s = SERIE[sid];
    /* Las partidas barajadas, y tres falladas a propósito, una de cada lado distinto. */
    const partidas = [...s.partidas].reverse();
    const mal = [s.partidas[0].id, s.partidas[4].id, s.partidas[8].id];
    const m = await montar({ items: { serie: s, partidas } });
    try {
      await jugarFase1(m, partidas, mal);
      const tabla = m.caja.querySelector("[data-tabla-h7]");
      assert.ok(tabla, "no está la tabla de la fase 2");
      const filas = [...tabla.querySelectorAll("[data-partida-tabla]")];
      /* Exactamente nueve, las de esta serie, ninguna de la otra. */
      assert.equal(filas.length, 9);
      assert.deepEqual(filas.map((f) => f.dataset.partidaTabla).sort(), s.partidas.map((p) => p.id).sort());
      const otra = D.SERIES_H7.find((x) => x !== s);
      for (const p of otra.partidas) assert.ok(!tabla.textContent.includes(cifra(p.monto)) || s.partidas.some((q) => q.monto === p.monto), `la tabla trae una cifra de la otra serie: ${cifra(p.monto)}`);
      /* Cada una en su lado y con su signo correctos, también las falladas. */
      for (const p of s.partidas) {
        const d = D.DESTINOS_H7.find((x) => x.id === p.respuesta);
        const f = tabla.querySelector(`[data-partida-tabla="${p.id}"]`);
        assert.equal(f.closest("[data-lado-h7]").dataset.ladoH7, d.lado, `${p.id}: lado${mal.includes(p.id) ? " (fallada en la fase 1)" : ""}`);
        assert.equal(Number(f.dataset.signoTabla), d.signo, `${p.id}: signo`);
        assert.equal(n(f.querySelector("[data-monto]").textContent), p.monto);
        assert.deepEqual([...f.querySelectorAll(".t4cn-con > span")].map((x) => x.textContent), p.rotulo);
      }
      /* Los saldos de partida, a la cabeza de cada lado. */
      assert.equal(n(tabla.querySelector('[data-inicial="banco"] .t4cn-m').textContent), s.extracto);
      assert.equal(n(tabla.querySelector('[data-inicial="libros"] .t4cn-m').textContent), s.libros);
      /* «Más» y «Menos» una vez por grupo, como en la p. 190. */
      assert.deepEqual([...tabla.querySelectorAll("[data-lado-h7] .t4cn-signo")].map((x) => x.textContent).filter(Boolean), ["Más", "Menos", "Más", "Menos"]);
    } finally { m.desmontar(); }
  });

  test(`★★★ ${sid} · PH8-2 · fase 2: antes de comprobar, ni los totales ni el saldo conciliado están en el DOM; el par sigue sin «=»`, async () => {
    const s = SERIE[sid];
    const m = await montar({ items: { serie: s, partidas: s.partidas } });
    try {
      await jugarFase1(m, s.partidas);
      const dom = loQueHayEnElDom(m.caja);
      for (const c of [s.conciliadoBanco, s.totales.cheques, s.totales.credito, s.totales.debito, ...s.erroresBanco.map((e) => e.cifra), ...s.erroresLibros.map((e) => e.cifra)].map(cifra)) assert.ok(!dom.includes(c), `fase 2: el DOM ya trae ${c}`);
      for (const t of [...Object.values(D.MENSAJES_SALDOS), ...s.erroresBanco.map((e) => e.texto), ...s.erroresLibros.map((e) => e.texto)]) assert.ok(!dom.includes(t), `fase 2: el DOM ya trae «${t.slice(0, 40)}»`);
      assert.equal(m.caja.querySelector("[data-igual]").dataset.igual, "oculto");
      assert.equal(m.caja.querySelector("[data-panel]"), null);
    } finally { m.desmontar(); }
  });
}

test("★★★ fase 2: con un campo vacío, «Comprobar los saldos» da un aviso gris y NO gasta el intento", async () => {
  const s = D.SERIE_1;
  const m = await montar();
  try {
    await jugarFase1(m, s.partidas);
    await escribir(campo(m.caja, "banco"), cifra(s.conciliadoBanco));
    await tocar(boton(m.caja, D.BOTON_H7.comprobar));
    assert.equal(m.caja.querySelector("[data-aviso]").textContent, D.FALTAN_SALDOS);
    assert.doesNotMatch(m.caja.querySelector("[data-aviso]").getAttribute("style"), /231|e76f51/i);
    assert.equal(m.caja.querySelector("[data-panel]"), null);
    assert.equal(campo(m.caja, "banco").disabled, false);
    /* Y después se puede comprobar de verdad. */
    await escribir(campo(m.caja, "libros"), String(s.conciliadoLibros));
    await tocar(boton(m.caja, D.BOTON_H7.comprobar));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
  } finally { m.desmontar(); }
});

test("★★★ fase 2: cada mensaje del paquete sale con su cifra; cada campo se marca bien o mal; el «=» y los saldos conciliados salen al comprobar", async () => {
  const s = D.SERIE_1;
  const c = s.conciliadoBanco;
  const casos = [
    [c, c, true, D.MENSAJES_SALDOS.acierto],
    [1, 1, false, D.MENSAJES_SALDOS.igualesOtraCifra],
    ...s.erroresBanco.map((e) => [e.cifra, c, false, e.texto]),
    ...s.erroresLibros.map((e) => [c, e.cifra, false, e.texto]),
    [123, c, false, D.MENSAJES_SALDOS.otro],
  ];
  for (const [b, l, ok, texto] of casos) {
    const m = await montar();
    try {
      await jugarFase1(m, s.partidas);
      await escribir(campo(m.caja, "banco"), cifra(b));
      await escribir(campo(m.caja, "libros"), String(l));
      await tocar(boton(m.caja, D.BOTON_H7.comprobar));
      const panel = m.caja.querySelector("[data-panel]");
      assert.equal(panel.dataset.panel, ok ? "acierto" : "error", texto);
      assert.deepEqual(retro(m.caja), [texto]);
      assert.equal(campo(m.caja, "banco").disabled, true, "un intento");
      for (const [lado, v] of [["banco", b], ["libros", l]]) {
        const borde = campo(m.caja, lado).getAttribute("style");
        assert.equal(/231, 111, 81|e76f51/i.test(borde), v !== c, `${lado}: coral`);
      }
      /* El par muestra ahora los dos conciliados correctos, con el «=». */
      assert.deepEqual([...m.caja.querySelectorAll("[data-par-monto]")].map((x) => n(x.textContent)), [c, c]);
      assert.equal(m.caja.querySelector("[data-igual]").dataset.igual, "visible");
    } finally { m.desmontar(); }
  }
});

test("★★★ al terminar: el cierre de la serie, y onCompletar con once puntos (nueve partidas y dos saldos) y el detalle", async () => {
  const s = D.SERIE_2;
  const m = await montar({ items: { serie: s, partidas: s.partidas } });
  try {
    await jugarFase1(m, s.partidas, [s.partidas[0].id]);
    await escribir(campo(m.caja, "banco"), cifra(s.erroresBanco[0].cifra));
    await escribir(campo(m.caja, "libros"), cifra(s.conciliadoLibros));
    await tocar(boton(m.caja, D.BOTON_H7.comprobar));
    await tocar(boton(m.caja, D.BOTON_H7.verResumen));
    assert.equal(m.completados.length, 1);
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, (9 / 11) * 100);
    assert.equal(detalle.length, 11);
    assert.deepEqual(detalle[0], { item: "s2-1", ok: false, intentos: 1, respuesta: otroDestino(s.partidas[0]), orden: 1 });
    assert.deepEqual(detalle.slice(9), [
      { item: "saldo-banco", ok: false, intentos: 1, respuesta: cifra(s.erroresBanco[0].cifra), orden: 10 },
      { item: "saldo-libros", ok: true, intentos: 1, respuesta: null, orden: 11 },
    ]);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH7(8));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, s.cierre);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.PIE_CIERRE_H7);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h7]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H7_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»");
    assert.equal(caja.querySelectorAll("[data-t4-h7-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h7]").length, 1, "hay más de un [data-t4-h7] en la página");
    assert.ok(caja.querySelector("[data-t4-h7]").closest("[data-partida]"));
    /* La partida de verdad sorteó una de las dos series. */
    assert.ok(["s1", "s2"].includes(caja.querySelector("[data-t4-h7]").dataset.serie));
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A5: evaluativa, difícil, 50 FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H7_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H7_ID), ids.indexOf("t4-a5-san-calixto") + 1);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H7_ID).Mecanica, ConciliaLaCuenta);
  assert.equal(PAQ.match(/\| Etiqueta del panel docente \| «([^»]+)» \|/)[1], `${D.H7.nombre} · ${TEMA.title}`);
});

test("★★★ la 0206: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-concilia-la-cuenta',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-concilia-la-cuenta';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-concilia-la-cuenta';$/m);
  assert.match(MIGRACION, /^-- 0206 — CONTABILIDAD, T4: H7 «CONCILIA LA CUENTA» \(Célula D\)$/m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H7_ID)), ["0206_t4_concilia_la_cuenta.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0206")), ["0206_t4_concilia_la_cuenta.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, y la regla vive en el bloque de T4", async () => {
  for (const s of D.SERIES_H7) for (const p of s.partidas) assert.equal(etiquetaDeItem(D.H7_ID, p.id), recortar(p.texto), p.id);
  assert.equal(etiquetaDeItem(D.H7_ID, "saldo-banco"), recortar(D.TABLA_H7.campoBanco));
  assert.equal(etiquetaDeItem(D.H7_ID, "saldo-libros"), recortar(D.TABLA_H7.campoLibros));
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-concilia-la-cuenta": \(id\) => partidaDeItemT4H7\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no es de ninguna serie; la mano TOCA «Libros: resta» y acierta", async () => {
  const asi = ASI_SE_JUEGA[D.H7_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H7 · "), ASI.indexOf("## H8 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H7.texto, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano arrastra la tarjeta a «Libros: resta»\./);
  assert.ok(!D.SERIES_H7.some((s) => s.partidas.some((p) => p.texto === D.EJEMPLO_H7.texto)));
  assert.deepEqual(asi.guion.toques.map((x) => x.en), [`[data-opcion="${D.LIBROS_RESTA}"] button`]);
  const m = await montar({ modoDemo: true, ...asi.demo });
  try {
    /* La demo no trae serie: ni par ni datos de partida, para no adelantar cifras. */
    assert.equal(m.caja.querySelector("[data-par]"), null);
    for (const toque of asi.guion.toques) await tocar(m.caja.querySelector(toque.en));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(siguiente(m.caja), undefined);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
