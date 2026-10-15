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
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-2-v2.md");
const P = T.PREGUNTAS_R5_2;
const pregunta = (id) => P.find((p) => p.id === id);
const ASIENTOS = P.filter((p) => p.tipo === "asiento");
const HOJA = T.HOJA_DE_CUENTAS;

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDelEstudiante() {
  const t = [T.R5_2.objetivo, T.R5_2.entrada];
  for (const p of P) {
    t.push(p.hecho, p.enunciado, p.acierto);
    if (p.tipo === "asiento") t.push(p.alReves, ...Object.values(p.debeMal), ...Object.values(p.haberMal), ...p.valorMal.map((v) => v.texto), p.valorGenerica);
    else t.push(p.ladoMal, ...p.valorMal.map((v) => v.texto), p.generica);
  }
  for (const c of Object.values(T.CORTES_R5_2)) t.push(...c.parrafos);
  return [...new Set(t)];
}

test("★★★ cada texto del estudiante está entero en el paquete (guarda: 87 textos distintos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 87);
  /* Entero: tras «: », un salto de línea o «Hecho:», y hasta el fin del renglón. */
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fuera = textos.filter((t) => !new RegExp(`(?:: |\\n)${escapar(t)}\\n`).test(PAQUETE));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* Los rótulos del diseño también están en el paquete, entre comillas. */
  const R = T.ROTULOS_R5_2;
  for (const r of [R.revisarAsiento, R.revisarSaldo, R.vacio, R.cerrar, R.eraEste, R.ladoDelSaldo, R.tituloCorte, R.casoEnTresTiempos, R.sinMovimientos, R.sinSaldo, R.saldoDebito, R.saldoCredito, R.cuentaDel.debe, R.cuentaDel.haber, R.enElOtro.debe, R.enElOtro.haber, R.debito, R.credito, R.valor]) {
    assert.ok(PAQUETE.includes(`«${r}»`), r);
  }
  for (const c of Object.values(T.CONCEPTOS)) assert.ok(PAQUETE.includes(`«${c}»`), c);
  for (const c of HOJA) assert.ok(PAQUETE.includes(`\n${c}\n`), c);
});

/* ═══════════ LAS RESPUESTAS, CALCULADAS DESDE repasoCap5ToroNegro.js ═══════════ */

test("★★★ los seis ítems y sus respuestas salen de la tabla de la p. 269, no se copian", () => {
  const celdas = N.COMPANIAS.flatMap((c) => c.celdas);
  const total = celdas.reduce((s, v) => s + v, 0);
  const provision = N.COLUMNAS.reduce((s, col, i) => s + (N.COMPANIAS.reduce((t, c) => t + c.celdas[i], 0) * N.PORCENTAJES[col]) / 100, 0);
  const castigo = (c) => N.CASTIGOS_MARZO.find((x) => x.compania === c).valor;
  assert.equal(total, 38230000);
  assert.equal(provision, 2283400);
  assert.deepEqual(P.map((p) => p.id), ["p1", "p2", "p3", "p4", "p5", "p6"]);
  assert.deepEqual(P.map((p) => p.tipo), ["asiento", "asiento", "asiento", "saldo", "asiento", "asiento"]);
  assert.deepEqual(P.map((p) => J.correctoDe(p).valor), [
    provision, castigo("roja"), castigo("negra"), castigo("roja") + castigo("negra") - provision, N.RECUPERACION_MAYO.valor, N.RECUPERACION_MAYO.valor,
  ]);
  assert.equal(pregunta("p4").correcto.lado, "debito");
  /* Los valores equivocados previstos, también calculados. */
  assert.deepEqual(pregunta("p1").valorMal.map((v) => v.valor), [total]);
  assert.deepEqual(pregunta("p3").valorMal.map((v) => v.valor), [provision - castigo("roja"), castigo("roja") + castigo("negra"), castigo("roja")]);
  assert.deepEqual(pregunta("p4").valorMal.map((v) => v.valor), [provision - castigo("roja"), provision - castigo("negra"), provision + castigo("roja") + castigo("negra"), 0]);
  /* Y ningún valor previsto coincide con la respuesta de su pantalla. */
  for (const p of P) for (const v of p.valorMal) assert.notEqual(v.valor, J.correctoDe(p).valor, `${p.id}: ${v.valor}`);
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

test("★★★ INFLESZ: los 82 textos de 10 palabras o más pasan 65; los rótulos no se miden", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], t);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 82);
  assert.deepEqual(bajos, []);
  /* Los rótulos son marcas cortas: ninguno llega a 10 palabras. */
  const rotulos = [...Object.values(T.ROTULOS_R5_2).flatMap((x) => (typeof x === "string" ? [x] : typeof x === "object" ? Object.values(x) : [])), ...Object.values(T.CONCEPTOS)];
  assert.ok(rotulos.length >= 25);
  for (const r of rotulos) assert.equal(inflesz(r).aplica, false, r);
});

/* ═══════════ LOS FP ═══════════ */

test("★★★ los FP salen de calcularFP: 3 de 6 da 25 (50 × ½ exactos), 6 de 6 da 50, y nunca menos de 25", () => {
  const fp = (bien) => calcularFP({ dificultad: T.R5_2.dificultad, modalidad: T.R5_2.modalidad, aciertos: J.puntuarR5_2(bien) / 100, duracionMs: 200_000 }).fp;
  assert.equal(J.puntuarR5_2(3), 50);
  assert.equal(fp(3), 25);
  assert.equal(fp(6), 50);
  assert.equal(fp(0), 25);
  for (const f of ["src/components/repasoCap5/ToroNegro.jsx", "src/data/repasoCap5ToroNegroJuego.js"]) {
    assert.doesNotMatch(leer(f).replace(/^\s*(\/\*|\*|\/\/).*$/gm, ""), /fpBase\s*\*|\*\s*fpBase/, f);
  }
});

test("4 de 6: calcularFP da lo mismo que el servidor", { todo: "calcularFP da 33 y el servidor 34 (el cliente manda el 67 % redondeado; 50 × 0,67 = 33,5 → 34). Código compartido: reportado a Kamogawa" }, () => {
  const pct = J.puntuarR5_2(4);
  const cliente = calcularFP({ dificultad: "dificil", modalidad: "evaluativa", aciertos: pct / 100, duracionMs: 200_000 }).fp;
  const servidor = Math.round(50 * Math.max(0.5, Math.min(1, Math.round(pct) / 100)));
  assert.equal(cliente, servidor);
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
  assert.equal(new Set(etiquetas).size, 6, "dos ítems se leen igual");
  assert.deepEqual(etiquetas.map((e) => e.split(" · ")[0]), ["31 DIC", "MARZO", "MARZO", "MARZO", "MAYO", "MAYO"]);
});

/* ═══════════ EL SITIO PARA LA ETAPA a0 ═══════════ */

test("★★ la etapa a0 cabe sin reescribir: el recorrido, el total y el final salen de la lista", () => {
  assert.deepEqual(J.PASOS_R5_2.map((x) => x.tipo === "pregunta" ? P[x.i].id : x.tipo === "corte" ? `corte-${x.etapa}` : x.tipo),
    ["entrada", "p1", "corte-dic", "p2", "p3", "p4", "corte-marzo", "p5", "p6", "corte-mayo"]);
  /* Una pregunta más en 31 DIC, antes del ajuste, que da el total calculado. */
  const a0 = { id: "a0", etapa: "dic", tipo: "calculo", hecho: "x", enunciado: "y", correcto: { valor: 2283400 } };
  const p1 = { ...pregunta("p1"), hecho: (resp) => `calculaste ${resp.a0?.valor}`, correcto: { ...pregunta("p1").correcto, valor: (resp) => resp.a0?.valor } };
  const siete = [a0, p1, ...P.slice(1)];
  assert.deepEqual(J.pasosDe(siete).slice(0, 4).map((x) => x.tipo === "pregunta" ? siete[x.i].id : x.tipo), ["entrada", "a0", "p1", "corte"]);
  assert.deepEqual(J.porEtapa({}, siete).map((f) => f.total), [2, 3, 2]);
  const resp = { a0: { valor: 2283400 } };
  assert.equal(J.resolver(p1.hecho, resp), "calculaste 2283400");
  assert.equal(J.evaluarAsiento(p1, { debe: T.GASTO, haber: T.PROVISION, valor: 2283400 }, resp).ok, true);
  assert.equal(J.puntuarR5_2(7, siete.length), 100);
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

test("★★ el campo de valor: solo dígitos, hasta 8, con puntos de miles", () => {
  assert.equal(leerCifra("2.283.400"), 2283400);
  assert.equal(leerCifra("12a3"), 123);
  assert.equal(leerCifra("123456789"), 12345678);
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

test("★★★ la hoja: llena el hueco activo, pasa al HABER, marca «EN EL DEBE», mueve la cuenta y el velo cierra", async () => {
  const { caja, desmontar } = await montar(h(ToroNegro, { preparar: () => ({ hoja: HOJA }) }));
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

  /* P1 bien. Libro sin movimientos. */
  assert.equal(progreso(), "PREGUNTA 1 DE 6");
  assert.equal(nodos(), "actual,pendiente,pendiente");
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
  assert.equal(progreso(), "PREGUNTA 4 DE 6");
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
    ["dic", "acierto", "1 de 1", "2.283.400CRÉDITO"],
    ["marzo", "error,error,error", "0 de 3", "166.600DÉBITO"],
    ["mayo", "error,acierto", "1 de 2", "783.400CRÉDITO"],
  ]);
  assert.ok(caja.textContent.includes("33%"));
  assert.equal(fin.length, 1);
  const [pct, , detalle] = fin[0];
  assert.equal(pct, (2 / 6) * 100);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok]), [["p1", true], ["p2", false], ["p3", false], ["p4", false], ["p5", false], ["p6", true]]);
  assert.equal(detalle[3].respuesta, "0 | sin lado");
  desmontar();
});
