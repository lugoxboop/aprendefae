import { ASIENTOS_MATE, COMUNES_MATE, ORDEN_DEL_CALCULO, R5_3 } from "./repasoCap5MateTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 «Marzo en Comercializadora Mate» — la lógica, sin React (Célula E).
 *
 *   evaluarMate(a, renglones)   califica por renglón y arma la devolución
 *   puedeRevisarMate(renglones) cada lado con al menos un renglón (Itagaki §3)
 *   sumasDe(renglones)          las sumas y el cuadre (informan, no bloquean)
 *   puntuarR5_3(aciertos)       aciertos / 8 × 100 (evaluativa: el motor escala)
 *   unidadDeR5_3(id)            el texto de cada asiento para el panel docente
 *
 * LA CALIFICACIÓN (Itagaki §4): un renglón es correcto si en el asiento
 * correcto existe el mismo lado, la misma cuenta y el mismo valor; el orden
 * dentro de cada lado no cuenta; sobrante, repetido o con otro valor es
 * incorrecto. El asiento es acierto solo si coincide exacto.
 *
 * LA DEVOLUCIÓN (decisión 4 de Kamogawa). Cada problema se clasifica por su
 * prioridad: (1) lado cruzado, (2) cuenta equivocada o que sobra, (3) falta un
 * renglón, (4) valor equivocado, (5) genérica. Con varios, salen los textos
 * de los dos primeros en el orden del cálculo (Compras o Ingresos, IVA,
 * retención, Caja, proveedor o cliente) y, si hay más, «Y hay más renglones
 * por revisar.». Dos textos idénticos se muestran una sola vez.
 *
 * Cómo se juntan prioridad y orden del cálculo (lectura de Ippo, anotada en el
 * PR): los problemas de forma (1 a 3) van antes que los de valor (4), porque
 * «la ausencia causa los demás errores»; dentro de cada grupo, el orden del
 * cálculo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOTAL_R5_3 = ASIENTOS_MATE.length;
export const MAXIMO_POR_LADO = 3;

export const puedeRevisarMate = (renglones) =>
  renglones.some((r) => r.lado === "debe") && renglones.some((r) => r.lado === "haber");

export function sumasDe(renglones) {
  const suma = (l) => renglones.filter((r) => r.lado === l).reduce((s, r) => s + (Number(r.valor) || 0), 0);
  const debe = suma("debe");
  const haber = suma("haber");
  return { debe, haber, cuadran: debe === haber && debe > 0, diferencia: Math.abs(debe - haber) };
}

const rango = (cuenta) => ORDEN_DEL_CALCULO[cuenta] ?? 0;
const GRUPO = { cruzado: 0, sobra: 0, cuenta: 0, falta: 0, valor: 1 };

/* Las cuentas que el asiento admite en alguna de sus variantes (el flete del 15: decisión 8). */
const cuentasDelAsiento = (a) => new Set(a.correctos.flat().map((c) => c.cuenta));

function contra(a, correcto, renglones) {
  const usados = new Set();
  const estados = Object.fromEntries(renglones.map((r) => [r.id, "mal"]));
  const problemas = [];
  const pendientes = [];

  /* 1. Los renglones exactos. */
  for (const c of correcto) {
    const r = renglones.find((x) => !usados.has(x.id) && x.lado === c.lado && x.cuenta === c.cuenta && x.valor === c.valor);
    if (r) { usados.add(r.id); estados[r.id] = "ok"; } else pendientes.push(c);
  }
  /* 2. Lo que falta del asiento correcto: con otro valor, cruzado o ausente. */
  for (const c of pendientes) {
    const mismoLado = renglones.find((x) => !usados.has(x.id) && x.cuenta === c.cuenta && x.lado === c.lado);
    const otroLado = renglones.find((x) => !usados.has(x.id) && x.cuenta === c.cuenta && x.lado !== c.lado);
    if (mismoLado) {
      usados.add(mismoLado.id);
      const previsto = a.valorMal.find((v) => v.cuenta === c.cuenta && v.valor === mismoLado.valor);
      problemas.push({ clase: "valor", cuenta: c.cuenta, lado: c.lado, texto: previsto ? previsto.texto : a.generica });
    } else if (otroLado) {
      usados.add(otroLado.id);
      problemas.push({ clase: "cruzado", cuenta: c.cuenta, lado: otroLado.lado, texto: a.cruzado[c.cuenta] ?? a.generica });
    } else {
      problemas.push({ clase: "falta", cuenta: c.cuenta, lado: c.lado, texto: a.falta[c.cuenta] ?? a.generica });
    }
  }
  /* 3. Lo que el estudiante puso de más. */
  const admitidas = cuentasDelAsiento(a);
  for (const r of renglones) {
    if (usados.has(r.id)) continue;
    if (admitidas.has(r.cuenta)) {
      /* Una cuenta del asiento repetida, o la otra variante del flete mezclada: sobra. */
      problemas.push({ clase: "sobra", cuenta: r.cuenta, lado: r.lado, texto: a.generica });
    } else {
      problemas.push({ clase: "cuenta", cuenta: r.cuenta, lado: r.lado, texto: a.cuentaMal[r.cuenta] ?? COMUNES_MATE.cuentaNoPrevista });
    }
  }
  const ok = problemas.length === 0 && renglones.length === correcto.length;
  return { ok, estados, problemas };
}

/* Los textos de la devolución, con la regla de la decisión 4. */
export function textosDe(problemas) {
  const ordenados = problemas
    .map((p, k) => ({ ...p, k }))
    .sort((x, y) => GRUPO[x.clase] - GRUPO[y.clase] || rango(x.cuenta) - rango(y.cuenta) || (x.lado === y.lado ? 0 : x.lado === "debe" ? -1 : 1) || x.k - y.k);
  const distintos = [...new Set(ordenados.map((p) => p.texto))];
  const textos = distintos.slice(0, 2);
  if (distintos.length > 2) textos.push(COMUNES_MATE.hayMas);
  return textos;
}

export function evaluarMate(a, renglones) {
  const intentos = a.correctos.map((correcto, variante) => ({ variante, ...contra(a, correcto, renglones) }));
  /* La variante que acierta; si ninguna, la de menos problemas (a igualdad, la primera). */
  const elegida = intentos.find((x) => x.ok) ?? [...intentos].sort((x, y) => x.problemas.length - y.problemas.length || x.variante - y.variante)[0];
  const textos = elegida.ok ? [a.acierto[elegida.variante]] : textosDe(elegida.problemas);
  return { ok: elegida.ok, variante: elegida.variante, estados: elegida.estados, problemas: elegida.problemas, textos, correcto: a.correctos[elegida.variante] };
}

export const puntuarR5_3 = (aciertos, total = TOTAL_R5_3) => (total ? (aciertos / total) * 100 : 0);

/* El panel docente: cada asiento por su fecha y su operación. */
export function unidadDeR5_3(id) {
  const a = ASIENTOS_MATE.find((x) => x.id === String(id));
  return a ? `${a.dia} MAR · ${a.operacion}` : null;
}

export { R5_3 };
