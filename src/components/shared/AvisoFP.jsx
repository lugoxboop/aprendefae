import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { escucharFP, motivoDelRecorte } from "../../fp/aviso.js";
import { pantallaTomaElAviso } from "../../hacer/pantallaResumen.js";

/*
 * Confirmación en pantalla al ganar FP.
 *
 * Se monta UNA vez, en la raíz, y escucha al motor. Ninguna actividad lo pinta
 * por su cuenta: así el número de la pantalla es siempre el que se guardó, y no
 * uno escrito a mano al lado de cada mecánica.
 *
 * Aparece abajo, apartado del contenido, y se va solo. No pide nada, no tapa
 * nada y no interrumpe: terminar una actividad ya es su propio momento, el
 * aviso solo confirma.
 *
 * Solo lo disparan las actividades "Hacer": una "Aprender" no llega nunca al
 * motor, así que nunca emite.
 */

const DURACION = 4200;

export default function AvisoFP() {
  const [aviso, setAviso] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return escucharFP((datos) => {
      /*
       * Si esta partida la cierra la pantalla de resumen, los puntos los dice
       * ella. Si la salvaguarda la manda al cierre de siempre, el aviso sale
       * como siempre: es la misma decisión, con el mismo aviso.
       */
      if (pantallaTomaElAviso(datos)) return;
      /* Cero FP no se celebra: repetir por cuarta vez no da nada y decirlo con
         un "+0 FP" sería ruido. El motivo se enseña igual, que es lo útil. */
      setAviso({ ...datos, motivo: motivoDelRecorte(datos) });
      setVisible(true);
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), DURACION);
    return () => clearTimeout(t);
  }, [visible, aviso]);

  if (!aviso) return null;

  /*
   * Repetir tiene su propio tono: ni "+0 FP" ni "Sin FP", que suenan a castigo
   * por repasar. Se dice que ya estaba hecha y ya.
   */
  const repetida = !!aviso.repetida;
  const cero = aviso.fp === 0;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        zIndex: 60,
        transform: `translateX(-50%) translateY(${visible ? "0" : "14px"})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 260ms ease, transform 320ms cubic-bezier(0.2,0.8,0.3,1)",
        pointerEvents: "none",
        maxWidth: "min(92vw, 340px)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 18px",
        borderRadius: "999px",
        background: "rgba(14,27,46,0.94)",
        border: `1px solid ${cero ? "rgba(248,249,250,0.22)" : FAE.teal}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      }}
    >
      <span
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: cero ? "15px" : "19px",
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          color: cero ? "rgba(248,249,250,0.7)" : FAE.teal,
          whiteSpace: "nowrap",
        }}
      >
        {repetida ? "Ya completada" : cero ? "Sin FP" : `+${aviso.fp} FP`}
      </span>
      {aviso.motivo && (
        <span style={{ fontSize: "12px", lineHeight: 1.35, color: "rgba(248,249,250,0.6)" }}>
          {aviso.motivo}
        </span>
      )}
    </div>
  );
}
