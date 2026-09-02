import { Check } from "lucide-react";
import { COLORS } from "../../theme.js";

export default function ChannelCard({ icon: Icon, title, subtitle, accent, completed, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-start justify-between p-4 rounded-2xl text-left w-full"
      style={{
        backgroundColor: COLORS.bgPanel,
        border: `1px solid ${completed ? accent : "rgba(255,255,255,0.08)"}`,
        animation: "fadeUp 0.5s ease both",
        animationDelay: `${delay}ms`,
        minHeight: "132px",
      }}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: accent + "22" }}>
          <Icon size={22} color={accent} />
        </div>
        {completed && <Check size={18} color={COLORS.green} />}
      </div>
      <div>
        <div className="font-semibold text-base" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>{title}</div>
        <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{subtitle}</div>
      </div>
    </button>
  );
}
