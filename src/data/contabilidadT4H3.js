/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H3 DE HACER — «¿Se mueve la caja menor?» (Célula D). REDISEÑO DE
 * ENGANCHE: el tablero y el sobre.
 *
 * Diseño: Hanayama (celula-d/hanayama-h3-rediseno.md). Textos: Katsumi
 * (celula-d/katsumi-texto-hacer.md), aprobados por Yujiro el 15 oct 2026.
 * Copia en el canon: orquestador/conocimiento/paquetes/d4-t4-h3-v2-
 * rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * Hacer · evaluativa · medio · 25 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0202 y NO cambia: mismo
 * activity_id y mismos ítems (h3-1…h3-4, h3s2-1…h3s2-4).
 *
 * Cuatro operaciones de una empresa construida, en el orden de la vida del
 * fondo (apertura, reembolso, aumento, disminución): no se barajan. En cada
 * intento se sortea UNA serie: Distribuidora Andina (Lucía) o Muebles El
 * Roble (Andrés). El estudiante pone el monto en una cuenta del debe y en
 * otra del haber del tablero, y comprueba. Un intento por operación.
 *
 * La figura: el tablero de las cuatro cuentas (sus totales se acumulan a lo
 * largo de la vida del fondo), el sobre del encargado (antes y después de la
 * operación) y «lo que dice el libro» de Caja menor (debe − haber). Con el
 * error, si el asiento toca Caja menor, la línea «diría» compara el libro que
 * daría ESE asiento con lo que hay en el sobre después de la operación.
 *
 * El error: UN mensaje, el primero de la lista de Katsumi que aplique (está
 * ordenada del error más grave al más mecánico). Las 11 combinaciones
 * equivocadas de cada operación tienen el suyo (una prueba las recorre).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { DEBE, HABER, cifra, pesos } from "./contabilidadT4Hacer.js";

export { DEBE, HABER };

export const H3_ID = "t4-se-mueve-la-caja-menor";

export const H3 = {
  id: H3_ID,
  nombre: "¿Se mueve la caja menor?",
  objetivo: "Armar el asiento de cada movimiento de la caja menor y saber cuándo se mueve su cuenta.",
  consigna: "Pon el monto en la cuenta que va al debe y en la que va al haber.",
};

export const SUBTEMAS_H3 = ["Apertura del fondo", "Reembolso", "Aumento del fondo", "Disminución del fondo"];

/* Las cuatro cuentas del tablero, en el orden del paquete. «Gastos / generales» va en dos renglones fijos (Hanayama §3). */
export const CAJA_MENOR = "caja-menor";
export const BANCOS = "bancos";
export const CAJA = "caja";
export const GASTOS = "gastos-generales";
export const CUENTAS_H3 = [
  { id: CAJA_MENOR, renglones: ["Caja menor"] },
  { id: BANCOS, renglones: ["Bancos"] },
  { id: CAJA, renglones: ["Caja"] },
  { id: GASTOS, renglones: ["Gastos", "generales"] },
];
export const nombreDeCuentaH3 = (id) => CUENTAS_H3.find((c) => c.id === id)?.renglones.join(" ") ?? null;

/* Interfaz (Katsumi, «Marcas, botones, cierre» y «El sobre y el libro»). */
/* El aviso de «Comprobar» con una mitad sin poner: el de H8 etapa 2, ya escrito por Katsumi (P2 de Hanayama, §4). */
export const AVISO_H3 = "Pon una cuenta al debe y la otra al haber.";
export const BOTON_H3 = { comprobar: "Comprobar", siguiente: "Siguiente operación", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const resumenH3 = (bien) => `${bien} de 4 asientos bien armados.`;
export const ROTULOS_H3 = {
  sobre: (encargado) => `LO QUE TIENE ${encargado.toUpperCase()}`,
  billetes: "Billetes y monedas",
  soportes: "Soportes de gastos",
  suman: "Suman",
  libro: "LO QUE DICE EL LIBRO",
  cuenta: "Caja menor",
  igual: "= sobre",
};
/* x: el libro con el asiento del estudiante; y: lo que hay en el sobre DESPUÉS de la operación. */
export const diriaH3 = (x, y) => `Con tu asiento, el libro diría ${cifra(x)}, pero en el sobre hay ${cifra(y)}.`;
export const ALT_FIGURA_H3 = "Cuatro cuentas con su debe y su haber, y debajo el fondo de caja menor comparado con lo que dice el libro.";

export const CIERRE_H3 = {
  texto: "Caja menor se mueve cuando el fondo se abre, se aumenta, se disminuye o se cierra. En el reembolso no se mueve: se debita Gastos generales y se acredita Bancos.",
  pie: "Basado en el libro, pp. 181-182. Cifras construidas",
};

/* ═══════════ LOS ERRORES: CUÁNDO APLICA CADA UNO ═══════════ */

/* Cada error, como una condición sobre el asiento armado { debe, haber } (una cuenta en cada lado). */
const tiene = (a, c) => a.debe === c || a.haber === c;
const es = (debe, haber) => (a) => a.debe === debe && a.haber === haber;

const ERRORES_APERTURA = [
  { cuando: (a) => tiene(a, GASTOS), texto: "Es la primera vez que se arma el fondo, y nada se ha gastado todavía. No hay gastos que anotar: solo pasa plata de Bancos a Caja menor." },
  { cuando: (a) => tiene(a, CAJA) && !tiene(a, CAJA_MENOR), texto: "Caja no recibe nada aquí. El cheque sale del banco y la plata va al fondo nuevo, así que la cuenta que sube es Caja menor." },
  { cuando: es(CAJA_MENOR, CAJA), texto: "El fondo no se arma con plata de la caja de la empresa. Se abre con un cheque, y un cheque sale del banco." },
  { cuando: es(CAJA, CAJA_MENOR), texto: "Al abrir el fondo, la plata entra a la caja menor, no sale de ella. Y no viene de la caja de la empresa, sino de un cheque." },
  { cuando: es(BANCOS, CAJA_MENOR), texto: "Las dos cuentas están bien, pero al revés. Caja menor sube, así que va al debe. Bancos baja, así que va al haber." },
];
/* El primero del reembolso nombra el fondo: cada serie trae el suyo. */
const erroresReembolso = (fondo) => [
  { cuando: (a) => a.debe === CAJA_MENOR, texto: `Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo ${pesos(fondo)}. Mira el asiento de la p. 182: Caja menor no aparece.` },
  { cuando: (a) => a.haber === CAJA_MENOR, texto: "Caja menor no paga el cheque del reembolso: lo paga el banco. Mira el asiento de la p. 182: se acredita Bancos, y Caja menor no aparece." },
  { cuando: (a) => !tiene(a, GASTOS), texto: "Al reembolso le faltan los gastos. Lo que se anota es en qué se fue la plata, y eso va a Gastos generales." },
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

/*
 * Una serie: la empresa, su encargado y sus cifras. Lo que sale de restar SE
 * CALCULA: el cheque del aumento, lo que se devuelve en la disminución y los
 * billetes que quedan antes del reembolso (fondo − soportes: el arqueo cuadró).
 * El monto va aparte de la tarjeta (Katsumi, decisión 3) y el valor del fondo
 * lo dice el sobre (decisión 4).
 */
function serie({ id, prefijo, empresa, encargado, dia, mes, mesAumento, fondo, gastos, fondoAumentado, fondoDisminuido }) {
  const aumento = fondoAumentado - fondo;
  const disminucion = fondoAumentado - fondoDisminuido;
  const pie = (p) => `Basado en el libro, ${p}. Cifras construidas`;
  const ops = [
    {
      id: `${prefijo}-1`, subtema: SUBTEMAS_H3[0], monto: fondo, debe: CAJA_MENOR, haber: BANCOS,
      antes: { billetes: 0, soportes: 0 }, despues: { billetes: fondo, soportes: 0 },
      texto: `El ${dia} de ${mes}, ${empresa} abre una caja menor. Le hace un cheque a ${encargado}, que la va a manejar.`,
      acierto: `La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por ${pesos(fondo)}.`,
      errores: ERRORES_APERTURA, pagina: pie("p. 181"),
    },
    {
      id: `${prefijo}-2`, subtema: SUBTEMAS_H3[1], monto: gastos, debe: GASTOS, haber: BANCOS,
      antes: { billetes: fondo - gastos, soportes: gastos }, despues: { billetes: fondo, soportes: 0 },
      texto: `El 31 de ${mes}, ${encargado} entrega los soportes de sus pagos y recibe el cheque del reembolso.`,
      acierto: "Los gastos van a Gastos generales, al debe, y el cheque sale de Bancos, al haber. Caja menor no se mueve.",
      errores: erroresReembolso(fondo), pagina: pie("p. 182"),
    },
    {
      id: `${prefijo}-3`, subtema: SUBTEMAS_H3[2], monto: aumento, debe: CAJA_MENOR, haber: BANCOS,
      antes: { billetes: fondo, soportes: 0 }, despues: { billetes: fondoAumentado, soportes: 0 },
      texto: `El fondo se queda corto y lo reponen cada semana. En ${mesAumento} lo suben con un cheque.`,
      acierto: `Entran ${pesos(aumento)} más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo.`,
      errores: ERRORES_AUMENTO, pagina: pie("p. 182"),
    },
    {
      id: `${prefijo}-4`, subtema: SUBTEMAS_H3[3], monto: disminucion, debe: CAJA, haber: CAJA_MENOR,
      antes: { billetes: fondoAumentado, soportes: 0 }, despues: { billetes: fondoDisminuido, soportes: 0 },
      texto: `Meses después, la plata del fondo se queda quieta. Lo bajan, y ${encargado} devuelve la diferencia.`,
      acierto: "Mira el asiento de la p. 182: Caja menor se acredita y la plata que sale del fondo va al debe de Caja.",
      errores: ERRORES_DISMINUCION, pagina: pie("p. 182"),
    },
  ];
  return { id, empresa, encargado, rotuloSobre: ROTULOS_H3.sobre(encargado), ops };
}

/* Serie 1 · Distribuidora Andina, con Lucía. Cifras construidas. */
export const SERIE_1 = serie({
  id: "s1", prefijo: "h3", empresa: "Distribuidora Andina", encargado: "Lucía", dia: 1, mes: "marzo", mesAumento: "abril",
  fondo: 300_000, gastos: 214_600, fondoAumentado: 450_000, fondoDisminuido: 350_000,
});
/* Serie 2 · Muebles El Roble, con Andrés. Cifras construidas. */
export const SERIE_2 = serie({
  id: "s2", prefijo: "h3s2", empresa: "Muebles El Roble", encargado: "Andrés", dia: 2, mes: "agosto", mesAumento: "septiembre",
  fondo: 280_000, gastos: 187_350, fondoAumentado: 445_000, fondoDisminuido: 375_000,
});
export const SERIES_H3 = [SERIE_1, SERIE_2];

/* ═══════════ «ASÍ SE JUEGA» ═══════════ */

export const PASOS_H3 = ["Lee la operación.", "¿Qué cuenta sube? ¿Cuál baja?", "El libro tiene que dar lo del sobre."];
export const ALT_H3 = "Papelería Arcoíris abre una caja menor de $200.000. Caja menor va al debe y Bancos al haber, y el libro queda igual que el sobre: 200.000.";
/* La apertura de Papelería Arcoíris (construida, no está en ninguna serie). La demo nunca falla. */
export const EJEMPLO_H3 = {
  id: "demo", empresa: "Papelería Arcoíris", encargado: "Julio", rotuloSobre: ROTULOS_H3.sobre("Julio"),
  ops: [{
    id: "demo", subtema: SUBTEMAS_H3[0], monto: 200_000, debe: CAJA_MENOR, haber: BANCOS,
    antes: { billetes: 0, soportes: 0 }, despues: { billetes: 200_000, soportes: 0 },
    texto: "El 2 de enero, Papelería Arcoíris abre una caja menor. Le hace un cheque a Julio, que la va a manejar.",
    acierto: "La plata pasa del banco al fondo: Caja menor va al debe y Bancos al haber.",
    errores: ERRORES_APERTURA, pagina: "Basado en el libro, p. 181. Cifras construidas",
  }],
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Una serie al azar por intento; dentro, las cuatro en su orden. */
export const sortearH3 = (azar = Math.random) => SERIES_H3[Math.floor(azar() * SERIES_H3.length) % SERIES_H3.length];

/* El saldo de Caja menor en el libro: lo que lleva en el debe menos lo que lleva en el haber. */
export const libroCajaMenor = (totales) => (totales[CAJA_MENOR]?.debe ?? 0) - (totales[CAJA_MENOR]?.haber ?? 0);
/* Los totales con el asiento de una operación sumado en sus dos mitades. */
export function conAsiento(totales, debe, haber, monto) {
  const n = { ...totales, [debe]: { ...(totales[debe] ?? {}) }, [haber]: { ...(totales[haber] ?? {}) } };
  n[debe].debe = (n[debe].debe ?? 0) + monto;
  n[haber].haber = (n[haber].haber ?? 0) + monto;
  return n;
}
export const sobreSuma = (s) => s.billetes + s.soportes;

/*
 * El asiento del estudiante { debe, haber }, contra la operación. Con el
 * error, la línea «diría» sale solo si el asiento toca Caja menor y lo que
 * daría el libro no es lo que hay en el sobre después de la operación.
 */
export function evaluarH3(op, a, totales) {
  const ok = a.debe === op.debe && a.haber === op.haber;
  if (ok) return { ok, texto: op.acierto, diria: null, respuesta: `${a.debe} / ${a.haber}` };
  const error = op.errores.find((e) => e.cuando(a)) ?? null;
  const toca = a.debe === CAJA_MENOR || a.haber === CAJA_MENOR;
  const x = libroCajaMenor(conAsiento(totales, a.debe, a.haber, op.monto));
  const y = sobreSuma(op.despues);
  return { ok, texto: error?.texto ?? null, diria: toca && x !== y ? { x, y, texto: diriaH3(x, y) } : null, respuesta: `${a.debe} / ${a.haber}` };
}

/* Evaluativa: el motor escala los 25 FP con este porcentaje. */
export const puntuarH3 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por el texto de su operación, en las dos series. */
export const operacionDeItemH3 = (id) => SERIES_H3.flatMap((s) => s.ops).find((x) => x.id === id)?.texto ?? null;
