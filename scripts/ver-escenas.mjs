/*
 * Pinta las cinco figuras de la escena generada en un HTML suelto, a los dos
 * anchos de comprobación del sitio. No es una prueba: es para mirarlas.
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/ver-escenas.mjs
 */
import { writeFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EscenaGenerada, { CSS_ESCENA } from "../src/components/mecanicas/maquinas/EscenaGenerada.jsx";
import { CSS_MAQUINAS } from "../src/components/mecanicas/maquinas/salaDeMaquinas.jsx";
import { limpiarEscena } from "../supabase/functions/fabrica/escena.js";

const CASOS = [
  {
    nombre: "flujo",
    paso: ["tasa"],
    cruda: {
      arquetipo: "flujo",
      partes: [
        { id: "banco", etiqueta: "Banco de la República", fila: 0, col: 0 },
        { id: "tasa", etiqueta: "Tasa de interés", fila: 1, col: 0, nota: "sube del 9 % al 13 %" },
        { id: "credito", etiqueta: "Crédito", fila: 2, col: 0 },
        { id: "gasto", etiqueta: "Gasto de los hogares", fila: 2, col: 1 },
      ],
      enlaces: [
        { de: "banco", a: "tasa", etiqueta: "decide" },
        { de: "tasa", a: "credito" },
        { de: "credito", a: "gasto" },
      ],
    },
  },
  {
    nombre: "balanza",
    paso: ["caja"],
    cruda: {
      arquetipo: "balanza",
      titulos: { izq: "Debe", der: "Haber" },
      partes: [
        { id: "caja", etiqueta: "Caja", valor: 1200000, lado: "izq" },
        { id: "equipo", etiqueta: "Equipo cómputo", valor: 800000, lado: "izq" },
        { id: "capital", etiqueta: "Capital social", valor: 2000000, lado: "der" },
      ],
      pie: "Los dos lados tienen que dar lo mismo, siempre.",
    },
  },
  {
    nombre: "cuentaT",
    paso: ["venta"],
    cruda: {
      arquetipo: "cuentaT",
      cuenta: "Caja",
      partes: [
        { id: "saldoini", etiqueta: "Saldo inicial", valor: 500000, lado: "debe" },
        { id: "venta", etiqueta: "Venta contado", valor: 1200000, lado: "debe" },
        { id: "arriendo", etiqueta: "Pago arriendo", valor: 900000, lado: "haber" },
      ],
    },
  },
  {
    nombre: "escalones-pila",
    paso: ["m2"],
    cruda: {
      arquetipo: "escalones",
      modo: "pila",
      partes: [
        { id: "efectivo", etiqueta: "Efectivo", nota: "billetes y monedas" },
        { id: "m1", etiqueta: "M1", nota: "efectivo + cuentas corrientes" },
        { id: "m2", etiqueta: "M2", nota: "M1 + ahorros" },
        { id: "m3", etiqueta: "M3" },
      ],
    },
  },
  {
    nombre: "escalones-barras",
    paso: ["riqueza"],
    cruda: {
      arquetipo: "escalones",
      modo: "barras",
      partes: [
        { id: "riqueza", etiqueta: "Efecto riqueza", valor: 42 },
        { id: "tasa", etiqueta: "Efecto tasa", valor: 31 },
        { id: "comercio", etiqueta: "Comercio exterior", valor: 18 },
      ],
    },
  },
  {
    nombre: "linea",
    paso: ["cierre"],
    cruda: {
      arquetipo: "linea",
      partes: [
        { id: "compra", etiqueta: "Se compra la mercancía", momento: "2 enero" },
        { id: "venta", etiqueta: "Se vende a crédito", momento: "18 enero" },
        { id: "cobro", etiqueta: "Entra la plata", momento: "20 febrero" },
        { id: "cierre", etiqueta: "Cierre del periodo", momento: "31 dic" },
      ],
    },
  },
  {
    nombre: "lienzo · demanda agregada",
    paso: ["da2"],
    cruda: {
      arquetipo: "lienzo",
      alto: 250,
      trazos: [
        { tipo: "eje", id: "ejex", hacia: "derecha", x: 48, y: 206, largo: 276, etiqueta: "Producción" },
        { tipo: "eje", id: "ejey", hacia: "arriba", x: 48, y: 206, largo: 176, etiqueta: "Nivel de precios" },
        { tipo: "curva", id: "da", puntos: [[66, 54], [170, 128], [308, 192]], etiqueta: "DA" },
        { tipo: "linea", id: "guia", x1: 48, y1: 104, x2: 196, y2: 104, rayada: true },
        { tipo: "linea", id: "guiav", x1: 196, y1: 104, x2: 196, y2: 206, rayada: true },
        { tipo: "punto", id: "eq", x: 196, y: 104, etiqueta: "Aquí estábamos", donde: "derecha" },
        { tipo: "curva", id: "da2", puntos: [[66, 100], [150, 150], [250, 196]], etiqueta: "DA'", rayada: true },
        { tipo: "linea", id: "salto", x1: 196, y1: 128, x2: 150, y2: 156, punta: true, etiqueta: "se desplaza" },
      ],
      pie: "El precio sube: la cantidad demandada cae por los tres canales.",
    },
  },
  {
    nombre: "lienzo · flujo circular",
    paso: ["hogares"],
    cruda: {
      arquetipo: "lienzo",
      alto: 210,
      trazos: [
        { tipo: "caja", id: "hogares", x: 20, y: 24, ancho: 130, alto: 46, etiqueta: "Hogares" },
        { tipo: "caja", id: "empresas", x: 210, y: 24, ancho: 130, alto: 46, etiqueta: "Empresas" },
        { tipo: "curva", id: "trabajo", puntos: [[150, 38], [180, 14], [210, 38]], punta: true, etiqueta: "trabajo" },
        { tipo: "curva", id: "salarios", puntos: [[210, 58], [180, 84], [150, 58]], punta: true, etiqueta: "salarios" },
        { tipo: "caja", id: "mercado", x: 115, y: 138, ancho: 130, alto: 46, etiqueta: "Mercado de bienes" },
        { tipo: "linea", id: "gasto", x1: 85, y1: 70, x2: 150, y2: 138, punta: true, etiqueta: "gasto" },
        { tipo: "linea", id: "ingreso", x1: 215, y1: 138, x2: 275, y2: 70, punta: true, etiqueta: "ingreso" },
      ],
    },
  },
];

const bloques = CASOS.map(({ nombre, cruda, paso }) => {
  const escena = limpiarEscena(cruda);
  if (!escena) return `<section><h2>${nombre}</h2><p style="color:#E76F51">NO PASÓ EL VALIDADOR</p></section>`;
  const apagado = renderToStaticMarkup(React.createElement(EscenaGenerada, { escena, resaltar: [] }));
  const encendido = renderToStaticMarkup(React.createElement(EscenaGenerada, { escena, resaltar: paso }));
  return `<section>
    <h2>${nombre}</h2>
    <div class="par">
      <div class="col"><p class="rot">sin paso</p>${apagado}</div>
      <div class="col"><p class="rot">paso que enciende «${paso.join(", ")}»</p>${encendido}</div>
    </div>
  </section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Las cinco figuras</title>
<style>
  ${CSS_MAQUINAS}
  ${CSS_ESCENA}
  body { margin: 0; padding: 20px; background: #0E1B2E; color: #F8F9FA; font-family: Inter, system-ui, sans-serif; }
  h1 { font-size: 18px; margin: 0 0 18px; }
  h2 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: #2A9D8F; margin: 26px 0 10px; }
  .par { display: flex; gap: 16px; flex-wrap: wrap; }
  .col { flex: 0 0 340px; max-width: 340px; min-width: 0; box-sizing: border-box; border: 1px solid rgba(248,249,250,.08); border-radius: 12px; padding: 10px; }
  .rot { margin: 0 0 8px; font-size: 11px; color: rgba(248,249,250,.5); }
</style></head>
<body><h1>Las cinco figuras de la escena generada</h1>
${bloques}
</body></html>`;

const destino = process.argv[2] ?? "escenas.html";
writeFileSync(destino, html);
console.log("escrito:", destino);
