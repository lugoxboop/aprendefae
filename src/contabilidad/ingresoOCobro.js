import {
  ACT1_T3, GRUPOS, HECHOS_ACT1_T3, ERRORES_ACT1_T3, ERRORES_SEGUNDA_ACT1_T3,
} from "../data/contabilidadTema3Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 1 · ¿INGRESO O COBRO? — el sorteo, la evaluación y el puntaje.
 *
 * ═══════════ EL SORTEO: TRES DE CADA GRUPO ═══════════
 *
 * Once hechos, nueve por tanda. Sin estratificar, una tanda podría traer un
 * solo hecho del grupo 2 y el error C casi no saldría. Con tres por grupo
 * los tres caminos de error son alcanzables siempre. El grupo 2 tiene
 * exactamente tres, así que sale entero en cada tanda.
 *
 * ═══════════ QUÉ ERROR TOCA ═══════════
 *
 * Lo decide dónde iba DE VERDAD y dónde lo puso, no una hipótesis:
 *   A · era ingreso (grupo 1 o 2) y lo puso en el 3
 *   B · no era ingreso (grupo 3) y lo puso en el 1 o el 2
 *   C · era ingreso y confundió el 1 con el 2
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const grupoPorId = (id) => GRUPOS.find((g) => g.id === id) ?? null;

export function sortearAct1T3(barajar, porGrupo = ACT1_T3.porGrupo) {
  const elegidos = GRUPOS.flatMap((g) => {
    const lista = HECHOS_ACT1_T3.filter((h) => h.grupo === g.id);
    if (lista.length < porGrupo) throw new Error(`el grupo «${g.rotulo}» tiene ${lista.length} hechos y hacen falta ${porGrupo}`);
    return barajar(lista).slice(0, porGrupo);
  });
  return barajar(elegidos);
}

export function patronDeError(hecho, puesto) {
  const era = grupoPorId(hecho.grupo);
  const fue = grupoPorId(puesto);
  if (!era || !fue || era.id === fue.id) return null;
  if (era.esIngreso && !fue.esIngreso) return "A";
  if (!era.esIngreso) return "B";
  return "C";
}

/* Las marcas ✅ y ❌ van delante del texto de Gen, como en el resto de Contabilidad. */
export function evaluarAct1T3(hecho, puesto) {
  if (puesto === hecho.grupo) return { ok: true, texto: `✅ ${hecho.acierto}`, patron: null };
  const patron = patronDeError(hecho, puesto);
  return { ok: false, texto: `❌ ${ERRORES_ACT1_T3[patron]}`, patron };
}

/*
 * La segunda decisión: solo los hechos del grupo 3 (los que llevan `queEs`),
 * después de acertar el grupo. Un toque, un intento.
 */
export const tieneSegunda = (hecho) => Boolean(hecho?.queEs);

export function evaluarSegundaAct1T3(hecho, elegida) {
  const ok = elegida === hecho.queEs;
  return { ok, correcta: hecho.queEs, error: ok ? null : ERRORES_SEGUNDA_ACT1_T3[hecho.queEs][elegida] };
}

/*
 * El primer intento vale 1; el reintento, la mitad. Como en T1-6 y en el Tema 2.
 * En un hecho con segunda decisión, el hecho cuenta solo si las dos son
 * correctas, sin puntos parciales (Yujiro): con la segunda mal (`segundaOk`
 * falso), vale 0.
 */
export const VALOR_SEGUNDO = 0.5;

export function puntuarAct1T3(respuestas, cuantas) {
  if (!cuantas) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.segundaOk === false) return s;
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / cuantas) * 100;
}

export const pesoDeCadaHecho = (cuantas) => (cuantas ? 100 / cuantas : 0);

/* Para el panel docente: el hecho de un id, con su empresa delante. */
export const hechoDeItem = (id) => {
  const h = HECHOS_ACT1_T3.find((x) => x.id === id);
  return h ? `${h.empresa} · ${h.texto}` : null;
};
