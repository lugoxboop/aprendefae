/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 6 «GESTIÓN DEL CRONOGRAMA» — LOS TEXTOS DE LAS
 * 12 HACER (lote 3)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c06-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 * Los cálculos usan el paso `tipo: "casillas"` (../comun/motores/Casillas.jsx).
 *
 * La red de la tienda de Cartagena (diseño §0) vive en RED_C6: la misma en
 * H04, H05, H07, H08, H09, H11 y H12, con el día 0 como inicio.
 *
 * Módulos y subtemas (gp06-* del diseño → procesos de ../estructura.js):
 *   gp06-planificar, gp06-conceptos → gp-6-1 · gp06-actividades → gp-6-2 ·
 *   gp06-pdm, gp06-dependencias, gp06-adelantos → gp-6-3 · gp06-estimar,
 *   gp06-reservas → gp-6-4 · gp06-ruta-critica, gp06-compresion,
 *   gp06-recursos, gp06-cronograma → gp-6-5 · gp06-controlar → gp-6-6.
 *   6.1–6.5 van en Planificación; H11 (6.6) en Monitoreo y Control. H12 mezcla
 *   y va con su proceso principal, Desarrollar el cronograma (6.5).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
const num = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, ...extra });

/* La red de la tienda (diseño §0): días laborables, todas FS, inicio en el día 0. */
export const RED_C6 = [
  { id: "A", nombre: "Firmar el arriendo", dur: 3, pre: [], es: 0, ef: 3, ls: 0, lf: 3, ht: 0, hl: 0 },
  { id: "B", nombre: "Diseñar la adecuación", dur: 5, pre: ["A"], es: 3, ef: 8, ls: 6, lf: 11, ht: 3, hl: 0 },
  { id: "C", nombre: "Permiso de obra", dur: 8, pre: ["A"], es: 3, ef: 11, ls: 3, lf: 11, ht: 0, hl: 0 },
  { id: "D", nombre: "Adecuar el local", dur: 10, pre: ["B", "C"], es: 11, ef: 21, ls: 11, lf: 21, ht: 0, hl: 0 },
  { id: "E", nombre: "Máquinas de espresso", dur: 6, pre: ["B"], es: 8, ef: 14, ls: 15, lf: 21, ht: 7, hl: 7 },
  { id: "F", nombre: "Instalar las máquinas", dur: 2, pre: ["D", "E"], es: 21, ef: 23, ls: 21, lf: 23, ht: 0, hl: 0 },
  { id: "G", nombre: "Contratar baristas", dur: 7, pre: ["A"], es: 3, ef: 10, ls: 12, lf: 19, ht: 9, hl: 0 },
  { id: "H", nombre: "Capacitar baristas", dur: 4, pre: ["G"], es: 10, ef: 14, ls: 19, lf: 23, ht: 9, hl: 9 },
  { id: "I", nombre: "Inauguración", dur: 0, pre: ["F", "H"], es: 23, ef: 23, ls: 23, lf: 23, ht: 0, hl: 0 },
];
export const LINEAS_C6 = [
  { id: "l1", nombre: "Línea 1", ruta: ["A", "C", "D", "F", "I"], suma: 23 },
  { id: "l2", nombre: "Línea 2", ruta: ["A", "B", "D", "F", "I"], suma: 20 },
  { id: "l3", nombre: "Línea 3", ruta: ["A", "B", "E", "F", "I"], suma: 16 },
  { id: "l4", nombre: "Línea 4", ruta: ["A", "G", "H", "I"], suma: 14 },
];

/* ─── H01 · El semáforo del plan (2 etapas) ─── */
const SEMAFORO = [{ id: "dentro", nombre: "✓ Dentro del umbral" }, { id: "actuar", nombre: "! Actuar" }];
const desviacion = (id, act, plan, real, pct, sem, retro, extra = {}) => ({
  tipo: "casillas", id, subtemas: ["gp-6-1"], texto: `${act} · planeado ${plan} días, real ${String(real).replace(".", ",")}`, plan, real, retro,
  formula: "Desviación = (real − planeado) ÷ planeado × 100",
  casillas: [num("pct", "Desviación", pct, { unidad: "%", ...extra }), { id: "semaforo", nombre: "Semáforo", opciones: SEMAFORO, clave: sem }],
});
export const GP_C6_H01 = {
  id: "gp26-pla-c06-h01-semaforo",
  contexto: "Antes de programar la tienda de Cartagena, la PMO pide el plan de gestión del cronograma por escrito.",
  rol: "Diriges el proyecto y redactas el plan con la PMO.",
  consigna: "Archiva cada decisión en la pestaña del plan.",
  cierre: null,
  subtemas: ["gp-6-1"],
  elenco: ["tu", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Archiva cada decisión en la pestaña del plan.",
      destinos: [
        { id: "metodologia", nombre: "Metodología y herramienta" },
        { id: "unidades", nombre: "Unidades de medida" },
        { id: "exactitud", nombre: "Nivel de exactitud" },
        { id: "umbrales", nombre: "Umbrales de control" },
        { id: "medicion", nombre: "Reglas de medición" },
        { id: "informes", nombre: "Formatos de informes" },
        { id: "iteraciones", nombre: "Iteraciones" },
      ],
      partida: { todas: true },
      banco: con("gp-6-1", [
        it("c6h01-01", "Usaremos el método de la ruta crítica y un programa de cronogramas.", "metodologia", "Qué método y qué software usar: metodología y herramienta."),
        it("c6h01-02", "Las duraciones se miden en días laborables.", "unidades", "Días, horas o metros son unidades de medida."),
        it("c6h01-03", "Las estimaciones aceptan un rango de ± 10 %.", "exactitud", "El rango aceptable de una estimación es el nivel de exactitud."),
        it("c6h01-04", "Si una actividad se desvía más de 10 %, se actúa.", "umbrales", "La variación permitida antes de actuar es un umbral de control."),
        it("c6h01-05", "El avance se mide con valor ganado: SV y SPI.", "medicion", "Cómo se mide el desempeño son reglas de medición."),
        it("c6h01-06", "El informe de avance sale cada lunes en una página.", "informes", "Formato y frecuencia de los informes van en su pestaña."),
        it("c6h01-07", "La campaña de lanzamiento irá en iteraciones de dos semanas.", "iteraciones", "Los periodos preestablecidos de trabajo son la duración de iteraciones."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Calcula la desviación y pon el semáforo.",
      /* 4 de 5; siempre la de 10 % exacto en el límite (B), que es la trampa. */
      partida: { n: 3, siempre: ["c6h01-12"] },
      banco: [
        desviacion("c6h01-08", "D · Adecuar el local", 10, 11, 10, "dentro", "1 ÷ 10 = 10 %: no pasa de 10 %, sigue en verde."),
        desviacion("c6h01-09", "C · Permiso de obra", 8, 10, 25, "actuar", "2 ÷ 8 = 25 %: supera el umbral, hay que actuar."),
        desviacion("c6h01-10", "G · Contratar baristas", 7, 7, 0, "dentro", "Real igual a planeado: no hay desviación."),
        desviacion("c6h01-11", "E · Máquinas de espresso", 6, 7, 17, "actuar", "1 ÷ 6 ≈ 17 %: pasa el umbral del 10 %.", { aceptadas: [16.7] }),
        desviacion("c6h01-12", "B · Diseñar la adecuación", 5, 5.5, 10, "dentro", "0,5 ÷ 5 = 10 %: justo en el límite, aún verde.", { trampa: true }),
      ],
      despues: { id: "c6h01-13", subtemas: ["gp-6-1"], barajar: true,
        contexto: "El equipo de mercadeo quiere trabajar tomando tareas de una cola, apenas hay gente libre.",
        consigna: "¿Qué tipo de programación es?",
        destinos: [{ id: "demanda", nombre: "A demanda (Kanban)" }, { id: "ruta", nombre: "Ruta crítica" }],
        clave: "demanda", retros: { ruta: "Tomar trabajo de una cola según capacidad es programación a demanda." } },
    },
  ],
};

/* ─── H02 · La linterna del túnel (2 etapas) ─── */
export const GP_C6_H02 = {
  id: "gp26-pla-c06-h02-linterna",
  contexto: "La EDT de la tienda ya está aprobada. Ahora hay que convertir sus paquetes de trabajo en actividades.",
  rol: "Diriges el proyecto y armas la lista de actividades.",
  consigna: "¿Actividad, hito o entregable de la EDT?",
  cierre: null,
  subtemas: ["gp-6-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Actividad, hito o entregable de la EDT?",
      destinos: [
        { id: "actividad", nombre: "Actividad" },
        { id: "hito", nombre: "Hito", pista: "duración 0" },
        { id: "entregable", nombre: "Entregable de la EDT", pista: "va en la EDT" },
      ],
      partida: { todas: true },
      banco: con("gp-6-2", [
        it("c6h02-01", "Pintar las paredes.", "actividad", "Es una acción con duración: actividad del cronograma."),
        it("c6h02-02", "Instalar la barra.", "actividad", "Es esfuerzo para completar el paquete: actividad."),
        it("c6h02-03", "Montar las luces.", "actividad", "Acción con inicio y fin: actividad."),
        it("c6h02-04", "Permiso de obra recibido.", "hito", "Es un evento puntual, sin duración: hito."),
        it("c6h02-05", "Inauguración de la tienda.", "hito", "Un evento significativo de duración cero: hito."),
        it("c6h02-06", "Local adecuado.", "entregable", "Es el entregable que el paquete produce: va en la EDT."),
        it("c6h02-07", "Barra instalada.", "entregable", "Un resultado verificable es entregable; la acción es \"instalar\"."),
      ]),
      despues: [
        { id: "c6h02-08", subtemas: ["gp-6-2"], barajar: true,
          consigna: "¿Cuántos días dura el hito «Inauguración»?",
          destinos: [{ id: "0", nombre: "0" }, { id: "1", nombre: "1" }, { id: "fiesta", nombre: "Lo que dure la fiesta" }],
          clave: "0", retro: "Los hitos tienen duración cero: son un punto." },
        { id: "c6h02-09", subtemas: ["gp-6-2"],
          contexto: "El contrato del centro comercial exige abrir el 1 de marzo.",
          consigna: "¿Ese hito es obligatorio u opcional?",
          destinos: [{ id: "obligatorio", nombre: "Obligatorio" }, { id: "opcional", nombre: "Opcional" }],
          clave: "obligatorio", retros: { opcional: "Lo exige el contrato: hito obligatorio." } },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Ilumina lo que ya puedes planificar en detalle.",
      destinos: [{ id: "hoy", nombre: "Detallar hoy", pista: "con la linterna" }, { id: "penumbra", nombre: "Dejar en penumbra", pista: "se detalla después" }],
      partida: { todas: true },
      banco: con("gp-6-2", [
        it("c6h02-10", "Firmar el arriendo (esta semana).", "hoy", "Lo cercano se planifica en detalle."),
        it("c6h02-11", "Diseñar la adecuación (próxima semana).", "hoy", "Ya se conoce bien: se detalla ahora."),
        it("c6h02-12", "Campaña de lanzamiento (en 4 meses).", "penumbra", "Lo lejano queda a alto nivel: planificación gradual."),
        it("c6h02-13", "Segunda temporada de menú (en 8 meses).", "penumbra", "Falta información: se descompone cuando se acerque."),
      ]),
      despues: { id: "c6h02-14", subtemas: ["gp-6-2"], barajar: true,
        contexto: "Al detallar la obra aparece «reforzar el piso», que no estaba en la línea base.",
        consigna: "¿Qué haces con eso?",
        destinos: [{ id: "cambio", nombre: "Solicitud de cambio" }, { id: "callado", nombre: "Lo agrego callado" }],
        clave: "cambio", retros: { callado: "Trabajo nuevo fuera de la línea base genera una solicitud de cambio." } },
    },
  ],
};

/* ─── H03 · Las piezas que encajan (2 etapas) ─── */
export const CONECTORES_C6 = [
  { id: "fs", nombre: "FS · Final a Inicio" },
  { id: "ss", nombre: "SS · Inicio a Inicio" },
  { id: "ff", nombre: "FF · Final a Final" },
  { id: "sf", nombre: "SF · Inicio a Final" },
];
export const GP_C6_H03 = {
  id: "gp26-pla-c06-h03-rompecabezas",
  contexto: "Ya tienes la lista de actividades de la tienda. Falta decir cómo se conecta cada una con otra.",
  rol: "Diriges el proyecto y secuencias las actividades con el equipo.",
  consigna: "Elige el conector que une estas dos piezas.",
  cierre: null,
  subtemas: ["gp-6-3"],
  elenco: ["tu", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Elige el conector que une estas dos piezas.",
      destinos: CONECTORES_C6,
      partida: { n: 3, siempre: ["c6h03-05"] },
      banco: con("gp-6-3", [
        it("c6h03-01", "Instalar las máquinas no empieza hasta terminar la adecuación.", "fs", "Una no empieza hasta que la otra termine: final a inicio."),
        it("c6h03-02", "Capacitar a los baristas solo después de contratarlos.", "fs", "Primero termina contratar; luego empieza capacitar: FS."),
        it("c6h03-03", "Revisar las fotos del menú no empieza antes de empezar la sesión de fotos.", "ss", "Una empieza cuando la otra ya empezó: inicio a inicio."),
        it("c6h03-04", "Editar el manual del barista no termina antes de terminar su redacción.", "ff", "Una no termina hasta que termine la otra: final a final."),
        it("c6h03-05", "El vigilante de noche no termina su turno hasta que empiece el de día.", "sf", "Para terminar, necesita que la otra empiece: inicio a final.", { trampa: true }),
      ]),
      despues: [
        { id: "c6h03-06", subtemas: ["gp-6-3"], barajar: true,
          consigna: "¿Qué relación conviene usar la mayor parte del tiempo?",
          destinos: [{ id: "fs", nombre: "FS" }, { id: "sf", nombre: "SF" }],
          clave: "fs", retros: { sf: "La FS es la más usada; la SF casi no se usa." } },
        { id: "c6h03-07", subtemas: ["gp-6-3"], mesa: "practicante",
          contexto: "El practicante puso SS y FF a la vez entre pintar y limpiar.",
          consigna: "¿Es buena idea?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "No se recomiendan dos relaciones entre las mismas actividades: elige una." } },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Ubica cada dependencia en su casilla.",
      destinos: [
        { id: "obl-int", nombre: "Obligatoria · Interna" },
        { id: "obl-ext", nombre: "Obligatoria · Externa" },
        { id: "dis-int", nombre: "Discrecional · Interna" },
        { id: "dis-ext", nombre: "Discrecional · Externa" },
      ],
      partida: { todas: true },
      banco: con("gp-6-3", [
        it("c6h03-08", "Sin el permiso de la alcaldía no puede empezar la obra.", "obl-ext", "La exige la ley y depende de la alcaldía: obligatoria externa."),
        it("c6h03-09", "No se puede probar la máquina sin instalarla.", "obl-int", "Es la naturaleza del trabajo y está en tus manos: obligatoria interna."),
        it("c6h03-10", "Por buena práctica, pintamos después de la instalación eléctrica.", "dis-int", "Otro orden sería posible: es lógica preferida, interna."),
        /* Criterio de Gen: la guía no da un ejemplo de discrecional externa. */
        it("c6h03-11", "La PMO prefiere esperar el estudio de la Cámara de Comercio para fijar precios.", "dis-ext", "No es obligatorio y depende de alguien de fuera: discrecional externa."),
      ]),
    },
  ],
};

/* ─── H04 · La cinta métrica (5 situaciones + 2 micro) ─── */
const cinta = (id, texto, clave, inicial, vinculo, retro, termina = false) => ({
  tipo: "casillas", id, subtemas: ["gp-6-3"], texto, vinculo, retro, termina,
  consigna: termina ? "Desliza la barra hasta el día en que termina." : "Desliza la barra hasta el día en que empieza.",
  casillas: [num("dia", termina ? "Termina el día" : "Empieza el día", clave, { flechas: true, inicial, min: 10, max: 25 })],
});
export const GP_C6_H04 = {
  id: "gp26-pla-c06-h04-cinta",
  contexto: "Algunas actividades de la tienda no van pegadas: unas se adelantan y otras deben esperar.",
  rol: "Diriges el proyecto y ajustas las fechas del cronograma.",
  consigna: "Desliza la barra hasta el día en que empieza.",
  cierre: null,
  subtemas: ["gp-6-3"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "micros",
    consigna: "Desliza la barra hasta el día en que empieza.",
    pasos: [
      { grupo: "cinta", barajar: true, items: [
        cinta("c6h04-01", "La pintura termina el día 15. El aviso se monta 3 días después, para que seque.", 18, 15, "FS + 3", "Termina en 15 y espera 3: 15 + 3 = 18."),
        cinta("c6h04-02", "Instalar máquinas termina el día 23. La capacitación empieza 2 días antes.", 21, 23, "FS − 2", "Un adelanto resta: 23 − 2 = 21."),
        cinta("c6h04-03", "La decoración empieza el día 12. El inventario del menú empieza 4 días después de empezarla.", 16, 12, "SS + 4", "Inicio a inicio con retraso: 12 + 4 = 16."),
        cinta("c6h04-04", "La obra termina el día 21. La limpieza final termina 1 día después.", 22, 21, "FF + 1", "Final a final con retraso de 1: 21 + 1 = 22.", true),
        cinta("c6h04-05", "El jardín de la terraza empieza 2 días antes de que termine la obra (día 21).", 19, 21, "FS − 2", "Adelanto de 2 sobre el final: 21 − 2 = 19."),
      ] },
      { id: "c6h04-06", subtemas: ["gp-6-3"], mesa: "equipo",
        contexto: "El hámster estima «pintar: 8 días», contando 3 de secado.",
        consigna: "¿Está bien meter el secado ahí?",
        destinos: [{ id: "no", nombre: "No: va como retraso" }, { id: "si", nombre: "Sí" }],
        clave: "no", retros: { si: "Las estimaciones de duración no incluyen adelantos ni retrasos." } },
      { id: "c6h04-07", subtemas: ["gp-6-3"], mesa: "equipo",
        contexto: "No sabe qué va primero y propone «arreglarlo» con un adelanto.",
        consigna: "¿Sirve un adelanto para eso?",
        destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
        clave: "no", retros: { si: "Los adelantos no deben reemplazar la lógica del cronograma." } },
    ],
  }],
};

/* ─── H05 · La sumadora de duraciones (2 etapas; 11 ítems) ─── */
const estacion = (id, tecnica, texto, casillas, retro, extra = {}) => ({ tipo: "casillas", id, subtemas: ["gp-6-4"], tecnica, texto, casillas, retro, ...extra });
export const GP_C6_H05 = {
  id: "gp26-pla-c06-h05-sumadora",
  contexto: "Cada actividad de la tienda necesita su duración. Tienes datos distintos para cada una.",
  rol: "Diriges el proyecto y estimas con el equipo.",
  consigna: "Calcula la duración con estos datos.",
  cierre: null,
  subtemas: ["gp-6-4"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula la duración con estos datos.",
      pasos: [
        estacion("c6h05-01", "1 · Análoga", "En Medellín, adecuar un local tomó 8 días. El de Cartagena es 25 % más grande.",
          [num("d", "Duración", 10, { unidad: "días" })], "Análoga ajustada: 8 × 1,25 = 10 días.", { red: "D" }),
        estacion("c6h05-02", "2 · Paramétrica", "Hay que pintar 360 m². Un pintor rinde 45 m² por día.",
          [num("d", "Duración", 8, { unidad: "días" })], "Cantidad ÷ rendimiento: 360 ÷ 45 = 8 días."),
        estacion("c6h05-03", "3 · Tres valores (triangular)", "Permiso de obra: optimista 5, más probable 7, pesimista 12 días.",
          [num("d", "Duración", 8, { unidad: "días" })], "Triangular: (5 + 7 + 12) ÷ 3 = 8 días.", { red: "C" }),
        estacion("c6h05-04", "4 · Ascendente", "Contratar baristas: publicar el aviso 2, entrevistas 3, exámenes médicos 2 días.",
          [num("d", "Duración", 7, { unidad: "días" })], "Se suman las partes: 2 + 3 + 2 = 7 días.", { red: "G" }),
        estacion("c6h05-05", "5 · Rango", "El proveedor dice: 2 semanas ± 2 días (semanas de 5 días).",
          [num("min", "Mínimo", 8, { unidad: "días" }), num("max", "Máximo", 12, { unidad: "días" })], "10 días ± 2: mínimo 8 y máximo 12."),
        /* Criterio de Gen: la guía da la beta en el cap. 7, para costos; se quita si el profesor no la usa. */
        estacion("c6h05-06", "Beta", "Permiso de obra: O = 5, M = 7, P = 12.",
          [num("d", "Duración", 7.5, { unidad: "días" })], "(5 + 28 + 12) ÷ 6 = 45 ÷ 6 = 7,5 días.",
          { consigna: "Con la fórmula beta, ¿cuánto da el permiso?", formula: "Beta: (O + 4M + P) ÷ 6", nota: "La guía da la beta en el cap. 7, para costos; aquí se aplica a duración.", criterioGen: true }),
      ],
    },
    {
      tipo: "clasificar",
      consigna: "¿Qué técnica usarías en cada caso?",
      destinos: [
        { id: "analoga", nombre: "Análoga" },
        { id: "parametrica", nombre: "Paramétrica" },
        { id: "tres", nombre: "Tres valores" },
        { id: "ascendente", nombre: "Ascendente" },
      ],
      partida: { todas: true },
      banco: con("gp-6-4", [
        it("c6h05-07", "Casi no hay información y la junta quiere una cifra hoy.", "analoga", "Con poca información y prisa, la análoga es rápida y barata."),
        it("c6h05-08", "Tienes datos históricos confiables de días por metro cuadrado.", "parametrica", "Una relación estadística por unidad es estimación paramétrica."),
        it("c6h05-09", "El permiso es muy incierto; quieres un rango con mejor y peor caso.", "tres", "Incertidumbre con escenarios: estimación basada en tres valores."),
        it("c6h05-10", "Nadie se atreve a estimar «abrir la tienda»; hay que partirla.", "ascendente", "Si no se puede estimar, se descompone y se suma: ascendente."),
      ]),
      despues: { id: "c6h05-11", subtemas: ["gp-6-4"], barajar: true,
        consigna: "¿Cuál es menos exacta, aunque más barata y rápida?",
        destinos: [{ id: "analoga", nombre: "Análoga" }, { id: "parametrica", nombre: "Paramétrica" }],
        clave: "analoga", retros: { parametrica: "La análoga cuesta menos y tarda menos, pero es menos exacta." } },
    },
  ],
};

/* ─── H06 · Pintores y alcancías (2 etapas) ─── */
/* Cifras de los pintores: criterio de Gen (la guía da la regla, no las cifras). */
export const PINTORES_C6 = { 1: 8, 2: 4.5, 4: 3, 8: 3.5 };
export const GP_C6_H06 = {
  id: "gp26-pla-c06-h06-alcancias",
  contexto: "La junta quiere abrir antes y pregunta: «¿Y si ponemos más pintores?». Un pintor tarda 8 días.",
  rol: "Diriges el proyecto y respondes a la junta con datos.",
  consigna: "Apuesta cuántos días tardan con más pintores.",
  cierre: null,
  subtemas: ["gp-6-4"],
  elenco: ["tu", "equipo", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Apuesta cuántos días tardan con más pintores.",
      pasos: [
        { id: "c6h06-01", subtemas: ["gp-6-4"], pintores: 2, revela: true, despues: "Con 2 pintores: 4,5 días.",
          consigna: "Con 2 pintores…",
          destinos: [{ id: "4", nombre: "4 días" }, { id: "4.5", nombre: "4,5 días" }, { id: "8", nombre: "8 días" }],
          clave: "4.5", retro: "Duplicar no reduce a la mitad: hay coordinación y riesgo." },
        { id: "c6h06-02", subtemas: ["gp-6-4"], pintores: 8, revela: true, despues: "Con 8 pintores: 3,5 días. Chocan y esperan turno.",
          consigna: "Con 8 pintores…",
          destinos: [{ id: "1", nombre: "1 día" }, { id: "3.5", nombre: "3,5 días" }, { id: "2", nombre: "2 días" }],
          clave: "3.5", retro: "Demasiados recursos pueden alargar la duración: más coordinación." },
        { id: "c6h06-03", subtemas: ["gp-6-4"], pintores: 8,
          consigna: "Pasar de 4 a 8 pintores…",
          destinos: [{ id: "mucho", nombre: "Ahorra mucho" }, { id: "no", nombre: "Ya no ahorra" }],
          clave: "no", retros: { mucho: "Rendimientos decrecientes: cada pintor extra aporta menos." } },
        { grupo: "conductas", consigna: "¿Cómo se llama cada conducta?",
          destinos: [{ id: "parkinson", nombre: "Ley de Parkinson" }, { id: "estudiante", nombre: "Síndrome del estudiante" }],
          items: con("gp-6-4", [
            { id: "c6h06-04", texto: "El equipo tenía 10 días y usó los 10, aunque bastaban 7.", clave: "parkinson", retro: "El trabajo se expandió hasta llenar el tiempo disponible." },
            { id: "c6h06-05", texto: "Nadie empezó hasta la víspera de la entrega.", clave: "estudiante", retro: "Dejar todo para el último momento: síndrome del estudiante." },
          ]) },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Lleva cada riesgo a la alcancía que lo cubre.",
      destinos: [
        { id: "contingencia", nombre: "Contingencia", pista: "dentro de la línea base" },
        { id: "gestion", nombre: "Gestión", pista: "fuera de la línea base" },
      ],
      partida: { todas: true },
      banco: con("gp-6-4", [
        it("c6h06-06", "Ya sabemos que la alcaldía puede demorar el permiso.", "contingencia", "Riesgo identificado y aceptado: reserva para contingencias."),
        it("c6h06-07", "Las lluvias de octubre pueden frenar la fachada.", "contingencia", "Es un conocido-desconocido: va en la contingencia."),
        it("c6h06-08", "Algo que hoy nadie imagina puede retrasar la obra.", "gestion", "Lo desconocido-desconocido lo cubre la reserva de gestión."),
        it("c6h06-09", "Un trabajo no previsto dentro del alcance aparece al final.", "gestion", "Trabajo no previsto: reserva de gestión, fuera de la línea base."),
      ]),
      despues: [
        { tipo: "casillas", id: "c6h06-10", subtemas: ["gp-6-4"],
          contexto: "La reserva para contingencias del permiso es el 25 % de 8 días.",
          consigna: "¿Cuántos días de reserva son?",
          casillas: [num("d", "Reserva", 2, { unidad: "días" })], retro: "8 × 0,25 = 2 días." },
        { id: "c6h06-11", subtemas: ["gp-6-4"], barajar: true,
          consigna: "¿Qué reserva queda dentro de la línea base?",
          destinos: [{ id: "contingencia", nombre: "Contingencia" }, { id: "gestion", nombre: "Gestión" }],
          clave: "contingencia", retros: { gestion: "La de gestión queda fuera de la línea base del cronograma." } },
      ],
    },
  ],
};

/* ─── H07 · El metro de la ruta crítica (3 etapas; 14 ítems) ─── */
const linea = (l, suma, retro) => ({
  tipo: "casillas", id: `c6h07-${l.id}`, subtemas: ["gp-6-5"], linea: l.id, texto: `${l.nombre}: ${l.ruta.join("–")}`, retro,
  casillas: [num("suma", "Suma de la línea", suma, { unidad: "días" })],
});
const adelante = (id, es, ef, retro) => ({
  tipo: "casillas", id: `c6h07-f${id}`, subtemas: ["gp-6-5"], estacion: id, sentido: "adelante",
  texto: (() => { const a = RED_C6.find((x) => x.id === id); return `${id} · ${a.nombre} (${a.dur} días) · espera a ${a.pre.join(" y ")}`; })(),
  retro, formula: "EF = ES + duración",
  casillas: [num("es", "Inicio temprano (ES)", es), num("ef", "Fin temprano (EF)", ef)],
});
const atras = (id, lf, ls, ht, retro) => ({
  tipo: "casillas", id: `c6h07-b${id}`, subtemas: ["gp-6-5"], estacion: id, sentido: "atras",
  texto: (() => { const a = RED_C6.find((x) => x.id === id); return `${id} · ${a.nombre} (${a.dur} días)`; })(),
  retro, formula: "LS = LF − duración · holgura = LS − ES",
  casillas: [num("lf", "Fin tardío (LF)", lf), num("ls", "Inicio tardío (LS)", ls), num("ht", "Holgura total", ht, { unidad: "días" })],
});
export const GP_C6_H07 = {
  id: "gp26-pla-c06-h07-metro",
  contexto: "La junta quiere saber cuándo abre Cartagena y qué actividades no pueden retrasarse ni un día.",
  rol: "Diriges el proyecto y calculas la ruta crítica.",
  consigna: "Suma cada línea y encuentra la más larga.",
  cierre: null,
  subtemas: ["gp-6-5"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Suma cada línea y encuentra la más larga.",
      pasos: [
        linea(LINEAS_C6[0], 23, "3 + 8 + 10 + 2 + 0 = 23."),
        linea(LINEAS_C6[1], 20, "3 + 5 + 10 + 2 + 0 = 20."),
        linea(LINEAS_C6[2], 16, "3 + 5 + 6 + 2 + 0 = 16."),
        linea(LINEAS_C6[3], 14, "3 + 7 + 4 + 0 = 14."),
        { id: "c6h07-ruta", subtemas: ["gp-6-5"], revela: true, despues: "Inauguración: día 23.",
          consigna: "¿Cuál es la ruta crítica?",
          destinos: LINEAS_C6.map((l) => ({ id: l.id, nombre: `${l.nombre} (${l.ruta.join("–")})` })),
          clave: "l1", retro: "La ruta crítica es la más larga: 23 días." },
      ],
    },
    {
      tipo: "micros",
      consigna: "Completa el inicio y el fin tempranos de cada estación.",
      pasos: [
        adelante("D", 11, 21, "D espera a B (8) y a C (11): empieza en el mayor, 11."),
        adelante("E", 8, 14, "E solo espera a B, que termina en 8: 8 + 6 = 14."),
        adelante("F", 21, 23, "F espera a D (21) y E (14): empieza en 21."),
        adelante("H", 10, 14, "H sigue a G, que termina en 10: 10 + 4 = 14."),
        adelante("I", 23, 23, "Espera a F (23) y H (14); un hito dura 0: 23."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Calcula el inicio tardío y la holgura total.",
      pasos: [
        atras("E", 21, 15, 7, "F empieza en 21: LS = 21 − 6 = 15; holgura = 7."),
        atras("B", 11, 6, 3, "B debe acabar antes de D (11) y E (15): el menor, 11."),
        atras("G", 19, 12, 9, "G debe acabar cuando empieza H tarde (19): 19 − 7 = 12."),
        { id: "c6h07-libre", subtemas: ["gp-6-5"], revela: true, despues: "G tiene holgura total 9, pero si se demora, H se mueve.",
          consigna: "¿Cuánto puede demorarse G sin mover a H?",
          destinos: [{ id: "0", nombre: "0 días" }, { id: "9", nombre: "9 días" }],
          clave: "0", retros: { 9: "H empieza en 10, justo cuando G termina: holgura libre 0." } },
      ],
    },
  ],
};

/* ─── H08 · Fichas de dominó (8 preguntas en orden; cada retraso parte de la red original) ─── */
const MUEVE = [{ id: "0", nombre: "No se mueve" }, ...[1, 2, 3, 4, 5].map((n) => ({ id: String(n), nombre: `Se mueve ${n} ${n === 1 ? "día" : "días"}` }))];
const retraso = (id, act, dias, clave, retro, extra = {}) => ({
  id, subtemas: ["gp-6-5"], ficha: act, dias, consigna: "Apuesta: ¿se mueve la inauguración? ¿Cuántos días?",
  contexto: `${act} (${RED_C6.find((x) => x.id === act).nombre.toLowerCase()}) se demora ${dias} días.`,
  destinos: MUEVE, clave, retro, revela: true, despues: clave === "0" ? "La inauguración sigue en el día 23." : `La inauguración pasa al día ${23 + Number(clave)}.`, ...extra,
});
export const GP_C6_H08 = {
  id: "gp26-pla-c06-h08-domino",
  contexto: "Ya conoces la ruta crítica y las holguras. Ahora llegan los retrasos de verdad, uno por día.",
  rol: "Diriges el proyecto y avisas a la junta si se mueve la inauguración.",
  consigna: "Apuesta: ¿se mueve la inauguración? ¿Cuántos días?",
  cierre: "La holgura total protege el fin; la libre protege a la siguiente actividad.",
  subtemas: ["gp-6-5"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Apuesta: ¿se mueve la inauguración? ¿Cuántos días?",
    pasos: [
      retraso("c6h08-1", "G", 5, "0", "G tiene 9 de holgura total: 5 no alcanzan a mover el fin."),
      { id: "c6h08-1b", subtemas: ["gp-6-5"], ficha: "G", dias: 5, vecina: "H",
        consigna: "¿Y la capacitación (H)?",
        destinos: [{ id: "si", nombre: "Sí, empieza 5 días después" }, { id: "no", nombre: "No se mueve" }],
        clave: "si", retro: "G tiene holgura libre 0: su sucesora H se corre." },
      retraso("c6h08-2", "C", 2, "2", "C es crítica, holgura 0: todo el retraso pasa al fin."),
      retraso("c6h08-3", "E", 8, "1", "E tiene 7 de holgura: 8 − 7 = 1 día de retraso."),
      retraso("c6h08-4", "B", 2, "0", "B tiene 3 de holgura total: 2 no mueven el fin."),
      { id: "c6h08-4b", subtemas: ["gp-6-5"], ficha: "B", dias: 2,
        consigna: "¿Qué sucesora de B se corre?",
        destinos: [{ id: "E", nombre: "E (máquinas)" }, { id: "D", nombre: "D (adecuar)" }],
        clave: "E", retro: "D espera al permiso hasta el 11; E sí arranca más tarde." },
      retraso("c6h08-5", "B", 4, "1", "Holgura 3, retraso 4: el fin se corre 4 − 3 = 1."),
      retraso("c6h08-6", "H", 9, "0", "Usa toda su holgura de 9: H se vuelve crítica."),
    ],
  }],
};

/* ─── H09 · La pista de relevos (2 etapas) ─── */
/* Cifras de la tabla de compra: del escenario (diseño §2 H09). */
export const COMPRA_C6 = [
  { id: "C", nombre: "C · Permiso", critica: true, costo: 2.0, max: 2 },
  { id: "D", nombre: "D · Adecuar", critica: true, costo: 1.2, max: 3 },
  { id: "F", nombre: "F · Instalar", critica: true, costo: 0.8, max: 1 },
  { id: "E", nombre: "E · Máquinas", critica: false, costo: 0.3, max: 3 },
  { id: "G", nombre: "G · Contratar", critica: false, costo: 0.2, max: 2 },
];
const NO_CRITICA = "Esa actividad no está en la ruta crítica: no adelanta la inauguración.";
const destinoCompra = (c) => ({ id: c.id, nombre: `${c.nombre} · $${String(c.costo.toFixed(1)).replace(".", ",")} M/día`, pista: c.critica ? "crítica" : "con holgura" });
export const GP_C6_H09 = {
  id: "gp26-pla-c06-h09-relevos",
  contexto: "La patrocinadora quiere inaugurar el día 20, no el 23. El alcance no se puede recortar.",
  rol: "Diriges el proyecto y buscas los tres días al menor costo.",
  consigna: "Compra los días que faltan: elige qué actividad acelerar y cuánto.",
  cierre: null,
  subtemas: ["gp-6-5"],
  elenco: ["tu", "patrocinadora", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Compra los días que faltan: elige qué actividad acelerar y cuánto.",
      pasos: [
        { id: "c6h09-d1", subtemas: ["gp-6-5"], compra: 1, consigna: "Día 1 de 3: ¿qué actividad aceleras?",
          destinos: COMPRA_C6.map(destinoCompra), clave: "F",
          retros: { E: NO_CRITICA, G: NO_CRITICA, C: "Funciona, pero cuesta más: F da el día a $0,8 millones.", D: "Llegas a 20, pero F era más barata: $3,6 millones." } },
        { id: "c6h09-d2", subtemas: ["gp-6-5"], compra: 2, consigna: "Día 2 de 3: F ya no da más. ¿Y ahora?",
          destinos: COMPRA_C6.filter((c) => c.id !== "F").map(destinoCompra), clave: "D",
          retros: { E: NO_CRITICA, G: NO_CRITICA, C: "Funciona, pero cuesta más: D da el día a $1,2 millones." } },
        { id: "c6h09-d3", subtemas: ["gp-6-5"], compra: 3, consigna: "Día 3 de 3: falta uno.",
          destinos: COMPRA_C6.filter((c) => c.id !== "F").map(destinoCompra), clave: "D",
          retros: { E: NO_CRITICA, G: NO_CRITICA, C: "Funciona, pero cuesta más: D da el día a $1,2 millones." } },
        { tipo: "casillas", id: "c6h09-costo", subtemas: ["gp-6-5"], compra: 4,
          consigna: "¿Cuánto costó lo más barato posible?",
          casillas: [num("m", "Costo extra", 3.2, { unidad: "millones" })], retro: "0,8 + 1,2 + 1,2 = 3,2 millones." },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "¿Dónde se puede solapar el relevo sin romper reglas?",
      destinos: [
        { id: "nopuede", nombre: "No se puede" },
        { id: "si21", nombre: "Sí: abre el día 21" },
        { id: "nosirve", nombre: "No sirve" },
      ],
      partida: { todas: true },
      banco: con("gp-6-5", [
        it("c6h09-s1", "Empezar la obra (D) antes de recibir el permiso (C).", "nopuede", "El permiso es una dependencia obligatoria legal: no se solapa."),
        /* Criterio de Gen: D → F es una buena práctica (discrecional), por eso se solapa. */
        it("c6h09-s2", "Instalar las máquinas (F) en la barra ya lista, 2 días antes de terminar la obra.", "si21", "D–F se vuelve FS − 2: la ruta crítica baja a 21.", { globo: "La PMO aclara: D → F es una buena práctica, no una obligación." }),
        it("c6h09-s3", "Empezar a contratar (G) antes de firmar el arriendo.", "nosirve", "G no es crítica: solaparla no adelanta la inauguración."),
      ]),
      despues: [
        { id: "c6h09-t1", subtemas: ["gp-6-5"], consigna: "¿Qué sube con cada técnica?", texto: "Intensificación",
          destinos: [{ id: "costo", nombre: "Costo" }, { id: "riesgo", nombre: "Riesgo y retrabajo" }],
          clave: "costo", retro: "Intensificar suma recursos y costo; solapar suma riesgo de retrabajo." },
        { id: "c6h09-t2", subtemas: ["gp-6-5"], consigna: "¿Qué sube con cada técnica?", texto: "Ejecución rápida",
          destinos: [{ id: "costo", nombre: "Costo" }, { id: "riesgo", nombre: "Riesgo y retrabajo" }],
          clave: "riesgo", retro: "Intensificar suma recursos y costo; solapar suma riesgo de retrabajo." },
      ],
    },
  ],
};

/* ─── H10 · La torre de bloques (2 etapas) ─── */
const RETRO_ENCIMA = "Encima de las luces pasaría de 8 h; después del 17 se acaba la holgura.";
export const GP_C6_H10 = {
  id: "gp26-pla-c06-h10-bloques",
  contexto: "El gerente funcional te presta un solo electricista, 8 horas al día. Dos actividades lo necesitan a la vez.",
  rol: "Diriges el proyecto y repartes las horas del electricista sin sobrecargarlo.",
  consigna: "Mueve los bloques para no pasar de 8 horas.",
  cierre: null,
  subtemas: ["gp-6-5"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Caso A: el aviso tiene 4 días de holgura.",
      pasos: [
        { tipo: "casillas", id: "c6h10-a1", subtemas: ["gp-6-5"], caso: "A", aviso: 12,
          consigna: "¿Cuántas horas tiene el electricista el día 12?",
          casillas: [num("h", "Horas del día 12", 16, { unidad: "h" })], retro: "Luces 8 h + aviso 8 h = 16 h: el doble de su capacidad." },
        { tipo: "casillas", id: "c6h10-a2", subtemas: ["gp-6-5"], caso: "A", mueve: true,
          consigna: "Mueve los bloques para no pasar de 8 horas.",
          texto: "El aviso dura 2 días. Puede ir hasta el día 17.",
          casillas: [num("dia", "El aviso empieza el día", 14, { flechas: true, inicial: 12, min: 11, max: 17, aceptadas: [15, 16] })], retro: RETRO_ENCIMA },
        { id: "c6h10-a3", subtemas: ["gp-6-5"], caso: "A", aviso: 14,
          consigna: "¿Se movió la inauguración?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "El aviso se movió dentro de su holgura: el fin no cambia." } },
        { id: "c6h10-a4", subtemas: ["gp-6-5"], caso: "A", aviso: 14, barajar: true,
          consigna: "¿Cómo se llama lo que hiciste?",
          destinos: [{ id: "estabilizacion", nombre: "Estabilización de recursos" }, { id: "nivelacion", nombre: "Nivelación de recursos" }],
          clave: "estabilizacion", retros: { nivelacion: "Mover solo dentro de la holgura, sin tocar el fin, es estabilización." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Caso B: las dos actividades son críticas, holgura 0.",
      pasos: [
        { tipo: "casillas", id: "c6h10-b1", subtemas: ["gp-6-5"], caso: "B", mueve: true,
          consigna: "Resuelve la sobrecarga y mira qué pasa con el fin.",
          texto: "Un solo electricista: el aviso tiene que esperar a las luces.",
          casillas: [num("dia", "El aviso empieza el día", 14, { flechas: true, inicial: 12, min: 11, max: 17 })],
          retro: "Las luces ocupan hasta el día 13: el aviso empieza el 14." },
        { tipo: "casillas", id: "c6h10-b2", subtemas: ["gp-6-5"], caso: "B", aviso: 14, corre: true,
          consigna: "¿Cuántos días se corre la inauguración?",
          casillas: [num("d", "Se corre", 2, { unidad: "días" })], retro: "El aviso terminaba en 13 y ahora en 15: 2 días más." },
        { id: "c6h10-b3", subtemas: ["gp-6-5"], caso: "B", aviso: 14, barajar: true,
          consigna: "¿Cómo se llama esta técnica?",
          destinos: [{ id: "nivelacion", nombre: "Nivelación de recursos" }, { id: "estabilizacion", nombre: "Estabilización" }],
          clave: "nivelacion", retros: { estabilizacion: "Ajustar fechas por el recurso, aunque se mueva el fin, es nivelación." } },
        { id: "c6h10-b4", subtemas: ["gp-6-5"], caso: "B", aviso: 14,
          consigna: "¿Puede cambiar la ruta crítica al nivelar?",
          destinos: SI_NO, clave: "si", retros: { no: "La nivelación a menudo cambia la ruta crítica original." } },
      ],
    },
  ],
};

/* ─── H11 · El rotafolio del lunes (2 etapas) ─── */
const par = (id, a, b, clave, retro) => ({
  id, subtemas: ["gp-6-6"], consigna: "¿Cuál de los dos retrasos atiendes ya?",
  destinos: [{ id: a[0], nombre: a[1] }, { id: b[0], nombre: b[1] }], clave, retro,
});
export const GP_C6_H11 = {
  id: "gp26-moc-c06-h11-rotafolio",
  contexto: "Semana 3 de obra. El informe del lunes trae retrasos y la gráfica del equipo de mercadeo.",
  rol: "Diriges el proyecto y decides qué se atiende primero.",
  consigna: "¿Cuál de los dos retrasos atiendes ya?",
  cierre: null,
  subtemas: ["gp-6-6"],
  elenco: ["tu", "equipo", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "¿Cuál de los dos retrasos atiendes ya?",
      pasos: [
        { grupo: "pares", barajar: true, items: [
          par("c6h11-01", ["D", "D (crítica) va 1 día atrasada"], ["G", "G (holgura 9) va 5 días atrasada"], "D", "Un retraso pequeño en la ruta crítica pesa más que uno grande con holgura."),
          par("c6h11-02", ["E", "E (holgura 7) va 3 días atrasada"], ["C", "C (crítica) va 1 día atrasada"], "C", "C no tiene holgura: ese día ya movió la inauguración."),
          par("c6h11-03", ["H", "H (holgura 9) va 2 días atrasada"], ["B", "B (holgura 3) va 3 días atrasada"], "B", "B consumió toda su holgura: ya es crítica."),
          par("c6h11-04", ["F", "F (crítica) está a tiempo"], ["E", "E (holgura 7) va 6 días atrasada"], "E", "E está a un día de volverse crítica: vigílala ya."),
        ] },
      ],
    },
    {
      tipo: "micros",
      consigna: "Lee la gráfica y pronostica cuándo termina la iteración.",
      pasos: [
        { tipo: "casillas", id: "c6h11-05", subtemas: ["gp-6-6"], grafica: "ideal",
          consigna: "¿Cuántas horas deberían quedar hoy según la línea ideal?",
          casillas: [num("h", "Horas ideales hoy (día 5)", 20, { unidad: "h" })], retro: "Ideal: 4 h por día; tras 5 días, 40 − 20 = 20." },
        { tipo: "casillas", id: "c6h11-06", subtemas: ["gp-6-6"], grafica: "ritmo",
          consigna: "¿A qué ritmo real va el equipo?",
          casillas: [num("h", "Ritmo real", 2, { unidad: "h por día" })], retro: "Hicieron 10 h en 5 días: 2 h por día." },
        { tipo: "casillas", id: "c6h11-07", subtemas: ["gp-6-6"], grafica: "tendencia",
          consigna: "Prolonga la tendencia: ¿qué día terminan?",
          casillas: [num("dia", "Terminan el día", 20, { flechas: true, inicial: 10, min: 5, max: 25 })], retro: "Quedan 30 h a 2 h por día: 15 días más, día 20." },
        { id: "c6h11-08", subtemas: ["gp-6-6"], grafica: "tendencia", mesa: "patrocinadora", barajar: true,
          contexto: "La junta, al ver esto, quiere mover la fecha de inauguración en la línea base.",
          consigna: "¿Cómo se mueve la línea base?",
          destinos: [{ id: "control", nombre: "Solicitud de cambio al control integrado" }, { id: "yo", nombre: "La edito yo hoy" }],
          clave: "control", retros: { yo: "La línea base del cronograma solo cambia con cambios aprobados en el control integrado." } },
      ],
    },
  ],
};

/* ─── H12 · El rollo del practicante (7 de 10: 5 con error y 2 correctas) ─── */
/*
 * Cada línea abre «Está correcta» y dos correcciones. La corrección buena es la
 * del diseño; la segunda corrección (la que no sirve) la puso Construcción
 * para que haya dos: Gen la revisa.
 */
const CORRECTA = { id: "correcta", nombre: "Está correcta" };
const linea12 = (id, texto, buena, mala, retro, subtema) => ({
  id, texto, subtemas: [subtema], retro,
  clave: buena ? "buena" : "correcta",
  destinos: [CORRECTA, ...(buena ? [{ id: "buena", nombre: buena }] : []), ...[].concat(mala).map((m, k) => ({ id: k ? `mala${k + 1}` : "mala", nombre: m }))],
  barajar: true,
});
export const GP_C6_H12 = {
  id: "gp26-pla-c06-h12-plotter",
  contexto: "El practicante imprimió el cronograma de la tienda para la junta. Tiene errores escondidos entre datos correctos.",
  rol: "Diriges el proyecto y lo revisas antes de la junta.",
  consigna: "Toca las líneas con error y corrígelas.",
  cierre: null,
  subtemas: ["gp-6-2", "gp-6-3", "gp-6-5", "gp-6-6"],
  elenco: ["tu", "practicante"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Toca las líneas con error y corrígelas.",
    partida: { porClave: { buena: 5, correcta: 2 } },
    banco: [
      linea12("c6h12-01", "Hito «Inauguración»: duración 2 días.", "Duración 0", "Duración 1 día", "Los hitos son un punto: duración cero.", "gp-6-2"),
      linea12("c6h12-02", "Ruta crítica: A–B–D–F (20 días).", "A–C–D–F (23 días)", "A–G–H (14 días)", "La crítica es la más larga: 23 días.", "gp-6-5"),
      linea12("c6h12-03", "Para abrir antes: intensificar G (contratar).", "Intensificar una actividad crítica", "Intensificar H (capacitar)", "G tiene holgura: acelerarla no adelanta la inauguración.", "gp-6-5"),
      linea12("c6h12-04", "Pintar: 8 días, incluidos 3 de secado.", "5 días + retraso de 3", "8 días + retraso de 3", "La duración no incluye retrasos: el secado va aparte.", "gp-6-3"),
      linea12("c6h12-05", "Ejecución rápida: empezar la obra antes del permiso.", "Solapar D y F", "Solapar A y C", "El permiso es obligatorio por ley: no se puede solapar.", "gp-6-5"),
      linea12("c6h12-06", "La fecha de fin se movió sin aprobación.", "Pedir el cambio al control integrado", "Avisar a la junta después", "La línea base solo cambia por control formal de cambios.", "gp-6-6"),
      linea12("c6h12-07", "Monte Carlo: 10 % de probabilidad de abrir el día 21; «es casi seguro».", "Es poco probable", "Es seguro", "Un 10 % de probabilidad significa que es poco probable.", "gp-6-5"),
      linea12("c6h12-08", "A no tiene predecesora: es la primera actividad.", null, ["A depende de B", "A empieza el día 3"], "Correcto: solo la primera y la última no tienen ambas.", "gp-6-3"),
      linea12("c6h12-09", "Reserva para contingencias de 2 días dentro de la línea base.", null, ["Va fuera de la línea base", "Debe ser de 0 días"], "Correcto: la contingencia va dentro de la línea base.", "gp-6-5"),
      linea12("c6h12-10", "Para la junta: diagrama de hitos con las fechas clave.", null, ["Mejor la red completa", "Mejor sin fechas"], "Correcto: el diagrama de hitos resume entregables y fechas clave.", "gp-6-5"),
    ],
  }],
};

export const PIEZAS_TEXTO_C6 = [GP_C6_H01, GP_C6_H02, GP_C6_H03, GP_C6_H04, GP_C6_H05, GP_C6_H06, GP_C6_H07, GP_C6_H08, GP_C6_H09, GP_C6_H10, GP_C6_H11, GP_C6_H12];
