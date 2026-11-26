/*
 * MACRO 2026 · LOS MICROVIDEOS DE LAS APRENDER (registro para el índice)
 *
 * El índice de Aprender (IndiceAprender.jsx) pinta la miniatura y la duración
 * de cada pieza que abre con un microvideo de Jane. Una línea por video
 * PUBLICADO: id de la pieza → póster (public/macro2026/videos/) y segundos
 * medidos con ffprobe sobre el archivo publicado, no calculados. `foco`: la
 * altura (en %) donde están las mascotas en el póster, para que el recorte
 * horizontal de la tarjeta no las corte.
 *
 * Una pieza sin línea aquí se ve como «Interactiva», con su escena. Registrar
 * un video que aún no está en la pieza sería prometer algo que no hay.
 */
export const VIDEOS_APRENDER = {
  /* «El mango de Toby», aprobado por Mateo el 25-nov-2026 (PR 775). 74,8 s. */
  "da26-a0-ley-demanda": { poster: "/macro2026/videos/ley-demanda-poster.webp", foco: 38, segundos: 75 },
  /*
   * Los nueve que Mateo aprobó el 26-nov-2026. Los archivos (<nombre>.mp4 y
   * <nombre>-poster.webp) entran con el PR de Jane que los pone en cada
   * pieza: ESTE registro se fusiona DESPUÉS de ese, o el índice prometería un
   * video que aún no está. Segundos medidos con ffprobe.
   */
  "da26-a1-carrito": { poster: "/macro2026/videos/carrito-poster.webp", foco: 74, segundos: 75 },
  "da26-a2-vaso-renta": { poster: "/macro2026/videos/vaso-renta-poster.webp", foco: 62, segundos: 70 },
  "da26-a3-columpio-tasa": { poster: "/macro2026/videos/columpio-tasa-poster.webp", foco: 64, segundos: 74 },
  "da26-a4-no-miran-renta": { poster: "/macro2026/videos/no-miran-renta-poster.webp", foco: 66, segundos: 78 },
  "da26-a5-bisagra-ascensor": { poster: "/macro2026/videos/bisagra-ascensor-poster.webp", foco: 45, segundos: 71 },
  "da26-a6-eco-multiplicador": { poster: "/macro2026/videos/eco-multiplicador-poster.webp", foco: 68, segundos: 71 },
  "pe26-a1-mecanico": { poster: "/macro2026/videos/mecanico-poster.webp", foco: 62, segundos: 70 },
  "pe26-a2-fiebre": { poster: "/macro2026/videos/fiebre-poster.webp", foco: 64, segundos: 61 },
  "pe26-a3-problema-resuelto": { poster: "/macro2026/videos/problema-resuelto-poster.webp", foco: 63, segundos: 57 },
};

export const videoDe = (id) => VIDEOS_APRENDER[id] ?? null;

/* 75 → «1:15». */
export const duracion = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
