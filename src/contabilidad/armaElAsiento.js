import { DEBE, HABER, CRECE_POR, tipoDeCuenta, LAVADO_DE_AUTOS, CALEJA } from "../data/contabilidad.js";
import { TRANSACCIONES_SUELTAS } from "../data/contabilidadActividades.js";
import {
  ITEMS, ITEM_RETIRADO, POR_PARTIDA, DECISIONES_POR_ITEM, ANCLAJES,
  PALABRAS_DE_CAJA, PALABRAS_DE_BANCOS,
  ERROR_LADOS_INVERTIDOS, ERROR_CUENTA_AJENA, ERROR_MISMO_LADO,
  COLETILLA_COMPUTADOR, COLETILLA_CAJA_BANCOS, ACIERTO,
} from "../data/contabilidadArmaElAsiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A6 · ARMA EL ASIENTO — la lógica.
 *
 * Las tres señales de esta actividad representan EXACTAMENTE una cosa cada
 * una, y las tres se calculan aquí a partir de lo que el estudiante puso:
 *
 *   el arco        que el asiento CUADRA (mismo valor a cada lado)
 *   el ▲ y flecha  por dónde crece la cuenta, y hacia dónde la mueve esto
 *   el anclaje     que ESA CUENTA SE MUEVE en esta transacción
 *
 * Ninguna de las tres depende de si acertó: las tres se encienden siempre al
 * confirmar. Si apareciesen solo en el error, su presencia sería el veredicto
 * y el estudiante dejaría de leerlas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = { caleja: CALEJA.transacciones, lavado: LAVADO_DE_AUTOS.transacciones };

/** Dónde está escrita la transacción de un ítem. */
export function transaccionDe(item) {
  const id = item.suelta ?? item.transaccion;
  const lista = item.suelta ? TRANSACCIONES_SUELTAS : CASOS[item.caso];
  const t = lista?.find((x) => x.id === id);
  if (!t) throw new Error(`${item.id}: no existe la transacción «${id}»`);
  return t;
}

export const cuentasDe = (asiento) => [...asiento.debe, ...asiento.haber].map(([c]) => c);

/** Un ítem montado: su transacción, su asiento y los anclajes de cada cuenta. */
export function montar(item) {
  const t = transaccionDe(item);
  const clave = item.suelta ?? item.transaccion;
  const anclajes = ANCLAJES[clave];
  if (!anclajes) throw new Error(`${item.id}: faltan los anclajes de «${clave}»`);

  const cuentas = [
    ...t.asiento.debe.map(([cuenta, valor]) => ({ cuenta, valor, lado: DEBE })),
    ...t.asiento.haber.map(([cuenta, valor]) => ({ cuenta, valor, lado: HABER })),
  ].map((c) => ({
    ...c,
    /* Por dónde crece, y hacia dónde la mueve ESTA transacción. */
    creceP: CRECE_POR[tipoDeCuenta(c.cuenta)],
    sube: CRECE_POR[tipoDeCuenta(c.cuenta)] === c.lado,
    ancla: anclajes[c.cuenta] ?? null,
  }));

  for (const c of cuentas) {
    if (!c.ancla) throw new Error(`${item.id}: «${c.cuenta}» se mueve y no tiene anclaje`);
  }

  /*
   * ═══════════ EL VALOR DEL ASIENTO ES UNO SOLO ═══════════
   *
   * En un asiento simple hay un importe y está a los dos lados. La ficha que
   * el estudiante mueve vale ESO, caiga en la cuenta que caiga — también si
   * eligió una cuenta que no se mueve. Antes se leía el valor de la cuenta
   * puesta, y una cuenta ajena daba una ficha de $0: un importe que la
   * transacción no dice en ninguna parte, escrito en pantalla como si lo
   * dijera. Y de paso el asiento no podía cuadrar nunca con una cuenta de
   * más, cuando la ficha dice que ahí el arco puede cerrar igual.
   */
  const valor = cuentas[0].valor;
  return { ...item, transaccion: t, texto: t.texto, cuentas, anclajes, valor };
}

export const ASIENTOS = ITEMS.map(montar);
export { POR_PARTIDA, DECISIONES_POR_ITEM };

/*
 * Un asiento suelto, con su texto, su asiento y sus anclajes escritos a mano:
 * el del ejemplo de «Así se juega», que no está en ningún caso ni entre las
 * transacciones sueltas. Sale con la misma forma que `montar`, así que el
 * componente y `evaluar` lo leen igual que a los del banco.
 */
export function montarSuelto({ id, texto, asiento, anclajes }) {
  const cuentas = [
    ...asiento.debe.map(([cuenta, valor]) => ({ cuenta, valor, lado: DEBE })),
    ...asiento.haber.map(([cuenta, valor]) => ({ cuenta, valor, lado: HABER })),
  ].map((c) => ({
    ...c,
    creceP: CRECE_POR[tipoDeCuenta(c.cuenta)],
    sube: CRECE_POR[tipoDeCuenta(c.cuenta)] === c.lado,
    ancla: anclajes[c.cuenta] ?? null,
  }));
  for (const c of cuentas) {
    if (!c.ancla || !texto.includes(c.ancla)) throw new Error(`${id}: «${c.cuenta}» no tiene su anclaje en el texto`);
  }
  if (cuentas.length !== 2) throw new Error(`${id}: un asiento simple mueve dos cuentas`);
  return { id, texto, cuentas, anclajes, valor: cuentas[0].valor };
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANCO DE NOMBRES, Y LA REGLA QUE EXCLUYE A LA PAREJA
 *
 * Los señuelos son cuentas de las OTRAS transacciones del mismo banco: nunca
 * inventadas, nunca traídas de fuera del capítulo.
 *
 * Y hay una regla que QUITA una opción en vez de añadirla. Si la respuesta es
 * Caja y el enunciado no dice «de contado», «en efectivo», «con cheque» ni
 * «se consignó», entonces Bancos NO entra como señuelo — y al revés. Sin esa
 * palabra en el texto, elegir entre las dos no es razonar: es adivinar, y una
 * actividad que mide suerte no mide nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PAREJA = { "Caja": "Bancos", "Bancos": "Caja" };

/** ¿Dice el enunciado cuál de las dos es? */
export function decideEntreCajaYBancos(texto) {
  const t = texto.toLowerCase();
  if (PALABRAS_DE_CAJA.some((p) => t.includes(p))) return "Caja";
  if (PALABRAS_DE_BANCOS.some((p) => t.includes(p))) return "Bancos";
  return null;
}

/** El universo: las cuentas que se mueven en alguna transacción del banco. */
export const UNIVERSO = [...new Set(ASIENTOS.flatMap((a) => a.cuentas.map((c) => c.cuenta)))];

export const CUANTAS_EN_BANCO = 6;

export function bancoDe(asiento, mezclar = (x) => x) {
  const correctas = asiento.cuentas.map((c) => c.cuenta);
  const decide = decideEntreCajaYBancos(asiento.texto);

  /*
   * ═══════════ LA PAREJA: O ENTRA SIEMPRE, O NO ENTRA NUNCA ═══════════
   *
   * Si el enunciado trae la palabra que distingue Caja de Bancos, la otra
   * entra OBLIGATORIAMENTE. No es relleno: la ficha tiene una explicación
   * escrita para quien las confunde, y si la opción no se ofrece ese error no
   * puede ocurrir y ese texto no lo lee nadie nunca.
   *
   * Si NO la trae, la otra queda prohibida. Sin esa palabra, elegir entre las
   * dos no es razonar: es adivinar.
   */
  const prohibidas = new Set();
  const obligadas = [];
  for (const c of correctas) {
    const pareja = PAREJA[c];
    if (!pareja || correctas.includes(pareja)) continue;
    if (decide) obligadas.push(pareja);
    else prohibidas.add(pareja);
  }

  const banco = [...correctas, ...obligadas];
  for (const c of mezclar(UNIVERSO)) {
    if (banco.length >= CUANTAS_EN_BANCO) break;
    if (banco.includes(c) || prohibidas.has(c)) continue;
    banco.push(c);
  }
  return mezclar(banco);
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DEVOLUCIÓN
 *
 * Tres confusiones, y cuando se cumple más de una manda la más estructural:
 *
 *   C  las dos fichas del mismo lado  — el asiento no existe como asiento
 *   B  una cuenta que no se mueve     — el asiento habla de algo que no pasó
 *   A  los lados invertidos           — el asiento es el correcto, del revés
 *
 * C va primero porque con las dos fichas del mismo lado no hay arco que
 * trazar ni lados que comparar: no hay asiento del que hablar. B va antes que
 * A porque «esa cuenta no se mueve» explica algo que «los lados están al
 * revés» daría por bueno.
 */
export const PATRON_A = "A";
export const PATRON_B = "B";
export const PATRON_C = "C";

const NOMBRA_COMPUTADOR = (asiento, cuenta) =>
  cuenta === "Equipo de computación" && /computador/i.test(asiento.texto);

/**
 * `puestas` es [{ cuenta, lado }, { cuenta, lado }] — lo que el estudiante
 * armó. `lado` puede ser null mientras no haya colocado la ficha.
 */
export function evaluar(asiento, puestas) {
  const real = new Map(asiento.cuentas.map((c) => [c.cuenta, c.lado]));
  const puestasHechas = puestas.filter((p) => p.cuenta && p.lado);

  let cuentasOk = 0;
  let ladosOk = 0;
  for (const [cuenta, lado] of real) {
    const p = puestasHechas.find((x) => x.cuenta === cuenta);
    if (!p) continue;
    cuentasOk += 1;
    if (p.lado === lado) ladosOk += 1;
  }
  const aciertos = cuentasOk + ladosOk;
  const perfecto = aciertos === real.size * 2;

  /* El arco cierra cuando hay valor a cada lado y los totales coinciden. */
  const totalDe = (lado) => puestasHechas
    .filter((p) => p.lado === lado)
    .reduce((s) => s + asiento.valor, 0);
  const totalDebe = totalDe(DEBE);
  const totalHaber = totalDe(HABER);
  const cuadra = totalDebe > 0 && totalDebe === totalHaber;

  const ajena = puestasHechas.find((p) => !real.has(p.cuenta));
  const mismoLado = puestasHechas.length === 2
    && puestasHechas[0].lado === puestasHechas[1].lado;

  let patron = null;
  let texto = ACIERTO;
  if (!perfecto) {
    if (mismoLado) {
      patron = PATRON_C;
      texto = ERROR_MISMO_LADO;
    } else if (ajena) {
      patron = PATRON_B;
      texto = ERROR_CUENTA_AJENA.replace("{cuenta}", ajena.cuenta);
      if (NOMBRA_COMPUTADOR(asiento, ajena.cuenta)) texto += ` ${COLETILLA_COMPUTADOR}`;
      if (PAREJA[ajena.cuenta]) texto += ` ${COLETILLA_CAJA_BANCOS}`;
    } else {
      patron = PATRON_A;
      texto = ERROR_LADOS_INVERTIDOS;
    }
  }

  return {
    texto, patron, perfecto, aciertos, cuentasOk, ladosOk,
    cuadra, totalDebe, totalHaber, real,
    /* Lo que hay que resaltar en el enunciado, y para siempre. */
    frases: puestasHechas
      .map((p) => asiento.anclajes[p.cuenta] ?? null)
      .filter(Boolean),
    /* La cuenta suelta, si la hay: es la que se queda sin línea. */
    sinAncla: ajena?.cuenta ?? null,
    /* La palabra clave del enunciado, cuando la confusión es Caja/Bancos. */
    palabraClave: ajena && PAREJA[ajena.cuenta] ? claveEnElTexto(asiento.texto) : null,
  };
}

/** El trozo literal del enunciado que decide entre Caja y Bancos, si está. */
export function claveEnElTexto(texto) {
  for (const p of [...PALABRAS_DE_CAJA, ...PALABRAS_DE_BANCOS]) {
    const k = texto.toLowerCase().indexOf(p);
    if (k >= 0) return texto.slice(k, k + p.length);
  }
  return null;
}

/* El reintento vale la mitad, como en el resto del tema. */
export const VALOR_SEGUNDO = 0.5;

export const decisionesDe = (cuantas) => cuantas * DECISIONES_POR_ITEM;

export function puntuar(respuestas, cuantas) {
  const total = decisionesDe(cuantas);
  if (!total) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / total) * 100;
}

export const pesoDeCadaDecision = (cuantas) => (decisionesDe(cuantas) ? 100 / decisionesDe(cuantas) : 0);

/* Qué transacción era cada id, para el panel docente. */
export function textoDeItem(id) {
  const vivo = ASIENTOS.find((a) => a.id === id);
  if (vivo) return vivo.texto;
  const sueltaId = ITEM_RETIRADO[id];
  if (!sueltaId) return null;
  return TRANSACCIONES_SUELTAS.find((t) => t.id === sueltaId)?.texto ?? null;
}
