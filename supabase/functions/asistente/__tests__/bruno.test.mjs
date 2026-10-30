import { test } from "node:test";
import assert from "node:assert/strict";
import { construirPeticion, recortarPalabras, sanearHistorial, SISTEMA_BRUNO, MAX_PALABRAS, MAX_PANTALLA } from "../bruno.js";
import { manejar } from "../manejador.js";

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;

test("★ el prompt de Bruno trae las reglas que no se rompen", () => {
  for (const regla of [/Nunca des la respuesta/, /120 palabras/, /UNA pregunta corta/, /DATOS INTERNOS/, /Nunca la cites/]) assert.match(SISTEMA_BRUNO, regla);
});

test("★ ninguna respuesta pasa de 120 palabras, y se corta en una frase entera", () => {
  const larga = Array.from({ length: 40 }, (_, i) => `Esta es la frase número ${i}.`).join(" ");
  const r = recortarPalabras(larga);
  assert.ok(palabras(r) <= MAX_PALABRAS, `${palabras(r)} palabras`);
  assert.match(r, /\.$/);
  assert.equal(recortarPalabras("Corta y clara."), "Corta y clara.");
});

test("★ el contexto llega separado de la pregunta, recortado, con la respuesta marcada como no revelable", () => {
  const { system, messages } = construirPeticion({
    mensaje: "no entiendo esta actividad",
    contexto: { materia: "Contabilidad", actividad: "¿Debe o Haber?", pantalla: "x".repeat(9000), datos: { correcta: "haber" } },
  });
  assert.equal(system, SISTEMA_BRUNO);
  const ultimo = messages.at(-1);
  assert.equal(ultimo.role, "user");
  assert.match(ultimo.content[0].text, /DATOS INTERNOS \(no revelar\):\n\{"correcta":"haber"\}/);
  assert.ok(ultimo.content[0].text.length < MAX_PANTALLA + 600, "la pantalla no se recortó");
  assert.match(ultimo.content[1].text, /PREGUNTA DEL ESTUDIANTE:\nno entiendo esta actividad/);
});

test("★ el historial alterna, empieza por el estudiante, termina en Bruno y no pasa de 6 turnos", () => {
  const h = sanearHistorial([
    { rol: "bruno", texto: "hola" }, { rol: "estudiante", texto: "a" }, { rol: "estudiante", texto: "b" },
    { rol: "bruno", texto: "c" }, { rol: "sistema", texto: "x" }, { rol: "estudiante", texto: "d" },
  ]);
  assert.deepEqual(h.map((t) => t.role), ["user", "assistant"]);
  assert.equal(h[0].content, "a\nb");
  assert.ok(sanearHistorial(Array.from({ length: 30 }, (_, i) => ({ rol: i % 2 ? "bruno" : "estudiante", texto: String(i) }))).length <= 6);
});

test("★ el manejador le pasa a la API el prompt y el contexto, y recorta lo que vuelva largo", async () => {
  let recibido;
  const peticion = new Request("http://x/asistente", {
    method: "POST", headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje: "ayuda", contexto: { pantalla: "Lee el hecho." }, historial: [] }),
  });
  const r = await manejar(peticion, {
    env: { ANTHROPIC_API_KEY: "k" },
    consumirCupo: async (l) => ({ permitido: true, usadas: 1, limite: l }),
    llamarModelo: async (p) => { recibido = p; return "palabra ".repeat(300); },
  });
  const cuerpo = await r.json();
  assert.equal(r.status, 200);
  assert.equal(recibido.system, SISTEMA_BRUNO);
  assert.match(recibido.messages.at(-1).content[0].text, /PANTALLA:\nLee el hecho\./);
  assert.ok(palabras(cuerpo.respuesta) <= MAX_PALABRAS);
});
