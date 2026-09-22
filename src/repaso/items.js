import { ubicacionDeActividad } from "../data/subjects.js";
import { PROBLEMAS, TITULARES, retroalimentacion, PREGUNTA_BRECHA, BRECHAS } from "../data/juegosPolitica.js";
import { RONDAS_GANADORES, PREGUNTA_DIRECTO, retroDirecto, BANCO_CORRIENTE, CATEGORIAS, retroCorriente } from "../data/juegosPolitica2.js";
import { CLASIFICACIONES, retroClasificacion } from "../data/cimientos.js";
import {
  CAMBIOS_ACERCA, OPCIONES_ACERCA, retroAcerca, CASO_GABINETE, CASO_CONSEJO, retroConsejo,
  RONDAS_AUGE, RONDAS_AJUSTE, retroActor,
} from "../data/bloquesAvanzados.js";
import {
  TERMINOS_ECG, DEFINICIONES_ECG, FRAGMENTOS_ECG, retroDefinicionECG, retroFragmentoECG,
  REACCIONES, errorReaccion, CASOS_BIOPSIA, PREGUNTA_BIOPSIA, CASOS_TRIAGE, encabezadoTriage,
  ALERTAS_MONITOR, COMPONENTES_MONITOR, retroMonitor,
} from "../data/demandaAgregadaHacer.js";
import {
  CLASIFICADOR, INSTRUMENTOS, retroClasificador, IMPUESTOS_SELLO, SELLOS, retroSello,
  MEDIDAS_FLUJO, CANALES, retroFlujo, PREGUNTA_MULTIPLICADOR, OPCIONES_MULTIPLICADOR,
  CASO_AGUJERO, PREGUNTA_AGUJERO, OPCIONES_AGUJERO, CASOS_EXPANSIVA, encabezadoExpansiva,
  BANCO_DEFICIT, BANDEJAS, retroDeficit,
} from "../data/politicaFiscal.js";
import {
  QUIEN_DECIDE, VOLANTE_DE_LA_TASA, CAJA_DE_HERRAMIENTAS, A_QUIEN_LE_PEGA, CORRIENTE_DECISIONES,
  EL_REZAGO, DILEMA_BANQUERO, DUELO_INSTRUMENTOS, retroDuelo, ESCALAS_REZAGO, REZAGO_REPASO, retroEscala,
} from "../data/politicaMonetaria.js";
import { subtemaPorRegla, subtemaFijo } from "./subtemas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL POOL DEL REPASO DIARIO — los ítems auto-contenidos de Macro (B2).
 *
 * ═══════════ NO HAY NI UNA COPIA DE CONTENIDO AQUÍ ═══════════
 *
 * Igual que etiquetasItem.js: cada ítem se arma leyendo el banco del que sale
 * la actividad, y su devolución llama a LA MISMA función que usa la actividad
 * de origen. Si Gen corrige un texto en el banco, el Repaso lo enseña corregido
 * sin tocar este archivo. Lo único que se escribe aquí es la gramática: qué
 * campo del banco es el enunciado, cuál la respuesta y qué id lleva el ítem.
 *
 * ═══════════ LA CLAVE DE HISTORIAL ═══════════
 *
 *   clave = `${actividad}:${item_id}`
 *
 * con `item_id` EXACTAMENTE el que la actividad de origen manda a fp_detalle
 * (lo fija detalle-ids.test.mjs). Así un ítem visto en su actividad y el mismo
 * ítem visto en el Repaso son un solo historial: el Repaso guarda su detalle
 * con la clave entera como item_id.
 *
 * Un solo caso donde varios ítems del pool comparten clave, a propósito: las
 * dos lecturas de un mismo término del Electrocardiograma. La actividad
 * registra `def:<término>`, no qué variante salió, así que no hay forma de
 * separar su historial. Son variantes de una misma unidad: se sortea una y
 * nunca salen dos en un repaso. Que no haya otro lo comprueba la prueba del pool.
 *
 * ═══════════ LA FORMA DE UN ÍTEM ═══════════
 *
 * Todos se reducen a una elección de un toque, un intento:
 *
 *   { clave, actividad, itemId, materia, subtema,
 *     rotulo, enunciado, grande?, detalle?, pregunta?, etiqueta?,
 *     opciones: [{ id, texto }], barajarOpciones, correcta,
 *     devolucion(elegida) → [bloque] }
 *
 * y cada bloque es una de las formas en que la actividad de origen enseña su
 * devolución, para pintarla igual:
 *
 *   { tipo: "retro", texto }        la franja ✅/❌ del banco
 *   { tipo: "encabezado", texto }   el rótulo en mayúsculas de un duelo
 *   { tipo: "marca", texto }        GANA / PIERDE del reparto de actores
 *   { tipo: "nota", texto }         la explicación que va debajo, literal
 * ═══════════════════════════════════════════════════════════════════════════
 */

const retro = (texto) => (texto ? [{ tipo: "retro", texto }] : []);

function item(actividad, itemId, campos) {
  const ubicacion = ubicacionDeActividad(actividad);
  if (!ubicacion) throw new Error(`Actividad fuera del catálogo: ${actividad}`);
  return {
    clave: `${actividad}:${itemId}`,
    actividad,
    itemId,
    materia: ubicacion.temaId,
    barajarOpciones: false,
    ...campos,
  };
}

/* ─────────────────────────── las formas compartidas ─────────────────────────── */

/* PrimeraClasificacion: los tres cimientos y las tres clasificaciones de Monetaria. */
function clasificacion(actividad, banco, subtemaDe) {
  return banco.items.map((x) =>
    item(actividad, x.id, {
      subtema: subtemaDe(x),
      rotulo: banco.pregunta.toUpperCase(),
      enunciado: x.texto,
      etiqueta: x.simulado ? "Escenario simulado" : null,
      opciones: banco.categorias.map((c) => ({ id: c.id, texto: c.nombre })),
      barajarOpciones: true,
      correcta: x.respuesta,
      devolucion: (e) => retro(banco.retro ? banco.retro(x, e) : retroClasificacion(banco, x, e)),
    })
  );
}

/*
 * El reparto de actores. La tarjeta del personaje enseña GANA o PIERDE —con
 * «✗ te equivocaste» si no—, su explicación, y debajo la franja de la actividad
 * si la tiene: ¿Quién gana? no trae ninguna, Monetaria solo la de error.
 */
function reparto(actividad, rondas, subtemaDe, retroDe = null) {
  return rondas.flatMap((r) =>
    r.personajes.map((p) =>
      item(actividad, `${r.id}:${p.id}`, {
        subtema: subtemaDe(r),
        rotulo: "LA MEDIDA",
        enunciado: r.medida,
        detalle: { rotulo: "EL PERSONAJE", texto: p.nombre },
        etiqueta: r.etiqueta ?? null,
        opciones: [{ id: "gana", texto: "GANA" }, { id: "pierde", texto: "PIERDE" }],
        correcta: p.resultado,
        devolucion: (e) => [
          { tipo: "marca", texto: `${p.resultado === "gana" ? "GANA" : "PIERDE"}${e === p.resultado ? "" : " · ✗ te equivocaste"}` },
          { tipo: "nota", texto: p.explicacion },
          ...retro(retroDe ? retroDe(p, e) : null),
        ],
      })
    )
  );
}

/* Un caso, una pregunta, varias opciones con su propia devolución. */
function casoUnico(actividad, itemId, { subtema, rotulo, caso, pregunta, opciones, correcta }) {
  return item(actividad, itemId, {
    subtema,
    rotulo,
    enunciado: caso,
    pregunta,
    opciones: opciones.map((o) => ({ id: o.id, texto: o.texto })),
    barajarOpciones: true,
    correcta,
    devolucion: (e) => retro(opciones.find((o) => o.id === e)?.retro),
  });
}

/* ─────────────────────────── POLÍTICA ECONÓMICA ─────────────────────────── */

const POLITICA_ECONOMICA = [
  /* Diagnóstico en vivo · etapa 1: dieciséis titulares. Cuenta el primer intento, que aquí es el único. */
  ...TITULARES.map((t) =>
    item("diagnostico-en-vivo", t.id, {
      subtema: subtemaPorRegla("diagnostico-en-vivo", t.problema),
      rotulo: "TITULAR",
      enunciado: t.texto,
      opciones: PROBLEMAS.map((p) => ({ id: p.id, texto: p.boton })),
      correcta: t.problema,
      devolucion: (e) => retro(retroalimentacion(t.problema, e).texto),
    })
  ),
  /* Diagnóstico en vivo · etapa 2: la pregunta de cierre. */
  item("diagnostico-en-vivo", "brecha", {
    subtema: subtemaFijo("diagnostico-en-vivo:brecha"),
    rotulo: "LA PREGUNTA",
    enunciado: PREGUNTA_BRECHA,
    opciones: BRECHAS.map((b) => ({ id: b.id, texto: `${b.etiqueta} · ${b.detalle}` })),
    correcta: BRECHAS.find((b) => b.correcta).id,
    devolucion: (e) => retro(BRECHAS.find((b) => b.id === e)?.feedback),
  }),

  ...clasificacion("que-rama-es", CLASIFICACIONES["que-rama-es"], (x) => subtemaPorRegla("que-rama-es", x.respuesta)),

  /* ¿Quién gana, quién pierde?: los personajes, y la pregunta de quién lo siente más directo. */
  ...reparto("quien-gana-quien-pierde", RONDAS_GANADORES, (r) => subtemaPorRegla("quien-gana-quien-pierde", r.id)),
  ...RONDAS_GANADORES.map((r) =>
    item("quien-gana-quien-pierde", `${r.id}:directo`, {
      subtema: subtemaPorRegla("quien-gana-quien-pierde", r.id),
      rotulo: "LA MEDIDA",
      enunciado: r.medida,
      pregunta: PREGUNTA_DIRECTO,
      opciones: r.personajes.map((p) => ({ id: p.id, texto: p.nombre })),
      barajarOpciones: true,
      correcta: r.masDirecto,
      devolucion: (e) => [...retro(retroDirecto(r, e)), { tipo: "nota", texto: r.porqueDirecto }],
    })
  ),

  ...BANCO_CORRIENTE.map((x) =>
    item("corriente-titulares", x.id, {
      subtema: subtemaPorRegla("corriente-titulares", x.categoria),
      rotulo: "ENUNCIADO",
      enunciado: x.texto,
      opciones: CATEGORIAS.map((c) => ({ id: c.id, texto: c.nombre })),
      correcta: x.categoria,
      devolucion: (e) => retro(retroCorriente(x.categoria, e)),
    })
  ),

  /* ¿Se acerca o se aleja?: el subtema es el objetivo de la fila, tal cual. */
  ...CAMBIOS_ACERCA.map((f) =>
    item("se-acerca-o-se-aleja", f.id, {
      subtema: f.objetivo,
      rotulo: "EL CAMBIO",
      enunciado: f.cambio,
      detalle: { rotulo: "EL OBJETIVO", texto: f.objetivo },
      opciones: OPCIONES_ACERCA.map((o) => ({ id: o.id, texto: `${o.id === "acerca" ? "→ " : "← "}${o.nombre}` })),
      correcta: f.correcta,
      devolucion: (e) => retro(retroAcerca(f, e)),
    })
  ),

  casoUnico("expediente-gabinete", CASO_GABINETE.id, {
    subtema: subtemaFijo("expediente-gabinete"),
    rotulo: CASO_GABINETE.rotulo ?? "EL CASO",
    caso: CASO_GABINETE.caso,
    pregunta: CASO_GABINETE.pregunta,
    opciones: CASO_GABINETE.opciones,
    correcta: CASO_GABINETE.correcta,
  }),

  /* El consejo de ministros: un caso, así que el ítem es el duelo a secas. */
  ...CASO_CONSEJO.duelos.map((d) =>
    duelo("consejo-ministros", d.id, {
      subtema: subtemaFijo("consejo-ministros"),
      rotulo: "LA SITUACIÓN",
      caso: CASO_CONSEJO,
      d,
      pregunta: "De estas dos, ¿cuál conviene más aquí?",
      letras: true,
      barajar: true,
      devolucion: (e) => retro(retroConsejo(d, e)),
    })
  ),
];

/*
 * Un duelo por parejas. Las dos presentaciones de origen:
 *   · DuelosRanking (consejo, instrumentos): «A · medida», lados barajados, la
 *     franja del banco.
 *   · Triage y Expansiva: la medida sola, en el orden del par, con encabezado
 *     y argumento.
 */
function duelo(actividad, itemId, { subtema, rotulo, caso, d, pregunta, letras, barajar, devolucion }) {
  return item(actividad, itemId, {
    subtema,
    rotulo,
    enunciado: caso.caso,
    etiqueta: caso.etiqueta ?? null,
    pregunta,
    opciones: d.par.map((x) => ({ id: x, texto: letras ? `${x.toUpperCase()} · ${caso.medidas[x]}` : caso.medidas[x] })),
    barajarOpciones: barajar,
    correcta: d.gana,
    devolucion,
  });
}

/* ─────────────────────────── DEMANDA AGREGADA ─────────────────────────── */

const DEMANDA_AGREGADA = [
  ...clasificacion("cual-componente", CLASIFICACIONES["cual-componente"], (x) => subtemaPorRegla("cual-componente", x.respuesta)),

  /* Electrocardiograma · etapa 1: las dieciséis lecturas, dos por término y con la misma clave. */
  ...DEFINICIONES_ECG.map((d) =>
    item("electrocardiograma", `def:${d.termino}`, {
      variante: d.id,
      subtema: subtemaPorRegla("electrocardiograma", d.termino),
      rotulo: "LECTURA",
      enunciado: d.texto,
      pregunta: "¿De qué término es esta lectura?",
      opciones: TERMINOS_ECG.map((t) => ({ id: t.id, texto: t.nombre })),
      barajarOpciones: true,
      correcta: d.termino,
      devolucion: (e) => retro(retroDefinicionECG(d, e)),
    })
  ),
  /* Electrocardiograma · etapa 2: los seis fragmentos de la fórmula. */
  ...FRAGMENTOS_ECG.map((f) =>
    item("electrocardiograma", `frag:${f.id}`, {
      subtema: subtemaFijo("electrocardiograma:frag"),
      rotulo: "FRAGMENTO",
      enunciado: f.fragmento,
      grande: true,
      pregunta: "¿Qué dice este fragmento?",
      opciones: FRAGMENTOS_ECG.map((o) => ({ id: o.id, texto: o.lectura })),
      barajarOpciones: true,
      correcta: f.id,
      devolucion: (e) => retro(retroFragmentoECG(f, e)),
    })
  ),

  ...REACCIONES.map((r) =>
    item("termometro-reacciones", r.id, {
      subtema: subtemaPorRegla("termometro-reacciones", r.componente),
      rotulo: "CAMBIO",
      enunciado: r.cambio,
      pregunta: "¿Cómo reacciona?",
      opciones: r.opciones.map((o) => ({ id: o.id, texto: o.texto })),
      correcta: r.correcta,
      devolucion: (e) => retro(e === r.correcta ? r.acierto : errorReaccion(r)),
    })
  ),

  ...CASOS_BIOPSIA.map((c) =>
    casoUnico("biopsia-economica", `biopsia:${c.id}`, {
      subtema: subtemaFijo("biopsia-economica"),
      rotulo: "MUESTRA",
      caso: c.caso,
      pregunta: PREGUNTA_BIOPSIA,
      opciones: c.opciones,
      correcta: c.correcta,
    })
  ),

  ...CASOS_TRIAGE.flatMap((c) =>
    c.duelos.map((d) =>
      duelo("triage-emergencias", `${c.id}:${d.id}`, {
        subtema: subtemaFijo("triage-emergencias"),
        rotulo: "SITUACIÓN",
        caso: c,
        d,
        pregunta: "¿Cuál atiendes primero?",
        devolucion: (e) => [{ tipo: "encabezado", texto: encabezadoTriage(c, d, e) }, { tipo: "nota", texto: d.argumento }],
      })
    )
  ),

  ...ALERTAS_MONITOR.map((a) =>
    item("sala-monitores", a.id, {
      subtema: subtemaPorRegla("sala-monitores", a.componente),
      rotulo: "ALERTA",
      enunciado: a.texto,
      pregunta: "¿A qué componente afecta?",
      opciones: COMPONENTES_MONITOR.map((c) => ({ id: c.id, texto: `${c.id} · ${c.nombre}` })),
      correcta: a.componente,
      devolucion: (e) => retro(retroMonitor(a, e)),
    })
  ),

  ...reparto("quien-beneficia-auge", RONDAS_AUGE, (r) => subtemaPorRegla("quien-beneficia-auge", r.id), retroActor),
];

/* ─────────────────────────── POLÍTICA FISCAL ─────────────────────────── */

const POLITICA_FISCAL = [
  ...clasificacion("cobra-gasta-o-pide", CLASIFICACIONES["cobra-gasta-o-pide"], (x) => subtemaPorRegla("cobra-gasta-o-pide", x.respuesta)),

  ...CLASIFICADOR.map((t) =>
    item("clasificador-tesoro", t.id, {
      subtema: subtemaPorRegla("clasificador-tesoro", t.variedad),
      rotulo: "DOCUMENTO",
      enunciado: t.concepto,
      pregunta: "¿A qué ranura va cada documento?",
      opciones: INSTRUMENTOS.map((x) => ({ id: x.id, texto: x.nombre })),
      correcta: t.instrumento,
      devolucion: (e) => retro(retroClasificador(t, e)),
    })
  ),

  ...IMPUESTOS_SELLO.map((x) =>
    item("directos-indirectos", x.id, {
      subtema: subtemaPorRegla("directos-indirectos", x.categoria),
      rotulo: "IMPUESTO",
      enunciado: x.concepto,
      pregunta: "¿Qué sello lleva este impuesto?",
      opciones: SELLOS.map((s) => ({ id: s.id, texto: s.nombre })),
      correcta: x.categoria,
      devolucion: (e) => retro(retroSello(x, e)),
    })
  ),

  /* Flujo de caja · etapa 1: las cuatro medidas. */
  ...MEDIDAS_FLUJO.map((m) =>
    item("flujo-de-caja", `canal:${m.id}`, {
      subtema: subtemaPorRegla("flujo-de-caja", m.canal),
      rotulo: "LA MEDIDA",
      enunciado: m.medida,
      pregunta: "¿Por qué canal llega a la Demanda Agregada?",
      opciones: CANALES.map((c) => ({ id: c.id, texto: c.nombre })),
      correcta: m.canal,
      devolucion: (e) => retro(retroFlujo(m, e)),
    })
  ),
  /* Flujo de caja · etapa 2: el multiplicador, con las opciones en el orden de la actividad. */
  item("flujo-de-caja", "multiplicador", {
    subtema: subtemaFijo("flujo-de-caja:multiplicador"),
    rotulo: "LA PREGUNTA",
    enunciado: PREGUNTA_MULTIPLICADOR,
    opciones: ["exacto", "mas", "menos"].map((id) => OPCIONES_MULTIPLICADOR.find((o) => o.id === id)).map((o) => ({ id: o.id, texto: o.texto })),
    correcta: OPCIONES_MULTIPLICADOR.find((o) => o.correcta).id,
    devolucion: (e) => retro(OPCIONES_MULTIPLICADOR.find((o) => o.id === e)?.retro),
  }),

  casoUnico("agujero-fiscal", "por-que-renta", {
    subtema: subtemaFijo("agujero-fiscal"),
    rotulo: "EL CASO",
    caso: CASO_AGUJERO,
    pregunta: PREGUNTA_AGUJERO,
    opciones: OPCIONES_AGUJERO,
    correcta: OPCIONES_AGUJERO.find((o) => o.correcta).id,
  }),

  ...CASOS_EXPANSIVA.flatMap((c) =>
    c.duelos.map((d) =>
      duelo("expansiva-contractiva", `${c.id}:${d.id}`, {
        subtema: subtemaFijo("expansiva-contractiva"),
        rotulo: "LA ECONOMÍA",
        caso: c,
        d,
        pregunta: "¿Cuál de las dos es mejor aquí?",
        devolucion: (e) => [{ tipo: "encabezado", texto: encabezadoExpansiva(c, d, e) }, { tipo: "nota", texto: d.argumento }],
      })
    )
  ),

  ...BANCO_DEFICIT.map((p) =>
    item("deficit-vs-deuda", p.id, {
      subtema: subtemaPorRegla("deficit-vs-deuda", p.bandeja),
      rotulo: "PAPEL",
      enunciado: p.texto,
      pregunta: "¿A qué bandeja va cada papel?",
      opciones: BANDEJAS.map((b) => ({ id: b.id, texto: b.nombre })),
      correcta: p.bandeja,
      devolucion: (e) => retro(retroDeficit(p, e)),
    })
  ),

  ...reparto("quien-afecta-ajuste", RONDAS_AJUSTE, (r) => subtemaPorRegla("quien-afecta-ajuste", r.id), retroActor),
];

/* ─────────────────────────── POLÍTICA MONETARIA ─────────────────────────── */
/* Monetaria trae su subtema en el banco (una por actividad). */

const POLITICA_MONETARIA = [
  ...clasificacion("quien-decide-esto", QUIEN_DECIDE, () => QUIEN_DECIDE.subtema),

  ...VOLANTE_DE_LA_TASA.escenarios.map((x) =>
    item("volante-de-la-tasa", x.id, {
      subtema: VOLANTE_DE_LA_TASA.subtema,
      rotulo: "EL ESCENARIO",
      enunciado: x.texto,
      opciones: VOLANTE_DE_LA_TASA.opciones.map((o) => ({ id: o.id, texto: o.nombre })),
      barajarOpciones: true,
      correcta: x.correcta,
      devolucion: (e) => retro(e === x.correcta ? x.retro : VOLANTE_DE_LA_TASA.error),
    })
  ),

  ...clasificacion("caja-de-herramientas", CAJA_DE_HERRAMIENTAS, () => CAJA_DE_HERRAMIENTAS.subtema),

  ...reparto("a-quien-le-pega-la-tasa", A_QUIEN_LE_PEGA.rondas, () => A_QUIEN_LE_PEGA.subtema, A_QUIEN_LE_PEGA.retro),

  ...clasificacion("corriente-de-decisiones", CORRIENTE_DECISIONES, () => CORRIENTE_DECISIONES.subtema),

  /*
   * El Rezago, transformado (B2b): los diez hechos pasan de ordenar a «¿cuánto
   * tarda?». La clave es la del hecho en El Rezago, así que su historial es el
   * mismo hecho que ya se vio al ordenar.
   */
  ...REZAGO_REPASO.flatMap((c) =>
    c.hechos.map((h) =>
      item("el-rezago", `${c.caso}:${h.hecho}`, {
        subtema: EL_REZAGO.subtema,
        rotulo: "EL HECHO",
        enunciado: h.texto,
        detalle: { rotulo: "EL CASO", texto: c.titulo },
        etiqueta: EL_REZAGO.casos.find((x) => x.id === c.caso)?.etiqueta ?? null,
        pregunta: "¿Cuánto se demora esto en pasar?",
        opciones: ESCALAS_REZAGO.map((s) => ({ id: s.id, texto: s.nombre })),
        correcta: h.escala,
        devolucion: (e) => retro(retroEscala(h, e)),
      })
    )
  ),

  casoUnico("dilema-banquero-central", DILEMA_BANQUERO.id, {
    subtema: DILEMA_BANQUERO.subtema,
    rotulo: DILEMA_BANQUERO.rotulo ?? "EL CASO",
    caso: DILEMA_BANQUERO.caso,
    pregunta: DILEMA_BANQUERO.pregunta,
    opciones: DILEMA_BANQUERO.opciones,
    correcta: DILEMA_BANQUERO.correcta,
  }),

  ...DUELO_INSTRUMENTOS.casos.flatMap((c) =>
    c.duelos.map((d) =>
      duelo("duelo-de-instrumentos", `${c.id}:${d.id}`, {
        subtema: DUELO_INSTRUMENTOS.subtema,
        rotulo: "LA SITUACIÓN",
        caso: c,
        d,
        pregunta: "De estas dos, ¿cuál conviene más aquí?",
        letras: true,
        barajar: true,
        devolucion: (e) => retro(retroDuelo(d, e)),
      })
    )
  ),
];

export const POOL = [...POLITICA_ECONOMICA, ...DEMANDA_AGREGADA, ...POLITICA_FISCAL, ...POLITICA_MONETARIA];

/* Las actividades que aportan al pool, y las que no (B2). Las segundas se listan para que la prueba vea que no falta ninguna. */
export const ACTIVIDADES_DEL_POOL = [...new Set(POOL.map((x) => x.actividad))];

export const ACTIVIDADES_FUERA_DEL_POOL = [
  "arma-grupo-logico", "cadena-de-transmision", "disena-respuesta-monetaria", "disena-presupuesto",
  "simulador-de-crisis", "cirugia-reconstruccion",
  "explica-la-politica", "explica-paciente", "explica-contribuyente", "explicaselo-a-un-deudor",
  "banco-transfusiones", "sala-espera-llena", "comite-presupuesto",
  "memorama-tesoro", "memorama-corazon", "memorama-tesoreria", "memorama-banco-central",
  "tablero-decisiones",
  /*
   * El Comité de NOVA, el desafío de Política Fiscal. Fuera del pool y no por
   * olvido: sus ítems no son preguntas sueltas que se puedan repasar de a una
   * —son cuatro etapas encadenadas sobre un mismo estado de resultados, y una
   * decisión del comité sacada de su contexto no significa nada—. El Proyecto
   * del Arca tampoco aporta, por lo mismo.
   */
  "comite-nova",
];

/** Los ítems que salen de las actividades que el estudiante ya completó. */
export function poolDe(hechas) {
  return POOL.filter((x) => hechas.has(x.actividad));
}
