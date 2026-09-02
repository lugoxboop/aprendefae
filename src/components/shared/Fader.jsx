import { COLORS } from "../../theme.js";

export default function Fader({ label, value, min, max, step, onChange, accent, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm" style={{ color: COLORS.textMuted }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: accent, fontFamily: "Sora, sans-serif" }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="da-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
          "--fill-color": accent,
        }}
      />
    </div>
  );
}
