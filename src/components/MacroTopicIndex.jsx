import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "./TopicIndexView.jsx";
import { MacroIcon } from "./SubjectCard.jsx";
import SupplyDemandBackground from "./backgrounds/SupplyDemandBackground.jsx";

/*
 * Índice de temas de Macroeconomía.
 * Existe como componente propio para que su fondo (curvas en canvas 2D) quede
 * en este chunk y no arrastre la escena 3D de la otra materia.
 */
export default function MacroTopicIndex({ onOpenTopic }) {
  const subject = SUBJECTS.macroeconomia;
  return (
    <TopicIndexView
      subjectId={subject.id}
      name={subject.name}
      accent={FAE.coral}
      hoverBg="rgba(231,111,81,0.12)"
      hoverBorder="rgba(231,111,81,0.7)"
      background={<SupplyDemandBackground />}
      topics={subject.topics}
      renderTopicIcon={() => <MacroIcon />}
      onOpenTopic={onOpenTopic}
    />
  );
}
