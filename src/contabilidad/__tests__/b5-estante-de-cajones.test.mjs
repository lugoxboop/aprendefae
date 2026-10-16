import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTANTE DE CAJONES (hoja 3 de Mai, calidad).
 *
 * El estante de DOS niveles (ClasificaDosNiveles) se probaba con b5-t6-a7, y
 * después, en el #281, con b5-t6-a1. Las dos cosas cambiaron a la vez: a7 se
 * retiró (lote 4) y b5-t5-a1 y b5-t6-a1 pasaron a las fichas a UN nivel
 * (lote 6a, FichasUnNivel.jsx), cuyo juego prueban b5-t5-act1 y b5-t6-act1.
 * Aquí queda la forma que comparten: tres cajones,
 * uno por respuesta final, y cada ficha del banco con el suyo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { CONFIG_T5_ACT1 } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { CONFIG_T6_ACT1 } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");

test("★★★ las fichas a un nivel: tres cajones, y cada ficha del banco tiene el suyo", () => {
  for (const config of [CONFIG_T5_ACT1, CONFIG_T6_ACT1]) {
    const claves = config.cajones.map((k) => k.clave);
    assert.equal(claves.length, 3);
    assert.equal(new Set(claves).size, 3, "dos cajones con la misma clave");
    const fichas = config.sortear((xs) => xs);
    assert.ok(fichas.length > 0, "el sorteo no dio fichas");
    for (const f of fichas) assert.ok(claves.includes(config.destino(f)), `${f.id}: sin cajón`);
  }
});
