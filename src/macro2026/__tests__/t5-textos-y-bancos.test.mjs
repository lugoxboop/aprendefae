/*
 * Macro 2026 · T5 Política cambiaria: los textos (longitud y conteo contra
 * §4 de la especificación), las cifras de los casos (banano, ahorro,
 * crédito, rondas del ITCR), el modelo de divisas, los tonos del peso y el
 * dólar, los bancos, los subtemas y que lo publicado sea exactamente
 * PUBLICADAS_T5.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import * as T from "../politica-cambiaria/textos.js";
import { PIEZAS_T5, PUBLICADAS_T5, HACER_T5, estaPublicadaT5 } from "../politica-cambiaria/catalogo.js";
import { MONEDAS, PESO, DOLAR } from "../comun/monedas.js";
import { CORAL, FONDO, TINTA_SOBRE_COLOR, contraste } from "../comun/colores-da.js";
import { SUBJECTS } from "../../data/subjects.js";

/* Palabra = token con al menos una letra o cifra: «%», «−», «+», «≈» y «=» sueltos no cuentan. */
const palabras = (t) => t.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
/*
 * Varias pantallas no coinciden con el conteo de §4 (construccion-t5.md,
 * decisión 1): difieren en una palabra. Los textos quedan tal cual
 * los escribió Gen en §2; lo que obliga es el ≤ 20, y todas lo cumplen. Aquí
 * va el conteo real, por espacios.
 */
const CONTEO_REAL = {
  "pc26-a1-balanza": { 1: 11, 3: 14 },
  "pc26-a2-subasta": { 1: 15, 2: 12, 3: 13 },
  "pc26-a3-nominal-real": { 1: 12, 2: 12, 3: 11, 4: 10 },
  "pc26-a4-banano": { 1: 15, 5: 14 },
  "pc26-a5-tuberias": { 0: 14, 4: 13 },
  "pc26-a6-imanes": { 1: 8, 3: 14 },
  "pc26-a7-correa": { 3: 14, 7: 15 },
};

test("Aprender T5: cada pantalla ≤ 20 palabras, con el número de pantallas de §4 y su conteo real", () => {
  for (const [id, textos] of Object.entries(T.APRENDER)) {
    assert.equal(textos.length, T.CONTEO_APRENDER[id].length, id);
    textos.forEach((t, k) => {
      assert.ok(palabras(t) <= 20, `${id} P${k + 1}`);
      assert.equal(palabras(t), CONTEO_REAL[id]?.[k] ?? T.CONTEO_APRENDER[id][k], `${id} P${k + 1}: «${t}»`);
      assert.ok(Math.abs(palabras(t) - T.CONTEO_APRENDER[id][k]) <= 1, `${id} P${k + 1}`);
    });
  }
  assert.deepEqual(Object.keys(T.APRENDER).sort(), PIEZAS_T5.filter((p) => p.tipo === "aprender").map((p) => p.id).sort());
});

test("consignas ≤ 12 palabras: las 6 Hacer y cada una de las 6 decisiones de H5", () => {
  assert.deepEqual(Object.keys(T.CONSIGNAS).sort(), HACER_T5.map((p) => p.id).sort());
  for (const [id, c] of Object.entries(T.CONSIGNAS)) assert.ok(palabras(c) <= 12, `${id}: ${palabras(c)}`);
  const decisiones = T.CASOS_H5.flatMap((c) => c.decisiones);
  assert.equal(decisiones.length, 6);
  for (const d of decisiones) assert.ok(palabras(d.consigna) <= 12, `${d.id}: ${palabras(d.consigna)}`);
  assert.equal(T.CONSIGNAS["pc26-h5-donde-ahorro"], decisiones[0].consigna, "H5 arranca con la consigna de su primera decisión");
});

test("peso y dólar: dos tonos fijos, nunca coral, legibles sobre el fondo y con la tinta de las fichas", () => {
  assert.deepEqual([PESO, DOLAR], [MONEDAS.peso.tono, MONEDAS.dolar.tono]);
  assert.notEqual(PESO, DOLAR);
  for (const m of Object.values(MONEDAS)) {
    assert.notEqual(m.tono.toLowerCase(), CORAL.toLowerCase(), m.id);
    assert.ok(m.simbolo, `${m.id}: siempre con su símbolo además del color`);
    assert.ok(contraste(m.tono, FONDO) >= 3, `${m.id} sobre el fondo: ${contraste(m.tono, FONDO).toFixed(2)}`);
    assert.ok(contraste(m.tono, TINTA_SOBRE_COLOR) >= 4.5, `${m.id} con tinta: ${contraste(m.tono, TINTA_SOBRE_COLOR).toFixed(2)}`);
  }
});

test("A1: las noticias empujan dentro del rango y las metas de P3 y P4 son alcanzables", () => {
  const A = T.A1;
  assert.equal(A.noticias.length, 4);
  for (const n of A.noticias) {
    const tc = A.base + n.empuje * A.paso;
    assert.ok(tc >= A.min && tc <= A.max, n.id);
  }
  assert.ok(A.deprecia > A.base && A.deprecia <= A.max && (A.deprecia - A.min) % A.paso === 0);
  assert.ok(A.aprecia < A.base && A.aprecia >= A.min && (A.aprecia - A.min) % A.paso === 0);
});

test("H1: el banco de 6 y sus respuestas siguen la regla «tc sube ⇒ el peso se deprecia»", () => {
  assert.equal(T.BANCO_H1.length, 6);
  assert.ok(T.PARTIDA_H1 < T.BANCO_H1.length);
  const fmt = (x) => x.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  for (const q of T.BANCO_H1) {
    assert.notEqual(q.a, q.b, q.id);
    assert.notEqual(q.correctas.peso, q.correctas.dolar, `${q.id}: dos caras`);
    assert.equal(q.correctas.peso, q.b > q.a ? "deprecia" : "aprecia", q.id);
    for (const m of ["peso", "dolar"]) assert.ok(T.retroH1(q, m, fmt), `${q.id}/${m}`);
  }
  assert.match(T.retroH1(T.BANCO_H1[0], "peso", fmt), /De 4\.000 a 4\.500: das 500 pesos más por dólar/);
  assert.equal(T.retroH1(T.BANCO_H1[1], "peso", fmt), "De 4.000 a 3.800: das 200 pesos menos. El peso vale más.");
});

test("divisas: el modelo da $4.000 en el centro y el dólar baja con más oferta y sube con más demanda", () => {
  assert.deepEqual(T.equilibrioDivisas(), { Q: 50, tc: 4000 });
  assert.ok(T.equilibrioDivisas(T.MODELO_DIVISAS.corre, 0).tc < 4000);
  assert.ok(T.equilibrioDivisas(0, T.MODELO_DIVISAS.corre).tc > 4000);
  assert.ok(T.equilibrioDivisas(-T.MODELO_DIVISAS.corre, 0).tc > 4000);
  assert.ok(T.equilibrioDivisas(0, -T.MODELO_DIVISAS.corre).tc < 4000);
});

test("H2: 8 sucesos, cada uno con curva, dirección, las dos retros y una causa con rótulo o mascota", () => {
  assert.equal(T.BANCO_H2.length, 8);
  assert.ok(T.PARTIDA_H2 < T.BANCO_H2.length);
  for (const s of T.BANCO_H2) {
    assert.ok(["oferta", "demanda"].includes(s.curva) && ["derecha", "izquierda"].includes(s.direccion), s.id);
    assert.ok(s.retroCurva && s.retroDireccion, s.id);
    assert.ok(s.causa.mascota || (s.causa.objeto && s.causa.nombre), s.id);
    assert.notEqual(s.causa.pose, "tableta", `${s.id}: la tableta regala la dirección`);
    const lado = s.direccion === "derecha" ? 1 : -1;
    const eq = s.curva === "oferta" ? T.equilibrioDivisas(lado * 15, 0) : T.equilibrioDivisas(0, lado * 15);
    assert.equal(s.tc, eq.tc > 4000 ? "sube" : "baja", `${s.id}: el tc que dice el modelo`);
  }
  assert.ok(T.BANCO_H2.some((s) => s.curva === "oferta" && s.direccion === "izquierda"));
  assert.ok(T.BANCO_H2.some((s) => s.curva === "demanda" && s.direccion === "izquierda"));
});

test("A3: atajo e ITCR; la zona de la aguja con el margen de ±0,25", () => {
  assert.equal(T.deltaTcr(T.A3.inicial), 1);
  assert.equal(T.zonaDe(1), "devaluacion");
  assert.equal(T.zonaDe(-1), "revaluacion");
  assert.equal(T.zonaDe(0.25), "equilibrio");
  assert.equal(T.zonaDe(-0.25), "equilibrio");
  assert.equal(Math.round(T.itcr({ afuera: 0, aqui: 0, nominal: 0 }) * 1000) / 1000, 1);
});

test("A4 banano (d. 12): las cifras de Gen salen de la cuenta", () => {
  const B = T.BANANO;
  assert.equal(Math.round(B.costo / B.tc), B.usd);
  const costoNuevo = B.costo * (1 + B.inflAqui / 100);
  const r1 = (x) => Math.round(x * 10) / 10;
  assert.equal(r1(costoNuevo / (B.tc * (1 + B.subeBajo / 100))), B.necesarioBajo);
  assert.equal(Math.round(B.usd * (1 + B.inflAlla / 100) * 100) / 100, B.mercado);
  assert.equal(r1(costoNuevo / (B.tc * (1 + B.subeAlto / 100))), B.necesarioAlto);
  assert.ok(B.necesarioBajo > B.mercado, "con 1,5 % no le compra");
  assert.ok(B.necesarioAlto < B.mercado, "con 5 % vuelve a vender");
  const r3 = (x) => Math.round(x * 1000) / 1000;
  assert.equal(r3(T.itcr({ afuera: B.inflAlla, aqui: B.inflAqui, nominal: B.subeBajo })), B.itcrBajo);
  assert.equal(r3(T.itcr({ afuera: B.inflAlla, aqui: B.inflAqui, nominal: B.subeAlto })), B.itcrAlto);
});

test("H3: 6 rondas; delta e ITCR recalculados, exportador acorde a la zona y diagnósticos distintos", () => {
  assert.equal(T.BANCO_H3.length, 6);
  assert.ok(T.PARTIDA_H3 < T.BANCO_H3.length);
  const ESPERADO = { r1: [2.5, "gana"], r2: [-1.5, "pierde"], r3: [-2, "pierde"], r4: [1.5, "gana"], r5: [4, "gana"], r6: [0, "igual"] };
  const DE_ZONA = { devaluacion: "gana", revaluacion: "pierde", equilibrio: "igual" };
  for (const r of T.BANCO_H3) {
    assert.deepEqual([r.delta, r.exportador], ESPERADO[r.id], r.id);
    assert.equal(r.exportador, DE_ZONA[T.zonaDe(r.delta)], r.id);
    assert.equal(r.itcr, Math.round(T.itcr(r) * 1000) / 1000, r.id);
    assert.equal(r.itcr > 1, r.delta > 0, `${r.id}: el ITCR y el atajo dicen lo mismo`);
    assert.equal(T.juzgarAguja(r, r.delta), "bien", r.id);
    assert.ok(r.delta >= -6 && r.delta <= 6, `${r.id}: cabe en el dial`);
  }
  const r1 = T.BANCO_H3[0];
  assert.equal(T.juzgarAguja(r1, r1.aqui - r1.afuera + r1.nominal), "signo");
  assert.equal(T.juzgarAguja(r1, r1.afuera - r1.aqui), "nominal");
  assert.equal(T.juzgarAguja(r1, 6), "otro");
  for (const k of ["gana", "pierde", "igual"]) assert.ok(T.H3.retroExportador[k]);
});

test("H4: 8 noticias, 4 para cada lado, cada una con su retro ≤ 12 palabras", () => {
  assert.equal(T.BANCO_H4.length, 8);
  assert.ok(T.PARTIDA_H4 < T.BANCO_H4.length);
  assert.equal(T.BANCO_H4.filter((n) => n.gana === "exportadora").length, 4);
  for (const n of T.BANCO_H4) assert.ok(n.retro && palabras(n.retro) <= 12, n.id);
});

test("A6 y H5 (d. 22): ahorro y crédito; cada respuesta correcta es la que conviene en pesos", () => {
  const r1 = (x) => Math.round(x * 10) / 10;
  assert.equal(T.aqui(T.AHORRO), 654);
  assert.equal(r1(T.afuera(T.AHORRO)), 624);
  assert.equal(r1(T.afuera(T.AHORRO, T.AHORRO.devalua)), 698.9, "el $698,9 millones de A6 P6");
  assert.equal(T.aqui(T.CREDITO), 1150);
  assert.equal(r1(T.afuera(T.CREDITO)), 1080);
  /* La regla de A6 P7: 4 % + 12 % ≈ 16,5 %. */
  assert.equal(r1((T.afuera(T.AHORRO, 12) / T.AHORRO.monto - 1) * 100), 16.5);
  /* El ≈ 21 % de la retro de d6. */
  assert.equal(Math.round((T.afuera(T.CREDITO, 12) / T.CREDITO.monto - 1) * 100), 21);
  const DATOS = { ahorro: T.AHORRO, credito: T.CREDITO };
  for (const c of T.CASOS_H5) {
    assert.equal(c.decisiones.length, 3, c.id);
    assert.ok(c.cierre, c.id);
    for (const d of c.decisiones) {
      const vAqui = T.aqui(DATOS[d.caso]), vAfuera = T.afuera(DATOS[d.caso], d.dtc);
      /* Al ahorrar conviene el mayor; al prestarse, el menor. */
      const mejor = d.caso === "ahorro" ? (vAqui > vAfuera ? "aqui" : "afuera") : (vAqui < vAfuera ? "aqui" : "afuera");
      assert.equal(d.correcta, mejor, d.id);
      assert.ok(d.retro && palabras(d.retro) <= 14, d.id);
      assert.ok(Math.max(vAqui, vAfuera) <= (d.caso === "ahorro" ? 720 : 1260), `${d.id}: cabe en la barra`);
    }
  }
});

test("H6: 8 hechos, dos por régimen, y una retro para cada par (verdadero → elegido)", () => {
  assert.equal(T.BANCO_H6.length, 8);
  assert.ok(T.PARTIDA_H6 < T.BANCO_H6.length);
  const ids = T.REGIMENES.map((r) => r.id);
  for (const r of ids) {
    assert.equal(T.BANCO_H6.filter((h) => h.regimen === r).length, 2, r);
    for (const o of ids) if (o !== r) assert.ok(T.RETRO_H6[r][o] && palabras(T.RETRO_H6[r][o]) <= 12, `${r} → ${o}`);
  }
});

test("subtemas: cada pieza de T5 declara subtemas del tema; 13 piezas, 6 Hacer", () => {
  for (const p of PIEZAS_T5) {
    assert.ok(p.subtemas.length > 0, p.id);
    for (const s of p.subtemas) assert.ok(T.SUBTEMAS[s], `${p.id}: ${s}`);
  }
  const bancos = [...T.BANCO_H1, ...T.BANCO_H2, ...T.BANCO_H3, ...T.BANCO_H4, ...T.CASOS_H5.flatMap((c) => c.decisiones), ...T.BANCO_H6];
  for (const b of bancos) for (const s of b.subtemas) assert.ok(T.SUBTEMAS[s], `${b.id}: ${s}`);
  assert.equal(PIEZAS_T5.length, 13);
  assert.equal(HACER_T5.length, 6);
  assert.ok(PIEZAS_T5.every((p) => p.id.startsWith("pc26-")));
  assert.ok(HACER_T5.every((p) => !p.clasificacion.etapas), "ninguna va por etapas");
});

test("publicación T5: subjects.js y supabase/migrations llevan exactamente lo anotado en PUBLICADAS_T5", () => {
  const ids = new Set(PIEZAS_T5.map((p) => p.id));
  for (const id of PUBLICADAS_T5) assert.ok(ids.has(id), id);
  const declaradas = [];
  for (const m of Object.values(SUBJECTS)) for (const t of m.topics ?? []) for (const a of t.actividades ?? []) if (ids.has(a.id)) declaradas.push(a.id);
  assert.deepEqual([...declaradas].sort(), [...PUBLICADAS_T5].sort());
  assert.deepEqual(declaradas, [...PIEZAS_T5.filter((p) => p.tipo === "aprender"), ...HACER_T5].map((p) => p.id), "7 Aprender y luego 6 Hacer");
  for (const f of readdirSync("supabase/migrations")) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const id of ids) {
      if (!sql.includes(id)) continue;
      assert.ok(estaPublicadaT5(id), `${f} registra ${id} sin estar publicada`);
    }
  }
  assert.ok(PIEZAS_T5.filter((p) => p.tipo === "aprender").every((p) => !p.clasificacion), "las Aprender no tienen FP");
  const sql = readFileSync("supabase/tests/etapas_test.sql", "utf8");
  assert.ok(!sql.includes("pc26-"), "ninguna va por etapas: etapas_test no las excluye");
});
