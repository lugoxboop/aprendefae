import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * Panel docente v1 (Ukyo; Célula D): lo que resume la primera pantalla sale
 * de las mismas funciones de siempre, sin cambiar un umbral (P7), y la vista
 * no usa coral salvo para un error de carga (P6).
 */

const V1 = await import("../panelV1.js");
const { alertasDelGrupo, NIVEL } = await import("../alertas.js");

const est = (id, o = {}) => ({
  user_id: id, nickname: id, full_name: id.toUpperCase(), fp_total: 100, fp_ciclo: 10, dias_inactivo: 1,
  n_registros: 3, pct_evaluativa: 80, n_evaluativas: 3, pct_exploratoria: 90, n_exploratorias: 3, duracion_media_ms: 200000,
  actividades: [], ...o,
});

test("★★★ B1 · «Actividades hechas»: hechas entre total por tema, promediado, solo con los temas que ve el estudiante", () => {
  const porTema = [{ id: "a", total: 4, hechas: 8 }, { id: "b", total: 2, hechas: 0 }, { id: "repaso-capitulo-5", total: 5, hechas: 20 }];
  /* Cohorte de 4: el tema a va en 8 de 16 (50 %), el b en 0 de 8; el repaso se oculta al estudiante y no cuenta. */
  assert.equal(V1.avanceDeClase(porTema, 4, "contabilidad"), 25);
  assert.equal(Math.round(V1.avanceDeClase(porTema, 4, "macroeconomia") * 100) / 100, Math.round(((50 + 0 + 100) / 3) * 100) / 100);
  assert.equal(V1.avanceDeClase(porTema, 0, "contabilidad"), null);
  assert.equal(V1.avanceDeClase([], 4, "contabilidad"), null);
  assert.deepEqual(V1.TEMAS_OCULTOS_AL_ESTUDIANTE.contabilidad, ["activos-financieros", "cuentas-por-cobrar", "inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2", "repaso-capitulo-5"]);
});

test("★★★ B2 · una fila por estudiante, con su alerta más grave, en el orden de alertasDelGrupo; los motivos, sin cifras y en seis palabras o menos", () => {
  const cohorte = [
    est("a", { dias_inactivo: 12 }),
    est("b", { pct_evaluativa: 40, n_exploratorias: 4, dias_inactivo: 20, duracion_media_ms: 30000 }),
    est("c", { pct_evaluativa: 40, n_exploratorias: 4 }),
    est("d"),
  ];
  const at = V1.necesitanAtencion(cohorte);
  assert.deepEqual(at.map((x) => [x.estudiante.user_id, x.nivel]), [["b", NIVEL.URGENTE], ["a", NIVEL.URGENTE], ["c", NIVEL.ATENCION]]);
  const ordenOriginal = [...new Set(alertasDelGrupo(cohorte).map((x) => x.estudiante.user_id))];
  assert.deepEqual(at.map((x) => x.estudiante.user_id), ordenOriginal);
  /* Los textos de Katsumi (orquestador/revisiones/panel-docente/textos.md), literales. */
  assert.deepEqual(Object.values(V1.MOTIVO_CORTO), ["Más de una semana sin actividad", "Practica, pero acierta poco en evaluativas", "Responde rápido y acierta poco"]);
  for (const m of Object.values(V1.MOTIVO_CORTO)) {
    assert.doesNotMatch(m, /\d/, m);
    assert.ok(m.split(/\s+/).length <= 6, m);
  }
});

test("★★★ B3 · las seis más hechas por la cohorte; la peor con 5 o más terminaciones; si ninguna llega, cuántas faltan", () => {
  const acts = ["x1", "x2", "x3", "x4", "x5", "x6", "x7"].map((id) => ({ id, nombre: id, tema: "T" }));
  const cohorte = [
    est("a", { actividades: ["x1", "x2", "x3", "x7"] }),
    est("b", { actividades: ["x1", "x2", "x7"] }),
    est("c", { actividades: ["x1", "x4", "x5", "x6"] }),
  ];
  assert.deepEqual(V1.masHechas(cohorte, acts).map((a) => a.id), ["x1", "x2", "x7", "x3", "x4", "x5"]);
  const fila = (id, pct, completaron, orden) => ({ id, orden, cifras: V1.cifrasDeActividad({ modality: "evaluativa", pct_medio: pct, completaron, grupo_total: 0 }) });
  assert.equal(V1.peorActividad([fila("x1", 40, 4, 0), fila("x2", 60, 5, 1), fila("x3", 55, 9, 2)]).peor.id, "x3");
  assert.deepEqual(V1.peorActividad([fila("x1", 40, 4, 0), fila("x2", 30, 2, 1)]), { peor: null, faltan: 1 });
  assert.equal(V1.MINIMO_TERMINARON, 5);
});

test("★★★ las cifras de una actividad son las de la tarjeta LA TERMINARON: con grupo, los del grupo y su total; sin grupo, todos", () => {
  assert.deepEqual(V1.cifrasDeActividad({ modality: "evaluativa", pct_medio: 71.4, completaron: 21, en_grupo: 17, grupo_total: 22 }), { pct: 71.4, completaron: 21, terminaron: 17, de: 22 });
  assert.deepEqual(V1.cifrasDeActividad({ modality: "exploratoria", pct_medio: 90, completaron: 3, en_grupo: 0, grupo_total: 0 }), { pct: null, completaron: 3, terminaron: 3, de: null });
});

test("★★ «Actividades», peor primero; «Mis estudiantes», atención primero y luego por la última vez", () => {
  const f = (id, pct, orden) => ({ id, orden, cifras: pct === undefined ? null : { pct } });
  assert.deepEqual(V1.ordenPeorPrimero([f("a", 80, 0), f("b", undefined, 1), f("c", 40, 2), f("d", null, 3)]).map((x) => x.id), ["c", "a", "b", "d"]);
  const es = [est("a", { dias_inactivo: 5 }), est("b", { dias_inactivo: 0 }), est("c", { dias_inactivo: 2 })];
  assert.deepEqual(V1.ordenEstudiantes(es, [{ estudiante: es[0] }]).map((e) => e.user_id), ["a", "b", "c"]);
});

test("★★★ P6 · los bloques nuevos no usan coral; el panel solo lo usa en el error de carga", () => {
  for (const f of ["ResumenClase", "AtencionAhora", "PeorActividad", "ListaEstudiantes", "ListaActividades", "VistaEstudiante", "BloqueAlertas", "DetalleEstudiante", "MarcaNivel"]) {
    assert.doesNotMatch(readFileSync(new URL(`../../components/docente/${f}.jsx`, import.meta.url), "utf8"), /FAE\.coral|231,\s*111,\s*81/, f);
  }
  const panel = readFileSync(new URL("../../components/docente/PanelDocente.jsx", import.meta.url), "utf8");
  assert.equal((panel.match(/FAE\.coral/g) ?? []).length, 1, "el coral del panel es solo el del error de carga");
});

test("★★★ P8 · el panel nuevo no llama a ninguna escritura que no existiera: solo panel_resumen (al cargar) y grupo_marcar (por el botón)", () => {
  const dir = new URL("../../components/docente/", import.meta.url);
  for (const f of ["PanelDocente", "ResumenClase", "AtencionAhora", "PeorActividad", "ListaEstudiantes", "ListaActividades", "VistaEstudiante"]) {
    const s = readFileSync(new URL(`${f}.jsx`, dir), "utf8");
    assert.doesNotMatch(s, /\.rpc\s*\(|supabase/, `${f} habla con la base sin pasar por datos.js`);
  }
});
