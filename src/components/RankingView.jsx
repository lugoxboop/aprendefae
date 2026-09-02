import { Sparkles, TrendingUp, ArrowLeftRight } from "lucide-react";
import { COLORS } from "../theme.js";
import TopBar from "./shared/TopBar.jsx";
import RankingFP from "./ranking/RankingFP.jsx";

/*
 * Ranking dentro de DA-Learn.
 *
 * Antes mostraba una tabla contra compañeros inventados y con puntos propios
 * del simulador. Ahora usa el mismo RankingFP que el índice de materia y el
 * perfil: los datos salen de la función ranking_fp sobre fp_history, así que
 * hay una sola noción de posición en todo el sitio.
 *
 * Las insignias sí son locales y sí son reales: reflejan lo que el estudiante
 * completó en esta sesión, no una comparación inventada con nadie.
 */

const BADGES = {
  "maestro-consumo": { label: "Maestro del Consumo", icon: Sparkles, color: COLORS.blue },
  "inversor-audaz": { label: "Inversor Audaz", icon: TrendingUp, color: COLORS.orange },
  "domador-dolar": { label: "Domador del Dólar", icon: ArrowLeftRight, color: COLORS.gold },
};

export default function RankingView({ materiaId, badges, onBack }) {
  return (
    <div>
      <TopBar title="Ranking" onBack={onBack} />

      <RankingFP
        subjectId={materiaId}
        titulo="Ranking de Macroeconomía"
        nota="Solo esta materia"
      />

      {/* Estado honesto: mientras la actividad no esté clasificada, no da FP. */}
      <p className="text-xs leading-relaxed mt-3 mb-6" style={{ color: COLORS.textMuted }}>
        El simulador de Demanda Agregada todavía no otorga FP: está pendiente de clasificación.
        Los FP de esta materia salen, por ahora, de las actividades de Política Económica.
      </p>

      <h2 className="text-sm font-semibold mb-3 mt-2" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>Insignias</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(BADGES).map(([id, b]) => {
          const earned = badges.includes(id);
          const Icon = b.icon;
          return (
            <div key={id} className="flex flex-col items-center text-center p-3 rounded-xl" style={{ backgroundColor: COLORS.bgPanel, opacity: earned ? 1 : 0.35 }}>
              <Icon size={22} color={earned ? b.color : COLORS.textMuted} />
              <span className="text-xs mt-2" style={{ color: COLORS.textLight }}>{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
