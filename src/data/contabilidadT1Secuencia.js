import { ID } from "./contabilidadIntro.js";
import { pantallasDe } from "./contabilidadT1Pantallas.js";

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
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La pantalla `n` de la ficha de Futaba de una pieza (las pistas y devoluciones auditadas). */
export const deFicha = (pieza, n) => pantallasDe(pieza).find((p) => p.n === n) ?? null;

export const ID_OCHO_LEEN = "cu0-a1b-ocho-leen-lo-mismo";

/* ═══════════════════ cu0-a1 · EL RECORRIDO DE UN HECHO (10) ═══════════════════ */

const A1_BASE = {
  id: ID,
  pantallas: {
    prediccion: {
      titular: "¿Cuántos pasos hay desde que pasa algo?",
      apoyo: "Mucha gente cree que la contabilidad es solo anotar. ¿Cuántos pasos hay hasta que alguien decide?",
      opciones: ["Uno", "Tres", "Cinco"],
      /* La misma para las tres: la predicción no califica. */
      respuesta: "Son cinco, y anotar es solo el tercero. Con las notas sale un informe, y alguien decide.",
      razon: "Elige cuántos crees. Aquí no hay respuesta mala.",
      nombreFigura: "Una vía todavía vacía y una libreta, con tres respuestas para elegir.",
    },
    verbos: {
      titular: "Anotar es uno de siete verbos",
      apoyo: "Toca cada cosa que el sistema permite hacer. Son siete. Registrar, que es anotar, es solo una.",
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
      apoyo: "La nota se juntó con las demás en un informe. Tu computador ya es una línea entre muchas.",
      toca: "Toca la ficha",
      /* Futaba: cuatro renglones, uno el del computador; el pie dice cuántos quedan. */
      renglones: ["Caja", "Equipo de computación", "Cuentas por pagar", "Aportes sociales"],
      pie: (n) => `y ${n} líneas más`,
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
 * ═══════════ LOTE G DE FUTABA (cu0-a1 · pantallas 1, 2 y 8) ═══════════
 *
 * Los sitios de los textos nuevos del lote G, listos y vacíos: aquí no se
 * inventa nada. Un campo con valor reemplaza al de la pantalla; `null` deja
 * lo de siempre.
 *
 *   prediccion  el apoyo de la pantalla 1 (la pregunta de la predicción)
 *   respuesta   la respuesta de la predicción (la misma para las tres)
 *   verbos      el apoyo de la pantalla 2
 *   renglones   los renglones del balance de la pantalla 8, en orden (cuentas
 *               de BALANCE); el pie «y n líneas más» se recalcula solo
 *
 * Las paradas 6 y 9 no se tocan.
 */
export const LOTE_G_A1 = { prediccion: null, respuesta: null, verbos: null, renglones: null };

/* Las pantallas de cu0-a1 con lo que traiga el lote G encima. */
export function conLoteG(base, lote = {}) {
  const p = base.pantallas;
  const v = (k) => lote?.[k] ?? null;
  return {
    ...base,
    pantallas: {
      ...p,
      prediccion: { ...p.prediccion, ...(v("prediccion") ? { apoyo: v("prediccion") } : {}), ...(v("respuesta") ? { respuesta: v("respuesta") } : {}) },
      verbos: { ...p.verbos, ...(v("verbos") ? { apoyo: v("verbos") } : {}) },
      informe: { ...p.informe, ...(v("renglones") ? { renglones: [...v("renglones")] } : {}) },
    },
  };
}

export const A1_SEC = conLoteG(A1_BASE, LOTE_G_A1);

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
