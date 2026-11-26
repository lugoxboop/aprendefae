/*
 * La partitura del video: cuándo pasa cada cosa (en segundos de video).
 * Todo cuelga de la voz medida (tiempo.js). De aquí leen las escenas y el sonido.
 */
import { S, E, W, c } from "./tiempo.js";

/* ── Datos de la historia: P = 3.500 − 500·Q ── */
export const DIAS = [
  { dia: "Lunes", precio: 1000, q: 5 },
  { dia: "Martes", precio: 2000, q: 3 },
  { dia: "Miércoles", precio: 3000, q: 1 },
  { dia: "Jueves", precio: 1500, q: 4 },
];

/* ── Cortes entre planos ── */
export const REBOBINA = E(1) + 0.12;            // empieza el rebobinado del gancho
export const X1 = REBOBINA + 0.5;               // gancho → calle
export const X2 = S(3) - 0.25;                  // calle → puesto
export const X3 = S(5) - 0.3;                   // puesto → calle (camión casi vacío)
export const X4 = W(5, "y", 0.55) - 0.2;        // calle → puesto
export const X5 = S(9) - 0.6;                   // puesto → calle (camión lleno)
export const X6 = W(9, "el", 0.2, 1) - 0.15;    // calle → puesto
export const X7 = W(10, "pizarra", 0.4) - 0.2;  // puesto → pizarra grande (fundido)
export const FUNDIDO = 0.7;

export const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "calle", desde: X1, entra: "destello", n: 0 },
  { tipo: "puesto", desde: X2, entra: "barrido" },
  { tipo: "calle", desde: X3, entra: "barrido", n: 1 },
  { tipo: "puesto", desde: X4, entra: "barrido" },
  { tipo: "calle", desde: X5, entra: "barrido", n: 2 },
  { tipo: "puesto", desde: X6, entra: "barrido" },
  { tipo: "pizarra", desde: X7, entra: "fundido" },
];
export const T_BARRIDO = 0.34;

/* ── El letrero del precio ── */
export const LETRERO = [
  { t: W(3, "mil", 0.7) - 0.12, precio: 1000 },
  { t: W(5, "dos", 0.85) - 0.1, precio: 2000 },
  { t: S(7) + 0.5, precio: 3000 },
  { t: W(9, "mil", 0.4) - 0.1, precio: 1500 },
];

/* ── Los mangos que caen en la canasta ── */
const PASO = 0.32, VUELO = 0.46;
const serie = (t0, n) => Array.from({ length: n }, (_, k) => ({ sale: t0 + k * PASO, cae: t0 + k * PASO + VUELO, k }));
export const COMPRAS = [
  { dia: 0, mangos: serie(W(4, "piensa", 0.6) - 0.35, 5), hasta: X3 + 0.2 },
  { dia: 1, mangos: serie(W(6, "se", 0.7) - 0.1, 3), hasta: S(7) + 0.3 },
  { dia: 2, mangos: serie(W(8, "solo", 0.85) - 0.3, 1), hasta: X5 + 0.2 },
  { dia: 3, mangos: serie(W(9, "vuelve", 0.75) - 0.1, 4), hasta: 9999 },
];
COMPRAS.forEach((cmp) => {
  cmp.fin = cmp.mangos[cmp.mangos.length - 1].cae;
  cmp.punto = cmp.fin + 0.3; // Rufo marca el punto de tiza
});

/* ── Momentos sueltos ── */
export const M = {
  quePaso: W(1, "Qué", 0.8),
  soloUno: W(1, "solo", 0.5),
  tobyLlega: S(2) - 0.25,
  jugo: W(2, "quiere", 0.55),
  saludo: S(3) + 0.15,
  camionVacio: X3 + 0.25,
  monedas: W(6, "cuentas", 0.3) - 0.1,
  ganas: S(8) + 0.1,
  ganasFin: W(8, "Pero", 0.6) - 0.1,
  camionLleno: X5 + 0.2,
  tobyVuelve: W(9, "Toby", 0.65) - 0.75,
  aLaPizarra: S(10) + 0.2,
  ejePrecio: W(10, "precio", 0.6),
  ejeMangos: W(10, "mangos", 0.75),
  linea: W(11, "línea", 0.35) - 0.25,
  nombre: W(12, "ley", 0.65) - 0.1,
  asoma: W(12, "nombre", 0.5),
  sube0: S(13) + 0.1,
  sube: W(13, "sube", 0.2),
  baja: W(13, "baja", 0.5),
  ceteris: W(13, "todo", 0.75) - 0.2,
  quieta: W(14, "curva", 0.2),
  recorre: W(14, "Fue", 0.55),
  cierre: S(15) - 0.25,
  cajas: W(15, "actividad", 0.3) - 0.1,
  optA: W(15, "se", 0.55) - 0.1,
  optB: W(15, "o", 0.78) - 0.05,
  credito: S(15) + 0.2,
};

/* ── Rótulo del día ── */
export const ROTULOS = [
  { t: S(2) - 0.15, txt: "Lunes" },
  { t: S(5) - 0.1, txt: "Martes" },
  { t: S(7) - 0.1, txt: "Miércoles" },
  { t: S(9) - 0.25, txt: "Jueves" },
];
export const ROTULO_FIN = X7;

/* ── Sonido: un efecto por acción ── */
export const SFX = [];
const fx = (t, f, vol = 0.6) => SFX.push({ t, f, vol });
fx(0.12, "burbuja", 0.45);
fx(M.soloUno - 0.05, "toc-grave", 0.7);
fx(M.quePaso, "pop", 0.5);
fx(REBOBINA, "rebobina", 0.55);
fx(M.tobyLlega + 0.1, "pasos", 0.5);
fx(M.jugo, "burbuja", 0.5);
[X2, X3, X4, X5, X6].forEach((x) => fx(x - 0.05, "barrido", 0.4));
fx(M.saludo, "pop-suave", 0.4);
LETRERO.forEach((l, i) => fx(l.t, i === 2 ? "golpe" : "letrero", i === 2 ? 0.75 : 0.6));
COMPRAS.forEach((cmp) => {
  cmp.mangos.forEach((m) => fx(m.cae - 0.03, "toc", 0.6));
  fx(cmp.fin + 0.12, "monedas", 0.45);
  fx(cmp.punto, "tiza", 0.55);
});
fx(M.camionVacio, "camion", 0.5);
fx(M.camionLleno, "camion", 0.5);
fx(M.monedas, "monedas", 0.5);
fx(M.ganas, "burbuja", 0.5);
fx(W(8, "Pero", 0.6) - 0.35, "suspiro", 0.5);
fx(M.tobyVuelve, "pasos", 0.5);
fx(M.aLaPizarra, "barrido-lento", 0.35);
fx(M.ejePrecio, "tiza", 0.4);
fx(M.ejeMangos, "tiza", 0.4);
fx(M.linea, "tiza-larga", 0.65);
fx(M.nombre, "tiza-larga", 0.55);
fx(M.nombre + 0.9, "campana", 0.5);
fx(M.asoma, "pop-suave", 0.4);
fx(M.sube0, "desliza", 0.4);
fx(M.sube, "pop", 0.5);
fx(M.baja, "pop", 0.5);
fx(M.ceteris, "tiza", 0.4);
fx(M.quieta, "toc-grave", 0.55);
fx(M.recorre, "desliza", 0.4);
fx(M.cajas, "tiza", 0.45);
fx(M.optA, "pop", 0.45);
fx(M.optB, "pop", 0.45);
fx(M.cierre + 0.5, "sorbo", 0.5);
fx(E(15) + 0.1, "campana", 0.45);

export { S, E, W, c };
