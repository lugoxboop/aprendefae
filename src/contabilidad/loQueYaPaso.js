import {
  DIAS, POR_DIA, SAN_CALIXTO_P3, SAN_MIGUEL_P3, SEGMENTOS_P3, CIERRE_P3, ALTERNATIVOS_P3,
} from "../data/contabilidadTema3Pieza3.js";
import { MARCAS, RESULTADOS, CAJA } from "../data/contabilidadTema3.js";
import { contadores, palabras } from "./dosLineas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · «LO QUE YA PASÓ Y NO SE HA PAGADO» — el estado, calculado.
 *
 * Igual que en la pieza 1, la capa 2 es una función del paso (1 a 9) y la
 * capa 3 una función de la empresa elegida y de la fase de su animación.
 * Devuelven la misma forma que el estado de la pieza 1 —marcas, pistas,
 * contadores— más lo propio de esta pieza: el calendario de cinco días, el
 * corte del cierre, el retardo y el modo del escenario (líneas, asiento o
 * espejo). DosLineas pinta las dos cosas.
 *
 * Los contadores salen de las marcas: cinco días a $500. San Calixto termina
 * en Gastos $2.500 y San Miguel en Ingresos $2.500; Entró y Salió, en $0.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS_P3 = 9;
export const LINEAS = "lineas";
export const ASIENTO = "asiento";
export const ESPEJO = "espejo";

/* Las cinco marcas de una empresa, una por día. */
export const marcasDeEmpresa = (empresa, actual) => DIAS.map((dia, i) => ({
  tipo: empresa.marca, monto: POR_DIA, columna: i, hecho: `${empresa.id}-${dia}`,
  pista: MARCAS[empresa.marca].pista, actual,
}));

const REPOSO = { [RESULTADOS]: "reposo", [CAJA]: "reposo" };
const ARRIBA_ACTIVA = { [RESULTADOS]: "activa", [CAJA]: "quieta" };
const QUIETAS = { [RESULTADOS]: "quieta", [CAJA]: "quieta" };

const CALENDARIO_VACIO = { regla: false, corchete: false, corte: false, retardo: false };

/**
 * El estado del paso `paso` (1 a 9):
 *
 *   1  las dos líneas vacías; ranuras a la vista, regla oculta
 *   2  la regla con los cinco días y el corchete «$500 por día»
 *   3  caen los cinco gastos de San Calixto: arriba activa, caja quieta
 *   4  las marcas se apagan, baja el corte, aparece el retardo
 *   5  modo asiento de San Calixto
 *   6  San Miguel, en cero; regla, corchete y corte se quedan
 *   7  caen los cinco ingresos de San Miguel
 *   8  modo asiento de San Miguel
 *   9  el espejo
 */
export function estadoPasoP3(paso) {
  const p = Math.min(PASOS_P3, Math.max(1, Math.trunc(paso) || 1));
  const enSanMiguel = p >= 6;
  const empresa = enSanMiguel ? SAN_MIGUEL_P3 : SAN_CALIXTO_P3;

  let marcas = [];
  if (p === 3) marcas = marcasDeEmpresa(SAN_CALIXTO_P3, true);
  if (p === 4 || p === 5) marcas = marcasDeEmpresa(SAN_CALIXTO_P3, false);
  if (p === 7) marcas = marcasDeEmpresa(SAN_MIGUEL_P3, true);
  if (p === 8) marcas = marcasDeEmpresa(SAN_MIGUEL_P3, false);

  const pistas = p === 3 || p === 7 ? ARRIBA_ACTIVA : p === 4 ? QUIETAS : REPOSO;
  const calendario = p === 1 ? CALENDARIO_VACIO : {
    regla: true,
    corchete: true,
    corte: p >= 4,
    retardo: p === 4,
  };

  return {
    paso: p,
    empresa,
    columnas: DIAS.length,
    columnaActual: null,
    hecho: null,
    marcas,
    pistas,
    contadores: contadores(marcas),
    resaltados: [],
    calendario,
    modo: p === 5 || p === 8 ? ASIENTO : p === 9 ? ESPEJO : LINEAS,
    asiento: p === 5 || p === 8 ? empresa.asiento : null,
    /* El nombre resaltado al entrar San Miguel, como el reinicio de la pieza 1. */
    recienCambiada: p === 6,
    textos: [p === PASOS_P3 ? CIERRE_P3 : SEGMENTOS_P3[p - 1]],
    alternativo: ALTERNATIVOS_P3[p] ?? null,
  };
}

/* ═══════════ CAPA 3 ═══════════ */

/*
 * Las fases de la animación de una empresa en la capa 3. La final es la que
 * queda, y la que sale de una vez con movimiento reducido.
 */
export const FASES = ["vacio", "marcas", "corte", "retardo", "asiento"];
export const FASE_FINAL = "asiento";

/**
 * La capa 3: sin empresa, el calendario con regla y corte, carriles vacíos y
 * contadores en $0. Con empresa, lo que su fase ya alcanzó; el asiento va
 * debajo de las líneas, no en su lugar.
 */
export function estadoCapa3P3(empresa = null, fase = FASE_FINAL) {
  const k = FASES.indexOf(fase);
  const llego = (f) => empresa !== null && k >= FASES.indexOf(f);
  const marcas = llego("marcas") ? marcasDeEmpresa(empresa, !llego("corte")) : [];
  return {
    empresa: empresa ?? SAN_CALIXTO_P3,
    elegida: empresa?.id ?? null,
    columnas: DIAS.length,
    columnaActual: null,
    hecho: null,
    marcas,
    pistas: llego("marcas") && !llego("corte") ? ARRIBA_ACTIVA : REPOSO,
    contadores: contadores(marcas),
    resaltados: [],
    calendario: {
      regla: true,
      corchete: true,
      corte: true,
      retardo: llego("retardo") && empresa.id === SAN_CALIXTO_P3.id,
    },
    modo: LINEAS,
    asiento: llego("asiento") ? empresa.asiento : null,
  };
}

/* ═══════════ TIEMPOS ═══════════ */

/** 3 000 ms + 450 ms por palabra del texto del paso (Xeno, igual que la pieza 1). */
export const duracionPasoP3 = (estado) => 3000 + 450 * palabras(estado.textos.join(" "));

/* La cascada de las cinco marcas: 140 ms entre una y otra, 460 ms cada una (B2). */
export const ESCALON_MARCA = 140;
export const MS_MARCA = 460;
export const MS_CASCADA = ESCALON_MARCA * (DIAS.length - 1) + MS_MARCA;
