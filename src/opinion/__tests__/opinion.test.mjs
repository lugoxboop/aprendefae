import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TEMAS, ESCALA, LARGO_MAXIMO,
  dispositivoDe, sePuedeEnviar, limpiarTexto, temasValidos, enviarOpinion,
} from "../enviar.js";

/*
 * Lo que estas pruebas cuidan es una promesa, no un formato: la hoja le dice
 * al estudiante que nadie puede saber quién escribió. Si un día alguien
 * "optimiza" el envío y deja de mandar p_anonimo, o manda el ancho exacto de
 * la pantalla, la promesa se rompe sin que se note en pantalla. Eso es lo que
 * se ata aquí.
 */

test("los cuatro temas son los que pidió Mateo, y en ese orden", () => {
  assert.deepEqual(TEMAS.map((t) => t.id), ["interfaz", "actividades", "ejemplos", "rankings"]);
});

test("cada estrella tiene palabras: una escala muda no se puede promediar", () => {
  for (const n of [1, 2, 3, 4, 5]) {
    assert.ok(typeof ESCALA[n] === "string" && ESCALA[n].length > 0, `falta la frase de ${n}`);
  }
});

test("el dispositivo son tres cubos, nunca el ancho exacto", () => {
  assert.equal(dispositivoDe(320), "telefono");
  assert.equal(dispositivoDe(599), "telefono");
  assert.equal(dispositivoDe(600), "tableta");
  assert.equal(dispositivoDe(1023), "tableta");
  assert.equal(dispositivoDe(1024), "escritorio");
  assert.equal(dispositivoDe(null), null);
  assert.equal(dispositivoDe("ancho"), null);
});

test("sin puntuación no se envía; con 1 a 5 sí", () => {
  assert.equal(sePuedeEnviar({ puntaje: 0 }), false);
  assert.equal(sePuedeEnviar({ puntaje: 6 }), false);
  assert.equal(sePuedeEnviar({ puntaje: 2.5 }), false);
  assert.equal(sePuedeEnviar({ puntaje: 1 }), true);
  assert.equal(sePuedeEnviar({ puntaje: 5 }), true);
});

test("el texto se recorta y el vacío viaja como nulo, no como cadena vacía", () => {
  assert.equal(limpiarTexto("   "), null);
  assert.equal(limpiarTexto("  hola  "), "hola");
  assert.equal(limpiarTexto("x".repeat(LARGO_MAXIMO + 50)).length, LARGO_MAXIMO);
});

test("un tema inventado se descarta y no se cuela a la base", () => {
  assert.deepEqual(temasValidos(["rankings", "interfaz", "notas", "interfaz"]), ["interfaz", "rankings"]);
  assert.deepEqual(temasValidos(null), []);
});

function clienteFalso(respuesta = { data: true, error: null }) {
  const llamadas = [];
  return {
    llamadas,
    rpc: async (nombre, args) => { llamadas.push({ nombre, args }); return respuesta; },
  };
}

test("por defecto la opinión viaja anónima", async () => {
  const c = clienteFalso();
  const r = await enviarOpinion(c, { puntaje: 4, texto: "va bien" });
  assert.equal(r.ok, true);
  assert.equal(c.llamadas[0].nombre, "enviar_opinion");
  assert.equal(c.llamadas[0].args.p_anonimo, true);
});

test("firmar es la excepción y tiene que pedirse explícitamente", async () => {
  const c = clienteFalso();
  await enviarOpinion(c, { puntaje: 5, anonimo: false });
  assert.equal(c.llamadas[0].args.p_anonimo, false);
});

test("no se manda el ancho en píxeles, solo el cubo", async () => {
  const c = clienteFalso();
  await enviarOpinion(c, { puntaje: 3, ancho: 390 });
  const args = c.llamadas[0].args;
  assert.equal(args.p_dispositivo, "telefono");
  assert.equal(JSON.stringify(args).includes("390"), false, "se filtró el ancho exacto");
});

test("sin conexión no revienta la portada: devuelve ok en falso", async () => {
  const r = await enviarOpinion(null, { puntaje: 3 });
  assert.deepEqual(r, { ok: false, motivo: "sin-conexion" });
});

test("el envío repetido se distingue del error, para no dar las gracias en falso", async () => {
  const repetida = await enviarOpinion(clienteFalso({ data: false, error: null }), { puntaje: 3 });
  assert.deepEqual(repetida, { ok: false, motivo: "repetida" });
  const fallo = await enviarOpinion(clienteFalso({ data: null, error: { message: "boom" } }), { puntaje: 3 });
  assert.equal(fallo.ok, false);
  assert.equal(fallo.motivo, "error");
});

test("un cliente que lanza no rompe nada", async () => {
  const c = { rpc: async () => { throw new Error("red caída"); } };
  const r = await enviarOpinion(c, { puntaje: 3 });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "error");
});

/*
 * ═══════════ EL TRINQUETE DEL ANONIMATO EN LA BASE ═══════════
 *
 * La interfaz promete que no se guarda quién escribió. Esa promesa la
 * sostiene la migración 0155, no el navegador. Si alguien le quita la
 * restricción o le añade una columna que identifique, la pantalla seguiría
 * diciendo lo mismo y sería mentira — así que se ata aquí.
 */
import { readFileSync } from "node:fs";

const SQL = readFileSync(
  new URL("../../../supabase/migrations/0155_opiniones_del_sitio.sql", import.meta.url),
  "utf8"
);

test("el esquema obliga a que una opinión anónima no tenga dueño", () => {
  assert.match(SQL, /check \(not anonimo or user_id is null\)/);
  assert.match(SQL, /check \(not anonimo or apodo is null\)/);
});

test("la tabla no guarda nada que identifique un navegador", () => {
  /* Se mira SOLO el bloque de columnas: los comentarios nombran a propósito lo
     que se decidió no guardar, y un grep sobre el archivo entero los leería
     como si estuvieran guardados. */
  const bloque = SQL.match(/create table if not exists public\.opiniones \(([\s\S]*?)\n\);/);
  assert.ok(bloque, "no encontré la definición de la tabla");
  const columnas = bloque[1]
    .split("\n")
    .map((l) => l.replace(/\/\*[\s\S]*?\*\//g, "").trim())
    .filter((l) => l && !l.startsWith("*") && !l.startsWith("/*") && !l.startsWith("constraint"))
    .map((l) => l.split(/\s+/)[0].toLowerCase());
  assert.ok(columnas.includes("anonimo"), `no leí bien las columnas: ${columnas.join(", ")}`);
  for (const prohibida of ["user_agent", "agente", "ip", "ip_origen", "ancho_px", "ancho", "fingerprint", "navegador", "huella"]) {
    assert.equal(columnas.includes(prohibida), false, `0155 guarda la columna ${prohibida}`);
  }
});

test("solo un docente puede leer las opiniones, y nadie puede insertarlas directo", () => {
  assert.match(SQL, /enable row level security/);
  assert.match(SQL, /for select[\s\S]{0,120}es_docente\(\)/);
  assert.equal(/create policy[^;]*for insert/i.test(SQL), false, "hay una política de INSERT: el cliente podría falsear el anonimato");
});

test("quien no tiene sesión queda anónimo quiera o no", () => {
  assert.match(SQL, /if v_uid is null then\s*\n\s*v_anon := true;/);
});

test("la función es la única puerta, y está abierta a quien entra sin registro", () => {
  assert.match(SQL, /grant execute on function public\.enviar_opinion[\s\S]{0,120}to anon, authenticated/);
});
