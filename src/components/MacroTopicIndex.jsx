import { FAE } from "../theme.js";
import { SUBJECTS, ACTIVIDADES_TRANSVERSALES } from "../data/subjects.js";
import TopicIndexView from "./TopicIndexView.jsx";
import { MacroIcon } from "./SubjectCard.jsx";
import SupplyDemandBackground from "./backgrounds/SupplyDemandBackground.jsx";
import EntradaRepaso from "./repaso/EntradaRepaso.jsx";

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
      entradas={ACTIVIDADES_TRANSVERSALES.filter((a) => a.indice === subject.id).map((a) => (
        <EntradaRepaso
          key={a.id}
          actividad={a}
          onAbrir={(id) => onOpenTopic(id)}
          hoverBg="rgba(42,157,143,0.12)"
          hoverBorder="rgba(42,157,143,0.7)"
        />
      ))}
    />
  );
}
