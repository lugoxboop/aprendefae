import { useState } from "react";
import { FAE } from "../theme.js";
import { ACTIVIDADES_TRANSVERSALES, APRENDER, EMPTY_TOPICS_MESSAGE, HACER, tieneContenidoDe, tiposDeTema } from "../data/subjects.js";
import SubjectCard from "./SubjectCard.jsx";
import TopicSplitCard from "./TopicSplitCard.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";
import LigaBoard from "./ligas/LigaBoard.jsx";
import BannerRepaso from "./repaso/BannerRepaso.jsx";
import { marcaDeTema } from "./shared/contenidoNuevo.jsx";
import IdentificadorDeTema, { CSS_IDENTIFICADOR } from "./shared/IdentificadorDeTema.jsx";

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
  /*
   * Sin píldoras en la cara cerrada cuando la tarjeta se parte (kit.md, el
   * sistema de identificadores). Un dato idéntico en las nueve tarjetas no
   * informa. Va como opción y NO por defecto porque esta vista también la usa
   * Macroeconomía, que tiene estudiantes reales: las demás materias no la
   * pasan y se ven igual.
   */
  sinPildorasAlCerrar = false,
  veilCenterAlpha,
  onOpenTopic,
}) {
  /*
   * Qué tarjeta está mostrando su elección. Solo una a la vez: dos tarjetas
   * abiertas en la misma rejilla convierten una decisión en un formulario.
   */
  const [abierta, setAbierta] = useState(null);

  return (
    <>
      {/* Una vez por página, no una por tarjeta: el movimiento y sus colores. */}
      <style>{CSS_IDENTIFICADOR}</style>
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
        {/*
          El logo hace de regreso al inicio: aquí no hay botón de volver aparte.

          Por eso la cabecera lleva `fae-sin-volver`. La regla del header
          compacto esconde el logo en pantallas estrechas porque «el botón de
          volver ya cubre la salida», y aquí esa premisa no se cumple: el logo
          ES la salida. Esconderlo dejaría al estudiante dentro del índice sin
          forma de ir al inicio. Lo demás de la regla —sin divisor, pastilla
          compacta, título que trunca el último— sí se aplica.
        */}
        <div className="fae-cabecera-titulo fae-sin-volver" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="fae-cabecera-marca"><Logo variant="symbol" size={28} theme="dark" /></span>
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

        {/*
          Lo transversal de esta materia —hoy, el Repaso Diario— va ARRIBA, justo
          bajo la cabecera y FUERA de la rejilla: no es un tema y no se ve como
          uno. Sale de ACTIVIDADES_TRANSVERSALES por `indice`, así que cada
          materia enseña solo el suyo y una materia sin ninguno no reserva sitio.
        */}
        {/* `publicado: false` la deja fuera mientras se construye; el Repaso de Macro no lo lleva y se ve como siempre. */}
        {ACTIVIDADES_TRANSVERSALES.filter((a) => a.indice === subjectId && a.publicado !== false).map((a) => (
          <div key={a.id} data-encabezado-materia style={{ width: "100%", maxWidth: "760px", margin: "clamp(18px, 3vh, 28px) auto 0" }}>
            {/* La expansión vive dentro del banner; el botón de empezar navega a la partida. */}
            <BannerRepaso actividad={a} onEmpezar={() => onOpenTopic(a.temaId)} />
          </div>
        ))}

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
                  /*
                   * El identificador propio del tema si lo tiene, y el ícono de
                   * la materia si no. Un solo sitio decide: ver
                   * shared/IdentificadorDeTema.jsx.
                   */
                  icon: (
                    <IdentificadorDeTema
                      tema={topic}
                      materia={subjectId}
                      acento={accent}
                      respaldo={renderTopicIcon(topic)}
                    />
                  ),
                  badges,
                  accent,
                  hoverBg,
                  hoverBorder,
                };

                /*
                 * La tarjeta se parte cuando hay algo que elegir de verdad: las
                 * dos mitades con contenido. Con una sola llena —hoy, Demanda
                 * Agregada, que no tiene material— la elección sería un clic de
                 * más hacia el único destino que existe, con la otra opción
                 * apagada al lado.
                 *
                 * La respuesta sale del contenido, no de una marca por tema: en
                 * cuanto Gen clasifique la mitad que falta, ese tema se parte
                 * solo, sin tocar código.
                 */
                const hayQueElegir =
                  tieneContenidoDe(topic, APRENDER) && tieneContenidoDe(topic, HACER);

                return hayQueElegir ? (
                  <TopicSplitCard
                    key={topic.id}
                    topic={topic}
                    {...comun}
                    {...(sinPildorasAlCerrar ? { badges: null } : {})}
                    abierta={abierta === topic.id}
                    onAbrir={() => setAbierta(topic.id)}
                    onCerrar={() => setAbierta(null)}
                    onElegirModo={onOpenTopic}
                    marca={marcaDeTema(subjectId, topic.id)}
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
    </>
  );
}
