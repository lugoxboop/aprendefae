import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ESCALA_ACTIVIDAD, nuevoVale, puntuarActividad, recalificarActividad, comentarActividad,
} from "../enviar.js";

function clienteFalso(respuesta = { data: true, error: null }) {
  const llamadas = [];
  return { llamadas, rpc: async (nombre, args) => { llamadas.push({ nombre, args }); return respuesta; } };
}

test("cada estrella de actividad tiene su palabra", () => {
  for (const n of [1, 2, 3, 4, 5]) assert.ok(ESCALA_ACTIVIDAD[n]);
});

test("el vale tiene forma de uuid y no se repite", () => {
  const a = nuevoVale(), b = nuevoVale();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, b);
});

test("el vale no depende de crypto: sin él sigue saliendo un uuid válido", () => {
  const sinCrypto = nuevoVale({});
  assert.match(sinCrypto, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("la estrella viaja anónima, con su actividad y su materia", async () => {
  const c = clienteFalso();
  const r = await puntuarActividad(c, { puntaje: 4, actividadId: "t2-a3", materiaId: "contabilidad", ancho: 375 });
  assert.equal(r.ok, true);
  const a = c.llamadas[0].args;
  assert.equal(a.p_anonimo, true, "una estrella de actividad nunca lleva dueño");
  assert.equal(a.p_origen, "actividad");
  assert.equal(a.p_actividad, "t2-a3");
  assert.equal(a.p_materia, "contabilidad");
  assert.equal(a.p_dispositivo, "telefono");
  assert.equal(a.p_texto, null, "el texto va después, por el vale");
  assert.ok(a.p_envio, "sin vale no se podría comentar esa misma fila");
  assert.equal(r.vale, a.p_envio);
});

test("el comentario va a la fila del vale, no a una opinión nueva", async () => {
  const c = clienteFalso();
  await comentarActividad(c, { vale: "11111111-1111-4111-8111-111111111111", texto: "  muy larga  " });
  assert.equal(c.llamadas[0].nombre, "comentar_opinion");
  assert.deepEqual(c.llamadas[0].args, { p_envio: "11111111-1111-4111-8111-111111111111", p_texto: "muy larga" });
});

test("sin vale o sin texto no se llama a nadie", async () => {
  const c = clienteFalso();
  assert.equal((await comentarActividad(c, { vale: null, texto: "hola" })).ok, false);
  assert.equal((await comentarActividad(c, { vale: "x", texto: "   " })).ok, false);
  assert.equal(c.llamadas.length, 0);
});

test("un vale caducado se distingue del error", async () => {
  const r = await comentarActividad(clienteFalso({ data: false, error: null }), { vale: "x", texto: "hola" });
  assert.deepEqual(r, { ok: false, motivo: "caducado" });
});

test("sin conexión no revienta la pantalla de resultados", async () => {
  assert.equal((await puntuarActividad(null, { puntaje: 3 })).ok, false);
  assert.equal((await comentarActividad(null, { vale: "x", texto: "y" })).ok, false);
});

/* ═══════════ EL TRINQUETE DE 0156 ═══════════ */

const SQL = readFileSync(new URL("../../../supabase/migrations/0156_estrellas_de_actividad.sql", import.meta.url), "utf8");

test("la función vieja se borra y la nueva se crea en la MISMA transacción", () => {
  const i = SQL.indexOf("begin;");
  const d = SQL.indexOf("drop function if exists public.enviar_opinion");
  const c = SQL.indexOf("create function public.enviar_opinion");
  const f = SQL.indexOf("commit;");
  assert.ok(i < d && d < c && c < f, "fuera de la transacción habría un instante sin función");
});

test("los dos parámetros nuevos traen valor por defecto: la portada publicada sigue llamando con seis", () => {
  assert.match(SQL, /p_actividad\s+text\s+default null/);
  assert.match(SQL, /p_materia\s+text\s+default null/);
  assert.match(SQL, /p_envio\s+uuid\s+default null/);
});

test("el vale del comentario es de un solo uso y caduca", () => {
  assert.match(SQL, /and texto is null/);
  assert.match(SQL, /creado > now\(\) - interval '2 hours'/);
  assert.match(SQL, /create unique index if not exists opiniones_envio_idx/);
});

test("una estrella de actividad tampoco guarda quién la mandó", () => {
  /* El insert sigue poniendo user_id solo cuando NO es anónima, y el cliente
     manda p_anonimo en true siempre para este origen (probado arriba). */
  assert.match(SQL, /case when v_anon then null else v_uid end/);
});

test("el panel no lo puede leer cualquiera", () => {
  assert.match(SQL, /actividades_puntuadas[\s\S]{0,400}es_docente\(\)/);
  assert.match(SQL, /revoke all on function public\.actividades_puntuadas\(text\) from public, anon/);
});

/* ═══════════ CORREGIR LA ESTRELLA (0157) ═══════════ */

test("corregir no manda otra opinión: corrige la fila del vale", async () => {
  const c = clienteFalso();
  await recalificarActividad(c, { vale: "22222222-2222-4222-8222-222222222222", puntaje: 2 });
  assert.equal(c.llamadas[0].nombre, "recalificar_opinion");
  assert.deepEqual(c.llamadas[0].args, { p_envio: "22222222-2222-4222-8222-222222222222", p_puntaje: 2 });
});

test("sin vale o con puntaje fuera de rango no se llama a nadie", async () => {
  const c = clienteFalso();
  assert.equal((await recalificarActividad(c, { vale: null, puntaje: 3 })).ok, false);
  assert.equal((await recalificarActividad(c, { vale: "x", puntaje: 0 })).ok, false);
  assert.equal((await recalificarActividad(c, { vale: "x", puntaje: 6 })).ok, false);
  assert.equal(c.llamadas.length, 0);
});

test("un vale caducado se distingue del error también al corregir", async () => {
  const r = await recalificarActividad(clienteFalso({ data: false, error: null }), { vale: "x", puntaje: 3 });
  assert.deepEqual(r, { ok: false, motivo: "caducado" });
});

const SQL157 = readFileSync(new URL("../../../supabase/migrations/0157_cambiar_la_estrella.sql", import.meta.url), "utf8");

test("corregir se puede varias veces, pero solo esa fila y solo dos horas", () => {
  assert.match(SQL157, /where envio = p_envio\s*\n\s*and creado > now\(\) - interval '2 hours'/);
  /* A diferencia del comentario, aquí NO hay cerrojo de un solo uso: dudar
     dos veces es normal y la última es la que vale. */
  assert.equal(/set puntaje[\s\S]{0,200}and texto is null/.test(SQL157), false);
  assert.match(SQL157, /p_puntaje < 1 or p_puntaje > 5/);
});

test("la puede llamar quien entra sin registro, como la estrella misma", () => {
  assert.match(SQL157, /grant execute on function public\.recalificar_opinion\(uuid, smallint\) to anon, authenticated/);
});
