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

/* La pregunta no se califica: es para pensar, o para que el profesor la haga en voz alta. */
export const PREGUNTA_INMERSION =
  "¿Qué tienen en común estos dos, aunque se vean tan distintos por fuera?";

export const SINTESIS_INMERSION =
  "En los dos, lo que se ve (menos clientes, menos suscriptores) es solo el síntoma. Lo que de verdad sostiene el problema es una creencia que nadie cuestiona — y hasta que esa creencia no cambia, la estructura tampoco.";
