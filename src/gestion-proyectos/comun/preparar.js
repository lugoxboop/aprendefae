/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · DE LOS TEXTOS A LA PARTIDA (puro, sin React)
 *
 * Cada pieza de ../introduccion/textos.js y ../entorno/textos.js es una lista
 * de etapas. Aquí cada etapa se convierte en sus PASOS de esta partida, con
 * el sorteo y el orden aleatorio de cada intento (regla común §0 del diseño:
 * orden aleatorio salvo donde se dice «progresivo», y ahí se sortea dentro de
 * cada nivel). Las pruebas fijan `rng` con conSemilla.
 *
 * Tipos de etapa (cada uno lo pinta un motor de ./motores/):
 *   clasificar  un banco de ítems, los mismos destinos; partida según `partida`.
 *   micros      pasos sueltos en orden (preguntas, grupos de ítems, ordenar).
 *   emparejar   rieles y etiquetas (H06); un ítem por riel.
 *   memorando   frases con y sin error (H13).
 *   dilema      decisiones encadenadas sin clave (H14, exploratorio).
 *   dial        exploración libre y reto (H17).
 *
 * Un paso «decidir» = { tipo, id, texto, contexto?, consigna?, destinos,
 * clave, retros | retro, retroComun?, subtemas }: un ítem que se lleva a un
 * destino. Es la mecánica de casi todo: clasificar en cinta, sellar, conectar
 * clavijas, tirar de una palanca o apostar «termina / sigue».
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { barajar, sortear } from "../../macro2026/comun/azar.js";

/* La retro que se lee al soltar `item` en `destino` (que no es su clave). */
export function retroDe(paso, destino) {
  const propia = paso.retros?.[destino] ?? paso.retro ?? null;
  return [paso.retroComun, propia].filter(Boolean).join(" ") || null;
}

const decidir = (item, etapa, base = {}) => ({
  tipo: "decidir",
  ...base,
  ...item,
  destinos: item.destinos ?? base.destinos ?? etapa.destinos,
  subtemas: item.subtemas ?? base.subtemas ?? null,
});

/*
 * Lote 2 (caps. 3 y 4): `cubrir` = que cada clave del banco salga al menos
 * una vez (o `minPorClave` veces); `pares` = n pares (ítems con el mismo
 * `par`) y nunca los dos de un par seguidos; `ordenarPorNivel` = tras el
 * sorteo, primero los de nivel 1 (los obvios). El sorteo se repite con el
 * mismo rng hasta cumplir: sigue siendo reproducible con semilla.
 */
const cuentaPorClave = (lista) => lista.reduce((m, x) => ({ ...m, [x.clave]: (m[x.clave] ?? 0) + 1 }), {});
function cumpleCobertura(lista, banco, p) {
  if (!p.cubrir && !p.minPorClave) return true;
  const min = p.minPorClave ?? 1;
  const n = cuentaPorClave(lista);
  return [...new Set(banco.map((x) => x.clave))].every((c) => (n[c] ?? 0) >= min);
}
const sinParesSeguidos = (lista) => lista.every((x, k) => k === 0 || !x.par || x.par !== lista[k - 1].par);
export function sortearCubriendo(items, n, rng = Math.random, p = { cubrir: true }) {
  let sale = sortear(items, n, rng);
  for (let k = 0; k < 400 && !cumpleCobertura(sale, items, p); k += 1) sale = sortear(items, n, rng);
  return sale;
}

/* Los ítems de un banco que entran en esta partida, en su orden de juego. */
export function partidaDe(etapa, rng = Math.random) {
  const p = etapa.partida ?? { todas: true };
  const banco = etapa.banco;
  if (p.cubrir || p.minPorClave || p.pares || p.ordenarPorNivel) {
    const base = { ...p, cubrir: false, minPorClave: undefined, pares: undefined, ordenarPorNivel: false };
    if (p.pares) {
      const ids = [...new Set(banco.map((x) => x.par))];
      const elegidos = new Set(sortear(ids, p.pares, rng));
      let sale = barajar(banco.filter((x) => elegidos.has(x.par)), rng);
      for (let k = 0; k < 400 && !sinParesSeguidos(sale); k += 1) sale = barajar(sale, rng);
      return sale;
    }
    let sale = partidaDe({ ...etapa, partida: base }, rng);
    for (let k = 0; k < 400 && !cumpleCobertura(sale, banco, p); k += 1) sale = partidaDe({ ...etapa, partida: base }, rng);
    if (p.ordenarPorNivel) sale = [...sale].sort((a, b) => (a.nivel ?? 1) - (b.nivel ?? 1));
    return sale;
  }
  if (p.porNivel) {
    return Object.keys(p.porNivel).sort().flatMap((nivel) =>
      sortear(banco.filter((x) => String(x.nivel) === String(nivel)), p.porNivel[nivel], rng));
  }
  if (p.porClave) {
    const claves = [...new Set(banco.map((x) => x.clave))];
    const cuantas = (c) => (typeof p.porClave === "number" ? p.porClave : p.porClave[c] ?? 0);
    return barajar(claves.flatMap((c) => sortear(banco.filter((x) => x.clave === c), cuantas(c), rng)), rng);
  }
  if (p.rondasPorClave) {
    /* H18: tantas rondas como ítems por clave; en cada ronda, uno de cada clave. */
    const claves = [...new Set(banco.map((x) => x.clave))];
    const porClave = claves.map((c) => barajar(banco.filter((x) => x.clave === c), rng));
    const rondas = [];
    for (let r = 0; r < p.rondasPorClave; r += 1) rondas.push(...barajar(porClave.map((l) => l[r]).filter(Boolean), rng));
    return rondas;
  }
  if (p.enOrden) {
    /* Progresiva sin niveles: n del banco, sin la final, en el orden del banco. */
    const resto = banco.filter((x) => x.id !== p.final);
    const elegidos = new Set(sortear(resto, p.enOrden, rng).map((x) => x.id));
    const final = banco.find((x) => x.id === p.final);
    return [...resto.filter((x) => elegidos.has(x.id)), ...(final ? [final] : [])];
  }
  if (p.n) {
    const fijos = (p.siempre ?? []).map((id) => banco.find((x) => x.id === id));
    const final = p.final ? banco.find((x) => x.id === p.final) : null;
    const resto = banco.filter((x) => x.id !== p.final && !(p.siempre ?? []).includes(x.id));
    return [...barajar([...fijos, ...sortear(resto, p.n, rng)], rng), ...(final ? [final] : [])];
  }
  return barajar(banco, rng);
}

/* Los destinos de un paso, barajados si el paso lo pide. */
const conDestinos = (paso, rng) => (paso.barajar && paso.destinos ? { ...paso, destinos: barajar(paso.destinos, rng) } : paso);

function pasosDeMicros(etapa, rng) {
  const pasos = [];
  for (const m of etapa.pasos) {
    if (m.tipo === "ordenar") { pasos.push(ordenarDe(m, rng)); continue; }
    if (m.items) {
      const elegidos = m.sortear ? (m.cubrir ? sortearCubriendo(m.items, m.sortear, rng) : sortear(m.items, m.sortear, rng)) : m.barajar ? barajar(m.items, rng) : m.items;
      for (const x of elegidos) {
        pasos.push(conDestinos(decidir(x, etapa, {
          consigna: m.consigna, destinos: m.destinos, retro: m.retro, grupo: m.grupo,
          barajar: x.barajar ?? m.barajarDestinos ?? false,
        }), rng));
      }
      continue;
    }
    pasos.push(conDestinos(decidir(m, etapa), rng));
  }
  return pasos;
}

function ordenarDe(m, rng) {
  let mezcla = barajar(m.items, rng);
  /* Que nunca salga ya ordenado: no habría nada que hacer. */
  for (let k = 0; k < 6 && mezcla.every((x, i) => x.id === m.items[i].id); k += 1) mezcla = barajar(m.items, rng);
  if (mezcla.every((x, i) => x.id === m.items[i].id)) mezcla = [...m.items].reverse();
  return { ...m, tipo: "ordenar", mezcla };
}

/* Los pares vecinos de un orden, como ids de ítem: «<paso>:<a>-<b>». */
export const paresDe = (paso) => paso.items.slice(1).map((x, k) => `${paso.items[k].id}-${x.id}`);

/* Los pasos que siguen al banco de una etapa «clasificar» (uno o una lista). */
export const despuesDe = (etapa) => (etapa.despues ? [].concat(etapa.despues) : []);

/* Una etapa → { consigna, pasos }. */
export function prepararEtapa(etapa, rng = Math.random) {
  switch (etapa.tipo) {
    case "clasificar": {
      const pasos = partidaDe(etapa, rng).map((x) => decidir(x, etapa));
      /* `despues`: un paso o (lote 2) una lista de pasos, en orden. */
      for (const d of despuesDe(etapa)) pasos.push(d.tipo === "ordenar" ? ordenarDe(d, rng) : conDestinos(decidir(d, etapa), rng));
      return { consigna: etapa.consigna, pasos };
    }
    case "micros":
      return { consigna: etapa.consigna, pasos: pasosDeMicros(etapa, rng) };
    case "emparejar":
      return { consigna: etapa.consigna, pasos: [{ ...etapa, tipo: "emparejar", id: "rieles", rieles: barajar(etapa.rieles, rng), etiquetas: barajar(etapa.etiquetas, rng) }] };
    case "memorando": {
      const con = sortear(etapa.frases.filter((f) => f.error), etapa.partida.conError, rng);
      const sin = sortear(etapa.frases.filter((f) => !f.error), etapa.partida.correctas, rng);
      const frases = barajar([...con, ...sin], rng).map((f) => (f.error ? { ...f, opciones: barajar([{ texto: f.buena, buena: true }, ...f.malas], rng) } : f));
      return { consigna: etapa.consigna, pasos: [{ ...etapa, tipo: "memorando", id: "memorando", frases }] };
    }
    case "dilema":
      return { consigna: etapa.consigna, pasos: [{ ...etapa, tipo: "dilema", id: "dilema" }] };
    case "dial":
      return { consigna: etapa.consigna, pasos: [{ ...etapa, tipo: "dial", id: "dial", retos: barajar(etapa.banco, rng) }] };
    default:
      throw new Error(`etapa sin tipo conocido: ${etapa.tipo}`);
  }
}

export const prepararPieza = (pieza, rng = Math.random) => pieza.etapas.map((e) => prepararEtapa(e, rng));

/* Cuántos ítems puntúa un paso (la base del porcentaje). */
export function itemsDePaso(paso) {
  if (paso.tipo === "decidir") return 1;
  if (paso.tipo === "emparejar") return paso.rieles.length;
  if (paso.tipo === "ordenar") return paso.puntuaPares ? paso.items.length - 1 : 1;
  if (paso.tipo === "memorando") return paso.partida.conError;
  if (paso.tipo === "dial") return paso.retos.length;
  return 0;
}

/*
 * Todos los ids de ítem que una pieza puede mandar en su `detalle`, con el
 * texto con que el panel docente los nombra. La regla de etiqueta
 * (../etiquetas.js) y la prueba salen de aquí: un solo recorrido.
 */
export function itemsDePieza(pieza) {
  const out = {};
  const ponDecidir = (x) => { out[x.id] = x.texto ?? [x.contexto, x.consigna].filter(Boolean).join(" "); };
  const ponOrden = (m) => {
    const t = (id) => m.items.find((x) => x.id === id).texto;
    for (const p of paresDe(m)) { const [a, b] = p.split("-"); out[`${m.id}:${p}`] = `Orden: ${t(a)} → ${t(b)}`; }
  };
  for (const e of pieza.etapas) {
    if (e.tipo === "clasificar") {
      for (const x of e.banco) out[x.id] = x.texto;
      for (const d of despuesDe(e)) {
        if (d.tipo === "ordenar") ponOrden(d);
        else ponDecidir(d);
      }
    } else if (e.tipo === "micros") {
      for (const m of e.pasos) {
        if (m.tipo === "ordenar") ponOrden(m);
        else if (m.items) for (const x of m.items) out[x.id] = x.texto;
        else ponDecidir(m);
      }
    } else if (e.tipo === "emparejar") {
      for (const r of e.rieles) out[r.id] = `Línea de tiempo ${r.letra} (${e.etiquetas.find((x) => x.id === r.clave).nombre})`;
    } else if (e.tipo === "memorando") {
      for (const f of e.frases) out[f.id] = f.texto;
    } else if (e.tipo === "dilema") {
      for (const p of e.pasos) for (const o of p.opciones) out[`${p.id}:${o.id}`] = `${p.titulo}: ${o.texto}`;
    } else if (e.tipo === "dial") {
      for (const x of e.banco) out[x.id] = x.texto;
    }
  }
  return out;
}
