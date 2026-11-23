/*
 * MACRO 2026 · EL ELENCO DE MASCOTAS (orden de Mateo, 23-nov 02:38)
 *
 * Reemplaza a las personas de personajes.jsx, que se sentían muy serias. Son
 * las mismas mascotas chibi de la plataforma, pedidas a Gemini en el chat
 * «Chibi Fox Model Sheet» para que el estilo sea idéntico. Cada rol se
 * reconoce por su especie + accesorio, y SIEMPRE lleva su rol escrito debajo:
 * lo que importa es la posición objetiva, no el animal.
 *
 * Reglas (guia-estilo-imagenes.md, «Elenco de mascotas»):
 * - Nunca menos de 120 px de alto; 180 px o más si protagoniza la pantalla.
 * - Sin disco: el contorno negro grueso se lee solo sobre el navy.
 * - Cara tranquila. Ojo con las poses que «regalan» una dirección (gráfica
 *   que sube, tableta con línea que sube): ver la guía antes de usarlas.
 */

const R = "/macro2026/mascotas/";

/** id → nombre visible, especie, accesorio, pose por defecto y sus poses [ancho, alto]. */
export const MASCOTAS = {
  empresario: { nombre: "Empresario", especie: "zorro", accesorio: "corbata", pose: "periodico",
    poses: { carrito: [441, 506], periodico: [279, 502], explica: [289, 502] } },
  analista: { nombre: "Analista", especie: "gato", accesorio: "gafas", pose: "libreta",
    poses: { libreta: [273, 480], lupa: [273, 480], grafica: [302, 480] } },
  "autoridad-economica": { nombre: "Autoridad económica", especie: "panda", accesorio: "traje", pose: "timon", archivo: "autoridad",
    poses: { timon: [341, 486], grifo: [376, 560], carpeta: [318, 486] } },
  profesor: { nombre: "Profesor", especie: "perro", accesorio: "corbatin", pose: "pregunta",
    poses: { pregunta: [292, 440], pizarra: [450, 440], libro: [286, 440] } },
  familia: { nombre: "Familia", especie: "conejo", accesorio: null, pose: "mercado",
    poses: { mercado: [400, 365], alcancia: [309, 366], recibo: [314, 395] } },
  inversionista: { nombre: "Inversionista", especie: "huron", accesorio: "corbata", pose: "ladrillo",
    poses: { tableta: [316, 448], ladrillo: [445, 447], monedas: [379, 451] } },
  "exportadora-flores": { nombre: "Exportadora de flores", especie: "hamster", accesorio: "gorra", pose: "flores", archivo: "exportadora",
    poses: { flores: [246, 425], avion: [432, 424], "recibe-billete": [227, 425] } },
  "importadora-celulares": { nombre: "Importadora de celulares", especie: "conejo", accesorio: "casco", pose: "celulares", archivo: "importadora",
    poses: { celulares: [270, 482], contenedor: [342, 481], "paga-billete": [336, 483] } },
  viajero: { nombre: "Viajero", especie: "perro", accesorio: "mochila", pose: "maleta",
    poses: { maleta: [293, 438], cambio: [388, 436], avion: [377, 467] } },
  "deudor-externo": { nombre: "Quien paga deuda externa", especie: "zorro", accesorio: "corbatin", pose: "sobre", archivo: "deudor",
    poses: { sobre: [415, 480], monedas: [364, 502], balanza: [415, 502] } },
};

/** Escenas de dos o más mascotas juntas: id → [ancho, alto]. */
export const INTERACCIONES = {
  "analista-empresario": [433, 360],
  "autoridad-empresario": [387, 367],
  "inversionista-empresario": [420, 352],
  "exportadora-importadora": [417, 393],
  "viajero-banco-central": [386, 392],
  "familia-carrito": [376, 393],
};

export const ALTO_MINIMO = 120;

export function rutaMascota(id, pose) {
  const m = MASCOTAS[id];
  const p = pose && m.poses[pose] ? pose : m.pose;
  return { src: `${R}${m.archivo || id}-${p}.webp`, tam: m.poses[p], pose: p };
}

export const rutaInteraccion = (id) => `${R}interaccion-${id}.webp`;

const ROTULO = { margin: 0, font: "600 12px/16px var(--planck-font-sans, system-ui, sans-serif)", letterSpacing: ".02em", color: "inherit", opacity: 0.82, textAlign: "center", maxWidth: 140 };

/**
 * La mascota de un rol, de cuerpo entero, con su rol escrito debajo.
 * `alto` nunca baja de 120 px aunque se pida menos.
 */
export function MascotaRol({ id, pose, alto = 140, rotulo = true, perezosa = false, decorativa = false, style = null, ...resto }) {
  const m = MASCOTAS[id];
  const { src, tam, pose: p } = rutaMascota(id, pose);
  const h = Math.max(ALTO_MINIMO, alto);
  const w = Math.round((tam[0] / tam[1]) * h);
  return (
    <figure
      data-mascota-rol={id}
      data-pose={p}
      style={{ margin: 0, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "none", ...style }}
      {...resto}
    >
      <img
        src={src}
        alt={decorativa || rotulo ? "" : m.nombre}
        width={w}
        height={h}
        loading={perezosa ? "lazy" : "eager"}
        decoding="async"
        draggable={false}
        style={{ display: "block", width: w, height: h, objectFit: "contain" }}
      />
      {rotulo && <figcaption style={ROTULO}>{m.nombre}</figcaption>}
    </figure>
  );
}

/** Una escena de varias mascotas (sin rótulo propio: la pantalla nombra a cada una). */
export function EscenaMascotas({ id, alto = 180, perezosa = true, alt = "", style = null, ...resto }) {
  const [tw, th] = INTERACCIONES[id];
  const h = Math.max(ALTO_MINIMO, alto);
  const w = Math.round((tw / th) * h);
  return (
    <img
      data-escena-mascotas={id}
      src={rutaInteraccion(id)}
      alt={alt}
      width={w}
      height={h}
      loading={perezosa ? "lazy" : "eager"}
      decoding="async"
      draggable={false}
      style={{ display: "block", width: w, maxWidth: "100%", height: "auto", objectFit: "contain", ...style }}
      {...resto}
    />
  );
}
