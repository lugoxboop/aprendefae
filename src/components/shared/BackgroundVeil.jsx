/*
 * Velo radial que va encima de cualquier fondo animado y debajo del contenido.
 * Oscurece los bordes para que el texto siempre tenga contraste suficiente,
 * dejando el centro casi limpio para que se aprecie la animación.
 *
 * `centerAlpha` sube cuando el fondo es luminoso —la escena de ajedrez tiene
 * madera clara— y el texto necesita más base para leerse.
 */
export default function BackgroundVeil({ centerAlpha = 0.10 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        background:
          `radial-gradient(120% 90% at 50% 44%, rgba(14,27,46,${centerAlpha}) 0%, rgba(14,27,46,0.62) 58%, rgba(10,20,34,0.92) 100%)`,
      }}
    />
  );
}
