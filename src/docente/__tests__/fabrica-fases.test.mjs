import test from "node:test";
import assert from "node:assert/strict";
import { FASE, encargar } from "../fabrica.js";
import { FASES } from "../../components/docente/FermiTrabajando.jsx";

/*
 * Las fases viven en dos sitios por fuerza: el número lo produce la lógica
 * del encargo y el texto lo pinta el componente. Si se desalinean, el
 * profesor lee «escribiendo» mientras el servidor está leyendo el PDF — que
 * es peor que no decir nada, porque parece información.
 */

test("cada fase del encargo tiene su texto en la pantalla de espera", () => {
  const indices = Object.values(FASE);
  assert.equal(indices.length, FASES.length);
  for (const i of indices) assert.ok(FASES[i], `la fase ${i} no tiene texto`);
  /* Y que no haya dos fases apuntando al mismo renglón. */
  assert.equal(new Set(indices).size, indices.length);
});

test("las fases van en el orden en que ocurren", () => {
  assert.ok(FASE.leyendo < FASE.planeando);
  assert.ok(FASE.planeando < FASE.escribiendo);
  assert.ok(FASE.escribiendo < FASE.dibujando);
  assert.ok(FASE.dibujando < FASE.revisando);
});

/* ═══════════ EL ENCARGO COMPLETO, SIN SERVIDOR ═══════════ */

const LECTURA = { tema: "Las cuentas", terminos: [{ termino: "Debe", idea: "El lado izquierdo." }] };
const PLAN = {
  lectura: LECTURA,
  actividades: [{ titulo: "Uno", terminos: ["Debe"] }, { titulo: "Dos", terminos: ["Debe"] }],
};
const PIEZA = { titulo: "Uno", escena: { arquetipo: "linea", partes: [] }, pasos: [] };

/** Un cliente de mentira que cuenta lo que le piden. */
function clienteFalso(respuestas) {
  const llamadas = [];
  return {
    llamadas,
    functions: {
      invoke: async (_nombre, { body }) => {
        llamadas.push(body);
        const r = respuestas[llamadas.length - 1];
        return r?.error ? { data: null, error: r.error } : { data: r?.data, error: null };
      },
    },
  };
}

test("el archivo viaja una sola vez, en la pasada del plan", async () => {
  const cliente = clienteFalso([
    { data: { plan: PLAN } },
    { data: { pieza: PIEZA } },
    { data: { pieza: PIEZA } },
  ]);
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: "haz dos" });

  assert.equal(r.ok, true);
  assert.equal(cliente.llamadas.length, 3, "una de plan y una por actividad");
  assert.equal(cliente.llamadas[0].pasada, "plan");
  assert.ok("archivos" in cliente.llamadas[0]);
  /* Las pasadas de pieza no vuelven a ver el archivo: les basta la lectura. */
  for (const l of cliente.llamadas.slice(1)) {
    assert.equal(l.pasada, "pieza");
    assert.ok(!("archivos" in l), "la pieza no debería llevar archivos");
    assert.deepEqual(l.lectura, LECTURA);
  }
});

test("las fases se avisan en orden mientras avanza", async () => {
  const cliente = clienteFalso([{ data: { plan: PLAN } }, { data: { pieza: PIEZA } }, { data: { pieza: PIEZA } }]);
  const vistas = [];
  await encargar(cliente, { materia: "contabilidad", mensaje: "haz dos", avisar: (f) => vistas.push(f) });

  assert.equal(vistas[0], FASE.leyendo);
  assert.equal(vistas[vistas.length - 1], FASE.revisando);
  for (let i = 1; i < vistas.length; i += 1) assert.ok(vistas[i] >= vistas[i - 1], "una fase no retrocede");
});

test("si una actividad falla, las que salieron se entregan igual", async () => {
  const cliente = clienteFalso([
    { data: { plan: PLAN } },
    { data: { pieza: PIEZA } },
    { error: { context: { json: async () => ({ error: "se cayó" }) } } },
  ]);
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: "haz dos" });

  assert.equal(r.ok, true);
  assert.equal(r.creadas, 1);
  assert.equal(r.fallos.length, 1);
});

test("si el plan falla no se piden piezas: se devuelve su motivo", async () => {
  const cliente = clienteFalso([{ error: { context: { json: async () => ({ error: "sin cupo" }) } } }]);
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: "haz dos" });

  assert.equal(r.ok, false);
  assert.equal(r.motivo, "sin cupo");
  assert.equal(cliente.llamadas.length, 1, "no se gasta una llamada más tras fallar el plan");
});

test("sin mensaje ni archivos no se llama al servidor", async () => {
  const cliente = clienteFalso([]);
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: "   " });
  assert.equal(r.ok, false);
  assert.equal(cliente.llamadas.length, 0);
});
