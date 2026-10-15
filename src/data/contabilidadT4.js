/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 DE APRENDER — «La caja» (Célula D).
 *
 * Fuente: el paquete de Katsumi en la punta de feat/conta-d4-mapa-fuente: la
 * versión 1 (con la paráfrasis de e12ed82 ya dentro: definición de Caja, los
 * siete controles y el resumen), y encima los cambios de la v2 a la v5
 * (manda el más nuevo), y la v4 y la v5. Copia en orquestador/conocimiento/
 * paquetes/d4-t4-a1-v1.md y d4-t4-a1-v2…v5-cambios.md, los mismos blobs. Una prueba compara cada texto de aquí contra ellos.
 *
 *   · v2, cambio 1: pantalla nueva «De la caja del Tema 3 a dos cuentas»,
 *     entre la portada y «Qué es Caja»
 *   · v2, cambio 2: el acierto de la consignación dice «Mira el asiento de
 *     la p. 180»
 *   · v2, cambio 3: el acierto del control que falla dice «una pérdida de
 *     plata», no «un faltante»
 *   · v3, cambio 1: «Qué es Caja» abre remitiendo a A0, y su pie es pp.
 *     178-179
 *   · v4 (auditoría de Shibukawa): la pantalla del puente recuerda el Tema
 *     2; el control 6 y la glosa de la póliza cambian; la glosa de arqueo
 *     sale; el resumen 3 se alinea con la lista
 *   · v5: los errores de las dos preguntas ya no revelan la respuesta, y el
 *     asiento 2 de la consignación sale solo con el acierto
 *
 * Única cifra: $435.000 (p. 180). Aprender: sin FP, sin catálogo y sin
 * llamar al motor.
 *
 * La figura es «El cajón de paso» de Hanayama (v1 con la v1.1 encima):
 * FIGURA_CAJON trae sus rótulos y cada pantalla dice en qué estado la pide
 * (`figura`). En P6 la figura no dibuja la respuesta mientras se pregunta: en
 * «colocando» y en el error se queda en `recibe`; solo el acierto la pasa a
 * `consigna`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t4-a1-la-caja";

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Los textos de interfaz que el
 * paquete no trae. Son los mismos de las piezas de Aprender de T7-3, para que
 * el sitio diga lo mismo en todas partes.
 */
export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };
export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };
/* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El nombre de cada asiento para el lector de pantalla: el libro no les pone fecha. */
export const NOMBRE_ASIENTO = { cobro: "Asiento del cobro", consignacion: "Asiento de la consignación" };

export const DEBE = "debe";
export const HABER = "haber";

/* La cifra de la p. 180. Es de esta pieza y de ninguna otra. */
export const SUS_SERVICIOS = 435_000;

/*
 * ═══════════ LA FIGURA: «EL CAJÓN DE PASO» (Hanayama v1 + v1.1) ═══════════
 *
 * Dentro de la figura no aparece ningún nombre de cuenta salvo Caja (el
 * cajón) y Bancos (su destino): Ingresos por servicios va solo en el asiento
 * (v1.1, cambio 1). Sin «$»: las cifras de figuras y asientos van sin el
 * signo, como en el resto de la materia. «Debe» y «Haber» son los de
 * INTERFAZ.
 *
 * Las glosas y el destino van en dos renglones fijos, cada uno sin partirse
 * (v1.1, cambio 2).
 */
export const FIGURA_CAJON = {
  /* Literales de la p. 180. */
  cuenta: "Caja",
  destino: "Bancos",
  rotuloOrigen: "Sus Servicios Ltda. · durante el día",
  glosaDebe: ["se recibe", "dinero"],
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] v1.1, cambio 1: el hecho, no una cuenta. Lo cierra Katsumi. */
  hecho: "Los clientes pagan de contado",
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] abreviados por Hanayama de «cuando los dineros se consignan o cuando se hacen pagos en efectivo» (p. 180). */
  glosaHaber: ["se consigna", "o se paga"],
  pago: ["Pago", "en efectivo"],
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El texto alternativo, uno por estado (Hanayama v1, §2.5). */
  alt: {
    reglas: "La cuenta Caja. El dinero entra por el Debe cuando se recibe, y sale por el Haber cuando se consigna en Bancos o se paga en efectivo.",
    recibe: "Sus Servicios recibe 435.000 de sus clientes. Entran a Caja por el Debe.",
    consigna: "Los mismos 435.000 salen de Caja por el Haber y entran a Bancos. Nada sale hacia pagos en efectivo.",
  },
};

/*
 * Qué enciende cada estado. `foco` es lo señalado (#F8F9FA 600); un monto
 * presente y sin foco es antecedente (#A8B6C8 500). `vivo` son los trazos del
 * recorrido. «Pago en efectivo» no lleva monto en ningún estado.
 */
export const ESTADOS_CAJON = {
  reglas: { origen: false, debe: false, haber: false, bancos: false, vivo: [], foco: [] },
  recibe: { origen: true, debe: true, haber: false, bancos: false, vivo: ["entrada"], foco: ["origen", "debe"] },
  consigna: { origen: true, debe: true, haber: true, bancos: true, vivo: ["salida", "bancos"], foco: ["haber", "bancos"] },
};

const PIE_180 = "Basado en el libro, p. 180";
const PIE_179_180 = "Basado en el libro, pp. 179-180";

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

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué guarda la cuenta Caja, cuándo va al debe y cuándo al haber, y qué controles la cuidan.",
  boton: BOTON.empezar,
  pie: PIE_179_180,
};

/* P1 · v2, cambio 1: el puente con el Tema 3 (C5). v4, A1-2: es un recordatorio del Tema 2, no algo nuevo. */
const DOS_CUENTAS = {
  id: "dos-cuentas",
  tipo: "lectura",
  parrafos: [
    "En el Tema 3, la caja era la plata de la empresa en general: la que entra con un cobro y la que sale con un pago.",
    "En el Tema 2 ya viste que esa plata va en dos cuentas: Caja, la que está a la mano, y Bancos, la que está en el banco.",
    "Esta pieza mira de cerca la primera, Caja. Bancos tiene su propia pieza más adelante.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 179 y 186, y en los Temas 2 y 3",
};

/*
 * P2 · Qué es Caja. v3, cambio 1: abre remitiendo a A0, y el pie pasa a pp.
 * 178-179. La definición es la paráfrasis de e12ed82. La billetera es una
 * analogía de Katsumi, no del libro.
 */
const QUE_ES_CAJA = {
  id: "que-es-caja",
  tipo: "lectura",
  parrafos: [
    "En «El activo corriente» viste que el efectivo va primero, porque ya es plata. La caja es la parte que la empresa tiene a la mano.",
    "Piensa en la plata que llevas en la billetera. Está ahí, lista para pagar un bus o un almuerzo, sin pasar por el banco.",
    "En una empresa, eso es la cuenta Caja: los billetes, las monedas y los cheques que guarda para pagar lo de todos los días.",
    "Para el libro, es plata disponible de inmediato.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 178-179",
};

/* P3 · Los cheques de la caja. La segunda frase del primer texto es deducción de Katsumi (hueco HD4-2). */
const CHEQUES = {
  id: "cheques",
  tipo: "lectura",
  parrafos: [
    "Aquí el libro dice que la caja también guarda cheques. Son los que la empresa tiene en la mano, por ejemplo uno que le dio un cliente.",
    "Pagar con un cheque propio es otra cosa. Esa plata sale de la cuenta del banco, y por eso mueve Bancos, como viste en el Tema 2.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 179, 180 y 187",
};

/* P4 · La regla. */
const LA_REGLA = {
  id: "la-regla",
  tipo: "lectura",
  parrafos: [
    "Caja es un activo, y por eso sigue la regla que ya conoces. Lo que entra va al debe y lo que sale va al haber.",
    "Caja se debita cuando la empresa recibe dinero.",
    "Caja se acredita cuando sale plata: cuando se consigna en el banco o cuando se paga en efectivo.",
    "Es como tu billetera: sube cuando te pagan, y baja cuando pagas algo o cuando metes la plata en tu cuenta.",
  ],
  figura: { tipo: "cajon", estado: "reglas" },
  boton: BOTON.seguir,
  pie: PIE_180,
};

/* P5 · Sus Servicios cobra: el asiento 1 de la p. 180. */
const COBRA = {
  id: "cobra",
  tipo: "lectura",
  parrafos: [
    "Sus Servicios Ltda. hace mantenimiento de computadoras. Un día atiende a varios clientes por $435.000, y todos le pagan de contado.",
    "Entra plata a la caja, así que Caja se debita por $435.000.",
    "La otra mitad es el ingreso por el servicio que prestó. Ingresos por servicios se acredita por $435.000.",
  ],
  figura: { tipo: "cajon", estado: "recibe" },
  asientos: [ASIENTO_COBRO],
  /* Enlace de Katsumi con «Vender no es cobrar». */
  tras: ["Aquí vender y cobrar pasaron el mismo día. En el Tema 3 viste que no siempre es así."],
  boton: BOTON.seguir,
  pie: PIE_180,
};

/* P6 · La consignación, con su pregunta. El asiento 2 se muestra solo con el acierto (v5). */
const CONSIGNACION = {
  id: "consignacion",
  tipo: "eleccion",
  parrafos: ["Ese mismo día, Sus Servicios consigna los $435.000 en su cuenta corriente."],
  /* Hanayama v1.1, cambio 3: mientras pregunta y en el error, `recibe`; con el acierto, `consigna`. */
  figura: { tipo: "cajon", estados: { colocando: "recibe", error: "recibe", acierto: "consigna" } },
  pregunta: "¿Qué le pasa a Caja con esta consignación?",
  opciones: [
    { id: "se-acredita", texto: "Se acredita por $435.000.", correcta: true },
    /* v5: cada error dice por qué falla sin nombrar la correcta. */
    { id: "no-se-mueve", texto: "No se mueve: la plata sigue siendo de la empresa.", devolucion: "Que siga siendo de la empresa no quiere decir que siga en la caja. La pregunta es dónde está la plata después de consignarla." },
    { id: "se-debita", texto: "Se debita por $435.000: la empresa ahora tiene más plata.", devolucion: "No entró plata nueva: son los mismos $435.000 que la empresa ya tenía. Debitar Caja sería contarlos dos veces." },
  ],
  /* v2, cambio 2 (I5): «Mira el asiento de la p. 180». */
  acierto: { texto: "Así es. La plata salió de la caja y llegó al banco. Mira el asiento de la p. 180: Bancos se debita por $435.000 y Caja se acredita por $435.000.", pie: PIE_180 },
  error: { pie: PIE_180 },
  /* v5: el asiento 2 es la respuesta, así que se muestra solo con el acierto. */
  trasAcertar: { asientos: [ASIENTO_CONSIGNACION] },
  pie: PIE_180,
};

/* P7 · Los siete controles, en el orden del libro y en la paráfrasis de e12ed82. Las dos glosas son de Katsumi. */
const CONTROLES = {
  id: "controles",
  tipo: "lectura",
  parrafos: ["El libro pide cuidar mucho el efectivo, porque con esa plata la empresa trabaja todos los días."],
  /* Numerada, como en el paquete: la pregunta de P8 dice «¿Qué control de la lista…?». */
  listaNumerada: [
    "Anotar cada día cuánto efectivo entró y cuánto salió.",
    "Llevar al banco, cada día, el efectivo que se recibió.",
    "Poner un tope a los pagos que se hacen en efectivo.",
    "Separar a quien recibe el dinero de quien lo registra.",
    "Contar la caja seguido y sin avisar: eso es un arqueo.",
    /* v4, A1-1: la póliza vigila a quienes manejan la plata; no los protege. */
    "Tener una póliza de manejo sobre quienes manejan la plata.",
    "Apartar una caja menor para los pagos pequeños.",
  ],
  /* v4: la glosa de arqueo sale (el control 5 ya lo define); la de póliza cambia (A1-1). */
  despues: [
    "Una póliza de manejo es un seguro de la empresa: la cubre si quien maneja su plata se la roba o se queda con ella.",
    "La caja menor y el arqueo tienen su propia pieza más adelante.",
  ],
  boton: BOTON.seguir,
  pie: PIE_179_180,
};

/* P8 · ¿Qué control falla? El caso de la papelería es construido por Katsumi; no trae cifras. */
const CONTROL_QUE_FALLA = {
  id: "control-que-falla",
  tipo: "eleccion",
  parrafos: ["En una papelería, la misma empleada cobra a los clientes y anota en los libros cuánto entró."],
  pregunta: "¿Qué control de la lista no se cumple?",
  opciones: [
    { id: "separar", texto: "Separar a quien recibe el dinero de quien lo registra.", correcta: true },
    /* v5: cada error apunta al caso sin nombrar el control que falla. */
    { id: "consignar", texto: "Llevar al banco, cada día, el efectivo que se recibió.", devolucion: "Puede que esta papelería tampoco consigne cada día, pero el caso no dice nada de eso. Fíjate en lo que sí cuenta el caso." },
    { id: "maximo", texto: "Poner un tope a los pagos que se hacen en efectivo.", devolucion: "Ese control es sobre lo que la empresa paga, y aquí la empleada está cobrando. Fíjate en quién hace qué." },
  ],
  /* v2, cambio 3 (C5): «una pérdida de plata», nunca «faltante» a secas. */
  acierto: { texto: "Así es. El libro pide separar a quien recibe el dinero de quien lo registra. Si una sola persona hace las dos cosas, un error o una pérdida de plata puede pasar sin que nadie lo vea.", pie: PIE_180 },
  error: { pie: PIE_180 },
  pie: PIE_180,
};

/* P9 · Resumen. Es la última pantalla: no lleva botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* Numerado, como en el paquete. */
  listaNumerada: [
    "Caja es el efectivo y los cheques que la empresa guarda a la mano para pagar lo de todos los días.",
    "Se debita cuando entra dinero, y se acredita cuando se consigna o se paga en efectivo.",
    /* v4, opcional que Katsumi toma. */
    "El efectivo pide controles estrictos. Entre ellos, anotar y consignar cada día, y separar a quien cobra de quien registra.",
  ],
  siguiente: "Siguiente: «El fondo fijo».",
  pie: PIE_179_180,
};

/* `numero` es el de la pieza en el corte de T4 y ordena PIEZAS_T4 en la vista: A0 = 0, A1 = 1. */
export const PIEZA_LA_CAJA = {
  id: A1_ID,
  numero: 1,
  titulo: "La caja",
  pantallas: [PORTADA, DOS_CUENTAS, QUE_ES_CAJA, CHEQUES, LA_REGLA, COBRA, CONSIGNACION, CONTROLES, CONTROL_QUE_FALLA, RESUMEN],
};
