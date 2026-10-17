import { useState } from "react";
import { vueltasDe, sumarVuelta, esVariante } from "../../../../contabilidad/b5Vuelta.js";

/*
 * D8 (lote 18): qué vuelta se juega. Devuelve si toca la variante y el
 * `onCompletar` que la suma. Al terminar una partida cambia la configuración
 * que el componente recibe, sin desmontarlo: su «Otra vez» ya sortea con la de
 * la vuelta siguiente (useTanda lee la configuración vigente al reiniciar).
 */
export function useVuelta(id, onCompletar) {
  const [vuelta, setVuelta] = useState(() => vueltasDe(id));
  const alCompletar = (...args) => {
    onCompletar?.(...args);
    setVuelta(sumarVuelta(id));
  };
  return { variante: esVariante(vuelta), alCompletar };
}
