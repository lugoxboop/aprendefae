import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lotes T2-2 a T2-5, #471).
 *
 * Los bancos contra el paquete de Near, letra por letra; cada ítem sin
 * pantalla (la correcta puntúa, cada opción mala da su retro) y las trampas
 * de L; una partida jugada por Hacer —montaje, un intento, puntaje y detalle
 * con ids estables—; y una de «no le cambia nada a nadie»: las siete de
 * hoy con los mismos ids, FP y completados (precedente: monetaria-dos-
 * actividades.test.mjs).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const CuadraPorValor = (await import("../../components/mecanicas/libros/t2/CuadraPorValor.jsx")).default;
const DelDiarioAlMayor = (await import("../../components/mecanicas/libros/t2/DelDiarioAlMayor.jsx")).default;
const LasQueVuelvenACero = (await import("../../components/mecanicas/libros/t2/LasQueVuelvenACero.jsx")).default;
const L = await import("../t2HacerNuevas.js");
const D = await import("../../data/contabilidadT2HacerNuevas.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { ACTIVIDADES, COMPUESTAS_SUELTAS } = await import("../../data/contabilidadActividades.js");
const { nodosDe } = await import("../../hacer/completadas.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");

const { pesos } = await import("../../data/contabilidad.js");
const { RETARDO_IBA_MS } = await import("../../components/mecanicas/libros/tema3/segundaDecision.jsx");

const MARCA = "[ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)";

function montar(Componente, props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const llamadas = [];
  act(() => raiz.render(React.createElement(Componente, {
    Marco: MarcoLibros, rotulo: "R", titulo: "T", onCompletar: (...a) => llamadas.push(a), ...props,
  })));
  let vivo = true;
  const desmontar = () => { if (!vivo) return; vivo = false; act(() => raiz.unmount()); caja.remove(); };
  montados.push(desmontar);
  return { caja, llamadas, desmontar };
}
/* Lo que una prueba fallida dejó montado se desmonta igual: si no, sus relojes dejan el proceso colgado y el archivo entero sale sin informe. */
const montados = [];
afterEach(() => { while (montados.length) montados.pop()(); });
const clic = (el) => { assert.ok(el, "no está el elemento"); act(() => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }))); };
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(texto));
function escribir(input, valor) {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  act(() => { set.call(input, valor); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
}
const siguiente = (caja) => clic(boton(caja, "Siguiente") ?? boton(caja, "Ver mi resumen"));

/* ═══════════════════════ EL PAQUETE DE NEAR, LETRA POR LETRA ═══════════════════════
 *
 * Los bancos se comparan con c-t2-2-near-lote.md §1 en las dos direcciones:
 * cada texto de los datos está en el paquete entre «», y cada cita de las
 * filas del paquete está en los datos. Además, cada retro va con SU valor,
 * cuenta o renglón, en la misma fila de Near.
 */
const PAQUETE = readFileSync("orquestador/conocimiento/paquetes/c-t2-2-near-lote.md", "utf8");
const seccion = (desde, hasta) => PAQUETE.slice(PAQUETE.indexOf(desde), PAQUETE.indexOf(hasta));
const S11 = seccion("### 1.1 ·", "### 1.2 ·");
const S12 = seccion("### 1.2 ·", "### 1.3 ·");
const S13 = seccion("### 1.3 ·", "## 2 ·");
const citas = (texto) => [...texto.matchAll(/«([^»]*)»/g)].map((m) => m[1]);
/* La fila de la tabla de Near que empieza por `| <clave> |`. */
const fila = (texto, clave) => {
  const f = texto.split("\n").filter((l) => l.startsWith(`| ${clave} |`));
  assert.equal(f.length, 1, `en el paquete no hay una sola fila ${clave}`);
  return f[0];
};
const miles = (n) => pesos(n).replace("$", "");
const enPaquete = (seccionDe, texto, donde) => assert.ok(citas(seccionDe).includes(texto), `${donde}: no está letra por letra en el paquete de Near:\n  «${texto}»`);
/* Lo que se cita en el paquete y no es texto del banco (nombres de opciones, la frase de Watari, fragmentos «…»). */
const NO_SON_DEL_BANCO = /^(…|Cuadra$|Basado en el libro$|poco usada$|Faltan \$X|si choca)/;

/* Mello (T2-3) y el delta de Near (T2-4): ver sus pruebas, más abajo. */
const DE_MELLO_ENTEROS = new Set(["cpv-e1", "cpv-e2", "cpv-e3", "cpv-j3"]);
const MELLO = readFileSync("orquestador/conocimiento/paquetes/c-t2-3-mello-auditoria.md", "utf8");
const M21 = MELLO.slice(MELLO.indexOf("### 2.1 ·"), MELLO.indexOf("### 2.2 ·"));
const DELTA = readFileSync("orquestador/conocimiento/paquetes/c-t2-4-near-delta.md", "utf8");
const N1 = DELTA.slice(DELTA.indexOf("## 1 ·"), DELTA.indexOf("## 2 ·"));
const N2 = DELTA.slice(DELTA.indexOf("## 2 ·"));
const decisionL = (x) => x.replaceAll("deuda de la computadora", "deuda del computador").replaceAll("La deuda de la computadora", "La deuda del computador");
const celdas = (linea) => linea.split("|").slice(1, -1).map((x) => x.trim());
/* Mello, auditoría T2-5 (lote T2-6), §2: A6 y las plantillas sin su primera oración. */
const MELLO5 = readFileSync("orquestador/conocimiento/paquetes/c-t2-5-mello-auditoria.md", "utf8");
const M5_22 = MELLO5.slice(MELLO5.indexOf("## 2 ·"), MELLO5.indexOf("## 3 ·"));
/* Near, delta T2-3 §2: los textos nuevos de VC·6 (Seguros pagados por anticipado). */
const DELTA3 = readFileSync("orquestador/conocimiento/paquetes/c-t2-3-near-delta.md", "utf8");
/* Lote T2-10: la auditoría T2-9 de Mello (§4.1, E3) y el delta T2-9 de Near (textos que faltaban). */
const MELLO9 = readFileSync("orquestador/conocimiento/paquetes/c-t2-9-mello-auditoria.md", "utf8");
const M9_41 = MELLO9.slice(MELLO9.indexOf("## 4 ·"), MELLO9.indexOf("2. **«Las que vuelven a cero»"));
const citaTras = (texto, rotulo) => texto.slice(texto.indexOf(rotulo)).match(/«([^»]*)»/)[1];
const DELTA9 = readFileSync("orquestador/conocimiento/paquetes/c-t2-9-near-delta.md", "utf8");
/* Near T2-10 §2: VC·1, VC·3 y VC·7, que cambian de cuenta con los mismos saldos (Mello T2-9 §4.2). */
const NEAR10 = readFileSync("orquestador/conocimiento/paquetes/c-t2-10-near-textos.md", "utf8");
const N10_2 = NEAR10.slice(NEAR10.indexOf("## 2 ·"));
const vc10 = (k, campo) => {
  const f = N10_2.split("\n").filter((l) => l.startsWith(`| VC·${k} | ${campo} |`));
  assert.equal(f.length, 1, `Near T2-10: no hay una sola fila VC·${k} ${campo}`);
  return celdas(f[0])[2];
};
const DE_NEAR10 = new Set([1, 3, 7]);
const vc6 = (campo) => celdas(DELTA3.split("\n").find((l) => l.startsWith(`| VC·6 | ${campo}`)))[3].replace(/ \(\d+ · [\d,]+\)$/, "");

test("★★★ letra por letra: los tres bancos son los de Near (§1.1, §1.2, §1.3), en las dos direcciones", () => {
  const usados = new Set();
  const usa = (sec, texto, donde) => { enPaquete(sec, texto, donde); usados.add(texto); };

  /* Objetivos y consignas. */
  usa(S11, D.OBJETIVO_T2_NUEVAS["cu-cuadra-por-valor"], "objetivo 1.1");
  usa(S12, D.OBJETIVO_T2_NUEVAS["cu-del-diario-al-mayor"], "objetivo 1.2");
  usa(S13, D.OBJETIVO_T2_NUEVAS["cu-las-que-vuelven-a-cero"], "objetivo 1.3");
  for (const [tipo, c] of Object.entries(D.CONSIGNAS_CUADRA)) usa(S11, c, `consigna ${tipo}`);
  assert.match(S12, new RegExp(`destino: «${D.CONSIGNAS_DIARIO.destino}»`));
  usa(S12, D.CONSIGNAS_DIARIO.destino, "consigna destino");
  usa(S12, D.CONSIGNAS_DIARIO.origen, "consigna origen");
  usa(S13, D.CONSIGNA_CERO, "consigna 1.3");

  /*
   * 1.1 · cada caso, en su fila (cpv-k1 ↔ K1). Lo que cambió la auditoría de
   * Mello (T2-3) se compara con Mello y el delta de Near T2-4 en la prueba de
   * abajo: E1-E3 enteros, los hechos de J1 y J2, y J3, que es el K3 de Near
   * (su porqué sigue en la fila K3).
   */
  for (const c of D.CUADRA_POR_VALOR.casos) {
    if (DE_MELLO_ENTEROS.has(c.id)) continue;
    const f = fila(S11, c.id === "cpv-j3" ? "K3" : c.id.slice(4).toUpperCase());
    const cita = (texto, que) => { assert.ok(f.includes(`«${texto}»`), `${c.id} · ${que} no está en su fila de Near`); usados.add(texto); };
    cita(c.porque, "porqué");
    if (c.tipo === "completar") {
      assert.ok(f.includes(`| ${miles(c.correcta)} |`), `${c.id}: la correcta no es la de Near`);
      for (const d of c.distractores) {
        assert.ok(f.includes(`${miles(d.valor)} → «${d.retro}»`), `${c.id}: el retro de ${miles(d.valor)} no es el suyo`);
        usados.add(d.retro);
      }
      assert.equal(c.distractores.length, (f.match(/ → «/g) ?? []).length, `${c.id}: faltan distractores de Near`);
    }
    if (c.tipo === "juzgar" && c.id !== "cpv-j3") {
      cita(c.retroMala, "retro de «Cuadra»");
      assert.ok(f.includes("| No cuadra |") === !c.cuadra);
    }
    if (c.tipo === "encontrar") {
      cita(c.hecho, "hecho");
      for (const [k, retro] of Object.entries(c.retros)) {
        const nombre = c.lineas[k].cuenta;
        assert.match(f, new RegExp(`(${nombre}|${nombre.split(" ")[0]}) → «${retro.replace(/[$.?()]/g, "\\$&")}»`), `${c.id}: el retro de ${nombre} no es el suyo`);
        usados.add(retro);
      }
    }
    /* Los montos de cada línea están en la fila. */
    for (const l of c.lineas) if (l.monto != null) assert.ok(f.includes(miles(l.monto)), `${c.id}: ${l.cuenta} ${miles(l.monto)} no es de Near`);
  }
  /* Lo que la auditoría de Mello retiró de Near (T2-3): los distractores de K3, E1-E3 viejos y los hechos viejos de J1 y J2. */
  const retirados = new Set(["K3", "E1", "E2", "E3"].flatMap((k) => citas(fila(S11, k))));
  for (const k of ["J1", "J2"]) for (const x of citas(fila(S11, k))) if (!usados.has(x)) retirados.add(x);

  /* 1.2 · plantillas, porqué de destino y cierres. */
  for (const [letra, p] of Object.entries(D.PLANTILLAS_DIARIO)) {
    const linea = S12.split("\n").find((l) => l.includes(`**${letra}**`));
    assert.ok(linea?.includes(`«${p}»`), `plantilla ${letra} no es la de Near`);
    usados.add(p);
  }
  usa(S12, D.PORQUE_DESTINO, "porqué de destino");
  /* La tabla de cada caso, hasta su «Cierre del caso» inclusive. */
  const tablaDe = (caso) => {
    const ini = S12.indexOf(`**Caso ${caso.id.at(-1).toUpperCase()} ·`);
    return S12.slice(ini, S12.indexOf("\n", S12.indexOf("Cierre del caso", ini)));
  };
  for (const caso of D.DEL_DIARIO_AL_MAYOR.casos) {
    const tabla = tablaDe(caso);
    usa(tabla, caso.cierre, `${caso.id} cierre`);
    const renglones = L.renglonesDe(caso);
    for (const it of caso.items) {
      if (it.tipo === "revisar") continue; /* de la prueba del delta T2-4 */
      const n = it.id.split("-").at(-1);
      const f = fila(tabla, n);
      assert.ok(f.includes(`| ${it.tipo} |`), `${it.id}: tipo`);
      const r = renglones[it.renglon];
      if (it.tipo === "destino") {
        assert.ok(f.includes(`${r.fecha.split(" ")[1]} ene · ${r.cuenta} · ${r.lado === "debe" ? "Debe" : "Haber"} · ${miles(r.monto)}`), `${it.id}: el renglón no es el de Near`);
        for (const [cuenta, letra] of Object.entries(it.retros)) {
          assert.match(f, new RegExp(`(${cuenta}|${cuenta.split(" ")[0]}) → ${letra}\\b`), `${it.id}: ${cuenta} no lleva ${letra}`);
        }
        assert.equal(Object.keys(it.retros).length, (f.match(/ → [ABC]\b/g) ?? []).length);
      } else {
        assert.ok(f.includes(`| renglón ${it.renglon + 1} |`), `${it.id}: la respuesta no es la de Near`);
        assert.ok(f.includes(`Mayor: ${r.cuenta} · ${r.lado} · ${r.fecha.split(" ")[1]} ene · ${pesos(r.monto)}`), `${it.id}: la línea del mayor no es la de Near`);
        for (const [k, letra] of Object.entries(it.retros)) {
          assert.match(f, new RegExp(`r${Number(k) + 1} → ${letra}\\b`), `${it.id}: r${Number(k) + 1} no lleva ${letra}`);
        }
        assert.equal(Object.keys(it.retros).length, (f.match(/r\d → o[A-D]/g) ?? []).length);
      }
    }
  }

  /* 1.3 · opciones, rótulo, texto final y cada cuenta en su fila. */
  for (const o of Object.values(D.OPCIONES_CERO)) usa(S13, o, "opción");
  usa(S13, D.ROTULO_CERO, "rótulo");
  usa(S13, D.LAS_QUE_VUELVEN_A_CERO.textoFinal, "texto final");
  /* El único nombre que no es el de Near: L lo cambió (T2-2, hueco 2). */
  const NOMBRE_DE_NEAR = { "Seguros pagados por anticipado": "Gastos pagados por anticipado" };
  const retiradosVC = new Set();
  D.LAS_QUE_VUELVEN_A_CERO.caso.cuentas.forEach((c, k) => {
    const f = fila(S13, String(k + 1));
    if (DE_NEAR10.has(k + 1)) {
      /* VC·1, VC·3 y VC·7: Near T2-10 §2, letra por letra; el saldo y la clase, los de §1.3. Lo de §1.3 queda retirado. */
      assert.equal(`${c.nombre} · ${c.clase} · ${pesos(c.saldo)}`, vc10(k + 1, "nombre"), `${c.id}: nombre, clase o saldo de Near T2-10`);
      assert.ok(f.includes(`| ${c.clase} | ${pesos(c.saldo)} |`), `${c.id}: el saldo cambió respecto a §1.3`);
      assert.equal(c.porque, vc10(k + 1, "porqué"), `${c.id}: porqué de Near T2-10`);
      assert.equal(c.retroMala, vc10(k + 1, "retro si la pasa"), `${c.id}: retro de Near T2-10`);
      for (const x of citas(f)) retiradosVC.add(x);
      usados.add(c.porque); usados.add(c.retroMala);
      return;
    }
    assert.ok(f.includes(`| ${NOMBRE_DE_NEAR[c.nombre] ?? c.nombre} | ${c.clase} | ${pesos(c.saldo)} |`), `${c.id}: nombre, clase o saldo`);
    assert.ok(f.includes(`| ${L.destinoCorrecto(c) === D.VUELVE_A_CERO ? "Vuelve a cero" : "Pasa"} |`), `${c.id}: la correcta`);
    if (NOMBRE_DE_NEAR[c.nombre]) {
      /* VC·6: los textos son los del delta de Near T2-3 §2; los de §1.3 quedan retirados. */
      assert.equal(c.porque, vc6("porqué"), `${c.id}: porqué del delta T2-3`);
      assert.equal(c.retroMala, vc6("retro si la pone en cero"), `${c.id}: retro del delta T2-3`);
      for (const x of citas(f)) retiradosVC.add(x);
    } else {
      assert.ok(f.includes(`«${c.porque}»`), `${c.id}: porqué`);
      assert.ok(f.includes(`«${c.retroMala}»`), `${c.id}: retro`);
    }
    usados.add(c.porque); usados.add(c.retroMala);
  });

  /* Y al revés: nada de lo que Near escribió en sus filas se quedó fuera. */
  const filas = (sec) => sec.split("\n").filter((l) => /^\| (K|J|E)?\d \|/.test(l) || /^  - \*\*o?[A-D]\*\*/.test(l)).join("\n");
  for (const sec of [S11, S12, S13]) {
    for (const c of citas(filas(sec))) {
      if (NO_SON_DEL_BANCO.test(c)) continue;
      if (sec === S11 && retirados.has(c)) continue;
      if (sec === S13 && retiradosVC.has(c)) continue;
      assert.ok(usados.has(c), `texto de Near que no está en los datos:\n  «${c}»`);
    }
  }
});

/* ═══════════════════════ MELLO (T2-3) Y EL DELTA DE NEAR (T2-4), LETRA POR LETRA ═══════════════════════
 *
 * Mello, c-t2-3-mello-auditoria.md §2.1: J1, J2, J3 (el retro de «No cuadra»)
 * y E1-E3 (hecho, renglones y porqué). Near, c-t2-4-near-delta.md §1: el
 * retro de cada línea buena de E1-E3; §2: los cuatro «revisar» (A6, A7, B6,
 * B7) y las plantillas Rv, Rt y Rl. La única diferencia admitida es la de L
 * en el lote T2-4: «la deuda del computador», no «de la computadora».
 */

test("★★★ letra por letra: Cuadra por valor con Mello (§2.1) y el delta de Near T2-4 §1", () => {
  const caso = (id) => D.CUADRA_POR_VALOR.casos.find((c) => c.id === id);
  const enMello = (texto, donde) => assert.ok(citas(M21).map(decisionL).includes(texto), `${donde}: no está letra por letra en Mello §2.1:\n  «${texto}»`);
  /* J1 y J2: los enunciados de Mello. */
  enMello(caso("cpv-j1").hecho, "J1 hecho");
  enMello(caso("cpv-j2").hecho, "J2 hecho");
  /* J3 = K3 completo, «Cuadra», con el retro de «No cuadra» de Mello. */
  const j3 = caso("cpv-j3");
  enMello(j3.retroMala, "J3 retro de «No cuadra»");
  assert.equal(j3.cuadra, true);
  assert.match(M21, /Bancos 5\.000 \+ Caja 1\.000 \+ Equipo de computación 2\.000 \/ Acciones 8\.000/);
  assert.deepEqual(j3.lineas.map((l) => [l.cuenta, l.lado, l.monto]), [["Bancos", "debe", 5000], ["Caja", "debe", 1000], ["Equipo de computación", "debe", 2000], ["Acciones", "haber", 8000]]);
  /* E1-E3: hecho, renglones, línea mala y porqué, en la fila de Mello. */
  const filaMello = (k) => M21.split("\n").map((l) => l.trim()).find((l) => l.startsWith(`| E${k} ·`));
  const porqueMello = (k) => decisionL(M21.split("\n").find((l) => l.startsWith(`   - Porqué sugerido para E${k}:`)).match(/«([^»]*)»/)[1]);
  for (const k of [1, 2]) { /* E3 pasó a Mello T2-9 §4.1: ver la prueba del lote T2-10. */
    const c = caso(`cpv-e${k}`);
    const f = decisionL(filaMello(k));
    assert.equal(c.lineas.length, 3, `E${k}: tres renglones`);
    assert.equal(c.linea.length, 1, `E${k}: uno solo malo`);
    if (k !== 2) assert.ok(f.includes(`«${c.hecho}»`), `E${k}: el hecho no es el de Mello`);
    else assert.ok(citas(S11).includes(c.hecho) && f.includes("El texto de Near para cal-5, sin cambios"), "E2: el hecho es el de Near para cal-5");
    const mostrado = celdas(f)[2].replaceAll("**", "");
    assert.equal(mostrado, c.lineas.map((l) => `${l.cuenta} ${miles(l.monto)} ${l.lado === "debe" ? "D" : "H"}`).join(" · "), `E${k}: los renglones no son los de Mello`);
    assert.equal(celdas(f)[3], c.lineas[c.linea[0]].cuenta, `E${k}: la línea mala`);
    assert.equal(c.porque, porqueMello(k), `E${k}: el porqué no es el de Mello`);
  }
  /* E3, aunque cambió de cifras (T2-10), sigue siendo el traspuesto de Mello T2-3: la línea mala es la deuda. */
  assert.equal(celdas(decisionL(filaMello(3)))[3], caso("cpv-e3").lineas[caso("cpv-e3").linea[0]].cuenta);
  /* L, lote T2-4: E3 dice «del computador», en el hecho y en el porqué. */
  assert.match(caso("cpv-e3").hecho, /la deuda del computador\.$/);
  for (const c of D.CUADRA_POR_VALOR.casos) assert.doesNotMatch(JSON.stringify(c), /computadora/, `${c.id}: «computadora»`);
  /* Near T2-4 §1: el retro de cada línea buena tocada, con SU línea (cuenta, monto y lado). */
  let item = null;
  const vistos = [];
  for (const linea of N1.split("\n").filter((l) => /^\| E\d|^\| E\d ·/.test(l) || /^\| E/.test(l))) {
    const [it, lineaBuena, retro] = celdas(linea);
    if (/^E\d/.test(it)) item = it.slice(0, 2);
    const c = caso(`cpv-${item.toLowerCase()}`);
    const [, cuenta, monto, ld] = lineaBuena.match(/^(.+) ([\d.]+) ([DH])$/);
    /* E3 · Bancos: el cheque y su retro son de Mello T2-9 §4.1 (lote T2-10); se coteja en la prueba de ese lote. */
    if (item === "E3" && cuenta === "Bancos") { vistos.push(`${c.id}:2`); continue; }
    const k = c.lineas.findIndex((l) => l.cuenta === cuenta && miles(l.monto) === monto && (l.lado === "debe" ? "D" : "H") === ld);
    assert.ok(k >= 0, `${item}: ${lineaBuena} no es una línea del caso`);
    assert.ok(!c.linea.includes(k), `${item}: ${lineaBuena} es la mala`);
    assert.equal(c.retros[k], retro, `${item}: el retro de ${cuenta} no es el de Near`);
    vistos.push(`${c.id}:${k}`);
  }
  const todos = ["cpv-e1", "cpv-e2", "cpv-e3"].flatMap((id) => Object.keys(caso(id).retros).map((k) => `${id}:${k}`));
  assert.deepEqual(vistos.sort(), todos.sort(), "cada línea buena lleva el retro de Near, ni más ni menos");
});

test("★★★ letra por letra: «revisar» es el delta de Near T2-4 §2 (A6, A7, B6, B7, Rv, Rt y Rl)", () => {
  /* La consigna de Mello que repite Near, y las tres plantillas. */
  assert.ok(N2.includes(`**Consigna de Mello:** «${D.CONSIGNAS_DIARIO.revisar}»`));
  /* Las plantillas: las de Near sin su primera oración (Mello, auditoría T2-5 §2.3, lote T2-6). */
  for (const [letra, p] of Object.entries(D.PLANTILLAS_REVISAR)) {
    const linea = N2.split("\n").find((l) => l.includes(`**${letra}**`));
    assert.ok(linea?.includes(`«Esa línea coincide con su renglón del diario. ${p}»`), `plantilla ${letra}: no es la de Near sin su primera oración`);
    assert.ok(M5_22.split("\n").some((l) => l.trim() === `- ${letra}: «${p}» ${l.trim().match(/\(\d+ · [\d,]+\)$/)?.[0]}`), `plantilla ${letra} no es la de Mello T2-5`);
  }
  assert.deepEqual(Object.keys(D.PLANTILLAS_REVISAR).sort(), ["Rl", "Rt", "Rv"]);
  const LETRA_DE = { "cuenta vecina": "Rv", "cifra traspuesta": "Rt", "lado contrario": "Rl" };
  const revisar = D.DEL_DIARIO_AL_MAYOR.casos.flatMap((caso) => caso.items.filter((i) => i.tipo === "revisar").map((it) => ({ ...it, caso })));
  assert.deepEqual(revisar.map((i) => [i.id, i.fila]), [["ddm-a-r1", "A6"], ["ddm-a-r2", "A7"], ["ddm-b-r1", "B6"], ["ddm-b-r2", "B7"]]);
  for (const it of revisar) {
    const f = N2.split("\n").filter((l) => l.startsWith(`| ${it.fila} ·`));
    assert.equal(f.length, 1, `${it.fila}: una sola fila`);
    let [nombre, tipo, , malPasada, porque, buenas] = celdas(f[0]);
    /* A6, de Mello (auditoría T2-5 §2.2, lote T2-6): la línea mala y el porqué; las líneas buenas y su Rv no cambian. */
    if (it.fila === "A6") {
      const lm = M5_22.split("\n").map((l) => l.trim());
      malPasada = lm.find((l) => l.startsWith("- Línea mala: ")).replace("- Línea mala: ", "").split(". ")[0];
      porque = lm.find((l) => l.startsWith("- Porqué: ")).replace("- Porqué: ", "");
      assert.ok(M5_22.includes("Líneas buenas: Bancos D 5.000, Bancos H 800, Acciones H 5.000 y Flota D 4.800, todas con Rv."));
    }
    assert.equal(nombre, `${it.fila} · revisar ${it.id.at(-1)}`);
    assert.ok(tipo.startsWith(it.error), `${it.fila}: el tipo de error`);
    /* La línea mal pasada, con la forma de Watari { r, cuenta, lado, monto }. */
    const renglones = L.renglonesDe(it.caso);
    const fecha = renglones[it.mal.r].fecha.split(" ")[1];
    assert.equal(malPasada, `${it.mal.cuenta} · ${it.mal.lado === "debe" ? "D" : "H"} · ${fecha} ene · ${miles(it.mal.monto)}`, `${it.fila}: la línea mal pasada`);
    assert.equal(it.renglon, it.mal.r);
    assert.equal(porque, `«${it.porque}» ${porque.match(/\(\d+ · [\d,]+\)$/)[0]}`, `${it.fila}: el porqué no es el de Near`);
    /* Cada línea buena, con SU renglón (cuenta, lado, monto y, si hace falta, fecha), lleva la plantilla del tipo de error. */
    const entradas = buenas.split(" · ");
    assert.equal(entradas.length, Object.keys(it.retros).length, `${it.fila}: cuántas líneas buenas`);
    for (const e of entradas) {
      const [, cuenta, ld, monto, dia, letra] = e.match(/^(.+?) ([DH]) ([\d.]+)(?: \((\d+) ene\))? → (R[vtl])$/);
      const cand = renglones.filter((x) => (x.cuenta === cuenta || x.cuenta.split(" ")[0] === cuenta) && (x.lado === "debe" ? "D" : "H") === ld
        && miles(x.monto) === monto && (!dia || x.fecha.split(" ")[1] === dia));
      assert.equal(cand.length, 1, `${it.fila}: «${e}» no señala un solo renglón`);
      assert.equal(it.retros[cand[0].k], letra, `${it.fila}: r${cand[0].k + 1} no lleva ${letra}`);
      assert.equal(letra, LETRA_DE[it.error], `${it.fila}: la plantilla no es la de su tipo de error`);
    }
  }
});

/* ═══════════════════════ LOTE T2-10 · MELLO T2-9 §4.1 Y EL DELTA T2-9 DE NEAR, LETRA POR LETRA ═══════════════════════ */

test("★★★ letra por letra: E3 es el de Mello T2-9 §4.1 (cheque de $760)", () => {
  const e3 = D.CUADRA_POR_VALOR.casos.find((c) => c.id === "cpv-e3");
  assert.equal(e3.hecho, citaTras(M9_41, "- hecho:"), "E3: el hecho no es el de Mello T2-9");
  const mostrado = M9_41.split("\n").find((l) => l.trim().startsWith("- se muestra:")).replace(/^\s*- se muestra: /, "").replace(/;$/, "").replaceAll("**", "");
  assert.equal(mostrado, e3.lineas.map((l) => `${l.cuenta} ${miles(l.monto)} ${l.lado === "debe" ? "D" : "H"}`).join(" · "), "E3: los renglones no son los de Mello T2-9");
  assert.equal(e3.porque, citaTras(M9_41, "- porqué:"), "E3: el porqué no es el de Mello T2-9");
  const bancos = e3.lineas.findIndex((l) => l.cuenta === "Bancos");
  assert.equal(e3.retros[bancos], citaTras(M9_41, "- retro de Bancos:"), "E3: el retro de Bancos no es el de Mello T2-9");
  /* El retro de Hipoteca sigue siendo el de Near T2-4 §1. */
  assert.equal(e3.retros[1], celdas(N1.split("\n").find((l) => l.startsWith("| E3 · traspuesto |")))[2]);
});

test("★★★ letra por letra: el delta T2-9 de Near (origen, acierto de «revisar», J3, pies y «Así se juega»), en las dos direcciones", () => {
  const filas = DELTA9.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| ítem") && !l.startsWith("|---"));
  const seccion = (titulo) => DELTA9.slice(DELTA9.indexOf(`## ${titulo}`)).split("\n## ")[0];
  const filasDe = (titulo) => seccion(titulo).split("\n").filter((l) => filas.includes(l)).map(celdas);
  const usadas = new Set();
  const texto = (c) => c.replace(/^«|»$/g, "");
  const ver = (fila, valor, donde) => { assert.equal(texto(fila[2]), valor, `${donde}: no es el de Near T2-9`); usadas.add(fila.join("|")); };
  const deActividad = (titulo, id) => {
    const fs = filasDe(titulo);
    ver(fs.find((f) => f[0] === "la actividad" && f[1] === "pie de fuente"), D.PIE_T2_NUEVAS[id], `${id} pie`);
    ver(fs.find((f) => f[0] === "la actividad" && f[1] === "Así se juega"), D.CONSIGNA_T2_NUEVAS[id], `${id} «Así se juega»`);
    assert.equal(ASI_SE_JUEGA[id].consigna, D.CONSIGNA_T2_NUEVAS[id]);
    return fs;
  };

  /* Del diario al mayor: los cuatro porqués de origen, cada uno con SU renglón, y el acierto de «revisar». */
  const fd = deActividad("Del diario al mayor", "cu-del-diario-al-mayor");
  const origen = D.DEL_DIARIO_AL_MAYOR.casos.flatMap((caso) => caso.items.filter((i) => i.tipo === "origen").map((it) => ({ ...it, caso })));
  assert.equal(origen.length, 4);
  for (const it of origen) {
    const r = L.renglonesDe(it.caso)[it.renglon];
    const clave = `${r.cuenta} · ${r.lado} · ${r.fecha.split(" ")[1]} ene · ${pesos(r.monto)} → renglón ${it.renglon + 1}`;
    const f = fd.filter((x) => x[1] === "porqué" && x[0].startsWith(`${it.caso.id.at(-1).toUpperCase()}·o`) && x[0].includes(`(${clave})`));
    assert.equal(f.length, 1, `${it.id}: no hay una sola fila de Near para ${clave}`);
    ver(f[0], it.porque, `${it.id} porqué`);
  }
  ver(fd.find((f) => f[0] === "revisar (los 4)"), D.ACIERTO_REVISAR, "acierto de «revisar»");

  /* Cuadra por valor: J3 (hecho, asiento y fuente del ítem) y el pie de los demás casos. */
  const fc = deActividad("Cuadra por valor", "cu-cuadra-por-valor");
  const j3 = D.CUADRA_POR_VALOR.casos.find((c) => c.id === "cpv-j3");
  ver(fc.find((f) => f[0].startsWith("J3") && f[1] === "hecho"), j3.hecho, "J3 hecho");
  const asiento = fc.find((f) => f[0] === "J3" && f[1] === "asiento");
  const lado = (ld) => j3.lineas.filter((l) => l.lado === ld).map((l) => `${l.cuenta} ${miles(l.monto)}`).join(" + ");
  ver(asiento, `${lado("debe")} / ${lado("haber")}`, "J3 asiento");
  ver(fc.find((f) => f[0] === "J3" && f[1] === "fuente del ítem"), j3.pie, "J3 fuente");
  for (const c of D.CUADRA_POR_VALOR.casos) if (c !== j3) assert.equal(c.pie, D.PIE_T2_NUEVAS["cu-cuadra-por-valor"], `${c.id}: pie`);

  /* Las que vuelven a cero: el pie y «Así se juega». */
  deActividad("Las que vuelven a cero", "cu-las-que-vuelven-a-cero");

  /* Y al revés: ninguna fila de Near se quedó fuera. */
  for (const f of filas) assert.ok(usadas.has(celdas(f).join("|")), `fila de Near T2-9 que no está en los datos:\n  ${f}`);
});

test("★★★ letra por letra: VC·1, VC·3 y VC·7 son los de Near T2-10 §2, ya no se repiten con P2 y la utilidad sigue en $10.500", () => {
  const cuentas = D.LAS_QUE_VUELVEN_A_CERO.caso.cuentas;
  /* Las tres que P2 ya clasificaba (Mello T2-9 §4.2) no están. */
  for (const n of ["Ingresos por servicios", "Gastos de operación", "Costo de ventas"]) assert.ok(!cuentas.some((c) => c.nombre === n), `${n} sigue: se repite con P2`);
  /* Cada fila de Near T2-10 §2 está en los datos: nombre, porqué, retro y la consigna con el nombre de VC·7. */
  const filas10 = N10_2.split("\n").filter((l) => l.startsWith("| VC·"));
  assert.equal(filas10.length, 10);
  for (const l of filas10) {
    const [it, campo, texto] = celdas(l);
    const c = cuentas[Number(it.slice(3)) - 1];
    const dato = { nombre: `${c.nombre} · ${c.clase} · ${pesos(c.saldo)}`, "porqué": c.porque, "retro si la pasa": c.retroMala, "consigna con este nombre": D.consignaCero(c) }[campo];
    assert.equal(dato, texto, `Near T2-10 ${it} ${campo}`);
  }
  /* Los saldos de §1.3 no cambian, así que la utilidad tampoco. */
  assert.deepEqual([1, 3, 7].map((k) => cuentas[k - 1].saldo), [12000, 5000, 4500]);
  assert.equal(L.utilidadDe(cuentas), 10500);
});

test("★★★ C5 · el tramo fijo de 28 px: ninguna otra regla de .bar le gana en especificidad", async () => {
  const { CSS_T2_DELTA, CSS_T2_NUEVAS } = await import("../../components/mecanicas/libros/t2/comunT2.jsx");
  const css = `${CSS_T2_NUEVAS}\n${CSS_T2_DELTA}`.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "");
  const reglas = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), cuerpo: m[2] }));
  /* Especificidad (a, b, c) de un selector sin :not() ni ids: clases y atributos, y elementos. */
  const esp = (s) => [0, (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) ?? []).length, (s.replace(/\.[\w-]+|\[[^\]]*\]|:+[\w-]+/g, " ").match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length];
  const mayor = (a, b) => a[1] !== b[1] ? a[1] > b[1] : a[2] > b[2];
  const fijo = reglas.flatMap((r) => r.sel.split(",").map((s) => s.trim()).filter((s) => /\.bar\.fijo$/.test(s)).map((s) => ({ s, r })));
  assert.equal(fijo.length, 1, "una sola regla para el tramo fijo");
  assert.match(fijo[0].r.cuerpo, /height:\s*28px/);
  const espFijo = esp(fijo[0].s);
  const PISA = /(^|;)\s*(height|flex|border|background|color|font)\b/;
  for (const r of reglas) {
    if (r === fijo[0].r || !PISA.test(r.cuerpo)) continue;
    for (const s of r.sel.split(",").map((x) => x.trim())) {
      if (!/\.bar\b(?![\w-])/.test(s.split(/\s+/).at(-1))) continue;
      assert.ok(mayor(espFijo, esp(s)), `«${s}» (${esp(s)}) le gana o empata con el tramo fijo (${espFijo})`);
    }
  }
});

/* ═══════════════════════ CADA ÍTEM, SIN PANTALLA ═══════════════════════ */

test("★★★ Cuadra por valor: cada caso puntúa con su correcta y cada distractor da su retro de Near", () => {
  const { casos } = D.CUADRA_POR_VALOR;
  assert.deepEqual(casos.map((c) => c.id), ["cpv-k1", "cpv-k2", "cpv-j1", "cpv-j2", "cpv-j3", "cpv-e1", "cpv-e2", "cpv-e3"]);
  assert.equal(new Set(casos.map((c) => c.id)).size, casos.length, "ids repetidos");
  /* L, «Auditoría T2-3»: 2 de completar, 3 de juzgar (J3 = K3, «Cuadra») y 3 de encontrar; el tope de Watari es 8. */
  const n = (tipo) => casos.filter((c) => c.tipo === tipo).length;
  assert.ok(casos.length >= 6 && casos.length <= 8);
  assert.deepEqual([n("completar"), n("juzgar"), n("encontrar")], [2, 3, 3]);
  /* Juzgar con respuestas mezcladas (Mello, H3 y D5): contestar siempre lo mismo no acierta todo. */
  const juzgar = casos.filter((c) => c.tipo === "juzgar");
  assert.ok(juzgar.some((c) => c.cuadra) && juzgar.some((c) => !c.cuadra));
  assert.equal(D.CUADRA_POR_VALOR.porPartida, casos.length);

  for (const c of casos) {
    if (c.tipo === "completar") {
      assert.equal(c.lineas.filter((l) => l.monto == null).length, 1, `${c.id}: un solo hueco`);
      const bien = L.evaluarCuadra(c, c.correcta);
      assert.ok(bien.ok); assert.deepEqual(bien.textos, [c.porque]); assert.equal(bien.consecuencia, null);
      assert.equal(bien.sumas.debe, bien.sumas.haber, `${c.id}: la correcta no cuadra`);
      for (const d of c.distractores) {
        const mal = L.evaluarCuadra(c, d.valor);
        assert.ok(!mal.ok); assert.deepEqual(mal.textos, [d.retro]);
        /* Las dos formas de Watari: «Faltan…» o, si la cifra se pasa, «Sobran… su columna pasa la línea…». */
        assert.match(mal.consecuencia, /^(Faltan \$[\d.]+ en el (debe|haber): las dos columnas no llegan a la misma altura|Sobran \$[\d.]+ en el (debe|haber): su columna pasa la línea del (debe|haber))\.$/);
        const s = L.sumas(c.lineas, d.valor);
        const ladoHueco = c.lineas.find((l) => l.monto == null).lado;
        assert.equal(mal.consecuencia.startsWith("Sobran"), s[ladoHueco] > s[ladoHueco === "debe" ? "haber" : "debe"], `${c.id}: «Sobran» solo cuando la cifra se pasa`);
      }
    }
    if (c.tipo === "juzgar") {
      const correcta = c.cuadra ? L.CUADRA : L.NO_CUADRA;
      const otra = c.cuadra ? L.NO_CUADRA : L.CUADRA;
      assert.ok(L.evaluarCuadra(c, correcta).ok);
      assert.deepEqual(L.evaluarCuadra(c, correcta).textos, [c.porque]);
      assert.deepEqual(L.evaluarCuadra(c, otra).textos, [c.retroMala, c.porque]);
    }
    if (c.tipo === "encontrar") {
      for (const k of c.linea) assert.ok(L.evaluarCuadra(c, k).ok, `${c.id}: la línea ${k} se acepta`);
      const malas = c.lineas.map((_, k) => k).filter((k) => !c.linea.includes(k));
      assert.deepEqual(Object.keys(c.retros).map(Number).sort(), malas, `${c.id}: cada línea mala lleva su retro`);
      for (const k of malas) assert.deepEqual(L.evaluarCuadra(c, k).textos, [c.retros[k], c.porque]);
    }
  }
});

test("★★★ Cuadra por valor: las trampas de Watari y los cuatro errores de Mello están, con su aritmética", () => {
  const caso = (id) => D.CUADRA_POR_VALOR.casos.find((c) => c.id === id);
  const dif = (c) => { const s = L.sumas(c.lineas); return Math.abs(s.debe - s.haber); };
  const cuantas = (c, lado) => L.conteo(c.lineas, lado);
  /* 3 contra 1 que sí cuadra (J3, el K3 de Near, ahora en juzgar). */
  const j3 = caso("cpv-j3");
  assert.deepEqual([cuantas(j3, "debe"), cuantas(j3, "haber")], [3, 1]);
  const s3 = L.sumas(j3.lineas); assert.equal(s3.debe, s3.haber); assert.equal(j3.cuadra, true);
  /* 2 contra 2 que no cuadra. */
  const j2 = caso("cpv-j2");
  assert.deepEqual([cuantas(j2, "debe"), cuantas(j2, "haber")], [2, 2]);
  assert.equal(j2.cuadra, false);
  /* Monto traspuesto: la diferencia se divide por 9 (J2 y E3). */
  for (const id of ["cpv-j2", "cpv-e3"]) { assert.ok(dif(caso(id)) > 0); assert.equal(dif(caso(id)) % 9, 0, `${id}: la diferencia no es múltiplo de 9`); }
  /* Lado contrario (E1): la diferencia es el doble del renglón que se tocó. */
  const e1 = caso("cpv-e1");
  assert.equal(dif(e1), 2 * e1.lineas[e1.linea[0]].monto);
  /* Renglón omitido (J1): la diferencia es justo el renglón que falta en cu10-socio-vehiculo (Caja). */
  const j1 = caso("cpv-j1");
  const original = COMPUESTAS_SUELTAS.find((s) => s.id === "cu10-socio-vehiculo").asiento;
  const falta = original.debe.find(([c]) => !j1.lineas.some((l) => l.cuenta === c));
  assert.deepEqual(falta, ["Caja", dif(j1)]);
  /* Renglón de más (E2, Mello): la diferencia es el renglón que sobra, y ninguna cuenta se repite (no se halla por el nombre). */
  const e2 = caso("cpv-e2");
  assert.equal(dif(e2), e2.lineas[e2.linea[0]].monto);
  assert.equal(new Set(e2.lineas.map((l) => l.cuenta)).size, e2.lineas.length);
  assert.ok(!e2.hecho.includes(e2.lineas[e2.linea[0]].cuenta.toLowerCase()), "E2: el hecho nombra la cuenta que sobra");
  /* Encontrar (Mello): 3 renglones o más y uno solo malo. */
  for (const c of D.CUADRA_POR_VALOR.casos.filter((x) => x.tipo === "encontrar")) {
    assert.ok(c.lineas.length >= 3, `${c.id}: menos de 3 renglones`);
    assert.equal(c.linea.length, 1, `${c.id}: más de una línea aceptada`);
  }
  /* E3 (Mello T2-9): Hipoteca y Bancos coinciden con el hecho; a la deuda le toca 760 − 400 = 360 y dice 630. */
  const e3 = caso("cpv-e3");
  const leToca = e3.lineas[2].monto - e3.lineas[1].monto;
  const digitos = (n) => String(n).split("").sort().join("");
  assert.equal(leToca, 360); assert.notEqual(e3.lineas[0].monto, leToca);
  assert.equal(digitos(e3.lineas[0].monto), digitos(leToca), "E3: no son las mismas cifras invertidas");
  /* Juzgar y encontrar traen el hecho arriba (H3); completar no lo necesita. J3 ya lo trae (Near T2-9). */
  for (const c of D.CUADRA_POR_VALOR.casos) assert.equal(Boolean(c.hecho), c.tipo !== "completar", `${c.id}: hecho`);
  /* C1 (Mello T2-9 §4.1): E3 no repite el pago de $250 (P1·6) ni deja la resta a la vista: solo 630 → 360 explica la diferencia de 270. */
  assert.ok(!JSON.stringify(e3).includes("250"));
  const candidatos = e3.lineas.map((l, k) => k).filter((k) => {
    const otros = e3.lineas.filter((_, j) => j !== k);
    const leTocaria = otros.find((l) => l.lado === "haber") ? otros.filter((l) => l.lado === "haber").reduce((a, l) => a + l.monto, 0) - otros.filter((l) => l.lado === "debe").reduce((a, l) => a + l.monto, 0) : null;
    return leTocaria > 0 && digitos(leTocaria) === digitos(e3.lineas[k].monto) && leTocaria !== e3.lineas[k].monto;
  });
  assert.deepEqual(candidatos, e3.linea, "E3: el traspuesto no es único");
});

test("★★★ Del diario al mayor: tope de Watari, 3 destino, 2 origen y 2 revisar, y cada opción mala da su plantilla de Near con el nombre puesto", () => {
  const { casos } = D.DEL_DIARIO_AL_MAYOR;
  assert.equal(casos.length, 2);
  const todos = casos.flatMap((c) => c.items.map((i) => i.id));
  assert.equal(new Set(todos).size, todos.length, "ids repetidos");
  for (const caso of casos) {
    const renglones = L.renglonesDe(caso);
    assert.ok(L.cuentasDe(caso).length <= 4, `${caso.id}: más de 4 cuentas`);
    assert.ok(renglones.length <= 7, `${caso.id}: más de 7 renglones`);
    /* ene-03 sale (Near): con él pasa de 4 cuentas. */
    assert.ok(!renglones.some((r) => r.fecha === "Ene 3"));
    /* Mello §1.2 y L: 7 ítems, los dos revisar al final (Near T2-4 §2). */
    assert.deepEqual(caso.items.map((i) => i.tipo), ["destino", "destino", "destino", "origen", "origen", "revisar", "revisar"]);
    /* Los destino van en orden de fecha; se quitaron A1, A4, B4 y B5 (C1) y los ids que quedan no cambian. */
    assert.deepEqual(caso.items.filter((i) => i.tipo === "destino").map((i) => i.renglon), caso.id === "ddm-a" ? [1, 2, 4] : [0, 1, 2]);
    assert.deepEqual(caso.items.filter((i) => i.tipo !== "revisar").map((i) => i.id), caso.id === "ddm-a"
      ? ["ddm-a-2", "ddm-a-3", "ddm-a-5", "ddm-a-6", "ddm-a-7"] : ["ddm-b-1", "ddm-b-2", "ddm-b-3", "ddm-b-6", "ddm-b-7"]);
    /* C1 (Mello §2.2): cada renglón entra en un solo ítem de destino u origen; ningún origen es el inverso de un destino. */
    const preguntados = caso.items.filter((i) => i.tipo !== "revisar").map((i) => i.renglon);
    assert.equal(new Set(preguntados).size, preguntados.length, `${caso.id}: un renglón en dos ítems`);
    assert.deepEqual(L.pasadosDe(caso).sort(), caso.items.filter((i) => i.tipo === "origen").map((i) => i.renglon).sort(), "el mayor llega con los de origen ya pasados");
    /* El cierre dice las sumas de verdad. */
    const tot = (lado) => renglones.filter((r) => r.lado === lado).reduce((s, r) => s + r.monto, 0);
    assert.equal(tot("debe"), tot("haber"));
    assert.ok(caso.cierre.includes(`${pesos(tot("debe"))} en el debe y ${pesos(tot("haber"))} en el haber`));

    for (const it of caso.items) {
      const item = { ...it, caso };
      const r = renglones[it.renglon];
      if (it.tipo === "revisar") {
        /* Una sola línea del mayor trae un campo distinto de su renglón, y es el de su tipo de error. */
        const mayor = L.mayorRevisar(item);
        assert.equal(mayor.length, renglones.length);
        assert.deepEqual(Object.keys(mayor[0]).sort(), ["cuenta", "lado", "monto", "r"], "la forma de Watari: { r, cuenta, lado, monto }");
        const distintas = mayor.filter((x) => L.cotejoDe(renglones[x.r], x).some((c) => !c.igual));
        assert.deepEqual(distintas.map((x) => x.r), [it.mal.r], `${it.id}: más de una línea mal pasada`);
        const campos = L.cotejoDe(renglones[it.mal.r], it.mal).filter((c) => !c.igual).map((c) => c.campo);
        assert.deepEqual(campos, [{ "cuenta vecina": "Cuenta", "cifra traspuesta": "Monto", "lado contrario": "Lado" }[it.error]], `${it.id}: el campo distinto no es el de su error`);
        if (it.error === "cuenta vecina") assert.ok(renglones.some((x) => x.cuenta === it.mal.cuenta && x.fecha === renglones[it.mal.r].fecha), `${it.id}: no es su vecina de asiento`);
        if (it.error === "cifra traspuesta") {
          const d = Math.abs(it.mal.monto - r.monto);
          assert.equal(d % 9, 0); assert.equal([...String(it.mal.monto)].sort().join(""), [...String(r.monto)].sort().join(""));
        }
        /* Regla del banco (Watari): cifras de hasta 9.999. */
        for (const x of mayor) assert.ok(x.monto <= 9999, `${it.id}: ${x.monto} pasa de 9.999`);
        /* Bien: la mal pasada; el porqué. Mal: cada línea buena, su plantilla; la consecuencia es la de Watari. */
        const bien = L.evaluarDiario(item, it.mal.r);
        assert.ok(bien.ok); assert.deepEqual(bien.textos, [it.porque]); assert.equal(bien.consecuencia, null);
        const buenas = renglones.map((x) => x.k).filter((k) => k !== it.mal.r);
        assert.deepEqual(Object.keys(it.retros).map(Number).sort(), buenas, `${it.id}: cada línea buena lleva su plantilla`);
        for (const k of buenas) {
          const mal = L.evaluarDiario(item, k);
          assert.ok(!mal.ok);
          assert.deepEqual(mal.textos, [D.PLANTILLAS_REVISAR[it.retros[k]]]);
          assert.equal(mal.consecuencia, D.COINCIDE_REVISAR);
          assert.ok(mal.cotejo.every((c) => c.igual), `${it.id}: la línea buena r${k + 1} no coincide`);
        }
        continue;
      }
      if (it.tipo === "destino") {
        const bien = L.evaluarDiario(item, r.cuenta);
        assert.ok(bien.ok); assert.deepEqual(bien.textos, [D.PORQUE_DESTINO]);
        const malas = L.cuentasDe(caso).filter((c) => c !== r.cuenta);
        assert.deepEqual(Object.keys(it.retros).sort(), malas.sort(), `${it.id}: cada cuenta mala lleva su retro`);
        for (const c of malas) {
          const mal = L.evaluarDiario(item, c);
          assert.ok(!mal.ok);
          assert.deepEqual(mal.textos, [D.PLANTILLAS_DIARIO[it.retros[c]].replace("{cuenta}", c)]);
          assert.doesNotMatch(mal.textos[0], /[{}]/);
          /* La letra dice la verdad: A del mismo asiento, B de otro, C la misma cifra. */
          const mismoAsiento = renglones.some((x) => x.cuenta === c && x.fecha === r.fecha);
          const mismaCifra = renglones.some((x) => x.cuenta === c && x.monto === r.monto);
          if (it.retros[c] === "A") assert.ok(mismoAsiento, `${it.id}: ${c} no es del mismo asiento`);
          if (it.retros[c] === "B") assert.ok(!mismoAsiento, `${it.id}: ${c} sí está en ese asiento`);
          if (it.retros[c] === "C") assert.ok(mismaCifra, `${it.id}: ${c} no tiene la misma cifra`);
        }
      } else {
        const bien = L.evaluarDiario(item, it.renglon);
        assert.ok(bien.ok); assert.deepEqual(bien.textos, [it.porque]);
        const malos = renglones.map((x) => x.k).filter((k) => k !== it.renglon);
        assert.deepEqual(Object.keys(it.retros).map(Number).sort(), malos, `${it.id}: cada renglón malo lleva su retro`);
        for (const k of malos) {
          const t = renglones[k];
          const mal = L.evaluarDiario(item, k);
          assert.ok(!mal.ok);
          assert.doesNotMatch(mal.textos[0], /[{}]/);
          const esperado = D.PLANTILLAS_DIARIO[it.retros[k]].replace("{cuenta del mayor}", r.cuenta)
            .replace("{cuenta}", t.cuenta).replace("{fecha}", L.fechaLarga(t.fecha));
          assert.equal(mal.textos[0], esperado);
          const letra = it.retros[k];
          if (letra === "oA") assert.ok(t.cuenta === r.cuenta && t.fecha !== r.fecha, `${it.id}: r${k + 1} no es oA`);
          if (letra === "oB") assert.ok(t.cuenta !== r.cuenta && t.fecha === r.fecha, `${it.id}: r${k + 1} no es oB`);
          if (letra === "oC") assert.ok(t.cuenta !== r.cuenta && t.monto === r.monto, `${it.id}: r${k + 1} no es oC`);
          if (letra === "oD") assert.ok(t.cuenta !== r.cuenta && t.fecha !== r.fecha, `${it.id}: r${k + 1} no es oD`);
        }
      }
    }
  }
  /* Los ejemplos de Near, con el nombre y la fecha puestos. */
  const b = casos[1];
  const deB = (id) => ({ ...b.items.find((i) => i.id === id), caso: b });
  assert.equal(L.evaluarDiario(deB("ddm-b-6"), 1).textos[0], "Ese renglón es de Cuentas por pagar, pero del 8 de enero. Mira la fecha de la línea del mayor.");
  assert.equal(L.evaluarDiario(deB("ddm-b-7"), 2).textos[0], "Ese renglón es del mismo día, pero de Muebles y enseres. La línea del mayor es de Bancos.");
  /* Se alternan por intento (D8). */
  assert.equal(L.prepararDiario((xs) => xs, "ddm-a")[0].caso.id, "ddm-b");
  assert.equal(L.prepararDiario((xs) => xs, "ddm-b")[0].caso.id, "ddm-a");
  /* Los origen, barajados entre ellos; los revisar, al final y en su orden (el 2 después del 1). */
  const alReves = L.prepararDiario((xs) => [...xs].reverse(), "ddm-b");
  assert.deepEqual(alReves.map((i) => i.id), ["ddm-a-2", "ddm-a-3", "ddm-a-5", "ddm-a-7", "ddm-a-6", "ddm-a-r1", "ddm-a-r2"]);
  /* H6: la cuadrícula de T se baraja en cada intento, igual para toda la tanda. */
  assert.deepEqual(alReves[0].orden, [...L.cuentasDe(casos[0])].reverse());
  assert.ok(alReves.every((i) => i.orden === alReves[0].orden));
  assert.deepEqual(L.prepararDiario((xs) => xs, "ddm-b")[0].orden, L.cuentasDe(casos[0]));
});

test("★★★ Las que vuelven a cero: binaria, cada cuenta con su porqué y el retro de su opción mala, y las trampas de L", () => {
  const { caso } = D.LAS_QUE_VUELVEN_A_CERO;
  const cuentas = caso.cuentas;
  assert.ok(cuentas.length >= 6 && cuentas.length <= 8);
  assert.equal(new Set(cuentas.map((c) => c.id)).size, cuentas.length, "ids repetidos");
  for (const c of cuentas) {
    const bien = L.evaluarCero(c, L.destinoCorrecto(c));
    assert.ok(bien.ok); assert.deepEqual(bien.textos, [c.porque]);
    const otra = L.destinoCorrecto(c) === D.VUELVE_A_CERO ? D.PASA_CON_SALDO : D.VUELVE_A_CERO;
    const mal = L.evaluarCero(c, otra);
    assert.ok(!mal.ok); assert.deepEqual(mal.textos, [c.retroMala]);
    /* La familia (ingreso, gasto o costo) se nombra en el retro (L). */
    if (c.clase === "nominal") assert.match(mal.textos[0], new RegExp(`\\b${c.familia}\\b`), `${c.id}: el retro no nombra la familia`);
  }
  const de = (nombre) => cuentas.find((c) => c.nombre === nombre);
  /* Trampas de Near y de Mello: todas reales, y pasan con su saldo. */
  for (const [nombre, familia] of [["Cuentas por cobrar", "activo"], ["Documentos por pagar", "pasivo"], ["Seguros pagados por anticipado", "activo"], ["Caja", "activo"]]) {
    assert.ok(de(nombre), `falta ${nombre}`);
    assert.equal(de(nombre).clase, "real"); assert.equal(de(nombre).familia, familia);
    assert.equal(L.destinoCorrecto(de(nombre)), D.PASA_CON_SALDO);
  }
  assert.match(de("Caja").porque, /Cobrar no es un ingreso: es Caja/);
  /* Near T2-10: sale Costo de ventas, y con él el choque con «Costo de mercancía vendida». */
  assert.ok(!cuentas.some((c) => /costo|mercanc[ií]a vendida/i.test(c.nombre)));
  /* 2 ingresos, 2 gastos, 4 reales con un pasivo (Near §1.3 con T2-10). */
  const cuantas = (f) => cuentas.filter((c) => c.familia === f).length;
  assert.deepEqual([cuantas("ingreso"), cuantas("gasto"), cuantas("costo"), cuentas.filter((c) => c.clase === "real").length, cuantas("pasivo")], [2, 2, 0, 4, 1]);
  /* La utilidad del texto final sale de los datos. */
  assert.equal(L.utilidadDe(cuentas), 10500);
  assert.ok(D.LAS_QUE_VUELVEN_A_CERO.textoFinal.includes(pesos(L.utilidadDe(cuentas))));
  assert.equal(D.consignaCero(de("Caja")), "Llega el cierre de 20X1. ¿Qué pasa con Caja?");
});

/* ═══════════════════════ 8.º · CUADRA POR VALOR, JUGADA ═══════════════════════ */

const textosRetro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((n) => n.textContent);
const caso = (id) => D.CUADRA_POR_VALOR.casos.find((c) => c.id === id);

/* Lo que se ve de la figura y del asiento, sin el campo: la «geometría» que no debe moverse al teclear. */
const figura = (caja) => [caja.querySelector("[data-columnas]").outerHTML, caja.querySelector("[data-asiento]").outerHTML];
/* Con o sin movimiento reducido: el jsdom de arriba dice que sí; aquí se apaga para ver la pausa de 380 ms. */
async function sinReducido(fn) {
  const antes = w.matchMedia;
  const mm = (q) => ({ matches: !/reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  w.matchMedia = mm; globalThis.matchMedia = mm;
  try { await fn(); } finally { w.matchMedia = antes; globalThis.matchMedia = antes; }
}
const esperar = (ms) => act(() => new Promise((ok) => setTimeout(ok, ms)));

test("★★★ Cuadra por valor jugada: tres tipos, un intento, la figura no calcula al teclear, consecuencia antes del veredicto, «Iba aquí» a los 0,7 s, puntaje y detalle", async () => {
  const items = L.prepararCuadra();
  assert.deepEqual(items.map((c) => c.tipo), ["completar", "completar", "juzgar", "juzgar", "juzgar", "encontrar", "encontrar", "encontrar"]);
  const { caja, llamadas, desmontar } = montar(CuadraPorValor, { items });

  /* K1, MAL: 1.500.000 en Cuentas por pagar. */
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.t2Cuadra, "completar");
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.OBJETIVO_T2_NUEVAS["cu-cuadra-por-valor"]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.completar);
  /* Antes de «Comprobar»: el hueco es el tramo fijo con «?», la suma de su lado dice «?» y no hay línea de nivel. */
  assert.equal(caja.querySelector("[data-fijo]").textContent, "?");
  assert.ok(caja.querySelector(".bar.fijo"), "el tramo fijo no lleva la clase de Watari");
  assert.equal(caja.querySelector("[data-fijo]").getAttribute("style"), null, "el tramo fijo no tiene altura propia");
  assert.equal(caja.querySelector('[data-total="haber"]').textContent, "?");
  assert.equal(caja.querySelector('[data-conteo="haber"]').textContent, "Haber · ?");
  assert.equal(caja.querySelector("[data-nivel]"), null);
  assert.equal(caja.querySelector("[data-hueco]").textContent, "$?");
  /* Millones (K1): el asiento va apilado, y la cifra mide la más larga. */
  assert.equal(caja.querySelector("[data-asiento]").dataset.apilado, "true");
  assert.equal(caja.querySelector("[data-asiento]").style.getPropertyValue("--cifra"), String(pesos(1500000).length));
  /* C5 de geometría (Mello): con una cifra escrita y sin comprobar, la figura y el asiento miden lo mismo con cualquier cifra. */
  const input = caja.querySelector("input");
  const vacio = figura(caja);
  escribir(input, "5");
  const conCinco = figura(caja);
  escribir(input, "9.999.999.999");
  assert.deepEqual(figura(caja), conCinco, "la figura cambia con la cifra escrita");
  assert.deepEqual(conCinco, vacio, "la figura cambia al escribir");
  escribir(input, "1.500.000");
  assert.deepEqual(figura(caja), vacio);
  /* Nada califica antes de «Comprobar». */
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.fase, "pregunta");
  assert.deepEqual(textosRetro(caja), []);
  assert.equal(caja.querySelector("[data-consecuencia]"), null);
  clic(boton(caja, "Comprobar"));
  /* Movimiento reducido (el jsdom de arriba): todo a la vez. */
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.fase, "veredicto");
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Sobran $750.000 en el haber: su columna pasa la línea del debe.");
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "desigual");
  assert.equal(caja.querySelector("[data-fijo]"), null, "comprobado, el hueco toma su cifra");
  assert.ok(caja.querySelector(".bar.tuya.mal"));
  assert.equal(caja.querySelector('[data-total="haber"]').textContent, "$2.250.000");
  /* «Iba aquí», 0,7 s después del error (Mello T2-5 §1; RETARDO_IBA_MS). */
  assert.equal(caja.querySelector("[data-iba]"), null, "«Iba aquí» llegó con el veredicto");
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.fase, "iba");
  assert.equal(caja.querySelector("[data-iba]").textContent, "La cifra$750.000Iba aquí");
  assert.equal(caja.querySelector("[data-escrito] [data-pastilla]").dataset.pastilla, "tachada");
  assert.deepEqual(textosRetro(caja), [caso("cpv-k1").distractores[0].retro]);
  assert.equal(caja.querySelector("input"), null, "un solo intento: el campo se va");
  assert.equal(boton(caja, "Comprobar"), undefined);
  /* La consecuencia va ANTES que el veredicto (C4). */
  const orden = [...caja.querySelectorAll("[data-consecuencia], [data-retro]")].map((n) => (n.hasAttribute("data-retro") ? "retro" : "consecuencia"));
  assert.deepEqual(orden, ["consecuencia", "retro"]);
  assert.equal(caja.querySelector("[data-pie]").textContent, D.PIE_T2_NUEVAS["cu-cuadra-por-valor"]);
  siguiente(caja);

  /* K2, BIEN: 500 para Bancos. Sin millones, el asiento no se apila. */
  assert.equal(caja.querySelector("[data-asiento]").dataset.apilado, "false");
  escribir(caja.querySelector("input"), "500");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "igual");
  assert.equal(caja.querySelector('[data-conteo="debe"]').textContent, "Debe · $2.500");
  assert.equal(caja.querySelector('[data-conteo="haber"]').textContent, "Haber · $2.500");
  assert.equal(caja.querySelector("[data-consecuencia]"), null);
  assert.deepEqual(textosRetro(caja), [caso("cpv-k2").porque]);
  siguiente(caja);

  /* J1: el hecho de Mello arriba; antes de decidir no hay columnas ni sumas (serían la respuesta). */
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.juzgar);
  assert.equal(caja.querySelector("[data-hecho]").textContent, caso("cpv-j1").hecho);
  assert.equal(caja.querySelector("[data-columnas]"), null);
  assert.equal(caja.querySelector("[data-total]"), null);
  assert.equal(caja.querySelector("[data-asiento]").dataset.apilado, "true");
  clic(caja.querySelector('[data-opcion="no-cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "correcta");
  assert.ok(caja.querySelector("[data-columnas] .columnas.entra"), "las columnas entran al decidir");
  assert.equal(caja.querySelector('[data-total="debe"]').textContent, "$2.000.000");
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Faltan $1.000.000 en el debe: las dos columnas no llegan a la misma altura.");
  siguiente(caja);
  /* J2, MAL: «Cuadra». */
  assert.equal(caja.querySelector("[data-hecho]").textContent, caso("cpv-j2").hecho);
  clic(caja.querySelector('[data-opcion="cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "incorrecta");
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "libre");
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "revelada");
  assert.match(caja.querySelector("[data-consecuencia]").textContent, /Faltan \$27\.000 en el haber/);
  assert.deepEqual(textosRetro(caja), [caso("cpv-j2").retroMala, caso("cpv-j2").porque]);
  siguiente(caja);
  /* J3, MAL: «No cuadra» a un 3 contra 1 que sí cuadra. Nivel igual y sin consecuencia de desnivel. Hecho y pie, los de Near T2-9. */
  assert.equal(caja.querySelector("[data-hecho]").textContent, caso("cpv-j3").hecho);
  assert.equal(caja.querySelector("[data-pie]").textContent, caso("cpv-j3").pie);
  clic(caja.querySelector('[data-opcion="no-cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "incorrecta");
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "revelada");
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "igual");
  assert.equal(caja.querySelector("[data-consecuencia]"), null);
  assert.deepEqual(textosRetro(caja), [caso("cpv-j3").retroMala, caso("cpv-j3").porque]);
  siguiente(caja);

  /* E1: Caja (línea 1) es la que descuadra. Antes de decidir, ni sumas ni columnas. Con el acierto, su tramo queda con borde blanco. */
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.encontrar);
  assert.equal(caja.querySelector("[data-columnas]"), null);
  assert.equal(caja.querySelector("[data-sumas]"), null);
  clic(caja.querySelector('[data-linea="1"] button'));
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "correcta");
  assert.ok(caja.querySelector('[data-tramo="1"]').classList.contains("culpa"));
  assert.equal(caja.querySelector("[data-sumas]").textContent, "Sumas$16.000$4.000");
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.fase, "veredicto", "en el acierto no hay «Iba aquí»");
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Faltan $12.000 en el haber: las dos columnas no llegan a la misma altura.");
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "libre", "un intento: el segundo toque no cuenta");
  siguiente(caja);
  /* E2, MAL: Local comercial, que es el aporte. Caja queda revelada, y el retro es el de Near para esa línea. */
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "incorrecta");
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "revelada");
  assert.equal(caja.querySelector(".culpa"), null, "el borde blanco del culpable va con el acierto");
  assert.deepEqual(textosRetro(caja), [caso("cpv-e2").retros[0], caso("cpv-e2").porque]);
  siguiente(caja);
  /* E3, BIEN: Cuentas por pagar dice 520. */
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "correcta");
  assert.deepEqual(textosRetro(caja), [caso("cpv-e3").porque]);
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 4) / 8);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["cpv-k1", false, "1500000"], ["cpv-k2", true, null],
    ["cpv-j1", true, null], ["cpv-j2", false, "cuadra"], ["cpv-j3", false, "no-cuadra"],
    ["cpv-e1", true, null], ["cpv-e2", false, "0"], ["cpv-e3", true, null],
  ]);
  for (const d of detalle) assert.equal(d.intentos, 1, `${d.item}: un intento`);
  for (const c of D.CUADRA_POR_VALOR.casos) assert.ok(etiquetaDeItem("cu-cuadra-por-valor", c.id), `${c.id} sin etiqueta docente`);
  assert.equal(etiquetaDeItem("cu-cuadra-por-valor", "cpv-e2"), "Línea que descuadra: Local comercial, Caja, Aportes sociales");
  assert.equal(etiquetaDeItem("cu-cuadra-por-valor", "cpv-j3"), "Cuadra o no: Bancos, Caja, Equipo de computación, Acciones");
  assert.equal(etiquetaDeItem("cu-cuadra-por-valor", "cpv-k3"), null, "K3 ya no existe: pasó a J3");
  desmontar();
});

test("★★★ Cuadra por valor: a los 0 ms la consecuencia, a los 380 ms el veredicto; nada califica antes de decidir", async () => {
  await sinReducido(async () => {
    /* completar · K1 con la cifra que se pasa. */
    const k = montar(CuadraPorValor, { items: [caso("cpv-k1"), caso("cpv-j2")] });
    escribir(k.caja.querySelector("input"), "1500000");
    k.caja.querySelector("form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    await esperar(0);
    const raiz = () => k.caja.querySelector("[data-t2-cuadra]");
    assert.equal(raiz().dataset.fase, "consecuencia");
    assert.match(k.caja.querySelector("[data-consecuencia]").textContent, /^Sobran \$750\.000/);
    assert.ok(k.caja.querySelector(".columnas.comprobado .bar.tuya"), "el tramo del hueco sube al comprobar");
    assert.equal(k.caja.querySelector("[data-escrito] [data-pastilla]"), null, "sin veredicto a los 0 ms");
    assert.equal(k.caja.querySelector("[data-iba]"), null);
    assert.deepEqual(textosRetro(k.caja), []);
    assert.equal(boton(k.caja, "Siguiente"), undefined);
    await esperar(200);
    assert.equal(raiz().dataset.fase, "consecuencia", "el veredicto llegó antes de los 380 ms");
    await esperar(240);
    assert.equal(raiz().dataset.fase, "veredicto");
    assert.equal(k.caja.querySelector("[data-escrito] [data-pastilla]").dataset.pastilla, "tachada");
    assert.equal(k.caja.querySelector("[data-iba]"), null, "«Iba aquí» llegó con el veredicto");
    assert.deepEqual(textosRetro(k.caja), [caso("cpv-k1").distractores[0].retro]);
    await esperar(RETARDO_IBA_MS - 150);
    assert.equal(k.caja.querySelector("[data-iba]"), null, "«Iba aquí» llegó antes de 380 + 700 ms");
    await esperar(200);
    assert.ok(k.caja.querySelector("[data-iba]"));
    siguiente(k.caja);
    /* juzgar · J2: antes de decidir nada a la vista; a los 0 ms «elegida», a los 380 el veredicto. */
    assert.equal(k.caja.querySelector("[data-columnas]"), null);
    assert.equal(k.caja.querySelector("[data-total]"), null);
    clic(k.caja.querySelector('[data-opcion="cuadra"] button'));
    assert.equal(k.caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "elegida");
    assert.equal(k.caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "libre");
    assert.ok(k.caja.querySelector("[data-columnas]") && k.caja.querySelector("[data-consecuencia]"));
    assert.deepEqual(textosRetro(k.caja), []);
    await esperar(420);
    assert.equal(k.caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "incorrecta");
    assert.equal(k.caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "libre");
    await esperar(RETARDO_IBA_MS + 20);
    assert.equal(k.caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "revelada");
    assert.equal(k.llamadas.length, 0);
    siguiente(k.caja);
    assert.equal(k.llamadas.length, 1);
    assert.deepEqual(k.llamadas[0][2].map((d) => [d.item, d.ok]), [["cpv-k1", false], ["cpv-j2", false]]);
    k.desmontar();
  });
});

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR, JUGADA ═══════════════════════ */

test("★★★ Del diario al mayor jugada: destino, origen y revisar; el mayor llega con los origen pasados, el cotejo se calcula, el cierre se lee y la otra tanda juega el otro caso", async () => {
  const items = L.prepararDiario();
  const caso = items[0].caso;
  assert.equal(caso.id, "ddm-a");
  assert.deepEqual(items.map((i) => i.tipo), ["destino", "destino", "destino", "origen", "origen", "revisar", "revisar"]);
  const { caja, llamadas, desmontar } = montar(DelDiarioAlMayor, { items });

  /* El mayor llega con los dos renglones de origen ya pasados (los dos de Bancos). */
  assert.match(caja.querySelector('[data-cuenta-t="Bancos"]').textContent, /\$5\.000/);
  assert.match(caja.querySelector('[data-cuenta-t="Bancos"]').textContent, /\$800/);
  /* La cuadrícula, en el orden de la tanda (H6). */
  assert.deepEqual([...caja.querySelectorAll("[data-cuenta-destino]")].map((n) => n.dataset.cuentaDestino), items[0].orden);

  /* destino ddm-a-2, MAL: los $5.000 de Acciones a Bancos (la misma cifra: C). */
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.OBJETIVO_T2_NUEVAS["cu-del-diario-al-mayor"]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_DIARIO.destino);
  assert.equal(caja.querySelector("[data-marcado]").dataset.renglon, "1");
  assert.equal(caja.querySelector("[data-selector-vista]"), null);
  clic(caja.querySelector('[data-cuenta-destino="Bancos"]'));
  assert.deepEqual(textosRetro(caja), ["Así, Bancos se queda con un valor solo porque la cifra es igual. Busca la cuenta, no el número."]);
  const bancos = caja.querySelector('[data-cuenta-destino="Bancos"]');
  assert.match(bancos.style.border, /solid/);
  assert.equal(bancos.querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.equal(caja.querySelector('[data-cuenta-destino="Acciones"] [data-pastilla]').dataset.pastilla, "revelada");
  assert.ok(caja.querySelector('[data-cuenta-destino="Acciones"]').disabled, "un solo intento");
  siguiente(caja);
  /* Bien o mal, el renglón queda en su cuenta correcta. */
  assert.match(caja.querySelector('[data-cuenta-t="Acciones"]').textContent, /\$5\.000/);

  /* destino 3 y 5, BIEN, y el selector aparece y reordena sin calificar. */
  for (const c of ["Flota y equipo de transporte", "Letras por pagar"]) {
    clic(caja.querySelector(`[data-cuenta-destino="${c}"]`));
    assert.ok(caja.querySelector("[data-enlazado]"), `${c}: el renglón no queda enlazado`);
    assert.deepEqual(textosRetro(caja), [D.PORQUE_DESTINO]);
    siguiente(caja);
  }
  const antes = [...caja.querySelectorAll("[data-libro=diario] [data-renglon]")].map((n) => n.dataset.renglon);
  clic(boton(caja, "Por cuenta"));
  const despues = [...caja.querySelectorAll("[data-libro=diario] [data-renglon]")].map((n) => n.dataset.renglon);
  assert.deepEqual(antes, ["0", "1", "2", "3", "4"]);
  assert.deepEqual(despues, ["0", "3", "1", "2", "4"], "Por cuenta: Bancos junta sus dos renglones");
  clic(boton(caja, "Por fecha"));

  /* origen 6: los $800 del haber de Bancos. Se toca el depósito del 2 de enero (oA). */
  assert.equal(caja.querySelector("[data-t2-diario]").dataset.t2Diario, "origen");
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_DIARIO.origen);
  clic(caja.querySelector('[data-opcion-renglon="0"] button'));
  assert.deepEqual(textosRetro(caja), ["Ese renglón es de Bancos, pero del 2 de enero. Mira la fecha de la línea del mayor."]);
  assert.equal(caja.querySelector('[data-opcion-renglon="3"] button').dataset.estado, "revelada");
  siguiente(caja);
  /* origen 7, BIEN. Ya no es el último: el cierre no sale aquí. */
  clic(caja.querySelector('[data-opcion-renglon="0"] button'));
  assert.deepEqual(textosRetro(caja), [caso.items.find((i) => i.id === "ddm-a-7").porque]);
  siguiente(caja);

  /* revisar 1 (A6, cuenta vecina): el mayor completo, sin renglón marcado; la T de Letras por pagar, vacía. */
  const r1 = caso.items.find((i) => i.id === "ddm-a-r1");
  assert.equal(caja.querySelector("[data-t2-diario]").dataset.t2Diario, "revisar");
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_DIARIO.revisar);
  assert.equal(caja.querySelector("[data-marcado]"), null);
  assert.equal(caja.querySelectorAll("[data-linea-mayor]").length, 5);
  assert.equal(caja.querySelector('[data-cuenta-mayor="Letras por pagar"]').querySelectorAll("[data-linea-mayor]").length, 0);
  /* A6 de Mello (T2-6): los $4.000 de Letras cayeron en el haber de Bancos, junto a los $800 del mismo día. */
  assert.equal(caja.querySelector('[data-cuenta-mayor="Bancos"] [data-linea-mayor="4"]').getAttribute("aria-label"), "Bancos, haber, 4.000, Ene 4");
  assert.equal(caja.querySelectorAll('[data-cuenta-mayor="Bancos"] .cta-t > span:last-child [data-linea-mayor]').length, 2);
  assert.equal(caja.querySelector("[data-cotejo]"), null, "sin tocar, sin cotejo");
  /* La cifra va sin «$» (Watari). */
  assert.equal(caja.querySelector('[data-linea-mayor="0"]').textContent, "Ene 25.000");
  /* MAL: la línea buena de Bancos del 2 de enero. */
  clic(caja.querySelector('[data-linea-mayor="0"]'));
  assert.equal(caja.querySelector('[data-linea-mayor="0"]').dataset.estado, "incorrecta");
  assert.equal(caja.querySelector('[data-linea-mayor="4"]').dataset.estado, "libre", "la punteada llegó con el veredicto");
  assert.equal(caja.querySelector('[data-pastilla="iba-punteada"]'), null);
  await esperar(RETARDO_IBA_MS + 20);
  assert.equal(caja.querySelector('[data-linea-mayor="4"]').dataset.estado, "revelada", "la mal pasada, punteada");
  assert.ok(caja.querySelector('[data-libro=diario] [data-renglon="0"][data-enlazado]'), "se enciende su renglón del diario");
  const cot = [...caja.querySelectorAll("[data-cotejo] [data-campo]")];
  assert.deepEqual(cot.map((n) => [n.dataset.campo, n.dataset.igual, n.textContent]), [
    ["Cuenta", "true", "CuentaBancos=Bancos"], ["Lado", "true", "LadoDebe=Debe"], ["Monto", "true", "Monto5.000=5.000"],
  ]);
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, D.COINCIDE_REVISAR);
  assert.equal(caja.querySelector("[data-estado-revisar] [data-pastilla]").dataset.pastilla, "tachada");
  assert.equal(caja.querySelector('[data-pastilla="iba-punteada"]').textContent, "Iba en la línea punteada");
  assert.deepEqual(textosRetro(caja), [D.PLANTILLAS_REVISAR.Rv]);
  /* La consecuencia (el cotejo y la frase) antes que el veredicto. */
  const orden = [...caja.querySelectorAll("[data-cotejo], [data-consecuencia], [data-retro]")].map((n) => (n.hasAttribute("data-retro") ? "retro" : n.hasAttribute("data-cotejo") ? "cotejo" : "consecuencia"));
  assert.deepEqual(orden, ["cotejo", "consecuencia", "retro"]);
  clic(caja.querySelector('[data-linea-mayor="4"]'));
  assert.equal(caja.querySelector('[data-linea-mayor="4"]').dataset.estado, "revelada", "un intento");
  assert.ok(r1);
  siguiente(caja);
  /* revisar 2 (A7, traspuesta), BIEN: el cotejo marca solo el Monto, en neutro; el porqué y el cierre del caso. */
  clic(caja.querySelector('[data-linea-mayor="2"]'));
  assert.equal(caja.querySelector('[data-linea-mayor="2"]').dataset.estado, "correcta");
  assert.deepEqual([...caja.querySelectorAll("[data-cotejo] [data-campo]")].map((n) => [n.dataset.campo, n.dataset.igual]),
    [["Cuenta", "true"], ["Lado", "true"], ["Monto", "false"]]);
  assert.equal(caja.querySelector('[data-campo="Monto"]').textContent, "Monto4.800≠8.400");
  assert.equal(caja.querySelector("[data-consecuencia]"), null, "el error es del libro: nada en coral");
  /* El acierto de Near (T2-9), en neutro y con el cotejo, antes del veredicto. */
  assert.equal(caja.querySelector("[data-acierto-revisar]").textContent, D.ACIERTO_REVISAR);
  assert.ok(!caja.querySelector("[data-acierto-revisar]").classList.contains("falla"));
  assert.equal(caja.querySelector("[data-pie]").textContent, D.PIE_T2_NUEVAS["cu-del-diario-al-mayor"]);
  assert.equal(caja.querySelector("[data-estado-revisar] [data-pastilla]").dataset.pastilla, "correcta");
  assert.deepEqual(textosRetro(caja), [caso.items.find((i) => i.id === "ddm-a-r2").porque, caso.cierre]);
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 4) / 7);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["ddm-a-2", false, "Bancos"], ["ddm-a-3", true, null], ["ddm-a-5", true, null],
    ["ddm-a-6", false, "0"], ["ddm-a-7", true, null], ["ddm-a-r1", false, "0"], ["ddm-a-r2", true, null],
  ]);
  for (const d of detalle) assert.equal(d.intentos, 1, `${d.item}: un intento`);
  for (const c of D.DEL_DIARIO_AL_MAYOR.casos) for (const it of c.items) assert.ok(etiquetaDeItem("cu-del-diario-al-mayor", it.id), `${it.id} sin etiqueta docente`);
  assert.equal(etiquetaDeItem("cu-del-diario-al-mayor", "ddm-b-r1"), "Qué línea del mayor no coincide: Ene 12 · Bancos · $500");
  for (const id of ["ddm-a-1", "ddm-a-4", "ddm-b-4", "ddm-b-5"]) assert.equal(etiquetaDeItem("cu-del-diario-al-mayor", id), null, `${id} se quitó (C1)`);
  desmontar();

  /* Sin `items`, la tanda la sortea el componente: «Otra tanda» juega el otro caso (D8). */
  const otra = montar(DelDiarioAlMayor, {});
  const primero = otra.caja.querySelector("[data-item]").dataset.item.slice(0, 5);
  for (let k = 0; k < 7; k += 1) {
    const destino = otra.caja.querySelector("[data-cuenta-destino]");
    clic(destino ?? otra.caja.querySelector("[data-opcion-renglon] button") ?? otra.caja.querySelector("[data-linea-mayor]"));
    siguiente(otra.caja);
  }
  clic(boton(otra.caja, "Otra tanda"));
  const segundo = otra.caja.querySelector("[data-item]").dataset.item.slice(0, 5);
  assert.notEqual(segundo, primero, "la otra tanda repitió el caso");
  otra.desmontar();
});

test("★★★ Del diario al mayor · revisar: a los 0 ms el cotejo, a los 380 ms el veredicto; caso B, lado contrario", async () => {
  await sinReducido(async () => {
    const b = D.DEL_DIARIO_AL_MAYOR.casos[1];
    const orden = ["Bancos", "Muebles y enseres", "Cuentas por pagar", "Equipo de computación"];
    const items = ["ddm-b-r1", "ddm-b-r2"].map((id) => ({ ...b.items.find((i) => i.id === id), caso: b, orden }));
    const { caja, llamadas, desmontar } = montar(DelDiarioAlMayor, { items });
    assert.deepEqual([...caja.querySelectorAll("[data-cuenta-mayor]")].map((n) => n.dataset.cuentaMayor), orden, "la cuadrícula sigue el orden de la tanda");
    /* Bancos llega con los $500 en el debe; su haber, vacío. */
    const deb = caja.querySelector('[data-cuenta-mayor="Bancos"] .cta-t > span:first-child');
    assert.equal(deb.querySelector('[data-linea-mayor="3"]').getAttribute("aria-label"), "Bancos, debe, 500, Ene 12");
    clic(caja.querySelector('[data-linea-mayor="3"]'));
    const raiz = () => caja.querySelector("[data-t2-diario]");
    assert.equal(raiz().dataset.fase, "consecuencia");
    assert.deepEqual([...caja.querySelectorAll("[data-cotejo] [data-campo]")].map((n) => [n.dataset.campo, n.dataset.igual]),
      [["Cuenta", "true"], ["Lado", "false"], ["Monto", "true"]]);
    assert.equal(caja.querySelector('[data-campo="Lado"]').textContent, "LadoHaber≠Debe");
    assert.equal(caja.querySelector("[data-estado-revisar]"), null, "sin veredicto a los 0 ms");
    assert.deepEqual(textosRetro(caja), []);
    assert.equal(boton(caja, "Siguiente"), undefined);
    await esperar(200);
    assert.equal(raiz().dataset.fase, "consecuencia");
    await esperar(240);
    assert.equal(raiz().dataset.fase, "veredicto");
    assert.deepEqual(textosRetro(caja), [items[0].porque]);
    siguiente(caja);
    /* B7, MAL: Equipo (Rt). */
    clic(caja.querySelector('[data-linea-mayor="0"]'));
    await esperar(420);
    assert.deepEqual(textosRetro(caja), [D.PLANTILLAS_REVISAR.Rt, b.cierre]);
    /* «Iba en la línea punteada», 0,7 s después de «No va aquí» (Mello T2-5 §2.1). */
    assert.equal(caja.querySelector("[data-estado-revisar] [data-pastilla]").dataset.pastilla, "tachada");
    assert.equal(caja.querySelector('[data-pastilla="iba-punteada"]'), null);
    await esperar(RETARDO_IBA_MS - 150);
    assert.equal(caja.querySelector('[data-pastilla="iba-punteada"]'), null, "llegó antes de 380 + 700 ms");
    await esperar(200);
    assert.equal(caja.querySelector('[data-pastilla="iba-punteada"]').textContent, "Iba en la línea punteada");
    assert.equal(caja.querySelector('[data-linea-mayor="2"]').dataset.estado, "revelada");
    siguiente(caja);
    assert.deepEqual(llamadas[0][2].map((d) => [d.item, d.ok]), [["ddm-b-r1", true], ["ddm-b-r2", false]]);
    desmontar();
  });
});

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO, JUGADA ═══════════════════════ */

test("★★★ Las que vuelven a cero jugada: binaria, ceja de escenario, el error en el año siguiente y la utilidad al cerrar", () => {
  const items = L.prepararCero();
  for (const c of items) assert.ok(["real", "nominal"].includes(c.clase), `${c.id} sin clase`);
  assert.deepEqual([...new Set(items.map((c) => L.subtemaDeCuenta(c)))].sort(),
    ["Clasificación de cuentas nominales", "Clasificación de cuentas reales"]);
  const { caja, llamadas, desmontar } = montar(LasQueVuelvenACero, { items });

  /* Ingresos por intereses (nominal) pasada con su saldo: 20X2 la muestra con $12.000 y borde coral. */
  const primera = items[0];
  assert.equal(caja.querySelector("[data-t2-cero]").dataset.clase, "nominal");
  assert.equal(caja.querySelector("[data-ceja]").textContent, "Escenario simulado");
  assert.equal(caja.querySelector("[data-pie]").textContent, D.PIE_T2_NUEVAS["cu-las-que-vuelven-a-cero"]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, "Llega el cierre de 20X1. ¿Qué pasa con Ingresos por intereses?");
  assert.equal(caja.querySelector('[data-opcion="cero"] button').textContent.includes("Vuelve a cero en el cierre"), true);
  assert.equal(caja.querySelector('[data-opcion="pasa"] button').textContent.includes("Pasa al año siguiente con su saldo"), true);
  clic(caja.querySelector('[data-opcion="pasa"] button'));
  const fila = caja.querySelector(`[data-cuenta-siguiente="${primera.id}"]`);
  assert.equal(fila.dataset.valor, "12000");
  assert.match(fila.style.border, /2px solid/);
  assert.equal(fila.querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.deepEqual(textosRetro(caja), [primera.retroMala]);
  assert.equal(caja.querySelector('[data-opcion="cero"] button').dataset.estado, "revelada");
  clic(caja.querySelector('[data-opcion="cero"] button'));
  assert.equal(caja.querySelector('[data-opcion="cero"] button').dataset.estado, "revelada", "un intento");
  siguiente(caja);
  /* Al pasar, queda en su sitio correcto. */
  assert.equal(caja.querySelector(`[data-cuenta-siguiente="${primera.id}"]`).dataset.valor, "0");

  /* El resto, bien. */
  for (const c of items.slice(1)) {
    clic(caja.querySelector(`[data-opcion="${L.destinoCorrecto(c)}"] button`));
    if (c !== items.at(-1)) { assert.deepEqual(textosRetro(caja), [c.porque]); siguiente(caja); }
  }
  /* El año queda cerrado: la utilidad, y el puente con el desafío. */
  assert.equal(caja.querySelector("[data-utilidad]").dataset.utilidad, "10500");
  /* El periodo sale de los datos (Mello H2): «= Utilidad del año», y los rótulos, de `mes` y `mesSiguiente`. */
  assert.match(caja.querySelector("[data-utilidad]").textContent, new RegExp(`^= Utilidad del ${D.LAS_QUE_VUELVEN_A_CERO.caso.periodo}\\$`));
  assert.equal(D.LAS_QUE_VUELVEN_A_CERO.caso.periodo, "año");
  assert.match(caja.querySelector('[data-mes="despues"]').textContent, /^1 DE ENERO DE 20X2 · DESPUÉS DEL CIERRE/);
  assert.deepEqual(textosRetro(caja), [items.at(-1).porque, D.LAS_QUE_VUELVEN_A_CERO.textoFinal]);
  siguiente(caja);

  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 7) / 8);
  assert.deepEqual(detalle[0], { item: "lvc-ingresos-intereses", ok: false, intentos: 1, respuesta: "pasa", orden: 1 });
  assert.deepEqual(detalle.map((d) => d.item), D.LAS_QUE_VUELVEN_A_CERO.caso.cuentas.map((c) => c.id));
  for (const d of detalle) assert.ok(etiquetaDeItem("cu-las-que-vuelven-a-cero", d.item), `${d.item} sin etiqueta docente`);
  desmontar();
});

/* ═══════════════════════ «ASÍ SE JUEGA» Y LAS MUESTRAS ═══════════════════════ */

test("★★ «Así se juega»: modoDemo con el ejemplo de afuera, sin consigna, sin avance y sin onCompletar", () => {
  const MEC = { "cu-cuadra-por-valor": CuadraPorValor, "cu-del-diario-al-mayor": DelDiarioAlMayor, "cu-las-que-vuelven-a-cero": LasQueVuelvenACero };
  for (const id of D.IDS_T2_NUEVAS) {
    const asi = ASI_SE_JUEGA[id];
    assert.ok(asi, `${id} sin «Así se juega»`);
    assert.equal(asi.consigna, D.CONSIGNA_T2_NUEVAS[id]);
    assert.equal(asi.pasos.length, 3);
    for (const it of [asi.demo.items].flat()) assert.match(it.id, /^demo-/);
    const { caja, llamadas, desmontar } = montar(MEC[id], { modoDemo: true, ...asi.demo });
    assert.equal(caja.querySelector("[data-encabezado]"), null, `${id}: la demo enseña la consigna`);
    assert.equal(boton(caja, "Siguiente"), undefined);
    assert.equal(llamadas.length, 0);
    /* El pie es de la partida, no de la demo (los ejemplos son de la panadería). */
    if (id !== "cu-cuadra-por-valor") assert.equal(caja.querySelector("[data-pie]"), null, `${id}: pie en la demo`);
    desmontar();
  }
});

test("★★ lo que no es de Near sigue marcado, en comentario y nunca en pantalla; lo de Near ya no lleva marca", () => {
  const datos = readFileSync("src/data/contabilidadT2HacerNuevas.js", "utf8");
  /* Lote T2-10: Near ya dio la consigna de «Así se juega», los pies y el porqué de origen; en los datos no queda marca. */
  assert.equal(datos.split(MARCA).length - 1, 0, "quedó una marca de muestra donde ya hay texto de Near");
  /* En «Así se juega» siguen de muestra los pasos, el alt y los ejemplos (Near no los trae): una marca. */
  assert.equal(readFileSync("src/data/asiSeJuegaT2Nuevas.js", "utf8").split(MARCA).length - 1, 1, "«Así se juega»: pasos, alt y ejemplos son de muestra y perdieron su marca");
  assert.ok(!readFileSync("src/contabilidad/t2HacerNuevas.js", "utf8").includes(MARCA), "la lógica ya no lleva texto de muestra");
  const textos = JSON.stringify([D.CUADRA_POR_VALOR, D.DEL_DIARIO_AL_MAYOR.casos.map((c) => c.items), D.LAS_QUE_VUELVEN_A_CERO, D.CONSIGNA_T2_NUEVAS, ASI_SE_JUEGA["cu-cuadra-por-valor"]]);
  assert.ok(!textos.includes("PENDIENTE_DE_REVISION") && !textos.includes("ESCRITO POR CLAUDE"));
});

/* ═══════════════════════ NO LE CAMBIA NADA A NADIE ═══════════════════════ */

test("★★★ entrar las tres no le cambia nada a nadie: las siete de hoy con sus ids, FP y completados; las tres, ocultas hasta la 0116", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
  const todas = actividadesDeTipo(tema, HACER);
  const nuevas = new Set(D.IDS_T2_NUEVAS);
  const antes = todas.filter((a) => !nuevas.has(a.id));

  /* Las siete, en su orden, con sus FP de siempre. */
  assert.deepEqual(antes.map((a) => a.id), ACTIVIDADES.map((a) => a.id));
  assert.deepEqual(antes.map((a) => [a.clasificacion.dificultad, a.clasificacion.fpBase]),
    [["facil", 10], ["facil", 10], ["medio", 25], ["medio", 25], ["dificil", 50], ["dificil", 50], ["experto", 90]]);
  for (const a of antes) assert.ok(!a.pendiente, `${a.id} quedó pendiente`);

  /* Las tres, después de las siete y antes de El Ciclo Completo, y pendientes: el camino no las dibuja. */
  assert.deepEqual(todas.slice(7).map((a) => a.id), D.IDS_T2_NUEVAS);
  const ids = tema.actividades.map((a) => a.id);
  assert.ok(ids.indexOf("cu-las-que-vuelven-a-cero") < ids.indexOf("ciclo-completo"));
  for (const a of todas.slice(7)) assert.equal(a.pendiente, true, `${a.id} saldría en el camino antes de la 0116`);
  const camino = todas.filter((a) => !a.pendiente);
  assert.deepEqual(camino.map((a) => a.id), antes.map((a) => a.id));

  /* Un estudiante que hizo la 1.ª, la 5.ª y la 7.ª: las mismas hechas, en el mismo camino. */
  const hechas = new Set([antes[0].id, antes[4].id, antes[6].id]);
  const enCaminoAntes = nodosDe(antes, hechas).filter((n) => n.completada).map((n) => n.id);
  const enCaminoAhora = nodosDe(camino, hechas).filter((n) => n.completada).map((n) => n.id);
  assert.deepEqual(enCaminoAhora, enCaminoAntes);

  /* Ninguna reusa los cinco retirados en la 0043, y la 0116 no toca ninguna de las siete. */
  const RETIRADOS_0043 = ["cu-simple-o-compuesto", "cu-cuadra-o-no", "cu-corriente-de-cuentas", "cu-mayorizacion", "cu-error-escondido"];
  for (const id of D.IDS_T2_NUEVAS) assert.ok(!RETIRADOS_0043.includes(id));
  const sql = readFileSync("supabase/migrations/0116_t2_tres_hacer.sql", "utf8");
  for (const a of antes) assert.ok(!sql.includes(`'${a.id}'`), `la 0116 toca ${a.id}`);
  for (const id of RETIRADOS_0043) assert.ok(!sql.includes(`'${id}'`), `la 0116 toca ${id}`);
  assert.match(sql, /\('cu-cuadra-por-valor',\s+'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1\)/);
  assert.match(sql, /\('cu-del-diario-al-mayor',\s+'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1\)/);
  assert.match(sql, /\('cu-las-que-vuelven-a-cero', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'facil', 10, 1\)/);
  assert.match(sql, /on conflict \(activity_id\) do nothing;/);
  const sinComentarios = sql.replace(/--.*$/gm, "");
  assert.doesNotMatch(sinComentarios, /\b(update|delete|alter|drop)\b/i);

  /* Y la vista no los dibuja todavía: su lista de juegos sigue siendo la de las siete. */
  const vista = readFileSync("src/components/CuentasDebeHaberView.jsx", "utf8");
  for (const id of D.IDS_T2_NUEVAS) assert.ok(!vista.includes(`"${id}"`), `${id} ya está en la vista`);
});
