/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T3 POLÍTICA FISCAL — TODOS LOS TEXTOS, TAL CUAL
 *
 * Fuente única: orquestador/conocimiento/macro-2026/disenos/t3-politica-fiscal.md
 * (Gen, 22-nov). Ninguna pieza escribe un texto a mano: todo sale de aquí, y
 * la prueba t3-textos-y-bancos.test.mjs cuenta las palabras contra §4.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─── Subtemas del tema ─── */
export const SUBTEMAS = {
  "pe-marco-analisis": "El marco de análisis de una política",
  "pf-naturaleza": "Naturaleza de la política fiscal",
  "pf-instrumentos": "Instrumentos fiscales",
  "pf-tributacion-casos": "Tributación en casos reales",
  "pf-impuestos": "Impuestos directos e indirectos",
  "pf-gasto-casos": "Gasto público en casos",
  "pf-deuda-casos": "Deuda pública en casos",
  "pf-medidas": "Medidas expansivas y contraccionistas",
  "pf-en-da": "La política fiscal en la demanda agregada",
  "pf-impactos": "Impactos de la política fiscal",
  "pf-preparcial": "Repaso para el parcial",
};

/* ─── Aprender: el texto exacto de cada pantalla (§2) ─── */
export const APRENDER = {
  "pf26-a1-lupa": [
    "Toda política especializada se mira con la misma lupa de seis caras.",
    "Naturaleza: la fiscal usa las finanzas públicas: lo que el Estado cobra, gasta y debe.",
    "Mercado: el de bienes y servicios. Se analiza con la demanda agregada.",
    "Objetivos: sirve a todos los de la política económica, porque toca a todos.",
    "Instrumentos: tres. Tributación, gasto público y deuda pública.",
    "Medidas: expansivas si suben la demanda; contraccionistas si la bajan.",
  ],
  "pf26-a2-buzones": [
    "Tributación es todo pago obligatorio al Estado. Viene en tres formas.",
    "Impuesto: pagas y no recibes nada a cambio directo. Va al pozo común.",
    "Tasa: pagas por un servicio que usas. Peaje, tasa aeroportuaria, notaría.",
    "Contribución: pagas una obra o servicio que te beneficia. Valorización, seguridad social.",
  ],
  "pf26-a3-cajeros": [
    "Un impuesto directo mira quién eres: tu renta, tu casa, tu carro.",
    "Uno indirecto mira solo qué compras. Cobra igual al rico y al pobre.",
    "Directos: renta, predial, vehículos, ICA. Indirectos: IVA, impoconsumo, aranceles.",
    "Ojo: la retención en la fuente no es otro impuesto. Es renta cobrada por adelantado.",
    "Cobran tres niveles: Nación, departamento y municipio.",
  ],
  "pf26-a4-tanque": [
    "El Estado es un tanque: entran tributos y préstamos; salen tres desagües de gasto.",
    "Funcionamiento: lo que cuesta que el Estado opere. Nómina, insumos, servicios.",
    "Inversión: lo que deja capacidad. Vías, escuelas, metro, investigación.",
    "Servicio de la deuda: los intereses y abonos de lo que se prestó.",
    "Si no alcanza, se presta: deuda interna en pesos, sobre todo TES; externa, afuera.",
    "Colombia debía cerca de $1.194 billones a fines de 2025: 840 internos y 354 externos.",
    "No confundas: la deuda es lo que se debe; el servicio, lo que se paga cada año.",
  ],
  "pf26-a5-balanza": [
    "La política fiscal toca tres perillas de la demanda: G, TR y t.",
    "Expansiva: más gasto, más transferencias o menos impuestos. La demanda sube.",
    "Contraccionista: lo contrario. Menos gasto, menos transferencias o más impuestos.",
    "G y TR mueven el gasto autónomo. t cambia el multiplicador.",
    "A veces el efecto es colateral: una reforma para recaudar también enfría la demanda.",
    "¿Y a quién le llega? Toca cada uno.",
  ],
};

/* §4: conteo de palabras que declara la especificación. */
export const CONTEO_APRENDER = {
  "pf26-a1-lupa": [12, 15, 12, 13, 8, 10],
  "pf26-a2-buzones": [11, 13, 11, 12],
  "pf26-a3-cajeros": [12, 13, 10, 15, 7],
  "pf26-a4-tanque": [14, 11, 9, 13, 14, 15, 16],
  "pf26-a5-balanza": [12, 11, 10, 10, 14, 8],
};

/* ─── A1 · La lupa de seis caras ─── */
export const CARAS_A1 = [
  { id: "naturaleza", nombre: "Naturaleza" },
  { id: "mercado", nombre: "Mercado" },
  { id: "objetivos", nombre: "Objetivos" },
  { id: "instrumentos", nombre: "Instrumentos" },
  { id: "medidas", nombre: "Medidas" },
  { id: "impactos", nombre: "Impactos" },
];
export const A1 = {
  flechas: ["cobra", "gasta", "debe"],
  objetivos: ["Asignación", "Redistribución", "Estabilización", "Crecimiento", "Ambiente"],
  instrumentos: ["Tributación", "Gasto público", "Deuda pública"],
  expansiva: "Expansiva",
  contraccionista: "Contraccionista",
  impactos: "se ve en La balanza fiscal",
};

/* ─── A2 · Tres buzones ─── */
export const A2 = { moneda: "Moneda", pozo: "Pozo común", ticket: "Ticket", anden: "Andén nuevo" };

/* ─── A3 · Dos cajeros ─── */
export const A3 = {
  directo: "Directo",
  indirecto: "Indirecto",
  billeteras: [
    { id: "pequena", nombre: "Pequeña", cobro: 1 },
    { id: "mediana", nombre: "Mediana", cobro: 2 },
    { id: "grande", nombre: "Grande", cobro: 4 },
  ],
  camisa: "Camisa",
  fichas: [
    { id: "renta", nombre: "Renta", tipo: "directo" },
    { id: "predial", nombre: "Predial", tipo: "directo" },
    { id: "vehiculos", nombre: "Vehículos", tipo: "directo" },
    { id: "ica", nombre: "ICA", tipo: "directo" },
    { id: "iva", nombre: "IVA", tipo: "indirecto" },
    { id: "impoconsumo", nombre: "Impoconsumo", tipo: "indirecto" },
    { id: "aranceles", nombre: "Aranceles", tipo: "indirecto" },
  ],
  retencion: "Retención",
  declaracion: "Declaración",
  saldo: "Saldo a pagar",
  /* Rótulos de construcción (construccion-t3.md, decisión 3): la línea de
   * tiempo cuenta monedas, no pesos, porque la ficha no da cifras de renta. */
  pasarMes: "Pasa un mes",
  caja: "Caja de retenciones",
  impuestoAno: "Impuesto del año",
  retencionMes: 1,
  impuestoDelAno: 14,
  niveles: [
    { id: "nacion", nombre: "Nación", impuestos: ["Renta", "IVA"] },
    { id: "departamento", nombre: "Departamento", impuestos: ["Vehículos"] },
    { id: "municipio", nombre: "Municipio", impuestos: ["Predial", "ICA"] },
  ],
};

/* ─── A4 · El tanque del Estado ─── */
export const A4 = {
  tributos: "Tributos",
  desagues: [
    { id: "funcionamiento", nombre: "Funcionamiento", destinos: ["Nómina", "Insumos", "Servicios"] },
    { id: "inversion", nombre: "Inversión", destinos: ["Vía", "Escuela", "Metro"] },
    { id: "servicio", nombre: "Servicio de la deuda", destinos: ["Intereses y abonos"] },
  ],
  prestamo: "Préstamo",
  boquillas: [
    { id: "interna", nombre: "Interna (pesos, TES)" },
    { id: "externa", nombre: "Externa" },
  ],
  /* Saldo de la deuda, d. 42 (documento real del profesor), en billones de pesos. */
  deuda: { interna: 840, externa: 354, total: 1194 },
  billon: "1 billón = un millón de millones",
  saldo: "La deuda (saldo)",
  cubeta: "El servicio (lo pagado en el año)",
  /* Rótulos de construcción (decisión 4). */
  abrir: "Abrir",
  nivel: "Nivel del tanque",
  suma: "Suma",
  unidad: "billones",
  montanas: { interna: "Interna", externa: "Externa" },
};

/* ─── A5 · La balanza fiscal ─── */
export const A5 = {
  expansiva: "Expansiva",
  contraccionista: "Contraccionista",
  fichasExpansivas: [
    { id: "masG", texto: "más G", dG: 50 },
    { id: "masTR", texto: "más TR", dTR: 50 },
    { id: "menosT", texto: "menos t", dt: -0.05 },
  ],
  fichasContraccionistas: [
    { id: "menosG", texto: "menos G", dG: -50 },
    { id: "menosTR", texto: "menos TR", dTR: -50 },
    { id: "masT", texto: "más t", dt: 0.05 },
  ],
  reforma: { texto: "Reforma para recaudar", rotulo: "recaudo", dt: 0.05 },
  globo: "DA",
  multiplicador: "multiplicador",
  /* Rótulos de construcción (decisión 5). */
  ecuacion: "DA = C̄ + c(Y + TR − tY) + Ī − b·i + G + XN",
  perillas: { G: "G · gasto público", TR: "TR · transferencias", t: "t · impuesto sobre la renta" },
  /* d. 19, ≤ 12 palabras cada uno. */
  impactos: [
    { id: "familia", nombre: "Familia", personaje: "familia", texto: "Su capacidad de compra cambia con la renta disponible y los precios." },
    { id: "empresa", nombre: "Empresa", personaje: null, texto: "Cambian sus costos y utilidades, y con ellas lo que reinvierte." },
    { id: "inversionista", nombre: "Inversionista", personaje: "inversionista", texto: "Una política puede atraer o espantar inversión nacional y extranjera." },
    { id: "region", nombre: "Región", personaje: null, texto: "La inversión pública la desarrolla y cierra brechas." },
  ],
};
