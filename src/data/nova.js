/*
 * ═══════════════════════════════════════════════════════════════════════════
 * "EL COMITÉ DE NOVA" — contenido del desafío de Política Fiscal.
 *
 * Todo el texto de este archivo lo escribió Gen y va VERBATIM: los enunciados,
 * las retroalimentaciones de acierto y las de error. Nada se parafrasea ni se
 * resume. Si algo hay que cambiar, se cambia aquí y no en los componentes.
 *
 * ═══════════ DE DÓNDE SALE, Y QUÉ NO ES ═══════════
 *
 * Está basado en el caso "CEO por un día" del preparcial: se toman la empresa,
 * sus cifras y las medidas fiscales. NO se traduce el PDF a pantalla —los
 * estudiantes ya lo resolvieron en papel—: encima de esos datos va una
 * mecánica distinta, con preguntas nuevas.
 *
 * ═══════════ EL ANCLA ═══════════
 *
 * «El Estado solo hace tres cosas: cobra, gasta o pide prestado.» No es un
 * rótulo que se pinte aparte: está cosido dentro de las retroalimentaciones de
 * las cuatro etapas. Si alguna vez hay que reformularla, hay que reformular
 * los textos, no añadir una frase suelta al final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ────────────────────────── el estado de resultados ────────────────────────── */

/*
 * Las cifras iniciales, en millones de pesos. Son las del caso del profesor.
 *
 * GASTOS FINANCIEROS EN CERO NO ES UN HUECO. El caso lo asume (su pregunta 11
 * parte de ahí) y aquí se explicita: la línea existe, se ve apagada desde el
 * principio y la Etapa 2 tiene un momento diseñado alrededor de que despierte.
 * Es la única línea del estado que se enciende en todo el desafío.
 *
 * `derivada` marca las dos que no se tocan nunca: son restas de las otras. La
 * Etapa 2 las usa para su regla de error más frecuente —quien toca el
 * resultado en vez de la causa—.
 */
export const LINEAS = [
  { id: "ventas", rotulo: "Ventas", inicial: 10000 },
  { id: "costos", rotulo: "Costos de producción", inicial: 5800 },
  { id: "admin", rotulo: "Gastos administrativos y de ventas", inicial: 2000 },
  { id: "operacional", rotulo: "Utilidad operacional", inicial: 2200, derivada: true },
  { id: "financieros", rotulo: "Gastos financieros", inicial: 0, dormida: true },
  { id: "impuestos", rotulo: "Impuestos", inicial: 660 },
  { id: "neta", rotulo: "Utilidad neta", inicial: 1540, derivada: true },
];

/* Dos datos del caso que NO son líneas del estado y se muestran aparte. */
export const FUERA_DEL_ESTADO = [
  { id: "empleados", rotulo: "Empleados", valor: 180, formato: "entero" },
  { id: "inversion", rotulo: "Inversión proyectada", valor: 800, formato: "millones" },
];

/* Las líneas operacionales: las tres de arriba más las dos que resumen. */
export const OPERACIONALES = ["ventas", "costos", "admin"];

/*
 * EL CALENDARIO. El hilo secundario: el año fiscal avanzando de mes a mes en
 * una esquina, con las medidas llegando fechadas.
 *
 * Los meses NO son contenido de Gen: la ficha dice que las medidas llegan
 * fechadas y que la Etapa 4 salta a diciembre, así que las etapas 1 a 3
 * reparten enero–noviembre por orden de llegada. Es un reparto mecánico, no
 * una afirmación sobre el caso.
 */
export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/* ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 1 — "¿Cobra, Gasta o Pide Prestado?"
 * Subtema: Instrumentos de política fiscal
 * ═══════════════════════════════════════════════════════════════════════════ */

export const SUBTEMAS = {
  1: "Instrumentos de política fiscal",
  2: "Impacto en estados financieros",
  3: "Incidencia tributaria",
  4: "Integración y decisión empresarial",
};

export const BANDEJAS = [
  { id: "cobra", rotulo: "COBRA" },
  { id: "gasta", rotulo: "GASTA" },
  { id: "presta", rotulo: "PIDE PRESTADO" },
];

/* Banco de 14; se sortean 8 por intento. */
export const COMUNICADOS = [
  {
    id: "c01",
    texto: "El Gobierno sube la tarifa del impuesto sobre las utilidades empresariales.",
    bandeja: "cobra",
    acierto: "✅ Cobra — un impuesto es plata que entra al Estado. Recuerda: el Estado solo cobra, gasta o pide prestado.",
  },
  {
    id: "c02",
    texto: "El Gobierno crea una deducción tributaria para las empresas que inviertan en maquinaria.",
    bandeja: "cobra",
    acierto: "✅ Cobra — y esta confunde: una deducción sigue siendo tributación, solo que el Estado decide cobrar menos. Cobrar menos es una decisión de cobro, no de gasto.",
    /* Error propio: la confusión de esta medida no es de dirección del dinero. */
    error: "❌ Es tentador marcarla como Gasta porque suena a un beneficio, pero el Estado no está desembolsando nada: está renunciando a cobrar. Eso vive en la caja de Cobra.",
  },
  {
    id: "c03",
    texto: "El Gobierno sube el impoconsumo de ciertos bienes del hogar.",
    bandeja: "cobra",
    acierto: "✅ Cobra — impuesto indirecto: se cobra sobre el consumo, no sobre el ingreso.",
  },
  {
    id: "c04",
    texto: "El Gobierno sube las contribuciones asociadas a la contratación formal.",
    bandeja: "cobra",
    acierto: "✅ Cobra — las contribuciones son una de las cuatro formas de tributación, junto con impuestos directos, indirectos y tasas.",
  },
  {
    id: "c05",
    texto: "El Gobierno crea un impuesto a las empresas que superen cierto nivel de contaminación.",
    bandeja: "cobra",
    acierto: "✅ Cobra — aunque su propósito sea ambiental y no recaudatorio, el mecanismo sigue siendo cobrar.",
  },
  {
    id: "c06",
    texto: "El Gobierno arranca un programa de construcción de carreteras.",
    bandeja: "gasta",
    acierto: "✅ Gasta — gasto de inversión: el Estado construye algo nuevo que antes no existía.",
  },
  {
    id: "c07",
    texto: "El Gobierno aumenta las transferencias monetarias a hogares de menores ingresos.",
    bandeja: "gasta",
    acierto: "✅ Gasta — el Estado desembolsa. Ojo: quien después gasta esa plata es la familia, no el Estado.",
  },
  {
    id: "c08",
    texto: "El Gobierno lanza un programa de compras de productos nacionales a pymes.",
    bandeja: "gasta",
    acierto: "✅ Gasta — el Estado sale a comprar. Para NOVA eso lo convierte en un cliente, no en un recaudador.",
  },
  {
    id: "c09",
    texto: "El Gobierno aumenta el presupuesto de formación técnica y capacitación laboral.",
    bandeja: "gasta",
    acierto: "✅ Gasta — gasto de inversión en capital humano. Su efecto tarda años, pero sigue siendo gasto.",
  },
  {
    id: "c10",
    texto: "El Gobierno crea un fondo para cofinanciar proyectos de digitalización empresarial.",
    bandeja: "gasta",
    acierto: "✅ Gasta — cofinanciar es poner plata. El Estado desembolsa, aunque la empresa ponga la otra mitad.",
  },
  {
    id: "c11",
    texto: "El Gobierno emite TES por $20 billones para financiar su déficit.",
    bandeja: "presta",
    acierto: "✅ Pide prestado — deuda interna: le presta alguien dentro del país.",
  },
  {
    id: "c12",
    texto: "El Gobierno toma un crédito con el BID para financiar obras de infraestructura.",
    bandeja: "presta",
    acierto: "✅ Pide prestado — deuda externa. Ojo con la trampa: la obra es gasto, pero el comunicado habla de cómo consiguió la plata.",
    error: "❌ El comunicado habla de cómo consiguió la plata, no de en qué la gastó. Consiguió un crédito: eso es pedir prestado.",
  },
  {
    id: "c13",
    texto: "El aumento del endeudamiento público presiona al alza las tasas de interés del mercado.",
    bandeja: "presta",
    acierto: "✅ Pide prestado — y aquí está el más difícil de ver: el Estado no le cobró nada a NOVA ni le dio nada, pero al competir por la plata del mercado le encareció el crédito a todo el mundo.",
  },
  {
    id: "c14",
    texto: "El Gobierno refinancia deuda vieja tomando un crédito nuevo.",
    bandeja: "presta",
    acierto: "✅ Pide prestado — refinanciar es volver a pedir prestado para pagar lo que ya debía.",
  },
];

/*
 * El error por confusión, cuando el comunicado no trae uno propio.
 *
 * Las claves son `correcta>elegida`. Las seis combinaciones posibles están
 * cubiertas —tres bandejas, dos errores cada una—, y hay una prueba que las
 * enumera para que añadir una bandeja no deje huecos en silencio.
 */
export const ERROR_BANDEJA = {
  "cobra>gasta": "❌ Fíjate en la dirección de la plata: aquí el dinero va HACIA el Estado, no sale de él. Eso es cobrar.",
  "gasta>cobra": "❌ Fíjate en la dirección: aquí el Estado está desembolsando, no recaudando. Eso es gastar.",
  "cobra>presta": "❌ Pedir prestado es cuando el Estado consigue plata que va a tener que devolver. Aquí no hay nada que devolver — revisa si el dinero entra (cobra) o sale (gasta).",
  "gasta>presta": "❌ Pedir prestado es cuando el Estado consigue plata que va a tener que devolver. Aquí no hay nada que devolver — revisa si el dinero entra (cobra) o sale (gasta).",
  "presta>cobra": "❌ Aquí el Estado no le cobró a nadie ni le dio a nadie: consiguió plata prestada que tendrá que devolver con intereses. Esa es la tercera caja, la que menos se ve.",
  "presta>gasta": "❌ Aquí el Estado no le cobró a nadie ni le dio a nadie: consiguió plata prestada que tendrá que devolver con intereses. Esa es la tercera caja, la que menos se ve.",
};

/** El texto de error de un comunicado: el suyo propio si lo tiene, si no el del patrón. */
export function errorDeComunicado(comunicado, elegida) {
  if (comunicado.error) return comunicado.error;
  return ERROR_BANDEJA[`${comunicado.bandeja}>${elegida}`] ?? null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 2 — "La Línea que se Mueve"
 * Subtema: Impacto de la política fiscal en los estados financieros
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Banco de 12; se sortean 8 por intento. */
export const MEDIDAS_LINEA = [
  {
    id: "l01",
    texto: "Sube la tarifa del impuesto sobre las utilidades.",
    linea: "impuestos",
    acierto: "✅ Impuestos. La utilidad operacional no cambia — NOVA vende y produce igual. Lo que cambia es cuánto de esa utilidad se queda el Estado, y por eso la utilidad neta cae después.",
  },
  {
    id: "l02",
    texto: "Sube el impoconsumo de los bienes del hogar que fabrica NOVA.",
    linea: "ventas",
    acierto: "✅ Ventas. El producto le sale más caro al comprador, se vende menos, y eso golpea arriba del todo — no en la línea de impuestos, que es donde casi todos buscan primero.",
  },
  {
    id: "l03",
    texto: "Suben las contribuciones sobre la contratación formal.",
    linea: "costos",
    acierto: "✅ Costos de producción. Los 180 empleados de planta cuestan más cada mes, y eso vive en el costo de producir, antes de llegar a la utilidad.",
  },
  {
    id: "l04",
    texto: "Nuevo impuesto a las empresas que superan cierto nivel de contaminación. NOVA tiene maquinaria antigua de alto consumo energético.",
    linea: "costos",
    acierto: "✅ Costos de producción. Es un costo de operar la planta, no un impuesto sobre las utilidades — se paga aunque NOVA no gane un peso.",
  },
  {
    id: "l05",
    texto: "El Gobierno aumenta las transferencias a hogares de menores ingresos.",
    linea: "ventas",
    acierto: "✅ Ventas. Esas familias compran productos para el hogar, que es justo lo que NOVA fabrica. El Gobierno le puso plata en el bolsillo a los clientes de NOVA.",
  },
  {
    id: "l06",
    texto: "El Gobierno lanza un programa de compras a pymes nacionales y NOVA califica.",
    linea: "ventas",
    acierto: "✅ Ventas. El Estado se convirtió en cliente. Aparece un ingreso que antes no existía.",
  },
  {
    id: "l07",
    texto: "Se crea una deducción tributaria para quien invierta en maquinaria.",
    linea: "impuestos",
    acierto: "✅ Impuestos. La deducción no le regala plata a NOVA: le reduce la base sobre la que calcula lo que debe pagar.",
  },
  {
    id: "l08",
    texto: "El endeudamiento público presiona las tasas y el banco de NOVA encarece sus créditos nuevos.",
    linea: "financieros",
    acierto: "✅ Gastos financieros — la línea que estaba en cero y acaba de despertar. El Gobierno no le cobró nada a NOVA: le encareció el dinero. Y fíjate dónde pega: debajo de la utilidad operacional, así que NOVA puede operar igual de bien y aun así ganar menos.",
  },
  {
    id: "l09",
    texto: "Gran programa de construcción de carreteras cerca de las plantas de NOVA.",
    linea: "costos",
    acierto: "✅ Costos de producción. Mover insumos y producto terminado cuesta menos cuando la vía mejora.",
  },
  {
    id: "l10",
    texto: "El Gobierno aumenta el gasto en formación técnica. Dos años después, NOVA contrata personal mejor capacitado.",
    linea: "costos",
    acierto: "✅ Costos de producción. Personal más productivo produce lo mismo con menos horas o menos desperdicio. Ojo con el plazo: esta es la única medida del banco cuyo efecto tarda años.",
  },
  {
    id: "l11",
    texto: "NOVA gana la cofinanciación de un proyecto de automatización.",
    linea: "costos",
    acierto: "✅ Costos de producción. Automatizar baja el costo unitario de producir. El desembolso del fondo es inversión, no ingreso operacional.",
  },
  {
    id: "l12",
    texto: "Baja la tarifa del impuesto sobre las utilidades.",
    linea: "impuestos",
    acierto: "✅ Impuestos. Espejo de la primera: la operación no cambia, cambia cuánto se queda el Estado.",
  },
];

/*
 * Las seis reglas de error de la Etapa 2, EN ORDEN: gana la primera que case.
 * El orden es el de la ficha y no es indiferente —las dos primeras son «tocó
 * un resultado en vez de una causa» y tienen que ganarle a las de confusión
 * entre causas—.
 *
 * DEVUELVE null CUANDO NINGUNA CASA, a propósito. Hay combinaciones de
 * (línea correcta, línea tocada) que la ficha no cubre; están enumeradas en
 * `SIN_ERROR_ESCRITO` más abajo y las tiene que escribir Gen. Inventarles un
 * texto sería ponerle palabras de pedagogía a quien no las escribió.
 */
export const REGLAS_ERROR_LINEA = [
  {
    id: "neta",
    casa: ({ elegida }) => elegida === "neta",
    texto: "❌ La utilidad neta es el resultado, no la causa. Siempre se mueve al final. Busca la línea que se mueve primero y arrastra a las demás.",
  },
  {
    id: "operacional",
    casa: ({ elegida }) => elegida === "operacional",
    texto: "❌ La utilidad operacional tampoco se mueve sola: es una resta de las tres líneas de arriba. Busca cuál de esas tres cambió.",
  },
  {
    id: "impuestos-por-ventas",
    casa: ({ elegida, correcta }) => elegida === "impuestos" && correcta === "ventas",
    texto: "❌ Es la confusión más común: no toda medida fiscal pega en la línea de impuestos. Esta cambia cuánto compra la gente, y eso vive arriba, en Ventas.",
  },
  {
    id: "ventas-por-costos",
    casa: ({ elegida, correcta }) => elegida === "ventas" && correcta === "costos",
    texto: "❌ NOVA sigue vendiendo lo mismo. Lo que cambió es cuánto le cuesta fabricarlo.",
  },
  {
    id: "costos-por-impuestos",
    casa: ({ elegida, correcta }) => elegida === "costos" && correcta === "impuestos",
    texto: "❌ Producir cuesta igual que ayer. Lo que cambió es el pedazo que se lleva el Estado de la utilidad ya calculada.",
  },
  {
    id: "operacional-por-financieros",
    casa: ({ elegida, correcta }) => correcta === "financieros" && OPERACIONALES.includes(elegida),
    texto: "❌ Esta medida no toca la operación: NOVA vende, produce y administra exactamente igual. Lo que cambió es lo que cuesta el dinero prestado, y eso tiene su propia línea debajo de la utilidad operacional.",
  },
];

/** El error de la Etapa 2, o null si la ficha no lo cubre. */
export function errorDeLinea(correcta, elegida) {
  return REGLAS_ERROR_LINEA.find((r) => r.casa({ correcta, elegida }))?.texto ?? null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 3 — "¿Quién Termina Pagando?"
 * Subtema: Incidencia tributaria — estatutaria vs. económica
 * ═══════════════════════════════════════════════════════════════════════════ */

/*
 * Las cinco opciones, siempre las cinco, en todas las medidas.
 *
 * «NADIE» ESTÁ SIEMPRE, y es una regla estructural, no una comodidad: si solo
 * apareciera en M5 y M6 —las dos en que es la respuesta— su sola presencia
 * delataría la respuesta antes de leer la medida.
 *
 * «NOVA» NUNCA ES LA RESPUESTA DE LA SEGUNDA PREGUNTA, en ninguna medida. Una
 * empresa no tiene bolsillo propio, y ese es justamente el punto de la etapa.
 * Hay una prueba que lo comprueba sobre el banco entero.
 */
export const PERSONAS = [
  { id: "nova", rotulo: "NOVA" },
  { id: "consumidor", rotulo: "El consumidor" },
  { id: "trabajador", rotulo: "El trabajador" },
  { id: "dueno", rotulo: "El dueño de NOVA" },
  { id: "nadie", rotulo: "Nadie" },
];

export const PREGUNTA_GIRA = "¿Quién le gira esta plata al Gobierno?";
export const PREGUNTA_SOPORTA = "¿Y quién termina con menos plata en el bolsillo?";

/*
 * PENDIENTE DE GEN. M5 es una deducción: nadie termina con MENOS plata, alguien
 * termina con más. La ficha rotula su segunda pregunta «Se beneficia más» pero
 * no trae el enunciado escrito, así que este lo redacté yo a partir de ese
 * rótulo y va marcado para revisión. Las otras cinco medidas usan el enunciado
 * de Gen sin tocar.
 */
export const PREGUNTA_BENEFICIA = "¿Y quién se beneficia más?";

/* Los cuatro patrones de error de la PRIMERA pregunta (solo M1–M4). */
export const PATRONES_GIRA = {
  A: "❌ No te equivocaste de persona: te equivocaste de pregunta. Esa es la respuesta de la siguiente — quién termina con menos plata. Aquí te pregunto quién le gira el cheque al Gobierno, que es una obligación legal, y casi nunca son la misma persona.",
  B: "❌ Cerca, pero la obligación legal es de NOVA, no de su dueño. La empresa es una persona jurídica aparte: ella declara, ella gira y ella responde ante el Estado. El dueño aparece en la pregunta siguiente, cuando toca ver de qué bolsillo salió la plata.",
  C: "❌ Esa persona no tiene ninguna obligación legal con el Estado por esta medida. Piénsalo bien concreto: ¿quién llena el formulario y gira el dinero? Eso es la incidencia estatutaria.",
  D: "❌ Aquí sí hay un impuesto y alguien está legalmente obligado a girarlo. 'Nadie' es la respuesta cuando el Estado no está cobrando nada — y este no es el caso.",
};

/* Los dos patrones de la SEGUNDA pregunta, que sí aplican a las seis medidas. */
export const PATRONES_SOPORTA = {
  E: "❌ NOVA es una empresa, y una empresa no tiene bolsillo propio. Toda carga que recae sobre ella termina en alguien de carne y hueso: sus dueños, sus clientes, sus proveedores o sus trabajadores. Solo las personas pagan impuestos — por eso 'NOVA' nunca es la respuesta de esta pregunta.",
  F: "❌ El dinero no desaparece. Si alguien lo giró, a alguien le hizo falta. La pregunta es de quién.",
};

/*
 * Banco de 6; se sortean 4 por intento (8 preguntas).
 *
 * `propios: true` en una pregunta significa que esa medida NO usa los patrones
 * A–D: trae su texto para cada opción equivocada. Es el caso de M5 y M6, donde
 * la respuesta correcta es «Nadie» y los patrones dirían lo contrario.
 */
export const MEDIDAS_INCIDENCIA = [
  {
    id: "m1",
    titulo: "Impoconsumo sobre los productos del hogar de NOVA",
    gira: {
      correcta: "nova",
      acierto: "✅ NOVA. Ella lo recauda en la factura y lo gira al Estado. Eso se llama incidencia estatutaria: quién está legalmente obligado.",
    },
    soporta: {
      correcta: "consumidor",
      acierto: "✅ El consumidor. NOVA sube el precio y traslada el impuesto. Ella solo fue el cajero; quien terminó con menos plata fue quien compró. Esto se llama incidencia económica — y casi nunca coincide con la estatutaria.",
      errores: {
        trabajador: "❌ El trabajador de NOVA no compra necesariamente el producto. Este impuesto viaja por el precio, así que cae sobre quien compra.",
        dueno: "❌ Algo sí le llega al dueño, porque NOVA rara vez logra trasladar el 100% del impuesto. Pero la mayor parte la soporta el consumidor, y la razón es concreta: los productos del hogar son de los que la gente sigue comprando aunque suban de precio. Cuando el comprador no se puede ir a otro lado, es el comprador quien carga con el impuesto.",
      },
    },
  },
  {
    id: "m2",
    titulo: "Contribuciones sobre la nómina de los 180 empleados",
    gira: {
      correcta: "nova",
      acierto: "✅ NOVA, como empleador, es quien gira.",
    },
    soporta: {
      correcta: "trabajador",
      acierto: "✅ El trabajador — y es contraintuitivo. NOVA compensa el mayor costo laboral dando aumentos más pequeños o contratando menos. La plata sale del bolsillo del trabajador aunque él nunca vea ese descuento en su desprendible.",
      errores: {
        consumidor: "❌ Puede que algo se traslade al precio, pero la mayor parte de un impuesto a la nómina termina en el salario, vía aumentos futuros más pequeños. Es el hallazgo más consistente de la literatura sobre incidencia.",
        dueno: "❌ En el primer momento sí, y tiene lógica: el costo de nómina sube, la utilidad baja, tal como lo acabas de ver en el estado de resultados. Pero ahí no termina. NOVA ajusta lo que puede ajustar, y lo que ajusta son los aumentos salariales de los años siguientes. El dueño absorbe el golpe de este año; el trabajador lo termina pagando en todos los que vienen.",
      },
    },
  },
  {
    id: "m3",
    titulo: "Impuesto sobre las utilidades empresariales",
    gira: {
      correcta: "nova",
      acierto: "✅ NOVA gira el cheque.",
    },
    soporta: {
      correcta: "dueno",
      acierto: "✅ El dueño. Con la operación igual, el impuesto sale directo de la utilidad neta, que es lo que le queda al accionista. Matiz de experto: Harberger mostró que en el largo plazo parte puede trasladarse a trabajadores y consumidores — pero el primer golpe lo recibe el dueño.",
      errores: {
        consumidor: "❌ NOVA no puede subir el precio solo porque le subieron el impuesto a las utilidades: sus competidores enfrentan lo mismo, pero el que suba primero pierde ventas. En el corto plazo esto sale de la utilidad.",
        trabajador: "❌ No es descabellado, y de hecho es exactamente lo que mostró Harberger: en el largo plazo parte de este impuesto sí termina en salarios más bajos y precios más altos. Pero te pregunté por quién soporta la MAYOR parte, y el primer golpe —directo, inmediato y medible— está en la utilidad neta, que es la línea que le pertenece al dueño. Vas adelantado, no equivocado.",
      },
    },
  },
  {
    id: "m4",
    titulo: "Impuesto a la contaminación, con NOVA usando maquinaria antigua",
    gira: {
      correcta: "nova",
      acierto: "✅ NOVA es la contaminante y la obligada.",
    },
    soporta: {
      correcta: "dueno",
      acierto: "✅ El dueño, y es la excepción del set. ¿Por qué NOVA no lo traslada al precio? Porque sus competidores con maquinaria moderna no pagan este impuesto: si NOVA sube el precio, les regala el mercado. Cuando la competencia no comparte tu costo, no hay a quién trasladarlo.",
      errores: {
        consumidor: "❌ Aquí no se puede trasladar. El impuesto solo lo paga quien contamina, así que los competidores limpios mantienen su precio. Subirlo sería entregarles las ventas.",
        trabajador: "❌ Podría pasar si NOVA recorta nómina para compensar, pero el golpe inmediato está en el costo de producción y de ahí sale de la utilidad del dueño.",
      },
    },
  },
  {
    id: "m5",
    titulo: "Deducción tributaria por invertir en maquinaria",
    gira: {
      correcta: "nadie",
      propios: true,
      acierto: "✅ Nadie gira nada. El Estado no desembolsa ni recauda: renuncia a cobrar una parte de lo que iba a cobrar. Por eso una deducción vive en la caja de COBRA y no en la de GASTA — es una decisión sobre cuánto cobrar, no sobre cuánto dar.",
      errores: {
        nova: "❌ NOVA sí le gira impuestos al Estado, pero te pregunté por ESTA plata: la de la deducción. Esa es plata que se queda en NOVA, justamente porque el Estado decidió no cobrarla. No hay giro.",
        consumidor: "❌ El consumidor no tiene nada que ver con esta medida: es un beneficio tributario entre el Estado y la empresa que invierte.",
        trabajador: "❌ El trabajador no participa en esta medida. Es un acuerdo entre el Estado y la empresa que invierte.",
        dueno: "❌ El dueño se beneficia de la deducción, pero no gira nada por ella. Aquí nadie gira: el Estado simplemente cobra menos.",
      },
    },
    soporta: {
      /* La única cuyo enunciado cambia: aquí se beneficia, no se soporta. */
      pregunta: "beneficia",
      correcta: "dueno",
      acierto: "✅ El dueño, vía mayor utilidad neta — pero solo si NOVA efectivamente invierte. Una deducción que no se usa no vale absolutamente nada.",
      errores: {
        consumidor: "❌ La deducción no baja el precio del producto: baja el impuesto que paga NOVA. El beneficio se queda dentro de la empresa.",
        trabajador: "❌ Puede que a la larga la maquinaria nueva traiga más empleo, pero el beneficio directo e inmediato de la deducción es del dueño, vía utilidad neta.",
      },
    },
  },
  {
    id: "m6",
    titulo: "Aumento de las tasas de interés por el endeudamiento público",
    gira: {
      correcta: "nadie",
      propios: true,
      acierto: "✅ Nadie, y esta es la trampa del set. Aquí no hay impuesto, no hay obligación legal, no hay formulario: el Gobierno salió a pedir prestado, compitió por la plata del mercado y encareció el crédito para todos. Cobra, gasta o pide prestado — esta es de la tercera caja, la que casi nunca se ve.",
      errores: {
        nova: "❌ NOVA va a pagar más intereses, pero se los paga a su banco, no al Gobierno. Aquí no hay ningún giro al Estado: no es un impuesto, es el precio del dinero que subió.",
        consumidor: "❌ El consumidor no le gira nada al Estado por esta medida. De hecho nadie lo hace — el Gobierno no cobró, pidió prestado.",
        trabajador: "❌ El trabajador no le gira nada al Estado por esta medida. Aquí no hubo cobro: hubo endeudamiento.",
        dueno: "❌ El dueño verá menos utilidad por los intereses más caros, pero eso no es un giro al Estado. No hay impuesto de por medio.",
      },
    },
    soporta: {
      correcta: "dueno",
      acierto: "✅ El dueño, vía mayores gastos financieros que se comen la utilidad neta. Y no tiene a quién trasladárselo: sus competidores enfrentan el mismo crédito caro, pero eso no le devuelve el margen a nadie.",
      errores: {
        consumidor: "❌ NOVA no puede subir el precio para cubrir sus intereses: sus competidores están igual de apretados, y el que suba primero pierde ventas.",
        trabajador: "❌ Podría pasar si NOVA recorta nómina, pero el golpe directo e inmediato está en la línea de gastos financieros, y esa sale de la utilidad del dueño.",
      },
    },
  },
];

/**
 * El texto de error de la PRIMERA pregunta de una medida.
 *
 * Con `propios`, el de su tabla. Sin él, el patrón que corresponda, resuelto en
 * este orden: adelantarse a la incidencia económica (A) gana a confundir la
 * empresa con su dueño (B), porque cuando el dueño ES la respuesta de la
 * segunda, el estudiante se adelantó, no se confundió de persona jurídica.
 */
export function errorGira(medida, elegida) {
  const { gira, soporta } = medida;
  if (gira.propios) return gira.errores?.[elegida] ?? null;
  if (elegida === soporta.correcta) return PATRONES_GIRA.A;
  if (elegida === "dueno") return PATRONES_GIRA.B;
  if (elegida === "nadie") return PATRONES_GIRA.D;
  return PATRONES_GIRA.C;
}

/** El texto de error de la SEGUNDA pregunta. NOVA y Nadie son patrón; el resto, propio. */
export function errorSoporta(medida, elegida) {
  if (elegida === "nova") return PATRONES_SOPORTA.E;
  if (elegida === "nadie") return PATRONES_SOPORTA.F;
  return medida.soporta.errores?.[elegida] ?? null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 4 — "La Decisión del Comité"
 * Subtema: Integración — decisión empresarial ante un paquete fiscal
 * ═══════════════════════════════════════════════════════════════════════════ */

/*
 * Banco de 2 escenarios; se sortea 1. Tres decisiones encadenadas, cada una
 * calificada por separado: ninguna sola carga el peso de la etapa.
 *
 * `pct` es el crédito de cada opción, de 0 a 100. Hay parciales a propósito —
 * una jugada que funciona pero es cara no vale lo mismo que la buena ni lo
 * mismo que la mala—.
 */
export const ESCENARIOS = [
  {
    id: "a",
    titulo: "El paquete de fin de año",
    caso: "El Gobierno anuncia el mismo día: (1) la tarifa del impuesto sobre utilidades sube del 30% al 35%; (2) se crea una deducción para quien invierta en maquinaria antes de cerrar el año; (3) el endeudamiento público presiona las tasas y el banco de NOVA anuncia créditos más caros. NOVA tenía proyectada una inversión de $800 millones y cerró con utilidad neta de $1.540 millones.",
    decisiones: [
      {
        id: "a1",
        pregunta: "¿Se hace la inversión?",
        opciones: [
          { id: "si", texto: "Sí, este año", pct: 100, feedback: "✅ Correcto. La deducción vale MÁS ahora que subió la tarifa: cada peso deducido ahora ahorra 35 centavos en vez de 30. La medida que parecía mala hizo más atractiva a la otra." },
          { id: "no", texto: "No, se cancela", pct: 0, feedback: "❌ Cancelar deja sobre la mesa una deducción que justo ahora vale más que nunca, y no resuelve el aumento de la tarifa: NOVA pagaría 35% sobre una utilidad sin deducir." },
          { id: "pospone", texto: "Se pospone un año", pct: 25, feedback: "🟡 Prudente, pero la deducción está atada a invertir antes de cerrar el año. Posponer es renunciar a ella sin ninguna garantía de que vuelva." },
        ],
      },
      {
        id: "a2",
        pregunta: "¿Con qué se financia?",
        opciones: [
          { id: "propios", texto: "Con recursos propios", pct: 100, feedback: "✅ Correcto. La utilidad neta de $1.540 millones cubre los $800 de sobra, y así NOVA esquiva por completo el tercer comunicado. Leer las tres medidas juntas es lo que permite ver esto." },
          { id: "credito", texto: "Con crédito bancario", pct: 50, feedback: "🟡 Se logra la inversión y la deducción, pero se paga el crédito justo cuando acaba de encarecerse. Funciona, pero es la versión cara de la misma jugada." },
          { id: "mitad", texto: "Mitad y mitad", pct: 60, feedback: "🟡 Mejor que todo a crédito, pero sigue pagando tasas altas por una plata que NOVA ya tenía." },
        ],
      },
      {
        id: "a3",
        pregunta: "¿Qué pasa con la utilidad neta al cierre?",
        opciones: [
          { id: "sube", texto: "Sube frente al año anterior", pct: 25, feedback: "🟡 La deducción ayuda, pero no alcanza a compensar cinco puntos más de tarifa sobre toda la utilidad." },
          { id: "baja-menos", texto: "Baja, pero menos de lo que habría bajado sin invertir", pct: 100, feedback: "✅ Correcto, y es la lectura fina: la utilidad neta cae porque la tarifa subió, pero la deducción amortigua el golpe. El comité no evitó la caída — la hizo más pequeña. Eso es lo que hace un comité directivo." },
          { id: "baja-igual", texto: "Baja exactamente igual que sin invertir", pct: 0, feedback: "❌ Eso sería cierto solo si la deducción no existiera. Invertir cambió la base sobre la que se calcula el impuesto." },
          { id: "igual", texto: "Se mantiene igual", pct: 0, feedback: "❌ Subir la tarifa del 30% al 35% sobre una utilidad de más de $2.000 millones no pasa desapercibido." },
        ],
      },
    ],
  },
  {
    id: "b",
    titulo: "El año de la demanda",
    caso: "El Gobierno anuncia el mismo día: (1) suben las transferencias monetarias a hogares de menores ingresos; (2) sube el impoconsumo sobre bienes del hogar; (3) arranca un programa de compras públicas a pymes nacionales y NOVA califica. NOVA fabrica productos para el hogar y vendió $10.000 millones.",
    decisiones: [
      {
        id: "b1",
        pregunta: "¿Qué pasa con las ventas de NOVA?",
        opciones: [
          { id: "suben", texto: "Suben con seguridad", pct: 25, feedback: "🟡 Dos medidas empujan hacia arriba (transferencias y compras públicas) pero una empuja hacia abajo (impoconsumo). Afirmar que suben con seguridad es ignorar la tercera." },
          { id: "bajan", texto: "Bajan con seguridad", pct: 0, feedback: "❌ Eso solo mira el impoconsumo e ignora que el Gobierno acaba de ponerle plata en el bolsillo a los clientes de NOVA y de convertirse él mismo en cliente." },
          { id: "no-se-sabe", texto: "No se puede saber sin más datos: hay fuerzas en las dos direcciones", pct: 100, feedback: "✅ Correcto. Transferencias y compras públicas empujan las ventas hacia arriba; el impoconsumo las empuja hacia abajo. Sin saber la magnitud de cada una, afirmar una dirección sería adivinar." },
        ],
      },
      {
        id: "b2",
        pregunta: "¿Cuánto del impoconsumo traslada NOVA al precio?",
        opciones: [
          { id: "todo", texto: "Todo: se sube el precio el monto completo del impuesto", pct: 50, feedback: "🟡 Es lo que NOVA querría, pero trasladarlo entero suele costar ventas. Rara vez se puede pasar el 100% sin perder clientes." },
          { id: "parte", texto: "Una parte: se sube el precio, pero NOVA absorbe el resto en su margen", pct: 100, feedback: "✅ Correcto. Es el reparto típico: el consumidor soporta una parte vía precio y NOVA otra vía margen. La proporción depende de qué tan dispuesto esté el cliente a dejar de comprar." },
          { id: "nada", texto: "Nada: NOVA lo absorbe completo", pct: 25, feedback: "🟡 Posible si la competencia es feroz, pero absorber el impuesto entero con un margen operacional del 22% es insostenible." },
        ],
      },
      {
        id: "b3",
        pregunta: "¿Qué riesgo aparece si NOVA se vuelve un proveedor grande del Estado?",
        opciones: [
          { id: "ninguno", texto: "Ninguno: un cliente que siempre paga es solo bueno", pct: 0, feedback: "❌ Un cliente que concentra buena parte de las ventas es poder de negociación en su contra, no una garantía." },
          { id: "dependencia", texto: "Dependencia: si el programa se acaba o cambia el gobierno, NOVA pierde de golpe una porción grande de sus ventas", pct: 100, feedback: "✅ Correcto. Un programa público depende de un presupuesto anual y de una decisión política. NOVA estaría atando una parte de sus ingresos a algo que no controla y que puede desaparecer en un cambio de gobierno." },
          { id: "tarde", texto: "Que el Estado pague tarde", pct: 50, feedback: "🟡 Es un riesgo real de caja, pero es manejable. El riesgo grande es estructural: depender de un cliente que puede desaparecer por decisión política." },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * EL CIERRE — "El año que sí pasó"
 * ═══════════════════════════════════════════════════════════════════════════ */

export const TITULO_CIERRE = "El año que sí pasó";
export const ROTULO_SIN_COMITE = "NOVA si el comité no hubiera hecho nada";
export const ROTULO_CON_COMITE = "NOVA con las decisiones de tu comité";

export const TEXTO_CIERRE =
  "El Gobierno no decidió el resultado de NOVA. Decidió las condiciones. Lo que ves a la derecha lo decidió el comité — y todo lo que el Gobierno hizo durante el año cabe en tres cajas: cobró, gastó y pidió prestado.";

/*
 * ═══════════ LO QUE FALTA PARA QUE EL CIERRE SEA NUMÉRICO ═══════════
 *
 * El cierre compara dos estados de resultados: el del año sin comité y el del
 * año con las decisiones del comité. Para calcularlos hacen falta magnitudes
 * que la ficha NO trae, y están enumeradas aquí en vez de inventadas:
 *
 *   ESCENARIO A. La tarifa sí está (30% → 35%) y la inversión también ($800),
 *   pero falta CUÁNTO deduce la deducción. Si dedujera los $800 completos, la
 *   utilidad neta SUBIRÍA a $1.710 y eso contradice la respuesta correcta de
 *   la decisión 3 —«baja, pero menos de lo que habría bajado sin invertir»—,
 *   que es texto de Gen y manda. Así que la deducción es una fracción de la
 *   inversión y esa fracción nadie la ha fijado.
 *
 *   ESCENARIO B. No hay ninguna magnitud: ni cuánto suben las transferencias,
 *   ni cuánto cae la venta por el impoconsumo, ni cuánto compra el Estado. Y
 *   la respuesta correcta de su decisión 1 es, literalmente, «no se puede
 *   saber sin más datos»: ponerle cifras al cierre de B contradiría lo que la
 *   propia etapa acaba de enseñar.
 *
 * MIENTRAS TANTO el cierre se muestra sin cifras inventadas: las dos columnas
 * enseñan el estado tal como quedó y la lista de lo que el comité decidió,
 * con el texto fijo de Gen. En cuanto lleguen las magnitudes, se rellenan aquí
 * y el componente ya sabe pintarlas.
 */
export const MAGNITUDES_PENDIENTES = {
  a: ["fracción de la inversión que la deducción permite deducir"],
  b: [
    "cuánto suben las ventas por las transferencias",
    "cuánto bajan por el impoconsumo",
    "cuánto compra el programa de compras públicas",
  ],
};
