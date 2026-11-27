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
    /*
     * Gen · lote 2: las 7 Hacer del cap. 3 (diseño disenos/c03-hacer.md; textos en
     * fundamentos/textos-c3.js). El cap. 3 no es un proceso: va en fundamentos.
     * Misma clasificación que su fila de la 0277. Mateo: «publica todo».
     */
    { id: "gp26-fun-c03-h01-orquesta", tipo: "hacer", nombre: "La orquesta de la inauguración", subtemas: ["gp-c3-rol"], clasificacion: hacer("facil", 10, { etapas: 2 }) },
    { id: "gp26-fun-c03-h02-tranvia", tipo: "hacer", nombre: "Las cinco líneas de tu semana", subtemas: ["gp-c3-esfera", "gp-c3-comunicacion"], clasificacion: hacer("facil", 10) },
    { id: "gp26-fun-c03-h03-taburete", tipo: "hacer", nombre: "El taburete de tres patas", subtemas: ["gp-c3-talento"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-c03-h04-llavero", tipo: "hacer", nombre: "El llavero del poder", subtemas: ["gp-c3-poder"], clasificacion: hacer("medio", 25) },
    { id: "gp26-fun-c03-h05-moneda", tipo: "hacer", nombre: "Las dos caras de la moneda", subtemas: ["gp-c3-lider-gestor"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-c03-h06-comandas", tipo: "hacer", nombre: "La comanda de la mañana", subtemas: ["gp-c3-estilos"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-fun-c03-h07-mosaico", tipo: "hacer", nombre: "El mosaico de la integración", subtemas: ["gp-c3-integracion"], clasificacion: hacer("dificil", 50, { etapas: 2 }) },
  ],
  /*
   * Gen · lote 2: las 10 Hacer del cap. 4 (Integración; diseño disenos/c04-hacer.md;
   * textos en integracion/textos-c4.js), cada una en el módulo del grupo de
   * procesos del proceso que ejercita. H10, el taller que integra los siete,
   * cierra el capítulo en Cierre, después de H09.
   */
  "gp-inicio": [
    { id: "gp26-ini-c04-h01-acta", tipo: "hacer", nombre: "El acta de Barranquilla", subtemas: ["gp-4-1"], clasificacion: hacer("dificil", 50, { etapas: 2 }) },
    { id: "gp26-ini-c04-h02-expositor", tipo: "hacer", nombre: "El expositor de los casos", subtemas: ["gp-4-1"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  ],
  "gp-planificacion": [
    { id: "gp26-pla-c04-h03-portaplanos", tipo: "hacer", nombre: "El portaplanos y el revistero", subtemas: ["gp-4-2"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    /*
     * Gen · lote 3: cap. 5 (Alcance, 5.1–5.4; diseño disenos/c05-hacer.md; textos
     * en alcance/textos-c5.js) y cap. 6 (Cronograma, 6.1–6.5; disenos/c06-hacer.md;
     * textos en cronograma/textos-c6.js). Misma clasificación que su fila de la
     * 0278. H12 del cap. 6 mezcla procesos: va con el principal, 6.5.
     */
    { id: "gp26-pla-c05-h01-teatro", tipo: "hacer", nombre: "Escenario o bambalinas", subtemas: ["gp-5-1"], clasificacion: hacer("facil", 10) },
    { id: "gp26-pla-c05-h02-noria", tipo: "hacer", nombre: "La carretera y la noria", subtemas: ["gp-5-2", "gp-5-3", "gp-5-4", "gp-5-5", "gp-5-6"], clasificacion: hacer("medio", 25) },
    { id: "gp26-pla-c05-h03-libretas", tipo: "hacer", nombre: "Las dos libretas", subtemas: ["gp-5-1"], clasificacion: hacer("medio", 25) },
    { id: "gp26-pla-c05-h04-mochila", tipo: "hacer", nombre: "La mochila de campo", subtemas: ["gp-5-2"], clasificacion: hacer("medio", 25) },
    { id: "gp26-pla-c05-h05-urna", tipo: "hacer", nombre: "La urna de las funciones", subtemas: ["gp-5-2"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c05-h06-alacena", tipo: "hacer", nombre: "La alacena de requisitos", subtemas: ["gp-5-2"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c05-h07-telar", tipo: "hacer", nombre: "El telar de la trazabilidad", subtemas: ["gp-5-2"], clasificacion: hacer("dificil", 50) },
    { id: "gp26-pla-c05-h08-mapa", tipo: "hacer", nombre: "El mapa de dos escalas", subtemas: ["gp-5-3"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c05-h09-movil", tipo: "hacer", nombre: "El móvil de la EDT", subtemas: ["gp-5-4"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
    { id: "gp26-pla-c05-h10-caja-fuerte", tipo: "hacer", nombre: "La caja fuerte", subtemas: ["gp-5-4"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c06-h01-semaforo", tipo: "hacer", nombre: "El semáforo del plan", subtemas: ["gp-6-1"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c06-h02-linterna", tipo: "hacer", nombre: "La linterna del túnel", subtemas: ["gp-6-2"], clasificacion: hacer("facil", 10, { etapas: 2 }) },
    { id: "gp26-pla-c06-h03-rompecabezas", tipo: "hacer", nombre: "Las piezas que encajan", subtemas: ["gp-6-3"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c06-h04-cinta", tipo: "hacer", nombre: "La cinta métrica", subtemas: ["gp-6-3"], clasificacion: hacer("medio", 25) },
    { id: "gp26-pla-c06-h05-sumadora", tipo: "hacer", nombre: "La sumadora de duraciones", subtemas: ["gp-6-4"], clasificacion: hacer("dificil", 50, { etapas: 2 }) },
    { id: "gp26-pla-c06-h06-alcancias", tipo: "hacer", nombre: "Pintores y alcancías", subtemas: ["gp-6-4"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c06-h07-metro", tipo: "hacer", nombre: "El metro de la ruta crítica", subtemas: ["gp-6-5"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
    { id: "gp26-pla-c06-h08-domino", tipo: "hacer", nombre: "Fichas de dominó", subtemas: ["gp-6-5"], clasificacion: hacer("dificil", 50) },
    { id: "gp26-pla-c06-h09-relevos", tipo: "hacer", nombre: "La pista de relevos", subtemas: ["gp-6-5"], clasificacion: hacer("dificil", 50, { etapas: 2 }) },
    { id: "gp26-pla-c06-h10-bloques", tipo: "hacer", nombre: "La torre de bloques", subtemas: ["gp-6-5"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-pla-c06-h12-plotter", tipo: "hacer", nombre: "El rollo del practicante", subtemas: ["gp-6-2", "gp-6-3", "gp-6-5", "gp-6-6"], clasificacion: hacer("dificil", 50) },
  ],
  "gp-ejecucion": [
    { id: "gp26-eje-c04-h04-carretillas", tipo: "hacer", nombre: "Cuatro carretillas de cambio", subtemas: ["gp-4-3"], clasificacion: hacer("medio", 25) },
    { id: "gp26-eje-c04-h05-bitacora", tipo: "hacer", nombre: "La bitácora de obra", subtemas: ["gp-4-3"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-eje-c04-h06-recetario", tipo: "hacer", nombre: "El recetario y las manos", subtemas: ["gp-4-4"], clasificacion: hacer("medio", 25, { etapas: 3 }) },
  ],
  "gp-monitoreo-control": [
    { id: "gp26-moc-c04-h07-camara", tipo: "hacer", nombre: "La cámara del viernes", subtemas: ["gp-4-5"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-moc-c04-h08-turnero", tipo: "hacer", nombre: "El turnero de los cambios", subtemas: ["gp-4-6"], clasificacion: hacer("dificil", 50, { etapas: 2 }) },
    /* Lote 3: Validar y Controlar el alcance (5.5, 5.6) y Controlar el cronograma (6.6). */
    { id: "gp26-moc-c05-h11-embarque", tipo: "hacer", nombre: "Escáner y puerta de embarque", subtemas: ["gp-5-5"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-moc-c05-h12-globo", tipo: "hacer", nombre: "El globo que se infla", subtemas: ["gp-5-6"], clasificacion: hacer("dificil", 50) },
    { id: "gp26-moc-c06-h11-rotafolio", tipo: "hacer", nombre: "El rotafolio del lunes", subtemas: ["gp-6-6"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  ],
  "gp-cierre": [
    { id: "gp26-cie-c04-h09-breakers", tipo: "hacer", nombre: "Apaga el proyecto", subtemas: ["gp-4-7"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
    { id: "gp26-cie-c04-h10-beneficiadero", tipo: "hacer", nombre: "Los canales del beneficiadero", subtemas: ["gp-4-1", "gp-4-2", "gp-4-3", "gp-4-4", "gp-4-5", "gp-4-6", "gp-4-7"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
  ],
});

/* El interruptor de publicación: vacío = nada visible para los estudiantes. */
/* GP-01 aprobado por Mateo el 27-nov-2026: sale en cuanto la materia entre a subjects.js. */
/* Las 18 Hacer de los caps. 1-2: Mateo, 27-nov-2026 («publica todo; cada lote apenas esté construido»). */
/* Lote 2 (las 17 de los caps. 3 y 4, repartidas por módulo): mismo visto bueno. */
/* Lote 3 (las 24 de los caps. 5 y 6): mismo visto bueno («publicar todo»). */
export const PUBLICADAS = Object.freeze([
  "gp26-fun-a1-proyecto-operacion",
  ...MODULOS.flatMap((m) => PIEZAS[m.id] ?? []).filter((pz) => pz.tipo === "hacer").map((pz) => pz.id),
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
