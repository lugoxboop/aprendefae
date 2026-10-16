import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H4 «El arqueo de caja menor» (Célula D), con H5 DENTRO · Hacer ·
 * evaluativa · difícil · 50 FP. REDISEÑO DE ENGANCHE: el sobre y la regla.
 *
 *   · cada texto es el del paquete vigente (d4-t4-h4-v2-rediseno.md), letra
 *     por letra; ocho rondas (H4-3 y H4-5 salen), cuatro por intento, una de
 *     cada tipo
 *   · las cifras: en cada ronda, la caja más el cheque da el fondo; solo el
 *     cheque correcto deja la aguja en la marca del fondo; la diferencia cae
 *     dentro de la regla
 *   · cada error con nombre se comete con el gesto mínimo (un toque en la
 *     1, 2 y 3; una ficha y «Comprobar» en la 4) y sale ESE mensaje
 *   · PH8-2: mientras se pregunta, nada de la respuesta en el DOM
 *   · B4: el acierto con ✓ y borde blanco; teal y ámbar solo en Debe/Haber
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const D = await import("../../data/contabilidadT4H4.js");
const { ESPERA_ERROR_MS } = await import("../../data/contabilidadT4Hacer.js");
const { barajar } = await import("../../utils/barajar.js");
const { SUBJECTS, HACER, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, ElArqueo, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h4-v2-rediseno.md`);
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const ronda = (id) => D.RONDAS_H4.find((r) => r.id === id);
/* Una ronda con solo algunas preguntas, para montarla directo. */
const solo = (r, ids) => ({ ...r, preguntas: r.preguntas.filter((p) => ids.includes(p.id)) });

const Marco = ({ children }) => h("section", null, children);
function montarJuego(props = {}) {
  const completados = [];
  const m = montar(h(ElArqueo, { Marco, onCompletar: (...a) => completados.push(a), ...props }));
  return { ...m, completados };
}
const q = (m, sel) => m.caja.querySelector(sel);
const opcion = (m, v) => q(m, `[data-opcion="${v}"]`);
const mitad = (m, k) => q(m, `[data-destino="${k}"]`);
const comprobar = (m) => q(m, '[data-boton="comprobar"] button');
/* El avance y «Comprobar» son el Responder compartido dentro de su envoltorio (P2 de Hanayama, §3.4). */
const siguiente = (m) => q(m, '[data-boton="seguir-hacer"] button');
const devolucion = (m) => visible(q(m, "[data-devolucion]"));
/* El gesto mínimo de una pregunta: un toque (1, 2 y 3) o una ficha y «Comprobar» (4). */
async function responder(m, p, v) {
  /* La pregunta 4 también es de una ficha: el toque califica, sin «Comprobar» (P2 de Hanayama, §5.2). */
  if (p.id === D.CUENTA) await tocar(mitad(m, `${v.cuenta}:${v.lado}`)); else await tocar(opcion(m, v));
}
const desvio = (sel, m) => Number(q(m, sel)?.style.left.replace(/calc\(|%.*$/g, ""));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v2), con H5 dentro; las v1 de H4 y H5 quedan como historia", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de H4\.\*\*/);
  assert.match(PAQ, /\*\*H5 «¿Al empleado o al gasto\?» se funde aquí\*\*/);
  assert.match(leer(`${PAQUETES}d4-t4-h4-v1.md`), /^> \*\*REEMPLAZADO\*\*/);
  assert.match(leer(`${PAQUETES}d4-t4-h5-v1.md`), /^> \*\*FUNDIDA EN H4/);
});

test("★★★ ficha: el mismo id, el nombre nuevo, la consigna, las preguntas, las zonas y la interfaz del paquete", () => {
  assert.equal(D.H4_ID, "t4-el-arqueo-de-rosa");
  assert.equal(D.H4.nombre, "El arqueo de caja menor");
  assert.ok(PAQ.includes(`## H4 «${D.H4.nombre}» · \`${D.H4_ID}\``));
  assert.ok(PAQ.includes(`(14 pal. · INFLESZ 94,9; tope 27 de Hanayama, que con el título de 5 palabras baja a 24): ${D.H4.consigna}`));
  for (const [k, p] of Object.values(D.PREGUNTAS_H4).entries()) assert.ok(PAQ.includes(`| ${k + 1} | ${p} | 1 |`), p);
  assert.ok(PAQ.includes(`«${D.ZONAS_H4[0][1]}», «${D.ZONAS_H4[1][1]}», «${D.ZONAS_H4[2][1]}», en el orden de la regla`));
  for (const r of Object.values(D.REGLA_H4)) assert.ok(PAQ.includes(`«${r}`), r);
  for (const b of Object.values(D.BOTON_H4)) assert.ok(PAQ.includes(`«${b}»`), b);
  for (const t of Object.values(D.SOBRE_H4)) assert.ok(PAQ.includes(`«${t}»`), t);
  assert.ok(PAQ.includes(`«${D.resumenH4("N")}»`));
  assert.ok(PAQ.includes(`(38 pal. · INFLESZ 82,7): ${D.CIERRE_H4.texto}`));
  assert.ok(PAQ.includes(`«${D.CIERRE_H4.pie}»`));
  assert.equal(D.rotuloPasoH4(2, 4), "Paso 2 de 4");
  assert.ok(PAQ.includes("«Paso n de N», con N = 2 si cuadra y 4 si no"));
});

test("★★★ las ocho rondas: título, tarjeta, sobre, y cada acierto y cada error de cada pregunta, letra por letra", () => {
  assert.deepEqual(D.RONDAS_H4.map((r) => r.id), ["h4-1", "h4-6", "h4-2", "h4-4", "h5-1", "h5-3", "h5-2", "h5-4"]);
  for (const r of D.RONDAS_H4) {
    const fila = PAQ.split("\n").find((l) => l.startsWith(`| ${r.id.toUpperCase()} | ${r.titulo} | ${r.tarjeta} |`));
    assert.ok(fila, `${r.id}: su fila de tarjeta no está`);
    assert.ok(fila.endsWith(`| ${cifra(r.gastos)} · ${cifra(r.caja)} |`), `${r.id}: el sobre`);
    const bloque = PAQ.slice(PAQ.indexOf(`**${r.id.toUpperCase()} · ${r.titulo}**`));
    assert.ok(bloque.length < PAQ.length, `${r.id}: su bloque de devoluciones no está`);
    const hasta = bloque.slice(0, bloque.indexOf("\n**", 5) > 0 ? bloque.indexOf("\n**", 5) : undefined);
    for (const p of r.preguntas) {
      assert.ok(hasta.includes(`| Correcto. ${p.acierto} |`), `${r.id} ${p.id}: el acierto`);
      for (const t of Object.values(p.errores)) assert.ok(hasta.includes(`| ${t} |`), `${r.id} ${p.id}: «${t.slice(0, 40)}»`);
    }
    assert.ok(PAQ.includes(`«${r.pagina}»`) || PAQ.includes(r.pagina.replace("Basado en el libro, ", "… ")), `${r.id}: la página`);
  }
  assert.ok(!D.RONDAS_H4.some((r) => r.id === "h4-3" || r.id === "h4-5"), "H4-3 y H4-5 salieron");
});

test("★★★ cada pregunta trae un mensaje por cada opción equivocada; la 4, uno por cuenta y el del lado", () => {
  for (const r of D.RONDAS_H4) {
    assert.deepEqual(r.preguntas.map((p) => p.id), r.tipo === D.CUADRA ? [D.ARQUEO, D.CHEQUE] : [D.ARQUEO, D.DIFERENCIA, D.CHEQUE, D.CUENTA], r.id);
    for (const p of r.preguntas) {
      if (p.id === D.CUENTA) {
        assert.deepEqual(Object.keys(p.errores).sort(), [...D.CUENTAS_H4.map((c) => c.id).filter((c) => c !== p.correcta.cuenta), "lado"].sort(), r.id);
      } else {
        assert.equal(p.opciones.length, 3);
        assert.deepEqual(Object.keys(p.errores).map(String).sort(), p.opciones.filter((o) => o !== p.correcta).map(String).sort(), `${r.id} ${p.id}`);
      }
    }
  }
});

test("★★ INFLESZ con la herramienta oficial: cada texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H4.consigna, D.CIERRE_H4.texto, D.ALT_H4, ...D.RONDAS_H4.flatMap((r) => [r.tarjeta, ...r.preguntas.flatMap((p) => [`Correcto. ${p.acierto}`, ...Object.values(p.errores)])])];
  for (const t of textos) { const v = inflesz(t); if (v.aplica) assert.ok(v.valor >= 65, `${v.valor}: ${t}`); }
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ en cada ronda, la caja más el cheque da el fondo; la diferencia y los cheques cuadran con el tipo, y la diferencia cae en la regla", () => {
  const vistos = new Set();
  for (const r of D.RONDAS_H4) {
    assert.equal(r.caja + r.cheque, r.fondo, `${r.id}: caja + cheque ≠ fondo`);
    assert.equal(r.suma, r.gastos + r.caja);
    if (r.tipo === D.CUADRA) assert.deepEqual([r.dif, r.cheque], [0, r.gastos], r.id);
    if (r.tipo === D.SOBRA) assert.deepEqual([r.suma - r.fondo, r.cheque], [r.dif, r.gastos - r.dif], r.id);
    if (r.tipo === D.FALTA) assert.deepEqual([r.fondo - r.suma, r.cheque], [r.dif, r.gastos + r.dif], r.id);
    assert.ok(!D.fueraH4(r.dif), `${r.id}: la diferencia cae fuera de la regla`);
    vistos.add(r.tipo === D.FALTA ? `${r.tipo}:${r.politica}` : r.tipo);
    /* Solo el cheque correcto deja «caja + cheque» en la marca del fondo. */
    const p3 = r.preguntas.find((p) => p.id === D.CHEQUE);
    assert.deepEqual(p3.opciones.filter((c) => r.caja + c === r.fondo), [r.cheque], `${r.id}: más de un cheque llega al fondo`);
  }
  assert.equal(vistos.size, 4, "faltan tipos de ronda");
});

test("★★★ el sorteo: cuatro rondas, una de cada par, cada tipo una vez, y 14 preguntas", () => {
  for (let k = 0; k < 40; k++) {
    const rs = D.sortearH4(barajar);
    assert.equal(rs.length, 4);
    for (const par of D.PARES_H4) assert.equal(rs.filter((r) => par.includes(r.id)).length, 1, par.join("/"));
    assert.equal(rs.reduce((s, r) => s + r.preguntas.length, 0), 14);
    for (const r of rs) assert.deepEqual(r.preguntas[0].opciones, ["falta", "cuadra", "sobra"], "las zonas se barajaron");
  }
});

/* ═══════════ 3 · LA PARTIDA ═══════════ */

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML)", () => {
  for (const r of D.RONDAS_H4) for (const p of r.preguntas) {
    const m = montarJuego({ items: [solo(r, [p.id])] });
    try {
      const raiz = q(m, "[data-t4-h4]");
      for (const x of [p.acierto, ...Object.values(p.errores), r.pagina, "Correcto", "Iba aquí", "suman", "tu diferencia", "caja + tu cheque", ...(p.id === D.ARQUEO && r.suma !== r.fondo ? [cifra(r.suma)] : [])]) {
        assert.ok(!raiz.textContent.includes(x), `${r.id} ${p.id}: «${x.slice(0, 30)}» en el texto`);
        assert.ok(!raiz.outerHTML.includes(x), `${r.id} ${p.id}: «${x.slice(0, 30)}» en el HTML`);
      }
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje], [data-aguja], [data-tramo], [data-asiento]"), null);
      assert.equal(q(m, "[data-tarjeta-ronda] p").textContent, r.tarjeta);
    } finally { m.desmontar(); }
  }
});

test("★★★ gesto mínimo: cada error con nombre de cada pregunta de cada ronda se comete con un toque y sale ESE mensaje; ninguna pregunta lleva «Comprobar»", async () => {
  for (const r of D.RONDAS_H4) for (const p of r.preguntas) {
    const malas = p.id === D.CUENTA
      ? [...D.CUENTAS_H4.filter((c) => c.id !== p.correcta.cuenta).flatMap((c) => ["debe", "haber"].map((lado) => [{ cuenta: c.id, lado }, p.errores[c.id]])),
        [{ cuenta: p.correcta.cuenta, lado: p.correcta.lado === "debe" ? "haber" : "debe" }, p.errores.lado]]
      : p.opciones.filter((o) => o !== p.correcta).map((o) => [o, p.errores[o]]);
    for (const [v, texto] of malas) {
      const m = montarJuego({ items: [solo(r, [p.id])] });
      try {
        assert.equal(comprobar(m), null, `${r.id} ${p.id}: «Comprobar» con una sola ficha`);
        await responder(m, p, v);
        assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error");
        assert.equal(devolucion(m), texto, `${r.id} ${p.id} ${JSON.stringify(v)}`);
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ la regla dibuja lo que decide el estudiante: la suma, su diferencia y su cheque; en el error, coral y a los 0,7 s lo que era", async () => {
  const r = ronda("h4-2"); /* sobrante: suman 504.300, diferencia 4.300, cheque 387.500 */
  const m = montarJuego({ items: [r] });
  try {
    await tocar(opcion(m, "falta"));
    assert.equal(opcion(m, "falta").dataset.marca, "mal");
    assert.equal(q(m, "[data-aguja=suman]"), null, "la aguja «suman» salió antes de tiempo");
    await esperar(ESPERA_ERROR_MS + 50);
    assert.equal(opcion(m, "sobra").dataset.marca, "era");
    assert.ok(q(m, "[data-aguja=suman]"));
    assert.ok(desvio("[data-aguja=suman]", m) > 50, "un sobrante va a la derecha del fondo");
    await tocar(siguiente(m));
    /* Pregunta 2: la cifra equivocada se dibuja como su tramo, en coral; la correcta, después. */
    await tocar(opcion(m, 108_200));
    assert.ok(q(m, "[data-tramo=elegido]"));
    assert.ok(CORAL.test(q(m, "[data-tramo=elegido]").style.background), "el tramo equivocado no va en coral");
    assert.match(q(m, "[data-rot=tu-diferencia]").textContent, /tu diferencia 108\.200 →/);
    await esperar(ESPERA_ERROR_MS + 50);
    assert.ok(q(m, "[data-tramo=diferencia]"));
    assert.match(q(m, "[data-rot=diferencia]").textContent, /^Iba aquí: 4\.300$/);
    await tocar(siguiente(m));
    /* Pregunta 3: el cheque correcto deja la aguja en la marca del fondo (50 %). */
    await tocar(opcion(m, 387_500));
    assert.equal(desvio("[data-aguja=con-el-cheque]", m), 50);
    assert.equal(visible(q(m, "[data-devolucion]")), `Correcto. ${r.preguntas[2].acierto}`);
    await tocar(siguiente(m));
    /* Pregunta 4: la cuenta, con un toque (sin «Comprobar»), y con el acierto el asiento del reembolso. */
    assert.equal(q(m, "[data-asiento]"), null);
    await tocar(mitad(m, "ino-sobrante:haber"));
    assert.equal(mitad(m, "ino-sobrante:haber").dataset.marca, "bien");
    const lineas = [...m.caja.querySelectorAll("[data-linea-asiento]")].map((x) => [...x.querySelectorAll("span")].map((y) => y.children.length ? null : y.textContent).filter(Boolean));
    assert.deepEqual(lineas, [["Gastos generales", "391.800"], ["Ingresos no operacionales", "– sobrante de caja menor", "4.300"], ["Bancos", "387.500"]]);
  } finally { m.desmontar(); }
});

test("★★★ un cheque equivocado deja la aguja fuera de la marca, y el que suma la diferencia la pasa del fondo", async () => {
  const r = ronda("h5-1"); /* faltante: caja 41.700, cheque 358.300 */
  for (const [v, esFondo] of [[358_300, true], [352_800, false], [347_300, false]]) {
    const m = montarJuego({ items: [solo(r, [D.CHEQUE])] });
    try {
      await tocar(opcion(m, v));
      const x = desvio("[data-aguja=con-el-cheque]", m);
      assert.equal(x === 50, esFondo, `${v}: la aguja en ${x}`);
    } finally { m.desmontar(); }
  }
});

test("★★★ «Ronda n de 4» coincide con el pulso activo; al terminar, el cierre y onCompletar con las 14 preguntas", async () => {
  const items = ["h4-1", "h4-2", "h5-1", "h5-2"].map(ronda);
  const m = montarJuego({ items });
  try {
    let n = 0;
    for (const [k, r] of items.entries()) {
      for (const [j, p] of r.preguntas.entries()) {
        const avance = { n: Number(q(m, "[data-avance]").textContent.match(/Ronda (\d) de 4/)[1]), activo: [...m.caja.querySelectorAll("[data-nodo]")].findIndex((x) => x.dataset.nodo === "actual") + 1 };
        assert.deepEqual(avance, { n: k + 1, activo: k + 1 });
        await responder(m, p, n === 0 ? (p.id === D.CUENTA ? null : p.opciones.find((o) => o !== p.correcta)) : p.correcta);
        n += 1;
        const ultima = j === r.preguntas.length - 1;
        assert.equal(q(m, "[data-paso]").textContent, `Paso ${j + 1} de ${r.preguntas.length}`);
        assert.equal(siguiente(m).textContent, !ultima ? D.BOTON_H4.siguientePaso : k < 3 ? D.BOTON_H4.siguienteRonda : D.BOTON_H4.verResumen);
        await tocar(siguiente(m));
      }
    }
    assert.equal(q(m, "[data-resumen]").textContent, "13 de 14 respuestas al primer intento.");
    assert.equal(q(m, "[data-cierre]").textContent, D.CIERRE_H4.texto);
    const [pct, , detalle] = m.completados[0];
    assert.equal(Math.round(pct * 100) / 100, Math.round((13 / 14) * 10000) / 100);
    assert.equal(detalle.length, 14);
    assert.deepEqual(detalle[0], { item: "h4-1:arqueo", ok: false, intentos: 1, respuesta: "falta", orden: 1 });
    assert.ok(detalle.some((x) => x.item === "h5-2:cuenta" && x.ok));
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es Check y borde blanco; teal y ámbar solo en «Debe» y «Haber»; seguir es el Responder teal", async () => {
  const r = ronda("h5-1");
  const m = montarJuego({ items: [solo(r, [D.CUENTA])] });
  try {
    await responder(m, r.preguntas[3], r.preguntas[3].correcta);
    const raiz = q(m, "[data-t4-h4]");
    const tonos = [...new Set(conColor(raiz, TEAL_AMBAR).filter((e) => !e.closest("[data-avance-t4]")).map((e) => e.textContent.trim()))].filter((x) => x && !/^Ronda/.test(x)).sort();
    assert.deepEqual(tonos, ["DEBE", "Debe", "HABER", "Haber"]);
    assert.deepEqual(conColor(q(m, "[data-figura]"), CORAL), []);
    assert.equal(w.getComputedStyle(mitad(m, "cxc-empleados:debe")).borderTopColor, "rgb(248, 249, 250)");
    /* El avance es el Responder compartido: teal con texto #06202A (prompt maestro §4.3). Un botón blanco no pasa. */
    assert.equal(w.getComputedStyle(siguiente(m)).backgroundColor, "rgb(42, 157, 143)");
    assert.equal(w.getComputedStyle(siguiente(m)).color, "rgb(6, 32, 42)");
  } finally { m.desmontar(); }
  const m2 = montarJuego({ items: [solo(r, [D.ARQUEO])] });
  try {
    await tocar(opcion(m2, "falta"));
    assert.equal(opcion(m2, "falta").dataset.marca, "bien");
    assert.equal(w.getComputedStyle(opcion(m2, "falta")).borderTopColor, "rgb(248, 249, 250)");
    assert.deepEqual(conColor(q(m2, "[data-figura]"), TEAL_AMBAR), []);
  } finally { m2.desmontar(); }
  const imports = leer("src/components/t4/ElArqueo.jsx").split("\n").filter((l) => /^import /.test(l)).join("\n");
  assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento|Responder)\b/);
});

test("★★ en modo demo: sin Encabezado ni Pulsos, solo la pregunta 1, sin seguir y sin reportar", async () => {
  const m = montarJuego({ items: [D.EJEMPLO_H4], modoDemo: true });
  try {
    assert.ok(q(m, "[data-t4-h4-demo]"));
    assert.equal(q(m, "[data-encabezado]"), null);
    assert.equal(q(m, "[data-avance]"), null);
    await tocar(opcion(m, "sobra"));
    assert.equal(visible(q(m, "[data-devolucion]")), "Correcto. $268.400 más $54.300 dan $322.700: más que el fondo de $320.000.");
    assert.ok(desvio("[data-aguja=suman]", m) > 50);
    assert.equal(siguiente(m), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

/* ═══════════ 4 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A3: evaluativa, DIFÍCIL, 50 FP, con el nombre nuevo; la vista la abre con el componente nuevo", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H4_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H4_ID), ids.indexOf("t4-a3-el-arqueo") + 1);
  assert.equal(TEMA.actividades.find((a) => a.id === D.H4_ID).nombre, "El arqueo de caja menor");
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H4_ID).Mecanica, ElArqueo);
  assert.ok(!ids.includes("t4-al-empleado-o-al-gasto"), "H5 sigue en el tema");
});

test("★★★ la 0203 no cambia (ya corrió en producción): sigue en medio · 25, y ninguna migración nombra los ítems", () => {
  assert.match(leer("supabase/migrations/0203_t4_el_arqueo_de_rosa.sql"), /\('t4-el-arqueo-de-rosa',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  const dir = new URL("supabase/migrations/", RAIZ);
  for (const r of D.RONDAS_H4) for (const p of r.preguntas) {
    const it = D.itemH4(r.id, p.id);
    assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(`'${it}'`)), [], it);
  }
});

test("★★★ el panel docente lee cada item_id que guarda la partida (y los de las rondas que salieron)", () => {
  for (const r of D.RONDAS_H4) for (const p of r.preguntas) assert.equal(etiquetaDeItem(D.H4_ID, D.itemH4(r.id, p.id)), recortar(`${r.titulo} · ${p.pregunta}`));
  assert.ok(etiquetaDeItem(D.H4_ID, "h4-3:cheque"), "h4-3 (salió) ya no se lee");
  assert.equal(etiquetaDeItem(D.H4_ID, "h4-9:arqueo"), null);
});

test("★★★ «Así se juega»: pasos, ronda propia (vivero, 320.000) y texto alternativo del paquete; la mano toca «Sobra»", () => {
  const asi = ASI_SE_JUEGA[D.H4_ID];
  assert.equal(asi.consigna, D.H4.consigna);
  for (const p of D.PASOS_H4) assert.ok(PAQ.includes(`| ${p} |`), p);
  assert.ok(PAQ.includes(`| ${D.EJEMPLO_H4.tarjeta} |`));
  assert.ok(PAQ.includes(`| ${D.ALT_H4} |`));
  assert.ok(PAQ.includes(`| Correcto. ${D.EJEMPLO_H4.preguntas[0].acierto} |`));
  assert.deepEqual(D.EJEMPLO_H4.preguntas.map((p) => p.id), [D.ARQUEO]);
  assert.deepEqual(asi.guion.toques.map((t) => t.en), ['[data-opcion="sobra"]']);
  assert.equal(D.EJEMPLO_H4.suma, 322_700);
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h4]: la partida; la demo lleva el suyo", async () => {
  try { w.localStorage.clear(); } catch { /* sin almacenamiento */ }
  const m = montar(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H4_ID, onBack: () => {} })));
  await esperar(0);
  try {
    assert.equal(m.caja.querySelectorAll("[data-t4-h4]").length, 1);
    assert.equal(m.caja.querySelectorAll("[data-t4-h4-demo]").length, 1);
  } finally { m.desmontar(); }
});

test("★★★ D2: el objetivo de la pieza se ve antes de empezar, en el Encabezado compartido (por su prop), antes de la consigna", () => {
  const m = montarJuego();
  try {
    const o = m.caja.querySelector("[data-encabezado] [data-objetivo]");
    assert.equal(o?.textContent, D.H4.objetivo);
    assert.ok(o.compareDocumentPosition(m.caja.querySelector("[data-encabezado] [data-consigna]")) & 4, "el objetivo no va antes de la consigna");
  } finally { m.desmontar(); }
});
