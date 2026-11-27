/*
 * GESTIÓN DE PROYECTOS · EL FONDO DE LA MATERIA (índice y temas).
 * Un azul de noche con una trama tenue de diagrama de Gantt: barras de tareas
 * e hitos en rombo. Estático (no compite con el texto de las piezas).
 */
const TRAMA = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160" fill="none" stroke="#6f86ff" stroke-opacity=".1" stroke-width="2" stroke-linecap="round">'
  + '<rect x="12" y="18" width="70" height="10" rx="5"/><rect x="60" y="48" width="96" height="10" rx="5"/><rect x="128" y="78" width="54" height="10" rx="5"/>'
  + '<rect x="30" y="108" width="120" height="10" rx="5"/><path d="M196 104l8-8 8 8-8 8Z"/><path d="M170 44l6-6 6 6-6 6Z"/>'
  + '<path d="M82 23h-0M156 53v25M182 83v21" stroke-dasharray="3 5"/></svg>',
);

export const FONDO_GP = `radial-gradient(120% 60% at 50% -10%, rgba(111,134,255,.18), transparent 70%), url("data:image/svg+xml,${TRAMA}") repeat, #0E1B2E`;

export default function FondoGP({ children, style = null, ...resto }) {
  return (
    <div data-fondo-gp style={{ minHeight: "100vh", background: FONDO_GP, backgroundSize: "auto, 240px 160px, auto", ...style }} {...resto}>
      {children}
    </div>
  );
}

/* Para el índice de temas (TopicIndexView pinta su fondo en una capa propia). */
export function CapaFondoGP() {
  return <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: FONDO_GP, opacity: 0.9 }} />;
}
