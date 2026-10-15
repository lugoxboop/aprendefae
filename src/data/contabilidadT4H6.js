/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H6 DE HACER — «¿Quién se enteró primero?» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h6-v1.md (sin archivos de
 * cambios). Copia en orquestador/conocimiento/paquetes/, el mismo blob que en
 * main. Una prueba compara cada texto de aquí contra él, letra por letra.
 *
 * Hacer · evaluativa · medio · 25 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0205, que corre Erwin.
 *
 * Ocho partidas construidas y sin cifras, barajadas en cada intento. Cada
 * una va al registro que TODAVÍA NO la tiene: el del banco o el de la
 * empresa. Los dos destinos, siempre en el mismo orden (banco, empresa) y
 * en dos renglones fijos (Hanayama H6 v1 §1). Un toque por partida.
 * Sin figura: dibujar en qué libreta falta sería la respuesta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H6_ID = "t4-quien-se-entero-primero";

export const BANCO = "banco";
export const EMPRESA = "empresa";

export const H6 = {
  id: H6_ID,
  nombre: "¿Quién se enteró primero?",
  objetivo: "Decidir, para cada partida, cuál de los dos registros todavía no la tiene: el del banco o el de la empresa.",
  consigna: [
    "Cada tarjeta trae algo que pasó en la cuenta de una empresa a fin de mes. Mándala al registro que todavía no lo tiene.",
    "Pregúntate quién se enteró primero. El otro es el que todavía no lo sabe.",
  ],
};

export const SUBTEMAS_H6 = ["Cheque sin cobrar", "Consignación en tránsito", "Nota débito del banco", "Nota crédito del banco"];

/*
 * Los dos destinos del paquete, en el orden de Hanayama. Cada uno en dos
 * renglones fijos: «Todavía no lo tiene» / «el banco» (el sujeto en 600).
 */
export const DESTINOS_H6 = [
  { id: BANCO, nombre: "Todavía no lo tiene el banco", renglones: ["Todavía no lo tiene", "el banco"] },
  { id: EMPRESA, nombre: "Todavía no lo tiene la empresa", renglones: ["Todavía no lo tiene", "la empresa"] },
];
export const nombreDeDestinoH6 = (id) => DESTINOS_H6.find((d) => d.id === id)?.nombre ?? null;

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el
 * paquete no trae, con la misma forma que los de H1: el botón de seguir, el
 * resumen y lo que oye el lector de pantalla en el error.
 */
export const BOTON_H6 = { siguiente: "Siguiente partida", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const resumenH6 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;
export const lectorErrorH6 = (destino) => `Incorrecto. La respuesta es ${destino}.`;

const P188 = "Basado en el libro, p. 188";

/* Las ocho partidas, en el orden del paquete. La vista las baraja. */
export const ITEMS_H6 = [
  {
    id: "h6-1", subtema: SUBTEMAS_H6[0], respuesta: BANCO, pagina: P188,
    texto: "El 29 del mes, la empresa gira un cheque para pagar el arriendo. El dueño del local todavía no lo ha cobrado.",
    acierto: "Así es. La empresa lo anotó al girarlo. El banco no sabe nada de ese cheque hasta que alguien lo cobre.",
    error: "La empresa lo anotó el día que lo giró, así que ella ya lo sabe. Quien no lo sabe es el banco: nadie ha ido a cobrarlo.",
  },
  {
    id: "h6-2", subtema: SUBTEMAS_H6[0], respuesta: BANCO, pagina: P188,
    texto: "La empresa le paga a un proveedor con un cheque el día 30. El proveedor lo va a cobrar la semana siguiente.",
    acierto: "Así es. El cheque ya salió de los libros de la empresa, pero el banco solo lo verá cuando el proveedor lo cobre.",
    error: "La empresa ya lo anotó: fue ella quien giró el cheque. El banco es el que todavía no lo tiene, porque nadie lo ha cobrado.",
  },
  {
    id: "h6-3", subtema: SUBTEMAS_H6[1], respuesta: BANCO, pagina: P188,
    texto: "El último día del mes, a las cinco de la tarde, la empresa consigna el efectivo del día. El banco lo abona al día siguiente.",
    acierto: "Así es. La empresa ya anotó la consignación, pero el banco la abona al otro día. Al cierre, el extracto todavía no la trae.",
    error: "La empresa anotó la consignación ese mismo día, así que ya la tiene. El que no la tiene al cierre es el banco, que la abona después.",
  },
  {
    id: "h6-4", subtema: SUBTEMAS_H6[1], respuesta: BANCO, pagina: P188,
    texto: "La empresa consigna el día 31 los cheques que le dieron sus clientes. El banco tarda dos días en abonarlos.",
    acierto: "Así es. Para la empresa, la plata ya está consignada. Para el banco, todavía no: la abona dos días después.",
    error: "Fue la empresa la que consignó, así que ella ya lo anotó. El banco todavía no lo tiene, porque tarda en abonarlo.",
  },
  {
    id: "h6-5", subtema: SUBTEMAS_H6[2], respuesta: EMPRESA, pagina: P188,
    texto: "El banco le cobra a la empresa la comisión por manejar la cuenta y se la descuenta. La empresa se entera cuando le llega el extracto.",
    acierto: "Así es. El banco descontó la comisión con una nota débito. La empresa no lo sabe hasta que lee el extracto.",
    error: "La empresa no hizo nada: fue el banco el que descontó la comisión. Por eso el banco ya lo tiene, y la empresa todavía no.",
  },
  {
    id: "h6-6", subtema: SUBTEMAS_H6[2], respuesta: EMPRESA, pagina: "Basado en el libro, pp. 188-189",
    texto: "El banco le devuelve a la empresa el cheque con el que un cliente le había pagado, porque no tenía fondos.",
    acierto: "Así es. El banco lo devolvió con una nota débito. La empresa se entera después, y todavía no lo ha anotado.",
    error: "El banco ya lo sabe: fue él quien devolvió el cheque. La que todavía no lo sabe es la empresa, que lo verá en el extracto.",
  },
  {
    id: "h6-7", subtema: SUBTEMAS_H6[3], respuesta: EMPRESA, pagina: P188,
    texto: "El banco le abona a la empresa los intereses de una inversión que tiene con él. La empresa no lo ha anotado todavía.",
    acierto: "Así es. El banco abonó los intereses con una nota crédito. La empresa se entera con el extracto.",
    error: "Quien abonó los intereses fue el banco, así que él ya lo tiene. La empresa todavía no lo ha anotado.",
  },
  {
    id: "h6-8", subtema: SUBTEMAS_H6[3], respuesta: EMPRESA, pagina: P188,
    texto: "Un cliente le paga una factura a la empresa consignando directo en el banco. No le avisa a nadie.",
    acierto: "Así es. El banco recibió la plata y la abonó con una nota crédito. La empresa todavía no sabe que le pagaron.",
    error: "El cliente consignó directo en el banco, así que el banco ya lo tiene. La empresa no lo sabe, porque nadie le avisó.",
  },
];

export const CIERRE_H6 = {
  texto: "Los cheques sin cobrar y las consignaciones sin abonar los tiene la empresa y le faltan al banco. Las notas del banco las tiene el banco y le faltan a la empresa.",
  pie: P188,
};

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H6) ═══════════ */

export const PASOS_H6 = [
  "Lee lo que pasó en la cuenta.",
  "Pregúntate quién se enteró primero, el banco o la empresa.",
  "Manda la tarjeta al registro que todavía no lo tiene.",
];
export const ALT_H6 = "La empresa anotó el cheque al girarlo, pero el banco no sabe de él hasta que lo cobren. La tarjeta va a «Todavía no lo tiene el banco».";
/*
 * La partida construida del paquete (no es ninguna de las ocho). La mano la
 * TOCA, no la arrastra: los destinos son opciones de un toque (Hanayama H6
 * v1 §1), como en H1.
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El paquete trae la partida y
 * el texto alternativo; el acierto de la demo es ese texto alternativo.
 */
export const EJEMPLO_H6 = {
  id: "demo", subtema: SUBTEMAS_H6[0], respuesta: BANCO, pagina: P188,
  texto: "El 31, la empresa gira un cheque para pagar la luz. La empresa de energía todavía no lo ha cobrado.",
  acierto: ALT_H6,
  error: null,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

export const sortearH6 = (barajar) => barajar(ITEMS_H6);

/* El veredicto: con acierto, «Correcto.» y su texto; con error, el de esa partida. La página va siempre. */
export function evaluarH6(item, elegido) {
  const ok = elegido === item.respuesta;
  return { ok, correcta: item.respuesta, textos: ok ? [CORRECTO, item.acierto] : [item.error], pagina: item.pagina };
}

/* Evaluativa: el motor escala los 25 FP con este porcentaje. */
export const puntuarH6 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por su partida. */
export const partidaDeItemH6 = (id) => ITEMS_H6.find((x) => x.id === id)?.texto ?? null;
