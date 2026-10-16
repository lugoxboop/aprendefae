import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H1 «¿Entra o sale de Caja?» (Célula D) · Hacer · exploratoria · 10 FP.
 * REDISEÑO DE ENGANCHE: el cajón como tablero, un solo negocio.
 *
 *   · cada texto es el del paquete vigente (d4-t4-h1-v2-rediseno.md, Katsumi
 *     aprobado por Yujiro), letra por letra; la respuesta y el subtema de cada
 *     hecho, los mismos de la v1 de la que viene
 *   · el saldo: nunca negativo y siempre 600.000 al final, en CUALQUIER orden
 *     (los 8! = 40.320) y aunque el estudiante falle
 *   · el mismo `activity_id`; los ítems nuevos h1-t1…h1-t8; el panel docente
 *     sigue leyendo los h1-1…h1-8 ya registrados
 *   · PH8-2: mientras se pregunta, NADA de la respuesta está en el DOM
 *     (`textContent` y `outerHTML`, que ven lo escondido por CSS)
 *   · un solo toque; en el error la plata no entra donde se eligió y a los
 *     0,7 s va a donde iba («Iba aquí»); la caja nunca muestra un saldo falso
 *   · «Hecho n de 8» coincide con el pulso activo en todos los estados
 *   · el acierto con ✓ y borde blanco; «Siguiente hecho» en blanco neutro
 *   · en modo demo, sin Encabezado ni Pulsos (la consigna, una sola vez)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, act, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const D = await import("../../data/contabilidadT4H1.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, EntraOSaleDeCaja, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");
const { hechosDe, seccionDe, renglones, textoDe, datos } = await import("./t4-rediseno-canon.mjs");

const CANON = "d4-t4-h1-v2-rediseno.md";
const PAQ = leer(`${PAQUETES}${CANON}`);
const V1 = leer(`${PAQUETES}d4-t4-h1-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0200_t4_entra_o_sale_de_caja.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const HECHOS = hechosDe(PAQ);
const ERR = { [D.DEBE]: "Error si va al debe", [D.HABER]: "Error si va al haber", [D.NO_SE_MUEVE]: "Error si va a «Caja no se mueve»" };
const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* La respuesta y el subtema de cada hecho de la v1 (de donde viene cada uno nuevo). */
const POR_NOMBRE = { "Debe de Caja": D.DEBE, "Haber de Caja": D.HABER, "Caja no se mueve": D.NO_SE_MUEVE };
const V1_HECHOS = Object.fromEntries(V1.slice(V1.indexOf("## Hechos"), V1.indexOf("## Cierre")).split(/\n(?=### H1-\d)/).slice(1).map((b) => [
  `h1-${b.match(/^### H1-(\d)/)[1]}`,
  { subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(), respuesta: POR_NOMBRE[b.match(/^- \*\*Respuesta:\*\* (Debe de Caja|Haber de Caja|Caja no se mueve)/m)[1]], texto: b.match(new RegExp(`^- \\*\\*Hecho:?\\*\\*:? ${CITA}`, "m"))?.[1] },
]));

/* ═══════════ EL JUEGO, MONTADO ═══════════ */

const Marco = ({ children }) => h("section", null, children);
function montarJuego(props = {}) {
  const completados = [];
  const m = montar(h(EntraOSaleDeCaja, { Marco, onCompletar: (...a) => completados.push(a), ...props }));
  return { ...m, completados };
}
const q = (m, sel) => m.caja.querySelector(sel);
const destino = (m, d) => q(m, `[data-destino="${d}"]`);
/* El avance y «Comprobar» son el Responder compartido dentro de su envoltorio (P2 de Hanayama, §3.4). */
const siguiente = (m) => q(m, '[data-boton="seguir-hacer"] button');
const hechoActual = (m) => D.ITEMS_H1.find((x) => x.texto === q(m, "[data-hecho]").textContent);
const saldo = (m) => Number(q(m, "[data-saldo]").dataset.saldo);
const lineas = (m, lado) => [...m.caja.querySelectorAll(`[data-columna="${lado}"] [data-linea]`)].map((x) => x.textContent);
/* «Hecho n de 8» y el pulso activo (1-based). */
function avance(m) {
  const n = Number(q(m, "[data-avance]").textContent.match(/Hecho (\d+) de 8/)[1]);
  const nodos = [...m.caja.querySelectorAll("[data-nodo]")];
  return { n, activo: nodos.findIndex((x) => x.dataset.nodo === "actual") + 1 };
}

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v2) y lo dice: mismo activity_id, ítems nuevos y los viejos para el panel", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de H1\.\*\*/);
  assert.match(PAQ, /`h1-t1`…`h1-t8` \(antes `h1-1`…`h1-8`\)/);
  assert.match(PAQ, /\*\*El `activity_id` no cambia\*\* \(`t4-entra-o-sale-de-caja`/);
  assert.match(leer("src/data/contabilidadT4H1.js"), new RegExp(CANON.replace(/\./g, "\\.")));
});

test("★★★ ficha: el mismo id, la consigna y el saldo inicial del paquete; los tres destinos, en orden", () => {
  assert.equal(D.H1_ID, "t4-entra-o-sale-de-caja");
  assert.equal(D.H1.id, D.H1_ID);
  assert.equal(D.H1.nombre, "¿Entra o sale de Caja?");
  const sec = seccionDe(PAQ, "Consigna");
  assert.equal(D.H1.consigna, textoDe(renglones(sec), "Consigna"));
  assert.equal(cifra(D.SALDO_INICIAL_H1), datos(sec)["Saldo inicial"]);
  assert.equal(D.SALDO_INICIAL_H1, 400_000);
  assert.deepEqual(D.DESTINOS_H1.map((d) => d.id), [D.DEBE, D.HABER, D.NO_SE_MUEVE]);
});

test("★★★ los ocho hechos: id, de dónde viene, subtema, destino, monto, hecho, acierto, cada error y su página, letra por letra", () => {
  assert.deepEqual(D.ITEMS_H1.map((x) => x.id), HECHOS.map((x) => x.id));
  assert.deepEqual(D.ITEMS_H1.map((x) => x.id), ["h1-t1", "h1-t2", "h1-t3", "h1-t4", "h1-t5", "h1-t6", "h1-t7", "h1-t8"]);
  for (const [k, c] of HECHOS.entries()) {
    const it = D.ITEMS_H1[k];
    const va = `${it.respuesta}${it.va ? ` · sale hacia: ${it.va}` : ""}${it.toca ? ` · enciende: ${it.toca}` : ""}`;
    assert.deepEqual(
      [it.viene, it.subtema, va, cifra(it.monto)],
      [c.viene, c.datos.Subtema, c.datos["Va a"], c.datos.Monto], it.id,
    );
    const r = [["Hecho", it.texto], ["Acierto (tras «Correcto.»)", it.acierto], ...Object.entries(it.errores).map(([d, t]) => [ERR[d], t]), ["Página", it.pagina]];
    assert.deepEqual(r, c.textos.map((x) => [x.lugar, x.texto]), it.id);
  }
});

test("★★★ cada hecho conserva la respuesta y el subtema de la v1 de la que viene; tiene un error por cada destino equivocado", () => {
  for (const it of D.ITEMS_H1) {
    assert.ok(V1_HECHOS[it.viene], `${it.id}: no encontré ${it.viene} en la v1`);
    assert.deepEqual([it.subtema, it.respuesta], [V1_HECHOS[it.viene].subtema, V1_HECHOS[it.viene].respuesta], it.id);
    assert.deepEqual(Object.keys(it.errores).sort(), D.DESTINOS_H1.map((d) => d.id).filter((d) => d !== it.respuesta).sort(), it.id);
    if (it.respuesta === D.HABER) assert.ok(["bancos", "pago"].includes(it.va), `${it.id}: una salida sin destino`);
    else assert.equal(it.va, undefined, it.id);
  }
  assert.equal(new Set(D.ITEMS_H1.map((x) => x.monto)).size, 8, "dos montos iguales");
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y da lo que dice el paquete", () => {
  const todos = [...HECHOS.flatMap((c) => c.textos), ...renglones(seccionDe(PAQ, "Consigna")), ...renglones(seccionDe(PAQ, "Cierre")), ...renglones(seccionDe(PAQ, "Así se juega"))];
  assert.ok(todos.filter((x) => x.medida).length > 35, "se leyeron pocos textos del paquete");
  for (const x of todos.filter((y) => y.medida)) {
    const r = inflesz(x.texto);
    if (r.aplica) {
      assert.ok(r.valor >= 65, `${x.lugar}: ${r.valor}`);
      assert.equal(x.medida, r.valor.toFixed(1).replace(".", ","), x.texto);
    } else assert.equal(x.medida, "<10", x.texto);
  }
});

/* ═══════════ 2 · EL SALDO ═══════════ */

function* permutaciones(xs) {
  if (xs.length <= 1) { yield xs; return; }
  for (let i = 0; i < xs.length; i++) for (const p of permutaciones([...xs.slice(0, i), ...xs.slice(i + 1)])) yield [xs[i], ...p];
}

test("★★★ el saldo nunca da negativo y siempre termina en 600.000, en los 40.320 órdenes; el peor deja 50.000", () => {
  let ordenes = 0, minimo = Infinity;
  const finales = new Set();
  for (const orden of permutaciones(D.ITEMS_H1)) {
    ordenes += 1;
    for (let k = 1; k <= orden.length; k++) minimo = Math.min(minimo, D.libroH1(orden.slice(0, k)).saldo);
    finales.add(D.libroH1(orden).saldo);
  }
  assert.equal(ordenes, 40320);
  assert.equal(minimo, 50_000);
  assert.ok(minimo >= 0);
  assert.deepEqual([...finales], [600_000]);
  assert.match(D.CIERRE_H1.texto, /empezó en 400\.000 y termina en 600\.000/);
});

test("★★★ jugado en la pantalla, en tres órdenes, bien o mal: la caja nunca baja de 0 y el cierre la deja en 600.000", async () => {
  const ordenes = [D.ITEMS_H1, [...D.ITEMS_H1].reverse(), [D.ITEMS_H1[1], D.ITEMS_H1[2], ...D.ITEMS_H1.filter((_, i) => i !== 1 && i !== 2)]];
  for (const [k, items] of ordenes.entries()) {
    const mal = k === 1;
    const m = montarJuego({ items });
    try {
      let esperado = D.SALDO_INICIAL_H1;
      for (const it of items) {
        assert.equal(saldo(m), esperado, `${it.id}: el saldo antes de tocar`);
        await tocar(destino(m, mal ? D.DESTINOS_H1.map((x) => x.id).find((x) => x !== it.respuesta) : it.respuesta));
        if (mal) {
          assert.equal(saldo(m), esperado, `${it.id}: en el error el saldo se movió antes de tiempo`);
          await esperar(D.ESPERA_ERROR_H1_MS + 50);
        }
        esperado += it.respuesta === D.DEBE ? it.monto : it.respuesta === D.HABER ? -it.monto : 0;
        assert.equal(saldo(m), esperado, `${it.id}: el saldo después`);
        assert.ok(esperado >= 0);
        await tocar(siguiente(m));
      }
      assert.equal(saldo(m), 600_000);
      assert.ok(q(m, "[data-fin]"), "no llegó al cierre");
      assert.equal(m.completados.length, 1);
      assert.equal(m.completados[0][0], mal ? 0 : 100);
    } finally { m.desmontar(); }
  }
});

/* ═══════════ 3 · LA PARTIDA ═══════════ */

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", () => {
  for (const it of D.ITEMS_H1) {
    const m = montarJuego({ items: [it] });
    try {
      const raiz = q(m, "[data-t4-h1]");
      for (const x of [it.acierto, ...Object.values(it.errores), it.pagina, "Correcto", "Incorrecto", "No va aquí", "Iba aquí"]) {
        assert.ok(!raiz.textContent.includes(x), `${it.id}: «${x}» está en el texto antes de tocar`);
        assert.ok(!raiz.outerHTML.includes(x), `${it.id}: «${x}» está en el HTML antes de tocar`);
      }
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje]"), null);
      assert.equal(q(m, "[data-hecho]").textContent, it.texto);
      assert.equal(q(m, "[data-monto=origen]").textContent, cifra(it.monto));
    } finally { m.desmontar(); }
  }
});

test("★★★ un solo toque: al tocar, los tres destinos se bloquean y un segundo toque no cambia nada", async () => {
  const it = D.ITEMS_H1[0];
  const m = montarJuego({ items: [it] });
  try {
    await tocar(destino(m, D.HABER));
    for (const d of [D.DEBE, D.HABER, D.NO_SE_MUEVE]) assert.equal(destino(m, d).disabled, true, d);
    const antes = q(m, "[data-t4-h1]").outerHTML;
    await tocar(destino(m, D.DEBE));
    assert.equal(q(m, "[data-t4-h1]").outerHTML, antes);
  } finally { m.desmontar(); }
});

test("★★★ cada hecho, con cada destino: el acierto pone la plata; el error marca, no escribe, y a los 0,7 s la plata va a donde iba", async () => {
  for (const it of D.ITEMS_H1) {
    for (const d of D.DESTINOS_H1.map((x) => x.id)) {
      const m = montarJuego({ items: [it] });
      try {
        const ok = d === it.respuesta;
        await tocar(destino(m, d));
        const msg = q(m, "[data-mensaje]");
        assert.equal(msg.dataset.mensaje, ok ? "acierto" : "error", `${it.id} → ${d}`);
        assert.equal(q(m, "[data-devolucion]").textContent, ok ? `Correcto. ${it.acierto}` : `Incorrecto. ${it.errores[d]}`);
        assert.equal(visible(q(m, "[data-devolucion]")), ok ? `Correcto. ${it.acierto}` : it.errores[d], "«Incorrecto.» se ve");
        assert.equal(q(m, "[data-pagina]").textContent, it.pagina);
        assert.equal(destino(m, d).dataset.marca, ok ? "bien" : "mal");
        if (!ok) {
          /* Antes de los 0,7 s: nada escrito. */
          assert.deepEqual([lineas(m, D.DEBE).length, lineas(m, D.HABER).length, saldo(m)], [1, 0, D.SALDO_INICIAL_H1]);
          assert.equal(destino(m, it.respuesta).dataset.marca, undefined);
          await esperar(D.ESPERA_ERROR_H1_MS + 50);
          assert.equal(destino(m, it.respuesta).dataset.marca, "era", `${it.id}: «Iba aquí» no salió`);
          assert.equal(destino(m, d).dataset.marca, "mal");
          assert.ok(CORAL.test(w.getComputedStyle(destino(m, d)).borderTopColor), "el error no va en coral");
        }
        const s = D.SALDO_INICIAL_H1 + (it.respuesta === D.DEBE ? it.monto : it.respuesta === D.HABER ? -it.monto : 0);
        assert.equal(saldo(m), s, `${it.id} → ${d}: el saldo`);
        if (it.respuesta === D.DEBE) assert.deepEqual(lineas(m, D.DEBE), ["400.000", cifra(it.monto)]);
        if (it.respuesta === D.HABER) {
          assert.deepEqual(lineas(m, D.HABER), [cifra(it.monto)]);
          assert.equal(q(m, `[data-monto="${it.va}"]`).textContent, cifra(it.monto));
        }
        if (it.respuesta === D.NO_SE_MUEVE) {
          assert.match(q(m, "[data-bandeja]").textContent, new RegExp(cifra(it.monto).replace(/\./g, "\\.")));
          assert.equal(Boolean(q(m, '[data-caja2="bancos"][data-luz]')), it.toca === "bancos", `${it.id}: Bancos ${it.toca ? "no " : ""}se enciende`);
        }
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ «Hecho n de 8» coincide con el pulso activo al llegar, tras acertar y tras fallar (antes y después de los 0,7 s)", async () => {
  const m = montarJuego({ items: D.ITEMS_H1 });
  try {
    for (let k = 0; k < 4; k++) {
      const it = hechoActual(m);
      assert.deepEqual(avance(m), { n: k + 1, activo: k + 1 }, `hecho ${k + 1}, al llegar`);
      const ok = k % 2 === 0;
      await tocar(destino(m, ok ? it.respuesta : (it.respuesta === D.DEBE ? D.HABER : D.DEBE)));
      assert.deepEqual(avance(m), { n: k + 1, activo: k + 1 }, `hecho ${k + 1}, ${ok ? "acierto" : "error antes"}`);
      if (!ok) {
        await esperar(D.ESPERA_ERROR_H1_MS + 50);
        assert.deepEqual(avance(m), { n: k + 1, activo: k + 1 }, `hecho ${k + 1}, error después`);
      }
      await tocar(siguiente(m));
    }
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es Check y borde blanco; teal y ámbar solo en «Debe» y «Haber»; «Siguiente hecho» es el Responder teal, y es lo único teal fuera de «Debe»", async () => {
  for (const it of [D.ITEMS_H1[0], D.ITEMS_H1[1], D.ITEMS_H1[3]]) {
    const m = montarJuego({ items: [it, D.ITEMS_H1[7]] });
    try {
      await tocar(destino(m, it.respuesta));
      const raiz = q(m, "[data-t4-h1]");
      assert.deepEqual([...new Set(conColor(raiz, TEAL_AMBAR).filter((e) => !e.closest("[data-avance-t4]")).map((e) => e.textContent.trim()))].sort().filter((x) => !/^Hecho/.test(x) && x !== ""), ["Debe", "Haber"]);
      assert.deepEqual(conColor(q(m, "[data-figura]"), CORAL), [], "hay coral en un acierto");
      assert.equal(w.getComputedStyle(destino(m, it.respuesta)).borderTopColor, "rgb(248, 249, 250)");
      const b = siguiente(m);
      assert.equal(b.textContent, D.BOTON_H1.siguiente);
      /* El avance es el Responder compartido: teal con texto #06202A (prompt maestro §4.3). Un botón blanco no pasa. */
      assert.equal(w.getComputedStyle(b).backgroundColor, "rgb(42, 157, 143)");
      assert.equal(w.getComputedStyle(b).color, "rgb(6, 32, 42)");
    } finally { m.desmontar(); }
  }
  for (const f of ["src/components/t4/EntraOSaleDeCaja.jsx", "src/components/t4/Cajon.jsx", "src/components/t4/comun.jsx"]) {
    const imports = leer(f).split("\n").filter((l) => /^import /.test(l)).join("\n");
    assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento)\b/, f);
  }
});

test("★★★ al terminar: el cajón lleno con 600.000, el cierre con su texto y su pie, y onCompletar con el porcentaje y el detalle", async () => {
  const m = montarJuego({ items: D.ITEMS_H1 });
  try {
    for (const [k, it] of D.ITEMS_H1.entries()) {
      const d = k === 2 ? D.NO_SE_MUEVE : it.respuesta;
      await tocar(destino(m, d));
      if (d !== it.respuesta) await esperar(D.ESPERA_ERROR_H1_MS + 50);
      assert.equal(siguiente(m).textContent, k === 7 ? D.BOTON_H1.verResumen : D.BOTON_H1.siguiente);
      await tocar(siguiente(m));
    }
    assert.equal(q(m, "[data-resumen]").textContent, "7 de 8 al primer toque.");
    assert.equal(q(m, "[data-cierre]").textContent, D.CIERRE_H1.texto);
    assert.equal(q(m, "[data-pie-cierre]").textContent, D.CIERRE_H1.pie);
    assert.equal(q(m, "[data-saldo]").dataset.saldo, "600000");
    assert.equal(q(m, "[data-destino]"), null, "en el cierre los destinos siguen activos");
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, 87.5);
    assert.deepEqual(detalle.map((x) => [x.item, x.ok, x.respuesta]), D.ITEMS_H1.map((it, k) => [it.id, k !== 2, k === 2 ? D.NO_SE_MUEVE : null]));
  } finally { m.desmontar(); }
});

test("★★ en modo demo: sin Encabezado ni Pulsos (la consigna una sola vez), sin botón de seguir y sin reportar nada", async () => {
  const m = montarJuego({ items: [D.EJEMPLO_H1], modoDemo: true });
  try {
    assert.ok(q(m, "[data-t4-h1-demo]"));
    assert.equal(q(m, "[data-encabezado]"), null);
    assert.equal(q(m, "[data-avance]"), null);
    assert.ok(!m.caja.textContent.includes(D.H1.consigna), "la consigna sale en la demo");
    await tocar(destino(m, D.HABER));
    assert.equal(siguiente(m), null);
    assert.equal(saldo(m), 340_000);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

const vista = async () => {
  try { w.localStorage.clear(); } catch { /* sin almacenamiento */ }
  const m = montar(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H1_ID, onBack: () => {} })));
  await esperar(0);
  return m;
};

test("★★★ en la página del juego hay exactamente UN [data-t4-h1]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  const m = await vista();
  try {
    assert.equal(m.caja.querySelectorAll("[data-t4-h1]").length, 1);
    assert.ok(m.caja.querySelector("[data-partida] [data-t4-h1]"));
    assert.equal(m.caja.querySelectorAll("[data-t4-h1-demo]").length, 1);
    assert.ok(m.caja.querySelector("[data-asi-se-juega] [data-t4-h1-demo]"));
  } finally { m.desmontar(); }
});

test("★★★ «Volver al camino» mide 44 px de alto como mínimo (antes 129×37)", async () => {
  const m = await vista();
  try {
    const b = q(m, "[data-volver-camino]");
    assert.ok(b, "no está «Volver al camino»");
    assert.match(b.textContent, /Volver al camino/);
    assert.equal(w.getComputedStyle(b).minHeight, "44px");
  } finally { m.desmontar(); }
});

/* ═══════════ 4 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A1: exploratoria, fácil, 10 FP; las de Aprender siguen sin FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H1_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].id, D.H1_ID);
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, D.H1.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H1_ID), ids.indexOf("t4-a1-la-caja") + 1);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS_T4) assert.equal(typeof j.Mecanica, "function", j.id);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T4, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
});

test("★★★ la 0200 no cambia y sigue siendo la única que nombra la actividad: del rango de la célula, aditiva y repetible", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t4-entra-o-sale-de-caja',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i, "solo puede insertar y consultar");
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H1_ID)), ["0200_t4_entra_o_sale_de_caja.sql"]);
  /* Los ids de ítem no van en ninguna migración: fp_detalle los guarda tal cual (0017). */
  for (const it of [...D.ITEMS_H1, ...D.ITEMS_H1_ANTERIORES]) assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(`'${it.id}'`)), [], it.id);
});

test("★★★ el panel docente: lee los item_id nuevos que guarda la partida Y los viejos (h1-1…h1-8) ya registrados, por su hecho", async () => {
  const m = montarJuego({ items: D.ITEMS_H1 });
  try {
    for (const it of D.ITEMS_H1) { await tocar(destino(m, it.respuesta)); await tocar(siguiente(m)); }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.deepEqual(ids, D.ITEMS_H1.map((x) => x.id));
    for (const id of ids) assert.equal(etiquetaDeItem(D.H1_ID, id), recortar(D.ITEMS_H1.find((x) => x.id === id).texto), id);
  } finally { m.desmontar(); }
  /* Los de antes del rediseño: los mismos ids y los mismos hechos de la v1. */
  assert.deepEqual(D.ITEMS_H1_ANTERIORES.map((x) => x.id), ["h1-1", "h1-2", "h1-3", "h1-4", "h1-5", "h1-6", "h1-7", "h1-8"]);
  for (const it of D.ITEMS_H1_ANTERIORES) {
    assert.equal(it.texto, V1_HECHOS[it.id].texto, `${it.id}: no es el hecho de la v1`);
    assert.equal(it.subtema, V1_HECHOS[it.id].subtema, it.id);
    assert.equal(etiquetaDeItem(D.H1_ID, it.id), recortar(it.texto), it.id);
  }
  /* La partida no usa los viejos. */
  assert.ok(!D.ITEMS_H1.some((x) => D.ITEMS_H1_ANTERIORES.some((y) => y.id === x.id)));
  const fuente = leer("src/docente/etiquetasItem.js");
  assert.match(fuente, /"t4-entra-o-sale-de-caja": \(id\) => hechoDeItemT4H1\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo del paquete; el ejemplo no está en el banco; la mano toca el haber del cajón", () => {
  const asi = ASI_SE_JUEGA[D.H1_ID];
  assert.ok(asi, "H1 no tiene «Así se juega»");
  const sec = renglones(seccionDe(PAQ, "Así se juega"));
  assert.deepEqual(asi.pasos, [1, 2, 3].map((i) => textoDe(sec, `Paso ${i}`)));
  assert.equal(D.EJEMPLO_H1.texto, textoDe(sec, "Ejemplo · hecho"));
  assert.equal(D.EJEMPLO_H1.acierto, textoDe(sec, "Ejemplo · acierto (tras «Correcto.»)"));
  assert.equal(asi.alt, textoDe(sec, "Texto alternativo"));
  assert.match(seccionDe(PAQ, "Así se juega"), new RegExp(`Ejemplo · monto: ${cifra(D.EJEMPLO_H1.monto).replace(".", "\\.")} · va a: haber · sale hacia: ${D.EJEMPLO_H1.va}`));
  assert.equal(asi.titulo, D.H1.nombre);
  assert.equal(asi.consigna, D.H1.consigna);
  assert.deepEqual(asi.demo.items, [D.EJEMPLO_H1]);
  assert.ok(!D.ITEMS_H1.some((x) => x.texto === D.EJEMPLO_H1.texto || x.monto === D.EJEMPLO_H1.monto), "el ejemplo está en el banco");
  assert.equal(D.EJEMPLO_H1.respuesta, D.HABER);
  assert.deepEqual(asi.guion.toques.map((x) => x.en), [`[data-destino="${D.HABER}"]`]);
  /* Ningún paso repite la consigna (B5). */
  for (const p of asi.pasos) assert.ok(!D.H1.consigna.includes(p.replace(/\.$/, "")), p);
});

test("★★★ D2: el objetivo de la pieza se ve antes de empezar, en el Encabezado compartido (por su prop), antes de la consigna", () => {
  const m = montarJuego();
  try {
    const o = m.caja.querySelector("[data-encabezado] [data-objetivo]");
    assert.equal(o?.textContent, D.H1.objetivo);
    assert.ok(o.compareDocumentPosition(m.caja.querySelector("[data-encabezado] [data-consigna]")) & 4, "el objetivo no va antes de la consigna");
  } finally { m.desmontar(); }
});
