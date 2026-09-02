import { COLORS } from "../../theme.js";

export default function BigNumberDisplay({ label, value, accent, sub }) {
  return (
    <div className="text-center py-4">
      <div className="text-sm" style={{ color: COLORS.textMuted }}>{label}</div>
      <div
        className="text-4xl font-bold my-1"
        style={{ color: accent, fontFamily: "Sora, sans-serif", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: COLORS.textMuted }}>{sub}</div>}
    </div>
  );
}
