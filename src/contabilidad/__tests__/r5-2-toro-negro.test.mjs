import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-2 «El Toro Negro» (Célula E) — lo que pide el encargo y el paquete
 * e5-r5-2-v2:
 *
 *   · cada texto, letra por letra, en el paquete
 *   · los seis ítems con sus respuestas calculadas desde repasoCap5ToroNegro.js
 *   · cada retroalimentación alcanzable con la hoja y la regla de prioridad,
 *     una prueba por camino, y el barrido de las 20 parejas de cuentas
 *   · el 0 en la pantalla de saldo
 *   · DEBE/HABER y DÉBITO/CRÉDITO siempre en palabras junto al color
 *   · INFLESZ con el número exacto de textos medidos (los rótulos no)
 *   · las barras del medidor que Itagaki calculó para 375 y 320; el resto de
 *     los 320 px lo mide en Chromium scripts/e5/medir-r5-2.mjs
 *   · las dos puertas y la migración 0251
 *   · el sitio para la etapa a0: el recorrido sale de la lista de preguntas
 *   · la partida se juega: la hoja, la regla del libro, los cortes, el final
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/* prefers-reduced-motion: los cortes se ven en su estado final, con el fantasma. */
w.matchMedia = (q) => ({ matches: /reduced-motion/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, InputEvent: w.InputEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const N = await import("../../data/repasoCap5ToroNegro.js");
const T = await import("../../data/repasoCap5ToroNegroTextos.js");
const J = await import("../../data/repasoCap5ToroNegroJuego.js");
const { ToroNegro, LibroProvision, cifra, leerCifra } = await import("../../components/repasoCap5/ToroNegro.jsx");
const { JUEGOS_REPASO_CAP5 } = await import("../../components/RepasoCapitulo5View.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { inflesz, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { calcularFP } = await import("../../fp/motor.js");
const { barajadorDe } = await import("../../utils/barajar.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
/* El paquete v2 y su delta (a0): los dos son la fuente de verdad. */
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-2-v2.md") + "\n" + leer("orquestador/conocimiento/paquetes/e5-r5-2-a0.md");
const DELTA = leer("orquestador/conocimiento/paquetes/e5-r5-2-a0.md");
const P = T.PREGUNTAS_R5_2;
const pregunta = (id) => P.find((p) => p.id === id);
const ASIENTOS = P.filter((p) => p.tipo === "asiento");
const HOJA = T.HOJA_DE_CUENTAS;
const pesosConSigno = (n) => `$${cifra(n)}`;

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDelEstudiante() {
  const t = [T.R5_2.objetivo, T.R5_2.entrada];
  for (const p of P) {
    t.push(p.hecho, p.enunciado, p.acierto);
    if (p.tipo === "asiento") t.push(p.alReves, ...Object.values(p.debeMal), ...Object.values(p.haberMal), ...p.valorMal.map((v) => v.texto), p.valorGenerica);
    else if (p.tipo === "saldo") t.push(p.ladoMal, ...p.valorMal.map((v) => v.texto), p.generica);
    else t.push(...p.valorMal.map((v) => v.texto), p.coma, p.compensado, p.generica);
  }
  for (const c of Object.values(T.CORTES_R5_2)) t.push(...c.parrafos);
  return [...new Set(t)];
}

test("★★★ cada texto del estudiante está entero en el paquete o en su delta (guarda: 96 textos distintos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 96);
  /*
   * Entero: tras «: » o un salto de línea y hasta el fin del renglón; o, si
   * lo fija una decisión de Kamogawa, entre «» (con los saltos de línea del
   * párrafo vueltos espacios).
   */
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const plano = PAQUETE.replace(/\s+/g, " ");
  const entero = (t) => new RegExp(`(?:: |\\n)${escapar(t)}\\n`).test(PAQUETE) || plano.includes(`«${t}»`);
  const fuera = textos.filter((t) => !entero(t));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* El objetivo es el del delta, no el de v2. */
  assert.ok(new RegExp(`Objetivo de r5-2 \\(cambia\\):\\n${escapar(T.R5_2.objetivo)}\\n`).test(DELTA), "el objetivo no es el del delta");
  /* Lo que el delta quitó no vuelve: ni «análisis» ni la de 2.759.400. */
  assert.ok(!textos.some((t) => /análisis/.test(t)), "queda un «análisis» en r5-2");
  assert.ok(!textos.includes("A ese grupo le pusiste 10 %. Aún va al 3 %. El 10 % empieza en 61 días."));
  /* Los rótulos del diseño también están en el paquete, entre comillas. */
  const R = T.ROTULOS_R5_2;
  for (const r of [R.revisarAsiento, R.revisarSaldo, R.vacio, R.cerrar, R.eraEste, R.ladoDelSaldo, R.tituloCorte, R.casoEnTresTiempos, R.sinMovimientos, R.sinSaldo, R.saldoDebito, R.saldoCredito, R.cuentaDel.debe, R.cuentaDel.haber, R.enElOtro.debe, R.enElOtro.haber, R.debito, R.credito, R.valor]) {
    assert.ok(PAQUETE.includes(`«${r}»`), r);
  }
  const A = T.ROTULOS_A0;
  for (const r of [A.grupoYSaldo, A.tuProvision, A.marcador, A.revisar, A.correcta, A.era("2.283.400"), A.cifrasEnPesos, "Porcentaje que fija la empresa"]) assert.ok(DELTA.includes(`«${r}»`), r);
  assert.ok(DELTA.includes(A.total), A.total);
  for (const c of Object.values(T.CONCEPTOS)) assert.ok(PAQUETE.includes(`«${c}»`), c);
  for (const c of HOJA) assert.ok(PAQUETE.includes(`\n${c}\n`), c);
  /* Los grupos, con los rótulos de Miyata (decisión 1), y sus cifras, en la tabla del delta. */
  for (const g of T.GRUPOS_A0) assert.ok(DELTA.includes(`\n${g.grupo}\t${pesosConSigno(g.saldo)}\t${g.porcentaje} %\n`), g.grupo);
});

/* ═══════════ LAS RESPUESTAS, CALCULADAS DESDE repasoCap5ToroNegro.js ═══════════ */

test("★★★ los siete ítems y sus respuestas salen de la tabla de la p. 269, no se copian", () => {
  const celdas = N.COMPANIAS.flatMap((c) => c.celdas);
  const total = celdas.reduce((s, v) => s + v, 0);
  const provision = N.COLUMNAS.reduce((s, col, i) => s + (N.COMPANIAS.reduce((t, c) => t + c.celdas[i], 0) * N.PORCENTAJES[col]) / 100, 0);
  const castigo = (c) => N.CASTIGOS_MARZO.find((x) => x.compania === c).valor;
  assert.equal(total, 38230000);
  assert.equal(provision, 2283400);
  assert.deepEqual(P.map((p) => p.id), ["a0", "p1", "p2", "p3", "p4", "p5", "p6"]);
  assert.deepEqual(P.map((p) => p.tipo), ["calculo", "asiento", "asiento", "asiento", "saldo", "asiento", "asiento"]);
  assert.deepEqual(P.map((p) => J.correctoDe(p).valor), [
    provision, provision, castigo("roja"), castigo("negra"), castigo("roja") + castigo("negra") - provision, N.RECUPERACION_MAYO.valor, N.RECUPERACION_MAYO.valor,
  ]);
  assert.equal(pregunta("p4").correcto.lado, "debito");
  /* (a0): cada grupo, su saldo por su porcentaje; la lista del delta. */
  const porGrupo = N.COLUMNAS.map((col, i) => (N.COMPANIAS.reduce((t, c) => t + c.celdas[i], 0) * N.PORCENTAJES[col]) / 100);
  assert.deepEqual(T.GRUPOS_A0.map((g) => g.provision), porGrupo);
  assert.ok(DELTA.includes(`(${porGrupo.map((v) => cifra(v)).join(" · ")})`), "la lista del delta");
  assert.deepEqual(pregunta("a0").valorMal.map((v) => v.valor), [
    provision + (T.GRUPOS_A0[0].saldo * 3) / 100, provision - porGrupo[2], total,
  ]);
  assert.deepEqual(pregunta("a0").valoresComa, [provision * 10, provision / 10, provision * 100]);
  assert.deepEqual(pregunta("a0").valoresComa, [22834000, 228340, 228340000]);
  /* Los valores equivocados previstos, también calculados. */
  assert.deepEqual(pregunta("p1").valorMal.map((v) => v.valor), [total]);
  assert.deepEqual(pregunta("p3").valorMal.map((v) => v.valor), [provision - castigo("roja"), castigo("roja") + castigo("negra"), castigo("roja")]);
  assert.deepEqual(pregunta("p4").valorMal.map((v) => v.valor), [provision - castigo("roja"), provision - castigo("negra"), provision + castigo("roja") + castigo("negra"), 0]);
  /* Y ningún valor previsto coincide con la respuesta de su pantalla. */
  for (const p of P) for (const v of [...p.valorMal, ...(p.valoresComa ?? []).map((x) => ({ valor: x }))]) assert.notEqual(v.valor, J.correctoDe(p).valor, `${p.id}: ${v.valor}`);
  /* Las cuentas correctas. */
  assert.deepEqual(ASIENTOS.map((p) => [p.correcto.debe, p.correcto.haber]), [
    [T.GASTO, T.PROVISION], [T.PROVISION, T.CLIENTES], [T.PROVISION, T.CLIENTES], [T.CLIENTES, T.PROVISION], [T.CAJA, T.CLIENTES],
  ]);
});

/* ═══════════ LA REGLA DE PRIORIDAD, UNA PRUEBA POR CAMINO ═══════════ */

const otraCuenta = (p, ...fuera) => HOJA.find((c) => ![p.correcto.debe, p.correcto.haber, ...fuera].includes(c));

test("★★★ camino 1 · al revés: el texto «al revés», en las cinco pantallas, aunque el valor esté mal", () => {
  for (const p of ASIENTOS) {
    const r = J.evaluarAsiento(p, { debe: p.correcto.haber, haber: p.correcto.debe, valor: 1 });
    assert.equal(r.camino, "al-reves");
    assert.deepEqual(r.textos, [p.alReves]);
    assert.equal(r.ok, false);
  }
});

test("★★★ camino 2 · fallan el debe y el haber sin estar al revés: los dos textos, primero el del debe", () => {
  for (const p of ASIENTOS) {
    const debe = otraCuenta(p);
    const haber = otraCuenta(p, debe);
    const r = J.evaluarAsiento(p, { debe, haber, valor: J.correctoDe(p).valor });
    assert.equal(r.camino, "los-dos");
    assert.deepEqual(r.textos, [p.debeMal[debe], p.haberMal[haber]]);
  }
});

test("★★★ camino 3 · solo el debe: su texto", () => {
  for (const p of ASIENTOS) {
    const debe = otraCuenta(p);
    const r = J.evaluarAsiento(p, { debe, haber: p.correcto.haber, valor: 999 });
    assert.equal(r.camino, "debe");
    assert.deepEqual(r.textos, [p.debeMal[debe]]);
  }
});

test("★★★ camino 4 · solo el haber: su texto", () => {
  for (const p of ASIENTOS) {
    const haber = otraCuenta(p);
    const r = J.evaluarAsiento(p, { debe: p.correcto.debe, haber, valor: 999 });
    assert.equal(r.camino, "haber");
    assert.deepEqual(r.textos, [p.haberMal[haber]]);
  }
});

test("★★★ camino 5 · cuentas bien y valor previsto: el texto de ese valor", () => {
  let n = 0;
  for (const p of ASIENTOS) {
    for (const v of p.valorMal) {
      n++;
      const r = J.evaluarAsiento(p, { debe: p.correcto.debe, haber: p.correcto.haber, valor: v.valor });
      assert.equal(r.camino, "valor-previsto");
      assert.deepEqual(r.textos, [v.texto]);
      assert.deepEqual(r.piezas, { debe: true, haber: true, valor: false });
    }
  }
  assert.equal(n, 10);
});

test("★★★ camino 6 · cuentas bien y valor no previsto: la genérica de valor", () => {
  for (const p of ASIENTOS) {
    const r = J.evaluarAsiento(p, { debe: p.correcto.debe, haber: p.correcto.haber, valor: 123 });
    assert.equal(r.camino, "valor-generica");
    assert.deepEqual(r.textos, [p.valorGenerica]);
  }
});

test("★★★ camino 7 · acierto: las tres piezas bien", () => {
  for (const p of ASIENTOS) {
    const r = J.evaluarAsiento(p, { ...p.correcto, valor: J.correctoDe(p).valor });
    assert.equal(r.camino, "acierto");
    assert.deepEqual(r.textos, [p.acierto]);
    assert.equal(r.ok, true);
  }
});

test("★★★ barrido: las 20 parejas de la hoja en cada asiento dan texto, y todo texto se alcanza (guarda: 100 parejas)", () => {
  let parejas = 0;
  for (const p of ASIENTOS) {
    const alcanzados = new Set();
    for (const debe of HOJA) for (const haber of HOJA) {
      if (debe === haber) continue; /* la hoja no deja la misma cuenta en los dos renglones */
      parejas++;
      for (const valor of [J.correctoDe(p).valor, 123, ...p.valorMal.map((v) => v.valor)]) {
        const r = J.evaluarAsiento(p, { debe, haber, valor });
        assert.ok(r.textos.length >= 1 && r.textos.every((t) => typeof t === "string" && t.length > 0), `${p.id}: ${debe} / ${haber} / ${valor} sin texto`);
        r.textos.forEach((t) => alcanzados.add(t));
      }
    }
    const todos = [p.alReves, ...Object.values(p.debeMal), ...Object.values(p.haberMal), ...p.valorMal.map((v) => v.texto), p.valorGenerica, p.acierto];
    assert.deepEqual(todos.filter((t) => !alcanzados.has(t)), [], `${p.id}: textos que ningún camino alcanza`);
    /* Cuatro textos por renglón: uno por cada cuenta que no es la suya. */
    assert.deepEqual(Object.keys(p.debeMal).sort(), HOJA.filter((c) => c !== p.correcto.debe).sort());
    assert.deepEqual(Object.keys(p.haberMal).sort(), HOJA.filter((c) => c !== p.correcto.haber).sort());
  }
  assert.equal(parejas, 100);
});

test("★★ el botón «Revisar asiento» pide los dos renglones y un valor mayor que 0", () => {
  assert.equal(J.puedeRevisarAsiento({ debe: T.GASTO, haber: T.PROVISION, valor: 1 }), true);
  assert.equal(J.puedeRevisarAsiento({ debe: T.GASTO, haber: T.PROVISION, valor: 0 }), false);
  assert.equal(J.puedeRevisarAsiento({ debe: T.GASTO, haber: null, valor: 5 }), false);
  assert.equal(J.puedeRevisarAsiento({ debe: null, haber: T.PROVISION, valor: 5 }), false);
});

/* ═══════════ LA PANTALLA DE SALDO ═══════════ */

const P4 = pregunta("p4");

test("★★★ saldo · primero 166.600 con el lado crédito, después los previstos, después la genérica", () => {
  const ev = (valor, lado) => J.evaluarSaldo(P4, { valor, lado });
  assert.deepEqual(ev(166600, "credito").textos, [P4.ladoMal]);
  assert.equal(ev(166600, "credito").camino, "lado");
  assert.deepEqual(ev(166600, "credito").piezas, { valor: true, lado: false });
  for (const v of P4.valorMal) for (const lado of ["debito", "credito"]) assert.deepEqual(ev(v.valor, lado).textos, [v.texto], `${v.valor} ${lado}`);
  assert.deepEqual(ev(5, "debito").textos, [P4.generica]);
  assert.deepEqual(ev(166600, "debito"), { ok: true, piezas: { valor: true, lado: true }, camino: "acierto", textos: [P4.acierto] });
});

test("★★★ saldo · el 0: se puede responder sin lado, el botón se activa y sale su texto", () => {
  assert.equal(J.puedeRevisarSaldo({ valor: 0, lado: null }), true);
  assert.equal(J.puedeRevisarSaldo({ valor: 166600, lado: null }), false);
  assert.equal(J.puedeRevisarSaldo({ valor: null, lado: "debito" }), false);
  assert.equal(J.puedeRevisarSaldo({ valor: 166600, lado: "debito" }), true);
  const r = J.evaluarSaldo(P4, { valor: 0, lado: null });
  assert.equal(r.ok, false);
  assert.deepEqual(r.piezas, { valor: false, lado: false });
  assert.deepEqual(r.textos, ["La provisión no se queda en cero. Se castigó todo lo perdido, aunque pase de lo que había."]);
});

/* ═══════════ EL LIBRO Y SUS PALABRAS ═══════════ */

/*
 * Cada montaje se apunta aquí y se desmonta al terminar su prueba, pase o
 * falle (afterEach): una prueba que falla con la hoja abierta no puede dejar
 * su velo y su escucha de teclado encima de la siguiente.
 */
const montados = new Set();
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  const desmontar = () => {
    if (!montados.has(desmontar)) return;
    montados.delete(desmontar);
    act(() => raiz.unmount());
    caja.remove();
  };
  montados.add(desmontar);
  return { caja, desmontar };
};
afterEach(() => { for (const d of [...montados]) d(); });
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, texto) => {
  const fijar = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { fijar.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const esperar = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });

test("★★★ la regla del libro: cada pregunta ve el libro de antes de su etapa; los cortes, el de después", () => {
  assert.deepEqual(J.libroAntesDe("dic"), []);
  assert.equal(J.saldoDe(J.libroAntesDe("marzo")), 2283400);
  assert.equal(J.saldoDe(J.libroAntesDe("mayo")), -166600);
  assert.equal(J.saldoDe(J.libroTras("mayo")), 783400);
  /* R de §4: 1, 1, 2 y 2. */
  assert.deepEqual(["dic", "marzo", "mayo"].map((e) => J.renglonesDe(J.libroAntesDe(e))), [1, 1, 2]);
  assert.equal(J.renglonesDe(J.libroTras("mayo")), 2);
  /* El pago de mayo no toca la provisión: no entra. */
  assert.ok(!Object.values(J.MOVIMIENTOS).flat().some((m) => m.concepto.includes("pag")));
});

test("★★★ DEBE/HABER y DÉBITO/CRÉDITO van siempre en palabras junto a su color", async () => {
  const casos = [
    [J.libroAntesDe("dic"), "cero", null],
    [J.libroTras("dic"), "credito", "SALDO CRÉDITO"],
    [J.libroTras("marzo"), "debito", "SALDO DÉBITO"],
    [J.libroTras("mayo"), "credito", "SALDO CRÉDITO"],
  ];
  for (const [movs, lado, palabra] of casos) {
    const { caja, desmontar } = await montar(h(LibroProvision, { movimientos: movs }));
    assert.deepEqual([...caja.querySelectorAll("[data-cabecera-columna]")].map((c) => c.textContent), ["DEBE", "HABER"]);
    const medidor = caja.querySelector("[data-medidor]");
    assert.ok(medidor.textContent.includes("DÉBITO") && medidor.textContent.includes("CRÉDITO"), "el medidor sin sus palabras");
    if (palabra) {
      const s = caja.querySelector(`[data-saldo="${lado}"]`);
      assert.ok(s.textContent.startsWith(palabra), `${lado}: «${s.textContent}»`);
      assert.ok(caja.querySelector(`[data-barra="${lado}"]`), "falta la barra");
    } else {
      assert.equal(caja.querySelector("[data-saldo='cero']").textContent, "0SIN SALDO");
      assert.equal(Boolean(caja.querySelector("[data-barra]")), false);
      assert.equal(caja.querySelector("[data-sin-movimientos]").textContent, "Sin movimientos");
    }
    desmontar();
  }
});

test("★★ las barras del medidor son las que Itagaki calculó para 375 y 320 (escala: 2.283.400 = medio ancho)", () => {
  const MEDIO = { 375: 155.5, 320: 128 };
  const esperadas = { 1333400: [90.8, 74.7], 166600: [11.3, 9.3], 783400: [53.4, 43.9], 2283400: [155.5, 128] };
  /*
   * Con ±0,1 px: el paquete escribe 53,4 para 783.400 a 375 y la cuenta da
   * 155,5 × 783.400 / 2.283.400 = 53,35 (medio píxel de redondeo; reportado).
   */
  let barras = 0;
  for (const [saldo, [a375, a320]] of Object.entries(esperadas)) {
    barras++;
    assert.ok(Math.abs(MEDIO[375] * J.fraccionDeBarra(Number(saldo)) - a375) <= 0.1, `${saldo} a 375`);
    assert.ok(Math.abs(MEDIO[320] * J.fraccionDeBarra(Number(saldo)) - a320) <= 0.1, `${saldo} a 320`);
  }
  assert.equal(barras, 4);
  /* Las miniaturas del final: medio de 163 y de 108, con un mínimo de 4 px. */
  const mini = (s, ancho) => Math.max(4, Math.round((ancho / 2) * J.fraccionDeBarra(s) * 10) / 10);
  assert.deepEqual([2283400, 166600, 783400].map((s) => [mini(s, 163), mini(s, 108)]), [[81.5, 54], [5.9, 4], [28, 18.5]]);
});

/* ═══════════ INFLESZ ═══════════ */

test("★★★ INFLESZ: los 89 textos de 10 palabras o más pasan 65; los rótulos no se miden", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], t);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 89);
  assert.deepEqual(bajos, []);
  /* Los rótulos son marcas cortas: ninguno llega a 10 palabras. */
  const rotulosDe = (o) => Object.values(o).flatMap((x) => (typeof x === "string" ? [x] : typeof x === "object" ? Object.values(x) : typeof x === "function" ? [x(25)] : []));
  const rotulos = [...rotulosDe(T.ROTULOS_R5_2), ...rotulosDe(T.ROTULOS_A0), ...Object.values(T.CONCEPTOS), ...T.GRUPOS_A0.map((g) => g.grupo)];
  assert.ok(rotulos.length >= 25);
  for (const r of rotulos) assert.equal(inflesz(r).aplica, false, r);
});

/* ═══════════ LOS FP ═══════════ */

test("★★★ los FP de 0 a 7 aciertos salen de calcularFP y son los que paga el servidor (0017, round sobre numeric)", () => {
  const fp = (bien) => calcularFP({ dificultad: T.R5_2.dificultad, modalidad: T.R5_2.modalidad, aciertos: J.puntuarR5_2(bien) / 100, duracionMs: 200_000 }).fp;
  /*
   * El servidor, en enteros para no arrastrar la coma flotante: el cliente le
   * manda el % redondeado y él hace round(50 × pct / 100) sobre numeric, que
   * lleva la mitad hacia arriba. Piso del 50 %.
   */
  const servidor = (bien) => {
    const pct = Math.round(J.puntuarR5_2(bien));
    return Math.round((50 * Math.max(50, Math.min(100, pct))) / 100);
  };
  const tabla = [];
  for (let bien = 0; bien <= J.TOTAL_R5_2; bien++) {
    assert.equal(fp(bien), servidor(bien), `${bien} de 7`);
    tabla.push(fp(bien));
  }
  assert.equal(J.TOTAL_R5_2, 7);
  assert.deepEqual(tabla, [25, 25, 25, 25, 29, 36, 43, 50]);
  /* 4 de 7 es una mitad exacta en el servidor: 50 × 57 / 100 = 28,5 → 29. */
  assert.equal((50 * Math.round(J.puntuarR5_2(4))) / 100, 28.5);
  for (const f of ["src/components/repasoCap5/ToroNegro.jsx", "src/data/repasoCap5ToroNegroJuego.js"]) {
    assert.doesNotMatch(leer(f).replace(/^\s*(\/\*|\*|\/\/).*$/gm, ""), /fpBase\s*\*|\*\s*fpBase/, f);
  }
});

/* ═══════════ LAS DOS PUERTAS ═══════════ */

test("★★★ catálogo, registro de la vista, etiqueta y migración 0251 dicen lo mismo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "repaso-capitulo-5");
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1", "r5-2"]);
  const a = actividadesDeTipo(tema, HACER).find((x) => x.id === "r5-2");
  assert.equal(a.nombre, T.R5_2.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const j = JUEGOS_REPASO_CAP5.find((x) => x.id === "r5-2");
  assert.equal(j.titulo, T.R5_2.nombre);
  assert.equal(j.Mecanica, ToroNegro);

  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => leer(`supabase/migrations/${f}`).includes("'r5-2'"));
  assert.deepEqual(migraciones, ["0251_r5_2_el_toro_negro.sql"]);
  const sql = leer("supabase/migrations/0251_r5_2_el_toro_negro.sql");
  assert.match(sql, /\('r5-2', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'dificil', 50, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i);
  assert.match(sql, /select activity_id[\s\S]*where activity_id = 'r5-2';\s*$/);

  assert.ok(hayReglaPara("r5-2"));
  const etiquetas = P.map((p) => etiquetaDeItem("r5-2", p.id));
  assert.equal(new Set(etiquetas).size, 7, "dos ítems se leen igual");
  assert.deepEqual(etiquetas.map((e) => e.split(" · ")[0]), ["31 DIC", "31 DIC", "MARZO", "MARZO", "MARZO", "MAYO", "MAYO"]);
});

/* ═══════════ (a0) CALCULA LA PROVISIÓN ═══════════ */

const A0 = pregunta("a0");
const FILAS_BIEN = Object.fromEntries(T.GRUPOS_A0.map((g) => [g.id, g.provision]));

test("★★★ a0 en el recorrido: dos ítems en 31 DIC antes del corte, siete en total", () => {
  assert.deepEqual(J.PASOS_R5_2.map((x) => x.tipo === "pregunta" ? P[x.i].id : x.tipo === "corte" ? `corte-${x.etapa}` : x.tipo),
    ["entrada", "a0", "p1", "corte-dic", "p2", "p3", "p4", "corte-marzo", "p5", "p6", "corte-mayo"]);
  assert.deepEqual(J.porEtapa({}).map((f) => f.total), [2, 3, 2]);
  assert.equal(A0.sinLibro, true);
});

test("★★★ a0 · acierto: el total bien, con o sin filas", () => {
  for (const filas of [{}, FILAS_BIEN, { "1-30": 249900 }]) {
    const r = J.evaluarCalculo(A0, { filas, total: 2283400 });
    assert.equal(r.ok, true);
    assert.equal(r.camino, "acierto");
    assert.deepEqual(r.textos, [A0.acierto]);
  }
});

test("★★★ a0 · total bien con filas mal: el ítem cuenta, y el texto pide revisar las filas (decisión 6)", () => {
  const r = J.evaluarCalculo(A0, { filas: { ...FILAS_BIEN, "1-30": 259900, "31-60": 194000 }, total: 2283400 });
  assert.equal(r.ok, true);
  assert.equal(r.camino, "compensado");
  assert.deepEqual(r.textos, ["Tu total está bien, pero revisa las filas marcadas: una se compensó con otra."]);
  assert.equal(r.filas["1-30"], "mal");
  assert.equal(r.filas["61-120"], "ok");
});

test("★★★ a0 · los totales previstos: vigentes, la omisión de 31 a 60 y la cartera entera", () => {
  const casos = [[2670400, "Le pusiste porcentaje a las vigentes."], [2079400, "Te faltó el grupo de 31 a 60 días. Revisa que sumaste los siete."], [38230000, "Sumaste los saldos."]];
  for (const [total, empieza] of casos) {
    const r = J.evaluarCalculo(A0, { filas: {}, total });
    assert.equal(r.camino, "valor-previsto", String(total));
    assert.ok(r.textos[0].startsWith(empieza), r.textos[0]);
  }
  /* La de 2.759.400 salió (decisión 3): cae en la genérica. */
  assert.equal(J.evaluarCalculo(A0, { filas: {}, total: 2759400 }).camino, "generica");
});

test("★★★ a0 · la coma: el total por diez, por la décima o por cien, y cualquier fila corrida (decisiones 4 y 5)", () => {
  for (const total of [22834000, 228340, 228340000]) {
    const r = J.evaluarCalculo(A0, { filas: {}, total });
    assert.equal(r.camino, "coma-total", String(total));
    assert.deepEqual(r.textos, [A0.coma]);
  }
  /* Una sola fila corrida, con un total que no es ninguno de los previstos. */
  for (const v of [2499000, 24990]) {
    const r = J.evaluarCalculo(A0, { filas: { ...FILAS_BIEN, "1-30": v }, total: 4532500 });
    assert.equal(r.camino, "coma-fila", String(v));
    assert.deepEqual(r.textos, [A0.coma]);
  }
  /* Las vigentes valen 0: diez veces 0 no es una coma. */
  assert.equal(J.evaluarCalculo(A0, { filas: { vigentes: 0 }, total: 5 }).camino, "generica");
});

test("★★★ a0 · la genérica, y «Revisar cálculo» solo con un total mayor que 0 (las filas son opcionales)", () => {
  const r = J.evaluarCalculo(A0, { filas: { "1-30": 1 }, total: 5 });
  assert.equal(r.camino, "generica");
  assert.deepEqual(r.textos, [A0.generica]);
  assert.equal(J.puedeRevisarCalculo({ total: null }), false);
  assert.equal(J.puedeRevisarCalculo({ total: 0 }), false);
  assert.equal(J.puedeRevisarCalculo({ total: 1 }), true);
  assert.deepEqual(J.evaluarCalculo(A0, { filas: {}, total: 1 }).filas, Object.fromEntries(T.GRUPOS_A0.map((g) => [g.id, "vacia"])));
});

test("★★★ (a) muestra siempre 2.283.400, aunque a0 haya salido mal: el error no se cobra dos veces", () => {
  const p1 = pregunta("p1");
  const malo = { a0: { total: 228340, filas: {} } };
  assert.equal(J.correctoDe(p1, malo).valor, 2283400);
  assert.equal(J.resolver(p1.hecho, malo), "31 de diciembre. La provisión que calculaste es de $2.283.400. No trae saldo de antes.");
  assert.equal(p1.valorGenerica, "Usa la provisión que calculaste: $2.283.400.");
  assert.equal(J.evaluarAsiento(p1, { debe: T.GASTO, haber: T.PROVISION, valor: 2283400 }, malo).ok, true);
});

/* ═══════════ LA HOJA DE CUENTAS ═══════════ */

test("★★ la hoja se baraja una vez por intento y queda fija; con semilla, reproducible", () => {
  const a = J.prepararR5_2(barajadorDe("toro")).hoja;
  const b = J.prepararR5_2(barajadorDe("toro")).hoja;
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort(), [...HOJA].sort());
  const ordenes = new Set(Array.from({ length: 12 }, (_, k) => J.prepararR5_2(barajadorDe(`s${k}`)).hoja.join("|")));
  assert.ok(ordenes.size > 1, "la hoja no se baraja");
});

test("★★ el campo de valor: solo dígitos, hasta 8 (9 en a0), con puntos de miles", () => {
  assert.equal(leerCifra("2.283.400"), 2283400);
  assert.equal(leerCifra("12a3"), 123);
  assert.equal(leerCifra("123456789"), 12345678);
  /* En a0, nueve (decisión 4 del delta): cabe 228.340.000. */
  assert.equal(leerCifra("2283400000", 9), 228340000);
  assert.equal(leerCifra(""), null);
  assert.equal(leerCifra("0"), 0);
  assert.equal(cifra(38230000), "38.230.000");
});

/* ═══════════ LA PARTIDA ═══════════ */

const hueco = (caja, lado) => caja.querySelector(`[data-hueco="${lado}"]`);
const elegir = async (caja, lado, cuenta) => {
  await tocar(hueco(caja, lado));
  assert.ok(caja.querySelector(`[data-hoja="${lado}"]`), "no se abrió la hoja");
  await tocar(caja.querySelector(`[data-hoja] [data-cuenta="${cuenta}"]`));
  await esperar();
};
const campo = (caja) => caja.querySelector("[data-tarjeta-asiento='armador'] input, [data-tarjeta-saldo='respuesta'] input");
const sig = (caja) => caja.querySelector("[data-siguiente]");
/* a0: escribe el total (y las filas que se den), revisa y sigue. */
const jugarA0 = async (caja, total, filas = {}) => {
  for (const [id, v] of Object.entries(filas)) await escribir(caja.querySelector(`[data-fila-grupo="${id}"] input`), String(v));
  await escribir(caja.querySelector("[data-fila-total] input"), String(total));
  await tocar(caja.querySelector("[data-revisar]"));
};

test("★★★ la hoja: llena el hueco activo, pasa al HABER, marca «EN EL DEBE», mueve la cuenta y el velo cierra", async () => {
  const { caja, desmontar } = await montar(h(ToroNegro, { preparar: () => ({ hoja: HOJA }) }));
  await tocar(sig(caja));
  await jugarA0(caja, 2283400);
  await tocar(sig(caja));
  assert.equal(Boolean(caja.querySelector("[data-hoja]")), false);
  assert.equal(hueco(caja, "debe").textContent, "DEBE: Toca para elegir la cuenta");
  await tocar(hueco(caja, "debe"));
  const hoja = caja.querySelector("[data-hoja='debe']");
  assert.equal(hoja.getAttribute("role"), "dialog");
  assert.ok(hoja.textContent.startsWith("CUENTA DEL DEBE"));
  assert.deepEqual([...hoja.querySelectorAll("[data-cuenta]")].map((b) => b.dataset.cuenta), HOJA);
  assert.equal(hueco(caja, "debe").dataset.activo, "true");
  await tocar(hoja.querySelector(`[data-cuenta="${T.GASTO}"]`));
  await esperar();
  assert.equal(Boolean(caja.querySelector("[data-hoja]")), false, "la hoja se reabrió sola");
  assert.equal(hueco(caja, "debe").dataset.lleno, "true");
  assert.equal(hueco(caja, "haber").dataset.activo, "true", "el HABER no quedó activo");
  /* En el HABER, la cuenta del DEBE dice dónde está; si se toca, se mueve. */
  await tocar(hueco(caja, "haber"));
  assert.equal(caja.querySelector(`[data-hoja] [data-cuenta="${T.GASTO}"] [data-en-el-otro]`).textContent, "EN EL DEBE");
  await tocar(caja.querySelector(`[data-hoja] [data-cuenta="${T.GASTO}"]`));
  await esperar();
  assert.equal(hueco(caja, "haber").textContent, `HABER: ${T.GASTO}`);
  assert.equal(hueco(caja, "debe").dataset.lleno, "false");
  /* El velo equivale a «Cerrar». */
  await tocar(hueco(caja, "debe"));
  await tocar(caja.querySelector("[data-hoja-velo]"));
  assert.equal(Boolean(caja.querySelector("[data-hoja]")), false);
  /* «Revisar asiento» pide los dos renglones y un valor mayor que 0. */
  await elegir(caja, "debe", T.PROVISION);
  assert.ok(caja.querySelector("[data-revisar]").disabled);
  await escribir(campo(caja), "0");
  assert.ok(caja.querySelector("[data-revisar]").disabled);
  await escribir(campo(caja), "2283400");
  assert.equal(campo(caja).value, "2.283.400");
  assert.equal(caja.querySelector("[data-revisar]").disabled, false);
  desmontar();
});

test("★★★ se juega entera: regla del libro, ERA ESTE, los dos textos, el 0, los cortes y EL CASO EN TRES TIEMPOS", async () => {
  const fin = [];
  const { caja, desmontar } = await montar(h(ToroNegro, { preparar: () => ({ hoja: HOJA }), onCompletar: (...x) => fin.push(x) }));
  assert.equal(caja.querySelector("[data-objetivo]").textContent, T.R5_2.objetivo);
  assert.equal(caja.querySelector("[data-entrada]").textContent, T.R5_2.entrada);
  await tocar(sig(caja));

  const asiento = async (debe, haber, valor) => {
    await elegir(caja, "debe", debe);
    await elegir(caja, "haber", haber);
    await escribir(campo(caja), String(valor));
    await tocar(caja.querySelector("[data-revisar]"));
  };
  const progreso = () => caja.querySelector("[data-progreso]").textContent;
  const nodos = () => [...caja.querySelectorAll("[data-nodo]")].map((n) => n.dataset.estado).join(",");

  /* a0 mal: una fila con la coma corrida, una bien, cinco vacías. Sin libro. */
  assert.equal(progreso(), "PREGUNTA 1 DE 7");
  assert.equal(nodos(), "actual,pendiente,pendiente");
  assert.equal(Boolean(caja.querySelector("[data-libro]")), false, "a0 no lleva libro");
  const filasA0 = [...caja.querySelectorAll("[data-fila-grupo]")];
  /* v2.1: el porcentaje va junto al saldo, como la cuenta que hay que hacer: «8.330.000 × 3 %». */
  assert.deepEqual(filasA0.map((f) => [f.querySelector("[data-grupo]").textContent, f.querySelector("[data-saldo-grupo]").textContent, f.querySelector("[data-porcentaje]").textContent]),
    T.GRUPOS_A0.map((g) => [g.grupo, `${cifra(g.saldo)} ×\u00a0${g.porcentaje}\u00a0%`, `×\u00a0${g.porcentaje}\u00a0%`]));
  const campos = [...caja.querySelectorAll("[data-tarjeta-calculo] input")];
  assert.equal(campos.length, 8);
  assert.deepEqual(campos.map((c) => c.getAttribute("enterkeyhint")), [...Array(7).fill("next"), "done"]);
  assert.ok(campos.every((c) => c.getAttribute("inputmode") === "numeric" && c.getAttribute("placeholder") === "Provisión"));
  /* «Siguiente» del teclado pasa a la fila de abajo, y de la última al total. */
  campos[0].focus();
  await act(async () => { campos[0].dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  assert.equal(document.activeElement === campos[1], true, "Enter no pasó a la fila siguiente");
  campos[6].focus();
  await act(async () => { campos[6].dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  assert.equal(document.activeElement === campos[7], true, "Enter no pasó de la última fila al total");
  assert.ok(caja.querySelector("[data-revisar]").disabled, "«Revisar cálculo» sin total");
  /* El campo admite nueve dígitos en esta pantalla (decisión 4). */
  await escribir(caja.querySelector("[data-fila-total] input"), "2283400000");
  assert.equal(caja.querySelector("[data-fila-total] input").value, "228.340.000");
  assert.equal(caja.querySelector("[data-revisar]").textContent, "Revisar cálculo");
  await jugarA0(caja, 4532500, { "1-30": 2499000, "31-60": 204000 });
  assert.equal(caja.querySelector("[data-devolucion]").textContent.endsWith(pregunta("a0").coma), true);
  const bajo = (id) => caja.querySelector(`[data-fila-grupo="${id}"] [data-bajo]`);
  assert.deepEqual([bajo("1-30").dataset.bajo, bajo("1-30").textContent], ["mal", "Era 249.900"]);
  assert.deepEqual([bajo("31-60").dataset.bajo, bajo("31-60").textContent], ["ok", "Correcta"]);
  assert.deepEqual([bajo("vigentes").dataset.bajo, bajo("vigentes").textContent], ["vacia", "Era 0"]);
  assert.equal(caja.querySelector('[data-fila-grupo="vigentes"] input').dataset.campoValor, "vacia");
  assert.equal(caja.querySelector('[data-fila-grupo="1-30"] input').dataset.campoValor, "mal");
  assert.equal(caja.querySelector("[data-fila-total] [data-bajo]").textContent, "Era 2.283.400");
  assert.ok(campos.every((c) => c.readOnly), "después de revisar, todo queda bloqueado");
  await tocar(sig(caja));

  /* P1 bien. Libro sin movimientos; el hecho dice 2.283.400 aunque a0 salió mal. */
  assert.equal(progreso(), "PREGUNTA 2 DE 7");
  assert.equal(nodos(), "actual,pendiente,pendiente");
  assert.equal(caja.querySelector("[data-hecho]").textContent, `31 DIC${pregunta("p1").hecho}`);
  assert.ok(caja.querySelector("[data-sin-movimientos]"));
  await asiento(T.GASTO, T.PROVISION, 2283400);
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "acierto");
  assert.equal(Boolean(caja.querySelector("[data-era-este]")), false);
  await tocar(sig(caja));

  /* Corte 31 DIC: SALDO CRÉDITO 2.283.400, sin texto, nodo hecho. */
  assert.ok(caja.querySelector("[data-corte='dic']"));
  assert.equal(nodos(), "hecho,pendiente,pendiente");
  assert.equal(caja.querySelector("[data-saldo='credito']").textContent, "SALDO CRÉDITO2.283.400");
  assert.equal(caja.querySelectorAll("[data-texto-corte]").length, 0);
  await tocar(sig(caja));

  /* P2: las dos cuentas mal → dos párrafos, primero el del debe; ERA ESTE debajo. */
  assert.equal(nodos(), "hecho,actual,pendiente");
  await asiento(T.CAJA, T.INGRESOS, 950000);
  const p2 = pregunta("p2");
  assert.deepEqual([...caja.querySelectorAll("[data-parrafo-devolucion]")].map((x) => x.textContent.replace(/^Incorrecto: /, "")), [p2.debeMal[T.CAJA], p2.haberMal[T.INGRESOS]]);
  assert.equal(hueco(caja, "debe").dataset.estado, "mal");
  /* v2.1: la palabra debajo de cada pieza, no solo el borde (D12). */
  assert.deepEqual([...caja.querySelectorAll("[data-tarjeta-asiento='armador'] [data-veredicto]")].map((v) => [v.dataset.veredicto, v.textContent]),
    [["mal", "No va aquí"], ["mal", "No va aquí"], ["ok", "Correcto"]]);
  assert.equal(caja.querySelectorAll("[data-tarjeta-asiento='era-este'] [data-veredicto]").length, 0, "ERA ESTE no se califica");
  assert.equal(caja.querySelector("[data-tarjeta-asiento='armador'] input").dataset.campoValor, "ok");
  const era = caja.querySelector("[data-tarjeta-asiento='era-este']");
  assert.equal(era.querySelector("[data-era-este]").textContent, "ERA ESTE");
  assert.ok(era.textContent.includes(T.PROVISION) && era.textContent.includes(T.CLIENTES));
  assert.equal(era.querySelector("input").value, "950.000");
  await tocar(sig(caja));

  /* P3: valor «partir el castigo». */
  await asiento(T.PROVISION, T.CLIENTES, 1333400);
  assert.ok(caja.querySelector("[data-devolucion]").textContent.endsWith(pregunta("p3").valorMal[0].texto));
  await tocar(sig(caja));

  /* P4: el libro sigue en 2.283.400 CRÉDITO; nunca muestra el saldo de marzo. Se responde 0, sin lado. */
  assert.equal(progreso(), "PREGUNTA 5 DE 7");
  assert.equal(caja.querySelector("[data-saldo='credito']").textContent, "SALDO CRÉDITO2.283.400");
  assert.ok(!caja.querySelector("[data-libro]").textContent.includes("166.600"));
  const lados = [...caja.querySelectorAll("[data-tarjeta-saldo='respuesta'] [data-lado]")];
  assert.deepEqual(lados.map((b) => [b.textContent, b.getAttribute("aria-pressed")]), [["DÉBITO", "false"], ["CRÉDITO", "false"]]);
  assert.ok(caja.querySelector("[data-revisar]").disabled);
  await escribir(campo(caja), "0");
  assert.equal(caja.querySelector("[data-revisar]").disabled, false, "con 0 no se exige lado");
  await tocar(caja.querySelector("[data-revisar]"));
  assert.ok(caja.querySelector("[data-devolucion]").textContent.endsWith("La provisión no se queda en cero. Se castigó todo lo perdido, aunque pase de lo que había."));
  const eraSaldo = caja.querySelector("[data-tarjeta-saldo='era-este']");
  assert.equal(eraSaldo.querySelector("input").value, "166.600");
  assert.equal(eraSaldo.querySelector("[data-lado='debito']").getAttribute("aria-pressed"), "true");
  /* v2.1: en ERA ESTE el lado correcto va relleno y el otro no: forma, no solo color. */
  assert.notEqual(eraSaldo.querySelector("[data-lado='debito']").style.background, eraSaldo.querySelector("[data-lado='credito']").style.background);
  assert.deepEqual([...caja.querySelectorAll("[data-tarjeta-saldo='respuesta'] [data-veredicto]")].map((v) => v.textContent), ["No es este valor"]);
  await tocar(sig(caja));

  /* Corte MARZO: 166.600 SALDO DÉBITO, el fantasma en 2.283.400 a la derecha, el texto de Miyata. */
  assert.equal(caja.querySelector("[data-saldo='debito']").textContent, "SALDO DÉBITO166.600");
  assert.ok(caja.querySelector("[data-barra='debito']"));
  assert.equal(caja.querySelector("[data-medidor]").dataset.fraccion, (166600 / 2283400).toFixed(4));
  assert.equal(caja.querySelector("[data-texto-corte]").textContent, T.CORTES_R5_2.marzo.parrafos[0]);
  await tocar(sig(caja));

  /* P5 al revés, con el libro de marzo (dos renglones en el debe). */
  assert.equal(caja.querySelectorAll("[data-columna='debe'] [data-movimiento]").length, 2);
  await asiento(T.PROVISION, T.CLIENTES, 950000);
  assert.ok(caja.querySelector("[data-devolucion]").textContent.endsWith(pregunta("p5").alReves));
  await tocar(sig(caja));
  /* P6 bien. */
  await asiento(T.CAJA, T.CLIENTES, 950000);
  await tocar(sig(caja));
  /* Corte MAYO. */
  assert.equal(nodos(), "hecho,hecho,hecho");
  assert.equal(caja.querySelector("[data-saldo='credito']").textContent, "SALDO CRÉDITO783.400");
  assert.equal(caja.querySelector("[data-texto-corte]").textContent, T.CORTES_R5_2.mayo.parrafos[0]);
  await tocar(sig(caja));

  /* El final. */
  assert.ok(caja.querySelector("[data-cierre]"));
  const filas = [...caja.querySelectorAll("[data-fila-etapa]")].map((f) => [
    f.dataset.filaEtapa, [...f.querySelectorAll("[data-punto]")].map((x) => x.dataset.punto).join(","), f.querySelector("[data-n-de-m]").textContent, f.querySelector("[data-rotulo-saldo]").textContent,
  ]);
  assert.deepEqual(filas, [
    ["dic", "error,acierto", "1 de 2", "2.283.400CRÉDITO"],
    ["marzo", "error,error,error", "0 de 3", "166.600DÉBITO"],
    ["mayo", "error,acierto", "1 de 2", "783.400CRÉDITO"],
  ]);
  assert.ok(caja.textContent.includes("29%"));
  /* Los puntos: relleno si acertó, anillo si falló (decisión 9), leído del estilo pintado. */
  const forma = (el) => (el.style.background === "transparent" && /solid/.test(el.style.border) ? "anillo" : el.style.background && !el.style.border ? "relleno" : "otra");
  assert.deepEqual([...caja.querySelectorAll("[data-punto]")].map(forma), ["anillo", "relleno", "anillo", "anillo", "anillo", "anillo", "relleno"]);
  assert.ok([...caja.querySelectorAll("[data-punto]")].every((x) => x.closest("[aria-hidden='true']")));
  assert.equal(fin.length, 1);
  const [pct, , detalle] = fin[0];
  assert.equal(pct, (2 / 7) * 100);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok]), [["a0", false], ["p1", true], ["p2", false], ["p3", false], ["p4", false], ["p5", false], ["p6", true]]);
  assert.equal(detalle[4].respuesta, "0 | sin lado");
  desmontar();
});

test("★★ v2.1: los rótulos nuevos del autodiagnóstico están en el paquete, entre comillas (guarda: 7)", () => {
  const V = T.ROTULOS_R5_2.veredicto;
  const nuevos = [V.cuenta.ok, V.cuenta.mal, V.valor.ok, V.valor.mal, V.lado.ok, V.lado.mal, T.ROTULOS_A0.porcentaje(3)];
  assert.equal(nuevos.length, 7);
  const seccion = PAQUETE.slice(PAQUETE.indexOf("## v2.1 · autodiagnóstico"));
  /* El paquete escribe espacios normales donde la pantalla pone de no separación. */
  for (const r of nuevos) assert.ok(seccion.includes(`«${r.replace(/\u00a0/g, " ")}»`), r);
});

test("★★ v2.1 · B4 de enganche.md: ni el acierto ni «ERA ESTE» van en teal, que en esta pantalla es DEBE", () => {
  const fuente = leer("src/components/repasoCap5/ToroNegro.jsx");
  const estados = fuente.slice(fuente.indexOf("const ESTADO_PIEZA = {"), fuente.indexOf("};", fuente.indexOf("const ESTADO_PIEZA = {")));
  for (const linea of estados.split("\n").filter((l) => /^\s*(ok|revelada):/.test(l))) assert.ok(!/teal|2A9D8F|42,\s*157/i.test(linea), linea.trim());
  assert.ok(!/data-era-este[^>]*C\.teal/.test(fuente), "«ERA ESTE» en teal");
  /* El teal sigue donde significa DEBE o DÉBITO. */
  assert.ok(/l === "debe" \? C\.teal/.test(fuente));
});
