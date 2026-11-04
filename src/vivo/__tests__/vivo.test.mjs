import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { armarPreguntas, temasEnVivo, MATERIAS_EN_VIVO, aPregunta } from "../banco.js";
import { limpiarCodigo, restanteMs, desfaseDe, mensajeDeError, LETRAS } from "../datos.js";
import { VISTAS, interpretar } from "../../ruta.js";

/* Un azar con semilla, para que la prueba diga siempre lo mismo. */
const semilla = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

test("★ cada materia de la clase en vivo tiene temas con preguntas", () => {
  for (const m of MATERIAS_EN_VIVO) {
    const temas = temasEnVivo(m);
    assert.ok(temas.length >= 3, `${m} tiene ${temas.length} temas`);
    for (const t of temas) assert.ok(t.disponibles > 0 && t.titulo && t.titulo !== t.id, `${m}/${t.id} sin título o sin preguntas`);
  }
});

test("★ las preguntas que viajan a la sala son las que la base acepta: 2 a 8 opciones, la correcta entre ellas, sin funciones", () => {
  for (const m of MATERIAS_EN_VIVO) {
    for (const t of temasEnVivo(m)) {
      const ps = armarPreguntas(m, t.id, 30, semilla(7));
      assert.equal(ps.length, Math.min(30, t.disponibles));
      assert.equal(new Set(ps.map((p) => p.clave)).size, ps.length, `${t.id}: una pregunta repetida`);
      for (const p of ps) {
        assert.ok(p.enunciado.trim(), `${p.clave} sin enunciado`);
        assert.ok(p.opciones.length >= 2 && p.opciones.length <= 8, `${p.clave}: ${p.opciones.length} opciones`);
        assert.ok(p.opciones.some((o) => o.id === p.correcta), `${p.clave}: la correcta no está entre las opciones`);
        assert.equal(new Set(p.opciones.map((o) => o.id)).size, p.opciones.length, `${p.clave}: ids repetidos`);
        assert.doesNotThrow(() => JSON.stringify(p));
        assert.deepEqual(JSON.parse(JSON.stringify(p)), p, `${p.clave}: trae algo que no es dato`);
      }
    }
  }
});

test("★ se prefieren las preguntas de hasta 6 opciones; las de 8 solo completan", () => {
  for (const m of MATERIAS_EN_VIVO) {
    for (const t of temasEnVivo(m)) {
      const ps = armarPreguntas(m, t.id, 5, semilla(11));
      const largas = armarPreguntas(m, t.id, 999, semilla(11)).filter((p) => p.opciones.length > 6).length;
      const cortasDisponibles = t.disponibles - largas;
      if (cortasDisponibles >= 5) assert.ok(ps.every((p) => p.opciones.length <= 6), `${t.id}: salió una de 8 habiendo cortas`);
    }
  }
});

test("★ barajar las opciones no cambia cuál es la correcta", () => {
  const item = { clave: "x:1", enunciado: "¿?", opciones: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }, { id: "c", texto: "C" }], correcta: "b", barajarOpciones: true, devolucion: () => [] };
  for (let s = 1; s < 20; s++) {
    const p = aPregunta(item, semilla(s));
    assert.equal(p.correcta, "b");
    assert.equal(p.opciones.find((o) => o.id === "b").texto, "B");
    assert.equal(p.devolucion, undefined);
  }
});

test("★ el código: solo cifras, máximo 6", () => {
  assert.equal(limpiarCodigo(" 882 915 "), "882915");
  assert.equal(limpiarCodigo("88-29-15-77"), "882915");
  assert.equal(limpiarCodigo(null), "");
});

test("★ el reloj usa la hora del servidor, no la del celular", () => {
  const estado = { estado: "pregunta", inicio: "2026-11-04T20:00:00.000Z", duracion_s: 30, ahora: "2026-11-04T20:00:05.000Z" };
  /* El celular va 2 minutos atrasado: sin el desfase creería que le quedan 2 min 25 s. */
  const celular = Date.parse("2026-11-04T19:58:05.000Z");
  const d = desfaseDe(estado, celular);
  assert.equal(restanteMs(estado, d, celular), 25000);
  assert.equal(restanteMs({ ...estado, estado: "resultados" }, d, celular), 0);
  assert.equal(restanteMs(estado, d, celular + 60000), 0);
});

test("★ los errores se dicen en palabras del estudiante", () => {
  assert.match(mensajeDeError({ message: "No hay ninguna clase abierta con ese código" }), /Revísalo en el tablero/);
  assert.match(mensajeDeError({ message: "algo raro" }), /Inténtalo otra vez/);
});

test("★ las dos rutas existen y el código viaja en la dirección", () => {
  assert.ok(VISTAS.has("vivo") && VISTAS.has("vivo-profesor"));
  assert.deepEqual(interpretar("#/vivo/882915"), { vista: "vivo", modo: null, extra: "882915" });
  assert.equal(LETRAS.length, 8);
});

test("★ movimiento de la clase en vivo: una curva, solo transform y opacity, nada en bucle, con movimiento reducido", () => {
  const f = readFileSync(new URL("../estilo.js", import.meta.url), "utf8");
  const css = f.match(/export const CSS_VIVO = `([\s\S]*?)`;/)[1];
  assert.doesNotMatch(css, /infinite|\bease\b|\blinear\b/);
  for (const m of css.matchAll(/transition: ([^;]+);/g)) for (const parte of m[1].split(",")) assert.match(parte.trim(), /^(transform|opacity|none)\b/, parte);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("★ el celular del estudiante no carga los bancos de preguntas (solo el tablero los necesita)", () => {
  const est = readFileSync(new URL("../../components/vivo/VivoEstudiante.jsx", import.meta.url), "utf8");
  const piezas = readFileSync(new URL("../../components/vivo/piezas.jsx", import.meta.url), "utf8");
  for (const f of [est, piezas]) {
    assert.doesNotMatch(f, /banco\.js|VivoProfesor\.jsx|repaso\//);
  }
});

test("★ en vivo la correcta no se queda en la A: las opciones se barajan siempre", () => {
  let enA = 0, total = 0;
  for (const m of MATERIAS_EN_VIVO) for (const t of temasEnVivo(m)) for (const p of armarPreguntas(m, t.id, 30, semilla(5))) {
    total++;
    if (p.opciones[0].id === p.correcta) enA++;
  }
  assert.ok(enA / total < 0.33, `la correcta quedó en la A ${enA} de ${total} veces`);
});
