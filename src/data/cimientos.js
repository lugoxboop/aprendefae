import { DEUDA_VS_SERVICIO } from "./politicaFiscal.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CIMIENTOS — los seis juegos Fácil de Macroeconomía.
 *
 * El primer bloque del camino y la primera victoria fácil de quien abre un
 * tema. Dos mecánicas, LAS MISMAS en las tres materias a propósito: la entrada
 * tiene que sentirse igual abra el estudiante la materia que abra. La
 * variedad vive en los bloques de arriba.
 *
 *   Memorama               exploratoria · encontrar las parejas término-definición
 *   Primera clasificación  evaluativa   · seis de ocho, sin reloj, a su categoría
 *
 * Todo el texto vive aquí; los componentes dibujan y puntúan. Las
 * devoluciones son las de la ficha, con sus huecos entre corchetes rellenados
 * por el componente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════ MEMORAMAS ═══════════════════════════ */

/*
 * Cada pareja es un término y su definición. El id de la pareja es la unidad
 * del panel (ver Memorama.jsx: qué cuenta como ítem en un juego de memoria).
 * Las posiciones se barajan en cada partida: esa es la rejugabilidad, sin un
 * banco más grande.
 */
export const MEMORAMAS = {
  "memorama-tesoro": {
    subtema: "Los 6 niveles del grupo lógico",
    pares: [
      { id: "problema", termino: "Problema", definicion: "El hecho o cifra que hay que resolver" },
      { id: "objetivo", termino: "Objetivo", definicion: "Lo que se busca lograr, sin instrumento todavía" },
      { id: "estrategia", termino: "Estrategia", definicion: "La rama de política elegida (fiscal, monetaria, etc.)" },
      { id: "instrumento", termino: "Instrumento", definicion: "La herramienta genérica disponible dentro de esa rama" },
      { id: "medida", termino: "Medida", definicion: "La acción concreta, ya con cifras aplicadas" },
      { id: "meta", termino: "Meta", definicion: "El resultado esperado, medible y con plazo" },
    ],
  },
  "memorama-corazon": {
    subtema: "Los 4 componentes",
    pares: [
      { id: "c", termino: "C", definicion: "Consumo — lo que gastan las familias" },
      { id: "i", termino: "I", definicion: "Inversión — lo que gastan las empresas para crecer" },
      { id: "g", termino: "G", definicion: "Gasto Público — lo que gasta el Estado" },
      { id: "xn", termino: "XN", definicion: "Exportaciones Netas — lo que el país vende afuera, menos lo que compra afuera" },
    ],
  },
  "memorama-tesoreria": {
    subtema: "Los 3 instrumentos",
    pares: [
      { id: "cobra", termino: "Cobra (Tributación)", definicion: "Impuestos y pagos que los ciudadanos hacen al Estado" },
      { id: "gasta", termino: "Gasta (Gasto del Gobierno)", definicion: "Lo que el Estado invierte y paga para funcionar" },
      { id: "pide", termino: "Pide prestado (Deuda Pública)", definicion: "Lo que el Estado debe, interna o externamente" },
    ],
  },
};

/* ═══════════════════════════ PRIMERA CLASIFICACIÓN ═══════════════════════════ */

/* Seis de ocho por partida: el sorteo cambia qué seis, no cuántos. */
export const ITEMS_POR_PARTIDA = 6;

export const CLASIFICACIONES = {
  "que-rama-es": {
    pregunta: "¿De qué rama de la política económica es esta medida?",
    categorias: [
      { id: "fiscal", nombre: "Fiscal" },
      { id: "monetaria", nombre: "Monetaria" },
      { id: "cambiaria", nombre: "Cambiaria" },
      { id: "comercial", nombre: "Comercial" },
    ],
    items: [
      { id: "sube-impuestos", texto: "El gobierno sube los impuestos", respuesta: "fiscal" },
      { id: "sube-tasa", texto: "El Banco de la República sube la tasa de interés", respuesta: "monetaria" },
      { id: "compra-dolares", texto: "El gobierno interviene comprando dólares", respuesta: "cambiaria" },
      { id: "sube-aranceles", texto: "El gobierno sube los aranceles a un producto importado", respuesta: "comercial" },
      { id: "hospital", texto: "El gobierno construye un hospital nuevo", respuesta: "fiscal" },
      { id: "vende-dolares", texto: "El Banco de la República vende dólares en el mercado", respuesta: "cambiaria" },
      { id: "baja-impuesto-empresas", texto: "El gobierno reduce un impuesto a las empresas", respuesta: "fiscal" },
      { id: "tratado", texto: "Se firma un tratado de libre comercio", respuesta: "comercial" },
    ],
    acierto: (real) => `✅ ${real} — bien identificado.`,
    fallo: (real, elegida) => `❌ Esto es ${real.toLowerCase()}, no ${elegida.toLowerCase()}.`,
  },

  /* La versión sin reloj de la Sala de monitores. */
  "cual-componente": {
    pregunta: "¿Por cuál componente entra a la Demanda Agregada?",
    categorias: [
      { id: "c", nombre: "Consumo (C)" },
      { id: "i", nombre: "Inversión (I)" },
      { id: "g", nombre: "Gasto Público (G)" },
      { id: "xn", nombre: "Exportaciones Netas (XN)" },
    ],
    items: [
      { id: "carro", texto: "Una familia compra un carro nuevo", respuesta: "c" },
      { id: "fabrica", texto: "Una empresa construye una fábrica nueva", respuesta: "i" },
      { id: "colegio", texto: "El gobierno construye un colegio", respuesta: "g" },
      { id: "cafe", texto: "Colombia vende café al exterior", respuesta: "xn" },
      { id: "ropa", texto: "Una persona compra ropa en el centro comercial", respuesta: "c" },
      { id: "maquinaria", texto: "Una empresa compra maquinaria nueva", respuesta: "i" },
      { id: "policias", texto: "El gobierno paga el salario de los policías", respuesta: "g" },
      { id: "petroleo", texto: "Colombia compra petróleo del exterior", respuesta: "xn" },
    ],
    acierto: (real) => `✅ ${real} — bien identificado.`,
    fallo: (real, elegida) => `❌ Esto afecta ${real}, no ${elegida}.`,
  },

  "cobra-gasta-o-pide": {
    pregunta: "¿El Estado cobra, gasta o pide prestado?",
    categorias: [
      { id: "cobra", nombre: "Cobra (Tributación)" },
      { id: "gasta", nombre: "Gasta (Gasto del Gobierno)" },
      { id: "pide", nombre: "Pide prestado (Deuda Pública)" },
    ],
    items: [
      { id: "iva", texto: "Pagas el IVA al comprar algo", respuesta: "cobra" },
      { id: "nomina-maestros", texto: "El gobierno paga la nómina de los maestros", respuesta: "gasta" },
      { id: "banco-mundial", texto: "Colombia pide un crédito al Banco Mundial", respuesta: "pide" },
      { id: "predial", texto: "Pagas el impuesto predial de tu casa", respuesta: "cobra" },
      { id: "carretera", texto: "El gobierno construye una carretera nueva", respuesta: "gasta" },
      { id: "emite-tes", texto: "El gobierno emite bonos (TES) para financiarse", respuesta: "pide" },
      { id: "peaje", texto: "Pagas un peaje en la autopista", respuesta: "cobra" },
      {
        /*
         * LO MÁS DIFÍCIL DE TODO CIMIENTOS, dentro de un juego Fácil: la
         * distinción entre la deuda y su servicio. Quien la ve por primera vez
         * aquí se lleva la explicación entera, acierte o falle, y es el MISMO
         * texto de los dos juegos Hacer donde ya hubo que hacerla explícita
         * (DEUDA_VS_SERVICIO): no pueden decir cosas distintas.
         */
        id: "intereses-deuda-vieja",
        texto: "El gobierno paga los intereses de una deuda vieja",
        respuesta: "gasta",
        aclaracion: DEUDA_VS_SERVICIO,
      },
    ],
    acierto: (real) => `✅ ${real} — bien identificado.`,
    fallo: (real, elegida) => `❌ Esto es ${real}, no ${elegida}.`,
  },
};

/** La devolución de una respuesta: la plantilla de la actividad y, si el ítem la trae, su aclaración. */
export function retroClasificacion(banco, item, elegida) {
  const nombre = (id) => banco.categorias.find((c) => c.id === id)?.nombre ?? id;
  const base = elegida === item.respuesta
    ? banco.acierto(nombre(item.respuesta))
    : banco.fallo(nombre(item.respuesta), nombre(elegida));
  return item.aclaracion ? `${base} ${item.aclaracion}` : base;
}
