/*
 * GESTIÓN DE PROYECTOS · LOS TEMAS PUBLICADOS (lo que lee TemaGP.jsx).
 * Un tema por capítulo de la guía del PMBOK (6.ª ed.); cada uno con su
 * catálogo, su interruptor de publicación y sus textos.
 */
import * as INTRO from "./introduccion/catalogo.js";
import * as ENTORNO from "./entorno/catalogo.js";

export const MATERIA_GP = "gestion-proyectos";

export const TEMAS_GP = {
  "gp-introduccion": { titulo: "Introducción", capitulo: 1, piezas: INTRO.PIEZAS_INTRO, publicada: INTRO.estaPublicadaIntro },
  "gp-entorno": { titulo: "El entorno de los proyectos", capitulo: 2, piezas: ENTORNO.PIEZAS_ENTORNO, publicada: ENTORNO.estaPublicadaEntorno },
};

export const TEXTOS_TEMA_GP = {
  "gp-introduccion": () => import("./introduccion/textos.js"),
  "gp-entorno": () => import("./entorno/textos.js"),
};
