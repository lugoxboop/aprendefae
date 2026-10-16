import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «San Calixto» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete vigente de
 *     Katsumi (con la v2 y el cambio del 15 de octubre en P3), letra por
 *     letra, y ningún texto que la v2 sustituye sigue
 *   · LAS CIFRAS SE CALCULAN: los dos saldos conciliados, los totales y el
 *     mayor salen de las partidas del libro, y coinciden con la tabla de
 *     cifras del paquete. Ningún número de cheque (E3 / D4-5)
 *   · la figura «La conciliación de dos lados» de Hanayama (v1 + v1.1 +
 *     v1.2): el par con el «=» solo cuando los saldos son iguales; un lado
 *     por pantalla; «Más» y «Menos» sin color; los rótulos del detalle y de
 *     las cinco notas son los de la tabla de P7 del paquete; el mayor
 *   · PH8-2: en P2 y P4, mientras se pregunta y en el error, «Más» y
 *     «Menos» guardan su sitio SIN su texto; en P6, las dos marcas
 *   · Aprender: sin catálogo, sin migración y sin llamar al motor de FP
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

const Z = await import("../../data/contabilidadT4A5.js");
const { BOTON, INTERFAZ, DEBE, HABER } = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, CSS_T4C, PIEZAS_T4, TEMA_T4, cifra } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, leerSecciones, textosDeDatos, PAQUETES, RAIZ, CITA, blobEnLaRamaFuente, archivosEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const V1 = leer(`${PAQUETES}d4-t4-a5-v1.md`);
const V2 = leer(`${PAQUETES}d4-t4-a5-h8-v2-cambios.md`);
const P = Z.PIEZA_SAN_CALIXTO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const S = leerSecciones(V1);
const DE_A5 = ["d4-t4-a5-h8-v2-cambios.md"];
const IDS = ["portada", "dos-saldos", "lo-que-el-banco-no-sabe", "el-saldo-del-banco", "lo-que-la-empresa-no-sabe", "el-saldo-de-la-empresa", "que-se-asienta", "los-cinco-asientos", "el-mayor", "resumen"];
const PAQUETE = IDS.map((id, k) => ({ id, ...S[`P${k}`] }));
const V2_A5 = V2.slice(V2.indexOf("# A5 «San Calixto»"), V2.indexOf("# H8"));

/* Las tablas del paquete, leídas: cada fila es la lista de sus celdas. */
const tablaDe = (bloque, encabezado) => {
  const i = bloque.indexOf(encabezado);
  assert.ok(i >= 0, `no está la tabla «${encabezado}»`);
  const filas = [];
  for (const l of bloque.slice(i).split("\n").slice(2)) {
    if (!l.startsWith("|")) break;
    filas.push(l.split("|").slice(1, -1).map((c) => c.trim().replace(/\*\*/g, "")));
  }
  return filas;
};
const n = (t) => Number(t.replace(/\./g, ""));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete base es la versión vigente; la v2 (A5-a, A5-b) está dentro y ningún texto que sustituye sigue", () => {
  assert.match(V1, /\*\*Este archivo es la versión vigente\.\*\* Ya incluye la parte de A5 de `d4-t4-a5-h8-v2-cambios\.md`/);
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*a5.*-cambios\.md$/.test(f)).sort(), DE_A5, "hay un archivo de cambios de A5 que esta pieza no ha mirado todavía");
  const datos = P.pantallas.flatMap(textosDeDatos);
  /* A5-a: el dato inventado («el proveedor») ya no está; el texto nuevo, sí. */
  const a5a = V2_A5.slice(V2_A5.indexOf("## A5-a"), V2_A5.indexOf("## A5-b"));
  const [viejo, nuevo] = [a5a.match(new RegExp(`- v1: ${CITA}`))[1], a5a.match(new RegExp(`- \\*\\*v2:\\*\\* ${CITA}`))[1]];
  assert.ok(!datos.includes(viejo.replace(/\*\*/g, "")), "sigue el texto de la v1 («el proveedor»)");
  assert.doesNotMatch(datos.join("\n"), /el proveedor lo va a cobrar/);
  assert.ok(datos.includes(nuevo), "no está el texto de la v2 de A5-a");
  /* A5-b: la glosa de «sobregiro», debajo de la línea de las notas débito (P4). */
  /* La línea que pone la glosa en pantalla: su cita es la última de la línea (antes nombra «sobregiro»). */
  const linea = V2_A5.slice(V2_A5.indexOf("## A5-b")).split("\n").find((l) => l.startsWith("- Se pone en pantalla"));
  const glosa = [...linea.matchAll(new RegExp(CITA, "g"))].at(-1)[1];
  const p4 = pantalla("lo-que-la-empresa-no-sabe");
  assert.equal(p4.glosaDeParrafo.texto, glosa);
  assert.match(p4.parrafos[p4.glosaDeParrafo.parrafo], /^Hay tres notas débito del banco\./);
  /* El cambio del 15 de octubre: P3 nombra el saldo conciliado. */
  assert.match(V1, /\*\*15 de octubre \(Yujiro, opcional\):\*\* en P3/);
  assert.ok(pantalla("el-saldo-del-banco").parrafos.includes("Es el saldo conciliado del banco."));
});

test("★★★ la copia de los paquetes de A5 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!archivosEnLaRamaFuente()) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-a5-v1.md", ...DE_A5]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la de la punta de ${RAMA_FUENTE}`);
});

test("★★★ las 10 pantallas, en el orden del paquete; título e id", () => {
  assert.equal(Object.keys(S).length, 10, "el paquete vigente no trae sus diez pantallas P0-P9");
  assert.deepEqual(P.pantallas.map((x) => x.id), IDS);
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a5-san-calixto");
  assert.match(V1, /Id de la orden: `t4-a5-san-calixto`/);
  assert.equal(P.numero, 5);
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    const p = pantalla(id);
    const datos = textosDeDatos(p).filter((t) => !(p.opciones ?? []).some((o) => o.texto === t && !textos.includes(t)));
    assert.deepEqual([...datos].sort(), [...textos].sort());
    assert.equal(pies.length >= 1 ? pies[0] : null, p.pie ?? null, `${id}: pie`);
    for (const x of pies) assert.ok([p.pie, p.acierto?.pie, p.error?.pie].includes(x), `${id}: pie «${x}»`);
  });
}

test("★★★ las opciones de las tres preguntas son las del paquete, con su retroalimentación y una sola correcta", () => {
  for (const id of ["lo-que-el-banco-no-sabe", "lo-que-la-empresa-no-sabe", "que-se-asienta"]) {
    const bloque = PAQUETE.find((x) => x.id === id).bloque;
    const filas = [...bloque.matchAll(new RegExp(`^\\| ${CITA}(?: \\([^)]*\\))? \\| (sí|no) \\| ${CITA}`, "gm"))].map((m) => [m[1], m[2] === "sí", m[3]]);
    assert.equal(filas.length, 3, `${id}: no se leyeron las tres opciones del paquete`);
    const p = pantalla(id);
    assert.deepEqual(p.opciones.map((o) => [o.texto, Boolean(o.correcta), o.correcta ? p.acierto.texto : o.devolucion]), filas);
  }
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos de 10 palabras o más`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  let cotejados = 0;
  for (const { t, r } of medidos) {
    const m = V1.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) { cotejados++; assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`); }
  }
  assert.ok(cotejados >= 25, `solo se cotejaron ${cotejados} medidas`);
});

/* ═══════════ 2 · LAS CIFRAS SE CALCULAN ═══════════ */

test("★★★ las cifras se calculan de las partidas y coinciden con la tabla «Cifras y cadena» del paquete; los dos conciliados y el mayor dan lo mismo", () => {
  assert.equal(Z.TOTAL_CHEQUES, 156_000 + 203_000 + 97_000 + 125_000);
  assert.equal(Z.CONCILIADO_BANCO, Z.EXTRACTO + Z.CONSIGNACION_EN_TRANSITO - Z.TOTAL_CHEQUES);
  assert.equal(Z.CONCILIADO_LIBROS, Z.LIBROS + Z.TOTAL_NOTAS_CREDITO - Z.TOTAL_NOTAS_DEBITO);
  assert.equal(Z.SALDO_MAYOR, Z.SUMA_DEBE_MAYOR - Z.TOTAL_NOTAS_DEBITO);
  /* Los dos saldos conciliados entre sí, y con el saldo final del mayor (Hanayama v1 §6.1). */
  assert.equal(Z.CONCILIADO_BANCO, Z.CONCILIADO_LIBROS, "los dos saldos conciliados no dan lo mismo");
  assert.equal(Z.SALDO_MAYOR, Z.CONCILIADO_LIBROS, "el mayor no termina en el saldo conciliado");
  /* La tabla del paquete. */
  const cifras = Object.fromEntries(tablaDe(V1, "| Cifra | Página | Pantalla | Calculada |").map((f) => [f[0], f]));
  const del = (clave) => { const f = Object.entries(cifras).find(([k]) => k === clave); assert.ok(f, `la tabla no trae «${clave}»`); return f[0].split(" · ").map(n); };
  assert.deepEqual(del("2.435.600 · 4.373.100"), [Z.EXTRACTO, Z.LIBROS]);
  assert.deepEqual(del("1.937.500"), [Z.DIFERENCIA_INICIAL]);
  assert.deepEqual(del("156.000 · 203.000 · 97.000 · 125.000"), Z.CHEQUES_A5.map((c) => c.monto));
  assert.deepEqual(del("581.000"), [Z.TOTAL_CHEQUES]);
  assert.deepEqual(del("2.758.000"), [Z.CONSIGNACION_EN_TRANSITO]);
  assert.deepEqual(del("4.612.600"), [Z.CONCILIADO_BANCO]);
  assert.deepEqual(del("645.000 · 342.000"), Z.NOTAS_CREDITO_A5.map((x) => x.monto));
  assert.deepEqual(del("987.000"), [Z.TOTAL_NOTAS_CREDITO]);
  assert.deepEqual(del("43.500 · 236.000 · 468.000"), Z.NOTAS_DEBITO_A5.map((x) => x.monto));
  assert.deepEqual(del("747.500"), [Z.TOTAL_NOTAS_DEBITO]);
  assert.deepEqual(del("5.360.100"), [Z.SUMA_DEBE_MAYOR]);
  /* Y las cifras con «$» de los textos son exactamente estas. */
  const conocidas = new Set([Z.EXTRACTO, Z.LIBROS, Z.DIFERENCIA_INICIAL, Z.TOTAL_CHEQUES, Z.CONSIGNACION_EN_TRANSITO, Z.CONCILIADO_BANCO, Z.TOTAL_NOTAS_CREDITO, Z.TOTAL_NOTAS_DEBITO, Z.SUMA_DEBE_MAYOR, ...Z.NOTAS_A5.map((x) => x.monto)].map(cifra));
  const enTextos = new Set(P.pantallas.flatMap(textosDeDatos).flatMap((t) => [...t.matchAll(/\$(\d{1,3}(?:\.\d{3})*)/g)].map((m) => m[1])));
  assert.deepEqual([...enTextos].filter((x) => !conocidas.has(x)), [], "un texto trae una cifra que no sale de las partidas");
});

test("★★★ los cuatro cheques son la tabla de P2 del paquete, por beneficiario y valor, sin número de cheque (E3 / D4-5)", () => {
  const filas = tablaDe(PAQUETE.find((x) => x.id === "lo-que-el-banco-no-sabe").bloque, "| Beneficiario | Valor |");
  const total = filas.pop();
  assert.deepEqual(filas.map(([b, v]) => ({ beneficiario: b, monto: n(v) })), Z.CHEQUES_A5);
  assert.deepEqual(total, ["Total", cifra(Z.TOTAL_CHEQUES)]);
  /* Ni en los datos ni en la vista hay un número de cheque. */
  const todo = JSON.stringify(Z.PIEZA_SAN_CALIXTO) + JSON.stringify(Z.CHEQUES_A5) + JSON.stringify(Z.FIGURA_CONCILIA);
  assert.doesNotMatch(todo, /\b14[56]\b|n\.º|número/i);
});

test("★★★ los cinco asientos son la tabla de P7 del paquete (nombres C1-C3), cuadran y van en el orden de la p. 191", () => {
  const filas = tablaDe(PAQUETE.find((x) => x.id === "los-cinco-asientos").bloque, "| Nota | Debe | Haber | Valor |");
  assert.equal(filas.length, 5, "no se leyeron las cinco notas del paquete");
  assert.deepEqual(Z.NOTAS_A5.map((x) => [x.nombre, x.debe, x.haber, cifra(x.monto)]), filas);
  for (const a of Z.ASIENTOS_A5) {
    const s = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((t, l) => t + l.monto, 0);
    assert.equal(s(DEBE), s(HABER), `${a.nombre}: no cuadra`);
  }
  /* Las notas crédito suben Bancos (Bancos al debe); las débito la bajan. */
  for (const x of Z.NOTAS_A5) assert.equal(x.tipo === "credito" ? x.debe : x.haber, "Bancos", x.id);
  assert.match(V1, /todos del 31 de marzo/);
  assert.equal(Z.FECHA_ASIENTOS, "31 de marzo");
});

/* ═══════════ 3 · LO QUE SE VE ═══════════ */

function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(PantallasT4, { pieza: P, rotulo: "EFECTIVO, CAJA MENOR Y BANCOS · APRENDER" })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const visibles = (c) => [...c.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
const boton = (c, nombre) => c.querySelector(`[data-boton="${nombre}"]`);
const pie = (c) => c.querySelector("[data-pie]").textContent;
const figura = (c) => c.querySelector('[data-figura="concilia"]');
const INTERFAZ_MARCADA = new Set([...Object.values(BOTON), ...Object.values(INTERFAZ)]);
const sinEstilo = (html) => html.replace(/ style="[^"]*"/g, "");

function irA(c, id) {
  for (let k = 0; k < 20 && c.querySelector("[data-pieza]").dataset.pantalla !== id; k++) {
    const el = c.querySelector("[data-eleccion]");
    if (el) {
      const p = pantalla(el.dataset.eleccion);
      tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(c, "confirmar"));
      tocar(boton(c, "seguir"));
    } else tocar(boton(c, "empezar") ?? boton(c, "seguir"));
  }
  assert.equal(c.querySelector("[data-pieza]").dataset.pantalla, id, `no se llegó a «${id}»`);
}

test("★★★ cada pantalla de lectura muestra sus textos en orden, su pie y su botón; fuera de la figura, nada que no venga del paquete", () => {
  const m = montar();
  try {
    const lecturas = P.pantallas.filter((p) => p.tipo !== "eleccion");
    assert.equal(lecturas.length, 7);
    for (const p of lecturas) {
      irA(m.caja, p.id);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p), `${p.id}: textos en pantalla`);
      assert.equal(pie(m.caja), p.pie, `${p.id}: pie`);
      assert.deepEqual([...m.caja.querySelectorAll("[data-boton]")].map((b) => b.textContent), p.id === "resumen" ? [] : [p.tipo === "portada" ? "Empezar" : "Seguir"], `${p.id}: botones`);
      const sueltos = [...m.caja.querySelectorAll("[data-pieza] *")]
        .filter((el) => !el.matches("style") && !el.closest("[data-figura]") && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()))
        .map((el) => el.textContent.trim());
      assert.deepEqual(sueltos.filter((t) => !textosDeDatos(p).includes(t) && t !== p.pie && !INTERFAZ_MARCADA.has(t)), [], `${p.id}: texto en pantalla que no viene del paquete`);
    }
  } finally { m.desmontar(); }
});

test("★★★ P4: la glosa de «sobregiro» va justo debajo de la línea de las notas débito, antes de la pregunta", () => {
  const m = montar();
  try {
    irA(m.caja, "lo-que-la-empresa-no-sabe");
    const glosa = m.caja.querySelector("[data-glosa]");
    assert.equal(glosa.textContent, "Un sobregiro es sacar del banco más plata de la que hay en la cuenta.");
    assert.match(glosa.previousElementSibling.textContent, /^Hay tres notas débito del banco\./);
    assert.match(V1, /- Debajo: «Un sobregiro es sacar del banco/);
  } finally { m.desmontar(); }
});

for (const id of ["lo-que-el-banco-no-sabe", "lo-que-la-empresa-no-sabe", "que-se-asienta"]) {
  test(`★★★ ${id}: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación, sin revelar; el acierto, su texto`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        tocar(boton(m.caja, "confirmar"));
        const msg = m.caja.querySelector('[data-mensaje="error"]');
        assert.equal(msg.querySelector("[data-devolucion]").textContent, o.devolucion);
        assert.ok(!msg.textContent.includes(p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")), `${o.id}: el error revela la respuesta`);
        tocar(boton(m.caja, "probar-otra"));
      }
      tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(m.caja.querySelector('[data-mensaje="acierto"] [data-devolucion]').textContent, p.acierto.texto);
    } finally { m.desmontar(); }
  });
}

/* ═══════════ 4 · LA FIGURA: «LA CONCILIACIÓN DE DOS LADOS» ═══════════ */

const monto = (f, id) => n(f.querySelector(`[data-monto="${id}"]`).textContent);
const signos = (f) => Object.fromEntries([...f.querySelectorAll("[data-fila]")].filter((x) => x.querySelector("[data-signo]")).map((x) => [x.dataset.fila, x.querySelector("[data-signo]").dataset.signo]));

test("★★★ la figura va solo donde la pide Hanayama, en su estado; P2, P4 y P6 dependen del acierto", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.figura).map((p) => [p.id, p.figura.estado ?? p.figura.estados]), [
    ["dos-saldos", "p1"],
    ["lo-que-el-banco-no-sabe", { colocando: "p2-colocando", error: "p2-colocando", acierto: "p2-acierto" }],
    ["el-saldo-del-banco", "p3"],
    ["lo-que-la-empresa-no-sabe", { colocando: "p4-colocando", error: "p4-colocando", acierto: "p4-acierto" }],
    ["el-saldo-de-la-empresa", "p5"],
    ["que-se-asienta", { colocando: "p6-colocando", error: "p6-colocando", acierto: "p6-acierto" }],
    ["los-cinco-asientos", "notas"],
    ["el-mayor", "mayor"],
  ]);
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.tipo !== "eleccion")) {
      irA(m.caja, p.id);
      assert.equal(m.caja.querySelectorAll("[data-figura]").length, p.figura ? 1 : 0, `${p.id}: figura`);
      if (p.figura) assert.equal(figura(m.caja).dataset.estado, p.figura.estado);
    }
  } finally { m.desmontar(); }
});

test("★★★ en cada estado, las cifras de la figura cuadran desde el DOM: el detalle suma su fila, saldo ± partidas = conciliado, y el «=» del par se ve SI Y SOLO SI los dos saldos son iguales", () => {
  const m = montar();
  try {
    const vistos = [];
    const revisar = () => {
      const f = figura(m.caja);
      if (!f) return;
      const e = f.dataset.estado;
      if (!e.startsWith("p")) return;
      vistos.push(e);
      const [b, em] = [monto(f, "par-banco"), monto(f, "par-empresa")];
      const igual = f.querySelector("[data-igual]");
      assert.equal(igual.dataset.igual === "visible", b === em, `${e}: el «=» no sigue a los saldos`);
      assert.equal(igual.textContent.trim(), b === em ? "=" : "", `${e}: el «=» oculto tiene texto`);
      /* El lector de pantalla oye el par, y «Son iguales» solo si lo son. */
      assert.equal(f.querySelector("[data-par-lector]").textContent, `El banco: ${cifra(b)}. La empresa: ${cifra(em)}.${b === em ? " Son iguales." : ""}`);
      for (const lado of f.querySelectorAll("[data-lado]")) {
        const L = lado.dataset.lado;
        const [mas, menos] = L === "banco" ? ["consignacion", "cheques"] : ["notas-credito", "notas-debito"];
        for (const k of [mas, menos]) {
          const det = [...lado.querySelectorAll(`[data-fila="${k}"] ~ [data-detalle]`)].filter((d) => {
            let x = d.previousElementSibling; while (x && !x.matches("[data-fila]")) x = x.previousElementSibling; return x?.dataset.fila === k;
          });
          if (det.length) assert.equal(det.reduce((s, d) => s + n(d.querySelector("[data-monto]").textContent), 0), monto(lado, k), `${e}: el detalle de ${k} no suma su fila`);
        }
        const fin = lado.querySelector(`[data-monto="conciliado-${L}"]`);
        if (fin) assert.equal(monto(lado, `inicial-${L}`) + monto(lado, mas) - monto(lado, menos), n(fin.textContent), `${e}: ${L}: saldo ± partidas ≠ conciliado`);
        assert.equal(Boolean(fin), lado.dataset.ver === "todo", `${e}: ${L}: saldo conciliado`);
      }
    };
    /* Pantalla por pantalla, en orden: en cada elección, colocando y después el acierto. */
    for (const [k, p] of P.pantallas.entries()) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      revisar();
      if (p.tipo === "eleccion") {
        tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
        tocar(boton(m.caja, "confirmar"));
        revisar();
      }
      if (k < P.pantallas.length - 1) tocar(boton(m.caja, p.tipo === "portada" ? "empezar" : "seguir"));
    }
    assert.deepEqual(vistos, ["p1", "p2-colocando", "p2-acierto", "p3", "p4-colocando", "p4-acierto", "p5", "p6-colocando", "p6-acierto"]);
  } finally { m.desmontar(); }
});

test("★★★ cada estado pinta lo que dice Hanayama: un lado por pantalla, el saldo conciliado solo donde va, los dos compactos en P6", () => {
  const S = Z.ESTADOS_CONCILIA;
  const ladosDe = (e) => S[e].lados.map((x) => `${x.lado}:${x.ver}`);
  assert.deepEqual(ladosDe("p1"), []);
  assert.deepEqual([ladosDe("p2-colocando"), ladosDe("p2-acierto"), ladosDe("p3")], [["banco:partidas"], ["banco:partidas"], ["banco:todo"]]);
  assert.deepEqual([ladosDe("p4-colocando"), ladosDe("p4-acierto"), ladosDe("p5")], [["empresa:partidas"], ["empresa:partidas"], ["empresa:todo"]]);
  assert.deepEqual([ladosDe("p6-colocando"), ladosDe("p6-acierto")], [["banco:todo", "empresa:todo"], ["banco:todo", "empresa:todo"]]);
  assert.ok(S["p6-colocando"].compacto && S["p6-acierto"].compacto);
  /* El par: arranca en los saldos del libro, el banco se corrige en P3 y la empresa en P5. */
  assert.deepEqual(S.p1.par, [Z.EXTRACTO, Z.LIBROS]);
  assert.deepEqual(S.p3.par, [Z.CONCILIADO_BANCO, Z.LIBROS]);
  assert.deepEqual(S.p5.par, [Z.CONCILIADO_BANCO, Z.CONCILIADO_LIBROS]);
  /* P4 acierto: solo «Menos»; «Más» lo muestra P5. */
  assert.deepEqual(S["p4-acierto"].signos, ["notas-debito"]);
  assert.deepEqual(S.p5.signos.sort(), ["notas-credito", "notas-debito"]);
});

for (const [id, colocando, conSigno, sinTexto] of [
  ["lo-que-el-banco-no-sabe", "p2-colocando", { consignacion: "visible", cheques: "oculto" }, ["Más", "Menos"]],
  ["lo-que-la-empresa-no-sabe", "p4-colocando", { "notas-credito": "oculto", "notas-debito": "visible" }, ["Más", "Menos"]],
]) {
  test(`★★★ PH8-2 · ${id}: mientras pregunta y en cada error, «Más» y «Menos» guardan su sitio SIN su texto; con el acierto aparece solo el que se preguntó`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      const comoColocando = (cuando) => {
        const f = figura(m.caja);
        assert.equal(f.dataset.estado, colocando, cuando);
        for (const s of Object.values(signos(f))) assert.equal(s, "oculto", `${cuando}: un signo se ve`);
        for (const x of f.querySelectorAll('[data-signo="oculto"]')) {
          assert.equal(x.textContent.trim(), "", `${cuando}: el signo oculto trae texto`);
          assert.ok(x.classList.contains("t4cn-oculto"));
        }
        /* textContent y outerHTML: ni escondido por CSS está la respuesta. */
        for (const t of sinTexto) assert.ok(!`${f.textContent}\n${f.outerHTML}`.includes(t), `${cuando}: la figura ya trae «${t}»`);
        return sinEstilo(f.outerHTML);
      };
      const enColocando = comoColocando("colocando");
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        tocar(boton(m.caja, "confirmar"));
        assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
        tocar(boton(m.caja, "probar-otra"));
      }
      tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(signos(figura(m.caja)), conSigno, "acierto: signos");
    } finally { m.desmontar(); }
  });
}

test("★★★ PH8-2 · P6: mientras pregunta y en cada error, las dos marcas guardan su sitio SIN su texto; con el acierto, «no se asienta» bajo el banco y «se asientan las cinco notas» bajo la empresa", () => {
  const p = pantalla("que-se-asienta");
  const F = Z.FIGURA_CONCILIA;
  const m = montar();
  try {
    irA(m.caja, "que-se-asienta");
    const comoColocando = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "p6-colocando", cuando);
      assert.equal(f.querySelectorAll("[data-marca-oculta]").length, 2, `${cuando}: las marcas no guardan su sitio`);
      for (const x of f.querySelectorAll("[data-marca-oculta]")) assert.equal(x.textContent.trim(), "");
      for (const t of [F.banco.marca, F.empresa.marca, "asienta"]) assert.ok(!`${f.textContent}\n${f.outerHTML}`.includes(t), `${cuando}: la figura ya trae «${t}»`);
      /* Compactos: sin el detalle de cada partida (ya se vio en P2-P5). */
      assert.equal(f.querySelectorAll("[data-detalle]").length, 0);
      return sinEstilo(f.outerHTML);
    };
    const enColocando = comoColocando("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="no"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll("[data-marca]")].map((x) => [x.dataset.marca, x.textContent]), [["banco", F.banco.marca], ["empresa", F.empresa.marca]]);
  } finally { m.desmontar(); }
});

test("★★★ v1.2: los rótulos del detalle (P4, P5) y de las cinco tarjetas (P7) son los de la tabla de P7 del paquete, letra por letra, en renglones fijos", () => {
  const filas = tablaDe(PAQUETE.find((x) => x.id === "los-cinco-asientos").bloque, "| Nota | Debe | Haber | Valor |");
  const nombres = filas.map((f) => f[0]);
  for (const x of Z.NOTAS_A5) {
    assert.ok(nombres.includes(x.detalle.join(" ")), `detalle de ${x.id}: «${x.detalle.join(" ")}» no es de la tabla`);
    assert.ok(nombres.includes(x.tarjeta.join(" ")), `tarjeta de ${x.id}: «${x.tarjeta.join(" ")}» no es de la tabla`);
  }
  /* FA5-1: ni «Sobregiro» a secas ni «Intereses» a secas. */
  for (const x of Z.NOTAS_A5) assert.notDeepEqual(x.detalle, ["Sobregiro"]);
  const m = montar();
  try {
    irA(m.caja, "el-saldo-de-la-empresa");
    const det = [...figura(m.caja).querySelectorAll("[data-detalle]")].map((d) => [...d.querySelectorAll(".t4cn-dn > span")].map((s) => s.textContent).join(" "));
    assert.deepEqual(det, nombres);
    irA(m.caja, "los-cinco-asientos");
    const tarjetas = [...figura(m.caja).querySelectorAll("[data-nombre-nota]")].map((d) => [...d.children].map((s) => s.textContent).join(" "));
    assert.deepEqual(tarjetas, nombres);
  } finally { m.desmontar(); }
});

test("★★★ P2: el detalle de «Cheques sin cobrar» son los cuatro beneficiarios de la tabla del paquete, con su valor, y suma 581.000", () => {
  const m = montar();
  try {
    irA(m.caja, "lo-que-el-banco-no-sabe");
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll('[data-lado="banco"] [data-detalle]')].map((d) => [d.dataset.detalle, n(d.querySelector("[data-monto]").textContent)]), Z.CHEQUES_A5.map((c) => [c.beneficiario, c.monto]));
    assert.equal(monto(f, "cheques"), Z.TOTAL_CHEQUES);
    assert.equal(monto(f, "consignacion"), Z.CONSIGNACION_EN_TRANSITO);
    assert.equal(f.querySelector('[data-monto="conciliado-banco"]'), null, "P2 ya trae el saldo conciliado");
  } finally { m.desmontar(); }
});

test("★★★ P7: las cinco notas como tarjetas de asiento (DEBE teal, HABER ámbar), en el orden de la p. 191; la tabla para el lector trae las cuatro columnas del paquete", () => {
  const m = montar();
  try {
    irA(m.caja, "los-cinco-asientos");
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll("[data-nota]")].map((x) => x.dataset.nota), Z.NOTAS_A5.map((x) => x.id));
    for (const x of Z.NOTAS_A5) {
      const t = f.querySelector(`[data-nota="${x.id}"]`);
      assert.equal(t.querySelector(`[data-lado-nota="${DEBE}"] [data-cuenta-nota]`).dataset.cuentaNota, x.debe);
      assert.equal(t.querySelector(`[data-lado-nota="${HABER}"] [data-cuenta-nota]`).dataset.cuentaNota, x.haber);
      assert.ok(t.querySelector(`[data-lado-nota="${DEBE}"] .t4p-d`) && t.querySelector(`[data-lado-nota="${HABER}"] .t4p-hb`));
      assert.equal(n(t.querySelector("[data-monto]").textContent), x.monto);
      /* Una cuenta con raya se parte en la raya. */
      for (const c of t.querySelectorAll("[data-cuenta-nota]")) if (c.dataset.cuentaNota.includes(" – ")) assert.equal([...c.children][1].textContent.slice(0, 2), "– ");
    }
    const tabla = f.querySelector("[data-tabla-notas]");
    assert.deepEqual([...tabla.querySelectorAll("thead th")].map((x) => x.textContent), ["Nota", "Debe", "Haber", "Valor"]);
    assert.deepEqual([...tabla.querySelectorAll("tbody tr")].map((tr) => [...tr.children].map((x) => x.textContent)), tablaDe(PAQUETE.find((x) => x.id === "los-cinco-asientos").bloque, "| Nota | Debe | Haber | Valor |"));
  } finally { m.desmontar(); }
});

test("★★★ P8: el mayor de Bancos trae las cifras del mayor del paquete, fila por fila, con «Saldo conciliado» al pie del debe", () => {
  const filas = tablaDe(PAQUETE.find((x) => x.id === "el-mayor").bloque, "| Debe | | Haber | |");
  const debe = filas.map((f) => f[1]).filter(Boolean).map(n);
  const haber = filas.map((f) => f[3]).filter(Boolean).map(n);
  const m = montar();
  try {
    irA(m.caja, "el-mayor");
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll(`[data-mayor="${DEBE}"] [data-monto]`)].map((x) => n(x.textContent)), debe);
    assert.deepEqual([...f.querySelectorAll(`[data-mayor="${HABER}"] [data-monto]`)].map((x) => n(x.textContent)), haber);
    assert.deepEqual([...f.querySelectorAll(`[data-mayor="${DEBE}"] .t4my-r`)].map((x) => x.textContent).filter((t) => t.trim()), ["Saldo", "Suma", "Saldo conciliado"]);
    assert.equal(f.querySelector(".t4my-n").textContent, "Bancos · 31 de marzo");
    /* Debe y haber, a la misma altura: la misma fila de la rejilla tiene rótulo en los dos lados o en ninguno. */
    for (let k = 0; k < 6; k++) {
      const c = [...f.querySelectorAll(`[data-fila-mayor="${k}"]`)];
      if (c.length === 2) assert.equal(Boolean(c[0].querySelector(".t4my-r")), Boolean(c[1].querySelector(".t4my-r")), `fila ${k}`);
    }
    assert.equal(f.querySelectorAll("[data-tabla-mayor] tbody tr").length, 5);
  } finally { m.desmontar(); }
});

test("★★★ la figura: «Más» y «Menos» sin teal, ámbar ni coral; teal y ámbar solo en DEBE y HABER de P7 y P8; renglones sin partirse; columna del signo de 44 px; nada se mueve con movimiento reducido", () => {
  assert.doesNotMatch(CSS_T4C, /#2A9D8F|#E9C46A|#E76F51|rgb\(231|dashed|dotted|border-radius: 50%/i);
  assert.match(CSS_T4C, /\.t4cn-fila, \.t4cn-det \{[^}]*grid-template-columns: 44px minmax\(0, 1fr\) auto;/);
  for (const sel of ["\\.t4cn-parl > span:first-child", "\\.t4cn-m", "\\.t4cn-cab", "\\.t4cn-signo", "\\.t4cn-con > span, \\.t4cn-dn > span", "\\.t4cn-marca", "\\.t4na-nom > span, \\.t4na-cta > span", "\\.t4my-r"]) {
    assert.match(CSS_T4C, new RegExp(`${sel} \\{[^}]*white-space: nowrap;`), sel);
  }
  assert.match(CSS_T4C, /\.t4cn-oculto \{ visibility: hidden; \}/);
  assert.match(CSS_T4C, /@media \(prefers-reduced-motion: reduce\) \{ \.t4cn, \.t4cn \*, \.t4na, \.t4na \*, \.t4my, \.t4my \* \{ transition: none !important; animation: none !important; \} \}/);
  /* Teal y ámbar entran por las clases de debe y haber de los asientos, y solo en P7 y P8. */
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.figura)) {
      irA(m.caja, p.id);
      const f = figura(m.caja);
      const enColor = f.querySelectorAll(".t4p-d, .t4p-hb").length;
      assert.equal(enColor > 0, ["los-cinco-asientos", "el-mayor"].includes(p.id), `${p.id}: teal o ámbar`);
    }
  } finally { m.desmontar(); }
});

/* ═══════════ 5 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, justo después de A4 (H6 se fundió en H7); ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids.indexOf(Z.A5_ID), ids.indexOf("t4-a4-bancos-y-notas") + 1);
  const a = tema.actividades.find((x) => x.id === Z.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === Z.A5_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"));
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A5_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4A5.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
