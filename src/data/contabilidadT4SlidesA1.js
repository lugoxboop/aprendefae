/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 «La caja» COMO SLIDES (Célula D).
 *
 * Contenido: la tabla de A1 del hilo de Katsumi (seis pantallas: «cobra» es
 * la pantalla 1 y absorbe a «dos-cuentas»), el texto literal de A1 p6, y el
 * lote 4 (el porqué del segundo error y la razón de «Pagar»), en
 * orquestador/revisiones/t4-slides/hilo-katsumi.md. Lo que el hilo da por
 * aprobado (tarjetas, aciertos y errores de consigna, cheques y el-faltante,
 * el caso B) sale de los datos viejos de A1 (contabilidadT4.js) y de su
 * paquete (d4-t4-a1-v6-rediseno.md). Forma: diseno-hanayama.md §3, A1.
 *
 * Lo que una pantalla dice, por lugar (como A0):
 *   titular   la idea arriba (en la 1, el objetivo D2 de la pieza: §16 b)
 *   antes     la banda antes de responder
 *   acierto   la banda al resolver bien ([] = solo la pastilla «Correcto»)
 *   errores   la banda tras un error, por destino u opción elegida
 *   porque    la banda tras el segundo error (C2, lote 4)
 *   cierre    en el Cierre: la frase, «Siguiente: «X».» y el pie
 *
 * Caso B (D8): Taller Ríos Ltda. (612.000) en lugar de Sus Servicios
 * (435.000); en «el-faltante», Lucía en lugar de Andrés (anota 584.000; sin
 * anotar 28.000). Los porqués del lote 4 de A1 no llevan cifras ni personas:
 * la plantilla los deja iguales.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { cifra } from "../components/t4/comun.jsx";
import {
  A1_ID, PIEZA_LA_CAJA, DATOS_A1, DEBE, HABER, NO_SE_MUEVE, CONTROLES_A1, ASIENTO_COBRO, ASIENTO_CONSIGNACION,
} from "./contabilidadT4.js";

export { A1_ID };

/* La pantalla vieja de cada id, en cada caso: de ahí salen los textos aprobados. */
const vieja = (caso, id) => (caso === 2 ? PIEZA_LA_CAJA.casoB : PIEZA_LA_CAJA).pantallas.find((p) => p.id === id);

/* El hilo cita «Sus Servicios arregla computadores, …» sin «Toca «Cobrar».»: en el hilo el cobro es la decisión. */
const sinCobrar = (t) => t.replace(/ Toca «Cobrar»\.$/, "");

/* Lote 4: el porqué del segundo error. Plantilla del caso 1; en A1 no lleva cifras ni personas. */
const PORQUE = {
  cobra: "Va al debe de Caja. Cobrar de contado mete plata en la caja, y lo que entra a Caja va por el debe.",
  consigna: "Va al haber de Caja. Consignar saca la plata de la caja y la lleva al banco: Caja baja y Bancos sube.",
  cheques: "El cheque que le dan entra a la caja, por el debe. El cheque propio lo paga el banco: Caja no se mueve.",
  faltante: "Separar funciones. Si quien cobra también anota, puede quedarse plata sin anotarla, y al contar, caja y libro cuadran.",
};
/* La plantilla del caso B (lote 4): las cifras y la persona del caso 1 pasan a las del caso B. */
const enCaso = (t, D) => t
  .replace(/435\.000/g, cifra(D.cobro)).replace(/410\.000/g, cifra(D.anotado)).replace(/25\.000/g, cifra(D.cobro - D.anotado))
  .replace(/Sus Servicios/g, D.empresa).replace(/Andrés/g, D.persona);

/* Lote 4, A1 p3: la razón de la salida «Pagar», para la banda. */
const RAZON_PAGAR = "Pagar también saca plata por el haber. Pero el libro pide consignar cada día lo que se recibe y limita los pagos en efectivo.";

/* Hanayama §3, A1 p5: el origen del faltante, «cobrado $435.000 · sin anotar $25.000». */
export const ORIGEN_FALTANTE = { cobrado: "cobrado", sinAnotar: "sin anotar" };

function slides(caso) {
  const D = { ...DATOS_A1[caso], empresa: caso === 2 ? "Taller Ríos" : "Sus Servicios", persona: caso === 2 ? "Lucía" : "Andrés" };
  const v = (id) => vieja(caso, id);
  const cobra = v("cobra");
  const consigna = v("consigna");
  const faltante = v("el-faltante");
  const controles = v("controles");
  return {
    caso,
    datos: D,
    cobra: {
      titular: PIEZA_LA_CAJA.objetivo,
      /* Hilo, A1 p1: el puente al Tema 2 (de «dos-cuentas»), el caso y la pregunta NUEVO. */
      antes: [PIEZA_LA_CAJA.pantallas.find((p) => p.id === "dos-cuentas").despues[0], sinCobrar(cobra.antes[0]), "¿Por dónde entra esa plata a Caja?"],
      correcta: DEBE,
      acierto: [],
      /* Hilo, A1 p1: el error del haber reúsa el de los cheques; el de la bandeja es NUEVO. */
      errores: { [HABER]: "Aquí la empresa recibe, no paga.", [NO_SE_MUEVE]: "Le pagan de contado: esa plata no pasó por el banco." },
      porque: enCaso(PORQUE.cobra, D),
      asiento: { ...ASIENTO_COBRO, lineas: ASIENTO_COBRO.lineas.map((l) => ({ ...l, monto: D.cobro })) },
    },
    consigna: {
      /* «Ese día, la plata va al banco. ¿Qué le pasa a Caja?»: la pregunta arriba, lo demás en la banda. */
      titular: "¿Qué le pasa a Caja?",
      antes: ["Ese día, la plata va al banco."],
      tarjeta: consigna.tarjeta,
      correcta: consigna.correcta,
      acierto: [],
      errores: consigna.errores,
      porque: enCaso(PORQUE.consigna, D),
      asiento: { ...ASIENTO_CONSIGNACION, lineas: ASIENTO_CONSIGNACION.lineas.map((l) => ({ ...l, monto: D.cobro })) },
    },
    salidas: {
      /* Míralo: la primera frase corta arriba; el resto, en la banda. */
      titular: "El libro lleva esa plata al banco.",
      antes: ["Supón que también pudieras pagar con ella.", "Prueba las dos."],
      razonPagar: RAZON_PAGAR,
    },
    cheques: {
      titular: "Para el libro, la caja también guarda cheques.",
      antes: ["Manda cada uno a su sitio."],
      tarjetas: D.cheques.map((c) => ({ id: c.id, tarjeta: c.tarjeta, correcta: c.correcta, acierto: [c.acierto], errores: c.errores })),
      porque: enCaso(PORQUE.cheques, D),
    },
    faltante: {
      titular: "¿Qué control faltó?",
      antes: [faltante.antes[0].replace(/ ¿Qué control faltó\?$/, "")],
      opciones: faltante.opciones.map((id) => ({ id, texto: faltante.tarjetas[id] })),
      correcta: faltante.correcta,
      control: faltante.control,
      acierto: [],
      errores: faltante.errores,
      porque: enCaso(PORQUE.faltante, D),
    },
    controles: {
      /* Texto literal de A1 p6 (hilo): la primera frase arriba; la de cierre y «Siguiente» en la banda. */
      titular: "Toca cada control: se enciende lo que vigila.",
      lista: CONTROLES_A1,
      cierre: controles.cierre,
      siguiente: controles.siguiente,
      pie: controles.pie,
    },
  };
}

export const SLIDES_A1 = { 1: slides(1), 2: slides(2) };
