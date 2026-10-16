/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 «Las capas que la venta corta» · LA CUENTA DE LAS CAPAS.
 *
 * Lo mismo que hace `calcular()` en el código de referencia de la v6 del
 * Patrón de enganche C (orquestador/conocimiento/paquetes/
 * patron-enganche-c-v6.html, pieza 4), sin DOM: los diez estados de la pila
 * para cada método. Estado 0 = 1 feb (inventario inicial); estado k = después
 * del movimiento k. Cada estado trae sus capas (de la más antigua a la más
 * nueva), lo que sale ese día y el movimiento.
 *
 *   · PEPS corta por abajo (la capa más antigua primero)
 *   · UEPS corta por arriba (la última que entró primero)
 *   · promedio: no hay capas; cada compra se funde con lo que hay, y la venta
 *     sale al costo promedio de ese día
 *
 * Y el formato de las cifras de la v6: miles con punto; «≈» y dos decimales
 * solo si el costo no es entero (C3 de Mello). Sin `toLocaleString`, para
 * que no dependa del navegador; una prueba lo compara con el de la v6.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const METODOS_CAPAS = ["peps", "ueps", "promedio"];

/* inicial: { f, u, c } · movs: [{ f, compra: [u, c] } | { f, venta: u }] */
export function calcularCapas(inicial, movs, metodo) {
  const out = [];
  let capas = [{ id: inicial.f, f: inicial.f, u: inicial.u, c: inicial.c, t: inicial.u * inicial.c }];
  out.push({ capas: capas.map((x) => ({ ...x })), sale: [], mov: { f: inicial.f, inicial: true } });
  for (const m of movs) {
    let sale = [];
    if (m.compra) {
      const [u, c] = m.compra;
      if (metodo === "promedio") {
        const a = capas[0];
        const t = a.t + u * c;
        const n = a.u + u;
        capas = [{ id: "prom", f: m.f, u: n, c: t / n, t }];
      } else capas = capas.concat([{ id: m.f, f: m.f, u, c, t: u * c }]);
    } else {
      let falta = m.venta;
      if (metodo === "promedio") {
        const a = capas[0];
        const pu = a.t / a.u;
        sale = [{ f: a.f, u: falta, c: pu }];
        capas = [{ ...a, u: a.u - falta, t: a.t - falta * pu }];
      } else {
        const orden = metodo === "peps" ? capas.map((_, i) => i) : capas.map((_, i) => capas.length - 1 - i);
        const nuevas = capas.map((x) => ({ ...x }));
        for (const i of orden) {
          if (!falta) break;
          const k = Math.min(falta, nuevas[i].u);
          nuevas[i].u -= k;
          nuevas[i].t = nuevas[i].u * nuevas[i].c;
          falta -= k;
          sale.push({ f: nuevas[i].f, u: k, c: nuevas[i].c });
        }
        capas = nuevas.filter((x) => x.u > 0);
      }
    }
    out.push({ capas: capas.map((x) => ({ ...x })), sale, mov: m });
  }
  return out;
}

/* ═══════════ LAS CIFRAS ═══════════ */

const miles = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const n0 = (v) => miles(String(Math.round(v)));
export const n2 = (v) => {
  const [e, d] = Math.abs(v).toFixed(2).split(".");
  return `${v < 0 ? "-" : ""}${miles(e)},${d}`;
};
/* C3 (Mello): «≈» y dos decimales solo si el costo no es entero. */
export const esEntero = (c) => Math.abs(c - Math.round(c)) < 1e-9;
/* Entre «≈» y la cifra va un espacio duro (\u00a0), como en la v6: no se parten. */
export const costo = (c) => (esEntero(c) ? `$${n0(c)}` : `≈\u00a0$${n2(c)}`);

/* La ficha del día: «6 feb · Vende 4.500». */
export const movTxt = (m) => (m.inicial ? `${m.f} · Inventario inicial` : m.compra ? `${m.f} · Compra ${n0(m.compra[0])} a $${n0(m.compra[1])}` : `${m.f} · Vende ${n0(m.venta)}`);

/* Cada parte de «Salen …»: «4.500 × $1.300». */
export const salePartes = (sale) => sale.map((x) => `${n0(x.u)} × ${costo(x.c)}`);

/* El número de una capa: «5.200 × $1.300», o «0 · 4.500 vendidas» cuando la venta la agota. */
export const numCapa = (x, viejo) => (x.u ? `${n0(x.u)} × ${costo(x.c)}` : `0 · ${n0(viejo.u)} vendidas`);
