import { FAE } from "../theme.js";
import HummingbirdBackground from "./backgrounds/HummingbirdBackground.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Hero from "./Hero.jsx";
import SubjectCard, { MacroIcon, EstrategiaIcon } from "./SubjectCard.jsx";
import Logo from "./Logo.jsx";
import Footer from "./shared/Footer.jsx";

/* Pantalla de entrada: colibrí libando + titular rotativo + las dos materias. */
export default function HomeScreen({ onSelectSubject }) {
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
      <HummingbirdBackground />
      <BackgroundVeil />

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
        {/* Marca de identidad, deliberadamente por debajo del titular y las tarjetas. */}
        <Logo variant="full" size={30} theme="dark" />

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
          <Hero />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              width: "100%",
              maxWidth: "760px",
            }}
          >
            <SubjectCard
              icon={<MacroIcon />}
              title="Macroeconomía"
              label="Card Macroeconomía"
              accent={FAE.coral}
              hoverBg="rgba(231,111,81,0.12)"
              hoverBorder="rgba(231,111,81,0.7)"
              onClick={() => onSelectSubject("macroeconomia")}
            />
            <SubjectCard
              icon={<EstrategiaIcon />}
              title="Pensamiento Estratégico"
              label="Card Pensamiento Estratégico"
              accent={FAE.teal}
              hoverBg="rgba(42,157,143,0.14)"
              hoverBorder="rgba(42,157,143,0.75)"
              onClick={() => onSelectSubject("pensamiento-estrategico")}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.4)", whiteSpace: "nowrap" }}>
            Entrar no pide registro.
          </span>
          <Footer />
        </div>
      </div>
    </div>
  );
}
