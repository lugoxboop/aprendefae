import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS CRISTALES — la segunda moneda, y la única que se gasta.
 *
 * ═══════════ LA INVARIANTE DEL SISTEMA ═══════════
 *
 *   FP         es el puntaje académico: ranking, ligas, bono de nota. NUNCA se
 *              gasta, nunca se resta, nunca baja. Ninguna función de este
 *              archivo toca FP, y ninguna de la base los descuenta.
 *   Cristales  son moneda: solo sirven para comprar en la Tienda. No aparecen
 *              en ningún ranking ni afectan ninguna nota.
 *
 * Y NO HAY CONVERSIÓN ENTRE LOS DOS, en ninguna dirección. No es que todavía no
 * esté hecha: es que no existe. Un tipo de cambio convertiría el puntaje
 * académico en poder de compra y la Tienda en una razón para farmear FP.
 *
 * ═══════════ LOS NÚMEROS VIVEN AQUÍ Y EN LA 0035 ═══════════
 *
 * Los precios y las cantidades están a la vez en este archivo (para pintar la
 * Tienda) y en SQL (para pagar y cobrar de verdad). SQL no lee JavaScript, así
 * que están duplicados a la fuerza, y por eso cristales.test.mjs LEE la
 * migración y falla si los dos lados dejan de coincidir — el mismo trato que
 * niveles.test.mjs le da a los umbrales de liga.
 *
 * QUIEN MANDA ES LA BASE. El cliente pinta el botón y dice cuánto falta; el
 * saldo se descuenta en una función security definer que comprueba otra vez.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────────────── lo que cuesta ─────────────────────── */

/* El nivel I es de todos desde el primer día: no está aquí porque no se compra. */
export const PRECIO_NIVEL = { 2: 60, 3: 150, 4: 300 };
export const NIVELES_COMPRABLES = [2, 3, 4];

/* ─────────────────────── lo que se gana ─────────────────────── */

export const CRISTALES_RACHA = { 3: 5, 7: 10, 14: 20, 30: 50 };

/** Cada cuántas actividades DISTINTAS se paga, y cuánto. Las repeticiones no cuentan. */
export const ACTIVIDADES_POR_PREMIO = 5;
export const CRISTALES_POR_ACTIVIDADES = 20;

/*
 * El podio semanal de liga. Del cuarto puesto en adelante son 5, cuantos
 * puestos tenga el podio: su tamaño lo decide el de la liga, no esta tabla.
 */
export const CRISTALES_PODIO = { 1: 15, 2: 10, 3: 7 };
export const CRISTALES_PODIO_RESTO = 5;

export function cristalesDePuesto(posicion) {
  const p = Math.floor(Number(posicion));
  if (!Number.isFinite(p) || p < 1) return 0;
  return CRISTALES_PODIO[p] ?? CRISTALES_PODIO_RESTO;
}

/*
 * El tamaño del podio, proporcional al de la liga y con suelo de dos: en un
 * grupo de siete, un podio de uno haría del premio una lotería, y uno de cinco
 * lo daría a casi todos. Espeja liga_podio_tamano() de la 0036.
 */
export const PODIO_PROPORCION = 0.28;
export const PODIO_MINIMO = 2;

export function tamanoPodio(nLiga) {
  const n = Math.floor(Number(nLiga));
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.max(PODIO_MINIMO, Math.round(n * PODIO_PROPORCION));
}

/*
 * La tabla de «Cómo ganar Cristales», SIEMPRE a la vista en la Tienda. Que se
 * vea sin abrir nada es la mitad de para qué sirve: un precio sin forma de
 * conseguir el dinero es una pared.
 *
 * LAS MEDALLAS NO ESTÁN, y no es un olvido: hoy no existe ningún momento en el
 * servidor en que se otorgue una medalla —se derivan al leer— así que no hay
 * dónde enganchar el pago. Se hará con la tabla de medallas otorgadas, junto
 * con su sonido y su animación de celebración. Prometer aquí una fuente que no
 * paga sería peor que no ofrecerla.
 */
export const FUENTES = [
  { id: "racha-3", que: "Racha de 3 días", cuanto: CRISTALES_RACHA[3] },
  { id: "racha-7", que: "Racha de 7 días", cuanto: CRISTALES_RACHA[7] },
  { id: "racha-14", que: "Racha de 14 días", cuanto: CRISTALES_RACHA[14] },
  { id: "racha-30", que: "Racha de 30 días", cuanto: CRISTALES_RACHA[30] },
  {
    id: "actividades",
    que: `Cada ${ACTIVIDADES_POR_PREMIO} actividades distintas`,
    cuanto: CRISTALES_POR_ACTIVIDADES,
    nota: "Repetir una que ya hiciste no cuenta.",
  },
  {
    id: "podio",
    que: "Podio semanal de tu liga",
    cuanto: `${CRISTALES_PODIO[1]} / ${CRISTALES_PODIO[2]} / ${CRISTALES_PODIO[3]} / ${CRISTALES_PODIO_RESTO}`,
    nota: "1º, 2º, 3º y del 4º en adelante. El podio es más grande en ligas más grandes.",
  },
];

/* ─────────────────────── el saldo y los niveles ─────────────────────── */

export const saldoDe = (perfil) => Math.max(0, Math.floor(Number(perfil?.cristales_balance) || 0));

/** Los niveles comprados, siempre con el I dentro: es gratis y no se transa. */
export function nivelesDesbloqueados(perfil) {
  const crudo = perfil?.avatar_unlocked_levels;
  const lista = Array.isArray(crudo) ? crudo : [];
  const nums = lista.map((n) => Math.floor(Number(n))).filter((n) => n >= 1 && n <= 4);
  return [...new Set([1, ...nums])].sort((a, b) => a - b);
}

export const estaDesbloqueado = (perfil, nivel) => nivelesDesbloqueados(perfil).includes(Math.floor(Number(nivel)));

export const precioDe = (nivel) => PRECIO_NIVEL[Math.floor(Number(nivel))] ?? 0;

/** Cuántos Cristales faltan para este nivel. 0 = alcanza (o ya está comprado). */
export function faltanPara(perfil, nivel) {
  if (estaDesbloqueado(perfil, nivel)) return 0;
  return Math.max(0, precioDe(nivel) - saldoDe(perfil));
}

/**
 * El estado de un nivel en la Tienda, que es también el del selector.
 *   comprado · alcanzable · falta
 */
export function estadoDeNivel(perfil, nivel) {
  if (estaDesbloqueado(perfil, nivel)) return "comprado";
  return faltanPara(perfil, nivel) === 0 ? "alcanzable" : "falta";
}

/* ─────────────────────── las dos escrituras ─────────────────────── */

/*
 * Comprar un nivel. El saldo lo descuenta la base en la misma sentencia que
 * comprueba que alcanza, así que dos toques seguidos no pueden dejarlo en
 * negativo ni cobrar dos veces. Devuelve la fila del perfil ya actualizada.
 */
export async function comprarNivel(nivel) {
  if (!supabase) return { error: "Sin conexión." };
  const { data, error } = await supabase.rpc("comprar_nivel_avatar", { p_nivel: Math.floor(Number(nivel)) });
  if (error) {
    /* 22023 = la base dijo que no alcanza, que ya lo tiene o que el nivel no existe. */
    if (error.code === "22023") return { error: "No se pudo comprar. Vuelve a mirar tu saldo." };
    console.error("[aprendeFAE] Compra de nivel:", error.message);
    return { error: "No se pudo comprar. Revisa tu conexión e inténtalo otra vez." };
  }
  return { perfil: Array.isArray(data) ? data[0] : data };
}

/*
 * Guardar la combinación. Se llama en CADA TOQUE del selector: no hay botón de
 * guardar. Manda solo lo que cambió; los nulls dejan el resto como estaba.
 */
export async function guardarAvatar({ forma = null, paleta = null, nivel = null } = {}) {
  if (!supabase) return { error: "Sin conexión." };
  const { data, error } = await supabase.rpc("avatar_elegir", {
    p_forma: forma,
    p_paleta: paleta,
    p_nivel: nivel === null || nivel === undefined ? null : Math.floor(Number(nivel)),
  });
  if (error) {
    console.error("[aprendeFAE] Guardar avatar:", error.message);
    return { error: "No se pudo guardar tu avatar. Revisa tu conexión." };
  }
  return { perfil: Array.isArray(data) ? data[0] : data };
}
