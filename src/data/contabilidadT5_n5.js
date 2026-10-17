import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 DE HACER — «¿Ganó o perdió?» (Célula C) · versión 2.
 *
 * Fuente: la v2 de Near, rehecha con el canon C1–C8, en
 * orquestador/conocimiento/paquetes/t5-n5-gano-o-perdio-v2.md, con la
 * corrección obligatoria N5-1 de Mello
 * (paquetes/auditoria-mello-n5-v2-y-entrega-d-v2.md, sección 1): mientras se
 * arma el asiento 2, la fila del asiento 1 de la figura va plegada. Una prueba
 * compara cada texto de aquí contra el paquete con esa corrección encima,
 * letra por letra. La opcional de Mello (reconocer 105.000 en el ítem 7) NO
 * se aplica.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0113, que corre Erwin.
 *
 * DIEZ ACIERTOS POSIBLES: los ítems 1, 2 y 3, las tres líneas del primer
 * asiento, el ítem 7 y las tres líneas del segundo. Escalera (C2): al primer
 * error, la pista (o el texto del error que se reconoce); al segundo, la
 * respuesta con su porqué. Solo suma el primer intento: «Vale el primer
 * intento». Venta por el costo, como en el libro y como publicó B.
 *
 * LAS CIFRAS son construidas (Acacia) y salen de las acciones, el precio de
 * compra y las dos ventas (calcularN5); el registro de T5 las trae. La única
 * que no es del registro es la de las 900 a precio de venta (4.860.000): es
 * cifra del libro, nunca sale en pantalla y solo sirve para reconocer ese
 * error en el ítem 1 (así lo aceptó Mello).
 *
 * NOMBRES DE CUENTA: los del canon, con raya –.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N5_ID = "t5-gano-o-perdio";

export const ACCIONES_N5 = 900;
export const PRECIO_N5 = 5100;
export const VENTA1_N5 = { acciones: 550, precio: 5400 };
export const VENTA2_N5 = { precio: 4400 };

export function calcularN5() {
  const inversion = ACCIONES_N5 * PRECIO_N5;
  const quedan = ACCIONES_N5 - VENTA1_N5.acciones;
  const recibe1 = VENTA1_N5.acciones * VENTA1_N5.precio;
  const costo1 = VENTA1_N5.acciones * PRECIO_N5;
  const recibe2 = quedan * VENTA2_N5.precio;
  const costo2 = quedan * PRECIO_N5;
  return {
    inversion, quedan, recibe1, costo1, ganancia: recibe1 - costo1, recibe2, costo2, perdida: costo2 - recibe2,
    /* Los errores que reconoce la casilla del ítem 1. */
    lasQueQuedan: quedan * VENTA1_N5.precio, lasNovecientas: ACCIONES_N5 * VENTA1_N5.precio,
  };
}
export const CIFRAS_N5 = calcularN5();
const C = CIFRAS_N5;

export const N5 = {
  id: N5_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Calcular si una venta de acciones dio ganancia o pérdida, y registrarla por el costo.",
  nombre: "¿Ganó o perdió?",
  consigna: "Acacia vende sus acciones en dos partes. En cada venta, calcula si ganó o perdió y arma el asiento.",
  enunciado: ["El 1 de abril, Acacia usa efectivo que le sobra para comprar 900 acciones de otra empresa. Paga $5.100 por cada una, que es su valor nominal."],
  distintivo: "Vale el primer intento",
  pie: "Basado en el libro, pp. 193-195",
};

export const BOTON_N5 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/* Ganó o Perdió, el control junto a la casilla de los ítems 3 y 7. */
export const GANO = "gano";
export const PERDIO = "perdio";
export const RESULTADOS_N5 = [{ valor: GANO, texto: "Ganó" }, { valor: PERDIO, texto: "Perdió" }];

const CAJA = "Caja";
const INVERSIONES = "Inversiones – títulos";
const GANANCIA = "Ingresos financieros – ganancia en venta de títulos";
const PERDIDA = "Gastos financieros – pérdida en venta de títulos";
const INTERESES = "Ingresos por intereses";
const ARMA_EL_ASIENTO = "Arma el asiento de esta venta: en cada línea, elige la cuenta y el lado.";

/*
 * Los tipos: "cifra" (casilla; con `resultado`, también Ganó o Perdió, y las
 * dos partes deben estar bien) y "asiento" (Arma la línea). Un distractor de
 * cifra es { valor, retro } y, en los ítems con Ganó o Perdió, puede pedir
 * además el `resultado` elegido. Cada línea: la cuenta correcta, sus dos
 * distractores de cuenta, su pista (1.er error) y su respuesta (`retro`,
 * 2.º error). Las líneas van en el orden del paquete (el de la p. 195); la
 * pieza las baraja.
 */
export const ITEMS_N5 = [
  {
    id: "lo-que-recibe", tipo: "cifra",
    pregunta: "El 10 de julio, Acacia vende 550 de sus acciones. Le pagan $5.400 por cada una. ¿Cuánto recibe?",
    correcta: C.recibe1,
    pista: "Lo que recibe sale de las acciones que vendió y del precio que le pagan por cada una.",
    distractores: [
      { valor: C.lasNovecientas, retro: "Ese cálculo usa las 900. Pero de esas, Acacia solo vendió 550." },
      { valor: C.lasQueQuedan, retro: "Ese cálculo usa las 350 que se quedan. Lo que recibe sale de las que vendió." },
    ],
    acierto: "Así es: 550 × $5.400 = $2.970.000.",
  },
  {
    id: "lo-que-costaron", tipo: "cifra",
    pregunta: "¿Cuánto le habían costado esas 550 acciones?",
    correcta: C.costo1,
    pista: "Busca en la figura cuánto pagó Acacia por cada acción cuando la compró.",
    distractores: [
      { valor: C.recibe1, retro: "Eso es lo que recibe al venderlas. Aquí va lo que pagó al comprarlas." },
      { valor: C.costo2, retro: "Ese es el costo de las 350 que se quedan. Aquí van las que vendió." },
    ],
    acierto: "Así es: 550 × $5.100 = $2.805.000.",
  },
  {
    id: "gano-o-perdio-1", tipo: "cifra", resultado: GANO,
    pregunta: "¿Ganó o perdió en esta venta, y cuánto?",
    correcta: C.ganancia,
    pista: "Compara lo que recibió con lo que le costaron las acciones vendidas. Las dos cifras están en la figura.",
    distractores: [
      { resultado: PERDIO, valor: C.ganancia, retro: "La cifra está bien, pero recibió más de lo que le costaron." },
      { valor: C.recibe1, retro: "Eso es lo que recibió, no lo que ganó o perdió." },
    ],
    acierto: "Así es: $2.970.000 − $2.805.000 = $165.000. Ganó.",
  },
  {
    id: "asiento-con-ganancia", tipo: "asiento",
    pregunta: ARMA_EL_ASIENTO,
    lineas: [
      {
        id: "caja", cuenta: CAJA, valor: C.recibe1, lado: DEBE, distractores: [INVERSIONES, GANANCIA],
        pista: "¿A qué cuenta entra el dinero que le pagan?",
        retro: "Acacia recibe el dinero en Caja. Es un activo que aumenta: va al debe.",
      },
      {
        id: "inversiones", cuenta: INVERSIONES, valor: C.costo1, lado: HABER, distractores: [CAJA, GANANCIA],
        pista: "Las acciones vendidas salen de la cuenta donde entraron al comprarlas.",
        retro: "Salen las 550 acciones, así que la inversión baja: va al haber, por lo que costaron.",
      },
      {
        id: "ganancia", cuenta: GANANCIA, valor: C.ganancia, lado: HABER, distractores: [PERDIDA, INTERESES],
        pista: "Es lo que Acacia ganó. ¿Una ganancia aumenta un ingreso o un gasto?",
        retro: "La ganancia es un ingreso que aumenta: va al haber.",
      },
    ],
  },
  {
    id: "gano-o-perdio-2", tipo: "cifra", resultado: PERDIO,
    pregunta: "El 20 de octubre, Acacia vende las 350 acciones que le quedan. Le pagan $4.400 por cada una. ¿Ganó o perdió, y cuánto?",
    correcta: C.perdida,
    pista: "Calcula lo que recibe por las 350 y lo que le costaron. Después compara las dos cifras.",
    distractores: [
      { resultado: GANO, valor: C.perdida, retro: "La cifra está bien, pero recibió menos de lo que le costaron." },
      { valor: C.recibe2, retro: "Eso es lo que recibe. Falta compararlo con lo que le costaron." },
      { valor: C.costo2, retro: "Eso es lo que le costaron. Falta compararlo con lo que recibe." },
    ],
    acierto: "Así es: recibió $1.540.000 por acciones que le costaron $1.785.000. Perdió $245.000.",
  },
  {
    id: "asiento-con-perdida", tipo: "asiento",
    pregunta: ARMA_EL_ASIENTO,
    lineas: [
      {
        id: "caja", cuenta: CAJA, valor: C.recibe2, lado: DEBE, distractores: [INVERSIONES, PERDIDA],
        pista: "El dinero de esta venta también entra a una cuenta. ¿Cuál?",
        retro: "Entra a Caja el dinero de la venta. Un activo que aumenta va al debe.",
      },
      {
        id: "perdida", cuenta: PERDIDA, valor: C.perdida, lado: DEBE, distractores: [GANANCIA, INTERESES],
        pista: "Esta vez Acacia perdió. ¿Una pérdida es un ingreso o un gasto?",
        retro: "La pérdida es un gasto que aumenta: va al debe.",
      },
      {
        id: "inversiones", cuenta: INVERSIONES, valor: C.costo2, lado: HABER, distractores: [CAJA, PERDIDA],
        pista: "Salen las últimas acciones, de la misma cuenta donde entraron al comprarlas.",
        retro: "Salen las últimas 350 acciones y la inversión baja hasta cero: va al haber, por su costo.",
      },
    ],
  },
];

/*
 * LA FIGURA «La inversión de Acacia» (C8): arriba, toda la pieza. Cada fila
 * sale cuando se cierra el ítem `tras` (acierto o segundo error), nunca antes
 * (E8), y ninguna resta antes de que el estudiante la haga. Una fila con
 * `asiento` pinta ese asiento con sus sumas. Corrección N5-1 de Mello: la del
 * asiento 1 va `plegada` mientras se arma el asiento 2 (`plegadaDurante`),
 * sin sus líneas, y se despliega al cerrarlo.
 */
export const FIGURA_N5 = {
  titulo: "La inversión de Acacia",
  filas: [
    { id: "compra", tras: null, texto: "1 abr · compra 900 acciones · $5.100 cada una · costo $4.590.000" },
    { id: "venta-1", tras: "lo-que-recibe", texto: "10 jul · vende 550 · $5.400 cada una · recibe $2.970.000" },
    { id: "costo-1", tras: "lo-que-costaron", texto: "costo de las 550 · $2.805.000" },
    { id: "resultado-1", tras: "gano-o-perdio-1", texto: "ganó $165.000" },
    { id: "asiento-1", tras: "asiento-con-ganancia", asiento: "asiento-con-ganancia", plegada: "10 jul · asiento armado ✓", plegadaDurante: "asiento-con-perdida" },
    { id: "venta-2", tras: "gano-o-perdio-2", texto: "20 oct · vende 350 · $4.400 cada una · recibe $1.540.000 · costo $1.785.000 · perdió $245.000" },
    { id: "asiento-2", tras: "asiento-con-perdida", asiento: "asiento-con-perdida" },
  ],
};

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los diez al primer toque. */
export const resumenN5 = (bien, total) => `${bien} de ${total} al primer toque.`;
