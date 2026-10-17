import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "./TopicIndexView.jsx";
import { ContabilidadIcon } from "./SubjectCard.jsx";
import LibroMayorBackground from "./backgrounds/LibroMayorBackground.jsx";

/*
 * Índice de temas de Contabilidad.
 *
 * Pinta los temas de SUBJECTS.contabilidad con el TopicIndexView de todas
 * las materias: una tarjeta por tema, partida en Aprender y Hacer cuando el
 * tema tiene contenido de las dos mitades. Si la lista viniera vacía,
 * TopicIndexView mostraría su propio mensaje —EMPTY_TOPICS_MESSAGE, «Los
 * temas de esta materia están en construcción.»—, sin un estado vacío propio
 * de Contabilidad: usar el del sitio es lo que hace que la materia se sienta
 * parte del sitio y no un anexo.
 *
 * El fondo del libro mayor solo se descarga al abrir esta materia, igual que
 * el ajedrez en Pensamiento Estratégico.
 */
export default function ContabilidadTopicIndex({ onOpenTopic }) {
  const subject = SUBJECTS.contabilidad;
  /*
   * `sinPildorasAlCerrar`: solo Contabilidad. Macroeconomía usa esta misma
   * vista y tiene estudiantes reales; no se toca sin el visto bueno de Mateo
   * (kit.md, el sistema de identificadores).
   */
  return (
    <TopicIndexView
      subjectId={subject.id}
      name={subject.name}
      accent={FAE.ambar}
      hoverBg="rgba(233,196,106,0.12)"
      hoverBorder="rgba(233,196,106,0.7)"
      background={<LibroMayorBackground />}
      topics={subject.topics}
      renderTopicIcon={() => <ContabilidadIcon />}
      sinPildorasAlCerrar
      onOpenTopic={onOpenTopic}
    />
  );
}
