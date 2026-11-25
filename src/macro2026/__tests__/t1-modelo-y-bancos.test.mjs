/*
 * Macro 2026 · T1 Demanda agregada: el modelo numérico (A5, A6, H6), los
 * textos (longitud y fidelidad), los bancos (sorteo, orden aleatorio,
 * subtemas), la migración pendiente y que lo publicado sea exactamente PUBLICADAS_T1.
 * Las cifras se MIDEN aquí contra las de la especificación de Gen; no se
 * copian de su tabla (§2 H6: «medir en la prueba del modelo»).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  BASE, ETAPAS_H6, TOLERANCIA_H6, arranque, ecos, fmtDecimal, fmtEco, fmtEntero, fmtLimpio, gastoAutonomo,
  juzgarH6, modelo, multiplicador, pendiente, produccion, produccionH6, inversion,
} from "../comun/modelo-da.js";
import { COMPONENTES, CORAL, FONDO, contraste } from "../comun/colores-da.js";
import { barajar, conSemilla, sortear } from "../comun/azar.js";
import {
  APRENDER, BANCO_H1, BANCO_H3, BANCO_H4, BANCO_H5, CONSIGNAS, ETAPAS_H2, PARTIDA_H1, PARTIDA_H3, PARTIDA_H4,
  PARTIDA_H5, RETRO_A5_P5, RETRO_A6_P1, SUBTEMAS,
} from "../demanda-agregada/textos.js";
import { HACER_T1, PIEZAS_T1, PUBLICADAS_T1, estaPublicada } from "../demanda-agregada/catalogo.js";
import { filasDeCatalogo, revisar } from "../../../scripts/guardian-migraciones.mjs";
import { SUBJECTS } from "../../data/subjects.js";
import { VISTAS } from "../../ruta.js";

const cerca = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;

/* ─── El modelo común (§0) ─── */

test("modelo común: Ā = 590, Ā − b·i = 510, pendiente 0,6, multiplicador 2,5, Y₀ = 1.275", () => {
  const p = modelo();
  assert.equal(gastoAutonomo(p), 590);
  assert.equal(arranque(p), 510);
  assert.ok(cerca(pendiente(p), 0.6));
  assert.ok(cerca(multiplicador(p), 2.5));
  assert.ok(cerca(produccion(p), 1275));
  assert.equal(inversion(p), 120);
  assert.equal(fmtEntero(produccion(p)), "1.275");
  assert.equal(fmtDecimal(multiplicador(p), 1), "2,5");
  assert.equal(fmtLimpio(pendiente(p)), "0,6");
});

test("formato: punto de miles y coma decimal sin depender de Intl", () => {
  assert.equal(fmtEntero(1416.7), "1.417");
  assert.equal(fmtEntero(4000), "4.000");
  assert.equal(fmtEntero(510), "510");
  assert.equal(fmtDecimal(21.6, 1), "21,6");
  assert.equal(fmtLimpio(0.6375), "0,64");
});

/* ─── A6 · los ecos ─── */

test("A6: los ecos son 100, 60, 36, 21,6, 13,0, 7,8… y suman 250", () => {
  const e = ecos(modelo(), 100, 6);
  assert.deepEqual(e.map(fmtEco), ["100", "60", "36", "21,6", "13,0", "7,8"]);
  const suma = ecos(modelo(), 100, 200).reduce((s, v) => s + v, 0);
  assert.ok(cerca(suma, 250, 1e-6), `suma ${suma}`);
  assert.ok(cerca(100 * multiplicador(modelo()), 250));
  /* «Con c = 0,8 y t = 25 %, cada 100 de gasto se vuelven 250.» */
  assert.ok(cerca(100 / (1 - 0.8 * (1 - 0.25)), 250));
});

test("A6 P5: inclinación y multiplicador cambian juntos con números distintos", () => {
  for (const c of [0.5, 0.65, 0.8, 0.95]) {
    const p = modelo({ c });
    assert.notEqual(fmtLimpio(pendiente(p)), fmtDecimal(multiplicador(p), 1));
    assert.ok(multiplicador(p) > 1 / (1 - 0));
  }
  assert.ok(multiplicador(modelo({ c: 0.9 })) > multiplicador(modelo({ c: 0.8 })));
});

test("A6 P6: Y₀ = multiplicador × (Ā − b·i), y Ā se despliega en C̄ + c·TR + Ī + G + XN = 590", () => {
  const p = modelo();
  assert.equal(p.Cbar + p.c * p.TR + p.Ibar + p.G + p.XN, 590);
  assert.ok(cerca(multiplicador(p) * (gastoAutonomo(p) - p.b * p.i), 1275));
});

/* ─── H6 · las tres etapas, medidas ─── */

test("H6 E1: (590 + 50 − 80) × 2,5 = 1.400 con G = 250; ±10 dentro, ±30 fuera", () => {
  const e = ETAPAS_H6[0];
  assert.ok(cerca(produccionH6(e, 250), 1400));
  assert.equal(juzgarH6(e, 250).estado, "dentro");
  assert.equal(juzgarH6(e, 240).estado, "dentro");
  assert.equal(juzgarH6(e, 260).estado, "dentro");
  assert.equal(juzgarH6(e, 230).estado, "abajo");
  assert.equal(juzgarH6(e, 270).estado, "arriba");
  assert.equal(juzgarH6(e, e.inicio).estado, "abajo");
});

test("H6 E2: t = 20 % → 1.416,7 y t = 21 % → 1.385,9 (dentro); 19 % y 22 % fuera", () => {
  const e = ETAPAS_H6[1];
  assert.ok(cerca(produccionH6(e, 20), 510 / (1 - 0.64), 1e-9));
  assert.equal(fmtDecimal(produccionH6(e, 20), 1), "1.416,7");
  assert.equal(fmtDecimal(produccionH6(e, 21), 1), "1.385,9");
  assert.equal(juzgarH6(e, 20).estado, "dentro");
  assert.equal(juzgarH6(e, 21).estado, "dentro");
  assert.equal(juzgarH6(e, 19).estado, "arriba");
  assert.equal(juzgarH6(e, 22).estado, "abajo");
  assert.equal(juzgarH6(e, e.inicio).estado, "abajo");
  /* Solo dos valores del deslizador entran: «t = 20 % o 21 %». */
  const dentro = [];
  for (let t = e.min; t <= e.max; t += e.paso) if (juzgarH6(e, t).estado === "dentro") dentro.push(t);
  assert.deepEqual(dentro, [20, 21]);
});

test("H6 E3: i = 13 → 1.150; i = 12 → 1.175; i = 14 → 1.125; entre 12 y 14 dentro", () => {
  const e = ETAPAS_H6[2];
  assert.ok(cerca(produccionH6(e, 13), 1150));
  assert.ok(cerca(produccionH6(e, 12), 1175));
  assert.ok(cerca(produccionH6(e, 14), 1125));
  const dentro = [];
  for (let i = e.min; i <= e.max + 1e-9; i += e.paso) if (juzgarH6(e, i).estado === "dentro") dentro.push(i);
  assert.deepEqual(dentro, [12, 12.5, 13, 13.5, 14]);
  assert.equal(juzgarH6(e, e.inicio).estado, "arriba");
  assert.equal(juzgarH6(e, 15).estado, "abajo");
  /* «Cada punto de tasa quita 25 de producción.» */
  assert.ok(cerca(produccionH6(e, 9) - produccionH6(e, 10), 25));
});

test("H6: la solución de cada etapa está en su deslizador y dentro de ±25", () => {
  for (const e of ETAPAS_H6) {
    assert.ok(e.solucion >= e.min && e.solucion <= e.max, e.id);
    assert.ok(cerca(((e.solucion - e.min) / e.paso) % 1, 0), `${e.id}: la solución cae en un paso`);
    assert.ok(Math.abs(produccionH6(e, e.solucion) - e.meta) <= TOLERANCIA_H6, e.id);
    assert.ok(palabras(e.contexto) <= 12, `${e.id} contexto`);
    for (const t of [e.arriba, e.abajo, e.pista]) assert.ok(palabras(t) <= 15, t);
  }
  /* «Faltan 125 de producción. Divide entre 2,5.» */
  assert.ok(cerca(1400 - produccion(modelo()), 125));
});

/* ─── H3: cada suceso mueve la recta como dice su respuesta ─── */

test("H3: el cambio de cada suceso desplaza o gira en el sentido de la respuesta", () => {
  const a0 = arranque(modelo()), s0 = pendiente(modelo());
  for (const s of BANCO_H3) {
    const p = modelo(s.cambio);
    if (s.tipo === "desplaza") {
      assert.ok(cerca(pendiente(p), s0), `${s.id} no debe girar`);
      assert.equal(Math.sign(arranque(p) - a0), s.sentido, s.id);
    } else {
      /* c también está en el arranque (c·TR): un cambio de c lo mueve, pero menos de 10 de 2.500. */
      assert.ok(Math.abs(arranque(p) - a0) < 10, `${s.id} casi no debe desplazar`);
      assert.equal(Math.sign(pendiente(p) - s0), s.sentido, s.id);
    }
  }
});

/* ─── Textos: longitud, y el conteo del diseño (§4) ─── */

test("Aprender: ≤ 20 palabras por pantalla, y el conteo coincide con el del diseño (§4)", () => {
  const disenio = {
    "da26-a1-carrito": [15, 9, 14, 12],
    "da26-a2-vaso-renta": [7, 15, 15, 13, 15, 7],
    "da26-a3-columpio-tasa": [12, 9, 15, 15],
    "da26-a4-no-miran-renta": [13, 16, 10, 13, 13],
    "da26-a5-bisagra-ascensor": [11, 12, 14, 13, 13, 12],
    /* P1: «El Gobierno gasta 100 en una vía.» pasó a la franja de escena (rediseño lote 1): 11 → 4. */
    "da26-a6-eco-multiplicador": [4, 15, 16, 16, 14, 10],
  };
  for (const [id, pantallas] of Object.entries(APRENDER)) {
    for (const t of pantallas) assert.ok(palabras(t) <= 20, `${id}: «${t}»`);
    assert.deepEqual(pantallas.map(palabras), disenio[id], id);
  }
});

test("Hacer: consignas ≤ 12 palabras (H1 9 · H2 9 · H3 8 · H4 10 · H5 7 · H6 11)", () => {
  /* H5: el diseño dice 6, pero «Toca la línea que tiene el error.» son 7. Se mide; el texto no se toca. */
  const esperado = { "da26-h1-llena-carrito": 9, "da26-h2-arma-formula": 9, "da26-h3-gira-o-sube": 8, "da26-h4-empresario": 10, "da26-h5-libreta": 7, "da26-h6-meta": 11 };
  for (const [id, c] of Object.entries(CONSIGNAS)) {
    assert.ok(palabras(c) <= 12, id);
    assert.equal(palabras(c), esperado[id], id);
  }
});

test("retroalimentaciones ≤ 15 palabras, todas", () => {
  const todas = [
    ...BANCO_H1.flatMap((f) => Object.values(f.retro)),
    ...BANCO_H4.flatMap((h) => h.retro),
    ...BANCO_H3.flatMap((s) => Object.values(s.retro)),
    ...BANCO_H5.flatMap((p) => [p.correccion, ...p.lineas.filter((l) => !l.falsa).map((l) => l.retro)]),
    ...ETAPAS_H2.flatMap((e) => Object.values(e.retro)),
    ...Object.values(RETRO_A5_P5), ...Object.values(RETRO_A6_P1),
  ];
  assert.ok(todas.length > 100);
  for (const t of todas) assert.ok(palabras(t) <= 15, `«${t}» tiene ${palabras(t)}`);
});

test("cada destino errado de H1 tiene su retro; cada ficha de H2 tiene la suya", () => {
  for (const f of BANCO_H1) {
    const errados = ["C", "I", "G", "XN"].filter((k) => k !== f.correcta);
    assert.deepEqual(Object.keys(f.retro).sort(), errados.sort(), f.id);
  }
  for (const e of ETAPAS_H2) for (const f of e.fichas) assert.ok(e.retro[f], `${e.id}: ${f}`);
  assert.equal(ETAPAS_H2.reduce((s, e) => s + e.huecos.length, 0), 10);
});

/* ─── Bancos: sorteo y orden aleatorio (D8) ─── */

test("sorteo: n distintos del banco, y semillas distintas dan partidas distintas", () => {
  const casos = [[BANCO_H1, PARTIDA_H1, 8, 10], [BANCO_H3, PARTIDA_H3, 6, 8], [BANCO_H4, PARTIDA_H4, 5, 7], [BANCO_H5, PARTIDA_H5, 4, 6]];
  for (const [banco, n, esperadoN, esperadoBanco] of casos) {
    assert.equal(n, esperadoN);
    assert.equal(banco.length, esperadoBanco);
    const vistas = new Set();
    const firmas = new Set();
    for (let s = 1; s <= 60; s += 1) {
      const p = sortear(banco, n, conSemilla(s));
      assert.equal(p.length, n);
      assert.equal(new Set(p.map((x) => x.id)).size, n);
      p.forEach((x) => vistas.add(x.id));
      firmas.add(p.map((x) => x.id).join(","));
    }
    assert.equal(vistas.size, banco.length, "todo el banco sale alguna vez");
    assert.ok(firmas.size > 40, "las partidas cambian");
  }
});

test("orden aleatorio: H5 baraja sus líneas y H2 su bandeja en cada partida", async () => {
  const { prepararH5 } = await import("../demanda-agregada/H5Libreta.jsx");
  const { prepararH2 } = await import("../demanda-agregada/H2ArmaFormula.jsx");
  const posiciones = new Set();
  const bandejas = new Set();
  for (let s = 1; s <= 40; s += 1) {
    for (const pg of prepararH5(conSemilla(s))) {
      assert.equal(pg.lineas.filter((l) => l.falsa).length, 1, "exactamente una falsa");
      posiciones.add(pg.lineas.findIndex((l) => l.falsa));
    }
    bandejas.add(prepararH2(conSemilla(s))[0].fichas.join(","));
  }
  assert.equal(posiciones.size, 4, "la falsa cae en cualquiera de las cuatro posiciones");
  assert.ok(bandejas.size > 10);
  assert.deepEqual(barajar([1, 2, 3], conSemilla(9)).sort(), [1, 2, 3]);
});

/* ─── Subtemas: cada ítem guarda los suyos ─── */

test("subtemas: cada ítem de cada Hacer lleva ids válidos de la ficha", () => {
  const validos = new Set(SUBTEMAS);
  const items = [...BANCO_H1, ...BANCO_H3, ...BANCO_H4, ...BANCO_H5, ...ETAPAS_H2, ...ETAPAS_H6];
  for (const it of items) {
    assert.ok(Array.isArray(it.subtemas) && it.subtemas.length > 0, it.id);
    for (const s of it.subtemas) assert.ok(validos.has(s), `${it.id}: ${s}`);
  }
  assert.deepEqual(BANCO_H1.filter((f) => f.subtemas.includes("da-exportaciones-netas")).map((f) => f.id), ["h1-4", "h1-5", "h1-8"]);
  assert.ok(BANCO_H1.every((f) => f.subtemas.includes("da-componentes")));
  assert.ok(BANCO_H4.every((h) => h.subtemas.includes("da-caso-empresario")));
  assert.ok(BANCO_H3.every((s) => s.subtemas.includes("da-grafica")));
  assert.ok(ETAPAS_H6.every((e) => e.subtemas.includes("da-multiplicador") && e.subtemas.includes("da-grafica")));
  assert.deepEqual(ETAPAS_H2.map((e) => e.subtemas), [["da-consumo"], ["da-inversion"], ["da-multiplicador"]]);
});

/* ─── Colores: cuatro tonos a ≥ 3:1, ninguno coral ─── */

test("colores C, I, G, XN: distintos, ≥ 3:1 contra el fondo y ninguno es coral", () => {
  const tonos = Object.values(COMPONENTES).map((c) => c.color);
  assert.equal(new Set(tonos).size, 4);
  for (const c of tonos) {
    assert.ok(contraste(c, FONDO) >= 3, `${c}: ${contraste(c, FONDO).toFixed(2)}`);
    assert.notEqual(c.toLowerCase(), CORAL.toLowerCase());
  }
  const planck = readFileSync("src/styles/planck.css", "utf8");
  for (const c of Object.values(COMPONENTES)) assert.ok(planck.toLowerCase().includes(c.color.toLowerCase()), `${c.id} sale de planck.css`);
});

/* ─── La migración (publicada en el lote 2) y la publicación ─── */

const SQL = readFileSync("supabase/migrations/0270_da26_t1_demanda_agregada.sql", "utf8");

test("migración: las 6 Hacer con la clasificación del catálogo, y el guardián no la reprocha", () => {
  const filas = filasDeCatalogo(SQL);
  assert.equal(filas.length, 6);
  const cliente = new Map(HACER_T1.map((a) => [a.id, {
    activity_id: a.id, subject_id: "macroeconomia", topic_id: "demanda-agregada",
    modalidad: a.clasificacion.modalidad, dificultad: a.clasificacion.dificultad, fp_base: a.clasificacion.fpBase,
  }]));
  for (const f of filas) {
    const a = HACER_T1.find((x) => x.id === f.activity_id);
    assert.ok(a, f.activity_id);
    assert.equal(f.etapas, a.clasificacion.etapas ?? 1, f.activity_id);
  }
  assert.deepEqual(revisar([{ nombre: "0270_da26_t1_demanda_agregada.sql", sql: SQL }], cliente), []);
});

test("publicación por pieza: subjects.js y supabase/migrations llevan exactamente lo anotado en PUBLICADAS_T1", () => {
  const ids = new Set(PIEZAS_T1.map((p) => p.id));
  for (const id of PUBLICADAS_T1) assert.ok(ids.has(id), `PUBLICADAS_T1 nombra una pieza que no existe: ${id}`);
  const declaradas = new Set();
  for (const m of Object.values(SUBJECTS)) for (const t of m.topics ?? []) for (const a of t.actividades ?? []) if (ids.has(a.id)) declaradas.add(a.id);
  assert.deepEqual([...declaradas].sort(), [...PUBLICADAS_T1].sort(), "subjects.js = PUBLICADAS_T1");
  /* Solo las Hacer publicadas tienen fila de catálogo; una Aprender nunca la lleva. */
  for (const f of readdirSync("supabase/migrations")) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const id of ids) {
      if (!sql.includes(id)) continue;
      assert.ok(estaPublicada(id), `${f} registra ${id} sin estar publicada`);
      assert.equal(PIEZAS_T1.find((p) => p.id === id).tipo, "hacer", `${f}: ${id} es Aprender y no lleva fila`);
    }
  }
  /* Publicar las Aprender no exige ninguna Hacer: el interruptor es por pieza. */
  const soloAprender = PIEZAS_T1.filter((p) => p.tipo === "aprender");
  assert.equal(soloAprender.length, 6);
  assert.ok(soloAprender.every((p) => !p.clasificacion), "las Aprender no tienen clasificación de FP");
  assert.ok(VISTAS.has("macro-2026"), "la vista previa existe por dirección");
  /*
   * Ningún índice ni tarjeta del sitio enlaza la vista previa. Se busca la
   * ruta (#/macro-2026, o "macro-2026" como valor), no el texto suelto: desde
   * el retiro de Macro (0258) muchos comentarios citan la carpeta
   * orquestador/conocimiento/macro-2026/, y eso no es un enlace.
   */
  const enlaces = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const ruta = `${dir}/${e.name}`;
      if (e.isDirectory()) { if (!ruta.includes("macro2026") && e.name !== "__tests__") recorrer(ruta); }
      else if (/\.(jsx?|mjs)$/.test(e.name) && ruta !== "src/ruta.js" && ruta !== "src/App.jsx" && /#\/macro-2026|["'`]macro-2026["'`/]/.test(readFileSync(ruta, "utf8"))) enlaces.push(ruta);
    }
  };
  recorrer("src");
  assert.deepEqual(enlaces, []);
});
