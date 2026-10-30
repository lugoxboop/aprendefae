import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import { EstiloEntrada, entrada } from "./shared/Entrada.jsx";
import Footer from "./shared/Footer.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ ES APRENDEFAE
 *
 * POR QUÉ EXISTE ESTA PÁGINA
 *
 * La portada dice una frase sobre estudiar y ofrece dos materias. Quien llega
 * por el enlace que pasó el profesor no sabe si esto es un curso, un blog o un
 * juego, y lo decide en los primeros segundos. Pero poner un manifiesto en la
 * portada estorbaría a quien ya sabe a qué viene —que es casi todo el mundo—,
 * así que el enlace va en el pie, al lado de «Entrar no pide registro», y la
 * explicación vive aquí.
 *
 * CÓMO ESTÁ ESCRITA
 *
 * En primera persona del plural y sin una sola palabra de folleto. Lo que dice
 * es lo que Mateo diría en voz alta: somos estudiantes, creemos que la forma
 * normal de estudiar se quedó vieja, y esto es lo que hicimos al respecto.
 * Nada de «revolucionar la educación», ninguna cifra que no podamos sostener,
 * y ni una promesa sobre notas: el segundo parcial dejó claro que la
 * plataforma ayuda a quien la usa, no a quien no entra, y escribir otra cosa
 * aquí sería mentir en nuestra propia página.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const parrafo = {
  margin: "0 0 18px",
  fontSize: "16px",
  lineHeight: 1.7,
  color: "rgba(248,249,250,0.82)",
};

const destacado = { color: FAE.text, fontWeight: 600 };

export default function QueEsView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: FAE.bg, color: FAE.text, fontFamily: "Inter, sans-serif" }}>
      <EstiloEntrada />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "14px clamp(20px, 5vw, 28px) 72px" }}>
        <div {...entrada(0, "baja")} style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", padding: 0, borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
        </div>

        <h1 {...entrada(1, "sube")} style={{ ...entrada(1, "sube").style, fontFamily: "Sora, sans-serif", fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 10px" }}>
          Qué es aprendeFAE
        </h1>
        <p {...entrada(2, "sube")} style={{ ...entrada(2, "sube").style, margin: "0 0 32px", fontSize: "17px", lineHeight: 1.6, color: FAE.node }}>
          Un sitio para estudiar las materias de la facultad jugando con ellas, en vez de releer apuntes.
        </p>

        <div {...entrada(3, "sube")} style={entrada(3, "sube").style}>
          <p style={parrafo}>
            Lo hacemos <span style={destacado}>estudiantes, para estudiantes</span>. No somos una editorial ni una
            empresa de software educativo: somos gente que está cursando lo mismo que tú y que se cansó de llegar
            al parcial habiendo leído tres veces el capítulo sin saber si lo entendía.
          </p>
          <p style={parrafo}>
            Partimos de algo que nos parece evidente: <span style={destacado}>la forma normal de estudiar se quedó
            vieja</span>. Leer, subrayar y repasar la noche anterior es casi todo lo que nos enseñaron a hacer, y es
            justo lo que peor funciona. Se siente productivo mientras lo haces y se evapora en tres días. Nadie
            aprende a montar en bicicleta leyendo sobre bicicletas.
          </p>
          <p style={parrafo}>
            Así que aquí la materia no se lee: se usa. Cada tema trae actividades donde tienes que decidir, clasificar,
            cuadrar o equivocarte, que es cuando de verdad se aprende algo. Cuando fallas, el sitio te dice por qué
            —no solo que fallaste—, y esa es toda la diferencia entre practicar y adivinar.
          </p>
          <p style={parrafo}>
            Queremos reformar cómo se estudia en la facultad, y lo estamos haciendo por partes: una materia, un tema
            y una actividad a la vez, con lo que vamos aprendiendo de cómo las usan tus compañeros.
          </p>
          <p style={{ ...parrafo, marginBottom: 0 }}>
            Es gratis, no pide registro para mirar y no vende nada. Si entras con tu cuenta es para guardar tu
            progreso, y tu profesor ve cómo va el curso, no lo que haces minuto a minuto.
          </p>
        </div>

        <div {...entrada(5, "pie")} style={{ ...entrada(5, "pie").style, marginTop: "40px", paddingTop: "22px", borderTop: "1px solid rgba(248,249,250,0.12)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 20px",
              borderRadius: "999px", background: FAE.teal, border: "none", cursor: "pointer",
              /* Tinta oscura sobre el relleno teal: el teal nunca es color de letra. */
              color: "#06202A", fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
            }}
          >
            Empezar a estudiar
          </button>
          <Footer sinQueEs />
        </div>
      </div>
    </div>
  );
}
