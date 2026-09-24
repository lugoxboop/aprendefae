/*
 * Contenido de las cuatro actividades "Hacer" del Modelo del Iceberg.
 *
 * Cada una ataca un peldaño distinto de Bloom, y por eso ninguna se parece a
 * otra: Recordar, Aplicar, Analizar y Crear piden habilidades diferentes, no
 * la misma con otra piel. (Comprender lo cubre la mitad Aprender, y Evaluar
 * queda fuera a propósito, como candidata a una quinta.)
 *
 * El texto vive aquí y no dentro de los componentes porque ya sobrevivió a dos
 * reconstrucciones de interfaz en este mismo tema. Va a sobrevivir a la
 * siguiente.
 */

/* ═══════════ 1. CÁMARA DE PRESIÓN — Recordar ═══════════ */

/*
 * Se enseña la DEFINICIÓN y se pide el término. Nunca al revés: reconocer un
 * nombre entre cuatro es mucho más fácil que sacarlo de la memoria, y es
 * justo esa diferencia la que el modo difícil pone a trabajar.
 */
export const DEFINICIONES = [
  { termino: "Evento", definicion: "Lo que se ve en la superficie — el hecho puntual, aislado." },
  { termino: "Patrón", definicion: "Algo que se repite en el tiempo, no pasó una sola vez." },
  { termino: "Estructura", definicion: "Lo que sostiene el comportamiento por debajo — reglas, procesos, o lo que falta." },
  { termino: "Modelo mental", definicion: "La creencia de fondo que nadie cuestiona, y que explica todo lo demás." },
];

/*
 * Comparación tolerante para el modo difícil: sin tildes, sin mayúsculas y sin
 * espacios de sobra. Escribir "modelo mental" o "Modélo Mental" cuenta igual;
 * lo que se está midiendo es si el término está en la cabeza, no la ortografía.
 */
export const normalizar = (s) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .replace(/\s+/g, " ");

/* ═══════════ 3. RADAR DE PROFUNDIDAD — Aplicar ═══════════ */

/*
 * El caso del canal de YouTube, con su texto ya escrito. Las cuatro frases del
 * caso son las que puntúan; las TRAMPAS son blips de más que suenan a un nivel
 * y pertenecen a otro. No dan puntos ni lo quitan: están para que reconocer las
 * cuatro buenas cueste, que es de lo que va aplicar en contexto.
 */
export const BLIPS_RADAR = [
  {
    id: "r-evento",
    nivel: "Evento",
    texto: "Un canal de reseñas de tecnología pierde 200 suscriptores este mes, a pesar de subir el mismo número de videos de siempre.",
    puntua: true,
  },
  {
    id: "r-patron",
    nivel: "Patrón",
    texto: "Lleva 4 meses seguidos perdiendo más suscriptores de los que gana.",
    puntua: true,
  },
  {
    id: "r-estructura",
    nivel: "Estructura",
    texto: "El canal sigue con el mismo formato de 20 minutos desde hace 2 años, mientras la plataforma favorece ahora videos cortos.",
    puntua: true,
  },
  {
    id: "r-modelo",
    nivel: "Modelo mental",
    texto: "El creador cree que “si el contenido es bueno, encuentra su audiencia solo”.",
    puntua: true,
  },
  /* Suena a patrón —"cada vez que"— pero describe un hecho que pasó una vez. */
  {
    id: "r-trampa-1",
    nivel: "Evento",
    texto: "El mes pasado un video quedó desmonetizado por una disputa de derechos, y el canal perdió los ingresos de esa semana.",
    puntua: false,
    trampa: "Suena a algo que se repite, pero pasó una sola vez.",
  },
  /* Empieza con "se da por hecho": suena a creencia y es una regla del proceso. */
  {
    id: "r-trampa-2",
    nivel: "Estructura",
    texto: "En el canal se da por hecho que se publica los martes, porque así quedó el calendario de subida configurado hace dos años.",
    puntua: false,
    trampa: "Suena a creencia, pero es una regla del proceso que nadie ha cambiado.",
  },
  /* Habla de equipo y grabación: suena estructural, y es lo que el creador cree. */
  {
    id: "r-trampa-3",
    nivel: "Modelo mental",
    texto: "El creador está convencido de que su audiencia prefiere análisis largos, aunque los datos del canal digan lo contrario.",
    puntua: false,
    trampa: "Suena a un dato del canal, pero es lo que alguien cree pese a los datos.",
  },
];

export const ANILLOS = ["Evento", "Patrón", "Estructura", "Modelo mental"];

/* ═══════════ 4. EXPEDIENTE DE RESCATE — Analizar ═══════════ */

/*
 * El caso Blockbuster, con su texto y su puntuación exactamente como estaban.
 * Lo único que cambia respecto a la versión anterior es la presentación: antes
 * era una línea de tiempo, ahora es un pecio en el fondo del mar. El contenido
 * y el reparto de porcentajes no se tocan.
 */
export const RESTOS_BLOCKBUSTER = [
  {
    nivel: "Evento",
    texto: "En 2010, Blockbuster se declara en bancarrota y cierra cientos de tiendas en Estados Unidos.",
  },
  {
    nivel: "Patrón",
    texto: "Desde 2005, las visitas a las tiendas físicas venían cayendo año tras año, mientras el consumo de películas y series por internet crecía de forma sostenida.",
  },
  {
    nivel: "Estructura",
    texto: "El modelo de Blockbuster dependía de tiendas físicas, inventario de DVDs y cobros por renta atrasada, sin una plataforma de streaming propia ni acuerdos sólidos de distribución digital.",
  },
  {
    nivel: "Modelo mental",
    texto: "Los directivos creían que la experiencia física en tienda seguiría dominando el negocio, y que el streaming era una moda pasajera. De hecho, existen relatos ampliamente conocidos de que Blockbuster tuvo la oportunidad de asociarse con o adquirir a Netflix en sus primeros años, y la descartó.",
  },
];

export const PREGUNTA_RESCATE =
  "Como consultor en el año 2000, ¿en qué nivel del iceberg intervendrías para tener el mayor impacto en el futuro de Blockbuster?";

export const OPCIONES_RESCATE = [
  {
    id: "a", porcentaje: 0,
    texto: "Evento — bajar el precio de las rentas para competir",
    feedback: "❌ Bajar precios calma el dolor un rato, pero no cambia nada de fondo. Es la reacción más común — y la que menos funciona.",
  },
  {
    id: "b", porcentaje: 0,
    texto: "Patrón — abrir más tiendas para compensar la caída",
    feedback: "❌ Abrir más tiendas refuerza exactamente el modelo que ya perdía relevancia. Combate un síntoma repetido, no la causa que lo repite.",
  },
  {
    /*
     * Baja de 50 a 20. Media actividad dependía de una sola decisión, y la
     * pregunta no es tan dura como para que una respuesta incorrecta —aunque
     * razone bien sobre la estructura— valiera la mitad del total.
     */
    id: "c", porcentaje: 20,
    texto: "Estructura — invertir en una plataforma de distribución digital propia",
    feedback: "🟡 Vas bien encaminado, pero no es la jugada que más cambia las cosas. Invertir en digital ayuda, pero si la empresa sigue creyendo que la tienda física es el corazón del negocio, esa inversión queda a medias — la estructura nueva choca con la creencia vieja.",
  },
  {
    id: "d", porcentaje: 100,
    texto: "Modelo mental — cuestionar la creencia de que el negocio siempre dependerá de la tienda física",
    feedback: "✅ Correcto. Cambiar la creencia de fondo es lo que permite reconstruir todo lo demás con convicción real, no como parche. Es el movimiento que más cambia un iceberg completo.",
  },
];

/* ═══════════ 5. ARQUITECTO DE LAS PROFUNDIDADES — Crear ═══════════ */

export const EVENTO_ARQUITECTO =
  "Un equipo de fútbol profesional en Colombia pierde 4 partidos seguidos jugando de local, algo que casi nunca le había pasado en los últimos 5 años.";

/*
 * El banco. Solo tres piezas son correctas; las demás están para que haya que
 * decidir de verdad. Son de dos clases, y las dos hacen falta:
 *
 *   "cruzada"  del caso del equipo, pero de otro nivel del que aparenta.
 *   "ajena"    de otro caso del sitio (la tienda, el canal). Obliga a preguntarse
 *              no solo qué nivel es, sino si la frase habla siquiera de esto.
 */
export const BANCO_ARQUITECTO = [
  /* --- las tres correctas --- */
  {
    id: "a-patron", nivel: "Patrón", correcta: true,
    texto: "Desde hace 3 meses, el equipo llega a los partidos con la formación titular cambiada cada semana por lesiones o suspensiones.",
  },
  {
    id: "a-estructura", nivel: "Estructura", correcta: true,
    texto: "El club no tiene un plan de rotación de jugadores ni un banco de suplentes desarrollado — depende casi por completo de los mismos 11 titulares.",
  },
  {
    id: "a-modelo", nivel: "Modelo mental", correcta: true,
    texto: "La directiva cree que “los titulares de siempre son los que ganan partidos”, y ha evitado invertir en desarrollar jugadores jóvenes de reserva.",
  },

  /* --- trampas del propio caso: nivel distinto al que aparentan --- */
  {
    id: "a-t1", correcta: false, clase: "cruzada",
    texto: "La directiva despidió al director técnico después de la cuarta derrota seguida.",
    porQue: "Habla de la directiva, así que suena a creencia de fondo. Es un hecho puntual: pasó una vez.",
  },
  {
    id: "a-t2", correcta: false, clase: "cruzada",
    texto: "En el último partido, el arquero titular salió lesionado a los 20 minutos.",
    porQue: "Encaja con la historia de lesiones, pero es un evento suelto, no el patrón.",
  },
  {
    id: "a-t3", correcta: false, clase: "cruzada",
    texto: "Los hinchas creen que el equipo juega peor de local por la presión del público.",
    porQue: "Es una creencia, sí, pero no la que sostiene la estructura del club.",
  },
  {
    id: "a-t4", correcta: false, clase: "cruzada",
    texto: "El club renovó el contrato de su patrocinador principal por tres años más.",
    porQue: "Suena a decisión estructural, y no toca lo que produce las derrotas.",
  },
  {
    id: "a-t5", correcta: false, clase: "cruzada",
    texto: "El estadio se llenó en los cuatro partidos perdidos.",
    porQue: "Dato del caso, pero no explica nada de lo que pasa dentro de la cancha.",
  },
  {
    id: "a-t6", correcta: false, clase: "cruzada",
    texto: "El equipo estrenó camiseta al empezar la temporada.",
    porQue: "Coincide en el tiempo y no tiene relación causal con el resultado.",
  },

  /* --- ajenas: de otros casos del sitio --- */
  {
    id: "a-x1", correcta: false, clase: "ajena",
    texto: "Cada trimestre bajan en la misma época.",
    porQue: "Es de la tienda de ropa, no de este equipo.",
  },
  {
    id: "a-x2", correcta: false, clase: "ajena",
    texto: "No hay un sistema de fidelización de clientes.",
    porQue: "Es de la tienda de ropa.",
  },
  {
    id: "a-x3", correcta: false, clase: "ajena",
    texto: "Creemos que el cliente solo vuelve por precio.",
    porQue: "Es de la tienda de ropa.",
  },
  {
    id: "a-x4", correcta: false, clase: "ajena",
    texto: "Lleva 4 meses seguidos perdiendo más suscriptores de los que gana.",
    porQue: "Es del canal de YouTube.",
  },
  {
    id: "a-x5", correcta: false, clase: "ajena",
    texto: "El canal sigue con el mismo formato de 20 minutos desde hace 2 años.",
    porQue: "Es del canal de YouTube.",
  },
  {
    id: "a-x6", correcta: false, clase: "ajena",
    texto: "El creador cree que “si el contenido es bueno, encuentra su audiencia solo”.",
    porQue: "Es del canal de YouTube.",
  },
];

/* Las tres ranuras a llenar, en el orden en que se hunde el iceberg. */
export const RANURAS = ["Patrón", "Estructura", "Modelo mental"];

/* ═══════════ 6. TRIBUNAL DE PROFUNDIDAD — Evaluar ═══════════ */

/*
 * El peldaño que faltaba. Todas las anteriores piden encontrar la respuesta
 * buena entre distractores que se ven flojos; esta pide JUZGAR entre tres
 * explicaciones que suenan todas razonables, con un criterio explícito.
 * No hay una obviamente mala: hay una que explica más.
 */
export const CASO_TRIBUNAL =
  "Un restaurante familiar en Bogotá bajó sus reseñas de 4.5 a 3.2 estrellas en 6 meses.";

export const PISTAS_TRIBUNAL = [
  { id: "p1", texto: "El tiempo de espera subió de 15 a 40 minutos." },
  { id: "p2", texto: "El menú no ha cambiado en 3 años." },
  { id: "p3", texto: "Las reseñas negativas mencionan “se demoran mucho” más que “la comida no es buena”." },
  { id: "p4", texto: "El dueño sigue sin contratar más personal a pesar del crecimiento de pedidos por domicilio." },
];

/*
 * `explica` es qué pistas cubre cada hipótesis. De ahí sale el haz de luz del
 * final: se ve qué pista se le escapa a cada una, en vez de decir "mal".
 */
export const HIPOTESIS_TRIBUNAL = [
  {
    id: "h1",
    texto: "El dueño cree que basta con que la comida sea buena, y no le da importancia real a la velocidad del servicio.",
    explica: ["p1", "p2", "p3", "p4"],
  },
  {
    id: "h2",
    texto: "El dueño cree que las reseñas negativas son de gente que “nunca está conforme con nada”.",
    explica: ["p3"],
  },
  {
    id: "h3",
    texto: "El dueño cree que su ubicación siempre traerá clientes nuevos sin necesidad de fidelizar a los que ya tiene.",
    explica: ["p2", "p4"],
  },
];

/* De más a menos poder explicativo. H3 cubre dos pistas; H2, una. */
export const ORDEN_TRIBUNAL = ["h1", "h3", "h2"];

/*
 * El enunciado de la segunda pregunta del tribunal. Estaba escrito a mano
 * dentro del JSX del componente; vive aquí porque el panel docente necesita
 * leerlo para nombrar el ítem `criterio` en el diagnóstico por pregunta.
 *
 * Se MUEVE, no se copia: el componente lo importa desde aquí. Dejar la cadena
 * en los dos sitios habría creado exactamente la segunda copia que este
 * diseño existe para evitar.
 */
export const PREGUNTA_CRITERIO_TRIBUNAL =
  "¿Qué hace mejor a una explicación que a otra en un caso como este?";

export const CRITERIOS_TRIBUNAL = [
  { id: "c1", texto: "Explica todas las pistas", correcto: true },
  { id: "c2", texto: "Es la explicación más simple", correcto: false },
  { id: "c3", texto: "Se puede comprobar con datos", correcto: false },
];

/* ═══════════ 7. TRANSMISIÓN A LA SUPERFICIE — Efecto protégé ═══════════ */

/*
 * Explicar el caso de la tienda a alguien que baja por primera vez. Lo que se
 * mide no es si el estudiante sabe, sino si sabe DECIRLO: una frase técnicamente
 * correcta pero llena de jerga no le sirve a quien no la entiende.
 *
 *   "clara"      correcta y en el idioma de una persona. Suma.
 *   "jerga"      cierta, pero incomprensible. Resta poco: no está mal, está mal dicha.
 *   "incorrecta" falsa. Resta más.
 */
export const RANURAS_TRANSMISION = 5;

export const FRAGMENTOS_TRANSMISION = [
  { id: "t1", clase: "clara", texto: "Lo que ves primero (menos clientes) no es el problema real, es solo la señal." },
  { id: "t2", clase: "clara", texto: "Hay algo que se repite, no es solo mala suerte de un mes." },
  { id: "t3", clase: "clara", texto: "Debajo de lo que se repite hay algo que lo está causando: en este caso, que no hay forma de que un cliente vuelva." },
  { id: "t4", clase: "clara", texto: "Y más abajo hay una idea que nadie discute: que la gente solo vuelve si el precio es bueno." },
  { id: "t5", clase: "clara", texto: "Mientras esa idea siga en pie, cualquier arreglo de arriba se deshace solo." },
  { id: "t6", clase: "jerga", texto: "Existe una condición estructural subyacente que perpetúa la manifestación sintomática observable." },
  { id: "t7", clase: "jerga", texto: "Se identifica una recurrencia diacrónica en la serie de indicadores de retención." },
  { id: "t8", clase: "jerga", texto: "El paradigma cognitivo del agente decisor opera como variable latente no problematizada." },
  { id: "t9", clase: "incorrecta", texto: "El problema se resuelve bajando los precios." },
  { id: "t10", clase: "incorrecta", texto: "Lo que se ve en la superficie es siempre la causa verdadera." },
  { id: "t11", clase: "incorrecta", texto: "Si el evento no se repite, no hace falta mirar más abajo." },
];

/* ═══════════ 8. CORRIENTE CRUZADA — Práctica intercalada ═══════════ */

/*
 * Los cuatro casos del tema, mezclados a propósito y nunca agrupados. Clasificar
 * frases de un caso que se acaba de leer es fácil; hacerlo cuando la siguiente
 * frase viene de otro mundo obliga a generalizar la regla en vez de recordar
 * ese caso concreto.
 *
 * El texto no es nuevo: son las frases ya escritas y ya clasificadas de la
 * tienda, el canal, Blockbuster y el equipo de fútbol.
 */
export const CORRIENTE = [
  /* --- la tienda --- */
  { id: "c-t1", caso: "La tienda", nivel: "Evento", texto: "Las ventas caen este mes." },
  { id: "c-t2", caso: "La tienda", nivel: "Patrón", texto: "Cada trimestre bajan en la misma época." },
  { id: "c-t3", caso: "La tienda", nivel: "Estructura", texto: "No hay un sistema de fidelización de clientes." },
  { id: "c-t4", caso: "La tienda", nivel: "Modelo mental", texto: "Creemos que el cliente solo vuelve por precio." },
  /* --- el canal --- */
  { id: "c-c1", caso: "El canal", nivel: "Evento", texto: "Pierde 200 suscriptores este mes, subiendo los mismos videos de siempre." },
  { id: "c-c2", caso: "El canal", nivel: "Patrón", texto: "Lleva 4 meses seguidos perdiendo más suscriptores de los que gana." },
  { id: "c-c3", caso: "El canal", nivel: "Estructura", texto: "Sigue con el mismo formato de 20 minutos desde hace 2 años." },
  { id: "c-c4", caso: "El canal", nivel: "Modelo mental", texto: "El creador cree que “si el contenido es bueno, encuentra su audiencia solo”." },
  /* --- Blockbuster --- */
  { id: "c-b1", caso: "Blockbuster", nivel: "Evento", texto: "En 2010 se declara en bancarrota y cierra cientos de tiendas." },
  { id: "c-b2", caso: "Blockbuster", nivel: "Patrón", texto: "Desde 2005 las visitas a las tiendas caían año tras año." },
  { id: "c-b3", caso: "Blockbuster", nivel: "Estructura", texto: "El modelo dependía de tiendas físicas y DVDs, sin plataforma propia." },
  { id: "c-b4", caso: "Blockbuster", nivel: "Modelo mental", texto: "Los directivos creían que el streaming era una moda pasajera." },
  /* --- el equipo --- */
  { id: "c-f1", caso: "El equipo", nivel: "Evento", texto: "Pierde 4 partidos seguidos jugando de local." },
  { id: "c-f2", caso: "El equipo", nivel: "Patrón", texto: "Desde hace 3 meses llega con la titular cambiada cada semana." },
  { id: "c-f3", caso: "El equipo", nivel: "Estructura", texto: "El club no tiene plan de rotación ni banco de suplentes desarrollado." },
  { id: "c-f4", caso: "El equipo", nivel: "Modelo mental", texto: "La directiva cree que “los titulares de siempre son los que ganan”." },
];
