import { test } from "node:test";
import assert from "node:assert/strict";

import {
  TOTAL_PUNTOS, PUNTOS_POR_ETAPA, puntuarDesafio, puntosDeEtapa,
  TRANSACCIONES, MOVIMIENTOS, MAYOR, ESTADO, CUENTAS,
  asientoCorrecto, balanceDe, evaluarAsiento, evaluarMovimiento, evaluarSaldo,
  evaluarUbicacion, pctDeItems,
} from "../desafio.js";
import { DESAFIO, SALDO_DE_LA_CUENTA, MAYORIZACION } from "../../data/contabilidadActividades.js";
import { ETAPA_DIARIO, ETAPA_ESTADO, SECCIONES_CON_CUENTAS } from "../../data/contabilidadDesafio.js";
import { DEBE, HABER, UBICACION_ESF, pesos, tipoDeCuenta } from "../../data/contabilidad.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";
import { BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../../fp/motor.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL CICLO COMPLETO» — el desafío del tema.
 *
 * Cuatro etapas encadenadas sobre las mismas nueve transacciones, y ese
 * encadenamiento es lo delicado: el mayor de la etapa 2 tiene que ser el que
 * sale del diario de la etapa 1, los saldos de la 3 los de ese mayor, y el
 * estado de la 4 el que cuadra con esos saldos. Si una se desprende, el
 * estudiante acierta en una etapa y falla en la siguiente por algo que no
 * hizo.
 *
 * Nada de eso se comprueba contra números escritos aquí: se comprueba contra
 * el propio capítulo, que es de donde salen los cuatro.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════ LA CUENTA DEL KIT ═══════════════ */

test("★ el desafío vale base × etapas, con el tope del Kit", () => {
  assert.equal(TOTAL_PUNTOS, BASE_POR_DIFICULTAD[DESAFIO.dificultad] * Math.min(DESAFIO.etapas, TOPE_ETAPAS));
  /* Y el número escrito, para que la igualdad de arriba no sea circular. */
  assert.equal(TOTAL_PUNTOS, 360);
  assert.equal(PUNTOS_POR_ETAPA.reduce((s, e) => s + e.puntos, 0), 360, "el reparto no suma el total");
  assert.deepEqual(PUNTOS_POR_ETAPA.map((e) => e.puntos), [108, 90, 72, 90]);
});

test("★ las cuatro etapas cierran el 100 %, y cada una trae su subtema", () => {
  const pesosSuma = DESAFIO.pesos.reduce((s, e) => s + e.peso, 0);
  assert.ok(Math.abs(pesosSuma - 1) < 1e-9, `los pesos suman ${pesosSuma}`);
  assert.equal(PUNTOS_POR_ETAPA.length, 4);
  for (const e of PUNTOS_POR_ETAPA) {
    assert.ok(e.subtema && e.subtema.length > 0, `la etapa ${e.id} no tiene subtema`);
    assert.ok(e.nombre && e.nombre.length > 0);
  }
});

test("la nota junta las cuatro etapas y una etapa sin jugar no regala puntos", () => {
  assert.equal(puntuarDesafio([100, 100, 100, 100]).puntos, 360);
  assert.equal(puntuarDesafio([100, 100, 100, 100]).pct, 100);
  assert.equal(puntuarDesafio([0, 0, 0, 0]).puntos, 0);
  assert.equal(puntuarDesafio([null, null, null, null]).puntos, 0);
  assert.equal(puntuarDesafio([100, null, null, null]).puntos, PUNTOS_POR_ETAPA[0].puntos);
  /* Y no se sale del rango por mucho que le manden. */
  assert.equal(puntuarDesafio([300, 300, 300, 300]).puntos, 360);
  assert.equal(puntosDeEtapa(9, 100), 0);
});

/* ═══════════════ EL ENCADENAMIENTO ═══════════════ */

test("★ las cuatro etapas salen del MISMO diario, y encajan", () => {
  assert.equal(TRANSACCIONES.length, 9);
  /* La etapa 2 tiene un movimiento por cada renglón del diario, ni uno más. */
  const renglones = TRANSACCIONES.reduce((s, t) => s + t.asiento.debe.length + t.asiento.haber.length, 0);
  assert.equal(MOVIMIENTOS.length, renglones);
  assert.equal(MOVIMIENTOS.length, 22);

  /* La etapa 3 tiene una cuenta por cada cuenta que el diario abre. */
  assert.equal(MAYOR.length, new Set(MOVIMIENTOS.map((m) => m.cuenta)).size);
  assert.equal(MAYOR.length, 11);

  /* Y la etapa 4 ubica esas mismas once, sin sobras ni faltas. */
  const ubicables = CUENTAS.filter((c) => UBICACION_ESF[c]);
  assert.deepEqual(ubicables.sort(), [...CUENTAS].sort(), "una cuenta del mayor no tiene sitio en el estado");
});

test("★ la ecuación cuadra: activos = pasivos + patrimonio, calculado del diario", () => {
  assert.equal(ESTADO.activos, ESTADO.pasivosMasPatrimonio);
  assert.equal(ESTADO.activos, 21350);
  /* El texto de cierre dice esa cifra; que la diga bien no puede depender de nadie. */
  assert.ok(DESAFIO.cierre.includes(pesos(ESTADO.activos)),
    `el cierre no dice ${pesos(ESTADO.activos)}`);
  assert.ok(DESAFIO.cierre.includes(`${TRANSACCIONES.length === 9 ? "Nueve" : ""} transacciones`));
  assert.ok(DESAFIO.cierre.includes(`${MAYOR.length === 11 ? "once" : ""} cuentas`));
});

test("★ el cierre no lleva iconografía de gamificación", () => {
  /* Lo exige el prerrequisito del Kit: la balanza nivelada ES la recompensa. */
  assert.ok(!/🏆|🥇|🎖|🏅|cofre|trofeo|medalla/i.test(DESAFIO.cierre));
});

/* ═══════════════ ETAPA 1 · EL DIARIO ═══════════════ */

test("★ el asiento correcto se reconoce, y uno que cuadra pero no es, no", () => {
  for (const t of TRANSACCIONES) {
    assert.ok(asientoCorrecto(t.asiento, t.asiento), `${t.id}: no se reconoce a sí mismo`);
    assert.ok(evaluarAsiento(t, t.asiento).ok, `${t.id}: el asiento del libro salió mal`);
    assert.ok(balanceDe(t.asiento).cuadra, `${t.id}: el asiento del libro no cuadra`);
  }
  /* Mismas cifras, mismo balance, otras cuentas: la balanza no lo delata. */
  const t = TRANSACCIONES.find((x) => x.id === "ene-08");
  const impostor = { debe: [["Muebles y enseres", 2000]], haber: [["Letras por pagar", 2000]] };
  assert.ok(balanceDe(impostor).cuadra);
  const r = evaluarAsiento(t, impostor);
  assert.ok(!r.ok);
  assert.equal(r.texto, ETAPA_DIARIO.cuadraPeroNoEs);
});

test("★ cada confusión que la ficha escribió es ALCANZABLE", () => {
  /*
   * Una devolución escrita que ningún intento posible dispara es peor que no
   * tenerla: parece que la actividad enseña algo que nadie va a leer. Aquí se
   * construye el intento equivocado de cada una y se comprueba que sale ESA.
   */
  const armar = (id, asiento) => evaluarAsiento(TRANSACCIONES.find((t) => t.id === id), asiento);

  const intentos = {
    "ene02-caja": armar("ene-02", { debe: [["Caja", 5000]], haber: [["Acciones", 5000]] }),
    "ene02-aportes": armar("ene-02", { debe: [["Bancos", 5000]], haber: [["Aportes sociales", 5000]] }),
    "ene03-unio": armar("ene-03", { debe: [["Construcciones y edificaciones", 10000]], haber: [["Bancos", 2000], ["Hipoteca por pagar", 8000]] }),
    "ene03-pago": armar("ene-03", { debe: [["Construcciones y edificaciones", 6000], ["Terrenos", 4000]], haber: [["Bancos", 10000]] }),
    "ene04-letras": armar("ene-04", { debe: [["Flota y equipo de transporte", 4800]], haber: [["Bancos", 4800]] }),
    "ene08-bancos": armar("ene-08", { debe: [["Equipo de computación", 2000]], haber: [["Bancos", 2000]] }),
    "ene18-lado": armar("ene-18", { debe: [["Bancos", 250]], haber: [["Cuentas por pagar", 250]] }),
    "ene25-bancos": armar("ene-25", { debe: [["Bancos", 1000]], haber: [["Acciones", 1000]] }),
    "ene25-cifra": armar("ene-25", { debe: [["Caja", 200]], haber: [["Acciones", 200]] }),
    "ene26-ingreso": armar("ene-26", { debe: [["Bancos", 800]], haber: [["Ingresos por servicios", 800]] }),
    "ene30-letras": armar("ene-30", { debe: [["Letras por pagar", 400]], haber: [["Bancos", 400]] }),
  };

  for (const c of ETAPA_DIARIO.errores) {
    const r = intentos[c.id];
    assert.ok(r, `${c.id}: la prueba no construye un intento para esta confusión`);
    assert.ok(!r.ok, `${c.id}: el intento equivocado se dio por bueno`);
    assert.equal(r.texto, c.texto, `${c.id}: salió otra devolución`);
  }
  assert.equal(Object.keys(intentos).length, ETAPA_DIARIO.errores.length);
});

test("la regla general del descuadre sale cuando ninguna confusión concreta aplica", () => {
  const t = TRANSACCIONES.find((x) => x.id === "ene-12");
  const r = evaluarAsiento(t, { debe: [["Muebles y enseres", 2500]], haber: [["Bancos", 500], ["Cuentas por pagar", 1000]] });
  assert.ok(!r.ok);
  assert.ok(r.texto.includes("La balanza se inclinó"));
  assert.ok(r.texto.includes(pesos(1000)), "no dice de cuánto es el descuadre");
});

test("el acierto del diario dice el total del asiento, no un número fijo", () => {
  for (const t of TRANSACCIONES) {
    const total = balanceDe(t.asiento).debe;
    assert.ok(evaluarAsiento(t, t.asiento).texto.includes(pesos(total)), `${t.id}: el acierto no dice ${pesos(total)}`);
  }
  /* Y los nueve totales no son todos iguales: el texto de verdad varía. */
  assert.ok(new Set(TRANSACCIONES.map((t) => balanceDe(t.asiento).debe)).size > 1);
});

/* ═══════════════ ETAPA 2 · LA MAYORIZACIÓN ═══════════════ */

test("★ mayorizar bien es acierto; el lado y la cuenta tienen devoluciones distintas", () => {
  const m = MOVIMIENTOS[0];
  assert.ok(evaluarMovimiento(m, { cuenta: m.cuenta, lado: m.lado }).ok);

  const alReves = evaluarMovimiento(m, { cuenta: m.cuenta, lado: m.lado === DEBE ? HABER : DEBE });
  assert.ok(!alReves.ok);
  assert.equal(alReves.texto, MAYORIZACION.errores.ladoContrario);

  const otra = MAYOR.find((c) => c.cuenta !== m.cuenta).cuenta;
  const mala = evaluarMovimiento(m, { cuenta: otra, lado: m.lado });
  assert.ok(!mala.ok);
  assert.ok(mala.texto.includes(m.cuenta), "no dice a qué cuenta pertenecía");
  assert.notEqual(mala.texto, alReves.texto);
});

test("los 22 movimientos llevan a un mayor idéntico al del capítulo", () => {
  const reconstruido = new Map();
  for (const m of MOVIMIENTOS) {
    if (!reconstruido.has(m.cuenta)) reconstruido.set(m.cuenta, { debitos: [], creditos: [] });
    reconstruido.get(m.cuenta)[m.lado === DEBE ? "debitos" : "creditos"].push(m.valor);
  }
  for (const c of MAYOR) {
    const r = reconstruido.get(c.cuenta);
    assert.ok(r, `${c.cuenta} no aparece en los movimientos`);
    assert.deepEqual(r.debitos.sort(), c.debitos.map((x) => x.valor).sort(), `${c.cuenta}: débitos`);
    assert.deepEqual(r.creditos.sort(), c.creditos.map((x) => x.valor).sort(), `${c.cuenta}: créditos`);
  }
});

/* ═══════════════ ETAPA 3 · LOS SALDOS ═══════════════ */

test("★ el saldo de cada una de las once se acepta con su cifra y su lado", () => {
  for (const c of MAYOR) {
    const bien = evaluarSaldo(c, { cifra: c.saldo, lado: c.lado });
    assert.ok(bien.ok, `${c.cuenta}: el saldo del capítulo salió mal`);
    assert.ok(bien.texto.includes(pesos(c.saldo)), `${c.cuenta}: el acierto no dice la cifra`);
    assert.ok(bien.texto.includes(pesos(c.debito)) && bien.texto.includes(pesos(c.credito)),
      `${c.cuenta}: el acierto no enseña los dos movimientos`);
    /* Ninguna cuenta del caso queda con saldo cero: todas tienen lado. */
    assert.ok(c.lado === DEBE || c.lado === HABER, `${c.cuenta}: saldo sin lado`);
  }
});

test("★ los cuatro patrones de CU-5 se reconocen, cada uno el suyo", () => {
  const e = SALDO_DE_LA_CUENTA.errores;
  /* Se busca una cuenta con los dos movimientos, para que sumar ≠ restar. */
  const c = MAYOR.find((x) => x.debito > 0 && x.credito > 0);
  assert.ok(c, "ninguna cuenta del caso tiene los dos movimientos");

  assert.ok(evaluarSaldo(c, { cifra: c.debito + c.credito, lado: c.lado }).texto.startsWith(e.sumo.slice(0, 20)));
  assert.equal(evaluarSaldo(c, { cifra: c.saldo, lado: c.lado === DEBE ? HABER : DEBE }).texto,
    e.ladoEquivocado.replace("{movimiento}", c.lado === DEBE ? "débito" : "crédito"));
  assert.ok(evaluarSaldo(c, { cifra: -c.saldo, lado: c.lado }).texto.includes("nunca es negativo"));
  /* Cifra mal y lado mal a la vez: el patrón del lado del movimiento menor. */
  assert.ok(evaluarSaldo(c, { cifra: c.saldo + 1, lado: c.lado === DEBE ? HABER : DEBE }).texto.includes(pesos(c.debito)));
});

/* ═══════════════ ETAPA 4 · EL ESTADO ═══════════════ */

test("★ cada una de las once se ubica bien, y el acierto trae su razón", () => {
  for (const cuenta of CUENTAS) {
    const r = evaluarUbicacion(cuenta, UBICACION_ESF[cuenta]);
    assert.ok(r.ok, `${cuenta}: la ubicación del capítulo salió mal`);
    assert.ok(r.texto.includes(cuenta), `${cuenta}: el acierto no la nombra`);
    /* La plantilla de la ficha pide «[Cuenta] es [tipo]. [Razón breve.]» */
    assert.ok(r.texto.length > cuenta.length + 25, `${cuenta}: el acierto se quedó sin razón`);
  }
});

test("★ las cinco confusiones que la ficha escribió son ALCANZABLES", () => {
  const e = ETAPA_ESTADO.errores;
  assert.equal(evaluarUbicacion("Acciones", "pasivo-no-corriente").texto, e.accionesEnPasivo);
  assert.equal(evaluarUbicacion("Hipoteca por pagar", "pasivo-corriente").texto, e.hipotecaEnCorriente);
  assert.equal(evaluarUbicacion("Letras por pagar", "pasivo-no-corriente").texto, e.letrasEnNoCorriente);
  assert.equal(evaluarUbicacion("Caja", "activo-no-corriente").texto, e.efectivoEnNoCorriente);
  assert.equal(evaluarUbicacion("Flota y equipo de transporte", "activo-corriente").texto, e.noCorrienteEnCorriente);
});

test("las cinco secciones del estado tienen cuentas, y ninguna cuenta en dos", () => {
  const vistas = new Set();
  for (const s of SECCIONES_CON_CUENTAS) {
    assert.ok(s.cuentas.length > 0, `la sección ${s.id} quedó vacía`);
    for (const c of s.cuentas) {
      assert.ok(!vistas.has(c), `${c} está en dos secciones`);
      vistas.add(c);
    }
  }
  assert.deepEqual([...vistas].sort(), [...CUENTAS].sort());
  /* Y el patrimonio no lleva pasivos ni al revés, según el catálogo. */
  for (const s of SECCIONES_CON_CUENTAS) {
    for (const c of s.cuentas) {
      const tipo = tipoDeCuenta(c);
      if (s.id.startsWith("activo")) assert.equal(tipo, "activo", `${c} en ${s.id}`);
      if (s.id.startsWith("pasivo")) assert.equal(tipo, "pasivo", `${c} en ${s.id}`);
      if (s.id === "patrimonio") assert.equal(tipo, "patrimonio", `${c} en ${s.id}`);
    }
  }
});

/* ═══════════════ EL PANEL DOCENTE ═══════════════ */

test("★ el profesor puede leer los ítems de las cuatro etapas", () => {
  const ids = [
    ...TRANSACCIONES.map((t) => `et1:${t.id}`),
    ...MOVIMIENTOS.map((m) => `et2:${m.id}:${m.lado}`),
    ...MAYOR.flatMap((c) => [`et3:saldo:${c.cuenta}:cifra`, `et3:saldo:${c.cuenta}:lado`]),
    ...CUENTAS.map((c) => `et4:esf:${c}`),
  ];
  assert.equal(ids.length, 9 + 22 + 22 + 11);
  for (const id of ids) {
    const e = etiquetaDeItem("ciclo-completo", id, 200);
    assert.ok(e, `sin etiqueta: ${id}`);
    assert.ok(!/^et[1-4]:/.test(e), `${id}: el profesor vería el id crudo`);
  }
  /* Las dos preguntas de una misma cuenta no se ven iguales. */
  const c = MAYOR[0].cuenta;
  assert.notEqual(etiquetaDeItem("ciclo-completo", `et3:saldo:${c}:cifra`), etiquetaDeItem("ciclo-completo", `et3:saldo:${c}:lado`));
});

test("un ítem con gramática desconocida no inventa etiqueta", () => {
  assert.equal(etiquetaDeItem("ciclo-completo", "et1:ene-99"), null);
  assert.equal(etiquetaDeItem("ciclo-completo", "et3:saldo:Caja:loquesea"), null);
  assert.equal(etiquetaDeItem("ciclo-completo", "et9:loquesea"), null);
});

test("pctDeItems no revienta con cero ítems", () => {
  assert.equal(pctDeItems(0, 0), 0);
  assert.equal(pctDeItems(5, 10), 50);
  assert.equal(pctDeItems(9, 9), 100);
});
