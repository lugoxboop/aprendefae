import { itemDeRepaso, subtemaFijo, retro } from "./forma.js";
import { FASES } from "../../components/secuencia/secuencia.js";
import { SUBTEMA_FIJO_T3, SUBTEMA_APRENDER_T3 } from "../../data/subtemasContabilidadT3.js";
import { ubicacionDeActividad } from "../../data/subjects.js";
import { PIEZA_P2, PREGUNTA_FINAL_P2, OPCIONES_FINAL_P2, PIEZA_P6, PREGUNTA_FINAL_P6, OPCIONES_FINAL_P6 } from "../../data/t3SecuenciasTextosP2P6.js";
import { PIEZA_VENDER_NO_ES_COBRAR, PREGUNTA_FINAL, OPCIONES_FINAL } from "../../data/contabilidadTema3.js";
import { PIEZA_LO_QUE_YA_PASO, PREGUNTA_FINAL_P3, OPCIONES_FINAL_P3 } from "../../data/contabilidadTema3Pieza3.js";
import { PIEZA_LO_QUE_YA_SE_PAGO, PREGUNTA_FINAL_P4, OPCIONES_FINAL_P4 } from "../../data/contabilidadTema3Pieza4.js";
import { PIEZA_CERRAR_EL_PERIODO, PREGUNTA_FINAL_CIERRE, OPCIONES_FINAL_CIERRE } from "../../data/contabilidadTema3Cierre.js";

/*
 * EL REPASO DE CONTABILIDAD — T3 · ingresos-gastos-y-caja (Ingresos, gastos y caja).
 *
 * DUEÑA: Célula E (general Kamogawa). El coordinador no escribe aquí: este
 * archivo lo llena la célula con el etiquetado de su tema, siguiendo el
 * contrato de forma.js (fijo o regla, ni una copia de contenido).
 *
 * ═══════════ LAS CUATRO «EN UNA FRASE» (decisión S3 de Kamogawa) ═══════════
 *
 * Las preguntas «En una frase» de P1, P3, P4 y P5 salen de Aprender y pasan
 * aquí sin cambiar el texto: el ítem LEE la pregunta, las opciones y las
 * devoluciones del archivo de su pieza (PREGUNTA_FINAL*, OPCIONES_FINAL*), así
 * que corregir allí corrige aquí. La actividad de origen es la pieza de
 * Aprender; el ítem es nuevo (`en-una-frase`) y ningún id que ya existía
 * cambia.
 *
 * El subtema es el nombre de Miyata de #481 (SUBTEMA_FIJO_T3), el que dice lo
 * que la pregunta pide:
 *   P1 «qué es un ingreso» ................. Ingreso y cobro
 *   P3 «cuándo se causa un gasto» .......... Causación
 *   P4 «qué es un pago por anticipado» ..... Ajuste diferido
 *   P5 «para qué se cierran las cuentas» ... Cierre del periodo
 *
 * El Repaso de Contabilidad sigue oculto (`publicado: false`) y el pool solo
 * enseña ítems de actividades hechas: una pieza de Aprender no se registra
 * como hecha hoy, así que estos cuatro no le salen a nadie hasta que Erwin
 * cablee cómo cuenta Aprender (anotado en el PR).
 */
const enUnaFrase = (pieza, pregunta, opciones, actividadDelSubtema, subtema = SUBTEMA_FIJO_T3[actividadDelSubtema]) => {
  const correcta = opciones.find((o) => o.correcta);
  return itemDeRepaso(pieza.id, "en-una-frase", {
    subtema: subtemaFijo(subtema, pieza.id),
    rotulo: FASES.cierre.toUpperCase(),
    enunciado: pregunta,
    opciones: opciones.map((o) => ({ id: o.id, texto: o.texto })),
    correcta: correcta.id,
    devolucion: (elegida) => retro(opciones.find((o) => o.id === elegida)?.feedback),
  });
};

/*
 * ═══════════ P2-8 Y P6-10: DOS «EN UNA FRASE» MÁS (textos v6 §4) ═══════════
 *
 *   P2-8  «¿Qué cambia la utilidad del mes?» ...... Resultado y caja
 *   P6-10 «¿Qué es la utilidad del ejercicio?» .... Impuesto y utilidad neta
 *
 * Son ítems nuevos (`<pieza>:en-una-frase`), y ningún id cambia. Pero un ítem
 * del pool tiene que ser de una actividad del catálogo (itemDeRepaso lo exige),
 * y P2 y P6 todavía no están en subjects.js: entran con la bandera, en la
 * vista y en el catálogo a la vez («las dos puertas»). Hasta entonces quedan
 * aquí, listos, y ITEMS_T3 los suma solo cuando el catálogo ya los conoce.
 * Así encender la bandera no exige tocar este archivo.
 */
export const EN_UNA_FRASE_P2_P6 = [
  { pieza: PIEZA_P2, pregunta: PREGUNTA_FINAL_P2, opciones: OPCIONES_FINAL_P2, subtema: SUBTEMA_APRENDER_T3[PIEZA_P2.id] },
  { pieza: PIEZA_P6, pregunta: PREGUNTA_FINAL_P6, opciones: OPCIONES_FINAL_P6, subtema: SUBTEMA_APRENDER_T3[PIEZA_P6.id] },
];
export const itemEnUnaFrase = ({ pieza, pregunta, opciones, subtema }) => enUnaFrase(pieza, pregunta, opciones, null, subtema);

export const ITEMS_T3 = [
  enUnaFrase(PIEZA_VENDER_NO_ES_COBRAR, PREGUNTA_FINAL, OPCIONES_FINAL, "t3-ingreso-o-cobro"),
  enUnaFrase(PIEZA_LO_QUE_YA_PASO, PREGUNTA_FINAL_P3, OPCIONES_FINAL_P3, "t3-cuando-se-causa"),
  enUnaFrase(PIEZA_LO_QUE_YA_SE_PAGO, PREGUNTA_FINAL_P4, OPCIONES_FINAL_P4, "t3-ajuste-diferido"),
  enUnaFrase(PIEZA_CERRAR_EL_PERIODO, PREGUNTA_FINAL_CIERRE, OPCIONES_FINAL_CIERRE, "t3-cierre-completo"),
  ...EN_UNA_FRASE_P2_P6.filter((x) => ubicacionDeActividad(x.pieza.id)).map(itemEnUnaFrase),
];

/*
 * Las actividades del tema que NO aportan al pool, cada una con su razón (por
 * ejemplo: sus ítems no son preguntas sueltas). La prueba exige que cada
 * actividad de Hacer del tema esté en uno de los dos lados.
 */
export const FUERA_T3 = [];
