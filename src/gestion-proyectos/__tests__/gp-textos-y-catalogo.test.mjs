/*
 * Gestión de Proyectos · los textos y el catálogo de las 18 Hacer.
 * - Longitudes del diseño (contexto ≤ 30, rol ≤ 15, consigna ≤ 12, retro ≤ 15).
 * - Cada clave está entre los destinos de su ítem; ids únicos.
 * - Los sorteos que pide el diseño (H01 4/4/2, H09 Integración al final,
 *   H15 siempre las dos EEF internas, H18 uno de cada tipo por ronda).
 * - Catálogo = subjects.js = 0276 = publicadas; etapas iguales en los tres.
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
import { SUBTEMAS as SUBTEMAS_ESTRUCTURA } from "../estructura.js";
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
      const items = [...(e.banco ?? []), ...(e.despues && e.despues.tipo !== "ordenar" ? [e.despues] : []),
        ...(e.pasos ?? []).flatMap((m) => (m.items && m.tipo !== "ordenar" ? m.items.map((x) => ({ ...x, destinos: x.destinos ?? m.destinos })) : m.clave ? [m] : []))];
      for (const x of items) {
        assert.ok(!vistos.has(x.id), `id repetido ${x.id}`);
        vistos.add(x.id);
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

test("catálogo (gp-fundamentos) = textos = subjects.js = 0276 = publicadas, con subtemas de estructura.js", () => {
  const sql = readFileSync("supabase/migrations/0276_gp_c01_c02_hacer.sql", "utf8");
  const hacer = PIEZAS["gp-fundamentos"].filter((p) => p.tipo === "hacer");
  assert.deepEqual(hacer.map((p) => p.id), PIEZAS_TEXTO_GP.map((p) => p.id), "las 18, en el orden del diseño");
  const acts = SUBJECTS["gestion-proyectos"].topics.find((t) => t.id === "gp-fundamentos").actividades;
  const validos = new Set(SUBTEMAS_ESTRUCTURA.map((s) => s.id));
  for (const p of hacer) {
    assert.match(p.id, /^gp26-fun-h\d\d-/, p.id);
    assert.ok(PUBLICADAS.includes(p.id), `${p.id} publicada`);
    assert.ok(COMPONENTES_GP[p.id], `${p.id} con componente`);
    const a = acts.find((x) => x.id === p.id);
    assert.ok(a, `${p.id} en subjects.js`);
    assert.deepEqual(a.clasificacion, p.clasificacion, `${p.id}: clasificación`);
    assert.equal(porId[p.id].etapas.length, p.clasificacion.etapas ?? 1, `${p.id}: etapas del texto`);
    const e = p.clasificacion.etapas ?? 1;
    const fila = `('${p.id}', 'gestion-proyectos', 'gp-fundamentos', '${p.clasificacion.modalidad}', '${p.clasificacion.dificultad}', ${p.clasificacion.fpBase}, ${e})`;
    assert.ok(sql.includes(fila), `${p.id}: su fila en la 0276`);
    for (const s of p.subtemas) assert.ok(validos.has(s), `${p.id}: subtema ${s}`);
  }
  const usados = new Set();
  const junta = (o) => { if (Array.isArray(o)) o.forEach(junta); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "subtemas" && Array.isArray(v)) v.forEach((x) => usados.add(x)); else junta(v); } };
  junta(PIEZAS_TEXTO_GP);
  for (const s of usados) assert.ok(validos.has(s), `subtema de los textos fuera de estructura.js: ${s}`);
  assert.match(sql, /on conflict \(activity_id\) do nothing/i);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ""), /\b(delete|update|drop|alter|truncate)\b/i, "la 0276 solo agrega");
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
  for (const f of readdirSync(new URL("../fundamentos/", import.meta.url)).filter((x) => /^H\d\d.*\.jsx$/.test(x))) {
    junta((await import(`../fundamentos/${f}`)).ESCENA);
  }
  for (const id of ids.filter(Boolean)) assert.ok(hayObjeto(id), `objeto sin ilustración: ${id}`);
});
