/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CAJAS SORPRESA (28-nov).
 *
 * Tres cajas, compradas con los mismos Cristales de la tienda. Cada una suelta
 * UN cosmético de las cajas (src/mascota/cosmeticos-caja.js). Qué rareza sale
 * lo decide el SERVIDOR (caja_abrir, migración 0178) con estas probabilidades,
 * y el cliente solo anima el resultado: nadie puede elegir lo que le sale
 * tocando el navegador.
 *
 * Las probabilidades van en «por mil» para que sumen exacto y se puedan
 * escribir igual en SQL. Se enseñan en la tienda tal cual, en porcentaje:
 * una caja sorpresa con las probabilidades escondidas es una trampa.
 *
 * Si sale algo que ya tienes, no se pierde: se te devuelven Cristales según
 * su rareza (REEMBOLSO).
 *
 * Todo esto está también en la 0178; cajas.test.mjs lee la migración y falla
 * si los dos lados se separan.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { supabase } from "../lib/supabase.js";
import { motivoDeError, SIN_CONFIGURAR } from "../cristales/cristales.js";
import { COSMETICOS_CAJA, RAREZAS_CAJA, cosmeticosDeRareza } from "../mascota/cosmeticos-caja.js";

const COSMETICO_RAREZA = Object.fromEntries(COSMETICOS_CAJA.map((c) => [c.id, c.rareza]));

export const CAJAS = [
  {
    id: "normal", nombre: "Caja Normal", precio: 40, rgb: "79,156,255",
    lema: "Para empezar la colección",
    probabilidades: { normal: 700, raro: 220, epico: 65, legendario: 13, elite: 2 },
  },
  {
    id: "rara", nombre: "Caja Rara", precio: 90, rgb: "181,108,255",
    lema: "Más Raros y Épicos",
    probabilidades: { normal: 350, raro: 400, epico: 180, legendario: 60, elite: 10 },
  },
  {
    id: "legendaria", nombre: "Caja Legendaria", precio: 180, rgb: "255,190,60",
    lema: "Nada Normal: de Raro para arriba",
    probabilidades: { normal: 0, raro: 350, epico: 400, legendario: 200, elite: 50 },
  },
];
export const CAJA = Object.fromEntries(CAJAS.map((c) => [c.id, c]));

/* Lo que se devuelve si sale repetido, en Cristales. */
export const REEMBOLSO = { normal: 8, raro: 18, epico: 40, legendario: 90, elite: 150 };

/** La probabilidad de una rareza en una caja, en porcentaje legible («6,5 %»). */
export function porcentaje(cajaId, rareza) {
  const pm = CAJA[cajaId]?.probabilidades[rareza] ?? 0;
  const v = pm / 10;
  return `${String(v).replace(".", ",")} %`;
}

/** Cuántos cosméticos de cada rareza puede soltar una caja (las de 0 ‰ no). */
export function contenidoDe(cajaId) {
  const c = CAJA[cajaId];
  return RAREZAS_CAJA.filter((r) => c.probabilidades[r.id] > 0).map((r) => ({ ...r, cosmeticos: cosmeticosDeRareza(r.id) }));
}

/*
 * LA TIRA DE LA RULETA. Una fila larga de cosméticos que pasa de derecha a
 * izquierda y frena con el premio justo bajo la marca. El premio va en la
 * posición `GANADOR`; el resto se sortea con las MISMAS probabilidades de la
 * caja (así la tira enseña lo que de verdad suele salir) y con una semilla,
 * para que la prueba y el video den la misma tira.
 */
export const LARGO_TIRA = 48;
export const GANADOR = 40;

function rngDe(semilla) {
  let s = (semilla >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function rarezaAlAzar(cajaId, azar) {
  const pr = CAJA[cajaId].probabilidades;
  let t = azar() * 1000;
  for (const r of RAREZAS_CAJA) {
    t -= pr[r.id];
    if (t < 0) return r.id;
  }
  return RAREZAS_CAJA.filter((r) => pr[r.id] > 0).at(-1).id;
}

export function tiraDeRuleta(cajaId, ganadorId, semilla = 7) {
  const azar = rngDe(semilla);
  const tira = [];
  for (let i = 0; i < LARGO_TIRA; i++) {
    if (i === GANADOR) { tira.push(ganadorId); continue; }
    const lista = cosmeticosDeRareza(rarezaAlAzar(cajaId, azar));
    tira.push(lista[Math.floor(azar() * lista.length)].id);
  }
  /* Un «casi» justo después del premio, como en las ruletas de verdad: la
     emoción está en lo que pasó de largo. Si el premio no es Élite, al lado
     queda uno de rareza alta. */
  const alto = COSMETICOS_CAJA.filter((c) => c.rareza === "legendario" || c.rareza === "elite");
  tira[GANADOR + 1] = alto[Math.floor(azar() * alto.length)].id;
  /* Sin dos cartas iguales seguidas (el premio repetido al lado se veía raro). */
  for (let i = 1; i < tira.length; i++) {
    if (tira[i] !== tira[i - 1]) continue;
    const j = i === GANADOR ? i - 1 : i;
    const lista = COSMETICOS_CAJA.filter((c) => c.rareza === COSMETICO_RAREZA[tira[j]] && c.id !== tira[j] && c.id !== tira[j - 1] && c.id !== tira[j + 1]);
    if (lista.length) tira[j] = lista[Math.floor(azar() * lista.length)].id;
  }
  return tira;
}

/** Los cosméticos de caja que este perfil ya tiene. */
export function coleccionDe(perfil) {
  const tiene = new Set(Array.isArray(perfil?.mascota_accesorios) ? perfil.mascota_accesorios : []);
  return COSMETICOS_CAJA.filter((c) => tiene.has(c.id)).map((c) => c.id);
}

/*
 * Abrir una caja: el servidor cobra, sortea, guarda y responde. Devuelve
 * { perfil, cosmetico, rareza, repetido, reembolso } o { error }.
 */
export async function abrirCaja(cajaId) {
  if (!supabase) return { error: SIN_CONFIGURAR };
  const { data, error } = await supabase.rpc("caja_abrir", { p_caja: cajaId });
  if (error) {
    console.error("[aprendeFAE] Abrir caja:", error.code ?? "", error.message);
    return { error: motivoDeError(error, "abrir la caja") };
  }
  const r = Array.isArray(data) ? data[0] : data;
  return {
    perfil: r?.perfil ?? null,
    cosmetico: r?.cosmetico ?? null,
    rareza: r?.rareza ?? null,
    repetido: Boolean(r?.repetido),
    reembolso: r?.reembolso ?? 0,
  };
}
