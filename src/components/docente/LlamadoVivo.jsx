import { useContext } from "react";
import { Radio } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LLAMADO A LA CLASE EN VIVO — debajo del de la fábrica
 *
 * Mateo, 4-nov: el modo en vivo es la fase 1 del análisis competitivo, y es
 * lo que alivia el dolor número uno del profesor (habla al aire, el celular le
 * gana). Va en el panel porque es donde el profesor ya está, y con la misma
 * forma que el llamado de la fábrica para que se lea como una herramienta, no
 * como un aviso. Ámbar y no teal, para que las dos franjas no se confundan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function LlamadoVivo({ materia, style, className }) {
  const nav = useContext(NavigationContext);
  return (
    <section className={["vivo-llamado", className].filter(Boolean).join(" ")} style={style} data-llamado-vivo>
      <style>{CSS_LLAMADO_VIVO}</style>
      <span className="vivo-llamado__icono" aria-hidden="true"><Radio size={26} color={FAE.ambar} /></span>
      <div className="vivo-llamado__texto">
        <p className="vivo-llamado__titulo">Clase en vivo</p>
        <p className="vivo-llamado__nota">Proyecta un código y pon a toda la clase a responder desde el celular. Entrar cuenta como asistencia.</p>
      </div>
      <button type="button" className="vivo-llamado__boton" onClick={() => nav?.irA?.("vivo-profesor", null, materia)} data-ir="vivo">
        Abrir una sala
      </button>
    </section>
  );
}

export const CSS_LLAMADO_VIVO = `
.vivo-llamado {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  margin: 0 0 18px; padding: 16px 20px; border-radius: 20px;
  background: linear-gradient(135deg, rgba(233,196,106,0.12), rgba(233,196,106,0.03) 62%, rgba(248,249,250,0.03));
  border: 1px solid rgba(233,196,106,0.38);
}
.vivo-llamado__icono { flex-shrink: 0; width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; background: rgba(233,196,106,0.12); }
.vivo-llamado__texto { flex: 1 1 260px; min-width: 0; }
.vivo-llamado__titulo { margin: 0; font-family: Sora, sans-serif; font-size: 17px; font-weight: 700; line-height: 1.3; letter-spacing: -0.01em; color: ${FAE.text}; }
.vivo-llamado__nota { margin: 4px 0 0; font-size: 13.5px; line-height: 1.5; color: rgba(248,249,250,0.74); }
.vivo-llamado__boton {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  flex-shrink: 0; min-height: 48px; padding: 0 24px; border-radius: 999px; cursor: pointer;
  background: transparent; color: ${FAE.text}; border: 1.5px solid ${FAE.ambar};
  font-family: Sora, sans-serif; font-size: 15px; font-weight: 700;
  transition: transform 180ms cubic-bezier(.3,.9,.4,1), opacity 180ms cubic-bezier(.3,.9,.4,1);
}
.vivo-llamado__boton:active { transform: translateY(1px); }
.vivo-llamado__boton:focus-visible { outline: 3px solid ${FAE.ambar}; outline-offset: 2px; }
@media (max-width: 560px) {
  .vivo-llamado { gap: 13px; padding: 16px; }
  .vivo-llamado__boton { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .vivo-llamado__boton { transition: none; }
  .vivo-llamado__boton:active { transform: none; }
}
`;
