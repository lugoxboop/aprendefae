/*
 * Pie mínimo: qué es esto y la política de privacidad.
 *
 * ═══════════ POR QUÉ «QUÉ ES» VA AQUÍ Y NO EN LA PORTADA ═══════════
 *
 * Quien llega por el enlace que pasó el profesor no sabe si esto es un curso,
 * un blog o un juego, y lo decide en los primeros segundos. Pero un manifiesto
 * en la portada estorbaría a quien ya sabe a qué viene, que es casi todo el
 * mundo. En el pie no molesta a nadie y está donde se mira cuando se duda.
 *
 * ═══════════ LOS DOS SON ENLACES DISTINTOS A PROPÓSITO ═══════════
 *
 * «Política de privacidad» es un <a> real a /privacidad, un documento estático
 * que vive fuera de la aplicación. «Qué es aprendeFAE» es una vista del sitio,
 * así que navega por el hash como cualquier otra y hereda la entrada animada y
 * la vuelta atrás del navegador. Mezclar los dos mecanismos en un mismo pie es
 * feo por dentro y no se nota por fuera, que es el orden correcto.
 *
 * Los dos llevan 44 px de alto: medían 20 y eran la línea más difícil de
 * acertar con el pulgar de todo el sitio.
 */

const enlace = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
  padding: "0 2px",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  color: "#A8B6C8",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const subrayado = {
  borderBottom: "1px solid rgba(248,249,250,0.14)",
  paddingBottom: "1px",
};

export default function Footer({ onQueEs, sinQueEs = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: "14px" }}>
      {!sinQueEs && (
        <>
          <button type="button" onClick={onQueEs} style={enlace} data-que-es>
            <span style={subrayado}>Qué es aprendeFAE</span>
          </button>
          <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.28)", fontSize: "12px" }}>·</span>
        </>
      )}
      <a href="/privacidad" style={enlace}>
        <span style={subrayado}>Política de privacidad</span>
      </a>
    </div>
  );
}
