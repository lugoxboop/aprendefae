/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H8 DE HACER — «¿Se asienta o no?» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h8-v1.md (serie 1, ya con la
 * v2, la v3 y S2-1 dentro) y la parte de H8 de d4-t4-h7-h8-serie2.md (serie
 * 2). Copias en orquestador/conocimiento/paquetes/, los mismos blobs que en
 * la punta de feat/conta-d4-mapa-fuente. Una prueba compara cada texto de
 * aquí contra ellos, letra por letra.
 *
 * Hacer · evaluativa · experto · 90 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0207, que corre Erwin.
 *
 * CADA INTENTO SORTEA SU SERIE, por su cuenta (decisión de Yujiro): H8 no
 * supone que se jugó H7 y no guarda nada de ella. Las nueve partidas y el
 * saldo en libros son los datos construidos de Katsumi; se toman de los
 * DATOS de H7 (el mismo paquete los declara iguales), no de su estado.
 *
 * Tres etapas:
 *   1 · las nueve partidas, barajadas: «Se asienta» o «No se asienta»
 *   2 · las cinco que se asientan: el asiento de cada una (dos cuentas de
 *       seis, con su lado; el valor va en la partida)
 *   3 · el saldo de Bancos en el mayor, escrito
 * El saldo conciliado y el extracto NO están en el DOM hasta el acierto de
 * la etapa 3 (v3; Hanayama H8 v1.1, PH8-1).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SERIE_1, SERIE_2 } from "./contabilidadT4H7.js";

export const H8_ID = "t4-se-asienta-o-no";

export const DEBE = "debe";
export const HABER = "haber";

export const SUBTEMAS_H8 = ["Qué se asienta", "Asiento de nota crédito del banco", "Asiento de nota débito del banco", "Saldo del mayor"];

export const H8 = {
  id: H8_ID,
  nombre: "¿Se asienta o no?",
  objetivo: "Elegir qué partidas de la conciliación se asientan, armar los asientos y llegar al saldo del mayor.",
  /* La segunda frase de la consigna, la misma en las dos series (la primera nombra la empresa y su saldo). */
  consignaComun: "Ahora la empresa tiene que corregir sus libros. Primero, elige qué partidas se asientan. Después, arma cada asiento. Al final, calcula el saldo de Bancos en el mayor.",
};

/* ═══════════ ETAPA 1 · ¿SE ASIENTA O NO? ═══════════ */

export const SE_ASIENTA = "se-asienta";
export const NO_SE_ASIENTA = "no-se-asienta";
/* Los dos destinos, en orden fijo (Hanayama H8 v1 §2). */
export const DESTINOS_H8 = [
  { id: SE_ASIENTA, nombre: "Se asienta" },
  { id: NO_SE_ASIENTA, nombre: "No se asienta" },
];
export const nombreDeDestinoH8 = (id) => DESTINOS_H8.find((d) => d.id === id)?.nombre ?? null;

/* La devolución va por tipo de partida, y es la misma en las dos series. */
export const ETAPA1_H8 = {
  cheque: {
    respuesta: NO_SE_ASIENTA,
    acierto: "Así es. La empresa ya lo anotó al girarlo. Que el banco todavía no lo haya pagado no cambia nada en sus libros.",
    error: "Asentarlo otra vez lo dejaría anotado dos veces en los libros. Piensa en qué le falta a la empresa, no al banco.",
  },
  consignacion: {
    respuesta: NO_SE_ASIENTA,
    acierto: "Así es. La empresa la anotó el día que consignó. Al banco le falta abonarla, pero eso no se corrige en los libros de la empresa.",
    error: "Esa consignación ya está en los libros de la empresa. Lo que falta es del lado del banco, y el banco lo hará solo.",
  },
  credito: {
    respuesta: SE_ASIENTA,
    acierto: "Así es. El banco ya sumó esa plata, y los libros de la empresa todavía no la tienen. Por eso se asienta.",
    error: "Si no se asienta, los libros de la empresa se quedan sin una plata que ya está en su cuenta.",
  },
  debito: {
    respuesta: SE_ASIENTA,
    acierto: "Así es. El banco ya le quitó esa plata a la empresa, y sus libros todavía no lo saben. Por eso se asienta.",
    error: "Si no se asienta, los libros de la empresa siguen contando una plata que el banco ya le quitó.",
  },
};
export const PIE_ETAPA1 = "Basado en el libro, p. 190. Cifras construidas";

/* ═══════════ ETAPA 2 · LOS ASIENTOS ═══════════ */

export const BANCOS = "Bancos";
export const CXC_CLIENTES = "Cuentas por cobrar – clientes";
export const INGRESOS_INTERESES = "Ingresos por intereses";
export const GASTOS_CHEQUERA = "Gastos financieros – chequera";
export const GASTO_INTERES = "Gasto interés";
export const CAJA = "Caja";
/* Las seis cuentas, las mismas en los cinco asientos y en el orden del paquete. */
export const CUENTAS_H8 = [BANCOS, CXC_CLIENTES, INGRESOS_INTERESES, GASTOS_CHEQUERA, GASTO_INTERES, CAJA];
/*
 * En la paleta y en las filas del constructor, la regla de H5 (Hanayama H8
 * v1 §3): espacio duro antes de la raya y dentro del sufijo, para que el
 * nombre se parta, si se parte, justo después de «–». `deLaPaleta` lo
 * devuelve a su forma llana para evaluar.
 */
const NB = "\u00a0";
export const enLaPaleta = (c) => c.replace(/ – (.+)$/, (_, sufijo) => `${NB}– ${sufijo.replace(/ /g, NB)}`);
export const deLaPaleta = (c) => c.replace(/\u00a0/g, " ");
export const PALETA_H8 = CUENTAS_H8.map(enLaPaleta);

/*
 * Los mensajes de regla son los mismos en las cinco partidas, según la nota
 * sume o reste plata a la cuenta. Los de cuenta, los de «lados al revés» y
 * el de Caja son de cada partida y nombran a la persona.
 */
const SIN_BANCOS = {
  credito: "La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.",
  debito: "La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.",
};
const BANCOS_AL_REVES = {
  credito: "Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja?",
  debito: "Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?",
};
const CAJA_DEBITO = "La plata no salió de la caja: el banco la descontó de la cuenta.";
const REVES_GASTO = "Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber.";

/*
 * El asiento de cada clase de nota (p. 191) y sus mensajes de cuenta. `porCuenta`
 * es el mensaje cuando Bancos va en su lado y la otra cuenta es esa.
 */
function notaH8(clase, persona) {
  const N = {
    pago: {
      tipo: "credito", debe: BANCOS, haber: CXC_CLIENTES,
      acierto: `Así es. La plata entró al banco, así que Bancos se debita. Y ${persona} ya no debe esa factura: Cuentas por cobrar – clientes se acredita.`,
      porCuenta: {
        [INGRESOS_INTERESES]: "Esa cuenta es para lo que rinde una inversión. Aquí un cliente pagó una factura que debía.",
        [GASTOS_CHEQUERA]: `${persona} pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió cuando el cliente pagó.`,
        [GASTO_INTERES]: "Aquí nadie pagó intereses: el cliente pagó una factura que debía. Piensa en qué cambió cuando pagó.",
      },
      caja: "La plata no pasó por la caja: el cliente la consignó directo en el banco.",
      alReves: "Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. Lo que debe el cliente baja, así que va al haber.",
    },
    intereses: {
      tipo: "credito", debe: BANCOS, haber: INGRESOS_INTERESES,
      acierto: "Así es. El banco abonó los intereses: Bancos se debita y se acredita Ingresos por intereses.",
      porCuenta: {
        [CXC_CLIENTES]: "Nadie le debía esto a la empresa: es lo que rindió su inversión. Es un ingreso.",
        [GASTO_INTERES]: "Esos intereses los ganó la empresa, no los pagó. Un interés ganado es un ingreso.",
        [GASTOS_CHEQUERA]: "Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana.",
      },
      caja: "La plata no pasó por la caja: el banco la abonó en la cuenta.",
      alReves: "Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. El ingreso va al haber.",
    },
    chequera: {
      tipo: "debito", debe: GASTOS_CHEQUERA, haber: BANCOS,
      acierto: "Así es. La chequera es un gasto: Gastos financieros – chequera se debita y Bancos se acredita.",
      porCuenta: {
        [GASTO_INTERES]: "Una chequera no es un interés: es lo que cobra el banco por los cheques. Tiene su propia cuenta de gasto.",
        [CXC_CLIENTES]: "Ningún cliente tiene que ver aquí: el banco cobró por un servicio suyo. Es un gasto de la empresa.",
        [INGRESOS_INTERESES]: "La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga.",
      },
      caja: CAJA_DEBITO,
      alReves: REVES_GASTO,
    },
    sobregiro: {
      tipo: "debito", debe: GASTO_INTERES, haber: BANCOS,
      acierto: "Así es. Los intereses de sobregiro son un gasto: Gasto interés se debita y Bancos se acredita.",
      porCuenta: {
        [INGRESOS_INTERESES]: "Estos intereses los cobró el banco, no los ganó la empresa. Un interés que se paga es un gasto.",
        [GASTOS_CHEQUERA]: "Esa cuenta es la del cobro de la chequera. Esto es un interés, y tiene su propia cuenta.",
        [CXC_CLIENTES]: "El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga.",
      },
      caja: CAJA_DEBITO,
      alReves: REVES_GASTO,
    },
    devuelto: {
      tipo: "debito", debe: CXC_CLIENTES, haber: BANCOS,
      acierto: `Así es. El pago de ${persona} nunca llegó, así que vuelve a deber: Cuentas por cobrar – clientes se debita y Bancos se acredita.`,
      /* «usó una cuenta de gasto»: el mismo mensaje para las dos cuentas de gasto. */
      porCuenta: {
        [GASTOS_CHEQUERA]: `La empresa no perdió esa plata: ${persona} todavía la debe. Su deuda vuelve a subir.`,
        [GASTO_INTERES]: `La empresa no perdió esa plata: ${persona} todavía la debe. Su deuda vuelve a subir.`,
        [INGRESOS_INTERESES]: "Aquí no entra nada: el banco devolvió un cheque. Lo que sube es lo que el cliente debe.",
      },
      caja: CAJA_DEBITO,
      alReves: "Las cuentas están bien, pero al revés. Lo que debe el cliente sube, así que va al debe. Bancos baja, así que va al haber.",
    },
  }[clase];
  return { ...N, sinBancos: SIN_BANCOS[N.tipo], bancosAlReves: BANCOS_AL_REVES[N.tipo] };
}

/*
 * El mensaje de error de la etapa 2, con las cinco reglas de Katsumi en su
 * orden: (1) aparece Caja; (2) no aparece Bancos; (3) Bancos en el lado
 * equivocado con otra cuenta; (4) Bancos en su lado con otra cuenta: el
 * mensaje de esa cuenta; (5) las cuentas correctas al revés. Cubre las 29
 * combinaciones equivocadas de cada partida (10 + 12 + 3 + 3 + 1).
 */
export function reglaH8(nota, debe, haber) {
  if (debe === nota.debe && haber === nota.haber) return { regla: "acierto", texto: nota.acierto };
  if (debe === CAJA || haber === CAJA) return { regla: "caja", texto: nota.caja };
  if (debe !== BANCOS && haber !== BANCOS) return { regla: "sin-bancos", texto: nota.sinBancos };
  const ladoBancos = nota.debe === BANCOS ? DEBE : HABER;
  const bancosEn = debe === BANCOS ? DEBE : HABER;
  const otra = bancosEn === DEBE ? haber : debe;
  if (debe === nota.haber && haber === nota.debe) return { regla: "al-reves", texto: nota.alReves };
  if (bancosEn !== ladoBancos) return { regla: "bancos-al-reves", texto: nota.bancosAlReves };
  return { regla: "cuenta", texto: nota.porCuenta[otra] };
}

/* ═══════════ LAS DOS SERIES ═══════════ */

/*
 * Una serie de H8: las nueve partidas (las de los datos de H7), su etapa 1
 * por tipo, las cinco notas con su asiento, y la etapa 3. Las cifras de la
 * etapa 3 se calculan. Los textos que nombran cifras o personas se arman
 * con ellas; una prueba los compara con el paquete.
 */
const CLASE = { 5: "pago", 6: "intereses", 7: "chequera", 8: "sobregiro", 9: "devuelto" };
const PERSONA = (p) => p.texto.match(/cliente (\S+ \S+)/)?.[1] ?? null;
const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/* El texto de la partida en la etapa 2 (el de H8, sin «La empresa todavía no lo ha anotado.»). */
const partidaEtapa2 = (p) => p.texto.replace(/ La empresa todavía no lo ha anotado\.$/, "");

function serieH8(s, textosEtapa2) {
  const partidas = s.partidas.map((p) => ({ id: p.id, tipo: p.tipo, monto: p.monto, texto: p.texto, rotulo: p.rotulo, ...ETAPA1_H8[p.tipo] }));
  const notas = s.partidas.filter((p) => p.tipo === "credito" || p.tipo === "debito").map((p) => {
    const n = Number(p.id.split("-")[1]);
    return { id: p.id, monto: p.monto, texto: textosEtapa2[n] ?? partidaEtapa2(p), ...notaH8(CLASE[n], PERSONA(p)) };
  });
  const credito = notas.filter((x) => x.tipo === "credito").reduce((t, x) => t + x.monto, 0);
  const debito = notas.filter((x) => x.tipo === "debito").reduce((t, x) => t + x.monto, 0);
  const saldoMayor = s.libros + credito - debito;
  const conciliadoBanco = s.extracto + s.totales.consignacion - s.totales.cheques;
  /* El tercer error: asentar además lo del banco, con los signos de la conciliación (H8-b). */
  const conLoDelBanco = saldoMayor - s.totales.cheques + s.totales.consignacion;
  return {
    id: s.id, empresa: s.empresa, fecha: s.fecha,
    libros: s.libros, extracto: s.extracto, partidas, notas, credito, debito, saldoMayor, conciliadoBanco,
    consigna: [
      `${s.empresa} comparó su cuenta con el extracto del banco y encontró nueve partidas. El saldo de sus libros es ${pesos(s.libros)}.`,
      H8.consignaComun,
    ],
    datoEtapa3: `Saldo de Bancos en los libros antes de los ajustes: ${pesos(s.libros)}.`,
    aciertoEtapa3: `Así es. Y fíjate en algo: el extracto decía ${pesos(s.extracto)}. Si le sumas la consignación pendiente y le restas los cheques sin cobrar, también da ${pesos(conciliadoBanco)}. Es el saldo conciliado: los libros ya dicen la verdad.`,
    erroresEtapa3: [
      { cifra: s.libros + credito, texto: "Ese saldo tiene las notas crédito, pero no las débito. Al mayor le falta lo que el banco descontó." },
      { cifra: s.libros - debito, texto: "Ese saldo tiene las notas débito, pero no las crédito. Al mayor le falta lo que el banco abonó." },
      { cifra: conLoDelBanco, texto: "Ese saldo mete partidas que la empresa ya tenía. Al mayor solo entran las notas del banco." },
    ],
    otroEtapa3: "El saldo del mayor es el de los libros, más lo que el banco sumó y menos lo que el banco restó. Revisa los cinco asientos.",
    fechaAsientos: s.fecha,
  };
}

/*
 * Los textos de la etapa 2 que no salen de quitar «La empresa todavía no lo
 * ha anotado.» del texto de H7: el pago del cliente de la serie 1, que H8
 * escribe con otra forma.
 */
export const SERIE_H8_1 = serieH8(SERIE_1, {
  5: "El cliente Gloria Ruiz le pagó a la empresa una factura: consignó la plata directo en el banco. Fueron $528.000.",
});
export const SERIE_H8_2 = serieH8(SERIE_2, {});
export const SERIES_H8 = [SERIE_H8_1, SERIE_H8_2];

export const CIERRE_H8 = {
  texto: "La empresa no corrige lo que el banco no sabe: eso lo arregla el tiempo. Corrige lo que ella no sabía: las notas del banco.",
  pie: "Basado en el libro, pp. 190-191. Cifras construidas",
};

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el
 * paquete no trae: el rótulo de cada etapa (Hanayama H8 v1 §1), los botones,
 * el resumen, el rótulo del asiento completo, lo que oye el lector de
 * pantalla, los rótulos del mayor y del par (Hanayama H8 v1.1), y los avisos
 * grises que no gastan el intento (como los de H3 y H5).
 */
export const ETAPAS_H8 = ["ETAPA 1 DE 3 · ¿SE ASIENTA?", "ETAPA 2 DE 3 · LOS ASIENTOS", "ETAPA 3 DE 3 · EL MAYOR"];
export const BOTON_H8 = {
  siguiente: "Siguiente partida", aLosAsientos: "Ir a los asientos", comprobar: "Comprobar", siguienteAsiento: "Siguiente asiento",
  alMayor: "Ir al mayor", comprobarSaldo: "Comprobar el saldo", verResumen: "Ver mi resumen", otraVez: "Otra vez",
};
export const CORRECTO = "Correcto.";
export const INCORRECTO = "Incorrecto.";
export const ROTULO_ASIENTO_H8 = "EL ASIENTO COMPLETO";
export const resumenH8 = (bien, total) => `${bien} de ${total} al primer intento.`;
export const lectorErrorH8 = (destino) => `Incorrecto. La respuesta es ${destino}.`;
export const MISMO_LADO_H8 = "Pon una cuenta al debe y la otra al haber.";
export const FALTA_SALDO = "Escribe el saldo antes de comprobar.";
export const MAYOR_H8 = { titulo: (fecha) => `Bancos · ${fecha}`, saldo: "Saldo", suma: "Suma", saldoFinal: "Saldo", campo: "Saldo de Bancos en el mayor" };
export const PAR_H8 = { banco: "el banco", libros: "los libros", mayor: "el mayor", igual: "=" };

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H8) ═══════════ */

export const PASOS_H8 = [
  "Primero, decide qué partidas se asientan.",
  "Después, arma el asiento de cada una.",
  "Al final, escribe el saldo de Bancos en el mayor.",
];
export const ALT_H8 = "La empresa ya anotó ese cheque al girarlo. A sus libros no les falta nada, así que no se asienta.";
/*
 * La partida construida del paquete (no es de ninguna serie). Solo la etapa
 * 1, con una partida que NO se asienta, para no regalar ningún asiento. La
 * mano TOCA «No se asienta». [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]
 * El acierto de la demo es el texto alternativo de Katsumi.
 */
export const EJEMPLO_H8 = {
  id: "demo", tipo: "cheque", monto: 50_000, respuesta: NO_SE_ASIENTA, rotulo: ["Cheque"],
  texto: "Un cheque de $50.000 que la empresa giró y que nadie ha cobrado.",
  acierto: ALT_H8, error: ETAPA1_H8.cheque.error,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Cada intento sortea UNA serie y baraja las nueve partidas de la etapa 1. Las notas van en el orden de la p. 191. */
export function sortearH8(elegir, barajar) {
  const s = elegir(SERIES_H8);
  return { serie: s, partidas: barajar(s.partidas) };
}

export function evaluarEtapa1H8(item, elegido) {
  const ok = elegido === item.respuesta;
  return { ok, correcta: item.respuesta, textos: ok ? [CORRECTO, item.acierto] : [item.error] };
}

/* El asiento armado con el constructor: una cuenta al debe y otra al haber, o nada. */
export function armadoH8(filas) {
  const puestas = filas.filter((f) => f.cuenta && f.lado);
  const debe = puestas.filter((f) => f.lado === DEBE);
  const haber = puestas.filter((f) => f.lado === HABER);
  return { completas: puestas.length === 2 && filas.length === 2, debe: debe.length === 1 ? debe[0].cuenta : null, haber: haber.length === 1 ? haber[0].cuenta : null };
}
export const listoH8 = (filas) => { const a = armadoH8(filas); return a.completas && Boolean(a.debe && a.haber); };
export const mismoLadoH8 = (filas) => { const a = armadoH8(filas); return a.completas && !(a.debe && a.haber); };

export function evaluarEtapa2H8(nota, filas) {
  const a = armadoH8(filas);
  const { regla, texto } = reglaH8(nota, a.debe, a.haber);
  const ok = regla === "acierto";
  const estados = filas.map((f) => (f.cuenta ? ((f.lado === DEBE ? nota.debe : nota.haber) === f.cuenta ? "correcta" : "incorrecta") : null));
  return {
    ok, regla, texto, estados,
    respuesta: `${a.debe} / ${a.haber}`,
    asiento: [{ cuenta: nota.debe, lado: DEBE, valor: nota.monto }, { cuenta: nota.haber, lado: HABER, valor: nota.monto }],
  };
}

/* Lee lo que se escribe: «2.551.700», «2551700», «$ 2.551.700». Vacío o sin dígitos → null. */
export const leerSaldoH8 = (t) => { const d = String(t ?? "").replace(/\D/g, ""); return d ? Number(d) : null; };

/* Etapa 3: el acierto, una de las tres cifras de error, o cualquier otra. */
export function evaluarEtapa3H8(s, valor) {
  if (valor === s.saldoMayor) return { ok: true, texto: s.aciertoEtapa3 };
  return { ok: false, texto: s.erroresEtapa3.find((e) => e.cifra === valor)?.texto ?? s.otroEtapa3 };
}

/* Evaluativa: nueve partidas, cinco asientos y un saldo, quince puntos. El motor escala los 90 FP. */
export const TOTAL_H8 = 15;
export const puntuarH8 = (bien) => (bien / TOTAL_H8) * 100;

/* Para el panel docente: la partida de la etapa 1, el asiento de la 2, o el saldo de la 3. */
export function itemDeH8(id) {
  if (id === "saldo-mayor") return MAYOR_H8.campo;
  const [etapa, pid] = id.startsWith("asiento-") ? [2, id.slice(8)] : [1, id];
  const s = SERIES_H8.find((x) => pid.startsWith(`${x.id}-`));
  if (!s) return null;
  return etapa === 2 ? s.notas.find((n) => n.id === pid)?.texto ?? null : s.partidas.find((p) => p.id === pid)?.texto ?? null;
}
