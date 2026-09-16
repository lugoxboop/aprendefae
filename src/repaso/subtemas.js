/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE POLÍTICA ECONÓMICA, DEMANDA AGREGADA Y POLÍTICA FISCAL
 *
 * Etiquetado de Gen (B2c del prompt del Repaso Diario), literal. Dos formas:
 *
 *   [fijo]   toda la actividad (o toda una etapa) tiene un mismo subtema
 *   [regla]  el subtema de cada ítem ES su respuesta correcta —o su ronda, o
 *            su escenario—, así que se escribe como un mapeo del dato del
 *            banco al nombre del subtema, no ítem por ítem
 *
 * Política Monetaria trae el suyo en su propio banco (`subtema`), y los
 * Memoramas no se etiquetan: salen del catálogo.
 *
 * DOS DECISIONES DE MATEO, porque la ficha no las cubría:
 *   · El Termómetro: «Sube/Baja el Gasto público (Ḡ)» dice que afecta «la
 *     Demanda Agregada», que no es uno de los cuatro componentes → Gasto
 *     Público (G).
 *   · Electrocardiograma: «Renta disponible» no está en la lista (C̄, Y, TR,
 *     t, c…) → Consumo (C), porque es Y − tY + TR.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = "Consumo (C)";
const I = "Inversión (I)";
const G = "Gasto Público (G)";
const XN = "Exportaciones Netas (XN)";

/* [fijo] — por actividad, o por `actividad:etapa` cuando solo una etapa es fija. */
export const SUBTEMA_FIJO = {
  /* Política Económica */
  "diagnostico-en-vivo:brecha": "Problemas macroeconómicos — magnitud de brechas",
  "arma-grupo-logico": "Grupos lógicos — construcción de cadena",
  "tablero-decisiones": "Interacción entre instrumentos",
  "simulador-de-crisis": "Grupos lógicos — construcción completa",
  "expediente-gabinete": "Interacción entre estrategias",
  "consejo-ministros": "Combinación de estrategias",
  /* Demanda Agregada */
  "electrocardiograma:frag": "Fórmula y estructura",
  "banco-transfusiones": "Consumo (C) — cálculo",
  "biopsia-economica": "Interacción entre componentes",
  "triage-emergencias": "Interacción entre componentes — respuesta de política",
  "cirugia-reconstruccion": "Interacción entre componentes — shocks",
  "explica-paciente": "Inversión (I)",
  "sala-espera-llena": "Consumo (C) — frontera de relevancia",
  /* Política Fiscal */
  "flujo-de-caja:multiplicador": "Multiplicador del gasto",
  "agujero-fiscal": "Tributación — regresividad",
  "expansiva-contractiva": "Tipos de política fiscal",
  "disena-presupuesto": "Integración de instrumentos fiscales",
  "explica-contribuyente": "Tributación — base gravable",
  "comite-presupuesto": "Déficit fiscal — frontera de relevancia",
};

/* [regla] — del dato del banco (la respuesta, la ronda o el escenario) al subtema. */
export const SUBTEMA_REGLA = {
  /* Política Económica */
  "que-rama-es": { fiscal: "Política fiscal", monetaria: "Política monetaria", cambiaria: "Política cambiaria", comercial: "Política comercial" },
  "diagnostico-en-vivo": {
    crecimiento: "Restricciones al crecimiento", inflacion: "Inflación", desempleo: "Desempleo", fiscal: "Déficit fiscal",
    exterior: "Déficit exterior", concentracion: "Concentración de la renta", asignacion: "Inadecuada asignación de recursos",
    ambiental: "Impactos ambientales",
  },
  "quien-gana-quien-pierde": {
    tasa: "Política monetaria — tasa de interés", aranceles: "Política comercial — aranceles",
    devaluacion: "Política cambiaria — tipo de cambio", gasto: "Política fiscal — gasto público",
  },
  "corriente-titulares": { problema: "Problema", objetivo: "Objetivo", estrategia: "Estrategia", instrumento: "Instrumento", medida: "Medida", meta: "Meta" },
  "explica-la-politica": { tasa: "Política monetaria — tasa de interés", aranceles: "Política comercial — aranceles" },
  /* ¿Se acerca o se aleja?: el objetivo en juego de cada fila, tal cual (el texto de la Parte C). */
  "se-acerca-o-se-aleja": "objetivo",
  /* Demanda Agregada */
  "cual-componente": { c: C, i: I, g: G, xn: XN },
  "electrocardiograma": {
    "c-autonomo": C, pmc: C, "renta-disp": C,
    "i-autonoma": I, elasticidad: I, tasa: I,
    gasto: G,
    "tipo-cambio": XN,
  },
  "termometro-reacciones": { "el Consumo": C, "la Inversión": I, "la Demanda Agregada": G, "las Exportaciones Netas": XN },
  "sala-monitores": { C, I, G, XN },
  "quien-beneficia-auge": { consumo: C, inversion: I, devaluacion: XN },
  /* Política Fiscal */
  "cobra-gasta-o-pide": { cobra: "Tributación", gasta: "Gasto del Gobierno", pide: "Deuda Pública" },
  "clasificador-tesoro": {
    "Impuesto directo": "Impuesto directo", "Impuesto indirecto": "Impuesto indirecto", "Tasa o tarifa": "Tasa o tarifa",
    "Contribución": "Contribución", Funcionamiento: "Gasto de funcionamiento", "Inversión": "Gasto de inversión",
    "Servicio de la deuda": "Servicio de la deuda", Interna: "Deuda interna", Externa: "Deuda externa",
  },
  "directos-indirectos": { directo: "Impuesto directo", indirecto: "Impuesto indirecto", tasa: "Tasa o tarifa", contribucion: "Contribución" },
  "flujo-de-caja": { consumo: "Tributación → Consumo", inversion: "Tributación → Inversión", g: "Gasto del Gobierno → G" },
  "deficit-vs-deuda": { tributacion: "Tributación", gasto: "Gasto del Gobierno", deuda: "Deuda Pública", ninguno: "Déficit (concepto general)" },
  "quien-afecta-ajuste": { iva: "Tributación — IVA", "mi-casa-ya": "Gasto de inversión", tes: "Deuda interna" },
};

/** El subtema de una regla, o lanza si el dato no tiene nombre: un subtema vacío no puede pasar en silencio. */
export function subtemaPorRegla(actividad, clave) {
  const regla = SUBTEMA_REGLA[actividad];
  const nombre = regla?.[clave];
  if (!nombre) throw new Error(`Sin subtema: ${actividad} · ${clave}`);
  return nombre;
}

export function subtemaFijo(clave) {
  const nombre = SUBTEMA_FIJO[clave];
  if (!nombre) throw new Error(`Sin subtema fijo: ${clave}`);
  return nombre;
}
