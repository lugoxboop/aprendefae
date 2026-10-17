/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 21 · LA CAPA 2 CON UN GESTO POR PIEZA: «LA FICHA QUE ENTRA» (P2 de
 * Mai, 16-oct). Una sola mecánica para T5 A1, T6 A1, T6 A2, T6 A4 y T6 A5.
 *
 * Gesto: tocar la ficha (o la fila) que nombra el paso; entra en su sitio
 * del modelo y el modelo avanza. Sin error: cada paso tiene un solo blanco.
 * Todo se ancla al TEXTO del paso, no a su número (las piezas de main se
 * fundieron y renumeraron): `ancla` es un fragmento literal del paso.
 *
 * Por pieza (data/fichasQueEntran.js):
 *   · fichas: { id, texto, aparece (ancla), queda? }; `queda`: la ficha vive
 *     dentro de una celda del modelo y no sale al tocarla;
 *   · gestos: { ancla, ficha, sitio?, entra?, aparecen? }: al hacerlo, la
 *     ficha sale de su origen (salvo `queda`), lo nuevo entra en `sitio` y,
 *     si las hay, aparecen otras fichas;
 *   · entradas: { ancla, sitio, entra }: lo que entra sin gesto.
 * Un gesto de un paso pasado está hecho (no se pasa sin hacerlo); el del paso
 * abierto, si está en `hechos` (MaquinaPegada lo guarda por `pasoGesto`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function crearFichas(todos, pieza) {
  const pasoDe = (ancla) => {
    const k = todos.findIndex((p) => p.texto.includes(ancla));
    if (k < 0) throw new Error(`fichaQueEntra: ningún paso dice «${ancla}»`);
    return k + 1;
  };
  const CIERRE = todos.length;
  const gestos = pieza.gestos.map((g) => ({ ...g, paso: pasoDe(g.ancla) }));
  const entradas = (pieza.entradas ?? []).map((e) => ({ ...e, paso: e.ancla ? pasoDe(e.ancla) : CIERRE }));
  const aparece = Object.fromEntries(pieza.fichas.map((f) => [f.id, f.aparece ? pasoDe(f.aparece) : null]));
  /* El modelo entero puede aparecer en un paso (`modelo.desde`); antes reserva su sitio, invisible. */
  const modeloDesde = pieza.modelo.desde ? pasoDe(pieza.modelo.desde) : 1;

  function estado(paso, hechos = new Set()) {
    const n = Math.min(CIERRE, Math.max(1, paso));
    const hecho = (g) => n > g.paso || (n === g.paso && hechos.has(g.paso));
    const hechosAhora = gestos.filter(hecho);
    const pendiente = gestos.find((g) => g.paso === n && !hechos.has(g.paso)) ?? null;
    const salieron = new Set(hechosAhora.filter((g) => !pieza.fichas.find((f) => f.id === g.ficha)?.queda).map((g) => g.ficha));
    const aparecidas = new Set(hechosAhora.flatMap((g) => g.aparecen ?? []));
    const fichas = pieza.fichas
      .filter((f) => !salieron.has(f.id) && (aparece[f.id] != null ? n >= aparece[f.id] : aparecidas.has(f.id)))
      .map((f) => ({ id: f.id, texto: f.texto, queda: Boolean(f.queda), activa: pendiente?.ficha === f.id }));
    const sitios = {};
    for (const g of hechosAhora) if (g.sitio) sitios[g.sitio] = { texto: g.entra, nuevo: g.paso === n };
    for (const e of entradas) if (n >= e.paso) sitios[e.sitio] = { texto: e.entra, nuevo: e.paso === n };
    return {
      paso: n,
      cierre: n === CIERRE,
      resaltados: [],
      elementos: {},
      gesto: pendiente ? pendiente.ficha : null,
      pasoGesto: pendiente ? pendiente.paso : gestos.find((g) => g.paso === n)?.paso ?? null,
      fichas,
      sitios,
      modeloVisible: n >= modeloDesde,
    };
  }
  return { estado, gestos, entradas };
}
