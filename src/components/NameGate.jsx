import { useState } from "react";
import { TrendingUp, ChevronLeft } from "lucide-react";
import { COLORS } from "../theme.js";
import Logo from "./Logo.jsx";

export default function NameGate({ onStart, onBack }) {
  const [val, setVal] = useState("");
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Logo (salir al inicio) y volver (subir un nivel) conviven, separados por un divisor. */}
      <div className="absolute top-6 left-4 flex items-center gap-2">
        <Logo variant="symbol" size={24} theme="dark" />
        {onBack && (
          <>
            <span
              aria-hidden="true"
              style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.14)", margin: "0 6px" }}
            />
            <button
              onClick={onBack}
              aria-label="Volver a los temas de Macroeconomía"
              className="p-2 rounded-full"
              style={{ backgroundColor: COLORS.bgPanel }}
            >
              <ChevronLeft size={20} color={COLORS.textLight} />
            </button>
          </>
        )}
      </div>
      <div className="mb-6 p-4 rounded-full" style={{ backgroundColor: COLORS.bgPanel }}>
        <TrendingUp size={32} color={COLORS.orange} />
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>DA-Learn</h1>
      <p className="text-sm mb-8 max-w-xs" style={{ color: COLORS.textMuted }}>
        Simula los 4 canales de la Demanda Agregada como si fueras el DJ de la economía colombiana.
      </p>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && val.trim() && onStart(val.trim())}
        placeholder="¿Cómo te llamas?"
        className="w-full max-w-xs px-4 py-3 rounded-xl text-sm mb-4 text-center"
        style={{ backgroundColor: COLORS.bgPanel, color: COLORS.textLight, border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
      />
      <button
        onClick={() => val.trim() && onStart(val.trim())}
        disabled={!val.trim()}
        className="w-full max-w-xs py-3 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: val.trim() ? COLORS.orange : COLORS.bgPanel, color: val.trim() ? COLORS.bg : COLORS.textMuted }}
      >
        Comenzar
      </button>
    </div>
  );
}
