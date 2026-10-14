/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA — «LAS TALLAS DEL DINERO» (encargo de Erwin).
 *
 * La pieza que mide el dinero: la escalera de liquidez (base monetaria, M1,
 * M2 y M3), el criterio que la ordena (la liquidez, no el tamaño) y qué mueve
 * cada instrumento (los TES, la base; el encaje, cuánto se multiplica; la
 * tasa, cuánto crédito se pide). Y dos juegos atados a ella.
 *
 * Archivo nuevo a propósito: la Célula B construye otra pieza del mismo tema
 * al mismo tiempo, y politicaMonetaria.js no se toca. El molde es el de ese
 * archivo:
 *   · la pieza de Aprender: { id, titulo, nombres, pasos, pregunta, respuesta }
 *   · los juegos: el banco de QUIEN_DECIDE (categorías, ítems con respuesta,
 *     retro con ✅/❌), que pinta PrimeraClasificacion. Cada ítem trae su
 *     devolución { ok, mal }, y `retro` elige la que toca.
 *
 * EL TEXTO es de Near, tal cual, con el PASA de Mello, que verifica las
 * definiciones contra el Banco de la República (ficha metodológica de los
 * agregados monetarios). Lo que no viene de la ficha va marcado
 * [ESCRITO POR CLAUDE, NO POR LA FICHA], como en politicaMonetaria.js.
 *
 * Versión 2 de Near, con las cinco correcciones obligatorias del PASA de
 * Mello. M2 y M3 van separados (la ficha de Erwin los juntaba). La cuenta de
 * ahorros va en M2 por liquidez, con la razón de la ficha del Banco: está un
 * poco menos disponible que una cuenta corriente, a cambio de intereses.
 *
 * LAS CIFRAS: ninguna. Ningún saldo de M1 ni de M2, así que no hace falta el
 * rótulo «Escenario simulado»; la prueba de cifras lo vigila igual.
 *
 * COHERENCIA CON LO PUBLICADO: en QUIEN_DECIDE, «Emitir bonos de deuda pública
 * (TES)» es del gobierno. El Banco no emite TES: los compra o los vende. La
 * pieza y el juego 2 lo dicen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { DATOS_VERIFICADOS, ROTULO_SIMULADO } from "./politicaMonetaria.js";

/* La devolución de los dos juegos: la de cada ítem, según acierte o no. */
const retroDelItem = (item, elegida) => (elegida === item.respuesta ? item.retro.ok : item.retro.mal);

/* ═══════════════════════════ APRENDER (cero FP) ═══════════════════════════ */

export const APRENDER_TALLAS = {
  id: "las-tallas-del-dinero",
  titulo: "Las tallas del dinero",
  nombres: [
    { termino: "Base monetaria", definicion: "El dinero que emite el Banco de la República. Es el efectivo en manos del público más la reserva de los bancos." },
    { termino: "Reserva bancaria", definicion: "Los billetes que los bancos tienen en su caja y lo que tienen depositado en el Banco de la República." },
    // Coincide con la definición de «Encaje bancario» ya publicada en el tema: la pieza «Los Cuatro Instrumentos»,
    // y casi palabra por palabra la del Memorama del Banco Central (cotejo de Mello)
    { termino: "Encaje", definicion: "La parte de los depósitos que los bancos deben guardar y no pueden prestar." },
    { termino: "M1", definicion: "El efectivo del público más las cuentas corrientes. Es la plata más lista para pagar." },
    { termino: "M2", definicion: "M1 más las cuentas de ahorro y los CDT. El Banco de la República llama cuasidineros a esos ahorros y CDT." },
    { termino: "M3", definicion: "M2 más los bonos que emiten los bancos y otros depósitos." },
    { termino: "Liquidez", definicion: "Qué tan rápido una forma de dinero se puede volver un pago." },
  ],
  pasos: [
    {
      resaltar: ["banco-republica", "base"],
      texto: "Empiece por abajo. El Banco de la República emite la base monetaria: los billetes y monedas, y la plata que los bancos guardan allá.",
    },
    {
      resaltar: ["persona", "m1"],
      texto: "Ahora mire su bolsillo. Los billetes del almuerzo y la cuenta corriente de la tienda de la esquina sirven para pagar ya. Eso es M1.",
    },
    {
      resaltar: ["persona", "m2"],
      // [ESCRITO POR CLAUDE, NO POR LA FICHA]: «tiene que esperar a que venza»
      texto: "La abuela tiene un CDT a seis meses. Es plata suya, pero no la puede usar hoy para pagar el mercado: tiene que esperar a que venza. Por eso no está en M1. Está en M2, junto con las cuentas de ahorro.",
    },
    {
      resaltar: ["m3", "bancos"],
      texto: "Más arriba está M3: suma los bonos que emiten los bancos y otros depósitos. El orden de la escalera no lo da el tamaño, sino la liquidez: qué tan rápido la plata se vuelve un pago.",
    },
    {
      resaltar: ["tes", "banco-republica", "base"],
      texto: "Cuando el Banco de la República compra TES, los paga con pesos nuevos: crece la base. Son las mismas operaciones de mercado abierto que usted vio en «Los Cuatro Instrumentos»: sirven para que la tasa del mercado se quede donde la Junta dijo. Ojo: el Banco no emite los TES. Los emite el Gobierno, y el Banco los compra o los vende.",
    },
    {
      resaltar: ["encaje", "bancos", "tasa"],
      texto: "Con el encaje, el Banco decide cuánto deben guardar los bancos de cada depósito. Eso cambia cuánto se multiplica la base en M1 y M2. Con la tasa, cambia lo que cuesta un préstamo, y eso mueve cuánto crédito se pide.",
    },
  ],
  pregunta: "¿Cuál agregado crea directamente el Banco de la República, y cuál resulta de lo que hacen los bancos?",
  // Depósitos que nacen del crédito: Banrep, JDS-16276, puntos 13-14
  respuesta: "El Banco crea directamente la base monetaria: el efectivo y la reserva de los bancos. Los depósitos de M1, M2 y M3 nacen cuando los bancos prestan. Cada préstamo vuelve como un depósito, y una parte de ese depósito se presta otra vez. El encaje le pone límite a esa multiplicación.",
};

/* ═══════════════════════════ BLOQUE 1 · CIMIENTOS ═══════════════════════════ */

/* Juego 1 — ¿En qué talla va? Fácil · 10 FP · evaluativa. Castiga el CDT en M1. */
export const EN_QUE_TALLA_VA = {
  id: "en-que-talla-va",
  nombre: "¿En qué talla va?",
  // [ESCRITO POR CLAUDE, NO POR LA FICHA]: el subtema (Watari)
  subtema: "Agregados monetarios",
  porPartida: 8, // todos los ítems (Watari): el CDT sale siempre
  pregunta: "¿En qué talla va?",
  consigna: "Elija la talla más pequeña donde entra cada forma de dinero: M1, M2 o M3. Si va en M1, también está en M2 y en M3. Si la plata es de un banco y no del público, va en la reserva: está en la base, pero no en M1.",
  categorias: [
    { id: "reserva", nombre: "Reserva de los bancos (solo en la base)" },
    { id: "m1", nombre: "M1" },
    { id: "m2", nombre: "M2" },
    { id: "m3", nombre: "M3" },
  ],
  items: [
    {
      id: "billetes-almuerzo", texto: "Los billetes que usted lleva para el almuerzo.", respuesta: "m1",
      retro: { ok: "✅ Es efectivo en manos del público: sirve para pagar ya. Va en M1, y también hace parte de la base.", mal: "❌ Es efectivo en manos del público: entra desde M1. También hace parte de la base." },
    },
    {
      id: "corriente-tienda", texto: "La plata en la cuenta corriente de la tienda del barrio, con la que les paga a sus proveedores.", respuesta: "m1",
      retro: { ok: "✅ Las cuentas corrientes son M1: con esa plata se paga hoy.", mal: "❌ Una cuenta corriente entra desde M1: con ella se paga hoy." },
    },
    {
      id: "cdt-abuela", texto: "El CDT a 180 días que tiene la abuela en el banco.", respuesta: "m2",
      retro: { ok: "✅ Es plata de la abuela, pero no sirve para pagar hoy. Es un cuasidinero: va en M2.", mal: "❌ Es plata de la abuela, pero no sirve para pagar hoy: tiene que esperar a que el CDT venza. Por eso no está en M1. Va en M2." },
    },
    {
      id: "cdt-empresa", texto: "Un CDT a 90 días que una empresa abrió con la plata que le sobró del mes.", respuesta: "m2",
      retro: { ok: "✅ Un CDT es un cuasidinero: va en M2.", mal: "❌ La empresa no puede pagar con ese CDT hasta que venza. Por eso no es M1: es un cuasidinero y va en M2." },
    },
    {
      id: "ahorro-semestre", texto: "La cuenta de ahorros donde usted guarda la plata del semestre.", respuesta: "m2",
      retro: { ok: "✅ El ahorro está un poco menos disponible que una cuenta corriente, a cambio de intereses. Por eso el Banco de la República lo pone en M2.", mal: "❌ Usted la puede usar cuando quiera, pero está un poco menos disponible que una cuenta corriente, a cambio de intereses. Por eso va en M2, no en M1." },
    },
    // [ESCRITO POR CLAUDE, NO POR LA FICHA]: los ítems de la reserva y del bono
    {
      id: "caja-fuerte", texto: "Los billetes que un banco guarda en su caja fuerte.", respuesta: "reserva",
      retro: { ok: "✅ Son reserva del banco: están en la base, pero no en M1.", mal: "❌ Son billetes, pero no están en manos del público: son reserva del banco. Están en la base, no en M1." },
    },
    {
      id: "deposito-encaje", texto: "Lo que un banco tiene depositado en el Banco de la República para cumplir el encaje.", respuesta: "reserva",
      retro: { ok: "✅ Ese depósito es reserva bancaria: hace parte de la base.", mal: "❌ Ese depósito no es del público: es reserva del banco. Está en la base, no en M1." },
    },
    {
      id: "bono-banco", texto: "Un bono que emitió un banco y que compró una persona.", respuesta: "m3",
      retro: { ok: "✅ Los bonos de los bancos entran en M3.", mal: "❌ Los bonos que emiten los bancos no están en M1 ni en M2: entran en M3." },
    },
  ],
  retro: retroDelItem,
};

/* ═══════════════════════════ BLOQUE 2 · APLICACIÓN ═══════════════════════════ */

/* Juego 2 — ¿Qué tocó el Banco? Medio · 25 FP · evaluativa. */
export const QUE_TOCO_EL_BANCO = {
  id: "que-toco-el-banco",
  nombre: "¿Qué tocó el Banco?",
  // [ESCRITO POR CLAUDE, NO POR LA FICHA]: el subtema y el rótulo del enunciado (Watari)
  subtema: "Agregados monetarios",
  porPartida: 8, // todos los ítems (Watari)
  pregunta: "¿Dónde pega primero?",
  consigna: "Para cada decisión, diga dónde pega primero en la escalera. Ojo: no todas las decisiones son del Banco de la República.",
  categorias: [
    { id: "base", nombre: "La base" },
    { id: "multiplica", nombre: "Cuánto se multiplica" },
    { id: "credito", nombre: "Cuánto crédito se pide" },
    { id: "no-banco", nombre: "No lo decide el Banco de la República" },
  ],
  items: [
    {
      id: "compra-tes", texto: "El Banco de la República les compra TES a los bancos.", respuesta: "base",
      retro: { ok: "✅ Al comprar TES, el Banco paga con pesos que antes no existían: crece la base.", mal: "❌ Comprar TES pega primero en la base: el Banco paga con pesos nuevos." },
    },
    {
      id: "vende-tes", texto: "El Banco de la República vende TES de los que tiene.", respuesta: "base",
      retro: { ok: "✅ Al vender TES, el Banco recibe pesos y los saca de circulación: la base se achica.", mal: "❌ Vender TES pega primero en la base: el Banco recoge pesos." },
    },
    {
      id: "gobierno-emite-tes", texto: "El Gobierno emite TES nuevos para conseguir plata.", respuesta: "no-banco",
      retro: { ok: "✅ Emitir TES es del Gobierno, no del Banco. El Banco solo los compra o los vende.", mal: "❌ Ojo: emitir no es comprar. Los TES los emite el Gobierno, no el Banco de la República." },
    },
    {
      id: "sube-encaje", texto: "El Banco de la República sube el encaje.", respuesta: "multiplica",
      retro: { ok: "✅ Los bancos deben guardar más de cada depósito. Pueden prestar menos, y la base se multiplica menos.", mal: "❌ El encaje pega en cuánto se multiplica la base: cambia cuánto pueden prestar los bancos de cada depósito." },
    },
    {
      id: "baja-encaje", texto: "El Banco de la República baja el encaje.", respuesta: "multiplica",
      retro: { ok: "✅ Los bancos guardan menos de cada depósito. Pueden prestar más, y la base se multiplica más.", mal: "❌ El encaje pega en cuánto se multiplica la base, no en la base misma." },
    },
    {
      id: "sube-tasa", texto: "El Banco de la República sube su tasa de interés.", respuesta: "credito",
      retro: { ok: "✅ Los préstamos salen más caros, así que se pide menos crédito.", mal: "❌ La tasa pega primero en lo que cuesta un préstamo, y con eso en cuánto crédito se pide." },
    },
    {
      id: "baja-tasa", texto: "El Banco de la República baja su tasa de interés.", respuesta: "credito",
      retro: { ok: "✅ Los préstamos salen más baratos, así que se pide más crédito.", mal: "❌ La tasa pega primero en lo que cuesta un préstamo, y con eso en cuánto crédito se pide." },
    },
    {
      id: "banco-requisitos", texto: "Un banco decide, por su lado, pedir más requisitos para prestar.", respuesta: "no-banco",
      retro: { ok: "✅ Esa es una decisión del banco, no del Banco de la República.", mal: "❌ Esa decisión la toma el banco, no el Banco de la República." },
    },
  ],
  retro: retroDelItem,
};
