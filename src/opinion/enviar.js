/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIAR UNA OPINIÓN DEL SITIO
 *
 * Toda la lógica que no es pintura vive aquí para poder probarla con node a
 * secas, sin navegador y sin base de datos.
 *
 * LO QUE NO HACE: decidir el anonimato. Eso lo decide el servidor dentro de
 * enviar_opinion() (migración 0155). Aquí se manda la intención; si alguien
 * trucara este archivo para firmar una opinión ajena, la base no le haría
 * caso. Un anonimato que dependa del navegador no es un anonimato.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TEMAS = [
  { id: "interfaz", etiqueta: "Interfaz" },
  { id: "actividades", etiqueta: "Actividades" },
  { id: "ejemplos", etiqueta: "Ejemplos" },
  { id: "rankings", etiqueta: "Rankings" },
];

export const LARGO_MAXIMO = 2000;

/*
 * Lo que dice cada estrella. No es adorno: una escala sin palabras se
 * interpreta distinto por cada quien, y entonces el promedio no significa
 * nada. Cinco etiquetas cortas y en primera persona.
 */
export const ESCALA = {
  1: "No me sirve",
  2: "Le falta mucho",
  3: "Va bien, pero…",
  4: "Me gusta",
  5: "Me encanta",
};

/*
 * Teléfono, tableta o escritorio. Tres valores y no el ancho exacto: en un
 * curso de cuarenta y seis, el ancho en píxeles junto con la hora señala a una
 * persona, y eso rompería la promesa de la hoja (ver la cabecera de 0155).
 */
export function dispositivoDe(ancho) {
  const n = Number(ancho);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 600) return "telefono";
  if (n < 1024) return "tableta";
  return "escritorio";
}

/* Qué se puede enviar: hace falta una puntuación. El texto es opcional. */
export function sePuedeEnviar({ puntaje }) {
  return Number.isInteger(puntaje) && puntaje >= 1 && puntaje <= 5;
}

/* Recorta y limpia lo que escribió, igual que lo hará el servidor. */
export function limpiarTexto(texto) {
  const t = String(texto ?? "").trim();
  if (!t) return null;
  return t.slice(0, LARGO_MAXIMO);
}

/* Solo los temas que existen, sin repetidos y en el orden en que se enseñan. */
export function temasValidos(seleccion) {
  const puestos = new Set(Array.isArray(seleccion) ? seleccion : []);
  return TEMAS.filter((t) => puestos.has(t.id)).map((t) => t.id);
}

/*
 * El envío.
 *
 * Devuelve siempre un objeto con `ok`, nunca lanza: una opinión que no se
 * pudo guardar no puede romperle la portada a nadie. Y `ok: false` se le dice
 * al estudiante tal cual —«no se pudo enviar»—, porque dar las gracias por
 * algo que se perdió es peor que el error.
 */
export async function enviarOpinion(cliente, { puntaje, texto, anonimo, temas, origen = "inicio", ancho } = {}) {
  if (!sePuedeEnviar({ puntaje })) return { ok: false, motivo: "sin-puntaje" };
  if (!cliente) return { ok: false, motivo: "sin-conexion" };

  try {
    const { data, error } = await cliente.rpc("enviar_opinion", {
      p_puntaje: puntaje,
      p_texto: limpiarTexto(texto),
      p_anonimo: anonimo !== false,
      p_temas: temasValidos(temas),
      p_origen: origen,
      p_dispositivo: dispositivoDe(ancho),
    });
    if (error) return { ok: false, motivo: "error", detalle: error.message };
    /* La función devuelve false cuando frena un envío repetido del mismo día. */
    if (data === false) return { ok: false, motivo: "repetida" };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "error", detalle: String(e?.message ?? e) };
  }
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PUNTUAR LA ACTIVIDAD QUE SE ACABA DE CERRAR
 *
 * Dos llamadas y no una, por una razón de diseño: la estrella se manda en
 * cuanto se toca, porque quien puntúa y pulsa «Volver» no puede perder su
 * voto por no haber confirmado nada. El comentario llega después, si llega, y
 * va a ESA MISMA fila con el vale que se generó aquí (ver 0156). Si entrara
 * como una opinión aparte, la actividad quedaría contada dos veces y su media
 * mentiría.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESCALA_ACTIVIDAD = {
  1: "No me sirvió",
  2: "Floja",
  3: "Normal",
  4: "Buena",
  5: "Muy buena",
};

/*
 * El vale: un uuid al azar por envío. `crypto.randomUUID` no existe en
 * navegadores viejos ni en las pruebas, así que hay un respaldo; lo único que
 * se le pide es que no se repita y que no se pueda adivinar.
 */
export function nuevoVale(aleatorio = null) {
  const c = aleatorio ?? (typeof crypto !== "undefined" ? crypto : null);
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i += 1) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/* La estrella. Devuelve el vale para poder comentar esa misma fila después. */
export async function puntuarActividad(cliente, { puntaje, actividadId, materiaId, ancho, vale } = {}) {
  if (!sePuedeEnviar({ puntaje })) return { ok: false, motivo: "sin-puntaje" };
  if (!cliente) return { ok: false, motivo: "sin-conexion" };
  const envio = vale ?? nuevoVale();

  try {
    const { data, error } = await cliente.rpc("enviar_opinion", {
      p_puntaje: puntaje,
      p_texto: null,
      /* Igual que en la hoja del sitio: no se guarda quién la mandó. */
      p_anonimo: true,
      p_temas: [],
      p_origen: "actividad",
      p_dispositivo: dispositivoDe(ancho),
      p_actividad: actividadId ?? null,
      p_materia: materiaId ?? null,
      p_envio: envio,
    });
    if (error) return { ok: false, motivo: "error", detalle: error.message };
    if (data === false) return { ok: false, motivo: "repetida" };
    return { ok: true, vale: envio };
  } catch (e) {
    return { ok: false, motivo: "error", detalle: String(e?.message ?? e) };
  }
}

/*
 * Corregir la estrella ya mandada, sobre esa misma fila.
 *
 * Insertar otra contaría la actividad dos veces, así que esto UPDATEA con el
 * vale. Se puede usar varias veces: dudar dos veces es normal y la última
 * vale. Lo que no se puede es tocar la fila de otro ni una de hace tres
 * horas, y de eso se encarga 0157.
 */
export async function recalificarActividad(cliente, { vale, puntaje } = {}) {
  if (!sePuedeEnviar({ puntaje })) return { ok: false, motivo: "sin-puntaje" };
  if (!vale) return { ok: false, motivo: "sin-vale" };
  if (!cliente) return { ok: false, motivo: "sin-conexion" };

  try {
    const { data, error } = await cliente.rpc("recalificar_opinion", { p_envio: vale, p_puntaje: puntaje });
    if (error) return { ok: false, motivo: "error", detalle: error.message };
    if (data === false) return { ok: false, motivo: "caducado" };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "error", detalle: String(e?.message ?? e) };
  }
}

/* El comentario, sobre la fila que ya se mandó. */
export async function comentarActividad(cliente, { vale, texto } = {}) {
  const limpio = limpiarTexto(texto);
  if (!vale || !limpio) return { ok: false, motivo: "sin-texto" };
  if (!cliente) return { ok: false, motivo: "sin-conexion" };

  try {
    const { data, error } = await cliente.rpc("comentar_opinion", { p_envio: vale, p_texto: limpio });
    if (error) return { ok: false, motivo: "error", detalle: error.message };
    /* false = el vale caducó o esa fila ya tenía comentario. */
    if (data === false) return { ok: false, motivo: "caducado" };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "error", detalle: String(e?.message ?? e) };
  }
}
