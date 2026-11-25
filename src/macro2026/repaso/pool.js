/*
 * MACRO 2026 · EL REPASO DIARIO — EL POOL Y LA REGLA DE LOS CINCO TEMAS.
 *
 * Va aparte de ronda.js por una razón de carga: src/repaso/repasos.js lo
 * importa para dar de alta el repaso, y repasos.js lo importa a su vez el
 * motor (seleccion.js). Si este archivo importara el motor habría un ciclo, y
 * según qué módulo cargara primero POOL_MACRO podía leerse antes de existir.
 * Por eso aquí solo entra plantillas.js, que no importa nada del repaso.
 */
import { PLANTILLAS, TEMAS_REPASO, plantilla } from "./plantillas.js";

export const ID_REPASO_MACRO = "repaso-diario-macro";
export const CONSULTAS_POR_RONDA = 10;
export const TEMAS_DEL_POOL_MACRO = TEMAS_REPASO.map((t) => t.id);

/** Las unidades del pool, con la forma que espera el motor. */
export const POOL_MACRO = PLANTILLAS.map((pl) => ({
  clave: pl.id, itemId: pl.id, actividad: pl.actividad, materia: pl.tema, plantilla: pl.id,
}));

const POR_ID = new Map(POOL_MACRO.map((x) => [x.clave, x]));

/* Fallada = su último intento salió mal (la misma regla que categoriaDe del motor). */
const fallada = (historial, id) => {
  const e = historial.get(id);
  return Boolean(e) && !e.ultimoOk;
};

/**
 * Regla 1: los cinco temas presentes. Si el sorteo deja un tema fuera, entra
 * una de sus plantillas en el lugar de una consulta del tema que más tiene,
 * nunca de una fallada. `mezclar` decide cuál entra: en el sitio es el mismo
 * barajado sembrado del día, para que el banner y la partida coincidan.
 */
export function equilibrar(ids, historial, mezclar) {
  const elegidas = [...ids];
  for (const tema of TEMAS_DEL_POOL_MACRO) {
    if (elegidas.some((id) => plantilla(id).tema === tema)) continue;
    const candidatas = mezclar(PLANTILLAS.filter((pl) => pl.tema === tema && !elegidas.includes(pl.id)));
    if (!candidatas.length) continue;
    const cuenta = new Map();
    for (const id of elegidas) cuenta.set(plantilla(id).tema, (cuenta.get(plantilla(id).tema) ?? 0) + 1);
    const reemplazable = elegidas
      .filter((id) => cuenta.get(plantilla(id).tema) > 1 && !fallada(historial, id))
      .sort((a, b) => cuenta.get(plantilla(b).tema) - cuenta.get(plantilla(a).tema))[0];
    if (reemplazable) elegidas[elegidas.indexOf(reemplazable)] = candidatas[0].id;
  }
  return elegidas.slice(0, CONSULTAS_POR_RONDA);
}

/** El ajuste que el motor aplica a los ítems de este repaso (repasos.js · `ajustar`). */
export const ajustarItems = (items, { historial, mezclar }) =>
  equilibrar(items.map((x) => x.plantilla), historial, mezclar).map((id) => POR_ID.get(id));

/*
 * Cómo se llama cada consulta en el panel docente (etiquetasItem.js). El
 * historial la guarda por el id de su plantilla; las cifras cambian en cada
 * intento, así que la etiqueta nombra la situación, no los números.
 */
export const ETIQUETA_PLANTILLA = {
  "rd-da-carrito": "T1 · Clasifica gastos en C, I, G o XN",
  "rd-da-curva": "T1 · Qué le pasa a la curva de DA con la noticia",
  "rd-da-multiplicador": "T1 · Multiplicador con impuestos (ΔY)",
  "rd-pe-ventanilla": "T2 · A qué rama de la política va cada medida",
  "rd-pe-escalera": "T2 · Ordena los seis pasos del plan",
  "rd-pf-expansiva": "T3 · Política fiscal expansiva o contractiva",
  "rd-pf-factura": "T3 · El IVA de la factura",
  "rd-pf-cadena": "T3 · La cadena de una medida fiscal",
  "rd-pm-medidas": "T4 · Política monetaria expansiva o contractiva",
  "rd-pm-encaje": "T4 · Encaje y crédito (D − E = Cr)",
  "rd-pm-cadena": "T4 · La cadena de la tasa de interés",
  "rd-pc-pareja": "T5 · A quién le conviene el nuevo dólar",
  "rd-pc-cadena": "T5 · La cadena del mercado de divisas",
  "rd-pc-real": "T5 · Variación del tipo de cambio real",
};
