/*
 * ═══════════════════════════════════════════════════════════════════════════
 * NINGÚN SORTEO REPITE UN ÍTEM.
 *
 * Tres garantías distintas, en tres pruebas distintas, porque fallan por sitios
 * distintos:
 *
 *   detalle-ids.test.mjs       los ids de cada BANCO son únicos
 *   sorteos.test.mjs (esta)    lo que se SORTEA para una partida no repite
 *   unicidad-partida.test.mjs  lo que una PARTIDA emite no repite, jugándola
 *
 * Esta existe porque la sospecha natural ante un ítem repetido es el sorteo
 * —«el titular que agota sus intentos vuelve a la cola»— y conviene poder
 * descartarla sin leer código. En `diagnostico-en-vivo` no hay cola: se sortea
 * un titular por problema, ocho problemas, y un índice avanza. El repetido de
 * producción (t3a, t6b) fue un cierre doble dentro de la misma pantalla,
 * arreglado en d95a0be y cazado por unicidad-partida.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { sortearTitulares, PROBLEMAS } from "../../data/juegosPolitica.js";
import { BANCO_CORRIENTE } from "../../data/juegosPolitica2.js";
import { sortearPapeles, BANCO_DEFICIT, PAPELES_POR_PARTIDA, MINIMO_NINGUNO, CLASIFICADOR } from "../../data/politicaFiscal.js";
import { ALERTAS_MONITOR, REACCIONES, FRAGMENTOS_ECG } from "../../data/demandaAgregadaHacer.js";
import { CLASIFICACIONES, ITEMS_POR_PARTIDA } from "../../data/cimientos.js";
import { barajar } from "../../utils/barajar.js";
import * as PM from "../../data/politicaMonetaria.js";

const VECES = 3000;
const repetidos = (ids) => ids.filter((x, k) => ids.indexOf(x) !== k);

test("diagnostico-en-vivo: un titular por problema, ocho distintos, en cada sorteo", () => {
  for (let k = 0; k < VECES; k++) {
    const t = sortearTitulares();
    assert.equal(t.length, PROBLEMAS.length);
    assert.deepEqual(repetidos(t.map((x) => x.id)), [], "titular repetido");
    assert.equal(new Set(t.map((x) => x.problema)).size, PROBLEMAS.length, "dos titulares del mismo problema");
  }
});

test("deficit-vs-deuda: diez papeles distintos, con su mínimo de «ninguno»", () => {
  for (let k = 0; k < VECES; k++) {
    const p = sortearPapeles(barajar);
    assert.equal(p.length, PAPELES_POR_PARTIDA);
    assert.deepEqual(repetidos(p.map((x) => x.id)), [], "papel repetido");
    assert.ok(p.filter((x) => x.bandeja === "ninguno").length >= MINIMO_NINGUNO);
  }
});

/*
 * El resto sortea con barajar(banco).slice(0, n): no puede repetir si barajar
 * es una permutación y el banco no tiene ids repetidos. Se comprueban las dos
 * cosas sobre los bancos reales, no sobre uno de juguete.
 */
const BANCOS = {
  "sala-monitores": ALERTAS_MONITOR,
  "termometro-reacciones": REACCIONES,
  "electrocardiograma (fragmentos)": FRAGMENTOS_ECG,
  "clasificador-tesoro": CLASIFICADOR,
  "corriente-titulares": BANCO_CORRIENTE,
  ...Object.fromEntries(Object.entries(CLASIFICACIONES).map(([id, b]) => [id, b.items])),
  /* Política Monetaria */
  "quien-decide-esto": PM.QUIEN_DECIDE.items,
  "caja-de-herramientas": PM.CAJA_DE_HERRAMIENTAS.items,
  "corriente-de-decisiones": PM.CORRIENTE_DECISIONES.items,
  "volante-de-la-tasa": PM.VOLANTE_DE_LA_TASA.escenarios,
};

test("cadena-de-transmision: cuatro eslabones buenos y cinco señuelos distintos, ninguno de la propia cadena", async () => {
  const { sortearCadena } = await import("../../components/mecanicas/maquinas/actividades.jsx");
  for (let k = 0; k < VECES / 10; k++) {
    const c = sortearCadena();
    assert.deepEqual(repetidos(c.piezas.map((p) => p.id)), [], "pieza repetida");
    assert.equal(c.piezas.filter((p) => p.casilla).length, 4);
    const senuelos = c.piezas.filter((p) => !p.casilla);
    assert.equal(senuelos.length, 5);
    assert.ok(senuelos.every((p) => !p.id.startsWith(c.id.slice(0, 3))), "un señuelo de la propia cadena");
  }
});

test("barajar(banco).slice(…) nunca repite, en los bancos que sortean por partida", () => {
  for (const [id, banco] of Object.entries(BANCOS)) {
    const n = id in CLASIFICACIONES ? ITEMS_POR_PARTIDA : Math.ceil(banco.length / 2);
    for (let k = 0; k < VECES / 10; k++) {
      const todo = barajar(banco);
      assert.equal(todo.length, banco.length, `${id}: barajar perdió o añadió ítems`);
      assert.deepEqual(repetidos(todo.slice(0, n).map((x) => x.id)), [], `${id}: sorteo con repetidos`);
    }
  }
});
