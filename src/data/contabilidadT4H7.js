/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H7 DE HACER — «Concilia la cuenta» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h7-v1.md (serie 1, Los
 * Cerezos) y d4-t4-h7-h8-serie2.md (serie 2, El Mirador), sin archivos de
 * cambios. Copias en orquestador/conocimiento/paquetes/, los mismos blobs
 * que en la punta de feat/conta-d4-mapa-fuente. Una prueba compara cada
 * texto de aquí contra ellos, letra por letra.
 *
 * Hacer · evaluativa · difícil · 50 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0206, que corre Erwin.
 *
 * CADA INTENTO SORTEA SU SERIE, por su cuenta (decisión de Yujiro): H7 no
 * comparte nada con H8, ni estado ni sorteo. Dos fases:
 *   1 · las nueve partidas de la serie, barajadas: cada una a uno de cuatro
 *       destinos (Banco o Libros, suma o resta). Un toque
 *   2 · la tabla con las nueve partidas EN SU LADO CORRECTO (Hanayama v1.1,
 *       decisión de Yujiro con Shibukawa: un fallo de la fase 1 no se cobra
 *       dos veces) y los dos saldos conciliados, escritos
 *
 * Las cifras: los dos saldos de partida y las nueve partidas son datos
 * construidos de Katsumi; TODO LO DEMÁS SE CALCULA: los totales, los dos
 * saldos conciliados y las seis cifras de error. Una prueba comprueba que
 * los textos y las tablas del paquete dicen lo mismo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H7_ID = "t4-concilia-la-cuenta";

export const H7 = {
  id: H7_ID,
  nombre: "Concilia la cuenta",
  objetivo: "Llevar el saldo del banco y el de los libros al mismo valor, sumando o restando cada partida en su lado.",
  consigna: [
    "Cada tarjeta es una partida de la conciliación. Ponla en su lado, el del banco o el de los libros, y decide si suma o resta.",
    "Cuando estén todas, la tabla te muestra cada partida en su lado. Súmalas: si la cuenta está bien, los dos saldos darán lo mismo.",
  ],
};

export const SUBTEMAS_H7 = ["Cheque sin cobrar", "Consignación en tránsito", "Nota crédito del banco", "Nota débito del banco", "Saldo conciliado"];

/* Los cuatro destinos, en el orden de Hanayama (2×2: banco arriba, libros abajo; «suma» antes de «resta»). */
export const BANCO_SUMA = "banco-suma";
export const BANCO_RESTA = "banco-resta";
export const LIBROS_SUMA = "libros-suma";
export const LIBROS_RESTA = "libros-resta";
export const DESTINOS_H7 = [
  { id: BANCO_SUMA, nombre: "Banco: suma", renglones: ["Banco", "suma"], lado: "banco", signo: 1 },
  { id: BANCO_RESTA, nombre: "Banco: resta", renglones: ["Banco", "resta"], lado: "banco", signo: -1 },
  { id: LIBROS_SUMA, nombre: "Libros: suma", renglones: ["Libros", "suma"], lado: "libros", signo: 1 },
  { id: LIBROS_RESTA, nombre: "Libros: resta", renglones: ["Libros", "resta"], lado: "libros", signo: -1 },
];
export const nombreDeDestinoH7 = (id) => DESTINOS_H7.find((d) => d.id === id)?.nombre ?? null;
const destino = (id) => DESTINOS_H7.find((d) => d.id === id);

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el
 * paquete no trae, con la forma de los de H1-H6: los botones, el resumen, lo
 * que oye el lector de pantalla en el error, los rótulos de la tabla y de
 * los dos campos, el aviso de los campos vacíos (gris, no gasta el
 * intento, como el de H3 y H5), y el pie de la devolución de la fase 1 (el
 * paquete da «presentación de la p. 190» como fuente de cada respuesta).
 */
export const BOTON_H7 = { siguiente: "Siguiente partida", aLosSaldos: "Ir a los saldos", comprobar: "Comprobar los saldos", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const INCORRECTO = "Incorrecto.";
export const resumenH7 = (bien) => `${bien} de 9 partidas al primer toque.`;
export const lectorErrorH7 = (destinoCorrecto) => `Incorrecto. La respuesta es ${destinoCorrecto}.`;
export const TABLA_H7 = {
  banco: "El banco · extracto",
  libros: "Los libros",
  inicialBanco: ["Saldo del", "extracto"],
  inicialLibros: ["Saldo de", "los libros"],
  mas: "Más",
  menos: "Menos",
  conciliado: "Saldo conciliado",
  par: { banco: "el banco", libros: "los libros", igual: "=" },
  campoBanco: "Saldo conciliado del banco",
  campoLibros: "Saldo conciliado de los libros",
  lectorPar: (b, l) => `El banco: ${b}. Los libros: ${l}.`,
  lectorIguales: "Son iguales.",
};
export const FALTAN_SALDOS = "Escribe los dos saldos antes de comprobar.";
/* La página de cada devolución de la fase 1: el paquete da «presentación de la p. 190» como fuente de cada respuesta. */
export const PAGINA_H7 = "Basado en el libro, p. 190";

/* ═══════════ LAS DOS SERIES ═══════════ */

/*
 * Los textos que se repiten en las nueve partidas dependen solo del tipo:
 * los tres errores de cada tipo y el acierto de las notas. El acierto de los
 * cheques nombra a la persona. Una prueba compara cada partida del paquete,
 * texto por texto, con lo que sale de aquí.
 */
const ERRORES = {
  cheque: {
    [BANCO_SUMA]: "Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir.",
    [LIBROS_RESTA]: "Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces.",
    [LIBROS_SUMA]: "Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar.",
  },
  consignacion: {
    [BANCO_RESTA]: "Restarla del banco sería decir que esa plata va a salir. Pero la empresa la llevó al banco: va a entrar.",
    [LIBROS_SUMA]: "Los libros ya la sumaron el día que se consignó. Sumarla otra vez sería contarla dos veces.",
    [LIBROS_RESTA]: "Los libros ya tienen esta consignación, y restarla la borraría. La plata sí se consignó.",
  },
  credito: {
    [LIBROS_RESTA]: "Restar sería decir que la empresa perdió esa plata. Una nota crédito del banco hace lo contrario.",
    [BANCO_SUMA]: "El banco ya tiene esta nota: fue él quien la hizo. Sumarla en su lado sería contarla dos veces.",
    [BANCO_RESTA]: "El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.",
  },
  debito: {
    [LIBROS_SUMA]: "Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario.",
    [BANCO_RESTA]: "El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces.",
    [BANCO_SUMA]: "El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.",
  },
};
const RESPUESTA = { cheque: BANCO_RESTA, consignacion: BANCO_SUMA, credito: LIBROS_SUMA, debito: LIBROS_RESTA };
const SUBTEMA = { cheque: SUBTEMAS_H7[0], consignacion: SUBTEMAS_H7[1], credito: SUBTEMAS_H7[2], debito: SUBTEMAS_H7[3] };
const ACIERTO = {
  consignacion: "Así es. La empresa ya la anotó, y el banco la va a abonar. Esa plata va a entrar: se le suma al saldo del banco.",
  credito: "Así es. Es una nota crédito del banco: el banco ya sumó esa plata y los libros todavía no. Se le suma al saldo de los libros.",
  debito: "Así es. Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros.",
};
const aciertoCheque = (persona) => `Así es. La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando ${persona} lo cobre, va a salir: se le resta al saldo del banco.`;

/*
 * Una partida: tipo, monto, el texto de la tarjeta y los renglones fijos de
 * su rótulo en la tabla de la fase 2 (Hanayama v1.2: el título del paquete,
 * sin el prefijo de tipo; no se abrevia). La persona del cheque va en su
 * acierto.
 */
const partida = (serie, n, tipo, monto, texto, rotulo, persona = null) => ({
  id: `${serie}-${n}`, tipo, monto, texto, rotulo,
  subtema: SUBTEMA[tipo],
  respuesta: RESPUESTA[tipo],
  acierto: tipo === "cheque" ? aciertoCheque(persona) : ACIERTO[tipo],
  errores: ERRORES[tipo],
  pagina: PAGINA_H7,
});

/* Las cifras con el formato del libro, con «$». */
export const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/*
 * Una serie: los datos de partida, las nueve partidas y lo que se calcula.
 * Los mensajes de la fase 2 nombran cifras: se arman con ellas. `diaConsignacion`
 * es el «del 30» / «del 31» del mensaje de la consignación.
 */
function serie({ id, empresa, razonSocial, fecha, extracto, libros, diaConsignacion, partidas }) {
  const suma = (t) => partidas.filter((p) => p.tipo === t).reduce((s, p) => s + p.monto, 0);
  const totales = { cheques: suma("cheque"), consignacion: suma("consignacion"), credito: suma("credito"), debito: suma("debito") };
  const conciliadoBanco = extracto + totales.consignacion - totales.cheques;
  const conciliadoLibros = libros + totales.credito - totales.debito;
  /* Las seis cifras de error, cada una con su razón (Katsumi). */
  const erroresBanco = [
    { cifra: extracto - totales.consignacion + totales.cheques, texto: "Ese saldo resta lo que va a entrar y suma lo que va a salir. Revisa los dos tipos de partida del banco." },
    { cifra: extracto + totales.consignacion, texto: "A ese saldo le faltan los cheques que nadie ha cobrado. Esa plata ya está comprometida." },
    { cifra: extracto - totales.cheques, texto: `A ese saldo le falta la consignación ${diaConsignacion}. Esa plata ya es de la empresa.` },
  ];
  const erroresLibros = [
    { cifra: libros - totales.credito + totales.debito, texto: "Ese saldo resta lo que el banco abonó y suma lo que el banco cobró. Revisa qué hace cada nota." },
    { cifra: libros + totales.credito, texto: "A ese saldo le faltan las notas débito del banco: la plata que el banco ya cobró." },
    { cifra: libros - totales.debito, texto: "A ese saldo le faltan las notas crédito del banco: la plata que el banco ya abonó." },
  ];
  return {
    id, empresa, razonSocial, fecha, extracto, libros, partidas, totales, conciliadoBanco, conciliadoLibros,
    erroresBanco, erroresLibros,
    datos: [
      `Es el ${fecha}. La empresa ${empresa} va a comparar su cuenta con la del banco.`,
      `Saldo según el extracto: ${pesos(extracto)}. Saldo según los libros: ${pesos(libros)}.`,
    ],
    cierre: `El saldo del banco y el de los libros dan ${pesos(conciliadoBanco)}. Ese es el saldo verdadero de la cuenta de ${razonSocial}.`,
  };
}

export const SERIE_1 = serie({
  id: "s1", empresa: "Los Cerezos", razonSocial: "Comercializadora Los Cerezos", fecha: "30 de septiembre",
  extracto: 1_874_300, libros: 2_484_800, diaConsignacion: "del 30",
  partidas: [
    partida("s1", 1, "cheque", 184_500, "La empresa le giró un cheque de $184.500 a Andrés Pardo. Todavía no lo ha cobrado.", ["Cheque a", "Andrés Pardo"], "Andrés Pardo"),
    partida("s1", 2, "cheque", 92_700, "La empresa le giró un cheque de $92.700 a Lucía Ortiz. Todavía no lo ha cobrado.", ["Cheque a", "Lucía Ortiz"], "Lucía Ortiz"),
    partida("s1", 3, "cheque", 310_400, "La empresa le giró un cheque de $310.400 a Mario Sánchez. Todavía no lo ha cobrado.", ["Cheque a", "Mario Sánchez"], "Mario Sánchez"),
    partida("s1", 4, "consignacion", 1_265_000, "El 30 de septiembre, la empresa consignó $1.265.000. El banco la abona al día siguiente.", ["Consignación", "del 30"]),
    partida("s1", 5, "credito", 528_000, "El cliente Gloria Ruiz pagó una factura consignando directo en el banco: $528.000. La empresa todavía no lo ha anotado.", ["Pago del cliente", "Gloria Ruiz"]),
    partida("s1", 6, "credito", 61_200, "El banco abonó los intereses de una inversión de la empresa: $61.200. La empresa todavía no lo ha anotado.", ["Intereses", "de la inversión"]),
    partida("s1", 7, "debito", 38_900, "El banco cobró una chequera: $38.900. La empresa todavía no lo ha anotado.", ["Chequera"]),
    partida("s1", 8, "debito", 127_400, "El banco le cobró a la empresa los intereses de un sobregiro: $127.400. La empresa todavía no lo ha anotado.", ["Intereses", "de sobregiro"]),
    partida("s1", 9, "debito", 356_000, "El banco devolvió un cheque con el que el cliente Pedro Silva había pagado: $356.000. La empresa todavía no lo ha anotado.", ["Cheque devuelto", "de Pedro Silva"]),
  ],
});

export const SERIE_2 = serie({
  id: "s2", empresa: "El Mirador", razonSocial: "Distribuidora El Mirador", fecha: "31 de octubre",
  extracto: 3_216_800, libros: 3_090_900, diaConsignacion: "del 31",
  partidas: [
    partida("s2", 1, "cheque", 265_300, "La empresa le giró un cheque de $265.300 a Carolina Méndez. Todavía no lo ha cobrado.", ["Cheque a", "Carolina Méndez"], "Carolina Méndez"),
    partida("s2", 2, "cheque", 118_900, "La empresa le giró un cheque de $118.900 a Felipe Rojas. Todavía no lo ha cobrado.", ["Cheque a", "Felipe Rojas"], "Felipe Rojas"),
    partida("s2", 3, "cheque", 402_600, "La empresa le giró un cheque de $402.600 a Natalia Vega. Todavía no lo ha cobrado.", ["Cheque a", "Natalia Vega"], "Natalia Vega"),
    partida("s2", 4, "consignacion", 947_500, "El 31 de octubre, la empresa consignó $947.500. El banco la abona al día siguiente.", ["Consignación", "del 31"]),
    partida("s2", 5, "credito", 713_400, "El cliente Tomás Acosta le pagó a la empresa una factura: consignó la plata directo en el banco. Fueron $713.400. La empresa todavía no lo ha anotado.", ["Pago del cliente", "Tomás Acosta"]),
    partida("s2", 6, "credito", 84_700, "El banco abonó los intereses de una inversión de la empresa: $84.700. La empresa todavía no lo ha anotado.", ["Intereses", "de la inversión"]),
    partida("s2", 7, "debito", 46_200, "El banco cobró una chequera: $46.200. La empresa todavía no lo ha anotado.", ["Chequera"]),
    partida("s2", 8, "debito", 173_800, "El banco le cobró a la empresa los intereses de un sobregiro: $173.800. La empresa todavía no lo ha anotado.", ["Intereses", "de sobregiro"]),
    partida("s2", 9, "debito", 291_500, "El banco devolvió un cheque con el que el cliente Sofía Cárdenas había pagado: $291.500. La empresa todavía no lo ha anotado.", ["Cheque devuelto", "de Sofía Cárdenas"]),
  ],
});

export const SERIES_H7 = [SERIE_1, SERIE_2];
export const PIE_DATOS_H7 = "Cifras construidas. Formato del libro, p. 190";
export const PIE_CIERRE_H7 = "Formato y signos del libro, p. 190. Cifras construidas";

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H7) ═══════════ */

export const PASOS_H7 = [
  "Pon cada partida en su lado, el del banco o el de los libros, y decide si suma o resta.",
  "Cuando estén todas, escribe los dos saldos.",
  "Si los dos saldos dan lo mismo, la conciliación está bien.",
];
export const ALT_H7 = "El banco ya restó la comisión, y los libros todavía no. La partida va a «Libros: resta».";
/*
 * La partida construida del paquete (no es de ninguna serie). Solo demuestra
 * el primer gesto: la mano TOCA «Libros: resta» (los destinos son de un
 * toque, Hanayama H7 v1 §1). [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]
 * El paquete trae la partida y el texto alternativo; el acierto de la demo
 * es ese texto alternativo.
 */
export const EJEMPLO_H7 = {
  id: "demo", tipo: "debito", monto: 12_000, subtema: SUBTEMAS_H7[3], respuesta: LIBROS_RESTA, pagina: PAGINA_H7,
  texto: "Una nota débito del banco por $12.000, por la comisión de manejo de la cuenta.",
  rotulo: ["Comisión"], acierto: ALT_H7, errores: ERRORES.debito,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Cada intento sortea UNA serie y baraja sus nueve partidas. No guarda nada. */
export function sortearH7(elegir, barajar) {
  const s = elegir(SERIES_H7);
  return { serie: s, partidas: barajar(s.partidas) };
}

/* Fase 1: con acierto, «Correcto.» y su texto; con error, el de ese destino (no nombra el correcto). */
export function evaluarPartidaH7(item, elegido) {
  const ok = elegido === item.respuesta;
  return { ok, correcta: item.respuesta, textos: ok ? [CORRECTO, item.acierto] : [item.errores[elegido]] };
}

/*
 * Fase 2: la tabla, con cada partida EN SU LADO CORRECTO, en el orden de la
 * serie (no en el de la fase 1). Lo elegido en la fase 1 no entra: por eso
 * esta función no lo recibe.
 */
export function tablaH7(s) {
  const lado = (l, signo) => s.partidas.filter((p) => destino(p.respuesta).lado === l && destino(p.respuesta).signo === signo);
  return {
    banco: { inicial: s.extracto, mas: lado("banco", 1), menos: lado("banco", -1) },
    libros: { inicial: s.libros, mas: lado("libros", 1), menos: lado("libros", -1) },
  };
}

/* Lee lo que se escribe: «2.551.700», «2551700», «$ 2.551.700». Vacío o sin dígitos → null. */
export const leerSaldo = (t) => { const d = String(t ?? "").replace(/\D/g, ""); return d ? Number(d) : null; };

/*
 * Fase 2: el mensaje según lo que se escriba, en el orden del paquete:
 *   1 · los dos dan el saldo conciliado → acierto
 *   2 · los dos dan lo mismo, pero otra cifra
 *   3 · la primera cifra de error reconocida (banco primero, luego libros)
 *   4 · cualquier otro saldo
 * Cada campo se marca bien o mal por separado.
 */
export const MENSAJES_SALDOS = {
  acierto: "Así es. Los dos saldos dan lo mismo. Nadie se equivocó: a cada lado le faltaba anotar algo.",
  igualesOtraCifra: "Los dos lados coinciden entre sí, pero la cuenta no es la del ejercicio. Revisa las sumas.",
  otro: "Los dos saldos tienen que dar lo mismo. Mira en la tabla qué suma y qué resta en cada lado, y vuelve a hacer la cuenta.",
};
export function evaluarSaldosH7(s, banco, libros) {
  const bien = { banco: banco === s.conciliadoBanco, libros: libros === s.conciliadoLibros };
  if (bien.banco && bien.libros) return { ok: true, bien, texto: MENSAJES_SALDOS.acierto };
  if (banco === libros) return { ok: false, bien, texto: MENSAJES_SALDOS.igualesOtraCifra };
  const reconocido = (!bien.banco && s.erroresBanco.find((e) => e.cifra === banco)) || (!bien.libros && s.erroresLibros.find((e) => e.cifra === libros));
  return { ok: false, bien, texto: reconocido ? reconocido.texto : MENSAJES_SALDOS.otro };
}

/*
 * Evaluativa: las nueve partidas y los dos saldos, once puntos. El motor
 * escala los 50 FP con este porcentaje.
 */
export const puntuarH7 = (partidasBien, saldosBien) => ((partidasBien + saldosBien) / 11) * 100;

/* Para el panel docente: el ítem se lee por su partida, o es uno de los dos saldos. */
export function partidaDeItemH7(id) {
  if (id === "saldo-banco") return TABLA_H7.campoBanco;
  if (id === "saldo-libros") return TABLA_H7.campoLibros;
  return SERIES_H7.flatMap((s) => s.partidas).find((p) => p.id === id)?.texto ?? null;
}
