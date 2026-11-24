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

/* ═══ Hacer (§2): consignas, bancos, retro. Todo tal cual de la especificación. ═══ */

export const CONSIGNAS = {
  "pf26-h1-moneda": "Arrastra cada pago al buzón que le corresponde.",
  "pf26-h2-cajero": "Desliza cada tributo hacia el cajero que lo cobra.",
  "pf26-h3-factura": "Toca cada línea y dile qué es.",
  "pf26-h5-montanas": "Resuelve cada reto sobre las montañas de la deuda.",
  "pf26-h4-expande": "Pon la medida en su plato y di por dónde entra.",
  "pf26-h6-memo": "Toca la frase del memo que está mal.",
};

/* ─── H1 · Echa la moneda (8 de 11) ─── */
export const PARTIDA_H1 = 8;
const SUB_H1 = ["pf-instrumentos", "pf-tributacion-casos"];
export const BANCO_H1 = [
  { id: "iva-camisa", texto: "El IVA de una camisa", correcta: "impuesto", retro: { tasa: "No compras un servicio del Estado: es impuesto sobre la compra.", contribucion: "No financia una obra para ti: va al pozo común." } },
  { id: "peaje", texto: "El peaje Río Bogotá, $11.200", correcta: "tasa", retro: { impuesto: "A cambio usas la vía: eso lo vuelve tasa.", contribucion: "Pagas por pasar ahora, no una obra frente a tu casa." } },
  { id: "aeroportuaria", texto: "La tasa aeroportuaria del tiquete", correcta: "tasa", retro: { impuesto: "Pagas por usar el aeropuerto: es tasa.", contribucion: "Es pago por un servicio que usas hoy: tasa." } },
  { id: "pension", texto: "Tu aporte a pensión en la nómina", correcta: "contribucion", retro: { impuesto: "Financia tu propia seguridad social: es contribución.", tasa: "No pagas un servicio puntual: aportas a un sistema que te cubre." } },
  { id: "valorizacion", texto: "La valorización por una vía nueva frente a tu casa", correcta: "contribucion", retro: { impuesto: "Paga una obra que te beneficia: contribución.", tasa: "No es por usarla una vez: financia la obra que te valoriza." } },
  { id: "predial", texto: "El impuesto predial de tu apartamento", correcta: "impuesto", retro: { tasa: "No recibes un servicio a cambio: es impuesto.", contribucion: "No financia una obra específica: va al pozo común." } },
  { id: "notaria", texto: "Los derechos notariales al vender un apartamento", correcta: "tasa", retro: { impuesto: "Pagas por el servicio de la notaría: tasa.", contribucion: "Es un trámite que usas, no una obra: tasa." } },
  { id: "sena", texto: "El aporte del empleador al SENA", correcta: "contribucion", retro: { impuesto: "Es un aporte parafiscal: contribución.", tasa: "No pagas un servicio que usas: aportas a un sistema." } },
  { id: "impoconsumo", texto: "El impoconsumo del 8 % en un restaurante", correcta: "impuesto", retro: { tasa: "No es pago por un servicio del Estado: impuesto al consumo.", contribucion: "No financia una obra para ti: impuesto." } },
  { id: "matricula", texto: "La matrícula de un carro nuevo", correcta: "tasa", retro: { impuesto: "Pagas el trámite de registro: tasa.", contribucion: "Es un trámite, no una obra que te beneficia: tasa." } },
  { id: "vehiculo", texto: "El impuesto anual del vehículo", correcta: "impuesto", retro: { tasa: "No recibes un servicio a cambio: impuesto.", contribucion: "Va al pozo común: impuesto." } },
].map((x) => ({ ...x, subtemas: SUB_H1 }));

/* ─── H2 · ¿Qué cajero te cobra? (8 de 12) ─── */
export const PARTIDA_H2 = 8;
export const BANCO_H2 = [
  { id: "renta", texto: "Impuesto de renta", correcta: "directo", retro: "Depende de cuánto ganas: mira tu condición." },
  { id: "iva", texto: "IVA", correcta: "indirecto", retro: "Lo pagas al comprar, ganes lo que ganes." },
  { id: "predial", texto: "Predial", correcta: "directo", retro: "Recae sobre tu propiedad, según su avalúo." },
  { id: "impoconsumo", texto: "Impoconsumo", correcta: "indirecto", retro: "Va en la cuenta del restaurante, igual para todos." },
  { id: "ica", texto: "Industria y comercio (ICA)", correcta: "directo", retro: "Depende de los ingresos de la empresa." },
  { id: "arancel", texto: "Arancel", correcta: "indirecto", retro: "Va dentro del precio de lo importado." },
  { id: "vehiculos", texto: "Impuesto de vehículos", correcta: "directo", retro: "Depende del valor de tu carro." },
  { id: "ganancia", texto: "Ganancia ocasional", correcta: "directo", retro: "Grava una ganancia tuya, según su tamaño." },
  { id: "timbre", texto: "Timbre", correcta: "indirecto", retro: "Recae sobre el documento o la transacción." },
  { id: "patrimonio", texto: "Impuesto al patrimonio", correcta: "directo", retro: "Mira cuánto tienes: es directo." },
  { id: "retencion", texto: "Retención en la fuente sobre tu salario", correcta: "directo", retro: "Es tu impuesto de renta cobrado por adelantado." },
  { id: "salida", texto: "Impuesto de salida del país", correcta: "indirecto", retro: "Lo paga todo el que sale, sin mirar su renta." },
].map((x) => ({ ...x, subtemas: ["pf-impuestos"] }));

/* ─── H3 · La factura con lupa (3 documentos de 4 = 3 etapas) ─── */
export const PARTIDA_H3 = 3;
export const FICHAS_H3 = [
  { id: "directo", nombre: "Impuesto directo", tributo: "impuesto" },
  { id: "indirecto", nombre: "Impuesto indirecto", tributo: "impuesto" },
  { id: "tasa", nombre: "Tasa", tributo: "tasa" },
  { id: "contribucion", nombre: "Contribución", tributo: "contribucion" },
  { id: "no", nombre: "No es tributo", tributo: null },
];
export const H3 = { alEstado: "Lo que va al Estado", siguiente: "Siguiente documento", terminar: "Terminar", profesor: "El profesor pregunta:" };
const SUB_H3 = ["pf-tributacion-casos", "pf-impuestos"];
export const DOCUMENTOS_H3 = [
  {
    id: "carro", titulo: "Carro nuevo", pregunta: "¿Por qué el carro cuesta tanto más?",
    lineas: [
      { id: "base", texto: "Precio base", monto: "$130.000.000", clave: "no" },
      { id: "iva", texto: "IVA 19 %", monto: "$24.700.000", clave: "indirecto" },
      { id: "impoconsumo", texto: "Impoconsumo 8 %", monto: "$10.400.000", clave: "indirecto" },
      { id: "matricula", texto: "Matrícula y registro", monto: "$540.200", clave: "tasa" },
      { id: "revision", texto: "Revisión técnico-mecánica", monto: "$327.219", clave: "no" },
      { id: "vehiculo", texto: "Impuesto anual del vehículo", monto: "$3.336.000", clave: "directo" },
    ],
  },
  {
    id: "tiquete", titulo: "Tiquete internacional", pregunta: "¿Por qué el tiquete es tan caro?",
    lineas: [
      { id: "tarifa", texto: "Tarifa base", monto: null, clave: "no" },
      { id: "aeroportuaria", texto: "Tasa aeroportuaria", monto: null, clave: "tasa" },
      { id: "timbre", texto: "Timbre nacional", monto: "≈ US$ 38", clave: "indirecto" },
      { id: "salida", texto: "Impuesto de salida", monto: "≈ $115.000", clave: "indirecto" },
      { id: "administrativa", texto: "Tarifa administrativa", monto: null, clave: "no" },
      { id: "combustible", texto: "Combustible y cargos", monto: null, clave: "no" },
    ],
  },
  {
    id: "notaria", titulo: "Venta de apartamento en notaría", pregunta: "¿Por qué me cobran tanto en la notaría?",
    lineas: [
      { id: "derechos", texto: "Derechos notariales", monto: null, clave: "tasa" },
      { id: "autenticaciones", texto: "Autenticaciones y biometría", monto: null, clave: "tasa" },
      { id: "fondo", texto: "Fondo de notariado y superintendencia", monto: null, clave: "tasa" },
      { id: "iva", texto: "IVA del servicio notarial", monto: null, clave: "indirecto" },
      { id: "retencion", texto: "Retención en la fuente por la venta", monto: null, clave: "directo" },
    ],
    pie: { rotulo: "Total", monto: "$2.316.824" },
  },
  {
    id: "nomina", titulo: "Nómina de un salario alto", pregunta: "¿Qué me quitan del salario?",
    lineas: [
      { id: "salario", texto: "Salario integral", monto: "$16.900.000", clave: "no" },
      { id: "salud", texto: "Salud 4 %", monto: "$473.200", clave: "contribucion" },
      { id: "pension", texto: "Pensión 4 %", monto: "$473.200", clave: "contribucion" },
      { id: "solidaridad", texto: "Fondo de solidaridad 1 %", monto: "$118.300", clave: "contribucion" },
      { id: "retencion", texto: "Retención en la fuente", monto: "$1.014.000", clave: "directo" },
    ],
    pie: { rotulo: "Neto", monto: "$14.821.300" },
  },
].map((d) => ({ ...d, lineas: d.lineas.map((l) => ({ ...l, subtemas: SUB_H3 })) }));
/* Retro por par: RETRO_H3[verdadero][elegido]. */
export const RETRO_H3 = {
  directo: { indirecto: "Mira tu renta o tu bien, no solo la compra.", tasa: "No pagas un servicio: es impuesto sobre ti.", contribucion: "No financia un sistema o una obra para ti.", no: "Sí es tributo: va al Estado, según tu condición." },
  indirecto: { directo: "Recae en la compra; no mira quién paga.", tasa: "No es pago por un servicio del Estado.", contribucion: "Va al pozo común, no a una obra tuya.", no: "Sí es tributo: lo cobra el Estado en la compra." },
  tasa: { directo: "Pagas por un servicio que usas; no mira tu renta.", indirecto: "No grava una compra: paga un servicio público.", contribucion: "Pagas el servicio que usas ahora, no una obra.", no: "Sí es tributo: es el precio de un servicio público." },
  contribucion: { directo: "Financia un sistema que te cubre, no es impuesto.", indirecto: "No grava una compra: es aporte a un sistema.", tasa: "No pagas un servicio puntual: aportas a un sistema.", no: "Sí es tributo: es un aporte obligatorio." },
  no: { directo: "Es el precio de lo comprado; no va al Estado.", indirecto: "Es precio o cargo privado, no impuesto.", tasa: "Lo cobra una empresa, no el Estado.", contribucion: "No es aporte obligatorio al Estado." },
};

/* ─── H5 · Las dos montañas (5 retos seguidos) ─── */
export const H5 = {
  retos: [
    { id: "division", consigna: "Arrastra la división: ¿cuánto de 1.194 es deuda interna?", subtemas: ["pf-deuda-casos"],
      correcta: 840, tolerancia: 30, min: 0, max: 1194, paso: 10, inicial: 600,
      retroBajo: "La interna es la más grande: cerca de 840 billones.", retroAlto: "Te pasaste: la externa suma unos 354." },
    { id: "acreedores", consigna: "Lleva cada acreedor a su montaña.", subtemas: ["pf-deuda-casos"],
      banderas: [
        { id: "pensiones", texto: "Fondos de pensiones", correcta: "interna", retro: "Prestan en pesos, vía TES: deuda interna." },
        { id: "bancos", texto: "Bancos comerciales colombianos", correcta: "interna", retro: "Prestan en pesos, vía TES: deuda interna." },
        { id: "bid", texto: "BID", correcta: "externa", retro: "Es un banco multilateral de afuera: externa." },
        { id: "kfw", texto: "KfW de Alemania", correcta: "externa", retro: "Es una agencia de otro país: crédito bilateral, externa." },
      ] },
    { id: "papel", consigna: "¿Con qué papel se presta casi toda la deuda interna?", subtemas: ["pf-deuda-casos"],
      papeles: [
        { id: "tes", texto: "TES", retro: null },
        { id: "globales", texto: "Bonos globales", retro: "Se venden a inversionistas de afuera: deuda externa." },
        { id: "bid", texto: "Crédito del BID", retro: "Es un préstamo multilateral externo." },
      ], correcta: "tes" },
    { id: "cubeta", consigna: "El Gobierno paga intereses y abonos este año. ¿Eso es…?", subtemas: ["pf-deuda-casos"],
      destinos: [{ id: "saldo", texto: "Saldo de la deuda" }, { id: "servicio", texto: "Servicio de la deuda" }], correcta: "servicio",
      cubeta: "Intereses y abonos", retro: "El saldo es lo que se debe; pagar es servicio de la deuda." },
    { id: "cables", consigna: "Conecta cada deuda con lo que puede mover.", subtemas: ["pf-impactos"],
      tomas: [{ id: "tasa", texto: "Tasa de interés" }, { id: "cambio", texto: "Tipo de cambio" }], correcta: { interna: "tasa", externa: "cambio" },
      retro: "La interna compite por pesos: tasa. La externa trae dólares: tipo de cambio." },
  ],
  interna: "Interna",
  externa: "Externa",
  comprobar: "Comprobar",
  siguiente: "Siguiente reto",
  terminar: "Terminar",
};

/* ─── H4 · ¿Expande o contrae? (8 de 10; 2 criterios por medida) ─── */
export const PARTIDA_H4 = 8;
export const ENTRADAS_H4 = [
  { id: "autonomo", nombre: "Gasto autónomo (G o TR)" },
  { id: "multiplicador", nombre: "Multiplicador (t)" },
];
export const H4 = { revelar: "Revelar", siguiente: "Siguiente medida", terminar: "Terminar", entrada: "¿Por dónde entra?" };
const SUB_H4 = ["pf-medidas", "pf-en-da"];
export const BANCO_H4 = [
  { id: "vias", texto: "Subir el gasto en vías", plato: "expansiva", termino: "G", retroPlato: "Más gasto suma a la demanda: expansiva.", retroEntrada: "Es gasto del Gobierno: entra por G, en el gasto autónomo." },
  { id: "bajar-renta", texto: "Bajar la tarifa del impuesto de renta", plato: "expansiva", termino: "t", retroPlato: "Menos impuesto deja más renta disponible: expansiva.", retroEntrada: "Cambia la tasa t: agranda el multiplicador." },
  { id: "renta-ciudadana", texto: "Recortar el subsidio de Renta Ciudadana", plato: "contraccionista", termino: "TR", retroPlato: "Menos transferencias, menos consumo: contraccionista.", retroEntrada: "Es una transferencia a hogares: entra por TR." },
  { id: "subir-renta", texto: "Subir el impuesto de renta a las personas", plato: "contraccionista", termino: "t", retroPlato: "Más impuesto, menos renta disponible: contraccionista.", retroEntrada: "Sube t: encoge el multiplicador." },
  { id: "colombia-mayor", texto: "Aumentar el pago de Colombia Mayor", plato: "expansiva", termino: "TR", retroPlato: "Más dinero a hogares sube el consumo: expansiva.", retroEntrada: "Es una transferencia: entra por TR." },
  { id: "funcionamiento", texto: "Recortar el gasto de funcionamiento", plato: "contraccionista", termino: "G", retroPlato: "Menos gasto público resta a la demanda.", retroEntrada: "Es gasto del Gobierno: entra por G." },
  { id: "mi-casa-ya", texto: "Adicionar $1 billón a Mi Casa Ya", plato: "expansiva", termino: "TR", retroPlato: "Más subsidio a hogares sube su gasto: expansiva.", retroEntrada: "Es un subsidio a hogares: transferencia, TR." },
  { id: "beneficios", texto: "Quitar beneficios en el impuesto de renta", plato: "contraccionista", termino: "t", retroPlato: "Se paga más impuesto: la demanda baja.", retroEntrada: "Sube lo que se paga sobre la renta: t." },
  { id: "declaren", texto: "Que más personas declaren y paguen renta", plato: "contraccionista", termino: "t", retroPlato: "Más gente paga renta: baja la renta disponible.", retroEntrada: "Sube la tasa efectiva sobre la renta: t." },
  { id: "metro", texto: "Construir la primera línea del metro de Bogotá", plato: "expansiva", termino: "G", retroPlato: "Una obra pública suma a la demanda: expansiva.", retroEntrada: "La paga el Gobierno: entra por G." },
].map((x) => ({ ...x, entrada: x.termino === "t" ? "multiplicador" : "autonomo", subtemas: SUB_H4 }));

/* ─── H6 · El memo de la gerencia (4 de 5) ─── */
export const PARTIDA_H6 = 4;
export const H6 = { empresa: "NOVA S. A.", membrete: "Memo interno", firma: "La gerencia", correcta: "✓ correcta", siguiente: "Siguiente memo", terminar: "Terminar" };
const memo = (id, subtemas, frases, correccion) => ({
  id, subtemas: [...subtemas, "pf-preparcial"], correccion,
  frases: frases.map(([fid, texto, retro]) => ({ id: `${id}-${fid}`, texto, retro, falsa: retro == null })),
});
export const BANCO_H6 = [
  memo("m1", ["pf-impactos", "pf-medidas"], [
    ["a", "Si bajan el impuesto de renta a empresas, nuestras utilidades suben.", "Correcta: menos impuesto, más utilidad."],
    ["b", "Con más utilidades podemos repartir más o reinvertir.", "Correcta: la utilidad se reparte o se reinvierte."],
    ["c", "Si suben el IVA, nuestros clientes compran más.", null],
    ["d", "Más impuesto a las personas reduce su renta disponible.", "Correcta: el impuesto resta a la renta."],
  ], "Con más IVA, los precios suben y los clientes compran menos."),
  memo("m2", ["pf-impactos", "pf-medidas"], [
    ["a", "Si el Gobierno invierte en vías, bajan nuestros costos de transporte.", "Correcta: mejor infraestructura, menor costo."],
    ["b", "Recortar subsidios a hogares sube nuestras ventas.", null],
    ["c", "La inversión pública mejora la competitividad.", "Correcta: así lo plantea la clase."],
    ["d", "Más gasto público sube la demanda agregada.", "Correcta: G suma directo a la DA."],
  ], "Menos subsidios, menos renta disponible: nuestras ventas bajan."),
  memo("m3", ["pf-impactos", "pf-deuda-casos"], [
    ["a", "Más deuda interna del Gobierno puede subir la tasa de interés.", "Correcta: compite por los mismos pesos."],
    ["b", "Más deuda externa no tiene relación con el dólar.", null],
    ["c", "Una tasa más alta encarece nuestros créditos.", "Correcta: la tasa es el precio del crédito."],
    ["d", "Si el crédito se encarece, invertimos menos.", "Correcta: I = Ī − b·i."],
  ], "Más deuda externa puede mover el tipo de cambio."),
  memo("m4", ["pf-impactos", "pf-medidas"], [
    ["a", "Una reforma para recaudar puede bajar la demanda como efecto colateral.", "Correcta: recauda, pero resta renta disponible."],
    ["b", "Bajar t agranda el multiplicador.", "Correcta: el denominador se achica."],
    ["c", "Subir impuestos es una política fiscal expansiva.", null],
    ["d", "Más pagos de Renta Ciudadana suben el consumo.", "Correcta: más TR, más consumo."],
  ], "Subir impuestos es contraccionista: baja la demanda agregada."),
  memo("m5", ["pf-instrumentos"], [
    ["a", "Los impuestos son pagos sin contraprestación directa.", "Correcta: van al pozo común."],
    ["b", "El peaje que pagan nuestros camiones es un impuesto.", null],
    ["c", "El aporte a pensión de nuestros empleados es contribución.", "Correcta: financia su seguridad social."],
    ["d", "El ICA que pagamos es un impuesto directo.", "Correcta: depende de nuestros ingresos."],
  ], "El peaje es una tasa: pago por usar un servicio."),
];

/* ─── Escenas (rediseño con la lista de 5, spec de Gen 24-nov §2, T3) ───
 * La franja de arriba de cada pieza: tema hacienda, hora, lado, mascota,
 * TU PAPEL (≤ 15 palabras) y contexto (≤ 30). En las Hacer, `porRonda` da el
 * mini contexto de la escena compacta (≤ 12): `todas` = el mismo en cada
 * ronda; `etiqueta` + `texto` = la etiqueta fija y el campo de la ronda.
 * escenas.test.mjs lo mide. Solo presentación: no toca ids ni puntajes. */
const hacienda = (hora, lado, mascota, rol, contexto, porRonda = null) => ({ tema: "hacienda", hora, lado, ...mascota, rol, contexto, porRonda });
export const ESCENAS = {
  "pf26-a1-lupa": hacienda("dia", "der", { mascota: { id: "analista", pose: "lupa" } },
    "Eres el analista que revisa la política fiscal con una lupa de seis caras.",
    "El Gobierno presentó su plan de impuestos y gasto. Antes de opinar, hay que mirarlo por todos los lados."),
  "pf26-a2-buzones": hacienda("manana", "izq", { mascota: { id: "familia", pose: "recibo" } },
    "Te contratan en la DIAN para clasificar lo que entra al Estado.",
    "Cada día llegan pagos al Estado: el IVA de un café, un peaje, el aporte a salud."),
  "pf26-a3-cajeros": hacienda("tarde", "der", { mascota: { id: "familia", pose: "mercado" } },
    "Trabajas en la DIAN y atiendes dos ventanillas distintas.",
    "A una ventanilla llega quien declara su renta; a la otra, quien compra un celular con IVA."),
  "pf26-a4-tanque": hacienda("noche", "izq", { mascota: { id: "autoridad-economica", pose: "grifo" } },
    "Te contratan para cuidar el tanque del presupuesto nacional.",
    "Este año entraron tributos y préstamos. Salieron pagos de funcionamiento, inversión y deuda."),
  /* Los impactos de la última pantalla conservan su mascota de 180 (A5Balanza.jsx). */
  "pf26-a5-balanza": hacienda("dia", "izq", { mascota: { id: "autoridad-economica", pose: "timon" } },
    "Eres el asesor del ministro: dile qué hace cada perilla.",
    "El ministro tiene tres perillas fiscales y quiere saber cómo mueve cada una la demanda."),
  "pf26-h1-moneda": hacienda("manana", "der", { mascota: { id: "familia", pose: "alcancia" } },
    "Trabajas en la DIAN: cada pago entra a su buzón.",
    "Abriste la ventanilla. Los pagos del día llegan uno por uno.",
    { todas: "Siguiente pago:" }),
  "pf26-h2-cajero": hacienda("tarde", "izq", { mascota: { id: "empresario", pose: "explica" } },
    "Eres el jefe de cajeros de la DIAN.",
    "Cada tributo se cobra en una caja: la de directos o la de indirectos.",
    { todas: "Llega un tributo:" }),
  /* El profesor sube del hueco de 120 a la franja (180 en la tarjeta de inicio);
     su pregunta de cada documento es el mini contexto de la ronda. */
  "pf26-h3-factura": hacienda("noche", "der", { mascota: { id: "profesor", pose: "pregunta" } },
    "Eres el asistente del profesor; él te muestra un documento real.",
    "Cada documento trae su precio desglosado. Algunas líneas van al Estado; otras, no.",
    { etiqueta: H3.profesor, texto: "pregunta" }),
  "pf26-h4-expande": hacienda("dia", "der", { mascota: { id: "autoridad-economica", pose: "carpeta" } },
    "Eres el asesor del ministro de Hacienda.",
    "Llega una medida nueva. Di si expande o contrae, y por dónde entra a la demanda.",
    { todas: "Medida sobre la mesa:" }),
  "pf26-h5-montanas": hacienda("manana", "izq", { mascota: { id: "deudor-externo", pose: "sobre" } },
    "Te contratan como analista de deuda pública del Ministerio de Hacienda.",
    "La deuda de Colombia es una cordillera: una montaña interna y otra externa.",
    { texto: "consigna" }),
  "pf26-h6-memo": hacienda("tarde", "der", { mascota: { id: "empresario", pose: "periodico" } },
    "Te contratan como asesor de NOVA S. A. para revisar su memo.",
    "La gerencia escribe memos sobre la política fiscal. En cada uno se coló una frase equivocada.",
    { todas: "Memo nuevo de la gerencia:" }),
};
