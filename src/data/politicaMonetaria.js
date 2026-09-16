/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA — "LA SALA DE MÁQUINAS".
 *
 * Todo el texto de este archivo es de Gen (pedagogía), del prompt maestro y de
 * su addendum 2, LITERAL. Lo que no viene de ahí está marcado en el sitio
 * donde aparece con [ESCRITO POR CLAUDE, NO POR LA FICHA].
 *
 * Tercer cuarto del edificio: la Sala de Control es Política Económica, la
 * Tesorería es Política Fiscal. Aquí hay UN volante —la tasa de intervención—
 * y de él salen TRES correas: crédito, ahorro y cambiario.
 *
 * ═══════════ LAS CIFRAS ═══════════
 *
 * Las únicas cifras reales son las de DATOS_VERIFICADOS (Banco de la
 * República, consultado el mismo día en que se escribió la ficha). Cualquier
 * otra cifra que aparezca en una actividad es un escenario simulado y lleva
 * `simulado: true` o una `etiqueta` que se pinta en pantalla. Ninguna cifra
 * inventada sale sin rótulo.
 *
 * ═══════════ SUBTEMA ═══════════
 *
 * Cada actividad declara su `subtema`: metadato del banco, sin migración y sin
 * columna en fp_detalle (addendum: resuelto así).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const DATOS_VERIFICADOS = {
  tasaIntervencion: "12,0%",
  tasaDesde: "julio de 2026",
  trayectoria2026: ["10,25% (enero)", "11,25% (marzo)", "11,25% (abril y mayo)", "12,0% (julio)"],
  metaInflacion: "3%",
  rangoMeta: "2% a 4%",
  inflacionEnero2026: "5,35%",
  crecimientoPib2025: "2,6%",
};

/* Los rótulos de escenario que se pintan en pantalla. */
export const ROTULO_SIMULADO = "Escenario simulado";

/* ═══════════════════════════ APRENDER (cero FP) ═══════════════════════════ */

export const APRENDER_QUIEN_MANDA = {
  id: "quien-manda-aqui",
  titulo: "¿Quién Manda Aquí?",
  nombres: [
    { termino: "Política monetaria", definicion: "las decisiones sobre cuánto cuesta el dinero y cuánto dinero circula en la economía." },
    { termino: "Banco de la República", definicion: "el banco central de Colombia. Es independiente del gobierno — el presidente no le da órdenes." },
    { termino: "Junta Directiva", definicion: "las siete personas que deciden la tasa. Se reúnen varias veces al año." },
    { termino: "Tasa de interés de intervención (o de política monetaria)", definicion: "la tasa a la que el Banco de la República les presta a los bancos comerciales. No es la tasa que usted paga por su crédito — es la que se la define." },
    { termino: "Meta de inflación", definicion: "el objetivo declarado del Banco. En Colombia es 3%, con un rango aceptable de 2% a 4%." },
  ],
  pasos: [
    {
      resaltar: ["casa-narino", "banco-republica"],
      texto: "Dos instituciones distintas, dos manos distintas. El gobierno cobra impuestos y gasta — eso es política fiscal. El Banco de la República decide cuánto cuesta el dinero — eso es política monetaria. No se dan órdenes entre ellos.",
    },
    {
      resaltar: ["junta"],
      texto: "La tasa la decide una Junta de siete personas, no el presidente. Esa separación existe a propósito: un gobierno siempre tiene el incentivo de bajar tasas antes de una elección, aunque la inflación esté alta.",
    },
    {
      resaltar: ["volante"],
      texto: "Hoy la tasa está en 12,0%, desde julio de 2026. Subió desde 10,25% en enero — el Banco la ha venido apretando porque la inflación sigue por encima del rango meta de 2% a 4%.",
    },
    {
      resaltar: ["correa", "banco-comercial", "persona"],
      texto: "Y ojo con esto: el 12,0% no es lo que usted paga. Es lo que le cuesta al banco conseguir plata. El banco le suma su margen y le cobra a usted bastante más. Por eso la tasa de intervención mueve su crédito sin ser su crédito.",
    },
  ],
  pregunta: "Si el presidente quiere bajar las tasas de interés antes de una elección, ¿puede hacerlo?",
  respuesta: "No directamente. La tasa la fija la Junta Directiva del Banco de la República, que es independiente del gobierno. Esa independencia existe precisamente para que decisiones de largo plazo no se tomen por conveniencia electoral.",
};

/* Addendum 2: reemplaza por completo a "Los Tres Instrumentos". */
export const APRENDER_INSTRUMENTOS = {
  id: "los-cuatro-instrumentos",
  titulo: "Los Cuatro Instrumentos",
  nombres: [
    { termino: "Tasa de interés de intervención", definicion: "el instrumento principal. Es el precio al que el Banco les presta a los bancos." },
    { termino: "Operaciones de Mercado Abierto (OMA)", definicion: "el Banco compra o vende títulos a los bancos. Comprar les mete plata; vender se las quita." },
    { termino: "Encaje bancario", definicion: "el porcentaje de los depósitos que cada banco está obligado a guardar y no puede prestar." },
    { termino: "Intervención en el mercado cambiario", definicion: "el Banco compra o vende dólares. Comprar dólares debilita el peso; vender dólares lo fortalece. Es el único instrumento que apunta al tipo de cambio y no a la tasa de interés." },
    { termino: "Reservas internacionales", definicion: "los dólares que el Banco tiene guardados. Son con lo que interviene cuando hace falta." },
    { termino: "Política monetaria expansiva", definicion: "bajar la tasa, meter liquidez. Busca reactivar." },
    { termino: "Política monetaria contractiva", definicion: "subir la tasa, quitar liquidez. Busca frenar la inflación." },
  ],
  pasos: [
    {
      resaltar: ["volante"],
      texto: "De los cuatro instrumentos, uno manda: la tasa de intervención. Es el anuncio, la señal, lo que sale en las noticias. Los demás existen en buena medida para sostenerla o para atender frentes específicos.",
    },
    {
      resaltar: ["oma"],
      texto: "Las operaciones de mercado abierto son el día a día: el Banco compra o vende títulos para que la tasa del mercado se quede donde la Junta dijo. Son el mecanismo, no el objetivo.",
    },
    {
      resaltar: ["encaje"],
      texto: "El encaje es distinto: obliga a cada banco a guardar una parte de lo que la gente le deposita. Subirlo deja menos plata disponible para prestar. Es el instrumento más contundente y el que menos se usa.",
    },
    {
      resaltar: ["cambiaria"],
      texto: "El cuarto instrumento no toca la tasa: el Banco compra o vende dólares directamente. Si compra, entran menos dólares netos al mercado y el peso se debilita; si vende, pasa lo contrario. Es la herramienta con la que se atiende el canal cambiario, y por eso existe: un país exportador no puede quedarse mirando cuando su moneda se mueve demasiado rápido.",
    },
    {
      resaltar: ["direcciones"],
      texto: "Y todo se reduce a dos direcciones: apretar (subir la tasa) para frenar los precios, o soltar (bajarla) para reactivar. Nunca las dos a la vez.",
    },
  ],
  pregunta: "¿Por qué la tasa de intervención es el instrumento principal y no las operaciones de mercado abierto?",
  respuesta: "Porque la tasa es la decisión y la señal; las operaciones de mercado abierto son la forma operativa de hacer que esa tasa se cumpla en el mercado. Confundirlas es el error más común del tema.",
};

export const APRENDER_TRANSMISIONES = {
  id: "las-tres-transmisiones",
  titulo: "Las Tres Transmisiones",
  nombres: [
    { termino: "Transmisión", definicion: "el camino por el que una decisión del Banco termina afectando a la gente. No es directo ni inmediato." },
    { termino: "Canal del crédito", definicion: "la tasa cambia el costo de pedir prestado → cambia cuánto piden familias y empresas." },
    { termino: "Canal del ahorro", definicion: "la tasa cambia lo que rinde guardar plata → cambia cuánto se ahorra en vez de gastar." },
    { termino: "Canal cambiario", definicion: "una tasa más alta atrae capital extranjero → el peso se fortalece → lo importado se abarata y lo exportado se encarece." },
    { termino: "Rezago", definicion: "el tiempo que se demora el efecto en verse. Puede tardar varios trimestres." },
  ],
  pasos: [
    { resaltar: ["volante"], texto: "La Junta sube la tasa. Ese es el único movimiento que hace el Banco. Todo lo demás es consecuencia." },
    { resaltar: ["credito"], texto: "Primera correa, la del crédito: los bancos consiguen plata más cara, así que le prestan más caro a usted. Menos gente pide crédito para carro, vivienda o expandir un negocio." },
    { resaltar: ["ahorro"], texto: "Segunda correa, la del ahorro: si un CDT ahora paga más, guardar la plata se vuelve más atractivo que gastarla. Menos consumo hoy." },
    { resaltar: ["cambiario"], texto: "Tercera correa, la cambiaria: tasas altas en Colombia atraen capital de afuera buscando ese rendimiento. Entran dólares, el peso se fortalece, y lo importado se abarata — eso también baja la inflación." },
    { resaltar: ["credito", "ahorro", "cambiario", "reloj"], texto: "Y aquí está lo que casi nadie espera: esto no pasa mañana. Las tres correas giran a ritmos distintos y el efecto completo puede tardar varios trimestres. Por eso la Junta decide mirando hacia adelante, no hacia el dato de hoy." },
  ],
  pregunta: "El Banco sube la tasa hoy. ¿Por qué la inflación no baja este mes?",
  respuesta: "Porque la transmisión tiene rezagos: la decisión debe pasar por los bancos, por las decisiones de crédito y ahorro de la gente, y por el tipo de cambio. El efecto completo puede tardar varios trimestres.",
};

/* ═══════════════════════════ BLOQUE 1 · CIMIENTOS ═══════════════════════════ */

/* PM-1 — Memorama del Banco Central */
export const MEMORAMA_BANCO_CENTRAL = {
  subtema: "Instrumentos y conceptos base",
  pares: [
    { id: "tasa", termino: "Tasa de intervención", definicion: "La tasa a la que el Banco de la República les presta a los bancos" },
    { id: "encaje", termino: "Encaje bancario", definicion: "La parte de los depósitos que un banco debe guardar y no puede prestar" },
    { id: "oma", termino: "Operaciones de Mercado Abierto", definicion: "Cuando el Banco compra o vende títulos a los bancos" },
    { id: "expansiva", termino: "Política expansiva", definicion: "Bajar la tasa para reactivar la economía" },
    { id: "contractiva", termino: "Política contractiva", definicion: "Subir la tasa para frenar la inflación" },
  ],
};

/* PM-2 — ¿Quién Decide Esto? */
export const QUIEN_DECIDE = {
  subtema: "Naturaleza e independencia",
  porPartida: 6,
  pregunta: "¿Quién decide esto?",
  categorias: [
    { id: "banrep", nombre: "Banco de la República" },
    { id: "gobierno", nombre: "Gobierno Nacional" },
  ],
  items: [
    { id: "sube-tasa", texto: "Subir la tasa de interés de intervención", respuesta: "banrep" },
    { id: "sube-iva", texto: "Subir el IVA a ciertos productos", respuesta: "gobierno" },
    { id: "sube-encaje", texto: "Aumentar el encaje bancario", respuesta: "banrep" },
    { id: "carretera", texto: "Construir una carretera nueva", respuesta: "gobierno" },
    { id: "compra-titulos", texto: "Comprar títulos a los bancos para dar liquidez", respuesta: "banrep" },
    { id: "base-renta", texto: "Ampliar la base del impuesto a la renta", respuesta: "gobierno" },
    { id: "compra-dolares", texto: "Intervenir comprando dólares en el mercado", respuesta: "banrep" },
    { id: "programa-social", texto: "Aumentar el presupuesto de un programa social", respuesta: "gobierno" },
    { id: "meta-inflacion", texto: "Fijar la meta de inflación del país", respuesta: "banrep" },
    { id: "emite-tes", texto: "Emitir bonos de deuda pública (TES)", respuesta: "gobierno" },
  ],
  retro: (item, elegida) => {
    if (elegida === item.respuesta) {
      return item.respuesta === "banrep"
        ? "✅ Banco de la República — es una decisión de política monetaria, la toma la Junta Directiva."
        : "✅ Gobierno — es política fiscal: impuestos, gasto o deuda.";
    }
    return item.respuesta === "banrep"
      ? "❌ Esto lo decide el Banco de la República, no el gobierno. El Banco es independiente — el presidente no le da órdenes sobre la tasa ni sobre el encaje."
      : "❌ Esto lo decide el gobierno. El Banco de la República no cobra impuestos ni ejecuta gasto público — solo maneja la política monetaria.";
  },
};

/* ═══════════════════════════ BLOQUE 2 · APLICACIÓN ═══════════════════════════ */

/* PM-3 — El Volante de la Tasa */
export const VOLANTE_DE_LA_TASA = {
  subtema: "Tipos de política monetaria",
  porPartida: 8,
  opciones: [
    { id: "subir", nombre: "Subir" },
    { id: "bajar", nombre: "Bajar" },
  ],
  escenarios: [
    { id: "inflacion-seis-meses", texto: "La inflación lleva seis meses por encima del rango meta", correcta: "subir", retro: "✅ Correcto — subir la tasa enfría el consumo y el crédito, que es como se frena la inflación." },
    { id: "recesion-desempleo", texto: "La economía está en recesión y el desempleo sube", correcta: "bajar", retro: "✅ Correcto — bajar la tasa abarata el crédito y reactiva la inversión y el consumo." },
    { id: "precios-estables-crecimiento-debil", texto: "Los precios llevan meses estables dentro del rango meta y el crecimiento es débil", correcta: "bajar", retro: "✅ Correcto — con la inflación bajo control, el Banco tiene espacio para estimular." },
    { id: "peso-devaluando", texto: "El peso se está devaluando fuerte y eso encarece las importaciones", correcta: "subir", retro: "✅ Correcto — tasas más altas atraen capital extranjero, lo que fortalece el peso." },
    { id: "expectativas-desancladas", texto: "Las expectativas de inflación de los analistas se están desanclando hacia arriba", correcta: "subir", retro: "✅ Correcto — si la gente espera más inflación, actúa de forma que la produce. El Banco sube para cortar esa expectativa." },
    { id: "credito-insostenible", texto: "El crédito de consumo está creciendo a un ritmo insostenible", correcta: "subir", retro: "✅ Correcto — encarecer el crédito es la forma directa de moderar ese crecimiento." },
    { id: "bajo-potencial", texto: "La economía crece por debajo de su potencial y la inflación ya está en la meta", correcta: "bajar", retro: "✅ Correcto — no hay presión de precios que frenar, y sí capacidad ociosa que activar." },
    { id: "choque-alimentos", texto: "Un choque externo encarece los alimentos y la inflación se dispara", correcta: "subir", retro: "✅ Correcto — aunque el origen sea externo, el Banco actúa para que no se contagie al resto de precios." },
    { id: "inversion-cayendo", texto: "La inversión privada lleva tres trimestres cayendo y los precios están estables", correcta: "bajar", retro: "✅ Correcto — crédito más barato es el incentivo directo a que las empresas vuelvan a invertir." },
    { id: "salida-capitales", texto: "Salen capitales del país y la tasa local quedó muy por debajo de la internacional", correcta: "subir", retro: "✅ Correcto — si invertir aquí rinde menos que afuera, el capital se va. Subir la tasa lo retiene." },
    { id: "consumo-estancado", texto: "El consumo de los hogares está estancado y la inflación en el piso del rango meta", correcta: "bajar", retro: "✅ Correcto — hay espacio de sobra para estimular sin arriesgar la meta." },
    { id: "inflacion-5-35", texto: "La inflación está en 5,35%, por encima del rango de 2% a 4%", correcta: "subir", retro: "✅ Correcto — es el escenario real de Colombia en 2026, y es exactamente lo que hizo el Banco." },
  ],
  error: "❌ En este escenario el Banco haría lo contrario. Recuerde la regla base: se sube para frenar precios, se baja para reactivar.",
};

/* PM-4 — La Caja de Herramientas (addendum 2) */
export const CAJA_DE_HERRAMIENTAS = {
  subtema: "Instrumentos",
  porPartida: 8,
  pregunta: "¿Con qué instrumento se hace?",
  categorias: [
    { id: "tasa", nombre: "Tasa de intervención" },
    { id: "oma", nombre: "Operaciones de Mercado Abierto" },
    { id: "encaje", nombre: "Encaje bancario" },
    { id: "cambiaria", nombre: "Intervención cambiaria" },
  ],
  items: [
    { id: "sube-75", texto: "La Junta anuncia que la tasa sube 75 puntos básicos", respuesta: "tasa", aciertoTexto: "✅ Es la decisión principal y la señal que ve todo el mercado." },
    { id: "compra-titulos", texto: "El Banco compra títulos a los bancos comerciales", respuesta: "oma", aciertoTexto: "✅ Comprar títulos le mete liquidez al sistema — es el mecanismo del día a día." },
    { id: "encaje-11", texto: "El Banco obliga a los bancos a guardar 11% de sus depósitos en vez de 8%", respuesta: "encaje", aciertoTexto: "✅ El encaje define cuánto de lo depositado NO se puede prestar.", simulado: true },
    { id: "vende-titulos", texto: "El Banco vende títulos para retirar liquidez del mercado", respuesta: "oma", aciertoTexto: "✅ Vender títulos le quita plata al sistema — el espejo de comprar." },
    { id: "mantiene-12", texto: "La Junta mantiene la tasa en 12,0% en su reunión", respuesta: "tasa", aciertoTexto: "✅ Mantener también es una decisión de tasa, no la ausencia de una." },
    { id: "reduce-encaje", texto: "Se reduce el porcentaje de depósitos que los bancos deben retener", respuesta: "encaje", aciertoTexto: "✅ Bajar el encaje libera plata para prestar — es expansivo." },
    { id: "subasta-liquidez", texto: "El Banco hace una subasta de liquidez a un día con los bancos", respuesta: "oma", aciertoTexto: "✅ Son las operaciones rutinarias que mantienen la tasa del mercado donde la Junta la fijó." },
    { id: "baja-50", texto: "La Junta baja la tasa 50 puntos básicos para estimular la economía", respuesta: "tasa", aciertoTexto: "✅ La decisión de tasa es siempre el instrumento principal.", simulado: true },
    { id: "reservas-obligatorias", texto: "Se sube el requisito de reservas obligatorias de los bancos", respuesta: "encaje", aciertoTexto: "✅ Otro nombre para lo mismo: reservas obligatorias = encaje." },
    { id: "compra-dolares", texto: "El Banco de la República compra dólares en el mercado cambiario", respuesta: "cambiaria", aciertoTexto: "✅ Comprar dólares es actuar sobre el tipo de cambio, no sobre la tasa de interés." },
    { id: "vende-dolares", texto: "El Banco vende dólares de las reservas para frenar una devaluación acelerada", respuesta: "cambiaria", aciertoTexto: "✅ Vender dólares mete oferta al mercado y fortalece el peso — el espejo de comprar." },
    { id: "acumula-reservas", texto: "El Banco acumula reservas internacionales comprando divisas", respuesta: "cambiaria", aciertoTexto: "✅ Acumular reservas es intervención cambiaria: se compran dólares y eso debilita el peso." },
  ],
  retro(item, elegida) {
    if (elegida === item.respuesta) return item.aciertoTexto;
    const nombre = (id) => this.categorias.find((c) => c.id === id).nombre;
    return `❌ Esto es ${nombre(item.respuesta)}, no ${nombre(elegida)}. Pista: la tasa es el anuncio; las OMA son la operación diaria que la sostiene; el encaje es lo que el banco está obligado a guardar; y la intervención cambiaria es la única que se hace comprando o vendiendo dólares.`;
  },
};

/* PM-5 — ¿A Quién Le Pega la Tasa? */
export const A_QUIEN_LE_PEGA = {
  subtema: "Canales de transmisión (efectos por agente)",
  rondas: [
    {
      id: "sube-a-12",
      medida: "El Banco de la República sube la tasa de 11,25% a 12,0%",
      etiqueta: "Escenario real, julio 2026",
      personajes: [
        { id: "hipotecario-variable", nombre: "Persona con crédito hipotecario a tasa variable", resultado: "pierde", explicacion: "Su cuota mensual sube cuando el banco ajusta la tasa." },
        { id: "cdt-renovar", nombre: "Persona con un CDT a punto de renovar", resultado: "gana", explicacion: "Le van a pagar más interés por el mismo dinero guardado." },
        { id: "empresa-maquinaria", nombre: "Empresa que iba a pedir un crédito para comprar maquinaria", resultado: "pierde", explicacion: "El crédito que necesitaba ahora le cuesta más." },
        { id: "inversionista-extranjero", nombre: "Inversionista extranjero que compra deuda colombiana", resultado: "gana", explicacion: "Colombia ahora le paga más rendimiento por prestarle." },
      ],
    },
    {
      id: "baja-a-10",
      medida: "El Banco baja la tasa de 12,0% a 10,0%",
      etiqueta: ROTULO_SIMULADO,
      personajes: [
        { id: "constructora", nombre: "Constructora que financia sus obras con crédito", resultado: "gana", explicacion: "Financiar cada proyecto le sale más barato." },
        { id: "pensionado-intereses", nombre: "Pensionado que vive de los intereses de sus ahorros", resultado: "pierde", explicacion: "Sus ahorros le rinden menos cada mes." },
        { id: "familia-carro", nombre: "Familia que quiere comprar carro a crédito", resultado: "gana", explicacion: "La cuota del crédito de vehículo baja." },
        { id: "exportador-flores", nombre: "Exportador de flores", resultado: "gana", explicacion: "Tasas más bajas tienden a debilitar el peso, y un peso débil le hace ganar más pesos por cada dólar que recibe." },
      ],
    },
    {
      id: "sube-encaje",
      medida: "El Banco sube el encaje bancario",
      etiqueta: ROTULO_SIMULADO,
      personajes: [
        { id: "banco-comercial", nombre: "Banco comercial que vive de prestar", resultado: "pierde", explicacion: "Tiene que guardar más plata quieta, así que puede prestar menos." },
        { id: "pequena-empresa", nombre: "Pequeña empresa que busca crédito por primera vez", resultado: "pierde", explicacion: "Con menos plata disponible, los bancos se vuelven más selectivos y ella es la primera en quedar por fuera." },
        { id: "ahorrador-solidez", nombre: "Ahorrador que solo quiere que su banco sea sólido", resultado: "gana", explicacion: "Más reservas obligatorias significa un banco con más respaldo." },
        { id: "empresa-grande-linea", nombre: "Empresa grande con línea de crédito ya aprobada", resultado: "gana", explicacion: "Su crédito ya está pactado, y ahora tiene menos competencia por los fondos disponibles." },
      ],
    },
  ],
  /*
   * La plantilla de error es la de la ficha. La ficha no trae devolución de
   * acierto: al acertar no sale ninguna línea inventada; la tarjeta del
   * personaje ya enseña GANA/PIERDE con su explicación, que sí es de la ficha.
   * "[razón de la tabla]" va con la primera letra en minúscula, porque sigue a
   * "porque".
   */
  retro: (p, elegido) => {
    if (elegido === p.resultado) return null;
    const razon = p.explicacion.charAt(0).toLowerCase() + p.explicacion.slice(1);
    return `❌ Revise el efecto real sobre su situación: ${p.nombre} ${p.resultado} porque ${razon}`;
  },
};

/* ═══════════════════════════ BLOQUE 3 · ANÁLISIS ═══════════════════════════ */

/* PM-6 — La Cadena de Transmisión. El eslabón 1 no se coloca (addendum 2). */
export const CADENAS_TRANSMISION = {
  subtema: "Canales de transmisión",
  senuelosPorPartida: 5,
  castigoSenuelo: 5,
  cadenas: [
    {
      id: "credito",
      canal: "crédito",
      titulo: "Cadena A — Canal del crédito",
      eslabones: [
        { id: "cred-1", texto: "El Banco sube la tasa de intervención" },
        { id: "cred-2", texto: "Los bancos comerciales consiguen fondos más caros", retro: "✅ Encaja — si al banco le sube el precio de la plata que consigue, ese es el primer efecto después de la decisión de la Junta." },
        { id: "cred-3", texto: "Suben las tasas de los créditos de consumo y comerciales", retro: "✅ Encaja — el banco le traslada al cliente lo que a él le costó más caro. Por eso su crédito sube aunque usted no haya hecho nada." },
        { id: "cred-4", texto: "Familias y empresas piden menos crédito", retro: "✅ Encaja — con cuotas más altas, mucha gente simplemente decide no pedir el préstamo o pedir menos." },
        { id: "cred-5", texto: "Baja el consumo y la inversión, y con eso la presión sobre los precios", retro: "✅ Encaja — menos crédito significa menos compras grandes y menos proyectos nuevos; con menos demanda, los precios dejan de empujar hacia arriba." },
      ],
    },
    {
      id: "ahorro",
      canal: "ahorro",
      titulo: "Cadena B — Canal del ahorro",
      eslabones: [
        { id: "aho-1", texto: "El Banco sube la tasa de intervención" },
        { id: "aho-2", texto: "Los rendimientos de CDT y cuentas de ahorro suben", retro: "✅ Encaja — si el Banco paga más por la plata, los bancos también suben lo que le pagan al ahorrador para poder captarla." },
        { id: "aho-3", texto: "Guardar la plata se vuelve más atractivo que gastarla", retro: "✅ Encaja — cuando ahorrar de verdad rinde, la balanza entre gastar hoy o guardar cambia de lado." },
        { id: "aho-4", texto: "Los hogares posponen compras grandes", retro: "✅ Encaja — es la decisión concreta que toma una familia cuando le conviene más dejar la plata quieta." },
        { id: "aho-5", texto: "Baja el consumo presente y con eso la presión sobre los precios", retro: "✅ Encaja — si mucha gente posterga al mismo tiempo, la demanda total del país cae y los precios ceden." },
      ],
    },
    {
      id: "cambiario",
      canal: "cambiario",
      titulo: "Cadena C — Canal cambiario",
      eslabones: [
        { id: "cam-1", texto: "El Banco sube la tasa de intervención" },
        { id: "cam-2", texto: "Invertir en Colombia rinde más que antes frente al exterior", retro: "✅ Encaja — la tasa más alta cambia la comparación entre poner la plata aquí o ponerla afuera." },
        { id: "cam-3", texto: "Entran capitales extranjeros buscando ese rendimiento", retro: "✅ Encaja — el capital se mueve hacia donde le paguen más, y al llegar trae dólares al país." },
        { id: "cam-4", texto: "El peso se fortalece frente al dólar", retro: "✅ Encaja — con más dólares entrando, el dólar se vuelve relativamente más barato medido en pesos." },
        { id: "cam-5", texto: "Lo importado se abarata y eso ayuda a bajar la inflación", retro: "✅ Encaja — si el dólar está más barato, todo lo que se compra afuera llega más barato, y eso frena los precios internos." },
      ],
    },
  ],
  retroSenuelo: (canal) => `❌ Este eslabón es real, pero pertenece al canal ${canal}, no al que está armando.`,
  /* [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] Un eslabón de la misma cadena tocado antes de su turno. */
  retroOrden: "❌ Este eslabón sí es de este canal, pero va más adelante en la cadena.",
};

/* PM-7 — Explícaselo a un Deudor */
export const EXPLICA_DEUDOR = {
  subtema: "Canal del crédito (explicación para no economistas)",
  escenarios: [
    {
      id: "tia",
      enunciado: "A su tía le subió la cuota del crédito de su carro y está furiosa con el banco. Explíquele qué pasó.",
      fragmentos: [
        { id: "tia-banrep", tipo: "correcto", texto: "No fue el banco por su cuenta: el Banco de la República subió la tasa a la que le presta a todos los bancos.", retro: "Claro y directo — sitúa la causa donde está." },
        { id: "tia-mas-caro", tipo: "correcto", texto: "Cuando al banco le sale más caro conseguir la plata, le cobra más caro a quien le presta.", retro: "Bien — explica la cadena sin tecnicismos." },
        { id: "tia-inflacion", tipo: "correcto", texto: "Lo hicieron para frenar la inflación, que llevaba meses por encima de la meta.", retro: "Bien — conecta la molestia con el propósito." },
        { id: "tia-cdt", tipo: "correcto", texto: "El lado bueno es que si tiene ahorros en un CDT, ahora le van a rendir más.", retro: "Bien — muestra el otro lado, no solo el costo." },
        { id: "tia-ajuste", tipo: "jerga", texto: "Se trata de un ajuste al alza en la tasa de política monetaria que se transmite vía el canal crediticio.", retro: "Correcto, pero su tía no va a entender ni la mitad de esa frase." },
        { id: "tia-anclar", tipo: "jerga", texto: "La medida busca anclar las expectativas inflacionarias de los agentes.", retro: "'Anclar expectativas' no significa nada para alguien fuera de una clase de economía." },
        { id: "tia-gobierno", tipo: "incorrecto", texto: "Le subieron la cuota porque el gobierno lo decidió así.", retro: "Falso — el gobierno no fija la tasa. La decide el Banco de la República, que es independiente." },
        { id: "tia-reclamar", tipo: "incorrecto", texto: "Si reclama en el banco se la pueden bajar de vuelta.", retro: "Falso — no es una decisión discrecional de la sucursal, viene de la tasa de intervención." },
      ],
    },
    {
      id: "amigo",
      enunciado: "Un amigo le dice que va a sacar toda su plata del banco porque 'con la inflación no sirve de nada ahorrar'. Explíquele qué está pasando con las tasas.",
      fragmentos: [
        { id: "amigo-cdt", tipo: "correcto", texto: "Justo ahora pasa lo contrario: como el Banco subió la tasa, los CDT están pagando más que antes.", retro: "Claro — corrige el supuesto con un dato concreto." },
        { id: "amigo-idea", tipo: "correcto", texto: "La idea de subir la tasa es precisamente que ahorrar rinda más y la gente gaste un poco menos.", retro: "Bien — explica el propósito del canal del ahorro." },
        { id: "amigo-precios", tipo: "correcto", texto: "Si gasta menos gente, los precios dejan de subir tan rápido.", retro: "Bien — cierra la cadena hasta la inflación." },
        { id: "amigo-quieta", tipo: "correcto", texto: "Sacar la plata y dejarla quieta sí le hace perder contra la inflación; guardarla donde le paguen interés, no tanto.", retro: "Bien — responde a la preocupación real que tiene." },
        { id: "amigo-diferencial", tipo: "jerga", texto: "El rendimiento real depende del diferencial entre la tasa nominal y la inflación esperada.", retro: "Es cierto, pero nadie fuera de la facultad habla así." },
        { id: "amigo-portafolio", tipo: "jerga", texto: "Se observa una recomposición de portafolio hacia instrumentos de renta fija.", retro: "Jerga pura — no le dice nada a quien está preocupado por su plata." },
        { id: "amigo-garantiza", tipo: "incorrecto", texto: "El Banco de la República le garantiza que no va a perder plata.", retro: "Falso — el Banco no garantiza rendimientos a los ahorradores." },
        { id: "amigo-inmediato", tipo: "incorrecto", texto: "Con la tasa alta, los precios bajan de inmediato.", retro: "Falso — la transmisión tiene rezagos de varios trimestres, no es inmediata." },
      ],
    },
  ],
};

/* PM-8 — Corriente de Decisiones */
export const CORRIENTE_DECISIONES = {
  subtema: "Interleaving — instrumentos, canales y tipos mezclados",
  porPartida: 12,
  pregunta: "¿Qué es esto?",
  categorias: [
    { id: "instrumento", nombre: "Instrumento" },
    { id: "canal", nombre: "Canal de transmisión" },
    { id: "tipo", nombre: "Tipo de política" },
    { id: "objetivo", nombre: "Objetivo" },
  ],
  items: [
    { id: "tasa-intervencion", texto: "Tasa de interés de intervención", respuesta: "instrumento" },
    { id: "encaje", texto: "Encaje bancario", respuesta: "instrumento" },
    { id: "oma", texto: "Operaciones de Mercado Abierto", respuesta: "instrumento" },
    { id: "intervencion-cambiaria", texto: "Intervención en el mercado cambiario", respuesta: "instrumento" },
    { id: "capitales-peso", texto: "Entran capitales extranjeros y el peso se fortalece", respuesta: "canal" },
    { id: "tasas-consumo", texto: "Los bancos suben las tasas de sus créditos de consumo", respuesta: "canal" },
    { id: "cdt-guardar", texto: "La gente prefiere guardar la plata en un CDT que gastarla", respuesta: "canal" },
    { id: "importado-abarata", texto: "Lo importado se abarata y presiona los precios a la baja", respuesta: "canal" },
    { id: "posponen-maquinaria", texto: "Las empresas posponen la compra de maquinaria", respuesta: "canal" },
    { id: "expansiva", texto: "Política monetaria expansiva", respuesta: "tipo" },
    { id: "contractiva", texto: "Política monetaria contractiva", respuesta: "tipo" },
    { id: "bajar-reactivar", texto: "Bajar la tasa para reactivar la economía", respuesta: "tipo" },
    { id: "subir-enfriar", texto: "Subir la tasa para enfriar la demanda", respuesta: "tipo" },
    { id: "rango-2-4", texto: "Mantener la inflación entre 2% y 4%", respuesta: "objetivo" },
    { id: "estabilidad-precios", texto: "Estabilidad de precios", respuesta: "objetivo" },
    { id: "expectativas-ancladas", texto: "Que las expectativas de inflación no se desanclen", respuesta: "objetivo" },
    { id: "poder-adquisitivo", texto: "Proteger el poder adquisitivo de la gente", respuesta: "objetivo" },
    { id: "subasta-un-dia", texto: "Subasta de liquidez a un día con los bancos", respuesta: "instrumento" },
    { id: "cuotas-hipotecarios", texto: "Las cuotas de los créditos hipotecarios suben", respuesta: "canal" },
    { id: "converger-meta", texto: "Converger a la meta de inflación del Banco", respuesta: "objetivo" },
  ],
  retro(item, elegida) {
    const nombre = (id) => this.categorias.find((c) => c.id === id).nombre;
    if (elegida === item.respuesta) return `✅ ${nombre(item.respuesta)} — bien identificado.`;
    return `❌ Esto es ${nombre(item.respuesta)}, no ${nombre(elegida)}. Pista: un instrumento es una herramienta que el Banco maneja; un canal es el camino por el que el efecto viaja; un tipo es la dirección de la decisión; un objetivo es la meta final.`;
  },
};

/* PM-9 — El Rezago */
export const EL_REZAGO = {
  subtema: "Rezagos de transmisión",
  pesoPosicion: 16,
  pesoCierre: 20,
  casos: [
    {
      id: "sube-enero",
      titulo: "El Banco sube la tasa en enero",
      hechos: [
        { id: "interbancario", texto: "La tasa del mercado interbancario se ajusta", razon: "Ocurre en días — es el mercado donde los bancos se prestan entre sí." },
        { id: "creditos-nuevos", texto: "Los bancos suben las tasas de sus créditos nuevos", razon: "Semanas — cada banco ajusta sus productos." },
        { id: "solicitudes", texto: "Bajan las solicitudes de crédito de consumo", razon: "Meses — la gente reacciona cuando ve las nuevas cuotas." },
        { id: "consumo-hogares", texto: "Se desacelera el consumo de los hogares", razon: "Varios meses — primero se posterga, después se nota en las cifras." },
        { id: "inflacion-cede", texto: "La inflación empieza a ceder", razon: "Varios trimestres — es el último eslabón y el más lento." },
      ],
    },
    {
      id: "baja-marzo",
      titulo: "El Banco baja la tasa en marzo",
      etiqueta: ROTULO_SIMULADO,
      hechos: [
        { id: "fondeo", texto: "El costo de fondeo de los bancos cae", razon: "Días — es lo primero que cambia." },
        { id: "creditos-baratos", texto: "Aparecen créditos más baratos en el mercado", razon: "Semanas — los bancos ajustan su oferta." },
        { id: "proyectos", texto: "Las empresas empiezan a aprobar proyectos que tenían frenados", razon: "Meses — requiere decisiones internas, no es automático." },
        { id: "maquinaria-contratacion", texto: "Aumenta la compra de maquinaria y la contratación", razon: "Varios meses — la ejecución toma su tiempo." },
        { id: "pib", texto: "Se ve el efecto en el crecimiento del PIB", razon: "Varios trimestres — es el resultado agregado final." },
      ],
    },
  ],
  retroBien: (hecho) => `✅ Correcto — ${hecho.razon}`,
  retroMal: (antesODespues) => `❌ Este hecho va ${antesODespues}. Recuerde: lo financiero reacciona en días, las decisiones de la gente en meses, y los precios y el crecimiento en trimestres.`,
  cierre: {
    pregunta: "¿Por qué la Junta decide mirando el pronóstico de inflación y no el dato del mes pasado?",
    correcta: "Porque su decisión de hoy solo va a surtir efecto dentro de varios trimestres.",
    retro: "✅ Correcto — si decidiera mirando el dato de hoy, siempre llegaría tarde. Por eso los bancos centrales trabajan con proyecciones.",
  },
};

/* ═══════════════════════════ BLOQUE 4 · MAESTRÍA ═══════════════════════════ */

/* PM-10 — El Dilema del Banquero Central. Sin miniatura animada. */
export const DILEMA_BANQUERO = {
  subtema: "Independencia y credibilidad",
  id: "dilema",
  rotulo: "CASO BASADO EN UN HECHO REAL",
  caso: "Un país tiene la inflación por encima del 20% y subiendo. El gobierno presiona públicamente al banco central para que BAJE las tasas de interés, argumentando que las tasas altas están frenando el crecimiento y el empleo. El banco central cede y las baja.",
  pregunta: "¿Qué es lo más probable que pase después?",
  correcta: "se-acelera",
  opciones: [
    { id: "baja-oferta", texto: "La inflación baja, porque tasas más bajas reactivan la producción y con más oferta bajan los precios", retro: "❌ Ese razonamiento confunde el canal: bajar tasas estimula la demanda, no la oferta. Más demanda con la misma producción empuja los precios hacia arriba, no hacia abajo." },
    { id: "se-acelera", texto: "La inflación se acelera y la moneda se devalúa, porque el mercado deja de creer que el banco central defenderá los precios", retro: "✅ Correcto — y esto no es teórico. Turquía hizo exactamente esto a finales de 2021: recortó tasas con la inflación por encima del 20%. Para octubre de 2022 la inflación llegó al 85% y la lira se desplomó. Cuando el mercado deja de creer que el banco central va a defender los precios, la política monetaria pierde su poder — y esa credibilidad es justamente lo que protege la independencia del banco." },
    { id: "no-pasa-nada", texto: "No pasa nada relevante: la tasa de interés no tiene efecto real sobre la inflación", retro: "❌ La tasa sí tiene efecto sobre la inflación — a través del crédito, del ahorro y del tipo de cambio. El problema del caso no es que no funcione, es que se usó en la dirección contraria a la que el escenario exigía." },
    { id: "crece-sin-precios", texto: "El crecimiento sube de forma sostenida sin efecto sobre los precios", retro: "❌ Con la inflación ya sobre 20%, la economía no tiene capacidad ociosa para absorber más demanda sin que los precios reaccionen." },
  ],
};

/* PM-11 — Duelo de Instrumentos */
export const DUELO_INSTRUMENTOS = {
  subtema: "Instrumentos (juicio comparativo)",
  casos: [
    {
      id: "frenar",
      caso: "La inflación está en 5,35% y el Banco necesita frenarla, sin sacudir demasiado el sistema financiero",
      etiqueta: "Escenario basado en datos reales de 2026",
      medidas: { a: "Subir la tasa de intervención", b: "Subir el encaje bancario", c: "Vender títulos mediante OMA" },
      ranking: ["a", "c", "b"],
      duelos: [
        { id: "a-vs-c", par: ["a", "c"], gana: "a", argumento: "La tasa es la señal que el mercado entiende y que mueve expectativas; las OMA sostienen esa señal, pero por sí solas no comunican una postura de política." },
        { id: "c-vs-b", par: ["c", "b"], gana: "c", argumento: "Vender títulos retira liquidez de forma gradual y reversible; subir el encaje es un golpe más brusco al balance de los bancos." },
        { id: "a-vs-b", par: ["a", "b"], gana: "a", argumento: "Mismo argumento: el encaje es el instrumento más contundente y el menos flexible — se reserva para situaciones donde la tasa no está siendo suficiente." },
      ],
    },
    {
      id: "estimular",
      caso: "La economía está estancada y el Banco quiere estimularla rápido",
      etiqueta: ROTULO_SIMULADO,
      medidas: { a: "Bajar la tasa de intervención", b: "Bajar el encaje bancario", c: "Comprar títulos mediante OMA" },
      ranking: ["a", "c", "b"],
      duelos: [
        { id: "a-vs-c", par: ["a", "c"], gana: "a", argumento: "Bajar la tasa es el anuncio que cambia las decisiones de crédito de todo el mercado; comprar títulos solo agrega liquidez sin comunicar una dirección." },
        { id: "c-vs-b", par: ["c", "b"], gana: "c", argumento: "Comprar títulos actúa de inmediato y se puede revertir; bajar el encaje libera plata pero depende de que los bancos decidan prestarla." },
        { id: "a-vs-b", par: ["a", "b"], gana: "a", argumento: "Mismo argumento — la tasa mueve el precio del crédito para todos; el encaje solo cambia cuánta plata está disponible, sin garantizar que se use." },
      ],
    },
  ],
};

/* PM-12 — Diseña la Respuesta Monetaria */
export const CASILLAS_RESPUESTA = [
  { id: "tipo", rotulo: "Tipo de política" },
  { id: "instrumento", rotulo: "Instrumento" },
  { id: "canal", rotulo: "Canal principal" },
  { id: "medida", rotulo: "Medida" },
  { id: "meta", rotulo: "Meta" },
];

export const DISENA_RESPUESTA = {
  subtema: "Integración — instrumento, tipo, canal y meta",
  castigoSenuelo: 5,
  /* [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] Una pieza correcta tocada para otra casilla. */
  retroOrden: "❌ Esa pieza es correcta, pero va en otra casilla.",
  casos: [
    {
      id: "apreciacion",
      caso: "Entra capital extranjero en grandes cantidades, el peso se fortalece demasiado rápido y los exportadores colombianos están perdiendo competitividad.",
      piezas: [
        { id: "ap-expansiva", casilla: "tipo", texto: "Expansiva", retro: "✅ Correcto — bajar la tasa reduce el atractivo de traer capital a Colombia." },
        { id: "ap-intervencion", casilla: "instrumento", texto: "Intervención en el mercado cambiario", retro: "✅ Correcto — el Banco compra dólares para frenar la apreciación del peso." },
        { id: "ap-cambiario", casilla: "canal", texto: "Canal cambiario", retro: "✅ Correcto — el problema y la solución están en el tipo de cambio." },
        { id: "ap-compra-reduce", casilla: "medida", texto: "El Banco de la República compra dólares en el mercado y reduce la tasa de intervención", retro: "✅ Correcto — combina las dos palancas que actúan sobre el mismo canal." },
        { id: "ap-frenar-apreciacion", casilla: "meta", texto: "Frenar la apreciación del peso para proteger la competitividad exportadora", retro: "✅ Correcto — medible, concreta y conectada al problema." },
        { id: "ap-contractiva", casilla: null, texto: "Contractiva", retro: "❌ Subir la tasa atraería aún más capital extranjero y apreciaría más el peso — agravaría el problema." },
        { id: "ap-encaje", casilla: null, texto: "Encaje bancario", retro: "❌ El encaje actúa sobre el crédito interno, no sobre la entrada de capitales." },
        { id: "ap-ahorro", casilla: null, texto: "Canal del ahorro", retro: "❌ El problema no está en cuánto ahorran los colombianos, sino en cuántos dólares están entrando." },
        { id: "ap-sube-13", casilla: null, texto: "Subir la tasa de intervención a 13%", retro: "❌ Dirección equivocada — eso atraería más capital todavía.", simulado: true },
        { id: "ap-deficit", casilla: null, texto: "Reducir el déficit fiscal en un punto del PIB", retro: "❌ Eso es política fiscal, no monetaria — no es una herramienta del Banco." },
        { id: "ap-aranceles", casilla: null, texto: "Subir los aranceles a las importaciones", retro: "❌ Eso es política comercial, decisión del gobierno, no del Banco." },
        { id: "ap-alimentos", casilla: null, texto: "Controlar la inflación de alimentos", retro: "❌ Meta real, pero de otro problema — aquí el asunto es la tasa de cambio." },
      ],
    },
    {
      id: "inflacion",
      caso: "La inflación lleva ocho meses por encima del rango meta y las expectativas de los analistas para el próximo año también se están desanclando hacia arriba.",
      piezas: [
        { id: "in-contractiva", casilla: "tipo", texto: "Contractiva", retro: "✅ Correcto — hay que enfriar la demanda para que los precios cedan." },
        { id: "in-tasa", casilla: "instrumento", texto: "Tasa de interés de intervención", retro: "✅ Correcto — es el instrumento principal y el que mueve expectativas." },
        { id: "in-credito", casilla: "canal", texto: "Canal del crédito", retro: "✅ Correcto — encarecer el crédito es la vía más directa para moderar la demanda." },
        { id: "in-sube-75", casilla: "medida", texto: "La Junta Directiva sube la tasa de intervención en 75 puntos básicos", retro: "✅ Correcto — acción concreta, con magnitud definida." },
        { id: "in-rango", casilla: "meta", texto: "Devolver la inflación al rango de 2% a 4% y reanclar las expectativas", retro: "✅ Correcto — usa la meta oficial real del Banco de la República." },
        { id: "in-expansiva", casilla: null, texto: "Expansiva", retro: "❌ Bajar la tasa con la inflación desanclada echaría más leña al fuego." },
        { id: "in-cambiario", casilla: null, texto: "Canal cambiario", retro: "❌ Contribuye, pero no es el canal principal: el problema es la demanda interna, no el tipo de cambio." },
        { id: "in-baja-encaje", casilla: null, texto: "Bajar el encaje bancario", retro: "❌ Eso liberaría más plata para prestar — es expansivo, la dirección contraria." },
        { id: "in-compra-oma", casilla: null, texto: "Comprar títulos mediante OMA", retro: "❌ Comprar títulos inyecta liquidez; aquí habría que retirarla, no agregarla." },
        { id: "in-gasto", casilla: null, texto: "Aumentar el gasto público en infraestructura", retro: "❌ Es política fiscal, y además expansiva — doble error para este caso." },
        { id: "in-desempleo-8", casilla: null, texto: "Reducir el desempleo al 8%", retro: "❌ Meta legítima, pero no es el objetivo de la política monetaria en este escenario.", simulado: true },
        { id: "in-iva", casilla: null, texto: "Eliminar exenciones al IVA", retro: "❌ Es tributación: política fiscal, no monetaria." },
      ],
    },
  ],
};

/* ═══════════════════════════ PUNTUACIÓN ═══════════════════════════ */

/** PM-6 y PM-12: todas las casillas acaban bien puestas; cada señuelo tocado resta. Piso 0. */
export const puntuarConSenuelos = (senuelos, castigo = 5) => Math.max(0, 100 - castigo * senuelos);

/** PM-9: 16 % por posición exacta, 20 % la pregunta de cierre. */
export const puntuarRezago = (posicionesBien, cierreBien) =>
  posicionesBien * EL_REZAGO.pesoPosicion + (cierreBien ? EL_REZAGO.pesoCierre : 0);
