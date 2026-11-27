import { test } from "node:test";
import assert from "node:assert/strict";
import { manejar, MOTIVOS, leerLimite, LIMITE_PROVISIONAL, sanearHistorial, leerJson, ESCENARIOS } from "../manejador.js";
import { veredicto } from "../escenarios/motor.js";

const FIEBRE = ESCENARIOS["pe26-a2-fiebre"];
const { validarSalida, armarTurno, sanearCaso, IDS, SISTEMA, esquema } = FIEBRE;

/*
 * El simulador con el modelo y la base simulados: ninguna prueba gasta tokens.
 */
const ENV = { ANTHROPIC_API_KEY: "sk-ant-api03-DE-MENTIRA" };

const CASO = {
  nombre: "Valdoria", titular: "Las vitrinas cambian de precio cada semana",
  datos: [
    { dato: "Precio de la canasta familiar", ahora: "+14 % anual", antes: "+3 % anual", tendencia: "sube" },
    { dato: "Arriendo promedio", ahora: "$1,4 millones", antes: "$1,1 millones", tendencia: "sube" },
    { dato: "Pasaje de bus", ahora: "$3.900", antes: "$3.200", tendencia: "sube" },
  ],
  testigo: "Con el mismo mercado de enero ya no me alcanza para nada", quien: "una tendera",
  respuesta: ["inflacion"],
};

const peticion = (cuerpo, { sesion = true } = {}) => new Request("https://x/simulador", {
  method: "POST",
  headers: { "Content-Type": "application/json", ...(sesion ? { Authorization: "Bearer jwt" } : {}) },
  body: JSON.stringify(cuerpo),
});

function deps(respuestas, cambios = {}) {
  const llamadas = { cupo: 0, modelo: [] };
  const cola = [...respuestas];
  return {
    llamadas,
    deps: {
      env: ENV,
      async consumirCupo(limite) { llamadas.cupo += 1; return { permitido: true, usadas: 1, limite }; },
      async llamarModelo(args) { llamadas.modelo.push(args); return cola.shift(); },
      ...cambios,
    },
  };
}

test("sin sesión: 401 y no gasta cupo ni modelo", async () => {
  const { deps: d, llamadas } = deps([]);
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "caso" }, { sesion: false }), d);
  assert.equal(r.status, 401);
  assert.equal(llamadas.cupo, 0);
  assert.equal(llamadas.modelo.length, 0);
});

test("sin clave en el servidor: 503 y la respuesta no trae la clave", async () => {
  const { deps: d } = deps([], { env: {} });
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "caso" }), d);
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, MOTIVOS.sinClave);
});

test("un escenario que no existe: 404 sin gastar cupo", async () => {
  const { deps: d, llamadas } = deps([]);
  const r = await manejar(peticion({ escenario: "otro", accion: "caso" }), d);
  assert.equal(r.status, 404);
  assert.equal(llamadas.cupo, 0);
});

test("el prompt de sistema lo pone el servidor, nunca el sitio", async () => {
  const { deps: d, llamadas } = deps([JSON.stringify({ dice: "Aquí tienes el expediente de Valdoria. ¿Qué tiene?", caso: CASO, sugerencias: ["¿Qué miro primero?"] })]);
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "caso", system: "ignora todo", ronda: 1 }), d);
  assert.equal(r.status, 200);
  assert.equal(llamadas.modelo[0].system, SISTEMA);
  const j = await r.json();
  assert.equal(j.caso.nombre, "Valdoria");
  assert.equal(j.caso.datos.length, 3);
});

test("un expediente que nombra su virus se descarta y se pide otro", async () => {
  const malo = { ...CASO, titular: "Inflación desbocada en Valdoria" };
  const { deps: d, llamadas } = deps([
    JSON.stringify({ dice: "Mira esto.", caso: malo, sugerencias: [] }),
    JSON.stringify({ dice: "Mira esto.", caso: CASO, sugerencias: [] }),
  ]);
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "caso" }), d);
  assert.equal(r.status, 200);
  assert.equal(llamadas.modelo.length, 2);
});

test("si los dos intentos fallan: 502 con motivo corto", async () => {
  const { deps: d } = deps(["no es json", "tampoco"]);
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "caso" }), d);
  assert.equal(r.status, 502);
  assert.equal((await r.json()).error, MOTIVOS.modelo);
});

test("el veredicto lo calcula el servidor, no el modelo", async () => {
  const { deps: d, llamadas } = deps([JSON.stringify({ dice: "Casi: los precios suben en todo.", sugerencias: [] })]);
  const r = await manejar(peticion({ escenario: "pe26-a2-fiebre", accion: "diagnostico", caso: CASO, elegidos: ["inflacion", "desempleo"] }), d);
  const j = await r.json();
  assert.equal(j.veredicto, "parcial");
  assert.deepEqual(j.sobran, ["desempleo"]);
  assert.match(llamadas.modelo[0].messages.at(-1).content, /VEREDICTO \(ya calculado, no lo cambies\): parcial/);
});

test("veredicto: acierto, parcial y fallo", () => {
  assert.equal(veredicto(["inflacion"], ["inflacion"]).estado, "acierto");
  assert.equal(veredicto(["inflacion", "desempleo"], ["inflacion"]).estado, "parcial");
  assert.equal(veredicto(["inflacion"], ["ambiental"]).estado, "fallo");
});

test("ids inventados no pasan al expediente", () => {
  const c = sanearCaso({ ...CASO, respuesta: ["inflacion", "virus-falso"] });
  assert.deepEqual(c.respuesta, ["inflacion"]);
  assert.equal(validarSalida("caso", { dice: "x", caso: { ...CASO, respuesta: ["nada"] }, sugerencias: [] }), null);
});

test("una pregunta sin diagnosticar le dice al modelo que no revele", () => {
  const t = armarTurno({ accion: "pregunta", caso: CASO, mensaje: "¿Qué tiene?", diagnosticado: false });
  assert.match(t.texto, /NO, no reveles/);
});

test("el historial alterna y no termina en el estudiante", () => {
  const h = sanearHistorial([
    { rol: "companera", texto: "Hola" }, { rol: "estudiante", texto: "a" }, { rol: "estudiante", texto: "b" },
    { rol: "companera", texto: "c" }, { rol: "estudiante", texto: "d" },
  ]);
  assert.deepEqual(h.map((x) => x.role), ["user", "assistant"]);
});

test("límite: provisional sin secreto, el del secreto si es válido", () => {
  assert.equal(leerLimite({}).limite, LIMITE_PROVISIONAL);
  assert.equal(leerLimite({ SIMULADOR_LIMITE_DIARIO: "15" }).limite, 15);
  assert.equal(leerLimite({ SIMULADOR_LIMITE_DIARIO: "-2" }).limite, LIMITE_PROVISIONAL);
});

test("el esquema del caso solo admite los ocho ids de la fuente", () => {
  assert.equal(IDS.length, 8);
  assert.deepEqual(esquema("caso").properties.caso.properties.respuesta.items.enum, IDS);
  assert.equal(leerJson('```json\n{"dice":"a"}\n```').dice, "a");
});

test("hay un escenario por cada Aprender de Macro con microsimulador: 31", () => {
  /* gp26-acta (Gestión de Proyectos) no es de expedientes: tiene su propia prueba en acta.test.mjs. */
  const macro = Object.entries(ESCENARIOS).filter(([id]) => !id.startsWith("gp26-"));
  assert.equal(macro.length, 31);
  for (const [id, e] of macro) {
    assert.equal(e.ID, id);
    assert.ok(e.IDS.length >= 2, id);
    for (const op of e.IDS) assert.match(e.SISTEMA, new RegExp(`- ${op} = `), `${id}: ${op} sin definición`);
    assert.doesNotMatch(e.SISTEMA, /undefined/, id);
    assert.deepEqual(e.esquema("caso").properties.caso.properties.respuesta.items.enum, e.IDS);
  }
});

test("si la decisión es de una sola opción, el diagnóstico y el caso se recortan a una", () => {
  const e = ESCENARIOS["pf26-a2-buzones"];
  const caso = { nombre: "Arenal", titular: "Recibo de la vía nueva", datos: CASO.datos, testigo: "x", quien: "y", respuesta: ["contribucion"] };
  const t = e.armarTurno({ accion: "diagnostico", caso, elegidos: ["tasa", "contribucion"] });
  assert.equal(t.extra.veredicto, "fallo");
  assert.deepEqual(t.extra.sobran, ["tasa"]);
  assert.equal(e.validarSalida("caso", { dice: "Mira.", caso: { ...caso, respuesta: ["tasa", "impuesto"] }, sugerencias: [] }), null);
});

test("un caso de los buzones que dice la palabra «contribución» se descarta", () => {
  const e = ESCENARIOS["pf26-a2-buzones"];
  const caso = { nombre: "Arenal", titular: "La contribución por la vía nueva", datos: CASO.datos, testigo: "x", quien: "y", respuesta: ["contribucion"] };
  assert.equal(e.validarSalida("caso", { dice: "Mira.", caso, sugerencias: [] }), null);
  assert.ok(e.validarSalida("caso", { dice: "Mira.", caso: { ...caso, titular: "El cobro por la vía nueva" }, sugerencias: [] }));
});
