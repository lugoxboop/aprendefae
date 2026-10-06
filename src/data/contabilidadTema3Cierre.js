/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · LA ÚLTIMA PIEZA DE APRENDER — «Cerrar el periodo».
 *
 * El texto final de Gen, palabra por palabra, con las correcciones de Levi
 * encima (mandan sobre la P2 de Xeno):
 *   · la zona de lo que no se vacía muestra las cinco cuentas reales de San
 *     Calixto con sus saldos, que no cambian nunca, y un solo rótulo;
 *   · el pie general suma la p. 147 (la del diagrama) y el paso 2 no lleva
 *     pie suelto.
 *
 * La pieza termina en el segmento 7 y el cierre: la parada de Gen es una
 * nota de trabajo y no se muestra. Los $3.950 se quedan en Ganancias y
 * pérdidas.
 *
 * El enero de esta pieza es el mismo de «Lo que ya pasó y no se ha pagado»:
 * el gasto de la máquina ($2.500, p. 140) ya está anotado. Si se toca en una,
 * se toca en la otra (Gen).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INGRESO = "ingreso";
export const GASTO = "gasto";

/* Zona A: las seis cuentas que se vacían, en el orden de Gen. */
export const CUENTAS_DEL_PERIODO = [
  { cuenta: "Ingresos por servicios", saldo: 14800, tipo: INGRESO },
  { cuenta: "Gasto arriendos", saldo: 2000, tipo: GASTO },
  { cuenta: "Gasto salarios", saldo: 5100, tipo: GASTO },
  { cuenta: "Gasto materiales de consumo", saldo: 500, tipo: GASTO },
  { cuenta: "Gasto servicios públicos", saldo: 750, tipo: GASTO },
  { cuenta: "Gasto alquiler", saldo: 2500, tipo: GASTO },
];
export const TOTAL_INGRESOS = 14800;
export const TOTAL_GASTOS = 10850;
export const QUEDA = 3950;

/* Zona C (Levi): las cinco que no se vacían. Sus saldos no cambian en ningún paso. */
export const CUENTAS_QUE_SIGUEN = [
  { cuenta: "Caja", saldo: 14650 },
  { cuenta: "Cuentas por cobrar – clientes", saldo: 6800 },
  { cuenta: "Equipo de computación", saldo: 5000 },
  { cuenta: "Alquiler por pagar", saldo: 2500 },
  { cuenta: "Aportes sociales", saldo: 20000 },
];

/* ═══════════ TEXTOS DE LA ESCENA (Xeno, con las correcciones de Levi) ═══════════ */
export const EMPRESA_CIERRE = "San Calixto";
export const ROTULO_ZONA_A = "Ingresos y gastos";
export const SE_VACIAN = "Se vacían";
export const NO_SE_VACIAN = "No se vacían";
export const GANANCIAS_Y_PERDIDAS = "Ganancias y pérdidas";
export const QUEDA_TEXTO = (monto) => `Queda ${monto}`;
export const PASTILLA_CIERRE = "Cierre de enero";
export const DIAGRAMA_AJUSTES = "Ajustes";
export const DIAGRAMA_CIERRE = "Cierre";
export const GASTO_DE_LA_MAQUINA = "Gasto de la máquina";
export const PIE_CIERRE = "Basado en el libro, pp. 121-128, 140 y 147";

/* ═══════════ CAPA 2: SIETE SEGMENTOS Y EL CIERRE (Gen) ═══════════ */
export const SEGMENTOS_CIERRE = [
  "Estas son las cuentas de San Calixto al final de enero, cada una con su saldo.",
  "Antes de cerrar hay que ajustar. El diagrama del libro lo pone en ese orden. Por eso el gasto de la máquina ya está anotado.",
  "Empieza el cierre. Los ingresos se vacían en Ganancias y pérdidas y quedan en cero.",
  "El asiento anota $14.800 en el debe de los ingresos y $14.800 en el haber de Ganancias y pérdidas.",
  "Ahora los gastos. Los cinco se vacían en Ganancias y pérdidas y también quedan en cero.",
  "El asiento anota $10.850 en el debe de Ganancias y pérdidas. Reparte $10.850 entre los cinco gastos.",
  "Mira lo que quedó en Ganancias y pérdidas: $3.950. Es lo que dejó el mes antes del impuesto.",
];
export const CIERRE_TEXTO = "Las cuentas de ingresos y gastos quedaron en cero. Febrero empieza limpio y lo de enero quedó junto en Ganancias y pérdidas.";

/* Los alternativos de Gen: segmento 3, segmento 7 y el cierre (paso 8). */
export const ALTERNATIVOS_CIERRE = {
  3: "Ejemplo: la cuenta de ingresos pasa de $14.800 a cero. Ese valor aparece en Ganancias y pérdidas.",
  7: "Ejemplo: en Ganancias y pérdidas quedan $3.950, que es lo que dejó el mes antes del impuesto.",
  8: "Ejemplo: las seis cuentas de ingresos y gastos quedan en cero. Ganancias y pérdidas guarda $3.950.",
};

/* ═══════════ CAPA 3 ═══════════ */
export const CONSIGNA_CAPA_3_CIERRE = "Toca cada cuenta y mira cómo pasa de su saldo a cero.";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas) ═══════════ */
export const PIEZA_CERRAR_EL_PERIODO = {
  id: "t3-a5-cerrar-el-periodo",
  /*
   * La última de Aprender: va después de «Lo que ya se pagó y no ha pasado»
   * (Levi). El número solo ordena; el rótulo «Pieza n de N» sale de la
   * posición.
   */
  numero: 5,
  titulo: "Cerrar el periodo",
  objetivo: "Al cerrar el periodo, las cuentas de ingresos y gastos quedan en cero. Lo que dejan es el resultado.",
  nombres: [
    {
      termino: "Cuentas del periodo",
      definicion: "Las cuentas de ingresos y de gastos solo cuentan lo del periodo. Por eso al final vuelven a cero.",
      /* La nota de Gen, una sola vez, con el rótulo de la pieza 3. */
      delLibro: "El libro a veces dice renta; es lo mismo que ingreso.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Cerrar",
      definicion: "Cerrar una cuenta es dejarla en cero pasando su saldo a otra parte.",
      /* «Así lo dice el libro» (p. 123). */
      delLibro: "«Cerrar una cuenta significa reducir su saldo a cero. Cuando se cierran los ingresos y los gastos, realmente lo que hacemos es enfrentar los ingresos con los gastos para determinar la utilidad o la pérdida» (p. 123).",
    },
    { termino: "Ganancias y pérdidas", definicion: "Ganancias y pérdidas es la cuenta donde se juntan los ingresos y los gastos del periodo." },
    /* «Lo que se planta», con el rótulo de las piezas anteriores. */
    { termino: "Desde ya", definicion: "Las cuentas de lo que la empresa tiene y debe no se cierran. Esas siguen de un periodo al otro." },
  ],
};

/* ═══════════ CAPA 4 ═══════════ */
export const PREGUNTA_FINAL_CIERRE = "Elige la frase que mejor dice para qué se cierran las cuentas.";
export const OPCIONES_FINAL_CIERRE = [
  {
    id: "resultado",
    texto: "Para dejar en cero lo del periodo y guardar aparte el resultado.",
    correcta: true,
    feedback: "Correcto. Las cuentas de ingresos y gastos cuentan un solo periodo, así que el siguiente arranca en cero.",
  },
  {
    id: "borrar",
    texto: "Para borrar los movimientos que salieron mal durante el mes.",
    correcta: false,
    feedback: "No. Cerrar no borra nada: los movimientos quedan anotados. Lo que hace es juntarlos para ver el resultado.",
  },
  {
    id: "sin-gastos",
    texto: "Para que la empresa deje de tener gastos el mes siguiente.",
    correcta: false,
    feedback: "No. La empresa va a seguir gastando. Lo que arranca en cero es la cuenta, no el gasto.",
  },
  {
    id: "todas",
    texto: "Para pasar todas las cuentas de la empresa a cero.",
    correcta: false,
    feedback: "Solo las de ingresos y gastos. Las de lo que la empresa tiene y debe siguen con su saldo al mes siguiente.",
  },
];
