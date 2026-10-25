import { NEUTRO, NAVY_DEL_CHIP } from "./contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 1 DE APRENDER — «Vender no es cobrar».
 *
 * Fuentes, las únicas: el texto de Gen (tal cual), la especificación P2 de
 * Xeno y las correcciones de Levi, que mandan sobre las dos:
 *   · el gasto de la máquina es $2.500
 *   · orden cronológico de San Calixto: aporte → servicio → factura a JCC →
 *     máquina, en la capa 2 y en la capa 3; la tarjeta del aporte dice
 *     «Balance de iniciación, 2 de enero»
 *   · los montos de las marcas anteriores van en #A8B6C8 (texto), nunca en
 *     #B8C4D4; los botones desactivados, texto #A8B6C8 y borde #8C9BB0
 *
 * Aquí solo hay datos. Lo que se enseña en cada paso lo calcula
 * contabilidad/dosLineas.js a partir del número de paso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ COLORES (Xeno, con las correcciones de Levi) ═══════════ */
export const COLOR = {
  blanco: "#FFFFFF",
  /* Marcas anteriores, carril en reposo, banda, foco, chips. Nunca color de texto. */
  neutro: NEUTRO, // #B8C4D4
  /* Texto secundario: nombres de contador, «Paso n de 6», fuentes, montos anteriores, botón desactivado. */
  apagado: "#A8B6C8",
  /* Carril quieto, ranuras, bordes. */
  quieto: "#8C9BB0",
  navy: NAVY_DEL_CHIP, // #1D3557
};

/* ═══════════ LAS DOS LÍNEAS ═══════════ */
export const RESULTADOS = "resultados";
export const CAJA = "caja";

export const ROTULO_PISTA = {
  [RESULTADOS]: "Ingresos y gastos",
  [CAJA]: "Caja: entra y sale plata",
};

/*
 * Las cuatro marcas: forma = qué pista (cuadrado: ingresos y gastos; círculo:
 * caja), relleno = sentido (lleno suma, vacío resta), tallo = dirección.
 */
export const MARCAS = {
  ingreso: { pista: RESULTADOS, forma: "cuadrado", llena: true, arriba: true, nombre: "Ingresos" },
  gasto: { pista: RESULTADOS, forma: "cuadrado", llena: false, arriba: false, nombre: "Gastos" },
  entrada: { pista: CAJA, forma: "circulo", llena: true, arriba: true, nombre: "Entró" },
  salida: { pista: CAJA, forma: "circulo", llena: false, arriba: false, nombre: "Salió" },
};
export const CONTADORES = {
  [RESULTADOS]: ["ingreso", "gasto"],
  [CAJA]: ["entrada", "salida"],
};

/* ═══════════ LAS EMPRESAS Y SUS HECHOS ═══════════ */

/* San Calixto, en orden cronológico (Levi). Los textos son los de Gen. */
export const SAN_CALIXTO = {
  id: "san-calixto",
  nombre: "San Calixto",
  hechos: [
    {
      id: "aporte",
      titulo: "Los socios aportan $15.000 en plata y un equipo de $5.000",
      fecha: "Balance de iniciación, 2 de enero",
      fuente: "Libro, p. 121",
      marcas: [{ tipo: "entrada", monto: 15000 }],
      texto: "Los socios abrieron la empresa con 15.000 en plata y un equipo de 5.000. La caja solo subió 15.000, y no hubo ningún ingreso: nadie compró nada.",
    },
    {
      id: "servicio",
      titulo: "Recibió $5.000 por servicios prestados, 5 de enero",
      fecha: null,
      fuente: "Libro, p. 121",
      marcas: [{ tipo: "ingreso", monto: 5000 }, { tipo: "entrada", monto: 5000 }],
      texto: "San Calixto prestó un servicio y le pagaron el mismo día. Se mueven las dos líneas.",
    },
    {
      id: "factura",
      titulo: "Factura de $4.000 a JCC, 12 de enero",
      fecha: null,
      fuente: "Libro, p. 121",
      marcas: [{ tipo: "ingreso", monto: 4000 }],
      texto: "Le mandó la factura a JCC por un servicio ya prestado. Hay ingreso, pero no ha entrado plata. Solo se mueve la de arriba.",
    },
    {
      id: "maquina",
      titulo: "Máquina alquilada del 27 al 31, sin pagar",
      fecha: null,
      fuente: "Libro, p. 140",
      /* Levi: el gasto de la máquina es $2.500. */
      marcas: [{ tipo: "gasto", monto: 2500 }],
      texto: "San Calixto usó una máquina alquilada cinco días y todavía no la ha pagado. Hay gasto, pero no ha salido plata. Solo se mueve la de arriba.",
    },
  ],
};

export const COMPANIA_CUALQUIERA = {
  id: "compania-cualquiera",
  nombre: "Compañía Cualquiera",
  hechos: [
    {
      id: "inventario",
      titulo: "Compra inventario por $100.000 y lo paga de contado",
      fecha: null,
      fuente: "Libro, pp. 129-130",
      marcas: [{ tipo: "salida", monto: 100000 }],
      texto: "Compró mercancía y la pagó el mismo día. Salió plata, pero todavía no la ha consumido. No hay gasto.",
    },
    {
      id: "computador",
      titulo: "Vende un computador por $15.000 de contado, a su mismo valor",
      fecha: null,
      fuente: "Libro, pp. 129-130",
      marcas: [{ tipo: "entrada", monto: 15000 }],
      texto: "No vende computadores: entregó uno y recibió su mismo valor en plata. El patrimonio no cambió.",
    },
  ],
};

/* ═══════════ CAPA 2: LOS SEIS PASOS ═══════════ */

export const TEXTO_PASO_1 = "Mira las dos líneas. Arriba van los ingresos y los gastos. Abajo, la plata que entra y sale de la caja.";
export const CIERRE = "Las dos líneas no van pegadas. Por eso contar la plata de la caja no te dice cuánto vendió la empresa.";
export const ENLACE_TEMA_1 = "En el Tema 1 viste que todo empieza con un hecho. Aquí ves que el hecho y la plata pueden ir en fechas distintas.";

/*
 * Textos alternativos, uno por paso, en el orden de Levi y textuales de su
 * tabla. El del paso 6 es el texto del cierre de Gen que Xeno pidió usar.
 */
export const ALTERNATIVOS = [
  "Dos líneas. Arriba, ingresos y gastos. Abajo, la caja.",
  "Ejemplo: los socios ponen $15.000 en plata y un equipo de $5.000. La línea de caja sube $15.000 y la de ingresos y gastos queda quieta.",
  "Ejemplo: San Calixto presta un servicio y le pagan el mismo día. Las dos líneas se mueven.",
  "Ejemplo: San Calixto manda una factura de $4.000 a JCC. La línea de arriba se mueve y la de abajo queda quieta.",
  "Ejemplo: San Calixto usa una máquina alquilada cinco días y aún no la paga. La línea de arriba marca un gasto de $2.500 y la caja queda quieta.",
  "Dos líneas. Arriba, ingresos y gastos. Abajo, la caja. No siempre se mueven juntas.",
];

/* ═══════════ CAPA 3 ═══════════ */
export const CONSIGNA_CAPA_3 = "Toca cada hecho y mira qué línea se mueve.";
export const AVISO_CAMBIO = "Cambia la empresa, así que las dos líneas vuelven a cero.";
export const BOTON_OTRA_EMPRESA = "Seguir con otra empresa";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas) ═══════════ */

export const PIEZA_VENDER_NO_ES_COBRAR = {
  id: "t3-a1-vender-no-es-cobrar",
  titulo: "Vender no es cobrar",
  objetivo: "Distingue un ingreso de la plata que entra a la caja.",
  /* Como en el Tema 1: el término y la frase de Gen completa. */
  nombres: [
    { termino: "Ingreso", definicion: "Ingreso es el valor de lo que la empresa vende de su negocio: sus productos o sus servicios." },
    { termino: "Cobro", definicion: "Cobro es la plata que entra a la caja." },
    { termino: "Gasto", definicion: "Gasto es lo que la empresa consume para poder vender." },
    { termino: "Pago", definicion: "Pago es la plata que sale de la caja." },
    { termino: "Utilidad", definicion: "Utilidad es lo que queda después de restarle los gastos a los ingresos." },
    /* «Desde ya»: el rótulo con que la pieza del Tema 2 planta su idea. */
    { termino: "Desde ya", definicion: "Son cuatro cosas distintas. A veces pasan juntas y a veces no." },
  ],
};

/* ═══════════ CAPA 4: EN UNA FRASE ═══════════ */
export const PREGUNTA_FINAL = "Elige la frase que mejor dice qué es un ingreso.";
export const OPCIONES_FINAL = [
  {
    id: "vende",
    texto: "El valor de lo que la empresa vende, haya entrado la plata o no.",
    correcta: true,
    feedback: "Correcto. El ingreso se cuenta cuando la empresa presta el servicio, no cuando le pagan. Por eso la factura a JCC ya es un ingreso.",
  },
  {
    id: "caja",
    texto: "Toda la plata que entra a la caja de la empresa.",
    correcta: false,
    feedback: "No. Un aporte de los socios entra a la caja y no es un ingreso: nadie compró nada.",
  },
  {
    id: "utilidad",
    texto: "Lo que queda después de restar los gastos.",
    correcta: false,
    feedback: "Eso se llama utilidad, y sale de una resta. El ingreso es lo que entra por vender, antes de restar los gastos.",
  },
  {
    id: "aporte",
    texto: "Lo que los dueños ponen para que la empresa arranque.",
    correcta: false,
    feedback: "No. Eso es un aporte. El libro lo dice claro (p. 119): los aportes nunca son un ingreso, aunque suban el patrimonio.",
  },
];
