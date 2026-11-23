/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T4 POLÍTICA MONETARIA — TODOS LOS TEXTOS, TAL CUAL
 *
 * Fuente única: orquestador/conocimiento/macro-2026/disenos/t4-politica-monetaria.md
 * (Gen, 22-nov). Ninguna pieza escribe un texto a mano: todo sale de aquí, y
 * la prueba t4-textos-y-bancos.test.mjs cuenta las palabras contra §4.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─── Subtemas del tema (ficha 4, §1) ─── */
export const SUBTEMAS = {
  "pm-apertura": "Por qué importa el dinero y dónde entra la política monetaria",
  "pm-formas-dinero": "Formas del dinero",
  "pm-creacion-primaria": "Creación primaria de dinero",
  "pm-creacion-secundaria": "Creación secundaria de dinero",
  "pm-preguntas-balance": "Operaciones y balance del Banco Central",
  "pm-agregados": "Agregados monetarios: BM, M1, M2 y M3",
  "pm-mercado-dinero": "El mercado de dinero y la tasa de interés",
  "pm-naturaleza": "Naturaleza de la política monetaria",
  "pm-instrumentos": "Instrumentos: tasa, OMA y encaje",
  "pm-medidas": "Medidas expansivas y contraccionistas",
  "pm-impactos": "Impactos de la política monetaria",
  "pm-caso-inflacion-tasa": "Caso Colombia: inflación y tasa de intervención",
};

/* ─── Aprender: el texto exacto de cada pantalla (§2) ─── */
export const APRENDER = {
  "pm26-a1-billetera": [
    "El dinero no es solo lo que gastas: hace posible cada transacción de la economía.",
    "Toca cada cosa y mira de dónde sale ese dinero.",
    "Ojo: pagar con tarjeta de crédito es pedir prestado, no gastar lo tuyo.",
    "Si la gente pierde la confianza en una moneda, termina valiendo menos que el papel.",
    "El dinero se conecta con la tasa de interés, y la tasa con ahorrar, prestar e invertir.",
  ],
  "pm26-a2-ventanilla": [
    "Solo el Banco de la República emite el peso colombiano.",
    "Emite comprando cosas: dólares, oro o TES. A cambio, entrega pesos.",
    "También emite prestándoles a los bancos.",
    "Si vende lo que compró, o le pagan un préstamo, los pesos vuelven y se retiran.",
    "Billetes guardados en el banco no son dinero. Lo son al salir a cambio de algo.",
    "Ese dinero que sale de la ventanilla es la creación primaria: la base monetaria.",
  ],
  "pm26-a3-cascada": [
    "Llevas 1.000 pesos al banco. El banco no los guarda todos quietos.",
    "Una parte, el encaje, la congela en el BanRep. Esa no se presta.",
    "El resto lo presta. Quien recibe el préstamo lo deposita en otro banco.",
    "Así, 1.000 pesos se vuelven muchos más. Es la creación secundaria.",
    "Encaje alto, cascada corta. Encaje bajo, cascada larga.",
  ],
  "pm26-a4-cajas": [
    "Base monetaria: el efectivo más las reservas de los bancos en el BanRep.",
    "M1, los medios de pago: efectivo más cuentas corrientes.",
    "M2 suma los cuasidineros: ahorros, CDT y CDAT. No pagas con ellos, pero casi.",
    "M3 suma otros depósitos a la vista y bonos.",
    "En Colombia, M3 es unas cinco veces la base monetaria: unos 1.031 billones.",
    "Entre más arriba, más líquido: más fácil de gastar ya.",
  ],
  "pm26-a5-precio-dinero": [
    "El BanRep decide cuánto dinero hay. Por eso la oferta es una pared vertical.",
    "La gente quiere menos dinero en la mano cuando la tasa de interés sube.",
    "Con más ingreso, quieres más dinero para tus compras: la demanda se corre.",
    "Donde se cruzan, sale la tasa de interés: el precio del dinero.",
    "Más dinero, tasa más baja. Menos dinero, tasa más alta.",
    "Si los precios suben y el dinero no, hay menos dinero real: la tasa sube.",
  ],
  "pm26-a6-palancas": [
    "Naturaleza: regula la creación de dinero, el sistema financiero y el crédito.",
    "Objetivos: controlar los precios y apoyar el crecimiento económico.",
    "Instrumentos: tasa de intervención, operaciones de mercado abierto con TES, y encaje.",
    "Expansiva: bajar la tasa, comprar TES o bajar el encaje. Más dinero, más demanda.",
    "Contraccionista: subir la tasa, vender TES o subir el encaje.",
    "En la demanda agregada entra por la tasa: −b·i. Tasa más baja, más inversión.",
    "Sus efectos llegan al crédito, la inversión, el consumo, la deuda pública y los capitales.",
  ],
  "pm26-a7-termostato": [
    "Inflación alta es una casa caliente. La tasa de interés es el aire acondicionado.",
    "La meta: que la inflación quede entre 2 % y 4 %.",
    "Recorre los años: cuando la inflación se dispara, la tasa sube detrás.",
    "El aire tarda en enfriar: la tasa actúa con rezago de meses.",
  ],
};

/* §4: conteo de palabras que declara la especificación. */
export const CONTEO_APRENDER = {
  "pm26-a1-billetera": [14, 10, 13, 15, 16],
  "pm26-a2-ventanilla": [9, 11, 6, 15, 15, 14],
  "pm26-a3-cascada": [13, 13, 13, 12, 8],
  "pm26-a4-cajas": [13, 9, 15, 8, 14, 9],
  "pm26-a5-precio-dinero": [14, 14, 14, 12, 9, 16],
  "pm26-a6-palancas": [12, 9, 12, 15, 9, 14, 15],
  "pm26-a7-termostato": [13, 10, 12, 11],
};

/* ─── A1 · Lo que llevas en la billetera ─── */
export const A1 = {
  abrir: "Abrir la billetera",
  objetos: [
    { id: "billetes", nombre: "Billetes", objeto: "billetes", origen: "los emite el Banco de la República" },
    { id: "cheque", nombre: "Cheque", objeto: "recibo", origen: "mueve una cuenta corriente" },
    { id: "debito", nombre: "Tarjeta débito", objeto: null, origen: "toca tu cuenta de ahorros" },
    { id: "cdt", nombre: "CDT", objeto: null, origen: "ahorro a plazo fijo" },
    { id: "credito", nombre: "Tarjeta de crédito", objeto: null, origen: "es un préstamo del banco" },
  ],
  prestamo: "préstamo",
  bolso: "el papel vale más que el billete",
  tocarBolso: "Tocar el bolso",
  aguja: "tasa de interés",
  conexiones: [
    { id: "ahorro", nombre: "Ahorro", objeto: "alcancia" },
    { id: "credito", nombre: "Crédito", objeto: "cajero" },
    { id: "capitales", nombre: "Capitales", objeto: "avion-carga" },
  ],
};

/* ─── A2 · La ventanilla del BanRep ─── */
export const A2 = {
  contador: "Base monetaria",
  contadorFinal: "Base monetaria = creación primaria",
  banco: "Banco de la República",
  activos: [
    { id: "dolar", nombre: "Dólar", objeto: "billete-dolar" },
    { id: "oro", nombre: "Lingote de oro", objeto: null },
    { id: "tes", nombre: "Papel TES", objeto: "recibo" },
    { id: "pagare", nombre: "Pagaré: préstamo a un banco", objeto: "recibo" },
  ],
  fajo: "Pesos",
  vende: "El BanRep vende",
  estante: "aún no son dinero",
  paso: 100,
};

/* ─── H1 · ¿Entra o sale dinero? (6 de 9; 3 flechas por operación) ─── */
export const PARTIDA_H1 = 6;
export const MEDIDORES_H1 = [
  { id: "activos", nombre: "Activos del BanRep" },
  { id: "bm", nombre: "Base monetaria" },
  { id: "m2", nombre: "Dinero en la economía (M2)" },
];
export const FLECHAS = { sube: "↑", baja: "↓", igual: "=" };
export const ORDEN_FLECHAS = ["sube", "baja", "igual"];
export const NOMBRE_FLECHA = { sube: "sube", baja: "baja", igual: "queda igual" };
export const H1 = { revelar: "Revelar", siguiente: "Siguiente operación", terminar: "Terminar" };
const op = (id, texto, flechas, retro, tipo, subtemas) => ({
  id, texto, tipo,
  correctas: { activos: flechas[0], bm: flechas[1], m2: flechas[2] },
  retro: { activos: retro[0], bm: retro[1], m2: retro[2] },
  subtemas: [...subtemas, "pm-preguntas-balance"],
});
const PRIM = ["pm-creacion-primaria"];
const SEC = ["pm-creacion-secundaria"];
const S = "sube", B = "baja", I = "igual";
export const BANCO_H1 = [
  op("compra-dolares", "El BanRep compra dólares en el mercado cambiario.", [S, S, S], ["Recibe dólares: sus activos crecen.", "Paga con pesos nuevos: la base sube.", "Más pesos circulando: más dinero en la economía."], "compra", PRIM),
  op("vende-dolares", "El BanRep vende dólares en el mercado cambiario.", [B, B, B], ["Entrega dólares: sus activos bajan.", "Recibe pesos que salen de circulación.", "Menos pesos circulando."], "vende", PRIM),
  op("vende-oro", "El BanRep vende oro a joyeros nacionales.", [B, B, B], ["El oro sale: sus activos bajan.", "Los joyeros pagan con pesos que se retiran.", "Menos pesos en la economía."], "vende", PRIM),
  op("compra-tes", "El BanRep compra TES a inversionistas.", [S, S, S], ["Recibe TES: sus activos crecen.", "Paga con pesos nuevos: la base sube.", "Es una OMA expansiva: más dinero."], "compra", PRIM),
  op("vende-tes", "El BanRep vende TES a los bancos.", [B, B, B], ["Entrega TES: sus activos bajan.", "Los bancos pagan con pesos que se retiran.", "OMA contractiva: menos dinero."], "vende", PRIM),
  op("presta", "El BanRep le presta liquidez a un banco.", [S, S, S], ["El préstamo es un activo del BanRep.", "Entrega pesos nuevos al banco.", "Más liquidez, más dinero."], "compra", PRIM),
  op("paga-credito", "Un banco le paga un crédito al BanRep.", [B, B, B], ["Se cancela un préstamo: el activo desaparece.", "Los pesos vuelven al BanRep.", "Menos pesos circulando."], "vende", PRIM),
  op("sube-encaje", "El BanRep sube el encaje.", [I, I, B], ["No compra ni vende nada: sus activos no cambian.", "No emite ni retira pesos: la base igual.", "Los bancos prestan menos: se multiplica menos dinero."], "cascada", SEC),
  op("retiran-depositos", "La gente retira sus depósitos de los bancos.", [I, I, B], ["El BanRep no interviene: activos igual.", "No hay emisión nueva: la base igual.", "Menos depósitos, menos créditos: menos dinero secundario."], "cascada", SEC),
];

/* ─── A3 · La cascada de vasos ─── */
export const A3 = {
  deposito: 1000,
  encajeInicial: 10,
  encaje: "Encaje",
  siguiente: "Siguiente préstamo",
  toda: "Ver toda la cascada",
  contador: "Depósitos",
  formula: "$ → D − E = Cr → + $",
  personas: ["A", "B", "C", "D", "E", "F"],
  banco: "Banco",
};

/* ─── H2 · Ajusta la cascada (3 etapas) ─── */
export const H2 = {
  contador: "Dinero total en depósitos",
  meta: "Meta",
  fijar: "Fijar",
  siguiente: "Siguiente etapa",
  terminar: "Terminar",
  cierre: "Supone que todo préstamo vuelve como depósito.",
  min: 5, max: 50, paso: 5, inicial: 30,
  fijarMax: 3,
};
export const ETAPAS_H2 = [
  { id: "e1", meta: 5000, solucion: 20, retroArriba: "Demasiado dinero: sube el encaje.", retroAbajo: "Muy poco: baja el encaje.", pista: "Con 20 % se congela uno de cada cinco pesos." },
  { id: "e2", meta: 10000, solucion: 10, retroArriba: "Te pasaste: sube un poco el encaje.", retroAbajo: "Falta: baja el encaje para alargar la cascada.", pista: "Busca un encaje de una cifra redonda pequeña." },
  { id: "e3", meta: 4000, solucion: 25, retroArriba: "Aún sobra dinero: sube el encaje.", retroAbajo: "Frenaste de más: baja el encaje.", pista: "Con 25 % se congela uno de cada cuatro pesos." },
].map((e) => ({ ...e, subtemas: ["pm-creacion-secundaria", "pm-instrumentos"] }));
/** Total de la cascada del profesor: 1.000 / encaje, redondeado a entero. */
export const totalCascada = (encajePct, deposito = 1000) => Math.round(deposito / (encajePct / 100));

/* ─── A4 · Bóveda y cajas (cifras de agosto de 2026, miles de millones) ─── */
export const A4 = {
  boveda: "Base monetaria",
  efectivo: "efectivo",
  reservas: "reservas de los bancos",
  corrientes: "cuentas corrientes",
  cuasi: "ahorros, CDT, CDAT",
  cuasidineros: "cuasidineros",
  defCuasi: "Depósitos que no sirven para pagar directo, pero se vuelven efectivo rápido.",
  otros: "otros depósitos y bonos",
  liquido: "más líquido",
  cifras: { bm: 193755, m1: 231697, m2: 980377, m3: 1031096 },
  lista: ["Efectivo", "Cuenta corriente", "Ahorros", "CDT y CDAT", "Otros depósitos y bonos"],
};

/* ─── H3 · Cada depósito a su caja (7 de 9) ─── */
export const PARTIDA_H3 = 7;
export const CAJAS_H3 = [
  { id: "bm", nombre: "Base monetaria" },
  { id: "m1", nombre: "M1" },
  { id: "m2", nombre: "M2" },
  { id: "m3", nombre: "M3" },
  { id: "no", nombre: "No es depósito" },
];
const ficha = (id, texto, correcta, retro, subtemas = ["pm-agregados"]) => ({ id, texto, correcta, retro, subtemas });
export const BANCO_H3 = [
  ficha("corriente", "Cuenta corriente", "m1", { bm: "La BM son efectivo y reservas, no cuentas del público.", m2: "Ya entra en M1: es medio de pago.", m3: "Entra antes, en M1.", no: "Sí es un depósito a la vista." }),
  ficha("ahorros", "Cuenta de ahorros", "m2", { bm: "Es un depósito del público, no reserva del BanRep.", m1: "No se paga con cheque: es cuasidinero, M2.", m3: "Entra antes, en M2.", no: "Sí es depósito: un cuasidinero." }),
  ficha("cdt", "CDT", "m2", { bm: "Es ahorro del público en un banco.", m1: "Es ahorro a plazo: cuasidinero, M2.", m3: "Entra antes, en M2.", no: "Sí: es un depósito a término." }),
  ficha("cdat", "CDAT", "m2", { bm: "Es ahorro del público, no reserva.", m1: "Es a término: cuasidinero, M2.", m3: "Entra antes, en M2.", no: "Sí: depósito de ahorro a término." }),
  ficha("reservas", "Reservas de los bancos en el BanRep (encaje)", "bm", { m1: "Las reservas no son medio de pago del público.", m2: "No es ahorro del público: es reserva bancaria.", m3: "Es reserva: entra en la base monetaria.", no: "Es depósito de los bancos en el BanRep." }),
  ficha("judiciales", "Depósitos judiciales", "m3", { bm: "Es dinero del público, no reserva.", m1: "No es medio de pago: entra en M3.", m2: "No es cuasidinero: es otro depósito a la vista.", no: "Sí es depósito: está en M3." }),
  ficha("bonos", "Bonos del sistema financiero", "m3", { bm: "No los emite el BanRep como dinero.", m1: "No son medio de pago.", m2: "No son cuasidinero: entran en M3.", no: "Para el profesor, entran en M3." }),
  ficha("convenios", "Convenios de pago", "m3", { bm: "No es reserva del BanRep.", m1: "No es cuenta corriente: entra en M3.", m2: "No es cuasidinero: otro depósito a la vista.", no: "Sí: otro depósito a la vista." }),
  ficha("tarjeta", "Saldo de tu tarjeta de crédito", "no", { bm: "Es un préstamo del banco, no reserva.", m1: "No es dinero tuyo: es crédito.", m2: "No es ahorro: es deuda.", m3: "No es depósito: es un préstamo." }, ["pm-agregados", "pm-formas-dinero"]),
];

/* ─── A5 · El precio del dinero (modelo del mercado de dinero) ─── */
export const MODELO_DINERO = Object.freeze({ k: 0.5, h: 10, Y: 300, M: 100, Ymin: 260, Ymax: 360, Mmin: 80, Mmax: 120 });
/** i = (kY − M/P)/h, en %. Con los rangos de Gen queda entre 1 % y 10 %. */
export const tasaEquilibrio = ({ k, h, Y, M }) => (k * Y - M) / h;
export const A5 = {
  oferta: "Oferta M̄/P",
  demanda: "Demanda L = kY − hi",
  ejeI: "i",
  ejeM: "M/P",
  ingreso: "Ingreso Y",
  cruce: "i₁",
  precios: "Suben los precios P",
  pared: "Arrastra la pared",
};

/* ─── H4 · Mueve la curva, mira la tasa (5 de 7; 2 criterios) ─── */
export const PARTIDA_H4 = 5;
export const H4 = { revelar: "Revelar", siguiente: "Siguiente suceso", terminar: "Terminar", oferta: "Oferta", demanda: "Demanda", tasaSube: "La tasa sube", tasaBaja: "La tasa baja" };
const suceso = (id, texto, curva, direccion, retroCurva, retroDireccion) => ({
  id, texto, curva, direccion, tasa: (curva === "oferta") === (direccion === "derecha") ? "baja" : "sube",
  retroCurva, retroDireccion, subtemas: ["pm-mercado-dinero"],
});
export const BANCO_H4 = [
  suceso("emite", "El BanRep emite más pesos.", "oferta", "derecha", "Emitir cambia cuánto dinero hay: la oferta.", "Más dinero: la pared va a la derecha."),
  suceso("vende-tes", "El BanRep vende TES.", "oferta", "izquierda", "Vender TES retira pesos: cambia la oferta.", "Retira dinero: la pared va a la izquierda."),
  suceso("sube-ingreso", "Sube el ingreso de la economía.", "demanda", "derecha", "El ingreso cambia cuánto dinero quiere la gente.", "Más ingreso, más demanda de dinero: a la derecha."),
  suceso("cae-ingreso", "Cae el ingreso de la economía.", "demanda", "izquierda", "El ingreso mueve la demanda, no la oferta.", "Menos ingreso, menos dinero deseado: a la izquierda."),
  suceso("suben-precios", "Suben los precios y el BanRep no emite.", "oferta", "izquierda", "Lo que cambia es el dinero real, M̄/P: la oferta.", "Precios más altos: menos dinero real."),
  suceso("compra-dolares", "El BanRep compra dólares.", "oferta", "derecha", "Comprar dólares emite pesos: cambia la oferta.", "Entran pesos: la pared a la derecha."),
  suceso("presta", "El BanRep le presta liquidez a los bancos.", "oferta", "derecha", "Prestar a los bancos es emitir: la oferta.", "Más liquidez: a la derecha."),
];

/* ─── A6 · Tres palancas ─── */
export const PALANCAS = [
  { id: "tasa", nombre: "Tasa de intervención", proceso: "creación primaria", posiciones: { sube: "Sube", igual: "Igual", baja: "Baja" } },
  { id: "tes", nombre: "OMA (TES)", proceso: "creación primaria", posiciones: { sube: "Vende", igual: "Igual", baja: "Compra" } },
  { id: "encaje", nombre: "Encaje", proceso: "creación secundaria", posiciones: { sube: "Sube", igual: "Igual", baja: "Baja" } },
];
/* «sube» en las tres es contraccionista (tasa ↑, vende TES, encaje ↑); «baja», expansiva. */
export const ORDEN_POSICIONES = ["sube", "igual", "baja"];
export const A6 = {
  caras: { naturaleza: "Naturaleza", objetivos: "Objetivos" },
  precios: "Precios",
  crecimiento: "Crecimiento",
  expansiva: "Expansiva",
  contraccionista: "Contraccionista",
  neutra: "Sin cambio",
  aguja: "DA",
  proceso: "Toca a la",
  impactos: [
    { id: "credito", nombre: "Crédito", objeto: "cajero" },
    { id: "inversion", nombre: "Inversión", objeto: "fabrica" },
    { id: "consumo", nombre: "Consumo", objeto: "bolsa-mercado" },
    { id: "ahorro", nombre: "Ahorro", objeto: "alcancia" },
    { id: "deuda", nombre: "Deuda pública", objeto: "edificio-gobierno" },
    { id: "capitales", nombre: "Capitales", objeto: "avion-carga" },
    { id: "costos", nombre: "Costos financieros", objeto: "recibo" },
    { id: "vivienda", nombre: "Vivienda", objeto: "escalera" },
    { id: "real", nombre: "Sector real", objeto: "engranajes" },
  ],
};

/* ─── H6 · El dominó de la tasa (2 cadenas de 3) ─── */
export const PARTIDA_H6 = 2;
export const H6 = { empujar: "Empujar", siguiente: "Siguiente cadena", terminar: "Terminar" };
const cadena = (id, nombre, subtemas, fichas) => ({
  id, nombre, subtemas, fichas: fichas.map(([texto, retro], k) => ({ id: `${id}${k + 1}`, orden: k, texto, retro })),
});
export const BANCO_H6 = [
  cadena("a", "Baja la tasa", ["pm-impactos", "pm-apertura"], [
    ["La Junta baja la tasa de intervención", "Todo empieza en la decisión de la Junta."],
    ["Los bancos abaratan sus créditos", "Primero cambia el precio del crédito."],
    ["Familias y empresas piden más crédito", "Con crédito barato, se pide más."],
    ["Suben la inversión y el consumo", "El crédito se gasta en invertir y consumir."],
    ["Sube la demanda agregada", "Más inversión y consumo suman a la DA."],
    ["Sube la producción", "Con más demanda, se produce más."],
  ]),
  cadena("b", "Sube el encaje", ["pm-instrumentos", "pm-creacion-secundaria"], [
    ["El BanRep sube el encaje", "Arranca con la decisión del BanRep."],
    ["Los bancos congelan más de cada depósito", "El encaje es lo que se congela."],
    ["Prestan menos", "Lo congelado no se presta."],
    ["Se multiplica menos dinero", "Menos préstamos, cascada más corta."],
    ["Baja la demanda agregada", "Menos dinero y crédito: menos demanda."],
  ]),
  cadena("c", "Compra TES", ["pm-instrumentos", "pm-medidas"], [
    ["El BanRep compra TES", "La operación de mercado abierto va primero."],
    ["Entrega pesos nuevos", "Compra pagando con pesos nuevos."],
    ["Sube la base monetaria", "Esos pesos son base monetaria."],
    ["Hay más liquidez y baja la tasa", "Más dinero, tasa más baja."],
    ["Sube la inversión", "Tasa más baja, más inversión."],
  ]),
];

/* ─── A7 · El termostato (lectura aproximada del gráfico del BanRep, d. 43) ─── */
export const A7 = {
  subir: "Subir el aire",
  banda: "Meta 2 %–4 %",
  inflacion: "Inflación",
  tasa: "Tasa de intervención",
  anio: "Año",
  fuente: "Lectura aproximada del gráfico del Banco de la República",
  rezago: "Rezago",
};
/* Los puntos que da Gen (d. 43), tal cual. */
export const PUNTOS_A7 = {
  inflacion: { 2016: 9, 2020: 2, 2023: 13, 2026: 6 },
  tasa: { 2017: 4.5, 2020: 1.75, 2021: 1.75, 2023: 13.25, 2025: 9.25, 2026: 12 },
};
/*
 * Los años sin dato se leen en línea recta entre los puntos de Gen y se
 * redondean a medio punto (construccion-t4.md, decisión 4). Antes del primer
 * punto de una serie no hay lectura (null): la tasa empieza en 2017.
 */
const medioPunto = (x) => Math.round(x * 2) / 2;
function leer(puntos, anio) {
  if (puntos[anio] != null) return puntos[anio];
  const anios = Object.keys(puntos).map(Number).sort((a, b) => a - b);
  const antes = anios.filter((a) => a < anio).pop();
  const despues = anios.find((a) => a > anio);
  if (antes == null || despues == null) return null;
  const f = (anio - antes) / (despues - antes);
  return medioPunto(puntos[antes] + f * (puntos[despues] - puntos[antes]));
}
export const SERIE_A7 = Array.from({ length: 11 }, (_, k) => 2016 + k).map((anio) => ({
  anio, inflacion: leer(PUNTOS_A7.inflacion, anio), tasa: leer(PUNTOS_A7.tasa, anio),
}));

/* ─── H5 · La Junta decide (3 rondas, orden aleatorio) ─── */
export const H5 = {
  decidir: "Decidir",
  siguiente: "Siguiente ronda",
  terminar: "Terminar",
  aviso: "Casos de práctica, no decisiones reales de la Junta.",
  lectura: "Lectura de la ronda",
  empezar: "Empezar",
};
export const RONDAS_H5 = [
  { id: "r1", lectura: "Inflación de 9 %, muy por encima de la meta.", inflacion: 9, correctas: { tasa: "sube", tes: "sube", encaje: "sube" },
    retro: { tasa: "Para enfriar los precios, la tasa sube.", tes: "Vender TES retira pesos: enfría.", encaje: "Subir el encaje frena el crédito." } },
  { id: "r2", lectura: "Inflación de 1,5 % y la economía frenada.", inflacion: 1.5, correctas: { tasa: "baja", tes: "baja", encaje: "baja" },
    retro: { tasa: "Con precios bajos y economía frenada, la tasa baja.", tes: "Comprar TES inyecta pesos.", encaje: "Bajar el encaje libera crédito." } },
  { id: "r3", lectura: "Inflación de 3 %, dentro de la meta, economía estable.", inflacion: 3, correctas: { tasa: "igual", tes: "igual", encaje: "igual" },
    retro: { tasa: "En la meta y estable: mantener.", tes: "Sin razón para inyectar ni retirar.", encaje: "Nada que corregir: el encaje se mantiene." } },
].map((r) => ({ ...r, subtemas: ["pm-medidas", "pm-instrumentos", "pm-caso-inflacion-tasa"] }));

/* ─── Consignas de las Hacer (≤ 12 palabras) ─── */
export const CONSIGNAS = {
  "pm26-h1-entra-sale": "Pon cada flecha: ¿sube, baja o queda igual?",
  "pm26-h2-cascada-meta": "Mueve el encaje hasta que el dinero total llegue a la meta.",
  "pm26-h3-cajas": "Arrastra cada cosa al primer agregado donde entra.",
  "pm26-h4-mueve-tasa": "Mueve la curva que cambia, hacia donde crees.",
  "pm26-h6-domino": "Ordena las fichas para que caigan en orden.",
  "pm26-h5-junta": "Pon las tres palancas como lo haría la Junta.",
};
