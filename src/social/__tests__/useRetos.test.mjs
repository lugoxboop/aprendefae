import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mensajeReto, tiempoRestante } from "../useRetos.js";

/* El hook de retos y la migración 0166 no se separan: cada rpc que llama existe
   como función en la base. */
const fuenteHook = readFileSync(fileURLToPath(new URL("../useRetos.js", import.meta.url)), "utf8");
const migracion = readFileSync(
  fileURLToPath(new URL("../../../supabase/migrations/0166_retos_en_compania.sql", import.meta.url)),
  "utf8",
);

test("cada rpc que llama el hook existe como función en la 0166", () => {
  const llamadas = [...fuenteHook.matchAll(/supabase\.rpc\("([^"]+)"/g)].map((m) => m[1]);
  assert.ok(llamadas.length >= 4, "al menos crear, responder, cerrar y estado");
  for (const nombre of new Set(llamadas)) {
    assert.match(migracion, new RegExp(`create or replace function public\\.${nombre}\\b`), `la 0166 define ${nombre}`);
  }
});

test("el bono se paga en cristales, no en FP (protege las ligas)", () => {
  /* La 0166 no puede tocar fp_history/points al pagar: solo cristales_balance. */
  assert.match(migracion, /cristales_balance = cristales_balance \+ v_r\.bono/, "el bono suma cristales");
  assert.ok(!/update public\.profiles[\s\S]*set points/.test(migracion), "el reto nunca escribe points");
});

test("mensajeReto convierte cada error de la base en algo legible", () => {
  assert.match(mensajeReto({ message: "Ya tienen un reto en curso", code: "23505" }), /en curso/i);
  assert.match(mensajeReto({ message: "Solo puedes retar a tus amigos" }), /amigos/i);
  assert.match(mensajeReto({ message: "El reto ya venció" }), /venció/i);
  assert.match(mensajeReto({ message: "Todavía no completan la meta entre los dos" }), /meta/i);
  const otro = mensajeReto({ message: "boom", code: "XX000" });
  assert.ok(otro && !/boom/.test(otro), "un error raro no suelta el texto crudo");
});

test("tiempoRestante dice horas, minutos o «venció»", () => {
  assert.equal(tiempoRestante(null), "");
  assert.equal(tiempoRestante(new Date(Date.now() - 1000).toISOString()), "venció");
  assert.match(tiempoRestante(new Date(Date.now() + 5 * 3600_000).toISOString()), /^5 h$/);
  assert.match(tiempoRestante(new Date(Date.now() + 10 * 60_000).toISOString()), /min$/);
});
