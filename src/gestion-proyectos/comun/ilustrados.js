/*
 * GESTIÓN DE PROYECTOS · LOS OBJETOS ILUSTRADOS (Gemini, paso 6 del diseño §3).
 * Archivos en public/gestion-proyectos/ilustrados/<id>.webp; aquí, [ancho, alto]
 * de cada WebP (la prueba gp-ilustrados.test.mjs los mide en el archivo), para
 * que cada <img> lleve su tamaño y la página no salte al cargar.
 */
export const ILUSTRADOS_GP = {
  "archivador-cajones": [192, 386],
  "archivador-metalico": [301, 353],
  "bandeja-madera": [373, 244],
  bodega: [362, 280],
  "bolsa-dinero": [328, 359],
  "cafetera-goteo": [231, 382],
  "calendario-pared": [347, 335],
  "camion-cafe": [385, 304],
  "carpeta-abierta": [431, 366],
  "carpeta-documento": [280, 371],
  celular: [197, 368],
  "cinta-transportadora": [368, 238],
  conmutador: [348, 363],
  "dial-radio": [345, 348],
  "edificio-oficinas": [291, 379],
  "escritorio-madera": [382, 254],
  "letrero-luminoso": [376, 233],
  "memorando-clip": [269, 374],
  "plano-enrollado": [392, 328],
  portapapeles: [330, 376],
  "porton-madera": [447, 304],
  "puente-grietas": [383, 237],
  "puente-nuevo": [392, 304],
  "puente-reforzado": [391, 259],
  "puente-tablones": [381, 255],
  "reloj-arena": [247, 417],
  "sello-goma": [281, 362],
  "sobre-boleto": [328, 350],
  "sobre-carta": [330, 234],
  "tablero-corcho": [452, 296],
  "tablero-organigrama": [366, 278],
  "telefono-antiguo": [396, 299],
  timon: [381, 379],
};

export const rutaIlustradoGP = (id) => `/gestion-proyectos/ilustrados/${id}.webp`;
