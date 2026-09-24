import { test } from "node:test";
import assert from "node:assert/strict";

import { cuentaDelItem, retroDe as retroSaldo } from "../../components/mecanicas/libros/SaldoDeLaCuenta.jsx";
import { retroDe as retroClase, NUMEROS } from "../../components/mecanicas/libros/SimpleOCompuesto.jsx";
import { leerCifra } from "../../components/mecanicas/libros/piezas.jsx";
import { SALDO_DE_LA_CUENTA, SIMPLE_O_COMPUESTO } from "../../data/contabilidadActividades.js";
import { DEBE, HABER, saldoDe, pesos } from "../../data/contabilidad.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-5 Y CU-7: LAS DOS MECÁNICAS DE DOS PREGUNTAS.
 *
 * Lo que vigilan estas pruebas, por encima de todo, es que NINGÚN CAMINO DE
 * RESPUESTA SE QUEDE MUDO. Las dos actividades tienen más combinaciones de las
 * que se pueden probar jugando —cada cuenta admite cualquier cifra y cualquier
 * lado— así que se enumeran las clases de respuesta, que sí son contables.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const sinHuecos = (texto, donde) => {
  assert.ok(typeof texto === "string" && texto.length > 10, `${donde}: sin texto`);
  assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${donde}: quedó un hueco sin rellenar — ${texto}`);
  assert.ok(texto.startsWith("✅") || texto.startsWith("❌"), `${donde}: no se ve ni como acierto ni como error`);
};

/* ─────────────────────────── CU-5 ─────────────────────────── */

test("CU-5: las diez cuentas se derivan de su mayor, no se copian", () => {
  for (const item of SALDO_DE_LA_CUENTA.items) {
    const c = cuentaDelItem(item);
    assert.equal(c.cuenta, item.cuenta, item.id);
    assert.ok((c.debitos.length + c.creditos.length) > 0, `${item.id}: cuenta sin movimientos`);
  }
});

test("CU-5 ★ las cuatro clases de respuesta tienen texto, en las diez cuentas", () => {
  /*
   * Por cada cuenta: cifra bien o mal, y lado bien o mal. Cuatro combinaciones
   * por diez cuentas = 40 caminos, y ninguno puede dejar la pantalla en
   * blanco. Además la cifra equivocada se prueba en sus tres formas: la suma
   * de los dos movimientos, un negativo, y un número cualquiera.
   */
  let caminos = 0;
  for (const item of SALDO_DE_LA_CUENTA.items) {
    const cuenta = cuentaDelItem(item);
    const s = saldoDe(cuenta);
    const cifras = [s.saldo, s.debito + s.credito, -s.saldo, s.saldo + 7];
    const lados = [DEBE, HABER];
    for (const cifra of cifras) {
      for (const lado of lados) {
        const r = retroSaldo(item, cuenta, cifra, lado);
        sinHuecos(r.saldo, `${item.id} cifra ${cifra}`);
        sinHuecos(r.lado, `${item.id} lado ${lado}`);
        assert.equal(r.cifraOk, cifra === s.saldo, `${item.id}: cifraOk`);
        assert.equal(r.ladoOk, lado === s.lado, `${item.id}: ladoOk`);
        caminos += 1;
      }
    }
  }
  assert.equal(caminos, 80, "10 cuentas × 4 cifras × 2 lados");
});

test("CU-5 ★ sumar los dos movimientos recibe SU explicación, no una genérica", () => {
  /*
   * Es el error que la ficha nombra primero y el que de verdad separa a quien
   * entendió de quien no: el saldo es una resta.
   */
  const item = SALDO_DE_LA_CUENTA.items.find((i) => i.id === "cu5-01");
  const cuenta = cuentaDelItem(item);
  const s = saldoDe(cuenta);
  assert.notEqual(s.debito + s.credito, s.saldo, "la suma y la resta tienen que diferir para que esto pruebe algo");
  const r = retroSaldo(item, cuenta, s.debito + s.credito, s.lado);
  assert.equal(r.saldo, SALDO_DE_LA_CUENTA.errores.sumo);
});

test("CU-5: acertar la cifra y fallar el lado no se explica igual que fallar las dos", () => {
  const item = SALDO_DE_LA_CUENTA.items.find((i) => i.id === "cu5-03");
  const cuenta = cuentaDelItem(item);
  const s = saldoDe(cuenta);
  const otroLado = s.lado === DEBE ? HABER : DEBE;
  const cifraBien = retroSaldo(item, cuenta, s.saldo, otroLado);
  const cifraMal = retroSaldo(item, cuenta, s.saldo + 100, otroLado);
  assert.match(cifraBien.lado, /La cifra está bien/);
  assert.notEqual(cifraMal.lado, cifraBien.lado, "las dos situaciones comparten explicación");
});

test("CU-5: el acierto dice la resta con las cifras de ESA cuenta", () => {
  const item = SALDO_DE_LA_CUENTA.items.find((i) => i.id === "cu5-04");
  const cuenta = cuentaDelItem(item);
  const s = saldoDe(cuenta);
  const r = retroSaldo(item, cuenta, s.saldo, s.lado);
  assert.ok(r.saldo.includes(pesos(s.debito)), "no dice el movimiento débito de esta cuenta");
  assert.ok(r.saldo.includes(pesos(s.credito)), "no dice el movimiento crédito de esta cuenta");
  assert.ok(r.lado.includes(s.lado === DEBE ? "Debe" : "Haber"));
});

test("CU-5: el campo de cifra perdona los puntos de miles y admite el signo menos", () => {
  assert.equal(leerCifra("1850"), 1850);
  assert.equal(leerCifra("1.850"), 1850, "escribir los miles con punto es escribir bien");
  assert.equal(leerCifra(" 1 850 "), 1850);
  /* El signo se acepta para que el error de restar al revés pueda ocurrir. */
  assert.equal(leerCifra("-350"), -350);
  /* Y lo que no es un número no es una respuesta. */
  for (const basura of ["", "   ", "-", "abc", "12a", "1,5,", "--3"]) {
    assert.equal(leerCifra(basura), null, JSON.stringify(basura));
  }
});

/* ─────────────────────────── CU-7 ─────────────────────────── */

test("CU-7: los números que se ofrecen son los que el banco usa", () => {
  assert.deepEqual(NUMEROS, [2, 3, 4]);
  for (const i of SIMPLE_O_COMPUESTO.items) {
    assert.ok(NUMEROS.includes(i.cuentas), `${i.id}: usa ${i.cuentas}, que no se ofrece`);
  }
});

test("CU-7 ★ las seis combinaciones de respuesta tienen texto, en los diez ítems", () => {
  let caminos = 0;
  for (const item of SIMPLE_O_COMPUESTO.items) {
    for (const clase of ["simple", "compuesto"]) {
      for (const n of NUMEROS) {
        const r = retroClase(item, clase, n);
        sinHuecos(r.texto, `${item.id} · ${clase} · ${n}`);
        assert.equal(r.claseOk, clase === item.categoria);
        assert.equal(r.cuentasOk, n === item.cuentas);
        caminos += 1;
      }
    }
  }
  assert.equal(caminos, 60, "10 ítems × 2 clases × 3 números");
});

test("CU-7 ★ la trampa de los tres socios recibe «Cuente cuentas, no gente»", () => {
  const trampa = SIMPLE_O_COMPUESTO.items.find((i) => /tres socios/.test(i.enunciado));
  const r = retroClase(trampa, "compuesto", 3);
  assert.equal(r.texto, SIMPLE_O_COMPUESTO.errores.compuestoPorPersonas);
  assert.match(r.texto, /Cuente cuentas, no gente/);
});

test("CU-7: acertar la clase y errar el número dice cuántas eran", () => {
  const item = SIMPLE_O_COMPUESTO.items.find((i) => i.id === "cu7-02");
  assert.equal(item.cuentas, 4);
  const r = retroClase(item, "compuesto", 3);
  assert.ok(r.claseOk && !r.cuentasOk);
  assert.equal(r.texto, "❌ Vuelva a contar: son 4. Liste primero todo lo que entra y después todo lo que sale o se debe.");
});

test("CU-7: solo se acierta del todo contestando bien las dos", () => {
  const item = SIMPLE_O_COMPUESTO.items.find((i) => i.id === "cu7-03");
  assert.equal(retroClase(item, item.categoria, item.cuentas).texto, item.acierto);
  assert.notEqual(retroClase(item, item.categoria, 2).texto, item.acierto);
});

/* ─────────── lo que ve el docente ─────────── */

test("★ un id a medias no se etiqueta como si fuera una de las dos preguntas", () => {
  /*
   * Las dos reglas parten el id por «:» y deciden por el segundo trozo. Si solo
   * comprueban que el ítem existe, un id con un segundo trozo desconocido —o
   * sin él— cae en la rama «else» y el profesor lee «De qué lado va» sobre una
   * pregunta que nunca se hizo. Un id que no se entiende tiene que devolver
   * null: la vista ya sabe enseñar el id crudo y contarlo.
   */
  assert.ok(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-01:saldo"));
  assert.ok(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-01:lado"));
  assert.equal(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-01"), null);
  assert.equal(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-01:otra-cosa"), null);
  assert.equal(etiquetaDeItem("cu-saldo-de-la-cuenta", "cu5-99:saldo"), null);

  assert.ok(etiquetaDeItem("cu-simple-o-compuesto", "cu7-01:clase"));
  assert.ok(etiquetaDeItem("cu-simple-o-compuesto", "cu7-01:cuentas"));
  assert.equal(etiquetaDeItem("cu-simple-o-compuesto", "cu7-01"), null);
  assert.equal(etiquetaDeItem("cu-simple-o-compuesto", "cu7-01:otra-cosa"), null);
});

test("★ el docente distingue las tres cuentas que se llaman «Caja»", () => {
  /*
   * Hay tres: la de Lavado de Autos, la de Caleja y la del ejemplo del
   * capítulo. Sin la empresa en la etiqueta, el profesor vería tres preguntas
   * distintas escritas exactamente igual y creería que está mirando una.
   */
  const cajas = SALDO_DE_LA_CUENTA.items.filter((i) => i.cuenta === "Caja");
  assert.equal(cajas.length, 3);
  const etiquetas = cajas.map((i) => etiquetaDeItem("cu-saldo-de-la-cuenta", `${i.id}:saldo`));
  assert.equal(new Set(etiquetas).size, 3, `se leen igual: ${etiquetas.join(" | ")}`);
});
