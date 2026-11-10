/*
 * Respaldo "AprendeFAE es de planck". La única aparición de la empresa que ve
 * el estudiante: va al pie de la entrada, del panel docente y de los correos.
 * Siempre el logo en imagen, nunca la palabra escrita en el texto corrido, para
 * que se vea igual en todos los productos de Planck.
 *
 * Los SVG viven en public/planck/ (copiados del sistema Planck; no se redibujan).
 * El tema lo decide quien lo monta: "dark" en el sitio (que es oscuro), "light"
 * en correos y propuestas. 16 px de alto es el mínimo del logo.
 */
import { PLANCK_CLARO, PLANCK_OSCURO } from "../theme.planck.js";

/* `href`: el sitio de Planck cuando exista un dominio registrado; hasta entonces no se enlaza. */
export default function RespaldoPlanck({ producto = "AprendeFAE", theme = "dark", href, style }) {
  const paleta = theme === "dark" ? PLANCK_OSCURO : PLANCK_CLARO;
  const logo = theme === "dark" ? "/planck/planck-logo-oscuro.svg" : "/planck/planck-logo-claro.svg";
  return (
    <p
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        margin: 0,
        color: paleta["ink-2"],
        fontFamily: "Geist, Inter, system-ui, sans-serif",
        fontSize: 13,
        lineHeight: "18px",
        ...style,
      }}
    >
      <span>{producto} es de</span>
      {href ? (
        <a href={href} aria-label="Planck" style={{ display: "inline-flex", lineHeight: 0 }}>
          <img src={logo} alt="planck" height={16} style={{ height: 16, width: "auto", display: "block" }} />
        </a>
      ) : (
        <img src={logo} alt="planck" height={16} style={{ height: 16, width: "auto", display: "block" }} />
      )}
    </p>
  );
}
