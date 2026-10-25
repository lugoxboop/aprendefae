import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * Panel docente v1 · condición (b) de Shibukawa (#498): las cifras de la
 * primera pantalla en las capturas se recalculan aquí desde el curso falso,
 * con las mismas funciones del panel y sin pasar por el navegador:
 *   · «Actividades hechas» = 26 % (avancePorTema, solo temas visibles)
 *   · B3 = 51 % de acierto medio y 15 la terminaron (las seis más hechas,
 *     al menos 5 terminaciones, el menor acierto)
 */

const { curso } = await import("../../../scripts/t4/panel-docente/curso-falso.mjs");
const { SUBJECTS, HACER, actividadesDeTipo, desafioDe } = await import("../../data/subjects.js");
const { avancePorTema } = await import("../alertas.js");
const V1 = await import("../panelV1.js");

const MATERIA = "contabilidad";

/* Lo mismo que PanelDocente: cohorte = el grupo si lo hay, sin cuentas de prueba; actividades = Hacer + desafío. */
function primeraPantalla(escenario) {
  const C = curso(escenario);
  const grupo = C.estudiantes.filter((e) => e.en_mi_grupo);
  const cohorte = (grupo.length ? grupo : C.estudiantes).filter((e) => !e.es_prueba);
  const acumulado = new Map();
  for (const e of cohorte) {
    for (const t of avancePorTema(MATERIA, e.actividades ?? [])) {
      if (t.huerfana) continue;
      const prev = acumulado.get(t.id) ?? { titulo: t.titulo, total: t.total, iniciaron: 0, terminaron: 0, hechas: 0 };
      prev.hechas += t.hechas;
      if (t.hechas > 0) prev.iniciaron += 1;
      if (t.hechas >= t.total) prev.terminaron += 1;
      acumulado.set(t.id, prev);
    }
  }
  const porTema = [...acumulado.entries()].map(([id, v]) => ({ id, ...v }));
  const mirables = SUBJECTS[MATERIA].topics.flatMap((t) => {
    const d = desafioDe(t);
    return [...actividadesDeTipo(t, HACER), ...(d ? [d] : [])].map((a) => ({ id: a.id, nombre: a.nombre, tema: t.title }));
  });
  const seis = V1.masHechas(cohorte, mirables);
  const filas = seis.map((a) => ({ ...a, cifras: V1.cifrasDeActividad(C.rpc("panel_actividad", { p_activity_id: a.id })[0]) }));
  return { avance: V1.avanceDeClase(porTema, cohorte.length, MATERIA), ...V1.peorActividad(filas), seis };
}

test("★★★ curso normal: «Actividades hechas» da 26 % y B3, 51 % con 15 que la terminaron (lo que muestran las capturas)", () => {
  const r = primeraPantalla("normal");
  assert.equal(Math.round(r.avance), 26);
  assert.equal(r.seis.length, 6);
  assert.ok(r.peor, "no hay peor actividad");
  assert.equal(Math.round(r.peor.cifras.pct), 51);
  assert.equal(r.peor.cifras.terminaron, 15);
});

test("★★ curso grande: las mismas reglas dan 26 % y 51 % con 36 que la terminaron", () => {
  const r = primeraPantalla("grande");
  /*
   * 25 y no 26 desde «¿Gasto o pago?» (Célula E, #506): una Hacer más en T3
   * sube el total de Contabilidad y el curso falso no la juega. Medido: 25,72 %
   * en main y 25,24 % con ella. El «normal» pasa de 26,47 a 25,98 y sigue en 26.
   */
  assert.equal(Math.round(r.avance), 25);
  assert.equal(Math.round(r.peor.cifras.pct), 51);
  assert.equal(r.peor.cifras.terminaron, 36);
});

test("★★ un estudiante: ninguna actividad llega a 5 terminaciones, así que no hay peor (B3 usa su texto de un estudiante)", () => {
  const r = primeraPantalla("uno");
  assert.equal(r.peor, null);
  assert.ok(r.faltan > 0);
});
