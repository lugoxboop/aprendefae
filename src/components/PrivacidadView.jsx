import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";

/*
 * Política de privacidad. Es una página de referencia legal, no de marketing:
 * el texto es literal y el diseño se limita a hacerlo cómodo de leer
 * (medida corta, interlineado amplio, jerarquía clara de títulos).
 *
 * Vive como entrada estática aparte (privacidad/index.html) para que
 * /privacidad responda sin depender de reglas de reescritura del hosting.
 */

const SECTIONS = [
  {
    heading: "Qué información recopilamos",
    paragraphs: [
      "Cuando inicias sesión con tu cuenta de Google, recopilamos tu nombre y correo electrónico para identificar tu perfil. Además, guardamos la información de tu actividad dentro de la plataforma: tu progreso en los temas, tus puntos, tu racha diaria y tu posición en los rankings.",
      "En tu primer ingreso te pedimos dos datos: un apodo, que es el único que ven los demás estudiantes, y tu nombre real. El nombre real se usa exclusivamente para que el profesor autorizado de tu curso pueda identificar tu avance en su panel, tal como se explica más abajo.",
    ],
  },
  {
    heading: "Cómo usamos esta información",
    paragraphs: ["Usamos estos datos únicamente para:"],
    bullets: [
      "Guardar tu progreso y permitir que lo retomes desde cualquier dispositivo.",
      "Mostrar tu racha, tus puntos y tu posición en los rankings dentro de la plataforma.",
      "Generar reportes agregados (no individuales) sobre el uso general de la herramienta, que pueden compartirse con la facultad para evaluar su efectividad.",
      "Permitir que el profesor autorizado de tu curso vea tu avance identificado con tu nombre real, con fines de acompañamiento académico.",
    ],
  },
  {
    heading: "Qué mostramos públicamente",
    paragraphs: [
      "En los rankings visibles para otros estudiantes, por defecto se muestra tu nombre de usuario o apodo, no tu nombre completo real.",
    ],
  },
  {
    heading: "Con quién compartimos tu información",
    paragraphs: [
      "No vendemos tu información personal ni la compartimos con terceros ajenos a tu institución.",
      "La facultad, como institución, recibe únicamente reportes agregados sobre el uso de la herramienta (por ejemplo, número de estudiantes activos o temas más usados), nunca tu actividad individual identificada.",
      "La excepción es el profesor autorizado de tu propio curso, que sí puede ver tu avance identificado con tu nombre. Esto se explica en detalle en la siguiente sección.",
    ],
  },
  {
    heading: "Videos de YouTube dentro de la plataforma",
    paragraphs: [
      "Algunos temas incluyen videos alojados en YouTube que se reproducen dentro de AprendeFAE. Ese material no es nuestro: lo produce el canal que se indica junto a cada video, y lo señalamos siempre para que sepas cuándo estás viendo contenido externo.",
      "Usamos el reproductor de YouTube en modo de privacidad mejorada (dominio youtube-nocookie.com), que evita que Google escriba cookies publicitarias en tu navegador mientras no reproduzcas nada. El video tampoco se carga al abrir la página: solo cuando bajas hasta él.",
      "Cuando el video se carga y cuando le das play, Google recibe datos técnicos de tu conexión, como tu dirección IP, el tipo de dispositivo y el navegador que usas. Ese intercambio ocurre entre tu navegador y Google, y se rige por la política de privacidad de Google, no por esta. AprendeFAE no recibe ni guarda información sobre qué videos ves ni cuánto los ves.",
    ],
  },
  {
    heading: "Acceso del profesor de tu curso",
    paragraphs: [
      "El profesor de un curso puede acceder a un panel donde ve el avance de sus estudiantes identificado por nombre real. Este acceso existe para el acompañamiento académico: detectar a tiempo a quien se está quedando atrás y saber qué temas conviene reforzar en clase.",
      "Este acceso está limitado de las siguientes formas:",
    ],
    bullets: [
      "Solo los correos que el equipo de AprendeFAE autoriza expresamente y uno por uno tienen acceso al panel. No es posible solicitarlo ni activarlo desde la plataforma.",
      "Cada profesor autorizado solo puede ver las materias que tiene asignadas.",
      "El profesor ve tu nombre, tu apodo, tu progreso, tus puntos, tu porcentaje de aciertos y la fecha de tu última actividad. No ve tu correo electrónico ni ningún otro dato de tu cuenta de Google.",
      "El profesor no puede modificar tu progreso, tus puntos ni ningún dato de tu perfil: el acceso es solo de lectura.",
      "El profesor puede exportar un informe con esta misma información para su seguimiento del curso.",
    ],
  },
  {
    heading: "Cómo protegemos tu información",
    paragraphs: [
      "Tus datos se almacenan con controles de acceso a nivel de fila (row level security), lo que significa que ningún otro estudiante puede ver ni modificar tu información a través de la plataforma.",
    ],
  },
  {
    heading: "Cuánto tiempo guardamos tu información",
    paragraphs: [
      "Guardamos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación completa de tu cuenta y tus datos en cualquier momento escribiendo al correo de contacto indicado abajo.",
    ],
  },
  {
    heading: "Tus derechos",
    paragraphs: [
      "Puedes solicitar en cualquier momento: acceder a los datos que tenemos sobre ti, corregirlos si están equivocados, o eliminarlos por completo.",
    ],
  },
  {
    heading: "Contacto",
    contact: true,
  },
  {
    heading: "Cambios a esta política",
    paragraphs: [
      "Podemos actualizar esta política a medida que la plataforma crezca. Cualquier cambio importante se notificará dentro de la plataforma.",
    ],
  },
];

const bodyText = {
  fontSize: "16px",
  lineHeight: 1.75,
  color: "rgba(248,249,250,0.78)",
  margin: "0 0 14px",
};

export default function PrivacidadView() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 72px" }}>
        <div style={{ marginBottom: "40px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
        </div>

        <h1
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 34px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            margin: "0 0 10px",
          }}
        >
          Política de privacidad de aprendeFAE
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.5)", margin: "0 0 40px" }}>
          Última actualización: 3 de septiembre de 2026
        </p>

        {SECTIONS.map((section) => (
          <section key={section.heading} style={{ marginBottom: "34px" }}>
            <h2
              style={{
                fontFamily: "Sora, sans-serif",
                fontWeight: 600,
                fontSize: "19px",
                letterSpacing: "-0.015em",
                lineHeight: 1.3,
                color: FAE.text,
                margin: "0 0 12px",
              }}
            >
              {section.heading}
            </h2>

            {section.paragraphs?.map((text) => (
              <p key={text} style={bodyText}>
                {text}
              </p>
            ))}

            {section.bullets && (
              <ul style={{ margin: "0", paddingLeft: "22px" }}>
                {section.bullets.map((item) => (
                  <li key={item} style={{ ...bodyText, margin: "0 0 8px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.contact && (
              <p style={bodyText}>
                Para cualquier pregunta sobre esta política o sobre tus datos, escríbenos a{" "}
                <a href="mailto:aprendefae@gmail.com" style={{ color: FAE.coral, textDecoration: "underline" }}>
                  aprendefae@gmail.com
                </a>
                .
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
