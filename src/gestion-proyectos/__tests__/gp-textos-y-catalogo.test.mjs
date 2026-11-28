/*
 * Gestión de Proyectos · los textos y el catálogo de las 83 Hacer (lotes 1 a 4).
 * - Longitudes del diseño (contexto ≤ 30, rol ≤ 15, consigna ≤ 12, retro ≤ 15).
 * - Cada clave está entre los destinos de su ítem; ids únicos.
 * - Los sorteos que pide el diseño (H01 4/4/2, H09 Integración al final,
 *   H15 siempre las dos EEF internas, H18 uno de cada tipo por ronda).
 * - Catálogo = subjects.js = 0276 a 0279 = publicadas; etapas iguales en los tres.
 * - Los objetos ilustrados existen y miden lo que dice ilustrados.js.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { conSemilla } from "../../macro2026/comun/azar.js";
import { partidaDe, prepararPieza } from "../comun/preparar.js";
import { ILUSTRADOS_GP } from "../comun/ilustrados.js";
import { hayObjeto } from "../comun/objetos.jsx";
import { PIEZAS_TEXTO_GP } from "../etiquetas.js";
import { PIEZAS, PUBLICADAS } from "../catalogo.js";
import { MODULOS, SUBTEMAS as SUBTEMAS_ESTRUCTURA } from "../estructura.js";
import { COMPONENTES_GP } from "../Hacer.jsx";
import { SUBJECTS } from "../../data/subjects.js";

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const porId = Object.fromEntries(PIEZAS_TEXTO_GP.map((p) => [p.id, p]));

/* Todas las cadenas bajo una clave dada, en cualquier profundidad. */
function bajo(obj, nombres, out = [], ruta = "") {
  if (Array.isArray(obj)) obj.forEach((x, k) => bajo(x, nombres, out, `${ruta}[${k}]`));
  else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (nombres.includes(k)) {
        if (typeof v === "string") out.push([`${ruta}.${k}`, v]);
        else if (v && typeof v === "object") for (const [k2, v2] of Object.entries(v)) if (typeof v2 === "string") out.push([`${ruta}.${k}.${k2}`, v2]);
      }
      bajo(v, nombres, out, `${ruta}.${k}`);
    }
  }
  return out;
}

test("longitudes: contexto ≤ 30, rol ≤ 15, consigna ≤ 12, cada retro ≤ 15", () => {
  for (const p of PIEZAS_TEXTO_GP) {
    assert.ok(palabras(p.contexto) <= 30, `${p.id}: contexto`);
    assert.ok(palabras(p.rol) <= 15, `${p.id}: rol`);
    for (const [r, t] of bajo(p, ["consigna", "consignaReto"])) assert.ok(palabras(t) <= 12, `${p.id}${r}: «${t}»`);
    for (const [r, t] of bajo(p, ["retro", "retros", "retroComun"])) assert.ok(palabras(t) <= 15, `${p.id}${r}: ${palabras(t)} palabras`);
  }
});

test("bancos: ids únicos y cada clave entre sus destinos", () => {
  const vistos = new Set();
  for (const p of PIEZAS_TEXTO_GP) {
    for (const e of p.etapas) {
      const items = [...(e.banco ?? []), ...[].concat(e.despues ?? []).filter((d) => d.tipo !== "ordenar"),
        ...(e.pasos ?? []).flatMap((m) => (m.items && m.tipo !== "ordenar" ? m.items.map((x) => ({ ...x, destinos: x.destinos ?? m.destinos })) : m.clave || m.tipo === "casillas" ? [m] : []))];
      for (const x of items) {
        assert.ok(!vistos.has(x.id), `id repetido ${x.id}`);
        vistos.add(x.id);
        if (x.tipo === "casillas") {
          /* Lote 3: cada casilla con su clave (número, o una de sus opciones). */
          /* Lote 4: una casilla de marcar lleva una lista de claves, todas entre sus opciones. */
          for (const c of x.casillas) assert.ok(c.marcar ? c.clave.length > 0 && c.clave.every((k) => c.opciones.some((o) => o.id === k)) : c.opciones ? c.opciones.some((o) => o.id === c.clave) : Number.isFinite(c.clave), `${x.id}/${c.id}: clave`);
          continue;
        }
        if (e.tipo === "dial") { assert.ok(e.posiciones.some((q) => q.id === x.clave), `${x.id}: clave del dial`); continue; }
        const destinos = (x.destinos ?? e.destinos).map((d) => d.id);
        assert.ok(destinos.includes(x.clave), `${x.id}: clave ${x.clave} fuera de ${destinos}`);
      }
    }
  }
});

test("sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    const h01 = partidaDe(porId["gp26-fun-h01-bandeja"].etapas[0], rng);
    const niveles = h01.map((x) => x.nivel);
    assert.deepEqual(niveles, [...niveles].sort(), "H01 progresiva");
    assert.deepEqual([1, 2, 3].map((n) => niveles.filter((v) => String(v) === String(n)).length), [4, 4, 2], "H01 4/4/2");
    const h09 = prepararPieza(porId["gp26-fun-h09-central"], rng)[0].pasos;
    assert.equal(h09.length, 8, "H09: 7 + Integración");
    assert.equal(h09.at(-1).id, "h09-11", "H09 Integración al final");
    const h15 = prepararPieza(porId["gp26-fun-h15-control"], rng)[0].pasos.map((x) => x.id);
    for (const id of ["h15-05", "h15-06"]) assert.ok(h15.includes(id), `H15 siempre ${id}`);
    const h18 = prepararPieza(porId["gp26-fun-h18-pmo"], rng)[0].pasos;
    const tipos = new Set(h18.map((x) => x.clave)).size;
    for (let r = 0; r < h18.length / tipos; r += 1) assert.equal(new Set(h18.slice(r * tipos, (r + 1) * tipos).map((x) => x.clave)).size, tipos, "H18 uno de cada tipo por ronda");
  }
});

test("catálogo (todos los módulos) = textos = subjects.js = 0276 a 0279 = publicadas, con subtemas de estructura.js", () => {
  const sql = ["0276_gp_c01_c02_hacer", "0277_gp_c03_c04_hacer", "0278_gp_c05_c06_hacer", "0279_gp_c07_c08_hacer"].map((f) => readFileSync(`supabase/migrations/${f}.sql`, "utf8")).join("\n");
  const hacer = MODULOS.flatMap((m) => (PIEZAS[m.id] ?? []).filter((p) => p.tipo === "hacer").map((p) => ({ ...p, moduloId: m.id })));
  /* Las 83: las mismas en el catálogo y en los textos; dentro de cada módulo, en el orden de los diseños. */
  assert.deepEqual([...hacer.map((p) => p.id)].sort(), PIEZAS_TEXTO_GP.map((p) => p.id).sort(), "las 83, las mismas");
  const ordenTextos = PIEZAS_TEXTO_GP.map((p) => p.id);
  for (const m of MODULOS) {
    const ids = hacer.filter((p) => p.moduloId === m.id).map((p) => p.id);
    assert.deepEqual(ids, [...ids].sort((a, b) => ordenTextos.indexOf(a) - ordenTextos.indexOf(b)), `${m.id}: en el orden de los diseños`);
  }
  const validos = new Set(SUBTEMAS_ESTRUCTURA.map((s) => s.id));
  const abrev = { "gp-fundamentos": "fun", "gp-inicio": "ini", "gp-planificacion": "pla", "gp-ejecucion": "eje", "gp-monitoreo-control": "moc", "gp-cierre": "cie" };
  for (const p of hacer) {
    assert.match(p.id, new RegExp(`^gp26-${abrev[p.moduloId]}-(c0\\d-)?h\\d\\d-`), p.id);
    assert.ok(PUBLICADAS.includes(p.id), `${p.id} publicada`);
    assert.ok(COMPONENTES_GP[p.id], `${p.id} con componente`);
    const a = SUBJECTS["gestion-proyectos"].topics.find((t) => t.id === p.moduloId)?.actividades.find((x) => x.id === p.id);
    assert.ok(a, `${p.id} en subjects.js`);
    assert.deepEqual(a.clasificacion, p.clasificacion, `${p.id}: clasificación`);
    assert.equal(porId[p.id].etapas.length, p.clasificacion.etapas ?? 1, `${p.id}: etapas del texto`);
    const e = p.clasificacion.etapas ?? 1;
    const fila = `('${p.id}', 'gestion-proyectos', '${p.moduloId}', '${p.clasificacion.modalidad}', '${p.clasificacion.dificultad}', ${p.clasificacion.fpBase}, ${e})`;
    assert.ok(sql.includes(fila), `${p.id}: su fila en la 0276, 0277, 0278 o 0279`);
    for (const s of p.subtemas) assert.ok(validos.has(s), `${p.id}: subtema ${s}`);
  }
  const usados = new Set();
  const junta = (o) => { if (Array.isArray(o)) o.forEach(junta); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "subtemas" && Array.isArray(v)) v.forEach((x) => usados.add(x)); else junta(v); } };
  junta(PIEZAS_TEXTO_GP);
  for (const s of usados) assert.ok(validos.has(s), `subtema de los textos fuera de estructura.js: ${s}`);
  assert.match(sql, /on conflict \(activity_id\) do nothing/i);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ""), /\b(delete|update|drop|alter|truncate)\b/i, "la 0276 a la 0279 solo agregan");
  const etapas = readFileSync("supabase/tests/etapas_test.sql", "utf8");
  for (const p of hacer.filter((x) => (x.clasificacion.etapas ?? 1) > 1)) assert.ok(etapas.includes(`'${p.id}'`), `${p.id}: en etapas_test.sql`);
});

test("lote 2: sorteos del diseño (al menos una por línea, pares separados, trampas y fijas siempre)", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    const h02 = partidaDe(porId["gp26-fun-c03-h02-tranvia"].etapas[0], rng);
    assert.equal(h02.length, 8, "C3 H02: 8");
    assert.equal(new Set(h02.map((x) => x.clave)).size, 5, "C3 H02: al menos una por línea");
    assert.deepEqual(h02.map((x) => x.nivel), [1, 1, 1, 2, 2, 2, 3, 3], "C3 H02 progresiva 3/3/2");
    const h05 = partidaDe(porId["gp26-fun-c03-h05-moneda"].etapas[0], rng);
    assert.equal(h05.length, 10, "C3 H05: 5 pares");
    assert.ok(h05.every((x, k) => k === 0 || x.par !== h05[k - 1].par), "C3 H05: los dos de un par nunca seguidos");
    assert.equal(new Set(h05.map((x) => x.par)).size, 5);
    const h06 = partidaDe(porId["gp26-fun-c03-h06-comandas"].etapas[1], rng);
    assert.equal(h06.length, 5); assert.equal(new Set(h06.map((x) => x.clave)).size, 4, "C3 H06: una por pincho");
    const h07 = prepararPieza(porId["gp26-fun-c03-h07-mosaico"], rng)[1].pasos;
    assert.equal(new Set(h07.slice(0, 4).map((x) => x.clave)).size, 3, "C3 H07: una por dimensión");
    const a01 = partidaDe(porId["gp26-ini-c04-h01-acta"].etapas[0], rng);
    assert.equal(a01.length, 11); assert.equal(a01.filter((x) => x.clave !== "plan").length, 9, "C4 H01: las nueve secciones");
    const p03 = partidaDe(porId["gp26-pla-c04-h03-portaplanos"].etapas[0], rng).map((x) => x.id);
    assert.equal(p03.length, 10); for (const id of ["c4h03-08", "c4h03-09"]) assert.ok(p03.includes(id), `C4 H03 trampa ${id}`);
    const c04 = partidaDe(porId["gp26-eje-c04-h04-carretillas"].etapas[0], rng);
    assert.equal(c04.length, 8); assert.ok(c04.every((x, k) => k === 0 || (x.nivel ?? 1) >= (c04[k - 1].nivel ?? 1)), "C4 H04 primero las obvias");
    const b05 = partidaDe(porId["gp26-eje-c04-h05-bitacora"].etapas[0], rng);
    assert.equal(b05.length, 7); assert.ok(b05.some((x) => x.id === "c4h05-06"), "C4 H05 la oportunidad");
    for (const k of ["incidentes", "riesgos", "datos"]) assert.ok(b05.filter((x) => x.clave === k).length >= 2, `C4 H05 dos de ${k}`);
    const k10 = partidaDe(porId["gp26-cie-c04-h10-beneficiadero"].etapas[1], rng).map((x) => x.id);
    assert.equal(k10.length, 7); for (const id of ["c4h10-c5", "c4h10-c6"]) assert.ok(k10.includes(id), `C4 H10 canal ${id}`);
  }
});

const medidaWebp = (f) => {
  const b = readFileSync(`public${f}`);
  assert.equal(b.subarray(8, 12).toString(), "WEBP", f);
  if (b.subarray(12, 16).toString() === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  return null;
};

test("ilustrados: cada WebP existe y mide lo que dice ilustrados.js", () => {
  for (const [id, m] of Object.entries(ILUSTRADOS_GP)) {
    const medida = medidaWebp(`/gestion-proyectos/ilustrados/${id}.webp`);
    if (medida) assert.deepEqual(medida, m, id);
  }
});

test("cada objeto que nombran los textos y las escenas existe", async () => {
  const { readdirSync } = await import("node:fs");
  const ids = [];
  const junta = (o) => {
    if (Array.isArray(o)) o.forEach(junta);
    else if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) {
        if (["objeto", "portada", "objetoTarjeta"].includes(k)) ids.push(typeof v === "string" ? v : v?.id);
        else if (k === "objetos" && Array.isArray(v)) ids.push(...v);
        else junta(v);
      }
    }
  };
  junta(PIEZAS_TEXTO_GP);
  for (const dir of ["fundamentos", "integracion", "alcance", "cronograma", "costos", "calidad"]) {
    for (const f of readdirSync(new URL(`../${dir}/`, import.meta.url)).filter((x) => /^(C0\d)?H\d\d.*\.jsx$/.test(x))) {
      junta((await import(`../${dir}/${f}`)).ESCENA);
    }
  }
  for (const id of ids.filter(Boolean)) assert.ok(hayObjeto(id), `objeto sin ilustración: ${id}`);
});
