import { ShoppingBag, TrendingUp, Landmark, ArrowLeftRight, Sparkles, ChevronRight, Lock } from "lucide-react";
import { COLORS } from "../theme.js";
import ProgressBar from "./shared/ProgressBar.jsx";
import ChannelCard from "./shared/ChannelCard.jsx";
import TopBar from "./shared/TopBar.jsx";

/*
 * Chip numérico de etapa. Misma gramática que usa el ranking real para marcar
 * la posición: número en Sora sobre un cuadrado con acento de marca. Sustituye
 * al trofeo que había aquí, que era justo la iconografía que el sitio evita.
 */
function EtapaChip({ n, accent }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "9px",
        fontFamily: "Sora, sans-serif",
        fontSize: "13px",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: accent,
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${accent}`,
      }}
    >
      {n}
    </span>
  );
}

export default function Dashboard({ studentName, completed, correctCount, totalPreguntas, badges, allFourDone, finalDone, progress, onOpenTopic, onOpenFinal, onRanking, onExitTopic }) {
  return (
    <div>
      <TopBar title={`Hola, ${studentName}`} onBack={onExitTopic} onRanking={onRanking} />
      <p className="text-sm mb-4 leading-relaxed" style={{ color: COLORS.textMuted }}>
        La Demanda Agregada es la suma de 4 "canales" de gasto en la economía — como armar una canción mezclando 4 pistas de audio.
      </p>

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: COLORS.textMuted }}>Progreso</span>
        <span className="text-xs font-semibold" style={{ color: COLORS.textLight }}>{progress}%</span>
      </div>
      <ProgressBar value={progress} />
      {/* Aciertos, no puntos: DA-Learn ya no lleva un puntaje propio. */}
      <div className="flex items-center gap-2 mt-3 mb-6">
        <Sparkles size={14} color={COLORS.teal} />
        <span className="text-xs font-semibold" style={{ color: COLORS.textLight }}>
          {correctCount} de {totalPreguntas} respuestas
        </span>
        {badges.length > 0 && (
          <span className="text-xs" style={{ color: COLORS.textMuted }}>· {badges.length} insignia{badges.length > 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <ChannelCard icon={ShoppingBag} title="Consumo" subtitle="Lo que gastas" accent={COLORS.blue} completed={completed.consumo} onClick={() => onOpenTopic("consumo")} delay={0} />
        <ChannelCard icon={TrendingUp} title="Inversión" subtitle="Créditos y confianza" accent={COLORS.orange} completed={completed.inversion} onClick={() => onOpenTopic("inversion")} delay={80} />
        <ChannelCard icon={Landmark} title="Gasto Público" subtitle="Lo que gasta el Estado" accent={COLORS.teal} completed={completed.gasto} onClick={() => onOpenTopic("gasto")} delay={160} />
        <ChannelCard icon={ArrowLeftRight} title="Exp. Netas" subtitle="Lo que compramos y vendemos afuera" accent={COLORS.gold} completed={completed.xn} onClick={() => onOpenTopic("xn")} delay={240} />
      </div>

      {allFourDone ? (
        <button
          onClick={onOpenFinal}
          className="w-full p-4 rounded-2xl flex items-center justify-between mb-6"
          style={{ backgroundColor: "rgba(255,200,87,0.1)", border: `1px solid ${COLORS.gold}` }}
        >
          <div className="flex items-center gap-3">
            {/* Quinta y última etapa del recorrido. */}
            <EtapaChip n={5} accent={COLORS.gold} />
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>Ronda Final</div>
              <div className="text-xs" style={{ color: COLORS.textMuted }}>{finalDone ? "Completada" : "Desbloqueada"}</div>
            </div>
          </div>
          <ChevronRight size={18} color={COLORS.gold} />
        </button>
      ) : (
        <div className="w-full p-4 rounded-2xl flex items-center gap-3 mb-6" style={{ backgroundColor: COLORS.bgPanel, opacity: 0.7 }}>
          <Lock size={18} color={COLORS.textMuted} />
          <span className="text-xs" style={{ color: COLORS.textMuted }}>Completa los 4 canales para desbloquear la Ronda Final</span>
        </div>
      )}

      {/*
        Antes había aquí un top 5 con compañeros inventados. Se eliminó: el
        ranking real vive en su propia pantalla y sale de la tabla de FP.
      */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>Ranking</h2>
        <button onClick={onRanking} className="text-xs font-semibold" style={{ color: COLORS.orange }}>Ver todo</button>
      </div>
      <div className="rounded-2xl p-3 mb-4" style={{ backgroundColor: COLORS.bgPanel }}>
        <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>
          El ranking de Macroeconomía se arma con los FP de la materia. Este simulador todavía
          no otorga FP, así que lo que hagas aquí no cambia tu posición.
        </p>
      </div>
    </div>
  );
}
