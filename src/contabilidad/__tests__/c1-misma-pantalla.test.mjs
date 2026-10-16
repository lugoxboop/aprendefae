import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C1 EN LA MISMA PANTALLA (Célula C, enganche.md · C1)
 *
 * La regla C1 dice que la respuesta no puede estar en la pantalla anterior.
 * Su caso más directo es peor: que esté en la MISMA pantalla, en el párrafo
 * de arriba de la pregunta. Entonces la pregunta no mide nada; el estudiante
 * copia la frase que acaba de leer.
 *
 * Lo encontró L con un barrido el 16 de octubre: en cuatro pantallas de T7 la
 * opción correcta repetía, casi palabra por palabra, un párrafo de la misma
 * pantalla («el-cierre» de T7-2 A4 la daba entera).
 *
 * Cómo se mide: las palabras con contenido de la opción correcta (más de tres
 * letras, sin artículos ni preposiciones). Si tres de cada cuatro ya están en
 * los párrafos o el texto de la misma pantalla, se delata. El enunciado, la
 * ficha y la figura no cuentan: son los datos del caso, no la regla.
 *
 * PENDIENTES: las pantallas que Near está rehaciendo. Esta lista solo puede
 * encoger. Si una pendiente deja de delatarse, la prueba falla hasta que se
 * saque de aquí, para que ninguna se quede escondida en la lista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DATOS = new URL("../../data/", import.meta.url);
/* Cada pendiente es «id de la pantalla · respuesta correcta»: así no la confunde
   otra pantalla con el mismo id, y no depende del archivo que la exporte. */
const PENDIENTES = new Set([
  "dos-cuentas-propias · «Para saber cuánto se devolvió en el periodo.»",
  "la-compra · «Inventario de mercancías»",
]);

const norm = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\u00f1 ]/g, " ");
const VACIAS = new Set("el la los las de del y o a en que se un una por con para es no lo al su sus mas menos ya ese esa este esta como".split(" "));
const palabras = (t) => norm(t).split(/\s+/).filter((w) => w.length > 3 && !VACIAS.has(w));

async function delatadas() {
  const out = new Map();
  const archivos = readdirSync(DATOS).filter((f) => /^contabilidad(T5|T7)_.*\.js$/.test(f));
  assert.ok(archivos.length >= 30, `solo encontré ${archivos.length} archivos de datos de T5 y T7`);
  /* Una pantalla que dos archivos exportan se mide una sola vez. */
  const vistos = new Set();
  for (const f of archivos) {
    const m = await import(new URL(f, DATOS).href);
    const visitar = (v) => {
      if (!v || typeof v !== "object" || vistos.has(v)) return;
      vistos.add(v);
      if (Array.isArray(v.opciones) && (v.parrafos || typeof v.texto === "string")) {
        const antes = [].concat(v.parrafos ?? [], v.texto ?? []).filter((x) => typeof x === "string").join(" ");
        const correcta = v.opciones.find((o) => o.correcta);
        if (correcta && antes) {
          const w = palabras(correcta.texto);
          const p = new Set(palabras(antes));
          const dentro = w.filter((x) => p.has(x));
          if (w.length >= 2 && dentro.length / w.length >= 0.75) out.set(`${v.id} · «${correcta.texto}»`, f);
        }
      }
      for (const x of Object.values(v)) visitar(x);
    };
    for (const v of Object.values(m)) visitar(v);
  }
  return out;
}

test("★★★ C1: ninguna pantalla de T5 o T7 trae su respuesta en el párrafo de arriba de la pregunta", async () => {
  const d = await delatadas();
  const nuevas = [...d].filter(([k]) => !PENDIENTES.has(k)).map(([k, f]) => `${f} · ${k}`);
  assert.deepEqual(nuevas, []);
});

test("★★ la lista de pendientes solo encoge: cada pendiente sigue delatándose (si ya no, sácala de la lista)", async () => {
  const d = await delatadas();
  assert.deepEqual([...PENDIENTES].filter((k) => !d.has(k)), []);
});

test("★★ el medidor ve el rojo: una pantalla que copia su respuesta del párrafo se delata", () => {
  const w = palabras("Hasta que la mercancía está a bordo del buque.");
  const p = new Set(palabras("El vendedor corre con todos los gastos hasta que la mercancía está a bordo del buque."));
  assert.equal(w.filter((x) => p.has(x)).length, w.length);
  const q = new Set(palabras("Así cierra el periódico. Toca los asientos que le sobran."));
  assert.ok(palabras("Los de quitar el inventario inicial y colocar el final.").filter((x) => q.has(x)).length < 3);
});
