/*
 * El curso inventado del panel docente, determinista, para la Vara 1.
 *
 * Contesta cada RPC del panel como lo haría Supabase, sin base: el mismo
 * escenario da siempre las mismas cifras, que es lo que deja comparar el panel
 * viejo con el nuevo (P7). Nada de esto escribe en ningún lado.
 *
 *   cero     panel_estudiantes vacío
 *   uno      un estudiante con alerta de atención
 *   normal   28 estudiantes (22 en el grupo, 2 cuentas de prueba)
 *   grande   64 estudiantes (50 en el grupo, 2 cuentas de prueba)
 */

const ACTIVIDADES = [
  "t1-desde-donde-preguntan", "t1-que-entro-y-que-salio", "cu-izquierda-o-derecha", "cu-de-que-familia",
  "t3-ingreso-o-cobro", "t3-cuando-se-causa", "t4-entra-o-sale-de-caja", "t4-se-mueve-la-caja-menor",
];
const NOMBRES = [
  "Valentina Rojas", "Santiago Gómez", "Isabella Martínez", "Mateo Castro", "Sofía Herrera",
  "Samuel Pardo", "Mariana López", "Nicolás Vargas", "Gabriela Díaz", "Tomás Ruiz",
  "Daniela Moreno", "Juan Pablo Ortiz", "Camila Suárez", "Alejandro Ríos", "Laura Jiménez",
  "Sebastián Torres", "Paula Ramírez", "David Cárdenas", "Natalia Mejía", "Andrés Salazar",
  "Juliana Peña", "Felipe Acosta", "María José Cruz", "Emilio Rincón", "Sara Velandia",
  "Martín Quintero",
];
/* Para el curso grande: un segundo apellido en vez de un número (P5 cuenta los dígitos de la primera pantalla). */
const SEGUNDOS = ["Arango", "Bermúdez", "Cifuentes"];
/* T4 entero: con él, algunos terminan un tema y el avance de la clase no es siempre 0. */
const T4 = ["t4-entra-o-sale-de-caja", "t4-se-mueve-la-caja-menor", "t4-el-arqueo-de-rosa", "t4-concilia-la-cuenta", "t4-se-asienta-o-no"];

/* Un día fijo: «hace N días» no cambia de una corrida a otra dentro del mismo día. */
const HOY = new Date(new Date().toISOString().slice(0, 10) + "T12:00:00Z").getTime();
const haceDias = (d) => new Date(HOY - d * 86400000).toISOString();

function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

export function curso(escenario = "normal") {
  let semilla = 42;
  const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
  const n = { cero: 0, uno: 1, normal: 28, grande: 64 }[escenario];
  if (n === undefined) throw new Error(`escenario desconocido: ${escenario}`);
  const reales = escenario === "grande" ? 62 : escenario === "normal" ? 26 : n;
  const enGrupo = escenario === "grande" ? 50 : escenario === "normal" ? 22 : 0;

  const estudiantes = Array.from({ length: n }, (_, i) => {
    const prueba = i >= reales;
    const base = NOMBRES[i % NOMBRES.length];
    const nombre = prueba ? null : i < NOMBRES.length ? base : `${base} ${SEGUNDOS[(Math.floor(i / NOMBRES.length) - 1) % SEGUNDOS.length]}`;
    const inactivo = i % 7 === 3 ? 9 + Math.floor(azar() * 12) : Math.floor(azar() * 5);
    const nAct = 2 + Math.floor(azar() * (ACTIVIDADES.length - 1));
    const pctEval = escenario === "uno" ? 52 : i % 5 === 1 ? 40 + azar() * 18 : 62 + azar() * 36;
    const nEval = 1 + Math.floor(azar() * 6);
    const fpCiclo = inactivo > 7 ? 0 : Math.floor(azar() * 180);
    return {
      user_id: `00000000-0000-0000-0000-${String(100 + i).padStart(12, "0")}`,
      nickname: (prueba ? "prueba" : base.split(" ")[0].toLowerCase()) + (i + 1),
      full_name: nombre,
      en_mi_grupo: !prueba && i < enGrupo,
      fp_total: fpCiclo + 200 + Math.floor(azar() * 900),
      fp_ciclo: fpCiclo,
      ultima_actividad: haceDias(inactivo),
      dias_inactivo: inactivo,
      primera_actividad: haceDias(40),
      actividades: i % 3 === 0 ? [...new Set([...ACTIVIDADES.slice(0, nAct), ...T4])] : ACTIVIDADES.slice(0, nAct),
      n_registros: nAct + Math.floor(azar() * 8),
      pct_evaluativa: pctEval,
      n_evaluativas: nEval,
      pct_exploratoria: 88 + azar() * 12,
      n_exploratorias: 2 + Math.floor(azar() * 9),
      duracion_media_ms: i % 9 === 4 ? 60000 : 120000 + azar() * 240000,
      pct_evaluativa_14d: inactivo > 7 ? null : pctEval,
      n_evaluativas_14d: inactivo > 7 ? 0 : nEval,
      dias_activos_14d: inactivo > 7 ? 0 : 1 + Math.floor(azar() * 6),
      es_prueba: prueba,
    };
  });
  const grupo = estudiantes.filter((e) => e.en_mi_grupo);
  const cohorte = (grupo.length ? grupo : estudiantes).filter((e) => !e.es_prueba);

  function actividad(id) {
    const hechos = estudiantes.filter((e) => !e.es_prueba && e.actividades.includes(id));
    const completaron = hechos.length;
    const h = hash(id);
    const pct = completaron ? 45 + (h % 50) + (h % 10) / 10 : null;
    const alta = Math.round(completaron * ((h >> 4) % 40) / 100);
    const baja = Math.round(completaron * ((h >> 8) % 35) / 100);
    return {
      activity_id: id, modality: "evaluativa", difficulty: "media",
      completaron, en_grupo: hechos.filter((e) => e.en_mi_grupo).length, grupo_total: grupo.length,
      intentos: completaron + (h % 7), pct_medio: pct, distribucion_visible: completaron > 0,
      banda_alta: alta, banda_media: completaron - alta - baja, banda_baja: baja,
      duracion_media_ms: 90000 + (h % 200) * 1000, fp_medio: 40 + (h % 60),
      intentos_con_detalle: completaron ? completaron + (h % 7) : 0, detalle_desde: haceDias(25),
    };
  }
  function items(id) {
    if (id !== "t4-entra-o-sale-de-caja") return [];
    const veces = actividad(id).intentos;
    if (veces < 5) return [];
    return [1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
      const fallos = [3, 11, 5, 14, 2, 8, 6, 4][k - 1] % (veces + 1);
      return { item_id: `h1-${k}`, veces, fallos, pct_fallo: (fallos / veces) * 100, respuesta_top: fallos > 7 ? "Haber de Caja" : null, respuesta_top_veces: fallos > 7 ? fallos - 3 : null };
    });
  }
  function grupoDe(id) {
    const base = grupo.length ? grupo : estudiantes;
    return base.filter((e) => e.actividades.includes(id)).map((e, k) => ({
      user_id: e.user_id, nickname: e.nickname, full_name: e.full_name, es_prueba: e.es_prueba,
      mejor_pct: 35 + ((hash(id + e.user_id) % 65)), fp_total: 40 + (hash(e.user_id + id) % 120), intentos: 1 + (k % 3), ultimo: haceDias(k % 9),
    })).sort((a, b) => a.mejor_pct - b.mejor_pct);
  }
  function historial(uid) {
    const e = estudiantes.find((x) => x.user_id === uid);
    return (e?.actividades ?? []).map((a, k) => ({
      activity_id: a, modality: k % 2 ? "evaluativa" : "exploratoria", difficulty: "media",
      intentos: 1 + (k % 3), mejor_pct: 55 + ((hash(a + uid) % 45)), mejor_fp: 40 + k * 10, fp_total: 90 + k * 20,
      primer_intento: haceDias(30 - k * 3), ultimo_intento: haceDias(20 - k * 2),
    }));
  }
  const resumen = n === 0 ? [] : [{
    desde: haceDias(3), estudiantes_total: reales, estudiantes_activos: cohorte.filter((e) => e.fp_ciclo > 0).length,
    fp_nuevos: 1840, estudiantes_movidos: Math.min(4, reales), actividades_nuevas: ["t4-entra-o-sale-de-caja", "t3-cuando-se-causa"],
  }];

  /* Lo que contesta cada RPC (los que escriben, como grupo_marcar, no se llaman al medir). */
  function rpc(nombre, cuerpo = {}) {
    switch (nombre) {
      case "es_docente": return true;
      case "materias_docente": return ["contabilidad", "macroeconomia"];
      case "panel_estudiantes": return estudiantes;
      case "panel_resumen": return resumen;
      case "panel_historial": return historial(cuerpo.p_user);
      case "panel_actividad": return [actividad(cuerpo.p_activity_id)];
      case "panel_items": return items(cuerpo.p_activity_id);
      case "panel_grupo_actividad": return grupoDe(cuerpo.p_activity_id);
      case "grupo_marcar": return null;
      default: return [];
    }
  }
  return { estudiantes, cohorte, rpc };
}

/* Las RPC que escriben: P8 pide que el rediseño no agregue ninguna. */
export const RPC_QUE_ESCRIBEN = ["panel_resumen", "grupo_marcar", "registrar_fp"];
