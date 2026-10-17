import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DECIDE_POR_PIEZA } from "../../data/contabilidadAprenderDecide.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CAPA 4 QUE DECIDE · QUE SIGA CUMPLIENDO D4 Y D6.
 *
 * Esta capa existe para subir dos dimensiones del Kit, y las dos se pueden
 * perder en un retoque de datos sin que nada se rompa a la vista:
 *
 *   D4 Avanzado — «decisiones distintas producen resultados visibles
 *   distintos». Se guarda comprobando que `estado()` NO devuelva lo mismo
 *   para todas las opciones: si lo hiciera, elegir daría igual, y el
 *   estudiante no vería su decisión en ninguna parte.
 *
 *   D6 Avanzado — «al menos dos mensajes de error distintos, ligados a
 *   errores conceptualmente distintos». Se guarda exigiendo que cada opción
 *   mala traiga su propio `msg` y que no haya dos iguales en una decisión.
 *   Un «No va aquí» repetido pasa D6 Básico y falla Avanzado.
 *
 * Y la condición que no es del Kit sino del tema: estas piezas son material
 * teórico, CERO FP. Si algún día este armazón importa algo de fp/, alguien
 * estará puntuando la teoría sin darse cuenta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ARMAZON = "src/components/mecanicas/libros/cuentas/CapaCuatroDecide.jsx";

test("el armazón de la capa 4 no puntúa: nada de fp/", () => {
  const fuente = readFileSync(ARMAZON, "utf8");
  const importa = [...fuente.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  const fp = importa.filter((r) => /\/fp\/|registrarActividad|registrar_fp/.test(r));
  assert.deepEqual(fp, [], `material teórico: no puede importar ${fp.join(", ")}`);
});

test("hay piezas registradas", () => {
  assert.ok(Object.keys(DECIDE_POR_PIEZA).length > 0, "ninguna pieza usa la capa 4 que decide");
});

for (const [id, pieza] of Object.entries(DECIDE_POR_PIEZA)) {
  test(`${id} · D4: dos decisiones de tipo distinto`, () => {
    assert.ok(Array.isArray(pieza.decisiones), "sin decisiones");
    assert.ok(pieza.decisiones.length >= 2, `${pieza.decisiones.length} decisión(es): D4 Medio pide más de una`);
    const claves = pieza.decisiones.map((d) => d.clave);
    assert.equal(new Set(claves).size, claves.length, `claves repetidas: ${claves.join(", ")}`);
  });

  test(`${id} · D4: elegir distinto se ve distinto`, () => {
    for (const d of pieza.decisiones) {
      assert.equal(typeof d.estado, "function", `${d.clave}: sin estado()`);
      const retratos = d.opciones.map((o) => JSON.stringify(d.estado(o.id)));
      assert.ok(
        new Set(retratos).size > 1,
        `${d.clave}: todas las opciones dejan la figura igual, así que la decisión no se ve`,
      );
    }
  });

  test(`${id} · D6: un mensaje propio por cada error`, () => {
    for (const d of pieza.decisiones) {
      const malas = d.opciones.filter((o) => !o.correcta);
      assert.ok(malas.length >= 2, `${d.clave}: con menos de dos errores no hay dos mensajes distintos`);
      for (const o of malas) {
        assert.ok(o.msg && o.msg.trim().length > 20, `${d.clave}/${o.id}: sin mensaje de error propio`);
      }
      const msgs = malas.map((o) => o.msg.trim());
      assert.equal(new Set(msgs).size, msgs.length, `${d.clave}: dos errores con el mismo mensaje`);
      assert.equal(d.opciones.filter((o) => o.correcta).length, 1, `${d.clave}: tiene que haber una sola correcta`);
    }
  });

  test(`${id} · la devolución del acierto y la pista existen`, () => {
    for (const d of pieza.decisiones) {
      assert.ok(d.pregunta?.trim(), `${d.clave}: sin pregunta`);
      assert.ok(d.porque?.trim(), `${d.clave}: sin el por qué del acierto (D6 Medio)`);
      assert.ok(d.pista?.trim(), `${d.clave}: sin pista para el segundo fallo`);
    }
  });
}
