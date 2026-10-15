/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H3 DE HACER — «¿Se mueve la caja menor?» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi: d4-t4-h3-v1.md (serie 1, ya con la
 * v2 dentro) y d4-t4-h3-serie2.md (serie 2). Copias en orquestador/
 * conocimiento/paquetes/, los mismos blobs que en main. Una prueba compara
 * cada texto de aquí contra ellos, letra por letra.
 *
 * Hacer · evaluativa · medio · 25 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0202, que corre Erwin.
 *
 * Cuatro operaciones de una empresa construida, en el orden de la vida del
 * fondo (apertura, reembolso, aumento, disminución): no se barajan. En cada
 * intento se sortea UNA serie (D8): Distribuidora Andina o Muebles El Roble.
 * El estudiante arma el asiento con ConstructorAsiento (compartido, sin
 * cambiarlo): dos cuentas de las cuatro y el lado de cada una. El valor va
 * en el enunciado y no se pide. Un intento por operación.
 *
 * El error: se muestra UN mensaje, el primero de la lista de Katsumi que
 * aplique (está ordenada del error más grave al más mecánico). Con una
 * cuenta en cada lado, las 11 combinaciones equivocadas de cada operación
 * tienen el suyo (una prueba las recorre).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H3_ID = "t4-se-mueve-la-caja-menor";

export const DEBE = "debe";
export const HABER = "haber";

export const H3 = {
  id: H3_ID,
  nombre: "¿Se mueve la caja menor?",
  objetivo: "Armar el asiento de cada movimiento de la caja menor y saber cuándo se mueve su cuenta.",
  consigna: [
    "Cada tarjeta trae una operación de la caja menor de una empresa. Arma su asiento: elige las dos cuentas y el lado de cada una.",
    "Tienes un intento por operación. Después verás el asiento completo y por qué.",
  ],
};

export const SUBTEMAS_H3 = ["Apertura del fondo", "Reembolso", "Aumento del fondo", "Disminución del fondo"];

/* Las mismas cuatro en todas las operaciones, en el orden del paquete. */
export const CAJA_MENOR = "Caja menor";
export const BANCOS = "Bancos";
export const CAJA = "Caja";
export const GASTOS = "Gastos generales";
export const CUENTAS_H3 = [CAJA_MENOR, BANCOS, CAJA, GASTOS];

/*
 * Textos de interfaz que el paquete no traía. «Comprobar» es de la pantalla
 * de Hanayama (H3 v1 §1); los demás, la convención de los Hacer de T4.
 * MISMO_LADO es mío: el paquete no tenía mensaje para dos cuentas del mismo
 * lado (ver ESTA_LISTO). Katsumi los aprobó tal cual: la fuente es
 * d4-t4-h3-v1.md, «Textos de interfaz».
 */
export const BOTON_H3 = { comprobar: "Comprobar", siguiente: "Siguiente operación", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const INCORRECTO = "Incorrecto.";
export const MISMO_LADO = "Pon una cuenta al debe y la otra al haber.";
export const resumenH3 = (bien, cuantos) => `${bien} de ${cuantos} asientos bien armados.`;
export const ROTULO_ASIENTO_H3 = "EL ASIENTO COMPLETO";

/* ═══════════ LOS ERRORES: CUÁNDO APLICA CADA UNO ═══════════ */

/*
 * Cada error de la lista de Katsumi, como una condición sobre el asiento
 * armado { debe, haber } (una cuenta en cada lado). Los nombres dicen la
 * combinación que describe el paquete, en su orden.
 */
const tiene = (a, c) => a.debe === c || a.haber === c;
const es = (debe, haber) => (a) => a.debe === debe && a.haber === haber;

/* Los mensajes que no nombran cifra ni empresa: los mismos en las dos series. */
const ERRORES_APERTURA = [
  { cuando: (a) => tiene(a, GASTOS), texto: "Es la primera vez que se arma el fondo, y nada se ha gastado todavía. No hay gastos que anotar: solo pasa plata de Bancos a Caja menor." },
  { cuando: (a) => tiene(a, CAJA) && !tiene(a, CAJA_MENOR), texto: "Caja no recibe nada aquí. El cheque sale del banco y la plata va al fondo nuevo, así que la cuenta que sube es Caja menor." },
  { cuando: es(CAJA_MENOR, CAJA), texto: "El fondo no se arma con plata de la caja de la empresa. Se abre con un cheque, y un cheque sale del banco." },
  { cuando: es(CAJA, CAJA_MENOR), texto: "Al abrir el fondo, la plata entra a la caja menor, no sale de ella. Y no viene de la caja de la empresa, sino de un cheque." },
  { cuando: es(BANCOS, CAJA_MENOR), texto: "Las dos cuentas están bien, pero al revés. Caja menor sube, así que va al debe. Bancos baja, así que va al haber." },
];
/* El primero del reembolso nombra el fondo: cada serie trae el suyo. */
const erroresReembolso = (primero) => [
  { cuando: (a) => a.debe === CAJA_MENOR, texto: primero },
  { cuando: (a) => a.haber === CAJA_MENOR, texto: "Caja menor no paga el cheque del reembolso: lo paga el banco. Mira el asiento de la p. 182: se acredita Bancos, y Caja menor no aparece." },
  { cuando: (a) => !tiene(a, GASTOS) && !tiene(a, CAJA_MENOR), texto: "Al reembolso le faltan los gastos. Lo que se anota es en qué se fue la plata, y eso va a Gastos generales." },
  { cuando: es(CAJA, GASTOS), texto: "Aquí no entra plata a la caja, y los gastos no bajan. El reembolso anota los gastos que se hicieron y se paga con un cheque." },
  { cuando: es(GASTOS, CAJA), texto: "El reembolso no se paga con la plata de la caja: se paga con un cheque." },
  { cuando: es(BANCOS, GASTOS), texto: "Las dos cuentas están bien, pero al revés. Los gastos suben, así que van al debe. El cheque sale del banco, así que Bancos va al haber." },
];
const ERRORES_AUMENTO = [
  { cuando: (a) => tiene(a, GASTOS), texto: "El aumento no es un gasto: nadie consumió nada. Solo pasa plata del banco al fondo, así que Caja menor se debita." },
  { cuando: (a) => tiene(a, CAJA) && !tiene(a, BANCOS), texto: "El aumento se paga con un cheque, y un cheque sale del banco. La cuenta que baja es Bancos, no Caja." },
  { cuando: es(BANCOS, CAJA), texto: "Bancos no sube y no sale plata de la caja. El aumento es plata que pasa del banco al fondo de caja menor." },
  { cuando: es(CAJA, BANCOS), texto: "El cheque sí sale del banco, pero la plata no va a la caja de la empresa: va al fondo de caja menor." },
  { cuando: es(BANCOS, CAJA_MENOR), texto: "Las dos cuentas están bien, pero al revés. El fondo sube, así que Caja menor va al debe. Bancos baja, así que va al haber." },
];
const ERRORES_DISMINUCION = [
  { cuando: (a) => tiene(a, GASTOS), texto: "Aquí no hay ningún gasto: el fondo solo devuelve plata que no se usó. Esa plata va al debe de Caja, y Caja menor se acredita." },
  { cuando: (a) => tiene(a, BANCOS) && !tiene(a, CAJA), texto: "El fondo baja, así que Caja menor va al haber. Y mira el asiento de la p. 182: la plata que sale del fondo va al debe de Caja, no de Bancos." },
  { cuando: es(BANCOS, CAJA), texto: "Ni Bancos sube ni Caja baja. Aquí la plata sale del fondo de caja menor y llega a la caja de la empresa." },
  { cuando: es(CAJA, BANCOS), texto: "Caja sí recibe la plata, pero esa plata no sale del banco: sale del fondo, que es el que baja." },
  { cuando: es(CAJA_MENOR, CAJA), texto: "Las dos cuentas están bien, pero al revés. La plata sale del fondo, así que Caja menor va al haber. Llega a Caja, que va al debe." },
];
const ACIERTO_REEMBOLSO = "Así es. Los gastos van a Gastos generales, al debe, y el cheque sale de Bancos, al haber. Caja menor no se mueve.";
const ACIERTO_DISMINUCION = "Así es. Mira el asiento de la p. 182: Caja menor se acredita y la plata que sale del fondo va al debe de Caja.";

/*
 * Una serie: la empresa y sus cifras. Lo que sale de restar SE CALCULA: el
 * cheque del aumento y lo que se devuelve en la disminución.
 */
function serie({ prefijo, fondo, gastos, fondoAumentado, fondoDisminuido, textos }) {
  const aumento = fondoAumentado - fondo;
  const disminucion = fondoAumentado - fondoDisminuido;
  return [
    { id: `${prefijo}-1`, subtema: SUBTEMAS_H3[0], enunciado: textos.apertura, debe: CAJA_MENOR, haber: BANCOS, valor: fondo, acierto: textos.aciertoApertura, errores: ERRORES_APERTURA },
    { id: `${prefijo}-2`, subtema: SUBTEMAS_H3[1], enunciado: textos.reembolso, debe: GASTOS, haber: BANCOS, valor: gastos, acierto: ACIERTO_REEMBOLSO, errores: erroresReembolso(textos.trampa) },
    { id: `${prefijo}-3`, subtema: SUBTEMAS_H3[2], enunciado: textos.aumento, debe: CAJA_MENOR, haber: BANCOS, valor: aumento, acierto: textos.aciertoAumento, errores: ERRORES_AUMENTO },
    { id: `${prefijo}-4`, subtema: SUBTEMAS_H3[3], enunciado: textos.disminucion, debe: CAJA, haber: CAJA_MENOR, valor: disminucion, acierto: ACIERTO_DISMINUCION, errores: ERRORES_DISMINUCION },
  ];
}

/* Serie 1 · Distribuidora Andina, con Lucía (d4-t4-h3-v1.md). Cifras construidas. */
export const SERIE_1 = serie({
  prefijo: "h3",
  fondo: 300_000, gastos: 214_600, fondoAumentado: 450_000, fondoDisminuido: 350_000,
  textos: {
    apertura: "El 1 de marzo, Distribuidora Andina abre una caja menor de $300.000. Le hace un cheque a Lucía, que la va a manejar.",
    aciertoApertura: "Así es. La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por $300.000.",
    reembolso: "El 31 de marzo, Lucía entrega los soportes de lo que pagó en el mes: $214.600. Contabilidad hace el cheque del reembolso por esa cifra.",
    trampa: "Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo $300.000. Mira el asiento de la p. 182: Caja menor no aparece.",
    aumento: "El fondo de Distribuidora Andina se queda corto: lo reponen cada semana. En abril lo suben de $300.000 a $450.000, con un cheque por la diferencia.",
    aciertoAumento: "Así es. Entran $150.000 más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo.",
    disminucion: "Meses después, la plata del fondo se queda quieta. Distribuidora Andina lo baja de $450.000 a $350.000, y Lucía devuelve los $100.000 de diferencia.",
  },
});

/* Serie 2 · Muebles El Roble, con Andrés (d4-t4-h3-serie2.md). Cifras construidas. */
export const SERIE_2 = serie({
  prefijo: "h3s2",
  fondo: 280_000, gastos: 187_350, fondoAumentado: 445_000, fondoDisminuido: 375_000,
  textos: {
    apertura: "El 2 de agosto, Muebles El Roble abre una caja menor de $280.000. Le hace un cheque a Andrés, que la va a manejar.",
    aciertoApertura: "Así es. La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por $280.000.",
    reembolso: "El 31 de agosto, Andrés entrega los soportes de lo que pagó en el mes: $187.350. Contabilidad hace el cheque del reembolso por esa cifra.",
    trampa: "Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo $280.000. Mira el asiento de la p. 182: Caja menor no aparece.",
    aumento: "El fondo de Muebles El Roble se queda corto: lo reponen cada semana. En septiembre lo suben de $280.000 a $445.000, con un cheque por la diferencia.",
    aciertoAumento: "Así es. Entran $165.000 más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo.",
    disminucion: "Meses después, la plata del fondo se queda quieta. Muebles El Roble lo baja de $445.000 a $375.000, y Andrés devuelve los $70.000 de diferencia.",
  },
});

export const SERIES_H3 = [SERIE_1, SERIE_2];

export const CIERRE_H3 = {
  texto: "Caja menor se mueve cuando el fondo se abre, se aumenta, se disminuye o se cierra. En el reembolso no se mueve: se debita Gastos generales y se acredita Bancos.",
  pie: "Basado en el libro, pp. 181-182",
};

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H3) ═══════════ */

export const PASOS_H3 = [
  "Lee la operación de la caja menor.",
  "Elige las dos cuentas que se mueven y el lado de cada una.",
  "Confirma. Tienes un intento por operación.",
];
export const ALT_H3 = "Para abrir la caja menor, Caja menor va al debe y Bancos va al haber, las dos por $200.000. La plata pasa del banco al fondo.";
/*
 * La apertura de Papelería Arcoíris (construida, no está en ninguna serie).
 * El paquete trae el enunciado y el texto alternativo; el acierto de la demo
 * es ese texto alternativo (aprobado por Katsumi), y sus errores son los de
 * la apertura (la demo nunca falla).
 */
export const EJEMPLO_H3 = {
  id: "demo", subtema: SUBTEMAS_H3[0],
  enunciado: "El 2 de enero, Papelería Arcoíris abre una caja menor de $200.000. Le hace un cheque a Julio, que la va a manejar.",
  debe: CAJA_MENOR, haber: BANCOS, valor: 200_000, acierto: ALT_H3, errores: ERRORES_APERTURA,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Una serie al azar por intento; dentro, las cuatro en su orden. */
export const sortearH3 = (azar = Math.random) => SERIES_H3[Math.floor(azar() * SERIES_H3.length) % SERIES_H3.length];

/*
 * El asiento armado, leído de las filas de ConstructorAsiento. Está listo
 * para comprobar con dos cuentas y una a cada lado. Dos al mismo lado no se
 * comprueban: el paquete no tiene mensaje para eso, y un asiento así no
 * cumple la partida doble que el estudiante ya conoce del Tema 2.
 */
export function armado(filas) {
  const puestas = filas.filter((f) => f.cuenta && f.lado);
  const debe = puestas.filter((f) => f.lado === DEBE);
  const haber = puestas.filter((f) => f.lado === HABER);
  return { completas: puestas.length === 2 && filas.length === 2, debe: debe.length === 1 ? debe[0].cuenta : null, haber: haber.length === 1 ? haber[0].cuenta : null };
}
export const ESTA_LISTO = (filas) => { const a = armado(filas); return a.completas && Boolean(a.debe && a.haber); };
export const mismoLado = (filas) => { const a = armado(filas); return a.completas && !(a.debe && a.haber); };

export function evaluarH3(op, filas) {
  const a = armado(filas);
  const ok = a.debe === op.debe && a.haber === op.haber;
  const error = ok ? null : op.errores.find((e) => e.cuando(a)) ?? null;
  /* Cada fila: bien si su cuenta va en ese lado en el asiento correcto. */
  const estados = filas.map((f) => (f.cuenta ? ((f.lado === DEBE ? op.debe : op.haber) === f.cuenta ? "correcta" : "incorrecta") : null));
  return {
    ok,
    texto: ok ? op.acierto : error?.texto ?? null,
    estados,
    respuesta: `${a.debe} / ${a.haber}`,
    asiento: [
      { cuenta: op.debe, lado: DEBE, valor: op.valor },
      { cuenta: op.haber, lado: HABER, valor: op.valor },
    ],
  };
}

/* Evaluativa: el motor escala los 25 FP con este porcentaje. */
export const puntuarH3 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por su enunciado, en las dos series. */
export const operacionDeItemH3 = (id) => SERIES_H3.flat().find((x) => x.id === id)?.enunciado ?? null;
