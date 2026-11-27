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

/* La clasificación de una Hacer (la misma de su fila en supabase/migrations). */
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: "hacer", modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PREFIJO_PIEZA = "gp26-";

/* Las piezas de cada módulo, en el orden del camino. */
export const PIEZAS = Object.freeze({
  "gp-fundamentos": [
    /* Jane · GP-01 microvideo «El pan de cada día» (G §1.2.1, p. 4; operaciones p. 16). Aprobado por Mateo el 27-nov-2026. */
    { id: "gp26-fun-a1-proyecto-operacion", tipo: "aprender", nombre: "¿Proyecto u operación? El pan de cada día", subtemas: ["gp-c1-proyectos", "gp-c1-portafolios"], microvideo: true },
    /*
     * Gen · las 18 Hacer diarias de los caps. 1 y 2 (diseño en
     * orquestador/conocimiento/gestion-proyectos/disenos/c1-c2-hacer.md; textos en
     * fundamentos/textos-c1.js y textos-c2.js). Misma clasificación que su fila
     * de la 0276. Mateo: «publica todo» (27-nov-2026).
     */
    { id: "gp26-fun-h01-bandeja", tipo: "hacer", nombre: "La bandeja de los lunes", subtemas: ["gp-c1-proyectos"], clasificacion: hacer("facil", 10) },
    { id: "gp26-fun-h02-reloj", tipo: "hacer", nombre: "¿Se acaba o sigue?", subtemas: ["gp-c1-proyectos"], clasificacion: hacer("facil", 10) },
    { id: "gp26-fun-h03-sellos", tipo: "hacer", nombre: "El sello del porqué", subtemas: ["gp-c1-proyectos"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h04-puente", tipo: "hacer", nombre: "El puente al estado futuro", subtemas: ["gp-c1-proyectos"], clasificacion: hacer("facil", 10, { etapas: 2 }) },
    { id: "gp26-fun-h05-portafolio", tipo: "hacer", nombre: "Arma el mapa de Altamira", subtemas: ["gp-c1-portafolios"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-h06-lineas", tipo: "hacer", nombre: "Cinco formas de hacer la app", subtemas: ["gp-c1-ciclo-vida"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h07-puerta", tipo: "hacer", nombre: "La puerta de fase", subtemas: ["gp-c1-ciclo-vida"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h08-calendario", tipo: "hacer", nombre: "La trampa del calendario", subtemas: ["gp-c1-procesos-areas"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-h09-central", tipo: "hacer", nombre: "La central de la obra", subtemas: ["gp-c1-procesos-areas"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h10-cafetera", tipo: "hacer", nombre: "Del grano a la taza", subtemas: ["gp-c1-procesos-areas"], clasificacion: hacer("facil", 10) },
    { id: "gp26-fun-h11-caso-puente", tipo: "hacer", nombre: "El caso de negocio del puente", subtemas: ["gp-c1-negocio"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
    { id: "gp26-fun-h12-balanzas", tipo: "hacer", nombre: "¿Éxito o fracaso?", subtemas: ["gp-c1-negocio"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-h13-memorando", tipo: "hacer", nombre: "El memorando del practicante", subtemas: ["gp-c1-adaptacion", "gp-c1-procesos-areas", "gp-c1-portafolios", "gp-c1-proyectos", "gp-c1-negocio"], clasificacion: hacer("dificil", 50) },
    { id: "gp26-fun-h14-sobre", tipo: "hacer", nombre: "El sobre del proveedor", subtemas: ["gp-c1-proposito"], clasificacion: hacer("medio", 25, { modalidad: "exploratoria" }) },
    { id: "gp26-fun-h15-control", tipo: "hacer", nombre: "¿Lo controlas o te controla?", subtemas: ["gp-c2-factores", "gp-c2-activos"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-h16-nudos", tipo: "hacer", nombre: "El organigrama con nudos", subtemas: ["gp-c2-gobernanza"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h17-dial", tipo: "hacer", nombre: "El dial de la autoridad", subtemas: ["gp-c2-estructuras"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-h18-pmo", tipo: "hacer", nombre: "Tres empresas, tres PMO", subtemas: ["gp-c2-estructuras"], clasificacion: hacer("medio", 25) },
  ],
  "gp-inicio": [],
  "gp-planificacion": [],
  "gp-ejecucion": [],
  "gp-monitoreo-control": [],
  "gp-cierre": [],
});

/* El interruptor de publicación: vacío = nada visible para los estudiantes. */
/* GP-01 aprobado por Mateo el 27-nov-2026: sale en cuanto la materia entre a subjects.js. */
/* Las 18 Hacer de los caps. 1-2: Mateo, 27-nov-2026 («publica todo; cada lote apenas esté construido»). */
export const PUBLICADAS = Object.freeze([
  "gp26-fun-a1-proyecto-operacion",
  ...PIEZAS["gp-fundamentos"].filter((pz) => pz.tipo === "hacer").map((pz) => pz.id),
]);
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
