import { ASI_SE_JUEGA as BLOQUE_1 } from "./asiSeJuegaBloque1.js";
import { ASI_SE_JUEGA_BLOQUE2 as BLOQUE_2 } from "./asiSeJuegaBloque2.js";

/*
 * Todas las actividades que tienen «Así se juega», por id. Cada bloque vive en
 * su archivo; la vista las lee de aquí. Una actividad que no está aquí no
 * tiene pantalla ni botón «¿Cómo se juega?».
 */
export const ASI_SE_JUEGA = { ...BLOQUE_1, ...BLOQUE_2 };
