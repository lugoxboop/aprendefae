/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 4 DE APRENDER — «Lo que ya se pagó y no ha pasado».
 *
 * El reverso de la pieza 3: aquí la caja se mueve primero y la línea de
 * arriba después. Lo nuevo es el BLOQUE del anticipo, tres fichas de $5.000
 * —una por mes— que se van consumiendo en cada cierre.
 *
 * Todo el texto es de Gen, textual, con sus correcciones aplicadas encima
 * («por anticipado» en todas partes, y el cierre reescrito). Las
 * cuentas son las de Levi, y el nombre de la cuenta del bloque es idéntico al
 * del asiento: esa igualdad es la relación visible entre los dos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MESES = ["Junio", "Julio", "Agosto"];
export const POR_MES = 5000;
export const ANTICIPO = 15000;

export const SAN_CALIXTO_P4 = {
  id: "san-calixto",
  nombre: "San Calixto",
  /* Pagó el anticipo: sale plata de la caja el 1 de junio. */
  marcaCaja: "salida",
  /* Cada cierre causa un gasto. */
  marcaCierre: "gasto",
  bloque: { cuenta: "Arriendos pagados por anticipado", etiqueta: "Por gastar", ficha: "llena" },
  asiento: {
    debe: { cuenta: "Gastos arriendos", monto: POR_MES },
    haber: { cuenta: "Arriendos pagados por anticipado", monto: POR_MES },
  },
};

export const ARRIENDOS_DE_LA_COSTA = {
  id: "arriendos-de-la-costa",
  nombre: "Arriendos de la Costa",
  /* Recibió el anticipo: entra plata a la caja el 1 de junio. */
  marcaCaja: "entrada",
  /* Cada cierre causa un ingreso. */
  marcaCierre: "ingreso",
  bloque: { cuenta: "Arriendos recibidos por anticipado", etiqueta: "Por cumplir", ficha: "contorno" },
  asiento: {
    debe: { cuenta: "Arriendos recibidos por anticipado", monto: POR_MES },
    haber: { cuenta: "Ingresos por arriendos", monto: POR_MES },
  },
};

export const EMPRESAS_P4 = [SAN_CALIXTO_P4, ARRIENDOS_DE_LA_COSTA];

/* ═══════════ TEXTOS DE LA ESCENA (Xeno) ═══════════ */
export const ROTULO_CIERRE = "Cierre";
export const ROTULO_DIFERIDO = "Diferido";
export const CIERRE_DE = (mes) => `Cierre de ${mes.toLowerCase()}`;

/* ═══════════ CAPA 2: NUEVE SEGMENTOS Y EL CIERRE ═══════════ */
export const SEGMENTOS_P4 = [
  "Vuelven las dos líneas. Arriba, ingresos y gastos. Abajo, la caja.",
  "El primero de junio San Calixto paga $15.000 por tres meses de arriendo. Solo se mueve la caja.",
  "Mira: la línea de arriba sigue quieta. Todavía no ha usado el local ni un día.",
  "Esos $15.000 son algo que la empresa tiene: tres meses de local pagados por anticipado.",
  "Llega el cierre de junio. Se gastó un mes, así que del bloque se consumen $5.000.",
  "El asiento anota $5.000 de gasto y saca $5.000 del bloque. El debe lleva el gasto y el haber lo pagado por anticipado.",
  "Quedan $10.000 en el bloque. Son julio y agosto, que todavía no se han usado.",
  "Ahora Arriendos de la Costa, que fue quien recibió la plata. Para ella es algo que todavía debe cumplir.",
  "Su asiento saca $5.000 de lo recibido por anticipado. Anota $5.000 de ingreso. El debe lleva lo recibido y el haber el ingreso.",
];
export const CIERRE_P4 = "Un solo pago, dos empresas. Para San Calixto es un gasto que se va causando mes a mes; para Arriendos de la Costa, un ingreso que se va causando igual.";

/* Los alternativos de Gen: pasos 4, 5 y 7. */
export const ALTERNATIVOS_P4 = {
  4: "Ejemplo: aparece un bloque de $15.000. Son tres meses de local pagados por anticipado.",
  5: "Ejemplo: llega el corte del cierre de junio y del bloque de $15.000 se consumen $5.000.",
  7: "Ejemplo: en el bloque quedan $10.000, que son los meses de julio y agosto.",
};

/* ═══════════ CAPA 3 ═══════════ */
export const CONSIGNA_CAPA_3_P4 = "Toca cada mes y mira cuánto queda en el bloque.";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas) ═══════════ */
export const PIEZA_LO_QUE_YA_SE_PAGO = {
  id: "t3-a4-lo-que-ya-se-pago",
  numero: 4,
  titulo: "Lo que ya se pagó y no ha pasado",
  objetivo: "Aquí la plata se mueve primero. El hecho viene después, mes a mes.",
  nombres: [
    { termino: "Diferido", definicion: "Diferido es cuando la plata se mueve antes de que el hecho ocurra." },
    { termino: "Pagado por anticipado", definicion: "Lo que la empresa pagó por anticipado es algo que todavía tiene. Lo va gastando con el tiempo." },
    {
      termino: "Recibido por anticipado",
      definicion: "Lo que la empresa recibió por anticipado es algo que todavía debe. Lo va cumpliendo con el tiempo.",
      /* Las dos citas del libro, con el rótulo que Gen escribió, como en la pieza 3. */
      delLibro: "«Los gastos diferidos son activos que, en la medida va pasando el tiempo, se van convirtiendo en gastos» (p. 142). «Los ingresos diferidos son pasivos que, en la medida que va pasando el tiempo, se van convirtiendo en ingresos» (p. 145).",
    },
    /* «Lo que se planta», con el rótulo de las piezas 1 y 3. */
    { termino: "Desde ya", definicion: "En la pieza anterior la plata iba atrás. Aquí va adelante." },
  ],
};

/* ═══════════ CAPA 4 ═══════════ */
export const PREGUNTA_FINAL_P4 = "Elige la frase que mejor dice qué es un pago por anticipado.";
export const OPCIONES_FINAL_P4 = [
  {
    id: "tiene",
    texto: "Algo que la empresa todavía tiene y va a ir gastando.",
    correcta: true,
    feedback: "Correcto. San Calixto pagó tres meses y al cierre de junio solo había usado uno. Los otros dos todavía los tiene.",
  },
  {
    id: "gasto-del-mes",
    texto: "Un gasto del mes en que se pagó la plata.",
    correcta: false,
    feedback: "No. Si fuera gasto de junio, los tres meses irían a junio. Solo se gasta el mes que ya se usó.",
  },
  {
    id: "deuda",
    texto: "Una deuda con el que recibió la plata.",
    correcta: false,
    feedback: "Al revés. San Calixto pagó: nadie le debe plata. Lo que tiene es derecho a dos meses más de local.",
  },
  {
    id: "fin-de-anio",
    texto: "Un gasto que se anota entero al final del año.",
    correcta: false,
    feedback: "No. Cada cierre de mes toma su parte. Esperar al final del año dejaría los meses de en medio incompletos.",
  },
];
