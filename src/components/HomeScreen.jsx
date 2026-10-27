import { FAE } from "../theme.js";
import MeshGradientBackground from "./backgrounds/MeshGradientBackground.jsx";
import BackgroundVeil from "./shared/BackgroundVeil.jsx";
import Hero from "./Hero.jsx";
import SubjectCard, { MacroIcon, EstrategiaIcon, ContabilidadIcon } from "./SubjectCard.jsx";
import Logo from "./Logo.jsx";
import Footer from "./shared/Footer.jsx";
import Entrada, { EstiloEntrada } from "./shared/Entrada.jsx";

/*
 * ⚑ La tarjeta de Pensamiento Estratégico en la portada. false = no se enseña
 * (orden de Mateo, 27-oct). Cambiarla a true la devuelve: una línea,
 * reversible, que no toca la materia ni los datos de nadie.
 */
export const PORTADA_ESTRATEGICO = false;

/* Pantalla de entrada: degradado en malla + titular rotativo + las materias en curso. */
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
      <MeshGradientBackground />
      {/*
        * Velo por defecto, sin subirle el centro. Medido sobre el ciclo completo,
        * el peor contraste del titular es 8.62:1 incluso con el velo en cero: las
        * manchas van tan desenfocadas y tan sobre navy que no necesitan tapa
        * extra, y bajarla deja ver el color, que es de lo que va este fondo.
        */}
      <BackgroundVeil />

      <EstiloEntrada />

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
          * LA COREOGRAFÍA DE LA PORTADA. El orden de entrada es el orden en que
          * queremos que se mire: primero de dónde estás (la marca, que baja),
          * luego qué es esto (el titular), luego lo único que hay que hacer
          * (elegir materia, y las tarjetas entran una detrás de otra para que
          * se lean como dos opciones y no como un bloque), y al final lo
          * accesorio. Toda la pantalla está puesta en 440 ms: se arma delante
          * de ti y ya puedes tocar.
          *
          * El fondo NO entra: es el escenario, ya está encendido cuando llegas.
          * Y tampoco se puede envolver, porque va en position:fixed y un
          * envoltorio animado le cambiaría el marco de referencia.
          */}
        {/* Marca de identidad, deliberadamente por debajo del titular y las tarjetas. */}
        <Entrada orden={0} modo="baja">
          <Logo variant="full" size={30} theme="dark" />
        </Entrada>

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
          <Entrada orden={1} modo="sube">
            <Hero />
          </Entrada>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              width: "100%",
              maxWidth: "760px",
            }}
          >
            <Entrada orden={2} modo="crece" estira>
            <SubjectCard
              icon={<MacroIcon />}
              title="Macroeconomía"
              label="Card Macroeconomía"
              accent={FAE.coral}
              hoverBg="rgba(231,111,81,0.12)"
              hoverBorder="rgba(231,111,81,0.7)"
              onClick={() => onSelectSubject("macroeconomia")}
            />
            </Entrada>
            {/*
              PENSAMIENTO ESTRATÉGICO, FUERA DE LA PORTADA. Orden de Mateo del
              27 de octubre: este semestre la portada enseña solo las dos
              materias en curso.

              Se esconde la tarjeta, NO la materia: `pensamiento-estrategico`
              sigue entera en subjects.js, sus temas se siguen construyendo y
              quien tenga el enlace o venga de su propio progreso entra igual.
              Volver a enseñarla es poner PORTADA_ESTRATEGICO en true.
            */}
            {PORTADA_ESTRATEGICO && (
              <Entrada orden={4} modo="crece" estira>
              <SubjectCard
                icon={<EstrategiaIcon />}
                title="Pensamiento Estratégico"
                label="Card Pensamiento Estratégico"
                accent={FAE.teal}
                hoverBg="rgba(42,157,143,0.14)"
                hoverBorder="rgba(42,157,143,0.75)"
                onClick={() => onSelectSubject("pensamiento-estrategico")}
              />
              </Entrada>
            )}
            <Entrada orden={3} modo="crece" estira>
            <SubjectCard
              icon={<ContabilidadIcon />}
              title="Contabilidad"
              label="Card Contabilidad"
              accent={FAE.ambar}
              hoverBg="rgba(233,196,106,0.12)"
              hoverBorder="rgba(233,196,106,0.7)"
              onClick={() => onSelectSubject("contabilidad")}
            />
            </Entrada>
          </div>
        </div>

        <Entrada orden={5} modo="pie" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12.5px", color: "#A8B6C8", whiteSpace: "nowrap" }}>
            Entrar no pide registro.
          </span>
          <Footer />
        </Entrada>
      </div>
    </div>
  );
}
