/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTENIDO DE LOS JUEGOS 4 A 7 DE POLÍTICA ECONÓMICA.
 *
 * Va aparte de juegosPolitica.js por tamaño, no por naturaleza: aquel se
 * quedaba en mil líneas con todo junto.
 *
 * DE DÓNDE SALEN LAS CIFRAS. Las de las actividades 4, 5 y 6 son del material
 * del profesor. Las de la 7 son inventadas para el ejercicio —una sequía y una
 * ola de ciberataques que no ocurrieron— y por eso esa actividad lleva un
 * aviso visible antes de empezar. Ninguna otra cifra se generó ni se estimó.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ ACTIVIDAD 4 — ¿Quién gana, quién pierde? ═══════════ */

export const OBJETIVO_GANADORES =
  "Vas a decidir quién gana y quién pierde con cada medida de política económica — no todo el mundo se ve afectado igual.";

/*
 * CUATRO RONDAS. La cuarta llegó corregida: sus dos ganadores llevaban antes la
 * respuesta en el nombre —"Contribuyente preocupado por la deuda del país",
 * "Persona preocupada por la inflación"— y como eran justo los dos que ganan,
 * leer los nombres resolvía la ronda entera por descarte. Los reemplazos
 * describen una POSICIÓN económica —tener bonos, cobrar una mesada fija— y hay
 * que razonar el efecto en vez de leerlo.
 *
 * LA PUNTUACIÓN SE DERIVA DEL NÚMERO DE RONDAS, no está escrita a mano: el
 * reparto 80/20 se reajusta solo si algún día entra o sale una ronda.
 */
export const RONDAS_GANADORES = [
  {
    id: "tasa",
    medida: "El Banco de la República sube la tasa de interés de referencia del 7% al 10%.",
    personajes: [
      {
        id: "hipoteca",
        nombre: "Alguien con crédito hipotecario a tasa variable",
        resultado: "pierde",
        explicacion: "Su cuota mensual sube porque el crédito se encarece.",
      },
      {
        id: "cdt",
        nombre: "Ahorrador con CDT (certificado de depósito a término)",
        resultado: "gana",
        explicacion: "El banco le paga más interés por su dinero guardado.",
      },
      {
        id: "empresario",
        nombre: "Empresario que quiere un préstamo para expandir su negocio",
        resultado: "pierde",
        explicacion: "Pedir prestado para invertir ahora cuesta más.",
      },
      {
        id: "bonos",
        nombre: "Inversionista extranjero que compra bonos colombianos",
        resultado: "gana",
        explicacion: "Tasas más altas en Colombia atraen capital extranjero buscando mejor rendimiento.",
      },
    ],
    masDirecto: "hipoteca",
    porqueDirecto:
      "Su cuota mensual cambia de inmediato — el efecto más directo y recurrente de los 4.",
  },
  {
    id: "aranceles",
    medida: "El gobierno sube los aranceles al acero del 10% al 20%.",
    personajes: [
      {
        id: "productor",
        nombre: "Productor local de acero",
        resultado: "gana",
        explicacion: "Enfrenta menos competencia del acero importado, ahora más caro.",
      },
      {
        id: "constructora",
        nombre: "Constructora que compra acero importado para sus obras",
        resultado: "pierde",
        explicacion: "Su insumo principal se encarece.",
      },
      {
        id: "consumidor",
        nombre: "Consumidor que compra electrodomésticos con partes de acero",
        resultado: "pierde",
        explicacion: "El costo del arancel termina reflejado en el precio final.",
      },
      {
        id: "trabajador",
        nombre: "Trabajador de una acerería local",
        resultado: "gana",
        explicacion: "Más demanda por el producto local puede traducirse en más empleo estable.",
      },
    ],
    masDirecto: "constructora",
    porqueDirecto:
      "Su insumo principal se encarece directamente — impacto estructural en sus costos.",
  },
  {
    id: "devaluacion",
    medida: "El peso se deprecia — el tipo de cambio sube de COP 3.500 a COP 3.900 por dólar.",
    personajes: [
      {
        id: "cafetero",
        nombre: "Exportador de café",
        resultado: "gana",
        explicacion: "Cada dólar que recibe por sus ventas ahora vale más pesos.",
      },
      {
        id: "viajero",
        nombre: "Persona que va a viajar a Estados Unidos de vacaciones",
        resultado: "pierde",
        explicacion: "Cada dólar que necesita comprar le cuesta más pesos.",
      },
      {
        id: "importadora",
        nombre: "Empresa que importa maquinaria desde EE.UU.",
        resultado: "pierde",
        explicacion: "Pagar en dólares por maquinaria ahora cuesta más en pesos.",
      },
      {
        id: "remesas",
        nombre: "Colombiano que recibe remesas de un familiar en el exterior",
        resultado: "gana",
        explicacion: "Los dólares que le envían se convierten en más pesos que antes.",
      },
    ],
    masDirecto: "cafetero",
    porqueDirecto:
      "Todo su ingreso depende de esa conversión — el efecto es sobre el 100% de lo que gana.",
  },
  {
    id: "gasto",
    medida: "El gobierno reduce el gasto público en 5 billones de pesos.",
    personajes: [
      {
        id: "empleado",
        nombre: "Empleado de un programa gubernamental que depende de ese gasto",
        resultado: "pierde",
        explicacion: "Su programa está más expuesto a recortes.",
      },
      {
        id: "contratista",
        nombre: "Empresa contratista que le vende insumos al Estado",
        resultado: "pierde",
        explicacion: "Menos gasto público puede significar menos contratos para su empresa.",
      },
      {
        id: "bonos",
        nombre: "Inversionista que tiene bonos de deuda del gobierno colombiano",
        resultado: "gana",
        explicacion: "Menos gasto público reduce el riesgo de que el gobierno no pueda pagar su deuda — eso hace más seguros y valiosos sus bonos.",
      },
      {
        id: "pensionado",
        nombre: "Pensionado que recibe una mesada fija, sin ajuste automático por inflación",
        resultado: "gana",
        explicacion: "Su pensión no sube con la inflación — cuando los precios suben menos, su dinero le rinde más.",
      },
    ],
    masDirecto: "empleado",
    porqueDirecto:
      "Su sustento depende directamente de ese gasto — el riesgo es inmediato.",
    /*
     * La única ronda con mensaje propio por cada elección equivocada. Las otras
     * tres usan la plantilla genérica: aquí los cuatro efectos son reales y lo
     * que los separa es el PLAZO, así que decir solo "el otro lo siente más
     * directo" no enseñaría por qué.
     */
    retroPropia: {
      correcto: "✅ Correcto — su empleo o programa puede recortarse de inmediato; los otros tres sienten el efecto más lento o indirecto (a través del mercado de deuda o de precios que suben más despacio).",
      contratista: "❌ También se ve afectada, pero un recorte de contratos suele tardar más en concretarse que el riesgo inmediato sobre un empleo que depende directamente del gasto.",
      bonos: "❌ El efecto es real, pero pasa a través del mercado de deuda — es más indirecto y gradual que el riesgo inmediato de un empleo.",
      pensionado: "❌ El beneficio es real, pero se siente poco a poco a medida que baja la inflación — no es un cambio inmediato.",
    },
  },
];

export const PREGUNTA_DIRECTO =
  "¿Cuál de los 4 siente el cambio de forma más directa e inmediata?";

/*
 * Si la ronda trae mensajes propios se usan esos; si no, la plantilla genérica
 * con los nombres de los dos personajes.
 */
export function retroDirecto(ronda, elegidoId) {
  const propia = ronda.retroPropia;
  const acierta = elegidoId === ronda.masDirecto;
  if (propia) return acierta ? propia.correcto : propia[elegidoId];
  const nombre = (id) => ronda.personajes.find((p) => p.id === id).nombre;
  return acierta
    ? "✅ Correcto — es quien más directamente siente el cambio en su día a día."
    : `❌ ${nombre(elegidoId)} también se ve afectado, pero ${nombre(ronda.masDirecto)} lo siente de forma más directa e inmediata.`;
}

/* ═══════════ ACTIVIDAD 5 — Corriente de titulares ═══════════ */

export const OBJETIVO_CORRIENTE =
  "Clasifica cada enunciado en su categoría antes de que la cinta se lo lleve — cada vez más rápido.";

export const CATEGORIAS = [
  { id: "problema", nombre: "Problema", razon: "✅ Es Problema — el hecho que dispara toda la cadena." },
  { id: "objetivo", nombre: "Objetivo", razon: "✅ Es Objetivo — lo que se busca lograr, sin cifra ni instrumento todavía." },
  { id: "estrategia", nombre: "Estrategia", razon: "✅ Es Estrategia — la rama de política, no el instrumento específico." },
  { id: "instrumento", nombre: "Instrumento", razon: "✅ Es Instrumento — la herramienta genérica, sin el número aplicado todavía." },
  { id: "medida", nombre: "Medida", razon: "✅ Es Medida — la acción concreta, ya con el instrumento aplicado y cifras." },
  { id: "meta", nombre: "Meta", razon: "✅ Es Meta — el resultado esperado, cuantificado y con plazo." },
];

/*
 * Veintinueve enunciados. Estrategia solo tiene CUATRO porque el universo real
 * de ramas de política es ese: fiscal, monetaria, comercial y cambiaria.
 * Inventar una quinta para que la lista quedara pareja sería enseñar una rama
 * que no existe, así que de esa categoría se sacan tres de cuatro.
 */
export const BANCO_CORRIENTE = [
  { id: "p1", categoria: "problema", texto: "Se dispararon los precios en Colombia y crecieron al 12% en 2024" },
  { id: "p2", categoria: "problema", texto: "Desempleo del 23%" },
  { id: "p3", categoria: "problema", texto: "Las importaciones de acero de China están inundando el mercado nacional" },
  { id: "p4", categoria: "problema", texto: "El país registra un déficit comercial creciente en los últimos tres años" },
  { id: "p5", categoria: "problema", texto: "La inversión privada cayó 12% en el último año" },

  { id: "o1", categoria: "objetivo", texto: "Controlar la inflación" },
  { id: "o2", categoria: "objetivo", texto: "Reducir el desempleo" },
  { id: "o3", categoria: "objetivo", texto: "Controlar las importaciones de China a Colombia" },
  { id: "o4", categoria: "objetivo", texto: "Incrementar la inversión privada" },
  { id: "o5", categoria: "objetivo", texto: "Promover la devaluación del tipo de cambio" },

  { id: "e1", categoria: "estrategia", texto: "Política fiscal" },
  { id: "e2", categoria: "estrategia", texto: "Política monetaria" },
  { id: "e3", categoria: "estrategia", texto: "Política comercial" },
  { id: "e4", categoria: "estrategia", texto: "Política cambiaria" },

  { id: "i1", categoria: "instrumento", texto: "Impuestos" },
  { id: "i2", categoria: "instrumento", texto: "Tasa de interés" },
  { id: "i3", categoria: "instrumento", texto: "Aranceles" },
  { id: "i4", categoria: "instrumento", texto: "Subsidios" },
  { id: "i5", categoria: "instrumento", texto: "Gasto público" },

  { id: "m1", categoria: "medida", texto: "Reducción de impuestos directos a las empresas" },
  { id: "m2", categoria: "medida", texto: "Reducir la tasa de interés de referencia del 10% al 8%" },
  { id: "m3", categoria: "medida", texto: "Subir los aranceles al acero del 10% al 20%" },
  { id: "m4", categoria: "medida", texto: "El Banco de la República comprará 300 millones de dólares en el mercado cambiario" },
  { id: "m5", categoria: "medida", texto: "Reducción del gasto del Gobierno en 5 billones de pesos" },

  { id: "t1", categoria: "meta", texto: "Aumentar la inversión privada en 8% en los próximos 18 meses" },
  { id: "t2", categoria: "meta", texto: "Reducción del desempleo del 23% al 20% en un año" },
  { id: "t3", categoria: "meta", texto: "Reducir las importaciones de acero en un 20% en tres meses" },
  { id: "t4", categoria: "meta", texto: "Se espera que el tipo de cambio baje de COP5000 a COP4200" },
  { id: "t5", categoria: "meta", texto: "Reducir el déficit fiscal en 1 punto del PIB para fin de año" },
];

/* Cuántas cartas trae una tanda: tres por categoría donde el banco alcanza. */
export const POR_CATEGORIA = 3;
export const CARTAS_POR_TANDA = CATEGORIAS.reduce(
  (n, c) => n + Math.min(POR_CATEGORIA, BANCO_CORRIENTE.filter((x) => x.categoria === c.id).length),
  0
);

export const retroCorriente = (real, elegida) => {
  if (real === elegida) return CATEGORIAS.find((c) => c.id === real).razon;
  const nr = CATEGORIAS.find((c) => c.id === real).nombre;
  const ne = CATEGORIAS.find((c) => c.id === elegida).nombre;
  return `❌ Esto es ${nr}, no ${ne}.`;
};

/* ═══════════ ACTIVIDAD 6 — Explica la política ═══════════ */

export const OBJETIVO_EXPLICA =
  "Arma una explicación que tu vecino sin idea de economía pueda entender — nada de tecnicismos.";

export const RANURAS_EXPLICA = 4;

/*
 * DOS CLASES DE FRAGMENTO MALO, Y LA DIFERENCIA IMPORTA.
 *
 *   jerga       es VERDAD, pero el vecino no la entiende.
 *   incorrecto  es FALSO.
 *
 * Cuestan lo mismo a propósito —media pieza cada uno— pero el mensaje dice
 * cuál de los dos errores fue. Confundir "dijiste algo cierto que nadie
 * entiende" con "dijiste algo falso" borraría la lección entera.
 */
export const ESCENARIOS_EXPLICA = [
  {
    id: "tasa",
    enunciado: "El Banco de la República subió la tasa de interés del 7% al 10%.",
    fragmentos: [
      { id: "ta1", tipo: "correcto", texto: "Subieron la tasa para que pedir prestado sea más caro y así la gente gaste menos.", feedback: "Claro y directo — así se entiende sin tecnicismos." },
      { id: "ta2", tipo: "correcto", texto: "Si la gente gasta menos, los precios dejan de subir tan rápido.", feedback: "Bien — conecta la causa con el efecto en lenguaje simple." },
      { id: "ta3", tipo: "correcto", texto: "Es la forma que tiene el Banco de frenar la inflación sin subir impuestos.", feedback: "Bien — aclara que es una herramienta distinta a la fiscal." },
      { id: "ta4", tipo: "correcto", texto: "A cambio, ahorrar se vuelve más atractivo porque el banco paga más interés.", feedback: "Bien — muestra el otro lado de la moneda, no solo el costo." },
      { id: "ta5", tipo: "jerga", texto: "Se busca contraer la demanda agregada mediante la transmisión de política monetaria vía el canal de tasas de interés.", feedback: "Correcto técnicamente, pero tu vecino no te va a entender — usa jerga innecesaria." },
      { id: "ta6", tipo: "jerga", texto: "El ajuste responde a la necesidad de anclar las expectativas inflacionarias del mercado.", feedback: "Es jerga de economista — 'anclar expectativas' no significa nada sin el término." },
      { id: "ta7", tipo: "incorrecto", texto: "Subieron la tasa para que el gobierno tenga más dinero directamente.", feedback: "Esto es falso — la tasa de interés no es un ingreso directo para el gobierno." },
      { id: "ta8", tipo: "incorrecto", texto: "Esto hace que los precios bajen inmediatamente al día siguiente.", feedback: "Esto es falso — el efecto sobre los precios toma tiempo, no es inmediato." },
    ],
  },
  {
    id: "aranceles",
    enunciado: "El gobierno sube los aranceles al acero del 10% al 20%.",
    fragmentos: [
      { id: "ar1", tipo: "correcto", texto: "Suben los aranceles para que el acero importado sea más caro, y así la gente compre más acero hecho aquí.", feedback: "Claro y directo." },
      { id: "ar2", tipo: "correcto", texto: "Eso protege a las fábricas locales de acero de la competencia extranjera.", feedback: "Bien — explica el propósito sin tecnicismos." },
      { id: "ar3", tipo: "correcto", texto: "El lado malo es que todo lo que se construye con acero importado también se encarece.", feedback: "Bien — muestra el costo, no solo el beneficio." },
      { id: "ar4", tipo: "correcto", texto: "Es una forma de proteger empleo local, aunque suba un poco el costo de las cosas.", feedback: "Bien — balance honesto entre beneficio y costo." },
      { id: "ar5", tipo: "jerga", texto: "La medida busca corregir una asimetría de competitividad vía la imposición de barreras arancelarias no automáticas.", feedback: "Correcto técnicamente, pero es jerga que tu vecino no va a entender." },
      { id: "ar6", tipo: "jerga", texto: "Se pretende internalizar la protección efectiva nominal del sector siderúrgico doméstico.", feedback: "Jerga pura — nadie sin formación en economía entiende esto." },
      { id: "ar7", tipo: "incorrecto", texto: "Suben los aranceles para que el gobierno se quede con el acero directamente.", feedback: "Esto es falso — el arancel no le da el acero al gobierno." },
      { id: "ar8", tipo: "incorrecto", texto: "Esto hace que el acero nacional también baje de precio automáticamente.", feedback: "Esto es falso — el arancel no baja precios, los sube al encarecer el importado." },
    ],
  },
];

/* ═══════════ ACTIVIDAD 7 — El simulador de crisis ═══════════ */

export const OBJETIVO_CRISIS =
  "Te dan solo el problema. Construye tú el resto de la cadena, sin ayuda.";

/*
 * LOS DOS CASOS SON INVENTADOS. Ni la sequía ni la ola de ciberataques
 * ocurrieron: están construidos para el ejercicio, y por eso la actividad lo
 * dice en pantalla antes de que el estudiante toque nada. Es la única de las
 * siete cuyas cifras no salen del material del profesor.
 */
export const AVISO_CRISIS =
  "Caso hipotético — construido para este ejercicio, no corresponde a una crisis real de Colombia.";

export const RANURAS_CRISIS = ["objetivo", "estrategia", "instrumento", "medida", "meta"];

export const NOMBRES_RANURA = {
  objetivo: "Objetivo",
  estrategia: "Estrategia",
  instrumento: "Instrumento",
  medida: "Medida",
  meta: "Meta",
};

/*
 * "Política monetaria" es SEÑUELO en la sequía y la ESTRATEGIA CORRECTA en la
 * corrida bancaria. No es un descuido: la misma rama encaja o no según cuál
 * sea el problema, y esa es justo la lección. Por eso cada caso lleva sus
 * piezas con id propio y nada se comparte entre los dos.
 */
export const CASOS_CRISIS = [
  {
    id: "sequia",
    problema:
      "Una sequía golpea la producción agrícola y el precio de los alimentos se dispara en todo el país.",
    /*
     * LA CADENA CAMBIÓ DE ESTRATEGIA, Y POR UNA RAZÓN PEDAGÓGICA.
     *
     * Antes la respuesta correcta era "Política sectorial (agropecuaria)". Es
     * contenido real del profesor, pero no se practica en ninguna otra parte
     * del sitio: usarla como respuesta en la actividad más dura y menos guiada
     * de las siete medía familiaridad con un término suelto, no razonamiento.
     *
     * Ahora la cadena va por política comercial, que sí se trabaja en el resto
     * del tema. El problema y la meta no se tocaron.
     *
     * OJO CON LA DIRECCIÓN, que es donde está la trampa buena: se BAJAN los
     * aranceles para que entre comida más barata. Subirlos —el señuelo nuevo—
     * empeora la escasez. Es el mismo instrumento apuntando al revés.
     */
    piezas: [
      { id: "sq-o", ranura: "objetivo", texto: "Controlar la inflación de alimentos y proteger el ingreso de las familias más vulnerables", feedback: "✅ Correcto — responde directamente al problema planteado." },
      { id: "sq-e", ranura: "estrategia", texto: "Política comercial", feedback: "✅ Correcto — permite actuar rápido sobre la oferta disponible en el país sin depender de otro sector." },
      { id: "sq-i", ranura: "instrumento", texto: "Aranceles a la importación de alimentos", feedback: "✅ Correcto — es la palanca directa sobre cuánta comida puede entrar del exterior." },
      { id: "sq-m", ranura: "medida", texto: "Reducir o eliminar temporalmente los aranceles a la importación de alimentos básicos, para facilitar el ingreso de productos más baratos del exterior", feedback: "✅ Correcto — nota la dirección: se BAJAN los aranceles para aliviar la escasez, no se suben." },
      { id: "sq-t", ranura: "meta", texto: "Reducir el precio de los alimentos básicos en 10% en 6 meses", feedback: "✅ Correcto — medible, con plazo, conectada al problema." },

      /* El mismo instrumento, al revés: la confusión que de verdad importa. */
      { id: "sq-d1", senuelo: true, texto: "Aumentar los aranceles a la importación de alimentos", feedback: "❌ Dirección equivocada — subir aranceles encarece más la comida importada y empeora la escasez, no la alivia." },
      /* Fue el instrumento correcto de la versión anterior, y sigue siendo defendible. */
      { id: "sq-d2", senuelo: true, texto: "Subsidios a la producción agrícola", feedback: "❌ Es una respuesta real y defendible, pero más lenta — no alivia el precio en 6 meses como bajar aranceles." },
      { id: "sq-d3", senuelo: true, texto: "Política monetaria", feedback: "❌ No es la estrategia más directa — un shock de oferta agrícola no se resuelve moviendo tasas de interés." },
      { id: "sq-d4", senuelo: true, texto: "Reducir la tasa de interés del 10% al 8%", feedback: "❌ Medida real, pero de política monetaria, no de esta crisis." },
      { id: "sq-d5", senuelo: true, texto: "Aumentar las exportaciones del país", feedback: "❌ Objetivo real, pero de otro contexto." },
      { id: "sq-d6", senuelo: true, texto: "Reducir el desempleo", feedback: "❌ Objetivo plausible en general, pero no es el foco de esta crisis." },
      { id: "sq-d7", senuelo: true, texto: "El Banco de la República comprará 300 millones de dólares en el mercado cambiario", feedback: "❌ Medida de política cambiaria — no resuelve una crisis de oferta agrícola." },
    ],
},
  {
    id: "ciber",
    problema:
      "Una ola de ciberataques afecta a varios bancos colombianos, y los clientes empiezan a retirar su dinero por miedo a perderlo.",
    piezas: [
      { id: "cb-o", ranura: "objetivo", texto: "Restaurar la confianza en el sistema financiero y evitar una salida masiva de depósitos", feedback: "✅ Correcto — responde directamente al problema planteado." },
      { id: "cb-e", ranura: "estrategia", texto: "Política monetaria", feedback: "✅ Correcto — el Banco de la República actúa como garante de liquidez en estos casos." },
      { id: "cb-i", ranura: "instrumento", texto: "Intervención del mercado y garantías de liquidez", feedback: "✅ Correcto — la herramienta típica ante una corrida bancaria." },
      { id: "cb-m", ranura: "medida", texto: "El Banco de la República garantiza liquidez de emergencia a los bancos afectados", feedback: "✅ Correcto — la acción concreta ante la crisis." },
      { id: "cb-t", ranura: "meta", texto: "Estabilizar los retiros bancarios en menos de un mes, sin que ningún banco quede insolvente", feedback: "✅ Correcto — medible, con plazo, conectada al problema." },

      { id: "cb-d1", senuelo: true, texto: "Política comercial", feedback: "❌ No es un problema de comercio exterior." },
      { id: "cb-d2", senuelo: true, texto: "Subir los aranceles a la tecnología importada", feedback: "❌ No resuelve un problema de confianza bancaria." },
      { id: "cb-d3", senuelo: true, texto: "Reducir la tasa de interés del 10% al 8%", feedback: "❌ Medida real, pero no la respuesta a una corrida bancaria." },
      { id: "cb-d4", senuelo: true, texto: "Aumentar las exportaciones del país", feedback: "❌ Objetivo de otro contexto." },
      { id: "cb-d5", senuelo: true, texto: "Reducir el desempleo", feedback: "❌ No es el foco de esta crisis." },
      { id: "cb-d6", senuelo: true, texto: "Aplicar subsidios a la producción agrícola", feedback: "❌ Instrumento de otro caso, sector equivocado." },
      { id: "cb-d7", senuelo: true, texto: "Reducir las importaciones de acero en 20%", feedback: "❌ Meta de un caso completamente distinto." },
    ],
  },
];
