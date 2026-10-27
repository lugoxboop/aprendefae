import { itemDeRepaso, subtemaFijo, subtemaPorRegla, retro } from "./forma.js";
import { FASES } from "../../components/secuencia/secuencia.js";
import { ubicacionDeActividad } from "../../data/subjects.js";
import {
  T1_1, USUARIOS_T1_1, ROTULO_ZONA, ZONA_DENTRO, ZONA_FUERA,
  T1_2, EMPRESAS, CLASES, ROTULO_ENTRA, ROTULO_SALE,
  T1_4, TRANSACCIONES_CAP2, SEGUNDA_T1_4, CASO_DEL_LIBRO_T1_4,
  T1_5,
  T1_6, CONCEPTOS, SECCIONES_T1_6, SECCIONES_SEGUNDO_T1_6, PRIMERO, SEGUNDO,
  T1_7, INVERSO_T1_7,
  T1_8, SITUACIONES_T1_8,
} from "../../data/contabilidadTema1.js";
import {
  evaluarT1_1, evaluarT1_2, evaluarT1_6, evaluarT1_8, TOCABLES_T1_8, puntoPorN,
  casoDe, opcionesSegundaT1_4, correctaSegundaT1_4, destinoDe, devolucionInversoT1_7,
} from "../../contabilidad/tema1.js";
import { H1, H2, PREGUNTAS_H1, RESPUESTAS_H1, FICHAS_H2 } from "../../data/contabilidadT1Hacer2.js";
import { evaluarH1, evaluarH2, enunciadoH2, asientoH2, mensajeH2 } from "../../contabilidad/tema1Hacer2.js";
import { PANTALLAS_T1, pantallasDe } from "../../data/contabilidadT1Pantallas.js";
import { deFicha, ID_OCHO_LEEN } from "../../data/contabilidadT1Secuencia.js";
import {
  SUBTEMA_POR_ZONA_T1_1, SUBTEMA_POR_CLASE_T1_2, SUBTEMA_H2, SUBTEMA_POR_PUNTO_T1_8, SUBTEMA_POR_CASO_T1_4,
  SUBTEMA_POR_RESPUESTA_H1, SUBTEMA_POR_DESTINO_T1_6, SUBTEMA_ARTICULACION, SUBTEMA_FRASE_T1,
} from "../../data/subtemasContabilidadT1.js";

/*
 * EL REPASO DE CONTABILIDAD — T1 · introduccion-contabilidad (Introducción a la contabilidad).
 *
 * DUEÑA: Célula B (general Sakuta). El etiquetado es de Futaba (27-oct) y los
 * nombres de subtema viven en src/data/subtemasContabilidadT1.js. Aquí solo se
 * cablea, con el contrato de forma.js: cada ítem LEE el banco de su actividad y
 * su devolución es la misma función que pinta la actividad. Ni una copia.
 *
 * ═══════════ LA CLAVE: EL ÍTEM QUE LA ACTIVIDAD YA REGISTRA ═══════════
 *
 * Las Hacer de T1 anotan con `useTanda().anotar(id, …)` el id estable del
 * banco (nunca el índice), y ese id es el itemId de aquí: lo visto en la
 * actividad y en el Repaso es un solo historial. Hay dos excepciones, porque
 * aquí la pregunta es otra:
 *
 *   · t1-que-le-pasa-a-cada-uno registra `cal-n` por las tres barras. El
 *     Repaso pregunta «¿cuál de los cuatro casos es?», que en la actividad es
 *     la 2.ª decisión y no se anota. Por eso el ítem es `cal-n:caso`, un id
 *     propio y estable (decisión de Sakuta, (b)); `hechoDeItem` ya lee el
 *     hecho de un id con sufijo para el panel docente.
 *   · t1-la-articulacion registra las flechas que traza el estudiante. Aquí
 *     entran solo las preguntas p1 y p2 del modo inverso (no puntúan en la
 *     actividad), con su id del banco. La p3 espera la p. 66: es HUECO y no
 *     entra (decisión de Sakuta, (d)).
 *
 * ═══════════ LAS «EN UNA FRASE» DE APRENDER (como en t3.js) ═══════════
 *
 * La de cada pieza y la de su 2.ª visita (`en-una-frase`, `en-una-frase-2`),
 * leídas de la ficha (`deFicha`, la misma que pinta la secuencia, con sus
 * devoluciones posteriores). La de cu0-a1 se juega dentro de cu0-a1b «Ocho
 * leen lo mismo»: cuenta para esa pieza en cuanto entre al catálogo; hasta
 * entonces, para cu0-a1 (el filtro de ubicacionDeActividad de t3.js). Hoy
 * Aprender no se registra como hecha, así que estos ítems no le salen a nadie
 * hasta que Erwin cablee cómo cuenta Aprender.
 */

/* El rótulo de un ítem de Hacer: el nombre de su actividad. */
const rotuloDe = (actividad) => actividad.nombre.toUpperCase();

/* ───────── t1-desde-donde-preguntan · ¿adentro o afuera? ───────── */
const ITEMS_T1_1 = USUARIOS_T1_1.map((u) =>
  itemDeRepaso(T1_1.id, u.id, {
    subtema: subtemaPorRegla(SUBTEMA_POR_ZONA_T1_1, u.zona, u.id),
    rotulo: rotuloDe(T1_1),
    enunciado: `«${u.pregunta}»`,
    pregunta: T1_1.consigna,
    opciones: [ZONA_DENTRO, ZONA_FUERA].map((z) => ({ id: z, texto: ROTULO_ZONA[z] })),
    correcta: u.zona,
    devolucion: (zona) => retro(evaluarT1_1(u, zona).texto),
  })
);

/* ───────── t1-que-entro-y-que-salio · ¿qué clase de empresa es? ───────── */
const ITEMS_T1_2 = EMPRESAS.map((e) =>
  itemDeRepaso(T1_2.id, e.id, {
    subtema: subtemaPorRegla(SUBTEMA_POR_CLASE_T1_2, e.clase, e.id),
    rotulo: rotuloDe(T1_2),
    enunciado: e.empresa,
    detalle: { rotulo: `${ROTULO_ENTRA} → ${ROTULO_SALE}`, texto: `${e.entra} → ${e.sale}` },
    pregunta: T1_2.pregunta,
    opciones: CLASES.map((c) => ({ id: c.id, texto: c.nombre })),
    correcta: e.clase,
    devolucion: (clase) => retro(evaluarT1_2(e, clase).texto),
  })
);

/* ───────── t1-quien-pregunta-esto (H2) · la vuelta 1, con sus cuatro activos ───────── */
const ITEMS_H2 = FICHAS_H2.map((f) =>
  itemDeRepaso(H2.id, f.id, {
    subtema: subtemaFijo(SUBTEMA_H2, H2.id),
    rotulo: rotuloDe(H2),
    enunciado: enunciadoH2(f, 1),
    pregunta: H2.consigna,
    opciones: f.opciones.map((id) => ({ id, texto: asientoH2(id).nombre })),
    /* El banco trae la correcta primero: aquí se barajan. */
    barajarOpciones: true,
    correcta: f.correcta,
    devolucion: (id) => retro(mensajeH2(evaluarH2(f, id, 1))),
  })
);

/* ───────── t1-donde-se-rompio · el punto donde se rompió (la decisión que puntúa) ───────── */
const ITEMS_T1_8 = SITUACIONES_T1_8.map((s) =>
  itemDeRepaso(T1_8.id, s.id, {
    subtema: subtemaPorRegla(SUBTEMA_POR_PUNTO_T1_8, s.rompe, s.id),
    rotulo: rotuloDe(T1_8),
    enunciado: s.texto,
    pregunta: T1_8.consigna,
    opciones: TOCABLES_T1_8.map((n) => ({ id: String(n), texto: puntoPorN(n).rotulo })),
    correcta: String(s.rompe),
    devolucion: (n) => retro(evaluarT1_8(s, Number(n)).texto),
  })
);

/* ───────── t1-que-le-pasa-a-cada-uno · ¿cuál de los cuatro casos? (id propio: `cal-n:caso`) ───────── */
const ITEMS_T1_4 = TRANSACCIONES_CAP2.map((h) => {
  const correcta = correctaSegundaT1_4(h);
  return itemDeRepaso(T1_4.id, `${h.id}:caso`, {
    subtema: subtemaPorRegla(SUBTEMA_POR_CASO_T1_4, CASO_DEL_LIBRO_T1_4[casoDe(h)], h.id),
    rotulo: rotuloDe(T1_4),
    enunciado: h.texto,
    pregunta: SEGUNDA_T1_4.pregunta,
    opciones: opcionesSegundaT1_4(h).map((o) => ({ id: o.id, texto: o.texto })),
    correcta,
    /* Lo mismo que pinta la pieza: el acierto del caso, o el mensaje de la opción tocada. */
    devolucion: (id) => {
      const o = SEGUNDA_T1_4.opciones.find((x) => x.id === id);
      return retro(id === correcta ? o?.acierto : o?.msg);
    },
  });
});

/* ───────── t1-un-dia-o-un-ano (H1) · ¿qué informe la responde? ───────── */
const ITEMS_H1 = PREGUNTAS_H1.map((q) =>
  itemDeRepaso(H1.id, q.id, {
    subtema: subtemaPorRegla(SUBTEMA_POR_RESPUESTA_H1, q.respuesta, q.id),
    rotulo: rotuloDe(H1),
    enunciado: `«${q.texto}»`,
    pregunta: H1.consigna,
    opciones: RESPUESTAS_H1.map((r) => ({ id: r.id, texto: r.texto })),
    correcta: q.respuesta,
    devolucion: (id) => retro(evaluarH1(q, id).texto),
  })
);

/* ───────── t1-en-cual-estado-aparece · uno de los cinco destinos, con los nombres de la pieza ───────── */
const DESTINOS_T1_6 = [
  ...SECCIONES_T1_6.map((s) => ({ informe: PRIMERO, seccion: s.id, nombre: s.termino })),
  ...SECCIONES_SEGUNDO_T1_6.map((s) => ({ informe: SEGUNDO, seccion: s.id, nombre: s.idea })),
];
const ITEMS_T1_6 = CONCEPTOS.map((c) =>
  itemDeRepaso(T1_6.id, c.id, {
    subtema: subtemaPorRegla(SUBTEMA_POR_DESTINO_T1_6, destinoDe(c), c.id),
    rotulo: rotuloDe(T1_6),
    enunciado: c.nombre,
    pregunta: T1_6.consigna,
    opciones: DESTINOS_T1_6.map((d) => ({ id: destinoDe(d), texto: d.nombre })),
    correcta: destinoDe(c),
    devolucion: (id) => retro(evaluarT1_6(c, DESTINOS_T1_6.find((d) => destinoDe(d) === id)).texto),
  })
);

/* ───────── t1-la-articulacion · p1 y p2 del modo inverso (la p3 es HUECO: espera la p. 66) ───────── */
export const INVERSO_EN_EL_REPASO = ["p1", "p2"];
const ITEMS_T1_7 = INVERSO_T1_7.filter((q) => INVERSO_EN_EL_REPASO.includes(q.id)).map((q) =>
  itemDeRepaso(T1_7.id, q.id, {
    subtema: subtemaFijo(SUBTEMA_ARTICULACION, T1_7.id),
    rotulo: rotuloDe(T1_7),
    enunciado: q.pregunta,
    opciones: q.opciones.map((o) => ({ id: o.id, texto: o.texto })),
    /* El banco trae la correcta primero: aquí se barajan. */
    barajarOpciones: true,
    correcta: q.opciones.find((o) => o.correcta).id,
    devolucion: (id) => retro(devolucionInversoT1_7(q.opciones.find((o) => o.id === id))),
  })
);

/* ───────── las «En una frase» de Aprender ───────── */

/* La pieza del catálogo donde se juega la frase de cada ficha: la de cu0-a1 se mudó a cu0-a1b. */
const ID_A1 = Object.keys(PANTALLAS_T1)[0];
const dondeSeJuega = (pieza) => (pieza === ID_A1 && ubicacionDeActividad(ID_OCHO_LEEN) ? ID_OCHO_LEEN : pieza);

const frase = (pieza, itemId, enunciado, opciones, correcta, devolucionDe) =>
  itemDeRepaso(dondeSeJuega(pieza), itemId, {
    subtema: subtemaFijo(SUBTEMA_FRASE_T1[pieza], pieza),
    rotulo: FASES.cierre.toUpperCase(),
    enunciado,
    opciones: opciones.map((o) => ({ id: o.id, texto: o.texto.texto })),
    barajarOpciones: true,
    correcta,
    devolucion: (id) => retro(devolucionDe(id)),
  });

export const EN_UNA_FRASE_T1 = Object.keys(PANTALLAS_T1).flatMap((pieza) => {
  const ficha = deFicha(pieza, pantallasDe(pieza).find((p) => p.hace === "frase").n);
  const primera = frase(pieza, "en-una-frase", ficha.texto[0].texto, ficha.opciones, ficha.opciones.find((o) => o.correcta).id,
    (id) => ficha.opciones.find((o) => o.id === id)?.devolucion?.texto);
  const s = ficha.segunda;
  return s ? [primera, frase(pieza, "en-una-frase-2", s.pregunta.texto, ficha.opciones, s.correcta, (id) => s.devoluciones[id]?.texto)] : [primera];
});

export const ITEMS_T1 = [
  ...ITEMS_T1_1, ...ITEMS_T1_2, ...ITEMS_H2, ...ITEMS_T1_8, ...ITEMS_T1_4, ...ITEMS_H1, ...ITEMS_T1_6, ...ITEMS_T1_7,
  ...EN_UNA_FRASE_T1,
];

/*
 * Las actividades del tema que NO aportan al pool, cada una con su razón (por
 * ejemplo: sus ítems no son preguntas sueltas). La prueba exige que cada
 * actividad de Hacer del tema esté en uno de los dos lados.
 */
export const FUERA_T1 = [
  {
    id: T1_5.id,
    razon: "Es una secuencia que se acumula: cada total depende de los hechos anteriores, así que una pregunta suelta no tiene respuesta.",
  },
];
