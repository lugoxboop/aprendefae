/*
 * T1 · DEMANDA AGREGADA — la oficina es BRÚJULA, una consultora de la plaza
 * que les explica la economía a los empresarios (el caso del «empresario
 * confundido» de la diapositiva 2). El compañero es el Consultor sénior (el
 * perro de corbatín del elenco). Fuente: 4-PyEM-DA-02-2026 (ficha 1).
 */
import { crearEscenario } from "./motor.js";

const PERSONA = "Eres el Consultor sénior de Brújula. Eres un perro de corbatín, paciente y con buen humor, que explica la economía con ejemplos de la plaza de mercado.";
const OFICINA = "Brújula, una consultora en la plaza de mercado que les explica la economía a empresarios que no estudiaron economía (como el empresario confundido que oye hablar de tasas, impuestos y dólar y no entiende)";
const ROL = "consultor junior de Brújula";
const TITULO = "Conceptos macroeconómicos fundamentales: la demanda agregada";

const FUENTE = `- Ley de la demanda (en un mercado): si sube el precio de un bien, baja la cantidad demandada; si baja, sube. Un cambio en el precio del propio bien es un movimiento SOBRE la curva de demanda; la curva no se mueve. Si cambia otra cosa distinta del precio de ese bien (la renta, los gustos), la curva entera se desplaza.
- Demanda agregada (DA): gasto total planeado en bienes y servicios finales. DA = C + I + G + (X − M). Consumo (C): gasto de los hogares. Inversión (I): gasto privado en bienes de capital e inventarios. Gasto público (G): compras del Gobierno. Exportaciones netas (XN = X − M): lo que se vende al exterior menos lo que se compra del exterior.
- Consumo: C = C̄ + c(Y + TR − T), con T = tY. C̄ es consumo autónomo (no depende de la renta: se da aunque la renta sea cero, con préstamos, venta de activos o subsidios). c es la propensión marginal a consumir (0 < c < 1): fracción de cada peso adicional de renta disponible que se consume; la propensión a ahorrar es s = 1 − c. Renta disponible = Y + TR − T. TR son transferencias del Gobierno a las familias (autónomas). t es la tasa de impuestos directos. Consumo inducido = c(Y + TR − T). En este modelo el consumo NO depende de la tasa de interés.
- Inversión: I = Ī − b·i. Ī es inversión autónoma (no depende de la tasa; recoge expectativas e incertidumbre). b es la elasticidad interés de la inversión (cuánto cae la inversión por cada punto que sube la tasa). i es la tasa de interés, el costo del crédito.
- Gasto público: G = Ḡ, autónomo; lo decide el Gobierno; puede gastar más que sus ingresos y endeudarse (déficit).
- Exportaciones netas: XN autónomas respecto a la renta, pero función del tipo de cambio: XN = f(tc), con tc = valor en pesos del dólar. Si el tc sube (el peso se deprecia), X sube y M baja, XN sube; si el tc baja (el peso se aprecia), X baja y M sube, XN baja.
- Renta de equilibrio: Y₀ = [1 / (1 − c(1 − t))] · (Ā − b·i), con gasto autónomo Ā = C̄ + c·TR + Ī + Ḡ + XN. El multiplicador 1/(1 − c(1 − t)) dice cuántas veces se amplifica en la renta un cambio en el gasto autónomo: si sube c o baja t, el multiplicador crece; si baja c o sube t, se achica.
- Gráfica de la DA (eje vertical DA, horizontal Y): cambios en c, en la propensión a ahorrar o en t GIRAN la recta (cambian su pendiente c(1 − t), con el mismo intercepto): más c o menos t → más empinada. Cambios en lo autónomo (G, C̄, XN, Ī, TR) o en la tasa de interés DESPLAZAN la recta en paralelo (cambian el intercepto Ā − b·i): más gasto autónomo → arriba; más tasa → abajo.
- Ceteris paribus: se mira el cambio de una variable dejando las demás fijas. La presentación no trae cifras de Colombia: no las inventes como reales.`;

const base = { persona: PERSONA, oficina: OFICINA, rol: ROL, fuenteTitulo: TITULO, fuente: FUENTE };

export const ESCENARIOS = [
  crearEscenario({
    ...base,
    id: "da26-a0-ley-demanda",
    decision: "Lee lo que pasó en un puesto de la plaza y di qué le pasa a la demanda de ese producto.",
    opciones: {
      sube: "Sube la cantidad demandada: bajó el precio del propio producto; es un movimiento sobre la curva.",
      baja: "Baja la cantidad demandada: subió el precio del propio producto; es un movimiento sobre la curva.",
      desplaza: "Se desplaza la curva entera: cambió algo distinto del precio de ese producto (la renta de los compradores, los gustos).",
    },
    multiple: false,
    caso: "El expediente es un puesto de la plaza (frutas, arepas, flores) de un vendedor inventado: qué cambió, el precio antes y ahora, y cuánto se vendía.",
    rondas: {
      1: "Fácil: solo cambia el precio del producto, con cifras claras.",
      2: "Media: cambia el precio y el dato de ventas confirma la dirección; la pregunta es por la cantidad demandada.",
      3: "Difícil, con trampa: el precio NO cambia pero cambia la renta o los gustos de los compradores (desplazamiento), aunque las ventas suban o bajen.",
    },
    delata: { desplaza: "desplaz|curva" },
  }),
  crearEscenario({
    ...base,
    id: "da26-a1-carrito",
    decision: "Lee una compra que pasó en el país y di a qué componente de la demanda agregada va.",
    opciones: {
      C: "Consumo (C): lo compran los hogares para ellos.",
      I: "Inversión (I): lo compran las empresas privadas: bienes de capital (máquinas, plantas) o inventarios.",
      G: "Gasto público (G): lo compra el Gobierno.",
      XN: "Exportaciones netas (X − M): lo que se vende a extranjeros suma; lo que se compra afuera resta.",
    },
    multiple: false,
    caso: "El expediente es una compra concreta en un país ficticio: quién compra (dato), qué compra (dato), a quién o dónde (dato). Sin decir el componente.",
    rondas: {
      1: "Fácil: un caso típico (una familia compra mercado; el Gobierno construye una vía).",
      2: "Media: una empresa extranjera compra flores colombianas, o una empresa compra un camión para repartir.",
      3: "Difícil, con trampa: la misma cosa comprada por distintos agentes (un carro que compra una familia es C; el mismo carro comprado por una empresa de taxis es I), o una compra hecha por un hogar a un vendedor extranjero (resta en XN).",
    },
    delata: { C: "consumo", I: "inversi[oó]n", G: "gasto p[uú]blico", XN: "exportaci|importaci" },
  }),
  crearEscenario({
    ...base,
    id: "da26-a2-vaso-renta",
    decision: "Lee lo que le pasó a una familia y di qué le pasa a su consumo.",
    opciones: {
      sube: "El consumo sube.",
      baja: "El consumo baja.",
      igual: "El consumo no cambia en este modelo (por ejemplo, porque lo que cambió no entra en la función de consumo).",
    },
    multiple: false,
    caso: "El expediente es una familia ficticia: su renta, las transferencias que recibe y los impuestos que paga, antes y ahora. Usa C = C̄ + c(Y + TR − tY).",
    rondas: {
      1: "Fácil: sube o baja la renta de la familia; lo demás igual.",
      2: "Media: cambian los impuestos directos o los subsidios (TR); la renta bruta igual.",
      3: "Difícil, con trampa: baja la tasa de interés (en este modelo el consumo no depende de la tasa: no cambia directamente); o la familia pierde la renta pero se endeuda para seguir comiendo (consumo autónomo, no cae a cero).",
    },
  }),
  crearEscenario({
    ...base,
    id: "da26-a3-columpio-tasa",
    decision: "Lee lo que pasa con una empresa que quiere invertir y di qué le pasa a su inversión.",
    opciones: {
      sube: "La inversión sube.",
      baja: "La inversión baja.",
      igual: "La inversión no cambia.",
    },
    multiple: false,
    caso: "El expediente es una empresa ficticia que piensa comprar una máquina o una planta a crédito: la tasa de interés antes y ahora, el costo del crédito y el clima de expectativas. Usa I = Ī − b·i.",
    rondas: {
      1: "Fácil: el Banco de la República sube o baja la tasa de interés; lo demás igual.",
      2: "Media: la tasa no cambia, pero empeoran las expectativas o sube la incertidumbre (inversión autónoma Ī).",
      3: "Difícil, con trampa: la tasa sube un punto, pero en un sector donde la inversión casi no reacciona a la tasa (b muy pequeño): cae muy poco; o la tasa sube y a la vez mejoran mucho las expectativas. Elige casos con una sola respuesta clara.",
    },
  }),
  crearEscenario({
    ...base,
    id: "da26-a4-no-miran-renta",
    decision: "Lee lo que cambió en un país y di qué componente autónomo se mueve: el gasto público o las exportaciones netas.",
    opciones: {
      G: "Gasto público (G): autónomo, lo decide el Gobierno; no depende de la renta del país.",
      XN: "Exportaciones netas (XN): autónomas respecto a la renta, pero se mueven con el tipo de cambio.",
      ninguno: "Ninguno de los dos: lo que cambió fue la renta del país, y ni G ni XN dependen de la renta en este modelo.",
    },
    multiple: false,
    caso: "El expediente es un país ficticio: qué pasó con el presupuesto del Gobierno, con el precio del dólar o con la renta, con datos antes y ahora.",
    rondas: {
      1: "Fácil: el Gobierno aprueba más gasto (G), o el dólar sube y los exportadores venden más (XN).",
      2: "Media: el dólar baja (el peso se aprecia) y entran más importaciones (XN).",
      3: "Difícil, con trampa: la renta del país sube mucho, pero el presupuesto ya estaba aprobado y el dólar no cambia: ni G ni XN se mueven por la renta.",
    },
    delata: { G: "gasto p[uú]blico", XN: "exportaciones netas" },
  }),
  crearEscenario({
    ...base,
    id: "da26-a5-bisagra-ascensor",
    decision: "Lee el cambio que hubo en la economía y di qué le pasa a la recta de la demanda agregada en la gráfica.",
    opciones: {
      gira: "Gira (bisagra): cambió c, la propensión a ahorrar o t; cambia la pendiente y el intercepto queda igual.",
      desplaza: "Se desplaza en paralelo (ascensor): cambió algo autónomo (G, C̄, Ī, XN, TR) o la tasa de interés; cambia el intercepto y la pendiente queda igual.",
    },
    multiple: false,
    caso: "El expediente es un cambio en un país ficticio que hay que dibujar para un noticiero: qué variable cambió, antes y ahora.",
    rondas: {
      1: "Fácil: sube el gasto público (desplaza) o sube la tasa de impuestos directos (gira).",
      2: "Media: las familias deciden ahorrar más de cada peso (gira) o empeoran las expectativas de inversión (desplaza).",
      3: "Difícil, con trampa: sube la tasa de interés (desplaza, no gira, porque −b·i está en el intercepto), o suben las transferencias TR (desplaza, aunque pasen por el consumo).",
    },
    delata: { gira: "gir|pendiente|bisagra", desplaza: "desplaz|paralel|ascensor|intercepto" },
  }),
  crearEscenario({
    ...base,
    id: "da26-a6-eco-multiplicador",
    decision: "Lee el cambio y di qué le pasa al multiplicador 1/(1 − c(1 − t)).",
    opciones: {
      crece: "El multiplicador crece: subió c o bajó t; cada peso de gasto autónomo rinde más en la renta.",
      seAchica: "El multiplicador se achica: bajó c o subió t.",
      igual: "El multiplicador no cambia: lo que cambió fue el gasto autónomo (G, C̄, Ī, XN, TR) o la tasa de interés; la renta cambia, pero el multiplicador no.",
    },
    multiple: false,
    caso: "El expediente es un país ficticio con su c y su t, y un cambio (en c, en t o en un gasto autónomo) con cifras antes y ahora. Puedes poner el gasto autónomo en millones.",
    rondas: {
      1: "Fácil: la gente consume una fracción mayor de cada peso (sube c), o el Gobierno sube t.",
      2: "Media: sube el gasto público y la renta sube varias veces ese monto (el multiplicador NO cambia, solo actúa).",
      3: "Difícil, con trampa: baja la propensión a ahorrar (s = 1 − c, así que c sube: crece), o bajan los impuestos directos y a la vez sube el gasto (el multiplicador crece por t).",
    },
  }),
];
