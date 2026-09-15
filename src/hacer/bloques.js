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
 * camino empieza en el primer bloque que tenga algo. Desde la migración 0030
 * los cuatro bloques tienen actividades en los tres temas de Macroeconomía
 * —2 Fácil, 3 Medio, 4 Difícil y 3 Experto en cada uno—, pero la regla sigue
 * en pie para cualquier tema que no los llene: un bloque vacío no es un fallo.
 *
 * ═══════════ SIN SEPARADORES ENTRE BLOQUES ═══════════
 *
 * Hubo una línea horizontal con una frase entre bloque y bloque, y partía el
 * camino en pedazos: la línea que une los nodos se cortaba y el recorrido se
 * leía como bloques sueltos apilados. La división ya la dicen los títulos
 * —anillo, nombre y dificultad—, así que las frases se quitaron. Se guardan
 * aquí por si más adelante caben en otro sitio del diseño:
 *
 *   hacia Aplicación   «Sube de nivel: ahora se aplica lo que aprendiste»
 *   hacia Análisis     «Aquí ya no hay una sola respuesta obvia»
 *   hacia Maestría     «La zona de los que se la saben»
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BLOQUES = [
  { id: "cimientos", nombre: "Cimientos", dificultad: "facil", etiqueta: "Fácil" },
  { id: "aplicacion", nombre: "Aplicación", dificultad: "medio", etiqueta: "Medio" },
  { id: "analisis", nombre: "Análisis", dificultad: "dificil", etiqueta: "Difícil" },
  { id: "maestria", nombre: "Maestría", dificultad: "experto", etiqueta: "Experto" },
];

/*
 * Una actividad con una dificultad que no es de las cuatro —mal escrita, o
 * nueva y sin clasificar del todo— no rompe el camino ni desaparece: va a un
 * bloque final. Que se vea rara es preferible a que no se vea.
 */
const SIN_NIVEL = { id: "otras", nombre: "Más actividades", dificultad: null, etiqueta: "Sin nivel asignado" };

/** El bloque de una dificultad, o null si no es de las cuatro. */
export function bloqueDeDificultad(dificultad) {
  return BLOQUES.find((b) => b.dificultad === dificultad) ?? null;
}

/**
 * Los bloques que se pintan, en orden, con sus nodos.
 *
 * @param {Array<{id:string, dificultad?:string|null, completada:boolean}>} nodos
 *        en el orden del catálogo; dentro de cada bloque se conserva
 * @returns {Array<{id, nombre, etiqueta, nodos, inicio:number, total:number, hechas:number}>}
 *        `inicio`: posición del primer nodo del bloque en el camino entero
 */
export function bloquesDe(nodos) {
  const grupos = BLOQUES.map((b) => ({ ...b, nodos: nodos.filter((n) => n.dificultad === b.dificultad) }));
  const sueltos = nodos.filter((n) => !bloqueDeDificultad(n.dificultad));
  if (sueltos.length) grupos.push({ ...SIN_NIVEL, nodos: sueltos });

  let inicio = 0;
  return grupos
    .filter((b) => b.nodos.length > 0)
    .map((b) => {
      const bloque = {
        ...b,
        inicio,
        total: b.nodos.length,
        hechas: b.nodos.filter((n) => n.completada).length,
      };
      inicio += b.nodos.length;
      return bloque;
    });
}
