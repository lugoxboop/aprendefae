import { NIVELES_COMPRABLES, estadoDeNivel } from "../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PUNTO DE LA TIENDA: cuándo hay algo NUEVO que ya se puede pagar.
 *
 * La regla, tal como la fijó Xeno: el punto sale cuando existe al menos un
 * nivel de avatar sin comprar cuyo precio ya cubre el saldo. Sin número, sin
 * animación. Y desaparece la próxima vez que el estudiante entra a la Tienda.
 *
 * ═══════════ POR QUÉ SE GUARDA UN CONJUNTO Y NO UNA FECHA ═══════════
 *
 * «Ya la visité» no basta. Si se guardara solo la última visita, el punto se
 * apagaría para siempre en cuanto entrara una vez, y el día que juntara para el
 * nivel IV —que es la novedad que más importa— no habría nada que avisara.
 *
 * Y guardar solo el saldo tampoco: el saldo baja al comprar, así que volvería a
 * subir por debajo de un umbral ya visto y el punto reaparecería sin novedad.
 *
 * Se guarda QUÉ NIVELES eran alcanzables la última vez que entró. Hay punto si
 * hoy es alcanzable alguno que entonces no lo era. Con eso:
 *
 *   · junta para el II, no ha entrado          → punto
 *   · entra, no compra nada                    → sin punto (ya lo vio)
 *   · sigue jugando y junta para el III        → punto otra vez
 *   · compra el III y el II sigue alcanzable   → sin punto (el II ya lo vio)
 *
 * ═══════════ EL ALMACENAMIENTO ES POR CUENTA Y PUEDE NO ESTAR ═══════════
 *
 * La clave lleva el id de usuario: dos cuentas en el mismo navegador no se
 * pisan el punto. Y todo lector y escritor va en try/catch: en una ventana
 * privada localStorage lanza, y un adorno que no se puede recordar no puede
 * tumbar la cabecera del sitio. Sin memoria, el punto sale — que es el lado
 * seguro: avisar de más es ruido, avisar de menos es esconder la Tienda.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PREFIJO = "fae:tienda-vistos:";

export const claveDe = (usuarioId) => `${PREFIJO}${usuarioId ?? "anonimo"}`;

/**
 * Los niveles que HOY puede comprar y todavía no ha comprado.
 * Función pura: se le pasa la fila del perfil y devuelve números, en orden.
 */
export function alcanzablesAhora(perfil) {
  return NIVELES_COMPRABLES.filter((n) => estadoDeNivel(perfil, n) === "alcanzable");
}

/**
 * ¿Hay algo alcanzable que no estuviera la última vez que entró?
 *
 * @param {number[]} ahora   los de alcanzablesAhora()
 * @param {number[]|null} vistos  los guardados; null = nunca entró
 */
export function hayNovedad(ahora, vistos) {
  if (!ahora || ahora.length === 0) return false;
  if (!Array.isArray(vistos)) return true; // nunca entró, y hay algo que puede pagar
  return ahora.some((n) => !vistos.includes(n));
}

/* ── la memoria del navegador, siempre a prueba de que no exista ── */

export function leerVistos(usuarioId) {
  try {
    const crudo = window.localStorage.getItem(claveDe(usuarioId));
    if (crudo === null) return null;
    const lista = JSON.parse(crudo);
    return Array.isArray(lista) ? lista.map(Number).filter(Number.isFinite) : null;
  } catch {
    return null;
  }
}

/** Se llama al ENTRAR a la Tienda: lo que hoy es alcanzable queda como visto. */
export function marcarVisitada(usuarioId, perfil) {
  try {
    window.localStorage.setItem(claveDe(usuarioId), JSON.stringify(alcanzablesAhora(perfil)));
  } catch {
    /* Sin memoria el punto seguirá saliendo. Es el lado seguro. */
  }
}

/** Lo que el menú necesita saber, de una: ¿pinto el punto? */
export function puntoDeTienda(usuarioId, perfil) {
  return hayNovedad(alcanzablesAhora(perfil), leerVistos(usuarioId));
}
