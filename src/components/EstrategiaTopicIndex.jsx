import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "./TopicIndexView.jsx";
import { EstrategiaIcon } from "./SubjectCard.jsx";
import ChessBackground from "./backgrounds/ChessBackground.jsx";

/*
 * Índice de temas de Pensamiento Estratégico.
 * La escena 3D de ajedrez solo se descarga al abrir esta materia.
 */
export default function EstrategiaTopicIndex({ onOpenTopic }) {
  const subject = SUBJECTS["pensamiento-estrategico"];
  return (
    <TopicIndexView
      subjectId={subject.id}
      name={subject.name}
      accent={FAE.teal}
      hoverBg="rgba(42,157,143,0.14)"
      hoverBorder="rgba(42,157,143,0.75)"
      background={<ChessBackground />}
      /* la madera clara del tablero necesita más base para que el texto se lea */
      veilCenterAlpha={0.34}
      topics={subject.topics}
      renderTopicIcon={() => <EstrategiaIcon />}
      onOpenTopic={onOpenTopic}
    />
  );
}
