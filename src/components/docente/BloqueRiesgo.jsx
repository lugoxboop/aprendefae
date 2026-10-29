import { FilaRiesgo } from "./ListaRiesgo.jsx";
import { enlaceV1, notaV1, tarjetaV1, tituloBloque } from "./estiloV1.js";

/*
 * La columna derecha de la primera pantalla: a quién mirar hoy, con el
 * diagnóstico por su nombre y el botón puesto, sin salir del resumen.
 *
 * ENSEÑA TRES Y DICE CUÁNTOS SON. Un resumen que recorta en silencio hace creer
 * que eso es todo; el pie siempre dice el total y lleva a la lista entera.
 * Las filas son literalmente las mismas de la lista completa —el componente se
 * comparte— para que no haya dos maquetas del mismo dato.
 */

export const CUANTAS = 3;

export default function BloqueRiesgo({ riesgo = [], total = 0, onAbrir, onSilenciar, onVerTodos, className, style }) {
  const visibles = riesgo.slice(0, CUANTAS);

  return (
    <section className={className} style={{ ...tarjetaV1, ...style }} data-bloque="riesgo">
      <h2 style={tituloBloque}>A quién mirar hoy</h2>

      {riesgo.length === 0 ? (
        <p style={notaV1}>Nadie dispara ninguna señal ahora mismo. Es una buena noticia, no un dato que falte.</p>
      ) : (
        <>
          <p style={notaV1}>
            {riesgo.length} de {total} {total === 1 ? "estudiante" : "estudiantes"}, por urgencia y no por nombre.
          </p>
          <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0 }} data-resumen-riesgo={visibles.length}>
            {visibles.map((f) => (
              <FilaRiesgo key={f.estudiante.user_id} fila={f} silenciado={false} onAbrir={onAbrir} onSilenciar={onSilenciar} />
            ))}
          </ul>
        </>
      )}

      <button type="button" className="pd1-foco" style={enlaceV1} onClick={onVerTodos} data-ver-riesgo>
        {riesgo.length > CUANTAS ? `Ver ${riesgo.length - CUANTAS} más y ajustar los avisos` : "Ajustar cuándo quiero que me avise"}
      </button>
    </section>
  );
}
