import { CONSIGNA_CAPA_3_T5_A2, PREGUNTA_CAPA_3_T5_A2, OPCIONES_CAPA_3_T5_A2, PISTA_CAPA_3_T5_A2, VENTAS_T5_A2, FINAL_CAPA_3_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import CajasQueRevelan, { LECTURA } from "../tema6/CajasQueRevelan.jsx";
import { FiguraT5A2 } from "../tema6/FigurasCapa3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 3 · «AHORA PRUEBE USTED» — las dos ventas (guía de
 * Mai v1 §5, con los textos de Futaba).
 *
 * Las cajas de CajasQueRevelan.jsx (Tema 6). Cerrada, cada venta muestra su
 * nombre en Sora 14/600 con el chevrón y, debajo, lo que costó cada título
 * y a cuánto se vende (C1-2: un escenario simulado). Sin color de acierto ni de error, sin verde ni rojo: ganancia y
 * pérdida las dice la palabra. Con las dos decididas aparece el final.
 * Entre la consigna y las cajas, la cuenta T de las inversiones (§2b de Mai).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Hoja 6: abierta, cada venta pide decidir si dejó ganancia o pérdida (en fila) antes de revelar. */
const CAJAS = VENTAS_T5_A2.map((v) => ({
  id: v.id, titulo: v.nombre, cifras: v.cifras, revela: v.revela, pie: v.pie,
  decide: { pregunta: PREGUNTA_CAPA_3_T5_A2, opciones: OPCIONES_CAPA_3_T5_A2, correcta: v.correcta, falla: v.falla, pista: PISTA_CAPA_3_T5_A2 },
}));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600, lineHeight: 1.35 };

/* `c4` (opcional, Célula C: tema5/capa3C4T5.jsx): el patrón C4 de la capa 3. Sin él, como siempre. */
export default function DosVentas({ c4 = null }) {
  return <CajasQueRevelan consigna={CONSIGNA_CAPA_3_T5_A2} cajas={CAJAS} final={FINAL_CAPA_3_T5_A2} estiloTitulo={NOMBRE} forma="fila" atributos={{ "data-capa3-t5-a2": true }} Figura={FiguraT5A2} c4={c4} />;
}
