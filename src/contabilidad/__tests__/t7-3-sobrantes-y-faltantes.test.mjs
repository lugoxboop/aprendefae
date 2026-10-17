import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, prepararDom, citas, CONDICION } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";
import { SOBRANTE as C7, MELLO_T73, NO_APLICADAS, aplicarAlRecorte, palabrasAlAcertar } from "./correccionesMelloAciertos.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A5 «Sobrantes y faltantes» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra
 *   · Mello (mello-recortes-v1.md): la línea nueva del resumen; y, llegada
 *     por L, la pista de P1
 *   · la respuesta regalada de P2 se corrigió: «al haber» ya no se lee
 *     antes de preguntarlo
 *   · las dos barras, libros contra conteo, a la misma escala
 *   · ACIERTOS C7: P1 `sobrante` sale de t7-3-tres-aciertos-c7.md (Near),
 *     que Mello pasa sin correcciones (auditoria-mello-enganche-v6-y-t7-3-
 *     aciertos.md, §2.3): la condición de la ley va arriba, a la vista, y la
 *     del permanente («solo») en el acierto; sin «¿Por qué?» (C7); 60
 *     palabras al acertar (B2). La «Opcional» de Mello NO se aplica
 *   · las cifras de I-1 e I-2; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a5.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4 } = await import("../c4/t73a5_c4.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const MELLO = leer("orquestador/conocimiento/paquetes/mello-recortes-v1.md");
const P = A.PIEZA_SOBRANTES_Y_FALTANTES;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);

/* Mello, entrega 3: «Al resumen se agrega: «…»». Va antes del «Siguiente». */
const MELLO_A5 = MELLO.slice(MELLO.indexOf("**«Sobrantes y faltantes»"), MELLO.indexOf("**«La provisión para inventarios»"));
const LINEA_MELLO = citas(MELLO_A5.split("\n").find((l) => l.includes("Al resumen se agrega")))[0];
assert.equal(LINEA_MELLO, "Estos ajustes son del sistema permanente.");
s("resumen").lineas.splice(s("resumen").lineas.length - 1, 0, LINEA_MELLO);
/* La pista de P1, de la auditoría de pistas de Mello (mello-pistas-distractores-v1.md). */
assert.equal(s("sobrante").pista, "El sobrante es la diferencia entre lo que hay en la bodega y lo que dicen los libros.");
s("sobrante").pista = "El sobrante no es todo lo que hay en la bodega. ¿Qué parte de lo contado es?";
assert.ok(leer("orquestador/conocimiento/paquetes/mello-pistas-distractores-v1.md").includes(`«${s("sobrante").pista}»`));
/* Aciertos C7: P1, con la tabla final de Near (Mello: PASA). La pista y los errores no cambian. */
aplicarAlRecorte(s("sobrante"), C7);

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte con Mello, letra por letra", () => {
  assert.deepEqual(S.pantallas.map((x) => x.id), ["portada", "sobrante", "faltante", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  assert.deepEqual(pantalla("resumen").tras.at(-1), LINEA_MELLO);
  for (const id of ["el-conteo", "la-lista"]) assert.equal(pantalla(id), undefined, id);
});

test("★★★ la respuesta regalada se corrigió: antes de preguntar el lado del faltante, nada dice «haber»", () => {
  const f = pantalla("faltante");
  for (const t of [...(f.parrafos ?? []), ...(f.tras ?? []), f.pregunta]) assert.doesNotMatch(t, /haber/i, t);
  assert.match(f.acierto.texto, /va al haber/);
});

test("★★★ C7 · P1 sin plegado: «al menos… a más tardar…» arriba y «solo… en el sistema permanente» en el acierto, a la vista", () => {
  const p = pantalla("sobrante");
  assert.equal(p.acierto.porque, undefined);
  assert.equal(p.acierto.porqueALaVista, undefined);
  assert.match(p.parrafos[0], /al menos una vez al año, a más tardar el 31 de diciembre/);
  assert.match(p.acierto.texto, /Estos ajustes solo se dan en el sistema permanente\./);
  assert.match(p.acierto.texto, CONDICION);
  assert.deepEqual(P.pantallas.filter((x) => x.acierto?.porqueALaVista).map((x) => x.id), []);
});

test("★★★ P1 dice lo de la tabla final de Near, letra por letra (Mello: PASA); la opcional no se aplica; B2: 60", () => {
  assert.match(MELLO_T73, /### 2\.3 `sobrante` · Sobrantes y faltantes: PASA\n/);
  const p = pantalla("sobrante");
  assert.deepEqual(p.parrafos, C7.Texto.textos);
  assert.equal(p.pregunta, C7.Pregunta.textos[0]);
  assert.deepEqual(p.opciones.map((o) => o.texto), C7.Opciones.textos);
  assert.equal(p.acierto.texto, C7.Acierto.textos[0]);
  assert.deepEqual(p.figuras[0].barras.map((b) => `${b.rot} $${cifra(b.v)}`), C7["Rótulos de la figura"].textos);
  assert.deepEqual(p.acierto.asientos[0].lineas.map((l) => `${l.cuenta} · ${l.lado === "debe" ? "Debe" : "Haber"} $${cifra(l.monto)}`), C7["Figura del acierto"].textos);
  /* La opcional: «Baja el costo de la mercancía vendida» no vuelve. */
  assert.ok(MELLO_T73.includes(NO_APLICADAS.t73Opcional));
  assert.doesNotMatch(p.acierto.texto, /Baja el costo/);
  assert.equal(palabrasAlAcertar(C7), 60);
});

test("★★★ las cifras de I-1 e I-2 se recalculan; ninguna de X1-X4 ni la que Near descartó", () => {
  const C = A.I_LIBRO;
  assert.equal(C.sobrante, C.conteoSobra - C.libros);
  assert.equal(C.faltante, C.libros - C.conteoFalta);
  assert.deepEqual(pantalla("sobrante").acierto.asientos[0].lineas.map((l) => [l.cuenta, l.lado, l.monto]), [["Inventario de mercancías", "debe", C.sobrante], ["Costo de mercancía vendida", "haber", C.sobrante]]);
  assert.deepEqual(pantalla("faltante").acierto.asientos[0].lineas.map((l) => [l.cuenta, l.lado, l.monto]), [["Costo de mercancía vendida", "debe", C.faltante], ["Inventario de mercancías", "haber", C.faltante]]);
  const prohibidas = [960_000, 800_000, 175_000, 5_625_000, 5_800_000, 1_200_000, 262_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

/* ═══════════ 2 · MONTADA: EL PATRÓN C4 (toda decisión se pinta) ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
/* Las barras de cada figura: [título, [rótulo, cifra, ancho]...]. */
const barras = (c) => [...c.querySelectorAll("figure[data-barras]")].map((f) => [f.querySelector("figcaption").textContent,
  ...[...f.querySelectorAll("[data-barra]")].map((b) => [b.querySelector(".br-rot").textContent, b.querySelector(".br-v").textContent, b.querySelector(".br-relleno").style.width])]);
const ancho = (v, max) => `${(v / max) * 100}%`;
const C = A.I_LIBRO;
const SOBRA = [["Saldo en libros", "465.000", ancho(C.libros, C.conteoSobra)], ["Conteo físico", "495.000", "100%"]];
/* Una sola escala en toda la pieza (la del conteo mayor): el saldo en libros mide lo mismo en cada pantalla. */
const FALTA = [["Saldo en libros", "465.000", ancho(C.libros, C.conteoSobra)], ["Conteo físico", "430.000", ancho(C.conteoFalta, C.conteoSobra)]];

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el recorte; el ajuste tocado mueve los libros frente al conteo", conReloj(async () => {
  const m = await montar();
  try {
    await recorrerC4({
      c: m.caja, w, act, P, S, c4: C4,
      async alLlegar(id) {
        const c = m.caja;
        if (id === "sobrante") assert.deepEqual(barras(c), [["Ejemplo del libro · 31 de diciembre", ...SOBRA]]);
        if (id === "faltante") assert.deepEqual(barras(c), [["El mismo ejemplo, otro conteo", ...FALTA]]);
        if (id === "resumen") assert.deepEqual(barras(c), [["Conteo mayor: sobrante", ...SOBRA], ["Conteo menor: faltante", ...FALTA]]);
        if (id === "portada") assert.deepEqual(barras(c), []);
        /* El conteo más corto se ve más corto. */
        if (id === "faltante") assert.ok(parseFloat(FALTA[1][2]) < parseFloat(FALTA[0][2]));
      },
      async alElegir(id, o) {
        const c = m.caja;
        /* La barra de los libros ajustados, con lo que la opción haría, a la misma escala que las otras dos. */
        const sobra = id === "sobrante";
        const nuevo = sobra ? C.libros + Number(o.texto.replace(/\D/g, "")) : { debe: C.libros + C.faltante, haber: C.libros - C.faltante, "no-se-mueve": C.libros }[o.id];
        const conteo = sobra ? C.conteoSobra : C.conteoFalta;
        const max = Math.max(C.conteoSobra, nuevo);
        const [, ...bs] = barras(c)[0];
        assert.deepEqual(bs, [["Saldo en libros", "465.000", ancho(C.libros, max)], ["Conteo físico", cifra(conteo), ancho(conteo, max)], ["Libros, ajustados", cifra(nuevo), ancho(nuevo, max)]]);
        assert.equal(nuevo === conteo, Boolean(o.correcta));
        assert.equal(c.querySelector("[data-asiento]"), null);
      },
      async alVeredicto(id, o, H) {
        assert.ok(H.figura().querySelector('[data-barra="Libros, ajustados"].t73c4-mal'), `${id} · ${o.id}: la barra en coral`);
      },
      async alAcertar(id) {
        const c = m.caja;
        const as = c.querySelector("[data-asiento]");
        assert.equal(as.dataset.asiento, "sin-fecha");
        assert.equal(as.querySelector("[data-sumas]"), null);
        assert.ok(c.querySelector('[data-barra="Libros, ajustados"].t73c4-toca'));
      },
    });
  } finally {
    m.desmontar();
  }
}));

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, después de A4 entre las de Aprender", () => {
  assert.equal(A.A5_ID, "t7-3-sobrantes-y-faltantes");
  assert.equal(P.numero, 5);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A5_ID), ids.indexOf("t7-3-descuento-en-dos-libros") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A5_ID), piezas.indexOf("t7-3-descuento-en-dos-libros") + 1);
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A5_ID).Pieza, AprenderT7_3C4);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A5_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a5.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
