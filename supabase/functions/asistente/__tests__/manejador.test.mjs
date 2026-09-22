import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  manejar, leerLimite, hayCabeceraDeSesion,
  LIMITE_PROVISIONAL, MODELO_POR_DEFECTO, MOTIVOS,
} from "../manejador.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TUBERÍA DEL ASISTENTE: sesión, cupo y clave.
 *
 * Se monta el manejador de verdad —el mismo que corre en la Edge Function— con
 * la base y el modelo simulados. Así se prueban los tres rechazos sin una base
 * de datos, sin desplegar nada y SIN GASTAR UN SOLO TOKEN, que además es lo
 * único posible mientras no haya créditos de API contratados.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAVE_DE_MENTIRA = "sk-ant-api03-ESTA-CLAVE-ES-DE-MENTIRA-SOLO-PARA-LA-PRUEBA";
const ENV = { ANTHROPIC_API_KEY: CLAVE_DE_MENTIRA };

/** Una petición como la que manda el sitio. `sesion: false` quita la cabecera. */
const peticion = ({ sesion = true, cuerpo = { mensaje: "¿Qué es la inflación?" }, metodo = "POST" } = {}) =>
  new Request("https://x.functions.supabase.co/asistente", {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(sesion ? { Authorization: "Bearer un-jwt-de-estudiante" } : {}),
    },
    ...(metodo === "POST" ? { body: JSON.stringify(cuerpo) } : {}),
  });

/** Dependencias por defecto: la base deja pasar y el modelo contesta. */
function deps(cambios = {}) {
  const llamadas = { cupo: [], modelo: [] };
  const base = {
    env: ENV,
    async consumirCupo(limite) {
      llamadas.cupo.push(limite);
      return { permitido: true, usadas: 1, limite };
    },
    async llamarModelo(args) {
      llamadas.modelo.push(args);
      return "La inflación es la subida sostenida de los precios.";
    },
    registrar() {},
  };
  return { deps: { ...base, ...cambios }, llamadas };
}

/* ─────────────────────── sesión ─────────────────────── */

test("sin cabecera de sesión, la función rechaza con 401 y no toca nada más", async () => {
  const { deps: d, llamadas } = deps();
  const r = await manejar(peticion({ sesion: false }), d);

  assert.equal(r.status, 401);
  assert.equal((await r.json()).error, MOTIVOS.sinSesion);
  /* Y lo que más importa: NI se consultó el cupo NI se llamó al modelo. */
  assert.deepEqual(llamadas.cupo, [], "sin sesión no se gasta cupo");
  assert.deepEqual(llamadas.modelo, [], "sin sesión no se llama al modelo");
});

test("una cabecera que no es «Bearer algo» tampoco pasa", () => {
  const sinNada = new Request("https://x/", { method: "POST" });
  assert.equal(hayCabeceraDeSesion(sinNada), false);
  const vacia = new Request("https://x/", { method: "POST", headers: { Authorization: "Bearer" } });
  assert.equal(hayCabeceraDeSesion(vacia), false);
  const otra = new Request("https://x/", { method: "POST", headers: { Authorization: "Basic abc" } });
  assert.equal(hayCabeceraDeSesion(otra), false);
  const buena = new Request("https://x/", { method: "POST", headers: { Authorization: "Bearer xyz" } });
  assert.equal(hayCabeceraDeSesion(buena), true);
});

test("si la base dice que no hay sesión (42501), también es 401 y no un 500", async () => {
  const { deps: d, llamadas } = deps({
    async consumirCupo() { const e = new Error("Se requiere sesión"); e.code = "42501"; throw e; },
  });
  const r = await manejar(peticion(), d);
  assert.equal(r.status, 401);
  assert.deepEqual(llamadas.modelo, [], "no se llama al modelo");
});

/* ─────────────────────── el límite ─────────────────────── */

test("al pasarse del límite, la invocación siguiente se rechaza con 429", async () => {
  const { deps: d, llamadas } = deps({
    async consumirCupo(limite) { return { permitido: false, usadas: limite, limite }; },
  });
  const r = await manejar(peticion(), d);

  assert.equal(r.status, 429);
  const cuerpo = await r.json();
  assert.equal(cuerpo.error, MOTIVOS.limite);
  assert.equal(cuerpo.usadas, LIMITE_PROVISIONAL);
  assert.equal(cuerpo.limite, LIMITE_PROVISIONAL);
  /* El modelo NO se llama: el límite existe para no gastar, no para avisar. */
  assert.deepEqual(llamadas.modelo, [], "pasado el límite no se llama al modelo");
});

test("el límite llega desde el entorno, no está escrito en el código", async () => {
  const { deps: d, llamadas } = deps({ env: { ...ENV, ASISTENTE_LIMITE_DIARIO: "37" } });
  await manejar(peticion(), d);
  assert.deepEqual(llamadas.cupo, [37], "se le pasó a la base el número del secreto");
});

test("leerLimite: el secreto manda; si falta o viene roto, cae en el provisional", () => {
  assert.deepEqual(leerLimite({ ASISTENTE_LIMITE_DIARIO: "25" }), { limite: 25, fuente: "secreto" });
  assert.deepEqual(leerLimite({ ASISTENTE_LIMITE_DIARIO: "0" }), { limite: 0, fuente: "secreto" });
  assert.equal(leerLimite({}).limite, LIMITE_PROVISIONAL);
  assert.equal(leerLimite({}).fuente, "provisional");
  for (const malo of ["", "   ", "muchas", "-3", "2.5"]) {
    const r = leerLimite({ ASISTENTE_LIMITE_DIARIO: malo });
    assert.equal(r.limite, LIMITE_PROVISIONAL, `«${malo}» no puede pasar por límite`);
    assert.match(r.fuente, /provisional/);
  }
});

/* ─────────────────────── la clave y el camino feliz ─────────────────────── */

test("sin la clave del servidor no se gasta cupo: se avisa y se para", async () => {
  const { deps: d, llamadas } = deps({ env: {} });
  const r = await manejar(peticion(), d);
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, MOTIVOS.sinClave);
  assert.deepEqual(llamadas.cupo, [], "la clave se comprueba ANTES de cobrar una del cupo");
});

test("camino feliz: consume cupo, llama al modelo y devuelve su texto", async () => {
  const { deps: d, llamadas } = deps();
  const r = await manejar(peticion(), d);

  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.respuesta, "La inflación es la subida sostenida de los precios.");
  assert.equal(cuerpo.modelo, MODELO_POR_DEFECTO, "Haiku 4.5, el modelo de prueba de la tubería");
  assert.equal(cuerpo.usadas, 1);
  assert.deepEqual(llamadas.cupo, [LIMITE_PROVISIONAL]);
  assert.equal(llamadas.modelo[0].mensaje, "¿Qué es la inflación?");
});

test("el id del modelo de prueba no lleva sufijo de fecha", () => {
  assert.equal(MODELO_POR_DEFECTO, "claude-haiku-4-5");
  assert.ok(!/\d{8}$/.test(MODELO_POR_DEFECTO), "los ids del catálogo van sin fecha");
});

test("una pregunta vacía no llega ni a la base ni al modelo", async () => {
  for (const cuerpo of [{}, { mensaje: "" }, { mensaje: "   " }, { mensaje: 42 }]) {
    const { deps: d, llamadas } = deps();
    const r = await manejar(peticion({ cuerpo }), d);
    assert.equal(r.status, 400, JSON.stringify(cuerpo));
    assert.deepEqual(llamadas.cupo, []);
  }
});

test("GET no se atiende: esta función solo recibe POST", async () => {
  const { deps: d } = deps();
  const r = await manejar(peticion({ metodo: "GET" }), d);
  assert.equal(r.status, 405);
});

/* ─────────────────────── la clave nunca sale ─────────────────────── */

test("la clave no aparece en NINGUNA respuesta, ni cuando el modelo revienta", async () => {
  const casos = [
    ["camino feliz", deps()],
    ["modelo caído", deps({ async llamarModelo() { throw new Error("401 invalid x-api-key: " + CLAVE_DE_MENTIRA); } })],
    ["base caída", deps({ async consumirCupo() { throw new Error("fallo con " + CLAVE_DE_MENTIRA); } })],
    ["sin clave", deps({ env: {} })],
  ];
  for (const [nombre, { deps: d }] of casos) {
    const r = await manejar(peticion(), d);
    const texto = await r.text();
    assert.ok(!texto.includes(CLAVE_DE_MENTIRA), `${nombre}: la clave se coló en la respuesta`);
    assert.ok(!texto.includes("sk-ant-"), `${nombre}: patrón de clave en la respuesta`);
  }
});

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Y LA CLAVE TAMPOCO PUEDE ESTAR EN EL BUNDLE DEL NAVEGADOR.
 *
 * Vite incrusta en el bundle TODO lo que empiece por VITE_, así que la forma de
 * que esta clave acabara publicada sería llamarla VITE_ALGO. Esta prueba mira
 * las dos cosas: que nadie la nombre así en el código, y —si dist/ existe— que
 * no haya ni rastro de un patrón de clave de Anthropic dentro de lo que se
 * sirve al navegador.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function archivosDe(dir) {
  const salida = [];
  const recorrer = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) recorrer(p);
      else salida.push(p);
    }
  };
  recorrer(dir);
  return salida;
}

test("ninguna variable VITE_* nombra la clave de Anthropic", () => {
  const sospechosos = [];
  for (const p of archivosDe(join(RAIZ, "src"))) {
    if (/VITE_[A-Z_]*ANTHROPIC|VITE_[A-Z_]*API_KEY/i.test(readFileSync(p, "utf8"))) sospechosos.push(p);
  }
  const ejemplo = readFileSync(join(RAIZ, ".env.example"), "utf8");
  assert.ok(!/ANTHROPIC/i.test(ejemplo), ".env.example no puede pedir la clave: es del servidor");
  assert.deepEqual(sospechosos, [], "una VITE_* con la clave la publicaría en el bundle");
});

test("la clave de Anthropic no aparece en el bundle servido al navegador", () => {
  const dist = join(RAIZ, "dist");
  if (!existsSync(dist)) {
    /*
     * En CI las pruebas corren ANTES del build, así que aquí no hay dist/. No
     * se finge que pasó: se dice que no había nada que mirar, y la comprobación
     * de verdad se hace con `npm run build` delante (ver el README de la
     * función). La prueba de arriba —ninguna VITE_* con la clave— sí corre
     * siempre, y es la que cierra la única puerta por la que podría colarse.
     */
    console.log("    (no hay dist/: se comprueba tras `npm run build`)");
    return;
  }
  const patrones = [/sk-ant-[A-Za-z0-9_-]{8,}/, /ANTHROPIC_API_KEY/];
  const culpables = [];
  for (const p of archivosDe(dist)) {
    let texto;
    try { texto = readFileSync(p, "utf8"); } catch { continue; }
    for (const re of patrones) {
      if (re.test(texto)) culpables.push(`${p.slice(RAIZ.length)} · ${re}`);
    }
  }
  assert.deepEqual(culpables, [], "hay rastro de la clave en lo que se sirve al navegador");
});
