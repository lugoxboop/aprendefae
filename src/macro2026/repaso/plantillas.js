/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL REPASO DIARIO — LAS CONSULTAS (diseño de Gen, 24-nov)
 *
 * «La ronda del economista»: el estudiante es el economista de guardia y
 * atiende diez consultas de los cinco lugares de la materia (plaza, despacho,
 * hacienda, bóveda y puerto). Cada consulta es una PLANTILLA: sus datos (las
 * cifras, la noticia, las medidas) se sortean en cada intento, así que la
 * misma pregunta nunca sale igual dos veces.
 *
 * Cada plantilla cumple la lista de 5 (checklist-actividad.md):
 *   escena   fondo del tema + mascota protagonista + TU PAPEL (≤ 15 palabras)
 *            + contexto (≤ 30 palabras), antes de la pregunta;
 *   consigna ≤ 12 palabras;
 *   mecánica una de seis (calcular, curva, bandejas, ordenar, pareja,
 *            factura); solo «factura» es selección de opciones (1 de 14);
 *   retro    texto propio por opción, ficha o error (≤ 15 palabras).
 * Todo sale de las fichas del profesor (orquestador/conocimiento/macro-2026/
 * fichas/1..5). Las pruebas (repaso.test.mjs) miden palabras y respuestas
 * con cientos de semillas.
 *
 * `actividad`: la Hacer publicada que trabaja lo mismo; con ella el panel
 * docente sabe de qué pieza sale el ítem. `nivel` (1 a 3) ordena la ronda de
 * menos a más.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { fmtEntero } from "../comun/modelo-da.js";

/* ─── Azar ─────────────────────────────────────────────────────────────── */
const uno = (lista, rng) => lista[Math.floor(rng() * lista.length)];
function barajar(lista, rng) {
  const a = [...lista];
  for (let k = a.length - 1; k > 0; k -= 1) {
    const j = Math.floor(rng() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}
/** Una permutación que nunca sale ya ordenada (para ordenar). */
function revolver(lista, rng) {
  let o = barajar(lista, rng);
  for (let k = 0; k < 6 && o.every((x, i) => x === lista[i]); k += 1) o = barajar(lista, rng);
  if (o.every((x, i) => x === lista[i])) o = [...o.slice(1), o[0]];
  return o;
}

/* ─── Formato ──────────────────────────────────────────────────────────── */
export const pesos = (x) => `$${fmtEntero(x)}`;
const coma = (x) => String(Math.round(x * 100) / 100).replace(".", ",");
const pct = (x) => `${coma(x)}\u00a0%`;
const conSigno = (x) => (x > 0 ? `+${coma(x)}` : x < 0 ? `−${coma(-x)}` : "0");

/* ─── Los cinco lugares ────────────────────────────────────────────────── */
export const TEMAS_REPASO = [
  { id: "demanda-agregada", corto: "T1", nombre: "Demanda agregada", escena: "plaza" },
  { id: "politica-economica", corto: "T2", nombre: "Política económica", escena: "despacho" },
  { id: "politica-fiscal", corto: "T3", nombre: "Política fiscal", escena: "hacienda" },
  { id: "politica-monetaria", corto: "T4", nombre: "Política monetaria", escena: "boveda" },
  { id: "politica-cambiaria", corto: "T5", nombre: "Política cambiaria", escena: "puerto" },
];
export const temaRepaso = (id) => TEMAS_REPASO.find((t) => t.id === id);

const escena = (tema, hora, lado, mascota, rol, contexto) => ({
  tema: temaRepaso(tema).escena, hora, lado, mascota, rol, contexto,
});

/* ═══════════════════════ T1 · DEMANDA AGREGADA ═══════════════════════ */

/* El multiplicador: c y t que dan un multiplicador limpio. */
const COMBOS_MULT = [
  { c: 0.5, t: 0 }, { c: 0.75, t: 0 }, { c: 0.8, t: 0 }, { c: 0.6, t: 0 },
  { c: 0.8, t: 0.25 }, { c: 0.75, t: 0.2 }, { c: 0.75, t: 1 / 3 },
];
const centavos = (c) => Math.round(c * 100);

function daMultiplicador(rng) {
  const { c, t } = uno(COMBOS_MULT, rng);
  const dG = uno([10, 20, 40], rng);
  const ronda = c * (1 - t);
  const k = 1 / (1 - ronda);
  const correcta = Math.round(k * dG * 10) / 10;
  const sinT = t > 0 ? Math.round((dG / (1 - c)) * 10) / 10 : null;
  const contexto = t > 0
    ? `El Gobierno gastará ${dG} mil millones más en vías. De cada peso disponible, las familias consumen ${centavos(c)} centavos. Impuesto de renta: ${pct(t * 100)}.`
    : `El Gobierno gastará ${dG} mil millones más en vías. De cada peso extra, las familias consumen ${centavos(c)} centavos.`;
  return {
    mecanica: "calcular",
    figura: "ecos",
    escena: escena("demanda-agregada", "dia", "izq", { id: "analista", pose: "libreta" },
      "Te contratan como economista asesor del alcalde.", contexto),
    consigna: "¿Cuánto sube la producción en total?",
    min: 0, max: dG * 6, paso: dG / 2, inicio: 0,
    unidad: "mil millones",
    formato: (v) => `${coma(v)} mil millones`,
    correcta,
    datos: { dG, ronda, k },
    evaluar(v) {
      if (Math.abs(v - correcta) < 1e-6) return { ok: true, retro: `Multiplicador ${coma(k)}: ${dG} × ${coma(k)} = ${coma(correcta)}. Cada ronda de consumo suma.` };
      if (Math.abs(v - dG) < 1e-6) return { ok: false, retro: "Ese es solo el primer gasto; faltan las rondas de consumo." };
      if (sinT != null && Math.abs(v - sinT) < 1e-6) return { ok: false, retro: `Olvidaste el impuesto: cada ronda es c(1 − t) = ${coma(ronda)}.` };
      if (v < correcta) return { ok: false, retro: `Te quedaste corto: el multiplicador es 1 / (1 − ${coma(ronda)}) = ${coma(k)}.` };
      return { ok: false, retro: `Te pasaste: cada ronda gasta ${coma(ronda)} de la anterior. Multiplicador ${coma(k)}.` };
    },
  };
}

/* La curva de DA: qué noticia la gira y cuál la desplaza (ficha 1, G7). */
export const MOVIMIENTOS = [
  { id: "sube", nombre: "Sube entera", tipo: "desplaza" },
  { id: "baja", nombre: "Baja entera", tipo: "desplaza" },
  { id: "empina", nombre: "Se empina", tipo: "gira" },
  { id: "aplana", nombre: "Se aplana", tipo: "gira" },
];
const CAUSAS_CURVA = [
  { id: "sube-g", noticia: "el Gobierno sube el gasto en vías", correcta: "sube", por: "Sube Ḡ, que está en el gasto autónomo: la curva sube paralela." },
  { id: "sube-tr", noticia: "el Gobierno sube los subsidios a las familias", correcta: "sube", por: "Más transferencias suben el gasto autónomo: la curva sube paralela." },
  { id: "baja-i", noticia: "el Banco de la República baja la tasa de interés", correcta: "sube", por: "Tasa menor, −bi más pequeño: el intercepto sube y la curva también." },
  { id: "sube-i", noticia: "el Banco de la República sube la tasa de interés", correcta: "baja", por: "Tasa mayor, −bi más grande: el intercepto baja y la curva también." },
  { id: "incertidumbre", noticia: "crece la incertidumbre y las empresas frenan proyectos", correcta: "baja", por: "Cae la inversión autónoma Ī: la curva baja paralela." },
  { id: "sube-c", noticia: "las familias gastan más de cada peso extra", correcta: "empina", por: "Sube c, la pendiente c(1 − t) crece: la curva se empina." },
  { id: "baja-ahorro", noticia: "baja la propensión a ahorrar de las familias", correcta: "empina", por: "Menos ahorro es más c: la pendiente crece y la curva se empina." },
  { id: "sube-t", noticia: "el Congreso sube el impuesto de renta", correcta: "aplana", por: "Sube t, la pendiente c(1 − t) baja: la curva se aplana." },
  { id: "baja-c", noticia: "las familias ahorran más de cada peso extra", correcta: "aplana", por: "Baja c, la pendiente c(1 − t) baja: la curva se aplana." },
];
const tipoDe = (mov) => MOVIMIENTOS.find((m) => m.id === mov).tipo;
const DIRECCION = { sube: "sube", baja: "baja", empina: "se empina", aplana: "se aplana" };

function retroCurva(causa, elegida) {
  if (elegida === causa.correcta) return causa.por;
  if (tipoDe(elegida) !== tipoDe(causa.correcta)) {
    return tipoDe(causa.correcta) === "gira"
      ? "Esto cambia la pendiente c(1 − t): la curva gira, no se desplaza."
      : "Esto cambia el intercepto (Ā − bi): la curva se desplaza, no gira.";
  }
  return `Va al revés: con esta noticia la curva ${DIRECCION[causa.correcta]}.`;
}

function daCurva(rng) {
  const causa = uno(CAUSAS_CURVA, rng);
  const noticia = causa.noticia[0].toUpperCase() + causa.noticia.slice(1);
  return {
    mecanica: "curva",
    escena: escena("demanda-agregada", "tarde", "der", { id: "empresario", pose: "periodico" },
      "Te contratan como asesor del empresario confundido.",
      "El empresario leyó la noticia de hoy en el periódico y no entiende qué le pasa a la demanda agregada."),
    consigna: "¿Cómo se mueve la curva de DA?",
    noticia,
    causa: causa.id,
    opciones: MOVIMIENTOS.map((m) => ({ id: m.id, texto: m.nombre, retro: retroCurva(causa, m.id) })),
    correcta: causa.correcta,
  };
}

/* Los gastos del carrito: cada uno a su componente (ficha 1, da-componentes). */
const GASTOS = [
  { id: "mercado", texto: "Una familia hace el mercado del mes", comp: "C", valor: 70, por: "Es consumo: gasto de los hogares." },
  { id: "matricula", texto: "Un hogar paga la matrícula universitaria", comp: "C", valor: 60, por: "Es consumo: lo paga un hogar." },
  { id: "maquinaria", texto: "Una fábrica compra maquinaria nueva", comp: "I", valor: 60, por: "Es inversión: una empresa compra bienes de capital." },
  { id: "inventario", texto: "Una tienda llena su bodega de inventario", comp: "I", valor: 50, por: "Es inversión: los inventarios cuentan como inversión privada." },
  { id: "hospital", texto: "El Gobierno construye un hospital", comp: "G", valor: 70, por: "Es gasto público: lo compra el Gobierno." },
  { id: "vacunas", texto: "El Gobierno compra vacunas", comp: "G", valor: 50, por: "Es gasto público: compras del Gobierno." },
  { id: "flores", texto: "Colombia vende flores a Estados Unidos", comp: "XN", valor: 50, por: "Es exportación: suma en las exportaciones netas (X − M)." },
  { id: "celulares", texto: "Colombia compra celulares a China", comp: "XN", valor: -40, por: "Es importación: resta en las exportaciones netas (X − M)." },
];
export const COMPONENTES_DA = [
  { id: "C", nombre: "Consumo" }, { id: "I", nombre: "Inversión" },
  { id: "G", nombre: "Gasto público" }, { id: "XN", nombre: "Exportaciones netas" },
];
const nombreComp = (id) => COMPONENTES_DA.find((c) => c.id === id).nombre;

function daCarrito(rng) {
  const comps = barajar(["C", "I", "G", "XN"], rng).slice(0, 3);
  const fichas = comps.map((comp) => {
    const g = uno(GASTOS.filter((x) => x.comp === comp), rng);
    return { id: g.id, texto: g.texto, correcta: comp, valor: g.valor, retro: (b) => (b === comp ? g.por : `No va a ${nombreComp(b).toLowerCase()}. ${g.por}`) };
  });
  return {
    mecanica: "bandejas",
    figura: "carrito",
    escena: escena("demanda-agregada", "manana", "izq", { id: "familia", pose: "mercado" },
      "Te contratan como contador de la demanda agregada.",
      "Hoy pasaron tres gastos en la economía. Cada uno entra a la DA por un componente distinto."),
    consigna: "Lleva cada gasto a su componente de la DA.",
    bandejas: COMPONENTES_DA,
    fichas: barajar(fichas, rng),
  };
}

/* ═══════════════════════ T2 · POLÍTICA ECONÓMICA ═══════════════════════ */

const MEDIDAS_RAMA = [
  { id: "baja-iva", texto: "Bajar el IVA", rama: "fiscal" },
  { id: "gasto-vias", texto: "Subir el gasto en vías", rama: "fiscal" },
  { id: "recorta-subsidios", texto: "Recortar subsidios a hogares", rama: "fiscal" },
  { id: "sube-tasa", texto: "Subir la tasa de interés de referencia", rama: "monetaria" },
  { id: "vende-tes", texto: "Vender TES en el mercado abierto", rama: "monetaria" },
  { id: "baja-encaje", texto: "Bajar el encaje bancario", rama: "monetaria" },
  { id: "compra-dolares", texto: "Comprar dólares en el mercado cambiario", rama: "cambiaria" },
  { id: "regimen", texto: "Pasar de banda a tipo de cambio flexible", rama: "cambiaria" },
  { id: "sube-arancel", texto: "Subir aranceles a las importaciones", rama: "comercial" },
  { id: "baja-arancel", texto: "Bajar aranceles a la maquinaria importada", rama: "comercial" },
];
export const RAMAS_REPASO = [
  { id: "fiscal", nombre: "Fiscal" }, { id: "monetaria", nombre: "Monetaria" },
  { id: "cambiaria", nombre: "Cambiaria" }, { id: "comercial", nombre: "Comercial" },
];
const POR_RAMA = {
  fiscal: "Impuestos, gasto y subsidios son de la política fiscal.",
  monetaria: "Tasa, operaciones de mercado abierto y encaje son de la monetaria.",
  cambiaria: "El precio del dólar y su régimen son de la cambiaria.",
  comercial: "Los aranceles son instrumento de la política comercial.",
};

function peVentanilla(rng) {
  const ramas = barajar(["fiscal", "monetaria", "cambiaria", "comercial"], rng).slice(0, 3);
  const fichas = ramas.map((rama) => {
    const m = uno(MEDIDAS_RAMA.filter((x) => x.rama === rama), rng);
    return { id: m.id, texto: m.texto, correcta: rama, retro: (b) => (b === rama ? POR_RAMA[rama] : `No es ${b}. ${POR_RAMA[rama]}`) };
  });
  return {
    mecanica: "bandejas",
    figura: "ramas",
    escena: escena("politica-economica", "manana", "der", { id: "autoridad-economica", pose: "carpeta" },
      "Te contratan como secretario técnico del Gobierno.",
      "Llegan tres medidas al despacho. Cada una debe ir a la rama de política que la ejecuta."),
    consigna: "Lleva cada medida a su rama.",
    bandejas: RAMAS_REPASO,
    fichas: barajar(fichas, rng),
  };
}

/* Los seis peldaños (ficha 2, pe-ambitos, d. 17-19), con un caso concreto. */
export const PELDANOS_REPASO = [
  { id: "problema", nombre: "Problema", def: "es el desajuste que hay que resolver." },
  { id: "objetivo", nombre: "Objetivo", def: "es el problema escrito como ya resuelto." },
  { id: "estrategia", nombre: "Estrategia", def: "es la rama de política elegida." },
  { id: "instrumento", nombre: "Instrumento", def: "es la herramienta de esa rama." },
  { id: "medida", nombre: "Medida", def: "es lo que se hace con la herramienta." },
  { id: "meta", nombre: "Meta", def: "es el objetivo con número y plazo." },
];
function casosEscalera(rng) {
  const inflacion = uno([7, 8, 9, 11], rng);
  const paro = uno([11, 12, 13, 14], rng);
  const deficit = uno([5, 6, 7], rng);
  return [
    { id: "inflacion", problema: `inflación del ${inflacion}\u00a0%`, textos: [`La inflación llegó al ${inflacion}\u00a0%`, "Estabilizar los precios", "Política monetaria", "Tasa de interés de referencia", "Subir la tasa", "Inflación al 3\u00a0% en dos años"] },
    { id: "desempleo", problema: `desempleo del ${paro}\u00a0%`, textos: [`El desempleo subió al ${paro}\u00a0%`, "Más empleo", "Política fiscal", "Gasto público", "Subir la inversión en obras", `Desempleo al ${paro - 3}\u00a0% en 2028`] },
    { id: "deficit", problema: `déficit fiscal del ${deficit}\u00a0% del PIB`, textos: [`Déficit fiscal del ${deficit}\u00a0% del PIB`, "Equilibrio fiscal", "Política fiscal", "Tributación", "Quitar exenciones del IVA", "Déficit del 3\u00a0% del PIB en 2028"] },
    { id: "externo", problema: "importaciones mayores que exportaciones", textos: ["Importamos más de lo que exportamos", "Equilibrio externo", "Política comercial", "Aranceles", "Subir aranceles a las importaciones", "Exportaciones +10\u00a0% en un año"] },
  ];
}

function peEscalera(rng) {
  const caso = uno(casosEscalera(rng), rng);
  const fichas = caso.textos.map((texto, orden) => {
    const p = PELDANOS_REPASO[orden];
    return { id: p.id, texto, orden, retro: `${p.nombre} (${orden + 1}.º): ${p.def}` };
  });
  return {
    mecanica: "ordenar",
    estilo: "escalera",
    escena: escena("politica-economica", "tarde", "izq", { id: "profesor", pose: "pizarra" },
      "Te contratan como asesor del ministro.",
      `Problema en el país: ${caso.problema}. El ministro necesita el plan completo, del problema a la meta.`),
    consigna: "Ordena el plan: del problema a la meta.",
    caso: caso.id,
    rotulos: PELDANOS_REPASO.map((p) => p.nombre),
    fichas,
    revuelta: revolver(fichas, rng),
  };
}

/* ═══════════════════════ T3 · POLÍTICA FISCAL ═══════════════════════ */

const MEDIDAS_FISCALES = [
  { id: "baja-renta", texto: "Bajar el impuesto de renta", correcta: "expansiva", por: "Baja t: el multiplicador crece y la DA sube." },
  { id: "sube-salud", texto: "Subir el gasto en salud", correcta: "expansiva", por: "Sube G, dentro del gasto autónomo: la DA sube." },
  { id: "sube-transferencias", texto: "Subir las transferencias a hogares", correcta: "expansiva", por: "Más TR, más renta disponible: la DA sube." },
  { id: "sube-deuda", texto: "Endeudarse más para financiar obras", correcta: "expansiva", por: "Más endeudamiento para gastar es política fiscal expansiva." },
  { id: "sube-iva", texto: "Subir el IVA", correcta: "contraccionista", por: "Más impuestos: menos capacidad de compra y menos DA." },
  { id: "recorta-vias", texto: "Recortar el gasto en vías", correcta: "contraccionista", por: "Baja G, dentro del gasto autónomo: la DA baja." },
  { id: "baja-subsidios", texto: "Bajar los subsidios a familias", correcta: "contraccionista", por: "Menos TR, menos renta disponible: la DA baja." },
  { id: "reduce-deuda", texto: "Reducir el endeudamiento público", correcta: "contraccionista", por: "Contraer el endeudamiento es política fiscal contraccionista." },
];
const BANDEJAS_EXPANSIVA = [
  { id: "expansiva", nombre: "Expansiva", detalle: "DA ↑" },
  { id: "contraccionista", nombre: "Contraccionista", detalle: "DA ↓" },
];
/* Tres de un banco de dos bandos, con al menos una de cada uno. */
function tresMezcladas(banco, rng) {
  const exp = barajar(banco.filter((x) => x.correcta === "expansiva"), rng);
  const con = barajar(banco.filter((x) => x.correcta === "contraccionista"), rng);
  const dos = rng() < 0.5;
  return barajar([...exp.slice(0, dos ? 2 : 1), ...con.slice(0, dos ? 1 : 2)], rng);
}
const conRetro = (m) => ({ id: m.id, texto: m.texto, correcta: m.correcta, retro: (b) => (b === m.correcta ? m.por : `No es ${b}. ${m.por}`) });

function pfExpansiva(rng) {
  return {
    mecanica: "bandejas",
    figura: "medidor",
    escena: escena("politica-fiscal", "dia", "der", { id: "autoridad-economica", pose: "grifo" },
      "Te contratan como analista del Ministerio de Hacienda.",
      "El ministro anuncia tres medidas fiscales para el próximo año. Algunas empujan la demanda agregada; otras la frenan."),
    consigna: "¿Cada medida es expansiva o contraccionista?",
    bandejas: BANDEJAS_EXPANSIVA,
    fichas: tresMezcladas(MEDIDAS_FISCALES, rng).map(conRetro),
  };
}

const PRODUCTOS = ["una nevera", "una bicicleta", "un computador portátil", "un televisor", "una lavadora"];
function pfFactura(rng) {
  const producto = uno(PRODUCTOS, rng);
  const base = uno([48, 64, 85, 120, 150, 230], rng) * 10000;
  const iva = Math.round(base * 0.19);
  const total = base + iva;
  const opciones = [
    { id: "total", valor: total, retro: `Base ${pesos(base)} + IVA ${pesos(iva)} = ${pesos(total)}.` },
    { id: "solo-iva", valor: iva, retro: "Ese es solo el IVA; falta sumarle la base." },
    { id: "impoconsumo", valor: Math.round(base * 1.08), retro: "Eso es con impoconsumo del 8\u00a0%; aquí cobran IVA del 19\u00a0%." },
    { id: "decimal", valor: Math.round(base * 1.019), retro: "El 19\u00a0% es 0,19 de la base, no 0,019." },
  ];
  return {
    mecanica: "factura",
    escena: escena("politica-fiscal", "tarde", "izq", { id: "familia", pose: "recibo" },
      "Te contratan como asesor tributario de la familia.",
      `La familia compra ${producto} que vale ${pesos(base)} sin impuestos. En la caja le cobran IVA del 19\u00a0%.`),
    consigna: "¿Cuánto paga en total?",
    producto, base, iva, total,
    opciones: barajar(opciones, rng).map((o) => ({ ...o, texto: pesos(o.valor) })),
    correcta: "total",
  };
}

/* Las cadenas (dominó): cada ficha con su razón (≤ 15 palabras con el «Va 2.º»). */
const ficha = (texto, por) => ({ texto, por });
const CADENAS_FISCALES = [
  { id: "sube-g", fichas: [ficha("El Gobierno sube el gasto en vías", "la causa: la medida fiscal."), ficha("Sube el gasto autónomo (Ā)", "G está dentro de Ā."), ficha("Sube la demanda agregada", "Ā mueve la DA."), ficha("Sube la producción (Y)", "la DA determina Y.")] },
  { id: "sube-t", fichas: [ficha("El Congreso sube el impuesto de renta", "la causa: la medida fiscal."), ficha("Baja la renta disponible", "T = tY sale de la renta."), ficha("Las familias consumen menos", "el consumo depende de la renta disponible."), ficha("Baja la demanda agregada", "C es parte de la DA.")] },
  { id: "sube-tr", fichas: [ficha("El Gobierno sube los subsidios", "la causa: la medida fiscal."), ficha("Sube la renta disponible", "TR entra en Y + TR − T."), ficha("Las familias consumen más", "el consumo depende de la renta disponible."), ficha("Sube la demanda agregada", "C es parte de la DA.")] },
];
const CADENAS_TASA = [
  { id: "sube", verbo: "sube", fichas: [ficha("La Junta sube la tasa de interés", "la causa: la decisión de la Junta."), ficha("El crédito se encarece", "la tasa es el precio del crédito."), ficha("Bajan la inversión y el consumo", "con crédito caro se gasta menos."), ficha("Baja la demanda agregada", "I y C son parte de la DA."), ficha("Se frena la inflación", "menos DA presiona menos los precios.")] },
  { id: "baja", verbo: "baja", fichas: [ficha("La Junta baja la tasa de interés", "la causa: la decisión de la Junta."), ficha("El crédito se abarata", "la tasa es el precio del crédito."), ficha("Suben la inversión y el consumo", "con crédito barato se gasta más."), ficha("Sube la demanda agregada", "I y C son parte de la DA."), ficha("Sube la producción (Y)", "la DA determina Y.")] },
];
const CADENAS_DIVISAS = [
  { id: "entra-capital", fichas: [ficha("Llega inversión extranjera al país", "la causa: entran capitales."), ficha("Aumenta la oferta de dólares", "los que traen dólares los venden aquí."), ficha("Baja el tipo de cambio", "más oferta de divisas abarata el dólar."), ficha("El peso se revalúa", "menos pesos por dólar: el peso vale más.")] },
  { id: "sale-capital", fichas: [ficha("Los inversionistas sacan su capital", "la causa: salen capitales."), ficha("Aumenta la demanda de dólares", "para irse compran dólares aquí."), ficha("Sube el tipo de cambio", "más demanda de divisas encarece el dólar."), ficha("El peso se devalúa", "más pesos por dólar: el peso vale menos.")] },
  { id: "exporta-cafe", fichas: [ficha("Se venden más cafés al exterior", "la causa: más exportaciones."), ficha("Entran más dólares por exportaciones", "el exportador cobra en dólares y los vende."), ficha("Baja el tipo de cambio", "más oferta de divisas abarata el dólar."), ficha("El peso se revalúa", "menos pesos por dólar: el peso vale más.")] },
];
function armarCadena(cadena, rng) {
  const fichas = cadena.fichas.map((f, orden) => ({ id: `${cadena.id}-${orden}`, texto: f.texto, orden, retro: `Va ${orden + 1}.º: ${f.por}` }));
  return { fichas, revuelta: revolver(fichas, rng) };
}

function pfCadena(rng) {
  const cadena = uno(CADENAS_FISCALES, rng);
  return {
    mecanica: "ordenar",
    estilo: "domino",
    escena: escena("politica-fiscal", "noche", "izq", { id: "empresario", pose: "explica" },
      "Te contratan para explicar la medida en el noticiero.",
      `Titular de hoy: ${cadena.fichas[0].texto.toLowerCase()}. El presentador pide la cadena completa, hasta la economía.`),
    consigna: "Ordena la cadena, de la causa al efecto.",
    cadena: cadena.id,
    ...armarCadena(cadena, rng),
  };
}

/* ═══════════════════════ T4 · POLÍTICA MONETARIA ═══════════════════════ */

function pmEncaje(rng) {
  const encaje = uno([10, 20, 25, 40, 50], rng);
  const D = uno([800000, 1000000, 2000000, 5000000], rng);
  const E = (D * encaje) / 100;
  const Cr = D - E;
  return {
    mecanica: "calcular",
    figura: "cascada",
    escena: escena("politica-monetaria", "manana", "izq", { id: "analista", pose: "lupa" },
      "Te contratan como analista de riesgo de un banco.",
      `Un cliente deposita ${pesos(D)}. El Banco de la República exige un encaje del ${encaje}\u00a0%.`),
    consigna: "¿Cuánto puede prestar el banco de ese depósito?",
    min: 0, max: D, paso: D / 20, inicio: 0,
    formato: pesos,
    correcta: Cr,
    datos: { encaje, D, E, Cr },
    evaluar(v) {
      if (v === Cr) return { ok: true, retro: `D − E = Cr: ${pesos(D)} − ${pesos(E)} = ${pesos(Cr)}.` };
      if (v === E) return { ok: false, retro: "Eso es el encaje: se queda guardado. Se presta el resto." };
      if (v === D) return { ok: false, retro: "No todo: el encaje no se puede prestar." };
      return { ok: false, retro: `Del depósito se resta el encaje: ${encaje}\u00a0% de ${pesos(D)} es ${pesos(E)}.` };
    },
  };
}

function pmCadena(rng) {
  const cadena = uno(CADENAS_TASA, rng);
  return {
    mecanica: "ordenar",
    estilo: "domino",
    escena: escena("politica-monetaria", "noche", "der", { id: "autoridad-economica", pose: "timon" },
      "Te contratan para explicar la decisión de la Junta.",
      `Hoy la Junta del Banco de la República ${cadena.verbo} la tasa. Los periodistas quieren la cadena completa.`),
    consigna: "Ordena la cadena, de la causa al efecto.",
    cadena: cadena.id,
    ...armarCadena(cadena, rng),
  };
}

const MEDIDAS_MONETARIAS = [
  { id: "baja-tasa", texto: "Bajar la tasa de referencia", correcta: "expansiva", por: "Tasa más baja: crédito barato y más dinero circulando." },
  { id: "compra-tes", texto: "Comprar TES en el mercado abierto", correcta: "expansiva", por: "Al comprar TES, el Banco paga con dinero nuevo." },
  { id: "baja-encaje", texto: "Bajar el encaje", correcta: "expansiva", por: "Menos encaje: los bancos prestan más y se crea más dinero." },
  { id: "sube-tasa", texto: "Subir la tasa de referencia", correcta: "contraccionista", por: "Tasa más alta: crédito caro y menos dinero circulando." },
  { id: "vende-tes", texto: "Vender TES en el mercado abierto", correcta: "contraccionista", por: "Al vender TES, el Banco recoge dinero de la economía." },
  { id: "sube-encaje", texto: "Subir el encaje", correcta: "contraccionista", por: "Más encaje: los bancos prestan menos y se crea menos dinero." },
];
function pmMedidas(rng) {
  return {
    mecanica: "bandejas",
    figura: "boveda",
    escena: escena("politica-monetaria", "dia", "der", { id: "inversionista", pose: "monedas" },
      "Te contratan como analista que sigue a la Junta.",
      "Este mes la Junta del Banco de la República aplicó tres medidas. Unas meten dinero a la economía; otras lo sacan."),
    consigna: "¿Cada medida es expansiva o contraccionista?",
    bandejas: [
      { id: "expansiva", nombre: "Expansiva", detalle: "más dinero" },
      { id: "contraccionista", nombre: "Contraccionista", detalle: "menos dinero" },
    ],
    fichas: tresMezcladas(MEDIDAS_MONETARIAS, rng).map(conRetro),
  };
}

/* ═══════════════════════ T5 · POLÍTICA CAMBIARIA ═══════════════════════ */

function pcPareja(rng) {
  const tc0 = uno([3800, 3900, 4000, 4100, 4200, 4300], rng);
  const delta = uno([-400, -300, -200, 200, 300, 500], rng);
  const tc1 = tc0 + delta;
  const sube = delta > 0;
  const d = Math.abs(delta);
  const opciones = [
    { id: "exportadora-flores", nombre: "Exportadora de flores", pose: "recibe-billete",
      retro: sube ? `El peso se devaluó: cada dólar de flores le da ${pesos(d)} más.` : `Con el dólar a ${pesos(tc1)}, cada dólar vendido le da menos pesos.` },
    { id: "importadora-celulares", nombre: "Importadora de celulares", pose: "paga-billete",
      retro: sube ? `Cada celular le cuesta más pesos: el dólar subió a ${pesos(tc1)}.` : `El peso se revaluó: paga cada dólar con ${pesos(d)} menos.` },
  ];
  return {
    mecanica: "pareja",
    escena: escena("politica-cambiaria", "manana", "izq", { id: "viajero", pose: "cambio" },
      "Te contratan como analista de una casa de cambio.",
      `El tablero del puerto cambió: el dólar pasó de ${pesos(tc0)} a ${pesos(tc1)}. Dos clientes esperan tu concepto.`),
    consigna: "¿A quién le conviene este cambio?",
    tc0, tc1,
    opciones: barajar(opciones, rng),
    correcta: sube ? "exportadora-flores" : "importadora-celulares",
  };
}

/* Δtcr ≈ (ΔPx − ΔPn) + Δtcn (ficha 5, d. 14). Dial de −6 a +6. */
export const zonaReal = (r) => (r > 0 ? "devaluación real" : r < 0 ? "revaluación real" : "equilibrio");
function pcReal(rng) {
  let px, pn, tcn, r;
  for (let k = 0; k < 200; k += 1) {
    px = uno([1, 2, 3, 4], rng);
    pn = uno([2, 3, 4, 5, 6, 7, 8, 9], rng);
    tcn = uno([-4, -3, -2, 2, 3, 4, 5, 6, 7, 8], rng);
    r = px - pn + tcn;
    const espejo = pn - px + tcn;
    if (px !== pn && Math.abs(r) <= 6 && r !== tcn && Math.abs(espejo) <= 6 && espejo !== r) break;
  }
  const espejo = pn - px + tcn;
  return {
    mecanica: "calcular",
    figura: "dial",
    escena: escena("politica-cambiaria", "tarde", "der", { id: "exportadora-flores", pose: "flores" },
      "Te contratan como asesor de la exportadora de flores.",
      `Este año el dólar ${tcn > 0 ? "subió" : "bajó"} ${Math.abs(tcn)}\u00a0% frente al peso. La inflación fue ${pn}\u00a0% aquí y ${px}\u00a0% en Estados Unidos.`),
    consigna: "Marca en la aguja cuánto cambió el tipo de cambio real.",
    min: -6, max: 6, paso: 0.5, inicio: null,
    formato: (v) => `${conSigno(v)}\u00a0%`,
    correcta: r,
    datos: { px, pn, tcn },
    evaluar(v) {
      if (v === r) return { ok: true, retro: `(${px} − ${pn}) + ${conSigno(tcn)} = ${conSigno(r)}\u00a0%: ${zonaReal(r)}.` };
      if (v === tcn) return { ok: false, retro: "Solo miraste el nominal; súmale la diferencia de inflaciones." };
      if (v === espejo) return { ok: false, retro: "Al revés: es la inflación de afuera menos la de aquí." };
      return { ok: false, retro: `Atajo: (inflación afuera − aquí) + Δ nominal = ${conSigno(r)}\u00a0%.` };
    },
  };
}

function pcCadena(rng) {
  const cadena = uno(CADENAS_DIVISAS, rng);
  return {
    mecanica: "ordenar",
    estilo: "domino",
    escena: escena("politica-cambiaria", "noche", "izq", { id: "inversionista", pose: "ladrillo" },
      "Te contratan como analista del mercado de dólares.",
      `Noticia del puerto: ${cadena.fichas[0].texto.toLowerCase()}. Tu jefe quiere saber qué pasa con el dólar, paso a paso.`),
    consigna: "Ordena la cadena, de la causa al efecto.",
    cadena: cadena.id,
    ...armarCadena(cadena, rng),
  };
}

/* ═══════════════════════ EL CATÁLOGO DE PLANTILLAS ═══════════════════════ */

const p = (id, tema, actividad, nivel, subtemas, generar) => ({ id, tema, actividad, nivel, subtemas, generar });

export const PLANTILLAS = [
  p("rd-da-carrito", "demanda-agregada", "da26-h1-llena-carrito", 1, ["da-componentes", "da-exportaciones-netas"], daCarrito),
  p("rd-da-curva", "demanda-agregada", "da26-h3-gira-o-sube", 1, ["da-grafica"], daCurva),
  p("rd-da-multiplicador", "demanda-agregada", "da26-h6-meta", 3, ["da-multiplicador"], daMultiplicador),
  p("rd-pe-ventanilla", "politica-economica", "pe26-h3-cables", 2, ["pe-ramas"], peVentanilla),
  p("rd-pe-escalera", "politica-economica", "pe26-h1-seis-cajones", 3, ["pe-ambitos"], peEscalera),
  p("rd-pf-expansiva", "politica-fiscal", "pf26-h4-expande", 1, ["pf-medidas", "pf-en-da"], pfExpansiva),
  p("rd-pf-factura", "politica-fiscal", "pf26-h3-factura", 2, ["pf-impuestos", "pf-tributacion-casos"], pfFactura),
  p("rd-pf-cadena", "politica-fiscal", "pf26-h4-expande", 2, ["pf-en-da", "pf-impactos"], pfCadena),
  p("rd-pm-medidas", "politica-monetaria", "pm26-h5-junta", 2, ["pm-medidas", "pm-instrumentos"], pmMedidas),
  p("rd-pm-encaje", "politica-monetaria", "pm26-h2-cascada-meta", 2, ["pm-creacion-secundaria"], pmEncaje),
  p("rd-pm-cadena", "politica-monetaria", "pm26-h6-domino", 2, ["pm-impactos"], pmCadena),
  p("rd-pc-pareja", "politica-cambiaria", "pc26-h4-a-quien-sirve", 1, ["pc-impactos", "pc-aprecia-deprecia"], pcPareja),
  p("rd-pc-cadena", "politica-cambiaria", "pc26-h2-empuja-curva", 2, ["pc-mercado", "pc-flujos-capital"], pcCadena),
  p("rd-pc-real", "politica-cambiaria", "pc26-h3-aguja", 3, ["pc-itcr", "pc-nominal-real"], pcReal),
];

export const plantilla = (id) => PLANTILLAS.find((x) => x.id === id) ?? null;

/** Una consulta lista para jugar: la plantilla con sus datos de este intento. */
export function generarConsulta(pl, rng = Math.random) {
  return { id: pl.id, clave: pl.id, tema: pl.tema, actividad: pl.actividad, nivel: pl.nivel, subtemas: pl.subtemas, ...pl.generar(rng) };
}
