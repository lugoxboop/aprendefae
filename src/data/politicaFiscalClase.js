/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA FISCAL · APRENDER — la presentación para proyectar en clase.
 *
 * Material teórico: nada de esto puntúa, nada entra en actividad_catalogo y
 * nada llama a registrar_fp. Las preguntas de la escena 4 se hacen en voz
 * alta; el sistema no las califica nunca.
 *
 * Los ejemplos de la escena 3 salen de las citas de prensa del profesor. Sin
 * ni una cifra más que la del $1 billón de Mi Casa Ya.
 *
 * Correcciones respecto a la ficha, al revisar las cadenas:
 *   · "Las palancas propias de esta política, ninguna otra…" → dos puntos en
 *     vez de coma: son dos oraciones.
 *   · "¿Qué efecto genera en familias, empresas, economía?" → "…empresas y
 *     economía?": una enumeración sin conjunción.
 *   · "…el arriendo, o una deuda vieja" → sin la coma antes de "o".
 *   · "El 'servicio de la deuda'…" → comillas latinas, «servicio de la deuda»,
 *     como en el resto del sitio; las rectas simples son de teclado, no de texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────── ESCENA 1 · la brújula de las 6 preguntas ─────────────── */

/*
 * Las seis puntas, en el orden en que las revela el mando (la escena deja
 * tocarlas en cualquier orden). La brújula es genérica: para política
 * monetaria o cambiaria se escribe otra lista con la misma forma.
 */
export const BRUJULA_FISCAL = [
  { id: "naturaleza", nombre: "Naturaleza", pregunta: "¿Qué la hace diferente de las demás políticas?", significado: "Lo que caracteriza a esta política específicamente frente a las otras 3 ramas." },
  { id: "mercado", nombre: "Mercado", pregunta: "¿En qué mercado macroeconómico actúa?", significado: "El terreno específico donde esta política tiene efecto directo." },
  { id: "objetivos", nombre: "Objetivos", pregunta: "¿Qué meta de política económica cumple?", significado: "A cuál de los objetivos generales (estabilización, crecimiento, redistribución, etc.) le apunta." },
  { id: "instrumentos", nombre: "Instrumentos", pregunta: "¿Con qué herramientas cuenta?", significado: "Las palancas propias de esta política: ninguna otra política las usa igual." },
  { id: "medidas", nombre: "Medidas", pregunta: "¿Cómo se manejan esas herramientas?", significado: "La acción concreta — subir, bajar, cambiar — que se hace con cada instrumento." },
  { id: "impactos", nombre: "Impactos", pregunta: "¿Qué efecto genera en familias, empresas y economía?", significado: "El resultado final, medible, de aplicar la medida." },
];

/* ─────────────── ESCENA 2 · cobra, gasta, pide prestado ─────────────── */

/* `id` es el del instrumento en la Tesorería: así se reutilizan sus iconos y acentos. */
export const MECANISMOS_CLASE = [
  {
    id: "tributacion",
    verbo: "Cobra",
    instrumento: "Tributación",
    analogia: "Como cuando te pagan el sueldo",
    variedades: ["Impuestos directos", "Impuestos indirectos", "Tasas/tarifas", "Contribuciones"],
  },
  {
    id: "gasto",
    verbo: "Gasta",
    instrumento: "Gasto del Gobierno",
    analogia: "Como cuando pagas el mercado, el arriendo o una deuda vieja",
    variedades: [
      "De funcionamiento (nómina, operación diaria)",
      "De inversión (obras)",
      "De servicio de la deuda (pagar intereses de lo que ya debe)",
    ],
  },
  {
    id: "deuda",
    verbo: "Pide prestado",
    instrumento: "Deuda Pública",
    analogia: "Como cuando pides un préstamo al banco",
    variedades: ["Interna (TES, bancos locales)", "Externa (crédito internacional)"],
  },
];

/**
 * Una variedad con su aclaración entre paréntesis, partida en dos para
 * pintarla: "De inversión (obras)" → { cabeza: "De inversión", detalle: "(obras)" }.
 */
export function partirVariedad(texto) {
  const m = /^(.*?)\s+(\(.*\))$/.exec(texto);
  return m ? { cabeza: m[1], detalle: m[2] } : { cabeza: texto, detalle: null };
}

/* ─────────────── ESCENA 3 · tres ejemplos reales ─────────────── */

export const EJEMPLOS_CLASE = [
  {
    id: "iva",
    corto: "El IVA",
    medida: "Eliminar las exenciones al IVA",
    instrumento: "tributacion",
    clasificacion: "Cobra (Tributación) → Impuesto indirecto",
  },
  {
    id: "renta",
    corto: "La renta",
    medida: "Ampliar la base gravable para que más personas naturales declaren renta",
    instrumento: "tributacion",
    clasificacion: "Cobra (Tributación) → Impuesto directo",
  },
  {
    id: "mi-casa-ya",
    corto: "Mi Casa Ya",
    medida: "Mi Casa Ya, con $1 billón adicional",
    instrumento: "gasto",
    clasificacion: "Gasta (Gasto del Gobierno) → Inversión",
  },
];

/* ─────────────── ESCENA 4 · chequeo rápido, para la clase en vivo ─────────────── */

/*
 * `destino` dice a qué ranura de qué máquina va cada caso, con el MISMO texto
 * que en la escena 2: el peaje entra en «Tasas/tarifas», la ranura que el
 * estudiante ya vio abrirse en el recaudador. La prueba comprueba que exista.
 */
export const CHEQUEOS_CLASE = [
  {
    id: "peaje",
    titulo: "El peaje",
    destino: { instrumento: "tributacion", variedad: "Tasas/tarifas" },
    pregunta: "Un peaje que pagas en la autopista — ¿es Tributación, Gasto o Deuda? ¿Qué variedad específica?",
    respuesta: "Es Tributación — específicamente una tasa o tarifa, porque pagas a cambio de un servicio concreto (usar la vía), no es un impuesto general sobre tu ingreso o consumo.",
  },
  {
    id: "servicio-deuda",
    titulo: "El servicio de la deuda",
    destino: { instrumento: "gasto", variedad: "De servicio de la deuda (pagar intereses de lo que ya debe)" },
    pregunta: "El «servicio de la deuda» se clasifica como Gasto, no como Deuda. ¿Por qué, si tiene que ver con algo que el Estado debe?",
    respuesta: "Deuda Pública como instrumento es CÓMO el Estado consigue plata prestada — la acción de endeudarse. Pagar los intereses y el capital de una deuda ya adquirida es dinero que SALE del presupuesto, exactamente igual que pagar nómina o construir una obra — por eso compite con esos otros gastos por el mismo presupuesto, y se agrupa con Gasto, no con Deuda.",
  },
];
