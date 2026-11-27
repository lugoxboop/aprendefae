/*
 * GESTIÓN DE PROYECTOS · CAP. 1 «INTRODUCCIÓN» (tema gp-introduccion): EL
 * CATÁLOGO DE LAS 14 HACER, en el orden del calendario (diseño §1, días 1–14).
 *
 * Misma clasificación que su fila de la 0276 y que src/data/subjects.js
 * (gp-catalogo.test.mjs y catalogo.test.mjs lo vigilan). Mateo pidió todo
 * visible: las 14 están en PUBLICADAS_INTRO. Los Aprender los hace Jane;
 * cuando lleguen, entran aquí con tipo "aprender" y sin clasificación.
 */
export const MATERIA = "gestion-proyectos";
export const TEMA = "gp-introduccion";

const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_INTRO = [
  { id: "gp-h01-bandeja", tipo: H, nombre: "La bandeja de los lunes", subtemas: ["gp-proyecto"], clasificacion: hacer("facil", 10) },
  { id: "gp-h02-reloj", tipo: H, nombre: "¿Se acaba o sigue?", subtemas: ["gp-fin"], clasificacion: hacer("facil", 10) },
  { id: "gp-h03-sellos", tipo: H, nombre: "El sello del porqué", subtemas: ["gp-contexto"], clasificacion: hacer("medio", 25) },
  { id: "gp-h04-puente", tipo: H, nombre: "El puente al estado futuro", subtemas: ["gp-cambio-valor"], clasificacion: hacer("facil", 10, { etapas: 2 }) },
  { id: "gp-h05-portafolio", tipo: H, nombre: "Arma el mapa de Altamira", subtemas: ["gp-ppp"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  { id: "gp-h06-lineas", tipo: H, nombre: "Cinco formas de hacer la app", subtemas: ["gp-ciclo"], clasificacion: hacer("medio", 25) },
  { id: "gp-h07-puerta", tipo: H, nombre: "La puerta de fase", subtemas: ["gp-ciclo"], clasificacion: hacer("medio", 25) },
  { id: "gp-h08-calendario", tipo: H, nombre: "La trampa del calendario", subtemas: ["gp-procesos"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  { id: "gp-h09-central", tipo: H, nombre: "La central de la obra", subtemas: ["gp-procesos"], clasificacion: hacer("medio", 25) },
  { id: "gp-h10-cafetera", tipo: H, nombre: "Del grano a la taza", subtemas: ["gp-datos"], clasificacion: hacer("facil", 10) },
  { id: "gp-h11-caso-puente", tipo: H, nombre: "El caso de negocio del puente", subtemas: ["gp-documentos"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
  { id: "gp-h12-balanzas", tipo: H, nombre: "¿Éxito o fracaso?", subtemas: ["gp-exito"], clasificacion: hacer("medio", 25, { etapas: 2 }) },
  { id: "gp-h13-memorando", tipo: H, nombre: "El memorando del practicante", subtemas: ["gp-adaptacion", "gp-procesos", "gp-ppp", "gp-fin", "gp-documentos"], clasificacion: hacer("dificil", 50) },
  { id: "gp-h14-sobre", tipo: H, nombre: "El sobre del proveedor", subtemas: ["gp-etica"], clasificacion: hacer("medio", 25, { modalidad: "exploratoria" }) },
];

/* El interruptor de publicación, uno por pieza (Mateo: todo visible). */
export const PUBLICADAS_INTRO = Object.freeze(PIEZAS_INTRO.map((p) => p.id));
export const estaPublicadaIntro = (id) => PUBLICADAS_INTRO.includes(id);
