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
  if (p.tipo === "portada") return [P.titulo, T7.FIGURA_PENDIENTE, p.objetivo, p.boton, p.pie];
  if (p.tipo === "lectura" || p.tipo === "resumen") return [P.titulo, ...p.parrafos, ...(p.boton ? [p.boton] : []), p.pie];
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
  return [
    ...cabeza, ...opciones, p.acierto.texto,
    ...(p.acierto.linea ? [lineaComoTexto(p.acierto.linea)] : []),
    p.acierto.nota, p.acierto.boton, p.acierto.pie,
  ];
}

/* Lo que de verdad hay en pantalla, leído del DOM. Las opciones se ordenan: su orden es aleatorio. */
function textosEnPantalla(caja) {
  const out = [caja.querySelector("h3").textContent];
  const fig = caja.querySelector("[data-figura-pendiente]");
  if (fig) out.push(fig.textContent);
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
  [...marco.children].filter((c) => !c.matches("[data-figura-pendiente]")).forEach(recorrer);
  return out;
}

/* Todo el texto de la pieza, para comprobar que nada interno se cuela. */
function todosLosTextosVisibles() {
  const t = [P.titulo, T7.FIGURA_PENDIENTE];
  for (const p of P.pantallas) {
    if (p.objetivo) t.push(p.objetivo);
    if (p.parrafos) t.push(...p.parrafos);
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
  const faltan = todosLosTextosVisibles()
    .filter((t) => t !== T7.FIGURA_PENDIENTE)
    .filter((t) => !PAQUETE.includes(t));
  assert.deepEqual(faltan, [], "estos textos no están en la v5 tal cual");
  /* El título y la ficha van sin comillas en la v5; lo demás va entre «». */
  assert.ok(PAQUETE.includes(`- Título: ${P.titulo}`));
  const ficha = pantalla("pregunta-compra").ficha.map(fichaComoTexto).join(" · ");
  assert.ok(PAQUETE.includes(`- Ficha: ${ficha}.`), "la ficha no coincide con la v5");
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
  /* Y ni la pieza ni la vista registran nada. */
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx", "src/components/ContabilidadT7_1View.jsx", "src/data/contabilidadT7_1.js"]) {
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
  assert.deepEqual(tema.actividades.map((x) => x.id), [T7.AP1_ID]);
  assert.ok(tema.actividades.every((x) => x.id.startsWith("t7-")));
  /* La vista pinta lo que dice el catálogo, con el mismo título. */
  assert.deepEqual(PIEZAS_T7_1.map((x) => x.pieza.id), [T7.AP1_ID]);
  assert.equal(tema.actividades[0].nombre, P.titulo);
  /* El id del tema va sin prefijo (como el del Tema 5) y tiene ruta: si no, el índice lo dejaría muerto. */
  assert.equal(TEMA_T7_1, "inventarios-periodico");
  assert.ok(VISTAS.has(TEMA_T7_1));
  assert.equal(vistaDeTema(TEMA_T7_1), TEMA_T7_1);
});

test("★ el hueco de la figura está marcado y no trae dibujo", async () => {
  const m = await montar(h(LaCuentaQueNoSeMueve, { rotulo: "R" }));
  try {
    const hueco = m.caja.querySelector("[data-figura-pendiente]");
    assert.ok(hueco !== null, "no hay hueco de figura");
    assert.equal(hueco.querySelector("svg, img, canvas") === null, true, "el hueco trae un dibujo");
  } finally {
    m.desmontar();
  }
});
