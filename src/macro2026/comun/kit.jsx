/*
 * MACRO 2026 · LOS OBJETOS DEL KIT DE ANIMACIÓN (Gemini, 23-nov;
 * guia-estilo-imagenes.md, «Kit de animación»), en public/macro2026/objetos/,
 * con fondo transparente. Los personajes humanos (bustos y poses) no entran:
 * orden de Mateo, las explicaciones las harán las mascotas.
 *
 * Cada <img> lleva width y height fijos, calculados con las proporciones de
 * origen que se anotan aquí (la prueba kit.test.mjs las mide en el PNG), para
 * que la página no salte al cargar. Se leen bien sobre el navy sin disco.
 */

/* [ancho, alto] de origen. */
export const OBJETOS = {
  alcancia: [230, 200], ancla: [208, 255], "avion-carga": [257, 103], balanza: [248, 216],
  "banco-central": [263, 232], barco: [238, 199], "billete-dolar": [258, 125], "billetes-alas": [231, 209],
  billetes: [233, 205], "bolsa-mercado": [206, 272], bombilla: [176, 272], boveda: [229, 236],
  "caja-herramientas": [274, 239], cajero: [184, 274], carretera: [268, 194], carrito: [300, 272],
  celular: [149, 272], contenedor: [258, 157], "edificio-gobierno": [269, 210], engranajes: [232, 244],
  escalera: [233, 316], escuela: [210, 234], fabrica: [213, 272], "flecha-abajo": [168, 259],
  "flecha-arriba": [168, 258], "flecha-curva": [241, 269], flores: [225, 260], grifo: [218, 257],
  hospital: [232, 206], "llave-inglesa": [120, 348], lupa: [219, 297], moneda: [228, 227],
  nube: [257, 155], recibo: [161, 250], "reloj-arena": [180, 272], termometro: [110, 354],
};

/* Nombre legible de cada objeto, para el alt cuando no es decorativo. */
export const NOMBRE_OBJETO = {
  alcancia: "Alcancía", balanza: "Balanza", barco: "Barco", "bolsa-mercado": "Bolsa de mercado", bombilla: "Bombilla",
  carretera: "Carretera", carrito: "Carrito", "edificio-gobierno": "Edificio de gobierno", escuela: "Escuela",
  fabrica: "Fábrica", "flecha-curva": "Flecha", hospital: "Hospital", lupa: "Lupa", moneda: "Moneda", recibo: "Recibo",
};

export const rutaObjeto = (id) => `/macro2026/objetos/${id}.png`;

const medida = (tabla, id, alto) => {
  const [w, h] = tabla[id];
  return { width: Math.round((alto * w) / h), height: alto };
};

/** Un objeto del kit a `alto` px. Decorativo por defecto (alt vacío). */
export function Objeto({ id, alto = 56, nombre = null, perezosa = false, className = "", style = null, ...resto }) {
  const { width, height } = medida(OBJETOS, id, alto);
  return (
    <img
      src={rutaObjeto(id)}
      alt={nombre ?? ""}
      width={width}
      height={height}
      loading={perezosa ? "lazy" : "eager"}
      decoding="async"
      draggable={false}
      data-objeto={id}
      className={className}
      style={{ display: "block", flex: "none", width, height, ...style }}
      {...resto}
    />
  );
}
