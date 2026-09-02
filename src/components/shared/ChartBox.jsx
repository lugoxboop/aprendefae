import { COLORS } from "../../theme.js";

export default function ChartBox({ children }) {
  return (
    <div className="rounded-2xl p-3 mb-4" style={{ backgroundColor: COLORS.bgPanel }}>
      {children}
    </div>
  );
}
