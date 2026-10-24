import { DEBE, HABER, pesos } from "../data/contabilidad.js";
import {
  CUADRA_POR_VALOR, DEL_DIARIO_AL_MAYOR, LAS_QUE_VUELVEN_A_CERO, SUBTEMA_POR_CLASE,
  VUELVE_A_CERO, PASA_CON_SALDO, PLANTILLAS_DIARIO, PLANTILLAS_REVISAR, PORQUE_DESTINO, COINCIDE_REVISAR,
} from "../data/contabilidadT2HacerNuevas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LA LÓGICA DE LAS TRES HACER NUEVAS (Célula C, lote T2-2).
 *
 * Funciones puras: lo que se califica no depende de React. Un intento por
 * ítem, en el estándar único: cada ítem vale lo mismo y el puntaje es
 * aciertos / ítems × 100.
 *
 * La única frase de consecuencia calculada es la del desnivel de «Cuadra por
 * valor» («Faltan $X en el {lado}: …»), que es la de Watari y sale del dato
 * (Near, §1.1). En «Del diario al mayor» y «Las que vuelven a cero» la
 * consecuencia la pinta el objeto (la ficha en la cuenta mala, la fila del año
 * siguiente con borde coral) y el texto es el retro de Near, que ya dice lo
 * que pasaría. Regla C4 de Watari: primero la consecuencia, después el veredicto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const puntuar = (bien, total) => (total > 0 ? (100 * bien) / total : 0);

/* ═══════════════════════ 8.º · CUADRA POR VALOR ═══════════════════════ */

export const CUADRA = "cuadra";
export const NO_CUADRA = "no-cuadra";

/** Las sumas de un asiento, con el monto que falte puesto en `relleno`. */
export function sumas(lineas, relleno = 0) {
  const de = (lado) => lineas.filter((l) => l.lado === lado).reduce((s, l) => s + (l.monto ?? relleno ?? 0), 0);
  return { debe: de(DEBE), haber: de(HABER) };
}

/** Cuántas cuentas hay en cada lado: el conteo que va debajo de las columnas. */
export const conteo = (lineas, lado) => lineas.filter((l) => l.lado === lado).length;

/*
 * La frase del desnivel, con las dos formas de Watari (c-t2-4-watari-figuras.md §1):
 *   «Faltan $700 en el haber: las dos columnas no llegan a la misma altura.»
 *   «Sobran $X en el haber: su columna pasa la línea del debe.»
 * La segunda, solo cuando la cifra escrita se pasa: `pasado` es el lado del
 * hueco en completar, y la frase la dice si ese lado es el más alto.
 */
const NOMBRE_LADO = { [DEBE]: "el debe", [HABER]: "el haber" };
export function fraseDesnivel({ debe, haber }, pasado = null) {
  if (debe === haber) return null;
  const alto = debe > haber ? DEBE : HABER;
  const dif = pesos(Math.abs(debe - haber));
  if (pasado === alto) return `Sobran ${dif} en ${NOMBRE_LADO[alto]}: su columna pasa la línea ${alto === DEBE ? "del haber" : "del debe"}.`;
  return `Faltan ${dif} en ${NOMBRE_LADO[alto === DEBE ? HABER : DEBE]}: las dos columnas no llegan a la misma altura.`;
}

/*
 * La figura de las dos columnas (Watari §1), sin pantalla: cada renglón es un
 * tramo proporcional a su valor sobre una escala de 1,12 × la suma mayor.
 * Antes de «Comprobar», el hueco es un tramo FIJO (sin altura propia: 28 px
 * en CSS, con «?») y la escala NO cuenta lo escrito: la figura no calcula al
 * teclear (prueba C5 de Mello). Comprobado, el hueco toma su cifra, entran la
 * línea de nivel (a la altura del debe) y la marca de lo que falta o sobra.
 *   { debe: [tramo], haber: [tramo], nivel: { alto, igual } | null, marca: { lado, desde, alto } | null, sumas }
 *   tramo = { k, cuenta, monto, alto (en %) | null si es fijo, fijo, tuya }
 */
export function figuraCuadra(lineas, { relleno = null, comprobado = false } = {}) {
  const valor = (l) => (l.monto != null ? l.monto : comprobado ? (relleno ?? 0) : 0);
  const s = { debe: 0, haber: 0 };
  lineas.forEach((l) => { s[l.lado] += valor(l); });
  const esc = Math.max(s.debe, s.haber, 1) * 1.12;
  const pct = (x) => Math.round((1000 * x) / esc) / 10;
  const tramos = (lado) => lineas.map((l, k) => ({ l, k })).filter(({ l }) => l.lado === lado).map(({ l, k }) => {
    const fijo = l.monto == null && !comprobado;
    return { k, cuenta: l.cuenta, monto: fijo ? null : valor(l), alto: fijo ? null : pct(valor(l)), fijo, tuya: l.monto == null };
  });
  const nivel = comprobado ? { alto: pct(s.debe), igual: s.debe === s.haber } : null;
  let marca = null;
  if (comprobado && s.debe !== s.haber) {
    const lo = Math.min(s.debe, s.haber);
    marca = { lado: s.debe > s.haber ? HABER : DEBE, desde: pct(lo), alto: pct(Math.abs(s.debe - s.haber)) };
  }
  return { debe: tramos(DEBE), haber: tramos(HABER), nivel, marca, sumas: s, escala: esc };
}

/*
 * El ancho de la columna de cifra (Watari §1): la cifra más larga del asiento,
 * en caracteres (`--cifra`, en ch). Con más de 8 (los millones) el asiento va
 * `.apilado`: el nombre en su línea y las cifras debajo.
 */
export function anchoCifra(lineas, extras = []) {
  const largos = [...lineas.map((l) => l.monto), ...extras].filter((x) => x != null).map((x) => pesos(x).length);
  const cifra = Math.max(4, ...largos);
  return { cifra, apilado: cifra > 8 };
}

export function prepararCuadra(barajar = (xs) => xs) {
  const { casos } = CUADRA_POR_VALOR;
  /* El orden del tipo se respeta (completar, juzgar, encontrar); dentro de cada tipo se baraja. */
  const de = (tipo) => barajar(casos.filter((c) => c.tipo === tipo));
  return [...de("completar"), ...de("juzgar"), ...de("encontrar")];
}

/**
 * Califica un caso de Cuadra por valor. `respuesta`:
 *   completar  el número escrito
 *   juzgar     CUADRA o NO_CUADRA
 *   encontrar  el índice de la línea tocada
 */
export function evaluarCuadra(caso, respuesta) {
  if (caso.tipo === "completar") {
    const ok = respuesta === caso.correcta;
    const s = sumas(caso.lineas, respuesta);
    const distractor = caso.distractores?.find((d) => d.valor === respuesta);
    const ladoHueco = caso.lineas.find((l) => l.monto == null)?.lado ?? null;
    return {
      ok, correcta: caso.correcta, sumas: s,
      consecuencia: ok ? null : fraseDesnivel(s, ladoHueco),
      textos: ok ? [caso.porque] : [distractor?.retro ?? caso.porque],
    };
  }
  if (caso.tipo === "juzgar") {
    const correcta = caso.cuadra ? CUADRA : NO_CUADRA;
    const ok = respuesta === correcta;
    const s = sumas(caso.lineas);
    return {
      ok, correcta, sumas: s,
      consecuencia: fraseDesnivel(s),
      textos: ok ? [caso.porque] : [caso.retroMala, caso.porque],
    };
  }
  /* `linea` es la lista de las que se aceptan: en el duplicado (E2), cualquiera de las dos. */
  const ok = caso.linea.includes(respuesta);
  return {
    ok, correcta: caso.linea, sumas: sumas(caso.lineas),
    consecuencia: fraseDesnivel(sumas(caso.lineas)),
    textos: ok ? [caso.porque] : [caso.retros?.[respuesta] ?? caso.porque, caso.porque],
  };
}

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR ═══════════════════════ */

/** Los renglones del diario, en su orden: { k, fecha, cuenta, lado, monto }. */
export function renglonesDe(caso) {
  const salida = [];
  for (const a of caso.asientos) for (const l of a.lineas) salida.push({ k: salida.length, fecha: a.fecha, ...l });
  return salida;
}

/** Las cuentas del mayor, en el orden en que aparecen por primera vez en el diario. */
export function cuentasDe(caso) {
  return [...new Set(renglonesDe(caso).map((r) => r.cuenta))];
}

/** El mayor con los renglones ya puestos: { cuenta: { cuenta, debitos, creditos, renglones } }. */
export function mayorCon(caso, puestos) {
  const renglones = renglonesDe(caso);
  const mayor = Object.fromEntries(cuentasDe(caso).map((c) => [c, { cuenta: c, debitos: [], creditos: [], renglones: { debe: [], haber: [] } }]));
  for (const k of puestos) {
    const r = renglones[k];
    const lado = r.lado === DEBE ? "debe" : "haber";
    mayor[r.cuenta][r.lado === DEBE ? "debitos" : "creditos"].push({ valor: r.monto });
    mayor[r.cuenta].renglones[lado].push(k);
  }
  return mayor;
}

/*
 * Un caso por partida. Se alternan por intento (D8): `anterior` es el id del
 * caso de la partida pasada, y se juega el otro. Los destino van en orden de
 * fecha, como en el diario; los origen, barajados; y los dos «revisar», al
 * final y en su orden (Near T2-4 §2: el 2 después del 1, y el mayor completo
 * no delata nada pendiente). La cuadrícula de T se baraja en cada intento
 * (H6): `orden` va igual en todos los ítems de la tanda.
 */
export function prepararDiario(barajar = (xs) => xs, anterior = null) {
  const casos = barajar([...DEL_DIARIO_AL_MAYOR.casos]);
  const caso = casos.find((c) => c.id !== anterior) ?? casos[0];
  const orden = barajar(cuentasDe(caso));
  const de = (tipo) => caso.items.filter((it) => it.tipo === tipo).map((it) => ({ ...it, caso, orden }));
  return [...de("destino"), ...barajar(de("origen")), ...de("revisar")];
}

/* Los renglones que el mayor trae ya pasados al empezar: los de origen (Mello §2.2: sin ellos, origen no se juega). */
export const pasadosDe = (caso) => caso.items.filter((it) => it.tipo === "origen").map((it) => it.renglon);

/*
 * El mayor de «revisar»: los renglones del caso con la forma de Watari
 * { r, cuenta, lado, monto }, con la línea mal pasada del ítem en lugar de la
 * suya. Va por cuenta y, dentro de cada T, por fecha (el orden del diario).
 */
export function mayorRevisar(item) {
  return renglonesDe(item.caso).map((x) => (x.k === item.mal.r ? { ...item.mal } : { r: x.k, cuenta: x.cuenta, lado: x.lado, monto: x.monto }));
}

/*
 * El cotejo de una línea del mayor con su renglón del diario. SE CALCULA
 * comparando, campo por campo; nada se escribe a mano (Watari §2).
 */
export function cotejoDe(renglon, linea) {
  return [
    ["Cuenta", renglon.cuenta, linea.cuenta],
    ["Lado", renglon.lado, linea.lado],
    ["Monto", renglon.monto, linea.monto],
  ].map(([campo, diario, mayor]) => ({ campo, diario, mayor, igual: diario === mayor }));
}

const MESES = { Ene: "enero", Feb: "febrero", Mar: "marzo", Abr: "abril", May: "mayo", Jun: "junio",
  Jul: "julio", Ago: "agosto", Sep: "septiembre", Oct: "octubre", Nov: "noviembre", Dic: "diciembre" };
/** «Ene 8» → «8 de enero», como lo escribe Near en sus retros. */
export function fechaLarga(fecha) {
  const [mes, dia] = fecha.split(" ");
  return MESES[mes] ? `${dia} de ${MESES[mes]}` : fecha;
}

/** Pone los nombres en la plantilla de Near. */
export function retroDiario(letra, { cuenta, fecha = "", cuentaDelMayor = "" }) {
  const plantilla = PLANTILLAS_DIARIO[letra];
  if (!plantilla) return null;
  return plantilla.replaceAll("{cuenta del mayor}", cuentaDelMayor).replaceAll("{cuenta}", cuenta).replaceAll("{fecha}", fecha);
}

/**
 * Califica un ítem. Destino: `respuesta` es el nombre de la cuenta tocada.
 * Origen: el índice del renglón tocado. Revisar: el `r` de la línea del mayor
 * tocada (una línea por renglón).
 */
export function evaluarDiario(item, respuesta) {
  const renglones = renglonesDe(item.caso);
  if (item.tipo === "revisar") {
    const linea = mayorRevisar(item).find((x) => x.r === respuesta);
    const cotejo = linea ? cotejoDe(renglones[linea.r], linea) : [];
    /* Bien: la que no coincide. Mal: la consecuencia es el cotejo en «=» y la frase de Watari; luego, la plantilla de Near. */
    const ok = cotejo.length > 0 && cotejo.some((c) => !c.igual);
    const retro = ok ? null : PLANTILLAS_REVISAR[item.retros?.[respuesta]] ?? null;
    return {
      ok, correcta: item.mal.r, cotejo, consecuencia: ok ? null : COINCIDE_REVISAR,
      textos: ok ? [item.porque] : [retro ?? item.porque],
    };
  }
  const r = renglones[item.renglon];
  if (item.tipo === "destino") {
    const ok = respuesta === r.cuenta;
    const retro = ok ? null : retroDiario(item.retros?.[respuesta], { cuenta: respuesta });
    return { ok, correcta: r.cuenta, consecuencia: null, textos: ok ? [PORQUE_DESTINO] : [retro ?? PORQUE_DESTINO] };
  }
  const ok = respuesta === item.renglon;
  const tocado = renglones[respuesta];
  const retro = ok || !tocado ? null : retroDiario(item.retros?.[respuesta], {
    cuenta: tocado.cuenta, fecha: fechaLarga(tocado.fecha), cuentaDelMayor: r.cuenta,
  });
  return { ok, correcta: item.renglon, consecuencia: null, textos: ok ? [item.porque] : [retro ?? item.porque] };
}

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO ═══════════════════════ */

export { VUELVE_A_CERO, PASA_CON_SALDO };

export const subtemaDeCuenta = (cuenta) => SUBTEMA_POR_CLASE[cuenta.clase];
export const destinoCorrecto = (cuenta) => (cuenta.clase === "nominal" ? VUELVE_A_CERO : PASA_CON_SALDO);

export function prepararCero(barajar = (xs) => xs) {
  return barajar([...LAS_QUE_VUELVEN_A_CERO.caso.cuentas]);
}

/* Cada cuenta trae el retro de la única opción mala que tiene (Near). */
export function evaluarCero(cuenta, eleccion) {
  const correcta = destinoCorrecto(cuenta);
  const ok = eleccion === correcta;
  return { ok, correcta, consecuencia: null, textos: [ok ? cuenta.porque : cuenta.retroMala] };
}

/** La utilidad del año con las nominales que ya cruzaron: ingresos − gastos − costos. */
export function utilidadDe(cuentas) {
  return cuentas.filter((c) => c.clase === "nominal")
    .reduce((s, c) => s + (c.familia === "ingreso" ? c.saldo : -c.saldo), 0);
}
