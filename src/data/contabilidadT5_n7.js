import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N7 DE HACER — «¿A qué cuenta va?» (Célula C) · versión 2.
 *
 * Fuente: la v2 de Near, con el canon C1–C8, en
 * orquestador/conocimiento/paquetes/t5-n7-a-que-cuenta-va-v2.md, con la
 * corrección obligatoria N7-1 de Mello
 * (paquetes/auditoria-mello-n6-n7-v2-y-enganche-v5.md, sección 3): en el
 * hecho 3 el dividendo llega por transferencia, y la línea de $75.000 pasa a
 * Bancos al debe, con Caja e Inversiones – títulos de distractores. Una
 * prueba compara cada texto de aquí contra el paquete con esa corrección
 * encima, letra por letra (correccionesMelloN7.mjs).
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0114, que corre Erwin.
 *
 * DIEZ ACIERTOS POSIBLES: la casilla del costo y las dos líneas del hecho 1,
 * las dos del hecho 2, las dos del hecho 3 y las tres del hecho 4. Escalera
 * (C2): al primer error, la pista (o el texto de la cifra que se reconoce);
 * al segundo, la respuesta con su porqué. Solo suma el primer intento:
 * «Vale el primer intento».
 *
 * LAS CIFRAS son construidas (Guayacán) y son las del registro de T5
 * (orquestador/conocimiento/registro-cifras-construidas-t5.json); el costo y
 * el total del hecho 4 salen de sumar (calcularN7).
 *
 * NOMBRES DE CUENTA: los del canon, con raya –.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N7_ID = "t5-a-que-cuenta-va";

export const PRECIO_N7 = 2150000;
export const GASTOS_N7 = 34000;
export const CDT_N7 = 96000;
export const DIVIDENDO_N7 = 75000;
export const BONO_N7 = 58000;
export const ACCIONES_N7 = 31000;

export function calcularN7() {
  return {
    precio: PRECIO_N7, gastos: GASTOS_N7, costo: PRECIO_N7 + GASTOS_N7,
    cdt: CDT_N7, dividendo: DIVIDENDO_N7, bono: BONO_N7, acciones: ACCIONES_N7, juntos: BONO_N7 + ACCIONES_N7,
  };
}
export const CIFRAS_N7 = calcularN7();
const C = CIFRAS_N7;

export const N7 = {
  id: N7_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Registrar compras con gastos, intereses y dividendos en la cuenta y el lado que les tocan.",
  nombre: "¿A qué cuenta va?",
  consigna: "Lee cada hecho de Guayacán y arma su asiento: elige la cuenta y el lado de cada línea.",
  enunciado: [],
  distintivo: "Vale el primer intento",
  pie: "Basado en el libro, pp. 193-194",
};

export const BOTON_N7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const CAJA = "Caja";
const BANCOS = "Bancos";
const INVERSIONES = "Inversiones – títulos";
const INTERESES = "Ingresos por intereses";
const DIVIDENDOS = "Ingresos por dividendos";

/* Los cuatro hechos, tal cual (el 3, con N7-1 de Mello). */
export const HECHOS_N7 = [
  "Guayacán tiene efectivo de sobra por un tiempo. Compra acciones por $2.150.000 y paga $34.000 de gastos para hacer la compra. Paga todo con un cheque.",
  "Un CDT que Guayacán tiene desde antes le paga $96.000 en efectivo.",
  "La empresa de las acciones que compró Guayacán reparte dinero entre sus dueños. A Guayacán le pagan $75.000 con una transferencia.",
  "En efectivo le llegan $89.000 juntos: $58.000 de un bono que tiene desde antes y $31.000 de sus acciones.",
];

/*
 * Los ítems, en el orden del paquete. Una casilla ("cifra") lleva su hecho
 * como `intro`, encima de la pregunta. Un asiento ("asiento", Arma la línea)
 * lleva su hecho como pregunta: el paquete no le da otra, y la consigna de
 * arriba ya dice qué hacer con él. Cada línea: la cuenta correcta, sus dos
 * distractores de cuenta, su pista (1.er error) y su respuesta (`retro`,
 * 2.º error). La pieza baraja las líneas y el banco de cuentas.
 *
 * La casilla trae `porque`: el porqué propio de su respuesta del 2.º error,
 * que en la ficha no es el acierto sin su «Así es.».
 */
export const ITEMS_N7 = [
  {
    id: "costo-de-la-compra", tipo: "cifra", hecho: 1, intro: HECHOS_N7[0],
    pregunta: "¿Por cuánto entra la compra a Inversiones – títulos?",
    correcta: C.costo,
    pista: "Mira todo lo que pagó para hacer la compra, no solo el precio.",
    distractores: [
      { valor: C.precio, retro: "Ese es solo el precio. Faltan los gastos del proceso de la compra." },
      { valor: C.gastos, retro: "Esos son solo los gastos. Se suman al precio." },
    ],
    acierto: "Así es: $2.150.000 + $34.000 = $2.184.000.",
    porque: "Los gastos del proceso de la compra van al costo: $2.150.000 + $34.000.",
  },
  {
    id: "la-compra", tipo: "asiento", hecho: 1,
    pregunta: HECHOS_N7[0],
    lineas: [
      {
        id: "inversiones", cuenta: INVERSIONES, valor: C.costo, lado: DEBE, distractores: [BANCOS, CAJA],
        pista: "¿Qué tiene ahora Guayacán que antes no tenía?",
        retro: "Ahora Guayacán tiene acciones. La inversión aumenta: va al debe, por todo lo que costó.",
      },
      {
        id: "bancos", cuenta: BANCOS, valor: C.costo, lado: HABER, distractores: [CAJA, INVERSIONES],
        pista: "Pagó con un cheque. ¿De qué cuenta sale ese dinero?",
        retro: "El cheque sale de Bancos. Un activo que baja va al haber.",
      },
    ],
  },
  {
    id: "el-cdt", tipo: "asiento", hecho: 2,
    pregunta: HECHOS_N7[1],
    lineas: [
      {
        id: "caja", cuenta: CAJA, valor: C.cdt, lado: DEBE, distractores: [BANCOS, INVERSIONES],
        pista: "El dinero llega en efectivo. ¿A qué cuenta entra?",
        retro: "El efectivo entra a Caja. Un activo que aumenta va al debe.",
      },
      {
        id: "intereses", cuenta: INTERESES, valor: C.cdt, lado: HABER, distractores: [DIVIDENDOS, INVERSIONES],
        pista: "¿Qué rinde un CDT: interés o dividendo?",
        retro: "Un CDT es renta fija con interés: lo que paga va al haber de Ingresos por intereses.",
      },
    ],
  },
  {
    id: "el-dividendo", tipo: "asiento", hecho: 3,
    pregunta: HECHOS_N7[2],
    lineas: [
      {
        /* N7-1 de Mello: llega por transferencia, a Bancos. */
        id: "bancos", cuenta: BANCOS, valor: C.dividendo, lado: DEBE, distractores: [CAJA, INVERSIONES],
        pista: "Esta vez no le dan efectivo. ¿A qué cuenta llega una transferencia?",
        retro: "Una transferencia entra a Bancos. Un activo que aumenta va al debe.",
      },
      {
        id: "dividendos", cuenta: DIVIDENDOS, valor: C.dividendo, lado: HABER, distractores: [INTERESES, INVERSIONES],
        pista: "Lo pagan unas acciones. ¿Qué rinden las acciones?",
        retro: "Lo que reparten las acciones es un dividendo: va al haber de Ingresos por dividendos.",
      },
    ],
  },
  {
    id: "los-dos-juntos", tipo: "asiento", hecho: 4,
    pregunta: HECHOS_N7[3],
    lineas: [
      {
        id: "caja", cuenta: CAJA, valor: C.juntos, lado: DEBE, distractores: [BANCOS, INVERSIONES],
        pista: "Entra todo junto. ¿A qué cuenta va el total?",
        retro: "Caja recibe los $89.000 juntos: va al debe.",
      },
      {
        id: "intereses", cuenta: INTERESES, valor: C.bono, lado: HABER, distractores: [DIVIDENDOS, INVERSIONES],
        pista: "Esta parte la paga un bono. ¿Qué rinde un bono?",
        retro: "El bono da interés: va al haber de Ingresos por intereses.",
      },
      {
        id: "dividendos", cuenta: DIVIDENDOS, valor: C.acciones, lado: HABER, distractores: [INTERESES, INVERSIONES],
        pista: "Esta parte la pagan las acciones. ¿Rinden lo mismo que el bono?",
        retro: "Las acciones dan dividendo: va al haber de Ingresos por dividendos.",
      },
    ],
  },
];

/*
 * LA FIGURA (C8), PROVISIONAL PARA WATARI. Arriba, el libro de Guayacán, que
 * gana el asiento de cada hecho al cerrarlo (acierto o segundo error), nunca
 * antes (E8). Al lado, la cuenta T de Inversiones – títulos con lo que estos
 * hechos le mueven: sube con la compra y no se mueve con el interés ni con el
 * dividendo. Sin saldo inicial: el CDT y el bono son «desde antes», y el
 * paquete no dice cuánto había.
 */
/* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el título sale de la frase del paquete «El libro de Guayacán queda arriba…», y el rótulo de cada asiento, de las cabeceras «Hecho 1 · …» a «Hecho 4 · …». */
export const FIGURA_N7 = {
  titulo: "El libro de Guayacán",
  cuenta: INVERSIONES,
  rotulo: (hecho) => `Hecho ${hecho}`,
};

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los diez al primer toque. */
export const resumenN7 = (bien, total) => `${bien} de ${total} al primer toque.`;
