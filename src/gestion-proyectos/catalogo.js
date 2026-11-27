/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS — LOS ESPACIOS DONDE ENTRAN LAS PIEZAS
 *
 * Mismo patrón que Macroeconomía 2026 (src/macro2026/<tema>/catalogo.js): por
 * módulo, la lista de piezas en el orden del camino y, aparte, el interruptor
 * de publicación con los ids que Mateo aprobó.
 *
 * HOY TODO ESTÁ VACÍO A PROPÓSITO. Gen (las Hacer) y Jane (los Aprender y
 * simuladores) llenan PIEZAS[<módulo>] cuando tengan su diseño, con la forma:
 *
 *   { id: "gp26-ini-a1-…", tipo: "aprender" | "hacer", nombre: "…",
 *     subtemas: ["gp-4-1", …],            ← ids de estructura.js
 *     clasificacion: { tipo: "hacer", modalidad, dificultad, fpBase } }  ← solo Hacer
 *
 * y el componente en src/gestion-proyectos/<módulo>/. Reglas que vigila
 * __tests__/estructura.test.mjs:
 *   · ids con prefijo `gp26-`, únicos, y ninguno igual a uno ya existente
 *     en el sitio (ni retirado);
 *   · cada subtema de una pieza existe en estructura.js;
 *   · PUBLICADAS ⊆ PIEZAS; y mientras PUBLICADAS esté vacío la materia NO
 *     está en src/data/subjects.js (no sale en la portada, ni en medallas,
 *     ni en el panel docente).
 *
 * PUBLICAR (solo con el visto bueno de Mateo) es: anotar ids en PUBLICADAS,
 * llevar `materiaParaRegistro()` a SUBJECTS en subjects.js, poner la tarjeta
 * en la portada y, para cada Hacer, su fila en supabase/migrations. Los pasos
 * están en orquestador/conocimiento/gestion-proyectos/plan.md.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { MATERIA, NOMBRE_MATERIA, MODULOS } from "./estructura.js";

export const PREFIJO_PIEZA = "gp26-";

/* Las piezas de cada módulo, en el orden del camino. */
export const PIEZAS = Object.freeze({
  "gp-fundamentos": [
    /* Jane · GP-01 microvideo «El pan de cada día» (G §1.2.1, p. 4; operaciones p. 16). Aprobado por Mateo el 27-nov-2026. */
    { id: "gp26-fun-a1-proyecto-operacion", tipo: "aprender", nombre: "¿Proyecto u operación? El pan de cada día", subtemas: ["gp-c1-proyectos", "gp-c1-portafolios"], microvideo: true },
  ],
  "gp-inicio": [],
  "gp-planificacion": [],
  "gp-ejecucion": [],
  "gp-monitoreo-control": [],
  "gp-cierre": [],
});

/* El interruptor de publicación: vacío = nada visible para los estudiantes. */
/* GP-01 aprobado por Mateo el 27-nov-2026: sale en cuanto la materia entre a subjects.js. */
export const PUBLICADAS = Object.freeze(["gp26-fun-a1-proyecto-operacion"]);
export const estaPublicada = (id) => PUBLICADAS.includes(id);

export const todasLasPiezas = () => MODULOS.flatMap((m) => (PIEZAS[m.id] ?? []).map((pz) => ({ ...pz, moduloId: m.id })));

/*
 * Cobertura de un módulo: qué procesos ya tienen al menos un Aprender y al
 * menos un Hacer, y cuáles quedan sin pieza. Es la cuenta que impide que
 * quede un hueco: la vista previa la enseña por módulo.
 */
export function coberturaDe(moduloId) {
  const mod = MODULOS.find((m) => m.id === moduloId);
  const piezas = PIEZAS[moduloId] ?? [];
  const cubre = (tipo, sub) => piezas.some((pz) => pz.tipo === tipo && (pz.subtemas ?? []).includes(sub));
  const procesos = (mod?.procesos ?? []).map((pr) => ({
    id: pr.id,
    aprender: cubre("aprender", pr.id),
    hacer: cubre("hacer", pr.id),
  }));
  return {
    aprender: piezas.filter((pz) => pz.tipo === "aprender").length,
    hacer: piezas.filter((pz) => pz.tipo === "hacer").length,
    procesos,
    sinPieza: procesos.filter((x) => !x.aprender && !x.hacer).length,
  };
}

/*
 * La entrada de SUBJECTS que tendrá la materia al publicarse, con la misma
 * forma que Macroeconomía y Contabilidad: { id, name, topics: [{ id, title,
 * actividades: [{ id, nombre, clasificacion }] }] }. Solo lleva lo publicado
 * y omite los módulos que aún no tienen nada publicado.
 */
export function materiaParaRegistro() {
  return {
    id: MATERIA,
    name: NOMBRE_MATERIA,
    topics: MODULOS.map((m) => ({
      id: m.id,
      title: m.titulo,
      actividades: (PIEZAS[m.id] ?? [])
        .filter((pz) => estaPublicada(pz.id))
        .map((pz) => ({ id: pz.id, nombre: pz.nombre, clasificacion: pz.clasificacion ?? { tipo: "aprender" } })),
    })).filter((t) => t.actividades.length > 0),
  };
}
