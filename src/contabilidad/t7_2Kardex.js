/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · EL KÁRDEX EN EL PERMANENTE — el cálculo, sin React (Célula C).
 *
 *   kardex(inicial, movimientos, metodo)   el kárdex fecha por fecha, como lo
 *        lleva el libro (pp. 238-241): en cada fecha, la entrada o la salida
 *        con sus capas, y el saldo con las suyas. Cada capa es
 *        [cantidad, costo unitario, costo total].
 *
 *   PEPS   salen primero las capas más antiguas que hay ESE DÍA
 *   UEPS   salen primero las más nuevas que hay ese día
 *   PROMEDIO  el costo unitario se calcula otra vez con cada compra: valor
 *          del saldo ÷ unidades. Los totales se calculan sin redondear, como
 *          en el libro, y se muestran redondeados al peso; el costo unitario
 *          se muestra con dos decimales
 *
 * Lo usan las pruebas de A3 y A4 para recalcular cada kárdex desde los datos
 * de Near; la pantalla muestra los datos, no este cálculo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PEPS = "peps";
export const UEPS_M = "ueps";
export const PROMEDIO = "promedio";

const r2 = (x) => Math.round(x * 100) / 100;

/* movimientos: [{ fecha, compra: [cantidad, costo] } | { fecha, venta: cantidad }] */
export function kardex(inicial, movimientos, metodo) {
  const filas = [];
  if (metodo === PROMEDIO) {
    let q = inicial[0];
    let v = inicial[0] * inicial[1];
    filas.push({ fecha: inicial.fecha, saldo: [[q, inicial[1], v]] });
    for (const m of movimientos) {
      if (m.compra) {
        const [cq, cc] = m.compra;
        q += cq; v += cq * cc;
        filas.push({ fecha: m.fecha, entrada: [[cq, cc, cq * cc]], saldo: [[q, r2(v / q), Math.round(v)]] });
      } else {
        const cu = v / q;
        const sale = m.venta * cu;
        q -= m.venta; v -= sale;
        filas.push({ fecha: m.fecha, salida: [[m.venta, r2(cu), Math.round(sale)]], saldo: [[q, r2(cu), Math.round(v)]] });
      }
    }
    return filas;
  }
  let capas = [[inicial[0], inicial[1]]];
  const conTotal = (cs) => cs.map(([cq, cc]) => [cq, cc, cq * cc]);
  filas.push({ fecha: inicial.fecha, saldo: conTotal(capas) });
  for (const m of movimientos) {
    if (m.compra) {
      capas = [...capas, [...m.compra]];
      filas.push({ fecha: m.fecha, entrada: conTotal([m.compra]), saldo: conTotal(capas) });
      continue;
    }
    let falta = m.venta;
    const salida = [];
    const orden = metodo === PEPS ? capas.map((_, k) => k) : capas.map((_, k) => capas.length - 1 - k);
    const quedan = capas.map((c) => [...c]);
    for (const k of orden) {
      if (!falta) break;
      const toma = Math.min(falta, quedan[k][0]);
      if (!toma) continue;
      salida.push([toma, quedan[k][1]]);
      quedan[k][0] -= toma;
      falta -= toma;
    }
    if (falta) throw new Error(`${m.fecha}: no hay unidades para vender`);
    capas = quedan.filter((c) => c[0] > 0);
    filas.push({ fecha: m.fecha, salida: conTotal(salida), saldo: conTotal(capas) });
  }
  return filas;
}

const suma = (capas) => capas.reduce((s, c) => s + c[2], 0);

/* Lo que se vendió en el mes (costo de lo vendido) y lo que queda. */
export function resumenKardex(filas) {
  return { vendido: filas.reduce((s, f) => s + (f.salida ? suma(f.salida) : 0), 0), final: suma(filas.at(-1).saldo) };
}

/* Las cifras con el formato del libro: miles con punto y, si hace falta, dos decimales con coma. */
export function cifraK(n) {
  const [ent, dec] = n.toFixed(2).split(".");
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec === "00" ? miles : `${miles},${dec}`;
}
