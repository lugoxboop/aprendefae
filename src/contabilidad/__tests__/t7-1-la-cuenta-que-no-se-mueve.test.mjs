import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 — «La cuenta que no se mueve» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en el paquete aprobado
 *     (la v5 de Near, con PASA de Mello), y cada texto del paquete está en los
 *     datos: ni falta ni sobra
 *   · cada pantalla y cada estado muestra exactamente sus textos, tomados de
 *     los datos, y nada de lo que la v5 marca como interno
 *   · el error lleva a «Probar otra» y el acierto a «Seguir»
 *   · las opciones se barajan en cada intento
 *   · la pieza no entra al catálogo de FP
 *   · la figura de Watari: la portada sin figura y una en cada uno de los
 *     doce estados, con lo que dice su tabla de estados; cada figcaption con
 *     el texto alternativo de Near, letra por letra; nada punteado; en los
 *     errores la compra nunca se dibuja dentro de Inventario
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

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETE = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-pieza1-v5.md", RAIZ), "utf8");
/* La ficha no cambió desde la v3, que es su fuente (decisión de L): se compara con la tabla de la v3. */
const PAQUETE_V3 = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-pieza1-v3.md", RAIZ), "utf8");
const TEXTOS_FIGURA_NEAR = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-ap1-figura-textos.md", RAIZ), "utf8");
const GUIA_WATARI = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-ap1-figura-watari-v3-1.md", RAIZ), "utf8");
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
const botonesActivos = (caja) => [...caja.querySelectorAll("button")].filter((b) => !b.disabled).map((b) => b.textContent);

/* ═══════════ LO QUE EL ESTUDIANTE VE, SACADO DE LOS DATOS ═══════════ */

const lineaComoTexto = (l) => `${l.fecha} · ${l.cuenta} · ${l.lado} ${l.monto}`;
const fichaComoTexto = (f) => `${f.dato}: ${f.texto}`;

/* Cada estado de cada pantalla, con su lista de textos visibles en el orden en que aparecen. */
function textosEsperados(p, estado = null, opcionId = null) {
  if (p.tipo === "portada") return [P.titulo, p.objetivo, p.boton, p.pie];
  if (p.tipo === "lectura" || p.tipo === "resumen") return [P.titulo, ...p.parrafos, ...(p.siguiente ? [p.siguiente] : []), ...(p.boton ? [p.boton] : []), p.pie];
  const cabeza = [
    P.titulo,
    ...(p.enunciado ? [p.enunciado] : []),
    ...(p.ficha ? p.ficha.map(fichaComoTexto) : []),
    p.pregunta,
    ...(p.ayuda ? [p.ayuda] : []),
  ];
  const opciones = p.opciones.map((o) => o.texto).sort();
  if (estado === "colocando") return [...cabeza, ...opciones, T7.BOTON.confirmar, p.pie];
  if (estado === "error") return [...cabeza, ...opciones, p.opciones.find((o) => o.id === opcionId).devolucion, p.error.boton, p.error.pie];
  return [...cabeza, ...opciones, p.acierto.texto, p.acierto.nota, p.acierto.boton, p.acierto.pie];
}

/* Lo que de verdad hay en pantalla, leído del DOM. Las opciones se ordenan: su orden es aleatorio. */
function textosEnPantalla(caja) {
  const out = [caja.querySelector("h3").textContent];
  const marco = caja.querySelector("[data-pieza]");
  const opciones = [];
  const recorrer = (el) => {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); return; }
    if (el.matches("[data-texto], [data-ayuda], [data-pie], [data-dato], [data-linea], [data-boton]")) {
      if (el.matches("[data-linea]")) out.push(el.textContent.replace(/·/g, " · ").replace(/\s+/g, " ").trim());
      else out.push(el.textContent);
      return;
    }
    if (el.matches("[role=group]")) { [...el.children].forEach(recorrer); out.push(...opciones.sort()); return; }
    [...el.children].forEach(recorrer);
  };
  [...marco.children].forEach(recorrer);
  return out;
}

/* Todo el texto de la pieza, para comprobar que nada interno se cuela. */
function todosLosTextosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    if (p.objetivo) t.push(p.objetivo);
    if (p.parrafos) t.push(...p.parrafos);
    if (p.siguiente) t.push(p.siguiente);
    if (p.boton) t.push(p.boton);
    if (p.pie) t.push(p.pie);
    if (p.tipo !== "pregunta") continue;
    if (p.enunciado) t.push(p.enunciado);
    if (p.ficha) t.push(...p.ficha.map(fichaComoTexto));
    t.push(p.pregunta);
    if (p.ayuda) t.push(p.ayuda);
    for (const o of p.opciones) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    t.push(T7.BOTON.confirmar, p.error.boton, p.error.pie, p.acierto.texto, p.acierto.nota, p.acierto.boton, p.acierto.pie);
    if (p.acierto.linea) t.push(lineaComoTexto(p.acierto.linea));
  }
  return t;
}

/* ═══════════ 1 · LOS DATOS CONTRA EL PAQUETE APROBADO ═══════════ */

/*
 * Los «…» de primer nivel de la sección «Contenido» de la v5. Se lleva la
 * cuenta del anidamiento porque la nota cita otras piezas por su título
 * («…la armamos en «La factura completa».»).
 */
function citasDelContenido(md) {
  const contenido = md.slice(md.indexOf("## Contenido"), md.indexOf("## Cambios de la versión 4"));
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of contenido) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas del paquete no cierran");
  return citas;
}

test("★★★ cada texto de los datos está, letra por letra, en el paquete aprobado", () => {
  const ficha = new Set(pantalla("pregunta-compra").ficha.map(fichaComoTexto));
  const faltan = todosLosTextosVisibles().filter((t) => !ficha.has(t)).filter((t) => !PAQUETE.includes(t));
  assert.deepEqual(faltan, [], "estos textos no están en la v5 tal cual");
  /* El título va sin comillas en la v5; lo demás va entre «». */
  assert.ok(PAQUETE.includes(`- Título: ${P.titulo}`));
});

test("★★★ la ficha es la de la tabla de la v3, con mayúscula inicial", () => {
  const filas = [...PAQUETE_V3.matchAll(/^\| (Quién recibe|Quién entrega|Monto|Tipo|Clase de hecho) \| (.+) \|$/gm)].map((x) => ({ dato: x[1], texto: x[2] }));
  assert.equal(filas.length, 5);
  assert.deepEqual(pantalla("pregunta-compra").ficha, filas);
  assert.ok(pantalla("pregunta-compra").ficha.every((f) => /^[A-ZÁÉÍÓÚ$]/.test(f.texto)), "un dato empieza en minúscula");
});

test("★★★ cada texto del paquete está en los datos: no falta ninguno", () => {
  const datos = new Set(todosLosTextosVisibles());
  const citas = citasDelContenido(PAQUETE);
  assert.ok(citas.length >= 40, `se leyeron solo ${citas.length} textos del paquete`);
  const faltan = citas.filter((c) => !datos.has(c));
  assert.deepEqual(faltan, [], "estos textos de la v5 no están en los datos");
});

/* ═══════════ 2 · CADA PANTALLA Y CADA ESTADO, MONTADOS ═══════════ */

/* Recorre la pieza: en cada pregunta falla primero con cada opción equivocada y después acierta. */
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
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p, "error", o.id), `${p.id} · error ${o.id}`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(textosEnPantalla(m.caja), textosEsperados(p, "acierto"), `${p.id} · acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Las siete pantallas y los once estados, todos recorridos. */
    assert.equal(vistos.length, 5 + 3 + 3 + 2);
  } finally {
    m.desmontar();
  }
});

test("★★ nada de lo que la v5 marca como interno llega a la pantalla", async () => {
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
    for (const interno of ["interno", "construcción", "Cambia en v", "cambia en v", "(p. ", "(pp. ", "Lo que ya sabes", "El conteo al final", "La consecuencia", "Mello", "Near"]) {
      assert.ok(!todo.includes(interno), `se muestra «${interno}»`);
    }
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

test("★★ los botones de lectura son los de la v5, y el resumen no lleva ninguno", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    const vistos = [];
    for (const p of P.pantallas.slice(0, 4)) {
      vistos.push(botonesActivos(m.caja));
      await tocar(m.caja.querySelector("[data-boton]"));
    }
    assert.deepEqual(vistos, [["Empezar"], ["Seguir"], ["Seguir"], ["Ver el caso"]]);
  } finally {
    m.desmontar();
  }
  assert.equal(pantalla("resumen").boton, null);
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

test("★★ ids con el prefijo t7- y el tema al final del índice de Contabilidad", () => {
  assert.equal(T7.AP1_ID, "t7-1-a1-la-cuenta-que-no-se-mueve");
  assert.equal(P.id, T7.AP1_ID);
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.at(-1), TEMA_T7_1);
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
 * hasta el colocando de la 5; bajo Inventario en la 2 y en los errores de la 5.
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

test("★★★ la portada no lleva figura, y cada uno de los doce estados lleva la suya, como dice la tabla de Watari", async () => {
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
    assert.deepEqual(vistos, ORDEN_NEAR);
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

test("★★★ la línea del acierto de la v5 es la tarjeta de la compra, con sus mismas partes", async () => {
  const l = pantalla("pregunta-compra").acierto.linea;
  assert.equal(lineaComoTexto(l), "16 de abril · Compras · Debe $5.000.000");
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

test("★★★ en el colocando de la 5 el conteo pendiente no queda bajo Inventario: la figura no dibuja la respuesta", async () => {
  /* Montado en la pieza, en el estado real: pantalla 5 sin responder. */
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

test("★★ la factura lleva el rótulo «La compra», marcado como pendiente de revisión, solo en el colocando y los errores de la 4", async () => {
  for (const clave of Object.keys(T7.FIGURA)) {
    const m = await montar(h(FiguraDosColumnas, { estado: clave }));
    try {
      const rot = m.caja.querySelector("[data-fg=rotulo-factura]");
      const conFactura = ["F4c", "F4ei", "F4eg"].includes(clave);
      assert.equal(rot !== null, conFactura, clave);
      if (rot) {
        assert.equal(rot.textContent, "La compra");
        /* Texto de interfaz que Near todavía no confirma: se ve en el código y en el PR. */
        assert.equal(rot.dataset.revision, "pendiente");
      }
    } finally {
      m.desmontar();
    }
  }
  assert.deepEqual(T7.FIGURA_PENDIENTES_DE_REVISION, ["rotuloFactura"]);
  assert.match(readFileSync(new URL("src/data/contabilidadT7_1.js", RAIZ), "utf8"), /ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN/);
});

test("★ v3.1: el conteo pendiente va centrado y los encabezados se alinean por abajo", () => {
  assert.match(CSS_FIGURA, /\.t7fg-pend-libre \{ text-align: center; \}/);
  assert.match(CSS_FIGURA, /\.t7fg-cab \{ align-items: end; \}/);
});
