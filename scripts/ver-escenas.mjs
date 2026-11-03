/*
 * Pinta las cinco figuras de la escena generada en un HTML suelto, a los dos
 * anchos de comprobación del sitio. No es una prueba: es para mirarlas.
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/ver-escenas.mjs
 */
import { writeFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EscenaGenerada, { CSS_ESCENA } from "../src/components/shared/EscenaGenerada.jsx";
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
