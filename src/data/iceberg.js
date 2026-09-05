/*
 * Los dos casos del Modelo del Iceberg.
 *
 * El contenido es de Gen y no cambia con la interfaz: vive aquí, separado del
 * componente, precisamente porque ya sobrevivió a una reconstrucción entera de
 * la experiencia y va a sobrevivir a la siguiente. Los cuatro niveles de cada
 * caso son palabra por palabra los que se entregaron antes.
 */

export const CASO_TIENDA = {
  id: "tienda",
  rotulo: "La tienda",
  niveles: [
    { clave: "evento", nombre: "Evento", texto: "Las ventas caen este mes." },
    { clave: "patron", nombre: "Patrón", texto: "Cada trimestre bajan en la misma época." },
    { clave: "estructura", nombre: "Estructura", texto: "No hay un sistema de fidelización de clientes." },
    { clave: "modelo", nombre: "Modelo mental", texto: "Creemos que el cliente solo vuelve por precio." },
  ],
};

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EN PAUSA, NO DESCARTADO.
 *
 * El caso del canal de YouTube salió de la inmersión cuando se redujo a un
 * solo iceberg. El contenido se queda aquí a propósito: sus cuatro niveles
 * están escritos y verificados, y lo más probable es que vuelvan como pieza
 * aparte. Borrarlo obligaría a reescribirlo, que es trabajo ya hecho.
 *
 * Hoy no lo importa nadie. Eso es esperado: no es código muerto por descuido.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const CASO_CANAL = {
  id: "canal",
  rotulo: "El canal",
  niveles: [
    {
      clave: "evento",
      nombre: "Evento",
      texto:
        "Un canal de reseñas de tecnología pierde 200 suscriptores este mes, a pesar de subir el mismo número de videos de siempre.",
    },
    {
      clave: "patron",
      nombre: "Patrón",
      texto:
        "Lleva 4 meses seguidos perdiendo más suscriptores de los que gana, aunque la frecuencia de subida no ha cambiado.",
    },
    {
      clave: "estructura",
      nombre: "Estructura",
      texto:
        "El canal sigue publicando el mismo formato (reseñas largas de 20 minutos) desde hace 2 años, mientras la plataforma empezó a favorecer videos cortos con más interacción temprana.",
    },
    {
      clave: "modelo",
      nombre: "Modelo mental",
      texto:
        "El creador cree que “si el contenido es bueno, encuentra su audiencia solo” — y que cambiar de formato sería “venderse” al algoritmo en vez de hacer contenido de calidad.",
    },
  ],
};

/*
 * El cierre, para un solo caso. Conserva el ritmo y el remate de la versión
 * comparativa —"y hasta que esa creencia no cambia, la estructura tampoco"—
 * porque esa frase es lo que la sostenía; lo que cambia es que ya no habla de
 * dos casos, sino del que el estudiante acaba de bucear.
 *
 * La pregunta comparativa que había aquí se fue con el segundo iceberg: sin
 * dos casos no hay nada que comparar. El momento de pensar sigue estando, y
 * está donde de verdad importa: en la pausa antes del modelo mental.
 */
export const SINTESIS_INMERSION =
  "Lo que se ve —las ventas de este mes— es solo el síntoma. Lo que de verdad sostiene el problema es una creencia que nadie cuestiona: que el cliente solo vuelve por precio. Y hasta que esa creencia no cambia, la estructura tampoco.";

/*
 * Texto del cierre comparativo, en pausa junto a CASO_CANAL. Vuelve el día que
 * la pieza de los dos icebergs se retome.
 */
export const SINTESIS_COMPARATIVA_EN_PAUSA =
  "En los dos, lo que se ve (menos clientes, menos suscriptores) es solo el síntoma. Lo que de verdad sostiene el problema es una creencia que nadie cuestiona — y hasta que esa creencia no cambia, la estructura tampoco.";
