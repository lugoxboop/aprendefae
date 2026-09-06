import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SUBJECTS, HACER } from "../../data/subjects.js";

/*
 * El catálogo de actividades vive en DOS sitios y no hay forma de evitarlo: el
 * cliente lo necesita para dibujar la interfaz y el servidor para no creerse lo
 * que le digan. Lo que sí se puede evitar es que se separen en silencio.
 *
 * Esto compara lo que declara subjects.js contra la semilla de la migración
 * 0011. Corre en `npm test`, así que la separación se detecta al desarrollar y
 * no cuando un estudiante cobra los puntos de otra dificultad.
 *
 * Si falla porque se añadió una actividad: hay que añadirla también a la
 * migración, con una nueva que haga el insert. No basta con editar la 0011, que
 * ya está aplicada.
 */

const MIGRACION = "supabase/migrations/0011_fp_en_el_servidor.sql";

/* Las filas de la semilla, tal como están escritas en el SQL. */
function catalogoDelServidor() {
  const sql = readFileSync(MIGRACION, "utf8");
  const filas = [...sql.matchAll(
    /\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'(exploratoria|evaluativa)',\s*'(facil|medio|dificil|experto)',\s*(\d+)\s*\)/g
  )];
  return new Map(filas.map((m) => [m[1], {
    subject: m[2], topic: m[3], modalidad: m[4], dificultad: m[5], fpBase: Number(m[6]),
  }]));
}

/* Lo que declara el catálogo del cliente. */
function catalogoDelCliente() {
  const salida = new Map();
  for (const materia of Object.values(SUBJECTS))
    for (const tema of materia.topics)
      for (const act of tema.actividades ?? []) {
        const c = act.clasificacion;
        if (c?.tipo !== HACER) continue;
        salida.set(act.id, {
          subject: materia.id, topic: tema.id,
          modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase,
        });
      }
  return salida;
}

test("toda actividad que da FP está en el catálogo del servidor", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  const faltan = [...cliente.keys()].filter((id) => !servidor.has(id));
  assert.deepEqual(faltan, [], `sin entrada en la migración: ${faltan.join(", ")}`);
});

test("dificultad y puntos base coinciden entre cliente y servidor", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  const distintas = [];

  for (const [id, c] of cliente) {
    const s = servidor.get(id);
    if (!s) continue;
    for (const campo of ["subject", "topic", "modalidad", "dificultad", "fpBase"]) {
      if (c[campo] !== s[campo]) {
        distintas.push(`${id}.${campo}: cliente=${c[campo]} servidor=${s[campo]}`);
      }
    }
  }

  assert.deepEqual(distintas, [], `el catálogo se separó:\n  ${distintas.join("\n  ")}`);
});

test("el servidor no paga por actividades que el cliente no ofrece", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  /*
   * camara-presion-experto es la excepción conocida: es un modo de una
   * actividad, no una entrada propia del catálogo del cliente. Cualquier otra
   * sobrante sería una actividad que la base paga y que ya no existe.
   */
  const conocidas = new Set(["camara-presion-experto"]);
  const sobran = [...servidor.keys()].filter((id) => !cliente.has(id) && !conocidas.has(id));
  assert.deepEqual(sobran, [], `el servidor pagaría por: ${sobran.join(", ")}`);
});
