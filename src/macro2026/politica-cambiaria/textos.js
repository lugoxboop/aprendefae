/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T5 POLÍTICA CAMBIARIA — TODOS LOS TEXTOS, TAL CUAL
 *
 * Fuente única: orquestador/conocimiento/macro-2026/disenos/t5-politica-cambiaria.md
 * (Gen, 22-nov). Ninguna pieza escribe un texto a mano: todo sale de aquí, y
 * la prueba t5-textos-y-bancos.test.mjs cuenta las palabras contra §4 y
 * recalcula las cifras de los casos.
 * tc = pesos por un dólar: tc ↑ ⇒ el peso se deprecia y el dólar se aprecia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─── Subtemas del tema (ficha 5) ─── */
export const SUBTEMAS = {
  "pc-contexto": "Por qué se mueve el dólar",
  "pc-aprecia-deprecia": "Apreciación y depreciación",
  "pc-mercado": "El mercado cambiario: oferta y demanda de divisas",
  "pc-nominal-real": "Tipo de cambio nominal y real",
  "pc-itcr": "Índice de tasa de cambio real (ITCR)",
  "pc-impactos": "A quién le sirve cada movimiento",
  "pc-balanza-pagos": "La balanza de pagos",
  "pc-flujos-capital": "Flujos de capital",
  "pc-objetivos-instrumentos": "Objetivos e instrumentos de la política cambiaria",
  "pc-regimenes": "Regímenes cambiarios",
};

/* ─── Aprender: el texto exacto de cada pantalla (§2) ─── */
export const APRENDER = {
  "pc26-a1-balanza": [
    "Guerras, petróleo o la FED: todo mueve el precio del dólar en pesos.",
    "El tipo de cambio es cuántos pesos das por un dólar.",
    "Si das más pesos por el mismo dólar, el peso perdió valor: se deprecia.",
    "Si das menos pesos, el peso ganó valor: se aprecia. El dólar, al revés.",
    "Cada movimiento tiene dos caras: si uno se aprecia, el otro se deprecia.",
  ],
  "pc26-a2-subasta": [
    "El mercado cambiario reúne a quienes traen dólares y a quienes los necesitan.",
    "Donde se cruzan la oferta y la demanda de dólares, sale el tipo de cambio.",
    "Más dólares llegando: el dólar se abarata y el peso se aprecia.",
    "Más gente pidiendo dólares: el dólar se encarece y el peso se deprecia.",
  ],
  "pc26-a3-nominal-real": [
    "El tipo de cambio nominal es el precio del dólar hoy, en pesos corrientes.",
    "El real ajusta ese precio por las inflaciones de los dos países.",
    "Mueve las tres palancas y mira hacia dónde se va la aguja.",
    "Atajo: Δtcr ≈ (inflación de afuera − inflación de aquí) + variación del nominal.",
    "Positivo: devaluación real, el exportador gana. Negativo: revaluación real, pierde.",
    "El ITCR lo calcula con índices: mayor que 1, devaluación real; menor, revaluación.",
  ],
  "pc26-a4-banano": [
    "Tropical Fruits vende banano a US Foods. Producir una tonelada cuesta $2.127.250.",
    "Con el dólar a $3.175, ese costo son USD 670: justo el precio de mercado.",
    "Pasa un año: inflación aquí 5 %, allá 1,5 %. El dólar sube 1,5 %.",
    "¿US Foods le sigue comprando? Apuesta.",
    "Si el dólar sube 5 %, el precio necesario baja a USD 670: vuelve a vender.",
    "Un dólar más caro no basta: importa cuánto sube frente a las dos inflaciones.",
  ],
  "pc26-a5-tuberias": [
    "La balanza de pagos anota todo lo que el país transa con el exterior.",
    "Cuenta corriente: bienes, servicios y transferencias.",
    "Cuenta de capital: inversión extranjera y deuda externa.",
    "La IED se queda produciendo. El capital golondrina entra y sale buscando rendimiento.",
    "BP = X(tc) − M(tc, Y) + F(i). Lo que entra y sale mueve el dólar.",
    "El saldo final cambia las reservas internacionales del país.",
  ],
  "pc26-a6-imanes": [
    "El capital va adonde gana más, con menos riesgo.",
    "Una tasa de interés más alta atrae capital.",
    "Más riesgo lo espanta.",
    "Y el movimiento del tipo de cambio puede borrar la ganancia de la tasa.",
    "Ahorras $600 millones un año: 9 % aquí o 4 % en EE. UU.",
    "Pero si el peso se devalúa 12 %, el ahorro de afuera vale $698,9 millones.",
    "Regla práctica: lo que rinde afuera ≈ la tasa de allá + la devaluación del peso.",
  ],
  "pc26-a7-correa": [
    "El BanRep busca estabilidad cambiaria y equilibrio en la balanza de pagos.",
    "Su herramienta principal: comprar o vender dólares en el mercado.",
    "Comprar dólares sube su precio y suma reservas. Vender hace lo contrario.",
    "El régimen cambiario es la forma de llevar al dólar. Como pasear un perro.",
    "Fijo: atado a un poste. Bolivia: 6,96 bolivianos por dólar.",
    "Banda: correa de largo limitado. Colombia la usó de 1990 a 1999.",
    "Gota a gota: sube a paso fijo por una rampa anunciada.",
    "Flexible: suelto, lo mueve el mercado. Si el BanRep a veces jala, es flotación sucia.",
    "Otros instrumentos: controles cambiarios y tipos de cambio diferenciales.",
  ],
};
/* §4: el conteo que declara Gen, pantalla por pantalla. */
export const CONTEO_APRENDER = {
  "pc26-a1-balanza": [13, 10, 14, 13, 13],
  "pc26-a2-subasta": [13, 14, 11, 12],
  "pc26-a3-nominal-real": [14, 11, 11, 12, 11, 13],
  "pc26-a4-banano": [12, 14, 12, 6, 15, 13],
  "pc26-a5-tuberias": [13, 6, 8, 13, 14, 9],
  "pc26-a6-imanes": [9, 7, 4, 13, 12, 14, 14],
  "pc26-a7-correa": [12, 10, 12, 13, 10, 12, 11, 16, 9],
};

/* ─── A1 · La balanza del dólar ─── */
export const A1 = {
  noticias: [
    { id: "pandemia", texto: "Pandemia", empuje: 6 },
    { id: "guerras", texto: "Guerras", empuje: 5 },
    { id: "fed", texto: "La FED", empuje: -4 },
    { id: "petroleo", texto: "Petróleo", empuje: -6 },
  ],
  base: 4000,
  min: 3500,
  max: 5000,
  paso: 50,
  deprecia: 4500,
  aprecia: 3800,
  tc: "Tipo de cambio",
  pilas: "pesos de $100",
  pesoDeprecia: "el peso se deprecia (se devalúa)",
  dolarAprecia: "el dólar se aprecia (se revalúa)",
  pesoAprecia: "el peso se aprecia (se revalúa)",
  dolarDeprecia: "el dólar se deprecia (se devalúa)",
  espejos: [["peso ↓", "dólar ↑"], ["peso ↑", "dólar ↓"]],
};

/* ─── H1 · ¿Quién se apreció? ─── */
export const PARTIDA_H1 = 5;
export const BANCO_H1 = [
  { id: "q1", a: 4000, b: 4500 },
  { id: "q2", a: 4000, b: 3800 },
  { id: "q3", a: 4329.9, b: 4100 },
  { id: "q4", a: 3175, b: 3333.75 },
  { id: "q5", a: 3757, b: 4208 },
  { id: "q6", a: 3757, b: 3171 },
].map((q) => ({
  ...q,
  correctas: q.b > q.a ? { peso: "deprecia", dolar: "aprecia" } : { peso: "aprecia", dolar: "deprecia" },
  subtemas: ["pc-aprecia-deprecia"],
}));
export const H1 = {
  peso: "Peso",
  dolar: "Dólar",
  aprecia: "se aprecia",
  deprecia: "se deprecia",
  revisar: "Revisar",
  siguiente: "Siguiente",
  terminar: "Terminar",
};
/** Las retros de §2 H1 con las cifras del ítem. `fmt` da 4.329,90 o 4.000. */
export function retroH1(q, moneda, fmt) {
  const sube = q.b > q.a;
  if (moneda === "peso") {
    return sube
      ? `De ${fmt(q.a)} a ${fmt(q.b)}: das ${fmt(q.b - q.a)} pesos más por dólar. El peso vale menos.`
      : `De ${fmt(q.a)} a ${fmt(q.b)}: das ${fmt(q.a - q.b)} pesos menos. El peso vale más.`;
  }
  return sube ? "El dólar ahora compra más pesos: se aprecia." : "El dólar ahora compra menos pesos: se deprecia.";
}

/* ─── A2 · La subasta de dólares ─── */
/* Los personajes son mascotas (nunca personas); cada uno lleva su rol escrito. */
export const FILAS_A2 = {
  oferta: [
    { id: "exportador", mascota: "exportadora-flores", pose: "avion", rol: "Exportadora" },
    { id: "inversionista", mascota: "inversionista", pose: "monedas", rol: "Inversionista extranjero" },
    { id: "credito", mascota: "deudor-externo", pose: "sobre", rol: "Trae un crédito de afuera" },
  ],
  demanda: [
    { id: "importador", mascota: "importadora-celulares", pose: "contenedor", rol: "Importadora" },
    { id: "viajero", mascota: "viajero", pose: "maleta", rol: "Viajero" },
    { id: "deuda", mascota: "deudor-externo", pose: "monedas", rol: "Paga deuda externa" },
  ],
};
export const A2 = {
  trae: "Trae dólares",
  pide: "Pide dólares",
  oferta: "Od",
  demanda: "Dd",
  ejeTc: "tc",
  ejeQ: "Dólares",
  llegan: "Llegan inversionistas",
  importamos: "Importamos más",
  filaOferta: "Traen dólares",
  filaDemanda: "Piden dólares",
};
/*
 * El modelo de la gráfica (criterio del constructor, construccion-t5.md):
 * Od: tc = 3.000 + 20·(Q − so) · Dd: tc = 5.000 − 20·(Q − sd), Q en miles de
 * millones de dólares, so y sd los corrimientos a la derecha.
 * Cruce: Q = 50 + (so + sd)/2 · tc = 4.000 + 10·(sd − so).
 */
export const MODELO_DIVISAS = Object.freeze({ o0: 3000, d0: 5000, m: 20, corre: 15 });
export const equilibrioDivisas = (so = 0, sd = 0) => ({ Q: 50 + (so + sd) / 2, tc: 4000 + 10 * (sd - so) });

/* ─── H2 · Empuja la curva ─── */
export const PARTIDA_H2 = 6;
const suceso = (id, texto, curva, direccion, retroCurva, retroDireccion, causa, subtemas = ["pc-mercado"]) => ({
  id, texto, curva, direccion, retroCurva, retroDireccion, causa, subtemas,
  tc: (curva === "oferta") === (direccion === "derecha") ? "baja" : "sube",
});
export const BANCO_H2 = [
  suceso("inversionistas", "Llegan inversionistas extranjeros a comprar empresas colombianas.", "oferta", "derecha",
    "Ellos traen dólares: cambia la oferta.", "Llegan más dólares: la oferta crece.",
    { mascota: "inversionista", pose: "ladrillo" }, ["pc-mercado", "pc-flujos-capital"]),
  suceso("importadores", "Los importadores compran más mercancía afuera.", "demanda", "derecha",
    "Ellos necesitan dólares: cambia la demanda.", "Piden más dólares: la demanda crece.",
    { mascota: "importadora-celulares", pose: "contenedor" }),
  suceso("petroleo", "Sube el precio del petróleo que vende Colombia.", "oferta", "derecha",
    "Las exportaciones traen dólares: oferta.", "Más dólares por cada barril: la oferta crece.",
    { objeto: "barco", nombre: "Exportaciones de petróleo" }),
  suceso("deuda", "Empresas colombianas pagan su deuda externa.", "demanda", "derecha",
    "Para pagar afuera necesitan dólares: demanda.", "Compran más dólares: la demanda crece.",
    { mascota: "deudor-externo", pose: "monedas" }, ["pc-mercado", "pc-flujos-capital"]),
  suceso("banrep-compra", "El BanRep compra dólares en el mercado.", "demanda", "derecha",
    "El BanRep compra: se suma a la demanda.", "Un comprador más: la demanda crece y el dólar sube.",
    { mascota: "autoridad-economica", pose: "carpeta", nombre: "Banco de la República" }, ["pc-mercado", "pc-objetivos-instrumentos"]),
  suceso("banrep-vende", "El BanRep vende dólares de sus reservas.", "oferta", "derecha",
    "El BanRep vende: se suma a la oferta.", "Más dólares a la venta: la oferta crece.",
    { mascota: "autoridad-economica", pose: "grifo", nombre: "Banco de la República" }, ["pc-mercado", "pc-objetivos-instrumentos"]),
  suceso("cafe", "Caen las exportaciones de café.", "oferta", "izquierda",
    "El café trae dólares: cambia la oferta.", "Menos exportaciones, menos dólares: la oferta cae.",
    { objeto: "avion-carga", nombre: "Exportaciones de café" }),
  suceso("viajes", "Los colombianos viajan menos al exterior.", "demanda", "izquierda",
    "Los viajeros piden dólares: cambia la demanda.", "Menos viajes, menos dólares pedidos: la demanda cae.",
    { mascota: "viajero", pose: "avion" }),
];
export const H2 = {
  revelar: "Revelar",
  siguiente: "Siguiente suceso",
  terminar: "Terminar",
  oferta: "Oferta de dólares",
  demanda: "Demanda de dólares",
  tcSube: "el tc sube",
  tcBaja: "el tc baja",
};

/* ─── A3 · Nominal no es real ─── */
export const A3 = {
  cartel: "$4.329,90 · 16 de abril de 2025",
  aqui: "Inflación de aquí",
  afuera: "Inflación de afuera",
  nominal: "Variación del nominal",
  zonas: { revaluacion: "Revaluación real", equilibrio: "Equilibrio", devaluacion: "Devaluación real" },
  gana: "El exportador gana",
  pierde: "El exportador pierde",
  igual: "El exportador queda igual",
  itcr: "ITCR",
  inicial: { afuera: 2, aqui: 4, nominal: 3 },
};
/** Atajo de Gen: Δtcr ≈ (afuera − aquí) + nominal, en puntos porcentuales. */
export const deltaTcr = ({ afuera, aqui, nominal }) => afuera - aqui + nominal;
/** ITCR = (1 + Δtcn)(1 + ΔPx)/(1 + ΔPn), con las variaciones en %. */
export const itcr = ({ afuera, aqui, nominal }) => ((1 + nominal / 100) * (1 + afuera / 100)) / (1 + aqui / 100);
/** La zona de la aguja: un margen de ±0,25 puntos cuenta como equilibrio. */
export const zonaDe = (d) => (d > 0.25 ? "devaluacion" : d < -0.25 ? "revaluacion" : "equilibrio");

/* ─── A4 · La tonelada de banano (d. 12; cifras verificadas en la prueba) ─── */
export const BANANO = Object.freeze({
  costo: 2127250, tc: 3175, usd: 670, inflAqui: 5, inflAlla: 1.5, subeBajo: 1.5, subeAlto: 5,
  necesarioBajo: 693.1, mercado: 680.05, necesarioAlto: 670.0, itcrBajo: 0.981, itcrAlto: 1.015,
});
export const A4 = {
  vendedor: "Tropical Fruits",
  comprador: "US Foods",
  tonelada: "1 tonelada",
  gondola: "Góndola en EE. UU.",
  necesario: "Precio necesario",
  mercado: "Precio de mercado",
  pasaAnio: "Pasa un año",
  aquiCo: "Colombia",
  allaUs: "EE. UU.",
  dolar: "Dólar",
  si: "Sí le compra",
  no: "No le compra",
  retroSi: "Su precio quedó por encima del de mercado.",
  retroNo: "Eso: los costos subieron más que el dólar.",
  sube5: "El dólar sube 5 %",
};

/* ─── H3 · La aguja del real ─── */
export const PARTIDA_H3 = 4;
const ronda = (id, afuera, aqui, nominal, exportador, nota = null) => ({
  id, afuera, aqui, nominal, nota, exportador, subtemas: ["pc-itcr", "pc-nominal-real"],
  delta: afuera - aqui + nominal, itcr: Math.round(itcr({ afuera, aqui, nominal }) * 1000) / 1000,
});
export const BANCO_H3 = [
  ronda("r1", 1.5, 5, 6, "gana"),
  ronda("r2", 1.5, 5, 2, "pierde"),
  ronda("r3", 1.5, 5, 1.5, "pierde", "banano"),
  ronda("r4", 1.5, 5, 5, "gana", "banano"),
  ronda("r5", 5, 7, 6, "gana", "calzado · Brasil"),
  ronda("r6", 3, 3, 0, "igual"),
];
export const TOLERANCIA_H3 = 0.5;
export const H3 = {
  afuera: "Afuera",
  aqui: "Aquí",
  nominal: "Nominal",
  exportador: "El exportador colombiano",
  opciones: { gana: "Gana", pierde: "Pierde", igual: "Igual" },
  arrastra: "Arrastra la aguja",
  revisar: "Revisar",
  siguiente: "Siguiente ronda",
  terminar: "Terminar",
  retroSigno: "Es inflación de afuera MENOS la de aquí, y luego el nominal.",
  retroNominal: "Falta sumar la variación del nominal.",
  retroOtro: (r) => `Revisa la suma: (afuera − aquí) + nominal = ${r}.`,
  retroExportador: {
    gana: "Devaluación real: lo nuestro sale más barato afuera. Gana.",
    pierde: "Revaluación real: lo nuestro se encarece afuera. Pierde.",
    igual: "Sin cambio real, su competitividad queda igual.",
  },
};
/** Diagnostica la aguja (§2 H3): bien, signo invertido, olvidó el nominal u otro. */
export function juzgarAguja(r, valor) {
  if (Math.abs(valor - r.delta) <= TOLERANCIA_H3) return "bien";
  if (Math.abs(valor - (r.aqui - r.afuera + r.nominal)) <= TOLERANCIA_H3) return "signo";
  if (Math.abs(valor - (r.afuera - r.aqui)) <= TOLERANCIA_H3) return "nominal";
  return "otro";
}

/* ─── H4 · ¿A quién le sirve? ─── */
export const PARTIDA_H4 = 6;
const noticia = (id, texto, gana, retro, extra = []) => ({ id, texto, gana, retro, subtemas: ["pc-impactos", ...extra] });
export const BANCO_H4 = [
  noticia("devalua", "El peso se devalúa 10 %.", "exportadora", "Cada dólar que vende le da más pesos."),
  noticia("revalua", "El peso se revalúa 8 %.", "importadora", "Con peso fuerte, los celulares de afuera salen más baratos."),
  noticia("itcr-104", "Devaluación real: el ITCR pasa a 1,04.", "exportadora", "ITCR mayor que 1: lo nuestro se abarata afuera.", ["pc-nominal-real"]),
  noticia("itcr-098", "Revaluación real: el ITCR queda en 0,98.", "importadora", "ITCR menor que 1: lo importado se abarata aquí.", ["pc-nominal-real"]),
  noticia("baja-3800", "El dólar baja de $4.000 a $3.800.", "importadora", "Necesita menos pesos para pagar cada dólar."),
  noticia("sube-4500", "El dólar sube de $4.000 a $4.500.", "exportadora", "Recibe 500 pesos más por cada dólar vendido."),
  noticia("inflacion-co", "Sube la inflación en Colombia y el dólar no se mueve.", "importadora", "Inflación aquí sin dólar más caro: revaluación real.", ["pc-nominal-real"]),
  noticia("inflacion-us", "Sube la inflación en EE. UU. y el dólar no se mueve.", "exportadora", "Afuera todo sube y lo nuestro no: devaluación real.", ["pc-nominal-real"]),
];
export const H4 = {
  exportadora: "Exportadora de flores",
  importadora: "Importadora de celulares",
  panuelo: "Pañuelo: arrástralo hacia quien gana, o toca a quien gana.",
  siguiente: "Siguiente noticia",
  terminar: "Terminar",
};

/* ─── A5 · Dos tuberías ─── */
export const A5 = {
  pais: "El país",
  exterior: "Exterior",
  corriente: "Cuenta corriente",
  capital: "Cuenta de capital",
  reservas: "Reservas internacionales",
  bienes: "Bienes",
  servicios: "Servicios",
  transferencias: "Transferencias",
  inversion: "Inversión",
  prestamos: "Préstamos",
  ied: "IED",
  golondrina: "Capital golondrina",
  trimestre: "Pasa un trimestre",
  terminos: [
    { id: "X", texto: "X(tc)", tuberia: "corriente", nombre: "Exportaciones" },
    { id: "M", texto: "− M(tc, Y)", tuberia: "corriente", nombre: "Importaciones" },
    { id: "F", texto: "+ F(i)", tuberia: "capital", nombre: "Flujo de capital" },
  ],
  positivo: "Saldo positivo",
  negativo: "Saldo negativo",
};

/* ─── A6 · Imanes de capital (d. 22; cifras verificadas en la prueba) ─── */
export const AHORRO = Object.freeze({ monto: 600, tc: 3757, aqui: 9, alla: 4, revalua: 15.61, devalua: 12 });
export const CREDITO = Object.freeze({ monto: 1000, tc: 3175, aqui: 15, alla: 8, revalua: 15.61, devalua: 12 });
/** Lo que vale afuera, en millones de pesos, al volver: monto·(1 + tasa)·(1 + Δtc). */
export const afuera = (caso, dtc = 0) => caso.monto * (1 + caso.alla / 100) * (1 + dtc / 100);
export const aqui = (caso) => caso.monto * (1 + caso.aqui / 100);
export const A6 = {
  colombia: "Colombia",
  eeuu: "EE. UU.",
  tasaAqui: "Tasa aquí",
  tasaAlla: "Tasa allá",
  riesgo: "Sube el riesgo",
  aquiBtn: "Aquí",
  afueraBtn: "Afuera",
  retroAqui: "Eso: 9 % le gana a 4 % si el dólar no se mueve.",
  retroAfuera: "Si el dólar no cambia, 9 % le gana a 4 %.",
  regla: ["Tasa de allá", "Devaluación del peso", "Lo que rinde afuera"],
  millones: "millones",
};

/* ─── H5 · ¿Aquí o afuera? ─── */
const decision = (id, caso, consigna, dtc, correcta, retro) => ({ id, caso, consigna, dtc, correcta, retro, subtemas: ["pc-flujos-capital"] });
export const CASOS_H5 = [
  {
    id: "ahorro", titulo: "Ahorro de $600 millones", datos: "tc $3.757 · 9 % aquí · 4 % allá",
    cierre: "El capital se va afuera cuando se espera devaluación.",
    decisiones: [
      decision("d1", "ahorro", "Sin cambios en el dólar: ¿dónde ahorras?", 0, "aqui", "Con el dólar quieto, 9 % le gana a 4 %."),
      decision("d2", "ahorro", "El peso se revalúa 15,61 %. ¿Dónde ahorras?", -15.61, "aqui", "Con peso fuerte, tus dólares valen menos pesos al volver."),
      decision("d3", "ahorro", "El peso se devalúa 12 %. ¿Dónde ahorras?", 12, "afuera", "La devaluación suma: afuera rinde cerca de 16,5 %."),
    ],
  },
  {
    id: "credito", titulo: "Crédito de $1.000 millones", datos: "tc $3.175 · 15 % aquí · 8 % allá",
    cierre: "Endeudarse en dólares es apostar a que el peso no se devalúe.",
    decisiones: [
      decision("d4", "credito", "Sin cambios en el dólar: ¿dónde te prestas?", 0, "afuera", "Con el dólar quieto, 8 % cuesta menos que 15 %."),
      decision("d5", "credito", "El peso se revalúa 15,61 %. ¿Dónde te prestas?", -15.61, "afuera", "Peso fuerte: necesitas menos pesos para pagar los dólares."),
      decision("d6", "credito", "El peso se devalúa 12 %. ¿Dónde te prestas?", 12, "aqui", "Con devaluación, la deuda en dólares sale más cara: cerca de 21 %."),
    ],
  },
];
export const H5 = {
  aqui: "Aquí",
  afuera: "Afuera",
  siguiente: "Siguiente",
  siguienteCaso: "Siguiente caso",
  terminar: "Terminar",
  recibes: "Recibes",
  pagas: "Pagas",
};

/* ─── A7 · La correa del dólar ─── */
export const REGIMENES = [
  { id: "fijo", nombre: "Fijo" },
  { id: "banda", nombre: "Banda" },
  { id: "gota", nombre: "Gota a gota" },
  { id: "flexible", nombre: "Flexible" },
];
export const A7 = {
  estabilidad: "Estabilidad cambiaria",
  equilibrio: "Balanza de pagos en cero",
  compra: "Compra dólares",
  vende: "Vende dólares",
  reservas: "Reservas",
  perro: "El perro: el tipo de cambio",
  dueno: "El dueño: el BanRep",
  bolivia: "6,96 bolivianos por dólar",
  techo: "Techo",
  piso: "Piso",
  otraVez: "Otra vez",
  sucia: "Flotación sucia",
  controles: "Controles cambiarios",
  diferenciales: "Tipos de cambio diferenciales",
};

/* ─── H6 · Cada hecho a su correa ─── */
export const PARTIDA_H6 = 6;
export const BANCO_H6 = [
  { id: "bolivia", texto: "Bolivia mantiene 6,96 bolivianos por dólar.", regimen: "fijo" },
  { id: "colombia-90", texto: "En Colombia, de 1990 a 1999, el dólar se movía entre un techo y un piso.", regimen: "banda" },
  { id: "anuncia", texto: "Se anuncia una devaluación anual y se aplica en pequeñas dosis continuas.", regimen: "gota" },
  { id: "colombia-99", texto: "Desde 1999, en Colombia el precio del dólar lo pone el mercado.", regimen: "flexible" },
  { id: "paridad", texto: "El banco central defiende una sola paridad.", regimen: "fijo" },
  { id: "limite", texto: "El banco central interviene cuando el dólar toca un límite.", regimen: "banda" },
  { id: "sucia", texto: "Manda el mercado, pero el banco central a veces compra o vende.", regimen: "flexible" },
  { id: "mini", texto: "Mini-devaluaciones continuas, a un ritmo conocido.", regimen: "gota" },
].map((h) => ({ ...h, subtemas: ["pc-regimenes"] }));
/* Retro por par (verdadero → elegido), §2 H6. */
export const RETRO_H6 = {
  fijo: { banda: "No hay corredor: es una sola paridad.", gota: "No sube a paso fijo: no se mueve.", flexible: "El mercado no lo mueve: está atado." },
  banda: { fijo: "Se mueve, pero entre techo y piso.", gota: "No sube a ritmo fijo: flota dentro del corredor.", flexible: "Tiene límites que el banco defiende." },
  gota: { fijo: "Sí se mueve: un poco cada día.", banda: "No hay techo ni piso: hay un ritmo anunciado.", flexible: "El ritmo lo anuncia el banco, no el mercado." },
  flexible: { fijo: "No hay paridad que defender: manda el mercado.", banda: "No hay corredor: flota libre.", gota: "No hay ritmo anunciado: lo pone el mercado." },
};
export const H6 = { siguiente: "Siguiente hecho", terminar: "Terminar" };

/* ─── Consignas de las Hacer (≤ 12 palabras) ─── */
export const CONSIGNAS = {
  "pc26-h1-quien-aprecia": "Marca qué le pasó al peso y qué al dólar.",
  "pc26-h2-empuja-curva": "Empuja la curva que cambia, hacia donde crees.",
  "pc26-h3-aguja": "Lleva la aguja al cambio real y di quién gana.",
  "pc26-h4-a-quien-sirve": "Tira la cuerda hacia quien sale ganando.",
  /* H5 no tiene consigna general: cada decisión trae la suya (§2 H5); arranca con la primera. */
  "pc26-h5-donde-ahorro": "Sin cambios en el dólar: ¿dónde ahorras?",
  "pc26-h6-correa": "Arrastra cada hecho al régimen que describe.",
};
