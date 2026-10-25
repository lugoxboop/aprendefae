import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { con, reducir, montar, tocar, dormir, h, MARCO, recorridoFichas } from "./t5-cuatro-comun.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · ACT1 «¿Qué renta da?» · C4 «toda decisión se pinta» (Célula C).
 *
 *   1. La consecuencia, pura (contabilidad/c4/t5Act1_c4.js): los textos [W]
 *      de Watari letra por letra, una opción por cajón de main, la regla C4.
 *   2. La pieza (tema5/QueRentaDaC4.jsx → QueRentaDa → FichasUnNivel con
 *      `c4`): cada cajón pinta su consecuencia (el chip «Esta ficha», las
 *      barras y su frase) ANTES del veredicto; el veredicto (marca, mensaje
 *      de Near, la nota ✕) 380 ms después; con movimiento reducido, sin espera.
 *   3. Lo de main no cambia: el mismo puntaje y el mismo `detalle` con y sin
 *      C4; ninguna cifra que escribir (C4-1 no aplica: nada se califica sin
 *      «Comprobar» porque no hay casilla); la vista abre la pieza con C4.
 *   4. Sin `c4`, FichasUnNivel pinta exactamente lo de main (T6 Act1 de la
 *      Célula B y T5 Act1): la huella del recorrido es la tomada en main.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT5Act1.js");
const C4 = await import("../c4/t5Act1_c4.js");
const { reglaC4 } = await import("./consecuencia-c.test.mjs");
const { default: QueRentaDaC4, C4_ACT1 } = await import("../../components/mecanicas/libros/tema5/QueRentaDaC4.jsx");
const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema5View.jsx");

const NOMBRES = D.FICHAS_T5_ACT1.filter((f) => f.clase === D.NOMBRE);
const clave = (f) => (f.tipo ? `${f.renta}/${f.tipo}` : f.renta);
const CLAVES = ["variable", "fija/interes", "fija/descuento"];

/* ═══════════ 1 · LA CONSECUENCIA ═══════════ */

test("★★★ [W] los textos de Watari, letra por letra (codigo-f5, t5-act1)", () => {
  assert.equal(C4.CHIP_ACT1_C4, "Esta ficha");
  assert.deepEqual(C4.EFECTO_ACT1_C4, {
    variable: "Rinde según le vaya a quien lo emitió.",
    "fija/interes": "Rinde un interés pactado, igual cada vez.",
    "fija/descuento": "Se compra por menos y se recibe el valor completo.",
  });
  assert.equal(C4.FALLA_ACT1_C4, "Si rindiera así, la ficha diría otra cosa.");
  assert.deepEqual(C4.RINDE_ACT1_C4, { variable: [0.5, 0.9, 0.3, 0.7], "fija/interes": [0.6, 0.6, 0.6, 0.6], "fija/descuento": [0, 0, 0, 1] });
  /* Sin montos negativos ni fracciones de unidad en la figura: solo alturas de 0 a 1. */
  for (const hs of Object.values(C4.RINDE_ACT1_C4)) for (const x of hs) assert.ok(x >= 0 && x <= 1);
});

test("★★★ CONSECUENCIA_C4: las fichas de nombre de los dos mazos, las tres opciones de main y la regla C4 en verde", () => {
  const P = C4.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-act1");
  assert.equal(P.objeto, "Los tres cajones de la renta");
  const nombres = [...D.FICHAS_T5_ACT1, ...D.FICHAS_V2_T5_ACT1].filter((f) => f.clase === D.NOMBRE);
  assert.deepEqual(P.items.map((x) => x.id), nombres.map((f) => f.id));
  for (const it of P.items) {
    assert.deepEqual(it.opciones.map((o) => o.id), CLAVES, "el id de cada opción es la clave del cajón de main");
    assert.deepEqual(it.opciones.map((o) => o.t), D.CAJONES_T5_ACT1.map((k) => k.rotulo));
    assert.equal(it.tipo ?? "eleccion", "eleccion", "ninguna cifra que escribir");
  }
  assert.deepEqual(reglaC4([P]), { c1: [], c2: [], c3: [], c4: [] });
});

/* ═══════════ 2 · LA PIEZA: LA CONSECUENCIA ANTES DEL VEREDICTO ═══════════ */

const cajon = (caja, k) => caja.querySelector(`[data-cajon="${k}"]`);
const marcas = (caja) => CLAVES.map((k) => cajon(caja, k).dataset.marca);
const mensaje = (caja) => caja.querySelector('[role="status"]')?.textContent ?? "";
const montarC4 = (items, extra = {}) => montar(h(QueRentaDaC4, { ...MARCO, items, onCompletar: () => {}, ...extra }));

for (const f of NOMBRES.slice(0, 3)) {
  for (const k of CLAVES) {
    test(`★★★ «${f.texto}» · cajón ${k}: se pinta en el acto y el veredicto llega 380 ms después`, async () => {
      reducir(false);
      await con(h(QueRentaDaC4, { ...MARCO, items: [f], onCompletar: () => {} }), async (caja) => {
        assert.ok(!(caja.querySelector("[data-c4-cajon]")), "sin tocar, ningún cajón muestra nada");
        await tocar(cajon(caja, k));
        /* En el acto: la consecuencia, letra por letra, solo en el tocado. */
        const pintado = cajon(caja, k).querySelector("[data-c4-cajon]");
        assert.ok(pintado, "el cajón tocado muestra su consecuencia");
        assert.equal(pintado.querySelector("[data-chip]").textContent, "Esta ficha");
        assert.equal(pintado.querySelector("[data-efecto]").textContent, C4.EFECTO_ACT1_C4[k]);
        assert.equal(pintado.querySelectorAll("[data-rinde] i").length, 4);
        assert.equal(caja.querySelectorAll("[data-c4-cajon]").length, 1);
        /* Y nada del veredicto todavía. */
        assert.deepEqual(marcas(caja), ["", "", ""], "sin marca antes del veredicto");
        assert.equal(mensaje(caja), "", "sin mensaje antes del veredicto");
        assert.ok(!(caja.querySelector("[data-nota-c4]")), "sin la nota ✕ antes del veredicto");
        for (const c of CLAVES) assert.equal(cajon(caja, c).disabled, true, "mientras espera, no se toca otro cajón");
        await dormir(200);
        assert.deepEqual(marcas(caja), ["", "", ""], "a los 200 ms, todavía sin veredicto");
        await dormir(250);
        const buena = clave(f) === k;
        assert.equal(cajon(caja, k).dataset.marca, buena ? "correcta" : "tachada");
        if (buena) {
          assert.ok(mensaje(caja).includes(f.acierto), "el acierto de Near, tal cual");
          assert.ok(!(caja.querySelector("[data-nota-c4]")), "la buena no lleva nota");
        } else {
          assert.ok(mensaje(caja).includes(f.pista), "la pista de Near, tal cual");
          assert.equal(caja.querySelector("[data-nota-c4] [data-falla]").textContent, "Si rindiera así, la ficha diría otra cosa.");
          /* La mala se queda a la vista. */
          assert.equal(cajon(caja, k).querySelector("[data-efecto]").textContent, C4.EFECTO_ACT1_C4[k]);
        }
      });
    });
  }
}

test("★★★ con movimiento reducido, el veredicto llega sin espera (y la consecuencia igual)", async () => {
  reducir(true);
  const f = NOMBRES[0];
  const mala = CLAVES.find((k) => k !== clave(f));
  await con(h(QueRentaDaC4, { ...MARCO, items: [f], onCompletar: () => {} }), async (caja) => {
    await tocar(cajon(caja, mala));
    assert.equal(cajon(caja, mala).querySelector("[data-efecto]").textContent, C4.EFECTO_ACT1_C4[mala]);
    assert.equal(cajon(caja, mala).dataset.marca, "tachada");
    assert.equal(caja.querySelector("[data-nota-c4] [data-falla]").textContent, C4.FALLA_ACT1_C4);
  });
  reducir(false);
});

test("★★★ dos errores: «Iba aquí» en el bueno, las dos consecuencias a la vista; «Siguiente ficha» las borra", async () => {
  reducir(true);
  const [f, g] = NOMBRES;
  const malas = CLAVES.filter((k) => k !== clave(f));
  const { caja, desmontar } = await montarC4([f, g]);
  await tocar(cajon(caja, malas[0]));
  await tocar(cajon(caja, malas[1]));
  await dormir(1000);
  assert.equal(cajon(caja, clave(f)).dataset.marca, "revelada");
  assert.deepEqual(malas.map((k) => Boolean(cajon(caja, k).querySelector("[data-c4-cajon]"))), [true, true]);
  assert.equal(caja.querySelector("[data-boton-avanzar] button").textContent, "Siguiente ficha");
  await tocar(caja.querySelector("[data-boton-avanzar] button"));
  assert.equal(caja.querySelectorAll("[data-c4-cajon]").length, 0);
  assert.ok(!(caja.querySelector("[data-nota-c4]")));
  desmontar();
  reducir(false);
});

/* ═══════════ 3 · LO DE MAIN NO CAMBIA ═══════════ */

async function jugar(El, items, elecciones) {
  let fin = null;
  const { caja, desmontar } = await montar(h(El, { ...MARCO, items, onCompletar: (pct, ms, detalle) => { fin = { pct, detalle }; } }));
  for (const toques of elecciones) {
    for (const k of toques) { await tocar(cajon(caja, k)); await dormir(10); }
    await dormir(1000);
    await tocar(caja.querySelector("[data-boton-avanzar] button"));
  }
  await dormir(50);
  desmontar();
  return fin;
}

test("★★★ el mismo puntaje del primer intento y el mismo `detalle` con C4 que sin C4", async () => {
  reducir(true);
  const items = NOMBRES.slice(0, 3);
  const elecciones = [[clave(items[0])], [CLAVES.find((k) => k !== clave(items[1])), clave(items[1])], CLAVES.filter((k) => k !== clave(items[2]))];
  const sin = await jugar(QueRentaDa, items, elecciones);
  const con = await jugar(QueRentaDaC4, items, elecciones);
  assert.ok(sin && con, "las dos partidas terminan");
  assert.deepEqual(con, sin);
  reducir(false);
});

test("★★★ la vista abre Act1 con C4; «Así se juega» (modoDemo) va como en main", async () => {
  assert.equal(JUEGOS.find((j) => j.id === D.T5_ACT1.id).Mecanica, QueRentaDaC4);
  const vista = readFileSync(new URL("../../components/ContabilidadTema5View.jsx", import.meta.url), "utf8");
  assert.match(vista, /Mecanica: QueRentaDaC4/);
  assert.equal(C4_ACT1.espera, 380);
  /* En modo demo no hay espera: el guion del tutorial es el de main. */
  reducir(false);
  const f = NOMBRES[0];
  await con(h(QueRentaDaC4, { ...MARCO, items: [f], modoDemo: true }), async (caja) => {
    await tocar(cajon(caja, clave(f)));
    assert.ok(!(caja.querySelector("[data-c4-cajon]")));
    assert.equal(cajon(caja, clave(f)).dataset.marca, "correcta");
  });
});

test("★★★ C4-1: no hay cifra que escribir, así que nada se califica antes de «Comprobar»", async () => {
  await con(h(QueRentaDaC4, { ...MARCO, items: [NOMBRES[0]], onCompletar: () => {} }), async (caja) => {
    assert.equal(caja.querySelectorAll("input").length, 0);
    assert.ok(C4.CONSECUENCIA_C4.items.every((it) => (it.tipo ?? "eleccion") !== "cifra"));
  });
});

/* ═══════════ 4 · SIN `c4`, FICHASUNNIVEL COMO EN MAIN ═══════════ */

/* La huella del recorrido de T6 Act1 (Célula B) y T5 Act1 sin C4, tomada con el código de main (efa2501e). */
/*
 * Rehecha el 25-oct por el volumen de #560: `Responder` va dentro de su
 * envoltorio con canto. Comprobado antes de cambiarla: quitando SOLO ese
 * envoltorio (y devolviendo su margin-top al botón), el recorrido da
 * exactamente la huella anterior, 282aa1d5b5d9…
 */
const HUELLA_MAIN_FICHAS = "91c7c2846d6b39e0b9d6f3ad17304ef2b1ad4fbc7339cf4fffa1112e4d785eb6";
test("★★★ sin la prop `c4`, FichasUnNivel pinta exactamente lo de main (T6 Act1 y T5 Act1, paso a paso)", async () => {
  assert.equal(await recorridoFichas(), HUELLA_MAIN_FICHAS);
});
