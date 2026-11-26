/*
 * T4 · POLÍTICA MONETARIA — la oficina es la sala de la Junta Directiva del
 * Banco de la República (el equipo técnico que le prepara las decisiones); el
 * compañero es el Economista jefe (el hurón de corbata del elenco, el
 * Inversionista). Fuente: PyEM-PolMon-02-2026 (ficha 4).
 */
import { crearEscenario } from "./motor.js";

const PERSONA = "Eres el Economista jefe del equipo técnico de la Junta Directiva del Banco de la República. Eres un hurón de corbata, rápido y muy claro, que lo explica todo con la billetera, los bancos del barrio y el aire acondicionado.";
const OFICINA = "la sala del equipo técnico de la Junta Directiva del Banco de la República, donde se preparan los informes antes de cada reunión de la Junta";
const ROL = "economista junior del equipo técnico de la Junta del Banco de la República";
const TITULO = "Política monetaria";

const FUENTE = `- El dinero es el medio de intercambio que permite las transacciones. Formas: billetes y monedas (los emite solo el Banco de la República, BR); cuenta corriente con cheques; cuenta de ahorros con tarjeta débito; CDT (ahorro a plazo fijo con rentabilidad, p. ej. hasta 12 % EA a 720 días); la tarjeta de crédito NO es dinero propio: es un préstamo. Una moneda vale por la confianza (el bolso tejido con billetes de una moneda que perdió su valor).
- Creación PRIMARIA (emisión): el BR crea dinero cuando ADQUIERE activos (dólares —reservas internacionales—, préstamos a bancos, oro, TES) y entrega pesos a cambio: sube la base monetaria. Cuando VENDE activos o le pagan los préstamos, recibe pesos de vuelta: baja la base monetaria. Si un banco o persona simplemente guarda billetes, la base no cambia.
- Creación SECUNDARIA: los bancos captan depósitos y prestan; del depósito se resta el ENCAJE (la parte que el BR obliga a congelar en el BR y no se presta) y el resto se presta; ese crédito vuelve como depósito y se presta otra vez: $ → D − E = Cr → + $. Si sube el encaje, se presta menos y se crea menos dinero; si baja, se crea más. Con un depósito de 1.000 y encaje de 10 %: 900, 810, 729… hasta 1.000/encaje en total.
- Agregados: base monetaria BM = efectivo + reservas del sistema financiero (encaje), ligada a la creación primaria, aparte. M1 (medios de pago) = efectivo + cuentas corrientes. M2 = M1 + cuasidineros (ahorros, CDT, CDAT). M3 = M2 + otros depósitos a la vista y bonos. M1 ⊂ M2 ⊂ M3. Cifras a agosto de 2026 (miles de millones): BM 193.755; M1 231.697; M2 980.377; M3 1.031.096. De arriba hacia abajo, los depósitos son menos líquidos.
- Mercado de dinero: oferta real M̄/P vertical (la fija el BR, no depende de i); demanda L = kY − h·i (sube con el ingreso, baja con la tasa). La tasa de equilibrio iguala las dos. Si sube M̄ (o bajan los precios P) → la tasa baja; si baja M̄ o suben los precios → la tasa sube; si sube Y → la demanda de dinero sube → la tasa sube; si baja Y → la tasa baja.
- Naturaleza: administra, regula y controla la creación del dinero nacional, el sistema financiero y el crédito. Mercado: el de dinero nacional (COP). Objetivos: control de precios y crecimiento económico.
- Instrumentos: la tasa de interés de intervención (de referencia, REPO: a la que el BR presta liquidez a los bancos; señal para las demás tasas; toca la creación primaria); operaciones de mercado abierto, OMA (el BR compra o vende TES en el mercado secundario; creación primaria); encaje (creación secundaria).
- Medidas: EXPANSIVA (más dinero, tasa más baja): bajar la tasa, comprar TES, bajar el encaje. CONTRACCIONISTA (menos dinero, tasa más alta): subir la tasa, vender TES, subir el encaje. En la DA: Y = [1/(1 − c(1 − t))]·(Ā − b·i): si baja i, sube la inversión, sube la DA y la producción.
- Impactos: costo del crédito, rentabilidad esperada de la inversión, consumo y ahorro, crédito disponible, condiciones de la deuda pública, flujos de capital internacionales, sector real.
- El termostato: la meta de inflación del BR es una banda de 2 % a 4 % (la Junta fija la meta y la tasa). Si la inflación está por encima, sube la tasa (enfría); si está por debajo y la economía se frena, la baja; si está dentro, la puede mantener. Hay rezago: la inflación tarda meses en reaccionar. Datos de clase (lectura del gráfico del BR): inflación ~13,3 % en 2023 con tasa ~13,25 %; tasa 1,75 % en 2020–2021 con inflación ~1,5–2 %; inflación ~6 % en agosto de 2026. No uses otras cifras de Colombia.`;

const base = { persona: PERSONA, oficina: OFICINA, rol: ROL, fuenteTitulo: TITULO, fuente: FUENTE };

export const ESCENARIOS = [
  crearEscenario({
    ...base,
    id: "pm26-a1-billetera",
    decision: "Lee con qué pagó alguien y di de dónde sale ese dinero.",
    opciones: {
      emision: "Billetes y monedas: dinero que emitió el Banco de la República.",
      deposito: "Un depósito propio en un banco: cuenta corriente, de ahorros o CDT (cheque, tarjeta débito, transferencia).",
      credito: "Un préstamo: plata que el banco le presta (tarjeta de crédito, crédito de libre inversión); no es dinero propio.",
    },
    multiple: false,
    caso: "El expediente es una compra de una persona ficticia: qué compró, cuánto costó y con qué medio pagó (efectivo, cheque, débito, tarjeta de crédito, CDT que redimió), y su saldo antes y después.",
    rondas: {
      1: "Fácil: paga con billetes o con tarjeta débito.",
      2: "Media: paga con un cheque de su cuenta corriente, o redime un CDT para pagar.",
      3: "Difícil, con trampa: paga con tarjeta de crédito desde el mismo plástico del banco donde tiene sus ahorros (es préstamo, no depósito), o retira billetes del cajero con la débito (el dinero salió de su depósito).",
    },
    delata: { emision: "emisi[oó]n|emiti", deposito: "dep[oó]sito", credito: "pr[eé]stamo|cr[eé]dito" },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a2-ventanilla",
    decision: "Lee lo que pasó en la ventanilla del Banco de la República y di qué le pasa a la base monetaria.",
    opciones: {
      sube: "Sube: el BR compró un activo (dólares, oro, TES) o le prestó a un banco, y entregó pesos nuevos.",
      baja: "Baja: el BR vendió un activo o le pagaron un préstamo, y recibió pesos de vuelta.",
      igual: "No cambia: el BR no compró ni vendió nada; los pesos solo cambiaron de bolsillo dentro de la economía.",
    },
    multiple: false,
    caso: "El expediente es una operación concreta de un banco central ficticio o del BR en un día inventado: quién llegó a la ventanilla, qué entregó, qué recibió, y la base monetaria antes y ahora (si cambió).",
    rondas: {
      1: "Fácil: el BR compra dólares a un exportador, o vende TES a un banco.",
      2: "Media: un banco le paga al BR un préstamo de liquidez, o el BR compra oro a productores.",
      3: "Difícil, con trampa: una persona saca billetes de su cuenta en un banco comercial, o una empresa le paga a otra (la base no cambia, porque el BR no compró ni vendió nada). En este caso no pongas cifras de base que cambian.",
    },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a3-cascada",
    decision: "Lee lo que cambió en los bancos y di qué le pasa al dinero que crean prestando (creación secundaria).",
    opciones: {
      sube: "Se crea más dinero: los bancos pueden prestar una parte mayor de cada depósito.",
      baja: "Se crea menos dinero: los bancos tienen que dejar quieta una parte mayor de cada depósito.",
      igual: "No cambia: lo que pasó no mueve la parte que se presta de cada depósito.",
    },
    multiple: false,
    caso: "El expediente es lo que pasó con los bancos de un país ficticio: el encaje antes y ahora, un depósito de ejemplo y cuánto se prestó de él.",
    rondas: {
      1: "Fácil: el banco central baja o sube el encaje de forma clara (del 10 % al 5 %).",
      2: "Media: los mismos datos en cifras de préstamos encadenados (900, 810…) que se alargan o se acortan.",
      3: "Difícil, con trampa: el encaje queda igual pero cambian los nombres o la publicidad de los bancos, o la gente cambia ahorros de un banco a otro con el mismo encaje (no cambia).",
    },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a4-cajas",
    decision: "Lee dónde está guardada una plata y di en qué caja entra por primera vez: la base monetaria aparte, o la menor de las cajas M1, M2 y M3 que la contiene.",
    opciones: {
      bm: "Base monetaria: reservas de los bancos (encaje) congeladas en el BR; no están en M1.",
      m1: "M1: efectivo en manos del público y cuentas corrientes (lo que se gasta ya).",
      m2: "M2: cuasidineros (cuentas de ahorro, CDT, CDAT); entran en M2 pero no en M1.",
      m3: "M3: otros depósitos a la vista (convenios de pago, depósitos judiciales) y bonos del sistema financiero.",
    },
    multiple: false,
    caso: "El expediente es una persona, empresa o banco ficticio y dónde tiene una plata, con cuánto y qué tan rápido la puede gastar. No uses el efectivo de un banco como caso (es ambiguo).",
    rondas: {
      1: "Fácil: una cuenta corriente con chequera (M1) o un CDT a un año (M2).",
      2: "Media: una cuenta de ahorros que se usa con débito (M2, aunque se mueva rápido) o un depósito judicial (M3).",
      3: "Difícil, con trampa: el encaje que un banco tiene congelado en el BR (base monetaria, no M1), o un CDAT (M2, no M3).",
    },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a5-precio-dinero",
    decision: "Lee lo que cambió en el mercado de dinero y di qué le pasa a la tasa de interés de equilibrio.",
    opciones: {
      sube: "La tasa sube: hay menos dinero real frente a lo que la gente quiere tener (baja M̄, suben los precios o sube el ingreso).",
      baja: "La tasa baja: hay más dinero real frente a lo que la gente quiere tener (sube M̄, bajan los precios o baja el ingreso).",
      igual: "La tasa no cambia: no se movió ni la oferta real ni la demanda de dinero.",
    },
    multiple: false,
    caso: "El expediente es un país ficticio con su mercado de dinero: la cantidad de dinero que fijó el banco central, el nivel de precios y el ingreso, antes y ahora.",
    rondas: {
      1: "Fácil: el banco central aumenta o reduce la cantidad de dinero; lo demás igual.",
      2: "Media: sube el ingreso del país (la gente necesita más dinero para sus compras) con la oferta fija.",
      3: "Difícil, con trampa: el banco central no toca el dinero pero suben los precios un 20 % (la oferta real baja y la tasa sube), o suben a la vez el dinero y los precios en la misma proporción (igual).",
    },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a6-palancas",
    decision: "Lee las palancas que movió la Junta y di qué tipo de política monetaria es.",
    opciones: {
      expansiva: "Expansiva: más dinero o una tasa más baja (bajar la tasa de intervención, comprar TES, bajar el encaje).",
      contraccionista: "Contraccionista: menos dinero o una tasa más alta (subir la tasa de intervención, vender TES, subir el encaje).",
    },
    multiple: false,
    caso: "El expediente es el comunicado de la Junta de un banco central ficticio: tres palancas (tasa de intervención, OMA con TES, encaje) con su antes y ahora; las que se mueven, todas en la misma dirección.",
    rondas: {
      1: "Fácil: solo se mueve la tasa de intervención.",
      2: "Media: se mueven las OMA o el encaje y la tasa queda igual.",
      3: "Difícil, con trampa: el banco central VENDE TES y a la vez sube el encaje (contraccionista aunque «vender» suene a sacar algo), o compra TES y baja el encaje.",
    },
    delata: { expansiva: "expansiv", contraccionista: "contraccion|contractiv" },
  }),
  crearEscenario({
    ...base,
    id: "pm26-a7-termostato",
    decision: "Lee el informe de inflación y di qué debería hacer la Junta con la tasa de interés en esta reunión.",
    opciones: {
      subir: "Subir la tasa: la inflación está por encima de la banda de 2 % a 4 % (hay que enfriar).",
      bajar: "Bajar la tasa: la inflación está por debajo de la banda o muy baja y la economía se frena.",
      mantener: "Mantener la tasa: la inflación está dentro de la banda, o ya se subió y hay que esperar el rezago.",
    },
    multiple: false,
    caso: "El expediente es el informe de un mes inventado de un país ficticio con meta de 2 % a 4 %: la inflación de los últimos meses, la tasa actual y el crecimiento.",
    rondas: {
      1: "Fácil: inflación muy por encima de la banda (9 %) o muy por debajo (1 %) con la economía frenada.",
      2: "Media: inflación dentro de la banda (3 %) y estable: mantener.",
      3: "Difícil, con trampa: la Junta ya subió mucho la tasa hace dos meses y la inflación apenas empieza a bajar (mantener por el rezago), o la inflación baja pero sigue por encima de 4 %.",
    },
  }),
];
