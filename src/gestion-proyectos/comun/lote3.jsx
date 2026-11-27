/*
 * GESTIÓN DE PROYECTOS · ESTILO DE LAS ESCENAS DEL LOTE 3 (caps. 5 y 6).
 *
 * La hoja del lote 2 más una regla: los rótulos <small> de las escenas no bajan
 * de 12 px (el navegador los pinta a ~11 px con `font-size: smaller`; medido
 * con la sonda de evidencia a 320 y 375 px, 27-nov).
 */
import { CSS_LOTE2 } from "./lote2.jsx";

export const CSS_LOTE3 = `${CSS_LOTE2}
.gp-visual small { font-size: 12px; line-height: 1.3; }
`;

export const EstiloLote3 = () => <style>{CSS_LOTE3}</style>;
