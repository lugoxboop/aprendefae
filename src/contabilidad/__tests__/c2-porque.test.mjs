import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { textosDelError } from "../../components/mecanicas/libros/t7/escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C2 · AL SEGUNDO ERROR, LA RESPUESTA LLEVA SU PORQUÉ (decisión de Miku,
 * 16 de octubre)
 *
 * En Aprender manda la escalera de ayuda: al primer error, la pista; al
 * segundo, la respuesta CON SU PORQUÉ, nunca suelta. La escalera arma ese
 * segundo mensaje con «La respuesta es «…».» y el acierto de la pantalla sin
 * su «Así es.». Si el acierto es solo «Así es.», el porqué queda vacío y el
 * estudiante ve la respuesta sin saber por qué.
 *
 * Esta prueba barre las preguntas de opción de Aprender de T5 y T7 que tienen
 * pista y exige que el segundo error traiga, además de la respuesta, al menos
 * cuatro palabras de porqué. Las pantallas de varios pasos que guardan el
 * porqué en `respuesta` cuentan con él.
 *
 * PENDIENTES: lo que Near está escribiendo. La lista solo encoge.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DATOS = new URL("../../data/", import.meta.url);
const PENDIENTES = new Set([]);
const palabras = (t) => String(t ?? "").split(/\s+/).filter(Boolean).length;

async function sinPorque() {
  const out = new Map();
  const vistos = new Set();
  const archivos = readdirSync(DATOS).filter((f) => /^contabilidad(T5|T7)_.*\.js$/.test(f));
  assert.ok(archivos.length >= 30, `solo encontré ${archivos.length} archivos de datos de T5 y T7`);
  for (const f of archivos) {
    const m = await import(new URL(f, DATOS).href);
    const visitar = (v) => {
      if (!v || typeof v !== "object" || vistos.has(v)) return;
      vistos.add(v);
      const correcta = Array.isArray(v.opciones) ? v.opciones.find((o) => o.correcta) : null;
      if (v.pista && correcta && v.acierto && typeof v.acierto === "object") {
        const [, ...porque] = textosDelError(v, v.opciones.find((o) => !o.correcta) ?? correcta, 2);
        if (palabras(porque.join(" ")) < 4) out.set(`${v.id} · ${v.pregunta ?? v.texto ?? ""}`, f);
      } else if (v.pista && correcta && typeof v.acierto === "string") {
        if (palabras(v.respuesta) < 4) out.set(`${v.id} · ${v.texto ?? ""}`, f);
      }
      for (const x of Object.values(v)) visitar(x);
    };
    for (const v of Object.values(m)) visitar(v);
  }
  return out;
}

test("★★★ C2: en Aprender, el segundo error trae la respuesta con su porqué, nunca suelta", async () => {
  const d = await sinPorque();
  assert.deepEqual([...d].filter(([k]) => !PENDIENTES.has(k)).map(([k, f]) => `${f} · ${k}`), []);
});

test("★★ la lista de pendientes solo encoge: cada pendiente sigue sin porqué (si ya lo tiene, sácala)", async () => {
  const d = await sinPorque();
  assert.deepEqual([...PENDIENTES].filter((k) => !d.has(k)), []);
});

test("★★ el medidor ve el rojo: un acierto que es solo «Así es.» deja el porqué vacío", () => {
  const p = { pista: "Una pista.", opciones: [{ id: "a", texto: "A", correcta: true }, { id: "b", texto: "B", correcta: false }], acierto: { texto: "Así es." } };
  const [, ...porque] = textosDelError(p, p.opciones[1], 2);
  assert.equal(palabras(porque.join(" ")), 0);
});
