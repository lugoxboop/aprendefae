import {
  DEBE, HABER, INGRESO, NOMBRE_TIPO, CRECE_POR, efectoDe, tipoDeCuenta,
} from "../data/contabilidad.js";
import {
  IZQUIERDA_O_DERECHA, DE_QUE_FAMILIA, CUADRO_DINAMICAS,
  DEBITA_O_ACREDITA, CORRIENTE_DE_CUENTAS,
} from "../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS CINCO BANCOS QUE SE SIENTAN EN «PRIMERA CLASIFICACIÓN».
 *
 * La mecánica ya existe y lleva tiempo funcionando en Cimientos y en Política
 * Monetaria. Espera una forma concreta:
 *
 *   { porPartida, pregunta, categorias[{id, nombre}], items[{id, texto,
 *     respuesta}], retro(item, elegida) }
 *
 * Los bancos de la ficha traen otra —`enunciado` y `categoria` en vez de
 * `texto` y `respuesta`, y la devolución repartida en varios mapas—, porque
 * están escritos en el lenguaje del capítulo y no en el de un componente.
 *
 * ESTE ARCHIVO TRADUCE, NO DECIDE. Aquí no vive ni una cifra ni una frase de
 * contenido: todo sale de contabilidadActividades.js o se deriva de las dos
 * reglas de contabilidad.js. Si mañana la mecánica cambia de forma, cambia
 * este archivo y el contenido no se entera.
 *
 * ═══════════ TEXTO DE INTERFAZ QUE ESCRIBÍ YO — PENDIENTE DE REVISIÓN ═══════════
 *
 * Tres cosas no venían en la ficha y hubo que escribirlas para que la pantalla
 * funcione. Van marcadas una por una más abajo con PENDIENTE:
 *
 *   1. Los rótulos de pregunta de los cinco bancos.
 *   2. El enunciado de las doce combinaciones de CU-3.
 *   3. La devolución de error de CU-4 cuando la cuenta no es un ingreso: la
 *      ficha solo trae `errorIngreso`, y los otros nueve ítems se quedarían
 *      sin una sola palabra al fallar.
 *
 * Ninguna de las tres inventa contenido: la 1 y la 2 repiten lo que ya dicen
 * las categorías y las reglas, y la 3 copia la forma exacta del `errorGenerico`
 * que Gen sí escribió para CU-9. Aun así son mías y están para que las revise.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** El nombre de una categoría dentro de su banco, para las plantillas. */
const nombreDe = (banco, id) => banco.categorias.find((c) => c.id === id)?.nombre ?? id;

/**
 * Un identificador legible a partir del nombre de una cuenta. El panel docente
 * enseña el id del ítem tal cual, así que «cu9-equipos-de-oficina» le dice algo
 * y «cu9-02» no. Además no se mueve si alguien reordena la lista.
 */
export const slug = (texto) =>
  texto.normalize("NFD").replace(/\p{Mark}/gu, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ═══════════════════ CU-1 · ¿Izquierda o Derecha? ═══════════════════ */

export const BANCO_IZQUIERDA_O_DERECHA = {
  ...IZQUIERDA_O_DERECHA,
  /* PENDIENTE: rótulo mío. Es el nombre de la actividad, en minúsculas. */
  pregunta: "¿Izquierda o derecha?",
  items: IZQUIERDA_O_DERECHA.items.map((i) => ({ ...i, texto: i.enunciado, respuesta: i.categoria })),
  /*
   * El error se explica por la familia de la cuenta y no por el ítem, tal como
   * lo dejó escrito la ficha: los diez enunciados comparten tres reglas.
   */
  retro: (item, elegida) =>
    elegida === item.respuesta
      ? item.acierto
      : IZQUIERDA_O_DERECHA.errorPorTipo[tipoDeCuenta(item.cuenta)],
};

/* ═══════════════════ CU-2 · ¿De qué familia es? ═══════════════════ */

export const BANCO_DE_QUE_FAMILIA = {
  ...DE_QUE_FAMILIA,
  /* PENDIENTE: rótulo mío. Es el nombre de la actividad. */
  pregunta: "¿De qué familia es?",
  items: DE_QUE_FAMILIA.items.map((i) => ({ ...i, texto: i.enunciado, respuesta: i.categoria })),
  /* La confusión es entre dos familias, así que la clave es «correcta>elegida». */
  retro: (item, elegida) =>
    elegida === item.respuesta
      ? item.acierto
      : DE_QUE_FAMILIA.errorPorConfusion[`${item.respuesta}>${elegida}`],
};

/* ═══════════════════ CU-3 · El Cuadro de Dinámicas ═══════════════════ */

/*
 * Las doce combinaciones se GENERAN de las dos reglas. Teclearlas permitiría
 * que la actividad enseñara lo contrario que la pieza de Aprender sin que nada
 * avisara; generándolas, las dos salen de la misma fuente por construcción.
 *
 * PENDIENTE: el enunciado de cada combinación es mío. No dice nada que no
 * digan ya el tipo de cuenta y el lado — es la combinación puesta en palabras.
 */
export const COMBINACIONES = Object.keys(CRECE_POR).flatMap((tipo) =>
  [DEBE, HABER].map((lado) => ({
    id: `cu3-${tipo}-${lado}`,
    tipo,
    lado,
    texto: `${lado === DEBE ? "Un débito" : "Un crédito"} en una cuenta de ${NOMBRE_TIPO[tipo]}`,
    respuesta: efectoDe(tipo, lado),
  })),
);

export const BANCO_CUADRO_DINAMICAS = {
  ...CUADRO_DINAMICAS,
  /* PENDIENTE: rótulo mío. Son las dos categorías, preguntadas. */
  pregunta: "¿Aumenta o disminuye?",
  items: COMBINACIONES,
  retro: (item, elegida) =>
    elegida === item.respuesta
      ? CUADRO_DINAMICAS.acierto[`${item.tipo}>${item.lado}`]
      : CUADRO_DINAMICAS.errorPorTipo[item.tipo],
};

/* ═══════════════════ CU-4 · ¿Se Debita o se Acredita? ═══════════════════ */

/*
 * PENDIENTE — EL HUECO DE VERDAD DE ESTE ARCHIVO.
 *
 * La ficha trae `errorIngreso` y nada más. Los otros nueve ítems no tienen
 * texto de error escrito, así que al fallarlos el estudiante vería la opción
 * correcta encenderse y ni una palabra explicando por qué.
 *
 * No invento la explicación: pongo la MISMA forma que Gen usó en el
 * `errorGenerico` de CU-9, que es de este mismo capítulo, y lo reporto. Si Gen
 * prefiere reusar aquí las seis explicaciones por familia de CU-3, es un cambio
 * de una línea.
 */
const errorGenericoCU4 = (item, elegida) =>
  `❌ Es ${nombreDe(DEBITA_O_ACREDITA, item.respuesta)}, no ${nombreDe(DEBITA_O_ACREDITA, elegida)}.`;

export const BANCO_DEBITA_O_ACREDITA = {
  ...DEBITA_O_ACREDITA,
  /* PENDIENTE: rótulo mío. Es el nombre de la actividad. */
  pregunta: "¿Se debita o se acredita?",
  /*
   * El enunciado lleva la cuenta pegada porque la pregunta no es sobre la
   * transacción entera: es sobre UNA de sus dos cuentas. Sin ella, «compra de
   * contado de una maquinaria» tiene dos respuestas buenas según a cuál mire.
   */
  items: DEBITA_O_ACREDITA.items.map((i) => ({
    ...i,
    texto: `${i.enunciado} — cuenta: ${i.cuenta}`,
    respuesta: i.categoria,
  })),
  retro: (item, elegida) => {
    if (elegida === item.respuesta) return item.acierto;
    return tipoDeCuenta(item.cuenta) === INGRESO
      ? DEBITA_O_ACREDITA.errorIngreso
      : errorGenericoCU4(item, elegida);
  },
};

/* ═══════════════════ CU-9 · Corriente de Cuentas ═══════════════════ */

/*
 * La familia no se escribe: se toma del catálogo. Una lista paralela podría
 * contradecirlo y entonces CU-2 y CU-9 clasificarían la misma cuenta de dos
 * maneras distintas.
 */
export const BANCO_CORRIENTE_DE_CUENTAS = {
  ...CORRIENTE_DE_CUENTAS,
  /* PENDIENTE: rótulo mío. El mismo de CU-2, con las seis familias. */
  pregunta: "¿De qué familia es?",
  items: CORRIENTE_DE_CUENTAS.cuentas.map((cuenta) => ({
    id: `cu9-${slug(cuenta)}`,
    texto: cuenta,
    cuenta,
    respuesta: tipoDeCuenta(cuenta),
  })),
  /*
   * Primero la explicación de ESA cuenta, después la regla de las dos
   * familias, y al final la genérica.
   *
   * Hoy el orden no cambia nada —ninguna cuenta y ninguna familia comparten
   * llave, así que las dos búsquedas no se pisan— y una mutación que lo
   * invierte sobrevive a las pruebas, con razón. Está así porque el día que se
   * añada una explicación de familia para un par que ya tiene una de cuenta,
   * la de la cuenta es la que tiene que ganar: es la que habla de lo que el
   * estudiante tiene delante.
   */
  retro: (item, elegida) => {
    const familia = NOMBRE_TIPO[item.respuesta];
    if (elegida === item.respuesta) return CORRIENTE_DE_CUENTAS.acierto.replace("{Familia}", familia);
    return (
      CORRIENTE_DE_CUENTAS.errorPorCuenta[`${item.cuenta}>${elegida}`]
      ?? CORRIENTE_DE_CUENTAS.errorReforzado[`${item.respuesta}>${elegida}`]
      ?? CORRIENTE_DE_CUENTAS.errorGenerico
        .replace("{familia}", familia)
        .replace("{elegida}", NOMBRE_TIPO[elegida])
    );
  },
};

/* Las cinco, en el orden del camino. */
export const BANCOS_CLASIFICACION = [
  BANCO_IZQUIERDA_O_DERECHA,
  BANCO_DE_QUE_FAMILIA,
  BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA,
  BANCO_CORRIENTE_DE_CUENTAS,
];
