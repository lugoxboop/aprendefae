import { ASI_SE_JUEGA as BLOQUE_1 } from "./asiSeJuegaBloque1.js";
import { ASI_SE_JUEGA_BLOQUE2 as BLOQUE_2 } from "./asiSeJuegaBloque2.js";
import { ASI_SE_JUEGA_BLOQUE3 as BLOQUE_3 } from "./asiSeJuegaBloque3.js";
import { ASI_SE_JUEGA_TEMA3 as TEMA_3 } from "./asiSeJuegaTema3.js";
import { ASI_SE_JUEGA_MONETARIA as MONETARIA } from "./asiSeJuegaMonetaria.js";
import { ASI_SE_JUEGA_FABRICA as FABRICA } from "./pmFabricaDelDinero.js";

/*
 * Todas las actividades que tienen «Así se juega», por id. Cada bloque vive en
 * su archivo; las vistas las leen de aquí. Una actividad que no está aquí no
 * tiene pantalla ni botón «¿Cómo se juega?». Con el bloque 3 están las
 * catorce: las siete del Tema 1 y las siete del Tema 2.
 */
export const ASI_SE_JUEGA = { ...BLOQUE_1, ...BLOQUE_2, ...BLOQUE_3, ...TEMA_3, ...MONETARIA, ...FABRICA };
