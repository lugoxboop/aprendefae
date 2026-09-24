import { test } from "node:test";
import assert from "node:assert/strict";

import {
  montarCaso, transaccionesConError, totalesDelMayor, sortearCasos,
  casoSinDescuadre, TIPOS_DE_ERROR, nombreDeTipo,
} from "../siembra.js";
import { evaluarCuenta, evaluarTipo, puntuarErrorEscondido, PESO } from "../errorEscondido.js";
import { ERROR_ESCONDIDO } from "../../data/contabilidadActividades.js";
import {
  LAVADO_DE_AUTOS, mayorConSaldos, tipoDeCuenta, DEBE, HABER,
} from "../../data/contabilidad.js";
import { etiquetaDeItem, recortar } from "../../docente/etiquetasItem.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-12 · EL ERROR ESCONDIDO.
 *
 * Lo delicado aquí no es la nota: es que el mayor que ve el estudiante tenga
 * DENTRO exactamente el error que la pregunta dice, y ninguno más. Un caso que
 * estropeara dos cuentas en vez de una convertiría la respuesta correcta en
 * una de dos, y el estudiante que señalara la otra recibiría un «esa cuenta
 * está bien» sobre una cuenta que también está mal.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = ERROR_ESCONDIDO.casos;
const limpio = mayorConSaldos(LAVADO_DE_AUTOS.transacciones);

const porCuenta = (mayor) => new Map(mayor.map((c) => [c.cuenta, c]));
const huella = (c) => JSON.stringify({
  d: (c.debitos ?? []).map((m) => m.valor).sort((a, b) => a - b),
  h: (c.creditos ?? []).map((m) => m.valor).sort((a, b) => a - b),
});

/* ═══════════════ LA SIEMBRA ═══════════════ */

test("★ cada caso estropea EXACTAMENTE la cuenta por la que pregunta", () => {
  /*
   * Con una excepción declarada: cambiar una cifra de cuenta toca dos —la que
   * la recibe sin merecerla y la que se queda sin ella—. La respuesta
   * correcta es la que la recibió, porque es la que tiene un renglón que no
   * le corresponde; la otra simplemente ya no aparece en el mayor.
   */
  for (const caso of CASOS) {
    const { mayor } = montarCaso(caso);
    const antes = porCuenta(limpio);
    const ahora = porCuenta(mayor);

    const cambiadas = [...antes.keys()].filter((n) => !ahora.has(n) || huella(ahora.get(n)) !== huella(antes.get(n)));
    const nuevas = [...ahora.keys()].filter((n) => !antes.has(n));
    const tocadas = [...new Set([...cambiadas, ...nuevas])];

    assert.ok(tocadas.includes(caso.cuenta), `${caso.id}: «${caso.cuenta}» salió intacta`);
    if (caso.siembra.clase === "cambiarCuenta") {
      assert.deepEqual(tocadas.sort(), [caso.siembra.de, caso.siembra.a].sort());
      assert.ok(!ahora.has(caso.siembra.de), `${caso.id}: la cuenta de origen sigue en el mayor`);
    } else {
      assert.deepEqual(tocadas, [caso.cuenta], `${caso.id}: tocó ${tocadas.join(", ")}`);
    }
  }
});

test("★ el error sembrado corresponde al TIPO que el caso declara", () => {
  /*
   * Cada tipo deja una firma distinta en la cuenta, y se comprueba contra el
   * mayor limpio en vez de contra lo que dice la siembra: así la prueba mide
   * el resultado, no la intención.
   */
  for (const caso of CASOS) {
    const { mayor } = montarCaso(caso);
    const antes = porCuenta(limpio).get(caso.cuenta);
    const ahora = porCuenta(mayor).get(caso.cuenta);
    const cuantos = (c) => (c ? c.debitos.length + c.creditos.length : 0);
    const suma = (c) => (c ? [...c.debitos, ...c.creditos].reduce((s, m) => s + m.valor, 0) : 0);

    if (caso.tipo === "lado") {
      assert.equal(cuantos(ahora), cuantos(antes), `${caso.id}: cambió el número de renglones`);
      assert.equal(suma(ahora), suma(antes), `${caso.id}: cambió la cifra, no solo el lado`);
      assert.notEqual(ahora.debitos.length, antes.debitos.length, `${caso.id}: no cambió de lado`);
    }
    if (caso.tipo === "valor") {
      assert.equal(cuantos(ahora), cuantos(antes), `${caso.id}: cambió el número de renglones`);
      assert.equal(ahora.debitos.length, antes.debitos.length, `${caso.id}: cambió de lado, no de cifra`);
      assert.notEqual(suma(ahora), suma(antes), `${caso.id}: la cifra quedó igual`);
    }
    if (caso.tipo === "falta") {
      assert.equal(cuantos(ahora), cuantos(antes) - 1, `${caso.id}: no falta ningún renglón`);
    }
    if (caso.tipo === "cuenta") {
      assert.equal(cuantos(ahora), cuantos(antes) + 1, `${caso.id}: la cuenta no recibió el renglón ajeno`);
    }
  }
});

test("★ SOLO el caso de cuenta equivocada deja la balanza nivelada", () => {
  /*
   * Es la lección de la actividad y no se declara en ninguna parte: se
   * calcula. Un error de lado mueve 2× el valor, uno de cifra mueve la
   * diferencia, uno que falta mueve su mitad — todos descuadran. Poner una
   * cifra en la cuenta vecina no mueve ningún total.
   */
  const mudos = CASOS.filter((c) => !montarCaso(c).descuadra);
  assert.equal(mudos.length, 1, `callaron ${mudos.length} casos`);
  assert.equal(mudos[0].tipo, "cuenta");
  assert.equal(casoSinDescuadre(CASOS), mudos[0]);

  for (const caso of CASOS.filter((c) => c !== mudos[0])) {
    const { totales } = montarCaso(caso);
    assert.ok(totales.descuadre > 0, `${caso.id} no descuadró`);
  }
});

test("el mayor limpio del capítulo sí cuadra: la siembra es la única causa", () => {
  const t = totalesDelMayor(limpio);
  assert.ok(t.cuadra, `el mayor del capítulo ya venía descuadrado: ${t.debe} contra ${t.haber}`);
});

test("★ el caso mudo va siempre, y siempre de último", () => {
  const mudo = casoSinDescuadre(CASOS);
  for (let i = 0; i < 40; i += 1) {
    const sorteados = sortearCasos(CASOS, ERROR_ESCONDIDO.porPartida, (xs) => [...xs].sort(() => Math.random() - 0.5));
    assert.equal(sorteados.length, ERROR_ESCONDIDO.porPartida);
    assert.equal(sorteados.at(-1), mudo, "el caso mudo no quedó de último");
    assert.equal(new Set(sorteados).size, sorteados.length, "salió un caso repetido");
  }
});

test("el sorteo sí varía: los dos primeros casos no son siempre los mismos", () => {
  const vistos = new Set();
  for (let i = 0; i < 60; i += 1) {
    const s = sortearCasos(CASOS, 3, (xs) => [...xs].sort(() => Math.random() - 0.5));
    vistos.add(s.slice(0, 2).map((c) => c.id).sort().join("+"));
  }
  assert.ok(vistos.size > 1, "el sorteo devolvió siempre la misma pareja");
});

test("una siembra que no encuentra su renglón revienta en vez de devolver el mayor limpio", () => {
  assert.throws(() => transaccionesConError({
    transaccion: "ene-02", siembra: { clase: "cambiarValor", cuenta: "Terrenos", valor: 1 },
  }), /no está en el asiento/);
  assert.throws(() => transaccionesConError({
    transaccion: "ene-99", siembra: { clase: "cambiarValor", cuenta: "Bancos", valor: 1 },
  }), /no existe/);
});

test("las cuentas que nombra cada caso existen en el catálogo del capítulo", () => {
  for (const caso of CASOS) {
    assert.ok(tipoDeCuenta(caso.cuenta), `${caso.id}: «${caso.cuenta}» no está en el catálogo`);
    for (const n of [caso.siembra.cuenta, caso.siembra.de, caso.siembra.a].filter(Boolean)) {
      assert.ok(tipoDeCuenta(n), `${caso.id}: «${n}» no está en el catálogo`);
    }
  }
});

/* ═══════════════ LA DEVOLUCIÓN ═══════════════ */

test("★ la pista de comparar totales NO se da cuando los totales coinciden", () => {
  /*
   * «Compare el total del debe contra el del haber» es un consejo inútil en el
   * caso mudo: los dos son iguales y el error está igual. Darlo ahí enseñaría
   * a confiar en el instrumento justo donde falla.
   */
  const mudo = casoSinDescuadre(CASOS);
  const otra = montarCaso(mudo).mayor.find((c) => c.cuenta !== mudo.cuenta).cuenta;

  const conBalanza = evaluarCuenta(CASOS.find((c) => c !== mudo), "Terrenos", { descuadra: true });
  assert.ok(conBalanza.texto.includes("total del debe"), "la pista de los totales desapareció");

  const sinBalanza = evaluarCuenta(mudo, otra, { descuadra: false });
  assert.ok(!sinBalanza.ok);
  assert.ok(!sinBalanza.texto.includes("total del debe"), "mandó a comparar totales que ya coinciden");
  assert.ok(sinBalanza.texto.includes("diario"), "no dice contra qué comparar");
});

test("señalar la cuenta correcta la nombra; señalar otra, no la revela en el texto", () => {
  for (const caso of CASOS) {
    const { descuadra, mayor } = montarCaso(caso);
    const bien = evaluarCuenta(caso, caso.cuenta, { descuadra });
    assert.ok(bien.ok);
    assert.ok(bien.texto.includes(caso.cuenta), `${caso.id}: el acierto no nombra la cuenta`);

    const otra = mayor.find((c) => c.cuenta !== caso.cuenta).cuenta;
    const mal = evaluarCuenta(caso, otra, { descuadra });
    assert.ok(!mal.ok);
    assert.ok(!mal.texto.includes(caso.cuenta), `${caso.id}: el fallo regala la respuesta`);
  }
});

test("★ el diagnóstico correcto siempre lleva su explicación, y el errado nunca la niega", () => {
  for (const caso of CASOS) {
    const bien = evaluarTipo(caso, caso.tipo);
    assert.ok(bien.ok);
    assert.ok(bien.texto.startsWith("✅"), `${caso.id}: el acierto no está marcado como acierto`);
    assert.ok(bien.texto.includes(nombreDeTipo(caso.tipo)), `${caso.id}: no nombra el tipo`);
    assert.ok(bien.texto.includes(caso.explicacion), `${caso.id}: falta la explicación del caso`);

    for (const x of TIPOS_DE_ERROR.filter((y) => y.id !== caso.tipo)) {
      const mal = evaluarTipo(caso, x.id);
      assert.ok(!mal.ok);
      assert.ok(mal.texto.startsWith("❌"), `${caso.id}/${x.id}: el fallo no está marcado como fallo`);
      assert.ok(mal.texto.length > 20, `${caso.id}/${x.id}: devolución vacía`);
    }
  }
});

test("★ las confusiones que el capítulo nombra reciben SU texto, no uno genérico", () => {
  const e = ERROR_ESCONDIDO.errores;
  const deLado = CASOS.find((c) => c.tipo === "lado");
  const deValor = CASOS.find((c) => c.tipo === "valor");
  const deFalta = CASOS.find((c) => c.tipo === "falta");

  assert.equal(evaluarTipo(deLado, "valor").texto, e.valorPorLado);
  assert.equal(evaluarTipo(deValor, "lado").texto, e.ladoPorValor);
  assert.equal(evaluarTipo(deLado, "falta").texto, e.faltaPorMalPuesto);
  assert.equal(evaluarTipo(deValor, "falta").texto, e.faltaPorMalPuesto);
  /* El caso de la consignación tiene texto propio, gane quien gane la confusión. */
  for (const x of TIPOS_DE_ERROR.filter((y) => y.id !== "falta")) {
    assert.equal(evaluarTipo(deFalta, x.id).texto, e.consignacion, `${x.id} no recibió el texto de la consignación`);
  }
});

/* ═══════════════ LA NOTA ═══════════════ */

test("★ dentro de cada caso, la cuenta pesa 60 % y el tipo 40 %", () => {
  const p = (cuentaOk, tipoOk) => puntuarErrorEscondido([{ cuentaOk, tipoOk }]);
  assert.equal(p(true, true), 100);
  assert.equal(p(false, false), 0);
  assert.equal(Math.round(p(true, false)), 60);
  assert.equal(Math.round(p(false, true)), 40);
  assert.ok(p(true, false) > p(false, true), "señalar la cuenta vale menos que diagnosticarla");
  assert.equal(PESO.cuenta + PESO.tipo, 1);
});

test("la nota promedia los casos, no los suma", () => {
  const todos = Array.from({ length: ERROR_ESCONDIDO.porPartida }, () => ({ cuentaOk: true, tipoOk: true }));
  assert.equal(puntuarErrorEscondido(todos), 100);
  assert.equal(Math.round(puntuarErrorEscondido([
    { cuentaOk: true, tipoOk: true }, { cuentaOk: false, tipoOk: false },
  ])), 50);
  assert.equal(puntuarErrorEscondido([]), 0);
});

test("los ítems de CU-12 son dos por caso, con la gramática que lee el panel docente", () => {
  for (const caso of CASOS) {
    assert.match(`${caso.id}:cuenta`, /^cu12-\d{2}:cuenta$/);
    assert.match(`${caso.id}:tipo`, /^cu12-\d{2}:tipo$/);
  }
  assert.equal(new Set(CASOS.map((c) => c.id)).size, CASOS.length, "hay ids de caso repetidos");
});

test("★ la etiqueta del panel docente NO delata la cuenta sembrada", () => {
  /*
   * El profesor abre el panel mientras sus estudiantes todavía tienen la
   * actividad por delante. Una etiqueta que diga «Hipoteca por pagar» ahorra
   * un clic y convierte el panel en la hoja de respuestas del caso: la
   * pregunta es precisamente cuál cuenta es.
   *
   * Lo que sí debe llevar es de qué transacción sale el caso —identifica la
   * fila sin resolverla— y cuál de las dos preguntas es, porque dos filas
   * idénticas recortadas a 70 caracteres no le sirven a nadie.
   */
  for (const caso of CASOS) {
    const t = LAVADO_DE_AUTOS.transacciones.find((x) => x.id === caso.transaccion);
    const etiquetas = ["cuenta", "tipo"].map((que) => {
      const e = etiquetaDeItem("cu-error-escondido", `${caso.id}:${que}`, 500);
      assert.ok(e, `${caso.id}:${que} sin etiqueta`);
      assert.ok(!e.includes(caso.cuenta), `${caso.id}:${que} delata «${caso.cuenta}»`);
      assert.ok(e.includes(t.texto), `${caso.id}:${que} no dice de qué transacción sale`);
      return e;
    });
    assert.notEqual(etiquetas[0], etiquetas[1], `${caso.id}: las dos preguntas se ven iguales`);
    for (const e of etiquetas) {
      assert.notEqual(recortar(e, 70), recortar(etiquetas[e === etiquetas[0] ? 1 : 0], 70));
    }
  }
});

test("un item_id que no existe no inventa etiqueta", () => {
  assert.equal(etiquetaDeItem("cu-error-escondido", "cu12-99:cuenta"), null);
  assert.equal(etiquetaDeItem("cu-error-escondido", "cu12-01:loquesea"), null);
});

test("los cuatro diagnósticos son los cuatro del capítulo, y cada uno sale en algún caso", () => {
  assert.deepEqual(TIPOS_DE_ERROR.map((t) => t.id).sort(), ["cuenta", "falta", "lado", "valor"]);
  for (const t of TIPOS_DE_ERROR) {
    assert.ok(CASOS.some((c) => c.tipo === t.id), `ningún caso es de tipo «${t.id}»`);
  }
  for (const c of CASOS) assert.ok(nombreDeTipo(c.tipo), `${c.id}: tipo desconocido`);
});

test("el mayor sembrado conserva los dos lados de la cuenta T que se dibuja", () => {
  /* Si la siembra vaciara una cuenta entera, la T saldría sin nada que señalar. */
  for (const caso of CASOS) {
    for (const c of montarCaso(caso).mayor) {
      assert.ok(c.debitos.length + c.creditos.length > 0, `${caso.id}: «${c.cuenta}» quedó vacía`);
      assert.ok([DEBE, HABER, null].includes(c.lado));
    }
  }
});
