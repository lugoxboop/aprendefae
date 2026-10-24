import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lotes T2-2 y T2-3, #471).
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

const MARCA = "[ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)";

function montar(Componente, props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const llamadas = [];
  act(() => raiz.render(React.createElement(Componente, {
    Marco: MarcoLibros, rotulo: "R", titulo: "T", onCompletar: (...a) => llamadas.push(a), ...props,
  })));
  return { caja, llamadas, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
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

  /* 1.1 · cada caso, en su fila (cpv-k1 ↔ K1). */
  for (const c of D.CUADRA_POR_VALOR.casos) {
    const f = fila(S11, c.id.slice(4).toUpperCase());
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
    if (c.tipo === "juzgar") {
      cita(c.hecho, "hecho");
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
  D.LAS_QUE_VUELVEN_A_CERO.caso.cuentas.forEach((c, k) => {
    const f = fila(S13, String(k + 1));
    assert.ok(f.includes(`| ${NOMBRE_DE_NEAR[c.nombre] ?? c.nombre} | ${c.clase} | ${pesos(c.saldo)} |`), `${c.id}: nombre, clase o saldo`);
    assert.ok(f.includes(`| ${L.destinoCorrecto(c) === D.VUELVE_A_CERO ? "Vuelve a cero" : "Pasa"} |`), `${c.id}: la correcta`);
    assert.ok(f.includes(`«${c.porque}»`), `${c.id}: porqué`);
    assert.ok(f.includes(`«${c.retroMala}»`), `${c.id}: retro`);
    usados.add(c.porque); usados.add(c.retroMala);
  });

  /* Y al revés: nada de lo que Near escribió en sus filas se quedó fuera. */
  const filas = (sec) => sec.split("\n").filter((l) => /^\| (K|J|E)?\d \|/.test(l) || /^  - \*\*o?[A-D]\*\*/.test(l)).join("\n");
  for (const sec of [S11, S12, S13]) {
    for (const c of citas(filas(sec))) {
      if (NO_SON_DEL_BANCO.test(c)) continue;
      assert.ok(usados.has(c), `texto de Near que no está en los datos:\n  «${c}»`);
    }
  }
});

/* ═══════════════════════ CADA ÍTEM, SIN PANTALLA ═══════════════════════ */

test("★★★ Cuadra por valor: cada caso puntúa con su correcta y cada distractor da su retro de Near", () => {
  const { casos } = D.CUADRA_POR_VALOR;
  assert.deepEqual(casos.map((c) => c.id), ["cpv-k1", "cpv-k2", "cpv-k3", "cpv-j1", "cpv-j2", "cpv-e1", "cpv-e2", "cpv-e3"]);
  assert.equal(new Set(casos.map((c) => c.id)).size, casos.length, "ids repetidos");
  /* L: de 6 a 8 casos, 3 de completar, 2 de juzgar y de 1 a 3 de encontrar. */
  const n = (tipo) => casos.filter((c) => c.tipo === tipo).length;
  assert.ok(casos.length >= 6 && casos.length <= 8);
  assert.deepEqual([n("completar"), n("juzgar"), n("encontrar")], [3, 2, 3]);
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
        assert.match(mal.consecuencia, /^Faltan \$[\d.]+ en el (debe|haber): las dos columnas no llegan a la misma altura\.$/);
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
  /* 3 contra 1 que sí cuadra. */
  const k3 = caso("cpv-k3");
  assert.deepEqual([cuantas(k3, "debe"), cuantas(k3, "haber")], [3, 1]);
  const s3 = L.sumas(k3.lineas, k3.correcta); assert.equal(s3.debe, s3.haber);
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
  /* Renglón duplicado (E2): una cuenta dos veces, del mismo lado, y la diferencia es un renglón. */
  const e2 = caso("cpv-e2");
  const [a, b] = e2.linea.map((k) => e2.lineas[k]);
  assert.deepEqual([a.cuenta, a.lado, a.monto], [b.cuenta, b.lado, b.monto]);
  assert.equal(dif(e2), a.monto);
  /* Juzgar y encontrar traen el hecho arriba (H3); completar no lo necesita. */
  for (const c of D.CUADRA_POR_VALOR.casos) assert.equal(Boolean(c.hecho), c.tipo !== "completar", `${c.id}: hecho`);
});

test("★★★ Del diario al mayor: tope de Watari, 5 destino y 2 origen, y cada opción mala da su plantilla de Near con el nombre puesto", () => {
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
    assert.deepEqual(caso.items.map((i) => i.tipo), ["destino", "destino", "destino", "destino", "destino", "origen", "origen"]);
    /* Los destino van en orden de fecha, como en el diario: renglón 0, 1, 2… */
    assert.deepEqual(caso.items.filter((i) => i.tipo === "destino").map((i) => i.renglon), [0, 1, 2, 3, 4]);
    /* El cierre dice las sumas de verdad. */
    const tot = (lado) => renglones.filter((r) => r.lado === lado).reduce((s, r) => s + r.monto, 0);
    assert.equal(tot("debe"), tot("haber"));
    assert.ok(caso.cierre.includes(`${pesos(tot("debe"))} en el debe y ${pesos(tot("haber"))} en el haber`));

    for (const it of caso.items) {
      const item = { ...it, caso };
      const r = renglones[it.renglon];
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
  assert.equal(L.evaluarDiario({ ...b.items[5], caso: b }, 1).textos[0], "Ese renglón es de Cuentas por pagar, pero del 8 de enero. Mira la fecha de la línea del mayor.");
  assert.equal(L.evaluarDiario({ ...b.items[6], caso: b }, 2).textos[0], "Ese renglón es del mismo día, pero de Muebles y enseres. La línea del mayor es de Bancos.");
  /* Se alternan por intento (D8). */
  assert.equal(L.prepararDiario((xs) => xs, "ddm-a")[0].caso.id, "ddm-b");
  assert.equal(L.prepararDiario((xs) => xs, "ddm-b")[0].caso.id, "ddm-a");
  /* Los origen van al final, barajados entre ellos. */
  const alReves = L.prepararDiario((xs) => [...xs].reverse(), "ddm-b");
  assert.deepEqual(alReves.map((i) => i.id), ["ddm-a-1", "ddm-a-2", "ddm-a-3", "ddm-a-4", "ddm-a-5", "ddm-a-7", "ddm-a-6"]);
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
  /* «Costo de ventas», como en T2, y nominal. */
  assert.equal(de("Costo de ventas").clase, "nominal");
  assert.ok(!cuentas.some((c) => /mercanc[ií]a vendida/i.test(c.nombre)));
  /* 2 ingresos, 1 gasto, 1 costo, 4 reales con un pasivo (Near). */
  const cuantas = (f) => cuentas.filter((c) => c.familia === f).length;
  assert.deepEqual([cuantas("ingreso"), cuantas("gasto"), cuantas("costo"), cuentas.filter((c) => c.clase === "real").length, cuantas("pasivo")], [2, 1, 1, 4, 1]);
  /* La utilidad del texto final sale de los datos. */
  assert.equal(L.utilidadDe(cuentas), 10500);
  assert.ok(D.LAS_QUE_VUELVEN_A_CERO.textoFinal.includes(pesos(L.utilidadDe(cuentas))));
  assert.equal(D.consignaCero(de("Caja")), "Llega el cierre de 20X1. ¿Qué pasa con Caja?");
});

/* ═══════════════════════ 8.º · CUADRA POR VALOR, JUGADA ═══════════════════════ */

const textosRetro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((n) => n.textContent);
const caso = (id) => D.CUADRA_POR_VALOR.casos.find((c) => c.id === id);

test("★★★ Cuadra por valor jugada: tres tipos, un intento, consecuencia antes del veredicto, puntaje y detalle", () => {
  const items = L.prepararCuadra();
  assert.deepEqual(items.map((c) => c.tipo), ["completar", "completar", "completar", "juzgar", "juzgar", "encontrar", "encontrar", "encontrar"]);
  const { caja, llamadas, desmontar } = montar(CuadraPorValor, { items });

  /* K1, MAL: 1.500.000 en Cuentas por pagar. La columna creció mientras se escribía. */
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.t2Cuadra, "completar");
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.OBJETIVO_T2_NUEVAS["cu-cuadra-por-valor"]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.completar);
  const input = caja.querySelector("input");
  escribir(input, "1.500.000");
  assert.equal(caja.querySelector('[data-total="haber"]').textContent, "$2.250.000", "la columna no crece con lo escrito");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Faltan $750.000 en el debe: las dos columnas no llegan a la misma altura.");
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "desigual");
  assert.match(caja.querySelector("[data-iba]").textContent, /Iba aquí: \$750\.000/);
  assert.deepEqual(textosRetro(caja), [caso("cpv-k1").distractores[0].retro]);
  assert.ok(input.disabled, "un solo intento: el campo se bloquea");
  assert.equal(boton(caja, "Comprobar"), undefined);
  /* La consecuencia va ANTES que el veredicto (C4). */
  const orden = [...caja.querySelectorAll("[data-consecuencia], [data-retro]")].map((n) => (n.hasAttribute("data-retro") ? "retro" : "consecuencia"));
  assert.deepEqual(orden, ["consecuencia", "retro"]);
  assert.equal(caja.querySelector("[data-pie]").textContent, "Basado en el libro");
  siguiente(caja);

  /* K2, BIEN: 500 para Bancos. */
  escribir(caja.querySelector("input"), "500");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "igual");
  assert.equal(caja.querySelector('[data-conteo="debe"]').textContent, "1 cuenta · $2.500");
  assert.equal(caja.querySelector('[data-conteo="haber"]').textContent, "2 cuentas · $2.500");
  assert.deepEqual(textosRetro(caja), [caso("cpv-k2").porque]);
  siguiente(caja);
  /* K3, BIEN: 3 contra 1. */
  escribir(caja.querySelector("input"), "8000");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector('[data-conteo="debe"]').textContent, "3 cuentas · $8.000");
  siguiente(caja);

  /* J1: el hecho arriba; antes de responder no hay columnas ni sumas (serían la respuesta). */
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.juzgar);
  assert.equal(caja.querySelector("[data-hecho]").textContent, caso("cpv-j1").hecho);
  assert.equal(caja.querySelector("[data-columnas]"), null);
  clic(caja.querySelector('[data-opcion="no-cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "correcta");
  assert.ok(caja.querySelector("[data-columnas]"));
  assert.match(caja.querySelector("[data-consecuencia]").textContent, /Faltan \$1\.000\.000 en el debe/);
  siguiente(caja);
  /* J2, MAL: «Cuadra». */
  clic(caja.querySelector('[data-opcion="cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "incorrecta");
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "revelada");
  assert.match(caja.querySelector("[data-consecuencia]").textContent, /Faltan \$27\.000 en el haber/);
  assert.deepEqual(textosRetro(caja), [caso("cpv-j2").retroMala, caso("cpv-j2").porque]);
  siguiente(caja);

  /* E1: Bancos (línea 1) es la que descuadra. */
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_CUADRA.encontrar);
  clic(caja.querySelector('[data-linea="1"] button'));
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "correcta");
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "libre", "un intento: el segundo toque no cuenta");
  siguiente(caja);
  /* E2: se acepta la SEGUNDA de Local comercial. */
  clic(caja.querySelector('[data-linea="1"] button'));
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "correcta");
  siguiente(caja);
  /* E3, MAL: Cuentas por pagar. Las dos repetidas no, pero Bancos sí queda revelada. */
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "incorrecta");
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "revelada");
  assert.deepEqual(textosRetro(caja), [caso("cpv-e3").retros[0], caso("cpv-e3").porque]);
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 5) / 8);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["cpv-k1", false, "1500000"], ["cpv-k2", true, null], ["cpv-k3", true, null],
    ["cpv-j1", true, null], ["cpv-j2", false, "cuadra"],
    ["cpv-e1", true, null], ["cpv-e2", true, null], ["cpv-e3", false, "0"],
  ]);
  for (const c of D.CUADRA_POR_VALOR.casos) assert.ok(etiquetaDeItem("cu-cuadra-por-valor", c.id), `${c.id} sin etiqueta docente`);
  assert.equal(etiquetaDeItem("cu-cuadra-por-valor", "cpv-e2"), "Línea que descuadra: Local comercial, Aportes sociales");
  desmontar();
});

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR, JUGADA ═══════════════════════ */

test("★★★ Del diario al mayor jugada: destino y origen, el error se queda a la vista, el selector no califica, el cierre se lee y la otra tanda juega el otro caso", () => {
  const items = L.prepararDiario();
  const caso = items[0].caso;
  assert.equal(caso.id, "ddm-a");
  const { caja, llamadas, desmontar } = montar(DelDiarioAlMayor, { items });

  /* destino, MAL: el depósito a Acciones (la misma cifra: C). */
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.OBJETIVO_T2_NUEVAS["cu-del-diario-al-mayor"]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_DIARIO.destino);
  assert.equal(caja.querySelector("[data-marcado]").dataset.renglon, "0");
  assert.equal(caja.querySelector("[data-selector-vista]"), null);
  clic(caja.querySelector('[data-cuenta-destino="Acciones"]'));
  assert.deepEqual(textosRetro(caja), ["Así, Acciones se queda con un valor solo porque la cifra es igual. Busca la cuenta, no el número."]);
  const acciones = caja.querySelector('[data-cuenta-destino="Acciones"]');
  assert.match(acciones.style.border, /solid/);
  assert.equal(acciones.querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.equal(caja.querySelector('[data-cuenta-destino="Bancos"] [data-pastilla]').dataset.pastilla, "revelada");
  assert.match(acciones.textContent, /\$5\.000/, "la ficha no se queda en la cuenta equivocada");
  assert.ok(caja.querySelector('[data-cuenta-destino="Bancos"]').disabled, "un solo intento");
  siguiente(caja);
  /* Bien o mal, el renglón queda en su cuenta correcta. */
  assert.match(caja.querySelector('[data-cuenta-t="Bancos"]').textContent, /\$5\.000/);
  assert.doesNotMatch(caja.querySelector('[data-cuenta-t="Acciones"]').textContent, /\$5\.000/);

  /* destino, BIEN, y el selector aparece y reordena sin calificar. */
  for (const c of ["Acciones", "Flota y equipo de transporte", "Bancos", "Letras por pagar"]) {
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

  /* origen 6: los $800 del haber de Bancos. Se toca el depósito del 2 de enero (oA). */
  assert.equal(caja.querySelector("[data-t2-diario]").dataset.t2Diario, "origen");
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.CONSIGNAS_DIARIO.origen);
  clic(caja.querySelector('[data-opcion-renglon="0"] button'));
  assert.deepEqual(textosRetro(caja), ["Ese renglón es de Bancos, pero del 2 de enero. Mira la fecha de la línea del mayor."]);
  assert.equal(caja.querySelector('[data-opcion-renglon="3"] button').dataset.estado, "revelada");
  siguiente(caja);
  /* origen 7, BIEN, y el cierre del caso se lee sin calificar. */
  clic(caja.querySelector('[data-opcion-renglon="0"] button'));
  assert.deepEqual(textosRetro(caja), [caso.items[6].porque, caso.cierre]);
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 5) / 7);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok]), [
    ["ddm-a-1", false], ["ddm-a-2", true], ["ddm-a-3", true], ["ddm-a-4", true], ["ddm-a-5", true], ["ddm-a-6", false], ["ddm-a-7", true],
  ]);
  assert.equal(detalle[0].respuesta, "Acciones");
  assert.equal(detalle[5].respuesta, "0");
  for (const c of D.DEL_DIARIO_AL_MAYOR.casos) for (const it of c.items) assert.ok(etiquetaDeItem("cu-del-diario-al-mayor", it.id), `${it.id} sin etiqueta docente`);
  desmontar();

  /* Sin `items`, la tanda la sortea el componente: «Otra tanda» juega el otro caso (D8). */
  const otra = montar(DelDiarioAlMayor, {});
  const primero = otra.caja.querySelector("[data-item]").dataset.item.slice(0, 5);
  for (let k = 0; k < 7; k += 1) {
    const destino = otra.caja.querySelector("[data-cuenta-destino]");
    clic(destino ?? otra.caja.querySelector("[data-opcion-renglon] button"));
    siguiente(otra.caja);
  }
  clic(boton(otra.caja, "Otra tanda"));
  const segundo = otra.caja.querySelector("[data-item]").dataset.item.slice(0, 5);
  assert.notEqual(segundo, primero, "la otra tanda repitió el caso");
  otra.desmontar();
});

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO, JUGADA ═══════════════════════ */

test("★★★ Las que vuelven a cero jugada: binaria, ceja de escenario, el error en el año siguiente y la utilidad al cerrar", () => {
  const items = L.prepararCero();
  for (const c of items) assert.ok(["real", "nominal"].includes(c.clase), `${c.id} sin clase`);
  assert.deepEqual([...new Set(items.map((c) => L.subtemaDeCuenta(c)))].sort(),
    ["Clasificación de cuentas nominales", "Clasificación de cuentas reales"]);
  const { caja, llamadas, desmontar } = montar(LasQueVuelvenACero, { items });

  /* Ingresos por servicios (nominal) pasada con su saldo: 20X2 la muestra con $12.000 y borde coral. */
  const primera = items[0];
  assert.equal(caja.querySelector("[data-t2-cero]").dataset.clase, "nominal");
  assert.equal(caja.querySelector("[data-ceja]").textContent, "Escenario simulado");
  assert.equal(caja.querySelector("[data-consigna]").textContent, "Llega el cierre de 20X1. ¿Qué pasa con Ingresos por servicios?");
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
  assert.deepEqual(textosRetro(caja), [items.at(-1).porque, D.LAS_QUE_VUELVEN_A_CERO.textoFinal]);
  siguiente(caja);

  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 7) / 8);
  assert.deepEqual(detalle[0], { item: "lvc-ingresos-servicios", ok: false, intentos: 1, respuesta: "pasa", orden: 1 });
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
    desmontar();
  }
});

test("★★ lo que no es de Near sigue marcado, en comentario y nunca en pantalla; lo de Near ya no lleva marca", () => {
  const datos = readFileSync("src/data/contabilidadT2HacerNuevas.js", "utf8");
  /* Tres marcas: la consigna de «Así se juega» de 1.3, los pies de fuente y el porqué de origen. */
  assert.equal(datos.split(MARCA).length - 1, 3, "las marcas de muestra de los datos no son las tres que quedan");
  assert.ok(readFileSync("src/data/asiSeJuegaT2Nuevas.js", "utf8").includes(MARCA), "«Así se juega» es de muestra y perdió su marca");
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
