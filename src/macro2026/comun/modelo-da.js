/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL MODELO NUMÉRICO COMÚN DE LA DEMANDA AGREGADA
 *
 * Lo usan A5, A6 y H6 (y la gráfica de H3). Especificación §0:
 *   C̄ = 100, c = 0,8, t = 0,25, TR = 50, Ī = 200, b = 10, i = 8 (%), G = 200, XN = 50
 *   Ā = C̄ + c·TR + Ī + G + XN = 590      Ā − b·i = 510
 *   pendiente = c(1 − t) = 0,6           multiplicador = 1/[1 − c(1 − t)] = 2,5
 *   Y₀ = 1.275
 * Las cifras se muestran redondeadas a entero (Y, DA) o a un decimal
 * (multiplicador), con coma decimal y punto de miles.
 *
 * `t` va como fracción (0,25) y `i` en puntos porcentuales (8): así lo escribe
 * la ficha (b·i = 10 × 8 = 80).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BASE = Object.freeze({ Cbar: 100, c: 0.8, t: 0.25, TR: 50, Ibar: 200, b: 10, i: 8, G: 200, XN: 50 });

export const modelo = (cambios = {}) => ({ ...BASE, ...cambios });

/** Ā: el gasto autónomo. */
export const gastoAutonomo = (p) => p.Cbar + p.c * p.TR + p.Ibar + p.G + p.XN;
/** Ā − b·i: donde arranca la recta (su corte con el eje vertical). */
export const arranque = (p) => gastoAutonomo(p) - p.b * p.i;
/** c(1 − t): la inclinación de la DA. */
export const pendiente = (p) => p.c * (1 - p.t);
/** 1/[1 − c(1 − t)]. */
export const multiplicador = (p) => 1 / (1 - pendiente(p));
/** Y₀ = multiplicador × (Ā − b·i). */
export const produccion = (p) => multiplicador(p) * arranque(p);
/** La DA a una renta Y. */
export const demanda = (p, Y) => arranque(p) + pendiente(p) * Y;
/** I = Ī − b·i. */
export const inversion = (p) => p.Ibar - p.b * p.i;
/** C = C̄ + c(Y + TR − tY). */
export const consumo = (p, Y) => p.Cbar + p.c * (Y + p.TR - p.t * Y);
export const rentaDisponible = (Y, TR, t) => Y + TR - t * Y;

/** Los ecos del multiplicador: gasto, gasto·k, gasto·k², … (k = c(1 − t)). */
export function ecos(p, gasto = 100, n = 12) {
  const k = pendiente(p);
  return Array.from({ length: n }, (_, j) => gasto * k ** j);
}

/* ─── Formato: coma decimal y punto de miles, sin depender de Intl ───────── */
/* (es-CO en Intl no agrupa los números de cuatro cifras: daría «1275»). */
function miles(entero) {
  const s = String(Math.abs(entero));
  const partes = [];
  for (let k = s.length; k > 0; k -= 3) partes.unshift(s.slice(Math.max(0, k - 3), k));
  return (entero < 0 ? "−" : "") + partes.join(".");
}

export const fmtEntero = (x) => miles(Math.round(x));

export function fmtDecimal(x, decimales = 1) {
  const f = 10 ** decimales;
  const r = Math.round(x * f) / f;
  const entero = Math.trunc(r);
  const frac = Math.round(Math.abs(r - entero) * f);
  const signo = r < 0 && entero === 0 ? "−" : "";
  return `${signo}${miles(entero)},${String(frac).padStart(decimales, "0")}`;
}

/** Un decimal solo si hace falta: 21,6 · 100 · 2,5. */
export function fmtCorto(x, decimales = 1) {
  const f = 10 ** decimales;
  const r = Math.round(x * f) / f;
  return Number.isInteger(r) ? fmtEntero(r) : fmtDecimal(r, decimales);
}

export const fmtPct = (fraccion) => `${fmtCorto(fraccion * 100)} %`;

/* ─── H6 · Lleva la economía a la meta ─────────────────────────────────── */

export const TOLERANCIA_H6 = 25;
export const FIJAR_MAX_H6 = 3;

/*
 * Cada etapa mueve UNA palanca sobre el modelo común. `valor` está en las
 * unidades del deslizador: G en pesos, t en % entero, i en puntos (paso 0,5).
 * `aModelo` lo convierte al cambio del modelo. `solucion` es adonde se anima
 * la palanca tras el tercer «Fijar» fallido.
 */
export const ETAPAS_H6 = [
  {
    id: "e1", nombre: "Reactivar", palanca: "Gasto público G", unidad: "",
    min: 100, max: 400, paso: 10, inicio: 200, meta: 1400, solucion: 250,
    aModelo: (v) => ({ G: v }),
    contexto: "La economía está fría. Solo puedes mover el gasto.",
    arriba: "Te pasaste: baja G; cada peso se multiplica por 2,5.",
    abajo: "Falta: sube G; cada peso de gasto rinde 2,5.",
    pista: "Faltan 125 de producción. Divide entre 2,5.",
    subtemas: ["da-multiplicador", "da-grafica", "da-gasto-publico"],
  },
  {
    id: "e2", nombre: "Reactivar sin gastar", palanca: "Tasa t", unidad: " %",
    min: 10, max: 40, paso: 1, inicio: 25, meta: 1400, solucion: 20,
    aModelo: (v) => ({ G: 200, t: v / 100 }),
    contexto: "Sin más gasto. Solo puedes mover el impuesto.",
    arriba: "Te pasaste: sube un poco el impuesto.",
    abajo: "Falta: baja el impuesto; deja más renta disponible.",
    pista: "Busca un impuesto cercano al 20 %.",
    subtemas: ["da-multiplicador", "da-grafica", "da-consumo"],
  },
  {
    id: "e3", nombre: "Enfriar", palanca: "Tasa de interés i", unidad: " %",
    min: 2, max: 16, paso: 0.5, inicio: 8, meta: 1150, solucion: 13,
    aModelo: (v) => ({ G: 200, t: 0.25, i: v }),
    contexto: "Ahora sobra demanda. Solo puedes mover la tasa.",
    /* En E3 «arriba» es Y₀ por encima de la meta: la economía sigue caliente. */
    arriba: "Aún está caliente: sube más la tasa.",
    abajo: "Enfriaste de más: baja un poco la tasa.",
    pista: "Cada punto de tasa quita 25 de producción.",
    subtemas: ["da-multiplicador", "da-grafica", "da-inversion"],
  },
];

export const produccionH6 = (etapa, valor) => produccion(modelo(etapa.aModelo(valor)));

/** El juicio de un «Fijar»: dentro, arriba o abajo de la meta. */
export function juzgarH6(etapa, valor) {
  const y = produccionH6(etapa, valor);
  const d = y - etapa.meta;
  if (Math.abs(d) <= TOLERANCIA_H6) return { estado: "dentro", y };
  return { estado: d > 0 ? "arriba" : "abajo", y };
}
