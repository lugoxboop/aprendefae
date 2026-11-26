/*
 * T5 · POLÍTICA CAMBIARIA — la oficina es la mesa de cambio de una
 * comercializadora en el puerto; la compañera es la Exportadora de flores (la
 * hámster de gorra del elenco), que vive de vender en dólares. Fuente:
 * PyEM-PolCam-02-2026 (ficha 5).
 */
import { crearEscenario } from "./motor.js";

const PERSONA = "Eres la jefa de la mesa de cambio de Puerto Abierto, una comercializadora que exporta flores y café. Eres una hámster de gorra, curtida en el puerto, que mira el precio del dólar todas las mañanas.";
const OFICINA = "la mesa de cambio de Puerto Abierto, en el puerto, frente a los contenedores, donde se decide cuándo vender los dólares de las exportaciones y cuándo comprar los de las importaciones";
const ROL = "analista junior de la mesa de cambio de Puerto Abierto";
const TITULO = "Política cambiaria";

const FUENTE = `- Mercado cambiario: donde se compran y venden divisas; nace de las transacciones internacionales. Tipo de cambio (tc): pesos por un dólar. Lo fijan la oferta de divisas (Od: traen dólares los exportadores, la inversión extranjera, los créditos externos, las remesas) y la demanda (Dd: piden dólares los importadores, quien paga deuda externa, el viajero, quien saca capital). Si Od va a la derecha, el tc baja; si Od va a la izquierda, sube; si Dd va a la derecha, sube; si Dd va a la izquierda, baja.
- Sube el tc (de COP 4.000 a 4.500): el peso se deprecia (devalúa) y el dólar se aprecia (revalúa). Baja el tc (de 4.000 a 3.800): el peso se aprecia (revalúa) y el dólar se deprecia. Al exportador le sirve que suba (recibe más pesos por cada dólar); al importador, que baje. Ejemplo: 16-abr-2025, dólar a COP 4.329,90.
- Nominal y real: el nominal es el precio en pesos corrientes; el real mide el poder de compra y la competitividad, ajustando por la inflación relativa. Atajo: Δtcr ≈ (inflación externa − inflación nacional) + variación del nominal. Positivo: devaluación real (el exportador gana competitividad); cero: equilibrio; negativo: revaluación real (la pierde). ITCR = (1 + Δtcn)(1 + inflación externa)/(1 + inflación nacional): > 1 devaluación real, = 1 equilibrio, < 1 revaluación real. Ejemplos: (1,5 % − 5 %) + 6 % = 2,5 %; (1,5 % − 5 %) + 2 % = −1,5 %.
- Caso Tropical Fruits (banano): costo COP 2.127.250 la tonelada, tc 3.175, precio USD 670. Con inflación de 5 % aquí, 1,5 % en EE. UU. y el nominal subiendo 1,5 %: necesita ≈ USD 693 y el mercado paga ≈ USD 680: pierde competitividad (ITCR 0,981). Si el nominal sube 5 %: necesita USD 670 < 680: gana (ITCR 1,015). Precio en dólares = precio en pesos / tc.
- Balanza de pagos: registro de todas las transacciones con el exterior. Cuenta corriente: balanza comercial (bienes), servicios (turismo, fletes), transferencias (remesas). Cuenta de capital: inversión extranjera directa (IED, se queda en lo productivo y asume el riesgo), inversión de portafolio (especulativa, «golondrina», entra y sale buscando rendimiento) y endeudamiento externo. BP = X(tc) − M(tc, Y) + F(i); determina las reservas internacionales.
- Flujos de capital: van hacia la tasa de interés más alta, huyen del riesgo y se corrigen por el tipo de cambio. Rendimiento afuera medido en pesos ≈ tasa externa + devaluación del peso. Caso ahorro: COP 600 millones, tasa 9 % aquí y 4 % en EE. UU.: sin más, conviene Colombia; si el peso se revalúa 15,61 %, sigue Colombia; si se devalúa 12 %, conviene EE. UU. (≈ 16,5 %). Caso crédito: tasa 15 % aquí y 8 % afuera; si el peso se devalúa 12 %, el crédito afuera cuesta ≈ 21 % y conviene Colombia.
- Política cambiaria: la autoridad es el Banco de la República. Objetivos: estabilidad cambiaria y equilibrio de la balanza de pagos. Instrumentos: manejo de la tasa de cambio (el BR compra divisas: acumula reservas y presiona el dólar al alza; vende: desacumula y lo presiona a la baja), regímenes cambiarios, controles cambiarios (autorizaciones, cuotas, prohibiciones) y tipos de cambio diferenciales.
- Regímenes: tipo de cambio FIJO (una sola paridad que el banco central defiende; Bolivia, 6,96 Bs por dólar); BANDA cambiaria (el tc flota entre un techo y un piso que el banco central defiende; Colombia 1990–1999); devaluación GOTA A GOTA (crawling peg: se anuncia una devaluación anual, p. ej. 6,96 %, y se aplica en mini devaluaciones continuas); FLEXIBLE: lo define el mercado; flotación LIMPIA (solo mercado) o SUCIA (mercado e intervención del banco central; Colombia desde 1999).
- Impactos: competitividad de exportaciones e importaciones, rentabilidad de capitales, costos de insumos importados, costo de la deuda externa, inflación, dólar como refugio, expectativas. No inventes cifras de Colombia distintas de estas.`;

const base = { persona: PERSONA, oficina: OFICINA, rol: ROL, fuenteTitulo: TITULO, fuente: FUENTE };

export const ESCENARIOS = [
  crearEscenario({
    ...base,
    id: "pc26-a1-balanza",
    decision: "Lee cómo se movió el precio del dólar y di qué le pasó al peso.",
    opciones: {
      deprecia: "El peso se deprecia (devalúa): hay que dar más pesos por el mismo dólar; el dólar se aprecia.",
      aprecia: "El peso se aprecia (revalúa): se dan menos pesos por el mismo dólar; el dólar se deprecia.",
    },
    multiple: false,
    caso: "El expediente es una mañana en la mesa de cambio de un día inventado: el precio del dólar al abrir y al cerrar (antes y ahora), una noticia que lo movió y cuántos pesos recibe la exportadora por cada dólar.",
    rondas: {
      1: "Fácil: el tc sube o baja varios cientos de pesos.",
      2: "Media: la cifra va en otro sentido (cuántos dólares compra un millón de pesos): si con un millón se compran menos dólares, el peso se depreció.",
      3: "Difícil, con trampa: la noticia dice que «el dólar se fortaleció» o «se debilitó»; hay que traducirla al peso (el dólar se aprecia = el peso se deprecia).",
    },
    delata: { deprecia: "deprecia|devalu", aprecia: "aprecia|revalu" },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a2-subasta",
    decision: "Lee lo que pasó en el mercado de dólares y di qué curva se mueve y hacia dónde.",
    opciones: {
      ofertaDerecha: "La oferta de dólares va a la derecha: llegan más dólares (exportaciones, inversión, remesas, créditos); el tc baja.",
      ofertaIzquierda: "La oferta de dólares va a la izquierda: llegan menos dólares; el tc sube.",
      demandaDerecha: "La demanda de dólares va a la derecha: se piden más dólares (importaciones, pago de deuda externa, viajes, salida de capital); el tc sube.",
      demandaIzquierda: "La demanda de dólares va a la izquierda: se piden menos dólares; el tc baja.",
    },
    multiple: false,
    caso: "El expediente es lo que pasó en un país ficticio en un mes inventado: quién trajo o pidió dólares, cuántos, y el tc antes y ahora.",
    rondas: {
      1: "Fácil: llega una gran inversión extranjera, o los importadores compran muchos más celulares.",
      2: "Media: caen las exportaciones de café por una helada (la oferta va a la izquierda), o bajan los viajes al exterior (la demanda va a la izquierda).",
      3: "Difícil, con trampa: llegan más remesas de los migrantes (oferta, no demanda, aunque sean familias), o las empresas pagan su deuda externa (demanda, aunque no compren bienes).",
    },
    delata: { ofertaDerecha: "oferta", ofertaIzquierda: "oferta", demandaDerecha: "demanda", demandaIzquierda: "demanda" },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a3-nominal-real",
    decision: "Lee la inflación de aquí, la de afuera y cómo se movió el dólar nominal, y di qué pasó con el cambio real.",
    opciones: {
      devaluacionReal: "Devaluación real: (inflación externa − inflación nacional) + variación del nominal es positiva; ITCR > 1.",
      equilibrio: "Equilibrio: la suma da cero; el nominal compensó justo la diferencia de inflaciones; ITCR = 1.",
      revaluacionReal: "Revaluación real: la suma es negativa; ITCR < 1.",
    },
    multiple: false,
    caso: "El expediente es el informe anual de un país ficticio: inflación nacional, inflación del socio comercial y variación del tipo de cambio nominal, en porcentajes.",
    rondas: {
      1: "Fácil: inflaciones iguales y el nominal sube o baja claramente.",
      2: "Media: inflación nacional mayor que la externa y el nominal sube más que la diferencia (devaluación real) o menos (revaluación real).",
      3: "Difícil, con trampa: el nominal sube (parece devaluación) pero la inflación de aquí lo supera y el resultado es revaluación real; o el nominal compensa exactamente la diferencia (equilibrio).",
    },
    delata: { devaluacionReal: "devaluaci[oó]n real", equilibrio: "equilibrio", revaluacionReal: "revaluaci[oó]n real" },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a4-banano",
    decision: "Lee el caso de un exportador y di si su producto gana o pierde competitividad en el mercado de afuera.",
    opciones: {
      gana: "Gana competitividad: el precio en dólares que necesita queda igual o por debajo del precio que ya rige afuera.",
      pierde: "Pierde competitividad: necesita cobrar en dólares más de lo que paga el mercado de afuera.",
    },
    multiple: false,
    caso: "El expediente es un exportador ficticio (banano, flores, café, calzado): su costo en pesos, el tc, la inflación de aquí y la de afuera, y el precio que paga el mercado externo, con antes y ahora. Precio en dólares = precio en pesos / tc.",
    rondas: {
      1: "Fácil: el costo en pesos no cambia y el dólar sube mucho (gana) o baja mucho (pierde).",
      2: "Media: la inflación de aquí sube el costo y el dólar sube menos que eso (pierde), como Tropical Fruits con +1,5 %.",
      3: "Difícil, con trampa: el dólar sube y parece que gana, pero la inflación de aquí sube más el costo; o el dólar casi no se mueve pero la inflación de afuera sube el precio del mercado (gana).",
    },
    delata: { gana: "gana competitiv", pierde: "pierde competitiv" },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a5-tuberias",
    decision: "Lee una transacción con el exterior y di por qué tubería de la balanza de pagos pasa.",
    opciones: {
      comercial: "Cuenta corriente, balanza comercial: compra o venta de bienes (flores, carros, celulares).",
      servicios: "Cuenta corriente, servicios: turismo, fletes, software, consultoría.",
      transferencias: "Cuenta corriente, transferencias: plata que se manda sin contraprestación (remesas de migrantes).",
      ied: "Cuenta de capital, inversión extranjera directa: alguien de afuera monta o compra una empresa productiva y se queda.",
      portafolio: "Cuenta de capital, inversión de portafolio (golondrina): compra de acciones o bonos que entra y sale buscando rendimiento.",
      endeudamiento: "Cuenta de capital, endeudamiento externo: una empresa o el Gobierno pide prestado afuera.",
    },
    multiple: false,
    caso: "El expediente es una transacción de un país ficticio con el exterior: quién manda o recibe la plata, a cambio de qué, cuánto, y el saldo de reservas antes y ahora.",
    rondas: {
      1: "Fácil: se exportan flores, o llega una remesa.",
      2: "Media: turistas extranjeros pagan hoteles (servicios), o una empresa extranjera construye una planta (IED).",
      3: "Difícil, con trampa: un fondo extranjero compra TES por tres meses (portafolio, no IED), o una empresa trae dólares prestados de un banco de afuera para importar maquinaria (endeudamiento, no comercial).",
    },
    delata: { comercial: "balanza comercial", servicios: "\\bservicios\\b", transferencias: "transferencia|remesa", ied: "inversi[oó]n extranjera directa|\\bIED\\b", portafolio: "portafolio|golondrina", endeudamiento: "endeudamiento" },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a6-imanes",
    decision: "Lee las tasas, el riesgo y lo que se espera del dólar, y di dónde conviene poner (o pedir) la plata.",
    opciones: {
      colombia: "En Colombia: con la corrección del tipo de cambio, rinde más ahorrar aquí (o cuesta menos endeudarse aquí).",
      exterior: "Afuera: con la corrección del tipo de cambio, rinde más ahorrar afuera (o cuesta menos endeudarse afuera).",
    },
    multiple: false,
    caso: "El expediente es una empresa o ahorrador ficticio con una plata en pesos: la tasa aquí y afuera, el tc al empezar y lo que se espera al final del año (devaluación o revaluación del peso), y si quiere ahorrar o pedir prestado. Una sola respuesta clara.",
    rondas: {
      1: "Fácil: la tasa de aquí es mucho mayor que la de afuera y el dólar no se mueve.",
      2: "Media: un riesgo grande en uno de los dos países (el capital huye del riesgo).",
      3: "Difícil, con trampa: la tasa de aquí es mayor, pero se espera una devaluación del peso que la supera, como en el caso del ahorro con devaluación de 12 % (conviene afuera); o un crédito afuera más barato que con devaluación termina costando más (conviene aquí).",
    },
  }),
  crearEscenario({
    ...base,
    id: "pc26-a7-correa",
    decision: "Lee cómo se movió el dólar durante el año y qué hizo el banco central, y di qué régimen cambiario tiene el país.",
    opciones: {
      fijo: "Tipo de cambio fijo: una sola paridad que el banco central defiende (Bolivia, 6,96).",
      banda: "Banda cambiaria: el tc flota entre un techo y un piso; el banco central interviene en los bordes.",
      gotaAGota: "Devaluación gota a gota: se anuncia una devaluación anual y se aplica en mini devaluaciones continuas.",
      flexibleLimpia: "Flexible, flotación limpia: solo el mercado define el tc; el banco central no interviene.",
      flexibleSucia: "Flexible, flotación sucia: el mercado define el tc, pero el banco central compra o vende dólares a veces.",
    },
    multiple: false,
    caso: "El expediente es el año de un país ficticio: el tc en enero, a mitad de año y en diciembre, y lo que hizo el banco central (anunció, defendió, compró o vendió dólares, o nada).",
    rondas: {
      1: "Fácil: el tc no se mueve en todo el año y el banco central defiende la paridad (fijo), o sube el mismo poquito cada semana como estaba anunciado (gota a gota).",
      2: "Media: el tc sube y baja dentro de unos límites anunciados y el banco central vende dólares cuando toca el techo (banda).",
      3: "Difícil, con trampa: el tc se mueve libre todo el año, pero el banco central compró reservas dos veces en el año (flotación sucia, no limpia).",
    },
    delata: { fijo: "\\bfijo\\b", banda: "\\bbanda\\b", gotaAGota: "gota a gota|crawling", flexibleLimpia: "flotaci[oó]n limpia", flexibleSucia: "flotaci[oó]n sucia" },
  }),
];
