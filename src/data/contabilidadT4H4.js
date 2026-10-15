/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H4 DE HACER — «El arqueo de Rosa» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h4-v1.md (sin archivos de
 * cambios). Copia en orquestador/conocimiento/paquetes/, el mismo blob que en
 * main. Una prueba compara cada texto de aquí contra él, letra por letra.
 *
 * Hacer · evaluativa · medio · 25 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0203, que corre Erwin.
 *
 * Seis rondas construidas (una por mes, de junio a noviembre); cada intento
 * sortea tres: una que cuadra, una con sobrante y una con faltante de caja
 * menor, y baraja su orden (D8). Cada ronda tiene tres preguntas en orden
 * —¿qué muestra el arqueo?, ¿de cuánto es la diferencia?, ¿por cuánto sale
 * el cheque?—, y la segunda no se hace si el arqueo cuadra. Un intento por
 * pregunta; si falla una, las demás se juegan igual, con la respuesta
 * correcta ya a la vista (Katsumi).
 *
 * Las cifras: el fondo de 500.000 es el de A2, como dato (se importa). Los
 * gastos y el efectivo de cada ronda son datos construidos; TODO LO DEMÁS SE
 * CALCULA: la suma, la diferencia, el cheque y los dos distractores de cada
 * pregunta. Una prueba comprueba que los textos del paquete dicen lo mismo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FONDO } from "./contabilidadT4A2.js";

export const H4_ID = "t4-el-arqueo-de-rosa";

export const H4 = {
  id: H4_ID,
  nombre: "El arqueo de Rosa",
  objetivo: "Hacer el arqueo de una caja menor y calcular por cuánto sale el cheque del reembolso.",
  consigna: [
    "Cada ronda es un mes de la caja menor de Rosa. Con los gastos y el efectivo, decide si cuadra, cuánto se aleja y por cuánto sale el cheque.",
    "Tienes un intento por pregunta. Después de cada respuesta verás la cuenta hecha.",
  ],
};

export const CUADRA = "cuadra";
export const SOBRANTE = "sobrante";
export const FALTANTE = "faltante";
export const SUBTEMAS_H4 = ["Fondo que cuadra", "Sobrante de caja menor", "Faltante de caja menor"];
const SUBTEMA = { [CUADRA]: SUBTEMAS_H4[0], [SOBRANTE]: SUBTEMAS_H4[1], [FALTANTE]: SUBTEMAS_H4[2] };

/* Las preguntas y las opciones de la primera: del paquete («Cómo se juega cada ronda»). */
export const PREGUNTAS_H4 = {
  arqueo: "¿Qué muestra el arqueo?",
  diferencia: "¿De cuánto es la diferencia?",
  cheque: "¿Por cuánto sale el cheque del reembolso?",
};
export const OPCIONES_ARQUEO = { [CUADRA]: "Cuadra", [SOBRANTE]: "Hay un sobrante de caja menor", [FALTANTE]: "Hay un faltante de caja menor" };

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el
 * paquete no trae: los botones y la palabra de la devolución, con la
 * convención de los Hacer de T4; el encabezado «PREGUNTA n», de la pantalla
 * de Hanayama (v1.1, PH4-1: sin total); el resumen del cierre.
 */
export const BOTON_H4 = { siguientePregunta: "Siguiente pregunta", siguienteRonda: "Siguiente ronda", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const INCORRECTO = "Incorrecto.";
export const encabezadoH4 = (n) => `Pregunta ${n}`;
export const resumenH4 = (bien, cuantas) => `${bien} de ${cuantas} preguntas al primer toque.`;
export const lectorErrorH4 = (correcta) => `Incorrecto. La respuesta es ${correcta}.`;

/* ═══════════ LAS RONDAS ═══════════ */

/* Las cifras con el formato del libro, con «$». */
export const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/*
 * Una ronda: el mes y sus dos datos construidos. Lo demás se calcula, y los
 * textos que nombran cifras se arman con ellas. Los textos son los de
 * Katsumi; una prueba compara cada uno, ronda por ronda, contra el paquete.
 */
function ronda(n, mes, gastos, efectivo) {
  const suma = gastos + efectivo;
  const tipo = suma === FONDO ? CUADRA : suma > FONDO ? SOBRANTE : FALTANTE;
  const diferencia = Math.abs(suma - FONDO);
  const cheque = FONDO - efectivo;
  const [g, e, s, d, c, f] = [gastos, efectivo, suma, diferencia, cheque, FONDO].map(pesos);
  const queda = FONDO - gastos;

  /* Pregunta 1 · ¿Qué muestra el arqueo? */
  const arqueo = {
    id: "arqueo",
    pregunta: PREGUNTAS_H4.arqueo,
    correcta: tipo,
    opciones: {
      [CUADRA]: tipo === CUADRA
        ? `Así es. ${g} más ${e} dan ${f}, justo el fondo.`
        : `Suma los dos: ${g} más ${e} dan ${s}, y el fondo es de ${f}. No da exacto.`,
      [SOBRANTE]: tipo === SOBRANTE
        ? `Así es. ${g} más ${e} dan ${s}: más que los ${f} del fondo.`
        : tipo === CUADRA
          ? `Suma los dos: ${g} más ${e} dan ${f}. Es justo el fondo, así que no hay diferencia. No sobra nada.`
          : `Al revés. La suma da ${s}, menos que el fondo: falta plata.`,
      [FALTANTE]: tipo === FALTANTE
        ? `Así es. ${g} más ${e} dan ${s}: menos que los ${f} del fondo.`
        : tipo === CUADRA
          ? `Suma los dos: ${g} más ${e} dan ${f}. Es justo el fondo, así que no hay diferencia. No falta nada.`
          : `Al revés. La suma da ${s}, más que el fondo: sobra plata.`,
    },
    texto: (id) => OPCIONES_ARQUEO[id],
  };

  /* Pregunta 2 · ¿De cuánto es la diferencia? Solo si no cuadra. */
  const pregDiferencia = tipo === CUADRA ? null : {
    id: "diferencia",
    pregunta: PREGUNTAS_H4.diferencia,
    correcta: "diferencia",
    opciones: {
      diferencia: tipo === SOBRANTE ? `Así es. ${s} menos ${f} da ${d}.` : `Así es. ${f} menos ${s} da ${d}.`,
      queda: `Eso es lo que debería quedar en la caja: ${f} menos los gastos. La diferencia compara la suma con el fondo, y da ${d}.`,
      suma: `Esa es la suma de gastos y efectivo. La diferencia es cuánto se aleja esa suma de los ${f}: ${d}.`,
    },
    texto: (id) => pesos({ diferencia, queda, suma }[id]),
  };

  /* Pregunta 3 · ¿Por cuánto sale el cheque? */
  const pregCheque = {
    id: "cheque",
    pregunta: PREGUNTAS_H4.cheque,
    correcta: "cheque",
    ...(tipo === CUADRA ? {
      opciones: {
        cheque: `Así es. Si el fondo cuadra, el cheque repone justo lo gastado: ${c}.`,
        fondo: `El cheque no repone el fondo entero, porque en la caja quedan ${e}. Solo repone lo gastado: ${c}.`,
        efectivo: `Eso es lo que queda en la caja. El cheque repone lo que se gastó: ${c}.`,
      },
      texto: (id) => pesos({ cheque, fondo: FONDO, efectivo }[id]),
    } : tipo === SOBRANTE ? {
      opciones: {
        cheque: `Así es. Los gastos fueron ${g}, pero los ${d} de más ya están en la caja. El cheque sale por ${c}.`,
        gastos: `Ese es el total de los gastos. Con un sobrante de caja menor, el cheque sale por menos: ${g} menos ${d}, ${c}.`,
        alReves: `Eso suma la diferencia en vez de restarla. La plata de más ya está en la caja, así que el cheque sale por menos de lo gastado: ${c}.`,
      },
      texto: (id) => pesos({ cheque, gastos, alReves: gastos + diferencia }[id]),
    } : {
      opciones: {
        cheque: `Así es. El cheque repone los ${g} de gastos y los ${d} que faltan: ${c}.`,
        gastos: `Ese es el total de los gastos. Pero en la caja faltan ${d}, y el cheque los repone también: ${c}.`,
        alReves: `Eso resta la diferencia en vez de sumarla. Falta plata, así que el cheque sale por más de lo gastado: ${c}.`,
      },
      texto: (id) => pesos({ cheque, gastos, alReves: gastos - diferencia }[id]),
    }),
  };

  return {
    id: `h4-${n}`,
    mes,
    tipo,
    subtema: SUBTEMA[tipo],
    fondo: FONDO, gastos, efectivo, suma, diferencia, cheque, queda,
    enunciado: `Mes de ${mes}. El fondo de Rosa es de ${f}. Los soportes de lo que pagó suman ${g}, y en la caja hay ${e}.`,
    preguntas: [arqueo, pregDiferencia, pregCheque].filter(Boolean),
    cierre: `Con los ${e} de la caja y el cheque de ${c}, el fondo vuelve a ${f}.`,
    pie: "Basado en el libro, pp. 182-186. Cifras construidas",
  };
}

/* Los datos construidos de Katsumi: el mes, los gastos y el efectivo. */
export const RONDAS_H4 = [
  ronda(1, "junio", 463_750, 36_250),
  ronda(2, "julio", 391_800, 112_500),
  ronda(3, "agosto", 412_650, 80_150),
  ronda(4, "septiembre", 456_300, 45_200),
  ronda(5, "octubre", 338_900, 158_600),
  ronda(6, "noviembre", 287_450, 212_550),
];

export const CIERRE_H4 = {
  textos: [
    "Si el arqueo cuadra, el cheque repone lo gastado. Si hay un sobrante de caja menor, sale por menos. Si hay un faltante de caja menor, sale por más.",
    "En los tres casos, el efectivo más el cheque deja el fondo en su valor fijo.",
  ],
  pie: "Basado en el libro, pp. 182-186",
};

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H4) ═══════════ */

export const PASOS_H4 = [
  "Mira el fondo, los gastos y el efectivo que hay en la caja.",
  "Responde en orden: qué muestra el arqueo, de cuánto es la diferencia y por cuánto sale el cheque.",
  "Tienes un intento por pregunta.",
];
export const ALT_H4 = "Los gastos más el efectivo dan $500.000, justo el fondo: el arqueo cuadra. No hay diferencia, y el cheque repone lo gastado, $420.000.";
/*
 * La ronda construida del paquete: un mes cualquiera, que cuadra (420.000 +
 * 80.000). No es ninguna de las seis. La mano responde «Cuadra», sigue (no
 * hay pregunta 2) y en la 3 toca «$420.000».
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El paquete trae su texto
 * («Un mes cualquiera…»), no un mes; la demo lo usa como enunciado. Sus
 * devoluciones y su cierre son los de una ronda que cuadra, armados igual
 * que los de las seis, con sus cifras.
 */
export const EJEMPLO_H4 = {
  ...ronda("demo", "demo", 420_000, 80_000),
  id: "demo",
  enunciado: "Un mes cualquiera, con un fondo de $500.000: los soportes suman $420.000 y en la caja hay $80.000.",
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/*
 * Tres rondas por intento: una de cada tipo, al azar entre sus dos, en orden
 * barajado. Las opciones de cada pregunta también se barajan.
 */
export function sortearH4(barajar, azar = Math.random) {
  const una = (tipo) => { const dos = RONDAS_H4.filter((r) => r.tipo === tipo); return dos[Math.floor(azar() * dos.length) % dos.length]; };
  return barajar([una(CUADRA), una(SOBRANTE), una(FALTANTE)]).map((r) => ({
    ...r,
    preguntas: r.preguntas.map((p) => ({ ...p, orden: barajar(Object.keys(p.opciones)) })),
  }));
}
export const opcionesEnOrden = (p) => p.orden ?? Object.keys(p.opciones);

export function evaluarH4(p, elegida) {
  const ok = elegida === p.correcta;
  return { ok, correcta: p.correcta, texto: p.opciones[elegida] };
}

/* Lo que el sobre ya enseña: «Suman» al responder la 1; la diferencia al responder la 2 (o con la 1, si cuadra). */
export function reveladoH4(ronda, respondidas) {
  const p1 = respondidas >= 1;
  return { suman: p1, diferencia: ronda.tipo === CUADRA ? p1 : respondidas >= 2 };
}

/* Evaluativa: el motor escala los 25 FP con este porcentaje (preguntas acertadas de las jugadas). */
export const puntuarH4 = (aciertos, cuantas) => (cuantas ? (aciertos / cuantas) * 100 : 0);

/* Para el panel docente: el ítem es «ronda · pregunta», y se lee por el mes y la pregunta. */
export const itemH4 = (rondaId, preguntaId) => `${rondaId}:${preguntaId}`;
export function preguntaDeItemH4(item) {
  const [rid, pid] = String(item).split(":");
  const r = RONDAS_H4.find((x) => x.id === rid);
  const p = r?.preguntas.find((x) => x.id === pid);
  return r && p ? `${r.mes[0].toUpperCase()}${r.mes.slice(1)} · ${p.pregunta}` : null;
}
