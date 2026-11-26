/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · SIMULADORES CON IA — lo que el SITIO sabe de cada escenario.
 *
 * El prompt de la compañera NO está aquí: vive en el servidor
 * (supabase/functions/simulador/escenarios/), y el sitio solo manda el id.
 * Aquí está lo que se ve: la oficina de cada tema, quién te recibe, tu papel,
 * la capacitación (texto fijo, sin gastar IA), las opciones ilustradas y un
 * archivo de expedientes por si la IA no responde.
 *
 * Una oficina por tema (orden de Mateo, 26-nov: «te contratan para una
 * firma»): T1 la consultora Brújula, T2 la firma Pulso, T3 el Ministerio de
 * Hacienda, T4 la Junta del Banco de la República y T5 la mesa de cambio del
 * puerto. Un simulador por Aprender.
 *
 * Reglas de texto (REGLA MAESTRA): contexto ≤ 30 palabras, rol ≤ 15,
 * consigna ≤ 12, cada globo de capacitación ≤ 20. Las mide
 * __tests__/simulador.test.mjs, que además comprueba que las opciones y el
 * archivo calcen con el servidor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { VIRUS, FUERA_DEL_CIRCUITO } from "../politica-economica/textos.js";

export const AVISO_IA = "Esta actividad tiene inteligencia artificial aplicada";

const IA_ELLA = "Soy tu compañera con inteligencia artificial. Pregúntame lo que quieras, escribiendo o con el micrófono.";
const IA_EL = "Soy tu compañero con inteligencia artificial. Pregúntame lo que quieras, escribiendo o con el micrófono.";

/* ─────────────────────────── Las cinco oficinas ─────────────────────────── */
export const OFICINAS = {
  brujula: {
    entregar: "Entregar mi concepto",
    firma: "BRÚJULA", lema: "Consultoría económica", fondo: "/macro2026/fondos/plaza.webp",
    companera: { mascota: "profesor", nombre: "Consultor sénior", genero: "Compañero", poses: { capacitacion: "pregunta", caso: "libro", veredicto: "pizarra" } },
    rol: "Tú: consultor junior de Brújula",
    intro: "Te contrataron en Brújula, la consultora de la plaza que les explica la economía a los empresarios. Hoy es tu primer día.",
    saludo: "Te doy la bienvenida a Brújula. Aquí los empresarios llegan confundidos con la economía y salen entendiendo.",
    ia: IA_EL, cosa: "casos",
    cierre: (n) => `Buen turno: resolviste ${n} casos de la plaza. Mañana llegan clientes nuevos.`,
  },
  pulso: {
    entregar: "Entregar diagnóstico",
    firma: "PULSO", lema: "Diagnóstico económico", fondo: "/macro2026/fondos/despacho.webp",
    companera: { mascota: "analista", nombre: "Olga, analista sénior", genero: "Compañera", poses: { capacitacion: "libreta", caso: "lupa", veredicto: "grafica" } },
    rol: "Tú: analista junior de Pulso",
    intro: "Te contrataron en Pulso, una firma que diagnostica economías. Hoy es tu primer día.",
    saludo: "Soy Olga. En Pulso diagnosticamos economías como un médico a un paciente: por sus síntomas.",
    ia: IA_ELLA, cosa: "economías",
    cierre: (n) => `Buen turno. Revisaste ${n} economías. Mañana llegan pacientes nuevos.`,
  },
  hacienda: {
    entregar: "Entregar clasificación",
    firma: "HACIENDA", lema: "Ministerio · Análisis fiscal", fondo: "/macro2026/fondos/hacienda.webp",
    companera: { mascota: "autoridad-economica", nombre: "Jefa de análisis fiscal", genero: "Compañera", poses: { capacitacion: "timon", caso: "carpeta", veredicto: "timon" } },
    rol: "Tú: analista fiscal junior",
    intro: "Te contrataron en el Ministerio de Hacienda, en la oficina que clasifica cada peso que entra y sale del Estado. Hoy es tu primer día.",
    saludo: "Te doy la bienvenida a Hacienda. Por esta mesa pasan recibos, nóminas y decretos antes de que firme el ministro.",
    ia: IA_ELLA, cosa: "expedientes",
    cierre: (n) => `Buen turno: clasificaste ${n} expedientes. El ministro firma tranquilo.`,
  },
  junta: {
    entregar: "Entregar recomendación",
    firma: "LA JUNTA", lema: "Banco de la República · Equipo técnico", fondo: "/macro2026/fondos/boveda.webp",
    companera: { mascota: "inversionista", nombre: "Economista jefe", genero: "Compañero", poses: { capacitacion: "tableta", caso: "monedas", veredicto: "tableta" } },
    rol: "Tú: economista junior de la Junta",
    intro: "Te contrataron en el equipo técnico de la Junta del Banco de la República. Tú preparas los informes. Hoy es tu primer día.",
    saludo: "Te doy la bienvenida al equipo de la Junta. Aquí se decide cuánto dinero circula y a qué precio.",
    ia: IA_EL, cosa: "informes",
    cierre: (n) => `Buen turno: preparaste ${n} informes para la Junta. La reunión puede empezar.`,
  },
  puerto: {
    entregar: "Entregar análisis",
    firma: "PUERTO", lema: "Mesa de cambio · Puerto Abierto", fondo: "/macro2026/fondos/puerto.webp",
    companera: { mascota: "exportadora-flores", nombre: "Jefa de la mesa de cambio", genero: "Compañera", poses: { capacitacion: "flores", caso: "recibe-billete", veredicto: "avion" } },
    rol: "Tú: analista junior de la mesa",
    intro: "Te contrataron en la mesa de cambio de Puerto Abierto, la comercializadora que vende flores y café en dólares. Hoy es tu primer día.",
    saludo: "Te doy la bienvenida a la mesa. Aquí, cada mañana, miramos el dólar antes que el café.",
    ia: IA_ELLA, cosa: "operaciones",
    cierre: (n) => `Buen turno: revisaste ${n} operaciones. Mañana el dólar amanece distinto.`,
  },
};

/* Los ocho problemas de la fuente, con el nombre y la frase de la Aprender. */
export const PROBLEMAS_PE = [...VIRUS, ...FUERA_DEL_CIRCUITO].map(({ id, nombre, descripcion }) => ({ id, nombre, descripcion }));
export const nombreProblema = (id) => PROBLEMAS_PE.find((p) => p.id === id)?.nombre ?? id;

/* Una opción: id (el del servidor), nombre corto, ilustración del kit, signo opcional y la frase que explica sin IA. */
const op = (id, nombre, ilu, frase, signo = null) => ({ id, nombre, ilu, frase, signo });
const d = (dato, antes, ahora, tendencia) => ({ dato, antes, ahora, tendencia });

const SUBE = "↑", BAJA = "↓", IGUAL = "=";

/* ────────────────────────────── T1 · Brújula ────────────────────────────── */
const T1 = [
  {
    id: "da26-a0-ley-demanda", oficina: "brujula",
    capacitacion: [
      "Cada caso es un puesto de la plaza: algo cambió y el vendedor quiere saber qué pasará.",
      "Si cambia el precio del producto, te mueves sobre la curva. Si cambia otra cosa, la curva entera se corre.",
    ],
    consigna: (n) => `¿Qué le pasa a la demanda en ${n}?`,
    opciones: [
      op("sube", "Sube la cantidad", "carrito-mercado", "Bajó el precio del propio producto: se compra más, sobre la misma curva.", SUBE),
      op("baja", "Baja la cantidad", "carrito-mercado", "Subió el precio del propio producto: se compra menos, sobre la misma curva.", BAJA),
      op("desplaza", "La curva se corre", "globo", "Cambió algo distinto del precio (la renta, los gustos): toda la curva se mueve.", "⇄"),
    ],
    sugerencias: ["¿Qué mueve la curva entera?", "¿Qué es ceteris paribus?"],
    archivo: [
      { nombre: "Frutas Doña Rosa", titular: "La libra de mango quedó más barata", quien: "Doña Rosa, frutera",
        testigo: "Bajé el mango porque me llegó mucho, y la gente se lo lleva por bolsas.",
        datos: [d("Precio de la libra de mango", "$4.000", "$2.500", "baja"), d("Libras vendidas al día", "40", "75", "sube"), d("Ingreso de los clientes", "$1,8 millones", "$1,8 millones", "igual")],
        respuesta: ["sube"] },
      { nombre: "Arepas El Fogón", titular: "Mismo precio, pero llegó la prima de diciembre", quien: "Don Julio, arepero",
        testigo: "No he tocado el precio y ahora me piden el doble de arepas.",
        datos: [d("Precio de la arepa", "$3.000", "$3.000", "igual"), d("Prima de los clientes", "$0", "$900.000", "sube"), d("Arepas vendidas al día", "120", "230", "sube")],
        respuesta: ["desplaza"] },
    ],
  },
  {
    id: "da26-a1-carrito", oficina: "brujula",
    capacitacion: [
      "Cada caso es una compra que pasó en el país. Tú dices a qué parte de la demanda agregada va.",
      "La clave no es qué se compró, sino quién lo compró: hogares, empresas, Gobierno o el exterior.",
    ],
    consigna: (n) => `¿A qué componente va la compra de ${n}?`,
    opciones: [
      op("C", "Consumo (C)", "carrito-mercado", "La compran los hogares para ellos mismos.", "C"),
      op("I", "Inversión (I)", "fabrica", "La compra una empresa privada: máquinas, plantas o inventarios.", "I"),
      op("G", "Gasto público (G)", "edificio-gobierno", "La compra el Gobierno.", "G"),
      op("XN", "Exportaciones netas", "billete-usd", "Lo que se vende a extranjeros suma; lo que se compra afuera resta.", "XN"),
    ],
    sugerencias: ["¿Un carro siempre es consumo?", "¿Por qué las importaciones restan?"],
    archivo: [
      { nombre: "Taxis La 14", titular: "Una flota renueva sus carros", quien: "la gerente de Taxis La 14",
        testigo: "Compramos diez carros nuevos para trabajarlos en la calle desde el lunes.",
        datos: [d("Quién compra", "", "una empresa de taxis", "dato"), d("Qué compra", "", "10 carros nuevos", "dato"), d("Para qué", "", "prestar el servicio de taxi", "dato")],
        respuesta: ["I"] },
      { nombre: "Flores de la Sabana", titular: "Un supermercado de Miami se llevó las rosas", quien: "un cultivador de la Sabana",
        testigo: "Este mes todo lo que corté se fue en avión para Estados Unidos.",
        datos: [d("Quién compra", "", "un supermercado de Miami", "dato"), d("Qué compra", "", "50.000 rosas colombianas", "dato"), d("Dónde se produjo", "", "la Sabana de Bogotá", "dato")],
        respuesta: ["XN"] },
    ],
  },
  {
    id: "da26-a2-vaso-renta", oficina: "brujula",
    capacitacion: [
      "Cada caso es una familia: su renta, sus impuestos y lo que recibe del Gobierno.",
      "El consumo depende de la renta disponible: Y + TR − T. Y hay un pedazo autónomo que nunca falta.",
    ],
    consigna: (n) => `¿Qué le pasa al consumo de ${n}?`,
    opciones: [
      op("sube", "Sube", "carrito-mercado", "Subió la renta disponible: la familia gasta una parte (c) de ese peso extra.", SUBE),
      op("baja", "Baja", "carrito-mercado", "Bajó la renta disponible: la familia gasta menos.", BAJA),
      op("igual", "No cambia", "alcancia", "Lo que cambió no entra en la función de consumo de este modelo.", IGUAL),
    ],
    sugerencias: ["¿Qué es el consumo autónomo?", "¿La tasa de interés mueve el consumo?"],
    archivo: [
      { nombre: "Familia Ramírez", titular: "Le subieron el impuesto de renta al papá", quien: "la mamá de los Ramírez",
        testigo: "El sueldo es el mismo, pero lo que llega a la cuenta es menos.",
        datos: [d("Sueldo bruto del hogar", "$4 millones", "$4 millones", "igual"), d("Tasa de impuesto directo", "10 %", "15 %", "sube"), d("Subsidios recibidos", "$0", "$0", "igual")],
        respuesta: ["baja"] },
      { nombre: "Familia Ospina", titular: "Bajó la tasa de los créditos", quien: "el abuelo Ospina",
        testigo: "Dicen que los bancos prestan más barato, pero yo no tengo deudas.",
        datos: [d("Ingreso del hogar", "$3 millones", "$3 millones", "igual"), d("Tasa de interés del banco", "13 %", "10 %", "baja"), d("Impuestos que pagan", "$300.000", "$300.000", "igual")],
        respuesta: ["igual"] },
    ],
  },
  {
    id: "da26-a3-columpio-tasa", oficina: "brujula",
    capacitacion: [
      "Cada caso es una empresa que piensa invertir a crédito: una máquina, una bodega, una planta.",
      "La inversión es I = Ī − b·i: la tasa la empuja y las expectativas también.",
    ],
    consigna: (n) => `¿Qué le pasa a la inversión de ${n}?`,
    opciones: [
      op("sube", "Sube", "fabrica", "El crédito se abarató o mejoraron las expectativas.", SUBE),
      op("baja", "Baja", "fabrica", "El crédito se encareció o empeoraron las expectativas.", BAJA),
      op("igual", "No cambia", "caja-herramientas", "No se movió ni la tasa ni la inversión autónoma.", IGUAL),
    ],
    sugerencias: ["¿Qué es la b de la fórmula?", "¿Qué es la inversión autónoma?"],
    archivo: [
      { nombre: "Lácteos El Prado", titular: "El crédito para la nueva planta salió más caro", quien: "el gerente de Lácteos El Prado",
        testigo: "Con esa cuota mensual, la planta nueva no da. Esperemos al otro año.",
        datos: [d("Tasa de interés del crédito", "9 %", "14 %", "sube"), d("Cuota mensual de la planta", "$45 millones", "$62 millones", "sube"), d("Ventas esperadas", "estables", "estables", "igual")],
        respuesta: ["baja"] },
      { nombre: "Muebles Roble", titular: "Llegó un pedido grande de un hotel", quien: "la dueña de Muebles Roble",
        testigo: "La tasa está igual, pero con este pedido sí compro la sierra nueva.",
        datos: [d("Tasa de interés del crédito", "11 %", "11 %", "igual"), d("Pedidos para el próximo año", "200 muebles", "900 muebles", "sube"), d("Confianza del empresario", "baja", "alta", "sube")],
        respuesta: ["sube"] },
    ],
  },
  {
    id: "da26-a4-no-miran-renta", oficina: "brujula",
    capacitacion: [
      "Dos componentes no miran la renta del país: el gasto del Gobierno y las exportaciones netas.",
      "G lo decide el Gobierno. XN se mueve con el dólar. Tú dices cuál se movió, si alguno.",
    ],
    consigna: (n) => `¿Qué componente autónomo se movió en ${n}?`,
    opciones: [
      op("G", "Gasto público (G)", "edificio-gobierno", "Cambió el presupuesto que decide el Gobierno.", "G"),
      op("XN", "Exportaciones netas", "billete-usd", "Se movió el tipo de cambio y con él lo que se vende y se compra afuera.", "XN"),
      op("ninguno", "Ninguno de los dos", "casa-pais", "Cambió la renta del país, y ni G ni XN dependen de ella.", IGUAL),
    ],
    sugerencias: ["¿Por qué G no mira la renta?", "¿Qué mueve las exportaciones netas?"],
    archivo: [
      { nombre: "Costa Brava", titular: "El dólar subió y los exportadores celebran", quien: "un exportador de café",
        testigo: "Con el mismo bulto de café ahora recibo muchos más pesos.",
        datos: [d("Pesos por un dólar", "$3.900", "$4.400", "sube"), d("Ventas al exterior", "US$ 900 millones", "US$ 1.050 millones", "sube"), d("Presupuesto del Gobierno", "$80 billones", "$80 billones", "igual")],
        respuesta: ["XN"] },
      { nombre: "Valle Alto", titular: "La economía crece fuerte este año", quien: "una ministra de Valle Alto",
        testigo: "El presupuesto ya estaba aprobado desde enero y no lo vamos a mover.",
        datos: [d("Renta del país", "$500 billones", "$560 billones", "sube"), d("Presupuesto del Gobierno", "$90 billones", "$90 billones", "igual"), d("Pesos por un dólar", "$4.000", "$4.000", "igual")],
        respuesta: ["ninguno"] },
    ],
  },
  {
    id: "da26-a5-bisagra-ascensor", oficina: "brujula",
    capacitacion: [
      "Un noticiero nos pide dibujar la recta de la demanda agregada después de cada noticia.",
      "Si cambia c o t, cambia la inclinación. Si cambia algo autónomo o la tasa, la recta sube o baja.",
    ],
    consigna: (n) => `¿Qué le pasa a la recta en ${n}?`,
    opciones: [
      op("gira", "Gira (bisagra)", "balanza-brazo", "Cambió c, la propensión a ahorrar o t: cambia la pendiente, el intercepto queda.", "⟲"),
      op("desplaza", "Sube o baja entera", "globo-aerostatico", "Cambió algo autónomo (G, C̄, Ī, XN, TR) o la tasa: cambia el intercepto, la pendiente queda.", "⇅"),
    ],
    sugerencias: ["¿Por qué la tasa no la gira?", "¿Qué es la pendiente c(1 − t)?"],
    archivo: [
      { nombre: "Puerto Claro", titular: "El Gobierno subió la tarifa de renta", quien: "un periodista de Puerto Claro",
        testigo: "Ahora de cada peso que gana la gente, el Estado se lleva más.",
        datos: [d("Tasa de impuestos directos (t)", "15 %", "25 %", "sube"), d("Gasto público", "$40 billones", "$40 billones", "igual"), d("Tasa de interés", "8 %", "8 %", "igual")],
        respuesta: ["gira"] },
      { nombre: "Río Verde", titular: "El banco central subió la tasa de interés", quien: "una analista de Río Verde",
        testigo: "Los créditos para empresas quedaron dos puntos más caros desde hoy.",
        datos: [d("Tasa de interés", "7 %", "9 %", "sube"), d("Propensión a consumir (c)", "0,8", "0,8", "igual"), d("Tasa de impuestos (t)", "20 %", "20 %", "igual")],
        respuesta: ["desplaza"] },
    ],
  },
  {
    id: "da26-a6-eco-multiplicador", oficina: "brujula",
    capacitacion: [
      "El multiplicador dice cuántas veces rinde en la renta cada peso de gasto autónomo.",
      "Depende solo de c y de t. Si cambia el gasto, la renta cambia, pero el multiplicador no.",
    ],
    consigna: (n) => `¿Qué le pasa al multiplicador de ${n}?`,
    opciones: [
      op("crece", "Crece", "globo-aerostatico", "Subió c o bajó t: cada peso de gasto rinde más.", SUBE),
      op("seAchica", "Se achica", "globo-aerostatico", "Bajó c o subió t: cada peso de gasto rinde menos.", BAJA),
      op("igual", "No cambia", "balanza-pie", "Cambió el gasto autónomo o la tasa, no c ni t.", IGUAL),
    ],
    sugerencias: ["¿Cómo se calcula el multiplicador?", "¿Ahorrar más lo cambia?"],
    archivo: [
      { nombre: "Monteluz", titular: "La gente gasta más de cada peso que gana", quien: "un tendero de Monteluz",
        testigo: "Antes la gente guardaba; ahora de cada mil pesos se gastan novecientos.",
        datos: [d("Propensión a consumir (c)", "0,75", "0,9", "sube"), d("Tasa de impuestos (t)", "20 %", "20 %", "igual"), d("Gasto público", "$30 billones", "$30 billones", "igual")],
        respuesta: ["crece"] },
      { nombre: "San Telmo", titular: "Gran plan de vías del Gobierno", quien: "el ministro de obras de San Telmo",
        testigo: "Vamos a gastar diez billones más en carreteras este año.",
        datos: [d("Gasto público", "$50 billones", "$60 billones", "sube"), d("Propensión a consumir (c)", "0,8", "0,8", "igual"), d("Tasa de impuestos (t)", "25 %", "25 %", "igual")],
        respuesta: ["igual"] },
    ],
  },
];

/* ─────────────────────────────── T2 · Pulso ─────────────────────────────── */
const OPCIONES_FIEBRE = PROBLEMAS_PE.map((p) => ({ id: p.id, nombre: p.nombre, ilu: "virus", frase: p.descripcion, signo: null, iconoPe: true }));

const T2 = [
  {
    id: "pe26-a1-mecanico", oficina: "pulso",
    capacitacion: [
      "Cada expediente es un mercado o una economía con un problema. Tú dices si se arregla sola.",
      "A veces el mercado se ajusta solo, como el mango que baja de precio. Otras veces necesita al Estado.",
    ],
    consigna: (n) => `¿${n} se arregla sola o necesita intervención?`,
    opciones: [
      op("autorregulacion", "Se ajusta sola", "balanza-pie", "El mercado se corrige desde adentro, con precios, oferta y demanda.", "⟲"),
      op("intervencion", "Necesita intervención", "caja-herramientas", "El problema no se corrige solo: el Estado interviene con política económica.", "!"),
    ],
    sugerencias: ["¿Qué es una falla del mercado?", "¿El Estado también falla?"],
    archivo: [
      { nombre: "Plaza de Tunjuelo", titular: "Llegaron demasiadas papas esta semana", quien: "un bultero de la plaza",
        testigo: "Bajamos el bulto el lunes y el miércoles ya no quedaba ni uno.",
        datos: [d("Bultos sin vender el lunes", "20", "300", "sube"), d("Precio del bulto", "$80.000", "$55.000", "baja"), d("Bultos sin vender el miércoles", "300", "0", "baja")],
        respuesta: ["autorregulacion"] },
      { nombre: "Ostrania", titular: "Un año entero de fábricas cerradas", quien: "una costurera de Ostrania",
        testigo: "Llevo once meses buscando trabajo y cada mes cierran más talleres.",
        datos: [d("Personas sin trabajo", "8 de cada 100", "17 de cada 100", "sube"), d("Meses seguidos empeorando", "0", "12", "sube"), d("Fábricas que reabrieron", "", "ninguna", "dato")],
        respuesta: ["intervencion"] },
    ],
  },
  {
    id: "pe26-a2-fiebre", oficina: "pulso",
    capacitacion: [
      "Soy Olga, la del video. En Pulso diagnosticamos economías como un médico a un paciente: por sus síntomas.",
      "Tú eres nuestro analista junior. Cada expediente es un país: lees tres datos y nombras sus virus.",
      "Los virus son los ocho problemas económicos. Unos atacan el circuito; otros, cómo se reparte.",
      IA_ELLA,
    ],
    consigna: (n) => `¿Qué virus tiene ${n}? Marca uno o varios.`,
    multiple: true,
    opciones: OPCIONES_FIEBRE,
    sugerencias: ["¿Recesión y desempleo son lo mismo?", "¿Qué es el Gini?"],
    archivo: [
      { nombre: "Valdoria", titular: "Las vitrinas cambian de precio cada semana", quien: "una tendera de Valdoria",
        testigo: "Con la plata del mercado de enero hoy compro la mitad.",
        datos: [d("Precio de la canasta familiar", "+3 % al año", "+14 % al año", "sube"), d("Arriendo promedio", "$1,1 millones", "$1,4 millones", "sube"), d("Pasaje de bus", "$3.200", "$3.900", "sube")],
        respuesta: ["inflacion"] },
      { nombre: "Ostrania", titular: "Las fábricas apagan máquinas y el Estado pide prestado", quien: "un tornero de Ostrania",
        testigo: "Mandé veinte hojas de vida este mes y nadie me ha llamado.",
        datos: [d("Personas que buscan trabajo sin hallarlo", "7 de cada 100", "15 de cada 100", "sube"), d("Recaudo frente a gasto del Estado", "100 contra 101", "100 contra 128", "sube"), d("Fábricas que cerraron este año", "40", "310", "sube")],
        respuesta: ["desempleo", "deficitFiscal"] },
      { nombre: "Belmira", titular: "Sube el café, pero la economía crece rápido", quien: "un cafetero de Belmira",
        testigo: "El café está carísimo por la helada, lo demás sigue igual.",
        datos: [d("Precio del café", "$9.000 la libra", "$16.000 la libra", "sube"), d("Precio del resto de la canasta", "+3 % al año", "+3 % al año", "igual"), d("Del ingreso total, lo que se lleva el 1 % más rico", "20 %", "41 %", "sube")],
        respuesta: ["desigualdad"] },
    ],
  },
  {
    id: "pe26-a3-problema-resuelto", oficina: "pulso",
    capacitacion: [
      "Un objetivo es el problema planteado como solucionado. Cada cliente trae su problema en datos.",
      "Tú escoges el objetivo que lo resuelve. Ojo: dos problemas pueden compartir el mismo objetivo.",
    ],
    consigna: (n) => `¿Qué objetivo resuelve lo de ${n}? Uno o varios.`,
    multiple: true,
    opciones: [
      op("estabilizacion", "Estabilización", "balanza-pie", "Corregir inflación, desempleo, déficit fiscal o externo."),
      op("redistribucion", "Redistribución", "pila-monedas", "Mover recursos hacia los menos favorecidos."),
      op("asignacion", "Asignación", "carrito-mercado", "Facilitar o limitar el acceso a ciertos bienes."),
      op("crecimiento", "Crecimiento", "cohete", "Potenciar la capacidad de crecer de la economía."),
      op("sostenibilidad", "Sostenibilidad", "arbol-raices", "Proteger el ambiente o corregir su daño."),
    ],
    sugerencias: ["¿Objetivo y meta son lo mismo?", "¿Qué cabe en estabilización?"],
    archivo: [
      { nombre: "Lagunilla", titular: "El río del pueblo cambió de color", quien: "una pescadora de Lagunilla",
        testigo: "Desde que llegó la curtiembre ya no saco ni un pescado.",
        datos: [d("Peces por jornada", "30", "4", "baja"), d("Vertimientos al río", "2 al mes", "40 al mes", "sube"), d("Familias que viven de la pesca", "", "1.200", "dato")],
        respuesta: ["sostenibilidad"] },
      { nombre: "Santa Inés", titular: "Los precios corren y el Estado gasta de más", quien: "un tendero de Santa Inés",
        testigo: "Cada semana remarco todo, y el Gobierno sigue pidiendo prestado.",
        datos: [d("Subida general de precios", "3 % al año", "11 % al año", "sube"), d("Gastos del Estado por cada 100 de ingresos", "102", "125", "sube"), d("Deuda nueva del Estado", "$2 billones", "$9 billones", "sube")],
        respuesta: ["estabilizacion"] },
    ],
  },
  {
    id: "pe26-a4-perillas", oficina: "pulso",
    capacitacion: [
      "La política económica tiene ramas, como perillas de un tablero. Cada medida mueve una.",
      "Tú lees la medida y dices de qué rama es. Mira el instrumento, no el sector que ayuda.",
    ],
    consigna: (n) => `¿De qué rama es la medida de ${n}?`,
    opciones: [
      op("fiscal", "Fiscal", "edificio-gobierno", "Impuestos, gasto público, subsidios y transferencias."),
      op("monetaria", "Monetaria", "fajo-pesos", "Emisión, crédito, tasa de interés y encaje."),
      op("cambiaria", "Cambiaria", "billete-usd", "El precio del dólar y la intervención en el mercado de divisas."),
      op("comercial", "Comercio exterior", "caja-bananos", "Aranceles, exportaciones, importaciones e inversión extranjera."),
      op("sectorial", "Sectorial", "caja-herramientas", "Agro, industria, mipymes, ciencia y tecnología."),
    ],
    sugerencias: ["¿Un subsidio al agro es sectorial?", "¿Qué es el encaje?"],
    archivo: [
      { nombre: "Ríoseco", titular: "El banco central mueve su tasa de referencia", quien: "una banquera de Ríoseco",
        testigo: "Desde mañana les prestamos a los bancos dos puntos más barato.",
        datos: [d("Quién anuncia", "", "el banco central", "dato"), d("Tasa de referencia", "10 %", "8 %", "baja"), d("A quién toca primero", "", "a los bancos y sus créditos", "dato")],
        respuesta: ["monetaria"] },
      { nombre: "Altamar", titular: "Celulares importados pagarán más en la aduana", quien: "un importador de Altamar",
        testigo: "Cada contenedor de celulares me sale ahora un 15 % más caro al entrar.",
        datos: [d("Quién anuncia", "", "el Ministerio de Comercio", "dato"), d("Cobro en aduana a celulares", "5 %", "20 %", "sube"), d("A quién toca primero", "", "a los importadores", "dato")],
        respuesta: ["comercial"] },
    ],
  },
  {
    id: "pe26-a5-escalera", oficina: "pulso",
    capacitacion: [
      "Un plan de gobierno es una escalera: problema, objetivo, estrategia, instrumento, medida y meta.",
      "Te doy una frase del plan y tú dices en qué peldaño va. La meta siempre trae cifra y plazo.",
    ],
    consigna: (n) => `¿En qué peldaño va la frase de ${n}?`,
    opciones: [
      op("problema", "Problema", "nube-tormenta", "El desajuste que hay que resolver.", "1"),
      op("objetivo", "Objetivo", "lupa", "El problema planteado como solucionado.", "2"),
      op("estrategia", "Estrategia", "edificio-gobierno", "La rama de política escogida.", "3"),
      op("instrumento", "Instrumento", "caja-herramientas", "La herramienta de esa rama.", "4"),
      op("medida", "Medida", "grifo", "El manejo específico del instrumento.", "5"),
      op("meta", "Meta", "globo-aerostatico", "El objetivo con cifra y plazo.", "6"),
    ],
    sugerencias: ["¿Instrumento y medida en qué difieren?", "¿Toda meta tiene plazo?"],
    archivo: [
      { nombre: "Plan de Cerro Azul", titular: "«Bajar el desempleo del 14 % al 12 % en doce meses»", quien: "la asesora del plan",
        testigo: "Esa frase la escribí para que en un año nos puedan medir.",
        datos: [d("Problema", "", "desempleo", "dato"), d("Estrategia", "", "política fiscal", "dato"), d("Instrumento", "", "impuesto a la renta de empresas", "dato")],
        respuesta: ["meta"] },
      { nombre: "Plan de Bahía Sol", titular: "«Reducir la tarifa de renta de las empresas del 32 % al 28 %»", quien: "el asesor tributario",
        testigo: "Esto es lo que el Congreso tiene que aprobar en la reforma.",
        datos: [d("Problema", "", "desempleo", "dato"), d("Objetivo", "", "generar empleo", "dato"), d("Instrumento", "", "impuesto a la renta de empresas", "dato")],
        respuesta: ["medida"] },
    ],
  },
];

/* ────────────────────────────── T3 · Hacienda ───────────────────────────── */
const T3 = [
  {
    id: "pf26-a1-lupa", oficina: "hacienda",
    capacitacion: [
      "Toda política se mira con seis preguntas: naturaleza, mercado, objetivos, instrumentos, medidas e impactos.",
      "Te paso frases de informes. Tú dices qué pregunta responde cada una.",
    ],
    consigna: (n) => `¿Qué pregunta responde la frase de ${n}?`,
    opciones: [
      op("naturaleza", "Naturaleza", "lupa", "Lo que la distingue: usa las finanzas públicas.", "1"),
      op("mercado", "Mercado", "carrito-mercado", "Dónde se aplica: bienes y servicios, la demanda agregada.", "2"),
      op("objetivos", "Objetivos", "globo-aerostatico", "Qué metas ayuda a cumplir.", "3"),
      op("instrumentos", "Instrumentos", "caja-herramientas", "Tributación, gasto público y deuda pública.", "4"),
      op("medidas", "Medidas", "balanza-brazo", "Cómo se mueven: expansivas o contraccionistas.", "5"),
      op("impactos", "Impactos", "casa-pais", "Efectos en familias, empresas y la economía.", "6"),
    ],
    sugerencias: ["¿Instrumento y medida en qué difieren?", "¿Cuáles son los cinco objetivos?"],
    archivo: [
      { nombre: "Informe de Alcaraz", titular: "«Con la rebaja del IVA, las tiendas venderán más y contratarán gente»", quien: "un asesor del ministro",
        testigo: "Esa parte del informe la escribí pensando en los tenderos.",
        datos: [d("Sección del informe", "", "efectos esperados", "dato"), d("Quiénes aparecen", "", "tiendas, familias y trabajadores", "dato"), d("Horizonte", "", "seis meses", "dato")],
        respuesta: ["impactos"] },
      { nombre: "Informe de Serranía", titular: "«El Gobierno cuenta con tributos, gasto y deuda»", quien: "la redactora del informe",
        testigo: "Quise dejar claro con qué cuenta el ministro antes de decidir.",
        datos: [d("Sección del informe", "", "herramientas disponibles", "dato"), d("Ejemplo citado", "", "el IVA y los TES", "dato"), d("Página", "", "4 de 20", "dato")],
        respuesta: ["instrumentos"] },
    ],
  },
  {
    id: "pf26-a2-buzones", oficina: "hacienda",
    capacitacion: [
      "Todo pago obligatorio al Estado cae en uno de tres buzones. La clave: qué recibes a cambio.",
      "Si nada directo, es impuesto. Si un servicio que usas, tasa. Si una obra que te beneficia, contribución.",
    ],
    consigna: (n) => `¿En qué buzón cae el cobro de ${n}?`,
    opciones: [
      op("impuesto", "Impuesto", "buzon-impuesto", "Se paga sin contraprestación directa: cae al pozo común."),
      op("tasa", "Tasa", "buzon-tasa", "Se paga a cambio de un servicio concreto que uno usa."),
      op("contribucion", "Contribución", "buzon-contribucion", "Financia una obra o servicio que beneficia al que paga."),
    ],
    sugerencias: ["¿El SOAT qué es?", "¿Por qué el peaje no es impuesto?"],
    archivo: [
      { nombre: "Familia Cárdenas", titular: "Llegó el cobro por la vía nueva del barrio", quien: "el señor Cárdenas",
        testigo: "Me cobran porque pavimentaron la calle y mi casa ahora vale más.",
        datos: [d("Qué se hizo", "", "una vía nueva frente a la casa", "dato"), d("Valor de la casa", "$300 millones", "$340 millones", "sube"), d("Cobro único", "", "$434.000", "dato")],
        respuesta: ["contribucion"] },
      { nombre: "Transportes Andina", titular: "Un camión cruza dos casetas en la vía", quien: "un conductor de Andina",
        testigo: "Pago cada vez que paso por esta carretera, y si no paso, no pago.",
        datos: [d("Caseta Río Bogotá", "", "$11.200", "dato"), d("Caseta Siberia", "", "$13.800", "dato"), d("Viajes a la semana", "", "6", "dato")],
        respuesta: ["tasa"] },
    ],
  },
  {
    id: "pf26-a3-cajeros", oficina: "hacienda",
    capacitacion: [
      "Hay dos cajeros. Uno mira tu billetera antes de cobrar; el otro solo mira el producto.",
      "Tú dices cuál cajero cobró cada impuesto. Ojo con la retención: parece nómina, pero es renta.",
    ],
    consigna: (n) => `¿Qué cajero le cobró a ${n}?`,
    opciones: [
      op("directo", "El que mira la billetera", "billetera", "Directo: mira la condición económica de quien paga (renta, predial, vehículos)."),
      op("indirecto", "El que mira el producto", "caja-registradora", "Indirecto: cobra igual a todos por la compra (IVA, impoconsumo, aranceles)."),
    ],
    sugerencias: ["¿El IVA lo paga la empresa?", "¿Qué es la retención en la fuente?"],
    archivo: [
      { nombre: "Restaurante La Mesa", titular: "Una cena que salió más cara que el menú", quien: "una comensal",
        testigo: "Traía 220 mil justos y la cuenta llegó por 237 mil.",
        datos: [d("Valor de la comida", "", "$219.815", "dato"), d("Cobro adicional del 8 %", "", "$17.585", "dato"), d("¿Depende del sueldo del cliente?", "", "no", "dato")],
        respuesta: ["indirecto"] },
      { nombre: "Laura, ingeniera", titular: "Cada mes le descuentan algo de su pago", quien: "Laura",
        testigo: "Mi compañero gana la mitad y a él no le descuentan nada.",
        datos: [d("Pago mensual de Laura", "", "$16,9 millones", "dato"), d("Descuento anticipado del mes", "", "$1.014.000", "dato"), d("Descuento a quien gana $1,3 millones", "", "$0", "dato")],
        respuesta: ["directo"] },
    ],
  },
  {
    id: "pf26-a4-tanque", oficina: "hacienda",
    capacitacion: [
      "El Estado es un tanque: entra plata por los tributos y por la deuda, y sale por tres desagües.",
      "Tú dices por qué tubo pasa cada orden de pago: funcionamiento, inversión, servicio de la deuda o deuda nueva.",
    ],
    consigna: (n) => `¿Por qué tubo pasa la plata de ${n}?`,
    opciones: [
      op("funcionamiento", "Funcionamiento", "edificio-gobierno", "Lo que cuesta que el Estado opere: nómina, contratistas, dotación."),
      op("inversion", "Inversión", "carretera", "Vías, transporte, escuelas, conectividad."),
      op("servicioDeuda", "Servicio de la deuda", "pozo-monedas", "Pagar intereses y abonos de lo que se debe."),
      op("deudaInterna", "Deuda interna", "fajo-pesos", "Plata prestada en pesos, sobre todo con TES."),
      op("deudaExterna", "Deuda externa", "billete-usd", "Plata prestada afuera: BID, Banco Mundial, bonos globales."),
    ],
    sugerencias: ["¿Saldo y servicio son lo mismo?", "¿Por qué el Estado se endeuda?"],
    archivo: [
      { nombre: "Orden 2025-118", titular: "El Ministerio paga a quienes le prestaron con TES", quien: "una tesorera del Ministerio",
        testigo: "Esto no compra nada nuevo: es el pago de lo que ya debemos.",
        datos: [d("Concepto", "", "intereses de TES", "dato"), d("Valor del pago", "", "$1,2 billones", "dato"), d("Saldo del tanque", "$9 billones", "$7,8 billones", "baja")],
        respuesta: ["servicioDeuda"] },
      { nombre: "Contrato 2025-311", titular: "Se firma la vía entre dos municipios", quien: "el alcalde de El Tambo",
        testigo: "Por fin vamos a sacar el café sin pasar ocho horas en trocha.",
        datos: [d("Obra", "", "58 km de carretera", "dato"), d("Valor del contrato", "", "$240.000 millones", "dato"), d("Saldo del tanque", "$9 billones", "$8,76 billones", "baja")],
        respuesta: ["inversion"] },
    ],
  },
  {
    id: "pf26-a5-balanza", oficina: "hacienda",
    capacitacion: [
      "Cada paquete de medidas fiscales inclina la balanza de la demanda agregada hacia un lado.",
      "Bajar impuestos o subir el gasto la empuja arriba. Lo contrario la empuja abajo, aunque sea sin querer.",
    ],
    consigna: (n) => `¿Hacia dónde inclina la balanza el paquete de ${n}?`,
    opciones: [
      op("expansiva", "Expansiva", "globo-aerostatico", "Empuja la DA hacia arriba: menos impuestos, más gasto o más transferencias.", SUBE),
      op("contraccionista", "Contraccionista", "balanza-pie", "Empuja la DA hacia abajo: más impuestos, menos gasto o menos transferencias.", BAJA),
    ],
    sugerencias: ["¿Una reforma para recaudar es contraccionista?", "¿Por qué bajar t mueve el multiplicador?"],
    archivo: [
      { nombre: "Reforma de Villanueva", titular: "El Gobierno necesita tapar el hueco fiscal", quien: "el ministro de Villanueva",
        testigo: "No queremos frenar a nadie: solo nos faltan cuatro billones.",
        datos: [d("Tarifa del IVA", "16 %", "19 %", "sube"), d("Personas que declaran renta", "3 millones", "4,5 millones", "sube"), d("Gasto público", "$100 billones", "$100 billones", "igual")],
        respuesta: ["contraccionista"] },
      { nombre: "Plan de Altomayo", titular: "Más subsidios y obras para el año electoral", quien: "una alcaldesa de Altomayo",
        testigo: "Con las obras y la plata para los mayores, el comercio se va a mover.",
        datos: [d("Gasto en vías", "$4 billones", "$6 billones", "sube"), d("Subsidio mensual a mayores", "$80.000", "$120.000", "sube"), d("Tarifas de impuestos", "iguales", "iguales", "igual")],
        respuesta: ["expansiva"] },
    ],
  },
];

/* ─────────────────────────────── T4 · La Junta ──────────────────────────── */
const T4 = [
  {
    id: "pm26-a1-billetera", oficina: "junta",
    capacitacion: [
      "Antes de la Junta, mira la billetera de la gente: billetes, cheques, débito, crédito, CDT.",
      "Tú dices de dónde sale el dinero de cada pago: del BanRep, de un depósito propio o de un préstamo.",
    ],
    consigna: (n) => `¿De dónde sale el dinero con que pagó ${n}?`,
    opciones: [
      op("emision", "Billetes del BanRep", "fajo-pesos", "Billetes y monedas que emitió el Banco de la República."),
      op("deposito", "Un depósito propio", "frasco-banco", "Plata propia en una cuenta corriente, de ahorros o un CDT."),
      op("credito", "Un préstamo", "billetera", "Plata que presta el banco, como la tarjeta de crédito: no es propia."),
    ],
    sugerencias: ["¿La tarjeta de crédito es dinero?", "¿Qué es un CDT?"],
    archivo: [
      { nombre: "Camila, estudiante", titular: "Pagó el computador con el plástico dorado", quien: "Camila",
        testigo: "Lo difiero a doce cuotas y lo voy pagando con la mesada.",
        datos: [d("Precio del computador", "", "$3,2 millones", "dato"), d("Saldo de su cuenta de ahorros", "$400.000", "$400.000", "igual"), d("Lo que le debe al banco", "$0", "$3,2 millones", "sube")],
        respuesta: ["credito"] },
      { nombre: "Don Héctor, ferretero", titular: "Pagó un pedido con un cheque", quien: "Don Héctor",
        testigo: "Firmé el cheque y el proveedor lo cobra contra mi cuenta.",
        datos: [d("Valor del pedido", "", "$8 millones", "dato"), d("Saldo de su cuenta corriente", "$15 millones", "$7 millones", "baja"), d("Lo que le debe al banco", "$0", "$0", "igual")],
        respuesta: ["deposito"] },
    ],
  },
  {
    id: "pm26-a2-ventanilla", oficina: "junta",
    capacitacion: [
      "El BanRep tiene una ventanilla: si compra un activo, entrega pesos nuevos; si lo vende, los recoge.",
      "Tú dices qué le pasa a la base monetaria con cada operación. Si el BanRep no participa, nada cambia.",
    ],
    consigna: (n) => `¿Qué le pasa a la base monetaria en ${n}?`,
    opciones: [
      op("sube", "Sube", "ventanilla", "El BanRep compró un activo o prestó, y entregó pesos nuevos.", SUBE),
      op("baja", "Baja", "ventanilla", "El BanRep vendió un activo o le pagaron, y recogió pesos.", BAJA),
      op("igual", "No cambia", "billetera", "El BanRep no compró ni vendió: los pesos solo cambiaron de bolsillo.", IGUAL),
    ],
    sugerencias: ["¿Qué es la base monetaria?", "¿Por qué comprar oro crea dinero?"],
    archivo: [
      { nombre: "Operación del martes", titular: "Un exportador cambia sus dólares en la ventanilla", quien: "un exportador de flores",
        testigo: "Entregué los dólares de la temporada y me dieron pesos al instante.",
        datos: [d("Quién va a la ventanilla", "", "un exportador", "dato"), d("Qué entrega al BanRep", "", "US$ 2 millones", "dato"), d("Base monetaria", "$190 billones", "$190,008 billones", "sube")],
        respuesta: ["sube"] },
      { nombre: "Operación del jueves", titular: "Una señora saca efectivo en el cajero", quien: "la señora Inés",
        testigo: "Saqué medio millón de mi cuenta de ahorros para el mercado.",
        datos: [d("Dónde retira", "", "cajero de un banco comercial", "dato"), d("Monto", "", "$500.000", "dato"), d("¿Participó el BanRep?", "", "no", "dato")],
        respuesta: ["igual"] },
    ],
  },
  {
    id: "pm26-a3-cascada", oficina: "junta",
    capacitacion: [
      "Los bancos prestan los depósitos, menos el encaje que el BanRep les congela. Ese préstamo vuelve como depósito.",
      "Así el dinero cae en cascada. Tú dices si la cascada crece, se acorta o queda igual.",
    ],
    consigna: (n) => `¿Cuánto dinero crean los bancos de ${n}?`,
    opciones: [
      op("sube", "Se crea más", "grifo", "Los bancos prestan una parte mayor de cada depósito.", SUBE),
      op("baja", "Se crea menos", "grifo", "Una parte mayor de cada depósito se queda quieta.", BAJA),
      op("igual", "No cambia", "frasco-banco", "No cambió la parte que se presta de cada depósito.", IGUAL),
    ],
    sugerencias: ["¿Qué es el encaje?", "¿Cuánto dinero sale de 1.000?"],
    archivo: [
      { nombre: "Banco central de Marina", titular: "Los bancos tendrán que guardar más de cada depósito", quien: "una gerente de banco",
        testigo: "De cada millón que nos depositan, ahora solo prestamos ochocientos mil.",
        datos: [d("Parte congelada de cada depósito", "10 %", "20 %", "sube"), d("Préstamo de un depósito de 1.000", "900", "800", "baja"), d("Total creado desde 1.000", "10.000", "5.000", "baja")],
        respuesta: ["baja"] },
      { nombre: "Banco de Arenales", titular: "Un banco cambia su logo y su publicidad", quien: "el gerente de mercadeo",
        testigo: "Nuevo color, nueva app, las mismas reglas del banco central.",
        datos: [d("Parte congelada de cada depósito", "10 %", "10 %", "igual"), d("Logo del banco", "azul", "verde", "dato"), d("Préstamo de un depósito de 1.000", "900", "900", "igual")],
        respuesta: ["igual"] },
    ],
  },
  {
    id: "pm26-a4-cajas", oficina: "junta",
    capacitacion: [
      "El dinero se cuenta en cajas: M1 dentro de M2, M2 dentro de M3. La base monetaria va aparte.",
      "Tú dices en qué caja entra primero cada plata. Entre más líquida, más adentro.",
    ],
    consigna: (n) => `¿En qué caja entra primero la plata de ${n}?`,
    opciones: [
      op("bm", "Base monetaria", "deposito-reservas", "Las reservas que los bancos tienen congeladas en el BanRep.", "BM"),
      op("m1", "M1", "billetera", "Efectivo del público y cuentas corrientes.", "M1"),
      op("m2", "M2", "frasco-banco", "Cuasidineros: ahorros, CDT, CDAT.", "M2"),
      op("m3", "M3", "candado", "Otros depósitos a la vista y bonos del sistema financiero.", "M3"),
    ],
    sugerencias: ["¿Por qué la base va aparte?", "¿Qué es un cuasidinero?"],
    archivo: [
      { nombre: "Doña Marta", titular: "Guardó la prima a un año en el banco", quien: "Doña Marta",
        testigo: "No la puedo tocar hasta diciembre, pero me paga intereses.",
        datos: [d("Monto guardado", "", "$5 millones", "dato"), d("Plazo", "", "360 días", "dato"), d("¿Se puede gastar con cheque?", "", "no", "dato")],
        respuesta: ["m2"] },
      { nombre: "Banco Sabana", titular: "Lo que el banco no puede prestar", quien: "la tesorera del banco",
        testigo: "Esa plata está en el Banco de la República y no la podemos mover.",
        datos: [d("Depósitos del banco", "", "$10 billones", "dato"), d("Parte congelada en el BanRep", "", "$800.000 millones", "dato"), d("¿La puede gastar el público?", "", "no", "dato")],
        respuesta: ["bm"] },
    ],
  },
  {
    id: "pm26-a5-precio-dinero", oficina: "junta",
    capacitacion: [
      "La tasa de interés es el precio del dinero: sale de cruzar la oferta real con la demanda.",
      "Más dinero real, tasa más baja. Más ingreso, más gente quiere dinero y la tasa sube.",
    ],
    consigna: (n) => `¿Qué le pasa a la tasa de interés de ${n}?`,
    opciones: [
      op("sube", "Sube", "termometro-vidrio", "Hay menos dinero real frente al que la gente quiere tener.", SUBE),
      op("baja", "Baja", "termometro-vidrio", "Hay más dinero real frente al que la gente quiere tener.", BAJA),
      op("igual", "No cambia", "balanza-pie", "No se movió ni la oferta real ni la demanda de dinero.", IGUAL),
    ],
    sugerencias: ["¿Por qué la oferta es vertical?", "¿Qué hacen los precios aquí?"],
    archivo: [
      { nombre: "Montecarmelo", titular: "Los precios suben y el banco central no imprime", quien: "un analista de Montecarmelo",
        testigo: "Con todo 20 % más caro, la misma plata alcanza para menos.",
        datos: [d("Dinero que fija el banco central", "$100 billones", "$100 billones", "igual"), d("Nivel de precios", "1", "1,2", "sube"), d("Ingreso del país", "$300 billones", "$300 billones", "igual")],
        respuesta: ["sube"] },
      { nombre: "Laguna Fría", titular: "El banco central pone más dinero a circular", quien: "una banquera de Laguna Fría",
        testigo: "Hay más plata en el sistema y los bancos compiten por prestarla.",
        datos: [d("Dinero que fija el banco central", "$100 billones", "$115 billones", "sube"), d("Nivel de precios", "1", "1", "igual"), d("Ingreso del país", "$280 billones", "$280 billones", "igual")],
        respuesta: ["baja"] },
    ],
  },
  {
    id: "pm26-a6-palancas", oficina: "junta",
    capacitacion: [
      "La Junta tiene tres palancas: la tasa de intervención, la compra o venta de TES y el encaje.",
      "Tú lees el comunicado y dices si la Junta abrió la llave del dinero o la cerró.",
    ],
    consigna: (n) => `¿Qué política hizo la Junta de ${n}?`,
    opciones: [
      op("expansiva", "Expansiva", "grifo", "Más dinero o tasa más baja: bajar la tasa, comprar TES, bajar el encaje.", SUBE),
      op("contraccionista", "Contraccionista", "candado", "Menos dinero o tasa más alta: subir la tasa, vender TES, subir el encaje.", BAJA),
    ],
    sugerencias: ["¿Qué son las OMA?", "¿Vender TES saca dinero?"],
    archivo: [
      { nombre: "Junta de Altaplana", titular: "El banco central vende títulos y congela más depósitos", quien: "el vocero de la Junta",
        testigo: "Los bancos nos compraron TES y ahora guardan más de cada depósito.",
        datos: [d("Tasa de intervención", "9 %", "9 %", "igual"), d("TES que vendió el banco central", "$0", "$4 billones", "sube"), d("Encaje", "8 %", "11 %", "sube")],
        respuesta: ["contraccionista"] },
      { nombre: "Junta de Riomar", titular: "Crédito más barato desde el lunes", quien: "una gerente de banco",
        testigo: "El banco central nos presta más barato y ya bajamos las cuotas.",
        datos: [d("Tasa de intervención", "11 %", "9,5 %", "baja"), d("TES comprados o vendidos", "$0", "$0", "igual"), d("Encaje", "10 %", "10 %", "igual")],
        respuesta: ["expansiva"] },
    ],
  },
  {
    id: "pm26-a7-termostato", oficina: "junta",
    capacitacion: [
      "La inflación es la temperatura; la tasa, el aire acondicionado. La meta: de 2 % a 4 %.",
      "Tú le recomiendas a la Junta qué hacer con la tasa. Recuerda: el cuarto tarda en enfriar.",
    ],
    consigna: (n) => `¿Qué hace la Junta de ${n} con la tasa?`,
    opciones: [
      op("subir", "Subir la tasa", "casa-aire", "La inflación está por encima de la banda: hay que enfriar.", SUBE),
      op("bajar", "Bajar la tasa", "casa-aire", "La inflación está por debajo y la economía se frena.", BAJA),
      op("mantener", "Mantenerla", "termometro-vidrio", "La inflación está en la banda, o ya se subió y hay que esperar el rezago.", IGUAL),
    ],
    sugerencias: ["¿Por qué la meta es una banda?", "¿Qué es el rezago?"],
    archivo: [
      { nombre: "Informe de marzo, Costalinda", titular: "Los precios siguen corriendo", quien: "una tendera de Costalinda",
        testigo: "Cada mes remarco el arroz, el aceite y la panela.",
        datos: [d("Inflación anual", "6 %", "9 %", "sube"), d("Tasa de intervención", "7 %", "7 %", "igual"), d("Crecimiento", "3 %", "3,2 %", "sube")],
        respuesta: ["subir"] },
      { nombre: "Informe de julio, Sierrafría", titular: "La inflación quieta en la mitad de la banda", quien: "un analista de Sierrafría",
        testigo: "Llevamos un año con los precios tranquilos y el empleo estable.",
        datos: [d("Inflación anual", "3,1 %", "3 %", "igual"), d("Tasa de intervención", "5 %", "5 %", "igual"), d("Crecimiento", "3 %", "3 %", "igual")],
        respuesta: ["mantener"] },
    ],
  },
];

/* ─────────────────────────────── T5 · El puerto ────────────────────────── */
const T5 = [
  {
    id: "pc26-a1-balanza", oficina: "puerto",
    capacitacion: [
      "El tipo de cambio es cuántos pesos das por un dólar. Cada mañana lo anotamos en el tablero.",
      "Si das más pesos, el peso perdió valor. Si das menos, el peso ganó. Tú dices cuál pasó.",
    ],
    consigna: (n) => `¿Qué le pasó al peso en ${n}?`,
    opciones: [
      op("deprecia", "El peso pierde valor", "fajo-pesos", "Se deprecia: hay que dar más pesos por el mismo dólar.", BAJA),
      op("aprecia", "El peso gana valor", "fajo-pesos", "Se aprecia: se dan menos pesos por el mismo dólar.", SUBE),
    ],
    sugerencias: ["¿A quién le sirve un dólar caro?", "¿Devaluar y depreciar es igual?"],
    archivo: [
      { nombre: "Mañana del 3 de marzo", titular: "El tablero amaneció con un número más alto", quien: "la exportadora de rosas",
        testigo: "Con los mismos dólares de la venta, hoy me dan muchos más pesos.",
        datos: [d("Pesos por un dólar", "$4.000", "$4.500", "sube"), d("Pesos por una caja de US$ 100", "$400.000", "$450.000", "sube"), d("Noticia", "", "suben las tasas en EE. UU.", "dato")],
        respuesta: ["deprecia"] },
      { nombre: "Mañana del 9 de junio", titular: "Con un millón se compran más dólares", quien: "un importador de celulares",
        testigo: "El mismo millón de pesos hoy me rinde más en la mesa.",
        datos: [d("Pesos por un dólar", "$4.000", "$3.800", "baja"), d("Dólares por $1 millón", "US$ 250", "US$ 263", "sube"), d("Noticia", "", "llega una gran inversión extranjera", "dato")],
        respuesta: ["aprecia"] },
    ],
  },
  {
    id: "pc26-a2-subasta", oficina: "puerto",
    capacitacion: [
      "El dólar es una subasta: unos traen dólares y otros los piden. El precio sale del cruce.",
      "Tú dices qué curva se corrió con cada noticia y hacia dónde.",
    ],
    consigna: (n) => `¿Qué curva se movió en ${n}?`,
    opciones: [
      op("ofertaDerecha", "Llegan más dólares", "billete-usd", "La oferta de divisas va a la derecha: el tipo de cambio baja.", "O→"),
      op("ofertaIzquierda", "Llegan menos dólares", "billete-usd", "La oferta va a la izquierda: el tipo de cambio sube.", "←O"),
      op("demandaDerecha", "Se piden más dólares", "caja-registradora", "La demanda va a la derecha: el tipo de cambio sube.", "D→"),
      op("demandaIzquierda", "Se piden menos dólares", "caja-registradora", "La demanda va a la izquierda: el tipo de cambio baja.", "←D"),
    ],
    sugerencias: ["¿Las remesas traen o piden dólares?", "¿Quién pide dólares?"],
    archivo: [
      { nombre: "Puerto de Bahía Fría", titular: "Una helada quemó los cafetales", quien: "un cafetero del sur",
        testigo: "Este año casi no tenemos café para vender afuera.",
        datos: [d("Café exportado", "US$ 900 millones", "US$ 500 millones", "baja"), d("Importaciones", "iguales", "iguales", "igual"), d("Pesos por un dólar", "$4.000", "$4.250", "sube")],
        respuesta: ["ofertaIzquierda"] },
      { nombre: "Mes de diciembre en Lomas", titular: "Las familias compran celulares y viajan", quien: "una agente de viajes",
        testigo: "Todo el mundo quiere irse a Miami y traer el celular nuevo.",
        datos: [d("Compras de celulares afuera", "US$ 300 millones", "US$ 700 millones", "sube"), d("Viajes al exterior", "40.000", "90.000", "sube"), d("Pesos por un dólar", "$3.900", "$4.150", "sube")],
        respuesta: ["demandaDerecha"] },
    ],
  },
  {
    id: "pc26-a3-nominal-real", oficina: "puerto",
    capacitacion: [
      "El dólar nominal es el del tablero. El real descuenta la inflación de aquí y la de afuera.",
      "Atajo: inflación de afuera menos la de aquí, más lo que se movió el nominal.",
    ],
    consigna: (n) => `¿Qué pasó con el cambio real en ${n}?`,
    opciones: [
      op("devaluacionReal", "Devaluación real", "balanza-brazo", "La suma da positiva: el exportador gana competitividad. ITCR > 1.", "+"),
      op("equilibrio", "Equilibrio", "balanza-pie", "La suma da cero: el nominal compensó justo las inflaciones. ITCR = 1.", "0"),
      op("revaluacionReal", "Revaluación real", "balanza-brazo", "La suma da negativa: el exportador pierde competitividad. ITCR < 1.", "−"),
    ],
    sugerencias: ["¿Qué es el ITCR?", "¿Por qué resta la inflación de aquí?"],
    archivo: [
      { nombre: "Informe anual de Tierra Firme", titular: "El dólar subió, pero los precios de aquí más", quien: "un analista del puerto",
        testigo: "El tablero dice que ganamos, pero los costos se comieron todo.",
        datos: [d("Inflación de aquí", "", "5 %", "dato"), d("Inflación del socio comercial", "", "1,5 %", "dato"), d("Variación del dólar nominal", "", "+2 %", "sube")],
        respuesta: ["revaluacionReal"] },
      { nombre: "Informe anual de Costa Roja", titular: "El dólar subió más que la diferencia de precios", quien: "una exportadora de flores",
        testigo: "Este año los números me dan: el dólar me ayudó de verdad.",
        datos: [d("Inflación de aquí", "", "5 %", "dato"), d("Inflación del socio comercial", "", "1,5 %", "dato"), d("Variación del dólar nominal", "", "+6 %", "sube")],
        respuesta: ["devaluacionReal"] },
    ],
  },
  {
    id: "pc26-a4-banano", oficina: "puerto",
    capacitacion: [
      "Afuera ya hay un precio en dólares. El exportador vende si puede cobrar eso o menos.",
      "Precio en dólares = costo en pesos dividido por el dólar. Tú dices si gana o pierde.",
    ],
    consigna: (n) => `¿${n} gana o pierde competitividad afuera?`,
    opciones: [
      op("gana", "Gana", "caja-bananos", "Lo que necesita cobrar en dólares queda igual o por debajo del precio de afuera.", SUBE),
      op("pierde", "Pierde", "caja-bananos", "Necesita cobrar más de lo que paga el mercado de afuera.", BAJA),
    ],
    sugerencias: ["¿Cómo paso pesos a dólares?", "¿Qué pasó con Tropical Fruits?"],
    archivo: [
      { nombre: "Bananera del Golfo", titular: "Los costos suben y el dólar casi no se mueve", quien: "el gerente de la bananera",
        testigo: "El cliente de Estados Unidos paga 680 y yo necesito pedir 693.",
        datos: [d("Costo por tonelada", "$2.127.250", "$2.233.613", "sube"), d("Pesos por un dólar", "$3.175", "$3.223", "sube"), d("Precio que paga el mercado", "US$ 670", "US$ 680", "sube")],
        respuesta: ["pierde"] },
      { nombre: "Flores La Pradera", titular: "El dólar sube y el costo queda quieto", quien: "la dueña de La Pradera",
        testigo: "Mis costos son los mismos y cada dólar me trae más pesos.",
        datos: [d("Costo por caja", "$400.000", "$400.000", "igual"), d("Pesos por un dólar", "$4.000", "$4.400", "sube"), d("Precio que paga el mercado", "US$ 100", "US$ 100", "igual")],
        respuesta: ["gana"] },
    ],
  },
  {
    id: "pc26-a5-tuberias", oficina: "puerto",
    capacitacion: [
      "El país tiene dos tuberías al exterior: una de bienes y servicios, otra de dinero. Ambas llegan a las reservas.",
      "Tú dices por cuál pasa cada operación. Ojo: no todo lo que entra se queda.",
    ],
    consigna: (n) => `¿Por qué tubería pasa la operación de ${n}?`,
    opciones: [
      op("comercial", "Bienes", "caja-bananos", "Cuenta corriente: compra o venta de bienes."),
      op("servicios", "Servicios", "globo-aerostatico", "Cuenta corriente: turismo, fletes, software."),
      op("transferencias", "Envíos de familia", "billetera", "Cuenta corriente: plata que se manda sin contraprestación."),
      op("ied", "Inversión directa", "arbol-raices", "Cuenta de capital: alguien de afuera monta una empresa y se queda."),
      op("portafolio", "Capital golondrina", "golondrina", "Cuenta de capital: acciones o bonos que entran y salen."),
      op("endeudamiento", "Préstamo de afuera", "fajo-pesos", "Cuenta de capital: una empresa o el Gobierno pide prestado afuera."),
    ],
    sugerencias: ["¿Qué es el capital golondrina?", "¿Las remesas son capital?"],
    archivo: [
      { nombre: "Fondo de Nueva York", titular: "Un fondo compra títulos por tres meses", quien: "un corredor de bolsa",
        testigo: "Vienen por la tasa alta; si sube el riesgo, se van al otro día.",
        datos: [d("Qué compra", "", "TES colombianos", "dato"), d("Plazo pensado", "", "90 días", "dato"), d("Reservas del país", "US$ 60.000 millones", "US$ 60.500 millones", "sube")],
        respuesta: ["portafolio"] },
      { nombre: "Planta de Tocancipá", titular: "Una empresa alemana construye su fábrica", quien: "la alcaldesa de Tocancipá",
        testigo: "Van a contratar a 800 personas y piensan quedarse veinte años.",
        datos: [d("Quién invierte", "", "una empresa alemana", "dato"), d("Monto", "", "US$ 300 millones", "dato"), d("Empleos", "", "800", "dato")],
        respuesta: ["ied"] },
    ],
  },
  {
    id: "pc26-a6-imanes", oficina: "puerto",
    capacitacion: [
      "La plata viaja hacia la tasa más alta, huye del riesgo y se corrige por el dólar.",
      "Lo que rinde afuera, en pesos, es la tasa de afuera más lo que se devalúe el peso.",
    ],
    consigna: (n) => `¿Dónde conviene poner la plata de ${n}?`,
    opciones: [
      op("colombia", "Aquí, en Colombia", "casa-pais", "Con la corrección del dólar, rinde más aquí (o el crédito cuesta menos aquí).", "CO"),
      op("exterior", "Afuera", "iman", "Con la corrección del dólar, rinde más afuera (o el crédito cuesta menos afuera).", "US"),
    ],
    sugerencias: ["¿Por qué importa el dólar?", "¿Qué hace el riesgo?"],
    archivo: [
      { nombre: "Ahorros de Cafetera Sur", titular: "Una devaluación grande se ve venir", quien: "el tesorero de Cafetera Sur",
        testigo: "Aquí pagan 9 %, pero si el peso pierde 12 %, afuera rinde más.",
        datos: [d("Tasa de ahorro aquí", "", "9 %", "dato"), d("Tasa de ahorro afuera", "", "4 %", "dato"), d("Devaluación esperada del peso", "", "12 %", "sube")],
        respuesta: ["exterior"] },
      { nombre: "Ahorros de Lácteos Norte", titular: "El dólar quieto y la tasa de aquí alta", quien: "la tesorera de Lácteos Norte",
        testigo: "Nadie espera que el dólar se mueva este año.",
        datos: [d("Tasa de ahorro aquí", "", "9 %", "dato"), d("Tasa de ahorro afuera", "", "4 %", "dato"), d("Devaluación esperada del peso", "", "0 %", "igual")],
        respuesta: ["colombia"] },
    ],
  },
  {
    id: "pc26-a7-correa", oficina: "puerto",
    capacitacion: [
      "El banco central pasea el dólar como a un perro: con correa corta, larga o suelto.",
      "Tú lees el año del dólar y lo que hizo el banco, y dices qué régimen tiene el país.",
    ],
    consigna: (n) => `¿Qué régimen cambiario tiene ${n}?`,
    opciones: [
      op("fijo", "Fijo", "candado", "Una sola paridad que el banco central defiende."),
      op("banda", "Banda", "cuerda", "Flota entre un techo y un piso que el banco defiende."),
      op("gotaAGota", "Gota a gota", "grifo", "Una devaluación anunciada, en pasitos continuos."),
      op("flexibleLimpia", "Flotación limpia", "globo", "Solo el mercado define el precio; el banco no interviene."),
      op("flexibleSucia", "Flotación sucia", "globo-aerostatico", "Manda el mercado, pero el banco compra o vende a veces."),
    ],
    sugerencias: ["¿Qué régimen tiene Colombia?", "¿Qué es el crawling peg?"],
    archivo: [
      { nombre: "Altiplano", titular: "Un año entero con el mismo número en el tablero", quien: "una cambista de Altiplano",
        testigo: "Enero, junio, diciembre: siempre 6,96 por dólar.",
        datos: [d("Precio del dólar en enero", "", "6,96", "dato"), d("Precio del dólar en diciembre", "6,96", "6,96", "igual"), d("Qué hizo el banco central", "", "vendió dólares para sostener el precio", "dato")],
        respuesta: ["fijo"] },
      { nombre: "Puerto Lindo", titular: "El dólar se mueve libre, pero el banco entró dos veces", quien: "un trader de Puerto Lindo",
        testigo: "El banco compró reservas en marzo y en octubre, y lo demás fue mercado.",
        datos: [d("Precio del dólar en enero", "", "$4.000", "dato"), d("Precio del dólar en diciembre", "$4.000", "$4.380", "sube"), d("Compras del banco central", "", "2 en el año", "dato")],
        respuesta: ["flexibleSucia"] },
    ],
  },
];

/* ─────────────────── Todo junto: un simulador por Aprender ─────────────────── */
function armar(s) {
  const of = OFICINAS[s.oficina];
  const capacitacion = s.capacitacion.length >= 4 ? s.capacitacion : [of.saludo, ...s.capacitacion, of.ia];
  return {
    ...of,
    ...s,
    capacitacion,
    multiple: Boolean(s.multiple),
    rondas: 3,
    empezar: "Traer el primer caso",
    preguntaRazon: "¿Por qué? (opcional)",
    placeholder: "Pregúntale algo…",
    sugerenciasIniciales: s.sugerencias,
  };
}

export const SIMULADORES = Object.fromEntries([...T1, ...T2, ...T3, ...T4, ...T5].map((s) => [s.id, armar(s)]));

export const simuladorDe = (id) => SIMULADORES[id] ?? null;

export const nombreOpcion = (sim, id) => sim.opciones.find((o) => o.id === id)?.nombre ?? id;

/* Retroalimentación sin IA (archivo): la frase de cada opción, de la fuente. */
export function explicacionLocal(sim, caso, { estado, faltan, sobran }) {
  const reales = caso.respuesta.map((id) => nombreOpcion(sim, id)).join(" y ");
  const frase = (id) => sim.opciones.find((o) => o.id === id)?.frase ?? "";
  if (estado === "acierto") return `Exacto: ${reales}. ${frase(caso.respuesta[0])}`;
  const partes = [`En ${caso.nombre} era ${reales}.`];
  if (faltan.length) partes.push(frase(faltan[0]));
  if (sobran.length) partes.push(`${sobran.map((id) => nombreOpcion(sim, id)).join(" y ")} no calza con los datos.`);
  return partes.join(" ");
}

export function veredictoLocal(reales, elegidos) {
  const r = new Set(reales);
  const e = new Set(elegidos);
  const bien = [...e].filter((x) => r.has(x));
  const faltan = [...r].filter((x) => !e.has(x));
  const sobran = [...e].filter((x) => !r.has(x));
  return { estado: !faltan.length && !sobran.length ? "acierto" : bien.length ? "parcial" : "fallo", faltan, sobran };
}
