/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H8 DE HACER — «¿Se asienta o no?» (Célula D). REDISEÑO DE ENGANCHE:
 * una figura que va creciendo hacia el mayor.
 *
 * Diseño: Hanayama (celula-d/hanayama-h8-rediseno.md). Textos: Katsumi
 * (celula-d/katsumi-texto-hacer.md), aprobados por Yujiro el 15 oct 2026.
 * Copia en el canon: orquestador/conocimiento/paquetes/d4-t4-h8-v2-
 * rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * Hacer · evaluativa · experto · 90 FP. Su fila del servidor es la migración
 * 0207, que ya corrió en producción y NO cambia: mismo activity_id y mismos
 * ítems (s1-1…s2-9, asiento-s1-5…, saldo-mayor).
 *
 * CADA INTENTO SORTEA SU SERIE, por su cuenta: H8 no supone que se jugó H7.
 * Las partidas son las de H7 (los DATOS, no su estado).
 *   1 · las nueve partidas, barajadas: «Se asienta» o «No se asienta». La
 *       cifra cae en la bandeja elegida
 *   2 · las cinco notas del banco, en el orden en que salieron: el asiento de
 *       cada una en el tablero de seis cuentas. Con el acierto, la línea de
 *       Bancos CAE EN EL MAYOR
 *   3 · el saldo de Bancos en el mayor, escrito: el mayor lo pone al pie
 * El saldo conciliado y el extracto NO están en el DOM hasta el acierto de la
 * etapa 3 (v3, PH8-1). Con las cifras de Katsumi (cheque de Mario Sánchez a
 * 310.500 y extracto a 1.874.400), el mayor solo llega a 2.551.700 con todas
 * las decisiones buenas (una prueba recorre las 3⁹ formas).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SERIE_1, SERIE_2 } from "./contabilidadT4H7.js";
import { DEBE, HABER, pesos } from "./contabilidadT4Hacer.js";

export { DEBE, HABER };

export const H8_ID = "t4-se-asienta-o-no";

export const H8 = {
  id: H8_ID,
  nombre: "¿Se asienta o no?",
  objetivo: "Elegir qué partidas de la conciliación se asientan, armar los asientos y llegar al saldo del mayor.",
  consigna: "Decide qué partidas se asientan, arma cada asiento y saca el saldo del mayor.",
};

export const SUBTEMAS_H8 = ["Qué se asienta", "Asiento de nota crédito del banco", "Asiento de nota débito del banco", "Saldo del mayor"];

/* ═══════════ ETAPA 1 · ¿SE ASIENTA? ═══════════ */

export const SE_ASIENTA = "se-asienta";
export const NO_SE_ASIENTA = "no-se-asienta";
/* Las dos bandejas, en orden fijo y en renglones fijos (Hanayama §1). */
export const BANDEJAS_H8 = [
  { id: SE_ASIENTA, renglones: ["Se asienta", "en los libros"] },
  { id: NO_SE_ASIENTA, renglones: ["No se asienta", "lo arregla", "el banco"] },
];
/* La devolución va por tipo de partida, y es la misma en las dos series. */
export const ETAPA1_H8 = {
  cheque: { respuesta: NO_SE_ASIENTA, acierto: "La empresa ya lo anotó al girarlo. Que el banco todavía no lo haya pagado no cambia nada en sus libros.", error: "Asentarlo otra vez lo dejaría anotado dos veces en los libros. Piensa en qué le falta a la empresa, no al banco." },
  consignacion: { respuesta: NO_SE_ASIENTA, acierto: "La empresa la anotó el día que consignó. Al banco le falta abonarla, pero eso no se corrige en los libros de la empresa.", error: "Esa consignación ya está en los libros de la empresa. Lo que falta es del lado del banco, y el banco lo hará solo." },
  nc: { respuesta: SE_ASIENTA, acierto: "El banco ya sumó esa plata, y los libros de la empresa todavía no la tienen. Por eso se asienta.", error: "Si no se asienta, los libros de la empresa se quedan sin una plata que ya está en su cuenta." },
  nd: { respuesta: SE_ASIENTA, acierto: "El banco ya le quitó esa plata a la empresa, y sus libros todavía no lo saben. Por eso se asienta.", error: "Si no se asienta, los libros de la empresa siguen contando una plata que el banco ya le quitó." },
};
export const PIE_H8 = { 1: "Basado en el libro, p. 190. Cifras construidas", 2: "Basado en el libro, p. 191. Cifras construidas", 3: "Basado en el libro, pp. 190-191. Cifras construidas" };

/* ═══════════ ETAPA 2 · LOS ASIENTOS ═══════════ */

export const BANCOS = "bancos";
export const CXC_CLIENTES = "cxc-clientes";
export const INGRESOS_INTERESES = "ingresos-intereses";
export const GASTOS_CHEQUERA = "gastos-chequera";
export const GASTO_INTERES = "gasto-interes";
export const CAJA = "caja";
/* Las seis cuentas del tablero, en su orden y en renglones fijos (Hanayama §3). */
export const CUENTAS_H8 = [
  { id: BANCOS, renglones: ["Bancos"] },
  { id: CXC_CLIENTES, renglones: ["Cuentas por", "cobrar", "– clientes"] },
  { id: INGRESOS_INTERESES, renglones: ["Ingresos", "por intereses"] },
  { id: GASTOS_CHEQUERA, renglones: ["Gastos", "financieros", "– chequera"] },
  { id: GASTO_INTERES, renglones: ["Gasto interés"] },
  { id: CAJA, renglones: ["Caja"] },
];
export const nombreDeCuentaH8 = (id) => CUENTAS_H8.find((c) => c.id === id)?.renglones.join(" ") ?? null;

/* Las reglas del error, en el orden del paquete: Caja; sin Bancos; Bancos al lado contrario; la cuenta; lados al revés. */
const SIN_BANCOS = {
  entra: "La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.",
  sale: "La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.",
};
const BANCOS_AL_LADO = {
  entra: "Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja?",
  sale: "Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?",
};

/* El asiento de cada nota del banco (p5…p9 de la serie), con sus mensajes; algunos nombran al cliente. */
function asientos(s) {
  const P = Object.fromEntries(s.partidas.map((p) => [p.n, p]));
  const cli = P[5].quien, dev = P[9].quien;
  return {
    5: { debe: BANCOS, haber: CXC_CLIENTES, sentido: "entra",
      acierto: `La plata entró al banco, así que Bancos se debita. Y ${cli} ya no debe esa factura: Cuentas por cobrar – clientes se acredita.`,
      cuenta: { [INGRESOS_INTERESES]: "Esa cuenta es para lo que rinde una inversión. Aquí un cliente pagó una factura que debía.",
        [GASTOS_CHEQUERA]: `${cli} pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió con ese pago.`,
        [GASTO_INTERES]: "Aquí nadie pagó intereses: un cliente pagó una factura que debía. Piensa en qué cambió con ese pago." },
      caja: "La plata no pasó por la caja: se consignó directo en el banco.",
      reves: "Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. Lo que debe el cliente baja, así que va al haber." },
    6: { debe: BANCOS, haber: INGRESOS_INTERESES, sentido: "entra",
      acierto: "La plata entró al banco: Bancos va al debe. Y es lo que ganó la empresa: Ingresos por intereses va al haber.",
      cuenta: { [CXC_CLIENTES]: "Nadie le debía esto a la empresa: es lo que rindió su inversión. Es un ingreso.",
        [GASTO_INTERES]: "Esos intereses los ganó la empresa, no los pagó. Un interés ganado es un ingreso.",
        [GASTOS_CHEQUERA]: "Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana." },
      caja: "La plata no pasó por la caja: el banco la abonó en la cuenta.",
      reves: "Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. El ingreso va al haber." },
    7: { debe: GASTOS_CHEQUERA, haber: BANCOS, sentido: "sale",
      acierto: "La chequera es un gasto: Gastos financieros – chequera se debita y Bancos se acredita.",
      cuenta: { [GASTO_INTERES]: "Una chequera no es un interés: es lo que cobra el banco por los cheques. Tiene su propia cuenta de gasto.",
        [CXC_CLIENTES]: "Ningún cliente tiene que ver aquí: el banco cobró por un servicio suyo. Es un gasto de la empresa.",
        [INGRESOS_INTERESES]: "La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga." },
      caja: "La plata no salió de la caja: el banco la descontó de la cuenta.",
      reves: "Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber." },
    8: { debe: GASTO_INTERES, haber: BANCOS, sentido: "sale",
      acierto: "Los intereses de sobregiro son un gasto: Gasto interés se debita y Bancos se acredita.",
      cuenta: { [INGRESOS_INTERESES]: "Estos intereses los cobró el banco, no los ganó la empresa. Un interés que se paga es un gasto.",
        [GASTOS_CHEQUERA]: "Esa cuenta es la del cobro de la chequera. Esto es un interés, y tiene su propia cuenta.",
        [CXC_CLIENTES]: "El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga." },
      caja: "La plata no salió de la caja: el banco la descontó de la cuenta.",
      reves: "Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber." },
    9: { debe: CXC_CLIENTES, haber: BANCOS, sentido: "sale",
      acierto: `El pago de ${dev} nunca llegó, así que vuelve a deber: Cuentas por cobrar – clientes se debita y Bancos se acredita.`,
      cuenta: { [GASTOS_CHEQUERA]: `La empresa no perdió esa plata: ${dev} todavía la debe. Su deuda vuelve a subir.`,
        [GASTO_INTERES]: `La empresa no perdió esa plata: ${dev} todavía la debe. Su deuda vuelve a subir.`,
        [INGRESOS_INTERESES]: "Aquí no entra nada: el banco devolvió un cheque. Lo que sube es lo que el cliente debe." },
      caja: "La plata no salió de la caja: el banco la descontó de la cuenta.",
      reves: "Las cuentas están bien, pero al revés. Lo que debe el cliente sube, así que va al debe. Bancos baja, así que va al haber." },
  };
}

/* La regla del error que aplica a un asiento armado { debe, haber }, en el orden del paquete. */
export function reglaH8(nota, a) {
  if (a.debe === nota.debe && a.haber === nota.haber) return { regla: "acierto", texto: nota.acierto };
  if (a.debe === CAJA || a.haber === CAJA) return { regla: "caja", texto: nota.caja };
  if (a.debe !== BANCOS && a.haber !== BANCOS) return { regla: "sin-bancos", texto: SIN_BANCOS[nota.sentido] };
  const ladoB = nota.debe === BANCOS ? "debe" : "haber";
  const otra = ladoB === "debe" ? nota.haber : nota.debe;
  const bancosBien = a[ladoB] === BANCOS;
  if (!bancosBien && a.debe !== otra && a.haber !== otra) return { regla: "bancos-al-lado", texto: BANCOS_AL_LADO[nota.sentido] };
  if (bancosBien) return { regla: "cuenta", texto: nota.cuenta[ladoB === "debe" ? a.haber : a.debe] ?? BANCOS_AL_LADO[nota.sentido] };
  return { regla: "reves", texto: nota.reves };
}

/* ═══════════ ETAPA 3 · EL MAYOR ═══════════ */

/* Una serie de H8: la de H7, con sus cinco notas, el saldo del mayor y los textos de la etapa 3. */
function serieH8(s) {
  const A = asientos(s);
  const notas = s.partidas.filter((p) => p.tipo === "nc" || p.tipo === "nd").map((p) => ({ ...p, idAsiento: `asiento-${p.id}`, ...A[p.n] }));
  const { cheques, consignacion, nc, nd } = s.totales;
  const saldoMayor = s.libros + nc - nd;
  return {
    id: s.id, fecha: s.fecha, libros: s.libros, extracto: s.extracto, partidas: s.partidas, notas, saldoMayor,
    tituloMayor: `Bancos · ${s.fecha}`,
    aciertoEtapa3: `Y fíjate: el extracto decía ${pesos(s.extracto)}. Si le sumas la consignación pendiente y le restas los cheques sin cobrar, también da ${pesos(saldoMayor)}. Es el saldo conciliado: los libros ya dicen la verdad.`,
    erroresEtapa3: [
      { cifra: s.libros + nc, texto: "Ese saldo tiene las notas crédito, pero no las débito. Al mayor le falta lo que el banco descontó." },
      { cifra: s.libros - nd, texto: "Ese saldo tiene las notas débito, pero no las crédito. Al mayor le falta lo que el banco abonó." },
      { cifra: s.libros + nc - nd - cheques + consignacion, texto: "Ese saldo mete partidas que la empresa ya tenía. Al mayor solo entran las notas del banco." },
    ],
    otroEtapa3: "El saldo del mayor es el de los libros, más lo que el banco sumó y menos lo que el banco restó. Revisa los cinco asientos.",
  };
}
export const SERIE_H8_1 = serieH8(SERIE_1);
export const SERIE_H8_2 = serieH8(SERIE_2);
export const SERIES_H8 = [SERIE_H8_1, SERIE_H8_2];

/* ═══════════ INTERFAZ ═══════════ */

export const ETAPAS_H8 = ["ETAPA 1 DE 3 · ¿SE ASIENTA?", "ETAPA 2 DE 3 · LOS ASIENTOS", "ETAPA 3 DE 3 · EL MAYOR"];
export const BOTON_H8 = {
  siguientePartida: "Siguiente partida", aLosAsientos: "Ir a los asientos", comprobar: "Comprobar", siguienteAsiento: "Siguiente asiento",
  alMayor: "Ir al mayor", comprobarSaldo: "Comprobar el saldo", verResumen: "Ver mi resumen", otraVez: "Otra vez",
};
export const AVISOS_H8 = { lados: "Pon una cuenta al debe y la otra al haber.", saldo: "Escribe el saldo antes de comprobar." };
export const ROTULOS_H8 = { saldoInicial: "Saldo", saldoPie: "Saldo", campo: "Saldo de Bancos en el mayor", parLibros: "los libros", parMayor: "el mayor", parBanco: "el banco" };
export const lectorParH8 = { antes: (y) => `Los libros: ${y}.`, acierto: (x, y) => `El banco: ${x}. El mayor: ${y}. Son iguales.` };
export const resumenH8 = (bien) => `${bien} de 15 al primer intento.`;
export const ALT_FIGURA_H8 = "Las partidas de la conciliación se separan en las que se asientan y las que no; las que se asientan entran al mayor de Bancos.";
export const CIERRE_H8 = {
  texto: "La empresa no corrige lo que el banco no sabe: eso lo arregla el tiempo. Corrige lo que ella no sabía: las notas del banco.",
  pie: "Basado en el libro, pp. 190-191. Cifras construidas",
};

/* ═══════════ «ASÍ SE JUEGA» ═══════════ */

export const PASOS_H8 = ["¿Les falta a los libros?", "Si les falta, se asienta.", "El mayor da el saldo final."];
export const ALT_H8 = "Un cheque de $50.000 que nadie ha cobrado va a «No se asienta», porque la empresa ya lo anotó al girarlo.";
/* El cheque de $50.000 que nadie ha cobrado (construido, sin serie). Solo la etapa 1: no regala ningún asiento. */
export const EJEMPLO_H8 = {
  serie: { id: "demo", fecha: null, libros: null, extracto: null, partidas: [], notas: [] },
  partidas: [{ id: "demo", n: 0, tipo: "cheque", monto: 50_000, texto: "La empresa giró un cheque, y nadie lo ha cobrado todavía.", aciertoEtapa1: "La empresa ya lo anotó al girarlo: a sus libros no les falta nada." }],
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Cada intento sortea su serie y baraja las nueve partidas. */
export function sortearH8(elegir, barajar) {
  const s = elegir(SERIES_H8);
  return { serie: s, partidas: barajar(s.partidas) };
}
/* Las notas de la etapa 2, en el orden en que salieron en la etapa 1. */
export const notasEnOrden = (s, partidas) => partidas.filter((p) => p.tipo === "nc" || p.tipo === "nd").map((p) => s.notas.find((n) => n.id === p.id));

export function evaluarEtapa1H8(p, bandeja) {
  const e = ETAPA1_H8[p.tipo];
  const ok = bandeja === e.respuesta;
  /* La demo trae su propio acierto (Katsumi, «Así se juega»); las partidas de las series, el de su tipo. */
  return { ok, respuesta: e.respuesta, texto: ok ? p.aciertoEtapa1 ?? e.acierto : e.error };
}
export function evaluarEtapa2H8(nota, a) {
  const { regla, texto } = reglaH8(nota, a);
  return { ok: regla === "acierto", regla, texto };
}
export function evaluarEtapa3H8(s, valor) {
  if (valor === s.saldoMayor) return { ok: true, texto: s.aciertoEtapa3 };
  return { ok: false, texto: s.erroresEtapa3.find((e) => e.cifra === valor)?.texto ?? s.otroEtapa3 };
}

/* El mayor: el saldo de los libros más lo que entra al debe menos lo que sale por el haber. */
export const saldoDelMayor = (s, lineas) => s.libros + lineas.debe.reduce((x, l) => x + l.monto, 0) - lineas.haber.reduce((x, l) => x + l.monto, 0);

/* Evaluativa: nueve partidas, cinco asientos y un saldo, quince puntos. El motor escala los 90 FP. */
export const TOTAL_H8 = 15;
export const puntuarH8 = (bien) => (bien / TOTAL_H8) * 100;

/* Para el panel docente: la partida de la etapa 1, el asiento de la 2, o el saldo de la 3. */
export function itemDeH8(id) {
  if (id === "saldo-mayor") return ROTULOS_H8.campo;
  const pid = id.startsWith("asiento-") ? id.slice(8) : id;
  const p = SERIES_H8.flatMap((s) => s.partidas).find((x) => x.id === pid);
  return p ? p.texto : null;
}
