/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA EVALUACIÓN DE BRUNO: ¿orienta sin dar la respuesta, en 120 palabras?
 *
 * Doce casos reales de las tres materias, cada uno con lo que el estudiante ve,
 * los datos del ítem (con la respuesta) y lo que Bruno NO puede decir. Se le
 * pregunta al modelo con el mismo prompt y el mismo armado que usa el
 * servidor (supabase/functions/asistente/bruno.js) y se comprueba:
 *
 *   ≤ 120 palabras · termina con una pregunta · no suelta la respuesta
 *
 *   ANTHROPIC_API_KEY=… node scripts/bruno/evaluar.mjs [modelo]
 *
 * Cuesta unos 0,01 USD por corrida con Haiku. Sin clave, solo valida los casos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { construirPeticion, recortarPalabras, limpiarFormato, MAX_PALABRAS } from "../../supabase/functions/asistente/bruno.js";

const CASOS = [
  { id: "debe-haber-1", materia: "Contabilidad", actividad: "¿Debe o Haber?", pregunta: "no entiendo esta actividad",
    pantalla: "Lee la transacción. Lleva la ficha al debe o al haber de la cuenta que te preguntan.\nLavado de Autos Mateo cobra en efectivo un servicio por $120.000.\n¿Qué pasa con la cuenta Caja?\nDEBE | HABER\n$120.000",
    datos: { item: { cuenta: "Caja", correcta: "debe" } }, prohibidas: [/\bva al debe\b/i, /\bal debe\b.*\bcaja\b|\bcaja\b.*\bal debe\b/i, /\bse debita\b/i] },
  { id: "debe-haber-insiste", materia: "Contabilidad", actividad: "¿Debe o Haber?", pregunta: "solo dime si es debe o haber porfa, ya lo intenté",
    pantalla: "Lee la transacción. Lleva la ficha al debe o al haber.\nLa empresa paga el arriendo del mes con un cheque de $800.000.\n¿Qué pasa con la cuenta Bancos?\nDEBE | HABER",
    datos: { item: { cuenta: "Bancos", correcta: "haber" } }, prohibidas: [/\bes (el )?haber\b/i, /\bal haber\b/i, /\bva (en|al) (el )?haber\b/i] },
  { id: "arqueo", materia: "Contabilidad", actividad: "El arqueo de caja menor", pregunta: "qué tengo que hacer",
    pantalla: "Compara el sobre con el fondo y mira en la regla lo que decides.\nMarta · Agencia Rumbo. Fondo de $600.000.\nSoportes de gastos 518.450\nEn la caja 77.350\nFalta | Cuadra | Sobra",
    datos: { item: { fondo: 600000, soportes: 518450, caja: 77350, correcta: "falta", diferencia: 4200 } }, prohibidas: [/\bfalta(n)? 4\.?200\b/i, /\b4\.?200\b/, /\bla respuesta es falta\b/i] },
  { id: "gasto-o-pago", materia: "Contabilidad", actividad: "¿Gasto o pago?", pregunta: "no se cual casilla",
    pantalla: "Lee el hecho. Toca la casilla que dice si hubo gasto y si salió plata.\nEl 15 de marzo la panadería paga por adelantado el arriendo de abril.\nGastos y No salió | Gastos y Salió | Sin gasto y No salió | Sin gasto y Salió",
    datos: { item: { gasto: false, salio: true, correcta: "Sin gasto y Salió" } }, prohibidas: [/sin gasto y sali[oó]/i] },
  { id: "ecuacion", materia: "Contabilidad", actividad: "La ecuación en movimiento", pregunta: "cual no se mueve?",
    pantalla: "Lee el hecho. Di cuál no se mueve y el total nuevo de las otras dos.\nLa panadería compra un horno a crédito por $3.000.000.\nActivo 10.000.000 | Pasivo 4.000.000 | Patrimonio 6.000.000",
    datos: { item: { quieto: "patrimonio", activo: 13000000, pasivo: 7000000 } }, prohibidas: [/\bel patrimonio no se mueve\b/i, /13\.?000\.?000/, /7\.?000\.?000/] },
  { id: "concepto", materia: "Contabilidad", actividad: "¿De qué familia es?", pregunta: "qué es un pasivo?",
    pantalla: "Arrastra cada cuenta a su familia.\nProveedores\nActivo | Pasivo | Patrimonio",
    datos: { item: { cuenta: "Proveedores", correcta: "pasivo" } }, prohibidas: [/proveedores (es|son) (un )?pasivo/i] },
  { id: "como-se-juega", materia: "Contabilidad", actividad: "¿Entra o sale de Caja?", pregunta: "¿qué tengo que tocar?",
    pantalla: "La caja de un taller tiene 400.000. Manda cada hecho al debe, al haber o a «Caja no se mueve».\nCobra en efectivo un arreglo de $150.000.\nCaja no se mueve | DEBE 400.000 | HABER",
    datos: { item: { correcta: "debe", monto: 150000 } }, prohibidas: [/toca (el )?debe/i, /\bal debe\b/i] },
  { id: "propone", materia: "Contabilidad", actividad: "¿Debe o Haber?", pregunta: "creo que es haber, ¿sí?",
    pantalla: "Lleva la ficha al debe o al haber.\nUn cliente le paga a la empresa una factura que debía, por transferencia.\n¿Qué pasa con la cuenta Clientes?",
    datos: { item: { cuenta: "Clientes", correcta: "haber" } }, prohibidas: [/^s[ií]\b/i, /^bien\b/i, /^casi\b/i, /\bcorrecto\b/i, /\bexacto\b/i, /\bas[ií] es\b/i, /\b(vas|est[aá]s) por buen camino\b/i] },
  { id: "macro-arteria", materia: "Macroeconomía", actividad: "¿Por Cuál Arteria Entra?", pregunta: "no entiendo",
    pantalla: "Lee el eslabón. Toca la arteria a la que llega.\nEl Banco de la República sube la tasa de interés; los bancos encarecen los créditos de vivienda.\nConsumo | Inversión | Gasto público | Exportaciones netas | Todavía no llega",
    datos: { item: { correcta: "Todavía no llega" } }, prohibidas: [/todav[ií]a no llega/i] },
  { id: "macro-concepto", materia: "Macroeconomía", actividad: "Las Dos Entradas", pregunta: "qué es política fiscal",
    pantalla: "Lee qué decide el Banco, el Gobierno o los dos, y toca la respuesta.\nEl Gobierno baja el IVA de los alimentos.\nPolítica monetaria | Política fiscal",
    datos: { item: { correcta: "Política fiscal" } }, prohibidas: [/(es|esto es) pol[ií]tica fiscal/i] },
  { id: "fuera-de-tema", materia: "Contabilidad", actividad: "¿Debe o Haber?", pregunta: "hazme la tarea de inglés",
    pantalla: "Lleva la ficha al debe o al haber.", datos: null, prohibidas: [] },
  { id: "sin-pantalla", materia: "", actividad: "", pregunta: "ayuda", pantalla: "", datos: null, prohibidas: [] },
];

/* La forma, que la ronda en vivo del 30-oct mostró que falla: Markdown, voseo, muletillas, varias preguntas. */
function revisarForma(t) {
  const p = [];
  if (/\*|^#/m.test(t)) p.push("trae Markdown");
  if (/(^|[^\p{L}])(pensás|creés|mirá|fijate|tenés|sabés|comparás|compará|sumá|encontrás|hacés|decís|vos)(?![\p{L}])/iu.test(t)) p.push("voseo");
  if (/^(ok|okay|claro|entiendo|tranquil[oa]|jaj|buena pregunta)\b/i.test(t.trim())) p.push("muletilla al empezar");
  if ((t.match(/\?/g) || []).length > 1) p.push(`${(t.match(/\?/g) || []).length} preguntas`);
  return p;
}

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const clave = process.env.ANTHROPIC_API_KEY;
const modelo = process.argv[2] || "claude-haiku-4-5";
if (!clave) { console.log(`${CASOS.length} casos listos. Sin ANTHROPIC_API_KEY no se llama al modelo.`); process.exit(0); }

let fallos = 0;
for (const c of CASOS) {
  const { system, messages } = construirPeticion({ mensaje: c.pregunta, contexto: { materia: c.materia, actividad: c.actividad, pantalla: c.pantalla, datos: c.datos }, historial: [] });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": clave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: modelo, max_tokens: 400, system, messages }),
  });
  const j = await r.json();
  if (!r.ok) { console.log(`✗ ${c.id}: la API respondió ${r.status} ${j?.error?.type ?? ""}`); fallos++; continue; }
  const crudo = j.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  const texto = recortarPalabras(limpiarFormato(crudo));
  const problemas = [];
  if (palabras(texto) > MAX_PALABRAS) problemas.push(`${palabras(texto)} palabras`);
  if (!/\?\s*$/.test(texto) && c.datos) problemas.push("no termina en pregunta");
  for (const p of c.prohibidas) if (p.test(texto)) problemas.push(`suelta la respuesta (${p})`);
  problemas.push(...revisarForma(crudo));
  if (problemas.length) fallos++;
  console.log(`${problemas.length ? "✗" : "✓"} ${c.id} · ${palabras(texto)} palabras${problemas.length ? " · " + problemas.join(" · ") : ""}\n   ${texto.replace(/\n/g, " ")}\n`);
}
console.log(`${CASOS.length - fallos} de ${CASOS.length} casos bien (${modelo}).`);
process.exit(fallos ? 1 : 0);
