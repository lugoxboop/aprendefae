import { FAE } from "../theme.js";
import MeshGradientBackground from "./backgrounds/MeshGradientBackground.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Hero from "./Hero.jsx";
import SubjectCard, { MacroIcon, EstrategiaIcon, ContabilidadIcon } from "./SubjectCard.jsx";
import Logo from "./Logo.jsx";
import Footer from "./shared/Footer.jsx";
import { useEntradaApp, CSS_ENTRADA_APP } from "../estilo/entradaApp.js";

/* Pantalla de entrada: degradado en malla + titular rotativo + las dos materias. */
export default function HomeScreen({ onSelectSubject }) {
  /* La entrada estilo landing (src/estilo/entradaApp.js): solo la primera vez de la visita. */
  const entra = useEntradaApp();
  return (
    <div
      data-inicio
      className={entra ? "fae-app-entra" : undefined}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        overflow: "hidden",
      }}
    >
      {entra && <style>{CSS_ENTRADA_APP}</style>}
      <div className="fae-app-fondo" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <MeshGradientBackground />
      {/*
        * Velo por defecto, sin subirle el centro. Medido sobre el ciclo completo,
        * el peor contraste del titular es 8.62:1 incluso con el velo en cero: las
        * manchas van tan desenfocadas y tan sobre navy que no necesitan tapa
        * extra, y bajarla deja ver el color, que es de lo que va este fondo.
        */}
      <BackgroundVeil />
      </div>

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
        <div className="fae-app-marca"><Logo variant="full" size={30} theme="dark" /></div>

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
          <div className="fae-app-titular" style={{ display: "flex", justifyContent: "center", width: "100%" }}><Hero /></div>

          <div
            className="fae-app-materias"
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
            <SubjectCard
              icon={<ContabilidadIcon />}
              title="Contabilidad"
              label="Card Contabilidad"
              accent={FAE.ambar}
              hoverBg="rgba(233,196,106,0.12)"
              hoverBorder="rgba(233,196,106,0.7)"
              onClick={() => onSelectSubject("contabilidad")}
            />
          </div>
        </div>

        <div className="fae-app-pie" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12.5px", color: "#A8B6C8", whiteSpace: "nowrap" }}>
            Entrar no pide registro.
          </span>
          <Footer />
        </div>
      </div>
    </div>
  );
}
