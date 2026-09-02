import { COLORS } from "../theme.js";
import { QUIZZES } from "../data/quizzes.js";
import TopBar from "./shared/TopBar.jsx";
import FinalQuizBlock from "./shared/FinalQuizBlock.jsx";

export default function FinalView({ completed, onCorrectQ1, onCorrectQ2, onBack, onRanking }) {
  const bothDone = completed.finalQ1 && completed.finalQ2;
  return (
    <div>
      <TopBar title="Ronda Final" onBack={onBack} onRanking={onRanking} />
      <p className="text-sm mb-5" style={{ color: COLORS.textMuted }}>Mezclaste los 4 canales. Ahora conecta las ideas.</p>
      <FinalQuizBlock question={QUIZZES.finalQ1.question} options={QUIZZES.finalQ1.options} accent={COLORS.gold} completed={completed.finalQ1} onCorrect={onCorrectQ1} />
      <FinalQuizBlock question={QUIZZES.finalQ2.question} options={QUIZZES.finalQ2.options} accent={COLORS.gold} completed={completed.finalQ2} onCorrect={onCorrectQ2} />
      {/* Cierre sin trofeo: el texto ya dice lo que hay que decir. */}
      {bothDone && (
        <div className="mt-6 p-4 rounded-2xl text-center" style={{ backgroundColor: "rgba(255,200,87,0.1)", border: `1px solid ${COLORS.gold}` }}>
          <p className="text-sm font-semibold" style={{ color: COLORS.gold }}>¡Completaste DA-Learn!</p>
        </div>
      )}
      <div className="flex gap-3 mt-6 mb-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: COLORS.bgPanel, color: COLORS.textLight }}>Volver</button>
        <button onClick={onRanking} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: COLORS.gold, color: COLORS.bg }}>Ver ranking</button>
      </div>
    </div>
  );
}
