import { useState, useRef } from "react";
import { Check, X } from "lucide-react";
import { COLORS } from "../../theme.js";

/*
 * Quiz secuencial de los 4 canales (5 preguntas cada uno).
 *
 * No anuncia puntos por pregunta: los FP se otorgan al completar la actividad
 * entera y los calcula el motor central, no esta pieza de interfaz.
 */
export default function QuizBlock({ questions, accent, progress, onAnswerCorrect }) {
  const total = questions.length;
  const firstIncomplete = progress.findIndex((v) => !v);
  const startIndex = firstIncomplete === -1 ? total - 1 : firstIncomplete;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [selectedId, setSelectedId] = useState(() =>
    progress[startIndex] ? questions[startIndex].options.find((o) => o.correct).id : null
  );
  const scoredRef = useRef(progress[startIndex]);

  const currentQuestion = questions[currentIndex];
  const isLocked = progress[currentIndex];
  const selected = currentQuestion.options.find((o) => o.id === selectedId) || null;
  const isCorrect = !!selected?.correct;

  const handleSelect = (id) => {
    if (isLocked) return;
    setSelectedId(id);
    const opt = currentQuestion.options.find((o) => o.id === id);
    if (opt.correct && !scoredRef.current) {
      scoredRef.current = true;
      onAnswerCorrect(currentIndex);
    }
  };

  const goNext = () => {
    const nextIndex = Math.min(currentIndex + 1, total - 1);
    setCurrentIndex(nextIndex);
    setSelectedId(progress[nextIndex] ? questions[nextIndex].options.find((o) => o.correct).id : null);
    scoredRef.current = progress[nextIndex];
  };

  return (
    <div className="rounded-2xl p-4 mt-6" style={{ backgroundColor: COLORS.bgPanel, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>
          Pregunta {currentIndex + 1} de {total}
        </span>
      </div>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: COLORS.textLight }}>{currentQuestion.question}</p>
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let bg = "rgba(255,255,255,0.04)";
          let borderColor = "rgba(255,255,255,0.1)";
          if (selectedId) {
            if (opt.correct) { bg = "rgba(47,191,113,0.12)"; borderColor = COLORS.green; }
            else if (isSelected) { bg = "rgba(255,107,107,0.12)"; borderColor = COLORS.red; }
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="text-left text-sm p-3 rounded-xl flex items-start gap-2"
              style={{ backgroundColor: bg, border: `1px solid ${borderColor}`, color: COLORS.textLight, cursor: isLocked ? "default" : "pointer" }}
            >
              <span className="font-semibold">{opt.id.toUpperCase()})</span>
              <span>{opt.label}</span>
              {selectedId && opt.correct && <Check size={16} color={COLORS.green} className="ml-auto shrink-0" />}
              {isSelected && !opt.correct && <X size={16} color={COLORS.red} className="ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
      {selectedId && (
        <div
          key={`${currentIndex}-${selectedId}`}
          className="mt-3 p-3 rounded-xl text-sm"
          style={{
            backgroundColor: isCorrect ? "rgba(47,191,113,0.1)" : "rgba(255,107,107,0.1)",
            color: COLORS.textLight,
            animation: isCorrect ? "popIn 0.4s ease" : "fadeUp 0.3s ease",
          }}
        >
          {isCorrect ? (
            <div>
              <p className={currentIndex < total - 1 ? "mb-2" : ""}>¡Correcto!</p>
              {currentIndex < total - 1 && (
                <button
                  onClick={goNext}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: accent, color: COLORS.bg }}
                >
                  Siguiente pregunta
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2">{selected.feedback || "Casi. Repasa la idea clave del tema e inténtalo de nuevo."}</p>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: accent, color: COLORS.bg }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
