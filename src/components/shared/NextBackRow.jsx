import { COLORS } from "../../theme.js";

export default function NextBackRow({ onBack, onNext, accent }) {
  return (
    <div className="flex gap-3 mt-5 mb-8">
      <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: COLORS.bgPanel, color: COLORS.textLight }}>
        Volver
      </button>
      <button onClick={onNext} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: accent, color: COLORS.bg }}>
        Siguiente tema
      </button>
    </div>
  );
}
