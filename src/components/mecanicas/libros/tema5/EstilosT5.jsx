import { FAE } from "../../../../theme.js";

/*
 * El foco visible de las máquinas del Tema 5 (guía de Mai v3, §4.5): contorno
 * de 2 px en color texto, separado 2 px. Vive aquí y no en un CSS global
 * porque solo lo usan estas dos capas.
 */
export const CLASE_T5 = "b5-t5";

export default function EstilosT5() {
  return (
    <style>{`.${CLASE_T5} button:focus-visible, .${CLASE_T5} [tabindex]:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }`}</style>
  );
}
