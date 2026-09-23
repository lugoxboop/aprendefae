import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "./TopicIndexView.jsx";
import { ContabilidadIcon } from "./SubjectCard.jsx";
import LibroMayorBackground from "./backgrounds/LibroMayorBackground.jsx";

/*
 * Índice de temas de Contabilidad.
 *
 * Hoy la materia no tiene ni un tema: TopicIndexView ya sabe qué enseñar
 * cuando `topics` viene vacío —EMPTY_TOPICS_MESSAGE, «Los temas de esta
 * materia están en construcción.»— y eso es exactamente lo que se ve. No hace
 * falta un estado vacío nuevo ni un texto nuevo: el que existe ya dice lo que
 * hay que decir, y usar el del sitio es lo que hace que la materia se sienta
 * parte del sitio y no un anexo.
 *
 * El fondo del libro mayor solo se descarga al abrir esta materia, igual que
 * el ajedrez en Pensamiento Estratégico.
 */
export default function ContabilidadTopicIndex({ onOpenTopic }) {
  const subject = SUBJECTS.contabilidad;
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
      onOpenTopic={onOpenTopic}
    />
  );
}
