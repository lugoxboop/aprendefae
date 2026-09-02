import { COLORS } from "../../theme.js";

/*
 * Par de botones del pie de cada canal.
 *
 * "Siguiente tema" cambia de canal, y está a un palmo de "Siguiente pregunta",
 * que avanza dentro del quiz. Los dos empiezan igual y hacen cosas de distinto
 * tamaño: por eso, mientras queden preguntas por responder, este dice cuántas
 * faltan. Sigue habilitado —el sitio no bloquea el paso— pero ya no se puede
 * confundir con el otro.
 */
export default function NextBackRow({ onBack, onNext, accent, pendientes = 0 }) {
  return (
    <div className="flex gap-3 mt-5 mb-8">
      <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: COLORS.bgPanel, color: COLORS.textLight }}>
        Volver
      </button>
      <button
        onClick={onNext}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold leading-tight"
        style={{ backgroundColor: accent, color: COLORS.bg }}
      >
        Siguiente tema
        {pendientes > 0 && (
          <span className="block text-xs font-normal" style={{ opacity: 0.75 }}>
            {pendientes === 1 ? "queda 1 pregunta aquí" : `quedan ${pendientes} preguntas aquí`}
          </span>
        )}
      </button>
    </div>
  );
}
