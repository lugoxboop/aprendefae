import {
  ArrowRight, ShoppingCart, Landmark, Coins, PiggyBank, Network, Mountain, Swords, Sparkles,
} from "lucide-react";
import { APRENDER, HACER, actividadesDeTipo } from "../../data/subjects.js";
import IdentificadorDeTema, { tieneIdentificador } from "./IdentificadorDeTema.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TARJETA DE TEMA CON IDENTIDAD PROPIA (Mateo, 18 nov.: «son muy sosas»).
 *
 * Misma estética que la barra lateral de la cuenta y el panel docente del
 * mismo día: el ícono vive en una PASTILLA de color, la tarjeta tiene un
 * brillo de su color en la esquina, sombra que se tiñe al pasar el puntero,
 * un destello que la cruza y una flecha en círculo que se llena.
 *
 * CADA TEMA TIENE SU TONO. Antes las cuatro de Macro llevaban las mismas
 * barras coral: lo único que las distinguía era el título. Ahora el color y
 * el dibujo dicen de qué tema se trata antes de leer.
 *
 * Lo que NO cambia, a propósito:
 *   · el coral y el teal no son tonos de tema (coral es «error», teal es
 *     «correcto»/«debe» en todo el sitio).
 *   · el texto sigue en blanco; el tono solo pinta formas y el rótulo
 *     «TEMA n», que usa la variante clara de cada tono (≥ 4,5:1 sobre la
 *     tarjeta).
 *   · las dos opciones de la tarjeta partida siguen neutras y del mismo peso.
 *   · con movimiento reducido no hay destello, ni salto, ni giro.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* base: formas y brillos · claro: el rótulo de texto · rgb: para los alfas. */
export const TONOS = {
  violeta: { base: "#8B7CF6", claro: "#B9AEFF", rgb: "139,124,246" },
  cielo: { base: "#4CB8E8", claro: "#8FD3F2", rgb: "76,184,232" },
  ambar: { base: "#E9C46A", claro: "#F1D894", rgb: "233,196,106" },
  menta: { base: "#43C59E", claro: "#86E0C3", rgb: "67,197,158" },
  rosa: { base: "#E879B9", claro: "#F3ACD4", rgb: "232,121,185" },
  indigo: { base: "#6C8CFF", claro: "#A7BBFF", rgb: "108,140,255" },
  lima: { base: "#A3D65C", claro: "#C6E795", rgb: "163,214,92" },
  durazno: { base: "#F4A261", claro: "#F8C595", rgb: "244,162,97" },
};
const ORDEN_TONOS = ["violeta", "cielo", "ambar", "menta", "rosa", "indigo", "lima", "durazno"];

/*
 * Tono y dibujo elegidos por tema. Un tema que no esté aquí no se rompe: toma
 * el tono de su posición y el dibujo de la materia (o el identificador
 * dibujado que ya tenga en identificadoresDeTema.js).
 */
const IDENTIDAD = {
  "macroeconomia/demanda-agregada": { tono: "violeta", Glifo: ShoppingCart },
  "macroeconomia/politica-economica": { tono: "cielo", Glifo: Landmark },
  "macroeconomia/politica-fiscal": { tono: "ambar", Glifo: Coins },
  "macroeconomia/politica-monetaria": { tono: "menta", Glifo: PiggyBank },
  "pensamiento-estrategico/pensamiento-sistemico": { tono: "indigo", Glifo: Network },
  "pensamiento-estrategico/modelo-iceberg": { tono: "cielo", Glifo: Mountain },
  "pensamiento-estrategico/fuerzas-porter": { tono: "rosa", Glifo: Swords },
};

export function identidadDeTema(materia, tema, indice = 0) {
  const fija = IDENTIDAD[`${materia}/${tema?.id}`];
  const nombre = fija?.tono ?? ORDEN_TONOS[indice % ORDEN_TONOS.length];
  return { nombreTono: nombre, tono: TONOS[nombre], Glifo: fija?.Glifo ?? null };
}

/* Las variables CSS que leen las reglas .fae-tema de home.css. */
export function variablesDeTono(tono) {
  return {
    "--tono": tono.base,
    "--tono-claro": tono.claro,
    "--tono-rgb": tono.rgb,
    "--fae-card-hover-bg": `rgba(${tono.rgb},0.10)`,
    "--fae-card-hover-border": `rgba(${tono.rgb},0.7)`,
  };
}

/*
 * El ícono en su pastilla. Si el tema tiene identificador dibujado (los de
 * Contabilidad), va ese; si no, el glifo elegido; y si no, el de la materia.
 */
export function PastillaTema({ materia, tema, Glifo, respaldo }) {
  let contenido;
  if (tieneIdentificador(materia, tema)) contenido = <IdentificadorDeTema tema={tema} materia={materia} lado={42} />;
  else if (Glifo) contenido = <Glifo size={28} strokeWidth={2} aria-hidden="true" focusable="false" />;
  else contenido = respaldo ?? <Sparkles size={26} strokeWidth={2} aria-hidden="true" focusable="false" />;
  return (
    <span className="fae-tema__pastilla" aria-hidden="true">
      <span className="fae-tema__pastilla-anillo" />
      {contenido}
    </span>
  );
}

/* Las capas de luz: van como primeros hijos de la tarjeta, detrás del texto. */
export function LucesTema({ Glifo }) {
  return (
    <>
      <span className="fae-tema__brillo" aria-hidden="true" />
      <span className="fae-tema__linea" aria-hidden="true" />
      {Glifo && (
        <span className="fae-tema__marca-agua" aria-hidden="true">
          <Glifo size={150} strokeWidth={1.2} focusable="false" />
        </span>
      )}
      <span className="fae-tema__destello" aria-hidden="true" />
    </>
  );
}

function contarActividades(tema) {
  if (!tema) return null;
  const a = actividadesDeTipo(tema, APRENDER).length;
  const h = actividadesDeTipo(tema, HACER).length;
  const partes = [];
  if (a > 0) partes.push(a === 1 ? "1 para aprender" : `${a} para aprender`);
  if (h > 0) partes.push(h === 1 ? "1 reto" : `${h} retos`);
  return partes.length ? partes.join(" · ") : null;
}

/*
 * La cara cerrada: pastilla e insignias arriba; rótulo, título y conteo abajo,
 * con la flecha en su círculo.
 */
export function CaraTema({ pastilla, badges, numero, titulo, tema }) {
  const conteo = contarActividades(tema);
  return (
    <>
      <div className="fae-tema__fila">
        {pastilla}
        {badges && badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>{badges}</div>
        )}
      </div>
      {/*
        El título va a todo lo ancho —con la flecha al lado se partía en dos
        renglones— y la flecha baja a la fila del conteo.
      */}
      <div className="fae-tema__pie">
        {numero != null && <p className="fae-tema__rotulo">Tema {numero}</p>}
        <h2 className="fae-tema__titulo">{titulo}</h2>
        <div className="fae-tema__base">
          <p className="fae-tema__conteo">{conteo ?? "\u00a0"}</p>
          <span className="fae-tema__flecha" aria-hidden="true">
            <ArrowRight size={20} strokeWidth={2.4} focusable="false" />
          </span>
        </div>
      </div>
    </>
  );
}
