/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TITULARES DE LA PORTADA
 *
 * POR QUÉ CAMBIARON. Los cinco de antes —«Esto sí se entiende», «Tu FAE, por
 * fin clara»— hablaban de la página, no del estudiante: presumían de lo bien
 * que explicamos y, de paso, dejaban mal a la clase de la que el estudiante
 * viene. Mateo lo dijo claro el 27 de octubre: sonaban egocéntricas.
 *
 * QUÉ DICEN AHORA. Dos cosas, y ninguna es nosotros:
 *
 *   · LA HORA. Quien abre esto a las dos de la mañana y quien lo abre antes
 *     de clase no están en el mismo sitio. Reconocerlo —«Estudio mañanero»,
 *     «La madrugada es tuya»— cuesta una línea de código y es la diferencia
 *     entre un cartel y alguien que te habla.
 *   · QUE APRENDER ES TUYO. «Nadie aprende por ti», «Aprender solo también
 *     es aprender». Es lo que de verdad pasa aquí: nadie te va a dictar esto.
 *
 * LAS REGLAS DEL BANCO, para quien añada frases:
 *   1. Ni una presume de la página. El sujeto es el estudiante o la hora.
 *   2. Ninguna regaña ni mete culpa. A las 3 a.m. se acompaña, no se juzga.
 *   3. Nada que envejezca: ni fechas, ni parciales, ni semestres.
 *   4. TOPE_CARACTERES. A 320 px el titular va a 30 px: pasarse de ahí
 *      desborda a cuatro renglones y empuja las tarjetas fuera de pantalla.
 *      Hay una prueba que lo vigila; si falla, acorta la frase, no el tope.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Medido a 320 px con Sora 700 a 30 px: más de esto son cuatro renglones. */
export const TOPE_CARACTERES = 38;

/*
 * Las franjas. El corte a las 5 y no a las 6 es a propósito: a las 5:30 de la
 * mañana uno ya está «temprano», no «de madrugada». Y la madrugada empieza a
 * medianoche porque a esa hora ya nadie dice que es de noche todavía.
 */
export const FRANJAS = [
  { id: "madrugada", desde: 0, hasta: 5 },
  { id: "manana", desde: 5, hasta: 12 },
  { id: "tarde", desde: 12, hasta: 19 },
  { id: "noche", desde: 19, hasta: 24 },
];

export const FRASES = {
  /* 00:00–04:59 · Cómplice, nunca regañona: el que estudia a esta hora ya sabe que es tarde. */
  madrugada: [
    "Estudio de madrugada.",
    "A esta hora el silencio ayuda.",
    "El mundo apagado, tú encendido.",
    "La madrugada es tuya.",
    "Nadie despierto. Mejor así.",
    "Que sea corto y que sirva.",
    "Un tema más y a dormir.",
    "Lo difícil se rinde de noche.",
    "A esta hora se entiende distinto.",
    "La casa callada. Tu turno.",
    "Mañana vas a agradecerlo.",
    "Despacio, que es tarde.",
  ],
  /* 05:00–11:59 · La que pidió Mateo: «Estudio mañanero». */
  manana: [
    "Estudio mañanero.",
    "Temprano rinde el doble.",
    "La cabeza fresca es ventaja.",
    "Primera hora, primer tema.",
    "Empieza antes que el día.",
    "Un café y una cuenta T.",
    "Hoy se entiende algo nuevo.",
    "El día todavía está entero.",
    "Antes de clase, un repaso.",
    "Buen día para el debe y el haber.",
    "Arranca por lo que no entendiste.",
    "Mañana larga, tema corto.",
  ],
  /* 12:00–18:59 · La franja de los huecos entre clases. */
  tarde: [
    "La tarde da para un tema.",
    "Entre clase y clase, un repaso.",
    "Media tarde, media hora.",
    "Veinte minutos ya valen.",
    "Tarde de ejercicios.",
    "Lo que quedó de la mañana.",
    "Hoy toca el que te cuesta.",
    "Sin prisa, pero hoy.",
    "Una tarde bien usada.",
    "De aquí a la noche, un tema.",
  ],
  /* 19:00–23:59 · Cerrar el día, no empezar una maratón. */
  noche: [
    "Estudio de noche.",
    "Cierra el día entendiendo algo.",
    "Un tema antes de dormir.",
    "La noche es buena para repasar.",
    "Lo de hoy, antes de que se borre.",
    "Diez minutos y descansas.",
    "Repasa hoy, no mañana.",
    "Lo que repasas de noche, queda.",
    "El día termina mejor así.",
  ],
  /*
   * Sin hora. El corazón del banco: aprender es tuyo y se aprende haciendo.
   * Estas entran siempre, así que son las que más se van a ver.
   */
  siempre: [
    "Nadie aprende por ti.",
    "Aprender solo también es aprender.",
    "Lo autodidacta no es un plan B.",
    "Se aprende haciendo, no viendo.",
    "Entender vale más que memorizar.",
    "El que pregunta, avanza.",
    "No se te da mal: te falta práctica.",
    "Equivocarse es parte del método.",
    "Un error bien entendido enseña.",
    "Lo difícil se vuelve rutina.",
    "Poco, pero todos los días.",
    "La constancia le gana al talento.",
    "Nadie nace sabiendo partida doble.",
    "Dudar es el principio de saber.",
    "Hazlo tú y se queda.",
    "Primero entender, luego repetir.",
    "Lo que practicas, lo sabes.",
    "Aprender no es un día, son muchos.",
    "Vuelve al tema que esquivas.",
    "Lo que no entendiste sigue ahí.",
    "Entiéndelo una vez y es tuyo.",
    "Estudiar también se aprende.",
    "Empieza por lo que no sabes.",
    "Lo aburrido rinde.",
    "Media hora bien usada basta.",
    "Un tema no se entiende solo.",
    "Cada ejercicio cuenta.",
    "No hay atajo, hay método.",
    "Te falta un intento, no talento.",
    "Saber explicarlo es saberlo.",
    "Hoy un poco menos difícil.",
    "Lo que haces tú, no se olvida.",
  ],
};

/*
 * El día de la semana. No cambia la franja: añade. Un domingo a las ocho de
 * la noche puede salir «Domingo de ponerse al día» o cualquiera de las de
 * noche, y las dos son verdad.
 */
export const FRASES_DIA = {
  0: ["Domingo de ponerse al día.", "La semana empieza hoy.", "Domingo tranquilo, tema corto."],
  1: ["Lunes: empieza liviano.", "Arranca la semana entendiendo."],
  5: ["Viernes también cuenta.", "Un tema y el fin de semana."],
  6: ["Sábado sin afán.", "Fin de semana, tema pendiente."],
};

/** La franja de una hora (0–23). Devuelve el id, nunca null. */
export function franjaDe(hora) {
  const h = Number.isFinite(hora) ? ((Math.floor(hora) % 24) + 24) % 24 : 9;
  return (FRANJAS.find((f) => h >= f.desde && h < f.hasta) || FRANJAS[1]).id;
}

/*
 * Cada cuántas visitas sale una frase de la hora. La mitad.
 *
 * Sin esto no hacía falta: el banco de «siempre» tiene 32 frases y el de una
 * franja 10, así que sorteando del montón entero la de la hora salía una de
 * cada cuatro veces y Mateo podía no verla nunca. Y la frase de la hora es
 * justo la que pidió. Se sortea primero el banco y después la frase.
 */
export const PESO_DE_LA_HORA = 0.5;

/**
 * Los dos bancos de un momento, por separado: el de su hora (la franja más
 * lo que añada el día) y el de siempre.
 */
export function bancosDe(ahora = new Date()) {
  const franja = franjaDe(ahora.getHours());
  const hora = [...(FRASES[franja] || []), ...(FRASES_DIA[ahora.getDay()] || [])];
  return { hora, siempre: FRASES.siempre };
}

/**
 * Todas las frases candidatas para un momento, en un solo lote: las de su
 * franja, las del día y las de siempre. Siempre devuelve algo, aunque falle
 * todo.
 */
export function titularesDe(ahora = new Date()) {
  const { hora, siempre } = bancosDe(ahora);
  const lote = [...hora, ...siempre];
  return lote.length ? lote : FRASES.siempre;
}

/* El banco entero y plano. Lo usan las pruebas y cualquiera que necesite verlo todo. */
export const HERO_PHRASES = [...Object.values(FRASES).flat(), ...Object.values(FRASES_DIA).flat()];

export const HERO_SUBCOPY = "Elige tu materia y entra al tema.";
