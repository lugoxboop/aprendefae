import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PIEZAS_POR_LOTE, MAX_ARCHIVOS, MOTIVOS,
  sistema, construirPeticion, extraerJson, limpiarPieza, leerPiezas, revisarArchivos, leerLimite,
} from "../fabrica.js";
import { manejar, hayCabeceraDeSesion } from "../manejador.js";

/* Una pieza bien formada, para no repetirla en cada prueba. */
const BUENA = {
  titulo: "De qué está hecha una cuenta",
  objetivo: "Distinguir debe de haber sin confundirlos con aumentar y disminuir.",
  nombres: [
    { termino: "Debe", definicion: "El lado izquierdo de la cuenta." },
    { termino: "Haber", definicion: "El lado derecho de la cuenta." },
    { termino: "Saldo", definicion: "La diferencia entre los dos movimientos." },
  ],
  pasos: [
    { resaltar: 0, texto: "El lado izquierdo se llama debe." },
    { resaltar: 1, texto: "El derecho se llama haber." },
    { resaltar: 2, texto: "La diferencia entre ambos es el saldo." },
  ],
  pregunta: "¿Por qué debe y haber no significan aumentar y disminuir?",
  respuesta: "Porque son lados, no efectos: qué pasa depende del tipo de cuenta.",
};

const peticion = (cuerpo, { metodo = "POST", auth = "Bearer abc" } = {}) => ({
  method: metodo,
  headers: { get: (k) => (k.toLowerCase() === "authorization" ? auth : null) },
  json: async () => cuerpo,
});

const deps = (extra = {}) => ({
  env: { ANTHROPIC_API_KEY: "sk-prueba" },
  consumirCupo: async (l) => ({ permitido: true, usadas: 1, limite: l }),
  llamarModelo: async () => JSON.stringify([BUENA, BUENA, BUENA]),
  guardar: async ({ piezas }) => piezas.length,
  ...extra,
});

/* ═══════════ EL MOLDE ═══════════ */

test("el prompt le prohíbe copiar frases del material", () => {
  const s = sistema({ materia: "contabilidad" });
  assert.match(s, /NUNCA copies frases/);
  assert.match(s, /el sitio es público/);
});

test("un PDF viaja como documento y el texto como texto", () => {
  const { messages } = construirPeticion({
    materia: "contabilidad",
    mensaje: "saca tres del capítulo 2",
    archivos: [
      { nombre: "cap2.pdf", tipo: "application/pdf", datos: "QkFTRTY0" },
      { nombre: "notas.txt", tipo: "text/plain", datos: "x", texto: "mis notas" },
    ],
  });
  const tipos = messages[0].content.map((b) => b.type);
  assert.deepEqual(tipos, ["document", "text", "text"]);
  assert.match(messages[0].content[2].text, /saca tres del capítulo 2/);
});

test("sin mensaje, el modelo elige los temas él", () => {
  const { messages } = construirPeticion({ materia: "macroeconomia", mensaje: "", archivos: [] });
  assert.match(messages[0].content[0].text, /no escribió nada/);
});

/* ═══════════ LO QUE VUELVE ═══════════ */

test("el JSON se saca aunque venga con valla o con cortesía alrededor", () => {
  assert.ok(extraerJson('```json\n[{"a":1}]\n```'));
  assert.ok(extraerJson('Claro, aquí van:\n[{"a":1}]\nEspero que sirvan.'));
  assert.ok(extraerJson('{"actividades":[{"a":1}]}'), "envuelto en un objeto");
  assert.equal(extraerJson("no hay nada aquí"), null);
});

test("una pieza sin lo mínimo se descarta, no se arregla", () => {
  assert.equal(limpiarPieza(null), null);
  assert.equal(limpiarPieza({ ...BUENA, titulo: "  " }), null, "sin título");
  assert.equal(limpiarPieza({ ...BUENA, pregunta: "" }), null, "sin pregunta");
  assert.equal(limpiarPieza({ ...BUENA, nombres: [BUENA.nombres[0]] }), null, "un solo término no es una pieza");
  assert.equal(limpiarPieza({ ...BUENA, pasos: [] }), null, "sin pasos");
});

test("un resaltar que apunta a un término que no existe se apaga, no revienta", () => {
  const p = limpiarPieza({ ...BUENA, pasos: [{ resaltar: 99, texto: "uno" }, { resaltar: "dos", texto: "dos" }] });
  assert.deepEqual(p.pasos.map((x) => x.resaltar), [null, null]);
});

test("toda pieza generada queda marcada como generada", () => {
  assert.equal(limpiarPieza(BUENA).generada, true);
});

test("se devuelven como mucho las del lote, y se cuentan las caídas", () => {
  const r = leerPiezas(JSON.stringify([BUENA, { basura: 1 }, BUENA, BUENA, BUENA]), PIEZAS_POR_LOTE);
  assert.equal(r.piezas.length, PIEZAS_POR_LOTE);
  assert.equal(r.descartadas, 1);
  assert.equal(r.ilegible, false);
});

test("una respuesta ilegible se distingue de una vacía", () => {
  const r = leerPiezas("el modelo se puso a conversar", PIEZAS_POR_LOTE);
  assert.equal(r.ilegible, true);
  assert.equal(r.piezas.length, 0);
});

/* ═══════════ LOS ARCHIVOS ═══════════ */

test("un tipo que no aceptamos se rechaza antes de gastar nada", () => {
  const r = revisarArchivos([{ nombre: "a.docx", tipo: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", datos: "x" }]);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, MOTIVOS.archivoTipo);
});

test("un archivo enorme se rechaza por su peso real, no por el de su base64", () => {
  /* 12 MB de base64 son 9 MB de archivo: pasa de los 8 permitidos. */
  const r = revisarArchivos([{ nombre: "g.pdf", tipo: "application/pdf", datos: "A".repeat(12 * 1024 * 1024) }]);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, MOTIVOS.archivoGrande);
});

test("más de tres archivos, no", () => {
  const uno = { nombre: "a.pdf", tipo: "application/pdf", datos: "x" };
  assert.equal(revisarArchivos(Array(MAX_ARCHIVOS + 1).fill(uno)).ok, false);
});

/* ═══════════ LAS PUERTAS ═══════════ */

test("sin cabecera de sesión no se mira ni el cuerpo", async () => {
  assert.equal(hayCabeceraDeSesion({ headers: { get: () => "" } }), false);
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }, { auth: "" }), deps());
  assert.equal(r.status, 401);
});

test("sin clave en el servidor se avisa antes de cobrar cupo", async () => {
  let cobrado = false;
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    env: {}, consumirCupo: async () => { cobrado = true; return { permitido: true }; },
  }));
  assert.equal(r.status, 503);
  assert.equal(cobrado, false, "no se le cobra a nadie por un fallo nuestro");
});

test("un archivo malo no gasta cupo", async () => {
  let cobrado = false;
  const r = await manejar(
    peticion({ materia: "x", archivos: [{ nombre: "a.exe", tipo: "application/x-msdownload", datos: "x" }] }),
    deps({ consumirCupo: async () => { cobrado = true; return { permitido: true }; } }),
  );
  assert.equal(r.status, 400);
  assert.equal(cobrado, false);
});

test("sin encargo y sin archivo no hay de dónde partir", async () => {
  const r = await manejar(peticion({ materia: "contabilidad", mensaje: "   " }), deps());
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, MOTIVOS.sinEncargo);
});

test("quien no es docente recibe 403, no 500", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    consumirCupo: async () => { const e = new Error("no autorizado"); e.code = "42501"; throw e; },
  }));
  assert.equal(r.status, 403);
});

test("pasado el cupo, 429 con los números", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    consumirCupo: async () => ({ permitido: false, usadas: 9, limite: 8 }),
  }));
  assert.equal(r.status, 429);
  assert.deepEqual(await r.json(), { error: MOTIVOS.limite, usadas: 9, limite: 8 });
});

test("si el modelo falla, al profesor le llega un motivo corto y nunca el detalle", async () => {
  let registrado = "";
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    llamarModelo: async () => { throw new Error("401 invalid x-api-key sk-ant-SECRETO"); },
    registrar: (_n, t) => { registrado = t; },
  }));
  assert.equal(r.status, 502);
  const cuerpo = JSON.stringify(await r.json());
  assert.equal(cuerpo.includes("sk-ant"), false, "la clave no puede salir en la respuesta");
  assert.match(registrado, /sk-ant-SECRETO/, "pero sí tiene que quedar en el registro del servidor");
});

test("si no sale ni una pieza usable, 422 y no se guarda nada", async () => {
  let guardo = false;
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    llamarModelo: async () => "aquí tienes unas ideas sueltas",
    guardar: async () => { guardo = true; return 0; },
  }));
  assert.equal(r.status, 422);
  assert.equal(guardo, false);
});

test("el camino bueno guarda y devuelve lo creado", async () => {
  let recibido = null;
  const r = await manejar(peticion({ materia: "contabilidad", mensaje: "capítulo 2" }), deps({
    guardar: async (x) => { recibido = x; return x.piezas.length; },
  }));
  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.creadas, PIEZAS_POR_LOTE);
  assert.equal(cuerpo.piezas.length, PIEZAS_POR_LOTE);
  assert.equal(recibido.materia, "contabilidad");
  assert.equal(recibido.encargo, "capítulo 2", "lo que pidió queda con el borrador");
});

test("el límite sale del secreto, y si no, del provisional", () => {
  assert.deepEqual(leerLimite({ FABRICA_LIMITE_DIARIO: "20" }), { limite: 20, fuente: "secreto" });
  assert.equal(leerLimite({}).fuente, "provisional");
  assert.equal(leerLimite({ FABRICA_LIMITE_DIARIO: "muchas" }).fuente, "provisional-por-valor-invalido");
});
