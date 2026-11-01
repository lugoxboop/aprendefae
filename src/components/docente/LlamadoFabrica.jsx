import { Sparkles } from "lucide-react";
import { FAE } from "../../theme.js";
import Robot, { CSS_ROBOT } from "../../bruno/Robot.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LLAMADO A LA FÁBRICA — arriba, ancho, y con el robot delante
 *
 * Mateo, 1-nov: «el botón de crear actividades está demasiado escondido… es un
 * diferencial muy grande como para esconderlo en un botón muy chiquitico».
 * Tenía razón: vivía en la fila de botones secundarios del final, del mismo
 * tamaño que «Mis estudiantes», y ahí nadie lo iba a encontrar.
 *
 * ═══════════ POR QUÉ VA AQUÍ Y NO MÁS ARRIBA TODAVÍA ═══════════
 *
 * Va justo debajo de la frase del día y encima de las cifras. No va lo primero
 * de lo primero porque lo primero que un profesor viene a ver es cómo va su
 * curso —para eso abre el panel—, y tapar eso con una oferta sería venderle
 * algo antes de saludarlo. Pero va ANTES de las cifras porque es lo único de
 * esta pantalla que le ofrece hacer algo nuevo, y lo nuevo hay que encontrarlo
 * sin buscarlo.
 *
 * ═══════════ POR QUÉ NO SE APAGA SIN ESTUDIANTES ═══════════
 *
 * Las otras vistas del panel enseñan lo que hizo el curso, y sin curso no
 * enseñan nada. Esta crea material, y preparar material se hace ANTES de que
 * empiece el semestre: es justo cuando más falta le hace y cuando el resto del
 * panel está vacío.
 *
 * ═══════════ UNA SOLA PUERTA ═══════════
 *
 * Al subirlo aquí se quitó el botón pequeño de la fila de abajo. Dos entradas
 * a lo mismo en la misma pantalla no es el doble de visible: es una duda sobre
 * cuál de las dos hace otra cosa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function LlamadoFabrica({ nombreMateria, onIr, style, className }) {
  return (
    <section
      className={["fab-llamado", className].filter(Boolean).join(" ")}
      style={style}
      data-llamado-fabrica
    >
      <style>{CSS_ROBOT}</style>
      <style>{CSS_LLAMADO}</style>

      <span className="fab-llamado__robot" aria-hidden="true">
        <Robot tamano={56} />
      </span>

      <div className="fab-llamado__texto">
        <p className="fab-llamado__titulo">Convierte tu capítulo en actividades</p>
        <p className="fab-llamado__nota">
          Sube tu material y te armo tres para {nombreMateria}. Tú decides cuáles se publican.
        </p>
      </div>

      <button type="button" className="fab-llamado__boton" onClick={onIr} data-ir="fabrica">
        <Sparkles size={17} aria-hidden="true" />
        Crear actividades
      </button>
    </section>
  );
}

/*
 * El degradado es el único de todo el panel, y por eso funciona: esta franja
 * tiene que leerse distinta de las tarjetas de cifras que vienen debajo sin
 * gritar. Teal muy bajo sobre el fondo de siempre, y el borde algo más vivo.
 */
export const CSS_LLAMADO = `
.fab-llamado {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  margin: 0 0 18px; padding: 18px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(42,157,143,0.14), rgba(42,157,143,0.04) 62%, rgba(248,249,250,0.03));
  border: 1px solid rgba(42,157,143,0.38);
}
.fab-llamado__robot { flex-shrink: 0; display: block; }
.fab-llamado__texto { flex: 1 1 260px; min-width: 0; }
.fab-llamado__titulo {
  margin: 0; font-family: Sora, sans-serif; font-size: 17px; font-weight: 700;
  line-height: 1.3; letter-spacing: -0.01em; color: ${FAE.text};
}
.fab-llamado__nota { margin: 4px 0 0; font-size: 13.5px; line-height: 1.5; color: rgba(248,249,250,0.74); }
.fab-llamado__boton {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  flex-shrink: 0; min-height: 48px; padding: 0 24px;
  border-radius: 999px; border: none; cursor: pointer;
  background: ${FAE.teal}; color: #06202A;
  font-family: Sora, sans-serif; font-size: 15px; font-weight: 700;
  transition: filter 180ms cubic-bezier(.3,.9,.4,1), transform 180ms cubic-bezier(.3,.9,.4,1);
}
.fab-llamado__boton:hover { filter: brightness(1.08); }
.fab-llamado__boton:active { transform: translateY(1px); }

/* A 320 y 375 la franja se apila y el botón ocupa el ancho: un botón a medias
   al lado de un texto a medias no se lee ni como texto ni como botón. */
@media (max-width: 560px) {
  .fab-llamado { gap: 13px; padding: 16px; }
  .fab-llamado__boton { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .fab-llamado__boton { transition: none; }
  .fab-llamado__boton:active { transform: none; }
}
`;
