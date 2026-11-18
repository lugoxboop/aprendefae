import { FAE } from "../theme.js";
import { ArrowRight, TrendingUp, Scale, Compass } from "lucide-react";
import { CaraTema, LucesTema, TONOS, variablesDeTono } from "./shared/TarjetaTema.jsx";
import { SUBJECTS, temasVisibles, actividadesDeTipo, APRENDER, HACER } from "../data/subjects.js";

/*
 * Aspecto de tarjeta, compartido por la tarjeta simple y por la partida
 * (TopicSplitCard). Vive aquí y no duplicado en cada una para que las dos se
 * vean como la misma pieza: la partida es la misma tarjeta en otro estado, no
 * otro componente que se le parece.
 */
export const CARD_SHELL = {
  minHeight: "clamp(150px, 22vh, 230px)",
  padding: "clamp(18px, 2.4vh, 26px)",
  borderRadius: "18px",
  background: "rgba(248,249,250,0.055)",
  border: "1px solid rgba(248,249,250,0.14)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: FAE.text,
  font: "inherit",
  textAlign: "left",
  width: "100%",
};

/*
 * Tarjeta de materia de la pantalla de entrada.
 * `icon` es el bloque gráfico propio de cada materia; `accent` tiñe la flecha y
 * el estado hover, que vive en home.css y lee las variables --fae-card-hover-*.
 */
export default function SubjectCard({ icon, title, accent, hoverBg, hoverBorder, onClick, label, badges, tema = null, materia = null }) {
  if (materia) return <TarjetaMateria materia={materia} title={title} label={label} onClick={onClick} />;
  /*
   * Con `tema` (el índice de temas lo pasa), la tarjeta lleva la identidad de
   * su tema: pastilla, tono, luces y flecha en círculo (shared/TarjetaTema).
   * Sin él —la portada— es exactamente la de siempre.
   */
  if (tema) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label || title}
        className="fae-card fae-tema"
        data-tono={tema.nombreTono}
        style={{
          ...CARD_SHELL,
          ...variablesDeTono(tema.tono),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "clamp(18px, 3vh, 34px)",
          cursor: "pointer",
        }}
      >
        <LucesTema Glifo={tema.Glifo} />
        <CaraTema pastilla={icon} badges={badges} numero={tema.numero} titulo={title} tema={tema.datos} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || title}
      className="fae-card"
      style={{
        ...CARD_SHELL,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "clamp(20px, 3.5vh, 40px)",
        cursor: "pointer",
        "--fae-card-hover-bg": hoverBg,
        "--fae-card-hover-border": hoverBorder,
      }}
    >
      {/* Icono y, si la actividad está clasificada, sus insignias en la misma fila. */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", width: "100%" }}>
        {icon}
        {badges && badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>{badges}</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(24px, 2.6vw, 30px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            margin: 0,
            color: FAE.text,
          }}
        >
          {title}
        </h2>
        <span style={{ fontSize: "22px", lineHeight: 1, color: accent }}>→</span>
      </div>
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TARJETA DE MATERIA DE LA PORTADA (Mateo, 18 nov.: «actualízalo al diseño
 * que ahorita estamos manejando»).
 *
 * Es la misma pieza que la tarjeta de tema (#686): pastilla de color con el
 * ícono de siempre en blanco, halo, filo de luz, dibujo en marca de agua,
 * destello y flecha en círculo. Así la portada y el índice se ven como un
 * solo sitio: entras por una tarjeta y llegas a otras de la misma familia.
 *
 * LOS TONOS. Coral y teal no son tonos de tarjeta (coral es «error», teal es
 * «correcto»/«debe»), así que Macro pasa al durazno —el pariente cálido del
 * coral, la materia se sigue reconociendo— y Contabilidad sigue en ámbar.
 * Estrategia, oculta hoy, va en menta para cuando vuelva.
 *
 * El rótulo dice cuántos temas hay y el conteo cuánto hay dentro: el
 * estudiante sabe qué le espera antes de entrar.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const MATERIAS = {
  macroeconomia: { tono: "durazno", Glifo: TrendingUp, Icono: () => <MacroIcon color="#fff" /> },
  contabilidad: { tono: "ambar", Glifo: Scale, Icono: () => <ContabilidadIcon enPastilla /> },
  "pensamiento-estrategico": { tono: "menta", Glifo: Compass, Icono: () => <EstrategiaIcon enPastilla /> },
};

export function resumenDeMateria(id) {
  const temas = temasVisibles(SUBJECTS[id]);
  let aprender = 0;
  let retos = 0;
  for (const t of temas) {
    aprender += actividadesDeTipo(t, APRENDER).length;
    retos += actividadesDeTipo(t, HACER).length;
  }
  const n = temas.length;
  const rotulo = n === 0 ? "En construcción" : n === 1 ? "1 tema" : `${n} temas`;
  const partes = [];
  if (aprender > 0) partes.push(aprender === 1 ? "1 para aprender" : `${aprender} para aprender`);
  if (retos > 0) partes.push(retos === 1 ? "1 reto" : `${retos} retos`);
  return { rotulo, conteo: partes.join(" · ") || null };
}

function TarjetaMateria({ materia, title, label, onClick }) {
  const id = MATERIAS[materia] ? materia : "macroeconomia";
  const { tono, Glifo, Icono } = MATERIAS[id];
  const { rotulo, conteo } = resumenDeMateria(materia);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || title}
      className="fae-card fae-tema fae-materia"
      data-tono={tono}
      style={{
        ...CARD_SHELL,
        ...variablesDeTono(TONOS[tono]),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "clamp(22px, 3.6vh, 40px)",
        cursor: "pointer",
      }}
    >
      <LucesTema Glifo={Glifo} />
      <div className="fae-tema__fila">
        <span className="fae-tema__pastilla" aria-hidden="true">
          <span className="fae-tema__pastilla-anillo" />
          <Icono />
        </span>
      </div>
      <div className="fae-tema__pie">
        <p className="fae-tema__rotulo">{rotulo}</p>
        <h2 className="fae-tema__titulo">{title}</h2>
        <div className="fae-tema__base">
          <p className="fae-tema__conteo">{conteo ?? "\u00a0"}</p>
          <span className="fae-tema__flecha" aria-hidden="true">
            <ArrowRight size={20} strokeWidth={2.4} focusable="false" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* Barras ascendentes — Macroeconomía. `color` las pinta en blanco dentro de la pastilla. */
export function MacroIcon({ color = FAE.coral }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "34px" }}>
      <div style={{ width: "9px", height: "16px", background: color, borderRadius: "2px" }} />
      <div style={{ width: "9px", height: "25px", background: color, borderRadius: "2px" }} />
      <div style={{ width: "9px", height: "34px", background: color, borderRadius: "2px" }} />
    </div>
  );
}

/* Matriz 2×2 — Pensamiento Estratégico. */
export function EstrategiaIcon({ enPastilla = false }) {
  const cell = { width: "15px", height: "15px", borderRadius: "2px" };
  const fuerte = enPastilla ? "#fff" : FAE.teal;
  const soft = enPastilla ? "rgba(255,255,255,0.4)" : "rgba(42,157,143,0.35)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 15px)", gap: "4px", width: "34px" }}>
      <div style={{ ...cell, background: fuerte }} />
      <div style={{ ...cell, background: soft }} />
      <div style={{ ...cell, background: soft }} />
      <div style={{ ...cell, background: fuerte }} />
    </div>
  );
}

/*
 * Una cuenta T — Contabilidad.
 *
 * La forma más corta de decir «contabilidad»: la horizontal, la vertical que
 * la cruza, y una marca a cada lado. La de la izquierda en teal es el DEBE; la
 * de la derecha en ámbar, el HABER. Es el mismo par de colores que usa el
 * fondo para los dos lados de cada asiento, así que el ícono y el fondo dicen
 * lo mismo.
 *
 * SIN SIGNOS, aquí tampoco. El debe no es más ni el haber menos.
 *
 * Los otros dos íconos son divs; este es SVG porque una T con dos marcas no se
 * hace con rectángulos, pero ocupa los mismos 34 px.
 */
export function ContabilidadIcon({ enPastilla = false }) {
  /*
   * LA T ES ESTRUCTURA; LAS MARCAS SON LOS ASIENTOS.
   *
   * Por eso la T va en ámbar atenuado y las dos marcas a plena intensidad. Con
   * la T al 100 % la marca del haber —ámbar sobre ámbar— se perdía, y el ícono
   * pasaba a tener una sola marca visible: justo la mitad de lo que tiene que
   * decir. Se vio comparándolo con los otros dos en la portada.
   *
   * Y va con trazo grueso: al lado de las barras de Macro y de la rejilla de
   * Estrategia, que son formas macizas, una T de línea fina se veía endeble.
   */
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M3 8 H31 M17 8 V31"
        fill="none"
        stroke={enPastilla ? "#fff" : FAE.ambar}
        strokeOpacity={enPastilla ? 1 : 0.5}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Debe a la izquierda en teal, haber a la derecha en ámbar. */}
      {/* En la pastilla ámbar, el haber en ámbar desaparecería: las dos marcas van en navy. */}
      <rect x="5" y="14" width="9" height="3.6" rx="1.8" fill={enPastilla ? FAE.bg : FAE.teal} />
      <rect x="20" y="21" width="9" height="3.6" rx="1.8" fill={enPastilla ? FAE.bg : FAE.ambar} />
    </svg>
  );
}
