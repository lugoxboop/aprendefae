/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 12 «GESTIÓN DE LAS ADQUISICIONES» — LOS TEXTOS
 * DE LAS 12 HACER (lote 6)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c12-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos de cálculo (H01, H03, H07, H10 y H12) viven en TOSTADORA_C12: la
 * prueba gp-lote6 recalcula cada clave desde ellos.
 *
 * Módulos y subtemas (gp12-* del diseño → procesos de ../estructura.js):
 *   gp12-hacer-comprar, gp12-contratos, gp12-licitacion, gp12-sow,
 *   gp12-seleccion (método y criterios), gp12-plan, gp12-estrategia →
 *   gp-12-1 · gp12-seleccion (evaluar las propuestas), gp12-efectuar,
 *   gp12-conceptos (quién negocia y firma) → gp-12-2 · gp12-reclamaciones,
 *   gp12-controlar, gp12-cierre → gp-12-3.
 *   H01–H06 y H12 van en Planificación (12.1; el taller H12 recorre la compra
 *   desde el plan); H07 y H08 en Ejecución (12.2); H09–H11 en Monitoreo y
 *   Control (12.3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
/* Tres opciones con la mejor primero: [texto bueno, [texto, retro], [texto, retro]]. */
const tres = (bueno, ...otras) => ({
  destinos: [{ id: "mejor", nombre: bueno }, ...otras.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(otras.map(([, r], k) => [`otra${k + 1}`, r])), barajar: true,
});

/* Los datos de cálculo de la tostadora (diseño H01, H03, H07, H10 y H12). Cifras en millones. */
export const TOSTADORA_C12 = {
  /* H01. La nómina no cambia con la decisión: criterio de Gen. */
  base: { materiales: 14, contratista: 26, ahorro: 12 },
  recuperador: { costo: 60, ahorroMes: 2.5, meses: 24 },
  /* H03. CPIF: comprador 80 %, vendedor 20 % de la desviación (criterio de Gen). */
  objetivo: 400,
  contratos: {
    ffp: { precio: 480, costoProveedor: 530, paga: 480 },
    fpif: { tope: 500, costoMasHonorario: 530, paga: 500 },
    cpff: { honorario: 40, real: 450, paga: 490 },
    cpif: { objetivo: 400, honorario: 40, comprador: 0.8, real: 450, paga: 480 },
    tm: { porHora: 0.2, materiales: 3, estimadas: 40, horas: 60, paga: 15 },
    ahorro: { objetivo: 400, honorario: 40, comprador: 0.8, real: 360, paga: 408 },
  },
  /* H07. Pesos y notas del comité (criterios de la guía, p. 478). */
  criterios: [
    { id: "ciclo", nombre: "Costo del ciclo de vida", peso: 0.4, pesoNuevo: 0.3, notas: { a: 9, b: 6, c: 8 } },
    { id: "tecnica", nombre: "Experiencia técnica", peso: 0.25, pesoNuevo: 0.35, notas: { a: 6, b: 9, c: 8 } },
    { id: "entrega", nombre: "Fecha de entrega", peso: 0.2, pesoNuevo: 0.2, notas: { a: 7, b: 8, c: 5 } },
    { id: "transferencia", nombre: "Transferencia de conocimientos", peso: 0.15, pesoNuevo: 0.15, notas: { a: 5, b: 9, c: 6 } },
  ],
  totales: { a: 7.25, b: 7.6, c: 7.1 },
  totalesNuevos: { a: 6.95, b: 7.9, c: 7.1 },
  estimacion: 900,
  ofertas: { a: 610, b: 930, c: 880 },
  /* H10. */
  valorGanado: { vp: 40, vg: 32, cr: 36, cpi: 0.89, spi: 0.8 },
  /* H12. */
  plazo: { fabricacion: 8, diseno: 5, obra: 9, llegadas: { mes1: 9, mes5: 13, obra: 17 } },
};
const T = TOSTADORA_C12;
const ent = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, ...extra });

/* ─── H01 · El banco o el catálogo (2 etapas) ─── */
export const GP_C12_H01 = {
  id: "gp26-pla-c12-h01-hacer-comprar",
  contexto: "Llega la tostadora nueva. Hay que montarla: base de concreto, gas, electricidad, capacitación. Unas tareas las puede hacer Altamira; otras no.",
  rol: "Diriges el proyecto de la tostadora con el gerente de producción.",
  consigna: "¿Lo hace Altamira o lo compra fuera?",
  cierre: "Hacer o comprar: capacidad propia, pericia, obligaciones, independencia y riesgo.",
  subtemas: ["gp-12-1"],
  elenco: ["tu", "gerente", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Lo hace Altamira o lo compra fuera?",
      destinos: [{ id: "hacer", nombre: "Hacer", pista: "banco de Altamira" }, { id: "comprar", nombre: "Comprar", pista: "catálogo del proveedor" }],
      /* 6 de 8, al menos 2 «Hacer». Cada tarea trae su factor (guía, p. 473). */
      partida: { n: 6, minPorClave: 2 },
      banco: con("gp-12-1", [
        it("c12h01-01", "«Fabricar la tostadora.»", "comprar", "Altamira tuesta café; fabricar máquinas exige pericia especializada que no tiene.", { factor: "Pericia especializada" }),
        it("c12h01-02", "«Fundir la base de concreto: el equipo de mantenimiento ya lo hizo y tiene tiempo.»", "hacer", "Hay habilidad propia y recursos libres: hacerlo dentro tiene sentido.", { factor: "Recursos propios libres" }),
        it("c12h01-03", "«Conectar el gas: exige un técnico certificado que Altamira no tiene.»", "comprar", "Falta pericia especializada y certificada: se compra.", { factor: "Pericia certificada" }),
        it("c12h01-04", "«Enseñar perfiles de tostión: el maestro tostador lleva quince años haciéndolo.»", "hacer", "El conocimiento está en casa: el maestro tostador puede enseñarlo.", { factor: "Conocimiento en casa" }),
        it("c12h01-05", "«Montar la máquina en dos semanas sin contratar personal de planta para siempre.»", "comprar", "Comprar evita ampliar obligaciones laborales permanentes por un trabajo corto.", { factor: "Sin obligaciones permanentes" }),
        it("c12h01-06", "«Medir las emisiones antes de encender, con un concepto que nadie discuta.»", "comprar", "Se necesita pericia independiente: un tercero que no sea juez y parte.", { factor: "Pericia independiente" }),
        it("c12h01-07", "«Mover la tostadora vieja a la bodega con el montacargas propio.»", "hacer", "Recursos propios disponibles y trabajo sencillo: se hace dentro.", { factor: "Recursos propios libres" }),
        it("c12h01-08", "«Programar el software del tablero, que solo conoce el fabricante.»", "comprar", "Solo el fabricante tiene ese conocimiento: comprarlo reduce el riesgo.", { factor: "Menos riesgo" }),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Calcula y decide con los números del gerente.",
      pasos: [
        { tipo: "casillas", id: "c12h01-11", subtemas: ["gp-12-1"], mesa: "gerente",
          contexto: "Hacer la base cuesta $14 M en materiales; el equipo ya está en nómina. Un contratista cobra $26 M.",
          consigna: "¿Cuánto ahorra Altamira si la hace?",
          casillas: [ent("ahorro", "Ahorro", T.base.ahorro, { unidad: "millones", retro: "26 − 14 = 12: la nómina se paga igual en ambos casos." })] },
        { tipo: "casillas", id: "c12h01-12", subtemas: ["gp-12-1"], mesa: "gerente",
          contexto: "Un recuperador de calor cuesta $60 M y ahorra $2,5 M de gas al mes.",
          consigna: "¿En cuántos meses se paga solo?",
          casillas: [ent("meses", "Plazo de retorno", T.recuperador.meses, { unidad: "meses", retro: "Plazo de retorno: 60 ÷ 2,5 = 24 meses." })] },
        { id: "c12h01-13", subtemas: ["gp-12-1"], mesa: "gerente",
          contexto: "Pero el equipo de mantenimiento se va un mes a reparar la secadora.",
          consigna: "¿Sigue conviniendo hacer la base?",
          ...tres("No: ya no hay recursos disponibles",
            ["Sí: el ahorro manda", "La asignación actual de recursos también decide, no solo el costo."],
            ["Da igual", "Sin equipo libre, hacerla dentro retrasa el montaje."]) },
      ],
    },
  ],
};

/* ─── H02 · El planero de los contratos (2 etapas) ─── */
export const SIGLAS_C12 = ["FFP", "FPIF", "FP-EPA", "CPFF", "CPIF", "CPAF", "T&M"];
export const GP_C12_H02 = {
  id: "gp26-pla-c12-h02-contratos",
  contexto: "Compras te pide elegir el tipo de contrato para cada parte de la tostadora. En el planero hay siete modelos.",
  rol: "Recomiendas el contrato; Compras lo firma.",
  consigna: "Lleva cada compra a su familia de contrato.",
  cierre: "Precio fijo si el trabajo es predecible; reembolsable si va a cambiar.",
  subtemas: ["gp-12-1"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada compra a su familia de contrato.",
      destinos: [{ id: "fijo", nombre: "Precio fijo" }, { id: "reembolsable", nombre: "Costos reembolsables" }, { id: "tm", nombre: "Tiempo y materiales" }],
      partida: { todas: true },
      banco: con("gp-12-1", [
        it("c12h02-01", "«Tostadora de catálogo: especificaciones cerradas, sin cambios previstos.»", "fijo", "Requisitos bien definidos y estables: eso pide precio fijo."),
        it("c12h02-02", "«Panel de control estándar, con planos ya aprobados.»", "fijo", "Si el trabajo es predecible, se fija el precio."),
        it("c12h02-03", "«Extractor de humos: el diseño cambiará mucho según las pruebas.»", "reembolsable", "Alcance que cambiará mucho: se reembolsan los costos reales."),
        it("c12h02-04", "«Adecuar el galpón: nadie sabe qué hay bajo el piso.»", "reembolsable", "Trabajo mal definido y propenso a cambiar: costos reembolsables."),
        it("c12h02-05", "«Un electricista experto mañana; no hay tiempo de escribir el SOW.»", "tm", "Sin SOW preciso y con urgencia: tiempo y materiales."),
        it("c12h02-06", "«Dos técnicos extra por horas para reforzar el montaje.»", "tm", "Aumentar personal por horas es el uso típico de T&M."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Saca del planero el contrato exacto.",
      destinos: SIGLAS_C12.map((s) => ({ id: s.toLowerCase().replace(/[^a-z]/g, ""), nombre: s })),
      partida: { todas: true },
      banco: con("gp-12-1", [
        it("c12h02-11", "«Precio fijado hoy; solo cambia si cambia el alcance.»", "ffp", "Precio cerrado desde el inicio: FFP, el más usado."),
        it("c12h02-12", "«Precio fijo, bono por entregar antes y tope: el exceso lo paga el proveedor.»", "fpif", "Incentivo más precio tope que asume el vendedor: FPIF."),
        it("c12h02-13", "«Pagos en euros durante dos años; ajuste final del precio con fórmula pactada.»", "fpepa", "Varios años y otra moneda: precio fijo con ajuste económico."),
        it("c12h02-14", "«Se reembolsan costos; honorario fijo del 10 % del costo estimado al inicio.»", "cpff", "Honorario fijo calculado sobre lo estimado: CPFF."),
        it("c12h02-15", "«Se reembolsan costos; la desviación del costo objetivo se reparte 80/20.»", "cpif", "Reparto de la desviación según fórmula pactada: CPIF."),
        it("c12h02-16", "«Se reembolsan costos; casi todo el honorario depende del juicio de Altamira, sin apelación.»", "cpaf", "Honorario por criterio subjetivo del comprador: CPAF."),
        it("c12h02-17", "«Se paga cada hora del experto más los materiales usados.»", "tm", "Horas más materiales: contrato por tiempo y materiales."),
      ]),
    },
  ],
};

/* ─── H03 · ¿Dónde cae el sobrecosto? (2 etapas) ─── */
const QUIEN = [{ id: "altamira", nombre: "Altamira" }, { id: "proveedor", nombre: "Proveedor" }, { id: "ambos", nombre: "Ambos" }];
export const CASOS_C12 = [
  { id: "ffp", sigla: "FFP", texto: "FFP · «Precio pactado $480 M. Al proveedor le costó $530 M.»", quien: "proveedor",
    retroQuien: "Con precio fijo cerrado, el riesgo de costo es del vendedor.", retroPaga: "Paga el precio pactado: 480, aunque al proveedor le costara 530." },
  { id: "fpif", sigla: "FPIF", texto: "FPIF · «Precio tope $500 M. Costos más honorario suman $530 M.»", quien: "proveedor",
    retroQuien: "Lo que pase del precio tope lo asume el vendedor.", retroPaga: "Altamira paga como máximo el precio tope: 500." },
  { id: "cpff", sigla: "CPFF", texto: "CPFF · «Honorario fijo $40 M. Costo real $450 M.»", quien: "altamira",
    retroQuien: "Se reembolsan los costos reales: el sobrecosto lo carga el comprador.", retroPaga: "Costo real 450 más honorario fijo 40: 490." },
  { id: "cpif", sigla: "CPIF", texto: "CPIF · «Objetivo $400 M; honorario objetivo $40 M; reparto 80/20. Real $450 M.»", quien: "ambos",
    retroQuien: "En CPIF la desviación se comparte según la fórmula pactada.", retroPaga: "El proveedor absorbe 10 (20 % de 50): 450 + 30 = 480." },
  { id: "tm", sigla: "T&M", texto: "T&M · «$0,2 M por hora más $3 M de materiales. Estimaron 40 horas; fueron 60.»", quien: "altamira",
    retroQuien: "Cada hora extra se paga: el comprador carga ese riesgo.", retroPaga: "60 horas × 0,2 = 12, más 3 de materiales: 15." },
  { id: "ahorro", sigla: "CPIF", texto: "CPIF · «Mismo contrato; el costo real fue $360 M.»", soloPaga: true,
    retroPaga: "Ahorro de 40: el proveedor gana 8; 360 + 48 = 408." },
];
export const GP_C12_H03 = {
  id: "gp26-pla-c12-h03-sobrecosto",
  contexto: "El extractor de humos costó más de lo estimado. Según el contrato, alguien paga la diferencia.",
  rol: "Revisas las facturas del proyecto antes de aprobar el pago.",
  consigna: "¿Quién paga el sobrecosto con este contrato?",
  cierre: "Precio fijo: el riesgo es del vendedor. Reembolsable: sobre todo del comprador.",
  subtemas: ["gp-12-1"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "micros",
      consigna: "¿Quién paga el sobrecosto con este contrato?",
      pasos: [{ consigna: "¿Quién paga el sobrecosto con este contrato?", destinos: QUIEN,
        items: CASOS_C12.filter((c) => !c.soloPaga).map((c) => ({
          id: `c12h03-${c.id}`, caso: c.id, texto: c.texto, clave: c.quien, retro: c.retroQuien, subtemas: ["gp-12-1"],
        })) }],
    },
    {
      tipo: "micros",
      consigna: "¿Cuánto paga Altamira en total, en millones?",
      /* El caso de ahorro va siempre al final (el más difícil). */
      pasos: CASOS_C12.map((c) => ({
        tipo: "casillas", id: `c12h03-${c.id}-paga`, caso: c.id, texto: c.texto, subtemas: ["gp-12-1"],
        casillas: [ent("paga", "Altamira paga", T.contratos[c.id].paga, { unidad: "millones", retro: c.retroPaga })],
      })),
    },
  ],
};

/* ─── H04 · El correo neumático ─── */
export const GP_C12_H04 = {
  id: "gp26-pla-c12-h04-rfi-rfq-rfp",
  contexto: "Antes de comprar hay que preguntar al mercado. Cada pregunta sale en un tubo distinto hacia los proveedores.",
  rol: "Preparas los documentos de la licitación con Compras.",
  consigna: "Mete cada pregunta en el tubo correcto.",
  cierre: null,
  subtemas: ["gp-12-1"],
  elenco: ["tu"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Mete cada pregunta en el tubo correcto.",
    destinos: [{ id: "rfi", nombre: "RFI", pista: "saber más" }, { id: "rfq", nombre: "RFQ", pista: "¿cuánto y cómo?" }, { id: "rfp", nombre: "RFP", pista: "propón una solución" }],
    /* 6 de 7; siempre las dos RFP. */
    partida: { n: 4, siempre: ["c12h04-06", "c12h04-07"] },
    banco: con("gp-12-1", [
      it("c12h04-01", "«¿Qué tecnologías existen para tostar 120 kg por carga?»", "rfi", "Aún no sabes qué hay en el mercado: pides información."),
      it("c12h04-02", "«Antes de la RFP, ¿qué fabricantes podrían cumplir?»", "rfi", "Sondear el mercado suele ir antes de una RFQ o RFP."),
      it("c12h04-03", "«Ya sabes qué quieres: 500 bolsas de válvula. ¿Precio?»", "rfq", "Requisito claro y pregunta de precio: solicitud de cotización."),
      it("c12h04-04", "«Repuestos estándar del quemador; decide el precio.»", "rfq", "Artículo estándar elegido por precio: se pide cotización."),
      it("c12h04-05", "«¿Cómo cumplirían el plazo de entrega y a qué costo?»", "rfq", "Cómo cumplir los requisitos y cuánto cuesta: RFQ."),
      it("c12h04-06", "«El humo molesta a los vecinos y no sabemos cómo resolverlo.»", "rfp", "Problema sin solución evidente: solicitud de propuesta."),
      it("c12h04-07", "«Control automático de tostión a la medida; pesa lo técnico.»", "rfp", "Cuando manda la capacidad técnica, se pide propuesta."),
    ]),
    despues: [
      { id: "c12h04-08", subtemas: ["gp-12-1"],
        consigna: "¿Cuál de los tres es el más formal?",
        destinos: [{ id: "rfi", nombre: "RFI" }, { id: "rfq", nombre: "RFQ" }, { id: "rfp", nombre: "RFP" }],
        clave: "rfp", retro: "La RFP tiene reglas estrictas de contenido, plazos y respuestas." },
      { id: "c12h04-09", subtemas: ["gp-12-1"],
        consigna: "El proveedor responde la RFQ. ¿Cómo se llama su respuesta?",
        destinos: [{ id: "oferta", nombre: "Oferta o cotización" }, { id: "propuesta", nombre: "Propuesta" }],
        clave: "oferta", retros: { propuesta: "Si decide el precio, se habla de oferta o cotización; propuesta, si pesa lo técnico." } },
    ],
  }],
};

/* ─── H05 · Las placas de la tostadora (2 etapas) ─── */
const vaga = (id, texto, bueno, otras, contexto = null) => ({ id, texto, subtemas: ["gp-12-1"], ...(contexto ? { contexto } : {}), ...tres(bueno, ...otras) });
export const GP_C12_H05 = {
  id: "gp26-pla-c12-h05-sow",
  contexto: "El practicante redactó el enunciado del trabajo para la tostadora. Compras lo enviará mañana a tres proveedores.",
  rol: "Revisas el SOW antes de que salga.",
  consigna: "Atornilla cada dato en su parte del SOW.",
  cierre: "El SOW cubre solo la parte del alcance que entra en ese contrato.",
  subtemas: ["gp-12-1"],
  elenco: ["tu", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Atornilla cada dato en su parte del SOW.",
      destinos: [
        { id: "especificaciones", nombre: "Especificaciones" }, { id: "cantidad", nombre: "Cantidad" }, { id: "calidad", nombre: "Calidad" },
        { id: "desempeno", nombre: "Desempeño" }, { id: "periodo", nombre: "Período" }, { id: "lugar", nombre: "Lugar" }, { id: "servicios", nombre: "Servicios adicionales" },
      ],
      partida: { todas: true },
      banco: con("gp-12-1", [
        it("c12h05-01", "«Tostadora de tambor a gas, 120 kg por carga.»", "especificaciones", "Describe técnicamente la máquina: es especificación."),
        it("c12h05-02", "«Una unidad.»", "cantidad", "Cuántas se compran: cantidad deseada."),
        it("c12h05-03", "«Cumple la norma de seguridad para equipos a gas.»", "calidad", "Estándares que debe cumplir: nivel de calidad."),
        it("c12h05-04", "«Tuesta 480 kg por hora sin manchas de color.»", "desempeno", "Lo que debe rendir funcionando: dato de desempeño."),
        it("c12h05-05", "«Entrega e instalación entre marzo y junio.»", "periodo", "Cuándo se hace el trabajo: período de desempeño."),
        it("c12h05-06", "«Planta de Altamira, Manizales.»", "lugar", "Dónde se hace el trabajo: lugar de trabajo."),
        it("c12h05-07", "«Soporte técnico dos años después del cierre del proyecto.»", "servicios", "Soporte posterior al proyecto: servicio adicional del SOW."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Cambia cada frase vaga por una que se pueda exigir.",
      pasos: [
        vaga("c12h05-11", "Placa borrosa: «Una tostadora buena y rápida.»", "«120 kg por carga, cuatro cargas por hora.»", [
          ["«La mejor del mercado.»", "\"La mejor\" no se mide: nadie puede exigirlo."],
          ["«Rápida, según el proveedor.»", "Si lo define el proveedor, Altamira no puede exigir nada."],
        ], "Lo que no está escrito en el contrato no se puede exigir."),
        vaga("c12h05-12", "Placa borrosa: «Capacitación si hay tiempo.»", "«16 horas de capacitación a 4 operarios antes del arranque.»", [
          ["«Capacitación cuando se pueda.»", "Sin cantidad ni fecha, la capacitación no se puede exigir."],
          ["«Capacitación opcional.»", "La transferencia de conocimiento debe quedar clara en el contrato."],
        ]),
        vaga("c12h05-13", "Placa borrosa: «Entrega pronto.»", "«Entrega en planta a más tardar el 30 de junio.»", [
          ["«Lo antes posible.»", "Sin fecha, no hay incumplimiento que reclamar."],
          ["«En temporada.»", "\"Temporada\" se entiende distinto; pon una fecha."],
        ]),
        vaga("c12h05-14", "Placa borrosa: «Incluye todo lo necesario.»", "«Incluye quemador, extractor de humos y panel de control.»", [
          ["«Incluye lo usual.»", "\"Lo usual\" no es claro ni completo."],
          ["«Incluye accesorios.»", "¿Cuáles? El SOW debe ser claro y completo."],
        ]),
        { id: "c12h05-15", subtemas: ["gp-12-1"], mesa: "practicante",
          consigna: "¿De dónde sale el SOW?",
          ...tres("De la línea base del alcance",
            ["De la propuesta del proveedor", "El proveedor responde al SOW; no lo escribe."],
            ["Del acta", "El acta es general; el SOW sale de la línea base."]) },
      ],
    },
  ],
};

/* ─── H06 · El cambiavías ─── */
export const GP_C12_H06 = {
  id: "gp26-pla-c12-h06-metodo-seleccion",
  contexto: "Cada compra de la tostadora necesita su forma de elegir proveedor. Un vagón por compra llega al cambiavías.",
  rol: "Propones a Compras el método de selección de cada compra.",
  consigna: "Mueve la palanca y manda cada vagón a su estación.",
  cierre: null,
  subtemas: ["gp-12-1"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Mueve la palanca y manda cada vagón a su estación.",
    destinos: [
      { id: "menor", nombre: "Menor costo" }, { id: "calificaciones", nombre: "Solo calificaciones" }, { id: "tecnica", nombre: "Técnica superior" },
      { id: "costo-calidad", nombre: "Costo y calidad" }, { id: "unico", nombre: "Proveedor único" }, { id: "presupuesto", nombre: "Presupuesto fijo" },
    ],
    /* 6 de 7: las dos de menor costo no salen juntas. */
    partida: { n: 6, maxPorClave: 1 },
    banco: con("gp-12-1", [
      it("c12h06-01", "«Bolsas de empaque estándar; resultado bien definido.»", "menor", "Compra rutinaria y definida: gana el menor costo."),
      it("c12h06-02", "«Guantes y escobas para la planta; norma conocida.»", "menor", "Estándar y rutinario: basta comparar precios."),
      it("c12h06-03", "«Asesoría de dos días por $3 M.»", "calificaciones", "Valor bajo: un concurso completo no vale la pena."),
      it("c12h06-04", "«Diseñar el control de humos: nadie sabe la solución.»", "tecnica", "Manda la calidad de la solución; luego se negocia el precio."),
      it("c12h06-05", "«La tostadora: importan precio y calidad.»", "costo-calidad", "El costo entra como factor junto con la calidad."),
      it("c12h06-06", "«Solo el fabricante puede reparar el quemador patentado.»", "unico", "Sin competencia posible y justificado: proveedor único, por excepción."),
      it("c12h06-07", "«Hay $60 M exactos para el recuperador; SOW preciso.»", "presupuesto", "Se publica el tope y gana la mejor técnica dentro."),
    ]),
    despues: [
      { id: "c12h06-08", subtemas: ["gp-12-1"],
        contexto: "La tostadora es nueva para Altamira y el riesgo es alto.",
        consigna: "¿Qué debe pesar más al elegir?",
        destinos: [{ id: "calidad", nombre: "Calidad" }, { id: "costo", nombre: "Costo" }],
        clave: "calidad", retros: { costo: "A más riesgo e incertidumbre, más peso a la calidad." } },
      { id: "c12h06-09", subtemas: ["gp-12-1"],
        consigna: "¿Publicas el método de evaluación en la RFP?",
        destinos: SI_NO, clave: "si", retros: { no: "Los oferentes invierten mucho: deben saber cómo los evaluarán." } },
    ],
  }],
};

/* ─── H07 · El marcador de las propuestas (2 etapas) ─── */
const total = (k) => ent(k, `Puntaje ponderado de ${k.toUpperCase()}`, T.totales[k], { tolerancia: 0.01 });
export const GP_C12_H07 = {
  id: "gp26-eje-c12-h07-puntajes",
  contexto: "Llegaron tres propuestas para la tostadora. Compras calificó cada criterio de 1 a 10; falta el puntaje ponderado.",
  rol: "Integras el comité evaluador de la tostadora.",
  consigna: "Calcula el puntaje ponderado de cada proveedor.",
  cierre: "Los criterios ponderados ordenan las propuestas y fijan con quién negociar primero.",
  subtemas: ["gp-12-2"],
  elenco: ["tu", "patrocinadora", "pmo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula el puntaje ponderado de cada proveedor.",
      pasos: [
        { tipo: "casillas", id: "c12h07-a", proveedor: "a", subtemas: ["gp-12-2"], consigna: "Calcula el puntaje ponderado del proveedor A.", casillas: [{ ...total("a"), retro: "A: 3,6 + 1,5 + 1,4 + 0,75 = 7,25." }] },
        { tipo: "casillas", id: "c12h07-b", proveedor: "b", subtemas: ["gp-12-2"], consigna: "Calcula el puntaje ponderado del proveedor B.", casillas: [{ ...total("b"), retro: "B: 2,4 + 2,25 + 1,6 + 1,35 = 7,6." }] },
        { tipo: "casillas", id: "c12h07-c", proveedor: "c", subtemas: ["gp-12-2"], consigna: "Calcula el puntaje ponderado del proveedor C.", casillas: [{ ...total("c"), retro: "C: 3,2 + 2,0 + 1,0 + 0,9 = 7,1." }] },
        { tipo: "ordenar", id: "c12h07-orden", subtemas: ["gp-12-2"],
          consigna: "Ordena la secuencia de negociación.",
          items: [{ id: "b", texto: "Proveedor B" }, { id: "a", texto: "Proveedor A" }, { id: "c", texto: "Proveedor C" }],
          retro: "Se negocia primero con el mejor ponderado: B, luego A, luego C." },
      ],
    },
    {
      tipo: "micros",
      consigna: "¿Qué oferta enciende la alarma y qué haces?",
      pasos: [
        { id: "c12h07-alarma", subtemas: ["gp-12-2"],
          contexto: "La estimación independiente dice $900 M. Ofertas: A $610 M, B $930 M, C $880 M.",
          consigna: "¿Qué oferta enciende la alarma y qué haces?",
          destinos: [{ id: "a", nombre: "A · $610 M" }, { id: "b", nombre: "B · $930 M" }, { id: "c", nombre: "C · $880 M" }],
          clave: "a", retros: { b: "B está 3 % arriba: diferencia normal.", c: "C está 2 % abajo: diferencia normal." } },
        { id: "c12h07-haces", subtemas: ["gp-12-2"],
          consigna: "¿Qué haces con la oferta de A?",
          ...tres("Aclarar el SOW con A: quizá no lo entendió",
            ["Elegir a A: es la más barata", "Una diferencia tan grande sugiere SOW ambiguo o mal entendido."],
            ["Descartar a A sin preguntar", "Primero verifica: la causa puede ser un SOW deficiente."]) },
        { id: "c12h07-pesos", subtemas: ["gp-12-2"], mesa: "pmo", revela: true,
          contexto: "Por el riesgo, Compras pasa experiencia técnica a 35 % y costo a 30 %.",
          consigna: "¿B gana por más o por menos?",
          destinos: [{ id: "mas", nombre: "Por más" }, { id: "menos", nombre: "Por menos" }],
          clave: "mas", retros: { menos: "B tiene la mejor nota técnica: subir ese peso lo favorece." } },
      ],
    },
  ],
};

/* ─── H08 · La conferencia de oferentes ─── */
const momento = (id, texto, bueno, otras, extra = {}) => ({ id, texto, subtemas: ["gp-12-2"], ...tres(bueno, ...otras), ...extra });
export const GP_C12_H08 = {
  id: "gp26-eje-c12-h08-conferencia",
  contexto: "Compras convocó a los tres proveedores a una reunión antes de que entreguen sus propuestas. Tú acompañas.",
  rol: "Diriges el proyecto; Compras dirige la licitación.",
  consigna: "Decide en cada momento de la licitación.",
  cierre: null,
  subtemas: ["gp-12-2"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Decide en cada momento de la licitación.",
    pasos: [
      momento("c12h08-1", "Momento 1 · «El proveedor C te llama a solas y pide planos que los otros no tienen.»", "Respondes en la conferencia, igual para los tres", [
        ["Se los mandas solo a C", "Eso es trato preferencial: rompe la igualdad entre oferentes."],
        ["No respondes a nadie", "La conferencia existe para aclarar dudas a todos por igual."],
      ], { favorece: { otra1: "c" }, despues: "Todos entienden lo mismo y nadie recibe trato preferencial." }),
      momento("c12h08-2", "Momento 2 · «Solo dos proveedores conocen la licitación.»", "Publicas el aviso en una revista del sector", [
        ["Invitas a un conocido del gerente", "Invitar por amistad no es anuncio abierto."],
        ["Sigues con dos", "Con más oferentes hay más opciones: se puede ampliar."],
      ], { despues: "La publicidad amplía la lista de vendedores potenciales." }),
      /* Distractor «Descalificas»: criterio de Gen (la guía solo dice que separar es buena práctica). */
      momento("c12h08-3", "Momento 3 · «B entrega el precio mezclado dentro de su propuesta técnica.»", "Pides el precio en documento aparte", [
        ["Lo aceptas así", "La guía recomienda separar precio y propuesta técnica."],
        ["Descalificas a B", "Basta pedir que lo separe; descalificar es desproporcionado."],
      ], { favorece: { otra1: "b" }, despues: "Buena práctica: precio separado de la propuesta técnica." }),
      momento("c12h08-4", "Momento 4 · «B gana. Su gerente te pide firmar hoy el contrato.»", "Lo firma quien Compras autorizó; tú acompañas", [
        ["Firmas tú: eres el director", "Firmar obliga a Altamira: lo hace quien tiene autoridad."],
        ["Firma la PMO", "La PMO apoya; firma quien tiene autoridad de compras."],
      ], { despues: "El director normalmente no está autorizado a firmar contratos." }),
      { id: "c12h08-5", subtemas: ["gp-12-2"], mesa: "patrocinadora",
        consigna: "Compra cara y riesgosa: ¿quién aprueba antes de adjudicar?",
        ...tres("La alta dirección",
          ["El proveedor", "El vendedor no aprueba su propia adjudicación."],
          ["El equipo", "Las compras complejas y caras suelen pedir aprobación de directivos."]) },
    ],
  }],
};

/* ─── H09 · El pasillo de la reclamación ─── */
export const GP_C12_H09 = {
  id: "gp26-moc-c12-h09-reclamacion",
  contexto: "El instalador movió la tubería de gas y cobra $18 M extra. Compras dice que eso ya estaba en el SOW.",
  rol: "Diriges el proyecto y debes destrabar el desacuerdo.",
  consigna: "Avanza por el pasillo solo lo necesario.",
  cierre: "Reclamación: se documenta, se negocia primero, luego ADR; apelar es lo último.",
  subtemas: ["gp-12-3"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "micros",
    consigna: "Avanza por el pasillo solo lo necesario.",
    pasos: [
      { id: "c12h09-1", subtemas: ["gp-12-3"], consigna: "¿Cómo se llama este desacuerdo?",
        ...tres("Reclamación", ["Riesgo", "Ya ocurrió: no es incertidumbre, es un cambio impugnado."], ["Incidente de calidad", "No falla la calidad: discuten la compensación del cambio."]),
        despues: "Sin acuerdo sobre si hubo cambio o cuánto vale: reclamación." },
      { id: "c12h09-2", subtemas: ["gp-12-3"], consigna: "¿Primer paso?", puerta: 1,
        ...tres("Negociar con el instalador", ["Ir a apelación", "Esa es la última puerta; primero se negocia."], ["Ignorarlo", "Las reclamaciones se documentan y gestionan durante todo el contrato."]),
        despues: "La negociación es el método preferido para toda reclamación." },
      { id: "c12h09-3", subtemas: ["gp-12-3"], mesa: "equipo",
        contexto: "Se descubre que el hámster le pidió de palabra mover la tubería.",
        consigna: "¿Qué es esa orden verbal?",
        ...tres("Un cambio constructivo", ["Un cambio aprobado", "Los cambios se aprueban por escrito antes de hacerse."], ["Nada", "Sí cuenta: puede sostener la reclamación del instalador."]),
        despues: "Instrucción del comprador que el vendedor toma como cambio: constructivo." },
      { id: "c12h09-4", subtemas: ["gp-12-3"], puerta: 2,
        contexto: "La negociación no llega a acuerdo.",
        consigna: "¿Siguiente puerta?",
        ...tres("La ADR que fija el contrato", ["Apelación directa", "Antes de apelar, el contrato prevé la ADR."], ["Retener todos los pagos", "Los pagos siguen los términos del contrato, no la presión."]),
        despues: "Sin acuerdo, se usa la resolución alternativa pactada en el contrato." },
      { id: "c12h09-5", subtemas: ["gp-12-3"],
        contexto: "Acuerdan $9 M.",
        consigna: "¿Cómo queda el acuerdo?",
        ...tres("Por escrito, como modificación del contrato", ["De palabra", "Lo hablado no se puede exigir; debe quedar escrito."], ["Solo en un correo al hámster", "Debe modificar el contrato, no un mensaje interno."]),
        despues: "Los cambios se acuerdan mutuamente y quedan por escrito." },
    ],
  }],
};

/* ─── H10 · El cinturón del supervisor (2 etapas) ─── */
export const GP_C12_H10 = {
  id: "gp26-moc-c12-h10-controlar",
  contexto: "La instalación avanza. Cada semana tienes que vigilar al proveedor sin frenar la obra.",
  rol: "Controlas el contrato de instalación con Compras.",
  consigna: "Saca la herramienta de control que pide cada tarea.",
  cierre: "Inspección revisa el trabajo; auditoría, el proceso; los pagos siguen al avance.",
  subtemas: ["gp-12-3"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Saca la herramienta de control que pide cada tarea.",
      destinos: [
        { id: "inspeccion", nombre: "Inspección" }, { id: "auditoria", nombre: "Auditoría" }, { id: "revision", nombre: "Revisión del desempeño" },
        { id: "valor", nombre: "Valor ganado y tendencias" }, { id: "reclamaciones", nombre: "Reclamaciones" },
      ],
      /* 6 de 8; siempre una de inspección y una de auditoría (cubrir: una de cada bolsillo). */
      partida: { n: 6, cubrir: true },
      banco: con("gp-12-3", [
        it("c12h10-01", "«Recorrer el galpón con el instalador para ver el montaje.»", "inspeccion", "Revisar el trabajo en el lugar, juntos: inspección."),
        it("c12h10-02", "«Revisar si las piezas recibidas cumplen el SOW.»", "inspeccion", "Revisión estructurada de los entregables: inspección."),
        it("c12h10-03", "«Revisar si Compras siguió el procedimiento al adjudicar.»", "auditoria", "Se revisa el proceso de compra, no la obra: auditoría."),
        it("c12h10-04", "«Usar el derecho, pactado en el contrato, de revisar el proceso del proveedor.»", "auditoria", "Los derechos de auditoría se pactan en el contrato."),
        it("c12h10-05", "«Comparar calidad, cronograma y costos con lo acordado.»", "revision", "Medir y comparar contra el acuerdo: revisión del desempeño."),
        it("c12h10-06", "«Calcular CPI y SPI del contrato.»", "valor", "Índices de desempeño del contrato: análisis del valor ganado."),
        it("c12h10-07", "«Pronosticar el costo final del contrato.»", "valor", "El pronóstico EAC sale del análisis de tendencias."),
        it("c12h10-08", "«El proveedor dice que un cambio le da derecho a cobrar más.»", "reclamaciones", "Desacuerdo sobre la compensación de un cambio: reclamación."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Calcula los índices y elige cómo pagar.",
      pasos: [
        { tipo: "casillas", id: "c12h10-11", subtemas: ["gp-12-3"],
          contexto: "Contrato de instalación: VP $40 M, VG $32 M, CR $36 M.",
          consigna: "Calcula CPI y SPI.",
          retro: "CPI = 32 ÷ 36 = 0,89; SPI = 32 ÷ 40 = 0,80.",
          casillas: [ent("cpi", "CPI", T.valorGanado.cpi, { tolerancia: 0.01 }), ent("spi", "SPI", T.valorGanado.spi, { tolerancia: 0.01 })] },
        { id: "c12h10-12", subtemas: ["gp-12-3"], consigna: "¿Cómo va el contrato?",
          ...tres("Atrasado y por encima del costo", ["Adelantado", "SPI menor que 1: va atrasado."], ["Bien", "Ambos índices bajo 1: atraso y sobrecosto."]) },
        { id: "c12h10-13", subtemas: ["gp-12-3"],
          contexto: "Compras propone tres formas de pagar lo que falta.",
          consigna: "¿Cuál controla mejor?",
          ...tres("Pago por cada entregable aceptado", ["Pago por horas trabajadas", "Pagar por entradas, como horas, controla menos que por entregables."], ["Todo por adelantado", "El pago debe corresponder al avance real del vendedor."]) },
      ],
    },
  ],
};

/* ─── H11 · La cerradura del cierre (2 etapas) ─── */
const DISCOS = [
  { id: "entregables", nombre: "Entregables aprobados" },
  { id: "reclamaciones", nombre: "Sin reclamaciones" },
  { id: "facturas", nombre: "Sin facturas pendientes" },
  { id: "pagos", nombre: "Pagos finales hechos" },
];
const caso = (id, texto, fallan, retro) => ({
  tipo: "casillas", id, texto, subtemas: ["gp-12-3"], retro,
  casillas: [
    ...DISCOS.map((d) => ({ id: d.id, nombre: d.nombre, columnas: 2, opciones: [{ id: "si", nombre: "✓ Sí" }, { id: "no", nombre: "✗ No" }], clave: fallan.includes(d.id) ? "no" : "si" })),
    { id: "decision", nombre: "La puerta", columnas: 2, opciones: [{ id: "abrir", nombre: "Abrir" }, { id: "cerrada", nombre: "No se puede cerrar" }], clave: fallan.length ? "cerrada" : "abrir" },
  ],
});
export const GP_C12_H11 = {
  id: "gp26-moc-c12-h11-cierre",
  contexto: "La tostadora ya tuesta. El proveedor quiere cerrar el contrato esta semana.",
  rol: "Verificas si el contrato se puede cerrar.",
  consigna: "Gira los discos: ¿se cumple cada condición?",
  cierre: "Sin reclamaciones, facturas ni pagos pendientes, y con todo aprobado: se cierra.",
  subtemas: ["gp-12-3"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Gira los discos: ¿se cumple cada condición?",
      /* Los cuatro casos en orden; el último siempre abre. */
      pasos: [
        caso("c12h11-1", "«Entregables aprobados. La reclamación del instalador sigue abierta. Facturas al día. Pago final hecho.»", ["reclamaciones"], "Con una reclamación pendiente no se cierra la adquisición."),
        caso("c12h11-2", "«Entregables aprobados, sin reclamaciones; falta pagar la última factura.»", ["facturas", "pagos"], "Facturas y pagos finales deben quedar saldados antes del cierre."),
        caso("c12h11-3", "«Todo pagado y sin reclamaciones, pero el equipo no ha aceptado la capacitación.»", ["entregables"], "El equipo debe aprobar todos los entregables antes del cierre."),
        caso("c12h11-4", "«Entregables aprobados, sin reclamaciones, sin facturas pendientes, pagos finales hechos.»", [], "Todo cumplido: ya se puede cerrar formalmente."),
        { id: "c12h11-5", subtemas: ["gp-12-3"], consigna: "¿Quién avisa el cierre al proveedor, y cómo?",
          ...tres("El administrador de adquisiciones autorizado, por escrito",
            ["Tú, por un mensaje de chat", "La notificación es formal y escrita, del administrador autorizado."],
            ["El hámster, de palabra", "De palabra no hay cierre formal."]) },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Marca lo que se actualiza en los activos de Altamira.",
      destinos: [{ id: "si", nombre: "Sí, al archivo" }, { id: "no", nombre: "No" }],
      partida: { todas: true },
      /* Los dos «No»: distractores construidos (criterio de Gen; la guía solo dice que el archivo es completo e indexado). */
      banco: con("gp-12-3", [
        it("c12h11-11", "«Evaluación del desempeño del proveedor.»", "si", "Documenta si podrá trabajar en proyectos futuros."),
        it("c12h11-12", "«Retirar de la lista de precalificados al instalador que incumplió.»", "si", "Un desempeño deficiente puede descalificar a un vendedor."),
        it("c12h11-13", "«Lecciones: resultado real frente al plan de adquisiciones original.»", "si", "Al final se compara lo real con lo proyectado."),
        it("c12h11-14", "«Archivo indexado con el contrato cerrado.»", "si", "El archivo de la adquisición va a los archivos finales."),
        it("c12h11-15", "«Borrar los correos con el proveedor.»", "no", "Al contrario: la documentación del contrato se archiva completa."),
        it("c12h11-16", "«Devolverle el SOW al proveedor.»", "no", "El SOW es parte de la documentación que guarda Altamira."),
      ]),
    },
  ],
};

/* ─── H12 · La ruta del contenedor (3 etapas) ─── */
export const PASOS_COMPRA_C12 = [
  { id: "sow", texto: "Preparar el SOW" },
  { id: "estimar", texto: "Estimar el costo de alto nivel" },
  { id: "anunciar", texto: "Anunciar la oportunidad" },
  { id: "lista", texto: "Lista breve de vendedores calificados" },
  { id: "documentos", texto: "Emitir los documentos de la licitación" },
  { id: "propuestas", texto: "Los vendedores presentan propuestas" },
  { id: "tecnica", texto: "Evaluación técnica" },
  { id: "costos", texto: "Evaluación de costos" },
  { id: "combinada", texto: "Evaluación final combinada" },
  { id: "negociar", texto: "Negociar y firmar" },
];
export const GP_C12_H12 = {
  id: "gp26-pla-c12-h12-taller",
  contexto: "La tostadora se fabrica en Europa, viaja en barco a Cartagena y sube a Manizales. Antes, hay que comprarla bien.",
  rol: "Diriges la compra completa de la tostadora.",
  consigna: "Ordena los diez pasos de la compra.",
  cierre: null,
  subtemas: ["gp-12-1", "gp-12-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena los diez pasos de la compra.",
      pasos: [{
        tipo: "ordenar", id: "c12h12-orden", subtemas: ["gp-12-1"], puntuaPosiciones: true,
        consigna: "Ordena los diez pasos de la compra.",
        items: PASOS_COMPRA_C12,
        retrosPar: {
          "sow-estimar": "Primero se define qué se compra; luego se estima su costo.",
          "anunciar-lista": "Se anuncia para atraer; luego se filtra una lista breve.",
          "documentos-propuestas": "Sin documentos de licitación, nadie puede proponer.",
          "tecnica-costos": "Primero se evalúa lo técnico; después, el costo.",
          "combinada-negociar": "Se elige la ganadora y luego se negocia y firma.",
        },
        /* Para un par sin retro propia (criterio de Gen). */
        retro: "Cada paso necesita el anterior: revisa el orden de la ficha.",
      }],
    },
    {
      tipo: "clasificar",
      consigna: "¿Quién hace cada paso en Altamira?",
      destinos: [{ id: "equipo", nombre: "Tú y el equipo del proyecto" }, { id: "compras", nombre: "Compras y Legal" }],
      partida: { todas: true },
      banco: con("gp-12-2", [
        /* «Escribir los requisitos técnicos del SOW» al equipo: criterio de Gen. */
        it("c12h12-11", "«Escribir los requisitos técnicos del SOW.»", "equipo", "Sale del alcance del proyecto: lo prepara el equipo."),
        it("c12h12-12", "«Asegurar que el equipo sepa lo necesario de compras.»", "equipo", "El director debe garantizar esa experiencia desde la planificación."),
        it("c12h12-13", "«Verificar que la compra cubra lo que el proyecto necesita.»", "equipo", "Esa responsabilidad es del equipo de dirección del proyecto."),
        it("c12h12-14", "«Dirigir la negociación.»", "compras", "La dirige alguien de adquisiciones autorizado a firmar."),
        it("c12h12-15", "«Revisar el contrato por ser legalmente vinculante.»", "compras", "Su carácter vinculante exige una aprobación más exhaustiva, a menudo legal."),
        it("c12h12-16", "«Firmar el contrato.»", "compras", "Firma quien tiene autoridad; el director normalmente no."),
      ]),
      despues: { id: "c12h12-17", subtemas: ["gp-12-2"],
        consigna: "Si Altamira fuera nueva y sin área de compras, ¿quién firmaría?",
        ...tres("Tú, como autorizador de compras",
          ["Nadie", "Alguien debe firmar: sin compras, puede hacerlo el director."],
          ["El proveedor", "El vendedor no firma por el comprador."]) },
    },
    {
      tipo: "micros",
      consigna: "Decide cuándo pedir la tostadora.",
      pasos: [
        { id: "c12h12-21", subtemas: ["gp-12-1"], revela: true,
          contexto: "Fabricarla y traerla tarda 8 meses. El diseño final del galpón estará en el mes 5; la obra termina en el mes 9.",
          consigna: "Decide cuándo pedir la tostadora.",
          destinos: [{ id: "mes1", nombre: "Pedirla en el mes 1 con los requisitos de alto nivel" }, { id: "mes5", nombre: "Esperar el diseño final (mes 5)" }, { id: "obra", nombre: "Pedirla al terminar la obra" }],
          clave: "mes1", retros: { mes5: "Llegaría en el mes 13: cuatro meses tarde.", obra: "Llegaría en el mes 17; el plazo largo manda." },
          despues: "Con plazo largo, se compra antes del diseño final, con requisitos conocidos." },
        { id: "c12h12-22", subtemas: ["gp-12-1"],
          consigna: "¿Qué más conviene identificar desde temprano?",
          ...tres("Un proveedor de respaldo",
            ["Nada más", "Se identifican fuentes primarias y también de respaldo."],
            ["Otro diseño de galpón", "El diseño no cambia el plazo de fabricación."]) },
      ],
    },
  ],
};

export const PIEZAS_TEXTO_C12 = [GP_C12_H01, GP_C12_H02, GP_C12_H03, GP_C12_H04, GP_C12_H05, GP_C12_H06, GP_C12_H07, GP_C12_H08, GP_C12_H09, GP_C12_H10, GP_C12_H11, GP_C12_H12];
