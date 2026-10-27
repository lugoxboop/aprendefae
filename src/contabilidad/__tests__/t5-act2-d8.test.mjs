import { test } from "node:test";
import assert from "node:assert/strict";
import { con, montar, tocar, h, act, w, MARCO, reducir, recorridoMesa } from "./t5-cuatro-comun.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · ACT2 «Cierre con diario» (b5-t5-a2) · D2 (objetivo) y D8 (barajado).
 *
 * El juego es CierreConDiario (tema5/LibroDiario.jsx) → CierreSantaPacha →
 * b5/CierreConMesa.jsx (compartido con T6 A2 y A3 de la Célula B), con el
 * diario de b5/LibroDiario.jsx al final. Las opciones son las cuentas del
 * estante de la mesa.
 *
 *   D2  El objetivo de los datos se ve, letra por letra, en el ejemplo
 *       resuelto y en la partida (lo pinta el encabezado compacto de la mesa;
 *       el diario no es el sitio).
 *   D8  Prop opcional `mezclar` de CierreConMesa (llega desde CierreConDiario):
 *       baraja el estante una vez por montaje y otra con «Otra vez»; el orden
 *       no cambia dentro de la partida. Inyectable: la prueba pasa su
 *       `mezclar`. Sin la prop, el orden de main (huella).
 *       La partida real (CierreConDiario) lo trae activo: `mezclar = barajar`
 *       por defecto; b5-t5-act2.test.mjs monta con el orden de los datos
 *       inyectado para mirar el estante. Con `mezclar: null`, lo de main.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT5Act2.js");
const { default: CierreConDiario } = await import("../../components/mecanicas/libros/tema5/LibroDiario.jsx");

const estante = (caja) => [...caja.querySelectorAll("[data-en-estante]")].map((n) => n.dataset.enEstante);
const escribir = async (input, texto) => {
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { poner.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const empezar = (caja) => tocar(caja.querySelector("[data-boton-empezar] button"));
const OBJETIVO = "Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas.";

/* ═══════════ D2 ═══════════ */

test("★★★ D2: el objetivo de los datos se ve, letra por letra, en el ejemplo y en cada asiento", async () => {
  assert.equal(D.T5_ACT2.objetivo, OBJETIVO);
  await con(h(CierreConDiario, { ...MARCO, onCompletar: () => {} }), async (caja) => {
    assert.equal(caja.querySelector("[data-ejemplo-resuelto] [data-objetivo]").textContent, OBJETIVO);
    await empezar(caja);
    assert.equal(caja.querySelectorAll("[data-objetivo]").length, 1);
    assert.equal(caja.querySelector("[data-objetivo]").textContent, OBJETIVO);
  });
});

/* ═══════════ D8 ═══════════ */

/* Un `mezclar` de prueba: cada llamada, la siguiente rotación del estante (y cuenta las llamadas). */
const rotador = () => {
  const f = (xs) => { f.n += 1; return [...xs.slice(f.n % xs.length), ...xs.slice(0, f.n % xs.length)]; };
  f.n = 0;
  return f;
};
const rotar = (xs, n) => [...xs.slice(n % xs.length), ...xs.slice(0, n % xs.length)];

test("★★★ D8: con `mezclar`, el estante sale en el orden barajado y no cambia dentro de la partida", async () => {
  reducir(true);
  const mezclar = rotador();
  await con(h(CierreConDiario, { ...MARCO, onCompletar: () => {}, mezclar }), async (caja) => {
    await empezar(caja);
    const orden = rotar(D.ESTANTE_T5_ACT2, 1);
    assert.notDeepEqual(orden, D.ESTANTE_T5_ACT2);
    assert.deepEqual(estante(caja), orden);
    /* Sacar una cuenta y devolverla: vuelve a su sitio del orden barajado. */
    const c = orden[2];
    await tocar(caja.querySelector(`[data-sacar="${c}:debe"]`));
    assert.deepEqual(estante(caja), orden.filter((x) => x !== c));
    await tocar(caja.querySelector(`[data-devolver="${c}"]`));
    assert.deepEqual(estante(caja), orden);
    assert.equal(mezclar.n, 1, "se baraja una sola vez por partida");
  });
  reducir(false);
});

test("★★★ D8: «Otra vez» empieza otra partida con otro orden; dentro de ella, fijo en cada asiento", async () => {
  reducir(true);
  const mezclar = rotador();
  const fin = [];
  await con(h(CierreConDiario, { ...MARCO, onCompletar: (pct) => fin.push(pct), mezclar }), async (caja) => {
    await empezar(caja);
    const primera = estante(caja);
    for (const parte of D.PARTES_T5_ACT2) {
      assert.deepEqual(estante(caja), primera, `${parte.id}: el mismo orden en toda la partida`);
      await tocar(caja.querySelector("[data-sacar]"));
      await escribir(caja.querySelector("[data-campo-cifra]"), "1");
      await tocar(caja.querySelector("[data-confirmar-parte]"));
      await tocar(caja.querySelector("[data-boton-avanzar] button"));
    }
    assert.equal(fin.length, 1, "la partida terminó");
    const otraVez = [...caja.querySelectorAll("button")].find((b) => b.textContent === "Otra vez");
    await tocar(otraVez);
    assert.equal(mezclar.n, 2);
    assert.deepEqual(estante(caja), rotar(D.ESTANTE_T5_ACT2, 2));
    assert.notDeepEqual(estante(caja), primera, "la partida siguiente, otro orden");
  });
  reducir(false);
});

test("★★★ D8: la partida real, sin inyectar nada, baraja: el orden varía entre montajes (y siempre son las seis cuentas)", async () => {
  const vistos = new Set();
  for (let k = 0; k < 8; k++) {
    await con(h(CierreConDiario, { ...MARCO, onCompletar: () => {} }), async (caja) => {
      await empezar(caja);
      const e = estante(caja);
      assert.deepEqual([...e].sort(), [...D.ESTANTE_T5_ACT2].sort());
      vistos.add(e.join("|"));
    });
  }
  assert.ok(vistos.size >= 2, "ocho montajes con el mismo orden");
});


/* ═══════════ SIN `mezclar`: LO DE MAIN ═══════════ */

/* La huella del recorrido de T5 Act2 y T6 Act2 (Célula B) sin `mezclar`, tomada con el código de main (efa2501e). */
const HUELLA_MAIN_MESA = "52409dd20e558d0abb3bafc93b36299a1732d24ce80ca80696e54d07091d782a";
test("★★★ sin la prop `mezclar`, CierreConMesa pinta exactamente lo de main (T5 Act2 y T6 Act2, paso a paso)", async () => {
  assert.equal(await recorridoMesa(), HUELLA_MAIN_MESA);
  await con(h(CierreConDiario, { ...MARCO, onCompletar: () => {}, mezclar: null }), async (caja) => {
    await empezar(caja);
    assert.deepEqual(estante(caja), D.ESTANTE_T5_ACT2, "el orden de main");
  });
});
