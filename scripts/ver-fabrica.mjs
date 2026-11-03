/*
 * Pinta el panel de la fábrica con borradores de mentira, para mirarlo.
 * Igual que `ver-escenas.mjs`, pero de la pantalla entera.
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/ver-fabrica.mjs salida.html
 *
 * El `cliente` de Fabrica entra por parámetro justo para esto: la pantalla se
 * monta sin base de datos y sin sesión.
 */
import { mkdirSync, writeFileSync } from "node:fs";

const PIEZA = {
  titulo: "Por qué la demanda agregada baja",
  resumen:
    "El estudiante ve el plano de precios y producción con la curva de demanda agregada dibujada. " +
    "Paso a paso le mostramos los tres canales por los que un alza de precios reduce lo que se compra: " +
    "primero el efecto riqueza, luego la tasa de interés, después el comercio exterior. En cada paso se " +
    "enciende solo la parte de la figura que corresponde. Cierra explicando con sus palabras cuál de los " +
    "tres canales pesa más en una economía como la colombiana.",
  objetivo: "Explicar los tres canales por los que un alza de precios reduce la cantidad demandada.",
  nombres: [
    { termino: "Nivel de precios", definicion: "El promedio de los precios de la economía, medido con el IPC." },
    { termino: "Efecto riqueza", definicion: "Con precios más altos, lo ahorrado compra menos y la gente gasta menos." },
    { termino: "Efecto tasa de interés", definicion: "Hacen falta más pesos para lo mismo, el crédito se encarece y se frena la inversión." },
    { termino: "Comercio exterior", definicion: "Si lo de adentro sube más que lo de afuera, se exporta menos y se importa más." },
  ],
  escena: {
    arquetipo: "lienzo",
    alto: 240,
    trazos: [
      { tipo: "eje", id: "ejex", hacia: "derecha", x: 48, y: 200, largo: 272, etiqueta: "Producción" },
      { tipo: "eje", id: "ejey", hacia: "arriba", x: 48, y: 200, largo: 170, etiqueta: "Nivel de precios" },
      { tipo: "curva", id: "da", puntos: [[66, 54], [170, 124], [306, 186]], etiqueta: "DA" },
      { tipo: "punto", id: "antes", x: 140, y: 104, etiqueta: "Antes", donde: "arriba" },
      { tipo: "punto", id: "despues", x: 236, y: 158, etiqueta: "Después", donde: "derecha" },
      { tipo: "linea", id: "baja", x1: 140, y1: 110, x2: 230, y2: 152, punta: true },
    ],
    pie: "Sube el nivel de precios y la cantidad demandada se mueve sobre la misma curva.",
  },
  pasos: [
    { texto: "El índice de precios sube un 10 %. Todo lo que sigue es consecuencia de ese único movimiento.", resaltar: ["ejey"] },
    { texto: "Una familia con diez millones ahorrados ve que ahora compran lo que antes costaba nueve. Se siente más pobre y recorta.", resaltar: ["antes"] },
    { texto: "Con precios más altos hace falta más efectivo, el crédito se encarece y la empresa que iba a financiar una bodega lo piensa dos veces.", resaltar: ["da"] },
    { texto: "Una nevera colombiana de 2.200.000 compite con una importada que sigue en 2.000.000. El comprador cambia de proveedor.", resaltar: ["baja"] },
    { texto: "Los tres canales empujan en la misma dirección: se produce y se vende menos.", resaltar: ["despues"] },
  ],
  pregunta: "¿Cuál de los tres canales crees que pesa más en Colombia, y por qué?",
  respuesta: "No hay una única respuesta. El de tasa de interés suele dominar donde el crédito es caro y el de comercio exterior donde se importa mucho.",
  generada: true,
};

const SEGUNDA = {
  ...PIEZA,
  titulo: "Qué mueve la curva de sitio",
  resumen:
    "El estudiante arrastra la curva de demanda agregada a una posición nueva y tiene que decir qué la movió. " +
    "Le damos cuatro causas posibles y solo dos son correctas. Al final escribe la diferencia entre moverse SOBRE " +
    "la curva y mover la curva entera, que es donde se enredan casi todos.",
  pasos: PIEZA.pasos.slice(0, 4),
};

const BORRADORES = [
  { id: 1, titulo: PIEZA.titulo, estado: "borrador", pieza: PIEZA },
  { id: 2, titulo: SEGUNDA.titulo, estado: "publicada", pieza: SEGUNDA },
];

/* Un cliente de mentira: contesta a `mis_borradores` y a nada más. */
const cliente = {
  rpc: async (nombre) => (nombre === "mis_borradores" ? { data: BORRADORES, error: null } : { data: null, error: null }),
  functions: { invoke: async () => ({ data: null, error: null }) },
};

/*
 * Se monta en el navegador y no en el servidor: los borradores llegan por un
 * efecto, y `renderToStaticMarkup` no corre efectos — la lista salía vacía.
 * Así que el arnés escribe un módulo que Vite empaqueta y la página monta.
 */
const entrada = `
import React from "react";
import { createRoot } from "react-dom/client";
import Fabrica from ${JSON.stringify(new URL("../src/components/docente/Fabrica.jsx", import.meta.url).pathname)};

const BORRADORES = ${JSON.stringify(BORRADORES)};
const cliente = {
  rpc: async (nombre) => (nombre === "mis_borradores" ? { data: BORRADORES, error: null } : { data: null, error: null }),
  functions: { invoke: async () => ({ data: null, error: null }) },
};

createRoot(document.getElementById("raiz")).render(
  React.createElement(Fabrica, { materia: "macroeconomia", nombreMateria: "Macroeconomía", cliente }),
);
`;

const destino = process.argv[2] ?? "demo";
mkdirSync(destino, { recursive: true });
writeFileSync(`${destino}/entrada.jsx`, entrada);
writeFileSync(`${destino}/index.html`, `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La fábrica</title>
<style>
  body { margin: 0; padding: 18px; background: #0E1B2E; color: #F8F9FA; font-family: Inter, system-ui, sans-serif; }
  #raiz { max-width: 680px; margin: 0 auto; }
</style></head>
<body><div id="raiz"></div><script type="module" src="./entrada.jsx"></script></body></html>`);
console.log("escrito en:", destino);
console.log("ahora:  npx vite build --config vite.arnes.js");
