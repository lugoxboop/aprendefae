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
const { pantallasDe, seccionDe, renglones, textoDe } = await import("./t4-rediseno-canon.mjs");

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
  if ("acierto" in p) r.push(["Acierto (tras «Correcto.»)", p.acierto]);
  for (const [d, t] of Object.entries(p.errores ?? {})) r.push([ERR[d], t]);
  if (p.tipo === "cheques") {
    for (const c of A.CHEQUES_A1) {
      r.push([`Cheque «${c.id}» · tarjeta`, c.tarjeta], [`Cheque «${c.id}» · acierto (tras «Correcto.»)`, c.acierto]);
      for (const [d, t] of Object.entries(c.errores)) r.push([`Cheque «${c.id}» · ${ERR[d].toLowerCase()}`, t]);
    }
  }
  if (p.tipo === "controles") A.CONTROLES_A1.forEach((c, i) => r.push([`Control ${i + 1}`, c.texto]));
  if (p.cierre) r.push(["Frase de cierre (en el hueco del control, con el séptimo distinto)", p.cierre]);
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

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v6) y lo dice, con la decisión del control 7; los datos lo nombran", async () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de A1\.\*\*/);
  assert.match(PAQ, /\*\*el control 7 \(caja menor\) enciende Bancos\*\*/);
  assert.match(leer("src/data/contabilidadT4.js"), new RegExp(CANON.replace(/\./g, "\\.")));
});

test("★★★ las 6 pantallas, en el orden del paquete (lote B: sale el resumen en lista); título e id; todas con el cajón", async () => {
  assert.equal(P.id, "t4-a1-la-caja");
  assert.equal(P.titulo, "La caja");
  assert.deepEqual(P.pantallas.map((p) => p.id), CANON_P.map((p) => p.id));
  assert.equal(P.pantallas.length, 6);
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

test("★★★ los dos asientos de la p. 180 cuadran; la única cifra del libro es 435.000", async () => {
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado, l.monto]);
  assert.deepEqual(filas(A.ASIENTO_COBRO), [["Caja", A.DEBE, 435_000], ["Ingresos por servicios", A.HABER, 435_000]]);
  assert.deepEqual(filas(A.ASIENTO_CONSIGNACION), [["Bancos", A.DEBE, 435_000], ["Caja", A.HABER, 435_000]]);
  assert.equal(pantalla("cobra").asiento, A.ASIENTO_COBRO);
  assert.equal(pantalla("consigna").asiento, A.ASIENTO_CONSIGNACION);
  const cifras = CANON_P.flatMap((c) => c.textos.map((x) => x.texto)).flatMap((t) => [...t.matchAll(/\$?\d{1,3}(?:\.\d{3})+/g)].map((x) => x[0]));
  assert.deepEqual([...new Set(cifras)], ["$435.000"]);
});

/* ═══════════ 2 · LA PANTALLA Y EL CAJÓN ═══════════ */

test("★★★ cada pantalla, en el orden de Hanayama: antes → cajón → después → siguiente → «Seguir» → pie (en las preguntas, tras el acierto; en la última, tras el séptimo control)", async () => {
  const m = await abrir("dos-cuentas");
  try {
    for (const [k, p] of P.pantallas.entries()) {
      const zona = q(m, "[data-pieza]");
      assert.equal(zona.dataset.pantalla, p.id);
      if (p.pregunta) {
        assert.equal(zona.querySelector('[data-boton="seguir"]'), null, `${p.id}: «Seguir» antes del acierto`);
        await acertar(m, p);
      }
      if (p.tipo === "controles") {
        assert.ok(!zona.querySelector("[data-siguiente][data-visible]"), "«Siguiente» antes de la frase de cierre");
        A.CONTROLES_A1.forEach((_, i) => tocar(zona.querySelector(`[data-control="${i + 1}"]`)));
      }
      const orden = [...zona.querySelectorAll("[data-texto], [data-figura], [data-boton], [data-pie]")]
        .filter((e) => !e.parentElement.closest("[data-figura]"))
        .map((e) => (e.matches("[data-figura]") ? "FIGURA" : e.matches("[data-boton]") ? "SEGUIR" : e.matches("[data-pie]") ? "PIE" : e.textContent));
      const esperado = [...(p.antes ?? []), "FIGURA", ...(p.despues ?? []), ...(p.siguiente ? [p.siguiente] : []), ...(k < 5 ? ["SEGUIR"] : []), "PIE"];
      assert.deepEqual(orden, esperado, p.id);
      if (k < 5) tocar(zona.querySelector('[data-boton="seguir"]'));
    }
  } finally { m.desmontar(); }
});

test("★★★ D7 · en las dos pantallas con pregunta, «Seguir» no aparece sin el acierto: ni al llegar, ni tras cada error, ni con un solo cheque", async () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pregunta).map((p) => p.id), ["consigna", "cheques"]);
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
    assert.equal(q(k, "[data-pieza]").dataset.pantalla, "controles");
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

test("★★★ P5 los controles: cada pestaña enciende lo que cuida y muestra su texto; el 7 (caja menor) enciende Bancos, no el pago", async () => {
  const m = await abrir("controles");
  try {
    assert.equal(q(m, "[data-texto-control]").textContent, "");
    assert.equal(q(m, "[data-saldo]").dataset.saldo, "—");
    const esperado = [["cols"], ["bancos"], ["pago"], ["cols"], ["saldo"], ["cajon"], ["bancos"]];
    A.CONTROLES_A1.forEach((c, i) => {
      tocar(q(m, `[data-control="${i + 1}"]`));
      if (i === A.CONTROLES_A1.length - 1) {
        /* El séptimo distinto muestra la frase de cierre (prueba aparte); un segundo toque, el texto del control. */
        assert.equal(q(m, "[data-cierre]").textContent, P.pantallas.at(-1).cierre);
        tocar(q(m, `[data-control="${i + 1}"]`));
      }
      assert.equal(q(m, "[data-texto-control]").textContent, c.texto, `control ${i + 1}`);
      assert.equal(q(m, `[data-control="${i + 1}"]`).getAttribute("aria-pressed"), "true");
      const l = luces(m);
      assert.deepEqual(l.map((x) => (x === "debe" || x === "haber" ? "cols" : x)).filter((x, j, xs) => xs.indexOf(x) === j), esperado[i], `control ${i + 1}`);
    });
    assert.ok(!luces(m).includes("pago"), "el control 7 enciende «Pago en efectivo»");
  } finally { m.desmontar(); }
});

test("★★★ P5, la frase de cierre (capa 4): con el séptimo control distinto, el hueco del control la muestra, pegada al cajón; entonces sale «Siguiente»; tocar un número vuelve a su control", async () => {
  const p = pantalla("controles");
  const m = await abrir("controles");
  try {
    for (const i of [0, 0, 1, 2, 3, 4, 5]) {
      tocar(q(m, `[data-control="${i + 1}"]`));
      assert.equal(q(m, "[data-cierre]"), null, `la frase sale antes del séptimo distinto (control ${i + 1})`);
    }
    assert.ok(!q(m, "[data-siguiente][data-visible]"));
    tocar(q(m, '[data-control="7"]'));
    const frase = q(m, "[data-figura] [data-cierre]");
    assert.equal(frase?.textContent, p.cierre);
    assert.equal(q(m, "[data-texto-control]"), null);
    assert.equal(q(m, "[data-siguiente][data-visible] [aria-live]").textContent, p.siguiente);
    tocar(q(m, '[data-control="3"]'));
    assert.equal(q(m, "[data-texto-control]").textContent, A.CONTROLES_A1[2].texto);
    assert.ok(q(m, "[data-siguiente][data-visible]"), "«Siguiente» se va al volver a un control");
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
