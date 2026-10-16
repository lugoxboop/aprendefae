/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H7 DE HACER — «Concilia la cuenta» (Célula D), con H6 DENTRO.
 * REDISEÑO DE ENGANCHE: las libretas y el par.
 *
 * Diseño: Hanayama (celula-d/hanayama-h7-rediseno.md). Textos: Katsumi
 * (celula-d/katsumi-texto-hacer.md), aprobados por Yujiro el 15 oct 2026.
 * Copia en el canon: orquestador/conocimiento/paquetes/d4-t4-h7-v2-
 * rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * H6 «¿Quién se enteró primero?» se FUNDE aquí (corte de Yujiro): elegir la
 * libreta ES responder «¿quién todavía no la tiene?», y elegir Más o Menos es
 * la mitad de H7. Las dos cosas van en un solo toque sobre una de las cuatro
 * secciones. Las ocho partidas de H6 salen: sus cuatro tipos ya están aquí.
 *
 * Hacer · evaluativa · difícil · 50 FP. Su fila del servidor es la migración
 * 0206 y NO cambia: mismo activity_id y mismos ítems (s1-1…s1-9,
 * s2-1…s2-9, saldo-banco, saldo-libros).
 *
 * Cada intento sortea UNA serie y baraja sus nueve partidas.
 *   · fase 1: cada partida va a «El banco» o «Los libros», al Más o al Menos.
 *     Un toque. Con el error, la partida se escribe donde iba a los 0,7 s: la
 *     conciliación queda completa para la fase 2
 *   · fase 2: los dos saldos conciliados, escritos; el par cuenta hasta lo
 *     escrito, y el «=» sale solo si los dos son el saldo verdadero
 *
 * Las partidas son también las de H8 (el mismo texto; el monto va aparte).
 *
 * CAMBIO DE CIFRAS EN LA SERIE 1 (Katsumi, decisión 15): el cheque a Mario
 * Sánchez pasa de 310.400 a 310.500 y el extracto de 1.874.300 a 1.874.400.
 * Con las viejas, el mayor de H8 llegaba a 2.551.700 por otro camino, con
 * siete decisiones malas. El saldo conciliado no cambia.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { pesos } from "./contabilidadT4Hacer.js";

export const H7_ID = "t4-concilia-la-cuenta";

export const H7 = {
  id: H7_ID,
  nombre: "Concilia la cuenta",
  objetivo: "Conciliar llevando cada partida al lado correcto.",
  consigna: "Manda cada partida a la libreta que todavía no la tiene, al Más o al Menos.",
};

export const SUBTEMAS_H7 = { cheque: "Cheque sin cobrar", consignacion: "Consignación en tránsito", nc: "Nota crédito del banco", nd: "Nota débito del banco", saldos: "Saldo conciliado" };

/* Las cuatro secciones de las dos libretas: `libreta:signo`. */
export const BANCO_MAS = "banco:mas";
export const BANCO_MENOS = "banco:menos";
export const LIBROS_MAS = "libros:mas";
export const LIBROS_MENOS = "libros:menos";
export const SECCIONES_H7 = [BANCO_MAS, BANCO_MENOS, LIBROS_MAS, LIBROS_MENOS];
export const VA_A = { cheque: BANCO_MENOS, consignacion: BANCO_MAS, nc: LIBROS_MAS, nd: LIBROS_MENOS };

/* Interfaz (Katsumi). */
export const ROTULOS_H7 = {
  banco: "El banco", bancoSub: "extracto", libros: "Los libros", librosSub: "de la empresa", mas: "Más", menos: "Menos",
  parBanco: "el banco", parLibros: "los libros", campoBanco: "Saldo conciliado del banco", campoLibros: "Saldo conciliado de los libros",
};
/* El contador dice «Paso n de 10» (un solo caso: §4.3 del prompt maestro), así que el botón de avance es «Siguiente paso», también hacia los saldos. */
export const BOTON_H7 = { siguiente: "Siguiente paso", aLosSaldos: "Siguiente paso", comprobar: "Comprobar", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const PIE_FASE1_H7 = "Basado en el libro, p. 190. Cifras construidas";
export const PIE_FASE2_H7 = "Formato y signos del libro, p. 190. Cifras construidas";
export const resumenH7 = (bien) => `${bien} de 9 partidas al primer toque.`;
export const lectorParH7 = (x, y) => `El banco: ${x}. Los libros: ${y}.${x === y ? " Son iguales." : ""}`;
export const FALTAN_SALDOS = "Escribe los dos saldos antes de comprobar.";
export const ALT_FIGURA_H7 = "Arriba, el saldo del banco y el de los libros. Debajo, las dos libretas, cada una con su Más y su Menos, donde va cada partida.";

/* La devolución de la fase 1, por tipo de partida; el error, por la sección elegida. */
export const ACIERTO_H7 = {
  cheque: "La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando lo cobren, va a salir: se le resta al saldo del banco.",
  consignacion: "La empresa ya la anotó, y el banco la va a abonar. Esa plata va a entrar: se le suma al saldo del banco.",
  nc: "Es una nota crédito del banco: el banco ya sumó esa plata y los libros todavía no. Se le suma al saldo de los libros.",
  nd: "Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros.",
};
export const ERRORES_H7 = {
  cheque: {
    [BANCO_MAS]: "Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir.",
    [LIBROS_MENOS]: "Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces.",
    [LIBROS_MAS]: "Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar.",
  },
  consignacion: {
    [BANCO_MENOS]: "Restarla del banco sería decir que esa plata va a salir. Pero la empresa la llevó al banco: va a entrar.",
    [LIBROS_MAS]: "Los libros ya la sumaron el día que se consignó. Sumarla otra vez sería contarla dos veces.",
    [LIBROS_MENOS]: "Los libros ya tienen esta consignación, y restarla la borraría. La plata sí se consignó.",
  },
  nc: {
    [LIBROS_MENOS]: "Restar sería decir que la empresa perdió esa plata. Una nota crédito del banco hace lo contrario.",
    [BANCO_MAS]: "El banco ya tiene esta nota: fue él quien la hizo. Sumarla en su lado sería contarla dos veces.",
    [BANCO_MENOS]: "El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.",
  },
  nd: {
    [LIBROS_MAS]: "Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario.",
    [BANCO_MENOS]: "El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces.",
    [BANCO_MAS]: "El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.",
  },
};

/* ═══════════ LAS DOS SERIES ═══════════ */

/*
 * Las nueve partidas de una serie, en el orden de Katsumi (p1…p9): tres
 * cheques, una consignación, dos notas crédito y tres débito. El texto no
 * lleva el monto (va en la tarjeta) ni «La empresa todavía no lo ha anotado»
 * (respondía la decisión de H6: Katsumi, decisión 12).
 */
function partidas(serie, fecha, cheques, consignacion, cliente, intereses, chequera, sobregiro, devuelto) {
  const gir = (n, e) => `La empresa le giró un cheque a ${n}, y ${e} todavía no lo ha cobrado.`;
  const P = [
    { n: 1, tipo: "cheque", monto: cheques[0][1], quien: cheques[0][0], texto: gir(cheques[0][0], cheques[0][2]) },
    { n: 2, tipo: "cheque", monto: cheques[1][1], quien: cheques[1][0], texto: gir(cheques[1][0], cheques[1][2]) },
    { n: 3, tipo: "cheque", monto: cheques[2][1], quien: cheques[2][0], texto: gir(cheques[2][0], cheques[2][2]) },
    { n: 4, tipo: "consignacion", monto: consignacion, texto: `El ${fecha}, la empresa hizo una consignación. El banco la abona al día siguiente.` },
    { n: 5, tipo: "nc", monto: cliente[1], quien: cliente[0], texto: `${cliente[2]} ${cliente[0]} pagó su factura: consignó la plata directo en el banco.` },
    { n: 6, tipo: "nc", monto: intereses, texto: "El banco abonó en la cuenta los intereses de una inversión de la empresa." },
    { n: 7, tipo: "nd", monto: chequera, texto: "El banco le cobró a la empresa una chequera." },
    { n: 8, tipo: "nd", monto: sobregiro, texto: "El banco le cobró a la empresa los intereses de un sobregiro." },
    { n: 9, tipo: "nd", monto: devuelto[1], quien: devuelto[0], texto: `El banco devolvió el cheque con el que ${devuelto[2]} ${devuelto[0]} había pagado.` },
  ];
  return P.map((p) => ({ ...p, id: `${serie}-${p.n}`, va: VA_A[p.tipo], subtema: SUBTEMAS_H7[p.tipo], acierto: ACIERTO_H7[p.tipo], errores: ERRORES_H7[p.tipo], pagina: PIE_FASE1_H7 }));
}

/*
 * Una serie: los datos de partida, las nueve partidas y lo que SE CALCULA:
 * los totales, los dos saldos conciliados y las seis cifras de error de la
 * fase 2, cada una con su razón (Katsumi).
 */
function serie({ id, razonSocial, fecha, extracto, libros, partidas: P }) {
  const t = (k) => P.filter((p) => p.tipo === k).reduce((s, p) => s + p.monto, 0);
  const totales = { cheques: t("cheque"), consignacion: t("consignacion"), nc: t("nc"), nd: t("nd") };
  const conciliadoBanco = extracto + totales.consignacion - totales.cheques;
  const conciliadoLibros = libros + totales.nc - totales.nd;
  const dia = fecha.split(" ")[0];
  return {
    id, razonSocial, fecha, extracto, libros, partidas: P, totales, conciliadoBanco, conciliadoLibros,
    erroresBanco: [
      { cifra: extracto - totales.consignacion + totales.cheques, texto: "Ese saldo resta lo que va a entrar y suma lo que va a salir. Mira cada partida del banco." },
      { cifra: extracto + totales.consignacion, texto: "A ese saldo le faltan los cheques que nadie ha cobrado. Esa plata ya está comprometida." },
      { cifra: extracto - totales.cheques, texto: `A ese saldo le falta la consignación del ${dia}. Esa plata ya es de la empresa.` },
    ],
    erroresLibros: [
      { cifra: libros - totales.nc + totales.nd, texto: "Ese saldo resta lo que el banco abonó y suma lo que el banco cobró. Mira qué hace cada nota." },
      { cifra: libros + totales.nc, texto: "A ese saldo le faltan las notas débito del banco: la plata que el banco ya cobró." },
      { cifra: libros - totales.nd, texto: "A ese saldo le faltan las notas crédito del banco: la plata que el banco ya abonó." },
    ],
    cierre: `El saldo del banco y el de los libros dan ${pesos(conciliadoBanco)}. Ese es el saldo verdadero de la cuenta de ${razonSocial.replace(" Ltda.", "")}.`,
  };
}

/* Serie 1 · Comercializadora Los Cerezos Ltda., 30 de septiembre. Cifras construidas (con el cambio de Katsumi). */
export const SERIE_1 = serie({
  id: "s1", razonSocial: "Comercializadora Los Cerezos Ltda.", fecha: "30 de septiembre", extracto: 1_874_400, libros: 2_484_800,
  partidas: partidas("s1", "30 de septiembre", [["Andrés Pardo", 184_500, "él"], ["Lucía Ortiz", 92_700, "ella"], ["Mario Sánchez", 310_500, "él"]],
    1_265_000, ["Gloria Ruiz", 528_000, "La clienta"], 61_200, 38_900, 127_400, ["Pedro Silva", 356_000, "el cliente"]),
});
/* Serie 2 · Distribuidora El Mirador Ltda., 31 de octubre. Cifras construidas. */
export const SERIE_2 = serie({
  id: "s2", razonSocial: "Distribuidora El Mirador Ltda.", fecha: "31 de octubre", extracto: 3_216_800, libros: 3_090_900,
  partidas: partidas("s2", "31 de octubre", [["Carolina Méndez", 265_300, "ella"], ["Felipe Rojas", 118_900, "él"], ["Natalia Vega", 402_600, "ella"]],
    947_500, ["Tomás Acosta", 713_400, "El cliente"], 84_700, 46_200, 173_800, ["Sofía Cárdenas", 291_500, "la clienta"]),
});
export const SERIES_H7 = [SERIE_1, SERIE_2];

/* Los mensajes de la fase 2 que no nombran cifras. */
export const SALDOS_H7 = {
  acierto: "Los dos saldos dan lo mismo. Nadie se equivocó: a cada lado le faltaba anotar algo.",
  igualesOtraCifra: "Los dos lados coinciden entre sí, pero la cuenta no es la del ejercicio. Repasa las sumas.",
  otro: "Tu cuenta se saltó una partida o la sumó cuando restaba. Repasa el Más y el Menos de cada libreta.",
};
export const CIERRE_PIE_H7 = "Formato y signos del libro, p. 190. Cifras construidas";

/* ═══════════ «ASÍ SE JUEGA» ═══════════ */

export const PASOS_H7 = ["Lee la partida.", "¿Quién no la tiene todavía?", "Si suma, al Más; si resta, al Menos."];
export const ALT_H7 = "El banco descontó una comisión de $12.000. Los libros todavía no la tienen, así que la partida va al Menos de los libros.";
/* La comisión de $12.000 (construida, sin serie), con un par propio: con el de una serie, la demo mostraría sus datos. */
export const EJEMPLO_H7 = {
  serie: { id: "demo", razonSocial: null, fecha: null, extracto: 640_000, libros: 652_000 },
  partidas: [{
    id: "demo", n: 0, tipo: "nd", monto: 12_000, va: LIBROS_MENOS, subtema: SUBTEMAS_H7.nd, pagina: PIE_FASE1_H7,
    texto: "El banco le descontó a la empresa la comisión por manejar la cuenta.",
    acierto: "El banco ya la descontó, y los libros todavía no: va al Menos de los libros.",
    errores: ERRORES_H7.nd,
  }],
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Cada intento sortea UNA serie y baraja sus nueve partidas. No guarda nada. */
export function sortearH7(elegir, barajar) {
  const s = elegir(SERIES_H7);
  return { serie: s, partidas: barajar(s.partidas) };
}

/* Fase 1: el acierto, o el error de la sección elegida (no nombra la correcta). */
export function evaluarPartidaH7(p, seccion) {
  const ok = seccion === p.va;
  return { ok, texto: ok ? p.acierto : p.errores[seccion] ?? null };
}

/*
 * Fase 2: el mensaje según lo escrito, en el orden del paquete: 1 · los dos
 * dan el saldo conciliado; 2 · los dos iguales, pero otra cifra; 3 · la
 * primera cifra de error reconocida (banco primero, luego libros); 4 · otra.
 * Cada campo se marca bien o mal por separado.
 */
export function evaluarSaldosH7(s, banco, libros) {
  const bien = { banco: banco === s.conciliadoBanco, libros: libros === s.conciliadoLibros };
  if (bien.banco && bien.libros) return { ok: true, bien, texto: SALDOS_H7.acierto };
  if (banco === libros) return { ok: false, bien, texto: SALDOS_H7.igualesOtraCifra };
  const reconocido = (!bien.banco && s.erroresBanco.find((e) => e.cifra === banco)) || (!bien.libros && s.erroresLibros.find((e) => e.cifra === libros));
  return { ok: false, bien, texto: reconocido ? reconocido.texto : SALDOS_H7.otro };
}

/* El saldo de un lado con las partidas puestas: lo que un estudiante dejaría en cada libreta, con su signo. */
export function saldoDeLado(s, lado, puestas) {
  const base = lado === "banco" ? s.extracto : s.libros;
  return puestas.filter((p) => p.seccion.startsWith(`${lado}:`)).reduce((x, p) => x + (p.seccion.endsWith(":mas") ? p.monto : -p.monto), base);
}

/* Evaluativa: las nueve partidas y los dos saldos, once puntos. El motor escala los 50 FP. */
export const puntuarH7 = (partidasBien, saldosBien) => ((partidasBien + saldosBien) / 11) * 100;

/* Para el panel docente: la partida de su serie, o uno de los dos saldos. */
export function partidaDeItemH7(id) {
  if (id === "saldo-banco") return ROTULOS_H7.campoBanco;
  if (id === "saldo-libros") return ROTULOS_H7.campoLibros;
  return SERIES_H7.flatMap((s) => s.partidas).find((p) => p.id === id)?.texto ?? null;
}
