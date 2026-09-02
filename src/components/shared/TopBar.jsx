import { ChevronLeft } from "lucide-react";
import { COLORS } from "../../theme.js";
import Logo from "../Logo.jsx";

/*
 * Cabecera de las vistas de DA-Learn.
 * El logo y el botón de volver son dos acciones distintas que conviven: el logo
 * sale al inicio del sitio, el chevron sube un nivel dentro de la materia. Van
 * separados por un divisor para que no se lean como un solo control.
 */
export default function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Logo variant="symbol" size={24} theme="dark" />
        {onBack && (
          <>
            <span
              aria-hidden="true"
              style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.14)", margin: "0 6px" }}
            />
            <button onClick={onBack} className="p-2 rounded-full" style={{ backgroundColor: COLORS.bgPanel }}>
              <ChevronLeft size={20} color={COLORS.textLight} />
            </button>
          </>
        )}
        <h1 className="text-lg font-bold" style={{ color: COLORS.textLight, fontFamily: "Sora, sans-serif" }}>{title}</h1>
      </div>
    </div>
  );
}
