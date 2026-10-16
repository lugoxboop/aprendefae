import assert from "node:assert/strict";

/*
 * E4 en la mesa (hoja de fusiones de Mai, §3), comprobado igual en t5-a2, t6-a2 y t6-a3: tras un error,
 * la mesa del estudiante se queda como la armó, y cada línea del asiento correcto se ve junto a ella:
 *   · la tarjeta del estudiante con esa cuenta, en su lado y con su valor, sin marca; o
 *   · con el valor ✕ tachado y debajo «✓ $valor» (data-valor-correcto); o
 *   · una tarjeta ✓ «faltaba» al final de su columna (data-faltaba).
 * Lo que sobra o está en la otra columna queda ✕ y tachado. No es una prueba por sí misma: la usan las tres.
 */
const cifra = (v) => v.toLocaleString("es-CO").replace(/,/g, ".");
const leer = (t) => Number(String(t).replace(/\D/g, ""));

export function comprobarMesaE4(caja, parte, puestas, contexto = "") {
  const tarjetas = [...caja.querySelectorAll("[data-en-mesa]")];
  /* La mesa del estudiante no se reemplaza. */
  assert.deepEqual(
    tarjetas.map((n) => `${n.closest("[data-columna]").dataset.columna}:${n.dataset.enMesa}:${leer(n.querySelector("input").value)}`).sort(),
    puestas.map((p) => `${p.lado}:${p.cuenta}:${p.valor}`).sort(),
    `${contexto}: la mesa del estudiante se queda como la armó`,
  );
  for (const n of tarjetas) {
    const lado = n.closest("[data-columna]").dataset.columna;
    const e = parte.asiento.find((x) => x.cuenta === n.dataset.enMesa);
    if (!e || e.lado !== lado) {
      assert.equal(n.dataset.marca, "tachada", `${contexto}: «${n.dataset.enMesa}» sobra o está en la otra columna: ✕`);
      assert.ok(n.querySelector('svg[data-icono="tache"]'), `${contexto}: «${n.dataset.enMesa}» sin su ✕`);
      assert.ok(n.textContent.includes("(tu respuesta)"));
    }
  }
  for (const e of parte.asiento) {
    const mia = tarjetas.find((n) => n.dataset.enMesa === e.cuenta && n.closest("[data-columna]").dataset.columna === e.lado);
    if (!mia) {
      const falta = caja.querySelector(`[data-columna="${e.lado}"] [data-faltaba="${e.cuenta}"]`);
      assert.ok(falta, `${contexto}: falta «${e.cuenta}» y no aparece ✓ en su columna`);
      assert.ok(falta.textContent.includes(cifra(e.valor)) && falta.textContent.includes("(faltaba)"));
      continue;
    }
    if (leer(mia.querySelector("input").value) === e.valor) {
      assert.equal(mia.querySelector("[data-valor-correcto]"), null, `${contexto}: «${e.cuenta}» estaba bien: sin marca`);
      continue;
    }
    assert.equal(mia.querySelector("[data-caja-campo]").dataset.marca, "tachada", `${contexto}: el valor de «${e.cuenta}» queda ✕`);
    const bien = mia.querySelector("[data-valor-correcto]");
    assert.ok(bien && bien.textContent.includes(cifra(e.valor)) && bien.textContent.includes("(valor correcto)"), `${contexto}: «✓ ${cifra(e.valor)}» debajo de «${e.cuenta}»`);
  }
}
