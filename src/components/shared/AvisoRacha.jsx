import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import IconoRacha from "./IconoRacha.jsx";

/*
 * El momento de entrada del día: la racha subió y se dice.
 *
 * NO BLOQUEA NADA, y eso está resuelto en el CSS, no en la confianza: el velo
 * lleva pointerEvents "none", así que los clics lo atraviesan y se puede seguir
 * navegando con el aviso en pantalla. Solo la tarjeta recibe toques, y para
 * cerrarla antes de tiempo.
 *
 * Se va sola a los 3,6 segundos. Un aviso que exige una acción para seguir es
 * un peaje, y esto es una felicitación.
 *
 * NO REEMPLAZA EL PANEL DE PERFIL. Allí siguen la racha vigente, el récord y el
 * próximo hito, que es donde se consultan cuando uno quiere. Esto es el momento
 * de entrar, no el sitio donde se mira el detalle.
 *
 * CUÁNDO SALE lo decide la base en una sola llamada, que además deja marcado
 * que ya se vio. Ver racha_animacion() en la migración 0010: si leer y marcar
 * fueran dos pasos, dos pestañas abiertas podrían colarse entre medias y el
 * aviso saldría dos veces.
 */

const DURACION_MS = 3600;

const CSS = `
@keyframes fae-ar-entrar {
  from { opacity: 0; transform: translateY(14px) scale(.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes fae-ar-salir { to { opacity: 0; transform: translateY(-10px); } }
.fae-ar-tarjeta { animation: fae-ar-entrar 420ms cubic-bezier(.2,.9,.3,1) both; }
.fae-ar-yendose { animation: fae-ar-salir 380ms ease-in forwards; }

/* El número viejo sube y se va; el nuevo entra desde abajo ocupando su sitio. */
@keyframes fae-ar-viejo { 0%,25% { opacity: .55; transform: none; } 100% { opacity: 0; transform: translateY(-26px); } }
@keyframes fae-ar-nuevo { 0%,25% { opacity: 0; transform: translateY(26px); } 100% { opacity: 1; transform: none; } }
.fae-ar-viejo { animation: fae-ar-viejo 900ms cubic-bezier(.3,.8,.3,1) 260ms both; }
.fae-ar-nuevo { animation: fae-ar-nuevo 900ms cubic-bezier(.3,.8,.3,1) 260ms both; }

/* La llama crece una vez cuando el número termina de cambiar. */
@keyframes fae-ar-llama { 0%,45% { transform: scale(1); } 62% { transform: scale(1.22); } 100% { transform: scale(1); } }
.fae-ar-llama { animation: fae-ar-llama 1100ms cubic-bezier(.3,.9,.4,1) 260ms both; transform-origin: 50% 70%; }

@media (prefers-reduced-motion: reduce) {
  .fae-ar-tarjeta, .fae-ar-viejo, .fae-ar-nuevo, .fae-ar-llama, .fae-ar-yendose { animation: none !important; }
  .fae-ar-viejo { display: none; }
}
`;

export default function AvisoRacha() {
  const { session } = useAuth();
  const [datos, setDatos] = useState(null);   // {desde, hasta}
  const [yendose, setYendose] = useState(false);

  useEffect(() => {
    if (!supabase || !session) return;
    let vivo = true;

    (async () => {
      const { data, error } = await supabase.rpc("racha_animacion");
      if (error || !vivo) return;
      const f = data?.[0];
      if (f?.mostrar) setDatos({ desde: Number(f.desde ?? 0), hasta: Number(f.hasta ?? 0) });
    })();

    return () => { vivo = false; };
  }, [session]);

  useEffect(() => {
    if (!datos) return;
    const irse = setTimeout(() => setYendose(true), DURACION_MS);
    const quitar = setTimeout(() => setDatos(null), DURACION_MS + 380);
    return () => { clearTimeout(irse); clearTimeout(quitar); };
  }, [datos]);

  if (!datos) return null;

  const cerrar = () => setYendose(true);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,          // por encima del aviso de FP (60), que vive abajo a la derecha
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        /* Lo importante: los clics pasan de largo. El sitio sigue usable. */
        pointerEvents: "none",
        padding: "24px",
      }}
    >
      <style>{CSS}</style>

      <div
        className={`fae-ar-tarjeta ${yendose ? "fae-ar-yendose" : ""}`}
        onClick={cerrar}
        role="status"
        aria-live="polite"
        aria-label={`Tu racha subió a ${datos.hasta} días`}
        style={{
          pointerEvents: "auto",   // solo la tarjeta se puede tocar, para cerrarla
          cursor: "pointer",
          borderRadius: "22px",
          background: "rgba(14,27,46,0.94)",
          border: `1px solid ${FAE.coral}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          padding: "clamp(22px, 4vw, 32px) clamp(28px, 5vw, 44px)",
          textAlign: "center",
          maxWidth: "340px",
        }}
      >
        <div className="fae-ar-llama" style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <IconoRacha tamano={44} brillo />
        </div>

        {/* El número viejo se va hacia arriba mientras el nuevo ocupa su lugar. */}
        <div style={{ position: "relative", height: "62px", marginBottom: "2px" }}>
          {datos.desde > 0 && (
            <p
              className="fae-ar-viejo"
              style={{
                position: "absolute", inset: 0, margin: 0,
                fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "54px",
                letterSpacing: "-0.04em", color: "rgba(248,249,250,0.5)", fontVariantNumeric: "tabular-nums",
              }}
            >
              {datos.desde}
            </p>
          )}
          <p
            className="fae-ar-nuevo"
            style={{
              position: "absolute", inset: 0, margin: 0,
              fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "54px",
              letterSpacing: "-0.04em", color: FAE.text, fontVariantNumeric: "tabular-nums",
            }}
          >
            {datos.hasta}
          </p>
        </div>

        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", color: FAE.coral, margin: "0 0 6px" }}>
          {datos.hasta === 1 ? "día seguido" : "días seguidos"}
        </p>
        <p style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.55)", margin: 0 }}>
          Tu racha sigue viva. Toca para cerrar.
        </p>
      </div>
    </div>
  );
}
