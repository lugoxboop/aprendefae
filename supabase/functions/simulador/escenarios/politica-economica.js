/*
 * T2 · POLÍTICA ECONÓMICA — la oficina es PULSO, una firma que diagnostica
 * economías; la compañera es Olga, la gata analista del video de «La economía
 * con fiebre». Fuente: PyEM-PolEc-02-2026 (presentación del profesor).
 */
import { crearEscenario } from "./motor.js";

const PERSONA = "Eres Olga (la Dra. Olga), la analista sénior de Pulso. Eres una gata gris de gafas azules, seria pero cálida.";
const OFICINA = "Pulso, una firma colombiana que diagnostica economías como un médico diagnostica pacientes";
const ROL = "analista junior de Pulso";
const TITULO = "Conceptos económicos básicos: política económica";

const FUENTE = `- Autorregulación (ajuste propio) frente a intervención externa: a veces el mercado se corrige solo (si a un vendedor le sobran mangos, baja el precio y los vende); otras veces el mercado falla, el problema no se corrige solo y el Estado interviene. Esa intervención es la política económica. Cadena: mercado perfecto → fallos del mercado → política económica (¿fallos del Estado?).
- Los problemas económicos, origen de la política económica: restricciones al crecimiento (inconvenientes para que crezcan la producción, el ingreso y la renta; limitaciones en C, I, G, X); inflación (excesos de la DA sobre la producción generan aumento GENERALIZADO de precios); desempleo (las personas buscan empleo y el aparato productivo no las engancha); déficit público o fiscal (ingresos públicos menores que gastos públicos); déficit exterior o comercial (exportaciones menores que importaciones); concentración de la renta o desigualdad (grupos pequeños se apropian de volúmenes muy importantes de la renta; Gini); inadecuada asignación de recursos (acceso indiscriminado a ciertos bienes o exclusión del acceso a otros); impactos ambientales indeseados.
- Objetivos de la política económica: son los problemas planteados como solucionados. Estabilización (corregir inflación, desempleo, déficits fiscal y externo); redistribución de la renta (mover recursos hacia los menos favorecidos); asignación de recursos (facilitar o limitar el acceso a bienes con beneficios o perjuicios para la salud, el desarrollo mental y la convivencia); crecimiento económico (potenciar la capacidad de crecer); sostenibilidad ambiental (incentivar lo amigable con el ambiente, prevenir o corregir el daño).
- Ramas (políticas tradicionales): fiscal (finanzas públicas, impuestos, gasto público, subsidios); monetaria (moneda nacional, emisión, control del crédito, tasas de interés); cambiaria (moneda extranjera, precio del dólar en pesos, intervención del mercado cambiario); comercio exterior (exportaciones, importaciones, inversión extranjera, aranceles, subsidios). Políticas sectoriales (transversales): agropecuaria, competitividad, apoyo a mipymes, industrial, ciencia y tecnología, de rentas.
- Relación con la DA: DA = C + I + G + XN. La fiscal mueve G, los impuestos (t) y las transferencias (TR) que tocan el consumo; la monetaria mueve la tasa de interés (i) que toca la inversión (I − bi); la cambiaria y comercial mueven las exportaciones netas (XN).
- Ámbitos de acción (de lo general a lo concreto): problema (el desajuste: inflación, desempleo…); objetivo (el propósito: reducir la inflación…); estrategia (la rama elegida: política fiscal, monetaria, cambiaria, comercial…); instrumento (la herramienta de la rama: impuestos, tasas de interés, aranceles, encajes, subsidios, operaciones de mercado abierto, régimen cambiario…); medida (el manejo específico del instrumento: subir impuestos, bajar tasas, aumentar aranceles…); meta (el objetivo cuantificado con plazo: bajar la inflación del 8 % al 4 % en dos años). Un grupo lógico une los seis con coherencia. Ejemplo del profesor: desempleo → reducir el desempleo → política fiscal → impuesto a la renta de las empresas → reducirlo del 32 al 28 % → bajar el desempleo del 14 al 12 % en doce meses.
- Datos de clase de Colombia (cítalos como datos de clase): inflación 6 % frente a una meta de 3 %; desempleo 8,1 %; crecimiento 2,6 % (fin de 2025); Gini 0,54; déficit comercial de US$ 8.198,7 millones; 14,1 % de la población con una o más carencias. No uses otras cifras de Colombia.`;

const base = { persona: PERSONA, oficina: OFICINA, rol: ROL, fuenteTitulo: TITULO, fuente: FUENTE };

export const ESCENARIOS = [
  crearEscenario({
    ...base,
    id: "pe26-a1-mecanico",
    decision: "Lee el expediente de un mercado o una economía con un problema y decide si se corrige solo o si necesita que alguien de afuera intervenga.",
    opciones: {
      autorregulacion: "Autorregulación: el mercado se ajusta solo, desde adentro (precios, oferta y demanda), sin que nadie intervenga.",
      intervencion: "Intervención externa: el problema no se corrige solo (falla del mercado, crisis que persiste) y el Estado debe intervenir con política económica.",
    },
    multiple: false,
    caso: "El expediente es una situación concreta en un pueblo, mercado o país ficticio: qué pasó, cuánto duró y qué hicieron los involucrados.",
    rondas: {
      1: "Fácil: un caso evidente (un sobrante de un producto que baja de precio y se vende; o una crisis con desempleo masivo que lleva meses sin mejorar).",
      2: "Media: el caso trae cifras de varios meses; hay que mirar si el problema se está corrigiendo o no.",
      3: "Difícil, con trampa: un problema que se ve grave al principio pero el dato de tendencia muestra que se corrige solo; o al revés, uno que parece pequeño pero empeora y nadie lo corrige.",
    },
    delata: { autorregulacion: "autorregul|se (corrige|arregla|ajusta) solo", intervencion: "interven|pol[ií]tica econ[oó]mica|falla del mercado" },
  }),
  crearEscenario({
    ...base,
    id: "pe26-a2-fiebre",
    decision: "Lee los síntomas de un país enfermo y marca qué virus (problemas económicos) tiene.",
    opciones: {
      inflacion: "Inflación: excesos de la demanda agregada sobre la producción generan un aumento GENERALIZADO de precios (no de un solo producto).",
      desempleo: "Desempleo (paro): aunque las personas buscan empleo, el aparato productivo no las engancha.",
      recesion: "Restricciones al crecimiento (recesión): la economía tiene inconvenientes para que crezcan la producción, el ingreso y la renta (limitaciones en C, I, G, X).",
      deficitFiscal: "Déficit público (fiscal): los ingresos públicos son menores que los gastos públicos.",
      deficitExterno: "Déficit exterior (comercial): las exportaciones del país son menores que las importaciones.",
      desigualdad: "Concentración de la renta (desigualdad): volúmenes muy importantes de la renta son apropiados por grupos pequeños de la población. Se mide con el Gini.",
      asignacion: "Inadecuada asignación de recursos: acceso indiscriminado a ciertos bienes o exclusión del acceso a otros (por ejemplo, población con carencias).",
      ambiental: "Impactos ambientales indeseados: la producción o el consumo dañan el medio ambiente (contaminación, gases de efecto invernadero).",
    },
    multiple: true,
    caso: "El expediente es un país ficticio enfermo (nombre que suene latinoamericano o europeo): tres síntomas con datos observables y la frase de alguien que vive allí (una tendera, un desempleado, un exportador).",
    rondas: {
      1: "Fácil: UN solo problema, evidente. Los tres síntomas apuntan al mismo virus.",
      2: "Media: DOS problemas a la vez. Cada síntoma apunta claramente a uno de los dos.",
      3: "Difícil, con trampa: UN problema real y UN síntoma que parece otro problema pero no lo es. Trampas válidas: sube el precio de un solo producto (no es inflación, que es generalizada); el Estado se endeuda pero sus ingresos cubren sus gastos (no es déficit fiscal); el país importa mucho pero exporta más (no es déficit externo); desempleo estacional mínimo con la producción creciendo fuerte (no es recesión). La trampa NO va en la respuesta.",
    },
    delata: {
      inflacion: "inflaci[oó]n", desempleo: "desempleo|desemplead", recesion: "recesi[oó]n", deficitFiscal: "d[eé]ficit", deficitExterno: "d[eé]ficit",
      desigualdad: "desigualdad|\\bgini\\b", asignacion: "asignaci[oó]n", ambiental: "ambiental",
    },
  }),
  crearEscenario({
    ...base,
    id: "pe26-a3-problema-resuelto",
    decision: "Lee el problema que trae un país y escoge el objetivo de política económica que lo resuelve (el problema planteado como solucionado).",
    opciones: {
      estabilizacion: "Estabilización económica: corregir desajustes como inflación, desempleo, déficit fiscal y déficit externo.",
      redistribucion: "Redistribución de la renta: mover recursos de unos sectores a otros menos favorecidos para generar oportunidades.",
      asignacion: "Asignación de recursos: facilitar o limitar el acceso a bienes con beneficios o perjuicios para la salud, el desarrollo mental y la convivencia.",
      crecimiento: "Crecimiento económico: potenciar la capacidad de crecimiento de la economía.",
      sostenibilidad: "Sostenibilidad ambiental: incentivar acciones amigables con el ambiente o prevenir y corregir su daño.",
    },
    multiple: true,
    caso: "El expediente es el país ficticio de un cliente de Pulso con su problema, mostrado con datos (sin nombrar el problema ni el objetivo).",
    rondas: {
      1: "Fácil: un solo problema evidente con un solo objetivo.",
      2: "Media: dos problemas distintos con dos objetivos distintos.",
      3: "Difícil, con trampa: dos problemas que comparten el MISMO objetivo (por ejemplo, inflación y déficit fiscal → estabilización), así que la respuesta es una sola.",
    },
    delata: { estabilizacion: "estabiliz", redistribucion: "redistribu", asignacion: "asignaci[oó]n", crecimiento: "crecimiento", sostenibilidad: "sostenib" },
  }),
  crearEscenario({
    ...base,
    id: "pe26-a4-perillas",
    decision: "Lee la medida que tomó un gobierno o un banco central y di de qué rama de la política económica es.",
    opciones: {
      fiscal: "Política fiscal: finanzas públicas, impuestos, gasto público, subsidios, transferencias. Mueve G, t y TR en la DA.",
      monetaria: "Política monetaria: moneda nacional, emisión de dinero, control del crédito, tasas de interés, encaje. Mueve la tasa i y la inversión.",
      cambiaria: "Política cambiaria: moneda extranjera, precio del dólar en pesos, intervención en el mercado cambiario. Mueve XN.",
      comercial: "Política de comercio exterior: exportaciones, importaciones, inversión extranjera, aranceles, subsidios a exportar. Mueve XN.",
      sectorial: "Políticas sectoriales (transversales): agropecuaria, competitividad, apoyo a mipymes, industrial, ciencia y tecnología.",
    },
    multiple: false,
    caso: "El expediente es una medida concreta anunciada en un país ficticio: quién la anunció, qué cambia y a quién toca primero.",
    rondas: {
      1: "Fácil: una medida típica de su rama (subir el IVA, bajar la tasa de interés de referencia).",
      2: "Media: una medida menos obvia (subir el encaje bancario, un arancel a celulares importados, comprar dólares en el mercado).",
      3: "Difícil, con trampa: una medida que toca un sector pero cuyo instrumento es de otra rama (por ejemplo, un subsidio del presupuesto a los cafeteros es fiscal aunque ayude al agro; un arancel es comercial aunque mueva el precio de lo importado).",
    },
    delata: { fiscal: "fiscal", monetaria: "monetari", cambiaria: "cambiari", comercial: "comercio exterior|pol[ií]tica comercial", sectorial: "sectorial" },
  }),
  crearEscenario({
    ...base,
    id: "pe26-a5-escalera",
    decision: "Lee una frase de un plan de gobierno y di en qué peldaño (ámbito de acción) va.",
    opciones: {
      problema: "Problema: el desajuste que hay que resolver (inflación, desempleo, déficit…).",
      objetivo: "Objetivo: el propósito, el problema planteado como solucionado (reducir la inflación, generar crecimiento…).",
      estrategia: "Estrategia: la rama de política escogida (política fiscal, monetaria, cambiaria, comercial…).",
      instrumento: "Instrumento: la herramienta de esa rama (impuestos, tasas de interés, aranceles, encajes, subsidios…).",
      medida: "Medida: el manejo específico del instrumento (subir impuestos, bajar la tasa, aumentar aranceles…).",
      meta: "Meta: el objetivo cuantificado, con cifra y plazo (bajar la inflación del 8 % al 4 % en dos años).",
    },
    multiple: false,
    caso: "El expediente es un grupo lógico de un país ficticio. En el «titular» va la FRASE a clasificar, entre comillas. En los tres «datos» van otros peldaños del MISMO grupo lógico como contexto (dato = nombre del peldaño, ahora = su contenido, antes vacío, tendencia «dato»), nunca el peldaño de la respuesta. El testigo es quien redactó el plan.",
    rondas: {
      1: "Fácil: la frase es una meta con cifra y plazo, o un problema evidente.",
      2: "Media: distinguir instrumento de medida (el impuesto a la renta frente a bajarlo del 32 al 28 %).",
      3: "Difícil, con trampa: distinguir objetivo de meta (reducir la inflación frente a reducirla del 8 al 4 % en dos años) o estrategia de instrumento (política monetaria frente a tasa de interés).",
    },
  }),
];
