import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H4 DE HACER — «Cierra el mes» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 3, las dos con PASA de Mello (tanda
 * corregida). Manda la más nueva: la consigna ya no dice «Arrastra cada cifra
 * a su casilla» sino «Toca una cifra y después la casilla donde va», y hay un
 * solo intento por casilla y por línea. Copias en
 * orquestador/conocimiento/paquetes/t7-1-h4-v1.md y t7-1-h4-cambios.md; una
 * prueba compara cada texto de aquí contra ellas.
 *
 * Hacer Difícil, evaluativa, 50 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Va al catálogo del servidor (migración 0094,
 * que corre Mateo).
 *
 * CATORCE ACIERTOS POSIBLES, uno por unidad: las doce casillas de la tabla
 * (3 métodos × 4 filas) y las dos líneas del cierre con el promedio. Las
 * casillas se califican UNA vez, al confirmar; las líneas, una vez, al
 * comprobar (patrón v3.2). Sin arrastre: las cifras son fijas.
 *
 * LAS CIFRAS no se escriben a mano: salen de las capas, las ventas y los
 * gastos (CAPAS_H4, VENDIDAS_H4, VENTAS_H4, GASTOS_H4) con los tres métodos
 * (calcularH4). Una prueba las recalcula con un cálculo propio y las compara
 * con las de Near. La actividad se detiene en la utilidad antes de impuestos:
 * no nombra el impuesto de renta (retención por el 33 %).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H4_ID = "t7-1-cierra-el-mes";

export const CAPAS_H4 = [
  { id: "inicio", unidades: 2_000, costo: 880 },
  { id: "compra-1", unidades: 3_000, costo: 950 },
  { id: "compra-2", unidades: 2_500, costo: 1_030 },
];
export const VENDIDAS_H4 = 6_000;
export const VENTAS_H4 = 7_800_000;
export const GASTOS_H4 = 1_150_000;

/*
 * Los tres métodos, en periódico: el inventario final son las unidades que
 * quedan según el conteo, valoradas con el método; el costo de la mercancía
 * vendida es lo disponible menos ese final (la fórmula de A4).
 */
export function calcularH4(capas = CAPAS_H4, vendidas = VENDIDAS_H4, ventas = VENTAS_H4, gastos = GASTOS_H4) {
  const unidades = capas.reduce((s, c) => s + c.unidades, 0);
  const disponible = capas.reduce((s, c) => s + c.unidades * c.costo, 0);
  const compras = capas.slice(1).reduce((s, c) => s + c.unidades * c.costo, 0);
  const inicial = capas[0].unidades * capas[0].costo;
  const quedan = unidades - vendidas;
  const valorar = (orden) => {
    let falta = quedan;
    let valor = 0;
    for (const c of orden) {
      const toma = Math.min(falta, c.unidades);
      valor += toma * c.costo;
      falta -= toma;
    }
    return valor;
  };
  const promedio = disponible / unidades;
  const metodo = (final) => {
    const cmv = disponible - final;
    const bruta = ventas - cmv;
    return { final, cmv, bruta, operacional: bruta - gastos };
  };
  const puntoMedio = (capas[0].costo + capas.at(-1).costo) / 2;
  return {
    unidades, disponible, compras, inicial, quedan, promedio, puntoMedio,
    peps: metodo(valorar([...capas].reverse())),
    ueps: metodo(valorar(capas)),
    promedioPonderado: metodo(quedan * promedio),
  };
}

export const CIFRAS_H4 = calcularH4();
const C = CIFRAS_H4;
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const H4 = {
  id: H4_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Hacer el cierre de un mes en el sistema periódico y hallar el costo de lo vendido.",
  nombre: "Cierra el mes",
  /* La v1: «Etiqueta». */
  etiqueta: "Cierra el mes · Inventarios I",
  entrada: "Ferretería La Roca usa el sistema de inventario periódico. Estos son sus datos de junio.",
  consigna: [
    /* Corrección 3: tocar en vez de arrastrar. */
    "Cierra el mes con los tres métodos. Toca una cifra y después la casilla donde va. Sobran tres cifras.",
    "Tienes un solo intento. Cada casilla se califica una vez, al confirmar.",
  ],
  recordatorio: "Para el costo de la mercancía vendida, se suman el inventario inicial y las compras, y se resta el final.",
  pie: "Basado en el libro, pp. 207-208, 214-227",
};

/* La ficha de valoración (regla 10, periódico), fila por fila como la tabla de la v1. */
export const FICHA_H4 = [
  ["Quién", "Ferretería La Roca (nombre inventado)"],
  ["Qué tenía al inicio", `${miles(CAPAS_H4[0].unidades)} unidades a $${miles(CAPAS_H4[0].costo)}`],
  ["Qué compró", `${miles(CAPAS_H4[1].unidades)} unidades a $${miles(CAPAS_H4[1].costo)}, y después ${miles(CAPAS_H4[2].unidades)} unidades a $${miles(CAPAS_H4[2].costo)}`],
  ["Qué vendió", `${miles(VENDIDAS_H4)} unidades, por $${miles(VENTAS_H4)}`],
  ["Gastos de administración y ventas del mes", `$${miles(GASTOS_H4)}`],
  ["Qué quedó según el conteo físico", `${miles(C.quedan)} unidades`],
];

/* Las tres columnas y las cuatro filas de la tabla. */
export const METODOS_H4 = [
  { id: "peps", nombre: "PEPS", cifras: C.peps },
  { id: "ueps", nombre: "UEPS (no válido bajo NIIF)", cifras: C.ueps },
  { id: "promedio", nombre: "Promedio ponderado", cifras: C.promedioPonderado },
];

export const FILAS_H4 = [
  { id: "final", nombre: "Inventario final", retro: "El inventario final es lo que queda: 1.500 unidades, con el precio que da el método de esa columna." },
  /* La fila del costo usa la fórmula de A4: el mismo recordatorio que está en pantalla. */
  { id: "cmv", nombre: "Costo de mercancía vendida", retro: H4.recordatorio },
  { id: "bruta", nombre: "Utilidad bruta en ventas", retro: "La utilidad bruta en ventas es lo que queda de las ventas cuando se les resta el costo de la mercancía vendida." },
  { id: "operacional", nombre: "Utilidad operacional", retro: "A la utilidad bruta se le restan los gastos de administración y ventas. Lo que queda es la utilidad operacional." },
];

/* Los tres distractores del banco, cada uno con la confusión que ataca. */
export const DISTRACTORES_H4 = [
  { valor: C.disponible, retro: "Ese es el costo de la mercancía disponible. Falta restarle el inventario final." },
  { valor: C.compras, retro: "Esas son solo las compras. Falta sumar el inventario inicial y restar el final." },
  { valor: C.quedan * C.puntoMedio, retro: "Ese valor usa el punto medio entre $880 y $1.030. El promedio ponderado divide el costo de todo entre todas las unidades." },
];

/* Después de confirmar: la fila que sale, su texto, y el cierre de la parte 1, que siempre se ve. */
export const UTILIDAD_ANTES_H4 = {
  nombre: "Utilidad antes de impuestos",
  texto: "Aquí no hay otros ingresos ni otros gastos. Por eso la utilidad antes de impuestos es igual a la operacional.",
};
export const CIERRE_PARTE1_H4 = "Con PEPS, el inventario final es el más alto. Por eso su costo es el más bajo y su utilidad, la más alta.";

/* Parte 2 · el cierre con el promedio: las dos líneas de Inventario de mercancías. */
export const PARTE2_H4 = {
  consigna: "Ahora, el cierre con el promedio ponderado. Toca Debe o Haber en cada línea de Inventario de mercancías.",
  lineas: [
    { id: "quitar-inicial", cuenta: "Quitar el inventario inicial", valor: C.inicial, lado: HABER, retro: "Quitar el inventario inicial hace que el activo baje: va al haber." },
    { id: "colocar-final", cuenta: "Colocar el inventario final", valor: C.promedioPonderado.final, lado: DEBE, retro: "Colocar el inventario final hace que el activo suba: va al debe." },
  ],
};

/* Convención de A7 («Confirmar») y de H1-H3 («Siguiente ítem», «Ver mi resumen»). */
export const BOTON_H4 = { confirmar: "Confirmar", siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const resumenH4 = (bien, total) => `${bien} de ${total} al primer toque.`;
