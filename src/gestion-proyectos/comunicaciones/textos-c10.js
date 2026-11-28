/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 10 «GESTIÓN DE LAS COMUNICACIONES» — LOS TEXTOS
 * DE LAS 11 HACER (lote 5)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c10-hacer.md (§2, H01 a H11). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos del mes de monitoreo (H10) y del revelado de H04 viven en
 * LANZAMIENTO_C10: la prueba gp-lote5 recalcula cada porcentaje.
 *
 * Módulos y subtemas (gp10-* del diseño → procesos de ../estructura.js):
 *   gp10-metodos (pp. 374–375), gp10-tecnologia, gp10-requisitos, gp10-plan
 *   → gp-10-1 · gp10-dimensiones, gp10-5c, gp10-modelos (el diseño lo pone en
 *   10.2), gp10-gestionar → gp-10-2 · gp10-monitorear → gp-10-3.
 *   H04–H08 van en Planificación (10.1); H01–H03 y H09 en Ejecución (10.2);
 *   H10 y H11 (repaso que cierra con monitorear) en Monitoreo y Control.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];

/* Los datos del caso (diseño H04 y H10). Las cifras del revelado de H04 son ilustrativas (criterio de Gen). */
export const LANZAMIENTO_C10 = {
  correo: { tiendas: 40, abrieron: 31, entendieron: 12 },
  monitoreo: [
    { id: "c10h10-01", hecho: 9, plan: 12, clave: 75 },
    { id: "c10h10-02", hecho: 18, plan: 45, clave: 40 },
    { id: "c10h10-03", hecho: 8, plan: 8, clave: 100 },
  ],
};

/* ─── H01 · El casillero de la semana (3 rondas) ─── */
const ronda = (consigna, destinos, banco) => ({ tipo: "clasificar", consigna, destinos, partida: { n: 4 }, banco: con("gp-10-2", banco) });
export const GP_C10_H01 = {
  id: "gp26-eje-c10-h01-casillero",
  contexto: "Altamira lanza su marca en Barranquilla, Cartagena y Santa Marta. Esta semana pasan muchos mensajes por tu escritorio.",
  rol: "Diriges el proyecto de lanzamiento de la marca.",
  consigna: "¿Mensaje interno o externo?",
  cierre: "Un mismo mensaje se describe por varias dimensiones a la vez.",
  subtemas: ["gp-10-2"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    ronda("¿Mensaje interno o externo?", [{ id: "interna", nombre: "Interna" }, { id: "externa", nombre: "Externa" }], [
      it("c10h01-01", "Correo al equipo de diseño sobre el logo.", "interna", "El equipo es parte del proyecto: comunicación interna."),
      it("c10h01-02", "Nota a la patrocinadora sobre el avance.", "interna", "La patrocinadora está dentro de Altamira: interna."),
      it("c10h01-03", "Carta a la alcaldía de Cartagena pidiendo un permiso.", "externa", "El gobierno está fuera de la organización: externa."),
      it("c10h01-04", "Respuesta a un proveedor de vallas.", "externa", "Los proveedores son interesados externos."),
      it("c10h01-05", "Mensaje a la cadena hotelera que será cliente.", "externa", "El cliente es un interesado externo."),
    ]),
    ronda("¿Formal o informal?", [{ id: "formal", nombre: "Formal" }, { id: "informal", nombre: "Informal" }], [
      it("c10h01-06", "Acta de la reunión del lunes.", "formal", "Agendas y actas de reunión son comunicación formal."),
      it("c10h01-07", "Presentación del plan ante la junta.", "formal", "Las presentaciones son comunicación formal."),
      it("c10h01-08", "Informe para la superintendencia sobre la publicidad.", "formal", "Un informe a un regulador es formal y además oficial."),
      it("c10h01-09", "Chat rápido con el diseñador.", "informal", "Mensajes y charlas ad hoc son informales."),
      it("c10h01-10", "Comentario en el pasillo después de la reunión.", "informal", "Una conversación ad hoc es informal."),
    ]),
    ronda("¿Va hacia arriba, hacia abajo o de lado?", [{ id: "ascendente", nombre: "Ascendente", pista: "↑" }, { id: "descendente", nombre: "Descendente", pista: "↓" }, { id: "horizontal", nombre: "Horizontal", pista: "↔" }], [
      it("c10h01-11", "Informe de avance para la junta de Altamira.", "ascendente", "La alta dirección está arriba: ascendente."),
      it("c10h01-12", "Pides a la patrocinadora aprobar el presupuesto.", "ascendente", "Va hacia la dirección que autoriza: ascendente."),
      it("c10h01-13", "Instrucciones al equipo que monta la vitrina.", "descendente", "Va al equipo que aporta el trabajo: descendente."),
      it("c10h01-14", "Asignas tareas a los diseñadores.", "descendente", "Del director hacia el equipo: descendente."),
      it("c10h01-15", "Coordinas fechas con el director del proyecto de la app.", "horizontal", "Es un par tuyo: comunicación horizontal."),
    ]),
  ],
};

/* ─── H02 · La máquina de las 5C (encontrar la falla y nombrarla) ─── */
const CINCO_C = [
  { id: "correcto", nombre: "Correcto" },
  { id: "conciso", nombre: "Conciso" },
  { id: "claro", nombre: "Claro" },
  { id: "coherente", nombre: "Coherente" },
  { id: "controlado", nombre: "Controlado" },
];
export const GP_C10_H02 = {
  id: "gp26-eje-c10-h02-maquina",
  contexto: "El practicante redactó el anuncio del lanzamiento para las tiendas aliadas. Antes de enviarlo, lo revisas.",
  rol: "Diriges el lanzamiento y corriges el borrador.",
  consigna: "Toca cada falla y di qué C rompe.",
  cierre: null,
  subtemas: ["gp-10-2"],
  elenco: ["tu", "practicante"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Toca cada falla y di qué C rompe.",
    destinos: CINCO_C,
    /* 5: una por C. Clave: criterio de Gen (las 5C se solapan; cada fragmento tiene una falla dominante). */
    partida: { porClave: 1 },
    banco: con("gp-10-2", [
      it("c10h02-01", "«Lanzamos la marca el biernes 3 en Barranquiya.»", "correcto", "Son errores de ortografía: restan credibilidad."),
      it("c10h02-02", "«Les queremos contar, informar y comunicar, de manera muy atenta y cordial, que lanzamos.»", "conciso", "Sobran palabras: un mensaje conciso se malinterpreta menos."),
      it("c10h02-03", "«Activaremos el sell-out vía trade marketing omnicanal.»", "claro", "No está escrito para el lector: la tienda no usa esa jerga."),
      it("c10h02-04", "«Precios nuevos. Por cierto, el logo es azul. Volviendo a los precios…»", "coherente", "Las ideas saltan sin orden ni marcadores."),
      it("c10h02-05", "Un solo párrafo de 40 líneas con precios, fechas y normas, sin resumen.", "controlado", "Falta dosificar: resúmenes o gráficos controlan el flujo."),
      it("c10h02-06", "«El café es exelente y biene en tres presentaciones.»", "correcto", "Ortografía incorrecta: distrae y distorsiona el mensaje."),
      it("c10h02-07", "Empieza por las normas, sigue con el logo y nunca dice para qué escribe.", "claro", "No deja claro el propósito para el lector."),
    ]),
    despues: { id: "c10h02-08", subtemas: ["gp-10-2"], mesa: "practicante",
      consigna: "Con las 5C, ¿desaparecen los malentendidos?",
      destinos: SI_NO, clave: "no", retros: { si: "Las 5C reducen los malentendidos; no los eliminan." } },
  }],
};

/* ─── H03 · Dos radios, un precio torcido (2 etapas) ─── */
export const GP_C10_H03 = {
  id: "gp26-eje-c10-h03-radios",
  contexto: "Desde Manizales enviaste a Cartagena el precio de lanzamiento. Allá montaron la vitrina con otro precio.",
  rol: "Diriges el lanzamiento y rastreas dónde se torció el mensaje.",
  consigna: "Ordena el viaje del mensaje, de ida y vuelta.",
  cierre: "El modelo básico asegura la entrega; el interactivo busca la comprensión.",
  subtemas: ["gp-10-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena el viaje del mensaje, de ida y vuelta.",
      pasos: [
        {
          tipo: "ordenar", id: "c10h03-viaje", subtemas: ["gp-10-2"], puntuaPares: true,
          consigna: "Ordena el viaje del mensaje, de ida y vuelta.",
          items: [
            { id: "codificar", texto: "Codificar" },
            { id: "transmitir", texto: "Transmitir" },
            { id: "descodificar", texto: "Descodificar" },
            { id: "confirmar", texto: "Confirmar" },
            { id: "retroalimentacion", texto: "Retroalimentación" },
          ],
          retrosPar: {
            "codificar-transmitir": "Primero se pone en símbolos; luego se envía.",
            "transmitir-descodificar": "El receptor descodifica lo que ya le llegó.",
            "descodificar-confirmar": "Se confirma después de recibir y descodificar.",
            "confirmar-retroalimentacion": "Confirmar es avisar que llegó; la respuesta viene después.",
          },
        },
        { tipo: "casillas", id: "c10h03-ruido", subtemas: ["gp-10-2"],
          consigna: "Toca lo que fue ruido en este envío.",
          casillas: [{ id: "ruido", nombre: "Fue ruido", marcar: true, columnas: 1, clave: ["distraido", "senal", "termino"],
            opciones: [
              { id: "distraido", nombre: "El encargado atendía clientes mientras oía.", retro: "La distracción del receptor es ruido." },
              { id: "senal", nombre: "La señal en la tienda era mala.", retro: "Una infraestructura inadecuada compromete la transmisión." },
              { id: "termino", nombre: "El encargado no conocía el término «precio de lanzamiento».", retro: "La falta de conocimiento es una barrera a la comprensión." },
              { id: "lunes", nombre: "El mensaje se envió el lunes.", retro: "La fecha de envío no es una barrera." },
            ] }] },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "¿Le toca al emisor o al receptor?",
      destinos: [{ id: "emisor", nombre: "Emisor (tú)" }, { id: "receptor", nombre: "Receptor (la tienda)" }],
      partida: { todas: true },
      banco: con("gp-10-2", [
        it("c10h03-01", "Que el mensaje sea claro y completo.", "emisor", "Quien envía responde por la claridad del mensaje."),
        it("c10h03-02", "Comprobar que lo interpretaron bien.", "emisor", "El emisor confirma que se interpretó correctamente."),
        it("c10h03-03", "Recibir el mensaje completo.", "receptor", "El receptor se asegura de recibirlo entero."),
        it("c10h03-04", "Interpretarlo correctamente.", "receptor", "Interpretar bien es tarea del receptor."),
        it("c10h03-05", "Confirmar o responder de forma adecuada.", "receptor", "El receptor confirma o responde."),
      ]),
      despues: [
        { id: "c10h03-06", subtemas: ["gp-10-2"],
          contexto: "La tienda contestó «recibido» a tu mensaje.",
          consigna: "¿Entendió el precio?",
          destinos: [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No necesariamente" }], clave: "no",
          retros: { si: "Confirmar solo dice que llegó; no que se entendió." } },
        { id: "c10h03-07", subtemas: ["gp-10-2"],
          consigna: "¿El modelo intercultural sirve para el correo masivo a 40 tiendas?",
          destinos: SI_NO, clave: "no", retros: { si: "Sirve persona a persona o entre grupos pequeños." } },
      ],
    },
  ],
};

/* ─── H04 · Faro, quiosco o carpa (2 etapas) ─── */
const C = LANZAMIENTO_C10.correo;
export const GP_C10_H04 = {
  id: "gp26-pla-c10-h04-playa",
  contexto: "Para el lanzamiento debes avisar, explicar y conversar con mucha gente distinta en la costa.",
  rol: "Diriges el lanzamiento y eliges cómo llega cada mensaje.",
  consigna: "Lleva cada comunicación a su método.",
  cierre: "Push asegura que se envió; no que llegó ni que se entendió.",
  subtemas: ["gp-10-1"],
  elenco: ["tu", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada comunicación a su método.",
      destinos: [
        { id: "push", nombre: "Faro · Push", pista: "se envía a quien debe recibirlo" },
        { id: "pull", nombre: "Quiosco · Pull", pista: "el receptor entra cuando quiere" },
        { id: "interactiva", nombre: "Carpa · Interactiva", pista: "en tiempo real, en varias direcciones" },
      ],
      /* 8 de 10: siempre el blog (la trampa) y el manual. */
      partida: { n: 6, siempre: ["c10h04-04", "c10h04-05"] },
      banco: con("gp-10-1", [
        it("c10h04-01", "Comunicado de prensa a los periódicos de la costa.", "push", "Se envía a receptores concretos: push."),
        it("c10h04-02", "Correo con el precio a cada tienda.", "push", "El correo se empuja al destinatario: push."),
        it("c10h04-03", "Memorando a la patrocinadora.", "push", "Un memorando se envía directo: push."),
        it("c10h04-04", "Entrada en el blog de Altamira.", "push", "La guía pone los blogs entre los objetos push."),
        it("c10h04-05", "Manual de marca de 80 páginas en el portal.", "pull", "Información voluminosa que se consulta cuando se quiere: pull."),
        it("c10h04-06", "Curso virtual para los vendedores.", "pull", "El e-learning se usa a criterio del receptor: pull."),
        it("c10h04-07", "Repositorio con las lecciones del lanzamiento.", "pull", "Un repositorio de conocimiento es pull."),
        it("c10h04-08", "Videollamada con el gerente de la cadena hotelera.", "interactiva", "Intercambio en tiempo real y en dos vías: interactiva."),
        it("c10h04-09", "Reunión con los distribuidores.", "interactiva", "Las reuniones son comunicación interactiva."),
        it("c10h04-10", "Llamada al diseñador para ajustar el logo.", "interactiva", "Una llamada es multidireccional en tiempo real."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "¿Cuántas tiendas crees que lo entendieron?",
      pasos: [
        { tipo: "explorar", id: "c10h04-apuesta", subtemas: ["gp-10-1"], apuesta: true, minimo: 1,
          texto: `Enviaste por correo el precio nuevo a las ${C.tiendas} tiendas aliadas.`,
          consigna: "¿Cuántas tiendas crees que lo entendieron?",
          listo: "Tu apuesta está lista: mira qué pasó",
          controles: [{ id: "apuesta", nombre: "Tiendas que lo entendieron", inicial: 20, min: 0, max: C.tiendas, salto: 1, unidad: `de ${C.tiendas}` }] },
        { id: "c10h04-11", subtemas: ["gp-10-1"], barajar: true, revelado: true,
          consigna: "¿Qué agregas para asegurarte de que entiendan?",
          destinos: [{ id: "llamada", nombre: "Una llamada breve con cada tienda (interactiva)" }, { id: "otro", nombre: "Otro correo igual" }, { id: "nada", nombre: "Nada" }],
          clave: "llamada", retros: { otro: "Repetir el push no asegura comprensión.", nada: "Push asegura el envío, no que se entienda." } },
      ],
    },
  ],
};

/* ─── H05 · El malecón de los cinco escenarios ─── */
export const GP_C10_H05 = {
  id: "gp26-pla-c10-h05-malecon",
  contexto: "En la semana del lanzamiento hablarás en lugares muy distintos del malecón de Barranquilla.",
  rol: "Diriges el lanzamiento y preparas cada encuentro.",
  consigna: "Lleva al zorro al escenario de cada encuentro.",
  cierre: "Cada forma de comunicación pide un enfoque distinto.",
  subtemas: ["gp-10-1"],
  elenco: ["tu", "cliente"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lleva al zorro al escenario de cada encuentro.",
    destinos: [
      { id: "interpersonal", nombre: "Interpersonal" },
      { id: "grupo", nombre: "Pequeño grupo", pista: "3 a 6" },
      { id: "publica", nombre: "Pública" },
      { id: "masiva", nombre: "Masiva" },
      { id: "redes", nombre: "Redes" },
    ],
    /* 6: al menos una de cada escenario. */
    partida: { n: 6, cubrir: true },
    banco: con("gp-10-1", [
      it("c10h05-01", "Café a solas con la gerente de la cadena hotelera.", "interpersonal", "Entre dos personas, cara a cara: interpersonal."),
      it("c10h05-02", "Entrevista uno a uno con un periodista.", "interpersonal", "Es entre individuos, cara a cara."),
      it("c10h05-03", "Taller con cinco baristas de la tienda.", "grupo", "De tres a seis personas es un grupo pequeño."),
      it("c10h05-04", "Reunión con cuatro distribuidores.", "grupo", "Cuatro personas: grupo pequeño."),
      it("c10h05-05", "Tu charla ante 200 empresarios del gremio.", "publica", "Un solo orador ante un grupo: pública."),
      it("c10h05-06", "Cuña en la radio regional.", "masiva", "Grupo grande, casi anónimo, conexión mínima: masiva."),
      it("c10h05-07", "Aviso en el periódico de mayor circulación.", "masiva", "Llega a muchos sin contacto directo: masiva."),
      it("c10h05-08", "Reto en redes: los clientes suben fotos con su café.", "redes", "Muchos a muchos con medios sociales: redes."),
    ]),
  }],
};

/* ─── H06 · Las banderas de señales ─── */
export const GP_C10_H06 = {
  id: "gp26-pla-c10-h06-banderas",
  contexto: "Cada mensaje del lanzamiento necesita su tecnología. Antes de elegirla, miras qué factor pesa más.",
  rol: "Diriges el lanzamiento y eliges la tecnología de cada mensaje.",
  consigna: "Iza la bandera del factor que manda en cada caso.",
  cierre: "Urgencia, disponibilidad, facilidad, entorno y confidencialidad deciden la tecnología.",
  subtemas: ["gp-10-1"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Iza la bandera del factor que manda en cada caso.",
    destinos: [
      { id: "urgencia", nombre: "Urgencia" },
      { id: "disponibilidad", nombre: "Disponibilidad y confiabilidad" },
      { id: "facilidad", nombre: "Facilidad de uso" },
      { id: "entorno", nombre: "Entorno del proyecto" },
      { id: "confidencialidad", nombre: "Confidencialidad" },
    ],
    /* 6: una por bandera y una extra. */
    partida: { n: 6, cubrir: true },
    banco: con("gp-10-1", [
      it("c10h06-01", "Viene un aguacero: hay que cerrar la carpa de Santa Marta en una hora.", "urgencia", "Lo que manda es lo urgente de la información."),
      it("c10h06-02", "Las tiendas de los pueblos tienen internet inestable.", "disponibilidad", "La tecnología debe estar disponible y funcionar para todos."),
      it("c10h06-03", "Los vendedores nunca han usado la app de chat que propones.", "facilidad", "Debe ser fácil para ellos o requerir capacitación."),
      it("c10h06-04", "El diseñador está en Madrid, con otra zona horaria.", "entorno", "Equipo virtual y husos distintos: es el entorno."),
      it("c10h06-05", "Un distribuidor de Panamá solo habla inglés.", "entorno", "Varios idiomas son parte del entorno del proyecto."),
      it("c10h06-06", "Vas a enviar los salarios de los nuevos gerentes de tienda.", "confidencialidad", "Información sensible: pide medidas de seguridad."),
      it("c10h06-07", "Un empleado quiere publicar en redes precios aún secretos.", "confidencialidad", "Las políticas de redes protegen la información privilegiada."),
    ]),
  }],
};

/* ─── H07 · Los amarres del muelle ─── */
export const GP_C10_H07 = {
  id: "gp26-pla-c10-h07-amarres",
  contexto: "El equipo de lanzamiento empezó con cuatro personas. Cada semana se suma gente y los mensajes se enredan.",
  rol: "Diriges el lanzamiento y analizas los requisitos de comunicación.",
  consigna: "Amarra cada mensaje con el tipo de canal que usa.",
  cierre: "La cantidad de canales es una fuente para definir los requisitos de comunicación.",
  subtemas: ["gp-10-1"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Amarra cada mensaje con el tipo de canal que usa.",
    destinos: [
      { id: "uno-uno", nombre: "Uno a uno", pista: "una soga entre dos" },
      { id: "uno-muchos", nombre: "Uno a muchos", pista: "abanico desde uno" },
      { id: "muchos-muchos", nombre: "Muchos a muchos", pista: "red entre todos" },
    ],
    partida: { todas: true },
    banco: con("gp-10-1", [
      it("c10h07-01", "La patrocinadora te escribe solo a ti sobre el presupuesto.", "uno-uno", "Una persona habla con otra: un solo canal."),
      it("c10h07-02", "Llamas al proveedor de vallas para cambiar una fecha.", "uno-uno", "Es una conversación entre dos partes."),
      it("c10h07-03", "Envías el boletín del lanzamiento a todos los distribuidores.", "uno-muchos", "Sale de ti hacia muchos a la vez."),
      it("c10h07-04", "La PMO publica la plantilla nueva para todos los equipos.", "uno-muchos", "Un emisor y varios receptores: uno a muchos."),
      it("c10h07-05", "Reunión de todo el equipo donde todos opinan.", "muchos-muchos", "Todos emiten y todos reciben: muchos a muchos."),
      it("c10h07-06", "Grupo de chat del equipo de diseño y mercadeo.", "muchos-muchos", "Cualquiera escribe y todos leen: muchos a muchos."),
    ]),
    despues: { id: "c10h07-07", subtemas: ["gp-10-1"], barajar: true, revela: true, crece: true,
      contexto: "Esta semana el equipo pasa de cuatro a diez personas.",
      consigna: "¿Qué pasa con los canales de comunicación potenciales?",
      despues: "Aparecen bolardos nuevos y el muelle se llena de sogas posibles.",
      destinos: [{ id: "aumentan", nombre: "Aumentan y hay que revisar los requisitos" }, { id: "iguales", nombre: "Siguen iguales" }, { id: "bajan", nombre: "Bajan" }],
      clave: "aumentan", retros: { iguales: "Cada persona nueva abre canales nuevos con las demás.", bajan: "Más gente no reduce los canales posibles." } },
  }],
};

/* ─── H08 · El tablero de salidas (2 etapas) ─── */
const METODO = [{ id: "push", nombre: "Push" }, { id: "pull", nombre: "Pull" }, { id: "interactiva", nombre: "Interactiva" }];
const FRECUENCIA = [{ id: "diaria", nombre: "Diaria" }, { id: "semanal", nombre: "Semanal" }, { id: "mensual", nombre: "Mensual" }, { id: "una", nombre: "Una vez" }];
const QUIEN = [{ id: "tu", nombre: "Tú" }, { id: "mercadeo", nombre: "Equipo · mercadeo" }, { id: "patrocinadora", nombre: "Patrocinadora" }];
const AUTORIZA = [{ id: "na", nombre: "No aplica" }, { id: "patrocinadora", nombre: "Patrocinadora" }, { id: "tu", nombre: "Tú" }];
export const SALIDAS_C10 = [
  { id: "c10h08-01", interesado: "Patrocinadora", mesa: "patrocinadora", nota: "Quiere un informe corto cada viernes, que le mandes tú.", clave: { metodo: "push", frecuencia: "semanal", quien: "tu", autoriza: "na" },
    retro: "Un informe enviado a ella cada viernes es push semanal." },
  { id: "c10h08-02", interesado: "Equipo", mesa: "equipo", nota: "Se reúne de pie contigo cada mañana.", clave: { metodo: "interactiva", frecuencia: "diaria", quien: "tu", autoriza: "na" },
    retro: "Reunión diaria en tiempo real: interactiva y diaria." },
  { id: "c10h08-03", interesado: "Cliente", mesa: "cliente", nota: "Consulta precios y fichas en el portal cuando quiere; mercadeo lo actualiza cada mes.", clave: { metodo: "pull", frecuencia: "mensual", quien: "mercadeo", autoriza: "na" },
    retro: "Él entra cuando quiere: pull; lo actualiza mercadeo cada mes." },
  { id: "c10h08-04", interesado: "Prensa de la costa", mesa: "tu", nota: "Recibe un comunicado el día del lanzamiento; trae precios, así que lo aprueba la patrocinadora.", clave: { metodo: "push", frecuencia: "una", quien: "tu", autoriza: "patrocinadora" },
    retro: "Un comunicado con precios lo autoriza la patrocinadora antes de salir." },
];
const ficha = (s) => ({
  tipo: "casillas", id: s.id, subtemas: ["gp-10-1"], mesa: s.mesa, interesado: s.interesado, retro: s.retro,
  texto: `${s.interesado} · «${s.nota}»`,
  consigna: "Completa la ficha de cada interesado en el tablero.",
  casillas: [
    { id: "metodo", nombre: "Método", opciones: METODO, clave: s.clave.metodo },
    { id: "frecuencia", nombre: "Frecuencia", opciones: FRECUENCIA, clave: s.clave.frecuencia },
    { id: "quien", nombre: "Quién comunica", opciones: QUIEN, columnas: 3, clave: s.clave.quien },
    { id: "autoriza", nombre: "Quién autoriza lo confidencial", opciones: AUTORIZA, columnas: 3, clave: s.clave.autoriza },
  ],
});
export const GP_C10_H08 = {
  id: "gp26-pla-c10-h08-tablero",
  contexto: "La patrocinadora quiere ver el plan de comunicaciones del lanzamiento antes del lunes. Tienes las notas de cada interesado.",
  rol: "Diriges el lanzamiento y armas el plan de comunicaciones.",
  consigna: "Completa la ficha de cada interesado en el tablero.",
  cierre: null,
  subtemas: ["gp-10-1"],
  elenco: ["tu", "patrocinadora", "cliente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Completa la ficha de cada interesado en el tablero.",
      pasos: SALIDAS_C10.map(ficha),
    },
    {
      tipo: "clasificar",
      consigna: "¿Esto va en el plan de comunicaciones?",
      destinos: [{ id: "si", nombre: "Va en el plan", acierto: "Pegada" }, { id: "no", nombre: "Al buzón: es de otro documento", acierto: "Al buzón" }],
      /* 8: 6 que van y 2 que no. */
      partida: { porClave: { si: 6, no: 2 } },
      banco: con("gp-10-1", [
        it("c10h08-05", "A quién escalar si una tienda no responde.", "si", "Los procesos de escalamiento son parte del plan."),
        it("c10h08-06", "Glosario de términos del lanzamiento.", "si", "El plan incluye un glosario de términos comunes."),
        it("c10h08-07", "Quién autoriza divulgar información confidencial.", "si", "El plan nombra a quien autoriza lo confidencial."),
        it("c10h08-08", "Cómo y cuándo se actualiza este plan.", "si", "El plan dice cómo se actualiza y refina."),
        it("c10h08-09", "Restricciones legales de la publicidad.", "si", "Las restricciones legales o normativas van en el plan."),
        it("c10h08-10", "Tiempo y presupuesto para las comunicaciones.", "si", "Los recursos para comunicar son parte del plan."),
        it("c10h08-11", "El diseño del logo nuevo.", "no", "Es parte del producto, no de cómo se comunica."),
        it("c10h08-12", "Proveedores de vallas con sus precios.", "no", "Eso es de adquisiciones."),
        it("c10h08-13", "Las reglas de conducta del equipo.", "no", "Van en el acta de constitución del equipo."),
        it("c10h08-14", "La autorización formal del proyecto.", "no", "Eso es el acta de constitución del proyecto."),
      ]),
      despues: { id: "c10h08-15", subtemas: ["gp-10-1"], barajar: true,
        contexto: "A mitad del proyecto se suman las tiendas de Santa Marta.",
        consigna: "¿Qué haces con el plan?",
        destinos: [{ id: "revisar", nombre: "Revisarlo y actualizarlo" }, { id: "nada", nombre: "Nada, ya se aprobó" }, { id: "otro", nombre: "Hacer uno solo para ellas" }],
        clave: "revisar", retros: { nada: "El plan se revisa cuando cambia la comunidad de interesados.", otro: "Es el mismo plan, actualizado." } },
    },
  ],
};

/* ─── H09 · La reunión que se desbordó (decisiones con consecuencias) ─── */
const momento = (id, n, hora, texto, mejor, malas) => ({
  id, subtemas: ["gp-10-2"], barajar: true, momento: n, hora, contexto: `${n} · ${texto}`,
  destinos: [{ id: "mejor", nombre: mejor }, ...malas.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(malas.map(([, retro], k) => [`otra${k + 1}`, retro])),
});
export const PASOS_REUNION_C10 = ["Agenda con objetivo", "Invitados adecuados", "Empezar a tiempo", "Seguir en el tema", "Gestionar el conflicto", "Registrar acciones"];
export const GP_C10_H09 = {
  id: "gp26-eje-c10-h09-reunion",
  contexto: "Citas a los distribuidores para fijar la fecha de entrega. La última reunión duró tres horas y no decidió nada.",
  rol: "Diriges el lanzamiento y conduces la reunión.",
  consigna: "Decide qué haces en cada momento de la reunión.",
  cierre: "Agenda, hora, invitados, foco, conflictos y acciones con responsable.",
  subtemas: ["gp-10-2"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "micros",
    consigna: "Decide qué haces en cada momento de la reunión.",
    pasos: [
      momento("c10h09-01", 1, "Martes", "Faltan dos días para la reunión.", "Enviar la agenda con el objetivo: fijar la fecha",
        [["Citar sin agenda", "Sin agenda ni objetivo, la reunión se dispersa."], ["Mandar todos los documentos", "Lo que guía es una agenda con objetivos."]]),
      momento("c10h09-02", 2, "Martes", "¿A quién invitas?", "A los distribuidores y a logística, que deciden la fecha",
        [["A todo Altamira", "Se invita a los participantes adecuados, no a todos."], ["Solo a la patrocinadora", "Faltarían quienes deciden la entrega."]]),
      momento("c10h09-03", 3, "9:00", "Son las 9:00 y faltan dos invitados.", "Empezar a la hora publicada",
        [["Esperar media hora", "Las reuniones empiezan y terminan a la hora publicada."], ["Cancelar", "Los presentes pueden avanzar; se empieza a tiempo."]]),
      momento("c10h09-04", 4, "9:20", "Un distribuidor saca el color de las cajas.", "Anotarlo para otra reunión y volver a la fecha",
        [["Discutirlo ya", "Hay que permanecer en el tema."], ["Ignorarlo sin anotar", "Anótalo: así gestionas su expectativa."]]),
      momento("c10h09-05", 5, "9:40", "Dos distribuidores discuten por la fecha.", "Escuchar a ambos, aclarar y confirmar cada postura",
        [["Terminar la reunión", "Los conflictos se gestionan dentro de la reunión."], ["Dejar que discutan", "Hay que gestionar el conflicto, no dejarlo crecer."]]),
      momento("c10h09-06", 6, "10:00", "Se acordó el 3 de marzo.", "Registrar la acción, el responsable y la fecha",
        [["Confiar en la memoria", "Toda acción se registra con su responsable."], ["Mandar el audio completo", "Basta registrar acciones y responsables."]]),
    ],
  }],
};

/* ─── H10 · La ecosonda del lanzamiento (2 etapas) ─── */
const porcentaje = (id, texto, consigna, nombre, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-10-3"], texto, consigna, retro,
  casillas: [{ id: "pct", nombre, clave: LANZAMIENTO_C10.monitoreo.find((x) => x.id === id).clave, tolerancia: 1, unidad: "%" }],
});
const hallazgo = (id, texto, mejor, malas) => ({
  id, subtemas: ["gp-10-3"], barajar: true, contexto: texto,
  destinos: [{ id: "mejor", nombre: mejor }, ...malas.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(malas.map(([, retro], k) => [`otra${k + 1}`, retro])),
});
export const GP_C10_H10 = {
  id: "gp26-moc-c10-h10-ecosonda",
  contexto: "Pasó un mes desde el lanzamiento. La patrocinadora pregunta si las comunicaciones sirvieron de verdad.",
  rol: "Diriges el lanzamiento y monitoreas las comunicaciones.",
  consigna: "Calcula cada porcentaje con los datos del mes.",
  cierre: null,
  subtemas: ["gp-10-3"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula cada porcentaje con los datos del mes.",
      pasos: [
        porcentaje("c10h10-01", "Planeaste 12 boletines a las tiendas; enviaste 9.", "¿Qué % del plan cumpliste?", "Plan cumplido", "9 ÷ 12 = 0,75: cumpliste el 75 %."),
        porcentaje("c10h10-02", "Encuestaste 45 tiendas; 18 entendieron el precio nuevo.", "¿Qué % entendió?", "Tiendas que entendieron", "18 ÷ 45 = 0,40: solo el 40 % entendió."),
        porcentaje("c10h10-03", "Planeaste 8 reuniones con la cadena hotelera; hiciste 8.", "¿Qué % del plan cumpliste?", "Plan cumplido", "8 de 8: lo implementado coincide con lo planeado."),
        { id: "c10h10-04", subtemas: ["gp-10-3"],
          consigna: "¿Basta con haber enviado los boletines?",
          destinos: SI_NO, clave: "no", retros: { si: "Monitorear mira si tuvo el efecto deseado, no solo si se envió." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Decide qué sigue tras cada hallazgo.",
      pasos: [
        hallazgo("c10h10-05", "El 60 % de las tiendas no entendió el precio.", "Solicitud de cambio para revisar formato y método",
          [["Archivar la encuesta", "El hallazgo pide ajustar la comunicación."], ["Repetir el mismo correo", "Hay que cambiar contenido, formato o método."]]),
        hallazgo("c10h10-06", "Los boletines se atrasan porque esperan tres firmas.", "Nuevo procedimiento que quite el cuello de botella",
          [["Enviarlos sin firmas", "Se crea un procedimiento; no se salta la autorización."], ["No hacer nada", "Un cuello de botella pide un procedimiento nuevo."]]),
        hallazgo("c10h10-07", "El cliente ya está tan involucrado como se deseaba.", "Mantener la estrategia y registrar la lección",
          [["Cambiar todo el plan", "Lo que funciona se mantiene y se documenta."], ["Dejar de comunicarse", "El apoyo se mantiene comunicando."]]),
        { id: "c10h10-08", subtemas: ["gp-10-3"],
          consigna: "¿Monitorear puede llevarte a planificar otra vez?",
          destinos: SI_NO, clave: "si", retros: { no: "Monitorear puede disparar otra vuelta de planificar y gestionar." } },
      ],
    },
  ],
};

/* ─── H11 · La diapositiva del practicante (encontrar el error) ─── */
export const GP_C10_H11 = {
  id: "gp26-moc-c10-h11-diapositiva",
  contexto: "El practicante preparó la charla de comunicaciones para los gerentes de tienda. La PMO te pide revisar las diapositivas.",
  rol: "Diriges el lanzamiento y revisas la charla.",
  consigna: "Toca las frases con error y corrígelas.",
  cierre: null,
  subtemas: ["gp-10-1", "gp-10-2", "gp-10-3"],
  elenco: ["tu", "practicante", "pmo"],
  etapas: [{
    tipo: "memorando",
    consigna: "Toca las frases con error y corrígelas.",
    membrete: "LANZAMIENTO EN LA COSTA · CHARLA PARA GERENTES DE TIENDA",
    /* imagen-pendiente: pantalla-proyeccion (el motor usa ese papel en cuanto exista; mientras, el memorando) */
    papel: "pantalla-proyeccion",
    entregar: "Aprobar la charla",
    partida: { conError: 3, correctas: 3 },
    frases: [
      { id: "c10h11-01", texto: "Con un correo a todos, aseguramos que todos entendieron.", error: true, subtema: "gp-10-1",
        buena: "Push asegura el envío, no la comprensión.",
        malas: [{ texto: "Asegura que todos estén de acuerdo.", retro: "Enviar no produce acuerdo." }, { texto: "Funciona si es largo.", retro: "La extensión no garantiza comprensión." }] },
      { id: "c10h11-02", texto: "Si la tienda confirma «recibido», está de acuerdo.", error: true, subtema: "gp-10-2",
        buena: "Confirmar solo indica que el mensaje llegó.",
        malas: [{ texto: "Confirmar es entenderlo todo.", retro: "Confirmar no prueba comprensión." }, { texto: "Confirmar es responder.", retro: "La respuesta es la retroalimentación, aparte." }] },
      { id: "c10h11-03", texto: "El plan de comunicaciones se hace una vez, al inicio.", error: true, subtema: "gp-10-1",
        buena: "Se revisa al cambiar los interesados o empezar una fase.",
        malas: [{ texto: "Se hace al cierre.", retro: "Se hace temprano y se revisa." }, { texto: "Lo hace la prensa.", retro: "Lo prepara el equipo del proyecto." }] },
      { id: "c10h11-04", texto: "Con las 5C ya no habrá malentendidos.", error: true, subtema: "gp-10-2",
        buena: "Las 5C reducen los malentendidos; no los eliminan.",
        malas: [{ texto: "Las 5C son para redes sociales.", retro: "Son para mensajes escritos tradicionales." }, { texto: "Bastan 3C.", retro: "Son cinco: correcto, conciso, claro, coherente, controlado." }] },
      { id: "c10h11-05", texto: "Gestionar las comunicaciones es solo repartir información.", error: true, subtema: "gp-10-2",
        buena: "También asegura que llegue a la audiencia y se pueda aclarar.",
        malas: [{ texto: "Es solo guardar archivos.", retro: "Va de crear a disponer, y que llegue." }, { texto: "Es lo mismo que monitorear.", retro: "Monitorear evalúa el efecto; gestionar lo hace fluir." }] },
      { id: "c10h11-06", texto: "El manual de 80 páginas se manda por correo a cada uno.", error: true, subtema: "gp-10-1",
        buena: "Para información voluminosa conviene pull, en un portal.",
        malas: [{ texto: "Se lee en voz alta en una reunión.", retro: "Es demasiado volumen para una reunión." }, { texto: "No hace falta compartirlo.", retro: "Las tiendas lo necesitan; se deja para consulta." }] },
      { id: "c10h11-07", texto: "Un grupo pequeño tiene de tres a seis personas.", error: false, subtema: "gp-10-1",
        retro: "Correcta: así lo define la guía." },
      { id: "c10h11-08", texto: "Monitorear puede obligarnos a replanificar las comunicaciones.", error: false, subtema: "gp-10-3",
        retro: "Correcta: puede disparar una nueva iteración." },
      { id: "c10h11-09", texto: "La elección de palabras también comunica.", error: false, subtema: "gp-10-2",
        retro: "Correcta: hay matices entre palabras parecidas." },
      { id: "c10h11-10", texto: "El director pasa la mayor parte del tiempo comunicándose.", error: false, subtema: "gp-10-2",
        retro: "Correcta: con el equipo y los demás interesados." },
    ],
  }],
};

export const PIEZAS_TEXTO_C10 = [GP_C10_H01, GP_C10_H02, GP_C10_H03, GP_C10_H04, GP_C10_H05, GP_C10_H06, GP_C10_H07, GP_C10_H08, GP_C10_H09, GP_C10_H10, GP_C10_H11];
