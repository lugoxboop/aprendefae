import { COLORS } from "../../theme.js";

/* Formula reference card — shown on each topic page, right after the intro line and before the chart */
export default function FormulaCard({ accent, formula, note, legend }) {
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: COLORS.bgPanel, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-center py-2">
        <div className="text-3xl font-bold" style={{ color: accent, fontFamily: "Sora, sans-serif", letterSpacing: "0.5px" }}>
          {formula}
        </div>
        {note && <div className="text-xs mt-2" style={{ color: COLORS.textMuted }}>{note}</div>}
      </div>
      <div className="flex flex-col gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {legend.map((item, idx) => (
          <div key={idx} className="flex items-baseline gap-2 text-xs">
            <span style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif", minWidth: "34px" }}>{item.symbol}</span>
            <span style={{ color: COLORS.textMuted }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
