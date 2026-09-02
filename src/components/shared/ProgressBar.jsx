import { COLORS } from "../../theme.js";

export default function ProgressBar({ value }) {
  return (
    <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.08)" }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: `linear-gradient(to right, ${COLORS.blue}, ${COLORS.orange})`,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}
