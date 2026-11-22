import test from "node:test";
import assert from "node:assert/strict";

import { SUBJECTS, HACER, actividadesDeTipo, desafioDe, nombreDeActividad } from "../../data/subjects.js";
import { etiquetaDeItem, hayReglaPara, recortar, prefijoComun, REGLAS } from "../etiquetasItem.js";

import {
  BLIPS_RADAR, DEFINICIONES, FRAGMENTOS_TRANSMISION, CORRIENTE, RANURAS, ORDEN_TRIBUNAL,
} from "../../data/icebergActividades.js";
import { CITAS_EXPEDIENTE, NIVELES, ORDEN_DECISIONES } from "../../data/arca.js";
import { FUERZAS, CASOS as CASOS_ASEDIO } from "../../data/asedio.js";
import { REFERENCIA, clave } from "../../components/mecanicas/MapaCausal.jsx";
import { parejasDe } from "../../utils/orden.js";
import * as CU from "../../contabilidad/bancos.js";
import * as CUA from "../../data/contabilidadActividades.js";
import { transaccionesDe, renglonesDe } from "../../components/mecanicas/libros/LaMayorizacion.jsx";
import { mayorConSaldos } from "../../data/contabilidad.js";
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUE TODO ITEM SE PUEDA NOMBRAR, Y QUE NINGUNA ACTIVIDAD SE QUEDE SIN REGLA.
 *
 * El panel docente enseña el diagnóstico por pregunta. Si un id deja de
 * resolver, al docente le sale el id interno crudo —`et2:Evento`— que para él
 * es ruido. Esto lo caza al desarrollar en vez de en su pantalla.
 *
 * ═══════════ LO QUE ESTAS DOS PRUEBAS DEMUESTRAN, Y LO QUE NO ═══════════
 *
 * Los ids de aquí abajo se derivan de LOS MISMOS BANCOS de los que tiran las
 * reglas. Así que lo que se comprueba es COHERENCIA, no corrección: si mañana
 * un componente cambia la forma de su id y no se actualizan ni esta lista ni la
 * regla, las dos seguirán de acuerdo entre ellas y la prueba pasará en verde
 * mientras el panel enseña ids crudos.
 *
 * Eso no es un descuido, es el límite del método, y por eso NO es la única
 * defensa: la vista tiene un canario que mira los ids REALES que devuelve el
 * servidor —la única verdad disponible— y los cuenta en voz alta cuando no los
 * puede nombrar. Sin él, este modo de fallo tendría exactamente la forma del
 * «×100»: nada falla y el panel enseña otra cosa.
 *
 * Lo que sí atrapan, que es bastante:
 *
 *   · un registro renombrado o borrado de un banco
 *   · una regla que deja de casar con su banco
 *   · una actividad nueva desplegada sin regla — el caso más probable de todos
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Los ids que cada actividad puede emitir, derivados de sus bancos igual que en
 * detalle-ids.test.mjs.
 */
/*
 * Desde el 22-nov-2026 no hay ids de Macroeconomía aquí: la materia se retiró
 * entera (0258) y sus bancos salieron con ella. El Macro nuevo añade aquí los
 * suyos cuando tenga actividades.
 */
const IDS = {
  "corriente-cruzada": CORRIENTE.map((x) => x.id),
  "radar-profundidad": BLIPS_RADAR.map((b) => b.id),
  "transmision-superficie": FRAGMENTOS_TRANSMISION.map((f) => f.id),
  "camara-presion": DEFINICIONES.map((d) => d.termino),
  "camara-presion-experto": DEFINICIONES.map((d) => d.termino),
  "arquitecto-profundidades": [...RANURAS],

  "asedio-estrategico": CASOS_ASEDIO.flatMap((c) => FUERZAS.map((f) => `${c.id}:${f.id}`)),
  "constructor-mapa-causal": REFERENCIA.map((c) => `ref:${clave(c.de, c.a)}`),
  "tribunal-profundidad": [
    ...parejasDe(ORDEN_TRIBUNAL).map(([a, b]) => `par:${a}-${b}`),
    "criterio",
  ],
  "expediente-rescate": ["diagnostico"],
  "proyecto-arca": [
    ...CITAS_EXPEDIENTE.map((c) => `et1:${c.id}`),
    ...NIVELES.map((n) => `et2:${n}`),
    ...parejasDe(ORDEN_DECISIONES).map(([a, b]) => `et3:par:${a}-${b}`),
    "et4:momento",
  ],

  /*
   * Contabilidad · Las cuentas, el debe y el haber (0042). Las cinco que ya
   * tienen mecánica; las otras siete y el desafío van marcadas `pendiente` en
   * subjects.js y entran aquí con su mecánica.
   */
  "cu-izquierda-o-derecha": CU.BANCO_IZQUIERDA_O_DERECHA.items.map((x) => x.id),
  "cu-de-que-familia": CU.BANCO_DE_QUE_FAMILIA.items.map((x) => x.id),
  "cu-cuadro-dinamicas": CU.BANCO_CUADRO_DINAMICAS.items.map((x) => x.id),
  "cu-debita-o-acredita": CU.BANCO_DEBITA_O_ACREDITA.items.map((x) => x.id),
  "cu-corriente-de-cuentas": CU.BANCO_CORRIENTE_DE_CUENTAS.items.map((x) => x.id),
  "cu-saldo-de-la-cuenta": CUA.SALDO_DE_LA_CUENTA.items.flatMap((x) => [`${x.id}:saldo`, `${x.id}:lado`]),
  "cu-simple-o-compuesto": CUA.SIMPLE_O_COMPUESTO.items.flatMap((x) => [`${x.id}:clase`, `${x.id}:cuentas`]),
  "cu-arma-el-asiento": CUA.ARMA_EL_ASIENTO.items.map((x) => x.id),
  "cu-asiento-compuesto": CUA.ASIENTO_COMPUESTO.items.map((x) => x.id),
  "cu-cuadra-o-no": CUA.CUADRA_O_NO.asientos.flatMap((x) => [`${x.id}:juicio`, `${x.id}:cifra`]),
  "cu-mayorizacion": CUA.MAYORIZACION.sets.flatMap((s) => {
    const ts = transaccionesDe(s);
    return [
      ...renglonesDe(ts).flatMap((r) => [`${r.transaccion}:${r.cuenta}:cuenta`, `${r.transaccion}:${r.cuenta}:lado`]),
      ...mayorConSaldos(ts).flatMap((c) => [`saldo:${c.cuenta}:cifra`, `saldo:${c.cuenta}:lado`]),
    ];
  }),
};

test("todo id derivado de los bancos se puede nombrar", () => {
  const sinNombre = [];
  let total = 0;

  for (const [actividad, ids] of Object.entries(IDS)) {
    assert.ok(ids.length > 0, `${actividad}: la derivación no produjo ni un id`);
    for (const id of ids) {
      total++;
      const etiqueta = etiquetaDeItem(actividad, id);
      if (!etiqueta) sinNombre.push(`${actividad} · ${id}`);
    }
  }

  assert.deepEqual(sinNombre, [], `sin etiqueta: ${sinNombre.join(" | ")}`);
  /* Que la prueba recorra de verdad lo que dice recorrer. */
  assert.ok(total > 150, `esperaba más de 150 ids y recorrió ${total}`);
});

test("ninguna etiqueta pasa del tope, y ninguna queda en el id crudo", () => {
  const largas = [];
  const crudas = [];
  for (const [actividad, ids] of Object.entries(IDS)) {
    for (const id of ids) {
      const e = etiquetaDeItem(actividad, id);
      if (e && e.length > 70) largas.push(`${actividad} · ${id} (${e.length})`);
      /*
       * Devolver el id como etiqueta sería peor que devolver null: parecería
       * que resolvió. Se permite solo donde el id ES el texto por diseño —la
       * cámara y el arquitecto—, y eso se declara aquí, no se deduce.
       */
      const idEsElTexto = actividad.startsWith("camara-presion") || actividad === "arquitecto-profundidades";
      if (e && e === id && !idEsElTexto) crudas.push(`${actividad} · ${id}`);
    }
  }
  assert.deepEqual(largas, [], `pasan de 70: ${largas.join(" | ")}`);
  assert.deepEqual(crudas, [], `devuelven el id crudo: ${crudas.join(" | ")}`);
});

/*
 * LA PRUEBA DE COBERTURA. Es la que va a saltar de verdad: alguien añade una
 * actividad, la instrumenta, y se olvida de la regla. Sin esto, el fallo sale
 * en la pantalla del docente.
 *
 * `sinItems` queda fuera a propósito: esas actividades no emiten ítems y no
 * tienen nada que nombrar.
 *
 * `pendiente` también, y por una razón distinta que conviene no confundir con
 * la anterior: esas actividades SÍ van a emitir ítems, pero todavía no tienen
 * mecánica. No están en ningún camino, nadie puede abrirlas y no existe la
 * gramática de id que una regla tendría que deshacer — escribirla hoy sería
 * adivinarla, y una regla que adivina mal devuelve null, que es exactamente el
 * fallo que esta prueba quiere evitar, solo que más tarde y más callado.
 *
 * La marca se quita al construir la mecánica, y en ese momento esta prueba
 * empieza a exigir su regla. Ese es el orden que importa: nadie puede jugar
 * una actividad sin que el profesor pueda leer lo que respondió.
 */
test("toda actividad que puede emitir ítems tiene regla", () => {
  const sinRegla = [];
  for (const materia of Object.values(SUBJECTS)) {
    for (const tema of materia.topics ?? []) {
      const desafio = desafioDe(tema);
      for (const a of [...actividadesDeTipo(tema, HACER), ...(desafio ? [desafio] : [])]) {
        if (a.sinItems === true || a.pendiente === true) continue;
        if (!hayReglaPara(a.id)) sinRegla.push(`${materia.id} · ${a.id}`);
      }
    }
  }
  assert.deepEqual(
    sinRegla,
    [],
    `sin regla de etiqueta (el docente vería el id crudo): ${sinRegla.join(" | ")}`
  );
});

/*
 * DOS ÍTEMS DISTINTOS NO PUEDEN LEERSE IGUAL.
 *
 * Es una propiedad por sí sola: si dos ítems se leen igual, el docente cree que
 * está mirando dos preguntas y está mirando una.
 *
 * NO ES LA QUE ATRAPA EL PROBLEMA DEL PREFIJO COMPARTIDO, y conviene decirlo
 * porque lo parece. Cuando los tres duelos del tribunal empezaban por "El dueño
 * cree que", sus etiquetas eran ILEGIBLES pero distintas —diferían en la cola—
 * y esta comprobación pasaba en verde. Se comprobó quitando el arreglo. De eso
 * se ocupa la de abajo.
 */
test("dentro de una actividad, dos ítems nunca se leen igual", () => {
  const choques = [];
  for (const [actividad, ids] of Object.entries(IDS)) {
    const vistas = new Map();
    for (const id of new Set(ids)) {
      const e = etiquetaDeItem(actividad, id);
      if (!e) continue;
      if (vistas.has(e)) choques.push(`${actividad}: «${e}» la comparten ${vistas.get(e)} y ${id}`);
      else vistas.set(e, id);
    }
  }
  assert.deepEqual(choques, [], choques.join(" | "));
});

/*
 * Y QUE EN UN DUELO, LOS DOS LADOS NO EMPIECEN IGUAL.
 *
 * Esta es la que atrapa el problema real, y costó dos intentos dar con ella.
 *
 *   · La de colisión no servía: con el tribunal roto las tres etiquetas eran
 *     distintas —diferían en la cola— y pasaba en verde.
 *   · Mirar el prefijo común de TODAS las etiquetas de la actividad tampoco:
 *     el ítem "criterio" no empieza como los duelos, así que el prefijo común
 *     del conjunto salía vacío y la prueba pasaba igual. Un solo elemento
 *     distinto anulaba la comprobación entera.
 *
 * Lo que de verdad estaba mal es más pequeño y más concreto: DENTRO de una
 * misma etiqueta, los dos lados del "vs" arrancaban con las mismas dieciocho
 * letras. El docente tenía que leer "El dueño cree que" dos veces en la misma
 * fila para llegar a lo que cambiaba.
 *
 * Comprobado que falla quitando el arreglo del módulo.
 */
test("en un duelo, los dos lados no arrancan igual", () => {
  const malas = [];
  for (const [actividad, ids] of Object.entries(IDS)) {
    for (const id of new Set(ids)) {
      const e = etiquetaDeItem(actividad, id);
      if (!e || !e.includes(" vs ")) continue;
      const [izq, der] = e.split(" vs ");
      const p = prefijoComun([izq, der]);
      if (p) malas.push(`${actividad} · ${id}: los dos lados empiezan por «${p}»`);
    }
  }
  assert.deepEqual(malas, [], malas.join(" | "));
});

test("el prefijo compartido se quita solo cuando vale la pena", () => {
  /* Tres frases con un arranque largo en común: se quita. */
  assert.equal(prefijoComun(["El dueño cree que A", "El dueño cree que B"]), "El dueño cree que ");
  /* Sin nada en común: no hay nada que quitar. */
  assert.equal(prefijoComun(["Aprobar los diseños", "Reducir personal"]), "");
  /* Un arranque corto no se toca: quitar "El " no aclara nada. */
  assert.equal(prefijoComun(["El gato duerme", "El perro corre"]), "");
  assert.equal(prefijoComun(["solo una"]), "");
});

test("una actividad desconocida o un id raro devuelven null, no basura", () => {
  assert.equal(etiquetaDeItem("actividad-que-no-existe", "x"), null);
  assert.equal(etiquetaDeItem("radar-profundidad", "id-que-no-esta-en-el-banco"), null);
  assert.equal(etiquetaDeItem("radar-profundidad", null), null);
  assert.equal(etiquetaDeItem("radar-profundidad", undefined), null);
  assert.equal(etiquetaDeItem("proyecto-arca", "et9:loquesea"), null);
  assert.equal(etiquetaDeItem("cu-izquierda-o-derecha", "id-que-no-esta-en-el-banco"), null);
});

test("el recorte no parte palabras y marca que cortó", () => {
  assert.equal(recortar("corto", 70), "corto");
  const largo = recortar("a".repeat(40) + " " + "b".repeat(40), 30);
  assert.ok(largo.endsWith("…"), `no marcó el corte: ${largo}`);
  assert.ok(largo.length <= 30, `se pasó del tope: ${largo.length}`);
});

/*
 * Y que las reglas no se queden huérfanas por el otro lado: una regla para una
 * actividad que ya no existe es código muerto que nadie va a borrar solo.
 */
/*
 * ═══════════ UNA ACTIVIDAD RETIRADA SÍ CONSERVA SU REGLA ═══════════
 *
 * Y no es una excepción cómoda: es la razón por la que la regla existe. El
 * panel docente lee `fp_detalle`, y las respuestas que los estudiantes ya
 * dieron a una actividad retirada siguen ahí. Sin su regla, el profesor vería
 * «cu9-03» crudo donde antes leía la pregunta.
 *
 * Lo que la prueba sigue cazando es una regla para un id que NUNCA existió —un
 * nombre mal escrito, un copiar y pegar— porque ese no está en esta lista.
 */
const RETIRADAS_DE_CONTABILIDAD = [
  "cu-simple-o-compuesto",
  "cu-cuadra-o-no",
  "cu-corriente-de-cuentas",
  "cu-mayorizacion",
  "cu-error-escondido",
  /* Los cuatro Hacer de T7 que retiró la 0115. */
  "t7-2-debe-o-haber",
  "t7-2-periodico-o-permanente",
  "t7-3-comercial-o-condicionado",
  "t7-3-que-entra-al-costo",
];

/*
 * EL REPASO DIARIO DE MACRO (retirado en la 0258) conserva su regla por otra
 * vía: es la misma función que usa el de Contabilidad (`REGLAS[
 * "repaso-diario-contabilidad"] = REGLAS["repaso-diario"]`), que delega en la
 * regla de la actividad de origen de cada ítem.
 *
 * LAS 58 DE MACROECONOMÍA NO CONSERVAN LA SUYA, y es una excepción decidida,
 * no un olvido: sus reglas leían los bancos de src/data/* que salieron con la
 * materia (22-nov-2026, 0258), y mantener los bancos solo por las etiquetas
 * era mantener Macro entero. Sus filas de fp_detalle siguen intactas en el
 * servidor; el panel las enseñaría con el id crudo. Por eso no están en la
 * lista de arriba: la prueba de abajo las exigiría.
 */
const RETIRADAS_CON_REGLA_COMPARTIDA = ["repaso-diario"];

test("ninguna regla sobra, salvo las de las actividades retiradas", () => {
  /*
   * "Vive" es lo que nombreDeActividad() sabe nombrar, no lo que está en el
   * camino de un tema. La diferencia es real y salió en esta prueba: el modo
   * experto de la cámara se registra como camara-presion-experto —tiene fila
   * propia en el catálogo del servidor y paga distinto— pero no es otra
   * actividad del camino, así que no aparece en subjects.js como entrada.
   *
   * Se usa esa función y no una lista de excepciones propia justamente para no
   * abrir una segunda opinión sobre qué ids existen: ya hay una, y está ahí.
   */
  const sobran = Object.keys(REGLAS)
    .filter((id) => nombreDeActividad(id) === null)
    .filter((id) => !RETIRADAS_DE_CONTABILIDAD.includes(id))
    .filter((id) => !RETIRADAS_CON_REGLA_COMPARTIDA.includes(id));
  assert.deepEqual(sobran, [], `reglas de actividades que ya no existen: ${sobran.join(", ")}`);
});

test("★ las nueve retiradas conservan su regla, para las respuestas que ya existen", () => {
  for (const id of RETIRADAS_DE_CONTABILIDAD) {
    assert.ok(REGLAS[id], `${id} perdió su regla y el panel enseñaría el id crudo`);
    assert.equal(nombreDeActividad(id), null, `${id} sigue en el camino: esta lista sobra`);
  }
});

test("★ el Repaso Diario retirado comparte regla con el de Contabilidad", () => {
  for (const id of RETIRADAS_CON_REGLA_COMPARTIDA) {
    assert.equal(nombreDeActividad(id), null, `${id} sigue en el camino: esta lista sobra`);
  }
  assert.equal(REGLAS["repaso-diario"], REGLAS["repaso-diario-contabilidad"]);
});
