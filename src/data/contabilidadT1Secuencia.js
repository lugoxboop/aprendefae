import { ID } from "./contabilidadIntro.js";
import { pantallasDe } from "./contabilidadT1Pantallas.js";
import { ID_P2, ID_P3 } from "./contabilidadPiezas234.js";
import { CALEJA, ACTIVO, PASIVO, PATRIMONIO, mayorConSaldos, tipoDeCuenta } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER EN SECUENCIA — LOS TEXTOS DE CADA PANTALLA (lote 6).
 *
 * Lo que `SecuenciaAprender` lee de cada pantalla y que no estaba en
 * `contabilidadT1Pantallas.js`: el titular, el apoyo, los rótulos cortos de
 * las paradas y el nombre accesible de la figura. Las pistas, devoluciones y
 * citas NO se repiten aquí: se toman de la pantalla de la ficha (`deFicha`),
 * que es la que auditó Shoko.
 *
 * Fuentes, leídas una vez:
 *   · el corte y la forma: fichas/b-t1-aprender-secuencia-forma-mai.md (Mai);
 *   · los titulares, apoyos y rótulos: fichas/b-t1-aprender-titulares-futaba.md
 *     (Futaba), con los cinco rótulos que Mai cambió al medirlos
 *     (fichas/b-t1-titulares-medidos-mai.md §2);
 *   · «Ocho leen lo mismo»: fichas/b-t1-lote-24oct-c-futaba.md §3 (dos pasos de
 *     cuatro, mezclados), en 2×2 (Mai §7; PASA de Shoko en
 *     revisiones/b-t1-496-520-lote-c-shoko.md).
 *
 * Ningún id publicado cambia: `cu0-a1` sigue siendo el recorrido de un hecho.
 * La pieza nueva lleva un id nuevo.
 *
 * ── [ESCRITO POR CLAUDE — PENDIENTE DE FUTABA] ── Las fichas no traen tres
 * clases de texto que el componente pide, y van escritas por Kaede: la
 * `razon` de cada Haz (por qué «Siguiente» espera, D11), el `nombreFigura`
 * (nombre accesible del <figure>, sin la respuesta: D9) y la invitación
 * «Toca la ficha». Todo lo demás es de Futaba o publicado.
 *
 * En cu0-a2, cu0-a3 y cu0-a4 (lote 6, segunda tanda) van escritos por Kaede,
 * además, los textos marcados `/* CLAUDE *\/` al lado: los rótulos de los
 * botones que se tocan en los Míralo (las fichas dicen qué se toca, no cómo se
 * llama el botón) y las invitaciones «Toca la línea» y «Toca el informe».
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La pantalla `n` de la ficha de Futaba de una pieza (las pistas y devoluciones auditadas). */
export const deFicha = (pieza, n) => pantallasDe(pieza).find((p) => p.n === n) ?? null;

export const ID_OCHO_LEEN = "cu0-a1b-ocho-leen-lo-mismo";

/* ═══════════════════ cu0-a1 · EL RECORRIDO DE UN HECHO (10) ═══════════════════ */

export const A1_SEC = {
  id: ID,
  pantallas: {
    prediccion: {
      titular: "¿Cuántos pasos hay desde que pasa algo?",
      apoyo: "Mucha gente cree que la contabilidad es solo anotar. ¿Cuántos pasos hay hasta que alguien decide?",
      opciones: ["Uno", "Tres", "Cinco"],
      /* La misma para las tres: la predicción no califica. Lote G de Futaba (la de Shoko, tal cual). */
      respuesta: "Del hecho a la decisión hay cinco pasos, y anotar es el tercero.",
      razon: "Elige cuántos crees. Aquí no hay respuesta mala.",
      nombreFigura: "Una vía todavía vacía y una libreta, con tres respuestas para elegir.",
    },
    verbos: {
      titular: "Anotar es uno de siete verbos",
      /* Lote G de Futaba. */
      apoyo: "Toca lo que el sistema permite hacer con los hechos. Son siete verbos; registrar es anotar.",
      nombreFigura: "La definición del libro, con siete verbos para tocar y un contador.",
    },
    adentroAfuera: {
      titular: "Unos la miran desde adentro, otros desde afuera",
      apoyo: "Sirve para saber cómo va la empresa. Toca a los de adentro y a los de afuera.",
      adentro: "Los de adentro son los dueños, los jefes y los empleados.",
      afuera: "Los de afuera no son parte de la empresa: la miran y leen sus informes.",
      rotulos: { adentro: "Adentro", afuera: "Afuera" },
      nombreFigura: "La empresa, con un grupo de personas adentro y otro afuera.",
    },
    hecho: {
      titular: "Pasa algo en la empresa",
      apoyo: "Caleja compra un computador por $25.000. No lo paga: lo queda debiendo. Eso pasó de verdad.",
      toca: "Toca la ficha",
      nombreFigura: "El primer punto del ciclo encendido y una ficha para tocar.",
    },
    papel: {
      titular: "Queda un papel",
      apoyo: "Ese hecho dejó un papel. Sin papel no hay nada que anotar.",
      toca: "Toca la ficha",
      nombreFigura: "El segundo punto del ciclo encendido y la ficha del hecho.",
    },
    paradaPapel: {
      titular: "¿Qué pasa con el papel?",
      apoyo: "Ya hay un papel. ¿Qué crees que pasa con él ahora?",
      /* Rótulos cortos de Futaba (≤ 20 caracteres), en el orden de las opciones de la ficha. */
      rotulos: { anota: "A los libros", guarda: "Se guarda", estado: "Al Estado" },
      razon: "Elige qué crees que pasa con el papel.",
      nombreFigura: "La factura y el tercer punto del ciclo con un signo de pregunta.",
    },
    anota: {
      titular: "Se anota",
      apoyo: "Mucha gente cree que aquí termina todo. Vas en el punto tres de cinco.",
      toca: "Toca la ficha",
      nombreFigura: "El tercer punto del ciclo encendido y la factura.",
    },
    informe: {
      titular: "Sale un informe",
      /* Lote G de Futaba: con 4 renglones, «entre muchas» exageraba. */
      apoyo: "La nota se juntó con las demás en un informe. Tu computador ya es una de sus líneas.",
      toca: "Toca la ficha",
      /* Lote G: el balance de después de la segunda transacción (pp. 36-37), entero y sin pie; ver balanceDelHecho. */
      totales: { activos: "Total activos", pasivosMasPatrimonio: "Total pasivo y patrimonio" },
      nombreFigura: "El cuarto punto del ciclo encendido y el renglón del libro.",
    },
    paradaQuien: {
      titular: "¿Quién usa el informe para decidir?",
      apoyo: "El informe llegó a una mesa. ¿Quién crees que lo usa para decidir qué hace la empresa?",
      /* «Los jefes» y no «Los administradores»: la palabra no cabe en la fila de tres (Mai, medidas §2). */
      rotulos: { administradores: "Los jefes", estado: "El Estado", clientes: "Los clientes" },
      razon: "Elige quién crees que decide.",
      nombreFigura: "El informe sobre una mesa vacía y el quinto punto del ciclo apagado.",
    },
    cierre: {
      titular: "Los jefes deciden",
      pasos: [
        "El informe llegó a la mesa de los jefes. Lo que preguntan se contesta con todo el informe.",
        "Ellos deciden qué hace la empresa. Por eso la flecha vuelve al comienzo.",
      ],
      pie: "Basado en el libro, p. 6",
      nombreFigura: "Los cinco puntos del ciclo encendidos y la pregunta en la mesa de los jefes.",
    },
  },
};

/*
 * ═══════════ EL BALANCE DE LA ESTACIÓN 4 (lote G de Futaba, §2) ═══════════
 *
 * El de después de la SEGUNDA transacción (pp. 36-37, total $325.000): el
 * momento del hecho que sigue la pieza, con el computador comprado y sin
 * pagar. Se calcula desde el mayor publicado cortado en las dos primeras
 * transacciones; las actividades que usan las seis no cambian. La caja se
 * rotula «Efectivo», como la tabla del libro y t1-7.
 */
export const TRANSACCIONES_DEL_BALANCE_A1 = 2;
const ROTULO_DEL_LIBRO = { Caja: "Efectivo" };
const ORDEN_SECCION = [ACTIVO, PASIVO, PATRIMONIO];
export function balanceDelHecho(transacciones = CALEJA.transacciones.slice(0, TRANSACCIONES_DEL_BALANCE_A1)) {
  const cuentas = mayorConSaldos(transacciones)
    .map((c) => ({ cuenta: c.cuenta, rotulo: ROTULO_DEL_LIBRO[c.cuenta] ?? c.cuenta, valor: c.saldo, seccion: tipoDeCuenta(c.cuenta) }))
    .sort((a, b) => ORDEN_SECCION.indexOf(a.seccion) - ORDEN_SECCION.indexOf(b.seccion) || b.valor - a.valor);
  const totalDe = (...ss) => cuentas.filter((c) => ss.includes(c.seccion)).reduce((t, c) => t + c.valor, 0);
  const activos = totalDe(ACTIVO);
  const pasivosMasPatrimonio = totalDe(PASIVO, PATRIMONIO);
  return { cuentas, activos, pasivosMasPatrimonio, cuadra: activos === pasivosMasPatrimonio };
}


/* ═══════════════════ PIEZA NUEVA · OCHO LEEN LO MISMO (4) ═══════════════════ */

export const OCHO_SEC = {
  id: ID_OCHO_LEEN,
  pantallas: {
    paso1: {
      titular: "Cuatro personas, un mismo informe",
      apoyo: "Toca a cada persona. Mira qué le pregunta al mismo informe.",
      /* Futaba, lote C §3: ningún paso coincide con una zona, y las parejas que se confunden quedan separadas. */
      personas: ["propietarios", "acreedores", "empleados", "asociaciones"],
      nombreFigura: "El mismo informe y cuatro personas para tocar.",
    },
    paso2: {
      titular: "Otras cuatro, el mismo informe",
      apoyo: "Toca a cada persona. Mira qué le pregunta al mismo informe.",
      personas: ["clientes", "administradores", "inversionistas", "estado"],
      nombreFigura: "El mismo informe y otras cuatro personas para tocar.",
    },
    frase: {
      titular: "¿Qué hace la contabilidad?",
      razon: "Elige una frase para seguir.",
      nombreFigura: "Cuatro frases para elegir.",
    },
    puente: {
      titular: "El informe tiene dos lados",
      apoyo: "En la siguiente pieza vas a ver por qué los dos lados del informe siempre dan igual.",
      nombreFigura: "El informe partido en dos lados.",
    },
  },
  /*
   * Los nombres cortos de la rejilla (Mai §7: «Administradores» es la palabra
   * más larga que cabe; los nombres publicados también caben y la decisión es
   * de contenido). Se usan los cortos que midió Mai; el lector de pantalla
   * lee el nombre publicado entero.
   */
  corto: {
    propietarios: "Propietarios", acreedores: "Acreedores", empleados: "Empleados", asociaciones: "Asociaciones",
    clientes: "Clientes", administradores: "Administradores", inversionistas: "Inversionistas", estado: "El Estado",
  },
};

/* ═══════════════════ cu0-a2 · LA ECUACIÓN CONTABLE (10) ═══════════════════ */
/*
 * Titulares, apoyos, rótulos y pasos: Futaba (b-t1-aprender-titulares-futaba.md),
 * con «Uno sube, otro baja» → «Van al revés» en a2 · 6 y a2 · 7 (Mai, medidas §2).
 * Las respuestas, pistas y devoluciones salen de la ficha (deFicha(ID_P2, n)).
 */
export const A2_SEC = {
  id: ID_P2,
  pantallas: {
    prediccion: {
      titular: "¿Quién puso todo esto?",
      apoyo: "Esta torre es todo lo que tiene una empresa. ¿Quién crees que la puso?",
      opciones: ["Solo los dueños", "Solo otros", "Dueños y otros"],
      nombreFigura: "Una torre de tres bloques, sin rótulos, y tres respuestas para elegir.",
    },
    nombres: {
      titular: "Tres nombres para la misma torre",
      apoyo: "Toca cada tramo: lo que tiene, lo que debe y lo de los dueños.",
      /* CLAUDE: los rótulos de los tres botones, tomados del apoyo de Futaba. */
      rotulos: { activo: "Lo que tiene", pasivo: "Lo que debe", patrimonio: "Lo de los dueños" },
      nombreFigura: "La torre y tres partes de ella para tocar.",
    },
    ecuacion: {
      titular: "La ecuación contable",
      apoyo: "Lo que tiene es igual a lo que debe más lo de los dueños: la ecuación contable.",
      nombreFigura: "La ecuación con sus tres nombres para tocar, y la torre.",
    },
    dosLados: {
      titular: "Un lado dice qué hay; el otro, de dónde salió",
      apoyo: "A eso le vamos a decir los dos lados. Toca cada uno.",
      /* CLAUDE: lo que dice cada lado de la torre antes de tocarlo. */
      rotulos: { izquierda: "Lado izquierdo", derecha: "Lado derecho" },
      nombreFigura: "La torre con sus dos lados para tocar, y la cita del libro.",
    },
    dosVeces: {
      titular: "La misma torre, contada dos veces",
      apoyo: "Léela por la izquierda, luego por la derecha. Las dos lecturas llegan a la misma altura.",
      /* Los tres pasos de Futaba: los dos primeros los da el toque de cada lectura; el tercero, «Siguiente». */
      pasos: [
        "Ahora léela por la izquierda. Cada bloque dice qué cosa es. Eso es el activo.",
        "Por la derecha, cada tramo dice quién lo puso: otros, o los dueños.",
        "Misma torre, misma altura. Son las mismas cosas contadas dos veces.",
      ],
      rotulos: { izquierda: "Por la izquierda", derecha: "Por la derecha" }, /* CLAUDE */
      nombreFigura: "La torre con sus dos lecturas para tocar.",
    },
    parada: {
      titular: "Compra algo y lo queda debiendo",
      apoyo: "La empresa compra algo nuevo y lo queda debiendo. ¿Qué crees que le pasa a la torre?",
      rotulos: { crecen: "Crecen los dos", "uno-baja": "Van al revés", "no-cambia": "No cambia" },
      /* El tramo nuevo de la derecha, como lo nombra la ficha (a2 · 11, `ve`). */
      vendedor: "del vendedor",
      razon: "Elige qué crees que le pasa a la torre.",
      nombreFigura: "La torre con un bloque nuevo esperando encima.",
    },
    casos: {
      titular: "Cuatro hechos, cuatro casos",
      apoyo: "Lee cada hecho. ¿Qué crees que le pasa a la torre?",
      rotulos: { crecen: "Crecen los dos", bajan: "Bajan los dos", "al-reves": "Van al revés" },
      razon: "Responde los cuatro hechos para seguir.",
      nombreFigura: "Un hecho de la empresa, tres respuestas y la torre.",
    },
    regla: {
      titular: "Suben juntos, bajan juntos o quedan igual",
      apoyo: "Nunca vas a ver que uno suba y el otro baje.",
      /* CLAUDE: las tres flechas de Mai (↑↑ ↓↓ ==), con las palabras del titular de Futaba. */
      rotulos: { suben: "↑↑ Suben juntos", bajan: "↓↓ Bajan juntos", igual: "= = Quedan igual" },
      nombreFigura: "La torre y tres movimientos para tocar.",
    },
    frase: {
      titular: "¿Por qué los dos lados dan igual?",
      apoyo: "Elige la frase que mejor lo explica.",
      razon: "Elige una frase para seguir.",
      nombreFigura: "Cuatro frases para elegir.",
    },
    puente: {
      titular: "La torre es una foto de un día",
      apoyo: "En la siguiente pieza vas a ver qué pasa entre dos fotos.",
      nombreFigura: "La torre leída por los dos lados, con un reloj que marca un día.",
    },
  },
};

/* ═══════════════════ cu0-a3 · LA FOTO Y LA PELÍCULA (10) ═══════════════════ */
/*
 * Rótulos de la prueba (a3 · 8): «La película: todo el año» → «La película» y
 * «Comparar las dos fotos» → «Las dos fotos» (Mai, medidas §2); «Una foto» queda.
 * Los errores de la prueba salen de evaluarP3 (ERROR_P3), sin reescribir.
 */
export const A3_SEC = {
  id: ID_P3,
  pantallas: {
    prediccion: {
      titular: "¿Basta con mirar un solo día?",
      apoyo: "Te piden saber cómo le fue a una empresa en el año.",
      opciones: ["Sí, basta", "No basta"],
      nombreFigura: "Una foto de la empresa y dos respuestas para elegir.",
    },
    informes: {
      titular: "Dos informes, dos tiempos",
      apoyo: "Uno muestra un día exacto. El otro, todo un periodo. Toca cada uno.",
      pasos: [
        "El estado de situación financiera muestra qué tiene, qué debe y qué es de los dueños un día.",
        "El estado de resultados muestra qué vendió y qué gastó durante todo un periodo.",
      ],
      nombreFigura: "Dos informes para tocar.",
    },
    apodos: {
      titular: "A uno le decimos foto; al otro, película",
      apoyo: "Una foto es de un instante. Una película dura un rato.",
      paso: "Hay más informes: el de la plata, el de los cambios de los dueños y las notas.",
      rotulos: { foto: "La foto", pelicula: "La película" },
      nombreFigura: "Una cámara y una cinta para tocar.",
    },
    enero: {
      titular: "El 1 de enero se toma una foto",
      apoyo: "Aquí está un año entero de la empresa. La foto muestra qué tenía y qué debía ese día.",
      toca: "Toca la línea", /* CLAUDE */
      nombreFigura: "La línea de un año, todavía sin fotos.",
    },
    parada: {
      titular: "¿La foto del final será igual?",
      apoyo: "Llega el 31 de diciembre. ¿Crees que la nueva foto se parece a la del 1 de enero?",
      rotulos: { distinta: "Distinta", igual: "Igual", "no-hay": "No hay otra foto" },
      razon: "Elige cómo crees que será la foto.",
      nombreFigura: "La foto del 1 de enero, el año y el hueco de la segunda foto.",
    },
    diciembre: {
      titular: "Entre las dos fotos pasó todo el año",
      apoyo: "El 31 de diciembre se toma otra foto. La película cuenta lo que vendió y gastó en medio.",
      nombreFigura: "La línea del año con la foto del 1 de enero; el tramo y el hueco del final, para tocar.",
    },
    cambio: {
      titular: "Lo de en medio explica el cambio",
      apoyo: "Las dos fotos son el mismo informe. Lo de en medio explica por qué la segunda es distinta.",
      nombreFigura: "Las dos fotos y el tramo, para recorrer tocando.",
    },
    prueba: {
      titular: "¿Qué informe responde?",
      apoyo: "Lee la pregunta. Toca el informe que la responde.",
      rotulos: { foto: "Una foto", pelicula: "La película", comparar: "Las dos fotos" },
      razon: "Responde las cinco preguntas para seguir.",
      nombreFigura: "Una pregunta, tres respuestas y la línea del año.",
    },
    frase: {
      titular: "¿En qué se diferencian?",
      apoyo: "Elige la frase que mejor lo dice.",
      razon: "Elige una frase para seguir.",
      nombreFigura: "Cuatro frases para elegir.",
    },
    puente: {
      titular: "Falta un informe más",
      apoyo: "Ya tienes la foto y la película. Ahora vas a ver cómo se pasan cifras.",
      nombreFigura: "La foto, la película y una tercera tarjeta que se enciende.",
    },
  },
};
