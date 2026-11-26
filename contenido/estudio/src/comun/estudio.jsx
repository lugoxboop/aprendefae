/* Piezas comunes de los Reels de estudio para usuarios («¿qué prefieres para estudiar?»).
 * Formato duelo: A (Toby, coral) contra B (su amiga, azul), pausa que reta, dato y cierre. */
import { AbsoluteFill } from "remotion";
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "./base.jsx";
import { clamp01, rebote, sale, pulso } from "./tiempo.js";
import { CORAL, VERDE } from "./marca.jsx";

/* el cuarto de estudio partido en dos: A a la izquierda, B a la derecha */
export function Cuarto2({ t, luzA = 1, luzB = 1, noche = 0, letras = true, children }) {
  const pared = (x, color, luz) => (
    <div style={{ position: "absolute", left: x, top: 0, width: 540, height: 1920, background: color, filter: `brightness(${0.55 + 0.45 * luz})` }} />
  );
  return (
    <AbsoluteFill>
      {pared(0, noche ? "#2B3560" : "#F6D8C8", luzA)}
      {pared(540, "#D3DDF5", luzB)}
      {/* letreros A y B */}
      {letras && [["A", CORAL, 270, luzA], ["B", AZUL, 810, luzB]].map(([l, c, x, luz]) => (
        <div key={l} style={{ position: "absolute", left: x - 60, top: 270, width: 120, height: 120, borderRadius: "50%", background: c, border: `8px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 76, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 + 0.6 * luz, boxShadow: "0 10px 0 rgba(0,0,0,.2)" }}>{l}</div>
      ))}
      <div style={{ position: "absolute", left: 532, top: 0, width: 16, height: 1920, background: TINTA }} />
      {children}
      {/* escritorios */}
      <div style={{ position: "absolute", left: -20, right: -20, top: 1180, height: 34, background: "#B07A4F", borderRadius: 10, boxShadow: "0 6px 0 #6E4628" }} />
      <div style={{ position: "absolute", left: -20, right: -20, top: 1214, bottom: 0, background: "linear-gradient(#7A4E31, #5C3A24)" }} />
    </AbsoluteFill>
  );
}

/* cuaderno abierto sobre la mesa: renglones que se pintan de amarillo (subrayado) o se cierra */
export function Cuaderno({ x, y, w = 360, amarillo = 0, cierra = 0, t = 0 }) {
  const h = w * 0.62;
  const renglones = 7;
  const c = clamp01(cierra);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, perspective: 900 }}>
      {/* hoja izquierda */}
      <div style={{ position: "absolute", left: 0, top: 0, width: w / 2, height: h, background: "#FFFFFF", border: `6px solid ${TINTA}`, borderRadius: "12px 0 0 12px", overflow: "hidden" }}>
        {Array.from({ length: renglones }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 14, top: 18 + i * (h - 30) / renglones, height: 12, width: w / 2 - 34 - ((i * 17) % 30), background: "#C9C4B8", borderRadius: 6, boxShadow: amarillo * renglones * 2 > i ? `0 0 0 8px rgba(255,214,0,${Math.min(0.85, (amarillo * renglones * 2 - i) * 0.85)})` : "none" }} />
        ))}
      </div>
      {/* hoja derecha (es la que gira al cerrar) */}
      <div style={{ position: "absolute", left: w / 2, top: 0, width: w / 2, height: h, transformOrigin: "0 50%", transform: `rotateY(${-180 * sale(c)}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", border: `6px solid ${TINTA}`, borderRadius: "0 12px 12px 0", overflow: "hidden", backfaceVisibility: "hidden" }}>
          {Array.from({ length: renglones }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 14, top: 18 + i * (h - 30) / renglones, height: 12, width: w / 2 - 34 - ((i * 23) % 30), background: "#C9C4B8", borderRadius: 6, boxShadow: amarillo * renglones * 2 > i + renglones ? `0 0 0 8px rgba(255,214,0,${Math.min(0.85, (amarillo * renglones * 2 - i - renglones) * 0.85)})` : "none" }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: AZUL, border: `6px solid ${TINTA}`, borderRadius: "12px 0 0 12px", transform: "rotateY(180deg)", backfaceVisibility: "hidden" }} />
      </div>
    </div>
  );
}

/* resaltador amarillo que va y viene */
export function Resaltador({ x, y, t, activo = 1 }) {
  const dx = activo ? 60 * Math.sin(t * 9) : 0;
  return (
    <div style={{ position: "absolute", left: x + dx - 20, top: y - 130, width: 40, height: 150, transform: "rotate(28deg)", transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 40, height: 110, background: MANGO, border: `6px solid ${TINTA}`, borderRadius: "10px 10px 4px 4px" }} />
      <div style={{ position: "absolute", left: 6, top: 104, width: 28, height: 40, background: "#FFE14D", border: `6px solid ${TINTA}`, clipPath: "polygon(0 0, 100% 0, 70% 100%, 30% 100%)" }} />
    </div>
  );
}

/* globo de pensamiento redondo con contenido */
export function Piensa({ x, y, w = 300, h = 220, p, children, cola = 1 }) {
  if (p <= 0) return null;
  const e = rebote(clamp01(p));
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${e})`, transformOrigin: `${cola > 0 ? "30%" : "70%"} 110%`, opacity: Math.min(1, p * 3) }}>
      <div style={{ position: "absolute", inset: 0, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: "50%", boxShadow: "0 10px 0 rgba(0,0,0,.18)" }} />
      {[[0.28, 1.08, 40], [0.2, 1.26, 24]].map(([fx, fy, d], i) => (
        <div key={i} style={{ position: "absolute", left: (cola > 0 ? fx : 1 - fx) * w - d / 2, top: fy * h - d / 2, width: d, height: d, borderRadius: "50%", background: CREMA, border: `6px solid ${TINTA}` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/* medidor de lo que se recuerda (sin cifras inventadas: solo comparación) */
export function Medidor({ x, y, alto = 520, llena, color, letra, etiqueta, t }) {
  const v = clamp01(llena);
  return (
    <div style={{ position: "absolute", left: x - 90, top: y - alto, width: 180, height: alto }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 180, height: alto, background: "#FFFFFF", border: `8px solid ${TINTA}`, borderRadius: 40, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: color }}>
          <div style={{ position: "absolute", left: -20, right: -20, top: -14, height: 28, borderRadius: "50%", background: color, transform: `translateY(${4 * Math.sin(t * 6)}px)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 50, top: -100, width: 80, height: 80, borderRadius: "50%", background: color, border: `6px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>{letra}</div>
      <div style={{ position: "absolute", left: -60, width: 300, top: alto + 14, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: TINTA }}>{etiqueta}</div>
    </div>
  );
}

export const TOBY = "perro-mochila", AMIGA = "gato-gafas";
export { Mascota, Sombra, CORAL, VERDE, pulso };
