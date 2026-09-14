import { test } from "node:test";
import assert from "node:assert/strict";

import { hayQueVolverAPreguntar, recordadoComoDocente } from "../useAccesoDocente.js";

/*
 * Cuándo se vuelve a preguntar si la cuenta es docente, y qué recuerda el
 * navegador de la última respuesta.
 *
 * El atajo de la cabecera monta esta pregunta en TODAS las páginas, así que un
 * evento de Supabase mal leído ya no cuesta una llamada de más al abrir una
 * actividad: cuesta una en cada carga y otra cada vez que la pestaña vuelve a
 * primer plano. Por eso la regla vive en una función pura y se prueba aquí.
 */

test("los eventos que Supabase emite sin cambiar de cuenta no vuelven a preguntar", () => {
  /*
   * INITIAL_SESSION llega a cada suscriptor nuevo y SIGNED_IN al recuperar la
   * sesión guardada —al cargar y al volver a la pestaña—: misma cuenta, misma
   * respuesta.
   */
  for (const evento of ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"]) {
    assert.equal(hayQueVolverAPreguntar(evento, "u1", "u1"), false, evento);
  }
});

test("entrar, salir o cambiar de cuenta sí vuelven a preguntar", () => {
  assert.equal(hayQueVolverAPreguntar("SIGNED_IN", "u1", "u2"), true);
  assert.equal(hayQueVolverAPreguntar("SIGNED_IN", null, "u1"), true);
  assert.equal(hayQueVolverAPreguntar("SIGNED_OUT", "u1", null), true);
});

test("renovar el token nunca vuelve a preguntar", () => {
  assert.equal(hayQueVolverAPreguntar("TOKEN_REFRESHED", "u1", "u2"), false);
  assert.equal(hayQueVolverAPreguntar("USER_UPDATED", "u1", null), false);
});

test("antes de la primera respuesta ningún evento pregunta: esa primera ya lee la cuenta", () => {
  assert.equal(hayQueVolverAPreguntar("INITIAL_SESSION", undefined, "u1"), false);
  assert.equal(hayQueVolverAPreguntar("SIGNED_IN", undefined, "u1"), false);
});

test("el adelanto del atajo solo vale para la cuenta que el servidor confirmó", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const datos = new Map([["fae:docente", "u1"]]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) },
  });
  try {
    assert.equal(recordadoComoDocente("u1"), true);
    assert.equal(recordadoComoDocente("u2"), false, "otra cuenta en el mismo navegador");
    assert.equal(recordadoComoDocente(null), false, "sin sesión nunca");
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
});

test("sin almacenamiento, o si el almacenamiento falla, nadie está recordado", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() { throw new Error("bloqueado"); },
  });
  try {
    assert.equal(recordadoComoDocente("u1"), false);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
});
