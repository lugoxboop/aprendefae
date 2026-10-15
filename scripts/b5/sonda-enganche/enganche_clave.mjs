/*
 * LA CLAVE DE LA SONDA DE ENGANCHE DE LA CÉLULA B (copia de la de D, scripts/t4/sonda-enganche).
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/sonda-enganche/enganche_clave.mjs > clave.json
 *
 * Lee del build que se mide la respuesta correcta y una equivocada de cada tarjeta, sin copiar
 * ninguna regla: las configuraciones de los Hacer (CONFIG_*) y los datos de las capas 3 y de las
 * paradas de la capa 2 de los Aprender. La equivocada se comete con el mismo gesto que la buena:
 *   · mesa (b5-t5-a2, b5-t6-a2, a3): las mismas cuentas en sus lados, con el primer valor mal;
 *   · casillas y elección (b5-t6-a4, a5, a6): otra opción de la misma tarjeta;
 *   · clasificar en dos niveles (b5-t5-a1, b5-t6-a1, a7): el otro primer nivel, dos veces.
 * Las fichas de clasificar salen de sortear: se juntan todas las que puede dar (cada id, su destino).
 */
const C = async (p, k) => (await import(new URL(`../../../src/components/mecanicas/libros/${p}`, import.meta.url)))[k];
const D = async (p) => import(new URL(`../../../src/data/${p}`, import.meta.url));

const clave = { hacer: {}, aprender: {} };

/* Mesa: { partes: { id: { bien: [[cuenta, lado, valor]...], mal: [...] } } } */
for (const [id, p, k] of [["b5-t5-a2", "tema5/CierreSantaPacha.jsx", "CONFIG_T5_ACT2"], ["b5-t6-a2", "tema6/ProvisionDeElTorito.jsx", "CONFIG_T6_ACT2"], ["b5-t6-a3", "tema6/DeudaQueVuelve.jsx", "CONFIG_T6_ACT3"]]) {
  const cfg = await C(p, k);
  clave.hacer[id] = { mecanica: "mesa", partes: Object.fromEntries(cfg.partes.map((x) => {
    const bien = x.asiento.map((e) => [e.cuenta, e.lado, e.valor]);
    const mal = bien.map((e, i) => (i === 0 ? [e[0], e[1], e[2] + 1000] : e));
    return [x.id, { bien, mal }];
  })) };
}

/* Elección (b5-t6-a4): { tarjetas: { id: { bien: opcion, mal: opcion } } } */
{
  const cfg = await C("tema6/QueSeDebita.jsx", "CONFIG_T6_ACT4");
  clave.hacer["b5-t6-a4"] = { mecanica: "eleccion", tarjetas: Object.fromEntries(cfg.banco.map((h) => [h.id, { bien: h.respuesta, mal: cfg.opciones.find((o) => o.id !== h.respuesta).id }])) };
}

/* Casillas (b5-t6-a5, a6): la opción es String(valor ?? texto), como CasillasEnOrden. */
const claveDe = (op) => String(op.valor ?? op.texto);
for (const [id, p, k] of [["b5-t6-a5", "tema6/LaCuentaDeLaProvision.jsx", "CONFIG_T6_ACT5"], ["b5-t6-a6", "tema6/ProvisionPorEdades.jsx", "CONFIG_T6_ACT6"]]) {
  const cfg = await C(p, k);
  const casillas = cfg.partes.flatMap((x) => x.casillas);
  clave.hacer[id] = { mecanica: "casillas", tarjetas: Object.fromEntries(casillas.map((c) => [c.id, { bien: claveDe(c.opciones.find((o) => o.tipo === null)), mal: claveDe(c.opciones.find((o) => o.tipo !== null)) }])) };
}

/* Clasificar en dos niveles: por ficha, su destino {n1, n2} y un primer nivel equivocado. */
const barajar = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
for (const [id, p, k] of [["b5-t5-a1", "tema5/QueRentaDa.jsx", "CONFIG_T5_ACT1"], ["b5-t6-a1", "tema6/ClientesOOtra.jsx", "CONFIG_T6_ACT1"], ["b5-t6-a7", "tema6/QueMetodoYCuando.jsx", "CONFIG_T6_ACT7"]]) {
  const cfg = await C(p, k);
  const fichas = new Map();
  for (let i = 0; i < 400; i++) for (const f of cfg.sortear(barajar)) fichas.set(f.id, f);
  clave.hacer[id] = { mecanica: "clasifica", tarjetas: Object.fromEntries([...fichas.values()].map((f) => {
    const d = cfg.destino(f);
    const otro = cfg.nivel1.find((n) => n.id !== d.n1);
    return [f.id, { bien: { n1: d.n1, n2: d.n2 ?? null }, mal: { n1: otro.id, n2: otro.id === cfg.abre ? cfg.nivel2[0].id : null } }];
  })) };
}

/* Aprender: la correcta de cada caja de la capa 3 (por su data-hecho) y de la parada de la capa 2. */
const T51 = await D("contabilidadT5Pieza1.js"), T52 = await D("contabilidadT5Pieza2.js");
const T61 = await D("contabilidadT6Pieza1.js"), T62 = await D("contabilidadT6Pieza2.js"), T63 = await D("contabilidadT6Pieza3.js"), T64 = await D("contabilidadT6Pieza4.js"), T65 = await D("contabilidadT6Pieza5.js");
const cajas = (xs) => Object.fromEntries(xs.map((x) => [x.id, x.correcta]));
clave.aprender = {
  T5A1: { cajas: cajas(T51.PAQUETES), parada: null },
  T5A3: { cajas: cajas(T52.VENTAS_T5_A2), parada: T52.PARADA_T5_A2?.correcta ?? null },
  T6A1: { cajas: cajas(T61.HECHOS_T6), parada: null },
  T6A2: { cajas: cajas(T62.METODOS_T6_A2), parada: null },
  T6A3: { cajas: cajas(T63.MOMENTOS_T6_A3), parada: T63.PARADA_T6_A3?.correcta ?? null },
  T6A4: { cajas: cajas(T64.CASOS_T6_A4), parada: T64.PARADA_T6_A4?.correcta ?? null },
  T6A5: { cajas: cajas(T65.GRUPOS_T6_A5), parada: T65.PARADA_T6_A5?.correcta ?? null },
};

process.stdout.write(JSON.stringify(clave, null, 1));
