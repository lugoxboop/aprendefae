import { FAE } from "../theme.js";
import { EMPTY_TOPICS_MESSAGE, tiposDeTema } from "../data/subjects.js";
import SubjectCard from "./SubjectCard.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";

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
              {topics.map((topic) => (
                <SubjectCard
                  key={topic.id}
                  icon={renderTopicIcon(topic)}
                  title={topic.title}
                  label={`Tema ${topic.title}`}
                  /*
                   * Un tema con actividades de los dos tipos muestra las dos
                   * insignias; uno sin clasificar no muestra ninguna. Sale del
                   * dato, sin lógica por tema.
                   */
                  badges={tiposDeTema(topic).map((tipo) => (
                    <ActivityBadge key={tipo} tipo={tipo} size="sm" />
                  ))}
                  accent={accent}
                  hoverBg={hoverBg}
                  hoverBorder={hoverBorder}
                  onClick={() => onOpenTopic(topic.id)}
                />
              ))}
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

          {/* Ranking de esta materia: vive aquí, no en el inicio. */}
          <div style={{ width: "100%", maxWidth: "560px" }}>
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
