/*
 * ═══════════════════════════════════════════════════════════════════════════
 * "EL PROYECTO DEL ARCA" — contenido del desafío legendario del Iceberg.
 *
 * El caso lo leen antes de clase en papel; aquí no se reproduce, solo se
 * aplica el modelo. El PDF completo queda descargable desde la portada del
 * desafío (public/casos/caso_el_proyecto_del_arca.pdf).
 *
 * TODAS LAS CITAS ESTÁN VERIFICADAS CONTRA EL PDF. Se extrajo el texto del
 * archivo y se buscó cada una; las que llevan puntos suspensivos son recortes
 * de una frase más larga, no reescrituras. Dos precisiones sobre eso:
 *
 *   · La cita de las gerencias junta en una frase las cuatro instancias
 *     (GCO, GI, GB y GT-BAR). En el caso, las tres primeras aparecen el día 15
 *     y el GT-BAR se nombra después. Las cuatro existen; la frase las resume.
 *   · El caso no rotula "Día 15": dice "Quince días pasaron". La escena en que
 *     Absalón le niega a Noé contratar directamente ocurre justo ahí, así que
 *     el rótulo del sitio es fiel a la cronología.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PDF_CASO = "/casos/caso_el_proyecto_del_arca.pdf";

export const NIVELES = ["Evento", "Patrón", "Estructura", "Modelo mental"];

/* ───────────────────────── Etapa 1 — El expediente ───────────────────────── */

export const CITAS_EXPEDIENTE = [
  {
    id: "e1",
    texto: "El carpintero… cortó apenas tres árboles en la noche, después de las horas de oficina.",
    nivel: "Evento",
    porque: "Es un hecho puntual y observable: un día, un carpintero, tres árboles.",
  },
  {
    id: "e2",
    texto: "Solo había tres carpinteros en el sector de la carpintería.",
    contexto: "Día 125, después de contratar a 1200 personas",
    nivel: "Patrón",
    porque:
      "No es un mal día: es el resultado de meses contratando en todas partes menos donde se construye el barco.",
  },
  {
    id: "e3",
    texto:
      "Todos los carpinteros fueron reprobados en el psicotécnico… el examen de reconocimiento de tipos genéticos de insectos todos los reprueban.",
    nivel: "Estructura",
    porque:
      "El examen es el mecanismo. Mientras exista con esa forma, ningún carpintero entra, se presente quien se presente.",
  },
  {
    id: "e4",
    texto:
      "No puedo cambiar las normas de la organización autorizándote a contratar directamente a tus carpinteros… de la jefatura viene el ejemplo del cumplimiento de las normas.",
    nivel: "Modelo mental",
    porque:
      "Aquí está la creencia entera: cumplir la norma vale más que terminar el barco, y el jefe debe ser el primero en demostrarlo.",
  },
  {
    id: "e5",
    texto:
      "En nuestros archivos no constan los exámenes de admisión de Noé y ni siquiera sabemos si él es Ingeniero Naval.",
    nivel: "Evento",
    porque: "Es la frase concreta que alguien dice en una reunión concreta, el día 100.",
  },
  {
    id: "e6",
    texto: "Sin mis hombres no hay operación del barco.",
    contexto: "explotó el comandante de operaciones, defendiendo su área en cada reunión",
    nivel: "Patrón",
    porque: "Se repite: cada vez que se habla de recortar, cada gerente defiende lo suyo.",
  },
  {
    id: "e7",
    texto:
      "Existe una Gerencia de Cosas (GCO), una de inversiones (GI), una de barco (GB), y un grupo de trabajo (GT-BAR).",
    nivel: "Estructura",
    porque: "Es el organigrama: la disposición de piezas que hace que nadie pueda decidir solo.",
  },
  {
    id: "e8",
    texto: "No te preocupes que el proyecto está en manos de profesionales, los mejores.",
    nivel: "Modelo mental",
    porque:
      "La creencia de que un título y un cargo bastan, dicha justo cuando el barco no avanza.",
  },
];

/* ────────────────────── Etapa 2 — El iceberg de Absalón ────────────────────── */

export const PROBLEMA_CENTRAL =
  "El barco de Absalón nunca se termina, a pesar de tener 1200 personas trabajando en el proyecto.";

/*
 * EL BANCO Y CÓMO SE CALIFICA.
 *
 * 24 opciones, todas sacadas del caso. Cuatro son la respuesta de referencia
 * —una por nivel— y valen el peso completo de su nivel. Otras cuatro son
 * `parcial`: dicen algo cierto y del nivel correcto, pero se quedan en el
 * síntoma en lugar de nombrar el mecanismo, así que valen menos sin valer cero.
 * Las dieciséis restantes son distractores.
 *
 * POR QUÉ EXISTE EL ESCALÓN PARCIAL. La consigna pedía evaluar "por presencia
 * de elementos clave y no por coincidencia exacta". Con un banco de opciones
 * no hay texto libre que analizar, así que el matiz se codifica en el banco:
 * la diferencia entre "hay muchas gerencias" (parcial: describe) y "hay muchas
 * gerencias y ninguna puede dejar construir a Noé" (completa: explica) es
 * exactamente la diferencia entre ver la estructura y entenderla.
 *
 * LOS DISTRACTORES SON TODOS DE ESTE CASO, y de dos clases:
 *   · `nivelReal`  — es cierto, pero pertenece a otro nivel del iceberg.
 *   · sin nivelReal — es cierto y del caso, pero no explica por qué el barco
 *                     no se termina: color, consecuencia o anécdota.
 */
export const BANCO_ARCA = [
  /* ---------- Evento ---------- */
  {
    id: "a1", nivel: "Evento", valor: "completa",
    texto: "Al día 125 solo hay 3 carpinteros y el casco del barco casi no ha avanzado.",
  },
  {
    id: "a2", nivel: "Evento", valor: "parcial",
    texto: "El barco no está listo cuando empieza a llover.",
  },
  {
    id: "a3", nivel: "Evento", valor: "distractor",
    texto: "Absalón despierta preocupado y su carreta corre hacia la oficina central.",
  },
  {
    id: "a4", nivel: "Evento", valor: "distractor",
    texto: "Gau llega a las 10 de la mañana y la administración está vacía.",
  },
  {
    id: "a5", nivel: "Evento", valor: "distractor",
    texto: "Llega la respuesta del Señor: prórroga denegada.",
  },
  {
    id: "a6", nivel: "Evento", valor: "distractor",
    texto: "La recepcionista le dice a Noé que el presidente lo atenderá después del almuerzo.",
  },

  /* ---------- Patrón ---------- */
  {
    id: "a7", nivel: "Patrón", valor: "completa",
    texto:
      "Cada intento de avanzar —contratar, aprobar diseños, cortar madera— queda detenido por un proceso nuevo.",
  },
  {
    id: "a8", nivel: "Patrón", valor: "parcial",
    texto: "El personal de apoyo crece mes a mes mientras la carpintería sigue igual.",
  },
  {
    id: "a9", nivel: "Patrón", valor: "distractor",
    texto: "Cada vez que se propone recortar personal, cada gerente defiende su propia área.",
    nivelReal: "Patrón",
    nota: "Es un patrón de verdad, pero explica la crisis de caja, no por qué no se construye el barco.",
  },
  {
    id: "a10", nivel: "Patrón", valor: "distractor",
    texto: "Los sueldos de los especialistas siempre superan a los de los carpinteros.",
    nivelReal: "Estructura",
    nota: "Suena a repetición, pero es cómo está montada la escala salarial: estructura.",
  },
  {
    id: "a11", nivel: "Patrón", valor: "distractor",
    texto: "Todos los carpinteros que se presentan reprueban el psicotécnico.",
    nivelReal: "Estructura",
    nota: "Se repite, sí, pero lo que se repite es el examen. El mecanismo es la estructura.",
  },
  {
    id: "a12", nivel: "Patrón", valor: "distractor",
    texto: "Absalón se acuesta satisfecho después de cada avance administrativo.",
  },

  /* ---------- Estructura ---------- */
  {
    id: "a13", nivel: "Estructura", valor: "completa",
    texto:
      "Hay seis o más gerencias y comités, y ninguno tiene autoridad real para simplemente dejar construir a Noé.",
  },
  {
    id: "a14", nivel: "Estructura", valor: "parcial",
    texto: "El proyecto tiene una gerencia, un comité o un laboratorio para cada asunto.",
  },
  {
    id: "a15", nivel: "Estructura", valor: "distractor",
    texto: "Hay 200 cabras y 5 pastores para distribuir la leche del personal.",
    nota: "Es la consecuencia más visible del organigrama, no el organigrama.",
  },
  {
    id: "a16", nivel: "Estructura", valor: "distractor",
    texto: "El laboratorio no emite el acta de aprobación de la madera.",
    nivelReal: "Evento",
    nota: "Es un bloqueo concreto en una fecha concreta: un evento del que la estructura es la causa.",
  },
  {
    id: "a17", nivel: "Estructura", valor: "distractor",
    texto: "Noé cobra 10 dracmas y el equipo de selección entre 8 y 12.",
  },
  {
    id: "a18", nivel: "Estructura", valor: "distractor",
    texto: "El GT-BAR se nombra para opinar sobre los diseños de Noé.",
    nivelReal: "Evento",
    nota: "Crear ese grupo es un hecho puntual; la estructura es que haga falta crearlo.",
  },

  /* ---------- Modelo mental ---------- */
  {
    id: "a19", nivel: "Modelo mental", valor: "completa",
    texto:
      "Absalón cree que más estructura, más profesionales y más procesos garantizan el éxito, y que cumplir las normas importa más que terminar el barco.",
  },
  {
    id: "a20", nivel: "Modelo mental", valor: "parcial",
    texto: "Absalón cree que el proyecto está en buenas manos porque son profesionales.",
  },
  {
    id: "a21", nivel: "Modelo mental", valor: "distractor",
    texto: "Absalón cree que un ingeniero sin papeles no puede haber construido nada.",
    nota: "Es una consecuencia de la creencia de fondo, no la creencia: por eso despiden a Noé.",
  },
  {
    id: "a22", nivel: "Modelo mental", valor: "distractor",
    texto: "Absalón quiere demostrar que un hombre de 65 años puede salvar a la humanidad.",
    nota: "Es su motivo para aceptar el encargo, no lo que sostiene la burocracia.",
  },
  {
    id: "a23", nivel: "Modelo mental", valor: "distractor",
    texto: "Roboam cree que para elegir 15 carpinteros hay que examinar a 200 hombres.",
    nivelReal: "Estructura",
    nota: "Es una creencia, pero de un subordinado y ya convertida en procedimiento.",
  },
  {
    id: "a24", nivel: "Modelo mental", valor: "distractor",
    texto: "Noé cree que con 10 carpinteros y un mes de trabajo el barco estaría listo.",
    nota: "Es el modelo mental contrario: el del único que sí termina un barco.",
  },
];

/* ───────────────────── Etapa 3 — El momento de decisión ───────────────────── */

export const ESCENA_DECISION = {
  dia: "Día 100",
  titulo: "Reunión de la gerencia",
  texto:
    "La caja no alcanza para los empréstitos de la próxima semana. Cada gerente defiende su área. Alguien acaba de decir que en los archivos no constan los exámenes de admisión de Noé. Absalón, callado, va a decidir.",
};

export const DECISIONES = [
  {
    id: "b",
    texto:
      "Aprobar de inmediato los diseños de Noé y darle autoridad directa para contratar sus propios carpinteros, saltándose el proceso estándar.",
    peso: 100,
    porque:
      "Es lo único que toca la creencia de fondo. Sin cambiar el organigrama entero, saca al barco del embudo.",
  },
  {
    id: "a",
    texto:
      "Reducir personal en áreas de apoyo (RRHH, seguridad, laboratorios) y liberar presupuesto para los carpinteros reales.",
    peso: 50,
    porque: "Libera recursos y quita peso, pero el proceso que frena a Noé sigue en pie.",
  },
  {
    id: "c",
    texto: "Contratar una consultora externa de gerencia de proyectos para reorganizar el proyecto.",
    peso: 10,
    porque: "Añade una capa más de estructura al problema que causa la estructura.",
  },
  {
    id: "d",
    texto: "Pedir una prórroga de plazo.",
    peso: 0,
    porque: "Es exactamente lo que Absalón hace en el caso. Se la deniegan: ya comenzó a llover.",
  },
];

/* De mayor a menor impacto real. */
export const ORDEN_DECISIONES = ["b", "a", "c", "d"];

/* ─────────────────── Etapa 4 — La carrera contra el diluvio ─────────────────── */

export const PREGUNTA_DILUVIO =
  "De todos los momentos del caso, ¿en cuál habría sido posible salvar el proyecto con el MENOR cambio posible?";

export const MOMENTOS = [
  {
    id: "d15", etiqueta: "Día 15", pct: 100,
    detalle: "Absalón le niega a Noé autoridad directa por primera vez.",
  },
  {
    id: "d40", etiqueta: "Día 40", pct: 60,
    detalle: "Primera reunión de la gerencia; la burocracia ya crece.",
  },
  {
    id: "d100", etiqueta: "Día 100", pct: 30,
    detalle: "Reunión de gerencia; despiden a Noé.",
  },
  {
    id: "d125", etiqueta: "Día 125", pct: 0,
    detalle: "Ya está lloviendo.",
  },
];

export const EXPLICACION_DILUVIO =
  "El día 15 es el punto más temprano y más barato de corregir: bastaba una frase distinta. Cuanto más tarde se interviene, más estructura hay que desmontar para llegar a la misma creencia de fondo — y en el día 125 ya no hay cambio posible, solo lluvia.";

/* Viñetas del repaso rápido del cierre. */
export const VINETAS_CIERRE = [
  { dia: "Día 15", texto: "«No puedo cambiar las normas.»" },
  { dia: "Día 40", texto: "Un carpintero. Tres árboles." },
  { dia: "Día 80", texto: "Nace otro comité." },
  { dia: "Día 100", texto: "Noé está despedido." },
  { dia: "Día 125", texto: "Prórroga denegada. Ya comenzó a llover." },
];
