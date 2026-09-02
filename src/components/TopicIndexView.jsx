import { useState } from "react";
import { FAE } from "../theme.js";
import { EMPTY_TOPICS_MESSAGE, tiposDeTema } from "../data/subjects.js";
import SubjectCard from "./SubjectCard.jsx";
import TopicSplitCard from "./TopicSplitCard.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";
import LigaBoard from "./ligas/LigaBoard.jsx";

/*
 * Plantilla del índice de temas, compartida por las dos materias.
 * Lo único que cambia entre ellas es el contenido y el fondo animado,
 * que llega como nodo en `background`.
 */
export default function TopicIndexView({
  subjectId,
  name,
  accent,
  hoverBg,
  hoverBorder,
  background,
  topics,
  renderTopicIcon,
  veilCenterAlpha,
  onOpenTopic,
}) {
  /*
   * Qué tarjeta está mostrando su elección. Solo una a la vez: dos tarjetas
   * abiertas en la misma rejilla convierten una decisión en un formulario.
   */
  const [abierta, setAbierta] = useState(null);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        overflow: "hidden",
      }}
    >
      {background}
      <BackgroundVeil centerAlpha={veilCenterAlpha} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "clamp(18px, 3vh, 30px) 24px clamp(18px, 3vh, 34px)",
        }}
      >
        {/* El logo hace de regreso al inicio: aquí no hay botón de volver aparte. */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Logo variant="symbol" size={28} theme="dark" />
          <h1
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              letterSpacing: "-0.02em",
              color: FAE.text,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {name}
          </h1>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(24px, 4vh, 44px)",
            padding: "clamp(20px, 5vh, 56px) 0 clamp(16px, 4vh, 40px)",
          }}
        >
          {topics.length > 0 ? (
            /*
             * El tope de 370px mantiene cada tarjeta del mismo ancho que las del
             * home, así que un tema solo no se estira; justifyContent centra el
             * grupo mientras la materia tenga pocos temas.
             */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 370px))",
                justifyContent: "center",
                gap: "20px",
                width: "100%",
                maxWidth: "760px",
              }}
            >
              {topics.map((topic) => {
                /*
                 * Un tema con actividades de los dos tipos muestra las dos
                 * insignias; uno sin clasificar no muestra ninguna. Sale del
                 * dato, sin lógica por tema.
                 */
                const badges = tiposDeTema(topic).map((tipo) => (
                  <ActivityBadge key={tipo} tipo={tipo} size="sm" />
                ));
                const comun = {
                  icon: renderTopicIcon(topic),
                  badges,
                  accent,
                  hoverBg,
                  hoverBorder,
                };

                /*
                 * Se parte la tarjeta si la vista del tema sabe filtrarse Y hay
                 * algo que elegir. Un tema sin ninguna actividad clasificada
                 * —hoy, Fuerzas de Porter— se abriría con las dos opciones
                 * deshabilitadas: dos clics para llegar a lo mismo. Ese entra
                 * directo hasta que Gen clasifique sus mecánicas, y entonces se
                 * parte solo, sin tocar código.
                 */
                const hayQueElegir = tiposDeTema(topic).length > 0;

                return topic.modosFiltrados && hayQueElegir ? (
                  <TopicSplitCard
                    key={topic.id}
                    topic={topic}
                    {...comun}
                    abierta={abierta === topic.id}
                    onAbrir={() => setAbierta(topic.id)}
                    onCerrar={() => setAbierta(null)}
                    onElegirModo={onOpenTopic}
                  />
                ) : (
                  <SubjectCard
                    key={topic.id}
                    {...comun}
                    title={topic.title}
                    label={`Tema ${topic.title}`}
                    onClick={() => onOpenTopic(topic.id)}
                  />
                );
              })}
            </div>
          ) : (
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.5,
                color: "rgba(248,249,250,0.75)",
                margin: 0,
                textAlign: "center",
                maxWidth: "min(90vw, 460px)",
                /* el fondo animado puede tener zonas claras justo detrás */
                textShadow: "0 1px 12px rgba(10,20,34,0.85)",
              }}
            >
              {EMPTY_TOPICS_MESSAGE}
            </p>
          )}

          {/*
            Liga y ranking conviven: la liga te compara con un grupo de tu
            tamaño, el ranking con toda la materia. La liga va primero porque
            es la que cambia cada semana.
          */}
          <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <LigaBoard subjectId={subjectId} />
            <RankingFP
              subjectId={subjectId}
              titulo={`Ranking de ${name}`}
              nota="Solo esta materia"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
