/*
 * MACRO 2026 · el cierre de una Aprender (lote 4, kit de animación).
 * Al terminar la pieza se enciende una bombilla (escala y opacidad, 480 ms) y
 * una flecha curva señala «Siguiente pieza» (un empujón de 560 ms). Una sola
 * vez, solo transform y opacity, sin bloquear los botones; con movimiento
 * reducido aparecen sin moverse.
 */
import { Objeto } from "./kit.jsx";
import { Boton } from "./ui.jsx";

const CSS = `
.m26-cierre { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; }
.m26-cierre-luz { animation: m26-luz 480ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes m26-luz { from { transform: scale(.6); opacity: 0; } 60% { opacity: 1; } to { transform: none; opacity: 1; } }
.m26-cierre-sigue { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.m26-cierre-flecha { animation: m26-empuja 560ms cubic-bezier(.3,.9,.4,1) 200ms both 1; }
@keyframes m26-empuja { from { transform: translateX(-14px); opacity: 0; } 60% { transform: translateX(4px); opacity: 1; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .m26-cierre-luz, .m26-cierre-flecha { animation: m26-funde 120ms linear both 1; } }
@keyframes m26-funde { from { opacity: 0; } to { opacity: 1; } }
`;

export default function CierreAprender({ nombre, onRepetir, onSiguiente, textoSiguiente, hayFlecha = true, ...resto }) {
  return (
    <div className="da26-tarjeta" {...resto}>
      <style>{CSS}</style>
      <div className="m26-cierre">
        <Objeto id="bombilla" alto={64} className="m26-cierre-luz" data-cierre-luz />
        <p style={{ margin: 0, fontSize: 16 }}>Terminaste «{nombre}».</p>
      </div>
      <div className="da26-nav">
        <Boton onClick={onRepetir}>Repetir</Boton>
        <span className="m26-cierre-sigue">
          {hayFlecha && <Objeto id="flecha-curva" alto={36} className="m26-cierre-flecha" data-cierre-flecha />}
          <Boton primario onClick={onSiguiente} data-siguiente-pieza>{textoSiguiente}</Boton>
        </span>
      </div>
    </div>
  );
}
