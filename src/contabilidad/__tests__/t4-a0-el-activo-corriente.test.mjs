import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 «El activo corriente» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a0-v3-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · la figura «El año en marcha» de Hanayama: todo es una función del mes.
 *     Al pasar el año la mercancía se vuelve plata y el edificio cruza la
 *     raya; si el año vuelve, se apagan otra vez
 *   · el juego (P3): «Pasar el año» espera a las tres marcas; la raya decide;
 *     ✓ en la bien elegida, ✗ y coral en la mal elegida; la que era no se
 *     marca. Antes de pasar el año, nada de la devolución está en el DOM, y
 *     «Seguir» no aparece hasta el acierto (D7)
 *   · sin teal ni ámbar en ninguna parte de A0; coral solo en el error
 *   · Aprender: sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, tecla, esperar, movimientoReducido, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const Z = await import("../../data/contabilidadT4A0.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");
const { pantallasDe, seccionDe, renglones, textoDe } = await import("./t4-rediseno-canon.mjs");

const CANON = "d4-t4-a0-v3-rediseno.md";
const PAQ = leer(`${PAQUETES}${CANON}`);
const CANON_P = pantallasDe(PAQ);
const P = Z.PIEZA_EL_ACTIVO_CORRIENTE;
const pantalla = (id) => P.pantallas.find((p) => p.id === id);

/* Lo que la pantalla de los datos dice, por lugar del paquete. */
function porLugar(p) {
  const r = [];
  for (const t of p.antes ?? []) r.push(["Antes de la figura", t]);
  for (const t of p.despues ?? []) r.push(["Después de la figura", t]);
  if ("acierto" in p) r.push(["Acierto (tras «Correcto.»)", p.acierto]);
  if (p.error) r.push(["Error (✗ y el texto)", p.error]);
  (p.resumen ?? []).forEach((t, i) => r.push([`Resumen ${i + 1}`, t]));
  if (p.siguiente) r.push(["Siguiente", p.siguiente]);
  r.push(["Pie", p.pie]);
  return r;
}

const seg = (caja, fila, lado) => caja.querySelector(`[data-fila="${fila}"] [data-seg="${lado}"]`);

/* El juego de P3, bien: la mercancía antes de la raya, la deuda y el edificio después, y «Pasar el año». */
function acertarP3(caja) {
  for (const [f, l] of [["mercancia", "antes"], ["deuda", "despues"], ["edificio", "despues"]]) tocar(caja.querySelector(`[data-fila="${f}"] [data-seg="${l}"]`));
  tocar(caja.querySelector("[data-accion=pasar]"));
}

/* Monta la pieza y avanza hasta la pantalla k; la pregunta del camino se acierta (con movimiento reducido, para que el año salte). */
function abrir(k = 0) {
  const antes = movimientoReducido(true);
  const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
  for (let i = 0; i < k; i++) {
    if (P.pantallas[i].pregunta) acertarP3(m.caja);
    tocar(m.caja.querySelector('[data-boton="seguir"]'));
  }
  movimientoReducido(antes);
  return m;
}
const filas = (caja) => Object.fromEntries([...caja.querySelectorAll("[data-fila]")].map((f) => [f.dataset.fila, f.dataset.estado]));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v3) y lo dice; los datos lo nombran", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de A0\.\*\*/);
  assert.match(PAQ, /hanayama-a0-rediseno\.md/);
  assert.match(PAQ, /katsumi-texto-rediseno\.md/);
  assert.match(leer("src/data/contabilidadT4A0.js"), new RegExp(CANON.replace(/\./g, "\\.")));
});

test("★★★ las 8 pantallas, en el orden del paquete; título e id; todas con la figura «ano»", () => {
  assert.equal(P.id, "t4-a0-el-activo-corriente");
  assert.equal(P.titulo, "El activo corriente");
  assert.deepEqual(P.pantallas.map((p) => p.id), CANON_P.map((p) => p.id));
  assert.equal(P.pantallas.length, 8);
  for (const p of P.pantallas) assert.equal(p.figura, "ano", p.id);
});

for (const c of CANON_P) {
  test(`★★★ ${c.id}: cada texto es el del paquete, letra por letra y en su lugar, ni uno más ni uno menos`, () => {
    assert.deepEqual(porLugar(pantalla(c.id)), c.textos.map((x) => [x.lugar, x.texto]));
  });
}

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y da lo que dice el paquete", () => {
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

test("★★★ la interfaz común: «Correcto.» en el acierto; el error sin palabra visible; «Incorrecto.» solo para el lector", () => {
  const com = renglones(seccionDe(PAQ, "Interfaz común del rediseño (A0, A1 y H1)"));
  assert.equal(textoDe(com, "Palabra del acierto (va antes del texto)"), "Correcto.");
  assert.equal(textoDe(com, "Solo para el lector de pantalla, delante del texto del error"), "Incorrecto.");
});

/* ═══════════ 2 · LA PANTALLA Y LA FIGURA ═══════════ */

test("★★★ cada pantalla, en el orden de Hanayama: antes → figura → después → resumen → siguiente → «Seguir» → pie (en la pregunta, tras el acierto)", () => {
  movimientoReducido(true);
  const m = abrir();
  try {
    for (const [k, p] of P.pantallas.entries()) {
      const zona = m.caja.querySelector("[data-pieza]");
      assert.equal(zona.dataset.pantalla, p.id);
      if (p.pregunta) {
        assert.equal(zona.querySelector('[data-boton="seguir"]'), null, `${p.id}: «Seguir» antes del acierto`);
        acertarP3(m.caja);
      }
      const orden = [...zona.querySelectorAll("[data-texto], [data-figura], [data-boton], [data-pie]")]
        .filter((e) => !e.parentElement.closest("[data-figura]"))
        .map((e) => (e.matches("[data-figura]") ? "FIGURA" : e.matches("[data-boton]") ? "SEGUIR" : e.matches("[data-pie]") ? "PIE" : e.textContent));
      const esperado = [...(p.antes ?? []), "FIGURA", ...(p.despues ?? []), ...(p.resumen ?? []), ...(p.siguiente ? [p.siguiente] : []), ...(k < 7 ? ["SEGUIR"] : []), "PIE"];
      assert.deepEqual(orden, esperado, p.id);
      assert.equal(zona.querySelector("[data-pie]").textContent, p.pie);
      if (k < 7) tocar(zona.querySelector('[data-boton="seguir"]'));
    }
  } finally { m.desmontar(); movimientoReducido(false); }
});

test("★★★ D7 · P3 es la única pantalla con pregunta, y su «Seguir» no aparece sin el acierto: ni al llegar, ni marcando, ni tras el error, ni tras «Otra vez»", async () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pregunta).map((p) => p.id), ["cual-cruza"]);
  movimientoReducido(true);
  const m = abrir(3);
  try {
    const seguir = () => m.caja.querySelector('[data-boton="seguir"]');
    assert.equal(seguir(), null, "al llegar");
    tocar(seg(m.caja, "mercancia", "despues"));
    tocar(seg(m.caja, "deuda", "despues"));
    tocar(seg(m.caja, "edificio", "despues"));
    assert.equal(seguir(), null, "marcando");
    tocar(m.caja.querySelector("[data-accion=pasar]"));
    await esperar(0);
    assert.equal(m.caja.querySelector("[data-mensaje]").dataset.mensaje, "error");
    assert.equal(seguir(), null, "tras el error");
    tocar(m.caja.querySelector("[data-accion=otra-vez]"));
    assert.equal(seguir(), null, "tras «Otra vez»");
    acertarP3(m.caja);
    await esperar(0);
    assert.equal(m.caja.querySelector("[data-mensaje]").dataset.mensaje, "acierto");
    assert.ok(seguir(), "tras el acierto no aparece «Seguir»");
    tocar(seguir());
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "los-fijos");
  } finally { m.desmontar(); movimientoReducido(false); }
});

test("★★★ P0: el año se arrastra con el teclado; en el mes 1 la mercancía es plata, en la raya el edificio cruza; si vuelve, se apaga", () => {
  const m = abrir(0);
  try {
    const pista = m.caja.querySelector('[data-pista][role="slider"]');
    assert.ok(pista, "la pista no es un slider");
    assert.equal(pista.getAttribute("aria-valuenow"), "0");
    assert.deepEqual(filas(m.caja), { mercancia: "espera", edificio: "espera" });
    tecla(pista, "ArrowRight");
    assert.equal(pista.getAttribute("aria-valuenow"), "1");
    assert.deepEqual(filas(m.caja), { mercancia: "plata", edificio: "espera" });
    assert.equal(m.caja.querySelector('[data-fila="mercancia"] [data-marca-fila]').textContent, "plata");
    tecla(pista, "End");
    assert.deepEqual(filas(m.caja), { mercancia: "plata", edificio: "despues" });
    assert.ok(m.caja.querySelector('[data-fila="edificio"] [data-cruza]'), "el edificio no cruza la raya");
    tecla(pista, "Home");
    assert.deepEqual(filas(m.caja), { mercancia: "espera", edificio: "espera" });
    assert.equal(m.caja.querySelector("[data-cruza]"), null);
  } finally { m.desmontar(); }
});

test("★★★ «Pasar el año» lo recorre solo y cambia la figura; con movimiento reducido salta al mes 12 sin animar", async () => {
  for (const reducido of [false, true]) {
    movimientoReducido(reducido);
    const m = abrir(2);
    try {
      await esperar(0);
      assert.deepEqual(filas(m.caja), { inversiones: "espera", cartera: "espera", inventarios: "espera" });
      tocar(m.caja.querySelector("[data-accion=pasar]"));
      if (reducido) assert.equal(m.caja.querySelector("[data-figura]").dataset.mes, "12", "con movimiento reducido no saltó");
      await esperar(reducido ? 0 : 3000);
      assert.equal(m.caja.querySelector("[data-figura]").dataset.mes, "12");
      assert.deepEqual(filas(m.caja), { inversiones: "plata", cartera: "plata", inventarios: "plata" });
      assert.ok(m.caja.querySelector("[data-accion=volver]"), "no aparece «Volver a hoy»");
    } finally { m.desmontar(); movimientoReducido(false); }
  }
});

test("★★★ P1: el efectivo y los depósitos ya son plata en «hoy»; P4: los cuatro fijos cruzan la raya; P5: el arriendo «se consumió»", () => {
  const p1 = abrir(1);
  try { assert.deepEqual(filas(p1.caja), { caja: "plata", bancos: "plata" }); } finally { p1.desmontar(); }
  const p4 = abrir(4);
  try {
    tecla(p4.caja.querySelector("[data-pista]"), "End");
    assert.deepEqual(filas(p4.caja), { "un-edificio": "despues", terreno: "despues", maquina: "despues", vehiculo: "despues" });
  } finally { p4.desmontar(); }
  const p5 = abrir(5);
  try {
    const pista = p5.caja.querySelector("[data-pista]");
    for (let i = 0; i < 5; i++) tecla(pista, "ArrowRight");
    assert.deepEqual(filas(p5.caja), { arriendo: "espera" });
    tecla(pista, "ArrowRight");
    assert.deepEqual(filas(p5.caja), { arriendo: "consumio" });
    assert.equal(p5.caja.querySelector("[data-marca-fila]").textContent, "se consumió");
  } finally { p5.desmontar(); }
});

test("★★★ P6 y P7: la figura quieta en el mes 12, sin pista ni acción", () => {
  for (const k of [6, 7]) {
    const m = abrir(k);
    try {
      const fig = m.caja.querySelector("[data-figura]");
      assert.equal(fig.dataset.mes, "12");
      assert.equal(fig.querySelector("button, [role=slider]"), null);
    } finally { m.desmontar(); }
  }
});

/* ═══════════ 3 · EL JUEGO (P3) ═══════════ */


test("★★★ P3: «Pasar el año» espera a las tres marcas, y antes de pasarlo nada de la devolución está en el DOM (PH8-2)", () => {
  const p = pantalla("cual-cruza");
  const m = abrir(3);
  try {
    const pasar = m.caja.querySelector("[data-accion=pasar]");
    assert.equal(pasar.getAttribute("aria-disabled"), "true");
    tocar(seg(m.caja, "mercancia", "antes"));
    tocar(seg(m.caja, "deuda", "despues"));
    assert.equal(pasar.getAttribute("aria-disabled"), "true");
    tocar(seg(m.caja, "edificio", "despues"));
    assert.equal(m.caja.querySelector("[data-accion=pasar]").getAttribute("aria-disabled"), null);
    const zona = m.caja.querySelector("[data-pieza]");
    for (const x of [p.error, "Correcto.", "Incorrecto."]) {
      assert.ok(!zona.textContent.includes(x), `«${x}» está en el DOM antes de pasar el año`);
      assert.ok(!zona.outerHTML.includes(x), `«${x}» está en el HTML antes de pasar el año`);
    }
    assert.equal(zona.querySelector("[data-mensaje], [data-veredicto]"), null);
    /* Las casillas no llevan texto: su nombre es para el lector. */
    assert.equal(seg(m.caja, "mercancia", "antes").textContent, "");
    assert.equal(seg(m.caja, "mercancia", "antes").getAttribute("aria-label"), "Mercancía: corriente, antes de la raya");
  } finally { m.desmontar(); }
});

test("★★★ P3 mal: la raya decide; ✗ y coral en la mal elegida, y la que era NO se marca (nombraría la respuesta); el error, ✗ y su texto, «Incorrecto.» solo para el lector", async () => {
  movimientoReducido(true);
  const p = pantalla("cual-cruza");
  const m = abrir(3);
  try {
    tocar(seg(m.caja, "mercancia", "despues"));
    tocar(seg(m.caja, "deuda", "antes"));
    tocar(seg(m.caja, "edificio", "despues"));
    tocar(m.caja.querySelector("[data-accion=pasar]"));
    await esperar(0);
    const ver = (f, l) => seg(m.caja, f, l).dataset.veredicto ?? null;
    assert.deepEqual([ver("mercancia", "despues"), ver("mercancia", "antes")], ["mal", null]);
    assert.deepEqual([ver("deuda", "antes"), ver("deuda", "despues")], ["mal", null]);
    assert.equal(m.caja.querySelector('[data-veredicto="era"], [data-marca="era"]'), null, "en Aprender no se marca la que era");
    assert.deepEqual([ver("edificio", "despues"), ver("edificio", "antes")], ["bien", null]);
    /* La pastilla con palabra, la de MARCA («✓ Correcto», «✗ No va aquí»: prompt maestro §4.2; nunca «era»), y el lector oye la palabra. */
    /* La pastilla va en la línea de marcas de su fila (P2 de Hanayama, §3.10), no en la casilla. */
    assert.equal(visible(seg(m.caja, "deuda", "antes")), "");
    assert.equal(visible(m.caja.querySelector('[data-linea-fila="deuda"]')), "No va aquí");
    assert.equal(visible(m.caja.querySelector('[data-linea-fila="edificio"]')), "Correcto");
    assert.ok(m.caja.querySelector('[data-linea-fila="deuda"] [data-icono="x"]') && m.caja.querySelector('[data-linea-fila="edificio"] [data-icono="check"]'), "los íconos de lucide");
    assert.equal(seg(m.caja, "mercancia", "despues").getAttribute("aria-label"), "Mercancía: no es corriente, después de la raya: No va aquí");
    assert.equal(seg(m.caja, "mercancia", "antes").getAttribute("aria-label"), "Mercancía: corriente, antes de la raya");
    const oido = [...m.caja.querySelectorAll("[aria-label]")].map((x) => x.getAttribute("aria-label")).join(" ");
    assert.doesNotMatch(`${visible(m.caja)} ${oido}`, /\bera\b/i, "nunca «era» en Aprender, ni a la vista ni para el lector");
    const msg = m.caja.querySelector("[data-mensaje]");
    assert.equal(msg.dataset.mensaje, "error");
    assert.equal(visible(msg), p.error);
    assert.ok(msg.querySelector('[data-icono="x"]'), "el X de lucide en el mensaje");
    assert.equal(msg.querySelector(".t4f-sr").textContent.trim(), "Incorrecto.");
    assert.ok(CORAL.test(w.getComputedStyle(seg(m.caja, "deuda", "antes")).borderTopColor), "la mal elegida no va en coral");
    assert.ok(!CORAL.test(w.getComputedStyle(seg(m.caja, "deuda", "despues")).borderTopColor), "la que no se eligió va en coral");
    /* «Otra vez» limpia las marcas y vuelve a hoy. */
    tocar(m.caja.querySelector("[data-accion=otra-vez]"));
    assert.equal(m.caja.querySelector("[data-veredicto], [data-mensaje]"), null);
    assert.equal(m.caja.querySelector("[data-figura]").dataset.mes, "0");
  } finally { m.desmontar(); movimientoReducido(false); }
});

test("★★★ E2 · P3: el veredicto lleva la devolución a la ventana con «nearest»; sin animación si el movimiento está reducido, suave si no", async () => {
  const original = w.Element.prototype.scrollIntoView;
  const llevados = [];
  w.Element.prototype.scrollIntoView = function (o) { llevados.push({ el: this, o }); };
  const antes = movimientoReducido(true);
  try {
    for (const quieto of [true, false]) {
      movimientoReducido(quieto);
      llevados.length = 0;
      const m = abrir(3);
      movimientoReducido(quieto);
      try {
        tocar(seg(m.caja, "mercancia", "antes"));
        tocar(seg(m.caja, "deuda", "despues"));
        tocar(seg(m.caja, "edificio", "despues"));
        assert.equal(llevados.length, 0, "antes del veredicto no se mueve la vista");
        tocar(m.caja.querySelector("[data-accion=pasar]"));
        await esperar(quieto ? 0 : 3200);
        const msg = m.caja.querySelector("[data-mensaje]");
        assert.ok(msg, "no hay devolución");
        assert.deepEqual(llevados.filter((x) => x.el === msg).map((x) => x.o), [{ block: "nearest", behavior: quieto ? "auto" : "smooth" }]);
      } finally { m.desmontar(); }
    }
  } finally { w.Element.prototype.scrollIntoView = original; movimientoReducido(antes); }
});

test("★★★ P3 bien: «Correcto.» y nada más; ✓ blanco en las tres; ni teal ni ámbar en ninguna parte de A0", async () => {
  movimientoReducido(true);
  const m = abrir(3);
  try {
    tocar(seg(m.caja, "mercancia", "antes"));
    tocar(seg(m.caja, "deuda", "despues"));
    tocar(seg(m.caja, "edificio", "despues"));
    tocar(m.caja.querySelector("[data-accion=pasar]"));
    await esperar(0);
    const msg = m.caja.querySelector("[data-mensaje]");
    assert.equal(msg.dataset.mensaje, "acierto");
    assert.equal(visible(msg), "Correcto.");
    assert.ok(msg.querySelector('[data-icono="check"]'), "el Check de lucide en el mensaje");
    assert.deepEqual([...m.caja.querySelectorAll("[data-veredicto]")].map((x) => x.dataset.veredicto), ["bien", "bien", "bien"]);
    const zona = m.caja.querySelector("[data-pieza]");
    assert.deepEqual(conColor(zona, TEAL_AMBAR).map((e) => e.outerHTML.slice(0, 60)), []);
    assert.deepEqual(conColor(zona, CORAL), [], "hay coral en un acierto");
  } finally { m.desmontar(); movimientoReducido(false); }
});

test("★★★ los rótulos de la figura van en renglones fijos que no se parten; sin círculos ni trazos discontinuos", async () => {
  const { CSS_ANO } = await import("../../components/t4/AnoEnMarcha.jsx");
  assert.match(CSS_ANO, /\.t4an-nom > span \{ white-space: nowrap; \}/);
  assert.match(CSS_ANO, /\.t4an-zona > span \{ white-space: nowrap; \}/);
  assert.doesNotMatch(CSS_ANO, /dashed|dotted|border-radius: 50%/);
  /* Los renglones fijos de Hanayama §3.1 (que caben en el 70 % lo mide la sonda en Chromium, no jsdom). */
  const F = Z.FILAS_A0;
  assert.deepEqual([F.edificioOficina.texto, F.bancos.texto, F.inversiones.texto, F.deuda.texto, F.arriendo.texto, F.mercancia.glosa],
    [["Edificio de", "la oficina"], ["Depósitos", "en bancos"], ["Inversiones", "a corto plazo"], ["Deuda de", "un cliente"], ["Arriendo pagado", "por adelantado"], ["se cobra este mes"]]);
});

/* ═══════════ 4 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, primera del tema, ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  assert.equal(tema.actividades[0].id, Z.A0_ID);
  assert.deepEqual(tema.actividades[0].clasificacion, { tipo: APRENDER });
  assert.equal(tema.actividades[0].nombre, P.titulo);
  assert.equal(PIEZAS_T4[0].pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A0_ID)), []);
  for (const f of ["src/data/contabilidadT4A0.js", "src/components/t4/AnoEnMarcha.jsx"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
