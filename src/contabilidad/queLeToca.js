import {
  ITEMS_ACT6, ERROR_POR_CASO, CASO_A, CASO_B, CASO_C, CASO_D, MESES, MESES_CORTOS, ANIO,
} from "../data/contabilidadTema3Act6.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 6 · ¿QUÉ LE TOCA A ESTE PERIODO? — la evaluación y el corte.
 *
 * Un solo intento por ítem; las cifras se comparan exactas. El orden manda
 * (Xeno, aprobado por Levi): A → acierto → C → D → B. Con error, primero el
 * texto del caso y después el acierto del ítem, como en la actividad 2.
 *
 * Si el corte está mal y las cifras son las del ítem, solo el corte se marca
 * como error: los campos quedan como acierto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function evaluarAct6(item, { corte, alPeriodo, queda }) {
  const corteOk = corte === item.corte;
  const campos = { alPeriodo: alPeriodo === item.alPeriodo, queda: queda === item.queda };
  const cifrasOk = campos.alPeriodo && campos.queda;
  let caso = null;
  if (!corteOk) caso = CASO_A;
  else if (cifrasOk) caso = null;
  else if (alPeriodo === item.queda && queda === item.alPeriodo) caso = CASO_C;
  else if (alPeriodo + queda !== item.total) caso = CASO_D;
  else caso = CASO_B;
  const ok = caso === null;
  return { ok, caso, corteOk, campos, textos: ok ? [item.acierto] : [ERROR_POR_CASO[caso], item.acierto] };
}

/* Un ítem bien al primer intento vale 1. */
export function puntuarAct6(respuestas, cuantos) {
  if (!cuantos) return 0;
  return (respuestas.filter((r) => r.ok).length / cuantos) * 100;
}

/* ═══════════ EL CORTE ═══════════ */

/* De 1 a N−1 meses: el corte nunca cae en los bordes. */
export const rangoCorte = (item) => ({ min: 1, max: item.meses - 1 });
export const acotar = (item, k) => Math.min(item.meses - 1, Math.max(1, k));

/* El mes (0–11) en que termina el corte k: el corte k cae al final del mes k. */
export const mesDelCorte = (item, k) => (item.inicio + k - 1) % 12;
export const mesLargoDelCorte = (item, k) => MESES[mesDelCorte(item, k)];
export const mesCortoDelCorte = (item, k) => MESES_CORTOS[mesDelCorte(item, k)];

/*
 * El teclado del slider (Xeno, §7): flechas = 1 mes; Re Pág y Av Pág = 12;
 * Inicio y Fin. Sin corte, se parte de 0. Devuelve null si la tecla no es suya.
 */
export function corteConTecla(item, corte, tecla) {
  const k = corte ?? 0;
  switch (tecla) {
    case "ArrowRight": case "ArrowUp": return acotar(item, k + 1);
    case "ArrowLeft": case "ArrowDown": return acotar(item, k - 1);
    case "PageUp": return acotar(item, k + 12);
    case "PageDown": return acotar(item, k - 12);
    case "Home": return 1;
    case "End": return item.meses - 1;
    default: return null;
  }
}

/* El corte más cercano a una posición x (px) sobre un carril de `ancho` px. */
export const corteEnX = (item, x, ancho) => acotar(item, Math.round((x / ancho) * item.meses));

/*
 * ═══════════ ETIQUETAS Y MARCAS, SEGÚN EL ANCHO DE LA CELDA (Xeno, §3) ═══════════
 *
 *   ≥ 56 px                       nombre completo     cada mes
 *   30 a 55 px                    3 letras            cada mes
 *   < 30 px, hasta 12 meses       3 letras, cada 3    cada mes
 *   más de 12 meses               «Año 1» … «Año 5»   cada 12 meses (más gruesa)
 *
 * Devuelve las etiquetas como { desde, hasta, texto } en meses (la etiqueta
 * se centra en su tramo) y las marcas como { en, gruesa } en meses.
 */
export const TOQUE_MINIMO = 44;
export function rotulosDeBarra(item, ancho) {
  const n = item.meses;
  const celda = ancho / n;
  if (n > 12) {
    const anios = Math.ceil(n / 12);
    return {
      celda, porAnios: true,
      etiquetas: Array.from({ length: anios }, (_, a) => ({ desde: a * 12, hasta: Math.min(n, (a + 1) * 12), texto: ANIO(a + 1) })),
      marcas: Array.from({ length: anios - 1 }, (_, a) => ({ en: (a + 1) * 12, gruesa: true })),
    };
  }
  const nombre = (i) => (celda >= 56 ? MESES : MESES_CORTOS)[(item.inicio + i) % 12];
  const cada = celda < 30 ? 3 : 1;
  return {
    celda, porAnios: false,
    etiquetas: Array.from({ length: n }, (_, i) => i).filter((i) => i % cada === 0)
      .map((i) => ({ desde: i, hasta: i + 1, texto: nombre(i) })),
    marcas: Array.from({ length: n - 1 }, (_, i) => ({ en: i + 1, gruesa: false })),
  };
}
/* El toque directo sobre una celda solo vale si la celda mide 44 px o más. */
export const tocableDirecto = (item, ancho) => ancho / item.meses >= TOQUE_MINIMO;

/* ═══════════ LOS CAMPOS ═══════════ */

/* Solo dígitos, máximo 7, sin ceros a la izquierda; punto de miles automático. */
export const MAX_DIGITOS = 7;
export function formatearCampo(texto) {
  const digitos = String(texto ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITOS);
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export const valorDeCampo = (texto) => {
  const d = String(texto ?? "").replace(/\D/g, "");
  return d === "" ? null : Number(d);
};
export const pesos = (n) => `$${formatearCampo(String(n))}`;

/* Para el panel docente: el hecho de un id, con su empresa delante. */
export const hechoDeItem = (id) => {
  const it = ITEMS_ACT6.find((x) => x.id === id);
  return it ? `${it.empresa} · ${it.hecho}` : null;
};
