/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA NOTA DEBAJO DE LA CITA (Célula B) — capa 1 de CuatroCapas.
 *
 * CuatroCapas pinta un solo bloque bajo cada término (`delLibro`, con su
 * rótulo) y es compartido: no se toca. Cuando un término trae además
 * `notaDebajo` ({ rotulo, texto }), este archivo la pone DENTRO de ese mismo
 * bloque, debajo de la cita, separada por una raya y con su rótulo propio
 * escrito como el de CuatroCapas. Así la cita se lee primero y la nota
 * después (guía v1 de Mai, §3).
 *
 * Los textos llegan de los datos; aquí no se escribe ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El rótulo, igual al de «Así lo dice el libro» en CuatroCapas. */
const ROTULO = {
  display: "block", margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px",
  fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,249,250,0.5)",
};

/*
 * Va dentro del <p> de la cita que pinta CuatroCapas: por eso son <span> en
 * bloque y no <p>.
 */
export function CitaConNota({ cita, nota }) {
  return (
    <>
      <span data-cita>{cita}</span>
      <span data-nota-debajo style={{
        display: "block", margin: "9px 0 0", paddingTop: "8px", borderTop: "1px solid rgba(248,249,250,0.12)",
      }}>
        <span data-rotulo-nota style={ROTULO}>{nota.rotulo}</span>
        {nota.texto}
      </span>
    </>
  );
}

/* La misma pieza, con la nota de cada término que la traiga pintada bajo su cita. */
export function conNotasDebajo(pieza) {
  return {
    ...pieza,
    nombres: pieza.nombres.map((n) => (n.notaDebajo && n.delLibro
      ? { ...n, delLibro: <CitaConNota cita={n.delLibro} nota={n.notaDebajo} /> }
      : n)),
  };
}
