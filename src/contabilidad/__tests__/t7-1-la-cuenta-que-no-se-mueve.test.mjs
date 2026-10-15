import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 — «La cuenta que no se mueve» (Célula C), RECORTADA.
 *
 *   · los datos son, letra por letra, la sección de la pieza en el recorte
 *     del lote 1 de Near (lote1-recortes-t71-v1.md) con las cuatro
 *     correcciones obligatorias de Mello (mello-recortes-v1.md): ni falta ni
 *     sobra ningún texto, y cada «¿Por qué? (plegado)» va aparte
 *   · cuatro pantallas: portada, pregunta-compra, pregunta-conteo y resumen
 *   · cada pantalla y cada estado muestra exactamente sus textos, tomados de
 *     los datos, y nada de lo que el paquete marca como interno
 *   · lo plegado sale cerrado, con «¿Por qué?» (aria-expanded) que lo abre
 *   · el error lleva a «Probar otra» y el acierto a «Seguir»
 *   · las opciones se barajan en cada intento
 *   · la pieza no entra al catálogo de FP
 *   · la figura de Watari: la portada sin figura y una en cada uno de los
 *     nueve estados (F4, F5 y F6), con lo que dice su tabla de estados; cada
 *     figcaption con el texto alternativo de Near, letra por letra; nada
 *     punteado; en los errores la compra nunca se dibuja dentro de Inventario
 *
 * Que ningún texto se salga a 375 y a 320 px no se puede medir aquí: jsdom no
 * calcula diseño. Lo mide scripts/t7/medir-t7-1-ap1.mjs en Chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
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

const T7 = await import("../../data/contabilidadT7_1.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LaCuentaQueNoSeMueve } = await import("../../components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx");
const { TEMA_T7_1, PIEZAS_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");
const { textosDelError, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETES = new URL("orquestador/conocimiento/paquetes/", RAIZ);
const RECORTE_MD = readFileSync(new URL("lote1-recortes-t71-v1.md", PAQUETES), "utf8");
const MELLO_MD = readFileSync(new URL("mello-recortes-v1.md", PAQUETES), "utf8");
/* Los pies de fuente y los botones no los trae el recorte: siguen los de la v5. */
const PAQUETE_V5 = readFileSync(new URL("t7-1-pieza1-v5.md", PAQUETES), "utf8");
const TEXTOS_FIGURA_NEAR = readFileSync(new URL("t7-1-ap1-figura-textos.md", PAQUETES), "utf8");
const GUIA_WATARI = readFileSync(new URL("t7-1-ap1-figura-watari-v3-1.md", PAQUETES), "utf8");
const { default: FiguraDosColumnas, CSS_FIGURA } = await import("../../components/mecanicas/libros/t7/FiguraDosColumnas.jsx");
const P = T7.PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const boton = (caja, nombre) => caja.querySelector(`[data-boton="${nombre}"]`);
const opcionesEnPantalla = (caja) => [...caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
/* Los botones de la pieza, sin el «¿Por qué?» del texto plegado (lote 1), que no es un paso de la pieza. */
const botonesActivos = (caja) => [...caja.querySelectorAll("button:not([data-por-que])")].filter((b) => !b.disabled).map((b) => b.textContent);

/* ═══════════ 1 · EL RECORTE DE NEAR, CON LAS CORRECCIONES DE MELLO ═══════════ */

/* Los «…» de primer nivel de una línea, con el anidamiento («…la armas en «La factura completa».»). */
function citas(linea) {
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of linea) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, `las comillas no cierran: ${linea}`);
  return out;
}

/* La sección de la pieza en el recorte, pantalla por pantalla, tal como la escribió Near. */
function seccionDelRecorte() {
  const desde = RECORTE_MD.indexOf(`## ${T7.AP1_ID} · «`);
  assert.ok(desde >= 0, "la pieza no está en el recorte");
  const hasta = RECORTE_MD.indexOf("\n## ", desde + 1);
  const pantallas = [];
  let p = null;
  let ultimo = null;
  for (const l of RECORTE_MD.slice(desde, hasta < 0 ? undefined : hasta).split("\n")) {
    const cab = l.match(/^\*\*P(\d+) · `([^`]+)`\*\* \((\w+)\)(?: · figura: (.+))?$/);
    if (cab) {
      p = { k: Number(cab[1]), id: cab[2], tipo: cab[3], figura: cab[4]?.replace(/\s+/g, "") ?? null, textos: [], opciones: [], errores: {}, pista: null, acierto: null };
      pantallas.push(p);
      continue;
    }
    if (!p) continue;
    let m;
    if ((m = l.match(/^- Opciones o líneas: (.+)$/))) { p.opciones = citas(m[1]); continue; }
    if ((m = l.match(/^- \*pista \(1\.er error\):\* (.+)$/))) { p.pista = citas(m[1])[0]; continue; }
    if ((m = l.match(/^- \*error · ([^:*]+):\* (.+)$/))) { ultimo = p.errores[m[1]] = { texto: citas(m[2])[0], porque: null }; continue; }
    if ((m = l.match(/^- \*acierto:\* (.+)$/))) {
      const [texto, figura = null] = citas(m[1]);
      ultimo = p.acierto = { texto, porque: null, figura };
      continue;
    }
    if ((m = l.match(/^ {2}- ¿Por qué\? \(plegado\): (.+)$/))) { ultimo.porque = citas(m[1])[0]; continue; }
    if ((m = l.match(/^- «/))) { p.textos.push(citas(l)[0]); ultimo = null; }
  }
  return pantallas;
}

/*
 * Las cuatro correcciones obligatorias de Mello a A1, [texto de Near, texto
 * de Mello]. Cada una se comprueba en los dos documentos, así que si uno
 * cambia la prueba lo dice.
 */
const MELLO = {
  errorInventario: ["Esa sería la regla del Tema 2. En el periódico no se cumple.", "Sí va al debe, pero no de esa cuenta: en el periódico se queda quieta hasta el cierre."],
  casoCompra: ["La Reventa usa el sistema periódico. No mira su mercancía cada día, sino al final.", "La Reventa usa el sistema periódico. No anota su mercancía a diario: la revisa al final."],
  aciertoConteo: ["Exacto: el conteo pone al día Inventario de mercancías. Esa es la cifra del estado de situación financiera.", "Exacto: con el conteo, Inventario de mercancías se pone al día. Esa cifra es la que va al cierre."],
  casoConteo: ["Llega el último día del periodo. La Reventa mira la bodega y anota lo que quedó.", "Llega el último día del periodo. La Reventa hace el conteo físico de lo que quedó en la bodega."],
};
/*
 * Las pistas nuevas de Mello para A1, posteriores a su auditoría: llegaron por
 * el coordinador y no están en ningún documento del repo todavía. Ganan sobre
 * las del recorte, [pista del recorte, pista de Mello].
 */
const PISTAS_MELLO = {
  "pregunta-compra": ["Busca la cuenta que recoge lo comprado en el periodo.", "En el periódico, ¿qué cuenta junta en el periodo la mercancía que se trae para vender?"],
  "pregunta-conteo": ["El conteo dice cuánto vale lo que quedó en la bodega. Piensa en qué cuenta estuvo quieta todo el periodo.", "El conteo dice cuánto vale lo que quedó en la bodega. ¿Qué cuenta debería mostrar ese valor?"],
};

/* Lo que Mello pasa al plegado del acierto del conteo: va delante del plegado de Near. */
const MELLO_AL_PLEGADO = "Esa cifra es la que aparece en el estado de situación financiera.";
const A1_MELLO = MELLO_MD.slice(MELLO_MD.indexOf("**A1 «La cuenta que no se mueve»"), MELLO_MD.indexOf("**A3 «"));

test("★★★ las cuatro correcciones de Mello están en su auditoría (A1) y reemplazan un texto que sí está en el recorte", () => {
  assert.ok(A1_MELLO.length > 200, "no se encontró la sección A1 de Mello");
  for (const [clave, [near, mello]] of Object.entries(MELLO)) {
    assert.ok(RECORTE_MD.includes(`«${near}»`), `${clave}: «${near}» no está en el recorte`);
    assert.ok(A1_MELLO.includes(`«${mello}»`), `${clave}: «${mello}» no está en la A1 de Mello`);
  }
  assert.ok(A1_MELLO.includes(`Al plegado pasa: «${MELLO_AL_PLEGADO}»`));
  /* El error que Mello corrige es el de Inventario, y su «conteo físico» vuelve a la pregunta del conteo. */
  assert.match(A1_MELLO, /El error «Inventario» deshace/);
  assert.match(A1_MELLO, /P2 perdió el término «conteo físico»/);
});

/* El recorte con Mello encima: lo que la pieza debe llevar. */
function esperado() {
  const vigente = (t) => Object.values(MELLO).find(([near]) => near === t)?.[1] ?? t;
  return seccionDelRecorte().map((s) => {
    const textos = s.textos.map(vigente);
    if (s.tipo === "portada") return { id: s.id, tipo: s.tipo, objetivo: textos[0], figura: null };
    if (s.tipo === "resumen") return { id: s.id, tipo: s.tipo, parrafos: textos.slice(0, -1), siguiente: textos.at(-1), figura: s.figura };
    const errorDe = (texto) => Object.entries(s.errores).find(([nombre]) => texto.startsWith(nombre))?.[1];
    const conteo = s.acierto.texto === MELLO.aciertoConteo[0];
    return {
      id: s.id,
      tipo: s.tipo,
      enunciado: textos.slice(0, -1),
      pregunta: textos.at(-1),
      pista: PISTAS_MELLO[s.id] ? (assert.equal(s.pista, PISTAS_MELLO[s.id][0], `${s.id}: la pista del recorte cambió`), PISTAS_MELLO[s.id][1]) : s.pista,
      opciones: s.opciones.map((texto) => {
        const e = errorDe(texto);
        return e ? { texto, devolucion: vigente(e.texto), porque: e.porque } : { texto, devolucion: null, porque: null };
      }),
      acierto: {
        texto: vigente(s.acierto.texto),
        porque: conteo ? `${MELLO_AL_PLEGADO} ${s.acierto.porque}` : s.acierto.porque,
        figura: s.acierto.figura,
      },
      figura: s.figura,
    };
  });
}

/* Los datos en la misma forma. */
const lineaComoTexto = (l) => `${l.fecha} · ${l.cuenta} · ${l.lado} · ${l.monto}`;
function proyeccion() {
  return P.pantallas.map((s) => {
    if (s.tipo === "portada") return { id: s.id, tipo: s.tipo, objetivo: s.objetivo, figura: s.figura };
    if (s.tipo === "resumen") return { id: s.id, tipo: s.tipo, parrafos: s.parrafos, siguiente: s.siguiente, figura: s.figura };
    /* «F4 (c · ei · eg · a)»: el estado de cada momento de la pregunta. */
    const f = s.figura;
    const estados = [f.colocando, ...Object.values(f.error), f.acierto];
    const base = f.colocando.replace(/c$/, "");
    return {
      id: s.id,
      tipo: s.tipo,
      enunciado: s.enunciado,
      pregunta: s.pregunta,
      pista: s.pista,
      opciones: s.opciones.map((o) => ({ texto: o.texto, devolucion: o.devolucion ?? null, porque: o.porque ?? null })),
      acierto: { texto: s.acierto.texto, porque: s.acierto.porque ?? null, figura: s.acierto.linea ? lineaComoTexto(s.acierto.linea) : null },
      figura: `${base}(${estados.map((e) => e.slice(base.length)).join("·")})`,
    };
  });
}

test("★★★ cada pantalla es la del recorte con Mello encima, letra por letra: ids, tipos, textos, opciones en su orden, pista, errores, aciertos y plegados", () => {
  const e = esperado();
  assert.deepEqual(e.map((s) => s.id), ["portada", "pregunta-compra", "pregunta-conteo", "resumen"]);
  /* La figura se compara sin espacios: el recorte escribe «F4 (c · ei · eg · a)». */
  assert.deepEqual(proyeccion(), e);
});

test("★★★ lo correcto es lo del acierto, y cada error es de su opción", () => {
  assert.deepEqual(P.pantallas.filter((s) => s.opciones).map((s) => s.opciones.find((o) => o.correcta).texto), ["Compras", "Inventario de mercancías"]);
  for (const s of P.pantallas.filter((x) => x.opciones)) {
    assert.equal(s.opciones.filter((o) => o.correcta).length, 1, s.id);
    for (const o of s.opciones) assert.equal(Boolean(o.devolucion), !o.correcta, `${s.id} · ${o.id}`);
  }
});

/* Todo texto de los datos de la pieza, con su clave: no se cuela nada que no venga del recorte, de Mello o de la v5. */
function cadenas(v, clave = null, out = []) {
  if (typeof v === "string") out.push([clave, v]);
  else if (Array.isArray(v)) v.forEach((x) => cadenas(x, clave, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) cadenas(x, k, out);
  return out;
}

test("★★★ nada sobra: todo texto de los datos sale del recorte, de Mello, o es pie, botón, id o figura de la v5", () => {
  const delRecorte = new Set();
  const meter = (v) => { for (const [, t] of cadenas(v)) delRecorte.add(t); };
  meter(esperado());
  const linea = pantalla("pregunta-compra").acierto.linea;
  const sobran = cadenas(P.pantallas).filter(([clave, t]) => {
    if (delRecorte.has(t)) return false;
    if (clave === "pie" || clave === "boton") return !PAQUETE_V5.includes(`«${t}»`);
    if (clave === "id" || clave === "tipo") return false;
    /* La figura de cada estado y las partes de la tarjeta de la compra, que el acierto nombra. */
    if (Object.hasOwn(T7.FIGURA, t)) return false;
    if (Object.values(linea).includes(t)) return false;
    return true;
  });
  assert.deepEqual(sobran, []);
  assert.equal(P.titulo, "La cuenta que no se mueve");
  assert.ok(RECORTE_MD.includes(`## ${T7.AP1_ID} · «${P.titulo}»`));
});

test("★★★ salen las pantallas de lectura del recorte: lo-que-ya-sabes, el-conteo-al-final y la-consecuencia", () => {
  for (const id of ["lo-que-ya-sabes", "el-conteo-al-final", "la-consecuencia"]) {
    assert.equal(pantalla(id), undefined, id);
    assert.ok(RECORTE_MD.includes(`\`${id}\``), `el recorte no nombra ${id}`);
  }
  assert.equal(P.pantallas.length, 4);
});

/* ═══════════ 2 · CADA PANTALLA Y CADA ESTADO, MONTADOS ═══════════ */

/* Un texto con su plegado escrito aparte: en el DOM van los dos, lo plegado oculto. */
const conPlegado = (texto, porque) => (porque ? `${texto} ${porque}` : texto);

/* Cada estado de cada pantalla, con su lista de textos visibles en el orden en que aparecen.
 * En el error, `fallos` es cuántas veces se ha fallado ya esa pregunta (la escalera de ayuda del lote 2). */
function textosEsperados(p, estado = null, opcionId = null, fallos = 1) {
  if (p.tipo === "portada") return [P.titulo, p.objetivo, p.boton, p.pie];
  if (p.tipo === "resumen") return [P.titulo, ...p.parrafos, p.siguiente, p.pie];
  const cabeza = [P.titulo, ...p.enunciado, p.pregunta];
  const opciones = p.opciones.map((o) => o.texto).sort();
  if (estado === "colocando") return [...cabeza, ...opciones, T7.BOTON.confirmar, p.pie];
  if (estado === "error") {
    const o = p.opciones.find((x) => x.id === opcionId);
    const t = textosDelError(p, o, fallos).join(" ");
    return [...cabeza, ...opciones, t === o.devolucion ? conPlegado(t, o.porque) : t, p.error.boton, p.error.pie];
  }
  return [...cabeza, ...opciones, conPlegado(p.acierto.texto, p.acierto.porque), p.acierto.boton, p.acierto.pie];
}

/* Lo que de verdad hay en pantalla, leído del DOM. Las opciones se ordenan: su orden es aleatorio. */
function textosEnPantalla(caja) {
  const out = [caja.querySelector("h3").textContent];
  const marco = caja.querySelector("[data-pieza]");
  const opciones = [];
  const recorrer = (el) => {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); return; }
    if (el.matches("[data-figura]")) return;
    if (el.matches("[data-texto], [data-ayuda], [data-pie], [data-dato], [data-linea], [data-boton]")) {
      out.push(el.textContent);
      return;
    }
    if (el.matches("[role=group]")) { [...el.children].forEach(recorrer); out.push(...opciones.sort()); return; }
    [...el.children].forEach(recorrer);
  };
  [...marco.children].forEach(recorrer);
  return out;
}

/* Recorre la pieza: en cada pregunta falla primero con cada opción equivocada, luego otra vez con la primera
 * (el 2.º peldaño de la escalera de ayuda del lote 2), y después acierta. */
test("★★★ cada pantalla y cada estado muestran exactamente sus textos", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    const vistos = [];
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo !== "pregunta") {
        assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p), `pantalla ${p.id}`);
        vistos.push(p.id);
        const b = m.caja.querySelector("[data-boton]");
        if (b) await tocar(b);
        continue;
      }
      assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p, "colocando"), `${p.id} · colocando`);
      vistos.push(`${p.id}:colocando`);
      assert.ok(p.pista, `${p.id} sin pista`);
      const malas = p.opciones.filter((x) => !x.correcta);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        fallos++;
        /* 1.er error: la pista. 2.º y siguientes: la respuesta y su porqué (el acierto sin «Así es:» ni «Exacto:»). */
        assert.deepEqual(textosDelError(p, o, fallos), fallos === 1 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto}».`, sinAsiEs(p.acierto.texto)], `${p.id} escalera ${fallos}`);
        assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p, "error", o.id, fallos), `${p.id} · error ${fallos} ${o.id}`);
        vistos.push(`${p.id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p, "acierto"), `${p.id} · acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Las cuatro pantallas: 2 sin pregunta, y las 2 preguntas con colocando, 2 errores, el 2.º peldaño y el acierto. */
    assert.equal(vistos.length, 2 + 2 * 5);
  } finally {
    m.desmontar();
  }
});

test("★★★ el plegado de cada acierto sale cerrado: se ve el texto, «¿Por qué?» lo abre y entonces se lee el plegado del recorte", async () => {
  for (const id of ["pregunta-compra", "pregunta-conteo"]) {
    const p = pantalla(id);
    const m = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [p] }, rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      const msg = m.caja.querySelector('[data-devolucion="acierto"]');
      assert.ok(document.activeElement === msg, `${id}: el foco no fue al mensaje`);
      const plegado = msg.querySelector("[data-plegado]");
      assert.ok(plegado, `${id}: el acierto no trae plegado`);
      assert.equal(plegado.hidden, true, `${id}: el plegado sale abierto`);
      assert.equal(plegado.textContent, ` ${p.acierto.porque}`);
      /* Lo visible es el acierto, entero y solo él. */
      assert.equal(msg.querySelector("[data-texto]").textContent.slice(0, -plegado.textContent.length), p.acierto.texto);
      const porQue = msg.querySelector("[data-por-que]");
      assert.equal(porQue.getAttribute("aria-expanded"), "false");
      assert.equal(porQue.getAttribute("aria-label"), "¿Por qué?");
      await tocar(porQue);
      assert.equal(msg.querySelector("[data-plegado]").hidden, false, `${id}: «¿Por qué?» no abre`);
    } finally {
      m.desmontar();
    }
  }
});

test("★★ el plegado de una devolución, si se llega a mostrar, es el suyo (el de Inventario en la compra)", async () => {
  /* Con la escalera del lote 2 la devolución no se ve mientras la pregunta tenga pista: se prueba la pantalla sin pista. */
  const p = { ...pantalla("pregunta-compra"), pista: null };
  const m = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [p] }, rotulo: "R" }));
  try {
    const o = p.opciones.find((x) => x.id === "inventario");
    await tocar(m.caja.querySelector('[data-opcion="inventario"]'));
    await tocar(boton(m.caja, "confirmar"));
    const msg = m.caja.querySelector('[data-devolucion="error"]');
    assert.equal(msg.querySelector("[data-texto]").textContent, `${o.devolucion} ${o.porque}`);
    assert.equal(msg.querySelector("[data-plegado]").hidden, true);
    assert.equal(msg.querySelector("[data-plegado]").textContent, ` ${o.porque}`);
  } finally {
    m.desmontar();
  }
});

test("★★ nada de lo que el paquete marca como interno llega a la pantalla", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    const textos = [];
    const leer = () => textos.push(m.caja.textContent);
    for (const p of P.pantallas) {
      leer();
      if (p.tipo === "pregunta") {
        const mala = p.opciones.find((x) => !x.correcta);
        await tocar(m.caja.querySelector(`[data-opcion="${mala.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        leer();
        await tocar(boton(m.caja, "probar-otra"));
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        leer();
        await tocar(boton(m.caja, "seguir"));
      } else {
        const b = m.caja.querySelector("[data-boton]");
        if (b) await tocar(b);
      }
    }
    const todo = textos.join("\n");
    for (const interno of ["interno", "construcción", "Cambia en v", "cambia en v", "(p. ", "(pp. ", "no aplica", "plegado", "Figura:", "Lo que ya sabes", "El conteo al final", "La consecuencia", "Mello", "Near"]) {
      assert.ok(!todo.includes(interno), `se muestra «${interno}»`);
    }
    /* Ni las cifras de INFLESZ del paquete. */
    assert.doesNotMatch(todo, /\(\d{2},\d\)/);
    /* Ni «contar» ni sus formas (convención de la v5). */
    assert.doesNotMatch(todo, /(?<!\p{L})cont(ar|ó|amos|aron|aste)(?!\p{L})/iu);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · LOS BOTONES DE CADA ESTADO ═══════════ */

test("★★★ el error lleva a «Probar otra» y el acierto a «Seguir»", async () => {
  for (const id of ["pregunta-compra", "pregunta-conteo"]) {
    const p = pantalla(id);
    const pieza = { ...P, pantallas: [p, pantalla("resumen")] };
    const m = await montar(h(LaCuentaQueNoSeMueve, { pieza, rotulo: "R" }));
    try {
      /* Colocando: «Confirmar» no sirve hasta tocar una cuenta. */
      assert.equal(boton(m.caja, "confirmar").disabled, true);
      assert.equal(boton(m.caja, "confirmar").textContent, "Confirmar");
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        assert.equal(boton(m.caja, "confirmar").disabled, false);
        await tocar(boton(m.caja, "confirmar"));
        assert.equal(m.caja.querySelector("[data-pregunta]").dataset.estado, "error");
        assert.ok(document.activeElement === m.caja.querySelector('[data-devolucion="error"]'), "el foco no fue al mensaje");
        /* En el error, el único botón que sirve es «Probar otra»; no hay «Seguir». */
        assert.deepEqual(botonesActivos(m.caja), ["Probar otra"], `${id} · ${o.id}`);
        assert.equal(boton(m.caja, "seguir") === null, true, "en el error hay un botón «Seguir»");
        await tocar(boton(m.caja, "probar-otra"));
        assert.equal(m.caja.querySelector("[data-pregunta]").dataset.estado, "colocando");
        assert.ok([...m.caja.querySelectorAll("[data-opcion]")].every((b) => b.dataset.elegida === "no" && !b.disabled));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.equal(m.caja.querySelector("[data-pregunta]").dataset.estado, "acierto");
      /* En el acierto, el único botón que sirve es «Seguir»; no hay «Probar otra». */
      assert.deepEqual(botonesActivos(m.caja), ["Seguir"], id);
      assert.equal(boton(m.caja, "probar-otra") === null, true, "en el acierto hay un botón «Probar otra»");
      await tocar(boton(m.caja, "seguir"));
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "resumen");
    } finally {
      m.desmontar();
    }
  }
});

test("★★ la portada lleva «Empezar» y va a la primera pregunta; el resumen no lleva botón", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    assert.deepEqual(botonesActivos(m.caja), ["Empezar"]);
    await tocar(boton(m.caja, "empezar"));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "pregunta-compra");
  } finally {
    m.desmontar();
  }
  assert.equal(pantalla("resumen").boton, null);
  const r = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [pantalla("resumen")] }, rotulo: "R" }));
  try {
    assert.deepEqual(botonesActivos(r.caja), []);
  } finally {
    r.desmontar();
  }
});

/* ═══════════ 4 · EL ORDEN DE LAS OPCIONES ═══════════ */

test("★★ las opciones se barajan en cada intento: «Probar otra» nunca repite el orden", async () => {
  const p = pantalla("pregunta-compra");
  const m = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [p] }, rotulo: "R" }));
  try {
    let antes = opcionesEnPantalla(m.caja);
    for (let i = 0; i < 20; i++) {
      await tocar(m.caja.querySelector('[data-opcion="gastos"]'));
      await tocar(boton(m.caja, "confirmar"));
      await tocar(boton(m.caja, "probar-otra"));
      const ahora = opcionesEnPantalla(m.caja);
      assert.notDeepEqual(ahora, antes, `intento ${i + 2}: mismo orden que el anterior`);
      assert.deepEqual([...ahora].sort(), ["compras", "gastos", "inventario"]);
      antes = ahora;
    }
  } finally {
    m.desmontar();
  }
});

test("★ el primer orden también es al azar: en 60 montajes, la correcta no siempre va en el mismo lugar", async () => {
  const lugares = new Set();
  for (let i = 0; i < 60; i++) {
    const m = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [pantalla("pregunta-compra")] }, rotulo: "R" }));
    lugares.add(opcionesEnPantalla(m.caja).indexOf("compras"));
    m.desmontar();
  }
  assert.equal(lugares.size, 3);
});

/* ═══════════ 5 · CATÁLOGO, FP E IDENTIFICADORES ═══════════ */

test("★★★ la pieza no entra al catálogo de FP", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === T7.AP1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  /* El catálogo del servidor vive en las migraciones: el id no está en ninguna. */
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(T7.AP1_ID));
  assert.deepEqual(conElId, []);
  /* Y la pieza no registra nada. La vista registra solo los juegos de Hacer: a las piezas no les pasa con qué. */
  assert.match(readFileSync(new URL("src/components/ContabilidadT7_1View.jsx", RAIZ), "utf8"), /<Pieza pieza=\{pieza\} rotulo=\{rotulo\} \/>/);
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx", "src/data/contabilidadT7_1.js"]) {
    const src = readFileSync(new URL(f, RAIZ), "utf8");
    /* Se miran las importaciones y las llamadas, no los comentarios: el componente dice en uno que no registra. */
    assert.doesNotMatch(src, /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★ ids con el prefijo t7- y los tres temas de inventarios consecutivos, con solo el repaso detrás", () => {
  assert.equal(T7.AP1_ID, "t7-1-a1-la-cuenta-que-no-se-mueve");
  assert.equal(P.id, T7.AP1_ID);
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  /*
   * Esto decía «los tres últimos del índice» y dejó de ser cierto el 15 de
   * octubre de 2026, cuando el coordinador puso «repaso-capitulo-5» detrás de
   * inventarios (ver el mapa de choques en nocturno.md). La afirmación vieja
   * no estaba mal escrita: estaba atada a una posición absoluta que no era
   * suya. Ahora se afirma relativo, como ya lo hacían las pruebas de T7-2 y
   * T7-3, y se gana precisión en vez de perderla: antes solo decía que los
   * tres estaban al final; ahora dice que van consecutivos, en orden, y que
   * lo ÚNICO que puede ir detrás de ellos es el repaso del capítulo.
   */
  const i = temas.indexOf(TEMA_T7_1);
  assert.ok(i >= 0, "T7-1 no está en el índice de Contabilidad");
  assert.deepEqual(temas.slice(i, i + 3), [TEMA_T7_1, "inventarios-permanente", "inventarios-descuentos-nic2"]);
  const cola = temas.slice(i + 3);
  assert.ok(cola.length <= 1, `detrás de inventarios solo cabe el repaso del capítulo, y hay: ${cola.join(", ")}`);
  assert.deepEqual(cola.filter((id) => id !== "repaso-capitulo-5"), [], "detrás de inventarios solo puede ir repaso-capitulo-5");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  assert.equal(tema.title, "Inventarios I: el sistema periódico");
  /* AP1 abre el tema; las piezas que llegan después van detrás. */
  assert.equal(tema.actividades[0].id, T7.AP1_ID);
  assert.ok(tema.actividades.every((x) => x.id.startsWith("t7-")));
  /* La vista pinta lo que dice el catálogo, con el mismo título. */
  assert.equal(PIEZAS_T7_1[0].pieza.id, T7.AP1_ID);
  assert.equal(tema.actividades[0].nombre, P.titulo);
  /* El id del tema va sin prefijo (como el del Tema 5) y tiene ruta: si no, el índice lo dejaría muerto. */
  assert.equal(TEMA_T7_1, "inventarios-periodico");
  assert.ok(VISTAS.has(TEMA_T7_1));
  assert.equal(vistaDeTema(TEMA_T7_1), TEMA_T7_1);
});

/* ═══════════ 6 · LA FIGURA (Watari, v3; textos alternativos de Near) ═══════════ */

/*
 * La tabla de estados de la guía de Watari («Pantalla por pantalla»), escrita
 * aquí aparte de los datos para que un cambio en los datos no se dé por bueno
 * solo. `foco` es lo que se señala; `nueva`, lo que entra con fundido.
 * `pendiente` es dónde va «Conteo físico» mientras no está en tarjeta, con la
 * corrección de Mello: en la fila «Cierre», sin columna, desde la pantalla 3
 * hasta el colocando del conteo; bajo Inventario en F2 y en los errores del conteo.
 */
const TABLA_WATARI = {
  F1: { col2: "", filas: ["inicio"], factura: false, compra: false, otras: false, cierre: null, pendiente: null, foco: [], nueva: null },
  F2: { col2: "", filas: ["inicio", "durante", "cierre"], factura: false, compra: false, otras: false, cierre: "Conteo físico", pendiente: "inventario", foco: ["inv-durante"], nueva: null },
  F3: { col2: "Otra cuenta", filas: ["inicio", "durante", "cierre"], factura: false, compra: false, otras: false, cierre: "Conteo físico", pendiente: "fila", foco: ["inv-durante"], nueva: null },
  F4c: { col2: "Otra cuenta", filas: ["inicio", "durante", "cierre"], factura: true, compra: false, otras: false, cierre: "Conteo físico", pendiente: "fila", foco: ["fila-durante"], nueva: null },
  F4ei: { col2: "Otra cuenta", filas: ["inicio", "durante", "cierre"], factura: true, compra: false, otras: false, cierre: "Conteo físico", pendiente: "fila", foco: ["fila-durante", "inv-durante"], nueva: null },
  F4eg: { col2: "Otra cuenta", filas: ["inicio", "durante", "cierre"], factura: true, compra: false, otras: false, cierre: "Conteo físico", pendiente: "fila", foco: ["fila-durante"], nueva: null },
  F4a: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Conteo físico", pendiente: "fila", foco: ["fila-durante", "compra"], nueva: "compra" },
  F5c: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Conteo físico", pendiente: "fila", foco: ["fila-cierre"], nueva: null },
  F5ec: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Conteo físico", pendiente: "inventario", foco: ["fila-cierre", "inv-cierre"], nueva: null },
  F5en: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Conteo físico", pendiente: "inventario", foco: ["fila-cierre", "inv-cierre"], nueva: null },
  F5a: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Al día con el conteo físico", pendiente: null, foco: ["fila-cierre", "conteo"], nueva: "conteo" },
  F6: { col2: "Compras", filas: ["inicio", "durante", "cierre"], factura: false, compra: true, otras: true, cierre: "Al día con el conteo físico", pendiente: null, foco: [], nueva: null },
};

/* El orden de la tabla de Near: P1, P2, P3, P4 colocando, error Inventario, error Gastos, acierto, P5 colocando, error Compras, error Ninguna, acierto, P6. */
const ORDEN_NEAR = ["F1", "F2", "F3", "F4c", "F4ei", "F4eg", "F4a", "F5c", "F5ec", "F5en", "F5a", "F6"];
/* Los que recorre la pieza recortada: sin F1, F2 ni F3, que eran de las pantallas de lectura que salieron. */
const ORDEN_PIEZA = ORDEN_NEAR.slice(3);

function leerFigura(caja) {
  const fig = caja.querySelector("[data-figura]");
  if (!fig) return null;
  const q = (x) => fig.querySelector(`[data-fg="${x}"]`);
  const filas = ["inicio", "durante", "cierre"].filter((x) => q(`fila-${x}`));
  const cierre = q("conteo") ?? q("inv-cierre") ?? q("cierre-pendiente");
  return {
    clave: fig.dataset.figura,
    col2: q("col-2").textContent,
    filas,
    factura: Boolean(q("factura")),
    compra: Boolean(q("compra")),
    otras: Boolean(q("demas-compras")),
    cierre: cierre ? cierre.textContent : null,
    pendiente: q("cierre-pendiente") ? "fila" : q("inv-cierre") ? "inventario" : null,
    foco: [...fig.querySelectorAll(".t7fg-foco")].map((el) => el.dataset.fg).sort(),
    nueva: fig.querySelector(".t7fg-nueva")?.dataset.fg ?? null,
    alt: q("alt").textContent,
    altEnlazado: fig.querySelector("[role=table]").getAttribute("aria-describedby") === q("alt").id,
    compraEnInventario: [...fig.querySelectorAll("[data-fg=compra]")].some((el) => !el.closest("[data-fg=col2-durante]")),
  };
}

test("★★★ la portada no lleva figura, y cada uno de los nueve estados lleva la suya, como dice la tabla de Watari", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    const vistos = [];
    const comprobar = () => {
      const f = leerFigura(m.caja);
      const t = TABLA_WATARI[f.clave];
      assert.ok(t, `estado de figura desconocido: ${f.clave}`);
      assert.deepEqual(
        { col2: f.col2, filas: f.filas, factura: f.factura, compra: f.compra, otras: f.otras, cierre: f.cierre, pendiente: f.pendiente, foco: f.foco, nueva: f.nueva },
        { ...t, foco: [...t.foco].sort(), cierre: t.filas.includes("cierre") ? t.cierre : null },
        f.clave,
      );
      assert.equal(f.altEnlazado, true, `${f.clave}: el figcaption no está enlazado con aria-describedby`);
      assert.equal(f.compraEnInventario, false, `${f.clave}: la compra está fuera de su columna`);
      vistos.push(f.clave);
    };
    for (const p of P.pantallas) {
      if (p.tipo === "portada") {
        assert.equal(m.caja.querySelector("[data-figura]") === null, true, "la portada trae figura");
        assert.equal(p.figura, null, "los datos le ponen figura a la portada");
        await tocar(boton(m.caja, "empezar"));
        continue;
      }
      if (p.tipo !== "pregunta") {
        comprobar();
        const b = m.caja.querySelector("[data-boton]");
        if (b) await tocar(b);
        continue;
      }
      comprobar();
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        comprobar();
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      comprobar();
      await tocar(boton(m.caja, "seguir"));
    }
    assert.deepEqual(vistos, ORDEN_PIEZA);
  } finally {
    m.desmontar();
  }
});

test("★★★ cada figcaption trae el texto alternativo de Near, letra por letra", async () => {
  /* Las filas de la tabla de Near, en su orden: «| n | estado | «texto» |». */
  const filas = [...TEXTOS_FIGURA_NEAR.matchAll(/^\| (\d+) \| [^|]+ \| «(.+)» \|$/gm)].map((x) => [Number(x[1]), x[2]]);
  assert.deepEqual(filas.map((x) => x[0]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const [n, texto] of filas) {
    const clave = ORDEN_NEAR[n - 1];
    const m = await montar(h(FiguraDosColumnas, { estado: clave }));
    try {
      assert.equal(m.caja.querySelector("figcaption").textContent, texto, clave);
    } finally {
      m.desmontar();
    }
  }
});

test("★★ los textos visibles de la figura son los de Near y Watari, letra por letra", () => {
  for (const [k, t] of Object.entries(T7.FIGURA_TEXTOS)) {
    assert.ok(GUIA_WATARI.includes(`«${t}»`), `${k}: «${t}» no está en la guía de Watari`);
  }
});

test("★★★ lo que la figura muestra al acertar la compra (recorte: «Figura: …») es la tarjeta de la compra, con sus mismas partes", async () => {
  const l = pantalla("pregunta-compra").acierto.linea;
  assert.equal(lineaComoTexto(l), "16 de abril · Compras · Debe · $5.000.000");
  const m = await montar(h(FiguraDosColumnas, { estado: "F4a" }));
  try {
    const tarjeta = m.caja.querySelector("[data-fg=compra]");
    assert.equal(tarjeta.querySelector(".t7fg-fecha").textContent, l.fecha);
    assert.equal(tarjeta.querySelector(".t7fg-debe").textContent, l.lado);
    /* Sin «$», como todas las cifras de la célula dentro de una figura (Watari). */
    assert.equal(tarjeta.querySelector(".t7fg-monto").textContent, l.monto.replace("$", ""));
    /* La cuenta es el encabezado de su columna, y la tarjeta está en esa columna. */
    assert.equal(m.caja.querySelector("[data-fg=col-2]").textContent, l.cuenta);
    assert.ok(tarjeta.closest("[data-fg=col2-durante]") !== null);
  } finally {
    m.desmontar();
  }
  /* Y no se pinta dos veces: fuera de la figura no hay otra línea. */
  const m2 = await montar(h(LaCuentaQueNoSeMueve, { pieza: { ...P, pantallas: [pantalla("pregunta-compra")] }, rotulo: "R" }));
  try {
    await tocar(m2.caja.querySelector('[data-opcion="compras"]'));
    await tocar(boton(m2.caja, "confirmar"));
    assert.equal(m2.caja.querySelectorAll("[data-fg=compra]").length, 1);
    assert.equal(m2.caja.querySelector("[data-linea]") === null, true);
  } finally {
    m2.desmontar();
  }
});

test("★★ en los errores la compra no se dibuja, ni dentro de Inventario ni en ningún lado", async () => {
  for (const clave of ["F4ei", "F4eg"]) {
    const m = await montar(h(FiguraDosColumnas, { estado: clave }));
    try {
      assert.equal(m.caja.querySelector("[data-fg=compra]") === null, true, clave);
      assert.equal(m.caja.querySelector("[data-fg=inv-durante]").textContent, "No se mueve hasta el cierre");
      assert.doesNotMatch(m.caja.querySelector("[role=table]").textContent, /5\.000\.000|Compras/);
    } finally {
      m.desmontar();
    }
  }
});

test("★★ nada punteado ni discontinuo, y el fundido es de 120 ms y se apaga con movimiento reducido", () => {
  assert.doesNotMatch(CSS_FIGURA, /dashed|dotted/);
  assert.match(CSS_FIGURA, /\.t7fg-nueva \{ animation: t7fg-aparece \.12s/);
  assert.match(CSS_FIGURA, /@media \(prefers-reduced-motion: reduce\) \{ \.t7fg-nueva \{ animation: none; \} \}/);
  /* El corte de Mello: 121 px (era 129). */
  assert.match(CSS_FIGURA, /@container t7figmov \(max-width: 121px\)/);
});

test("★★★ en el colocando del conteo el conteo pendiente no queda bajo Inventario: la figura no dibuja la respuesta", async () => {
  /* Montado en la pieza, en el estado real: la pregunta del conteo sin responder. */
  const pieza = { ...P, pantallas: [pantalla("pregunta-conteo")] };
  const m = await montar(h(LaCuentaQueNoSeMueve, { pieza, rotulo: "R" }));
  try {
    const fig = m.caja.querySelector("[data-figura]");
    assert.equal(fig.dataset.figura, "F5c");
    const conteo = [...fig.querySelectorAll("p, div")].find((el) => el.textContent === "Conteo físico");
    assert.ok(conteo !== undefined, "no está «Conteo físico»");
    const celda = conteo.closest("[role=cell]");
    /* Ni en la celda de Inventario ni en la de Compras: en una celda que ocupa la fila entera. */
    assert.equal(celda.classList.contains("t7fg-ancha"), true, "el conteo quedó bajo una columna");
    assert.equal(celda.closest("[role=row]").querySelectorAll("[role=cell]").length, 1);
    assert.equal(fig.querySelector("[data-fg=inv-cierre]") === null, true, "hay un conteo bajo Inventario");
    /* Y al equivocarse, vuelve bajo Inventario, señalado: el mensaje ya lo explica. */
    await tocar(m.caja.querySelector('[data-opcion="ninguna"]'));
    await tocar(boton(m.caja, "confirmar"));
    const enInventario = m.caja.querySelector("[data-fg=inv-cierre]");
    assert.equal(enInventario !== null && enInventario.classList.contains("t7fg-foco"), true);
  } finally {
    m.desmontar();
  }
});

test("★★ la factura lleva el rótulo «La compra», ya revisado por Near, solo en el colocando y los errores de la 4", async () => {
  for (const clave of Object.keys(T7.FIGURA)) {
    const m = await montar(h(FiguraDosColumnas, { estado: clave }));
    try {
      const rot = m.caja.querySelector("[data-fg=rotulo-factura]");
      const conFactura = ["F4c", "F4ei", "F4eg"].includes(clave);
      assert.equal(rot !== null, conFactura, clave);
      if (rot) {
        assert.equal(rot.textContent, "La compra");
        /* Near lo confirmó: ya no lleva la marca de pendiente. */
        assert.equal(rot.dataset.revision, undefined);
      }
    } finally {
      m.desmontar();
    }
  }
  assert.deepEqual(T7.FIGURA_PENDIENTES_DE_REVISION, []);
  const fuente = readFileSync(new URL("src/data/contabilidadT7_1.js", RAIZ), "utf8");
  assert.match(fuente, /REVISADO POR NEAR/);
  assert.doesNotMatch(fuente, /PENDIENTE DE REVISIÓN/);
});

test("★ v3.1: el conteo pendiente va centrado y los encabezados se alinean por abajo", () => {
  assert.match(CSS_FIGURA, /\.t7fg-pend-libre \{ text-align: center; \}/);
  assert.match(CSS_FIGURA, /\.t7fg-cab \{ align-items: end; \}/);
});
