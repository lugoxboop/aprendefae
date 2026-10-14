import { kardex, PEPS, UEPS_M, PROMEDIO } from "../contabilidad/t7_2Kardex.js";
import { UEPS, KARDEX_A3 } from "./contabilidadT7_2_a3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H3 DE HACER — «Llena el kárdex» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello y sus correcciones (el id
 * t7-2-llena-el-kardex, como en el plan v1, y la empresa Laurel, que antes
 * era Nogal). Copia en orquestador/conocimiento/paquetes/t7-2-h3-v1.md; una
 * prueba compara cada texto de aquí contra ella, letra por letra.
 *
 * Hacer Difícil, evaluativa, 50 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0100, que corre Mateo.
 *
 * DIEZ ACIERTOS POSIBLES: nueve casillas del kárdex (tres por método) y la
 * comparación final. Un solo intento por casilla, sin arrastre: cada casilla
 * tiene su cifra fija.
 *
 * LAS CIFRAS no se escriben a mano: los tres kárdex salen de los movimientos
 * con el cálculo de A3 y A4 (t7_2Kardex.js), y la respuesta de cada casilla
 * se lee de ellos. Una prueba las compara con las de Near. Son construidas
 * (registro 5c); ninguna es del periódico (regla 3). Los distractores sí son
 * los de Near, tal cual.
 *
 * Lo que la v1 no trae y se toma de la convención de H1 y H2: los botones
 * «Siguiente ítem» y «Ver mi resumen». Los títulos de cada kárdex son los de
 * A3, y las fechas van cortas, como allá («1 may»).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H3_ID = "t7-2-llena-el-kardex";

export const H3 = {
  id: H3_ID,
  nombre: "Llena el kárdex",
  consigna: "Llena el kárdex con los tres métodos. Toca la casilla con un punto y elige su valor. Tienes un solo intento por casilla.",
  /* Corrección de Near con el PASA de Mello: la empresa se llama Laurel. */
  enunciado: ["La empresa Laurel usa el sistema de inventario permanente. Estos son sus movimientos de mayo."],
  /* Los movimientos de la v1, uno por renglón; el «;» y el «.» del final de cada uno, que son de la lista en prosa, no van. */
  movimientos: [
    "1 de mayo: saldo de 20 u a $3.100",
    "6 de mayo: compra 40 u a $3.370",
    "12 de mayo: vende 45 u",
    "18 de mayo: compra 30 u a $3.580",
    "26 de mayo: vende 25 u",
  ],
  pie: "Basado en el libro, pp. 238-241",
};

export const BOTON_H3 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/* Los datos: lo que había y cada movimiento, con su fecha (regla 10, versión T7-2). */
export const INICIAL_H3 = Object.assign([20, 3100], { fecha: "1 may" });
export const MOVIMIENTOS_H3 = [
  { fecha: "6 may", compra: [40, 3370] },
  { fecha: "12 may", venta: 45 },
  { fecha: "18 may", compra: [30, 3580] },
  { fecha: "26 may", venta: 25 },
];

/* Las tres pestañas, con los nombres de los subtemas de la ficha. */
export const METODOS_H3 = [
  { id: PEPS, nombre: "PEPS" },
  { id: UEPS_M, nombre: UEPS },
  { id: PROMEDIO, nombre: "Promedio ponderado" },
];
export const nombreDeMetodo = (id) => METODOS_H3.find((m) => m.id === id)?.nombre ?? null;

/*
 * De las filas del cálculo a las de la tabla de A3: { f, en?, sa?, saT?, sal, salT?, fin? }.
 * Como en A3, la fila «Total» va en las salidas de más de una capa y en el saldo final.
 */
const suma = (capas) => capas.reduce((s, c) => s + c[2], 0);
function aTabla(filas) {
  return filas.map((r, k) => ({
    f: r.fecha,
    ...(r.entrada && { en: r.entrada }),
    ...(r.salida && { sa: r.salida, ...(r.salida.length > 1 && { saT: suma(r.salida) }) }),
    sal: r.saldo,
    ...(k === filas.length - 1 && { fin: true, ...(r.saldo.length > 1 && { salT: suma(r.saldo) }) }),
  }));
}

export const KARDEX_H3 = Object.fromEntries(METODOS_H3.map((m) => [m.id, {
  titulo: KARDEX_A3[m.id].titulo,
  filas: aTabla(kardex(INICIAL_H3, MOVIMIENTOS_H3, m.id)),
}]));

/* La cifra de una casilla, leída del kárdex: el total de un bloque o el costo unitario de un saldo. */
export function valorDeCelda(metodo, { f, bloque, que }) {
  const fila = KARDEX_H3[metodo].filas.find((r) => r.f === f);
  const capas = fila[bloque];
  return que === "cu" ? capas[0][1] : suma(capas);
}

export const SUBTEMAS_H3 = ["PEPS", UEPS, "Promedio ponderado", "Comparar métodos"];

const P1 = "¿Cuánto costaron las 45 unidades que salieron el 12?";
const P2 = "¿Cuánto costaron las 25 unidades que salieron el 26?";
const P3 = "¿Cuánto valen las 20 unidades que quedan al final?";
const P7 = (dia) => `¿Cuál es el costo promedio de cada unidad después de la compra del ${dia}?`;

const casilla = (id, metodo, pregunta, celda, distractores, acierto) => ({
  id, tipo: "casilla", metodo, subtema: nombreDeMetodo(metodo), pregunta, celda,
  correcta: valorDeCelda(metodo, celda), distractores, acierto,
});

export const ITEMS_H3 = [
  casilla("peps-venta-12", PEPS, P1, { f: "12 may", bloque: "sa", que: "total" }, [
    { valor: 139_500, retro: "Solo había 20 unidades de $3.100. Las otras 25 salen de la compra del 6, a $3.370." },
    { valor: 151_650, retro: "Antes que las de $3.370 salen las 20 del inicio, a $3.100." },
  ], "Así es. Salen primero las más antiguas: 20 de $3.100 y después 25 de $3.370."),
  casilla("peps-venta-26", PEPS, P2, { f: "26 may", bloque: "sa", que: "total" }, [
    { valor: 89_500, retro: "Primero salen las 15 de $3.370 que quedaban de la compra del 6." },
    { valor: 84_250, retro: "Solo quedaban 15 de $3.370. Las otras 10 salen de la compra del 18, a $3.580." },
  ], "Así es. Salen primero las 15 de $3.370 que quedaban, y después 10 de $3.580."),
  casilla("peps-saldo-final", PEPS, P3, { f: "26 may", bloque: "sal", que: "total" }, [
    { valor: 67_400, retro: "Las de $3.370 ya salieron todas. Quedan 20 de la compra del 18, a $3.580." },
    { valor: 62_000, retro: "Las 20 del inicio salieron el 12. Quedan 20 de la compra del 18, a $3.580." },
  ], "Así es. Quedan 20 de la compra del 18, a $3.580 cada una."),
  /* «Misma pregunta que el ítem 1» y los dos siguientes: la v1 no repite el texto. */
  casilla("ueps-venta-12", UEPS_M, P1, { f: "12 may", bloque: "sa", que: "total" }, [
    { valor: 151_650, retro: "Solo entraron 40 de $3.370. Las otras 5 salen del inicio, a $3.100." },
    { valor: 146_250, retro: "Saliste primero de las más antiguas. Aquí salen primero las últimas que entraron: las 40 de $3.370." },
  ], "Así es. Salen primero las últimas que entraron: las 40 de $3.370 y después 5 de $3.100."),
  casilla("ueps-venta-26", UEPS_M, P2, { f: "26 may", bloque: "sa", que: "total" }, [
    { valor: 77_500, retro: "Aquí salen primero las que entraron de último: las del 18, a $3.580." },
    { valor: 84_250, retro: "Las de $3.370 ya salieron todas el 12." },
  ], "Así es. Salen primero las últimas que entraron: 25 de las 30 de $3.580."),
  casilla("ueps-saldo-final", UEPS_M, P3, { f: "26 may", bloque: "sal", que: "total" }, [
    { valor: 71_600, retro: "Quedan dos lotes, no uno: 15 del inicio, a $3.100, y 5 del 18, a $3.580." },
    { valor: 62_000, retro: "No todas son del inicio. Quedan 15 de $3.100 y 5 de $3.580." },
  ], "Así es. Quedan dos lotes: 15 del inicio, a $3.100, y 5 del 18, a $3.580."),
  casilla("promedio-costo-6", PROMEDIO, P7(6), { f: "6 may", bloque: "sal", que: "cu" }, [
    { valor: 3_235, retro: "Ese es el punto medio de los dos costos. El promedio pesa las unidades: $196.800 ÷ 60." },
    { valor: 3_370, retro: "Ese es el costo de la compra. El promedio mezcla las 20 del inicio con las 40 nuevas: $196.800 ÷ 60." },
  ], "Así es. Antes de la compra había $62.000, y llegaron $134.800 más. Son 60 unidades: cada una cuesta $3.280."),
  /* «Misma forma, “del 18”». */
  casilla("promedio-costo-18", PROMEDIO, P7(18), { f: "18 may", bloque: "sal", que: "cu" }, [
    { valor: 3_430, retro: "Ese es el punto medio de los dos costos. El promedio pesa las unidades: $156.600 ÷ 45." },
    { valor: 3_350, retro: "Ese promedio trata igual los tres costos. Pesa las unidades que había: $156.600 ÷ 45." },
  ], "Así es. Antes de la compra había $49.200, y llegaron $107.400 más. Son 45 unidades: cada una cuesta $3.480."),
  casilla("promedio-saldo-final", PROMEDIO, P3, { f: "26 may", bloque: "sal", que: "total" }, [
    { valor: 65_600, retro: "Después de la compra del 18, el promedio cambió a $3.480." },
    { valor: 71_600, retro: "Las que quedan valen al promedio, no al costo de la última compra: 20 × $3.480." },
  ], "Así es. Las que quedan valen al último promedio: 20 × $3.480."),
  {
    id: "comparar-metodos", tipo: "metodo", metodo: null, subtema: "Comparar métodos",
    pregunta: "En este ejercicio, ¿con qué método fue mayor el costo de la mercancía vendida en el mes?",
    correcta: UEPS_M,
    distractores: [PEPS, PROMEDIO].map((valor) => ({ valor, retro: "Suma las dos ventas de cada método y compara. La mayor es $239.800." })),
    acierto: "Así es. Los costos subieron en el mes, y con este método salieron primero las más caras.",
  },
];

/* Lo que se vendió en el mes con cada método: los tres totales que se ven después del ítem 10. */
export const VENDIDO_H3 = Object.fromEntries(METODOS_H3.map((m) => [m.id,
  KARDEX_H3[m.id].filas.reduce((s, r) => s + (r.sa ? suma(r.sa) : 0), 0)]));

/* El resumen del cierre, con la frase de H1 y H2: cuántos de los diez al primer toque. */
export const resumenH3 = (bien, total) => `${bien} de ${total} al primer toque.`;
