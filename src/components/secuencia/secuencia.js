/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA SECUENCIA DE UN APRENDER — las reglas, sin React.
 *
 * Especificación: orquestador/conocimiento/prompts/aprender-secuencia-v1.md
 * (Ukyo, 23-oct-2026). Aquí vive todo lo que se puede decidir sin pintar:
 * a qué pantalla lleva «Siguiente», qué dice cada contador, cuándo espera un
 * Haz y si una pieza cumple la forma. SecuenciaAprender.jsx solo lo pinta.
 *
 * ═══════════ QUÉ ENTREGA UNA CÉLULA ═══════════
 *
 *   pieza    = { id, pantallas: [pantalla, …] }          4 a 10 pantallas
 *   pantalla = {
 *     id,                      estable: es la clave de lo guardado en la pestaña
 *     tipo,                    "apertura" · "miralo" · "haz" · "cierre" (lista cerrada, §3.2)
 *     titular,                 la idea, una frase, máx. 10 palabras (§3.3)
 *     apoyo?,                  1 o 2 frases (máx. 25 palabras como objetivo)
 *     Figura,                  componente: ({ estado, setEstado, paso, primeraVez, reducido }) → <figure> viva
 *     Mensaje?,                componente con las mismas props, FUERA de la figura (#549): el veredicto,
 *                              la pista y la consecuencia de un Haz. Crece sin mover el hueco de la figura.
 *     nombreFigura,            nombre accesible del <figure>; nunca contiene la respuesta (D9)
 *     estadoInicial?,          lo que la figura recuerda; tiene que ser JSON (se guarda en la pestaña)
 *     pasos?,                  cuántos pasos da «Siguiente» dentro de la pantalla (máx. 5)
 *     rotulosPaso?,            lo que revela cada paso, para el lector de pantalla
 *     resuelta?(estado),       solo Haz: true con la primera respuesta válida
 *     razon?,                  solo Haz: por qué «Siguiente» espera (la escribe contenido, D11)
 *     fase?,                   para sobrescribir la cejilla; casi nunca hace falta
 *   }
 *
 * El contenido ya aprobado NO se reescribe para caber aquí (§14.4): se reparte
 * en pantallas y contenido solo AÑADE titular, razón y cejilla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TIPOS = ["apertura", "miralo", "haz", "cierre"];

/* Los nombres de fase de CuatroCapas, literales y sin numerar (§3.1). */
export const FASES = {
  apertura: "Primero, los nombres",
  miralo: "Mírelo funcionar",
  haz: "Ahora pruebe usted",
  cierre: "En una frase",
};

/* Los literales de los botones (§5.3). */
export const LITERAL = {
  anterior: "Anterior",
  siguiente: "Siguiente",
  siguientePieza: "Siguiente pieza",
  irAHacer: "Ir a Hacer",
  volverAlTema: "Volver al tema",
};

/* Límites de la forma (§3.1 y §3.3). */
export const MIN_PANTALLAS = 4;
export const MAX_PANTALLAS = 10;
export const MAX_PASOS = 5;
export const MAX_PALABRAS_TITULAR = 10;
export const MAX_PALABRAS_PANTALLA = 60;

export const palabras = (texto) => (typeof texto === "string" ? texto.trim().split(/\s+/).filter(Boolean).length : 0);

export const claveDe = (pieza, pantalla) => `${pieza.id}/${pantalla.id}`;

/** El estado de la secuencia al entrar por primera vez a un tema. */
export function estadoInicial(piezas) {
  const estados = {};
  for (const pieza of piezas) {
    for (const pantalla of pieza.pantallas) {
      estados[claveDe(pieza, pantalla)] = pantalla.estadoInicial ?? null;
    }
  }
  return { p: 0, s: 0, pasos: {}, estados, resueltas: [] };
}

/** Si lo guardado sirve para estas piezas: mismas piezas, mismas pantallas. Si no, se empieza de cero. */
export function guardadoValido(guardado, piezas) {
  if (!guardado || typeof guardado !== "object") return false;
  const { p, s, pasos, estados, resueltas } = guardado;
  if (!Number.isInteger(p) || !Number.isInteger(s) || p < 0 || p >= piezas.length) return false;
  if (s < 0 || s >= piezas[p].pantallas.length) return false;
  if (!pasos || typeof pasos !== "object" || !estados || typeof estados !== "object" || !Array.isArray(resueltas)) return false;
  const claves = new Set(piezas.flatMap((pz) => pz.pantallas.map((pt) => claveDe(pz, pt))));
  return Object.keys(estados).length === claves.size && Object.keys(estados).every((k) => claves.has(k));
}

export const pantallaActual = (estado, piezas) => piezas[estado.p].pantallas[estado.s];

export const pasosDados = (estado, piezas) => estado.pasos[claveDe(piezas[estado.p], pantallaActual(estado, piezas))] ?? 0;

export const pasosTotales = (pantalla) => Math.min(Math.max(0, pantalla.pasos | 0), MAX_PASOS);

/** Si la pantalla actual es un Haz que todavía espera su primera respuesta válida. */
export function esperaRespuesta(estado, piezas) {
  const pieza = piezas[estado.p];
  const pantalla = pantallaActual(estado, piezas);
  if (pantalla.tipo !== "haz") return false;
  const clave = claveDe(pieza, pantalla);
  /* Una pantalla Haz ya resuelta no se vuelve a bloquear (§5.2). */
  if (estado.resueltas.includes(clave)) return false;
  return !pantalla.resuelta?.(estado.estados[clave]);
}

const esUltimaPantalla = (estado, piezas) => estado.s === piezas[estado.p].pantallas.length - 1;
const esUltimaPieza = (estado, piezas) => estado.p === piezas.length - 1;

/**
 * Qué hará «Siguiente» ahora mismo:
 *   "paso"      da el siguiente paso de la pantalla (§5.1.1)
 *   "pantalla"  pasa a la pantalla siguiente
 *   "pieza"     pasa a la primera pantalla de la pieza siguiente («Siguiente pieza»)
 *   "final"     último cierre del tema: «Ir a Hacer» o «Volver al tema»
 *   "espera"    Haz sin respuesta válida: apagado, con su razón (§5.1.3)
 */
export function queHaceSiguiente(estado, piezas) {
  if (pasosDados(estado, piezas) < pasosTotales(pantallaActual(estado, piezas))) return "paso";
  if (esperaRespuesta(estado, piezas)) return "espera";
  if (!esUltimaPantalla(estado, piezas)) return "pantalla";
  if (!esUltimaPieza(estado, piezas)) return "pieza";
  return "final";
}

/** El literal del botón de avanzar en este momento. */
export function literalSiguiente(estado, piezas, final) {
  switch (queHaceSiguiente(estado, piezas)) {
    case "pieza": return LITERAL.siguientePieza;
    case "final": return final === "hacer" ? LITERAL.irAHacer : LITERAL.volverAlTema;
    default: return LITERAL.siguiente;
  }
}

/** El estado después de «Siguiente». En "espera" y "final" no cambia: el final lo resuelve la vista. */
export function avanzar(estado, piezas) {
  const accion = queHaceSiguiente(estado, piezas);
  const pieza = piezas[estado.p];
  const clave = claveDe(pieza, pantallaActual(estado, piezas));
  switch (accion) {
    case "paso":
      return { ...estado, pasos: { ...estado.pasos, [clave]: pasosDados(estado, piezas) + 1 } };
    case "pantalla":
      return { ...estado, s: estado.s + 1 };
    case "pieza":
      return { ...estado, p: estado.p + 1, s: 0 };
    default:
      return estado;
  }
}

/** Si «Anterior» puede hacer algo: solo está apagado en la primera pantalla de la primera pieza. */
export const puedeRetroceder = (estado) => estado.p > 0 || estado.s > 0;

/** «Anterior»: vuelve sin deshacer nada; desde la primera pantalla de una pieza, al cierre de la anterior (§3.5). */
export function retroceder(estado, piezas) {
  if (estado.s > 0) return { ...estado, s: estado.s - 1 };
  if (estado.p > 0) return { ...estado, p: estado.p - 1, s: piezas[estado.p - 1].pantallas.length - 1 };
  return estado;
}

/** Guarda lo que la figura cambió; si con eso un Haz queda resuelto, queda resuelto para siempre. */
export function cambiarFigura(estado, piezas, valor) {
  const pieza = piezas[estado.p];
  const pantalla = pantallaActual(estado, piezas);
  const clave = claveDe(pieza, pantalla);
  const anterior = estado.estados[clave];
  const nuevo = typeof valor === "function" ? valor(anterior) : valor;
  const resueltas = pantalla.tipo === "haz" && !estado.resueltas.includes(clave) && pantalla.resuelta?.(nuevo)
    ? [...estado.resueltas, clave]
    : estado.resueltas;
  return { ...estado, estados: { ...estado.estados, [clave]: nuevo }, resueltas };
}

/*
 * ═══════════ EL HAZ CALIFICADO (§3.2 y regla C2 de enganche.md) ═══════════
 *
 * Primer error → pista. Segundo error → el estado correcto con su porqué, y
 * «Siguiente» se libera. Un acierto libera en el acto. La figura guarda esto
 * en su estado con responderHaz y declara `resuelta: hazResuelto`.
 */
export const HAZ_INICIAL = { intentos: 0, ok: false, ultimo: null };

export function responderHaz(estado, correcto) {
  const e = estado ?? HAZ_INICIAL;
  if (e.ok || e.intentos >= 2) return e; // ya resuelto: no se califica dos veces
  return { intentos: e.intentos + 1, ok: Boolean(correcto), ultimo: correcto ? "acierto" : "error" };
}

export const hazResuelto = (estado) => Boolean(estado?.ok) || (estado?.intentos ?? 0) >= 2;

/** Si toca enseñar el estado correcto con su porqué: dos errores y ningún acierto. */
export const mostrarCorrecto = (estado) => !estado?.ok && (estado?.intentos ?? 0) >= 2;

/*
 * ═══════════ LA FORMA DE UNA PIEZA (§1, «la entrega falla si…») ═══════════
 *
 * Devuelve la lista de faltas; vacía = cumple. La usan las pruebas de cada
 * célula sobre sus piezas: la vista no lanza, porque una falta de forma no
 * puede tumbar la página de un estudiante.
 */
export function faltasDePieza(pieza) {
  const faltas = [];
  const pts = pieza?.pantallas ?? [];
  const n = pts.length;
  if (!pieza?.id) faltas.push("la pieza no tiene id");
  if (n < MIN_PANTALLAS || n > MAX_PANTALLAS) faltas.push(`${n} pantallas: van de ${MIN_PANTALLAS} a ${MAX_PANTALLAS}; si pide más, se parte en dos piezas`);
  const ids = new Set();
  pts.forEach((pt, k) => {
    const donde = `pantalla ${k + 1}${pt?.id ? ` (${pt.id})` : ""}`;
    if (!pt?.id) faltas.push(`${donde}: sin id`);
    else if (ids.has(pt.id)) faltas.push(`${donde}: id repetido`);
    ids.add(pt?.id);
    if (!TIPOS.includes(pt?.tipo)) faltas.push(`${donde}: tipo «${pt?.tipo}» fuera de la lista cerrada`);
    if (!pt?.titular) faltas.push(`${donde}: sin titular`);
    if (palabras(pt?.titular) > MAX_PALABRAS_TITULAR) faltas.push(`${donde}: el titular pasa de ${MAX_PALABRAS_TITULAR} palabras`);
    if (palabras(pt?.titular) + palabras(pt?.apoyo) + palabras(pt?.razon) > MAX_PALABRAS_PANTALLA) faltas.push(`${donde}: más de ${MAX_PALABRAS_PANTALLA} palabras (B2)`);
    if (typeof pt?.Figura !== "function") faltas.push(`${donde}: sin figura (una pantalla de puro texto no existe)`);
    if (!pt?.nombreFigura) faltas.push(`${donde}: la figura no tiene nombre accesible`);
    if ((pt?.pasos | 0) > MAX_PASOS) faltas.push(`${donde}: más de ${MAX_PASOS} pasos; se parte la pieza`);
    if (pt?.tipo === "haz") {
      if (typeof pt.resuelta !== "function") faltas.push(`${donde}: un Haz necesita resuelta(estado)`);
      if (!pt.razon) faltas.push(`${donde}: un Haz necesita la razón por la que «Siguiente» espera (D11)`);
    }
  });
  if (n > 0 && pts[0]?.tipo !== "apertura") faltas.push("la primera pantalla tiene que ser la apertura");
  if (n > 0 && pts[n - 1]?.tipo !== "cierre") faltas.push("la última pantalla tiene que ser el cierre");
  const aperturas = pts.filter((pt) => pt?.tipo === "apertura").length;
  if (aperturas > 2) faltas.push(`${aperturas} pantallas de apertura: van 1 o 2`);
  if (pts.filter((pt) => pt?.tipo === "cierre").length !== 1) faltas.push("va exactamente un cierre");
  const activas = pts.filter((pt) => pt?.tipo === "miralo" || pt?.tipo === "haz").length;
  if (activas * 2 < n) faltas.push(`solo ${activas} de ${n} pantallas son Míralo o Haz: tiene que ser al menos la mitad (B3)`);
  if (!pts.some((pt) => pt?.tipo === "haz")) faltas.push("el desarrollo termina con al menos una pantalla Haz");
  return faltas;
}
