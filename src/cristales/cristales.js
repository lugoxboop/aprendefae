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

/*
 * ═══════════ LAS PIEZAS: FORMAS Y PALETAS QUE SE COMPRAN (0153) ═══════════
 *
 * Hasta el 28-oct la Tienda vendía solo los tres niveles: comprados los tres,
 * se quedaba vacía para siempre y los Cristales dejaban de servir para nada.
 *
 * Lo que NO está aquí es tan importante como lo que está: las cinco formas y
 * las cuatro paletas originales no se compran, porque ya eran de todos.
 * Cobrar por algo que ya era de alguien no es monetizar, es quitárselo.
 *
 * Los precios suben con lo elaborada que es la figura, no al azar: Vértice es
 * un triángulo y Órbita teje dieciséis vértices con cuerdas. Las dos paletas
 * valen lo mismo entre sí porque son el mismo trabajo.
 *
 * Y están EN SQL también (0153, precio_pieza_avatar). SQL no lee JavaScript,
 * así que cristales.test.mjs lee la migración y falla si los dos lados se
 * separan: el cliente pinta el precio, pero quien cobra es la base.
 */
export const PRECIO_PIEZA = {
  forma: { vertice: 30, enlace: 60, astro: 75, orbita: 100 },
  paleta: { ascua: 45, arrecife: 45 },
};

export const FORMAS_COMPRABLES = ["vertice", "enlace", "astro", "orbita"];
export const PALETAS_COMPRABLES = ["ascua", "arrecife"];

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

/* ─────────────────────── las piezas ─────────────────────── */

/* Las cinco formas y las cuatro paletas que siempre fueron de todos. */
export const FORMAS_LIBRES = ["decaedro", "prisma", "nucleo", "red", "cuna"];
export const PALETAS_LIBRES = ["nocturno", "marea", "brasa", "aurora"];

const LIBRES = { forma: FORMAS_LIBRES, paleta: PALETAS_LIBRES };
const COLUMNA = { forma: "avatar_unlocked_shapes", paleta: "avatar_unlocked_palettes" };

/**
 * Las piezas que este perfil puede usar, con las libres SIEMPRE dentro.
 *
 * Las libres se añaden aquí y no se confía en que vengan de la base: un
 * perfil viejo leído antes de que corriera la 0153, o una respuesta sin esa
 * columna, dejaría al estudiante sin su propia forma. El servidor vuelve a
 * comprobarlo de todos modos; esto es para que la pantalla no mienta.
 */
export function piezasDesbloqueadas(perfil, tipo) {
  const crudo = perfil?.[COLUMNA[tipo]];
  const lista = Array.isArray(crudo) ? crudo.filter((x) => typeof x === "string") : [];
  return [...new Set([...(LIBRES[tipo] ?? []), ...lista])];
}

export const piezaDesbloqueada = (perfil, tipo, clave) => piezasDesbloqueadas(perfil, tipo).includes(clave);

/** Lo que cuesta una pieza. 0 = no se vende (porque es libre, o no existe). */
export const precioDePieza = (tipo, clave) => PRECIO_PIEZA[tipo]?.[clave] ?? 0;

/** Cuántos Cristales faltan para esta pieza. 0 = alcanza (o ya es suya). */
export function faltanParaPieza(perfil, tipo, clave) {
  if (piezaDesbloqueada(perfil, tipo, clave)) return 0;
  return Math.max(0, precioDePieza(tipo, clave) - saldoDe(perfil));
}

/** comprada · alcanzable · falta — el mismo trío que los niveles. */
export function estadoDePieza(perfil, tipo, clave) {
  if (piezaDesbloqueada(perfil, tipo, clave)) return "comprado";
  return faltanParaPieza(perfil, tipo, clave) === 0 ? "alcanzable" : "falta";
}

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

/* ─────────────────────── por qué falló, de verdad ─────────────────────── */

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MENSAJE NO PUEDE CULPAR A LA CONEXIÓN SIN SABERLO.
 *
 * Esto existe por un caso real. En producción faltaba correr la migración
 * 0035, así que avatar_elegir() no existía: PostgREST respondía 404 PGRST202
 * —«Could not find the function public.avatar_elegir…»— y el estudiante leía
 * «No se pudo guardar tu avatar. Revisa tu conexión.» con la conexión
 * perfecta. El mensaje mandó a mirar al sitio equivocado, y el fallo real
 * —una migración sin aplicar— quedó tapado.
 *
 * La regla, entonces: SOLO se habla de conexión cuando de verdad no se pudo
 * hablar con el servidor. Si el servidor contestó, contestó algo, y eso es lo
 * que hay que enseñar.
 *
 * Y el código va escrito en el mensaje a propósito. Un estudiante no sabe qué
 * es un PGRST202, pero la captura que manda por WhatsApp sí lo lleva, y con él
 * se sabe en un vistazo si hay que correr una migración o mirar otra cosa. Sin
 * eso, el único camino es abrir la consola en el teléfono de alguien.
 *
 * TEXTOS PENDIENTES DE REVISIÓN DE GEN. Los escribí por necesidad —sin ellos
 * el arreglo no se puede ver— y no son contenido acordado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El servidor contestó, y lo que contestó es que le falta algo: la función no
 * existe, hay dos firmas, o falta una columna. Nunca es culpa del estudiante y
 * nunca se arregla reintentando: se arregla corriendo la migración que falta.
 */
const FALTA_EN_EL_SERVIDOR = new Set([
  "PGRST202", // no encuentra la función con esos parámetros
  "PGRST203", // dos firmas vivas: la llamada es ambigua
  "PGRST205", // no encuentra la tabla
  "42883",    // undefined_function
  "42P01",    // undefined_table
  "42703",    // undefined_column
]);

/*
 * Y esto tampoco es un fallo de red: es el sitio compilado sin sus variables de
 * entorno, así que no hay cliente y no hay a dónde escribir. Decía «Sin
 * conexión.», que mandaba a mirar al mismo sitio equivocado.
 */
export const SIN_CONFIGURAR =
  "Este sitio se publicó sin conexión a la base de datos, así que no hay dónde guardar. No es tu conexión.";

/** Si supabase-js no llegó a hablar con el servidor (no hay código de Postgres). */
function esFalloDeRed(error) {
  if (error?.code) return false;
  return /fetch|network|networkerror|load failed|failed to fetch/i.test(error?.message ?? "");
}

/**
 * De un error de supabase-js al mensaje que se le enseña a quien lo sufrió.
 *
 * @param {object} error   el que devuelve supabase-js
 * @param {string} intento qué se estaba intentando, en infinitivo y en corto
 * @returns {string}
 */
export function motivoDeError(error, intento) {
  const codigo = error?.code ?? "";

  if (esFalloDeRed(error)) return `No se pudo ${intento}: no hay conexión. Inténtalo otra vez.`;

  if (FALTA_EN_EL_SERVIDOR.has(codigo)) {
    return `No se pudo ${intento}: al servidor le falta una actualización (${codigo}). No es tu conexión — avísale a quien mantiene el sitio.`;
  }

  /* Sesión caducada o sin permiso. Reintentar no sirve; volver a entrar, sí. */
  if (codigo === "42501") return `No se pudo ${intento}: tu sesión expiró. Vuelve a entrar y prueba otra vez.`;

  /*
   * 22023 lo levanta la propia función con un texto escrito para leerse —«El
   * nivel 3 no está desbloqueado»—, así que se enseña tal cual en vez de
   * taparlo con uno genérico.
   */
  if (codigo === "22023" && error?.message) return error.message;

  return `No se pudo ${intento}${codigo ? ` (${codigo})` : ""}. Inténtalo otra vez.`;
}

/* ─────────────────────── las dos escrituras ─────────────────────── */

/*
 * Comprar un nivel. El saldo lo descuenta la base en la misma sentencia que
 * comprueba que alcanza, así que dos toques seguidos no pueden dejarlo en
 * negativo ni cobrar dos veces. Devuelve la fila del perfil ya actualizada.
 */
export async function comprarNivel(nivel) {
  if (!supabase) return { error: SIN_CONFIGURAR };
  const { data, error } = await supabase.rpc("comprar_nivel_avatar", { p_nivel: Math.floor(Number(nivel)) });
  if (error) {
    console.error("[aprendeFAE] Compra de nivel:", error.code ?? "", error.message);
    return { error: motivoDeError(error, "comprar este nivel") };
  }
  return { perfil: Array.isArray(data) ? data[0] : data };
}

/*
 * Comprar una forma o una paleta. Mismo trato que comprarNivel: el saldo lo
 * descuenta la base en la misma sentencia que comprueba que alcanza, así que
 * dos toques seguidos no cobran dos veces.
 */
export async function comprarPieza(tipo, clave) {
  if (!supabase) return { error: SIN_CONFIGURAR };
  const { data, error } = await supabase.rpc("comprar_pieza_avatar", { p_tipo: tipo, p_clave: clave });
  if (error) {
    console.error("[aprendeFAE] Compra de pieza:", error.code ?? "", error.message);
    return { error: motivoDeError(error, tipo === "forma" ? "comprar esta forma" : "comprar esta paleta") };
  }
  return { perfil: Array.isArray(data) ? data[0] : data };
}

/*
 * Guardar la combinación. Se llama en CADA TOQUE del selector: no hay botón de
 * guardar. Manda solo lo que cambió; los nulls dejan el resto como estaba.
 */
export async function guardarAvatar({ forma = null, paleta = null, nivel = null } = {}) {
  if (!supabase) return { error: SIN_CONFIGURAR };
  const { data, error } = await supabase.rpc("avatar_elegir", {
    p_forma: forma,
    p_paleta: paleta,
    p_nivel: nivel === null || nivel === undefined ? null : Math.floor(Number(nivel)),
  });
  if (error) {
    console.error("[aprendeFAE] Guardar avatar:", error.code ?? "", error.message);
    return { error: motivoDeError(error, "guardar tu avatar") };
  }
  return { perfil: Array.isArray(data) ? data[0] : data };
}
