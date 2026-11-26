import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { SIMULADORES, OFICINAS, AVISO_IA, veredictoLocal, explicacionLocal } from "../simulador/escenas.js";
import { ESCENARIOS } from "../../../supabase/functions/simulador/manejador.js";
import { ILUSTRADOS } from "../comun/ilustrados.jsx";
import { MASCOTAS } from "../comun/mascotas.jsx";
import { TEMAS_2026 } from "../TemaMacro2026.jsx";

/* Las reglas de texto de la REGLA MAESTRA, medidas sobre cada simulador. */
const palabras = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
const NOMBRE_LARGO = "Valdoria del Norte";

test("el letrero de IA dice exactamente lo que pidió Mateo", () => {
  assert.equal(AVISO_IA, "Esta actividad tiene inteligencia artificial aplicada");
});

test("cada oficina: contexto ≤ 30 palabras, rol ≤ 15, mascota, poses y fondo que existen", () => {
  for (const [id, o] of Object.entries(OFICINAS)) {
    assert.ok(palabras(o.intro) <= 30, `${id}: intro de ${palabras(o.intro)}`);
    assert.ok(palabras(o.rol) <= 15, `${id}: rol`);
    const m = MASCOTAS[o.companera.mascota];
    assert.ok(m, `${id}: mascota ${o.companera.mascota}`);
    for (const pose of Object.values(o.companera.poses)) assert.ok(m.poses[pose], `${id}: pose ${pose}`);
    assert.ok(existsSync(new URL(`../../../public${o.fondo}`, import.meta.url)), `${id}: fondo`);
  }
});

test("hay un simulador en el sitio por cada escenario del servidor, y ninguno de más", () => {
  assert.deepEqual(Object.keys(SIMULADORES).sort(), Object.keys(ESCENARIOS).sort());
});

test("toda Aprender publicable de Macro 2026 tiene su simulador", () => {
  const aprender = Object.values(TEMAS_2026).flatMap((t) => Object.keys(t.componentes)).filter((id) => /-a\d/.test(id));
  assert.deepEqual(aprender.sort(), Object.keys(SIMULADORES).sort());
});

for (const sim of Object.values(SIMULADORES)) {
  const servidor = ESCENARIOS[sim.id];

  test(`${sim.id}: capacitación ≤ 20 palabras por globo, consigna ≤ 12`, () => {
    assert.equal(sim.capacitacion.length, 4);
    for (const g of sim.capacitacion) assert.ok(palabras(g) <= 20, `«${g}» tiene ${palabras(g)}`);
    assert.ok(palabras(sim.consigna(NOMBRE_LARGO)) <= 12, sim.consigna(NOMBRE_LARGO));
    assert.equal(sim.sugerenciasIniciales.length, 2);
  });

  test(`${sim.id}: las opciones son las del servidor, ilustradas, y la elección múltiple coincide`, () => {
    assert.deepEqual(sim.opciones.map((o) => o.id), servidor.IDS);
    assert.equal(sim.multiple, servidor.MULTIPLE);
    for (const o of sim.opciones) {
      assert.ok(ILUSTRADOS[o.ilu], `${o.id}: ilustrado ${o.ilu}`);
      assert.ok(o.nombre && o.frase, o.id);
      if (o.signo) assert.ok(o.signo.length <= 3, `${o.id}: signo «${o.signo}»`);
    }
  });

  test(`${sim.id}: el archivo pasa la misma comprobación que un caso de la IA (3 datos, ids válidos, no regala la respuesta)`, () => {
    assert.ok(sim.archivo.length >= 2);
    for (const c of sim.archivo) {
      assert.equal(c.datos.length, 3, c.nombre);
      const ok = servidor.validarSalida("caso", { dice: "Aquí está el expediente.", caso: c, sugerencias: [] });
      assert.ok(ok, `${c.nombre} no pasa la comprobación del servidor`);
      assert.deepEqual(ok.caso.respuesta, c.respuesta);
    }
  });
}

test("el archivo de cada simulador varía la respuesta", () => {
  for (const sim of Object.values(SIMULADORES)) {
    const r = new Set(sim.archivo.map((c) => c.respuesta.join("+")));
    assert.ok(r.size >= 2, sim.id);
  }
});

test("veredicto local y su explicación", () => {
  const sim = SIMULADORES["pe26-a2-fiebre"];
  const v = veredictoLocal(["desempleo", "deficitFiscal"], ["desempleo"]);
  assert.equal(v.estado, "parcial");
  assert.match(explicacionLocal(sim, { nombre: "Ostrania", respuesta: ["desempleo", "deficitFiscal"] }, v), /Ostrania/);
});

test("el simulador está publicado: el tema envuelve cada Aprender y no hay interruptor de vista previa", () => {
  const tema = readFileSync(new URL("../TemaMacro2026.jsx", import.meta.url), "utf8");
  for (const id of Object.keys(SIMULADORES)) assert.match(tema, new RegExp(`conVideo\\([^\\n]*"${id}"\\)`), id);
  const conVideo = readFileSync(new URL("../comun/ConVideo.jsx", import.meta.url), "utf8");
  assert.match(conVideo, /simulador = true/);
});

test("la clave de la IA no aparece en el código del sitio", () => {
  for (const f of ["../simulador/Simulador.jsx", "../simulador/api.js", "../simulador/escenas.js", "../comun/ConVideo.jsx"]) {
    assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), /ANTHROPIC|sk-ant-/);
  }
});
