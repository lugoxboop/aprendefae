import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · LOS RECORTES DEL LOTE 1 (Célula C) — lo común de las pruebas de las
 * seis Aprender recortadas (no es una prueba: lo importan).
 *
 *   · `seccion` lee la sección de una pieza en el paquete de Near
 *     (lote1-recortes-t73-v1.md): cada pantalla con sus líneas «…» en el
 *     orden en que se ven, sus opciones, su pista, sus errores, su acierto
 *     (con la figura que trae) y su «¿Por qué?» plegado
 *   · `recorrer` monta la pieza y la recorre entera, pantalla por pantalla y
 *     estado por estado (al llegar, cada error con la escalera de ayuda, el
 *     acierto, el «¿Por qué?» abierto), y compara lo que se ve contra el
 *     paquete, letra por letra
 *
 * Las líneas de una pantalla son texto (un `data-texto` de la pantalla, en
 * el mismo orden) o figura: lo que dice la figura (renglones, plazos,
 * barras, cuentas T, asientos). Las de figura se buscan dentro de las
 * figuras, palabra por palabra y en orden, sin «$» (los renglones y los
 * asientos escriben la cifra sin signo, en su columna; entre dos palabras
 * puede ir el rótulo de una fila); cada trozo separado por « · » se busca
 * aparte. Lo que muestra la figura del acierto («Figura: …») se busca en
 * orden y NO puede estar antes de acertar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const citas = (t) => [...String(t).matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/** La sección «## <id> · «Título»» del paquete, pantalla por pantalla. */
export function seccion(md, id) {
  const ini = md.indexOf(`\n## ${id} · «`);
  assert.ok(ini >= 0, `no está la sección de ${id}`);
  const fin = md.indexOf("\n## ", ini + 1);
  const texto = md.slice(ini + 1, fin < 0 ? undefined : fin);
  const titulo = citas(texto.split("\n")[0])[0];
  const pantallas = [];
  let p = null;
  for (const l of texto.split("\n")) {
    const cab = l.match(/^\*\*P(\d+) · `([^`]+)`\*\* \(([\w-]+)\)(?: · figura: (.+))?$/);
    if (cab) {
      p = { k: Number(cab[1]), id: cab[2], tipo: cab[3], figura: cab[4] ?? null, lineas: [], opciones: [], pista: null, errores: [], acierto: null, porque: null };
      pantallas.push(p);
      continue;
    }
    if (!p) continue;
    let m;
    if ((m = l.match(/^- Opciones o líneas: (.+)$/))) p.opciones = citas(m[1]);
    else if ((m = l.match(/^- \*pista \(1\.er error\):\* (.+)$/))) p.pista = citas(m[1])[0];
    else if ((m = l.match(/^- \*error · ([^*]+):\* (.+)$/))) p.errores.push({ clave: m[1], texto: citas(m[2])[0] });
    else if ((m = l.match(/^- \*acierto:\* (.+)$/))) {
      const [texto, figura = null] = citas(m[1]);
      p.acierto = { texto, figura: /Figura: «/.test(m[1]) ? figura : null };
    } else if ((m = l.match(/^ {2}- ¿Por qué\? \(plegado\): (.+)$/))) p.porque = citas(m[1])[0];
    else if ((m = l.match(/^- «/))) p.lineas.push(citas(l)[0]);
  }
  return { titulo, pantallas };
}

/** La opción de datos que nombra la clave de un error del paquete («$4.200.000», «no se anota», «15 % o 5 %»). */
export function opcionesDeClave(clave, opciones) {
  const malas = opciones.filter((o) => !o.correcta);
  return clave.split(" o ").map((parte) => {
    const c = parte.trim().toLowerCase();
    const t = (o) => o.texto.toLowerCase();
    const una = (f) => { const x = malas.filter(f); return x.length === 1 ? x[0] : null; };
    const o = una((o) => t(o) === c) ?? una((o) => t(o).startsWith(c)) ?? una((o) => t(o).includes(c));
    assert.ok(o, `la clave «${parte}» no nombra una sola opción mala`);
    return o;
  });
}

/* La regla de L (plegable.jsx): una condición que limita una regla no se pliega. */
export const CONDICION = /(?<!\p{L})(solo|sólo|directamente|cuando|si)(?!\p{L})/iu;

/**
 * Los datos contra la sección: mismas pantallas, en su orden y con su tipo;
 * opciones en el orden del paquete; la correcta, la que ningún error nombra;
 * pista, errores, acierto y «¿Por qué?» letra por letra. Un «¿Por qué?» con
 * condición va a la vista (`porqueALaVista`), y solo esos.
 */
export function compararDatos(P, S) {
  assert.equal(P.titulo, S.titulo);
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.tipo]), S.pantallas.map((s) => [s.id, s.tipo]));
  for (const [k, s] of S.pantallas.entries()) {
    const p = P.pantallas[k];
    assert.equal(s.k, k, `${s.id}: P${s.k}`);
    if (s.tipo !== "eleccion") {
      assert.equal(p.opciones, undefined, s.id);
      continue;
    }
    assert.deepEqual(p.opciones.map((o) => o.texto), s.opciones, `${s.id}: opciones`);
    assert.equal(p.pista, s.pista, `${s.id}: pista`);
    const nombradas = new Set();
    for (const e of s.errores) {
      for (const o of opcionesDeClave(e.clave, p.opciones)) {
        assert.equal(o.devolucion, e.texto, `${s.id}: error · ${e.clave}`);
        nombradas.add(o.id);
      }
    }
    /* Cada mala tiene su error, y la correcta es la que queda. */
    assert.deepEqual(p.opciones.filter((o) => !nombradas.has(o.id)).map((o) => o.id), p.opciones.filter((o) => o.correcta).map((o) => o.id), `${s.id}: la correcta`);
    assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
    assert.equal(p.acierto.texto, s.acierto.texto, `${s.id}: acierto`);
    assert.equal(p.acierto.porque ?? null, s.porque, `${s.id}: ¿Por qué?`);
    assert.equal(Boolean(p.acierto.porqueALaVista), Boolean(s.porque && CONDICION.test(s.porque)), `${s.id}: ¿Por qué? con condición, a la vista`);
  }
}

/* ═══════════ MONTADA ═══════════ */

export const norm = (t) => String(t).toLowerCase().replace(/ /g, " ").replace(/\$/g, "").replace(/\s+/g, "");

/** El texto de las figuras de la pantalla, en su orden, sin lo que solo oye el lector. Con `trasMensaje`, también los textos que siguen al mensaje. */
export function textoDeFiguras(c, trasMensaje = false) {
  const sel = trasMensaje ? "figure, [data-figura], [data-mensaje] ~ [data-texto]" : "figure, [data-figura]";
  return [...c.querySelectorAll(sel)].filter((el, _, todos) => !todos.some((o) => o !== el && o.contains(el))).map((el) => {
    const x = el.cloneNode(true);
    for (const sr of x.querySelectorAll(".sr, [hidden]")) sr.remove();
    return x.textContent;
  }).join(" ");
}


/* Lo que muestra la figura del acierto, palabra por palabra y en orden. «debe»/«haber» antes de una cifra es la columna. */
const fichas = (figura) => {
  const p = figura.split(/\s+/).filter((t) => t && t !== "$");
  return p.filter((t, i) => !(/^(debe|haber)$/i.test(t) && /^\$/.test(p[i + 1] ?? "")));
};
export function enOrden(figura, texto) {
  const r = norm(texto);
  let pos = 0;
  for (const t of fichas(figura)) {
    const i = r.indexOf(norm(t), pos);
    if (i < 0) return false;
    pos = i + norm(t).length;
  }
  return true;
}

/** ¿Está la línea de figura en las figuras? Cada trozo separado por « · », aparte, palabra por palabra y en orden (entre las palabras puede ir el rótulo de una fila). */
export const lineaEnFiguras = (linea, figuras) => linea.split(" · ").every((t) => enOrden(t, figuras));

const sinAsiEs = (t) => { const x = String(t).replace(/^(Así es|Exacto)[.:]\s*/, ""); return x.charAt(0).toUpperCase() + x.slice(1); };

/**
 * Recorre la pieza montada. `opciones`:
 *   tarifas    ids de las pantallas con la frase de las tarifas en el pie
 *   frase      la frase de las tarifas
 *   alLlegar(k, c), alFallar(k, c, n), alAcertar(k, c)   comprobaciones propias de la pieza
 */
export async function recorrer({ caja: c, P, S, tocar, w, textosDelError, tarifas = [], frase, alLlegar, alFallar, alAcertar }) {
  const textos = () => [...c.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
  const boton = (n) => c.querySelector(`[data-boton="${n}"]`);
  const pies = () => [...c.querySelectorAll("[data-pie]")].map((x) => x.textContent);
  const visitadas = [];
  for (const [k, s] of S.pantallas.entries()) {
    const p = P.pantallas[k];
    assert.equal(c.querySelector("[data-pantalla]").dataset.pantalla, s.id);
    visitadas.push(s.id);
    const conTarifas = tarifas.includes(s.id);
    const pieEsperado = (x) => (conTarifas ? [x, frase] : [x]);
    /* Al llegar: las líneas de texto, en su orden, y nada más; las demás, en las figuras. */
    const llegada = textos();
    const figuras = textoDeFiguras(c);
    const deTexto = s.lineas.filter((l) => llegada.includes(l));
    assert.deepEqual(llegada, deTexto, `${s.id}: los textos al llegar`);
    for (const l of s.lineas.filter((x) => !deTexto.includes(x))) assert.ok(lineaEnFiguras(l, figuras), `${s.id}: «${l}» no está en la figura`);
    assert.equal(c.querySelector("[data-mensaje]"), null);
    /* Los textos del recorte se ven enteros: nada plegado al llegar. */
    assert.equal(c.querySelector("[data-por-que], [data-plegado]"), null, `${s.id}: un texto plegado al llegar`);
    assert.deepEqual(pies(), pieEsperado(p.pie), `${s.id}: el pie`);
    /* La figura de la pantalla está al llegar; la que el paquete pone «en el acierto», no. */
    if (s.figura) assert.equal(Boolean(c.querySelector("figure, [data-figura]")), !/^en el acierto/.test(s.figura), `${s.id}: la figura (${s.figura})`);
    await alLlegar?.(k, c);
    if (s.tipo !== "eleccion") {
      const ultima = k === S.pantallas.length - 1;
      assert.equal(c.querySelector("[data-boton]") === null, ultima, `${s.id}: el botón`);
      if (!ultima) await tocar(boton(s.tipo === "portada" ? "empezar" : "seguir"));
      continue;
    }
    /* Las opciones: las del paquete (barajadas); «Confirmar» inactivo hasta elegir. */
    assert.deepEqual([...c.querySelectorAll("[data-opcion]")].map((x) => x.textContent).sort(), [...s.opciones].sort());
    assert.equal(boton("confirmar").getAttribute("aria-disabled"), "true");
    if (s.acierto.figura) assert.equal(enOrden(s.acierto.figura, textoDeFiguras(c, true)), false, `${s.id}: la figura del acierto se adelanta`);
    /* Cada mala: la 1.ª da la pista; las demás, la respuesta y el acierto (escalera de ayuda). */
    let n = 0;
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton("confirmar"));
      n += 1;
      const msj = c.querySelector("[data-mensaje]");
      assert.equal(msj.dataset.mensaje, "error");
      assert.equal(w.document.activeElement, msj, `${s.id}: el foco va al mensaje`);
      const esperado = n === 1 ? [s.pista] : [`La respuesta es «${p.opciones.find((y) => y.correcta).texto.replace(/\.$/, "")}».`, sinAsiEs(s.acierto.texto)];
      assert.deepEqual([...msj.querySelectorAll("[data-texto]")].map((x) => x.textContent), esperado, `${s.id}: error ${n}`);
      assert.deepEqual(textosDelError(p, o, n), esperado);
      assert.deepEqual(pies(), pieEsperado(p.error.pie), `${s.id}: el pie del error`);
      if (s.acierto.figura) assert.equal(enOrden(s.acierto.figura, textoDeFiguras(c, true)), false, `${s.id}: la figura del acierto, con el error`);
      await alFallar?.(k, c, n);
      await tocar(boton("probar-otra"));
      assert.equal(c.querySelector("[data-mensaje]"), null);
    }
    assert.equal(n, 2, `${s.id}: dos malas`);
    await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
    await tocar(boton("confirmar"));
    const msj = c.querySelector("[data-mensaje]");
    assert.equal(msj.dataset.mensaje, "acierto");
    assert.equal(w.document.activeElement, msj);
    assert.deepEqual(pies(), pieEsperado(p.acierto.pie), `${s.id}: el pie del acierto`);
    const ps = [...msj.querySelectorAll("[data-texto]")];
    if (!s.porque) {
      assert.deepEqual(ps.map((x) => x.textContent), [s.acierto.texto]);
      assert.equal(msj.querySelector("[data-por-que]"), null);
    } else if (CONDICION.test(s.porque)) {
      /* Con condición: a la vista, sin plegar. */
      assert.deepEqual(ps.map((x) => x.textContent), [s.acierto.texto, s.porque], `${s.id}: el ¿Por qué? a la vista`);
      assert.equal(msj.querySelector("[data-por-que]"), null);
      assert.equal(msj.querySelector("[data-plegado]"), null);
    } else {
      /* Plegado: lo visible es el acierto; «¿Por qué?» abre el porqué, escrito aparte. */
      assert.equal(ps.length, 1);
      const plegado = ps[0].querySelector("[data-plegado]");
      assert.equal(ps[0].textContent, `${s.acierto.texto} ${s.porque}`);
      assert.equal(plegado.textContent, ` ${s.porque}`);
      assert.equal(plegado.hidden, true, `${s.id}: el ¿Por qué? va plegado`);
      const por = ps[0].querySelector("[data-por-que]");
      assert.equal(por.getAttribute("aria-expanded"), "false");
      await tocar(por);
      assert.equal(ps[0].querySelector("[data-plegado]").hidden, false);
      assert.equal(ps[0].querySelector("[data-por-que]"), null);
    }
    if (s.acierto.figura) assert.ok(enOrden(s.acierto.figura, textoDeFiguras(c, true)), `${s.id}: la figura del acierto («${s.acierto.figura}»)`);
    await alAcertar?.(k, c);
    await tocar(boton("seguir"));
  }
  assert.deepEqual(visitadas, P.pantallas.map((p) => p.id));
}

/* El arranque de cada prueba: JSDOM con lo que React necesita. */
export function prepararDom(JSDOM, VirtualConsole) {
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
  return w;
}
