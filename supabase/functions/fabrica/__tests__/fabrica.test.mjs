import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PIEZAS_POR_LOTE, LLAMADAS_POR_ENCARGO, LIMITE_PROVISIONAL, MAX_TOKENS, MAX_ARCHIVOS, MOTIVOS,
  sistemaPlan, peticionPlan, leerPlan,
  sistemaPieza, peticionPieza, leerPieza,
  extraerObjeto, limpiarPieza, revisarArchivos, leerLimite,
} from "../fabrica.js";
import { manejar, hayCabeceraDeSesion } from "../manejador.js";

/*
 * Lo que valida la escena por dentro ya se prueba en escena.test.mjs. Aquí
 * solo se comprueba lo que la fábrica hace con ella: que una pieza sin escena
 * no entre, que cada pasada pida lo suyo y que ninguna puerta se abra sola.
 */

/* Una escena mínima que se sostiene: tres partes y un paso por parte, que es
 * lo que `amarrarPasos` exige para dar los pasos por buenos. */
const ESCENA = {
  arquetipo: "flujo",
  partes: [
    { id: "debe", etiqueta: "Debe", fila: 0, col: 0 },
    { id: "haber", etiqueta: "Haber", fila: 0, col: 1 },
    { id: "saldo", etiqueta: "Saldo", fila: 1, col: 0 },
  ],
  enlaces: [{ de: "debe", a: "saldo" }, { de: "haber", a: "saldo" }],
};

/* Una pieza bien formada, para no repetirla en cada prueba. */
const BUENA = {
  titulo: "De qué está hecha una cuenta",
  objetivo: "Distinguir debe de haber sin confundirlos con aumentar y disminuir.",
  nombres: [
    { termino: "Debe", definicion: "El lado izquierdo de la cuenta." },
    { termino: "Haber", definicion: "El lado derecho de la cuenta." },
    { termino: "Saldo", definicion: "La diferencia entre los dos movimientos." },
  ],
  escena: ESCENA,
  pasos: [
    { resaltar: ["debe"], texto: "Entran 200 mil pesos por el lado izquierdo." },
    { resaltar: ["haber"], texto: "Salen 50 mil por el lado derecho." },
    { resaltar: ["saldo"], texto: "Quedan 150 mil: ese es el saldo." },
  ],
  pregunta: "¿Por qué debe y haber no significan aumentar y disminuir?",
  respuesta: "Porque son lados, no efectos: qué pasa depende del tipo de cuenta.",
};

const LECTURA = {
  tema: "Las cuentas y sus dos lados.",
  terminos: [
    { termino: "Cuenta", idea: "Una libreta por cada cosa que se mueve." },
    { termino: "Debe", idea: "El lado izquierdo de esa libreta." },
    { termino: "Haber", idea: "El lado derecho de esa libreta." },
  ],
  cifras: ["Un arriendo de 900 mil al mes."],
  relaciones: ["Si sube el debe de caja, sube el efectivo."],
  supuesto: ["Que el estudiante ya sabe qué es un activo."],
};

const ACTIVIDAD = {
  titulo: "De qué está hecha una cuenta",
  objetivo: "Distinguir debe de haber.",
  terminos: ["Cuenta", "Debe", "Haber"],
  arquetipo: "flujo",
  porque: "Es un recorrido de lo que entra a lo que queda.",
};

const PLAN = { lectura: LECTURA, actividades: [ACTIVIDAD, ACTIVIDAD, ACTIVIDAD] };

const peticion = (cuerpo, { metodo = "POST", auth = "Bearer abc" } = {}) => ({
  method: metodo,
  headers: { get: (k) => (k.toLowerCase() === "authorization" ? auth : null) },
  json: async () => cuerpo,
});

const deps = (extra = {}) => ({
  env: { ANTHROPIC_API_KEY: "sk-prueba" },
  consumirCupo: async (l) => ({ permitido: true, usadas: 1, limite: l }),
  llamarModelo: async () => JSON.stringify(PLAN),
  guardar: async ({ piezas }) => piezas.length,
  ...extra,
});

/* El cuerpo de una pasada de pieza, que necesita la lectura y su renglón. */
const cuerpoPieza = (extra = {}) => ({
  materia: "contabilidad",
  pasada: "pieza",
  lectura: LECTURA,
  actividad: ACTIVIDAD,
  ...extra,
});

/* ═══════════ LO QUE SE LE PIDE AL MODELO ═══════════ */

test("ninguna de las dos pasadas puede copiar frases del material", () => {
  for (const s of [sistemaPlan({ materia: "contabilidad" }), sistemaPieza({ materia: "contabilidad" })]) {
    assert.match(s, /NUNCA copies frases/);
    assert.match(s, /el sitio es público/);
  }
});

test("la pasada del plan no escribe actividades y la de pieza escribe una sola", () => {
  assert.match(sistemaPlan({ materia: "contabilidad" }), /NO ESCRIBE ACTIVIDADES/);
  assert.match(sistemaPieza({ materia: "contabilidad" }), /UNA SOLA ACTIVIDAD/);
});

test("el plan pide tantas actividades como trae el lote", () => {
  assert.match(sistemaPlan({ materia: "contabilidad" }), new RegExp(`${PIEZAS_POR_LOTE} actividades`));
});

test("la pasada de pieza le explica las cinco figuras, que es de donde sale la capa 2", () => {
  const s = sistemaPieza({ materia: "contabilidad" });
  assert.match(s, /LA ESCENA/);
  for (const nombre of ["flujo", "balanza", "cuentaT", "escalones", "linea"]) {
    assert.ok(s.includes(nombre), `falta la figura ${nombre}`);
  }
});

test("un PDF viaja como documento y el texto como texto, y solo en el plan", () => {
  const { messages } = peticionPlan({
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
  const { messages } = peticionPlan({ materia: "macroeconomia", mensaje: "", archivos: [] });
  assert.match(messages[0].content[0].text, /no escribió nada/);
});

test("el archivo no vuelve a viajar: la pieza se escribe desde la lectura", () => {
  const { messages } = peticionPieza({ materia: "contabilidad", lectura: LECTURA, actividad: ACTIVIDAD });
  assert.equal(messages[0].content.length, 1, "un solo bloque de texto, ningún documento");
  const texto = messages[0].content[0].text;
  assert.match(texto, /no tienes el archivo/);
  assert.match(texto, /El lado izquierdo de esa libreta/, "la lectura entera viaja dentro");
  assert.match(texto, /De qué está hecha una cuenta/, "y su renglón del plan");
});

test("lo que pidió el profesor sigue pesando en la pasada de pieza", () => {
  const { messages } = peticionPieza({
    materia: "contabilidad", lectura: LECTURA, actividad: ACTIVIDAD, mensaje: "con cifras en pesos",
  });
  assert.match(messages[0].content[0].text, /con cifras en pesos/);
});

/* ═══════════ LO QUE VUELVE ═══════════ */

test("el objeto se saca aunque venga con valla o con cortesía alrededor", () => {
  assert.deepEqual(extraerObjeto('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extraerObjeto('Claro, aquí va:\n{"a":1}\nEspero que sirva.'), { a: 1 });
  assert.equal(extraerObjeto("no hay nada aquí"), null);
  assert.equal(extraerObjeto(""), null);
  /* Si el modelo contesta con una lista, se rescata el objeto de dentro antes
     que perder la llamada entera: lo que no encaje se cae luego en el molde. */
  assert.deepEqual(extraerObjeto('[{"a":1}]'), { a: 1 });
});

test("un plan sin JSON legible se distingue de uno que vino vacío", () => {
  const ilegible = leerPlan("el modelo se puso a conversar", PIEZAS_POR_LOTE);
  assert.equal(ilegible.ilegible, true);
  assert.equal(ilegible.plan, null);

  const vacio = leerPlan(JSON.stringify({ lectura: { tema: "algo" }, actividades: [] }), PIEZAS_POR_LOTE);
  assert.equal(vacio.ilegible, false);
  assert.equal(vacio.plan, null);
});

test("sin términos no hay lectura, y sin lectura las piezas se escribirían del aire", () => {
  const pocos = { ...PLAN, lectura: { ...LECTURA, terminos: LECTURA.terminos.slice(0, 2) } };
  assert.equal(leerPlan(JSON.stringify(pocos), PIEZAS_POR_LOTE).plan, null);
});

test("el plan no devuelve más actividades que las del lote", () => {
  const demasiadas = { ...PLAN, actividades: Array(PIEZAS_POR_LOTE + 3).fill(ACTIVIDAD) };
  const { plan } = leerPlan(JSON.stringify(demasiadas), PIEZAS_POR_LOTE);
  assert.equal(plan.actividades.length, PIEZAS_POR_LOTE);
});

test("una figura inventada se olvida, pero la actividad se conserva", () => {
  const raro = { ...PLAN, actividades: [{ ...ACTIVIDAD, arquetipo: "mandala" }] };
  const { plan } = leerPlan(JSON.stringify(raro), PIEZAS_POR_LOTE);
  assert.equal(plan.actividades[0].arquetipo, null);
  assert.equal(plan.actividades[0].titulo, ACTIVIDAD.titulo);
});

test("una pieza sin escena no se guarda: saldría como puro texto", () => {
  const { escena, ...sinEscena } = BUENA;
  assert.equal(limpiarPieza(sinEscena), null);
  assert.equal(limpiarPieza({ ...BUENA, escena: {} }), null, "una escena vacía tampoco es una escena");
  assert.equal(limpiarPieza({ ...BUENA, escena: { ...ESCENA, arquetipo: "mandala" } }), null, "ni una figura que nadie sabe pintar");
});

test("unos pasos que no encienden nada de la escena tumban la pieza entera", () => {
  const sueltos = BUENA.pasos.map((p) => ({ ...p, resaltar: ["inexistente"] }));
  assert.equal(limpiarPieza({ ...BUENA, pasos: sueltos }), null);
  assert.equal(limpiarPieza({ ...BUENA, pasos: [] }), null, "sin pasos no hay capa 2");
});

test("una parte que ningún paso enciende es una parte que nadie mira", () => {
  const sinSaldo = BUENA.pasos.slice(0, 2).concat({ resaltar: ["debe"], texto: "Y se vuelve a mirar el debe." });
  assert.equal(limpiarPieza({ ...BUENA, pasos: sinSaldo }), null);
});

test("una pieza sin lo mínimo se descarta, no se arregla", () => {
  assert.equal(limpiarPieza(null), null);
  assert.equal(limpiarPieza([BUENA]), null, "una lista no es una pieza");
  assert.equal(limpiarPieza({ ...BUENA, titulo: "  " }), null, "sin título");
  assert.equal(limpiarPieza({ ...BUENA, pregunta: "" }), null, "sin pregunta");
  assert.equal(limpiarPieza({ ...BUENA, nombres: [BUENA.nombres[0]] }), null, "un solo término no es una pieza");
});

test("la pieza buena queda con su escena, sus pasos amarrados y su marca de origen", () => {
  const p = limpiarPieza(BUENA);
  assert.equal(p.generada, true);
  assert.equal(p.escena.arquetipo, "flujo");
  assert.equal(p.pasos.length, 3);
  assert.deepEqual(p.pasos.map((x) => x.resaltar), [["debe"], ["haber"], ["saldo"]]);
});

test("una pieza ilegible se distingue de una que no pasó el molde", () => {
  const ilegible = leerPieza("el modelo se puso a conversar");
  assert.equal(ilegible.ilegible, true);
  assert.equal(ilegible.pieza, null);

  const { escena, ...sinEscena } = BUENA;
  const mala = leerPieza(JSON.stringify(sinEscena));
  assert.equal(mala.ilegible, false);
  assert.equal(mala.pieza, null);
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

/* ═══════════ EL CUPO ═══════════ */

test("el cupo se cuenta en llamadas, que son el plan más una por actividad", () => {
  assert.equal(LLAMADAS_POR_ENCARGO, 1 + PIEZAS_POR_LOTE);
  /* El provisional sigue dando los mismos ocho encargos diarios de antes. */
  assert.equal(LIMITE_PROVISIONAL / LLAMADAS_POR_ENCARGO, 8);
});

test("el límite sale del secreto, y si no, del provisional", () => {
  assert.deepEqual(leerLimite({ FABRICA_LIMITE_DIARIO: "20" }), { limite: 20, fuente: "secreto" });
  assert.deepEqual(leerLimite({}), { limite: LIMITE_PROVISIONAL, fuente: "provisional" });
  assert.equal(leerLimite({ FABRICA_LIMITE_DIARIO: "muchas" }).fuente, "provisional-por-valor-invalido");
  assert.equal(leerLimite({ FABRICA_LIMITE_DIARIO: "-3" }).fuente, "provisional-por-valor-invalido");
});

/* ═══════════ LAS PUERTAS ═══════════ */

test("solo se atiende por POST", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }, { metodo: "GET" }), deps());
  assert.equal(r.status, 405);
  assert.equal(r.headers.get("Allow"), "POST");
});

test("sin cabecera de sesión no se mira ni el cuerpo", async () => {
  assert.equal(hayCabeceraDeSesion({ headers: { get: () => "" } }), false);
  assert.equal(hayCabeceraDeSesion({ headers: { get: () => "Bearer abc" } }), true);
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

test("un cuerpo que no es JSON, o sin materia, no pasa de la puerta", async () => {
  const roto = { method: "POST", headers: { get: () => "Bearer abc" }, json: async () => { throw new Error("no"); } };
  assert.equal((await manejar(roto, deps())).status, 400);
  assert.equal((await manejar(peticion({ mensaje: "y" }), deps())).status, 400);
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

test("pedir una pieza sin la lectura o sin su renglón del plan no gasta cupo", async () => {
  let cobrado = false;
  const vigilado = { consumirCupo: async () => { cobrado = true; return { permitido: true }; } };

  const sinLectura = await manejar(peticion(cuerpoPieza({ lectura: undefined })), deps(vigilado));
  assert.equal(sinLectura.status, 400);
  assert.equal((await sinLectura.json()).error, MOTIVOS.sinEncargo);

  const sinActividad = await manejar(peticion(cuerpoPieza({ actividad: undefined })), deps(vigilado));
  assert.equal(sinActividad.status, 400);

  const lecturaDeMentira = await manejar(peticion(cuerpoPieza({ lectura: "un texto" })), deps(vigilado));
  assert.equal(lecturaDeMentira.status, 400);

  assert.equal(cobrado, false);
});

test("quien no es docente recibe 403, no 500", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    consumirCupo: async () => { const e = new Error("no autorizado"); e.code = "42501"; throw e; },
  }));
  assert.equal(r.status, 403);
});

test("si la base no contesta el cupo, no se llama al modelo a ciegas", async () => {
  let llamado = false;
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    consumirCupo: async () => { throw new Error("se cayó la base"); },
    llamarModelo: async () => { llamado = true; return JSON.stringify(PLAN); },
  }));
  assert.equal(r.status, 503);
  assert.equal(llamado, false);
});

test("pasado el cupo, 429 con los números", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    consumirCupo: async () => ({ permitido: false, usadas: 33, limite: 32 }),
  }));
  assert.equal(r.status, 429);
  assert.deepEqual(await r.json(), { error: MOTIVOS.limite, usadas: 33, limite: 32 });
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

/* ═══════════ LA PASADA DEL PLAN ═══════════ */

test("por defecto se planea: sin decir pasada, lo que vuelve es el plan", async () => {
  const r = await manejar(peticion({ materia: "contabilidad", mensaje: "capítulo 2" }), deps());
  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.pasada, "plan");
  assert.equal(cuerpo.plan.actividades.length, PIEZAS_POR_LOTE);
  assert.equal(cuerpo.plan.lectura.terminos.length, LECTURA.terminos.length);
  assert.equal(cuerpo.pieza, undefined, "el plan todavía no es ninguna actividad");
});

test("el plan no guarda nada: hasta que no hay actividad no hay borrador", async () => {
  let guardo = false;
  const r = await manejar(peticion({ materia: "contabilidad", mensaje: "capítulo 2" }), deps({
    guardar: async () => { guardo = true; return 1; },
  }));
  assert.equal(r.status, 200);
  assert.equal(guardo, false);
});

test("un plan que no se entiende da 422 y deja rastro en el registro", async () => {
  let registrado = "";
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    llamarModelo: async () => "aquí tienes unas ideas sueltas",
    registrar: (_n, t) => { registrado = t; },
  }));
  assert.equal(r.status, 422);
  assert.equal((await r.json()).error, MOTIVOS.vacio);
  assert.match(registrado, /JSON legible/);
});

test("un plan sin términos da 422 aunque el JSON esté perfecto", async () => {
  const r = await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    llamarModelo: async () => JSON.stringify({ ...PLAN, lectura: { tema: "algo", terminos: [] } }),
  }));
  assert.equal(r.status, 422);
});

/* ═══════════ LA PASADA DE LA PIEZA ═══════════ */

test("la pasada de pieza guarda la actividad y la devuelve para enseñarla", async () => {
  let recibido = null;
  const r = await manejar(peticion(cuerpoPieza({ mensaje: "capítulo 2" })), deps({
    llamarModelo: async () => JSON.stringify(BUENA),
    guardar: async (x) => { recibido = x; return x.piezas.length; },
  }));
  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.pasada, "pieza");
  assert.equal(cuerpo.creadas, 1);
  assert.equal(cuerpo.pieza.titulo, BUENA.titulo);
  assert.equal(cuerpo.pieza.escena.arquetipo, "flujo");
  assert.equal(cuerpo.plan, undefined, "la pieza ya no devuelve el plan");
  assert.equal(recibido.materia, "contabilidad");
  assert.equal(recibido.piezas.length, 1, "se guarda de una en una");
  assert.equal(recibido.encargo, "capítulo 2", "lo que pidió queda con el borrador");
});

test("una pieza que no pasa el molde da 422 y no se guarda a medias", async () => {
  let guardo = false;
  const { escena, ...sinEscena } = BUENA;
  const r = await manejar(peticion(cuerpoPieza()), deps({
    llamarModelo: async () => JSON.stringify(sinEscena),
    guardar: async () => { guardo = true; return 1; },
  }));
  assert.equal(r.status, 422);
  assert.equal((await r.json()).error, MOTIVOS.vacio);
  assert.equal(guardo, false, "sin escena no se publica nada");
});

test("si no se puede guardar, el profesor no se queda creyendo que ya está", async () => {
  const r = await manejar(peticion(cuerpoPieza()), deps({
    llamarModelo: async () => JSON.stringify(BUENA),
    guardar: async () => { throw new Error("la base dijo no"); },
  }));
  assert.equal(r.status, 503);
});

test("guardar sin ser docente también es 403", async () => {
  const r = await manejar(peticion(cuerpoPieza()), deps({
    llamarModelo: async () => JSON.stringify(BUENA),
    guardar: async () => { const e = new Error("no autorizado"); e.code = "42501"; throw e; },
  }));
  assert.equal(r.status, 403);
});

/* ═══════════ LO QUE SE LE DICE AL PROVEEDOR ═══════════ */

test("las dos pasadas van al mismo modelo y con todo el presupuesto de tokens", async () => {
  const vistos = [];
  const espia = { llamarModelo: async (x) => { vistos.push(x); return JSON.stringify(x.system.includes("NO ESCRIBE") ? PLAN : BUENA); } };

  await manejar(peticion({ materia: "contabilidad", mensaje: "capítulo 2" }), deps(espia));
  await manejar(peticion(cuerpoPieza()), deps(espia));

  assert.equal(vistos.length, 2);
  for (const v of vistos) {
    assert.equal(v.maxTokens, MAX_TOKENS);
    assert.equal(v.modelo, "claude-sonnet-5-5");
  }
});

test("el modelo del secreto manda sobre el de por defecto", async () => {
  let usado = "";
  await manejar(peticion({ materia: "x", mensaje: "y" }), deps({
    env: { ANTHROPIC_API_KEY: "sk-prueba", FABRICA_MODELO: "claude-opus-4-9" },
    llamarModelo: async ({ modelo }) => { usado = modelo; return JSON.stringify(PLAN); },
  }));
  assert.equal(usado, "claude-opus-4-9");
});
