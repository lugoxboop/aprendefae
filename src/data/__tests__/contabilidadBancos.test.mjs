import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SALDO_DE_LA_CUENTA, CAJA_DEL_CAPITULO,
  ARMA_EL_ASIENTO, TRANSACCIONES_SUELTAS,
  SIMPLE_O_COMPUESTO,
  CUADRA_O_NO, balanceDelAsiento, puntuarCuadraONo, PESO_JUICIOS, PESO_DESCUADRES,
  CORRIENTE_DE_CUENTAS,
  ASIENTO_COMPUESTO, COMPUESTAS_SUELTAS,
  MAYORIZACION, CORTE_SET_A,
  ERROR_ESCONDIDO, TIPOS_DE_ERROR,
} from "../contabilidadActividades.js";
import {
  LAVADO_DE_AUTOS, CALEJA, mayorConSaldos, saldoDe, tipoDeCuenta,
  ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO, DEBE, HABER,
} from "../contabilidad.js";
import { PIEZAS_APRENDER } from "../contabilidadAprender.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS BANCOS DE CU-5 A CU-12, Y LAS CUATRO PIEZAS DE APRENDER.
 *
 * El principio que vigilan casi todas estas pruebas: NINGÚN BANCO REPITE UNA
 * CIFRA QUE YA ESTÉ EN OTRO SITIO. Las cuentas de CU-5 se referencian a los
 * mayores, las transacciones de CU-6 y CU-10 a los casos, y los saldos de
 * CU-11 se derivan de su corte. Cuando una cifra vive en dos sitios, tarde o
 * temprano deja de ser la misma en los dos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const mayores = {
  lavado: mayorConSaldos(LAVADO_DE_AUTOS.transacciones),
  caleja: mayorConSaldos(CALEJA.transacciones),
};
const transacciones = {
  lavado: LAVADO_DE_AUTOS.transacciones,
  caleja: CALEJA.transacciones,
};

/* ═══════════════════════ CU-5 ═══════════════════════ */

test("CU-5: diez cuentas, y nueve se referencian en vez de copiarse", () => {
  assert.equal(SALDO_DE_LA_CUENTA.items.length, 10);
  assert.equal(SALDO_DE_LA_CUENTA.porPartida, 6);
  const referenciadas = SALDO_DE_LA_CUENTA.items.filter((i) => i.caso !== "capitulo");
  assert.equal(referenciadas.length, 9);
  /* Y la única escrita a mano es la del ejemplo del capítulo, que no sale de un caso. */
  const sueltas = SALDO_DE_LA_CUENTA.items.filter((i) => i.caso === "capitulo");
  assert.equal(sueltas.length, 1);
});

test("CU-5: las nueve referencias existen de verdad en su mayor", () => {
  for (const i of SALDO_DE_LA_CUENTA.items) {
    if (i.caso === "capitulo") continue;
    const encontrada = mayores[i.caso]?.find((c) => c.cuenta === i.cuenta);
    assert.ok(encontrada, `${i.id}: «${i.cuenta}» no está en el mayor de ${i.caso}`);
  }
});

test("CU-5: los diez saldos son los de la ficha, derivados y no tecleados", () => {
  const ESPERADO = {
    "cu5-01": [1850, DEBE], "cu5-02": [200, DEBE], "cu5-03": [3750, HABER],
    "cu5-04": [7600, HABER], "cu5-05": [4000, HABER], "cu5-06": [6000, HABER],
    "cu5-07": [240000, DEBE], "cu5-08": [350000, HABER], "cu5-09": [25000, DEBE],
    "cu5-10": [1350, DEBE],
  };
  for (const i of SALDO_DE_LA_CUENTA.items) {
    const c = i.caso === "capitulo"
      ? saldoDe(CAJA_DEL_CAPITULO)
      : mayores[i.caso].find((x) => x.cuenta === i.cuenta);
    const [saldo, lado] = ESPERADO[i.id];
    assert.equal(c.saldo, saldo, `${i.id} (${i.cuenta}): saldo`);
    assert.equal(c.lado, lado, `${i.id} (${i.cuenta}): lado`);
  }
});

test("CU-5: la Caja del capítulo es la del ejemplo — 1.000 y 500 contra 150", () => {
  const s = saldoDe(CAJA_DEL_CAPITULO);
  assert.equal(s.debito, 1500);
  assert.equal(s.credito, 150);
  assert.equal(s.saldo, 1350);
  assert.equal(s.lado, DEBE);
});

/* ═══════════════════════ CU-6 ═══════════════════════ */

test("CU-6: doce transacciones, nueve referenciadas y tres del capítulo", () => {
  assert.equal(ARMA_EL_ASIENTO.items.length, 12);
  assert.equal(ARMA_EL_ASIENTO.porPartida, 6);
  assert.equal(ARMA_EL_ASIENTO.decisionesPorItem, 4);
  assert.equal(ARMA_EL_ASIENTO.items.filter((i) => i.suelta).length, 3);
  assert.equal(ARMA_EL_ASIENTO.items.filter((i) => i.caso).length, 9);
});

test("CU-6: toda referencia apunta a una transacción que existe", () => {
  const sueltas = new Set(TRANSACCIONES_SUELTAS.map((t) => t.id));
  for (const i of ARMA_EL_ASIENTO.items) {
    if (i.suelta) { assert.ok(sueltas.has(i.suelta), `${i.id}: falta la suelta ${i.suelta}`); continue; }
    const t = transacciones[i.caso]?.find((x) => x.id === i.transaccion);
    assert.ok(t, `${i.id}: ${i.caso}/${i.transaccion} no existe`);
  }
});

test("CU-6: las tres sueltas cuadran, y la de los dos socios lleva la CORRECCIÓN 1", () => {
  for (const t of TRANSACCIONES_SUELTAS) {
    const b = balanceDelAsiento(t.asiento);
    assert.ok(b.cuadra, `${t.id}: debe ${b.debe} contra haber ${b.haber}`);
  }
  const socios = TRANSACCIONES_SUELTAS.find((t) => t.id === "cu6-dos-socios");
  /*
   * El enunciado dice «cada uno aporta $1.000» —la redacción del libro— pero
   * el asiento registra $2.000, que es lo que hace su propio libro diario.
   */
  assert.match(socios.texto, /cada uno aporta \$1\.000/);
  assert.deepEqual(socios.asiento.debe, [["Caja", 2000]]);
  assert.deepEqual(socios.asiento.haber, [["Aportes sociales", 2000]]);
});

test("CU-6: todas las transacciones del banco son asientos SIMPLES", () => {
  /* Los compuestos son de CU-10; mezclarlos aquí rompería la progresión. */
  for (const i of ARMA_EL_ASIENTO.items) {
    const t = i.suelta
      ? TRANSACCIONES_SUELTAS.find((x) => x.id === i.suelta)
      : transacciones[i.caso].find((x) => x.id === i.transaccion);
    assert.equal(t.asiento.debe.length, 1, `${i.id}: más de una cuenta al debe`);
    assert.equal(t.asiento.haber.length, 1, `${i.id}: más de una cuenta al haber`);
  }
});

/* ═══════════════════════ CU-7 ═══════════════════════ */

test("CU-7: diez ítems, y el número de cuentas concuerda con ser simple o compuesto", () => {
  assert.equal(SIMPLE_O_COMPUESTO.items.length, 10);
  for (const i of SIMPLE_O_COMPUESTO.items) {
    const esperado = i.cuentas === 2 ? "simple" : "compuesto";
    assert.equal(i.categoria, esperado,
      `${i.id}: dice ${i.categoria} con ${i.cuentas} cuentas`);
    assert.ok(i.cuentas >= 2, `${i.id}: un asiento no puede tener menos de dos cuentas`);
  }
});

test("CU-7: la trampa de los tres socios está, y es un asiento SIMPLE", () => {
  const trampa = SIMPLE_O_COMPUESTO.items.find((i) => /tres socios/.test(i.enunciado));
  assert.ok(trampa, "falta el ítem de los tres socios");
  assert.equal(trampa.categoria, "simple");
  assert.equal(trampa.cuentas, 2);
  assert.match(SIMPLE_O_COMPUESTO.errores.compuestoPorPersonas, /Cuente cuentas, no gente/);
});

/* ═══════════════════════ CU-8 ═══════════════════════ */

test("CU-8: el descuadre se CALCULA del asiento, no se declara", () => {
  /* Si estuviera escrito podría decir 500 con unas cifras que dan 400. */
  for (const a of CUADRA_O_NO.asientos) {
    assert.ok(!("descuadre" in a), `${a.id}: el descuadre no debe estar escrito`);
    assert.ok(!("cuadra" in a), `${a.id}: el juicio no debe estar escrito`);
  }
});

test("CU-8: cinco cuadran y cinco no, con los descuadres de la ficha", () => {
  const DESCUADRES = { "cu8-04": 500, "cu8-05": 100, "cu8-07": 5000, "cu8-09": 50, "cu8-10": 500 };
  let cuadran = 0;
  for (const a of CUADRA_O_NO.asientos) {
    const b = balanceDelAsiento(a);
    if (b.cuadra) { cuadran += 1; assert.ok(!(a.id in DESCUADRES), `${a.id} debería descuadrar`); }
    else assert.equal(b.descuadre, DESCUADRES[a.id], `${a.id}: descuadre`);
  }
  assert.equal(cuadran, 5);
  assert.equal(Object.keys(DESCUADRES).length, 5);
});

test("CU-8: EL BANCO GARANTIZA que nunca salgan cero descuadrados", () => {
  /*
   * ESTA ES LA PRUEBA QUE SOSTIENE LA FÓRMULA DE PUNTAJE. El 25 % se reparte
   * entre los descuadrados sorteados; si salieran cero, ese 25 % no se podría
   * repartir y el intento valdría 75 como techo sin culpa del estudiante.
   *
   * Con cinco cuadrados de diez y seis sorteados, siempre entra al menos uno
   * descuadrado. No se razona: se enumeran las 210 combinaciones.
   */
  const ids = CUADRA_O_NO.asientos.map((a) => a.id);
  const descuadrados = new Set(
    CUADRA_O_NO.asientos.filter((a) => !balanceDelAsiento(a).cuadra).map((a) => a.id),
  );
  const combinaciones = [];
  const elegir = (desde, actual) => {
    if (actual.length === CUADRA_O_NO.porPartida) { combinaciones.push([...actual]); return; }
    for (let i = desde; i < ids.length; i += 1) { actual.push(ids[i]); elegir(i + 1, actual); actual.pop(); }
  };
  elegir(0, []);
  assert.equal(combinaciones.length, 210, "C(10,6) = 210");

  let minimo = Infinity;
  for (const combo of combinaciones) {
    minimo = Math.min(minimo, combo.filter((id) => descuadrados.has(id)).length);
  }
  assert.ok(minimo >= 1, `hay un sorteo posible con ${minimo} descuadrados`);
});

test("CU-8: el puntaje reparte 75 % en juicios y 25 % entre los descuadrados", () => {
  assert.equal(PESO_JUICIOS + PESO_DESCUADRES, 1);
  /* Todo bien. */
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: 3, cifrasAcertadas: 3 }), 100);
  /* Los seis juicios bien y ninguna cifra: el techo es 75. */
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: 3, cifrasAcertadas: 0 }), 75);
  /* Ningún juicio y todas las cifras: 25. */
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 3, cifrasAcertadas: 3 }), 25);
  assert.equal(puntuarCuadraONo({ juiciosAcertados: 0, descuadradosEnJuego: 2, cifrasAcertadas: 0 }), 0);
});

test("CU-8: el reparto del 25 % NO depende de cuántos descuadrados salgan", () => {
  /*
   * Acertar todas las cifras vale lo mismo salgan uno o cinco descuadrados: si
   * no, el puntaje dependería de la suerte del sorteo y no del estudiante.
   */
  for (const n of [1, 2, 3, 4, 5]) {
    assert.equal(
      puntuarCuadraONo({ juiciosAcertados: 6, descuadradosEnJuego: n, cifrasAcertadas: n }), 100,
      `con ${n} descuadrados`,
    );
    assert.equal(
      puntuarCuadraONo({ juiciosAcertados: 3, descuadradosEnJuego: n, cifrasAcertadas: 0 }), 38,
      `con ${n} descuadrados y medio acierto en juicios`,
    );
  }
});

/* ═══════════════════════ CU-9 ═══════════════════════ */

test("CU-9: veinticuatro cuentas, doce por intento, y las seis familias", () => {
  assert.equal(CORRIENTE_DE_CUENTAS.cuentas.length, 24);
  assert.equal(CORRIENTE_DE_CUENTAS.porPartida, 12);
  assert.deepEqual(
    CORRIENTE_DE_CUENTAS.categorias.map((c) => c.id),
    [ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO],
  );
});

test("CU-9: LA FAMILIA NO SE ESCRIBE, se toma del catálogo", () => {
  /*
   * Una lista paralela podría contradecir al catálogo, y entonces CU-2 y CU-9
   * clasificarían la misma cuenta de dos maneras distintas.
   */
  for (const cuenta of CORRIENTE_DE_CUENTAS.cuentas) {
    assert.ok(tipoDeCuenta(cuenta), `«${cuenta}» no está en el catálogo`);
  }
  assert.equal(new Set(CORRIENTE_DE_CUENTAS.cuentas).size, 24, "hay cuentas repetidas");
});

test("CU-9: el reparto por familia es el de la ficha — 6/5/4/4/4/1", () => {
  const cuenta = {};
  for (const c of CORRIENTE_DE_CUENTAS.cuentas) {
    const t = tipoDeCuenta(c);
    cuenta[t] = (cuenta[t] ?? 0) + 1;
  }
  assert.deepEqual(cuenta, {
    [ACTIVO]: 6, [PASIVO]: 5, [PATRIMONIO]: 4, [INGRESO]: 4, [GASTO]: 4, [COSTO]: 1,
  });
});

/* ═══════════════════════ CU-10 ═══════════════════════ */

test("CU-10: cinco transacciones, y TODAS son compuestas", () => {
  assert.equal(ASIENTO_COMPUESTO.items.length, 5);
  assert.equal(ASIENTO_COMPUESTO.porPartida, 3);
  for (const i of ASIENTO_COMPUESTO.items) {
    const t = i.suelta
      ? COMPUESTAS_SUELTAS.find((x) => x.id === i.suelta)
      : transacciones[i.caso].find((x) => x.id === i.transaccion);
    assert.ok(t, `${i.id}: no existe`);
    const cuentas = t.asiento.debe.length + t.asiento.haber.length;
    assert.ok(cuentas > 2, `${i.id}: solo toca ${cuentas} cuentas, no es compuesto`);
    assert.ok(balanceDelAsiento(t.asiento).cuadra, `${i.id}: no cuadra`);
  }
});

test("CU-10: el peso dentro de cada transacción suma uno, y las cuentas pesan más", () => {
  const { cuentas, lados, cifras } = ASIENTO_COMPUESTO.peso;
  assert.equal(cuentas + lados + cifras, 1);
  assert.ok(cuentas > lados && cuentas > cifras, "elegir bien las cuentas es lo que exige entender");
});

test("CU-10: la del 50 % se parte en dos mitades iguales que suman el total", () => {
  const t = COMPUESTAS_SUELTAS.find((x) => x.id === "cu10-computador-mitad");
  const [, total] = t.asiento.debe[0];
  assert.equal(total, 1500000);
  const partes = t.asiento.haber.map(([, v]) => v);
  assert.deepEqual(partes, [750000, 750000]);
  assert.equal(partes[0] + partes[1], total);
});

/* ═══════════════════════ CU-11 ═══════════════════════ */

test("CU-11: dos sets, uno por intento, y ninguno trae sus saldos escritos", () => {
  assert.equal(MAYORIZACION.sets.length, 2);
  assert.equal(MAYORIZACION.porPartida, 1);
  for (const s of MAYORIZACION.sets) {
    assert.ok(!("saldos" in s), `${s.id}: los saldos no deben estar escritos, se derivan`);
    assert.ok(!("cuentas" in s), `${s.id}: las cuentas no deben estar escritas`);
  }
});

test("CU-11 SET A: el corte son cinco asientos y da diez cuentas, sin Caja", () => {
  const setA = MAYORIZACION.sets.find((s) => s.id === "set-a");
  assert.deepEqual(setA.transacciones, CORTE_SET_A);
  assert.equal(CORTE_SET_A.length, 5);
  const mayor = mayorConSaldos(
    LAVADO_DE_AUTOS.transacciones.filter((t) => CORTE_SET_A.includes(t.id)),
  );
  assert.equal(mayor.length, 10);
  assert.ok(!mayor.some((c) => c.cuenta === "Caja"), "Caja entra en ene-25, fuera del corte");
});

test("CU-11 SET A: las cuatro marcadas SIGUEN difiriendo del mayor completo", () => {
  /*
   * La advertencia de la ficha, convertida en prueba. Si alguien «corrige»
   * estas cifras contra la p. 100, la actividad calificaría como error la
   * respuesta correcta del corte.
   */
  const corte = Object.fromEntries(
    mayorConSaldos(LAVADO_DE_AUTOS.transacciones.filter((t) => CORTE_SET_A.includes(t.id)))
      .map((c) => [c.cuenta, c.saldo]),
  );
  const completo = Object.fromEntries(mayores.lavado.map((c) => [c.cuenta, c.saldo]));
  const MARCADAS = { "Bancos": [1700, 1850], "Acciones": [5000, 6000], "Hipoteca por pagar": [8000, 7600], "Cuentas por pagar": [4000, 3750] };
  for (const [cuenta, [enCorte, enCompleto]] of Object.entries(MARCADAS)) {
    assert.equal(corte[cuenta], enCorte, `${cuenta} en el corte`);
    assert.equal(completo[cuenta], enCompleto, `${cuenta} en el mayor completo`);
    assert.notEqual(corte[cuenta], completo[cuenta], `${cuenta}: el corte se igualó al mayor completo`);
  }
});

test("CU-11 SET B: las siete cuentas de Caleja, con los saldos de la ficha", () => {
  const setB = MAYORIZACION.sets.find((s) => s.id === "set-b");
  assert.equal(setB.caso, "caleja");
  assert.equal(setB.transacciones, null, "el Set B no se trunca: son las seis");
  const ESPERADO = {
    "Caja": [240000, DEBE], "Aportes sociales": [350000, HABER],
    "Equipo de computación": [25000, DEBE], "Cuentas por pagar": [15000, HABER],
    "Maquinaria": [50000, DEBE], "Obligaciones financieras": [50000, HABER],
    "Local comercial": [100000, DEBE],
  };
  assert.equal(mayores.caleja.length, 7);
  for (const c of mayores.caleja) {
    const [saldo, lado] = ESPERADO[c.cuenta] ?? [];
    assert.equal(c.saldo, saldo, `${c.cuenta}: saldo`);
    assert.equal(c.lado, lado, `${c.cuenta}: lado`);
  }
});

/* ═══════════════════════ CU-12 ═══════════════════════ */

test("CU-12: seis casos, tres por intento, sobre transacciones que existen", () => {
  assert.equal(ERROR_ESCONDIDO.casos.length, 6);
  assert.equal(ERROR_ESCONDIDO.porPartida, 3);
  const ids = new Set(LAVADO_DE_AUTOS.transacciones.map((t) => t.id));
  for (const c of ERROR_ESCONDIDO.casos) {
    assert.ok(ids.has(c.transaccion), `${c.id}: ${c.transaccion} no existe`);
    assert.ok(tipoDeCuenta(c.cuenta), `${c.id}: «${c.cuenta}» no está en el catálogo`);
    assert.ok(c.explicacion?.length > 20, `${c.id}: sin explicación`);
  }
});

test("CU-12: los cuatro tipos de error están declarados y todos se usan", () => {
  const declarados = TIPOS_DE_ERROR.map((t) => t.id);
  assert.deepEqual([...declarados].sort(), ["cuenta", "falta", "lado", "valor"]);
  const usados = new Set(ERROR_ESCONDIDO.casos.map((c) => c.tipo));
  for (const t of declarados) assert.ok(usados.has(t), `el tipo «${t}» no lo usa ningún caso`);
});

test("CU-12: cada caso dice CÓMO se siembra, para que el error sea exactamente uno", () => {
  const CLASES = ["invertirLado", "cambiarValor", "cambiarCuenta", "quitarMitad"];
  for (const c of ERROR_ESCONDIDO.casos) {
    assert.ok(c.siembra, `${c.id}: sin siembra`);
    assert.ok(CLASES.includes(c.siembra.clase), `${c.id}: siembra desconocida «${c.siembra.clase}»`);
  }
});

test("CU-12: el peso de señalar la cuenta y decir el tipo suma uno", () => {
  assert.equal(ERROR_ESCONDIDO.peso.cuenta + ERROR_ESCONDIDO.peso.tipo, 1);
  assert.ok(ERROR_ESCONDIDO.peso.cuenta > ERROR_ESCONDIDO.peso.tipo, "encontrarlo cuesta más que nombrarlo");
});

/* ═══════════════════ LAS CUATRO PIEZAS DE APRENDER ═══════════════════ */

test("★ cada pieza trae una capa 2 y una capa 4, de una de las dos formas", () => {
  /*
   * Las piezas del marco compartido traen `pasos` y una respuesta de
   * referencia; «El debe y el haber» trae `segmentos` y un selector de
   * opciones, porque necesita animaciones que se detienen y devolución por
   * opción. Lo que NO puede pasar es que una pieza no traiga ninguna de las
   * dos: se abriría con la capa 2 o la capa 4 en blanco.
   */
  assert.equal(PIEZAS_APRENDER.length, 5);
  for (const p of PIEZAS_APRENDER) {
    assert.ok(p.titulo?.length > 3, `${p.id}: sin título`);
    assert.ok(p.subtema?.length > 3, `${p.id}: sin subtema`);
    assert.ok(Array.isArray(p.nombres) && p.nombres.length >= 5, `${p.id}: la capa 1 está corta`);

    const conPasos = Array.isArray(p.pasos) && p.pasos.length >= 4;
    const conSegmentos = Array.isArray(p.segmentos) && p.segmentos.length >= 4;
    assert.ok(conPasos || conSegmentos, `${p.id}: la capa 2 está vacía`);
    assert.ok(!(conPasos && conSegmentos), `${p.id}: trae las dos formas de capa 2`);

    assert.ok(p.pregunta?.endsWith("?"), `${p.id}: la capa 4 no pregunta nada`);
    const conOpciones = Array.isArray(p.opciones) && p.opciones.length >= 2;
    assert.ok(conOpciones || p.respuesta?.length > 40, `${p.id}: la capa 4 no responde nada`);
  }
});

test("cada paso de la capa 2 resalta una parte distinta de su escena", () => {
  for (const p of PIEZAS_APRENDER.filter((x) => Array.isArray(x.pasos))) {
    const resaltes = p.pasos.map((s) => s.resaltar);
    assert.equal(new Set(resaltes).size, resaltes.length, `${p.id}: dos pasos resaltan lo mismo`);
    for (const s of p.pasos) {
      assert.ok(s.resaltar?.length > 2, `${p.id}: un paso sin qué resaltar`);
      assert.ok(s.texto?.length > 40, `${p.id}: un paso sin texto`);
    }
  }
});

test("la pieza de la partida doble lleva CINCO pasos y las dos reglas", () => {
  const p = PIEZAS_APRENDER.find((x) => x.id === "cu-a3-partida-doble");
  assert.equal(p.pasos.length, 5);
  const reglas = p.nombres.filter((n) => /^Regla/.test(n.termino));
  assert.equal(reglas.length, 2);
  assert.match(reglas[0].definicion, /Activos, Gastos y Costos.*DEBE/);
  assert.match(reglas[1].definicion, /Pasivos, Patrimonio e Ingresos.*HABER/);
});

test("las definiciones textuales del libro van marcadas, para que no se «mejoren»", () => {
  const textuales = PIEZAS_APRENDER.flatMap((p) => p.nombres.filter((n) => n.textual));
  assert.ok(textuales.length >= 5, "se perdieron las citas textuales");
  for (const t of textuales) {
    assert.match(t.definicion, /«.+»/, `«${t.termino}»: marcada como textual y sin comillas`);
  }
});

test("el asiento de ejemplo del diario cuadra, y lleva la CORRECCIÓN 1", () => {
  const p = PIEZAS_APRENDER.find((x) => x.id === "cu-a4-diario-y-mayor");
  const a = p.asientoDeEjemplo;
  assert.ok(balanceDelAsiento(a).cuadra);
  assert.deepEqual(a.debe, [["Caja", 2000]]);
  assert.deepEqual(a.haber, [["Aportes sociales", 2000]]);
  assert.ok(a.nota?.length > 10, "el asiento del diario lleva su explicación breve");
});

test("ninguna pieza de Aprender otorga FP: no tienen dificultad ni base", () => {
  for (const p of PIEZAS_APRENDER) {
    assert.ok(!("fpBase" in p), `${p.id}: el material teórico no paga FP`);
    assert.ok(!("dificultad" in p), `${p.id}: el material teórico no tiene dificultad`);
  }
});
