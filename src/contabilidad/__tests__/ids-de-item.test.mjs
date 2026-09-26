import { test } from "node:test";
import assert from "node:assert/strict";

import { BANCOS_CLASIFICACION, BANCO_CORRIENTE_DE_CUENTAS, BANCO_CUADRO_DINAMICAS } from "../bancos.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS NOMBRES DE ÍTEM SON UN DATO GUARDADO, NO UN DETALLE INTERNO.
 *
 * Cada partida deja en el servidor una fila por ítem respondido —`fp_detalle`,
 * con su `item_id`— y esas filas se quedan ahí para siempre. El panel docente
 * las lee para decirle al profesor QUÉ pregunta falló cada estudiante.
 *
 * O sea que el nombre de un ítem no se puede cambiar sin consecuencias: las
 * filas viejas conservan el nombre viejo, y el día que una mecánica se rehaga
 * con otra nomenclatura, todo lo que ya jugaron los estudiantes se vuelve
 * ilegible en el panel. No se pierde ni un FP —los puntos viven en
 * `fp_history`, atados al id de la ACTIVIDAD, que no cambia— pero sí se pierde
 * el diagnóstico, que es justo lo que el profesor usa para dar clase.
 *
 * Esta prueba fija los nombres que las mecánicas emiten hoy. Rehacer la
 * interacción de una actividad es legítimo y está previsto; rehacer sus
 * nombres de ítem no, mientras haya partidas guardadas con ellos.
 *
 * SI ESTA PRUEBA FALLA porque una mecánica nueva nombra distinto sus ítems: o
 * se conserva la nomenclatura, o hay que decidir a conciencia qué pasa con el
 * historial —y eso es una conversación, no un arreglo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("★ los ítems de las cinco clasificaciones conservan su nombre", () => {
  const nombres = Object.fromEntries(
    BANCOS_CLASIFICACION.map((b) => [b.subtema, b.items.map((i) => i.id)]),
  );

  /*
   * CU-1: los doce ids, mirados como CONJUNTO y no como lista ordenada. El
   * orden del banco es pedagógico —los seis de activo primero, para que el
   * sorteo estratificado se lea de un vistazo— y cambiarlo no le cambia el
   * nombre a nada. Lo que no puede pasar es que un id desaparezca.
   */
  assert.deepEqual([...nombres["Naturaleza del debe y el haber"]].sort(),
    ["cu1-01", "cu1-02", "cu1-03", "cu1-04", "cu1-05", "cu1-06", "cu1-07", "cu1-08", "cu1-09", "cu1-10", "cu1-11", "cu1-12"]);

  /* CU-4: la numeración del banco, tal cual. */
  assert.deepEqual(nombres["Reglas de registro aplicadas"],
    ["cu4-01", "cu4-02", "cu4-03", "cu4-04", "cu4-05", "cu4-06", "cu4-07", "cu4-08", "cu4-09", "cu4-10"]);

  /* CU-2: doce cuentas reales. */
  assert.deepEqual(nombres["Clasificación de cuentas reales"],
    ["cu2-01", "cu2-02", "cu2-03", "cu2-04", "cu2-05", "cu2-06",
      "cu2-07", "cu2-08", "cu2-09", "cu2-10", "cu2-11", "cu2-12"]);
});

test("★ CU-3 conserva su nombre derivado: familia y lado", () => {
  /*
   * Las doce combinaciones no están numeradas: se nombran por lo que son. Es
   * lo que hace que el panel docente pueda decir «un débito en una cuenta de
   * Ingreso» sin consultar una tabla.
   */
  /* Como CONJUNTO: el orden lo fija el catalogo de reglas y no viaja al servidor. */
  assert.deepEqual([...BANCO_CUADRO_DINAMICAS.items.map((i) => i.id)].sort(), [
    "cu3-activo-debe", "cu3-activo-haber",
    "cu3-costo-debe", "cu3-costo-haber",
    "cu3-gasto-debe", "cu3-gasto-haber",
    "cu3-ingreso-debe", "cu3-ingreso-haber",
    "cu3-pasivo-debe", "cu3-pasivo-haber",
    "cu3-patrimonio-debe", "cu3-patrimonio-haber",
  ].sort());
});

test("★ CU-9 conserva su nombre derivado del de la cuenta", () => {
  const ids = BANCO_CORRIENTE_DE_CUENTAS.items.map((i) => i.id);
  assert.equal(ids.length, 24);
  /* Una muestra con las tres formas que tiene el slug de complicarse. */
  assert.ok(ids.includes("cu9-terreno"), "una palabra");
  assert.ok(ids.includes("cu9-equipos-de-oficina"), "varias palabras");
  assert.ok(ids.includes("cu9-inventario-de-mercancias"), "con tilde");
  assert.ok(ids.includes("cu9-depositos-en-garantia"), "con tilde y varias palabras");
});

test("★ y el panel docente sabe leer todos esos nombres", () => {
  /*
   * La otra mitad de la garantía: que los nombres se conserven no sirve de
   * nada si la regla de etiqueta deja de entenderlos.
   */
  const porActividad = {
    "cu-izquierda-o-derecha": "Naturaleza del debe y el haber",
    "cu-de-que-familia": "Clasificación de cuentas reales",
    "cu-cuadro-dinamicas": "Reglas de registro",
    "cu-debita-o-acredita": "Reglas de registro aplicadas",
    "cu-corriente-de-cuentas": "Interleaving — clasificación de las seis familias",
  };
  for (const [actividad, subtema] of Object.entries(porActividad)) {
    const banco = BANCOS_CLASIFICACION.find((b) => b.subtema === subtema);
    assert.ok(banco, `no está el banco de ${actividad}`);
    for (const item of banco.items) {
      const etiqueta = etiquetaDeItem(actividad, item.id);
      assert.ok(etiqueta && etiqueta.length > 0,
        `${actividad} · ${item.id}: el panel no sabe nombrarlo`);
    }
  }
});
