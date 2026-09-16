/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA FISCAL — "La Tesorería Nacional". Los bancos de los siete juegos.
 *
 * Fuente: el PPTX del profesor. Las tres citas de prensa —la reforma
 * tributaria, los $17,1 billones en beneficios tributarios y el $1 billón
 * adicional a Mi Casa Ya— y la taxonomía de las tarjetas son suyas. Aquí no
 * hay ni una cifra más que esas.
 *
 * Todo el texto que ve el estudiante vive en este archivo y no en los
 * componentes: el panel docente lee de aquí los enunciados (etiquetasItem.js)
 * y las pruebas comprueban los bancos sin montar ninguna pantalla.
 *
 * ═══════════ LA PUNTUACIÓN: (aciertos / total) × 100, SIN REDONDEOS EN MEDIO ═══════════
 *
 * Tres de estos juegos repetirían la trampa ya arreglada en
 * corriente-titulares si se escribiera un porcentaje por ítem: 12 × 8,33 %
 * suma 99,96 y 3 × 33,3 % suma 99,9, así que el 100 % sería inalcanzable. No
 * se escribe ninguno: el porcentaje sale de una división al final, y el único
 * redondeo es el del motor de FP al guardar. Lo prueba politicaFiscal.test.mjs.
 *
 * ═══════════ LA DISTINCIÓN QUE ESTE TEMA TIENE QUE DEJAR CLARA ═══════════
 *
 * "Bono del Tesoro" sale en dos cajas distintas y las dos están bien: EMITIR
 * un bono —contraer la deuda— es Deuda Pública; PAGAR SUS INTERESES —atender
 * esa deuda— es Gasto del Gobierno. Un estudiante atento lo verá como una
 * contradicción si nadie se lo dice, así que la devolución lo dice en los dos
 * juegos donde aparece: el 1 (ítem 7) y el 7 (los intereses del crédito del
 * BID). El texto es uno solo, DEUDA_VS_SERVICIO, para que no puedan decir
 * cosas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** El porcentaje de un juego. Una división, sin redondear: el motor redondea una vez al guardar. */
export const porcentaje = (aciertos, total) => (total > 0 ? (aciertos / total) * 100 : 0);

/* ─────────────────────────── los tres instrumentos ─────────────────────────── */

export const INSTRUMENTOS = [
  /* `describe` va en minúscula inicial porque se escribe detrás de "El recaudador: …". "Estado", con mayúscula: es la institución. */
  { id: "tributacion", nombre: "Tributación", mecanismo: "El recaudador", describe: "lo que el Estado cobra." },
  { id: "gasto", nombre: "Gasto del Gobierno", mecanismo: "El distribuidor", describe: "lo que el Estado paga." },
  { id: "deuda", nombre: "Deuda Pública", mecanismo: "El libro de la deuda", describe: "lo que el Estado pide prestado." },
];

export const nombreInstrumento = (id) => INSTRUMENTOS.find((x) => x.id === id)?.nombre ?? id;

/*
 * La misma frase en los dos juegos donde "bono del Tesoro" cae en cajas
 * distintas. Escrita para quien acaba de fallar: no dice "es gasto", dice por
 * qué el mismo bono puede ser las dos cosas.
 */
export const DEUDA_VS_SERVICIO =
  "Contraer la deuda y pagarla son dos instrumentos distintos: emitir un bono o pedir un crédito es Deuda Pública, porque el Estado recibe dinero prestado; pagar sus intereses es Gasto del Gobierno —servicio de la deuda—, porque el dinero sale del presupuesto. El bono es el mismo; lo que se clasifica es la operación.";

/* ════════════════════ ACTIVIDAD 1 — "El clasificador del Tesoro" ════════════════════ */

/*
 * Dieciocho tarjetas del ejercicio del profesor; cada partida saca doce.
 * `variedad` es la subcategoría que la devolución nombra.
 */
export const TARJETAS_POR_PARTIDA = 12;

export const CLASIFICADOR = [
  { id: "peaje", concepto: "Peaje", instrumento: "tributacion", variedad: "Tasa o tarifa" },
  { id: "timbre", concepto: "Impuesto de timbre", instrumento: "tributacion", variedad: "Impuesto indirecto" },
  { id: "iva-electrodomestico", concepto: "IVA al comprar un electrodoméstico", instrumento: "tributacion", variedad: "Impuesto indirecto" },
  { id: "renta-persona", concepto: "Impuesto a la renta de una persona", instrumento: "tributacion", variedad: "Impuesto directo" },
  { id: "mi-casa-ya", concepto: "Subsidio del programa Mi Casa Ya", instrumento: "gasto", variedad: "Inversión" },
  { id: "salario-maestro", concepto: "Salario de un maestro de colegio público", instrumento: "gasto", variedad: "Funcionamiento" },
  {
    id: "intereses-bono",
    concepto: "Pago de intereses de un bono del Tesoro a un banco extranjero",
    instrumento: "gasto",
    variedad: "Servicio de la deuda",
    /* El ítem 7: la devolución se alarga con la distinción, acierte o falle. */
    aclaracion: DEUDA_VS_SERVICIO,
  },
  { id: "valorizacion", concepto: "Contribución de valorización por una obra vial cercana", instrumento: "tributacion", variedad: "Contribución" },
  { id: "credito-banco-mundial", concepto: "Crédito que Colombia pide al Banco Mundial", instrumento: "deuda", variedad: "Externa" },
  { id: "tes-banco", concepto: "Bonos del Tesoro (TES) comprados por un banco colombiano", instrumento: "deuda", variedad: "Interna" },
  { id: "puente", concepto: "Construcción de un puente nuevo con fondos del Estado", instrumento: "gasto", variedad: "Inversión" },
  { id: "predial", concepto: "Impuesto predial de una casa", instrumento: "tributacion", variedad: "Impuesto directo" },
  { id: "multa-transito", concepto: "Multa de tránsito", instrumento: "tributacion", variedad: "Tasa o tarifa" },
  { id: "nomina-fuerzas", concepto: "Pago de nómina de las Fuerzas Armadas", instrumento: "gasto", variedad: "Funcionamiento" },
  { id: "licores", concepto: "Impuesto al consumo de licores", instrumento: "tributacion", variedad: "Impuesto indirecto" },
  { id: "tes-pensiones", concepto: "TES comprados por un fondo de pensiones colombiano", instrumento: "deuda", variedad: "Interna" },
  { id: "prestamo-fmi", concepto: "Préstamo del FMI a Colombia", instrumento: "deuda", variedad: "Externa" },
  { id: "contribucion-judicial", concepto: "Contribución especial al sistema judicial", instrumento: "tributacion", variedad: "Contribución" },
];

/** La devolución del clasificador, con las dos formas del spec y la aclaración si la hay. */
export function retroClasificador(tarjeta, elegido) {
  const real = nombreInstrumento(tarjeta.instrumento);
  const base = elegido === tarjeta.instrumento
    ? `✅ ${real} — ${tarjeta.variedad}.`
    : `❌ Eso es ${real}, no ${nombreInstrumento(elegido)} — ${tarjeta.variedad}.`;
  return tarjeta.aclaracion ? `${base} ${tarjeta.aclaracion}` : base;
}

/*
 * Cuando el documento cruza la línea sin que nadie lo clasifique. La ficha no
 * trae este caso —solo acierto y error—; la cadena es de este archivo y dice
 * lo mismo que un error: dónde iba y por qué.
 */
export function retroArchivoClasificador(tarjeta) {
  const base = `❌ Se archivó sin clasificar: era ${nombreInstrumento(tarjeta.instrumento)} — ${tarjeta.variedad}.`;
  return tarjeta.aclaracion ? `${base} ${tarjeta.aclaracion}` : base;
}

/* ════════════════════ ACTIVIDAD 2 — "Directos e indirectos" ════════════════════ */

export const SELLOS = [
  { id: "directo", nombre: "Directo" },
  { id: "indirecto", nombre: "Indirecto" },
  { id: "tasa", nombre: "Tasa o tarifa" },
  { id: "contribucion", nombre: "Contribución" },
];

export const nombreSello = (id) => SELLOS.find((x) => x.id === id)?.nombre ?? id;

/*
 * ═══════════ EL IMPUESTO DE TIMBRE, PENDIENTE DE CONFIRMAR ═══════════
 *
 * Pedagogía marcó que clasificarlo como indirecto sigue la convención común
 * pero es un caso con matices, y Mateo lo está confirmando con el profesor.
 * Va como está en la ficha. SI HAY QUE CAMBIARLO, ES UN SOLO CAMPO: el
 * `categoria` de su fila, aquí abajo. La mecánica, la puntuación y las dos
 * devoluciones leen la categoría de esa fila, no la tienen escrita en ningún
 * otro sitio.
 *
 * Ojo con una cosa, para que no sorprenda: su `explica` —"Grava un acto o
 * documento, no el ingreso directamente."— está escrito para la clasificación
 * como indirecto. Si el profesor la cambia, esa frase dejaría de ser verdad y
 * habría que reescribirla en la misma fila. Sigue siendo una sola fila.
 */
export const IMPUESTOS_SELLO = [
  { id: "renta-empresa", concepto: "Impuesto a la renta de una empresa", categoria: "directo", explica: "Grava directamente el ingreso o ganancia de quien paga." },
  { id: "iva-computador", concepto: "IVA al comprar un computador", categoria: "indirecto", explica: "Se cobra sobre el consumo — lo paga el comprador, lo recauda el vendedor." },
  { id: "predial", concepto: "Impuesto predial", categoria: "directo", explica: "Grava directamente un bien de propiedad del contribuyente." },
  { id: "cigarrillos", concepto: "Impuesto al consumo de cigarrillos", categoria: "indirecto", explica: "Se cobra sobre el acto de consumir, no sobre el ingreso." },
  { id: "peaje", concepto: "Peaje en una autopista", categoria: "tasa", explica: "Es un pago por el uso de un servicio específico, no un impuesto general." },
  { id: "valorizacion", concepto: "Contribución de valorización", categoria: "contribucion", explica: "Se paga porque una obra beneficia directamente al contribuyente." },
  { id: "timbre", concepto: "Impuesto de timbre", categoria: "indirecto", explica: "Grava un acto o documento, no el ingreso directamente." },
  { id: "retencion", concepto: "Retención en la fuente sobre el salario", categoria: "directo", explica: "Es un anticipo del impuesto a la renta — grava el ingreso directamente." },
];

export function retroSello(impuesto, elegido) {
  const real = nombreSello(impuesto.categoria);
  return elegido === impuesto.categoria
    ? `✅ ${real} — ${impuesto.explica}`
    : `❌ Es ${real}, no ${nombreSello(elegido)} — ${impuesto.explica}`;
}

/* ════════════════════ ACTIVIDAD 3 — "Flujo de caja: ¿a quién afecta?" ════════════════════ */

/*
 * Los tres canales por los que una medida fiscal llega a la Demanda Agregada.
 * La ficha da la razón de los dos canales de tributación entre paréntesis; la
 * del gasto no la trae y la de aquí es de este archivo: es lo que distingue al
 * gasto de los otros dos, que no pasa por la decisión de un hogar o una
 * empresa.
 */
export const CANALES = [
  { id: "consumo", nombre: "Tributación → Consumo", razon: "menor renta disponible" },
  { id: "inversion", nombre: "Tributación → Inversión", razon: "menor utilidad después de impuestos" },
  { id: "g", nombre: "Gasto del Gobierno → G directamente", razon: "el Estado compra él mismo, sin pasar por la decisión de un hogar o una empresa" },
];

export const nombreCanal = (id) => CANALES.find((x) => x.id === id)?.nombre ?? id;

export const MEDIDAS_FLUJO = [
  { id: "exenciones-iva", medida: "Eliminar las exenciones al IVA", canal: "consumo" },
  { id: "mi-casa-ya", medida: "Adicionar $1 billón al programa Mi Casa Ya", canal: "g" },
  { id: "base-renta", medida: "Ampliar la base gravable del impuesto a la renta de personas", canal: "consumo" },
  { id: "beneficios-empresas", medida: "Quitar beneficios tributarios a las empresas", canal: "inversion" },
];

export function retroFlujo(medida, elegido) {
  const canal = CANALES.find((x) => x.id === medida.canal);
  return elegido === medida.canal
    ? `✅ ${canal.nombre} — ${canal.razon}.`
    : `❌ Esto pasa por ${canal.nombre}, no por ${nombreCanal(elegido)}.`;
}

export const PREGUNTA_MULTIPLICADOR =
  "Si el gobierno gasta $1 billón adicional en Mi Casa Ya, ¿el aumento final en la Demanda Agregada es exactamente $1 billón, más, o menos?";

export const OPCIONES_MULTIPLICADOR = [
  { id: "mas", texto: "Más de $1 billón", correcta: true, retro: "✅ Correcto — por el efecto multiplicador, ese billón se vuelve ingreso de constructores y trabajadores, que a su vez gastan parte de ese ingreso, generando más rondas de gasto." },
  { id: "exacto", texto: "Exactamente $1 billón", correcta: false, retro: "❌ Eso ignora el multiplicador — el dinero no se queda quieto, se convierte en ingreso de otros que también gastan." },
  { id: "menos", texto: "Menos de $1 billón", correcta: false, retro: "❌ Al contrario — el efecto final es MAYOR al gasto inicial, no menor." },
];

/* Etapa 1 = 60 % repartido entre las cuatro medidas; etapa 2 = 40 %. */
export const PESO_ETAPA_1 = 60;
export const PESO_ETAPA_2 = 40;

export const puntuarFlujo = (aciertosEtapa1, acertoEtapa2) =>
  (aciertosEtapa1 / MEDIDAS_FLUJO.length) * PESO_ETAPA_1 + (acertoEtapa2 ? PESO_ETAPA_2 : 0);

/* ════════════════════ ACTIVIDAD 4 — "El agujero fiscal" ════════════════════ */

/* Parafraseado de las citas de prensa del profesor, no copiado. */
export const CASO_AGUJERO =
  "Colombia enfrenta un déficit fiscal importante. Hoy, el impuesto a la renta recae sobre todo en las empresas, mientras los beneficios tributarios (exenciones) le cuestan al país $17,1 billones al año. Algunos expertos proponen ampliar la base gravable — que más personas naturales paguen impuesto a la renta según su ingreso — y eliminar algunas exenciones, en vez de subir el IVA.";

export const PREGUNTA_AGUJERO =
  "¿Por qué proponen ampliar la base del impuesto a la renta EN VEZ DE subir el IVA, si ambas opciones aumentarían el recaudo?";

export const OPCIONES_AGUJERO = [
  { id: "a", texto: "Porque el impuesto a la renta es más fácil de cobrar.", correcta: false, retro: "❌ No es un tema de facilidad de cobro — ambos ya se cobran hoy." },
  { id: "b", texto: "Porque el IVA afecta más a quienes tienen menos ingresos — todos pagan la misma tarifa sin importar cuánto ganan.", correcta: true, retro: "✅ Correcto — el IVA es indirecto: todos pagan la misma tarifa sin importar su ingreso, así que golpea proporcionalmente más fuerte a quien gana menos. Ampliar la renta (que sí distingue por ingreso) es la alternativa menos regresiva." },
  { id: "c", texto: "Porque el gobierno no puede subir el IVA por ley.", correcta: false, retro: "❌ El gobierno sí puede ajustar el IVA por ley — no es una limitación legal." },
  { id: "d", texto: "Porque el impuesto a la renta genera más recaudo en general.", correcta: false, retro: "❌ El texto no compara cuál genera más recaudo — compara a quién afecta más." },
];

/* ════════════════════ ACTIVIDAD 5 — "Expansiva o contractiva" ════════════════════ */

/*
 * Duelos por parejas: tres por caso, y cada partida juega uno de los dos
 * casos. El ganador de cada duelo es el que va antes en el `ranking`, y
 * politicaFiscal.test.mjs lo comprueba: un duelo que contradijera el ranking
 * enseñaría un ciclo.
 *
 * "Mismo argumento" en la ficha: el tercer duelo de cada caso se gana por la
 * misma razón que el duelo contra C —C va en la dirección contraria a la que
 * la economía necesita—, así que repite esa cadena tal cual.
 */
export const CASOS_EXPANSIVA = [
  {
    id: "recesion",
    titulo: "Recesión",
    caso: "La economía está en recesión, con alto desempleo.",
    medidas: {
      A: "Aumentar gasto público en infraestructura",
      B: "Bajar impuestos a las personas",
      C: "Subir impuestos para equilibrar el presupuesto",
    },
    ranking: ["A", "B", "C"],
    duelos: [
      { id: "a-vs-b", par: ["A", "B"], gana: "A", argumento: "El gasto público entra directo, sin fuga a ahorro." },
      { id: "b-vs-c", par: ["B", "C"], gana: "B", argumento: "Al menos es expansiva — C empeoraría la recesión." },
      { id: "a-vs-c", par: ["A", "C"], gana: "A", argumento: "Al menos es expansiva — C empeoraría la recesión." },
    ],
  },
  {
    id: "sobrecalentamiento",
    titulo: "Sobrecalentamiento",
    caso: "La economía tiene inflación alta, cerca de su capacidad máxima.",
    medidas: {
      A: "Subir impuestos",
      B: "Recortar gasto público",
      C: "Bajar impuestos",
    },
    ranking: ["B", "A", "C"],
    duelos: [
      /* Corregido de la ficha: "que parte se absorbe" → "que en parte se absorbe … no en menor consumo". */
      { id: "b-vs-a", par: ["B", "A"], gana: "B", argumento: "Recortar gasto reduce la demanda de forma más directa que subir impuestos, que en parte se absorbe en menor ahorro, no en menor consumo." },
      { id: "a-vs-c", par: ["A", "C"], gana: "A", argumento: "Al menos es contractiva — C empeoraría la inflación." },
      { id: "b-vs-c", par: ["B", "C"], gana: "B", argumento: "Al menos es contractiva — C empeoraría la inflación." },
    ],
  },
];

/* ════════════════════ ACTIVIDAD 6 — "Diseña el presupuesto" ════════════════════ */

export const CASO_PRESUPUESTO =
  "Un municipio pequeño necesita construir un acueducto nuevo porque el actual colapsó, y su presupuesto ordinario no alcanza.";

/*
 * Dos casillas, en orden: primero qué clase de gasto es la obra y después con
 * qué se paga lo que el presupuesto no cubre. La primera vale 60 y la segunda
 * 40; cada toque a un señuelo resta 5, con piso en 0. Poner la pieza correcta
 * de la otra casilla es un error de orden, no un señuelo, y no resta.
 */
export const CASILLAS_PRESUPUESTO = [
  { id: "gasto", rotulo: "EL GASTO", ayuda: "¿Qué clase de gasto es construir el acueducto?", peso: 60 },
  { id: "financiacion", rotulo: "LA FINANCIACIÓN", ayuda: "¿Con qué se paga lo que el presupuesto ordinario no alcanza?", peso: 40 },
];

export const CASTIGO_SENUELO = 5;

/*
 * Las dos correctas y los tres señuelos que trae la ficha, con su texto
 * exacto; los otros cinco señuelos (marcados `propio`) son de este archivo.
 *
 * LA TAXONOMÍA SOLO DEJA CUATRO CATEGORÍAS LIBRES. Son nueve —cuatro de
 * tributación, tres de gasto y dos de deuda—; dos son las correctas y tres ya
 * son señuelos de la ficha. El quinto señuelo propio repite por eso una
 * categoría, Deuda Pública — Externa, pero con un error distinto al del señuelo
 * de la ficha: aquel es "plausible pero poco común"; este es imposible, porque
 * el FMI no le presta a municipios.
 */
export const PIEZAS_PRESUPUESTO = [
  { id: "gasto-inversion", texto: "Gasto del Gobierno — Inversión", papel: "gasto", retro: "✅ Correcto — construir infraestructura nueva es gasto de inversión, no de funcionamiento." },
  { id: "deuda-interna", texto: "Deuda Pública — Interna (ej. un crédito con un banco colombiano o TES)", papel: "financiacion", retro: "✅ Correcto — si el presupuesto ordinario no alcanza, el municipio puede financiar la diferencia con deuda." },

  { id: "gasto-funcionamiento", texto: "Gasto del Gobierno — Funcionamiento", papel: "senuelo", retro: "❌ Funcionamiento es el gasto operativo diario (salarios, servicios), no construcción nueva." },
  { id: "trib-indirecto", texto: "Tributación — Impuesto indirecto", papel: "senuelo", retro: "❌ Un impuesto nuevo no es la vía inmediata para financiar una obra urgente." },
  { id: "deuda-externa", texto: "Deuda Pública — Externa", papel: "senuelo", retro: "❌ Plausible, pero para un municipio pequeño lo más común es financiamiento interno." },

  { id: "trib-directo", propio: true, texto: "Tributación — Impuesto directo", papel: "senuelo", retro: "❌ Un impuesto directo, como el predial, se recauda a lo largo del año — no reúne de golpe lo que cuesta una obra urgente." },
  { id: "trib-tasa", propio: true, texto: "Tributación — Tasa o tarifa", papel: "senuelo", retro: "❌ Una tasa se cobra por usar un servicio que ya existe — el acueducto nuevo todavía no presta ninguno." },
  { id: "trib-contribucion", propio: true, texto: "Tributación — Contribución", papel: "senuelo", retro: "❌ Una contribución de valorización se cobra porque una obra nueva sube el valor de los predios cercanos — reponer un acueducto que colapsó devuelve un servicio, no valoriza." },
  { id: "gasto-servicio-deuda", propio: true, texto: "Gasto del Gobierno — Servicio de la deuda", papel: "senuelo", retro: "❌ El servicio de la deuda es pagar los intereses de lo que ya se debe — construir el acueducto no es pagar una deuda, aunque se financie con una." },
  { id: "deuda-externa-fmi", propio: true, texto: "Deuda Pública — Externa (ej. un préstamo del FMI)", papel: "senuelo", retro: "❌ El FMI le presta a los países, no a los municipios — un municipio pequeño no puede pedirle un crédito." },
];

export function puntuarPresupuesto(puestas, senuelos) {
  const bruto = CASILLAS_PRESUPUESTO.reduce((s, c) => s + (puestas[c.id] ? c.peso : 0), 0);
  return Math.max(0, bruto - CASTIGO_SENUELO * senuelos);
}

/* ════════════════════ ACTIVIDAD 7 — "Déficit vs deuda" ════════════════════ */

export const PAPELES_POR_PARTIDA = 10;
/*
 * El concepto central de este juego son las cuatro frases de "Ninguno". Con
 * un sorteo libre de diez entre catorce, una partida puede traer una sola
 * (un 4 % de las veces) o ninguna; se garantizan dos.
 */
export const MINIMO_NINGUNO = 2;

export const BANDEJAS = [
  { id: "tributacion", nombre: "Tributación", corto: "Tributación" },
  { id: "gasto", nombre: "Gasto", corto: "Gasto" },
  { id: "deuda", nombre: "Deuda", corto: "Deuda" },
  { id: "ninguno", nombre: "Ninguno — es déficit o concepto general", corto: "Ninguno" },
];

export const nombreBandeja = (id) => BANDEJAS.find((x) => x.id === id)?.corto ?? id;

/*
 * Las dos explicaciones de fondo. El déficit es un FLUJO de un año; la deuda,
 * un SALDO que se acumula. Ninguno de los dos es un instrumento: son lo que
 * queda después de usar los tres.
 */
const FLUJO_DEFICIT =
  "El déficit es un flujo: lo que le faltó al Estado en UN año entre lo que recaudó y lo que gastó. No es un instrumento que se use, es el resultado de usar los tres.";
const SALDO_DEUDA =
  "La deuda total es un saldo: todo lo que el Estado ha pedido prestado y aún debe, acumulado durante años. Medirla no es emitir deuda nueva ni pagarla.";
const EMITIR_ES_DEUDA =
  "Aquí el Estado recibe dinero prestado: es contraer deuda. Pagar sus intereses, más adelante, sí sería gasto.";

export const BANCO_DEFICIT = [
  { id: "deficit-seis", texto: "El déficit fiscal de este año fue del 6% del PIB.", bandeja: "ninguno", aclaracion: FLUJO_DEFICIT },
  { id: "deuda-cincuenta", texto: "La deuda pública total de Colombia supera el 50% del PIB.", bandeja: "ninguno", aclaracion: SALDO_DEUDA },
  { id: "renta-empresas", texto: "El gobierno sube el impuesto a la renta a las empresas.", bandeja: "tributacion" },
  { id: "via-nacional", texto: "El gobierno construye una nueva vía nacional.", bandeja: "gasto" },
  { id: "tes-nuevos", texto: "Colombia emite nuevos TES para financiar el presupuesto.", bandeja: "deuda", aclaracion: EMITIR_ES_DEUDA },
  { id: "salario-jueces", texto: "El gobierno paga el salario de los jueces.", bandeja: "gasto" },
  { id: "exencion", texto: "Se elimina una exención tributaria para ciertos sectores.", bandeja: "tributacion" },
  {
    id: "intereses-bid",
    texto: "El gobierno paga los intereses de un crédito con el BID.",
    bandeja: "gasto",
    /* La misma distinción que el ítem 7 del clasificador, y se muestra acierte o falle. */
    aclaracion: DEUDA_VS_SERVICIO,
    siempre: true,
  },
  { id: "prestamo-fmi", texto: "Colombia pide un nuevo préstamo al FMI.", bandeja: "deuda", aclaracion: EMITIR_ES_DEUDA },
  { id: "deficit-reduce", texto: "El déficit fiscal se redujo un punto del PIB este año.", bandeja: "ninguno", aclaracion: FLUJO_DEFICIT },
  { id: "arancel", texto: "Se sube el arancel a un producto importado.", bandeja: "tributacion" },
  { id: "hospital", texto: "El gobierno invierte en un nuevo hospital.", bandeja: "gasto" },
  { id: "deuda-crece", texto: "La deuda pública creció 3 puntos del PIB en 5 años.", bandeja: "ninguno", aclaracion: SALDO_DEUDA },
  { id: "banco-bonos", texto: "Un banco colombiano compra bonos del Tesoro.", bandeja: "deuda", aclaracion: EMITIR_ES_DEUDA },
];

/*
 * La devolución del juego 7. Acierto: "✅ [Bandeja] — bien identificado." y,
 * solo en los intereses del BID, la distinción deuda/servicio detrás. Error:
 * "❌ Esto es [real], no [elegida] — [distinción]." cuando el ítem trae una,
 * que son todos los de deuda y déficit.
 */
export function retroDeficit(papel, elegida) {
  const real = nombreBandeja(papel.bandeja);
  if (elegida === papel.bandeja) {
    const base = `✅ ${real} — bien identificado.`;
    return papel.siempre && papel.aclaracion ? `${base} ${papel.aclaracion}` : base;
  }
  const base = `❌ Esto es ${real}, no ${nombreBandeja(elegida)}`;
  return papel.aclaracion ? `${base} — ${papel.aclaracion}` : `${base}.`;
}

/* El papel que llega al fondo sin bandeja. Tampoco está en la ficha: misma lógica que un error. */
export function retroCaidaDeficit(papel) {
  const base = `❌ Se cayó sin bandeja: esto es ${nombreBandeja(papel.bandeja)}`;
  return papel.aclaracion ? `${base} — ${papel.aclaracion}` : `${base}.`;
}

/* Diez de catorce, con al menos MINIMO_NINGUNO frases de déficit o deuda total. */
export function sortearPapeles(barajar) {
  const ninguno = barajar(BANCO_DEFICIT.filter((x) => x.bandeja === "ninguno"));
  const resto = barajar(BANCO_DEFICIT.filter((x) => x.bandeja !== "ninguno"));
  const fijos = ninguno.slice(0, MINIMO_NINGUNO);
  const libres = barajar([...ninguno.slice(MINIMO_NINGUNO), ...resto]).slice(0, PAPELES_POR_PARTIDA - fijos.length);
  return barajar([...fijos, ...libres]);
}

/*
 * Expansiva o contractiva: el encabezado de la devolución, compartido con el
 * Repaso Diario. Debajo va el argumento del duelo, literal.
 */
export const encabezadoExpansiva = (caso, duelo, elegido) =>
  `${elegido === duelo.gana ? "CORRECTO" : "REVISA"} · MEJOR: ${caso.medidas[duelo.gana]}`;
