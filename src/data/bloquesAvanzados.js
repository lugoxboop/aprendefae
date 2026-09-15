/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS NUEVE JUEGOS QUE COMPLETAN APLICACIÓN, ANÁLISIS Y MAESTRÍA.
 *
 * Tres por materia —Medio, Difícil y Experto—, con los que cada una llega a
 * doce actividades y ningún bloque del camino queda vacío. El contenido es el
 * de la ficha, literal. Donde la ficha dejó un hueco que la interfaz necesita
 * llenar, se dice en el propio dato con «ESCRITO AQUÍ» para que pedagogía lo
 * revise, y no se disimula.
 *
 * Tres parejas comparten mecánica a propósito —el reparto de actores, el
 * efecto protégé y la frontera de señales— entre Demanda Agregada y Política
 * Fiscal. Comparten componente; cada una trae su banco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════ POLÍTICA ECONÓMICA · MEDIO ═══════════════════════
 * «¿Se acerca o se aleja?» — un cambio, un objetivo, y predecir antes de ver.
 */

export const OPCIONES_ACERCA = [
  { id: "acerca", nombre: "Se acerca" },
  { id: "aleja", nombre: "Se aleja" },
];

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
 * La ficha pide "✅ Correcto — [razón de la fila]" pero no trae la razón de
 * ninguna fila. Las seis `razon` de abajo son mías: una frase cada una, con el
 * mismo mecanismo que el tema ya enseña. El resto de cada fila —cambio,
 * objetivo y respuesta correcta— sí es de la ficha, literal.
 */
export const CAMBIOS_ACERCA = [
  {
    id: "gasto-infraestructura",
    cambio: "Sube el gasto público en infraestructura",
    objetivo: "Reducir desempleo",
    correcta: "acerca",
    razon: "más obra pública es más contratación: el gasto entra directo a la Demanda Agregada y empuja el empleo.",
  },
  {
    id: "sube-tasa",
    cambio: "Sube la tasa de interés",
    objetivo: "Controlar inflación",
    correcta: "acerca",
    razon: "el crédito se encarece, se gasta menos y los precios pierden presión.",
  },
  {
    id: "bajan-aranceles",
    cambio: "Bajan los aranceles a un producto importado",
    objetivo: "Proteger la industria local",
    correcta: "aleja",
    razon: "con aranceles más bajos, lo importado llega más barato y le compite con más fuerza a lo que se produce aquí.",
  },
  {
    id: "peso-deprecia",
    cambio: "El peso se deprecia",
    objetivo: "Aumentar exportaciones",
    correcta: "acerca",
    razon: "con el peso más débil, lo que Colombia vende afuera les sale más barato a los compradores extranjeros.",
  },
  {
    id: "menos-impuestos-empresas",
    cambio: "Se reducen los impuestos a las empresas",
    objetivo: "Aumentar la inversión privada",
    correcta: "acerca",
    razon: "a las empresas les queda más utilidad para reinvertir.",
  },
  {
    id: "gasto-sin-ingresos",
    cambio: "Sube el gasto público sin control adicional de ingresos",
    objetivo: "Reducir el déficit fiscal",
    correcta: "aleja",
    razon: "si el gasto sube y los ingresos no, se agranda la brecha entre lo que el Estado gasta y lo que recauda.",
  },
];

export const retroAcerca = (fila, elegida) =>
  elegida === fila.correcta
    ? `✅ Correcto — ${fila.razon}`
    : `❌ Revisa la relación — este cambio ${fila.correcta === "acerca" ? "se acerca" : "se aleja"}, no lo contrario.`;

/* ═══════════════════════ POLÍTICA ECONÓMICA · DIFÍCIL ═══════════════════════
 * «El expediente del gabinete» — un caso, una decisión, todo o nada.
 */

export const CASO_GABINETE = {
  id: "gasto-mas-impuestos",
  caso: "El gobierno anuncia simultáneamente un aumento del gasto público en infraestructura Y un aumento de impuestos a las empresas para financiarlo.",
  pregunta: "¿Qué le pasa a la Demanda Agregada total?",
  correcta: "no-se-sabe",
  opciones: [
    { id: "sube", texto: "Sube", retro: "❌ Ignora que subir impuestos a las empresas frena la inversión al mismo tiempo." },
    { id: "baja", texto: "Baja", retro: "❌ Ignora que el gasto público entra directo a empujar la Demanda Agregada hacia arriba." },
    {
      id: "no-se-sabe",
      texto: "No se puede saber con certeza sin más datos",
      retro: "✅ Correcto — el gasto público empuja la Demanda Agregada hacia arriba, pero más impuestos a las empresas la empuja hacia abajo (vía menor inversión). Sin los números exactos, no puedes afirmar cuál domina.",
    },
  ],
};

/* ═══════════════════════ POLÍTICA ECONÓMICA · EXPERTO ═══════════════════════
 * «El consejo de ministros» — tres propuestas, tres duelos, un orden B > A > C.
 */

const POR_QUE_A_SOBRE_C = "El gasto público entra directo a la Demanda Agregada; bajar la tasa depende de que las empresas decidan invertir, algo menos seguro en una economía estancada.";

export const CASO_CONSEJO = {
  caso: "La economía está estancada: desempleo alto y algo de inflación.",
  medidas: {
    a: "Fiscal expansivo puro",
    b: "Mixto (gasto + baja leve de tasa)",
    c: "Solo monetario (baja fuerte de tasa)",
  },
  ranking: ["b", "a", "c"],
  duelos: [
    {
      id: "a-vs-b", par: ["a", "b"], gana: "b",
      argumento: "Combinar dos palancas reduce el riesgo de depender de una sola — si el gasto público tarda en ejecutarse, la tasa más baja ya está actuando.",
    },
    { id: "a-vs-c", par: ["a", "c"], gana: "a", argumento: POR_QUE_A_SOBRE_C },
    /*
     * [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
     * La ficha dice "same argument" sin decir cuál. La elección es mía: B gana
     * a C por lo mismo que A gana a C —B lleva el gasto que entra directo, y C
     * depende solo de que las empresas se animen—, así que se reusa ese texto.
     */
    { id: "b-vs-c", par: ["b", "c"], gana: "b", argumento: POR_QUE_A_SOBRE_C },
  ],
};

/* ═══════════════════════ REPARTO DE ACTORES · MEDIO ═══════════════════════
 * Demanda Agregada y Política Fiscal: tres rondas × cuatro personajes, a
 * GANA o PIERDE. El id del ítem es `<ronda>:<personaje>`.
 */

export const RONDAS_AUGE = [
  {
    id: "consumo",
    medida: "El Consumo sube con fuerza",
    personajes: [
      { id: "comerciante-ropa", nombre: "Comerciante minorista de ropa", resultado: "gana", explicacion: "Más consumo significa más ventas directas." },
      { id: "fabricante-consumo", nombre: "Fabricante de bienes de consumo", resultado: "gana", explicacion: "Más demanda de sus productos." },
      { id: "restaurante", nombre: "Dueño de un restaurante", resultado: "gana", explicacion: "La gente sale a comer más." },
      { id: "gota-a-gota", nombre: "Prestamista informal (gota a gota)", resultado: "pierde", explicacion: "Cuando la gente tiene más ingreso disponible para gastar, recurre menos a préstamos informales de emergencia." },
    ],
  },
  {
    id: "inversion",
    medida: "La Inversión cae",
    personajes: [
      { id: "trabajador-construccion", nombre: "Trabajador de la construcción", resultado: "pierde", explicacion: "Menos obras nuevas, menos trabajo." },
      { id: "alquiler-maquinaria", nombre: "Persona que alquila maquinaria a empresas", resultado: "pierde", explicacion: "Menos empresas invirtiendo, menos demanda de alquiler." },
      { id: "taller-reparacion", nombre: "Taller de reparación de maquinaria industrial", resultado: "gana", explicacion: "Si las empresas no compran máquinas nuevas, reparan más las que ya tienen." },
      { id: "banco-empresas", nombre: "Banco que presta a empresas", resultado: "pierde", explicacion: "Menos demanda de crédito para inversión." },
    ],
  },
  {
    id: "devaluacion",
    medida: "El peso colombiano se devalúa, impulsando las Exportaciones Netas",
    personajes: [
      { id: "agricola-exportador", nombre: "Productor agrícola exportador", resultado: "gana", explicacion: "Sus dólares valen más pesos." },
      { id: "importador-insumos", nombre: "Importador de insumos", resultado: "pierde", explicacion: "Con el peso más débil, lo importado le cuesta más." },
      { id: "trabajador-puertos", nombre: "Trabajador de puertos", resultado: "gana", explicacion: "Más actividad de exportación, más movimiento portuario." },
      { id: "consumidor-importados", nombre: "Consumidor de productos importados", resultado: "pierde", explicacion: "Los productos de afuera se encarecen para él." },
    ],
  },
];

/*
 * La primera ronda tiene tres PIERDE y un GANA a propósito: eliminar las
 * exenciones del IVA de verdad le duele a casi todos. La interfaz no deja
 * deducirlo: las dos zonas no tienen cupo ni cuentan cuántos quedan (ver
 * RolDeActores.jsx).
 */
export const RONDAS_AJUSTE = [
  {
    id: "iva",
    medida: "Se eliminan las exenciones al IVA",
    personajes: [
      { id: "familia-bajos-ingresos", nombre: "Familia de bajos ingresos", resultado: "pierde", explicacion: "El IVA le pesa proporcionalmente más — gasta casi todo su ingreso en bienes de consumo." },
      { id: "comprador-exentos", nombre: "Comprador de productos que antes tenían exención de IVA", resultado: "pierde", explicacion: "Esos productos específicos se le encarecen de forma directa." },
      { id: "altos-ingresos", nombre: "Persona de altos ingresos", resultado: "pierde", explicacion: "También paga más en términos absolutos, aunque le pese menos proporcionalmente." },
      { id: "recaudador", nombre: "Recaudador fiscal (el Estado)", resultado: "gana", explicacion: "Más base gravable sin exenciones significa más recaudo." },
    ],
  },
  {
    id: "mi-casa-ya",
    medida: "Sube el gasto en Mi Casa Ya",
    personajes: [
      { id: "familia-subsidio", nombre: "Familia que aplica al subsidio", resultado: "gana", explicacion: "Recibe la ayuda directamente." },
      { id: "constructora-vis", nombre: "Constructora de vivienda de interés social", resultado: "gana", explicacion: "Más contratos de construcción." },
      { id: "inversionista-bonos", nombre: "Inversionista que tiene bonos de deuda del gobierno colombiano", resultado: "pierde", explicacion: "Más gasto sin ingreso adicional aumenta el riesgo fiscal, lo que puede debilitar la confianza en la deuda del país." },
      { id: "trabajador-construccion", nombre: "Trabajador de la construcción", resultado: "gana", explicacion: "Más obra, más empleo." },
    ],
  },
  {
    id: "tes",
    medida: "Colombia emite más TES (deuda interna)",
    personajes: [
      { id: "banco-tes", nombre: "Banco que compra los TES", resultado: "gana", explicacion: "Recibe interés por el préstamo." },
      { id: "joven-futuro", nombre: "Un colombiano joven que empezará a pagar impuestos en el futuro", resultado: "pierde", explicacion: "Más deuda hoy significa más impuestos necesarios para pagarla después." },
      { id: "gobierno-actual", nombre: "Gobierno actual", resultado: "gana", explicacion: "Consigue liquidez inmediata." },
      { id: "fondo-pensiones", nombre: "Fondo de pensiones que invierte en TES", resultado: "gana", explicacion: "Recibe interés, igual que el banco." },
    ],
  },
];

/* La devolución de la ficha, para las dos. */
export const retroActor = (p, elegido) =>
  elegido === p.resultado
    ? `✅ ${p.nombre} — ${p.resultado === "gana" ? "Gana" : "Pierde"}.`
    : "❌ Revisa el efecto real de este cambio sobre su situación.";

/* ═══════════════════════ EFECTO PROTÉGÉ · DIFÍCIL ═══════════════════════
 * Cuatro frases de ocho para explicárselo a alguien sin formación en economía.
 *   bruto = claras − 0,5 × (jerga + falsas);  pct = clamp(bruto / 4, 0, 1) × 100
 */

export const FRASES_POR_EXPLICACION = 4;
export const CASTIGO_RUIDO_EXPLICA = 0.5;

export const EXPLICA_PACIENTE = {
  destinatario: "tu paciente",
  enunciado: "La Inversión de las empresas cayó fuerte este trimestre.",
  fragmentos: [
    { id: "pac-prestamos", tipo: "correcto", texto: "Las empresas pidieron menos préstamos porque la tasa de interés subió." },
    { id: "pac-esperar", tipo: "correcto", texto: "Con crédito más caro, muchas decidieron esperar antes de comprar maquinaria nueva." },
    { id: "pac-empleo", tipo: "correcto", texto: "Eso significa menos empleo en construcción y en fábricas de equipos." },
    { id: "pac-normal", tipo: "correcto", texto: "Es una reacción normal — cuando el crédito se encarece, las empresas invierten menos." },
    { id: "pac-elasticidad", tipo: "jerga", texto: "La contracción de la inversión responde a la elasticidad interés del gasto de capital empresarial." },
    { id: "pac-formacion-bruta", tipo: "jerga", texto: "Se observa una retracción en la formación bruta de capital fijo del sector privado." },
    { id: "pac-prohibio", tipo: "incorrecto", texto: "Las empresas invierten menos porque el gobierno se los prohibió." },
    { id: "pac-sin-relacion", tipo: "incorrecto", texto: "Esto no tiene relación con la tasa de interés." },
  ],
};

export const EXPLICA_CONTRIBUYENTE = {
  destinatario: "el contribuyente",
  enunciado: "El gobierno amplía la base gravable del impuesto a la renta.",
  fragmentos: [
    { id: "con-mas-personas", tipo: "correcto", texto: "Ahora más personas que antes no declaraban van a tener que hacerlo." },
    { id: "con-quien-gana-mas", tipo: "correcto", texto: "La idea es que quien gana más aporte más, no solo las empresas." },
    { id: "con-sin-subir-tarifa", tipo: "correcto", texto: "Es una forma de recaudar sin subir la tarifa que ya pagas." },
    { id: "con-distinto-iva", tipo: "correcto", texto: "Esto es distinto a subir el IVA — aquí sí importa cuánto ganas." },
    { id: "con-universo", tipo: "jerga", texto: "Se busca ampliar el universo de contribuyentes del impuesto directo sobre la renta de personas naturales." },
    { id: "con-progresividad", tipo: "jerga", texto: "La medida responde a criterios de progresividad tributaria y equidad vertical." },
    { id: "con-sube-iva", tipo: "incorrecto", texto: "Esto sube el IVA de todos los productos." },
    { id: "con-solo-empresas", tipo: "incorrecto", texto: "Solo afecta a las empresas, no a las personas." },
  ],
};

/* ═══════════════════════ FRONTERA DE SEÑALES · EXPERTO ═══════════════════════
 * Catorce datos, cinco relevantes. Se eligen los que explican.
 *   bruto = relevantes − 0,3 × señuelos;  pct = clamp(bruto / 5, 0, 1) × 100
 */

export const CASTIGO_SENUELO = 0.3;

export const SALA_ESPERA = {
  pregunta: "¿Por qué bajó el Consumo este mes específicamente?",
  relevantes: [
    { id: "tasa-consumo", texto: "Subió la tasa de los créditos de consumo" },
    { id: "confianza", texto: "Bajó la confianza del consumidor tras noticias de desempleo" },
    { id: "iva-productos", texto: "Subió el IVA a varios productos" },
    { id: "subsidios-navidenos", texto: "Se acabaron los subsidios navideños del año pasado" },
    { id: "salarios-inflacion", texto: "Los salarios no subieron al ritmo de la inflación este trimestre" },
  ],
  senuelos: [
    { id: "desempleo-3-anos", texto: "El desempleo ha bajado gradualmente en los últimos 3 años", porque: "De largo plazo, y en dirección contraria" },
    { id: "inflacion-2-anos", texto: "La inflación general del país fue alta hace 2 años", porque: "De otro período" },
    { id: "tasa-8-meses", texto: "El Banco de la República subió la tasa de interés hace 8 meses", porque: "De otro plazo — el efecto ya se sintió" },
    { id: "hipotecas", texto: "Las tasas hipotecarias subieron este trimestre", porque: "Efecto indirecto — otra categoría de consumo" },
    { id: "habitantes", texto: "Colombia tiene más de 50 millones de habitantes", porque: "Dato estático, no un cambio" },
    { id: "petroleo", texto: "El país exportó menos petróleo este año", porque: "Afecta XN, no Consumo directamente" },
    { id: "desempleo-ano-pasado", texto: "La tasa de desempleo subió ligeramente el año pasado", porque: "De otro período" },
    { id: "tasas-empresas", texto: "Las tasas de interés para empresas subieron este trimestre", porque: "Afecta Inversión, no Consumo" },
    { id: "salario-minimo-futuro", texto: "El gobierno anunció que subirá el salario mínimo el próximo año", porque: "Anuncio a futuro, aún no ocurre" },
  ],
};

export const COMITE_PRESUPUESTO = {
  pregunta: "¿Por qué creció el déficit fiscal este año específicamente?",
  relevantes: [
    { id: "menor-recaudo", texto: "Bajó el recaudo por menor crecimiento económico" },
    { id: "subsidios-vivienda", texto: "Subió el gasto en subsidios de vivienda" },
    { id: "beneficios-tributarios", texto: "Se ampliaron beneficios tributarios a un sector" },
    { id: "servicio-deuda", texto: "Subió el servicio de la deuda por tasas de interés más altas" },
    { id: "ingresos-petroleros", texto: "Cayeron los ingresos petroleros por menor precio internacional" },
  ],
  senuelos: [
    { id: "deficit-5-anos", texto: "El déficit fiscal ya era alto hace 5 años", porque: "De otro período" },
    { id: "sistema-renta-iva", texto: "Colombia tiene un sistema basado en renta e IVA", porque: "Estructural, no un cambio" },
    { id: "gobierno-anterior", texto: "El gobierno anterior dejó deuda importante", porque: "De un período anterior" },
    { id: "gasto-militar", texto: "Subió el gasto militar en la región", porque: "Indirecto y de magnitud baja" },
    { id: "turistas", texto: "El país recibió más turistas extranjeros este año", porque: "Afecta divisas, no recaudo central" },
    { id: "tasa-cambio", texto: "La tasa de cambio subió este año", porque: "Segundo orden — ya capturado por el servicio de la deuda" },
    { id: "desempleo-bajo", texto: "El desempleo bajó levemente este año", porque: "Dirección equivocada — mejoraría el recaudo" },
    { id: "elecciones", texto: "Hubo elecciones legislativas hace 2 años", porque: "De otro período, relación débil" },
    { id: "precio-cafe", texto: "El precio del café subió este año", porque: "Magnitud menor frente al petróleo, y dirección equivocada" },
  ],
};

/** El porcentaje de una frontera de señales, sin redondeos intermedios. */
export function puntuarFrontera(relevantesElegidas, senuelosElegidos, totalRelevantes = 5) {
  const bruto = relevantesElegidas - CASTIGO_SENUELO * senuelosElegidos;
  return Math.min(1, Math.max(0, bruto / totalRelevantes)) * 100;
}

/** El porcentaje de una explicación protégé, sin redondeos intermedios. */
export function puntuarExplicacion(claras, ruido) {
  const bruto = claras - CASTIGO_RUIDO_EXPLICA * ruido;
  return Math.min(1, Math.max(0, bruto / FRASES_POR_EXPLICACION)) * 100;
}
