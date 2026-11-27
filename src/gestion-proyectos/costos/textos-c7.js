/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 7 «GESTIÓN DE LOS COSTOS» — LOS TEXTOS DE LAS
 * 12 HACER (lote 4)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c07-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos fijos de la bodega de Santa Marta (diseño §0) viven en BODEGA_C7:
 * los mismos en las 12 piezas (y los que debe usar el Aprender de Jane). La
 * prueba gp-lote4 RECALCULA desde ahí cada clave de cálculo.
 *
 * Tolerancias del diseño §0: ±1 en enteros, ±0,01 en índices (casilla
 * `tolerancia`). Cifras negativas con el botón «− / +» (casilla `signo`).
 *
 * Módulos y subtemas (gp07-* del diseño → procesos de ../estructura.js):
 *   gp07-plan, gp07-panorama → gp-7-1 · gp07-tecnicas, gp07-tres-valores,
 *   gp07-exactitud, gp07-reservas (al estimar) → gp-7-2 · gp07-linea-base,
 *   gp07-financiamiento, gp07-reservas (al presupuestar) → gp-7-3 ·
 *   gp07-evm, gp07-variaciones, gp07-pronosticos, gp07-tcpi, gp07-control,
 *   gp07-cronograma-ganado → gp-7-4.
 *   7.1–7.3 (H01–H07) van en Planificación; 7.4 (H08–H12) en Monitoreo y
 *   Control. H12 mezcla y va con su proceso principal, Controlar los costos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
/* Un entero (±1) y un índice (±0,01), en millones. */
const ent = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, tolerancia: 1, ...(clave < 0 ? { signo: true } : {}), ...extra });
const ind = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, tolerancia: 0.01, ...extra });

/* Los datos fijos de la bodega (diseño §0). Millones de pesos. */
export const BODEGA_C7 = {
  paquetes: [
    { id: "estudios", nombre: "Estudios y terreno", partes: { suelos: 30, diseno: 70, permisos: 50 }, estimacion: 150, contingencia: 10, cuenta: "edificio" },
    { id: "obra", nombre: "Obra civil", partes: { cimientos: 200, estructura: 250, cubierta: 150 }, estimacion: 600, contingencia: 60, cuenta: "edificio" },
    { id: "estanterias", nombre: "Estanterías y montacargas", tres: { o: 200, m: 240, p: 340 }, estimacion: 250, contingencia: 20, cuenta: "equipamiento" },
    { id: "humedad", nombre: "Control de humedad", tres: { o: 80, m: 90, p: 160 }, estimacion: 100, contingencia: 10, cuenta: "equipamiento" },
  ],
  cuentas: { edificio: 820, equipamiento: 380 },
  estimaciones: 1100, contingencias: 100, bac: 1200, gestion: 80, presupuesto: 1280,
  mensual: [40, 60, 120, 180, 150, 150, 150, 150, 80, 60, 40, 20],
  /* Los escalones de financiamiento (acumulado al cierre de cada trimestre). */
  escalones: [220, 700, 1080, 1280],
  corte: { mes: 4, pv: 400, ev: 300, ac: 375, cv: -75, sv: -100, cpi: 0.8, spi: 0.75 },
};
/* El acumulado al final de cada mes (1 a 12). */
export const ACUMULADO_C7 = BODEGA_C7.mensual.reduce((a, v) => [...a, (a.at(-1) ?? 0) + v], []);

/* ─── H01 · Los cajones del plan (2 etapas) ─── */
export const GP_C7_H01 = {
  id: "gp26-pla-c07-h01-plan-costos",
  contexto: "Antes de estimar un solo peso, la PMO pide el plan de gestión de los costos de la bodega de Santa Marta.",
  rol: "Diriges el proyecto de la bodega y redactas el plan.",
  consigna: "Pon cada regla en su cajón del plan.",
  cierre: "El plan dice cómo se estima, presupuesta y controla el costo.",
  subtemas: ["gp-7-1"],
  elenco: ["tu", "practicante", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada regla en su cajón del plan.",
      destinos: [
        { id: "unidades", nombre: "Unidades" },
        { id: "precision", nombre: "Precisión" },
        { id: "exactitud", nombre: "Exactitud" },
        { id: "cuenta", nombre: "Cuenta de control" },
        { id: "umbral", nombre: "Umbral" },
        { id: "reglas", nombre: "Reglas de valor ganado" },
        { id: "informes", nombre: "Informes" },
      ],
      /* 7 de 9: una por cajón; Precisión y Reglas sortean entre sus dos fichas. */
      partida: { porClave: 1 },
      banco: con("gp-7-1", [
        it("c7h01-01", "La obra se mide en metros cuadrados; el personal, en horas.", "unidades", "Define en qué unidad se mide cada recurso."),
        it("c7h01-02", "Todas las cifras se redondean al millón más cercano.", "precision", "Redondear es el nivel de precisión, no de exactitud."),
        it("c7h01-03", "Redondear 995,59 a 1.000.", "precision", "Es un ejemplo de redondeo: nivel de precisión."),
        it("c7h01-04", "La estimación se acepta si cae dentro de ±10 %.", "exactitud", "Un rango aceptable con ± es el nivel de exactitud."),
        it("c7h01-05", "«Obra civil» lleva el código 2.0 de contabilidad.", "cuenta", "El componente de la EDT ligado a la contabilidad es la cuenta de control."),
        it("c7h01-06", "Si el costo se desvía más de 5 %, se actúa.", "umbral", "Es la variación permitida antes de tomar medidas."),
        it("c7h01-07", "El avance se mide por porcentaje completado en cada paquete.", "reglas", "Elegir la técnica de medición del valor ganado va en sus reglas."),
        it("c7h01-08", "La EAC también se calcula con fórmula, para validar la del equipo.", "reglas", "Fijar cómo se calcula la EAC es regla del valor ganado."),
        it("c7h01-09", "Informe de costos cada mes, en una página.", "informes", "Define formato y frecuencia de los informes de costos."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Responde lo que pregunta la patrocinadora.",
      pasos: [
        { id: "c7h01-10", subtemas: ["gp-7-1"], barajar: true,
          contexto: "La patrocinadora pregunta cómo pagar la bodega: con caja propia, emitiendo acciones o con un préstamo.",
          consigna: "¿Qué técnica usas para comparar esas opciones?",
          destinos: [{ id: "alternativas", nombre: "Análisis de alternativas" }, { id: "parametrica", nombre: "Estimación paramétrica" }, { id: "reserva", nombre: "Análisis de reserva" }],
          clave: "alternativas",
          retros: { parametrica: "La paramétrica calcula costos; aquí comparas formas de financiarte.", reserva: "Las reservas cubren riesgos; aquí eliges la financiación." } },
        { id: "c7h01-11", subtemas: ["gp-7-1"], barajar: true, mesa: "practicante", ciclo: true, revela: true,
          despues: "Costo del ciclo de vida: la operación de la bodega sube.",
          contexto: "El practicante propone quitar dos revisiones del diseño para ahorrar $20 millones.",
          consigna: "¿Qué costo puede subir después?",
          destinos: [{ id: "operar", nombre: "Operar y mantener la bodega" }, { id: "terreno", nombre: "El terreno" }, { id: "ninguno", nombre: "Ninguno" }],
          clave: "operar",
          retros: { terreno: "El terreno no depende del diseño; la operación sí.", ninguno: "Ahorrar en diseño puede encarecer el uso y mantenimiento." } },
        { id: "c7h01-12", subtemas: ["gp-7-1"],
          contexto: "Altamira encarga las estanterías. Compras anota el costo al pedirlas; contabilidad, al pagarlas; la PMO, al recibirlas.",
          consigna: "¿Alguna de las tres está equivocada?",
          destinos: [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }],
          clave: "no", retros: { si: "Cada interesado puede medir el costo en un momento distinto." } },
      ],
    },
  ],
};

/* ─── H02 · Cuatro maneras de estimar ─── */
export const GP_C7_H02 = {
  id: "gp26-pla-c07-h02-metodos",
  contexto: "Hay que estimar la bodega de Santa Marta. El equipo trae cuatro formas distintas de calcular cuánto costará.",
  rol: "Diriges la bodega y eliges la técnica de cada cálculo.",
  consigna: "Lleva cada cálculo a su técnica de estimación.",
  cierre: "Análoga compara, paramétrica multiplica, ascendente suma y tres valores pondera escenarios.",
  subtemas: ["gp-7-2"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lleva cada cálculo a su técnica de estimación.",
    destinos: [
      { id: "analoga", nombre: "Análoga", pista: "foto de Manizales" },
      { id: "parametrica", nombre: "Paramétrica", pista: "plano por m²" },
      { id: "ascendente", nombre: "Ascendente", pista: "cajas que se suman" },
      { id: "tres", nombre: "Tres valores", pista: "O · M · P" },
    ],
    partida: { todas: true },
    banco: con("gp-7-2", [
      it("c7h02-01", "La bodega de Manizales costó $900 millones y es parecida: partimos de ahí.", "analoga", "Usa el costo de un proyecto anterior parecido: análoga."),
      it("c7h02-02", "La última obra de la PMO, del mismo tamaño, sirve de base.", "analoga", "Toma como base un proyecto similar anterior: análoga."),
      it("c7h02-03", "Obra civil: $1,2 millones por m² × 500 m² = $600 millones.", "parametrica", "Multiplica una tarifa histórica por una variable: paramétrica."),
      it("c7h02-04", "Estanterías: $50.000 por metro lineal × 5.000 metros.", "parametrica", "Relación estadística entre un dato histórico y la cantidad."),
      it("c7h02-05", "Cada paquete se estima en detalle y luego se suman todos.", "ascendente", "Detalle por paquete y suma hacia arriba: ascendente."),
      it("c7h02-06", "Cimientos 200 + estructura 250 + cubierta 150 = obra civil 600.", "ascendente", "Suma estimaciones detalladas de abajo hacia arriba: ascendente."),
      it("c7h02-07", "Estanterías: en el mejor caso 200, lo normal 240, en el peor 340.", "tres", "Optimista, más probable y pesimista: tres valores."),
      it("c7h02-08", "El equipo duda del costo del control de humedad y da tres cifras.", "tres", "Tres escenarios para reflejar la incertidumbre: tres valores."),
    ]),
  }],
};

/* ─── H03 · La calculadora de tres valores (2 etapas; explorar + 4 cálculos + 3 micros) ─── */
const TRIANGULAR = "Triangular: (cO + cM + cP) ÷ 3";
const BETA = "Beta: (cO + 4·cM + cP) ÷ 6";
const tres = (id, caso, o, m, p, formula, clave, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-7-2"], caso, o, m, p, metodo: formula === BETA ? "beta" : "triangular",
  texto: `${caso}: ${o} / ${m} / ${p} · ${formula === BETA ? "beta" : "triangular"}`, formula, retro,
  consigna: "Calcula el costo esperado con la fórmula indicada.",
  casillas: [ent("ce", "Costo esperado", clave, { unidad: "millones" })],
});
export const GP_C7_H03 = {
  id: "gp26-pla-c07-h03-tres-valores",
  contexto: "Para las estanterías, el equipo dio tres cifras: optimista 200, más probable 240 y pesimista 340 millones.",
  rol: "Diriges la bodega y fijas el costo esperado.",
  consigna: "Mueve las tres cifras y mira ambos resultados.",
  cierre: null,
  subtemas: ["gp-7-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Mueve las tres cifras y mira ambos resultados.",
      pasos: [
        { tipo: "explorar", id: "c7h03-explora", subtemas: ["gp-7-2"], minimo: 3,
          consigna: "Mueve las tres cifras y mira ambos resultados.",
          controles: [
            { id: "o", nombre: "cO · optimista", inicial: 200, min: 100, max: 400, salto: 10, unidad: "M" },
            { id: "m", nombre: "cM · más probable", inicial: 240, min: 100, max: 400, salto: 10, unidad: "M" },
            { id: "p", nombre: "cP · pesimista", inicial: 340, min: 100, max: 500, salto: 10, unidad: "M" },
          ] },
        tres("c7h03-01", "Estanterías", 200, 240, 340, TRIANGULAR, 260, "Suma las tres y divide entre 3: 780 / 3 = 260."),
        tres("c7h03-02", "Estanterías", 200, 240, 340, BETA, 250, "El más probable cuenta 4 veces: 1.500 / 6 = 250."),
        tres("c7h03-03", "Humedad", 80, 90, 160, BETA, 100, "80 + 4·90 + 160 = 600; entre 6 da 100."),
        tres("c7h03-04", "Humedad", 80, 90, 160, TRIANGULAR, 110, "80 + 90 + 160 = 330; entre 3 da 110."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Piensa qué hay detrás de cada resultado.",
      pasos: [
        { id: "c7h03-05", subtemas: ["gp-7-2"], barajar: true,
          consigna: "¿Por qué beta da menos que triangular aquí?",
          destinos: [{ id: "pesa", nombre: "Beta pesa más el más probable; el pesimista está lejos" }, { id: "ignora", nombre: "Beta ignora el pesimista" }, { id: "siempre", nombre: "Beta siempre da menos" }],
          clave: "pesa", retros: { ignora: "Beta sí usa el pesimista, solo que con menos peso.", siempre: "No siempre: depende de dónde esté el más probable." } },
        { id: "c7h03-06", subtemas: ["gp-7-2"], sube: 400, revela: true,
          despues: "Triangular pasa a 280 (+20); beta, a 260 (+10).",
          contexto: "El proveedor avisa: el peor caso sube a 400.",
          consigna: "¿Cuál resultado sube más?",
          destinos: [{ id: "triangular", nombre: "Triangular" }, { id: "beta", nombre: "Beta" }, { id: "igual", nombre: "Igual" }],
          clave: "triangular", retro: "En triangular el pesimista pesa 1/3; en beta, solo 1/6." },
        { id: "c7h03-07", subtemas: ["gp-7-2"], barajar: true,
          consigna: "¿Qué gana la estimación al usar tres valores?",
          destinos: [{ id: "incertidumbre", nombre: "Tiene en cuenta la incertidumbre y el riesgo" }, { id: "elimina", nombre: "Elimina el riesgo" }, { id: "contingencia", nombre: "Ya no hace falta contingencia" }],
          clave: "incertidumbre", retros: { elimina: "La incertidumbre sigue; solo queda reflejada en el rango.", contingencia: "La contingencia sigue cubriendo riesgos identificados." } },
      ],
    },
  ],
};

/* ─── H04 · El embudo de la exactitud (2 etapas) ─── */
export const GP_C7_H04 = {
  id: "gp26-pla-c07-h04-embudo",
  contexto: "En la fase de inicio estimaste la bodega en $1.000 millones. Ahora, con planos y cotizaciones, la reestimas en $1.200 millones.",
  rol: "Diriges la bodega y explicas los rangos a la patrocinadora.",
  consigna: "Arrastra los extremos al rango de la estimación ROM.",
  cierre: null,
  subtemas: ["gp-7-2"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Arrastra los extremos al rango de la estimación ROM.",
      pasos: [
        /* El imán de la ROM va de 50 en 50: 750 y 1.750 no caen en uno de 20 (diseño: «imán cada 20»). */
        { tipo: "casillas", id: "c7h04-01", subtemas: ["gp-7-2"], base: 1000, fase: "rom",
          consigna: "Arrastra los extremos al rango de la estimación ROM.",
          texto: "Estimación ROM: 1.000 millones",
          casillas: [ent("min", "Extremo bajo", 750, { flechas: true, salto: 50, inicial: 1000, min: 0, max: 2000, unidad: "M" }), ent("max", "Extremo alto", 1750, { flechas: true, salto: 50, inicial: 1000, min: 0, max: 2000, unidad: "M" })],
          retro: "La ROM va de −25% a +75%: de 750 a 1.750." },
        { tipo: "casillas", id: "c7h04-02", subtemas: ["gp-7-2"], base: 1200, fase: "definitiva",
          consigna: "Ahora ajusta el rango de la estimación de 1.200.",
          texto: "Estimación más adelante: 1.200 millones",
          despues: "Más información, rango más estrecho.",
          casillas: [ent("min", "Extremo bajo", 1140, { flechas: true, salto: 20, inicial: 1200, min: 1000, max: 1400, unidad: "M" }), ent("max", "Extremo alto", 1320, { flechas: true, salto: 20, inicial: 1200, min: 1000, max: 1400, unidad: "M" })],
          retro: "Más adelante va de −5% a +10%: de 1.140 a 1.320." },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Marca lo que debe llevar la base de las estimaciones.",
      destinos: [{ id: "va", nombre: "La cuelgo", pista: "va en la base" }, { id: "no", nombre: "La dejo", pista: "no va" }],
      partida: { todas: true },
      banco: con("gp-7-2", [
        it("c7h04-03", "Cómo se hizo la estimación.", "va", "Documentar el método es lo primero de la base."),
        it("c7h04-04", "Supuestos usados.", "va", "Los supuestos explican por qué la cifra es esa."),
        it("c7h04-05", "Restricciones conocidas.", "va", "Las restricciones conocidas limitan la estimación: van documentadas."),
        it("c7h04-06", "Riesgos incluidos al estimar.", "va", "Los riesgos incluidos al estimar deben quedar escritos."),
        it("c7h04-07", "Rango: 1.200 ± 10 %.", "va", "Indicar el rango muestra dónde se espera el costo."),
        it("c7h04-08", "Nivel de confianza.", "va", "El nivel de confianza dice cuánto fiarse de la cifra."),
        it("c7h04-09", "Quién la aprueba en la junta.", "no", "La base explica cómo se obtuvo la cifra, no quién la aprueba."),
        it("c7h04-10", "El valor ganado del mes.", "no", "El valor ganado se mide al controlar; no sustenta la estimación."),
        it("c7h04-11", "La cifra sola, sin rango.", "no", "Sin rango no se ve la incertidumbre de la estimación."),
      ]),
    },
  ],
};

/* ─── H05 · Dos barriles (2 etapas) ─── */
export const GP_C7_H05 = {
  id: "gp26-pla-c07-h05-reservas",
  contexto: "La bodega tiene riesgos conocidos y sorpresas imposibles de prever. Hay que guardar dinero para ambos.",
  rol: "Diriges la bodega y propones las reservas a la patrocinadora.",
  consigna: "¿Estimación, reserva para contingencias o reserva de gestión?",
  cierre: null,
  subtemas: ["gp-7-2", "gp-7-3"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Estimación, reserva para contingencias o reserva de gestión?",
      destinos: [
        { id: "estimacion", nombre: "Estimación", pista: "ladrillos" },
        { id: "contingencias", nombre: "Reserva para contingencias", pista: "barril pequeño" },
        { id: "gestion", nombre: "Reserva de gestión", pista: "barril con candado" },
      ],
      partida: { porClave: { contingencias: 3, gestion: 2, estimacion: 1 } },
      banco: con("gp-7-2", [
        it("c7h05-01", "Se sabe que lloverá; no cuántos días de obra se pierden.", "contingencias", "Riesgo identificado de impacto incierto: conocido-desconocido."),
        it("c7h05-02", "Puede haber retrabajo en la cubierta; no se sabe cuánto.", "contingencias", "Retrabajo previsto de tamaño desconocido: lo cubre la contingencia."),
        it("c7h05-03", "El acero puede subir; está en el registro de riesgos.", "contingencias", "Está en el registro de riesgos: la contingencia lo cubre."),
        it("c7h05-04", "Algo que nadie ha imaginado todavía.", "gestion", "Desconocido-desconocido: lo cubre la reserva de gestión."),
        it("c7h05-05", "Un imprevisto dentro del alcance que no está en ningún registro.", "gestion", "Trabajo no previsto dentro del alcance: reserva de gestión."),
        it("c7h05-06", "Cimientos: 200 millones.", "estimacion", "Es el costo estimado de un paquete, no una reserva."),
        it("c7h05-07", "Estructura: 250 millones.", "estimacion", "Costo estimado del trabajo; las reservas van aparte."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Decide qué pasa con cada barril.",
      pasos: [
        { id: "c7h05-08", subtemas: ["gp-7-3"],
          consigna: "¿Qué barril queda dentro de la línea base?",
          destinos: [{ id: "contingencias", nombre: "Barril pequeño · contingencias" }, { id: "gestion", nombre: "Barril grande · gestión" }],
          clave: "contingencias", retros: { gestion: "La reserva de gestión queda fuera; solo entra al presupuesto." } },
        { id: "c7h05-09", subtemas: ["gp-7-3"], barajar: true, mesa: "patrocinadora", candado: true, revela: true,
          despues: "La patrocinadora abre el candado: el monto entra a la línea base.",
          consigna: "Aparece un imprevisto. ¿Cómo usas la reserva de gestión?",
          destinos: [{ id: "cambio", nombre: "Se aprueba un cambio y el monto pasa a la línea base" }, { id: "quieras", nombre: "La gastas tú cuando quieras" }, { id: "sola", nombre: "Se gasta sola al aparecer el problema" }],
          clave: "cambio", retros: { quieras: "Es para control de la dirección: requiere cambio aprobado.", sola: "Nada se mueve solo: se aprueba el cambio primero." } },
        { id: "c7h05-10", subtemas: ["gp-7-3"], barajar: true,
          contexto: "Terminó la temporada de lluvias sin perder un día. Sobran $20 millones de contingencia.",
          consigna: "¿Qué puede pasar con ese dinero?",
          destinos: [{ id: "liberar", nombre: "Retirarse para liberar fondos a otros proyectos" }, { id: "mejoras", nombre: "Gastarse en mejoras no aprobadas" }, { id: "silencio", nombre: "Moverse en silencio a otro barril" }],
          clave: "liberar", retros: { mejoras: "Gastarlo en mejoras no aprobadas rompe el control de costos.", silencio: "Todo movimiento de reservas se documenta; nada en silencio." } },
        { tipo: "casillas", id: "c7h05-11", subtemas: ["gp-7-3"],
          consigna: "Calcula la línea base y el presupuesto del proyecto.",
          texto: "Estimaciones 1.100 · contingencias 100 · reserva de gestión 80",
          casillas: [
            ent("lb", "Línea base de costos", 1200, { unidad: "M", retro: "La línea base suma estimaciones y contingencias, sin gestión: 1.200." }),
            ent("pr", "Presupuesto del proyecto", 1280, { unidad: "M", retro: "Presupuesto = línea base 1.200 + reserva de gestión 80 = 1.280." }),
          ] },
      ],
    },
  ],
};

/* ─── H06 · La polea del presupuesto (2 etapas; 6 pares + 5 cálculos + 1 micro = 12) ─── */
const bloque = (id, nombre, clave, texto, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-7-3"], bloque: nombre, texto, retro,
  consigna: "Calcula cada bloque con los datos de la obra.",
  casillas: [ent("v", nombre, clave, { unidad: "M" })],
});
export const GP_C7_H06 = {
  id: "gp26-pla-c07-h06-polea",
  contexto: "Tienes las estimaciones de todas las actividades. La patrocinadora quiere ver cómo se convierten en el presupuesto aprobado.",
  rol: "Diriges la bodega y armas el presupuesto por niveles.",
  consigna: "Ordena los niveles de abajo hacia arriba.",
  cierre: null,
  subtemas: ["gp-7-3"],
  elenco: ["tu", "equipo", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena los niveles de abajo hacia arriba.",
      pasos: [{
        tipo: "ordenar", id: "c7h06-torre", subtemas: ["gp-7-3"], puntuaPares: true,
        consigna: "Ordena los niveles de abajo hacia arriba.",
        items: [
          { id: "actividades", texto: "Estimaciones de las actividades" },
          { id: "paquetes", texto: "Paquetes de trabajo" },
          { id: "cuentas", texto: "Cuentas de control" },
          { id: "contingencias", texto: "Reservas para contingencias", delgado: true },
          { id: "lineabase", texto: "Línea base de costos" },
          { id: "gestion", texto: "Reserva de gestión", delgado: true },
          { id: "presupuesto", texto: "Presupuesto del proyecto" },
        ],
        retrosPar: {
          "actividades-paquetes": "Las actividades se suman para formar cada paquete de trabajo.",
          "paquetes-cuentas": "Los paquetes se agregan en cuentas de control.",
          "cuentas-contingencias": "La suma de las cuentas de control da la línea base.",
          "contingencias-lineabase": "La contingencia entra antes: es parte de la línea base.",
          "lineabase-gestion": "La reserva de gestión no entra a la línea base.",
          "gestion-presupuesto": "El presupuesto es la línea base más la reserva de gestión.",
        },
      }],
    },
    {
      tipo: "micros",
      consigna: "Calcula cada bloque con los datos de la obra.",
      pasos: [
        bloque("c7h06-01", "Paquete «Obra civil»", 600, "Cimientos 200 · estructura 250 · cubierta 150", "Suma las tres actividades: 200 + 250 + 150 = 600."),
        bloque("c7h06-02", "Cuenta «Edificio»", 820, "Estudios 150 + 10 · obra civil 600 + 60", "Cada paquete con su contingencia: 160 + 660 = 820."),
        bloque("c7h06-03", "Cuenta «Equipamiento»", 380, "Estanterías 250 + 20 · humedad 100 + 10", "Cada paquete con su contingencia: 270 + 110 = 380."),
        bloque("c7h06-04", "Línea base de costos", 1200, "Edificio + Equipamiento", "820 + 380 = 1.200: suma de cuentas de control."),
        bloque("c7h06-05", "Presupuesto del proyecto", 1280, "Línea base + reserva de gestión 80", "1.200 + 80 = 1.280: línea base más reserva de gestión."),
        { id: "c7h06-06", subtemas: ["gp-7-3"], barajar: true,
          consigna: "¿Cuál de las dos cifras es el BAC?",
          destinos: [{ id: "1200", nombre: "1.200" }, { id: "1280", nombre: "1.280" }],
          clave: "1200", retros: { 1280: "El BAC es la línea base: sin reserva de gestión." } },
      ],
    },
  ],
};

/* ─── H07 · La curva S y los escalones (2 etapas) ─── */
/* Cada punto arranca a la altura del anterior (los meses de en medio se completan solos). */
const punto = (mes, clave, retro, inicial) => ({
  tipo: "casillas", id: `c7h07-m${mes}`, subtemas: ["gp-7-3"], mes, retro,
  consigna: "Arrastra cada punto a su costo acumulado.",
  texto: `Mes ${mes}`,
  casillas: [ent("v", `Acumulado al mes ${mes}`, clave, { flechas: true, salto: 20, inicial, min: 0, max: 1300, unidad: "M" })],
});
const escalon = (t, clave, retro, inicial) => ({
  tipo: "casillas", id: `c7h07-t${t}`, subtemas: ["gp-7-3"], trimestre: t, retro,
  consigna: "Ajusta cada escalón para cubrir el trimestre.",
  texto: `Escalón T${t} (cierre del mes ${t * 3})`,
  ...(t === 4 ? { despues: "El financiamiento llega en escalones, no parejo." } : {}),
  casillas: [ent("v", `Fondos acumulados al cierre de T${t}`, clave, { flechas: true, salto: 20, inicial, min: 0, max: 1400, unidad: "M" })],
});
export const GP_C7_H07 = {
  id: "gp26-pla-c07-h07-curva-s",
  contexto: "Ya tienes el gasto planeado de cada mes. El banco que financia la bodega pide la curva y los desembolsos por trimestre.",
  rol: "Diriges la bodega y preparas la solicitud de fondos.",
  consigna: "Arrastra cada punto a su costo acumulado.",
  cierre: null,
  subtemas: ["gp-7-3"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Arrastra cada punto a su costo acumulado.",
      pasos: [
        punto(2, 100, "Acumula: 40 + 60 = 100.", 0),
        punto(4, 400, "Suma hasta el mes 4: 100 + 120 + 180 = 400.", 100),
        punto(6, 700, "Acumula: 400 + 150 + 150 = 700.", 400),
        punto(8, 1000, "Acumula: 700 + 150 + 150 = 1.000.", 700),
        punto(10, 1140, "Acumula: 1.000 + 80 + 60 = 1.140.", 1000),
        { ...punto(12, 1200, "Al final llega a 1.200: el BAC.", 1140), despues: "La línea base por fases de tiempo se ve como curva S." },
      ],
    },
    {
      tipo: "micros",
      consigna: "Ajusta cada escalón para cubrir el trimestre.",
      pasos: [
        escalon(1, 220, "El escalón debe cubrir el gasto acumulado del trimestre: 220.", 0),
        escalon(2, 700, "Al cierre del mes 6 llevas 700 gastados.", 220),
        escalon(3, 1080, "Al cierre del mes 9 llevas 1.080.", 700),
        escalon(4, 1280, "Fondos totales = línea base 1.200 + reserva de gestión 80.", 1080),
        { id: "c7h07-c1", subtemas: ["gp-7-3"], barajar: true, limite: 620, revela: true, mesa: "patrocinadora",
          despues: "80 del mes 6 pasan al mes 7: la curva queda bajo el escalón.",
          contexto: "El banco avisa: en el segundo trimestre solo puede desembolsar hasta 620 acumulados.",
          consigna: "¿Qué haces con el trabajo del mes 6?",
          destinos: [{ id: "reprogramar", nombre: "Reprogramar parte al trimestre siguiente" }, { id: "despues", nombre: "Gastar igual y pagar después" }, { id: "contingencia", nombre: "Usar la reserva para contingencias" }],
          clave: "reprogramar", retros: { despues: "No puedes gastar fondos que no están comprometidos.", contingencia: "Las reservas cubren riesgos; el límite se concilia reprogramando." } },
        { id: "c7h07-c2", subtemas: ["gp-7-3"], barajar: true,
          consigna: "¿De dónde salen los requisitos de financiamiento?",
          destinos: [{ id: "lineabase", nombre: "De la línea base de costos" }, { id: "ev", nombre: "Del valor ganado" }, { id: "acta", nombre: "Del acta de constitución" }],
          clave: "lineabase", retros: { ev: "El valor ganado mide avance; no fija los fondos.", acta: "El acta da fondos preaprobados; los requisitos salen de la línea base." } },
      ],
    },
  ],
};

/* ─── H08 · Tres líneas en la lona (6 ítems en orden progresivo) ─── */
const CURVAS = [{ id: "pv", nombre: "PV" }, { id: "ev", nombre: "EV" }, { id: "ac", nombre: "AC" }];
const SIGNIFICA = [{ id: "sobre", nombre: "Sobre el costo" }, { id: "bajo", nombre: "Bajo el costo" }, { id: "atrasado", nombre: "Atrasado" }, { id: "adelantado", nombre: "Adelantado" }];
export const GP_C7_H08 = {
  id: "gp26-moc-c07-h08-lona",
  contexto: "Fin del mes 4. Sobre la lona de la obra están dibujadas tres curvas: lo planeado, lo logrado y lo gastado.",
  rol: "Diriges la bodega y lees el corte para la PMO.",
  consigna: "Pon a cada curva su nombre.",
  cierre: null,
  subtemas: ["gp-7-4"],
  elenco: ["tu"],
  etapas: [{
    tipo: "micros",
    consigna: "Pon a cada curva su nombre.",
    pasos: [
      { tipo: "casillas", id: "c7h08-01", subtemas: ["gp-7-4"], lona: "nombres",
        consigna: "Pon a cada curva su nombre.",
        casillas: [
          { id: "continua", nombre: "Continua, llega a 1.200", opciones: CURVAS, clave: "pv", columnas: 3, retro: "La planeada sigue la línea base hasta 1.200." },
          { id: "guiones", nombre: "Guiones, en 300 al corte", opciones: CURVAS, clave: "ev", columnas: 3, retro: "El valor ganado mide trabajo hecho a precio presupuestado: 300." },
          { id: "puntos", nombre: "Puntos, en 375 al corte", opciones: CURVAS, clave: "ac", columnas: 3, retro: "El costo real es lo gastado: 375, más que lo ganado." },
        ] },
      { tipo: "casillas", id: "c7h08-02", subtemas: ["gp-7-4"], lona: "corte",
        consigna: "¿Cuánto valor se ganó al corte?",
        texto: "Terminados los estudios (150) y el 75 % de los cimientos (200).",
        casillas: [ent("ev", "Valor ganado (EV)", 300, { unidad: "M" })], retro: "EV = 150 + 75% de 200 = 150 + 150 = 300." },
      { tipo: "casillas", id: "c7h08-03", subtemas: ["gp-7-4"], lona: "corte",
        consigna: "Calcula la variación del costo (CV).",
        casillas: [ent("cv", "CV", -75, { unidad: "M" })], retro: "CV = EV − AC = 300 − 375 = −75." },
      { tipo: "casillas", id: "c7h08-04", subtemas: ["gp-7-4"], lona: "corte",
        consigna: "Calcula la variación del cronograma (SV).",
        casillas: [ent("sv", "SV", -100, { unidad: "M" })], retro: "SV = EV − PV = 300 − 400 = −100." },
      { tipo: "casillas", id: "c7h08-05", subtemas: ["gp-7-4"], lona: "corte",
        consigna: "Cuelga en cada variación lo que significa.",
        casillas: [
          { id: "cv", nombre: "CV = −75", opciones: SIGNIFICA, clave: "sobre", retro: "CV negativa: gastaste más de lo que vale lo hecho." },
          { id: "sv", nombre: "SV = −100", opciones: SIGNIFICA, clave: "atrasado", retro: "SV negativa: hiciste menos de lo planeado." },
        ] },
      { id: "c7h08-06", subtemas: ["gp-7-4"], lona: "final", revela: true,
        despues: "La lona avanza al mes 12: PV y EV se juntan en 1.200.",
        consigna: "Al terminar la bodega, ¿cuánto valdrá la SV?",
        destinos: [{ id: "0", nombre: "0" }, { id: "-100", nombre: "−100" }, { id: "nose", nombre: "No se sabe" }],
        clave: "0", retros: { "-100": "Al final todo lo planeado ocurrió: la SV vuelve a cero.", nose: "Al terminar, EV iguala a PV: la SV es cero." } },
    ],
  }],
};

/* ─── H09 · Dos termómetros (2 etapas) ─── */
const CUADRANTES = [
  { id: "bajo-adelantada", nombre: "Bajo el costo y adelantada" },
  { id: "bajo-atrasada", nombre: "Bajo el costo y atrasada" },
  { id: "sobre-adelantada", nombre: "Sobre el costo y adelantada" },
  { id: "sobre-atrasada", nombre: "Sobre el costo y atrasada" },
];
const obra = (id, nombre, pv, ev, ac, clave, retro) => it(id, `${nombre} · PV ${pv} / EV ${ev} / AC ${ac}`, clave, retro, { pv, ev, ac });
export const GP_C7_H09 = {
  id: "gp26-moc-c07-h09-termometros",
  contexto: "La PMO pide los índices del corte del mes 4: valor planificado 400, valor ganado 300, costo real 375.",
  rol: "Diriges la bodega y presentas los índices a la PMO.",
  consigna: "Calcula los dos índices de la bodega.",
  cierre: null,
  subtemas: ["gp-7-4"],
  elenco: ["tu", "pmo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula los dos índices de la bodega.",
      pasos: [
        { tipo: "casillas", id: "c7h09-cpi", subtemas: ["gp-7-4"], indice: "cpi",
          consigna: "Calcula los dos índices de la bodega.", texto: "CPI = EV ÷ AC",
          casillas: [ind("cpi", "CPI", 0.8, { retro: "CPI = EV / AC = 300 / 375 = 0,80.", trampas: [{ valor: 1.25, retro: "Lo invertiste: el EV va arriba y el AC abajo." }] })] },
        { tipo: "casillas", id: "c7h09-spi", subtemas: ["gp-7-4"], indice: "spi",
          consigna: "Calcula los dos índices de la bodega.", texto: "SPI = EV ÷ PV",
          casillas: [ind("spi", "SPI", 0.75, { retro: "SPI = EV / PV = 300 / 400 = 0,75.", trampas: [{ valor: 1.33, retro: "Invertido: el SPI es EV sobre PV." }] })] },
        { id: "c7h09-lee", subtemas: ["gp-7-4"], barajar: true,
          consigna: "Lee el CPI de 0,80 en palabras.",
          destinos: [{ id: "centavos", nombre: "Por cada peso gastado se ganaron 80 centavos de trabajo" }, { id: "adelantado", nombre: "Va 80 % adelantado" }, { id: "ahorro", nombre: "Ahorró 20 %" }],
          clave: "centavos", retros: { adelantado: "El CPI mide costo, no avance del cronograma.", ahorro: "Menor que 1 es sobre el costo, no ahorro." } },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Clasifica cada obra según sus dos índices.",
      destinos: CUADRANTES,
      partida: { todas: true },
      banco: con("gp-7-4", [
        obra("c7h09-01", "Bodega de Santa Marta", 400, 300, 375, "sobre-atrasada", "EV menor que AC y que PV: ambos índices bajo 1."),
        obra("c7h09-02", "Tienda de Barranquilla", 100, 80, 64, "bajo-atrasada", "Gasta poco, pero hizo menos de lo planeado."),
        obra("c7h09-03", "Tienda de Cartagena", 100, 120, 150, "sobre-adelantada", "Avanzó más de lo planeado, pero gastando de más."),
        obra("c7h09-04", "Ruta de distribución", 50, 60, 48, "bajo-adelantada", "EV supera a AC y a PV: ambos índices sobre 1."),
      ]),
      despues: { id: "c7h09-05", subtemas: ["gp-7-4"], barajar: true,
        contexto: "La PMO compara la bodega con las otras obras del programa en el mismo corte.",
        consigna: "¿Qué índice mira primero la PMO?",
        destinos: [{ id: "cpi", nombre: "CPI" }, { id: "spi", nombre: "SPI" }],
        clave: "cpi", retros: { spi: "El CPI es la métrica más crítica del valor ganado." } },
    },
  ],
};

/* ─── H10 · El telescopio del final (3 etapas; 4 + 4 + 4 = 12) ─── */
const FORMULAS = [
  { id: "atipica", nombre: "EAC = AC + (BAC − EV)" },
  { id: "cpi", nombre: "EAC = BAC / CPI" },
  { id: "ambos", nombre: "EAC = AC + (BAC − EV) / (CPI × SPI)" },
  { id: "ascendente", nombre: "EAC = AC + ETC ascendente" },
];
const causa = (id, texto, clave, retro) => it(id, texto, clave, retro, { subtemas: ["gp-7-4"] });
const eac = (id, nombre, formula, clave, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-7-4"], causa: nombre, formula, retro,
  consigna: "Calcula la EAC de cada causa.", texto: `${nombre} · ${formula}`,
  casillas: [ent("eac", "EAC", clave, { unidad: "M" })],
});
export const GP_C7_H10 = {
  id: "gp26-moc-c07-h10-telescopio",
  contexto: "Con CPI 0,80 y SPI 0,75, la patrocinadora pregunta cuánto costará la bodega al final. Cada causa del desvío cambia la respuesta.",
  rol: "Diriges la bodega y pronosticas el costo final.",
  consigna: "Encaja la fórmula que corresponde a cada causa.",
  cierre: null,
  subtemas: ["gp-7-4"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Encaja la fórmula que corresponde a cada causa.",
      destinos: FORMULAS,
      partida: { todas: true },
      banco: [
        causa("c7h10-01", "Una tormenta única encareció la obra; lo que falta irá según presupuesto.", "atipica", "Si el desvío fue único, lo restante va a tasa presupuestada."),
        causa("c7h10-02", "El acero subió y seguirá caro todo el proyecto.", "cpi", "Si el CPI de hoy seguirá, se divide el BAC por el CPI."),
        causa("c7h10-03", "El atraso obliga a horas extra: costo y cronograma pesan juntos.", "ambos", "Si CPI y SPI influyen en lo que falta, se usan ambos."),
        causa("c7h10-04", "El plan ya no sirve: el equipo reestima lo que falta en 1.000.", "ascendente", "Si el plan inicial ya no vale, se reestima desde abajo."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Calcula la EAC de cada causa.",
      pasos: [
        eac("c7h10-05", "Tormenta", FORMULAS[0].nombre, 1275, "375 + (1.200 − 300) = 375 + 900 = 1.275."),
        eac("c7h10-06", "Acero", FORMULAS[1].nombre, 1500, "1.200 / 0,80 = 1.500."),
        eac("c7h10-07", "Horas extra", FORMULAS[2].nombre, 1875, "CPI × SPI = 0,60; 900 / 0,60 = 1.500; más 375."),
        eac("c7h10-08", "Reestimación", FORMULAS[3].nombre, 1375, "AC + ETC ascendente = 375 + 1.000 = 1.375."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Calcula lo que falta gastar y la variación final.",
      pasos: [
        { tipo: "casillas", id: "c7h10-09", subtemas: ["gp-7-4"], texto: "Caso del acero · EAC 1.500", formula: "ETC = EAC − AC",
          consigna: "Calcula lo que falta gastar y la variación final.",
          casillas: [ent("etc", "ETC", 1125, { unidad: "M" })], retro: "ETC = EAC − AC = 1.500 − 375 = 1.125." },
        { tipo: "casillas", id: "c7h10-10", subtemas: ["gp-7-4"], texto: "Caso del acero · EAC 1.500", formula: "VAC = BAC − EAC",
          consigna: "Calcula lo que falta gastar y la variación final.",
          casillas: [ent("vac", "VAC", -300, { unidad: "M" })], retro: "VAC = BAC − EAC = 1.200 − 1.500 = −300." },
        { id: "c7h10-11", subtemas: ["gp-7-4"], barajar: true,
          consigna: "¿Qué significa una VAC de −300?",
          destinos: [{ id: "sobre", nombre: "Terminará 300 millones sobre el presupuesto" }, { id: "sobran", nombre: "Sobran 300 millones" }, { id: "dias", nombre: "Va 300 días atrasada" }],
          clave: "sobre", retros: { sobran: "Negativa significa déficit: terminará por encima del BAC.", dias: "La VAC está en dinero, no en días." } },
        { id: "c7h10-12", subtemas: ["gp-7-4"], barajar: true, mesa: "patrocinadora",
          contexto: "La patrocinadora dice: «Supón que lo que falta saldrá según presupuesto».",
          consigna: "¿Qué necesitas para aceptar ese supuesto?",
          destinos: [{ id: "riesgos", nombre: "Un análisis de riesgos que lo respalde" }, { id: "nada", nombre: "Nada, es lo más optimista" }, { id: "firma", nombre: "Una firma de la PMO" }],
          clave: "riesgos", retros: { nada: "Con desempeño malo, suponer mejora exige respaldo de riesgos.", firma: "La guía pide un análisis de riesgos, no una firma." } },
      ],
    },
  ],
};

/* ─── H11 · La rampa del montacargas (7 ítems en orden) ─── */
export const GP_C7_H11 = {
  id: "gp26-moc-c07-h11-rampa",
  contexto: "La patrocinadora insiste: «Termina con los 1.200 aprobados». Llevas gastados 375 y ganados 300.",
  rol: "Diriges la bodega y mides qué tan cuesta arriba queda.",
  consigna: "Calcula el trabajo que falta (BAC − EV).",
  cierre: null,
  subtemas: ["gp-7-4"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Calcula el trabajo que falta (BAC − EV).",
    pasos: [
      { tipo: "casillas", id: "c7h11-01", subtemas: ["gp-7-4"],
        consigna: "Calcula el trabajo que falta (BAC − EV).",
        casillas: [ent("t", "Trabajo restante", 900, { unidad: "M" })], retro: "1.200 − 300 = 900 de trabajo por ganar." },
      { tipo: "casillas", id: "c7h11-02", subtemas: ["gp-7-4"],
        consigna: "Calcula los fondos que quedan (BAC − AC).",
        casillas: [ent("f", "Fondos restantes", 825, { unidad: "M" })], retro: "1.200 − 375 = 825 por gastar." },
      { id: "c7h11-03", subtemas: ["gp-7-4"],
        consigna: "¿La rampa subirá o bajará?",
        destinos: [{ id: "sube", nombre: "Sube" }, { id: "baja", nombre: "Baja" }, { id: "plana", nombre: "Plana" }],
        clave: "sube", retros: { baja: "Queda más trabajo que fondos: la rampa sube.", plana: "Solo sería plana con TCPI igual a 1." } },
      { tipo: "casillas", id: "c7h11-04", subtemas: ["gp-7-4"], tcpi: 1.09, formula: "TCPI = (BAC − EV) ÷ (BAC − AC)",
        despues: "La rampa se empina: el montacargas sube despacio.",
        consigna: "Calcula el TCPI para cumplir el BAC.",
        casillas: [ind("tcpi", "TCPI (BAC)", 1.09)], retro: "900 / 825 = 1,09: hay que rendir más que el plan." },
      { tipo: "casillas", id: "c7h11-05", subtemas: ["gp-7-4"], tcpi: 0.8, formula: "TCPI = (BAC − EV) ÷ (EAC − AC)",
        despues: "La rampa baja: el montacargas sube rápido.",
        consigna: "Calcula el TCPI con la EAC aprobada de 1.500.",
        casillas: [ind("tcpi", "TCPI (EAC)", 0.8)], retro: "900 / (1.500 − 375) = 900 / 1.125 = 0,80." },
      { id: "c7h11-06", subtemas: ["gp-7-4"], tcpi: 0.8, barajar: true,
        consigna: "¿Por qué ahora la rampa baja?",
        destinos: [{ id: "fondos", nombre: "Hay más fondos para lo que falta" }, { id: "equipo", nombre: "El equipo mejoró" }, { id: "trabajo", nombre: "Bajó el trabajo restante" }],
        clave: "fondos", retros: { equipo: "El desempeño no cambió; cambió la meta de fondos.", trabajo: "El trabajo restante sigue en 900." } },
      { id: "c7h11-07", subtemas: ["gp-7-4"], tcpi: 0.8,
        consigna: "En el TCPI, ¿mayor que 1 es bueno?",
        destinos: SI_NO, clave: "no", retros: { si: "Al revés que el CPI: en TCPI, mayor que 1 es más difícil." } },
    ],
  }],
};

/* ─── H12 · El libro de costos del practicante (6 de 10: 3 con error y 3 correctas) ─── */
export const GP_C7_H12 = {
  id: "gp26-moc-c07-h12-libro",
  contexto: "El practicante redactó el informe mensual de costos de la bodega. Antes de enviarlo a la junta, la PMO te pide revisarlo.",
  rol: "Eres director(a) y revisas el informe antes de firmarlo.",
  consigna: "Toca las frases con error y corrígelas.",
  cierre: "Firmas el informe: CV −75, CPI 0,80, EAC 1.500, VAC −300.",
  subtemas: ["gp-7-4", "gp-7-3"],
  elenco: ["tu", "practicante", "pmo"],
  etapas: [{
    tipo: "memorando",
    consigna: "Toca las frases con error y corrígelas.",
    membrete: "BODEGA DE SANTA MARTA · LIBRO DE COSTOS, MES 4",
    papel: "libro-contable",
    entregar: "Firmar el informe",
    partida: { conError: 3, correctas: 3 },
    frases: [
      { id: "c7h12-01", texto: "CV = AC − EV = 375 − 300 = +75: vamos bien.", error: true, subtema: "gp-7-4",
        buena: "CV = EV − AC = −75: sobre el costo.",
        malas: [{ texto: "CV = PV − AC = +25", retro: "La CV compara lo ganado con lo gastado, no lo planeado." }, { texto: "CV = EV − PV = −100", retro: "Esa resta es la SV, no la CV." }] },
      { id: "c7h12-02", texto: "Un CPI de 0,80 indica que gastamos menos de lo planeado.", error: true, subtema: "gp-7-4",
        buena: "CPI menor que 1: costo superior al planeado.",
        malas: [{ texto: "CPI de 0,80: vamos 20 % adelantados", retro: "El CPI mide costo, no cronograma." }, { texto: "CPI de 0,80: es neutro", retro: "Neutro sería exactamente 1,0." }] },
      { id: "c7h12-03", texto: "La reserva de gestión de 80 está incluida en la línea base de 1.200.", error: true, subtema: "gp-7-3",
        buena: "La línea base no incluye la reserva de gestión.",
        malas: [{ texto: "Está incluida en el BAC", retro: "El BAC es la línea base: tampoco la incluye." }, { texto: "Está dentro de la contingencia", retro: "Son reservas distintas: riesgos identificados frente a no previstos." }] },
      { id: "c7h12-04", texto: "El informe ya incluye la terraza, aunque su cambio no está aprobado.", error: true, subtema: "gp-7-4",
        buena: "Sacar del informe los cambios no aprobados.",
        malas: [{ texto: "Dejarla con nota de pendiente", retro: "Los cambios no aprobados no van en los informes de costos." }, { texto: "Aprobarla tú mismo", retro: "El aumento solo se aprueba en el control integrado de cambios." }] },
      { id: "c7h12-05", texto: "Gastamos menos que el mes pasado: el costo está controlado.", error: true, subtema: "gp-7-4",
        buena: "Sin compararlo con el trabajo hecho, el gasto solo no dice nada.",
        malas: [{ texto: "Gastamos menos que el PV: está controlado", retro: "Falta el EV: el gasto se compara con lo ganado." }, { texto: "Está controlado si el AC baja", retro: "Menos gasto puede ser menos avance; se mira EV frente a AC." }] },
      { id: "c7h12-06", texto: "La SV será cero cuando la bodega se termine.", error: false, subtema: "gp-7-4",
        retro: "Correcta: al final, todo lo planeado ya ocurrió." },
      { id: "c7h12-07", texto: "El CPI es la métrica más crítica del valor ganado.", error: false, subtema: "gp-7-4",
        retro: "Correcta: así lo considera la guía." },
      { id: "c7h12-08", texto: "Una CV negativa suele ser difícil de recuperar.", error: false, subtema: "gp-7-4",
        retro: "Correcta: por eso se vigila desde el primer corte." },
      { id: "c7h12-09", texto: "Usar la reserva de gestión exige aprobar un cambio a la línea base.", error: false, subtema: "gp-7-3",
        retro: "Correcta: el monto pasa a la línea base con aprobación." },
      { id: "c7h12-10", texto: "Con cronograma ganado, ES − AT mayor que 0 significa adelanto.", error: false, subtema: "gp-7-4",
        retro: "Correcta: es la variación del cronograma con cronograma ganado." },
    ],
  }],
};

export const PIEZAS_TEXTO_C7 = [GP_C7_H01, GP_C7_H02, GP_C7_H03, GP_C7_H04, GP_C7_H05, GP_C7_H06, GP_C7_H07, GP_C7_H08, GP_C7_H09, GP_C7_H10, GP_C7_H11, GP_C7_H12];
