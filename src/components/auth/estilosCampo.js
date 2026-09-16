import { FAE } from "../../theme.js";

/*
 * Los estilos de formulario del sitio: los del paso de apodo del primer
 * ingreso. Los usan ese paso y el panel de Editar perfil, que tiene que verse
 * exactamente igual. Viven aquí, sin React ni sesión, para que ninguno de los
 * dos arrastre al otro.
 */

export const ETIQUETA = { display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(248,249,250,0.8)", margin: "0 0 6px" };

export const CAMPO = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 16px",
  borderRadius: "14px",
  fontFamily: "Inter, sans-serif",
  fontSize: "15px",
  color: FAE.text,
  background: "rgba(248,249,250,0.05)",
  border: "1px solid rgba(248,249,250,0.18)",
  outline: "none",
};

export const AYUDA = { fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.45)", margin: "6px 2px 18px" };
