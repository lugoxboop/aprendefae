/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H1 DE HACER — «¿Entra o sale de Caja?» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «el cajón como tablero» (celula-d/hanayama-h1-
 * rediseno.md, con su §9), aprobado por Yujiro en su corte de calidad del
 * 15 oct 2026. Textos: Katsumi (celula-d/katsumi-texto-rediseno.md),
 * aprobados tal cual. Copia en el canon: orquestador/conocimiento/paquetes/
 * d4-t4-h1-v2-rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * Hacer · exploratoria · fácil · 10 FP. El motor compartido paga los 10 FP al
 * terminar; el porcentaje va para el panel docente. Su fila del servidor es
 * la migración 0200 y NO cambia: el `activity_id` sigue siendo
 * t4-entra-o-sale-de-caja.
 *
 * UN SOLO NEGOCIO: un taller de bicicletas con 400.000 en la caja. Los ocho
 * hechos son de esa misma caja, así que el saldo significa algo con los
 * hechos barajados: nunca da negativo (el peor orden deja 50.000) y siempre
 * termina en 600.000. Cifras construidas.
 *
 * LOS ÍTEMS CAMBIAN DE ID: h1-t1…h1-t8 (antes h1-1…h1-8), porque cambia el
 * enunciado. fp_detalle guarda item_id (migración 0017): las filas viejas
 * quedan con sus ids, y ITEMS_H1_ANTERIORES se guarda SOLO para que el panel
 * docente las siga leyendo (hechoDeItemH1). La partida no lo usa.
 *
 * Un solo toque por hecho (Yujiro). En el error la plata no entra donde se
 * eligió: ese lado se marca, y a los 0,7 s la plata va a donde iba. La caja
 * nunca muestra un saldo falso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { DEBE, HABER, NO_SE_MUEVE } from "./contabilidadT4.js";

export { DEBE, HABER, NO_SE_MUEVE };

export const H1_ID = "t4-entra-o-sale-de-caja";

export const SALDO_INICIAL_H1 = 400_000;

export const H1 = {
  id: H1_ID,
  nombre: "¿Entra o sale de Caja?",
  objetivo: "Decidir, ante cada hecho, si Caja va al debe, va al haber o no se mueve.",
  consigna: "La caja de un taller tiene 400.000. Manda cada hecho al debe, al haber o a «Caja no se mueve».",
};

/* Los tres destinos del cajón, siempre en este orden; el nombre es el que oye el lector de pantalla. */
export const DESTINOS_H1 = [
  { id: DEBE, nombre: "Al debe de Caja" },
  { id: HABER, nombre: "Al haber de Caja" },
  { id: NO_SE_MUEVE, nombre: "Caja no se mueve" },
];

export const SUBTEMAS_H1 = ["Entradas a Caja", "Salidas de Caja", "Caja o Bancos", "Caja frente a ingresos"];

/* Los botones de H1, los mismos de los Hacer (aprobados por Katsumi, «Pendientes del #260»). */
export const BOTON_H1 = { siguiente: "Siguiente hecho", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const resumenH1 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;

/* En el error, la plata va a donde iba a los 0,7 s (Hanayama §1). */
export const ESPERA_ERROR_H1_MS = 700;

const P180 = "Basado en el libro, p. 180. Cifras construidas.";

/*
 * Los ocho hechos, en el orden de Katsumi. La vista los baraja.
 *   · `respuesta`: el destino correcto
 *   · `va`: con el haber, a qué salida va la plata («bancos» o «pago»)
 *   · `toca`: con «no se mueve», si la plata pasó por el banco (Bancos se
 *     enciende sin cifra)
 *   · `viene`: el ítem del paquete v1 del que sale (mismo subtema y respuesta)
 */
export const ITEMS_H1 = [
  {
    id: "h1-t1", viene: "h1-1", subtema: "Entradas a Caja", respuesta: DEBE, monto: 180_000,
    texto: "Arregla las bicicletas de varios clientes, y todos le pagan de contado ese día.",
    acierto: "Entró plata a la caja, y Caja es un activo: lo que entra va al debe.",
    errores: {
      [HABER]: "Al revés: al haber va lo que sale. Aquí le pagaron, así que la plata entró y va al debe.",
      [NO_SE_MUEVE]: "Sí se mueve: de contado quiere decir que la plata entró hoy a la caja. Va al debe.",
    },
    pagina: P180,
  },
  {
    id: "h1-t2", viene: "h1-2", subtema: "Caja o Bancos", respuesta: HABER, va: "bancos", monto: 200_000,
    texto: "Saca plata de la caja y la consigna en la cuenta corriente del taller.",
    acierto: "La plata salió de la caja y llegó al banco: Caja se acredita y Bancos se debita.",
    errores: {
      [DEBE]: "Bancos es la que se debita, porque ahí llegó la plata. Caja la entregó, así que va al haber.",
      [NO_SE_MUEVE]: "La plata sigue siendo del taller, pero ya no está en la caja. Salió por el haber hacia Bancos.",
    },
    pagina: P180,
  },
  {
    id: "h1-t3", viene: "h1-3", subtema: "Salidas de Caja", respuesta: HABER, va: "pago", monto: 150_000,
    texto: "Le compra herramientas a un proveedor y se las paga con billetes de la caja.",
    acierto: "Salió plata de la caja para pagar, y lo que sale de Caja va al haber.",
    errores: {
      [DEBE]: "Pagar no es recibir. La plata salió de la caja hacia el proveedor, así que va al haber.",
      [NO_SE_MUEVE]: "Sí se mueve: los billetes salieron de la caja para pagar las herramientas. Pagar en efectivo acredita Caja.",
    },
    pagina: P180,
  },
  {
    id: "h1-t4", viene: "h1-4", subtema: "Caja o Bancos", respuesta: NO_SE_MUEVE, toca: "bancos", monto: 90_000,
    texto: "Le paga a su proveedor de repuestos con un cheque propio.",
    acierto: "Un cheque propio saca la plata del banco: se acredita Bancos, y Caja no se toca.",
    errores: {
      [HABER]: "Esa plata no sale de la caja, sino de la cuenta del banco. Por eso se acredita Bancos, y Caja no se mueve.",
      [DEBE]: "Aquí el taller paga, no recibe. Y paga con un cheque propio, así que la plata sale del banco. Caja no se mueve.",
    },
    pagina: "Basado en el libro, p. 187. Cifras construidas.",
  },
  {
    id: "h1-t5", viene: "h1-5", subtema: "Entradas a Caja", respuesta: DEBE, monto: 120_000,
    texto: "Un cliente le paga con un cheque, y el taller lo guarda en su caja.",
    acierto: "La caja guarda billetes y también los cheques que el taller tiene en la mano. Entró un cheque: va al debe.",
    errores: {
      [NO_SE_MUEVE]: "El taller recibió el cheque y lo guarda en la caja, así que Caja sí se mueve: va al debe.",
      [HABER]: "Aquí el taller recibe, no paga. Lo que entra a la caja, billetes o un cheque, va al debe.",
    },
    pagina: "Basado en el libro, pp. 179-180. Cifras construidas.",
  },
  {
    id: "h1-t6", viene: "h1-6", subtema: "Caja o Bancos", respuesta: NO_SE_MUEVE, toca: "bancos", monto: 160_000,
    texto: "Un cliente paga lo que debe consignando directo en la cuenta del taller.",
    acierto: "La plata fue directo al banco y nunca pasó por la caja. Se debita Bancos.",
    errores: {
      [DEBE]: "Sí entró plata, pero al banco, no a la caja. Se debita Bancos, y Caja no se mueve.",
      [HABER]: "Nada salió de la caja. La plata entró, y entró directo al banco: Caja no se mueve.",
    },
    pagina: "Basado en el libro, p. 186. Cifras construidas.",
  },
  {
    id: "h1-t7", viene: "h1-7", subtema: "Caja frente a ingresos", respuesta: DEBE, monto: 250_000,
    texto: "Los socios ponen más plata, en efectivo, para que el taller crezca.",
    acierto: "Entró plata a la caja, aunque nadie compró nada. Va al debe; el aporte no es un ingreso.",
    errores: {
      [NO_SE_MUEVE]: "Sí se mueve: el efectivo entró a la caja. Que el aporte no sea un ingreso no quiere decir que Caja se quede quieta.",
      [HABER]: "Al revés. La plata entró a la caja, no salió. Lo que entra a Caja va al debe.",
    },
    pagina: P180,
  },
  {
    id: "h1-t8", viene: "h1-8", subtema: "Caja frente a ingresos", respuesta: NO_SE_MUEVE, monto: 70_000,
    texto: "Arregla una bicicleta, y el cliente le va a pagar el mes que viene.",
    acierto: "Ya hay un ingreso, pero todavía no entra un peso. Vender no es cobrar: Caja se mueve cuando llegue el pago.",
    errores: {
      [DEBE]: "El taller ya vendió, pero no ha cobrado. La plata no ha entrado a la caja, así que Caja todavía no se mueve.",
      [HABER]: "Aquí no sale plata de la caja. Tampoco entra: el cliente paga el mes que viene. Caja no se mueve hoy.",
    },
    /* Sin página del libro, a propósito: «Vender no es cobrar» es del Tema 3 (paquete). */
    pagina: "Cifras construidas.",
  },
];

/*
 * LOS OCHO HECHOS DE ANTES (paquete d4-t4-h1-v1.md), SOLO PARA LEER. Las
 * partidas jugadas antes del rediseño guardaron estos ids en fp_detalle; el
 * panel docente los sigue nombrando por su hecho. La partida no los usa.
 */
export const ITEMS_H1_ANTERIORES = [
  { id: "h1-1", subtema: "Entradas a Caja", texto: "Un taller arregla las bicicletas de varios clientes. Todos le pagan de contado ese mismo día." },
  { id: "h1-2", subtema: "Caja o Bancos", texto: "Al final del día, una tienda lleva al banco todo el efectivo que recibió y lo consigna en su cuenta corriente." },
  { id: "h1-3", subtema: "Salidas de Caja", texto: "Un almacén le compra unas mesas a un proveedor y se las paga en efectivo, con plata de la caja." },
  { id: "h1-4", subtema: "Caja o Bancos", texto: "Una ferretería le paga a su proveedor con un cheque propio." },
  { id: "h1-5", subtema: "Entradas a Caja", texto: "Un cliente le paga a una papelería con un cheque, y la papelería lo guarda en su caja." },
  { id: "h1-6", subtema: "Caja o Bancos", texto: "Un cliente le paga a una empresa: consigna la plata en la cuenta que esa empresa tiene en el banco." },
  { id: "h1-7", subtema: "Caja frente a ingresos", texto: "Los socios ponen plata en efectivo para que su nueva empresa pueda arrancar." },
  { id: "h1-8", subtema: "Caja frente a ingresos", texto: "Una empresa le presta un servicio a un cliente, y el cliente le va a pagar el mes que viene." },
];

export const CIERRE_H1 = {
  texto: "La caja empezó en 400.000 y termina en 600.000. Lo que entró fue al debe, y lo que salió, al haber. Un cheque propio o una consignación directa del cliente mueven Bancos, no Caja.",
  pie: "Basado en el libro, pp. 179-180, 186 y 187. Cifras construidas.",
};

/*
 * «Así se juega» (Katsumi). El ejemplo es construido y no está en el banco:
 * unas llantas pagadas con billetes de la caja, 60.000, al haber hacia el
 * pago. La mano TOCA el haber del cajón.
 */
export const PASOS_H1 = ["Lee el hecho.", "¿Entra plata a la caja, sale o no la toca?", "Toca donde va y mira el saldo."];
export const ALT_H1 = "El taller paga unas llantas con billetes de la caja. Sale plata: el hecho va al haber, y en la caja quedan 340.000 de los 400.000.";
export const EJEMPLO_H1 = {
  id: "demo",
  subtema: "Salidas de Caja",
  texto: "Paga de contado unas llantas, con billetes de la caja.",
  monto: 60_000,
  respuesta: HABER,
  va: "pago",
  acierto: "Salieron billetes de la caja, así que va al haber.",
  errores: {},
  pagina: null,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

export const sortearH1 = (barajar) => barajar(ITEMS_H1);
export const nombreDeDestinoH1 = (id) => DESTINOS_H1.find((d) => d.id === id)?.nombre ?? null;

/* El veredicto de un toque: acierto con su texto; error con el texto de ese destino. */
export function evaluarH1(item, elegido) {
  const ok = elegido === item.respuesta;
  return { ok, correcta: item.respuesta, texto: ok ? item.acierto : item.errores[elegido], pagina: item.pagina };
}

/*
 * La caja del taller después de una lista de hechos ya puestos en su sitio
 * (en el error, la plata también va a donde iba). Debe: el saldo inicial y
 * las entradas; Haber: las salidas; la bandeja guarda el último que no movió
 * Caja.
 */
export function libroH1(puestos, inicial = SALDO_INICIAL_H1) {
  const debe = [{ id: "inicial", monto: inicial }];
  const haber = [];
  let saldo = inicial;
  let bandeja = null;
  for (const it of puestos) {
    if (it.respuesta === DEBE) { debe.push({ id: it.id, monto: it.monto }); saldo += it.monto; }
    if (it.respuesta === HABER) { haber.push({ id: it.id, monto: it.monto }); saldo -= it.monto; }
    if (it.respuesta === NO_SE_MUEVE) bandeja = { id: it.id, monto: it.monto };
  }
  return { debe, haber, saldo, bandeja };
}

/* Exploratoria: el motor paga los 10 FP al terminar; el porcentaje va al panel docente. */
export const puntuarH1 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por su hecho, sea de antes o de después del rediseño. */
export const hechoDeItemH1 = (id) => (ITEMS_H1.find((x) => x.id === id) ?? ITEMS_H1_ANTERIORES.find((x) => x.id === id))?.texto ?? null;
