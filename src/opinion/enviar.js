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
