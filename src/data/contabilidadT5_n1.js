/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N1 DE HACER — «¿Temporal o a largo plazo?» (Célula C).
 *
 * Fuente: la tanda 1 v1.1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md. Encima, el recorte B2
 * de Near (paquetes/a7-n1-recorte.md): el enunciado y los ítems
 * ritmo-del-negocio y la-intencion. Una prueba compara cada texto de aquí
 * contra la tanda con el recorte encima, letra por letra. Lo que la entrega
 * «N1: lo que pidió Mello» cambia y el recorte no toca (bonos-de-compania,
 * la intro del bloque 2, los aciertos del caso 4) sigue pendiente: no está.
 *
 * Hacer Fácil, evaluativa, 10 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0110, que corre Erwin.
 *
 * NUEVE ACIERTOS POSIBLES, uno por ítem, en el orden de la tanda: cinco del
 * bloque 1 (temporal o a largo plazo), tres del bloque 2 (a qué grupo
 * pertenece) y uno del bloque 3 (la intención). Un solo intento. Sin cifras.
 * Los cinco casos del bloque 1 son construcción de Near (se dice aquí, no en
 * pantalla); cada uno se apoya en una frase de las pp. 191-192.
 *
 * La cautela es del libro (p. 192, «puede ser más apropiado»): la opción la
 * lleva entera y ninguna retroalimentación la vuelve regla. Los grupos solo
 * llevan los ejemplos que la p. 191 pone en cada uno.
 *
 * Lo que la tanda no trae y se toma de la convención de los Hacer de la
 * célula (H3 de T7-3): las opciones de los bloques 1 y 2 van en el orden de
 * la tanda, sin barajar, porque son las clases mismas; las del bloque 3, que
 * son frases, se barajan. Los botones «Siguiente ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N1_ID = "t5-temporal-o-largo-plazo";

export const N1 = {
  id: N1_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Decidir si una inversión es temporal o si puede ser más apropiado llevarla a largo plazo.",
  nombre: "¿Temporal o a largo plazo?",
  enunciado: [
    "Primero decide si cada inversión es temporal o si puede ser más apropiado llevarla a largo plazo. Después, ubica otras en su grupo y responde una pregunta final.",
    "Es temporal si se puede vender rápido y se volverá efectivo cuando haga falta, en un año o en un ciclo de operaciones, el que sea más largo.",
  ],
  pie: "Basado en el libro, pp. 191-192",
};

export const BOTON_N1 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const PLAZO = ["Temporal", "Puede ser más apropiado a largo plazo"];
const GRUPOS = ["Documentos a corto plazo", "Valores negociables de deuda", "Valores negociables de capital"];
const ANTES_DEL_BLOQUE_2 = "Ahora decide a qué grupo pertenece cada inversión temporal.";

export const ITEMS_N1 = [
  /* ═══ Bloque 1 · temporal o a largo plazo ═══ */
  {
    id: "ritmo-del-negocio", bloque: 1, opciones: PLAZO, correcta: "Temporal",
    pregunta: "A una empresa le sobra efectivo por un tiempo, por el ritmo de su negocio. Compra acciones que se venden a diario y las venderá cuando necesite el dinero.",
    error: "Se venden rápido, y el efectivo sobra solo por un tiempo. El libro dice que eso justifica la intención de volverlas efectivo.",
    acierto: "Así es. Se venden rápido y el efectivo sobra solo un tiempo: eso justifica la intención de volverlas efectivo.",
  },
  {
    id: "no-se-negocian", bloque: 1, opciones: PLAZO, correcta: "Puede ser más apropiado a largo plazo",
    pregunta: "Una empresa compra acciones de otra que no se negocian públicamente. Casi nadie las compra ni las vende.",
    error: "Casi no tienen mercado, así que no se pueden vender rápido. Para esos casos, el libro dice que puede ser más apropiado clasificarlas a largo plazo.",
    acierto: "Así es. Si casi no tienen mercado, no se venden rápido. Para esos casos, el libro dice que puede ser más apropiado clasificarlas a largo plazo.",
  },
  {
    id: "certificado-seis-meses", bloque: 1, opciones: PLAZO, correcta: "Temporal",
    pregunta: "Una empresa compra un certificado de depósito que se puede vender con facilidad. Lo va a volver efectivo en seis meses.",
    error: "Se puede vender con facilidad y se volverá efectivo antes de un año. Cumple las dos condiciones: es temporal.",
    acierto: "Así es. Se vende con facilidad y se volverá efectivo antes de un año. Cumple las dos condiciones.",
  },
  {
    id: "fondo-para-cuando-falte", bloque: 1, opciones: PLAZO, correcta: "Temporal",
    pregunta: "Una empresa compra bonos que se venden fácil. Los guarda como un fondo para usar cuando le falte efectivo.",
    error: "Se venden fácil, y la empresa los guarda para volverlos efectivo cuando le haga falta. El libro dice que eso justifica que sea temporal.",
    acierto: "Así es. Según el libro, un fondo para usar cuando haga falta efectivo justifica que la inversión sea temporal.",
  },
  {
    id: "empresa-familiar", bloque: 1, opciones: PLAZO, correcta: "Puede ser más apropiado a largo plazo",
    pregunta: "Una empresa compra acciones de una empresa familiar. Nadie más las compra ni las vende: no tienen mercado.",
    error: "Sin mercado, no se pueden vender rápido. Falla la primera condición, y el libro dice que puede ser más apropiado clasificarlas a largo plazo.",
    acierto: "Así es. Sin mercado no se pueden vender rápido. El libro dice que puede ser más apropiado clasificarlas a largo plazo.",
  },
  /* ═══ Bloque 2 · a qué grupo pertenece (la pantalla de la tanda va encima de cada uno) ═══ */
  {
    id: "bono-de-tesoreria", bloque: 2, intro: ANTES_DEL_BLOQUE_2, opciones: GRUPOS, correcta: "Documentos a corto plazo",
    pregunta: "Un bono de tesorería.",
    error: "El libro pone los bonos de tesorería con los documentos a corto plazo. Ahí también pone los certificados de depósito.",
    acierto: "Así es. El libro pone los bonos de tesorería entre los documentos a corto plazo.",
  },
  {
    id: "bonos-del-gobierno", bloque: 2, intro: ANTES_DEL_BLOQUE_2, opciones: GRUPOS, correcta: "Valores negociables de deuda",
    pregunta: "Unos bonos del Gobierno.",
    error: "El libro pone los bonos del Gobierno y los de compañías entre los valores negociables de deuda.",
    acierto: "Así es. El libro pone los bonos del Gobierno entre los valores negociables de deuda.",
  },
  {
    id: "acciones-comunes", bloque: 2, intro: ANTES_DEL_BLOQUE_2, opciones: GRUPOS, correcta: "Valores negociables de capital",
    pregunta: "Unas acciones comunes de otra empresa.",
    error: "Las acciones, sean comunes o preferentes, son valores negociables de capital. Así las pone el libro.",
    acierto: "Así es. El libro pone las acciones comunes entre los valores negociables de capital.",
  },
  /* ═══ Bloque 3 · la intención (opciones barajadas) ═══ */
  {
    id: "la-intencion", bloque: 3, barajar: true,
    opciones: [
      "Con evidencias: su historia de inversiones.",
      "Con una carta firmada por la gerencia.",
      "Con el tipo de título que compró.",
    ],
    correcta: "Con evidencias: su historia de inversiones.",
    pregunta: "Una empresa dice que venderá pronto sus títulos. ¿Con qué debe apoyar esa intención?",
    error: "No basta con que la gerencia lo diga ni con el tipo de título. El libro pide evidencias, como la historia de inversiones.",
    acierto: "Así es. El libro pide apoyar la intención con evidencias, como la historia de inversiones y su propósito.",
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los nueve al primer toque. */
export const resumenN1 = (bien, total) => `${bien} de ${total} al primer toque.`;
