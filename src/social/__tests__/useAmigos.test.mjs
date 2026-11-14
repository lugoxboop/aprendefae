import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mensajeAmistad } from "../useAmigos.js";

/*
 * El hook de amigos y la migración 0164 no se pueden separar: el hook llama a
 * cuatro funciones por su nombre exacto, y la base las define con ese nombre.
 * Un nombre mal escrito aquí da un error feo recién en producción, así que la
 * prueba LEE la migración y comprueba que cada nombre que el hook invoca existe
 * de verdad —el mismo trato que mascota.test.mjs le da a los checks—.
 */

const fuenteHook = readFileSync(fileURLToPath(new URL("../useAmigos.js", import.meta.url)), "utf8");
/* Las funciones de amigos viven en la 0164 (amistades) y la 0167 (buscar). */
const migracion = ["0164_amigos.sql", "0167_amigos_buscar.sql"]
  .map((f) => readFileSync(fileURLToPath(new URL(`../../../supabase/migrations/${f}`, import.meta.url)), "utf8"))
  .join("\n");

test("cada rpc que llama el hook existe como función en la base (0164/0167)", () => {
  const llamadas = [...fuenteHook.matchAll(/supabase\.rpc\("([^"]+)"/g)].map((m) => m[1]);
  assert.ok(llamadas.length >= 4, "el hook llama al menos a las cuatro funciones");
  for (const nombre of new Set(llamadas)) {
    const re = new RegExp(`create or replace function public\\.${nombre}\\b`);
    assert.match(migracion, re, `la base define ${nombre}`);
  }
});

test("mensajeAmistad convierte cada error de la base en algo legible", () => {
  assert.match(mensajeAmistad({ message: "No hay nadie con el apodo «x»", code: "no_data_found" }), /apodo/i);
  assert.match(mensajeAmistad({ message: "No puedes agregarte a ti mismo", code: "22023" }), /tu propio apodo/i);
  assert.match(mensajeAmistad({ message: "Ya son amigos", code: "23505" }), /[Yy]a son amigos/);
  assert.match(mensajeAmistad({ message: "Ya le enviaste una solicitud", code: "23505" }), /enviaste/i);
  assert.match(mensajeAmistad({ message: "Se requiere sesión", code: "42501" }), /sesión/i);
  /* Cualquier otro error no deja a la interfaz muda ni suelta el texto crudo. */
  const otro = mensajeAmistad({ message: "boom", code: "XX000" });
  assert.ok(otro && !/boom/.test(otro), "un error raro da un mensaje genérico, no el crudo");
});
