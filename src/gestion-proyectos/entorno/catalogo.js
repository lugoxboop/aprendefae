/*
 * GESTIÓN DE PROYECTOS · CAP. 2 «EL ENTORNO» (tema gp-entorno): EL CATÁLOGO
 * DE LAS 4 HACER, en el orden del calendario (diseño §1, días 15–18).
 * Misma clasificación que su fila de la 0276 y que src/data/subjects.js.
 */
export const MATERIA = "gestion-proyectos";
export const TEMA = "gp-entorno";

const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_ENTORNO = [
  { id: "gp-h15-control", tipo: H, nombre: "¿Lo controlas o te controla?", subtemas: ["gp-eef", "gp-opa"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  { id: "gp-h16-nudos", tipo: H, nombre: "El organigrama con nudos", subtemas: ["gp-gestion", "gp-sistemas"], clasificacion: hacer("medio", 25) },
  { id: "gp-h17-dial", tipo: H, nombre: "El dial de la autoridad", subtemas: ["gp-estructuras"], clasificacion: hacer("medio", 25) },
  { id: "gp-h18-pmo", tipo: H, nombre: "Tres empresas, tres PMO", subtemas: ["gp-pmo"], clasificacion: hacer("medio", 25) },
];

export const PUBLICADAS_ENTORNO = Object.freeze(PIEZAS_ENTORNO.map((p) => p.id));
export const estaPublicadaEntorno = (id) => PUBLICADAS_ENTORNO.includes(id);
