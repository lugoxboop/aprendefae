/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 1 «INTRODUCCIÓN» — LOS TEXTOS DE LAS 14 HACER
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c1-c2-hacer.md (§2, H01 a H14). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 * Las claves marcadas «criterio de Gen» (H03, H14) viven aquí, en un solo
 * lugar. La prueba gp-textos.test.mjs mide los topes de palabras.
 *
 * Forma de cada pieza: { id, contexto, rol, consigna, cierre, subtemas,
 * elenco, etapas: [ { tipo, consigna, … } ] }. Los tipos y cómo se sortea
 * cada uno están en ../comun/preparar.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTEMAS = {
  "gp-proyecto": "Qué es un proyecto",
  "gp-fin": "Cuándo termina un proyecto",
  "gp-cambio-valor": "Cambio y valor del negocio",
  "gp-contexto": "Por qué nace un proyecto",
  "gp-importancia": "Importancia de la dirección de proyectos",
  "gp-ppp": "Proyecto, programa y portafolio",
  "gp-ciclo": "Ciclo de vida y fases",
  "gp-procesos": "Procesos y áreas de conocimiento",
  "gp-datos": "Datos, información e informes",
  "gp-adaptacion": "Guía y adaptación",
  "gp-documentos": "Documentos de negocio",
  "gp-exito": "Medidas de éxito",
  "gp-etica": "Código de ética",
};

/* Un ítem de clasificar: retro = lo que se lee si lo pone mal. */
const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });

/* ─── H01 · La bandeja de los lunes ─── */
export const GP_H01 = {
  id: "gp-h01-bandeja",
  contexto: "Lunes en Altamira. Llegan diez encargos a la bandeja de la gerencia.",
  rol: "Eres director(a) de proyectos recién contratado.",
  consigna: "Lleva cada encargo: ¿proyecto u operación?",
  cierre: "Proyecto: temporal y único. Operación: continua y repetitiva.",
  subtemas: ["gp-proyecto"],
  elenco: ["tu"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lleva cada encargo: ¿proyecto u operación?",
    destinos: [
      { id: "proyecto", nombre: "Proyecto", pista: "tiene inicio y fin", acierto: "Único y con final" },
      { id: "operacion", nombre: "Operación", pista: "se repite", acierto: "Se repite siempre" },
    ],
    partida: { porNivel: { 1: 4, 2: 4, 3: 2 } },
    banco: [
      it("h01-01", "Abrir la primera tienda en Medellín.", "proyecto", "Tiene final: cuando la tienda abre, el proyecto termina.", { nivel: 1 }),
      it("h01-02", "Tostar y empacar el café de cada día.", "operacion", "Se repite cada día sin final: es operación.", { nivel: 1 }),
      it("h01-03", "Reparar las grietas del puente de acceso.", "proyecto", "Es una corrección única, con fecha de cierre.", { nivel: 1 }),
      it("h01-04", "Pagar la nómina cada mes.", "operacion", "Se repite igual cada mes; no crea algo único.", { nivel: 1 }),
      it("h01-05", "Atender los pedidos de los clientes.", "operacion", "Es el trabajo continuo del negocio.", { nivel: 1 }),
      it("h01-06", "Crear la app de pedidos.", "proyecto", "Se crea una vez; usarla después sí es operación.", { nivel: 2 }),
      it("h01-07", "Fusionarse con una tostadora vecina.", "proyecto", "Una fusión ocurre una vez y tiene final definido.", { nivel: 2 }),
      it("h01-08", "Instalar un sistema nuevo de inventario.", "proyecto", "Instalarlo termina; usarlo a diario ya es operación.", { nivel: 2 }),
      it("h01-09", "Hacer el inventario semanal de bodega.", "operacion", "Rutina semanal sin final previsto.", { nivel: 2 }),
      it("h01-10", "Responder los correos de proveedores.", "operacion", "Trabajo del día a día que no termina.", { nivel: 2 }),
      it("h01-11", "Construir otra bodega, idéntica a la primera.", "proyecto", "Mismos materiales, pero otro lugar y momento: sigue siendo único.", { nivel: 3 }),
      it("h01-12", "Diseñar un curso nuevo para baristas.", "proyecto", "Diseñar el curso es único; dictarlo cada mes no.", { nivel: 3 }),
      it("h01-13", "Dictar cada mes el curso de baristas.", "operacion", "El curso ya existe; dictarlo se repite.", { nivel: 3 }),
      it("h01-14", "Obtener la certificación orgánica.", "proyecto", "Se logra una vez; mantenerla después es rutina.", { nivel: 3 }),
    ],
  }],
};

/* ─── H02 · ¿Se acaba o sigue? ───
 * La placa es el nombre corto de la causa que se colecciona en el estante
 * (sale de la retro de cada semana; no es texto nuevo de concepto). */
export const GP_H02 = {
  id: "gp-h02-reloj",
  contexto: "Llevas meses dirigiendo la app de pedidos. Cada semana pasa algo nuevo.",
  rol: "Diriges el proyecto de la app.",
  consigna: "¿El proyecto termina o sigue?",
  cierre: "Temporal = con inicio y fin, no corto.",
  subtemas: ["gp-fin"],
  elenco: ["tu"],
  etapas: [{
    tipo: "clasificar",
    consigna: "¿El proyecto termina o sigue?",
    destinos: [
      { id: "termina", nombre: "Termina" },
      { id: "sigue", nombre: "Sigue" },
    ],
    /* 5 de las 8 en el orden del banco (progresiva) y la especial siempre al final. */
    partida: { enOrden: 5, final: "h02-09" },
    banco: [
      it("h02-01", "La app funciona y cumple todo lo pedido.", "termina", "Se lograron los objetivos: ese es el final natural.", { placa: "Objetivos logrados" }),
      it("h02-02", "La patrocinadora avisa: se acabó el dinero del proyecto.", "termina", "Sin financiamiento disponible, el proyecto termina.", { placa: "Sin financiamiento" }),
      it("h02-03", "Altamira decide vender por WhatsApp; ya no quiere app.", "termina", "La necesidad dejó de existir: el proyecto termina.", { placa: "La necesidad ya no existe" }),
      it("h02-04", "Lleva dos años; dura demasiado.", "sigue", "Temporal no es corto: tiene fin, aunque dure años."),
      it("h02-05", "Hay un error menor en el botón de pago.", "sigue", "Un defecto se corrige; el objetivo y el final no cambian."),
      it("h02-06", "Se fue el único programador y no hay reemplazo posible.", "termina", "Sin recursos humanos disponibles, el proyecto no puede seguir.", { placa: "Sin recursos humanos" }),
      it("h02-07", "Una ley nueva prohíbe ese tipo de app.", "termina", "Causa legal: el proyecto se da por terminado.", { placa: "Causa legal" }),
      it("h02-08", "Ya está claro que la meta no podrá cumplirse.", "termina", "Si los objetivos no pueden cumplirse, el proyecto termina.", { placa: "Objetivos imposibles" }),
      it("h02-09", "El proyecto cerró. ¿La app desaparece con él?", "sigue-en-uso", "El proyecto termina; su entregable puede durar mucho más.", {
        especial: true,
        destinos: [{ id: "desaparece", nombre: "Desaparece" }, { id: "sigue-en-uso", nombre: "Sigue en uso" }],
      }),
    ],
  }],
};

/* ─── H03 · El sello del porqué (clave: criterio de Gen; la tabla 1-1 llegó ilegible) ─── */
export const GP_H03 = {
  id: "gp-h03-sellos",
  contexto: "La patrocinadora revisa ocho propuestas de proyecto. Quiere saber qué motiva cada una.",
  rol: "Asesoras a la patrocinadora de Altamira.",
  consigna: "Pon en cada propuesta el sello de su motivo.",
  cierre: "Un proyecto puede responder a más de un motivo; aquí buscabas el principal.",
  subtemas: ["gp-contexto"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Pon en cada propuesta el sello de su motivo.",
    destinos: [
      { id: "cumplir", nombre: "Cumplir", pista: "requisitos regulatorios, legales o sociales" },
      { id: "interesados", nombre: "Interesados", pista: "solicitudes o necesidades" },
      { id: "estrategia", nombre: "Estrategia", pista: "de negocio o tecnológica" },
      { id: "producto", nombre: "Producto", pista: "crear, mejorar o reparar" },
    ],
    partida: { porClave: 2 },
    banco: [
      it("h03-01", "Una ley nueva exige rotular el origen del café.", "cumplir", "Lo motiva una obligación legal, no una petición ni estrategia."),
      it("h03-02", "La autoridad ambiental exige tratar el agua de lavado.", "cumplir", "Es un requisito regulatorio: hay que cumplirlo."),
      it("h03-03", "La vereda no tiene agua potable y Altamira quiere ayudar.", "cumplir", "Responde a una necesidad social de la comunidad."),
      it("h03-04", "Los accionistas piden un informe de impacto que no existe.", "interesados", "Nace de lo que piden unos interesados concretos."),
      it("h03-05", "El cliente principal pide pedir por app.", "interesados", "El motivo es la solicitud del cliente, no una estrategia."),
      it("h03-06", "La junta decide entrar al mercado de la costa.", "estrategia", "Es un cambio de estrategia del negocio."),
      it("h03-07", "La gerencia decide pasar todos los sistemas a la nube.", "estrategia", "Es una decisión de estrategia tecnológica."),
      it("h03-08", "El puente de acceso tiene grietas.", "producto", "Hay que reparar algo que ya existe."),
      it("h03-09", "La empacadora deja bolsas mal selladas.", "producto", "Se trata de mejorar un proceso que falla."),
      it("h03-10", "Mejorar la receta del café de la tienda.", "producto", "Es mejorar un producto existente."),
    ],
  }],
};

/* ─── H04 · El puente al estado futuro (2 etapas) ─── */
const RETRO_TABLON = "Es parte del cambio: acerca a Altamira al estado futuro.";
export const GP_H04 = {
  id: "gp-h04-puente",
  contexto: "Hoy Altamira vende solo en Manizales. Con la tienda en Medellín llegaría a otra ciudad.",
  rol: "Diriges el proyecto de la tienda.",
  consigna: "Arma el puente con las actividades del proyecto.",
  cierre: "Un proyecto mueve a la organización del estado actual al futuro.",
  subtemas: ["gp-cambio-valor"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Arma el puente con las actividades del proyecto.",
      destinos: [
        { id: "puente", nombre: "Al puente", pista: "es del proyecto" },
        { id: "fuera", nombre: "No va", pista: "no te mueve de orilla" },
      ],
      partida: { todas: true },
      banco: [
        it("h04-01", "Alquilar el local", "puente", RETRO_TABLON),
        it("h04-02", "Adecuar el local", "puente", RETRO_TABLON),
        it("h04-03", "Contratar baristas nuevos", "puente", RETRO_TABLON),
        it("h04-04", "Inaugurar la tienda", "puente", RETRO_TABLON),
        it("h04-05", "Tostar el café de hoy", "fuera", "Es operación de todos los días: no te mueve de orilla."),
        it("h04-06", "Pagar la nómina del mes", "fuera", "Es rutina: no lleva a Altamira al estado futuro."),
      ],
    },
    {
      tipo: "clasificar",
      consigna: "¿Beneficio tangible o intangible?",
      destinos: [
        { id: "tangible", nombre: "Tangible" },
        { id: "intangible", nombre: "Intangible" },
      ],
      partida: { todas: true },
      banco: [
        it("h04-07", "Ingresos de la tienda nueva.", "tangible", "Es dinero: un activo monetario que se cuenta."),
        it("h04-08", "Más participación en el mercado.", "tangible", "La guía la pone entre los beneficios tangibles."),
        it("h04-09", "Máquinas de espresso propias.", "tangible", "Son herramientas: se ven y se cuentan."),
        it("h04-10", "Reconocimiento de la marca en Medellín.", "intangible", "Es reconocimiento de marca: no se toca."),
        it("h04-11", "Mejor reputación de Altamira.", "intangible", "La reputación es valor intangible."),
        it("h04-12", "Encaja con la estrategia de crecer.", "intangible", "Es alineación estratégica: valor intangible."),
      ],
    },
  ],
};

/* ─── H05 · Arma el mapa de Altamira (2 etapas) ─── */
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
export const GP_H05 = {
  id: "gp-h05-portafolio",
  contexto: "La junta de Altamira quiere ver todo su trabajo en un solo mapa.",
  rol: "Te piden armar el mapa para la junta.",
  consigna: "Ubica cada iniciativa en su lugar del mapa.",
  cierre: null,
  subtemas: ["gp-ppp"],
  elenco: ["tu", "patrocinadora", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Ubica cada iniciativa en su lugar del mapa.",
      destinos: [
        { id: "programa", nombre: "Programa «Expansión a la costa»" },
        { id: "sueltos", nombre: "Proyectos sueltos" },
        { id: "operaciones", nombre: "Operaciones" },
      ],
      partida: { todas: true },
      banco: [
        it("h05-01", "Tienda en Barranquilla.", "programa", "Comparte meta con las otras obras costeñas: van coordinadas."),
        it("h05-02", "Tienda en Cartagena.", "programa", "Es parte de la expansión: se gestiona junto a las demás."),
        it("h05-03", "Bodega en Santa Marta.", "programa", "Abastece a las tiendas costeñas: depende del programa."),
        it("h05-04", "App de pedidos.", "sueltos", "No depende de la costa: proyecto independiente del portafolio."),
        it("h05-05", "Reparar el puente de la finca.", "sueltos", "No se relaciona con la costa; igual está en el portafolio."),
        it("h05-06", "Tostar el café cada día.", "operaciones", "Es producción continua: operación, también dentro del portafolio."),
        it("h05-07", "Atender los pedidos.", "operaciones", "Trabajo continuo: operación."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Cuatro preguntas de la junta.",
      pasos: [
        { id: "h05-m1", contexto: "Un miembro de la junta dice que el programa es un proyecto grande.", consigna: "¿Tiene razón?",
          destinos: SI_NO, clave: "no", retros: { si: "Un programa agrupa proyectos relacionados; uno enorme es un megaproyecto." } },
        { grupo: "frases", consigna: "Arrastra cada frase al nivel que la cumple.", barajar: true,
          destinos: [{ id: "portafolio", nombre: "Portafolio" }, { id: "proyecto-programa", nombre: "Proyecto y programa" }],
          items: [
            { id: "h05-m2a", texto: "Hacer los proyectos correctos", clave: "portafolio" },
            { id: "h05-m2b", texto: "Hacer el proyecto de la manera correcta", clave: "proyecto-programa" },
          ],
          retro: "El portafolio elige qué hacer; proyectos y programas, cómo hacerlo bien." },
        { id: "h05-m3", contexto: "Otra empresa construye una vía de US$ 1.500 millones que afecta a dos millones de personas.", consigna: "¿Cómo se llama eso?",
          destinos: [{ id: "megaproyecto", nombre: "Megaproyecto" }, { id: "programa", nombre: "Programa" }, { id: "portafolio", nombre: "Portafolio" }],
          clave: "megaproyecto",
          retros: { programa: "Es un solo proyecto, solo que enorme.", portafolio: "Un portafolio agrupa muchas iniciativas; esto es una sola." } },
        { id: "h05-m4", contexto: "La tienda de Cartagena abrió.", consigna: "¿A quién entrega el proyecto la tienda?",
          destinos: [{ id: "operaciones", nombre: "Operaciones" }, { id: "pmo", nombre: "PMO" }, { id: "patrocinadora", nombre: "Patrocinadora" }],
          clave: "operaciones",
          retros: { pmo: "La PMO apoya proyectos; quien la opera a diario es operaciones.", patrocinadora: "La patrocinadora autoriza; la tienda pasa a operarse a diario." } },
      ],
    },
  ],
};

/* ─── H06 · Cinco formas de hacer la app (emparejar con retro por par) ─── */
export const CICLOS = [
  { id: "predictivo", nombre: "Predictivo" },
  { id: "iterativo", nombre: "Iterativo" },
  { id: "incremental", nombre: "Incremental" },
  { id: "adaptativo", nombre: "Adaptativo (ágil)" },
  { id: "hibrido", nombre: "Híbrido" },
];
export const GP_H06 = {
  id: "gp-h06-lineas",
  contexto: "Cinco equipos hicieron apps de pedidos parecidas, cada uno a su manera. Mira sus líneas de tiempo.",
  rol: "Debes nombrar el ciclo de vida de cada equipo.",
  consigna: "Pon a cada línea de tiempo su ciclo de vida.",
  cierre: "El ciclo de vida del proyecto no es el ciclo de vida del producto.",
  subtemas: ["gp-ciclo"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "emparejar",
    consigna: "Pon a cada línea de tiempo su ciclo de vida.",
    etiquetas: CICLOS,
    rieles: [
      { id: "h06-a", letra: "A", clave: "predictivo" },
      { id: "h06-b", letra: "B", clave: "iterativo" },
      { id: "h06-c", letra: "C", clave: "incremental" },
      { id: "h06-d", letra: "D", clave: "adaptativo" },
      { id: "h06-e", letra: "E", clave: "hibrido" },
    ],
    /* retros[verdadero][puesto] */
    retros: {
      predictivo: {
        iterativo: "Aquí no se rehace nada: todo se planea al inicio.",
        incremental: "La app no crece por partes: sale completa al final.",
        adaptativo: "No hay plan por iteración: se fijó todo al inicio.",
        hibrido: "Todo el proyecto sigue un solo plan fijo.",
      },
      iterativo: {
        predictivo: "Mira el reloj: tiempo y costo se reestiman en cada vuelta.",
        incremental: "No suma módulos: rehace la misma app cada vez mejor.",
        adaptativo: "El alcance se fijó al inicio; no se replantea cada vuelta.",
        hibrido: "Todo va en vueltas; no hay parte fija aparte.",
      },
      incremental: {
        predictivo: "La app crece módulo a módulo, no de una vez.",
        iterativo: "No se pule la misma app: se le añade una función.",
        adaptativo: "Cada tramo añade algo, pero no se replanea el detalle.",
        hibrido: "Todo crece igual, por incrementos; no hay dos ritmos.",
      },
      adaptativo: {
        predictivo: "El detalle se define antes de cada iteración, no al inicio.",
        iterativo: "Aquí cambia el plan de cada iteración, no solo la estimación.",
        incremental: "Lo clave es replanear el detalle en cada iteración.",
        hibrido: "Todo el proyecto es ágil; no hay una parte predictiva.",
      },
      hibrido: {
        predictivo: "Solo el pago va fijo; el menú va en iteraciones.",
        iterativo: "El pago no itera: va predictivo.",
        incremental: "Mira los dos ritmos: uno fijo y uno que cambia.",
        adaptativo: "El pago tiene requisitos fijos y va predictivo.",
      },
    },
  }],
};

/* ─── H07 · La puerta de fase (decisiones con consecuencia, en orden) ─── */
export const PALANCAS = [
  { id: "continuar", nombre: "Continuar" },
  { id: "cambios", nombre: "Continuar con cambios" },
  { id: "permanecer", nombre: "Permanecer en la fase" },
  { id: "repetir", nombre: "Repetir la fase" },
  { id: "finalizar", nombre: "Finalizar el proyecto" },
];
export const GP_H07 = {
  id: "gp-h07-puerta",
  contexto: "La tienda de Medellín va por fases: viabilidad, diseño, construcción, puesta en marcha.",
  rol: "Diriges el proyecto y presentas en cada punto de revisión de fase.",
  consigna: "Compara con el caso de negocio y decide en la puerta.",
  cierre: "En cada puerta se compara contra el caso de negocio y se decide.",
  subtemas: ["gp-ciclo"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Compara con el caso de negocio y decide en la puerta.",
    pasos: [
      { id: "h07-p1", contexto: "Puerta 1 · Fin de viabilidad", texto: "Estudio listo. Ventas esperadas superan lo previsto en el caso de negocio.",
        destinos: PALANCAS, barajar: true, clave: "continuar", barras: [100, 115],
        retros: { cambios: "Nada que ajustar: los datos cumplen el caso.", permanecer: "La fase cumplió sus criterios de salida.", repetir: "Repetir gasta tiempo en algo que salió bien.", finalizar: "Los datos superan el caso: no hay razón para cerrar." } },
      { id: "h07-p2", contexto: "Puerta 2 · Fin de diseño", texto: "Diseño completo, pero cuesta 10 % más. La patrocinadora acepta si se quita la terraza.",
        destinos: PALANCAS, barajar: true, clave: "cambios", barras: [100, 110],
        retros: { continuar: "Seguir sin ajustar rompe el presupuesto aprobado.", permanecer: "El diseño está listo; falta solo el ajuste acordado.", repetir: "No hay que rehacer el diseño: basta quitar la terraza.", finalizar: "Hay una salida aceptada; cerrar desperdicia lo hecho." } },
      { id: "h07-p3", contexto: "Puerta 3 · Fin de construcción", texto: "Obra terminada. Falta el permiso sanitario: criterio de salida incumplido. Llega en dos semanas.",
        destinos: PALANCAS, barajar: true, clave: "permanecer", barras: [100, 90],
        retros: { continuar: "Sin el permiso no se cumple el criterio de salida.", cambios: "No hay que cambiar el plan; falta un requisito.", repetir: "La obra está bien: no hay que rehacerla.", finalizar: "Falta poco y el caso sigue en pie." } },
      { id: "h07-p4", contexto: "Puerta 4 · Antes de la puesta en marcha", texto: "La junta cambia la estrategia: todo a la costa. Medellín ya no es prioridad.",
        destinos: PALANCAS, barajar: true, clave: "finalizar", barras: [100, 20],
        retros: { continuar: "La necesidad del proyecto ya no existe.", cambios: "Ningún ajuste recupera una necesidad que desapareció.", permanecer: "Esperar no cambia la nueva estrategia.", repetir: "Repetir no tiene sentido si ya no se quiere la tienda." } },
    ],
  }],
};

/* ─── H08 · La trampa del calendario (2 etapas) ─── */
export const GRUPOS_PROCESOS = [
  { id: "inicio", nombre: "Inicio" },
  { id: "planificacion", nombre: "Planificación" },
  { id: "ejecucion", nombre: "Ejecución" },
  { id: "monitoreo", nombre: "Monitoreo y Control" },
  { id: "cierre", nombre: "Cierre" },
];
export const FASES_TIENDA = ["Viabilidad", "Diseño", "Construcción", "Puesta en marcha"];
export const GP_H08 = {
  id: "gp-h08-calendario",
  contexto: "El practicante armó el calendario de la tienda y puso «Ejecución» como la tercera fase.",
  rol: "Diriges el proyecto y revisas su trabajo antes de enviarlo.",
  consigna: "Lleva cada acción a su grupo de procesos.",
  cierre: null,
  subtemas: ["gp-procesos"],
  elenco: ["tu", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada acción a su grupo de procesos.",
      destinos: GRUPOS_PROCESOS,
      partida: { n: 8 },
      banco: [
        it("h08-01", "Obtener la autorización para arrancar el proyecto.", "inicio", "Autorizar el arranque es lo que define el Inicio."),
        it("h08-02", "Autorizar el arranque de la fase de diseño.", "inicio", "Iniciar también aplica a cada fase nueva."),
        it("h08-03", "Definir el alcance y el curso de acción.", "planificacion", "Es fijar qué se hará y cómo: planificación."),
        it("h08-04", "Refinar los objetivos de la tienda.", "planificacion", "Refinar objetivos es parte de planificar."),
        it("h08-05", "Instalar las máquinas según el plan.", "ejecucion", "Es hacer el trabajo definido en el plan."),
        it("h08-06", "Entrenar a los baristas según el plan.", "ejecucion", "Completar trabajo planeado es ejecución."),
        it("h08-07", "Comparar cada semana el avance real con el plan.", "monitoreo", "Seguir y analizar el avance es monitorear y controlar."),
        it("h08-08", "Proponer un cambio porque el plan ya no sirve.", "monitoreo", "Detectar que el plan requiere cambios es controlar."),
        it("h08-09", "Cerrar formalmente el contrato del constructor.", "cierre", "Cerrar formalmente un contrato es del Cierre."),
        it("h08-10", "Entregar la tienda y archivar el proyecto.", "cierre", "Completar formalmente el proyecto es Cierre."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Revisa el calendario del practicante.",
      pasos: [
        { id: "h08-m1", consigna: "¿El practicante puso bien «Ejecución»?", destinos: SI_NO, clave: "no",
          retros: { si: "Ejecución es un grupo de procesos; ocurre dentro de cada fase." }, revela: "grupos-en-fases" },
        { id: "h08-m2", consigna: "¿En la fase de diseño también se controla?", destinos: SI_NO, clave: "si",
          retros: { no: "Los cinco grupos pueden darse en cualquier fase." } },
        { grupo: "frecuencia", consigna: "Lleva cada proceso a su frecuencia.", barajar: true,
          destinos: [{ id: "una-vez", nombre: "Una vez" }, { id: "cuando", nombre: "Cuando se necesita" }, { id: "siempre", nombre: "Todo el tiempo" }],
          items: [
            { id: "h08-m3a", texto: "Desarrollar el acta de constitución", clave: "una-vez", retro: "Se hace una vez, al inicio." },
            { id: "h08-m3b", texto: "Adquirir recursos", clave: "cuando", retro: "Se repite cada vez que hacen falta recursos." },
            { id: "h08-m3c", texto: "Monitorear el avance", clave: "siempre", retro: "El monitoreo es continuo de inicio a cierre." },
          ] },
      ],
    },
  ],
};

/* ─── H09 · La central de la obra (conmutador) ─── */
export const AREAS = [
  { id: "integracion", nombre: "Integración" },
  { id: "alcance", nombre: "Alcance" },
  { id: "cronograma", nombre: "Cronograma" },
  { id: "costos", nombre: "Costos" },
  { id: "calidad", nombre: "Calidad" },
  { id: "recursos", nombre: "Recursos" },
  { id: "comunicaciones", nombre: "Comunicaciones" },
  { id: "riesgos", nombre: "Riesgos" },
  { id: "adquisiciones", nombre: "Adquisiciones" },
  { id: "interesados", nombre: "Interesados" },
];
export const GP_H09 = {
  id: "gp-h09-central",
  contexto: "Suena el teléfono de la obra en Medellín: ocho problemas en una mañana.",
  rol: "Diriges la obra y cada problema va al área que lo resuelve.",
  consigna: "Conecta cada llamada con su área de conocimiento.",
  cierre: null,
  subtemas: ["gp-procesos"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Conecta cada llamada con su área de conocimiento.",
    destinos: AREAS,
    /* 7 sorteadas y siempre la de Integración, la última. */
    partida: { n: 7, final: "h09-11" },
    banco: [
      it("h09-01", "¿El proyecto incluye la terraza o no?", "alcance", "Decidir qué trabajo entra y cuál no es alcance."),
      it("h09-02", "La obra va dos semanas atrasada.", "cronograma", "Terminar a tiempo es del cronograma."),
      it("h09-03", "¿Qué día termina la instalación eléctrica?", "cronograma", "Es una fecha: la maneja el cronograma."),
      it("h09-04", "Vamos a gastar más de lo aprobado.", "costos", "Quedar dentro del presupuesto es de costos."),
      it("h09-05", "Las mesas llegaron rayadas; no cumplen lo pedido.", "calidad", "Cumplir los requisitos pedidos es calidad."),
      it("h09-06", "Nos falta un electricista para el jueves.", "recursos", "Conseguir personas para el trabajo es recursos."),
      it("h09-07", "La patrocinadora no recibió el informe semanal.", "comunicaciones", "Que la información llegue a tiempo es comunicaciones."),
      it("h09-08", "Puede llover justo la semana del techo.", "riesgos", "Algo incierto que puede afectar: es un riesgo."),
      it("h09-09", "Hay que comprarle las máquinas a un proveedor.", "adquisiciones", "Comprar fuera del equipo es adquisiciones."),
      it("h09-10", "Los vecinos se quejan del ruido.", "interesados", "Los afectados por el proyecto son interesados."),
      it("h09-11", "Un cambio de diseño mueve costo, tiempo y alcance a la vez.", "integracion", "Coordinar varias áreas a la vez es integración."),
    ],
  }],
};

/* ─── H10 · Del grano a la taza ─── */
export const GP_H10 = {
  id: "gp-h10-cafetera",
  contexto: "La obra produce números todo el día. La patrocinadora solo quiere lo que le sirve para decidir.",
  rol: "Diriges el proyecto y preparas el reporte del viernes.",
  consigna: "Lleva cada pieza al nivel que le toca.",
  cierre: null,
  subtemas: ["gp-datos"],
  elenco: ["tu", "patrocinadora"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lleva cada pieza al nivel que le toca.",
    destinos: [
      { id: "datos", nombre: "Datos", pista: "medición en bruto" },
      { id: "informacion", nombre: "Información", pista: "analizada contra el plan" },
      { id: "informe", nombre: "Informe", pista: "documento para decidir" },
    ],
    partida: { porClave: { datos: 3, informacion: 2, informe: 2 } },
    banco: [
      it("h10-01", "Hoy se instalaron 12 de 20 mesas.", "datos", "Es una medición en bruto, sin comparar con el plan."),
      it("h10-02", "Costo real de la semana: $8 millones.", "datos", "Un costo real sin analizar es dato."),
      it("h10-03", "El techo empezó el 3 de marzo.", "datos", "Una fecha real sin contexto es dato."),
      it("h10-04", "Se registraron 4 defectos en la pintura.", "datos", "Contar defectos es medición en bruto."),
      it("h10-05", "La obra va al 60 %, una semana atrasada frente al plan.", "informacion", "Ya se comparó con el plan: es información."),
      it("h10-06", "A este ritmo, el costo final superará lo aprobado.", "informacion", "Es una estimación a la conclusión: información."),
      it("h10-07", "Dos de tres cambios aprobados ya están hechos.", "informacion", "Es el estado de los cambios: información."),
      it("h10-08", "Tablero semanal con alertas para la patrocinadora.", "informe", "Es un documento hecho para decidir: informe."),
      it("h10-09", "Memorando: ¿recortamos la terraza o pedimos más dinero?", "informe", "Pide una decisión por escrito: informe."),
    ],
  }],
};

/* ─── H11 · El caso de negocio del puente (3 etapas, 15 ítems) ─── */
export const GP_H11 = {
  id: "gp-h11-caso-puente",
  contexto: "Al puente de la finca le salieron grietas. Por ahí pasan los camiones que sacan el café.",
  rol: "Ayudas a la patrocinadora a armar el caso de negocio.",
  consigna: "Clasifica cada criterio: requerido, deseable u opcional.",
  cierre: null,
  subtemas: ["gp-documentos"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Clasifica cada criterio: requerido, deseable u opcional.",
      destinos: [
        { id: "requerido", nombre: "Requerido", pista: "«debe» cumplirse" },
        { id: "deseable", nombre: "Deseable" },
        { id: "opcional", nombre: "Opcional", pista: "no es fundamental" },
      ],
      partida: { todas: true },
      banco: [
        it("h11-01", "Debe soportar camiones de 10 toneladas.", "requerido", "Sin esto no se resuelve el problema: es requerido."),
        it("h11-02", "Debe estar listo antes de la cosecha.", "requerido", "Si no llega a la cosecha, no sirve: requerido."),
        it("h11-03", "Sería bueno que tenga andén para peatones.", "deseable", "Conviene, pero el problema se resuelve sin él."),
        it("h11-04", "Sería ideal que dure 30 años sin mantenimiento.", "deseable", "Es deseable; no es lo mínimo para resolver."),
        it("h11-05", "Iluminación decorativa.", "opcional", "No es fundamental; solo diferencia opciones."),
        it("h11-06", "Pintarlo con los colores de la marca.", "opcional", "Detalle que no resuelve nada: opcional."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Etiqueta cada opción del caso de negocio.",
      pasos: [
        { grupo: "opciones", consigna: "Etiqueta cada opción del caso de negocio.", barajar: true,
          destinos: [{ id: "nada", nombre: "No hacer nada" }, { id: "minimo", nombre: "Hacer el mínimo" }, { id: "mas", nombre: "Hacer más que el mínimo" }],
          items: [
            { id: "h11-07", letra: "A", objeto: "puente-grietas", texto: "Dejarlo como está y vigilarlo.", clave: "nada", retro: "Seguir como hasta ahora: con esta, el proyecto no se autoriza." },
            { id: "h11-08", letra: "B", objeto: "puente-reforzado", texto: "Reforzar las bases para 10 toneladas antes de la cosecha.", clave: "minimo", retro: "Cumple justo los dos criterios requeridos: es el mínimo." },
            { id: "h11-09", letra: "C", objeto: "puente-nuevo", texto: "Puente nuevo con andén, luces y colores.", clave: "mas", retro: "Cumple lo requerido y además deseables y opcionales." },
          ] },
        { id: "h11-10", consigna: "La patrocinadora elige A. ¿Qué pasa con el proyecto?",
          destinos: [{ id: "no-autoriza", nombre: "No se autoriza" }, { id: "poco-dinero", nombre: "Arranca con poco dinero" }, { id: "pmo", nombre: "Pasa a la PMO" }],
          barajar: true, clave: "no-autoriza",
          retroComun: "Con “no hacer nada” no se autoriza el proyecto.",
          retros: { "poco-dinero": "Arrancar implicaría elegir una opción que sí actúe.", pmo: "La PMO no recibe proyectos no autorizados." },
          despues: "La patrocinadora elige B para seguir." },
      ],
    },
    {
      tipo: "micros",
      consigna: "Ordena los documentos en la línea de tiempo.",
      pasos: [
        { tipo: "ordenar", id: "h11-orden", consigna: "Ordena los documentos en la línea de tiempo.",
          items: [
            { id: "evaluacion", texto: "Evaluación de necesidades" },
            { id: "caso", texto: "Caso de negocio" },
            { id: "acta", texto: "Acta de constitución" },
            { id: "plan", texto: "Plan para la dirección del proyecto" },
          ],
          /* Un ítem por par vecino: h11-orden:evaluacion-caso, …; retro si el par queda invertido. */
          retrosPar: {
            "evaluacion-caso": "Primero se entiende la necesidad; luego se justifica.",
            "caso-acta": "El acta autoriza con base en el caso de negocio.",
            "acta-plan": "Sin autorización no se planea cómo dirigir el proyecto.",
          },
          puntuaPares: true },
        { id: "h11-14", consigna: "¿Quién emite el acta?", barajar: true,
          destinos: [{ id: "patrocinadora", nombre: "Patrocinadora" }, { id: "tu", nombre: "Tú, director(a)" }, { id: "pmo", nombre: "La PMO" }],
          clave: "patrocinadora",
          retros: { tu: "El acta la emite el patrocinador y te da autoridad.", pmo: "La PMO puede apoyar, pero el acta la emite el patrocinador." } },
        { id: "h11-15", consigna: "¿Qué te da el acta a ti?", barajar: true,
          destinos: [{ id: "autoridad", nombre: "Autoridad para usar recursos" }, { id: "cronograma", nombre: "El cronograma detallado" }, { id: "presupuesto", nombre: "El presupuesto final exacto" }],
          clave: "autoridad",
          retros: { cronograma: "El detalle viene después, en el plan para la dirección.", presupuesto: "El acta autoriza; no fija el presupuesto final." } },
      ],
    },
  ],
};

/* ─── H12 · ¿Éxito o fracaso? (2 etapas) ─── */
const RETRO_FIN = "Es una medida financiera del caso de negocio.";
const RETRO_NOFIN = "No se mide en dinero: es criterio no financiero.";
export const GP_H12 = {
  id: "gp-h12-balanzas",
  contexto: "La app se entregó a tiempo, sin pasarse del presupuesto y con todo lo pedido. Casi nadie la usa.",
  rol: "Presentas el cierre ante la junta.",
  consigna: "Pon cada dato en la balanza que mide.",
  cierre: null,
  subtemas: ["gp-exito"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada dato en la balanza que mide.",
      destinos: [
        { id: "proyecto", nombre: "Éxito del proyecto", pista: "alcance, tiempo, costo" },
        { id: "negocio", nombre: "Éxito del negocio", pista: "objetivos, beneficios" },
      ],
      partida: { todas: true },
      banco: [
        it("h12-01", "Se entregó en la fecha pactada.", "proyecto", "La puntualidad mide el proyecto: tiempo."),
        it("h12-02", "Costó lo aprobado.", "proyecto", "Cumplir el presupuesto es éxito del proyecto."),
        it("h12-03", "Tiene todas las funciones pedidas.", "proyecto", "Es cumplir el alcance del proyecto."),
        it("h12-04", "Solo el 3 % de los clientes la usa.", "negocio", "La adopción por usuarios mide el negocio."),
        it("h12-05", "Las ventas no subieron como prometía el caso.", "negocio", "Es un objetivo del caso de negocio."),
        it("h12-06", "La patrocinadora no está satisfecha.", "negocio", "La satisfacción de interesados va más allá del plan."),
      ],
      despues: {
        id: "h12-07", consigna: "¿Cómo pudo pasar esto?", barajar: true,
        destinos: [{ id: "mercado", nombre: "El mercado cambió: todos piden por WhatsApp" }, { id: "equipo", nombre: "El equipo trabajó mal" }, { id: "presupuesto", nombre: "Faltó presupuesto" }],
        clave: "mercado",
        retros: { equipo: "El equipo cumplió todo el plan; no fue eso.", presupuesto: "El presupuesto se cumplió; no faltó dinero." },
        revela: "whatsapp",
      },
    },
    {
      tipo: "clasificar",
      consigna: "Separa las medidas financieras de las otras.",
      destinos: [
        { id: "financieras", nombre: "Financieras" },
        { id: "no-financieras", nombre: "No financieras" },
      ],
      partida: { todas: true },
      banco: [
        it("h12-08", "Valor actual neto (VAN)", "financieras", RETRO_FIN),
        it("h12-09", "Retorno de la inversión (ROI)", "financieras", RETRO_FIN),
        it("h12-10", "Plazo de retorno", "financieras", RETRO_FIN),
        it("h12-11", "Relación costo-beneficio", "financieras", RETRO_FIN),
        it("h12-12", "Satisfacción de los interesados", "no-financieras", RETRO_NOFIN),
        it("h12-13", "Adopción por los usuarios", "no-financieras", RETRO_NOFIN),
        it("h12-14", "Cumplir la estrategia", "no-financieras", RETRO_NOFIN),
      ],
      despues: {
        tipo: "ordenar", id: "h12-orden", consigna: "Ordena las tres preguntas que debiste acordar al inicio.",
        items: [
          { id: "define", texto: "¿Cómo se define el éxito?" },
          { id: "mide", texto: "¿Cómo se medirá?" },
          { id: "factores", texto: "¿Qué factores pueden influir?" },
        ],
        retro: "Primero qué es éxito; luego cómo medirlo; luego qué lo afecta.",
        puntuaPares: true,
      },
    },
  ],
};

/* ─── H13 · El memorando del practicante (encontrar el error) ─── */
export const GP_H13 = {
  id: "gp-h13-memorando",
  contexto: "El practicante escribió el memorando de inducción para empleados nuevos. La PMO te pide revisarlo.",
  rol: "Eres director(a) y revisas el memorando.",
  consigna: "Toca las frases con error y corrígelas.",
  cierre: null,
  subtemas: ["gp-adaptacion", "gp-procesos", "gp-ppp", "gp-fin", "gp-documentos", "gp-proyecto", "gp-exito"],
  elenco: ["tu", "practicante", "pmo"],
  etapas: [{
    tipo: "memorando",
    consigna: "Toca las frases con error y corrígelas.",
    partida: { conError: 3, correctas: 3 },
    frases: [
      { id: "h13-01", texto: "La guía del PMBOK es nuestra metodología: se aplica igual siempre.", error: true, subtema: "gp-adaptacion",
        buena: "Es una base de buenas prácticas; cada proyecto se adapta.",
        malas: [{ texto: "Es una ley que obliga a todos los proyectos.", retro: "La guía describe, no obliga." }, { texto: "Solo sirve para proyectos de construcción.", retro: "Sirve en todas las industrias." }] },
      { id: "h13-02", texto: "Planificación, Ejecución y Cierre son nuestras fases.", error: true, subtema: "gp-procesos",
        buena: "Son grupos de procesos; ocurren dentro de cada fase.",
        malas: [{ texto: "Son áreas de conocimiento.", retro: "Las áreas son alcance, costos, riesgos…" }, { texto: "Solo existen en proyectos ágiles.", retro: "Aplican a cualquier ciclo de vida." }] },
      { id: "h13-03", texto: "Un programa es un proyecto muy grande.", error: true, subtema: "gp-ppp",
        buena: "Es un grupo de proyectos relacionados, gestionados coordinados.",
        malas: [{ texto: "Es lo mismo que un portafolio.", retro: "El portafolio no exige relación entre sus partes." }, { texto: "Es un proyecto que dura más de un año.", retro: "La duración no define un programa." }] },
      { id: "h13-04", texto: "Si dura tres años, no es temporal.", error: true, subtema: "gp-fin",
        buena: "Temporal es tener inicio y fin, no ser corto.",
        malas: [{ texto: "Temporal significa menos de un año.", retro: "La guía no fija duración máxima." }, { texto: "Solo es temporal si es pequeño.", retro: "El tamaño no importa: importa tener fin." }] },
      { id: "h13-05", texto: "El acta de constitución la emite el director del proyecto.", error: true, subtema: "gp-documentos",
        buena: "La emite el patrocinador y da autoridad al director.",
        malas: [{ texto: "La emite el cliente.", retro: "La emite quien patrocina, no el cliente." }, { texto: "La emite la PMO siempre.", retro: "La emite el patrocinador." }] },
      { id: "h13-06", texto: "Construir otra bodega igual a la primera también es un proyecto.", error: false, subtema: "gp-proyecto",
        retro: "Correcta: lo repetido no quita que sea único." },
      { id: "h13-07", texto: "Al cerrar el proyecto, sus entregables pueden seguir existiendo.", error: false, subtema: "gp-fin",
        retro: "Correcta: el entregable puede durar más que el proyecto." },
      { id: "h13-08", texto: "La dirección de portafolios elige los proyectos correctos.", error: false, subtema: "gp-ppp",
        retro: "Correcta: el portafolio decide qué proyectos hacer." },
      { id: "h13-09", texto: "Un proyecto puede cumplir tiempo y costo y aun así fallar al negocio.", error: false, subtema: "gp-exito",
        retro: "Correcta: el mercado puede cambiar antes del cierre." },
    ],
  }],
};

/* ─── H14 · El sobre del proveedor (dilema, exploratorio; efectos: criterio de Gen) ─── */
export const VALORES = [
  { id: "responsabilidad", nombre: "Responsabilidad" },
  { id: "respeto", nombre: "Respeto" },
  { id: "imparcialidad", nombre: "Imparcialidad" },
  { id: "honestidad", nombre: "Honestidad" },
];
export const GP_H14 = {
  id: "gp-h14-sobre",
  contexto: "Un proveedor de máquinas te ofrece un viaje gratis si eliges su oferta, aunque es más cara.",
  rol: "Diriges el proyecto de la tienda.",
  consigna: "Decide qué haces con la oferta.",
  cierre: "El código del PMI descansa en responsabilidad, respeto, imparcialidad y honestidad.",
  subtemas: ["gp-etica"],
  elenco: ["tu"],
  etapas: [{
    tipo: "dilema",
    consigna: "Decide qué haces con la oferta.",
    pasos: [
      { id: "h14-1", titulo: "La oferta",
        opciones: [
          { id: "rechazo", texto: "Rechazo el viaje y comparo ofertas con los mismos criterios", efecto: { imparcialidad: 1 }, retro: "Decides con criterios iguales para todos los proveedores." },
          { id: "acepto", texto: "Acepto el viaje y elijo su oferta", efecto: { imparcialidad: -2 }, retro: "Un regalo personal decidió por ti: no hay imparcialidad." },
          { id: "acepto-barata", texto: "Acepto el viaje, pero elijo la más barata", efecto: { imparcialidad: -1 }, retro: "Aunque elijas bien, aceptar el regalo compromete tu imparcialidad." },
        ] },
      { id: "h14-2", titulo: "La patrocinadora pregunta cómo elegiste",
        opciones: [
          { id: "cuento", texto: "Le cuento también lo del viaje ofrecido", efecto: { honestidad: 1 }, retro: "Dar la información completa sostiene la confianza." },
          { id: "tabla", texto: "Solo le muestro la tabla de precios", efecto: { honestidad: -1 }, retro: "Ocultar información relevante va contra la honestidad." },
        ] },
      { id: "h14-3", titulo: "El instalador falla y la obra se atrasa una semana",
        opciones: [
          { id: "reporto", texto: "Lo reporto y propongo cómo recuperar el tiempo", efecto: { responsabilidad: 1 }, retro: "Te haces cargo de lo que pasa en tu proyecto." },
          { id: "culpo", texto: "Culpo al equipo frente a todos", efecto: { respeto: -1 }, retro: "Exponer al equipo en público falta al respeto." },
          { id: "callo", texto: "No lo menciono en el informe", efecto: { honestidad: -1, responsabilidad: -1 }, retro: "El atraso existe; esconderlo lo empeora." },
        ] },
    ],
  }],
};

export const PIEZAS_TEXTO_INTRO = [GP_H01, GP_H02, GP_H03, GP_H04, GP_H05, GP_H06, GP_H07, GP_H08, GP_H09, GP_H10, GP_H11, GP_H12, GP_H13, GP_H14];
