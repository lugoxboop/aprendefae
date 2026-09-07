/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MODELO DEL TABLERO DE DECISIONES.
 *
 * COPIADO TAL CUAL del dashboard retirado, no reescrito: los coeficientes se
 * extrajeron con un script en vez de a mano, porque volver a teclearlos es la
 * forma más fácil de que uno cambie sin que nadie lo note.
 *
 * ESTÁ VERIFICADO. El barrido de las 41.943 combinaciones del espacio de
 * decisión —`npm run barrido`— demostró que el 100% es alcanzable en 70 de
 * ellas (0,17%) y que el PIB nunca baja de 0,10%, así que la recesión es
 * inalcanzable. Por eso el PIB se presenta como indicador de contexto y no
 * como meta.
 *
 * CUALQUIER CAMBIO A UN COEFICIENTE EXIGE REPETIR EL BARRIDO. Mover uno solo
 * puede dejar un tramo inalcanzable, que es exactamente lo que pasó la primera
 * vez con la inflación base en 8%.
 *
 * Vive aquí y no dentro de un componente para que lo compartan el tablero
 * nuevo, el dashboard retirado que lo estrenó, su prueba y el barrido: un solo
 * modelo, una sola verdad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BASE = { desempleo: 14, inflacion: 6.5, pib: 1.5 };
export const META = { desempleo: 12, inflacion: 6, pib: 0 };

export const INSTRUMENTOS = [
  { id: "impuesto", etiqueta: "Impuesto a la renta de empresas", estrategia: "Política fiscal", min: 20, max: 35, base: 32, paso: 0.5 },
  { id: "tasa", etiqueta: "Tasa de interés de referencia", estrategia: "Política monetaria", min: 4, max: 12, base: 8, paso: 0.25 },
  { id: "aranceles", etiqueta: "Aranceles a las importaciones", estrategia: "Política comercial", min: 0, max: 20, base: 10, paso: 0.5 },
];

export const LIMITES = {
  desempleo: [3, 25],
  inflacion: [0, 30],
  pib: [-5, 10],
};

const sujetar = (v, [min, max]) => Math.max(min, Math.min(max, v));

/*
 * Efectos por punto de desviación respecto al valor base. El signo del delta
 * ya lleva la dirección, así que subir un instrumento invierte su efecto.
 */
export function simular({ impuesto, tasa, aranceles }) {
  const dImpuesto = 32 - impuesto;   // positivo si el impuesto baja
  const dTasa = 8 - tasa;            // positivo si la tasa baja
  const dAranceles = aranceles - 10; // positivo si los aranceles suben

  /*
   * Los coeficientes están calibrados, no elegidos a ojo: con la inflación
   * base en 8% el 100% era inalcanzable en las 41.943 combinaciones del
   * espacio de decisión, porque todo instrumento que baja el desempleo sube
   * la inflación. Bajar la base a 6.5% abre la ventana.
   *
   * Es una ventana estrecha a propósito: 70 de 41.943 combinaciones, el 0.2%
   * del espacio. Por eso el mensaje del 100% habla de llevar los instrumentos
   * al límite — el margen es apretado de verdad, no por decoración.
   *
   * El 0.3 quedó decidido, no pendiente. La alternativa evaluada era 0.35, que
   * ensancha la ventana a 443 combinaciones (1.1%), y se descartó justamente
   * por eso: aflojarla contradiría el mensaje que el estudiante lee al ganar.
   *
   * Cualquier cambio a estos números tiene que volver a pasar por
   * `npm run barrido`: mover uno solo puede dejar un nivel inalcanzable.
   */
  const desempleo = BASE.desempleo - 0.3 * dImpuesto - 0.25 * dTasa - 0.1 * dAranceles;
  const inflacion = BASE.inflacion + 0.15 * dImpuesto + 0.3 * dTasa + 0.2 * dAranceles;
  const pib = BASE.pib + 0.1 * dImpuesto + 0.15 * dTasa - 0.05 * dAranceles;

  return {
    desempleo: sujetar(desempleo, LIMITES.desempleo),
    inflacion: sujetar(inflacion, LIMITES.inflacion),
    pib: sujetar(pib, LIMITES.pib),
  };
}

/*
 * Tres niveles de resultado; el porcentaje va tal cual al motor de FP.
 *
 * Hubo un cuarto —ambas metas cumplidas pero con recesión, que valía 30%— y
 * se quitó porque no puede ocurrir: llegar a las dos metas exige una rebaja de
 * impuesto que empuja el PIB hacia arriba, así que la recesión y el doble
 * acierto no coexisten. Era una rama muerta que sugería un caso inexistente.
 */
export function evaluar({ desempleo, inflacion, pib }) {
  const okDesempleo = desempleo <= META.desempleo;
  const okInflacion = inflacion <= META.inflacion;
  /*
   * ═══ NO BORRAR ESTE GUARDIÁN AUNQUE HOY NO SE CUMPLA NUNCA ═══
   *
   * Con los coeficientes actuales la recesión es INALCANZABLE: el barrido de
   * las 41.943 combinaciones da un PIB que va de 0,10% a 3,80%, así que
   * `recesion` es hoy siempre false y las comprobaciones de abajo son código
   * muerto. Por eso el PIB se presenta como indicador de contexto y no como
   * meta —prometía una condición que el estudiante no puede incumplir.
   *
   * Se conserva a propósito: es la red correcta si alguien recalibra los
   * coeficientes. En cuanto el PIB pueda bajar de cero, esto vuelve a estar
   * vivo solo, y entonces habrá que revisar también el texto del escenario.
   * Cualquier recalibración pasa antes por `npm run barrido`.
   */
  const recesion = pib < META.pib;

  if (okDesempleo && okInflacion && !recesion) {
    return {
      porcentaje: 100,
      feedback: "✅ Lo lograste. Para lograrlo tuviste que llevar casi todos los instrumentos al límite — así de apretado es el margen cuando dos metas jalan para lados distintos. Ningún instrumento actúa solo, siempre hay un precio en otro lado.",
    };
  }
  if ((okDesempleo || okInflacion) && !recesion) {
    return {
      porcentaje: 60,
      feedback: "🟡 Lograste una meta, pero la otra se te fue. Este es el dilema de siempre — bajar impuestos y tasas ayuda al empleo, pero le mete presión a los precios. Prueba un balance distinto entre los tres instrumentos.",
    };
  }
  return {
    porcentaje: 10,
    feedback: "❌ Ni el desempleo ni la inflación llegaron a la meta esta vez. Bajar impuestos y tasas sí ayuda al empleo, pero también infla los precios — necesitas un punto medio, no ir al extremo.",
  };
}
