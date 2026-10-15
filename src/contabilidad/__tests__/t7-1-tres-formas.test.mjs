import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 «Tres formas de ponerle precio a lo que quedó» (Célula C).
 *
 * Cuatro capas de Near, y manda la más nueva:
 *   · cada texto de los datos está, letra por letra, en alguna capa
 *   · cada texto visible de la v1 y de la v2 está en los datos, salvo los que
 *     una capa posterior reemplaza, y esos ya no aparecen («cajas» pasa a
 *     «unidades»; el pie de P7 es el de la glosa)
 *   · la glosa de «impuesto de renta» va en P7, después de «lo vendido», y P8
 *     no la repite
 *   · los aciertos de P4 y P5 son los originales de la v1 (decisión anotada)
 *   · la ficha, la tabla de P6 y las tarjetas de P7 son las de Near; las
 *     cifras se calculan
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie,
 *     con la escalera de ayuda del lote 2 (pista; luego respuesta y porqué)
 *   · lote 2: las pistas y la tercera opción de P3 y P4 son las de Near
 *   · UEPS con su rótulo; sin el 33 %; en T7-1 en la posición 5
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

const A = await import("../../data/contabilidadT7_1_ap3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: TresFormas, CSS_AP3 } = await import("../../components/mecanicas/libros/t7/TresFormas.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { textosDelError, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-1-ap3-v1.md");
const V2 = leer("t7-1-ap3-v2-cambios.md");
const GLOSA = leer("t7-1-ap3-glosa-renta.md");
const OPC = leer("t7-1-ap3-opcionales.md");
const CAPAS = [V1, V2, GLOSA, OPC];
/* Lote 2 de la revisión de calidad (Near): las pistas del primer error y el anexo de la tercera opción. */
const LOTE2_PISTAS = conCorreccionesDeMello(leer("lote2-pistas-v1.md"));
const LOTE2_ANEXO = conCorreccionesDeMello(leer("lote2-anexo-v1.md"));
const CONTENIDO_V1 = V1.slice(V1.indexOf("## Contenido por pantalla y estado"), V1.indexOf("## Erratas C7 que toca"));
const COBERTURA_V2 = V2.slice(V2.indexOf("## Corrección 1"), V2.indexOf("## Corrección 2"));
const P = A.PIEZA_TRES_FORMAS;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

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
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });

/* Sin la ficha ni las tablas: esas se comparan como tablas. */
function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "encabezado", "pregunta", "siguiente", "boton", "pie", "cierre"]) if (p[k]) t.push(p[k]);
    t.push(...p.parrafos, ...(p.calculos ?? []));
    if (p.error) t.push(p.error.pie);
    if (p.pista) t.push(p.pista);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.tarjetas) for (const m of p.tarjetas.metodos) t.push(m.aFavor, m.enContra);
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie, ...p.acierto.calculos);
  }
  return t;
}

function citas(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    /* Los paréntesis que sí se ven (el rótulo de UEPS y el método en «Inventario final (…)») se protegen. */
    .replace(/ \((no válido bajo NIIF|PEPS|UEPS|promedio ponderado)\)/g, " ⟨$1⟩")
    .replace(/\([^()]*\)/g, "")
    .replace(/ ⟨([^⟩]+)⟩/g, " ($1)")
    .replace(/^\s*- «[^»]*»: /gm, "- ")
    .replace(/Si elige «[^»]*»: /g, "");
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas no cierran");
  return out;
}

/* Lo que una capa posterior reemplaza: [texto viejo, capa vieja, texto nuevo, capa nueva]. */
const REEMPLAZOS = [
  ["El libro aclara que no importa el orden real en que salen las cajas. El método sigue el orden de los costos.", V2, "El libro aclara que no importa el orden real en que salen las unidades. El método sigue el orden de los costos.", OPC],
  ["Aquí tampoco importa qué cajas salen de verdad. Importa el orden de los costos.", V2, "Aquí tampoco importa qué unidades salen de verdad. Importa el orden de los costos.", OPC],
  ["Los métodos siguen el orden de los costos, no el de las cajas.", V2, "Los métodos siguen el orden de los costos, no el de las unidades que salen.", OPC],
  ["Basado en el libro, pp. 215-218", V2, "Basado en el libro, pp. 214-218", GLOSA],
];
/* Los reemplazos condicionales de la v1 que no se usan (decisión anotada en los datos). */
const SIN_USAR_V1 = [
  "Así es. Se venden las 30 compradas y 5 de las del inicio. Las 5 que quedan son del inicio y cuestan $20.000 cada una.",
  "Así es. Con el promedio, cada unidad cuesta lo mismo. Por eso las 5 que quedan valen $118.750.",
];

/* ═══════════ 1 · TEXTOS CONTRA LAS CUATRO CAPAS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en alguna de las cuatro capas (o, si es del lote 2, en su paquete)", () => {
  const faltan = textosVisibles().filter((t) => !CAPAS.some((c) => c.includes(t)) && !LOTE2_PISTAS.includes(t) && !LOTE2_ANEXO.includes(t));
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), []);
});

test("★★★ donde una capa reemplaza un texto, manda la nueva y la vieja ya no aparece", () => {
  const datos = textosVisibles();
  for (const [viejo, capaVieja, nuevo, capaNueva] of REEMPLAZOS) {
    assert.ok(capaVieja.includes(`«${viejo}»`), `no está en su capa: ${viejo}`);
    assert.ok(capaNueva.includes(`«${nuevo}»`), `no está en su capa: ${nuevo}`);
    assert.ok(datos.includes(nuevo), `falta: ${nuevo}`);
  }
  /* El pie viejo de P7 era solo el de colocando; los de error y acierto siguen. */
  assert.equal(pantalla("a-favor-y-en-contra").pie, "Basado en el libro, pp. 214-218");
  assert.doesNotMatch(datos.join("\n"), /cajas/);
  for (const t of SIN_USAR_V1) { assert.ok(V1.includes(`«${t}»`)); assert.ok(!datos.includes(t), t); }
});

test("★★★ cada texto visible de la v1 está en los datos, salvo los que reemplaza una capa posterior", () => {
  const datos = new Set([...textosVisibles(), ...Object.values(A.BOTON), ...pantalla("los-datos").ficha.map((f) => f.texto)]);
  const v1 = citas(CONTENIDO_V1).filter((c) => !SIN_USAR_V1.includes(c));
  assert.ok(v1.length >= 45, `se leyeron solo ${v1.length}`);
  /* Los rótulos internos de la tabla de P6 y los títulos se comprueban aparte. */
  assert.deepEqual(v1.filter((c) => !datos.has(c)), []);
});

test("★★★ cada texto nuevo de la v2 está en los datos, salvo los que reemplazan los opcionales y la glosa", () => {
  const datos = new Set(textosVisibles());
  const seccion = COBERTURA_V2
    .replace(/\*\*Lo que dejé fuera[\s\S]*?(?=\*\*c\))/, "")
    .replace(/^\s*- La primera frase sale.*$/gm, "");
  const v2 = citas(seccion).filter((c) => !REEMPLAZOS.some(([v]) => v === c));
  const p9 = V2.slice(V2.indexOf("**P9, resumen"), V2.indexOf("## Corrección 2"));
  assert.ok(v2.length >= 25, `se leyeron solo ${v2.length}`);
  assert.deepEqual(v2.filter((c) => !datos.has(c) && !p9.includes(c)), []);
});

test("★★ la glosa de «impuesto de renta»: en P7, justo después de «lo vendido»; P8 la usa sin repetirla", () => {
  const glosa = "El impuesto de renta es el impuesto que se calcula sobre la utilidad.";
  assert.ok(GLOSA.includes(`«${glosa}»`) && OPC.includes(`«${glosa}»`));
  const p7 = pantalla("a-favor-y-en-contra").parrafos;
  assert.equal(p7[p7.indexOf("En estas líneas, lo vendido es lo que costaron las unidades que salieron.") + 1], glosa);
  assert.ok(!JSON.stringify(pantalla("la-recomendacion")).includes(glosa));
  assert.match(pantalla("la-recomendacion").parrafos.join(" "), /impuesto de renta/);
  for (const p of P.pantallas.slice(0, 7)) assert.doesNotMatch(JSON.stringify(p), /impuesto de renta/i, `${p.id}: el término aparece antes de su glosa`);
});

/* Las filas del anexo del lote 2 de una pieza: su pantalla, las opciones que tenía (✓ = correcta), la tercera y su devolución. */
function filasDelAnexo(pieza) {
  return LOTE2_ANEXO.split("\n").filter((l) => l.startsWith(`| ${pieza} |`)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    return {
      pantalla: c[1].match(/`([^`]+)`/)[1],
      opciones: c[2].split(" · ").map((x) => ({ texto: x.replace(/ ✓$/, ""), correcta: x.endsWith(" ✓") })),
      tercera: c[3].match(/^\*\*(.+)\*\*$/)[1],
      devolucion: c[4].match(/^«(.+)»$/)[1],
    };
  });
}

test("★★★ lote 2 · anexo: P3 y P4 pasan de dos a tres opciones; las dos de la v1 siguen y la tercera es, letra por letra, la del anexo", () => {
  const filas = filasDelAnexo(A.AP3_ID);
  assert.deepEqual(filas.map((f) => f.pantalla), ["peps", "ueps"]);
  for (const f of filas) {
    const p = pantalla(f.pantalla);
    assert.equal(p.opciones.length, 3, f.pantalla);
    const nueva = p.opciones.find((o) => o.texto === f.tercera);
    assert.ok(nueva, `${f.pantalla}: falta la tercera opción del anexo`);
    assert.deepEqual({ correcta: nueva.correcta, devolucion: nueva.devolucion }, { correcta: false, devolucion: f.devolucion }, f.pantalla);
    /* El anexo las nombra en corto («De las 30 compradas, a $25.000»): cada trozo del nombre corto está en la opción, y la ✓ sigue siendo la correcta. */
    const viejas = p.opciones.filter((o) => o !== nueva);
    assert.equal(viejas.length, f.opciones.length, f.pantalla);
    for (const corta of f.opciones) {
      const o = viejas.filter((x) => corta.texto.split(", ").every((trozo) => x.texto.includes(trozo)));
      assert.equal(o.length, 1, `${f.pantalla}: «${corta.texto}»`);
      assert.equal(o[0].correcta, corta.correcta, `${f.pantalla}: «${corta.texto}»`);
    }
    /* Las dos de antes, con su devolución de la v1 o la v2. */
    for (const o of p.opciones.filter((x) => x !== nueva && !x.correcta)) assert.ok(CAPAS.some((c) => c.includes(`«${o.devolucion}»`)), o.devolucion);
  }
});

test("★★★ lote 2 · pistas: cada pregunta lleva la suya, letra por letra la de Near para su pantalla", () => {
  const seccion = LOTE2_PISTAS.slice(LOTE2_PISTAS.indexOf(`### ${A.AP3_ID} `), LOTE2_PISTAS.indexOf("\n### ", LOTE2_PISTAS.indexOf(`### ${A.AP3_ID} `)));
  const deNear = Object.fromEntries(seccion.split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    return [c[0].match(/`([^`]+)`/)[1], c[2].match(/^«(.+)»$/)[1]];
  }));
  const preguntas = P.pantallas.filter((p) => p.tipo === "eleccion");
  assert.deepEqual(Object.fromEntries(preguntas.map((p) => [p.id, p.pista])), deNear);
});

/* ═══════════ 2 · TABLAS Y CIFRAS ═══════════ */

function tablaDespuesDe(md, marca) {
  const desde = md.indexOf(marca);
  assert.ok(desde >= 0, `no está «${marca}»`);
  const lineas = md.slice(desde).split("\n");
  const inicio = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(inicio)) {
    if (!l.startsWith("|")) break;
    filas.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return filas.filter((f) => !f.every((c) => /^-*$/.test(c)));
}

test("★★★ la ficha de P2, la tabla de P6 y las tarjetas de P7 son las de Near", () => {
  assert.deepEqual(pantalla("los-datos").ficha.map((f) => [f.dato, f.texto]), tablaDespuesDe(CONTENIDO_V1, "Ficha. B-1").slice(1));
  const t6 = tablaDespuesDe(CONTENIDO_V1, "Tabla que se ve");
  const m = pantalla("lado-a-lado").metodos;
  assert.deepEqual(["Método", ...m.columnas], t6[0]);
  assert.deepEqual(m.filas.map((f) => [f.metodo, ...f.valores]), t6.slice(1));
  const t7 = tablaDespuesDe(V2, "Tarjetas, una por método");
  const tj = pantalla("a-favor-y-en-contra").tarjetas;
  assert.deepEqual(["Método", tj.rotulos.aFavor, tj.rotulos.enContra], t7[0]);
  assert.deepEqual(tj.metodos.map((x) => [x.metodo, x.aFavor, x.enContra]), t7.slice(1).map(([a, b, c]) => [a, b.match(/«([^»]+)»/)[1], c.match(/«([^»]+)»/)[1]]));
});

test("★★★ las cifras de B-1 se calculan y son las del libro", () => {
  const C = A.CIFRAS;
  assert.deepEqual([C.inicial, C.compras, C.costoDisponible, C.disponibles, C.quedan, C.promedio, C.peps, C.ueps, C.ponderado, C.puntoMedio],
    [200000, 750000, 950000, 40, 5, 23750, 125000, 100000, 118750, 22500]);
  assert.equal(A.UEPS, "UEPS (no válido bajo NIIF)");
  assert.equal(pantalla("ueps").encabezado, "Método UEPS (no válido bajo NIIF)");
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(TresFormas, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lectura") {
        assert.deepEqual(enPantalla(m.caja).textos, [p.objetivo, ...p.parrafos, ...(p.calculos ?? []), p.cierre, p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const tarjetas = [
        ...(p.metodos ? p.metodos.filas.map((f) => f.metodo) : []),
        ...(p.tarjetas ? p.tarjetas.metodos.flatMap((x) => [x.metodo, x.aFavor, x.enContra]) : []),
      ];
      const cab = [p.encabezado, ...p.parrafos, ...(p.calculos ?? []), ...tarjetas, p.pregunta].filter(Boolean);
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda (lote 2): el 1.er error da la pista; el 2.º y siguientes, la respuesta con su porqué.
       * Se recorren todas las incorrectas y luego se falla otra vez la primera, para ver los dos peldaños. */
      assert.ok(p.pista, `${p.id} sin pista del lote 2`);
      const malas = p.opciones.filter((x) => !x.correcta);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        fallos++;
        const esperados = textosDelError(p, o, fallos);
        assert.deepEqual(esperados, fallos === 1 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, sinAsiEs(p.acierto.texto)].filter(Boolean), `${p.id} escalera ${fallos}`);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...esperados, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${fallos} ${o.id}`);
        vistos.push(`${p.id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, ...p.acierto.calculos, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* 4 de lectura; P3 a P8, con tres opciones (P3 y P4 desde el anexo del lote 2):
     * colocando, las 2 incorrectas, la 1.ª otra vez (2.º peldaño) y el acierto. */
    assert.equal(vistos.length, 4 + 6 * 5);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los cálculos de P3, P4 y P5 llegan con el acierto; las opciones se barajan en cada intento", async () => {
  const p = pantalla("promedio-ponderado");
  const m = await montar(h(TresFormas, { pieza: conPieza("promedio-ponderado"), rotulo: "R" }));
  try {
    const calc = () => [...m.caja.querySelectorAll("[data-calculo]")].map((c) => c.textContent);
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    assert.deepEqual(calc(), p.calculos);
    let antes = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="punto-medio"]'));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(calc(), p.calculos);
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
    await tocar(m.caja.querySelector('[data-opcion="ponderado"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(calc(), [...p.calculos, ...p.acierto.calculos]);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER, Y EL ORDEN ═══════════ */

test("★★ sin el 33 %, sin advertencias sobre NIIF, sin nada interno; sin color de debe ni de haber", () => {
  const todo = JSON.stringify(P) + CSS_AP3;
  assert.doesNotMatch(todo, /33 ?%/);
  assert.doesNotMatch(todo, /#2A9D8F|#E9C46A/i);
  const texto = textosVisibles().join("\n");
  /* NIIF va solo en el rótulo de UEPS, sin explicarla: P4, la tarjeta de P6 y la de P7. */
  const json = JSON.stringify(P);
  assert.equal((json.match(/NIIF/g) ?? []).length, 3);
  assert.equal((json.match(/UEPS \(no válido bajo NIIF\)/g) ?? []).length, 3);
  for (const interno of ["≈", "glosa", "construcción", "Near", "Mello", "Watari", "C7-", "(p. "]) assert.ok(!texto.includes(interno), interno);
});

test("★★★ fuera del catálogo de FP; id del mapa; en T7-1 en la posición 5: después de AP2 y antes de AP4 y A5", () => {
  assert.equal(A.AP3_ID, "t7-1-a3-tres-formas");
  assert.equal(P.numero, 3);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.AP3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.ok(ids.indexOf(A.AP3_ID) > ids.indexOf("t7-1-a2-la-factura-completa"));
  assert.ok(ids.indexOf(A.AP3_ID) < ids.indexOf("t7-1-a5-importados-y-fletes"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.ok(piezas.indexOf(A.AP3_ID) > piezas.indexOf("t7-1-a2-la-factura-completa"));
  assert.ok(piezas.indexOf(A.AP3_ID) < piezas.indexOf("t7-1-a5-importados-y-fletes"));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP3_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/TresFormas.jsx", "src/data/contabilidadT7_1_ap3.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
