import { createContext, useContext } from "react";
import { estiloVivoPara, ENTRADA } from "./estiloVivo.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTILO VIVO EN REACT — de qué materia es esta pantalla, y si se abre.
 *
 * La materia se pone UNA vez, arriba, en los dos sitios por donde pasa toda
 * pantalla de una materia: FondoMateria (las actividades y los temas) y
 * TopicIndexView (los índices). Nadie más la pone, y ningún componente la
 * adivina: la lee de aquí. Por eso un control compartido como CaminoHacer
 * sabe solo, sin una prop, si está en Pensamiento Estratégico.
 *
 * Lo que se le da a las células, y lo único que deberían usar:
 *
 *   useEstiloVivo()          → true en Macroeconomía y Contabilidad, false en el resto
 *   <SoloEstiloVivo>         → pinta lo de dentro solo donde la compuerta está abierta
 *   [data-estilo-vivo]       → el atributo en la raíz de la pantalla, para CSS
 *
 * Lo viejo no se toca: lo nuevo se pinta AL LADO, detrás de la compuerta, y
 * donde está cerrada la pantalla queda exactamente como estaba.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ContextoMateria = createContext(null);

/** Pone la materia para todo lo que va debajo. Solo FondoMateria y TopicIndexView lo usan. */
export function ProveedorMateria({ materiaId, children }) {
  return <ContextoMateria.Provider value={materiaId ?? null}>{children}</ContextoMateria.Provider>;
}

/** La materia de esta pantalla, o null fuera de una materia. */
export const useMateria = () => useContext(ContextoMateria);

/** Si lo nuevo entra aquí. Es la única pregunta que un componente debería hacerse. */
export const useEstiloVivo = () => estiloVivoPara(useContext(ContextoMateria));

/** Lo de dentro solo se pinta donde la compuerta está abierta; si no, `sino` (por defecto, nada). */
export function SoloEstiloVivo({ children, sino = null }) {
  return useEstiloVivo() ? children : sino;
}

/** Los atributos que van en la raíz de una pantalla de materia. */
export function atributosDeMateria(materiaId) {
  return estiloVivoPara(materiaId)
    ? { "data-materia": materiaId, "data-estilo-vivo": "" }
    : { "data-materia": materiaId ?? undefined };
}

/*
 * La entrada a la página. Una hoja de estilo, una vez por pantalla, que solo
 * existe donde la compuerta está abierta Y Ukyo encendió la entrada. Anima los
 * hijos marcados con data-entrada="n". Con movimiento reducido, nada.
 */
export function cssEntrada(entrada = ENTRADA) {
  const reglas = [
    `@keyframes fae-entrada { from { opacity: 0; transform: translateY(${entrada.desplazamientoPx}px); } to { opacity: 1; transform: none; } }`,
  ];
  for (let n = 1; n <= entrada.maxGrupos; n++) {
    reglas.push(
      `[data-estilo-vivo] [data-entrada="${n}"] { animation: fae-entrada ${entrada.duracionMs}ms ${entrada.curva} ${(n - 1) * entrada.retardoMs}ms both; }`
    );
  }
  reglas.push("@media (prefers-reduced-motion: reduce) { [data-estilo-vivo] [data-entrada] { animation: none !important; } }");
  return reglas.join("\n");
}

export function EstilosEntrada({ entrada = ENTRADA }) {
  const vivo = useEstiloVivo();
  if (!vivo || !entrada.activa) return null;
  return <style data-estilos-entrada>{cssEntrada(entrada)}</style>;
}
