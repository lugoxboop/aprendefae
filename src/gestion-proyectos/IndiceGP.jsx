/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · EL ÍNDICE DE TEMAS (como el de Macroeconomía)
 *
 * Pedido de Mateo (28-nov-2026): la materia se veía como una sola página
 * larga, con todos los caminos uno debajo de otro. Ahora entra igual que
 * Macroeconomía: la misma plantilla de índice (TopicIndexView), una tarjeta
 * por tema —Fundamentos y los cinco grupos de procesos—, con su tono, su
 * dibujo y su conteo, y debajo la liga y el ranking de la materia.
 *
 * Los temas salen de SUBJECTS["gestion-proyectos"] (= materiaParaRegistro de
 * catalogo.js): lo publicado, y nada más.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FAE } from "../theme.js";
import { SUBJECTS } from "../data/subjects.js";
import TopicIndexView from "../components/TopicIndexView.jsx";
import { CapaFondoGP } from "./comun/FondoGP.jsx";
import { Compass } from "lucide-react";
import { SIMULADORES } from "./temas.js";

export default function IndiceGP({ onOpenTopic }) {
  const materia = SUBJECTS["gestion-proyectos"];
  /*
   * Solo para pintar: el simulador del acta es una pieza de Aprender del tema
   * Inicio aunque no esté en el registro (no da FP ni tiene fila de catálogo).
   * Con él, la tarjeta de Inicio se parte en Aprender y Hacer como las de Macro.
   */
  const temas = materia.topics.map((t) => (SIMULADORES[t.id]
    ? { ...t, actividades: [...SIMULADORES[t.id].map((s) => ({ id: s.id, nombre: s.nombre, clasificacion: { tipo: "aprender" } })), ...t.actividades] }
    : t));
  return (
    <div data-indice-gp>
      <TopicIndexView
        subjectId={materia.id}
        name={materia.name}
        accent={FAE.teal}
        hoverBg="rgba(42,157,143,0.12)"
        hoverBorder="rgba(42,157,143,0.7)"
        background={<CapaFondoGP />}
        topics={temas}
        renderTopicIcon={() => <Compass size={26} strokeWidth={2} aria-hidden="true" />}
        onOpenTopic={onOpenTopic}
      />
    </div>
  );
}
