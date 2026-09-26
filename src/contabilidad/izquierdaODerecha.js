import { ACTIVO, tipoDeCuenta, CRECE_POR } from "../data/contabilidad.js";
import { IZQUIERDA_O_DERECHA } from "../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A1 · ¿IZQUIERDA O DERECHA? — el sorteo y los dos patrones.
 *
 * ═══════════ POR QUÉ EL SORTEO NO ES LIBRE ═══════════
 *
 * Un sorteo libre de ocho sobre doce puede dar seis activos y dos pasivos. A
 * un estudiante que lea «débito» como «aumenta» eso le da un 75 % — con la
 * creencia falsa intacta y un número que le dice que va bien. El resultado
 * mentiría, y mentiría justo a quien más necesita que no le mientan.
 *
 * Estratificado 4+4, ese mismo estudiante saca exactamente 50 %. Y además el
 * reparto de sus fallos queda legible: cuatro aciertos de un bloque y cuatro
 * fallos del otro es una firma, no mala suerte. De ahí sale el mensaje de
 * cierre.
 *
 * Los dos bloques NO se leen de la posición en la lista: se derivan de
 * tipoDeCuenta. Una lista reordenada rompería la estratificación en silencio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const esDeActivo = (item) => tipoDeCuenta(item.cuenta) === ACTIVO;

/** Los dos bloques del sorteo: activos, y pasivo + patrimonio. */
export function estratos(items = IZQUIERDA_O_DERECHA.items) {
  return {
    activo: items.filter(esDeActivo),
    otras: items.filter((i) => !esDeActivo(i)),
  };
}

/**
 * Cuatro de cada bloque, mezclados. `barajar` entra por parámetro para poder
 * medir el reparto sin depender del azar.
 */
export function sortearEstratificado(barajar, items = IZQUIERDA_O_DERECHA.items, porPartida = IZQUIERDA_O_DERECHA.porPartida) {
  const mitad = porPartida / 2;
  const { activo, otras } = estratos(items);
  if (activo.length < mitad || otras.length < mitad) {
    throw new Error(`el banco no alcanza para ${mitad} de cada bloque: ${activo.length} activos, ${otras.length} de pasivo/patrimonio`);
  }
  return barajar([...barajar(activo).slice(0, mitad), ...barajar(otras).slice(0, mitad)]);
}

/** El lado por el que crece la cuenta del ítem: es donde va su ▲. */
export const ladoDelTriangulo = (item) => CRECE_POR[tipoDeCuenta(item.cuenta)] ?? null;

/*
 * El patrón lo decide LA FAMILIA, no una hipótesis sobre lo que el estudiante
 * pensaba. Con dos lados cualquier fallo es «el otro»; lo único que se sabe de
 * cierto es de qué familia era la cuenta, y eso es lo que hay que explicarle.
 */
export function evaluarItem(item, puesta) {
  const ok = puesta === item.categoria;
  if (ok) return { ok, texto: item.acierto, patron: null };
  const patron = esDeActivo(item) ? "A" : "B";
  return { ok, texto: patron === "A" ? IZQUIERDA_O_DERECHA.errorA : IZQUIERDA_O_DERECHA.errorB, patron };
}

/*
 * ═══════════ EL MENSAJE DE CIERRE, Y CUÁNDO CALLA ═══════════
 *
 * Solo cuando el patrón entero lo dice: los cuatro de activo bien Y los cuatro
 * de pasivo/patrimonio mal. Cualquier otro reparto no es esa firma, y decirle
 * «estás leyendo débito como aumenta» a quien falló tres sueltos sería
 * inventarle un diagnóstico.
 *
 * Se mira el PRIMER intento de cada ítem: el segundo ya se responde con el ▲
 * a la vista, así que acertar entonces no dice nada sobre la creencia.
 */
export function mensajeDeCierre(respuestas) {
  const deActivo = respuestas.filter((r) => r.esActivo);
  const otras = respuestas.filter((r) => !r.esActivo);
  if (deActivo.length === 0 || otras.length === 0) return null;
  const todosBien = deActivo.every((r) => r.primeroOk);
  const todosMal = otras.every((r) => !r.primeroOk);
  return todosBien && todosMal ? IZQUIERDA_O_DERECHA.errorC : null;
}

/*
 * El segundo intento vale la mitad. Un reintento y no más: el ▲ ya está a la
 * vista, así que un tercero sería copiar lo que hay en pantalla.
 */
export const VALOR_PRIMERO = 1;
export const VALOR_SEGUNDO = 0.5;

export function puntuar(respuestas, porPartida = IZQUIERDA_O_DERECHA.porPartida) {
  if (porPartida === 0) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + VALOR_PRIMERO;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / porPartida) * 100;
}
