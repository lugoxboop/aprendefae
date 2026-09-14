/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS BLOQUES DE DIFICULTAD DEL CAMINO.
 *
 * El camino de un tema se parte en cuatro bloques, siempre en este orden, por
 * la dificultad que la actividad ya trae en el catálogo (subjects.js). No hay
 * una lista de qué actividad va en qué bloque: el bloque SALE de la
 * dificultad, así que registrar una actividad nueva con su dificultad basta
 * para que caiga en su sitio.
 *
 * ═══════════ UN BLOQUE VACÍO NO EXISTE ═══════════
 *
 * Sin actividades no se pinta nada: ni título, ni separador, ni hueco. El
 * camino empieza en el primer bloque que tenga algo. Hoy «Cimientos» está
 * vacío en los tres temas —ninguna de las 21 actividades es Fácil— y los tres
 * caminos empiezan en «Aplicación». No es un fallo.
 *
 * Y el separador va con el bloque al que LLEVA, no con el que deja: «Sube de
 * nivel» es la entrada de Aplicación. Así, si un bloque no se pinta, su
 * separador tampoco, y el primer bloque visible nunca lleva uno encima aunque
 * en el orden fijo no sea el primero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BLOQUES = [
  { id: "cimientos", nombre: "Cimientos", dificultad: "facil", etiqueta: "Fácil", separador: null },
  {
    id: "aplicacion", nombre: "Aplicación", dificultad: "medio", etiqueta: "Medio",
    separador: "Sube de nivel: ahora se aplica lo que aprendiste",
  },
  {
    id: "analisis", nombre: "Análisis", dificultad: "dificil", etiqueta: "Difícil",
    separador: "Aquí ya no hay una sola respuesta obvia",
  },
  {
    id: "maestria", nombre: "Maestría", dificultad: "experto", etiqueta: "Experto",
    separador: "La zona de los que se la saben",
  },
];

/*
 * Una actividad con una dificultad que no es de las cuatro —mal escrita, o
 * nueva y sin clasificar del todo— no rompe el camino ni desaparece: va a un
 * bloque final sin separador. Que se vea rara es preferible a que no se vea.
 */
const SIN_NIVEL = { id: "otras", nombre: "Más actividades", dificultad: null, etiqueta: "Sin nivel asignado", separador: null };

/** El bloque de una dificultad, o null si no es de las cuatro. */
export function bloqueDeDificultad(dificultad) {
  return BLOQUES.find((b) => b.dificultad === dificultad) ?? null;
}

/**
 * Los bloques que se pintan, en orden, con sus nodos.
 *
 * @param {Array<{id:string, dificultad?:string|null, completada:boolean}>} nodos
 *        en el orden del catálogo; dentro de cada bloque se conserva
 * @returns {Array<{id, nombre, etiqueta, separador:string|null, nodos, inicio:number, total:number, hechas:number}>}
 *        `inicio`: posición del primer nodo del bloque en el camino entero
 */
export function bloquesDe(nodos) {
  const grupos = BLOQUES.map((b) => ({ ...b, nodos: nodos.filter((n) => n.dificultad === b.dificultad) }));
  const sueltos = nodos.filter((n) => !bloqueDeDificultad(n.dificultad));
  if (sueltos.length) grupos.push({ ...SIN_NIVEL, nodos: sueltos });

  let inicio = 0;
  return grupos
    .filter((b) => b.nodos.length > 0)
    .map((b, k) => {
      const bloque = {
        ...b,
        /* El primero que se ve no lleva separador: no hay nada antes de lo que separarlo. */
        separador: k === 0 ? null : b.separador,
        inicio,
        total: b.nodos.length,
        hechas: b.nodos.filter((n) => n.completada).length,
      };
      inicio += b.nodos.length;
      return bloque;
    });
}
