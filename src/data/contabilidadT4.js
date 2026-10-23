/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 DE APRENDER — «La caja» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «El cajón de paso», ahora operable (celula-d/hanayama-
 * a1-rediseno.md), aprobado por Yujiro en su corte de calidad del 15 oct
 * 2026, con su ajuste: el control 7 (caja menor) enciende Bancos, porque el
 * fondo se abre y se repone con cheque de Bancos (pp. 181-184). Textos:
 * Katsumi (celula-d/katsumi-texto-rediseno.md), aprobados tal cual. Copia en
 * el canon: orquestador/conocimiento/paquetes/d4-t4-a1-v7-hilo.md. Una
 * prueba compara cada texto de aquí contra ella, letra por letra.
 *
 * Siete pantallas; en cinco el estudiante opera el cajón: cobra, manda la
 * consignación al lado que cree, saca la plata por cada salida, decide con
 * los cheques y enciende los controles. Pasa la barra B1-B5.
 *
 * Única cifra del libro: 435.000 (p. 180). El saldo «En la caja» es una
 * cuenta, no una cifra nueva. Aprender: sin FP, sin catálogo y sin llamar al
 * motor.
 *
 * Aquí viven también los textos de interfaz comunes a las tres piezas del
 * rediseño (A0, A1 y H1): la palabra del acierto, el texto del error para el
 * lector y las marcas con palabra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t4-a1-la-caja";

/* El botón de avance de A0 y A1 (Katsumi, «Pendientes del #260»). No hay «Intentar de nuevo»: tras un error, las opciones siguen activas. */
/*
 * «empezar», «confirmar», «probarOtra», «correcto» e «incorrecto» son del
 * armazón de antes, que siguen usando A2-A5 de la pila hasta su rediseño.
 */
export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };
export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };

/*
 * UNA SOLA FORMA DE DEVOLUCIÓN en A0, A1 y H1 (Katsumi, decisión 1; corte de
 * Yujiro, ajuste 2). Acierto: ✓, «Correcto.» y el texto. Error: ✗ y el texto,
 * sin palabra visible; «Incorrecto.» va solo para el lector de pantalla.
 */
export const PALABRA = { ok: "Correcto.", error: null };
export const LECTOR_ERROR = "Incorrecto.";

/*
 * Las marcas con palabra de los destinos (canon, enganche.md E3: en blanco y
 * negro se sabe cuál falló). Katsumi, decisión 2.
 */
export const MARCA = { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" };
/* Los tres literales de la marca, y ninguno más, en todo T4 (los íconos Check y X de lucide los pone `Marca`, en comun.jsx): «✓ Correcto», «✗ No va aquí» e «Iba aquí» (prompt maestro §4.2; Katsumi, lote del 16 oct). También en los campos de cifra (H7 fase 2 y H8 etapa 3), en las casillas de A0 y en las opciones y tableros de Aprender. */

/* El nombre de cada asiento para el lector de pantalla: el libro no les pone fecha (Katsumi, «Pendientes del #260»). */
export const NOMBRE_ASIENTO = { cobro: "Asiento del cobro de contado", consignacion: "Asiento de la consignación" };

/* Los tres destinos del cajón. «no-se-mueve» es el id de la bandeja (el mismo que H1 guardó siempre). */
export const DEBE = "debe";
export const HABER = "haber";
export const NO_SE_MUEVE = "no-se-mueve";

/* La cifra de la p. 180. Es de esta pieza y de ninguna otra. */
export const SUS_SERVICIOS = 435_000;

/*
 * ═══════════ LA FIGURA: «EL CAJÓN DE PASO», OPERABLE ═══════════
 *
 * Los rótulos no cambian con el rediseño (Katsumi): «Caja», «Debe», «Haber»,
 * las glosas, «En la caja», «Bancos», «Pago / en efectivo» y la bandeja
 * «Caja no se mueve». Los comparten A1 y H1: es el mismo dibujo con el mismo
 * significado. Las cifras van sin «$».
 */
export const FIGURA_CAJON = {
  cuenta: "Caja",
  glosaDebe: ["se recibe", "dinero"],
  /* abreviados por Hanayama de «cuando los dineros se consignan o cuando se hacen pagos en efectivo» (p. 180). */
  glosaHaber: ["se consigna", "o se paga"],
  bancos: "Bancos",
  /* Lote B, capa 1 (A1 P0): las glosas de las dos cuentas, con las palabras de la definición de antes (Katsumi v2). */
  glosaCaja: ["a la mano, como tu billetera"],
  glosaBancos: ["en el banco"],
  pago: ["Pago", "en efectivo"],
  bandeja: "Caja no se mueve",
  enLaCaja: "En la caja",
  rotuloOrigen: "Sus Servicios Ltda.",
  acciones: { cobrar: "Cobrar", consignar: "Consignar", pagar: "Pagar", otraVez: "Otra vez" },
  /* Para el lector de pantalla (Hanayama; aprobado por Katsumi, «Pendientes del #260»). */
  destino: { [DEBE]: "Al debe de Caja", [HABER]: "Al haber de Caja", [NO_SE_MUEVE]: "Caja no se mueve" },
  alt: "La cuenta Caja como un cajón de paso: la plata entra por el Debe y sale por el Haber hacia Bancos o hacia un pago en efectivo.",
  /* A1 P5 «el-faltante» (Katsumi; Hanayama; Yujiro): lo que se cobró y no llegó al libro, junto al tubo de entrada; la cifra va delante, sin «$». */
  sinAnotar: "sin anotar",
};

const PIE_180 = "Basado en el libro, p. 180";
const PIE_179_180 = "Basado en el libro, pp. 179-180";
const PIE_179_180_SIMULADO = "Basado en el libro, pp. 179-180 · Escenario simulado";

/* A1 P5 «el-faltante»: el escenario simulado de Katsumi. Andrés cobra 435.000 y anota 410.000; 25.000 no llegan al libro. */
export const ANOTADO_A1 = 410_000;
export const SIN_ANOTAR_A1 = SUS_SERVICIOS - ANOTADO_A1;

/* Los dos asientos de la p. 180, sin fecha: el libro pone «xxxx» y la pieza no la muestra. */
export const ASIENTO_COBRO = {
  nombre: NOMBRE_ASIENTO.cobro,
  lineas: [
    { cuenta: "Caja", lado: DEBE, monto: SUS_SERVICIOS },
    { cuenta: "Ingresos por servicios", lado: HABER, monto: SUS_SERVICIOS },
  ],
};
export const ASIENTO_CONSIGNACION = {
  nombre: NOMBRE_ASIENTO.consignacion,
  lineas: [
    { cuenta: "Bancos", lado: DEBE, monto: SUS_SERVICIOS },
    { cuenta: "Caja", lado: HABER, monto: SUS_SERVICIOS },
  ],
};

/*
 * Los siete controles (pp. 179-180, en el orden del libro): en A1 P6, cada uno
 * es un botón con su rótulo (Katsumi) en la parte del cajón que cuida
 * (Hanayama §1.4), y tocarlo enciende esa parte: `luz` lleva el borde
 * blanco; `vivo`, los trazos del recorrido. El 7 va en Bancos (corte de
 * Yujiro). El 4, «Separación», es lo que enciende el acierto de P5.
 */
export const CONTROLES_A1 = [
  { rotulo: "Registro diario", luz: ["cols"], vivo: [] },
  { rotulo: "Consignación", luz: ["bancos"], vivo: ["salida", "bancos"] },
  { rotulo: "Tope de pagos", luz: ["pago"], vivo: ["salida", "pago"] },
  { rotulo: "Separación", luz: ["cols"], vivo: ["entrada"] },
  { rotulo: "Arqueo", luz: ["saldo"], vivo: [] },
  { rotulo: "Póliza", luz: ["cajon"], vivo: [] },
  { rotulo: "Caja menor", luz: ["bancos"], vivo: [] },
];

/* Los dos cheques de P4: uno entra a Caja; el propio sale del banco (bandeja, y Bancos se enciende). */
export const CHEQUES_A1 = [
  {
    id: "recibido", tarjeta: "Un cliente le paga con un cheque", correcta: DEBE,
    acierto: "Ese cheque entró a la caja.",
    errores: { [HABER]: "Aquí la empresa recibe, no paga.", [NO_SE_MUEVE]: "Ese cheque no pasó por el banco." },
  },
  {
    id: "propio", tarjeta: "Sus Servicios paga con un cheque propio", correcta: NO_SE_MUEVE,
    acierto: "Esa plata sale del banco.",
    errores: { [DEBE]: "Aquí la empresa paga, no recibe.", [HABER]: "¿De dónde sale esa plata?" },
  },
];
/* Lo que se ve en la columna y en la bandeja cuando cada cheque llega a su sitio. */
export const CHEQUE_EN_FIGURA = { recibido: "cheque", propio: "cheque propio" };
/* El segundo cheque llega 1,4 s después del acierto del primero (Hanayama §2, P4). */
export const ESPERA_CHEQUE_MS = 1400;

/*
 * Las siete pantallas (Hanayama §2, textos de Katsumi). `tipo` dice qué hace
 * el cajón en cada una. `pregunta`: «Seguir» no aparece hasta el acierto (en
 * los cheques, hasta el acierto del segundo): regla D7 del canon.
 */
export const PANTALLAS_A1 = [
  {
    /*
     * Hilo de Katsumi (23 oct 2026, orquestador/revisiones/t4-slides/hilo-katsumi.md):
     * la pantalla 1 es la decisión de predicción y absorbe a «dos-cuentas» (sus
     * glosas de Caja y Bancos y el puente al Tema 2). La tarjeta del cobro va a
     * debe, haber o «no se mueve», y el asiento sale con el acierto.
     */
    id: "cobra", tipo: "cobra", figura: "cajon", pregunta: true,
    glosasCuenta: true,
    antes: [
      "En el Tema 2 la plata ya iba en dos cuentas.",
      "Sus Servicios arregla computadores, y hoy los clientes le pagan de contado.",
      "¿Por dónde entra esa plata a Caja?",
    ],
    correcta: DEBE,
    acierto: "",
    errores: { [HABER]: "Aquí la empresa recibe, no paga.", [NO_SE_MUEVE]: "Le pagan de contado: esa plata no pasó por el banco." },
    asiento: ASIENTO_COBRO,
    pie: "Basado en el libro, pp. 179-180, y en el Tema 2",
  },
  {
    id: "consigna", tipo: "consigna", figura: "cajon", pregunta: true,
    antes: ["Ese día, la plata va al banco. ¿Qué le pasa a Caja?"],
    tarjeta: "Consigna en su cuenta corriente",
    correcta: HABER,
    acierto: "",
    errores: { [DEBE]: "No entró plata nueva: son los mismos $435.000.", [NO_SE_MUEVE]: "Sigue siendo suya, pero ¿sigue en la caja?" },
    /* El asiento 2 sale solo con el acierto (A1 v5): es la respuesta. */
    asiento: ASIENTO_CONSIGNACION,
    pie: PIE_180,
  },
  {
    id: "dos-salidas", tipo: "salidas", figura: "cajon",
    antes: ["El libro lleva esa plata al banco. Supón que también pudieras pagar con ella. Prueba las dos."],
    pie: PIE_180,
  },
  {
    id: "cheques", tipo: "cheques", figura: "cajon", pregunta: true,
    antes: ["Para el libro, la caja también guarda cheques. Manda cada uno a su sitio."],
    pie: "Basado en el libro, pp. 179, 180 y 187",
  },
  {
    /*
     * P5 «el-faltante» (Katsumi; Hanayama; Yujiro partió la P5 de antes en
     * dos): el caso y tres tarjetas apiladas. El cajón va sin salidas ni
     * glosas. Con el acierto, la pastilla «Correcto» en la tarjeta (sin
     * mensaje, decisión de Yujiro) y se enciende lo que cuida la separación,
     * el control 4: el tubo de entrada y las columnas.
     */
    id: "el-faltante", tipo: "faltante", figura: "cajon", pregunta: true,
    antes: ["Andrés cobra y anota. ¿Qué control faltó?"],
    opciones: ["separar", "arqueo", "poliza"],
    correcta: "separar",
    tarjetas: { separar: "Separar funciones", arqueo: "Arqueo sorpresa", poliza: "Póliza de manejo" },
    control: 4,
    errores: {
      arqueo: "Al contar, caja y libro cuadran: lo no anotado no se ve.",
      poliza: "La póliza paga el robo, pero no lo impide.",
    },
    pie: PIE_179_180_SIMULADO,
  },
  {
    /* P6 «controles»: el cajón entero, sin el caso; cada control enciende lo que cuida; con los siete, la frase de cierre. */
    id: "controles", tipo: "controles", figura: "cajon",
    antes: ["Toca cada control: se enciende lo que vigila."],
    cierre: "Cada control tapa una fuga distinta.",
    siguiente: "Siguiente: «El fondo fijo».",
    pie: PIE_179_180,
  },
];

/*
 * D8 · el caso B (Katsumi, lote nocturno): Taller Ríos Ltda., que arregla
 * motos; cobra 612.000 y, en «el-faltante», Lucía anota 584.000 (28.000 sin
 * anotar). La misma decisión en cada pantalla; los pies llevan además
 * « · Cifras construidas».
 */
export const COBRO_A1_B = 612_000;
export const ANOTADO_A1_B = 584_000;
export const CHEQUES_A1_B = CHEQUES_A1.map((c) => (c.id === "propio" ? { ...c, tarjeta: "Taller Ríos paga con un cheque propio" } : c));
/* Lo que el cajón muestra en cada caso. */
export const DATOS_A1 = {
  1: { cobro: SUS_SERVICIOS, anotado: ANOTADO_A1, rotuloOrigen: FIGURA_CAJON.rotuloOrigen, cheques: CHEQUES_A1 },
  2: { cobro: COBRO_A1_B, anotado: ANOTADO_A1_B, rotuloOrigen: "Taller Ríos Ltda.", cheques: CHEQUES_A1_B },
};
/* El pie del caso B: el mismo, más « · Cifras construidas» (si no lo lleva ya). */
export const pieCasoB = (pie) => (pie.includes("Cifras construidas") ? pie : `${pie} · Cifras construidas`);
/* Donde el pie largo hacía pasar la pantalla de 60 palabras (sonda), el corto de Katsumi: «Cifras construidas, p. N». */
export const pieCortoB = (pie) => pie.replace(/ · Cifras construidas$/, "").replace(/^Basado en el libro, /, "Cifras construidas, ");
const conMonto = (a, monto) => ({ ...a, lineas: a.lineas.map((l) => ({ ...l, monto })) });
const PANTALLAS_A1_B = PANTALLAS_A1.map((p) => {
  const b = { ...p, pie: pieCasoB(p.pie) };
  if (p.id === "cobra") Object.assign(b, { antes: [p.antes[0], "Taller Ríos arregla motos, y hoy los clientes le pagan de contado.", p.antes[2]], asiento: conMonto(ASIENTO_COBRO, COBRO_A1_B) });
  if (p.id === "consigna") Object.assign(b, { errores: { ...p.errores, [DEBE]: "No entró plata nueva: son los mismos $612.000." }, asiento: conMonto(ASIENTO_CONSIGNACION, COBRO_A1_B) });
  if (p.id === "el-faltante") b.antes = ["Lucía cobra y anota. ¿Qué control faltó?"];
  return b;
});

/* D8: el pie corto del caso B donde el largo pasaba de 60 palabras (sonda; Katsumi). */
for (const p of PANTALLAS_A1_B) if (["consigna", "cheques"].includes(p.id)) p.pie = pieCortoB(p.pie);
/* `numero` es el de la pieza en el corte de T4 y ordena PIEZAS_T4 en la vista: A0 = 0, A1 = 1. */
export const PIEZA_LA_CAJA = {
  id: A1_ID,
  numero: 1,
  titulo: "La caja",
  /* D2 (Shibukawa; Yujiro): el objetivo de la pieza, una línea fija bajo el título en la P0 (Katsumi). */
  objetivo: "Decidir qué mueve Caja y cómo cuidarla.",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A1,
};
PIEZA_LA_CAJA.casoB = { ...PIEZA_LA_CAJA, pantallas: PANTALLAS_A1_B };
