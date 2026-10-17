import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 «La caja» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a1-v6-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · el cajón operable de Hanayama: cobrar, mandar la consignación al lado
 *     que se cree, sacar la plata por cada salida, decidir con los cheques y
 *     encender los controles. La figura cambia con cada acción
 *   · en el error no se escribe nada y se puede probar otra vez; el asiento 2
 *     sale solo con el acierto. Mientras se pregunta, nada de la devolución
 *     está en el DOM (PH8-2, con textContent y outerHTML)
 *   · el control 7 (caja menor) enciende Bancos, no «Pago en efectivo»
 *     (corte de Yujiro: el fondo se abre y se repone con cheque de Bancos)
 *   · el acierto con ✓ y borde blanco; teal y ámbar solo en «Debe» y «Haber»
 *   · Aprender: sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const A = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");
const { pantallasDe, seccionDe, renglones, textoDe, fusionB } = await import("./t4-rediseno-canon.mjs");

const CANON = "d4-t4-a1-v6-rediseno.md";
const PAQ = leer(`${PAQUETES}${CANON}`);
const CANON_P = pantallasDe(PAQ);
const P = A.PIEZA_LA_CAJA;
const pantalla = (id) => P.pantallas.find((p) => p.id === id);
const ERR = { [A.DEBE]: "Error si va al debe", [A.HABER]: "Error si va al haber", [A.NO_SE_MUEVE]: "Error si va a «Caja no se mueve»" };

/* Lo que la pantalla de los datos dice, por lugar del paquete. */
function porLugar(p) {
  const r = [];
  for (const t of p.antes ?? []) r.push(["Antes de la figura", t]);
  for (const t of p.despues ?? []) r.push(["Después de la figura", t]);
  if (p.tarjeta) r.push(["Tarjeta del origen", p.tarjeta]);
  for (const o of p.tipo === "faltante" ? p.opciones : []) r.push([`Tarjeta · ${o}${o === p.correcta ? " (la correcta)" : ""}`, p.tarjetas[o]]);
  if ("acierto" in p) r.push(["Acierto (tras «Correcto.»)", p.acierto]);
  for (const [d, t] of Object.entries(p.errores ?? {})) r.push([p.tipo === "faltante" ? `Error · ${d} (✗ y el texto)` : ERR[d], t]);
  if (p.tipo === "cheques") {
    for (const c of A.CHEQUES_A1) {
      r.push([`Cheque «${c.id}» · tarjeta`, c.tarjeta], [`Cheque «${c.id}» · acierto (tras «Correcto.»)`, c.acierto]);
      for (const [d, t] of Object.entries(c.errores)) r.push([`Cheque «${c.id}» · ${ERR[d].toLowerCase()}`, t]);
    }
  }
  if (p.cierre) r.push(["Frase de cierre (con los siete encendidos, debajo del cajón)", p.cierre]);
  if (p.siguiente) r.push(["Siguiente", p.siguiente]);
  r.push(["Pie", p.pie]);
  return r;
}

/* Las dos preguntas, bien: la consignación al haber; el cheque recibido al debe y, 1,4 s después, el propio a la bandeja. */
async function acertar(m, p) {
  if (p.tipo === "consigna") tocar(m.caja.querySelector(`[data-destino="${A.HABER}"]`));
  if (p.tipo === "cheques") {
    tocar(m.caja.querySelector(`[data-destino="${A.DEBE}"]`));
    await esperar(A.ESPERA_CHEQUE_MS + 100);
    tocar(m.caja.querySelector(`[data-destino="${A.NO_SE_MUEVE}"]`));
  }
  if (p.tipo === "faltante") tocar(m.caja.querySelector(`[data-opcion="${p.correcta}"]`));
}

/* Monta la pieza y avanza hasta la pantalla `id`; las preguntas del camino se aciertan. */
async function abrir(id) {
  const k = P.pantallas.findIndex((p) => p.id === id);
  const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
  for (let i = 0; i < k; i++) {
    if (P.pantallas[i].pregunta) await acertar(m, P.pantallas[i]);
    tocar(m.caja.querySelector('[data-boton="seguir"]'));
  }
  assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, id);
  return m;
}
const q = (m, sel) => m.caja.querySelector(sel);
const lineas = (m, lado) => [...m.caja.querySelectorAll(`[data-columna="${lado}"] [data-linea]`)].map((x) => x.textContent);
const saldo = (m) => q(m, "[data-saldo]")?.dataset.saldo ?? null;
const vivos = (m) => [...m.caja.querySelectorAll(".t4cv-vivo")].map((x) => x.dataset.trazo).sort();
const luces = (m) => [...m.caja.querySelectorAll("[data-figura] [data-luz]")].map((x) => x.dataset.caja2 ?? (x.matches("[data-cajon]") ? "cajon" : x.matches("[data-saldo]") ? "saldo" : x.dataset.columna)).sort();

/* D2: el objetivo, bajo el título en la P0 (la prueba es la misma para A0-A5). */
const { pruebaObjetivo } = await import("./t4-aprender-rd.mjs");
pruebaObjetivo({ P, canon: CANON });

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v6) y lo dice, con la decisión del control 7; los datos lo nombran", async () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de A1\.\*\*/);
  assert.match(PAQ, /\*\*el control 7 \(caja menor\) enciende Bancos\*\*/);
  assert.match(leer("src/data/contabilidadT4.js"), new RegExp(CANON.replace(/\./g, "\\.")));
});

test("★★★ las 7 pantallas, en el orden del paquete (lote B: sale el resumen en lista; la P5 de antes se parte en «el-faltante» y «controles»); título e id; todas con el cajón", async () => {
  assert.equal(P.id, "t4-a1-la-caja");
  assert.equal(P.titulo, "La caja");
  assert.deepEqual(P.pantallas.map((p) => p.id), CANON_P.map((p) => p.id));
  assert.equal(P.pantallas.length, 7);
  assert.ok(!P.pantallas.some((p) => p.id === "resumen" || p.resumen), "queda una pantalla de resumen (capa 4)");
  for (const p of P.pantallas) assert.equal(p.figura, "cajon", p.id);
});

for (const c of CANON_P) {
  test(`★★★ ${c.id}: cada texto es el del paquete, letra por letra y en su lugar, ni uno más ni uno menos`, async () => {
    assert.deepEqual(porLugar(pantalla(c.id)), c.textos.map((x) => [x.lugar, x.texto]));
  });
}

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y da lo que dice el paquete", async () => {
  for (const c of CANON_P) {
    for (const x of c.textos.filter((y) => y.medida)) {
      const r = inflesz(x.texto);
      if (r.aplica) {
        assert.ok(r.valor >= 65, `${c.id} · ${x.lugar}: ${r.valor}`);
        assert.equal(x.medida, r.valor.toFixed(1).replace(".", ","), `${c.id} · ${x.lugar}`);
      } else assert.equal(x.medida, "<10", `${c.id} · ${x.lugar}`);
    }
  }
});

test("★★★ la interfaz común: «Correcto.», «Incorrecto.» solo para el lector, y las tres marcas con palabra", async () => {
  const com = renglones(seccionDe(PAQ, "Interfaz común del rediseño (A0, A1 y H1)"));
  assert.deepEqual(A.PALABRA, { ok: textoDe(com, "Palabra del acierto (va antes del texto)"), error: null });
  assert.equal(A.LECTOR_ERROR, textoDe(com, "Solo para el lector de pantalla, delante del texto del error"));
  assert.deepEqual(`✓ ${A.MARCA.bien}`, textoDe(com, "Marca del destino acertado"));
  assert.deepEqual(`✗ ${A.MARCA.mal}`, textoDe(com, "Marca del destino mal elegido"));
  assert.deepEqual(A.MARCA.era, textoDe(com, "Marca del destino que era"));
});

test("★★★ los dos asientos de la p. 180 cuadran; la única cifra del libro es 435.000 (los 25.000 y 410.000 de P5 son del escenario simulado, y su pie lo dice)", async () => {
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado, l.monto]);
  assert.deepEqual(filas(A.ASIENTO_COBRO), [["Caja", A.DEBE, 435_000], ["Ingresos por servicios", A.HABER, 435_000]]);
  assert.deepEqual(filas(A.ASIENTO_CONSIGNACION), [["Bancos", A.DEBE, 435_000], ["Caja", A.HABER, 435_000]]);
  assert.equal(pantalla("cobra").asiento, A.ASIENTO_COBRO);
  assert.equal(pantalla("consigna").asiento, A.ASIENTO_CONSIGNACION);
  const cifrasDe = (cs) => cs.flatMap((c) => c.textos.map((x) => x.texto)).flatMap((t) => [...t.matchAll(/\$?\d{1,3}(?:\.\d{3})+/g)].map((x) => x[0]));
  assert.deepEqual([...new Set(cifrasDe(CANON_P))], ["$435.000"]);
  assert.equal(textoDe(renglones(seccionDe(PAQ, "El cajón en P5 y P6")), "Junto al tubo de entrada (P5)"), "25.000 sin anotar");
  assert.match(pantalla("el-faltante").pie, / · Escenario simulado$/);
  assert.equal(A.SUS_SERVICIOS - A.ANOTADO_A1, 25_000);
  assert.equal(A.SIN_ANOTAR_A1, 25_000);
});

/* ═══════════ 2 · LA PANTALLA Y EL CAJÓN ═══════════ */

test("★★★ cada pantalla, en el orden de Hanayama: antes → cajón → después → frase de cierre → siguiente → «Seguir» → pie (en las preguntas, tras el acierto)", async () => {
  const m = await abrir("dos-cuentas");
  try {
    for (const [k, p] of P.pantallas.entries()) {
      const zona = q(m, "[data-pieza]");
      assert.equal(zona.dataset.pantalla, p.id);
      if (p.pregunta) {
        assert.equal(zona.querySelector('[data-boton="seguir"]'), null, `${p.id}: «Seguir» antes del acierto`);
        await acertar(m, p);
      }
      if (p.tipo === "controles") A.CONTROLES_A1.forEach((_, i) => tocar(zona.querySelector(`[data-control="${i + 1}"]`)));
      const orden = [...zona.querySelectorAll("[data-texto], [data-figura], [data-boton], [data-pie]")]
        .filter((e) => !e.parentElement.closest("[data-figura]"))
        .map((e) => (e.matches("[data-figura]") ? "FIGURA" : e.matches("[data-boton]") ? "SEGUIR" : e.matches("[data-pie]") ? "PIE" : e.textContent));
      const esperado = [...(p.antes ?? []), "FIGURA", ...(p.despues ?? []), ...(p.cierre ? [p.cierre] : []), ...(p.siguiente ? [p.siguiente] : []), ...(k < 6 ? ["SEGUIR"] : []), "PIE"];
      assert.deepEqual(orden, esperado, p.id);
      if (k < 6) tocar(zona.querySelector('[data-boton="seguir"]'));
    }
  } finally { m.desmontar(); }
});

test("★★★ D7 · en las tres pantallas con pregunta, «Seguir» no aparece sin el acierto: ni al llegar, ni tras cada error, ni con un solo cheque; la última (controles) no lo lleva", async () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pregunta).map((p) => p.id), ["consigna", "cheques", "el-faltante"]);
  const seguir = (m) => q(m, '[data-boton="seguir"]');
  const c = await abrir("consigna");
  try {
    assert.equal(seguir(c), null, "consigna, al llegar");
    for (const d of [A.DEBE, A.NO_SE_MUEVE]) {
      tocar(q(c, `[data-destino="${d}"]`));
      assert.equal(q(c, "[data-mensaje]").dataset.mensaje, "error");
      assert.equal(seguir(c), null, `consigna, tras el error en ${d}`);
    }
    tocar(q(c, `[data-destino="${A.HABER}"]`));
    assert.ok(seguir(c), "consigna: tras el acierto no aparece «Seguir»");
  } finally { c.desmontar(); }
  const k = await abrir("cheques");
  try {
    assert.equal(seguir(k), null, "cheques, al llegar");
    tocar(q(k, `[data-destino="${A.HABER}"]`));
    assert.equal(seguir(k), null, "cheques, tras el error");
    tocar(q(k, `[data-destino="${A.DEBE}"]`));
    assert.equal(seguir(k), null, "cheques, con el primero bien y el segundo sin responder");
    await esperar(A.ESPERA_CHEQUE_MS + 100);
    tocar(q(k, `[data-destino="${A.DEBE}"]`));
    assert.equal(seguir(k), null, "cheques, tras el error del segundo");
    tocar(q(k, `[data-destino="${A.NO_SE_MUEVE}"]`));
    assert.ok(seguir(k), "cheques: tras los dos aciertos no aparece «Seguir»");
    tocar(seguir(k));
    assert.equal(q(k, "[data-pieza]").dataset.pantalla, "el-faltante");
    assert.equal(seguir(k), null, "el-faltante, al llegar");
    for (const o of ["arqueo", "poliza"]) {
      tocar(q(k, `[data-opcion="${o}"]`));
      assert.equal(seguir(k), null, `el-faltante, tras el error con ${o}`);
    }
    tocar(q(k, '[data-opcion="separar"]'));
    assert.ok(seguir(k), "el-faltante: tras el acierto no aparece «Seguir»");
    tocar(seguir(k));
    assert.equal(q(k, "[data-pieza]").dataset.pantalla, "controles");
    A.CONTROLES_A1.forEach((_, i) => tocar(q(k, `[data-control="${i + 1}"]`)));
    assert.equal(seguir(k), null, "controles es la última: sin «Seguir»");
  } finally { k.desmontar(); }
});

test("★★★ P0: el cajón con sus rótulos (Caja, Debe, Haber, Bancos, Pago en efectivo) y la glosa de cada cuenta bajo su nombre, sin acción ni cifra", async () => {
  const m = await abrir("dos-cuentas");
  try {
    const zona = q(m, "[data-pieza] .t4r");
    assert.ok(zona.firstElementChild.matches("[data-figura]"), "P0 no abre con el cajón (capa 1)");
    const fig = q(m, "[data-figura=cajon]");
    assert.equal(fig.querySelector("button"), null);
    assert.equal(visible(fig), "Cajaa la mano, como tu billeteraDebeHaberBancosen el bancoPagoen efectivo");
    assert.match(fig.querySelector("figcaption").textContent, /cajón de paso/);
  } finally { m.desmontar(); }
});

test("★★★ P0, las glosas del cajón: las del paquete, letra por letra, bajo «Caja» y bajo «Bancos»; solo en P0", async () => {
  const g = renglones(seccionDe(PAQ, "Glosas del cajón (P0)"));
  assert.deepEqual(g.map((x) => [x.lugar, x.texto]), [["Bajo «Caja»", A.FIGURA_CAJON.glosaCaja.join(" ")], ["Bajo «Bancos»", A.FIGURA_CAJON.glosaBancos.join(" ")]]);
  const m = await abrir("dos-cuentas");
  try {
    const caja = q(m, "[data-glosa-cuenta=caja]");
    const bancos = q(m, "[data-glosa-cuenta=bancos]");
    assert.equal(caja.textContent, g[0].texto);
    assert.equal(bancos.textContent, g[1].texto);
    assert.ok(caja.previousElementSibling.textContent.startsWith("Caja"), "la glosa no va bajo «Caja»");
  } finally { m.desmontar(); }
  for (const p of P.pantallas.slice(1)) assert.ok(!p.glosasCuenta, `${p.id} lleva glosas`);
});

test("★★★ P1 «Cobrar»: el tubo se enciende, 435.000 entra al Debe, «En la caja» va a 435.000 y sale el asiento 1", async () => {
  const m = await abrir("cobra");
  try {
    assert.deepEqual([lineas(m, A.DEBE), saldo(m), vivos(m)], [[], "0", []]);
    assert.equal(q(m, "[data-asiento]"), null, "el asiento 1 está antes de cobrar");
    assert.equal(q(m, "[data-origen] .t4cv-rot").textContent, A.FIGURA_CAJON.rotuloOrigen);
    tocar(q(m, "[data-accion=cobrar]"));
    assert.deepEqual([lineas(m, A.DEBE), saldo(m), vivos(m)], [["435.000"], "435000", ["entrada"]]);
    assert.equal(q(m, "[data-asiento]").dataset.asiento, A.ASIENTO_COBRO.nombre);
  } finally { m.desmontar(); }
});

test("★★★ P2 consigna: mientras pregunta, nada de la respuesta en el DOM; cada error con SU texto, sin escribir nada; el acierto saca la plata a Bancos", async () => {
  const p = pantalla("consigna");
  const m = await abrir("consigna");
  try {
    const zona = q(m, "[data-pieza]");
    for (const x of [...Object.values(p.errores), "Correcto.", "Incorrecto.", A.ASIENTO_CONSIGNACION.nombre]) {
      assert.ok(!zona.textContent.includes(x) && !zona.outerHTML.includes(x), `«${x}» está en el DOM antes de responder`);
    }
    for (const d of [A.DEBE, A.NO_SE_MUEVE]) {
      tocar(q(m, `[data-destino="${d}"]`));
      const msg = q(m, "[data-mensaje]");
      assert.equal(msg.dataset.mensaje, "error", d);
      assert.equal(visible(msg), p.errores[d], d);
      assert.equal(msg.querySelector(".t4f-sr").textContent.trim(), "Incorrecto.");
      assert.equal(q(m, `[data-destino="${d}"]`).dataset.marca, "mal");
      assert.ok(CORAL.test(w.getComputedStyle(q(m, `[data-destino="${d}"]`)).borderTopColor), `${d}: el error no va en coral`);
      /* No se escribe nada: el Haber sigue vacío, la caja en 435.000, sin asiento; los destinos siguen activos. */
      assert.deepEqual([lineas(m, A.HABER), saldo(m), q(m, "[data-asiento]")], [[], "435000", null], d);
      assert.equal(q(m, `[data-destino="${A.HABER}"]`).disabled, false);
    }
    tocar(q(m, `[data-destino="${A.HABER}"]`));
    const msg = q(m, "[data-mensaje]");
    assert.equal(msg.dataset.mensaje, "acierto");
    assert.equal(visible(msg), "Correcto.");
    assert.deepEqual([lineas(m, A.HABER), saldo(m), vivos(m), q(m, "[data-monto=bancos]").textContent], [["435.000"], "0", ["a-bancos", "cruce", "salida"], "435.000"]);
    assert.equal(q(m, "[data-asiento]").dataset.asiento, A.ASIENTO_CONSIGNACION.nombre);
    assert.equal(q(m, `[data-destino="${A.HABER}"]`).dataset.marca, "bien");
    for (const d of [A.DEBE, A.HABER, A.NO_SE_MUEVE]) assert.equal(q(m, `[data-destino="${d}"]`).disabled, true);
  } finally { m.desmontar(); }
});

test("★★★ P3 las dos salidas: «Consignar» y «Pagar» sacan la plata por el Haber; «Otra vez» deja probar la otra", async () => {
  const m = await abrir("dos-salidas");
  try {
    assert.deepEqual([lineas(m, A.DEBE), saldo(m)], [["435.000"], "435000"]);
    tocar(q(m, "[data-accion=consignar]"));
    assert.deepEqual([lineas(m, A.HABER), saldo(m), vivos(m), q(m, "[data-monto=bancos]")?.textContent, q(m, "[data-monto=pago]")], [["435.000"], "0", ["a-bancos", "cruce", "salida"], "435.000", null]);
    tocar(q(m, "[data-accion=otra-vez]"));
    assert.deepEqual([lineas(m, A.HABER), saldo(m), vivos(m)], [[], "435000", []]);
    tocar(q(m, "[data-accion=pagar]"));
    assert.deepEqual([lineas(m, A.HABER), saldo(m), vivos(m), q(m, "[data-monto=pago]")?.textContent, q(m, "[data-monto=bancos]")], [["435.000"], "0", ["a-pago", "salida"], "435.000", null]);
  } finally { m.desmontar(); }
});

test("★★★ P4 los cheques: errores con su texto; el recibido entra al Debe; 1,4 s después llega el propio, que va a la bandeja y enciende Bancos", async () => {
  const m = await abrir("cheques");
  try {
    const [rec, pro] = A.CHEQUES_A1;
    assert.equal(q(m, "[data-hecho]").textContent, rec.tarjeta);
    tocar(q(m, `[data-destino="${A.HABER}"]`));
    assert.equal(visible(q(m, "[data-mensaje]")), rec.errores[A.HABER]);
    tocar(q(m, `[data-destino="${A.DEBE}"]`));
    assert.equal(visible(q(m, "[data-mensaje]")), `Correcto. ${rec.acierto}`);
    assert.deepEqual(lineas(m, A.DEBE), ["cheque"]);
    await esperar(A.ESPERA_CHEQUE_MS + 100);
    assert.equal(q(m, "[data-hecho]").textContent, pro.tarjeta);
    assert.equal(q(m, "[data-mensaje]"), null, "la devolución del primero sigue con el segundo");
    tocar(q(m, `[data-destino="${A.HABER}"]`));
    assert.equal(visible(q(m, "[data-mensaje]")), pro.errores[A.HABER]);
    tocar(q(m, `[data-destino="${A.NO_SE_MUEVE}"]`));
    assert.equal(visible(q(m, "[data-mensaje]")), `Correcto. ${pro.acierto}`);
    assert.match(q(m, "[data-bandeja]").textContent, /cheque propio/);
    assert.deepEqual(luces(m), ["bancos"]);
    for (const d of [A.DEBE, A.HABER, A.NO_SE_MUEVE]) assert.equal(q(m, `[data-destino="${d}"]`).disabled, true);
  } finally { m.desmontar(); }
});

const CAJON_P = renglones(seccionDe(PAQ, "El cajón en P5 y P6"));

test("★★★ P5 «el-faltante», al llegar: el cajón sin salidas ni glosas, con lo cobrado (435.000) arriba, 410.000 en el Debe y en la caja y «25.000 sin anotar» junto al tubo, en neutro; tres tarjetas apiladas, sin marca; nada de la devolución en el DOM", async () => {
  const p = pantalla("el-faltante");
  const m = await abrir("el-faltante");
  try {
    assert.equal(q(m, "[data-monto=origen]").textContent, "435.000");
    assert.deepEqual([lineas(m, A.DEBE), lineas(m, A.HABER), saldo(m)], [["410.000"], [], "410000"]);
    assert.equal(q(m, "[data-caja2]"), null, "el cajón lleva salidas");
    assert.equal(q(m, ".t4cv-glosa, .t4cv-glosa-c"), null, "el cajón lleva glosas");
    assert.equal(q(m, "[data-control]"), null, "los controles van en la P6");
    const sin = q(m, "[data-figura] [data-sin-anotar]");
    assert.equal(sin.textContent, textoDe(CAJON_P, "Junto al tubo de entrada (P5)"));
    assert.equal(sin.closest('[aria-hidden="true"]'), null, "el lector no oye «25.000 sin anotar»");
    assert.equal(conColor(q(m, "[data-figura]"), CORAL).length, 0, "lo que no llegó al libro no es un error: sin coral");
    assert.deepEqual(luces(m), []);
    assert.deepEqual(vivos(m), []);
    const g = q(m, "[data-figura] .t4op-g[data-columna]");
    assert.ok(g, "las tarjetas no van apiladas dentro de la figura");
    assert.equal(g.style.gridTemplateColumns, "minmax(0, 1fr)");
    assert.deepEqual([...g.querySelectorAll("[data-opcion]")].map((b) => [b.dataset.opcion, b.querySelector("span").textContent]), p.opciones.map((o) => [o, p.tarjetas[o]]));
    for (const b of g.querySelectorAll("[data-opcion]")) assert.ok(b.querySelector(".t4op-hueco"), `${b.dataset.opcion}: sin el hueco reservado de la pastilla`);
    assert.equal(q(m, "[data-mensaje]"), null);
    assert.equal(q(m, ".t4r-marca"), null);
    const html = q(m, "[data-pieza]").outerHTML;
    for (const t of Object.values(p.errores)) assert.ok(!html.includes(t), `«${t}» en el DOM antes de responder`);
  } finally { m.desmontar(); }
});

test("★★★ P5 «el-faltante», el error: la tarjeta elegida con «No va aquí» dentro, su texto y nada escrito en el cajón; se puede reintentar; nunca «Iba aquí»", async () => {
  const p = pantalla("el-faltante");
  for (const o of ["arqueo", "poliza"]) {
    const m = await abrir("el-faltante");
    try {
      tocar(q(m, `[data-opcion="${o}"]`));
      const b = q(m, `[data-opcion="${o}"]`);
      assert.equal(b.dataset.marca, "mal");
      assert.equal(b.querySelector(".t4op-hueco .t4r-marca").dataset.marca, "mal");
      assert.equal(b.getAttribute("aria-label"), `${p.tarjetas[o]}: ${A.MARCA.mal}`);
      assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error");
      assert.equal(q(m, "[data-mensaje] [data-devolucion]").textContent, `${A.LECTOR_ERROR} ${p.errores[o]}`);
      assert.deepEqual([lineas(m, A.DEBE), saldo(m), luces(m), vivos(m)], [["410.000"], "410000", [], []], o);
      assert.equal(q(m, '[data-marca="era"]'), null, "«Iba aquí» en Aprender");
      for (const x of m.caja.querySelectorAll("[data-opcion]")) assert.equal(x.disabled, false, `${x.dataset.opcion}: no se puede reintentar`);
    } finally { m.desmontar(); }
  }
});

test("★★★ P5 «el-faltante», el acierto: «Correcto» dentro de la tarjeta, sin mensaje (Yujiro); se enciende lo que cuida la separación (el tubo de entrada y las columnas); luego «Seguir»", async () => {
  const p = pantalla("el-faltante");
  const m = await abrir("el-faltante");
  try {
    tocar(q(m, '[data-opcion="arqueo"]'));
    tocar(q(m, '[data-opcion="separar"]'));
    const b = q(m, '[data-opcion="separar"]');
    assert.equal(b.dataset.marca, "bien");
    assert.equal(b.querySelector(".t4op-hueco .t4r-marca").dataset.marca, "bien");
    assert.equal(b.getAttribute("aria-label"), `${p.tarjetas.separar}: ${A.MARCA.bien}`);
    assert.equal(q(m, '[data-opcion="arqueo"]').dataset.marca, undefined, "solo se marca la elegida");
    assert.equal(A.CONTROLES_A1[p.control - 1].rotulo, "Separación");
    assert.deepEqual(luces(m), ["debe", "haber"]);
    assert.deepEqual(vivos(m), ["entrada"]);
    assert.equal(q(m, "[data-mensaje]"), null, "el acierto lleva mensaje");
    assert.ok(q(m, '[data-boton="seguir"]'));
    for (const x of m.caja.querySelectorAll("[data-opcion]")) assert.equal(x.disabled, true);
  } finally { m.desmontar(); }
});

/* Los rótulos de los controles que van en una parte del cajón (P6). */
const controlesEn = (m, parte) => [...m.caja.querySelectorAll(`[data-figura] .t4cv-rc[data-parte="${parte}"] [data-control]`)].map((x) => x.textContent);

test("★★★ P6 «controles»: los siete controles del paquete, en orden, como botones en la parte que cuidan; el 7 (caja menor) en Bancos, no en el pago; el cajón entero, sin el caso", async () => {
  assert.deepEqual(A.CONTROLES_A1.map((c, i) => [`Control ${i + 1}`, c.rotulo]), CAJON_P.filter((x) => x.lugar.startsWith("Control ")).map((x) => [x.lugar, x.texto]));
  const m = await abrir("controles");
  try {
    const botones = [...m.caja.querySelectorAll("[data-figura] button[data-control]")].map((b) => [Number(b.dataset.control), b.textContent]).sort((a, b) => a[0] - b[0]);
    assert.deepEqual(botones, A.CONTROLES_A1.map((c, i) => [i + 1, c.rotulo]));
    assert.equal(m.caja.querySelectorAll("[data-figura] button[data-control]").length, 7);
    assert.deepEqual(controlesEn(m, "cols"), ["Registro diario", "Separación"]);
    assert.deepEqual(controlesEn(m, "bancos"), ["Consignación", "Caja menor"]);
    assert.deepEqual(controlesEn(m, "pago"), ["Tope de pagos"]);
    assert.deepEqual(controlesEn(m, "saldo"), ["Arqueo"]);
    assert.deepEqual(controlesEn(m, "cajon"), ["Póliza"]);
    assert.ok(q(m, '[data-caja2="bancos"] [data-control="7"]') && !q(m, '[data-caja2="pago"] [data-control="7"]'));
    assert.equal(q(m, "[data-sin-anotar]"), null);
    assert.equal(q(m, "[data-monto=origen]"), null);
    assert.equal(q(m, "[data-saldo]").dataset.saldo, "—");
    assert.deepEqual(luces(m), []);
  } finally { m.desmontar(); }
});

test("★★★ P6 «controles»: cada control enciende lo que cuida (el 7, Bancos y no el pago); no se califican; con los siete distintos, la frase de cierre debajo del cajón y «Siguiente», sin «Seguir»", async () => {
  const p = pantalla("controles");
  const m = await abrir("controles");
  try {
    assert.equal(q(m, "[data-cierre] .t4r-fantasma").textContent, p.cierre, "la frase de cierre no reserva su alto desde el principio");
    const esperado = [["cols"], ["bancos"], ["pago"], ["cols"], ["saldo"], ["cajon"], ["bancos"]];
    for (const [i, c] of A.CONTROLES_A1.entries()) {
      assert.ok(!q(m, "[data-cierre][data-visible]"), `la frase de cierre sale antes del séptimo (control ${i + 1})`);
      tocar(q(m, `[data-control="${i + 1}"]`));
      assert.equal(q(m, `[data-control="${i + 1}"]`).getAttribute("aria-pressed"), "true");
      assert.equal(m.caja.querySelectorAll('[data-control][aria-pressed="true"]').length, 1);
      const l = luces(m).map((x) => (x === "debe" || x === "haber" ? "cols" : x)).filter((x, j, xs) => xs.indexOf(x) === j);
      assert.deepEqual(l, esperado[i], `control ${i + 1}`);
      assert.deepEqual(vivos(m).filter((x) => !["cruce", "a-bancos", "a-pago"].includes(x)), c.vivo.filter((x) => x !== "bancos" && x !== "pago").sort(), `control ${i + 1}`);
      assert.equal(q(m, ".t4r-marca"), null, "un control se califica");
      assert.equal(q(m, "[data-mensaje]"), null);
    }
    assert.ok(!luces(m).includes("pago"), "el control 7 enciende «Pago en efectivo»");
    assert.equal(q(m, "[data-cierre][data-visible] > [aria-live]").textContent, p.cierre);
    assert.equal(q(m, "[data-siguiente][data-visible] > [aria-live]").textContent, p.siguiente);
    assert.equal(q(m, '[data-boton="seguir"]'), null);
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es ✓ y borde blanco; teal y ámbar solo en los rótulos «Debe» y «Haber» y en el asiento; coral solo en el error", async () => {
  const m = await abrir("consigna");
  try {
    tocar(q(m, `[data-destino="${A.HABER}"]`));
    const zona = q(m, "[data-pieza]");
    const tenidos = conColor(zona, TEAL_AMBAR).map((e) => e.textContent.trim());
    assert.deepEqual([...new Set(tenidos)].sort(), ["Debe", "Haber"]);
    assert.deepEqual(conColor(zona, CORAL), []);
    const haber = q(m, `[data-destino="${A.HABER}"]`);
    assert.equal(w.getComputedStyle(haber).borderTopColor, "rgb(248, 249, 250)");
  } finally { m.desmontar(); }
});

test("★★★ el cajón no usa piezas compartidas que pintan el acierto en teal (Opcion, ConstructorAsiento); el Responder teal, solo como botón de avance (Avance, en comun.jsx)", async () => {
  for (const f of ["src/components/t4/Cajon.jsx", "src/components/t4/LaCaja.jsx", "src/components/t4/comun.jsx"]) {
    const imports = leer(f).split("\n").filter((l) => /^import /.test(l)).join("\n");
    assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento)\b/, f);
    if (f.endsWith("comun.jsx")) assert.match(leer(f), /export function Avance[\s\S]*?<Responder onClick=\{onClick\}>/, "el Responder entra solo por Avance");
    else assert.doesNotMatch(imports, /\bResponder\b/, f);
  }
});

/* ═══════════ 3 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, ninguna migración la nombra, y ni la pieza ni sus datos llaman al motor", async () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === A.A1_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/data/contabilidadT4.js", "src/components/t4/LaCaja.jsx", "src/components/t4/Cajon.jsx", "src/components/t4/AnoEnMarcha.jsx"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(|onCompletar/, f);
  }
  /* Las pantallas de Aprender no reciben ni llaman a nada que registre: solo la vista, por los Hacer. */
  const vista = leer("src/components/ContabilidadT4View.jsx");
  const ini = vista.indexOf("T4 · LAS PANTALLAS DE APRENDER");
  const sig = vista.indexOf("\n * T4 · ", ini + 10);
  const pantallas = vista.slice(ini, sig < 0 ? undefined : sig);
  assert.ok(pantallas.length > 500, "no se encontró el bloque de las pantallas");
  assert.doesNotMatch(pantallas, /registrar|completar|otorgarFP|onCompletar/);
});

test("★★★ D9 · el cajón de A1 es un cajón: la manija bajo su base en todas las pantallas; se abre 4 px y vuelve con el cobro, la consignación y cada pago; con movimiento reducido no se mueve", async () => {
  const animados = [];
  const original = w.Element.prototype.animate;
  const mm = w.matchMedia;
  w.Element.prototype.animate = function (frames, opts) { animados.push({ el: this, frames, opts }); return { cancel() {} }; };
  const reducido = (v) => { w.matchMedia = (q) => ({ matches: v && /reduce/.test(q), addEventListener() {}, removeEventListener() {} }); };
  try {
    reducido(false);
    for (const p of P.pantallas) {
      const m = await abrir(p.id);
      try {
        const manija = q(m, "[data-cajon] > [data-manija]");
        assert.ok(manija, `${p.id}: sin manija`);
        assert.equal(manija.getAttribute("aria-hidden"), "true");
      } finally { m.desmontar(); }
    }
    animados.length = 0;
    const c = await abrir("cobra");
    try {
      assert.equal(q(c, "[data-cajon]").dataset.abre, "0");
      tocar(q(c, "[data-accion=cobrar]"));
      await esperar(0);
      assert.equal(q(c, "[data-cajon]").dataset.abre, "1");
      const a = animados.find((x) => x.el.matches("[data-cajon]"));
      assert.ok(a, "el cobro no abre el cajón");
      assert.deepEqual(a.frames.map((f) => f.transform), ["translateY(0)", "translateY(4px)", "translateY(0)"]);
      assert.equal(a.opts.duration, 440);
    } finally { c.desmontar(); }
    const d = await abrir("dos-salidas");
    try {
      tocar(q(d, "[data-accion=consignar]"));
      tocar(q(d, "[data-accion=otra-vez]"));
      tocar(q(d, "[data-accion=pagar]"));
      await esperar(0);
      assert.equal(q(d, "[data-cajon]").dataset.abre, "2", "cada salida no abre el cajón");
    } finally { d.desmontar(); }
    reducido(true);
    animados.length = 0;
    const r = await abrir("cobra");
    try {
      tocar(q(r, "[data-accion=cobrar]"));
      await esperar(0);
      assert.equal(animados.filter((x) => x.el.matches("[data-cajon]")).length, 0, "con movimiento reducido el cajón se mueve");
    } finally { r.desmontar(); }
  } finally { w.Element.prototype.animate = original; w.matchMedia = mm; }
  const h1 = readFileSync(new URL("../../components/t4/EntraOSaleDeCaja.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(h1, /cajonA1/, "H1 lleva el cajón de A1");
});

/* ═══════════ D8 · EL CASO B ═══════════ */

const CANON_B = fusionB(CANON_P, pantallasDe(PAQ, "Caso B (D8), pantalla por pantalla"));
/* porLugar con los cheques del caso: en el B, la tarjeta del propio cambia. */
const porLugarCaso = (p, cheques) => porLugar(p).map(([l, t]) => {
  const m = l.match(/^Cheque «(\w+)» · tarjeta$/);
  return m ? [l, cheques.find((c) => c.id === m[1]).tarjeta] : [l, t];
});

test("★★★ D8 · el caso B, texto por texto: el del paquete (lo del caso 1 con lo que cambia el B), en su lugar; la misma decisión en cada pantalla", () => {
  const B = P.casoB;
  assert.ok(B);
  for (const [i, c] of CANON_B.entries()) {
    const p = B.pantallas[i];
    assert.equal(p.id, c.id);
    assert.deepEqual(c.extra, [], `${c.id}: un lugar del caso B que el caso 1 no tiene`);
    assert.deepEqual(porLugarCaso(p, A.CHEQUES_A1_B), c.textos.map((x) => [x.lugar, x.texto]), c.id);
    const a = P.pantallas[i];
    assert.deepEqual([p.correcta, p.opciones, p.pregunta, p.control], [a.correcta, a.opciones, a.pregunta, a.control], `${c.id}: la decisión cambia`);
  }
  assert.deepEqual([A.DATOS_A1[2].cobro, A.DATOS_A1[2].anotado, A.DATOS_A1[2].cobro - A.DATOS_A1[2].anotado], [612_000, 584_000, 28_000]);
  assert.match(seccionDe(PAQ, "Caso B (D8), pantalla por pantalla"), /Origen del cajón: «Taller Ríos Ltda\.»/);
  assert.equal(A.DATOS_A1[2].rotuloOrigen, "Taller Ríos Ltda.");
  for (const p of B.pantallas.filter((x) => x.asiento)) for (const l of p.asiento.lineas) assert.equal(l.monto, 612_000, `${p.id}: el asiento no va con las cifras del caso B`);
});

test("★★★ D8 · jugado en el caso B: Taller Ríos cobra 612.000; la consignación los saca a Bancos; en «el-faltante», 584.000 anotados y «28.000 sin anotar»", async () => {
  const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER", caso: 2 }));
  const seguir = () => tocar(q(m, '[data-boton="seguir"]'));
  try {
    assert.equal(q(m, "[data-pieza]").dataset.casoPieza, "2");
    seguir();
    assert.equal(q(m, "[data-origen] .t4cv-rot").textContent, "Taller Ríos Ltda.");
    tocar(q(m, "[data-accion=cobrar]"));
    assert.deepEqual([lineas(m, A.DEBE), saldo(m)], [["612.000"], "612000"]);
    seguir();
    tocar(q(m, `[data-destino="${A.DEBE}"]`));
    assert.equal(visible(q(m, "[data-mensaje] [data-devolucion]")), "No entró plata nueva: son los mismos $612.000.");
    tocar(q(m, `[data-destino="${A.HABER}"]`));
    assert.deepEqual([lineas(m, A.HABER), saldo(m)], [["612.000"], "0"]);
    seguir(); seguir();
    assert.equal(q(m, "[data-hecho]").textContent, "Un cliente le paga con un cheque");
    tocar(q(m, `[data-destino="${A.DEBE}"]`));
    await esperar(A.ESPERA_CHEQUE_MS + 100);
    assert.equal(q(m, "[data-hecho]").textContent, "Taller Ríos paga con un cheque propio");
    tocar(q(m, `[data-destino="${A.NO_SE_MUEVE}"]`));
    seguir();
    assert.equal(q(m, "[data-monto=origen]").textContent, "612.000");
    assert.deepEqual([lineas(m, A.DEBE), saldo(m)], [["584.000"], "584000"]);
    assert.equal(q(m, "[data-sin-anotar]").textContent, "28.000 sin anotar");
  } finally { m.desmontar(); }
});
