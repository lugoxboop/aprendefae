/*
 * Pie mínimo: solo el enlace a la política de privacidad.
 * Es un <a> real, no navegación del SPA, porque /privacidad es un documento
 * estático aparte.
 */
export default function Footer() {
  return (
    <a
      href="/privacidad"
      style={{
        fontSize: "12px",
        color: "rgba(248,249,250,0.34)",
        textDecoration: "none",
        borderBottom: "1px solid rgba(248,249,250,0.14)",
        paddingBottom: "1px",
        whiteSpace: "nowrap",
      }}
    >
      Política de privacidad
    </a>
  );
}
