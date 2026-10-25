import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { faltasDePieza, palabras, MAX_PALABRAS_PANTALLA } from "../../components/secuencia/secuencia.js";
import { PIEZAS_SECUENCIA_T3 } from "../../components/mecanicas/libros/tema3/secuencia/index.js";
import * as P2 from "../../components/mecanicas/libros/tema3/secuencia/p2.jsx";
import * as P6 from "../../components/mecanicas/libros/tema3/secuencia/p6.jsx";
import * as T from "../../data/t3SecuenciasTextosP2P6.js";
import { CUENTAS_DEL_PERIODO, CUENTAS_QUE_SIGUEN } from "../../data/contabilidadTema3Cierre.js";
import { ENCENDIDA } from "../../data/banderasT3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P2 «El mes de San Calixto» y P6 «Lo que deja el periodo» en
 * SecuenciaAprender (paquete #578, e3-t3-p2-p6-secuencia-v1.md).
 *
 * La segunda fuente son los titulares del paquete, copiados aquí a mano (§0):
 * si alguien cambia uno en el archivo de datos, esto lo ve.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TITULARES_P2 = [
  "Un enero completo de San Calixto", "Cuatro servicios vendidos, ¿cuáles se cobraron?", "El ingreso crece por el haber",
  "Un servicio cobrado, en un asiento", "Cuatro gastos pagados en efectivo", "La utilidad de enero, hasta aquí",
  "La caja no es la utilidad", "Lo que cambia la utilidad, y lo que no",
];
const TITULARES_P6 = [
  "¿Todo lo que ganó es de los accionistas?", "Lo de lavar ropa y lo que no", "La utilidad antes del impuesto",
  "El impuesto: 33 % en este ejercicio", "Esto se llama estado de resultados", "Ganancias y pérdidas se reparte",
  "El impuesto queda por pagar", "Cada cuenta a su estado", "Cuando el mes deja pérdida", "El estado de resultados, de arriba abajo",
];

const pieza = (id) => PIEZAS_SECUENCIA_T3.find((p) => p.id === id);
const pantalla = (pz, id) => pz.pantallas.find((s) => s.id === id);
const pintar = (pz, id, estado, paso = 0) => {
  const s = pantalla(pz, id);
  return renderToStaticMarkup(createElement(s.Figura, { estado: estado ?? s.estadoInicial ?? null, setEstado: () => {}, paso, primeraVez: false, reducido: true }));
};
const entre = (html, desde, hasta) => html.slice(html.indexOf(desde), hasta ? html.indexOf(hasta) : undefined);
const textoDe = (zona) => zona.filter((z) => z.texto).map((z) => z.texto).join(" ");
const cifra = (t, re) => Number(t.match(re)[1].replace(/\./g, ""));

test("★ P2 y P6 son piezas nuevas: P2 detrás de P1, P6 al final; las publicadas no se mueven", () => {
  assert.deepEqual(PIEZAS_SECUENCIA_T3.map((p) => p.id), [
    "t3-a1-vender-no-es-cobrar", "t3-a2-el-mes-de-san-calixto", "t3-a3-lo-que-ya-paso",
    "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo", "t3-a6-lo-que-deja-el-periodo",
  ]);
  assert.equal(ENCENDIDA, false, "la bandera sigue apagada");
});

test("★ 8 y 10 pantallas, con los titulares del paquete (P2-8 de la v4, P6-10 de la v3) y la forma completa", () => {
  const p2 = pieza(T.PIEZA_P2.id);
  const p6 = pieza(T.PIEZA_P6.id);
  assert.deepEqual(p2.pantallas.map((s) => s.titular), TITULARES_P2);
  assert.deepEqual(p6.pantallas.map((s) => s.titular), TITULARES_P6);
  assert.deepEqual(faltasDePieza(p2), []);
  assert.deepEqual(faltasDePieza(p6), []);
  for (const t of [...TITULARES_P2, ...TITULARES_P6]) assert.ok(t.length <= 54 && palabras(t) <= 10, t);
});

test("★ P2: la lectura y las barras salen de los hechos publicados de enero", () => {
  assert.equal(P2.INGRESOS, CUENTAS_DEL_PERIODO.find((c) => c.cuenta === "Ingresos por servicios").saldo);
  assert.equal(P2.CAJA_FIN, CUENTAS_QUE_SIGUEN.find((c) => c.cuenta === "Caja").saldo);
  assert.equal(P2.POR_COBRAR, CUENTAS_QUE_SIGUEN.find((c) => c.cuenta === "Cuentas por cobrar – clientes").saldo);
  /* Lo que dicen los textos aprobados, sacado del texto y no copiado. */
  assert.equal(P2.CAJA_INICIAL, cifra(T.TEXTOS_P2.apertura, /\$([\d.]+) en caja/));
  assert.equal(P2.GASTOS, cifra(T.TEXTOS_P2.utilidad, /Gastos: \$([\d.]+)/));
  assert.equal(P2.UTILIDAD_ENERO, cifra(T.TEXTOS_P2.separan, /utilidad fue \$([\d.]+)/));
  assert.equal(P2.CAJA_FIN, cifra(T.TEXTOS_P2.separan, /cerró en \$([\d.]+)/));
  assert.equal(P2.COBRADO, cifra(T.ACIERTOS_P2.cobrados, /cobró \$([\d.]+)/));
  /* La lectura de cada etapa. */
  const de = (etapa, o) => P2.lecturaP2(etapa, o).map(([, m, t]) => (t ? "tapada" : m));
  assert.deepEqual(de("apertura"), [15000, 0]);
  assert.deepEqual(de("cobrados", { cobradoHasta: 0 }), [15000, 14800]);
  assert.deepEqual(de("cobrados", { cobradoHasta: 5000 }), [20000, 14800]);
  assert.deepEqual(de("anotados"), [23000, 14800]);
  assert.deepEqual(de("gastos", { gastosPagados: false, utilidadTapada: true }), [23000, "tapada"]);
  assert.deepEqual(de("final"), [14650, 6450]);
});

test("★ P6: el estado de resultados sale de los hechos y da lo que Miyata verificó en la p. 135", () => {
  assert.equal(P6.UTILIDAD_OP, cifra(T.TEXTOS_P6.antes, /deja \$([\d.]+)/));
  assert.equal(P6.ANTES, cifra(T.ACIERTOS_P6.antes, /impuestos es \$([\d.]+)/));
  assert.equal(P6.IMPUESTO, cifra(T.ACIERTOS_P6.impuesto, /es \$([\d.]+)\./));
  assert.equal(P6.EJERCICIO, cifra(T.ACIERTOS_P6.impuesto, /queda, \$([\d.]+)/));
  assert.equal(P6.GASTOS_NO_OP, cifra(T.ERRORES_P6_3[6020000], /interés: \$([\d.]+)/));
  assert.equal(P6.IMPUESTO + P6.EJERCICIO, P6.ANTES);
});

test("★ el monto del asiento se ve antes de responder (P2-4 y P6-6, condición 4 de #572)", () => {
  const a = pintar(pieza(T.PIEZA_P2.id), "asiento");
  assert.match(a, /data-monto-dado="true">\$3\.000</);
  const r = pintar(pieza(T.PIEZA_P6.id), "reparte");
  assert.match(r, /data-monto-dado="true">\$1\.958\.550</);
  assert.match(r, /Ganancias y pérdidas/);
});

test("★ la pastilla nunca está en el modelo: va en la zona del apoyo (condición 5 de #572)", () => {
  const p2 = pieza(T.PIEZA_P2.id);
  const p6 = pieza(T.PIEZA_P6.id);
  const casos = [
    [p2, "cobrados", P2.tocarFicha(P2.COBRADOS_INICIAL, "jcc")],
    [p2, "asiento", pantalla(p2, "asiento").medir.find((m) => m.nombre === "al-reves-pista").estado],
    [p2, "gastos", pantalla(p2, "gastos").medir.find((m) => m.nombre === "pista-gasto").estado],
    [p2, "utilidad", pantalla(p2, "utilidad").medir.find((m) => m.nombre === "acierto").estado],
    [p6, "separar", pantalla(p6, "separar").medir.find((m) => m.nombre === "pista").estado],
    [p6, "reparte", pantalla(p6, "reparte").medir.find((m) => m.nombre === "pista").estado],
    [p6, "a-su-estado", pantalla(p6, "a-su-estado").medir.find((m) => m.nombre === "pista").estado],
  ];
  for (const [pz, id, estado] of casos) {
    const html = pintar(pz, id, estado);
    const modelo = entre(html, "data-modelo", "data-control");
    const zona = entre(html, "data-zona");
    assert.doesNotMatch(modelo, /data-pastilla/, `${id}: pastilla en el modelo`);
    assert.match(zona, /data-pastilla/, `${id}: la pastilla no está`);
  }
});

test("★ manda la pista: reemplaza al apoyo, y la razón se oculta mientras se ve (sin tocar SecuenciaAprender)", () => {
  const html = pintar(pieza(T.PIEZA_P2.id), "cobrados", P2.tocarFicha(P2.COBRADOS_INICIAL, "jcc"));
  assert.match(html, /data-texto="pista"/);
  assert.ok(html.includes(T.PISTAS_P2.cobrados));
  assert.ok(!html.includes(T.TEXTOS_P2.cobrados), "la pista reemplaza al apoyo");
  assert.match(html, /\.t3-sec:has\(\.t3s2 \[data-texto=(&quot;|")pista(&quot;|")\]\) \[data-razon\] \{ visibility: hidden; \}/);
  /* En el intento siguiente se retira (D3). */
  const otra = pintar(pieza(T.PIEZA_P2.id), "cobrados", P2.tocarFicha(P2.tocarFicha(P2.COBRADOS_INICIAL, "jcc"), "dia-5"));
  assert.doesNotMatch(otra, /data-texto="pista"/);
});

test("★ E8 y D9: antes de responder no se ve ni se oye la respuesta", () => {
  const p2 = pieza(T.PIEZA_P2.id);
  const p6 = pieza(T.PIEZA_P6.id);
  for (const id of ["gastos", "utilidad"]) assert.ok(!pintar(p2, id).includes("6.450"), `P2 ${id} deja ver la utilidad`);
  assert.ok(!pintar(p6, "apertura").includes("5.935.000"));
  assert.ok(!pintar(p6, "apertura", null, 1).includes("5.935.000"));
  assert.ok(!pintar(p6, "antes").includes("5.935.000"));
  const imp = pintar(p6, "impuesto");
  assert.ok(!imp.includes("1.958.550") && !imp.includes("3.976.450"));
  for (const pz of [p2, p6]) for (const s of pz.pantallas) assert.doesNotMatch(s.nombreFigura, /\$|\d\.\d{3}/, `${s.id}: el nombre de la figura no lleva montos`);
  /* Tras responder, se destapa. */
  assert.ok(pintar(p2, "utilidad", pantalla(p2, "utilidad").medir.find((m) => m.nombre === "acierto").estado).includes("6.450"));
});

test("★ cifras en Inter tabular: ninguna fuente mono", () => {
  for (const pz of [pieza(T.PIEZA_P2.id), pieza(T.PIEZA_P6.id)]) {
    for (const s of pz.pantallas) {
      const html = pintar(pz, s.id);
      assert.doesNotMatch(html, /monospace|mono\b/i, s.id);
    }
  }
});

test("★ D1: cada estado medido lleva 60 palabras o menos; las pistas, 20 palabras y 99 caracteres", () => {
  for (const pz of [pieza(T.PIEZA_P2.id), pieza(T.PIEZA_P6.id)]) {
    for (const s of pz.pantallas) {
      for (const m of s.medir ?? []) {
        const n = palabras(s.titular) + palabras(textoDe(s.zonaDe?.(m.estado ?? s.estadoInicial ?? null, m.paso ?? 0) ?? []));
        assert.ok(n <= MAX_PALABRAS_PANTALLA, `${s.id} · ${m.nombre}: ${n}`);
      }
    }
  }
  for (const p of [...Object.values(T.PISTAS_P2), ...Object.values(T.PISTAS_P6)].filter(Boolean)) assert.ok(palabras(p) <= 20 && p.length <= 99, p);
});

test("★ D11: cada Haz lleva la razón de su tipo de decisión; P2-2 la suya; ubicar, la del lote 16", () => {
  const p2 = pieza(T.PIEZA_P2.id);
  const p6 = pieza(T.PIEZA_P6.id);
  assert.equal(pantalla(p2, "cobrados").razon, "Falta tocar un servicio que se cobró el mismo día.");
  assert.equal(pantalla(p2, "asiento").razon, T.RAZON_P2P6.asiento);
  assert.equal(pantalla(p6, "reparte").razon, T.RAZON_P2P6.asiento);
  assert.equal(pantalla(p6, "separar").razon, "Cuando ubiques todas las fichas, se abre «Siguiente».");
  assert.equal(pantalla(p6, "a-su-estado").razon, T.RAZON_P2P6.ubicar);
  for (const id of ["antes", "impuesto"]) assert.equal(pantalla(p6, id).razon, T.RAZON_P2P6.cifra);
});

test("⛔ lo que espera queda armado, sin inventar: P2-7, P6-7, P6-9 y la pista de P6-4", () => {
  const pend = [pieza(T.PIEZA_P2.id), pieza(T.PIEZA_P6.id)].flatMap((p) => p.pantallas.filter((s) => s.pendiente).map((s) => `${p.id}/${s.id}`));
  assert.deepEqual(pend, [
    "t3-a2-el-mes-de-san-calixto/separan", "t3-a6-lo-que-deja-el-periodo/impuesto",
    "t3-a6-lo-que-deja-el-periodo/por-pagar", "t3-a6-lo-que-deja-el-periodo/acacias",
  ]);
  assert.equal(T.PISTAS_P6.impuesto, null);
  for (const id of ["separan"]) assert.equal(pantalla(pieza(T.PIEZA_P2.id), id).resuelta(null), false);
  for (const id of ["por-pagar", "acacias"]) assert.equal(pantalla(pieza(T.PIEZA_P6.id), id).resuelta(null), false);
  assert.equal(T.PENDIENTES_P2P6.length, 4);
});

test("★ P2-2: cada toque se califica; dos errores dejan los dos cobrados marcados", () => {
  let e = P2.tocarFicha(P2.COBRADOS_INICIAL, "dia-5");
  assert.equal(e.ok, false);
  e = P2.tocarFicha(e, "lcdv");
  assert.equal(e.ok, true);
  const mal = P2.tocarFicha(P2.tocarFicha(P2.COBRADOS_INICIAL, "jcc"), "mps");
  assert.deepEqual(mal.marcadas, ["dia-5", "lcdv"]);
  assert.equal(mal.intentos, 2);
});

test("★ P6-2, P6-6 y P6-8: un paso por cuenta, con su error al segundo intento", () => {
  const bien = T.GASTOS_P6_2.map((g) => g.respuesta);
  const fin = bien.reduce((e, x) => P6.separar6(e, x), P6.SEPARAR6_INICIAL);
  assert.equal(fin.k, 5);
  assert.equal(textoDe(P6.zonaSeparar6(fin)), T.ACIERTOS_P6.separar);
  const r = ["Impuesto de renta", "Utilidad del ejercicio"].reduce((e, c) => P6.ponerHaber(e, c), P6.REPARTE_INICIAL);
  assert.equal(P6.reparteResuelto(r), true);
  const porPagar = ["Caja", "Impuesto de renta por pagar"].reduce((e, c) => P6.ponerHaber(e, c), P6.REPARTE_INICIAL);
  assert.equal(textoDe(P6.zonaReparte(porPagar)).includes(T.CUENTAS_P6_6[2].error), true);
  const ll = [T.PATRIMONIO, T.PASIVO].reduce((e, z) => P6.llevar(e, z), P6.LLEVAR_INICIAL);
  assert.equal(P6.llevarResuelto(ll), true);
});
