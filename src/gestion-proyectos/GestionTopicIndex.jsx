import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "../components/TopicIndexView.jsx";
import { CapaFondoGP } from "./comun/FondoGP.jsx";
import { ProyectosIcon } from "../components/SubjectCard.jsx";

/*
 * Índice de temas de Gestión de Proyectos: el mismo TopicIndexView de las
 * otras materias, con el fondo de Gantt de la materia. Un tema por capítulo
 * de la guía del PMBOK.
 */
export default function GestionTopicIndex({ onOpenTopic }) {
  const subject = SUBJECTS["gestion-proyectos"];
  return (
    <TopicIndexView
      subjectId={subject.id}
      name={subject.name}
      accent="#6C8CFF"
      hoverBg="rgba(108,140,255,0.14)"
      hoverBorder="rgba(108,140,255,0.75)"
      background={<CapaFondoGP />}
      topics={subject.topics}
      renderTopicIcon={() => <ProyectosIcon />}
      onOpenTopic={onOpenTopic}
    />
  );
}
